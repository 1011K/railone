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

The suite tests all P0 boundary conditions:
```bash
npm test
```
**Results**:
- **Test Suite 1**: Station Graph & Alias Normalization (5/5 PASS)
- **Test Suite 2**: Boarding Eligibility & Short-Hop Express Constraints (7/7 PASS)
- **Test Suite 3**: Downstream Delay Propagation (4/4 PASS)
- **Test Suite 4**: Delay Inversion Detection (4/4 PASS)
- **Test Suite 5**: Origin Delay & Leave-Home Engine (4/4 PASS)
- **Test Suite 6**: Multi-Leg Interchange Transfer Feasibility (5/5 PASS)
- **Test Suite 7**: Categorical Crowding Estimation (4/4 PASS)
- **Test Suite 8**: Official Suburban & Express Fare Tariffs (6/6 PASS)
- **Test Suite 9**: Voice & UI Deterministic Tool Contract (13/13 PASS)
- **Test Suite 10**: Missing Data Fallback (2/2 PASS)

**Total**: **54/54 Tests Passing (0 Failed)**.

---

## 6. Running Locally

```bash
# Install dependencies
npm install

# Run automated verification suite
npm test

# Launch development server
npm run dev
```

Open `http://localhost:3000` to interact with the platform.
