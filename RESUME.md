# OmniRad — Session Resume Packet

> **How to use:** أرفق هذا الملف في بداية أي جلسة جديدة مع سطر واحد:
> «تابع من هنا — [الرسالة أدناه]».
> Claude يستعيد السياق كاملاً بجزء بسيط من التوكن.

---

## 🎯 الحالة الحالية (21 يوليو 2026 — ✅ **جولة جودة وتحقّق: P1 + P2 مكتملة**)

**أُنجز في «قسم الجودة والتحقّق» (21 يوليو 2026):**
- تقرير تدقيق آلي شامل: `docs/QA-AUDIT-2026-07-21.md`.
- **P1-1:** حذف الملف الميّت `modules/series-slices.js` (القديم؛ المعتمد `modules/data/series-slices.js`).
- **P1-2:** footer «تعليمي فقط» ثنائي اللغة على 9 صفحات كانت تفتقده.
- **P1-3:** إصلاح 404 العام — `index-assets/patterns/arabic-geometry.svg` + `index-assets/icons/favicon.svg` (حقن `<link rel=icon>` من مصدر واحد في nav.js).
- **P1-4:** `omnirad-term.js` `A.resolveToId` منشور (`?v=resolveid`).
- **P2-5/6:** `OmniRadToast` مشترك في nav.js؛ استُبدلت كل `alert()` (admin.js · studio-app.js · studio.html · daily.html) بـtoast موحّد ثنائي اللغة.
- **P2-7:** توحيد كل بصمات الكاش إلى رمز مؤرّخ واحد `?v=20260721` (91 مرجعاً · 20 ملفاً).
- **تنظيف الجذر:** حُذف الملف الميّت + 4 ملفات md قديمة (INSTRUCTIONS · OMNIRAD_ISSUES · OMNIRAD_PROJECT → `docs/_archived/` · CLAUDE المكرّرة) → الجذر = README · RESUME · CLAUDE · LICENSE.

**متبقٍّ من QA:** فحص يدوي لمودالات review/admin (role=dialog + focus-trap) · أرشفة `pipeline/` (اختياري).

**رسالة البداية للمحادثة القادمة:**
```
تابع من هنا — QA: P3 فحص الوصولية (a11y)
```
---

**أُنجز اليوم (21 يوليو 2026):**
- **bulk-upload.html:** إصلاح صفحة فارغة — لفّ `init()` بـ try/catch (كان خطأ صياغة `forEach` مفقود يكسر السكربت كاملاً) + رسالة بوّابة واضحة عند فشل الاتصال.
- **series-slices.js v3:** +41 عضواً جديداً بمستوياتها وبنياتها المتوقّعة (TA2/RadLex/ACR) — رأس وعنق (8)، صدر/أوعية (6)، بطن (7)، حوض (6)، عمود (2)، طرف علوي (5)، سفلي (5)، جدار صدري (2). **معلَّقة لمراجعة طبيب أشعة.** بصمة `?v=series-v3`.
- **الاستوديو:** مؤشّر 📚 بجانب أي عضو له سلسلة في قائمة Organ + شارة مميّزة أسفل الحقل «📚 سلسلة جاهزة · N مستويات» + tooltip بالمستويات.
- **atlas.html — قسم Series:** إصلاح جذري — كان يُبنى مرة واحدة عند التحميل (يقرأ `?organ=` لحظياً)، لا يتحدّث عند اختيار عضو آخر (ثابت على الدماغ). حُوّل لدالة `refreshAtlasSeriesSection()` تُستدعى من `selectStructure()`.
- **atlas_related_series() (SQL) + omnirad-atlas-series.js:** إصلاح «سلاسل ذات صلة» غير منطقية (كبد↔دماغ). كان تطابق المودالتي وحده كافياً؛ الآن **مُثبَّت على العضو** (`organ`) — أضيف مُعامل `p_organ` (100 LOINC · 80 عضو+مودالتي · 60 body_part+مودالتي · 40 عضو). بصمة `?v=related-organ`.
- **omnirad-series-viewer.js (`?v=bc-cine`):** (أ) استبدال W/L الوهمي بمزلاجَي **السطوع/التباين** (±100 + Invert + Reset) توحيداً مع natural-bc؛ (ب) **إصلاح زر الإيقاف** — كان يُعاد رسم كامل الشريط كل إطار فتُفقد النقرة؛ الآن تحديث الإطار **في مكانه** (`updateFrame`)؛ (ج) إبطاء التشغيل (افتراضي 5 FPS، نطاق 1-15)؛ (د) **مؤشّر Superior→Inferior صار سلايدر تفاعلي** (نقر/سحب للتنقّل).
- **omnirad-term.js (`?v=resolveid`):** إصلاح `A.resolveToId is not a function` الذي كان يكسر كل tooltips التشريحية — أُضيف مُحلّل محلي آمن (byId → aliasMap → مسح EN/AR). بصمة على 15 صفحة.
- **review.html:** ✅ **شارة AI Vision Check** (لم تعد مؤجَّلة) — شارة على البطاقة الفردية (✓ Vision / ⚠ Vision? + الثقة٪ + سبب في tooltip) + نقطة على كل مصغّرة في السلسلة + ملخّص في ترويسة السلسلة (👁 N✓ · M⚠). **إنذار مبكّر فقط — القرار البشري نهائي.**

**متبقٍّ (خارج نطاق هذه المرحلة):** مراجعة طبيب أشعة لمستويات/بنى الـ41 عضواً (خارجي) · (اختياري) توسيع vision-check ليُرجع structures[] تلقائياً.

**✅ مرحلة توليد السلايس (Series Mode + Vision + العارض) — مكتملة ومعتمدة (21 يوليو 2026).**

**رسالة البداية للمحادثة القادمة:**
```
تابع من هنا — قسم الجودة والتحقّق من المنصّة
```

---

## 🎯 حالة سابقة (19 يوليو 2026 — 🏆 **حماية الملكية الفكرية (١·٢·٥) مكتملة · الاسم يبقى OmniRad**)

**المنصّة تعمل على:** https://orphanai2026.github.io/OmniRad/
**Supabase Organization:** OmniRad Platform (تحت `omniradai@gmail.com`)

