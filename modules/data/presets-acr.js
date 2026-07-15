/* OmniRad — Presets & ACR Appropriateness Data
   Built from ACR Appropriateness Criteria + ESR iGuide (public summaries).
   ⚕️ NEEDS RADIOLOGIST REVIEW before final clinical/educational adoption.
   ────────────────────────────────────────────────────
   Categories (ACR-aligned):
     'Neuro'          🧠 head, brain, spine, cord
     'Chest'          🫁 lungs, mediastinum, airways
     'Cardiac'        🫀 heart, coronaries
     'Vascular'       🩸 aorta, arteries, veins
     'Abdomen'        🫃 liver, GI, pancreas, spleen
     'Genitourinary'  🫆 kidney, bladder, prostate, ovary, uterus
     'Musculoskeletal'🦴 bone, joints, muscle, tendon
     'Breast'         🩷 mammography, breast MRI
     'Pediatric'      🧒 pediatric-specific
     'Emergency'      🚨 acute cross-system
     'Endocrine'      🩺 thyroid, adrenal, pituitary
   Fields (extend freely):
     id, en, ar, category, region, organ, modality, view, sequence?, phase?, sliceThickness?,
     normalPath, pathCase, style, labels, labelStyle?, isEmergency?
     confidence: 'Established' | 'Emerging'
     acrScore: 1–9
     whyEn, whyAr
*/
window.OMNIRAD_CATEGORIES = [
  {id:'Neuro',           icon:'🧠', en:'Neuro',         ar:'أعصاب'},
  {id:'Chest',           icon:'🫁', en:'Chest',         ar:'صدر'},
  {id:'Cardiac',         icon:'🫀', en:'Cardiac',       ar:'قلبي'},
  {id:'Vascular',        icon:'🩸', en:'Vascular',      ar:'أوعية'},
  {id:'Abdomen',         icon:'🫃', en:'Abdomen',       ar:'بطن'},
  {id:'Genitourinary',   icon:'🫆', en:'GU / Ob-Gyn',   ar:'بولي / نسائي'},
  {id:'Musculoskeletal', icon:'🦴', en:'MSK',           ar:'عظام ومفاصل'},
  {id:'Breast',          icon:'🩷', en:'Breast',        ar:'ثدي'},
  {id:'Endocrine',       icon:'🩺', en:'Endocrine',     ar:'صمّاء'},
  {id:'Pediatric',       icon:'🧒', en:'Pediatric',     ar:'أطفال'},
  {id:'Emergency',       icon:'🚨', en:'Emergency',     ar:'طوارئ'}
];

