-- ═══════════════════════════════════════════════════════════════════════════
-- TASK NAME: NAMING-STANDARDS-SCHEMA
-- Phase   : 3 · Sprint 4d — Standardized Radiology Naming System
-- Run once: yes (idempotent)
-- Depends : phase2-bulk-upload.sql · series-mode-schema.sql · atlas-dynamic-views.sql
-- Purpose : Add LOINC / RPID / DICOM body-part / technique columns to
--           atlas_images + review_queue · pipe them through the bulk RPCs ·
--           expose atlas_public_v with the new columns and add atlas_by_loinc_v
--           for LOINC-code searches.
-- References : LOINC 2.82 · RadLex Playbook (RSNA) · DICOM PS3.16 CID 4031
-- ═══════════════════════════════════════════════════════════════════════════

do $$ begin raise notice '▶ TASK: NAMING-STANDARDS-SCHEMA — starting'; end $$;

-- ─── 1) Extend atlas_images ───────────────────────────────────────────────
alter table if exists public.atlas_images
  add column if not exists loinc_code          text,
  add column if not exists radlex_playbook_id  text,
  add column if not exists body_part_examined  text,   -- DICOM CID 4031 code
  add column if not exists series_technique    text,   -- W / WO / WO & W / dynamic / cine / ...
  add column if not exists naming_tier         text;   -- 'standard' | 'partial' | 'custom'

-- Optional check-constraint on naming_tier (idempotent add)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'atlas_images_naming_tier_chk'
  ) then
    alter table public.atlas_images
      add constraint atlas_images_naming_tier_chk
      check (naming_tier is null or naming_tier in ('standard','partial','custom'));
    raise notice '  · added atlas_images_naming_tier_chk';
  end if;
end $$;

-- Fast search / filter indexes
create index if not exists atlas_images_loinc_code_idx
  on public.atlas_images (loinc_code) where loinc_code is not null;
create index if not exists atlas_images_rpid_idx
  on public.atlas_images (radlex_playbook_id) where radlex_playbook_id is not null;
create index if not exists atlas_images_bpe_idx
  on public.atlas_images (body_part_examined) where body_part_examined is not null;
create index if not exists atlas_images_naming_tier_idx
  on public.atlas_images (naming_tier) where naming_tier is not null;

-- ─── 2) Extend review_queue ───────────────────────────────────────────────
alter table if exists public.review_queue
  add column if not exists loinc_code          text,
  add column if not exists radlex_playbook_id  text,
  add column if not exists body_part_examined  text,
  add column if not exists series_technique    text,
  add column if not exists naming_tier         text;

create index if not exists review_queue_loinc_code_idx
  on public.review_queue (loinc_code) where loinc_code is not null;

-- ─── 3) submit_bulk_upload — pass naming fields through ──────────────────
create or replace function public.submit_bulk_upload(p_images jsonb, p_notes text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_batch uuid;
  v_count int;
  v_item jsonb;
  v_has_series  boolean;
  v_has_naming  boolean;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select role into v_role from profiles where id = v_uid;
  if v_role not in ('admin','contributor') then
    raise exception 'FORBIDDEN — contributor role required';
  end if;
  if jsonb_typeof(p_images) <> 'array' or jsonb_array_length(p_images) = 0 then
    raise exception 'NO_IMAGES';
  end if;
  v_count := jsonb_array_length(p_images);

  -- Detect column presence (safe on legacy DBs)
  select exists(select 1 from information_schema.columns
                where table_schema='public' and table_name='review_queue' and column_name='series_id')
    into v_has_series;
  select exists(select 1 from information_schema.columns
                where table_schema='public' and table_name='review_queue' and column_name='loinc_code')
    into v_has_naming;

  insert into bulk_uploads (submitter_id, total_images, pending, notes)
  values (v_uid, v_count, v_count, p_notes)
  returning id into v_batch;

  for v_item in select * from jsonb_array_elements(p_images) loop
    if v_has_series and v_has_naming then
      insert into review_queue (
        batch_id, uploader_id, status, storage_path,
        organ, modality, plane, sequence, structures, level, citation, prompt,
        series_id, slice_index, series_name, series_total,
        loinc_code, radlex_playbook_id, body_part_examined, series_technique, naming_tier,
        created_at
      ) values (
        v_batch, v_uid, 'pending',
        v_item->>'storage_path',
        v_item->>'organ', v_item->>'modality', v_item->>'plane', v_item->>'sequence',
        coalesce((select array_agg(x) from jsonb_array_elements_text(v_item->'structures') x), '{}'::text[]),
        v_item->>'level', v_item->>'citation', v_item->>'prompt',
        nullif(v_item->>'series_id','')::uuid,
        nullif(v_item->>'slice_index','')::int,
        nullif(v_item->>'series_name',''),
        nullif(v_item->>'series_total','')::int,
        nullif(v_item->>'loinc_code',''),
        nullif(v_item->>'radlex_playbook_id',''),
        nullif(v_item->>'body_part_examined',''),
        nullif(v_item->>'series_technique',''),
        nullif(v_item->>'naming_tier',''),
        now()
      );
    elsif v_has_series then
      insert into review_queue (
        batch_id, uploader_id, status, storage_path,
        organ, modality, plane, sequence, structures, level, citation, prompt,
        series_id, slice_index, series_name, series_total,
        created_at
      ) values (
        v_batch, v_uid, 'pending',
        v_item->>'storage_path',
        v_item->>'organ', v_item->>'modality', v_item->>'plane', v_item->>'sequence',
        coalesce((select array_agg(x) from jsonb_array_elements_text(v_item->'structures') x), '{}'::text[]),
        v_item->>'level', v_item->>'citation', v_item->>'prompt',
        nullif(v_item->>'series_id','')::uuid,
        nullif(v_item->>'slice_index','')::int,
        nullif(v_item->>'series_name',''),
        nullif(v_item->>'series_total','')::int,
        now()
      );
    else
      insert into review_queue (
        batch_id, uploader_id, status, storage_path,
        organ, modality, plane, sequence, structures, level, citation, prompt,
        created_at
      ) values (
        v_batch, v_uid, 'pending',
        v_item->>'storage_path',
        v_item->>'organ', v_item->>'modality', v_item->>'plane', v_item->>'sequence',
        coalesce((select array_agg(x) from jsonb_array_elements_text(v_item->'structures') x), '{}'::text[]),
        v_item->>'level', v_item->>'citation', v_item->>'prompt',
        now()
      );
    end if;
  end loop;

  return v_batch;
end;
$$;

grant execute on function public.submit_bulk_upload(jsonb, text) to authenticated;

-- ─── 4) approve_bulk_upload_item — copy naming fields to atlas_images ────
-- Rebuild the canonical TEXT overload (single signature — see APPROVE-BULK-OVERLOAD-FIX)
drop function if exists public.approve_bulk_upload_item(uuid);
drop function if exists public.approve_bulk_upload_item(bigint);
drop function if exists public.approve_bulk_upload_item(text);

