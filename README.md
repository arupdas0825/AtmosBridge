<div align="center">
<img width="120" height="120" alt="logo" src="https://github.com/user-attachments/assets/c894a42f-20ec-4f29-99ea-0984f921ed75" />

# AtmosBridge

**Federated AI Climate-Intelligence Platform for Hyperlocal & Cross-Border Pollution Detection**

*Hack2Skill × Google Cloud — "Build with AI: Code for Communities" (2nd Edition)*
**Track 2 — Clean Air & Climate Resilience** · BRICS Sustainability Theme

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite%20(JS%2FJSX)-61DAFB)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-8E75FF)

[Live Prototype](https://atmosbridgeai.vercel.app/) · [Submission Checklist](./docs/HACK2SKILL-SUBMISSION-CHECKLIST.md) · [Documentation](./docs)

</div>

---

## 🌟 Executive Summary

Major cities and border regions across the BRICS nations — India, Brazil, Russia, China, South Africa — miss acute, localized pollution events such as illegal industrial emissions, biomass burning, and trans-boundary smog plumes, because conventional monitoring stations report only sparse, macro-level averages.

**AtmosBridge** closes this gap by fusing:

1. **Multimodal citizen reports** — photos, voice transcripts, geo-tagged text
2. **Ground sensor networks** — OpenAQ live telemetry + a dense simulated mesh
3. **Satellite proxy indicators** — Aerosol Optical Depth (AOD) proxies
4. **Meteorological dispersion feeds** — Open-Meteo live wind and humidity data

**Google Gemini** performs multimodal reasoning to structure citizen sightings into actionable incident data rather than inventing readings. A **physics-grounded atmospheric risk predictor** (ventilation, boundary-layer inversion, and stagnation modeling) forecasts 6h/12h/24h spike risk. Together they surface hyperlocal hotspots, model cross-border atmospheric drift, and route actionable alerts to municipal authorities — with human-in-the-loop governance and zero automated punitive action.

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
| 15 | Settings & Localization | Accessibility | Language switch (English, हिन्दी, Português, Русский, 中文), preferences |
| 16 | About & Responsible AI | Compliance | Responsible-AI principles, non-diagnostic disclaimer, audit architecture |

---

## 🏗️ Architecture & Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite — **pure JavaScript/JSX, no TypeScript** — Tailwind CSS, Recharts |
| Maps | Leaflet + OpenStreetMap & CARTO Dark Matter cartographic tiles |
| Backend | Python 3.10+, FastAPI, Pydantic v2, Uvicorn |
| AI / Multimodal | Google Gemini API (`gemini-2.5-flash` / `gemini-2.0-flash` / `gemini-1.5-flash`), with a deterministic demo-mode fallback |
| Prediction | Physics-grounded atmospheric risk predictor (ventilation, boundary-layer inversion, stagnation modeling) |
| Live data | OpenAQ (air quality), Open-Meteo (weather) |
| Simulated data | Seeded dense sensor mesh + satellite aerosol proxy dataset, clearly labeled in-app |
| Deployment | Vercel (frontend SPA + Python serverless API via `api/index.py`) / Google Cloud Run (containerized backend, `Dockerfile` included) |

Full design rationale lives in [`docs/architecture.md`](./docs/architecture.md) and [`docs/design.md`](./docs/design.md).

> **Note:** `scripts/train_model.py` also exports an XGBoost regressor to `backend/models/spike_predictor.json` as an exploratory/benchmark artifact. The live prediction endpoint currently serves the physics-grounded model described above, not this trained file — see [Known Limitations](#️-known-limitations--truthfulness).

---

## 🛠️ Quickstart

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Backend
```bash
cd backend
pip install -r requirements.txt

# Seed synthetic/historical datasets
python ../scripts/seed_data.py

# Optional: train the exploratory XGBoost model (not used by the live API — see note above)
# Requires extra packages not in requirements.txt:
pip install numpy pandas scikit-learn xgboost
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

### One-command build (root)
```bash
npm run build   # runs frontend install + build, per root package.json
```

---

## 📦 Environment Variables

Copy the safe template before running anything:
```bash
cp .env.example .env
```

| Variable | Required | Side | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes, for live AI features | Server-only | Google AI Studio key — never sent to the browser |
| `OPENAQ_API_KEY` | No | Server-only | OpenAQ v2 API key (optional) |
| `ALLOWED_ORIGINS` | No | Server-only | Allowed CORS origins for production |
| `PORT` / `HOST` / `ENVIRONMENT` | No | Server-only | Local dev server config |

```ini
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development
ALLOWED_ORIGINS=https://atmosbridgeai.vercel.app,http://localhost:5173
```

If `GEMINI_API_KEY` is unset, the backend serves deterministic **demo-mode** responses so the app remains fully demoable offline.

---

## 🔐 Security

- **Secrets via environment variables only.** All API keys are supplied through `.env`, never hardcoded.
- **Git exclusion.** `.env` and all credential files (`*.key`, `*.pem`, `service-account*.json`) are excluded via `.gitignore` and must never be committed.
- **Server-side isolation.** Backend keys (`GEMINI_API_KEY`, etc.) are used exclusively by FastAPI and never reach the React bundle.
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

Human-in-the-loop oversight is mandatory: authorities review and manually acknowledge every alert before any action is taken. No automated regulatory enforcement occurs, and the platform never issues a medical diagnosis — only general public-health guidance. See [`docs/prd.md`](./docs/prd.md) §13 and [`docs/responsible-ai.md`](./docs/responsible-ai.md) for the full Responsible AI statement.

---

## ⚠️ Known Limitations & Truthfulness

- Satellite data is a seeded proxy, not a live Earth Engine feed (documented ingestion path for a production swap is in [`docs/architecture.md`](./docs/architecture.md)).
- Sensor grid density is simulated to be realistic, not sourced from a live third-party network.
- Cross-border pollution intelligence uses one seeded demo scenario rather than live inter-country data sharing.
- Authority roles are demo-based and not tied to real municipal identity systems.
- `scripts/train_model.py` exports an XGBoost model that is **not currently loaded by the live `/api/predict` endpoint** — the API serves the physics-grounded predictor instead. Treat the trained model as an exploratory artifact until it's wired in.
- Running `scripts/train_model.py` requires `numpy`, `pandas`, `scikit-learn`, and `xgboost`, which are **not listed in `requirements.txt`** — install them separately (see Quickstart).

Full details on project scope & limitations: [`docs/limitations.md`](./docs/limitations.md). Final submission checklist: [`docs/HACK2SKILL-SUBMISSION-CHECKLIST.md`](./docs/HACK2SKILL-SUBMISSION-CHECKLIST.md).

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
  package.json          Root build script (delegates to frontend/)
  requirements.txt      Root copy of backend dependencies
  api/                  Vercel serverless entrypoint (api/index.py)
  backend/              FastAPI application (routers/ services/ models/ data/)
  frontend/             React + Vite SPA (pure JS/JSX, Tailwind CSS, Recharts)
  screenshots/          Presentation screenshots catalog guide
  scripts/              seed_data.py  train_model.py  security_check.py  pre_commit_check.py
  tests/                test_all_endpoints.py  test_e2e_flow.py
  docs/                 PRD, architecture, design, API reference, data sources,
                        limitations, responsible AI, pitch deck, demo script, submission checklist
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
- Email: arupworks.at@gmail.com

**Aditya Bar** (Contributor)
B.Tech CSE (AI/ML), Brainware University, Kolkata
- GitHub: [@adityabar07](https://github.com/adityabar07)
