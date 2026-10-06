# RailOne Next 3.0 — GitHub Integration & Repository Audit Register

**Reference Specification**: Section 14 — GitHub Repositories Audit, Select & Integrate  
**Charter Reference**: Master Plan Sections D & E, AGENTS.md Conflict Resolution Matrix  
**Date**: October 2026 | **Classification**: Legal, Security & Architectural Integration Register  

---

## 1. Executive Policy & Integration Protocol

RailOne Next 3.0 enforces a strict **"Integrate, Don't Collect"** protocol governing open-source software and third-party railway repositories:
1. **Zero Scraping & Terms Violation**: Any repository that relies on unauthorized scraping of official Indian Railways, CRIS, NTES, or Yatri protected APIs is strictly quarantined and marked `WITHHOLD` or `REJECT`.
2. **License Compliance**: GPL-3.0 and copyleft repositories are restricted to architecture reference only (`REFERENCE ONLY`); zero code is copied into MIT/Apache-2.0 RailOne Next codebases.
3. **Ponytail Code Minimality**: Avoid introducing bloated C++ daemon dependencies (e.g. MOTIS, OpenTripPlanner) or redundant UI wrappers when native TypeScript standard library graph algorithms provide faster, in-memory deterministic results.
4. **Attribution & Provenance**: Every reused dataset or reference pattern is attributed with exact commit hashes and legal boundaries.

---

## 2. Master Evaluation Register of 14 Candidate Repositories (Section D)

| # | Repository URL & Name | License | Evaluated Capability | Integration Verdict | Technical Rationale & Implementation Boundary |
| :- | :--- | :--- | :--- | :--- | :--- |
| 1 | `YashPrime-02/IRCTC-IMPROVISED-CLONE` | MIT | Booking workflow, PDF/QR ticket specimen, Angular components | **REFERENCE** | Studied ticket layout and specimen QR structure. Angular UI components were not transplanted into React 19 to prevent framework pollution. |
| 2 | `prasenjit-27/Indian-Railway-Data` | CC0-1.0 | JSON datasets of 8,990 stations and 5,208 trains | **DATA CANDIDATE / REFERENCE** | Snapshot validated; station codes and stop sequences deduplicated and normalized into typed schema (`src/fixtures/railwayData.ts`). Deprecated trains filtered out. |
| 3 | `datameet/railways` | CC0-1.0 | Static geospatial railway station GeoJSON and shapefiles | **REFERENCE** | Historically valuable for geographic coordinate seed; obsolete for active suburban schedules. Used for station latitude/longitude references. |
| 4 | `akmsy/train-tracker` | MIT | WebSocket live animation, Leaflet train icons | **REFERENCE** | Useful for CSS train marker animation. Simulated positions are strictly prevented from claiming "live GPS". |
| 5 | `dograh-hq/dograh` | BSD-2-Clause | Voice agent orchestration, tool calling, Asterisk/SIP telephony | **HIGH-PRIORITY CANDIDATE / INTEGRATED** | Clean tool-calling architecture adopted for deterministic voice tools (`src/engine/voiceTools.ts`). Web Speech & in-app dialer integrated; external PSTN withheld due to recurring Indian carrier costs. |
| 6 | `himrd95/train-search-app` | MIT | Station autocomplete and basic UI layout | **REFERENCE** | Autocomplete UX patterns referenced; relies on unmaintained RapidAPI endpoints which are not permitted for live feeds. |
| 7 | `The15thSin/RailEase-Train-Reservation-App` | GPL-3.0 | Java/Spring reservation engine | **REFERENCE ONLY** | GPL-3.0 license copyleft restrictions prevent code incorporation. Examined for quota seat allocation logic only. |
| 8 | `shwetankg07/railpull` | MIT | NTES station board and live train scraping client | **WITHHOLD DATA COLLECTION** | MIT code, but unauthorized reverse-engineering of CRIS/NTES violates terms. Scraping code withheld to maintain legal integrity. |
| 9 | `ClaudeMaxUser/rail-info` | MIT | Multi-provider railway proxy adapter | **WITHHOLD DATA COLLECTION** | Substituted server clock timestamps when official timestamps were absent. Rejected to protect the Truth-in-Data contract. |
| 10 | `R-Gaurav/train-delay-estimation` | Academic / Unlicensed | Historical delay estimation models | **RESEARCH** | Older academic research; inspired our deterministic compounding delay propagation model ($+20\text{m} \to +40\text{m}$). |
| 11 | `MaVasil/traineta` | MIT | GIS train ETA visualization | **REFERENCE** | Referenced for time-distance route visualization. Custom SVG schematic heatmap built instead. |
| 12 | `omkarspace/MapMyTrain` | Proprietary / Mixed | Live train tracking & GPS simulation | **WITHHOLD** | Unofficial NTES scraping and licensing opacity. Quarantined. |
| 13 | `abhijitnath02/Railpulse-SIS-Hackathon-2026` | MIT | ETA prediction and hackathon dashboard | **EXPERIMENTAL** | Explored for synthetic delay modeling ideas; uncalibrated machine learning models rejected for safety. |
| 14 | `Rajveerbairagi/TrainRadar` | MIT | Radar radar map UI and RapidAPI bridge | **REFERENCE** | Radar visualization concept referenced; external RapidAPI bridge rejected due to fragility and rate limits. |

