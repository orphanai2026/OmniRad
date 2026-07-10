/* ═══════════════════════════════════════════════════════════════
   OmniRad — Admin Console logic
   Admin-only. Manages: users · images · mnemonics · cards
   · contributors · contacts · settings.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  const qa = s => [...document.querySelectorAll(s)];
  let sb = null;
  let editingId = { mnemo:null, card:null, contrib:null };

  // ─── Modal close (Cancel button, backdrop click, Esc key) ───
  window.closeModal = function(id){ const el = document.getElementById(id); if (el) el.classList.remove('on'); };
  document.addEventListener('click', function(e){
    if (e.target && e.target.classList && e.target.classList.contains('modal-bg')) e.target.classList.remove('on');
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') document.querySelectorAll('.modal-bg.on').forEach(m => m.classList.remove('on'));
  });

  const ROLES = ['viewer','trial','contributor','reviewer','admin'];
  const ROLE_BADGE = { viewer:'viewer', trial:'pending', contributor:'contrib', reviewer:'contrib', admin:'admin' };
  function roleBadgeClass(r){ return ROLE_BADGE[r || 'viewer'] || 'viewer'; }
  window.roleBadgeClass = roleBadgeClass;

  const I18N = {
    en: {
      'admin.sections':'Sections','admin.dash':'Dashboard','admin.dashLead':'Platform overview — content and user activity.',
      'admin.users':'Users','admin.usersLead':'Manage roles and user access.',
      'admin.library':'Images','admin.libraryLead':'Approve, reject or delete generated images.',
      'admin.mnemo':'Mnemonics','admin.mnemoLead':'Curated memory aids indexed by structure.',
      'admin.cards':'Cards','admin.cardsLead':'Learning cards for Daily quiz and SRS.',
      'admin.contrib':'Contributors','admin.contribLead':'People building the platform.',
      'admin.contacts':'Messages','admin.contactsLead':'Incoming messages from the public contact form.',
      'admin.settings':'Settings','admin.settingsLead':'Platform-wide switches.',
      'admin.access':'Access Matrix','admin.accessLead':'Five roles, from most restrictive to most privileged. Change any user\'s role from the Users tab.',
      'admin.activity':'Activity Log','admin.activityLead':'Audit trail of role changes and administrative actions (last 200 events).',
      'admin.recentActivity':'Recent activity',
      'admin.invite':'Invite user','admin.searchUsers':'Search by name or email…',
      'empty.activity':'No activity yet.',
      'col.when':'When','col.actor':'Actor','col.action':'Action',
      'mod.inviteTitle':'Invite a new user','mod.inviteHint':'The user receives an email invitation. When they click the link, they set their own password and become a member.',
      'mod.sendInvite':'Send invite','lbl.email':'Email','lbl.roleAssign':'Initial role',
      'admin.gateCheck':'Checking access…','admin.gateSignin':'Sign in required','admin.gateSigninMsg':'Admin console is restricted. Sign in with an admin account.',
      'admin.gateDenied':'Admin only','admin.gateDeniedMsg':'Your account does not have admin rights.','admin.gateSigninBtn':'Sign in',
      'tile.totalUsers':'Total users','tile.approvedImages':'Approved images','tile.mnemonics':'Mnemonics','tile.cards':'Learning cards','tile.contributors':'Contributors','tile.unread':'Unread messages',
      'tile.admins':'Admins','tile.contribs':'Contrib','tile.viewers':'Viewers','tile.pending':'Pending','tile.rejected':'Rejected','tile.total':'Total',
      'col.email':'Email','col.name':'Name','col.role':'Role','col.joined':'Joined','col.changeRole':'Change role','col.status':'Status',
      'adm.active':'active','adm.disabled':'disabled','adm.scheduled':'scheduled',
      'adm.restore':'Restore','adm.disable':'Disable','adm.delete':'Delete',
      'adm.confirmDisable':'Disable this user? They will not be able to sign in until you restore them.',
      'adm.confirmRestore':'Restore this user? They will regain full access.',
      'adm.confirmDelete1':'⚠️ PERMANENTLY delete user %s and all their data? This CANNOT be undone.',
      'adm.confirmDelete2':'Type DELETE (uppercase) to confirm:',
      'adm.deleteCancelled':'Deletion cancelled.',
      'adm.deleted':'User permanently deleted.',
      'adm.protectedOwner':'🛡️ This account is the platform owner and is permanently protected.',
      'col.structure':'Structure','col.details':'Details','col.status':'Status','col.uploaded':'Uploaded','col.actions':'Actions',
      'col.title':'Title','col.phrase':'Phrase','col.prompt':'Prompt','col.type':'Type','col.level':'Lvl',
      'col.sort':'Sort','col.from':'From','col.message':'Message','col.received':'Received',
      'act.edit':'EDIT','act.del':'DEL','act.read':'✓ Read',
      'saved':'✓ Saved','deleted':'✓ Deleted','error':'✗ Error',
      'empty.users':'No users yet.','empty.images':'No images yet.','empty.mnemo':'No mnemonics yet. Add one to get started.','empty.cards':'No cards yet.','empty.contrib':'No contributors yet.','empty.contacts':'No messages.','empty.loading':'Loading…',
      'st.active':'active','st.hidden':'hidden',
      'admin.addMnemo':'➕ Add mnemonic','admin.addCard':'➕ Add card','admin.addContrib':'➕ Add contributor',
      'mod.addMnemo':'Add mnemonic','mod.editMnemo':'Edit mnemonic','mod.addCard':'Add learning card','mod.editCard':'Edit card','mod.addContrib':'Add contributor','mod.editContrib':'Edit contributor',
      'mod.cancel':'Cancel','mod.save':'Save',
      'lbl.titleEn':'Title EN','lbl.titleAr':'Title AR','lbl.phraseEn':'Phrase EN','lbl.phraseAr':'Phrase AR',
      'lbl.structId':'Structure ID (optional)','lbl.region':'Region','lbl.letters':'Letters (JSON array)',
      'lbl.explEn':'Explanation EN','lbl.explAr':'Explanation AR',
      'lbl.cardType':'Card type','lbl.difficulty':'Difficulty (1-5)','lbl.structIdReq':'Structure ID','lbl.modality':'Modality','lbl.plane':'Plane','lbl.variant':'Variant',
      'lbl.promptEn':'Prompt EN','lbl.promptAr':'Prompt AR','lbl.answerEn':'Answer EN','lbl.answerAr':'Answer AR','lbl.optionsMcq':'Options (MCQ only, JSON)',
      'lbl.nameEn':'Name EN','lbl.nameAr':'Name AR','lbl.roleEn':'Role EN','lbl.roleAr':'Role AR','lbl.bioEn':'Bio EN','lbl.bioAr':'Bio AR','lbl.link':'Link','lbl.sortOrder':'Sort order'
    },
    ar: {
      'admin.sections':'الأقسام','admin.dash':'اللوحة','admin.dashLead':'نظرة عامة — المحتوى ونشاط المستخدمين.',
      'admin.users':'المستخدمون','admin.usersLead':'إدارة الأدوار ووصول المستخدمين.',
      'admin.library':'الصور','admin.libraryLead':'اعتماد أو رفض أو حذف الصور المولّدة.',
      'admin.mnemo':'المخططات الذهنية','admin.mnemoLead':'أدوات تذكّر تعليمية محددة حسب العضو.',
      'admin.cards':'البطاقات','admin.cardsLead':'بطاقات تعلّم للاختبار اليومي والتكرار المتباعد.',
      'admin.contrib':'المساهمون','admin.contribLead':'الفريق الذي يبني المنصّة.',
      'admin.contacts':'الرسائل','admin.contactsLead':'الرسائل الواردة من نموذج التواصل العام.',
      'admin.settings':'الإعدادات','admin.settingsLead':'خيارات على مستوى المنصّة.',
      'admin.access':'خريطة الصلاحيات','admin.accessLead':'خمسة أدوار من الأقل إلى الأعلى صلاحية. غيّر دور أي مستخدم من تبويب المستخدمين.',
      'admin.activity':'سجل النشاط','admin.activityLead':'سجل تدقيق لتغييرات الأدوار والإجراءات الإدارية (آخر 200 حدث).',
      'admin.recentActivity':'آخر النشاطات',
      'admin.invite':'دعوة مستخدم','admin.searchUsers':'بحث بالاسم أو الإيميل…',
      'empty.activity':'لا يوجد نشاط بعد.',
      'col.when':'الوقت','col.actor':'المُنفّذ','col.action':'الإجراء',
      'mod.inviteTitle':'دعوة مستخدم جديد','mod.inviteHint':'يستلم المستخدم دعوة عبر الإيميل. عند الضغط على الرابط، يُنشئ كلمة سرّه ويصبح عضواً.',
      'mod.sendInvite':'إرسال الدعوة','lbl.email':'الإيميل','lbl.roleAssign':'الدور الابتدائي',
      'admin.gateCheck':'التحقّق من الصلاحية…','admin.gateSignin':'يلزم تسجيل الدخول','admin.gateSigninMsg':'لوحة الإدارة مقيّدة. سجّل الدخول بحساب أدمن.',
      'admin.gateDenied':'خاص بالأدمن','admin.gateDeniedMsg':'حسابك لا يملك صلاحيات إدارية.','admin.gateSigninBtn':'تسجيل الدخول',
      'tile.totalUsers':'مجموع المستخدمين','tile.approvedImages':'الصور المعتمدة','tile.mnemonics':'المخططات','tile.cards':'بطاقات التعليم','tile.contributors':'المساهمون','tile.unread':'رسائل غير مقروءة',
      'tile.admins':'أدمن','tile.contribs':'مساهم','tile.viewers':'مشاهد','tile.pending':'قيد المراجعة','tile.rejected':'مرفوضة','tile.total':'المجموع',
      'col.email':'الإيميل','col.name':'الاسم','col.role':'الدور','col.joined':'تاريخ التسجيل','col.changeRole':'تغيير الدور','col.status':'الحالة',
      'adm.active':'نشط','adm.disabled':'معطّل','adm.scheduled':'مجدول للحذف',
      'adm.restore':'استعادة','adm.disable':'تعطيل','adm.delete':'حذف نهائي',
      'adm.confirmDisable':'تعطيل هذا المستخدم؟ لن يستطيع تسجيل الدخول حتى تستعيده.',
      'adm.confirmRestore':'استعادة هذا المستخدم؟ سيسترجع كامل الوصول.',
      'adm.confirmDelete1':'⚠️ حذف المستخدم %s وكل بياناته نهائياً؟ لا يمكن التراجع.',
      'adm.confirmDelete2':'اكتب DELETE (بأحرف كبيرة) للتأكيد:',
      'adm.deleteCancelled':'تم إلغاء الحذف.',
      'adm.deleted':'تم حذف المستخدم نهائياً.',
      'adm.protectedOwner':'🛡️ هذا الحساب هو مالك المنصّة ومحمي دائماً من الحذف.',
      'col.structure':'العضو','col.details':'التفاصيل','col.status':'الحالة','col.uploaded':'تاريخ الرفع','col.actions':'إجراءات',
      'col.title':'العنوان','col.phrase':'العبارة','col.prompt':'السؤال','col.type':'النوع','col.level':'المستوى',
      'col.sort':'ترتيب','col.from':'المرسل','col.message':'الرسالة','col.received':'وقت الورود',
      'act.edit':'تعديل','act.del':'حذف','act.read':'✓ مقروء',
      'saved':'✓ تم الحفظ','deleted':'✓ تم الحذف','error':'✗ خطأ',
      'empty.users':'لا يوجد مستخدمون بعد.','empty.images':'لا توجد صور بعد.','empty.mnemo':'لا توجد مخططات بعد. أضف مخطّطاً للبدء.','empty.cards':'لا توجد بطاقات بعد.','empty.contrib':'لا يوجد مساهمون بعد.','empty.contacts':'لا توجد رسائل.','empty.loading':'جارٍ التحميل…',
      'st.active':'فعّال','st.hidden':'مخفي',
      'admin.addMnemo':'➕ إضافة مخطّط','admin.addCard':'➕ إضافة بطاقة','admin.addContrib':'➕ إضافة مساهم',
      'mod.addMnemo':'إضافة مخطّط','mod.editMnemo':'تعديل المخطّط','mod.addCard':'إضافة بطاقة تعليمية','mod.editCard':'تعديل البطاقة','mod.addContrib':'إضافة مساهم','mod.editContrib':'تعديل المساهم',
      'mod.cancel':'إلغاء','mod.save':'حفظ',
      'lbl.titleEn':'العنوان إنجليزي','lbl.titleAr':'العنوان عربي','lbl.phraseEn':'العبارة إنجليزي','lbl.phraseAr':'العبارة عربي',
      'lbl.structId':'معرّف العضو (اختياري)','lbl.region':'المنطقة','lbl.letters':'الحروف (JSON)',
      'lbl.explEn':'الشرح إنجليزي','lbl.explAr':'الشرح عربي',
      'lbl.cardType':'نوع البطاقة','lbl.difficulty':'الصعوبة (1-5)','lbl.structIdReq':'معرّف العضو','lbl.modality':'المودلتي','lbl.plane':'المستوى','lbl.variant':'النوع',
      'lbl.promptEn':'السؤال إنجليزي','lbl.promptAr':'السؤال عربي','lbl.answerEn':'الإجابة إنجليزي','lbl.answerAr':'الإجابة عربي','lbl.optionsMcq':'الخيارات (للأسئلة المتعددة — JSON)',
      'lbl.nameEn':'الاسم إنجليزي','lbl.nameAr':'الاسم عربي','lbl.roleEn':'الدور إنجليزي','lbl.roleAr':'الدور عربي','lbl.bioEn':'النبذة إنجليزي','lbl.bioAr':'النبذة عربي','lbl.link':'الرابط','lbl.sortOrder':'ترتيب العرض'
    }
  };
  function t(k){ const lang = (window.OmniRadI18n && OmniRadI18n.lang) || 'en'; return (I18N[lang]||I18N.en)[k] || k; }
  function isAr(){ return ((window.OmniRadI18n && OmniRadI18n.lang) || 'en') === 'ar'; }
  function applyI18n(){ const lang = (window.OmniRadI18n && OmniRadI18n.lang) || 'en'; const d = I18N[lang]||I18N.en; qa('[data-i18n]').forEach(el=>{ const k=el.dataset.i18n; if(d[k]) el.textContent=d[k]; }); }
  window.addEventListener('omnirad-lang', ()=>{ applyI18n(); refreshCurrentTab(); });

  function toast(msg){
    const el = $('toast'); el.textContent = msg; el.classList.add('on');
    setTimeout(()=> el.classList.remove('on'), 1800);
  }

  /* ─── Gate ─── */
  async function guard(){
    let tries = 0;
    while (!(window.OmniRadAuth && OmniRadAuth.client) && tries < 40){ await new Promise(r=>setTimeout(r,80)); tries++; }
    if (!window.OmniRadAuth){ showGate('signin'); return; }
    sb = OmniRadAuth.client;
    const { data: { session } } = await OmniRadAuth.client.auth.getSession();
    if (!session){ showGate('signin'); return; }
    const { data:profile } = await sb.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
    if (!profile || !['admin','reviewer'].includes(profile.role)){ showGate('denied'); return; }
    $('gate').style.display = 'none';
    $('app').style.display = 'grid';
    boot();
  }
  function showGate(kind){
    const el = $('gate'); el.style.display = 'grid';
    if (kind === 'signin'){ $('gateTitle').textContent = t('admin.gateSignin'); $('gateMsg').textContent = t('admin.gateSigninMsg'); $('gateCta').style.display='inline-block'; $('gateCta').textContent = t('admin.gateSigninBtn'); }
    else { $('gateTitle').textContent = t('admin.gateDenied'); $('gateMsg').textContent = t('admin.gateDeniedMsg'); $('gateCta').style.display='none'; }
  }

  /* ─── Tabs ─── */
  let currentTab = 'dash';
  function setTab(name){
    currentTab = name;
    qa('.side-item').forEach(el=>el.classList.toggle('on', el.dataset.tab === name));
    qa('.section').forEach(el=>el.classList.remove('on'));
    $('sec' + name[0].toUpperCase() + name.slice(1)).classList.add('on');
    refreshCurrentTab();
  }
  function refreshCurrentTab(){
    if (currentTab === 'dash') loadDashboard();
    else if (currentTab === 'users') loadUsers();
    else if (currentTab === 'library') loadImages();
    else if (currentTab === 'mnemo') loadMnemonics();
    else if (currentTab === 'cards') loadCards();
    else if (currentTab === 'contrib') loadContributors();
    else if (currentTab === 'contacts') loadContacts();
    else if (currentTab === 'access') renderAccessMatrix();
    else if (currentTab === 'activity') loadActivity();
    const map = { dash:'admin.dash', users:'admin.users', library:'admin.library', mnemo:'admin.mnemo', cards:'admin.cards', contrib:'admin.contrib', contacts:'admin.contacts', settings:'admin.settings', access:'admin.access', activity:'admin.activity' };
    $('secTitle').textContent = t(map[currentTab]);
    $('secLead').textContent = t(map[currentTab] + 'Lead');
  }

  /* ─── Dashboard ─── */
  let dashRange = 30; // days
  function bucketDays(rows, field, days){
    // Return array of {label, count} for the last N days
    const now = Date.now(); const day = 24*3600*1000;
    const out = []; const start = now - (days-1)*day;
    const buckets = {};
    for (let i=0;i<days;i++){ const d = new Date(start + i*day); buckets[d.toISOString().slice(0,10)] = 0; }
    rows.forEach(r => { const d = new Date(r[field]).toISOString().slice(0,10); if (d in buckets) buckets[d]++; });
    Object.keys(buckets).sort().forEach(k => out.push({ label:k, count:buckets[k] }));
    return out;
  }
  function sparkline(values, color){
    const w=110, h=32; const max=Math.max(1,...values); const step=w/(values.length-1||1);
    let d = `M0,${h-(values[0]/max)*h}`;
    values.forEach((v,i)=>{ d += ` L${i*step},${h-(v/max)*h}`; });
    const area = d + ` L${w},${h} L0,${h} Z`;
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="margin-top:8px;display:block"><path d="${area}" fill="${color}22"/><path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  async function loadDashboard(){
    const tiles = $('tiles');
    // Range selector chips (wire once)
    const secDash = $('secDash');
    if (secDash && !secDash.dataset.wired){
      const bar = document.createElement('div');
      bar.style.cssText='display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:14px';
      bar.innerHTML = ['7','30','90'].map(d=>`<button data-range="${d}" class="btn ghost small" style="padding:5px 12px;font-size:11px;font-weight:700${(+d===dashRange)?';background:var(--acc);color:var(--acc-ink);border-color:var(--acc)':''}">${d}d</button>`).join('') +
        '<span style="flex:1"></span>' +
        '<button id="qaInvite" class="btn small" style="font-size:11px">✉️ '+t('admin.invite')+'</button>';
      secDash.insertBefore(bar, tiles);
      bar.addEventListener('click', e=>{ const b=e.target.closest('[data-range]'); if(!b) return; dashRange=+b.dataset.range; bar.querySelectorAll('[data-range]').forEach(x=>{ const on=+x.dataset.range===dashRange; x.style.background=on?'var(--acc)':''; x.style.color=on?'var(--acc-ink)':''; x.style.borderColor=on?'var(--acc)':''; }); loadDashboard(); });
      const qa=document.getElementById('qaInvite'); if(qa) qa.addEventListener('click', ()=> window.openInviteModal && window.openInviteModal());
      secDash.dataset.wired='1';
    }
    tiles.innerHTML = '<div class="empty">'+t('empty.loading')+'</div>';
    try {
      const since = new Date(Date.now() - dashRange*24*3600*1000).toISOString();
      const [u, img, mn, cd, co, ct, act] = await Promise.all([
        sb.from('profiles').select('role, created_at'),
        sb.from('generated_images').select('status, created_at'),
        sb.from('mnemonics').select('id, created_at', { count:'exact', head:false }),
        sb.from('cards').select('id, created_at', { count:'exact', head:false }),
        sb.from('profiles').select('id', { count:'exact', head:true }).eq('show_on_contributors', true).in('role',['contributor','reviewer','admin']),
        sb.from('contacts').select('read, created_at'),
        sb.from('activity_log').select('*').order('created_at',{ ascending:false }).limit(8)
      ]);
      const roles = (u.data||[]).reduce((m,r)=>{ m[r.role]=(m[r.role]||0)+1; return m; }, {});
      const imgStat = (img.data||[]).reduce((m,r)=>{ m[r.status]=(m[r.status]||0)+1; return m; }, {});
      const unread = (ct.data||[]).filter(r=>!r.read).length;

      const spUsers = bucketDays((u.data||[]).filter(r=>new Date(r.created_at)>=new Date(since)), 'created_at', dashRange).map(x=>x.count);
      const spImages = bucketDays((img.data||[]).filter(r=>new Date(r.created_at)>=new Date(since)), 'created_at', dashRange).map(x=>x.count);
      const spContacts = bucketDays((ct.data||[]).filter(r=>new Date(r.created_at)>=new Date(since)), 'created_at', dashRange).map(x=>x.count);

      tiles.innerHTML = `
        <div class="tile"><div class="k">${t('tile.totalUsers')}</div><div class="v">${u.data?u.data.length:'—'}</div><div class="sub">${t('tile.admins')} ${roles.admin||0} · ${t('tile.contribs')} ${roles.contributor||0} · ${t('tile.viewers')} ${roles.viewer||0}</div>${sparkline(spUsers,'#2dd4c8')}</div>
        <div class="tile"><div class="k">${t('tile.approvedImages')}</div><div class="v">${imgStat.approved||0}</div><div class="sub">${t('tile.pending')} ${imgStat.pending||0} · ${t('tile.rejected')} ${imgStat.rejected||0}</div>${sparkline(spImages,'#4ade80')}</div>
        <div class="tile"><div class="k">${t('tile.mnemonics')}</div><div class="v">${(mn.data||[]).length}</div></div>
        <div class="tile"><div class="k">${t('tile.cards')}</div><div class="v">${(cd.data||[]).length}</div></div>
        <div class="tile"><div class="k">${t('tile.contributors')}</div><div class="v">${co.count||0}</div></div>
        <div class="tile"><div class="k">${t('tile.unread')}</div><div class="v">${unread}</div><div class="sub">${t('tile.total')} ${ct.data?ct.data.length:0}</div>${sparkline(spContacts,'#f472b6')}</div>
      `;

      // Recent activity feed
      let feed = document.getElementById('activityFeed');
      if (!feed){
        feed = document.createElement('div'); feed.id='activityFeed';
        feed.style.cssText='margin-top:20px;background:var(--bg-e);border:1px solid var(--border-s);border-radius:12px;padding:16px';
        secDash.appendChild(feed);
      }
      const items = (act.data||[]).map(r=>{
        const when = new Date(r.created_at).toLocaleString('en-GB');
        const desc = r.action==='role_change'
          ? `${(r.details&&r.details.email)||r.target_id}: ${(r.details&&r.details.before)||'?'} → ${(r.details&&r.details.after)||'?'}`
          : r.action==='user_invited' ? `invited ${r.target_id}` : r.action;
        return `<div style="padding:8px 0;border-bottom:1px dashed var(--border-s);display:flex;justify-content:space-between;gap:12px"><span style="font-size:12.5px">${desc}</span><span style="font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--text-m);white-space:nowrap">${when}</span></div>`;
      }).join('') || '<div class="empty" style="padding:14px">'+t('empty.activity')+'</div>';
      feed.innerHTML = '<div style="font-size:11px;font-weight:800;color:var(--acc);letter-spacing:.1em;text-transform:uppercase;font-family:\'IBM Plex Mono\',monospace;margin-bottom:10px">🕒 '+t('admin.recentActivity')+'</div>'+items;
    } catch(e){ tiles.innerHTML = '<div class="empty">Error loading dashboard: '+e.message+'</div>'; }
  }

  /* ─── Users ─── */
  let userSearchQuery = '';
  let roleFilter = 'all';
  async function loadUsers(){
    const box = $('usersTable'); box.innerHTML = '<div class="empty">'+t('empty.loading')+'</div>';
    // Render filter chips
    const chipsBox = $('roleFilter');
    if (chipsBox && !chipsBox.dataset.wired){
      const roles = ['all','viewer','trial','contributor','reviewer','admin'];
      chipsBox.innerHTML = roles.map(r=>`<button class="btn small ghost" data-role="${r}" style="padding:5px 11px;font-size:11px;font-weight:700;border-radius:999px${r===roleFilter?';background:var(--acc);color:var(--acc-ink);border-color:var(--acc)':''}">${r}</button>`).join('');
      chipsBox.dataset.wired = '1';
      chipsBox.addEventListener('click', e=>{
        const btn = e.target.closest('[data-role]'); if (!btn) return;
        roleFilter = btn.dataset.role;
        chipsBox.querySelectorAll('button').forEach(b=>{ const on = b.dataset.role === roleFilter; b.style.background = on?'var(--acc)':''; b.style.color = on?'var(--acc-ink)':''; b.style.borderColor = on?'var(--acc)':''; });
        loadUsers();
      });
      $('userSearch').addEventListener('input', e=>{ userSearchQuery = e.target.value.trim().toLowerCase(); loadUsers(); });
    }
    try {
      let query = sb.from('profiles').select('id, email, display_name, role, created_at, disabled_at, deletion_at').order('created_at', { ascending:false }).limit(500);
      if (roleFilter !== 'all') query = query.eq('role', roleFilter);
      if (userSearchQuery) query = query.or(`email.ilike.%${userSearchQuery}%,display_name.ilike.%${userSearchQuery}%`);
      const { data, error } = await query;
      if (error) throw error;
      if (!data.length){ box.innerHTML = '<div class="empty">'+t('empty.users')+'</div>'; return; }
      const rows = data.map(u => {
        const disabled = !!u.disabled_at;
        const scheduled = !!u.deletion_at;
        let statusBadge = `<span class="badge" style="background:rgba(45,212,200,.12);color:var(--acc)">${t('adm.active')||'active'}</span>`;
        if (scheduled) {
          const d = new Date(u.deletion_at);
          const days = Math.max(0, Math.ceil((d - Date.now())/86400000));
          statusBadge = `<span class="badge" style="background:rgba(220,38,38,.12);color:#dc2626" title="${d.toLocaleString('en-GB')}">${(t('adm.scheduled')||'scheduled')} · ${days}d</span>`;
        } else if (disabled) {
          statusBadge = `<span class="badge" style="background:rgba(200,150,50,.15);color:#d4a628">${t('adm.disabled')||'disabled'}</span>`;
        }
        const actions = [];
        if (disabled || scheduled) {
          actions.push(`<button class="btn ghost" style="padding:4px 9px;font-size:11px" onclick="adminToggleUser('${u.id}', false)">↺ ${t('adm.restore')||'Restore'}</button>`);
        } else {
          actions.push(`<button class="btn ghost" style="padding:4px 9px;font-size:11px" onclick="adminToggleUser('${u.id}', true)">⏸ ${t('adm.disable')||'Disable'}</button>`);
        }
        actions.push(`<button class="btn ghost" style="padding:4px 9px;font-size:11px;border-color:rgba(220,38,38,.5);color:#dc2626" onclick="adminHardDelete('${u.id}','${(u.email||'').replace(/'/g,"\\'")}')">🗑️ ${t('adm.delete')||'Delete'}</button>`);
        return `<tr${disabled?' style="opacity:.6"':''}>
          <td>${u.email || '—'}</td>
          <td>${u.display_name || '—'}</td>
          <td><span class="badge ${roleBadgeClass(u.role)}">${u.role||'viewer'}</span></td>
          <td>${statusBadge}</td>
          <td>${new Date(u.created_at).toLocaleDateString('en-GB')}</td>
          <td>
            <select onchange="setUserRole('${u.id}', this.value)" style="padding:5px 8px;background:var(--bg-s);border:1px solid var(--border);color:var(--text);border-radius:6px;font-size:11px">
              <option value="viewer" ${u.role==='viewer'?'selected':''}>viewer</option>
              <option value="trial" ${u.role==='trial'?'selected':''}>trial</option>
              <option value="contributor" ${u.role==='contributor'?'selected':''}>contributor</option>
              <option value="reviewer" ${u.role==='reviewer'?'selected':''}>reviewer</option>
              <option value="admin" ${u.role==='admin'?'selected':''}>admin</option>
            </select>
          </td>
          <td style="white-space:nowrap;display:flex;gap:5px">${actions.join('')}</td>
        </tr>`;
      }).join('');
      box.innerHTML = `<table><thead><tr><th>${t('col.email')}</th><th>${t('col.name')}</th><th>${t('col.role')}</th><th>${t('col.status')||'Status'}</th><th>${t('col.joined')}</th><th>${t('col.changeRole')}</th><th>${t('col.actions')}</th></tr></thead><tbody>${rows}</tbody></table>`;
    } catch(e){ box.innerHTML = '<div class="empty">Error: '+e.message+'</div>'; }
  }
  window.openInviteModal = () => { $('invEmail').value=''; $('invRole').value='viewer'; $('inviteModal').classList.add('on'); };
  document.getElementById('invSend') && document.getElementById('invSend').addEventListener('click', async ()=>{
    const email = $('invEmail').value.trim(); const role = $('invRole').value;
    if (!email) return alert('Email required.');
    const redirect = location.origin + location.pathname.replace(/admin\.html.*$/, 'auth.html');
    try {
      const { data, error } = await sb.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: redirect }
      });
      console.log('[invite response]', { data, error });
      if (error) {
        const em = error.message || error.error_description || error.msg;
        const st = error.status || error.statusCode;
        throw new Error((em || 'Supabase returned no message') + (st ? ' [status ' + st + ']' : ''));
      }
      try {
        const { data: { user } } = await sb.auth.getUser();
        if (user) await sb.from('activity_log').insert({ actor_id: user.id, action:'user_invited', target_type:'email', target_id:email, details:{ role } });
      } catch(_){}
      closeModal('inviteModal'); toast('✉️ Invitation sent to ' + email);
    } catch(e){
      const msg = (e && (e.message || e.error_description || e.msg)) || 'unknown (see console)';
      console.error('[invite]', e);
      alert('Invite error: ' + msg + '\n\nCheck browser console for details.');
    }
  });
  window.setUserRole = async (id, role) => {
    try { const { error } = await sb.from('profiles').update({ role }).eq('id', id); if (error) throw error; toast(t('saved')); } catch(e){ toast(t('error')); }
  };
  window.adminToggleUser = async (id, disable) => {
    const label = disable ? (t('adm.confirmDisable')||'Disable this user? They will not be able to sign in.') : (t('adm.confirmRestore')||'Restore this user? They will regain access.');
    if (!confirm(label)) return;
    try { const { error } = await sb.rpc('admin_toggle_user', { p_user: id, p_disable: disable, p_reason: null }); if (error) throw error; toast(t('saved')); loadUsers(); } catch(e){ toast(e.message); }
  };
  window.adminHardDelete = async (id, email) => {
    // Client-side owner protection (server-side also enforced)
    if ((email||'').toLowerCase() === 'omniradai@gmail.com') {
      alert(t('adm.protectedOwner')||'This account is the platform owner and is permanently protected.');
      return;
    }
    const step1 = (t('adm.confirmDelete1')||'PERMANENTLY delete user %s and all their data? This CANNOT be undone.').replace('%s', email||id);
    if (!confirm(step1)) return;
    const step2 = t('adm.confirmDelete2')||'Type DELETE to confirm:';
    const typed = prompt(step2);
    if (typed !== 'DELETE') { toast(t('adm.deleteCancelled')||'Deletion cancelled.'); return; }
    try { const { error } = await sb.rpc('hard_delete_user', { p_user: id }); if (error) throw error; toast(t('adm.deleted')||'User deleted.'); loadUsers(); } catch(e){ toast('Error: '+e.message); }
  };

  /* ─── Images ─── */
  async function loadImages(){
    const box = $('imagesTable'); box.innerHTML = '<div class="empty">'+t('empty.loading')+'</div>';
    try {
      const { data, error } = await sb.from('generated_images').select('*').order('created_at', { ascending:false }).limit(100);
      if (error) throw error;
      if (!data.length){ box.innerHTML = '<div class="empty">'+t('empty.images')+'</div>'; return; }
      const rows = data.map(r => `
        <tr>
          <td style="font-family:monospace;font-size:11px">${(r.structure_id||'—')}</td>
          <td>${r.modality||'—'} · ${r.plane||'—'} · ${r.sequence||'—'}</td>
          <td><span class="badge ${r.status||'pending'}">${r.status||'pending'}</span></td>
          <td>${new Date(r.created_at).toLocaleDateString('en-GB')}</td>
          <td style="white-space:nowrap">
            ${r.status !== 'approved' ? `<button class="btn small" onclick="setImageStatus('${r.id}','approved')">✓</button>`:''}
            ${r.status !== 'rejected' ? `<button class="btn small danger" onclick="setImageStatus('${r.id}','rejected')">✗</button>`:''}
            <button class="btn small warn" onclick="deleteImage('${r.id}')">🗑</button>
          </td>
        </tr>`).join('');
      box.innerHTML = `<table><thead><tr><th>${t('col.structure')}</th><th>${t('col.details')}</th><th>${t('col.status')}</th><th>${t('col.uploaded')}</th><th>${t('col.actions')}</th></tr></thead><tbody>${rows}</tbody></table>`;
    } catch(e){ box.innerHTML = '<div class="empty">Error: '+e.message+'</div>'; }
  }
  window.setImageStatus = async (id, status) => {
    try { const { error } = await sb.from('generated_images').update({ status, reviewed_at: new Date().toISOString() }).eq('id', id); if (error) throw error; toast(t('saved')); loadImages(); } catch(e){ toast(t('error')); }
  };
  window.deleteImage = async (id) => {
    if (!confirm('Delete permanently?')) return;
    try { const { error } = await sb.from('generated_images').delete().eq('id', id); if (error) throw error; toast(t('deleted')); loadImages(); } catch(e){ toast(t('error')); }
  };

  /* ─── Mnemonics ─── */
  async function loadMnemonics(){
    const box = $('mnemoTable'); box.innerHTML = '<div class="empty">'+t('empty.loading')+'</div>';
    try {
      const { data, error } = await sb.from('mnemonics').select('*').order('created_at', { ascending:false });
      if (error) throw error;
      if (!data.length){ box.innerHTML = '<div class="empty">'+t('empty.mnemo')+'</div>'; return; }
      const rows = data.map(r => `
        <tr>
          <td>${r.title_en} <span style="color:var(--text-m);font-size:11px;display:block">${r.title_ar}</span></td>
          <td style="font-family:monospace;font-size:11.5px;color:var(--acc)">${r.phrase_en}</td>
          <td>${r.structure_id||'—'}</td>
          <td style="white-space:nowrap">
            <button class="btn small ghost" onclick="editMnemo('${r.id}')">${t('act.edit')}</button>
            <button class="btn small danger" onclick="delMnemo('${r.id}')">${t('act.del')}</button>
          </td>
        </tr>`).join('');
      box.innerHTML = `<table><thead><tr><th>${t('col.title')}</th><th>${t('col.phrase')}</th><th>${t('col.structure')}</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
    } catch(e){ box.innerHTML = '<div class="empty">Error: '+e.message+'</div>'; }
  }
  window.openMnemoModal = () => { editingId.mnemo = null; ['mnTitleEn','mnTitleAr','mnPhraseEn','mnPhraseAr','mnStruct','mnRegion','mnLetters','mnExplEn','mnExplAr'].forEach(id=>$(id).value=''); $('mnemoModalTitle').textContent='Add mnemonic'; $('mnemoModal').classList.add('on'); };
  window.editMnemo = async (id) => {
    const { data } = await sb.from('mnemonics').select('*').eq('id', id).single();
    if (!data) return;
    editingId.mnemo = id;
    $('mnemoModalTitle').textContent = 'Edit mnemonic';
    $('mnTitleEn').value = data.title_en||''; $('mnTitleAr').value = data.title_ar||'';
    $('mnPhraseEn').value = data.phrase_en||''; $('mnPhraseAr').value = data.phrase_ar||'';
    $('mnStruct').value = data.structure_id||''; $('mnRegion').value = data.region||'';
    $('mnLetters').value = data.letters ? JSON.stringify(data.letters, null, 2) : '';
    $('mnExplEn').value = data.explanation_en||''; $('mnExplAr').value = data.explanation_ar||'';
    $('mnemoModal').classList.add('on');
  };
  window.delMnemo = async (id) => {
    if (!confirm('Delete mnemonic?')) return;
    try { const { error } = await sb.from('mnemonics').delete().eq('id', id); if (error) throw error; toast(t('deleted')); loadMnemonics(); } catch(e){ toast(t('error')); }
  };
  $('mnSave').addEventListener('click', async () => {
    let letters = null;
    try { if ($('mnLetters').value.trim()) letters = JSON.parse($('mnLetters').value); }
    catch(e){ alert('Letters JSON invalid: '+e.message); return; }
    const row = {
      title_en:$('mnTitleEn').value.trim(), title_ar:$('mnTitleAr').value.trim(),
      phrase_en:$('mnPhraseEn').value.trim(), phrase_ar:$('mnPhraseAr').value.trim(),
      structure_id:$('mnStruct').value.trim()||null, region:$('mnRegion').value.trim()||null,
      letters, explanation_en:$('mnExplEn').value.trim()||null, explanation_ar:$('mnExplAr').value.trim()||null
    };
    if (!row.title_en || !row.title_ar || !row.phrase_en || !row.phrase_ar) return alert('Title + phrase (both languages) required.');
    try {
      if (editingId.mnemo){ const { error } = await sb.from('mnemonics').update(row).eq('id', editingId.mnemo); if (error) throw error; }
      else { const { error } = await sb.from('mnemonics').insert(row); if (error) throw error; }
      closeModal('mnemoModal'); toast(t('saved')); loadMnemonics();
    } catch(e){ alert('Save error: '+e.message); }
  });

  /* ─── Cards ─── */
  async function loadCards(){
    const box = $('cardsTable'); box.innerHTML = '<div class="empty">'+t('empty.loading')+'</div>';
    try {
      const { data, error } = await sb.from('cards').select('*').order('created_at', { ascending:false }).limit(200);
      if (error) throw error;
      if (!data.length){ box.innerHTML = '<div class="empty">'+t('empty.cards')+'</div>'; return; }
      const rows = data.map(r => `
        <tr>
          <td style="max-width:280px">${(r.prompt_en||'').slice(0,120)}<span style="color:var(--text-m);font-size:11px;display:block">${(r.prompt_ar||'').slice(0,120)}</span></td>
          <td>${r.card_type||'flash'}</td>
          <td>${r.structure_id||'—'}</td>
          <td>${r.level||1}</td>
          <td style="white-space:nowrap">
            <button class="btn small ghost" onclick="editCard('${r.id}')">${t('act.edit')}</button>
            <button class="btn small danger" onclick="delCard('${r.id}')">${t('act.del')}</button>
          </td>
        </tr>`).join('');
      box.innerHTML = `<table><thead><tr><th>${t('col.prompt')}</th><th>${t('col.type')}</th><th>${t('col.structure')}</th><th>${t('col.level')}</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
    } catch(e){ box.innerHTML = '<div class="empty">Error: '+e.message+'</div>'; }
  }
  window.openCardModal = () => { editingId.card = null; ['cdStruct','cdMod','cdPlane','cdVariant','cdPromptEn','cdPromptAr','cdAnsEn','cdAnsAr','cdOptions'].forEach(id=>$(id).value=''); $('cdType').value='flash'; $('cdLevel').value=1; $('cardModalTitle').textContent='Add learning card'; $('cardModal').classList.add('on'); };
  window.editCard = async (id) => {
    const { data } = await sb.from('cards').select('*').eq('id', id).single();
    if (!data) return;
    editingId.card = id;
    $('cardModalTitle').textContent = 'Edit card';
    $('cdType').value = data.card_type||'flash'; $('cdLevel').value = data.level||1;
    $('cdStruct').value = data.structure_id||''; $('cdMod').value = data.modality||'';
    $('cdPlane').value = data.plane||''; $('cdVariant').value = data.variant||'';
    $('cdPromptEn').value = data.prompt_en||''; $('cdPromptAr').value = data.prompt_ar||'';
    $('cdAnsEn').value = data.answer_en||''; $('cdAnsAr').value = data.answer_ar||'';
    $('cdOptions').value = data.options ? JSON.stringify(data.options, null, 2) : '';
    $('cardModal').classList.add('on');
  };
  window.delCard = async (id) => {
    if (!confirm('Delete card?')) return;
    try { const { error } = await sb.from('cards').delete().eq('id', id); if (error) throw error; toast(t('deleted')); loadCards(); } catch(e){ toast(t('error')); }
  };
  $('cdSave').addEventListener('click', async () => {
    let options = null;
    try { if ($('cdOptions').value.trim()) options = JSON.parse($('cdOptions').value); }
    catch(e){ alert('Options JSON invalid: '+e.message); return; }
    const row = {
      card_type:$('cdType').value, level:parseInt($('cdLevel').value)||1,
      structure_id:$('cdStruct').value.trim()||null, modality:$('cdMod').value.trim()||null,
      plane:$('cdPlane').value.trim()||null, variant:$('cdVariant').value.trim()||null,
      prompt_en:$('cdPromptEn').value.trim(), prompt_ar:$('cdPromptAr').value.trim(),
      answer_en:$('cdAnsEn').value.trim(), answer_ar:$('cdAnsAr').value.trim(),
      options
    };
    if (!row.prompt_en || !row.prompt_ar || !row.answer_en || !row.answer_ar) return alert('Prompt + answer (both languages) required.');
    try {
      if (editingId.card){ const { error } = await sb.from('cards').update(row).eq('id', editingId.card); if (error) throw error; }
      else { const { error } = await sb.from('cards').insert(row); if (error) throw error; }
      closeModal('cardModal'); toast(t('saved')); loadCards();
    } catch(e){ alert('Save error: '+e.message); }
  });

  /* ─── Contributors ─── */
  async function loadContributors(){
    const box = $('contribTable'); box.innerHTML = '<div class="empty">'+t('empty.loading')+'</div>';
    try {
      const { data, error } = await sb.from('contributors').select('*').order('sort_order');
      if (error) throw error;
      if (!data.length){ box.innerHTML = '<div class="empty">'+t('empty.contrib')+'</div>'; return; }
      const rows = data.map(r => `
        <tr>
          <td>${r.name_en}<span style="color:var(--text-m);font-size:11px;display:block">${r.name_ar}</span></td>
          <td>${r.role_en||'—'}</td>
          <td>${r.sort_order||100}</td>
          <td><span class="badge ${r.active?'approved':'rejected'}">${r.active?t('st.active'):t('st.hidden')}</span></td>
          <td style="white-space:nowrap">
            <button class="btn small ghost" onclick="editContrib('${r.id}')">${t('act.edit')}</button>
            <button class="btn small danger" onclick="delContrib('${r.id}')">${t('act.del')}</button>
          </td>
        </tr>`).join('');
      box.innerHTML = `<table><thead><tr><th>${t('col.name')}</th><th>${t('col.role')}</th><th>${t('col.sort')}</th><th>${t('col.status')}</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
    } catch(e){ box.innerHTML = '<div class="empty">Error: '+e.message+'</div>'; }
  }
  window.openContribModal = () => { editingId.contrib = null; ['coNameEn','coNameAr','coRoleEn','coRoleAr','coBioEn','coBioAr','coLink'].forEach(id=>$(id).value=''); $('coSort').value=100; $('contribModalTitle').textContent='Add contributor'; $('contribModal').classList.add('on'); };
  window.editContrib = async (id) => {
    const { data } = await sb.from('contributors').select('*').eq('id', id).single();
    if (!data) return;
    editingId.contrib = id;
    $('contribModalTitle').textContent = 'Edit contributor';
    $('coNameEn').value = data.name_en||''; $('coNameAr').value = data.name_ar||'';
    $('coRoleEn').value = data.role_en||''; $('coRoleAr').value = data.role_ar||'';
    $('coBioEn').value = data.bio_en||''; $('coBioAr').value = data.bio_ar||'';
    $('coLink').value = data.link||''; $('coSort').value = data.sort_order||100;
    $('contribModal').classList.add('on');
  };
  window.delContrib = async (id) => {
    if (!confirm('Delete contributor?')) return;
    try { const { error } = await sb.from('contributors').delete().eq('id', id); if (error) throw error; toast(t('deleted')); loadContributors(); } catch(e){ toast(t('error')); }
  };
  $('coSave').addEventListener('click', async () => {
    const row = {
      name_en:$('coNameEn').value.trim(), name_ar:$('coNameAr').value.trim(),
      role_en:$('coRoleEn').value.trim()||null, role_ar:$('coRoleAr').value.trim()||null,
      bio_en:$('coBioEn').value.trim()||null, bio_ar:$('coBioAr').value.trim()||null,
      link:$('coLink').value.trim()||null, sort_order:parseInt($('coSort').value)||100, active:true
    };
    if (!row.name_en || !row.name_ar) return alert('Both names required.');
    try {
      if (editingId.contrib){ const { error } = await sb.from('contributors').update(row).eq('id', editingId.contrib); if (error) throw error; }
      else { const { error } = await sb.from('contributors').insert(row); if (error) throw error; }
      closeModal('contribModal'); toast(t('saved')); loadContributors();
    } catch(e){ alert('Save error: '+e.message); }
  });

  /* ─── Contacts ─── */
  async function loadContacts(){
    const box = $('contactsTable'); box.innerHTML = '<div class="empty">'+t('empty.loading')+'</div>';
    try {
      const { data, error } = await sb.from('contacts').select('*').order('created_at', { ascending:false }).limit(100);
      if (error) throw error;
      if (!data.length){ box.innerHTML = '<div class="empty">'+t('empty.contacts')+'</div>'; return; }
      const rows = data.map(r => `
        <tr style="${r.read?'opacity:.7':''}">
          <td>${r.name}<span style="color:var(--text-m);font-size:11px;display:block">${r.email}</span></td>
          <td style="max-width:340px">${r.subject?`<strong>${r.subject}</strong><br>`:''}${(r.message||'').slice(0,180)}${r.message&&r.message.length>180?'…':''}</td>
          <td>${new Date(r.created_at).toLocaleString('en-GB')}</td>
          <td style="white-space:nowrap">
            ${!r.read?`<button class="btn small" onclick="markRead('${r.id}',true)">${t('act.read')}</button>`:`<button class="btn small ghost" onclick="markRead('${r.id}',false)">↺</button>`}
            <button class="btn small danger" onclick="delContact('${r.id}')">🗑</button>
          </td>
        </tr>`).join('');
      box.innerHTML = `<table><thead><tr><th>${t('col.from')}</th><th>${t('col.message')}</th><th>${t('col.received')}</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
    } catch(e){ box.innerHTML = '<div class="empty">Error: '+e.message+'</div>'; }
  }
  window.markRead = async (id, read) => { try { const { error } = await sb.from('contacts').update({ read }).eq('id', id); if (error) throw error; loadContacts(); } catch(e){ toast(t('error')); } };
  window.delContact = async (id) => { if (!confirm('Delete message?')) return; try { const { error } = await sb.from('contacts').delete().eq('id', id); if (error) throw error; toast(t('deleted')); loadContacts(); } catch(e){ toast(t('error')); } };

  /* ─── Access matrix ─── */
  function renderAccessMatrix(){
    const box = $('accessMatrix'); if (!box) return;
    const ar = isAr();
    const roles = ['viewer','trial','contributor','reviewer','admin'];
    const roleLabels = {
      en: { viewer:'Viewer', trial:'Trial', contributor:'Contributor', reviewer:'Reviewer', admin:'Admin' },
      ar: { viewer:'مشاهد', trial:'تجريبي', contributor:'مساهم', reviewer:'مراجع', admin:'أدمن' }
    };
    const rows = [
      { k:'Atlas / Compare / Learn', ak:'أطلس / مقارنة / تعلّم', v:{viewer:1,trial:1,contributor:1,reviewer:1,admin:1} },
      { k:'Studio (author prompts)', ak:'الاستوديو (تأليف البرومبت)', v:{viewer:0,trial:0,contributor:1,reviewer:1,admin:1} },
      { k:'Approve own images (self)', ak:'اعتماد صور شخصية', v:{viewer:0,trial:0,contributor:'own',reviewer:1,admin:1} },
      { k:'Approve others\' images', ak:'اعتماد صور الآخرين', v:{viewer:0,trial:0,contributor:0,reviewer:1,admin:1} },
      { k:'Publish to Atlas', ak:'النشر على Atlas', v:{viewer:0,trial:0,contributor:0,reviewer:1,admin:1} },
      { k:'Admin Console (partial)', ak:'لوحة الإدارة (جزئي)', v:{viewer:0,trial:0,contributor:0,reviewer:1,admin:1} },
      { k:'Manage users & roles', ak:'إدارة المستخدمين والأدوار', v:{viewer:0,trial:0,contributor:0,reviewer:0,admin:1} },
      { k:'Platform settings', ak:'إعدادات المنصّة', v:{viewer:0,trial:0,contributor:0,reviewer:0,admin:1} },
      { k:'Trial expires (14 days)', ak:'انتهاء التجريب (١٤ يوم)', v:{viewer:0,trial:1,contributor:0,reviewer:0,admin:0} }
    ];
    const cell = v => v === 1 ? '<span style="color:var(--ok);font-weight:700">✓</span>'
      : v === 0 ? '<span style="color:var(--text-m)">—</span>'
      : `<span style="color:var(--pending);font-size:11px;font-weight:700">${v}</span>`;
    const legend = ar
      ? `<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:12px;font-size:11.5px;color:var(--text-m)"><span><span style="color:var(--ok)">✓</span> مسموح</span><span>— غير مسموح</span><span><span style="color:var(--pending)">own</span> على المحتوى الشخصي فقط</span></div>`
      : `<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:12px;font-size:11.5px;color:var(--text-m)"><span><span style="color:var(--ok)">✓</span> Allowed</span><span>— Not allowed</span><span><span style="color:var(--pending)">own</span> On own content only</span></div>`;
    box.innerHTML = `
      <div style="overflow-x:auto"><table style="min-width:640px">
        <thead><tr>
          <th style="text-align:start">${ar?'الميزة':'Capability'}</th>
          ${roles.map(r=>`<th style="text-align:center">${roleLabels[ar?'ar':'en'][r]}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${rows.map(row=>`<tr>
            <td>${ar?row.ak:row.k}</td>
            ${roles.map(r=>`<td style="text-align:center">${cell(row.v[r])}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table></div>
      ${legend}
    `;
  }



  /* ─── Boot ─── */
  function boot(){
    applyI18n();
    qa('.side-item').forEach(el => el.addEventListener('click', () => setTab(el.dataset.tab)));
    loadDashboard();
  }
  document.addEventListener('DOMContentLoaded', ()=>{ applyI18n(); guard(); });
})();
