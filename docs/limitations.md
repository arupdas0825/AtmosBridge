# AtmosBridge — Known Limitations & Assumptions

In accordance with the project's **Honesty Over Polish** principle (see [`docs/responsible-ai.md`](./responsible-ai.md)), this document records architectural boundaries, prototype assumptions, and future enhancements.

---

## 1. Data Ingestion & Satellites
- **Satellite Data**: Live Google Earth Engine ingestion pipelines require high-throughput quotas and asynchronous Earth Observation workers. For the hackathon MVP, satellite aerosol optical depth (AOD) is modeled using realistic Sentinel-5P/MODIS proxy distributions, clearly labeled as `Simulated`.
- **Micro-Sensor Density**: While live readings for major monitoring stations are ingested from OpenAQ, ultra-dense neighborhood micro-sensor nodes (within 500m radius) are seeded from realistic spatial distributions.

---

## 2. Cross-Border Federation
- **Federated Architecture Simulation**: In production, each BRICS nation hosts a sovereign local instance communicating across a shared OGC-compliant federation protocol. The hackathon prototype demonstrates this using partitioned country views (`India`, `Brazil`, `Russia`, `China`, `South Africa`) within a unified cloud deployment.
- **Cross-Border Plumes**: The agricultural and industrial trans-boundary drift scenarios (e.g., Punjab–Lahore corridor, Amazon basin biomass drift) are deterministic simulation scenarios backed by live meteorological wind vector physics.

---

## 3. Machine Learning & Forecasting
- **Spike Predictor**: The 6h/12h/24h forecasting engine utilizes a physics-grounded atmospheric dispersion regressor evaluating boundary layer ventilation, thermal inversion, and citizen sighting velocity.
- **Local Micro-Meteorology**: Complex urban canyon effects and building wake turbulence are simplified to macro wind-vector and boundary-layer physics.

---

## 4. Voice & Speech Recognition
- **Speech-to-Text**: Voice reporting leverages browser Web Speech API with fallback to cloud endpoints and immediate text-input fallback if the user's browser microphone permissions are denied.
