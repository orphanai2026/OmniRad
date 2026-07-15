/* ═══════════════════════════════════════════════════════════════
   OmniRad — Permissions helper (frontend gating)
   Depends on: window.OmniRadAuth (supabase.js)
   Backend source of truth: has_permission() / effective_permissions()
   ─────────────────────────────────────────────────────────────
   NOTE: frontend gating is UX only. Real enforcement lives in RLS.
   Usage:
     await OmniRadPerms.ready();
     if (OmniRadPerms.can('upload_images')) { … }
     OmniRadPerms.gate('manage_users', document.querySelector('#adminBtn'));
   ═══════════════════════════════════════════════════════════════ */
(function(g){
  'use strict';
  let _caps = new Set();      // effective caps of current user
  let _role = null;
  let _uid  = null;
  let _ready = null;          // promise
  let _catalog = null;        // [{cap,grp,...}]
  let _presets = null;        // {role: [caps]}

  async function _sb(){
    let tries = 0;
    while (!(g.OmniRadAuth && g.OmniRadAuth.client) && tries < 40){ await new Promise(r=>setTimeout(r,80)); tries++; }
    return g.OmniRadAuth ? g.OmniRadAuth.client : null;
  }

  async function _load(){
    const sb = await _sb();
    if (!sb){ return; }
    try {
      const { data:{ session } } = await sb.auth.getSession();
      if (!session){ _caps = new Set(); _role = null; _uid = null; return; }
      _uid = session.user.id;
      const { data, error } = await sb.rpc('effective_permissions', { p_user:_uid });
      if (!error && Array.isArray(data)) _caps = new Set(data);
      const { data:prof } = await sb.from('profiles').select('role').eq('id',_uid).maybeSingle();
      _role = prof ? prof.role : null;
      if (_role === 'admin') { /* admin = full; caps already include all via preset */ }
    } catch(e){ console.warn('[perms] load', e); }
  }

  const API = {
    ready(){ if (!_ready) _ready = _load(); return _ready; },
    refresh(){ _ready = _load(); return _ready; },
    can(cap){ return _role === 'admin' || _caps.has(cap); },
    role(){ return _role; },
    all(){ return [..._caps]; },
    /* Hide (or disable) an element unless the user has `cap` */
    gate(cap, el, mode){
      if (!el) return;
      const ok = API.can(cap);
      if (ok) return;
      if (mode === 'disable'){ el.setAttribute('disabled','true'); el.style.opacity='.4'; el.style.pointerEvents='none'; }
      else { el.style.display = 'none'; }
    },
    /* Batch-gate all [data-perm] elements on the page */
    applyGates(root){
      (root||document).querySelectorAll('[data-perm]').forEach(el=>{
        API.gate(el.dataset.perm, el, el.dataset.permMode || 'hide');
      });
    },
    /* Catalog + presets (cached) — used by admin console */
    async catalog(){
      if (_catalog) return _catalog;
      const sb = await _sb(); if (!sb) return [];
      const { data } = await sb.from('permission_catalog').select('*').order('sort');
      _catalog = data || []; return _catalog;
    },
    async presets(){
      if (_presets) return _presets;
      const sb = await _sb(); if (!sb) return {};
      const { data } = await sb.from('role_presets').select('*');
      _presets = {}; (data||[]).forEach(r=>{ _presets[r.role] = r.caps || []; });
      return _presets;
    }
  };

  g.OmniRadPerms = API;
  document.addEventListener('DOMContentLoaded', ()=>{ API.ready().then(()=>API.applyGates()); });
})(window);
