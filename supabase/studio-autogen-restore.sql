-- ═══════════════════════════════════════════════════════════════
-- TASK NAME: STUDIO-AUTOGEN-RESTORE
-- Phase: N/A · Run order: after re-enabling FEATURE.AUTOGEN · Repeat safety: yes
-- Purpose: Reverse of STUDIO-AUTOGEN-DEPRECATE. Rename archived table back
--          and re-create RPC scaffolds (bodies loaded from git history).
-- Prerequisite: valid fal_api_key + gemini_api_key in Vault.
-- Author: OmniRad Platform · Date: 12 July 2026
-- ═══════════════════════════════════════════════════════════════

do $$ begin raise notice '▶ TASK: STUDIO-AUTOGEN-RESTORE — starting'; end $$;

-- ─── 1) Restore generation_sessions table name ──────────────
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='generation_sessions_archived_2026_07') then
    alter table public.generation_sessions_archived_2026_07
      rename to generation_sessions;
    comment on table public.generation_sessions is null;
    grant select, insert, update on public.generation_sessions to authenticated;
    raise notice '  ↳ table renamed back to generation_sessions';
  else
    raise notice '  ↳ archived table not found (already restored?)';
  end if;
end $$;

-- ─── 2) RPC bodies ──────────────────────────────────────────
-- Restore from git history:
--   git log --all --source -- supabase/*.sql | grep -i 'create_generation_session\|session_submit\|session_advance\|gen_start_flux_ultra\|gen_start_gemini_image'
-- Then paste function definitions here before running.

-- ─── 3) Audit log ───────────────────────────────────────────
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='activity_log') then
    insert into public.activity_log (action, target_type, target_id, details)
    values (
      'FEATURE_RESTORED',
      'feature_flag',
      'studio.autogen',
      jsonb_build_object('restored_from', 'STUDIO-AUTOGEN-DEPRECATE')
    );
  end if;
end $$;

do $$ begin raise notice '✔ TASK: STUDIO-AUTOGEN-RESTORE — completed'; end $$;
