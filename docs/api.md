# AtmosBridge — API Documentation

This document defines the REST API endpoints provided by the FastAPI backend (`backend/`).

## Base URL
- Development: `http://localhost:8000/api`
- Production: `https://<cloud-run-service-url>/api`

---

## Endpoints

### 1. Reports

#### `POST /api/reports`
Submit a new citizen pollution report. Accepts multipart form data (text description, optional voice note or transcript, latitude, longitude, address, language, and image file).

- **Request (Multipart Form):**
  - `description` (string, required): Citizen description of the event.
  - `latitude` (float, required): Latitude of event.
  - `longitude` (float, required): Longitude of event.
  - `location_name` (string, optional): Human-readable address/landmark.
  - `language` (string, default "en"): "en", "hi", or "bn".
  - `voice_transcript` (string, optional): Transcript from voice recorder.
  - `photo` (file, optional): JPEG/PNG/WebP image (max 5MB).

- **Response:**
  ```json
  {
    "id": "rep_10283",
    "created_at": "2026-08-17T10:00:00Z",
    "status": "analyzed",
    "description": "Dense black smoke billowing from waste processing area",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "location_name": "Okhla Industrial Area, New Delhi",
    "photo_url": "/static/uploads/smoke.jpg",
    "analysis": {
      "event_type": "industrial_smoke",
      "pollution_source": "Unpermitted tire/waste burning at industrial unit",
      "severity": 4,
      "confidence": 0.92,
      "visual_evidence": ["dense dark plume", "ground-level dispersion", "low ceiling haze"],
      "recommended_verification": ["Dispatch municipal inspector to Block C", "Cross-reference sensor AQI-ND-04"],
      "explanation": "Visual evidence of heavy hydrocarbon burning combined with low wind speed (4 km/h) creates acute localized risk."
    },
    "provenance": {
      "analysis": "inferred",
      "weather": "observed",
      "aqi": "observed"
    }
  }
  ```

#### `GET /api/reports/{id}`
Retrieve a citizen report by ID with its full Gemini analysis and fused environmental data.

#### `GET /api/reports`
List recent reports with optional filtering by `country`, `severity`, or bounding box.

---

### 2. Multimodal Analysis

#### `POST /api/analyze`
Direct analysis endpoint for citizen input through Gemini multimodal function-calling tools.

- **Request Body (JSON or Form):**
  - `text`: Description
  - `image_base64`: Optional base64-encoded image
  - `latitude`: Float
  - `longitude`: Float
  - `language`: String

- **Response:**
  Gemini structured analysis JSON containing `event_type`, `pollution_source`, `severity`, `confidence`, `visual_evidence`, `recommended_verification`, and `explanation`.

---

### 3. Hotspots

#### `GET /api/hotspots`
Get all active pollution hotspots scored by the risk engine across BRICS regions.

- **Query Parameters:**
  - `country` (optional): "India", "Brazil", "Russia", "China", "South Africa"
  - `min_severity` (optional): 1 to 4
  - `time_range` (optional): "6h", "24h", "7d"

- **Response:**
  ```json
  [
    {
      "id": "hotspot_delhi_01",
      "title": "Industrial Waste Plume — Okhla",
      "country": "India",
      "city": "New Delhi",
      "latitude": 28.5355,
      "longitude": 77.2690,
      "severity": 4,
      "risk_score": 88.5,
      "status": "critical",
      "pollutants": {
        "pm25": {"value": 248.0, "unit": "µg/m³", "provenance": "observed"},
        "pm10": {"value": 380.0, "unit": "µg/m³", "provenance": "observed"},
        "no2": {"value": 75.0, "unit": "ppb", "provenance": "simulated"}
      },
      "weather": {
        "temperature": 32.4,
        "humidity": 65,
        "wind_speed": 5.2,
        "wind_direction": 310,
        "provenance": "observed"
      },
      "affected_population_estimate": 45000,
      "cross_border_risk": false,
      "reports_count": 8,
      "last_updated": "2026-08-17T09:45:00Z"
    }
  ]
  ```

#### `GET /api/hotspots/{id}`
Retrieve a single hotspot with its timeline, contributing citizen reports, sensor cluster, and satellite aerosol proxy.

---

### 4. Predictions

#### `GET /api/predict`
Get 6h, 12h, and 24h spike predictions and feature-importance explanations for a geographic point or hotspot.

- **Query Parameters:**
  - `hotspot_id` (optional): ID of hotspot
  - `latitude` (optional): Float
  - `longitude` (optional): Float

