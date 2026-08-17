# AtmosBridge

**Federated AI Climate-Intelligence Platform for Hyperlocal and Cross-Border Pollution Detection**

*Hack2Skill × Google Cloud — Build with AI: Code for Communities (Track 2: Clean Air & Climate Resilience, BRICS Sustainability Theme)*

---

## 🌟 Executive Summary

Major cities and border regions across the BRICS nations (India, Brazil, Russia, China, South Africa) miss acute, localized pollution events—such as illegal industrial emissions, biomass burning, and trans-boundary smog plumes—because conventional monitoring stations provide only sparse, macro-level averages.

**AtmosBridge** closes this critical gap by fusing:
1. **Multimodal Citizen Reports** (photos, audio transcripts, geo-tagged text)
2. **Ground Sensor Networks** (OpenAQ live telemetry + dense simulated mesh)
3. **Satellite Proxy Indicators** (Aerosol Optical Depth proxies)
4. **Meteorological Dispersion Feeds** (Open-Meteo live wind and humidity data)

Using **Google Gemini** for multimodal reasoning and automated tool-calling (`get_local_air_quality`, `get_weather`), and an **XGBoost Regressor** for 6h/12h/24h spike prediction, AtmosBridge surfaces high-risk hotspots, models cross-border atmospheric drift, and routes actionable intelligence to municipal authorities with zero automated punitive action (human-in-the-loop governance).

---

## 🚀 Key Features & The 16-Screen Experience

| Screen | Category | Key Capability |
|---|---|---|
| **1. Landing / Mission** | Public Portal | Mission overview, BRICS context, rapid citizen report & authority entrypoints |
| **2. Citizen Report** | Community | Photo upload, location picker, text description, automatic Gemini analysis |
| **3. Voice Report** | Community | Web Speech audio capture, real-time multilingual transcript, direct submit |
| **4. Photo Analysis Result** | AI Structuring | Gemini multimodal breakdown: event type, severity (1-4), confidence, visual cues |
| **5. Local Air Intelligence** | Community | Local AQI, health advice, N95 advisory, WHO comparison, localized safety tips |
| **6. Global / BRICS Map** | Geospatial Core | Multi-layer map (AQI, hotspots, sensors, wind vectors, trans-boundary plumes) |
| **7. Hotspot Explorer** | Intelligence | Filterable active hotspot catalog with severity badges, trend indicators |
| **8. Event Details** | Intelligence | Deep dive into citizen sightings, sensor clusters, meteorological context |
| **9. Prediction Timeline** | Forecasting | 6h/12h/24h XGBoost spike forecast, confidence bands, feature-importance breakdown |
| **10. Authority Dashboard** | Governance | Real-time alert triage queue, affected population estimates, status management |
| **11. Alert Details & Triage** | Governance | Full incident dossier, recommended intervention protocols, Acknowledge/Escalate |
| **12. Cross-Border Intelligence** | Regional | Trans-boundary drift model, source/target region cards, bilateral advisory action |
| **13. Analytics & Trends** | Public Health | Historical trend comparison across BRICS hubs, pollutant breakdown, CSV export |
| **14. Data Sources & Provenance** | Transparency | Provenance registry (`Observed`, `Inferred`, `Predicted`, `Simulated`) |
| **15. Settings & Localization** | Accessibility | Language switch (English, हिन्दी, বাংলা), theme preferences, demo reset |
| **16. About & Responsible AI** | Compliance | Google Responsible AI principles, non-diagnostic disclaimer, audit architecture |

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18 + Vite (Pure JavaScript / JSX — no TypeScript), Tailwind CSS, Recharts, Google Maps JavaScript API with built-in interactive Leaflet / Vector fallback.
- **Backend**: Python 3.10+ with FastAPI, Pydantic v2, Uvicorn, Requests.
- **AI / Multimodal**: Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash` / `gemini-pro`) with Function Calling tools for live environmental data grounding + deterministic Demo-Mode fallback.
- **Machine Learning**: XGBoost / Gradient-Boosted Regressor for 6h/12h/24h atmospheric spike prediction.
- **Data Layers**: OpenAQ API (live air quality), Open-Meteo API (live meteorology), seeded synthetic dense sensor grid and satellite aerosol proxy datasets.
- **Deployment**: Google Cloud Run (Containerized Backend) + Vercel (Frontend).

---

## 🛠️ Quickstart & Local Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Seed initial synthetic and historical datasets
python ../scripts/seed_data.py
python ../scripts/train_model.py

# Launch FastAPI server
uvicorn main:app --reload --port 8000
```
Backend Swagger API docs will be live at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📦 Environment Variables & Security

