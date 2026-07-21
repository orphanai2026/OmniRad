# OmniRad Medical Imaging Pipeline

**Copyright © 2026 Dr. Mohammed Saeed Alzahrani — Educational use only.**

Layered radiology teaching image generator using:
- **TCIA** (open medical DICOM, CC-BY)
- **TotalSegmentator v2** (segmentation, 117 structures)
- **RadLex** (RSNA anatomical ontology)

## Pipeline order
1. `python 01_download_tcia.py`   — fetch DICOM series
2. `python 02_dicom_to_nifti.py`   — convert to NIfTI
3. `python 03_segment.py`          — run TotalSegmentator (GPU)
4. `python 04_render_layers.py`    — build PNG + JSON layers

Output: `C:/OmniRad-Pipeline/output/<collection>/<series>/slice_XX_*.png + meta.json`

## Standards
- RadLex Ontology v4.1
- TA2 (Terminologia Anatomica 2)
- DICOM PS3.x
- TCIA CC-BY attribution required
