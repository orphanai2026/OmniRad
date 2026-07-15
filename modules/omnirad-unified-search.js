/* ═══════════════════════════════════════════════════════════════════════════
 * OmniRad — Unified terminology search + Term Builder (omnirad-unified-search.js)
 * ─────────────────────────────────────────────────────────────────────────
 * One resolver over three vocabularies, plus a post-coordination composer that
 * assembles a standard LOINC/RSNA series name from picked axis chips.
 *
 * Depends on (load first, order-independent):
 *   loinc-bridge.js        → window.OmniRadLoincBridge   (LOINC axes + RIDs)
 *   radiology-arabic.js    → window.OmniRadNamingAR       (Arabic labels)
 *   anatomy-master-v2.js   → window.OMNIRAD_ANATOMY       (TA2 fine structures)
 *   omnirad-naming.js      → window.OmniRadNaming (opt.)  (LOINC code resolve)
 *
 * Public surface (window.OmniRadUnified):
 *   .search(q, {sources, limit})        → grouped [{group, items:[rec]}]
 *   .mountSearch(el, opts)              → ARIA combobox; opts.onPick(rec)
 *   .mountBuilder(el, opts)             → Term Builder; opts.onChange(state)
 *   .compose(state)                     → {en, ar, loinc, rpid, tier}
 * Each rec: {kind, label, ar, rid, region, loinc, count, source}
 * ═══════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var BR = function(){ return window.OmniRadLoincBridge; };
  var AN = function(){ return window.OMNIRAD_ANATOMY; };
  var ARlib = function(){ return window.OmniRadNamingAR; };
  var NM = function(){ return window.OmniRadNaming; };

  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function isAr(){ return window.OmniRadI18n && window.OmniRadI18n.lang==='ar'; }
  function norm(s){ return String(s||'').toLowerCase().replace(/[\s\-_.]+/g,' ').trim(); }
  function arOf(axis, name){ var b=BR(); return (b && b.ar(axis, name)) || null; }

  var AXIS_LABEL = {
    modality:   {en:'Modality',           ar:'المودلتي'},
    region:     {en:'Region imaged',      ar:'المنطقة'},
    focus:      {en:'Imaging focus / organ', ar:'البؤرة / العضو'},
    anatomy:    {en:'Anatomical structure (TA2)', ar:'بنية تشريحية (TA2)'},
    laterality: {en:'Laterality',         ar:'الجانب'}
  };

  /* ── Unified search ──────────────────────────────────────────────── */
  function search(q, opts){
    opts = opts || {};
    var limit = opts.limit || 24;
    var sources = opts.sources || ['modality','region','focus','anatomy'];
    var nq = norm(q);
    var qAr = String(q||'').trim();
    var out = {};
    sources.forEach(function(s){ out[s] = []; });

    var b = BR();
    function scan(axis, list, kind){
      if (!list) return;
      list.forEach(function(v){
        var en = norm(v.n), pref = norm(v.pref);
        var hit = !nq || en.indexOf(nq)>=0 || pref.indexOf(nq)>=0;
        var ar = arOf(axis, v.n);
        if (!hit && ar && qAr && ar.indexOf(qAr)>=0) hit = true;
        if (!hit) return;
        var score = (en===nq?100:en.indexOf(nq)===0?60:en.indexOf(nq)>=0?30:10) + Math.min(v.count||0, 20);
        out[kind] && out[kind].push({ kind:kind, label:v.n, ar:ar, rid:v.rid, pref:v.pref, region:v.rg||null, count:v.count||0, source:'LOINC', score:score });
      });
    }
    if (b && b.axes){
      if (out.modality) scan('modality', b.axes.modality, 'modality');
      if (out.region)   scan('region',   b.axes.region,   'region');
      if (out.focus)    scan('focus',    b.axes.focus,     'focus');
    }
    if (out.anatomy && AN() && AN().structures){
      var struct = nq ? AN().search(q) : AN().structures.slice(0,30);
      // AN().search matches en/ar/aliases already; also cover Arabic query
      struct.forEach(function(s){
        out.anatomy.push({ kind:'anatomy', label:s.en, ar:s.ar, rid:s.radlex||null, ta2:s.ta2||null, id:s.id, source:'TA2', score: norm(s.en)===nq?100:50 });
      });
    }
    var groups = [];
    sources.forEach(function(k){
      var items = (out[k]||[]).sort(function(a,b){return b.score-a.score;}).slice(0, limit);
      if (items.length) groups.push({ group:k, label:AXIS_LABEL[k]||{en:k,ar:k}, items:items });
    });
    return groups;
  }

  /* ── CSS (injected once) ─────────────────────────────────────────── */
  var CSS = ''
    + '.omru{position:relative;font-family:"IBM Plex Sans","Noto Sans Arabic",sans-serif}'
    + '.omru-input{width:100%;padding:12px 14px 12px 40px;background:var(--panel-ov,#162030);border:1.5px solid var(--border-s,rgba(232,240,245,.08));border-radius:11px;color:var(--text,#e8f0f5);font-family:inherit;font-size:14px;outline:none;transition:border-color .16s}'
    + 'body[dir="rtl"] .omru-input{padding:12px 40px 12px 14px}'
    + '.omru-input:focus{border-color:var(--acc,#2dd4c8)}'
    + '.omru-ic{position:absolute;top:14px;inset-inline-start:13px;color:var(--text-m,#6b7a88);pointer-events:none}'
    + '.omru-pop{position:absolute;z-index:80;left:0;right:0;top:calc(100% + 6px);max-height:340px;overflow-y:auto;background:var(--bg-e,#101e2a);border:1.5px solid var(--acc,#2dd4c8);border-radius:12px;box-shadow:0 18px 46px rgba(0,0,0,.4);display:none}'
    + '.omru-pop.on{display:block}'
    + '.omru-grp{padding:8px 12px 4px;font-family:"IBM Plex Mono",monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-m,#6b7a88);position:sticky;top:0;background:var(--bg-e,#101e2a)}'
    + '.omru-opt{display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:pointer;border-inline-start:2px solid transparent}'
    + '.omru-opt:hover,.omru-opt.active{background:var(--acc-sub,rgba(45,212,200,.12));border-inline-start-color:var(--acc,#2dd4c8)}'
    + '.omru-opt .n{flex:1;min-width:0;font-size:13.5px;font-weight:600;color:var(--text,#e8f0f5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    + '.omru-opt .ar{font-size:12.5px;color:var(--text-s,rgba(232,240,245,.6));direction:rtl;font-family:"Noto Sans Arabic",sans-serif}'
    + '.omru-opt .code{font-family:"IBM Plex Mono",monospace;font-size:9.5px;color:var(--text-m,#6b7a88);opacity:0;transition:opacity .15s}'
    + '.omru-opt:hover .code,.omru-opt.active .code{opacity:1}'
    + '.omru-src{font-family:"IBM Plex Mono",monospace;font-size:8.5px;font-weight:700;padding:2px 5px;border-radius:4px;letter-spacing:.02em}'
    + '.omru-src.LOINC{color:#fbbf24;background:rgba(251,191,36,.1)}'
    + '.omru-src.TA2{color:#c7a3ff;background:rgba(199,163,255,.12)}'
    + '.omru-none{padding:16px;text-align:center;color:var(--text-m,#6b7a88);font-size:12.5px}'
    // builder
    + '.omrb{font-family:"IBM Plex Sans","Noto Sans Arabic",sans-serif}'
    + '.omrb-axes{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}'
    + '.omrb-ax{background:var(--panel,#101e2a);border:1px solid var(--border-s,rgba(232,240,245,.08));border-radius:11px;padding:11px 12px}'
    + '.omrb-ax label{display:block;font-family:"IBM Plex Mono",monospace;font-size:9.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--text-m,#6b7a88);margin-bottom:7px}'
    + '.omrb-ax select{width:100%;padding:9px 10px;background:var(--panel-ov,#162030);border:1.5px solid var(--border-s,rgba(232,240,245,.08));border-radius:8px;color:var(--text,#e8f0f5);font-family:inherit;font-size:13px;outline:none}'
    + '.omrb-ax select:focus{border-color:var(--acc,#2dd4c8)}'
    + '.omrb-out{margin-top:14px;background:var(--bg-e,#101e2a);border:1px solid var(--border,rgba(45,212,200,.18));border-radius:12px;padding:14px 16px}'
    + '.omrb-name{font-size:16px;font-weight:800;color:var(--text,#e8f0f5);line-height:1.35}'
    + '.omrb-ar{font-size:14px;color:var(--text-s,rgba(232,240,245,.6));direction:rtl;text-align:right;font-family:"Noto Sans Arabic",sans-serif;margin-top:3px}'
    + '.omrb-foot{display:flex;align-items:center;gap:10px;margin-top:11px;flex-wrap:wrap}'
    + '.omrb-code{font-family:"IBM Plex Mono",monospace;font-size:11px;color:var(--acc,#2dd4c8);background:var(--acc-sub,rgba(45,212,200,.12));border:1px solid var(--border,rgba(45,212,200,.18));border-radius:7px;padding:4px 9px}'
    + '.omrb-tier{display:inline-flex;align-items:center;gap:7px;margin-inline-start:auto}'
    + '.omrb-meter{width:88px;height:6px;border-radius:3px;background:rgba(148,163,184,.18);overflow:hidden}'
    + '.omrb-meter i{display:block;height:100%;transition:width .25s,background .25s}'
    + '.omrb-tier-lbl{font-family:"IBM Plex Mono",monospace;font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}';

  function injectCss(){ if(document.getElementById('omru-css'))return; var s=document.createElement('style'); s.id='omru-css'; s.textContent=CSS; document.head.appendChild(s); }

  /* ── Combobox ────────────────────────────────────────────────────── */
  function mountSearch(el, opts){
    injectCss(); opts = opts || {};
    var wrap = document.createElement('div'); wrap.className='omru';
    wrap.innerHTML = '<span class="omru-ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></span>'
      + '<input class="omru-input" type="text" role="combobox" aria-expanded="false" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="'+esc(opts.placeholder||(isAr()?'ابحث: مودلتي · منطقة · عضو · بنية…':'Search: modality · region · organ · structure…'))+'">'
      + '<div class="omru-pop" role="listbox"></div>';
    el.appendChild(wrap);
    var input = wrap.querySelector('.omru-input');
    var pop = wrap.querySelector('.omru-pop');
    var flat = [], active = -1;

    function render(groups){
      flat = [];
      if (!groups.length){ pop.innerHTML='<div class="omru-none">'+(isAr()?'لا نتائج':'No matches')+'</div>'; pop.classList.add('on'); input.setAttribute('aria-expanded','true'); return; }
      var html='';
      groups.forEach(function(g){
        html += '<div class="omru-grp">'+esc(isAr()?g.label.ar:g.label.en)+'</div>';
        g.items.forEach(function(it){
          var i = flat.length; flat.push(it);
          var code = it.rid ? 'RID '+it.rid : (it.ta2?'TA2 '+it.ta2:'');
          html += '<div class="omru-opt" role="option" data-i="'+i+'">'
            + '<span class="omru-src '+it.source+'">'+it.source+'</span>'
            + '<span class="n">'+esc(it.label)+'</span>'
            + (it.ar?'<span class="ar">'+esc(it.ar)+'</span>':'')
            + (code?'<span class="code">'+esc(code)+'</span>':'')
            + '</div>';
        });
      });
      pop.innerHTML = html; pop.classList.add('on'); input.setAttribute('aria-expanded','true'); active=-1;
      pop.querySelectorAll('.omru-opt').forEach(function(o){ o.addEventListener('mousedown', function(e){ e.preventDefault(); pick(+o.dataset.i); }); });
    }
    function close(){ pop.classList.remove('on'); input.setAttribute('aria-expanded','false'); active=-1; }
    function pick(i){ var rec=flat[i]; if(!rec)return; input.value = (isAr()&&rec.ar)?rec.ar:rec.label; close(); if(opts.onPick) opts.onPick(rec); }
    function setActive(n){ var opts2=pop.querySelectorAll('.omru-opt'); if(!opts2.length)return; active=(n+opts2.length)%opts2.length; opts2.forEach(function(o,k){o.classList.toggle('active',k===active); if(k===active)o.scrollIntoView({block:'nearest'});}); }

    var deb;
    input.addEventListener('input', function(){ clearTimeout(deb); deb=setTimeout(function(){ var q=input.value.trim(); if(!q && !opts.showEmpty){ close(); return; } render(search(q,{sources:opts.sources,limit:opts.limit||8})); }, 120); });
    input.addEventListener('focus', function(){ if(input.value.trim()||opts.showEmpty) render(search(input.value.trim(),{sources:opts.sources,limit:opts.limit||8})); });
    input.addEventListener('keydown', function(e){
      if(!pop.classList.contains('on'))return;
      if(e.key==='ArrowDown'){e.preventDefault();setActive(active+1);}
      else if(e.key==='ArrowUp'){e.preventDefault();setActive(active-1);}
      else if(e.key==='Enter'){ if(active>=0){e.preventDefault();pick(active);} }
      else if(e.key==='Escape'){ close(); }
    });
    document.addEventListener('click', function(e){ if(!wrap.contains(e.target)) close(); });
    return { input:input, clear:function(){ input.value=''; close(); } };
  }

  /* ── Term Builder (post-coordination composer) ───────────────────── */
  function opt(v, sel, axis){ var ar=arOf(axis,v.n); return '<option value="'+esc(v.n)+'"'+(v.n===sel?' selected':'')+'>'+esc(v.n)+(ar?' — '+esc(ar):'')+'</option>'; }

  function compose(state){
    var b=BR(), ar=ARlib();
    var parts=[]; if(state.modality)parts.push(state.modality);
    var anat = state.focus || (state.region && state.region!=='XXX' ? state.region : '');
    if(anat)parts.push(anat);
    if(state.laterality && state.laterality!=='Unspecified')parts.push(state.laterality);
    var en = parts.join(' ');
    // Arabic via composer-style pieces
    var arParts=[];
    if(state.modality)arParts.push((ar&&ar.get('modality',state.modality))||state.modality);
    if(anat){ var aa = (ar&&(ar.get('focus',anat)||ar.get('region',anat)))||anat; arParts.push(aa); }
    if(state.laterality && state.laterality!=='Unspecified')arParts.push((ar&&ar.get('laterality',state.laterality))||state.laterality);
    var arName = arParts.join(' ');
    // LOINC code resolve (best-effort via OmniRadNaming search)
    var loinc='', rpid='';
    if(NM() && state.modality){
      try{
        var hits = NM().search([state.modality, anat].filter(Boolean).join(' '), {modality: state.modality, region: (b&&b.axes&&!state.focus)?state.region:null, limit:1});
        if(hits && hits[0]){ loinc=hits[0].loinc; rpid=hits[0].rpid; }
      }catch(_){}
    }
    var tier = loinc ? 'standard' : (state.modality || state.region) ? 'partial' : 'custom';
    return { en:en, ar:arName, loinc:loinc, rpid:rpid, tier:tier };
  }

  function mountBuilder(el, opts){
    injectCss(); opts = opts || {};
    var b=BR(); if(!b || !b.axes){ el.innerHTML='<div class="omru-none">LOINC bridge not loaded</div>'; return; }
    var state = { modality:'', region:'', focus:'', laterality:'' };
    var wrap = document.createElement('div'); wrap.className='omrb'; el.appendChild(wrap);

    function focusOptions(){
      var list = state.region ? b.focusByRegion(state.region) : b.axes.focus;
      if(!list.length) list = b.axes.focus;
      return '<option value="">—</option>'+list.slice(0,120).map(function(v){return opt(v,state.focus,'focus');}).join('');
    }
    function draw(){
      wrap.innerHTML = '<div class="omrb-axes">'
        + '<div class="omrb-ax"><label>'+(isAr()?'المودلتي':'Modality')+'</label><select data-k="modality"><option value="">—</option>'+b.axes.modality.map(function(v){return opt(v,state.modality,'modality');}).join('')+'</select></div>'
        + '<div class="omrb-ax"><label>'+(isAr()?'المنطقة':'Region')+'</label><select data-k="region"><option value="">—</option>'+b.axes.region.map(function(v){return opt(v,state.region,'region');}).join('')+'</select></div>'
        + '<div class="omrb-ax"><label>'+(isAr()?'البؤرة / العضو':'Focus / organ')+'</label><select data-k="focus">'+focusOptions()+'</select></div>'
        + '<div class="omrb-ax"><label>'+(isAr()?'الجانب':'Laterality')+'</label><select data-k="laterality"><option value="">—</option>'+b.axes.laterality.map(function(v){return opt(v,state.laterality,'laterality');}).join('')+'</select></div>'
        + '</div>'
        + '<div class="omrb-out" id="omrbOut"></div>';
      wrap.querySelectorAll('select').forEach(function(sel){ sel.addEventListener('change', function(){ state[sel.dataset.k]=sel.value; if(sel.dataset.k==='region')state.focus=''; draw(); }); });
      drawOut();
    }
    function drawOut(){
      var r = compose(state);
      var tierColor = r.tier==='standard'?'#34d399':r.tier==='partial'?'#fbbf24':'#94a3b8';
      var tierW = r.tier==='standard'?100:r.tier==='partial'?60:25;
      var tierLbl = { standard:isAr()?'قياسي':'standard', partial:isAr()?'جزئي':'partial', custom:isAr()?'مخصّص':'custom' }[r.tier];
      var out = wrap.querySelector('#omrbOut');
      out.innerHTML = '<div class="omrb-name">'+(esc(r.en)||'<span style="color:var(--text-m)">'+(isAr()?'اختر المحاور…':'Pick axes…')+'</span>')+'</div>'
        + (r.ar?'<div class="omrb-ar">'+esc(r.ar)+'</div>':'')
        + '<div class="omrb-foot">'
        + (r.loinc?'<span class="omrb-code">LOINC '+esc(r.loinc)+(r.rpid?' · '+esc(r.rpid):'')+'</span>':'')
        + '<span class="omrb-tier"><span class="omrb-meter"><i style="width:'+tierW+'%;background:'+tierColor+'"></i></span><span class="omrb-tier-lbl" style="color:'+tierColor+'">'+tierLbl+'</span></span>'
        + '</div>';
      if(opts.onChange) opts.onChange(Object.assign({}, state, r));
    }
    draw();
    window.addEventListener('omnirad-lang', draw);
    return { state:function(){return state;}, compose:function(){return compose(state);} };
  }

  window.OmniRadUnified = { search:search, mountSearch:mountSearch, mountBuilder:mountBuilder, compose:compose };
  if (typeof module!=='undefined' && module.exports) module.exports = window.OmniRadUnified;
})();
