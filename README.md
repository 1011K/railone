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
**Results (127/127 Tests Passing, 0 Failed, 100% Pass Rate)**:
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
- **Section B: Architectural Integration Suites (Suites 1–18)**:
  - **Suite 1**: Station Graph & Alias Normalization (5/5 PASS)
  - **Suite 8**: Official Suburban & Express Fare Tariffs (6/6 PASS)
  - **Suite 13**: Network Service Alerts & OCC Operations API (2/2 PASS)
  - **Suite 16**: Visual Route Delay & Congestion Heatmap Engine (2/2 PASS)
  - **Suite 17**: Interactive 2D/3D Network Map Engine & Multi-Train Delays (29/29 PASS)
  - **Suite 18**: 3D Station Navigation, God's Eye Topological Layouts & FOB Transfer Routing (14/14 PASS)

**Total**: **127/127 Automated Tests Passing (0 Failed)**.

---

## 6. Interactive 2D/3D Rail Network Map & God's Eye Station Navigation

RailOne Next includes rich spatial transit visualization:
- **Mumbai Suburban Local Network**: Complete coverage of all 80+ real suburban stations across Western Line (Churchgate to Dahanu Road), Central Main Line (CSMT to Kasara / Karjat / Khopoli), Harbour Line (CSMT to Panvel & Wadala-Andheri branch), Trans-Harbour Line (Thane to Turbhe/Panvel), and Uran Line (Nerul to Uran).
- **Pan-India National Rail Network**: 40+ national railway hubs and trunk corridors connecting New Delhi, Mumbai, Howrah (Kolkata), Chennai Central, KSR Bengaluru, Secunderabad, Ahmedabad, Pune, Nagpur, Kanpur, Prayagraj, Varanasi, Raipur, Bilaspur, Tatanagar, and Jammu Tawi.
- **Track Delay Intelligence**: Computes average delays across all trains traversing physical tracks and displays root-cause operational disruption reasons (fog, OHE faults, signal point locks, cautionary speed orders).
- **Train Route Illumination**: Click or search any train to illuminate its entire physical route across India or Mumbai Suburban with glowing visual paths.
- **3D God's Eye Station Navigation (`StationGodsEyeModal.tsx`)**:
  - Interactive multi-level 3D station models for major junctions (Dadar, CSMT, Thane, Andheri, Kalyan, New Delhi).
  - True elevation separation: Level 0 Platforms & Tracks, Level 1 Foot-Over-Bridges & Concourses, Level 2 Elevated Skywalks (Andheri Metro Line 1, Thane SATIS bus deck).
  - Foot-Over-Bridge Transfer Pathfinder with step-by-step turns and realistic walk times (e.g. Dadar Western PF 1 to Central PF 4 via North FOB).
  - Step-Free Accessible route filter prioritizing elevator-equipped bridges.
  - Live platform occupancy visualization and amenities locator (ATVMs, Lifts, Escalators, RPF Police, Medical Centers).

---

## 7. Institutional Documentation Library

All formal specifications are archived in the `docs/` directory:
- [International Benchmark Matrix](file:///c:/Users/mishka/Desktop/RailOne/docs/INTERNATIONAL_BENCHMARK_MATRIX.md): Benchmarking against JR East, TfL, SBB, SNCF, MTA, and Singapore LTA.
- [Competitor Problem-to-Solution](file:///c:/Users/mishka/Desktop/RailOne/docs/COMPETITOR_PROBLEM_TO_SOLUTION.md): Root-cause solutions for public review complaints (RailOne, IRCTC, UTS, Yatri, m-Indicator, ConfirmTkt).
- [GitHub Integration Register](file:///c:/Users/mishka/Desktop/RailOne/docs/GITHUB_INTEGRATION_REGISTER.md): Legal and security audit of 29 candidate repositories under "Integrate, Don't Collect".
- [Government Readiness](file:///c:/Users/mishka/Desktop/RailOne/docs/GOVERNMENT_READINESS.md): Statutory compliance with Railways Act 1989 Section 138, DPDP Act 2023, and Rajbhasha policies.
- [Security & Accessibility Evidence](file:///c:/Users/mishka/Desktop/RailOne/docs/SECURITY_ACCESSIBILITY_EVIDENCE.md): OWASP Top 10 mitigation and WCAG 2.1 AAA luminance contrast verification.
- [System Architecture](file:///c:/Users/mishka/Desktop/RailOne/docs/SYSTEM_ARCHITECTURE.md): Asia/Kolkata timezone handling and deterministic engine contracts.
- [Disruption & Delay Recovery](file:///c:/Users/mishka/Desktop/RailOne/docs/DISRUPTION_DELAY_RECOVERY.md): Mathematical compounding delay propagation and OCC reason attribution.
- [3D Station Navigation Spec](file:///c:/Users/mishka/Desktop/RailOne/docs/STATION_3D_NAVIGATION_SPEC.md): Platform topology and multi-level FOB pathfinder algorithms.
- [Ticketing State Machine](file:///c:/Users/mishka/Desktop/RailOne/docs/TICKETING_STATE_MACHINE.md): Idempotency keys and ambiguous timeout reconciliation.
- [Passenger Convenience Guide](file:///c:/Users/mishka/Desktop/RailOne/docs/PASSENGER_CONVENIENCE_GUIDE.md): RPF safety, coach alignment, and RailMadad grievance assistant.
- [RailSathi Voice Assistant](file:///c:/Users/mishka/Desktop/RailOne/docs/VOICE_ASSISTANT_SPEC.md): 100% deterministic function parity between voice and UI.
- [ASTRA Design Tokens](file:///c:/Users/mishka/Desktop/RailOne/docs/ASTRA_DESIGN_TOKENS.md): 8 accessible Indian Railway livery themes and mobile ergonomics.
- [Offline PWA Deployment](file:///c:/Users/mishka/Desktop/RailOne/docs/OFFLINE_PWA_DEPLOYMENT.md): Service Worker caching and standalone PWA manifest.
- [Testing & Quality Gates](file:///c:/Users/mishka/Desktop/RailOne/docs/TESTING_AND_QUALITY_GATES.md): Complete automated test suites and continuous quality gates.

---

## 8. Running Locally

```bash
# Install dependencies
npm install

# Run automated verification suite (127 tests)
npm test

# Typecheck and lint
npm run lint

# Production build
npm run build

# Launch development server
npm run dev
```

Open `http://localhost:3000` to interact with the platform.

