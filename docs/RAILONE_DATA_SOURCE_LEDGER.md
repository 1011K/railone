# RailOne Next — Transit Data Source & Provenance Ledger

**Charter Reference**: Section 3 (Railway-Source Verification & Integrity Rules)  
**Standard**: ISO 19115 Geographic Metadata & Indian National Data Sharing and Accessibility Policy (NDSAP)  
**Classification**: Legal Provenance, Data Rights & Epistemic Honesty Record  
**Last Audit Date**: October 8, 2026  

---

## 1. Provenance Tagging Architecture & Epistemic Boundaries

Every piece of transit telemetry, schedule data, and platform topology in RailOne Next is strictly classified into one of three unambiguous categories:

1. `[VERIFIED LIVE]`: Confirmed real-time telemetry originating from active station observation feeds, verified railway staff inputs, or active transit dispatch sensors.
2. `[TIMETABLE SCHEDULE]`: Deterministic, published working timetables and official public tariff schedules issued by authorized transit authorities (e.g., Central Railway, Western Railway, MMRDA).
3. `[SIMULATED DATASET]`: Synthetic scenario data, pedagogical delay progressions, speculative crowding heuristics, or demonstration ticketing artifacts.

> **Zero Data Fabrication Invariant**: RailOne Next NEVER presents simulated delays, unobserved train positions, or synthetic crowd metrics as verified live observations. When live telemetry is absent, the system explicitly reports `Unavailable (No Live Observation)`.

---

## 2. Operator & Data Source Inventory