**آخر توقّف:** استُكشف اسم بديل (TOMANEX) بشعار وهوية كاملة — **لم يُعتمد** بسبب تحديات ظهرت أثناء النقاش. **الاسم الرسمي يبقى OmniRad.** فحص قانوني: كيانان أمريكيان (Omnirad Medical Group · OmniRad RIS) يستخدمان الاسم فعلياً في الأشعة بلا تسجيل USPTO رسمي → **القرار: تسجيل OmniRad محلياً في السعودية فقط (SAIP)**، بلا تسجيل دولي/أمريكي حالياً.

بناءً على ذلك، نُفِّذت مرحلة حماية الملكية الفكرية الداخلية (١·٢·٥) باسم **محمد سعيد الزهراني**:
- `omnirad-redesign/LICENSE` — ملكية خاصة كاملة (All Rights Reserved)
- `omnirad-redesign/docs/IP.md` — إشعار الملكية الفكرية + الوضع القانوني للاسم
- `omnirad-redesign/docs/invention-record.md` — توثيق OSERN + AI Coherence Score (أساس أي نشر علمي/براءة لاحقاً)
- `omnirad-redesign/docs/LICENSE-CONTENT.md` — CC BY-NC للمحتوى + اتفاقية مساهمين (CLA) + شروط استخدام
- `omnirad-redesign/modules/omnirad-nav.js` — فوتر حقوق + تنويه طبي ثنائي اللغة يُحقن تلقائياً في كل صفحة (بصمة `2026-07-19-footer`)

**الملفّات الأربعة + nav.js قُدِّمت للمستخدم للتنزيل — بانتظار رفعها يدوياً لـ GitHub بمساراتها الصحيحة** (LICENSE في الجذر، الثلاثة الباقية في `docs/`، nav.js في `modules/`).

**التالي:**
1. المستخدم يرفع الملفّات الخمسة لـ GitHub.
2. مراجعة تنظيف الكود (طلب سابق معلَّق) بعد اكتمال مرحلة IP.
3. التسجيل الرسمي الخارجي لدى SAIP (خارج نطاق Claude) — يتطلّب سجلاً تجارياً.
4. مرحلة ٣ من خطة IP (نشر علمي RSNA) تبقى مؤجّلة حتى تراكم الحالات.
5. ملفّات استكشاف TOMANEX (`TOMANEX Identity Preview.dc.html` وغيرها) تبقى **مرجعاً غير مُطبَّق** — لا تُستخدم في IP أو المنصّة الفعلية.

---

### ✅ منجَز هذه الجلسة (19 يوليو 2026 — حماية IP + استكشاف TOMANEX الملغى)

- استكشاف كامل لاسم/شعار/فلسفة TOMANEX (TO·MAN·EX) — **أُلغي الاعتماد**، الاسم يبقى OmniRad.
- فحص قانوني لاسم OmniRad: خطر متوسّط-مرتفع دولياً (كيانان أمريكيان قائمان)، خطر منخفض محلياً (السعودية) → قرار: تسجيل SAIP محلي فقط.
- كتابة ٤ ملفّات حماية داخلية (LICENSE + IP.md + invention-record.md + LICENSE-CONTENT.md) + تحديث omnirad-nav.js بفوتر حقوق موحّد لكل صفحات المنصّة.
- تحديث `CLAUDE.md` بقرار النطاق المحلّي والحالة الفعلية.

---

### ✅ منجَز جلسة سابقة (16 يوليو 2026 — مراجعة العارض Natural Display)

**السياق العلمي:** صور OmniRad مولّدة بالـAI (PNG 8-bit) بلا وحدات هاونسفيلد/إشارة MR خام. WW/WL والـPresets معرّفة في DICOM PS3.3 (VOI LUT) وتعمل فقط على بيانات مُعايَرة → تطبيقها على PNG كان يُتلف الصورة (washout: نافذة الرئة −600 على دماغ).

**١) عرض طبيعي (atlas.html + viewer.js):** حلقة إعادة تعيين البكسلات حسب WW/WL أُزيلت — الصورة تُرسم كما هي (ألوان/تدرّج طبيعي). المعالجة تُطبَّق فقط عند تغيير Brightness/Contrast أو Invert.

**السياق العلمي:** صور OmniRad مولّدة بالـAI (PNG 8-bit) بلا وحدات هاونسفيلد/إشارة MR خام. WW/WL والـPresets معرّفة في DICOM PS3.3 (VOI LUT) وتعمل فقط على بيانات مُعايَرة → تطبيقها على PNG كان يُتلف الصورة (washout: نافذة الرئة −600 على دماغ).

**١) عرض طبيعي (atlas.html + viewer.js):** حلقة إعادة تعيين البكسلات حسب WW/WL أُزيلت — الصورة تُرسم كما هي (ألوان/تدرّج طبيعي). المعالجة تُطبَّق فقط عند تغيير Brightness/Contrast أو Invert.

**٢) حذف Preset + WW/WL:** أُزيلت القائمة (Custom/Brain/Soft/Abdomen/Lung/Bone/MRI) وخانتا WW/WL من شريط أدوات الأطلس وعارض المقارنة. استُبدلت بـ**Bright / Contrast** (مزلاجان + أداة سحب B/C: أفقي=سطوع · رأسي=تباين · نطاق ±100) — تعديل بصري صحيح على PNG بلا ادّعاء HU.

**٣) مودالتي ديناميكية:** تبويبات الأطلس (`renderModBar`) تُظهر فقط المودالتي التي لها صور فعلية للبنية المختارة (ثابتة `U.modalitiesFor` + معتمدة من المجتمع عبر `OmniRadAtlasDynamic.find`) — لا تبويبات فارغة/معطّلة. تُعاد التبويبات بعد تحميل صور المجتمع. المقارنة كانت ديناميكية أصلاً (قائمة منسدلة لكل لوح) — أُبقيت كما هي.

**📦 النشر:** ارفع ٣ ملفات فقط بمساراتها المطابقة على GitHub:
- `pages/atlas.html`
- `pages/comparison.html`
- `modules/viewer.js` (بصمة كاش `?v=natural-bc` في comparison.html)
حزمة جاهزة: `upload-viewer-natural/`.

**ملاحظة:** عارض السلاسل PACS (`omnirad-series-viewer.js`, Sprint 4f) لا يزال يحوي W/L presets — لم يُمسّ هذه الجلسة (منفصل عن العارض المفرد). يُراجَع لاحقاً إن لزم توحيد السلوك.

---

### ✅ منجَز هذه الجلسة (16 يوليو 2026 — ربط الصفحة الرئيسية)

