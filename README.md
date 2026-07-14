# OmniRad — Radiology Teaching Platform

Bilingual (Arabic · English) educational radiology atlas with AI-generated
teaching images, multi-modality comparison, and standardized (LOINC · RadLex ·
DICOM) case metadata.

**© 2026 Dr. Mohammed Saeed Alzahrani — Educational use only.**
**Not for clinical diagnosis.**

- **Live:** https://orphanai2026.github.io/OmniRad/
- **Docs:** [`docs/phase-3-completion.md`](docs/phase-3-completion.md) · [`docs/architecture.md`](docs/architecture.md) · [`docs/feature-flags.md`](docs/feature-flags.md)
- **Status:** Phase 3 complete (14 Jul 2026) — Phase 4 (Annotations & Export) pending

## Stack
Static HTML + vanilla JS (no bundler) · Supabase (Postgres · Auth · Storage · Vault) ·
Resend (SMTP) · Cloudflare (`orphan99.com`) · GitHub Pages hosting.

## Repo layout
```
pages/          Live application pages
pages/_archived/  Superseded generator tests (noindex)
modules/        Feature JS modules
modules/data/   Reference data (LOINC, RadLex, DICOM CID, anatomy)
supabase/       Live SQL schema + migrations
supabase/_applied/  Historical migrations already run on prod (docs only)
docs/           Architecture · Phase reports · Feature flags
scripts/        Build tools (anatomy v2 refresh)
assets/         Shared CSS + fonts
```

## Standards
LOINC 2.82 · RadLex Playbook · DICOM PS3.x · SNOMED CT · TA2 · WHO UMD ·
IHE BIR · Cornerstone.js · WCAG 2.2 AA.

See `docs/architecture.md` for the full module + data + RPC map.
