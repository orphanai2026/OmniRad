# 🔬 OmniRad — Project Master Plan
**Multimodal Radiologic Anatomy Platform**

| Field | Value |
|-------|-------|
| Version | v4.3 |
| Date | 2026-06-30 |
| Status | ✅ Repository Cleanup (Path B) Done — Ready for Page Redesign / Issues #32-35 / Sprint #1 CT |
| Owner | Mohammed Saeed Alzahrani |
| Type | Independent academic initiative |

---

## ⚠️ Critical Note

> **This is a brand-new project.** No relation to any previous platform. No legacy architecture reused. No previous files or decisions carried over. Built from scratch.

---

# ① Working Protocol — Collaboration Rules with Claude

> These are not recommendations. They are **mandatory commitments** that must appear in every Claude response in every OmniRad conversation.

## Language Policy
```
Conversation language : Arabic (محادثة بالعربي)
Work output language  : English (كود، ملفات، تسميات بالإنجليزي)
Technical terms       : Always English (CT, MRI, HTML, JS…)
```

## The 11 Mandatory Rules

### Rule #1 — Model Assessment | تقييم النموذج
```
EN: Start of every response must show:
AR: كل رد يبدأ بـ:

[Model: Haiku/Sonnet/Opus]
[Files Read: <files read>]
[Task Status: <task state>]
[Action Required: <one specific action>]
```

### Rule #2 — Files First | الملفات أولاً
```
EN: Before any work:
1. Read OMNIRAD_PROJECT.md fully
2. Read OMNIRAD_ISSUES.md fully
3. Check task state in conversation
4. Announce status to user
5. Wait for confirmation before start
```

### Rule #3 — File Wins | الملف يربح دائماً
```
EN: When Claude's memory conflicts with project files → File wins. Always. No exceptions.
```

### Rule #4 — Three Strikes Rule | قاعدة الثلاث محاولات
```
EN: After 3 failed attempts at same problem:
- Stop immediately
- Admit limitation honestly
- Suggest alternatives (new chat / split task / different approach)
```

### Rule #5 — Best Solution First | الحل الأفضل أولاً
```
EN: Present the BEST solution directly. No gradual escalation.
If unclear → ONE clarifying question, then full solution.
```

### Rule #6 — Approval Gate | بوابة الموافقة
```
EN: BEFORE any of these actions — STOP and request explicit approval:
✋ Writing code
✋ Editing existing file
✋ Creating new file
✋ Running bash command
✋ Web searching
✋ Suggesting unrequested feature

Only exception: Explicit user instruction "execute directly"
```

### Rule #7 — Concise by Default | الإيجاز هو الأصل
```
EN: Default response: ≤10 lines
Long responses: only when explicitly requested
NO unsolicited "personal observations"
Maximum ONE question per response
```

### Rule #8 — No Project Creep | لا توسع خارج النطاق
```
EN: Ideas outside current task scope → log in OMNIRAD_ISSUES.md, do NOT execute.
"ONE CONVERSATION = ONE TASK" — Sacred principle.
```

### Rule #9 — Protected Code | الكود المعتمد محمي
```
EN: Any approved feature or file = fully protected.
New task touches ONLY what was explicitly requested.
FORBIDDEN to modify any previously approved file without explicit owner request.
Golden rule: "Fix correctly, never remove functionality."
```

### Rule #10 — Zero Assumptions | لا افتراضات
```
EN: Never assume any feature, behavior, or detail not documented in project files.
If it's not in OMNIRAD_PROJECT.md → it does not get built.
When in doubt → ONE question → wait for answer → then build.
```

### Rule #11 — First Shot Must Be Right | الأول والأخير
```
EN: The first delivered solution must be the final correct solution.
NO "preliminary version" then improvements — think before writing, not after.
```

## ⚠️ Rule #12 — PATCH ONLY | تعديل فقط — لا إعادة كتابة (NEW — 2026-06-27)
```
EN: When modifying an existing file:
1. Read the file first with view tool
2. Identify ONLY the specific lines that need changing
3. Use str_replace for targeted edits ONLY
4. NEVER rewrite the entire file unless explicitly requested
5. If full rewrite is requested → confirm with user first

Violation = feature regression = unacceptable.
AR: لا تُعيد كتابة الملفات كاملة. استخدم str_replace فقط للسطور المحددة.
```