**١) توحيد النافبار على الرئيسية (اعتُمد الخيار ١):**
- استُبدلت ترويسة `index.html` الخاصّة بـ`<script src="../modules/omnirad-nav.js">` (نفس الصفحات الداخلية) → مصدر واحد للحقيقة، صفر اختلاف بين الرئيسية والداخلية.
- تحميل التبعيات بالترتيب: i18n → supabase → omnirad-avatars → omnirad-search → omnirad-nav.
- اتجاه الصفحة (RTL/LTR) يتزامن تلقائياً مع زر اللغة عبر `OmniRadI18n`.

**٢) ربط الروابط والأزرار (كانت `#`):**
- الترويسة: الأطلس→atlas · المقارنة→comparison · القاموس→dictionary · التعلّم→daily · المساعد الذكي→ai-chat · الأدوات→clinic.
- الأزرار: ابدأ الاستكشاف→atlas · جرّب المقارنة→comparison. بطاقات الميزات الأربع مربوطة بصفحاتها.

**٣) تنسيق الكتلة العربية في الـhero:**
- قواعد `html[dir="rtl"]` خاصّة: إلغاء التتبّع السالب + line-height أوسع (الحروف المتّصلة كانت تُسحَق).
- أسماء المودالتي اللاتينية داخل النصّ العربي مغلّفة بـ`<bdi style="white-space:nowrap">` → تتدفّق بترتيب bidi صحيح دون تفكّك أو كسر في المنتصف.

**📦 النشر:** ارفع `index.html` بنفس المسار على GitHub — الوحدات في `modules/` موجودة أصلاً هناك.

---

### ✅ منجَز هذه الجلسة (تكملة — واجهة Unified Lens)

**واجهة رئيسية جديدة تعكس عمق المنصّة (اعتُمد التصميم بعد ٥ اتجاهات):**
- الفكرة النهائية: **عدسة موحّدة (Unified Lens)** — جسم بشري واحد، تمرير المؤشّر يكشف الداخل (خارج→تشريح)، وأزرار تبدّل المودالتي داخل العدسة (تشريح · X-Ray · MRI · CT). فيزياء تصوير حقيقية لا زخرفة فضائية.
- المسودّة التفاعلية: `omnirad-redesign/OmniRad Landing.dc.html` (تحوي اتجاهات 3a/4a/5a للمرجع).
- **الواجهة النهائية المبنية:** `omnirad-redesign/index.html` — hero عدسة + ٤ بطاقات ميزات (Atlas/Dictionary/RadCompare/Learn) + شريط معايير متحرّك + شريط إحصاء حيّ (`OmniRadAtlasDynamic.stats()`) + footer + تنويه تعليمي. ثنائي اللغة · dark/dim · متجاوب.
- الصور: `assets/body-exterior.png` + `body-anatomy.png` + `body-xray.png` + `body-ct.png` ✅ (كلها مربوطة). `body-mri.png` اختياري لاحقاً.
- **بنية البطل النهائية (اعتُمدت 15 يوليو):** جسمان متلاصقان بلا فاصل على خلفية موحّدة = كيان واحد. يسار 01 تشريح · يمين 02 مودالتي تتبدّل ذاتياً (X-Ray↔CT، بلا صور تشريح في اللوح الأيمن). **عدسة واحدة** تجوب الجسمين تلقائياً + تتبع المؤشّر — لا اعتماد على أزرار.
- **حزمة الرفع:** `upload-landing/` (index.html + assets/) — جاهزة للرفع إلى جذر GitHub + `assets/`.
- خطوط: IBM Plex Sans (EN عناوين وزن ٧٠٠ tracking سالب) · Noto Sans Arabic (AR بلا tracking · line-height أوسع) · IBM Plex Mono (تقني/DICOM).

---

### ✅ منجَز هذه الجلسة (15 Jul 2026)

**١) ربط البحث الموحّد + Term Builder بالصفحات (كان معلّقاً):**
- `omnirad-unified-search.js` — `compose()` رُقّي ليُخرج `body_part_examined` + `series_technique` + `region` + `modality` (صفر انحدار عن Sprint 4d).
- `bulk-upload.html` — بحث موحّد فوق منتقي 4d + تبويب **Term Builder** (post-coordination) يكتب نفس حقول DB. القرار المعتمد: **الخيار ج (هجين)** — 4d مصدر الحقيقة + Term Builder للحالات بلا قالب.
- `studio.html`+`studio-app.js` — بحث سريع في قسم التشريح يملأ region/organ.
- `anatomy-review.html` — بحث TA2/RadLex في نافذة التعديل يملأ EN/AR/RID.
- إصلاح: حذف العدّادات `(N)` من قوائم المنطقة/المودالتي في bulk-upload (قاعدة ⑤ — اسم بلا أرقام).

**٢) توحيد المناطق (Region Alignment) — معيار واحد للمنصّة كلها:**
- المرجع المعتمد: **DICOM CID 4031 + LOINC/RSNA Playbook "Region Imaged" + RadLex + TA2**.
- التسميات القياسية التسع (الـid ثابت — صفر إعادة وسم للبنى):
  Head & Neck · Chest · Cardiovascular System · Abdomen · Pelvis · Spine · Upper Extremity · Lower Extremity · Breast.
- القرارات العلمية: Head&Neck/CNS→**Head & Neck** · Chest/Thorax→**Chest** · Cardiovascular→**Cardiovascular System** · Upper/Lower limb→**Upper/Lower Extremity**.
- الملفات الموحّدة: `anatomy-master.js` · `anatomy-master-v2.js` (+ REGION_CANON runtime guard) · `dicom-body-parts.js` · `anatomy-dict.js` · `presets-acr.js` · `structures.js` · `atlas.html` · `comparison.html`.
- **قاعدة عرض (طبقة حماية):** `anatomy-master-v2.js` فيه `REGION_CANON` يُطبّع أي تسمية قديمة → قياسية وقت العرض (لا اعتماد على نظافة القيمة المخزّنة).

**٣) SQL — ترحيل قاعدة البيانات (⏳ لم يُنفَّذ بعد):**
- `supabase/region-alignment-migration.sql` (repeat-safe · TASK: REGION-ALIGNMENT-MIGRATION) — دالة `_region_canonical()` + تحديث `atlas_images.region` + `review_queue.region` مع نسخة احتياطية `region_legacy` + sanity check + rollback note.

