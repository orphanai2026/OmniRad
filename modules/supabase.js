/* ═══════════════════════════════════════════════════════════════
   OmniRad — Supabase client module
   ─────────────────────────────────────────────────────────────
   Single source of truth for auth + client used by both:
     • the OmniRad website (public + admin views)
     • the Prompt Studio authoring tool
   Depends on: @supabase/supabase-js v2 (loaded via CDN in HTML)
   Loads with:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="modules/supabase.js"></script>
   ═══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  const SUPABASE_URL = 'https://lmbdtktjeggischpqnkw.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_LBZk8ASNqCwZw4SSnYtPeQ_N2NbHMpl';
  const STORAGE_BUCKET = 'omnirad-images';
  const TOKEN_KEY = 'omnirad_token';
  const PROFILE_KEY = 'omnirad_profile';

  if (!global.supabase || !global.supabase.createClient) {
    console.warn('[OmniRad] supabase-js not loaded. Load the CDN script before this file.');
    return;
  }

  const client = global.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: TOKEN_KEY }
  });

  const OmniRadAuth = {
    client,
    _profile: null,

    async signUp(email, password, displayName) {
      const { data, error } = await client.auth.signUp({
        email, password,
        options: { data: { display_name: displayName || '' } }
      });
      if (error) throw error;
      return data;
    },

    async signIn(email, password) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await this.loadProfile();
      return data;
    },

    async signOut() {
      await client.auth.signOut();
      this._profile = null;
      try { localStorage.removeItem(PROFILE_KEY); } catch (_) {}
    },

    async currentUser() {
      const { data } = await client.auth.getUser();
      return data.user || null;
    },

    async loadProfile() {
      const user = await this.currentUser();
      if (!user) { this._profile = null; return null; }
      const { data, error } = await client.from('profiles').select('*').eq('id', user.id).single();
      if (error) { console.warn('[OmniRad] loadProfile error:', error.message); return null; }
      this._profile = data;
      try { localStorage.setItem(PROFILE_KEY, JSON.stringify(data)); } catch (_) {}
      return data;
    },

    async profile() {
      if (this._profile) return this._profile;
      try {
        const cached = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
        if (cached) this._profile = cached;
      } catch (_) {}
      return this._profile || await this.loadProfile();
    },

    async role() {
      const p = await this.profile();
      return (p && p.role) || 'viewer';
    },

    async isAdmin()      { return (await this.role()) === 'admin'; },
    async isContributor(){ const r = await this.role(); return r === 'admin' || r === 'contributor'; },

    /* Route guard — call at top of protected pages */
    async guard(opts) {
      opts = opts || {};
      const user = await this.currentUser();
      const authPath = opts.authPath || 'pages/auth.html';
      if (!user) { location.href = authPath; return false; }
      if (opts.role) {
        const r = await this.role();
        const allowed = Array.isArray(opts.role) ? opts.role.includes(r) : opts.role === r;
        if (!allowed) { location.href = opts.deniedPath || 'index.html'; return false; }
      }
      return true;
    },

    /* Signed URL helper for private image delivery (~1 h) */
    async imageUrl(path, expiresIn) {
      expiresIn = expiresIn || 3600;
      const { data, error } = await client.storage.from(STORAGE_BUCKET).createSignedUrl(path, expiresIn);
      if (error) throw error;
      return data.signedUrl;
    },

    /* Upload a Blob/File to a deterministic path */
    async uploadImage(structureId, modality, plane, blob, ext) {
      ext = ext || 'png';
      const stamp = Date.now();
      const path = `${structureId}/${modality}/${plane || 'na'}/${stamp}.${ext}`;
      const { error } = await client.storage.from(STORAGE_BUCKET).upload(path, blob, { contentType: 'image/' + ext });
      if (error) throw error;
      return path;
    },

    /* Submit a generated image row (goes to review queue) */
    async submitImage(row) {
      const user = await this.currentUser();
      if (!user) throw new Error('Not signed in');
      const payload = Object.assign({}, row, { uploaded_by: user.id, status: row.status || 'review' });
      const { data, error } = await client.from('generated_images').insert(payload).select().single();
      if (error) throw error;
      await client.from('image_review_log').insert({ image_id: data.id, actor: user.id, action: 'submit' });
      return data;
    },

    /* Admin: approve / reject */
    async approveImage(imageId, note) {
      const user = await this.currentUser();
      const { data, error } = await client.from('generated_images')
        .update({ status: 'approved', reviewed_by: user.id, reviewed_at: new Date().toISOString(), review_note: note || null })
        .eq('id', imageId).select().single();
      if (error) throw error;
      await client.from('image_review_log').insert({ image_id: imageId, actor: user.id, action: 'approve', note });
      return data;
    },
    async rejectImage(imageId, note) {
      const user = await this.currentUser();
      const { data, error } = await client.from('generated_images')
        .update({ status: 'rejected', reviewed_by: user.id, reviewed_at: new Date().toISOString(), review_note: note || null })
        .eq('id', imageId).select().single();
      if (error) throw error;
      await client.from('image_review_log').insert({ image_id: imageId, actor: user.id, action: 'reject', note });
      return data;
    },

    /* Public: list approved images for atlas / comparison */
    async listApprovedImages(structureId, modality) {
      let q = client.from('generated_images').select('*').eq('status', 'approved');
      if (structureId) q = q.eq('structure_id', structureId);
      if (modality)    q = q.eq('modality', modality);
      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    /* Update the unified nav's user chip after login */
    updateNav() {
      const nameEl = document.getElementById('onavName') || document.getElementById('navUserName');
      const avaEl  = document.getElementById('onavAva')  || document.getElementById('navUserAva');
      const p = this._profile;
      if (nameEl && p) nameEl.textContent = p.display_name || p.email || 'User';
      if (avaEl && p) {
        const initials = (p.display_name || p.email || 'U').trim().split(/\s+/).slice(0, 2).map(x => x[0]?.toUpperCase() || '').join('') || 'U';
        avaEl.textContent = initials;
      }
    }
  };

  // Auto-load profile if session exists
  (async () => {
    try {
      const user = await OmniRadAuth.currentUser();
      if (user) { await OmniRadAuth.loadProfile(); OmniRadAuth.updateNav(); }
    } catch (_) {}
  })();

  global.OmniRadAuth = OmniRadAuth;
})(window);
