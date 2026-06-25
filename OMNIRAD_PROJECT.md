# 🔬 OmniRad — Project Master Plan
**Multimodal Radiologic Anatomy Platform**

| Field | Value |
|-------|-------|
| Version | v1.8 |
| Date | 2026-06-26 |
| Status | Planning Phase |
| Owner | Mohammed Saeed Alzahrani |
| Type | Independent academic initiative |

---

## ⚠️ Critical Note

> **This is a brand-new project.** No relation to any previous platform. No legacy architecture reused. No previous files or decisions carried over. Built from scratch.

---

# ① Working Protocol — Collaboration Rules with Claude

> These are not recommendations. They are **mandatory commitments** that must appear in every Claude response in every OmniRad conversation.

## Language Policy
```
Conversation language : Arabic (محادثة بالعربي)
Work output language  : English (كود، ملفات، تسميات بالإنجليزي)
Technical terms       : Always English (CT, MRI, HTML, JS…)
```

## The 8 Mandatory Rules

### Rule #1 — Model Assessment
```
Start of every response must show:
[Model: Haiku/Sonnet/Opus]
[Files Read: <files read>]
[Task Status: <task state>]
[Action Required: <one specific action>]
```

### Rule #2 — Files First
```
Before any work:
1. Read OMNIRAD_PROJECT.md fully
2. Read OMNIRAD_ISSUES.md fully
3. Check task state in conversation table
4. Announce status to user
5. Wait for confirmation before starting
```

### Rule #3 — File Wins
```
When Claude's memory conflicts with project files:
→ File wins. Always. No exceptions.
```

### Rule #4 — Three Strikes Rule
```
After 3 failed attempts at same problem:
- Stop immediately
- Admit limitation honestly
- Suggest alternatives (new chat / split task / different source)

Never burn tokens on repeated futile attempts.
```

### Rule #5 — Best Solution First
```
When facing a technical problem:
- Present the BEST solution directly
- NO gradual escalation from "safe" to "actual"
- Alternatives mentioned below as secondary

If uncertain → ONE clarifying question, then full solution.
```

### Rule #6 — Approval Gate
```
BEFORE any of these actions:
✋ Writing code
✋ Editing existing file
✋ Creating new file
✋ Running bash command
✋ Web searching
✋ Suggesting unrequested feature

Must:
- Stop
- Request explicit approval
- Wait for "yes/approved/go"

Only exception: Explicit user instruction "execute directly"
```

### Rule #7 — Concise by Default
```
Default response: ≤10 lines
Long responses: only when explicitly requested
NO unsolicited "personal observations"
NO more than ONE question per response
```

### Rule #8 — No Project Creep
```
If ideas emerge outside current task scope:
- Log them in OMNIRAD_ISSUES.md as future tasks
- Do NOT discuss in current conversation
- Do NOT execute with current task

"ONE CONVERSATION = ONE TASK" — Sacred principle.
```

---

# ② Vision & Mission

## Vision

```
To become the world's leading reference for learning 
multimodal radiologic anatomy.
```

## Mission

```
Build an interactive educational platform that enables 
radiologic sciences students and practitioners to explore 
the same anatomical structure across any combination of 
modalities (CT, MRI, US, NM, Angio, X-Ray, Mammo, PET) 
with professional imaging tools and evidence-based 
learning methodology.
```

## Core Principles

```
1. English is foundational (medical specialty language)
2. Arabic is optional support layer
3. Scientific accuracy above all
4. Field validation before building
5. Phased, incremental release
6. Transparency about limitations ("educational use only")
```

---

# ③ Market Positioning

## Market Gap (Confirmed by Research + 120 Field Respondents)

| Gap | Evidence |
|-----|----------|
| No multimodal platform | IMAIOS focuses CT/MRI, Radiopaedia on cases |
| No visual discrimination training | Globally absent (Colorization toggle) |
| No Spaced Repetition for atlas | Anki is generic, not for radiology |
| No organized mnemonics library | Every student reinvents independently |
| Arabic weakness in field | Major platforms English-only |
| AI Assistant for radiology in Arabic | Non-existent |

## Unique Value Propositions (UVPs)

