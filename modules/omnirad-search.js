/* ═══════════════════════════════════════════════════════════════════════
 * OmniRad — Global Cross-Language Search (Cmd/Ctrl + K)
 * ────────────────────────────────────────────────────────────────────
 *  A universal palette that searches the anatomical dictionary + pages,
 *  accepting Arabic or English. Opens with Cmd/Ctrl+K or "/" (when not
 *  typing). Results are grouped: Anatomy · Pages · Actions.
 *
 *  Requires: modules/data/anatomy-master.js loaded first.
 *  Auto-loads via omnirad-nav.js if present.
 * ═══════════════════════════════════════════════════════════════════════ */

(function(){
'use strict';
if (!window.OMNIRAD_ANATOMY) return;
const A = window.OMNIRAD_ANATOMY;

function basePath(){
  const s = document.currentScript;
  if (s && s.dataset && s.dataset.base) return s.dataset.base;
  return /\/pages\//.test(location.pathname) ? '../' : '';
}
const BASE = basePath();
const isAr = () => window.OmniRadI18n && OmniRadI18n.lang === 'ar';

const PAGES = [
  { href:'pages/atlas.html',       icon:'📖', en:'Atlas',             ar:'الأطلس' },
  { href:'pages/dictionary.html',  icon:'🔠', en:'Anatomical Dictionary', ar:'القاموس التشريحي' },
  { href:'pages/comparison.html',  icon:'⚖', en:'Comparison',         ar:'المقارنة' },
  { href:'pages/studio.html',      icon:'🎨', en:'Studio (Prompt tool)', ar:'الأستوديو' },
  { href:'pages/review.html',      icon:'📋', en:'Review Queue',       ar:'قائمة المراجعة' },
  { href:'pages/admin.html',       icon:'🔒', en:'Admin Console',      ar:'لوحة الأدمن' },
  { href:'pages/profile.html',     icon:'👤', en:'My Profile',         ar:'ملفي' },
  { href:'pages/contributors.html',icon:'👥', en:'Contributors',       ar:'المساهمون' },
  { href:'pages/contact.html',     icon:'✉️', en:'Contact',            ar:'تواصل' }
];

/* ─── Styles ─── */
const style = document.createElement('style');
style.id = 'omnirad-search-styles';
style.textContent = [
  '#omrs-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:none;align-items:flex-start;justify-content:center;z-index:9998;padding-top:12vh}',
  '#omrs-overlay.on{display:flex}',
  '#omrs-box{width:min(680px,92vw);background:var(--bg-e,#101e2a);border:1.5px solid var(--acc,#2dd4c8);border-radius:14px;box-shadow:0 24px 64px rgba(0,0,0,.45);overflow:hidden;display:flex;flex-direction:column;max-height:76vh}',
  '#omrs-head{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid var(--border-s,rgba(232,240,245,.08))}',
  '#omrs-head .omrs-ico{font-size:16px;color:var(--acc,#2dd4c8)}',
  '#omrs-input{flex:1;background:transparent;border:0;color:var(--text,#e8f0f5);font-family:inherit;font-size:16px;outline:none}',
  '#omrs-input::placeholder{color:var(--text-m,rgba(232,240,245,.38))}',
  '#omrs-kbd{font-family:"IBM Plex Mono",monospace;font-size:10.5px;color:var(--text-m,rgba(232,240,245,.38));border:1px solid var(--border-s,rgba(232,240,245,.08));border-radius:5px;padding:2px 6px;letter-spacing:.03em}',
  '#omrs-list{overflow-y:auto;padding:6px 0;flex:1}',
  '.omrs-grp{padding:10px 18px 4px;font-family:"IBM Plex Mono",monospace;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--text-m,rgba(232,240,245,.38))}',
  '.omrs-row{display:flex;align-items:center;gap:12px;padding:10px 18px;cursor:pointer;text-decoration:none;color:var(--text-s,rgba(232,240,245,.65));font-size:14px;transition:background .12s}',
  '.omrs-row:hover,.omrs-row.on{background:var(--acc-sub,rgba(45,212,200,.12));color:var(--acc,#2dd4c8)}',
  '.omrs-row .omrs-i{font-size:15px;line-height:1;min-width:22px;text-align:center}',
  '.omrs-row .omrs-body{flex:1;min-width:0}',
  '.omrs-row .omrs-t{font-weight:700;color:var(--text,#e8f0f5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.omrs-row:hover .omrs-t,.omrs-row.on .omrs-t{color:var(--acc,#2dd4c8)}',
  '.omrs-row .omrs-s{font-size:12px;color:var(--text-m,rgba(232,240,245,.38));margin-top:1px}',
  '.omrs-row .omrs-arrow{font-family:"IBM Plex Mono",monospace;font-size:11px;color:var(--text-m,rgba(232,240,245,.38))}',
  '.omrs-empty{padding:36px 18px;text-align:center;color:var(--text-m,rgba(232,240,245,.38));font-size:13px}',
  '#omrs-foot{padding:9px 18px;border-top:1px solid var(--border-s,rgba(232,240,245,.08));display:flex;justify-content:space-between;font-family:"IBM Plex Mono",monospace;font-size:10.5px;color:var(--text-m,rgba(232,240,245,.38));letter-spacing:.02em}',
  '[data-theme="dim"] #omrs-box{background:#ffffff}',
  '[data-theme="dim"] #omrs-input{color:#0f1e2a}'
].join('');
document.head.appendChild(style);

/* ─── UI shell ─── */
const overlay = document.createElement('div'); overlay.id = 'omrs-overlay';
overlay.innerHTML = `
  <div id="omrs-box" role="dialog" aria-modal="true" aria-label="Search">
    <div id="omrs-head">
      <span class="omrs-ico">🔎</span>
      <input id="omrs-input" placeholder="Search anatomy, pages, actions…" autocomplete="off" spellcheck="false">
      <span id="omrs-kbd">ESC</span>
    </div>
    <div id="omrs-list"></div>
    <div id="omrs-foot">
      <span id="omrs-hint">↑ ↓ navigate · Enter open · ESC close</span>
      <span>Cross-Language Search</span>
    </div>
  </div>`;
document.body.appendChild(overlay);

const input = overlay.querySelector('#omrs-input');
const list  = overlay.querySelector('#omrs-list');
const kbd   = overlay.querySelector('#omrs-kbd');
const foot  = overlay.querySelector('#omrs-hint');
let flatItems = []; // rendered items for keyboard nav
let cursor = 0;

/* Trap: only rebuild on open + on typing */
overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

function open(){
  overlay.classList.add('on');
  input.value = ''; render(''); setTimeout(()=>input.focus(), 30);
  const ar = isAr();
  input.placeholder = ar ? 'ابحث في التشريح، الصفحات، الإجراءات…' : 'Search anatomy, pages, actions…';
  foot.textContent = ar ? '↑ ↓ تنقّل · Enter فتح · ESC إغلاق' : '↑ ↓ navigate · Enter open · ESC close';
}
function close(){ overlay.classList.remove('on'); }

function render(q){
  const ar = isAr();
  const norm = (q||'').trim().toLowerCase();

  // Anatomy matches
  const anat = norm
    ? A.structures.filter(s =>
        s.en.toLowerCase().includes(norm)
        || s.ar.includes(q.trim())
        || (s.aliases||[]).some(a => a.toLowerCase().includes(norm))
      ).slice(0, 15)
    : A.structures.slice(0, 8); // show a preview when empty

  // Page matches
  const pageMatches = norm
    ? PAGES.filter(p => p.en.toLowerCase().includes(norm) || p.ar.includes(q.trim()))
    : PAGES.slice(0, 6);

  flatItems = [];
  let html = '';

  if (anat.length){
    html += '<div class="omrs-grp">' + (ar ? 'المصطلحات التشريحية' : 'Anatomy · ' + anat.length) + '</div>';
    anat.forEach(s => {
      const reg = A.regions.find(r => r.id === s.region);
      const url = BASE + 'pages/dictionary.html?term=' + encodeURIComponent(s.id);
      const t = ar ? (s.ar + ' · ' + s.en) : (s.en + ' · ' + s.ar);
      const sub = (ar ? (reg?reg.ar:'') : (reg?reg.en:'')) + ' · ' + s.rank;
      html += `<a class="omrs-row" href="${url}" data-i="${flatItems.length}">
        <span class="omrs-i">🩻</span>
        <span class="omrs-body"><div class="omrs-t">${t}</div><div class="omrs-s">${sub}</div></span>
        <span class="omrs-arrow">↩</span>
      </a>`;
      flatItems.push(url);
    });
  }

  if (pageMatches.length){
    html += '<div class="omrs-grp">' + (ar ? 'الصفحات' : 'Pages · ' + pageMatches.length) + '</div>';
    pageMatches.forEach(p => {
      const url = BASE + p.href;
      const t = ar ? p.ar : p.en;
      html += `<a class="omrs-row" href="${url}" data-i="${flatItems.length}">
        <span class="omrs-i">${p.icon}</span>
        <span class="omrs-body"><div class="omrs-t">${t}</div><div class="omrs-s">${p.href}</div></span>
        <span class="omrs-arrow">↩</span>
      </a>`;
      flatItems.push(url);
    });
  }

  if (!anat.length && !pageMatches.length){
    html = '<div class="omrs-empty">' + (ar ? 'لا نتائج' : 'No results') + '</div>';
  }

  list.innerHTML = html;
  cursor = 0; highlight();
}

function highlight(){
  const rows = list.querySelectorAll('.omrs-row');
  rows.forEach((r, i) => r.classList.toggle('on', i === cursor));
  const el = rows[cursor];
  if (el) el.scrollIntoView({ block:'nearest' });
}

/* ─── Events ─── */
input.addEventListener('input', () => render(input.value));
input.addEventListener('keydown', (e) => {
  if (e.key === 'Escape'){ e.preventDefault(); close(); return; }
  if (e.key === 'ArrowDown'){ e.preventDefault(); cursor = Math.min(cursor+1, flatItems.length-1); highlight(); return; }
  if (e.key === 'ArrowUp'){ e.preventDefault(); cursor = Math.max(cursor-1, 0); highlight(); return; }
  if (e.key === 'Enter'){
    e.preventDefault();
    const url = flatItems[cursor];
    if (url){ location.href = url; }
    return;
  }
});

/* ─── Global shortcut ─── */
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); open(); return; }
  if (e.key === '/'){
    const tag = (e.target && e.target.tagName || '').toLowerCase();
    if (tag !== 'input' && tag !== 'textarea' && !e.target.isContentEditable){ e.preventDefault(); open(); }
  }
});

/* Public API */
window.OmniRadSearch = { open, close };
})();
