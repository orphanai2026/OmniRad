-- ═══════════════════════════════════════════════════════════════════════════
-- TASK NAME: SERIES-REVIEW-SCHEMA
-- Phase   : 3 · Sprint 4e — Series Review Workbench
-- Run once: yes (idempotent)
-- Depends : phase2-bulk-upload.sql · series-mode-schema.sql · series-mode-rpc.sql
--           · approve-bulk-overload-fix.sql · naming-standards-schema.sql
-- Purpose : Add reviewer-confidence, educational metadata, and AI coherence
--           columns to atlas_images + review_queue · expose series_review_v
--           · provide batch_approve_series() RPC with skip-invalid behavior.
-- Standards: DICOM PS3.3 §C.7.3 · IHE BIR · RSNA Structured Reporting · ESR iGuide
-- ═══════════════════════════════════════════════════════════════════════════

do $$ begin raise notice '▶ TASK: SERIES-REVIEW-SCHEMA — starting'; end $$;

-- ─── 1) Extend atlas_images ───────────────────────────────────────────────
alter table if exists public.atlas_images
  add column if not exists reviewer_confidence  smallint,           -- 1–5 (nullable)
  add column if not exists teaching_pearl       text,               -- ≤200 chars (client)
  add column if not exists common_pitfall       text,               -- ≤200 chars (client)
  add column if not exists key_slice_index      int,                -- pointer to a slice
  add column if not exists coherence_score      smallint,           -- 0–100
  add column if not exists coherence_details    jsonb;              -- {modality:{...},plane:{...},...}

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'atlas_images_confidence_chk') then
    alter table public.atlas_images
      add constraint atlas_images_confidence_chk
      check (reviewer_confidence is null or reviewer_confidence between 1 and 5);
    raise notice '  · added atlas_images_confidence_chk';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'atlas_images_coherence_chk') then
    alter table public.atlas_images
      add constraint atlas_images_coherence_chk
      check (coherence_score is null or coherence_score between 0 and 100);
    raise notice '  · added atlas_images_coherence_chk';
  end if;
end $$;

create index if not exists atlas_images_confidence_idx
  on public.atlas_images (reviewer_confidence) where reviewer_confidence is not null;
create index if not exists atlas_images_coherence_idx
  on public.atlas_images (coherence_score) where coherence_score is not null;
create index if not exists atlas_images_key_slice_idx
  on public.atlas_images (series_id, key_slice_index) where key_slice_index is not null;

-- ─── 2) Extend review_queue (mirror for pending state) ────────────────────
alter table if exists public.review_queue
  add column if not exists reviewer_confidence  smallint,
  add column if not exists teaching_pearl       text,
  add column if not exists common_pitfall       text,
  add column if not exists key_slice_index      int,
  add column if not exists coherence_score      smallint,
  add column if not exists coherence_details    jsonb;

-- ─── 3) series_review_v — one row per pending series (for review UI) ─────
-- Aggregates review_queue rows sharing a series_id — pending only.
create or replace view public.series_review_v as
  select
    rq.series_id,
    max(rq.series_name)   as series_name,
    max(rq.series_total)  as series_total,
    max(rq.batch_id)      as batch_id,
    (array_agg(rq.uploader_id order by rq.slice_index))[1] as uploader_id,
    up.display_name       as uploader_name,
    up.avatar_url         as uploader_avatar,
    (array_agg(rq.organ order by rq.slice_index) filter (where rq.organ is not null))[1] as organ,
    (array_agg(rq.modality order by rq.slice_index) filter (where rq.modality is not null))[1] as modality,
    (array_agg(rq.plane order by rq.slice_index) filter (where rq.plane is not null))[1] as plane,
    (array_agg(rq.loinc_code order by rq.slice_index) filter (where rq.loinc_code is not null))[1] as loinc_code,
    (array_agg(rq.radlex_playbook_id order by rq.slice_index) filter (where rq.radlex_playbook_id is not null))[1] as radlex_playbook_id,
    (array_agg(rq.body_part_examined order by rq.slice_index) filter (where rq.body_part_examined is not null))[1] as body_part_examined,
    (array_agg(rq.naming_tier order by rq.slice_index) filter (where rq.naming_tier is not null))[1] as naming_tier,
    count(*) filter (where rq.status = 'pending')::int as pending_count,
    count(*)::int as total_count,
    min(rq.created_at) as first_uploaded,
    max(rq.created_at) as last_uploaded
  from public.review_queue rq
    left join public.profiles up on up.id = rq.uploader_id
  where rq.series_id is not null
  group by rq.series_id, up.display_name, up.avatar_url;

