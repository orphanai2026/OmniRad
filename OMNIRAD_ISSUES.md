# 🐛 OMNIRAD_ISSUES — Issues & Deferred Tasks Log
**OmniRad — Multimodal Radiologic Anatomy Platform**

*Last updated: 2026-07-04 — ✅ Issues #45 & #52 Resolved · v4.9*

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
| 32 | Theme systems مختلفة بين الصفحات (`--bg-base` vs `--bg`) — يحتاج توحيد بـ theme.css مشترك. **تحديث 2026-06-30:** تأكدنا فعلياً — theme.css يستخدم `--accent/--text-secondary/--bg-overlay`، index.html/comparison.html يستخدمان `--acc/--text-s/--bg-ov` لنفس أسماء الكلاسات (nav-links/nav-logo). دمج آمن يحتاج مراجعة بصرية صفحة بصفحة. | Task #16 audit | Future | 🟡 | 🔴 Open | — |
| 33 | Theme toggle ناقص في 7 صفحات (atlas, daily, srs, mnemonics, ai-chat, auth, my-progress) | Task #16 audit | Future | 🟢 | 🔴 Open | — |
| 34 | comparison.html: أزرار modality filters (CT+MRI, CT+US, All, Clear) بلا onclick — تحتاج ربط وظيفي | Task #16 audit | Future | 🟡 | ✅ Resolved | 2026-06-28 |
| 35 | atlas.html: أزرار TTS / Pronounce / Overview / Images / Imaging Guide بلا onclick — تحتاج تحقق وظيفي | Task #16 audit | Future | 🟡 | ✅ Resolved | 2026-06-28 |
| 36 | 5 صفحات اختبار (survey.html · survey-phase2.html · distribution-guide.html · distribution-guide-phase2.html · results-phase2.html) كانت يتيمة في pages/ بلا أي رابط وارد من index.html أو nav | Repo Cleanup | Repo Cleanup | 🟢 | ✅ Resolved — نُقلت إلى archive/ | 2026-06-30 |
| 37 | assets/theme.css موجود منذ مدة لكن غير مربوط بأي صفحة (لا `<link>` في أي ملف) — كود ميت حالياً | Repo Cleanup | Future (مع Issue #32) | 🟢 | 🔴 Open | — |
| 38 | mnemonics.html: "Sort by: Newest" تجميلي فقط — لا منطق فرز فعلي (حسب الأحدث/أبجدي) | Task #24 | Future | 🟢 | 💡 Idea | — |
| 39 | mnemonics.html: أيقونة Bookmark/Save غير منفّذة (تحتاج حقل جديد + مزامنة Supabase) — لم تُضف لتفادي وظيفة وهمية | Task #24 | Future | 🟢 | 💡 Idea | — |
| 40 | clinic.html: زر "+ New Case" بلا وظيفة فعلية (شكلي فقط، `title="Coming soon"`) — يحتاج نموذج إنشاء حالة كاملة | Task #25 | Future | 🟢 | 💡 Idea | — |
| 41 | clinic.html: زر "Case Discussion" بلا وظيفة فعلية — يحتاج منتدى/تعليقات لكل حالة | Task #25 | Future | 🟢 | 💡 Idea | — |
| 42 | clinic.html: زر "Save Draft" في step4 بلا وظيفة فعلية (بطلب صريح من المالك) — يحتاج localStorage أو Supabase لتخزين المسودات | Task #25 | Future | 🟢 | 💡 Idea | — |
| 43 | clinic.html: لا يوجد كنتور cyan دقيق حول العضو المستهدف داخل الصورة — لا توجد إحداثيات segmentation للصور الحقيقية المستخدمة (Wikimedia)؛ نفس قيد Issue #8. بديل مؤقت: نقطة تأشير مركزية عامة (زر Label) | Task #25 | Phase 4+ (مع MedSAM2 pipeline) | 🟡 | 🔴 Deferred | — |
| 44 | clinic.html: فجوات متبقية عن المرجع التصميمي — إيموجي ما زالت مستخدمة في عناوين البطاقات (مخالف لطلب "no emoji icons" في المرجع)، "All Cases (12)" مقابل 6 حالات فعلية، Sign Out كرابط nav وليس زراً منفصلاً، لا يوجد سهم dropdown للـ avatar | Task #25 | Future | 🟢 | 🔴 Open | — |
| 45 | atlas.html: روابط صور مكسورة فعلياً (404) لـ8 بنى — gallbladder, pancreas, aorta, ivc, portal-vein, stomach, small-intestine, large-intestine. الكود يشير لمسارات `ct_original.png` لم تُرفع أصلاً. أُصلح في `LOCAL_MEDIA`: gallbladder/pancreas/aorta استبدلت بصورها الحقيقية base64 الموجودة أصلاً في IMG_MAP (لا تكرار مصدر)؛ ivc/portal-vein/stomach/small-intestine/large-intestine استبدلت مؤقتاً بصورة CT عامة حقيقية (`images/home/ct_abdomen.png`) حتى اكتمال Sprint #1 CT بصور فردية حقيقية لكل بنية. | Task #26 (فحص أثناء الترحيل) | Sprint #1 CT | 🔴 | ✅ Resolved (مؤقت) | 2026-07-04 |
| 46 | Supabase: تكرار غير مفسَّر في صفوف `structure_facts` أثناء تنفيذ Task #26 (10 من 17 بنية أُدرجت مرتين بترتيب `sort_order` مختلف) — لا يوجد تفسير مؤكَّد من سجل الأوامر المُنفَّذة؛ اكتُشف وأُصلح بالتحقق المباشر بعد كل خطوة. يستحق مراقبة إن تكرر النمط في migrations مستقبلية. | Task #26 | — | 🟡 | ✅ Resolved | 2026-07-01 |
| 47 | atlas.html: البنية `bone` (Pelvic Bone) مصنَّفة `category:'urinary'` — خطأ تصنيف واضح في بيانات المصدر. رُحِّل كما هو لقاعدة Supabase (أمانة نقل البيانات دون تصحيح صامت)، يحتاج تصحيحاً في كل من الكود والقاعدة معاً لاحقاً. | Task #26 | Future | 🟢 | 🔴 Open | — |
| 48 | Supabase: `structure_related` له مفتاحان أجنبيان يشيران لنفس جدول `structures` (`structure_id` و`related_structure_id`) — سبَّب فشل استعلام PostgREST المُضمَّن (embed) تلقائياً بسبب الغموض. أُصلح بتحديد اسم القيد صراحةً في الاستعلام (`structure_related!structure_related_structure_id_fkey(...)`). درس للمستقبل: أي جدول بمفتاحين للجدول نفسه يحتاج نفس المعالجة. | Task #26b | — | 🟡 | ✅ Resolved | 2026-07-01 |
| 49 | Supabase: تدقيقي الأمني في Task #26 ألغى صلاحية تنفيذ `is_admin`/`is_reviewer` من دور `anon` (لإغلاق ثغرة استدعاء API مباشر) — لكن هذا كسر بالخطأ كل قراءة عامة غير مسجّلة للمحتوى المنشور، لأن سياسات RLS تستدعي هاتين الدالتين داخلياً. لم يظهر الخلل إلا عند اختبار مباشر بصلاحية `anon` الفعلية على الموقع الحي، وليس بفحص بنية الجداول فقط. أُعيدت الصلاحية. **درس دائم:** أي تدقيق أمني لاحق على RLS يجب أن يتضمّن اختبار وظيفي بـ`set local role anon` صراحة، لا الاكتفاء بفحص الأذونات نظرياً. | Task #26b | — | 🔴 | ✅ Resolved | 2026-07-01 |
| 50 | comparison.html: القائمة المنسدلة لاختيار البنية كانت تعرض 5 خيارات فقط رغم أن كائن `STRUCTURES` بالكود يحتوي 8 — aorta وstomach ومدخل `kidneys` (جمع، مكرر عن `kidney` المفرد) كانت معرَّفة في JS لكن بلا وسم `<option>` مقابل، فغير قابلة للوصول من الواجهة إلا برابط مباشر (`?structure=aorta`). اكتُشف بالمصادفة أثناء ربط الصفحة بـSupabase، واختفى تلقائياً بالتبديل لمصدر البيانات الجديد (القائمة تُبنى الآن ديناميكياً من الـ17 بنية كاملة). | Task #26b (اكتشاف عرضي) | — | 🟢 | ✅ Resolved | 2026-07-01 |
| 51 | atlas.html: بنية `spleen` — نفس عائلة خلل Issue #45. مدخل modality "CT" في `LOCAL_MEDIA` يشير لمسار `../images/structures/spleen/ct_original.png` غير موجود أصلاً (لم يُرفع CT لهذا العضو — فقط MRI حقيقي متوفر حسب Task #13.5). خارج نطاق محادثة Issue #45 الحالية (Rule #8)، يحتاج إصلاحاً مماثلاً. | Task #45 fix (اكتشاف عرضي) | Sprint #1 CT | 🟡 | 🔴 Open | — |
| 52 | Supabase: `loadStructuresData failed: JWT expired` + خطأ 401 على مشروع omnirad. **السبب الجذري الحقيقي (تحقَّق منه بفك تشفير JWT برمجياً):** مفتاح anon نفسه سليم تماماً (صالح حتى 2036) — المشكلة أن `sbFetch` في `modules/supabase.js` كانت تُرفق `Authorization: Bearer <توكن جلسة قديم>` من `localStorage` مع كل طلب، بما فيها قراءات anon العامة؛ إذا كان توكن الجلسة منتهياً يرفضه Supabase بـ"JWT expired" بغض النظر عن سلامة مفتاح anon. **الإصلاح:** عند رصد هذا الخطأ تحديداً (401 + "jwt expired") تُحذف التوكن القديم تلقائياً من `localStorage` وتُعاد المحاولة كزائر (anon) فوراً دون تدخل المستخدم. | ملاحظة مباشرة من المالك (DevTools) | Session/Auth handling | 🔴 | ✅ Resolved | 2026-07-04 |

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
| 23 | Atlas Page Redesign — Welcome Screen | 2026-06-29 | Mohammed Saeed Alzahrani | Hero + real images base64 + cards + modality + tools |
| 21 | Home Page Redesign — real medical images | 2026-06-29 | Mohammed Saeed Alzahrani | 8 صور طبية حقيقية · split hero · modality cards |
| 22 | Auth Page Redesign — split-screen professional | 2026-06-29 | Mohammed Saeed Alzahrani | skeleton bg 40% · OR logo · field icons · كل الأكواد محفوظة |
| — | Repository Cleanup (Path B) | 2026-06-30 | Mohammed Saeed Alzahrani | Headers لـ17 ملف · 5 صفحات اختبار → archive/ · nav/CSS unification مؤجل (Issue #32) |
| 24 | Mnemonics Page Redesign | 2026-06-30 | Mohammed Saeed Alzahrani | Brain hero illustration · stats row · real CT/MRI thumbnails (liver/kidneys/spleen) · هيدر محفوظ 100% (تحقق diff) · str_replace patches فقط |
| 25 | Clinic Page Redesign | 2026-06-30 | Mohammed Saeed Alzahrani | Sidebar+Main layout دائم · إصلاح bug الكانفاس الفارغ (Step 3) · Toolbar أيقونات SVG · Look For + Clinical Hint (مُشتقّان من بيانات موجودة) · Reporting Guide + Case Context + Common Mistakes (Step 4) · 3 أزرار شكلية بلا وظيفة (بموافقة) · str_replace patches فقط |
| 26 | Content Database Migration | 2026-07-01 | Mohammed Saeed Alzahrani | 6 جداول Supabase جديدة (structures + contributor workflow) · RLS + تدقيق أمني/أدائي كامل · إصلاح خلل avatar المفقود من user_preferences (Task #19) · ترحيل 17 بنية من atlas.html (34 وصف · 85 حقيقة · 32 mnemonic · 13 صورة حقيقية) · الصور تبقى GitHub raw حتى بعد الإطلاق · atlas.html/comparison.html لم تُربطا بالقاعدة بعد (منفصل) · اكتُشفت Issues #45-47 أثناء العمل |
| 26b | Frontend Wiring (Atlas + Compare → Supabase) | 2026-07-01 | Mohammed Saeed Alzahrani | جدولان إضافيان (structure_imaging_notes · structure_related) · atlas.html تُحمَّل STRUCTS من Supabase async (الصور/TTS تبقى محلية) · comparison.html تُبنى القائمة المنسدلة ديناميكياً من 17 بنية بدل 8 ثابتة · دالتان جديدتان في supabase.js (getStructures · getStructureList) · 3 أخطاء حقيقية اكتُشفت وأُصلحت على الموقع الحي (Issues #48-50) · كل إصلاح تحقَّق منه مباشرة على orphanai2026.github.io/OmniRad |
| 45-fix | Issue #45 Fix — atlas.html Broken Structure Images | 2026-07-04 | Mohammed Saeed Alzahrani | LOCAL_MEDIA: gallbladder/pancreas/aorta استبدلت بصورها الحقيقية base64 الموجودة أصلاً بالملف (بدون تكرار مصدر) · ivc/portal-vein/stomach/small-intestine/large-intestine استبدلت مؤقتاً بصورة CT عامة حقيقية (images/home/ct_abdomen.png) حتى Sprint #1 CT · تحقق نحوي JS ناجح (new Function()) · اكتُشف عرضياً خلل مماثل في spleen (Issue #51) وعطل JWT expired حرج في Supabase (Issue #52) لم يُعالَجا هنا (Rule #8) |
| 52-fix | Issue #52 Fix — Supabase JWT Expired / 401 | 2026-07-04 | Mohammed Saeed Alzahrani | جذر السبب: توكن جلسة قديم منتهٍ في localStorage كان يُرفق مع طلبات anon العامة، وليس مفتاح anon نفسه (سليم، تحقُّق عبر فك تشفير JWT وSupabase Management API) · modules/supabase.js: sbFetch أُضيف لها كشف تلقائي لخطأ 401 "JWT expired" + حذف التوكن القديم + إعادة محاولة واحدة كزائر (anon) · تحقق JS نحوي ناجح |

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