## ⚠️ Rule #13 — File Quote Only | الاقتباس الحرفي من الملف (NEW — 2026-06-28)
```
EN: Before stating ANY of these — task status, version number, 
    feature state, or any project fact:
    1. Read the exact line from the file using view tool
    2. Quote it verbatim in the response
    3. NEVER answer from memory or training data
    4. If unsure → re-read the file → then answer

AR: قبل الإجابة على أي سؤال عن حالة المشروع:
    ١. اقرأ السطر الحرفي من الملف بأداة view
    ٢. اقتبسه حرفياً في الرد
    ٣. لا تُجب أبداً من الذاكرة أو التدريب
    ٤. عند الشك → أعد قراءة الملف → ثم أجب

EN: Violation = answering from memory = same as hallucination = unacceptable.
AR: الانتهاك = الإجابة من الذاكرة = هلوسة = غير مقبول.

TRIGGER: Any question containing these words requires file re-read:
- "what is the status of..."
- "is Task X complete?"
- "what's next?"
- "what version?"
- "what has been done?"
- ما تم / ما التالي / هل اكتملت / ما الإصدار
```

---

# ② Vision & Mission

## Vision
```
To become the world's leading reference for learning 
multimodal radiologic anatomy.
```

## Mission
```
Build an interactive educational platform that enables 
radiologic sciences students and practitioners to explore 
the same anatomical structure across any combination of 
modalities (CT, MRI, US, NM, Angio, X-Ray, Mammo, PET) 
with professional imaging tools and evidence-based 
learning methodology.
```

---

# ③ Market Positioning

## Market Gap (Confirmed by Research + 120 Field Respondents)

| Gap | Evidence |
|-----|----------|
| No multimodal platform | IMAIOS focuses CT/MRI, Radiopaedia on cases |
| No visual discrimination training | Globally absent (Colorization toggle) |
| No Spaced Repetition for atlas | Anki is generic, not for radiology |
| No organized mnemonics library | Every student reinvents independently |
| Arabic weakness in field | Major platforms English-only |
| AI Assistant for radiology in Arabic | Non-existent |

---

# ④ Technical Architecture

## Architecture Principles
```
✅ Vanilla JavaScript ES2020+ (no frameworks)
✅ HTML5 semantic
✅ CSS Variables (unified theme)
✅ Mobile-first responsive
✅ Browser-only deployment (no CLI)
✅ Self-contained HTML files (file:// works)
✅ Web Standards only (no polyfills)
✅ Canvas API for image tools
✅ Data embedded inline in HTML (no fetch for critical data)

❌ FORBIDDEN: React, Vue, Angular, jQuery
❌ FORBIDDEN: Tailwind, Bootstrap, Material UI
❌ FORBIDDEN: build tools (webpack, vite, etc.)
❌ FORBIDDEN: external CDN for libraries
❌ FORBIDDEN: crossOrigin='anonymous' on Wikimedia images (causes CORS failure)
```

## Critical Lessons Learned
```
1. Never use crossOrigin='anonymous' with Wikimedia CC0 images — causes CORS failure
2. Use offsetWidth/offsetHeight not getBoundingClientRect for canvas sizing
3. Clone event targets before re-binding to prevent listener accumulation
4. Use requestAnimationFrame(()=>rAF(()=>init())) for proper timing
5. Active Panel State: all tools target activePanel only
6. Embed critical data inline in HTML — never rely on fetch for JSON files
7. PATCH with str_replace only — never full file rewrites (Rule #12)
8. setTimeout(80ms) before canvas sizing to ensure DOM layout is complete
```

