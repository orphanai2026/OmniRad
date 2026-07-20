/* ═══════════════════════════════════════════════════════════════
   OmniRad — Studio (in-platform prompt tool)
   ─────────────────────────────────────────────────────────────
   Phase 1: skeleton + Custom form + live preview + filename
   Reuses: i18n, supabase (auth guard), anatomy-dict, structures data
   Phases 2-5 add Presets, Case Builder, and Library.

   AUTO-GEN DISABLED (Phase 3 Sprint 1 · 12 Jul 2026):
     Auto-generation via fal.ai/FLUX/Gemini is gated behind
     window.OmniRadFeatures.AUTOGEN (see modules/feature-flags.js).
     Manual ChatGPT workflow is the sole production path.
     Legacy doGenerate() preserved below for restore.
     Restore: flip AUTOGEN=true + run supabase/studio-autogen-restore.sql.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const $ = id => document.getElementById(id);
  const q = (sel, root) => (root || document).querySelector(sel);
  const qa = (sel, root) => [...(root || document).querySelectorAll(sel)];

  /* ─── Feature flags (defense in depth: optional-chain + local snapshot) ─── */
  const FEATURE_AUTOGEN = !!(window.OmniRadFeatures && window.OmniRadFeatures.AUTOGEN);

  /* ─── Legacy auto-gen constants (behind FEATURE_AUTOGEN) ─── */
  const AUTOGEN_MODEL_LEGACY = 'fal-ai/flux/schnell'; // deprecated 2026-07-12

  /* ─── i18n strings for this page ─── */
  const I18N = {
    en: {
      'studio.eyebrow': 'OmniRad · Studio',
      'studio.h1': 'Medical Prompt Studio',
      'studio.sub': 'Generate professional radiology prompts with bilingual output, ACR-informed presets and a pathology-first case builder. Admin/Contributor-only workspace.',
      'studio.disc.t': 'Medical notice',
      'studio.disc.d': 'Generated images and prompts are for illustrative educational use only — not for diagnosis or clinical decisions. AI generators may produce anatomically inaccurate details; every image must be reviewed by a qualified professional before educational use.',
      'studio.tabCustom': 'Custom', 'studio.tabPresets': 'Presets', 'studio.tabCase': 'Case Builder', 'studio.tabLibrary': 'Library',
      'studio.sec1': '1 · Clinical context', 'studio.sec2': '2 · Patient', 'studio.sec3': '3 · Anatomy',
      'studio.quickFind': 'Quick find — region · organ · structure',
      'studio.sec4': '4 · Findings', 'studio.sec5': '5 · Technical', 'studio.sec6': '6 · Output',
      'studio.required': 'Required', 'studio.optional': 'Optional',
      'studio.fname': 'Suggested filename',
      'studio.reset': '↺ Reset', 'studio.save': '💾 Save to history',
      'studio.gateChecking': 'Checking access…', 'studio.gateVerify': 'Verifying your role.',
      'studio.gateSignin': 'Sign in required', 'studio.gateSigninMsg': 'This workspace is restricted to Admin and Contributor accounts. Sign in to continue.',
      'studio.gateDenied': 'Access restricted', 'studio.gateDeniedMsg': 'Your account does not have Admin/Contributor rights. Contact the platform owner if you need access.',
      'studio.gateSigninBtn': 'Sign in',
      'fields.modality': 'Modality', 'fields.view': 'View / Plane', 'fields.laterality': 'Laterality',
      'fields.sex': 'Sex', 'fields.age': 'Age group', 'fields.purpose': 'Clinical purpose',
      'fields.region': 'Anatomical region', 'fields.organ': 'Organ', 'fields.slice': 'Slice level (optional)',
      'fields.callouts': 'Structures to label (optional)', 'fields.seriesOn': 'Generate as series (multiple anatomical levels in one prompt)', 'fields.normalPath': 'Normal / pathological',
      'fields.pathCase': 'Expected pathology', 'fields.style': 'Rendering style', 'fields.labels': 'Labels',
      'fields.labelLang': 'Label language', 'fields.segmentation': 'Segmentation overlay',
      'fields.learner': 'Learner level', 'fields.lang': 'Prompt language', 'fields.negOn': 'Include Negative prompt (recommended)',
      'fields.sequence': 'MRI sequence', 'fields.phase': 'CT contrast phase', 'fields.window': 'CT window',
      'fields.usMode': 'Ultrasound mode', 'fields.tracer': 'Nuclear tracer', 'fields.stain': 'Histology stain',
      'fields.magnification': 'Magnification', 'fields.sliceThickness': 'Slice thickness', 'fields.fluoroContrast': 'Fluoroscopy contrast',
      'copy.copied': '✓ Copied!'
    },
    ar: {
      'studio.eyebrow': 'OmniRad · الاستوديو',
      'studio.h1': 'استوديو البرومبت الطبي',
      'studio.sub': 'ولّد برومبتات إشعاعية احترافية بمخرج ثنائي اللغة، قوائم جاهزة مبنية على معايير ACR، وبناء حالة يبدأ من المرض. مساحة عمل للأدمن والمساهمين فقط.',
      'studio.disc.t': 'تنبيه طبي',
      'studio.disc.d': 'الصور والبرومبتات المولّدة لأغراض توضيحية تعليمية فقط — ليست للتشخيص أو القرار السريري. مولّدات الصور قد تُنتج تفاصيل تشريحية غير دقيقة؛ يجب مراجعة كل صورة من مختص قبل استخدامها.',
      'studio.tabCustom': 'متقدّم', 'studio.tabPresets': 'حالات جاهزة', 'studio.tabCase': 'مبني على الحالة', 'studio.tabLibrary': 'المكتبة',
      'studio.sec1': '١ · السياق السريري', 'studio.sec2': '٢ · المريض', 'studio.sec3': '٣ · التشريح',
      'studio.quickFind': 'بحث سريع — منطقة · عضو · بنية',
      'studio.sec4': '٤ · الموجودات', 'studio.sec5': '٥ · المعطيات التقنية', 'studio.sec6': '٦ · الإخراج',
      'studio.required': 'إلزامي', 'studio.optional': 'اختياري',
      'studio.fname': 'اسم الصورة المقترح',
      'studio.reset': '↺ تفريغ', 'studio.save': '💾 حفظ في السجل',
      'studio.gateChecking': 'التحقق من الصلاحية…', 'studio.gateVerify': 'جارٍ التحقق من دورك.',
      'studio.gateSignin': 'يلزم تسجيل الدخول', 'studio.gateSigninMsg': 'هذه المساحة مقيّدة لحسابات الأدمن والمساهمين. سجّل الدخول للمتابعة.',
      'studio.gateDenied': 'الوصول مقيّد', 'studio.gateDeniedMsg': 'حسابك لا يملك صلاحيات أدمن/مساهم. تواصل مع مسؤول المنصّة لطلب الصلاحية.',
      'studio.gateSigninBtn': 'تسجيل الدخول',
      'fields.modality': 'المودلتي', 'fields.view': 'المقطع / المستوى', 'fields.laterality': 'الجانب',
      'fields.sex': 'الجنس', 'fields.age': 'الفئة العمرية', 'fields.purpose': 'الغرض السريري',
      'fields.region': 'المنطقة التشريحية', 'fields.organ': 'العضو', 'fields.slice': 'مستوى المقطع (اختياري)',
      'fields.callouts': 'تراكيب للتسمية (اختياري)', 'fields.seriesOn': 'توليد كسلسلة (عدّة مستويات تشريحية في برومبت واحد)', 'fields.normalPath': 'طبيعي / مرضي',
      'fields.pathCase': 'الحالة المرضية المتوقّعة', 'fields.style': 'نمط الصورة', 'fields.labels': 'الوسم',
      'fields.labelLang': 'لغة التسميات', 'fields.segmentation': 'التقطيع/التلوين',
      'fields.learner': 'مستوى المتعلّم', 'fields.lang': 'لغة البرومبت', 'fields.negOn': 'تضمين Negative prompt (موصى به)',
      'fields.sequence': 'تسلسل الرنين', 'fields.phase': 'مرحلة الصبغة CT', 'fields.window': 'نافذة CT',
      'fields.usMode': 'وضع الموجات الصوتية', 'fields.tracer': 'المتتبّع النووي', 'fields.stain': 'صبغة نسيجية',
      'fields.magnification': 'التكبير', 'fields.sliceThickness': 'سماكة المقطع', 'fields.fluoroContrast': 'صبغة التنظير الفلوري',
      'copy.copied': '✓ تم النسخ'
    }
  };
  window.addEventListener('omnirad-lang', ()=>{ applyI18n(); render(); });
  function applyI18n(){
    const lang = (window.OmniRadI18n && OmniRadI18n.lang) || 'en';
    const dict = I18N[lang] || I18N.en;
    qa('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (dict[k]) el.textContent = dict[k]; });
  }
  function t(k){ const lang = (window.OmniRadI18n && OmniRadI18n.lang) || 'en'; return (I18N[lang]||I18N.en)[k] || k; }
  function isAr(){ return ((window.OmniRadI18n && OmniRadI18n.lang) || 'en') === 'ar'; }

  /* ─── Option catalog (bilingual) ─── */
  const OPT = {
    modality: [
      {v:'X-Ray',ar:'أشعة سينية'},{v:'CT',ar:'مقطعية CT'},{v:'MRI',ar:'رنين MRI'},{v:'Ultrasound',ar:'موجات صوتية US'},
      {v:'Nuclear Medicine',ar:'طب نووي'},{v:'Fluoroscopy',ar:'تنظير فلوري'},{v:'Mammography',ar:'تصوير الثدي'},
      {v:'Angiography',ar:'تصوير أوعية'},{v:'PET/CT',ar:'PET/CT'},{v:'DEXA',ar:'DEXA'},
      {v:'Histology',ar:'نسيجي مجهري'},{v:'Endoscopy',ar:'منظار'}
    ],
    view: {
      _default: [{v:'Axial',ar:'محوري'},{v:'Coronal',ar:'إكليلي'},{v:'Sagittal',ar:'سهمي'},{v:'Oblique',ar:'مائل'}],
      'X-Ray': [{v:'PA',ar:'PA'},{v:'AP',ar:'AP'},{v:'Lateral',ar:'جانبي'},{v:'Oblique',ar:'مائل'}],
      Mammography: [{v:'CC',ar:'CC'},{v:'MLO',ar:'MLO'}],
      Ultrasound: [{v:'Longitudinal',ar:'طولي'},{v:'Transverse',ar:'عرضي'},{v:'Oblique',ar:'مائل'}],
      Angiography: [{v:'AP',ar:'AP'},{v:'Lateral',ar:'جانبي'},{v:'Oblique',ar:'مائل'}],
      Endoscopy: [{v:'Direct view',ar:'رؤية مباشرة'}],
      Histology: [{v:'Slide',ar:'شريحة'}]
    },
    laterality:[{v:'N/A',ar:'غير محدد'},{v:'Right',ar:'الأيمن'},{v:'Left',ar:'الأيسر'},{v:'Bilateral',ar:'ثنائي الجانب'},{v:'Midline',ar:'خط الوسط'}],
    sex:[{v:'Male',ar:'ذكر'},{v:'Female',ar:'أنثى'}],
    age:[{v:'Neonate',ar:'حديث ولادة'},{v:'Pediatric',ar:'طفل'},{v:'Adolescent',ar:'مراهق'},{v:'Adult',ar:'بالغ'},{v:'Elderly',ar:'مسن'}],
    purpose:[{v:'Diagnostic',ar:'تشخيصي'},{v:'Emergency',ar:'طارئ'},{v:'Screening',ar:'فحص مبكر'},{v:'Treatment follow-up',ar:'متابعة علاج'},{v:'Treatment planning',ar:'تخطيط علاجي'},{v:'Interventional',ar:'تداخلي'},{v:'Functional',ar:'وظيفي'}],
    normalPath:[{v:'Normal',ar:'طبيعي'},{v:'Pathological',ar:'مرضي'}],
    segmentation:[{v:'None',ar:'بدون'},{v:'Color-coded overlay',ar:'تظليل ملون'},{v:'Contour outline',ar:'حدود محيطية'},{v:'Highlighted ROI',ar:'إبراز منطقة الاهتمام'}],
    style:[{v:'Educational illustration',ar:'رسم تعليمي'},{v:'Photorealistic scan',ar:'مسح واقعي'},{v:'3D anatomical render',ar:'تجسيم ثلاثي'},{v:'Labeled diagram',ar:'مخطط موسوم'}],
    labels:[{v:'With anatomical labels',ar:'مع تسميات'},{v:'No labels',ar:'بدون تسميات'}],
    labelLang:[{v:'Both',ar:'عربي + إنجليزي'},{v:'English',ar:'إنجليزي'},{v:'Arabic',ar:'عربي'}],
    learner:[{v:'Student',ar:'طالب'},{v:'Doctor',ar:'طبيب'}],
    lang:[{v:'Both',ar:'كلاهما'},{v:'English',ar:'إنجليزي'},{v:'Arabic',ar:'عربي'}],
    /* modality-specific technical */
    sequence:[{v:'T1',ar:'T1'},{v:'T2',ar:'T2'},{v:'FLAIR',ar:'FLAIR'},{v:'DWI',ar:'DWI'},{v:'ADC',ar:'ADC'},{v:'T1+C',ar:'T1+C'},{v:'STIR',ar:'STIR'},{v:'SWI',ar:'SWI'},{v:'MRA',ar:'MRA'}],
    phase:[{v:'Non-contrast',ar:'بدون صبغة'},{v:'Arterial',ar:'شرياني'},{v:'Portal venous',ar:'وريدي'},{v:'Delayed',ar:'متأخر'},{v:'Nephrogenic',ar:'كلوي'}],
    window:[{v:'Soft tissue',ar:'أنسجة رخوة'},{v:'Bone',ar:'عظم'},{v:'Lung',ar:'رئة'},{v:'Brain',ar:'دماغ'},{v:'Mediastinum',ar:'منصف'}],
    usMode:[{v:'B-mode grayscale',ar:'B-mode رمادي'},{v:'Color Doppler',ar:'دوبلر ملون'},{v:'Power Doppler',ar:'دوبلر قدرة'},{v:'Spectral Doppler',ar:'دوبلر طيفي'},{v:'Elastography',ar:'تصوير المرونة'}],
    tracer:[{v:'F-18 FDG',ar:'F-18 FDG'},{v:'Tc-99m MDP',ar:'Tc-99m MDP'},{v:'Tc-99m DMSA',ar:'Tc-99m DMSA'},{v:'Ga-68 DOTATATE',ar:'Ga-68 DOTATATE'},{v:'I-131',ar:'I-131'}],
    stain:[{v:'H&E',ar:'H&E'},{v:'PAS',ar:'PAS'},{v:'IHC',ar:'IHC'},{v:'Trichrome',ar:'Trichrome'}],
    magnification:[{v:'×4',ar:'×4'},{v:'×10',ar:'×10'},{v:'×20',ar:'×20'},{v:'×40',ar:'×40'},{v:'×100',ar:'×100'}],
    sliceThickness:[{v:'Per protocol',ar:'حسب البروتوكول'},{v:'1 mm',ar:'1 مم'},{v:'3 mm',ar:'3 مم'},{v:'5 mm',ar:'5 مم'}],
    fluoroContrast:[{v:'Barium contrast',ar:'صبغة الباريوم'},{v:'Iodinated contrast',ar:'صبغة يودية'},{v:'Air contrast',ar:'هواء'}]
  };

  /* ─── State ─── */
  const DEF = () => ({
    modality:'CT',view:'Axial',laterality:'N/A',sex:'Male',age:'Adult',purpose:'Diagnostic',
    region:'',organ:'',slice:'',callouts:'',
    normalPath:'Normal',pathCase:'',
    style:'Educational illustration',labels:'With anatomical labels',labelLang:'Both',
    segmentation:'None',learner:'Student',lang:'Both',negOn:true,seriesOn:false,
    sequence:'T2',phase:'Non-contrast',window:'Soft tissue',
    usMode:'B-mode grayscale',tracer:'F-18 FDG',stain:'H&E',
    magnification:'×10',sliceThickness:'Per protocol',fluoroContrast:'Barium contrast',
    copied:''
  });
  const state = { s: DEF(), tab:'custom', collapsed:{patient:false, findings:false, tech:false, output:false} };

  /* ─── Load from localStorage ─── */
  try { const p = JSON.parse(localStorage.getItem('omr_studio')||'null'); if (p && p.s) state.s = {...state.s, ...p.s}; } catch(e){}
  function persist(){ try { localStorage.setItem('omr_studio', JSON.stringify({s:state.s})); } catch(e){} }

  /* ─── Access guard ─── */
  async function guard(){
    // Wait for supabase client
    let tries = 0;
    while (!(window.OmniRadAuth && OmniRadAuth.client) && tries < 40){ await new Promise(r=>setTimeout(r,80)); tries++; }
    if (!window.OmniRadAuth){ return showGate('signin'); }
    const { data: { session } } = await OmniRadAuth.client.auth.getSession();
    if (!session){ return showGate('signin'); }
    // Fetch profile role
    const { data: profile } = await OmniRadAuth.client.from('profiles').select('role, email').eq('id', session.user.id).maybeSingle();
    if (!profile || !['admin','contributor'].includes(profile.role)){ return showGate('denied'); }
    // Access granted
    $('gate').style.display = 'none'; $('app').style.display = 'block';
    init();
  }
  function showGate(kind){
    const el = $('gate'); el.style.display = 'grid';
    if (kind === 'signin'){ $('gateTitle').textContent = t('studio.gateSignin'); $('gateMsg').textContent = t('studio.gateSigninMsg'); $('gateCta').style.display='inline-block'; $('gateCta').textContent = t('studio.gateSigninBtn'); }
    else { $('gateTitle').textContent = t('studio.gateDenied'); $('gateMsg').textContent = t('studio.gateDeniedMsg'); $('gateCta').style.display='none'; }
  }

  /* ─── Populate selects + datalists ─── */
  function populate(){
    const ar = isAr();
    const label = o => ar ? o.ar : o.v;
    qa('select[data-key]').forEach(sel => {
      const k = sel.dataset.key;
      let opts = OPT[k];
      if (k === 'view') opts = OPT.view[state.s.modality] || OPT.view._default;
      if (!opts) return;
      sel.innerHTML = opts.map(o => `<option value="${o.v}">${label(o)}</option>`).join('');
      sel.value = state.s[k];
    });
    // Anatomy datalists from OMNIRAD_ANATOMY (unified master reference)
    const A = window.OMNIRAD_ANATOMY;
    const dict = A
      ? A.structures.map(s => {
          const reg = A.regions.find(r => r.id === s.region);
          return [s.en, s.ar, reg ? reg.en : s.region];
        })
      : (window.ANATOMY_DICT || []); // fallback to legacy
    $('anat-all').innerHTML = dict.map(row => `<option value="${row[0]}">${row[1] || ''} · ${row[2] || ''}</option>`).join('');
    const region = (state.s.region || '').trim();
    const regionEntries = region
      ? dict.filter(row => (row[2] || '').toLowerCase() === region.toLowerCase() || (row[2] || '').toLowerCase().includes(region.toLowerCase()))
      : dict;
    $('anat-region').innerHTML = regionEntries.map(row => `<option value="${row[0]}">${row[1] || ''}</option>`).join('');

    // Region dropdown — prefer the unified 9 canonical regions from master
    const CUSTOM = '__custom__';
    const uniqRegions = A
      ? A.regions.map(r => ({ v: r.en, ar: r.ar }))
      : [...new Set(dict.map(r => r[2]).filter(Boolean))].sort().map(r => ({ v:r, ar:r }));
    const selR = $('selRegion');
    if (selR){
      selR.innerHTML = '<option value="">— ' + (ar?'اختر المنطقة':'Select region') + ' —</option>'
        + uniqRegions.map(r => `<option value="${r.v}">${ar ? r.ar : r.v}</option>`).join('')
        + `<option value="${CUSTOM}">${ar?'✏️ إدخال يدوي…':'✏️ Custom…'}</option>`;
      const cur = state.s.region || '';
      const inList = uniqRegions.some(r => r.v === cur);
      if (cur && !inList){
        selR.value = CUSTOM;
        const inpR = $('inpRegionCustom'); if (inpR){ inpR.style.display=''; inpR.value = cur; }
      } else {
        selR.value = cur;
        const inpR = $('inpRegionCustom'); if (inpR){ inpR.style.display='none'; }
      }
    }
    // Populate Organ dropdown filtered by region
    const selO = $('selOrgan');
    if (selO){
      const scoped = region ? dict.filter(r => (r[2]||'').toLowerCase() === region.toLowerCase()) : [];
      if (!region){
        selO.disabled = true;
        selO.innerHTML = '<option value="">— ' + (ar?'اختر المنطقة أولاً':'Select region first') + ' —</option>';
      } else {
        selO.disabled = false;
        selO.innerHTML = '<option value="">— ' + (ar?'اختر العضو':'Select organ') + ' —</option>'
          + scoped.map(r => `<option value="${r[0]}">${ar?(r[1]||r[0]):r[0]}</option>`).join('')
          + `<option value="${CUSTOM}">${ar?'✏️ إدخال يدوي…':'✏️ Custom…'}</option>`;
        const cur = state.s.organ || '';
        const inList = scoped.some(r => r[0] === cur);
        if (cur && !inList){
          selO.value = CUSTOM;
          const inpO = $('inpOrganCustom'); if (inpO){ inpO.style.display=''; inpO.value = cur; }
        } else {
          selO.value = cur;
          const inpO = $('inpOrganCustom'); if (inpO){ inpO.style.display='none'; }
        }
      }
    }
    qa('input[data-key]').forEach(inp => {
      const k = inp.dataset.key;
      if (inp.type === 'checkbox') inp.checked = !!state.s[k]; else if (state.s[k] != null) inp.value = state.s[k];
    });
    // Pathology dropdown when Pathological
    const pathBox = q('.pathCase');
    if (state.s.normalPath === 'Pathological'){ pathBox.style.display = 'flex'; populatePathology(); } else { pathBox.style.display = 'none'; }
    // Technical grid (modality-dependent)
    renderTechGrid();
  }

  function populatePathology(){
    const acr = window.OMNIRAD_ACR || {};
    const list = Object.keys(acr).sort();
    const ar = isAr();
    const sel = q('select[data-key="pathCase"]');
    sel.innerHTML = '<option value="">— ' + (ar?'اختر الحالة —':'Select condition —') + '</option>' +
      list.map(k => `<option value="${k}">${k}</option>`).join('');
    sel.value = state.s.pathCase || '';
  }

  function renderTechGrid(){
    const g = $('techGrid'); g.innerHTML = '';
    const ar = isAr();
    const label = o => ar ? o.ar : o.v;
    const fields = [];
    switch (state.s.modality){
      case 'MRI': fields.push({k:'sequence', lbl:t('fields.sequence')}, {k:'sliceThickness', lbl:t('fields.sliceThickness')}); break;
      case 'CT': fields.push({k:'phase', lbl:t('fields.phase')}, {k:'window', lbl:t('fields.window')}, {k:'sliceThickness', lbl:t('fields.sliceThickness')}); break;
      case 'PET/CT': fields.push({k:'tracer', lbl:t('fields.tracer')}, {k:'sliceThickness', lbl:t('fields.sliceThickness')}); break;
      case 'Nuclear Medicine': fields.push({k:'tracer', lbl:t('fields.tracer')}); break;
      case 'Ultrasound': fields.push({k:'usMode', lbl:t('fields.usMode')}); break;
      case 'Fluoroscopy': fields.push({k:'fluoroContrast', lbl:t('fields.fluoroContrast')}); break;
      case 'Histology': fields.push({k:'stain', lbl:t('fields.stain')}, {k:'magnification', lbl:t('fields.magnification')}); break;
    }
    if (!fields.length){ g.parentElement.parentElement.style.display = 'none'; return; }
    g.parentElement.parentElement.style.display = 'block';
    fields.forEach(f => {
      const opts = OPT[f.k] || [];
      const div = document.createElement('div'); div.className = 'f';
      div.innerHTML = `<label>${f.lbl}</label><select data-key="${f.k}">${opts.map(o=>`<option value="${o.v}"${o.v===state.s[f.k]?' selected':''}>${label(o)}</option>`).join('')}</select>`;
      g.appendChild(div);
    });
    // Rebind change on newly-created selects
    qa('select[data-key]', g).forEach(sel => sel.addEventListener('change', onChange));
  }

  /* ─── Prompt builder ─── */
  function arOpt(k, v){ const arr = OPT[k]; if (!Array.isArray(arr)) return v; const o = arr.find(x=>x.v===v); return o ? o.ar : v; }
  function build(){
    const s = state.s;
    if (s.seriesOn){
      const entry = window.OMNIRAD_SERIES_SLICES && OMNIRAD_SERIES_SLICES.find(s.organ);
      if (entry) return buildSeries(entry);
    }
    const style = s.style.toLowerCase();
    const view = s.view;
    const modality = s.modality;
    const modAr = arOpt('modality', modality);
    const viewAr = arOpt('view', view) || view;
    const organ = s.organ || 'target organ';
    const region = s.region || '';
    const lat = s.laterality === 'N/A' ? '' : (s.laterality === 'Right' ? 'right ' : s.laterality === 'Left' ? 'left ' : s.laterality === 'Bilateral' ? 'bilateral ' : 'midline ');
    const latAr = s.laterality === 'N/A' ? '' : (s.laterality === 'Right' ? 'الأيمن ' : s.laterality === 'Left' ? 'الأيسر ' : s.laterality === 'Bilateral' ? 'ثنائي الجانب ' : 'خط الوسط ');
    const patient = `${s.sex.toLowerCase()} ${s.age.toLowerCase()}`;
    const patientAr = `${arOpt('sex', s.sex)} ${arOpt('age', s.age)}`;
    const purpose = s.purpose;
    const purposeAr = arOpt('purpose', s.purpose);
    const findings = s.normalPath === 'Normal' ? 'normal appearance' : (s.pathCase ? `showing ${s.pathCase}` : 'pathological findings');
    const findingsAr = s.normalPath === 'Normal' ? 'مظهر طبيعي' : (s.pathCase ? `تُظهر ${s.pathCase}` : 'موجودات مرضية');
    const labeled = s.labels === 'With anatomical labels';
    // Callouts only make sense WITH labels; ignored (and the field hidden) otherwise.
    const callouts = (labeled && s.callouts) ? `, specifically labeling: ${s.callouts}` : '';
    const calloutsAr = (labeled && s.callouts) ? `، مع تسمية محدّدة لـ: ${s.callouts}` : '';
    const slice = s.slice ? ` at ${s.slice}` : '';
    const sliceAr = s.slice ? ` عند ${s.slice}` : '';
    const labelLang = labeled ? (s.labelLang === 'Both' ? 'bilingual (English + Arabic) ' : s.labelLang === 'Arabic' ? 'Arabic ' : 'English ') : '';
    const labels = labeled ? `, with clear ${labelLang}anatomical labels` : ', no text or labels';
    const labelsAr = labeled ? `، مع تسميات تشريحية واضحة${s.labelLang==='English'?' بالإنجليزية':s.labelLang==='Arabic'?' بالعربية':' بالعربية والإنجليزية'}` : '، بدون نصوص أو تسميات';
    // Segmentation is itself a labeling/annotation overlay — suppress it when "No labels".
    const segOn = labeled && s.segmentation !== 'None';
    const seg = segOn ? `, with ${s.segmentation.toLowerCase()}` : '';
    const segAr = segOn ? `، مع ${arOpt('segmentation', s.segmentation)}` : '';
    // Modality-specific tech
    let tech = '', techAr = '';
    if (modality === 'MRI'){ tech = `, ${s.sequence} sequence, ${s.sliceThickness} slice thickness`; techAr = `، تسلسل ${s.sequence}، سماكة ${s.sliceThickness}`; }
    else if (modality === 'CT'){ tech = `, ${s.phase} phase, ${s.window} window, ${s.sliceThickness} slice`; techAr = `، مرحلة ${arOpt('phase',s.phase)}، نافذة ${arOpt('window',s.window)}، سماكة ${s.sliceThickness}`; }
    else if (modality === 'PET/CT'){ tech = `, ${s.tracer} tracer`; techAr = `، متتبّع ${s.tracer}`; }
    else if (modality === 'Nuclear Medicine'){ tech = `, ${s.tracer} tracer`; techAr = `، متتبّع ${s.tracer}`; }
    else if (modality === 'Ultrasound'){ tech = `, ${s.usMode}`; techAr = `، ${arOpt('usMode',s.usMode)}`; }
    else if (modality === 'Fluoroscopy'){ tech = `, ${s.fluoroContrast}`; techAr = `، ${arOpt('fluoroContrast',s.fluoroContrast)}`; }
    else if (modality === 'Histology'){ tech = `, ${s.stain} stain at ${s.magnification}`; techAr = `، صبغة ${s.stain} بتكبير ${s.magnification}`; }

    const CROSS = ['Axial','Coronal','Sagittal','Oblique'];
    const viewNoun = CROSS.includes(view) ? 'section' : (view === 'Slide' ? 'micrograph' : 'projection');
    const en = `${s.style} of a ${lat}${modality} ${view} ${viewNoun} of the ${region ? region + ', ' : ''}${organ}${slice}, ${patient} patient, ${purpose.toLowerCase()}, ${findings}${callouts}${labels}${seg}${tech}. Anatomically accurate, high detail, professional medical teaching material at ${s.learner.toLowerCase()} level, high resolution 4K, clean neutral background.`;
    const ar_ = `${arOpt('style', s.style)} لـ${modAr} ${viewAr} لـ${region ? region + '، ' : ''}${organ}${sliceAr}، لمريض ${patientAr}، ${purposeAr}، ${findingsAr}${calloutsAr}${labelsAr}${segAr}${techAr}. دقيق تشريحياً، تفاصيل عالية، مادة تعليمية طبية لمستوى ${arOpt('learner', s.learner)}، دقة عالية 4K، خلفية محايدة نظيفة.`;
    const neg = 'no watermarks, no distortion, no anatomical inaccuracies, no artifacts, no text overlay, no logos, no signatures, no low-quality rendering, no blurry regions';
    return { en, ar: ar_, neg };
  }

  function suggestedName(){
    const clean = x => (x||'').toString().replace(/[^A-Za-z0-9-]+/g,'_').replace(/^_+|_+$/g,'');
    const s = state.s;
    const entry = s.seriesOn && window.OMNIRAD_SERIES_SLICES && OMNIRAD_SERIES_SLICES.find(s.organ);
    const parts = [
      s.organ || 'unspecified', s.modality, s.view,
      s.normalPath === 'Normal' ? 'Normal' : (s.pathCase || 'Pathological')
    ].map(clean).filter(Boolean);
    if (entry) return parts.join('_') + `_Series${entry.slices.length}.png`;
    return parts.join('_') + '.png';
  }

  /* ─── Series prompt builder (multiple anatomical levels, one combined prompt) ─── */
  function buildSeries(entry){
    const s = state.s;
    const N = entry.slices.length;
    const modAr = arOpt('modality', s.modality);
    const viewAr = arOpt('view', s.view) || s.view;
    const lat = s.laterality === 'N/A' ? '' : (s.laterality === 'Right' ? 'right ' : s.laterality === 'Left' ? 'left ' : s.laterality === 'Bilateral' ? 'bilateral ' : 'midline ');
    const latAr = s.laterality === 'N/A' ? '' : (s.laterality === 'Right' ? 'الأيمن ' : s.laterality === 'Left' ? 'الأيسر ' : s.laterality === 'Bilateral' ? 'ثنائي الجانب ' : 'خط الوسط ');
    const patient = `${s.sex.toLowerCase()} ${s.age.toLowerCase()}`;
    const patientAr = `${arOpt('sex', s.sex)} ${arOpt('age', s.age)}`;
    // Carry the modality technical protocol across the whole series (medically
    // correct — every slice shares one acquisition protocol).
    let tech = '', techAr = '';
    if (s.modality === 'MRI'){ tech = `, ${s.sequence} sequence`; techAr = `، تسلسل ${s.sequence}`; }
    else if (s.modality === 'CT'){ tech = `, ${s.phase} phase, ${s.window} window`; techAr = `، مرحلة ${arOpt('phase',s.phase)}، نافذة ${arOpt('window',s.window)}`; }
    else if (s.modality === 'PET/CT' || s.modality === 'Nuclear Medicine'){ tech = `, ${s.tracer} tracer`; techAr = `، متتبّع ${s.tracer}`; }
    else if (s.modality === 'Ultrasound'){ tech = `, ${s.usMode}`; techAr = `، ${arOpt('usMode',s.usMode)}`; }
    // Series output is a clean unlabeled stack for the atlas viewer — this is
    // intentional and overrides Labels/Segmentation/Style (noted in the UI).
    const levelsEn = entry.slices.map((lv,i) => `${i+1}. ${lv.en}`).join('\n');
    const levelsAr = entry.slices.map((lv,i) => `${i+1}. ${lv.ar}`).join('\n');
    const en = `Generate ${N} separate individual images (not a collage) of a ${lat}${s.modality} ${s.view} section of the ${entry.en}, ${patient} patient, ${s.purpose.toLowerCase()}${tech}. Each image must show one distinct anatomical level, in this exact order:\n${levelsEn}\nEach image: 1024×1024, black background, no text or labels, no watermarks, anatomically accurate, consistent acquisition protocol across all levels, high detail, professional medical teaching material at ${s.learner.toLowerCase()} level. Output all ${N} images as separate images in the same response, in the listed order.`;
    const ar_ = `ولّد ${N} صورة منفصلة (وليست Collage واحداً) لمقطع ${modAr} ${viewAr} لـ${latAr}${entry.ar}، لمريض ${patientAr}، ${arOpt('purpose', s.purpose)}${techAr}. كل صورة تُظهر مستوى تشريحياً مختلفاً، بهذا الترتيب بالضبط:\n${levelsAr}\nكل صورة: 1024×1024، خلفية سوداء، بلا نصوص أو تسميات، بلا علامات مائية، دقيقة تشريحياً، بروتوكول تصوير موحّد عبر كل المستويات، تفاصيل عالية، مادة تعليمية طبية احترافية لمستوى ${arOpt('learner', s.learner)}. أخرج كل الصور الـ${N} كصور منفصلة في نفس الردّ وبنفس الترتيب المذكور.`;
    const neg = 'no watermarks, no distortion, no anatomical inaccuracies, no artifacts, no text overlay, no logos, no signatures, no collage, no grid layout, no low-quality rendering, no blurry regions';
    return { en, ar: ar_, neg };
  }

  function renderSeriesInfo(){
    const box = $('seriesInfo'); if (!box) return;
    const s = state.s;
    if (!s.seriesOn){ box.style.display = 'none'; return; }
    const entry = window.OMNIRAD_SERIES_SLICES && OMNIRAD_SERIES_SLICES.find(s.organ);
    box.style.display = 'block';
    if (!entry){
      box.innerHTML = `<div class="warn" style="display:flex"><span class="wi">⚠️</span><div>${isAr() ? 'مستويات السلسلة غير مُعرَّفة لهذا العضو بعد — اختر عضواً من القائمة الجاهزة أو استخدم برومبت فردي.' : 'Series levels are not yet defined for this organ — pick one of the ready organs, or use a single prompt.'}</div></div>`;
      return;
    }
    const items = entry.slices.map((lv,i) => `<li>${i+1}. ${isAr() ? lv.ar : lv.en}</li>`).join('');
    const overrideMsg = isAr()
      ? 'وضع السلسلة يفرض: خلفية سوداء موحّدة، بلا تسميات/تلوين، حجم 1024×1024 — لأن الأطلس يعرضها كمكدّس نظيف. (تُنقل تقنية المودالتي: التسلسل/المرحلة/النافذة.)'
      : 'Series mode enforces: uniform black background, no labels/segmentation, 1024×1024 — the atlas shows them as a clean stack. (Modality technique — sequence/phase/window — is carried over.)';
    box.innerHTML = `<div style="background:var(--acc-sub, rgba(45,212,200,.08));border:1px solid var(--acc);border-radius:10px;padding:12px 14px">
      <div style="font-weight:800;font-size:12px;color:var(--acc);margin-bottom:6px">${isAr() ? `سلسلة ${entry.slices.length} مستويات — ${entry.ar}` : `${entry.slices.length}-level series — ${entry.en}`}</div>
      <ol style="margin:0;padding-inline-start:18px;font-size:12.5px;line-height:1.7;color:var(--text)">${items}</ol>
      <div style="margin-top:8px;font-size:11px;color:var(--text-s)">${isAr() ? 'سماكة وصفية (مرجع ACR):' : 'Descriptive thickness (ACR reference):'} ${entry.thicknessNote}</div>
      <div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--acc-dim);font-size:11px;color:var(--warn);line-height:1.6"><strong>ⓘ</strong> ${overrideMsg}</div>
    </div>`;
  }

  /* ─── Warnings (modality × organ / purpose) ─── */
  function checkWarnings(){
    const s = state.s;
    const warns = [];
    const skeletal = /(spine|bone|femur|humerus|pelvis|hand|foot|knee|shoulder|hip|elbow|ankle|wrist)/i.test(s.organ);
    const gi = /(esophagus|stomach|colon|rectum|bowel|larynx|pharynx)/i.test(s.organ);
    const vascular = /(aorta|artery|arteries|vein|veins|carotid|coronary)/i.test(s.organ);
    if (s.modality === 'Mammography' && !/breast/i.test(s.organ)) warns.push(isAr()?'الماموغرام يستخدم للثدي فقط.':'Mammography is used only for breast imaging.');
    if (s.modality === 'DEXA' && !skeletal && s.organ) warns.push(isAr()?'DEXA مخصّص لكثافة العظام.':'DEXA is specific to bone density.');
    if (s.modality === 'Endoscopy' && !gi && s.organ) warns.push(isAr()?'التنظير مناسب للجهاز الهضمي/التنفسي.':'Endoscopy is appropriate for GI/airway.');
    if (s.modality === 'Angiography' && !vascular && s.organ) warns.push(isAr()?'التصوير الوعائي مخصّص للأوعية.':'Angiography is vascular-specific.');
    if (s.purpose === 'Treatment planning' && !['CT','MRI','PET/CT'].includes(s.modality)) warns.push(isAr()?'التخطيط العلاجي يحتاج CT / MRI / PET-CT.':'Treatment planning requires CT / MRI / PET-CT.');
    // CT window vs organ coherence (soft)
    if (s.modality === 'CT' && s.organ){
      if (s.window === 'Lung' && !/(lung|thorax|chest|bronch|pleura)/i.test(s.organ)) warns.push(isAr()?'نافذة الرئة غير معتادة لهذا العضو — تحقّق من البروتوكول.':'Lung window is unusual for this organ — check the protocol.');
      if (s.window === 'Bone' && !skeletal) warns.push(isAr()?'نافذة العظم مخصّصة للهيكل العظمي عادةً.':'Bone window is normally for skeletal structures.');
      if (s.window === 'Brain' && !/(brain|head|cerebr|skull|intracranial)/i.test(s.organ)) warns.push(isAr()?'نافذة الدماغ مخصّصة للرأس/الدماغ.':'Brain window is specific to head/brain.');
    }
    // Paired-organ laterality reminder (soft)
    const paired = /(kidney|kidneys|renal|lung|ovary|ovaries|adrenal|breast|testis|femur|humerus|hand|foot|knee|shoulder|hip|elbow|ankle|wrist)/i.test(s.organ);
    if (paired && ['N/A','Midline'].includes(s.laterality)) warns.push(isAr()?'هذا عضو مزدوج — حدّد الجانب (يمين/يسار/ثنائي).':'This is a paired organ — set laterality (Right/Left/Bilateral).');
    // Series thickness hint
    if (s.seriesOn && window.OMNIRAD_SERIES_SLICES){
      const e = OMNIRAD_SERIES_SLICES.find(s.organ);
      if (e && ['CT','MRI'].includes(s.modality) && s.sliceThickness && s.sliceThickness !== 'Per protocol'){
        warns.push(isAr()?`السماكة الموصى بها لهذه السلسلة: ${e.thicknessNote}`:`Recommended thickness for this series: ${e.thicknessNote}`);
      }
    }
    return warns;
  }

  /* ─── Field interdependency sync (hide fields that contradict current choices) ─── */
  function syncFieldVisibility(){
    const s = state.s;
    const labeled = s.labels === 'With anatomical labels';
    const seriesActive = s.seriesOn && window.OMNIRAD_SERIES_SLICES && OMNIRAD_SERIES_SLICES.find(s.organ);
    // Callouts + Label-language only relevant WITH labels and NOT in series mode.
    const showCallouts = labeled && !seriesActive;
    const showLabelLang = labeled && !seriesActive;
    // Segmentation is a labeling overlay — irrelevant with No-labels or in series.
    const showSeg = labeled && !seriesActive;
    const setVis = (id, on) => { const el = $(id); if (el) el.style.display = on ? '' : 'none'; };
    setVis('fCallouts', showCallouts);
    setVis('fLabelLang', showLabelLang);
    setVis('fSegmentation', showSeg);
  }

  /* ─── Render ─── */
  function render(){
    syncFieldVisibility();
    const b = build();
    $('outEn').textContent = b.en;
    $('outAr').textContent = b.ar;
    $('outNeg').textContent = b.neg;
    // Wire anatomical intelligence on the prompt output
    if (window.OmniRadTerm && OmniRadTerm.linkText){
      try { OmniRadTerm.linkText($('outEn')); OmniRadTerm.linkText($('outAr')); } catch(e){}
    }
    $('negRow').style.display = state.s.negOn ? 'block' : 'none';
    $('fname').textContent = suggestedName();
    renderSeriesInfo();
    // Neg tag on copy buttons
    qa('.neg-tag').forEach(el => el.style.display = state.s.negOn ? 'inline' : 'none');
    // Warnings
    const w = checkWarnings();
    if (w.length){ $('warn1').style.display = 'flex'; $('warn1List').innerHTML = w.map(x=>`<span>${x}</span>`).join(''); }
    else { $('warn1').style.display = 'none'; }
    persist();
  }

  /* ─── Copy ─── */
  async function copy(kind){
    const b = build();
    let txt = '';
    if (kind === 'en') txt = b.en + (state.s.negOn ? `\n\nNegative prompt: ${b.neg}` : '');
    else if (kind === 'ar') txt = b.ar + (state.s.negOn ? `\n\nNegative prompt (سلبي): ${b.neg}` : '');
    else if (kind === 'neg') txt = b.neg;
    else if (kind === 'name') txt = suggestedName();
    try { await navigator.clipboard.writeText(txt); } catch(e){ prompt('Copy manually:', txt); }
    const btn = q(`[data-copy="${kind}"]`);
    if (btn){ const orig = btn.innerHTML; btn.classList.add('copied'); btn.innerHTML = t('copy.copied'); setTimeout(()=>{ btn.classList.remove('copied'); btn.innerHTML = orig; }, 1200); }
  }

  /* ─── Event handlers ─── */
  function onChange(e){
    const el = e.target; const k = el.dataset.key; if (!k) return;
    const v = el.type === 'checkbox' ? el.checked : el.value;
    const CUSTOM = '__custom__';
    // Region select — handle custom-entry toggle
    if (k === 'region'){
      const inp = $('inpRegionCustom');
      if (v === CUSTOM){ if (inp){ inp.style.display=''; inp.focus(); } render(); return; }
      if (inp) inp.style.display = 'none';
      state.s.region = v; state.s.organ = ''; populate(); render(); return;
    }
    if (k === 'regionCustom'){ state.s.region = v.trim(); state.s.organ = ''; populate(); render(); return; }
    // Organ select — handle custom-entry toggle
    if (k === 'organ'){
      const inp = $('inpOrganCustom');
      if (v === CUSTOM){ if (inp){ inp.style.display=''; inp.focus(); } render(); return; }
      if (inp) inp.style.display = 'none';
      state.s.organ = v; render(); return;
    }
    if (k === 'organCustom'){ state.s.organ = v.trim(); render(); return; }

    state.s[k] = v;
    if (k === 'modality'){ // reset view to sensible default for modality
      const avail = OPT.view[state.s.modality] || OPT.view._default;
      if (!avail.some(o=>o.v===state.s.view)) state.s.view = avail[0].v;
      populate();
    } else if (k === 'normalPath'){ if (state.s.normalPath === 'Normal') state.s.pathCase = ''; populate(); }
    render();
  }

  function bindEvents(){
    qa('input[data-key], select[data-key]').forEach(el => el.addEventListener('input', onChange));
    qa('input[data-key], select[data-key]').forEach(el => el.addEventListener('change', onChange));
    qa('[data-copy]').forEach(el => el.addEventListener('click', ()=>copy(el.dataset.copy)));
    qa('.tab').forEach(el => el.addEventListener('click', ()=>{ setTab(el.dataset.tab); }));
    qa('[data-toggle]').forEach(el => el.addEventListener('click', ()=>{
      const name = el.dataset.toggle; state.collapsed[name] = !state.collapsed[name];
      el.classList.toggle('collapsed', state.collapsed[name]);
      const body = q(`[data-body="${name}"]`); if (body) body.style.display = state.collapsed[name] ? 'none' : 'block';
    }));
    $('btnReset').addEventListener('click', ()=>{ state.s = DEF(); populate(); render(); });
    $('btnHist').addEventListener('click', ()=>{ alert(isAr()?'حفظ السجل يأتي في المرحلة اللاحقة.':'History save coming in a later phase.'); });
    if (FEATURE_AUTOGEN) {
      $('btnGen') && $('btnGen').addEventListener('click', doGenerate);
    }
  }

  /**
   * Legacy auto-generation flow (fal.ai · FLUX · Gemini).
   * @deprecated Phase 3 Sprint 1 (2026-07-12). Gated behind FEATURE_AUTOGEN.
   * Kept for restore path — do not invoke unless flag is true.
   * See: docs/feature-flags.md · supabase/studio-autogen-restore.sql
   */
  async function doGenerate(){
    if (!FEATURE_AUTOGEN) { console.warn('[Studio] doGenerate() called but AUTOGEN flag is off — noop.'); return; }
    const sb = window.OmniRadAuth && window.OmniRadAuth.client;
    if (!sb){ alert(isAr()?'يلزم تسجيل الدخول.':'Sign-in required.'); return; }
    const b = build();
    const s = state.s;
    const btn = $('btnGen');
    const box = $('genProgress'), bar = $('genProgressBar'), txt = $('genProgressText'), res = $('genResult');
    btn.disabled = true; btn.style.opacity = '.5'; res.style.display='none'; box.style.display='block';
    let elapsed = 0; const total = 60;
    function setStep(msg, pct){ txt.textContent = msg; bar.style.width = pct+'%'; }
    setStep(isAr()?'⏳ إنشاء الجلسة...':'⏳ Creating session...', 5);
    let sessionId = null;
    try {
      const { data: sid, error: e1 } = await sb.rpc('create_generation_session', {
        p_prompt_en: b.en, p_prompt_ar: b.ar,
        p_negative: (s.negOn ? b.neg : null),
        p_modality: s.modality, p_region: s.region || null, p_organ: s.organ || null,
        p_plane: s.view || null, p_pathology: s.pathCase || null,
        p_sequence: (s.modality==='MRI'? s.sequence : null),
        p_slice_thickness: null,
        p_extra: {}, p_model: AUTOGEN_MODEL_LEGACY
      });
      if (e1) throw e1;
      sessionId = sid;
      setStep(isAr()?'📤 إرسال إلى fal.ai...':'📤 Submitting to fal.ai...', 15);
      const { data: reqId, error: e2 } = await sb.rpc('session_submit', { p_session: sessionId });
      if (e2) throw e2;

      // Poll session_advance every 3s (server-side handles fetching from fal)
      let attempts = 0;
      while (attempts < 25){
        await new Promise(r=>setTimeout(r, 3000));
        attempts++; elapsed += 3;
        const pct = Math.min(20 + Math.round(elapsed/total*70), 90);
        setStep(isAr()?`⏳ التوليد جارٍ... ${elapsed}s`:`⏳ Generating... ${elapsed}s`, pct);
        const { data: adv, error: eA } = await sb.rpc('session_advance', { p_session: sessionId });
        if (eA) { console.warn('advance err', eA); continue; }
        if (adv && adv.status === 'done' && adv.image_url){
          setStep(isAr()?'✅ تم!':'✅ Done!', 100);
          res.innerHTML = `<div style="text-align:center">
            <img src="${adv.image_url}" style="max-width:100%;max-height:420px;border-radius:12px;border:1px solid var(--border);box-shadow:0 8px 24px rgba(0,0,0,.4)">
            <div style="margin-top:10px;font-size:12.5px;color:var(--text-s);line-height:1.6">${isAr()?'✅ الصورة أُضيفت إلى قائمة المراجعة. سيراجعها Reviewer قريباً.':'✅ Image added to Review Queue. A Reviewer will look at it shortly.'}</div>
            <a href="./review.html" style="display:inline-block;margin-top:10px;padding:8px 16px;background:var(--acc);color:var(--acc-ink);text-decoration:none;font-weight:700;font-size:12px;border-radius:8px">${isAr()?'📋 فتح قائمة المراجعة':'📋 Open Review Queue'}</a>
          </div>`;
          res.style.display = 'block';
          btn.disabled = false; btn.style.opacity = '1';
          return;
        }
        if (adv && adv.status === 'failed'){
          throw new Error(adv.error || 'Generation failed');
        }
      }
      throw new Error(isAr()?'انتهت المهلة':'Generation timed out');
    } catch(err){
      setStep((isAr()?'❌ خطأ: ':'❌ Error: ') + (err.message||err), 0);
      bar.style.background = 'var(--err)';
      btn.disabled = false; btn.style.opacity = '1';
    }
  }

  function setTab(name){
    state.tab = name;
    qa('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === name));
    qa('.tab-body').forEach(b => b.style.display = 'none');
    $('tab' + name[0].toUpperCase() + name.slice(1)).style.display = 'block';
  }

  /* ─── Boot ─── */
  function init(){
    applyI18n(); populate(); bindEvents(); render();
    console.info('[OmniRad Studio] Manual ChatGPT workflow active. AUTOGEN=' + FEATURE_AUTOGEN + ' (Phase 3 Sprint 1 · 12 Jul 2026).');
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    applyI18n();
    guard();
  });
})();
