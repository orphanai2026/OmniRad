-- Patch: add region + approved_at, then backfill from pipeline data
alter table public.atlas_images add column if not exists region       text;
alter table public.atlas_images add column if not exists pathology    text;
alter table public.atlas_images add column if not exists prompt_en    text;
alter table public.atlas_images add column if not exists approved_at  timestamptz;

-- Backfill from collection → region
update public.atlas_images set region = case collection
  when 'UPENN-GBM'        then 'CNS'
  when 'NSCLC-Radiomics'  then 'Chest'
  when 'Pancreas-CT'      then 'Abdomen'
  when 'CT-COLONOGRAPHY'  then 'Pelvis'
  when 'CPTAC-CCRCC'      then 'Abdomen'
  else region
end
where region is null and collection is not null;

-- Backfill approved_at + prompt_en (used as caption source)
update public.atlas_images
  set approved_at = coalesce(approved_at, created_at, now()),
      prompt_en   = coalesce(prompt_en, series_desc)
  where source = 'TCIA (CC-BY)' or collection is not null;

-- Sanity
select count(*) as total,
       count(*) filter (where region is not null)      as with_region,
       count(*) filter (where approved_at is not null) as with_approved
from public.atlas_images;
