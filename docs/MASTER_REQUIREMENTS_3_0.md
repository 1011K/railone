# RailOne Next 3.0 — Master Requirements Specification

## 1. Executive Summary & Mission
RailOne Next 3.0 is a sovereign, accessible, and mathematically deterministic passenger rail intelligence and ticketing platform for Indian Railways and the Mumbai Suburban Network. It eliminates data fabrication, enforces statutory travel eligibility rules (Railways Act 1989), models real physical platform and Foot-Over-Bridge (FOB) connectivity, and delivers high-performance 2D/3D topological navigation.

---

## 2. System Architecture & Operating Principles

### 2.1 Non-Negotiable Core Tenets
1. **Zero Data Fabrication**: Never synthesize fake train numbers, hallucinated delays, or non-existent platform connections. If telemetry is absent, status defaults to `SCHEDULED` or `UNKNOWN`.
2. **Deterministic Parity**: Manual UI, voice queries (`RailSathi`), and automated API requests execute identical underlying business logic (`src/engine/voiceTools.ts`).
3. **Physical Graph Realism**: Suburban and national station graphs reflect true platform separations (e.g. Dadar Western PF 1–7 vs. Central PF 1–8) and actual Foot-Over-Bridge physical connections.
4. **Legality Over Optimism**: Prohibit illegal short-hop bookings on Mail/Express trains (Section 138) and season ticket travel on barred intercity trains.
5. **Strict Specimen Watermarking**: In offline/simulator modes, all tickets, QR codes, and receipts are unambiguously watermarked `DEMO / NOT VALID FOR TRAVEL`.

---

## 3. Functional Requirements Matrix

### 3.1 Time-Dependent Journey Engine (`C1`, `C2`)
- **Multi-Line Graph Routing**: Western, Central Main, Harbour, Trans-Harbour, and Uran branch lines.
- **Interchange Walk Time Penalties**: Physical FOB transfer times (e.g. Dadar 7 minutes, Kurla 6 minutes, Thane 6 minutes) calculated before ranking itineraries.
- **Delay Inversion Logic**: When a Fast Local suffers severe signal or track congestion (+20m delay), an operating Slow Local is mathematically elevated to recommended status.
- **Onboard Re-Planning**: When a commuter is already in transit (e.g. at Kurla), origin is clamped to current halt; backwards or circular routes are strictly pruned.
- **Service Date & Midnight Crossing**: Trips crossing midnight have `dayOffset = 1` and reflect correct service calendar validity.

### 3.2 Statutory Eligibility & Dynamic Fares (`C5`, `C7`)
- **Section 138 Penalties Enforcement**: Rejects non-MST express boarding for suburban journeys (Dadar to Kalyan) unless legitimate general unreserved accommodation (GS) is authorized.
- **Distance-Based Official Tariffs**:
  - Suburban Second Class (II): 10km (₹5), 35km (₹10), 55km (₹15).
  - Suburban First Class (I): 35km (₹105).
  - AC EMU Local: 35km (₹95).
  - Express Second Sitting (2S): Distance-graduated minimum fares.
- **Two-Leg Fare Summation**: Sums independent leg tariffs across interchange journeys rather than applying flat arbitrary amounts.

### 3.3 Observation Provenance & Real-Time Intelligence (`C3`, `C4`)
- **Explicit Provenance Enum**:
  - `LIVE_VERIFIED`: Confirmed GPS/signalling feed from official operations control.
  - `SCHEDULED`: Published official timetable.
  - `HISTORICAL`: Historical punctuality statistics.
  - `PREDICTED`: Compounding delay progression calculation (+20m at origin compounds to +40m downstream).
  - `REPORTED`: Crowdsourced passenger reports (sandboxed namespace; never promotes automatically to `LIVE_VERIFIED`).
  - `DEMO`: Controlled educational simulation fixture.
  - `UNKNOWN`: Feeds offline or unmonitored.
- **Freshness & Expiry**: Stale timestamps are visibly flagged with amber warning indicators.

### 3.4 Specimen Ticketing & Transaction State Machine (`C5`, `C6`)
- **Deterministic State Machine**:
  `DRAFT` → `VALIDATING` → `PAYMENT_SIMULATED` → `TICKET_ISSUED_DEMO`
  - Timeout state: `PENDING_RECONCILIATION_DEMO`.
  - Cancellation state: `CANCELLED_DEMO`.
- **Idempotency**: Client-generated `idempotencyKey` prevents duplicate charge/ticket creation on double-tap.
- **Refund Engine**: Explicit itemized refund calculation (Instant Wallet credit, 3–5 day bank gateway return, or 90-day travel voucher credit).

### 3.5 Interactive 2D Schematic & 3D Isometric Network Maps (`C10`)
- **Full Network Coverage**: 80+ suburban stations and 40+ national trunk hubs.
- **Corridor Delay Aggregation**: Averages delays across all trains traversing shared track segments (e.g. Kurla–Dadar congestion bottleneck) with operational root-cause explanations (OHE trip, signal failure, fog speed orders).
- **Train Route Illumination**: Highlights all intermediate stations and segments for selected train.
- **Multilingual Search**: Live Devanagari Hindi/Marathi search for stations and train numbers.

### 3.6 3D Station Navigation & God's Eye Topological Engine (`C9`)
- **Elevation Separation**: Level 0 (Platforms/Tracks), Level 1 (FOBs/Concourses), Level 2 (Elevated Skywalks/SATIS decks).
- **Physical FOB Transfer Pathfinder**: Computes authentic pedestrian walking routes between platforms across physical Foot-Over-Bridges.
- **Step-Free Accessibility Pathfinder**: Prioritizes elevator-equipped bridges for Divyangjan and elderly commuters; alerts commuter when step-free routes are unavailable.
- **Touch & Gesture Controls**: Pan, zoom slider, reset, and responsive scaling for mobile viewports (down to 375px).

### 3.7 RailSathi Multilingual Voice Assistant (`C13`)
- **Deterministic Parity**: Calls exact backend tools (`searchTrains`, `getLiveStatus`, `validateEligibility`, `quoteFare`, `createBookingDraft`).
- **Languages**: English, Hindi, and Marathi normalization.
- **Safe Fallback**: Reports unmonitored or unindexed status truthfully without conversational hallucination.

---

## 4. Non-Functional & Institutional Requirements

### 4.1 Accessibility & Design System
- **WCAG 2.1 AAA / GIGW 3.0**: Minimum 7:1 contrast on high-contrast themes, 4.5:1 on standard themes.
- **Minimum Touch Targets**: 44×44px with 8px margin of separation.
- **ASTRA Livery Palettes**: 8 accessible themes (CR Blue, WR Western Crimson, Konkan Emerald, Tejas Amber, Vande Bharat Platinum, Deccan Indigo, High-Contrast AAA, Dark Mode).

### 4.2 Security & Data Privacy (DPDP Act 2023)
- **Zero Client Secrets**: No third-party API keys or banking credentials stored in bundle.
- **OWASP Compliance**: Parameterized inputs, regex sanitization, XSS mitigation via React virtual DOM escaping.
- **Specimen Isolation**: LocalStorage specimen tickets isolated and purgeable.

---

## 5. Acceptance Verification Gates
- **Unit & Integration Suite**: 135/135 passing assertions across `tests/run-all-tests.ts`.
- **Static Analysis**: 0 TypeScript errors under `tsc --noEmit`.
- **Production Build**: Clean Vite bundle under 1 second.
- **Version Control**: Atomic verified git commits pushed cleanly to canonical remote `1011K/railone`.
