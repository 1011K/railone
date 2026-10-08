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
# 1. Run complete automated test suite (282/282 tests must pass)
npm test

# 2. Run source-level regression contracts guard (13/13 contracts must pass)
node scripts/check-regression-contracts.mjs

# 3. Verify root TypeScript typecheck (zero errors)
npm run lint

# 4. Verify Vite production client build
npm run build

# 5. Verify Native Mobile Expo typecheck (zero errors)
npm run mobile:lint

# 6. Verify Native Mobile Expo Doctor diagnostics (18/18 checks must pass)
npm run mobile:doctor

# 7. Verify Native Mobile Web Export Bundle
npm run mobile:build-web
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
   - High-performance, in-memory topological graph connecting 9 transit modes across 9 Indian metropolitan regions (Mumbai, Pune, Delhi NCR, Bengaluru, Kolkata, Chennai, Hyderabad, Kochi, Ahmedabad–Gandhinagar).
   - Computes multimodal itineraries with door-to-door first/last mile walk segments, transfer penalty buffers, and suburban AC Local fast EMU filtering.
2. **Transit Normalization & Station Data (`src/fixtures/railwayData.ts`, `src/engine/stationNormalizer.ts`)**:
   - Resolves station codes, aliases, common misspellings (`ghatkopr`, `gatkopar`), and Devanagari script (`घाटकोपर`).
   - Disambiguates complex twin junctions (Dadar Central `DR` vs Western `DDR`).
3. **Backend Service Engine (`src/backend/modules/`)**:
   - SQLite persistence layer for tickets, wallet transactions, and audit logs.
   - Atomic idempotency checks with normalized passenger profiles.
   - Cryptographically randomized session authentication rejecting forged and expired HMAC tokens.

---

## 4. Upstream Integration & Merge Recommendation

The integration branch `integration/master-reconciliation-2026-10-08` is fully verified, green across all 282 tests and 13 contracts, typecheck-clean, and ready for fast-forward or squash merge into `feature/india-multimodal-rebuild`.
