# المرحلة ٢ — Bulk Upload + Contribute Hub

**تعليمات التنفيذ خطوة بخطوة**

---

## 📦 الملفات في هذه الدفعة

### ١) ملف SQL جديد
- `supabase/phase2-bulk-upload.sql`

### ٢) صفحات جديدة
- `omnirad-redesign/pages/contribute.html`
- `omnirad-redesign/pages/bulk-upload.html`

### ٣) ملفات معدَّلة (استبدال كامل)
- `omnirad-redesign/modules/omnirad-nav.js`  ← أُضيف بند «Contribute» في dropdown
- `omnirad-redesign/pages/profile.html`  ← أُضيفت بطاقة اختصار Contribute

---

## 🚀 خطوات التنفيذ بالترتيب

### الخطوة ١ — رفع الملفات إلى GitHub

في المستودع `orphanai2026/OmniRad`:

| المصدر (من هذه الدفعة) | الوجهة على GitHub |
|---|---|
| `supabase/phase2-bulk-upload.sql` | `supabase/phase2-bulk-upload.sql` |
| `omnirad-redesign/pages/contribute.html` | `pages/contribute.html` |
| `omnirad-redesign/pages/bulk-upload.html` | `pages/bulk-upload.html` |
| `omnirad-redesign/modules/omnirad-nav.js` | `modules/omnirad-nav.js` |
| `omnirad-redesign/pages/profile.html` | `pages/profile.html` |

> ⚠️ **مهم:** المسار على GitHub بدون `omnirad-redesign/` في البداية.

---

### الخطوة ٢ — تنفيذ SQL على Supabase

1. افتح Supabase → **SQL Editor** → **New query**
2. الصق كامل محتوى `phase2-bulk-upload.sql`
3. اضغط **Run**
4. تحقّق من ظهور رسالتَي:
   - `▶ TASK: PHASE2-BULK-UPLOAD — starting`
   - `✔ TASK: PHASE2-BULK-UPLOAD — completed`

**ما يفعله SQL:**
- يضيف أعمدة `structures[], level, citation, batch_id` إلى `atlas_images`
- يضيف أعمدة `batch_id, archived_at, archive_reason, structures[], level, citation, sequence` إلى `review_queue`
- ينشئ جدول `anatomical_structures_ext` (للبنى الجديدة من الرفع)
- ينشئ جدول `bulk_uploads` (بيانات الدفعات)
- ينشئ ٥ RPC functions:
  - `submit_bulk_upload(images jsonb, notes text)`
  - `approve_bulk_upload_item(review_id bigint)`
  - `reject_to_archive(review_id bigint, reason text)`
  - `contributor_stats(uid uuid default null)`
  - `contributor_leaderboard(limit int default 10)`
- يفعّل RLS + policies على الجداول الجديدة

**الملف idempotent** — يمكن إعادة تنفيذه بأمان (يستخدم `IF NOT EXISTS` + `CREATE OR REPLACE`).

---

### الخطوة ٣ — التحقّق من صلاحيات bucket `atlas`

في Supabase → **Storage → Policies** على bucket `atlas`:

**تأكّد من وجود policy تسمح للمستخدم بالرفع في مساره الخاص:**

```sql
-- إن لم تكن موجودة، أضفها:
create policy "authenticated users can upload to their uploads folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'atlas'
  and (storage.foldername(name))[1] = 'uploads'
  and (storage.foldername(name))[2] = auth.uid()::text
);
```

الصفحة ترفع في مسار: `uploads/<user_id>/<YYYYMMDD>/<uuid>.<ext>`

---

### الخطوة ٤ — اختبار الميزة

بعد رفع الملفات وانتشار GitHub Pages (دقيقة أو دقيقتان):

1. افتح: `https://orphanai2026.github.io/OmniRad/pages/contribute.html`
2. **إن كنت admin:** ستظهر بطاقات الـHub + Leaderboard + إحصائياتك
3. اضغط **Bulk Upload** → صفحة الرفع بـ٤ خطوات:
   - **Step 1:** اسحب صور تجريبية (PNG/JPEG، حتى 30، 4MB لكل صورة)
   - **Step 2:** املأ organ + modality + plane + structures (autocomplete من القاموس)
   - **Step 3:** راجع كل صورة → «Override» لتعديل صورة بعينها
   - **Step 4:** Submit → progress bar → نجاح
4. افتح `review.html` وتحقّق من ظهور الدفعة في طابور المراجعة
5. افتح dropdown الحساب في النافبار — يجب أن يظهر بند **Contribute**
6. افتح `profile.html` — يجب أن تظهر بطاقة teal بأيقونة upload-cloud

---

## 🔍 نقاط التحقّق (checklist)

- [ ] SQL نُفِّذ بلا أخطاء
- [ ] `contribute.html` تفتح ولا تعطي 404
- [ ] `bulk-upload.html` تفتح ولا تعطي 404
- [ ] بند **Contribute** يظهر في dropdown النافبار (للأدمن/المساهم فقط)
- [ ] بطاقة Contribute تظهر في `profile.html`
- [ ] رفع دفعة تجريبية ينجح ويظهر في `review.html`
- [ ] Autocomplete البنى يعمل ويقترح من القاموس v2
- [ ] «Add new» يضيف بنية جديدة إلى `anatomical_structures_ext`

---

## ⚠️ مشاكل محتملة

**«Upload error: new row violates row-level security policy»**
→ ارجع للخطوة ٣ وتأكّد من policy الـStorage.

**«Submit error: FORBIDDEN — contributor role required»**
→ دورك في `profiles.role` ليس `admin` ولا `contributor`. حدِّثه من `admin.html`.

**Autocomplete لا يعرض شيئاً**
→ افتح Console وتأكّد أن `window.__omniradStructuresV2` معرَّف. إن كان فارغاً، Loader v2 لم يكمل — تحقّق من الشبكة.

**بطاقة Contribute في profile لا تظهر**
→ حدِّث الصفحة (`Ctrl+Shift+R`) — قد يكون كاش قديم.

---

## 📋 عند الانتهاء

قل: **«معتمد وانتهت»** → سأحدّث `CLAUDE.md` + `RESUME.md` وأصدر رسالة بدء المرحلة ٣.