## File Structure
```
OmniRad/
├── index.html                  ← Main page ✅ [header comment added]
├── pages/
│   ├── atlas.html              ← Task #3 ✅ + Task #5 ✅ + Task #7 ✅ + Task #12 ✅
│   ├── comparison.html         ← Task #4 ✅ + Task #12 ✅ (fully functional)
│   ├── srs.html                ← Task #9 ✅
│   ├── mnemonics.html          ← Task #10 ✅ + Task #12 ✅ (embedded data)
│   ├── ai-chat.html            ← Task #11 ✅
│   ├── auth.html               ← Task #14 ✅ (Sign In / Sign Up)
│   ├── my-progress.html        ← Task #14 ✅ (Dashboard + SRS Stats)
│   ├── clinic.html             ← Task #12.5 ✅
│   └── daily.html              ← Task #17 ✅ (Daily Challenge + Streak + Leaderboard)
├── archive/                    ← NEW ✅ 2026-06-30 (Cleanup Path B)
│   ├── survey.html             ← moved from pages/ (Task #8 — testing complete)
│   ├── survey-phase2.html      ← moved from pages/ (Task #13 — testing complete)
│   ├── distribution-guide.html ← moved from pages/ (Task #8 — testing complete)
│   ├── distribution-guide-phase2.html ← moved from pages/ (Task #13 — testing complete)
│   └── results-phase2.html     ← moved from pages/ (Task #13 — testing complete)
├── data/
│   ├── structures.json         ← Task #12 ✅ (12 structures, CC0 images)
│   ├── mnemonics.json          ← Task #12 ✅ (22 mnemonics EN+AR)
│   └── lexicon.json            ← Task #12 ✅ (38 terms)
├── images/
│   ├── home/                   ← NEW ✅ 2026-06-29
│   │   ├── ct_abdomen.png      ← CT Abdomen axial ✅
│   │   ├── mri_brain.png       ← MRI Brain T1W Sagittal ✅
│   │   ├── ultrasound.png      ← Ultrasound abdomen ✅
│   │   ├── chest_xray.png      ← Chest X-Ray PA ✅
│   │   ├── nm_skeleton.png     ← NM Whole Body Bone Scan ✅
│   │   ├── angiography.png     ← Coronary Angiography ✅
│   │   ├── mammography.png     ← Mammography bilateral ✅
│   │   └── skeleton_bg.png     ← Skeleton background ✅
│   └── structures/             ← 2026-06-28
│       ├── liver/              ← ct_original.png + ct_colored.png ✅
│       ├── kidney/             ← ct_original.png + ct_colored.png ✅
│       ├── spleen/             ← mri_original.png + mri_colored.png ✅
│       ├── bladder/            ← ct_original.png + ct_colored.png ✅
│       ├── bone/               ← ct_original.png + ct_colored.png ✅
│       ├── brain/              ← mri_original.png + mri_t2_original.png + mri_pd_original.png ✅
│       ├── neck/               ← mri_original.png + mri_t2_original.png ✅
│       ├── thorax/             ← mri_original.png + mri_t2_original.png ✅ (lung + heart)
│       ├── lung/               ← ⏳ CT مؤجل (يحتاج Male Data كامل ~15GB)
│       ├── pancreas/           ← ⏳ Phase 3
│       ├── stomach/            ← ⏳ Phase 3
│       ├── gallbladder/        ← ⏳ Phase 3
│       └── aorta/              ← ⏳ Phase 3
├── assets/
│   └── theme.css               ← Unified Theme System v1.1 (⚠️ not yet linked by any page — Issue #32)
└── modules/
    ├── srs.js                  ← Task #9 ✅
    ├── lexicon.js               ← Medical Lexicon data + lookup
    └── supabase.js             ← Task #14 ✅ (Auth + SRS + Preferences)
```

### 🧹 Repository Cleanup (Path B) — Done 2026-06-30
```
✅ Header comments added to all 17 HTML/JS files missing one (path, purpose, per-file)
✅ 5 orphaned testing-phase pages (Task #8/#13 surveys & guides) moved pages/ → archive/
   (confirmed via GitHub API: zero inbound links from index.html or active nav)
⏸️ Nav/CSS de-duplication NOT executed — investigated and deferred:
   assets/theme.css already defines .nav-links/.nav-logo/.nav-end matching only
   index.html + comparison.html class names, but with DIFFERENT CSS variable
   names (--acc/--text-s/--bg-ov vs --accent/--text-secondary/--bg-overlay) —
   confirms Issue #32. Safe merge requires visual QA per page; deferred to its
   own task to avoid breaking a working page (Rule #9).
```

---

# ⑤ Phase Roadmap

## 📋 Approved Task Schedule

| # | Task | Phase | Status |
|---|------|-------|--------|
| 0 | Write OMNIRAD_PROJECT.md (this file) | Plan | ✅ Done |
| 1 | Design visual mockups (no code) | Phase 1 | ✅ Done — 2026-06-25 |
| 2 | Build main page + base layout | Phase 1 | ✅ Done — 2026-06-25 |
| 3 | Build Smart Atlas (5 trial structures) | Phase 1 | ✅ Done — 2026-06-25 |
| 4 | Build Multimodal Comparison Engine | Phase 1 | ✅ Done — 2026-06-25 |
| 5 | Build Image Tools Suite | Phase 1 | ✅ Done — 2026-06-26 |
| 6 | Build Colorization Toggle — TCIA + MedSAM2 Pipeline | Phase 2 | ✅ Done — 2026-06-27 |
| 7 | Build TTS Module | Phase 1 | ✅ Done — 2026-06-26 |
| 8 | MVP test with 5-7 students | Phase 1 | ✅ Done — 2026-06-26 |
| 9 | Build SRS (Spaced Repetition System) Module | Phase 2 | ✅ Done — 2026-06-26 |
| 10 | Build Mnemonics Library + Medical Lexicon layer | Phase 2 | ✅ Done — 2026-06-26 |
| 11 | Build AI Assistant (AR/EN) | Phase 2 | ✅ Done — 2026-06-26 |
| 12 | Expand content (full Abdomen) + Bug Fixes | Phase 2 | ✅ Done — 2026-06-27 |
| 12.5 | Build Clinic Module — Case Queue → Imaging Request → Structured Report | Phase 2.5 | ✅ Done — 2026-06-27 |
| 13 | Extended test with 20-30 students | Phase 2 | ✅ Done — 2026-06-28 |
| 13.5 | Image Pipeline — TCIA Download + PNG Conversion + GitHub Upload | Phase 2 | ✅ Done — 2026-06-28 |
| 14 | Build user accounts (Backend) | Phase 3 | ✅ Done — 2026-06-28 |
| 15 | Expand to additional body regions — Visible Human Project | Phase 3 | ✅ Done — 2026-06-28 |
| 16 | UI/UX Unification — Nav, Versions, Modality Pills | Phase 3 | ✅ Done — 2026-06-28 |
| 17 | Build Daily Challenge + Community | Phase 3 | ✅ Done — 2026-06-28 |
| 18b | Auth Gate — إلزامية تسجيل الدخول | Phase 3 | ✅ Done — 2026-06-28 |
| 19 | My Progress + SRS Sync + Account Settings + Avatar Picker | Phase 3 | ✅ Done — 2026-06-28 |
| 20 | Official launch + marketing | Phase 3 | ⏳ |
| 21 | Home Page Redesign — real medical images + creative UI | Phase 3 | ✅ Done — 2026-06-29 |
| 22 | Auth Page Redesign — split-screen + skeleton background | Phase 3 | ✅ Done — 2026-06-29 |
| 23 | Atlas Page Redesign — 3D organ cards + modality explorer | Phase 4 | ✅ Done — 2026-06-29 |

