# 🐛 OMNIRAD_ISSUES — Issues & Deferred Tasks Log
**OmniRad — Multimodal Radiologic Anatomy Platform**

*Last updated: 2026-06-27 — ✅ Task #6 Complete · Colorization Toggle Live · 13 Structures*

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
| 8 | Colorization Toggle — manual polygon approach failed after 5 attempts. Requires TotalSegmentator segmentation masks (pre-processed) for accurate organ boundaries. Cannot be done with hand-drawn coordinates. Defer to Phase 2 when CT images are processed through TotalSegmentator pipeline. | Task #6 | Phase 2 (after Task #12) | 🟡 Medium | ✅ Resolved — 2026-06-27 |
| 9 | Clinic Module — Case-based clinical simulation workflow: Case Queue → Imaging Request → Structured Report. Inspired by VIXOM architecture. Bridges Atlas (what is it) with clinical thinking (how to reason). High structural value. Build AFTER Task #12 (full content expansion) when enough structures exist to support real cases. Belongs between SRS and AI Assistant in Phase 2 roadmap. Medical Lexicon and Oncology Staging deferred to Phase 4+ as separate scope expansion. | Architecture Review 2026-06-26 | Phase 2.5 (Task #10.5) | 💡 Idea | 🔴 Open | — |
| 10 | Mobile: Tools panel covers images on small screens (P3 tablet + P5 tablet) — fixed in Task #8b with collapse button (▲ Hide / ▼ Show Tools). Verify on real mobile device after next deploy. | Task #8 Test | Task #8b | 🟡 Medium | ✅ Resolved | 2026-06-26 |
| 11 | Mobile: Canvas panels do not resize on orientation change — fixed in Task #8b with ResizeObserver + window.resize re-init. | Task #8 Test | Task #8b | 🔴 Urgent | ✅ Resolved | 2026-06-26 |
| 12 | Mobile: Navigation menu invisible on mobile (hamburger button not prominent enough) — fixed in Task #8b. Retest after GitHub Pages re-enabled. | Task #8 Test | Task #8b | 🔴 Urgent | ✅ Resolved | 2026-06-26 |
| 13 | Logo inconsistency across pages — atlas.html used logo-dot (small dot) while index.html used OR mark + text. Standardized all pages to OR mark + OmniRad text pattern. | Task #9 | All pages | 🟡 Medium | ✅ Resolved | 2026-06-26 |
| 14 | Atlas topbar missing Home/nav links — fixed in Task #10: added Home, Mnemonics, My Progress nav pills | Task #10 | Task #10 | 🟡 Medium | ✅ Resolved | 2026-06-26 |
| 15 | Comparison page logo text-only (no OR mark) — fixed in Task #10 | Task #10 | Task #10 | 🟡 Medium | ✅ Resolved | 2026-06-26 |
| 16 | index.html Mnemonics + My Progress nav links were href="#" — fixed in Task #10 | Task #10 | Task #10 | 🔴 Urgent | ✅ Resolved | 2026-06-26 |
| 17 | atlas.html Canvas blank — crossOrigin='anonymous' caused CORS failure with Wikimedia images. Fixed by removing crossOrigin attribute. | Task #12 | Task #12 | 🔴 Urgent | ✅ Resolved | 2026-06-27 |
| 18 | atlas.html Expand + Split buttons missing — added ⛶ Expand fullscreen overlay + ⊟ Split mode to toolbar. Fixed canvas panel click to activate correctly. | Task #12 | Task #12 | 🟡 Medium | ✅ Resolved | 2026-06-27 |
| 19 | mnemonics.html "Could not load mnemonics data" — fetch('../data/mnemonics.json') fails on GitHub Pages. Fixed by embedding all 22 mnemonics inline in HTML (no fetch needed). | Task #12 | Task #12 | 🔴 Urgent | ✅ Resolved | 2026-06-27 |
| 20 | comparison.html: Zoom/Fullscreen/Save buttons had no function. Placeholder SVG shown instead of real images. Fixed: Canvas-based rendering + full tool functions (pan/zoom/invert/rotate/reset/save/fullscreen) + PET modality added. | Task #12 | Task #12 | 🔴 Urgent | ✅ Resolved | 2026-06-27 |
| 21 | PATCH RULE VIOLATION — repeated full rewrites instead of targeted str_replace patches caused feature regressions across tasks. New rule established: PATCH ONLY, no full file rewrites. | Task #12 | Ongoing | 🔴 Urgent | ✅ Acknowledged | 2026-06-27 |

---

## Task Completion Records

