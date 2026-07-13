/* ═══════════════════════════════════════════════════════════════
   OmniRad — Community Flag Button
   ─────────────────────────────────────────────────────────────
   Sprint 3 (Phase 3) — Layer 3 of the 3-Layer Quality system.
   Mounts a 🚩 flag button on any anatomical structure (Atlas
   sidebar entry, dictionary card, etc). Signed-in users can
   report incorrect Arabic / wrong RadLex / outdated / other.

   Usage:
     <button data-omni-flag="{structureId}"></button>
     OmniRadFlag.mount()            // auto-scans and enhances
     OmniRadFlag.attach(el, id)     // manual attach

   Depends on: supabase.js (OmniRadAuth.client)
   ═══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  const REASONS = [
    { key: 'incorrect_arabic', en: 'Incorrect Arabic translation',   ar: 'ترجمة عربية غير صحيحة' },
    { key: 'wrong_radlex',     en: 'Wrong or missing RadLex ID',      ar: 'RadLex خاطئ أو مفقود' },
    { key: 'outdated',         en: 'Outdated / superseded terminology', ar: 'مصطلح قديم' },
    { key: 'other',            en: 'Other issue',                     ar: 'مشكلة أخرى' }
  ];

  let overlay = null;
  const ar = () => (global.OmniRadI18n && OmniRadI18n.lang === 'ar');

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'omnirad-flag-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.72);display:none;align-items:center;justify-content:center;z-index:9500;padding:20px;font-family:\'IBM Plex Sans\',system-ui,sans-serif';
    overlay.innerHTML =
      '<div id="omnirad-flag-modal" style="background:var(--bg-e,#101e2a);border:1px solid var(--border,rgba(45,212,200,.15));border-radius:14px;padding:22px;max-width:420px;width:100%;color:var(--text,#e8f0f5)">' +
        '<div style="font-size:15px;font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:8px"><span style="color:var(--warn,#f59e0b)">🚩</span><span id="omnirad-flag-title"></span></div>' +
        '<div id="omnirad-flag-sub" style="font-size:12.5px;color:var(--text-s,rgba(232,240,245,.65));line-height:1.55;margin-bottom:14px"></div>' +
        '<label id="omnirad-flag-lbl-reason" style="display:block;font-size:11.5px;font-weight:600;color:var(--text-s,rgba(232,240,245,.65));margin-bottom:6px"></label>' +
        '<select id="omnirad-flag-reason" style="width:100%;background:var(--bg-s,#0c1520);border:1px solid var(--border,rgba(45,212,200,.15));border-radius:8px;padding:9px 11px;color:var(--text,#e8f0f5);font-size:13px;font-family:inherit;margin-bottom:12px"></select>' +
        '<label id="omnirad-flag-lbl-note" style="display:block;font-size:11.5px;font-weight:600;color:var(--text-s,rgba(232,240,245,.65));margin-bottom:6px"></label>' +
        '<textarea id="omnirad-flag-note" rows="3" style="width:100%;background:var(--bg-s,#0c1520);border:1px solid var(--border,rgba(45,212,200,.15));border-radius:8px;padding:9px 11px;color:var(--text,#e8f0f5);font-size:13px;font-family:inherit"></textarea>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">' +
          '<button id="omnirad-flag-cancel" style="padding:8px 14px;background:transparent;border:1px solid var(--border-s,rgba(232,240,245,.08));color:var(--text-s,rgba(232,240,245,.65));border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit"></button>' +
          '<button id="omnirad-flag-submit" style="padding:8px 14px;background:rgba(251,191,36,.15);border:1px solid rgba(251,191,36,.4);color:var(--warn,#f59e0b);border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit"></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.getElementById('omnirad-flag-cancel').addEventListener('click', close);
    return overlay;
  }

  function localize() {
    const isAr = ar();
    document.getElementById('omnirad-flag-title').textContent = isAr ? 'الإبلاغ عن مشكلة' : 'Report an issue';
    document.getElementById('omnirad-flag-sub').textContent = isAr
      ? 'ساعدنا في تحسين الجودة — سيراجع فريق التحرير بلاغك.'
      : 'Help improve quality — the editorial team reviews every report.';
    document.getElementById('omnirad-flag-lbl-reason').textContent = isAr ? 'السبب' : 'Reason';
    document.getElementById('omnirad-flag-lbl-note').textContent = isAr ? 'ملاحظة (اختياري)' : 'Note (optional)';
    document.getElementById('omnirad-flag-cancel').textContent = isAr ? 'إلغاء' : 'Cancel';
    document.getElementById('omnirad-flag-submit').textContent = isAr ? 'إرسال البلاغ' : 'Submit report';
    const sel = document.getElementById('omnirad-flag-reason');
    sel.innerHTML = REASONS.map(r =>
      `<option value="${r.key}">${isAr ? r.ar : r.en}</option>`
    ).join('');
    if (isAr) document.getElementById('omnirad-flag-modal').setAttribute('dir','rtl');
    else document.getElementById('omnirad-flag-modal').removeAttribute('dir');
  }

  function open(structureId, structureLabel) {
    ensureOverlay();
    localize();
    document.getElementById('omnirad-flag-note').value = '';
    if (structureLabel){
      const sub = document.getElementById('omnirad-flag-sub');
      sub.innerHTML = sub.textContent + ' <span style="color:var(--acc);font-weight:600;font-family:\'IBM Plex Mono\',monospace">' +
        String(structureLabel).replace(/[<>&"]/g,'') + '</span>';
    }
    const submit = document.getElementById('omnirad-flag-submit');
    submit.onclick = async () => {
      const reason = document.getElementById('omnirad-flag-reason').value;
      const note   = document.getElementById('omnirad-flag-note').value.trim();
      submit.disabled = true; submit.textContent = '…';
      try {
        const sb = (global.OmniRadAuth && OmniRadAuth.client);
        if (!sb) throw new Error('Not connected');
        const { data:{ session } } = await sb.auth.getSession();
        if (!session){
          alert(ar() ? 'يلزم تسجيل الدخول للإبلاغ.' : 'Sign in required to submit a report.');
          window.location.href = 'auth.html';
          return;
        }
        const { error } = await sb.rpc('flag_anatomy_term', {
          p_structure_id: String(structureId),
          p_reason: reason,
          p_note: note || null
        });
        if (error) throw error;
        submit.textContent = ar() ? '✓ تم الإرسال' : '✓ Sent';
        setTimeout(close, 900);
      } catch (e) {
        alert((ar() ? 'خطأ: ' : 'Error: ') + e.message);
        submit.disabled = false;
        localize();
      }
    };
    overlay.style.display = 'flex';
  }

  function close() { if (overlay) overlay.style.display = 'none'; }

  /* Attach: turn `el` into a flag trigger for `structureId` */
  function attach(el, structureId, structureLabel) {
    if (!el || el.__omniradFlagBound) return;
    el.__omniradFlagBound = true;
    el.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      open(structureId, structureLabel);
    });
  }

  /* Auto-scan: find all [data-omni-flag="id"] elements and enhance */
  function mount() {
    document.querySelectorAll('[data-omni-flag]').forEach(el => {
      const id = el.getAttribute('data-omni-flag');
      const lbl = el.getAttribute('data-omni-flag-label') || '';
      attach(el, id, lbl);
    });
  }

  /* Convenience factory: return a ready-styled inline button HTML string */
  function buttonHtml(structureId, structureLabel){
    return '<button type="button" class="omnirad-flag-btn" data-omni-flag="' + String(structureId).replace(/"/g,'') + '"' +
      (structureLabel ? ' data-omni-flag-label="' + String(structureLabel).replace(/"/g,'') + '"' : '') +
      ' title="' + (ar() ? 'الإبلاغ عن مشكلة' : 'Report an issue') + '"' +
      ' style="background:transparent;border:1px solid var(--border-s,rgba(232,240,245,.08));color:var(--text-m,rgba(232,240,245,.38));padding:4px 8px;border-radius:6px;font-size:11px;cursor:pointer;transition:.15s;font-family:inherit">🚩</button>';
  }

  // Auto-mount on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else { mount(); }

  global.OmniRadFlag = { open, close, attach, mount, buttonHtml };
})(window);
