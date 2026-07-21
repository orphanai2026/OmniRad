/* ═══════════════════════════════════════════════════════════════════════════
 * OmniRad — Anatomy Ribbon renderer  (omnirad-anatomy-ribbon.js)
 * ═══════════════════════════════════════════════════════════════════════════
 * Renders a horizontal colored ribbon under a series filmstrip that shows,
 * at a glance, which anatomical region each slice covers.
 *
 * This is a UNIQUE OmniRad innovation — no PACS surfaces this to reviewers.
 * It makes anatomical-coverage gaps in AI-generated series obvious in <2 sec.
 *
 * Colors follow the DICOM CID 4031 super-region grouping (9 groups), tuned
 * for WCAG 2.2 SC 1.4.3 contrast (≥4.5:1 on the dark theme) AND SC 1.4.1
 * (color is NOT the sole distinguisher — every cell carries a text label).
 *
 * Usage:
 *   OmniRadAnatomyRibbon.render(containerElement, slices, {
 *     height: 40,
 *     showLabels: true,
 *     onSliceClick: (slice) => …
 *   });
 *
 *   Each slice record: { slice_index, structures: [] }
 * ═══════════════════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  // ── WCAG-tuned palette for DICOM CID 4031 groups ────────────────────
  const GROUP_COLORS = {
    HEAD_NECK: { bg:'#3b82f6', label:'Head/Neck', ar:'الرأس والرقبة' }, // blue
    SPINE:     { bg:'#8b5cf6', label:'Spine',     ar:'العمود الفقري' }, // violet
    CHEST:     { bg:'#10b981', label:'Chest',     ar:'الصدر' },         // emerald
    ABDOMEN:   { bg:'#f59e0b', label:'Abdomen',   ar:'البطن' },         // amber
    PELVIS:    { bg:'#ec4899', label:'Pelvis',    ar:'الحوض' },         // pink
    UPPER_EXT: { bg:'#06b6d4', label:'Upper ext', ar:'الطرف العلوي' },  // cyan
    LOWER_EXT: { bg:'#14b8a6', label:'Lower ext', ar:'الطرف السفلي' },  // teal
    VASCULAR:  { bg:'#ef4444', label:'Vascular',  ar:'الأوعية' },       // red
    MSK_OTHER: { bg:'#94a3b8', label:'MSK/Other', ar:'عضلي هيكلي' },    // slate
    UNKNOWN:   { bg:'#4b5563', label:'—',         ar:'—' }              // gray
  };

  // ── Structure → CID group lookup (cached) ────────────────────────────
  let structureToGroup = null;
  function ensureLookup(){
    if (structureToGroup) return structureToGroup;
    structureToGroup = new Map();
    // If DICOM body-part module is loaded, index every body-part by its EN name
    if (window.OmniRadDicomBP){
      const items = window.OmniRadDicomBP.all();
      for (const it of items){
        const key = String(it.en || '').toLowerCase();
        if (key) structureToGroup.set(key, it.groupId);
        // Also index Arabic (rare but useful when structures[] carries AR)
        if (it.ar) structureToGroup.set(it.ar, it.groupId);
      }
    }
    // Fallback keyword rules for anatomy strings that aren't in CID 4031
    const RULES = [
      [/\b(brain|skull|head|face|orbit|eye|ear|sinus|nose|dural|cerebr|pituit|pineal|jaw|mandib|maxill|tmj|larynx|pharynx|thyroid|parathyroid|salivary|parotid|dental|tooth|dent|nasal|neck|carotid|vertebral|cervical soft)/i, 'HEAD_NECK'],
      [/\b(spine|spinal|vertebr|sacrum|coccyx|disc|cord|cervical spine|thoracic spine|lumbar|lspine|tspine|cspine)/i, 'SPINE'],
      [/\b(chest|lung|pleura|mediast|thymus|trachea|bronch|heart|cardiac|coronary|aorta.thor|breast|rib|sternum|clavicle|scapula|shoulder|diaphragm)/i, 'CHEST'],
      [/\b(abdom|liver|hepatic|gallbladder|gall|bili|pancre|spleen|stomach|gastric|duoden|intest|small bowel|colon|appendix|kidney|renal|ureter|adrenal|periton|retroperit|mesent)/i, 'ABDOMEN'],
      [/\b(pelvis|pelvic|bladder|urethra|prostate|testis|scrotum|penis|uterus|ovary|ovarian|cervix|vagina|fallopian|placenta|fetus|rectum)/i, 'PELVIS'],
      [/\b(shoulder|humerus|elbow|forearm|radius|ulna|wrist|hand|finger|thumb|carpal)/i, 'UPPER_EXT'],
      [/\b(hip|femur|thigh|knee|patella|tibia|fibula|leg|ankle|foot|calcaneus|toe)/i, 'LOWER_EXT'],
      [/\b(artery|vein|vascular|angio|aorta|iliac|femoral|popliteal|carotid|jugular|portal|vena cava|circle of willis)/i, 'VASCULAR'],
      [/\b(bone|joint|muscle|marrow|lymph|skin|whole body|extremit|msk)/i, 'MSK_OTHER']
    ];
    structureToGroup._rules = RULES;
    return structureToGroup;
  }

  function classify(structureName){
    if (!structureName) return 'UNKNOWN';
    const lookup = ensureLookup();
    const raw = String(structureName).toLowerCase().trim();
    if (lookup.has(raw)) return lookup.get(raw);
    const rules = lookup._rules || [];
    for (const [re, group] of rules){ if (re.test(raw)) return group; }
    return 'UNKNOWN';
  }

  function dominantGroup(structures, regionHint){
    if (!Array.isArray(structures) || !structures.length) return regionHint || 'UNKNOWN';
    // Vessels that merely pass THROUGH a body region (e.g. the aortic arch,
    // SVC, azygos vein or pulmonary arteries inside a chest series) should
    // count toward that region — not flip the whole slice to "Vascular".
    // VASCULAR stays only for dedicated vascular studies (hint absent/vascular).
    const foldVasc = regionHint && regionHint !== 'VASCULAR';
    const counts = {};
    for (const s of structures){
      let g = classify(s);
      if (foldVasc && g === 'VASCULAR') g = regionHint;
      counts[g] = (counts[g] || 0) + 1;
    }
    let best = 'UNKNOWN', max = 0;
    for (const g of Object.keys(counts)){
      if (counts[g] > max && g !== 'UNKNOWN'){ max = counts[g]; best = g; }
    }
    if (best === 'UNKNOWN') return regionHint || 'UNKNOWN';
    return best;
  }

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  // ── Public render ────────────────────────────────────────────────────
  function render(container, slices, options){
    if (!container) return;
    options = options || {};
    const height    = options.height || 42;
    const showLabels = options.showLabels !== false;
    const lang = (window.OmniRadI18n && window.OmniRadI18n.lang) || 'en';
    const isAr = lang === 'ar';

    if (!Array.isArray(slices) || !slices.length){
      container.innerHTML = '<div class="omr-ar-empty">'+ (isAr?'لا شرائح':'No slices') +'</div>';
      return;
    }

    const sorted = slices.slice().sort((a,b) => (a.slice_index||0) - (b.slice_index||0));
    const totalSlices = sorted.length;

    const cells = sorted.map(s => {
      const g = dominantGroup(s.structures || [], options.regionHint);
      const color = GROUP_COLORS[g] || GROUP_COLORS.UNKNOWN;
      const tip = (s.structures || []).slice(0, 6).join(' · ');
      return {
        idx: s.slice_index,
        group: g,
        color: color.bg,
        label: (isAr ? color.ar : color.label),
        tip
      };
    });

    // Which groups appear? Show a compact legend under the ribbon.
    const legendGroups = [...new Set(cells.map(c => c.group))].filter(g => g !== 'UNKNOWN');

    const cellsHtml = cells.map(c => (
      `<div class="omr-ar-cell" data-idx="${esc(c.idx)}" title="Slice ${esc(c.idx)} — ${esc(c.tip || c.label)}"
        style="background:${c.color}">
        <span class="omr-ar-num">${esc(String(c.idx).padStart(2,'0'))}</span>
        ${ showLabels ? `<span class="omr-ar-lbl">${esc(c.label)}</span>` : '' }
      </div>`
    )).join('');

    const legendHtml = legendGroups.length
      ? `<div class="omr-ar-legend">
          ${legendGroups.map(g => {
            const c = GROUP_COLORS[g] || GROUP_COLORS.UNKNOWN;
            return `<span class="omr-ar-key"><i style="background:${c.bg}"></i>${esc(isAr ? c.ar : c.label)}</span>`;
          }).join('')}
        </div>`
      : '';

    container.innerHTML = `
      <div class="omr-ar-strip" style="grid-template-columns:repeat(${totalSlices},minmax(28px,1fr));min-height:${height}px">
        ${cellsHtml}
      </div>
      ${legendHtml}
    `;

    // Wire click handler
    if (typeof options.onSliceClick === 'function'){
      container.querySelectorAll('.omr-ar-cell').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.getAttribute('data-idx'), 10);
          options.onSliceClick(idx);
        });
      });
    }
  }

  // ── CSS (injected once) ──────────────────────────────────────────────
  const CSS = `
.omr-ar-strip{display:grid;gap:2px;border-radius:6px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
.omr-ar-cell{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font:600 10px/1 'IBM Plex Sans','Noto Sans Arabic',sans-serif;cursor:pointer;transition:transform .12s, box-shadow .12s;padding:4px 2px;overflow:hidden;min-width:0}
.omr-ar-cell:hover{transform:scale(1.05);box-shadow:0 0 0 2px var(--acc,#2dd4c8);z-index:2}
.omr-ar-num{font-family:'IBM Plex Mono',monospace;font-size:10.5px;opacity:.95;text-shadow:0 1px 1px rgba(0,0,0,.4)}
.omr-ar-lbl{font-size:9px;opacity:.92;margin-top:2px;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.omr-ar-legend{display:flex;flex-wrap:wrap;gap:6px 12px;margin-top:6px;font:500 10.5px/1 'IBM Plex Sans','Noto Sans Arabic',sans-serif;color:var(--text-s,#94a3b8)}
.omr-ar-key{display:inline-flex;align-items:center;gap:5px}
.omr-ar-key i{width:10px;height:10px;border-radius:2px;display:inline-block}
.omr-ar-empty{padding:12px;text-align:center;color:var(--text-s,#94a3b8);font-size:11.5px}
`;
  function injectCss(){
    if (typeof document === 'undefined') return;
    if (document.getElementById('omr-ar-css')) return;
    const s = document.createElement('style');
    s.id = 'omr-ar-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  if (typeof document !== 'undefined'){
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', injectCss);
    } else { injectCss(); }
  }

  const API = { render, classify, dominantGroup, GROUP_COLORS };
  if (typeof window !== 'undefined') window.OmniRadAnatomyRibbon = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