---

# ⑧ Image Sources Plan — Approved 2026-06-27

## المبدأ الأساسي
```
نفس Pipeline على جميع المصادر — لا تكرار عمل أبداً
DICOM/NIfTI → Python → PNG أصلي + PNG ملوّن → GitHub → atlas.html Toggle
```

## Pipeline المُنفَّذ فعلياً — 2026-06-28
```
CT-ORG (NIfTI .nii.gz)
    ↓
nibabel + numpy + Pillow → PNG (convert_to_png.py)
    ↓
280 PNG = 140 original + 140 colored

CHAOS (DICOM)
    ↓
pydicom + Pillow → PNG (convert_chaos_to_png.py)
    ↓
~60 PNG = CT + MR T2SPIR

GitHub → images/structures/{organ}/
```

## Python Scripts المُنجزة
```
convert_to_png.py       ← CT-ORG NIfTI → PNG (في OrganSegmentations/)
convert_chaos_to_png.py ← CHAOS DICOM → PNG (في Train_Sets/)
```

## الصور المرفوعة على GitHub — 2026-06-28

| العضو | الملفات | المصدر | الحالة |
|-------|---------|--------|--------|
| liver | ct_original.png + ct_colored.png | CT-ORG ct_28 | ✅ |
| kidney | ct_original.png + ct_colored.png | CT-ORG ct_14 | ✅ |
| spleen | mri_original.png + mri_colored.png | CHAOS MR T2SPIR_34 | ✅ |
| bladder | ct_original.png + ct_colored.png | CT-ORG ct_78 | ✅ |
| bone | ct_original.png + ct_colored.png | CT-ORG ct_24 | ✅ |
| lung | — | — | ⏳ لم تُوجد slice مناسبة |
| pancreas | — | — | ⏳ Phase 3 |
| stomach | — | — | ⏳ Phase 3 |
| gallbladder | — | — | ⏳ Phase 3 |
| aorta | — | — | ⏳ Phase 3 |

## مصادر مرحلة بمرحلة

| المرحلة | المصدر | الأعضاء | التكلفة | المهمة |
|---------|--------|---------|---------|--------|
| Phase 2 ✅ | TCIA — CT-ORG + CHAOS | كبد، كلى، طحال، مثانة، عظام | مجاني CC BY | Task #13.5 |
| Phase 3 | Visible Human Project (NLM) | كامل الجسم (CT+MRI) | مجاني حكومي | Task #15 |
| Phase 4+ | e-Anatomy API / شراكة مستشفى | كامل + سريري | تفاوض | Task #17 |

## Organ Color System (OmniRad)
```javascript
ORGAN_COLORS = {
  liver:     (180, 120, 60),   // بني
  spleen:    (160,  80, 200),  // بنفسجي
  kidney:    (220, 140,  40),  // برتقالي
  pancreas:  (240, 200,  80),  // أصفر
  aorta:     (220,  60,  60),  // أحمر
  ivc:       ( 60, 100, 220),  // أزرق
  stomach:   ( 80, 160, 220),  // أزرق فاتح
  gallbladder:(100, 180, 100), // أخضر
}
```

---

## End of Phase 1 (MVP) — ACHIEVED ✅
```
✅ 5-7 students try for at least 1 hour
✅ 70%+ say "better than Radiopaedia for this purpose" (actual: 80%)
✅ 50%+ request to try again (actual: 80%)
✅ Zero runtime errors (after fixes)
✅ Works on mobile (after Task #8b fixes)
```

