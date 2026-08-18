<div align="center">
<img width="120" height="120" alt="logo" src="https://github.com/user-attachments/assets/c894a42f-20ec-4f29-99ea-0984f921ed75" />

#  AtmosBridge

**Federated AI Climate-Intelligence Platform for Hyperlocal & Cross-Border Pollution Detection**

*Hack2Skill × Google Cloud — "Build with AI: Code for Communities" (2nd Edition)*  
**Track 2 — Clean Air & Climate Resilience** · BRICS Sustainability Theme

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite%20(JS%2FJSX)-61DAFB)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-8E75FF)

[Live Prototype](https://atmosbridgeai.vercel.app/) · [Demo Video Script](./docs/demo-script.md) · [Pitch Deck Outline](./docs/pitch-deck.md) · [Submission Checklist](./docs/HACK2SKILL-SUBMISSION-CHECKLIST.md) · [Documentation](./docs)

</div>

---

## 🌟 Executive Summary

Major cities and border regions across the BRICS nations — India, Brazil, Russia, China, South Africa — miss acute, localized pollution events such as illegal industrial emissions, biomass burning, and trans-boundary smog plumes, because conventional monitoring stations report only sparse, macro-level averages.

**AtmosBridge** closes this gap by fusing:

1. **Multimodal citizen reports** — photos, voice transcripts, geo-tagged text
2. **Ground sensor networks** — OpenAQ live telemetry + a dense simulated mesh
3. **Satellite proxy indicators** — Aerosol Optical Depth (AOD) proxies
4. **Meteorological dispersion feeds** — Open-Meteo live wind and humidity data

**Google Gemini** performs multimodal reasoning with grounded function-calling (`get_local_air_quality`, `get_weather`) so it structures reports into actionable incident data rather than inventing readings. A **physics-grounded spike regression engine** (supported by an offline XGBoost training pipeline) forecasts 6h/12h/24h spike risk. Together they surface hyperlocal hotspots, model cross-border atmospheric drift, and route actionable alerts to municipal authorities — with human-in-the-loop governance and zero automated punitive action.

> **2–3 line pitch:** AtmosBridge is a federated, AI-powered climate intelligence platform that fuses citizen-reported pollution sightings, ground sensors, satellite indicators, and weather data to detect hyperlocal pollution hotspots city-level AQI monitors miss. Gemini structures multimodal citizen reports into explainable risk assessments; a prediction layer forecasts spikes and models cross-border smog movement between BRICS regions, routing high-confidence alerts to authorities for rapid, human-approved intervention.

---

## 🚀 The 16-Screen Experience

| # | Screen | Category | Key Capability |
|---|---|---|---|
| 1 | Landing / Mission | Public Portal | Mission overview, BRICS context, rapid report & authority entry points |
| 2 | Citizen Report | Community | Photo upload, location picker, text description, automatic Gemini analysis |
| 3 | Voice Report | Community | Speech capture, real-time multilingual transcript, direct submit |
| 4 | Photo Analysis Result | AI Structuring | Gemini multimodal breakdown — event type, severity, confidence, visual cues |
| 5 | Local Air Intelligence | Community | Local AQI, health advice, N95 advisory, WHO comparison, safety tips |
| 6 | Global / BRICS Map | Geospatial Core | Multi-layer map — AQI, hotspots, sensors, wind vectors, trans-boundary plumes |
| 7 | Hotspot Explorer | Intelligence | Filterable active-hotspot catalog with severity badges and trend indicators |
| 8 | Event Details | Intelligence | Citizen sightings, sensor clusters, meteorological context in one dossier |
| 9 | Prediction Timeline | Forecasting | 6h/12h/24h spike forecast timeline with confidence bands and feature importance |
| 10 | Authority Dashboard | Governance | Real-time alert triage queue, affected-population estimates, status |
| 11 | Alert Details & Triage | Governance | Full incident dossier, recommended interventions, Acknowledge/Escalate |
| 12 | Cross-Border Intelligence | Regional | Trans-boundary drift model, source/target region cards, bilateral advisory |
| 13 | Analytics & Trends | Public Health | Historical trend comparison across BRICS hubs, pollutant breakdown, CSV export |
| 14 | Data Sources & Provenance | Transparency | Provenance registry — Observed / Inferred / Predicted / Simulated |
| 15 | Settings & Localization | Accessibility | Language switch (English, हिन्दी, বাংলা), preferences, demo reset |
| 16 | About & Responsible AI | Compliance | Responsible-AI principles, non-diagnostic disclaimer, audit architecture |

---

## 🏗️ Architecture & Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite — **pure JavaScript/JSX, no TypeScript** — Tailwind CSS, Recharts |
| Maps | Google Maps JavaScript API, with an SVG/vector fallback if no key is configured |
| Backend | Python 3.10+, FastAPI, Pydantic v2, Uvicorn |
| AI / Multimodal | Google Gemini API (gemini-2.5-flash / gemini-2.0-flash / gemini-1.5-flash), with deterministic demo fallback |
| Prediction | Physics-Grounded Atmospheric Dispersion & Regression Engine (offline XGBoost regressor script) |
| Live Data | OpenAQ (air quality), Open-Meteo (weather) |
| Simulated Data | Seeded dense sensor mesh + satellite aerosol proxy dataset, clearly labeled in-app |
| Deployment | Vercel (frontend SPA & serverless API) / Google Cloud Run (containerized backend ready) |

Full design rationale lives in [`docs/architecture.md`](./docs/architecture.md) and [`docs/design.md`](./docs/design.md).

---

## 🛠️ Quickstart

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Backend
```bash
cd backend
pip install -r requirements.txt

# Seed synthetic/historical datasets and train the prediction model
python ../scripts/seed_data.py
python ../scripts/train_model.py

uvicorn main:app --reload --port 8000
```
Swagger docs live at `http://localhost:8000/docs`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

---

## 📦 Environment Variables

Copy the safe template before running anything:
```bash
cp .env.example .env
```

| Variable | Required | Side | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes, for live AI features | Server-only | Google AI Studio key — never sent to the browser |
| `VITE_GOOGLE_MAPS_API_KEY` | No — SVG fallback activates | Client (HTTP-referrer restricted) | Google Maps JS API key |
| `OPENAQ_API_KEY` | No | Server-only | OpenAQ v2 API key |
| `FIREBASE_PROJECT_ID` | No | Server-only | Firebase project for cloud deployment |
| `FIREBASE_STORAGE_BUCKET` | No | Server-only | Firebase storage bucket |
| `PORT` / `HOST` / `ENVIRONMENT` | No | Server-only | Local dev server config |

```ini
GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_maps_key_here
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development
```

---

## 🔐 Security

- **Secrets via environment variables only.** All API keys are supplied through `.env`, never hardcoded.
- **Git exclusion.** `.env` and all credential files (`*.key`, `*.pem`, `service-account*.json`) are excluded via `.gitignore` and must never be committed.
- **Server-side isolation.** Backend keys (`GEMINI_API_KEY`, etc.) are used exclusively by FastAPI and never reach the React bundle. The client-side Maps key is a separate, HTTP-referrer-restricted key.
- **Pre-commit protection.** A pre-commit hook scans staged files for accidental credential patterns; run `python scripts/security_check.py` any time to audit the working tree.

> [!WARNING]
> Never paste real API keys into `.env.example`, this README, source code, or any tracked file.

---

## 🛡️ Responsible AI & Data Provenance

Every numeric environmental figure in AtmosBridge carries an explicit provenance tag:

- **`Observed`** — directly ingested from live stations (OpenAQ, Open-Meteo)
- **`Inferred`** — structured by Gemini multimodal analysis from citizen submissions
- **`Predicted`** — forecast by the physics-grounded regression model
- **`Simulated`** — seeded synthetic sensor grids and cross-border scenarios, clearly labeled

Human-in-the-loop oversight is mandatory: authorities review and manually acknowledge every alert before any action is taken. No automated regulatory enforcement occurs, and the platform never issues a medical diagnosis — only general public-health guidance. See [`docs/prd.md`](./docs/prd.md) §13 for the full Responsible AI statement.

---

## ⚠️ Known Limitations & Truthfulness

- Satellite data is a seeded proxy, not a live Earth Engine feed (documented ingestion path for a production swap is in [`docs/architecture.md`](./docs/architecture.md)).
- Sensor grid density is simulated to be realistic, not sourced from a live third-party network.
- Cross-border pollution intelligence uses one seeded demo scenario rather than live inter-country data sharing.
- Authority roles are demo-based and not tied to real municipal identity systems.

Full details on project scope & limitations: [`docs/limitations.md`](./docs/limitations.md). Responsible AI statement: [`docs/responsible-ai.md`](./docs/responsible-ai.md). Final submission checklist: [`docs/HACK2SKILL-SUBMISSION-CHECKLIST.md`](./docs/HACK2SKILL-SUBMISSION-CHECKLIST.md).

---

## 📁 Repository Structure

```
atmosbridge/
  LICENSE
  README.md
  .env.example
  .gitignore
  vercel.json
  Dockerfile
  api/          Vercel serverless entrypoint
  backend/      FastAPI application (routers/ services/ models/)
  frontend/     React + Vite SPA
  scripts/      seed_data.py  train_model.py  security_check.py  pre_commit_check.py
  screenshots/  UI screenshot directory & capture guide
  docs/         PRD, architecture, API reference, pitch deck, demo script, submission checklist
```

---

## 📄 License

Built for the Hack2Skill × Google Cloud "Build with AI: Code for Communities" Hackathon 2026.  
Open-source under the **Apache 2.0 License**. See [LICENSE](./LICENSE) for the full text.

---

## 👤 Author & Contributor

**Arup Das** (Lead Author)  
B.Tech CSE (AI/ML), Brainware University, Kolkata  
- GitHub: [@arupdas0825](https://github.com/arupdas0825)  
- Portfolio: [arup-portfolio-seven.vercel.app](https://arup-portfolio-seven.vercel.app)  
- Email: dasarup0804@gmail.com

**Aditya Bar** (Contributor)  
B.Tech CSE (AI/ML), Brainware University, Kolkata  
