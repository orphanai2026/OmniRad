"""
04 — Render layered teaching images: DICOM slice + contours + labels + RadLex
    v3: full-body, region-aware WW/WL, anatomy-family colors, Unicode-safe.
"""
import json, sys
from pathlib import Path
import numpy as np
import nibabel as nib
import cv2
from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display
from tqdm import tqdm
from config import (SEG, OUTPUT, LOGS, RADLEX, WW_WL, REGION_WINDOW,
                    OUTPUT_SIZE, hue, TCIA_COLLECTIONS)

# ─── Font resolution ───────────────────────────────────
FONT_CANDIDATES = [
    r"C:\Windows\Fonts\NotoSansArabic-Regular.ttf",
    r"C:\Windows\Fonts\arial.ttf",
    r"C:\Windows\Fonts\tahoma.ttf",
    r"C:\Windows\Fonts\segoeui.ttf",
]
def resolve_font(size=18):
    for f in FONT_CANDIDATES:
        if Path(f).exists():
            try: return ImageFont.truetype(f, size)
            except: continue
    return ImageFont.load_default()

# ─── RadLex — merged brain + full-body ─────────────────
def load_radlex():
    combined = {}
    for name in ("radlex_all.json", "radlex_brain.json"):
        p = RADLEX / name
        if p.exists():
            try: combined.update(json.loads(p.read_text(encoding="utf-8")))
            except Exception as e: print(f"  ! failed to load {name}: {e}")
    return combined

# ─── Region → collection key map ───────────────────────
def collection_to_region(collection: str) -> str:
    for k, cfg in TCIA_COLLECTIONS.items():
        if cfg["collection"] == collection: return k
    return "brain_mri"

def pick_window(entry):
    key = collection_to_region(entry["collection"])
    return REGION_WINDOW.get(key, WW_WL["soft_tissue"])

def window_img(img, ww, wl):
    if ww is None or wl is None:
        lo, hi = np.percentile(img[img>0], [1, 99]) if (img>0).any() else (img.min(), img.max())
    else:
        lo, hi = wl - ww/2, wl + ww/2
    return np.clip((img - lo) / max(hi-lo, 1) * 255, 0, 255).astype(np.uint8)

def squeeze_to_3d(arr):
    while arr.ndim > 3: arr = arr[..., 0]
    return arr

def squeeze_to_2d(arr):
    while arr.ndim > 2: arr = arr[..., 0]
    return arr

def upscale(img, size=OUTPUT_SIZE):
    return cv2.resize(img, (size, size), interpolation=cv2.INTER_LANCZOS4)

def shape_arabic(text):
    if not text: return ""
    try: return get_display(arabic_reshaper.reshape(text))
    except: return text

def render_slice(vol_slice, mask_slices, radlex, ww_wl):
    vol_slice = squeeze_to_2d(vol_slice).astype(np.float32)
    gray = upscale(window_img(vol_slice, *ww_wl))
    img  = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

    label_positions = []
    for name, mask in mask_slices.items():
        m2 = squeeze_to_2d(mask).astype(np.uint8)
        if m2.sum() < 20: continue
        m2_up = cv2.resize(m2, (OUTPUT_SIZE, OUTPUT_SIZE), interpolation=cv2.INTER_NEAREST)
        color = hue(name)  # anatomy-family palette
        contours, _ = cv2.findContours(m2_up, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(img, contours, -1, color, 2, cv2.LINE_AA)

        ys, xs = np.where(m2_up > 0)
        cy, cx = int(ys.mean()), int(xs.mean())
        info = radlex.get(name, {})
        label_positions.append({
            "organ":  name,
            "en":     info.get("en", name.replace("_"," ").title()),
            "ar":     info.get("ar", ""),
            "radlex": info.get("radlex_id", ""),
            "ta2":    info.get("ta2", ""),
            "x": cx, "y": cy,
            "color": color,
        })
    return img, label_positions

def burn_labels(img_bgr, labels, mode="en", font_size=16):
    if not labels: return img_bgr
    pil = Image.fromarray(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil, "RGBA")
    font = resolve_font(font_size)
    used = []
    def overlap(a,b):
        ax,ay,aw,ah=a; bx,by,bw,bh=b
        return not (ax+aw<bx or bx+bw<ax or ay+ah<by or by+bh<ay)
    for L in labels:
        raw = L.get(mode, "")
        if not raw: continue
        text = shape_arabic(raw) if mode=="ar" else raw
        bbox = draw.textbbox((0,0), text, font=font)
        tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
        x, y = L["x"]-tw//2, L["y"]-th//2
        rect = (x-5, y-3, tw+10, th+6)
        tries=0
        while any(overlap(rect,u) for u in used) and tries<8:
            y += th+7; rect=(x-5,y-3,tw+10,th+6); tries+=1
        used.append(rect)
        r,g,b = L["color"]
        draw.rounded_rectangle([rect[0],rect[1],rect[0]+rect[2],rect[1]+rect[3]],
                               radius=5, fill=(0,0,0,180))
        draw.text((x,y), text, font=font, fill=(b,g,r))
    return cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)

