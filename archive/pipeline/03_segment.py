"""
03 — Run TotalSegmentator on all NIfTI volumes
    v3: modality-based task (total for CT, total_mr for MRI).
"""
import json, sys
from pathlib import Path
from tqdm import tqdm
from totalsegmentator.python_api import totalsegmentator
from config import NIFTI, SEG, LOGS, TS_TASKS

def main():
    manifest_in = LOGS / "02_nifti_manifest.json"
    if not manifest_in.exists():
        print("✗ Run 02 first"); sys.exit(1)
    volumes = json.loads(manifest_in.read_text(encoding="utf-8"))
    out_manifest = []

    for v in tqdm(volumes, desc="Segmenting"):
        src = Path(v["nifti"])
        mod = v["modality"].upper()
        task = TS_TASKS.get("MR" if mod in ("MR","MRI") else "CT", "total")
        out_dir = SEG / v["collection"] / src.stem.replace(".nii", "")
        out_dir.mkdir(parents=True, exist_ok=True)
        try:
            totalsegmentator(
                input=str(src),
                output=str(out_dir),
                task=task,
                ml=False,
                fast=False,
                quiet=True,
            )
            masks = [f.name for f in out_dir.glob("*.nii.gz")]
            out_manifest.append({
                **v,
                "seg_dir": str(out_dir),
                "task":    task,
                "masks":   masks,
            })
        except Exception as e:
            print(f"  ! seg failed for {src.name}: {e}")

    (LOGS / "03_seg_manifest.json").write_text(
        json.dumps(out_manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n✓ Segmented: {len(out_manifest)} volumes")

if __name__ == "__main__":
    main()
