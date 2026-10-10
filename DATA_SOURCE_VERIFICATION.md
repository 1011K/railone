# RailOne Next — Data Source Verification & Provenance Registry

**Last Audit Timestamp:** 2026-10-10  
**Data Standards Compliance:** Indian Railways Timetable & Open Data Governance  

---

## 1. Data Classification Standard

Every operational claim, schedule entry, and platform recommendation surfaced by RailOne Next carries an explicit provenance tag:

| Classification | Meaning & Scope | Verification Requirement | UI Representation |
| :--- | :--- | :--- | :--- |
| `VERIFIED_LIVE` | Real-time observation directly confirmed by physical rake transponder, signal aspect, or authorized railway API. | Timestamped observation within last 120 seconds. | High-visibility Green badge `[VERIFIED LIVE]` |
| `VERIFIED_SCHEDULED` | Published timetable schedule from official railway or metro operating authority. | Cross-referenced against working timetables (WTT) / public timetables. | Slate badge `[SCHEDULED]` |
| `HISTORICAL` | Historical statistical delay profiles, crowd density patterns, or run times. | Aggregated data over >= 30 days. | Amber indicator `[HISTORICAL HEURISTIC]` |
| `PREDICTED` | Algorithmic arrival forecast computed from sectional propagation and signal blocks. | Derived from timetable + delay model math. | Blue badge `[PREDICTED ESTIMATE]` |
| `PASSENGER_REPORTED` | Crowdsourced feedback or onboard commuter incident reports. | SQLite feedback store with passenger auth token. | Indigo badge `[PASSENGER REPORTED]` |
| `DEMO` | Educational simulator dataset, test QR payloads, or specimen bookings. | Watermarked `NOT VALID FOR TRAVEL`. | Yellow warning badge `[DEMO / SPECIMEN]` |
| `UNAVAILABLE` | Live telemetry or observation is currently absent or expired (>15m old). | Missing record; right time must never be invented. | Gray indicator `[UNAVAILABLE / NO OBSERVATION]` |

---

## 2. Verified Data Sources Registry

### Source 1: Mumbai Suburban Railway Timetable (Western & Central Railway)
- **Source Organization:** Western Railway (WR) & Central Railway (CR), Indian Railways.
- **License / Permitted Use:** Public statutory transit schedule published under Indian Railways Act. Fair dealing for transit passenger navigation.
- **Dataset Date / Effective Period:** All-India Railway Timetable (e-WTT 2024–2026).
- **Station & Service Identifiers:** Alpha codes (CSMT, CCG, TNA, KYN, CLA, BVI, DR, DDR, GC). 5-digit EMU train numbers (e.g., 95112, 95114, 90451).
- **Schedule Completeness:** Complete mainline stopping patterns for Fast & Slow corridors, AC Local services, Trans-Harbour (TNA-VSH), and Harbour (CSMT-PNVL).
- **Coverage Limitations:** Sunday mega-blocks and ad-hoc jumbo-blocks require railway circular ingestion; tagged as timetable baseline when circular is unavailable.

### Source 2: Mumbai Metro Corridors (MMOPL, MMMOCL)
- **Source Organization:** Mumbai Metropolitan Region Development Authority (MMRDA), Mumbai Metro One (MMOPL), Maha Mumbai Metro (MMMOCL).
- **License / Permitted Use:** Official passenger publications; public transport schedules.
- **Effective Period:** Current operating schedules (Line 1 Versova-Ghatkopar, Line 2A Andheri W-Dahisar E, Line 7 Gundavali-Dahisar E, Line 3 Aqua Line Phase 1 BKC-Aarey).
- **Station & Service Identifiers:** Modal prefixed codes (`METRO_ADH`, `METRO_GHT`, `METRO_DN_NGR`, `METRO_BKC`). Isolated from Suburban code space.
- **Coverage Limitations:** Strict 23:55 operational curfew enforced. No late-night services fabricated.

### Source 3: Kochi Metro Rail Open Data (GTFS)
- **Source Organization:** Kochi Metro Rail Limited (KMRL).
- **License / Permitted Use:** Open Government Data (OGD) Platform India / KMRL Open GTFS License.
- **Effective Period:** Aluva to Thripunithura corridor (25 active stations).
- **Station & Service Identifiers:** Official KMRL GTFS station identifiers mapped into Tier-2 multimodal graph engine.
- **Coverage Limitations:** Metro corridor only; Water Metro feeder services distinguished with separate transit mode flags.

### Source 4: OpenStreetMap Geographic Coordinates & Station Geometry
- **Source Organization:** OpenStreetMap Foundation (OSMF) contributors.
- **License / Permitted Use:** Open Database License (ODbL) 1.0. Proper attribution rendered in map footer.
- **Effective Period:** Continuous 2026 snapshot.
- **Station & Service Identifiers:** Real WGS-84 coordinates for 156 indexed suburban and metro stations (`lat`, `lon`).
- **Coverage Limitations:** Geographic road geometry used only for walking legs; station platform connection strictly delegates to surveyed FOB layouts.

### Source 5: Open-Meteo Meteorological Models
- **Source Organization:** Open-Meteo GmbH (ECMWF, DWD, GFS weather models).
- **License / Permitted Use:** Free open-access API for weather forecasts, CC-BY 4.0.
- **Effective Period:** Real-time and 7-day hourly forecasts.
- **Safety Invariant:** Weather observations (e.g. monsoon rainfall in mm) inform commuter packing and umbrella advisories, but NEVER automatically declare train cancellations or track flooding without railway official dispatch bulletins.

---

## 3. Station Code Disambiguation & Modal Isolation

1. **Dadar Platform Bridge Separation:**
   - `DR` = Dadar Central Railway platforms (CR Main Line, Platforms 1–8).
   - `DDR` = Dadar Western Railway platforms (WR Line, Platforms 1–7).
   - Ambiguous queries (`Dadar`) return both platform sets with an explicit 7-minute Foot-Over-Bridge transfer warning.
2. **Ghatkopar Suburban vs Metro Isolation:**
   - `GC` = Ghatkopar Central Railway Suburban EMU platforms.
   - `METRO_GHT` = Ghatkopar Metro Line 1 elevated concourse.
   - Direct connection requires ascending the Northern Foot Overbridge into the MMOPL security gate.
3. **Zero Platform Defaulting:**
   - When a train's berthing platform is unconfirmed by sectional dispatchers, platform is surfaced as `null` / `Unannounced`. Arbitrary platform numbers are never fabricated.
