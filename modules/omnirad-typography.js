/* ═══════════════════════════════════════════════════════════════════
 * OmniRad — Typography module
 * ────────────────────────────────────────────────────────────────
 * Sets platform-wide font scale + user preference.
 * Reads localStorage 'omnirad-font-scale' (85|100|110|125) and
 * 'omnirad-font-family' ('system'|'inter'|'sans-arabic'|'serif').
 * Load BEFORE nav so every page inherits the same baseline.
 * ═══════════════════════════════════════════════════════════════ */

(function(){
'use strict';

const SCALES = {
  '85':  { base: 14,  h1: 30, h2: 22, h3: 18, small: 12 },
  '100': { base: 15,  h1: 32, h2: 24, h3: 19, small: 12.5 }, // default (larger baseline than before)
  '110': { base: 16.5,h1: 35, h2: 26, h3: 21, small: 13.5 },
  '125': { base: 18,  h1: 38, h2: 28, h3: 22, small: 14.5 }
};

const FAMILIES = {
  system:      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans Arabic", "Segoe UI Arabic", "Cairo", sans-serif',
  inter:       'Inter, "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Arabic", "Cairo", sans-serif',
  sansarabic:  '"Noto Sans Arabic", "Segoe UI Arabic", "Cairo", "IBM Plex Sans Arabic", -apple-system, BlinkMacSystemFont, sans-serif',
  serif:       '"Charter", "Georgia", "Times New Roman", "Amiri", "Noto Naskh Arabic", serif'
};

function currentScale(){
  const s = localStorage.getItem('omnirad-font-scale') || '100';
  return SCALES[s] ? s : '100';
}
function currentFamily(){
  const f = localStorage.getItem('omnirad-font-family') || 'system';
  return FAMILIES[f] ? f : 'system';
}

function apply(){
  const s = SCALES[currentScale()];
  const fam = FAMILIES[currentFamily()];
  const style = document.getElementById('omnirad-typo') || (() => {
    const el = document.createElement('style'); el.id = 'omnirad-typo';
    document.head.appendChild(el); return el;
  })();
  style.textContent =
    ':root{'
    + '--font-base:' + s.base + 'px;'
    + '--font-h1:'   + s.h1   + 'px;'
    + '--font-h2:'   + s.h2   + 'px;'
    + '--font-h3:'   + s.h3   + 'px;'
    + '--font-small:'+ s.small+ 'px;'
    + '--font-stack:' + fam.replace(/"/g,'\'') + ';'
    + '}'
    + 'html,body{font-size:var(--font-base);font-family:var(--font-stack);line-height:1.55}'
    + 'h1,.h1{font-size:var(--font-h1);line-height:1.15}'
    + 'h2,.h2{font-size:var(--font-h2);line-height:1.2}'
    + 'h3,.h3{font-size:var(--font-h3);line-height:1.3}'
    + '.small,small{font-size:var(--font-small)}'
    + 'body[dir="rtl"]{font-family:' + fam.replace(/"/g,'\'') + '}';
}

apply();

// Expose API
window.OmniRadTypography = {
  scales: Object.keys(SCALES),
  families: Object.keys(FAMILIES),
  currentScale, currentFamily,
  setScale: v => { localStorage.setItem('omnirad-font-scale', v); apply(); window.dispatchEvent(new Event('omnirad-typo')); },
  setFamily: v => { localStorage.setItem('omnirad-font-family', v); apply(); window.dispatchEvent(new Event('omnirad-typo')); }
};
})();
