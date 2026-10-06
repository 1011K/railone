# RailOne Next 3.0 — System & Data Architecture Specification

**Reference Specification**: Section 15 — Backend & Data Architecture  
**Timezone Standard**: `Asia/Kolkata` (IST - UTC+05:30)  
**Charter Reference**: AGENTS.md, DATA_CONTRACTS.md  
**Date**: October 2026 | **Classification**: Technical Architecture & System Contracts  

---

## 1. Architectural Philosophy & Engine Boundary

RailOne Next 3.0 is built on a clean, decoupled, deterministic architecture:
1. **Timezone Determinism**: All timetables, service dates, headways, delays, and schedule offsets operate strictly within the `Asia/Kolkata` (IST) timezone. Midnight crossing ($23:59 \to 00:01$) utilizes explicit `dayOffset` indices ($0, 1, 2$) relative to the train's origin service date.
2. **In-Memory Decision Graph**: Rather than requiring external heavy C++ processes (such as MOTIS or OpenTripPlanner), RailOne Next leverages an in-memory topological graph representing the entire Mumbai Suburban network (Western, Central Main, Harbour, Trans-Harbour, Uran) and 40+ Pan-India national trunk hubs.
3. **Strict Data State Contracts**: Every entity carries unambiguous provenance attributes (`source_id`, `service_date`, `observed_at`, `expires_at`, `provenance`). Telemetry is categorized into six immutable namespaces (`LIVE_VERIFIED`, `SCHEDULED`, `HISTORICAL`, `PREDICTED`, `REPORTED`, `DEMO`, `UNKNOWN`).

---

## 2. Core Architecture Subsystems

```
                               ┌──────────────────────────────────────────────────────────┐
                               │                    CLIENT APPLICATIONS                   │
                               │  - Commuter Web Application (React 19 / Vite / PWA)      │
                               │  - RailSathi Voice Assistant (Web Speech & Dialer)       │
                               │  - 3D God's Eye Station Navigator (Three-D SVG Matrix)   │
                               │  - Interactive 2D/3D Network Map Viewer                  │
                               └────────────────────────────┬─────────────────────────────┘
                                                            │
                               ┌────────────────────────────▼─────────────────────────────┐
                               │                 DETERMINISTIC ENGINE LAYER               │
                               ├────────────────────────────┬─────────────────────────────┤
                               │  Journey Decision Engine   │  Delay Propagation Model    │
                               │  (`journeyEngine.ts`)      │  (`delayModel.ts`)          │
                               ├────────────────────────────┼─────────────────────────────┤
                               │  Legal Eligibility Gating  │  Categorical Crowd Estimator│
                               │  (`eligibilityEngine.ts`)  │  (`crowdEstimator.ts`)      │
                               ├────────────────────────────┼─────────────────────────────┤
                               │  Station Normalizer (EN/HI)│  Foot-Over-Bridge Pathfinder│
                               │  (`stationNormalizer.ts`)  │  (`stationLayoutsData.ts`)  │
                               └────────────────────────────┬─────────────────────────────┘
                                                            │
                               ┌────────────────────────────▼─────────────────────────────┐
                               │                DATA & STATE PERSISTENCE                  │
                               ├────────────────────────────┬─────────────────────────────┤
                               │  Topological Track Graph   │  Idempotent Specimen Wallet │
                               │  (`networkMapEngine.ts`)   │  (`mockBookingStore.ts`)    │
                               ├────────────────────────────┼─────────────────────────────┤
                               │  Official Fare Tariffs     │  National OCC Alerts Feed   │
                               │  (`railwayData.ts`)        │  (`networkAlertsService.ts`)│
                               └──────────────────────────────────────────────────────────┘
```

---

## 3. Data Contracts & Timezone Handling

### 3.1 Asia/Kolkata Multi-Day Midnight Crossing Model
Suburban local services and long-distance trains crossing midnight (e.g. Train 11058 Amritsar–CSMT Express departing at 22:30 on Day 0 and arriving in Mumbai on Day 2) must never experience negative minute diff calculations:
- `originDepartureTime`: Base timestamp (e.g., `"22:30"` on Service Date `2026-10-06`).
- `dayOffset`: Integer offset ($0$ for origin day, $1$ for next calendar day, etc.).
- Minute Calculation:
  $$\Delta t = (t_2.\text{hour} \times 60 + t_2.\text{min} + t_2.\text{dayOffset} \times 1440) - (t_1.\text{hour} \times 60 + t_1.\text{min} + t_1.\text{dayOffset} \times 1440)$$
- **Verified Test**: Scenario `[G8]` (Overnight train crossing midnight accurately calculates 165 minutes from 22:30 Day 0 to 01:15 Day 1).

### 3.2 Canonical Provenance Namespaces
Every passenger advice record specifies its origin:
- `LIVE_VERIFIED`: Confirmed track telemetry from an authorized NTES/CRIS operations feed.
- `SCHEDULED`: Published Central or Western Railway Working Time Table (WTT).
- `HISTORICAL`: Empirical statistical records with disclosed sample size.
- `PREDICTED`: Compounding delay progression calculation with explicit uncertainty bounds ($\pm \Delta t$).
- `REPORTED`: Crowdsourced passenger observations; quarantined from `LIVE_VERIFIED`.
- `DEMO`: Deterministic test fixtures for scenario simulation.
- `UNKNOWN`: Missing data; never silently defaulted to on-time.

---

## 4. Operational Boundaries
1. No external scraping daemon processes.
2. In-memory execution ensures sub-millisecond response times (<5ms) for route finding.
3. Zero third-party cloud analytics or unvetted tracking endpoints.
