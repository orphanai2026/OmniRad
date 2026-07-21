/* ═══════════════════════════════════════════════════════════════════════════
 * OmniRad — Comparative & Atlas Series Viewer  (omnirad-series-viewer.js)
 * ═══════════════════════════════════════════════════════════════════════════
 * Two rendering modes share one modal shell:
 *
 *   mode='review' (Sprint 4e)  — 3-up comparative viewer for reviewers.
 *   mode='atlas'  (Sprint 4f)  — full PACS-like slice viewer for learners:
 *       zoom · pan · position indicator · FPS slider · W/L presets ·
 *       invert · overlay 3-level · landmark panel · related series footer ·
 *       URL params + localStorage state · cinematic wheel · snapshot export.
 *
 * Standards referenced
 *   – DICOM PS3.14 (GSDF)  · PS3.3 §C.7.3 (Series IE)  · PS3.4 §C
 *   – IHE Radiology Basic Image Review (BIR) Profile
 *   – Cornerstone.js UX conventions (Arrow keys · Wheel · Ctrl+Wheel zoom · I invert · L W/L · R reset)
 *   – WCAG 2.2 SC 1.4.1, 1.4.3, 2.1.1 · APG dialog pattern
 *   – OsiriX overlay-toggle 3-level convention
 *
 * Public API (window.OmniRadSeriesViewer):
 *   .open(opts)     — review mode by default (backwards-compatible)
 *   .openAtlas(opts) — atlas mode (PACS-like)
 *   .close()
 * ═══════════════════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  let root = null;
  let state = null;
  let cineTimer = null;

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function pad2(n){ return String(n).padStart(2, '0'); }
  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  // ── Radiological orientation markers (per plane) ──────────────────────
  //   Convention (ACR / radiological): patient's LEFT is displayed on the
  //   viewer's RIGHT. Returns edge letters {l,r,t,b} or null if not applicable.
  function orientationMarkers(plane){
    const p = (plane || '').toLowerCase();
    if (p.includes('axial') || p.includes('transverse')) return { l:'R', r:'L', t:'A', b:'P' };
    if (p.includes('coronal') || p.includes('pa') || p.includes('ap') || p.includes('frontal')) return { l:'R', r:'L', t:'S', b:'I' };
    if (p.includes('sagittal') || p.includes('lateral')) return { l:'A', r:'P', t:'S', b:'I' };
    if (p.includes('oblique')) return { l:'R', r:'L', t:'S', b:'I' };
    return null; // projectional views without a defined convention (e.g. mammo CC/MLO)
  }

  // ── W/L presets (CT-only; approximated as CSS brightness/contrast) ────
  //   Reference: ACR Appropriateness Criteria + typical PACS defaults
  const WL_PRESETS = {
    'none':     { label:'Default',  bri: 1.00, con: 1.00 },
    'brain':    { label:'Brain 80/40',    bri: 1.00, con: 1.25 },
    'lung':     { label:'Lung 1500/-600', bri: 1.15, con: 1.60 },
    'bone':     { label:'Bone 2000/400',  bri: 0.95, con: 1.70 },
    'soft':     { label:'Soft 400/60',    bri: 1.02, con: 1.35 },
    'abdomen':  { label:'Abdomen 350/40', bri: 1.05, con: 1.30 },
    'mediastinum':{ label:'Mediast 350/40',bri:1.02, con: 1.28 }
  };

  // ── Brightness / Contrast (unified per 16 Jul 2026 natural-bc decision) ──
  //   AI-generated PNGs carry no HU/MR signal, so DICOM Window/Level presets
  //   have no scientific basis here. We expose honest Brightness & Contrast
  //   sliders (−100..+100) mapped to CSS filters, matching the single-image
  //   atlas viewer (atlas.html) so behaviour is consistent platform-wide.
  function bcFilter(st){
    const b = Math.max(0, 1 + (st.bright||0)/100);    // 0..2
    const c = Math.max(0, 1 + (st.contrast||0)/100);  // 0..2
    return `brightness(${b.toFixed(2)}) contrast(${c.toFixed(2)})` + (st.invert ? ' invert(1)' : '');
  }

  function ensureRoot(){
    if (root) return root;
    root = document.createElement('div');
    root.className = 'omr-sv-root';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.style.display = 'none';
    document.body.appendChild(root);
    return root;
  }

  // ── Persistence (atlas mode only) ────────────────────────────────────
  function persistState(){
    if (!state || state.mode !== 'atlas' || !state.seriesId) return;
    // URL: replace hash-preserving pushState
    try {
      const url = new URL(location.href);
      url.searchParams.set('series_id', state.seriesId);
      url.searchParams.set('slice', String(state.slices[state.idx].slice_index));
      history.replaceState(null, '', url.toString());
    } catch(_){}
    try {
      localStorage.setItem('omr:sv:' + state.seriesId, JSON.stringify({
        idx: state.idx, zoom: state.zoom, panX: state.panX, panY: state.panY,
        invert: state.invert, bright: state.bright, contrast: state.contrast, overlayLvl: state.overlayLvl, fps: state.fps
      }));
    } catch(_){}
  }
  function loadPersistedState(seriesId){
    if (!seriesId) return null;
    try {
      const raw = localStorage.getItem('omr:sv:' + seriesId);
      return raw ? JSON.parse(raw) : null;
    } catch(_){ return null; }
  }

  // ── Renderers ─────────────────────────────────────────────────────────
  function render(){
    if (!state) return;
    if (state.mode === 'atlas') return renderAtlas();
    return renderReview();
  }

  // ── REVIEW mode (Sprint 4e — 3-up comparative viewer) ────────────────
  function renderReview(){
    const total = state.slices.length;
    const cur   = state.slices[state.idx];
    const prev  = state.idx > 0 ? state.slices[state.idx - 1] : null;
    const next  = state.idx < total - 1 ? state.slices[state.idx + 1] : null;
    const lang  = (window.OmniRadI18n && window.OmniRadI18n.lang) || 'en';
    const isAr  = lang === 'ar';

    const pane = (slice, role) => {
      if (!slice){
        return `<div class="omr-sv-pane empty">
          <div class="omr-sv-placeholder">${isAr ? (role==='prev'?'لا شريحة سابقة':'لا شريحة تالية') : (role==='prev'?'No previous slice':'No next slice')}</div>
        </div>`;
      }
      const isCurrent = role === 'cur';
      const outlier = state.outliers && state.outliers.includes(slice.slice_index);
      return `
        <div class="omr-sv-pane ${isCurrent?'current':''}" data-role="${role}">
          <img src="${esc(slice.url)}" alt="Slice ${esc(slice.slice_index)}" draggable="false">
          <div class="omr-sv-ov tl">
            <div>OmniRad · ${esc(state.seriesName || '')}</div>
            <div><b>Slice ${esc(pad2(slice.slice_index))}/${esc(pad2(total))}</b></div>
          </div>
          <div class="omr-sv-ov tr">
            <div>${esc(state.modality || '')} · ${esc(state.plane || '')}</div>
            ${state.loinc ? `<div class="mono">LOINC ${esc(state.loinc)}</div>` : ''}
          </div>
          <div class="omr-sv-ov br">
            <div>⚠ ${isAr ? 'تعليمي فقط · مولَّد بالذكاء' : 'Educational only · AI-Generated'}</div>
          </div>
          ${outlier ? `<div class="omr-sv-ov bl warn">${isAr?'⚠ شذوذ مكتشف':'⚠ Coherence outlier'}</div>` : ''}
        </div>`;
    };

    root.innerHTML = `
      <div class="omr-sv-back" data-close="1"></div>
      <div class="omr-sv-shell" role="document">
        <header class="omr-sv-head">
          <div class="omr-sv-title">
            <span class="omr-sv-badge">📚 ${isAr?'مراجعة سلسلة':'Series review'}</span>
            <span>${esc(state.seriesName || '')}</span>
            ${state.tier ? `<span class="omr-sv-tier tier-${esc(state.tier)}">${esc(state.tier)}</span>` : ''}
          </div>
          <div class="omr-sv-actions">
            <button class="omr-sv-btn" data-act="cine" title="${isAr?'تشغيل سينمائي':'Cine play'} (Space)">${cineTimer?'⏸':'▶'}</button>
            <button class="omr-sv-btn" data-act="full" title="${isAr?'ملء الشاشة':'Fullscreen'} (F)">⛶</button>
            <button class="omr-sv-btn danger" data-close="1" title="Esc">✕</button>
          </div>
        </header>

        <div class="omr-sv-3up">
          ${pane(prev, 'prev')}
          ${pane(cur, 'cur')}
          ${pane(next, 'next')}
        </div>

        <footer class="omr-sv-foot">
          <div class="omr-sv-nav">
            <button class="omr-sv-btn" data-act="prev" ${state.idx===0?'disabled':''} title="←">‹</button>
            <span class="omr-sv-pos mono">${esc(pad2(cur ? cur.slice_index : state.idx+1))} / ${esc(pad2(total))}</span>
            <button class="omr-sv-btn" data-act="next" ${state.idx===total-1?'disabled':''} title="→">›</button>
          </div>
          <div class="omr-sv-actions-main">
            <button class="omr-sv-btn ok"   data-act="approve" title="A">✓✓ ${isAr?'اعتماد':'Approve'}</button>
            <button class="omr-sv-btn edit" data-act="edit"    title="E">✎ ${isAr?'تعديل':'Edit'}</button>
            <button class="omr-sv-btn bad"  data-act="reject"  title="R">× ${isAr?'رفض':'Reject'}</button>
          </div>
          <div class="omr-sv-hint mono">
            ← → · A ${isAr?'اعتماد':'approve'} · R ${isAr?'رفض':'reject'} · E ${isAr?'تعديل':'edit'} · Space ${isAr?'سينما':'cine'} · Esc
          </div>
        </footer>
      </div>
    `;

    // Wire review-mode buttons
    root.querySelectorAll('[data-close="1"]').forEach(el => el.addEventListener('click', close));
    root.querySelector('[data-act="prev"]').addEventListener('click', () => go(-1));
    root.querySelector('[data-act="next"]').addEventListener('click', () => go(+1));
    root.querySelector('[data-act="approve"]').addEventListener('click', () => trigger('onApprove'));
    root.querySelector('[data-act="reject"]').addEventListener('click', () => trigger('onReject'));
    root.querySelector('[data-act="edit"]').addEventListener('click', () => trigger('onEdit'));
    root.querySelector('[data-act="cine"]').addEventListener('click', toggleCine);
    root.querySelector('[data-act="full"]').addEventListener('click', toggleFullscreen);
    const centerPane = root.querySelector('.omr-sv-pane.current');
    if (centerPane) centerPane.addEventListener('dblclick', toggleFullscreen);
  }

  // ── ATLAS mode (Sprint 4f — PACS-like single-image viewer) ────────────
  function renderAtlas(){
    const total = state.slices.length;
    const cur   = state.slices[state.idx];
    const lang  = (window.OmniRadI18n && window.OmniRadI18n.lang) || 'en';
    const isAr  = lang === 'ar';

    // Position indicator: percentage superior → inferior
    const posPct = total > 1 ? (state.idx / (total - 1) * 100) : 0;
    const positionLabel = isAr
      ? (posPct < 25 ? 'علوي' : posPct < 50 ? 'علوي متوسط' : posPct < 75 ? 'سفلي متوسط' : 'سفلي')
      : (posPct < 25 ? 'Superior' : posPct < 50 ? 'Mid-superior' : posPct < 75 ? 'Mid-inferior' : 'Inferior');

    // Filmstrip thumbs
    const strip = state.slices.map((s, i) => `
      <div class="omr-sv-thumb ${i===state.idx?'on':''}" data-idx="${i}" title="Slice ${s.slice_index} · ${esc((s.structures||[]).slice(0,4).join(' · '))}">
        <img src="${esc(s.url)}" alt="" loading="lazy">
        <span class="omr-sv-thumb-num">${esc(pad2(s.slice_index))}</span>
      </div>`).join('');

    // Landmarks panel — structures of current slice, with omnirad-term tooltips
    const structs = (cur && cur.structures) || [];
    const structsHtml = structs.length
      ? structs.map(s => `<span class="omr-sv-struct" data-omnirad-term="${esc(s)}">${esc(s)}</span>`).join('')
      : `<span class="omr-sv-empty">${isAr?'لا بنى مسجّلة لهذه الشريحة':'No structures tagged for this slice'}</span>`;

    // Related series footer
    const relHtml = state.related && state.related.length
      ? state.related.map(r => `
          <button class="omr-sv-rel" data-rel-sid="${esc(r.series_id)}" title="${esc(r.match_reason || '')}">
            ${r.first_thumb ? `<img src="${esc(r.first_thumb)}" loading="lazy" alt="">` : `<div class="omr-sv-rel-ph"></div>`}
            <span class="omr-sv-rel-lbl">${esc(r.series_name || (r.organ + ' · ' + r.modality))}</span>
            <span class="omr-sv-rel-meta mono">${esc(r.modality || '')} · ${esc(r.slice_count || 0)} ${isAr?'شريحة':'slices'}</span>
          </button>`).join('')
      : '';

    // Brightness/Contrast filter as CSS (honest — no fake HU windows)
    const filterCss = bcFilter(state);
    const transformCss = `translate(${state.panX||0}px, ${state.panY||0}px) scale(${state.zoom||1})`;

    // Overlay visibility levels: 0=full · 1=minimal · 2=hidden
    const olv = state.overlayLvl || 0;
    const showOv = olv < 2;
    const showAllOv = olv === 0;

    // Brightness/Contrast popover shown when open
    const bcMenu = state.bcMenu
      ? `<div class="omr-sv-bc-menu">
          <label class="omr-sv-bc-row"><span>${isAr?'السطوع':'Brightness'}</span>
            <input type="range" min="-100" max="100" step="1" value="${state.bright||0}" data-bc="bright">
            <b class="mono" data-bc-val="bright">${state.bright||0}</b></label>
          <label class="omr-sv-bc-row"><span>${isAr?'التباين':'Contrast'}</span>
            <input type="range" min="-100" max="100" step="1" value="${state.contrast||0}" data-bc="contrast">
            <b class="mono" data-bc-val="contrast">${state.contrast||0}</b></label>
          <div class="omr-sv-bc-foot"><button data-bc-reset="1">${isAr?'إعادة الضبط':'Reset'}</button></div>
        </div>`
      : '';

    root.innerHTML = `
      <div class="omr-sv-back" data-close="1"></div>
      <div class="omr-sv-shell atlas ${olv===2?'noov':''}" role="document">
        <header class="omr-sv-head">
          <div class="omr-sv-title">
            <span class="omr-sv-badge">🔬 ${isAr?'مشاهد السلسلة':'Series viewer'}</span>
            <span>${esc(state.seriesName || '')}</span>
            ${state.tier ? `<span class="omr-sv-tier tier-${esc(state.tier)}">${esc(state.tier)}</span>` : ''}
          </div>
          <div class="omr-sv-actions">
            <button class="omr-sv-btn ${state.bcMenu?'on':''}" data-act="bc" title="${isAr?'السطوع / التباين':'Brightness / Contrast'} (L)">◐ B/C</button>
            <button class="omr-sv-btn ${state.invert?'on':''}" data-act="invert" title="${isAr?'قلب':'Invert'} (I)">⇅</button>
            <button class="omr-sv-btn" data-act="zoomout" title="- (${isAr?'تصغير':'Zoom out'})">−</button>
            <button class="omr-sv-btn" data-act="zoomin"  title="+ (${isAr?'تكبير':'Zoom in'})">+</button>
            <button class="omr-sv-btn" data-act="reset"   title="R (${isAr?'إعادة':'Reset'})">↺</button>
            <button class="omr-sv-btn" data-act="overlay" title="H (${isAr?'إخفاء الطبقات':'Toggle overlay'})">${olv===0?'👁':olv===1?'⊙':'○'}</button>
            ${orientationMarkers(state.plane) ? `<button class="omr-sv-btn ${state.orient!==false?'on':''}" data-act="orient" title="${isAr?'ماركر الاتجاه R/L':'Orientation R/L'} (O)">R/L</button>` : ''}
            <button class="omr-sv-btn" data-act="snap"    title="${isAr?'حفظ لقطة':'Snapshot'}">⎙</button>
            <button class="omr-sv-btn" data-act="cine"    title="Space">${cineTimer?'⏸':'▶'}</button>
            <button class="omr-sv-btn" data-act="full"    title="F (${isAr?'ملء الشاشة':'Fullscreen'})">⛶</button>
            <button class="omr-sv-btn danger" data-close="1" title="Esc">✕</button>
          </div>
        </header>

        <div class="omr-sv-body">
          <aside class="omr-sv-side">
            <div class="omr-sv-side-hdr">${isAr?'بنى الشريحة':'Structures'}</div>
            <div class="omr-sv-side-body">${structsHtml}</div>
            ${cur && cur.teaching_pearl ? `<div class="omr-sv-side-pearl">💡 <b>${isAr?'لؤلؤة':'Pearl'}:</b> ${esc(cur.teaching_pearl)}</div>` : ''}
            ${cur && cur.common_pitfall ? `<div class="omr-sv-side-pitfall">⚠ <b>${isAr?'محذور':'Pitfall'}:</b> ${esc(cur.common_pitfall)}</div>` : ''}
          </aside>

          <main class="omr-sv-stage" data-stage="1">
            ${bcMenu}
            <div class="omr-sv-img-wrap"
                 style="filter:${filterCss};transform:${transformCss}">
              <img src="${esc(cur.url)}" alt="Slice ${esc(cur.slice_index)}" draggable="false">
            </div>
            ${(state.orient !== false && orientationMarkers(state.plane)) ? (()=>{ const m = orientationMarkers(state.plane); return `
              <div class="omr-sv-orient" aria-hidden="true">
                <span class="omr-sv-orient-l">${m.l}</span>
                <span class="omr-sv-orient-r">${m.r}</span>
                <span class="omr-sv-orient-t">${m.t}</span>
                <span class="omr-sv-orient-b">${m.b}</span>
              </div>`; })() : ''}
            ${showOv ? `
              <div class="omr-sv-ov tl">
                <div>OmniRad · ${esc(state.seriesName || '')}</div>
                ${showAllOv ? `<div>Case #${esc((state.seriesId||'').slice(0,6))}</div>` : ''}
              </div>
              <div class="omr-sv-ov tr">
                <div><b>Slice ${esc(pad2(cur.slice_index))}/${esc(pad2(total))}</b></div>
                <div>${esc(state.modality || '')} · ${esc(state.plane || '')}</div>
                ${showAllOv && state.loinc ? `<div class="mono">LOINC ${esc(state.loinc)}${state.rpid?' · '+esc(state.rpid):''}</div>` : ''}
              </div>
              ${showAllOv ? `
                <div class="omr-sv-ov bl">
                  ${state.uploaderName ? `<div>${isAr?'المُساهم':'Contributed'}: ${esc(state.uploaderName)}</div>` : ''}
                  ${state.reviewerName ? `<div>${isAr?'المُراجع':'Reviewed'}: ${esc(state.reviewerName)}</div>` : ''}
                </div>` : ''}
              <div class="omr-sv-ov br">
                <div>⚠ ${isAr ? 'تعليمي · AI' : 'EDUCATIONAL ONLY · AI'}</div>
              </div>
            ` : ''}
          </main>

          <aside class="omr-sv-pos" aria-hidden="true">
            <div class="omr-sv-pos-lbl">${isAr?'علوي':'Superior'}</div>
            <div class="omr-sv-pos-bar"><div class="omr-sv-pos-dot" style="top:${posPct}%"></div></div>
            <div class="omr-sv-pos-lbl">${isAr?'سفلي':'Inferior'}</div>
            <div class="omr-sv-pos-pct mono">${Math.round(posPct)}%</div>
            <div class="omr-sv-pos-word">${esc(positionLabel)}</div>
          </aside>
        </div>

        <div class="omr-sv-strip">${strip}</div>

        <footer class="omr-sv-foot atlas">
          <div class="omr-sv-nav">
            <button class="omr-sv-btn" data-act="prev" ${state.idx===0?'disabled':''} title="↑">‹</button>
            <span class="omr-sv-pos-txt mono">${esc(pad2(cur.slice_index))} / ${esc(pad2(total))}</span>
            <button class="omr-sv-btn" data-act="next" ${state.idx===total-1?'disabled':''} title="↓">›</button>
          </div>
          <div class="omr-sv-fps">
            <label class="mono">FPS ${state.fps||5}</label>
            <input type="range" min="1" max="15" step="1" value="${state.fps||5}" data-fps>
          </div>
          <div class="omr-sv-hint mono">↑↓ ${isAr?'شريحة':'slice'} · Wheel · Ctrl+Wheel ${isAr?'تكبير':'zoom'} · Space cine · I invert · L B/C · H overlay · O R/L · R reset · Esc</div>
        </footer>

        ${relHtml ? `
          <div class="omr-sv-rel-wrap">
            <div class="omr-sv-rel-hdr">🔗 ${isAr?'سلاسل ذات صلة':'Related series'}</div>
            <div class="omr-sv-rel-list">${relHtml}</div>
          </div>
        ` : ''}
      </div>
    `;

    // Wire atlas-mode
    root.querySelectorAll('[data-close="1"]').forEach(el => el.addEventListener('click', close));
    root.querySelector('[data-act="prev"]').addEventListener('click', () => go(-1));
    root.querySelector('[data-act="next"]').addEventListener('click', () => go(+1));
    root.querySelector('[data-act="cine"]').addEventListener('click', toggleCine);
    root.querySelector('[data-act="full"]').addEventListener('click', toggleFullscreen);
    root.querySelector('[data-act="zoomin"]').addEventListener('click', () => zoomBy(0.25));
    root.querySelector('[data-act="zoomout"]').addEventListener('click', () => zoomBy(-0.25));
    root.querySelector('[data-act="reset"]').addEventListener('click', resetView);
    root.querySelector('[data-act="invert"]').addEventListener('click', () => { state.invert = !state.invert; render(); persistState(); });
    root.querySelector('[data-act="overlay"]').addEventListener('click', () => { state.overlayLvl = (state.overlayLvl+1) % 3; render(); persistState(); });
    const orientBtn = root.querySelector('[data-act="orient"]');
    if (orientBtn) orientBtn.addEventListener('click', () => { state.orient = state.orient===false; render(); persistState(); });
    root.querySelector('[data-act="bc"]').addEventListener('click', (e) => { e.stopPropagation(); state.bcMenu = !state.bcMenu; render(); });
    root.querySelector('[data-act="snap"]').addEventListener('click', snapshot);
    root.querySelectorAll('[data-bc]').forEach(inp => inp.addEventListener('input', () => {
      const k = inp.getAttribute('data-bc');
      state[k] = parseInt(inp.value, 10) || 0;
      const wrap = root.querySelector('.omr-sv-img-wrap'); if (wrap) wrap.style.filter = bcFilter(state);
      const vb = root.querySelector(`[data-bc-val="${k}"]`); if (vb) vb.textContent = state[k];
      persistState();
    }));
    const bcReset = root.querySelector('[data-bc-reset]');
    if (bcReset) bcReset.addEventListener('click', () => { state.bright = 0; state.contrast = 0; render(); persistState(); });
    const fpsSlider = root.querySelector('[data-fps]');
    if (fpsSlider) fpsSlider.addEventListener('input', () => {
      state.fps = parseInt(fpsSlider.value, 10) || 5;
      const lbl = fpsSlider.parentElement.querySelector('label'); if (lbl) lbl.textContent = 'FPS ' + state.fps;
      if (cineTimer){ clearInterval(cineTimer); cineTimer = null; toggleCine(); }
      persistState();
    });
    root.querySelectorAll('.omr-sv-thumb').forEach(t => t.addEventListener('click', () => {
      state.idx = parseInt(t.getAttribute('data-idx'), 10);
      updateFrame(); persistState();
    }));
    root.querySelectorAll('.omr-sv-rel').forEach(el => el.addEventListener('click', () => {
      const sid = el.getAttribute('data-rel-sid');
      if (state.onOpenRelated) state.onOpenRelated(sid);
    }));

    // Wheel / drag on stage
    const stage = root.querySelector('[data-stage]');
    if (stage){
      stage.addEventListener('wheel', onStageWheel, { passive: false });
      stage.addEventListener('mousedown', onStageMouseDown);
      stage.addEventListener('dblclick', toggleFullscreen);
    }

    // Mount omnirad-term tooltips if available
    if (window.OmniRadTerm && typeof window.OmniRadTerm.mount === 'function'){
      try { window.OmniRadTerm.mount(root); } catch(_){}
    }
  }

  // ── Interaction helpers ──────────────────────────────────────────────
  // In-place frame patch (atlas mode) — updates ONLY what changes per slice.
  // Critical: a full render() rebuilds the whole toolbar via innerHTML, so
  // doing it every cine frame (several ×/sec) destroyed & recreated the Pause
  // button between a click's mousedown and mouseup, swallowing the click — the
  // viewer could not be paused. Patching in place keeps every control stable.
  function updateFrame(){
    if (!state || state.mode !== 'atlas') return render();
    const total = state.slices.length, cur = state.slices[state.idx];
    const isAr = ((window.OmniRadI18n && window.OmniRadI18n.lang) || 'en') === 'ar';
    const img = root.querySelector('.omr-sv-img-wrap img');
    if (img && img.getAttribute('src') !== cur.url) img.src = cur.url;
    const tr = root.querySelector('.omr-sv-ov.tr b'); if (tr) tr.textContent = `Slice ${pad2(cur.slice_index)}/${pad2(total)}`;
    const ft = root.querySelector('.omr-sv-pos-txt'); if (ft) ft.textContent = `${pad2(cur.slice_index)} / ${pad2(total)}`;
    const posPct = total > 1 ? (state.idx/(total-1)*100) : 0;
    const dot = root.querySelector('.omr-sv-pos-dot'); if (dot) dot.style.top = posPct + '%';
    const pct = root.querySelector('.omr-sv-pos-pct'); if (pct) pct.textContent = Math.round(posPct) + '%';
    root.querySelectorAll('.omr-sv-thumb').forEach((t,i) => t.classList.toggle('on', i === state.idx));
    const pv = root.querySelector('[data-act="prev"]'); if (pv) pv.disabled = state.idx === 0;
    const nx = root.querySelector('[data-act="next"]'); if (nx) nx.disabled = state.idx === total - 1;
    const sb = root.querySelector('.omr-sv-side-body');
    if (sb){
      const structs = (cur && cur.structures) || [];
      sb.innerHTML = structs.length
        ? structs.map(s => `<span class="omr-sv-struct" data-omnirad-term="${esc(s)}">${esc(s)}</span>`).join('')
        : `<span class="omr-sv-empty">${isAr?'لا بنى مسجّلة لهذه الشريحة':'No structures tagged for this slice'}</span>`;
      if (window.OmniRadTerm && typeof window.OmniRadTerm.mount === 'function'){ try { window.OmniRadTerm.mount(sb); } catch(_){} }
    }
  }

  function go(delta){
    if (!state) return;
    const n = state.slices.length;
    const next = clamp(state.idx + delta, 0, n - 1);
    if (next === state.idx) return;
    state.idx = next;
    (state.mode === 'atlas' ? updateFrame() : render());
    persistState();
  }

  function trigger(fnName){
    if (!state) return;
    const cb = state[fnName];
    if (typeof cb !== 'function') return;
    const cur = state.slices[state.idx];
    Promise.resolve(cb(cur, state.idx)).then(res => {
      if (res === 'stop') return;
      if ((fnName === 'onApprove' || fnName === 'onReject') && state.idx < state.slices.length - 1){
        go(+1);
      }
    });
  }

  function toggleCine(){
    const setIcon = () => { const b = root.querySelector('[data-act="cine"]'); if (b) b.textContent = cineTimer ? '⏸' : '▶'; };
    if (cineTimer){ clearInterval(cineTimer); cineTimer = null; setIcon(); return; }
    const fps = state.fps || (state.mode === 'atlas' ? 5 : 3);
    cineTimer = setInterval(() => {
      if (!state){ clearInterval(cineTimer); cineTimer = null; return; }
      state.idx = (state.idx + 1) % state.slices.length;
      (state.mode === 'atlas' ? updateFrame() : render());
      persistState();
    }, Math.round(1000 / fps));
    setIcon();
  }

  function toggleFullscreen(){
    if (!root) return;
    // Pure CSS-class fullscreen (no native Fullscreen API — it re-parents the
    // node and breaks pointer coordinates, chrome hiding, and image sizing).
    // The overlay is already position:fixed;inset:0, so a class is all we need.
    root.classList.toggle('fs');
    render();
  }

  function zoomBy(delta){
    if (!state) return;
    state.zoom = clamp((state.zoom || 1) + delta, 1, 4);
    // Reset pan when zoom hits 1x
    if (state.zoom <= 1){ state.panX = 0; state.panY = 0; }
    render();
    persistState();
  }
  function resetView(){
    if (!state) return;
    state.zoom = 1; state.panX = 0; state.panY = 0; state.invert = false; state.bright = 0; state.contrast = 0;
    render(); persistState();
  }

  function onStageWheel(e){
    e.preventDefault();
    if (!state) return;
    if (e.ctrlKey){
      // Ctrl + Wheel → Zoom
      zoomBy(e.deltaY < 0 ? 0.15 : -0.15);
    } else if (e.shiftKey){
      // Shift + Wheel → Jump 5
      go(e.deltaY < 0 ? -5 : +5);
    } else {
      // Wheel → next/prev slice
      go(e.deltaY < 0 ? -1 : +1);
    }
  }

  function onStageMouseDown(e){
    if (!state || (state.zoom||1) <= 1) return;
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const origX = state.panX || 0, origY = state.panY || 0;
    const wrap = root.querySelector('.omr-sv-img-wrap');
    const move = (ev) => {
      const nx = origX + (ev.clientX - startX);
      const ny = origY + (ev.clientY - startY);
      state.panX = nx; state.panY = ny;
      if (wrap){
        wrap.style.transform = `translate(${nx}px, ${ny}px) scale(${state.zoom})`;
        wrap.style.filter = bcFilter(state);
      }
    };
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      persistState();
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }

  async function snapshot(){
    if (!state) return;
    const cur = state.slices[state.idx];
    try {
      // Load image to canvas + burn overlay text
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = cur.url; });
      const c = document.createElement('canvas');
      c.width  = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      // Bake the current Brightness/Contrast/Invert onto the exported PNG
      ctx.filter = bcFilter(state);
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';
      // Overlay text
      const total = state.slices.length;
      const line = `OmniRad · ${state.seriesName || ''} · Slice ${pad2(cur.slice_index)}/${pad2(total)} · Educational · AI`;
      ctx.font = `${Math.max(12, Math.round(img.naturalWidth/60))}px 'IBM Plex Mono', monospace`;
      ctx.fillStyle = 'rgba(0,0,0,.65)';
      const pad = 12;
      const tw = ctx.measureText(line).width;
      const th = parseInt(ctx.font, 10);
      ctx.fillRect(pad-6, c.height - th - pad - 6, tw + 12, th + 12);
      ctx.fillStyle = '#2dd4c8';
      ctx.fillText(line, pad, c.height - pad);
      // Download
      c.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `omnirad_${(state.seriesId||'series').slice(0,8)}_slice${pad2(cur.slice_index)}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1500);
      }, 'image/png');
    } catch(e){
      // Fallback: right-click save
      console.warn('[series-viewer] snapshot failed', e);
    }
  }

  function onKey(e){
    if (!state || root.style.display === 'none') return;
    switch (e.key){
      case 'Escape': if (root.classList.contains('fs')){ root.classList.remove('fs'); render(); } else { close(); } break;
      case 'ArrowRight': go(document.dir==='rtl' ? -1 : +1); break;
      case 'ArrowLeft':  go(document.dir==='rtl' ? +1 : -1); break;
      case 'ArrowDown':  if (state.mode==='atlas'){ e.preventDefault(); go(+1); } break;
      case 'ArrowUp':    if (state.mode==='atlas'){ e.preventDefault(); go(-1); } break;
      case 'Home': state.idx = 0; render(); persistState(); break;
      case 'End':  state.idx = state.slices.length - 1; render(); persistState(); break;
      case '+': case '=': if (state.mode==='atlas') zoomBy(0.25); break;
      case '-': case '_': if (state.mode==='atlas') zoomBy(-0.25); break;
      case 'r': case 'R': if (state.mode==='atlas') resetView(); else trigger('onReject'); break;
      case 'i': case 'I': if (state.mode==='atlas'){ state.invert = !state.invert; render(); persistState(); } break;
      case 'l': case 'L': if (state.mode==='atlas'){ state.bcMenu = !state.bcMenu; render(); } break;
      case 'h': case 'H': if (state.mode==='atlas'){ state.overlayLvl = (state.overlayLvl+1)%3; render(); persistState(); } break;
      case 'o': case 'O': if (state.mode==='atlas' && orientationMarkers(state.plane)){ state.orient = state.orient===false; render(); persistState(); } break;
      case 'a': case 'A': if (state.mode!=='atlas') trigger('onApprove'); break;
      case 'e': case 'E': if (state.mode!=='atlas') trigger('onEdit'); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case ' ': e.preventDefault(); toggleCine(); break;
      default:
        // 1-9 → jump proportionally through the series
        if (state.mode==='atlas' && /^[1-9]$/.test(e.key)){
          const n = parseInt(e.key, 10);
          state.idx = Math.round((n-1) / 8 * (state.slices.length - 1));
          render(); persistState();
        }
    }
  }

  // ── Public API ──────────────────────────────────────────────────────
  function open(opts){
    ensureRoot();
    state = Object.assign({
      mode: 'review', idx: 0, cineFps: 3, fps: 3, outliers: [],
      zoom: 1, panX: 0, panY: 0, invert: false, bright: 0, contrast: 0, overlayLvl: 0, bcMenu: false
    }, opts || {});
    if (!Array.isArray(state.slices) || !state.slices.length) return;
    state.idx = clamp(state.startIndex || 0, 0, state.slices.length - 1);
    if (cineTimer){ clearInterval(cineTimer); cineTimer = null; }
    render();
    root.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    // Some browsers don't paint the fixed-position modal correctly on the
    // frame it's first shown (needs a forced reflow) — nudge it once.
    requestAnimationFrame(() => { void root.offsetHeight; render(); });
  }

  function onResize(){ if (state) render(); }

  function openAtlas(opts){
    opts = opts || {};
    opts.mode = 'atlas';
    opts.fps = opts.fps || 5;
    // Restore persisted state if available — but ALWAYS open at fit-to-view
    // (zoom 1, no pan). Restoring a stale zoom made images open cropped.
    const persisted = loadPersistedState(opts.seriesId);
    if (persisted){
      Object.assign(opts, {
        zoom: 1, panX: 0, panY: 0,
        invert: persisted.invert, bright: persisted.bright||0, contrast: persisted.contrast||0,
        overlayLvl: persisted.overlayLvl, fps: persisted.fps || 5
      });
      if (opts.startIndex == null && persisted.idx != null) opts.startIndex = persisted.idx;
    }
    open(opts);
  }

  function close(){
    if (!root) return;
    if (cineTimer){ clearInterval(cineTimer); cineTimer = null; }
    root.style.display = 'none';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    // Exit fullscreen if we entered
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch(_){}
    // Clear URL params (atlas mode)
    if (state && state.mode === 'atlas'){
      try {
        const url = new URL(location.href);
        url.searchParams.delete('series_id');
        url.searchParams.delete('slice');
        history.replaceState(null, '', url.toString());
      } catch(_){}
    }
    state = null;
  }

  // ── CSS (injected once) ──────────────────────────────────────────────
  const CSS = `
.omr-sv-root{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center}
.omr-sv-back{position:absolute;inset:0;background:rgba(3,7,18,.88);backdrop-filter:blur(4px)}
.omr-sv-shell{position:relative;z-index:1;width:min(96vw,1600px);max-height:96vh;display:flex;flex-direction:column;background:#0f172a;border:1px solid rgba(148,163,184,.18);border-radius:14px;box-shadow:0 20px 80px rgba(0,0,0,.55);overflow:hidden;font-family:'IBM Plex Sans','Noto Sans Arabic',sans-serif}
/* ═══════ Atlas mode: flex column with proper shrink rules ═══════ */
.omr-sv-shell.atlas{width:min(98vw,1800px);height:96vh;display:flex;flex-direction:column;overflow:hidden}
.omr-sv-shell.atlas > .omr-sv-head    {flex:0 0 auto;min-height:56px;padding:8px 16px}
.omr-sv-shell.atlas > .omr-sv-body    {flex:1 1 auto;min-height:0;padding:10px}
.omr-sv-shell.atlas > .omr-sv-strip   {flex:0 0 90px;background:rgba(2,6,23,.72)}
.omr-sv-shell.atlas > .omr-sv-foot    {flex:0 0 56px;max-height:56px;overflow:hidden;border-top:none;border-bottom:1px solid rgba(148,163,184,.10)}
.omr-sv-shell.atlas > .omr-sv-rel-wrap{flex:0 0 auto;min-height:56px;padding:8px 16px}
.omr-sv-shell.atlas .omr-sv-title{flex:1 1 auto;min-width:0}
.omr-sv-shell.atlas .omr-sv-title > span:not(.omr-sv-badge):not(.omr-sv-tier){overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.omr-sv-shell.atlas .omr-sv-actions{flex:0 0 auto}
.omr-sv-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid rgba(148,163,184,.14)}
.omr-sv-title{display:flex;align-items:center;gap:10px;font-size:13.5px;font-weight:600;color:#e2e8f0;min-width:0;flex-wrap:wrap}
.omr-sv-badge{background:rgba(45,212,200,.14);color:#2dd4c8;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;border:1px solid rgba(45,212,200,.35)}
.omr-sv-tier{padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.omr-sv-tier.tier-standard{background:rgba(45,212,200,.10);color:#2dd4c8;border:1px solid rgba(45,212,200,.35)}
.omr-sv-tier.tier-partial{background:rgba(251,191,36,.10);color:#fbbf24;border:1px solid rgba(251,191,36,.35)}
.omr-sv-tier.tier-custom{background:rgba(148,163,184,.10);color:#94a3b8;border:1px solid rgba(148,163,184,.30)}
.omr-sv-actions{display:flex;gap:6px;flex-wrap:wrap}
.omr-sv-btn{background:transparent;color:#cbd5e1;border:1px solid rgba(148,163,184,.25);padding:6px 10px;border-radius:8px;font:600 12px/1 'IBM Plex Sans','Noto Sans Arabic',sans-serif;cursor:pointer;transition:background .12s, border-color .12s}
.omr-sv-btn:hover:not(:disabled){background:rgba(45,212,200,.10);border-color:rgba(45,212,200,.45);color:#2dd4c8}
.omr-sv-btn.on{background:rgba(45,212,200,.16);border-color:rgba(45,212,200,.5);color:#2dd4c8}
.omr-sv-btn:disabled{opacity:.35;cursor:not-allowed}
.omr-sv-btn.ok{color:#10b981;border-color:rgba(16,185,129,.5)}
.omr-sv-btn.edit{color:#2dd4c8;border-color:rgba(45,212,200,.45)}
.omr-sv-btn.bad{color:#ef4444;border-color:rgba(239,68,68,.5)}
.omr-sv-btn.danger{color:#ef4444;border-color:rgba(239,68,68,.4)}
/* Review mode 3-up */
.omr-sv-3up{display:grid;grid-template-columns:1fr 1.8fr 1fr;gap:10px;padding:14px;flex:1;min-height:0}
.omr-sv-pane{position:relative;background:#000;border-radius:8px;overflow:hidden;display:grid;place-items:center;min-height:280px}
.omr-sv-pane.current{outline:2px solid #2dd4c8;outline-offset:-2px}
.omr-sv-pane.empty{border:1px dashed rgba(148,163,184,.25);background:#020617}
.omr-sv-pane img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;user-select:none;-webkit-user-drag:none;display:block;margin:auto}
.omr-sv-placeholder{color:#64748b;font-size:12px;font-style:italic}
/* Atlas body sub-panels (children of the absolutely-positioned body) */
.omr-sv-body{display:flex;gap:10px;padding:12px;min-height:0;overflow:hidden}
.omr-sv-side{flex:0 0 220px;background:#020617;border-radius:8px;padding:12px;overflow-y:auto;color:#cbd5e1;font-size:12px;border:1px solid rgba(148,163,184,.10);min-height:0}
.omr-sv-side-hdr{font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;margin-bottom:8px;font-weight:700}
.omr-sv-side-body{display:flex;flex-wrap:wrap;gap:5px}
.omr-sv-struct{background:rgba(45,212,200,.10);color:#2dd4c8;padding:3px 8px;border-radius:6px;font-size:11px;border:1px solid rgba(45,212,200,.28);cursor:help}
.omr-sv-empty{color:#64748b;font-style:italic;font-size:11px}
.omr-sv-side-pearl,.omr-sv-side-pitfall{margin-top:12px;padding:8px 10px;border-radius:6px;font-size:11.5px;line-height:1.55}
.omr-sv-side-pearl{background:rgba(16,185,129,.10);border:1px solid rgba(16,185,129,.30);color:#10b981}
.omr-sv-side-pitfall{background:rgba(245,158,11,.10);border:1px solid rgba(245,158,11,.30);color:#f59e0b}
.omr-sv-stage{position:relative;flex:1 1 auto;background:#000;border-radius:8px;overflow:hidden;display:block;min-height:0;min-width:0;cursor:grab}
.omr-sv-stage:active{cursor:grabbing}
.omr-sv-orient{position:absolute;inset:0;pointer-events:none;z-index:4}
.omr-sv-orient span{position:absolute;font:800 15px/1 'IBM Plex Mono',monospace;color:#fbbf24;text-shadow:0 0 4px rgba(0,0,0,.9),0 1px 2px rgba(0,0,0,.9);letter-spacing:.02em}
.omr-sv-orient-l{left:10px;top:50%;transform:translateY(-50%)}
.omr-sv-orient-r{right:10px;top:50%;transform:translateY(-50%)}
.omr-sv-orient-t{top:8px;left:50%;transform:translateX(-50%)}
.omr-sv-orient-b{bottom:8px;left:50%;transform:translateX(-50%)}
.omr-sv-img-wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#000;transform-origin:center center;transition:transform .06s linear, filter .12s;overflow:hidden}
.omr-sv-img-wrap img{width:100%;height:100%;object-fit:contain;user-select:none;-webkit-user-drag:none;image-rendering:crisp-edges;display:block}
.omr-sv-wl-menu{position:absolute;top:10px;left:50%;transform:translateX(-50%);background:#0f172a;border:1px solid rgba(148,163,184,.25);border-radius:8px;padding:6px;display:flex;flex-wrap:wrap;gap:4px;z-index:5;box-shadow:0 10px 30px rgba(0,0,0,.5)}
.omr-sv-wl-menu button{background:transparent;border:1px solid rgba(148,163,184,.2);color:#cbd5e1;padding:5px 10px;border-radius:5px;font:600 11px 'IBM Plex Sans',sans-serif;cursor:pointer}
.omr-sv-wl-menu button.on{background:rgba(45,212,200,.16);border-color:rgba(45,212,200,.5);color:#2dd4c8}
.omr-sv-bc-menu{position:absolute;top:10px;left:50%;transform:translateX(-50%);background:#0f172a;border:1px solid rgba(148,163,184,.25);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:10px;z-index:5;box-shadow:0 10px 30px rgba(0,0,0,.5);min-width:260px}
.omr-sv-bc-row{display:grid;grid-template-columns:64px 1fr 38px;align-items:center;gap:10px;font:600 11.5px 'IBM Plex Sans','Noto Sans Arabic',sans-serif;color:#cbd5e1}
.omr-sv-bc-row input[type=range]{accent-color:#2dd4c8;width:100%;cursor:pointer}
.omr-sv-bc-row b{color:#2dd4c8;text-align:end;font-size:11px}
.omr-sv-bc-foot{display:flex;justify-content:flex-end}
.omr-sv-bc-foot button{background:transparent;border:1px solid rgba(148,163,184,.25);color:#cbd5e1;padding:5px 12px;border-radius:6px;font:600 11px 'IBM Plex Sans','Noto Sans Arabic',sans-serif;cursor:pointer}
.omr-sv-bc-foot button:hover{background:rgba(45,212,200,.1);border-color:rgba(45,212,200,.45);color:#2dd4c8}
.omr-sv-pos{flex:0 0 68px;background:#020617;border-radius:8px;padding:10px 6px;display:flex;flex-direction:column;align-items:center;gap:6px;border:1px solid rgba(148,163,184,.10);min-height:0}
.omr-sv-pos-lbl{font-size:9.5px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;font-weight:700}
.omr-sv-pos-bar{position:relative;flex:1;width:6px;background:rgba(148,163,184,.14);border-radius:3px;min-height:200px}
.omr-sv-pos-dot{position:absolute;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;background:#2dd4c8;box-shadow:0 0 0 3px rgba(45,212,200,.25);transition:top .18s}
.omr-sv-pos-pct{font-size:11px;color:#2dd4c8;font-weight:700}
.omr-sv-pos-word{font-size:9.5px;color:#94a3b8;writing-mode:vertical-rl;text-align:center}
/* Filmstrip */
.omr-sv-strip{display:flex;gap:5px;padding:8px 12px;overflow-x:auto;overflow-y:hidden;background:rgba(2,6,23,.5);border-top:1px solid rgba(148,163,184,.10);border-bottom:1px solid rgba(148,163,184,.10);scroll-snap-type:x proximity;flex:none}
.omr-sv-strip::-webkit-scrollbar{height:6px}.omr-sv-strip::-webkit-scrollbar-thumb{background:rgba(45,212,200,.3);border-radius:3px}
.omr-sv-thumb{position:relative;width:72px;height:72px;flex:none;border-radius:5px;overflow:hidden;background:#020617;border:2px solid transparent;cursor:pointer;transition:border-color .12s, transform .12s;scroll-snap-align:center}
.omr-sv-thumb:hover{border-color:rgba(45,212,200,.5);transform:scale(1.04)}
.omr-sv-thumb.on{border-color:#2dd4c8;box-shadow:0 0 0 2px rgba(45,212,200,.35)}
.omr-sv-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.omr-sv-thumb-num{position:absolute;bottom:2px;left:2px;background:rgba(0,0,0,.72);color:#fff;font:600 9px 'IBM Plex Mono',monospace;padding:1px 4px;border-radius:2px;letter-spacing:.02em}
/* Overlays */
.omr-sv-ov{position:absolute;color:#e2e8f0;font:500 10.5px/1.35 'IBM Plex Mono',monospace;background:rgba(15,23,42,.55);padding:5px 8px;border-radius:5px;pointer-events:none;letter-spacing:.02em;text-shadow:0 1px 2px rgba(0,0,0,.7);max-width:calc(100% - 20px)}
.omr-sv-ov b{color:#2dd4c8;font-weight:700}
.omr-sv-ov.tl{top:8px;left:8px}
.omr-sv-ov.tr{top:8px;right:8px;text-align:right}
.omr-sv-ov.br{bottom:8px;right:8px;font-size:9.5px;color:#fbbf24}
.omr-sv-ov.bl{bottom:8px;left:8px}
.omr-sv-ov.warn{color:#ef4444;background:rgba(239,68,68,.14);border:1px solid rgba(239,68,68,.35);font-weight:600}
.omr-sv-shell.noov .omr-sv-ov{display:none}
/* Foot */
.omr-sv-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-top:1px solid rgba(148,163,184,.14);flex-wrap:wrap}
.omr-sv-foot.atlas{border-top:none;padding-top:6px}
.omr-sv-nav{display:flex;align-items:center;gap:8px}
.omr-sv-pos-txt,.omr-sv-pos{color:#94a3b8}
.omr-sv-pos-txt{font-size:12px;letter-spacing:.05em;min-width:70px;text-align:center}
.omr-sv-actions-main{display:flex;gap:6px}
.omr-sv-hint{font-size:10.5px;color:#64748b;letter-spacing:.03em}
.omr-sv-fps{display:flex;align-items:center;gap:8px}
.omr-sv-fps label{font-size:10.5px;color:#94a3b8}
.omr-sv-fps input{accent-color:#2dd4c8}
/* Related series */
.omr-sv-rel-wrap{padding:10px 16px 14px;border-top:1px solid rgba(148,163,184,.10)}
.omr-sv-rel-hdr{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:8px}
.omr-sv-rel-list{display:flex;gap:10px;flex-wrap:wrap}
.omr-sv-rel{display:flex;flex-direction:column;align-items:flex-start;gap:4px;background:#020617;border:1px solid rgba(148,163,184,.14);border-radius:8px;padding:8px;cursor:pointer;color:#cbd5e1;font-family:inherit;min-width:180px;transition:border-color .12s, transform .12s}
.omr-sv-rel:hover{border-color:rgba(45,212,200,.5);transform:translateY(-2px)}
.omr-sv-rel img,.omr-sv-rel-ph{width:100%;aspect-ratio:2/1;object-fit:cover;border-radius:5px;background:#0f172a}
.omr-sv-rel-lbl{font-size:11.5px;font-weight:600;color:#e2e8f0;text-align:start;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.omr-sv-rel-meta{font-size:10px;color:#64748b;letter-spacing:.03em}
.omr-sv-root.fs .omr-sv-3up{grid-template-columns:1fr}
.omr-sv-root.fs .omr-sv-3up > .omr-sv-pane:not(.current){display:none}
.omr-sv-root.fs .omr-sv-shell{width:98vw;max-height:98vh}
.omr-sv-root.fs .omr-sv-shell.atlas{width:100vw;height:100vh;max-height:100vh;border:none;border-radius:0}
.omr-sv-root.fs .omr-sv-shell.atlas > .omr-sv-strip,
.omr-sv-root.fs .omr-sv-shell.atlas > .omr-sv-foot,
.omr-sv-root.fs .omr-sv-shell.atlas .omr-sv-side{display:none}
.omr-sv-root.fs .omr-sv-shell.atlas > .omr-sv-body{padding:6px}
.mono{font-family:'IBM Plex Mono',monospace}
@media (max-width:1100px){
  .omr-sv-shell.atlas .omr-sv-side,.omr-sv-shell.atlas .omr-sv-pos{display:none}
}
@media (max-width:820px){
  .omr-sv-3up{grid-template-columns:1fr}
  .omr-sv-3up > .omr-sv-pane:not(.current){display:none}
  .omr-sv-strip .omr-sv-thumb{width:56px;height:56px}
}
`;
  function injectCss(){
    if (typeof document === 'undefined') return;
    if (document.getElementById('omr-sv-css')) return;
    const s = document.createElement('style');
    s.id = 'omr-sv-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  if (typeof document !== 'undefined'){
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', injectCss);
    } else { injectCss(); }
  }

  const API = { open, openAtlas, close };
  if (typeof window !== 'undefined') window.OmniRadSeriesViewer = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