grant select on public.series_review_v to authenticated;

-- ─── 4) batch_approve_series — approve every pending slice in a series ───
-- Per user decision (Sprint 4e Q-B): skip invalid slices, approve the rest,
-- return a JSON summary { approved:int, skipped:int, errors:[{slice, reason}] }.
create or replace function public.batch_approve_series(
  p_series_id uuid,
  p_reviewer_confidence smallint default null,
  p_teaching_pearl text default null,
  p_common_pitfall text default null,
  p_key_slice_index int default null,
  p_coherence_score smallint default null,
  p_coherence_details jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_is_uuid boolean := public._review_queue_id_is_uuid();
  v_ok int := 0;
  v_skip int := 0;
  v_errs jsonb := '[]'::jsonb;
  r review_queue%rowtype;
  v_notified boolean := false;
  v_uploader uuid;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select role into v_role from profiles where id = v_uid;
  if v_role not in ('admin','reviewer') then
    raise exception 'Reviewer or admin role required';
  end if;

  -- Apply series-level metadata to all pending rows first (so approve copies it)
  update review_queue
     set reviewer_confidence = coalesce(p_reviewer_confidence, reviewer_confidence),
         teaching_pearl      = coalesce(p_teaching_pearl,      teaching_pearl),
         common_pitfall      = coalesce(p_common_pitfall,      common_pitfall),
         key_slice_index     = coalesce(p_key_slice_index,     key_slice_index),
         coherence_score     = coalesce(p_coherence_score,     coherence_score),
         coherence_details   = coalesce(p_coherence_details,   coherence_details)
   where series_id = p_series_id and status = 'pending';

  for r in
    select * from review_queue where series_id = p_series_id and status = 'pending'
    order by slice_index asc
    for update
  loop
    v_uploader := r.uploader_id;
    begin
      -- Delegate to canonical approve function to keep insert logic in one place
      if v_is_uuid then
        perform public.approve_bulk_upload_item(r.id::text);
      else
        perform public.approve_bulk_upload_item(r.id::text);
      end if;
      -- After approve_bulk_upload_item, propagate our reviewer/teaching fields
      -- to the freshly-inserted atlas_images row (matched by storage_path + series_id).
      update atlas_images
         set reviewer_confidence = coalesce(r.reviewer_confidence, reviewer_confidence),
             teaching_pearl      = coalesce(r.teaching_pearl,      teaching_pearl),
             common_pitfall      = coalesce(r.common_pitfall,      common_pitfall),
             key_slice_index     = coalesce(r.key_slice_index,     key_slice_index),
             coherence_score     = coalesce(r.coherence_score,     coherence_score),
             coherence_details   = coalesce(r.coherence_details,   coherence_details)
       where series_id = p_series_id
         and slice_index = r.slice_index
         and storage_path = r.storage_path;
      v_ok := v_ok + 1;
    exception when others then
      v_skip := v_skip + 1;
      v_errs := v_errs || jsonb_build_object(
        'slice', r.slice_index,
        'reason', substring(sqlerrm, 1, 200)
      );
    end;
  end loop;

  -- Consolidated notification to the uploader
  if v_uploader is not null and (v_ok > 0 or v_skip > 0) then
    begin
      insert into notifications (user_id, kind, title, body, link)
      values (
        v_uploader, 'series_reviewed',
        'مراجعة سلسلة',
        'اعتُمدت ' || v_ok::text || ' شريحة' ||
        case when v_skip > 0 then ' · تعذّرت ' || v_skip::text || ' شريحة (راجع الأسباب)' else '' end,
        '/pages/contribute.html'
      );
    exception when others then null; end;
  end if;

  return jsonb_build_object(
    'approved', v_ok,
    'skipped',  v_skip,
    'errors',   v_errs,
    'series_id', p_series_id
  );
end;
$$;

grant execute on function public.batch_approve_series(uuid, smallint, text, text, int, smallint, jsonb) to authenticated;

-- ─── 5) update_series_metadata — set educational fields after approval ───
-- Lets a reviewer add/edit teaching_pearl/common_pitfall/key_slice_index
-- on an already-approved series without re-running approve.
create or replace function public.update_series_metadata(
  p_series_id uuid,
  p_reviewer_confidence smallint default null,
  p_teaching_pearl text default null,
  p_common_pitfall text default null,
  p_key_slice_index int default null
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_count int;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select role into v_role from profiles where id = v_uid;
  if v_role not in ('admin','reviewer') then
    raise exception 'Reviewer or admin role required';
  end if;

  update atlas_images
     set reviewer_confidence = coalesce(p_reviewer_confidence, reviewer_confidence),
         teaching_pearl      = coalesce(p_teaching_pearl,      teaching_pearl),
         common_pitfall      = coalesce(p_common_pitfall,      common_pitfall),
         key_slice_index     = coalesce(p_key_slice_index,     key_slice_index)
   where series_id = p_series_id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.update_series_metadata(uuid, smallint, text, text, int) to authenticated;

-- ─── 6) Refresh atlas_public_v to expose the new columns ─────────────────
do $$
declare has_view boolean;
begin
  select exists(select 1 from information_schema.views
                where table_schema='public' and table_name='atlas_public_v')
    into has_view;
  if has_view then
    execute 'drop view public.atlas_public_v cascade';
    execute $view$
      create view public.atlas_public_v as
        select
          ai.id, ai.storage_path,
          ai.organ, ai.modality, ai.plane, ai.sequence,
          ai.structures, ai.level, ai.citation, ai.prompt,
          ai.series_id, ai.slice_index, ai.series_name, ai.series_total,
          ai.loinc_code, ai.radlex_playbook_id, ai.body_part_examined,
          ai.series_technique, ai.naming_tier,
          ai.reviewer_confidence, ai.teaching_pearl, ai.common_pitfall,
          ai.key_slice_index, ai.coherence_score, ai.coherence_details,
          ai.approved_at,
          ai.uploader_id, up.display_name as uploader_name, up.avatar_url as uploader_avatar,
          ai.reviewer_id, rp.display_name as reviewer_name, rp.avatar_url as reviewer_avatar
        from public.atlas_images ai
          left join public.profiles up on up.id = ai.uploader_id
          left join public.profiles rp on rp.id = ai.reviewer_id
        where ai.approved_at is not null
    $view$;
    execute 'grant select on public.atlas_public_v to anon, authenticated';
    raise notice '  · rebuilt atlas_public_v with review columns';
  end if;
