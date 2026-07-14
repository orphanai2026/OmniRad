#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
 *  OmniRad — Anatomy v2 build pipeline
 *  ────────────────────────────────────────────────────────────────────
 *  Produces:  supabase/anatomy-v2-seed.sql
 *             omnirad-redesign/modules/data/anatomy-master-v2.snapshot.json
 *
 *  Sources (in order of trust):
 *    1. TA2 skeleton         — OpenAnatomy TA2 JSON
 *       https://ta2viewer.openanatomy.org/data/ta2.json
 *    2. RadLex mapping       — RadLex OWL dump (local)
 *       download once from RSNA: RadLex.owl → put in ./cache/RadLex.owl
 *    3. Arabic ground truth  — anatomy-master.js (250 curated pairs)
 *    4. Arabic auto-fill     — Wikidata SPARQL (label@ar for Q-item)
 *
 *  Usage:
 *    cd omnirad-redesign/scripts
 *    node build-anatomy-v2.mjs                # full run
 *    node build-anatomy-v2.mjs --dry          # no writes, print stats
 *    node build-anatomy-v2.mjs --skip-wikidata --skip-radlex
 *
 *  Requires:  Node 20+ (native fetch), no external deps.
 *  Rate limits observed:
 *    Wikidata: max 3 req/s, User-Agent header required
 *    BioPortal fallback for RadLex: 15 req/s (needs API key in env)
 * ═══════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '../..');
const CACHE_DIR = path.join(__dirname, 'cache');
const OUT_SQL   = path.join(ROOT, 'supabase/anatomy-v2-seed.sql');
const OUT_SNAP  = path.join(ROOT, 'omnirad-redesign/modules/data/anatomy-master-v2.snapshot.json');
const SEED_JS   = path.join(ROOT, 'omnirad-redesign/modules/data/anatomy-master.js');

const args = new Set(process.argv.slice(2));
const DRY          = args.has('--dry');
const SKIP_RADLEX  = args.has('--skip-radlex');
const SKIP_WIKI    = args.has('--skip-wikidata');
const V1_ONLY      = args.has('--v1-only');  // Bypass all external fetching except BioPortal RadLex

const UA = 'OmniRad-Anatomy-Builder/1.0 (contact: omniradai@gmail.com)';
const BIOPORTAL_API_KEY = process.env.BIOPORTAL_API_KEY || '1ad6cd52-5d72-4666-a11e-16bbcda0f252';

// ─── TA2 region mapping (openanatomy chapter → OmniRad region) ─────────
const REGION_MAP = {
  'A14': 'head-cns',     // nervous system
  'A15': 'head-cns',     // sense organs
  'A05': 'chest',        // digestive: only mediastinal parts
  'A06': 'chest',        // respiratory
  'A12': 'cardio',       // cardiovascular
  'A13': 'cardio',       // lymph
  'A05.5': 'abdomen',    // stomach/intestines
  'A05.8': 'abdomen',    // accessory digestive (liver/pancreas)
  'A08':   'abdomen',    // urinary — kidneys/upper
  'A09':   'pelvis',     // genital
  'A08.3': 'pelvis',     // bladder
  'A02.2': 'spine',      // vertebral column
  'A02.4': 'upper-limb',
  'A02.5': 'lower-limb',
};

const RADIOLOGY_RELEVANT_KEYWORDS = [
  // include
  'brain','cortex','lobe','nucleus','ventricle','sulcus','gyrus','cistern',
  'lung','lobe','bronch','pleura','mediastin','trachea',
  'heart','ventricle','atrium','valve','aorta','vena','coronary','pulmonary',
  'liver','pancreas','spleen','gallbladder','kidney','adrenal','ureter',
  'stomach','duodenum','jejunum','ileum','colon','rectum','appendix',
  'bladder','uterus','ovary','prostate','testis','vagina',
  'vertebra','disc','sacrum','coccyx','spinal cord',
  'humerus','radius','ulna','carpal','metacarpal','phalanx','shoulder','elbow','wrist',
  'femur','tibia','fibula','patella','tarsal','metatarsal','hip','knee','ankle',
  'breast','nipple','areola','duct',
  'artery','vein','lymph','node',
  'muscle','tendon','ligament','fascia','bursa',
  'sinus','nasopharynx','oropharynx','larynx','thyroid','parathyroid',
  'orbit','globe','optic','cochlea','labyrinth','mastoid',
];

