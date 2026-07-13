/* ═══════════════════════════════════════════════════════════════
   OmniRad — Atlas Dynamic loader
   ─────────────────────────────────────────────────────────────
   Sprint 2 (Phase 3) — makes atlas.html read approved images
   from Supabase `atlas_images` in addition to the static demo
   library shipped in `structures.js`.

   Exposes on window:
     OmniRadAtlasDynamic.load()        → Promise<Image[]>
     OmniRadAtlasDynamic.find(structId, modality, plane)
                                       → best-match dynamic image (or null)
     OmniRadAtlasDynamic.stats()       → Promise<{total_images, contributors, this_week,...}>
     OmniRadAtlasDynamic.publicUrl(storage_path)
                                       → CDN URL (cache-busted by approved_at)
     OmniRadAtlasDynamic.forOrgan(structId) → Image[] filtered by organ
     OmniRadAtlasDynamic.renderCounter(mountEl, {compact:false, organ:null})
                                       → renders + auto-refreshes on lang change

   Depends on: supabase.js (OmniRadAuth.client), i18n.js (optional)
   ═══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  const BUCKET = 'atlas';
  let cache = null;
  let cachedAt = 0;
  const TTL_MS = 60 * 1000; // 1 min

  const norm = (v) => String(v || '').toLowerCase().trim();

  function getClient() {
    return (global.OmniRadAuth && global.OmniRadAuth.client) || null;
  }

  async function load(force) {
    const sb = getClient();
    if (!sb) return [];
    if (!force && cache && (Date.now() - cachedAt < TTL_MS)) return cache;
    try {
      const { data, error } = await sb
        .from('atlas_public_v')
        .select('*')
        .limit(2000);
      if (error) throw error;
      cache = data || [];
      cachedAt = Date.now();
      return cache;
    } catch (e) {
      console.warn('[atlas-dynamic] load failed:', e.message);
      cache = cache || [];
      return cache;
    }
  }

  function publicUrl(storagePath, approvedAt) {
    const sb = getClient();
    if (!sb || !storagePath) return '';
    try {
      const { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath);
      let url = (data && data.publicUrl) || '';
      if (url && approvedAt) {
        const v = new Date(approvedAt).getTime();
        url += (url.includes('?') ? '&' : '?') + 'v=' + v;
      }
      return url;
    } catch (_) { return ''; }
  }

  /* Match rule (Sprint 3 upgrade — root fix for "approved image doesn't show"):
     A row matches a structure if EITHER row.organ equals structId, OR any element
     of row.structures[] equals structId (case-insensitive). Then modality must
     match; plane preferred but optional. */
  function find(structId, modality, plane) {
    if (!cache || !cache.length) return null;
    const sId = norm(structId), sMod = norm(modality), sPlane = norm(plane);
    const structMatches = (r) => {
      if (norm(r.organ) === sId) return true;
      if (Array.isArray(r.structures)) {
        return r.structures.some((s) => {
          const label = typeof s === 'string' ? s : (s && (s.label || s.slug || s.en));
          return norm(label) === sId;
        });
      }
      return false;
    };
    const bag = cache.filter((r) => structMatches(r) && norm(r.modality) === sMod);
    if (!bag.length) return null;
    if (sPlane) {
      const hit = bag.find((r) => norm(r.plane) === sPlane);
      if (hit) return hit;
    }
    return bag[0]; // view is ordered by approved_at desc
  }


  function forOrgan(structId) {
    if (!cache) return [];
    const sId = norm(structId);
    return cache.filter((r) => norm(r.organ) === sId);
  }

  async function stats(organ) {
    const sb = getClient();
    if (!sb) return null;
    try {
      const fn = organ ? 'atlas_stats_by_organ' : 'atlas_stats';
      const args = organ ? { p_organ: organ } : {};
      const { data, error } = await sb.rpc(fn, args);
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('[atlas-dynamic] stats failed:', e.message);
      return null;
    }
  }

  /* Render the growth counter into a mount element.
     Auto-refreshes on omnirad-lang event. */
  async function renderCounter(mount, opts) {
    if (!mount) return;
    opts = opts || {};
    const ar = () => (global.OmniRadI18n && global.OmniRadI18n.lang === 'ar');
    const s = await stats(opts.organ || null);
    const total = (s && s.total_images) || 0;
    const contrib = (s && s.contributors) || 0;
    const week = (s && s.this_week) || 0;

    const render = () => {
      const isAr = ar();
      const compact = !!opts.compact;
      const styleBase = compact
        ? 'display:inline-flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:\'IBM Plex Mono\',monospace;font-size:11.5px;color:var(--text-s)'
        : 'display:inline-flex;align-items:center;gap:18px;flex-wrap:wrap;font-family:\'IBM Plex Mono\',monospace;font-size:12.5px;color:var(--text-s);padding:9px 14px;background:var(--acc-sub);border:1px solid var(--border);border-radius:10px';
      const dot = 'display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--acc);margin-inline-end:6px';
      const strong = 'color:var(--text);font-weight:700';
      const weekColor = week > 0 ? 'var(--acc)' : 'var(--text-m)';
      mount.innerHTML =
        '<div style="' + styleBase + '" role="status" aria-live="polite">' +
          '<span title="' + (isAr ? 'إجمالي الصور' : 'Total images') + '">' +
            '<span style="' + dot + '"></span>' +
            '<span style="' + strong + '">' + total.toLocaleString(isAr ? 'ar' : 'en') + '</span> ' +
            (isAr ? 'صورة' : (total === 1 ? 'image' : 'images')) +
          '</span>' +
          '<span title="' + (isAr ? 'عدد المساهمين' : 'Contributors') + '">' +
            '<span style="' + strong + '">' + contrib.toLocaleString(isAr ? 'ar' : 'en') + '</span> ' +
            (isAr ? 'مساهم' : (contrib === 1 ? 'contributor' : 'contributors')) +
          '</span>' +
          '<span title="' + (isAr ? 'الأسبوع الماضي' : 'Past 7 days') + '" style="color:' + weekColor + '">' +
            '↗ ' + (week > 0 ? '+' : '') + week.toLocaleString(isAr ? 'ar' : 'en') + ' ' +
            (isAr ? 'هذا الأسبوع' : 'this week') +
          '</span>' +
        '</div>';
    };
    render();
    // Re-render label text on language change (numbers unchanged)
    global.addEventListener('omnirad-lang', render);
  }

  /* Community badge — small chip under the viewer showing who contributed/reviewed */
  function badgeHtml(img) {
    if (!img || !img.uploader_id) return '';
    const ar = (global.OmniRadI18n && global.OmniRadI18n.lang === 'ar');
    const up = img.uploader_name || (ar ? 'مساهم' : 'Contributor');
    const rv = img.reviewer_name || '';
    const upLbl = ar ? 'ساهم بها' : 'Contributed by';
    const rvLbl = ar ? 'راجعها' : 'Reviewed by';
    return (
      '<div class="atlas-community-badge" style="display:inline-flex;align-items:center;gap:10px;padding:6px 12px;background:var(--acc-sub);border:1px solid var(--border);border-radius:999px;font-family:\'IBM Plex Sans\',system-ui,sans-serif;font-size:11.5px;color:var(--text-s);line-height:1.4">' +
        '<span style="color:var(--acc);font-weight:700">⭐</span>' +
        '<span><span style="color:var(--text-m)">' + upLbl + '</span> ' +
          '<span style="color:var(--text);font-weight:600">' + escapeHtml(up) + '</span></span>' +
        (rv ? ('<span style="color:var(--text-m);opacity:.4">·</span>' +
              '<span><span style="color:var(--text-m)">' + rvLbl + '</span> ' +
              '<span style="color:var(--text);font-weight:600">' + escapeHtml(rv) + '</span></span>') : '') +
      '</div>'
    );
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g,
      (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  /* Empty-state HTML for a modality/organ combination with zero images.
     Provides a CTA to bulk-upload seeded with the current filter. */
  function emptyStateHtml(structId, modality, plane) {
    const ar = (global.OmniRadI18n && global.OmniRadI18n.lang === 'ar');
    const q = new URLSearchParams();
    if (structId) q.set('organ', structId);
    if (modality) q.set('modality', modality);
    if (plane) q.set('plane', plane);
    const link = 'bulk-upload.html' + (q.toString() ? ('?' + q.toString()) : '');
    const title = ar ? 'لا توجد صور بعد لهذا التوليفة' : 'No images for this combination yet';
    const desc = ar
      ? 'كن أول مساهم — ارفع صور ChatGPT التعليمية لهذا العضو والمودالتي.'
      : 'Be the first contributor — upload ChatGPT teaching images for this organ and modality.';
    const cta = ar ? 'رفع صور جماعي ←' : 'Bulk Upload →';
    return (
      '<div style="text-align:center;padding:24px 16px;max-width:360px;margin:0 auto">' +
        '<div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:var(--acc);color:var(--acc-ink);border-radius:12px;font-family:\'IBM Plex Mono\',monospace;font-size:20px;font-weight:800;letter-spacing:.02em;margin-bottom:14px;box-shadow:0 6px 22px rgba(45,212,200,.22)">OR</div>' +
        '<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px">' + title + '</div>' +
        '<div style="font-size:12px;color:var(--text-s);line-height:1.6;margin-bottom:14px">' + desc + '</div>' +
        '<a href="' + link + '" style="display:inline-block;padding:9px 18px;background:var(--acc);color:var(--acc-ink);border-radius:8px;font-weight:700;font-size:12px;text-decoration:none;font-family:\'IBM Plex Mono\',monospace;letter-spacing:.03em">' + cta + '</a>' +
      '</div>'
    );
  }

  global.OmniRadAtlasDynamic = {
    load, find, forOrgan, stats, publicUrl,
    renderCounter, badgeHtml, emptyStateHtml
  };
})(window);
