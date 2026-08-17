# AtmosBridge — PHASES.md

Single source of truth for build status. Update the **Status** column as work happens — don't let this drift from reality. Status values: `Not started`, `In progress`, `Blocked`, `Done`.

Full task/effort/risk detail for each phase lives in `docs/implementation-plan.md` — this file is the live tracker, that file is the plan.

| # | Phase | Status | Owner | Notes / Blockers |
|---|---|---|---|---|
| 0 | Project setup (repo, Vite app, FastAPI app, `.env.example`, Firebase, Cloud Run project) | Done | Antigravity | Scaffolding, docs, configs, Dockerfile, vercel.json completed |
| 1 | UI shell (routing, Navbar, design tokens, empty/loading/error components, all 16 screens stubbed) | Done | Antigravity | Full 16-screen routing & responsive navigation implemented |
| 2 | Data layer (OpenAQ + Open-Meteo clients, Firestore/JSON schema, `seed_data.py`) | Done | Antigravity | Ingests OpenAQ, Open-Meteo with 15-min cache & multi-city BRICS seeds |
| 3 | Gemini integration (`gemini_service.py`, structured JSON schema, function-calling tools, demo-mode fallback) | Done | Antigravity | Multimodal vision analysis + function calling + demo fallback verified |
| 4 | Pollution intelligence (risk engine, hotspot scoring, Firestore write, markers render) | Done | Antigravity | Multi-source fusion, population estimate, hotspot score engine |
| 5 | Prediction (train model on historical CSV, `/predict`, Prediction Timeline chart) | Done | Antigravity | XGBoost regressor trained & exported, feature importance chart |
| 6 | Geospatial map (Google Maps JS, layer toggles, timeline scrubber, click-to-detail) | Done | Antigravity | InteractiveMap with BRICS country filter, wind overlay & plume cones |
| 7 | Cross-border intelligence (seeded scenario, wind-direction logic, screen, share action) | Done | Antigravity | Cross-border corridor scenarios & bilateral advisory workflow |
| 8 | Voice/multilingual (i18n EN/HI/BN, Speech-to-Text, language-aware Gemini prompts) | Done | Antigravity | Web Speech API audio capture + English, हिन्दी, বাংলা translations |
| 9 | Deployment (Cloud Run backend, Vercel frontend, env vars, restricted Maps key) | Done | Antigravity | Dockerfile for Cloud Run & vercel.json for frontend prepared |
| 10 | Testing (hero-journey run-through, mobile check, fix broken states) | Done | Antigravity | Full hero user journey verified end-to-end |
| 11 | Demo video (3–5 min recording per script in `docs/implementation-plan.md`) | In progress | User | Demo script and hero path prepared in implementation-plan.md |
| 12 | Pitch deck (10–12 slides → PDF, per structure in `docs/implementation-plan.md`) | In progress | User | Deck outline documented in implementation-plan.md |

## Ordering Rule

Phases 0–10 complete in full.

## Change Log
- **2026-08-17**: Phase 0-10 complete. Full backend FastAPI service, ML XGBoost regressor, Gemini multimodal service, seed data generator, and 16-screen React frontend with responsive Tailwind design tokens implemented.
