/* ═══════════════════════════════════════════════════════════════════════════
 * OmniRad — Unified Standardized Radiology Naming API  (omnirad-naming.js)
 * ═══════════════════════════════════════════════════════════════════════════
 * Combines three vocabularies into one bilingual API surface:
 *   • LOINC/RSNA Radiology Playbook (7,089 procedure codes) — radiology-playbook.js
 *   • DICOM CID 4031 Common Anatomic Regions (~120 body parts) — dicom-body-parts.js
 *   • Arabic composer (WHO UMD + الجمعية السعودية) — radiology-arabic.js
 *
 * Standards referenced:
 *   – LOINC 2.82 (Regenstrief Institute) — https://loinc.org
 *   – RadLex Playbook (RSNA) — https://playbook.radlex.org
 *   – DICOM PS3.16 Content Mapping Resource
 *   – SNOMED CT Body Structure hierarchy
 *   – WHO Arabic Unified Medical Dictionary (UMD)
 *
 * Load order in HTML (all in <head>, before any script that uses this API):
 *   <script src="../modules/data/dicom-body-parts.js"></script>
 *   <script src="../modules/data/radiology-playbook.js"></script>
 *   <script src="../modules/data/radiology-arabic.js"></script>
 *   <script src="../modules/omnirad-naming.js"></script>
 *
 * Public surface (window.OmniRadNaming):
 *   .ready()                              → Promise resolved when data is loaded
 *   .modalities()                         → [{code, ar, count}] sorted
 *   .regions()                            → [{code, ar, count, groupEn, groupAr}] (DICOM CID + LOINC intersection)
 *   .bodyParts(groupId?)                  → DICOM CID 4031 items
 *   .bodyPartGroups()                     → DICOM CID 4031 groups (hierarchical picker root)
 *   .search(query, {modality, region, limit=30})
 *                                         → [{rec, score, tier}] ranked, bilingual matches
 *   .resolve(loincCode)                   → {loinc, rpid, en, ar, tier, meta} or null
 *   .compose(rec)                         → composed Arabic name (delegates to composer)
 *   .autoSuggest(promptText, {modality, region, limit=5})
 *                                         → top N candidate LOINC codes derived from a
 *                                           free-text prompt (e.g. the ChatGPT prompt used)
 *   .qualityTier({loincCode, modality, region, customName})
 *                                         → 'standard' | 'partial' | 'custom'
 *   .renderBadge(resolved, lang)          → HTML string (safe) for series info badge
 * ═════════════════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  // ── Ready promise ────────────────────────────────────────────────────
  let readyResolve;
  const readyPromise = new Promise(r => { readyResolve = r; });
  function checkReady(){
    if (window.OmniRadPlaybook && window.OmniRadDicomBP && window.OmniRadNamingAR){
      readyResolve(true);
      return true;
    }
    return false;
  }
  if (!checkReady()){
    let tries = 0;
    const iv = setInterval(() => {
      tries++;
      if (checkReady() || tries > 100){ clearInterval(iv); if (tries > 100) readyResolve(false); }
    }, 50);
  }

  // ── Small helpers ────────────────────────────────────────────────────
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function norm(s){ return String(s||'').toLowerCase().replace(/[\s\-_.]+/g,' ').trim(); }
  function tokens(s){ return norm(s).split(/\s+/).filter(t => t.length >= 2); }

  // ── Modality metadata (bilingual + display style) ────────────────────
  const MODALITY_AR = {
    'CT':'التصوير المقطعي المحوسب', 'MR':'الرنين المغناطيسي', 'US':'الموجات فوق الصوتية',
    'XR':'الأشعة السينية', 'NM':'الطب النووي', 'MG':'تصوير الثدي الشعاعي',
    'PT':'التصوير بالإصدار البوزيتروني', 'PT+CT':'PET/CT', 'NM.SPECT+CT':'SPECT/CT',
    'DXA':'قياس كثافة العظام', 'RF':'التنظير الشعاعي',
    '{Imaging modality}':'أسلوب التصوير'
  };
  const MODALITY_ORDER = ['CT','MR','US','XR','MG','NM','PT','PT+CT','NM.SPECT+CT','DXA','RF','{Imaging modality}'];

  // ── LOINC region name → DICOM CID group hint (best-effort mapping) ───
  const REGION_TO_GROUP = {
    'Head':'HEAD_NECK', 'Neck':'HEAD_NECK', 'Cerebral artery middle':'HEAD_NECK',
    'Spine':'SPINE',
    'Chest':'CHEST', 'Breast':'CHEST',
    'Abdomen':'ABDOMEN', 'Biliary system':'ABDOMEN',
    'Pelvis':'PELVIS',
    'Upper extremity':'UPPER_EXT',
    'Lower extremity':'LOWER_EXT',
    'Extremity':'MSK_OTHER',
    'Whole Body':'MSK_OTHER',
    'Umbilical artery':'VASCULAR', 'Umbilical cord':'VASCULAR', 'Umbilical vessels':'VASCULAR'
  };

  // ── Search index (lazy) ──────────────────────────────────────────────
  let searchIndex = null;
  function buildIndex(){
    if (searchIndex) return searchIndex;
    if (!window.OmniRadPlaybook) return { rows: [], byToken: new Map() };
    const rows = window.OmniRadPlaybook.all();
    const byToken = new Map();
    rows.forEach((r, idx) => {
      const bag = [r.c, r.n, r.s, r.d, r.cn, ...(r.rn||[])].join(' ');
      const ts = tokens(bag);
      const uniq = [...new Set(ts)];
      uniq.forEach(t => {
        if (!byToken.has(t)) byToken.set(t, []);
        byToken.get(t).push(idx);
      });
    });
    searchIndex = { rows, byToken };
    return searchIndex;
  }

  // ── Quality tier logic ──────────────────────────────────────────────
  // Green  (standard)  → picked from LOINC playbook + optional Region match
  // Yellow (partial)   → Region picked from DICOM CID but no LOINC match
  // Neutral (custom)   → free-text name only
  function qualityTier({loincCode, modality, region, customName}){
    if (loincCode) return 'standard';
    if (region || modality) return 'partial';
    if (customName && customName.trim()) return 'custom';
    return 'custom';
  }

  // ── Resolve one LOINC code to a bilingual object ────────────────────
  function resolve(loincCode){
    if (!loincCode || !window.OmniRadPlaybook) return null;
    const rec = window.OmniRadPlaybook.byCode(loincCode);
    if (!rec) return null;
    const en = rec.d || rec.n || '';
    const ar = window.OmniRadNamingAR ? window.OmniRadNamingAR.compose(rec) : '';
    return {
      loinc: rec.c,
      rpid: rec.rp || '',
      short: rec.s,
      en,
      ar,
      meta: {
        modality: rec.mo,
        modalitySubtype: rec.ms,
        region: rec.rg,
        focus: rec.fo || [],
        timing: rec.ti,
        contrast: rec.ct,
        route: rec.rt,
        view: rec.vw,
        aggregation: rec.ag,
        reason: rec.rs,
        maneuver: rec.mv,
        laterality: rec.lat,
        class: rec.cl,
        regionRid: rec.rr,
        modalityRid: rec.rm
      },
      tier: 'standard'
    };
  }

  // ── Compose (thin wrapper around Arabic composer) ───────────────────
  function compose(rec){
    if (!rec) return '';
    if (window.OmniRadNamingAR) return window.OmniRadNamingAR.compose(rec);
    return rec.d || rec.n || '';
  }

  // ── Search (tokenized + filtered + ranked) ──────────────────────────
  function search(query, opts){
    opts = opts || {};
    const limit = opts.limit || 30;
    const modality = opts.modality || null;
    const region = opts.region || null;

    buildIndex();
    if (!searchIndex || !searchIndex.rows.length) return [];

    const qTokens = tokens(query);
    let candidates;
    if (!qTokens.length){
      // No text query — filter only
      candidates = searchIndex.rows.map((r,i) => ({ r, i, score: 0 }));
    } else {
      // Union of rows matching ANY token; score = number of matching tokens
      const scoreMap = new Map();
      qTokens.forEach(t => {
        // Prefix-match: hit any token that starts with the query token
        for (const [key, idxs] of searchIndex.byToken){
          if (key === t || key.startsWith(t) || t.startsWith(key)){
            const w = (key === t) ? 3 : (key.startsWith(t) ? 2 : 1);
            idxs.forEach(i => scoreMap.set(i, (scoreMap.get(i) || 0) + w));
          }
        }
      });
      candidates = [...scoreMap.entries()].map(([i, score]) => ({
        r: searchIndex.rows[i], i, score
      }));
    }

    // Filter
    if (modality) candidates = candidates.filter(c => c.r.mo === modality);
    if (region)   candidates = candidates.filter(c => c.r.rg === region);

    // Rank: score desc, then LOINC code asc
    candidates.sort((a,b) => (b.score - a.score) || a.r.c.localeCompare(b.r.c));

    // Compose bilingual output for the top N
    return candidates.slice(0, limit).map(({r, score}) => ({
      loinc: r.c, rpid: r.rp,
      en: r.d || r.n, ar: compose(r), short: r.s,
      modality: r.mo, region: r.rg, focus: r.fo, timing: r.ti,
      tier: 'standard', score
    }));
  }

  // ── Modality / Region listings for picker UI ────────────────────────
  function modalities(){
    if (!window.OmniRadPlaybook) return [];
    const counts = {};
    window.OmniRadPlaybook.all().forEach(r => {
      if (r.mo){ counts[r.mo] = (counts[r.mo]||0) + 1; }
    });
    return MODALITY_ORDER
      .filter(m => counts[m])
      .map(m => ({ code: m, ar: MODALITY_AR[m] || m, count: counts[m] }));
  }

  function regions(){
    if (!window.OmniRadPlaybook) return [];
    const counts = {};
    window.OmniRadPlaybook.all().forEach(r => {
      if (r.rg && r.rg !== 'XXX'){ counts[r.rg] = (counts[r.rg]||0) + 1; }
    });
    const arDict = (window.OmniRadNamingAR && window.OmniRadNamingAR.dict.region) || {};
    return Object.entries(counts)
      .sort((a,b) => b[1] - a[1])
      .map(([code, count]) => ({
        code, ar: arDict[code] || code, count,
        group: REGION_TO_GROUP[code] || null
      }));
  }

  function bodyPartGroups(){
    return window.OmniRadDicomBP ? window.OmniRadDicomBP.groups() : [];
  }
  function bodyParts(groupId){
    if (!window.OmniRadDicomBP) return [];
    if (groupId) return window.OmniRadDicomBP.byGroup(groupId);
    return window.OmniRadDicomBP.all();
  }

  // ── Auto-suggest from a free-text prompt ────────────────────────────
  // Extract modality + anatomical hints, then pick top-N LOINC codes.
  // Heuristic — good enough for a "suggest a template" UX.
  function autoSuggest(promptText, opts){
    opts = opts || {};
    const limit = opts.limit || 5;
    const text = String(promptText||'').toLowerCase();
    // Detect modality
    const modHits = [];
    const modPatterns = [
      [/computed tomograph|\bct\b/, 'CT'],
      [/magnetic resonance|\bmri\b|\bmr\b/, 'MR'],
      [/ultrasound|sonograph|doppler|\bus\b/, 'US'],
      [/x[- ]?ray|radiograph|plain film/, 'XR'],
      [/mammograph/, 'MG'],
      [/nuclear medicine|scintigraph/, 'NM'],
      [/pet[- ]?ct|\bpet\b/, 'PT'],
      [/dxa|bone densit/, 'DXA'],
      [/fluoroscop|\brf\b/, 'RF']
    ];
    modPatterns.forEach(([re, m]) => { if (re.test(text)) modHits.push(m); });
    const modality = opts.modality || modHits[0] || null;
    return search(promptText, { modality, region: opts.region, limit });
  }

  // ── Badge renderer (HTML string, safe-escaped) ──────────────────────
  // Renders one of three visual states with LOINC/RadLex identifiers.
  function renderBadge(resolved, lang){
    lang = lang === 'ar' ? 'ar' : 'en';
    if (!resolved){
      return `<span class="omr-badge omr-badge-custom" data-tier="custom">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 8v5"/><circle cx="12" cy="17" r=".5" fill="currentColor"/><circle cx="12" cy="12" r="10"/></svg>
        <span>${lang==='ar' ? 'اسم مخصّص — قابلية البحث محدودة' : 'Custom naming — searchability reduced'}</span>
      </span>`;
    }
    const tier = resolved.tier || 'standard';
    const loinc = esc(resolved.loinc || '');
    const rpid  = esc(resolved.rpid  || '');
    const primary = lang === 'ar' ? resolved.ar : resolved.en;
    if (tier === 'standard'){
      return `<span class="omr-badge omr-badge-standard" data-tier="standard">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span class="omr-badge-code">LOINC ${loinc}${rpid ? ' · '+rpid : ''}</span>
        <span class="omr-badge-sep">·</span>
        <span class="omr-badge-name">${esc(primary)}</span>
      </span>`;
    }
    // partial
    const regionLabel = resolved.region ? esc(resolved.region) : '';
    return `<span class="omr-badge omr-badge-partial" data-tier="partial">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 20h20L12 4z"/><path d="M12 10v4M12 17v.5" stroke-linecap="round"/></svg>
      <span>${lang==='ar' ? 'اسم غير قياسي' : 'Non-standard series'}${regionLabel ? ' · '+ (lang==='ar' ? 'المنطقة' : 'Region') +': '+ regionLabel : ''}</span>
    </span>`;
  }

  // ── Code chip (number-free display rule ⑤) ──────────────────────────
  // Name is the hero; the code stays hidden until the ⌗ affordance is
  // hovered/focused (keyboard-accessible), then shows a copyable mono chip.
  //   renderCodeChip('Heart', {system:'LOINC', code:'24553-9', rid:'RID1385'})
  function renderCodeChip(name, opts){
    opts = opts || {};
    const sys  = opts.system || 'LOINC';
    const code = opts.code || '';
    const rid  = opts.rid || '';
    const codeStr = [code ? sys + ' ' + code : '', rid].filter(Boolean).join(' · ');
    if (!codeStr){ return `<span class="omr-term"><span class="omr-term-name">${esc(name)}</span></span>`; }
    const copyVal = esc(code || rid);
    return `<span class="omr-term">`
      + `<span class="omr-term-name">${esc(name)}</span>`
      + `<button type="button" class="omr-code-toggle" aria-label="${esc(name)} — reveal standard code" title="Reveal code" data-copy="${copyVal}">⌗</button>`
      + `<span class="omr-code-chip" role="status">${esc(codeStr)}</span>`
      + `</span>`;
  }

  // Delegated copy-on-click for any [data-copy] chip toggle.
  if (typeof document !== 'undefined'){
    document.addEventListener('click', function(e){
      const t = e.target.closest && e.target.closest('.omr-code-toggle[data-copy]');
      if (!t) return;
      const v = t.getAttribute('data-copy');
      if (v && navigator.clipboard){ navigator.clipboard.writeText(v).catch(()=>{}); t.classList.add('omr-copied'); setTimeout(()=>t.classList.remove('omr-copied'), 1100); }
    });
  }

  // ── Default badge CSS (injected once — override via .omr-badge classes) ─
  const CSS = `
.omr-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:20px;font-size:11.5px;font-family:'IBM Plex Sans','Noto Sans Arabic',sans-serif;font-weight:500;line-height:1;border:1px solid transparent;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.omr-badge svg{flex:none}
.omr-badge-standard{background:rgba(45,212,200,.10);color:#2dd4c8;border-color:rgba(45,212,200,.35)}
.omr-badge-partial{background:rgba(251,191,36,.10);color:#fbbf24;border-color:rgba(251,191,36,.35)}
.omr-badge-custom{background:rgba(148,163,184,.10);color:#94a3b8;border-color:rgba(148,163,184,.30)}
.omr-badge-code{font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.02em;opacity:.95}
.omr-badge-sep{opacity:.35;margin:0 2px}
.omr-badge-name{opacity:.9;overflow:hidden;text-overflow:ellipsis}
.omr-term{display:inline-flex;align-items:center;gap:6px;max-width:100%}
.omr-term-name{overflow:hidden;text-overflow:ellipsis}
.omr-code-toggle{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;padding:0;border:1px solid rgba(148,163,184,.28);border-radius:5px;background:transparent;color:#94a3b8;font-family:'IBM Plex Mono',monospace;font-size:12px;line-height:1;cursor:pointer;opacity:.55;transition:opacity .15s,color .15s,border-color .15s}
.omr-code-toggle:hover,.omr-code-toggle:focus-visible{opacity:1;color:#2dd4c8;border-color:rgba(45,212,200,.5);outline:none}
.omr-code-toggle.omr-copied{color:#34d399;border-color:rgba(52,211,153,.6)}
.omr-code-chip{flex:none;font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.02em;color:#94a3b8;background:rgba(148,163,184,.10);border:1px solid rgba(148,163,184,.22);border-radius:5px;padding:2px 7px;max-width:0;overflow:hidden;white-space:nowrap;opacity:0;transform:translateX(-4px);transition:max-width .22s ease,opacity .18s,transform .18s;pointer-events:none}
.omr-term:hover .omr-code-chip,.omr-term:focus-within .omr-code-chip{max-width:280px;opacity:1;transform:none}
`;
  function injectCss(){
    if (document.getElementById('omr-naming-css')) return;
    const s = document.createElement('style');
    s.id = 'omr-naming-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
  if (typeof document !== 'undefined'){
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', injectCss);
    } else {
      injectCss();
    }
  }

  // ── Public API ──────────────────────────────────────────────────────
  const API = {
    ready: () => readyPromise,
    modalities, regions, bodyPartGroups, bodyParts,
    search, resolve, compose, autoSuggest,
    qualityTier, renderBadge, renderCodeChip
  };

  if (typeof window !== 'undefined') window.OmniRadNaming = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
