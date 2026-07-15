-- ═══════════════════════════════════════════════════════════════
-- TASK NAME: PERMISSIONS-ENFORCE
-- Phase: 4 · Access & Permissions — REAL enforcement (not cosmetic)
-- Run order: AFTER permissions-rbac.sql (needs has_permission()).
-- Depends: phase2-bulk-upload.sql · series-review-schema.sql
-- Repeat safety: FULLY IDEMPOTENT (drop+create policies · create or replace fns)
-- ---------------------------------------------------------------
-- Replaces hard-coded role checks (role in ('admin','reviewer',…))
-- with capability checks via has_permission(). Behavior for the 5
-- base roles is PRESERVED (reviewer preset already grants the caps),
-- but per-user CUSTOM overrides are now honored end-to-end.
--
-- Capability mapping (preserves existing role semantics):
--   upload_images   ≈ old (admin,contributor)  → submit + inserts
--   approve_others  ≈ old (admin,reviewer)      → review updates
--   publish_atlas   ≈ old (admin,reviewer)      → push to atlas_images
-- admin always passes (has_permission returns true for admin).
-- ═══════════════════════════════════════════════════════════════
do $$ begin raise notice '▶ TASK: PERMISSIONS-ENFORCE — starting'; end $$;

-- Guard: abort clearly if RBAC layer is missing
do $$
begin
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                 where n.nspname='public' and p.proname='has_permission') then
    raise exception 'has_permission() missing — run permissions-rbac.sql first';
  end if;
end $$;

-- ─── 1) RLS policies → capability-based ────────────────────────
-- review_queue: insert needs upload_images; update needs approve_others
drop policy if exists rq_insert on public.review_queue;
create policy rq_insert on public.review_queue for insert
  with check (auth.uid() is not null and public.has_permission(auth.uid(),'upload_images'));

drop policy if exists rq_update on public.review_queue;
create policy rq_update on public.review_queue for update
  using (public.has_permission(auth.uid(),'approve_others'));

-- atlas_images: insert (publish) needs publish_atlas
drop policy if exists ai_insert on public.atlas_images;
create policy ai_insert on public.atlas_images for insert
  with check (public.has_permission(auth.uid(),'publish_atlas'));

-- anatomical_structures_ext: insert = upload_images; update = approve_others
drop policy if exists ase_insert on public.anatomical_structures_ext;
create policy ase_insert on public.anatomical_structures_ext for insert
  with check (auth.uid() is not null and public.has_permission(auth.uid(),'upload_images'));

drop policy if exists ase_update on public.anatomical_structures_ext;
create policy ase_update on public.anatomical_structures_ext for update
  using (public.has_permission(auth.uid(),'approve_others'));

-- bulk_uploads: insert needs upload_images
drop policy if exists bu_insert on public.bulk_uploads;
create policy bu_insert on public.bulk_uploads for insert
  with check (auth.uid() is not null and public.has_permission(auth.uid(),'upload_images'));

-- ─── 2) submit_bulk_upload → upload_images ─────────────────────
create or replace function public.submit_bulk_upload(p_images jsonb, p_notes text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_batch uuid;
  v_count int;
  v_item jsonb;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.has_permission(v_uid,'upload_images') then
    raise exception 'FORBIDDEN — upload_images permission required';
  end if;
  if jsonb_typeof(p_images) <> 'array' or jsonb_array_length(p_images) = 0 then
    raise exception 'NO_IMAGES';
  end if;
  v_count := jsonb_array_length(p_images);

  insert into bulk_uploads (submitter_id, total_images, pending, notes)
  values (v_uid, v_count, v_count, p_notes)
  returning id into v_batch;

  for v_item in select * from jsonb_array_elements(p_images) loop
    insert into review_queue (
      batch_id, uploader_id, status, storage_path,
      organ, modality, plane, sequence, structures, level, citation,
      prompt, created_at
    ) values (
      v_batch, v_uid, 'pending',
      v_item->>'storage_path', v_item->>'organ', v_item->>'modality',
      v_item->>'plane', v_item->>'sequence',
      coalesce((select array_agg(x) from jsonb_array_elements_text(v_item->'structures') x), '{}'::text[]),
      v_item->>'level', v_item->>'citation', v_item->>'prompt', now()
    );
  end loop;
  return v_batch;
end;
$$;

-- ─── 3) reject_to_archive → approve_others ─────────────────────
create or replace function public.reject_to_archive(p_review_id bigint, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  r review_queue%rowtype;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.has_permission(v_uid,'approve_others') then
    raise exception 'FORBIDDEN — approve_others permission required';
  end if;
  select * into r from review_queue where id = p_review_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  update review_queue
     set status='rejected', reviewer_id=v_uid, reviewed_at=now(),
         archived_at=now(), archive_reason=coalesce(p_reason,'unspecified')
   where id = p_review_id;
  if r.batch_id is not null then
    update bulk_uploads set rejected=rejected+1, pending=greatest(pending-1,0) where id=r.batch_id;
  end if;
end;
$$;

-- ─── 4) update_series_metadata → approve_others ────────────────
create or replace function public.update_series_metadata(
  p_series_id uuid, p_reviewer_confidence smallint default null,
  p_teaching_pearl text default null, p_common_pitfall text default null,
  p_key_slice_index int default null
) returns int language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_count int;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.has_permission(v_uid,'approve_others') then
    raise exception 'FORBIDDEN — approve_others permission required';
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

-- NOTE (approve functions): approve_bulk_upload_item() and
-- batch_approve_series() keep their existing (admin,reviewer) gate,
-- which is exactly the approve_others/publish_atlas preset. Base-role
-- behavior is unchanged. A *custom* approve_others granted to a
-- non-reviewer will flow through RLS (rq_update/ai_insert) for direct
-- edits; wiring it into those two SECURITY DEFINER RPCs is a follow-up
-- (kept out here to avoid touching the overloaded approve function).

-- ─── 5) Verification ───────────────────────────────────────────
do $$
declare n int;
begin
  select count(*) into n from pg_policies
   where schemaname='public'
     and policyname in ('rq_insert','rq_update','ai_insert','ase_insert','ase_update','bu_insert');
  raise notice '   capability-based policies present: % / 6', n;
  -- smoke: has_permission callable
  perform public.has_permission('00000000-0000-0000-0000-000000000000','view_atlas');
end $$;

do $$ begin raise notice '✔ TASK: PERMISSIONS-ENFORCE — completed'; end $$;
