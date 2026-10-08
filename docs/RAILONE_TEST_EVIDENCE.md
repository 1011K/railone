# RailOne Next — Verification & Test Evidence Record

**Charter Reference**: Section 5 (End-to-End Testing & Verification Procedures) & Superpowers TDD Standards  
**Branch**: `integration/master-reconciliation-2026-10-08`  
**Base Reconciled Commits**:
- Common Ancestor: `463b8fde18cb7fb605a20a3a095ac9e92f88de1a`
- Dev Branch: `feature/india-multimodal-rebuild` (`f135f87454750eda4df4d3f30e9542c1e3501ce5`)
- Repair Branch: `origin/fix/railone-p0-feature-parity-2026-10-08` (`5fd54cc0bec8196d2c1cceac3c1ff0fbc3d6d7a4`)
- Integration Merge Commit: `07318eb`
**Execution Timestamp**: October 8, 2026 | **Host OS**: Windows 11 (PowerShell 7 / Command Prompt)  

---

## 1. Test Execution Environment

| Metric / Tool | Exact Version / Configuration | Role in Verification |
| :--- | :--- | :--- |
| **Node.js Runtime** | `v22.23.2` (64-bit Windows) | Host test and build executor |
| **Package Manager** | `npm 10.9.8` | Monorepo package manager |
| **TypeScript (Root)** | `~7.0.2` (with `tsx v4.21.0`) | In-memory execution and strict typechecking |
| **TypeScript (Mobile)** | `~5.8.3` (Expo SDK 53) | React Native mobile native typechecking |
| **Vite Bundler** | `v8.3.3` | Production client build & asset minifier |
| **Tailwind Engine** | `@tailwindcss/vite v4.3.3` | High-contrast CSS token engine |
| **Database** | SQLite3 (in-memory & file-backed via standard db module) | Persistence & atomic booking idempotency |
| **Frameworks** | React 19.0.1, React Native 0.79.6, Expo Router 5.1.11 | Web client & mobile native application |

---

## 2. Command Execution Log & Results

### 1. Root Automated Comprehensive Test Suite (`npm test`)
```powershell
$ npm test
> react-example@0.0.0 test
> tsx tests/run-all-tests.ts

====================================================
   RAILONE NEXT - AUTOMATED SYSTEM TEST SUITE       
====================================================

--- SECTION A: 18 CANONICAL ACCEPTANCE SCENARIOS (G1–G18) ---
  [PASS] G1.1 - G1.7: Thane -> Churchgate via Dadar, Arrive by 12:30 (1 Interchange, >=7m FOB Walk)
  [PASS] G2.1 - G2.5: Dadar -> Kalyan, Exclude Express Lacking Valid Ticket/Stop
  [PASS] G3.1 - G3.4: Borivali -> Churchgate Morning Peak Rush Inbound Crowd Model
  [PASS] G4.1 - G4.4: Ghatkopar Departure Board & Platform Alignment
  [PASS] G5.1 - G5.4: Compounding Delay Model (+20m -> +40m -> +55m)
  [PASS] G6.1 - G6.5: Leave-Home Countdown Timer & Commuter Buffer
  [PASS] G7.1 - G7.4: Voice Agent Station Normalization (CST -> CSMT, Devanagari)
  [PASS] G8.1 - G8.4: Voice Agent Departure Inquiry (Next Train to Kalyan)
  [PASS] G9.1 - G9.4: Voice Agent Platform Guidance (Dadar PF 6 step-free access)
  [PASS] G10.1 - G10.4: Voice Agent Ticket Booking Demo & Mock PNR
  [PASS] G11.1 - G11.4: Multi-Lingual Speech Engine Fallback (en, hi, mr)
  [PASS] G12.1 - G12.5: Specimen Ticket Generator & Watermarking
  [PASS] G13.1 - G13.4: RailWallet Balance & Recharge Transactions
  [PASS] G14.1 - G14.4: Ticket Cancellation & Clerical Deductions
  [PASS] G15.1 - G15.4: Station 2D Concourse Map & Step-Free Route
  [PASS] G16.1 - G16.4: Coach Position Guide & Ladies Compartment Alignment
  [PASS] G17.1 - G17.4: Divyangjan Wheelchair Accessibility Enforcement
  [PASS] G18.1 - G18.4: Offline Timetable Cache & Service Worker Resilience

--- SECTION B: ARCHITECTURAL INVARIANTS & INTEGRATION SUITES ---
  [PASS] Test Suite 19: Fare Slab Algorithms & Suburban / Metro Tariff Slices (19.1 - 19.8)
  [PASS] Test Suite 20: Trans-Modal Journey Planning & Multi-Operator Graph (20.1 - 20.8)
  [PASS] Test Suite 21: ASTRA Design Tokens & WCAG Accessibility Invariants (21.1 - 21.8)
  [PASS] Test Suite 22: Backend SQLite Persistence & Idempotent Transactions (22.1 - 22.8)
  [PASS] Test Suite 23: Voice Agent Tool Calling & Telephony Disclaimers (23.1 - 23.8)
  [PASS] Test Suite 24: Delay Inversion Recommendations & Crowd Badging (24.1 - 24.9)
  [PASS] Test Suite 25: Native Mobile Rebuild & EAS Cloud Profiles (25.1 - 25.13)
  [PASS] Test Suite 26: Phone-First UX, Coach Separation & Provenance Truth (26.1 - 26.10)
  [PASS] Test Suite 27: Multi-Country Institutional Authority Registry (27.1 - 27.10)
  [PASS] Test Suite 28: Multi-Country Journey Planning & Dynamic Tariffs (28.1 - 28.8)
  [PASS] Test Suite 29: India Multimodal Architecture, MMR Scenarios & Security (29.1 - 29.15)
  [PASS] Test Suite 30: Ghatkopar Resolution, Dadar Bridge, 22 Services & Launch Audio (30.1 - 30.12)

====================================================
TEST SUMMARY: 276/276 Passed (0 Failed)
====================================================
Exit Code: 0
```

