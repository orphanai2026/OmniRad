/* ═══════════════════════════════════════════════════════════════
   OmniRad — Predefined Anatomical Series Levels
   ─────────────────────────────────────────────────────────────
   TASK: SERIES-SLICES-DATA · 19 Jul 2026
   Reference: Netter / Grainger & Allison's Diagnostic Radiology /
   ACR Practice Parameters (slice-thickness notes only — descriptive,
   NOT real DICOM slice thickness since OmniRad images are AI-generated
   with no raw pixel/HU data).
   13 organs ready now; ~40 remain (added incrementally, data-only).
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const DATA = [
    { key:'brain', en:'Brain', ar:'الدماغ', aliases:['cerebrum','head'], defaultModality:'CT', thicknessNote:'5mm routine / 1mm stroke protocol (ACR)',
      slices:[
        {en:'Centrum semiovale', ar:'المركز شبه البيضوي'},
        {en:'Lateral ventricles / basal ganglia', ar:'البطينات الجانبية / العقد القاعدية'},
        {en:'Suprasellar cistern', ar:'الصهريج فوق السرجي'},
        {en:'Posterior fossa / cerebellopontine angle', ar:'الحفرة الخلفية / الزاوية المخيخية الجسرية'}
      ]},
    { key:'cervical-spine', en:'Cervical spine', ar:'الفقرات العنقية', aliases:['c-spine','neck spine'], defaultModality:'CT', thicknessNote:'2-3mm (ACR spine protocol)',
      slices:[
        {en:'C1 (atlas)', ar:'C1 (الفقرة الأطلسية)'},
        {en:'C2 (axis)', ar:'C2 (المحورية)'},
        {en:'C3', ar:'C3'}, {en:'C4', ar:'C4'}, {en:'C5', ar:'C5'}, {en:'C6', ar:'C6'},
        {en:'C7', ar:'C7'}
      ]},
    { key:'lungs', en:'Lungs', ar:'الرئتان', aliases:['chest','thorax'], defaultModality:'CT', thicknessNote:'1-1.25mm HRCT (ACR)',
      slices:[
        {en:'Apices', ar:'القمم الرئوية'},
        {en:'Aortic arch', ar:'قوس الأبهر'},
        {en:'Carina', ar:'التفرع الرغامي (الكارينا)'},
        {en:'Hila', ar:'السرّة الرئوية'},
        {en:'Lung bases', ar:'قواعد الرئتين'}
      ]},
    { key:'heart', en:'Heart', ar:'القلب', aliases:['cardiac'], defaultModality:'CT', thicknessNote:'per cardiac gating protocol',
      slices:[
        {en:'Aortic root / valve level', ar:'جذر الأبهر / مستوى الصمام'},
        {en:'Four-chamber view', ar:'مستوى الحجرات الأربع'},
        {en:'Short-axis, mid-ventricle', ar:'المحور القصير — منتصف البطين'},
        {en:'Apex', ar:'قمة القلب'}
      ]},
    { key:'breast', en:'Breast', ar:'الثدي', aliases:[], defaultModality:'Mammography', thicknessNote:'N/A — projectional views by quadrant',
      slices:[
        {en:'Upper outer quadrant', ar:'الربع العلوي الخارجي'},
        {en:'Upper inner quadrant', ar:'الربع العلوي الداخلي'},
        {en:'Lower outer quadrant', ar:'الربع السفلي الخارجي'},
        {en:'Lower inner quadrant', ar:'الربع السفلي الداخلي'},
        {en:'Retroareolar region', ar:'المنطقة خلف الهالة'}
      ]},
    { key:'liver', en:'Liver', ar:'الكبد', aliases:[], defaultModality:'CT', thicknessNote:'3-5mm (ACR abdomen)',
      slices:[
        {en:'Dome', ar:'قبة الكبد'},
        {en:'Porta hepatis', ar:'السرّة الكبدية'},
        {en:'Coeliac axis', ar:'الجذع الزلاقي'},
        {en:'Portal vein confluence', ar:'ملتقى الوريد البابي'}
      ]},
    { key:'pancreas', en:'Pancreas', ar:'البنكرياس', aliases:[], defaultModality:'CT', thicknessNote:'3mm (ACR pancreas protocol)',
      slices:[
        {en:'Head', ar:'الرأس'},
        {en:'Body', ar:'الجسم'},
        {en:'Tail', ar:'الذيل'}
      ]},
    { key:'kidneys', en:'Kidneys', ar:'الكليتان', aliases:['kidney','renal'], defaultModality:'CT', thicknessNote:'3-5mm (ACR abdomen)',
      slices:[
        {en:'Upper pole', ar:'القطب العلوي'},
        {en:'Renal hilum (renal vein level)', ar:'السرّة الكلوية (مستوى الوريد الكلوي)'},
        {en:'Lower pole', ar:'القطب السفلي'}
      ]},
    { key:'pelvis-bones', en:'Pelvic bones', ar:'عظام الحوض', aliases:['pelvis','hip bones'], defaultModality:'CT', thicknessNote:'2-3mm (ACR MSK)',
      slices:[
        {en:'Iliac crest', ar:'قمة الحرقفة'},
        {en:'Acetabulum', ar:'الحُق (الجوف الحقّي)'},
        {en:'Ischium / pubic symphysis', ar:'الإسك / الارتفاق العاني'},
        {en:'Femoral heads', ar:'رأسا عظمة الفخذ'}
      ]},
    { key:'lumbar-spine', en:'Lumbar spine', ar:'الفقرات القطنية', aliases:['l-spine'], defaultModality:'CT', thicknessNote:'2-3mm (ACR spine protocol)',
      slices:[
        {en:'L1', ar:'L1'}, {en:'L2', ar:'L2'}, {en:'L3', ar:'L3'}, {en:'L4', ar:'L4'}, {en:'L5', ar:'L5'}
      ]},
    { key:'humerus', en:'Humerus', ar:'العضد', aliases:['upper arm'], defaultModality:'X-Ray', thicknessNote:'1-2mm if cross-sectional (ACR MSK)',
      slices:[
        {en:'Proximal (surgical neck)', ar:'القريب (العنق الجراحي)'},
        {en:'Midshaft', ar:'منتصف الجسم'},
        {en:'Distal (elbow)', ar:'البعيد (المرفق)'}
      ]},
    { key:'femur', en:'Femur', ar:'الفخذ', aliases:['thigh bone'], defaultModality:'X-Ray', thicknessNote:'1-2mm if cross-sectional (ACR MSK)',
      slices:[
        {en:'Proximal (femoral neck)', ar:'القريب (عنق الفخذ)'},
        {en:'Midshaft', ar:'منتصف الجسم'},
        {en:'Distal (condyles)', ar:'البعيد (اللقمتان)'}
      ]},
    { key:'knee', en:'Knee', ar:'الركبة', aliases:[], defaultModality:'MRI', thicknessNote:'1-2mm (ACR MSK)',
      slices:[
        {en:'Suprapatellar', ar:'فوق الرضفة'},
        {en:'Mid-joint (menisci)', ar:'منتصف المفصل (الغضاريف الهلالية)'},
        {en:'Infrapatellar (tibial plateau)', ar:'تحت الرضفة (هضبة الظنبوب)'}
      ]}
  ];

  function norm(s){ return (s||'').toString().trim().toLowerCase(); }

  function find(organText){
    const q = norm(organText);
    if (!q) return null;
    return DATA.find(e =>
      norm(e.en) === q || norm(e.ar) === q ||
      q.includes(norm(e.en)) || norm(e.en).includes(q) ||
      e.aliases.some(a => norm(a) === q || q.includes(norm(a)))
    ) || null;
  }

  window.OMNIRAD_SERIES_SLICES = { list: DATA, find };
})();
