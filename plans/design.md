# AtmosBridge — Design

## 1. Visual Direction

Google environmental-intelligence / modern command-center aesthetic — closer to a public infrastructure product than a startup dashboard. Calm, high-trust, data-forward. Restrained animation (state transitions only, no decorative motion). No glassmorphism, no neon, no gaming UI.

## 2. Design Tokens

**Color (semantic risk scale, never color-only — always paired with icon/label):**
- Safe — `#1B7A4D` (green)
- Watch — `#C98A12` (amber)
- High — `#D9622B` (orange)
- Critical — `#B3251F` (red)
- Neutral surface — `#F5F6F4` (bg), `#0F172A` (ink), `#5B6472` (muted text)
- Accent (brand) — `#0E5C63` (deep teal, "bridge" motif)

**Typography:** Inter (UI text), IBM Plex Mono (data/metrics, coordinates, timestamps) — signals technical credibility. Scale: 12/14/16/20/24/32/40px.

**Spacing:** 4px base unit (4/8/12/16/24/32/48/64).

**Radius:** 6px (inputs/buttons), 12px (cards), 999px (badges/pills).

**Shadow/elevation:** 3 levels only — flat (default), `0 1px 3px rgba(0,0,0,.08)` (card), `0 8px 24px rgba(0,0,0,.12)` (modal/popover).

**Buttons:** primary (filled teal), secondary (outline), destructive (red, escalate/reject actions only). Min touch target 40px.

**Cards:** white surface, 12px radius, 1px hairline border, consistent 16/24px padding.

**Badges:** severity badges use the risk-scale colors + a short label ("Safe/Watch/High/Critical") + icon, never color alone. Provenance badges (`Observed / Inferred / Predicted / Simulated`) are neutral-gray with a small icon distinguishing each.

**Map markers:** circular severity-colored dot, size scales with confidence; predicted-movement shown as a directional gradient arrow/cone, not a hard line, to visually communicate uncertainty.

**Navigation:** left rail (desktop) collapsing to bottom tab bar (mobile) — Report / Map / Dashboard / Analytics / Settings.

**Breakpoints:** 375 / 768 / 1024 / 1440px.

## 3. Screens (purpose, key components, AI involvement, states)

1. **Landing/Mission** — mission statement, "Report Pollution" and "Authority Login" CTAs. No AI. Empty/error n/a.
2. **Citizen Report** — text field, photo upload, location picker, language switcher. AI: triggers Gemini analysis on submit. Loading: analysis spinner with "Gemini is reviewing your report." Error: retry + text-only fallback.
3. **Voice Report** — mic button, live transcript, same submit flow. Error: falls back to Citizen Report text screen.
4. **Photo Analysis (result view)** — shows the extracted structured JSON as a readable card (event type, severity, confidence, evidence). AI: full Gemini output surfaced with provenance tags.
5. **Local Air Intelligence** — nearby AQI (observed), local risk (predicted), plain-language safety guidance. AI: Gemini-generated guidance, provenance-tagged.
6. **Global/BRICS Map** — the core geospatial screen; country selector, layer toggle, timeline scrubber. Empty state: "No hotspots in this view — try zooming out." 
7. **Hotspot Explorer** — filterable list synced to the map, severity/pollutant/time filters.
8. **Pollution Event Details** — evidence photo, AI explanation, nearby observations, predicted movement.
9. **Prediction Timeline** — 6h/12h/24h chart with confidence band + feature-importance summary (why the model predicts this).
10. **Authority Dashboard** — live alert queue (Firestore listener), sorted by urgency; affected-population estimate per alert.
11. **Alert Details** — map + evidence + AI explanation + recommended intervention + Acknowledge/Escalate buttons + action log.
12. **Cross-Border Intelligence** — source/target region cards, estimated arrival window, confidence, "share alert with [country]" action.
13. **Analytics** — historical trend charts, region comparison, export.
14. **Data Sources** — transparency page listing every dataset, live vs. simulated, per §13 of the PRD.
15. **Settings/Language** — EN/HI/BN toggle, notification preferences.
16. **About/Transparency** — Responsible-AI statement, provenance legend, contact/limitations.

Each screen implements consistent loading (skeleton cards, never a blank white flash), empty (icon + one-line explanation + primary action), and error (inline message + retry) states. Mobile behavior: map screens go full-bleed with a bottom sheet for details; forms stack single-column; dashboard tables become stacked cards.

## 4. Demo-Critical Screens (must be flawless)

Citizen Report → Photo Analysis result → Global Map (hotspot appears) → Prediction Timeline → Cross-Border Intelligence → Authority Dashboard → Alert Details (ack). All other screens support the story but are secondary if time runs short.
