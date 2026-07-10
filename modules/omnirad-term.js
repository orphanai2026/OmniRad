/* ═══════════════════════════════════════════════════════════════════════
 * OmniRad — Anatomical Intelligence Layer  (omnirad-term)
 * ────────────────────────────────────────────────────────────────────
 *  Any element with `data-term="<id>"` becomes a smart anatomical term:
 *  hover / focus → tooltip with EN + AR + pronunciation + region badge
 *  + link to Atlas. The term id must resolve via OMNIRAD_ANATOMY.
 *
 *  Also exposes: OmniRadTerm.linkText(el) — scan an element's text and
 *  auto-wrap any known term (by alias) in a <span data-term>. Use only
 *  on curated blocks; scanning entire pages is not safe.
 *
 *  Requires: modules/data/anatomy-master.js loaded first.
 *  Requires: modules/speak.js for pronunciation (optional; falls back
 *  to Web Speech API if OmniRadSpeak missing).
 * ═══════════════════════════════════════════════════════════════════════ */

(function(){
'use strict';

if (!window.OMNIRAD_ANATOMY) {
  console.warn('[omnirad-term] anatomy-master.js not loaded; term intelligence disabled.');
  return;
}

const A = window.OMNIRAD_ANATOMY;

/* Base path back to repo root (for links). Nav script owns this info
   via data-base on <script> tag; we fall back sensibly. */
function basePath(){
  var s = document.currentScript;
  if (s && s.dataset && s.dataset.base) return s.dataset.base;
  const inPagesFolder = /\/pages\//.test(location.pathname);
  return inPagesFolder ? '../' : '';
}
const BASE = basePath();

/* ─── Styles (injected once) ─── */
const css = document.createElement('style');
css.id = 'omnirad-term-styles';
css.textContent = [
  '[data-term]{cursor:help;border-bottom:1px dotted var(--acc,#2dd4c8);text-decoration:none;transition:background .15s,color .15s}',
  '[data-term]:hover{background:var(--acc-sub,rgba(45,212,200,.12));color:var(--acc,#2dd4c8)}',
  '.omrt-pop{position:fixed;z-index:9999;min-width:280px;max-width:360px;background:var(--panel,#0f1620);border:1px solid var(--acc,#2dd4c8);border-radius:12px;padding:14px 16px;box-shadow:0 12px 36px rgba(0,0,0,.5);color:var(--text,#e8f0f5);font-family:inherit;font-size:13.5px;line-height:1.55;opacity:0;transform:translateY(6px);transition:opacity .18s,transform .18s;pointer-events:none}',
  '.omrt-pop.on{opacity:1;transform:translateY(0);pointer-events:auto}',
  '.omrt-pop .omrt-en{font-size:16px;font-weight:800;color:var(--text);letter-spacing:-.01em;margin:0}',
  '.omrt-pop .omrt-ar{font-size:15px;font-weight:700;color:var(--text);margin:4px 0 0;direction:rtl;text-align:right}',
  '.omrt-pop .omrt-meta{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}',
  '.omrt-pop .omrt-chip{font-family:"IBM Plex Mono",monospace;font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:3px 9px;border-radius:999px;background:var(--acc-sub);color:var(--acc);border:1px solid var(--acc-sub)}',
  '.omrt-pop .omrt-chip.rank{background:transparent;color:var(--text-m);border-color:var(--border-s)}',
  '.omrt-pop .omrt-row{display:flex;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap}',
  '.omrt-pop .omrt-btn{display:inline-flex;align-items:center;gap:6px;font-family:inherit;font-size:11.5px;font-weight:700;padding:6px 11px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--text-s);cursor:pointer;text-decoration:none;transition:all .15s}',
  '.omrt-pop .omrt-btn:hover{border-color:var(--acc);color:var(--acc);background:var(--acc-sub)}',
  '.omrt-pop .omrt-btn.primary{background:var(--acc);color:var(--acc-ink);border-color:var(--acc)}',
  '.omrt-pop .omrt-btn.primary:hover{background:transparent;color:var(--acc)}',
  '.omrt-pop .omrt-parent{margin-top:9px;font-size:11.5px;color:var(--text-m);font-family:"IBM Plex Mono",monospace;letter-spacing:.02em}',
  '.omrt-pop .omrt-parent a{color:var(--acc);text-decoration:none}',
  '.omrt-pop .omrt-src{margin-top:9px;padding-top:9px;border-top:1px dashed var(--border-s);font-size:10.5px;color:var(--text-m);font-family:"IBM Plex Mono",monospace}',
  '[data-theme="dim"] .omrt-pop{background:#ffffff;color:#0f3a3a;box-shadow:0 12px 36px rgba(15,58,58,.14)}',
  '[data-theme="dim"] .omrt-pop .omrt-en,[data-theme="dim"] .omrt-pop .omrt-ar{color:#0f3a3a}'
].join('');
document.head.appendChild(css);

/* ─── Popup singleton ─── */
let pop = null, hideTimer = null, currentAnchor = null;
function ensurePop(){
  if (pop) return pop;
  pop = document.createElement('div');
  pop.className = 'omrt-pop';
  pop.setAttribute('role','tooltip');
  pop.addEventListener('mouseenter', () => { clearTimeout(hideTimer); });
  pop.addEventListener('mouseleave', () => { scheduleHide(); });
  document.body.appendChild(pop);
  return pop;
}
function scheduleHide(){
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => { pop && pop.classList.remove('on'); }, 220);
}

function position(anchor){
  const r = anchor.getBoundingClientRect();
  const p = pop.getBoundingClientRect();
  let x = r.left + r.width / 2 - p.width / 2;
  let y = r.bottom + 10;
  if (x < 8) x = 8;
  if (x + p.width > window.innerWidth - 8) x = window.innerWidth - p.width - 8;
  if (y + p.height > window.innerHeight - 8) y = r.top - p.height - 10;
  pop.style.left = x + 'px';
  pop.style.top  = y + 'px';
}

function speak(text, lang){
  if (window.OmniRadSpeak && OmniRadSpeak.say) return OmniRadSpeak.say(text, { lang });
  try {
    const u = new SpeechSynthesisUtterance(text);
    if (lang) u.lang = lang;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch(e){ console.warn('speech synthesis unavailable', e); }
}

function render(struct){
  const isAr = window.OmniRadI18n && OmniRadI18n.lang === 'ar';
  const region = A.regions.find(r => r.id === struct.region);
  const regionLabel = region ? (isAr ? region.ar : region.en) : '';
  const parent = struct.parent ? A.byId[struct.parent] : null;
  const parentLabel = parent ? (isAr ? parent.ar : parent.en) : '';
  const rankLabel = {organ:isAr?'عضو':'organ', substructure:isAr?'بنية فرعية':'substructure', compartment:isAr?'حيّز':'compartment'}[struct.rank] || struct.rank;
  const speakEnLbl = isAr ? '▶ نطق EN' : '▶ Speak EN';
  const speakArLbl = isAr ? '▶ نطق AR' : '▶ نطق';
  const openInAtlas = isAr ? 'افتح في الأطلس ↗' : 'Open in Atlas ↗';
  const parentPrefix = isAr ? 'جزء من:' : 'Part of:';
  const source = A.reference;

  pop.innerHTML =
    '<div class="omrt-en">' + struct.en + '</div>' +
    '<div class="omrt-ar">' + struct.ar + '</div>' +
    '<div class="omrt-meta">' +
      '<span class="omrt-chip">' + regionLabel + '</span>' +
      '<span class="omrt-chip rank">' + rankLabel + '</span>' +
    '</div>' +
    (parent
      ? ('<div class="omrt-parent">' + parentPrefix + ' <a href="#" data-jump="' + parent.id + '">' + parentLabel + '</a></div>')
      : '') +
    '<div class="omrt-row">' +
      '<button type="button" class="omrt-btn" data-speak="en">🔊 ' + speakEnLbl + '</button>' +
      '<button type="button" class="omrt-btn" data-speak="ar">🔊 ' + speakArLbl + '</button>' +
      '<a class="omrt-btn primary" href="' + BASE + 'pages/atlas.html?structure=' + encodeURIComponent(struct.id) + '">' + openInAtlas + '</a>' +
    '</div>' +
    '<div class="omrt-src">' + source + '</div>';

  pop.querySelector('[data-speak="en"]').addEventListener('click', () => speak(struct.en, 'en-US'));
  pop.querySelector('[data-speak="ar"]').addEventListener('click', () => speak(struct.ar, 'ar-SA'));
  const jump = pop.querySelector('[data-jump]');
  if (jump) jump.addEventListener('click', (e) => { e.preventDefault(); showTermById(jump.dataset.jump, currentAnchor); });
}

function showTermById(termIdOrName, anchor){
  ensurePop();
  const id = A.byId[termIdOrName] ? termIdOrName : A.resolveToId(termIdOrName);
  const s = id ? A.byId[id] : null;
  if (!s){ pop.classList.remove('on'); return; }
  currentAnchor = anchor;
  render(s);
  pop.classList.add('on');
  position(anchor);
}

function attach(el){
  if (el.dataset.omrtBound) return;
  el.dataset.omrtBound = '1';
  const openHandler = () => {
    const term = el.dataset.term;
    if (!term) return;
    clearTimeout(hideTimer);
    showTermById(term, el);
  };
  el.addEventListener('mouseenter', openHandler);
  el.addEventListener('focus', openHandler);
  el.addEventListener('mouseleave', scheduleHide);
  el.addEventListener('blur', scheduleHide);
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
}

/* Scan document for [data-term] and bind them */
function scan(root){
  (root || document).querySelectorAll('[data-term]').forEach(attach);
}
scan();

/* Observe DOM for future additions */
const obs = new MutationObserver(muts => {
  muts.forEach(m => {
    m.addedNodes.forEach(n => {
      if (n.nodeType === 1){
        if (n.matches && n.matches('[data-term]')) attach(n);
        if (n.querySelectorAll) n.querySelectorAll('[data-term]').forEach(attach);
      }
    });
  });
});
obs.observe(document.body, { childList: true, subtree: true });

/* Reposition on scroll/resize while visible */
function repos(){
  if (pop && pop.classList.contains('on') && currentAnchor && document.body.contains(currentAnchor)){
    position(currentAnchor);
  } else if (pop && pop.classList.contains('on')){
    pop.classList.remove('on');
  }
}
window.addEventListener('scroll', repos, { passive: true });
window.addEventListener('resize', repos);

/* Re-render current tooltip on language change */
window.addEventListener('omnirad-lang', () => {
  if (currentAnchor && currentAnchor.dataset.term && pop && pop.classList.contains('on')){
    const id = A.byId[currentAnchor.dataset.term] ? currentAnchor.dataset.term : A.resolveToId(currentAnchor.dataset.term);
    if (id) render(A.byId[id]);
  }
});

/* ─── Public API ─── */
window.OmniRadTerm = {
  scan,
  show: showTermById,
  hide: () => { pop && pop.classList.remove('on'); },
  linkText: function(el){
    // Auto-wrap known terms (by exact word match) in the element's text.
    if (!el) return;
    const alias = A.aliasMap;
    const html = el.innerHTML;
    // Sort aliases by length desc so longer terms match first
    const keys = Object.keys(alias).sort((a,b) => b.length - a.length);
    let out = html;
    keys.forEach(k => {
      if (k.length < 4) return; // skip trivially short
      const safe = k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const re = new RegExp('(?<![\\w\\u0621-\\u064A])(' + safe + ')(?![\\w\\u0621-\\u064A])', 'gi');
      out = out.replace(re, '<span data-term="' + alias[k] + '">$1</span>');
    });
    el.innerHTML = out;
    scan(el);
  }
};
})();