// Exclude microscopic / non-imageable
const EXCLUDE_KEYWORDS = [
  'lamina','fibre','fiber','protein','peptide','hormone','receptor',
  'cell','cellular','molecule','villus','crypt','stereocilium','microvillus',
];

// ─── Small helpers ─────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));
const sqlEsc = s => s == null ? 'NULL' : `'${String(s).replace(/'/g,"''")}'`;
const sqlArr = a => !a || !a.length ? "'{}'" :
  `ARRAY[${a.map(x=>`'${String(x).replace(/'/g,"''")}'`).join(',')}]::text[]`;

async function ensureDir(p){ await fs.mkdir(p, {recursive:true}); }

async function fetchCached(url, filename, {json=true, headers={}}={}){
  const cachePath = path.join(CACHE_DIR, filename);
  try {
    const buf = await fs.readFile(cachePath);
    return json ? JSON.parse(buf.toString('utf8')) : buf.toString('utf8');
  } catch {}
  console.log(`  → fetching ${url}`);
  const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const text = await res.text();
  await fs.writeFile(cachePath, text);
  return json ? JSON.parse(text) : text;
}

// ─── 1. TA2 skeleton ──────────────────────────────────────────────────
async function loadTA2(){
  console.log('▸ Loading TA2 (OpenAnatomy)…');
  const url = 'https://ta2viewer.openanatomy.org/data/ta2.json';
  let data;
  try { data = await fetchCached(url, 'ta2.json'); }
  catch (e) {
    console.error('  ✗ TA2 fetch failed:', e.message);
    console.error('    Manual fallback: download the JSON to scripts/cache/ta2.json and re-run.');
    process.exit(1);
  }

  // Flatten hierarchy
  const flat = [];
  const walk = (node, parentId=null) => {
    if (!node) return;
    const items = Array.isArray(node) ? node : [node];
    for (const n of items) {
      const id    = n.id || n.ta2_id || n.code;
      const en    = (n.en || n.name_en || n.english || '').trim();
      const latin = (n.latin || n.la || n.name_la || '').trim();
      if (id && (en || latin)) {
        flat.push({ ta2_id:id, ta2_latin:latin, name_en:en||latin, parent_ta2_id:parentId });
      }
      if (n.children?.length) walk(n.children, id || parentId);
    }
  };
  walk(data);

  // Filter to radiology-relevant granularity
  const lowerHay = s => (s||'').toLowerCase();
  const filtered = flat.filter(r => {
    const hay = `${lowerHay(r.name_en)} ${lowerHay(r.ta2_latin)}`;
    if (EXCLUDE_KEYWORDS.some(k => hay.includes(k))) return false;
    return RADIOLOGY_RELEVANT_KEYWORDS.some(k => hay.includes(k));
  });

  console.log(`  ✓ TA2 loaded: ${flat.length} nodes → ${filtered.length} radiology-relevant`);

  // Assign region
  for (const r of filtered) {
    r.region = 'head-cns'; // default
    for (const [prefix, region] of Object.entries(REGION_MAP)) {
      if (r.ta2_id?.startsWith(prefix)) { r.region = region; break; }
    }
    r.rank = 'substructure';
  }
  return filtered;
}

