# RailOne Next 3.0 — Data Sources, Provenance & Legal Rights Register

## 1. Statutory Data Governance & Source Priority Hierarchy
RailOne Next 3.0 strictly complies with the **Digital Personal Data Protection Act 2023 (DPDP)**, the **Information Technology Act 2000**, and the intellectual property boundaries of the **Centre for Railway Information Systems (CRIS)** and the **Indian Railway Catering and Tourism Corporation (IRCTC)**.

### Priority Hierarchy:
1. **Tier 1: Authorized Official Feeds (CRIS / NTES / IRCTC / UTS)**
   - Official sovereign railway operations control, timetable bulletins, and PRS reservation status.
   - Status: Requires sovereign institutional access agreements; currently operating under documented adapter contracts with zero scraping.
2. **Tier 2: Published Official Timetables & Tariffs**
   - Published Western Railway / Central Railway Working Time Tables (WTT), Suburban Public Time Tables, and official Coaching Tariff No. 26 Part I (Vol. I & II).
   - Provenance: Legally published statutory schedules and distance fare tables.
3. **Tier 3: Open Cartographic & Transit Reference Data**
   - OpenStreetMap (OSM) track geometry and railway station coordinates under Open Database License (ODbL).
   - Provenance: Permitted non-proprietary geospatial reference coordinates.
4. **Tier 4: Transparent Controlled Simulation Datasets**
   - Sandboxed scenarios for operational disruption analysis (e.g. signal bunching at Kurla, fog speed restrictions on Northern Railway trunk).
   - Provenance: Explicitly tagged `DEMO` or `SIMULATED DATASET`. Never disguised as live feeds.

---

## 2. Scraping Prohibition & Anti-Reverse Engineering Policy
- **Zero Unofficial Scraping**: RailOne Next does not scrape, reverse-engineer, or poll restricted endpoints of NTES, UTS on Mobile, or IRCTC web portals.
- **Circuit Breakers**: Outgoing requests to unverified third-party APIs are prohibited; the system operates on self-contained deterministic graphs and typed adapter interfaces.
- **Audit Defensibility**: All data structures maintain immutable provenance fields (`source_id`, `service_date`, `retrieved_at`, `quality_flag`).

---

## 3. Third-Party Licenses & Intellectual Property

| Dataset / Asset | Origin / Repository | License | Usage Scope in RailOne Next 3.0 | Attribution Notice |
| :--- | :--- | :--- | :--- | :--- |
| **Station Coordinates & Line Alignments** | OpenStreetMap Contributors | ODbL 1.0 | Station centroid coordinates and topological connectivity | "© OpenStreetMap contributors" |
| **Suburban Fare Tariffs** | Indian Railways Coaching Tariff | Public Domain / Statutory | Static fare matrix for Suburban 2nd Class, 1st Class, and AC Local | Sovereign Indian Railways tariff tables |
| **ASTRA Color Tokens** | Internal Design System | MIT | Accessible CSS custom property palette | Native RailOne Next theme system |
| **SVG Transit Icons** | Lucide Icons | MIT | Crisp accessible UI navigation and amenity glyphs | Lucide open-source project |

---

## 4. Operational State Labels & Commuter Transparency

To prevent misleading commuters, RailOne Next 3.0 enforces UI badge standards across all views:

- `[VERIFIED LIVE]`: Reserved exclusively for confirmed real-time GPS/telemetry feeds via official authorization.
- `[TIMETABLE SCHEDULE]`: Derived from published timetable schedules.
- `[PREDICTIVE HEURISTIC]`: Mathematical downline delay progression or crowding estimate.
- `[SIMULATED DATASET]`: Controlled test scenarios in development or demo lab.
- `[STALE OBSERVATION]`: Telemetry received more than 10 minutes prior with no live updates.