window.OMNIRAD_PRESETS = [
  /* ═══ NEURO ═══ */
  { id:'ct-acute-stroke', category:'Neuro', isEmergency:true,
    en:'Acute stroke — non-contrast CT head', ar:'سكتة حادة — CT دماغ بلا صبغة',
    region:'Head & CNS', organ:'Brain', modality:'CT', view:'Axial', phase:'Non-contrast', sliceThickness:'5 mm',
    normalPath:'Pathological', pathCase:'Intracranial hemorrhage', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Non-contrast CT is first-line to rule out hemorrhage before thrombolysis (ACR 9/9).',
    whyAr:'CT بلا صبغة هو الخيار الأول لاستبعاد النزيف قبل حل الخثرة (ACR 9/9).' },

  { id:'mri-stroke-dwi', category:'Neuro', isEmergency:true,
    en:'Acute stroke — MRI DWI/ADC', ar:'سكتة حادة — MRI DWI/ADC',
    region:'Head & CNS', organ:'Brain', modality:'MRI', view:'Axial', sequence:'DWI', sliceThickness:'5 mm',
    normalPath:'Pathological', pathCase:'Acute infarct', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:8,
    whyEn:'DWI/ADC detects acute infarct within minutes; superior sensitivity vs CT.',
    whyAr:'DWI/ADC يكشف الاحتشاء الحاد خلال دقائق؛ حساسية أعلى من CT.' },

  { id:'mri-brain-tumor', category:'Neuro',
    en:'Brain tumor — MRI brain with contrast', ar:'ورم دماغي — MRI مع صبغة',
    region:'Head & CNS', organ:'Brain', modality:'MRI', view:'Axial', sequence:'T1 post-contrast', sliceThickness:'3 mm',
    normalPath:'Pathological', pathCase:'Intracranial mass', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Contrast-enhanced MRI is the standard for characterizing intracranial masses.',
    whyAr:'MRI بالصبغة هو المعيار لتوصيف الكتل داخل القحف.' },

  { id:'ct-sah', category:'Neuro', isEmergency:true,
    en:'Subarachnoid hemorrhage — non-contrast CT', ar:'نزيف تحت العنكبوتية — CT بلا صبغة',
    region:'Head & CNS', organ:'Brain', modality:'CT', view:'Axial', phase:'Non-contrast',
    normalPath:'Pathological', pathCase:'Subarachnoid hemorrhage', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Non-contrast CT within 6 hours has >95% sensitivity for SAH.',
    whyAr:'CT بلا صبغة خلال ٦ ساعات حساسيته >95٪ للنزف تحت العنكبوتية.' },

  { id:'mri-ms', category:'Neuro',
    en:'Multiple sclerosis — MRI brain FLAIR', ar:'التصلّب المتعدد — MRI دماغ FLAIR',
    region:'Head & CNS', organ:'Brain', modality:'MRI', view:'Axial', sequence:'FLAIR',
    normalPath:'Pathological', pathCase:'Multiple sclerosis', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'FLAIR is the primary sequence for detecting MS white-matter lesions.',
    whyAr:'FLAIR هو التسلسل الأساسي لكشف آفات المادة البيضاء في التصلّب المتعدد.' },

  { id:'mri-lumbar-disc', category:'Neuro',
    en:'Lumbar disc herniation — MRI lumbar spine', ar:'انزلاق غضروفي قطني — MRI',
    region:'Spine', organ:'Lumbar spine', modality:'MRI', view:'Sagittal', sequence:'T2', sliceThickness:'3 mm',
    normalPath:'Pathological', pathCase:'Disc herniation', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'MRI is the modality of choice for disc herniation and nerve root compression.',
    whyAr:'MRI هو الخيار الأمثل للانزلاق الغضروفي وضغط الجذور العصبية.' },

  { id:'mri-cord-compression', category:'Neuro', isEmergency:true,
    en:'Acute cord compression — MRI whole spine', ar:'ضغط نخاعي حاد — MRI عمود كامل',
    region:'Spine', organ:'Spinal cord', modality:'MRI', view:'Sagittal', sequence:'T2',
    normalPath:'Pathological', pathCase:'Cervical cord compression', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Urgent MRI whole spine is standard for suspected cord compression.',
    whyAr:'MRI عاجل للعمود الفقري كاملاً هو المعيار عند شبهة ضغط النخاع.' },

  /* ═══ CHEST ═══ */
  { id:'cxr-pneumonia', category:'Chest',
    en:'Pneumonia workup — Chest X-Ray PA', ar:'التهاب رئوي — أشعة صدر PA',
    region:'Chest', organ:'Lungs', modality:'X-Ray', view:'PA', laterality:'Bilateral',
    normalPath:'Pathological', pathCase:'Consolidation', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'PA chest radiograph is first-line for suspected community-acquired pneumonia.',
    whyAr:'أشعة الصدر PA هي الخيار الأول للالتهاب الرئوي المكتسب مجتمعياً.' },

  { id:'ct-pe', category:'Chest', isEmergency:true,
    en:'Pulmonary embolism — CT pulmonary angiography', ar:'انصمام رئوي — CTPA',
    region:'Chest', organ:'Pulmonary arteries', modality:'CT', view:'Axial', phase:'Arterial', sliceThickness:'1 mm',
    normalPath:'Pathological', pathCase:'Pulmonary embolism', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'CTPA is the reference standard for suspected acute pulmonary embolism.',
    whyAr:'CTPA هو المعيار المرجعي لتشخيص الانصمام الرئوي الحاد.' },

  { id:'ct-lung-cancer', category:'Chest',
    en:'Lung nodule / cancer — HRCT chest', ar:'عقيدة/سرطان رئة — HRCT صدر',
    region:'Chest', organ:'Lungs', modality:'CT', view:'Axial', phase:'Non-contrast', sliceThickness:'1.25 mm',
    normalPath:'Pathological', pathCase:'Lung nodule', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'HRCT is standard for lung nodule characterization and cancer staging.',
    whyAr:'HRCT هو المعيار لتوصيف العقيدات الرئوية وتحديد مرحلة السرطان.' },

  { id:'cxr-pneumothorax', category:'Chest', isEmergency:true,
    en:'Pneumothorax — Erect chest X-Ray', ar:'استرواح صدري — أشعة صدر بالوقوف',
    region:'Chest', organ:'Lungs', modality:'X-Ray', view:'PA', laterality:'Bilateral',
    normalPath:'Pathological', pathCase:'Pneumothorax', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Erect PA chest X-ray is first-line for pneumothorax detection.',
    whyAr:'أشعة صدر PA بالوقوف هي الخيار الأول لتشخيص الاسترواح الصدري.' },

  /* ═══ CARDIAC ═══ */
  { id:'cta-cad', category:'Cardiac',
    en:'Coronary artery disease — Coronary CT angiography', ar:'مرض شرايين تاجية — CT شرايين تاجية',
    region:'Chest', organ:'Coronary arteries', modality:'CT', view:'Axial', phase:'Arterial', sliceThickness:'0.625 mm',
    normalPath:'Pathological', pathCase:'Coronary artery disease', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Coronary CT angiography is highly sensitive for excluding significant CAD.',
    whyAr:'تصوير الشرايين التاجية بالـCT حساسيته عالية لاستبعاد مرض تاجي مهم.' },

  /* ═══ VASCULAR ═══ */
  { id:'ct-aorta-dissection', category:'Vascular', isEmergency:true,
    en:'Aortic dissection — CT aorta with contrast', ar:'تسلّخ أبهر — CT أبهر بالصبغة',
    region:'Chest', organ:'Thoracic aorta', modality:'CT', view:'Axial', phase:'Arterial', sliceThickness:'1 mm',
    normalPath:'Pathological', pathCase:'Aortic dissection', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'ECG-gated CT aorta is standard for suspected aortic dissection.',
    whyAr:'CT الأبهر المتزامن مع ECG هو المعيار عند شبهة تسلّخ الأبهر.' },

  { id:'us-carotid-stenosis', category:'Vascular',
    en:'Carotid stenosis — Duplex ultrasound', ar:'تضيّق سباتي — دوبلكس سونار',
    region:'Neck', organ:'Carotid arteries', modality:'Ultrasound', view:'Longitudinal',
    normalPath:'Pathological', pathCase:'Carotid stenosis', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Duplex ultrasound is first-line for extracranial carotid stenosis screening.',
    whyAr:'دوبلكس السونار هو الخيار الأول لفحص تضيّق السباتي خارج القحف.' },

  { id:'us-dvt', category:'Vascular', isEmergency:true,
    en:'Deep vein thrombosis — Compression ultrasound', ar:'خثار وريدي عميق — سونار ضاغط',
    region:'Vascular', organ:'Deep veins (DVT)', modality:'Ultrasound', view:'Transverse',
    normalPath:'Pathological', pathCase:'DVT', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Compression ultrasound is first-line for lower-extremity DVT.',
    whyAr:'السونار الضاغط هو الخيار الأول لخثار الأوردة العميقة في الأطراف السفلية.' },

  /* ═══ ABDOMEN ═══ */
  { id:'ct-appendicitis', category:'Abdomen', isEmergency:true,
    en:'Acute appendicitis — CT abdomen/pelvis with contrast', ar:'التهاب زائدة حاد — CT بطن وحوض بالصبغة',
    region:'Abdomen', organ:'Appendix', modality:'CT', view:'Axial', phase:'Portal venous', sliceThickness:'2 mm',
    normalPath:'Pathological', pathCase:'Acute appendicitis', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Contrast-enhanced CT is highly accurate for appendicitis in adults.',
    whyAr:'CT بالصبغة يتمتع بدقة عالية في تشخيص التهاب الزائدة في البالغين.' },

  { id:'us-gallstones', category:'Abdomen',
    en:'Gallstones — RUQ ultrasound', ar:'حصوات مرارة — سونار الربع الأيمن العلوي',
    region:'Abdomen', organ:'Gallbladder & biliary tree', modality:'Ultrasound', view:'Longitudinal',
    normalPath:'Pathological', pathCase:'Cholelithiasis (gallstones)', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'RUQ ultrasound is first-line — highest sensitivity for cholelithiasis, no radiation.',
    whyAr:'سونار الربع الأيمن العلوي هو الخيار الأول — أعلى حساسية لحصوات المرارة بلا إشعاع.' },

  { id:'ct-pancreatitis', category:'Abdomen',
    en:'Acute pancreatitis — CT abdomen with contrast', ar:'التهاب بنكرياس حاد — CT بطن بالصبغة',
    region:'Abdomen', organ:'Pancreas', modality:'CT', view:'Axial', phase:'Portal venous', sliceThickness:'2 mm',
    normalPath:'Pathological', pathCase:'Pancreatitis', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Contrast-enhanced CT is the imaging standard for pancreatitis severity assessment.',
    whyAr:'CT بالصبغة هو معيار التصوير لتقييم شدة التهاب البنكرياس.' },

  { id:'mri-hcc', category:'Abdomen',
    en:'Liver mass (HCC) — Multiphase MRI liver', ar:'كتلة كبد (HCC) — MRI كبد متعدد الأطوار',
    region:'Abdomen', organ:'Liver', modality:'MRI', view:'Axial', sequence:'T1 post-contrast', phase:'Arterial',
    normalPath:'Pathological', pathCase:'Liver mass / HCC', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Multiphase MRI with hepatobiliary contrast is preferred for HCC characterization (LI-RADS).',
    whyAr:'MRI متعدد الأطوار بصبغة كبد-صفراوية هو المفضّل لتوصيف HCC (LI-RADS).' },

  { id:'ct-bowel-obstruction', category:'Abdomen', isEmergency:true,
    en:'Bowel obstruction — CT abdomen with contrast', ar:'انسداد أمعاء — CT بطن بالصبغة',
    region:'Abdomen', organ:'Small intestine', modality:'CT', view:'Axial', phase:'Portal venous',
    normalPath:'Pathological', pathCase:'Bowel obstruction', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Contrast-enhanced CT identifies obstruction level, cause, and ischemia risk.',
    whyAr:'CT بالصبغة يحدد مستوى الانسداد وسببه وخطر نقص الترويّة.' },

  /* ═══ GU / OB-GYN ═══ */
  { id:'ct-renal-colic', category:'Genitourinary',
    en:'Renal colic — CT KUB (non-contrast)', ar:'مغص كلوي — CT KUB بلا صبغة',
    region:'Abdomen', organ:'Kidneys', modality:'CT', view:'Axial', phase:'Non-contrast', sliceThickness:'2 mm',
    normalPath:'Pathological', pathCase:'Renal calculi (stones)', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Non-contrast CT KUB is the reference standard for urolithiasis.',
    whyAr:'CT KUB بلا صبغة هو المعيار المرجعي لحصوات الجهاز البولي.' },

  { id:'mri-prostate', category:'Genitourinary',
    en:'Prostate cancer — Multiparametric MRI (PI-RADS)', ar:'سرطان بروستاتا — MRI متعدد المعايير (PI-RADS)',
    region:'Pelvis', organ:'Prostate', modality:'MRI', view:'Axial', sequence:'T2',
    normalPath:'Pathological', pathCase:'Prostate cancer', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Multiparametric MRI (T2 + DWI + DCE) per PI-RADS v2.1 is standard.',
    whyAr:'MRI متعدد المعايير (T2 + DWI + DCE) وفق PI-RADS v2.1 هو المعيار.' },

  { id:'us-ectopic', category:'Genitourinary', isEmergency:true,
    en:'Suspected ectopic pregnancy — Transvaginal ultrasound', ar:'شبهة حمل هاجر — سونار مهبلي',
    region:'Pelvis', organ:'Uterus', modality:'Ultrasound', view:'Transverse',
    normalPath:'Pathological', pathCase:'Ectopic pregnancy', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Transvaginal ultrasound is first-line, correlated with beta-hCG.',
    whyAr:'السونار المهبلي هو الخيار الأول مع ربطه بمستوى beta-hCG.' },

  { id:'us-testis-torsion', category:'Genitourinary', isEmergency:true,
    en:'Testicular torsion — Scrotal Doppler US', ar:'انفتال خصية — سونار دوبلر للصفن',
    region:'Pelvis', organ:'Testes & scrotum', modality:'Ultrasound', view:'Transverse',
    normalPath:'Pathological', pathCase:'Testicular torsion', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Scrotal Doppler US is time-critical: absent arterial flow confirms torsion.',
    whyAr:'سونار دوبلر للصفن حرج زمنياً: غياب التدفق الشرياني يؤكد الانفتال.' },

  /* ═══ MSK ═══ */
  { id:'xray-wrist-fracture', category:'Musculoskeletal',
    en:'Wrist fracture — X-Ray wrist PA/Lateral', ar:'كسر رسغ — أشعة رسغ PA/جانبية',
    region:'Upper Extremity', organ:'Wrist', modality:'X-Ray', view:'PA', laterality:'Right',
    normalPath:'Pathological', pathCase:'Fracture', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Two-view radiography is first-line for suspected wrist fracture.',
    whyAr:'أشعة عاديّة بمنظورين هي الخيار الأول للكسور المشتبه بها.' },

  { id:'mri-shoulder-cuff', category:'Musculoskeletal',
    en:'Rotator cuff tear — MRI shoulder', ar:'تمزّق الكفة المدوّرة — MRI كتف',
    region:'Upper Extremity', organ:'Shoulder', modality:'MRI', view:'Coronal', sequence:'PD fat-sat', laterality:'Right',
    normalPath:'Pathological', pathCase:'Rotator cuff tear', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:8,
    whyEn:'MRI PD fat-sat sequences are optimal for evaluating rotator cuff tears.',
    whyAr:'تسلسلات MRI PD fat-sat هي الأمثل لتقييم تمزّق الكفة المدوّرة.' },

  { id:'mri-knee-acl', category:'Musculoskeletal',
    en:'ACL tear — MRI knee', ar:'تمزّق الرباط الصليبي الأمامي — MRI ركبة',
    region:'Lower Extremity', organ:'Knee', modality:'MRI', view:'Sagittal', sequence:'PD fat-sat', laterality:'Right',
    normalPath:'Pathological', pathCase:'ACL tear', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'MRI is the reference standard for ACL and meniscal injuries.',
    whyAr:'MRI هو المعيار المرجعي لإصابات الرباط الصليبي والغضروف الهلالي.' },

  { id:'dexa-osteoporosis', category:'Musculoskeletal',
    en:'Osteoporosis screening — DEXA lumbar/hip', ar:'مسح هشاشة العظام — DEXA قطني/ورك',
    region:'Pelvis', organ:'Femoral neck', modality:'DEXA', view:'AP',
    normalPath:'Pathological', pathCase:'Osteoporosis', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'DEXA of lumbar spine and hip is the standard for BMD (T-score).',
    whyAr:'DEXA للعمود القطني والورك هو المعيار لقياس كثافة العظم (T-score).' },

  /* ═══ BREAST ═══ */
  { id:'mammo-screening', category:'Breast',
    en:'Screening mammography — CC/MLO bilateral', ar:'ماموغرام مسحي — CC/MLO ثنائي',
    region:'Chest', organ:'Breast', modality:'Mammography', view:'CC', laterality:'Bilateral', purpose:'Screening',
    normalPath:'Normal', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Bilateral CC + MLO views are the standard screening protocol.',
    whyAr:'منظورا CC وMLO ثنائي الجانب هما البروتوكول القياسي للمسح.' },

  { id:'us-breast-mass', category:'Breast',
    en:'Breast mass in dense breast — Targeted US', ar:'كتلة ثدي في نسيج كثيف — سونار موجّه',
    region:'Chest', organ:'Breast', modality:'Ultrasound', view:'Transverse',
    normalPath:'Pathological', pathCase:'Breast mass', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Targeted US is essential in dense breasts to characterize palpable masses.',
    whyAr:'السونار الموجّه أساسي في الثدي الكثيف لتوصيف الكتل المحسوسة.' },

  /* ═══ ENDOCRINE ═══ */
  { id:'us-thyroid-nodule', category:'Endocrine',
    en:'Thyroid nodule — Neck ultrasound (TI-RADS)', ar:'عقيدة درقية — سونار الرقبة (TI-RADS)',
    region:'Neck', organ:'Thyroid gland', modality:'Ultrasound', view:'Transverse',
    normalPath:'Pathological', pathCase:'Thyroid nodule', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Ultrasound with TI-RADS scoring is the primary modality for thyroid nodules.',
    whyAr:'السونار مع تصنيف TI-RADS هو الأداة الأساسية لعقيدات الدرق.' },

  { id:'ct-adrenal', category:'Endocrine',
    en:'Adrenal incidentaloma — CT adrenal washout', ar:'ورم كظر عرضي — CT مع دراسة الغسل',
    region:'Abdomen', organ:'Adrenal glands', modality:'CT', view:'Axial', phase:'Non-contrast',
    normalPath:'Pathological', pathCase:'Adrenal mass', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Adrenal washout CT differentiates adenoma from metastasis.',
    whyAr:'CT مع دراسة الغسل يميّز الورم الغدي عن النقيلي.' },

  /* ═══ PEDIATRIC ═══ */
  { id:'us-rlq-child', category:'Pediatric',
    en:'Acute appendicitis (child) — US right lower quadrant', ar:'التهاب زائدة (طفل) — سونار الربع الأيمن السفلي',
    region:'Abdomen', organ:'Appendix', modality:'Ultrasound', view:'Longitudinal', age:'Pediatric',
    normalPath:'Pathological', pathCase:'Acute appendicitis', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:8,
    whyEn:'Ultrasound is preferred in children to avoid ionizing radiation.',
    whyAr:'السونار مفضّل في الأطفال لتجنّب الإشعاع المؤيّن.' },

  { id:'us-pyloric-stenosis', category:'Pediatric',
    en:'Pyloric stenosis (infant) — Abdominal ultrasound', ar:'ضيق البواب (رضيع) — سونار البطن',
    region:'Abdomen', organ:'Stomach', modality:'Ultrasound', view:'Longitudinal', age:'Pediatric',
    normalPath:'Pathological', pathCase:'Pyloric stenosis', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Ultrasound is diagnostic: pyloric muscle thickness >3 mm, length >15 mm.',
    whyAr:'السونار تشخيصي: سماكة عضلة البواب >٣ مم، طول >١٥ مم.' },

  { id:'us-hip-dysplasia', category:'Pediatric',
    en:'Developmental hip dysplasia — Infant hip US (Graf)', ar:'خلع الورك الولادي — سونار ورك رضيع (Graf)',
    region:'Pelvis', organ:'Hip joint', modality:'Ultrasound', view:'Coronal', age:'Pediatric', laterality:'Bilateral',
    normalPath:'Pathological', pathCase:'Developmental hip dysplasia', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'Graf-method US screens neonatal hips before ossification (<4 months).',
    whyAr:'طريقة Graf بالسونار تفحص الورك الوليدي قبل التعظّم (<٤ أشهر).' },

  /* ═══ ONCOLOGY / STAGING ═══ */
  { id:'pet-lymphoma', category:'Chest',
    en:'Lymphoma staging — PET/CT whole-body', ar:'مرحلة اللمفوما — PET/CT كامل الجسم',
    region:'Chest', organ:'Mediastinal lymph nodes', modality:'PET/CT', view:'Axial', tracer:'F-18 FDG',
    normalPath:'Pathological', pathCase:'Lymphoma', style:'Realistic radiographic scan', labels:'No labels',
    confidence:'Established', acrScore:9,
    whyEn:'FDG-PET/CT is standard for staging and response assessment in lymphoma.',
    whyAr:'FDG-PET/CT معيار لتحديد مرحلة اللمفوما وتقييم الاستجابة.' }
];
/* ACR Appropriateness — modalities ranked per pathology.
   Used by Case Builder to show recommended modalities for a selected pathology. */
