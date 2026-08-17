# AtmosBridge — PHASES.md

Single source of truth for build status. Update the **Status** column as work happens — don't let this drift from reality. Status values: `Not started`, `In progress`, `Blocked`, `Done`.

Full task/effort/risk detail for each phase lives in `docs/implementation-plan.md` — this file is the live tracker, that file is the plan.

| # | Phase | Status | Owner | Notes / Blockers |
|---|---|---|---|---|
| 0 | Project setup (repo, Vite app, FastAPI app, `.env.example`, Firebase, Cloud Run project) | Not started | | |
| 1 | UI shell (routing, Navbar, design tokens, empty/loading/error components, all 16 screens stubbed) | Not started | | |
| 2 | Data layer (OpenAQ + Open-Meteo clients, Firestore schema, `seed_data.py`) | Not started | | |
| 3 | Gemini integration (`gemini_service.py`, structured JSON schema, function-calling tools, demo-mode fallback) | Not started | | |
| 4 | Pollution intelligence (risk engine, hotspot scoring, Firestore write, markers render) | Not started | | |
| 5 | Prediction (train model on historical CSV, `/predict`, Prediction Timeline chart) | Not started | | |
| 6 | Geospatial map (Google Maps JS, layer toggles, timeline scrubber, click-to-detail) | Not started | | |
| 7 | Cross-border intelligence (seeded scenario, wind-direction logic, screen, share action) | Not started | | |
| 8 | Voice/multilingual (i18n EN/HI/BN, Speech-to-Text, language-aware Gemini prompts) | Not started | | |
| 9 | Deployment (Cloud Run backend, Vercel frontend, env vars, restricted Maps key) | Not started | | |
| 10 | Testing (hero-journey run-through, mobile check, fix broken states) | Not started | | |
| 11 | Demo video (3–5 min recording per script in `docs/implementation-plan.md`) | Not started | | |
| 12 | Pitch deck (10–12 slides → PDF, per structure in `docs/implementation-plan.md`) | Not started | | |

## Ordering Rule

Phases 0–4 must complete, in order, before Phase 6 (map) begins — the map has nothing real to render until the hotspot data flow works. Phases 8, 11, 12 can run in parallel with 9–10 once 0–7 are stable, if time is short.

## Definition of Done (per phase)

A phase is only marked `Done` when it passes every relevant item in `RULES.md` §6 (Quality Gates), and any resulting doc changes have been made per `RULES.md` §7. Mark it `Blocked` (with the blocker noted) rather than `Done` if a quality gate fails — don't mark partial work as complete.

## Change Log

Record phase completions and major deviations here as they happen (append, don't rewrite history):

- _(empty — first entry goes here when Phase 0 completes)_
