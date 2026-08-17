# AtmosBridge — Product Requirements Document

**Hackathon:** Hack2Skill × Google Cloud — Build with AI: Code for Communities (2nd Edition)
**Track:** Track 2 — Clean Air & Climate Resilience | **BRICS Theme:** Sustainability

---

## 0. Project Name

Candidates considered:

1. **AtmosBridge** — recommended
2. AeroLink BRICS
3. SentinelAir
4. TerraPulse
5. CleanHorizon Network
6. AirGrid Alliance
7. EcoSentinel
8. PulseAtmos
9. SkyWatch Commons
10. AirBridge Collective

**Recommended name: AtmosBridge** — "bridge" captures the cross-border coordination mandate, "Atmos" is globally legible without translation, and the name reads as public infrastructure rather than a consumer app. Used throughout this documentation set.

**2–3 line solution description:**
AtmosBridge is a federated, AI-powered climate intelligence platform that fuses citizen-reported pollution sightings, ground sensors, satellite indicators, and weather data to detect hyperlocal pollution hotspots that city-level AQI monitors miss. Gemini analyzes multimodal citizen reports and generates explainable risk assessments; a lightweight prediction layer forecasts spikes and models cross-border smog movement between BRICS regions, routing high-confidence alerts to municipal authorities for rapid, human-approved intervention.

---

## 1. Problem Analysis

- **Actual problem:** City-wide AQI averages hide localized, acute pollution events (a burning field, an unpermitted industrial discharge, a smog plume drifting across a border) until they've already harmed people. There is no shared, real-time layer that lets citizens report what they see and lets authorities act on it before it becomes a city-wide reading.
- **Who experiences it:** Residents near industrial corridors, agricultural burning zones, and border regions; vulnerable groups (children, elderly, respiratory patients).
- **Who operates the platform:** Municipal/environmental agencies, and — at BRICS scale — a coordination body of cross-border liaisons.
- **Who consumes the output:** Authorities (action), analysts (trend/policy), citizens (safety guidance), cross-border coordinators (joint response).
- **Where AI adds genuine value:** Turning unstructured citizen input (photo + voice + text) into structured, verifiable event data; explaining *why* a hotspot is risky in plain language; forecasting short-horizon spikes from tabular data Gemini does not invent.
- **Realistic hackathon scope:** A working citizen-report → Gemini analysis → hotspot map → prediction → authority alert loop, using real public AQI/weather data plus clearly labeled simulated sensor/satellite data and a simulated cross-border scenario.
- **Simulated vs. live:** Live — OpenAQ current readings, weather via a public API. Simulated/seeded — dense sensor grids, satellite-derived indicators, historical BRICS cross-border events (clearly labeled "Demo Data" in the UI).

---

## 2. Product Vision

AtmosBridge is **not** an AQI dashboard. Its differentiator is surfacing what conventional monitoring misses:

`Citizen Reports + Sensors + Satellite + Weather + History → Gemini Structuring → Hotspot Intelligence → Forecasting → Cross-Border Risk → Authority Alerts → Recommended Action`

---

## 3. Personas

**A. Citizen** — reports pollution via photo/voice/text, picks location on map, sees local risk and safety guidance in their language.

**B. Municipal/Environmental Authority** — monitors a live hotspot queue, opens an alert to see evidence + AI explanation + predicted movement, acknowledges/escalates, and logs the action taken.

**C. Climate/Public Health Analyst** — reviews historical trends, compares regions, inspects which data source drove a prediction, exports a CSV/summary.

**D. Cross-Border BRICS Coordinator** — compares hotspots across country panels, views a trans-boundary movement forecast, and shares an alert with a counterpart authority.

---

## 4. Hero User Journey (demo spine)

Citizen sees smoke → opens app → picks language → voice/text report ("Large smoke plume near the industrial area") → uploads photo → shares location → **Gemini multimodal analysis** extracts event type, severity, confidence, source category → backend fuses this with local AQI + weather + simulated satellite/historical data → risk engine computes hotspot score, spike probability, cross-border risk, affected-population estimate → **HIGH-RISK ALERT** appears on the Authority Dashboard → authority opens it, sees map + evidence + AI explanation + predicted plume movement + recommended intervention → acknowledges/escalates → response is logged.

This exact flow is the required 3–5 minute demo path (see `implementation-plan.md` §Demo Script).

---

## 5. AI Requirements (Google AI)

