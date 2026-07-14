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

  // ── Prompt-appended IMAGE SPECIFICATIONS block ───────────────────────
  //  Injected read-only into every prompt produced by Studio to force
  //  ChatGPT to produce DICOM-uniform output.
  function promptSpecBlock(lang){
    if (lang === 'ar'){
      return `

═══ IMAGE SPECIFICATIONS (mandatory · إلزامي) ═══
• Size: exactly 1024 × 1024 pixels — الحجم بالضبط ١٠٢٤×١٠٢٤ بكسل
• Aspect ratio: 1:1 (square, DICOM-compatible) — نسبة ١:١ (مربّع)
• Format: PNG — high fidelity — تنسيق PNG بجودة عالية
• Background: pure black (#000000) — خلفية سوداء نقيّة
• Anatomical structure centered, filling 70-85% of frame — البنية التشريحية في المنتصف
• No borders, no watermarks, no annotations, no text overlays — بدون إطارات أو نصوص أو علامات مائية
• Grayscale radiographic look — greyscale realism per modality — تدرّج رمادي واقعي حسب المودالتي
• Do NOT add rulers, arrows, labels, or dimension marks — ممنوع إضافة مسطرة أو سهام أو تسميات`;
    }
    return `

═══ IMAGE SPECIFICATIONS (mandatory) ═══
• Size: exactly 1024 × 1024 pixels
• Aspect ratio: 1:1 (square, DICOM-compatible)
• Format: PNG, high fidelity, no compression artifacts
• Background: pure black (#000000)
• Anatomical structure centered, filling 70-85% of the frame
• No borders, no watermarks, no annotations, no text overlays
• Grayscale radiographic look consistent with the modality (HU-like for CT, T1/T2 for MRI, etc.)
• Do NOT add rulers, arrows, labels, dimension marks, or scale bars
• Do NOT include multi-panel montages — single view only per image`;
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
    STANDARD, RECOMMENDED,
    aspectClass, validateDimensions, validateFile,
    recommendedSize, promptSpecBlock,
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
