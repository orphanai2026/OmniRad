/* ═══════════════════════════════════════════════════════════════
   OmniRad — RadLex Auto-Lookup (BioPortal client)
   ─────────────────────────────────────────────────────────────
   Sprint 3 (Phase 3) — client-side lookup for RadLex terms via
   the BioPortal REST API. Used by Bulk Upload and Anatomy Review
   to auto-fill `radlex_id` + `radlex_label` for a new term.

   Exposes on window:
     OmniRadRadLex.lookup(termEn, opts)
       → Promise<{id, label, definition, synonyms, url, matched} | null>
     OmniRadRadLex.search(termEn, limit)
       → Promise<Array<{id, label, url}>>
     OmniRadRadLex.details(radlexId)
       → Promise<{id, label, definition, synonyms} | null>

   Notes:
   - API key is a public educational key — safe to ship client-side
     for this use case per BioPortal T&C. Rotate via CLAUDE.md if needed.
   - Results are cached in-memory (session) to avoid rate limits.
   ═══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  const API_KEY = '1ad6cd52-5d72-4666-a11e-16bbcda0f252';
  const BASE = 'https://data.bioontology.org';
  const ONTOLOGY = 'RADLEX';

  const cache = new Map();
  const cacheKey = (op, q) => op + '::' + String(q || '').toLowerCase().trim();

  function ridFromUri(uri) {
    if (!uri) return null;
    const m = /RID\d+/i.exec(uri);
    return m ? m[0].toUpperCase() : null;
  }

  async function fetchJson(url) {
    const res = await fetch(url, {
      headers: { 'Authorization': 'apikey token=' + API_KEY, 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error('BioPortal HTTP ' + res.status);
    return res.json();
  }

  /* Search RADLEX for a term and return best match. */
  async function lookup(termEn, opts) {
    const q = String(termEn || '').trim();
    if (!q) return null;
    const key = cacheKey('lookup', q);
    if (cache.has(key)) return cache.get(key);

    const url = BASE + '/search?ontologies=' + ONTOLOGY +
                '&require_exact_match=false&pagesize=5' +
                '&q=' + encodeURIComponent(q);
    try {
      const data = await fetchJson(url);
      const rows = (data && data.collection) || [];
      if (!rows.length) { cache.set(key, null); return null; }
      // Prefer exact case-insensitive match on prefLabel, else first result
      const norm = (s) => String(s || '').toLowerCase().trim();
      const exact = rows.find(r => norm(r.prefLabel) === norm(q));
      const best = exact || rows[0];
      const result = {
        id: ridFromUri(best['@id']),
        label: best.prefLabel,
        definition: (best.definition && best.definition[0]) || null,
        synonyms: best.synonym || [],
        url: best['@id'],
        matched: !!exact
      };
      cache.set(key, result);
      return result;
    } catch (e) {
      console.warn('[radlex] lookup failed:', e.message);
      return null;
    }
  }

  /* Return top-N search suggestions for an autocomplete UI. */
  async function search(termEn, limit) {
    const q = String(termEn || '').trim();
    if (!q) return [];
    const key = cacheKey('search', q + '::' + (limit || 8));
    if (cache.has(key)) return cache.get(key);

    const url = BASE + '/search?ontologies=' + ONTOLOGY +
                '&pagesize=' + (limit || 8) +
                '&q=' + encodeURIComponent(q);
    try {
      const data = await fetchJson(url);
      const rows = (data && data.collection) || [];
      const out = rows.map(r => ({
        id: ridFromUri(r['@id']),
        label: r.prefLabel,
        url: r['@id']
      })).filter(x => x.id);
      cache.set(key, out);
      return out;
    } catch (e) {
      console.warn('[radlex] search failed:', e.message);
      return [];
    }
  }

  /* Fetch full details for a known RID. */
  async function details(rid) {
    if (!rid) return null;
    const key = cacheKey('details', rid);
    if (cache.has(key)) return cache.get(key);
    const url = BASE + '/ontologies/' + ONTOLOGY + '/classes/' +
                encodeURIComponent('http://www.radlex.org/RID/' + rid);
    try {
      const r = await fetchJson(url);
      const result = {
        id: rid,
        label: r.prefLabel,
        definition: (r.definition && r.definition[0]) || null,
        synonyms: r.synonym || []
      };
      cache.set(key, result);
      return result;
    } catch (e) {
      console.warn('[radlex] details failed:', e.message);
      return null;
    }
  }

  global.OmniRadRadLex = { lookup, search, details };
})(window);