| # | Task | Completed | Approved By | Notes |
|---|------|-----------|-------------|-------|
| 1 | Design visual mockups — Home, Atlas, Comparison pages | 2026-06-25 | Mohammed Saeed Alzahrani | Dark Mode primary · medical teal · IBM Plex Sans · OKLCH · Vanilla JS |
| 2 | Build main page + base layout | 2026-06-25 | Mohammed Saeed Alzahrani | Self-contained index.html · Dark/Dim toggle · localStorage · fully responsive |
| 4 | Build Multimodal Comparison Engine | 2026-06-25 | Mohammed Saeed Alzahrani | pages/comparison.html · 7 modalities · Adaptive layout · Quick Presets · Sync Mode · URL params |
| 5 | Build Image Tools Suite | 2026-06-26 | Mohammed Saeed Alzahrani | atlas.html · Canvas-based tools · Active Panel System · Plane Toggle · Split View · Fullscreen · 7 modalities |
| 6 | Build Colorization Toggle | 2026-06-26 | — | DEFERRED — requires TotalSegmentator masks (Phase 2) |
| 7 | Build TTS Module | 2026-06-26 | Mohammed Saeed Alzahrani | atlas.html · Web Speech API · EN+AR · Slow/Normal/Fast · Floating panel · MutationObserver re-inject |
| 8 | MVP Test with 5–7 Students | 2026-06-26 | Mohammed Saeed Alzahrani | 5 participants · 80% prefer over Radiopaedia · Mobile fix applied · Decision: proceed to Phase 2 |
| 9 | Build SRS Module | 2026-06-26 | Mohammed Saeed Alzahrani | modules/srs.js · pages/srs.html · SM-2 algorithm · 4-button rating · Mastery bar · Dashboard · Logo fix |
| 11 | Build AI Assistant (AR/EN) | 2026-06-26 | Mohammed Saeed Alzahrani | pages/ai-chat.html · Claude Haiku 4.5 · AR/EN · RTL · 20q/day limit · cache · setup guide · Quick Topics |
| 10 | Build Mnemonics Library + Medical Lexicon | 2026-06-26 | Mohammed Saeed Alzahrani | pages/mnemonics.html · modules/lexicon.js · data/mnemonics.json · data/lexicon.json · 12 mnemonics EN+AR · 18 lexicon terms · TTS ♀♂ US · inline tooltips in atlas |
| 12 | Expand Content (Full Abdomen) + Bug Fixes | 2026-06-27 | Mohammed Saeed Alzahrani | 12 structures · 22 mnemonics · 38 lexicon terms · atlas.html rebuilt · mnemonics.html embedded data · comparison.html fully functional · Canvas CORS fixed · Expand/Split/Tools working |
| 6 | Colorization Toggle | 2026-06-27 | Mohammed Saeed Alzahrani | 🎨 Colorize button in toolbar · COLORIZABLE_MAP (organ+modality) · CT paths for all 13 organs · MRI support for spleen · Organ name label (EN+AR) on colored image · Image convention: {mod}_original/colored.png · 3 new structures: kidney, bladder, bone |

---

## 📊 Task #8 — MVP Test Results

### نتائج الاستبيان الإجمالية

| المعيار | الهدف | النتيجة الفعلية | الحالة |
|---------|-------|----------------|--------|
| عدد المشاركين الذين جربوا ≥ 60 دقيقة | 5–7 | 5 / 7 | ✅ |
| نسبة "OmniRad أفضل من Radiopaedia" (Q9 ≥ 4) | 70%+ | 80% (4/5) | ✅ |
| نسبة "أريد التجربة مجدداً" (Q10 = yes) | 50%+ | 80% (4/5) | ✅ |
| أخطاء تقنية موقفة (Q7 = major) | 0 | 3 حالات | ❌ → مُصلحة |
| يعمل على الجوال بدون مشاكل | 100% | 0% → مُصلح | ❌ → مُصلح |

### قرار المتابعة

```
[x] 🟡 متابعة مع تعديلات — تحقق معظم المعايير، مشاكل بسيطة ← القرار المختار

القرار النهائي: متابعة إلى Phase 2 بعد إصلاح مشاكل الجوال
التاريخ: 2026-06-26
الموقّع: Mohammed Saeed Alzahrani
```

---

## 🗺️ خطة مصادر الصور — معتمدة 2026-06-27

### المبدأ الأساسي
```
نفس Pipeline (MedSAM2) على جميع المصادر — لا تكرار عمل
DICOM/PNG → MedSAM2 → PNG أصلي + PNG ملوّن → atlas.html Toggle
```

### الخطة المعتمدة

| المرحلة | المصدر | الأعضاء | التكلفة | المهمة |
|---------|--------|---------|---------|--------|
| Phase 2 ← الآن | TCIA CT-ORG + CHAOS | بطن كامل | مجاني | Task #6 |
| Phase 3 | Visible Human Project (NLM) | كامل الجسم | مجاني | Task #15 |
| Phase 4+ | e-Anatomy API / شراكة | كامل + سريري | تفاوض | Task #17 |

### Issues مضافة

| # | Description | Priority | Status |
|---|-------------|----------|--------|
| 22 | خطة مصادر الصور معتمدة: TCIA Phase 2 · Visible Human Phase 3 · MedSAM2 Pipeline موحّد | 💡 | ✅ Approved |
| 23 | Brand Identity + Logo — محادثة مستقلة مطلوبة | 💡 | 🔴 Open |

---

**End of File**
