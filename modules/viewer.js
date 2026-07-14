/* ═══════════════════════════════════════════════════════════════
   OmniRad — Shared DICOM-style viewer
   ─────────────────────────────────────────────────────────────
   One module used by Atlas (single large viewer) and Comparison
   (multiple side-by-side viewers). Unified toolset + rendering.

   Usage:
     <script src="../modules/viewer.js"></script>
     const viewer = OmniRadViewer.create(container, options?);
     viewer.load(path, { ww:300, wl:150 });
     viewer.setTool('wl'); viewer.reset(); viewer.destroy();

   Options:
     showToolbar : boolean (default true)
     showAnno    : boolean (default true) — corner annotations + orient
     showLabels  : boolean (default true)
     compact     : boolean (default false) — smaller toolbar (comparison)
     onWLChange  : (ww, wl) => void   [for LINK sync]
     onZoomChange: (z) => void
     linkKey     : string — panes with same linkKey stay in sync
   ═══════════════════════════════════════════════════════════════ */
(function(g){
  'use strict';

  const CSS = `
  .omr-vw{position:relative;background:#000;display:flex;flex-direction:column;overflow:hidden;user-select:none;border-radius:8px}
  .omr-vw .omr-tb{display:flex;align-items:center;gap:4px;padding:6px 8px;background:rgba(0,0,0,.85);border-bottom:1px solid rgba(45,212,200,.2);flex-wrap:wrap;z-index:3}
  .omr-vw .omr-tb.compact{padding:4px 6px;gap:2px}
  .omr-vw .omr-btn{padding:3px 7px;font-size:10px;font-weight:700;background:transparent;border:1px solid rgba(45,212,200,.25);color:rgba(232,240,245,.7);cursor:pointer;border-radius:4px;font-family:'IBM Plex Mono',monospace;transition:.12s;letter-spacing:.02em;white-space:nowrap}
  .omr-vw .omr-btn:hover{color:#2dd4c8;border-color:#2dd4c8}
  .omr-vw .omr-btn.on{background:#2dd4c8;color:#08100e;border-color:#2dd4c8}
  .omr-vw .omr-tb .sep{width:1px;height:16px;background:rgba(45,212,200,.15);margin:0 3px}
  .omr-vw .omr-tv{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#e8f0f5;padding:2px 6px;background:rgba(45,212,200,.08);border-radius:3px;min-width:44px;text-align:center}
  .omr-vw .omr-canvas-wrap{flex:1;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#000;min-height:200px}
  .omr-vw canvas{max-width:100%;max-height:100%;cursor:ns-resize;image-rendering:pixelated;image-rendering:-moz-crisp-edges;image-rendering:crisp-edges}
  .omr-vw .omr-ovl{position:absolute;inset:0;pointer-events:none}
  .omr-vw .omr-anno{position:absolute;font-family:'IBM Plex Mono',monospace;font-size:10px;color:#a3e635;text-shadow:0 0 4px rgba(0,0,0,.9);pointer-events:none;line-height:1.4;white-space:nowrap;z-index:2}
  .omr-vw .omr-anno.tl{top:8px;inset-inline-start:10px}
  .omr-vw .omr-anno.tr{top:8px;inset-inline-end:10px;text-align:end}
  .omr-vw .omr-anno.bl{bottom:8px;inset-inline-start:10px}
  .omr-vw .omr-anno.br{bottom:8px;inset-inline-end:10px;text-align:end}
  .omr-vw .omr-orient{position:absolute;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:13px;color:#f59e0b;text-shadow:0 0 4px rgba(0,0,0,.9);pointer-events:none;z-index:2}
  .omr-vw .omr-orient.r{top:50%;inset-inline-start:8px;transform:translateY(-50%)}
  .omr-vw .omr-orient.l{top:50%;inset-inline-end:8px;transform:translateY(-50%)}
  .omr-vw .omr-orient.a{top:8px;inset-inline-start:50%;transform:translateX(-50%)}
  .omr-vw .omr-orient.p{bottom:8px;inset-inline-start:50%;transform:translateX(-50%)}
  .omr-vw .omr-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(232,240,245,.4);font-size:12px;text-align:center;padding:20px;font-family:'IBM Plex Mono',monospace}
  .omr-vw.tool-zoom canvas{cursor:zoom-in}
  .omr-vw.tool-pan canvas{cursor:grab}
  .omr-vw.tool-wl canvas{cursor:ns-resize}
  .omr-vw.tool-measure canvas,.omr-vw.tool-angle canvas,.omr-vw.tool-probe canvas,.omr-vw.tool-rect canvas,.omr-vw.tool-ellipse canvas,.omr-vw.tool-arrow canvas{cursor:crosshair}
  .omr-vw.tool-text canvas{cursor:text}
  `;
  if (!document.getElementById('omr-vw-css')){
    const s = document.createElement('style'); s.id = 'omr-vw-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  const LINK = {}; // linkKey → Set<viewer>

  function create(host, opts){
    opts = opts || {};
    const showToolbar = opts.showToolbar !== false;
    const showAnno = opts.showAnno !== false;
    const compact = !!opts.compact;

    const root = document.createElement('div'); root.className = 'omr-vw tool-wl';
    root.innerHTML = `
      ${showToolbar ? `<div class="omr-tb${compact?' compact':''}">
        <button class="omr-btn on" data-tool="wl" title="Window/Level (W)">WL</button>
        <button class="omr-btn" data-tool="zoom" title="Zoom (Z)">Z</button>
        <button class="omr-btn" data-tool="pan" title="Pan (P)">PAN</button>
        <span class="sep"></span>
        <button class="omr-btn" data-tool="measure" title="Ruler (L)">📏</button>
        <button class="omr-btn" data-tool="angle" title="Angle (A)">∠</button>
        <button class="omr-btn" data-tool="rect" title="Rect ROI">▢</button>
        <button class="omr-btn" data-tool="ellipse" title="Ellipse ROI">◯</button>
        <button class="omr-btn" data-tool="arrow" title="Arrow">↗</button>
        <button class="omr-btn" data-tool="text" title="Text label">T</button>
        <button class="omr-btn" data-tool="probe" title="Probe (O)">•</button>
        <span class="sep"></span>
        <span class="omr-tv" data-role="ww">—</span>
        <span class="omr-tv" data-role="wl">—</span>
        <span class="omr-tv" data-role="zoom">1.00×</span>
        <span class="sep"></span>
        <button class="omr-btn" data-act="rotate" title="Rotate 90° (R)">↻</button>
        <button class="omr-btn" data-act="flipH" title="Flip H (H)">↔</button>
        <button class="omr-btn" data-act="flipV" title="Flip V (V)">↕</button>
        <button class="omr-btn" data-act="invert" title="Invert (I)">INV</button>
        <button class="omr-btn" data-act="mag" title="Magnifier (M)">🔍</button>
        <button class="omr-btn" data-act="full" title="Fullscreen (F)">⛶</button>
        <button class="omr-btn" data-act="snap" title="Save (S)">💾</button>
        <button class="omr-btn" data-act="clear" title="Clear (Esc)">CLR</button>
        <button class="omr-btn" data-act="reset" title="Reset">RESET</button>
      </div>` : ''}
      <div class="omr-canvas-wrap">
        <canvas></canvas>
        <svg class="omr-ovl" preserveAspectRatio="none"></svg>
        ${showAnno ? `
          <div class="omr-anno tl" data-role="anno-tl"></div>
          <div class="omr-anno tr" data-role="anno-tr"></div>
          <div class="omr-anno bl" data-role="anno-bl"></div>
          <div class="omr-anno br" data-role="anno-br"></div>
          <div class="omr-orient r">R</div>
          <div class="omr-orient l">L</div>
          <div class="omr-orient a">A</div>
          <div class="omr-orient p">P</div>` : ''}
        <div class="omr-empty" data-role="empty" style="display:none">No image</div>
      </div>`;
    host.appendChild(root);

    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const svg = root.querySelector('.omr-ovl');
    const empty = root.querySelector('[data-role="empty"]');
    const els = {
      ww: root.querySelector('[data-role="ww"]'),
      wl: root.querySelector('[data-role="wl"]'),
      zoom: root.querySelector('[data-role="zoom"]'),
      tl: root.querySelector('[data-role="anno-tl"]'),
      tr: root.querySelector('[data-role="anno-tr"]'),
      bl: root.querySelector('[data-role="anno-bl"]'),
      br: root.querySelector('[data-role="anno-br"]')
    };

    const st = {
      tool:'wl', ww:300, wl:150, zoom:1, panX:0, panY:0,
      rotate:0, flipH:false, flipV:false, invert:false, magnifier:false,
      img:null, imgPath:'', measurements:[], name:''
    };

    function draw(){
      const w = canvas.width, h = canvas.height;
      ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0,0,w,h); ctx.restore();
      if (!st.img) return;
      const scale = Math.min(w/st.img.width, h/st.img.height) * st.zoom;
      const iw = st.img.width * scale, ih = st.img.height * scale;
      ctx.save();
      ctx.translate(w/2 + st.panX, h/2 + st.panY);
      ctx.rotate(st.rotate * Math.PI / 180);
      ctx.scale(st.flipH ? -1 : 1, st.flipV ? -1 : 1);
      ctx.drawImage(st.img, -iw/2, -ih/2, iw, ih);
      ctx.restore();
      try {
        const id = ctx.getImageData(0,0,w,h); const d = id.data;
        const minV = st.wl - st.ww/2, maxV = st.wl + st.ww/2;
        for (let i = 0; i < d.length; i += 4){
          const g = d[i]*0.299 + d[i+1]*0.587 + d[i+2]*0.114;
          let v = (g - minV) / (maxV - minV); v = Math.max(0, Math.min(1, v));
          if (st.invert) v = 1 - v;
          const out = Math.round(v * 255); d[i] = d[i+1] = d[i+2] = out;
        }
        ctx.putImageData(id, 0, 0);
      } catch(e){}
      drawMeasurements();
      refresh();
    }
    function drawMeasurements(){
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const NS = 'http://www.w3.org/2000/svg';
      const line = (a, b, color) => { const l = document.createElementNS(NS,'line'); l.setAttribute('x1',a.x); l.setAttribute('y1',a.y); l.setAttribute('x2',b.x); l.setAttribute('y2',b.y); l.setAttribute('stroke',color); l.setAttribute('stroke-width','2'); svg.appendChild(l); };
      const txt = (x, y, s, c) => { const t = document.createElementNS(NS,'text'); t.setAttribute('x',x); t.setAttribute('y',y); t.setAttribute('fill',c); t.setAttribute('font-family','IBM Plex Mono, monospace'); t.setAttribute('font-size','11'); t.textContent = s; svg.appendChild(t); };
      st.measurements.forEach(m => {
        if (m.type === 'ruler' && m.points.length === 2){ const [a,b] = m.points; line(a,b,'#f472b6'); const d = Math.hypot(b.x-a.x, b.y-a.y); txt((a.x+b.x)/2 + 6, (a.y+b.y)/2 - 6, d.toFixed(1)+' px', '#f472b6'); }
        else if (m.type === 'angle' && m.points.length === 3){ const [a,b,c] = m.points; line(a,b,'#22d3ee'); line(b,c,'#22d3ee'); const v1 = {x:a.x-b.x, y:a.y-b.y}, v2 = {x:c.x-b.x, y:c.y-b.y}; const ang = Math.acos(Math.max(-1,Math.min(1,(v1.x*v2.x+v1.y*v2.y)/(Math.hypot(v1.x,v1.y)*Math.hypot(v2.x,v2.y))))) * 180/Math.PI; txt(b.x+8, b.y-8, ang.toFixed(1)+'°', '#22d3ee'); }
        else if (m.type === 'rect' && m.points.length === 2){ const [a,b] = m.points; const r = document.createElementNS(NS,'rect'); r.setAttribute('x', Math.min(a.x,b.x)); r.setAttribute('y', Math.min(a.y,b.y)); r.setAttribute('width', Math.abs(b.x-a.x)); r.setAttribute('height', Math.abs(b.y-a.y)); r.setAttribute('fill','none'); r.setAttribute('stroke','#fbbf24'); r.setAttribute('stroke-width','2'); svg.appendChild(r); txt(Math.min(a.x,b.x), Math.min(a.y,b.y)-4, Math.abs(b.x-a.x).toFixed(0)+'×'+Math.abs(b.y-a.y).toFixed(0), '#fbbf24'); }
        else if (m.type === 'ellipse' && m.points.length === 2){ const [a,b] = m.points; const e = document.createElementNS(NS,'ellipse'); e.setAttribute('cx', (a.x+b.x)/2); e.setAttribute('cy', (a.y+b.y)/2); e.setAttribute('rx', Math.abs(b.x-a.x)/2); e.setAttribute('ry', Math.abs(b.y-a.y)/2); e.setAttribute('fill','none'); e.setAttribute('stroke','#a78bfa'); e.setAttribute('stroke-width','2'); svg.appendChild(e); }
        else if (m.type === 'arrow' && m.points.length === 2){ const [a,b] = m.points; line(a,b,'#4ade80'); const ang = Math.atan2(b.y-a.y, b.x-a.x); const sz = 10; const p1 = {x:b.x-Math.cos(ang-Math.PI/7)*sz, y:b.y-Math.sin(ang-Math.PI/7)*sz}; const p2 = {x:b.x-Math.cos(ang+Math.PI/7)*sz, y:b.y-Math.sin(ang+Math.PI/7)*sz}; line(b,p1,'#4ade80'); line(b,p2,'#4ade80'); }
        else if (m.type === 'probe' && m.points.length === 1){ const p = m.points[0]; const c = document.createElementNS(NS,'circle'); c.setAttribute('cx',p.x); c.setAttribute('cy',p.y); c.setAttribute('r','5'); c.setAttribute('fill','none'); c.setAttribute('stroke','#a3e635'); c.setAttribute('stroke-width','1.5'); svg.appendChild(c); try { const px = ctx.getImageData(p.x, p.y, 1, 1).data; const gray = Math.round(px[0]*0.299 + px[1]*0.587 + px[2]*0.114); txt(p.x+10, p.y-6, 'g='+gray, '#a3e635'); } catch(e){} }
        else if (m.type === 'text' && m.points.length === 1){ const p = m.points[0]; const c = document.createElementNS(NS,'circle'); c.setAttribute('cx',p.x); c.setAttribute('cy',p.y); c.setAttribute('r','2.5'); c.setAttribute('fill','#f8fafc'); svg.appendChild(c); txt(p.x+8, p.y+4, m.label, '#f8fafc'); }
      });
    }
    function refresh(){
      if (els.ww) els.ww.textContent = 'WW '+st.ww;
      if (els.wl) els.wl.textContent = 'WL '+st.wl;
      if (els.zoom) els.zoom.textContent = st.zoom.toFixed(2)+'×';
      if (els.bl) els.bl.innerHTML = `WW: ${st.ww}<br>WL: ${st.wl}`;
      if (els.br) els.br.innerHTML = `Zoom: ${st.zoom.toFixed(2)}×`;
    }
    function fit(){
      const r = root.querySelector('.omr-canvas-wrap').getBoundingClientRect();
      const s = Math.max(200, Math.min(r.width, r.height) - 8);
      canvas.width = s; canvas.height = s;
      svg.setAttribute('viewBox', '0 0 '+s+' '+s); svg.setAttribute('width', s); svg.setAttribute('height', s);
      draw();
    }
    let ro; try { ro = new ResizeObserver(fit); ro.observe(root); } catch(e){}
    window.addEventListener('resize', fit);
    setTimeout(fit, 30);

    /* Interactions */
    function localPt(e){ const r = canvas.getBoundingClientRect(); const sx = canvas.width/r.width, sy = canvas.height/r.height; return { x:(e.clientX-r.left)*sx, y:(e.clientY-r.top)*sy }; }
    let drag = null, tmp = null;
    canvas.addEventListener('mousedown', (e)=>{
      if (!st.img) return;
      const p = localPt(e);
      if (['wl','zoom','pan'].includes(st.tool)){
        drag = { x:e.clientX, y:e.clientY, ww:st.ww, wl:st.wl, zoom:st.zoom, panX:st.panX, panY:st.panY };
      } else if (['measure','rect','ellipse','arrow'].includes(st.tool)){
        tmp = { type:st.tool==='measure'?'ruler':st.tool, points:[p] };
      } else if (st.tool === 'angle'){
        if (!tmp) tmp = { type:'angle', points:[p] };
        else { tmp.points.push(p); if (tmp.points.length === 3){ st.measurements.push(tmp); tmp = null; drawMeasurements(); } }
      } else if (st.tool === 'probe'){
        st.measurements.push({ type:'probe', points:[p] }); drawMeasurements();
      } else if (st.tool === 'text'){
        const label = window.prompt('Annotation text / نص التعليق:');
        if (label && label.trim()){ st.measurements.push({ type:'text', points:[p], label:label.trim() }); drawMeasurements(); }
      }
    });
    window.addEventListener('mouseup', (e)=>{
      if (drag){ drag = null; }
      if (tmp && ['ruler','rect','ellipse','arrow'].includes(tmp.type)){
        tmp.points.push(localPt(e)); st.measurements.push(tmp); tmp = null; drawMeasurements();
      }
    });
    window.addEventListener('mousemove', (e)=>{
      if (drag){
        const dx = e.clientX-drag.x, dy = e.clientY-drag.y;
        if (st.tool === 'wl'){
          st.ww = Math.max(1, Math.round(drag.ww + dx*2)); st.wl = Math.round(drag.wl + dy*2);
          if (opts.onWLChange) opts.onWLChange(st.ww, st.wl);
          if (opts.linkKey) broadcastLink(opts.linkKey, api, { ww:st.ww, wl:st.wl });
        } else if (st.tool === 'zoom'){
          st.zoom = Math.max(0.25, Math.min(6, drag.zoom * (1 + dy * -0.005)));
          if (opts.linkKey) broadcastLink(opts.linkKey, api, { zoom:st.zoom });
        } else if (st.tool === 'pan'){
          st.panX = drag.panX + dx; st.panY = drag.panY + dy;
        }
        draw();
      }
    });
    canvas.addEventListener('wheel', (e)=>{
      e.preventDefault();
      const d = -Math.sign(e.deltaY) * 0.1;
      st.zoom = Math.max(0.25, Math.min(6, st.zoom + d));
      if (opts.linkKey) broadcastLink(opts.linkKey, api, { zoom:st.zoom });
      draw();
    }, { passive:false });

    /* Toolbar */
    root.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', ()=>{ api.setTool(b.dataset.tool); }));
    root.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', ()=>{
      const a = b.dataset.act;
      if (a === 'rotate') st.rotate = (st.rotate + 90) % 360;
      else if (a === 'flipH') st.flipH = !st.flipH;
      else if (a === 'flipV') st.flipV = !st.flipV;
      else if (a === 'invert') { st.invert = !st.invert; b.classList.toggle('on', st.invert); }
      else if (a === 'mag') { st.magnifier = !st.magnifier; b.classList.toggle('on', st.magnifier); }
      else if (a === 'full') { if (!document.fullscreenElement) root.requestFullscreen && root.requestFullscreen(); else document.exitFullscreen && document.exitFullscreen(); }
      else if (a === 'snap') { const nm = (st.name || 'omnirad') + '_' + Date.now() + '.png'; const a2 = document.createElement('a'); a2.href = canvas.toDataURL('image/png'); a2.download = nm.replace(/\s+/g,'_'); a2.click(); return; }
      else if (a === 'clear') { st.measurements = []; drawMeasurements(); return; }
      else if (a === 'reset') { api.reset(); return; }
      draw();
    }));

    /* Public API */
    const api = {
      root, canvas,
      load(path, cfg){
        cfg = cfg || {};
        st.imgPath = path; st.name = cfg.name || '';
        if (cfg.ww) st.ww = cfg.ww; if (cfg.wl) st.wl = cfg.wl;
        st.zoom = 1; st.panX = 0; st.panY = 0; st.rotate = 0; st.flipH = false; st.flipV = false; st.invert = false; st.measurements = [];
        if (els.tl) els.tl.innerHTML = cfg.title || '';
        if (els.tr) els.tr.innerHTML = cfg.subtitle || '';
        empty.style.display = 'none';
        const img = new Image(); img.crossOrigin = 'anonymous';
        img.onload = ()=>{ st.img = img; refresh(); draw(); };
        img.onerror = ()=>{ st.img = null; empty.style.display = 'flex'; empty.innerHTML = 'Image not available.<br><span style="opacity:.5;font-size:10px">'+path+'</span>'; draw(); };
        img.src = path;
      },
      setTool(t){ st.tool = t; root.className = 'omr-vw tool-'+t; root.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === t)); },
      setWL(ww, wl){ if (ww != null) st.ww = ww; if (wl != null) st.wl = wl; draw(); },
      setZoom(z){ st.zoom = Math.max(0.25, Math.min(6, z)); draw(); },
      reset(){ st.zoom = 1; st.panX = 0; st.panY = 0; st.rotate = 0; st.flipH = false; st.flipV = false; st.invert = false; st.measurements = []; draw(); },
      state: () => ({...st}),
      destroy(){ try { ro && ro.disconnect(); } catch(e){} root.remove(); if (opts.linkKey && LINK[opts.linkKey]) LINK[opts.linkKey].delete(api); }
    };

    if (opts.linkKey){ LINK[opts.linkKey] = LINK[opts.linkKey] || new Set(); LINK[opts.linkKey].add(api); }
    return api;
  }

  function broadcastLink(key, sender, changes){
    const set = LINK[key]; if (!set) return;
    set.forEach(v => { if (v === sender) return; if (changes.ww != null || changes.wl != null) v.setWL(changes.ww, changes.wl); if (changes.zoom != null) v.setZoom(changes.zoom); });
  }

  g.OmniRadViewer = { create, LINK };
})(window);