- **Response:**
  ```json
  {
    "hotspot_id": "hotspot_delhi_01",
    "forecast": [
      {
        "horizon_hours": 6,
        "timestamp": "2026-08-17T16:00:00Z",
        "predicted_aqi": 340,
        "spike_probability": 0.85,
        "confidence_lower": 310,
        "confidence_upper": 375,
        "provenance": "predicted"
      },
      {
        "horizon_hours": 12,
        "timestamp": "2026-08-17T22:00:00Z",
        "predicted_aqi": 395,
        "spike_probability": 0.91,
        "confidence_lower": 355,
        "confidence_upper": 435,
        "provenance": "predicted"
      },
      {
        "horizon_hours": 24,
        "timestamp": "2026-08-18T10:00:00Z",
        "predicted_aqi": 280,
        "spike_probability": 0.62,
        "confidence_lower": 240,
        "confidence_upper": 320,
        "provenance": "predicted"
      }
    ],
    "feature_importance": [
      {"feature": "Wind Speed & Direction Stagnation", "importance": 0.38, "description": "Low NW wind trapping surface particulates"},
      {"feature": "Recent Citizen Incident Frequency", "importance": 0.29, "description": "8 reports within 90 minutes"},
      {"feature": "Relative Humidity & Night Inversion", "importance": 0.21, "description": "Rising humidity reducing boundary layer"},
      {"feature": "Baseline Sensor Trajectory", "importance": 0.12, "description": "PM2.5 trending +18 µg/m³ per hour"}
    ],
    "model_metadata": {
      "model_type": "Gradient-Boosted Regressor (XGBoost)",
      "training_dataset": "Historical AQI & Meteorological Observations",
      "version": "1.0.0"
    }
  }
  ```

---

### 5. Cross-Border Intelligence

#### `GET /api/crossborder`
Retrieve active trans-boundary pollution scenarios and atmospheric drift models.

- **Query Parameters:**
  - `scenario_id` (optional): ID of specific scenario

- **Response:**
  ```json
  [
    {
      "id": "xb_punjab_lahore_01",
      "title": "Agricultural Crop Residue Drift Corridor",
      "source_region": "Punjab Agricultural Belt (India)",
      "target_region": "Lahore Metropolitan District & Punjab Border (Pakistan / Regional Corridor)",
      "country_source": "India",
      "country_target": "Pakistan / Cross-Border Grid",
      "pollutant_type": "Biomass Smoke (PM2.5 & CO)",
      "wind_vector": {"speed_kmh": 14.5, "bearing_deg": 115, "direction": "ESE"},
      "estimated_arrival_window": "3.5 to 5.0 hours (14:30 – 16:00 UTC)",
      "confidence": 0.88,
      "plume_polygon": [[31.5, 74.3], [31.7, 74.9], [31.2, 75.4], [30.9, 74.8]],
      "recommended_crossborder_action": "Issue bilateral trans-boundary advisory; coordinate localized agricultural fire suppression and trigger clean-air air filtration shelters in border settlements.",
      "provenance": "predicted",
      "status": "active"
    }
  ]
  ```

---

### 6. Authority Alerts

#### `GET /api/alerts`
Get list of authority alerts sorted by urgency and risk score.

- **Query Parameters:**
  - `status` (optional): "pending", "acknowledged", "escalated", "resolved"

- **Response:**
  ```json
  [
    {
      "id": "alt_8812",
      "hotspot_id": "hotspot_delhi_01",
      "title": "Critical Industrial Discharge — Okhla Phase II",
      "severity": "critical",
      "risk_score": 89,
      "status": "pending",
      "created_at": "2026-08-17T09:30:00Z",
      "affected_population": 45000,
      "gemini_summary": "Unpermitted tire/waste combustion confirmed by 4 visual reports and local PM2.5 sensor spike to 248 µg/m³. Severe immediate respiratory hazard for neighboring residential colonies.",
      "recommended_intervention": "1. Dispatch immediate hazardous inspection team to Sector 4.\n2. Issue school recess suspension advisory within 2.5km radius.\n3. Deploy water misting cannons along arterial corridor.",
      "action_log": []
    }
  ]
  ```

#### `PATCH /api/alerts/{id}`
Acknowledge, escalate, or resolve an alert with audit logging.

- **Request Body:**
  ```json
  {
    "action": "acknowledge",
    "actor": "Officer Sharma (Delhi Environmental Pollution Control)",
    "notes": "Inspection team 04 dispatched. Notice issued to factory unit."
  }
  ```

- **Response:** Updated alert object with appended `action_log`.

---

### 7. Data Sources & Transparency

#### `GET /api/data-sources`
Returns full transparency metadata for all data sources (OpenAQ live, Open-Meteo live, simulated sensors, simulated satellite aerosol proxy, historical training datasets) and their provenance types.