create or replace function public._review_queue_id_is_uuid()
returns boolean
language sql
stable
set search_path = public
as $$
  select exists(
    select 1 from information_schema.columns
     where table_schema='public' and table_name='review_queue'
       and column_name='id' and data_type='uuid'
  );
$$;

create or replace function public.approve_bulk_upload_item(p_review_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_role text;
  v_row  review_queue%rowtype;
  v_is_uuid boolean := public._review_queue_id_is_uuid();
  v_has_series boolean;
  v_has_naming boolean;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select role into v_role from profiles where id = v_uid;
  if v_role not in ('admin','reviewer') then
    raise exception 'Reviewer or admin role required';
  end if;

  if v_is_uuid then
    select * into v_row from review_queue where id = p_review_id::uuid for update;
  else
    select * into v_row from review_queue where id = p_review_id::bigint for update;
  end if;
  if not found then raise exception 'Review row not found: %', p_review_id; end if;

  select exists(select 1 from information_schema.columns
                where table_schema='public' and table_name='review_queue' and column_name='series_id')
    into v_has_series;
  select exists(select 1 from information_schema.columns
                where table_schema='public' and table_name='review_queue' and column_name='loinc_code')
    into v_has_naming;

  if v_has_series and v_has_naming then
    insert into atlas_images (
      storage_path, organ, modality, plane, sequence,
      structures, level, citation, prompt,
      series_id, slice_index, series_name, series_total,
      loinc_code, radlex_playbook_id, body_part_examined, series_technique, naming_tier,
      uploader_id, reviewer_id, batch_id, approved_at
    ) values (
      v_row.storage_path, v_row.organ, v_row.modality, v_row.plane, v_row.sequence,
      coalesce(v_row.structures, '{}'::text[]), v_row.level, v_row.citation, v_row.prompt,
      v_row.series_id, v_row.slice_index, v_row.series_name, v_row.series_total,
      v_row.loinc_code, v_row.radlex_playbook_id, v_row.body_part_examined, v_row.series_technique, v_row.naming_tier,
      v_row.uploader_id, v_uid, v_row.batch_id, now()
    );
  elsif v_has_series then
    insert into atlas_images (
      storage_path, organ, modality, plane, sequence,
      structures, level, citation, prompt,
      series_id, slice_index, series_name, series_total,
      uploader_id, reviewer_id, batch_id, approved_at
    ) values (
      v_row.storage_path, v_row.organ, v_row.modality, v_row.plane, v_row.sequence,
      coalesce(v_row.structures, '{}'::text[]), v_row.level, v_row.citation, v_row.prompt,
      v_row.series_id, v_row.slice_index, v_row.series_name, v_row.series_total,
      v_row.uploader_id, v_uid, v_row.batch_id, now()
    );
  else
    insert into atlas_images (
      storage_path, organ, modality, plane, sequence,
      structures, level, citation, prompt,
      uploader_id, reviewer_id, batch_id, approved_at
    ) values (
      v_row.storage_path, v_row.organ, v_row.modality, v_row.plane, v_row.sequence,
      coalesce(v_row.structures, '{}'::text[]), v_row.level, v_row.citation, v_row.prompt,
      v_row.uploader_id, v_uid, v_row.batch_id, now()
    );
  end if;

  if v_is_uuid then
    update review_queue set status='approved', reviewer_id=v_uid, reviewed_at=now()
     where id = p_review_id::uuid;
  else
    update review_queue set status='approved', reviewer_id=v_uid, reviewed_at=now()
     where id = p_review_id::bigint;
  end if;

  begin
    if v_row.batch_id is not null then
      update bulk_uploads
         set approved = approved + 1, pending = greatest(pending - 1, 0)
       where id = v_row.batch_id;
    end if;
  exception when others then null; end;

  begin
    insert into notifications (user_id, kind, title, body, link)
    values (v_row.uploader_id, 'image_approved',
            'اعتُمدت صورتك',
            coalesce(v_row.organ,'') || ' · ' || coalesce(v_row.modality,''),
            '/pages/atlas.html?organ=' || coalesce(v_row.organ,''));
  exception when others then null; end;
end;
$$;

grant execute on function public.approve_bulk_upload_item(text) to authenticated;

-- ─── 5) Refresh atlas_public_v to include naming columns ─────────────────
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
          ai.approved_at,
          ai.uploader_id, up.display_name as uploader_name, up.avatar_url as uploader_avatar,
          ai.reviewer_id, rp.display_name as reviewer_name, rp.avatar_url as reviewer_avatar
        from public.atlas_images ai
          left join public.profiles up on up.id = ai.uploader_id
          left join public.profiles rp on rp.id = ai.reviewer_id
        where ai.approved_at is not null
    $view$;
    execute 'grant select on public.atlas_public_v to anon, authenticated';
    raise notice '  · rebuilt atlas_public_v with naming columns';
  else
    raise notice '  · atlas_public_v not present — run atlas-dynamic-views.sql first if needed';
  end if;
