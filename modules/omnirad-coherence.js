/* ═══════════════════════════════════════════════════════════════════════════
 * OmniRad — AI Coherence Scorer  (omnirad-coherence.js)
 * ═══════════════════════════════════════════════════════════════════════════
 * Layer-1 (automated) quality check for a series of slices.
 *
 * Inputs  : an array of slice records with fields
 *           { slice_index, modality, plane, sequence, structures[] }
 * Output  : {
 *             score:      0..100                     ← weighted average
 *             tier:       'green' | 'yellow' | 'red' ← ≥90 / 70-89 / <70
 *             outliers:   [slice_index, …]           ← slices flagged by any layer
 *             layers: {
 *               modality: { pass, dominant, mismatches: [slice_index…] }
 *               plane:    { pass, dominant, mismatches }
 *               sequence: { pass, gaps: [{after, before}], duplicates: [idx…] }
 *               anatomy:  { pass, overlap: 0..1, transitions: N }
 *             }
 *           }
 *
 * Standards referenced:
 *   – DICOM PS3.3 §C.7.6.1 (Image Pixel Module — series consistency)
 *   – RSNA AI Validation Framework 2024
 *   – IHE Basic Image Review (BIR) validation checks
 * ═══════════════════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  // ── Layer weights (must sum to 1.0) ──────────────────────────────────
  const WEIGHTS = {
    modality: 0.35,   // heaviest — modality mismatch is unforgivable
    plane:    0.25,
    sequence: 0.20,
    anatomy:  0.20
  };

  function mode(arr){
    const counts = {};
    for (const v of arr){ if (v != null && v !== '') counts[v] = (counts[v]||0) + 1; }
    let best = null, max = 0;
    for (const k of Object.keys(counts)){
      if (counts[k] > max){ max = counts[k]; best = k; }
    }
    return { value: best, count: max, counts };
  }

  // ── Layer A — Modality ──────────────────────────────────────────────
  function checkModality(slices){
    const values = slices.map(s => s.modality || null);
    const m = mode(values);
    const mismatches = slices
      .filter(s => (s.modality || null) !== m.value)
      .map(s => s.slice_index);
    const total = slices.length;
    const conform = total - mismatches.length;
    const pct = total ? (conform / total) : 0;
    return {
      pass: mismatches.length === 0,
      dominant: m.value,
      mismatches,
      pct
    };
  }

  // ── Layer B — Plane ─────────────────────────────────────────────────
  function checkPlane(slices){
    const values = slices.map(s => s.plane || null);
    const m = mode(values);
    const mismatches = slices
      .filter(s => (s.plane || null) !== m.value)
      .map(s => s.slice_index);
    const total = slices.length;
    const conform = total - mismatches.length;
    const pct = total ? (conform / total) : 0;
    return { pass: mismatches.length === 0, dominant: m.value, mismatches, pct };
  }

  // ── Layer C — Sequential coherence (no gaps / duplicates) ────────────
  function checkSequence(slices){
    const idxs = slices
      .map(s => s.slice_index)
      .filter(i => typeof i === 'number')
      .sort((a,b) => a - b);
    if (!idxs.length) return { pass: false, gaps: [], duplicates: [], pct: 0 };
    const gaps = [], seen = new Set(), duplicates = [];
    for (let i = 0; i < idxs.length; i++){
      if (seen.has(idxs[i])) duplicates.push(idxs[i]);
      seen.add(idxs[i]);
      if (i > 0){
        const prev = idxs[i-1];
        if (idxs[i] - prev > 1){ gaps.push({ after: prev, before: idxs[i] }); }
      }
    }
    // Expected count = max - min + 1; pct = actual unique / expected
    const min = idxs[0], max = idxs[idxs.length - 1];
    const expected = max - min + 1;
    const unique = seen.size;
    const pct = expected ? Math.min(1, unique / expected) : 0;
    return {
      pass: gaps.length === 0 && duplicates.length === 0,
      gaps, duplicates, pct
    };
  }

  // ── Layer D — Anatomical continuity ─────────────────────────────────
  // Anatomically-adjacent slices should share ≥1 structure (typical for
  // 5mm slices through the same organ). Isolated slices with no overlap
  // to any neighbor are marked as outliers.
  function checkAnatomy(slices){
    const sorted = slices
      .slice()
      .sort((a,b) => (a.slice_index||0) - (b.slice_index||0));
    if (sorted.length < 2){
      return { pass: true, overlap: 1, transitions: 0, isolates: [] };
    }
    let overlapSum = 0, transitions = 0;
    const isolates = [];
    for (let i = 0; i < sorted.length; i++){
      const cur = new Set(sorted[i].structures || []);
      let touched = false;
      if (i > 0){
        const prev = new Set(sorted[i-1].structures || []);
        const shared = [...cur].filter(x => prev.has(x)).length;
        if (shared > 0){ touched = true; overlapSum += 1; }
        transitions++;
      }
      if (i < sorted.length - 1){
        const nxt = new Set(sorted[i+1].structures || []);
        const shared = [...cur].filter(x => nxt.has(x)).length;
        if (shared > 0) touched = true;
      }
      if (!touched && cur.size > 0) isolates.push(sorted[i].slice_index);
    }
    const overlap = transitions ? (overlapSum / transitions) : 1;
    return {
      pass: overlap >= 0.5 && isolates.length === 0,
      overlap,
      transitions,
      isolates
    };
  }

  // ── Combined score ───────────────────────────────────────────────────
  function score(slices){
    if (!Array.isArray(slices) || !slices.length){
      return { score: 0, tier: 'red', outliers: [], layers: {} };
    }
    const modality = checkModality(slices);
    const plane    = checkPlane(slices);
    const sequence = checkSequence(slices);
    const anatomy  = checkAnatomy(slices);

    const weighted =
      modality.pct * WEIGHTS.modality +
      plane.pct    * WEIGHTS.plane +
      sequence.pct * WEIGHTS.sequence +
      anatomy.overlap * WEIGHTS.anatomy;
    const s = Math.round(weighted * 100);

    const tier = s >= 90 ? 'green' : (s >= 70 ? 'yellow' : 'red');

    const outliers = [...new Set([
      ...(modality.mismatches || []),
      ...(plane.mismatches || []),
      ...(anatomy.isolates || []),
      ...(sequence.duplicates || [])
    ])].sort((a,b) => a - b);

    return { score: s, tier, outliers, layers: { modality, plane, sequence, anatomy } };
  }

  // ── HTML badge renderer ──────────────────────────────────────────────
  function renderBadge(result, lang){
    lang = lang === 'ar' ? 'ar' : 'en';
    if (!result || result.score == null){
      return '<span class="omr-coh omr-coh-none">' +
        (lang==='ar' ? 'لا يوجد تحقّق' : 'No coherence data') +
        '</span>';
    }
    const { score, tier, outliers } = result;
    const icon = tier === 'green' ? '🟢' : (tier === 'yellow' ? '🟡' : '🔴');
    const label = lang === 'ar'
      ? `اتّساق ${score}% · ${outliers.length ? outliers.length + ' شذوذ' : 'لا شذوذ'}`
      : `${score}% coherent · ${outliers.length ? outliers.length + ' outlier' + (outliers.length===1?'':'s') : 'no outliers'}`;
    const outText = outliers.length
      ? (lang==='ar' ? ' — شرائح ' : ' — slice ') + outliers.join(', ')
      : '';
    return `<span class="omr-coh omr-coh-${tier}" title="${label}${outText}">${icon} <b>${score}%</b> · ${outliers.length ? outliers.length + (lang==='ar'?' شذوذ':(outliers.length===1?' outlier':' outliers')) : (lang==='ar'?'اتّساق كامل':'coherent')}</span>`;
  }

  // ── Default CSS (injected once) ─────────────────────────────────────
  const CSS = `
.omr-coh{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:12px;font:600 11px/1 'IBM Plex Sans','Noto Sans Arabic',sans-serif;letter-spacing:.01em;border:1px solid transparent;white-space:nowrap}
.omr-coh b{font-weight:700}
.omr-coh-green{color:#10b981;background:rgba(16,185,129,.10);border-color:rgba(16,185,129,.35)}
.omr-coh-yellow{color:#f59e0b;background:rgba(245,158,11,.10);border-color:rgba(245,158,11,.35)}
.omr-coh-red{color:#ef4444;background:rgba(239,68,68,.10);border-color:rgba(239,68,68,.35)}
.omr-coh-none{color:var(--text-m,#94a3b8);background:transparent;border:1px dashed currentColor}
`;
  function injectCss(){
    if (typeof document === 'undefined') return;
    if (document.getElementById('omr-coherence-css')) return;
    const s = document.createElement('style');
    s.id = 'omr-coherence-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  if (typeof document !== 'undefined'){
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', injectCss);
    } else { injectCss(); }
  }

  const API = { score, renderBadge, WEIGHTS };
  if (typeof window !== 'undefined') window.OmniRadCoherence = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
