-- ═══════════════════════════════════════════════════════════════════════════
-- TASK NAME: SERIES-MODE-SCHEMA
-- Phase   : 3 · Sprint 4 (Step 14) — Series Mode + DICOM overlay + Cine
-- Run once: yes (idempotent — safe to re-run)
-- Reverse : drop columns / view / indexes listed at bottom of file
-- Purpose : Add series_id + slice_index + series_name to atlas_images,
--           expose atlas_series_v aggregate view + series_lookup() RPC.
-- Depends : atlas_images (phase2-bulk-upload.sql), profiles
-- ═══════════════════════════════════════════════════════════════════════════

do $$ begin raise notice '▶ TASK: SERIES-MODE-SCHEMA — starting'; end $$;

-- ─── 1) Extend atlas_images ───────────────────────────────────────────────
alter table if exists public.atlas_images
  add column if not exists series_id     uuid,
  add column if not exists slice_index   int,
  add column if not exists series_name   text,
  add column if not exists series_total  int;

-- Constraints: slice_index must be positive when series_id is set
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'atlas_images_series_slice_positive'
  ) then
    alter table public.atlas_images
      add constraint atlas_images_series_slice_positive
      check (
        (series_id is null and slice_index is null)
        or
        (series_id is not null and slice_index is not null and slice_index >= 1)
      );
    raise notice '  · added constraint atlas_images_series_slice_positive';
  end if;
end $$;

-- Unique: no two slices with same series_id + slice_index
create unique index if not exists atlas_images_series_slice_uniq
  on public.atlas_images (series_id, slice_index)
  where series_id is not null;

-- Fast series lookup
create index if not exists atlas_images_series_id_idx
  on public.atlas_images (series_id)
  where series_id is not null;

-- ─── 2) atlas_series_v (aggregate per series) ─────────────────────────────
-- One row per series_id: organ, modality, plane, name, count, first slice,
-- uploader/reviewer (from first slice), approved_at (earliest).
create or replace view public.atlas_series_v as
  select
    ai.series_id,
    max(ai.series_name)         as series_name,
    max(ai.organ)               as organ,
    max(ai.modality)            as modality,
    max(ai.plane)               as plane,
    max(ai.sequence)            as sequence,
    count(*)::int               as slice_count,
    min(ai.slice_index)         as first_slice,
    max(ai.slice_index)         as last_slice,
    min(ai.approved_at)         as approved_at,
    (array_agg(ai.uploader_id order by ai.slice_index) filter (where ai.uploader_id is not null))[1] as uploader_id,
    (array_agg(ai.reviewer_id order by ai.slice_index) filter (where ai.reviewer_id is not null))[1] as reviewer_id
  from public.atlas_images ai
  where ai.series_id is not null
    and ai.approved_at is not null
  group by ai.series_id;

grant select on public.atlas_series_v to anon, authenticated;

-- ─── 3) series_lookup(series_id uuid) — ordered slices for viewer ─────────
create or replace function public.series_lookup(p_series_id uuid)
returns table (
  id            bigint,
  slice_index   int,
  storage_path  text,
  organ         text,
  modality      text,
  plane         text,
  sequence      text,
  series_name   text,
  series_total  int,
  structures    text[],
  approved_at   timestamptz,
  uploader_id   uuid,
  reviewer_id   uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ai.id, ai.slice_index, ai.storage_path,
    ai.organ, ai.modality, ai.plane, ai.sequence,
    ai.series_name, ai.series_total, ai.structures,
    ai.approved_at, ai.uploader_id, ai.reviewer_id
  from public.atlas_images ai
  where ai.series_id = p_series_id
    and ai.approved_at is not null
  order by ai.slice_index asc;
$$;

grant execute on function public.series_lookup(uuid) to anon, authenticated;

-- ─── 4) atlas_public_v refresh (include series columns) ───────────────────
-- Only recreate if it already exists (avoid stomping fresh installs)
do $$
declare has_view boolean;
begin
  select exists (
    select 1 from information_schema.views
    where table_schema = 'public' and table_name = 'atlas_public_v'
  ) into has_view;

  if has_view then
    execute 'drop view public.atlas_public_v cascade';
    raise notice '  · dropped stale atlas_public_v (will recreate)';

    execute $view$
      create view public.atlas_public_v as
        select
          ai.id, ai.storage_path,
          ai.organ, ai.modality, ai.plane, ai.sequence,
          ai.structures, ai.level, ai.citation, ai.prompt,
          ai.series_id, ai.slice_index, ai.series_name, ai.series_total,
          ai.approved_at,
          ai.uploader_id, up.display_name as uploader_name, up.avatar_url as uploader_avatar,
          ai.reviewer_id, rp.display_name as reviewer_name, rp.avatar_url as reviewer_avatar
        from public.atlas_images ai
          left join public.profiles up on up.id = ai.uploader_id
          left join public.profiles rp on rp.id = ai.reviewer_id
        where ai.approved_at is not null
    $view$;

    execute 'grant select on public.atlas_public_v to anon, authenticated';
    raise notice '  · recreated atlas_public_v with series columns';
  else
    raise notice '  · atlas_public_v not present — skipped (run atlas-dynamic-views.sql first)';
  end if;
end $$;

-- ─── 5) Verification ──────────────────────────────────────────────────────
do $$
declare
  col_count int;
  view_ok   boolean;
  fn_ok     boolean;
begin
  select count(*) into col_count
  from information_schema.columns
  where table_schema='public' and table_name='atlas_images'
    and column_name in ('series_id','slice_index','series_name','series_total');

  select exists(select 1 from information_schema.views
                 where table_schema='public' and table_name='atlas_series_v')
    into view_ok;

  select exists(select 1 from pg_proc p
                  join pg_namespace n on n.oid = p.pronamespace
                 where n.nspname='public' and p.proname='series_lookup')
    into fn_ok;

  raise notice '  · atlas_images series columns present : % / 4', col_count;
  raise notice '  · view atlas_series_v exists          : %', view_ok;
  raise notice '  · function series_lookup exists       : %', fn_ok;

  if col_count < 4 or not view_ok or not fn_ok then
    raise exception 'SERIES-MODE-SCHEMA verification failed';
  end if;
end $$;

do $$ begin raise notice '✔ TASK: SERIES-MODE-SCHEMA — completed'; end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- REVERSE (manual — keep as reference):
--   drop view if exists public.atlas_series_v;
--   drop function if exists public.series_lookup(uuid);
--   drop index if exists atlas_images_series_slice_uniq;
--   drop index if exists atlas_images_series_id_idx;
--   alter table public.atlas_images
--     drop constraint if exists atlas_images_series_slice_positive,
--     drop column if exists series_id,
--     drop column if exists slice_index,
--     drop column if exists series_name,
--     drop column if exists series_total;
-- ═══════════════════════════════════════════════════════════════════════════