// ─── 2. RadLex mapping (OWL local  →  BioPortal REST fallback) ────────
async function loadRadLexMap(){
  if (SKIP_RADLEX) { console.log('▸ RadLex: skipped (--skip-radlex)'); return new Map(); }

  // Option 1 — local OWL file (if user downloaded it from RSNA)
  const owlPath = path.join(CACHE_DIR, 'RadLex.owl');
  try {
    await fs.access(owlPath);
    console.log('▸ Parsing RadLex OWL (local)…');
    const owl = await fs.readFile(owlPath, 'utf8');
    const map = new Map();
    const re = /<owl:Class rdf:about="[^"]*#(RID\d+)">[\s\S]*?<rdfs:label[^>]*>([^<]+)<\/rdfs:label>/g;
    let m;
    while ((m = re.exec(owl))){
      map.set(m[2].trim().toLowerCase(), m[1]);
    }
    console.log(`  ✓ RadLex (OWL): ${map.size} label→RID pairs`);
    return map;
  } catch {}

  // Option 2 — cached NCBO/BioPortal CSV
  const csvPath = path.join(CACHE_DIR, 'radlex.csv');
  try {
    await fs.access(csvPath);
    console.log('▸ Parsing RadLex CSV (cached)…');
    const csv = await fs.readFile(csvPath, 'utf8');
    const map = new Map();
    for (const line of csv.split('\n')){
      // BioPortal CSV: "Class ID","Preferred Label","Synonyms",…
      const m2 = line.match(/RID(\d+)[^,]*","([^"]+)"/);
      if (m2) map.set(m2[2].trim().toLowerCase(), 'RID'+m2[1]);
    }
    console.log(`  ✓ RadLex (CSV): ${map.size} label→RID pairs`);
    return map;
  } catch {}

  console.warn('  ⚠ No RadLex bulk file found — will try BioPortal REST search per label.');
  return new Map();
}

// ─── 2b. RadLex via BioPortal REST search ─────────────────────────────
async function fetchRadLexByLabels(labels){
  if (SKIP_RADLEX || !BIOPORTAL_API_KEY) return new Map();
  console.log(`▸ Fetching RadLex IDs from BioPortal for ${labels.length} labels…`);
  const map = new Map();
  let done = 0;
  for (const label of labels){
    const url = `https://data.bioontology.org/search?q=${encodeURIComponent(label)}`
              + `&ontologies=RADLEX&require_exact_match=true&pagesize=1`
              + `&apikey=${BIOPORTAL_API_KEY}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept:'application/json' }});
      if (res.ok){
        const j = await res.json();
        const hit = j.collection && j.collection[0];
        if (hit && hit['@id']){
          const rid = (hit['@id'].match(/RID\d+/) || [])[0];
          if (rid) map.set(label.toLowerCase(), rid);
        }
      }
    } catch {}
    done++;
    if (done % 100 === 0) console.log(`    … ${done}/${labels.length}  (matched ${map.size})`);
    await sleep(80);
  }
  console.log(`  ✓ BioPortal RadLex: matched ${map.size}/${labels.length}`);
  return map;
}

// ─── 3. Arabic seed (v1 curated) ──────────────────────────────────────
async function loadArabicSeed(){
  console.log('▸ Loading Arabic seed (v1 curated)…');
  const src = await fs.readFile(SEED_JS, 'utf8');
  // Extract { en:'…', ar:'…' } pairs from the STRUCTURES array
  const map = new Map();
  const re = /en:\s*'([^']+)'[^}]*?ar:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src))){
    map.set(m[1].trim().toLowerCase(), m[2].trim());
  }
  console.log(`  ✓ Arabic seed: ${map.size} pairs`);
  return map;
}

// ─── 3b. Full v1 structures loader (--v1-only mode) ───────────────────
async function loadV1Structures(){
  console.log('▸ Loading v1 STRUCTURES array (curated, ~250 entries)…');
  const src = await fs.readFile(SEED_JS, 'utf8');
  const rows = [];
  const re = /\{\s*id:\s*'([^']+)'[\s\S]*?en:\s*'([^']+)'[\s\S]*?ar:\s*'([^']+)'[\s\S]*?region:\s*'([^']+)'[\s\S]*?parent:\s*'([^']*)'[\s\S]*?rank:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src))){
    const [, id, en, ar, region, parent, rank] = m;
    rows.push({
      ta2_id:        `v1-${id}`,
      ta2_latin:     null,
      name_en:       en,
      parent_ta2_id: parent ? `v1-${parent}` : null,
      region,
      rank,
      _v1_ar:        ar
    });
  }
  console.log(`  ✓ v1 structures: ${rows.length} loaded`);
  return rows;
}

// ─── 4. Wikidata Arabic labels ────────────────────────────────────────
async function fetchWikidataArabic(names){
  if (SKIP_WIKI) return new Map();
  console.log(`▸ Fetching Arabic labels from Wikidata for ${names.length} terms…`);
  const results = new Map();
  const chunk = 40; // SPARQL VALUES batch
  for (let i=0; i<names.length; i += chunk){
    const batch = names.slice(i, i+chunk);
    const values = batch.map(n => `"${n.replace(/"/g,'\\"')}"@en`).join(' ');
    const query = `
      SELECT ?label ?arLabel WHERE {
        VALUES ?label { ${values} }
        ?item rdfs:label ?label .
        ?item rdfs:label ?arLabel .
        FILTER(LANG(?arLabel) = "ar")
      }`;
    const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept:'application/sparql-results+json' }});
      if (!res.ok){ console.warn(`    ⚠ Wikidata HTTP ${res.status}, batch ${i}`); continue; }
      const j = await res.json();
      for (const row of j.results.bindings){
        results.set(row.label.value.toLowerCase(), row.arLabel.value);
      }
    } catch(e){ console.warn(`    ⚠ Wikidata batch ${i} failed: ${e.message}`); }
    await sleep(500); // polite pacing
    if (i % 200 === 0) console.log(`    … ${i}/${names.length}`);
  }
  console.log(`  ✓ Wikidata: matched ${results.size}/${names.length}`);
  return results;
}

