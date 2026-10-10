# RailOne Next — Feature Acceptance Matrix

**Version:** 4.2.0-recovery  
**Audit Date:** 2026-10-10  
**Integration Branch:** `integrate/railone-recovery-2026-10-10`  
**Quality Baseline:** `review/cris-product-rebuild`  
**Acceptance Status:** **ALL 22 SERVICES & 30 SCENARIOS VERIFIED**

---

## 1. Master 22 Transit Services Feature Acceptance Matrix

Every one of the 22 statutory transit services has been mapped and verified across both the Vite React web application and the Expo native mobile application (`apps/mobile/`), with zero unhandled routes, missing screens, or placeholder dead-ends.

| # | Service ID | Service Name | Category | Mobile Native Route | Web Destination | Backend Endpoint / Provider | Status |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | `unreserved_tickets` | Unreserved Tickets (UTS) | Ticketing | `/booking/local` | `BookingModal` | `/api/v1/booking/reserve` (`mode: 'UTS'`) | **VERIFIED** |
| 2 | `reserved_tickets` | Reserved Tickets (PRS) | Ticketing | `/booking/express` | `BookingModal` | `/api/v1/booking/availability` (`mode: 'PRS'`) | **VERIFIED** |
| 3 | `platform_permits` | Platform Permits | Ticketing | `/booking/local` | `BookingModal` | `/api/v1/booking/reserve` (`type: 'platform'`) | **VERIFIED** |
| 4 | `season_passes` | Season Passes (MST / QST) | Ticketing | `/booking/local` | `BookingModal` | `/api/v1/booking/reserve` (`type: 'season'`) | **VERIFIED** |
| 5 | `metro_ticketing` | Metro Ticketing | Ticketing | `/booking/local` | `BookingModal` | `/api/v1/booking/reserve` (`mode: 'METRO_TOKEN'`) | **VERIFIED** |
| 6 | `my_tickets_qr` | My Tickets & Specimen QR | Ticketing | `/(tabs)/tickets` | `MyTicketsModal` | `/api/v1/tickets/active` | **VERIFIED** |
| 7 | `wallet_recharge` | RailWallet & Recharge | Ticketing | `/(tabs)/tickets?tab=wallet` | `MyTicketsModal` | `OfflineStorage` / In-Memory Wallet Ledger | **VERIFIED** |
| 8 | `cancellation_refunds` | Cancellation & Refunds | Ticketing | `/(tabs)/tickets?tab=cancelled` | `MyTicketsModal` | `/api/v1/booking/cancel` | **VERIFIED** |
| 9 | `journey_planning` | Door-to-Door Journey Planning | Navigation | `/(tabs)/journeys` | `JourneyPlanner` | `/api/v1/routes/search` | **VERIFIED** |
| 10 | `train_running_status` | Train Running Status | Insights | `/(tabs)/status?view=board` | `LiveTrackerModal` | `/api/v1/trains/live/:trainNo` | **VERIFIED** |
| 11 | `crowd_delay_insights` | Historical Crowd & Delays | Insights | `/(tabs)/status?view=crowd` | `CrowdDensityModal` | `/api/v1/crowd/density/:corridor` | **VERIFIED** |
| 12 | `station_navigation_2d` | 2D Station Navigation | Navigation | `/wayfinding?station=DR` | `GodsEyeModal` | `/api/v1/interchanges/layout/:code` | **VERIFIED** |
| 13 | `coach_positioning` | Coach Positioning Guide | Navigation | `/guide?rake=12_CAR` | `CoachGuideModal` | In-App EMU Rake Matrix (Coaches C1–C12) | **VERIFIED** |
| 14 | `railyatri_voice_chat` | Rail Yatri Voice & Chat | Assistance | `/(tabs)/railsathi` | `RailSathiVoiceModal` | `RailBackendTools` Multilingual Engine | **VERIFIED** |
| 15 | `railmadad_help` | RailMadad & Passenger Help | Assistance | External Portal Dialog | Statutory Provider Alert | `https://railmadad.indianrailways.gov.in` (139) | **VERIFIED** |
| 16 | `food_station_amenities` | Food & Station Amenities | Assistance | External Portal Dialog | Statutory Provider Alert | `https://ecatering.irctc.co.in` | **VERIFIED** |
| 17 | `nearest_station` | Nearest Station Locator | Navigation | `/wayfinding?nearest=true` | `GodsEyeModal` | Consent-Based GPS Distance Normalizer | **VERIFIED** |
| 18 | `network_maps` | Network Maps & Interchanges | Navigation | `/map` | `NetworkMapViewer` | `/api/v1/interchanges/hubs` & WGS-84 Maps | **VERIFIED** |
| 19 | `pnr_status` | PNR Status Enquiry | Insights | `/pnr` | `PnrEnquiryModal` | `/api/v1/pnr/:pnr` & CRIS Enquiry Portal | **VERIFIED** |
| 20 | `accessibility_assistance` | Divyangjan Accessibility | Assistance | `/wayfinding?stepFree=true` | `GodsEyeModal` | Step-Free Elevator/Ramp Routing Engine | **VERIFIED** |
| 21 | `disruption_weather` | Weather & Disruption Context | Insights | `/(tabs)/status?view=disruptions` | `DisruptionBulletinModal` | `/api/v1/disruptions/bulletins` | **VERIFIED** |
| 22 | `travel_feedback` | Passenger Travel Feedback | Assistance | `/feedback` | `FeedbackModal` | `/api/v1/feedback` (SQLite Persistence) | **VERIFIED** |

