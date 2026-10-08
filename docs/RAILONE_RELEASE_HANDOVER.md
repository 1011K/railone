# RailOne Next — Release Handover & Engineering Operations Manual

**Charter Reference**: Section 6 (Execution & Session Persistence Rules)  
**Integration Branch**: `integration/master-reconciliation-2026-10-08`  
**Target Upstream Branch**: `feature/india-multimodal-rebuild`  
**Release Date**: October 8, 2026  

---

## 1. Branch Identity & Integration Lineage

- **Integration Branch**: `integration/master-reconciliation-2026-10-08`
- **Reconciled Checkpoints**:
  - Base Development Branch: `feature/india-multimodal-rebuild` (`f135f87454750eda4df4d3f30e9542c1e3501ce5`)
  - Repair / Fix Branch: `origin/fix/railone-p0-feature-parity-2026-10-08` (`5fd54cc0bec8196d2c1cceac3c1ff0fbc3d6d7a4`)
  - Integration Merge Commit: `07318eb` (`chore(integration): reconcile feature/india-multimodal-rebuild with fix/railone-p0-feature-parity-2026-10-08`)
- **Git Invariant Compliance**:
  - Never pushed to `main`.
  - Zero force-pushes (`--force`).
  - No remote CI runs invoked.
  - Zero unverified code deletions.

---

## 2. Quickstart & Verification Commands

### 1. Environment Setup
```powershell
# Ensure Node.js >= 22.13.0 and npm >= 10.0.0
node -v
npm -v

# Install dependencies (if fresh clone)
npm install
npm --prefix apps/mobile install
```

### 2. Verification Gates
```powershell
# 1. Run complete automated test suite (276/276 tests must pass)
npm test

# 2. Run source-level regression contracts guard (13/13 contracts must pass)
node scripts/check-regression-contracts.mjs

# 3. Verify root TypeScript typecheck (zero errors)
npm run lint

# 4. Verify Vite production client build
npm run build

# 5. Verify Native Mobile Expo typecheck (zero errors)
npm run mobile:lint
```

### 3. Running Web & Mobile Applications Locally
```powershell
# Start Web client and local backend server
npm run dev
# -> Opens http://localhost:5173

# Start Mobile Native Expo packager
npm run mobile:dev
# -> Starts Expo Metro bundler with QR code for Expo Go / iOS Simulator / Android Emulator
```

---

## 3. High-Level Architecture Overview

```
                      +------------------------------------------+
                      |        RailOne Next Web & Mobile         |
                      |  (React 19 / Vite + React Native / Expo) |
                      +--------------------+---------------------+
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
       +-----------v-----------+                       +-----------v-----------+
       |   Multimodal Engine   |                       |    Service Backend    |
       |  (graphEngine.ts)     |                       |  (Express + SQLite3)  |
       +-----------+-----------+                       +-----------+-----------+
                   |                                               |
         +---------+---------+                           +---------+---------+
         |                   |                           |                   |
+--------v-------+  +--------v-------+          +--------v-------+  +--------v-------+
| Suburban Rail  |  | Mumbai Metro   |          | Ticketing /    |  | Rail Yatri     |
| (CR / WR EMU)  |  | (Lines 1,2A,7,3|          | UTS Specimen   |  | Voice Tools    |
+----------------+  +----------------+          +----------------+  +----------------+
```

1. **Multimodal Graph Engine (`src/engine/multimodal/`)**:
   - High-performance, in-memory topological graph connecting 9 transit modes across 8 Indian metropolitan regions.
   - Computes multimodal itineraries with door-to-door first/last mile walk segments and transfer penalty buffers.
2. **Transit Normalization & Station Data (`src/fixtures/railwayData.ts`, `src/engine/stationNormalizer.ts`)**:
   - Resolves station codes, aliases, common misspellings (`ghatkopr`, `gatkopar`), and Devanagari script (`घाटकोपर`).
   - Disambiguates complex twin junctions (Dadar Central `DR` vs Western `DDR`).
3. **Backend Service Engine (`src/backend/modules/`)**:
   - SQLite persistence layer for tickets, wallet transactions, and audit logs.
   - Atomic idempotency checks with normalized passenger profiles.
   - HMAC-SHA256 authenticated sessions with randomized secret keys.
4. **Cinematic & Accessible UI (`src/components/`, `apps/mobile/app/`)**:
   - WCAG 2.1 AAA accessible dialogs and 44px minimum touch targets.
   - Web Audio synthesized electric locomotive horn with user mute persistence.
   - Comprehensive 22-services directory modal with gated official provider links.

---

## 4. Known Limitations & Production Boundaries

1. **Specimen Tickets**: Tickets issued by the application are demonstration specimens with cryptographic watermarks. They cannot be used for travel on real Indian Railway trains without CRIS partnership.
2. **Deterministic Delay Model**: In the absence of live CRIS RTIS satellite telemetry feeds, delays are computed using published timetables and mathematical delay propagation heuristics.
3. **PSTN Telephony**: Rail Yatri voice assistant operates in-app via Web Speech API and Expo Speech. Outbound carrier PSTN telephony requires enterprise SIP trunking.

---

## 5. Recommended Upstream Merge Instructions

When ready to integrate into `feature/india-multimodal-rebuild` or a target release branch:

```powershell
# 1. Switch to target development branch
git checkout feature/india-multimodal-rebuild

# 2. Merge the verified integration branch with a clean merge commit
git merge --no-ff integration/master-reconciliation-2026-10-08 -m "feat(integration): merge master reconciliation with 22 services, station normalization, and full test suite 30"

# 3. Execute verification suite on the merged branch
npm test
node scripts/check-regression-contracts.mjs
npm run lint
npm run build
npm run mobile:lint
```
