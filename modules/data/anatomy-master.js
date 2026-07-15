/* ═══════════════════════════════════════════════════════════════════════
 *  OmniRad — Unified Anatomical Master
 *  ────────────────────────────────────────────────────────────────────
 *  Single source of truth for anatomical terminology across the entire
 *  platform (Studio, Atlas, Comparison, Review, Presets, Search).
 *
 *  Reference frameworks:
 *    • Terminologia Anatomica (TA2)  — IFAA / WHO, 2019
 *      https://ta2viewer.openanatomy.org
 *    • RadLex Radiology Lexicon      — RSNA
 *      https://www.rsna.org/practice-tools/data-tools-and-standards/radlex-radiology-lexicon
 *    • Arabic terminology            — Unified Medical Dictionary,
 *      WHO EMRO / Council of Arab Ministers of Health (7th ed.)
 *
 *  Data model:
 *    - regions: 9 canonical anatomical divisions (TA2-aligned)
 *    - structures[]: { id, en, ar, region, parent, rank, aliases[] }
 *        id       — stable slug used in DB (never renamed)
 *        rank     — 'organ' (top-level) | 'substructure' | 'compartment'
 *        parent   — id of parent organ (empty for organs)
 *        aliases  — legacy names accepted for import/migration
 *
 *  Every consumer MUST read from this file. Do NOT duplicate anatomical
 *  vocabulary anywhere else in the codebase.
 * ═══════════════════════════════════════════════════════════════════════ */