---

## 2. Multi-City Network Coverage Matrix

The coverage matrix fulfills the mandate of **8 mandatory urban regions** at 100% coverage, plus **1 experimental urban region** transparently surfaced without data fabrication.

| # | City / Region ID | Region Name | Coverage Status | Supported Transit Modes | Indexed Stations | Truthfulness & Provenance Guarantee |
| :---: | :--- | :--- | :---: | :--- | :---: | :--- |
| 1 | `mumbai` | Mumbai Metropolitan Region (MMR) | **VERIFIED** | Suburban Rail, Metro (1, 2A, 7, 3), Feeder Bus, Ferry | 50+ | Strict modal code isolation (`GC` vs `METRO_GHT`); 11 surveyed transfer hubs |
| 2 | `delhi` | Delhi NCR | **VERIFIED** | Delhi Metro, Northern Suburban, RRTS, Feeder Bus | 24 | Strict city scoping; zero node leakage into Mumbai graph |
| 3 | `kolkata` | Kolkata Metropolitan Area | **VERIFIED** | Metro, Suburban (Sealdah/Howrah), Tram, Ferry | 16 | Circular/terminal route handling; authentic fare tables |
| 4 | `chennai` | Chennai Metropolitan Area | **VERIFIED** | Chennai Suburban, Chennai Metro, MRTS | 14 | Step-free wheelchair interchange metadata |
| 5 | `bengaluru` | Bengaluru Urban | **VERIFIED** | Namma Metro (Purple/Green), Suburban MEMU | 12 | Real GPS station coordinates |
| 6 | `hyderabad` | Hyderabad Metropolitan | **VERIFIED** | Hyderabad Metro, MMTS Suburban | 12 | Multi-line transfer validation (Ameerpet, Secunderabad) |
| 7 | `pune` | Pune Metropolitan Region | **VERIFIED** | Pune Metro, Pune Suburban EMU (Lonavala corridor) | 10 | Timetable-backed schedule models |
| 8 | `kochi` | Kochi / Kerala Urban | **VERIFIED** | Kochi Metro, Water Metro (Water Ferry) | 8 | Step-free boarding validation for water transport |
| 9 | `ahmedabad` | Ahmedabad Metropolitan | **EXPERIMENTAL** | Gujarat Metro (Ahmedabad Metro), BRTS Feeder | 8 | Transparently badged `[EXPERIMENTAL]`; zero fabricated live telemetry |

- **Total Cities Indexed:** 9
- **Mandatory Cities:** 8 (100% coverage confirmed)
- **Experimental Cities:** 1 (Ahmedabad)
- **Canonical Indexed Stations Snapshot:** 156 stations across Suburban, Metro, and Regional City Packs

---

## 3. Passenger Operational Scenarios Matrix (S01–S30)

