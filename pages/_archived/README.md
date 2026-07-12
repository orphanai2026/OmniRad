# Archived Pages — Studio Auto-Generation Experiments

> **Status:** Archived · Not linked from any live page · Not indexed by robots.
> **Archived on:** 12 July 2026 (Phase 3 Sprint 1 — Studio Cleanup)
> **Decision reference:** `CLAUDE.md` §"القرارات المعتمدة (12 يوليو 2026)"

## Why archived

Three auto-generation experiments were conducted to eliminate manual generation.
All three failed anatomical accuracy testing against RadLex/RSNA standards.
Manual generation via ChatGPT UI (GPT Image 1 + prompt rewriting) became the
sole production path.

## Experiment results

| File | Model | Verdict |
|---|---|---|
| `flux-ultra-test.html` | fal.ai · FLUX.1.1 [pro] Ultra | ❌ Mixes CT/MRI signatures · anatomy inaccurate |
| `gpt-image-test.html` | OpenAI · GPT Image 1 (API) | ❌ Untested (payment failure on Stripe) |
| `gemini-image-test.html` | Google · Gemini 2.5 Flash Image | ⚠️ High visual quality · anatomical errors |

## Restoration procedure

1. Move file back to `omnirad-redesign/pages/`.
2. Restore Supabase RPCs: run `supabase/studio-autogen-restore.sql`.
3. Verify `fal_api_key` / `gemini_api_key` still valid in Vault.
4. Set `window.OmniRadFeatures.AUTOGEN = true` (requires editing `feature-flags.js`).

## Data preservation

- Original `generation_sessions` table renamed to `generation_sessions_archived_2026_07`
  (read-only for admin) — historical session records preserved.
- Vault keys retained with `DEPRECATED 2026-07-12` comment.
- Git history preserves the original code (`git log --all -- pages/*-test.html`).

## Compliance note

Files carry `<meta name="robots" content="noindex,nofollow">`.
Do **NOT** link these from production navigation, sitemap, or any user-facing page.
