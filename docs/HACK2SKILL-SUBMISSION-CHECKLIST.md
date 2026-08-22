# 🚀 Hack2Skill Submission Checklist — AtmosBridge

**Hack2Skill × Google Cloud — "Build with AI: Code for Communities" (2nd Edition)**  
**Track 2 — Clean Air & Climate Resilience** · BRICS Sustainability Theme  
**Author:** Arup Das ([@arupdas0825](https://github.com/arupdas0825))

---

## 📝 Short Submission Description (2–3 Lines)

> AtmosBridge is a federated, AI-powered climate intelligence platform that fuses citizen-reported pollution sightings, ground sensors, satellite indicators, and weather data to detect hyperlocal pollution hotspots city-level AQI monitors miss. Gemini structures multimodal citizen reports into explainable risk assessments; a prediction layer forecasts spikes and models cross-border smog movement between BRICS regions, routing high-confidence alerts to authorities for rapid, human-approved intervention.

---

## ✅ Final Submission Verification Checklist

### 1. GitHub Repository
- [x] **Public repository:** Accessible on GitHub (`https://github.com/arupdas0825/AtmosBridge`).
- [x] **README complete:** Fully documented quickstart, architecture, stack, env vars, and responsible AI policy.
- [x] **LICENSE present:** Root-level official Apache License 2.0 text (`LICENSE`) with Copyright 2026 Arup Das.
- [x] **Screenshots directory:** `screenshots/` directory structure created with `screenshots/README.md` catalog guide.
- [x] **No secrets committed:** Pre-commit scanner & security check script verified (93 files, 0 secrets).
- [x] **Git history clean:** History search (`git log -S "AIza"`) confirmed zero active hardcoded keys.
- [x] **.env excluded:** Excluded via `.gitignore`.
- [x] **.env.example present:** Safe placeholders only (`GEMINI_API_KEY=`, `OPENAQ_API_KEY=`, `ALLOWED_ORIGINS=`).
- [x] **Local setup instructions:** Clear Python & Node.js quickstart steps tested and verified.
- [x] **Dependencies complete:** `requirements.txt` (root and `backend/`) contain lean, verified core dependencies for lightning-fast serverless/container deployment, with optional ML dependencies (`numpy`, `pandas`, `xgboost`) dynamically handled with full physics-model fallback.

### 2. Prototype Functionality
- [x] **Live prototype URL:** [https://atmosbridgeai.vercel.app/](https://atmosbridgeai.vercel.app/)
- [x] **Citizen report flow:** Photo upload, location picker, text description, and voice transcript input.
- [x] **Gemini multimodal analysis:** Visual plume evaluation, severity scoring (1–4), visual evidence extraction, and operational verification steps.
- [x] **Hotspots explorer:** Spatial clustering of citizen sightings with OpenAQ sensor readings and trend badges.
- [x] **Prediction engine:** 6h/12h/24h atmospheric spike timeline with confidence interval bands and feature importance. The trained XGBoost model (`backend/models/spike_predictor.json`, produced by `scripts/train_model.py`) is now loaded by `backend/services/model.py` and anchors the physics-grounded forecast when present; the service falls back cleanly to the pure physics model if the file or `xgboost` package isn't available.
- [x] **Cross-border intelligence:** Trans-boundary atmospheric drift model with wind vector cards and bilateral advisories.
- [x] **Authority workflow:** Real-time alert triage queue with Acknowledge/Escalate human-in-the-loop action buttons.
- [x] **Mobile experience:** Responsive layout featuring a floating liquid-glass bottom navigation dock.

### 3. Demo Video
- [x] **Demo script prepared:** `docs/demo-script.md` containing a 3–5 minute timestamped scene-by-scene script (0:00 to 5:00).
- [ ] **Video recorded:** High-resolution screen recording following `docs/demo-script.md` *(To be recorded by author)*.
- [ ] **Public video link:** YouTube / Google Drive public URL generated *(To be added prior to final submission)*.
- [x] **Hero flow demonstrated:** Citizen report → Gemini analysis → Hotspot fusion → Spike prediction → Authority triage.

### 4. Pitch Deck
- [x] **Pitch deck content prepared:** `docs/pitch-deck.md` containing full copy, visual recommendations, and speaker notes across 12 slides.
- [ ] **Pitch deck PDF created:** PDF exported from `docs/pitch-deck.md` *(To be rendered prior to final submission)*.
- [x] **No unsupported claims:** Honest distinction between live feeds (OpenAQ, Open-Meteo), AI inference (Gemini), predictions, and synthetic demo sensor grids.

### 5. Final Submission Form Metadata
- **Project Title:** AtmosBridge
- **Track:** Track 2 — Clean Air & Climate Resilience
- **Theme:** BRICS Sustainability & Community Climate Action
- **GitHub Repository URL:** `https://github.com/arupdas0825/AtmosBridge`
- **Live Prototype URL:** `https://atmosbridgeai.vercel.app/`
- **Demo Video URL:** *(Insert public video URL)*
- **Pitch Deck PDF:** *(Attach exported PDF)*
- **Short Description:** *(Copy from section above)*
