# 📦 OmniRad — Phase 3 Cleanup Upload Package

هذا المجلد يحتوي على **كل الملفات الجديدة والمعدَّلة** التي يجب رفعها إلى GitHub.

## 📋 كيف ترفعها (بدون terminal)

افتح: https://github.com/orphanai2026/OmniRad

### ملف تلو الآخر — كل ملف يوضع في مساره المطابق تماماً:

| رفعه في هذا المسار على GitHub | الملف من هذا الـzip |
|---|---|
| `README.md` (يستبدل الموجود) | `README.md` |
| `modules/data/radiology-playbook.js` ⭐ | `modules/data/radiology-playbook.js` |
| `scripts/build-anatomy-v2.mjs` (مجلد جديد) | `scripts/build-anatomy-v2.mjs` |
| `scripts/README.md` | `scripts/README.md` |
| `docs/phase-3-completion.md` | `docs/phase-3-completion.md` |
| `docs/architecture.md` | `docs/architecture.md` |
| `supabase/_applied/README.md` (مجلد جديد) | `supabase/_applied/README.md` |
| `pipeline/_DEPRECATED.md` | `pipeline/_DEPRECATED.md` |

### طريقة الرفع في GitHub (بالماوس فقط):

**للملف داخل مجلد موجود** (مثل `modules/data/radiology-playbook.js`):
1. اذهب إلى المجلد على GitHub (`modules/data/`)
2. اضغط **Add file** → **Upload files**
3. اسحب الملف من الـzip إلى المتصفّح
4. اكتب في الأسفل: `feat: restore radiology-playbook.js (7089 LOINC)`
5. اضغط **Commit changes**

**للمجلد الجديد** (مثل `scripts/` أو `supabase/_applied/`):
1. اذهب لأي مجلد على GitHub
2. اضغط **Add file** → **Create new file**
3. في اسم الملف اكتب: `scripts/build-anatomy-v2.mjs` (الـ`/` يُنشئ المجلد تلقائياً)
4. انسخ محتوى الملف من الـzip والصقه
5. Commit

**للـREADME.md الجذر (استبدال):**
1. اضغط `README.md` في جذر المستودع
2. اضغط أيقونة القلم ✏️ (تعديل)
3. امسح كل المحتوى، والصق محتوى `README.md` من الـzip
4. Commit

---

## 🗑️ قبل الرفع — احذف هذه الملفات القديمة من GitHub

لكل ملف: افتحه → اضغط 🗑️ → Commit.

- [ ] `atlas.html` (في الجذر)
- [ ] `pages/bulk-upload-plan.html`
- [ ] `modules/lexicon.js`
- [ ] `modules/library.js`
- [ ] `modules/preset-avatars.js`
- [ ] `modules/srs.js`
- [ ] `modules/data/radiology-consumer-names.js`

---

## ✅ بعد الانتهاء

انتظر ٥ دقائق، ثم:
1. افتح https://orphanai2026.github.io/OmniRad/
2. اضغط **Ctrl+Shift+R**
3. تحقّق: صفحات atlas · bulk-upload · comparison تعمل بلا أخطاء

إن حدث خطأ: اضغط **F12** → **Console** → أرسل لي لقطة.
