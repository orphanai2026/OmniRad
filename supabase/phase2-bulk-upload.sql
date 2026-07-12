-- ═══════════════════════════════════════════════════════════════
-- TASK NAME: PHASE2-BULK-UPLOAD
-- Phase: 2 — Bulk Upload + Contribute Hub
-- Run order: after PHASE1 (anatomy-v2-schema + seed)
-- Repeat safety: idempotent (uses IF NOT EXISTS + CREATE OR REPLACE)
-- ═══════════════════════════════════════════════════════════════

do $$ begin raise notice '▶ TASK: PHASE2-BULK-UPLOAD — starting'; end $$;

-- ─── 1) Extend atlas_images with structures[] (if missing) ───────
alter table if exists atlas_images
  add column if not exists structures text[] default '{}'::text[],
  add column if not exists level text,
  add column if not exists citation text,
  add column if not exists batch_id uuid;

create index if not exists atlas_images_structures_gin
  on atlas_images using gin (structures);

-- ─── 2) Extend review_queue for bulk + archive ───────────────────
alter table if exists review_queue
  add column if not exists batch_id uuid,
  add column if not exists archived_at timestamptz,
  add column if not exists archive_reason text,
  add column if not exists structures text[] default '{}'::text[],
  add column if not exists level text,
  add column if not exists citation text,
  add column if not exists sequence text;

create index if not exists review_queue_batch_idx on review_queue(batch_id);
create index if not exists review_queue_archived_idx on review_queue(archived_at);

-- ─── 3) anatomical_structures_ext (new structures from uploads) ──
create table if not exists anatomical_structures_ext (
  id            bigserial primary key,
  slug          text unique not null,
  label_en      text not null,
  label_ar      text,
  region        text,
  radlex_id     text,
  ta2_id        text,
  status        text default 'pending' check (status in ('pending','approved','rejected')),
  submitted_by  uuid references auth.users(id) on delete set null,
  reviewed_by   uuid references auth.users(id) on delete set null,
  review_notes  text,
  created_at    timestamptz default now(),
  reviewed_at   timestamptz
);

create index if not exists ase_status_idx on anatomical_structures_ext(status);
create index if not exists ase_slug_trgm on anatomical_structures_ext using gin (slug gin_trgm_ops);

alter table anatomical_structures_ext enable row level security;

drop policy if exists ase_read on anatomical_structures_ext;
create policy ase_read on anatomical_structures_ext for select
  using (true);

drop policy if exists ase_insert on anatomical_structures_ext;
create policy ase_insert on anatomical_structures_ext for insert
  with check (
    auth.uid() is not null
    and exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','contributor'))
  );

drop policy if exists ase_update on anatomical_structures_ext;
create policy ase_update on anatomical_structures_ext for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','reviewer')));

-- ─── 4) bulk_uploads (batch metadata) ────────────────────────────
create table if not exists bulk_uploads (
  id            uuid primary key default gen_random_uuid(),
  submitter_id  uuid references auth.users(id) on delete set null,
  submitted_at  timestamptz default now(),
  total_images  int not null default 0,
  approved      int not null default 0,
  rejected      int not null default 0,
  pending       int not null default 0,
  notes         text
);

alter table bulk_uploads enable row level security;

drop policy if exists bu_read on bulk_uploads;
create policy bu_read on bulk_uploads for select using (
  submitter_id = auth.uid()
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','reviewer'))
);

drop policy if exists bu_insert on bulk_uploads;
create policy bu_insert on bulk_uploads for insert with check (
  submitter_id = auth.uid()
  and exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','contributor'))
);

-- ─── 5) submit_bulk_upload(images jsonb) ─────────────────────────
-- Accepts an array of image records; inserts them into review_queue
-- as pending, with shared batch_id. Returns batch_id.
create or replace function submit_bulk_upload(p_images jsonb, p_notes text default null)
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
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  select role into v_role from profiles where id = v_uid;
  if v_role not in ('admin','contributor') then
    raise exception 'FORBIDDEN — contributor role required';
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
      v_item->>'storage_path',
      v_item->>'organ',
      v_item->>'modality',
      v_item->>'plane',
      v_item->>'sequence',
      coalesce((select array_agg(x) from jsonb_array_elements_text(v_item->'structures') x), '{}'::text[]),
      v_item->>'level',
      v_item->>'citation',
      v_item->>'prompt',
      now()
    );
  end loop;

  return v_batch;
