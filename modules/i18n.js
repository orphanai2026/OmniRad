/* ═══════════════════════════════════════════════════════════════
   OmniRad — i18n module (Arabic ↔ English, no auto-translation)
   ─────────────────────────────────────────────────────────────
   Bilingual UI strings, hand-curated per medical accuracy.
   NEVER machine-translate radiology terms — they're standardized.

   Usage in any page:
     <script src="../modules/i18n.js"></script>
     <span data-i18n="atlas.title"></span>
     <input data-i18n-placeholder="common.search">
     document.title = OmniRadI18n.t('atlas.title');

   The shared nav (omnirad-nav.js) reads the current language from
   localStorage.omnirad_lang. Toggle via OmniRadI18n.toggle().

   Extend by adding keys to STRINGS below. Never delete keys.
   ═══════════════════════════════════════════════════════════════ */
(function(g){
  'use strict';

  const KEY = 'omnirad_lang';
  const DEFAULT = 'en';

  /* Global UI dictionary — extend as pages grow.
     Keys follow section.subsection.item pattern.
     Medical terms KEPT in English (Radiology convention): T1, T2, DWI, ACR, MRI, CT... */
  const STRINGS = {
    common: {
      loading:      { en:'Loading…',           ar:'جاري التحميل…' },
      search:       { en:'Search…',            ar:'بحث…' },
      close:        { en:'Close',              ar:'إغلاق' },
      back:         { en:'Back',               ar:'رجوع' },
      next:         { en:'Next',               ar:'التالي' },
      prev:         { en:'Previous',           ar:'السابق' },
      cancel:       { en:'Cancel',             ar:'إلغاء' },
      save:         { en:'Save',               ar:'حفظ' },
      delete:       { en:'Delete',             ar:'حذف' },
      reset:        { en:'Reset',              ar:'إعادة ضبط' },
      apply:        { en:'Apply',              ar:'تطبيق' },
      settings:     { en:'Settings',           ar:'الإعدادات' },
      about:        { en:'About',              ar:'حول المنصة' },
      signIn:       { en:'Sign in',            ar:'تسجيل الدخول' },
      signOut:      { en:'Sign out',           ar:'تسجيل الخروج' },
      signUp:       { en:'Sign up',            ar:'إنشاء حساب' },
      email:        { en:'Email',              ar:'البريد الإلكتروني' },
      password:     { en:'Password',           ar:'كلمة المرور' },
      name:         { en:'Name',               ar:'الاسم' },
      copy:         { en:'Copy',               ar:'نسخ' },
      copied:       { en:'Copied',             ar:'نُسخ' },
      home:         { en:'Home',               ar:'الرئيسية' },
      contact:      { en:'Contact',            ar:'التواصل' },
      contributors: { en:'Contributors',       ar:'المتعاونون' },
      language:     { en:'Language',           ar:'اللغة' },
      theme:        { en:'Theme',              ar:'الوضع' },
      dark:         { en:'Dark',               ar:'ليلي' },
      dim:          { en:'Dim',                ar:'نهاري' },
      educational:  { en:'Educational use only', ar:'للاستخدام التعليمي فقط' },
      rights:       { en:'All rights reserved',  ar:'جميع الحقوق محفوظة' },
      notForDiag:   { en:'Not for diagnosis or clinical use', ar:'ليس للتشخيص أو الاستخدام السريري' }
    },
    nav: {
      atlas:        { en:'Atlas',              ar:'الأطلس' },
      compare:      { en:'Compare',            ar:'المقارنة' },
      learn:        { en:'Learn',              ar:'تعلّم' },
      tools:        { en:'Tools',              ar:'أدوات' },
      mnemonics:    { en:'Mnemonics',          ar:'تقنيات الذاكرة' },
      daily:        { en:'Daily Challenge',    ar:'التحدّي اليومي' },
      progress:     { en:'My Progress',        ar:'تقدّمي' },
      aiChat:       { en:'AI Assistant',       ar:'مساعد الذكاء' },
      clinic:       { en:'Clinic',             ar:'العيادة' }
    },
    home: {
      eyebrow:      { en:'Radiologic Anatomy Platform', ar:'منصّة التشريح الإشعاعي' },
      h1a:          { en:'Every structure.',   ar:'كل بنية تشريحية.' },
      h1b:          { en:'Every modality.',    ar:'عبر كل مودلتي.' },
      h1c:          { en:'One place.',         ar:'في مكان واحد.' },
      desc:         { en:'Explore any anatomical structure across CT, MRI, Ultrasound, X-Ray, Nuclear Medicine and more — and compare them side by side, the way radiologists actually see them.',
                      ar:'استكشف أي بنية تشريحية عبر CT وMRI والسونار والأشعة السينية والطب النووي وغيرها — وقارنها جنباً إلى جنب، كما يرى اختصاصيّو الأشعة التشريح فعلاً.' },
      openAtlas:    { en:'Open Atlas',         ar:'افتح الأطلس' },
      compare:      { en:'Compare Modalities', ar:'قارن المودلتيات' },
      browseBy:     { en:'Browse by modality', ar:'استعرض حسب المودلتي' }
    },
    atlas: {
      title:        { en:'Atlas',              ar:'الأطلس' },
      structures:   { en:'Anatomical structures', ar:'البنى التشريحية' },
      modality:     { en:'Modality',           ar:'المودلتي' },
      plane:        { en:'Plane',              ar:'المستوى' },
      variant:      { en:'Variant',            ar:'الفارِنت' },
      labels:       { en:'Labels',             ar:'التسميات' },
      labelsOn:     { en:'LABELS: ON',         ar:'التسميات: مفعّلة' },
      labelsOff:    { en:'LABELS: OFF',        ar:'التسميات: مغلقة' },
      study:        { en:'Study',              ar:'الدراسة' },
      parts:        { en:'Anatomical parts',   ar:'الأجزاء التشريحية' },
      about:        { en:'About',              ar:'وصف' },
      comingSoon:   { en:'coming soon',        ar:'قريباً' },
      tool:         { en:'Tool',               ar:'الأداة' },
      preset:       { en:'Preset',             ar:'إعداد جاهز' },
      empty:        { en:'Image not available yet.', ar:'الصورة غير متوفّرة بعد.' },
      chooseStruct: { en:'Choose a structure to begin', ar:'اختر بنية للبدء' }
    },
    tools: {
      wl:{en:'WL',ar:'WL'}, zoom:{en:'ZOOM',ar:'تكبير'}, pan:{en:'PAN',ar:'تحريك'},
      measure:{en:'RULER',ar:'مسطرة'}, angle:{en:'ANGLE',ar:'زاوية'}, probe:{en:'PROBE',ar:'مسبار'},
      invert:{en:'INVERT',ar:'عكس'}, overlay:{en:'OVLY',ar:'طبقة'}, clear:{en:'CLR',ar:'مسح'}, reset:{en:'RESET',ar:'ضبط'}
    },
    compare: {
      title:        { en:'Compare',            ar:'المقارنة' },
      structure:    { en:'Structure',          ar:'العضو' },
      view:         { en:'View',               ar:'العرض' },
      panes:        { en:'Panes',              ar:'اللوحات' },
      sync:         { en:'LINK',               ar:'ربط' },
      reveal:       { en:'REVEAL',             ar:'كشف' },
      revealHide:   { en:'Hide modality names to self-test', ar:'إخفاء أسماء المودلتيات للاختبار الذاتي' }
    },
    disclaimer: {
      short:        { en:'⚕️ Educational tool — not for diagnosis or clinical use.',
                      ar:'⚕️ أداة تعليمية — ليست للتشخيص أو الاستخدام السريري.' },
      full:         { en:'Generated images and prompts are for illustrative educational use only — not for diagnosis or treatment, and must not inform any clinical decision or patient care.',
                      ar:'الصور والبرومبتات المُولَّدة لأغراض توضيحية تعليمية فقط، وليست للتشخيص أو العلاج، ولا يجوز الاعتماد عليها في أي قرار سريري أو رعاية مريض.' }
    }
  };

  /* ─────── State ─────── */
  let LANG = (function(){ try { return localStorage.getItem(KEY) || DEFAULT; } catch(_) { return DEFAULT; } })();

  function t(key){
    const parts = key.split('.');
    let node = STRINGS;
    for (const p of parts){ if (!node || typeof node !== 'object') return key; node = node[p]; }
    if (!node) return key;
    if (typeof node === 'object' && ('en' in node)) return node[LANG] || node.en || key;
    return key;
  }

  function setLang(lang){
    LANG = (lang === 'ar') ? 'ar' : 'en';
    try { localStorage.setItem(KEY, LANG); } catch(_){}
    document.documentElement.lang = LANG;
    document.documentElement.setAttribute('dir', LANG === 'ar' ? 'rtl' : 'ltr');
    document.body && document.body.setAttribute('dir', LANG === 'ar' ? 'rtl' : 'ltr');
    applyToDOM();
    // Notify listeners (e.g., dynamic UI rebuild)
    window.dispatchEvent(new CustomEvent('omnirad-lang', { detail:{ lang: LANG } }));
  }

  function toggle(){ setLang(LANG === 'en' ? 'ar' : 'en'); }

  /* Apply t() to any element carrying data-i18n / data-i18n-placeholder / data-i18n-title */
  function applyToDOM(){
    document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.getAttribute('data-i18n'); const v = t(k); if (v !== k) el.textContent = v; });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { const k = el.getAttribute('data-i18n-placeholder'); const v = t(k); if (v !== k) el.setAttribute('placeholder', v); });
    document.querySelectorAll('[data-i18n-title]').forEach(el => { const k = el.getAttribute('data-i18n-title'); const v = t(k); if (v !== k) el.setAttribute('title', v); });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => { const k = el.getAttribute('data-i18n-aria-label'); const v = t(k); if (v !== k) el.setAttribute('aria-label', v); });
  }

  function init(){
    document.documentElement.lang = LANG;
    document.documentElement.setAttribute('dir', LANG === 'ar' ? 'rtl' : 'ltr');
    if (document.body) document.body.setAttribute('dir', LANG === 'ar' ? 'rtl' : 'ltr');
    applyToDOM();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  g.OmniRadI18n = { t, setLang, toggle, applyToDOM, get lang(){ return LANG; }, STRINGS };
})(window);
