// ═══════════════════════════════════════════════════════════
// OMNIRAD — MEDICAL LEXICON MODULE
// Task #10 · Inline Lexicon Tooltips for atlas.html
//
// Sources: Gray's Anatomy 41st ed. · Dorland's Medical Dictionary
//          Stedman's Medical Dictionary · Netter's Atlas 8th ed.
//
// TTS: American English (en-US) · Male + Female voice selection
// ═══════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────
  const LEX_DATA_PATH = '../data/lexicon.json';

  // Terms to highlight in the atlas (maps display text → lexicon key)
  // Keys must match lexicon.json entries
  const TERM_MAP = {
    'Liver'           : 'liver',
    'Spleen'          : 'spleen',
    'Pancreas'        : 'pancreas',
    'Kidney'          : 'kidney',
    'Gallbladder'     : 'gallbladder',
    'hepatic'         : 'hepatic',
    'Hepatic'         : 'hepatic',
    'splenic'         : 'splenic',
    'Splenic'         : 'splenic',
    'pancreatic'      : 'pancreatic',
    'Pancreatic'      : 'pancreatic',
    'renal'           : 'renal',
    'Renal'           : 'renal',
    'peritoneum'      : 'peritoneum',
    'Peritoneum'      : 'peritoneum',
    'retroperitoneal' : 'retroperitoneal',
    'Retroperitoneal' : 'retroperitoneal',
    'parenchyma'      : 'parenchyma',
    'Parenchyma'      : 'parenchyma',
    'hilum'           : 'hilum',
    'Hilum'           : 'hilum',
    'portal'          : 'portal',
    'Portal'          : 'portal',
    'cortex'          : 'cortex',
    'Cortex'          : 'cortex',
    'medulla'         : 'medulla',
    'Medulla'         : 'medulla',
    'Couinaud'        : 'couinaud',
  };

  // Selectors to scan for terms
  const SCAN_SELECTORS = [
    '.info-txt',
    '.s-name',
    '.meta-val',
    '.tag',
  ];

  // ── State ─────────────────────────────────────────────────
  let lexData   = null;
  let activeTooltip = null;

  // TTS voice preference
  const LEX_TTS = {
    synth   : window.speechSynthesis || null,
    voiceM  : null,  // American male
    voiceF  : null,  // American female
    preferred: 'F',  // default female
  };

  // ── Load data ─────────────────────────────────────────────
  async function loadLexicon() {
    if (lexData) return lexData;
    try {
      const r = await fetch(LEX_DATA_PATH);
      if (!r.ok) throw new Error('Lexicon fetch failed');
      lexData = await r.json();
      return lexData;
    } catch (e) {
      console.warn('[Lexicon] Failed to load:', e.message);
      return null;
    }
  }

  // ── Voice loading (American EN, male + female) ────────────
  function loadVoices() {
    if (!LEX_TTS.synth) return;
    const voices = LEX_TTS.synth.getVoices();
    const enUs   = voices.filter(v => v.lang === 'en-US' || v.lang.startsWith('en-US'));

    // Prefer named voices: common US male/female patterns
    const femalePatterns = ['samantha','zira','ava','susan','karen','victoria','allison'];
    const malePatterns   = ['alex','daniel','david','mark','ryan','tom','fred'];

    LEX_TTS.voiceF = enUs.find(v =>
      femalePatterns.some(p => v.name.toLowerCase().includes(p))
    ) || enUs[0] || null;

    LEX_TTS.voiceM = enUs.find(v =>
      malePatterns.some(p => v.name.toLowerCase().includes(p))
    ) || enUs[1] || enUs[0] || null;
  }

  if (window.speechSynthesis) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }

  // ── Speak a term IPA/pronunciation ───────────────────────
  function lexSpeak(term, ipa, btn) {
    if (!LEX_TTS.synth) return;
    LEX_TTS.synth.cancel();

    const utter  = new SpeechSynthesisUtterance(term);
    utter.lang   = 'en-US';
    utter.rate   = 0.82;
    utter.pitch  = 1.0;

    // Pick male or female voice
    const voice = LEX_TTS.preferred === 'M' ? LEX_TTS.voiceM : LEX_TTS.voiceF;
    if (voice) utter.voice = voice;

    utter.onstart = () => {
      btn.textContent = '⏹';
      btn.classList.add('lex-speaking');
    };
    utter.onend = utter.onerror = () => {
      btn.textContent = '🔊';
      btn.classList.remove('lex-speaking');
    };

    LEX_TTS.synth.speak(utter);
  }

  // ── Build tooltip HTML ────────────────────────────────────
  function buildTooltip(entry, voicePref) {
    const rootsHtml = (entry.roots || []).map(r =>
      `<div class="lex-root"><span class="lex-root-word">${r.root}</span><span class="lex-root-lang">${r.lang}</span><span class="lex-root-meaning">"${r.meaning}"</span></div>`
    ).join('');

    const relatedHtml = (entry.related_terms || []).slice(0, 4)
      .map(t => `<span class="lex-related-tag">${t}</span>`).join('');

    return `
      <div class="lex-tooltip" role="dialog" aria-label="Lexicon: ${entry.term}">
        <div class="lex-tt-header">
          <div class="lex-tt-term-wrap">
            <span class="lex-tt-term">${entry.term}</span>
            <span class="lex-tt-ipa">${entry.ipa || ''}</span>
          </div>
          <div class="lex-tt-voice-controls">
            <button class="lex-voice-btn lex-voice-f ${voicePref === 'F' ? 'active' : ''}" data-voice="F" title="Female voice">♀</button>
            <button class="lex-voice-btn lex-voice-m ${voicePref === 'M' ? 'active' : ''}" data-voice="M" title="Male voice">♂</button>
            <button class="lex-speak-btn" title="Pronounce (American English)">🔊</button>
          </div>
          <button class="lex-tt-close" title="Close">✕</button>
        </div>
        <div class="lex-tt-origin">
          <span class="lex-origin-label">Origin</span>
          <span class="lex-origin-text">${entry.origin}</span>
        </div>
        ${rootsHtml ? `<div class="lex-roots-wrap">${rootsHtml}</div>` : ''}
        <div class="lex-tt-def">${entry.definition}</div>
        ${entry.clinical_note ? `<div class="lex-tt-note">💡 ${entry.clinical_note}</div>` : ''}
        ${relatedHtml ? `<div class="lex-related-wrap"><span class="lex-related-label">See also:</span>${relatedHtml}</div>` : ''}
        <div class="lex-tt-source">📖 ${entry.source || 'Gray\'s Anatomy 41st ed.'}</div>
      </div>
    `;
  }

  // ── Show tooltip ──────────────────────────────────────────
  function showTooltip(trigger, entry) {
    closeTooltip();

    const wrap = document.createElement('div');
    wrap.className  = 'lex-tooltip-wrap';
    wrap.innerHTML  = buildTooltip(entry, LEX_TTS.preferred);

    // Position relative to trigger
    document.body.appendChild(wrap);
    positionTooltip(wrap, trigger);

    // Bind controls
    const closeBtn = wrap.querySelector('.lex-tt-close');
    if (closeBtn) closeBtn.addEventListener('click', closeTooltip);

    const speakBtn = wrap.querySelector('.lex-speak-btn');
    if (speakBtn) {
      speakBtn.addEventListener('click', e => {
        e.stopPropagation();
        lexSpeak(entry.term, entry.ipa, speakBtn);
      });
    }

    // Voice selector
    wrap.querySelectorAll('.lex-voice-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        LEX_TTS.preferred = btn.dataset.voice;
        wrap.querySelectorAll('.lex-voice-btn').forEach(b => b.classList.toggle('active', b === btn));
      });
    });

    // Related term clicks
    wrap.querySelectorAll('.lex-related-tag').forEach(tag => {
      tag.addEventListener('click', async e => {
        e.stopPropagation();
        const key = tag.textContent.toLowerCase().replace(/\s+/g, '_');
        const ld  = await loadLexicon();
        const relEntry = ld ? (ld[key] || null) : null;
        if (relEntry) showTooltip(trigger, relEntry);
      });
    });

    activeTooltip = wrap;

    // Auto-close on outside click
    setTimeout(() => {
      document.addEventListener('click', onOutsideClick, { once: true });
    }, 10);
  }

  function onOutsideClick(e) {
    if (activeTooltip && !activeTooltip.contains(e.target)) {
      closeTooltip();
    }
  }

  function closeTooltip() {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
    if (LEX_TTS.synth) LEX_TTS.synth.cancel();
    document.removeEventListener('click', onOutsideClick);
  }

  // ── Smart positioning ─────────────────────────────────────
  function positionTooltip(wrap, trigger) {
    const tt  = wrap.querySelector('.lex-tooltip');
    if (!tt) return;

    const rect = trigger.getBoundingClientRect();
    const vw   = window.innerWidth;
    const vh   = window.innerHeight;

    // Default: below trigger
    let top  = rect.bottom + window.scrollY + 6;
    let left = rect.left + window.scrollX;

    // Ensure stays in viewport
    const ttW = 320;
    if (left + ttW > vw - 16) left = vw - ttW - 16 + window.scrollX;
    if (left < 8) left = 8;

    // If below fold, open upward
    const estH = 260;
    if (rect.bottom + estH > vh) {
      top = rect.top + window.scrollY - estH - 6;
      if (top < 8) top = 8;
    }

    wrap.style.cssText = `position:absolute;top:${top}px;left:${left}px;z-index:8000;`;
  }

  // ── Text node walker — wrap matching terms ─────────────────
  function wrapTermsIn(container) {
    const terms = Object.keys(TERM_MAP);
    // Sort by length descending so multi-word terms match first
    terms.sort((a, b) => b.length - a.length);

    // Build regex: match whole words only
    const pattern = new RegExp(
      '(' + terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')',
      'g'
    );

    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          // Skip already-wrapped nodes and script/style
          const p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          const tag = p.tagName;
          if (['SCRIPT','STYLE','BUTTON'].includes(tag)) return NodeFilter.FILTER_REJECT;
          if (p.classList.contains('lex-term')) return NodeFilter.FILTER_REJECT;
          if (p.closest('.lex-tooltip-wrap')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    let n;
    while ((n = walker.nextNode())) {
      if (pattern.test(n.textContent)) nodes.push(n);
    }

    nodes.forEach(node => {
      pattern.lastIndex = 0;
      const parts = node.textContent.split(pattern);
      if (parts.length <= 1) return;

      const frag = document.createDocumentFragment();
      parts.forEach(part => {
        if (TERM_MAP[part]) {
          const span = document.createElement('span');
          span.className    = 'lex-term';
          span.textContent  = part;
          span.dataset.key  = TERM_MAP[part];
          span.setAttribute('role', 'button');
          span.setAttribute('tabindex', '0');
          span.setAttribute('title', 'View etymology & definition');
          frag.appendChild(span);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      });

      node.parentNode.replaceChild(frag, node);
    });
  }

  // ── Inject into atlas main content ────────────────────────
  async function inject() {
    const ld = await loadLexicon();
    if (!ld) return;

    SCAN_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        // Skip if already injected
        if (el.dataset.lexInjected) return;
        el.dataset.lexInjected = '1';
        wrapTermsIn(el);
      });
    });

    // Bind click handler (event delegation)
    document.addEventListener('click', async e => {
      const term = e.target.closest('.lex-term');
      if (!term) return;
      e.stopPropagation();

      const key   = term.dataset.key;
      const entry = ld[key];
      if (!entry) return;

      // Toggle: if same term tooltip is open, close it
      if (activeTooltip && activeTooltip.dataset.key === key) {
        closeTooltip();
        return;
      }
      activeTooltip && (activeTooltip.dataset.key = key);
      showTooltip(term, entry);
      if (activeTooltip) activeTooltip.dataset.key = key;
    });

    // Keyboard: Enter/Space on lex-term
    document.addEventListener('keydown', async e => {
      if (!['Enter', ' '].includes(e.key)) return;
      const term = e.target.closest('.lex-term');
      if (!term) return;
      e.preventDefault();
      const key   = term.dataset.key;
      const entry = ld[key];
      if (entry) showTooltip(term, entry);
    });
  }

  // ── MutationObserver: re-inject on render ─────────────────
  function observe() {
    const main = document.getElementById('main');
    if (!main) return;

    const obs = new MutationObserver(() => {
      setTimeout(inject, 250);
    });
    obs.observe(main, { childList: true, subtree: false });
  }

  // ── CSS injection ─────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('lex-styles')) return;
    const style = document.createElement('style');
    style.id = 'lex-styles';
    style.textContent = `
/* ── Lexicon term trigger ────────────────────────────── */
.lex-term {
  border-bottom: 1.5px dotted var(--teal, #39d0b8);
  cursor: pointer;
  color: inherit;
  transition: color .12s, border-color .12s;
  border-radius: 1px;
}
.lex-term:hover,
.lex-term:focus {
  color: var(--teal, #39d0b8);
  border-bottom-style: solid;
  outline: none;
}
.lex-term:focus-visible {
  outline: 2px solid var(--teal, #39d0b8);
  outline-offset: 2px;
  border-radius: 2px;
}

/* ── Tooltip wrapper ─────────────────────────────────── */
.lex-tooltip-wrap {
  pointer-events: auto;
}
.lex-tooltip {
  width: 320px;
  background: var(--bg-r, #1c2128);
  border: 1.5px solid var(--teal3, #1a7a6e);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,.55), 0 0 0 1px rgba(57,208,184,.12);
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-size: .82rem;
  color: var(--tx, #e6edf3);
  overflow: hidden;
  animation: lexFadeIn .15s ease;
}
@keyframes lexFadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Header ──────────────────────────────────────────── */
.lex-tt-header {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .65rem .9rem .55rem;
  border-bottom: 1px solid var(--bdr-s, #21262d);
  background: var(--bg-o, #21262d);
}
.lex-tt-term-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: .1rem;
}
.lex-tt-term {
  font-weight: 600;
  font-size: .95rem;
  color: var(--teal, #39d0b8);
  letter-spacing: -.01em;
}
.lex-tt-ipa {
  font-family: 'IBM Plex Mono', monospace;
  font-size: .72rem;
  color: var(--tx2, #8b949e);
  letter-spacing: .02em;
}

/* ── Voice controls ──────────────────────────────────── */
.lex-tt-voice-controls {
  display: flex;
  align-items: center;
  gap: .25rem;
}
.lex-voice-btn {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid var(--bdr, #30363d);
  background: var(--bg-r, #1c2128);
  color: var(--tx3, #484f58);
  font-size: .72rem;
  cursor: pointer;
  transition: all .12s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  line-height: 1;
}
.lex-voice-btn:hover { border-color: var(--teal2, #2ab5a0); color: var(--tx, #e6edf3); }
.lex-voice-btn.active { background: var(--teal-g, rgba(57,208,184,.18)); border-color: var(--teal, #39d0b8); color: var(--teal, #39d0b8); }
.lex-speak-btn {
  width: 26px;
  height: 26px;
  border-radius: 5px;
  border: 1px solid var(--bdr, #30363d);
  background: var(--bg-r, #1c2128);
  cursor: pointer;
  font-size: .85rem;
  transition: all .12s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}
.lex-speak-btn:hover { border-color: var(--teal, #39d0b8); transform: scale(1.08); }
.lex-speak-btn.lex-speaking { animation: lexPulse .7s infinite; }
@keyframes lexPulse {
  0%,100% { opacity: 1; }
  50%      { opacity: .4; }
}

/* ── Close btn ───────────────────────────────────────── */
.lex-tt-close {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid transparent;
  background: none;
  color: var(--tx3, #484f58);
  cursor: pointer;
  font-size: .75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  transition: all .12s;
  flex-shrink: 0;
}
.lex-tt-close:hover { background: var(--bg-s, #161b22); border-color: var(--bdr, #30363d); color: var(--tx, #e6edf3); }

/* ── Origin ──────────────────────────────────────────── */
.lex-tt-origin {
  display: flex;
  align-items: baseline;
  gap: .5rem;
  padding: .5rem .9rem .35rem;
  border-bottom: 1px solid var(--bdr-s, #21262d);
}
.lex-origin-label {
  font-size: .62rem;
  font-weight: 600;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--tx3, #484f58);
  white-space: nowrap;
  flex-shrink: 0;
}
.lex-origin-text {
  font-size: .78rem;
  color: var(--tx2, #8b949e);
  font-style: italic;
}

/* ── Roots ───────────────────────────────────────────── */
.lex-roots-wrap {
  padding: .4rem .9rem;
  display: flex;
  flex-direction: column;
  gap: .25rem;
  border-bottom: 1px solid var(--bdr-s, #21262d);
}
.lex-root {
  display: flex;
  align-items: baseline;
  gap: .45rem;
  font-size: .78rem;
}
.lex-root-word {
  font-family: 'IBM Plex Mono', monospace;
  color: var(--teal, #39d0b8);
  font-size: .76rem;
  font-weight: 500;
}
.lex-root-lang {
  color: var(--tx3, #484f58);
  font-size: .68rem;
  border: 1px solid var(--bdr-s, #21262d);
  border-radius: 3px;
  padding: 0 .28rem;
  line-height: 1.5;
}
.lex-root-meaning {
  color: var(--tx2, #8b949e);
  font-size: .78rem;
}

/* ── Definition ──────────────────────────────────────── */
.lex-tt-def {
  padding: .5rem .9rem .4rem;
  font-size: .82rem;
  color: var(--tx, #e6edf3);
  line-height: 1.55;
  border-bottom: 1px solid var(--bdr-s, #21262d);
}

/* ── Clinical note ───────────────────────────────────── */
.lex-tt-note {
  padding: .4rem .9rem;
  font-size: .77rem;
  color: var(--tx2, #8b949e);
  line-height: 1.5;
  border-bottom: 1px solid var(--bdr-s, #21262d);
  background: var(--teal-s, rgba(57,208,184,.05));
}

/* ── Related terms ───────────────────────────────────── */
.lex-related-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: .3rem;
  padding: .4rem .9rem;
  border-bottom: 1px solid var(--bdr-s, #21262d);
}
.lex-related-label {
  font-size: .65rem;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--tx3, #484f58);
  margin-right: .1rem;
}
.lex-related-tag {
  font-size: .72rem;
  padding: .15rem .5rem;
  border: 1px solid var(--bdr, #30363d);
  border-radius: 99px;
  color: var(--tx2, #8b949e);
  background: var(--bg-r, #1c2128);
  cursor: pointer;
  transition: all .12s;
  font-family: 'IBM Plex Mono', monospace;
}
.lex-related-tag:hover {
  border-color: var(--teal2, #2ab5a0);
  color: var(--teal, #39d0b8);
  background: var(--teal-s, rgba(57,208,184,.08));
}

/* ── Source ──────────────────────────────────────────── */
.lex-tt-source {
  padding: .35rem .9rem .5rem;
  font-size: .67rem;
  color: var(--tx3, #484f58);
  font-style: italic;
  line-height: 1.4;
}

/* ── Dim mode overrides ──────────────────────────────── */
[data-theme="dim"] .lex-tooltip {
  background: var(--bg-r);
  border-color: var(--teal3);
  box-shadow: 0 8px 32px rgba(0,0,0,.2), 0 0 0 1px rgba(13,110,97,.18);
}
[data-theme="dim"] .lex-tt-header { background: var(--bg-o); }
    `;
    document.head.appendChild(style);
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    injectStyles();
    // Initial inject after first render
    setTimeout(inject, 400);
    observe();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