end $$;

-- ─── 6) atlas_by_loinc_v — aggregate view keyed by LOINC code ────────────
create or replace view public.atlas_by_loinc_v as
  select
    loinc_code,
    max(radlex_playbook_id)    as radlex_playbook_id,
    max(modality)              as modality,
    max(body_part_examined)    as body_part_examined,
    count(*)::int              as image_count,
    count(distinct series_id) filter (where series_id is not null)::int as series_count,
    count(distinct uploader_id)::int as contributor_count,
    min(approved_at)           as first_seen,
    max(approved_at)           as last_seen
  from public.atlas_images
  where approved_at is not null
    and loinc_code is not null
  group by loinc_code;

grant select on public.atlas_by_loinc_v to anon, authenticated;

-- ─── 7) Verification ─────────────────────────────────────────────────────
do $$
declare
  ai_cols int; rq_cols int; view_ok boolean; fn_count int;
begin
  select count(*) into ai_cols
    from information_schema.columns
   where table_schema='public' and table_name='atlas_images'
     and column_name in ('loinc_code','radlex_playbook_id','body_part_examined','series_technique','naming_tier');
  select count(*) into rq_cols
    from information_schema.columns
   where table_schema='public' and table_name='review_queue'
     and column_name in ('loinc_code','radlex_playbook_id','body_part_examined','series_technique','naming_tier');
  select exists(select 1 from information_schema.views
                where table_schema='public' and table_name='atlas_by_loinc_v')
    into view_ok;
  select count(*) into fn_count
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname='public' and p.proname='approve_bulk_upload_item';

  raise notice '  · atlas_images naming columns : % / 5', ai_cols;
  raise notice '  · review_queue naming columns : % / 5', rq_cols;
  raise notice '  · atlas_by_loinc_v exists      : %', view_ok;
  raise notice '  · approve_bulk_upload_item overloads : % (must be 1)', fn_count;

  if ai_cols < 5 or rq_cols < 5 or not view_ok or fn_count <> 1 then
    raise exception 'NAMING-STANDARDS-SCHEMA verification failed';
  end if;
end $$;

do $$ begin raise notice '✔ TASK: NAMING-STANDARDS-SCHEMA — completed'; end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- REVERSE (manual):
--   drop view if exists public.atlas_by_loinc_v;
--   -- atlas_public_v rebuild is handled by atlas-dynamic-views.sql
--   drop function if exists public.approve_bulk_upload_item(text);
--   alter table public.atlas_images
--     drop column if exists loinc_code, drop column if exists radlex_playbook_id,
--     drop column if exists body_part_examined, drop column if exists series_technique,
--     drop column if exists naming_tier;
--   alter table public.review_queue  (same drops)
-- ═══════════════════════════════════════════════════════════════════════════
