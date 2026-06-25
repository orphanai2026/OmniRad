# 🔬 OmniRad — Project Master Plan
**Multimodal Radiologic Anatomy Platform**

| Field | Value |
|-------|-------|
| Version | v1.0 |
| Date | 2026-06-25 |
| Status | Planning Phase |
| Owner | Mohammed Saeed Alzahrani |
| Type | Independent academic initiative |

---

## ⚠️ Critical Note

> **This is a brand-new project.** No relation to any previous platform. No legacy architecture reused. No previous files or decisions carried over. Built from scratch.

---

# ① Working Protocol — Collaboration Rules with Claude

> These are not recommendations. They are **mandatory commitments** that must appear in every Claude response in every OmniRad conversation.

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

### ⑤.4 Image Tools Suite
```
🔍 Zoom & Pan
📏 Measurement (mm)
🎚️ Window/Level (Bone/Lung/Soft tissue presets)
✂️ Segmentation Highlight (click → highlight organ)
📐 Angle Measurement
🔄 Compare Slices
📸 Save Marked Image

Foundation: OHIF Viewer components (open source)
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

Example:
  Carpal Bones (8 bones)
  EN: "Some Lovers Try Positions That They Can't Handle"
```

### ⑤.7 TTS Pronunciation ⭐
```
Every Latin term has button:
  🔊 Hippocampus
  → correct voice pronunciation
  
+ Adjustable speed
+ Arabic pronunciation also (for translations)

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

## Supported Modalities (8)

```
1. Anatomy (Normal/3D)
2. X-Ray (Plain radiography)
3. CT (Computed Tomography)
4. MRI (Magnetic Resonance Imaging)
5. US (Ultrasound)
6. NM (Nuclear Medicine + SPECT)
7. Angio (Angiography: CT, MR, DSA)
8. Mammo (Mammography)
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

❌ FORBIDDEN: React, Vue, Angular, jQuery
❌ FORBIDDEN: Tailwind, Bootstrap, Material UI
❌ FORBIDDEN: build tools (webpack, vite, etc.)
❌ FORBIDDEN: external CDN for libraries
```

## Layers

### Frontend
```
- Vanilla JS modules
- Web Components for reusable elements
- IndexedDB for local storage
- Service Worker for offline
- Web Speech API for pronunciation
```

### Backend (Future)
```
- Cloudflare Workers (if needed)
- D1 Database (for accounts)
- R2 Storage (for radiologic images)
- No backend in Phase 1 — fully client-side
```

### Approved Open-Source Libraries
```
- TensorFlow.js (browser segmentation)
- Daikon (DICOM reader in JS)
- OHIF Viewer components (Image tools)
- TotalSegmentator (pre-colorization)
```

### AI Integration
```
- Claude API (for AI assistant)
- Rate-limited
- RAG on OmniRad content only
- Strict system prompts
```

## File Structure

```
OmniRad/
├── index.html              ← Main page
├── assets/
│   ├── theme.css           ← Unified CSS Variables
│   ├── fonts/              ← IBM Plex
│   ├── icons/              ← SVG inline
│   └── logo.svg
├── modules/
│   ├── atlas.js            ← Atlas
│   ├── comparison.js       ← Multimodal comparison
│   ├── colorization.js     ← Colorization
│   ├── image-tools.js      ← Imaging tools
│   ├── tts.js              ← Pronunciation
│   ├── srs.js              ← Spaced Repetition
│   ├── mnemonics.js        ← Library
│   └── ai-chat.js          ← AI Assistant
├── data/
│   ├── structures.json     ← Anatomical structures
│   ├── mnemonics.json      ← Mnemonics
│   └── relationships.json  ← Cross-references
├── images/
│   └── [structure-id]/
│       ├── ct-axial.webp
│       ├── ct-axial-colored.webp
│       ├── mri-t1.webp
│       └── ...
└── pages/
    ├── atlas.html
    ├── library.html
    └── settings.html