---

## 3. Targeted Additional Tooling Repositories (Section E)

| # | Repository URL & Name | License | Targeted Capability | Integration Decision | Technical Analysis & Tradeoff |
| :- | :--- | :--- | :--- | :--- | :--- |
| 15 | `motis-project/motis` | MIT | High-performance multimodal routing engine (C++) | **HOLD** | Heavyweight C++ binary requiring dedicated daemon process and continuous GTFS ingestion. Withheld in favor of ultra-fast in-memory TypeScript graph routing. |
| 16 | `opentripplanner/OpenTripPlanner` | LGPL-3.0 | Java multimodal transit pathfinder | **HOLD** | Large Java JVM overhead. Rejected as unnecessary dependency. |
| 17 | `MobilityData/gtfs-validator` | Apache-2.0 | Canonical static GTFS specification validator | **HIGH-PRIORITY TOOLING** | High-value tool for validating static Indian Railways timetable GTFS exports during offline data ingestion. |
| 18 | `google/transit` | Apache-2.0 | GTFS and GTFS-RT format specifications | **REFERENCE CONTRACT** | Used as canonical schema reference for transit contracts and stop sequences. |
| 19 | `maplibre/maplibre-gl-js` | BSD-3-Clause | Vector tile web map renderer | **HOLD** | High bundle size (>700KB) and external vector tile server dependency. Replaced with lightweight, high-contrast, offline-capable SVG schematic network map (`NetworkMapViewer.tsx`). |
| 20 | `Leaflet/Leaflet` | BSD-2-Clause | Lightweight web mapping library | **HOLD** | Similar to MapLibre, external raster tile server tiles fail in offline cellular dead zones. Lightweight SVG chosen. |
| 21 | `shadcn-ui/ui` | MIT | Accessible UI component primitives (Radix UI) | **ADOPTED PATTERNS** | Accessible component design patterns, keyboard focus rings, and ARIA modal semantics directly integrated without bloated dependencies. |
| 22 | `nextlevelbuilder/ui-ux-pro-max-skill` | MIT | Design system intelligence and transit palettes | **INTEGRATED (SKILL)** | Active design skill in RailOne charter (`AGENTS.md`). Governs ASTRA color tokens, WCAG 2.1 AAA contrast, and 44px touch targets. |
| 23 | `TanStack/query` | MIT | Async cache management, freshness, and retry | **REFERENCE** | In-memory reactive state and deterministic store used instead to keep bundle minimal. |
| 24 | `statelyai/xstate` | MIT | Finite state machines and statecharts | **REFERENCE** | Examined for transaction states. Implemented lightweight typed state machine (`MockBookingStore`) using native TypeScript unions. |
| 25 | `vite-pwa/vite-plugin-pwa` | MIT | Zero-config PWA service worker plugin for Vite | **INTEGRATED** | Enables offline caching of assets, manifest registration, and mobile home screen installation. |
| 26 | `microsoft/playwright` | Apache-2.0 | End-to-end browser testing | **BENCHMARK TOOLING** | Playwright test suites configured for desktop and mobile viewport verification. |
| 27 | `valhalla/valhalla` | MIT | Multimodal routing and pedestrian routing | **HOLD** | Pedestrian walking buffers are deterministically modeled via the Station FOB Graph without external Valhalla service. |
| 28 | `shwetankg07/RailRaag` | MIT | Railway animation concept | **REFERENCE** | Referenced for visual train movement cues in 3D simulator. |
| 29 | `Vivek-Biswal/SIH_ETA` | MIT | Delay estimation ML research | **RESEARCH** | Kept as research reference until official multi-year punctuality datasets are released under NDSAP. |

---

## 4. Integration Verification Summary

All integrated components are verified to meet:
1. **Zero License Incompatibility**: 100% permissive licenses (MIT, Apache-2.0, BSD-2-Clause, CC0). Zero copyleft violations.
2. **Zero Insecure Scraping**: All data is strictly separated into authorized feeds, verified timetables, or transparent test datasets.
3. **Zero Dead Code**: Unused abstractions deleted according to Ponytail minimality principles.
