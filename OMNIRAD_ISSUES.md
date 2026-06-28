# 🐛 OMNIRAD_ISSUES — Issues & Deferred Tasks Log
**OmniRad — Multimodal Radiologic Anatomy Platform**

*Last updated: 2026-06-28 — ✅ Issue #34 + #35 Resolved (verified functional, no code change needed) · v3.8*

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
| 1 | Light Mode too bright/harsh — replaced with Dim Mode | Task #1 | Task #2 | 🟡 | ✅ Resolved | 2026-06-25 |
| 2 | Brand Identity + Logo — needs dedicated conversation | Task #1 | Future Task | 💡 | 🔴 Open | — |
| 3 | Teal color invisible in Dim Mode — fixed to oklch(0.42) | Task #3 | Task #3 | 🟡 | ✅ Resolved | 2026-06-25 |
| 4 | RT Modality + RT-IGRT tools added to Image Tools Suite | Task #5 | Task #5 | 💡 | ✅ Resolved | 2026-06-26 |
| 5 | PET + NM modalities added to toolbar | Task #5 | Task #5 | 🟢 | ✅ Resolved | 2026-06-26 |
| 6 | canvas H variable conflict with document.documentElement | Task #5 | Task #5 | 🔴 | ✅ Resolved | 2026-06-26 |
| 7 | bindTb() accumulated multiple listeners | Task #5 | Task #5 | 🔴 | ✅ Resolved | 2026-06-26 |
| 8 | Colorization Toggle manual polygon approach failed | Task #6 | Phase 2 | 🟡 | ✅ Resolved via Python pipeline | 2026-06-28 |
| 9 | Clinic Module — Case-based clinical simulation | Architecture Review | Phase 2.5 | 💡 | ✅ Resolved | 2026-06-27 |
| 10 | Mobile: Tools panel covers images on small screens | Task #8 | Task #8b | 🟡 | ✅ Resolved | 2026-06-26 |
| 11 | Mobile: Canvas panels do not resize on orientation change | Task #8 | Task #8b | 🔴 | ✅ Resolved | 2026-06-26 |
| 12 | Mobile: Navigation menu invisible on mobile | Task #8 | Task #8b | 🔴 | ✅ Resolved | 2026-06-26 |
| 13 | Logo inconsistency across pages | Task #9 | All pages | 🟡 | ✅ Resolved | 2026-06-26 |
| 14 | Atlas topbar missing Home/nav links | Task #10 | Task #10 | 🟡 | ✅ Resolved | 2026-06-26 |
| 15 | Comparison page logo text-only | Task #10 | Task #10 | 🟡 | ✅ Resolved | 2026-06-26 |
| 16 | index.html Mnemonics + My Progress nav links were href="#" | Task #10 | Task #10 | 🔴 | ✅ Resolved | 2026-06-26 |
| 17 | atlas.html Canvas blank — crossOrigin CORS failure | Task #12 | Task #12 | 🔴 | ✅ Resolved | 2026-06-27 |
| 18 | atlas.html Expand + Split buttons missing | Task #12 | Task #12 | 🟡 | ✅ Resolved | 2026-06-27 |
| 19 | mnemonics.html fetch fails on GitHub Pages | Task #12 | Task #12 | 🔴 | ✅ Resolved | 2026-06-27 |
| 20 | comparison.html: Zoom/Fullscreen/Save buttons no function | Task #12 | Task #12 | 🔴 | ✅ Resolved | 2026-06-27 |
| 21 | PATCH RULE VIOLATION — repeated full rewrites | Task #12 | Ongoing | 🔴 | ✅ Acknowledged | 2026-06-27 |
| 22 | خطة مصادر الصور معتمدة | Task #13.5 | — | 💡 | ✅ Approved | 2026-06-28 |
| 23 | Brand Identity + Logo — محادثة مستقلة مطلوبة | — | Future | 💡 | 🔴 Open | — |
| 24 | Lung images — لم تُوجد slice مناسبة في CT-ORG middle slices. الرئة تظهر في slices طرفية فقط. مؤجل لـ Phase 3 مع Visible Human Project. | Task #13.5 | Phase 3 | 🟢 | 🔴 Deferred | — |
| 25 | Pancreas / Stomach / Gallbladder / Aorta — غير موجودة في CT-ORG أو CHAOS. تحتاج BTCV أو Visible Human. مؤجل لـ Phase 3. | Task #13.5 | Phase 3 | 🟢 | 🔴 Deferred | — |
| 26 | GitHub duplicate folder OmniRad/pages — حُذف بالـ API. كان يحتوي survey.html فارغة. | Task #13.5 | — | 🟡 | ✅ Resolved | 2026-06-28 |
| 27 | SRS sync to Supabase — srs.html لا يزال يحفظ في localStorage فقط. يحتاج ربط بـ OmniRadDB.upsertSRSCard عند كل مراجعة. | Task #14 | Task #17 | 🟡 | ✅ Resolved | 2026-06-28 |
| 28 | CT للدماغ والصدر — VHP Sample Data لا يحتوي CT حقيقية. تحتاج Male Data الكامل (~15 GB). مؤجل لـ Task #16 أو Phase 4. | Task #15 | Phase 4 | 🟢 | 🔴 Deferred | — |
| 29 | Navigation غير موحد عبر الصفحات — كل صفحة لها nav مختلف، روابط ناقصة، srs.html و auth.html بلا nav إطلاقاً | Task #16 audit | Task #16 | 🔴 | ✅ Resolved | 2026-06-28 |
| 30 | index.html footer v0.1 + About v2.8 + Phase 1 — كلها قديمة جداً | Task #16 audit | Task #16 | 🟡 | ✅ Resolved | 2026-06-28 |
| 31 | Modality pills في index.html `href="#"` — لا تنقل لأي مكان | Task #16 audit | Task #16 | 🟡 | ✅ Resolved | 2026-06-28 |
| 32 | Theme systems مختلفة بين الصفحات (`--bg-base` vs `--bg`) — يحتاج توحيد بـ theme.css مشترك | Task #16 audit | Future | 🟡 | 🔴 Open | — |
| 33 | Theme toggle ناقص في 7 صفحات (atlas, daily, srs, mnemonics, ai-chat, auth, my-progress) | Task #16 audit | Future | 🟢 | 🔴 Open | — |
| 34 | comparison.html: أزرار modality filters (CT+MRI, CT+US, All, Clear) بلا onclick — تحتاج ربط وظيفي | Task #16 audit | Future | 🟡 | ✅ Resolved | 2026-06-28 |
| 35 | atlas.html: أزرار TTS / Pronounce / Overview / Images / Imaging Guide بلا onclick — تحتاج تحقق وظيفي | Task #16 audit | Future | 🟡 | ✅ Resolved | 2026-06-28 |