**A. Multimodal report analysis (Gemini)** — input: citizen photo + text (+ voice transcript). Output — strict JSON:
```json
{
  "event_type": "industrial_smoke | agricultural_burning | vehicular | dust | unknown",
  "pollution_source": "string",
  "severity": 0,
  "confidence": 0.0,
  "visual_evidence": ["smoke plume", "haze density"],
  "recommended_verification": ["dispatch inspector", "cross-check nearest sensor"]
}
```
**B.** Natural-language incident summarization for the authority dashboard.
**C.** Multilingual translation (report text + generated guidance).
**D.** AI-generated authority recommendations (plain-language next steps).
**E.** Explainable risk reasoning — every risk score ships with a one-paragraph "why," citing which inputs (sensor/weather/historical/report) drove it.
**F.** Function/tool calling — Gemini calls a `get_local_air_quality(lat, lon)` and `get_weather(lat, lon)` tool rather than guessing values.
**G.** Structured JSON output enforced via response schema so the backend never has to regex-parse prose.

**Hard rule:** Gemini never invents a sensor reading or satellite value. Every numeric environmental figure in the UI carries a provenance tag: `observed`, `inferred`, `predicted`, or `simulated`.

---

## 6. Prediction Layer

Inputs: recent AQI history, temperature, humidity, wind speed/direction, hotspot/event history.
Model: **gradient-boosted regression (XGBoost/LightGBM)** trained on public historical AQI + weather data, or a documented rule-weighted heuristic as fallback if training data is thin. Outputs: 6h/12h/24h spike-risk probability, shown with a confidence band and explicit "predicted, not measured" label. No black-box unexplained numbers — a feature-importance summary is always available.

---

## 7. Cross-Border BRICS Design

Country/region selector spans India, Brazil, Russia, China, South Africa. Demo scenario: a hotspot near a source region + prevailing wind data → "Potential trans-boundary pollution event" card showing source region, direction, estimated arrival window, confidence, affected region, recommended response — explicitly labeled as a **prediction**, not an official cross-border measurement.

---

## 8. Geospatial Experience

Google Maps Platform map with togglable layers (AQI/risk, citizen reports, sensors, hotspots, predicted movement, industrial/agricultural zones, wind vectors, admin boundaries); click-to-inspect hotspot; filters by pollutant/severity/time; country selector; timeline playback. Layer count is capped in the default view to avoid clutter — advanced layers live behind a "More layers" panel.

---

## 9. Satellite / Earth Observation

Google Earth Engine integration is evaluated but **not required for MVP** given hackathon time constraints. MVP uses a prepared, realistic satellite-derived indicator dataset (aerosol index proxy) clearly labeled "simulated satellite data — see Data Sources." `architecture.md` documents exactly how a live Earth Engine ingestion pipeline would replace it.

---

## 10. Data Strategy

| Dataset | Source | Type | MVP Required |
|---|---|---|---|
| Live AQI readings | OpenAQ API | Live | Yes |
| Weather (temp/humidity/wind) | Open-Meteo API | Live | Yes |
| Historical AQI | OpenAQ / government portals | Public historical | Yes |
| Sensor grid (dense) | Seeded, realistic distribution | Simulated | Yes |
| Satellite aerosol proxy | Seeded, Sentinel/MODIS-style values | Simulated | Yes |
| Citizen reports | User-submitted + seed demo reports | Live + Simulated | Yes |
| Cross-border event history | Seeded scenario | Simulated | Yes |

All simulated data is generated once at seed time and stored in Firestore, never fabricated at request time.

---

## 11. Multilingual + Voice

MVP: English, Hindi, Bengali (UI + Gemini output), architected for easy addition of Portuguese, Russian, Mandarin. Voice flow: mic capture → Speech-to-Text → language detection → Gemini analysis → localized structured response → optional Text-to-Speech readback of safety guidance.

---

## 12. MVP vs. Future

**MUST HAVE:** citizen text+photo report, Gemini structured analysis, hotspot map, authority dashboard + alert detail, basic 6h prediction, one cross-border demo scenario, EN/HI language toggle.
**SHOULD HAVE:** voice input, Bengali, analyst view, timeline playback.
**NICE TO HAVE:** live Earth Engine ingestion, TTS readback, export/report generation.
**FUTURE:** real authority accounts per country, verified sensor partnerships, production-grade cross-border data-sharing agreements, automated intervention workflows.

---

## 13. Responsible AI

Every AI-derived figure is labeled `observed / inferred / predicted / simulated`. Confidence scores shown alongside all Gemini outputs and predictions. Authorities always acknowledge manually — **no automated enforcement action**. No medical diagnosis is ever generated; only general public-health guidance. Citizen submissions are stored with minimal PII (no account required for reporting); photos are not used for facial recognition. Gemini outputs are schema-validated to reduce hallucination risk, and any field the model can't ground in tool data is returned as `null` rather than guessed.
