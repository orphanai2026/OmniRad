/* ═══════════════════════════════════════════════════════════════
   OmniRad — Predefined Anatomical Series Levels + Expected Structures
   ─────────────────────────────────────────────────────────────
   TASK: SERIES-SLICES-DATA · v2 · 20 Jul 2026
   Reference: TA2 (Terminologia Anatomica) · RadLex (RSNA) ·
   ACR Appropriateness Criteria · Sectional anatomy (Grainger & Allison / Netter).
   See docs/series-anatomy-reference.md for the sourced level→structures table.

   Each slice now carries `structures:[]` — the expected anatomical structures
   at that level, used to AUTO-SUGGEST the "Anatomical structures visible" field
   in Bulk Upload (editable — the human reviewer confirms). Names are English
   and are resolved against the dictionary (anatomy-master v2) at display time.

   thicknessNote is descriptive only (AI images have no raw DICOM/HU data).
   PRELIMINARY — pending radiologist review; extra levels can be added later.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const DATA = [
    { key:'brain', en:'Brain', ar:'الدماغ', aliases:['cerebrum','head'], defaultModality:'CT', thicknessNote:'5mm routine / 1mm stroke protocol (ACR)',
      slices:[
        {en:'Vertex / centrum semiovale', ar:'القمة / المركز شبه البيضوي', structures:['centrum semiovale','superior frontal gyrus','superior sagittal sinus']},
        {en:'Bodies of lateral ventricles', ar:'أجسام البطينات الجانبية', structures:['lateral ventricle','corpus callosum','caudate nucleus']},
        {en:'Basal ganglia / third ventricle', ar:'العقد القاعدية / البطين الثالث', structures:['caudate nucleus','putamen','globus pallidus','thalamus','internal capsule','third ventricle']},
        {en:'Suprasellar cistern / midbrain', ar:'الصهريج فوق السرجي / الدماغ المتوسط', structures:['midbrain','suprasellar cistern','temporal horn','circle of Willis']},
        {en:'Posterior fossa / cerebellopontine angle', ar:'الحفرة الخلفية / الزاوية المخيخية الجسرية', structures:['pons','cerebellum','fourth ventricle','cerebellopontine angle']}
      ]},
    { key:'cervical-spine', en:'Cervical spine', ar:'الفقرات العنقية', aliases:['c-spine','neck spine'], defaultModality:'CT', thicknessNote:'2-3mm (ACR spine protocol)',
      slices:[
        {en:'C1 (atlas)', ar:'C1 (الفقرة الأطلسية)', structures:['atlas','spinal cord','vertebral artery']},
        {en:'C2 (axis)', ar:'C2 (المحورية)', structures:['axis','odontoid process','spinal cord']},
        {en:'C3', ar:'C3', structures:['vertebral body','spinal canal','neural foramen','facet joint']},
        {en:'C4', ar:'C4', structures:['vertebral body','spinal canal','neural foramen','facet joint']},
        {en:'C5', ar:'C5', structures:['vertebral body','spinal canal','neural foramen','facet joint']},
        {en:'C6', ar:'C6', structures:['vertebral body','spinal canal','neural foramen','facet joint']},
        {en:'C7', ar:'C7', structures:['vertebral body','spinal canal','neural foramen','facet joint']}
      ]},
    { key:'lungs', en:'Lungs', ar:'الرئتان', aliases:['chest','thorax'], defaultModality:'CT', thicknessNote:'1-1.25mm HRCT (ACR)',
      slices:[
        {en:'Apices', ar:'القمم الرئوية', structures:['apical segment','subclavian artery','first rib']},
        {en:'Aortic arch', ar:'قوس الأبهر', structures:['aortic arch','superior vena cava','trachea','upper lobe']},
        {en:'Carina', ar:'التفرع الرغامي (الكارينا)', structures:['carina','main bronchus','ascending aorta','descending aorta','azygos vein']},
        {en:'Hila / pulmonary trunk', ar:'السرّة الرئوية / الجذع الرئوي', structures:['pulmonary trunk','right pulmonary artery','left pulmonary artery','hilum']},
        {en:'Lung bases', ar:'قواعد الرئتين', structures:['lower lobe','costophrenic angle','hemidiaphragm']}
      ]},
    { key:'heart', en:'Heart', ar:'القلب', aliases:['cardiac'], defaultModality:'CT', thicknessNote:'per cardiac gating protocol',
      slices:[
        {en:'Aortic root / valve level', ar:'جذر الأبهر / مستوى الصمام', structures:['aortic root','aortic valve','coronary ostium','left ventricular outflow tract']},
        {en:'Four-chamber view', ar:'مستوى الحجرات الأربع', structures:['right atrium','right ventricle','left atrium','left ventricle','interventricular septum','mitral valve','tricuspid valve']},
        {en:'Short-axis, mid-ventricle', ar:'المحور القصير — منتصف البطين', structures:['left ventricle','right ventricle','papillary muscle','myocardium']},
        {en:'Apex', ar:'قمة القلب', structures:['left ventricular apex','myocardium']}
      ]},
    { key:'breast', en:'Breast', ar:'الثدي', aliases:[], defaultModality:'Mammography', thicknessNote:'N/A — projectional views by quadrant',
      slices:[
        {en:'Upper outer quadrant', ar:'الربع العلوي الخارجي', structures:['fibroglandular tissue','lactiferous duct','axillary tail','Cooper ligament']},
        {en:'Upper inner quadrant', ar:'الربع العلوي الداخلي', structures:['fibroglandular tissue','lactiferous duct','Cooper ligament']},
        {en:'Lower outer quadrant', ar:'الربع السفلي الخارجي', structures:['fibroglandular tissue','lactiferous duct','Cooper ligament']},
        {en:'Lower inner quadrant', ar:'الربع السفلي الداخلي', structures:['fibroglandular tissue','lactiferous duct','Cooper ligament']},
        {en:'Retroareolar region', ar:'المنطقة خلف الهالة', structures:['nipple','areola','retroareolar duct']}
      ]},
    { key:'liver', en:'Liver', ar:'الكبد', aliases:[], defaultModality:'CT', thicknessNote:'3-5mm (ACR abdomen)',
      slices:[
        {en:'Hepatic dome', ar:'قبة الكبد', structures:['right hepatic lobe','left hepatic lobe','hepatic vein','diaphragm','inferior vena cava']},
        {en:'Porta hepatis', ar:'السرّة الكبدية', structures:['portal vein','hepatic artery','common bile duct','caudate lobe']},
        {en:'Portal vein confluence', ar:'ملتقى الوريد البابي', structures:['main portal vein','superior mesenteric vein','splenic vein','pancreatic head']},
        {en:'Inferior / caudate tip', ar:'الطرف السفلي / الفصّ المذنّب', structures:['inferior right lobe','inferior vena cava','right portal branch','left portal branch']}
      ]},
    { key:'pancreas', en:'Pancreas', ar:'البنكرياس', aliases:[], defaultModality:'CT', thicknessNote:'3mm (ACR pancreas protocol)',
      slices:[
        {en:'Head / uncinate', ar:'الرأس / الناتئ الكلابي', structures:['pancreatic head','uncinate process','duodenum','common bile duct','superior mesenteric vein','superior mesenteric artery']},
        {en:'Body', ar:'الجسم', structures:['pancreatic body','splenic vein','coeliac trunk','superior mesenteric artery']},
        {en:'Tail', ar:'الذيل', structures:['pancreatic tail','splenic hilum','splenic artery']}
      ]},
    { key:'kidneys', en:'Kidneys', ar:'الكليتان', aliases:['kidney','renal'], defaultModality:'CT', thicknessNote:'3-5mm (ACR abdomen)',
      slices:[
        {en:'Upper pole', ar:'القطب العلوي', structures:['upper pole','adrenal gland','perinephric fat']},
        {en:'Renal hilum (renal vein level)', ar:'السرّة الكلوية (مستوى الوريد الكلوي)', structures:['renal pelvis','renal artery','renal vein','renal cortex','renal medulla']},
        {en:'Lower pole', ar:'القطب السفلي', structures:['lower pole','ureter','psoas muscle']}
      ]},
    { key:'pelvis-bones', en:'Pelvic bones', ar:'عظام الحوض', aliases:['pelvis','hip bones'], defaultModality:'CT', thicknessNote:'2-3mm (ACR MSK)',
      slices:[
        {en:'Iliac crest', ar:'قمة الحرقفة', structures:['iliac wing','sacroiliac joint','sacrum']},
        {en:'Acetabulum', ar:'الحُق (الجوف الحقّي)', structures:['acetabulum','femoral head','hip joint']},
        {en:'Ischium / pubic symphysis', ar:'الإسك / الارتفاق العاني', structures:['ischial tuberosity','pubic symphysis','pubic ramus']},
        {en:'Femoral heads', ar:'رأسا عظمة الفخذ', structures:['femoral head','femoral neck','greater trochanter']}
      ]},
    { key:'lumbar-spine', en:'Lumbar spine', ar:'الفقرات القطنية', aliases:['l-spine'], defaultModality:'CT', thicknessNote:'2-3mm (ACR spine protocol)',
      slices:[
        {en:'L1', ar:'L1', structures:['vertebral body','spinal canal','conus medullaris','neural foramen','facet joint']},
        {en:'L2', ar:'L2', structures:['vertebral body','spinal canal','cauda equina','neural foramen','facet joint']},
        {en:'L3', ar:'L3', structures:['vertebral body','spinal canal','cauda equina','neural foramen','facet joint']},
        {en:'L4', ar:'L4', structures:['vertebral body','spinal canal','cauda equina','neural foramen','facet joint','intervertebral disc']},
        {en:'L5', ar:'L5', structures:['vertebral body','spinal canal','cauda equina','neural foramen','facet joint','intervertebral disc']}
      ]},
    { key:'humerus', en:'Humerus', ar:'العضد', aliases:['upper arm'], defaultModality:'X-Ray', thicknessNote:'1-2mm if cross-sectional (ACR MSK)',
      slices:[
        {en:'Proximal (surgical neck)', ar:'القريب (العنق الجراحي)', structures:['humeral head','greater tuberosity','lesser tuberosity','surgical neck','glenohumeral joint']},
        {en:'Midshaft', ar:'منتصف الجسم', structures:['humeral shaft','deltoid tuberosity','cortex','medullary cavity']},
        {en:'Distal (elbow)', ar:'البعيد (المرفق)', structures:['capitellum','trochlea','olecranon fossa','elbow joint']}
      ]},
    { key:'femur', en:'Femur', ar:'الفخذ', aliases:['thigh bone'], defaultModality:'X-Ray', thicknessNote:'1-2mm if cross-sectional (ACR MSK)',
      slices:[
        {en:'Proximal (femoral neck)', ar:'القريب (عنق الفخذ)', structures:['femoral head','femoral neck','greater trochanter','lesser trochanter','hip joint']},
        {en:'Midshaft', ar:'منتصف الجسم', structures:['femoral shaft','linea aspera','cortex','medullary cavity']},
        {en:'Distal (condyles)', ar:'البعيد (اللقمتان)', structures:['medial femoral condyle','lateral femoral condyle','intercondylar notch','knee joint']}
      ]},
    { key:'knee', en:'Knee', ar:'الركبة', aliases:[], defaultModality:'MRI', thicknessNote:'1-2mm (ACR MSK)',
      slices:[
        {en:'Suprapatellar', ar:'فوق الرضفة', structures:['quadriceps tendon','suprapatellar recess','distal femur']},
        {en:'Mid-joint (menisci)', ar:'منتصف المفصل (الغضاريف الهلالية)', structures:['medial meniscus','lateral meniscus','anterior cruciate ligament','posterior cruciate ligament','articular cartilage']},
        {en:'Infrapatellar (tibial plateau)', ar:'تحت الرضفة (هضبة الظنبوب)', structures:['tibial plateau','patellar tendon','proximal tibia']}
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

  // Union of all expected structures across a series' levels (deduped, ordered).
  function structuresFor(entry){
    if (!entry || !Array.isArray(entry.slices)) return [];
    const seen = new Set(); const out = [];
    entry.slices.forEach(s => (s.structures||[]).forEach(x => {
      const k = norm(x); if (!seen.has(k)){ seen.add(k); out.push(x); }
    }));
    return out;
  }

  window.OMNIRAD_SERIES_SLICES = { list: DATA, find, structuresFor };
})();
