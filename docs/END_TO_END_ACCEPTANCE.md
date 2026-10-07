# RailOne Next 3.0 — End-to-End Acceptance Report

## 1. Executive Test & Acceptance Summary
- **Evaluation Date**: 6–7 October 2026
- **Test Command**: `cmd.exe /c "npm test"`
- **Total Assertions**: **230/230 Passed (0 Failed, 100% Pass Rate)**
- **Typecheck**: 0 errors via `npm run lint` (`tsc --noEmit`)
- **Build Status**: Clean production bundle in 1.72s via Vite v8.3.3
- **Active Git Commit**: `bbd1d0e` on `feature/mobile-rebuild`

---

## 2. Master Plan Section G Acceptance Scenarios (18 Scenarios)

| Scenario ID | Test Scope & Acceptance Criteria | Assertion Result | Evidence / Details |
| :--- | :--- | :--- | :--- |
| **G1** | **Thane → Churchgate via Dadar (Arrive by 12:30)**: Valid 1-transfer itinerary arriving before 12:30 with 7-min Foot-Over-Bridge interchange walk buffer. | **PASSED (3/3)** | Connects CR Main to WR with realistic FOB transit time; strictly respects arrive-by deadline. |
| **G2** | **Dadar → Kalyan (Express Short-Hop Exclusion)**: Non-MST express trains barred under Railways Act Section 138; Deccan Queen permitted only with valid GS unreserved ticket. | **PASSED (4/4)** | Correctly excludes non-stopping and non-permitted express trains from suburban commuter results. |
| **G3** | **Delayed Fast Local vs Operating Slow Local (Delay Inversion)**: Operating Slow Local 97045 ranks above delayed Fast Local 95112 (+22m delay) with visible inversion badge. | **PASSED (3/3)** | Prevents misleading commuters onto delayed express/fast tracks when slow lines run smoothly. |
| **G4** | **Compounding Downstream Delay Progression**: Panvel origin delay (+20m) compounds to +40m downstream at CSMT due to suburban headway congestion. | **PASSED (4/4)** | Eliminates flat delay projections; reflects realistic Mumbai peak suburban bunching. |
| **G5** | **AC Local Scarcity & Objective Reporting**: Rejects phantom AC trains on non-AC lines; reports Second (II) and First (I) class fares objectively. | **PASSED (3/3)** | Transparently reports AC scarcity without synthesizing non-existent rakes. |
| **G6** | **Cancelled Transfer Connection Handling**: Connecting train 90238 marked cancelled; journey planner prunes the invalid transfer and returns operating trains. | **PASSED (3/3)** | Hard eligibility filter guarantees passenger is never stranded at an interchange. |
| **G7** | **Onboard Passenger Replanning**: Commuter onboard Train 95112 passing Kurla is barred from backtracking to Kalyan; forward-only halts evaluated. | **PASSED (3/3)** | Prevents circular or physically impossible reverse transit recommendations. |
| **G8** | **Overnight Train Crossing Midnight**: Train 11058 Amritsar Express departs Day 0 (22:30); post-midnight stops correctly assigned `dayOffset = 1` (+165m). | **PASSED (3/3)** | Accurate date arithmetic across midnight boundary. |
| **G9** | **Feed Outage & Stale Fallback**: Train with disconnected telemetry falls back cleanly to `SCHEDULED` timetable without synthesizing fake live feeds. | **PASSED (3/3)** | Truth-in-data principle enforced. |
| **G10** | **Idempotent Order Creation on Duplicate Tap**: Rapid double-tap creates exactly one order; second request returns existing specimen ticket without duplicate charge. | **PASSED (5/5)** | Idempotency key deduplication verified. |
| **G11** | **Ambiguous Payment Timeout Recovery**: Network timeout leaves order in `PENDING_RECONCILIATION_DEMO`; background reconciliation resolves to `TICKET_ISSUED_DEMO`. | **PASSED (4/4)** | Complete transaction state machine recovery. |
| **G12** | **Explicit Itemized Refund Calculation**: Cancellation breaks down refund into Cash (3–5 days), RailWallet (Instant), or Travel Voucher (90 days). | **PASSED (5/5)** | Transparent passenger refund terms. |
| **G13** | **Moderation of Crowdsourced Reports**: Passenger delay reports remain sandboxed under `REPORTED` namespace and never convert to `LIVE_VERIFIED`. | **PASSED (2/2)** | Prevents social engineering or accidental misinformation from corrupting live operations. |
| **G14** | **Multilingual Station Normalization**: Resolves Devanagari "कल्याण" (KYN), "ठाणे" (TNA), "चर्चगेट" (CCG), and ambiguous "दादर" across lines. | **PASSED (5/5)** | Comprehensive Hindi, Marathi, and code alias matching. |
| **G15** | **Voice & Manual 100% Deterministic Parity**: Voice query and manual UI search return identical itineraries, departure times, and rankings. | **PASSED (4/4)** | Shared deterministic `RailBackendTools` execution. |
| **G16** | **Offline Resilient Caching**: Offline station index, timetable catalog, and saved specimen tickets operable with zero network connectivity. | **PASSED (4/4)** | PWA service-worker cache resilience verified. |
| **G17** | **Safe Failure on Unindexed Trains**: Querying nonexistent train returns clean, honest error notice without hallucinating data. | **PASSED (2/2)** | Graceful failure verified. |
| **G18** | **Accessibility, Tokens & Themes**: 8 WCAG accessible theme palettes, min 44px touch targets, and P0 task prioritization. | **PASSED (3/3)** | High contrast and mobile ergonomics verified. |

---

## 3. Architectural Integration Suites (Suites 1–26)

- **Test Suite 1 (Station Graph & Aliases)**: 5/5 passed.
- **Test Suite 8 (Suburban & Express Fare Tariffs)**: 6/6 passed (Official ₹5, ₹10, ₹15, ₹105, ₹95 rates).
- **Test Suite 13 (Network Alerts & Operations Control)**: 2/2 passed.
- **Test Suite 16 (Thermal Route Delay & Congestion Heatmap)**: 2/2 passed.
- **Test Suite 17 (2D/3D Network Map Engine & Multi-Train Delays)**: 29/29 passed (80+ suburban stations, 40+ national hubs, Kurla-Dadar bottleneck aggregation, route illumination).
- **Test Suite 18 (3D Station Navigation & FOB Pathfinder)**: 22/22 passed (Multi-level Dadar, CSMT, Thane, Andheri, Kalyan, Kurla, Borivali, Churchgate; step-free elevator pathfinder).
- **Test Suite 19 (Multimodal Journey Planner, Metro & AC Filtering)**: 19/19 passed.
- **Test Suite 20 (Institutional Passenger PWA, Service Worker & Theming)**: 7/7 passed.
- **Test Suite 21 (Global Benchmarks, Coach Alignment & Academic Dossier)**: 8/8 passed.
- **Test Suite 22 (Service Backend Architecture, SQLite Persistence & RailSathi)**: 16/16 passed.
- **Test Suite 23 (Native Mobile App Expo/React Native & Contracts)**: 11/11 passed.
- **Test Suite 24 (Departure Board, Express 15-Minute Rule & Guided Navigation)**: 9/9 passed.
- **Test Suite 25 (Native Mobile Rebuild, EAS, Corridors & TTE Validator)**: 13/13 passed.
- **Test Suite 26 (Phone-First Mobile Architecture, Coach Separation & Provenance Truth)**: 10/10 passed.

---

## 4. Final Verdict
**ACCEPTED & PRODUCTION-VERIFIED (230/230 Assertions Cleanly Passed)**