(function(){
'use strict';

const REGIONS = [
  // Region labels aligned to DICOM CID 4031 + LOINC/RSNA Playbook "Region Imaged" + RadLex.
  // IDs are immutable slugs (DB keys) — only display labels change. See supabase/region-alignment-migration.sql
  { id:'head-cns',   en:'Head & Neck',          ar:'الرأس والرقبة',            order:1 },
  { id:'chest',      en:'Chest',                ar:'الصدر',                    order:2 },
  { id:'cardio',     en:'Cardiovascular System', ar:'الجهاز القلبي الوعائي',   order:3 },
  { id:'abdomen',    en:'Abdomen',              ar:'البطن',                    order:4 },
  { id:'pelvis',     en:'Pelvis',               ar:'الحوض',                    order:5 },
  { id:'spine',      en:'Spine',                ar:'العمود الفقري',            order:6 },
  { id:'upper-limb', en:'Upper Extremity',      ar:'الطرف العلوي',             order:7 },
  { id:'lower-limb', en:'Lower Extremity',      ar:'الطرف السفلي',             order:8 },
  { id:'breast',     en:'Breast',               ar:'الثدي',                    order:9 }
];

const STRUCTURES = [
  /* ─────── Head & Neck / CNS ─────── */
  { id:'brain',              en:'Brain',                     ar:'الدماغ',                    region:'head-cns', parent:'',      rank:'organ', aliases:['Cerebrum','Cerebral hemispheres'] },
  { id:'cerebrum',           en:'Cerebrum',                  ar:'المخ',                      region:'head-cns', parent:'brain', rank:'substructure' },
  { id:'cerebellum',         en:'Cerebellum',                ar:'المخيخ',                    region:'head-cns', parent:'brain', rank:'substructure' },
  { id:'brainstem',          en:'Brainstem',                 ar:'جذع الدماغ',                region:'head-cns', parent:'brain', rank:'substructure' },
  { id:'midbrain',           en:'Midbrain',                  ar:'الدماغ المتوسط',            region:'head-cns', parent:'brainstem', rank:'substructure' },
  { id:'pons',               en:'Pons',                      ar:'الجسر',                     region:'head-cns', parent:'brainstem', rank:'substructure' },
  { id:'medulla',            en:'Medulla oblongata',         ar:'النخاع المستطيل',           region:'head-cns', parent:'brainstem', rank:'substructure' },
  { id:'frontal-lobe',       en:'Frontal lobe',              ar:'الفص الجبهي',               region:'head-cns', parent:'cerebrum',  rank:'substructure' },
  { id:'parietal-lobe',      en:'Parietal lobe',             ar:'الفص الجداري',              region:'head-cns', parent:'cerebrum',  rank:'substructure' },
  { id:'temporal-lobe',      en:'Temporal lobe',             ar:'الفص الصدغي',               region:'head-cns', parent:'cerebrum',  rank:'substructure' },
  { id:'occipital-lobe',     en:'Occipital lobe',            ar:'الفص القذالي',              region:'head-cns', parent:'cerebrum',  rank:'substructure' },
  { id:'insula',             en:'Insular lobe',              ar:'الجزيرة',                   region:'head-cns', parent:'cerebrum',  rank:'substructure' },
  { id:'thalamus',           en:'Thalamus',                  ar:'المهاد',                    region:'head-cns', parent:'cerebrum',  rank:'substructure' },
  { id:'hypothalamus',       en:'Hypothalamus',              ar:'الوطاء',                    region:'head-cns', parent:'brain',     rank:'substructure' },
  { id:'basal-ganglia',      en:'Basal ganglia',             ar:'العقد القاعدية',            region:'head-cns', parent:'cerebrum',  rank:'substructure' },
  { id:'corpus-callosum',    en:'Corpus callosum',           ar:'الجسم الثفني',              region:'head-cns', parent:'cerebrum',  rank:'substructure' },
  { id:'ventricular-system', en:'Ventricular system',        ar:'الجهاز البطيني',            region:'head-cns', parent:'brain',     rank:'compartment' },
  { id:'pituitary',          en:'Pituitary gland',           ar:'الغدة النخامية',            region:'head-cns', parent:'',          rank:'organ' },
  { id:'sella',              en:'Sella turcica',             ar:'السرج التركي',              region:'head-cns', parent:'',          rank:'substructure' },
  { id:'skull',              en:'Skull',                     ar:'الجمجمة',                   region:'head-cns', parent:'',          rank:'organ' },
  { id:'facial-bones',       en:'Facial bones',              ar:'عظام الوجه',                region:'head-cns', parent:'skull',     rank:'substructure' },
  { id:'orbits',             en:'Orbits & eye',              ar:'المحجران والعين',           region:'head-cns', parent:'',          rank:'organ', aliases:['Orbit','Eyeball','Globe'] },
  { id:'paranasal-sinuses',  en:'Paranasal sinuses',         ar:'الجيوب جانب الأنفية',       region:'head-cns', parent:'',          rank:'organ' },
  { id:'temporal-bone',      en:'Temporal bone',             ar:'العظم الصدغي',              region:'head-cns', parent:'skull',     rank:'substructure' },
  { id:'internal-auditory',  en:'Internal auditory canal',   ar:'القناة السمعية الباطنة',    region:'head-cns', parent:'temporal-bone', rank:'substructure' },
  { id:'meninges',           en:'Meninges',                  ar:'السحايا',                   region:'head-cns', parent:'',          rank:'compartment' },
  { id:'nasopharynx',        en:'Nasopharynx',               ar:'البلعوم الأنفي',            region:'head-cns', parent:'',          rank:'organ' },
  { id:'oropharynx',         en:'Oropharynx',                ar:'البلعوم الفموي',            region:'head-cns', parent:'',          rank:'organ' },
  { id:'larynx',             en:'Larynx',                    ar:'الحنجرة',                   region:'head-cns', parent:'',          rank:'organ' },
  { id:'thyroid',            en:'Thyroid gland',             ar:'الغدة الدرقية',             region:'head-cns', parent:'',          rank:'organ' },
  { id:'parathyroid',        en:'Parathyroid glands',        ar:'الغدد جار الدرقية',         region:'head-cns', parent:'',          rank:'organ' },
  { id:'salivary-glands',    en:'Salivary glands',           ar:'الغدد اللعابية',            region:'head-cns', parent:'',          rank:'organ' },
  { id:'cervical-lymph',     en:'Cervical lymph nodes',      ar:'العقد اللمفية العنقية',     region:'head-cns', parent:'',          rank:'organ' },
  { id:'carotid-space',      en:'Carotid space',             ar:'الحيّز السباتي',            region:'head-cns', parent:'',          rank:'compartment' },

  /* ─────── Chest / Thorax ─────── */
  { id:'lungs',              en:'Lungs',                     ar:'الرئتان',                   region:'chest', parent:'',      rank:'organ' },
  { id:'right-lung',         en:'Right lung',                ar:'الرئة اليمنى',              region:'chest', parent:'lungs', rank:'substructure' },
  { id:'left-lung',          en:'Left lung',                 ar:'الرئة اليسرى',              region:'chest', parent:'lungs', rank:'substructure' },
  { id:'trachea',            en:'Trachea',                   ar:'الرغامى',                   region:'chest', parent:'',      rank:'organ' },
  { id:'bronchi',            en:'Bronchi',                   ar:'القصبات',                   region:'chest', parent:'',      rank:'organ' },
  { id:'pleura',             en:'Pleura',                    ar:'الجنبة',                    region:'chest', parent:'',      rank:'compartment' },
  { id:'mediastinum',        en:'Mediastinum',               ar:'المنصف',                    region:'chest', parent:'',      rank:'compartment' },
  { id:'thymus',             en:'Thymus',                    ar:'الغدة الزعترية',            region:'chest', parent:'',      rank:'organ' },
  { id:'diaphragm',          en:'Diaphragm',                 ar:'الحجاب الحاجز',             region:'chest', parent:'',      rank:'organ' },
  { id:'chest-wall',         en:'Chest wall',                ar:'جدار الصدر',                region:'chest', parent:'',      rank:'compartment' },
  { id:'ribs',               en:'Ribs',                      ar:'الأضلاع',                   region:'chest', parent:'',      rank:'substructure' },
  { id:'clavicle',           en:'Clavicle',                  ar:'الترقوة',                   region:'chest', parent:'',      rank:'substructure' },
  { id:'mediastinal-lymph',  en:'Mediastinal lymph nodes',   ar:'العقد اللمفية المنصفية',    region:'chest', parent:'mediastinum', rank:'substructure' },
  { id:'esophagus',          en:'Esophagus',                 ar:'المريء',                    region:'chest', parent:'',      rank:'organ' },

  /* ─────── Cardiovascular ─────── */
  { id:'heart',              en:'Heart',                     ar:'القلب',                     region:'cardio', parent:'', rank:'organ' },
  { id:'coronary-arteries',  en:'Coronary arteries',         ar:'الشرايين التاجية',          region:'cardio', parent:'heart', rank:'substructure' },
  { id:'thoracic-aorta',     en:'Thoracic aorta',            ar:'الأبهر الصدري',             region:'cardio', parent:'', rank:'organ' },
  { id:'abdominal-aorta',    en:'Abdominal aorta',           ar:'الأبهر البطني',             region:'cardio', parent:'', rank:'organ' },
  { id:'aortic-arch',        en:'Aortic arch',               ar:'قوس الأبهر',                region:'cardio', parent:'thoracic-aorta', rank:'substructure' },
  { id:'pulmonary-arteries', en:'Pulmonary arteries',        ar:'الشرايين الرئوية',          region:'cardio', parent:'', rank:'organ' },
  { id:'carotid-arteries',   en:'Carotid arteries',          ar:'الشرايين السباتية',         region:'cardio', parent:'', rank:'organ' },
  { id:'circle-of-willis',   en:'Circle of Willis',          ar:'دارة ويليس',                region:'cardio', parent:'', rank:'organ' },
  { id:'renal-arteries',     en:'Renal arteries',            ar:'الشرايين الكلوية',          region:'cardio', parent:'abdominal-aorta', rank:'substructure' },
  { id:'mesenteric',         en:'Mesenteric arteries',       ar:'الشرايين المساريقية',       region:'cardio', parent:'abdominal-aorta', rank:'substructure' },
  { id:'iliac-arteries',     en:'Iliac arteries',            ar:'الشرايين الحرقفية',         region:'cardio', parent:'abdominal-aorta', rank:'substructure' },
  { id:'peripheral-arteries',en:'Peripheral arteries',       ar:'شرايين الأطراف',            region:'cardio', parent:'', rank:'organ' },
  { id:'ivc',                en:'Inferior vena cava',        ar:'الوريد الأجوف السفلي',      region:'cardio', parent:'', rank:'organ' },
  { id:'portal-venous',      en:'Portal venous system',      ar:'الجهاز البابي الوريدي',     region:'cardio', parent:'', rank:'organ' },
  { id:'deep-veins',         en:'Deep veins (DVT territory)',ar:'الأوردة العميقة',           region:'cardio', parent:'', rank:'organ', aliases:['Deep veins (DVT)'] },

  /* ─────── Abdomen ─────── */
  { id:'liver',              en:'Liver',                     ar:'الكبد',                     region:'abdomen', parent:'', rank:'organ' },
  { id:'hepatic-lobes',      en:'Hepatic lobes',             ar:'فصوص الكبد',                region:'abdomen', parent:'liver', rank:'substructure' },
  { id:'gallbladder',        en:'Gallbladder',               ar:'المرارة',                   region:'abdomen', parent:'', rank:'organ', aliases:['Gallbladder & biliary tree'] },
  { id:'biliary-tree',       en:'Biliary tree',              ar:'الشجرة الصفراوية',          region:'abdomen', parent:'', rank:'organ' },
  { id:'pancreas',           en:'Pancreas',                  ar:'البنكرياس',                 region:'abdomen', parent:'', rank:'organ' },
  { id:'spleen',             en:'Spleen',                    ar:'الطحال',                    region:'abdomen', parent:'', rank:'organ' },
  { id:'stomach',            en:'Stomach',                   ar:'المعدة',                    region:'abdomen', parent:'', rank:'organ' },
  { id:'duodenum',           en:'Duodenum',                  ar:'الاثنا عشر',                region:'abdomen', parent:'', rank:'organ' },
  { id:'small-bowel',        en:'Small bowel',               ar:'الأمعاء الدقيقة',           region:'abdomen', parent:'', rank:'organ', aliases:['Small intestine'] },
  { id:'colon',              en:'Colon',                     ar:'القولون',                   region:'abdomen', parent:'', rank:'organ', aliases:['Large intestine'] },
  { id:'appendix',           en:'Appendix',                  ar:'الزائدة الدودية',           region:'abdomen', parent:'colon', rank:'substructure' },
  { id:'rectum',             en:'Rectum',                    ar:'المستقيم',                  region:'abdomen', parent:'', rank:'organ' },
  { id:'kidneys',            en:'Kidneys',                   ar:'الكليتان',                  region:'abdomen', parent:'', rank:'organ' },
  { id:'right-kidney',       en:'Right kidney',              ar:'الكلية اليمنى',             region:'abdomen', parent:'kidneys', rank:'substructure' },
  { id:'left-kidney',        en:'Left kidney',               ar:'الكلية اليسرى',             region:'abdomen', parent:'kidneys', rank:'substructure' },
  { id:'ureters',            en:'Ureters',                   ar:'الحالبان',                  region:'abdomen', parent:'', rank:'organ' },
  { id:'adrenal-glands',     en:'Adrenal glands',            ar:'الغدد الكظرية',             region:'abdomen', parent:'', rank:'organ' },
  { id:'peritoneum',         en:'Peritoneum',                ar:'الصفاق',                    region:'abdomen', parent:'', rank:'compartment' },
  { id:'mesentery',          en:'Mesentery',                 ar:'المساريقا',                 region:'abdomen', parent:'', rank:'compartment' },
  { id:'abdominal-lymph',    en:'Abdominal lymph nodes',     ar:'العقد اللمفية البطنية',     region:'abdomen', parent:'', rank:'organ' },

  /* ─────── Pelvis ─────── */
  { id:'bladder',            en:'Urinary bladder',           ar:'المثانة البولية',           region:'pelvis', parent:'', rank:'organ', aliases:['Bladder'] },
  { id:'urethra',            en:'Urethra',                   ar:'الإحليل',                   region:'pelvis', parent:'', rank:'organ' },
  { id:'prostate',           en:'Prostate',                  ar:'البروستاتة',                region:'pelvis', parent:'', rank:'organ' },
  { id:'testes',             en:'Testes & scrotum',          ar:'الخصيتان والصفن',           region:'pelvis', parent:'', rank:'organ' },
  { id:'penis',              en:'Penis',                     ar:'القضيب',                    region:'pelvis', parent:'', rank:'organ' },
  { id:'uterus',             en:'Uterus',                    ar:'الرحم',                     region:'pelvis', parent:'', rank:'organ' },
  { id:'ovaries',            en:'Ovaries',                   ar:'المبيضان',                  region:'pelvis', parent:'', rank:'organ' },
  { id:'vagina',             en:'Vagina',                    ar:'المهبل',                    region:'pelvis', parent:'', rank:'organ' },
  { id:'pelvic-floor',       en:'Pelvic floor',              ar:'قاع الحوض',                 region:'pelvis', parent:'', rank:'compartment' },
  { id:'hip-joint',          en:'Hip joint',                 ar:'مفصل الورك',                region:'pelvis', parent:'', rank:'organ', aliases:['Hip joints'] },
  { id:'sacroiliac',         en:'Sacroiliac joints',         ar:'المفاصل العجزية الحرقفية',  region:'pelvis', parent:'', rank:'organ' },
  { id:'inguinal-region',    en:'Inguinal region',           ar:'المنطقة الأربية',           region:'pelvis', parent:'', rank:'compartment' },
  { id:'pelvic-lymph',       en:'Pelvic lymph nodes',        ar:'العقد اللمفية الحوضية',     region:'pelvis', parent:'', rank:'organ' },
  { id:'femoral-neck',       en:'Femoral neck',              ar:'عنق الفخذ',                 region:'pelvis', parent:'hip-joint', rank:'substructure' },

  /* ─────── Spine ─────── */
  { id:'cervical-spine',     en:'Cervical spine',            ar:'العمود الرقبي',             region:'spine', parent:'', rank:'organ' },
  { id:'thoracic-spine',     en:'Thoracic spine',            ar:'العمود الصدري',             region:'spine', parent:'', rank:'organ' },
  { id:'lumbar-spine',       en:'Lumbar spine',              ar:'العمود القطني',             region:'spine', parent:'', rank:'organ' },
  { id:'sacrum',             en:'Sacrum',                    ar:'العجز',                     region:'spine', parent:'', rank:'organ' },
  { id:'coccyx',             en:'Coccyx',                    ar:'العصعص',                    region:'spine', parent:'', rank:'organ' },
  { id:'whole-spine',        en:'Whole spine',               ar:'العمود الفقري كامل',        region:'spine', parent:'', rank:'organ' },
  { id:'craniocervical',     en:'Craniocervical junction',   ar:'الوصل القحفي العنقي',       region:'spine', parent:'', rank:'substructure' },
  { id:'intervertebral',     en:'Intervertebral discs',      ar:'الأقراص الفقرية',           region:'spine', parent:'', rank:'substructure' },
  { id:'facet-joints',       en:'Facet joints',              ar:'المفاصل الوجيهية',          region:'spine', parent:'', rank:'substructure' },
  { id:'spinal-cord',        en:'Spinal cord',               ar:'الحبل الشوكي',              region:'spine', parent:'', rank:'organ' },

  /* ─────── Upper limb ─────── */
  { id:'shoulder',           en:'Shoulder',                  ar:'الكتف',                     region:'upper-limb', parent:'', rank:'organ' },
  { id:'ac-joint',           en:'Acromioclavicular joint',   ar:'المفصل الأخرمي الترقوي',    region:'upper-limb', parent:'shoulder', rank:'substructure', aliases:['AC joint'] },
  { id:'humerus',            en:'Humerus',                   ar:'العضد',                     region:'upper-limb', parent:'', rank:'organ' },
  { id:'elbow',              en:'Elbow',                     ar:'الكوع',                     region:'upper-limb', parent:'', rank:'organ' },
  { id:'forearm',            en:'Forearm',                   ar:'الساعد',                    region:'upper-limb', parent:'', rank:'organ' },
  { id:'radius-ulna',        en:'Radius & ulna',             ar:'الكعبرة والزند',            region:'upper-limb', parent:'forearm', rank:'substructure' },
  { id:'wrist',              en:'Wrist',                     ar:'الرسغ',                     region:'upper-limb', parent:'', rank:'organ' },
  { id:'scaphoid',           en:'Scaphoid',                  ar:'العظم الزورقي',             region:'upper-limb', parent:'wrist', rank:'substructure' },
  { id:'hand',               en:'Hand',                      ar:'اليد',                      region:'upper-limb', parent:'', rank:'organ' },
  { id:'fingers-upper',      en:'Fingers (phalanges)',       ar:'الأصابع والسلاميات',        region:'upper-limb', parent:'hand', rank:'substructure' },

  /* ─────── Lower limb ─────── */
  { id:'femur',              en:'Femur',                     ar:'عظم الفخذ',                 region:'lower-limb', parent:'', rank:'organ' },
  { id:'knee',               en:'Knee',                      ar:'الركبة',                    region:'lower-limb', parent:'', rank:'organ' },
  { id:'patella',            en:'Patella',                   ar:'الرضفة',                    region:'lower-limb', parent:'knee', rank:'substructure' },
  { id:'tibia-fibula',       en:'Tibia & fibula',            ar:'الظنبوب والشظية',           region:'lower-limb', parent:'', rank:'organ' },
  { id:'ankle',              en:'Ankle',                     ar:'الكاحل',                    region:'lower-limb', parent:'', rank:'organ' },
  { id:'foot',               en:'Foot',                      ar:'القدم',                     region:'lower-limb', parent:'', rank:'organ' },
  { id:'calcaneus',          en:'Calcaneus',                 ar:'العقب',                     region:'lower-limb', parent:'foot', rank:'substructure' },
  { id:'toes',               en:'Toes (phalanges)',          ar:'أصابع القدم والسلاميات',    region:'lower-limb', parent:'foot', rank:'substructure' },
  { id:'achilles',           en:'Achilles tendon',           ar:'وتر أخيل',                  region:'lower-limb', parent:'ankle', rank:'substructure' },

  /* ─────── Breast ─────── */
  { id:'breast',             en:'Breast',                    ar:'الثدي',                     region:'breast', parent:'', rank:'organ' },
  { id:'nipple-areola',      en:'Nipple-areola complex',     ar:'مركب الحلمة والهالة',       region:'breast', parent:'breast', rank:'substructure' },
  { id:'axillary-lymph',     en:'Axillary lymph nodes',      ar:'العقد اللمفية الإبطية',     region:'breast', parent:'', rank:'organ' },

  /* ═══ v1.5 additions — expanded coverage (regions × substructures) ═══ */
  /* ─── head-cns additions ─── */
  { id:"precentral-gyrus", en:"Precentral gyrus", ar:"التلفيف قبل المركزي", region:"head-cns", parent:"frontal-lobe", rank:"substructure" },
  { id:"postcentral-gyrus", en:"Postcentral gyrus", ar:"التلفيف بعد المركزي", region:"head-cns", parent:"parietal-lobe", rank:"substructure" },
  { id:"cingulate-gyrus", en:"Cingulate gyrus", ar:"التلفيف الحزامي", region:"head-cns", parent:"cerebrum", rank:"substructure" },
  { id:"central-sulcus", en:"Central sulcus", ar:"الأخدود المركزي", region:"head-cns", parent:"cerebrum", rank:"substructure" },
  { id:"lateral-sulcus", en:"Lateral sulcus (Sylvian fissure)", ar:"الأخدود الجانبي", region:"head-cns", parent:"cerebrum", rank:"substructure" },
  { id:"calcarine-sulcus", en:"Calcarine sulcus", ar:"الأخدود المهمازي", region:"head-cns", parent:"occipital-lobe", rank:"substructure" },
  { id:"lateral-ventricle", en:"Lateral ventricle", ar:"البطين الجانبي", region:"head-cns", parent:"ventricular-system", rank:"substructure" },
  { id:"third-ventricle", en:"Third ventricle", ar:"البطين الثالث", region:"head-cns", parent:"ventricular-system", rank:"substructure" },
  { id:"fourth-ventricle", en:"Fourth ventricle", ar:"البطين الرابع", region:"head-cns", parent:"ventricular-system", rank:"substructure" },
  { id:"external-ear", en:"External ear", ar:"الأذن الخارجية", region:"head-cns", parent:"temporal-bone", rank:"substructure" },
  { id:"middle-ear", en:"Middle ear", ar:"الأذن الوسطى", region:"head-cns", parent:"temporal-bone", rank:"substructure" },
  { id:"inner-ear", en:"Inner ear", ar:"الأذن الداخلية", region:"head-cns", parent:"temporal-bone", rank:"substructure" },
  { id:"cochlea", en:"Cochlea", ar:"القوقعة", region:"head-cns", parent:"inner-ear", rank:"substructure" },
  { id:"vestibule", en:"Vestibule", ar:"الدهليز", region:"head-cns", parent:"inner-ear", rank:"substructure" },
  { id:"semicircular-canals", en:"Semicircular canals", ar:"القنوات نصف الدائرية", region:"head-cns", parent:"inner-ear", rank:"substructure" },
  { id:"optic-chiasm", en:"Optic chiasm", ar:"التصالب البصري", region:"head-cns", parent:"brain", rank:"substructure" },
  { id:"mandible", en:"Mandible", ar:"الفك السفلي", region:"head-cns", parent:"skull", rank:"substructure" },
  { id:"maxilla", en:"Maxilla", ar:"الفك العلوي", region:"head-cns", parent:"skull", rank:"substructure" },
  { id:"tongue", en:"Tongue", ar:"اللسان", region:"head-cns", parent:"", rank:"organ" },
  { id:"palatine-tonsils", en:"Palatine tonsils", ar:"اللوزتان الحنكيتان", region:"head-cns", parent:"oropharynx", rank:"substructure" },
  { id:"adenoids", en:"Adenoids (pharyngeal tonsils)", ar:"اللحمية", region:"head-cns", parent:"nasopharynx", rank:"substructure" },
  { id:"vocal-cords", en:"Vocal cords", ar:"الحبال الصوتية", region:"head-cns", parent:"larynx", rank:"substructure" },
  { id:"hyoid-bone", en:"Hyoid bone", ar:"العظم اللامي", region:"head-cns", parent:"", rank:"substructure" },
  { id:"trigeminal", en:"Trigeminal nerve (CN V)", ar:"العصب الثلاثي التوائم", region:"head-cns", parent:"cranial-nerves", rank:"substructure" },
  { id:"facial-nerve", en:"Facial nerve (CN VII)", ar:"العصب الوجهي", region:"head-cns", parent:"cranial-nerves", rank:"substructure" },
  { id:"vestibulocochlear", en:"Vestibulocochlear nerve (CN VIII)", ar:"العصب الدهليزي القوقعي", region:"head-cns", parent:"cranial-nerves", rank:"substructure" },
  { id:"cranial-nerves", en:"Cranial nerves (I–XII)", ar:"الأعصاب القحفية", region:"head-cns", parent:"brainstem", rank:"substructure" },
  /* ─── chest additions ─── */
  { id:"right-upper-lobe", en:"Right upper lobe", ar:"الفص العلوي الأيمن", region:"chest", parent:"right-lung", rank:"substructure" },
  { id:"right-middle-lobe", en:"Right middle lobe", ar:"الفص الأوسط الأيمن", region:"chest", parent:"right-lung", rank:"substructure" },
  { id:"right-lower-lobe", en:"Right lower lobe", ar:"الفص السفلي الأيمن", region:"chest", parent:"right-lung", rank:"substructure" },
  { id:"left-upper-lobe", en:"Left upper lobe", ar:"الفص العلوي الأيسر", region:"chest", parent:"left-lung", rank:"substructure" },
  { id:"left-lower-lobe", en:"Left lower lobe", ar:"الفص السفلي الأيسر", region:"chest", parent:"left-lung", rank:"substructure" },
  { id:"lingula", en:"Lingula", ar:"اللسينة", region:"chest", parent:"left-upper-lobe", rank:"substructure" },
  { id:"right-main-bronchus", en:"Right main bronchus", ar:"القصبة الرئيسية اليمنى", region:"chest", parent:"bronchi", rank:"substructure" },
  { id:"left-main-bronchus", en:"Left main bronchus", ar:"القصبة الرئيسية اليسرى", region:"chest", parent:"bronchi", rank:"substructure" },
  { id:"sternum", en:"Sternum", ar:"عظم القص", region:"chest", parent:"chest-wall", rank:"substructure" },
  { id:"manubrium", en:"Manubrium", ar:"قبضة القص", region:"chest", parent:"sternum", rank:"substructure" },
  { id:"pericardium", en:"Pericardium", ar:"التامور", region:"chest", parent:"", rank:"compartment" },
  { id:"azygos-vein", en:"Azygos vein", ar:"الوريد الأزيغوس", region:"chest", parent:"mediastinum", rank:"substructure" },
  { id:"svc", en:"Superior vena cava", ar:"الوريد الأجوف العلوي", region:"chest", parent:"", rank:"organ" },
  /* ─── cardio additions ─── */
  { id:"lad", en:"Left anterior descending artery (LAD)", ar:"الشريان الأمامي الهابط الأيسر", region:"cardio", parent:"coronary-arteries", rank:"substructure" },
  { id:"lcx", en:"Left circumflex artery (LCx)", ar:"الشريان المنعطف الأيسر", region:"cardio", parent:"coronary-arteries", rank:"substructure" },
  { id:"rca", en:"Right coronary artery (RCA)", ar:"الشريان التاجي الأيمن", region:"cardio", parent:"coronary-arteries", rank:"substructure" },
  { id:"right-atrium", en:"Right atrium", ar:"الأذين الأيمن", region:"cardio", parent:"heart", rank:"substructure" },
  { id:"left-atrium", en:"Left atrium", ar:"الأذين الأيسر", region:"cardio", parent:"heart", rank:"substructure" },
  { id:"right-ventricle", en:"Right ventricle", ar:"البطين الأيمن", region:"cardio", parent:"heart", rank:"substructure" },
  { id:"left-ventricle", en:"Left ventricle", ar:"البطين الأيسر", region:"cardio", parent:"heart", rank:"substructure" },
  { id:"mitral-valve", en:"Mitral valve", ar:"الصمام التاجي", region:"cardio", parent:"heart", rank:"substructure" },
  { id:"aortic-valve", en:"Aortic valve", ar:"الصمام الأبهري", region:"cardio", parent:"heart", rank:"substructure" },
  { id:"tricuspid-valve", en:"Tricuspid valve", ar:"الصمام ثلاثي الشرفات", region:"cardio", parent:"heart", rank:"substructure" },
  { id:"pulmonary-valve", en:"Pulmonary valve", ar:"الصمام الرئوي", region:"cardio", parent:"heart", rank:"substructure" },
  { id:"interatrial-septum", en:"Interatrial septum", ar:"الحاجز بين الأذينين", region:"cardio", parent:"heart", rank:"substructure" },
  { id:"interventricular-septum", en:"Interventricular septum", ar:"الحاجز بين البطينين", region:"cardio", parent:"heart", rank:"substructure" },
  { id:"ascending-aorta", en:"Ascending aorta", ar:"الأبهر الصاعد", region:"cardio", parent:"thoracic-aorta", rank:"substructure" },
  { id:"descending-aorta", en:"Descending aorta", ar:"الأبهر الهابط", region:"cardio", parent:"thoracic-aorta", rank:"substructure" },
  { id:"common-carotid", en:"Common carotid artery", ar:"الشريان السباتي المشترك", region:"cardio", parent:"carotid-arteries", rank:"substructure" },
  { id:"internal-carotid", en:"Internal carotid artery", ar:"الشريان السباتي الباطن", region:"cardio", parent:"carotid-arteries", rank:"substructure" },
  { id:"external-carotid", en:"External carotid artery", ar:"الشريان السباتي الظاهر", region:"cardio", parent:"carotid-arteries", rank:"substructure" },
  { id:"mca", en:"Middle cerebral artery (MCA)", ar:"الشريان الدماغي الأوسط", region:"cardio", parent:"circle-of-willis", rank:"substructure" },
  { id:"aca", en:"Anterior cerebral artery (ACA)", ar:"الشريان الدماغي الأمامي", region:"cardio", parent:"circle-of-willis", rank:"substructure" },
  { id:"pca", en:"Posterior cerebral artery (PCA)", ar:"الشريان الدماغي الخلفي", region:"cardio", parent:"circle-of-willis", rank:"substructure" },
  { id:"basilar-artery", en:"Basilar artery", ar:"الشريان القاعدي", region:"cardio", parent:"", rank:"organ" },
  { id:"vertebral-arteries", en:"Vertebral arteries", ar:"الشرايين الفقرية", region:"cardio", parent:"", rank:"organ" },
  { id:"sma", en:"Superior mesenteric artery (SMA)", ar:"الشريان المساريقي العلوي", region:"cardio", parent:"mesenteric", rank:"substructure" },
  { id:"ima", en:"Inferior mesenteric artery (IMA)", ar:"الشريان المساريقي السفلي", region:"cardio", parent:"mesenteric", rank:"substructure" },
  { id:"celiac-trunk", en:"Celiac trunk", ar:"الجذع الاضطراب", region:"cardio", parent:"abdominal-aorta", rank:"substructure" },
  { id:"femoral-artery", en:"Femoral artery", ar:"الشريان الفخذي", region:"cardio", parent:"peripheral-arteries", rank:"substructure" },
  { id:"popliteal-artery", en:"Popliteal artery", ar:"الشريان المأبضي", region:"cardio", parent:"peripheral-arteries", rank:"substructure" },
  /* ─── abdomen additions ─── */
  { id:"pancreas-head", en:"Pancreatic head", ar:"رأس البنكرياس", region:"abdomen", parent:"pancreas", rank:"substructure" },
  { id:"pancreas-body", en:"Pancreatic body", ar:"جسم البنكرياس", region:"abdomen", parent:"pancreas", rank:"substructure" },
  { id:"pancreas-tail", en:"Pancreatic tail", ar:"ذيل البنكرياس", region:"abdomen", parent:"pancreas", rank:"substructure" },
  { id:"right-hepatic-vein", en:"Right hepatic vein", ar:"الوريد الكبدي الأيمن", region:"abdomen", parent:"liver", rank:"substructure" },
  { id:"middle-hepatic-vein", en:"Middle hepatic vein", ar:"الوريد الكبدي الأوسط", region:"abdomen", parent:"liver", rank:"substructure" },
  { id:"left-hepatic-vein", en:"Left hepatic vein", ar:"الوريد الكبدي الأيسر", region:"abdomen", parent:"liver", rank:"substructure" },
  { id:"common-hepatic-duct", en:"Common hepatic duct", ar:"القناة الكبدية المشتركة", region:"abdomen", parent:"biliary-tree", rank:"substructure" },
  { id:"cystic-duct", en:"Cystic duct", ar:"القناة المرارية", region:"abdomen", parent:"biliary-tree", rank:"substructure" },
  { id:"common-bile-duct", en:"Common bile duct (CBD)", ar:"القناة الصفراوية المشتركة", region:"abdomen", parent:"biliary-tree", rank:"substructure" },
  { id:"ampulla-of-vater", en:"Ampulla of Vater", ar:"أمبولة فاتر", region:"abdomen", parent:"biliary-tree", rank:"substructure" },
  { id:"splenic-vein", en:"Splenic vein", ar:"الوريد الطحالي", region:"abdomen", parent:"portal-venous", rank:"substructure" },
  { id:"splenic-artery", en:"Splenic artery", ar:"الشريان الطحالي", region:"abdomen", parent:"celiac-trunk", rank:"substructure" },
  { id:"renal-cortex", en:"Renal cortex", ar:"قشرة الكلية", region:"abdomen", parent:"kidneys", rank:"substructure" },
  { id:"renal-medulla", en:"Renal medulla", ar:"لب الكلية", region:"abdomen", parent:"kidneys", rank:"substructure" },
  { id:"renal-pelvis", en:"Renal pelvis", ar:"حويضة الكلية", region:"abdomen", parent:"kidneys", rank:"substructure" },
  { id:"retroperitoneum", en:"Retroperitoneum", ar:"خلف الصفاق", region:"abdomen", parent:"", rank:"compartment" },
  /* ─── pelvis additions ─── */
  { id:"fallopian-tubes", en:"Fallopian tubes", ar:"قناتا فالوب", region:"pelvis", parent:"uterus", rank:"substructure" },
  { id:"cervix", en:"Cervix", ar:"عنق الرحم", region:"pelvis", parent:"uterus", rank:"substructure" },
  { id:"endometrium", en:"Endometrium", ar:"بطانة الرحم", region:"pelvis", parent:"uterus", rank:"substructure" },
  { id:"myometrium", en:"Myometrium", ar:"عضل الرحم", region:"pelvis", parent:"uterus", rank:"substructure" },
  { id:"seminal-vesicles", en:"Seminal vesicles", ar:"الحويصلات المنوية", region:"pelvis", parent:"", rank:"organ" },
  { id:"pubic-symphysis", en:"Pubic symphysis", ar:"الارتفاق العاني", region:"pelvis", parent:"", rank:"substructure" },
  { id:"ischium", en:"Ischium", ar:"عظم الورك (الإسكية)", region:"pelvis", parent:"", rank:"substructure" },
  { id:"ilium", en:"Ilium", ar:"العظم الحرقفي", region:"pelvis", parent:"", rank:"substructure" },
  { id:"pubis", en:"Pubis", ar:"العانة", region:"pelvis", parent:"", rank:"substructure" },
  /* ─── spine additions ─── */
  { id:"nerve-roots", en:"Nerve roots", ar:"الجذور العصبية", region:"spine", parent:"spinal-cord", rank:"substructure" },
  { id:"cauda-equina", en:"Cauda equina", ar:"ذيل الفرس", region:"spine", parent:"spinal-cord", rank:"substructure" },
  { id:"conus-medullaris", en:"Conus medullaris", ar:"المخروط النخاعي", region:"spine", parent:"spinal-cord", rank:"substructure" },
  { id:"dural-sac", en:"Dural sac", ar:"الكيس الجافوي", region:"spine", parent:"", rank:"compartment" },
  { id:"ligamentum-flavum", en:"Ligamentum flavum", ar:"الرباط الأصفر", region:"spine", parent:"", rank:"substructure" },
  { id:"vertebral-body", en:"Vertebral body", ar:"جسم الفقرة", region:"spine", parent:"", rank:"substructure" },
  { id:"pedicle", en:"Pedicle", ar:"ساق الفقرة", region:"spine", parent:"", rank:"substructure" },
  { id:"lamina", en:"Lamina", ar:"صفيحة الفقرة", region:"spine", parent:"", rank:"substructure" },
  { id:"spinous-process", en:"Spinous process", ar:"الناتئ الشوكي", region:"spine", parent:"", rank:"substructure" },
  { id:"transverse-process", en:"Transverse process", ar:"الناتئ المستعرض", region:"spine", parent:"", rank:"substructure" },
  /* ─── upper-limb additions ─── */
  { id:"biceps-brachii", en:"Biceps brachii", ar:"العضلة ذات الرأسين العضدية", region:"upper-limb", parent:"humerus", rank:"substructure" },
  { id:"triceps", en:"Triceps brachii", ar:"العضلة ثلاثية الرؤوس العضدية", region:"upper-limb", parent:"humerus", rank:"substructure" },
  { id:"rotator-cuff", en:"Rotator cuff", ar:"الكفة المدوّرة", region:"upper-limb", parent:"shoulder", rank:"substructure" },
  { id:"supraspinatus", en:"Supraspinatus", ar:"فوق الشوكة", region:"upper-limb", parent:"rotator-cuff", rank:"substructure" },
  { id:"infraspinatus", en:"Infraspinatus", ar:"تحت الشوكة", region:"upper-limb", parent:"rotator-cuff", rank:"substructure" },
  { id:"teres-minor", en:"Teres minor", ar:"المدوّرة الصغيرة", region:"upper-limb", parent:"rotator-cuff", rank:"substructure" },
  { id:"subscapularis", en:"Subscapularis", ar:"تحت الكتف", region:"upper-limb", parent:"rotator-cuff", rank:"substructure" },
  { id:"deltoid", en:"Deltoid", ar:"الدالية", region:"upper-limb", parent:"shoulder", rank:"substructure" },
  { id:"median-nerve", en:"Median nerve", ar:"العصب الناصف", region:"upper-limb", parent:"", rank:"organ" },
  { id:"ulnar-nerve", en:"Ulnar nerve", ar:"العصب الزندي", region:"upper-limb", parent:"", rank:"organ" },
  { id:"radial-nerve", en:"Radial nerve", ar:"العصب الكعبري", region:"upper-limb", parent:"", rank:"organ" },
  { id:"carpal-tunnel", en:"Carpal tunnel", ar:"النفق الرسغي", region:"upper-limb", parent:"wrist", rank:"substructure" },
  { id:"metacarpals", en:"Metacarpals", ar:"السنعيات", region:"upper-limb", parent:"hand", rank:"substructure" },
  /* ─── lower-limb additions ─── */
  { id:"hamstrings", en:"Hamstrings", ar:"أوتار الركبة (العضلات المأبضية)", region:"lower-limb", parent:"femur", rank:"substructure" },
  { id:"quadriceps", en:"Quadriceps", ar:"العضلة الرباعية الرؤوس الفخذية", region:"lower-limb", parent:"femur", rank:"substructure" },
  { id:"gluteus-maximus", en:"Gluteus maximus", ar:"الألوية الكبرى", region:"lower-limb", parent:"", rank:"substructure" },
  { id:"gluteus-medius", en:"Gluteus medius", ar:"الألوية الوسطى", region:"lower-limb", parent:"", rank:"substructure" },
  { id:"acl", en:"Anterior cruciate ligament (ACL)", ar:"الرباط الصليبي الأمامي", region:"lower-limb", parent:"knee", rank:"substructure" },
  { id:"pcl", en:"Posterior cruciate ligament (PCL)", ar:"الرباط الصليبي الخلفي", region:"lower-limb", parent:"knee", rank:"substructure" },
  { id:"mcl", en:"Medial collateral ligament (MCL)", ar:"الرباط الجانبي الإنسي", region:"lower-limb", parent:"knee", rank:"substructure" },
  { id:"lcl", en:"Lateral collateral ligament (LCL)", ar:"الرباط الجانبي الوحشي", region:"lower-limb", parent:"knee", rank:"substructure" },
  { id:"medial-meniscus", en:"Medial meniscus", ar:"الغضروف الهلالي الإنسي", region:"lower-limb", parent:"knee", rank:"substructure" },
  { id:"lateral-meniscus", en:"Lateral meniscus", ar:"الغضروف الهلالي الوحشي", region:"lower-limb", parent:"knee", rank:"substructure" },
  { id:"gastrocnemius", en:"Gastrocnemius", ar:"التوأمية", region:"lower-limb", parent:"tibia-fibula", rank:"substructure" },
  { id:"soleus", en:"Soleus", ar:"النعلية", region:"lower-limb", parent:"tibia-fibula", rank:"substructure" },
  { id:"metatarsals", en:"Metatarsals", ar:"مشط القدم", region:"lower-limb", parent:"foot", rank:"substructure" },
  { id:"plantar-fascia", en:"Plantar fascia", ar:"اللفافة الأخمصية", region:"lower-limb", parent:"foot", rank:"substructure" },
  /* ─── breast additions ─── */
  { id:"milk-ducts", en:"Milk ducts", ar:"قنوات الحليب", region:"breast", parent:"breast", rank:"substructure" },
  { id:"mammary-lobules", en:"Mammary lobules", ar:"فصيصات الغدة الثدية", region:"breast", parent:"breast", rank:"substructure" },
];

/* ─── Indexes for fast lookup ─── */
const BY_ID     = Object.fromEntries(STRUCTURES.map(s => [s.id, s]));
const BY_REGION = REGIONS.reduce((m, r) => (m[r.id] = STRUCTURES.filter(s => s.region === r.id), m), {});
const BY_EN     = Object.fromEntries(STRUCTURES.map(s => [s.en.toLowerCase(), s]));

/* Aliases → canonical id (for legacy names in DB) */
const ALIAS_MAP = {};
STRUCTURES.forEach(s => {
  ALIAS_MAP[s.en.toLowerCase()] = s.id;
  ALIAS_MAP[s.ar] = s.id;
  (s.aliases || []).forEach(a => { ALIAS_MAP[a.toLowerCase()] = s.id; });
});

function resolveToId(name){
  if (!name) return null;
  const key = String(name).toLowerCase().trim();
  return ALIAS_MAP[key] || null;
}
function label(idOrName, lang){
  const id = BY_ID[idOrName] ? idOrName : resolveToId(idOrName);
  const s = id ? BY_ID[id] : null;
  if (!s) return idOrName || '';
  return lang === 'ar' ? s.ar : s.en;
}
function regionOf(idOrName){
  const id = BY_ID[idOrName] ? idOrName : resolveToId(idOrName);
  return id ? BY_ID[id].region : null;
}

/* ─── Public API ─── */
window.OMNIRAD_ANATOMY = {
  version: '1.0.0',
  reference: 'Terminologia Anatomica (IFAA, 2019) + RadLex (RSNA)',
  regions: REGIONS,
  structures: STRUCTURES,
  byId: BY_ID,
  byRegion: BY_REGION,
  byEn: BY_EN,
  aliasMap: ALIAS_MAP,
  resolveToId,
  label,
  regionOf,
  count: STRUCTURES.length,
  regionsCount: REGIONS.length
};

})();
