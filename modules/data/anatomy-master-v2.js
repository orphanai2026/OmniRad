/* ═══════════════════════════════════════════════════════════════════════
 *  OmniRad — Anatomy master loader v2
 *  ────────────────────────────────────────────────────────────────────
 *  Reads from Supabase view `anatomical_structures_view` on load,
 *  caches it in sessionStorage for the tab lifetime, and falls back
 *  through this chain:
 *
 *    Supabase view → sessionStorage → snapshot JSON → v1 anatomy-master.js
 *
 *  Never blocks: if Supabase is slow/offline, the fallback resolves
 *  immediately and the v1 vocabulary keeps every page functional.
 *
 *  Public API (backwards-compatible with v1):
 *    window.OMNIRAD_ANATOMY.regions        [{ id, en, ar, order }]
 *    window.OMNIRAD_ANATOMY.structures     [{ id, en, ar, region, parent, rank, aliases[], radlex, ta2 }]
 *    window.OMNIRAD_ANATOMY.byId(id)       → structure or null
 *    window.OMNIRAD_ANATOMY.search(q, lang) → array (matches en/ar/synonyms)
 *    window.OMNIRAD_ANATOMY.ready          → Promise<void>  (resolves when v2 data is in memory)
 *    window.OMNIRAD_ANATOMY.source         → 'supabase' | 'snapshot' | 'v1'
 * ═══════════════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  const SESSION_KEY = 'omnirad.anatomy.v2';
  const SNAPSHOT_URL = new URL('./anatomy-master-v2.snapshot.json',
                        (document.currentScript && document.currentScript.src) || location.href).href;

  // Preserve the v1 payload as the ultimate fallback
  const V1 = window.OMNIRAD_ANATOMY && {
    regions:    [...(window.OMNIRAD_ANATOMY.regions||[])],
    structures: [...(window.OMNIRAD_ANATOMY.structures||[])],
    byId:       window.OMNIRAD_ANATOMY.byId,
    search:     window.OMNIRAD_ANATOMY.search
  };

  // Canonical regions — labels aligned to DICOM CID 4031 + LOINC/RSNA + RadLex (IDs immutable)
  const REGIONS = (V1 && V1.regions.length) ? V1.regions : [
    { id:'head-cns',   en:'Head & Neck',           ar:'الرأس والرقبة',          order:1 },
    { id:'chest',      en:'Chest',                 ar:'الصدر',                  order:2 },
    { id:'cardio',     en:'Cardiovascular System', ar:'الجهاز القلبي الوعائي',  order:3 },
    { id:'abdomen',    en:'Abdomen',            ar:'البطن',                          order:4 },
    { id:'pelvis',     en:'Pelvis',             ar:'الحوض',                          order:5 },
    { id:'spine',      en:'Spine',              ar:'العمود الفقري',                  order:6 },
    { id:'upper-limb', en:'Upper Extremity',    ar:'الطرف العلوي',                   order:7 },
    { id:'lower-limb', en:'Lower Extremity',    ar:'الطرف السفلي',                   order:8 },
    { id:'breast',     en:'Breast',             ar:'الثدي',                          order:9 }
  ];

  const slug = s => String(s||'').toLowerCase().trim()
    .replace(/[^\w\s-]/g,'').replace(/\s+/g,'-').slice(0,64);

  // ── Region label canonicalization (DICOM CID 4031 + LOINC/RSNA + RadLex) ──
  // Radical guard: rewrites ANY legacy region label reaching the loader from
  // ANY source (Supabase view, sessionStorage, snapshot, v1) to the standard
  // term, so no page can ever display a pre-unification label.
  const REGION_CANON = {
    'head & neck / cns':'Head & Neck',
    'head and neck / cns':'Head & Neck',
    'head & neck/cns':'Head & Neck',
    'chest / thorax':'Chest',
    'chest/thorax':'Chest',
    'thorax':'Chest',
    'cardiovascular':'Cardiovascular System',
    'upper limb':'Upper Extremity',
    'lower limb':'Lower Extremity'
  };
  const REGION_CANON_AR = {
    'الرأس والرقبة / الجهاز العصبي':'الرأس والرقبة',
    'الرأس والرقبة / الجهاز العصبي المركزي':'الرأس والرقبة',
    'القلب والأوعية':'الجهاز القلبي الوعائي'
  };
  function canonRegion(v){
    if (!v) return v;
    return REGION_CANON[String(v).toLowerCase().trim()] || v;
  }
  function canonAr(v){
    if (!v) return v;
    return REGION_CANON_AR[String(v).trim()] || v;
  }
  // Apply to every structure row (region field + any label that IS a legacy region)
  function canonicalize(list){
    if (!Array.isArray(list)) return list;
    for (const s of list){
      if (s && s.region) s.region = canonRegion(s.region);
      if (s && s.en)     s.en     = canonRegion(s.en);
      if (s && s.ar)     s.ar     = canonAr(s.ar);
    }
    return list;
  }

  function toV1Shape(row){
    return {
      id:      row.ta2_id ? `ta2-${row.ta2_id.replace(/\./g,'_')}` : slug(row.name_en),
      en:      row.name_en,
      ar:      row.name_ar || row.name_en,
      region:  row.region,
      parent:  row.parent_ta2_id ? `ta2-${row.parent_ta2_id.replace(/\./g,'_')}` : '',
      rank:    row.rank || 'substructure',
      aliases: [...(row.synonyms_en||[]), ...(row.synonyms_ar||[])],
      radlex:  row.radlex_id || null,
      ta2:     row.ta2_id || null,
      needs_review: !!row.needs_review
    };
  }

  function mount(structures, source){
    canonicalize(structures);
    const byId = new Map(structures.map(s => [s.id, s]));

    function search(q, lang){
      const needle = String(q||'').toLowerCase().trim();
      if (!needle) return [];
      const out = [];
      for (const s of structures){
        const hay = [s.en, s.ar, ...(s.aliases||[])].join(' | ').toLowerCase();
        if (hay.includes(needle)) out.push(s);
        if (out.length >= 50) break;
      }
      return out;
    }

    window.OMNIRAD_ANATOMY = {
      regions: REGIONS,
      structures,
      byId: id => byId.get(id) || null,
      search,
      source
    };
    // Notify late listeners (dictionary/atlas sidebars)
    window.dispatchEvent(new CustomEvent('omnirad:anatomy-ready', { detail: { source, count: structures.length }}));
  }

  async function loadFromSupabase(){
    if (!window.supabase || !window.SUPABASE_CLIENT) return null;
    const { data, error } = await window.SUPABASE_CLIENT
      .from('anatomical_structures_view')
      .select('*');
    if (error || !Array.isArray(data) || !data.length) return null;
    return data.map(toV1Shape);
  }

  async function loadSnapshot(){
    try {
      const res = await fetch(SNAPSHOT_URL, { cache: 'force-cache' });
      if (!res.ok) return null;
      const j = await res.json();
      return (j.rows || []).map(toV1Shape);
    } catch { return null; }
  }

  function loadSession(){
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const j = JSON.parse(raw);
      if (!j || !Array.isArray(j.structures) || (Date.now() - j.at) > 30*60*1000) return null;
      return j.structures;
    } catch { return null; }
  }
  function saveSession(structures){
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ at: Date.now(), structures }));
    } catch {}
  }

  // Ready promise
  let resolveReady;
  const readyPromise = new Promise(r => { resolveReady = r; });

  // 1. Immediate: mount v1 fallback so pages render without waiting
  if (V1) mount(V1.structures, 'v1');

  // 2. Session cache (instant, no network)
  const cached = loadSession();
  if (cached && cached.length > (V1?.structures.length || 0)) {
    mount(cached, 'session');
  }

  // 3. Try Supabase → snapshot → keep whatever mounted
  (async () => {
    try {
      let rows = null, source = null;
      // wait a tick for SUPABASE_CLIENT to attach
      for (let i=0; i<20 && !window.SUPABASE_CLIENT; i++) await new Promise(r=>setTimeout(r,50));
      rows = await loadFromSupabase();
      if (rows){ source = 'supabase'; }
      else { rows = await loadSnapshot(); if (rows) source = 'snapshot'; }

      if (rows && rows.length){
        mount(rows, source);
        saveSession(rows);
      }
    } catch (e) {
      console.warn('[anatomy-v2] load failed, staying on fallback:', e?.message);
    } finally {
      resolveReady();
    }
  })();

  // Expose ready promise on the object (also resolves if we stayed on v1)
  Object.defineProperty(window.OMNIRAD_ANATOMY, 'ready', { value: readyPromise, configurable:false });
})();
