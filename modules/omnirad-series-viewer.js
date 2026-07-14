/* ═══════════════════════════════════════════════════════════════════════════
 * OmniRad — 3-up Comparative Series Viewer  (omnirad-series-viewer.js)
 * ═══════════════════════════════════════════════════════════════════════════
 * Modal image viewer for series review. Shows PREV / CURRENT / NEXT slices
 * side-by-side so the reviewer can verify anatomical continuity in one look.
 *
 * Features
 *   – DICOM-style overlay per pane (top-left slice indicator, top-right
 *     modality, bottom-right AI/Educational warnings)
 *   – Keyboard: ←/→ prev/next · Home/End first/last · Esc close
 *                a Approve · r Reject · e Edit · Space Cine · f Fullscreen
 *   – Double-click on centre pane → fullscreen single-image mode
 *   – Cine (▶) plays through slices at a configurable fps
 *   – Callback hooks: onApprove(slice), onReject(slice), onEdit(slice)
 *
 * Usage
 *   OmniRadSeriesViewer.open({
 *     seriesName, modality, plane, loinc, tier,
 *     slices: [{ slice_index, url, structures, coherenceOutlier }, ...],
 *     startIndex: 0,
 *     onApprove: (slice) => ..., onReject: (slice) => ..., onEdit: (slice) => ...
 *   });
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

  function render(){
    if (!state) return;
    const total = state.slices.length;
    const cur = state.slices[state.idx];
    const prev = state.idx > 0 ? state.slices[state.idx - 1] : null;
    const next = state.idx < total - 1 ? state.slices[state.idx + 1] : null;
    const lang = (window.OmniRadI18n && window.OmniRadI18n.lang) || 'en';
    const isAr = lang === 'ar';

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

    // Wire buttons
    root.querySelectorAll('[data-close="1"]').forEach(el => el.addEventListener('click', close));
    root.querySelector('[data-act="prev"]').addEventListener('click', () => go(-1));
    root.querySelector('[data-act="next"]').addEventListener('click', () => go(+1));
    root.querySelector('[data-act="approve"]').addEventListener('click', () => trigger('onApprove'));
    root.querySelector('[data-act="reject"]').addEventListener('click', () => trigger('onReject'));
    root.querySelector('[data-act="edit"]').addEventListener('click', () => trigger('onEdit'));
    root.querySelector('[data-act="cine"]').addEventListener('click', toggleCine);
    root.querySelector('[data-act="full"]').addEventListener('click', toggleFullscreen);

    // Double-click center pane → fullscreen
    const centerPane = root.querySelector('.omr-sv-pane.current');
    if (centerPane){
      centerPane.addEventListener('dblclick', toggleFullscreen);
    }
  }

  function go(delta){
    if (!state) return;
    const n = state.slices.length;
    const next = Math.max(0, Math.min(n - 1, state.idx + delta));
    if (next === state.idx) return;
    state.idx = next;
    render();
  }

  function trigger(fnName){
    if (!state) return;
    const cb = state[fnName];
    if (typeof cb !== 'function') return;
    const cur = state.slices[state.idx];
    Promise.resolve(cb(cur, state.idx)).then(res => {
      if (res === 'stop') return;
      // Auto-advance on approve/reject; stop at end
      if ((fnName === 'onApprove' || fnName === 'onReject') && state.idx < state.slices.length - 1){
        go(+1);
      }
    });
  }

  function toggleCine(){
    if (cineTimer){
      clearInterval(cineTimer); cineTimer = null; render(); return;
    }
    const fps = state.cineFps || 3;
    cineTimer = setInterval(() => {
      if (!state){ clearInterval(cineTimer); cineTimer = null; return; }
      state.idx = (state.idx + 1) % state.slices.length;
      render();
    }, Math.round(1000 / fps));
    render();
  }

  function toggleFullscreen(){
    root.classList.toggle('fs');
  }

  function onKey(e){
    if (!state || root.style.display === 'none') return;
    switch (e.key){
      case 'Escape': close(); break;
      case 'ArrowRight': go((document.dir==='rtl')?-1:+1); break;
      case 'ArrowLeft':  go((document.dir==='rtl')?+1:-1); break;
      case 'Home': state.idx = 0; render(); break;
      case 'End':  state.idx = state.slices.length - 1; render(); break;
      case 'a': case 'A': trigger('onApprove'); break;
      case 'r': case 'R': trigger('onReject'); break;
      case 'e': case 'E': trigger('onEdit'); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case ' ': e.preventDefault(); toggleCine(); break;
    }
  }

  function open(opts){
    ensureRoot();
    state = Object.assign({ idx: 0, cineFps: 3, outliers: [] }, opts || {});
    if (!Array.isArray(state.slices) || !state.slices.length) return;
    state.idx = Math.max(0, Math.min(state.slices.length - 1, state.startIndex || 0));
    if (cineTimer){ clearInterval(cineTimer); cineTimer = null; }
    render();
    root.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
  }

  function close(){
    if (!root) return;
    if (cineTimer){ clearInterval(cineTimer); cineTimer = null; }
    root.style.display = 'none';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    state = null;
  }

  // ── CSS (injected once) ──────────────────────────────────────────────
  const CSS = `
.omr-sv-root{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center}
.omr-sv-back{position:absolute;inset:0;background:rgba(3,7,18,.85);backdrop-filter:blur(4px)}
.omr-sv-shell{position:relative;z-index:1;width:min(96vw,1600px);max-height:94vh;display:flex;flex-direction:column;background:#0f172a;border:1px solid rgba(148,163,184,.18);border-radius:14px;box-shadow:0 20px 80px rgba(0,0,0,.55);overflow:hidden;font-family:'IBM Plex Sans','Noto Sans Arabic',sans-serif}
.omr-sv-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid rgba(148,163,184,.14)}
.omr-sv-title{display:flex;align-items:center;gap:10px;font-size:13.5px;font-weight:600;color:#e2e8f0}
.omr-sv-badge{background:rgba(45,212,200,.14);color:#2dd4c8;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;border:1px solid rgba(45,212,200,.35)}
.omr-sv-tier{padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
.omr-sv-tier.tier-standard{background:rgba(45,212,200,.10);color:#2dd4c8;border:1px solid rgba(45,212,200,.35)}
.omr-sv-tier.tier-partial{background:rgba(251,191,36,.10);color:#fbbf24;border:1px solid rgba(251,191,36,.35)}
.omr-sv-tier.tier-custom{background:rgba(148,163,184,.10);color:#94a3b8;border:1px solid rgba(148,163,184,.30)}
.omr-sv-actions{display:flex;gap:6px}
.omr-sv-btn{background:transparent;color:#cbd5e1;border:1px solid rgba(148,163,184,.25);padding:6px 10px;border-radius:8px;font:600 12px/1 'IBM Plex Sans','Noto Sans Arabic',sans-serif;cursor:pointer;transition:background .12s, border-color .12s}
.omr-sv-btn:hover:not(:disabled){background:rgba(45,212,200,.10);border-color:rgba(45,212,200,.45);color:#2dd4c8}
.omr-sv-btn:disabled{opacity:.35;cursor:not-allowed}
.omr-sv-btn.ok{color:#10b981;border-color:rgba(16,185,129,.5)}
.omr-sv-btn.edit{color:#2dd4c8;border-color:rgba(45,212,200,.45)}
.omr-sv-btn.bad{color:#ef4444;border-color:rgba(239,68,68,.5)}
.omr-sv-btn.danger{color:#ef4444;border-color:rgba(239,68,68,.4)}
.omr-sv-3up{display:grid;grid-template-columns:1fr 1.8fr 1fr;gap:10px;padding:14px;flex:1;min-height:0}
.omr-sv-pane{position:relative;background:#020617;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:280px}
.omr-sv-pane.current{outline:2px solid #2dd4c8;outline-offset:-2px}
.omr-sv-pane.empty{border:1px dashed rgba(148,163,184,.25)}
.omr-sv-pane img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;user-select:none;-webkit-user-drag:none}
.omr-sv-placeholder{color:#64748b;font-size:12px;font-style:italic}
.omr-sv-ov{position:absolute;color:#e2e8f0;font:500 10.5px/1.35 'IBM Plex Mono',monospace;background:rgba(15,23,42,.55);padding:5px 8px;border-radius:5px;pointer-events:none;letter-spacing:.02em;text-shadow:0 1px 2px rgba(0,0,0,.7);max-width:calc(100% - 20px)}
.omr-sv-ov b{color:#2dd4c8;font-weight:700}
.omr-sv-ov.tl{top:8px;left:8px}
.omr-sv-ov.tr{top:8px;right:8px;text-align:right}
.omr-sv-ov.br{bottom:8px;right:8px;font-size:9.5px;color:#fbbf24}
.omr-sv-ov.bl{bottom:8px;left:8px}
.omr-sv-ov.warn{color:#ef4444;background:rgba(239,68,68,.14);border:1px solid rgba(239,68,68,.35);font-weight:600}
.omr-sv-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-top:1px solid rgba(148,163,184,.14);flex-wrap:wrap}
.omr-sv-nav{display:flex;align-items:center;gap:8px}
.omr-sv-pos{color:#94a3b8;font-size:12px;letter-spacing:.05em;min-width:70px;text-align:center}
.omr-sv-actions-main{display:flex;gap:6px}
.omr-sv-hint{font-size:10.5px;color:#64748b;letter-spacing:.03em}
.omr-sv-root.fs .omr-sv-3up{grid-template-columns:1fr}
.omr-sv-root.fs .omr-sv-3up > .omr-sv-pane:not(.current){display:none}
.omr-sv-root.fs .omr-sv-shell{width:98vw;max-height:98vh}
.mono{font-family:'IBM Plex Mono',monospace}
@media (max-width:820px){.omr-sv-3up{grid-template-columns:1fr}.omr-sv-3up > .omr-sv-pane:not(.current){display:none}}
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

  const API = { open, close };
  if (typeof window !== 'undefined') window.OmniRadSeriesViewer = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