---

## Task Completion Records

| # | Task | Completed | Approved By | Notes |
|---|------|-----------|-------------|-------|
| 1 | Design visual mockups | 2026-06-25 | Mohammed Saeed Alzahrani | Dark Mode · IBM Plex Sans · OKLCH |
| 2 | Build main page + base layout | 2026-06-25 | Mohammed Saeed Alzahrani | Self-contained index.html |
| 4 | Build Multimodal Comparison Engine | 2026-06-25 | Mohammed Saeed Alzahrani | pages/comparison.html |
| 5 | Build Image Tools Suite | 2026-06-26 | Mohammed Saeed Alzahrani | atlas.html · Canvas · Active Panel |
| 7 | Build TTS Module | 2026-06-26 | Mohammed Saeed Alzahrani | Web Speech API · EN+AR |
| 8 | MVP Test with 5–7 Students | 2026-06-26 | Mohammed Saeed Alzahrani | 80% prefer over Radiopaedia |
| 9 | Build SRS Module | 2026-06-26 | Mohammed Saeed Alzahrani | SM-2 algorithm |
| 10 | Build Mnemonics Library + Medical Lexicon | 2026-06-26 | Mohammed Saeed Alzahrani | 22 mnemonics · 38 terms |
| 11 | Build AI Assistant (AR/EN) | 2026-06-26 | Mohammed Saeed Alzahrani | Claude Haiku · 20q/day |
| 12 | Expand Content (Full Abdomen) + Bug Fixes | 2026-06-27 | Mohammed Saeed Alzahrani | 13 structures · Canvas CORS fixed |
| 6 | Colorization Toggle | 2026-06-27 | Mohammed Saeed Alzahrani | 🎨 button · COLORIZABLE_MAP |
| 12.5 | Clinic Module | 2026-06-27 | Mohammed Saeed Alzahrani | Case Queue → Imaging → Report |
| 13 | Extended Test with 20–30 Students | 2026-06-28 | Mohammed Saeed Alzahrani | survey-phase2 · distribution guide |
| 13.5 | Image Pipeline — TCIA + CHAOS + GitHub | 2026-06-28 | Mohammed Saeed Alzahrani | 5 أعضاء مرفوعة · Python scripts جاهزة |
| 14 | Build User Accounts (Backend) | 2026-06-28 | Mohammed Saeed Alzahrani | Supabase · auth.html · my-progress.html · supabase.js |
| 15 | Expand to Additional Body Regions | 2026-06-28 | Mohammed Saeed Alzahrani | VHP Sample Data · Brain · Neck · Lung · Heart · 17 structures |
| 16 | UI/UX Unification — Nav, Versions, Modality Pills | 2026-06-28 | Mohammed Saeed Alzahrani | 11 commits · 10 صفحات · str_replace patches فقط |
| 17 | Build Daily Challenge + Community | 2026-06-28 | Mohammed Saeed Alzahrani | daily.html · Supabase schema · supabase.js patch · Issue #27 resolved |
| 18b | Auth Gate — إلزامية تسجيل الدخول | 2026-06-28 | Mohammed Saeed Alzahrani | supabase.js +3 دوال · auth.html redirect · 9 صفحات محمية · Guest Mode مقيّد |
| 19 | My Progress + SRS Sync + Account Settings | 2026-06-28 | Mohammed Saeed Alzahrani | Avatar Picker 16 أيقونة · تغيير الاسم/كلمة المرور · استعادة كلمة المرور · SRS→Supabase sync · إصلاح nav link في srs.html |

