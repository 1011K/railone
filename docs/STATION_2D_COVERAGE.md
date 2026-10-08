# RailOne Next — Station 2D Navigation & Platform Architecture Coverage

**Charter Reference**: Section 4 (UI/UX Design Guidance) & Section 5 (Route Engine Verification)  
**Component Implementation**: `src/components/StationGodsEyeModal.tsx`, `apps/mobile/app/wayfinding.tsx`, `apps/mobile/app/guide.tsx`  
**Accessibility Compliance**: WCAG 2.1 AA / AAA Step-Free Routing, Divyangjan Tactile Paving Standards  
**Last Audit Date**: October 8, 2026  

---

## 1. Architectural Overview: God’s Eye 2D Concourse Engine

The RailOne Next 2D Station Navigation Engine provides commuters with top-down, glanceable, high-contrast topological blueprints of high-density transit junctions across the Mumbai Metropolitan Region (MMR). Designed specifically for walking commuters inside packed station concourses, the engine renders:
1. **Physical Platform Geometry**: Platform indices, track orientations (Northbound / Southbound), and platform widths.
2. **Foot-Over-Bridge (FOB) Bridges & Stairs**: South FOB, Middle Main FOB, North FOB, and specialized Metro interchange skywalks.
3. **Step-Free Accessibility Paths**: Elevators (lifts), ramp accesses, and escalators for wheelchair users, senior citizens, and heavy luggage travelers.
4. **Suburban Coach Alignment**: Precise alignment of 12-car and 15-car suburban rakes relative to bridge stairs, highlighting Ladies compartments, Divyangjan coaches, and First Class rakes.
5. **Modal Transfer Buffers**: Realistic, empirically measured transfer walking durations accounting for peak-hour bridge congestion.

---

## 2. Hub-by-Hub Platform & Wayfinding Catalog

### 1. Dadar (CR: DR / WR: DDR) — The Critical Suburban Junction
- **Platforms**: 
  - Central Railway (DR): Platforms 1 to 8 (Slow lines on PF 1–4, Fast lines on PF 5–8).
  - Western Railway (DDR): Platforms 1 to 7 (Slow lines on PF 1–3, Fast lines on PF 4–7).
- **Foot-Over-Bridges**: 
  - **North FOB**: Connects WR PF 1–5 directly to CR PF 1–6 (High-capacity wide bridge).
  - **Middle Central FOB**: Primary suburban transfer artery connecting WR PF 4/5 (Fast) to CR PF 5/6 (Fast). Minimum walk time: **7 minutes** (enforced in routing engine).
  - **South FOB**: Direct exit to Tilak Bridge and Dadar TT Circle.
  - **Dadar Flower Market Subway**: Underground connection from WR West exit to Senapati Bapat Marg.
- **Accessibility & Step-Free Route**:
  - Elevators installed on WR PF 1, 2/3, 4/5 connecting to North Elevated Concourse.
  - Ramp access from Central Railway East Concourse (Swami Gyan Jivandas Marg).
- **Coach Stopping Guide**:
  - 15-car Western locals extend past South FOB; 12-car Central locals align between Middle and North FOBs.
  - Ladies First Class (LFC) coach stops directly adjacent to Middle FOB stair on DR PF 3 and DDR PF 2.

### 2. Thane (TNA) — Trans-Harbour & Main Line Hub
- **Platforms**: Platforms 1 to 10.
  - PF 1–2: Central Slow Locals (Down direction towards Kalyan).
  - PF 3–4: Central Slow Locals (Up direction towards CSMT).
  - PF 5–6: Central Fast Locals and Mail/Express halting trains.
  - PF 9–10: Trans-Harbour Line EMU terminals (Thane–Vashi/Panvel services).
- **Foot-Over-Bridges**:
  - **SATIS Elevated Deck**: Direct elevated bus terminus integration over platforms 1–4.
  - **Kalyan-End (North) Wide FOB**: Connects PF 1 through PF 10 with escalator banks.
  - **CSMT-End (South) FOB**: Fast transit to East ticket counter and Kopri bridge exit.
