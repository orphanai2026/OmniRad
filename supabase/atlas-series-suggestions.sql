-- ═══════════════════════════════════════════════════════════════════════════
-- TASK NAME: ATLAS-SERIES-SUGGESTIONS
-- Phase   : 3 · Sprint 4f — Atlas Series Viewer
-- Run once: yes (idempotent)
-- Depends : series-mode-schema.sql · naming-standards-schema.sql · series-review-schema.sql
-- Purpose : Provide read APIs for the Atlas Series experience —
--             • atlas_series_public_v : aggregate view of every approved series
--             • atlas_related_series() : "You may also like" recommendations
--             • atlas_series_lookup() : one series with ordered slices
--           All are read-only and grant execute/select to anon + authenticated
--           so the Atlas Series viewer works for logged-out visitors.
-- Standards: DICOM PS3.3 §C.7.3 · IHE BIR · RSNA structured reporting
-- ═══════════════════════════════════════════════════════════════════════════

do $$ begin raise notice '▶ TASK: ATLAS-SERIES-SUGGESTIONS — starting'; end $$;

-- ─── 1) atlas_series_public_v — one row per APPROVED series ───────────────
-- (Compared to atlas_series_v from series-mode-schema.sql, this variant is
-- filtered to approved-only images and joined with uploader/reviewer names
-- for the public Atlas UI.)
create or replace view public.atlas_series_public_v as
  select
    ai.series_id,
    max(ai.series_name)        as series_name,
    max(ai.series_total)       as series_total,
    count(*)::int              as slice_count,
    min(ai.slice_index)        as first_slice,
    max(ai.slice_index)        as last_slice,
    (array_agg(ai.organ order by ai.slice_index) filter (where ai.organ is not null))[1] as organ,
    (array_agg(ai.modality order by ai.slice_index) filter (where ai.modality is not null))[1] as modality,
    (array_agg(ai.plane order by ai.slice_index) filter (where ai.plane is not null))[1] as plane,
    (array_agg(ai.sequence order by ai.slice_index) filter (where ai.sequence is not null))[1] as sequence,
    (array_agg(ai.loinc_code order by ai.slice_index) filter (where ai.loinc_code is not null))[1] as loinc_code,
    (array_agg(ai.radlex_playbook_id order by ai.slice_index) filter (where ai.radlex_playbook_id is not null))[1] as radlex_playbook_id,
    (array_agg(ai.body_part_examined order by ai.slice_index) filter (where ai.body_part_examined is not null))[1] as body_part_examined,
    (array_agg(ai.series_technique order by ai.slice_index) filter (where ai.series_technique is not null))[1] as series_technique,
    (array_agg(ai.naming_tier order by ai.slice_index) filter (where ai.naming_tier is not null))[1] as naming_tier,
    (array_agg(ai.teaching_pearl order by ai.slice_index) filter (where ai.teaching_pearl is not null))[1] as teaching_pearl,
    (array_agg(ai.common_pitfall order by ai.slice_index) filter (where ai.common_pitfall is not null))[1] as common_pitfall,
    (array_agg(ai.key_slice_index order by ai.slice_index) filter (where ai.key_slice_index is not null))[1] as key_slice_index,
    max(ai.coherence_score)     as coherence_score,
    round(avg(ai.reviewer_confidence)::numeric, 1) as avg_confidence,
    (array_agg(ai.uploader_id order by ai.slice_index) filter (where ai.uploader_id is not null))[1] as uploader_id,
    (array_agg(up.display_name order by ai.slice_index) filter (where up.display_name is not null))[1] as uploader_name,
    (array_agg(up.avatar_url order by ai.slice_index) filter (where up.avatar_url is not null))[1] as uploader_avatar,
    (array_agg(ai.reviewer_id order by ai.slice_index) filter (where ai.reviewer_id is not null))[1] as reviewer_id,
    (array_agg(rp.display_name order by ai.slice_index) filter (where rp.display_name is not null))[1] as reviewer_name,
    (array_agg(rp.avatar_url order by ai.slice_index) filter (where rp.avatar_url is not null))[1] as reviewer_avatar,
    min(ai.approved_at)         as approved_at
  from public.atlas_images ai
    left join public.profiles up on up.id = ai.uploader_id
    left join public.profiles rp on rp.id = ai.reviewer_id
  where ai.approved_at is not null
    and ai.series_id is not null
  group by ai.series_id;

grant select on public.atlas_series_public_v to anon, authenticated;

