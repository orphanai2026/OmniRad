/* ═══════════════════════════════════════════════════════════════
   OmniRad — Speak module (English pronunciation for anatomical terms)
   ─────────────────────────────────────────────────────────────
   Uses the Web Speech API (built into every modern browser — no
   external files, no network, works offline).

   Usage:
     window.OmniRadSpeak.say('Right kidney');   // default English
     window.OmniRadSpeak.say('الكلية اليمنى', 'ar');
     const btn = OmniRadSpeak.button('Right kidney'); // ready-to-insert <button>
   ═══════════════════════════════════════════════════════════════ */
(function(g){
  'use strict';

  const supported = typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && typeof SpeechSynthesisUtterance !== 'undefined';

  let voices = [];
  function refreshVoices(){ voices = supported ? speechSynthesis.getVoices() : []; }
  if (supported) {
    refreshVoices();
    speechSynthesis.onvoiceschanged = refreshVoices;
  }

  function pickVoice(lang){
    if (!voices.length) return null;
    // Prefer high-quality English voices for anatomy names
    const preferred = ['Samantha','Karen','Google UK English Female','Google US English','Microsoft Aria Online','Microsoft Guy Online'];
    const enVoices = voices.filter(v => /^en/i.test(v.lang));
    if (lang === 'ar') {
      const arV = voices.find(v => /^ar/i.test(v.lang));
      if (arV) return arV;
    }
    for (const name of preferred) {
      const v = enVoices.find(x => x.name === name);
      if (v) return v;
    }
    return enVoices[0] || voices[0];
  }

  function say(text, lang){
    if (!supported || !text) return;
    // Cancel any current speech so consecutive clicks don't queue up
    try { speechSynthesis.cancel(); } catch(_){}
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    u.rate = 0.9;
    u.pitch = 1;
    const v = pickVoice(lang || 'en');
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }

  /* Build a ready-to-insert speaker button.
     Attach with: container.appendChild(OmniRadSpeak.button('Brain')); */
  function button(text, lang, opts){
    opts = opts || {};
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'omr-speak-btn' + (opts.className ? ' ' + opts.className : '');
    b.setAttribute('aria-label', 'Pronounce ' + text);
    b.title = 'Listen · ' + text;
    b.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>';
    b.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border-radius:6px;background:transparent;border:1px solid var(--border,rgba(45,212,200,.15));color:var(--acc,#2dd4c8);cursor:pointer;transition:all .15s;flex-shrink:0';
    b.addEventListener('mouseenter', ()=>{ b.style.background='var(--acc-sub,rgba(45,212,200,.1))'; b.style.borderColor='var(--acc-dim,rgba(45,212,200,.55))'; });
    b.addEventListener('mouseleave', ()=>{ b.style.background='transparent'; b.style.borderColor='var(--border,rgba(45,212,200,.15))'; });
    b.addEventListener('click', (e)=>{ e.stopPropagation(); say(text, lang); });
    return b;
  }

  /* Attach a speaker to an existing element (returns the button). */
  function attach(el, text, lang){
    const b = button(text, lang);
    el.appendChild(b);
    return b;
  }

  g.OmniRadSpeak = { supported, say, button, attach };
})(window);
