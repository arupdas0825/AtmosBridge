# AtmosBridge — Demo Video Script

Target runtime: **4:30–5:00**. Screen-record at 1440×900 (or the live prototype at [atmosbridgeai.vercel.app](https://atmosbridgeai.vercel.app/)). Voiceover lines are suggestions — say them naturally, don't read verbatim.

Before recording: seed data (`python scripts/seed_data.py`), and have one citizen report photo ready to upload live during the recording so the Gemini analysis moment is real, not a replay.

---

### 0:00 – 0:20 — The Problem
**Screen:** Landing page hero.
**Voiceover:** "City-level AQI monitors report one number for an entire city. They miss the industrial unit burning waste three streets over, or the smog crossing a border overnight. AtmosBridge closes that gap."
**Action:** Let the hero load, briefly hover the provenance legend (Observed/Inferred/Predicted/Simulated) to signal "this is not a fake dashboard."

### 0:20 – 0:50 — Citizen Report
**Screen:** Citizen Report page.
**Voiceover:** "Here's how it starts — a resident sees something and reports it in under a minute."
**Action:** Type a short description ("Dense black smoke near the industrial block"), drop a pin on the map, upload the prepared photo, hit submit.

### 0:50 – 1:20 — Gemini Analysis
**Screen:** Photo Analysis Result page (loads automatically after submit).
**Voiceover:** "Gemini doesn't just caption the photo — it structures the report: event type, severity, confidence, and what should be verified on the ground. It's grounded in live air-quality and weather data, not guessing."
**Action:** Let the structured JSON-style breakdown render on screen; point to the severity score and confidence value.

### 1:20 – 1:50 — Hotspot on the Map
**Screen:** Global/BRICS Map.
**Voiceover:** "That report becomes a hotspot instantly, fused with live sensor and weather data around it."
**Action:** Pan/zoom to the new marker; toggle one layer (e.g., wind vectors) to show the map isn't static.

### 1:50 – 2:30 — Prediction Timeline
**Screen:** Prediction Timeline page for that hotspot.
**Voiceover:** "This isn't just 'it's bad now' — we forecast 6, 12, and 24 hours out, with a confidence band and a plain-language explanation of why: wind stagnation, humidity, and how many people reported it."
**Action:** Scroll through the three horizon cards; highlight the feature-importance breakdown.

### 2:30 – 3:00 — Cross-Border Intelligence
**Screen:** Cross-Border Intelligence page.
**Voiceover:** "And because pollution doesn't stop at a border, we model where it's headed — source region, target region, estimated arrival window, clearly labeled as a prediction, not a live measurement."
**Action:** Show the source/target region cards and the drift visualization.

### 3:00 – 3:30 — Authority Alert
**Screen:** Authority Dashboard.
**Voiceover:** "On the other end, a municipal authority sees this land in their queue in real time, sorted by urgency, with an estimated affected population."
**Action:** Click into the new alert from the queue.

### 3:30 – 4:00 — Alert Details & Human-in-the-Loop
**Screen:** Alert Details / Triage page.
**Voiceover:** "They see the evidence, the AI's reasoning, and a recommended intervention — but nothing happens automatically. A human acknowledges or escalates. AtmosBridge never takes enforcement action on its own."
**Action:** Click Acknowledge; show the action logged.

### 4:00 – 4:20 — Multilingual Access
**Screen:** Settings or language switcher.
**Voiceover:** "The whole citizen-facing flow works in English, Hindi, Bengali, and is built to extend to every BRICS language."
**Action:** Quick language toggle on the report form.

### 4:20 – 4:45 — Scale & Close
**Screen:** BRICS region selector on the map, zoomed out to show all five countries.
**Voiceover:** "One shared architecture, five countries, and a federated model that never requires a nation to hand over raw citizen data to participate. That's AtmosBridge — built for Hack2Skill × Google Cloud, Track 2, Clean Air & Climate Resilience."
**Action:** End on the BRICS map wide shot or the landing page.

---

## Recording Checklist

- [ ] Screen resolution 1440×900, no browser bookmarks bar visible
- [ ] Data seeded, one report submitted live during recording (not pre-staged only)
- [ ] Audio: clear voiceover, no background noise, consistent volume
- [ ] Total runtime 4:30–5:00
- [ ] Exported and uploaded to YouTube or Google Drive with **"Anyone with the link"** access
- [ ] Link added to `docs/HACK2SKILL-SUBMISSION-CHECKLIST.md` and the submission form
