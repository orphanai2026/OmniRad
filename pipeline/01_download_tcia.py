"""
01 — Download Brain scans from TCIA (public, no login)
    v2: filters for T1/T2 anatomical sequences only.
"""
import json
from pathlib import Path
from tcia_utils import nbia
from tqdm import tqdm
from config import (DATASETS, TCIA_COLLECTIONS, LOGS,
                    ACCEPT_SERIES_KEYWORDS, REJECT_SERIES_KEYWORDS)

def is_anatomical(series_desc: str) -> bool:
    """Accept only T1/T2/FLAIR/anatomical — reject perfusion/diffusion."""
    if not series_desc:
        return False
    s = series_desc.lower()
    for r in REJECT_SERIES_KEYWORDS:
        if r in s: return False
    for a in ACCEPT_SERIES_KEYWORDS:
        if a in s: return True
    return False

def download_series(collection, modality, limit):
    print(f"\n▶ Querying TCIA: {collection} / {modality}")
    try:
        series = nbia.getSeries(collection=collection, modality=modality)
    except Exception as e:
        print(f"  ✗ Query failed: {e}"); return []
    if not series:
        print("  ✗ No series found"); return []

    # Filter for anatomical only
    anat = [s for s in series if is_anatomical(s.get("SeriesDescription",""))]
    print(f"  ✓ Found {len(series)} total, {len(anat)} anatomical — picking {limit}")

    picked = anat[:limit] if anat else series[:limit]
    saved = []
    for s in tqdm(picked, desc=f"  {collection}"):
        try:
            uid  = s["SeriesInstanceUID"]
            desc = s.get("SeriesDescription", "")
            out = DATASETS / collection / uid
            out.mkdir(parents=True, exist_ok=True)
            nbia.downloadSeries([{"SeriesInstanceUID": uid}], path=str(out))
            saved.append({
                "collection": collection,
                "modality":   modality,
                "series_uid": uid,
                "series_desc": desc,
                "path":       str(out),
            })
        except Exception as e:
            print(f"    ! series {uid[:16]}… failed: {e}")
    return saved

def main():
    all_saved = []
    for key, cfg in TCIA_COLLECTIONS.items():
        got = download_series(cfg["collection"], cfg["modality"], cfg["limit"])
        all_saved.extend(got)

    manifest = LOGS / "01_download_manifest.json"
    manifest.write_text(json.dumps(all_saved, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n✓ Manifest: {manifest}")
    print(f"✓ Total anatomical series downloaded: {len(all_saved)}")

if __name__ == "__main__":
    main()
