# 🔬 OmniRad — Project Master Plan
**Multimodal Radiologic Anatomy Platform**

| Field | Value |
|-------|-------|
| Version | v3.0 |
| Date | 2026-06-28 |
| Status | ✅ Task #13 Complete — Extended Test Materials Ready |
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
├── index.html                  ← Main page ✅ + About Tab ✅ (v2.9)
├── pages/
│   ├── atlas.html              ← Task #3 ✅ + Task #5 ✅ + Task #7 ✅ + Task #12 ✅
│   ├── comparison.html         ← Task #4 ✅ + Task #12 ✅ (fully functional)
│   ├── srs.html                ← Task #9 ✅
│   ├── mnemonics.html          ← Task #10 ✅ + Task #12 ✅ (embedded data)
│   ├── ai-chat.html            ← Task #11 ✅
│   ├── survey.html             ← Task #8 ✅
│   ├── distribution-guide.html ← Task #8 ✅
│   ├── survey-phase2.html      ← Task #13 ✅
│   ├── distribution-guide-phase2.html ← Task #13 ✅
│   └── results-phase2.html     ← Task #13 ✅
├── data/
│   ├── structures.json         ← Task #12 ✅ (12 structures, CC0 images)
│   ├── mnemonics.json          ← Task #12 ✅ (22 mnemonics EN+AR)
│   └── lexicon.json            ← Task #12 ✅ (38 terms)
└── modules/
    └── srs.js                  ← Task #9 ✅
```

---

# ⑤ Phase Roadmap

## ⏸ Strategic Decision — 2026-06-27
```
قرار: إيقاف جميع أعمال تطوير المنصة مؤقتاً

السبب: المنصة بدون صور حقيقية = هيكل غير قابل للاختبار الفعلي
الشرط: استئناف التطوير بعد اكتمال الصور الحقيقية فقط

الأولوية الحالية:
1. تحميل صور TCIA (CT-ORG + CHAOS)
2. معالجة MedSAM2 → PNG أصلي + PNG ملوّن
3. رفع الصور إلى GitHub
4. استئناف Task #6 (Colorization Toggle)
5. اختبار حقيقي → تصحيح → Task #13
```

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
| About | About Tab — index.html (Hero + Stats + Vision + Features + Roadmap + Closer) | Phase 2 | ✅ Done — 2026-06-27 |
| 13 | Extended test with 20-30 students | Phase 2 | ✅ Done — 2026-06-28 |
| 14 | Build user accounts (Backend) | Phase 3 | ⏳ |
| 15 | Expand to additional body regions — Visible Human Project | Phase 3 | ⏳ |
| 16 | Build Daily Challenge + Community | Phase 3 | ⏳ |
| 17 | Official launch + marketing | Phase 3 | ⏳ |

---

# ⑧ Image Sources Plan — Approved 2026-06-27

## المبدأ الأساسي
```
نفس Pipeline (MedSAM2) على جميع المصادر — لا تكرار عمل أبداً
DICOM → Python (pydicom) → PNG → MedSAM2 → PNG أصلي + PNG ملوّن
```

## Approved Pipeline
```
Source (TCIA/Visible Human)
    ↓
DICOM → PNG  (pydicom + Pillow)
    ↓
MedSAM2 Segmentation  (Bounding Box prompt per organ)
    ↓
Colored PNG Overlay  (per organ color system)
    ↓
