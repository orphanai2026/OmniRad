/* ═══════════════════════════════════════════════════════════════════════════
 * OmniRad — Atlas Series orchestrator  (omnirad-atlas-series.js)
 * ═══════════════════════════════════════════════════════════════════════════
 * Reads series from Supabase view `atlas_series_public_v` and provides:
 *   • list()                → paginated series metadata for grid rendering
 *   • load(seriesId)        → ordered slices (uses RPC atlas_series_lookup)
 *   • related(seriesId)     → recommendations via RPC atlas_related_series
 *   • openViewer(seriesId, startSlice) → opens omnirad-series-viewer in atlas mode
 *   • renderCard(seriesRow) → HTML for a series card in the atlas grid
 *   • handleUrl()           → picks up ?series_id=&slice= on page load
 *
 * Depends on: window.OmniRadAuth (Supabase client) + OmniRadSeriesViewer
 * Standards : DICOM PS3.3 Series IE · IHE BIR · WCAG 2.2 AA
 * ═══════════════════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  const CACHE_TTL_MS = 60 * 1000;
  const BUCKET = 'omnirad-images'; // matches supabase.js default (fallback to 'atlas')
  let listCache = null;
  let listCacheAt = 0;

  function sb(){
    return (window.OmniRadAuth && window.OmniRadAuth.client) || null;
  }

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function pad2(n){ return String(n).padStart(2, '0'); }

  function publicUrl(storagePath){
    if (!storagePath) return '';
    if (String(storagePath).startsWith('http')) return storagePath;
    const client = sb();
    if (!client) return '';
    // Try the primary bucket; if it 404s the caller can fall back
    try {
      return client.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
    } catch(_){
      try { return client.storage.from('atlas').getPublicUrl(storagePath).data.publicUrl; }
      catch(_){ return ''; }
    }
  }

  // ── list() — all approved series with a first-slice thumbnail ────────
  async function list({ organ, modality, plane, limit = 60 } = {}){
    const now = Date.now();
    if (listCache && (now - listCacheAt) < CACHE_TTL_MS && !organ && !modality && !plane){
      return listCache;
    }
    const client = sb();
    if (!client) return [];
    let q = client.from('atlas_series_public_v').select('*').order('approved_at', { ascending: false }).limit(limit);
    if (organ)    q = q.ilike('organ', organ);
    if (modality) q = q.eq('modality', modality);
    if (plane)    q = q.eq('plane', plane);
    const { data, error } = await q;
    if (error){ console.warn('[atlas-series] list error', error); return []; }
    // Fetch first-slice thumbnail per series (parallel, small)
    const rows = data || [];
    await Promise.all(rows.map(async row => {
      const { data: t } = await client
        .from('atlas_public_v')
        .select('storage_path')
        .eq('series_id', row.series_id)
        .order('slice_index', { ascending: true })
        .limit(1);
      row._thumb = t && t[0] ? publicUrl(t[0].storage_path) : '';
    }));
    if (!organ && !modality && !plane){ listCache = rows; listCacheAt = now; }
    return rows;
  }

  // ── load(seriesId) — ordered slices for viewer ───────────────────────
  async function load(seriesId){
    const client = sb();
    if (!client || !seriesId) return null;
    // Try RPC first (fast, filtered)
    try {
      const { data, error } = await client.rpc('atlas_series_lookup', { p_series_id: seriesId });
      if (error) throw error;
      return (data || []).map(r => ({ ...r, url: publicUrl(r.storage_path) }));
    } catch(e){
      // Fallback to direct view read
      const { data, error } = await client
        .from('atlas_public_v')
        .select('*')
        .eq('series_id', seriesId)
        .order('slice_index', { ascending: true });
      if (error){ console.warn('[atlas-series] load error', error); return null; }
      return (data || []).map(r => ({ ...r, url: publicUrl(r.storage_path) }));
    }
  }

  // ── related(seriesId) — recommendations for the viewer footer ────────
  async function related(seriesId){
    const client = sb();
    if (!client || !seriesId) return [];
    // Fetch the current series meta to compute inputs
    const { data: head } = await client
      .from('atlas_series_public_v')
      .select('loinc_code, body_part_examined, modality, plane')
      .eq('series_id', seriesId).maybeSingle();
    if (!head) return [];
    try {
      const { data, error } = await client.rpc('atlas_related_series', {
        p_loinc:        head.loinc_code || null,
        p_body_part:    head.body_part_examined || null,
        p_modality:     head.modality || null,
        p_plane:        head.plane || null,
        p_exclude_series: seriesId,
        p_limit:        3
      });
      if (error) throw error;
      return (data || []).map(r => ({ ...r, first_thumb: r.first_thumb ? publicUrl(r.first_thumb) : '' }));
    } catch(e){
      console.warn('[atlas-series] related error', e);
      return [];
    }
  }

  // ── openViewer(seriesId, startSlice) — the main UX entrypoint ────────
  async function openViewer(seriesId, startSlice){
    const slices = await load(seriesId);
    if (!slices || !slices.length){
      console.warn('[atlas-series] no slices for', seriesId);
      return;
    }
    const first = slices[0];
    const rels = await related(seriesId);
    const startIndex = (startSlice != null)
      ? Math.max(0, slices.findIndex(s => s.slice_index === parseInt(startSlice, 10)))
      : 0;
    // Series-level metadata pulled from first slice (per DICOM Series IE)
    window.OmniRadSeriesViewer.openAtlas({
      seriesId,
      seriesName: first.series_name || (first.organ + ' · ' + first.modality),
      modality:   first.modality || '',
      plane:      first.plane || '',
      loinc:      first.loinc_code || '',
      rpid:       first.radlex_playbook_id || '',
      tier:       first.loinc_code ? 'standard' : (first.organ ? 'partial' : 'custom'),
      uploaderName: first.uploader_name || null,
      reviewerName: first.reviewer_name || null,
      slices: slices.map(s => ({
        slice_index: s.slice_index,
        url:         s.url,
        structures:  s.structures || [],
        teaching_pearl: s.teaching_pearl || null,
        common_pitfall: s.common_pitfall || null
      })),
      startIndex: startIndex < 0 ? 0 : startIndex,
      related: rels,
      onOpenRelated: (sid) => {
        window.OmniRadSeriesViewer.close();
        setTimeout(() => openViewer(sid, null), 60);
      }
    });
  }

  // ── renderCard(row) — HTML for a series card in the Atlas grid ───────
  function renderCard(row){
    const lang = (window.OmniRadI18n && window.OmniRadI18n.lang) || 'en';
    const isAr = lang === 'ar';
    const nm = row.series_name || `${row.organ || '—'} · ${row.modality || '—'}`;
    const tier = row.naming_tier || (row.loinc_code ? 'standard' : (row.organ ? 'partial' : 'custom'));
    const badgeHtml = window.OmniRadNaming
      ? (row.loinc_code
          ? window.OmniRadNaming.renderBadge(
              window.OmniRadNaming.resolve(row.loinc_code) || { loinc: row.loinc_code, rpid: row.radlex_playbook_id, en: nm, ar: nm, tier:'standard' },
              lang)
          : window.OmniRadNaming.renderBadge({ tier: 'partial', region: row.organ }, lang))
      : '';
    return `<article class="atlas-series-card" data-sid="${esc(row.series_id)}" tabindex="0"
      role="button" aria-label="Open series ${esc(nm)}">
      <div class="asc-thumb">
        ${row._thumb ? `<img src="${esc(row._thumb)}" loading="lazy" alt="">` : `<div class="asc-thumb-ph">📚</div>`}
        <span class="asc-count mono">${esc(row.slice_count || 0)} ${isAr?'شريحة':'slices'}</span>
        ${row.modality ? `<span class="asc-mod mono">${esc(row.modality)}</span>` : ''}
      </div>
      <div class="asc-body">
        <div class="asc-name">${esc(nm)}</div>
        <div class="asc-meta mono">
          ${row.organ ? esc(row.organ) : ''}${row.plane ? ' · ' + esc(row.plane) : ''}
        </div>
        ${badgeHtml ? `<div class="asc-badge">${badgeHtml}</div>` : ''}
      </div>
    </article>`;
  }

  // ── Card-click wiring (delegated) ────────────────────────────────────
  function attachClickHandlers(container){
    if (!container) return;
    container.addEventListener('click', e => {
      const card = e.target.closest('.atlas-series-card');
      if (!card) return;
      const sid = card.getAttribute('data-sid');
      if (sid) openViewer(sid, null);
    });
    container.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest && e.target.closest('.atlas-series-card');
      if (!card) return;
      e.preventDefault();
      const sid = card.getAttribute('data-sid');
      if (sid) openViewer(sid, null);
    });
  }

  // ── URL param handling ────────────────────────────────────────────────
  async function handleUrl(){
    try {
      const url = new URL(location.href);
      const sid = url.searchParams.get('series_id');
      const slice = url.searchParams.get('slice');
      if (sid){ await openViewer(sid, slice); }
    } catch(_){}
  }

  // ── CSS ──────────────────────────────────────────────────────────────
  const CSS = `
.atlas-series-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin-top:14px}
.atlas-series-card{background:var(--bg-e);border:1px solid var(--border);border-radius:12px;overflow:hidden;cursor:pointer;transition:transform .15s, box-shadow .15s, border-color .15s;text-align:start}
.atlas-series-card:hover,.atlas-series-card:focus-visible{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.35);border-color:var(--acc);outline:none}
.asc-thumb{position:relative;aspect-ratio:1/1;background:var(--bg-s);display:grid;place-items:center;overflow:hidden}
.asc-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.asc-thumb-ph{font-size:34px;opacity:.4}
.asc-count{position:absolute;bottom:6px;inset-inline-start:6px;padding:2px 7px;background:rgba(0,0,0,.72);color:#fff;border-radius:4px;font-size:10.5px;letter-spacing:.02em;font-weight:600}
.asc-mod{position:absolute;top:6px;inset-inline-end:6px;padding:2px 7px;background:var(--acc-sub);color:var(--acc);border:1px solid var(--acc-dim);border-radius:4px;font-size:10.5px;font-weight:700}
.asc-body{padding:10px 12px;display:flex;flex-direction:column;gap:6px}
.asc-name{font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.asc-meta{font-size:11px;color:var(--text-m);letter-spacing:.02em}
.asc-badge{margin-top:4px}
`;
  function injectCss(){
    if (typeof document === 'undefined') return;
    if (document.getElementById('omr-atlas-series-css')) return;
    const s = document.createElement('style');
    s.id = 'omr-atlas-series-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  if (typeof document !== 'undefined'){
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', injectCss);
    } else { injectCss(); }
  }

  const API = { list, load, related, openViewer, renderCard, attachClickHandlers, handleUrl, publicUrl };
  if (typeof window !== 'undefined') window.OmniRadAtlasSeries = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
