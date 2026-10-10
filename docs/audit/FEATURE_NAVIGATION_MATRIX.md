# RailOne Next — 22 Transit Services Feature Navigation Matrix

**Version:** 4.2.0  
**Audit Date:** 2026-10-10  
**Branch:** `fix/railone-mobile-ux-2026-10-10`

---

## Master 22-Services Navigation & Screen Matrix

This matrix documents the bidirectional contract between the Passenger Web Application (`src/components/`) and the Expo Native Mobile Application (`apps/mobile/app/`). Every single service resolves to a verified functional screen or statutory modal.

| # | Service ID | Service Name | Category | Mobile Native Route | Web Destination | Params / Payload | Verification Status |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | `unreserved_tickets` | Unreserved Tickets (UTS) | Ticketing | `/booking/local` | `BookingModal` (UTS) | `mode: 'UTS'` | **VERIFIED** |
| 2 | `reserved_tickets` | Reserved Tickets (PRS) | Ticketing | `/booking/express` | `BookingModal` (PRS) | `mode: 'PRS'` | **VERIFIED** |
| 3 | `platform_permits` | Platform Permits | Ticketing | `/booking/local` | `BookingModal` (Platform) | `type: 'platform'` | **VERIFIED** |
| 4 | `season_passes` | Season Passes (MST / QST) | Ticketing | `/booking/local` | `BookingModal` (Season) | `type: 'season'` | **VERIFIED** |
| 5 | `metro_ticketing` | Metro Ticketing | Ticketing | `/booking/local` | `BookingModal` (Metro) | `mode: 'METRO_TOKEN'` | **VERIFIED** |
| 6 | `my_tickets_qr` | My Tickets & Specimen QR | Ticketing | `/(tabs)/tickets` | `MyTicketsModal` | `tab: 'upcoming'` | **VERIFIED** |
| 7 | `wallet_recharge` | RailWallet & Recharge | Ticketing | `/(tabs)/tickets` | `MyTicketsModal` (Wallet) | `tab: 'wallet'` | **VERIFIED** |
| 8 | `cancellation_refunds` | Cancellation & Refunds | Ticketing | `/(tabs)/tickets` | `MyTicketsModal` (Cancelled) | `tab: 'cancelled'` | **VERIFIED** |
| 9 | `journey_planning` | Door-to-Door Journey Planning | Navigation | `/(tabs)/journeys` | `JourneyPlanner` | `from, to, city, date` | **VERIFIED** |
| 10 | `train_running_status` | Train Running Status | Insights | `/(tabs)/status` | `LiveTrackerModal` | `view: 'board'` | **VERIFIED** |
| 11 | `crowd_delay_insights` | Historical Crowd & Delays | Insights | `/(tabs)/status` | `CrowdDensityModal` | `view: 'crowd'` | **VERIFIED** |
| 12 | `station_navigation_2d` | 2D Station Navigation | Navigation | `/wayfinding` | `GodsEyeModal` | `station: 'DR'` (or user hub) | **VERIFIED** |
| 13 | `coach_positioning` | Coach Positioning Guide | Navigation | `/guide` | `CoachGuideModal` | `rake: '12_CAR'` | **VERIFIED** |
| 14 | `railyatri_voice_chat` | Rail Yatri Voice & Chat | Assistance | `/(tabs)/railsathi` | `RailSathiVoiceModal` | `lang: 'en'\|'hi'\|'mr'` | **VERIFIED** |
| 15 | `railmadad_help` | RailMadad & Passenger Help | Assistance | External Portal Dialog | Statutory Provider Alert | `url: 'https://railmadad.indianrailways.gov.in'` | **VERIFIED** |
| 16 | `food_station_amenities` | Food & Station Amenities | Assistance | External Portal Dialog | Statutory Provider Alert | `url: 'https://ecatering.irctc.co.in'` | **VERIFIED** |
| 17 | `nearest_station` | Nearest Station Locator | Navigation | `/wayfinding` | `GodsEyeModal` (GPS) | `nearest: 'true'` | **VERIFIED** |
| 18 | `network_maps` | Network Maps & Interchanges | Navigation | `/map` | `NetworkMapViewer` | `scope: 'mumbai'` | **VERIFIED** |
| 19 | `pnr_status` | PNR Status Enquiry | Insights | `/pnr` | `PnrEnquiryModal` | `pnr: string` | **VERIFIED** |
| 20 | `accessibility_assistance` | Divyangjan Accessibility | Assistance | `/wayfinding` | `GodsEyeModal` (Step-Free) | `stepFree: 'true'` | **VERIFIED** |
| 21 | `disruption_weather` | Weather & Disruption Context | Insights | `/(tabs)/status` | `DisruptionBulletinModal` | `view: 'disruptions'` | **VERIFIED** |
| 22 | `travel_feedback` | Passenger Travel Feedback | Assistance | `/feedback` | `FeedbackModal` | `feedback: object` | **VERIFIED** |

