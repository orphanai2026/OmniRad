"""
OmniRad Medical Imaging Pipeline v3.0 — Full-body coverage
Copyright © 2026 Dr. Mohammed Saeed Alzahrani
Educational use only — not for diagnosis.
"""
from pathlib import Path

# ─── Paths ─────────────────────────────────────────────
ROOT = Path(r"C:\OmniRad-Pipeline")
DATASETS   = ROOT / "datasets"
NIFTI      = ROOT / "datasets" / "nifti"
SEG        = ROOT / "segmentations"
OUTPUT     = ROOT / "output"
LOGS       = ROOT / "logs"
RADLEX     = ROOT / "radlex"
BACKUP     = ROOT / "backup"

for p in [DATASETS, NIFTI, SEG, OUTPUT, LOGS, RADLEX, BACKUP]:
    p.mkdir(parents=True, exist_ok=True)

# ─── Full-body coverage via 5 diverse TCIA CT collections ───
# All CC-BY, no login required. TotalSegmentator 'total' task on
# each covers ~117 structures — the union spans every region.
TCIA_COLLECTIONS = {
    "brain_mri":  {"collection": "UPENN-GBM",       "modality": "MR", "limit": 3},
    "chest_ct":   {"collection": "NSCLC-Radiomics", "modality": "CT", "limit": 3},
    "abdomen_ct": {"collection": "Pancreas-CT",     "modality": "CT", "limit": 3},
    "pelvis_ct":  {"collection": "CT-COLONOGRAPHY", "modality": "CT", "limit": 3},
    "renal_ct":   {"collection": "CPTAC-CCRCC",     "modality": "CT", "limit": 3},
}

# ─── SERIES FILTER — accept anatomical, reject functional ──
ACCEPT_SERIES_KEYWORDS = [
    "t1", "t2", "flair", "mprage", "spgr", "tse", "se",
    "axial", "sag", "cor", "3d", "anat",
    "abdo", "chest", "pelvi", "thorax", "porto", "arter",
    "post", "delay", "portalvenous", "venous", "helical", "spiral",
    "iv", "c+", "ct", "std", "standard",
]
REJECT_SERIES_KEYWORDS = [
    "perf", "dsc", "dce", "asl", "dwi", "adc", "trace",
    "diffusion", "mrs", "spec", "loc", "scout", "cal",
    "topo", "surview", "surview",
]

# ─── DICOM windowing presets (per RSNA / ACR) ──────────
WW_WL = {
    "brain_ct":     (80, 40),
    "brain_bone":   (2000, 400),
    "brain_subdural":(130, 50),
    "brain_stroke": (40, 40),
    "brain_mri":    (None, None),
    "chest":        (1500, -600),   # lung window
    "mediastinum":  (350, 40),
    "abdomen":      (400, 60),
    "bone":         (2000, 400),
    "soft_tissue":  (400, 40),
}

# Default windowing by region key
REGION_WINDOW = {
    "brain_mri":  WW_WL["brain_mri"],
    "chest_ct":   WW_WL["mediastinum"],
    "abdomen_ct": WW_WL["abdomen"],
    "pelvis_ct":  WW_WL["abdomen"],
    "renal_ct":   WW_WL["abdomen"],
}

# ─── TotalSegmentator tasks per modality ───────────────
TS_TASKS = {
    "CT": "total",     # 117 structures
    "MR": "total_mr",  # 50+ structures
}

# ─── Output image size ─────────────────────────────────
OUTPUT_SIZE = 512

# ─── Color palette by anatomical family ────────────────
# Warm hues = organs, cool = vessels, greens = muscles/GI,
# purples = deep gray/lymph, blues = fluid/ventricles.
def hue(name):
    n = name.lower()
    if "vertebrae" in n or "rib" in n or "skull" in n or "femur" in n or "hip" in n or "sacrum" in n or "clavicle" in n or "scapula" in n or "humerus" in n:
        return (240, 240, 240)  # bone: near-white
    if "brain" in n or "spinal_cord" in n or "cerebellum" in n:
        return (45, 212, 200)   # CNS: teal
    if "lung" in n or "trachea" in n or "bronch" in n:
        return (100, 200, 255)  # airways: cyan
    if "heart" in n or "aorta" in n or "vena" in n or "artery" in n or "vein" in n or "portal" in n:
        return (255, 90, 90)    # cardiovascular: red
    if "liver" in n or "spleen" in n or "kidney" in n or "pancreas" in n or "gallbladder" in n or "adrenal" in n:
        return (255, 180, 60)   # solid abdominal: orange
    if "stomach" in n or "duoden" in n or "colon" in n or "bowel" in n or "esoph" in n:
        return (200, 220, 100)  # GI: yellow-green
    if "bladder" in n or "prostate" in n or "uterus" in n or "ovar" in n:
        return (220, 140, 220)  # pelvic organs: pink
    if "thyroid" in n or "parotid" in n:
        return (255, 200, 120)  # endocrine/gland: peach
    if "iliopsoas" in n or "gluteus" in n or "autochthon" in n or "muscle" in n:
        return (180, 220, 130)  # muscle: light green
    if "ventricle" in n or "csf" in n:
        return (100, 180, 255)  # fluid: blue
    return (0, 200, 255)         # default cyan

CONTOUR_COLORS = {"default": (0, 200, 255)}
