# 🔬 OmniRad

> The world's first multimodal radiologic anatomy learning platform — designed by students, for students.

[![Status](https://img.shields.io/badge/status-planning-yellow.svg)]()
[![Version](https://img.shields.io/badge/version-1.0--alpha-blue.svg)]()
[![License](https://img.shields.io/badge/license-Educational-green.svg)]()

---

## 🎯 What is OmniRad?

OmniRad is an interactive educational platform that helps radiologic sciences students and practitioners explore the same anatomical structure across **any combination of imaging modalities** — CT, MRI, Ultrasound, X-Ray, Nuclear Medicine, Angiography, Mammography, and PET.

Unlike existing platforms that focus on a single modality or treat radiology as an afterthought, OmniRad puts **multimodal comparison at the core** of the learning experience.

---

## 💡 Why OmniRad?

Based on field research with **120 radiologic sciences students and practitioners**, four critical pain points consistently emerged:

1. **Latin terminology is hard to memorize** — Students invent personal mnemonics from scratch
2. **Grayscale discrimination is difficult** — Distinguishing organs in CT/MRI takes years
3. **No clear learning path** — Students can't verify what they've actually retained
4. **Books aren't portable** — Carrying anatomy references everywhere is impractical

OmniRad addresses each of these with purpose-built features.

---

## ⭐ Core Features

### 🎚️ Smart Multimodal Comparison
Select any combination of 2–8 imaging modalities to compare side-by-side. Dynamic layout adapts to your selection.

### 🎨 Colorization Toggle
Switch between real grayscale CT/MRI images and educationally colorized versions. Train your eye to distinguish organs in real clinical contexts.

### 🤖 AI Assistant (AR/EN)
Specialized chatbot scoped exclusively to radiologic anatomy. Available in Arabic and English with strict knowledge boundaries to ensure accuracy.

### 📚 Mnemonics Library
Curated collection of memorization techniques in both Arabic and English, with user contribution and review system.

### 🔊 TTS Pronunciation
Hear correct pronunciation of Latin anatomical terms with adjustable speed and bilingual support.

### 🧠 Integrated Spaced Repetition
Built-in SM-2 algorithm tracks long-term retention per structure. Know what you've truly learned vs. what you've forgotten.

### 🛠️ Professional Image Tools
Zoom, pan, window/level adjustment, measurement, segmentation highlighting — all the tools you'd expect from a clinical workstation.

### 📱 Mobile-First Design
Built for instant clinical reference. Works on any device, anywhere.

---

## 🎓 Who is OmniRad for?

| Audience | Use Case |
|----------|----------|
| **Radiologic Sciences Students** | Bridge the gap between textbook anatomy and clinical reality |
| **Radiology Residents (R1-R2)** | Quick on-call reference for cross-sectional anatomy |
| **Practicing Technologists** | Reference for normal anatomy across modalities |
| **Medical Educators** | Teaching aid for radiologic anatomy courses |

---

## 🌍 Languages

| Language | Status |
|----------|--------|
| English | ✅ Primary (medical specialty language) |
| Arabic | ✅ Full support (optional toggle) |

---

## 🏗️ Technical Stack

OmniRad is built with intentionally minimal dependencies for maximum portability and learning value:

- **Frontend:** Vanilla JavaScript (ES2020+), HTML5, CSS Variables
- **Storage:** IndexedDB (local), Cloudflare D1 (future)
- **AI:** Claude API or OpenAI API (scoped RAG)
- **Image Processing:** TotalSegmentator, TensorFlow.js
- **Deployment:** Browser-only (no build tools required)

> **Philosophy:** No frameworks. No build pipelines. Pure web standards. Open and learnable.

---

## 📋 Project Status

OmniRad is currently in **Planning Phase (v1.0-alpha)**.

| Phase | Description | Status |
|-------|-------------|--------|
| **Plan** | Documentation, research, mockups | 🔜 In progress |
| **Phase 1** | MVP — Upper Abdomen, 3 modalities | ⏳ Upcoming |
| **Phase 2** | Full region, 6 modalities, AI Assistant | ⏳ Future |
| **Phase 3** | Multiple regions, all modalities, official launch | ⏳ Future |

See [OMNIRAD_PROJECT.md](./OMNIRAD_PROJECT.md) for the complete roadmap.

---

## 📂 Repository Structure

```
OmniRad/
├── README.md                  ← You are here
├── OMNIRAD_PROJECT.md         ← Master plan and governance
├── OMNIRAD_ISSUES.md          ← Issues and deferred tasks log
├── index.html                 ← (Coming) Main entry point
├── assets/                    ← (Coming) Styles, fonts, icons
├── modules/                   ← (Coming) JavaScript modules
├── data/                      ← (Coming) Anatomical data (JSON)
├── images/                    ← (Coming) Radiologic images
└── pages/                     ← (Coming) Application pages
```

---

## 🤝 Contributing

OmniRad is currently in early planning. Contribution guidelines will be added once the MVP is published.

If you're interested in:
- **Mnemonics submission** — Wait for Phase 2 launch
- **Medical review** — Contact the owner directly
- **Translation** — Wait for Phase 3
- **Feature requests** — Open an issue (after public launch)

---

## ⚠️ Disclaimer

OmniRad is an **educational tool only**. It is **not** intended for:

- Clinical diagnosis
- Patient treatment decisions
- Replacement of formal radiology training
- Legal or medical advice

All medical content should be verified with qualified medical professionals and authoritative sources.

---

## 📄 License

Educational use license. Full terms to be defined before public release.

Image sources are credited individually under Creative Commons or other appropriate open licenses.

---

## 👤 About the Owner

**Mohammed Saeed Alzahrani**
Radiologic Sciences Student
King Abdulaziz University — Faculty of Applied Medical Sciences
Independent academic initiative

This project is a student-led initiative, not affiliated with or endorsed by King Abdulaziz University.

---

## 🌟 Why "OmniRad"?

**Omni** (Latin: *all, every*) + **Rad** (Radiology) — reflecting our core promise: every anatomical structure, in every imaging modality, in one place.

---

*"Built by a student who knows the pain. For students who deserve better tools."*
