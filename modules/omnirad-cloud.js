/* ═══════════════════════════════════════════════════════════════
   OmniRad — Cloud Image Registry + Security Utilities
   ─────────────────────────────────────────────────────────────
   • fetchApproved(query)         — approved images from Supabase
   • signedUrl(path, ttl)         — private-bucket signed URLs
   • watermark(canvas)            — non-invasive © line + OmniRad wordmark
   • embedMetadata(blob, meta)    — write PNG tEXt chunks (copyright/source)
   • uploadApproved(record)       — put a locally-approved item into cloud
   ═══════════════════════════════════════════════════════════════ */
(function(g){
  'use strict';

  const BUCKET = 'omnirad-images';

  function client(){ return (window.OmniRadAuth && OmniRadAuth.client) || null; }

  async function fetchApproved(q){
    q = q || {};
    const sb = client(); if (!sb) return [];
    let query = sb.from('generated_images').select('*').eq('status','approved');
    if (q.structId) query = query.eq('structure_id', q.structId);
    if (q.modality) query = query.eq('modality', q.modality);
    if (q.plane) query = query.eq('plane', q.plane);
    if (q.sequence) query = query.eq('sequence', q.sequence);
    if (q.pathology) query = query.eq('pathology', q.pathology);
    query = query.order('created_at', { ascending:false }).limit(q.limit || 200);
    const { data, error } = await query;
    if (error){ console.warn('[omnirad] fetchApproved', error); return []; }
    return data || [];
  }

  async function signedUrl(path, ttl){
    const sb = client(); if (!sb || !path) return null;
    try {
      const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(path, ttl || 3600);
      if (error) throw error;
      return data.signedUrl;
    } catch(e){ console.warn('[omnirad] signedUrl', e); return null; }
  }

  /* Non-invasive watermark — © line at bottom right + subtle wordmark
     Never covers anatomical detail (< 4% of image area, high-contrast edge only). */
  function watermark(canvas, opts){
    opts = opts || {};
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const scale = Math.max(0.35, Math.min(1, w / 1024));
    const fs1 = Math.round(11 * scale), fs2 = Math.round(9 * scale);
    const pad = Math.round(6 * scale);
    const c1 = opts.copyright || '© OmniRad · omniradai@gmail.com';
    const c2 = opts.label || 'Educational only — not for diagnosis';
    ctx.save();
    ctx.textBaseline = 'bottom';
    ctx.font = fs1 + "px 'IBM Plex Mono', monospace";
    const t1w = ctx.measureText(c1).width;
    ctx.font = fs2 + "px 'IBM Plex Mono', monospace";
    const t2w = ctx.measureText(c2).width;
    const boxW = Math.max(t1w, t2w) + pad*2;
    const boxH = fs1 + fs2 + pad*2 + 4;
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillRect(w - boxW - 6, h - boxH - 6, boxW, boxH);
    ctx.fillStyle = 'rgba(45,212,200,.95)';
    ctx.font = fs1 + "px 'IBM Plex Mono', monospace";
    ctx.fillText(c1, w - boxW - 6 + pad, h - 6 - pad - fs2 - 2);
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.font = fs2 + "px 'IBM Plex Mono', monospace";
    ctx.fillText(c2, w - boxW - 6 + pad, h - 6 - pad);
    ctx.restore();
    return canvas;
  }

  /* Embed PNG tEXt chunks (Copyright, Software, Comment).
     Returns a new Blob with metadata woven in. Works on any PNG blob. */
  async function embedMetadata(blob, meta){
    if (!blob || blob.type !== 'image/png') return blob;
    const buf = new Uint8Array(await blob.arrayBuffer());
    // Skip 8-byte signature
    const out = [buf.slice(0, 8)];
    let i = 8;
    let inserted = false;
    while (i < buf.length){
      const len = (buf[i]<<24)|(buf[i+1]<<16)|(buf[i+2]<<8)|buf[i+3];
      const type = String.fromCharCode(buf[i+4], buf[i+5], buf[i+6], buf[i+7]);
      const chunkEnd = i + 12 + len;
      // Insert our tEXt chunks after IHDR (first chunk)
      if (!inserted && type === 'IHDR'){
        out.push(buf.slice(i, chunkEnd));
        for (const key in meta){
          out.push(makeTextChunk(key, String(meta[key])));
        }
        inserted = true;
      } else {
        out.push(buf.slice(i, chunkEnd));
      }
      i = chunkEnd;
    }
    return new Blob(out, { type:'image/png' });
  }

  function makeTextChunk(keyword, text){
    const data = new TextEncoder().encode(keyword + '\0' + text);
    const len = data.length;
    const type = new Uint8Array([0x74,0x45,0x58,0x74]); // tEXt
    const chunk = new Uint8Array(4 + 4 + len + 4);
    chunk[0] = (len>>24)&0xff; chunk[1] = (len>>16)&0xff; chunk[2] = (len>>8)&0xff; chunk[3] = len&0xff;
    chunk.set(type, 4); chunk.set(data, 8);
    const crc = crc32(chunk.subarray(4, 8 + len));
    chunk[8+len] = (crc>>24)&0xff; chunk[9+len] = (crc>>16)&0xff; chunk[10+len] = (crc>>8)&0xff; chunk[11+len] = crc&0xff;
    return chunk;
  }
  let crcTable = null;
  function crc32(buf){
    if (!crcTable){
      crcTable = new Uint32Array(256);
      for (let n = 0; n < 256; n++){
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        crcTable[n] = c;
      }
    }
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return c ^ 0xFFFFFFFF;
  }

  /* Upload a local library record to Supabase after approval.
     - Applies watermark
     - Embeds metadata
     - Uploads to Storage
     - Inserts row into generated_images */
  async function uploadApproved(rec, opts){
    const sb = client(); if (!sb) throw new Error('Supabase not initialised');
    opts = opts || {};
    // Wrap blob through canvas → watermark → metadata
    const img = await blobToImage(rec.blob);
    const cvs = document.createElement('canvas'); cvs.width = img.width; cvs.height = img.height;
    const ctx = cvs.getContext('2d'); ctx.drawImage(img, 0, 0);
    watermark(cvs);
    const wmBlob = await new Promise(res => cvs.toBlob(res, 'image/png'));
    const finalBlob = await embedMetadata(wmBlob, {
      Copyright: '© 2026 OmniRad Platform. All rights reserved.',
      Software: 'OmniRad Prompt Studio v1.0',
      Author: 'OmniRad',
      License: 'educational-only',
      Comment: 'Structure=' + (rec.structId||'') + ' | Modality=' + (rec.modality||'') + ' | Plane=' + (rec.plane||'') + ' | Variant=' + (rec.variant||'')
    });

    const path = (rec.structId||'misc') + '/' + rec.id + '.png';
    const { error: upErr } = await sb.storage.from(BUCKET).upload(path, finalBlob, {
      contentType: 'image/png', upsert: true
    });
    if (upErr) throw upErr;

    const { data: prof } = await sb.auth.getUser();
    const uid = prof && prof.user ? prof.user.id : null;

    const { data, error } = await sb.from('generated_images').insert({
      structure_id: rec.structId, modality: rec.modality, plane: rec.plane,
      sequence: rec.variant, pathology: rec.pathology || null,
      prompt_en: rec.promptEn, prompt_ar: rec.promptAr, negative_prompt: rec.negative,
      image_path: path, status: 'approved',
      uploaded_by: uid, reviewed_by: uid, reviewed_at: new Date().toISOString(),
      copyright: '© 2026 OmniRad Platform. All rights reserved.',
      license: 'educational-only'
    }).select('id').single();
    if (error) throw error;
    return data;
  }
  function blobToImage(blob){
    return new Promise((res, rej)=>{
      const url = URL.createObjectURL(blob); const im = new Image();
      im.onload = ()=>{ URL.revokeObjectURL(url); res(im); };
      im.onerror = ()=>{ URL.revokeObjectURL(url); rej(new Error('img')); };
      im.src = url;
    });
  }

  g.OmniRadCloud = { fetchApproved, signedUrl, watermark, embedMetadata, uploadApproved };
})(window);