-- ─── 2) atlas_series_lookup(series_id) — ordered slices for the viewer ────
create or replace function public.atlas_series_lookup(p_series_id uuid)
returns table (
  id            bigint,
  slice_index   int,
  storage_path  text,
  organ         text,
  modality      text,
  plane         text,
  sequence      text,
  structures    text[],
  series_name   text,
  series_total  int,
  loinc_code    text,
  radlex_playbook_id text,
  body_part_examined text,
  series_technique   text,
  teaching_pearl text,
  common_pitfall text,
  key_slice_index int,
  approved_at    timestamptz,
  uploader_id    uuid,
  reviewer_id    uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ai.id, ai.slice_index, ai.storage_path,
    ai.organ, ai.modality, ai.plane, ai.sequence, ai.structures,
    ai.series_name, ai.series_total,
    ai.loinc_code, ai.radlex_playbook_id, ai.body_part_examined, ai.series_technique,
    ai.teaching_pearl, ai.common_pitfall, ai.key_slice_index,
    ai.approved_at, ai.uploader_id, ai.reviewer_id
  from public.atlas_images ai
  where ai.series_id = p_series_id
    and ai.approved_at is not null
  order by ai.slice_index asc;
$$;

-- Best-effort: detect actual id type (uuid vs bigint) at grant time
do $$
declare id_type text;
begin
  select data_type into id_type
    from information_schema.columns
   where table_schema='public' and table_name='atlas_images' and column_name='id';
  if id_type = 'uuid' then
    -- redeclare returning uuid
    drop function if exists public.atlas_series_lookup(uuid);
    execute $f$
      create function public.atlas_series_lookup(p_series_id uuid)
      returns table (
        id            uuid,
        slice_index   int,
        storage_path  text,
        organ         text,
        modality      text,
        plane         text,
        sequence      text,
        structures    text[],
        series_name   text,
        series_total  int,
        loinc_code    text,
        radlex_playbook_id text,
        body_part_examined text,
        series_technique   text,
        teaching_pearl text,
        common_pitfall text,
        key_slice_index int,
        approved_at    timestamptz,
        uploader_id    uuid,
        reviewer_id    uuid
      )
      language sql stable security definer set search_path = public as $body$
        select
          ai.id, ai.slice_index, ai.storage_path,
          ai.organ, ai.modality, ai.plane, ai.sequence, ai.structures,
          ai.series_name, ai.series_total,
          ai.loinc_code, ai.radlex_playbook_id, ai.body_part_examined, ai.series_technique,
          ai.teaching_pearl, ai.common_pitfall, ai.key_slice_index,
          ai.approved_at, ai.uploader_id, ai.reviewer_id
        from public.atlas_images ai
        where ai.series_id = p_series_id and ai.approved_at is not null
        order by ai.slice_index asc;
      $body$;
    $f$;
  end if;
end $$;

grant execute on function public.atlas_series_lookup(uuid) to anon, authenticated;

-- ─── 3) atlas_related_series() — "You may also like" recommendations ─────
-- Ranking priority (per Sprint 4f protocol review):
--   1. Same LOINC code  → same procedure
--   2. Same body_part_examined + modality
--   3. Same modality + plane
-- Excludes the current series. Returns up to p_limit rows.
create or replace function public.atlas_related_series(
  p_loinc text default null,
  p_body_part text default null,
  p_modality text default null,
  p_plane text default null,
  p_exclude_series uuid default null,
  p_limit int default 3
)
returns table (
  series_id     uuid,
  series_name   text,
  slice_count   int,
  modality      text,
  organ         text,
  plane         text,
  loinc_code    text,
  first_thumb   text,
  match_reason  text,
  match_score   int
)
language sql
stable
security definer
set search_path = public
as $$
  with candidates as (
    select
      s.series_id, s.series_name, s.slice_count, s.modality, s.organ, s.plane, s.loinc_code,
      -- Score: 100 exact LOINC, 60 same BPE+modality, 40 modality+plane, 20 modality only
      case
        when p_loinc is not null and s.loinc_code = p_loinc then 100
        when p_body_part is not null and p_modality is not null
          and s.body_part_examined = p_body_part and s.modality = p_modality then 60
        when p_modality is not null and p_plane is not null
          and s.modality = p_modality and s.plane = p_plane then 40
        when p_modality is not null and s.modality = p_modality then 20
        else 0
      end as sc,
      case
        when p_loinc is not null and s.loinc_code = p_loinc then 'same_procedure'
        when p_body_part is not null and s.body_part_examined = p_body_part and s.modality = p_modality then 'same_region_modality'
        when p_modality is not null and s.modality = p_modality and s.plane = p_plane then 'same_modality_plane'
        when p_modality is not null and s.modality = p_modality then 'same_modality'
        else 'other'
      end as reason
    from public.atlas_series_public_v s
    where (p_exclude_series is null or s.series_id <> p_exclude_series)
  ),
  first_slices as (
    select distinct on (ai.series_id)
      ai.series_id, ai.storage_path
    from public.atlas_images ai
    where ai.approved_at is not null and ai.series_id is not null
    order by ai.series_id, ai.slice_index asc
  )
  select
    c.series_id, c.series_name, c.slice_count, c.modality, c.organ, c.plane, c.loinc_code,
    fs.storage_path as first_thumb,
    c.reason as match_reason,
    c.sc as match_score
  from candidates c
    left join first_slices fs on fs.series_id = c.series_id
  where c.sc > 0
  order by c.sc desc, c.series_id
  limit greatest(1, p_limit);
$$;

grant execute on function public.atlas_related_series(text, text, text, text, uuid, int) to anon, authenticated;

-- ─── 4) Verification ─────────────────────────────────────────────────────
do $$
declare v_ok boolean; fn_lookup boolean; fn_related boolean;
begin
  select exists(select 1 from information_schema.views
                where table_schema='public' and table_name='atlas_series_public_v')
    into v_ok;
  select exists(select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                where n.nspname='public' and p.proname='atlas_series_lookup')
    into fn_lookup;
  select exists(select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                where n.nspname='public' and p.proname='atlas_related_series')
    into fn_related;
  raise notice '  · atlas_series_public_v exists  : %', v_ok;
  raise notice '  · atlas_series_lookup exists    : %', fn_lookup;
  raise notice '  · atlas_related_series exists   : %', fn_related;
  if not v_ok or not fn_lookup or not fn_related then
    raise exception 'ATLAS-SERIES-SUGGESTIONS verification failed';
  end if;
end $$;

do $$ begin raise notice '✔ TASK: ATLAS-SERIES-SUGGESTIONS — completed'; end $$;
