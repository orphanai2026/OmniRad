"""
05 — Upload rendered atlas images to Supabase Storage + insert rows into atlas_images.
Educational use only — © 2026 Dr. Mohammed Saeed Alzahrani.
"""
import os, json, sys, mimetypes, hashlib
from pathlib import Path
from tqdm import tqdm
from dotenv import load_dotenv
from supabase import create_client
from config import OUTPUT, LOGS, TCIA_COLLECTIONS

load_dotenv(Path(__file__).parent / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
BUCKET       = os.getenv("SUPABASE_BUCKET", "atlas")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("✗ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env"); sys.exit(1)

sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# ─── Region mapping ─────────────────────────────────────
def region_of(collection: str):
    for k, cfg in TCIA_COLLECTIONS.items():
        if cfg["collection"] == collection:
            return k
    return "unknown"

REGION_TO_ORGAN = {
    "brain_mri":  ("Brain", "brain"),
    "chest_ct":   ("Chest", "chest"),
    "abdomen_ct": ("Abdomen", "abdomen"),
    "pelvis_ct":  ("Pelvis", "pelvis"),
    "renal_ct":   ("Kidneys", "kidney"),
}

def ensure_bucket():
    try:
        buckets = sb.storage.list_buckets()
        names = [b.name for b in buckets] if hasattr(buckets[0], "name") else [b["name"] for b in buckets]
        if BUCKET not in names:
            sb.storage.create_bucket(BUCKET, options={"public": True})
            print(f"✓ Created bucket: {BUCKET}")
    except Exception as e:
        print(f"  ! bucket check: {e}")

def upload_file(local: Path, remote: str):
    with open(local, "rb") as f:
        data = f.read()
    ct = mimetypes.guess_type(str(local))[0] or "application/octet-stream"
    try:
        sb.storage.from_(BUCKET).upload(
            remote, data,
            file_options={"content-type": ct, "upsert": "true"},
        )
    except Exception as e:
        # upsert fallback
        try:
            sb.storage.from_(BUCKET).update(remote, data,
                file_options={"content-type": ct})
        except Exception as e2:
            raise e2
    return sb.storage.from_(BUCKET).get_public_url(remote)

def sha16(s: str) -> str:
    return hashlib.sha1(s.encode()).hexdigest()[:16]

def main():
    ensure_bucket()

    manifest = LOGS / "04_render_manifest.json"
    if not manifest.exists():
        print("✗ Run 04 first"); sys.exit(1)
    volume_dirs = json.loads(manifest.read_text(encoding="utf-8"))

    inserted = 0
    log_rows = []

    for vdir in tqdm(volume_dirs, desc="Uploading"):
        vpath = Path(vdir)
        meta_p = vpath / "meta.json"
        if not meta_p.exists(): continue
        meta = json.loads(meta_p.read_text(encoding="utf-8"))

        collection = meta["collection"]
        region_key = region_of(collection)
        organ_name, organ_slug = REGION_TO_ORGAN.get(region_key, ("Unknown","unknown"))

        vol_key = sha16(meta["series_uid"])
        remote_base = f"pipeline/{collection}/{vol_key}"

        for sl in meta["slices"]:
            idx = sl["slice_index"]
            base_name  = f"slice_{idx:02d}_base.png"
            cont_name  = f"slice_{idx:02d}_contours.png"
            en_name    = f"slice_{idx:02d}_labels_en.png"
            ar_name    = f"slice_{idx:02d}_labels_ar.png"
            rlx_name   = f"slice_{idx:02d}_labels_radlex.png"

            layers = {}
            for lname in (base_name, cont_name, en_name, ar_name, rlx_name):
                lpath = vpath / lname
                if not lpath.exists(): continue
                remote = f"{remote_base}/{lname}"
                try:
                    layers[lname] = upload_file(lpath, remote)
                except Exception as e:
                    print(f"  ! upload {lname}: {e}")

            # Insert atlas_images row (one row per slice)
            row = {
                "organ":       organ_slug,
                "organ_name":  organ_name,
                "modality":    meta["modality"],
                "plane":       meta["plane"],
                "storage_path": f"{remote_base}/{en_name}",
                "public_url":   layers.get(en_name, ""),
                "layers":       layers,
                "labels":       sl.get("labels", []),
                "slice_index":  idx,
                "z":            sl.get("z"),
                "series_uid":   meta["series_uid"],
                "series_desc":  meta.get("series_desc",""),
                "collection":   collection,
                "task":         meta.get("task",""),
                "ww_wl":        meta.get("ww_wl"),
                "output_size":  meta.get("output_size"),
                "source":       "TCIA (CC-BY)",
                "license":      "CC-BY 4.0",
                "attribution":  meta.get("attribution",""),
                "standards":    meta.get("standards",{}),
                "status":       "approved",
            }
            try:
                sb.table("atlas_images").insert(row).execute()
                inserted += 1
            except Exception as e:
                print(f"  ! insert slice {idx}: {e}")

        # meta.json upload
        try:
            upload_file(meta_p, f"{remote_base}/meta.json")
        except Exception as e:
            print(f"  ! upload meta: {e}")

        log_rows.append({"collection": collection, "volume_key": vol_key,
                         "slices": len(meta["slices"])})

    # activity_log summary
    try:
        sb.table("activity_log").insert({
            "action":  "pipeline_upload",
            "details": {"volumes": len(log_rows), "slices_inserted": inserted,
                        "source": "OmniRad-Pipeline v3", "log": log_rows},
        }).execute()
    except Exception as e:
        print(f"  ! activity_log: {e}")

    (LOGS / "05_upload_manifest.json").write_text(
        json.dumps({"inserted": inserted, "volumes": log_rows},
                   indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n✓ Uploaded & inserted {inserted} slice-rows across {len(log_rows)} volumes.")

if __name__ == "__main__":
    main()