def process_volume(entry, radlex):
    nifti = Path(entry["nifti"])
    seg_dir = Path(entry["seg_dir"])
    vol = squeeze_to_3d(nib.load(str(nifti)).get_fdata())

    masks_3d = {}
    for m in seg_dir.glob("*.nii.gz"):
        name = m.name.replace(".nii.gz","")
        arr = squeeze_to_3d(nib.load(str(m)).get_fdata())
        masks_3d[name] = arr > 0.5

    z = vol.shape[2]
    picks = np.linspace(z*0.25, z*0.80, 7).astype(int)

    out_dir = OUTPUT / entry["collection"] / nifti.stem.replace(".nii","")
    out_dir.mkdir(parents=True, exist_ok=True)
    slice_meta = []
    ww_wl = pick_window(entry)

    for idx, zi in enumerate(picks):
        vol_slice = vol[:, :, zi].T
        mask_slices = {k: v[:, :, zi].T for k, v in masks_3d.items()}
        img_full, labels = render_slice(vol_slice, mask_slices, radlex, ww_wl)

        base_gray = upscale(window_img(squeeze_to_2d(vol_slice).astype(np.float32), *ww_wl))
        base_rgb  = cv2.cvtColor(base_gray, cv2.COLOR_GRAY2BGR)

        cv2.imwrite(str(out_dir / f"slice_{idx:02d}_base.png"), base_rgb)
        cv2.imwrite(str(out_dir / f"slice_{idx:02d}_contours.png"), img_full)
        cv2.imwrite(str(out_dir / f"slice_{idx:02d}_labels_en.png"),
                    burn_labels(img_full.copy(), labels, "en"))
        cv2.imwrite(str(out_dir / f"slice_{idx:02d}_labels_ar.png"),
                    burn_labels(img_full.copy(), labels, "ar"))
        cv2.imwrite(str(out_dir / f"slice_{idx:02d}_labels_radlex.png"),
                    burn_labels(img_full.copy(), labels, "radlex"))

        slice_meta.append({"slice_index": idx, "z": int(zi), "labels": labels})

    meta = {
        "collection":  entry["collection"],
        "modality":    entry["modality"],
        "series_uid":  entry["series_uid"],
        "series_desc": entry.get("series_desc",""),
        "plane":       "axial",
        "task":        entry["task"],
        "shape":       list(vol.shape),
        "output_size": OUTPUT_SIZE,
        "ww_wl":       list(ww_wl),
        "slices":      slice_meta,
        "standards": {
            "ontology": "RadLex v4.1",
            "anatomy":  "TA2",
            "dicom":    "DICOM PS3.x",
            "seg":      "TotalSegmentator v2 " + entry["task"],
        },
        "attribution": "Data: TCIA (CC-BY). Educational use only — not for diagnosis.",
        "copyright":   "© 2026 Dr. Mohammed Saeed Alzahrani",
    }
    (out_dir / "meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
    return out_dir

def main():
    manifest_in = LOGS / "03_seg_manifest.json"
    if not manifest_in.exists():
        print("✗ Run 03 first"); sys.exit(1)
    entries = json.loads(manifest_in.read_text(encoding="utf-8"))
    radlex = load_radlex()
    print(f"✓ Loaded RadLex: {len(radlex)} entries")

    done = []
    for e in tqdm(entries, desc="Rendering"):
        try:
            out = process_volume(e, radlex)
            done.append(str(out))
        except Exception as ex:
            print(f"  ! render failed: {ex}")

    (LOGS / "04_render_manifest.json").write_text(
        json.dumps(done, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n✓ Rendered volumes: {len(done)}  ·  Output: {OUTPUT}")

if __name__ == "__main__":
    main()
