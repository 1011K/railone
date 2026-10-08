# RailOne Next — Team Onboarding & Execution Guide

This document is the definitive operational manual for running, testing, and developing **RailOne Next** on any laptop or development environment (Windows, macOS, Linux, Google Antigravity, Cloud Shell, GitHub Codespaces, or Codex).

---

## 1. Prerequisites & Environment Requirements

| Requirement | Minimum Version | Recommended | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 20.x` | `22.x LTS` | Node 22 includes built-in SQLite engine and high-performance V8. |
| **npm** | `>= 10.x` | `10.9.x+` | Standard Node package manager. |
| **Git** | `>= 2.30` | Latest | For version control. |
| **Operating System** | Any | Windows / macOS / Linux | Fully cross-platform compatible. |
| **Expo Go (Optional)**| Latest | iOS App Store / Google Play | For running the native app directly on a physical smartphone. |

---

## 2. One-Time Setup (New Teammate Quickstart)

Clone the repository and install all required root and native mobile dependencies:

```bash
# 1. Clone the repository
git clone https://github.com/1011K/railone.git
cd railone

# 2. Switch to the active feature implementation branch
git checkout feature/mobile-rebuild

# 3. Install root dependencies (React 19, TypeScript, Vite, Express, Tailwind v4)
npm install

# 4. Install native mobile dependencies (Expo SDK 53, React Native 0.79, Expo Router)
npm --prefix apps/mobile install
```

> **Windows PowerShell Note**: If executing `npm` or `npx` in PowerShell with strict script policies, invoke `npm.cmd` or `npx.cmd`.

---

## 3. Running the Test Suite (240/240 Passing)

Run the full automated verification suite locally without triggering remote CI:

```bash
npm test
```

### Verification Scope (27 Test Suites, 240 Assertions)
- **Suites 1–18**: Station normalization, fare tariffs, multimodal routing, congestion modeling, 2D/3D map engines, and God's Eye layouts.
- **Suites 19–21**: Mumbai Metro Lines (1, 2A, 7, 3), PWA caching, coach alignment, and institutional charters.
- **Suite 22**: SQLite persistence, station aliasing, and RailSathi voice engine.
- **Suite 23**: Native Expo mobile app, offline storage, and typed API contracts.
- **Suite 24**: All-Trains Departure Board, Express ≥15m promotion rule, Dadar FOB transfers, and Scenarios A–D.
- **Suite 25**: EAS cloud configuration, Hermes engine, vector geometry caching, and TTE Section 137/138 validator.
- **Suite 26**: Decoupled Coach Guide domain models, dynamic booking timestamps, and accessible modal primitives.
- **Suite 27**: Multi-country sovereign authorities (India, UK, Japan, Switzerland, Germany) and 360px viewport resilience.

---

## 4. Running the Applications

### Mode A: Desktop Web App + API Backend Server
Runs the Express backend and the phone simulator interface at `http://localhost:3000`:

```bash
npm run dev
```

