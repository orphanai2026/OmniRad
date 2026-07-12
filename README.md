# Sprint 2 Deploy Package — Atlas Dynamic

## GitHub uploads (نفس المسارات على repo `orphanai2026/OmniRad`):
- `modules/omnirad-atlas-dynamic.js`  ← جديد
- `pages/atlas.html`                   ← معدَّل
- `index.html`                          ← معدَّل

## Supabase:
- شغّل `supabase/atlas-dynamic-views.sql` في SQL Editor.

## Storage:
- تأكّد أن bucket `omnirad-images` يسمح بالقراءة العامة (public read policy).

## اختبار سريع:
- افتح `atlas.html?organ=brain&modality=CT&plane=Axial` ← يجب أن يفتح على brain/CT/Axial.
- افتح `index.html` ← البطاقة الرابعة تعرض عدد الصور الحيّ.
