/* ═══════════════════════════════════════════════════════════════════════════
 * OmniRad — Image Standard API  (omnirad-image-standard.js)
 * ═══════════════════════════════════════════════════════════════════════════
 * Shared validation + normalization contract for every image entering the
 * platform. Enforces DICOM-inspired dimensional standards on AI-generated
 * radiology images (bulk-upload · atlas · review · anatomy-review · viewer).
 *
 * Standards referenced
 *   – DICOM PS3.3 §C.7.6.1  Image Pixel Module (Rows/Columns integrity)
 *   – DICOM PS3.14 GSDF     Grayscale display consistency
 *   – NEMA DICOM CS 4030    Radiographic Image Storage
 *   – IHE Radiology BIR     Basic Image Review display requirements
 *   – ChatGPT Image Gen (July 2026): 1024×1024 default · DALL-E / GPT Image
 *   – RSNA teaching-file dimensional norms (≥512, ≤4096 per side)
 *
 * Ratio classes
 *   – 'square'    : 0.90 – 1.11   (DICOM-preferred)
 *   – 'portrait'  : 0.60 – 0.89   (mammo, some spines)
 *   – 'landscape' : 1.12 – 1.66   (some XR, US)
 *   – 'panoramic' : outside above → warned or rejected
 *
 * Public API (window.OmniRadImageStd):
 *   .STANDARD                          - static config
 *   .aspectClass(w, h)                  - one of 'square|portrait|landscape|panoramic'
 *   .validateDimensions(w, h)           - { ok, reason, level: 'ok|warn|error', ratio, aspectClass }
 *   .validateFile(file)  → Promise      - { ok, reason, level, width, height, ratio, aspectClass, sizeKB }
 *   .recommendedSize(modality)          - { w, h } suggested source dimensions per modality
 *   .promptSpecBlock(lang)              - HTML/text block to append to any generated prompt
 *   .attachViewerNormalization(imgEl)   - runtime CSS enforcement (object-fit:contain, centered)
 *   .renderDimensionsBadge(w, h)        - small HTML badge for tiles/cards
 * ═══════════════════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  const STANDARD = Object.freeze({
    // Preferred output — matches ChatGPT DALL-E / GPT Image default
    preferredWidth:  1024,
    preferredHeight: 1024,
    preferredRatio:  1.0,
    // Absolute limits (DICOM + platform enforcement)
    minSide: 512,           // <512 rejected — cannot be diagnostic-scale
    maxSide: 4096,          // >4096 rejected — likely mistake or scan artifact
    maxSizeMB: 4,           // per file (matches bulk-upload MAX_SIZE)
    // Ratio thresholds (see class rules above)
    ratioSquareLo:    0.90,
    ratioSquareHi:    1.11,
    ratioPortraitLo:  0.60,
    ratioPortraitHi:  0.89,
    ratioLandscapeLo: 1.12,
    ratioLandscapeHi: 1.66,
    // Accepted MIME types
    accepted: ['image/png', 'image/jpeg', 'image/webp']
  });

  // ── Modality-specific recommended dimensions (informational, not enforced) ──
  const RECOMMENDED = {
    'CT':     { w: 1024, h: 1024, ratio: '1:1' },
    'MRI':    { w: 1024, h: 1024, ratio: '1:1' },
    'MR':     { w: 1024, h: 1024, ratio: '1:1' },
    'US':     { w: 1024, h: 1024, ratio: '1:1' },   // square for consistency
    'PET':    { w: 1024, h: 1024, ratio: '1:1' },
    'PT':     { w: 1024, h: 1024, ratio: '1:1' },
    'NM':     { w: 1024, h: 1024, ratio: '1:1' },
    'XR':     { w: 1024, h: 1024, ratio: '1:1' },
    'X-Ray':  { w: 1024, h: 1024, ratio: '1:1' },
    'Mammo':  { w: 1024, h: 1024, ratio: '1:1' },   // OmniRad uniform policy
    'MG':     { w: 1024, h: 1024, ratio: '1:1' },
    'Angio':  { w: 1024, h: 1024, ratio: '1:1' },
    'DXA':    { w: 1024, h: 1024, ratio: '1:1' },
    'RF':     { w: 1024, h: 1024, ratio: '1:1' }
  };

  function recommendedSize(modality){
    return RECOMMENDED[modality] || { w: STANDARD.preferredWidth, h: STANDARD.preferredHeight, ratio: '1:1' };
  }

  // ── Aspect classification ────────────────────────────────────────────
  function aspectClass(w, h){
    if (!w || !h) return 'unknown';
    const r = w / h;
    if (r >= STANDARD.ratioSquareLo && r <= STANDARD.ratioSquareHi) return 'square';
    if (r >= STANDARD.ratioPortraitLo && r < STANDARD.ratioSquareLo) return 'portrait';
    if (r > STANDARD.ratioSquareHi && r <= STANDARD.ratioLandscapeHi) return 'landscape';
    return 'panoramic';
  }

  // ── validateDimensions(w, h) ─────────────────────────────────────────
  function validateDimensions(w, h){
    if (!w || !h){
      return { ok: false, reason: 'Missing dimensions', level: 'error', ratio: 0, aspectClass: 'unknown' };
    }
    const ratio = w / h;
    const cls = aspectClass(w, h);
    if (w < STANDARD.minSide || h < STANDARD.minSide){
      return { ok: false, level: 'error',
        reason: `Image too small (${w}×${h}px). DICOM educational minimum is ${STANDARD.minSide}×${STANDARD.minSide}.`,
        ratio, aspectClass: cls };
    }
    if (w > STANDARD.maxSide || h > STANDARD.maxSide){
      return { ok: false, level: 'error',
        reason: `Image too large (${w}×${h}px). Maximum is ${STANDARD.maxSide}×${STANDARD.maxSide}.`,
        ratio, aspectClass: cls };
    }
    if (cls === 'panoramic'){
      return { ok: false, level: 'error',
        reason: `Non-radiologic aspect ratio (${ratio.toFixed(2)}:1). Standard is 1:1 (square) or 3:4 / 4:3.`,
        ratio, aspectClass: cls };
    }
    if (cls !== 'square'){
      return { ok: true, level: 'warn',
        reason: `Non-standard ratio (${ratio.toFixed(2)}:1 · ${cls}). DICOM-preferred is 1:1.`,
        ratio, aspectClass: cls };
    }
    return { ok: true, level: 'ok', reason: 'Standard 1:1 square', ratio, aspectClass: cls };
  }

  // ── validateFile(file) → Promise ─────────────────────────────────────
  function loadImageMeta(file){
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { const w = img.naturalWidth, h = img.naturalHeight; URL.revokeObjectURL(url); resolve({ w, h }); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to read image')); };
      img.src = url;
    });
  }

  async function validateFile(file){
    if (!file) return { ok: false, level: 'error', reason: 'No file provided' };
    if (!STANDARD.accepted.includes(file.type)){
      return { ok: false, level: 'error',
        reason: `Unsupported format (${file.type || 'unknown'}). Use PNG, JPEG, or WebP.` };
    }
    if (file.size > STANDARD.maxSizeMB * 1024 * 1024){
      return { ok: false, level: 'error',
        reason: `File too large (${(file.size/1024/1024).toFixed(1)} MB). Maximum is ${STANDARD.maxSizeMB} MB.` };
    }
    let meta;
    try { meta = await loadImageMeta(file); }
    catch(e){ return { ok: false, level: 'error', reason: 'Could not read image dimensions' }; }
    const dim = validateDimensions(meta.w, meta.h);
    return Object.assign({}, dim, {
      width: meta.w, height: meta.h,
      sizeKB: Math.round(file.size / 1024)
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
   * PROMPT SKELETON v4  (22 Jul 2026) — single source of truth
   * ───────────────────────────────────────────────────────────────────
   * One fixed 7-block structure for EVERY generation prompt; only the slot
   * values vary. Built to the highest prompt-engineering + radiology norms:
   *   • OpenAI gpt-image-2 guide  — structure order (role→subject→details→
   *     constraints), skimmable labeled segments, explicit invariants
   *   • MedP-CLIP  — fixed system-role + strict Radiology-Lexicon terminology
   *   • RoentGen  — radiology "acquisition description" register
   *   • LesionDiffusion  — multi-attribute pathology slot
   *   • RadLex / TA2  — terminology anchoring
   *   • ChatGPT image policy (Jul 2026)  — ≤8 images per request → auto-batch
   * Blocks: 1 ROLE · 2 ACQUISITION · 3 RENDERING · 4 ANATOMY ·
   *         5 SPECIFICATIONS · 6 NEGATIVE/INVARIANTS · 7 OUTPUT CONTRACT
   * ═══════════════════════════════════════════════════════════════════ */

  const MAX_IMAGES_PER_REQUEST = 8; // ChatGPT Instant-mode ceiling (Jul 2026)

  // B1 · dominant-region specialty (raises anatomical accuracy — Multi-Frame MRI)
  function specialtyFor(region, organ){
    const s = ((region||'') + ' ' + (organ||'')).toLowerCase();
    if (/(brain|cerebr|cerebell|skull|intracranial|sella|pituitary|orbit|nasopharynx|temporal bone|pons|midbrain|medulla|ventricle .*brain|circle of willis)/.test(s)) return {en:'neuroradiologist', ar:'طبيب أشعة عصبية'};
    if (/(spine|spinal|vertebr|cord|disc|femur|tibia|fibula|humerus|radius|ulna|\bbone\b|joint|knee|shoulder|hip|elbow|ankle|wrist|hand|foot|pelvis|clavicle|scapula|patella|sacrum|coccyx|musculoskeletal)/.test(s)) return {en:'musculoskeletal radiologist', ar:'طبيب أشعة عضلية هيكلية'};
    if (/(heart|cardiac|coronary|aortic root|myocard|ventricle|atrium|valve|pericard)/.test(s)) return {en:'cardiovascular radiologist', ar:'طبيب أشعة قلبية وعائية'};
    if (/(lung|pulmonary|thorax|chest|bronch|pleura|mediastin|trachea|carina|\bhil)/.test(s)) return {en:'chest radiologist', ar:'طبيب أشعة صدرية'};
    if (/(breast|mammary|areola|nipple|fibroglandular)/.test(s)) return {en:'breast radiologist', ar:'طبيب أشعة الثدي'};
    if (/(liver|hepat|pancrea|spleen|kidney|renal|adrenal|bowel|colon|stomach|gastric|abdom|pelvi|bladder|uterus|prostate|ovary|biliary|gallbladder|duoden|mesenter)/.test(s)) return {en:'abdominal radiologist', ar:'طبيب أشعة بطنية'};
    return {en:'radiologist', ar:'طبيب أشعة'};
  }

  // B3 · modality rendering physics + texture cues (window / sequence / colormap)
  const CT_WINDOW = {
    'Bone':        {en:'bone window (WW≈1800 / WL≈400): dense cortical margins with fine trabecular texture', ar:'نافذة العظم (WW≈1800/WL≈400): حواف قشرية كثيفة ونسيج تربيقي دقيق'},
    'Lung':        {en:'lung window (WW≈1500 / WL≈-600): air-filled parenchyma with fine vascular markings', ar:'نافذة الرئة (WW≈1500/WL≈-600): نسيج هوائي مع علامات وعائية دقيقة'},
    'Soft tissue': {en:'soft-tissue window (WW≈400 / WL≈40): balanced organ and muscle contrast', ar:'نافذة الأنسجة الرخوة (WW≈400/WL≈40): تباين متوازن للأعضاء والعضلات'},
    'Brain':       {en:'brain window (WW≈80 / WL≈40): grey–white matter differentiation', ar:'نافذة الدماغ (WW≈80/WL≈40): تمييز المادة الرمادية عن البيضاء'},
    'Mediastinum': {en:'mediastinal window (WW≈350 / WL≈40)', ar:'نافذة المنصف (WW≈350/WL≈40)'}
  };
  const MR_SEQ = {
    'T1':   {en:'T1-weighted (fat bright, fluid dark)', ar:'موزون T1 (الدهون ساطعة، السوائل داكنة)'},
    'T2':   {en:'T2-weighted (fluid and CSF bright)', ar:'موزون T2 (السوائل والسائل الدماغي الشوكي ساطعة)'},
    'FLAIR':{en:'FLAIR (CSF suppressed, oedema bright)', ar:'FLAIR (كبت السائل الدماغي، الوذمة ساطعة)'},
    'DWI':  {en:'diffusion-weighted (restricted diffusion bright)', ar:'موزون الانتشار (الانتشار المقيّد ساطع)'},
    'ADC':  {en:'ADC map (restricted diffusion dark)', ar:'خريطة ADC (الانتشار المقيّد داكن)'},
    'T1+C': {en:'post-contrast T1 (enhancing tissue bright)', ar:'T1 بعد الصبغة (الأنسجة المُعزّزة ساطعة)'},
    'STIR': {en:'STIR (fat suppressed)', ar:'STIR (كبت الدهون)'},
    'SWI':  {en:'susceptibility-weighted (veins/haemorrhage dark)', ar:'موزون التأثّر المغناطيسي (الأوردة/النزف داكنة)'},
    'MRA':  {en:'MR angiography (bright vascular flow)', ar:'تصوير الأوعية بالرنين (تدفق وعائي ساطع)'}
  };
  const US_MODE = {
    'B-mode grayscale':{en:'grayscale B-mode ultrasound with sector-fan geometry', ar:'موجات صوتية B-mode رمادية بهندسة مروحية قطاعية'},
    'Color Doppler':   {en:'color Doppler flow overlaid on grayscale B-mode', ar:'دوبلر ملوّن للتدفق فوق B-mode رمادي'},
    'Power Doppler':   {en:'power Doppler flow map on grayscale B-mode', ar:'خريطة دوبلر القدرة فوق B-mode رمادي'},
    'Spectral Doppler':{en:'grayscale B-mode with a spectral Doppler waveform', ar:'B-mode رمادي مع منحنى دوبلر طيفي'},
    'Elastography':    {en:'colour elastography overlay on grayscale B-mode', ar:'تراكب مرونة ملوّن فوق B-mode رمادي'}
  };
  function renderLine(d){
    switch (d.modality){
      case 'CT': { const w = CT_WINDOW[d.window] || CT_WINDOW['Soft tissue'];
        return {en:`Grayscale CT, ${w.en}; HU-consistent densities, realistic radiographic texture.`,
                ar:`مقطعية محوسبة رمادية، ${w.ar}؛ كثافات متسقة مع وحدات هاونسفيلد ونسيج إشعاعي واقعي.`}; }
      case 'MRI': { const q = MR_SEQ[d.sequence] || MR_SEQ['T2'];
        return {en:`${q.en} MRI, realistic MR signal and tissue contrast.`,
                ar:`رنين مغناطيسي ${q.ar}، إشارة وتباين نسيجي واقعيان.`}; }
      case 'X-Ray':
        return {en:`Grayscale projection radiograph, ${d.plane} projection, realistic bone and soft-tissue densities.`,
                ar:`صورة أشعة سينية إسقاطية رمادية، إسقاط ${d.planeAr||d.plane}، كثافات عظمية ونسيجية واقعية.`};
      case 'Mammography':
        return {en:`Grayscale mammogram, ${d.plane} projection, high-resolution fibroglandular detail.`,
                ar:`ماموغرام رمادي، إسقاط ${d.planeAr||d.plane}، تفاصيل غدية ليفية عالية الدقة.`};
      case 'Ultrasound': { const u = US_MODE[d.usMode] || US_MODE['B-mode grayscale']; return {en:u.en, ar:u.ar}; }
      case 'PET/CT':
        return {en:`Fused PET/CT: ${d.tracer} uptake as a ${d.colormap||'hot-metal'} colormap over grayscale CT, SUV-like intensity.`,
                ar:`PET/CT مدمج: امتصاص ${d.tracer} بخريطة ألوان ${d.colormapAr||d.colormap||'ساخنة'} فوق CT رمادي، شدّة شبيهة بـSUV.`};
      case 'Nuclear Medicine':
        return {en:`Planar nuclear scintigraphy, ${d.tracer} uptake in a ${d.colormap||'grayscale'} colormap.`,
                ar:`تصوير ومضاني نووي مستوٍ، امتصاص ${d.tracer} بخريطة ألوان ${d.colormapAr||d.colormap||'رمادية'}.`};
      case 'Angiography':
        return {en:`Digital subtraction angiogram (DSA): contrast-filled vessels on a subtracted background.`,
                ar:`تصوير أوعية بالطرح الرقمي (DSA): أوعية ممتلئة بالصبغة على خلفية مطروحة.`};
      case 'Fluoroscopy':
        return {en:`Grayscale fluoroscopic image with ${d.fluoroContrast||'contrast'}.`,
                ar:`صورة تنظير فلوري رمادية مع ${d.fluoroContrastAr||d.fluoroContrast||'صبغة'}.`};
      case 'Histology':
        return {en:`Brightfield micrograph, ${d.stain||'H&E'} stain at ${d.magnification||'×10'} magnification.`,
                ar:`صورة مجهرية بالحقل الساطع، صبغة ${d.stain||'H&E'} بتكبير ${d.magnification||'×10'}.`};
      case 'DEXA':
        return {en:`Dual-energy X-ray densitometry map.`, ar:`خريطة قياس كثافة العظم بالأشعة مزدوجة الطاقة.`};
      case 'Endoscopy':
        return {en:`Full-colour endoscopic view with natural mucosal illumination.`, ar:`رؤية منظارية ملوّنة بإضاءة مخاطية طبيعية.`};
      default:
        return {en:`Grayscale ${d.modality} image, realistic radiographic texture.`, ar:`صورة ${d.modalityAr||d.modality} رمادية بنسيج إشعاعي واقعي.`};
    }
  }

  // B5 · aspect follows the natural field-of-view of the exam (3 supported sizes)
  function aspectFor(modality, plane, organ){
    const p = (plane||'').toLowerCase();
    const o = (organ||'').toLowerCase();
    if (/axial|transverse/.test(p)) return { w:1024, h:1024, label:'1:1' };
    if (/sagittal|coronal/.test(p) && /(spine|spinal|vertebr|cord)/.test(o)) return { w:1024, h:1536, label:'2:3' };
    if (/(femur|tibia|fibula|humerus|radius|ulna|long bone)/.test(o)) return { w:1024, h:1536, label:'2:3' };
    if (modality === 'Mammography') return { w:1024, h:1536, label:'2:3' };
    if (modality === 'Ultrasound') return { w:1024, h:1536, label:'2:3' };
    return { w:1024, h:1024, label:'1:1' };
  }

  // B5 · modality-aware background (radiographic black, or natural for micro/scope)
  function backgroundFor(modality, labeled, series){
    if (series) return { en:'pure black (#000000)', ar:'أسود نقي (#000000)' };
    if (labeled) return { en:'clean light neutral teaching background', ar:'خلفية تعليمية فاتحة محايدة' };
    if (modality === 'Histology') return { en:'neutral slide background', ar:'خلفية شريحة محايدة' };
    if (modality === 'Endoscopy') return { en:'natural mucosal background', ar:'خلفية مخاطية طبيعية' };
    return { en:'pure black (#000000)', ar:'أسود نقي (#000000)' };
  }

  // D13 · split a series into balanced batches of ≤8 (12 → 6+6, not 8+4)
  function batchPlan(n, max){
    max = max || MAX_IMAGES_PER_REQUEST;
    if (!(n > 0)) return [{ index:0, from:1, to:0, count:0, total:1 }];
    if (n <= max) return [{ index:0, from:1, to:n, count:n, total:1 }];
    const k = Math.ceil(n / max);
    const per = Math.ceil(n / k);
    const out = []; let from = 1, idx = 0;
    while (from <= n){ const to = Math.min(from + per - 1, n); out.push({ index:idx, from, to, count:to - from + 1 }); from = to + 1; idx++; }
    out.forEach(b => b.total = out.length);
    return out;
  }

  // B6 · negative constraints (never "no color" — colored modalities are legitimate)
  function negatives(series){
    const base = ['text','labels','rulers','scale bars','arrows','R/L side markers','watermarks','logos','borders','timestamps'];
    const shape = series ? ['collage','grid layout','multi-panel montage'] : ['multi-panel montage'];
    const quality = ['anatomical inaccuracies','distortion','artifacts','blurry regions','low-quality rendering'];
    const en = base.concat(shape, quality).map(x => 'no ' + x).join(', ');
    const arBase = ['نصوص','تسميات','مساطر','أشرطة قياس','أسهم','ماركرات جهة R/L','علامات مائية','شعارات','إطارات','طوابع زمنية'];
    const arShape = series ? ['كولاج','شبكة','لوحات متعددة'] : ['لوحات متعددة'];
    const arQual = ['أخطاء تشريحية','تشويه','عيوب','مناطق ضبابية','جودة منخفضة'];
    const ar = 'بدون: ' + arBase.concat(arShape, arQual).join('، ');
    return { en, ar };
  }

  const CROSS_PLANES = ['Axial','Coronal','Sagittal','Oblique','Transverse','Longitudinal'];
  function viewNoun(plane, lang){
    if (plane === 'Slide') return lang === 'ar' ? 'صورة مجهرية' : 'micrograph';
    if (CROSS_PLANES.includes(plane)) return lang === 'ar' ? 'مقطع' : 'section';
    return lang === 'ar' ? 'إسقاط' : 'projection';
  }

  const SPINE_RE = /(spine|spinal|vertebr|thoracic spine|lumbar spine|cervical spine|c-spine)/i;
  const MODALITY_REALISM = {
    'CT':               {en:'natural trabecular bone and soft-tissue texture with organic random variation (no repeating tile pattern), realistic Hounsfield-like noise', ar:'نسيج عظمي تربيقي ورخو طبيعي بتغيّر عضوي عشوائي (بلا نمط تبليط متكرّر)، ضجيج واقعي شبيه بوحدات هاونسفيلد'},
    'MRI':              {en:'organic MR signal texture with natural random variation (no repeating tile pattern)', ar:'نسيج إشارة رنين عضوي بتغيّر عشوائي طبيعي (بلا نمط تبليط متكرّر)'},
    'X-Ray':             {en:'natural trabecular bone pattern and realistic soft-tissue overlap (no repeating tile pattern)', ar:'نمط عظمي تربيقي طبيعي وتراكب نسيجي رخو واقعي (بلا نمط تبليط متكرّر)'},
    'Mammography':      {en:'natural fibroglandular tissue pattern with organic variation (no repeating tile pattern)', ar:'نمط نسيج غدّي ليفي طبيعي بتغيّر عضوي (بلا نمط تبليط متكرّر)'},
    'Ultrasound':       {en:'natural speckle texture and realistic tissue boundaries (not uniform noise or a repeating pattern)', ar:'نسيج بقعي (speckle) طبيعي وحدود نسيجية واقعية (لا ضجيج موحّد أو نمط متكرّر)'},
    'PET/CT':           {en:'physiologically natural, smoothly varying uptake distribution (no blocky or repeating pattern)', ar:'توزيع امتصاص فيسيولوجي طبيعي متدرّج (بلا كتل أو نمط متكرّر)'},
    'Nuclear Medicine': {en:'physiologically natural, smoothly varying uptake distribution (no blocky or repeating pattern)', ar:'توزيع امتصاص فيسيولوجي طبيعي متدرّج (بلا كتل أو نمط متكرّر)'},
    'Angiography':      {en:'naturally, organically branching vessel pattern (no symmetric or repeating tiling)', ar:'تفرّع وعائي عضوي طبيعي (بلا تماثل أو تبليط متكرّر)'},
    'Fluoroscopy':      {en:'natural anatomical detail with organic tissue texture (no repeating tile pattern)', ar:'تفاصيل تشريحية طبيعية بنسيج عضوي (بلا نمط تبليط متكرّر)'},
    'Histology':        {en:'natural, non-repeating cellular distribution and staining variation (no tiling pattern)', ar:'توزيع خلوي طبيعي غير متكرّر وتغيّر تلوين طبيعي (بلا نمط تبليط)'},
    'Endoscopy':        {en:'natural mucosal texture and vascular pattern (no repeating tile pattern)', ar:'نسيج مخاطي وتوزيع وعائي طبيعيان (بلا نمط تبليط متكرّر)'},
    'DEXA':             {en:'natural bone-density gradient (no blocky or repeating pattern)', ar:'تدرّج كثافة عظمية طبيعي (بلا كتل أو نمط متكرّر)'}
  };
  // B4 · always-on structural-realism guard, keyed by rendering style (modality);
  // spine/vertebral organs additionally get an explicit curvature constraint;
  // ALL organs get a universal fascial-plane/tissue-separation fidelity clause.
  // Short skimmable B4 bullets, keyed by rendering style (modality). Returns an
  // array of bullet strings (no leading '• '). Spine adds a curvature bullet.
  function realismBullets(modality, region, organ, lang){
    const L = lang === 'ar';
    const mr = MODALITY_REALISM[modality] || { en:'organic, non-repetitive texture — no tiling pattern', ar:'نسيج عضوي غير متكرّر — بلا نمط تبليط' };
    const isSpine = SPINE_RE.test(((region||'') + ' ' + (organ||'')));
    const out = L ? [
      `النسيج: ${mr.ar}`,
      'الفصل: العضلات والأعضاء والأوعية المجاورة مفصولة بحدود نسيجية/لفافية طبيعية — بلا نمط محاك أو متكرّر',
      'المطابقة: نِسَب ومواضع مطابقة للتشريح البشري الحقيقي — لا مخطّط مُبسّط'
    ] : [
      `Texture: ${mr.en}`,
      'Separation: adjacent muscles, organs and vessels divided by natural tissue/fascial planes — no woven or repeating pattern',
      'Fidelity: real human proportions and correct positions — not a schematic'
    ];
    if (isSpine) out.push(L
      ? 'الانحناء: انحناء فقري طبيعي سلس — بلا كسرة أو انثناء حاد عند أي التقاء'
      : 'Curvature: smooth natural spinal curvature — no kink or abrupt step at any junction');
    return out;
  }

  // D15 · scope/FOV lock as a short bullet string (no leading '• ').
  function scopeBullet(lang){
    return lang === 'ar'
      ? 'النطاق: المنطقة/المستوى المحدَّد فقط — لا بنى مجاورة أو خارج حقل الرؤية'
      : 'Scope: only the specified region/level — nothing outside the field of view';
  }

  // ── Assemble ONE single-image prompt for a language ──────────────────
  function assembleSingle(d, lang){
    const L = lang === 'ar';
    const sp = specialtyFor(d.region, d.organ);
    const rl = renderLine(d);
    const asp = aspectFor(d.modality, d.plane, d.organ);
    const bg = backgroundFor(d.modality, d.labeled, false);
    const neg = negatives(false);
    const vn = viewNoun(d.plane, lang);
    const structs = (d.structures || []).filter(Boolean);
    const P = [];
    if (L){
      P.push(`أنت ${sp.ar} معتمد. أنتج صورة واحدة تعليمية (غير تشخيصية) لملفّ تعليمي إشعاعي. ارسم بدقّة ما هو محدَّد أدناه.`);
      P.push('\n═══ التصوير (ACQUISITION) ═══');
      P.push(`${d.modalityAr} · ${d.planeAr} ${vn} · ${d.latAr||''}${d.regionAr ? d.regionAr + '، ' : ''}${d.organAr || d.organ || 'العضو المستهدف'}${d.sliceAr||''} · ${d.techShortAr ? d.techShortAr + ' · ' : ''}مريض ${d.patientAr} · ${d.purposeAr}`);
      P.push('\n═══ العرض (RENDERING) ═══');
      P.push(rl.ar);
      P.push('\n═══ التشريح (بمصطلحات RadLex/TA2) ═══');
      P.push(`• العرض: ${d.findingsAr}${structs.length ? '؛ البنى: ' + structs.join('، ') : ''}`);
      if (d.pathologyAr) P.push(`• الآفة: ${d.pathologyAr}`);
      realismBullets(d.modality, d.region, d.organ, 'ar').forEach(b => P.push('• ' + b));
      P.push('• ' + scopeBullet('ar'));
      P.push('\n═══ مواصفات الصورة ═══');
      P.push(`• الحجم: ${asp.w} × ${asp.h} بكسل بالضبط · النسبة ${asp.label}`);
      P.push('• الصيغة: PNG عالية الدقة بلا عيوب ضغط');
      P.push(`• الخلفية: ${bg.ar}`);
      P.push('• البنية في المنتصف تملأ ٧٠–٨٥٪ من الإطار');
      P.push('• منظر واحد ومستوى واحد فقط — بلا لوحات متعددة');
      P.push(d.labeled ? `• تسميات ${d.labelLangAr||''} واضحة موضوعة على البنى الصحيحة` : '• بلا أي نصوص أو تسميات');
      if (d.negOn){ P.push('\n═══ ممنوع منعاً باتّاً ═══'); P.push(neg.ar); }
      P.push('\n═══ عقد الإخراج (OUTPUT) ═══');
      P.push('أخرج صورة واحدة فقط. لا تشرح، بلا تعليقات أو نصّ تفسيري.');
    } else {
      P.push(`You are a board-certified ${sp.en}. Produce ONE educational, non-diagnostic radiology teaching-file image. Draw exactly what is specified below.`);
      P.push('\n═══ ACQUISITION ═══');
      P.push(`${d.modality} · ${d.plane} ${vn} · ${d.latEn||''}${d.region ? d.region + ', ' : ''}${d.organ || 'target organ'}${d.sliceEn||''} · ${d.techShortEn ? d.techShortEn + ' · ' : ''}${d.patientEn} patient · ${d.purposeEn}`);
      P.push('\n═══ RENDERING ═══');
      P.push(rl.en);
      P.push('\n═══ ANATOMY (RadLex/TA2 terminology) ═══');
      P.push(`• Show: ${d.findingsEn}${structs.length ? '; structures: ' + structs.join(', ') : ''}`);
      if (d.pathologyEn) P.push(`• Pathology: ${d.pathologyEn}`);
      realismBullets(d.modality, d.region, d.organ, 'en').forEach(b => P.push('• ' + b));
      P.push('• ' + scopeBullet('en'));
      P.push('\n═══ IMAGE SPECIFICATIONS ═══');
      P.push(`• Size: exactly ${asp.w} × ${asp.h} px · aspect ${asp.label}`);
      P.push('• Format: PNG, high fidelity, no compression artifacts');
      P.push(`• Background: ${bg.en}`);
      P.push('• Subject centered, filling 70–85% of the frame');
      P.push('• Single view, single plane — no multi-panel montage');
      P.push(d.labeled ? `• Legible ${d.labelLangEn||''} anatomical labels placed on the correct structures` : '• No text or labels of any kind');
      if (d.negOn){ P.push('\n═══ NEGATIVE — never include ═══'); P.push(neg.en); }
      P.push('\n═══ OUTPUT ═══');
      P.push('Output exactly 1 image. Do not explain. No captions, no legend text.');
    }
    return P.join('\n');
  }

  // ── Assemble ONE series batch for a language ─────────────────────────
  function assembleSeriesBatch(d, batch, lang){
    const L = lang === 'ar';
    const sp = specialtyFor(d.region, d.organ);
    const rl = renderLine(d);
    const asp = aspectFor(d.modality, d.plane, d.organ);
    const neg = negatives(true);
    const vn = viewNoun(d.plane, lang);
    const s = d.series;
    const N = batch.count;
    const multi = batch.total > 1;
    const levels = s.levels.slice(batch.from - 1, batch.to);
    const P = [];
    if (L){
      P.push(`أنت ${sp.ar} معتمد. أنتج ${N} صورة تعليمية (غير تشخيصية) **منفصلة** (وليست كولاج أو شبكة). ارسم بدقّة ما هو محدَّد.`);
      if (multi) P.push(`(الدفعة ${batch.index + 1} من ${batch.total} — من سلسلة كاملة قوامها ${s.count} شريحة؛ حافظ على بروتوكول وتكبير مطابقَين للدفعات الأخرى.)`);
      P.push('\n═══ التصوير (ACQUISITION) ═══');
      P.push(`${d.modalityAr} · ${d.planeAr} ${vn} · ${d.latAr||''}${s.organAr || s.organEn} · ${d.techShortAr ? d.techShortAr + ' · ' : ''}مريض ${d.patientAr} · ${d.purposeAr}`);
      P.push('\n═══ العرض (RENDERING) ═══');
      P.push(rl.ar);
      P.push('\n═══ المستويات (صورة واحدة لكل مستوى، بهذا الترتيب) ═══');
      levels.forEach((lv, i) => { P.push(`${batch.from + i}. ${lv.ar}${(lv.structures && lv.structures.length) ? ' — البنى: ' + lv.structures.join('، ') : ''}`); });
      realismBullets(d.modality, d.region, s.organEn, 'ar').forEach(b => P.push('• ' + b));
      P.push('• ' + scopeBullet('ar'));
      P.push('\n═══ مواصفات الصورة ═══');
      P.push(`• الحجم: ${asp.w} × ${asp.h} بكسل لكل صورة · النسبة ${asp.label}`);
      P.push('• الصيغة: PNG عالية الدقة · الخلفية: أسود نقي (#000000)');
      P.push('• البنية في المنتصف ٧٠–٨٥٪ · مستوى واحد لكل صورة');
      P.push('• ثابت (INVARIANT): بروتوكول تصوير وتكبير ونافذة **متطابقة** عبر كل الصور');
      if (d.negOn){ P.push('\n═══ ممنوع منعاً باتّاً ═══'); P.push(neg.ar); }
      P.push('\n═══ عقد الإخراج (OUTPUT) ═══');
      P.push(`أخرج ${N} صورة منفصلة بالترتيب المذكور في نفس الردّ. لا تشرح، بلا تعليقات أو نصّ تفسيري.`);
    } else {
      P.push(`You are a board-certified ${sp.en}. Produce ${N} educational, non-diagnostic radiology teaching-file images as SEPARATE individual images (NOT a collage or grid). Draw exactly what is specified.`);
      if (multi) P.push(`(Batch ${batch.index + 1} of ${batch.total} — part of a full ${s.count}-slice series; keep protocol and zoom identical to the other batches.)`);
      P.push('\n═══ ACQUISITION ═══');
      P.push(`${d.modality} · ${d.plane} ${vn} · ${d.latEn||''}${s.organEn} · ${d.techShortEn ? d.techShortEn + ' · ' : ''}${d.patientEn} patient · ${d.purposeEn}`);
      P.push('\n═══ RENDERING ═══');
      P.push(rl.en);
      P.push('\n═══ LEVELS (one image per level, in this exact order) ═══');
      levels.forEach((lv, i) => { P.push(`${batch.from + i}. ${lv.en}${(lv.structures && lv.structures.length) ? ' — key structures: ' + lv.structures.join(', ') : ''}`); });
      realismBullets(d.modality, d.region, s.organEn, 'en').forEach(b => P.push('• ' + b));
      P.push('• ' + scopeBullet('en'));
      P.push('\n═══ IMAGE SPECIFICATIONS ═══');
      P.push(`• Size: exactly ${asp.w} × ${asp.h} px each · aspect ${asp.label}`);
      P.push('• Format: PNG, high fidelity · Background: pure black (#000000)');
      P.push('• Subject centered 70–85% · single plane per image');
      P.push('• INVARIANT: identical acquisition protocol, zoom, and windowing across ALL images');
      if (d.negOn){ P.push('\n═══ NEGATIVE — never include ═══'); P.push(neg.en); }
      P.push('\n═══ OUTPUT ═══');
      P.push(`Output ${N} separate individual images in the listed order, in the same response. Do not explain. No captions, no legend text.`);
    }
    return P.join('\n');
  }

  const BATCH_DIVIDER = { en: '\n\n━━━━━━━━━━ NEXT BATCH — paste in a NEW ChatGPT message ━━━━━━━━━━\n\n',
                          ar: '\n\n━━━━━━━━━━ الدفعة التالية — الصقها في رسالة ChatGPT جديدة ━━━━━━━━━━\n\n' };

  /* Master builder. `d` is a language-neutral descriptor prepared by Studio.
   * Returns { en, ar, neg:{en,ar}, meta:{ series, count, batchCount, batches } }. */
  function buildPrompt(d){
    d = d || {};
    if (d.series && d.series.levels && d.series.count > 0){
      const s = d.series;
      const plan = batchPlan(s.count);
      const batches = plan.map(b => Object.assign({}, b, {
        en: assembleSeriesBatch(d, b, 'en'),
        ar: assembleSeriesBatch(d, b, 'ar')
      }));
      const en = batches.map(b => b.en).join(BATCH_DIVIDER.en);
      const ar = batches.map(b => b.ar).join(BATCH_DIVIDER.ar);
      return { en, ar, neg: negatives(true), meta: { series:true, count:s.count, batchCount:batches.length, batches } };
    }
    return { en: assembleSingle(d, 'en'), ar: assembleSingle(d, 'ar'),
             neg: negatives(false), meta: { series:false, count:1, batchCount:1, batches:[{from:1,to:1,count:1,index:0,total:1}] } };
  }

  // ── Attach runtime normalization to a viewer <img> ───────────────────
  //  Guarantees the image is centered inside its container and never
  //  distorted, regardless of source aspect ratio.
  function attachViewerNormalization(imgEl){
    if (!imgEl) return;
    imgEl.style.maxWidth  = '100%';
    imgEl.style.maxHeight = '100%';
    imgEl.style.width     = 'auto';
    imgEl.style.height    = 'auto';
    imgEl.style.objectFit = 'contain';
    imgEl.style.display   = 'block';
    imgEl.style.margin    = 'auto';
    imgEl.setAttribute('draggable', 'false');
  }

  // ── Small dimensions badge (for tiles/cards) ─────────────────────────
  function renderDimensionsBadge(w, h){
    if (!w || !h) return '';
    const dim = validateDimensions(w, h);
    const color = dim.level === 'ok' ? '#10b981' : (dim.level === 'warn' ? '#f59e0b' : '#ef4444');
    const bg    = dim.level === 'ok' ? 'rgba(16,185,129,.10)' : (dim.level === 'warn' ? 'rgba(245,158,11,.10)' : 'rgba(239,68,68,.10)');
    return `<span class="omr-dim-badge" style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:4px;font:600 10px 'IBM Plex Mono',monospace;color:${color};background:${bg};border:1px solid ${color}55;letter-spacing:.02em" title="${dim.reason}">${w}×${h}</span>`;
  }

  const API = {
    STANDARD, RECOMMENDED, MAX_IMAGES_PER_REQUEST,
    aspectClass, validateDimensions, validateFile,
    recommendedSize,
    // Prompt Skeleton v4 (single source of truth)
    buildPrompt, specialtyFor, renderLine, aspectFor, backgroundFor, batchPlan, negatives,
    attachViewerNormalization, renderDimensionsBadge
  };
  if (typeof window !== 'undefined') window.OmniRadImageStd = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;

  // ── Auto-inject a shared CSS rule that normalizes any medical image
  //    inside known containers on every page (atlas cards, comparison panes,
  //    series thumbnails, tiles, review cards, anatomy-review thumbs).
  //    All render with object-fit:contain over a black background so AI-generated
  //    images with off-standard aspect ratios letterbox/pillarbox cleanly instead
  //    of stretching or overflowing.
  const NORMALIZATION_CSS = `
.card-img,.asc-thumb,.series-thumb,.tile,.series-strip .series-thumb,.tile img,
.card-img img,.asc-thumb img,.series-thumb img,.atlas-tile img,
.atlas-series-card .asc-thumb img,
[data-omr-medical],[data-omr-medical] img{
  background:#000;
}
.card-img img,.asc-thumb img,.series-thumb img,.atlas-tile img,
.atlas-series-card .asc-thumb img,.tile img,
[data-omr-medical] img,.omr-medical-img,img.omr-medical{
  max-width:100%;max-height:100%;width:auto !important;height:auto !important;
  object-fit:contain !important;display:block;margin:auto;
  image-rendering:crisp-edges;-webkit-user-drag:none;user-select:none;
}
`;
  function injectNormalizationCss(){
    if (typeof document === 'undefined') return;
    if (document.getElementById('omr-image-std-css')) return;
    const s = document.createElement('style');
    s.id = 'omr-image-std-css';
    s.textContent = NORMALIZATION_CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  if (typeof document !== 'undefined'){
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', injectNormalizationCss);
    } else { injectNormalizationCss(); }
  }
})();
