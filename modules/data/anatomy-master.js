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
  { id:'head-cns',   en:'Head & Neck / CNS',  ar:'الرأس والرقبة / الجهاز العصبي', order:1 },
  { id:'chest',      en:'Chest / Thorax',     ar:'الصدر',                            order:2 },
  { id:'cardio',     en:'Cardiovascular',     ar:'القلب والأوعية',                   order:3 },
  { id:'abdomen',    en:'Abdomen',            ar:'البطن',                            order:4 },
  { id:'pelvis',     en:'Pelvis',             ar:'الحوض',                            order:5 },
  { id:'spine',      en:'Spine',              ar:'العمود الفقري',                    order:6 },
  { id:'upper-limb', en:'Upper limb',         ar:'الطرف العلوي',                     order:7 },
  { id:'lower-limb', en:'Lower limb',         ar:'الطرف السفلي',                     order:8 },
  { id:'breast',     en:'Breast',             ar:'الثدي',                            order:9 }
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
  { id:'axillary-lymph',     en:'Axillary lymph nodes',      ar:'العقد اللمفية الإبطية',     region:'breast', parent:'', rank:'organ' }
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