```
1. Smart Multimodal Comparison
   Free selection of 2-8 modalities for dynamic comparison
   
2. Colorization Toggle
   Switch between real and colorized images for eye training
   
3. AI Assistant (AR/EN) — Scoped
   Specialized chatbot for radiologic anatomy only
   
4. Integrated SRS
   Long-term retention tracking per structure
   
5. Mnemonics Library (AR/EN)
   Organized library + user contributions
   
6. TTS Pronunciation
   Correct pronunciation of Latin terms
   
7. Mobile-First Design
   For immediate clinical use
```

---

# ④ Target Audience

## Primary User
```
Radiologic Sciences Students (BSc programs)
- Studying theoretically, preparing for clinical
- Suffering from "textbook → reality" gap
- Accessible via Saudi and Gulf universities
```

## Secondary User
```
Radiology Residents (R1-R2) & Interns
- Need quick clinical reference
- English-proficient
- Limited purchasing power (students)
```

## Tertiary User
```
Practicing Technologists
- Sonographers, CT/MRI technologists
- Need normal anatomy reference
- Prefer simple interfaces
```

## Geographic Scope

```
Phase 1: Saudi Arabia + Gulf (Arabic + English)
Phase 2: All Arab countries
Phase 3: Global (English + additional languages)
```

---

# ⑤ Core Features

## Foundation Features

### ⑤.1 Smart Atlas
```
Page per anatomical structure:
- Core info (name, location, function)
- Images in all available modalities
- Multiple planes (Axial/Sagittal/Coronal)
- Tags and cross-references
```

### ⑤.2 Smart Multimodal Comparison Engine ⭐
```
Strongest feature — free comparison selection:

[☑ CT] [☐ MRI] [☑ US] [☐ X-Ray] 
[☐ Angio] [☐ NM] [☐ Mammo] [☐ PET]

Adaptive layout:
  - 1 modality → fullscreen
  - 2 modalities → 2 columns
  - 3-4 → grid
  - 5+ → side-scroll

+ Sync Mode: scroll in one, others follow
+ Quick Toggles: preset combinations
+ Saved Combinations: favorite presets
```

### ⑤.3 Colorization Toggle ⭐
```
Every CT/MRI image has two versions:
  [Original]    → real grayscale
  [Educational] → colorized (each organ a color)
  
One-click toggle for eye training

Tech:
  - TotalSegmentator (open source)
  - Pre-processed (not real-time)
  - Both versions stored
```

### ⑤.4 Image Tools Suite ✅ COMPLETED (Task #5)
```
Canvas-based professional tools per modality:

BASE TOOLS (all modalities):
  🔍 Zoom & Pan (independent per panel)
  📏 Measure (mm*)
  📐 Angle
  ⬜ ROI Rectangle + area
  ⭕ ROI Ellipse + A×B axes
  🏷 Annotate (free text)
  ↻ Rotate CW/CCW
  ↔ Flip H/V
  ◑ Invert
  ✕ Reset (active panel)
  📸 Save PNG

CT SPECIFIC:
  🔢 HU Probe (illustrative)
  🦴 Cobb Angle
  🎚 Window/Level (7 presets + manual sliders)

MRI SPECIFIC:
  📊 ROI Signal Intensity
  📈 TIC Curve
  Sequence labels: T1/T2/FLAIR/DWI/ADC/T1+C/STIR

US SPECIFIC:
  📏 Depth cm scale
  ⭕ Follicle Volume (A×B×C)
  Mode: B-Mode/Color Doppler/Power Doppler/Spectral
  Gain slider

NM SPECIFIC:
  🔢 ROI Counts
  — H-Line (horizontal reference)
  Colormaps: Hot/Rainbow/Grayscale/Spectrum/Cold Metal
  Tracers: Tc-99m/Tl-201/I-131/Ga-67/F-18 FDG

PET SPECIFIC:
  ☢ SUV Probe (illustrative)
  📊 SUV ROI
  🧬 MTV Estimate
  Colormaps: Hot Metal/Rainbow/PET Std/Grayscale
  PERCIST: CR/PR/SD/PD

RT-IGRT (Educational):
  〰 Isodose Lines (100/80/50/20%)
  ⬜ Field Size (cm×cm)
  ↕ SSD Marker
  ✏ GTV/CTV/PTV/OAR Contour
  ⚠ Not for clinical use — educational only

VIEW MODES:
  ⊞ Normal: 1-3 panels, plane toggle per modality
  ⛶ Expand: fullscreen with floating toolbar
  ⊟ Split: 2 modalities side by side

ACTIVE PANEL SYSTEM:
  - Click panel → becomes Active (teal border)
  - All tools apply to active panel only
  - Zoom/Pan always independent per panel
  - Auto-activates first panel on load

PLANE TOGGLE:
  - Per-modality plane selector
  - Default: first plane only
  - Toggle on/off each plane
  - Grid auto-adapts: 1→fullscreen, 2→side-by-side, 3→3-col

FOUNDATION: Canvas API — no external libraries
DISCLAIMER: Values marked * are illustrative (no DICOM)
```

