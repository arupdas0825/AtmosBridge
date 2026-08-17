# AtmosBridge — Implementation Plan

Solo-developer plan (Claude + Antigravity + Google AI + GitHub + Vercel + Google Cloud). Ordered for demo-critical-path-first delivery.

| Phase | Objective | Key Tasks | Deliverables | Effort | Risk / Fallback |
|---|---|---|---|---|---|
| 0 — Setup | Repo + cloud scaffolding | Init GitHub repo, Vite React app, FastAPI app, `.env.example`, Firebase project, Cloud Run project | Empty deployable skeleton | 2–3h | Low |
| 1 — UI Shell | Navigable app with all screens as stubs | Routing, Navbar, design tokens/Tailwind config, empty/loading/error components | All 16 screens reachable | 3–4h | Low |
| 2 — Data Layer | Live + seeded data available | OpenAQ + Open-Meteo clients, Firestore schema, seed script for sensors/satellite/history/cross-border scenario | `seed_data.py`, working `/hotspots` GET | 4–5h | API rate limits → cache responses |
| 3 — Gemini Integration | Multimodal structured analysis works | `gemini_service.py`, JSON schema, function-calling tools for AQI/weather, demo-mode fallback | `/analyze` returns valid structured JSON | 4–6h | Quota/latency → demo-mode cache |
| 4 — Pollution Intelligence | Reports become hotspots | `risk_engine.py`, hotspot scoring, Firestore write, map markers render | Citizen Report → Map hotspot loop works end-to-end | 4–5h | Medium |
| 5 — Prediction | 6h/12h/24h risk | Train XGBoost on historical CSV, `/predict` endpoint, Prediction Timeline chart | Working chart with confidence band | 4–5h | Thin data → documented heuristic fallback |
| 6 — Geospatial Map | Full map experience | Google Maps JS integration, layer toggles, timeline scrubber, marker click → details | Global/BRICS Map screen complete | 5–6h | Maps key/quota → static fallback map |
| 7 — Cross-Border Intelligence | Trans-boundary scenario | Seeded scenario, wind-direction logic, Cross-Border screen, "share alert" action | Cross-Border screen demoable | 3–4h | Medium |
| 8 — Voice/Multilingual | EN/HI(/BN) + voice input | i18n strings, Speech-to-Text integration, language switcher wired through Gemini prompts | Voice Report + language toggle work | 3–4h | STT fails → text fallback |
| 9 — Deployment | Live URLs | Deploy backend to Cloud Run, frontend to Vercel, wire env vars, restrict Maps key | Live prototype URL | 2–3h | Low |
| 10 — Testing | Hero journey verified end-to-end | Manual run-through, fix broken states, mobile check | Signed-off demo path | 2–3h | Low |
| 11 — Demo Video | 3–5 min recording | Script per timeline below, screen record, voiceover | `demo.mp4` link in README | 2h | Low |
| 12 — Pitch Deck | 10–12 slides, PDF | Build deck per structure below | `pitch-deck.pdf` | 2–3h | Low |

**Total estimated effort:** ~40–50 focused hours — feasible for a typical hackathon window if phases 0–7 are prioritized first; 8–12 can compress if time is short (voice can demo as "coming next" if unfinished, per PRD's honesty principle).

## Demo Script (3:30–4:30 target)

- 0:00 Problem — one line + one visual of a missed hyperlocal event
- 0:20 Citizen report (text + photo) submitted
- 0:50 Gemini structured analysis result shown
- 1:20 Hotspot appears on map
- 1:50 Prediction timeline (6h/12h/24h)
- 2:30 Cross-border event card
- 3:00 Authority alert received + opened
- 3:30 Recommended action + acknowledge
- 4:00 Multilingual/voice toggle shown briefly
- 4:20 Close on BRICS country selector — "this scales to five countries on one shared architecture"

## Pitch Deck Structure (10–12 slides)

1. Title (AtmosBridge, track, team) 2. Problem 3. Why existing AQI systems miss it 4. Solution overview 5. How it works (journey diagram) 6. AI architecture (Gemini + prediction) 7. Product walkthrough (screenshots) 8. Cross-border BRICS use case 9. Data & technology (provenance table) 10. Impact 11. Scalability / Digital Public Good framing 12. Roadmap. Each slide: one key message, one visual, minimal text, matching speaker note in the deck's notes field.

## Repository Structure

```
atmosbridge/
  README.md
  .env.example
  docs/
    prd.md  architecture.md  design.md  implementation-plan.md
    data-sources.md  responsible-ai.md  limitations.md
  frontend/  (React + Vite + JSX, src/ as in architecture.md)
  backend/   (FastAPI, routers/ services/ models/)
  scripts/
    seed_data.py
    train_model.py
  screenshots/
```

README covers: setup, environment variables, API docs summary, data sources, model documentation, demo instructions, deployment steps, limitations, responsible-AI notes, license.