### 2. Regression Contracts Guard (`node scripts/check-regression-contracts.mjs`)
```powershell
$ node scripts/check-regression-contracts.mjs
PASS No profile-ID-only token renewal
PASS Signed tokens never use a fixed example secret
PASS Booking submission is authenticated
PASS No unauthenticated audit-log endpoint
PASS Crowding is a low-confidence estimate
PASS Native app still offers least-crowded preference
PASS Native app still shows crowd labels
PASS Native app displays the multimodal graph
PASS Native API includes per-session demo authorization
PASS Missing live observation cannot become RIGHT TIME
PASS Guide does not claim unverified UTS validation
PASS Guide does not invent a 120m station distance
PASS Monorail is marked suspended
Source contracts: 13/13. Run full npm test, typechecks and device checks separately.
Exit Code: 0
```

### 3. Root TypeScript Strict Typecheck (`npm run lint`)
```powershell
$ npm run lint
> react-example@0.0.0 lint
> tsc --noEmit
Exit Code: 0 (Zero errors)
```

### 4. Production Client Bundle Build (`npm run build`)
```powershell
$ npm run build
> react-example@0.0.0 build
> vite build

vite v8.3.3 building client environment for production...
transforming...
✓ 1709 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                      1.30 kB │ gzip:   0.54 kB
dist/assets/index-Cpf9JFkN.css                     193.45 kB │ gzip:  25.88 kB
dist/assets/MovingTrain3DModal-CZQvSmDo.js          18.72 kB │ gzip:   4.82 kB
dist/assets/InstitutionalDossierModal-BIyb9fqk.js   20.53 kB │ gzip:   5.14 kB
dist/assets/StationGodsEyeModal-Xx1w2488.js         56.64 kB │ gzip:  12.18 kB
dist/assets/index-D0bOZip5.js                      862.27 kB │ gzip: 210.26 kB
✓ built in 7.37s
Exit Code: 0
```

### 5. Native Mobile Expo Application Typecheck (`npm run mobile:lint`)
```powershell
$ npm run mobile:lint
> react-example@0.0.0 mobile:lint
> npm --prefix apps/mobile run lint

> @railone/mobile@4.0.0 lint
> tsc --noEmit
Exit Code: 0 (Zero errors)
```

---

## 3. Key Bug Regressions Resolved & Verified

1. **Ticketing Idempotency Collision**: SQLite returns `null` for unassigned foreign keys while JavaScript requests send `undefined`. A strict `!==` comparison falsely triggered `Error: Idempotency key belongs to another passenger`. Resolved via normalized comparison `(existingProfile || null) !== (requestedProfile || null)`.
2. **UTS Suburban Ticket Cancellation Refund Route**: Commit `1f1b0fd` routed simulated UPI refunds to `cashRefund` (toBank), causing `walletRefund` to be 0 and failing test 22.7. Corrected to credit `walletRefund` by default for simulated suburban tickets, passing test 22.7 (`walletRefund === 65`).
3. **Ghatkopar Misspelling Normalization**: Station aliases expanded to include `ghatkopr`, `gatkopar`, `ghatcopar`, and Devanagari `घाटकोपर`, successfully resolving all misspellings to `GC` while maintaining modal segregation from Metro Line 1 (`METRO_GHT`).
4. **Dadar Central (DR) vs Western (DDR) Ambiguity**: Added `'dadar'` to `STATIONS.DDR.aliases` so generic queries flag ambiguity and return both platform candidates, while distinct queries resolve to Central and Western platforms with a 7-minute FOB transfer buffer.
5. **Mobile Native Index Missing Stylesheet Properties**: Added all 11 missing style rules (`bookingGrid`, `bookingGridItem`, `bookingGridTitle`, `bookingGridSub`, `servicesHubBanner`, `servicesHubContent`, `servicesHubTitle`, `servicesHubSubtitle`, `servicesHubBadge`, `servicesHubBadgeText`, `assistantButtonsRow`) and Modal 6 for the 22-services directory.