### ⑤.5 AI Assistant (AR/EN) ⭐
```
Specialized scoped chatbot:
✅ Answers ONLY radiologic anatomy questions
✅ Bilingual (user selects)
✅ Knows ONLY OmniRad content (RAG)
✅ Refuses out-of-scope questions

Tech:
  - Claude API or OpenAI API
  - Strict system prompt
  - Rate limiting (20 questions/day per student)
  - Cache common questions
```

### ⑤.6 Mnemonics Library ⭐
```
Organized library:
  - English mnemonics (established)
  - Arabic mnemonics (locally invented)
  - Visual: image + story + coloring
  - User contributions + supervisor review
```

### ⑤.7 TTS Pronunciation ⭐
```
Every Latin term has button:
  🔊 Hippocampus → correct voice pronunciation
+ Adjustable speed
+ Arabic pronunciation also

Tech:
  - Web Speech API (free, instant)
  - ElevenLabs API later (professional)
```

### ⑤.8 Integrated SRS ⭐
```
SM-2 algorithm (Anki):
After each structure, self-assess:
  [Forgot] [Hard] [Good] [Easy]

System:
  - Determines next review time
  - Calculates "Mastery Level"
  - Reports: strengths/weaknesses, weakest region
```

## Additional Features (Phase 2+)

```
⑤.9  Daily Anatomy Challenge
⑤.10 Case-Based Learning
⑤.11 Print-Ready PDFs
⑤.12 Community Discussion (moderated)
⑤.13 AR Mode (future)
⑤.14 Voice Anatomy Tour
⑤.15 Memory Palace
```

## Supported Modalities (9 + future)

```
1. Anatomy (Normal/3D)
2. X-Ray (Plain radiography)
3. CT (Computed Tomography)
4. MRI (Magnetic Resonance Imaging)
5. US (Ultrasound)
6. NM (Nuclear Medicine + SPECT)
7. Angio (Angiography: CT, MR, DSA)
8. Mammo (Mammography)
9. RT (Radiation Therapy — educational, Task #5)
+ PET / PET-CT (mixed, Phase 2)
+ Fluoroscopy (Phase 2)
```

---

# ⑥ Technical Architecture

## Architecture Principles

```
✅ Vanilla JavaScript ES2020+ (no frameworks)
✅ HTML5 semantic
✅ CSS Variables (unified theme)
✅ Mobile-first responsive
✅ Browser-only deployment (no CLI)
✅ Self-contained HTML files (file:// works)
✅ Web Standards only (no polyfills)
✅ Canvas API for image tools

❌ FORBIDDEN: React, Vue, Angular, jQuery
❌ FORBIDDEN: Tailwind, Bootstrap, Material UI
❌ FORBIDDEN: build tools (webpack, vite, etc.)
❌ FORBIDDEN: external CDN for libraries
```

## Deployment Note (learned in Task #2)
```
- Self-contained HTML (CSS embedded) preferred for local dev
- Avoids file:// path issues with Arabic/spaces in folder names
- Separate assets/ folder used when deploying to server/GitHub Pages
```

## Canvas Architecture (learned in Task #5)
```
Critical lessons:
1. Never use H as variable name (conflicts with document.documentElement)
2. Use offsetWidth/offsetHeight not getBoundingClientRect for sizing
3. Clone event targets before re-binding to prevent listener accumulation
4. Use requestAnimationFrame(()=>rAF(()=>init())) for proper timing
5. Active Panel State: all tools target activePanel only except zoom/pan
```

## File Structure