**٤) الحل الجذري لكاش الحافة:**
- بصمة إصدار `?v=loinc-r2` على `anatomy-master.js`+`anatomy-master-v2.js`+`dicom-body-parts.js` في كل ١٨ صفحة → يتجاوز كاش GitHub Pages/Cloudflare العنيد.

**٥) تنظيف:**
- حُذفت النُسخ الشبح المحلية: `sprint2-deploy` · `sprint3-deploy` · `sprint3-fix1-7` · `phase2-package` · `_deliver` · `cleanup-upload` + نسخ الصفحات في جذر المشروع (نسخ قديمة مكرّرة).
- فحص GitHub: المستودع سليم (٩٤ ملفاً) — كل المودلات مستخدمة · `radiology-playbook.js` موجود (٣MB · فوق حدّ عرض الشجرة، ليس مفقوداً) · `data/*.json` اليتيمة محذوفة مسبقاً.

**📦 النشر (خطوتان):**
1. ارفع كامل `modules/` + `pages/` من حزمة `upload-loinc-r2` على GitHub (استبدال كامل — بصمة الإصدار تُجبر التحديث).
2. نفّذ `region-alignment-migration.sql` في Supabase SQL Editor.

---

### 📋 مراجعة المنصّة الكاملة (15 Jul 2026) — ٢٢ صفحة

**✅ دن (مكتملة):** index · auth · atlas · dictionary · comparison · bulk-upload · contribute · review · anatomy-review · admin(+admin.js) · profile · contributors · attribution · contact.

**🚧 تحت الإنشاء (واجهات كاملة · بيانات ثابتة/معلّقة):**
- `studio.html` — تبويب Generate يعمل؛ Presets/Case Builder/Library = «Coming phase 2/3».
- `mnemonics` (70%) · `daily` (75%) · `my-progress` (70%) · `clinic` (65%) — بيانات hard-coded، منفصلة عن DB/الأطلس.
- `ai-chat` (60%) — واجهة كاملة، تنتظر Edge Function `ai-chat`.
- admin › Settings — «Coming follow-up».

**سلسلة رفع الحالات = ✅ كلها دن:** studio → (ChatGPT) → contribute → bulk-upload → review → [approve] atlas+dictionary+comparison / [reject] أرشيف + anatomy-review. **البنية جاهزة للبدء فوراً.**

---

### 🎓 مرحلة مخطّطة — Learning Layer Integration (بعد رفع الحالات)

ربط طبقة Learn/Tools بالأطلس/القاموس/الحالات (قيمتها تنمو مع تراكم المحتوى — لا تُبنى قبله):
- **جدول `mnemonics`** — admin.html فيه modal الإضافة جاهز · ربط `structId`→atlas · حروف→dictionary عبر omnirad-term.
- **جدول `learning_cards` + `srs_state`** — daily يسحب سؤال اليوم من DB · my-progress يقرأ SRS حقيقي (ترقية localStorage→Supabase للمزامنة) · أسئلة تُولَّد من `atlas_images` المعتمدة.
- **جدول `clinical_cases`** — clinic ديناميكي (vignette + ACR + modality + صورة أطلس مرتبطة).
- **Edge Function `ai-chat`** — نطاق أشعة + RAG من القاموس/الأطلس.

**رسالة البداية للمحادثة القادمة (اختر أحدها):**
```
تابع من هنا — تسجيل حقوق الملكية الفكرية (IP): نقاش الخيارات قبل إدراج الحالات
```
```
تابع من هنا — بدء رفع الحالات: اختبار end-to-end لحالة تجريبية عبر السلسلة الكاملة
```
```
تابع من هنا — Learning Layer Integration (mnemonics + learning_cards + clinical_cases + ai-chat)
```
```
تابع من هنا — المرحلة ٥: Responsive Overhaul (Mobile · Tablet · iPad · Desktop)
```

---

## ✅ ما أُنجز في Sprint 4g (14 Jul 2026) — Image Standard Enforcement

**تحدّي جذري:** صور ChatGPT/DALL-E تُنتَج بأبعاد متنوعة (1024×1024 · 1024×1536 · 1536×1024) وتكسر شبكة العرض الموحّدة. الحل على مستويين: **البرومت** (توحيد المخرج) + **العارض** (تطبيع العرض).

**Supabase:**
- `supabase/image-metadata-schema.sql` — 5 أعمدة على `atlas_images` + `review_queue`: `image_width` · `image_height` · `aspect_ratio` · `aspect_class` (square/portrait/landscape/panoramic) · `dimensional_tier` (ok/warn/error) + trigger `_compute_aspect` تلقائي + RPC `atlas_dimensional_stats()` + إعادة بناء `atlas_public_v` بالأعمدة الجديدة

**Frontend Modules:**
- `omnirad-redesign/modules/omnirad-image-standard.js` — API موحّد `window.OmniRadImageStd`: `STANDARD` (1024×1024 preferred, 512-4096 range, 4MB max) · `validateFile()` async · `validateDimensions()` · `aspectClass()` · `recommendedSize(modality)` · `promptSpecBlock(lang)` (bilingual IMAGE SPECIFICATIONS) · `attachViewerNormalization(img)` · `renderDimensionsBadge()` + auto-inject CSS يوحّد كل `<img>` في `.card-img · .asc-thumb · .series-thumb · .tile · .atlas-tile · [data-omr-medical]` مع `object-fit:contain` + `background:#000` (letter/pillar-box)
- `omnirad-redesign/modules/omnirad-series-viewer.js` — stage محدَّث: `display:grid; place-items:center` على wrap + `object-fit:contain` صريح + `background:#000` + flex column layout بديل من absolute-positioned (حل جذري لتعطّل الأزرار)

**Frontend Pages:**
- `pages/studio.html` — يُلحق `promptSpecBlock(lang)` تلقائياً بكل مخرج Generate (bilingual bilingual صريح ثنائي اللغة: Size 1024×1024 · Aspect 1:1 · PNG · Black BG · Centered · No borders/annotations · Grayscale realistic per modality)
- `pages/bulk-upload.html` — `handleFiles` async مع `OmniRadImageStd.validateFile()` — يرفض <512px أو >4096px أو panoramic · يحذّر non-square · يعرض `renderDimensionsBadge()` على كل tile · tile img أصبح `object-fit:contain` على `#000` بدل `cover`
- `pages/atlas.html` + `comparison.html` + `review.html` + `anatomy-review.html` — يحمّلون module موحّد (تُطبَّق CSS auto-inject على كل صور المنصّة)

