// ═══════════════════════════════════════════════════════════
// SRS MODULE — Task #9
// Spaced Repetition System · SM-2 Algorithm (Anki-compatible)
// Injected into atlas.html via MutationObserver
// Storage: localStorage → key 'omnirad_srs'
// No frameworks · No external dependencies · Vanilla JS
// ═══════════════════════════════════════════════════════════
'use strict';

// ── SM-2 Algorithm ────────────────────────────────────────
// q: quality of response 0–5
//   0 = forgot  (button: نسيت)
//   1 = hard    (button: صعب)
//   3 = good    (button: جيد)
//   5 = easy    (button: سهل)
//
// EF  = Easiness Factor (starts 2.5, min 1.3)
// rep = consecutive correct repetitions
// interval = days until next review
// ─────────────────────────────────────────────────────────
function sm2(card, q) {
  let { rep, interval, ef } = card;

  if (q >= 3) {
    // Correct response
    if (rep === 0)      interval = 1;
    else if (rep === 1) interval = 6;
    else                interval = Math.round(interval * ef);
    rep += 1;
  } else {
    // Incorrect — reset repetitions
    rep      = 0;
    interval = 1;
  }

  // Update EF (Easiness Factor)
  ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ef < 1.3) ef = 1.3;

  const now      = Date.now();
  const nextDate = now + interval * 86400000; // ms per day

  return {
    rep,
    interval,
    ef: Math.round(ef * 100) / 100,
    lastReview : now,
    nextReview : nextDate,
    lastQ      : q,
    totalReviews: (card.totalReviews || 0) + 1,
  };
}

// ── Mastery level (0–100) from card state ─────────────────
function masteryLevel(card) {
  if (!card || card.totalReviews === 0) return 0;
  // Based on interval length (capped at 30 days = 100%)
  const lvl = Math.min(100, Math.round((card.interval / 30) * 100));
  return lvl;
}

// ── Mastery label ─────────────────────────────────────────
function masteryLabel(pct) {
  if (pct === 0)   return { txt: 'New',         cls: 'srs-m-new'    };
  if (pct < 20)    return { txt: 'Learning',    cls: 'srs-m-learn'  };
  if (pct < 50)    return { txt: 'Familiar',    cls: 'srs-m-mid'    };
  if (pct < 80)    return { txt: 'Proficient',  cls: 'srs-m-good'   };
  return             { txt: 'Mastered',      cls: 'srs-m-master' };
}

// ── Storage helpers ────────────────────────────────────────
const SRS_KEY = 'omnirad_srs';

function srsLoad() {
  try { return JSON.parse(localStorage.getItem(SRS_KEY)) || {}; }
  catch { return {}; }
}

function srsSave(data) {
  try { localStorage.setItem(SRS_KEY, JSON.stringify(data)); }
  catch (e) { console.warn('SRS: localStorage write failed', e); }
}

function srsGetCard(structId) {
  const data = srsLoad();
  return data[structId] || { rep: 0, interval: 0, ef: 2.5, totalReviews: 0, nextReview: 0, lastReview: 0, lastQ: null };
}

function srsSetCard(structId, card) {
  const data = srsLoad();
  data[structId] = card;
  srsSave(data);
}

// ── Due check ─────────────────────────────────────────────
function isDue(card) {
  if (!card || card.totalReviews === 0) return true; // never reviewed = due
  return Date.now() >= card.nextReview;
}