// ─── 5. Merge + emit ──────────────────────────────────────────────────
function merge({ ta2, radlex, arSeed, arWiki }){
  const out = [];
  for (const r of ta2){
    const keyEn = r.name_en.toLowerCase();
    const rid   = radlex.get(keyEn) || radlex.get(r.ta2_latin?.toLowerCase() || '');
    let name_ar = arSeed.get(keyEn);
    let ar_source = name_ar ? 'seed' : null;
    if (!name_ar){
      name_ar = arWiki.get(keyEn);
      if (name_ar) ar_source = 'wikidata';
    }
    out.push({
      ta2_id:       r.ta2_id,
      ta2_latin:    r.ta2_latin || null,
      radlex_id:    rid || null,
      name_en:      r.name_en,
      name_ar:      name_ar || null,
      synonyms_en:  [],
      synonyms_ar:  [],
      region:       r.region,
      system:       null,
      parent_ta2_id:r.parent_ta2_id || null,
      rank:         r.rank,
      modalities:   [],
      common_planes:[],
      ar_source,
      needs_review: !name_ar || ar_source === 'wikidata',
      source_dump:  'openanatomy-ta2-2024',
    });
  }
  return out;
}

function emitSQL(rows){
  const header = `-- Auto-generated by build-anatomy-v2.mjs on ${new Date().toISOString()}
-- Do not edit by hand. Regenerate via: node build-anatomy-v2.mjs
-- Insert count: ${rows.length}

begin;
truncate public.anatomical_structures restart identity;
insert into public.anatomical_structures
  (ta2_id, ta2_latin, radlex_id, name_en, name_ar,
   synonyms_en, synonyms_ar, region, system, parent_ta2_id, rank,
   modalities, common_planes, ar_source, needs_review, source_dump)
values
`;
  const values = rows.map(r =>
    `(${sqlEsc(r.ta2_id)}, ${sqlEsc(r.ta2_latin)}, ${sqlEsc(r.radlex_id)}, ` +
    `${sqlEsc(r.name_en)}, ${sqlEsc(r.name_ar)}, ` +
    `${sqlArr(r.synonyms_en)}, ${sqlArr(r.synonyms_ar)}, ` +
    `${sqlEsc(r.region)}, ${sqlEsc(r.system)}, ${sqlEsc(r.parent_ta2_id)}, ${sqlEsc(r.rank)}, ` +
    `${sqlArr(r.modalities)}, ${sqlArr(r.common_planes)}, ` +
    `${sqlEsc(r.ar_source)}, ${r.needs_review}, ${sqlEsc(r.source_dump)})`
  ).join(',\n');
  return header + values + ';\n\ncommit;\n' +
    '\nselect * from public.anatomy_v2_stats();\n';
}

