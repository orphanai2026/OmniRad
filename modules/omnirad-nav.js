/* ════════════════════════════════════════════════════
   OmniRad — omnirad-nav.js
   Shared unified top navigation (English-primary, LTR).
   Drop into ANY page:
     <script src="modules/omnirad-nav.js" data-base="../"></script>
   - data-base: relative path back to repo root (use "" on index.html, "../" inside /pages).
   - Injects nav + mobile menu + styles, auto-highlights the active link,
     wires theme toggle (omnirad-theme), hamburger, and user menu.
   - No dependencies. Self-contained. Idempotent.
   ════════════════════════════════════════════════════ */
(function () {
  if (window.__omniradNavMounted) return;
  window.__omniradNavMounted = true;
  window.__omniradNavVersion = '2026-07-11-e';

  var script = document.currentScript;
  var BASE = (script && script.getAttribute('data-base')) || '';

  // Nav model — single source of truth for every page
  var CORE = [
    { href: 'pages/atlas.html',       icon: '📖', label: 'Atlas',      i18n: 'nav.atlas' },
    { href: 'pages/dictionary.html',  icon: '🔠', label: 'Dictionary', i18n: 'nav.dictionary' },
    { href: 'pages/comparison.html',  icon: '⚖',  label: 'Compare',    i18n: 'nav.compare' },
    { href: 'pages/review.html',      icon: '📋', label: 'Review',     i18n: 'nav.review', role:'admin,reviewer' }
  ];
  var GROUPS = [
    { icon: '🎓', label: 'Learn', i18n:'nav.learn', items: [
      { href: 'pages/mnemonics.html',  icon: '📚', title: 'Mnemonics',       sub: 'Memory techniques',  i18n:'nav.mnemonics' },
      { href: 'pages/daily.html',      icon: '🧠', title: 'Daily Challenge', sub: 'Quiz + leaderboard', i18n:'nav.daily' },
      { href: 'pages/my-progress.html',icon: '📊', title: 'My Progress',     sub: 'Spaced repetition',  i18n:'nav.progress' }
    ]},
    { icon: '🛠', label: 'Tools', i18n:'nav.tools', items: [
      { href: 'pages/ai-chat.html',    icon: '✦', title: 'AI Assistant',     sub: 'Radiology-scoped chat', i18n:'nav.aiChat' },
      { href: 'pages/clinic.html',     icon: '🏥', title: 'Clinic',           sub: 'Applied cases',        i18n:'nav.clinic' }
    ]},
    { icon: '🔒', label: 'Admin', i18n:'nav.admin', role:['admin','contributor','reviewer'], items: [
      { href: 'pages/studio.html',    icon: '🎨', title: 'Studio',       sub: 'Prompt authoring',       i18n:'nav.studio', role:['admin','contributor','reviewer'] },
      { href: 'pages/admin.html',     icon: '🛡', title: 'Admin Console', sub: 'Users, content, review', i18n:'nav.adminConsole', role:['admin','reviewer'] }
    ]}
  ];

  var here = location.pathname.split('/').pop() || 'index.html';
  function abs(h) { return BASE + h; }
  function isActive(h) { return h.split('/').pop() === here; }

  // ── styles ──
  var css = document.createElement('style');
  css.textContent = [
    ':root{--onav-h:56px}',
    '.onav{position:fixed;top:0;left:0;right:0;height:var(--onav-h);background:rgba(8,14,20,.92);border-bottom:1px solid var(--border,rgba(45,212,200,.12));display:flex;align-items:center;padding:0 22px 0 16px;gap:12px;z-index:200;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-sizing:border-box}',
    '.onav-inner{display:flex;align-items:center;gap:12px;width:100%;min-width:0}',
    '[data-theme="dim"] .onav{background:rgba(230,236,243,.92)}',
    '.onav a,.onav button{font-family:inherit}',
    '.onav-logo{display:flex;align-items:center;gap:9px;flex-shrink:0;text-decoration:none}',
    '.onav-mark{width:30px;height:30px;background:var(--acc,#2dd4c8);border-radius:7px;display:grid;place-items:center;font-weight:700;font-size:12px;color:var(--acc-ink,#08100e);letter-spacing:-.02em}',
    '.onav-name{font-weight:700;font-size:16px;letter-spacing:-.02em;color:var(--text,#e8f0f5)}',
    '.onav-name span{color:var(--acc,#2dd4c8)}',
    '.onav-links{display:flex;align-items:center;gap:4px;flex:1;list-style:none;margin:0;padding:0}',
    '.onav-links>li{position:relative}',
    '.onav-links a,.onav-gbtn{font-size:13px;font-weight:500;color:var(--text-s,rgba(232,240,245,.65));padding:8px 13px;border-radius:6px;white-space:nowrap;transition:color .15s,background .15s;display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;text-decoration:none}',
    '.onav-links a:hover,.onav-gbtn:hover{color:var(--text,#e8f0f5);background:var(--bg-ov,#162030)}',
    '.onav-links a.core{color:var(--text,#e8f0f5);font-weight:600}',
    '.onav-links a.active{color:var(--acc,#2dd4c8);background:var(--acc-sub,rgba(45,212,200,.10))}',
    '.onav-ic{font-size:14px;opacity:.85}',
    '.onav-sep{width:1px;height:22px;background:var(--border-s,rgba(232,240,245,.08));margin:0 4px}',
    '.onav-chev{font-size:9px;opacity:.6}',
    '.onav-drop{position:absolute;top:calc(100% + 6px);left:0;min-width:210px;background:var(--bg-e,#101e2a);border:1px solid var(--border,rgba(45,212,200,.12));border-radius:10px;padding:6px;box-shadow:0 12px 34px -12px rgba(0,0,0,.6);opacity:0;visibility:hidden;transform:translateY(-6px);transition:all .16s;z-index:210}',
    '.onav-g:hover .onav-drop,.onav-g:focus-within .onav-drop{opacity:1;visibility:visible;transform:translateY(0)}',
    '.onav-drop a{display:flex;flex-direction:column;gap:1px;padding:9px 11px;border-radius:6px;align-items:flex-start}',
    '.onav-drop .dt{font-size:13px;font-weight:600;color:var(--text,#e8f0f5);display:flex;align-items:center;gap:7px}',
    '.onav-drop .ds{font-size:11px;color:var(--text-m,rgba(232,240,245,.38));padding-left:21px}',
    '.onav-drop a:hover{background:var(--acc-sub,rgba(45,212,200,.10))}',
    '.onav-drop a:hover .dt{color:var(--acc,#2dd4c8)}',
    '.onav-end{display:flex;align-items:center;gap:9px;margin-left:auto;flex-shrink:0}',
    '.onav-edu{font-size:10.5px;font-weight:700;padding:5px 10px;border-radius:6px;border:1px solid var(--acc-dim,rgba(45,212,200,.55));color:var(--acc,#2dd4c8);background:var(--acc-sub,rgba(45,212,200,.10));display:flex;align-items:center;gap:5px;white-space:nowrap}',
    '[data-theme="dim"] .onav-edu{color:#0b6b64;border-color:rgba(11,107,100,.55);background:rgba(11,107,100,.10)}',
    '.onav-ib{width:32px;height:32px;border-radius:6px;background:var(--bg-ov,#162030);border:1px solid var(--border-s,rgba(232,240,245,.08));color:var(--text-m,rgba(232,240,245,.38));cursor:pointer;display:grid;place-items:center;font-size:13px;flex-shrink:0;transition:color .15s}',
    '.onav-lang{width:auto!important;height:32px;min-width:auto;padding:0 14px;font-size:12px;font-weight:800;font-family:inherit;letter-spacing:.03em;color:var(--acc,#2dd4c8);background:var(--acc-sub,rgba(45,212,200,.1));border:1.5px solid var(--acc-dim,rgba(45,212,200,.55));border-radius:999px;gap:6px}',
    '.onav-lang:hover{background:var(--acc,#2dd4c8);color:var(--acc-ink,#08100e);border-color:var(--acc,#2dd4c8)}',
    'body[dir="rtl"] .onav-lang{font-size:13px;letter-spacing:0}',
    '.onav-ib:hover{color:var(--acc,#2dd4c8);border-color:var(--acc,#2dd4c8)}',
    '[data-theme="dim"] .onav-ib{background:#ffffff;border-color:rgba(15,58,58,.14);color:rgba(15,58,58,.6)}',
    '[data-theme="dim"] .onav-ib:hover{background:var(--acc-sub);color:var(--acc);border-color:var(--acc)}',
    '.onav-uw{position:relative;flex:0 1 auto;min-width:0;max-width:none}',
    '.onav-ua{display:grid;place-items:center;width:36px;height:36px;padding:0;border-radius:50%;background:var(--bg-ov,#162030);border:1px solid var(--border-s,rgba(232,240,245,.08));cursor:pointer;transition:border-color .15s,transform .1s}',
    '.onav-ua:hover{border-color:var(--acc,#2dd4c8)}',
    '.onav-ua:active{transform:scale(.96)}',
    '[data-theme="dim"] .onav-ua{background:#ffffff;border-color:rgba(15,58,58,.14)}',
    '.onav-av{width:32px;height:32px;border-radius:50%;background:var(--acc,#2dd4c8);color:var(--acc-ink,#08100e);display:grid;place-items:center;font-size:12px;font-weight:700;flex-shrink:0;overflow:hidden;line-height:1}',
    '.onav-uhead{display:flex;flex-direction:column;gap:2px;padding:10px 12px 12px;border-bottom:1px solid var(--border-s,rgba(232,240,245,.08));margin-bottom:4px}',
    '.onav-uhead .un{font-size:13px;font-weight:700;color:var(--text,#e8f0f5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.onav-uhead .ue{font-size:11px;color:var(--text-m,rgba(232,240,245,.5));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:"IBM Plex Mono",monospace}',
    '.onav-uhead .ur{font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--acc,#2dd4c8);margin-top:3px}',
    '.onav-un{display:none}',
    '@media(max-width:720px){.onav-un{display:none}.onav-uw{max-width:none;flex:0 0 auto}}',
    '.onav-udrop{position:absolute;top:calc(100% + 6px);inset-inline-end:0;min-width:220px;max-width:calc(100vw - 24px);background:var(--bg-e,#101e2a);border:1px solid var(--border,rgba(45,212,200,.12));border-radius:10px;padding:6px;box-shadow:0 12px 34px -12px rgba(0,0,0,.6);opacity:0;visibility:hidden;transform:translateY(-6px);transition:all .16s;z-index:210}',
    '.onav-uw.open .onav-udrop,.onav-uw:hover .onav-udrop,.onav-uw:focus-within .onav-udrop{opacity:1;visibility:visible;transform:translateY(0)}',
    '.onav-udrop a{display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:6px;font-size:13px;color:var(--text-s,rgba(232,240,245,.65));text-decoration:none}',
    '.onav-udrop a:hover{background:var(--acc-sub,rgba(45,212,200,.10));color:var(--acc,#2dd4c8)}',
    '.onav-udsep{height:1px;background:var(--border-s,rgba(232,240,245,.08));margin:5px 4px}',
    '.onav-ham{display:none;flex-direction:column;justify-content:center;gap:4px;width:32px;height:32px;padding:6px;border-radius:6px;background:var(--bg-ov,#162030);border:1px solid var(--border-s,rgba(232,240,245,.08));cursor:pointer}',
    '.onav-ham span{display:block;width:100%;height:1.5px;background:var(--text-s,rgba(232,240,245,.65));border-radius:2px;transition:all .2s}',
    '.onav-ham.open span:nth-child(1){transform:translateY(5.5px) rotate(45deg)}',
    '.onav-ham.open span:nth-child(2){opacity:0}',
    '.onav-ham.open span:nth-child(3){transform:translateY(-5.5px) rotate(-45deg)}',
    '.onav-mm{display:none;position:fixed;top:var(--onav-h);left:0;right:0;background:var(--bg-e,#101e2a);border-bottom:1px solid var(--border,rgba(45,212,200,.12));z-index:199;padding:14px 22px 22px;max-height:calc(100vh - var(--onav-h));overflow-y:auto}',
    '.onav-mm.open{display:block}',
    '.onav-mmg{font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--text-m,rgba(232,240,245,.38));padding:14px 12px 6px}',
    '.onav-mm ul{list-style:none;display:flex;flex-direction:column;gap:2px;margin:0;padding:0}',
    '.onav-mm a{display:flex;align-items:center;gap:9px;padding:11px 12px;border-radius:6px;font-size:14px;color:var(--text-s,rgba(232,240,245,.65));text-decoration:none}',
    '.onav-mm a:hover,.onav-mm a.active{color:var(--acc,#2dd4c8);background:var(--acc-sub,rgba(45,212,200,.10))}',
    '@media(max-width:1200px){.onav-edu span{display:none}.onav-edu{padding:5px 8px}}',
    '@media(max-width:900px){.onav-links,.onav-edu{display:none}.onav-ham{display:flex}}',
    '@media(max-width:768px){.onav-un{display:none}}'
  ].join('');
  document.head.appendChild(css);

  // ── markup ──
  function linkA(l, core) {
    const attr = l.i18n ? ' data-i18n="'+l.i18n+'"' : '';
    return '<a href="' + abs(l.href) + '" class="' + (core ? 'core ' : '') + (isActive(l.href) ? 'active' : '') + '"><span class="onav-ic">' + l.icon + '</span><span' + attr + '>' + l.label + '</span></a>';
  }
  var coreHTML = CORE.map(function (l) { var roleAttr = l.role ? ' data-nav-role="'+l.role+'"' : ''; return '<li' + roleAttr + '>' + linkA(l, true) + '</li>'; }).join('');
  var groupHTML = GROUPS.map(function (g) {
    var items = g.items.map(function (it) {
      const kAttr = it.i18n ? ' data-i18n="'+it.i18n+'"' : '';
      const roleAttr = it.role ? ' data-nav-role="'+it.role.join(',')+'"' : '';
      return '<a href="' + abs(it.href) + '"' + roleAttr + '><span class="dt"' + kAttr + '>' + it.icon + ' ' + it.title + '</span><span class="ds">' + it.sub + '</span></a>';
    }).join('');
    const gAttr = g.i18n ? ' data-i18n="'+g.i18n+'"' : '';
    const gRoleAttr = g.role ? ' data-nav-role="'+g.role.join(',')+'"' : '';
    return '<li class="onav-g"' + gRoleAttr + '><button class="onav-gbtn" aria-haspopup="true"><span class="onav-ic">' + g.icon + '</span><span' + gAttr + '>' + g.label + '</span><span class="onav-chev">▾</span></button><div class="onav-drop">' + items + '</div></li>';
  }).join('');

  var nav = document.createElement('nav');
  nav.className = 'onav';
  nav.innerHTML =
    '<a href="' + abs('index.html') + '" class="onav-logo"><div class="onav-mark">OR</div><span class="onav-name">Omni<span>Rad</span></span></a>' +
    '<ul class="onav-links">' + coreHTML + '<li class="onav-sep" aria-hidden="true"></li>' + groupHTML + '</ul>' +
    '<div class="onav-end">' +
      '<span class="onav-edu"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span data-i18n="common.educational">Educational use only</span></span>' +
      '<button class="onav-ib" id="onavSearch" title="Search (Ctrl+K)">🔎</button>' +
      '<button class="onav-ib onav-lang" id="onavLang" title="Language">🌐</button>' +
      '<button class="onav-ib" id="onavTheme" title="Toggle theme">☀</button>' +
      '<div class="onav-uw" id="onavBellWrap" style="display:none;position:relative"><button class="onav-ib" id="onavBell" title="Notifications">🔔<span id="onavBellCount" style="position:absolute;top:-4px;inset-inline-end:-4px;background:var(--acc);color:var(--acc-ink);border-radius:999px;padding:1px 5px;font-size:9px;font-weight:800;display:none">0</span></button>' +
        '<div class="onav-udrop" id="onavBellDrop" style="min-width:320px;max-height:60vh;overflow-y:auto;padding:6px"><div id="onavBellList" style="padding:8px;font-size:12px;color:var(--text-m);text-align:center">Loading…</div></div>' +
      '</div>' +
      '<div class="onav-uw" id="onavUserWrap"><div class="onav-ua" id="onavUser" tabindex="0" title="Account"><div class="onav-av" id="onavAva">…</div></div>' +
        '<div class="onav-udrop"><div class="onav-uhead"><div class="un" id="onavHeadName">…</div><div class="ue" id="onavHeadEmail"></div><div class="ur" id="onavHeadRole"></div></div><a href="' + abs('pages/contribute.html') + '" data-nav-role="admin,contributor"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-inline-end:6px"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg><span data-i18n="common.contribute">Contribute</span></a><a href="' + abs('pages/profile.html') + '" data-i18n="common.profile">👤 My Profile</a><a href="' + abs('index.html') + '#about" data-i18n="common.about">ℹ️ About</a><div class="onav-udsep"></div><a href="' + abs('pages/auth.html') + '" id="onavSignOut"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg><span data-i18n="common.signOut">Sign Out</span></a></div>' +
      '</div>' +
      '<button class="onav-ham" id="onavHam" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
    '</div>';

  var mm = document.createElement('div');
  mm.className = 'onav-mm';
  mm.id = 'onavMM';
  var mmCore = CORE.map(function (l) { var roleAttr = l.role ? ' data-nav-role="'+l.role+'"' : ''; return '<li' + roleAttr + '><a href="' + abs(l.href) + '" class="' + (isActive(l.href) ? 'active' : '') + '">' + l.icon + ' ' + l.label + '</a></li>'; }).join('');
  var mmGroups = GROUPS.map(function (g) {
    return '<div class="onav-mmg">' + g.label + '</div><ul>' + g.items.map(function (it) {
      return '<li><a href="' + abs(it.href) + '" class="' + (isActive(it.href) ? 'active' : '') + '">' + it.icon + ' ' + it.title + '</a></li>';
    }).join('') + '</ul>';
  }).join('');
  mm.innerHTML = '<div class="onav-mmg">Explore</div><ul>' + mmCore + '</ul>' + mmGroups +
    '<div class="onav-mmg">Account</div><ul><li><a href="' + abs('index.html') + '#about">ℹ️ About</a></li><li><a href="' + abs('pages/auth.html') + '">🔐 Sign Out</a></li></ul>';

  function mount() {
    document.body.insertBefore(nav, document.body.firstChild);
    document.body.insertBefore(mm, nav.nextSibling);
    // ensure page content clears the fixed nav
    if (!document.querySelector('.page,[data-onav-pad]')) {
      document.body.style.paddingTop = document.body.style.paddingTop || 'var(--onav-h)';
    }
    wire();
  }

  function wire() {
    var ham = document.getElementById('onavHam');
    ham.addEventListener('click', function () {
      var open = mm.classList.toggle('open');
      ham.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', open);
    });
    mm.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { mm.classList.remove('open'); ham.classList.remove('open'); });
    });
    document.addEventListener('click', function (e) {
      if (!ham.contains(e.target) && !mm.contains(e.target)) { mm.classList.remove('open'); ham.classList.remove('open'); }
    });
    // Search button — bind programmatically to avoid HTML-entity parse issues
    var sBtn = document.getElementById('onavSearch');
    if (sBtn) sBtn.addEventListener('click', function(){ if (window.OmniRadSearch) OmniRadSearch.open(); });
    // User dropdown — click-to-toggle (works on touch + keyboard, not only hover)
    var uw = document.getElementById('onavUserWrap');
    var ua = document.getElementById('onavUser');
    if (uw && ua){
      ua.addEventListener('click', function(e){
        e.stopPropagation();
        uw.classList.toggle('open');
      });
      ua.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); uw.classList.toggle('open'); }
        if (e.key === 'Escape') uw.classList.remove('open');
      });
      document.addEventListener('click', function(e){
        if (!uw.contains(e.target)) uw.classList.remove('open');
      });
      uw.querySelectorAll('.onav-udrop a').forEach(function(a){
        a.addEventListener('click', function(){ uw.classList.remove('open'); });
      });
    }
    // theme
    var html = document.documentElement;
    var btn = document.getElementById('onavTheme');
    var ICONS = { dark: '☀', dim: '☾' };
    var saved = localStorage.getItem('omnirad-theme') || 'dark';
    html.dataset.theme = saved; btn.textContent = ICONS[saved];
    btn.addEventListener('click', function () {
      var next = html.dataset.theme === 'dark' ? 'dim' : 'dark';
      html.dataset.theme = next; btn.textContent = ICONS[next];
      localStorage.setItem('omnirad-theme', next);
    });
    // Hide role-gated nav items by default; reveal after auth check
    document.querySelectorAll('[data-nav-role]').forEach(function(el){ el.style.display = 'none'; });
    async function syncUser(){
      if (!window.OmniRadAuth || !OmniRadAuth.client) return;
      try {
        const { data:{ session } } = await OmniRadAuth.client.auth.getSession();
        var nameEl = document.getElementById('onavName');
        var avaEl = document.getElementById('onavAva');
        var gHeadName = document.getElementById('onavHeadName');
        var gHeadEmail = document.getElementById('onavHeadEmail');
        var gHeadRole = document.getElementById('onavHeadRole');
        if (!session){
          if(gHeadName) gHeadName.textContent='Guest';
          if(gHeadEmail) gHeadEmail.textContent='Not signed in';
          if(gHeadRole) gHeadRole.textContent='';
          if(avaEl) avaEl.textContent='?';
          // Rewire dropdown links for guest → all point to sign in
          var authUrl = BASE + 'pages/auth.html';
          document.querySelectorAll('.onav-uw .onav-udrop a').forEach(function(a){
            a.href = authUrl;
            var txt = a.textContent.trim().toLowerCase();
            if (txt.indexOf('sign out') !== -1 || txt.indexOf('تسجيل الخروج') !== -1){
              a.innerHTML = '🔐 <span data-i18n="common.signIn">Sign in</span>';
            }
          });
          // Also make the avatar itself click straight to auth
          var ua = document.getElementById('onavUser');
          if (ua){ ua.style.cursor = 'pointer'; ua.onclick = function(){ location.href = authUrl; }; }
          return;
        }
        const { data:profile } = await OmniRadAuth.client.from('profiles').select('display_name, email, role, avatar_url').eq('id', session.user.id).maybeSingle();
        const fullName = (profile && (profile.display_name || (profile.email||'').split('@')[0])) || session.user.email || 'User';
        var headName = document.getElementById('onavHeadName');
        var headEmail = document.getElementById('onavHeadEmail');
        var headRole = document.getElementById('onavHeadRole');
        if (headName) { headName.textContent = fullName; headName.title = fullName; }
        if (headEmail) headEmail.textContent = (profile && profile.email) || session.user.email || '';
        var roleTxt = (profile && profile.role) || 'viewer';
        if (headRole) headRole.textContent = roleTxt;
        var ua = document.getElementById('onavUser');
        if (ua) ua.setAttribute('title', fullName);
        const initials = fullName.split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase() || 'U';
        if (avaEl){
          const url = (profile && profile.avatar_url) || '';
          const key = url + '|' + initials;
          if (avaEl.__lastKey !== key) {
            avaEl.__lastKey = key;
            if (url && url.startsWith('preset:')){
              const svg = window.__omniradPresets && window.__omniradPresets[url.slice(7)];
              if (svg) avaEl.innerHTML = svg.replace('<svg','<svg width="80%" height="80%"');
              else avaEl.textContent = initials;
            } else if (url){
              avaEl.innerHTML = '<img src="'+url+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
            } else {
              avaEl.textContent = initials;
            }
          }
        }
        const role = (profile && profile.role) || 'viewer';
        document.querySelectorAll('[data-nav-role]').forEach(function(el){
          const allowed = (el.getAttribute('data-nav-role')||'').split(',');
          el.style.display = allowed.includes(role) ? '' : 'none';
        });
      } catch(e){ console.warn('[onav] syncUser', e); }
    }
    (function pollAuth(){
      if (window.OmniRadAuth && OmniRadAuth.client) return syncUser();
      setTimeout(pollAuth, 120);
    })();

    // Re-sync when profile page (or others) updates the user's avatar/profile
    window.addEventListener('omnirad:profile-updated', function(){ syncUser(); });

    /* ─── Bell notifications ─── */
    async function bellRender(){
      if (!window.OmniRadAuth || !OmniRadAuth.client) return;
      const bellWrap = document.getElementById('onavBellWrap');
      const list = document.getElementById('onavBellList');
      const count = document.getElementById('onavBellCount');
      try {
        const { data:{ session } } = await OmniRadAuth.client.auth.getSession();
        if (!session){ bellWrap.style.display = 'none'; return; }
        bellWrap.style.display = 'inline-block';
        const { data, error } = await OmniRadAuth.client.from('notifications')
          .select('*').eq('user_id', session.user.id)
          .order('created_at', { ascending:false }).limit(15);
        if (error) throw error;
        const unread = (data||[]).filter(n => !n.read_at).length;
        count.textContent = unread; count.style.display = unread ? 'inline-block' : 'none';
        if (!data || !data.length){ list.innerHTML = '<div style="padding:12px;color:var(--text-m);font-size:12px;text-align:center">No notifications</div>'; return; }
        list.innerHTML = data.map(n => {
          const link = n.link
            ? (n.link.startsWith('http') ? n.link : (BASE + n.link.replace(/^\/+/, '')))
            : '#';
          return `
          <a href="${link}" data-nid="${n.id}" data-read="${n.read_at?1:0}" style="display:flex;flex-direction:column;padding:9px 11px;border-radius:6px;text-decoration:none;color:var(--text-s);background:${n.read_at?'transparent':'var(--acc-sub)'}">
            <div style="font-size:12.5px;font-weight:700;color:${n.read_at?'var(--text-s)':'var(--acc)'}">${n.title || n.kind}</div>
            ${n.body ? `<div style="font-size:11.5px;color:var(--text-m);margin-top:2px">${n.body}</div>` : ''}
            <div style="font-size:10px;color:var(--text-m);margin-top:4px;font-family:'IBM Plex Mono',monospace">${new Date(n.created_at).toLocaleString('en-GB')}</div>
          </a>`;
        }).join('');
        list.querySelectorAll('[data-nid]').forEach(a => a.addEventListener('click', async e => {
          const id = a.dataset.nid;
          if (a.dataset.read === '0'){ try { await OmniRadAuth.client.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id); } catch(_){} bellRender(); }
        }));
      } catch(e){ console.warn('[bell]', e); list.innerHTML = '<div style="padding:12px;color:var(--err);font-size:11px">'+e.message+'</div>'; }
    }
    (async function subscribe(){
      let tries = 0;
      while (!(window.OmniRadAuth && OmniRadAuth.client) && tries < 40){ await new Promise(r=>setTimeout(r,80)); tries++; }
      if (!window.OmniRadAuth) return;
      bellRender();
      // Mark all unread as read when the bell menu opens (hover / focus / touch)
      const bellWrap = document.getElementById('onavBellWrap');
      async function markAllRead(){
        try {
          const { data:{ session } } = await OmniRadAuth.client.auth.getSession();
          if (!session) return;
          const res = await OmniRadAuth.client.from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('user_id', session.user.id).is('read_at', null).select('id');
          if (res && res.data && res.data.length) bellRender();
        } catch(_){}
      }
      if (bellWrap){
        let opened = false;
        bellWrap.addEventListener('mouseenter', () => { if (!opened){ opened = true; markAllRead(); } });
        bellWrap.addEventListener('mouseleave', () => { opened = false; });
        bellWrap.addEventListener('focusin', markAllRead);
        // touch: also mark on button tap
        const bellBtn = document.getElementById('onavBell');
        if (bellBtn) bellBtn.addEventListener('click', markAllRead);
      }
      try {
        const { data:{ session } } = await OmniRadAuth.client.auth.getSession();
        if (!session) return;
        OmniRadAuth.client.channel('notif-'+session.user.id)
          .on('postgres_changes', { event:'INSERT', schema:'public', table:'notifications', filter:'user_id=eq.'+session.user.id }, () => bellRender())
          .subscribe();
      } catch(e){ console.warn('[bell subscribe]', e); }
    })();
    // hook into existing auth if present
    if (window.OmniRadAuth && typeof OmniRadAuth.updateNav === 'function') {
      try { OmniRadAuth.updateNav(); } catch (e) {}
    }
    // Language toggle
    var langBtn = document.getElementById('onavLang');
    if (langBtn && window.OmniRadI18n) {
      var setLangText = function(){ langBtn.textContent = OmniRadI18n.lang === 'ar' ? '🌐 EN' : '🌐 عربي'; };
      setLangText();
      langBtn.addEventListener('click', function(){ OmniRadI18n.toggle(); setLangText(); });
      window.addEventListener('omnirad-lang', setLangText);
    } else if (langBtn) {
      langBtn.style.display = 'none';
    }
    // Apply i18n immediately if available
    if (window.OmniRadI18n) OmniRadI18n.applyToDOM();
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
