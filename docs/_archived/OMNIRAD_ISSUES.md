# 🐛 OMNIRAD_ISSUES — Issues & Deferred Tasks Log
**OmniRad — Bilingual Radiology Teaching Platform**

*Last updated: 2026-08-21 — Full re-sync with live repo (v6.0): TOMANEX rename reverted, Phase 3 + QA Audit logged, documentation gap (Issue #56) resolved · Security Audit (Issue #55) complete*

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
| 47 | atlas.html: البنية `bone` (Pelvic Bone) كانت مصنَّفة `category:'urinary'` — خطأ تصنيف واضح في بيانات المصدر، رُحِّل كما هو لقاعدة Supabase في Task #26. **الإصلاح:** أُنشئ تصنيف جديد `skeletal` وحُدِّث صف `bone` في جدول `structures` (Supabase) إليه، بموافقة صريحة على تعديل قاعدة الإنتاج. تحقق مباشر بعد التنفيذ (`RETURNING`) يؤكد النجاح. | Task #26 | — | 🟢 | ✅ Resolved | 2026-07-04 |
| 48 | Supabase: `structure_related` له مفتاحان أجنبيان يشيران لنفس جدول `structures` (`structure_id` و`related_structure_id`) — سبَّب فشل استعلام PostgREST المُضمَّن (embed) تلقائياً بسبب الغموض. أُصلح بتحديد اسم القيد صراحةً في الاستعلام (`structure_related!structure_related_structure_id_fkey(...)`). درس للمستقبل: أي جدول بمفتاحين للجدول نفسه يحتاج نفس المعالجة. | Task #26b | — | 🟡 | ✅ Resolved | 2026-07-01 |
| 49 | Supabase: تدقيقي الأمني في Task #26 ألغى صلاحية تنفيذ `is_admin`/`is_reviewer` من دور `anon` (لإغلاق ثغرة استدعاء API مباشر) — لكن هذا كسر بالخطأ كل قراءة عامة غير مسجّلة للمحتوى المنشور، لأن سياسات RLS تستدعي هاتين الدالتين داخلياً. لم يظهر الخلل إلا عند اختبار مباشر بصلاحية `anon` الفعلية على الموقع الحي، وليس بفحص بنية الجداول فقط. أُعيدت الصلاحية. **درس دائم:** أي تدقيق أمني لاحق على RLS يجب أن يتضمّن اختبار وظيفي بـ`set local role anon` صراحة، لا الاكتفاء بفحص الأذونات نظرياً. | Task #26b | — | 🔴 | ✅ Resolved | 2026-07-01 |
| 50 | comparison.html: القائمة المنسدلة لاختيار البنية كانت تعرض 5 خيارات فقط رغم أن كائن `STRUCTURES` بالكود يحتوي 8 — aorta وstomach ومدخل `kidneys` (جمع، مكرر عن `kidney` المفرد) كانت معرَّفة في JS لكن بلا وسم `<option>` مقابل، فغير قابلة للوصول من الواجهة إلا برابط مباشر (`?structure=aorta`). اكتُشف بالمصادفة أثناء ربط الصفحة بـSupabase، واختفى تلقائياً بالتبديل لمصدر البيانات الجديد (القائمة تُبنى الآن ديناميكياً من الـ17 بنية كاملة). | Task #26b (اكتشاف عرضي) | — | 🟢 | ✅ Resolved | 2026-07-01 |
| 51 | atlas.html: بنية `spleen` — نفس عائلة خلل Issue #45. مدخل modality "CT" في `LOCAL_MEDIA` كان يشير لمسار `../images/structures/spleen/ct_original.png` غير موجود (لم يُرفع CT لهذا العضو — فقط MRI حقيقي متوفر حسب Task #13.5). **الإصلاح:** استُبدل بنفس صورة CT العامة الحقيقية المستخدمة في إصلاح Issue #45 (`images/home/ct_abdomen.png`) حتى توفر صورة CT فردية حقيقية في Sprint #1. تحقق نحوي JS ناجح. | Task #45 fix (اكتشاف عرضي) | Sprint #1 CT | 🟡 | ✅ Resolved (مؤقت) | 2026-07-04 |
| 52 | Supabase: `loadStructuresData failed: JWT expired` + خطأ 401 على مشروع omnirad. **السبب الجذري الحقيقي (تحقَّق منه بفك تشفير JWT برمجياً):** مفتاح anon نفسه سليم تماماً (صالح حتى 2036) — المشكلة أن `sbFetch` في `modules/supabase.js` كانت تُرفق `Authorization: Bearer <توكن جلسة قديم>` من `localStorage` مع كل طلب، بما فيها قراءات anon العامة؛ إذا كان توكن الجلسة منتهياً يرفضه Supabase بـ"JWT expired" بغض النظر عن سلامة مفتاح anon. **الإصلاح:** عند رصد هذا الخطأ تحديداً (401 + "jwt expired") تُحذف التوكن القديم تلقائياً من `localStorage` وتُعاد المحاولة كزائر (anon) فوراً دون تدخل المستخدم. | ملاحظة مباشرة من المالك (DevTools) | Session/Auth handling | 🔴 | ✅ Resolved | 2026-07-04 |
| 53 | مراجعة شاملة لتراخيص كل مصادر الصور المستخدمة (TCIA CT-ORG، CHAOS، BTCV/Synapse، Visible Human Project، NCI IDC مستقبلاً) قبل Task #20 (الإطلاق) — التأكد من توافق شروط كل ترخيص مع بعضها ومع نوع الاستخدام (أكاديمي مقابل عام/تجاري لاحقاً)، ومطابقة حقول `license`/`attribution_text`/`source_dataset` المسجّلة فعلياً في جدول `structure_images` مع الشروط الحقيقية لكل مصدر. | نقاش استراتيجي حول BTCV | Task #20 (قبل الإطلاق) | 🟡 | 🔴 Open | — |
| 54 | مصدر بديل/إضافي محتمل: dataset باسم **FLARE 2022** (50 حالة CT، 13 عضو — يشمل Duodenum وEsophagus بالإضافة لأعضاء BTCV) — قد يخدم مرحلة لاحقة (Phase 3/4) أو أعضاء غير مغطاة بـBTCV. لا يحل مشكلة صور الرئة (مرتبط بـIssue #24). لم يُتحقق من رابط/شروط الوصول الفعلية بعد — يحتاج بحث مخصص عند الحاجة الفعلية. | بحث Sprint #1 CT — Abdomen (اكتشاف عرضي أثناء البحث عن مصادر بديلة لـBTCV) | Future (Phase 3/4) | 🟢 | 💡 Idea | — |
| 55a | 🔴 **حرج — تسريب مفاتيح API فعلي:** 4 دوال (`get_fal_key`, `get_gemini_key`, `get_openai_key`, `resend_key`) كانت قابلة للتنفيذ من دور `anon` (زوار غير مسجلين) بدون أي فحص صلاحية داخلي — ترجع المفتاح الخام من `vault.decrypted_secrets` مباشرة عبر `POST /rest/v1/rpc/{function}`. تحقق مباشر (`has_function_privilege`) أكّد الاستغلال قبل الإصلاح. **الإصلاح:** `REVOKE EXECUTE ... FROM anon, authenticated, public` على الأربع دوال + `GRANT` لـ`service_role` فقط، تحقق مباشر بعد التنفيذ يؤكد الإغلاق. **إجراء متبقٍ على المالك:** تدوير (rotate) الأربع مفاتيح فعلياً من لوحات كل خدمة + مراجعة الفواتير الأخيرة، لأن الكشف كان قائماً منذ إنشاء الدوال. | مراجعة أمنية سيبرانية شاملة (طلب المالك) | Session/Auth handling | 🔴 | ✅ Resolved | 2026-08-21 |
| 55b | 🔴 **كشف بيانات auth.users + طابور مراجعة غير معتمد:** (1) View عام `public.leaderboard` كان SECURITY DEFINER يعمل join مباشر مع `auth.users` (بيانات حساسة) وقابل للقراءة من `anon`. **الإصلاح:** أُعيد كتابته ليقرأ من `public.profiles.display_name` بدل `auth.users` + `security_invoker=true`، مع حفظ نفس صلاحيات القراءة العامة (الميزة نفسها لم تتأثر). (2) View `public.series_review_v` (طابور مراجعة الصور غير المعتمدة + بيانات المراجعين) كان مقروءاً من `anon` عبر تجاوز RLS بحكم SECURITY DEFINER. **الإصلاح:** `REVOKE SELECT FROM anon, public`. تحقق مباشر بعد كل إصلاح عبر `get_advisors` (اختفاء `auth_users_exposed` نهائياً) و`has_table_privilege`. | مراجعة أمنية سيبرانية شاملة | Session/Auth handling | 🔴 | ✅ Resolved | 2026-08-21 |
| 55c | 🟡 31 دالة (`is_admin`, `guard_role_change`, `handle_new_auth_user`, وغيرها) بدون `search_path` ثابت — ثغرة حقن schema نظرية. **الإصلاح:** `ALTER FUNCTION ... SET search_path = 'public'` على كل الـ31 (32 بالعد الفعلي بسبب تحميل زائد على `is_admin`). لا تغيير في المنطق، تحقق آلي عبر `get_advisors` يؤكد الاختفاء الكامل. | مراجعة أمنية سيبرانية شاملة | — | 🟡 | ✅ Resolved | 2026-08-21 |
| 55d | 🟢 امتداد `pg_trgm` مثبّت داخل schema العام (`public`) بدل schema مخصص — يخالف أفضل الممارسات (لا خطر فعلي). **الإصلاح:** `ALTER EXTENSION pg_trgm SET SCHEMA extensions`، تحقق مباشر أن الفهارس الأربعة المعتمدة عليه (`anatomical_structures_name_en_trgm` وغيرها) بقيت سليمة بعد النقل. | مراجعة أمنية سيبرانية شاملة | — | 🟢 | ✅ Resolved | 2026-08-21 |
| 55e | 🟢 3 جداول (`anatomy_aliases`, `anatomy_migration_log`, `anatomy_quality_report`) عليها RLS مفعّل بلا أي policy — تُقفل تلقائياً (لا وصول = لا خطر). تحقق: الجداول الثلاثة فارغة (0 صفوف) فعلياً. **لا إجراء مطلوب** — آمنة بطبيعة القفل التلقائي، ذُكرت للتوثيق فقط. | مراجعة أمنية سيبرانية شاملة | — | 🟢 | ✅ محقَّق — لا خطر | 2026-08-21 |
| 55f | 🟢 "Leaked Password Protection" (فحص كلمات المرور المخترقة عبر HaveIBeenPwned) غير مفعّلة في إعدادات Auth. هذا إعداد Dashboard/Auth config وليس كائن قاعدة بيانات، فلا يمكن تفعيله عبر SQL. | مراجعة أمنية سيبرانية شاملة | Future — إجراء يدوي | 🟢 | 🔴 Open — يحتاج تفعيل يدوي | — |
| 55g | 🟢 72 دالة SECURITY DEFINER إضافية قابلة للتنفيذ من `anon`/`authenticated` لم تُفحص فردياً بالكامل — فُحصت 3 عينات (`admin_toggle_user`, `admin_set_permissions`, `hard_delete_user`) وتبيّن أنها محمية داخلياً بفحوصات `is_admin()`/`current_user_role()`/`auth.uid()`. الباقي أغلبها دوال triggers داخلية (لا تُستدعى مباشرة). خطرها منخفض تقديرياً لكن يستحق فحصاً فردياً كاملاً لاحقاً. | مراجعة أمنية سيبرانية شاملة | Future | 🟢 | 🔴 Deferred | — |
| 56 | **اكتشاف بنيوي كبير:** قاعدة بيانات Supabase الفعلية تحتوي **~30 جدولاً** بينما `OMNIRAD_PROJECT.md` يوثّق فقط ~14. جداول موجودة فعلياً وغير موثّقة إطلاقاً: `profiles`, `generated_images`, `review_queue`, `atlas_images`, `anatomical_structures`, `anatomical_structures_ext`, `bulk_uploads`, `permission_catalog`, `role_presets`, `loinc_axis`, `contacts`, `notifications`, `notification_prefs`, `activity_log`, `pending_images`, `mnemonics`, `cards`, `anatomy_flags`, `anatomy_review_queue`, `anatomy_quality_report`, `contributors` (deprecated), `anatomy_aliases`, `anatomy_migration_log`, `generation_sessions_archived_2026_07`. يعني وجود بنية تحتية كاملة (نظام صلاحيات `permission_catalog`/`role_presets`، نظام مراجعة صور AI-generated، نظام إشعارات) اشتغلت خارج نطاق أي محادثة موثّقة بهذا الملف — يخالف Rule #10 (Zero Assumptions) من مصدر غير معروف حالياً. يحتاج جلسة توثيق مخصصة لمطابقة الواقع مع الملفات. | مراجعة أمنية سيبرانية شاملة | Future — جلسة توثيق مخصصة | 🟡 | 🔴 Open | — |
| 57 | **محاولة إعادة تسمية المشروع إلى "TOMANEX"** — قرار معتمد ظاهرياً 19 يوليو 2026 (هوية بصرية جديدة، شعار، ملف CLAUDE.md وثّق القرار بالتفصيل)، **لكن أُلغي لاحقاً** والاسم عاد إلى **OmniRad** نهائياً. أكّده المالك صراحة 21 أغسطس 2026. الموقع الحي (`index.html`, `omnirad-nav.js`) يستخدم "OmniRad" حصراً — لا أثر لـTOMANEX في الكود المنشور فعلياً. | ملاحظة مباشرة من المالك أثناء مراجعة إعادة المزامنة | — | 🟢 | ✅ Resolved (تراجع) | 2026-08-21 |
| 58 | **Phase 3 اكتملت بالكامل خارج نطاق أي محادثة موثّقة بهذا الملف** — 9 sprints (Studio cleanup/Feature Flags · Atlas dynamic · Anatomy Queue 3-Layer Quality · Series schema · Bulk Upload Series Mode · Overload fix · OSERN Naming · Series Review Workbench · PACS-like Atlas Series Viewer · Image Standard Enforcement)، ~15,000 سطر كود عبر 36 ملف. موثّقة بالكامل في `docs/phase-3-completion.md` بالمستودع الحي. لا حاجة لإعادة عمل — فقط تسجيل تاريخي هنا. | إعادة مزامنة التوثيق 2026-08-21 | — | — | ✅ Documented (منجز مسبقاً) | 2026-07-14 |
| 59 | **QA Audit آلي كامل بتاريخ 21 يوليو 2026** (`docs/QA-AUDIT-2026-07-21.md`) فحص 22 صفحة + 37 وحدة على GitHub@main. النتائج: P1 (4 بنود) ✅ مكتملة بالكامل (حذف ملف مكرر ميت، تنويه تعليمي موحّد بـ9 صفحات، إصلاح 404 عامة، إصلاح `omnirad-term.js resolveToId`) · P2 (7 بنود) ✅ 5-6 مكتملة (alert→toast، رسائل ثنائية اللغة) + 1 اختياري (بصمات كاش غير موحّدة) · P3 (بنود منخفضة، تحسينات مؤجلة عمداً: محتوى تعليمي ثابت بانتظار ربط DB، فحص a11y يدوي لم يُنفَّذ). لا حاجة لإعادة عمل — تسجيل تاريخي. | إعادة مزامنة التوثيق 2026-08-21 | — | — | ✅ Documented (منجز مسبقاً جزئياً) | 2026-07-21 |
| 60 | **فجوة توثيق كبرى (كانت مسجّلة كـIssue #56) — انحلّت بإعادة المزامنة الكاملة v6.0:** قاعدة البيانات + المستودع الفعلي كانا متقدمين شهر ونص كامل عن `OMNIRAD_PROJECT.md`/`OMNIRAD_ISSUES.md` (توقفا عند 4 يوليو بينما التطوير الفعلي استمر حتى 22 يوليو + مراجعة أمنية 21 أغسطس). **الإصلاح:** أُعيد بناء `OMNIRAD_PROJECT.md` بالكامل (v6.0) مباشرة من `README.md`/`docs/architecture.md`/`docs/phase-3-completion.md`/`docs/feature-flags.md` في المستودع الحي، بموافقة صريحة من المالك على إعادة الكتابة الكاملة (استثناء Rule #12). **درس دائم:** عند الشك في وجود فجوة زمنية بين المحادثات، يجب سحب حالة المستودع الحي فعلياً (`codeload.github.com` عند تعطل GitHub API بحد المعدل) بدل الافتراض أن ملفات الحوكمة محدَّثة. | إعادة مزامنة التوثيق (طلب صريح من المالك) | — | 🟡 | ✅ Resolved | 2026-08-21 |

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
| 51-fix | Issue #51 Fix — atlas.html spleen Broken CT Path | 2026-07-04 | Mohammed Saeed Alzahrani | LOCAL_MEDIA spleen CT img استُبدل بصورة CT عامة حقيقية (images/home/ct_abdomen.png)، نفس نمط إصلاح Issue #45 · تحقق JS نحوي ناجح |
| 47-fix | Issue #47 Fix — Supabase bone Category Correction | 2026-07-04 | Mohammed Saeed Alzahrani | تصنيف جديد `skeletal` أُنشئ، وصف bone (Pelvic Bone) في جدول structures حُدِّث من `urinary` إلى `skeletal` بموافقة صريحة على تعديل الإنتاج · تحقق مباشر عبر RETURNING |

---

## 📌 Sprint #1 CT — Abdomen — تتبّع البيانات الخام (BTCV/Synapse)

| البند | الحالة |
|-------|--------|
| مصدر معتمد | BTCV/Pancreas-CT عبر Synapse `syn3193805` (مجلد الملف: `syn3376386`) |
| التسجيل بالتحدي (Join) + إيميل masicranialvault@gmail.com | ✅ تم |
| فتح صلاحية الوصول (Access) | ✅ تم التأكد — "Bulk Download Options" ظاهر (1.53 GB) |
| تنزيل `RawData.zip` | ✅ تم — حالياً على التابلت |
| نقل الملف للكمبيوتر (بيئة Python: nibabel/pydicom/pillow) | ⏳ معلّق — القادم |
| فك الضغط + استخراج slices + تحويل PNG | ⏳ لم يبدأ |

**ملاحظة 2026-08-21:** هذا التتبّع لم يظهر أي تحديث بالمستودع الحي — لا يزال هذا آخر ما وُثِّق بخصوص Sprint #1 CT تحديداً (منفصل عن محتوى Phase 3 الذي ركّز على منصة المساهمة/المراجعة نفسها لا على محتوى BTCV).

---

**End of File**