window.OMNIRAD_ACR = {
  'Acute infarct':          [['MRI',9],['CT',7]],
  'Intracranial hemorrhage':[['CT',9],['MRI',7]],
  'Subarachnoid hemorrhage':[['CT',9],['CT angiography',8],['MRI',6]],
  'Cerebral aneurysm':      [['CT angiography',9],['MRI',7],['Angiography',8]],
  'Intracranial mass':      [['MRI',9],['CT',6]],
  'Meningioma':             [['MRI',9],['CT',6]],
  'Glioma':                 [['MRI',9]],
  'Pituitary adenoma':      [['MRI',9]],
  'Multiple sclerosis':     [['MRI',9]],
  'Hydrocephalus':          [['MRI',8],['CT',8]],
  'Skull fracture':         [['CT',9],['X-Ray',5]],
  'Sinusitis':              [['CT',9],['MRI',6],['X-Ray',4]],
  'Cervical cord compression':[['MRI',9],['CT',6]],
  'Spinal metastasis':      [['MRI',9],['CT',7]],
  'Consolidation':          [['X-Ray',9],['CT',8]],
  'Pulmonary embolism':     [['CT',9],['Nuclear Medicine',7]],
  'Pneumothorax':           [['X-Ray',9],['CT',8],['Ultrasound',7]],
  'Pleural effusion':       [['Ultrasound',9],['X-Ray',8],['CT',8]],
  'Lung nodule':            [['CT',9],['X-Ray',5]],
  'Bronchiectasis':         [['CT',9]],
  'Emphysema / COPD':       [['CT',8],['X-Ray',7]],
  'Interstitial lung disease':[['CT',9]],
  'Acute appendicitis':     [['CT',9],['Ultrasound',8]],
  'Cholelithiasis (gallstones)':[['Ultrasound',9],['MRI',6],['CT',5]],
  'Cholecystitis':          [['Ultrasound',9],['MRI',7]],
  'Pancreatitis':           [['CT',9],['MRI',8]],
  'Liver mass / HCC':       [['MRI',9],['CT',8],['Ultrasound',7]],
  'Hepatic hemangioma':     [['MRI',9],['CT',7],['Ultrasound',7]],
  'Splenic injury (trauma)':[['CT',9],['Ultrasound',6]],
  'Bowel obstruction':      [['CT',9],['X-Ray',7]],
  'Diverticulitis':         [['CT',9]],
  'Aortic aneurysm':        [['CT',9],['Ultrasound',7],['MRI',7]],
  'Aortic dissection':      [['CT',9],['MRI',7]],
  'Disc herniation':        [['MRI',9],['CT',5]],
  'Fracture':               [['X-Ray',9],['CT',7],['MRI',6]],
  'Renal calculi (stones)': [['CT',9],['Ultrasound',7],['X-Ray',5]],
  'Renal mass':             [['CT',9],['MRI',8],['Ultrasound',7]],
  'Hydronephrosis':         [['Ultrasound',9],['CT',8]],
  'Bladder tumor':          [['CT',8],['MRI',8]],
  'Prostate cancer':        [['MRI',9]],
  'Ovarian mass':           [['Ultrasound',9],['MRI',8]],
  'Uterine fibroid':        [['Ultrasound',9],['MRI',8]],
  'Endometriosis':          [['MRI',9],['Ultrasound',7]],
  'Rotator cuff tear':      [['MRI',8],['Ultrasound',7]],
  'Meniscal tear':          [['MRI',9]],
  'ACL tear':               [['MRI',9]],
  'Osteoarthritis':         [['X-Ray',9],['MRI',7]],
  'Osteomyelitis':          [['MRI',9],['X-Ray',6],['Nuclear Medicine',7]],
  'Bone metastases':        [['PET/CT',9],['Nuclear Medicine',8],['MRI',8]],
  'Osteoporosis':           [['DEXA',9]],
  'Thyroid nodule':         [['Ultrasound',9]],
  'Lymphoma':               [['PET/CT',9],['CT',7],['MRI',6]],
  'DVT':                    [['Ultrasound',9],['CT',6]],
  'Breast mass':            [['Mammography',9],['Ultrasound',8],['MRI',7]],
  'Microcalcifications':    [['Mammography',9]],
  /* Head & Neck (extra) */
  'Traumatic brain injury': [['CT',9],['MRI',7]],
  'Concussion':             [['CT',7],['MRI',6]],
  'Chronic subdural hematoma':[['CT',9],['MRI',7]],
  'Epidural hematoma':      [['CT',9]],
  'Cavernous malformation': [['MRI',9]],
  'Arteriovenous malformation (AVM)':[['MRI',8],['Angiography',9],['CT angiography',7]],
  'Trigeminal neuralgia':   [['MRI',9]],
  'Acoustic neuroma (vestibular schwannoma)':[['MRI',9]],
  'Cholesteatoma':          [['CT',9],['MRI',7]],
  'Orbital cellulitis':     [['CT',9],['MRI',7]],
  'Retinoblastoma':         [['MRI',9],['Ultrasound',7]],
  'Salivary stone (sialolithiasis)':[['Ultrasound',8],['CT',9]],
  'Parotid mass':           [['MRI',9],['Ultrasound',7]],
  'Thyroid cancer':         [['Ultrasound',9],['CT',6]],
  'Parathyroid adenoma':    [['Ultrasound',8],['Nuclear Medicine',9]],
  /* Chest (extra) */
  'Lung cancer':            [['CT',9],['PET/CT',9]],
  'Mesothelioma':           [['CT',9],['PET/CT',8],['MRI',7]],
  'Cardiomegaly':           [['X-Ray',8],['MRI',9]],
  'Pericardial effusion':   [['Ultrasound',9],['CT',7],['MRI',7]],
  'Coronary artery disease':[['CT angiography',9],['Angiography',9]],
  'Aortic coarctation':     [['MRI',9],['CT',8]],
  'Tuberculosis':           [['X-Ray',8],['CT',9]],
  /* Abdomen (extra) */
  'Fatty liver (steatosis)':[['Ultrasound',9],['MRI',9]],
  'Cirrhosis':              [['Ultrasound',8],['MRI',9],['CT',8]],
  'Hepatic abscess':        [['Ultrasound',8],['CT',9]],
  'Pancreatic cancer':      [['MRI',9],['CT',9]],
  'Splenomegaly':           [['Ultrasound',9],['CT',8]],
  'Gastric ulcer / mass':   [['Endoscopy',9],['CT',7]],
  'Colon cancer':           [['CT',9],['MRI',8],['Endoscopy',9]],
  'Inflammatory bowel disease':[['MRI',9],['CT',8]],
  'Intussusception':        [['Ultrasound',9],['CT',7]],
  'Volvulus':               [['CT',9],['X-Ray',7]],
  'Perforation (free air)': [['X-Ray',8],['CT',9]],
  'Ascites':                [['Ultrasound',9],['CT',8]],
  /* Vascular (extra) */
  'Carotid stenosis':       [['Ultrasound',9],['CT angiography',9],['MRI',8]],
  'Renal artery stenosis':  [['CT angiography',9],['Ultrasound',8],['MRI',8]],
  'Peripheral arterial disease':[['CT angiography',9],['Ultrasound',8],['Angiography',9]],
  'Portal vein thrombosis': [['Ultrasound',9],['CT',9],['MRI',8]],
  /* Urogenital (extra) */
  'Testicular torsion':     [['Ultrasound',9]],
  'Testicular tumor':       [['Ultrasound',9],['MRI',7]],
  'Epididymo-orchitis':     [['Ultrasound',9]],
  'Pyelonephritis':         [['CT',9],['Ultrasound',7]],
  'Adrenal mass':           [['CT',9],['MRI',9]],
  /* Obstetric */
  'Ectopic pregnancy':      [['Ultrasound',9]],
  'Placenta previa':        [['Ultrasound',9],['MRI',7]],
  'Fetal anomaly screening':[['Ultrasound',9]],
  /* Pelvis (extra) */
  'Pelvic inflammatory disease':[['Ultrasound',9],['MRI',8]],
  'Ovarian torsion':        [['Ultrasound',9],['MRI',7]],
  /* MSK (extra) */
  'Gout':                   [['X-Ray',8],['Ultrasound',8],['CT',7]],
  'Rheumatoid arthritis':   [['X-Ray',8],['MRI',9],['Ultrasound',8]],
  'Ankylosing spondylitis': [['X-Ray',8],['MRI',9]],
  'Avascular necrosis':     [['MRI',9],['X-Ray',7]],
  'Stress fracture':        [['MRI',9],['X-Ray',6],['Nuclear Medicine',7]],
  'Bone tumor':             [['MRI',9],['X-Ray',8],['CT',7]],
  'Muscle tear':            [['MRI',9],['Ultrasound',8]],
  'Tendon rupture':         [['MRI',9],['Ultrasound',9]],
  'Achilles tendinopathy':  [['Ultrasound',9],['MRI',8]],
  'Ligament injury':        [['MRI',9],['Ultrasound',7]],
  'Osteoid osteoma':        [['CT',9],['MRI',7]],
  /* Endocrine / Metabolic */
  'Pheochromocytoma':       [['MRI',9],['CT',9],['Nuclear Medicine',8]],
  /* Pediatric-specific */
  'Pyloric stenosis':       [['Ultrasound',9]],
  'Developmental hip dysplasia':[['Ultrasound',9],['X-Ray',7]],
  'Neonatal hydrocephalus': [['Ultrasound',9],['MRI',8]]
};
window.OMNIRAD_ACR_LABEL = function(score, isAr){
  if(score>=7) return isAr?'الأنسب عادةً':'Usually Appropriate';
  if(score>=4) return isAr?'قد يكون مناسباً':'May Be Appropriate';
  return isAr?'غير مناسب عادةً':'Usually Not Appropriate';
};

