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

// ─── Export ───────────────────────────────────────────────────────────────────

window.OmniRadAuth = {
  signUp: sbSignUp,
  signIn: sbSignIn,
  signOut: sbSignOut,
  getSession: sbGetSession,
  getUser: sbGetUser,
  getToken: sbGetToken
};

window.OmniRadDB = {
  getSRSProgress: sbGetSRSProgress,
  upsertSRSCard: sbUpsertSRSCard,
  getPreferences: sbGetPreferences,
  savePreferences: sbSavePreferences
};
