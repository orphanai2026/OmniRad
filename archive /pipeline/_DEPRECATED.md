# ⚠️ DEPRECATED — Pipeline Archived (14 Jul 2026)

**Status:** Reference-only. No longer part of the live platform.

## Why archived
Attempted 11 Jul 2026 as a local TCIA + TotalSegmentator + RadLex pipeline.
Technically successful but **decision reversed 12 Jul 2026** — platform reverted to
manual ChatGPT UI image generation (see `RESUME.md` → Sprint decisions).

## What lives here
| File | Purpose |
|---|---|
| `01_download_tcia.py` | TCIA DICOM fetcher |
| `02_dicom_to_nifti.py` | DICOM → NIfTI converter |
| `03_segment.py` | TotalSegmentator v2 wrapper (GPU) |
| `04_render_layers.py` | PNG + JSON layered output |
| `radlex/radlex_all.json` · `radlex_brain.json` | RadLex ontology snapshot |
| `scripts/supabase_*.sql` | Original Supabase patches (may conflict with current schema) |

## Do NOT
- Run these scripts against the current Supabase project — schema has evolved past
  `supabase_patch_atlas.sql` / `supabase_patch_modality.sql`.
- Import RadLex JSON directly — the live pipeline is now `scripts/build-anatomy-v2.mjs`
  which pulls RadLex from BioPortal API (key in `CLAUDE.md`).

## If we ever revive this
Restart with `supabase/atlas-series-suggestions.sql` and later as the baseline,
not the files under `scripts/`.

---
Retained for provenance and possible future revival — not deleted per project policy.
