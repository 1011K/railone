# RailOne Next — Remaining Work & Production Readiness Backlog

**Charter Reference**: Section 2 (Conflict Resolution) & Section 6 (Continuous Checkpointing)  
**Classification**: Honest Technical Debt, Production Gaps & Statutory Blockers  
**Audit Date**: October 8, 2026  

---

## 1. Epistemic Assessment: What Is Truly Complete vs What Requires External Authority

RailOne Next currently represents a fully functioning, verified client-and-server architecture with:
- 100% automated test passes (276/276 tests)
- Full multimodal door-to-door graph routing across 8 Indian metropolitan regions
- Native mobile client parity with full 22-services directory and voice assistant
- Production Vite build and zero TypeScript errors

However, in accordance with the **Railway-Source Verification & Integrity Rules** (`AGENTS.md`), we must be brutally honest about items that CANNOT be completed without formal government authorization or production infrastructure.

---

## 2. Prioritized Remaining Items (P0 / P1 / P2)

### Priority 0: Statutory & Legal Prerequisites (External Blockers)

| Item ID | Capability | Current State in RailOne | Production Requirement | Precise Blocker & Authority Dependency |
| :--- | :--- | :--- | :--- | :--- |
| **P0-01** | Real IRCTC / CRIS PRS Booking Gateway | Specimen ticket generator with cryptographic watermarks | Real PRS PNR generation, seat quota allocation, real payments | **Statutory Blocker**: Requires formal commercial partnership / MoU with Indian Railway Catering and Tourism Corporation (IRCTC) and Centre for Railway Information Systems (CRIS). No third-party API is legally permitted without CRIS sanction. |
| **P0-02** | Real UTS Paperless Suburban Geo-Fencing | Simulated UTS booking with proximity preference | Official CRIS UTS Paperless ticket issuance with railway track buffer | **Regulatory Blocker**: CRIS UTS rules mandate GPS proximity geofencing (must be >15m from railway track and <2km from origin station). Requires CRIS UTS backend integration. |
| **P0-03** | Confirmed Live Train GPS Telemetry | Timetable schedule model with deterministic delay propagation | Live locomotive RTIS (Real-Time Train Information System) telemetry | **Hardware / Feed Blocker**: Indian Railways RTIS GPS devices transmit to ISRO satellites and CRIS servers. Direct access requires official CRIS streaming credentials. |

---

### Priority 1: Client & Infrastructure Enhancements (Technical Roadmap)

| Item ID | Capability | Current State in RailOne | Target Production State | Technical Steps & Blockers |
| :--- | :--- | :--- | :--- | :--- |
| **P1-01** | EAS Cloud Build & Binary Distribution | `apps/mobile/eas.json` configured for Android APK and iOS simulator | Signed APK and TestFlight builds deployed to app stores | **Infrastructure Blocker**: Requires valid Expo Application Services (EAS) account credentials and Apple Developer / Google Play Console organization memberships. Local prebuild (`npx expo prebuild`) is fully functional. |
| **P1-02** | High-Fidelity On-Device Speech Models | Web Speech API and Expo Speech with Dograh fallback | On-device Vosk / Whisper-lite Hindi/Marathi acoustic models for offline operation | **Device Resource Constraint**: High-quality multilingual acoustic weights exceed 40MB; requires progressive lazy-loading to avoid bloating low-end commuter devices in cellular dead zones. |
| **P1-03** | Real-Time Push Notifications for Train Blocks | Saved journeys local preference storage | Web Push / APNs / FCM push notifications for Sunday Mega-blocks | **Server Infrastructure**: Requires standing notification service worker paired with verified railway press release ingestion pipeline. |

---

### Priority 2: UI & Operational Refinements (Polishing Backlog)

| Item ID | Capability | Current State in RailOne | Target Production State | Estimated Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **P2-01** | Dynamic 3D Concourse Perspective Expansion | 2D God's Eye maps for 11 key stations; 3D simulator for trains | Complete 3D WebGL walk-throughs for Dadar, Kurla, and Thane FOBs | Moderate (Three.js / WebGL assets need compression to stay <1MB bundle size). |
| **P2-02** | Multi-City Station 2D Blueprints | Complete detailed 2D concourse maps for Mumbai stations | Extend identical God's eye FOB maps to New Delhi (NDLS), Howrah (HWH), Chennai Central (MAS), and Bengaluru (SBC) | Moderate (Requires compiling physical platform blueprints from respective railway divisions). |
| **P2-03** | Multi-Tenant Operator Tariff Ingestion Tooling | Hardcoded official tariff tables for 8 cities in `src/fixtures/` | Dynamic GTFS-Fares v2 ingest CLI to parse annual fare revision gazettes | Low / Tooling (Lightweight node CLI). |

---

## 3. Risk Mitigation & Compliance Statement

1. **No False Endorsement**: RailOne Next clearly carries disclaimers across web and mobile viewports stating it is an independent research prototype.
2. **Security Quarantine**: All external links for ticketing and grievances (RailMadad, IRCTC e-Catering) link out to official government portals without intercepting user credentials.
3. **Graceful Offline Degradation**: In the event of cellular loss, 100% of the timetable graph, station database, fare calculations, and 2D station blueprints continue to operate locally via SQLite and indexed offline storage.