**المعايير المعتمَدة:**
- DICOM PS3.3 §C.7.6.1 (Image Pixel Module)
- DICOM PS3.14 GSDF (Grayscale Standard Display)
- NEMA DICOM CS 4030 (Radiographic Image Storage)
- IHE Radiology BIR (Basic Image Review display requirements)
- ChatGPT Image Gen July 2026 defaults (1024×1024)
- RSNA teaching-file dimensional norms
- WCAG 2.2 AA (visual normalization consistency)

---

## ✅ ما أُنجز في Sprint 4f (14 Jul 2026) — Atlas Series Viewer

**Supabase:** `atlas-series-suggestions.sql` — view `atlas_series_public_v` + RPC `atlas_series_lookup` (id-type auto-detect) + RPC `atlas_related_series` (scoring: LOINC 100 / BPE+mod 60 / mod+plane 40 / mod 20)

**Frontend:** `omnirad-series-viewer.js` توسيع (`openAtlas()` — PACS mode مع Position indicator رأسي + FPS slider 5-15 + Zoom 1-4x + Pan + Invert + W/L presets 7 + Overlay 3-level + Landmark panel + Related footer + URL params + localStorage + Cinematic scroll + Snapshot + Fullscreen API + Keyboard 1-9) · `omnirad-atlas-series.js` orchestrator · `atlas.html` integration + deep-link `?series_id=&slice=` + Series section في info panel

---

**التالي:** **المرحلة ٤ — Annotations & Export الكاملة** (اختياري) أو **المرحلة ٥ — Responsive Overhaul**

**رسالة البداية للمحادثة القادمة (اختر أحدها):**
```
تابع من هنا — المرحلة ٤: Annotations & Export (Sprint 5.1 → 5.5)
```
```
تابع من هنا — المرحلة ٥: Responsive Overhaul (Mobile · Tablet · iPad · Desktop)
```
```
تابع من هنا — Cleanup نهاية المرحلة ٣ (قاعدة معتمدة: مراجعة تنظيف قبل بدء المؤجَّلات)
```

---

## ✅ ما أُنجز في Sprint 4f (14 Jul 2026) — Atlas Series Viewer

**Supabase (SQL):**
- `supabase/atlas-series-suggestions.sql` — view `atlas_series_public_v` (aggregate per approved series + uploader/reviewer names + coherence + confidence) · RPC `atlas_series_lookup(uuid)` (id-type auto-detect) · RPC `atlas_related_series(loinc, bpe, modality, plane, exclude, limit)` — scoring: 100 same LOINC / 60 same BPE+modality / 40 same modality+plane / 20 same modality

**Frontend Modules:**
- `omnirad-redesign/modules/omnirad-series-viewer.js` — **توسيع** (لا استبدال): إضافة `openAtlas()` mode PACS-like مع Position indicator رأسي (superior→inferior + percentage + label) · FPS slider (5-15) · Zoom (1-4x) + Pan (drag when zoomed) · Invert (I key) · W/L presets (Brain 80/40 · Lung 1500/-600 · Bone 2000/400 · Soft 400/60 · Abdomen · Mediastinum) · Overlay 3-level toggle (H key) · Landmark panel (structures + omnirad-term tooltips) · Related series footer · URL params (`?series_id=&slice=`) + localStorage persistence · Cinematic scroll (wheel=slice · Shift+wheel=jump5 · Ctrl+wheel=zoom) · Snapshot export (canvas + burned overlay) · Native Fullscreen API (F key) · Keyboard 1-9 jump-to · Cornerstone.js conventions (Arrow/Wheel/R/I/L/H/Space/Esc)
- `omnirad-redesign/modules/omnirad-atlas-series.js` — orchestrator: `list()` / `load()` / `related()` / `openViewer()` / `renderCard()` / `attachClickHandlers()` / `handleUrl()` مع cache 60s + fallback bucket (omnirad-images → atlas)

**Frontend Pages:**
- `omnirad-redesign/pages/atlas.html` — تكامل: script includes + Series section في info panel + init script يستدعي `handleUrl()` عند التحميل + populates series list scoped بـURL params (organ/modality/plane) + click handlers

**المعايير المعتمَدة:**
- DICOM PS3.14 GSDF · PS3.3 §C.7.3 Series IE · PS3.4 §C
- IHE Radiology — Basic Image Review (BIR) Profile
- Cornerstone.js UX conventions (industry-standard PACS keyboard/mouse)
- WCAG 2.2 AA (Focus rings + aria-live + text alternatives)
- OsiriX overlay 3-level toggle convention
- ACR CT W/L presets (Brain/Lung/Bone/Soft/Abdomen/Mediastinum)

---

## ✅ ما أُنجز في Sprint 4e (14 Jul 2026) — Series Review Workbench

**Supabase:** `supabase/series-review-schema.sql` (v2 مع max(uuid) fix) — أعمدة `reviewer_confidence` · `teaching_pearl` · `common_pitfall` · `key_slice_index` · `coherence_score` · `coherence_details JSONB` على `atlas_images` + `review_queue` + view `series_review_v` + RPC `batch_approve_series` (skip-invalid + JSON summary + notification موحّد) + RPC `update_series_metadata`

**Frontend Modules:**
- `modules/omnirad-coherence.js` — AI Coherence Scorer 4 طبقات (Modality 35% + Plane 25% + Sequence 20% + Anatomy 20%) · client-side · badge tier green/yellow/red · outliers detection
- `modules/omnirad-anatomy-ribbon.js` — Ribbon ملوّن حسب DICOM CID 4031 groups (9 ألوان WCAG-tuned) · text labels لكل خلية · legend · click to jump
- `modules/omnirad-series-viewer.js` (Sprint 4e version) — 3-up comparative modal viewer

**Frontend Pages:**
- `pages/review.html` — refactor كامل: Grouped/Flat toggle (localStorage) · Series cards عريضة (grid-column span 3) · Sticky series headers · Batch approve (skip-invalid + summary toast) · Reject series · Confidence slider stars 1-5 (conditional prompt when <4) · Educational metadata inline (teaching_pearl + common_pitfall + key_slice_index) · Cine hover-autoplay (800ms delay + 3fps + scroll-into-view) · 3-up viewer trigger · Anatomy Ribbon render · Coherence badge · LOINC badge · Empty states منفصلة (series / individual)

---

## ✅ ما أُنجز في Sprint 4d (14 Jul 2026) — Standardized Naming System