function daysUntil(card) {
  if (!card || card.totalReviews === 0) return 0;
  const ms = card.nextReview - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

// ── CSS styles (injected once) ─────────────────────────────
function srsInjectStyles() {
  if (document.getElementById('srs-styles')) return;
  const style = document.createElement('style');
  style.id = 'srs-styles';
  style.textContent = `
/* ══ SRS CARD ══════════════════════════════════════════════ */
.srs-wrap {
  margin: 1.5rem 0 2.5rem;
  background: var(--bg-s);
  border: 1.5px solid var(--bdr);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color .2s;
}
.srs-wrap:focus-within { border-color: var(--teal3); }

.srs-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: .6rem 1.1rem;
  background: var(--bg-r);
  border-bottom: 1px solid var(--bdr-s);
  gap: 1rem;
}
.srs-title {
  font-size: .7rem; font-weight: 600; letter-spacing: .07em;
  text-transform: uppercase; color: var(--tx3);
  display: flex; align-items: center; gap: .45rem;
}
.srs-title-icon { font-size: .9rem; }

.srs-mastery-wrap {
  display: flex; align-items: center; gap: .65rem; flex-shrink: 0;
}
.srs-mastery-bar-bg {
  width: 90px; height: 5px; border-radius: 99px;
  background: var(--bg-o); overflow: hidden; flex-shrink: 0;
}
.srs-mastery-bar-fill {
  height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, var(--teal3), var(--teal));
  transition: width .5s cubic-bezier(.4,0,.2,1);
}
.srs-mastery-badge {
  font-size: .67rem; font-weight: 600; letter-spacing: .05em;
  padding: .15rem .5rem; border-radius: 99px;
  border: 1px solid; white-space: nowrap;
}
.srs-m-new    { color: var(--tx3);   border-color: var(--bdr);   background: var(--bg-o); }
.srs-m-learn  { color: #f0a030;      border-color: #f0a03040;    background: #f0a03010; }
.srs-m-mid    { color: #60b0f0;      border-color: #60b0f040;    background: #60b0f010; }
.srs-m-good   { color: var(--teal);  border-color: var(--teal3); background: var(--teal-s); }
.srs-m-master { color: #90e080;      border-color: #90e08040;    background: #90e08010; }

/* ── Body ─────────────────────────────────────────────── */
.srs-body {
  padding: 1rem 1.25rem 1.25rem;
}
.srs-q {
  font-size: .88rem; color: var(--tx2); margin-bottom: .9rem; line-height: 1.5;
}
.srs-q strong { color: var(--tx); font-weight: 600; }

.srs-btns {
  display: flex; gap: .55rem; flex-wrap: wrap;
}
.srs-btn {
  flex: 1; min-width: 80px;
  padding: .55rem .5rem;
  border-radius: 8px;
  border: 1.5px solid var(--bdr);
  background: var(--bg-r);
  color: var(--tx2);
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-size: .82rem; font-weight: 500;
  cursor: pointer;
  transition: all .14s;
  display: flex; flex-direction: column; align-items: center; gap: .18rem;
}
.srs-btn:hover { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,.25); }
.srs-btn:active { transform: translateY(0); }

.srs-btn[data-q="0"] { border-color: #f06080; }
.srs-btn[data-q="0"]:hover { background: #f0608018; color: #f06080; border-color: #f06080; }
.srs-btn[data-q="1"] { border-color: #f0a030; }
.srs-btn[data-q="1"]:hover { background: #f0a03018; color: #f0a030; border-color: #f0a030; }
.srs-btn[data-q="3"] { border-color: var(--teal3); }
.srs-btn[data-q="3"]:hover { background: var(--teal-s); color: var(--teal); border-color: var(--teal); }
.srs-btn[data-q="5"] { border-color: #90e080; }
.srs-btn[data-q="5"]:hover { background: #90e08018; color: #90e080; border-color: #90e080; }

.srs-btn-en { font-size: .82rem; font-weight: 600; }
.srs-btn-ar { font-size: .72rem; color: var(--tx3); direction: rtl; }

/* ── Feedback (shown after rating) ───────────────────── */
.srs-feedback {
  display: none;
  align-items: center; gap: .75rem;
  padding: .65rem 1rem;
  border-radius: 8px;
  background: var(--bg-o);
  border: 1px solid var(--bdr-s);
  margin-top: .75rem;
  font-size: .82rem;
}
.srs-feedback.visible { display: flex; }
.srs-feedback-icon { font-size: 1.15rem; flex-shrink: 0; }
.srs-feedback-txt { color: var(--tx2); line-height: 1.4; flex: 1; }
.srs-feedback-txt strong { color: var(--tx); }
.srs-feedback-next { color: var(--teal); font-size: .78rem; font-weight: 500; flex-shrink: 0; }

/* ── Due indicator ────────────────────────────────────── */
.srs-due-dot {
  display: inline-block;
  width: 7px; height: 7px; border-radius: 50%;
  background: #f06080;
  box-shadow: 0 0 5px #f06080;
  margin-right: .35rem;
  flex-shrink: 0;
}

/* ── Stats row ────────────────────────────────────────── */
.srs-stats {
  display: flex; gap: 1.5rem; flex-wrap: wrap;
  padding: .55rem 1.25rem;
  border-top: 1px solid var(--bdr-s);
  background: var(--bg-r);
}
.srs-stat {
  display: flex; flex-direction: column; gap: .1rem;
}
.srs-stat-lbl { font-size: .62rem; text-transform: uppercase; letter-spacing: .07em; color: var(--tx3); }
.srs-stat-val { font-size: .82rem; font-weight: 600; color: var(--tx); font-family: 'IBM Plex Mono', monospace; }

/* ── Dashboard link ───────────────────────────────────── */
.srs-dash-link {
  display: inline-flex; align-items: center; gap: .35rem;
  font-size: .72rem; color: var(--tx3);
  text-decoration: none;
  padding: .3rem .7rem;
  border-radius: 6px;
  border: 1px solid var(--bdr-s);
  background: var(--bg-o);
  transition: all .14s;
  cursor: pointer;
}
.srs-dash-link:hover { color: var(--teal); border-color: var(--teal3); background: var(--teal-s); }

/* ── Animated rating flash ────────────────────────────── */
@keyframes srs-flash {
  0%   { opacity: 1; transform: scale(1); }
  50%  { opacity: .5; transform: scale(.97); }
  100% { opacity: 1; transform: scale(1); }
}
.srs-wrap.rated { animation: srs-flash .35s ease; }

/* ── Mobile ───────────────────────────────────────────── */
@media (max-width: 600px) {
  .srs-btns { gap: .4rem; }
  .srs-btn  { min-width: 60px; font-size: .78rem; padding: .5rem .35rem; }
  .srs-mastery-bar-bg { width: 60px; }
  .srs-stats { gap: 1rem; }
}
  `;
  document.head.appendChild(style);
}

// ── Build SRS card HTML ────────────────────────────────────
function srsBuildCard(structId) {
  const card   = srsGetCard(structId);
  const pct    = masteryLevel(card);
  const lbl    = masteryLabel(pct);
  const due    = isDue(card);
  const days   = daysUntil(card);
  const reviews = card.totalReviews || 0;
  const lastDate = card.lastReview ? new Date(card.lastReview).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—';
  const structName = (typeof D !== 'undefined' && D[structId]) ? D[structId].name : structId;

  const dueDot = due && reviews > 0 ? '<span class="srs-due-dot"></span>' : '';
  const nextTxt = reviews === 0 ? 'Not reviewed yet'
                : due ? 'Due for review now'
                : `Next review in ${days} day${days===1?'':'s'}`;

  return `
<div class="srs-wrap" id="srs-card">
  <div class="srs-hdr">
    <div class="srs-title">
      <span class="srs-title-icon">🧠</span>
      Spaced Repetition
    </div>
    <div class="srs-mastery-wrap">
      <div class="srs-mastery-bar-bg">
        <div class="srs-mastery-bar-fill" id="srs-bar" style="width:${pct}%"></div>
      </div>
      <span class="srs-mastery-badge ${lbl.cls}" id="srs-badge">${lbl.txt}</span>
      <button class="srs-dash-link" id="srs-goto-dash" title="Open SRS Dashboard">📊 Dashboard</button>
    </div>
  </div>

  <div class="srs-body">
    <p class="srs-q">
      ${dueDot}How well do you recall <strong>${structName}</strong>?
      <span style="font-size:.75rem;color:var(--tx3);margin-left:.5rem">${nextTxt}</span>
    </p>
    <div class="srs-btns" id="srs-btns">
      <button class="srs-btn" data-q="0" title="I couldn't recall anything">
        <span class="srs-btn-en">Forgot</span>
        <span class="srs-btn-ar">نسيت</span>
      </button>
      <button class="srs-btn" data-q="1" title="I recalled with significant difficulty">
        <span class="srs-btn-en">Hard</span>
        <span class="srs-btn-ar">صعب</span>
      </button>
      <button class="srs-btn" data-q="3" title="I recalled with some effort">
        <span class="srs-btn-en">Good</span>
        <span class="srs-btn-ar">جيد</span>
      </button>
      <button class="srs-btn" data-q="5" title="I recalled easily and confidently">
        <span class="srs-btn-en">Easy</span>
        <span class="srs-btn-ar">سهل</span>
      </button>
    </div>
    <div class="srs-feedback" id="srs-feedback">
      <span class="srs-feedback-icon" id="srs-fb-icon"></span>
      <span class="srs-feedback-txt"  id="srs-fb-txt"></span>
      <span class="srs-feedback-next" id="srs-fb-next"></span>
    </div>
  </div>

  <div class="srs-stats" id="srs-stats-row">
    <div class="srs-stat">
      <span class="srs-stat-lbl">Reviews</span>
      <span class="srs-stat-val" id="srs-s-reviews">${reviews}</span>
    </div>
    <div class="srs-stat">
      <span class="srs-stat-lbl">Interval</span>
      <span class="srs-stat-val" id="srs-s-interval">${reviews===0?'—':card.interval+'d'}</span>
    </div>
    <div class="srs-stat">
      <span class="srs-stat-lbl">Mastery</span>
      <span class="srs-stat-val" id="srs-s-mastery">${pct}%</span>
    </div>
    <div class="srs-stat">
      <span class="srs-stat-lbl">Last Review</span>
      <span class="srs-stat-val" id="srs-s-last">${lastDate}</span>
    </div>
    <div class="srs-stat">
      <span class="srs-stat-lbl">Next Review</span>
      <span class="srs-stat-val" id="srs-s-next">${reviews===0?'—':nextTxt}</span>
    </div>
  </div>
</div>`;
}

// ── Inject SRS card into DOM ───────────────────────────────
function srsInject(structId) {
  // Remove any existing card first
  const old = document.getElementById('srs-card');
  if (old) old.remove();

  // Find injection point: after .xref-sec (last section in #main)
  const main   = document.getElementById('main');
  if (!main) return;
  const xref   = main.querySelector('.xref-sec');
  if (!xref) return;

  const div = document.createElement('div');
  div.innerHTML = srsBuildCard(structId);
  const card = div.firstElementChild;
  xref.insertAdjacentElement('afterend', card);

  // Bind buttons
  srsBindCard(structId);
}

// ── Bind rating buttons ────────────────────────────────────
function srsBindCard(structId) {
  const btns = document.querySelectorAll('#srs-btns .srs-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const q = parseInt(btn.dataset.q, 10);
      srsRate(structId, q);
    });
  });

  // Dashboard button
  const dashBtn = document.getElementById('srs-goto-dash');
  if (dashBtn) {
    dashBtn.addEventListener('click', () => {
      window.open('srs.html', '_blank');
    });
  }
}