- **Accessibility & Step-Free Route**:
  - Step-free elevator connection on PF 5/6 and PF 9/10 to North Elevated Deck.
  - Dedicated tactile paving paths from West main ticket concourse to PF 1.

### 3. Chhatrapati Shivaji Maharaj Terminus (CSMT) — Historic Central Terminal
- **Platforms**: Platforms 1 to 18.
  - PF 1–7: Suburban Local Trains (Main Line PF 1–4 Slow/Fast, Harbour Line PF 1–2 elevated stub).
  - PF 8–18: Long-Distance Mail/Express, Rajdhani, Vande Bharat, and Duronto trains.
- **Concourses & Exit Corridors**:
  - Suburban concourse terminal buffer gates (dead-end buffer stops at south end).
  - Subway subway link directly to D.N. Road, BMC Headquarters, and Azad Maidan.
  - Dedicated taxi/auto feeder queue at platform 18 (P. D’Mello Road).
- **Accessibility**: 100% flat step-free surface access from southern concourse to all suburban platforms (no FOB climb required).

### 4. Churchgate (CCG) — Western Railway Southern Terminal
- **Platforms**: Platforms 1 to 4 (Double-discharge terminal island platforms).
  - PF 1: Slow Local arrivals/departures.
  - PF 2–3: Fast Local primary departure island.
  - PF 4: Fast Local and AC Local terminal platform.
- **Exits & Wayfinding**:
  - North exit connects to Veer Nariman Road and Marine Drive promenades.
  - South subway links directly to Eros Cinema junction and Oval Maidan.
- **Accessibility**: Flat zero-step surface concourse from ticket barriers to all train coaches.

### 5. Andheri (ADH) — Western Railway & Metro Line 1 Intermodal Hub
- **Platforms**: Platforms 1 to 9 (WR) + Metro 1 Elevated Concourse (`METRO_ADH`).
  - PF 1–3: Slow Local services.
  - PF 4–5: Harbour Line locals running to CSMT / Panvel via King's Circle.
  - PF 6–9: Fast Locals and halting Mail/Express trains.
- **Interchange Pathway**:
  - **Direct Skywalk Connector**: High-level enclosed skywalk linking Western Railway PF 8/9 directly to Mumbai Metro Line 1 concourse. Walk duration: **3.5 minutes**.
- **Accessibility**: Continuous escalators from WR platforms to Skywalk and Metro faregates.

### 6. Ghatkopar (GC) — Central Railway & Metro Line 1 Transfer
- **Platforms**: Platforms 1 to 4 (Central Railway) + Elevated Metro 1 Concourse (`METRO_GHT`).
  - PF 1: Central Slow Down (towards Thane/Kalyan).
  - PF 2: Central Slow Up (towards CSMT).
  - PF 3: Central Fast Down.
  - PF 4: Central Fast Up.
- **Interchange Pathway**:
  - **Metro Integrated Foot-Over-Bridge**: Connects CR PF 1 and PF 2/3 directly to Metro Line 1 gate concourse.
  - Empirically modeled transfer duration: **4 minutes** (inclusive of security screening).
- **Distinction**: Central Suburban platform code is `GC`; Metro station is `METRO_GHT`. Station normalizer tolerates misspellings (`ghatkopr`, `gatkopar`) and Devanagari (`घाटकोपर`).

### 7. Kurla (CLA) — Main Line & Harbour Line Junction
- **Platforms**: Platforms 1 to 8.
  - PF 1–4: Central Main Line Slow locals.
  - PF 5–6: Central Main Line Fast locals.
  - PF 7–8: Elevated Harbour Line platforms (CSMT–Panvel).
- **Foot-Over-Bridges**:
  - High-level North FOB connects Main Line to elevated Harbour platforms (4-minute transfer).
  - West exit leads to LBS Marg and Phoenix Marketcity auto feeders; East exit to Nehru Nagar bus depot.

