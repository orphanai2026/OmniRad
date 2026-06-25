# 🐛 OMNIRAD_ISSUES — Issues & Deferred Tasks Log
**OmniRad — Multimodal Radiologic Anatomy Platform**

*Last updated: 2026-06-26 — Task #8 in progress*

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
| 8 | Colorization Toggle — manual polygon approach failed after 5 attempts. Requires TotalSegmentator segmentation masks (pre-processed) for accurate organ boundaries. Cannot be done with hand-drawn coordinates. Defer to Phase 2 when CT images are processed through TotalSegmentator pipeline. | Task #6 | Phase 2 (after Task #12) | 🟡 Medium | 🔴 Deferred | — |

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
| 8 | MVP Test with 5–7 Students | 2026-06-26 | ⏳ Pending | survey.html · distribution-guide.html · results template below |

---

## 📊 Task #8 — MVP Test Results

> **ملء هذا القسم بعد اكتمال الاختبار مع الطلاب**

### نتائج الاستبيان الإجمالية

| المعيار | الهدف | النتيجة الفعلية | الحالة |
|---------|-------|----------------|--------|
| عدد المشاركين الذين جربوا ≥ 60 دقيقة | 5–7 | __ / 7 | ⏳ |
| نسبة "OmniRad أفضل من Radiopaedia" (Q9 ≥ 4) | 70%+ | __%  | ⏳ |
| نسبة "أريد التجربة مجدداً" (Q10 = yes) | 50%+ | __%  | ⏳ |
| أخطاء تقنية موقفة (Q7 = major) | 0 | __ حالة | ⏳ |
| يعمل على الجوال بدون مشاكل | 100% | __%  | ⏳ |

### نتائج كل مشارك

| # | الجهاز | السنة | وقت التجربة | Q9 (أفضل من Radiopaedia) | Q10 (يريد مجدداً) | Q12 (تقييم كلي) | أخطاء؟ |
|---|--------|-------|-------------|--------------------------|-------------------|-----------------|---------|
| P1 | — | — | — | — | — | — | — |
| P2 | — | — | — | — | — | — | — |
| P3 | — | — | — | — | — | — | — |
| P4 | — | — | — | — | — | — | — |
| P5 | — | — | — | — | — | — | — |
| P6 | — | — | — | — | — | — | — |
| P7 | — | — | — | — | — | — | — |

### أبرز الملاحظات المفتوحة (Q15–Q17)

```
أفضل شيء (Q15):
- P1: 
- P2: 
- P3: 

يحتاج تحسيناً (Q16):
- P1: 
- P2: 
- P3: 

مقترحات التطوير (Q17):
- P1: 
- P2: 
- P3: 
```

### الأخطاء التقنية المُبلَّغ عنها (Q8)

| المشارك | الجهاز | وصف الخطأ | الأولوية |
|---------|--------|-----------|---------|
| — | — | — | — |

### الميزة الأكثر إعجاباً (Q13) — تجميع

| الميزة | عدد الأصوات |
|--------|------------|
| أدوات تحليل الصور | — |
| مقارنة الأوضاع | — |
| أطلس التشريح | — |
| النطق TTS | — |
| تصميم الواجهة | — |

### قرار المتابعة

```
[ ] ✅ المتابعة إلى Phase 2 — جميع معايير النجاح تحققت
[ ] 🟡 متابعة مع تعديلات — تحقق معظم المعايير، مشاكل بسيطة
[ ] 🔴 إعادة تصميم أولاً — معايير حرجة لم تتحقق

القرار النهائي: ___________________________
التاريخ: ___________________________
الموقّع: Mohammed Saeed Alzahrani
```

### Issues مكتشفة من الاختبار (تُضاف هنا بعد التحليل)

| # | المشكلة | المشارك | الأولوية | تُحال إلى |
|---|---------|---------|---------|-----------|
| 9 | ⏳ تُملأ بعد الاختبار | — | — | — |

---

**End of File**
