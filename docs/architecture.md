# OmniRad — Architecture Map

_Last synced: 14 July 2026 (end of Phase 3)_

## Runtime shape
Static HTML + vanilla JS modules · Supabase backend · GitHub Pages hosting.
No bundler. Every page loads its module set via ordered `<script src>`.

## Load-order contract (every page)
```
1. i18n.js                     → t(key) + RTL/LTR toggle
2. supabase.js                 → client + auth wrapper
3. data/anatomy-master.js      → legacy dict (fallback)
4. data/anatomy-master-v2.js   → live dict (Supabase → snapshot → v1 chain)
5. omnirad-term.js             → hover tooltips
6. omnirad-search.js           → Ctrl+K global search
7. omnirad-typography.js       → font stack
8. omnirad-avatars.js          → MUST load BEFORE nav
9. omnirad-nav.js              → nav bar (56px)
```

## Module inventory

### Core (all pages)
- `i18n.js` · `supabase.js` · `omnirad-nav.js` · `omnirad-avatars.js`
- `omnirad-search.js` · `omnirad-typography.js` · `omnirad-term.js`

### Feature modules
| Module | Consumed by | Purpose |
|---|---|---|
| `omnirad-atlas-dynamic.js` | atlas · index | View-driven card population |
| `omnirad-atlas-series.js` | atlas | Series orchestrator + PACS viewer entry |
| `omnirad-series-viewer.js` | atlas · review | PACS-like modal viewer (41 KB) |
| `omnirad-coherence.js` | atlas · review | AI 4-layer coherence scoring |
| `omnirad-anatomy-ribbon.js` | atlas · review | DICOM CID 4031 color ribbon |
| `omnirad-naming.js` | atlas · bulk · admin · comparison · review | OSERN API |
| `omnirad-image-standard.js` | atlas · bulk · comparison · review · studio · anatomy-review | 1024×1024 enforcement |
| `omnirad-flag.js` | atlas · dictionary | Community flagging |
| `omnirad-radlex.js` | anatomy-review · bulk | BioPortal auto-lookup |
| `omnirad-cloud.js` | comparison · studio | Cloud storage helpers |
| `omnirad-lib.js` | studio | Studio-specific helpers |
| `feature-flags.js` | studio | SSoT flag map (Object.freeze) |
| `speak.js` | atlas | Web Speech API TTS |
| `structures.js` | atlas · comparison | Organ registry |
| `viewer.js` | comparison | Comparison-pane viewer |

### Data modules (`modules/data/`)
- `anatomy-master.js` · `anatomy-master-v2.js` · `anatomy-master-v2.snapshot.json`
- `anatomy-dict.js` · `anatomy-landmarks.js` (studio)
- `presets-acr.js` (studio W/L presets)
- `dicom-body-parts.js` (CID 4031 · 124 body parts · SNOMED)
- `radiology-playbook.js` (**3 MB · 7,089 LOINC codes** — required for OSERN)
- `radiology-arabic.js` (AR composer + WHO UMD terms)

## Pages (live)
```
Public:     index · atlas · comparison · dictionary · contributors · contact · auth
Learn:      mnemonics · daily · my-progress · srs
Tools:      ai-chat · clinic
Contribute: contribute · bulk-upload · studio · profile
Admin:      admin · review · anatomy-review
Archived:   _archived/{flux-ultra,gemini-image,gpt-image}-test.html
```

## Supabase (schema anchors)
- `profiles` · `notifications` · `notification_prefs`
- `atlas_images` · `review_queue` · `atlas_public_v` (view) · `atlas_series_public_v`
- `anatomical_structures` · `anatomical_structures_ext`
- `activity_log` · `contact_messages`
- Vault secrets: `resend_smtp_password`, `bioportal_api_key`, `fal_ai_key`, `gemini_api_key`

## RPCs (used by frontend)
- `atlas_dimensional_stats()` · `atlas_series_lookup()` · `atlas_related_series()`
- `batch_approve_series()` · `update_series_metadata()` · `submit_bulk_upload()`
- `approve_bulk_upload()` · `reject_to_archive()`
- `anatomy_stats()` · `atlas_public_v` view chain

## Contracts
- **Educational-only banner** — every page
- **All numeric medical values** — Latin digits, LTR direction
- **All new text** — `data-i18n` key + AR/EN both filled
- **Colors** — Teal `#2dd4c8` (dark) / `#0b6b64` (dim) only accent
- **Fonts** — IBM Plex Sans · Noto Sans Arabic · IBM Plex Mono
- **Never delete accounts** — soft-delete + 30-day grace

## Non-negotiables
- No inline API keys in frontend (anon only)
- RLS enabled on every table
- ChatGPT UI is the sanctioned image generator (July 2026)
- `FEATURE_AUTOGEN = false` (Studio auto-gen UI hidden; code retained)