**بيانات مرجعية عالمية:**
- `supabase/naming-standards-schema.sql` — 5 أعمدة على `atlas_images` + `review_queue`: `loinc_code` · `radlex_playbook_id` · `body_part_examined` · `series_technique` · `naming_tier` (standard/partial/custom) + indexes + check constraint + view `atlas_by_loinc_v` + تحديث RPCs بمنطق ذكي
- `modules/data/radiology-playbook.js` — **7,089 كود LOINC** شعاعي ACTIVE (3 MB) · 12 modality · 17 region · 1,004 RPID
- `modules/data/dicom-body-parts.js` — DICOM CID 4031 (124 body part عبر 9 مجموعات) ثنائي اللغة + SNOMED codes
- `modules/data/radiology-arabic.js` — قاموس + composer عربي ذكي مع `attachLam()` نحوي
- `modules/data/radiology-consumer-names.js` — placeholder (احتياطي)
- `modules/omnirad-naming.js` — API موحّد `window.OmniRadNaming`: `ready() / modalities() / regions() / bodyPartGroups() / search / resolve / compose / autoSuggest / qualityTier / renderBadge` + CSS 3 مستويات
- `pages/bulk-upload.html` — قسم Standardized Naming: Region + Modality + Series template search + Live badge + Auto-fill + Sync legacy fields
- **Propagation:** atlas.html + comparison.html + admin.html + review.html كلها تحمّل modules الـnaming

---

## ✅ ما أُنجز في Sprint 4a + 4b + 4c (12-14 Jul 2026)

- `supabase/series-mode-schema.sql` + `series-mode-rpc.sql` + `approve-bulk-overload-fix.sql`
- `bulk-upload.html` — Series/Individual toggle + SortableJS + slice badges 01/10 + Series name + crypto.randomUUID
- `review.html` — MRI sequence hidden on non-MRI + String(id) casts

---

## ✅ Sprint 1 + 2 + 3 من المرحلة ٣

- **Sprint 1:** Feature Flags SSoT + Studio cleanup
- **Sprint 2:** Atlas ديناميكي + Community badge + growth counter
- **Sprint 3:** Anatomy Queue + 3-Layer Quality + BioPortal RadLex

---

## 🚀 المرحلة ٤ — Annotations & Export الكاملة (مؤجَّلة)

- Annotations متقدّمة: سهم · دائرة · قياس مسافة · نص · ROI
- Save comparison as Educational Case
- PDF report كامل + QR + share link
- `saved_comparisons` table
- Voice-to-Approve (Web Speech API)
- Peer Review Trigger (Confidence <3)
- Series Completeness Wizard

## 🚀 المرحلة ٥ — Responsive Overhaul (مؤجَّلة)

- Mobile · Tablet · iPad · Desktop
- Comparison على الجوّال Carousel + swipe
- Atlas Series Viewer touch gestures (pinch zoom)

---

## 📋 خطوات النشر ليدوية للمستخدم (Sprint 4f)

1. **Supabase SQL Editor** → نفّذ `atlas-series-suggestions.sql` كاملاً → تحقّق `✔ TASK: ATLAS-SERIES-SUGGESTIONS — completed` + 3 sanity checks
2. **GitHub:** ارفع بالمسارات المطابقة:
   - `supabase/atlas-series-suggestions.sql`
   - `modules/omnirad-series-viewer.js` (v2 — atlas mode مضاف)
   - `modules/omnirad-atlas-series.js` (جديد)
   - `pages/atlas.html` (integration مضاف)
3. **Hard refresh** (Ctrl+Shift+R) على `atlas.html`
4. **اختبار:**
   - يظهر قسم «📚 Series» في info panel
   - Click على series card → يفتح PACS viewer
   - Keyboard: ↑↓ · +/- · R · I · L · H · Space · F · Esc · 1-9
   - Wheel = slice · Shift+wheel = jump 5 · Ctrl+wheel = zoom
   - Deep-link: `atlas.html?series_id=<uuid>&slice=3` يفتح viewer مباشرة
   - Related series تظهر أسفل الـviewer
   - Snapshot ⎙ يصدّر PNG مع burned overlay

---

## 📖 المميزات الكاملة للمنصّة (توثيق نهاية المرحلة ٣)

### 🌟 ١٤ ميزة تجعل OmniRad فريدة عالمياً

**١) قاموس تشريحي إشعاعي ثنائي اللغة موثّق (v2)**
- 129 بنية · RadLex IDs · TA2 · Community flagging · 3-Layer Quality

**٢) OmniRad Standardized Educational Radiology Naming (OSERN)** ⭐
- 7,089 LOINC + 1,004 RPID + 124 DICOM CID + composer عربي
- 3 مستويات جودة (standard/partial/custom)
- **Publishable innovation — RSNA-worthy**

**٣) Series Mode كامل**
- UUID + slice_index + drag reorder + SortableJS + validation

**٤) Atlas ديناميكي**
- View-driven · Community badge · Growth counter · Deep-linking · Smart empty-state

**٥) Series Review Workbench** ⭐
- Grouped/Flat toggle · Sticky headers · Batch approve · Confidence stars · Educational metadata · Cine hover · **AI Coherence Score** · **Anatomy Ribbon** · **3-up Viewer**

**٦) Atlas Series Viewer (PACS-like)** ⭐ **جديد Sprint 4f**
- Position indicator رأسي · FPS slider · Zoom+Pan · Invert · W/L presets · Overlay 3-level · Landmark panel · Related series · URL params · Snapshot · Fullscreen · Cornerstone.js keyboard

**٧) Medical Prompt Studio**
- 3 tabs · EN+AR+Negative · ChatGPT bridge

**٨) Contributor System**
- Contribute Hub · Bulk Upload (4-step) · Leaderboard · Badges

**٩) Global Search Ctrl+K**
- Bilingual · pages · anatomy · LOINC · terms

**١٠) Feature Flags SSoT**
- Object.freeze · Retirement docs

**١١) DICOM-inspired UX**
- Padded numbering · IBM Plex Mono · Series/Individual toggle · PACS overlays

**١٢) Trust & Safety**
- Educational-only banners · Soft-delete + 30-day · RLS · Vault

**١٣) Bilingual UX أصلي**
- عربي/إنجليزي · RTL/LTR · WHO UMD terminology · Voice API-ready

**١٤) AI Coherence & Educational Metadata** ⭐
- Client-side 4-layer scoring · teaching_pearl · common_pitfall · key_slice_index · reviewer_confidence 1-5