## End of Phase 2
```
✅ 20+ students using weekly
✅ Average 15 min/session
✅ AI Assistant answers 80% of questions accurately
✅ 40%+ retention after two weeks
```

---

# ⑨ Content Sprint Plan — Approved 2026-06-28

## المبدأ الأساسي
```
Sprint واحد لكل Modality — كامل الجسم في كل Sprint
لا حدود مسبقة للأعضاء — كل عضو يُصوَّر بالوسيلة = يُضاف
تأجيل Task #20 (الإطلاق) حتى اكتمال Sprint #1 على الأقل
```

## هيكل كل Sprint
```
① صور Original PNG — كل عضو في الجسم
② صور Colored PNG — MedSAM2 Segmentation
③ Labels على الصورة: AR + EN فقط
④ بطاقة البنية: تفاصيل تشريحية AR + EN
⑤ Tab "Latin": المصطلح اللاتيني + TTS نطق
⑥ ربط SRS + Mnemonics لكل بنية
⑦ رفع GitHub + ربط atlas.html + comparison.html
⑧ اختبار وتحقق قبل الانتقال للـ Sprint التالي
```

## Labels — التوزيع المعتمد
```
على الصورة     : AR + EN فقط (واضح، نظيف)
بطاقة البنية  : AR + EN + تفاصيل تشريحية
Tab "Latin"   : المصطلح اللاتيني + TTS
Medical Lexicon: AR + EN + Latin + تعريف كامل
```

## جدول Sprints

| Sprint | Modality | الأعضاء | المصدر | الحالة |
|--------|---------|---------|--------|--------|
| 1 | CT | كامل الجسم — كل عضو قابل للتصوير بـ CT | TCIA CT-ORG + CHAOS + VHP | ⏳ |
| 2 | MRI | كامل الجسم — كل عضو قابل للتصوير بـ MRI | CHAOS + Visible Human | ⏳ |
| 3 | US | كل عضو قابل للتصوير بالموجات فوق الصوتية | مصادر مفتوحة | ⏳ |
| 4 | X-Ray | كل منطقة قابلة للتصوير الشعاعي | Visible Human | ⏳ |
| 5 | NM/PET | كل بروتوكول نووي متاح | TCIA | ⏳ |
| 6 | Angio | كل وعاء دموي رئيسي | TCIA | ⏳ |
| 7 | Mammo | الثدي — كل الأوضاع | TCIA | ⏳ |

## قاعدة Sprint
```
إن كان العضو يُصوَّر بهذه الوسيلة = يُضاف
لا حدود مسبقة — الجسم كاملاً هو الهدف
كل Sprint = منتج تعليمي متكامل قابل للاختبار
```

---

# ⑩ قرارات ما قبل المرحلة 4 — معتمدة 2026-06-28

## القرارات الاستراتيجية

### ① تطوير الصفحات — محادثة مستقلة لكل صفحة
```
كل صفحة تُطوَّر في محادثة خاصة تحت اسم:
"تطوير صفحة {اسم الصفحة}"

الصفحات:
- تطوير صفحة Home       → index.html
- تطوير صفحة Atlas      → pages/atlas.html
- تطوير صفحة Compare    → pages/comparison.html
- تطوير صفحة Mnemonics  → pages/mnemonics.html
- تطوير صفحة Clinic     → pages/clinic.html
- تطوير صفحة Daily      → pages/daily.html
- تطوير صفحة My Progress→ pages/my-progress.html
- تطوير صفحة AI Chat    → pages/ai-chat.html
- تطوير صفحة Auth       → pages/auth.html
```

### ② إعادة تصميم الصفحات قبل Sprint #1
```
كل صفحة تُراجع وتُعاد تصميمها قبل إضافة محتوى Sprint CT
الهدف: قوالب نظيفة جاهزة لاستقبال:
- صور CT الحقيقية
- Labels AR + EN
- Tab Latin
- SRS + Mnemonics
```

### ③ لا صور SVG — صور طبية حقيقية فقط
```
SVG placeholder = غير مقبول في الإنتاج
المصادر المعتمدة (من OMNIRAD_PROJECT.md § ⑧):
- صور TCIA الحالية على GitHub (5 أعضاء)
- إضافة صور TCIA جديدة قبل Sprint #1
```

### ④ الترتيب المعتمد قبل المرحلة 4
```
١. تنظيف المستودع (المسار ب — دون كسر البنية)
٢. تطوير + إعادة تصميم كل صفحة (محادثة مستقلة)
٣. التأكد من عمل Issues #32-35
٤. Sprint #1 CT (المرحلة 4)
٥. Task #20 الإطلاق — بعد اكتمال Sprint #1
```