/* Pathology → category (aligns with OMNIRAD_CATEGORIES).
   Uncategorized pathologies fall into 'Other'. */
window.OMNIRAD_ACR_CAT = {
  // Neuro
  'Acute infarct':'Neuro','Intracranial hemorrhage':'Neuro','Subarachnoid hemorrhage':'Neuro','Cerebral aneurysm':'Neuro','Intracranial mass':'Neuro','Meningioma':'Neuro','Glioma':'Neuro','Pituitary adenoma':'Neuro','Multiple sclerosis':'Neuro','Hydrocephalus':'Neuro','Skull fracture':'Neuro','Sinusitis':'Neuro','Cervical cord compression':'Neuro','Spinal metastasis':'Neuro','Disc herniation':'Neuro','Traumatic brain injury':'Neuro','Concussion':'Neuro','Chronic subdural hematoma':'Neuro','Epidural hematoma':'Neuro','Cavernous malformation':'Neuro','Arteriovenous malformation (AVM)':'Neuro','Trigeminal neuralgia':'Neuro','Acoustic neuroma (vestibular schwannoma)':'Neuro','Cholesteatoma':'Neuro','Orbital cellulitis':'Neuro','Retinoblastoma':'Neuro',
  // Chest
  'Consolidation':'Chest','Pulmonary embolism':'Chest','Pneumothorax':'Chest','Pleural effusion':'Chest','Lung nodule':'Chest','Bronchiectasis':'Chest','Emphysema / COPD':'Chest','Interstitial lung disease':'Chest','Lung cancer':'Chest','Mesothelioma':'Chest','Tuberculosis':'Chest',
  // Cardiac
  'Cardiomegaly':'Cardiac','Pericardial effusion':'Cardiac','Coronary artery disease':'Cardiac','Aortic coarctation':'Cardiac',
  // Vascular
  'Aortic aneurysm':'Vascular','Aortic dissection':'Vascular','Carotid stenosis':'Vascular','Renal artery stenosis':'Vascular','Peripheral arterial disease':'Vascular','Portal vein thrombosis':'Vascular','DVT':'Vascular',
  // Abdomen
  'Acute appendicitis':'Abdomen','Cholelithiasis (gallstones)':'Abdomen','Cholecystitis':'Abdomen','Pancreatitis':'Abdomen','Liver mass / HCC':'Abdomen','Hepatic hemangioma':'Abdomen','Fatty liver (steatosis)':'Abdomen','Cirrhosis':'Abdomen','Hepatic abscess':'Abdomen','Pancreatic cancer':'Abdomen','Splenic injury (trauma)':'Abdomen','Splenomegaly':'Abdomen','Gastric ulcer / mass':'Abdomen','Colon cancer':'Abdomen','Inflammatory bowel disease':'Abdomen','Intussusception':'Abdomen','Volvulus':'Abdomen','Perforation (free air)':'Abdomen','Ascites':'Abdomen','Bowel obstruction':'Abdomen','Diverticulitis':'Abdomen',
  // GU / Ob-Gyn
  'Renal calculi (stones)':'Genitourinary','Renal mass':'Genitourinary','Hydronephrosis':'Genitourinary','Bladder tumor':'Genitourinary','Prostate cancer':'Genitourinary','Ovarian mass':'Genitourinary','Uterine fibroid':'Genitourinary','Endometriosis':'Genitourinary','Testicular torsion':'Genitourinary','Testicular tumor':'Genitourinary','Epididymo-orchitis':'Genitourinary','Pyelonephritis':'Genitourinary','Ectopic pregnancy':'Genitourinary','Placenta previa':'Genitourinary','Fetal anomaly screening':'Genitourinary','Pelvic inflammatory disease':'Genitourinary','Ovarian torsion':'Genitourinary',
  // MSK
  'Fracture':'Musculoskeletal','Rotator cuff tear':'Musculoskeletal','Meniscal tear':'Musculoskeletal','ACL tear':'Musculoskeletal','Osteoarthritis':'Musculoskeletal','Osteomyelitis':'Musculoskeletal','Bone metastases':'Musculoskeletal','Osteoporosis':'Musculoskeletal','Gout':'Musculoskeletal','Rheumatoid arthritis':'Musculoskeletal','Ankylosing spondylitis':'Musculoskeletal','Avascular necrosis':'Musculoskeletal','Stress fracture':'Musculoskeletal','Bone tumor':'Musculoskeletal','Muscle tear':'Musculoskeletal','Tendon rupture':'Musculoskeletal','Achilles tendinopathy':'Musculoskeletal','Ligament injury':'Musculoskeletal','Osteoid osteoma':'Musculoskeletal',
  // Breast
  'Breast mass':'Breast','Microcalcifications':'Breast',
  // Endocrine
  'Thyroid nodule':'Endocrine','Thyroid cancer':'Endocrine','Parathyroid adenoma':'Endocrine','Adrenal mass':'Endocrine','Pheochromocytoma':'Endocrine','Salivary stone (sialolithiasis)':'Endocrine','Parotid mass':'Endocrine',
  // Pediatric
  'Pyloric stenosis':'Pediatric','Developmental hip dysplasia':'Pediatric','Neonatal hydrocephalus':'Pediatric',
  // Onco (grouped under nearest region)
  'Lymphoma':'Chest'
};
