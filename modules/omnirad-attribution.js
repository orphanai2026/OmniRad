/* ═══════════════════════════════════════════════════════════════════════════
 * OmniRad — Standards attribution (omnirad-attribution.js)
 * ─────────────────────────────────────────────────────────────────────────
 * Fulfils the attribution required by the terminology licenses OmniRad relies
 * on, and exposes a reusable inline provenance ribbon for individual terms.
 *
 *   • Auto-injects a slim standards strip at the end of <body> once per page
 *     (suppress with <body data-omr-no-standards>).
 *   • OmniRadAttribution.provenance(['LOINC','RadLex','TA2'])  → HTML ribbon
 *   • OmniRadAttribution.sources()                              → source metadata
 *
 * Load AFTER i18n.js (for language) — order-independent otherwise.
 * ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  // Canonical source registry — id → bilingual name, owner, version, url, license.
  var SOURCES = {
    LOINC: {
      abbr:'LOINC®', version:'2.82',
      en:'Logical Observation Identifiers Names and Codes',
      ar:'الأسماء والرموز المنطقية للمشاهدات المخبرية والسريرية',
      owner:'Regenstrief Institute, Inc. & the LOINC Committee',
      url:'https://loinc.org', license:'https://loinc.org/license/',
      note_en:'Radiology procedure naming (LOINC/RSNA Unified Playbook): modality, region imaged, imaging focus.',
      note_ar:'تسمية الإجراءات الإشعاعية (نموذج LOINC/RSNA الموحّد): المودلتي، المنطقة المصوّرة، البؤرة التشريحية.'
    },
    RadLex: {
      abbr:'RadLex®', version:'Playbook',
      en:'RadLex Radiology Lexicon',
      ar:'مُعجم رادلكس الإشعاعي',
      owner:'Radiological Society of North America (RSNA)',
      url:'https://radlex.org', license:'https://www.rsna.org/practice-tools/data-tools/radlex',
      note_en:'RadLex IDs (RID) for anatomical structures and imaging attributes.',
      note_ar:'معرّفات رادلكس (RID) للبنى التشريحية وخصائص التصوير.'
    },
    TA2: {
      abbr:'TA2', version:'IFAA, 2019',
      en:'Terminologia Anatomica (2nd ed.)',
      ar:'المصطلحات التشريحية الدولية (الإصدار الثاني)',
      owner:'Federative International Programme for Anatomical Terminology (FIPAT/IFAA)',
      url:'https://ta2viewer.openanatomy.org', license:'',
      note_en:'Gold-standard anatomical terminology (Latin + English).',
      note_ar:'المرجع الذهبي للمصطلحات التشريحية (اللاتينية + الإنجليزية).'
    },
    DICOM: {
      abbr:'DICOM', version:'PS3.x',
      en:'Digital Imaging and Communications in Medicine',
      ar:'التصوير الرقمي والاتصالات في الطب',
      owner:'NEMA / DICOM Standards Committee',
      url:'https://www.dicomstandard.org', license:'',
      note_en:'CID 4031 anatomic regions; display & pixel conventions.',
      note_ar:'المناطق التشريحية (CID 4031)؛ أعراف العرض والبكسل.'
    },
    WHO: {
      abbr:'WHO UMD', version:'',
      en:'WHO Unified Medical Dictionary (Arabic)',
      ar:'المعجم الطبي الموحّد (منظمة الصحة العالمية)',
      owner:'World Health Organization — EMRO',
      url:'https://www.emro.who.int/entity/umd/', license:'',
      note_en:'Authoritative Arabic medical terminology.',
      note_ar:'المصطلحات الطبية العربية الموثوقة.'
    }
  };

  function L(){ return (window.OmniRadI18n && window.OmniRadI18n.lang === 'ar') ? 'ar' : 'en'; }
  function t(k, fallback){ return (window.OmniRadI18n ? window.OmniRadI18n.t(k) : k) || fallback; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

  // Basic path to attribution page from anywhere under /pages or root.
  function attrHref(){
    var p = location.pathname;
    return /\/pages\//.test(p) ? 'attribution.html' : 'pages/attribution.html';
  }

  // Inline provenance ribbon: stacked source chips for one term.
  function provenance(ids, opts){
    opts = opts || {};
    ids = (ids||[]).filter(function(id){ return SOURCES[id]; });
    if (!ids.length) return '';
    var chips = ids.map(function(id){
      var s = SOURCES[id];
      return '<span class="omr-prov-chip" title="'+esc(s[L()]||s.en)+(s.version?' · '+esc(s.version):'')+'">'+esc(s.abbr)+'</span>';
    }).join('');
    return '<span class="omr-prov" role="note" aria-label="'+esc(t('standards.strip','Terminology standards'))+'">'+chips+'</span>';
  }

  function stripHtml(){
    var lang = L();
    var order = ['LOINC','RadLex','TA2','DICOM'];
    var items = order.map(function(id){
      var s = SOURCES[id];
      return '<span class="omr-std-item"><a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.abbr)+'</a>'+(s.version?' <span class="omr-std-ver">'+esc(s.version)+'</span>':'')+'</span>';
    }).join('<span class="omr-std-dot">·</span>');
    return '<div class="omr-std-inner">'
      + '<span class="omr-std-label">'+esc(t('standards.terminology','Terminology'))+'</span>'
      + '<span class="omr-std-list">'+items+'</span>'
      + '<a class="omr-std-more" href="'+attrHref()+'">'+esc(t('standards.full','Standards & Attribution'))+' →</a>'
      + '</div>';
  }

  var CSS = ''
    + '.omr-std-strip{border-top:1px solid rgba(148,163,184,.14);background:rgba(9,14,18,.55);padding:14px 22px;font-family:"IBM Plex Sans","Noto Sans Arabic",sans-serif;font-size:12px;color:#7c8b98}'
    + '.omr-std-inner{max-width:1400px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:10px}'
    + '.omr-std-label{text-transform:uppercase;letter-spacing:.14em;font-size:10px;color:#5b6b78;font-weight:600}'
    + '.omr-std-list{display:inline-flex;flex-wrap:wrap;align-items:center;gap:8px}'
    + '.omr-std-item a{color:#a7b4c0;text-decoration:none;font-weight:600}'
    + '.omr-std-item a:hover{color:#2dd4c8}'
    + '.omr-std-ver{font-family:"IBM Plex Mono",monospace;font-size:10px;color:#5b6b78}'
    + '.omr-std-dot{opacity:.35}'
    + '.omr-std-more{margin-inline-start:auto;color:#2dd4c8;text-decoration:none;font-weight:600;white-space:nowrap}'
    + '.omr-std-more:hover{text-decoration:underline}'
    + '.omr-prov{display:inline-flex;gap:4px;vertical-align:middle}'
    + '.omr-prov-chip{font-family:"IBM Plex Mono",monospace;font-size:9.5px;letter-spacing:.02em;font-weight:600;color:#7c8b98;background:rgba(148,163,184,.08);border:1px solid rgba(148,163,184,.20);border-radius:4px;padding:2px 5px;line-height:1;cursor:help}';

  function inject(){
    if (document.getElementById('omr-std-css')){ /* css already */ }
    else { var st=document.createElement('style'); st.id='omr-std-css'; st.textContent=CSS; document.head.appendChild(st); }
    if (document.body && document.body.hasAttribute('data-omr-no-standards')) return;
    if (document.getElementById('omr-std-strip')) { rerender(); return; }
    var el = document.createElement('footer');
    el.id = 'omr-std-strip'; el.className = 'omr-std-strip';
    el.innerHTML = stripHtml();
    document.body.appendChild(el);
  }
  function rerender(){ var el=document.getElementById('omr-std-strip'); if(el) el.innerHTML=stripHtml(); }

  if (typeof document !== 'undefined'){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
    else inject();
    window.addEventListener('omnirad-lang', rerender);
  }

  window.OmniRadAttribution = {
    sources: function(){ return SOURCES; },
    provenance: provenance,
    stripHtml: stripHtml,
    LICENSE: (window.OmniRadLoincBridge && window.OmniRadLoincBridge.LICENSE) || ''
  };
})();
