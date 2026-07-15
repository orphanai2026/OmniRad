-- ═══════════════════════════════════════════════════════════════════════════
-- TASK NAME: REGION-ALIGNMENT-MIGRATION
-- Phase: LOINC Unification · Region Alignment
-- Run order: after front-end region labels are deployed (anatomy-master.js et al.)
-- Repeat safety: SAFE to re-run (idempotent — backup taken once, mapping is exact-match)
-- ─────────────────────────────────────────────────────────────────────────
-- Purpose: unify legacy region display labels stored in image rows to the
--          standardized terms aligned with DICOM CID 4031 + LOINC/RSNA Playbook
--          "Region Imaged" + RadLex. IDs elsewhere are immutable slugs; only the
--          human-readable region strings written by Studio/Bulk-Upload change.
--
-- Mapping (legacy → standard):
--   'Head & Neck / CNS' → 'Head & Neck'
--   'Chest / Thorax'    → 'Chest'
--   'Cardiovascular'    → 'Cardiovascular System'
--   'Upper limb'        → 'Upper Extremity'
--   'Lower limb'        → 'Lower Extremity'
--   (Abdomen · Pelvis · Spine · Breast — unchanged)
--
-- Reference: DICOM PS3.16 CID 4031 · LOINC 2.82 Radiology Playbook · RadLex (RSNA)
-- ═══════════════════════════════════════════════════════════════════════════

do $$ begin raise notice '▶ TASK: REGION-ALIGNMENT-MIGRATION — starting'; end $$;

-- ── Reusable mapping function (exact-match; passes through anything else) ────
create or replace function _region_canonical(p text)
returns text language sql immutable as $$
  select case p
    when 'Head & Neck / CNS' then 'Head & Neck'
    when 'Chest / Thorax'    then 'Chest'
    when 'Cardiovascular'    then 'Cardiovascular System'
    when 'Upper limb'        then 'Upper Extremity'
    when 'Lower limb'        then 'Lower Extremity'
    else p
  end;
$$;

-- ── Apply to every table/column that stores a region label ──────────────────
-- Guarded by information_schema so it is safe if a table/column is absent.
do $$
declare
  t record;
  n_backup int;
  n_update int;
begin
  for t in
    select * from (values
      ('atlas_images','region'),
      ('review_queue','region')
    ) as v(tbl, col)
  loop
    -- table + column must exist
    if not exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name=t.tbl and column_name=t.col
    ) then
      raise notice '  · skip %.% (not found)', t.tbl, t.col;
      continue;
    end if;

    -- one-time backup column region_legacy
    execute format(
      'alter table public.%I add column if not exists region_legacy text', t.tbl);
    execute format(
      'update public.%I set region_legacy = %I where region_legacy is null and %I is not null',
      t.tbl, t.col, t.col);
    get diagnostics n_backup = row_count;

    -- apply mapping (only rows that actually change)
    execute format(
      'update public.%I set %I = _region_canonical(%I) where %I is distinct from _region_canonical(%I)',
      t.tbl, t.col, t.col, t.col, t.col);
    get diagnostics n_update = row_count;

    raise notice '  · %.% — backed up % row(s), remapped % row(s)', t.tbl, t.col, n_backup, n_update;
  end loop;
end $$;

-- ── Sanity check: confirm no legacy labels remain in atlas_images ───────────
do $$
declare leftover int;
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='atlas_images' and column_name='region') then
    select count(*) into leftover from public.atlas_images
      where region in ('Head & Neck / CNS','Chest / Thorax','Cardiovascular','Upper limb','Lower limb');
    raise notice '  · sanity: % legacy label(s) remaining in atlas_images.region (expect 0)', leftover;
  end if;
end $$;

do $$ begin raise notice '✔ TASK: REGION-ALIGNMENT-MIGRATION — completed'; end $$;

-- Rollback note: original values preserved in <table>.region_legacy.
-- To revert:  update public.atlas_images set region = region_legacy where region_legacy is not null;