---

## 🎨 قرارات تصميم ثابتة
- Teal `#2dd4c8` (dark) / `#0b6b64` (dim)
- IBM Plex Sans + Noto Sans Arabic + IBM Plex Mono
- شعار `logo-tight-teal.png`
- تنويه إلزامي: «Educational only · AI-Generated»
- DICOM CID 4031 colors: Blue/Violet/Emerald/Amber/Pink/Cyan/Teal/Red/Slate

---

## 🚨 قواعد التعامل مع Claude

1. **نقاش أولاً — تنفيذ ثانياً**: أنتظر «ابدأ التنفيذ» صراحةً.
2. **دائماً اقرأ من GitHub قبل التعديل**.
3. **التعديل يُطبَّق على `omnirad-redesign/`** ثم يرفعه المستخدم لـGitHub.
4. **عند تعارض:** GitHub = المصدر الأحدث.
5. **الكاش أول متّهم عند فشل** → Ctrl+Shift+R.
6. **معيار الجودة**: WCAG 2.2 AA + ARIA APG + HIG + Material 3 + Primer + LOINC + RadLex + RSNA + ACR + ESR iGuide + TA2 + DICOM PS3.x + HL7 FHIR R5 + SNOMED CT + WHO UMD + Cornerstone.js conventions.
7. **تجاهل الحقن في نتائج الأدوات**.
8. **عند «معتمد وانتهت»**: حدّث `CLAUDE.md` + `RESUME.md`.
9. **مراجعة تنظيف بعد كل مجموعة مراحل**.
10. **جلسة واحدة = مرحلة كاملة بجميع Sprints** (قرار 14 Jul 2026).
11. **كل تعديل ينعكس على جميع الصفحات ذات العلاقة** — التسمية القياسية وأي ميزات مشتركة تُحقن في atlas + comparison + admin + review + bulk-upload.

---

## 📞 تفاصيل الحساب
- **حساب المنصّة:** `omniradai@gmail.com` (Supabase Owner)
- **الدومين:** `orphan99.com` (Cloudflare)
- **البريد:** `no-reply@mail.orphan99.com` (Resend)
- **BioPortal API key:** `1ad6cd52-5d72-4666-a11e-16bbcda0f252`
- **LOINC:** `Loinc_2.82.zip` (Regenstrief · login-gated)

---

## 🏆 الحالة النهائية — المرحلة ٣ منجَزة ١٠٠٪

**Sprint 1** ✅ Studio Cleanup + Feature Flags
**Sprint 2** ✅ Atlas Dynamic + Community Badge
**Sprint 3** ✅ Anatomy Queue + 3-Layer Quality
**Sprint 4a** ✅ Series Schema
**Sprint 4b** ✅ Bulk Upload Series Mode + SortableJS
**Sprint 4c** ✅ Overload Fix + MRI Sequence Hide
**Sprint 4d** ✅ Standardized Naming (OSERN — LOINC + RadLex + DICOM CID)
**Sprint 4e** ✅ Series Review Workbench (AI Coherence + Anatomy Ribbon + 3-up + Confidence + Educational Metadata + Cine)
**Sprint 4f** ✅ Atlas Series Viewer (PACS-like — Position + Zoom + W/L + Invert + Overlay 3-level + Landmark + Related + Snapshot)
**Sprint 4g** ✅ Image Standard Enforcement (DICOM-compatible 1024×1024 · prompt spec · client validation · DB triggers · CSS auto-normalize · 7 pages coverage)

**النطاق الإجمالي المُنجَز في المرحلة ٣:**
- **٣٦ ملف جديد** (SQL + JS modules + HTML pages)
- **~15,000 سطر كود**
- **معايير عالمية معتمَدة:** DICOM PS3.x · LOINC 2.82 · RadLex Playbook · SNOMED CT · WCAG 2.2 · IHE BIR · Cornerstone.js · WHO UMD · TA2 · RSNA · ACR · ESR iGuide
- **٧ Publishable innovations** — RSNA-worthy paper candidates

**التالي:** مراجعة تنظيف نهاية المرحلة، ثم المرحلة ٤ أو ٥ حسب اختيار المالك.


═══════════════════════════════════════════════════════════════
## ✅ منجَز (19-20 يوليو 2026) — Series Mode + AI Vision Check في Prompt Studio/Bulk Upload
═══════════════════════════════════════════════════════════════

**الحالة: مُنفَّذة ومنشورة بالكامل.** Edge Function `vision-check` منشورة فعلياً على مشروع Supabase (`lmbdtktjeggischpqnkw`) وتستدعي Gemini 2.0 Flash عبر مفتاح Vault (لا يظهر بالفرونت). ملفات SQL + الصفحات المعدَّلة رُفعت لـGitHub.

**الملفات:**
- `modules/data/series-slices.js` — 13 عضواً بمستويات مُعرَّفة (Netter/ACR)
- `supabase/series-vision-schema.sql` — أعمدة `slice_level_en/ar` + `vision_match/confidence/reason/checked_at` على `review_queue`+`atlas_images` + RPC `record_vision_check` (إضافي — لا يمسّ `submit_bulk_upload`)
- `supabase/functions/vision-check/index.ts` — **منشورة** ✅ (Deploy ناجح، تحذير Docker لم يمنع النشر)
- `pages/studio.html` + `studio-app.js` — خانة "توليد كسلسلة" تبني برومبت واحد لـN صورة منفصلة
- `pages/bulk-upload.html` — منتقي سلسلة جاهزة → خانات مُرقَّمة وموسومة → AI Vision Check تلقائي عند الرفع → نتيجة ✅/⚠️+سبب تُعرَض فوراً وتُحفظ كإنذار مبكّر (القرار النهائي بشري دائماً عبر Review Queue)

