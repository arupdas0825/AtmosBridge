# AtmosBridge — Pitch Deck Content

Source content for the 12-slide submission deck. Build the actual slides in Google Slides/PowerPoint/Canva using this copy, then export to PDF for submission. One idea per slide — resist the urge to pack more text on than fits.

---

## Slide 1 — Title
**Headline:** AtmosBridge
**Subhead:** Federated AI Climate-Intelligence for Hyperlocal & Cross-Border Pollution Detection
**Visual:** Logo centered, BRICS-map silhouette faint in the background.
**Footer:** Hack2Skill × Google Cloud — Build with AI: Code for Communities · Track 2: Clean Air & Climate Resilience
**Speaker note:** Open with one sentence — "AtmosBridge detects the pollution events that city-level AQI monitors are structurally unable to see."

---

## Slide 2 — The Problem
**Headline:** City-Level AQI Hides the Events That Actually Hurt People
**Body:** Macro monitoring stations report sparse, averaged readings. They miss illegal industrial burns, localized agricultural fires, and smog that crosses a national border overnight.
**Visual:** A city map with one AQI dot vs. multiple real incident markers it never captured.
**Speaker note:** Ground this in a concrete example — a specific type of event (industrial smoke, crop burning) that a city-wide average would completely wash out.

---

## Slide 3 — Why Existing Systems Fail
**Headline:** Monitoring ≠ Intelligence
**Body:** Three gaps: (1) spatial — sparse sensor networks, (2) temporal — hourly/daily averages miss spikes, (3) political — no cross-border data-sharing layer exists between BRICS nations today.
**Visual:** Three-icon row: sparse grid / clock / broken border line.
**Speaker note:** This slide earns the "why AI, why now" framing for the next slide.

---

## Slide 4 — The Solution
**Headline:** Citizen Reports + Sensors + Satellite + Weather → One Intelligence Layer
**Body:** AtmosBridge fuses four data streams and uses Gemini to structure the unstructured ones, producing hotspot detection, forecasting, and cross-border risk in one pipeline.
**Visual:** The four-input funnel diagram from `docs/architecture.md` §2.
**Speaker note:** Emphasize "fuses," not "replaces" — this complements existing AQI infrastructure, it doesn't try to rebuild it.

---

## Slide 5 — How It Works (Hero Journey)
**Headline:** From a Phone Photo to an Authority Alert in Seconds
**Body:** Citizen report → Gemini structures it → risk engine fuses live + simulated data → hotspot + forecast → authority reviews and acknowledges.
**Visual:** The 6-step hero journey flow (see `docs/prd.md` §4).
**Speaker note:** This is the slide the demo video expands into — keep it tight, the video does the heavy lifting.

---

## Slide 6 — AI Architecture
**Headline:** Gemini Structures. It Never Invents.
**Body:** Multimodal analysis (photo + text) returns strict structured JSON — event type, severity, confidence. Every numeric figure is tagged `Observed / Inferred / Predicted / Simulated`. No hallucinated sensor readings.
**Visual:** The provenance-tag legend, screenshot of the structured analysis output.
**Speaker note:** This is the credibility slide for judges — spend real time here, it's what separates this from a "wrap a chatbot in a dashboard" submission.

---

## Slide 7 — Product Walkthrough
**Headline:** 16 Screens, One Coherent System
**Body:** Citizen tools (report, voice, local intelligence) → geospatial core (map, hotspots) → governance (authority dashboard, triage) → transparency (data sources, responsible AI).
**Visual:** 4–6 real screenshots from `screenshots/` (landing, gemini-analysis, brics-map, authority-dashboard).
**Speaker note:** Let the screenshots do the talking — one line per screenshot, no paragraph.

---

## Slide 8 — Cross-Border BRICS Use Case
**Headline:** Pollution Doesn't Stop at a Border. Neither Does AtmosBridge.
**Body:** A hotspot near a source region + wind data → predicted trans-boundary drift → source/target region cards with arrival window and confidence, clearly labeled as a prediction.
**Visual:** `cross-border.png` screenshot.
**Speaker note:** Name the concrete demo scenario used in the video so judges connect this slide to what they just watched.

---

## Slide 9 — Data & Technology
**Headline:** Every Number Has a Receipt
**Body:** Live: OpenAQ, Open-Meteo. Simulated (labeled): sensor mesh, satellite AOD proxy, cross-border scenarios. Full registry in `docs/data-sources.md`.
**Visual:** The data-provenance table (source/provenance/format/cadence).
**Speaker note:** Directly address the "is this real or fake data" question before a judge has to ask it.

---

## Slide 10 — Impact
**Headline:** Faster Detection, Faster Response
**Body:** Frame impact in terms of time-to-detection and time-to-authority-awareness compared to waiting for a city-wide AQI average to shift — plus the public-health value of hyperlocal safety guidance for citizens in the meantime.
**Visual:** Simple before/after timeline (macro monitoring vs. AtmosBridge detection speed).
**Speaker note:** Keep any impact numbers honest and clearly framed as illustrative/prototype-stage, not measured production outcomes — the project doesn't have real deployment data yet.

---

## Slide 11 — Scalability / Digital Public Good
**Headline:** One Architecture, Five Nations, No Forced Data Handover
**Body:** Federated design — each country's authority dashboard operates on its own data; only aggregated hotspot/risk summaries are exchanged across the cross-border layer. Country field on every record from day one.
**Visual:** BRICS map with the five countries lit up, federated-architecture diagram from `docs/architecture.md` §8.
**Speaker note:** This is the differentiator for "public good" framing — no country needs to give up sovereignty over its raw citizen data.

---

## Slide 12 — Roadmap
**Headline:** What's Next
**Body:** Near-term: live Earth Engine satellite ingestion, verified sensor partnerships, full BRICS language coverage. Mid-term: real authority accounts per municipality, production-grade cross-border data agreements.
**Visual:** Simple 2-column Now / Next layout.
**Speaker note:** Close by restating the mission line from Slide 1 — bookend the pitch.

---

## Export Checklist

- [ ] All 12 slides built in your slide tool of choice
- [ ] Screenshots pulled from `screenshots/` once captured (see `screenshots/README.md`)
- [ ] No unsupported/uncited impact numbers presented as measured fact
- [ ] Exported to PDF, under any file-size limit the submission form specifies
- [ ] Linked from `docs/HACK2SKILL-SUBMISSION-CHECKLIST.md` and the submission form
