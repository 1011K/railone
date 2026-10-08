# RailOne Next — Official Data Sources & Provenance Dossier

Every transit schedule, tariff formula, and operating corridor in RailOne Next is grounded in official public timetables, gazetted tariff orders, or regulatory sources.

---

## 1. Verified Operators & Source Registry

| Operator / Authority | Mode | Service Scope | Source URL | Verification Status | Effective Date |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Central Railway (CR)** | Suburban Rail (EMU) | Central Main, Harbour, Trans-Harbour, Uran Line | [indianrailways.gov.in](https://cr.indianrailways.gov.in) | `VERIFIED` | Sep 2026 Public Timetable |
| **Western Railway (WR)** | Suburban Rail (EMU) | Western Suburban Line (Churchgate–Dahanu Road) | [wr.indianrailways.gov.in](https://wr.indianrailways.gov.in) | `VERIFIED` | Sep 2026 Public Timetable |
| **IRCTC / CRIS** | Intercity Rail (PRS) | Mail/Express, Superfast, Vande Bharat | [irctc.co.in](https://www.irctc.co.in) | `VERIFIED` | June 2026 Passenger Tariff |
| **Mumbai Metro One (MMOPL)** | Urban Metro | Line 1 (Versova–Andheri–Ghatkopar) | [reliancemumbaimetro.com](https://www.reliancemumbaimetro.com) | `VERIFIED` | Oct 2026 Operational Schedule |
| **Maha Mumbai Metro (MMMOCL)** | Urban Metro & Monorail | Lines 2A & 7; Line 1 Monorail | [mmmocl.co.in](https://mmmocl.co.in) | `VERIFIED` | Oct 2026 Published Tariff |
| **Mumbai Metro Rail (MMRC)** | Urban Metro | Line 3 Aqua Line (Aarey–BKC–Churchgate) | [mmrcl.com](https://mmrcl.com) | `VERIFIED` | Oct 2026 Phase 2 Schedules |
| **Delhi Metro (DMRC)** | Urban Metro | Red, Yellow, Blue, Violet, Airport Express | [delhimetrorail.com](https://delhimetrorail.com) | `VERIFIED` | Oct 2026 Gazette Tariff |
| **NCRTC (Namo Bharat)** | Regional Rapid Rail | Delhi–Ghaziabad–Meerut RRTS | [ncrtc.in](https://ncrtc.in) | `VERIFIED` | Sep 2026 Operational Sections |
| **Bangalore Metro (BMRCL)** | Urban Metro | Namma Metro Purple & Green Lines | [bmrc.co.in](https://bmrc.co.in) | `VERIFIED` | Sep 2026 Fares & Headways |
| **Eastern Railway & Kolkata Metro** | Suburban & Metro | Sealdah EMU & Underwater Green Line 2 | [mtp.indianrailways.gov.in](https://mtp.indianrailways.gov.in) | `VERIFIED` | Oct 2026 Timetable |
| **Maha Metro Pune** | Urban Metro | Line 1 (PCMC–Swargate) & Line 2 (Vanaz–Ramwadi) | [punemetrorail.org](https://punemetrorail.org) | `VERIFIED` | Sep 2026 Operational Tables |
| **Chennai Metro (CMRL)** | Urban Metro | Blue & Green Lines (Central–Airport) | [chennaimetrorail.org](https://chennaimetrorail.org) | `VERIFIED` | Sep 2026 Published Tariff |
| **Hyderabad Metro (L&T)** | Urban Metro | Red, Blue & Green Lines | [ltmetro.com](https://www.ltmetro.com) | `VERIFIED` | Sep 2026 Timetable |
| **Gujarat Metro (GMRCL)** | Urban Metro | Ahmedabad–Gandhinagar Phase 1 & 2 | [gujaratmetrorail.com](https://www.gujaratmetrorail.com) | `VERIFIED` | Sep 2026 Tariff Slabs |
| **BEST Undertaking** | Public Bus | AC Electric Feeder & Express Routes | [bestundertaking.net](https://bestundertaking.net) | `VERIFIED` | Sep 2026 Distance Slabs |
| **M2M Ferries** | Passenger Ferry | Bhaucha Dhakka ➔ Mandwa Ro-Pax | [m2mferries.com](https://m2mferries.com) | `VERIFIED` | Oct 2026 Vessel Schedules |
| **Regional Transport Authority** | Auto & Kaali-Peeli | Metered Autorickshaw & Taxi Tariffs | [transport.maharashtra.gov.in](https://transport.maharashtra.gov.in) | `ESTIMATED_MODEL` | June 2026 Gazetted Tariff |

---

## 2. Telemetry & Data Quality Classification

To eliminate data fabrication, every time-sensitive or dynamic claim is classified into one of four unambiguous categories:

1. **`[VERIFIED LIVE]`**: Real-time telemetry confirmed by authentic track circuit sensors, GPS, or published controller dispatch feeds.
2. **`[TIMETABLE SCHEDULE]`**: Published working timetable schedules, scheduled halt patterns, and official headway frequencies.
3. **`[ESTIMATED MODEL]`**: Regulated statutory tariffs or distance formulas (e.g. RTO metered taxi slabs, average street congestion speeds).
4. **`[UNAVAILABLE]`**: No live observation exists or service is currently suspended. RailOne Next will never present fallback `"Right Time"` or invented platform allocations when feeds are missing.
