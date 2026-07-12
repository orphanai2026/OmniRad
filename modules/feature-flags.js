/* ═══════════════════════════════════════════════════════════════
   OmniRad — Feature Flags (Single Source of Truth)
   ─────────────────────────────────────────────────────────────
   Central registry for all runtime feature toggles.
   Docs: /docs/feature-flags.md
   Pattern: Object.freeze prevents runtime tampering (defense in depth).
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  window.OmniRadFeatures = Object.freeze({
    // ─── Studio auto-generation ────────────────────────────────
    // Disabled Phase 3 Sprint 1 (12 Jul 2026).
    // Rationale: fal.ai/FLUX/Gemini failed anatomical accuracy tests.
    // Manual ChatGPT workflow adopted as sole path (highest fidelity).
    // Legacy code preserved in studio-app.js behind this flag.
    // Supabase RPCs deprecated via STUDIO-AUTOGEN-DEPRECATE.sql.
    // Restore path: STUDIO-AUTOGEN-RESTORE.sql + set this flag to true.
    AUTOGEN: false,

    // ─── Future flags below ────────────────────────────────────
    // (Add here with rationale + date + docs link)
  });

  // Debug helper (dev console only) — no PII, safe to log
  if (typeof console !== 'undefined' && console.info) {
    console.info('[OmniRad] Feature flags loaded:', window.OmniRadFeatures);
  }
})();
