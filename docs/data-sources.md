# AtmosBridge — Data Sources & Provenance Registry

Every data element consumed, processed, or surfaced by AtmosBridge is governed by explicit provenance tracking. No environmental figure is presented without its origin classification.

## Data Provenance Taxonomies

1. **`Observed`**: Directly ingested from a real-world, verified live monitoring station or telemetry feed (e.g., OpenAQ real-time sensor network, Open-Meteo live weather observation).
2. **`Inferred`**: Derived by algorithmic fusion or AI multimodal analysis from user submissions and contextual environmental parameters (e.g., Gemini visual plume severity assessment).
3. **`Predicted`**: Forecasted into future time horizons by machine learning models or dispersion physics (e.g., XGBoost 6h/12h/24h spike probability, atmospheric wind drift cone).
4. **`Simulated`**: Generated deterministically for demonstration, benchmarking, dense sensor clustering, or cross-border regional scenarios (e.g., satellite aerosol optical depth proxy, seeded industrial corridors).

---

## Data Source Inventory

| Dataset | Provider / Source | Provenance | Protocol / Format | Update Cadence | Purpose |
|---|---|---|---|---|---|
| **Live Air Quality** | [OpenAQ](https://openaq.org/) API v2 | `Observed` | REST / JSON (PM2.5, PM10, NO2, SO2, CO, O3) | Hourly | Ground-truth ambient baseline |
| **Live Meteorological Data** | [Open-Meteo](https://open-meteo.com/) API | `Observed` | REST / JSON (Temp, Humidity, Wind Speed, Wind Dir, Pressure) | Real-time / Hourly | Atmospheric boundary & dispersion conditions |
| **Multimodal Citizen Reports** | Citizen submissions (Photos, Audio, Text) | `Observed` (Input) / `Inferred` (AI Structuring) | Multipart Form / WebRTC Speech Audio / JPEG | Real-time event driven | Hyperlocal sighting discovery |
| **Dense Sensor Mesh** | Seeded micro-sensor grid across BRICS hubs | `Simulated` | In-memory / GeoJSON | 15-minute simulated cycle | Hyperlocal resolution enhancement |
| **Satellite Aerosol Proxy** | Sentinel-5P / MODIS AOD proxy distribution | `Simulated` | Raster grid / GeoJSON | Daily proxy cycle | Regional plume tracking & background haze |
| **Historical Training Corpus** | OpenAQ & CPCB Historical Backfill | `Observed` (Historical) | CSV / SQLite | Static model training | Training XGBoost spike regressor |
| **Trans-Boundary Scenarios** | Regional agricultural and industrial drift models | `Simulated` (Scenario) / `Predicted` (Plume) | GeoJSON vector polygons | Scenario trigger | Cross-border BRICS coordination demonstration |

---

## Live Ingestion & Caching Policy

- External API requests to OpenAQ and Open-Meteo are cached with a **15-minute TTL** using an in-memory cache to prevent rate-limiting and guarantee ultra-fast sub-50ms dashboard responsiveness.
- When an external API is unreachable or rate-limited, the backend automatically transitions to the cached baseline or seeded observation layer without crashing, tagging the payload with `"provenance": "simulated"`.