GitHub → atlas.html Toggle (Original ↔ Colorized)
```

## مصادر مرحلة بمرحلة

| المرحلة | المصدر | الأعضاء | التكلفة | المهمة |
|---------|--------|---------|---------|--------|
| Phase 2 | TCIA — CT-ORG + CHAOS | بطن كامل (CT+MRI+US) | مجاني CC BY | Task #6 |
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

# ⑦ Version History

- **v3.0 — 2026-06-28**
  - Task #13 approved: Extended Test with 20–30 Students ✅
  - Delivered: survey-phase2.html · distribution-guide-phase2.html · results-phase2.html
  - استبيان Phase 2 يشمل: SRS · Mnemonics · Lexicon · AI Assistant (Clinic مستثناة — ⏳ لم تُبنَ)
  - أسئلة شرطية: SRS rating / AI detail / tools rating تظهر عند الاستخدام فقط
  - دليل التوزيع: رسالة واتساب جاهزة (AR+EN) · جدول زمني 14 يوماً · 6 KPIs موثّقة
  - قالب النتائج: إدخال الأرقام الفعلية · عداد pass/fail تلقائي · قرار المتابعة + توقيع
  - Google PageSpeed Insights: الأداء 92 · إمكانية الوصول 95 · أفضل الممارسات 100 · SEO 90
  - Task #14 هي المهمة التالية: Build user accounts (Backend) — Phase 3

- **v2.9 — 2026-06-27**
  - About Tab approved and live in `index.html`
  - تاب "حول المنصة" مضاف للـ navbar (desktop + mobile)
  - Hero: شعار OR حقيقي + رسم CT axial + عنوان شعري ثنائي اللغة + 8 modality chips
  - Stats band: 4 أرقام بارزة EN/AR
  - Vision & Mission: عمودان EN|AR مع IBM Plex Sans Arabic
  - Features matrix: 8 ميزات ثنائية اللغة مع أيقونات SVG
  - Roadmap: 3 مراحل (Live/Coming/Future) EN+AR
  - Closer: جملة ختامية بشرية EN+AR
  - آلية toggle: click يخفي main ويظهر About والعكس
  - إصلاح: script مدمج واحد بعد خروج JS كنص (bug fix)
  - ألوان المنصة الحقيقية: `#2dd4c8` teal مطابق للشعار

- **v2.8 — 2026-06-27**
  - Task #6 approved: Colorization Toggle ✅
  - زر 🎨 Colorize في toolbar — يظهر عند CT/MRI للأعضاء المدعومة فقط
  - COLORIZABLE_MAP: نظام organ+modality بدلاً من قائمة مسطحة
  - مسارات CT الحقيقية لجميع الـ 13 عضو (جاهزة للصور المستقبلية)
  - 5 أعضاء مفعّلة حالياً: liver, spleen, kidney, bladder, bone
  - spleen MRI مدعوم: mri_original.png + mri_colored.png
  - Label اسم العضو (EN+AR) يظهر على الصورة الملونة
  - اصطلاح تسمية الصور: {mod}_original.png / {mod}_colored.png
  - 3 أعضاء جديدة أُضيفت: kidney, bladder, bone (Pelvic)
  - أُزيل التكرار: kidneys و adrenal-glands حُذفا
  - العدد الكلي: 13 structure

- **v2.7 — 2026-06-27**
  - قرار استراتيجي: إيقاف التطوير مؤقتاً حتى اكتمال الصور الحقيقية
  - السبب: لا يمكن اختبار المنصة أو تقييمها بدون صور طبية حقيقية
  - الأولوية: TCIA → MedSAM2 → PNG → استئناف التطوير
  - المحادثة القادمة: دليل معالجة الصور (TCIA + MedSAM2 Pipeline)

- **v2.6 — 2026-06-27**
  - Task #12.5 approved: Clinic Module (Case Queue → Imaging Request → Structured Report) ✅
  - Task #6 status updated: Blocked → يتطلب TCIA + MedSAM2 pipeline أولاً
  - Task #15 updated: Visible Human Project مذكور صراحةً
  - قسم ⑧ مضاف: Image Sources Plan — خطة مصادر الصور المعتمدة
  - MedSAM2 Pipeline موثّق: TCIA (Phase 2) → Visible Human (Phase 3) → e-Anatomy/شراكة (Phase 4+)
  - Organ Color System موثّق لـ OmniRad

- **v2.5 — 2026-06-27**
  - Task #12 approved: Expand Content (Full Abdomen) + Bug Fixes ✅
  - Delivered: atlas.html (12 structures, Canvas CORS fixed, Expand/Split added) · mnemonics.html (22 embedded mnemonics, no fetch) · comparison.html (Canvas rendering, all buttons functional, PET added) · data/structures.json · data/mnemonics.json · data/lexicon.json
  - Rule #12 added: PATCH ONLY — no full file rewrites, use str_replace for targeted edits
  - Critical lesson: crossOrigin='anonymous' breaks Wikimedia CC0 image loading — never use
  - Critical lesson: embed critical data inline in HTML — never rely on fetch for JSON files

- **v2.4 — 2026-06-26**
  - Rules expanded from 8 → 11 mandatory rules
  - Rule #9: Protected Code · Rule #10: Zero Assumptions · Rule #11: First Shot Must Be Right

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

**End of Document — OmniRad Master Plan v3.0**
