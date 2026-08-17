# AtmosBridge — MEMORY.md

This file is working memory for whichever agent (Antigravity, Claude Code, or human) picks up this project across sessions. Read it fully before starting work. Update it at the **end** of every session — this is not optional, future-you needs it.

## How to use this file

- **Project Snapshot** — rarely changes; update only on major pivots.
- **Session Log** — append one entry per work session, most recent last. Never delete old entries.
- **Decisions Made** — durable architectural/product decisions and why, so they aren't re-litigated.
- **Open Questions / Risks** — anything unresolved that the next session needs to address or watch.
- **Known Limitations** — honest record of what's simulated, stubbed, or unfinished, per `RULES.md` §8.

---

## Project Snapshot

- **Name:** AtmosBridge
- **Event:** Hack2Skill × Google Cloud — Build with AI: Code for Communities (2nd Edition), Track 2 — Clean Air & Climate Resilience, BRICS Sustainability theme
- **One-line pitch:** Federated AI climate-intelligence platform that fuses citizen reports, sensors, satellite-proxy, and weather data to detect hyperlocal/cross-border pollution hotspots, using Gemini for structured multimodal analysis and a lightweight ML model for spike prediction.
- **Stack:** React + Vite + JS/JSX (no TypeScript) · FastAPI · Gemini API · Firestore · Google Maps JS API · Cloud Run (backend) + Vercel (frontend)
- **Docs of record:** `docs/prd.md`, `docs/architecture.md`, `docs/design.md`, `docs/implementation-plan.md`, `RULES.md`, `PHASES.md` (this file supplements, never replaces, those)
- **Current phase:** See `PHASES.md` for live status — do not duplicate that table here.

---

## Decisions Made

| Decision | Reasoning | Doc of record |
|---|---|---|
| JS/JSX only, no TypeScript | Explicit project requirement, overrides the original brief's TS suggestion | `RULES.md` §1 |
| Earth Engine satellite integration is post-MVP; use a seeded satellite-proxy dataset instead | Keeps hackathon build realistic; avoids high-complexity, low-demo-value integration | `docs/prd.md` §9, `docs/architecture.md` §7 |
| Historical training data in CSV/SQLite, not BigQuery | Zero-cost, zero-setup-overhead for a hackathon timeline | `docs/architecture.md` §1 |
| Direct Gemini API preferred over Vertex AI (if setup speed matters) | Faster to wire up under time pressure | `docs/architecture.md` §1 |
| Project name: **AtmosBridge** | Reads as public infrastructure, globally legible, "bridge" motif ties to cross-border mandate | `docs/prd.md` §0 |

_Add new rows here as decisions are made — do not overwrite existing ones._

---

## Open Questions / Risks

- Which specific public historical AQI dataset will actually be used to train the prediction model (source TBD — see `docs/prd.md` §10 candidates: OpenAQ, government portals)?
- Bengali localization scope — full UI or guidance-text-only if time is short (per PRD "Should Have")?
- Final call on Speech-to-Text provider config (Cloud Speech-to-Text default) — confirm quota is sufficient for demo-day testing.
- Confirm Cloud Run and Vercel free-tier limits are sufficient for the demo window (no cost surprises on hackathon day).

_Resolve and move items to Decisions Made once settled; don't just delete them._

---

## Known Limitations (keep honest — mirrors README "Known Limitations")

- Satellite data is simulated (seeded proxy), not a live Earth Engine feed.
- Sensor grid is seeded/simulated to be realistic, not a live third-party sensor network.
- Cross-border event history is a single seeded demo scenario, not live inter-country data sharing.
- Authority accounts are demo-role-based, not tied to real municipal identity systems.
- No automated enforcement — every alert requires human acknowledgement, by design (Responsible AI, `docs/prd.md` §13).

---

## Session Log

### Session 0 — Planning
- Produced `docs/prd.md`, `docs/architecture.md`, `docs/design.md`, `docs/implementation-plan.md`, `ANTIGRAVITY_MASTER_PROMPT.md`, `RULES.md`, `PHASES.md`, `MEMORY.md`.
- No code written yet. Next session should start at Phase 0 in `PHASES.md`.

<!-- Append new sessions below this line, most recent last. Format:
### Session N — <short title>
- What was done
- What broke / had to be worked around
- What's left for next session
-->
