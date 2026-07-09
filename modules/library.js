/* ═══════════════════════════════════════════════════════════════
   OmniRad — Local Library (IndexedDB)
   ─────────────────────────────────────────────────────────────
   Local staging area for generated images before cloud upload.
   Every image goes through: draft → review → (approved | rejected).
   Only approved images are published to Supabase.

   API (all promise-based):
     await OmniRadLib.open();
     await OmniRadLib.save(entry);              // insert or update; returns id
     await OmniRadLib.get(id);
     await OmniRadLib.list(filter);             // filter = { status?, structure_id?, modality? }
     await OmniRadLib.remove(id);
     await OmniRadLib.count(filter);
     await OmniRadLib.exportJson();             // full library as JSON blob
     await OmniRadLib.importJson(blob);         // bulk import
     await OmniRadLib.clear();                  // danger

   Entry shape:
     {
       id?: string (uuid),                       // auto if omitted
       structure_id, modality, plane,
       sequence, phase, slice_thickness,
       pathology,
       prompt_en, prompt_ar, negative_prompt,
       image_blob: Blob | null,                  // the actual image bytes
       thumb_blob: Blob | null,
       status: 'draft' | 'review' | 'approved' | 'rejected',
       review_note?: string,
       reviewed_by?: string,                     // profile id
       reviewed_at?: ISO string,
       cloud_id?: string,                        // Supabase row id (once uploaded)
       cloud_path?: string,                      // Supabase storage path
       created_at: ISO string,
       updated_at: ISO string
     }
   ═══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  const DB_NAME = 'omnirad-lib';
  const STORE = 'images';
  const VERSION = 1;
  let _db = null;

  function uuid() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'lib-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
  }

  function req(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror   = () => reject(request.error);
    });
  }

  async function open() {
    if (_db) return _db;
    _db = await new Promise((resolve, reject) => {
      const r = indexedDB.open(DB_NAME, VERSION);
      r.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const os = db.createObjectStore(STORE, { keyPath: 'id' });
          os.createIndex('status', 'status', { unique: false });
          os.createIndex('structure_id', 'structure_id', { unique: false });
          os.createIndex('modality', 'modality', { unique: false });
          os.createIndex('created_at', 'created_at', { unique: false });
        }
      };
      r.onsuccess = () => resolve(r.result);
      r.onerror   = () => reject(r.error);
    });
    return _db;
  }

  function tx(mode) {
    return _db.transaction(STORE, mode).objectStore(STORE);
  }

  async function save(entry) {
    await open();
    const now = new Date().toISOString();
    const row = Object.assign(
      { id: uuid(), status: 'draft', created_at: now, updated_at: now },
      entry
    );
    row.updated_at = now;
    if (!row.created_at) row.created_at = now;
    await req(tx('readwrite').put(row));
    return row.id;
  }

  async function get(id) {
    await open();
    return await req(tx('readonly').get(id));
  }

  async function remove(id) {
    await open();
    await req(tx('readwrite').delete(id));
  }

  async function clear() {
    await open();
    await req(tx('readwrite').clear());
  }

  async function list(filter) {
    await open();
    filter = filter || {};
    return await new Promise((resolve, reject) => {
      const out = [];
      const store = tx('readonly');
      const req = store.openCursor(null, 'prev'); // newest first
      req.onsuccess = (e) => {
        const cur = e.target.result;
        if (!cur) { resolve(out); return; }
        const r = cur.value;
        if ((filter.status       == null || r.status       === filter.status) &&
            (filter.structure_id == null || r.structure_id === filter.structure_id) &&
            (filter.modality     == null || r.modality     === filter.modality)) {
          out.push(r);
        }
        cur.continue();
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function count(filter) { return (await list(filter)).length; }

  async function setStatus(id, status, note, reviewerId) {
    const row = await get(id);
    if (!row) throw new Error('Entry not found: ' + id);
    row.status = status;
    row.review_note = note || null;
    row.reviewed_by = reviewerId || null;
    row.reviewed_at = new Date().toISOString();
    row.updated_at  = row.reviewed_at;
    await open();
    await req(tx('readwrite').put(row));
    return row;
  }

  /* ───────── Cloud publish helper (approved → Supabase) ─────────
     Requires OmniRadAuth (supabase.js) to be loaded.
     Uploads image_blob, creates a row in generated_images with
     status='approved' (admin only) or 'review' (contributor).
  */
  async function publish(id) {
    const row = await get(id);
    if (!row) throw new Error('Entry not found: ' + id);
    if (row.status !== 'approved') throw new Error('Only locally-approved entries can be published');
    if (!global.OmniRadAuth) throw new Error('OmniRadAuth (supabase.js) not loaded');

    const isAdmin = await OmniRadAuth.isAdmin();
    // Contributors submit to 'review' queue; admins publish directly 'approved'.
    const cloudStatus = isAdmin ? 'approved' : 'review';

    let cloud_path = row.cloud_path;
    if (row.image_blob && !cloud_path) {
      cloud_path = await OmniRadAuth.uploadImage(
        row.structure_id, row.modality, row.plane, row.image_blob,
        (row.image_blob.type && row.image_blob.type.split('/')[1]) || 'png'
      );
    }
    const cloudRow = await OmniRadAuth.submitImage({
      structure_id:    row.structure_id,
      modality:        row.modality,
      plane:           row.plane,
      sequence:        row.sequence,
      pathology:       row.pathology,
      prompt_en:       row.prompt_en,
      prompt_ar:       row.prompt_ar,
      negative_prompt: row.negative_prompt,
      image_path:      cloud_path,
      status:          cloudStatus
    });

    row.cloud_id   = cloudRow.id;
    row.cloud_path = cloud_path;
    row.status     = cloudStatus === 'approved' ? 'approved' : 'review';
    row.updated_at = new Date().toISOString();
    await open();
    await req(tx('readwrite').put(row));
    return cloudRow;
  }

  async function exportJson() {
    const all = await list();
    // strip blobs (JSON-unfriendly); export metadata only
    const meta = all.map(r => {
      const c = Object.assign({}, r);
      delete c.image_blob; delete c.thumb_blob;
      c._had_image = !!r.image_blob;
      return c;
    });
    return new Blob([JSON.stringify({ version: 1, exported_at: new Date().toISOString(), entries: meta }, null, 2)],
      { type: 'application/json' });
  }

  async function importJson(blob) {
    const text = await blob.text();
    const doc  = JSON.parse(text);
    if (!doc || !Array.isArray(doc.entries)) throw new Error('Invalid library file');
    await open();
    for (const e of doc.entries) await req(tx('readwrite').put(e));
    return doc.entries.length;
  }

  global.OmniRadLib = { open, save, get, list, count, remove, clear, setStatus, publish, exportJson, importJson };
})(window);
