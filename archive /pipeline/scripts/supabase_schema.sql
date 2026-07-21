-- ═══════════════════════════════════════════════════════════════
-- OmniRad Atlas schema patch — Pipeline v3 uploads
-- Additive: safe on existing atlas_images table.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.atlas_images (
  id            uuid primary key default gen_random_uuid(),
  organ         text not null,
  modality      text not null,
  storage_path  text not null,
  created_at    timestamptz default now()
);

-- Additive columns (safe if already present)
alter table public.atlas_images add column if not exists organ_name   text;
alter table public.atlas_images add column if not exists plane        text default 'axial';
alter table public.atlas_images add column if not exists public_url   text;
alter table public.atlas_images add column if not exists layers       jsonb default '{}'::jsonb;
alter table public.atlas_images add column if not exists labels       jsonb default '[]'::jsonb;
alter table public.atlas_images add column if not exists slice_index  int;
alter table public.atlas_images add column if not exists z            int;
alter table public.atlas_images add column if not exists series_uid   text;
alter table public.atlas_images add column if not exists series_desc  text;
alter table public.atlas_images add column if not exists collection   text;
alter table public.atlas_images add column if not exists task         text;
alter table public.atlas_images add column if not exists ww_wl        jsonb;
alter table public.atlas_images add column if not exists output_size  int;
alter table public.atlas_images add column if not exists source       text;
alter table public.atlas_images add column if not exists license      text;
alter table public.atlas_images add column if not exists attribution  text;
alter table public.atlas_images add column if not exists standards    jsonb;
alter table public.atlas_images add column if not exists status       text default 'approved';

create index if not exists atlas_images_organ_idx    on public.atlas_images (organ);
create index if not exists atlas_images_modality_idx on public.atlas_images (modality);
create index if not exists atlas_images_series_idx   on public.atlas_images (series_uid, slice_index);

alter table public.atlas_images enable row level security;

drop policy if exists "atlas_images read approved" on public.atlas_images;
create policy "atlas_images read approved"
  on public.atlas_images for select
  using (status = 'approved');

drop policy if exists "atlas_images admin write" on public.atlas_images;
create policy "atlas_images admin write"
  on public.atlas_images for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Bucket: create if not present, force public
insert into storage.buckets (id, name, public)
  values ('atlas','atlas',true)
  on conflict (id) do update set public = true;
