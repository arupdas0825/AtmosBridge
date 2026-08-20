# AtmosBridge — Design

## 1. Visual Direction

Google environmental-intelligence / modern command-center aesthetic — closer to a public infrastructure product than a startup dashboard. Calm, high-trust, data-forward. Restrained animation (state transitions only, no decorative motion). No heavy glassmorphism, no neon, no gaming UI.

## 2. Design Tokens & Component Conventions

**Color (semantic risk scale, never color-only — always paired with icon/label):**
- Safe — `#1B7A4D` (green)
- Watch — `#C98A12` (amber)
- High — `#D9622B` (orange)
- Critical — `#B3251F` (red)
- Neutral surface — `#F5F6F4` (bg), `#0F172A` (ink), `#5B6472` (muted text)
- Accent (brand) — `#0E5C63` (deep teal, "bridge" motif, `#093E43` dark, `#EBF4F5` surface)

**Typography (Strict Rules):**
- **Manrope**: Used universally for all UI text, headlines, subheads, buttons, and card labels.
- **JetBrains Mono**: Reserved strictly for actual data values — coordinates, timestamps, metric readings (`µg/m³`, `ppb`), risk scores, model IDs, and provenance tags. Scale: 10/11/12/14/16/20/24/32/40px.

**Spacing:** 4px base unit (4/8/12/16/24/32/48/64).

**Radius:**
- Buttons & Pills: `9999px` (`rounded-full` / pill shape for all primary, secondary, destructive, and subtle buttons).
- Cards: `12px` (`rounded-card` for all content surfaces).
- Badges & Chips: `9999px` (`rounded-full`).
- Inputs: `8px` (`input-control` / `select-control`).

**Shadow / Elevation:**
- Card: `0 1px 3px rgba(0,0,0,0.06)`
- Modal/Popover: `0 8px 24px rgba(0,0,0,0.10)`
- Glass: `0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)`

**Buttons (Pill Shape — 9999px):**
- Primary: `.btn-primary` (filled deep teal, 40px min touch target, pill radius `9999px`, active scale `0.98`).
- Secondary: `.btn-secondary` (outline with white background, 1px border `#E2E8F0`, pill radius `9999px`).
- Destructive: `.btn-destructive` (filled red `#B3251F`, pill radius `9999px`, used strictly for escalation/dispatch actions).
- Subtle: `.btn-subtle` (transparent hover, pill radius `9999px`).

**Cards:** `.card-surface` (solid white surface `#FFFFFF`, 12px radius, 1px hairline border `#E2E8F0`, consistent 16px/24px padding). Never frosted glass to preserve maximum legibility of environmental data.

**Liquid-Glass Treatment (Restrained):**
- Applied strictly to non-data chrome: `.glass-nav` (navbar backdrop `blur(14px)` with `rgba(255,255,255,0.82)`), `.glass-control-bar` (unified right-side control container `blur(12px)`), and `.glass-popover` (dropdown menus `blur(16px)`).
- Fallback to solid background when `backdrop-filter` is unsupported.

**Motion & Micro-Interactions (Precise & Restrained):**
- **Navbar**: Smooth background/blur transition on scroll (150–200ms ease-out). Active link indicated with subtle filled pill highlight.
- **Buttons**: Subtle press scale (`active:scale-[0.98]`), gentle hover shadow transition, no bounce/elastic easing.
- **Cards**: Gentle fade+rise on mount (`@keyframes cardFadeIn`), subtle shadow lift on hover without scale distortion.
- **Map Hotspot Markers**: Soft pulse animation (`animate-pulse-unack`) on **new / unacknowledged** alerts only; acknowledged ones remain static dots.
- **Page Transitions**: Clean 150–200ms fade transition.
- **Accessibility**: All decorative animations are disabled under `@media (prefers-reduced-motion: reduce)`.

**Navigation Architecture:**
- **Top Command Center Navbar**:
  - **Left**: Real `logo.jpg` mark + wordmark "AtmosBridge" + `BRICS AI` badge.
  - **Center**: Grouped Nav links — plain text links with icon, subtle color shift on hover, active pill highlight, and minimal dot badge on Authority icon.
  - **Right**: Unified Control Bar (single pill container `glass-control-bar`) uniting the **Persona Role Switcher** (`[ Citizen | Authority ]`) and the **Airshed & Language popover** (`[ Airshed • EN ▾ ]`) separated by thin vertical dividers.