// ─── main ─────────────────────────────────────────────────────────────
async function main(){
  await ensureDir(CACHE_DIR);

  // ── V1-ONLY mode: skip TA2 fetch + Wikidata; just v1 + optional BioPortal RadLex ──
  if (V1_ONLY){
    console.log('▸ V1-ONLY mode: no TA2 fetch, no Wikidata. Using local v1 vocabulary.\n');
    const v1 = await loadV1Structures();
    let radlex = new Map();
    if (!SKIP_RADLEX && BIOPORTAL_API_KEY){
      radlex = await fetchRadLexByLabels(v1.map(r => r.name_en));
    }
    const rows = v1.map(r => ({
      ta2_id:        r.ta2_id,
      ta2_latin:     null,
      radlex_id:     radlex.get(r.name_en.toLowerCase()) || null,
      name_en:       r.name_en,
      name_ar:       r._v1_ar,
      synonyms_en:   [],
      synonyms_ar:   [],
      region:        r.region,
      system:        null,
      parent_ta2_id: r.parent_ta2_id,
      rank:          r.rank,
      modalities:    [],
      common_planes: [],
      ar_source:     'seed',
      needs_review:  false,
      source_dump:   'v1-curated-2026',
    }));

    const stats = {
      total: rows.length,
      with_radlex: rows.filter(r=>r.radlex_id).length,
      with_ar:     rows.filter(r=>r.name_ar).length,
    };
    console.log('\n▸ Stats:', stats);

    if (!DRY){
      const sql = emitSQL(rows);
      await fs.writeFile(OUT_SQL, sql);
      console.log(`\n✓ Wrote SQL: ${path.relative(ROOT, OUT_SQL)} (${(sql.length/1024).toFixed(1)} KB)`);
      const snapshot = { generated_at: new Date().toISOString(), mode: 'v1-only', stats, rows };
      await fs.writeFile(OUT_SNAP, JSON.stringify(snapshot, null, 0));
      console.log(`✓ Wrote snapshot: ${path.relative(ROOT, OUT_SNAP)}`);
    }
    return;
  }

  // ── Full mode (TA2 + RadLex + Wikidata) ──
  const ta2    = await loadTA2();
  let   radlex = await loadRadLexMap();
  if (radlex.size === 0 && !SKIP_RADLEX && BIOPORTAL_API_KEY){
    radlex = await fetchRadLexByLabels(ta2.map(r => r.name_en));
  }
  const arSeed = await loadArabicSeed();

  // Only query Wikidata for terms without a seed translation
  const needWiki = ta2.filter(r => !arSeed.has(r.name_en.toLowerCase()))
                      .map(r => r.name_en);
  const arWiki  = await fetchWikidataArabic(needWiki);

  const rows = merge({ ta2, radlex, arSeed, arWiki });

  const stats = {
    total: rows.length,
    with_radlex: rows.filter(r=>r.radlex_id).length,
    with_ar:     rows.filter(r=>r.name_ar).length,
    ar_seed:     rows.filter(r=>r.ar_source==='seed').length,
    ar_wiki:     rows.filter(r=>r.ar_source==='wikidata').length,
    needs_review:rows.filter(r=>r.needs_review).length,
  };
  console.log('\n▸ Stats:', stats);

  if (DRY){ console.log('\n(dry run — no files written)'); return; }

  const sql = emitSQL(rows);
  await fs.writeFile(OUT_SQL, sql);
  console.log(`\n✓ Wrote SQL: ${path.relative(ROOT, OUT_SQL)} (${(sql.length/1024).toFixed(1)} KB)`);

  const snapshot = { generated_at: new Date().toISOString(), stats, rows };
  await fs.writeFile(OUT_SNAP, JSON.stringify(snapshot, null, 0));
  console.log(`✓ Wrote snapshot: ${path.relative(ROOT, OUT_SNAP)}`);

  console.log('\nNext:');
  console.log(`  1. Open Supabase SQL editor → run supabase/anatomy-v2-schema.sql (once)`);
  console.log(`  2. Then run supabase/anatomy-v2-seed.sql`);
  console.log(`  3. Refresh any page → anatomy-master-v2.js will pick it up`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