```

---

# ⑦ Phase Roadmap

## 📋 Approved Task Schedule (Conversations)

> **Rule:** Each task in a separate conversation. Each task requires explicit approval before start AND after completion.

| # | Task | Phase | Status |
|---|------|-------|--------|
| 0 | Write OMNIRAD_PROJECT.md (this file) | Plan | 🔜 Current |
| 1 | Design visual mockups (no code) | Phase 1 | ⏳ |
| 2 | Build main page + base layout | Phase 1 | ⏳ |
| 3 | Build Smart Atlas (5 trial structures) | Phase 1 | ⏳ |
| 4 | Build Multimodal Comparison Engine | Phase 1 | ⏳ |
| 5 | Build Image Tools Suite | Phase 1 | ⏳ |
| 6 | Build Colorization Toggle (trial) | Phase 1 | ⏳ |
| 7 | Build TTS Module | Phase 1 | ⏳ |
| 8 | MVP test with 5-7 students | Phase 1 | ⏳ |
| 9 | Build SRS Module | Phase 2 | ⏳ |
| 10 | Build Mnemonics Library | Phase 2 | ⏳ |
| 11 | Build AI Assistant (AR/EN) | Phase 2 | ⏳ |
| 12 | Expand content (full Abdomen) | Phase 2 | ⏳ |
| 13 | Extended test with 20-30 students | Phase 2 | ⏳ |
| 14 | Build user accounts (Backend) | Phase 3 | ⏳ |
| 15 | Expand to additional body regions | Phase 3 | ⏳ |
| 16 | Build Daily Challenge + Community | Phase 3 | ⏳ |
| 17 | Official launch + marketing | Phase 3 | ⏳ |

## Phase 1 — MVP (4-6 weeks)

```
Goal: Prove the concept with one region only

Scope:
- One region (e.g., Upper Abdomen)
- 5-10 anatomical structures only
- 3 core modalities (CT, MRI, US)
- Core features without AI/SRS
- No accounts (localStorage)

Output:
Shareable prototype for 5-7 students
```

## Phase 2 — Expansion (8-12 weeks)

```
Goal: Complete platform for one region

Scope:
- Same region expanded (20-30 structures)
- 6 modalities (+ X-Ray, NM, Angio)
- AI Assistant activated
- SRS activated
- Mnemonics Library
- Testing with 20-30 students
```

## Phase 3 — Maturity (12-20 weeks)

```
Goal: Comprehensive platform for real-world use

Scope:
- Multiple regions (Thorax, Head, MSK)
- All modalities
- User accounts + sync
- Community features
- Official launch
```

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

## Personal Risks

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| Focus drift from goal | Very High | OMNIRAD_ISSUES.md + Rule #8 |
| Frustration from slow progress | High | Small milestones + phasing |
| Academic load conflict | High | Flexible schedule + no deadline pressure |
| Motivation loss | Medium | 4-week evaluations (Pivot/Persevere) |

---

# ⑩ What We Will NOT Do (No-Goes)

> **Explicit list to prevent Project Creep.** Any feature here — rejected even if it seems excellent.

```
❌ Build mobile app (web-only through Phase 1-3)
❌ Real-time DICOM from PACS
❌ AI image generation (images exist, we don't generate)
❌ Diagnostic tools (education only, no diagnosis)
❌ Multi-user real-time collaboration (Phase 4+)
❌ Video tutorials (Phase 4+)
❌ Live streaming from imaging
❌ Open forum without moderation
❌ Publish patient images (even CC-licensed)
❌ Social features (chat, follow, like) before Phase 3
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

## Approval Rule

```
Task is NOT considered complete until:
1. Explicit approval "approved ✅"
2. OMNIRAD_PROJECT.md updated
3. OMNIRAD_ISSUES.md updated
4. Both updated files delivered to user
5. Uploaded to GitHub (if applicable)

If any step missing → task still in progress.
```

---

# ⑫ Version History

- **v1.0 — 2026-06-25**
  - First release of OMNIRAD_PROJECT.md
  - Brand-new project from scratch
  - 12 core sections
  - 8 mandatory collaboration rules
  - 17 tasks across 3 phases
  - "What we won't do" list for Project Creep prevention

---

## 📎 Appendix — Quick Start Template

```
When starting any new conversation, paste this:

"Starting OmniRad task — [task name]

Read governance files:
- OMNIRAD_PROJECT.md
- OMNIRAD_ISSUES.md

Comply with the 8 collaboration rules:
1. Model Assessment
2. Files First
3. File Wins
4. Three Strikes
5. Best Solution First
6. Approval Gate
7. Concise by Default
8. No Project Creep

Start with:
[Model] [Files Read] [Task Status] [Action Required]
Then request my approval."
```

---

**End of Document — OmniRad Master Plan v1.0**
