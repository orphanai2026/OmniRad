# Applied Migrations — Historical Record

These SQL files were executed against Supabase via Dashboard **before** we
adopted the practice of keeping every migration under `supabase/` on GitHub.

**They live here as documentation only.** The current schema is the sum of:
- Everything under `supabase/*.sql` (checked-in, still authoritative)
- Everything in this folder (already applied — do NOT re-run)

## Applied (already on production DB)

| File | Applied | Notes |
|---|---|---|
| `anatomy-v2-schema.sql` | Sprint 1 (~Jul 2026) | `anatomical_structures` table · pg_trgm indexes · RLS · `anatomy_stats()` RPC |
| `anatomy-v2-seed.sql` | Sprint 1 | Seeded 129 structures · 103 with RadLex IDs · full Arabic |
| `series-mode-rpc.sql` | Sprint 4a | `series_id` column + reorder RPCs |
| `approve-bulk-overload-fix.sql` | Sprint 4c | Function overload disambiguation for `approve_bulk_upload` |
| `image-metadata-schema.sql` | Sprint 4g | `image_width` · `image_height` · `aspect_ratio` · `aspect_class` · `dimensional_tier` + `_compute_aspect` trigger + `atlas_dimensional_stats()` RPC + rebuild of `atlas_public_v` |

## To recover the exact SQL
Export from Supabase Dashboard:
1. Database → Schema Visualizer → export DDL for affected tables/RPCs
2. Save under this folder with the same filename
3. Commit — this becomes the canonical record.

Until exported, treat the current DB state as the source of truth.
