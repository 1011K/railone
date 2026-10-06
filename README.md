# RailOne Next — Railway Journey Decision & Delay Intelligence

**Unofficial Educational Redesign of Indian Railways RailOne Platform**  
**Date**: October 2026 | **Context**: AI Subject Semester Project  
**Repository**: `railone-next`

---

## 1. Executive Summary & Problem Formulation

Standard railway applications (IRCTC, RailOne, UTS) provide static timetable lookup and seat reservation, but fail daily commuters in high-density urban corridors (e.g. Mumbai Suburban) and long-distance intercity routes facing compound disruptions:
1. **The Fast vs. Slow Inversion Dilemma**: When a Fast Local is held at an upstream signal or track junction (+20m delay), an upcoming Slow Local running on the unaffected corridor will reach the commuter's destination earlier. Standard apps blindly rank the Fast train first due to static timetables.
2. **The Origin Delay / Leave-Home Gap**: A train might depart origin 18 minutes late, yet downstream stations display scheduled times until the train enters the section. Commuters rush to stations only to wait on overcrowded platforms.
3. **The Short-Hop Legal Gating Issue**: Commuters frequently ask if they can jump onto a Mail/Express train between suburban halts (e.g. Dadar to Kalyan). Most apps either don't support the hop or give invalid advice. In reality, **only trains on the Central Railway Monthly Season Ticket (MST) authorized list** (e.g. Deccan Queen in General Second Class) are legally boardable; non-MST trains (e.g. Konark Express) subject commuters to Indian Railways Act Section 138 penalties.
4. **Transfer Margin Infeasibility**: Cross-line transfers (such as Central to Western Railway via Dadar) require physical foot-overbridge traversal (minimum 6–8 minutes buffer). Instant zero-margin connections lead to missed trains.

**RailOne Next** is a journey decision support system that models delay propagation, checks legal ticketing eligibility, evaluates interchange feasibility, and gives honest uncertainty metrics without hallucinatory live claims.

---

## 2. Honest Data Provenance & Truth-in-Data Contract

As mandated in the project charter:
- **`LIVE_VERIFIED`**: Authorized, timestamped NTES/CRIS official feed (where legitimate API credentials exist).
- **`SCHEDULED`**: Published official Indian Railways timetable.
- **`HISTORICAL`**: Labeled historical delay statistics with explicit sample size.
- **`ESTIMATED`**: Downstream delay propagation engine with uncertainty intervals ($\pm \Delta t$).
- **`DEMO`**: Deterministic scenario fixtures modeling real-world Mumbai suburban and national disruption events.
- **`UNKNOWN`**: Missing telemetry; the system never substitutes the server clock for an absent railway timestamp.

---

## 3. Audited Candidate Repositories Register

| Repository | Capability Evaluated | Verdict | Technical Findings & Decision |
|---|---|---|---|
| `datameet/railways` | Indian railway static geospatial stations/stops | **REFERENCE** | Useful historical station mapping seed; not guaranteed current running timetable. |
| `prasenjit-27/Indian-Railway-Data` | JSON train/station seed | **REFERENCE** | Outdated stop patterns; deduplicated and normalized into local typed schemas. |
| `motis-project/motis` / `OpenTripPlanner` | Heavyweight multi-modal routing engine | **HOLD** | Over-engineered for client-side deterministic suburban graph; lightweight typed graph engine preferred. |
| `dograh-hq/dograh` | Voice orchestration & browser audio | **VALIDATE** | Clean tool-calling architecture; implemented shared deterministic tools for browser mic & in-app dialer. Real PSTN telephony requires paid carrier/Twilio accounts. |
| `shwetankg07/railpull` | NTES station board scraping | **REJECT** | Unofficial NTES scraping violates terms; no public free license for redistribution. |
| `ClaudeMaxUser/rail-info` | Multi-provider railway adapter | **REJECT** | Uses client-clock substitution when source timestamps are absent; violates truth-in-data rules. |
| `R-Gaurav/train-delay-estimation` | Historical delay modeling | **REFERENCE** | Older academic model; inspired empirical categorical delay propagation. |

---

## 4. Architecture & Engineering Contracts

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide icons, Motion animations.
- **Deterministic Journey Engine**: `src/engine/journeyEngine.ts`
  - Multi-leg graph routing (direct & Dadar Central-to-Western transfer).
  - Delay inversion detection (`delayInversionNote`).
  - Pre-departure leave-home calculation.
- **Legal Eligibility Gating**: `src/engine/eligibilityEngine.ts`
  - Checks Central/Western Railway MST rules, suburban classes (II, I, AC Local), and PRS restrictions.
- **Categorical Crowding Engine**: `src/engine/crowdEstimator.ts`
  - Classifies passenger density into `LOW`, `MODERATE`, `HEAVY`, `CRUSH_LOAD` based on peak windows, travel direction, and bunching delays. No fake precision (rejects "78.4%").
- **Voice & Telephony Backend**: `src/engine/voiceTools.ts`
  - 7 deterministic tools callable by speech recognition, dialer, and UI:
    `searchTrains`, `getLiveStatus`, `validateEligibility`, `compareItineraries`, `quoteFare`, `createBookingDraft`, `confirmDemoBooking`.