### 8. Kalyan Junction (KYN) — Suburban Bifurcation Terminal
- **Platforms**: Platforms 1 to 8.
  - PF 1–1A: Local terminating trains.
  - PF 2–3: Kasara / Asangaon corridor trains.
  - PF 4–5: Karjat / Khopoli corridor trains and South/Eastbound Express services.
  - PF 6–7: Up direction Mail/Express arrivals.
- **Bridges & Ramps**: Ramp-equipped center bridge enabling step-free transition across all 8 platforms.

### 9. Borivali (BVI) — Western Suburbs Fast Corridor Origin
- **Platforms**: Platforms 1 to 10.
  - PF 1–2: Terminating Slow Locals towards Churchgate.
  - PF 3–6: Through Western Fast Locals and AC Locals.
  - PF 7–10: Harbour Line extension and Mail/Express halts.
- **Accessibility**: Skywalk connecting West SV Road to East Western Express Highway concourses.

### 10. Panvel (PNVL) — Trans-Harbour, Harbour & Konkan Gateway
- **Platforms**: Platforms 1 to 7.
  - PF 1–3: Suburban Harbour & Trans-Harbour terminals.
  - PF 4–7: Konkan Railway and Central Railway long-distance through tracks.
- **Concourse**: Modern ground-level accessible concourse with direct auto stand ramp.

### 11. Mumbai Metro Line 3 (Aqua Line Phase 1: BKC & Aarey JVLR)
- **Stations**:
  - **BKC Underground Station**: Deep underground island platform with 4 public concourse exits (Direct connector to MCA Ground, One BKC, and Diamond Bourse).
  - **Aarey JVLR At-Grade Station**: Surface terminal station with direct Western Express Highway feeder road integration.
- **Accessibility**: 100% accessible with double-door high-capacity elevators from street level to concourse and concourse to platform. Platform Screen Doors (PSD) synchronized with train braking.

---

## 3. Station Graph Verification Matrix

| Station Code | Primary Line | Platforms Mapped | FOB Bridges | Step-Free Lifts | Tactile Paths | Metro Intermodal Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DR / DDR** | CR / WR | 8 + 7 (15 total) | 3 FOBs + 1 Subway | Yes (WR Concourse) | Yes | Planned Metro 3 (Gokhale Rd) |
| **TNA** | CR / Trans-Harbour | 10 | 3 FOBs + SATIS | Yes (PF 5/6, 9/10) | Yes | Planned Metro 4 (Teen Hath Naka) |
| **CSMT** | CR Main & Harbour | 18 | 2 Subways + Surface | Yes (Surface level) | Yes | Metro 3 (CSMT Underground) |
| **CCG** | WR | 4 | 2 Subways + Surface | Yes (Surface level) | Yes | Metro 3 (Vidhan Bhavan / Churchgate) |
| **ADH** | WR / Harbour | 9 | 3 FOBs + Skywalk | Yes (Skywalk bridge) | Yes | **Active Metro Line 1** |
| **GC** | CR Main | 4 | 2 FOBs + Metro Bridge| Yes (Metro bridge) | Yes | **Active Metro Line 1** |
| **CLA** | CR Main & Harbour | 8 | 2 Elevated FOBs | Yes (West Concourse) | Yes | Planned Metro 2B |
| **KYN** | CR Main / Junction | 8 | 2 FOBs + 1 Ramp Bridge| Yes (Ramp bridge) | Yes | Planned Metro 5 |
| **BVI** | WR Main | 10 | 3 FOBs + Skywalk | Yes (Skywalk) | Yes | Metro Line 2A & Line 7 |
| **PNVL** | Harbour & Konkan | 7 | 2 Wide FOBs | Yes (Ramps) | Yes | Navi Mumbai Airport Rail link |
| **BKC** | Metro Line 3 | 2 (Underground) | Mezzanine Concourse | Yes (100% lifts) | Yes (Full tactile) | Suburban Kurla / Bandra feeder |