| Scenario | Title / Description | Domain | Primary Test Suite | Acceptance Status | Truthfulness / Provenance Guard |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **S01** | Ambiguous Station Disambiguation (Dadar) | Station Normalization | Suite 31.1 | **VERIFIED** | Returns `isAmbiguous: true`, `matchedStation: undefined`, lists DR and DDR |
| **S02** | Direct Station Code Disambiguation | Station Normalization | Suite 31.2 | **VERIFIED** | `DR` resolves to Central, `DDR` resolves to Western |
| **S03** | Ghatkopar Resolution & Script Normalization | Station Normalization | Suite 31.3 | **VERIFIED** | Resolves code `GC`, name, typos (`ghatkoper`), and Devanagari `घाटकोपर` |
| **S04** | Suburban vs Metro Code Isolation | Data Architecture | Suite 31.4 | **VERIFIED** | Central `GC` and Metro `METRO_GHT` maintain separate identities |
| **S05** | Mumbai Metro Network Completeness | Network Modeling | Suite 31.5 | **VERIFIED** | 50 referenced station instances across 4 lines; 0 dangling IDs |
| **S06** | Multimodal City Scoping & Isolation | Graph Engine | Suite 31.6 | **VERIFIED** | Scoped graph prevents cross-city node leakage (`DEL_NDLS` barred in Mumbai) |
| **S07** | Network Coverage Matrix (8+1 Cities) | Network Modeling | Suite 31.7 | **VERIFIED** | 8 mandatory cities confirmed; Ahmedabad flagged `EXPERIMENTAL` |
| **S08** | Truthful National Rail PRS Availability | Ticketing Engine | Suite 31.8 | **VERIFIED** | `[DEMO_SIMULATION]`, `isOfficialInventoryAvailable: false`, 0 fake seats |
| **S09** | Travel Feedback Persistence | Database / Storage | Suite 31.9 | **VERIFIED** | SQLite persistence with CRUD, validation gating, and ratings |
| **S10** | Canonical Station Snapshot (156 Stations) | Station Directory | Suite 31.10 | **VERIFIED** | 156 stations across all 9 cities with snapshot reporting |
| **S11** | Station Interchange Geometry (11 Hubs) | Wayfinding / Geometry | Suite 31.11 | **VERIFIED** | 11 hubs with verified FOB bridge paths and step-free navigation |
| **S12** | Operational Curfew Enforcement | Routing Engine | Suite 31.12 | **VERIFIED** | Late-night queries past curfew return 0 trips; no 10:35 fallback retry |
| **S13** | Thane → Churchgate via Dadar Interchange | Route Planning | Suite 29.6 & G1 | **VERIFIED** | 7-minute FOB interchange walk buffer enforced; respects arrive-by deadline |
| **S14** | Dadar → Kalyan Express Short-Hop Exclusion | Transit Regulatory | Suite 29.7 & G2 | **VERIFIED** | Non-stopping express excluded under Railways Act Section 138 |
| **S15** | Real Delay Inversion (Slow vs Fast Local) | Journey Planning | Suite 29.8 & G3 | **VERIFIED** | Ranks Slow local (62m) over bunched Fast local (73m) with visible badge |
| **S16** | Compounding Downstream Delay Progression | Delay Propagation | G4 | **VERIFIED** | +20m delay at origin compounds to +40m downstream at CSMT |
| **S17** | AC Local EMU Scarcity & Class Reporting | Fare / Fleet Modeling | Suite 30.14 & G5 | **VERIFIED** | Rejects phantom AC trains; reports II and I class fares objectively |
| **S18** | Cancelled Transfer Connection Handling | Resilient Routing | Suite 29.4 & G6 | **VERIFIED** | Prunes cancelled train services from multi-leg transfers |
| **S19** | Onboard Passenger Replanning | Dynamic Routing | G7 | **VERIFIED** | Restricts replanning to forward halts; eliminates backtracking |
| **S20** | Overnight Train Midnight Crossing | Schedule Arithmetic | G8 | **VERIFIED** | Day 0 departure 22:30 carries `dayOffset = 1` for post-midnight stops |
| **S21** | Feed Outage & Stale Observation Fallback | Live Telemetry | Suite 29.9 & G9 | **VERIFIED** | Unobserved trains report `Unavailable (No Live Observation)` truthfully |
| **S22** | Idempotent Booking on Duplicate Tap | Ticketing Store | Suite 29.2 & G10 | **VERIFIED** | Deduplicates rapid taps via idempotency key; prevents duplicate charging |
| **S23** | Ambiguous Payment Timeout Recovery | State Machine | G11 | **VERIFIED** | `PENDING_RECONCILIATION` recovers cleanly to confirmed or refunded |
| **S24** | Explicit Itemized Refund Breakdown | Ticketing / Wallet | Suite 32.6 & G12 | **VERIFIED** | Deducts statutory clerical fee; credits net refund to RailWallet |
| **S25** | Moderation of Crowdsourced Reports | Telemetry Integrity | G13 | **VERIFIED** | Crowdsourced reports sandboxed in `REPORTED`; never auto-promoted |
| **S26** | Multilingual Station Normalization | Localization | Suite 30.4 & G14, G15 | **VERIFIED** | Devanagari script queries resolve; 100% voice and manual parity |
| **S27** | Resilient Offline Caching | PWA / Storage | Suite 27.6 & G16 | **VERIFIED** | Complete offline timetable lookup and specimen pass rendering |
| **S28** | Step-Free Wheelchair Accessible Routing | Accessibility | Suite 29.10 & 32.3 | **VERIFIED** | Isolates elevators/ramps, rejecting steep stairs and non-step-free boats |
| **S29** | Complete 22 Transit Services Parity | System Navigation | Suite 30.9 & 32.1 | **VERIFIED** | All 22 services mapped with zero duplicate IDs across Web and Mobile |
| **S30** | Cinematic Launch Sequence & Accessibility | Visual / Audio UX | Suite 30.12 & 27.8 | **VERIFIED** | 3D perspective rail canvas, dual-tone horn (311Hz/370Hz), WCAG AAA tokens |

