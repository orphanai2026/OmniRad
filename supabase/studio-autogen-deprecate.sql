-- ═══════════════════════════════════════════════════════════════
-- TASK NAME: STUDIO-AUTOGEN-DEPRECATE
-- Phase: 3 · Sprint: 1 · Run order: after code deploy · Repeat safety: yes (IF EXISTS)
-- Purpose: Retire Supabase RPCs backing the Studio auto-generation experiments.
-- Data preservation: rename generation_sessions table (no DROP).
-- Vault keys: retained with deprecation note (no delete).
-- Restore counterpart: STUDIO-AUTOGEN-RESTORE.sql
-- Author: OmniRad Platform · Date: 12 July 2026
-- ═══════════════════════════════════════════════════════════════

do $$ begin raise notice '▶ TASK: STUDIO-AUTOGEN-DEPRECATE — starting'; end $$;

-- ─── 1) Drop RPC functions (fal.ai · Gemini · FLUX Ultra) ────
drop function if exists public.create_generation_session(text, text, text, text, text, text, text, text, numeric, jsonb, text) cascade;
drop function if exists public.session_submit(uuid) cascade;
drop function if exists public.session_advance(uuid) cascade;
drop function if exists public.gen_start_flux_ultra(text, text) cascade;
drop function if exists public.gen_check_status(uuid) cascade;
drop function if exists public.gen_fetch_result(uuid) cascade;
drop function if exists public.gen_start_gemini_image(text) cascade;
drop function if exists public.gen_fetch_gemini_image(uuid) cascade;

-- ─── 2) Archive generation_sessions table (preserve historical data) ───
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='generation_sessions') then
    alter table public.generation_sessions
      rename to generation_sessions_archived_2026_07;
    comment on table public.generation_sessions_archived_2026_07 is
      'ARCHIVED 2026-07-12 (Phase 3 Sprint 1). Historical auto-gen sessions. Read-only.';
    revoke all on public.generation_sessions_archived_2026_07 from anon, authenticated;
    grant select on public.generation_sessions_archived_2026_07 to service_role;
    raise notice '  ↳ generation_sessions renamed to generation_sessions_archived_2026_07';
  else
    raise notice '  ↳ generation_sessions not found (skipped rename)';
  end if;
end $$;

-- ─── 3) Vault: annotate deprecated keys (retain for possible restore) ───
-- Note: Supabase Vault doesn't support comments on individual secrets via SQL.
-- Documented in /docs/feature-flags.md instead. Keys: fal_api_key, gemini_api_key.

-- ─── 4) Audit log entry ─────────────────────────────────────
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='activity_log') then
    insert into public.activity_log (action, target_type, target_id, details)
    values (
      'FEATURE_DEPRECATED',
      'feature_flag',
      'studio.autogen',
      jsonb_build_object(
        'phase', 3,
        'sprint', 1,
        'reason', 'Anatomical accuracy failure (FLUX Ultra, Gemini 2.5, GPT Image 1 API)',
        'replacement', 'Manual ChatGPT UI workflow',
        'restore_script', 'STUDIO-AUTOGEN-RESTORE.sql'
      )
    );
    raise notice '  ↳ activity_log entry added';
  else
    raise notice '  ↳ activity_log table missing (skipped audit entry)';
  end if;
end $$;

do $$ begin raise notice '✔ TASK: STUDIO-AUTOGEN-DEPRECATE — completed'; end $$;