---

## 📊 Task #13.5 — Image Pipeline Results

### ما تم تحقيقه

| المهمة | النتيجة |
|--------|---------|
| تحميل CT-ORG | ✅ 16.9 GB · 140 حالة · NIfTI |
| تحميل CHAOS | ✅ 2 GB · CT + MR T2SPIR |
| تثبيت Python pipeline | ✅ nibabel · pydicom · pillow |
| تحويل CT-ORG → PNG | ✅ 280 صورة (140 original + 140 colored) |
| تحويل CHAOS → PNG | ✅ ~60 صورة CT + MR |
| إنشاء مجلدات GitHub | ✅ 10 أعضاء في images/structures/ |
| رفع صور الأعضاء | ✅ 5 أعضاء · 10 صور |

### الأعضاء المرفوعة

| العضو | المصدر | الملفات |
|-------|--------|---------|
| liver | CT-ORG ct_28 | ct_original.png + ct_colored.png |
| kidney | CT-ORG ct_14 | ct_original.png + ct_colored.png |
| spleen | CHAOS MR T2SPIR_34 | mri_original.png + mri_colored.png |
| bladder | CT-ORG ct_78 | ct_original.png + ct_colored.png |
| bone | CT-ORG ct_24 | ct_original.png + ct_colored.png |

### Python Scripts الجاهزة (على جهاز المستخدم)

| الملف | المسار | الوظيفة |
|-------|--------|---------|
| convert_to_png.py | OrganSegmentations/ | CT-ORG NIfTI → PNG |
| convert_chaos_to_png.py | Train_Sets/ | CHAOS DICOM → PNG |

---

**End of File**