end;
$$;

-- ─── 6) approve_bulk_upload_item(review_id) ──────────────────────
create or replace function approve_bulk_upload_item(p_review_id bigint)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  r review_queue%rowtype;
  v_new_id bigint;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select role into v_role from profiles where id = v_uid;
  if v_role not in ('admin','reviewer') then
    raise exception 'FORBIDDEN — reviewer role required';
  end if;

  select * into r from review_queue where id = p_review_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if r.status <> 'pending' then raise exception 'NOT_PENDING (status=%)', r.status; end if;

  insert into atlas_images (
    storage_path, organ, modality, plane, sequence,
    structures, level, citation, prompt,
    uploader_id, reviewer_id, batch_id, approved_at
  ) values (
    r.storage_path, r.organ, r.modality, r.plane, r.sequence,
    coalesce(r.structures, '{}'::text[]), r.level, r.citation, r.prompt,
    r.uploader_id, v_uid, r.batch_id, now()
  ) returning id into v_new_id;

  update review_queue set status = 'approved', reviewer_id = v_uid, reviewed_at = now()
   where id = p_review_id;

  if r.batch_id is not null then
    update bulk_uploads
       set approved = approved + 1, pending = greatest(pending - 1, 0)
     where id = r.batch_id;
  end if;

  return v_new_id;
end;
$$;

-- ─── 7) reject_to_archive(review_id, reason) ─────────────────────
create or replace function reject_to_archive(p_review_id bigint, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  r review_queue%rowtype;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  select role into v_role from profiles where id = v_uid;
  if v_role not in ('admin','reviewer') then
    raise exception 'FORBIDDEN — reviewer role required';
  end if;

  select * into r from review_queue where id = p_review_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;

  update review_queue
     set status = 'rejected',
         reviewer_id = v_uid,
         reviewed_at = now(),
         archived_at = now(),
         archive_reason = coalesce(p_reason, 'unspecified')
   where id = p_review_id;

  if r.batch_id is not null then
    update bulk_uploads
       set rejected = rejected + 1, pending = greatest(pending - 1, 0)
     where id = r.batch_id;
  end if;
end;
$$;

-- ─── 8) contributor_stats(uid) — safe read ───────────────────────
create or replace function contributor_stats(p_uid uuid default null)
returns table (
  submitted int, approved int, rejected int, pending int, batches int
)
language sql
security definer
set search_path = public
as $$
  with u as (select coalesce(p_uid, auth.uid()) as uid)
  select
    coalesce((select count(*)::int from review_queue where uploader_id = (select uid from u)), 0),
    coalesce((select count(*)::int from review_queue where uploader_id = (select uid from u) and status = 'approved'), 0),
    coalesce((select count(*)::int from review_queue where uploader_id = (select uid from u) and status = 'rejected'), 0),
    coalesce((select count(*)::int from review_queue where uploader_id = (select uid from u) and status = 'pending'), 0),
    coalesce((select count(*)::int from bulk_uploads where submitter_id = (select uid from u)), 0);
$$;

-- ─── 9) leaderboard (admin-only view) ────────────────────────────
create or replace function contributor_leaderboard(p_limit int default 10)
returns table (
  user_id uuid, display_name text, avatar_url text, approved_count int, submitted_count int
)
language plpgsql
security definer
set search_path = public
as $$
declare v_role text;
begin
  select role into v_role from profiles where id = auth.uid();
  if v_role <> 'admin' then raise exception 'FORBIDDEN — admin only'; end if;
  return query
  select p.id, p.display_name, p.avatar_url,
    (select count(*)::int from review_queue rq where rq.uploader_id = p.id and rq.status = 'approved') as approved_count,
    (select count(*)::int from review_queue rq where rq.uploader_id = p.id) as submitted_count
  from profiles p
  where p.role in ('admin','contributor')
  order by approved_count desc, submitted_count desc
  limit p_limit;
end;
$$;

do $$ begin raise notice '✔ TASK: PHASE2-BULK-UPLOAD — completed'; end $$;