**تبقّى:**
- ✅ **اختبار E2E نُفِّذ بنجاح (20 يوليو 2026)** — سلسلة كبد (4 شرائح) من Bulk Upload → Vision Check → batch approve → عرض بالعارض الكامل في atlas. أُصلحت 3 أخطاء جذرية: تعارض overload SQL (`reject-to-archive-overload-fix.sql`)؛ فقدان series_id صامت من `phase2-bulk-upload.sql` القديم (الحل النهائي `supabase/series-pipeline-final-fix.sql` — آخر ملف يُشغَّل يمسّ `submit_bulk_upload`+`approve_bulk_upload_item`)؛ العارض `omnirad-series-viewer.js` (فوتر 56px + احتواء flex/object-fit + ملء شاشة CSS-class + fit عند الفتح + resize repaint).
- ✅ **معيار السلايس + اقتراح البنى التلقائي (معتمد مبدئياً)** — `series-slices.js` v2 مع `structures[]` لكل مستوى (مرجع `docs/series-anatomy-reference.md`، TA2/RadLex/ACR). Bulk Upload يقترح البنى تلقائياً + زر «➕ إضافة مستوى». بصمة `?v=series-v2`.
- ✅ **مراجعة ترابط منطق البرومبت (20 يوليو 2026، `studio-app.js?v=logic-coherence`)** — "No labels" يخفي/يتجاهل Callouts+LabelLang+Segmentation؛ Series ينقل تقنية المودالتي + إشعار بما يفرضه + اقتراح السماكة؛ تصفير pathCase عند Normal؛ صياغة section/projection/micrograph؛ تحذيرات ليّنة (نافذة CT×العضو، السماكة)؛ `syncFieldVisibility()` يخفي الحقول المتعارضة.
- ✅ **جانبية ذكية + ماركر اتجاه R/L (20 يوليو 2026، `?v=orient-rl`)** — الجانبية تُقيَّد حسب نوع العضو (`lateralityClass`: مزدوج→R/L/Bilateral، مركزي→N/A/Midline). العارض يرسم ماركرات R/L/A/P/S/I على الحواف حسب المستوى (ثابتة بلا زوم) + زر «R/L» + مفتاح O. المولّد ممنوع من كتابة الماركر.
- ✅ **كتلة IMAGE SPECIFICATIONS ديناميكية (20 يوليو 2026، `omnirad-image-standard.js?v=spec-dynamic`)** — `promptSpecBlock(lang,{labeled,series})` يقرأ `window.OmniRadStudioState`: مع الوسم → خلفية تعليمية فاتحة + تسميات مسموحة + بلا R/L؛ بلا وسم/سلسلة → صارم أسود نقي DICOM. السلسلة تتجاوز الوسم دائماً. حُلّ تناقض «تسميات ثنائية اللغة + no labels/pure black» (تحقّق بـ7 اختبارات).
- **مراجعة طبيب أشعة** للمستويات/البنى وإضافة مستويات جديدة (البنية جاهزة).
- عرض شارة Vision Check داخل `review.html` (مؤجَّل).
- إثراء ~40 عضواً إضافياً بمستويات `slices`.
- (اختياري) توسيع `vision-check` ليُرجع structures[] تلقائياً من الصورة (هجين).

**رسالة البداية للمحادثة القادمة:**
```
تابع من هنا — اختبار end-to-end: Series Mode + AI Vision Check (حالة تجريبية كاملة)
```

---

## ميزة مخطَّطة سابقاً (19 يوليو 2026) — الوصف الأصلي (مرجع)
═══════════════════════════════════════════════════════════════

**الهدف:** توليد ورفع سلسلة صور (مستويات تشريحية متعدّدة لعضو واحد) بدقّة وأمان، بلا اعتماد على اسم الملف أو ذاكرة المستخدم غير المختص.

**١) خانة "Series" في Prompt Studio:**
- Toggle بجانب اختيار العضو. عند التفعيل: تُبنى قائمة مستويات (`slices`) المعرَّفة مسبقاً للعضو، وتُصاغ **برومبت واحد** يطلب من ChatGPT توليد كل المستويات كصور منفصلة في نفس الردّ (مُختبَر وناجح فعلياً — 4 صور كبد CT منفصلة دقيقة تشريحياً: dome→porta hepatis→coeliac axis→portal vein، بلا Collage).
- صيغة البرومبت القياسية: "Generate N separate individual images (not a collage)... [قائمة المستويات]... 1024×1024, black background, no text/labels, output all N as separate images in order."
- **الأعضاء الجاهزة الآن (13، `slices` معرَّفة):** الدماغ · الفقرات العنقية (C1-C7) · الرئتان · القلب · الثدي · الكبد · البنكرياس · الكليتان · عظام الحوض · الفقرات القطنية (L1-L5) · العضد · الفخذ · الركبة.
- **الباقي (~40 عضواً):** يحتاج إثراء مستويات لاحقاً من مرجع تشريحي حقيقي (Netter/Grainger/ACR Practice Parameters) — **ليس** من LOINC (LOINC يحدّد تصنيف الفحص لا مستويات القطع الداخلية).
- قيم سماكة المقطع (وصفية في البرومبت لا قياس DICOM حقيقي، لأنّ صورنا AI-generated بلا بيانات خام): مرجعها ACR Practice Parameters (مثال: دماغ CT 5mm روتيني/1mm سكتة، رئة HRCT 1-1.25mm، كبد/بطن 3-5mm، عمود فقري 2-3mm، مفاصل 1-2mm).

**٢) واجهة Bulk Upload بخانات مرتّبة (لا رفع حرّ):**
- عند اختيار Series، تُعرَض N خانة مُرقَّمة وموسومة مسبقاً بمستواها (مثال: "2/4 — Porta hepatis").
- المستخدم يسحب كل صورة للخانة المطابقة بترتيب توليدها/حفظها من ChatGPT (لا يعتمد على اسم الملف إطلاقاً — أسماء ChatGPT العشوائية لا تُقرأ من النظام).
- `order_index` يُشتقّ من موضع الخانة لا من الملف.
- معاينة بصرية للأربع صور مرتّبة قبل الإرسال لطابور المراجعة.

**٣) 🆕 فحص AI Vision تلقائي (معتمَد 19 يوليو 2026):**
- بعد الرفع لكل خانة، تُفحص الصورة آلياً مقابل وصف مستواها المُعلَن (مثال: مطابقة "Coeliac axis liver CT axial؟").
- نتيجة الفحص: ✅ تطابق / ⚠️ اشتباه + سبب — تُعرَض للمراجع البشري **كإنذار مبكّر فقط**، لا حَكَم نهائي. الاعتماد النهائي يبقى بشرياً دائماً عبر Review Queue.
- الموضع في السلسلة: رفع→فحص AI تلقائي→Review Queue (بشري)→اعتماد.

**التالي:** تنفيذ برمجي كامل في محادثة مستقلة (Prompt Studio + Bulk Upload + دالة فحص AI). رسالة البدء:
```
تابع من هنا — تنفيذ خانة Series + AI Vision Check في Prompt Studio/Bulk Upload
```