- **Interactive Interface**: [http://localhost:3000](http://localhost:3000)
- **Health Check Endpoint**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **Station Search API**: [http://localhost:3000/api/v1/stations/search?q=Dadar](http://localhost:3000/api/v1/stations/search?q=Dadar)

---

### Mode B: Native Mobile App via Expo (`apps/mobile`)

#### 1. Web Preview (Zero Phone Setup Required)
To run the mobile app directly in your browser:
```bash
npm run mobile:web
# or
npm --prefix apps/mobile run web
```
Opens the Expo web app at **`http://localhost:8081`**.

#### 2. Physical Smartphone via Expo Go (iOS / Android)
To run the native mobile application on your physical smartphone:
```bash
npm run mobile:dev
# or
npm --prefix apps/mobile start
```
1. Ensure your smartphone and laptop are on the **same Wi-Fi network**.
2. Scan the terminal QR code with your iPhone Camera or Android Expo Go app.
3. The app automatically detects your computer's LAN IP address.

#### 3. Native Prebuild & Doctor Check
```bash
# Verify Expo dependency health
npm run mobile:doctor

# Verify clean native prebuild (Android & iOS project generation)
npm run mobile:prebuild
```

---

## 5. Multi-Country Sovereign Authority System

The application supports five national transport authorities:

1. **Republic of India** — Ministry of Railways / CRIS & IRCTC (Flagship)
   - Stations: CSMT, Dadar, Thane, Kalyan, Borivali, Andheri, Churchgate, Pune, Delhi, etc.
   - Currency: Indian Rupee (`₹`)
   - Charters: Indian Railways Act (Sections 137/138), UTS Suburban Tariff
2. **United Kingdom** — Department for Transport / National Rail
   - Stations: London Waterloo (WAT), Clapham Junction (CLJ), Woking (WOK), Guildford (GLD)
   - Currency: British Pound (`£`)
   - Charters: National Rail Conditions of Travel
3. **Japan** — Ministry of Land, Infrastructure, Transport & Tourism / JR East
   - Stations: Tokyo (TYO), Shinjuku (SJK), Shinagawa (SGW), Yokohama (YKH), Shibuya (SBY)
   - Currency: Japanese Yen (`¥`)
   - Charters: Railway Operation Act & JR East Passenger Carriage Regulations
4. **Swiss Confederation** — Federal Dept. of Environment, Transport / SBB CFF FFS
   - Stations: Zürich HB (ZRH), Bern (BRN), Basel SBB (BSL), Genève-Cornavin (GVA), Luzern (LUZ)
   - Currency: Swiss Franc (`CHF`)
   - Charters: Swiss Federal Passenger Transport Act (PBG)
5. **Federal Republic of Germany** — Federal Ministry for Digital & Transport / Deutsche Bahn
   - Stations: Berlin Hbf (BER), Hamburg Hbf (HAM), München Hbf (MUC), Frankfurt Hbf (FRA), Köln Hbf (CGN)
   - Currency: Euro (`€`)
   - Charters: Allgemeines Eisenbahngesetz (AEG) & Eisenbahn-Verkehrsordnung (EVO)

---

## 6. Directory Layout & Key Modules

```
railone/
├── apps/
│   └── mobile/                  # Native Expo SDK 53 mobile application
│       ├── app/                 # Expo Router screens (Home, Journeys, Live, Tickets, Guide, Map, TTE)
│       ├── src/api/client.ts    # LAN-aware mobile API client
│       ├── src/services/        # Offline storage, speech engine, TTE validator
│       └── app.json / eas.json  # Native bundle config, permissions, Hermes JS engine
├── src/
│   ├── components/              # Passenger UI components & accessible modals
│   │   ├── mobile/              # Phone-first passenger tabs (Home, Journeys, Live, Tickets, Help)
│   │   ├── common/              # AccessibleModal, BottomNavigation, DesignSystemPrimitives
│   │   ├── AuthorityContext.tsx # Multi-country authority provider
│   │   ├── CoachPositionGuide.tsx # Decoupled coach alignment wagenstandsanzeiger
│   │   └── NetworkMapViewer.tsx # Interactive 2D topological SVG transit map
│   ├── engine/                  # Deterministic railway engines
│   │   ├── journeyEngine.ts     # Multi-leg journey planner & express 15m rule
│   │   ├── eligibilityEngine.ts # Ticketing legality & pass validation
│   │   ├── crowdEstimator.ts    # Directional peak rush heuristics
│   │   └── tteTicketValidator.ts# Statutory Section 137/138 inspection engine
│   ├── fixtures/                # Verified station catalogs & timetable datasets
│   └── models/                  # Domain contracts (authorities, coachGuide)
├── tests/
│   └── run-all-tests.ts         # 240 automated unit, integration, and SSR assertions
├── server.ts                    # Express REST API & SQLite persistence
└── package.json                 # Project dependencies & build scripts
```

---

## 7. Integrated Development Principles & Skills

The repository integrates five operational charters:
- **Ponytail (`.agents/skills/ponytail`)**: Strict YAGNI, standard library first, zero unrequested dependencies, shortest working diffs.
- **Caveman (`.agents/skills/caveman`)**: Answer-first technical communication with zero fluff.
- **Superpowers (`.agents/skills/superpowers`)**: Rigorous Test-Driven Development (failing test first, then implementation, then zero regressions).
- **UI UX Pro Max (`.agents/skills/ui-ux-pro-max`)**: High contrast, thumb-friendly 48px touch targets, WCAG AA/AAA compliance, safe-area awareness (`pb-safe`, `pt-safe`).
- **Railway Integrity**: Zero data fabrication. Unverified feeds are explicitly tagged `[TIMETABLE SCHEDULE]`, `[SIMULATED DATASET]`, or `[DEMO]`.