```
OmniRad/
├── index.html              ← Main page (self-contained for local dev)
├── assets/
│   ├── theme.css
│   ├── fonts/
│   ├── icons/
│   └── logo.svg
├── modules/
│   ├── atlas.js
│   ├── comparison.js
│   ├── colorization.js
│   ├── image-tools.js
│   ├── tts.js
│   ├── srs.js
│   ├── mnemonics.js
│   └── ai-chat.js
├── data/
│   ├── structures.json
│   ├── mnemonics.json
│   └── relationships.json
├── images/
│   └── [structure-id]/
└── pages/
    ├── atlas.html              ← Task #3 ✅ + Task #5 ✅ + Task #7 ✅
    ├── comparison.html         ← Task #4 ✅
    ├── survey.html             ← Task #8 ✅
    ├── distribution-guide.html ← Task #8 ✅
    ├── library.html
    └── settings.html
```

---

# ⑦ Phase Roadmap

## 📋 Approved Task Schedule (Conversations)

| # | Task | Phase | Status |
|---|------|-------|--------|
| 0 | Write OMNIRAD_PROJECT.md (this file) | Plan | ✅ Done |
| 1 | Design visual mockups (no code) | Phase 1 | ✅ Done — 2026-06-25 |
| 2 | Build main page + base layout | Phase 1 | ✅ Done — 2026-06-25 |
| 3 | Build Smart Atlas (5 trial structures) | Phase 1 | ✅ Done — 2026-06-25 |
| 4 | Build Multimodal Comparison Engine | Phase 1 | ✅ Done — 2026-06-25 |
| 5 | Build Image Tools Suite | Phase 1 | ✅ Done — 2026-06-26 |
| 6 | Build Colorization Toggle (trial) | Phase 1 | 🔴 Deferred → Phase 2 |
| 7 | Build TTS Module | Phase 1 | ✅ Done — 2026-06-26 |
| 8 | MVP test with 5-7 students | Phase 1 | 🟡 In Progress — 2026-06-26 |
| 9 | Build SRS Module | Phase 2 | ⏳ |
| 10 | Build Mnemonics Library | Phase 2 | ⏳ |
| 11 | Build AI Assistant (AR/EN) | Phase 2 | ⏳ |
| 12 | Expand content (full Abdomen) | Phase 2 | ⏳ |
| 13 | Extended test with 20-30 students | Phase 2 | ⏳ |
| 14 | Build user accounts (Backend) | Phase 3 | ⏳ |
| 15 | Expand to additional body regions | Phase 3 | ⏳ |
| 16 | Build Daily Challenge + Community | Phase 3 | ⏳ |
| 17 | Official launch + marketing | Phase 3 | ⏳ |

---

# ⑧ Success Criteria (KPIs)

## End of Phase 1 (MVP)

```
✅ 5-7 students try for at least 1 hour
✅ 70%+ say "better than Radiopaedia for this purpose"
✅ 50%+ request to try again
✅ Zero runtime errors
✅ Works on mobile
```

## End of Phase 2

```
✅ 20+ students using weekly
✅ Average 15 min/session
✅ AI Assistant answers 80% of questions accurately
✅ 40%+ retention after two weeks
```

## End of Phase 3

```
✅ 100+ registered users
✅ 50+ weekly active users
✅ Recognition from university faculty
✅ Collaboration requests from other universities
```

---

# ⑨ Risks & Mitigations

## Technical Risks

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| TotalSegmentator inaccuracy | Medium | Early testing + manual review |
| AI gives wrong medical info | High | Strict RAG + disclaimer + rate limit |
| AI API cost escalation | Medium | Rate limit + caching + freemium |
| Browser DICOM limitations | Low | Use WebP/JPG after processing |

## Content Risks

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| Medical inaccuracy | High | Radiologist review + disclaimer |
| Image copyright | Medium | Only CC-licensed sources |
| Wrong mnemonics | Medium | Pre-publication review |

---

# ⑩ What We Will NOT Do (No-Goes)

```
❌ Build mobile app (web-only through Phase 1-3)
❌ Real-time DICOM from PACS
❌ AI image generation
❌ Diagnostic tools (education only)
❌ Multi-user real-time collaboration (Phase 4+)
❌ Video tutorials (Phase 4+)
❌ RT dose calculation (educational tools only, no clinical use)
❌ Open forum without moderation
❌ Publish patient images
❌ Social features before Phase 3
❌ Multiple themes (one professional theme only)
❌ Excessive gamification before Phase 2
❌ Translation to 5 languages (Arabic/English only initially)
❌ Complex backend (Phase 1 client-side only)
❌ Train AI models ourselves (use APIs)
```