### ⑤ تنظيف المستودع — المسار (ب) معتمد 2026-06-28
```
القرار: تنظيف دون كسر البنية الحالية — وليس Refactor كامل

السبب:
- المشروع على وشك دخول مرحلة تغييرات كثيفة (Sprint 1-7)
- Refactor كامل (build tools, src/, components/) يخالف
  المبدأ المعتمد: Vanilla JS — no build tools — self-contained HTML
- القيمة غير ملموسة للمستخدم الآن، فقط تسهيل العمل

ما يُنفَّذ (المسار ب):
١. توحيد أسماء الملفات والمجلدات
٢. تعليقات واضحة في كل ملف (header comment)
٣. تبسيط الكود المكرر (مثل nav المكرر عبر 9+ صفحات)
٤. تنظيم images/ بوضوح أكبر استعداداً لـ Sprint #1
٥. مراجعة assets غير المستخدمة وحذفها

ما لا يُنفَّذ:
✗ لا build tools (Vite/Webpack)
✗ لا تقسيم لمكوّنات (components/)
✗ لا تغيير المعمارية الأساسية
✗ لا كسر أي صفحة شغّالة

التوقيت: الـ Refactor الكامل (المسار أ) يُؤجَّل لما بعد الإطلاق الفعلي إن احتيج
```

---

# ⑦ Version History

