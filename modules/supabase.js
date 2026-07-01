/* ════════════════════════════════════════════════════
   OmniRad — modules/supabase.js
   Purpose: Supabase client — Auth, SRS sync, preferences, daily scores, streaks
   ════════════════════════════════════════════════════ */
/**
 * OmniRad — Supabase Connection Module
 * Task #14 — User Accounts Backend
 *
 * INSTRUCTIONS: Replace the two constants below with your actual values.
 * SUPABASE_URL  → https://lmbdtktjeggischpqnkw.supabase.co
 * SUPABASE_KEY  → your Publishable key from Supabase → Settings → API
 */

const SUPABASE_URL = 'https://lmbdtktjeggischpqnkw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtYmR0a3RqZWdnaXNjaHBxbmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MjQ1NTUsImV4cCI6MjA5ODIwMDU1NX0.xr2WO9lJHajYj8Tsysap2FBKmiRSWWvc6PWmnnbObjc'; // ← ضع الـ publishable key هنا

// ─── Core Request Helper ──────────────────────────────────────────────────────

async function sbFetch(path, options = {}) {
  const url = `${SUPABASE_URL}${path}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = sbGetToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = res.status === 204 ? null : await res.json();

  if (!res.ok) throw new Error(data?.error_description || data?.message || 'Request failed');
  return data;
}

// ─── Token Management ─────────────────────────────────────────────────────────

function sbGetToken()    { return localStorage.getItem('omnirad_token'); }
function sbSetToken(t)   { localStorage.setItem('omnirad_token', t); }
function sbClearToken()  { localStorage.removeItem('omnirad_token'); localStorage.removeItem('omnirad_user'); }
function sbGetUser()     { try { return JSON.parse(localStorage.getItem('omnirad_user')); } catch { return null; } }
function sbSetUser(u)    { localStorage.setItem('omnirad_user', JSON.stringify(u)); }

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function sbSignUp(email, password, fullName) {
  const data = await sbFetch('/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, options: { data: { full_name: fullName } } })
  });
  if (data.access_token) { sbSetToken(data.access_token); sbSetUser(data.user); }
  return data;
}

async function sbSignIn(email, password) {
  const data = await sbFetch('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (data.access_token) { sbSetToken(data.access_token); sbSetUser(data.user); }
  return data;
}

async function sbSignOut() {
  try {
    await sbFetch('/auth/v1/logout', { method: 'POST' });
  } catch (_) {}
  sbClearToken();
}

async function sbGetSession() {
  const token = sbGetToken();
  if (!token) return null;
  try {
    const data = await sbFetch('/auth/v1/user');
    sbSetUser(data);
    return data;
  } catch {
    sbClearToken();
    return null;
  }
}

// ─── SRS Progress ─────────────────────────────────────────────────────────────

async function sbGetSRSProgress() {
  return sbFetch('/rest/v1/srs_progress?select=*', {
    headers: { 'Prefer': 'return=representation' }
  });
}

async function sbUpsertSRSCard(card) {
  const user = sbGetUser();
  if (!user) throw new Error('Not authenticated');
  return sbFetch('/rest/v1/srs_progress', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({ ...card, user_id: user.id })
  });
}

// ─── User Preferences ─────────────────────────────────────────────────────────

async function sbGetPreferences() {
  const rows = await sbFetch('/rest/v1/user_preferences?select=*&limit=1');
  return rows?.[0] || { language: 'en', theme: 'dark' };
}

async function sbSavePreferences(prefs) {
  const user = sbGetUser();
  if (!user) throw new Error('Not authenticated');
  return sbFetch('/rest/v1/user_preferences', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({ ...prefs, user_id: user.id, updated_at: new Date().toISOString() })
  });
}

// ─── Daily Challenge ──────────────────────────────────────────────────────────

async function sbSubmitDailyScore(score, timeSeconds) {
  const user = sbGetUser();
  if (!user) throw new Error('Not authenticated');
  const today = new Date().toISOString().split('T')[0];
  const result = await sbFetch('/rest/v1/daily_scores', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({
      user_id:        user.id,
      challenge_date: today,
      score:          score,
      time_seconds:   timeSeconds,
      answered_at:    new Date().toISOString()
    })
  });
  // تحديث الـ streak تلقائياً بعد الإجابة
  if (score > 0) await sbUpdateStreak();
  return result;
}

async function sbGetMyDailyScore(date) {
  const today = date || new Date().toISOString().split('T')[0];
  const rows = await sbFetch(
    `/rest/v1/daily_scores?challenge_date=eq.${today}&select=*&limit=1`
  );
  return rows?.[0] || null;
}

async function sbGetLeaderboard(limit = 20) {
  // يقرأ من الـ view العامة — لا يحتاج auth
  return sbFetch(
    `/rest/v1/leaderboard?select=display_name,total_score,days_played,current_streak,longest_streak&limit=${limit}`
  );
}

// ─── Streaks ──────────────────────────────────────────────────────────────────

async function sbGetMyStreak() {
  const user = sbGetUser();
  if (!user) return { current_streak: 0, longest_streak: 0, last_activity: null };
  const rows = await sbFetch(
    `/rest/v1/streaks?user_id=eq.${user.id}&select=*&limit=1`
  );
  return rows?.[0] || { current_streak: 0, longest_streak: 0, last_activity: null };
}

async function sbUpdateStreak() {
  const user = sbGetUser();
  if (!user) return;

  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const current = await sbGetMyStreak();
  const last    = current.last_activity;

  // لا تُكرر التحديث في نفس اليوم
  if (last === today) return current;

  const newStreak  = (last === yesterday) ? (current.current_streak + 1) : 1;
  const newLongest = Math.max(newStreak, current.longest_streak || 0);

  return sbFetch('/rest/v1/streaks', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({
      user_id:         user.id,
      current_streak:  newStreak,
      longest_streak:  newLongest,
      last_activity:   today,
      updated_at:      new Date().toISOString()
    })
  });
}


// ─── Content: Structures (Task #26 frontend wiring) ───────────────────────────

async function sbGetStructures() {
  const rows = await sbFetch(
    '/rest/v1/structures?select=id,category,en,ar,latin,' +
    'structure_descriptions(lang,description),' +
    'structure_facts(fact_en,sort_order),' +
    'structure_mnemonics(title_en,title_ar,body_en,body_ar,ref),' +
    'structure_imaging_notes(modality,note),' +
    'structure_related(related_structure_id)' +
    '&status=eq.published&order=en.asc'
  );
  return rows.map(r => {
    const descEn = (r.structure_descriptions.find(d => d.lang === 'en') || {}).description || '';
    const descAr = (r.structure_descriptions.find(d => d.lang === 'ar') || {}).description || '';
    const facts = [...r.structure_facts]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(f => f.fact_en);
    const imaging = {};
    r.structure_imaging_notes.forEach(n => { imaging[n.modality] = n.note; });
    const mnemonics = r.structure_mnemonics.map(m => ({
      title: m.title_en, en: m.body_en, ar: m.body_ar, ref: m.ref
    }));
    const related = r.structure_related.map(x => x.related_structure_id);
    return {
      id: r.id, cat: r.category, en: r.en, ar: r.ar, latin: r.latin,
      descEn, descAr, facts, imaging, mnemonics, related
    };
  });
}

// ─── Export ───────────────────────────────────────────────────────────────────

window.OmniRadAuth = {
  signUp:     sbSignUp,
  signIn:     sbSignIn,
  signOut:    sbSignOut,
  getSession: sbGetSession,
  getUser:    sbGetUser,
  getToken:   sbGetToken
};

window.OmniRadDB = {
  getSRSProgress:   sbGetSRSProgress,
  upsertSRSCard:    sbUpsertSRSCard,
  getPreferences:   sbGetPreferences,
  savePreferences:  sbSavePreferences,
  submitDailyScore: sbSubmitDailyScore,
  getMyDailyScore:  sbGetMyDailyScore,
  getLeaderboard:   sbGetLeaderboard,
  getMyStreak:      sbGetMyStreak,
  updateStreak:     sbUpdateStreak,
  getStructures:    sbGetStructures
};

// ─── Auth Guard ───────────────────────────────────────────────────────────────
// Usage: call authGuard() at top of every protected page
async function sbAuthGuard() {
  const user = sbGetUser();
  const token = sbGetToken();
  if (!user || !token) {
    const base = window.location.pathname.includes('/pages/') ? '../' : '';
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(base + 'pages/auth.html?returnTo=' + returnTo);
    return false;
  }
  return true;
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
async function sbSignOutAndRedirect() {
  await sbSignOut();
  const base = window.location.pathname.includes('/pages/') ? '../' : '';
  window.location.replace(base + 'pages/auth.html');
}

// ─── Nav Sign Out Button updater ──────────────────────────────────────────────
function sbUpdateNavAuth() {
  const user = sbGetUser();
  const signInLinks = document.querySelectorAll('a[href*="auth.html"]');
  signInLinks.forEach(link => {
    if (user) {
      link.textContent = '🔓 Sign Out';
      link.removeAttribute('href');
      link.style.cursor = 'pointer';
      link.onclick = (e) => { e.preventDefault(); sbSignOutAndRedirect(); };
    }
  });
}

window.OmniRadAuth.guard      = sbAuthGuard;
window.OmniRadAuth.signOutNav = sbSignOutAndRedirect;
window.OmniRadAuth.updateNav  = sbUpdateNavAuth;
