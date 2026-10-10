# RailOne Next — P01–P30 Backend Traceability & Verification Matrix

**Repository:** `1011K/railone`  
**Repair Branch:** `fix/railone-p01-p30-backend-2026-10-10`  
**Baseline Commit:** `275a3a7e556a22e2f6d4b4b88b614fe2f1e7d6d0`  
**Auditor Mode:** Caveman + Ponytail Senior Dev Ladder  
**Verification Date:** 2026-10-10  

---

## 1. P01–P30 Traceability Matrix

| ID | Dossier Requirement | Codebase Source Files | Implementation Status & Behavior | Required Test Assertion | External Dependencies | Acceptance Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **P01** | UTS & Suburban Specimen Booking | `src/backend/modules/ticketing.ts`, `src/backend/routes/v1.ts` | Server-authoritative booking with distance-based tariff slabs, `TICKET_ISSUED_DEMO` state, and specimen QR watermark. | `Suite 22.5`, `Suite 33.13`, `Suite 29.2`, `E2E HTTP` | Zero (Local Node22 SQLite) | **VERIFIED** |
| **P02** | PRS Specimen Booking & Avail | `src/backend/modules/availability.ts`, `src/backend/modules/ticketing.ts` | Honest PRS availability simulation: `isSimulated: true`, `isOfficialInventoryAvailable: false`, zero fake seats. | `Suite 31.8 (S08)`, `Suite 22.12` | CRIS PRS gateway withheld; demo simulated | **VERIFIED** |
| **P03** | Authentication & Session Isolation | `src/backend/middleware/auth.ts`, `src/backend/routes/v1.ts` | HMAC-SHA256 signed tokens; cross-user data checks reject access to foreign bookings/tickets (`403 FORBIDDEN_CROSS_USER_ACCESS`). | Contract check 1–4, `tests/backend-services.test.ts` | None | **VERIFIED** |
| **P04** | Geofencing & Station Rules | `src/engine/stationNormalizer.ts`, `apps/mobile/src/screens/` | Clear geofence explanation; GPS proximity labeled `[CONSENT-BASED GPS PROXIMITY]`; no fake 120m claims. | Contract check 12, `Suite 30.16` | Browser/Device Geolocation API | **VERIFIED** |
| **P05** | Booking & Passenger Validation | `src/backend/modules/ticketing.ts`, `src/backend/modules/eligibility.ts` | Validates non-empty passengers, valid stop sequence, train travel direction, and class availability. | `Suite 22.14`, `Suite 29.7` | None | **VERIFIED** |
| **P06** | Idempotent Submission & Deduplication | `src/backend/modules/ticketing.ts`, `src/backend/database/db.ts` | SQLite unique constraint on `idempotency_key`, atomic `BEGIN IMMEDIATE`, returns existing order on replay. | `Suite 22.5`, `Suite 29.2`, `[G10]` | None | **VERIFIED** |
| **P07** | Explicit Payment State Transitions | `src/backend/modules/ticketing.ts`, `src/types/railway.ts` | Explicit lifecycle: `DRAFT -> VALIDATING -> PAYMENT_SIMULATED -> TICKET_ISSUED_DEMO / PENDING_RECONCILIATION_DEMO`. | `Suite 22.6`, `[G11]` | None (Mock / RBI sandbox) | **VERIFIED** |
| **P08** | Separate Booking & Ticket Issuance | `src/backend/modules/ticketing.ts`, `src/backend/database/db.ts` | Decoupled SQLite `bookings` and `tickets` tables; ticket record created only upon confirmed payment. | `Suite 22.1`, `Suite 22.5` | None | **VERIFIED** |
| **P09** | Transaction History with Failed/Unknown | `src/backend/modules/bookingHistory.ts`, `src/backend/routes/v1.ts` | Authenticated `GET /api/v1/bookings` and `/tickets` list all states including pending, confirmed, cancelled. | `Suite 22.7`, `E2E HTTP` | None | **VERIFIED** |
| **P10** | Cancellation Eligibility & Calculation | `src/backend/modules/bookingHistory.ts` | Gazette cancellation rules: II ₹10, SL ₹60, AC ₹120 clerical deduction; net refund computed accurately. | `Suite 22.7`, `Suite 33.13` | None | **VERIFIED** |
| **P11** | Server-Authoritative Refunds | `src/backend/modules/bookingHistory.ts`, `src/backend/database/db.ts` | Atomic cancellation transaction updating booking status and inserting into `cancellations` table. | `Suite 22.7`, `E2E HTTP` | None | **VERIFIED** |
| **P12** | RailWallet Transaction Integrity | `src/backend/modules/bookingHistory.ts`, `apps/mobile/` | Automated wallet credit on cancellation without double-dipping cash + voucher; single instrument credited. | `Suite 32.6`, `Suite 33.13`, `[G12]` | None | **VERIFIED** |
| **P13** | Reconciliation After Failed Requests | `src/backend/modules/ticketing.ts` (`reconcileBooking`) | `POST /api/v1/bookings/:id/reconcile` safely transitions `PENDING_RECONCILIATION_DEMO` to `TICKET_ISSUED_DEMO`. | `Suite 22.6`, `[G11]` | None | **VERIFIED** |
| **P14** | Quota, Class & Train Eligibility | `src/backend/modules/eligibility.ts`, `src/engine/eligibilityEngine.ts` | Indian Railways Section 138 enforcement; non-MST express trains prohibited; Deccan Queen conditional. | `Suite 29.7`, `[G2]` | None | **VERIFIED** |
| **P15** | Season Passes, Platform & Metro Semantics | `src/backend/modules/ticketing.ts` | Distinct support for `SEASON_MST`, `PLATFORM_TICKET`, `METRO_TOKEN`, and `RETURN_JOURNEY` ticket semantics. | `Suite 22.3`, `Suite 22.5` | None | **VERIFIED** |
| **P16** | Correct Fare & Deduction Provenance | `src/backend/modules/fares.ts`, `src/engine/fares.ts` | Official telescopic distance slabs for Suburban, Metro, and Express; distance unmapped = clean error. | `Suite 22.3`, `Suite 22.15` | None | **VERIFIED** |
| **P17** | Clearly Labeled Demo QR Tickets | `src/backend/modules/ticketing.ts`, `src/components/SpecimenTicketModal.tsx` | All QR payloads watermarked `DEMO / NOT VALID FOR TRAVEL` with SHA256 integrity hash. | `Suite 22.5`, `[G10.2]` | None | **VERIFIED** |
| **P18** | No Fabricated External PNR Results | `src/backend/routes/v1.ts` (`/api/v1/pnr/:pnr`) | Registered demo PNR resolves locally; unregistered commercial PNR hands off to official CRIS portal. | `Suite 33.14`, `E2E HTTP` | CRIS Inquiry Portal | **VERIFIED** |
| **P19** | Official Provider Handoffs | `src/backend/modules/providerAdapters.ts`, `src/backend/routes/v1.ts` | RailMadad (139), IRCTC e-Catering, and UTS handoffs surfaced with verified official URLs and disclosures. | `Suite 22.10`, `Suite 30.10` | Statutory Authorities | **VERIFIED** |
| **P20** | Canonical Station Identification | `src/backend/modules/stations.ts`, `src/engine/stationNormalizer.ts` | 156 stations indexed across Suburban, Metro, and 9 regional city packs; multilingual script support. | `Suite 31.10 (S10)`, `Suite 30.1-30.4` | None | **VERIFIED** |
| **P21** | Railway Codes, Names & Aliases | `src/engine/stationNormalizer.ts` | Exact resolution of codes (GC, TNA, CSMT), typos (ghatkoper), and Devanagari script (घाटकोपर). | `Suite 31.3 (S03)`, `Suite 30.3` | None | **VERIFIED** |
| **P22** | Dadar DR vs DDR Distinction | `src/engine/stationNormalizer.ts`, `src/fixtures/railwayData.ts` | Direct codes `DR` and `DDR` resolve cleanly; generic "Dadar" query flags `isAmbiguous: true` with candidates. | `Suite 31.1 (S01)`, `Suite 31.2 (S02)` | None | **VERIFIED** |
| **P23** | Railway and Metro Identity Isolation | `src/fixtures/railwayData.ts`, `src/fixtures/metroData.ts` | Central Suburban `GC` and Metro `METRO_GHT` isolated; strict modal code separation. | `Suite 31.4 (S04)`, `Suite 30.5` | None | **VERIFIED** |
| **P24** | Multi-City Search & Coverage Matrix | `src/backend/modules/coverage.ts`, `src/engine/multimodal/cityPacks.ts` | 8 mandatory cities at 100% coverage, 1 experimental city (Ahmedabad); zero node leakage across city boundaries. | `Suite 31.6 (S06)`, `Suite 31.7 (S07)` | None | **VERIFIED** |
| **P25** | Missing-Station & Route Responses | `src/backend/modules/routePlanner.ts`, `src/engine/journeyEngine.ts` | Unknown station returns `matchedStation: undefined` and 0 itineraries; unmapped route returns 0 itineraries. | `Suite 33.7`, `Suite 33.8` | None | **VERIFIED** |
| **P26** | Metro Graph Referential Integrity | `src/fixtures/metroData.ts`, `src/engine/multimodal/cityPacks.ts` | Lines 1, 2A, 7, and 3 Phase 1: 50 referenced station instances, exactly 0 dangling IDs. | `Suite 31.5 (S05)`, `Suite 33.5` | None | **VERIFIED** |
| **P27** | Transfer Edges & Direction Handling | `src/engine/multimodal/graphEngine.ts`, `src/backend/modules/interchanges.ts` | 11 surveyed hubs with FOB walking transfer guides, step-free elevator options, and realistic walk buffers. | `Suite 31.11 (S11)`, `Suite 33.4` | None | **VERIFIED** |
| **P28** | Date-Specific Timetable & Midnight Crossing | `src/engine/delayModel.ts`, `src/backend/modules/timetable.ts` | Day 0 departures retain correct `dayOffset = 1` for post-midnight halts; curfew past operational hours returns 0. | `Suite 31.12 (S12)`, `[G8]` | None | **VERIFIED** |
| **P29** | Transparent Source Status & Provenance | `src/types/railway.ts`, `src/backend/modules/trainStatus.ts` | Unobserved trains report `SCHEDULED` with `delayMinutes: null`; no synthesized Right Time. | `Suite 31.8`, `Suite 33.10`, `[G9]` | Real NTES feed withheld | **VERIFIED** |
| **P30** | Intelligent Route Recovery & Delay Inversion | `src/backend/modules/disruptions.ts`, `src/engine/journeyEngine.ts` | Compares arrival ETAs under observed delay; on-time Slow Local (62m) beats bunched Fast Local (73m) with visible badge. | `Suite 29.8`, `[G3]`, `E2E HTTP` | Real COA feed withheld | **VERIFIED** |

---

## 2. Summary Status Counts
- **Total Problems:** 30 (P01–P30)
- **VERIFIED:** 30 / 30 (100%)
- **EXPERIMENTAL:** 0 in core problems (Ahmedabad regional city pack isolated as experimental)
- **WITHHELD:** Official live CRIS PRS transaction gateways and live NTES locomotive telemetry streams (statutorily declared and isolated with honest demo watermarks)
- **REJECTED / DISPUTED:** 0