### Security Policy
- **Secrets via Environment Variables**: All API keys (Gemini, Google Maps, Firebase, etc.) must be supplied strictly via environment variables or a local `.env` file.
- **Git Exclusion**: `.env` and all credential files (`*.key`, `*.pem`, `service-account*.json`) are strictly excluded via `.gitignore` and **must never be committed to Git**.
- **Server-Side Isolation**: Backend keys (`GEMINI_API_KEY`, etc.) are processed exclusively on the FastAPI server and are never exposed or passed to the React client bundle.
- **Sanitized Template**: Refer to `.env.example` for all required and optional configuration keys with safe empty placeholders.

Copy `.env.example` to `.env` to configure your environment:
```bash
cp .env.example .env
```

```ini
# Server-side Gemini API key (optional for demo fallback)
GEMINI_API_KEY=your_gemini_api_key_here

# Client-side Google Maps API key (optional - interactive SVG vector fallback activates automatically)
VITE_GOOGLE_MAPS_API_KEY=your_maps_key_here

# Host and Port
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development
```

---

## 🛡️ Responsible AI & Provenance

Every numeric environmental figure rendered in AtmosBridge carries an explicit provenance tag:
- **`[Observed]`**: Directly ingested from live stations (OpenAQ, Open-Meteo).
- **`[Inferred]`**: Structured by Gemini multimodal analysis from citizen submissions.
- **`[Predicted]`**: Forecasted by XGBoost regression models.
- **`[Simulated]`**: Benchmarked synthetic sensor grids and cross-border scenarios.

Human-in-the-loop oversight is mandatory: authorities must review and manually acknowledge alerts before any operational dispatch. No automated regulatory enforcement occurs.

---

## 📄 License & Attribution
Built for the Hack2Skill × Google Cloud "Build with AI: Code for Communities" Hackathon 2026.
Open-source under the Apache 2.0 License.

---

## 🔐 Security

**All secrets must be supplied through environment variables. Never commit real credentials to Git.**

| Variable | Required | Side | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes (for AI features) | **Server-only** | Google AI Studio key — must never reach the browser |
| `VITE_GOOGLE_MAPS_API_KEY` | No (SVG fallback activates) | Client (HTTP-referrer restricted) | Google Maps JS API key |
| `OPENAQ_API_KEY` | No | Server-only | OpenAQ v2 API key |
| `FIREBASE_PROJECT_ID` | No | Server-only | Firebase project for cloud deployment |
| `FIREBASE_STORAGE_BUCKET` | No | Server-only | Firebase storage bucket |

### Setup
```bash
# Copy the safe template — NEVER copy real values into .env.example
cp .env.example .env
# Edit .env with your own credentials (this file is git-ignored)
```

> [!WARNING]
> `.env` is excluded from Git via `.gitignore`. **Do not** remove or bypass this rule. Never paste real API keys into `.env.example`, `README.md`, source code, or any tracked file.

> [!NOTE]
> The pre-commit hook in `.git/hooks/pre-commit` will scan staged files for accidental credential patterns and block the commit if any are found. Run `python scripts/security_check.py` at any time to audit the full working tree.