// ── Process rating ─────────────────────────────────────────
function srsRate(structId, q) {
  const oldCard = srsGetCard(structId);
  const newCard = sm2(oldCard, q);
  srsSetCard(structId, newCard);

  // Update UI without full re-render (preserve the card)
  srsUpdateCard(structId, newCard, q);

  // Flash animation
  const wrap = document.getElementById('srs-card');
  if (wrap) {
    wrap.classList.add('rated');
    setTimeout(() => wrap.classList.remove('rated'), 400);
  }
}

// ── Update card UI after rating ────────────────────────────
function srsUpdateCard(structId, card, q) {
  const pct  = masteryLevel(card);
  const lbl  = masteryLabel(pct);
  const days = daysUntil(card);

  // Mastery bar
  const bar = document.getElementById('srs-bar');
  if (bar) bar.style.width = pct + '%';

  // Badge
  const badge = document.getElementById('srs-badge');
  if (badge) {
    badge.textContent = lbl.txt;
    badge.className   = `srs-mastery-badge ${lbl.cls}`;
  }

  // Stats row
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const nextTxt = days === 0 ? 'Tomorrow' : `In ${days}d`;
  setEl('srs-s-reviews', card.totalReviews);
  setEl('srs-s-interval', card.interval + 'd');
  setEl('srs-s-mastery', pct + '%');
  setEl('srs-s-last', new Date(card.lastReview).toLocaleDateString('en-GB',{day:'numeric',month:'short'}));
  setEl('srs-s-next', nextTxt);

  // Disable buttons after rating
  const btns = document.querySelectorAll('#srs-btns .srs-btn');
  btns.forEach(b => { b.disabled = true; b.style.opacity = '.4'; b.style.cursor = 'default'; });

  // Show feedback
  const fbWrap = document.getElementById('srs-feedback');
  const fbIcon = document.getElementById('srs-fb-icon');
  const fbTxt  = document.getElementById('srs-fb-txt');
  const fbNext = document.getElementById('srs-fb-next');
  if (fbWrap && fbIcon && fbTxt && fbNext) {
    const msgs = {
      0: { icon: '😔', txt: 'Marked as forgotten — will review <strong>again tomorrow</strong>.' },
      1: { icon: '😤', txt: 'Difficult recall — reviewing again <strong>soon</strong>.' },
      3: { icon: '👍', txt: 'Good recall! Interval extended.' },
      5: { icon: '🌟', txt: 'Excellent recall! Long interval scheduled.' },
    };
    const m = msgs[q] || msgs[3];
    fbIcon.textContent   = m.icon;
    fbTxt.innerHTML      = m.txt;
    fbNext.textContent   = days === 0 ? '→ Review tomorrow' : `→ Review in ${days} day${days===1?'':'s'}`;
    fbWrap.classList.add('visible');
  }
}

// ── MutationObserver — re-inject on every render ───────────
// (Mirrors the TTS module's pattern exactly)
function srsInit() {
  srsInjectStyles();
  const main = document.getElementById('main');
  if (!main) return;

  // Inject immediately for initial load
  // curStruct is defined in atlas.html global scope
  if (typeof curStruct !== 'undefined') {
    srsInject(curStruct);
  }

  // Re-inject whenever #main content changes (structure navigation)
  const obs = new MutationObserver(() => {
    setTimeout(() => {
      if (typeof curStruct !== 'undefined') {
        srsInject(curStruct);
      }
    }, 250); // slight delay to let render() finish
  });
  obs.observe(main, { childList: true, subtree: false });
}

// ── Boot ──────────────────────────────────────────────────
// Wait for DOM to be ready (atlas.html loads this at end of body)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', srsInit);
} else {
  srsInit();
}