---

# ⑪ Conversation & Approval Rules

## Structure of Each Task Conversation

```
1. Start:
   - Read OMNIRAD_PROJECT.md and OMNIRAD_ISSUES.md
   - Announce task status
   - Estimate model needed
   - Request start confirmation

2. During work:
   - Approval Gate before every action
   - Stay within task scope
   - Log side ideas in OMNIRAD_ISSUES.md
   - Concise responses by default

3. Completion:
   - Present task result
   - Apply delivery protocol
   - Request explicit approval "approved ✅"
   - After approval: update governance files
   - Provide next task message
```

## Delivery Protocol

```
At end of each task before requesting approval:

① 🗂️  File table (what's delivered)
② 📋  Execution instructions (step by step)
③ ✅  Quality checklist
④ 👀  What user needs to verify visually
⑤ 🎯  What's the next task after approval

Then: "Do you approve? yes/no/edit"
```

---

# ⑫ Version History

- **v1.8 — 2026-06-26**
  - Task #8 in progress: MVP Test with 5–7 Students
  - Delivered: pages/survey.html · pages/distribution-guide.html
  - survey.html: 20 questions · 4 sections · localStorage · JSON+CSV export · Dark theme
  - distribution-guide.html: 7 steps · 5 timed tasks · KPI table · direct CTA to survey
  - OMNIRAD_ISSUES.md: results template added (§ Task #8 Results)

- **v1.7 — 2026-06-26**
  - Task #7 approved: Build TTS Module
  - Delivered: pages/atlas.html (integrated into Task #5 file)
  - Web Speech API: EN (en-US) + AR (ar-SA) · No external dependencies
  - 🔊 buttons injected next to: structure name (EN+AR), info card labels, sidebar names
  - Floating panel (bottom-right): Language toggle (EN/AR) + Speed (Slow/Normal/Fast)
  - Toggle button in topbar · MutationObserver re-injects on every render
  - Speaking animation (tts-pulse) · Stop on second press · Error state handling

- **v1.6 — 2026-06-26**
  - Task #6 deferred: Colorization Toggle requires TotalSegmentator segmentation masks
  - Manual polygon/SVG approach attempted — technically infeasible without pre-processed masks
  - Issue #8 logged · atlas.html restored to clean Task #5 state
  - Proceeding to Task #7 — TTS Module

- **v1.5 — 2026-06-26**
  - Task #5 approved: Build Image Tools Suite
  - Delivered: pages/atlas.html (self-contained, CSS+JS embedded)
  - Canvas-based tools: Base + CT + MRI + US + NM + PET + RT-IGRT (7 modalities)
  - Active Panel System: tools target active panel only, zoom/pan always independent
  - Plane Toggle: per-modality, default first plane, auto-grid layout
  - View Modes: Normal (plane toggle) · Expand (fullscreen + floating toolbar) · Split (2 modalities)
  - Fullscreen: keyboard hints · ESC to close · modality switcher in header
  - Tooltips on all tool buttons
  - Uploaded to GitHub: orphanai2026/OmniRad

- **v1.4 — 2026-06-25**
  - Task #4 approved: Build Multimodal Comparison Engine

- **v1.3 — 2026-06-25**
  - Task #3 approved: Build Smart Atlas (5 trial structures)

- **v1.2 — 2026-06-25**
  - Task #2 approved: Build main page + base layout

- **v1.1 — 2026-06-25**
  - Task #1 approved: Visual Mockups

- **v1.0 — 2026-06-25**
  - First release of OMNIRAD_PROJECT.md

---

## 📎 Appendix — Quick Start Template

```
When starting any new conversation, paste this:

"Starting OmniRad task — [task name]

Read governance files:
- OMNIRAD_PROJECT.md
- OMNIRAD_ISSUES.md

Comply with the 8 collaboration rules.
Start with: [Model] [Files Read] [Task Status] [Action Required]
Then request my approval."
```

---

**End of Document — OmniRad Master Plan v1.8**
