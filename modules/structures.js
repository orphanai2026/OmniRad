/* ═══════════════════════════════════════════════════════════════
   OmniRad — Shared structures & imaging catalog
   ─────────────────────────────────────────────────────────────
   Single source of truth for Atlas + Comparison.
   Each structure lists images by (modality × plane × variant).
   Missing files render "image not found" gracefully — as more images
   are uploaded to /images/structures/... they appear automatically.

   Recommended file convention:
     images/structures/{id}/{modality}_{plane}_{variant}.png
     modality  = ct | mri | us | xray | nm | pet | angio | mammo
     plane     = axial | coronal | sagittal | longitudinal | transverse | pa | lateral | oblique
     variant   = original | colored | t1 | t2 | flair | dwi | pd | in | out | bone | soft | lung ...
   ═══════════════════════════════════════════════════════════════ */
(function(g){
  'use strict';

  /* Default WW/WL presets per modality */
  const WLP = {
    CT_BONE:{ww:2000,wl:400}, CT_SOFT:{ww:400,wl:40}, CT_LUNG:{ww:1500,wl:-600},
    CT_ABD :{ww:400,wl:60},   CT_BRAIN:{ww:80,wl:40},
    MRI_T1:{ww:300,wl:150}, MRI_T2:{ww:280,wl:120}, MRI_PD:{ww:220,wl:110},
    MRI_FLAIR:{ww:260,wl:130}, MRI_DWI:{ww:200,wl:100},
    US:{ww:250,wl:128}, XRAY:{ww:600,wl:300}, NM:{ww:250,wl:128},
    PET:{ww:250,wl:128}, ANGIO:{ww:400,wl:200}, MAMMO:{ww:600,wl:300}
  };

  /* Image entry factory (keeps declarations compact) */
  function I(path, modality, plane, variant, wlPreset){
    const p = wlPreset || {ww:250, wl:128};
    return { path, modality, plane, variant, ww:p.ww, wl:p.wl };
  }

  /* Structures — real available images + placeholder slots for future uploads.
     Missing images degrade gracefully (viewer shows "image not found"). */
  const STRUCTURES = [
    /* ═════════ Head & CNS ═════════ */
    { id:'brain', region:'Head & CNS', en:'Brain', ar:'الدماغ', icon:'🧠',
      desc:'Central nervous system organ. MRI first-line for parenchymal detail; CT for acute hemorrhage/trauma.',
      images:[
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Axial','T1',WLP.MRI_T1),
        I('','MRI','Axial','FLAIR',WLP.MRI_FLAIR), I('','MRI','Axial','DWI',WLP.MRI_DWI),
        I('','MRI','Coronal','T2',WLP.MRI_T2), I('','MRI','Sagittal','T2',WLP.MRI_T2),
        I('','CT','Axial','original',WLP.CT_BRAIN), I('','CT','Coronal','original',WLP.CT_BRAIN), I('','CT','Sagittal','original',WLP.CT_BRAIN)
      ]},
    { id:'cerebellum', region:'Head & CNS', en:'Cerebellum & Brainstem', ar:'المخيخ وجذع الدماغ', icon:'🧠',
      desc:'Posterior fossa structures. MRI is modality of choice.',
      images:[
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Sagittal','T2',WLP.MRI_T2),
        I('','CT','Axial','original',WLP.CT_BRAIN)
      ]},
    { id:'ventricles', region:'Head & CNS', en:'Ventricular system', ar:'الجهاز البطيني', icon:'💧',
      desc:'CSF-filled cavities: lateral, third, fourth ventricles + aqueduct.',
      images:[
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','CT','Axial','original',WLP.CT_BRAIN)
      ]},

    /* ═════════ Head & Neck ═════════ */
    { id:'skull', region:'Head & Neck', en:'Skull', ar:'الجمجمة', icon:'💀',
      desc:'Cranial vault + skull base.',
      images:[
        I('','CT','Axial','bone',WLP.CT_BONE), I('','CT','Coronal','bone',WLP.CT_BONE), I('','CT','Sagittal','bone',WLP.CT_BONE),
        I('','X-Ray','AP','original',WLP.XRAY), I('','X-Ray','Lateral','original',WLP.XRAY), I('','X-Ray','Towne','original',WLP.XRAY)
      ]},
    { id:'orbits', region:'Head & Neck', en:'Orbits & eye', ar:'الحجاج والعين', icon:'👁️',
      desc:'Globe, retrobulbar fat, extraocular muscles, optic nerve.',
      images:[
        I('','CT','Axial','soft',WLP.CT_SOFT), I('','CT','Coronal','soft',WLP.CT_SOFT),
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Coronal','T2',WLP.MRI_T2)
      ]},
    { id:'paranasal-sinuses', region:'Head & Neck', en:'Paranasal sinuses', ar:'الجيوب الأنفية', icon:'👃',
      desc:'Maxillary, ethmoid, frontal, sphenoid sinuses.',
      images:[
        I('','CT','Axial','soft',WLP.CT_SOFT), I('','CT','Coronal','bone',WLP.CT_BONE), I('','CT','Sagittal','bone',WLP.CT_BONE)
      ]},
    { id:'temporal-bone', region:'Head & Neck', en:'Temporal bone', ar:'العظم الصدغي', icon:'👂',
      desc:'Petrous bone, ossicles, cochlea, semicircular canals, internal auditory canal.',
      images:[
        I('','CT','Axial','bone',WLP.CT_BONE), I('','CT','Coronal','bone',WLP.CT_BONE),
        I('','MRI','Axial','T2',WLP.MRI_T2)
      ]},
    { id:'neck', region:'Head & Neck', en:'Neck', ar:'الرقبة', icon:'💠',
      desc:'Cervical soft tissues, airway, vessels.',
      images:[
        I('','MRI','Sagittal','T2',WLP.MRI_T2), I('','MRI','Axial','T2',WLP.MRI_T2),
        I('','CT','Axial','original',WLP.CT_SOFT), I('','CT','Sagittal','original',WLP.CT_SOFT),
        I('','US','Transverse','original',WLP.US)
      ]},
    { id:'thyroid', region:'Head & Neck', en:'Thyroid gland', ar:'الغدة الدرقية', icon:'🦋',
      desc:'Butterfly-shaped endocrine gland anterior to trachea.',
      images:[
        I('','US','Transverse','original',WLP.US), I('','US','Longitudinal','original',WLP.US),
        I('','CT','Axial','original',WLP.CT_SOFT),
        I('','Nuclear Medicine','AP','Tc-99m',{ww:255,wl:128})
      ]},
    { id:'larynx', region:'Head & Neck', en:'Larynx', ar:'الحنجرة', icon:'🎙️',
      desc:'Vocal cords, supraglottis, glottis, subglottis.',
      images:[
        I('','CT','Axial','original',WLP.CT_SOFT), I('','MRI','Axial','T2',WLP.MRI_T2)
      ]},

    /* ═════════ Chest ═════════ */
    { id:'thorax', region:'Chest', en:'Thorax', ar:'الصدر', icon:'🫁',
      desc:'Chest wall, mediastinum, cardiothoracic structures.',
      images:[
        I('','CT','Axial','lung',WLP.CT_LUNG), I('','CT','Axial','soft',WLP.CT_SOFT),
        I('','CT','Coronal','lung',WLP.CT_LUNG), I('','CT','Sagittal','lung',WLP.CT_LUNG),
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Coronal','T2',WLP.MRI_T2),
        I('','X-Ray','PA','original',WLP.XRAY), I('','X-Ray','AP','original',WLP.XRAY), I('','X-Ray','Lateral','original',WLP.XRAY)
      ]},
    { id:'lungs', region:'Chest', en:'Lungs', ar:'الرئتان', icon:'🫁',
      desc:'Right (3 lobes) + left (2 lobes) with bronchial tree.',
      images:[
        I('','CT','Axial','lung',WLP.CT_LUNG), I('','CT','Coronal','lung',WLP.CT_LUNG), I('','CT','Sagittal','lung',WLP.CT_LUNG),
        I('','X-Ray','PA','original',WLP.XRAY), I('','X-Ray','Lateral','original',WLP.XRAY)
      ]},
    { id:'mediastinum', region:'Chest', en:'Mediastinum', ar:'المنصف', icon:'🎯',
      desc:'Central chest compartment: heart, great vessels, thymus, lymph nodes, esophagus.',
      images:[
        I('','CT','Axial','soft',WLP.CT_SOFT), I('','CT','Coronal','soft',WLP.CT_SOFT),
        I('','MRI','Axial','T1',WLP.MRI_T1)
      ]},
    { id:'heart', region:'Chest', en:'Heart', ar:'القلب', icon:'❤️',
      desc:'Four-chambered muscular pump. Assessed by echo, cardiac MRI, coronary CTA.',
      images:[
        I('','CT','Axial','soft',WLP.CT_SOFT), I('','CT','Coronal','soft',WLP.CT_SOFT),
        I('','MRI','Short-axis','SSFP',WLP.MRI_T2), I('','MRI','4-chamber','SSFP',WLP.MRI_T2),
        I('','US','4-chamber','B-mode',WLP.US), I('','US','Parasternal long-axis','B-mode',WLP.US)
      ]},
    { id:'thoracic-aorta', region:'Chest', en:'Thoracic aorta', ar:'الأبهر الصدري', icon:'🩸',
      desc:'Ascending, arch, descending. Assessed with CTA/MRA.',
      images:[
        I('','CT','Axial','soft',WLP.CT_SOFT), I('','CT','Sagittal','soft',WLP.CT_SOFT),
        I('','MRI','Axial','T1',WLP.MRI_T1),
        I('','Angiography','AP','original',WLP.XRAY)
      ]},
    { id:'breast', region:'Chest', en:'Breast', ar:'الثدي', icon:'⚕️',
      desc:'Glandular + fibrofatty tissue. Screening = mammography ± US ± MRI.',
      images:[
        I('','Mammography','CC','original',WLP.XRAY), I('','Mammography','MLO','original',WLP.XRAY),
        I('','US','Radial','B-mode',WLP.US),
        I('','MRI','Axial','T1+C',WLP.MRI_T1)
      ]},

    /* ═════════ Abdomen ═════════ */
    { id:'abdomen', region:'Abdomen', en:'Abdomen (general)', ar:'البطن (عام)', icon:'🫃',
      desc:'Global abdominal view — solid organs, bowel, vasculature.',
      images:[
        I('','CT','Axial','original',WLP.CT_ABD), I('','CT','Coronal','original',WLP.CT_ABD), I('','CT','Sagittal','original',WLP.CT_ABD),
        I('','MRI','Axial','T2',WLP.MRI_T2),
        I('','X-Ray','AP supine','original',WLP.XRAY), I('','X-Ray','AP erect','original',WLP.XRAY), I('','X-Ray','Lateral decubitus','original',WLP.XRAY)
      ]},
    { id:'liver', region:'Abdomen', en:'Liver', ar:'الكبد', icon:'🫘',
      desc:'Largest solid abdominal organ, RUQ beneath right hemidiaphragm.',
      images:[
        I('','CT','Axial','original',WLP.CT_ABD), I('','CT','Coronal','original',WLP.CT_ABD), I('','CT','Sagittal','original',WLP.CT_ABD),
        I('','CT','Axial','colored',{ww:250,wl:128}),
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Axial','T1',WLP.MRI_T1),
        I('','US','Longitudinal','original',WLP.US), I('','US','Transverse','original',WLP.US)
      ]},
    { id:'gallbladder', region:'Abdomen', en:'Gallbladder & biliary tree', ar:'المرارة والقناة الصفراوية', icon:'💧',
      desc:'Gallbladder + intrahepatic/extrahepatic ducts.',
      images:[
        I('','US','Longitudinal','original',WLP.US), I('','US','Transverse','original',WLP.US),
        I('','MRI','MRCP','T2',WLP.MRI_T2),
        I('','CT','Axial','original',WLP.CT_ABD)
      ]},
    { id:'pancreas', region:'Abdomen', en:'Pancreas', ar:'البنكرياس', icon:'🫀',
      desc:'Retroperitoneal — head, body, tail.',
      images:[
        I('','CT','Axial','original',WLP.CT_ABD), I('','CT','Coronal','original',WLP.CT_ABD),
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','MRCP','T2',WLP.MRI_T2),
        I('','US','Transverse','original',WLP.US)
      ]},
    { id:'spleen', region:'Abdomen', en:'Spleen', ar:'الطحال', icon:'🫘',
      desc:'LUQ, behind stomach, along ribs 9–11.',
      images:[
        I('','CT','Axial','original',WLP.CT_ABD), I('','CT','Coronal','original',WLP.CT_ABD), I('','CT','Sagittal','original',WLP.CT_ABD),
        I('','MRI','Axial','T1',WLP.MRI_T1), I('','MRI','Axial','T2',WLP.MRI_T2),
        I('','US','Longitudinal','original',WLP.US)
      ]},
    { id:'adrenals', region:'Abdomen', en:'Adrenal glands', ar:'الغدد الكظرية', icon:'⚡',
      desc:'Suprarenal — cortex + medulla.',
      images:[
        I('','CT','Axial','original',WLP.CT_ABD), I('','CT','Coronal','original',WLP.CT_ABD),
        I('','MRI','Axial','T1 in/out phase',WLP.MRI_T1)
      ]},
    { id:'kidney', region:'Abdomen', en:'Kidney', ar:'الكلية', icon:'🫘',
      desc:'Retroperitoneal, right lower than left. Cortex + medulla + pelvis.',
      images:[
        I('','CT','Axial','original',WLP.CT_ABD), I('','CT','Coronal','original',WLP.CT_ABD), I('','CT','Sagittal','original',WLP.CT_ABD),
        I('','CT','Axial','colored',{ww:250,wl:128}),
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Coronal','T2',WLP.MRI_T2),
        I('','US','Longitudinal','original',WLP.US), I('','US','Transverse','original',WLP.US)
      ]},
    { id:'stomach', region:'Abdomen', en:'Stomach', ar:'المعدة', icon:'🍽️',
      desc:'J-shaped organ — cardia, fundus, body, antrum, pylorus.',
      images:[
        I('','CT','Axial','original',WLP.CT_ABD), I('','CT','Coronal','original',WLP.CT_ABD),
        I('','Fluoroscopy','AP','Barium',WLP.XRAY)
      ]},
    { id:'small-bowel', region:'Abdomen', en:'Small bowel', ar:'الأمعاء الدقيقة', icon:'🌀',
      desc:'Duodenum, jejunum, ileum.',
      images:[
        I('','CT','Axial','original',WLP.CT_ABD), I('','CT','Coronal','original',WLP.CT_ABD),
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Coronal','T2',WLP.MRI_T2),
        I('','Fluoroscopy','AP','Barium',WLP.XRAY)
      ]},
    { id:'colon', region:'Abdomen', en:'Colon', ar:'القولون', icon:'🌀',
      desc:'Ascending, transverse, descending, sigmoid.',
      images:[
        I('','CT','Axial','original',WLP.CT_ABD), I('','CT','Coronal','original',WLP.CT_ABD),
        I('','Fluoroscopy','AP','Barium enema',WLP.XRAY)
      ]},
    { id:'abdominal-aorta', region:'Abdomen', en:'Abdominal aorta', ar:'الأبهر البطني', icon:'🩸',
      desc:'Descending aorta below diaphragm, bifurcates at L4.',
      images:[
        I('','CT','Axial','soft',WLP.CT_SOFT), I('','CT','Sagittal','soft',WLP.CT_SOFT), I('','CT','Coronal','soft',WLP.CT_SOFT),
        I('','US','Longitudinal','original',WLP.US),
        I('','Angiography','AP','original',WLP.XRAY)
      ]},

    /* ═════════ Pelvis ═════════ */
    { id:'bladder', region:'Pelvis', en:'Urinary bladder', ar:'المثانة', icon:'🫘',
      desc:'Anterior pelvis, behind pubic symphysis.',
      images:[
        I('','CT','Axial','original',WLP.CT_ABD), I('','CT','Coronal','original',WLP.CT_ABD), I('','CT','Sagittal','original',WLP.CT_ABD),
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Sagittal','T2',WLP.MRI_T2),
        I('','US','Transverse','original',WLP.US), I('','US','Longitudinal','original',WLP.US)
      ]},
    { id:'prostate', region:'Pelvis', en:'Prostate', ar:'البروستاتا', icon:'⚕️',
      desc:'Peripheral + transitional + central zones. mpMRI is standard.',
      images:[
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Coronal','T2',WLP.MRI_T2), I('','MRI','Sagittal','T2',WLP.MRI_T2),
        I('','MRI','Axial','DWI',WLP.MRI_DWI),
        I('','US','Transverse','TRUS',WLP.US)
      ]},
    { id:'uterus', region:'Pelvis', en:'Uterus & ovaries', ar:'الرحم والمبيض', icon:'⚕️',
      desc:'Female pelvic organs. US first line, MRI for detail.',
      images:[
        I('','US','Transverse','TAUS',WLP.US), I('','US','Sagittal','TVUS',WLP.US),
        I('','MRI','Sagittal','T2',WLP.MRI_T2), I('','MRI','Axial','T2',WLP.MRI_T2)
      ]},
    { id:'rectum', region:'Pelvis', en:'Rectum & anal canal', ar:'المستقيم والقناة الشرجية', icon:'🌀',
      desc:'Terminal GI tract, pelvic floor musculature.',
      images:[
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Sagittal','T2',WLP.MRI_T2),
        I('','CT','Axial','original',WLP.CT_ABD)
      ]},

    /* ═════════ Musculoskeletal — Spine ═════════ */
    { id:'cspine', region:'Spine', en:'Cervical spine', ar:'العمود الرقبي', icon:'🦴',
      desc:'C1–C7 vertebrae, cord, discs.',
      images:[
        I('','MRI','Sagittal','T2',WLP.MRI_T2), I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Sagittal','STIR',WLP.MRI_T2),
        I('','CT','Sagittal','bone',WLP.CT_BONE), I('','CT','Axial','bone',WLP.CT_BONE),
        I('','X-Ray','AP','original',WLP.XRAY), I('','X-Ray','Lateral','original',WLP.XRAY), I('','X-Ray','Oblique','original',WLP.XRAY)
      ]},
    { id:'tspine', region:'Spine', en:'Thoracic spine', ar:'العمود الصدري', icon:'🦴',
      desc:'T1–T12 vertebrae.',
      images:[
        I('','MRI','Sagittal','T2',WLP.MRI_T2), I('','MRI','Sagittal','T1',WLP.MRI_T1),
        I('','CT','Sagittal','bone',WLP.CT_BONE),
        I('','X-Ray','AP','original',WLP.XRAY), I('','X-Ray','Lateral','original',WLP.XRAY)
      ]},
    { id:'lspine', region:'Spine', en:'Lumbar spine', ar:'العمود القطني', icon:'🦴',
      desc:'L1–L5 + intervertebral discs.',
      images:[
        I('','MRI','Sagittal','T2',WLP.MRI_T2), I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Sagittal','STIR',WLP.MRI_T2),
        I('','CT','Sagittal','bone',WLP.CT_BONE), I('','CT','Axial','bone',WLP.CT_BONE),
        I('','X-Ray','AP','original',WLP.XRAY), I('','X-Ray','Lateral','original',WLP.XRAY), I('','X-Ray','Oblique','original',WLP.XRAY)
      ]},

    /* ═════════ Musculoskeletal — Upper limb ═════════ */
    { id:'shoulder', region:'Upper limb', en:'Shoulder', ar:'الكتف', icon:'💪',
      desc:'Glenohumeral joint, rotator cuff.',
      images:[
        I('','MRI','Axial','PD',WLP.MRI_PD), I('','MRI','Coronal','T2',WLP.MRI_T2), I('','MRI','Sagittal','T2',WLP.MRI_T2),
        I('','CT','Axial','bone',WLP.CT_BONE),
        I('','X-Ray','AP','original',WLP.XRAY), I('','X-Ray','Y-view','original',WLP.XRAY), I('','X-Ray','Axillary','original',WLP.XRAY)
      ]},
    { id:'elbow', region:'Upper limb', en:'Elbow', ar:'الكوع', icon:'💪',
      desc:'Humero-ulnar, humero-radial, radio-ulnar joints.',
      images:[
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Coronal','T2',WLP.MRI_T2),
        I('','X-Ray','AP','original',WLP.XRAY), I('','X-Ray','Lateral','original',WLP.XRAY), I('','X-Ray','Oblique','original',WLP.XRAY)
      ]},
    { id:'wrist-hand', region:'Upper limb', en:'Wrist & hand', ar:'المعصم واليد', icon:'✋',
      desc:'Carpal bones, metacarpals, phalanges.',
      images:[
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Coronal','T2',WLP.MRI_T2),
        I('','X-Ray','AP','original',WLP.XRAY), I('','X-Ray','Lateral','original',WLP.XRAY), I('','X-Ray','Oblique','original',WLP.XRAY)
      ]},

    /* ═════════ Musculoskeletal — Lower limb ═════════ */
    { id:'hip', region:'Lower limb', en:'Hip', ar:'الورك', icon:'🦿',
      desc:'Femoro-acetabular joint.',
      images:[
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Coronal','STIR',WLP.MRI_T2),
        I('','CT','Axial','bone',WLP.CT_BONE), I('','CT','Coronal','bone',WLP.CT_BONE),
        I('','X-Ray','AP','original',WLP.XRAY), I('','X-Ray','Frog-leg','original',WLP.XRAY), I('','X-Ray','Cross-table lateral','original',WLP.XRAY)
      ]},
    { id:'knee', region:'Lower limb', en:'Knee', ar:'الركبة', icon:'🦿',
      desc:'Femur–tibia–patella, menisci, cruciate + collateral ligaments.',
      images:[
        I('','MRI','Axial','PD',WLP.MRI_PD), I('','MRI','Sagittal','PD',WLP.MRI_PD), I('','MRI','Coronal','T2',WLP.MRI_T2),
        I('','X-Ray','AP','original',WLP.XRAY), I('','X-Ray','Lateral','original',WLP.XRAY), I('','X-Ray','Skyline','original',WLP.XRAY)
      ]},
    { id:'ankle-foot', region:'Lower limb', en:'Ankle & foot', ar:'الكاحل والقدم', icon:'🦶',
      desc:'Tibio-talar joint, tarsal bones, metatarsals.',
      images:[
        I('','MRI','Axial','T2',WLP.MRI_T2), I('','MRI','Sagittal','T2',WLP.MRI_T2),
        I('','X-Ray','AP','original',WLP.XRAY), I('','X-Ray','Lateral','original',WLP.XRAY), I('','X-Ray','Oblique','original',WLP.XRAY)
      ]},

    /* ═════════ Bone (general reference) ═════════ */
    { id:'bone', region:'Musculoskeletal', en:'Bone (reference)', ar:'العظم (مرجع)', icon:'🦴',
      desc:'Bone window on CT — trabecular vs cortical detail.',
      images:[
        I('','CT','Axial','bone',WLP.CT_BONE), I('','CT','Coronal','bone',WLP.CT_BONE), I('','CT','Sagittal','bone',WLP.CT_BONE),
        I('','MRI','Axial','T1',WLP.MRI_T1), I('','MRI','Axial','STIR',WLP.MRI_T2),
        I('','X-Ray','AP','original',WLP.XRAY), I('','X-Ray','Lateral','original',WLP.XRAY), I('','X-Ray','Oblique','original',WLP.XRAY)
      ]}
  ];

  /* ─────────── Helpers ─────────── */

  /* Return unique modalities available for a structure */
  function modalitiesFor(structId){
    const s = STRUCTURES.find(x=>x.id===structId); if(!s) return [];
    return [...new Set(s.images.map(i=>i.modality))];
  }
  /* Planes available for a given structure + modality */
  function planesFor(structId, modality){
    const s = STRUCTURES.find(x=>x.id===structId); if(!s) return [];
    return [...new Set(s.images.filter(i=>i.modality===modality).map(i=>i.plane))];
  }
  /* Variants available for a given structure + modality + plane */
  function variantsFor(structId, modality, plane){
    const s = STRUCTURES.find(x=>x.id===structId); if(!s) return [];
    return s.images.filter(i=>i.modality===modality && i.plane===plane);
  }
  /* Find one image entry */
  function findImage(structId, modality, plane, variant){
    const s = STRUCTURES.find(x=>x.id===structId); if(!s) return null;
    return s.images.find(i => i.modality===modality && i.plane===plane && i.variant===variant) || null;
  }
  /* First available image for a structure (used as default) */
  function firstImage(structId){
    const s = STRUCTURES.find(x=>x.id===structId); if(!s) return null;
    return s.images[0] || null;
  }

  g.OMNIRAD_STRUCTURES = STRUCTURES;
  g.OMNIRAD_STRUCT_UTIL = { modalitiesFor, planesFor, variantsFor, findImage, firstImage };
})(window);