- **Mobile Navigation**:
  - Responsive hamburger drawer containing full categorized navigation, persona switcher, region, and language selector.
  - Persistent bottom tab bar (`glass-nav`) for the 5 core mobile workflows: **Map, Hotspots, Report (primary floating center button), Forecast, Authority/Alerts**.

**Breakpoints:** 375 / 768 / 1024 / 1440px.

---

## 3. Screens (Purpose, Key Components, AI Involvement, States)

1. **Landing / Mission** — Hackathon mandate, Manrope headline & concise subhead, primary "Report Sighting" and secondary "Voice Report" / "Authority Portal" pill CTAs, supporting provenance ribbon, 4-node KPI metric strip, 4-step architecture cards, and sovereign BRICS airshed hub tiles.
2. **Citizen Report** — Text description textarea, drag-and-drop photo upload with preview, GPS coordinate detector, demo preset scenario chips, and Gemini AI analysis trigger.
3. **Voice Report** — Audio capture with pulsing recording state, Web Speech multilingual recognition (English, हिन्दी, বাংলা), live transcript display, fallback text input, and Gemini structuring submit.
4. **Photo Analysis (Result View)** — Structured Gemini multimodal dossier: evidence photo preview, event type, severity badge, confidence percentage, visual evidence cues checklist, recommended verification steps, and scientific explanation.
5. **Local Air Intelligence** — Nearby AQI dial with observed provenance tag, chemical composition breakdown (PM2.5, PM10, NO2, SO2), N95 respirator guidance, school/children advisory, and non-clinical health disclaimer.
6. **Global / BRICS Map** — Core geospatial situational awareness screen; BRICS country tabs, layer toggles (Hotspots, Ground Sensors, Winds, Trans-Boundary Plumes, Satellite AOD), timeline scrubber (Live, -6h, -24h), and interactive hotspot card drawers.
7. **Hotspot Explorer** — Filterable active hotspot catalog; search bar, severity filter, risk/population sorting, and detailed metric cards linking to Event Details.
8. **Pollution Event Details** — Evidence photo, structured Gemini summary, nearest ground sensor telemetry cluster table, meteorological wind dispersion values, and direct forecast/advisory triggers.
9. **Prediction Timeline** — 6h/12h/24h atmospheric spike forecast with Recharts time-series chart, model architecture metadata (Physics-Grounded Atmospheric Risk Predictor), and explainable feature-importance breakdown.
10. **Authority Dashboard** — Municipal alert triage queue sorted by risk score; status filter tabs (All, Pending, Acknowledged, Escalated, Resolved), operational KPI cards, and quick Acknowledge / Escalate triggers.
11. **Alert Details** — Full incident command dossier: evidence, AI explanation, recommended intervention checklist, officer action log notes input, dispatch status transitions, and audit log history.
12. **Cross-Border Intelligence** — Trans-boundary drift simulation: source/target region cards, estimated plume arrival window, wind vector trajectory, and bilateral notification advisory transmission trigger.
13. **Analytics** — 12-month historical seasonal PM2.5 trajectories across BRICS hubs (New Delhi, São Paulo, Johannesburg, Beijing, Moscow), interactive Recharts line chart, and CSV dataset export.
14. **Data Sources & Provenance Registry** — Transparency inventory listing every ground, meteorological, satellite, and AI inference dataset with live/simulated badges, update cadences, and schema protocols.
15. **Settings & Preferences** — Interface language selection (EN / हिन्दी / বাংলা), default BRICS airshed node switcher, notification banner toggles, and demo dataset reload trigger.
16. **About & Responsible AI** — Google Responsible AI framework statement (Zero sensor hallucination, human-in-the-loop triage, total provenance transparency, privacy boundary), and data provenance taxonomy key.

Each screen implements consistent loading (`Loader` / skeleton cards), empty (`EmptyState`), and error states with responsive single-column mobile stacking.

---

## 4. Demo-Critical Screens (Must Be Flawless)

Citizen Report → Photo Analysis result → Global Map (hotspot appears) → Prediction Timeline → Cross-Border Intelligence → Authority Dashboard → Alert Details (Acknowledge / Escalate). All other screens support the story with consistent design tokens.