end $$;

-- ─── 7) Verification ─────────────────────────────────────────────────────
do $$
declare ai_cols int; rq_cols int; v_ok boolean; fn_ba boolean; fn_um boolean;
begin
  select count(*) into ai_cols
    from information_schema.columns
   where table_schema='public' and table_name='atlas_images'
     and column_name in ('reviewer_confidence','teaching_pearl','common_pitfall','key_slice_index','coherence_score','coherence_details');
  select count(*) into rq_cols
    from information_schema.columns
   where table_schema='public' and table_name='review_queue'
     and column_name in ('reviewer_confidence','teaching_pearl','common_pitfall','key_slice_index','coherence_score','coherence_details');
  select exists(select 1 from information_schema.views where table_schema='public' and table_name='series_review_v')
    into v_ok;
  select exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                where n.nspname='public' and p.proname='batch_approve_series')
    into fn_ba;
  select exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                where n.nspname='public' and p.proname='update_series_metadata')
    into fn_um;

  raise notice '  · atlas_images review columns  : % / 6', ai_cols;
  raise notice '  · review_queue review columns  : % / 6', rq_cols;
  raise notice '  · series_review_v exists        : %', v_ok;
  raise notice '  · batch_approve_series exists   : %', fn_ba;
  raise notice '  · update_series_metadata exists : %', fn_um;

  if ai_cols < 6 or rq_cols < 6 or not v_ok or not fn_ba or not fn_um then
    raise exception 'SERIES-REVIEW-SCHEMA verification failed';
  end if;
end $$;

do $$ begin raise notice '✔ TASK: SERIES-REVIEW-SCHEMA — completed'; end $$;
