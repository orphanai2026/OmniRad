# OmniRad — Build Scripts

## `build-anatomy-v2.mjs`

Generates the anatomy v2 seed (~1,200 structures) from:

- **TA2** — OpenAnatomy JSON (`https://ta2viewer.openanatomy.org/data/ta2.json`)
- **RadLex** — RadLex OWL dump (download from RSNA, place at `scripts/cache/RadLex.owl`)
- **Arabic seed** — extracted from `modules/data/anatomy-master.js` (v1 curated)
- **Arabic auto-fill** — Wikidata SPARQL (`query.wikidata.org`)

### One-time setup

```bash
# 1. Get RadLex OWL from RSNA (free, requires email registration):
#    https://www.rsna.org/practice-tools/data-tools-and-standards/radlex-radiology-lexicon
#    Put the file here:
mkdir -p omnirad-redesign/scripts/cache
mv ~/Downloads/RadLex.owl omnirad-redesign/scripts/cache/RadLex.owl

# 2. Node 20+ required (uses native fetch)
node --version
```

### Run

```bash
cd omnirad-redesign/scripts

# Full run (~5-10 min, hits Wikidata politely)
node build-anatomy-v2.mjs

# Dry run — no writes, just stats
node build-anatomy-v2.mjs --dry

# Skip external calls (uses only TA2 + Arabic seed)
node build-anatomy-v2.mjs --skip-radlex --skip-wikidata
```

### Outputs

- `supabase/anatomy-v2-seed.sql` — run in Supabase SQL editor after `anatomy-v2-schema.sql`
- `modules/data/anatomy-master-v2.snapshot.json` — offline fallback for the frontend loader

### Deploy

```
Supabase SQL editor:
  1. anatomy-v2-schema.sql   (once)
  2. anatomy-v2-seed.sql     (each time you regenerate)

Frontend:
  no code changes needed — anatomy-master-v2.js picks up the new rows
  on the next page load.
```
