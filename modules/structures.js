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
    // ── Head & CNS ──
    { id:'brain', region:'Head & CNS', en:'Brain', ar:'الدماغ', icon:'🧠',
      desc:'Central nervous system organ in the cranial vault. Best evaluated with MRI for parenchymal detail; CT is first-line for acute hemorrhage or trauma.',
      images:[
        I('../images/structures/brain/mri_t2_original.png',  'MRI','Axial','T2',        WLP.MRI_T2),
        I('../images/structures/brain/mri_original.png',     'MRI','Axial','T1',        WLP.MRI_T1),
        I('../images/structures/brain/mri_pd_original.png',  'MRI','Axial','PD',        WLP.MRI_PD),
        I('../images/structures/brain/mri_flair.png',        'MRI','Axial','FLAIR',     WLP.MRI_FLAIR),
        I('../images/structures/brain/mri_dwi.png',          'MRI','Axial','DWI',       WLP.MRI_DWI),
        I('../images/structures/brain/ct_axial.png',         'CT', 'Axial','original',  WLP.CT_BRAIN),
        I('../images/structures/brain/ct_coronal.png',       'CT', 'Coronal','original',WLP.CT_BRAIN),
        I('../images/structures/brain/mri_t2_coronal.png',   'MRI','Coronal','T2',      WLP.MRI_T2),
        I('../images/structures/brain/mri_t2_sagittal.png',  'MRI','Sagittal','T2',     WLP.MRI_T2)
      ]},
    { id:'neck', region:'Head & Neck', en:'Neck', ar:'الرقبة', icon:'💠',
      desc:'Cervical spine, airway, thyroid and vascular structures.',
      images:[
        I('../images/structures/neck/mri_t2_original.png', 'MRI','Sagittal','T2', WLP.MRI_T2),
        I('../images/structures/neck/mri_original.png',    'MRI','Sagittal','T1', WLP.MRI_T1),
        I('../images/structures/neck/ct_axial.png',        'CT', 'Axial','original', WLP.CT_SOFT),
        I('../images/structures/neck/us_axial.png',        'US', 'Transverse','original', WLP.US)
      ]},

    // ── Chest ──
    { id:'thorax', region:'Chest', en:'Thorax', ar:'الصدر', icon:'🫁',
      desc:'Chest wall, mediastinum, and cardiothoracic structures.',
      images:[
        I('../images/structures/thorax/mri_t2_original.png','MRI','Axial','T2',    WLP.MRI_T2),
        I('../images/structures/thorax/mri_original.png',   'MRI','Axial','T1',    WLP.MRI_T1),
        I('../images/structures/thorax/ct_axial_lung.png',  'CT', 'Axial','lung',  WLP.CT_LUNG),
        I('../images/structures/thorax/ct_axial_soft.png',  'CT', 'Axial','soft',  WLP.CT_SOFT),
        I('../images/structures/thorax/xray_pa.png',        'X-Ray','PA','original', WLP.XRAY),
        I('../images/structures/thorax/xray_lateral.png',   'X-Ray','Lateral','original', WLP.XRAY)
      ]},

    // ── Abdomen ──
    { id:'abdomen', region:'Abdomen', en:'Abdomen (general)', ar:'البطن', icon:'🫃',
      desc:'Global abdominal view showing solid organs, bowel, and vasculature.',
      images:[
        I('../images/structures/abdomen/mri_t2_original.png','MRI','Axial','T2', WLP.MRI_T2),
        I('../images/structures/abdomen/mri_original.png',   'MRI','Axial','T1', WLP.MRI_T1),
        I('../images/structures/abdomen/ct_axial.png',       'CT', 'Axial','original', WLP.CT_ABD),
        I('../images/structures/abdomen/ct_coronal.png',     'CT', 'Coronal','original', WLP.CT_ABD)
      ]},
    { id:'liver', region:'Abdomen', en:'Liver', ar:'الكبد', icon:'🫘',
      desc:'Largest solid abdominal organ. RUQ, beneath the right hemidiaphragm.',
      images:[
        I('../images/structures/liver/ct_original.png', 'CT','Axial','original', WLP.CT_ABD),
        I('../images/structures/liver/ct_colored.png',  'CT','Axial','colored',  {ww:250,wl:128}),
        I('../images/structures/liver/mri_t2.png',      'MRI','Axial','T2',      WLP.MRI_T2),
        I('../images/structures/liver/mri_t1.png',      'MRI','Axial','T1',      WLP.MRI_T1),
        I('../images/structures/liver/us.png',          'US','Longitudinal','original', WLP.US),
        I('../images/structures/liver/ct_coronal.png',  'CT','Coronal','original', WLP.CT_ABD)
      ]},
    { id:'kidney', region:'Abdomen', en:'Kidney', ar:'الكلية', icon:'🫘',
      desc:'Retroperitoneal, right lower than left. Spans T12–L3. Cortex + medulla with pelvis draining to ureter.',
      images:[
        I('../images/structures/kidney/ct_original.png', 'CT','Axial','original', WLP.CT_ABD),
        I('../images/structures/kidney/ct_colored.png',  'CT','Axial','colored',  {ww:250,wl:128}),
        I('../images/structures/kidney/mri_t2.png',      'MRI','Axial','T2',      WLP.MRI_T2),
        I('../images/structures/kidney/us.png',          'US','Longitudinal','original', WLP.US),
        I('../images/structures/kidney/ct_coronal.png',  'CT','Coronal','original', WLP.CT_ABD)
      ]},
    { id:'spleen', region:'Abdomen', en:'Spleen', ar:'الطحال', icon:'🫘',
      desc:'LUQ, behind stomach, along ribs 9–11.',
      images:[
        I('../images/structures/spleen/mri_original.png','MRI','Axial','T1', WLP.MRI_T1),
        I('../images/structures/spleen/mri_colored.png', 'MRI','Axial','colored', {ww:250,wl:128}),
        I('../images/structures/spleen/ct_axial.png',    'CT','Axial','original', WLP.CT_ABD),
        I('../images/structures/spleen/us.png',          'US','Longitudinal','original', WLP.US)
      ]},
    { id:'bladder', region:'Pelvis', en:'Urinary bladder', ar:'المثانة', icon:'🫘',
      desc:'Anterior pelvis, behind pubic symphysis.',
      images:[
        I('../images/structures/bladder/ct_original.png','CT','Axial','original', WLP.CT_ABD),
        I('../images/structures/bladder/ct_colored.png', 'CT','Axial','colored',  {ww:250,wl:128}),
        I('../images/structures/bladder/mri_t2.png',     'MRI','Axial','T2', WLP.MRI_T2),
        I('../images/structures/bladder/us.png',         'US','Transverse','original', WLP.US)
      ]},

    // ── Musculoskeletal ──
    { id:'bone', region:'Musculoskeletal', en:'Bone', ar:'العظم', icon:'🦴',
      desc:'Bone window on CT — trabecular vs cortical detail.',
      images:[
        I('../images/structures/bone/ct_original.png','CT','Axial','bone', WLP.CT_BONE),
        I('../images/structures/bone/ct_colored.png', 'CT','Axial','colored', {ww:250,wl:128}),
        I('../images/structures/bone/xray.png',       'X-Ray','AP','original', WLP.XRAY),
        I('../images/structures/bone/mri_t2.png',     'MRI','Axial','T2', WLP.MRI_T2)
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
