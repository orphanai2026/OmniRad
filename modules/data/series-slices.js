/* ═══════════════════════════════════════════════════════════════
   OmniRad — Predefined Anatomical Series Levels + Expected Structures
   ─────────────────────────────────────────────────────────────
   TASK: SERIES-SLICES-DATA · v3 · 21 Jul 2026 (+41 organs, pending radiologist review)
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
      ]},

    // ── Head & Neck (added v3 — 21 Jul 2026, pending radiologist review) ──
    { key:'thyroid', en:'Thyroid gland', ar:'الغدة الدرقية', aliases:['thyroid'], defaultModality:'US', thicknessNote:'N/A — real-time B-mode by lobe',
      slices:[
        {en:'Upper pole', ar:'القطب العلوي', structures:['thyroid upper pole','superior thyroid artery','strap muscle']},
        {en:'Isthmus / mid-gland', ar:'البرزخ / منتصف الغدة', structures:['thyroid isthmus','trachea','common carotid artery','internal jugular vein']},
        {en:'Lower pole', ar:'القطب السفلي', structures:['thyroid lower pole','inferior thyroid artery','recurrent laryngeal nerve region']}
      ]},
    { key:'larynx', en:'Larynx', ar:'الحنجرة', aliases:['voice box'], defaultModality:'CT', thicknessNote:'2-3mm (ACR neck soft tissue)',
      slices:[
        {en:'Supraglottic (hyoid/epiglottis)', ar:'فوق المزمار (اللامي/لسان المزمار)', structures:['epiglottis','hyoid bone','pre-epiglottic fat','vallecula']},
        {en:'Glottic (true vocal cords)', ar:'المزماري (الحبال الصوتية الحقيقية)', structures:['true vocal cord','arytenoid cartilage','thyroid cartilage','anterior commissure']},
        {en:'Subglottic', ar:'تحت المزمار', structures:['cricoid cartilage','subglottic airway','trachea']}
      ]},
    { key:'orbits', en:'Orbits', ar:'الحجاج (محجرا العينين)', aliases:['eyes','eye'], defaultModality:'CT', thicknessNote:'1-2mm (ACR orbit protocol)',
      slices:[
        {en:'Globe / lens level', ar:'مستوى مقلة العين / العدسة', structures:['globe','lens','optic nerve','extraocular muscle']},
        {en:'Mid-orbit (optic nerve)', ar:'منتصف الحجاج (العصب البصري)', structures:['optic nerve','superior rectus','lateral rectus','medial rectus','ophthalmic artery']},
        {en:'Orbital apex', ar:'قمة الحجاج', structures:['optic canal','superior orbital fissure','annulus of Zinn']}
      ]},
    { key:'paranasal-sinuses', en:'Paranasal sinuses', ar:'الجيوب الأنفية', aliases:['sinuses'], defaultModality:'CT', thicknessNote:'1mm (ACR sinus protocol)',
      slices:[
        {en:'Frontal sinus', ar:'الجيب الجبهي', structures:['frontal sinus','frontal recess']},
        {en:'Ethmoid / maxillary (OMC level)', ar:'الغربالي / الفكي (مستوى المركب الوسيطي)', structures:['ethmoid sinus','maxillary sinus','middle turbinate','osteomeatal complex']},
        {en:'Sphenoid sinus', ar:'الجيب الوتدي', structures:['sphenoid sinus','sella turcica','optic canal']}
      ]},
    { key:'temporal-bone', en:'Temporal bone', ar:'العظم الصدغي', aliases:['inner ear','mastoid','ear'], defaultModality:'CT', thicknessNote:'0.5-0.6mm HRCT (ACR temporal bone)',
      slices:[
        {en:'Internal auditory canal', ar:'القناة السمعية الداخلية', structures:['internal auditory canal','facial nerve canal','vestibule']},
        {en:'Cochlea / vestibule', ar:'القوقعة / الدهليز', structures:['cochlea','vestibule','semicircular canal','oval window']},
        {en:'Mastoid / ossicles', ar:'الخشاء / العُظيمات السمعية', structures:['mastoid air cells','malleus','incus','tympanic membrane']}
      ]},
    { key:'parotid-gland', en:'Parotid gland', ar:'الغدة النكفية', aliases:['parotid'], defaultModality:'MRI', thicknessNote:'3-4mm (ACR neck)',
      slices:[
        {en:'Superficial lobe', ar:'الفص السطحي', structures:['superficial lobe','facial nerve plane','masseter muscle']},
        {en:'Deep lobe / retromandibular vein', ar:'الفص العميق / الوريد خلف الفك', structures:['deep lobe','retromandibular vein','external carotid artery','parapharyngeal space']}
      ]},
    { key:'mandible', en:'Mandible', ar:'الفك السفلي', aliases:['jaw'], defaultModality:'CT', thicknessNote:'1mm (ACR facial bones)',
      slices:[
        {en:'Condyle / TMJ', ar:'اللقمة / مفصل الفك الصدغي', structures:['mandibular condyle','temporomandibular joint','articular disc']},
        {en:'Body / mental foramen', ar:'الجسم / الثقبة الذقنية', structures:['mandibular body','mental foramen','inferior alveolar canal','tooth root']},
        {en:'Symphysis', ar:'الارتفاق الذقني', structures:['mandibular symphysis','genial tubercle']}
      ]},
    { key:'skull-base', en:'Skull base', ar:'قاعدة الجمجمة', aliases:[], defaultModality:'CT', thicknessNote:'1mm (ACR skull base)',
      slices:[
        {en:'Anterior skull base', ar:'قاعدة الجمجمة الأمامية', structures:['cribriform plate','planum sphenoidale','orbital roof']},
        {en:'Middle skull base (sella)', ar:'قاعدة الجمجمة الوسطى (السرج)', structures:['sella turcica','clivus','foramen ovale','foramen spinosum']},
        {en:'Posterior skull base', ar:'قاعدة الجمجمة الخلفية', structures:['foramen magnum','jugular foramen','internal occipital protuberance']}
      ]},

    // ── Chest / Cardiovascular (added v3) ──
    { key:'trachea', en:'Trachea', ar:'الرغامى (القصبة الهوائية)', aliases:['windpipe'], defaultModality:'CT', thicknessNote:'1-2mm (ACR chest)',
      slices:[
        {en:'Cervical trachea', ar:'الرغامى العنقية', structures:['tracheal rings','thyroid gland','esophagus']},
        {en:'Thoracic trachea', ar:'الرغامى الصدرية', structures:['tracheal lumen','aortic arch','brachiocephalic vessels']},
        {en:'Carina', ar:'التفرع الرغامي', structures:['carina','right main bronchus','left main bronchus']}
      ]},
    { key:'esophagus', en:'Esophagus', ar:'المريء', aliases:[], defaultModality:'CT', thicknessNote:'2-3mm (ACR chest/abdomen)',
      slices:[
        {en:'Cervical esophagus', ar:'المريء العنقي', structures:['cervical esophagus','trachea','recurrent laryngeal nerve region']},
        {en:'Mid-thoracic (aortic arch level)', ar:'المريء الصدري الأوسط (مستوى قوس الأبهر)', structures:['mid esophagus','azygos vein','descending thoracic aorta']},
        {en:'Distal / gastroesophageal junction', ar:'البعيد / الوصل المعدي المريئي', structures:['distal esophagus','gastroesophageal junction','diaphragmatic hiatus']}
      ]},
    { key:'thoracic-aorta', en:'Thoracic aorta', ar:'الأبهر الصدري', aliases:['aorta chest'], defaultModality:'CT', thicknessNote:'1-1.5mm (ACR CTA chest)',
      slices:[
        {en:'Aortic root', ar:'جذر الأبهر', structures:['aortic root','sinus of Valsalva','coronary ostium']},
        {en:'Ascending aorta / arch', ar:'الأبهر الصاعد / القوس', structures:['ascending aorta','aortic arch','brachiocephalic trunk','left common carotid artery','left subclavian artery']},
        {en:'Descending thoracic aorta', ar:'الأبهر الصدري النازل', structures:['descending thoracic aorta','esophagus','left atrium']}
      ]},
    { key:'mediastinum', en:'Mediastinum', ar:'المنصف', aliases:[], defaultModality:'CT', thicknessNote:'2-3mm (ACR chest)',
      slices:[
        {en:'Anterior mediastinum', ar:'المنصف الأمامي', structures:['thymic remnant / fat','ascending aorta','internal mammary vessels']},
        {en:'Middle mediastinum', ar:'المنصف الأوسط', structures:['heart','pericardium','main bronchi','hila']},
        {en:'Posterior mediastinum', ar:'المنصف الخلفي', structures:['descending aorta','esophagus','azygos vein','thoracic duct region']}
      ]},
    { key:'carotid-arteries', en:'Carotid arteries', ar:'الشرايين السباتية', aliases:['carotids','neck vessels'], defaultModality:'CT', thicknessNote:'0.75-1mm (ACR CTA neck)',
      slices:[
        {en:'Common carotid (mid-neck)', ar:'السباتي المشترك (منتصف العنق)', structures:['common carotid artery','internal jugular vein','vagus nerve']},
        {en:'Carotid bifurcation', ar:'تشعّب السباتي', structures:['carotid bifurcation','carotid bulb','external carotid artery','internal carotid artery']},
        {en:'Petrous / skull base segment', ar:'القطعة الصخرية / قاعدة الجمجمة', structures:['petrous internal carotid artery','carotid canal']}
      ]},
    { key:'abdominal-aorta', en:'Abdominal aorta', ar:'الأبهر البطني', aliases:['aorta abdomen'], defaultModality:'CT', thicknessNote:'1-2mm (ACR CTA abdomen)',
      slices:[
        {en:'Suprarenal (coeliac trunk)', ar:'فوق الكلوي (الجذع الزلاقي)', structures:['coeliac trunk','common hepatic artery','splenic artery','left gastric artery']},
        {en:'Renal artery origin', ar:'منشأ الشريان الكلوي', structures:['renal artery','superior mesenteric artery','left renal vein']},
        {en:'Infrarenal / bifurcation', ar:'تحت الكلوي / التشعّب', structures:['infrarenal aorta','aortic bifurcation','common iliac artery']}
      ]},

    // ── Abdomen (added v3) ──
    { key:'spleen', en:'Spleen', ar:'الطحال', aliases:[], defaultModality:'CT', thicknessNote:'3-5mm (ACR abdomen)',
      slices:[
        {en:'Superior pole', ar:'القطب العلوي', structures:['splenic upper pole','diaphragm','left hemidiaphragm']},
        {en:'Hilum', ar:'السرّة الطحالية', structures:['splenic hilum','splenic artery','splenic vein','tail of pancreas']},
        {en:'Inferior pole', ar:'القطب السفلي', structures:['splenic lower pole','left kidney','splenic flexure']}
      ]},
    { key:'adrenal-glands', en:'Adrenal glands', ar:'الغدتان الكظريتان', aliases:['adrenal','suprarenal glands'], defaultModality:'CT', thicknessNote:'2-3mm (ACR adrenal protocol)',
      slices:[
        {en:'Right adrenal', ar:'الكظرية اليمنى', structures:['right adrenal gland','inferior vena cava','right diaphragmatic crus','liver']},
        {en:'Left adrenal', ar:'الكظرية اليسرى', structures:['left adrenal gland','left diaphragmatic crus','splenic vessels','left kidney upper pole']}
      ]},
    { key:'stomach', en:'Stomach', ar:'المعدة', aliases:[], defaultModality:'CT', thicknessNote:'3-5mm (ACR abdomen)',
      slices:[
        {en:'Fundus / cardia', ar:'القاع / الفؤاد', structures:['gastric fundus','cardia','gastroesophageal junction','left hemidiaphragm']},
        {en:'Body', ar:'الجسم', structures:['gastric body','lesser curvature','greater curvature']},
        {en:'Antrum / pylorus', ar:'الغار / البواب', structures:['gastric antrum','pylorus','duodenal bulb']}
      ]},
    { key:'small-bowel', en:'Small bowel', ar:'الأمعاء الدقيقة', aliases:['small intestine'], defaultModality:'CT', thicknessNote:'3-5mm (ACR enterography)',
      slices:[
        {en:'Duodenum', ar:'الاثنا عشر', structures:['duodenum','pancreatic head','ampulla of Vater']},
        {en:'Jejunum', ar:'الصائم', structures:['jejunal loop','mesenteric vessels','plicae circulares']},
        {en:'Ileum / terminal ileum', ar:'اللفائفي / اللفائفي الطرفي', structures:['ileal loop','terminal ileum','ileocecal valve']}
      ]},
    { key:'colon', en:'Colon', ar:'القولون', aliases:['large bowel','large intestine'], defaultModality:'CT', thicknessNote:'3-5mm (ACR colonography)',
      slices:[
        {en:'Cecum / ascending colon', ar:'الأعور / القولون الصاعد', structures:['cecum','ascending colon','appendix','ileocecal valve']},
        {en:'Transverse colon', ar:'القولون المستعرض', structures:['transverse colon','hepatic flexure','splenic flexure']},
        {en:'Descending / sigmoid colon', ar:'القولون النازل / السيني', structures:['descending colon','sigmoid colon','haustra']}
      ]},
    { key:'gallbladder', en:'Gallbladder', ar:'المرارة', aliases:[], defaultModality:'US', thicknessNote:'N/A — real-time B-mode',
      slices:[
        {en:'Fundus', ar:'القاع', structures:['gallbladder fundus','liver edge']},
        {en:'Body / neck (Hartmann pouch)', ar:'الجسم / العنق (جيب هارتمان)', structures:['gallbladder body','gallbladder neck','cystic duct','Hartmann pouch']}
      ]},
    { key:'appendix', en:'Appendix', ar:'الزائدة الدودية', aliases:[], defaultModality:'CT', thicknessNote:'3mm (ACR RLQ pain protocol)',
      slices:[
        {en:'Base (cecal origin)', ar:'القاعدة (المنشأ الأعوري)', structures:['appendiceal base','cecum','ileocecal valve']},
        {en:'Tip', ar:'الطرف', structures:['appendiceal tip','periappendiceal fat']}
      ]},

    // ── Pelvis (added v3) ──
    { key:'urinary-bladder', en:'Urinary bladder', ar:'المثانة البولية', aliases:['bladder'], defaultModality:'CT', thicknessNote:'3-5mm (ACR pelvis)',
      slices:[
        {en:'Dome', ar:'القبة', structures:['bladder dome','perivesical fat']},
        {en:'Trigone / ureteral orifices', ar:'المثلث المثاني / فتحتا الحالبين', structures:['bladder trigone','ureteral orifice','ureterovesical junction']},
        {en:'Bladder neck', ar:'عنق المثانة', structures:['bladder neck','prostate (male) / urethra']}
      ]},
    { key:'prostate', en:'Prostate gland', ar:'غدة البروستاتا', aliases:['prostate'], defaultModality:'MRI', thicknessNote:'3mm (PI-RADS protocol)',
      slices:[
        {en:'Base', ar:'القاعدة', structures:['prostate base','seminal vesicle','bladder neck']},
        {en:'Mid-gland', ar:'منتصف الغدة', structures:['transition zone','peripheral zone','urethra']},
        {en:'Apex', ar:'القمة', structures:['prostate apex','neurovascular bundle','external urethral sphincter']}
      ]},
    { key:'uterus', en:'Uterus', ar:'الرحم', aliases:['uterine'], defaultModality:'MRI', thicknessNote:'3-4mm (ACR female pelvis)',
      slices:[
        {en:'Fundus', ar:'قاع الرحم', structures:['uterine fundus','endometrium','myometrium']},
        {en:'Body / cervix junction', ar:'الجسم / وصل عنق الرحم', structures:['uterine body','internal os','endometrial cavity']},
        {en:'Cervix', ar:'عنق الرحم', structures:['cervix','external os','vaginal fornix']}
      ]},
    { key:'ovaries', en:'Ovaries', ar:'المبيضان', aliases:['ovary'], defaultModality:'US', thicknessNote:'N/A — real-time B-mode',
      slices:[
        {en:'Right ovary', ar:'المبيض الأيمن', structures:['right ovary','ovarian follicle','broad ligament']},
        {en:'Left ovary', ar:'المبيض الأيسر', structures:['left ovary','ovarian follicle','broad ligament']}
      ]},
    { key:'testes', en:'Testes', ar:'الخصيتان', aliases:['testis','scrotum'], defaultModality:'US', thicknessNote:'N/A — real-time B-mode',
      slices:[
        {en:'Upper pole', ar:'القطب العلوي', structures:['testicular upper pole','epididymal head','tunica albuginea']},
        {en:'Mid-testis (mediastinum testis)', ar:'منتصف الخصية (منصف الخصية)', structures:['mediastinum testis','seminiferous tubule region']},
        {en:'Lower pole / epididymal tail', ar:'القطب السفلي / ذيل البربخ', structures:['testicular lower pole','epididymal tail','spermatic cord']}
      ]},
    { key:'rectum', en:'Rectum', ar:'المستقيم', aliases:[], defaultModality:'MRI', thicknessNote:'3mm (ACR rectal cancer protocol)',
      slices:[
        {en:'Rectosigmoid junction', ar:'وصل المستقيم بالقولون السيني', structures:['rectosigmoid junction','mesorectal fascia']},
        {en:'Mid-rectum', ar:'منتصف المستقيم', structures:['rectal wall','mesorectum','perirectal fat']},
        {en:'Lower rectum / anal canal', ar:'المستقيم السفلي / القناة الشرجية', structures:['anorectal junction','internal anal sphincter','external anal sphincter']}
      ]},

    // ── Spine (added v3) ──
    { key:'thoracic-spine', en:'Thoracic spine', ar:'الفقرات الصدرية', aliases:['t-spine'], defaultModality:'CT', thicknessNote:'2-3mm (ACR spine protocol)',
      slices:[
        {en:'Upper thoracic (T1-T4)', ar:'الصدري العلوي (T1-T4)', structures:['vertebral body','spinal canal','costovertebral joint','neural foramen']},
        {en:'Mid thoracic (T5-T8)', ar:'الصدري الأوسط (T5-T8)', structures:['vertebral body','spinal cord','pedicle','rib articulation']},
        {en:'Lower thoracic (T9-T12)', ar:'الصدري السفلي (T9-T12)', structures:['vertebral body','conus medullaris region','intervertebral disc','facet joint']}
      ]},
    { key:'sacrum-coccyx', en:'Sacrum and coccyx', ar:'العجز والعصعص', aliases:['sacrum','coccyx'], defaultModality:'CT', thicknessNote:'2-3mm (ACR spine/pelvis)',
      slices:[
        {en:'Sacral ala / SI joints', ar:'جناح العجز / المفصلان العجزيان الحرقفيان', structures:['sacral ala','sacroiliac joint','sacral foramen']},
        {en:'Mid-sacrum', ar:'منتصف العجز', structures:['sacral canal','sacral nerve root','sacral foramen']},
        {en:'Coccyx', ar:'العصعص', structures:['coccygeal segment','sacrococcygeal joint']}
      ]},

    // ── Upper extremity (added v3) ──
    { key:'shoulder', en:'Shoulder', ar:'الكتف', aliases:['glenohumeral joint'], defaultModality:'MRI', thicknessNote:'3-4mm (ACR shoulder MRI)',
      slices:[
        {en:'Acromioclavicular level', ar:'مستوى المفصل الأخرمي الترقوي', structures:['acromioclavicular joint','acromion','distal clavicle']},
        {en:'Glenohumeral joint / rotator cuff', ar:'المفصل العضدي الحقاني / الكفة المدورة', structures:['glenoid','humeral head','supraspinatus tendon','labrum']},
        {en:'Subscapularis / axillary level', ar:'تحت الكتف / المستوى الإبطي', structures:['subscapularis tendon','axillary recess','long head of biceps tendon']}
      ]},
    { key:'elbow', en:'Elbow', ar:'المرفق', aliases:[], defaultModality:'MRI', thicknessNote:'3mm (ACR elbow MRI)',
      slices:[
        {en:'Distal humerus (condyles)', ar:'العضد البعيد (اللقمتان)', structures:['capitellum','trochlea','medial epicondyle','lateral epicondyle']},
        {en:'Radiocapitellar / ulnohumeral joint', ar:'مفصل الكعبرة الحقاني / العضدي الزندي', structures:['radial head','ulnar coronoid process','joint capsule','annular ligament']},
        {en:'Proximal radius/ulna', ar:'الكعبرة والزند القريبان', structures:['radial neck','ulnar tuberosity','biceps tendon insertion']}
      ]},
    { key:'wrist', en:'Wrist', ar:'الرسغ (المعصم)', aliases:[], defaultModality:'MRI', thicknessNote:'2-3mm (ACR wrist MRI)',
      slices:[
        {en:'Proximal carpal row', ar:'الصف الرسغي القريب', structures:['scaphoid','lunate','triquetrum','distal radius']},
        {en:'Distal carpal row', ar:'الصف الرسغي البعيد', structures:['trapezium','trapezoid','capitate','hamate']},
        {en:'Carpometacarpal level', ar:'مستوى الرسغي المشطي', structures:['carpometacarpal joint','metacarpal base']}
      ]},
    { key:'hand', en:'Hand', ar:'اليد', aliases:['fingers'], defaultModality:'X-Ray', thicknessNote:'N/A — projectional views',
      slices:[
        {en:'Metacarpals', ar:'عظام المشط', structures:['metacarpal shaft','metacarpophalangeal joint']},
        {en:'Proximal / middle phalanges', ar:'السلاميات القريبة / الوسطى', structures:['proximal phalanx','middle phalanx','interphalangeal joint']},
        {en:'Distal phalanges', ar:'السلاميات البعيدة', structures:['distal phalanx','nail bed region']}
      ]},
    { key:'clavicle-scapula', en:'Clavicle and scapula', ar:'الترقوة ولوح الكتف', aliases:['clavicle','scapula'], defaultModality:'X-Ray', thicknessNote:'2-3mm if cross-sectional (ACR MSK)',
      slices:[
        {en:'Clavicle shaft', ar:'جسم الترقوة', structures:['clavicle shaft','sternoclavicular joint']},
        {en:'Scapular body / spine', ar:'جسم لوح الكتف / شوكته', structures:['scapular spine','scapular body','infraspinous fossa']},
        {en:'Glenoid / coracoid', ar:'الحُقّانية / الناتئ الغرابي', structures:['glenoid fossa','coracoid process','acromion']}
      ]},

    // ── Lower extremity (added v3) ──
    { key:'hip-joint', en:'Hip joint', ar:'مفصل الورك', aliases:['hip'], defaultModality:'MRI', thicknessNote:'3mm (ACR hip MRI)',
      slices:[
        {en:'Femoral head / acetabulum', ar:'رأس الفخذ / الحُق', structures:['femoral head','acetabular labrum','articular cartilage']},
        {en:'Femoral neck', ar:'عنق الفخذ', structures:['femoral neck','greater trochanter','iliopsoas tendon']},
        {en:'Lesser trochanter level', ar:'مستوى المدور الصغير', structures:['lesser trochanter','iliofemoral ligament']}
      ]},
    { key:'ankle', en:'Ankle', ar:'الكاحل', aliases:[], defaultModality:'MRI', thicknessNote:'2-3mm (ACR ankle MRI)',
      slices:[
        {en:'Distal tibiofibular (mortise)', ar:'الظنبوب الشظوي البعيد (الشوكة)', structures:['distal tibia','distal fibula','tibiofibular syndesmosis']},
        {en:'Talar dome', ar:'قبة الكاحل (العقب)', structures:['talus','talar dome','ankle mortise','deltoid ligament']},
        {en:'Subtalar joint', ar:'المفصل تحت الكاحلي', structures:['subtalar joint','calcaneus','sinus tarsi']}
      ]},
    { key:'foot', en:'Foot', ar:'القدم', aliases:['toes'], defaultModality:'X-Ray', thicknessNote:'N/A — projectional views',
      slices:[
        {en:'Hindfoot (calcaneus/talus)', ar:'مؤخر القدم (العقب/الكاحل)', structures:['calcaneus','talus','subtalar joint']},
        {en:'Midfoot (tarsals)', ar:'وسط القدم (عظام الرصغ)', structures:['navicular','cuboid','cuneiform bones']},
        {en:'Forefoot (metatarsals/phalanges)', ar:'مقدم القدم (المشط والسلاميات)', structures:['metatarsal','proximal phalanx','metatarsophalangeal joint']}
      ]},
    { key:'tibia-fibula', en:'Tibia and fibula', ar:'الظنبوب والشظية', aliases:['lower leg','shin'], defaultModality:'X-Ray', thicknessNote:'1-2mm if cross-sectional (ACR MSK)',
      slices:[
        {en:'Proximal (tibial plateau)', ar:'القريب (هضبة الظنبوب)', structures:['tibial plateau','fibular head','knee joint']},
        {en:'Midshaft', ar:'منتصف الجسم', structures:['tibial shaft','fibular shaft','interosseous membrane']},
        {en:'Distal (ankle mortise)', ar:'البعيد (شوكة الكاحل)', structures:['medial malleolus','lateral malleolus','ankle joint']}
      ]},
    { key:'patella', en:'Patella', ar:'الرضفة', aliases:['kneecap'], defaultModality:'MRI', thicknessNote:'2-3mm (ACR knee MRI)',
      slices:[
        {en:'Superior pole', ar:'القطب العلوي', structures:['quadriceps tendon insertion','superior patellar pole']},
        {en:'Mid-patella (patellofemoral joint)', ar:'منتصف الرضفة (المفصل الرضفي الفخذي)', structures:['patellar articular cartilage','trochlear groove','patellofemoral joint']},
        {en:'Inferior pole', ar:'القطب السفلي', structures:['patellar tendon origin','inferior patellar pole']}
      ]},

    // ── Chest wall / skeleton (added v3) ──
    { key:'ribs', en:'Ribs', ar:'الأضلاع', aliases:['rib cage'], defaultModality:'CT', thicknessNote:'1-2mm (ACR chest wall)',
      slices:[
        {en:'Upper ribs (1-4)', ar:'الأضلاع العلوية (1-4)', structures:['rib','costovertebral joint','costotransverse joint']},
        {en:'Mid ribs (5-8)', ar:'الأضلاع الوسطى (5-8)', structures:['rib shaft','costal cartilage','intercostal space']},
        {en:'Lower ribs (9-12)', ar:'الأضلاع السفلية (9-12)', structures:['floating rib','costal margin']}
      ]},
    { key:'sternum', en:'Sternum', ar:'عظمة القص', aliases:['breastbone'], defaultModality:'CT', thicknessNote:'2mm (ACR chest wall)',
      slices:[
        {en:'Manubrium', ar:'المقبض', structures:['manubrium','sternoclavicular joint','jugular notch']},
        {en:'Body', ar:'الجسم', structures:['sternal body','costal cartilage attachment']},
        {en:'Xiphoid process', ar:'الناتئ الخنجري', structures:['xiphoid process','xiphisternal junction']}
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
