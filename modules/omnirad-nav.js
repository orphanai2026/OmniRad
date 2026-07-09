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

  var script = document.currentScript;
  var BASE = (script && script.getAttribute('data-base')) || '';

  // Nav model — single source of truth for every page
  var CORE = [
    { href: 'pages/atlas.html',       icon: '📖', label: 'Atlas',   i18n: 'nav.atlas' },
    { href: 'pages/comparison.html',  icon: '⚖',  label: 'Compare', i18n: 'nav.compare' }
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
    ]}
  ];

  var here = location.pathname.split('/').pop() || 'index.html';
  function abs(h) { return BASE + h; }
  function isActive(h) { return h.split('/').pop() === here; }

  // ── styles ──
  var css = document.createElement('style');
  css.textContent = [
    ':root{--onav-h:56px}',
    '.onav{position:fixed;top:0;left:0;right:0;height:var(--onav-h);background:rgba(8,14,20,.92);border-bottom:1px solid var(--border,rgba(45,212,200,.12));display:flex;align-items:center;padding:0 24px;gap:20px;z-index:200;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}',
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
    '.onav-edu{font-size:10px;padding:5px 10px;border-radius:6px;border:1px solid var(--border-s,rgba(232,240,245,.08));color:var(--text-m,rgba(232,240,245,.38));display:flex;align-items:center;gap:5px;white-space:nowrap}',
    '.onav-ib{width:32px;height:32px;border-radius:6px;background:var(--bg-ov,#162030);border:1px solid var(--border-s,rgba(232,240,245,.08));color:var(--text-m,rgba(232,240,245,.38));cursor:pointer;display:grid;place-items:center;font-size:13px;flex-shrink:0;transition:color .15s}',
    '.onav-lang{width:auto!important;height:32px;min-width:auto;padding:0 14px;font-size:12px;font-weight:800;font-family:inherit;letter-spacing:.03em;color:var(--acc,#2dd4c8);background:var(--acc-sub,rgba(45,212,200,.1));border:1.5px solid var(--acc-dim,rgba(45,212,200,.55));border-radius:999px;gap:6px}',
    '.onav-lang:hover{background:var(--acc,#2dd4c8);color:var(--acc-ink,#08100e);border-color:var(--acc,#2dd4c8)}',
    'body[dir="rtl"] .onav-lang{font-size:13px;letter-spacing:0}',
    '.onav-ib:hover{color:var(--acc,#2dd4c8)}',
    '.onav-uw{position:relative}',
    '.onav-ua{display:flex;align-items:center;gap:7px;cursor:pointer;padding:4px 9px;border-radius:6px;transition:background .15s}',
    '.onav-ua:hover{background:var(--bg-ov,#162030)}',
    '.onav-av{width:28px;height:28px;border-radius:50%;background:var(--acc-sub,rgba(45,212,200,.10));border:1.5px solid var(--acc-dim,rgba(45,212,200,.55));display:grid;place-items:center;font-size:10px;font-weight:700;color:var(--acc,#2dd4c8)}',
    '.onav-un{font-size:12px;color:var(--text-s,rgba(232,240,245,.65))}',
    '.onav-udrop{position:absolute;top:calc(100% + 6px);right:0;min-width:200px;background:var(--bg-e,#101e2a);border:1px solid var(--border,rgba(45,212,200,.12));border-radius:10px;padding:6px;box-shadow:0 12px 34px -12px rgba(0,0,0,.6);opacity:0;visibility:hidden;transform:translateY(-6px);transition:all .16s;z-index:210}',
    '.onav-uw:hover .onav-udrop,.onav-uw:focus-within .onav-udrop{opacity:1;visibility:visible;transform:translateY(0)}',
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
    '@media(max-width:900px){.onav-links,.onav-edu{display:none}.onav-ham{display:flex}}',
    '@media(max-width:768px){.onav-un{display:none}}'
  ].join('');
  document.head.appendChild(css);

  // ── markup ──
  function linkA(l, core) {
    const attr = l.i18n ? ' data-i18n="'+l.i18n+'"' : '';
    return '<a href="' + abs(l.href) + '" class="' + (core ? 'core ' : '') + (isActive(l.href) ? 'active' : '') + '"><span class="onav-ic">' + l.icon + '</span><span' + attr + '>' + l.label + '</span></a>';
  }
  var coreHTML = CORE.map(function (l) { return '<li>' + linkA(l, true) + '</li>'; }).join('');
  var groupHTML = GROUPS.map(function (g) {
    var items = g.items.map(function (it) {
      const kAttr = it.i18n ? ' data-i18n="'+it.i18n+'"' : '';
      return '<a href="' + abs(it.href) + '"><span class="dt"' + kAttr + '>' + it.icon + ' ' + it.title + '</span><span class="ds">' + it.sub + '</span></a>';
    }).join('');
    const gAttr = g.i18n ? ' data-i18n="'+g.i18n+'"' : '';
    return '<li class="onav-g"><button class="onav-gbtn" aria-haspopup="true"><span class="onav-ic">' + g.icon + '</span><span' + gAttr + '>' + g.label + '</span><span class="onav-chev">▾</span></button><div class="onav-drop">' + items + '</div></li>';
  }).join('');

  var nav = document.createElement('nav');
  nav.className = 'onav';
  nav.innerHTML =
    '<a href="' + abs('index.html') + '" class="onav-logo"><div class="onav-mark">OR</div><span class="onav-name">Omni<span>Rad</span></span></a>' +
    '<ul class="onav-links">' + coreHTML + '<li class="onav-sep" aria-hidden="true"></li>' + groupHTML + '</ul>' +
    '<div class="onav-end">' +
      '<span class="onav-edu"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span data-i18n="common.educational">Educational use only</span></span>' +
      '<button class="onav-ib onav-lang" id="onavLang" title="Language">🌐</button>' +
      '<button class="onav-ib" id="onavTheme" title="Toggle theme">☀</button>' +
      '<div class="onav-uw"><div class="onav-ua" id="onavUser" tabindex="0"><div class="onav-av" id="onavAva">DA</div><span class="onav-un" id="onavName">Dr. Dany</span><span style="font-size:10px;color:var(--text-m,rgba(232,240,245,.38))">▾</span></div>' +
        '<div class="onav-udrop"><a href="' + abs('index.html') + '#about" data-i18n="common.about">ℹ️ About</a><div class="onav-udsep"></div><a href="' + abs('pages/auth.html') + '" id="onavSignOut"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg><span data-i18n="common.signOut">Sign Out</span></a></div>' +
      '</div>' +
      '<button class="onav-ham" id="onavHam" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
    '</div>';

  var mm = document.createElement('div');
  mm.className = 'onav-mm';
  mm.id = 'onavMM';
  var mmCore = CORE.map(function (l) { return '<li><a href="' + abs(l.href) + '" class="' + (isActive(l.href) ? 'active' : '') + '">' + l.icon + ' ' + l.label + '</a></li>'; }).join('');
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