---

## Screen & Flow Deep-Dive Verification

### 1. `metro_ticketing`
- **Route:** `/booking/local` with `{ mode: 'METRO_TOKEN' }`
- **Behavior:** Opens the suburban booking workflow configured for Mumbai Metro lines (Line 1 Versova-Ghatkopar, Line 2A Dahisar-Andheri West, Line 7 Dahisar-Gundavali, Line 3 Aarey-BKC-Cuffe Parade). Fares calculate dynamically (₹10–₹40), and generated tickets appear in the active tickets tab with authenticated demo QR payloads.

### 2. `wallet_recharge`
- **Route:** `/(tabs)/tickets` with `{ tab: 'wallet' }`
- **Behavior:** Directly displays the RailWallet view with available balance (default ₹250.00), simulated transit wallet badge, quick recharge chips (+₹100, +₹200, +₹500), and an itemized ledger detailing credits and debits.

### 3. `cancellation_refunds`
- **Route:** `/(tabs)/tickets` with `{ tab: 'cancelled' }`
- **Behavior:** Filters passenger ticket list to cancelled and refunded tickets. When initiating cancellation on an active ticket, statutory clerical deductions (e.g., ₹30) are calculated, and net refund is credited directly to the simulated RailWallet with an instant notification.

### 4. `nearest_station` & `accessibility_assistance`
- **Route:** `/wayfinding` with `{ nearest: 'true' }` or `{ stepFree: 'true' }`
- **Behavior:**
  - With `nearest=true`, displays a `[CONSENT-BASED GPS PROXIMITY]` banner highlighting the closest indexed transit terminal (e.g. Dadar Junction via Tilak Bridge Concourse).
  - With `stepFree=true`, initializes wheelchair routing mode, isolating elevators, ground-level ramps, and tactile paving corridors while excluding non-accessible FOB staircases.

### 5. `crowd_delay_insights` & `disruption_weather`
- **Route:** `/(tabs)/status` with `{ view: 'crowd' }` or `{ view: 'disruptions' }`
- **Behavior:**
  - With `view=crowd`, renders empirical rush-hour heuristics (morning CST/Churchgate inbound; evening outward) and corridor bunching statistics.
  - With `view=disruptions`, renders statutory bulletins for Central Railway Sunday Mega-Blocks (Matunga-Mulund slow line diversion), Western Railway Jumbo-Blocks (Borivali-Goregaon fast line diversion), and monsoon high tide warnings.

### 6. `pnr_status` & `travel_feedback`
- **Route:** `/pnr` and `/feedback`
- **Behavior:**
  - PNR screen provides honest local lookup against demo specimen tickets. Unindexed numbers display a CRIS/IRCTC handoff card with direct link to the official Indian Railways inquiry portal (`https://www.indianrail.gov.in/enquiry/PNR/PnrEnquiry.html`).
  - Feedback screen captures 5-star ratings across cleanliness, punctuality, amenities, and security, persisting draft submissions offline in `OfflineStorage`.

### 7. Canonical Station Resolver & 3D Train Visualization
- **Station Search Service:** `apps/mobile/src/services/canonicalStationResolver.ts`
- **Behavior:**
  - Robust offline typo normalization (e.g. `ghatkoper`, `gatkopar`, `ghatcopar` resolve to Central Suburban `GC`).
  - Native Devanagari script queries (e.g. `घाटकोपर` resolves to `GC` with `EXACT` confidence, while isolating `METRO_GHT`).
  - Multi-platform disambiguation: Generic `dadar` flags platform ambiguity, returning both `DR` (Central) and `DDR` (Western) candidates.
- **3D Visualization:** `src/components/MovingTrain3DModal.tsx` wired into `PassengerMobileApp.tsx` with actions for `moving_train_3d`, `3d_train`, `cancellation_refunds`, and `replay_launch`.