---

## 4. Antigravity Mission C — 17 Specific Regression Scenarios Matrix (Suite 33)

| # | Regression Case | Scope & Condition | Test Suite Citation | Status |
| :---: | :--- | :--- | :---: | :---: |
| 1 | Thane to CSMT | Direct Central suburban route planning | Suite 33.1 | **VERIFIED** |
| 2 | Thane to Ghatkopar | Direct Central suburban route planning | Suite 33.2 | **VERIFIED** |
| 3 | Thane to Churchgate via Dadar | Transfer route via Dadar interchange with 7-min FOB buffer | Suite 33.3 | **VERIFIED** |
| 4 | Ghatkopar railway to Ghatkopar Metro | FOB walking transfer leg across suburban and metro | Suite 33.4 | **VERIFIED** |
| 5 | Metro Line 1 with intermediate stations | Versova to Ghatkopar corridor pathfinding | Suite 33.5 | **VERIFIED** |
| 6 | All 8 focus cities + Ahmedabad | Delhi, Bengaluru, Kolkata, Pune, Chennai, Hyderabad, Kochi, Ahmedabad | Suite 33.6 | **VERIFIED** |
| 7 | Unknown station | `matchedStation: undefined` and 0 itineraries | Suite 33.7 | **VERIFIED** |
| 8 | Unsupported cross-city route | Returns 0 itineraries without illegal hops | Suite 33.8 | **VERIFIED** |
| 9 | Missing timetable (past curfew) | 23:58 query returns 0 itineraries (no morning retry) | Suite 33.9 | **VERIFIED** |
| 10 | Unobserved train status | Train 98046 reports `SCHEDULED` with `delayMinutes: null` | Suite 33.10 | **VERIFIED** |
| 11 | Offline station lookup | Search stations with local dataset | Suite 33.11 | **VERIFIED** |
| 12 | Backend unavailable | Graceful degradation in MobileApiClient | Suite 33.12 | **VERIFIED** |
| 13 | Specimen booking and cancellation | Booking creation, clerical deduction, and wallet refund | Suite 33.13 | **VERIFIED** |
| 14 | Invalid vs locally issued PNR | Local PNR found, invalid PNR returns `null` | Suite 33.14 | **VERIFIED** |
| 15 | Fresh launch and returning session | Mute toggle, skip intro, session persistence | Suite 33.15 | **VERIFIED** |
| 16 | Coach guide & station navigation | 12-car formation strip and unindexed blueprint card | Suite 33.16 | **VERIFIED** |
| 17 | All 22 native service buttons | Directory mapping across web and mobile | Suite 33.17 | **VERIFIED** |

---

## 5. Acceptance Certification

This acceptance matrix confirms that **100% of all functional requirements and safety constraints** on `integrate/railone-recovery-2026-10-10` have been tested, witnessed, and validated with zero regressions against the baseline.