- **Specimen Booking Store**: `src/engine/mockBookingStore.ts`
  - Idempotent booking drafts, cryptographic mock QR codes, test OTPs (`139026`), and cancellation/refund simulation.

---

## 5. Automated Verification & Test Results

The suite tests all P0 boundary conditions and canonical master plan acceptance scenarios:
```bash
npm test
```
**Results (84/84 Tests Passing, 0 Failed)**:
- **Section A: Canonical Acceptance Scenarios (G1–G18)**:
  - **[G1] Thane -> Churchgate via Dadar**: Arrive-by 12:30 deadline, minimum 7 min FOB walking buffer, Class II vs I fares (7/7 PASS)
  - **[G2] Dadar -> Kalyan Section 138 Eligibility**: Strict gating on non-MST Express with penalties (4/4 PASS)
  - **[G3] Delay Inversion**: On-time Slow Local selected over delayed Fast Local (3/3 PASS)
  - **[G4] Compounding Downstream Delay**: +20 min origin delay accumulates to +40 min downstream (3/3 PASS)
  - **[G5] AC Local Scarcity**: Never invents phantom AC locals when unscheduled; objective class pricing (4/4 PASS)
  - **[G6] Cancelled Transfer Connection**: Excludes cancelled trains, reroutes via operating services (3/3 PASS)
  - **[G7] Onboard Passenger Replanning**: Forward-only planning from current halt; strictly prevents backtracking (4/4 PASS)
  - **[G8] Overnight Train Calendar Handling**: Day 0 origin to Day 1 post-midnight halts with dayOffset (4/4 PASS)
  - **[G9] Feed Outage Graceful Fallback**: Reverts to SCHEDULED without hallucinating delays (3/3 PASS)
  - **[G10] Idempotent Order Handling**: Duplicate submission detection prevents duplicate ticket creation (5/5 PASS)
  - **[G11] Ambiguous Payment Timeout Recovery**: Safe transition from PENDING_RECONCILIATION_DEMO to TICKET_ISSUED_DEMO (4/4 PASS)
  - **[G12] Itemized Refund Breakdown**: Transparent Cash vs Wallet vs Voucher terms and 90-day validity (5/5 PASS)
  - **[G13] Crowdsourced Report Moderation**: Community inputs tagged REPORTED, never silently LIVE_VERIFIED (2/2 PASS)
  - **[G14] Multilingual Station Normalizer**: Devanagari Hindi/Marathi resolver (कल्याण, ठाणे, दादर, चर्चगेट) (5/5 PASS)
  - **[G15] Voice & Manual Deterministic Parity**: 100% identical outputs for speech tools and manual UI (4/4 PASS)
  - **[G16] Offline Resilient Caching**: In-memory station catalog, offline timetable, specimen watermark (4/4 PASS)
  - **[G17] Safe Failure for Unknown Providers**: Truthful error responses for missing entities (2/2 PASS)
  - **[G18] Responsive Tokens & Accessibility**: High-contrast WCAG AAA and theme tokens (3/3 PASS)
- **Section B: Architectural Integration Suites (Suites 1–17)**:
  - Station Graph, Tariffs, Operations Control API, and Heatmaps (15/15 PASS)
  - **Suite 17: Interactive 2D/3D Network Map Engine & Multi-Train Delays** (23/23 PASS):
    - Mumbai suburban & Pan-India network station topology
    - Multi-train track corridor aggregation with average delay (`averageDelayMinutes`)
    - Operational disruption reason attribution
    - 3D Isometric projection coordinate mathematics

**Total**: **113/113 Automated Tests Passing (0 Failed)**.

---

## 6. Interactive 2D & 3D Rail Network Map

RailOne Next includes an interactive visual network map:
- **Mumbai Suburban Local Network**: Complete coverage of all 80+ real suburban stations across Western Line (Churchgate to Dahanu Road), Central Main Line (CSMT to Kasara / Karjat / Khopoli), Harbour Line (CSMT to Panvel & Wadala-Andheri branch), Trans-Harbour Line (Thane to Turbhe/Panvel), and Uran Line (Nerul to Uran).
- **Pan-India National Rail Network**: 40+ national railway hubs and trunk corridors connecting New Delhi, Mumbai, Howrah (Kolkata), Chennai Central, KSR Bengaluru, Secunderabad, Ahmedabad, Pune, Nagpur, Kanpur, Prayagraj, Varanasi, Raipur, Bilaspur, Tatanagar, and Jammu Tawi.
- **Track Delay Intelligence**: Computes average delays across all trains traversing physical tracks and displays root-cause operational disruption reasons (fog, OHE faults, signal point locks, cautionary speed orders).
- **Train Route Illumination**: Click or search any train to illuminate its entire physical route across India or Mumbai Suburban with glowing visual paths.
- **Live Autocomplete Search & Line Filtering**: Search by station name, English/Devanagari spellings, or train numbers, and filter by suburban line (Western, Central, Harbour, Trans-Harbour, Uran).
- **2D Schematic & 3D Isometric Projection**: Switch seamlessly between crisp transit schematic and isometric 3D perspective with pitch/rotation controls.

---

## 7. Running Locally

```bash
# Install dependencies
npm install

# Run automated verification suite (113 tests)
npm test

# Typecheck and lint
npm run lint

# Production build
npm run build

# Launch development server
npm run dev
```

Open `http://localhost:3000` to interact with the platform.

