# 🔬 OmniRad — Project Master Plan
**Bilingual Radiology Teaching Platform**

| Field | Value |
|-------|-------|
| Version | v6.0 |
| Date | 2026-08-21 |
| Status | ✅ Re-synced with live production repo (`orphanai2026/OmniRad`, GitHub Pages) after ~7-week documentation gap · Phase 3 complete (14 Jul 2026) · Security Audit (Issue #55) complete · Phase 4 (Annotations & Export) pending |
| Owner | Dr. Mohammed Saeed Alzahrani |
| Type | Independent academic initiative |
| Live | https://orphanai2026.github.io/OmniRad/ |

---

## ⚠️ Critical Note — Documentation Re-sync (2026-08-21)

> This file was frozen at v5.0 (2026-07-04) while real development continued
> elsewhere through end of Phase 3 (14 Jul 2026) and a QA audit (21 Jul 2026),
> including an attempted rename to **"TOMANEX"** (19 Jul 2026) that was later
> **reverted** — the project name is confirmed **OmniRad**, permanently, per
> owner confirmation 2026-08-21. This version rebuilds the file directly from
> the live GitHub repository (`main` branch, fetched 2026-08-21) so that Rule
> #3 ("File Wins") is trustworthy again. Older version history below (v2.0–v5.1)
> is kept for record but may not reflect exact current code — treat the repo
> itself as ground truth going forward, and re-sync this file whenever a large
> gap between conversations is suspected.

---

# ① Working Protocol — Collaboration Rules with Claude

> These are not recommendations. They are **mandatory commitments** that must appear in every Claude response in every OmniRad conversation.
>
> **Also read `CLAUDE.md`** (repo root) — a persistent-context file the owner maintains directly in the repo with brand/architecture decisions. If `CLAUDE.md` and this file conflict, prefer whichever has the more recent date on the specific fact in question, and flag the conflict to the owner rather than silently picking one.

## Language Policy
```
Conversation language : Arabic or English (owner switches freely)
Work output language  : English (code, files, technical labels)
Technical terms        : Always English (CT, MRI, HTML, JS…)
```

## The 13 Mandatory Rules

### Rule #1 — Model Assessment
Start of every response shows: `[Model] [Files Read] [Task Status] [Action Required]`

### Rule #2 — Files First
Before any work: read `OMNIRAD_PROJECT.md`, `OMNIRAD_ISSUES.md`, and check for `CLAUDE.md` in the repo if repo access is available. Announce status, wait for confirmation.

### Rule #3 — File Wins
When Claude's memory conflicts with project files → file wins. Always. **Exception:** if the file itself is suspected stale (large time gap, contradicts live repo/DB), say so explicitly instead of trusting it blindly — this is what caused the 2026-08-21 re-sync.

### Rule #4 — Three Strikes Rule
After 3 failed attempts at same problem: stop, admit limitation, suggest alternatives.

### Rule #5 — Best Solution First
Present the best solution directly. One clarifying question max, then full solution.

### Rule #6 — Approval Gate
STOP and request explicit approval before: writing code, editing files, creating files, running bash, web searching, DB writes, suggesting unrequested features. Exception: explicit "execute directly".

### Rule #7 — Concise by Default
Default response ≤10 lines unless the task is explicitly substantive (e.g. security audits, full doc rewrites). Max one question per response.

### Rule #8 — No Project Creep
Ideas outside current task scope → log in `OMNIRAD_ISSUES.md`, don't execute. "ONE CONVERSATION = ONE TASK."

### Rule #9 — Protected Code
Approved features/files are protected. New tasks touch only what's explicitly requested. "Fix correctly, never remove functionality."

### Rule #10 — Zero Assumptions
Never assume undocumented behavior. When in doubt → one question → wait → build.

### Rule #11 — First Shot Must Be Right
First delivered solution must be final and correct.

### Rule #12 — PATCH ONLY
Modify existing files via `str_replace`/targeted SQL only. Never full rewrites unless the owner explicitly asks for one (as happened for this 2026-08-21 re-sync).

### Rule #13 — File Quote Only
Before stating any project fact (status, version, feature state) — read the exact line from the file/repo/DB first. Never answer from memory alone.

---

# ② Vision & Mission

**Vision:** The leading bilingual (AR/EN) reference for learning multimodal radiologic anatomy.

**Mission:** An interactive educational platform for radiologic sciences students and practitioners to explore anatomical structures across imaging modalities, with AI-assisted teaching image generation (manual ChatGPT workflow), standardized (LOINC/RadLex/DICOM) metadata, and a full contributor → review → publish workflow.

**Audience:** Physicians, medical/radiology students, academics. Educational only — **not for clinical diagnosis** (mandatory banner on every page).

---

# ③ Technical Architecture (from `docs/architecture.md`, synced 14 Jul 2026)

## Stack
```
Static HTML + vanilla JS (no bundler) · Supabase (Postgres · Auth · Storage · Vault)
Resend (SMTP) · Cloudflare (orphan99.com) · GitHub Pages hosting
```

## Standards adopted
```
LOINC 2.82 · RadLex Playbook · DICOM PS3.x · SNOMED CT · TA2 · WHO UMD ·
IHE BIR · Cornerstone.js UX · WCAG 2.2 AA · ARIA APG · Material 3 · GitHub Primer ·
RSNA · ACR Appropriateness · ESR iGuide
```

## Non-negotiables
```
✅ No inline API keys in frontend (anon key only)
✅ RLS enabled on every table
✅ ChatGPT UI is the sanctioned image generator (since Jul 2026 — fal.ai/FLUX/Gemini
   failed anatomical accuracy tests, FEATURE_AUTOGEN = false, code retained not deleted)
✅ Educational-only banner on every page
✅ All numeric medical values: Latin digits, LTR direction
✅ All new text: data-i18n key + AR/EN both filled
✅ Colors: Teal #2dd4c8 (dark) / #0b6b64 (dim) — only accent
✅ Fonts: IBM Plex Sans · Noto Sans Arabic · IBM Plex Mono
✅ Never hard-delete accounts — soft-delete + 30-day grace period
```

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

## File Structure (live repo, 2026-08-21)
```
OmniRad/
├── index.html
├── README.md · LICENSE · CLAUDE.md (persistent agent context, repo root)
├── pages/                       ← 20 live pages
│   Public:     index · atlas · comparison · dictionary · contributors · contact · auth
│   Learn:      mnemonics · daily · my-progress · srs
│   Tools:      ai-chat · clinic
│   Contribute: contribute · bulk-upload · studio · profile
│   Admin:      admin · review · anatomy-review
├── modules/                     ← ~25 core/feature JS modules (see below)
│   └── data/                    ← reference data (LOINC, RadLex, DICOM CID, anatomy dicts)
├── supabase/                    ← current authoritative SQL schema + migrations
│   └── _applied/                ← historical migrations already run on prod (docs only)
├── docs/                        ← architecture.md · phase-3-completion.md · feature-flags.md ·
│                                    QA-AUDIT-2026-07-21.md · IP.md · invention-record.md ·
│                                    LICENSE-CONTENT.md
│   └── _archived/                ← old OMNIRAD_PROJECT.md/ISSUES.md snapshots (pre-Phase-3), superseded
├── archive/pipeline/            ← original TCIA/CT-ORG Python pipeline, reference-only (_DEPRECATED.md)
├── scripts/                     ← build-anatomy-v2.mjs (anatomy v2 refresh tool)
├── assets/                      ← shared theme.css + body illustration images
└── index-assets/                ← homepage-specific icons, patterns, media
```

## Module inventory (core, all pages)
`i18n.js` · `supabase.js` · `omnirad-nav.js` · `omnirad-avatars.js` · `omnirad-search.js` · `omnirad-typography.js` · `omnirad-term.js`

## Feature modules
| Module | Consumed by | Purpose |
|---|---|---|
| `omnirad-atlas-dynamic.js` | atlas · index | View-driven card population |
| `omnirad-atlas-series.js` | atlas | Series orchestrator + PACS viewer entry |
| `omnirad-series-viewer.js` | atlas · review | PACS-like modal viewer (41 KB) |
| `omnirad-coherence.js` | atlas · review | AI 4-layer coherence scoring |
| `omnirad-anatomy-ribbon.js` | atlas · review | DICOM CID 4031 color ribbon |
| `omnirad-naming.js` | atlas · bulk · admin · comparison · review | OSERN naming API |
| `omnirad-image-standard.js` | atlas · bulk · comparison · review · studio · anatomy-review | 1024×1024 enforcement |
| `omnirad-flag.js` | atlas · dictionary | Community flagging |
| `omnirad-radlex.js` | anatomy-review · bulk | BioPortal RadLex auto-lookup |
| `omnirad-cloud.js` | comparison · studio | Cloud storage helpers |
| `omnirad-lib.js` | studio | Studio-specific helpers |
| `feature-flags.js` | studio | SSoT flag map (`Object.freeze`) |
| `speak.js` | atlas | Web Speech API TTS |
| `structures.js` | atlas · comparison | Organ registry |
| `viewer.js` | comparison | Comparison-pane viewer |

## Supabase — schema anchors (per `docs/architecture.md`)
```
profiles · notifications · notification_prefs
atlas_images · review_queue · atlas_public_v (view) · atlas_series_public_v
anatomical_structures · anatomical_structures_ext
activity_log · contacts
Vault secrets: resend_api_key, bioportal_api_key(?), fal_api_key, gemini_api_key, openai_api_key
```
Full live schema verified 2026-08-21 via direct Supabase inspection: **~30 tables**, including several not covered by any doc (`generated_images`, `pending_images`, `mnemonics`, `cards`, `permission_catalog`, `role_presets`, `loinc_axis`, `anatomy_flags`, `anatomy_review_queue`, `anatomy_quality_report`, `bulk_uploads`, `anatomy_migration_log`, `anatomy_aliases`, `generation_sessions_archived_2026_07`, `contributors` [deprecated]). `supabase/*.sql` (checked in) + `supabase/_applied/*.sql` (historical, docs-only) together are the closest thing to a schema source of truth; **the live DB itself remains the final authority** until every migration is reconciled into checked-in SQL.

## RPCs (used by frontend, non-exhaustive)
`atlas_dimensional_stats()` · `atlas_series_lookup()` · `atlas_related_series()` · `batch_approve_series()` · `update_series_metadata()` · `submit_bulk_upload()` · `approve_bulk_upload()` · `reject_to_archive()` · `anatomy_stats()`

---

# ④ Phase Roadmap

| Phase | Status | Notes |
|---|---|---|
| Phase 1 (MVP) | ✅ Done — 2026-06-26 | 80%+ preferred over Radiopaedia in student test |
| Phase 2 | ✅ Done — 2026-06-28 | SRS, Mnemonics, AI Assistant, Clinic Module |
| Phase 2.5 | ✅ Done — 2026-06-27 | Clinic Module (Case-based simulation) |
| Phase 3 | ✅ **Complete — 2026-07-14** | 9 sprints, ~15,000 LOC across 36 files. See breakdown below. |
| QA Audit | ✅ Mostly complete — 2026-07-21 | `docs/QA-AUDIT-2026-07-21.md` — P1 items fixed, P2 mostly fixed, P3 tracked |
| Rename attempt "TOMANEX" | 🔴 Reverted — 2026-07-19 → back to OmniRad | Owner confirmed 2026-08-21: name is permanently **OmniRad** |
| Security Audit | ✅ Complete — 2026-08-21 | Issue #55 — see OMNIRAD_ISSUES.md |
| Phase 4 (Annotations & Export) | ⏳ Pending | arrow · circle · measurement · PDF report |
| Phase 5 (Responsive overhaul) | ⏳ Pending | mobile · tablet · iPad · desktop |
| Task #20 — Official Launch | ⏳ Deferred | Blocked on Issue #53 (image-source license review) + Sprint #1 CT content completion |

## Phase 3 — 9 Sprints (per `docs/phase-3-completion.md`)
| # | Name | Highlight |
|---|---|---|
| 1 | Studio cleanup + Feature Flags SSoT | `feature-flags.js` (Object.freeze) + auto-gen retirement |
| 2 | Atlas dynamic + Community badge | View-driven atlas + growth counter |
| 3 | Anatomy Queue + 3-Layer Quality | BioPortal RadLex auto-lookup + Verified ✓ |
| 4a | Series schema | `series_id` + `slice_index` on `atlas_images` |
| 4b | Bulk Upload Series Mode | SortableJS reorder + slice badges |
| 4c | Overload fix + MRI-sequence hide | `approve_bulk_upload` disambiguation |
| 4d | OSERN — Standardized Naming | LOINC 7,089 + RPID 1,004 + DICOM CID 4031 + AR composer |
| 4e | Series Review Workbench | AI Coherence · Anatomy Ribbon · 3-up Viewer · Confidence |
| 4f | Atlas Series Viewer (PACS-like) | Position indicator · Zoom · W/L · Overlay 3-level · Related |
| 4g | Image Standard Enforcement | 1024×1024 DICOM-compatible · client + DB validation |

**Publishable innovations (RSNA-candidate, per phase-3-completion.md):** OSERN naming · AI Coherence Scorer · Anatomy Ribbon · 3-Layer Quality Model · Image Standard Enforcement · PACS-inspired Atlas Series Viewer · Bilingual radiology terminology at scale (129 structures, RadLex-linked).

---

# ⑤ Feature Flags (per `docs/feature-flags.md`)

Single source of truth: `modules/feature-flags.js` (frozen at load).

| Flag | State | Since | Rationale |
|---|---|---|---|
| `AUTOGEN` | `false` | 2026-07-12 | fal.ai/FLUX/Gemini failed anatomical accuracy tests. Manual ChatGPT workflow adopted. RPCs dropped via `supabase/studio-autogen-deprecate.sql`; Vault keys retained for possible restore via `supabase/studio-autogen-restore.sql`. |

---

# ⑥ Content Sprint Plan (Sprint #1 CT — original plan, still relevant)

Sprint #1 CT — Abdomen remains the approved next *content* unit (separate from the Phase 3 platform-feature sprints above): Liver, Gallbladder, Pancreas, Spleen, Kidneys, Adrenal, Stomach, Bowel, Bladder. BTCV/Pancreas-CT dataset (Synapse `syn3193805`, subfolder `syn3376386`) confirmed as primary source — Data Use Agreement accepted, `RawData.zip` (1.53 GB) downloaded, pending transfer to processing machine (see OMNIRAD_ISSUES.md tracker table).

---

# ⑦ Version History

- **v6.0 — 2026-08-21**
  - **Full documentation re-sync** with live GitHub repo (`orphanai2026/OmniRad`, `main`) after ~7-week gap
  - Confirmed via owner: TOMANEX rename (19 Jul 2026) was an abandoned attempt — **project name is permanently OmniRad**
  - Rebuilt architecture, file structure, module inventory, phase roadmap, feature flags directly from `README.md`, `docs/architecture.md`, `docs/phase-3-completion.md`, `docs/feature-flags.md`, `supabase/_applied/README.md`
  - Logged Phase 3 completion (9 sprints, 14 Jul 2026), QA Audit (21 Jul 2026), and the rename/revert as historical fact — full detail in OMNIRAD_ISSUES.md
  - Rules expanded/clarified: Rule #3 now explicitly allows flagging a stale file instead of blind trust; noted `CLAUDE.md` as a second persistent-context file that must be read alongside this one
  - This was an explicit full-rewrite, approved by owner (exception to Rule #12)

- **v5.1 — 2026-08-21**
  - Issue #55 approved & resolved: Cybersecurity Audit (Supabase RLS + functions + views) — see OMNIRAD_ISSUES.md for full breakdown (#55a–#55g)
  - Discovered Issue #56 (later resolved by this v6.0 re-sync): live DB had ~30 tables vs ~14 documented

- **v5.0 — 2026-07-04** — Issues #45, #47, #51 & #52 resolved (see OMNIRAD_ISSUES.md for full v2.0–v5.0 history: MVP, SRS, Mnemonics, AI Assistant, Clinic Module, Image Pipeline, User Accounts, Body Region expansion, UI/UX Unification, Daily Challenge, Auth Gate, page redesigns, Content Database Migration, Frontend Wiring to Supabase).

*(Full pre-2026-07-04 version history — v2.0 through v5.0 — preserved in `docs/_archived/OMNIRAD_PROJECT.md` in the repo and in this Claude Project's prior file versions.)*

---

**End of Document — OmniRad Master Plan v6.0**
