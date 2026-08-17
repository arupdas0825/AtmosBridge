# AtmosBridge — RULES.md

These rules govern any agent (Antigravity, Claude Code, or a human) working on this repository. They are binding — when a rule and a convenience conflict, the rule wins.

## 1. Language & Stack Lock

- Frontend is **React + Vite + JavaScript/JSX only**. Never create `.ts` or `.tsx` files. Never add `typescript`, `@types/*`, or a `tsconfig.json`. If a dependency ships TS-only examples, translate them to JSX before using.
- Backend is **Python + FastAPI**. Do not introduce a second backend framework or language.
- Database is **Firestore** for live app data; historical AQI/weather training data is **CSV/SQLite**, not BigQuery, unless `docs/architecture.md` is explicitly updated first.
- Maps is **Google Maps JS API**. Do not swap in Leaflet/Mapbox without updating `docs/architecture.md`.

## 2. Read Before You Write

- Before touching any file, read the relevant doc in `docs/` (`prd.md`, `architecture.md`, `design.md`, `implementation-plan.md`) and `MEMORY.md`. Do not re-derive decisions that are already documented — follow them.
- Before starting a phase, check `PHASES.md` for its current status. Do not start Phase N+1 while Phase N is marked incomplete unless explicitly told to work out of order.
- If a requirement in this repo's docs conflicts with a general best practice, the repo's docs win — flag the conflict in `MEMORY.md` instead of silently resolving it your own way.

## 3. No Fake Functionality

- Never ship a button, form, or screen that looks functional but does nothing. If a feature can't be finished, either implement a smaller real version or clearly label it "Coming soon" — never a silent no-op.
- Never let Gemini invent a sensor, satellite, or weather value. Every such figure must come from a tool call, a seeded dataset, or be explicitly `null`.
- Every numeric environmental value shown in the UI must carry a provenance tag: `observed`, `inferred`, `predicted`, or `simulated`. No exceptions.
- Simulated/seeded data must be visibly labeled as such in the UI, not just in code comments.

## 4. Secrets & Security

- Gemini, Speech-to-Text/Translation/TTS, and the server-side Maps key live **only** in backend environment variables, never in frontend code or committed files.
- The frontend Maps key is a separate, HTTP-referrer-restricted key.
- `.env` is gitignored. `.env.example` must always list every required variable name with an empty/placeholder value, kept in sync with what the code actually reads.
- Validate all citizen-submitted input: photo size cap, MIME-type allowlist, text length cap. Rate-limit `POST /reports`.

## 5. Demo-Path Priority

- The hero journey (Citizen Report → Gemini analysis → Map hotspot → Prediction → Cross-Border card → Authority alert → Acknowledge) must always be left in a working state at the end of any work session. If a change risks breaking it, branch instead of committing to main.
- Every external dependency (Gemini, Maps, Speech-to-Text, live AQI/weather APIs) must have the fallback defined in `docs/architecture.md` §7 implemented, not just described.

## 6. Quality Gates (must pass before a phase is marked done in PHASES.md)

- `npm run build` succeeds with zero errors in `frontend/`.
- Backend starts cleanly; every endpoint listed in `docs/api.md` responds.
- No console errors during a manual run of the hero journey.
- No TypeScript files anywhere in the repo.
- No secret key present in any built frontend bundle (spot-check `dist/`).
- Mobile viewport (375px) doesn't break the screen(s) touched in that phase.

## 7. Documentation Discipline

- Any decision that changes something already written in `docs/architecture.md`, `docs/design.md`, or `docs/prd.md` must update that doc in the same change — don't let docs and code drift apart.
- Log every completed phase, every deviation from the plan, and every open question in `MEMORY.md` (see that file's own format) so the next session doesn't have to rediscover context.
- Keep `PHASES.md` status accurate in real time — it is the single source of truth for "what's done."

## 8. Honesty Over Polish

- Do not overpromise. A working 80% feature beats a fake 100% one.
- If a phase can't be completed in the available time, ship the smaller documented fallback (per `docs/implementation-plan.md`) and record it under "Known Limitations" in the README and in `MEMORY.md` — never hide the gap.