- **v4.3 — 2026-06-30**
  - Repository Cleanup (Path B) — Done ✅ (تنفيذ مباشر عبر GitHub API بإذن المالك)
  - ✅ Header comments مضافة لـ 17 ملف (HTML/JS) كانت بلا توثيق علوي
  - ✅ 5 صفحات اختبار يتيمة منقولة `pages/` → `archive/`: survey.html · survey-phase2.html · distribution-guide.html · distribution-guide-phase2.html · results-phase2.html (Task #8/#13 — لا روابط واردة من index.html أو nav الفعلي، تحقّقنا عبر API)
  - ⏸️ توحيد nav/CSS عبر الصفحات — تم الفحص وليس التنفيذ: `assets/theme.css` يحتوي تعريفات `.nav-links/.nav-logo/.nav-end` لكن بأسماء متغيرات مختلفة عن index.html/comparison.html (`--acc` مقابل `--accent`...) — الدمج الآمن يحتاج مراجعة بصرية صفحة بصفحة، مؤجل كمهمة مستقلة (Rule #9 — عدم المخاطرة بكسر صفحة شغّالة). يبقى Issue #32 مفتوحاً.
  - بنية الملفات في § ④ محدَّثة: إضافة `archive/` و`assets/theme.css` و`modules/lexicon.js` للقائمة

- **v4.2 — 2026-06-29**
  - قرار رسمي: تنظيف المستودع — المسار (ب) معتمد
  - السبب: المشروع على وشك Sprint 1-7 — Refactor كامل يخالف مبدأ Vanilla JS
  - يُنفَّذ: توحيد الأسماء · تعليقات · تبسيط التكرار · تنظيم images/
  - لا يُنفَّذ: build tools · components/ · تغيير المعمارية
  - قسم ⑩.⑤ مضاف في OMNIRAD_PROJECT.md
  - الترتيب المحدَّث: تنظيف → تصميم الصفحات → Issues → Sprint #1 → الإطلاق

- **v4.1 — 2026-06-29**
  - Task #23 approved: Atlas Page Redesign ✅
    - Welcome Screen كامل: Hero + Stats + Start Exploring + Modality Explorer + Learning Tools
    - Hero: صورة تشريحية حقيقية (body illustration) + teal radial glow + gradient overlay
    - Stats bar: 17 Structures · 5+ Modalities · 22 Memory Aids
    - Start Exploring: كروت أفقية scrollable لكل 17 عضو — صور حقيقية مضمّنة base64 (Liver, Gallbladder, Kidney, Pancreas, Aorta) + file paths للباقي
    - Explore by Modality: CT · MRI · Ultrasound · X-Ray · NM/PET
    - Learning Tools bar: Hotspots · Mnemonics · Quiz · Compare · Cases · SRS Review
    - كل الوظائف الأصلية محفوظة (canvas tools, TTS, SRS, colorize, auth guard)
    - str_replace patches فقط (Rule #12 مُحترم) — 3 patches + 2 Python replacements

- **v4.0 — 2026-06-29**
  - Task #21 approved: Home Page Redesign ✅
    - تخطيط جديد: Hero يسار + card grid يمين بصور طبية حقيقية
    - 8 صور طبية مرفوعة على `images/home/`: CT، MRI Brain، US، X-Ray، NM، Angio، Mammo، Skeleton BG
    - Multimodal Comparison card مع صورتين جانبيتين
    - Skeleton background شفاف في Hero
    - Stats bar: 8 Modalities / AR-EN / SM-2 / Phase 3
  - Task #22 approved: Auth Page Redesign ✅
    - تخطيط Split-Screen: يسار skeleton + معلومات / يمين Form
    - صورة skeleton بلا حدود (mask-image radial gradient) opacity 40%
    - لوغو OR الجديد (بدلاً من Ω القديم)
    - حقول مع أيقونات ✉ 🔒 👤
    - كل الأكواد محفوظة: signIn، signUp، toggleLang، Supabase، returnTo
  - images/home/ مجلد جديد — 8 صور مرفوعة
  - Task #23 مضاف: Atlas Redesign — محادثة مستقلة

- **v3.9 — 2026-06-28** (first entry)
  - 7 Sprints بالـ Modality: CT → MRI → US → X-Ray → NM/PET → Angio → Mammo
  - كل Sprint = كامل الجسم (لا حدود مسبقة للأعضاء)
  - Labels معتمدة: AR+EN على الصورة · Latin في Tab منفصل
  - تأجيل Task #20 (الإطلاق) حتى اكتمال Sprint #1

- **v3.9 — 2026-06-28**
  - قسم ⑨ مضاف: Content Sprint Plan — 7 Sprints بالـ Modality
  - قسم ⑩ مضاف: قرارات ما قبل المرحلة 4 — معتمدة
  - كل صفحة = محادثة مستقلة "تطوير صفحة {اسم}"
  - لا SVG placeholder — صور طبية حقيقية فقط
  - إعادة تصميم الصفحات قبل Sprint #1 CT
  - تأجيل Task #20 حتى اكتمال Sprint #1

- **v3.8 — 2026-06-28**
  - Task #19 approved: My Progress + SRS Sync + Account Settings ✅
  - **pages/my-progress.html:** Avatar Picker (16 أيقونة إشعاعية) · تغيير الاسم · تغيير كلمة المرور · استعادة كلمة المرور · Streak حقيقي من Supabase · إصلاح loadData (getUser أولاً بدون network)
  - **pages/srs.html:** إصلاح رابط "My Progress" كان يشير لـ srs.html نفسها
  - **pages/atlas.html:** SRS rating → async + upsertSRSCard إلى Supabase (localStorage يبقى fallback)
  - str_replace patches فقط (Rule #12 مُحترم)

- **v3.7 — 2026-06-28**
  - Task #18b approved: Auth Gate — إلزامية تسجيل الدخول ✅
  - **modules/supabase.js:** +3 دوال: `authGuard` · `signOutAndRedirect` · `updateNav`
  - **pages/auth.html:** redirect صحيح بعد login → `returnTo` param أو `index.html`
  - **index.html + 8 صفحات:** guard + updateNav (atlas, comparison, clinic, srs, mnemonics, ai-chat, my-progress, daily)
  - **pages/daily.html:** Guest Banner محسّن
  - str_replace patches فقط (Rule #12 مُحترم)

- **v3.6 — 2026-06-28**
  - Task #17 approved: Build Daily Challenge + Community ✅
  - **Supabase schema:** جدولان جديدان `daily_scores` + `streaks` + `leaderboard` view
  - **modules/supabase.js patch:** +5 دوال: `submitDailyScore` · `getMyDailyScore` · `getLeaderboard` · `getMyStreak` · `updateStreak`
  - **pages/daily.html:** ملف جديد — 30 سؤال تشريحي inline (CT/MRI/X-Ray/US/NM/PET/Angio/Mammo) · سؤال يومي deterministic بالتاريخ · Timer · Feedback EN+AR · Streak Bar · Leaderboard (ذهبي/فضي/برونزي) · Guest Mode
  - **index.html patch:** إضافة `🧠 Daily Challenge` في desktop nav + mobile nav
  - **Issue #27 resolved:** srs.html مربوط بـ Supabase عبر `OmniRadDB.upsertSRSCard`
  - str_replace patches فقط (Rule #12 مُحترم)

- **v3.5 — 2026-06-28**
  - Task #16 approved: UI/UX Unification ✅
  - **index.html إصلاحات:** Phase 1 → Phase 3 · v0.1 → v3.4 → v3.5 · About v2.8 → v3.5 · 13 → 17 structures · 8 modality pills بـ dead `href="#"` → روابط لـ `atlas.html?modality={ct,mri,us,xray,nm,angio,mammo,pet}` · إضافة زر Sign In في nav-end و mobile menu
  - **توحيد Navigation عبر 9 صفحات** — كل صفحة الآن تحتوي نفس الـ 9 روابط: `Home · Atlas · Compare · Mnemonics · My Progress · 🏥 Clinic · ✦ AI · 🧠 Daily · 🔐 Sign In`
  - **srs.html:** أضيف nav كامل (لم يكن موجوداً)
  - **comparison.html:** من 2 رابط → 9 روابط
  - **my-progress.html:** logo `Ω` → `OR` + nav كامل
  - **auth.html:** أضيف "← Home" link (card layout مركزي — لا يحتاج nav كامل)
  - **clinic.html / atlas.html / mnemonics.html / ai-chat.html / daily.html:** nav موحّد بنفس الروابط
  - 11 commit عبر GitHub API · str_replace patches فقط (Rule #12 مُحترم)
  - مؤجل لمحادثة منفصلة: توحيد theme systems (`--bg-base` vs `--bg`) · إضافة theme toggle للصفحات الناقصة · ربط modality filter buttons في comparison

- **v3.4 — 2026-06-28**
  - Task #15 approved: Expand to Additional Body Regions ✅
  - Visible Human Project Sample Data — no license required (public domain since 2019)
  - 4 new organs added to atlas.html: Brain · Neck · Lung · Heart
  - 2 new categories: `thoracic` + `neurological`
  - Images uploaded to GitHub: brain/ · neck/ · thorax/
  - atlas.html: 13 → 17 structures · str_replace patches only (Rule #12)
  - Structures count updated in welcome screen

- **v3.3 — 2026-06-28**
  - Task #14 approved: Build User Accounts (Backend) ✅
  - Supabase project created: `omnirad` (lmbdtktjeggischpqnkw · ap-northeast-1)
  - DB tables: `srs_progress` + `user_preferences` with RLS policies
  - `modules/supabase.js`: Auth + SRS + Preferences API layer
  - `pages/auth.html`: Sign In / Create Account — EN/AR bilingual
  - `pages/my-progress.html`: Dashboard — stats + review queue + preferences
  - Email confirmation flow configured with GitHub Pages redirect URLs
  - Phase 3 now in progress

- **v3.2 — 2026-06-28**
  - Rule #13 مضافة: File Quote Only — لا إجابة من الذاكرة أبداً
  - السبب: Claude أجاب من الذاكرة بدلاً من الملف مما سبب تكرار العمل والخلط
  - الحل الجذري: كل إجابة عن حالة المشروع تستوجب اقتباساً حرفياً من الملف
  - القواعد الآن: 12 → 13 قاعدة إلزامية

- **v3.1 — 2026-06-28**
  - Task #13.5 approved: Image Pipeline Complete ✅
  - تحميل CT-ORG (16.9 GB) عبر IBM Aspera من TCIA
  - تحميل CHAOS Train Sets (2 GB) من Zenodo
  - تثبيت Python pipeline: nibabel · numpy · pillow · pydicom
  - convert_to_png.py: تحويل 280 NIfTI → PNG من CT-ORG
  - convert_chaos_to_png.py: تحويل DICOM → PNG من CHAOS CT + MR T2SPIR
  - إنشاء مجلدات images/structures/ على GitHub (10 أعضاء)
  - حذف مجلد OmniRad/pages المكرر من GitHub
  - رفع صور 5 أعضاء: liver · kidney · spleen · bladder · bone
  - الخطوة التالية: Phase 3 — Task #14 (User Accounts + Backend)

- **v3.0 — 2026-06-28**
  - Task #13 approved: Extended Test with 20–30 Students ✅

- **v2.8 — 2026-06-27**
  - Task #6 approved: Colorization Toggle ✅

- **v2.7 — 2026-06-27**
  - قرار استراتيجي: إيقاف التطوير مؤقتاً حتى اكتمال الصور الحقيقية

- **v2.6 — 2026-06-27**
  - Task #12.5 approved: Clinic Module ✅

- **v2.5 — 2026-06-27**
  - Task #12 approved: Expand Content (Full Abdomen) + Bug Fixes ✅

- **v2.4 — 2026-06-26**
  - Rules expanded from 8 → 11 mandatory rules

- **v2.3 — 2026-06-26**
  - Task #11 approved: Build AI Assistant (AR/EN) ✅

- **v2.2 — 2026-06-26**
  - Task #10 approved: Build Mnemonics Library + Medical Lexicon layer ✅

- **v2.1 — 2026-06-26**
  - Task #9 approved: Build SRS Module ✅

- **v2.0 — 2026-06-26**
  - Task #8 approved: MVP Test with 5–7 Students ✅

---

## 📎 Appendix — Quick Start Template

```
When starting any new conversation, paste this:

"Starting OmniRad task — [task name]

Read governance files:
- OMNIRAD_PROJECT.md
- OMNIRAD_ISSUES.md

Comply with the 12 collaboration rules.
Start with: [Model] [Files Read] [Task Status] [Action Required]
Then request my approval."
```

---

**End of Document — OmniRad Master Plan v4.3**
