# 🐛 OMNIRAD_ISSUES — Issues & Deferred Tasks Log
**OmniRad — Multimodal Radiologic Anatomy Platform**

*Last updated: 2026-06-26 — Task #5 approved*

---

## Log Rules

| Rule | Details |
|------|---------|
| **Who writes** | Claude documents · User approves priority |
| **When written** | Upon discovery of issue or side idea |
| **When resolved** | In a dedicated conversation, NOT in current task |
| **Golden rule** | ONE CONVERSATION = ONE TASK |

---

## Issue States

| Symbol | Meaning |
|--------|---------|
| 🔴 Urgent | Blocks operation |
| 🟡 Medium | Affects experience |
| 🟢 Low | Non-essential improvement |
| 💡 Idea | Future suggestion |
| ✅ Resolved | Fixed and approved |

---

## Issues Log

| # | Description | Discovered In | Belongs to Task | Priority | Status | Resolution Date |
|---|-------------|---------------|-----------------|----------|--------|----------------|
| 1 | Light Mode too bright/harsh — replaced with Dim Mode (warm blue-gray `oklch(0.88 0.010 240)`) | Task #1 Mockups | Task #2 | 🟡 Medium | ✅ Resolved | 2026-06-25 |
| 2 | Brand Identity + Logo (visual + text logo) requested — needs dedicated conversation | Task #1 Mockups | Future Task | 💡 Idea | 🔴 Open | — |
| 3 | Teal color invisible in Dim Mode — oklch(0.72) too light on light bg → fixed to oklch(0.42) | Task #3 Atlas | Task #3 | 🟡 Medium | ✅ Resolved | 2026-06-25 |
| 4 | RT Modality (Radiation Therapy) + RT-IGRT tools added to Image Tools Suite — educational only, no dose calculation | Task #5 | Task #5 | 💡 Idea | ✅ Resolved | 2026-06-26 |
| 5 | PET + NM modalities added to toolbar with SUV/MTV/Counts tools | Task #5 | Task #5 | 🟢 Low | ✅ Resolved | 2026-06-26 |
| 6 | canvas H variable conflict with document.documentElement caused blank panels | Task #5 | Task #5 | 🔴 Urgent | ✅ Resolved | 2026-06-26 |
| 7 | bindTb() accumulated multiple listeners causing Mode toggle to cancel itself | Task #5 | Task #5 | 🔴 Urgent | ✅ Resolved | 2026-06-26 |

---

## Task Completion Records

| # | Task | Completed | Approved By | Notes |
|---|------|-----------|-------------|-------|
| 1 | Design visual mockups — Home, Atlas, Comparison pages | 2026-06-25 | Mohammed Saeed Alzahrani | Dark Mode primary · medical teal · IBM Plex Sans · OKLCH · Vanilla JS |
| 2 | Build main page + base layout | 2026-06-25 | Mohammed Saeed Alzahrani | Self-contained index.html · Dark/Dim toggle · localStorage · fully responsive |
| 4 | Build Multimodal Comparison Engine | 2026-06-25 | Mohammed Saeed Alzahrani | pages/comparison.html · 7 modalities · Adaptive layout · Quick Presets · Sync Mode · URL params |
| 5 | Build Image Tools Suite | 2026-06-26 | Mohammed Saeed Alzahrani | atlas.html · Canvas-based tools · Active Panel System · Plane Toggle · Split View · Fullscreen · 7 modalities |

---

**End of File**
