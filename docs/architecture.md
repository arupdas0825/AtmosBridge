# AtmosBridge — Architecture

## 1. Stack

- **Frontend:** React 18 + Vite + **JavaScript (JSX, no TypeScript)**, Tailwind CSS, Recharts, Leaflet + CARTO Tiles
- **Backend:** Python 3.10+ + FastAPI, Pydantic v2, Uvicorn
- **AI:** Google Gemini API (gemini-2.5-flash / gemini-2.0-flash / gemini-1.5-flash), multimodal structured output with schema validation and deterministic fallback
- **Database / Storage:** JSON/File-backed storage service with serverless `/tmp` ephemeral persistence on Vercel and local caching
- **Maps:** Leaflet + OpenStreetMap & CARTO Dark Matter Cartographic Tiles
- **Live Data:** OpenAQ (air quality), Open-Meteo (meteorological wind vectors)
- **Deployment:** Vercel (frontend SPA & serverless API) / Google Cloud Run container-ready

Rationale: this stack maximizes performance, reliability, and judging readiness while keeping deployment fully automated and self-contained.

## 2. High-Level System Diagram (described)

```
[Citizen Web App] --report(text/photo/voice)--> [FastAPI /api/reports]
                                                        |
                                                        v
                                          [Gemini multimodal analysis]
                                          (structured vision + schema validation)
                                                        |
                                                        v
                                      [Risk Engine: hotspot score, spike
                                       probability (Physics-Grounded Predictor),
                                       cross-border transport model]
                                                        |
                          -------------------------------------------------
                          |                       |                       |
                          v                       v                       v
                   [Storage: reports/      [Alerts queue]         [Public Map API]
                    hotspots/alerts]              |
                                                   v
                                       [Authority Dashboard (React)]
                                       ack / dispatch / escalate action
```

## 3. Backend Modules (FastAPI)

- `routers/reports.py` — POST citizen report (text/photo/voice ref), GET report by id
- `routers/analysis.py` — calls Gemini service, returns structured event JSON
- `routers/hotspots.py` — query hotspots by country/severity
- `routers/predict.py` — 6h/12h/24h risk endpoint (wraps physics-grounded model)
- `routers/crossborder.py` — trans-boundary scenario endpoint
- `routers/alerts.py` — authority queue, acknowledge/dispatch/escalate
- `services/gemini_service.py` — prompt templates, JSON schema validation, retry/fallback logic
- `services/data_service.py` — OpenAQ + Open-Meteo clients with caching; seeded sensor/satellite loader
- `services/risk_engine.py` — combines Gemini output + live/simulated data into hotspot & spike scores
- `services/model.py` — physics-grounded atmospheric risk predictor; exposes `predict(features) -> {6h, 12h, 24h}`
- `models/schemas.py` — Pydantic models mirroring the Gemini JSON schema and API contracts

## 4. Frontend Structure (React, JS/JSX)

```
src/
  App.jsx
  pages/
    Landing.jsx
    CitizenReport.jsx
    VoiceReport.jsx
    LocalIntelligence.jsx
    GlobalMap.jsx
    HotspotExplorer.jsx
    EventDetails.jsx
    PredictionTimeline.jsx
    AuthorityDashboard.jsx
    AlertDetails.jsx
    CrossBorderIntelligence.jsx
    Analytics.jsx
    DataSources.jsx
    Settings.jsx
    About.jsx
  components/
    map/ (MapView, LayerToggle, HotspotMarker, WindOverlay)
    report/ (PhotoUpload, VoiceRecorder, LocationPicker, SeverityBadge)
    alerts/ (AlertCard, AlertQueue, ProvenanceTag)
    charts/ (RiskTimelineChart, TrendChart)
    common/ (Navbar, LanguageSwitcher, EmptyState, ErrorState, Loader)
  lib/
    api.js (fetch wrappers)
    i18n.js (EN/HI/BN strings)
  state/ (React context for language, selected country/region)
```

## 5. Data Flow: Hero Journey

1. `CitizenReport.jsx` collects text/photo/voice → `POST /reports`.
2. Backend uploads photo to Firebase Storage, calls `gemini_service.analyze_report()` with photo URL + text; Gemini function-calls `get_local_air_quality` / `get_weather` tools (backend-executed) before returning structured JSON.
3. `risk_engine.py` merges Gemini output with live AQI/weather + seeded sensor/satellite/history to compute `hotspot_score`, `spike_probability`, `cross_border_risk`, `affected_population_estimate`.
4. Record written to Firestore `hotspots` + `alerts` (if above threshold).
5. `AuthorityDashboard.jsx` polls/subscribes to `alerts` (Firestore listener), renders new HIGH-RISK alert.
6. `AlertDetails.jsx` fetches `/alerts/{id}` → map, evidence photo, AI explanation, predicted movement (from `/predict`), recommended action.
7. Authority clicks Acknowledge/Escalate → `PATCH /alerts/{id}` → logged with timestamp + actor.

## 6. Security

- All Gemini/Maps/Speech API keys live server-side in Cloud Run env vars; the frontend Maps key is a **separate, HTTP-referrer-restricted** browser key with billing alerts.
- `.env` files are gitignored; `.env.example` ships with empty placeholders.
- Firebase Security Rules: citizens can create but not read others' raw reports; only authenticated authority/analyst roles can read the alerts collection and write acknowledgements.
- Input validation: photo size capped (e.g., 5MB), MIME-type allowlist, text length capped, rate limiting on `/reports` (per-IP) to prevent abuse.
- Basic audit log collection (`audit_log`) records every alert state change with actor + timestamp.

## 7. Fallback Strategy

| Dependency | Failure mode | Fallback |
|---|---|---|
| Satellite/Earth Engine | unavailable/too complex | prepared seeded satellite-proxy dataset, labeled "simulated" |
| Live sensor API | unavailable | seeded realistic sensor dataset |
| Speech-to-Text | fails | text input remains available |
| Gemini API | fails/quota | cached "demo mode" structured response, clearly banner-labeled |
| Maps API | fails | static image/SVG map fallback with the same hotspot markers |

## 8. Scaling to National/BRICS Deployment

Firestore → managed multi-region deployment per participating country (data residency compliance); shared BigQuery dataset for cross-border model training with country-level access control; each country's authority dashboard federates through a shared `crossborder` API layer rather than a single shared database, so no country needs to hand over raw citizen data to operate the platform — only aggregated hotspot/risk summaries are exchanged. This is documented as the production target; the hackathon prototype simulates it with one shared Firestore project and a country field on every record.
