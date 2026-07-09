/* ═══════════════════════════════════════════════════════════════
   OmniRad — Local Library (IndexedDB)
   ─────────────────────────────────────────────────────────────
   Stores generated images with full metadata BEFORE cloud sync.
   Approved-only items sync to Supabase after platform launch.

   DB: OmniRadLibrary  · Store: images
   Record: {
     id (uuid), blob (image), thumb (small dataURL),
     name, promptEn, promptAr, negative,
     structId, modality, plane, variant,
     region, organ, pathology, status ('pending'|'approved'|'rejected'),
     tags[], notes, createdAt, approvedAt, source, version
   }
   ═══════════════════════════════════════════════════════════════ */
(function(g){
  'use strict';
  const DB = 'OmniRadLibrary', VER = 1, STORE = 'images';

  function open(){
    return new Promise((res, rej)=>{
      const rq = indexedDB.open(DB, VER);
      rq.onupgradeneeded = (e)=>{
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE)){
          const os = db.createObjectStore(STORE, { keyPath:'id' });
          os.createIndex('status','status');
          os.createIndex('structId','structId');
          os.createIndex('createdAt','createdAt');
        }
      };
      rq.onsuccess = ()=> res(rq.result);
      rq.onerror = ()=> rej(rq.error);
    });
  }
  function uuid(){ return 'lib_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8); }
  async function makeThumb(blob, max){
    max = max || 240;
    return new Promise((res, rej)=>{
      const img = new Image(); const url = URL.createObjectURL(blob);
      img.onload = ()=>{
        const s = Math.min(max/img.width, max/img.height, 1);
        const w = Math.round(img.width*s), h = Math.round(img.height*s);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = ()=>{ URL.revokeObjectURL(url); rej(new Error('img load')); };
      img.src = url;
    });
  }

  async function add(record){
    const db = await open();
    return new Promise((res, rej)=>{
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(record);
      tx.oncomplete = ()=>{ db.close(); res(record); };
      tx.onerror = ()=>{ db.close(); rej(tx.error); };
    });
  }
  async function all(filter){
    const db = await open();
    return new Promise((res, rej)=>{
      const out = [];
      const tx = db.transaction(STORE, 'readonly');
      tx.objectStore(STORE).openCursor().onsuccess = (e)=>{
        const cur = e.target.result;
        if (cur){ const r = cur.value; if (!filter || filter(r)) out.push(r); cur.continue(); }
        else { db.close(); res(out.sort((a,b)=> b.createdAt - a.createdAt)); }
      };
      tx.onerror = ()=>{ db.close(); rej(tx.error); };
    });
  }
  async function get(id){
    const db = await open();
    return new Promise((res, rej)=>{
      const tx = db.transaction(STORE, 'readonly');
      const rq = tx.objectStore(STORE).get(id);
      rq.onsuccess = ()=>{ db.close(); res(rq.result); };
      rq.onerror = ()=>{ db.close(); rej(rq.error); };
    });
  }
  async function update(id, patch){
    const cur = await get(id); if (!cur) return null;
    const next = { ...cur, ...patch };
    return add(next);
  }
  async function remove(id){
    const db = await open();
    return new Promise((res, rej)=>{
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = ()=>{ db.close(); res(true); };
      tx.onerror = ()=>{ db.close(); rej(tx.error); };
    });
  }

  function buildName(r){
    const clean = s => (s||'').toString().replace(/[^A-Za-z0-9-]+/g,'_').replace(/^_+|_+$/g,'');
    const parts = [r.structId, r.modality, r.plane, r.variant].map(clean).filter(Boolean);
    return parts.join('_') || 'omnirad_image';
  }

  async function importFile(file, meta){
    const rec = {
      id: uuid(),
      blob: file,
      thumb: await makeThumb(file).catch(()=>null),
      name: buildName(meta) + '.png',
      status: 'pending',
      createdAt: Date.now(),
      approvedAt: null,
      version: '1.0',
      source: meta.source || 'external-generation',
      tags: [],
      notes: '',
      ...meta
    };
    return add(rec);
  }
  async function approve(id){ return update(id, { status:'approved', approvedAt: Date.now() }); }
  async function reject(id){ return update(id, { status:'rejected' }); }
  async function repending(id){ return update(id, { status:'pending', approvedAt: null }); }

  async function exportAllJSON(){
    const rows = await all();
    // strip blobs; export lightweight metadata JSON
    return rows.map(r => ({
      id:r.id, name:r.name, promptEn:r.promptEn, promptAr:r.promptAr, negative:r.negative,
      structId:r.structId, modality:r.modality, plane:r.plane, variant:r.variant,
      region:r.region, organ:r.organ, pathology:r.pathology, status:r.status,
      tags:r.tags, notes:r.notes, createdAt:r.createdAt, approvedAt:r.approvedAt,
      source:r.source, version:r.version
    }));
  }
  async function download(id){
    const r = await get(id); if (!r || !r.blob) return;
    const url = URL.createObjectURL(r.blob);
    const a = document.createElement('a'); a.href = url; a.download = r.name; a.click();
    setTimeout(()=> URL.revokeObjectURL(url), 400);
  }

  async function stats(){
    const rows = await all();
    return {
      total: rows.length,
      pending: rows.filter(r=>r.status==='pending').length,
      approved: rows.filter(r=>r.status==='approved').length,
      rejected: rows.filter(r=>r.status==='rejected').length
    };
  }

  g.OmniRadLib = { open, uuid, add, all, get, update, remove, importFile, approve, reject, repending, exportAllJSON, download, stats, buildName, makeThumb };
})(window);
