# RailOne Next — Multi-Country Institutional Railway Transit System

**Official Institutional Transport Authority & Journey Decision Support Platform**  
**Flagship Authority**: Republic of India — Ministry of Railways / CRIS & IRCTC  
**International Authorities**: UK National Rail, Japan JR East, Switzerland SBB CFF FFS, Germany Deutsche Bahn  
**Branch**: `feature/mobile-rebuild` | **Quality Gate**: 240/240 Automated Tests Passing (100% Green)

---

## 1. Executive Summary & Core Mission

Standard consumer railway apps provide basic timetable searches but fail daily commuters in high-density urban networks facing dynamic disruptions:
1. **The Fast vs. Slow Inversion**: When an express/fast service incurs upstream congestion, an approaching slow local on an unimpeded track will arrive earlier. Standard apps rank the fast service first due to static timetables.
2. **The Origin Delay / Leave-Home Gap**: Downstream stations often display static scheduled times until trains enter the local block. Commuters leave home on false schedules and wait on overcrowded platforms.
3. **The Short-Hop Legal Gating Issue**: Commuters frequently ask if they can board Mail/Express trains between suburban halts (e.g. Dadar to Kalyan). RailOne Next enforces the statutory **Central Railway Monthly Season Ticket (MST) authorized list** and Railways Act Sections 137/138.
4. **The Transfer Margin Reality**: Inter-line interchange (e.g., Central to Western Railway via Dadar) requires verified bridge/concourse traversal. RailOne Next calculates real walking times across Foot-Over-Bridges.
5. **The Station Navigation Blindspot**: Commuters struggle inside complex multi-level stations. RailOne Next tells passengers which entrance to use, which bridge to cross, which platform to stand on, which coach zone to wait at, and which destination exit to take.

---

## 2. Multi-Country Sovereign Transport Authorities

RailOne Next incorporates five national passenger transport authorities with statutory charters, emblems, native currencies, and realistic transit networks:

| Nation | Sovereign Ministry | Operating Agency | Currency | Flagship Corridors |
| :--- | :--- | :--- | :--- | :--- |
| **India 🇮🇳** *(Flagship)* | Ministry of Railways | CRIS & IRCTC | `₹` (INR) | Mumbai Suburban (CR/WR/Harbour), Pan-India Mainline |
| **United Kingdom 🇬🇧** | Department for Transport | National Rail / SWR | `£` (GBP) | South Western Main Line (Waterloo ➔ Woking) |
| **Japan 🇯🇵** | MLIT | JR East | `¥` (JPY) | Yamanote & Tokaido Line (Tokyo ➔ Yokohama) |
| **Switzerland 🇨🇭** | Federal Dept. of Transport | SBB CFF FFS | `CHF` | Swiss Federal Trunk (Zürich HB ➔ Bern) |
| **Germany 🇩🇪** | BMDV | Deutsche Bahn | `€` (EUR) | Berlin-Hamburg Intercity & S-Bahn |

---

## 3. Core System Capabilities

### A. All-Trains Departure Board & Filter Tabs
- Chronological departure board with **30m**, **60m**, and **120m** upcoming windows.
- Category filters: `NEXT | SLOW | FAST | AC | EXPRESS`.
- Preserves all valid departures while highlighting `⭐ BEST`, `FASTEST`, and `CHEAPEST` recommendations.

### B. Express 15-Minute Rule
- Enforces `EXPRESS_PROMOTION_MIN_TIME_SAVING_MINUTES = 15`.
- Evaluates 12 mandatory criteria before promoting an express service over suburban locals.
- Displays transparent eligibility notes when time savings fall below the statutory threshold.

### C. Station Navigation & 2D/3D God's Eye
- Verified topological wayfinding covering Dadar (15 platforms, Level 0 tracks, Level 1 FOBs, escalators, step-free lifts), CSMT, Thane, Kalyan, Borivali, Andheri, and Churchgate.
- Step-free accessible routes mapped for Divyangjan and elderly commuters.

### D. Guide Me From Here (12-Step Navigation)
- Step-by-step railway guidance: GPS approach ➔ Ticket check ➔ Recommended entrance ➔ Concourse/FOB walk ➔ Platform indicator ➔ Coach stopping zone ➔ Boarding countdown ➔ Onboard halts ➔ Transfer alert ➔ Connecting train ➔ Destination arrival ➔ Destination exit.
- Dynamic platform-change recalculation (e.g., `PF5 ➔ PF7`) updating walking path, bridge assignment, and feasibility.

### E. Decoupled Coach Position Guide (*Wagenstandsanzeiger*)
- Architectural separation of `RakeFormation` (train composition), `PlatformAlignment` (station geometry), and `PlatformLandmarks` (FOBs/elevators).
- Supports 5 distinct rake formations: 12-car suburban, 12-car AC, 15-car suburban, 16-car Vande Bharat Express, and 22-car ICF/LHB Express.
- Compressed proportional rake strip fitting mobile viewports (360px–430px) without horizontal page blowout.

### F. Easy Journey / Low-Literacy Mode
- Icon-first navigation with minimal jargon, large touch targets (≥48px), and English, Hindi, and Marathi voice narration.

### G. TTE / TC Inspector Demonstration Mode
- Dedicated ticket examiner validation interface with statutory Railways Act Section 137 (fraudulent intent) and Section 138 (irregular travel) tariff recovery calculations.

---

## 4. Teammate Quickstart & Running Instructions

### Clone & Install
```bash
# Clone the repository
git clone https://github.com/1011K/railone.git
cd railone

# Checkout the active implementation branch
git checkout feature/mobile-rebuild

# Install dependencies (root + mobile)
npm install
npm --prefix apps/mobile install
```

### Run Tests (240 Tests Passing)
```bash
npm test
```

### Launch Applications
```bash
# 1. Desktop Web & API Server (http://localhost:3000)
npm run dev

# 2. Native Mobile Web Preview (http://localhost:8081)
npm run mobile:web

# 3. Native Mobile Expo Development Server
npm run mobile:dev
```

---

## 5. Engineering Quality Gates

- **Test Suite**: **240/240 Tests Passing (0 Failed, 100% Pass Rate)** across 27 suites.
- **Root Typecheck**: `tsc --noEmit` exits with 0 errors.
- **Mobile Typecheck**: `npm --prefix apps/mobile run lint` exits with 0 errors.
- **Expo Doctor**: `npx expo-doctor` passes 18/18 checks with zero issues.
- **Production Bundle**: Vite production build transforms 1703 modules with zero build errors.
- **Data Provenance**: Zero fabricated delays or hallucinated platform assignments; all data strictly tagged `LIVE_VERIFIED`, `SCHEDULED`, `SIMULATED DATASET`, or `DEMO`.
