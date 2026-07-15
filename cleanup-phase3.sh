#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# OmniRad — Phase 3 End-of-Phase Cleanup
# Generated: 14 Jul 2026
#
# ✅ SAFE OPERATIONS ONLY:
#   • Deletes 5 confirmed-dead modules (zero references in any page)
#   • Deletes 1 duplicate root file (superseded by pages/atlas.html)
#   • Deletes 1 orphan page (bulk-upload-plan.html — planning doc only)
#   • Restores 1 critical missing file (radiology-playbook.js — 3 MB)
#   • Adds documentation
#
# ❌ WILL NOT:
#   • Touch any live page
#   • Delete pipeline/ (marked _DEPRECATED but retained for provenance)
#   • Delete root MD files (OMNIRAD_ISSUES/PROJECT/INSTRUCTIONS) — kept as historical
#
# Run from repo root: cd ~/OmniRad && bash cleanup-phase3.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo "▶ OmniRad Phase 3 cleanup — starting"
echo ""

# ─── 1. Delete confirmed-dead modules ──────────────────────────
echo "🗑  Removing dead modules..."
git rm -f modules/lexicon.js                          2>/dev/null || true
git rm -f modules/library.js                          2>/dev/null || true
git rm -f modules/preset-avatars.js                   2>/dev/null || true
git rm -f modules/srs.js                              2>/dev/null || true
git rm -f modules/data/radiology-consumer-names.js    2>/dev/null || true

# ─── 2. Delete duplicate + orphan pages ────────────────────────
echo "🗑  Removing duplicate root atlas.html + orphan page..."
git rm -f atlas.html                                  2>/dev/null || true
git rm -f pages/bulk-upload-plan.html                 2>/dev/null || true

# ─── 3. Add missing critical file (from local mirror) ──────────
echo "📥 Copying missing files from omnirad-redesign/..."
# radiology-playbook.js — 3 MB · 7,089 LOINC · required for OSERN
cp omnirad-redesign/modules/data/radiology-playbook.js  modules/data/radiology-playbook.js
# build script
mkdir -p scripts
cp omnirad-redesign/scripts/build-anatomy-v2.mjs        scripts/build-anatomy-v2.mjs
cp omnirad-redesign/scripts/README.md                   scripts/README.md 2>/dev/null || true

# ─── 4. New documentation ──────────────────────────────────────
echo "📚 Adding docs..."
cp omnirad-redesign/README.md                           README.md
mkdir -p docs
cp omnirad-redesign/docs/phase-3-completion.md          docs/phase-3-completion.md
cp omnirad-redesign/docs/architecture.md                docs/architecture.md

# ─── 5. Historical-record folder for applied SQL ───────────────
mkdir -p supabase/_applied
cp omnirad-redesign/supabase/_applied/README.md         supabase/_applied/README.md

# ─── 6. Deprecation notice on pipeline ─────────────────────────
if [ -d pipeline ]; then
  cp omnirad-redesign/pipeline/_DEPRECATED.md           pipeline/_DEPRECATED.md
fi

# ─── 7. Stage everything ──────────────────────────────────────
echo ""
echo "📋 Staging changes..."
git add -A

# ─── 8. Preview ───────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📊 Summary of changes:"
git status --short
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "✅ Ready to commit. Review above, then run:"
echo ""
echo '   git commit -m "chore: Phase 3 end-of-phase cleanup'
echo ''
echo '   - Remove 5 dead modules (lexicon, library, preset-avatars, srs, radiology-consumer-names)'
echo '   - Remove duplicate root atlas.html (pages/atlas.html is authoritative)'
echo '   - Remove orphan bulk-upload-plan.html'
echo '   - Restore missing radiology-playbook.js (3 MB · 7,089 LOINC) — critical for OSERN'
echo '   - Add docs/phase-3-completion.md · docs/architecture.md'
echo '   - Add supabase/_applied/ historical migrations record'
echo '   - Mark pipeline/ as deprecated (reference only)"'
echo ''
echo "   git push origin main"
echo ""
