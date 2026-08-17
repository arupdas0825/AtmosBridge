# AtmosBridge — Responsible AI Framework

AtmosBridge adheres strictly to Google's Responsible AI Practices, focusing on transparency, human-in-the-loop governance, fairness, and hallucination mitigation in public environmental intelligence.

---

## 1. Grounded AI & Anti-Hallucination Guardrails
- **Zero Sensor Invention**: Gemini is structurally prohibited from guessing, inventing, or synthesizing numerical sensor readings or satellite figures. All numerical inputs are supplied strictly through backend tool execution (`get_local_air_quality`, `get_weather`) or returned as `null`.
- **Strict Response Schema**: Gemini outputs are enforced using Pydantic schemas / JSON mode. The system validates all expected keys (`event_type`, `severity`, `confidence`, `visual_evidence`, `recommended_verification`) before returning data to consumers.
- **Provenance Visibility**: Every environmental value rendered in the frontend interface carries an explicit badge: `[Observed]`, `[Inferred]`, `[Predicted]`, or `[Simulated]`. Color-only signaling is forbidden; all indicators pair color with icons and descriptive text for accessibility.

---

## 2. Human-in-the-Loop Authority Action
- **No Automated Enforcement**: AtmosBridge alerts authorities to high-risk hotspots, but never triggers punitive, regulatory, or emergency enforcement automatically.
- **Mandatory Human Acknowledgement**: Municipal and cross-border officials must review the evidence (citizen photo, sensor trend, AI summary, predicted movement) and make an intentional decision (Acknowledge, Escalate, Dispatch, or Resolve).
- **Immutable Audit Logging**: Every status transition records the timestamp, actor identity, action type, and operational notes.

---

## 3. Privacy & Citizen Protection
- **Anonymous Reporting**: Citizen reporting does not require personal identification, phone numbers, or social logins.
- **Minimal PII Retention**: Location coordinates are snapped to incident locations rather than tracking individuals. Photo uploads are screened for environmental evidence and are never used for biometric facial recognition.
- **Open Standards**: Data models follow open GeoJSON and OGC standards to empower community oversight.

---

## 4. Public Health Boundary & Non-Diagnostic Advisory
- **General Guidance Only**: AtmosBridge generates general, evidence-based public health advice (e.g., "Wear N95 masks", "Sensitive individuals should limit strenuous outdoor activity", "Suspend school outdoor activities") derived from WHO and national air quality guidelines.
- **No Medical Diagnosis**: The platform explicitly disclaims individual medical diagnostic advice.