| Transit Operator / System | Network & Scope Covered | Primary Source & Protocol | Retrieval / Snapshot Date | Licensing / Rights Status | Coverage Confidence | UI Provenance Tag |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Central Railway (CR)** | Mumbai Suburban Main Line (CSMT–Kalyan–Kasara/Karjat), Harbour Line (CSMT–Panvel), Trans-Harbour Line (Thane–Vashi/Panvel) | Central Railway Public Working Timetable (WTT) 2025–2026; suburban EMU stop patterns | July 2025 (Validated Oct 2026) | Government Open Data / Public Transit Information | High (Fixed Timetable), Moderate (Live headways) | `[TIMETABLE SCHEDULE]` |
| **Western Railway (WR)** | Mumbai Suburban Western Corridor (Churchgate–Dahanu Road), Fast & Slow Local services, AC Locals | Western Railway Public Suburban Working Timetable; official suburban tariff tables | July 2025 (Validated Oct 2026) | Government Open Data / Public Transit Information | High (Fixed Timetable), Moderate (Live headways) | `[TIMETABLE SCHEDULE]` |
| **Mumbai Metro One Pvt Ltd (MMOPL / Reliance Infra)** | Mumbai Metro Line 1 (Versova–Andheri–Ghatkopar) | MMRDA / MMOPL Published Passenger Timetable & Fare Chart; official station interchange schematics | August 2025 | Public Information / Metro Transit Authority | Very High (Consistent 4–8m headway) | `[TIMETABLE SCHEDULE]` |
| **Maha Mumbai Metro Operations Corp (MMMOCL / MMRDA)** | Mumbai Metro Line 2A (Yellow Line: Dahisar East–D.N. Nagar) and Line 7 (Red Line: Dahisar East–Gundavali) | MMMOCL Official Headway & Tariff Matrix | September 2025 | Public Information / State Metro Agency | Very High (Standard automated metro headway) | `[TIMETABLE SCHEDULE]` |
| **Mumbai Metro Rail Corporation (MMRC)** | Mumbai Metro Line 3 (Aqua Line Phase 1: Aarey JVLR–BKC) | MMRC Commercial Service Launch Schedules & Station Facilities Catalog | Phase 1 Launch (Oct 2024 / Validated Oct 2026) | Public Information / Urban Mass Transit Agency | High (Phase 1 operational stations) | `[TIMETABLE SCHEDULE]` |
| **CIDCO / Maha Metro** | Navi Mumbai Metro Line 1 (Belapur–Pendhar) | CIDCO Navi Mumbai Metro Operating Schedule & Fare Matrix | July 2025 | Public Transit Information | High | `[TIMETABLE SCHEDULE]` |
| **BEST, NMMT, TMT, VVMT Municipal Buses** | Station Feeder Bus Routes (Mumbai, Thane, Navi Mumbai) | Open City Data / Municipal Transit Schedules; feeder connectivity to railway stations | June 2025 | Open Government Data / Public Utility | Moderate (Traffic-dependent headway variations) | `[TIMETABLE SCHEDULE]` |
| **Indian Railways / IRCTC / CRIS PRS & UTS** | Mail/Express Trains, Dynamic Class Tariffs (1A, 2A, 3A, 3E, SL, CC, 2S), Platform Permits | Official Tariff Notification Books & Gazette Notifications (Sections 137/138 Railways Act) | October 2026 | Statutory Tariff Schedules / Specimen Implementation | Very High (Tariff logic), Demonstration only for booking | `[SIMULATED DATASET]` (Bookings) / `[TIMETABLE SCHEDULE]` (Tariffs) |
| **Station 2D Blueprint Schematics** | Dadar, Thane, CSMT, Churchgate, Andheri, Ghatkopar, Kurla, Kalyan, Borivali, Panvel | Physical station platform inspection, passenger concourse maps, Foot-Over-Bridge surveys | August 2025 – October 2026 | Proprietary Synthesized Station Vector Topology | High (Platform counts, FOB stairs, step-free lifts) | `[TIMETABLE SCHEDULE]` |
| **Dograh / Multilingual Speech Tooling** | English, Hindi (Devanagari), Marathi speech engines and station normalizer | Web Speech API native synthesis; custom phonetic alias dictionaries (`src/fixtures/railwayData.ts`) | Continuous In-Tree | MIT / BSD-2-Clause Licensed Integration | High (Deterministic alias resolution) | `[VERIFIED LIVE]` (Client runtime) |
| **Regional Transit: Pune** | Pune Suburban (Pune–Lonavala) & Maha Metro Pune (Purple/Aqua lines) | Pune Railway Division Suburban Timetable; Maha Metro Pune Fare Chart | August 2025 | Public Information | High | `[TIMETABLE SCHEDULE]` |
| **Regional Transit: Delhi NCR** | Delhi Metro (DMRC Lines 1–8, Airport Express), Northern Railway Suburban (NDLS–GZB–PWL) | DMRC Operating Schedule & Northern Railway EMU working timetables | August 2025 | Public Information | Very High | `[TIMETABLE SCHEDULE]` |
| **Regional Transit: Bengaluru** | Namma Metro (Purple & Green Lines), South Western Railway suburban (SBC–WFD) | BMRCL Official Timetable; SWR Bengaluru Suburban Passenger Trains | August 2025 | Public Information | High | `[TIMETABLE SCHEDULE]` |
| **Regional Transit: Kolkata** | Eastern Railway Suburban (Sealdah & Howrah divisions), Kolkata Metro (Line 1, 2, 6) | Eastern Railway Suburban EMU Working Timetable; Metro Railway Kolkata | August 2025 | Public Information | High | `[TIMETABLE SCHEDULE]` |
| **Regional Transit: Chennai** | Southern Railway Suburban (Chennai Central/Beach–Tambaram–Chengalpattu), Chennai Metro (CMRL) | Southern Railway Suburban Timetable; CMRL Tariff Charts | August 2025 | Public Information | High | `[TIMETABLE SCHEDULE]` |
| **Regional Transit: Hyderabad** | Hyderabad Multi-Modal Transport System (MMTS), Hyderabad Metro (L&T Metro Rail) | South Central Railway MMTS Working Timetable; L&T Metro Fare Schedules | August 2025 | Public Information | High | `[TIMETABLE SCHEDULE]` |
| **Regional Transit: Kochi** | Kochi Metro (Aluva–Tripunithura), Water Metro | KMRL Operations Timetable & Water Metro Feeder Ferry Schedules | August 2025 | Public Information | High | `[TIMETABLE SCHEDULE]` |
| **Regional Transit: Ahmedabad–Gandhinagar** | Gujarat Metro (GMRC Phase 1: East-West & North-South corridors), Western Railway suburban | GMRC Operations Timetable; Western Railway Ahmedabad Division | August 2025 | Public Information | High | `[TIMETABLE SCHEDULE]` |

---

## 3. Disclaimers & Regulatory Boundary Declaration

1. **Demonstration & Prototype Status**: RailOne Next is an independent passenger intelligence prototype engineered for commuter safety, accessibility, and transit research. It is **NOT** an official CRIS, IRCTC, or Ministry of Railways mobile application.
2. **Specimen Ticketing**: All tickets generated inside the application (UTS Unreserved, PRS Express, Platform Permit, Season Pass) are strictly specimen demonstrations carrying dynamic cryptographic watermarks. They do not constitute valid travel authorization on real Indian Railway trains.
3. **External Portals**: Statutory passenger grievances (RailMadad 139) and onboard catering (IRCTC e-Catering) link exclusively to authenticated official government HTTPS domains (`https://railmadad.indianrailways.gov.in`, `https://ecatering.irctc.co.in`). RailOne Next does not intercept, collect, or proxy passenger personal credentials or payment details for these services.
