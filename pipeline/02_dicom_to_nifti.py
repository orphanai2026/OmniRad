"""
02 — Convert DICOM series → NIfTI (needed by TotalSegmentator)
"""
import json, sys, shutil, uuid
from pathlib import Path
from tqdm import tqdm
from config import DATASETS, NIFTI, LOGS

def convert_series(dicom_dir: Path, out_nifti: Path):
    """Use dicom2nifti (installed with totalsegmentator deps)."""
    import dicom2nifti
    out_nifti.parent.mkdir(parents=True, exist_ok=True)
    tmp_dir = out_nifti.parent / f"_tmp_{uuid.uuid4().hex[:8]}"
    tmp_dir.mkdir(exist_ok=True)
    try:
        dicom2nifti.convert_directory(str(dicom_dir), str(tmp_dir),
                                       compression=True, reorient=True)
        niftis = list(tmp_dir.glob("*.nii.gz"))
        if not niftis:
            shutil.rmtree(tmp_dir, ignore_errors=True)
            return None
        best = max(niftis, key=lambda f: f.stat().st_size)
        if out_nifti.exists():
            out_nifti.unlink()
        shutil.move(str(best), str(out_nifti))
        shutil.rmtree(tmp_dir, ignore_errors=True)
        return out_nifti
    except Exception as e:
        print(f"  ! convert failed: {e}")
        shutil.rmtree(tmp_dir, ignore_errors=True)
        return None

def main():
    manifest_in = LOGS / "01_download_manifest.json"
    if not manifest_in.exists():
        print("✗ Run 01_download_tcia.py first"); sys.exit(1)

    downloads = json.loads(manifest_in.read_text(encoding="utf-8"))
    out_manifest = []

    for d in tqdm(downloads, desc="Converting"):
        src = Path(d["path"])
        dicom_dirs = [p for p in src.rglob("*") if p.is_dir() and any(p.glob("*.dcm"))]
        if not dicom_dirs and any(src.glob("*.dcm")):
            dicom_dirs = [src]
        if not dicom_dirs:
            continue

        for i, dd in enumerate(dicom_dirs):
            name = f"{d['collection']}_{d['series_uid'][-12:]}_{i}.nii.gz"
            out = NIFTI / d["collection"] / name
            res = convert_series(dd, out)
            if res:
                out_manifest.append({
                    "collection": d["collection"],
                    "modality":   d["modality"],
                    "series_uid": d["series_uid"],
                    "nifti":      str(res),
                })

    (LOGS / "02_nifti_manifest.json").write_text(
        json.dumps(out_manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n✓ Converted: {len(out_manifest)} volumes")

if __name__ == "__main__":
    main()
