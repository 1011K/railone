# RailOne Next — Team Handover & Architectural Guide

## 1. Project Mission & Architectural Philosophy

RailOne Next is an independent, multimodal journey planning and passenger assistance platform built specifically for Indian urban commuters and regional rail travellers.

The system adheres strictly to:
1. **Zero Data Fabrication**: Live telemetry is only presented when supported by authentic observations. Unobserved feeds display `"Unavailable (No Live Observation)"` rather than fictitious punctuality.
2. **Statutory Integrity**: Indian Railways regulations (e.g. Railways Act 1989 Sections 137 & 138 amended June 2026, ₹500 statutory minimum penalty) are strictly enforced.
3. **State Emblem of India Act 2005 Compliance**: No unauthorized state crests, Lion Capitals, or false claims of Indian Government affiliation. Specimen tickets are explicitly watermarked `DEMO – NOT VALID FOR TRAVEL`.
4. **Deterministic Graph Routing**: Clean TypeScript graph traversal algorithms without heavy black-box daemons (e.g. OTP/MOTIS) or vendor lock-in.

---

## 2. Directory & Module Map

| Directory / File | Mandate & Contents |
| :--- | :--- |
| `src/engine/multimodal/` | **Multimodal Routing Core**: Types (`types.ts`), typed provider adapters (`adapters.ts`), 8 city packs (`cityPacks.ts`), and graph routing engine (`graphEngine.ts`). |
| `src/backend/middleware/auth.ts` | **Passenger Security**: HMAC-SHA256 token issuance and verification, cross-user ownership guards, and session authentication. |
| `src/backend/modules/ticketing.ts` | **Ticketing & Ledger**: Atomic SQLite transactions (`BEGIN IMMEDIATE;` ... `COMMIT;`) with idempotency key deduplication. |
| `src/backend/modules/bookingHistory.ts` | **Booking Management**: Authenticated ticket listing, atomic cancellations, and itemized refund ledgers. |
| `src/backend/routes/v1.ts` | **REST API**: Protected endpoints for routes, timetable, live tracking, multimodal planner, and bookings. |
| `src/components/NetworkMapViewer.tsx` | **Synchronized Map System**: Toggle between Topological Schematic Diagram and Real-World Geographical Coordinates with station entrance waypoints. |
| `src/components/SpecimenTicketModal.tsx` | **Specimen Visualizer**: Watermarked demo tickets with encrypted QR payloads and statutory legal disclosures. |
| `apps/mobile/` | **Native Mobile App**: Expo Router application with durable local storage, offline vector caches, and 360px viewport resilience. |
| `tests/run-all-tests.ts` | **Verification Test Suite**: 29 automated test suites executing continuous regression gates. |

---

## 3. Security & Authorization Architecture

- **HMAC-SHA256 Passenger Tokens**: Issued via `POST /api/v1/auth/token` with 7-day expiration and passenger ID payload.
- **Cross-User Protection**: Endpoints `/bookings`, `/bookings/:id`, `/bookings/:id/reconcile`, `/tickets`, `/tickets/:id`, `/tickets/:id/cancel`, `/passengers/:id`, and `/notifications` verify that `req.authenticatedPassengerId === resource.passengerId`. Mismatches immediately return `403 FORBIDDEN_CROSS_USER_ACCESS`.
- **Atomic Transactions**: SQLite database writes use explicit transactions with rollbacks and unique idempotency constraints to prevent duplicate bookings or corrupt refund states upon network retries.

---

## 4. Multimodal Routing Engine

The engine supports 9 transit modes across 8 urban agglomerations:
1. **Suburban Rail (EMU)**: Central, Western, Harbour, Trans-Harbour, Sealdah, Howrah, Chennai, Bengaluru, MMTS.
2. **Intercity Rail (PRS)**: Mail/Express, Superfast, Vande Bharat.
3. **Urban Metro**: Mumbai Metro (Lines 1, 2A, 3, 7), DMRC, Namma Metro, Kolkata Metro, Pune Metro, CMRL, Hyderabad Metro, Ahmedabad Metro.
4. **Regional Rapid Rail**: NCRTC Namo Bharat (RRTS).
5. **Monorail**: Mumbai Monorail Line 1 (Chembur–Jacob Circle).
6. **Public City Buses**: BEST, DTC, BMTC, PMPML, MTC, TSRTC, AMTS.
7. **Feeder Shuttles**: Last-mile airport and rail feeder connections.
8. **On-Demand Auto & Taxi**: Regulated RTO metered fares with Kaali-Peeli and autorickshaw slabs.
9. **Passenger Ferries**: M2M Ro-Pax Mandwa, Hooghly river ferries, and water metro connections.

### Key Heuristic Invariants
- **Express Advantage Threshold**: Defaults to 15 minutes (`expressAdvantageThresholdMinutes: 15`). Express trains saving <15 min over suburban local between the same station pair (e.g. Dadar–Kalyan) are not promoted as `⭐ BEST`, and the higher fare and MST ineligibility are explicitly surfaced.
- **Delay Inversion**: If live delays indicate a delayed fast local will reach a destination later than an on-time slow local, the slow local is promoted as the delay inversion winner.
- **Step-Free Accessibility**: When `accessibleStepFree: true` is requested, paths crossing non-step-free stairs, gangways, or unequipped FOBs are excluded.

---

## 5. Development Etiquette & Release Gating

- **Branching Policy**: Work on `feature/india-multimodal-rebuild`. Never push directly to `main`.
- **Quality Gates**: All 248+ tests in `tests/run-all-tests.ts` must pass green before opening pull requests.
- **Dependency Minimality**: Do not add external npm packages unless strictly necessary. Use native Node.js capabilities and standard library utilities first.
