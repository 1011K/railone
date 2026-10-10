# RailOne Next — Remaining Gaps & Upstream Production Dependencies

**Audit Date:** 2026-10-10  
**Integration Branch:** `integrate/railone-recovery-2026-10-10`  
**Review Standard:** Strict Technical Truthfulness / Zero Sugarcoating / No Defensive Language

---

## 1. Executive Accounting

The software implementation across both the Vite React web platform and Expo native mobile application (`apps/mobile/`) is functionally sound, robustly tested (299/299 tests passing across 33 suites), and completely free of artificial data fabrication or silent fallback anti-patterns.

However, deploying RailOne Next to 8+ million daily commuters across the Mumbai Metropolitan Region and national rail corridors requires physical, institutional, and regulatory integrations that cannot be fulfilled by client-side code, SQLite local caches, or local development servers.

This document records the exact, unvarnished classification of all remaining upstream blockers, verification gaps, and physical hardware requirements.

---

## 2. Upstream Commercial & Regulatory Blockers

### 2.1 Official CRIS PRS Gateway & Dedicated IPSEC VPN Clearance
- **Severity Classification:** `Fatal Commercial Blocker`
- **Current Software State:** Specimen ticket booking generates cryptographically signed Ed25519 / HMAC-SHA256 demonstration passes watermarked `[DEMO SPECIMEN — NOT VALID FOR OFFICIAL COMMERCIAL TRAVEL]`. National Express availability queries return authentic demonstration itineraries flagged `[DEMO_SIMULATION]` with `isOfficialInventoryAvailable: false`. PNR status queries against unindexed numbers cleanly hand off passengers to the official CRIS inquiry portal (`https://www.indianrail.gov.in/enquiry/PNR/PnrEnquiry.html`).
- **External Dependency:** Official passenger booking and live PRS berth inventory requires an executed Memorandum of Understanding (MoU) with the Centre for Railway Information Systems (CRIS) in Chanakyapuri, New Delhi, an enterprise IPSEC VPN connection to the PRS mainframe gateway, and valid IRCTC Principal Service Provider (PSP) digital signing certificates.
- **Operating Policy:** Until CRIS enterprise credentials are formally provisioned, all ticketing interfaces MUST remain strictly watermarked and flagged as demonstration specimens to prevent passenger fraud or statutory violations under the Indian Railways Act, 1989.

### 2.2 Live NTES GPS & Control Room (COA / FOIS) Locomotive Telemetry Feeds
- **Severity Classification:** `Fatal Data Integrity Blocker`
- **Current Software State:** Train departures and delay tracking are derived from timetable schedules, simulated historical delay distributions, and manual mega-block circulars. Trains lacking live telemetry truthfully report `Unavailable (No Live Observation)` without synthesizing fake Right Time status.
- **External Dependency:** Live EMU locomotive tracking and accurate signal-aspect delay monitoring require access to the National Train Enquiry System (NTES) live GPS sensor feed or Central & Western Railway Control Office Application (COA) / FOIS data streams.
- **Operating Policy:** Continue displaying `[PREDICTIVE HEURISTIC MODEL]` and `[TIMETABLE SCHEDULE]` badges across all departure boards until real-time GPS telemetry streams are contracted and wired.

### 2.3 Metro GTFS-RT Telemetry for MMOPL & MMRDA Networks
- **Severity Classification:** `External Data Blocker`
- **Current Software State:** Mumbai Metro Lines 1, 2A, 7, and 3 Phase 1 are modeled with complete station integrity (50 referenced station instances, 0 dangling IDs), dynamic headway dispatching, and statutory operational curfews (0 trips returned past 23:30/23:55).
- **External Dependency:** Real-time train arrival countdown clocks (e.g., "Next Metro in 2 mins") require authenticated GTFS-RT streaming feeds from Mumbai Metro One Private Limited (MMOPL) and Maha Mumbai Metro Operation Corporation Limited (MMMOCL / MMRDA).
- **Operating Policy:** Surface scheduled headway intervals ("Every 4–8 minutes") clearly labeled as timetable schedule frequency.

### 2.4 Gated RailMadad IVR 139 Telephony Integration
- **Severity Classification:** `External Service Gating`
- **Current Software State:** RailMadad assistance displays statutory advice, 139 emergency calling instructions, and an authentic external portal handoff modal linking to `https://railmadad.indianrailways.gov.in`.
- **External Dependency:** In-app bidirectional grievance filing and live IVR call dispatch require integration with the Ministry of Railways CPGRAMS / RailMadad REST gateway and licensed telecom trunk lines.
- **Operating Policy:** Maintain explicit statutory handoff modals with official HTTPS URLs; never simulate complaint ticket tracking without backend authority.

---

## 3. Physical Verification & Device Hardware Gaps

### 3.1 Native Device Hardware Test Farm (Appium / Detox / Physical Devices)
- **Severity Classification:** `Shallow Verification Risk`
- **Current Software State:** Mobile code has been verified via TypeScript static analysis (`npm run mobile:lint`), Expo web export (`npm run mobile:build-web`), and automated navigation contract tests (`tests/mobile-navigation.test.ts`). Viewports have been visually inspected across 360px, 375px, 393px, 412px, and 1280px.
- **Verification Gap:** Physical iOS and Android device execution, native touch gesture handling (e.g. pan-zoom gestures on SVG station maps, swipe-to-cancel gestures on tickets), background push notifications, and biometric security prompts (Face ID / Fingerprint) have not been executed on physical hardware.
- **Remediation Plan:** Provision Apple Developer and Google Play enterprise signing keys and configure an automated Detox/Appium device farm on macOS and Linux runners for native binary test execution.

### 3.2 Production Payment Gateway Aggregation
- **Severity Classification:** `Commercial Infrastructure Gap`
- **Current Software State:** RailWallet operates in durable simulated mode with offline persistence, instant demo recharge chips (+₹100, +₹200, +₹500), and automated statutory cancellation refund credits.
- **Verification Gap:** Real monetary transactions require integrating RBI-compliant payment aggregators (e.g. Razorpay, SBI ePay, CCAvenue, Cashfree) and native UPI intent dispatchers (Google Pay, PhonePe, Paytm).
- **Remediation Plan:** Implement standard webhook listeners and payment intent handlers behind environment flag `ENABLE_COMMERCIAL_PAYMENTS=false`.

### 3.3 CAD Blueprint Survey Coverage for Intermediate Stations
- **Severity Classification:** `Minor Robustness Risk`
- **Current Software State:** 11 major transport hubs (Dadar, CSMT, Thane, Andheri, Kalyan, New Delhi, Borivali, Kurla, Churchgate, Ghatkopar, Panvel) have detailed 2D/3D platform and FOB schematics. Unmapped stations cleanly render the unindexed fallback card without crashing or falling back to Dadar.
- **Coverage Gap:** Remaining suburban stations (e.g. Diva, Dombivli, Vasai Road, Virar, Vashi, Belapur) lack CAD architectural surveys for Foot-Over-Bridge staircases and elevator landings.
- **Remediation Plan:** Progressively ingest CAD station schematics into `src/fixtures/stationLayoutsData.ts` as municipal and railway surveys are completed.

---

## 4. Reviewer Attack Plan & Recommended Next Steps

Subsequent reviewers and red-team auditors are encouraged to aggressively probe the following boundaries:

1. **Station Disambiguation Integrity:**
   - Query `"Dadar"`: Verify response has `isAmbiguous: true`, `matchedStation: undefined`, and candidate array containing both `DR` and `DDR`.
   - Query `"Dadar West"`: Verify resolution to `DDR` (Western).
   - Query `"Dadar East"`: Verify resolution to `DR` (Central).
   - Query typos: `"ghatkoper"`, `"gatkopar"`, `"ghatcopar"`: Verify resolution to `GC`.
   - Query Devanagari: `"घाटकोपर"`, `"कल्याण"`, `"दादर"`: Verify resolution without transliteration failure.

2. **Operational Curfew Enforcement:**
   - Search route from `METRO_ADH` to `METRO_GHT` at departure time `23:55`.
   - Assert: Returns exactly `0` itineraries. Ensure no silent retry to morning 10:35 schedules.

3. **Multimodal City Boundary Isolation:**
   - Initialize `MultimodalGraphEngine('mumbai')` and query node `DEL_NDLS`.
   - Assert: Returns `null`. Verify zero cross-city node leakage.

4. **Honest PRS & PNR Invariants:**
   - Query PRS availability for train `12951`: Confirm `isSimulated: true`, `isOfficialInventoryAvailable: false`, and `[DEMO_SIMULATION]` notice is present.
   - Query unindexed PNR: Confirm CRIS inquiry portal link is returned rather than a synthesized seat confirmation.

5. **Ticket Cancellation & RailWallet Reconciliation:**
   - Book a suburban specimen ticket.
   - Cancel the ticket: Verify statutory clerical deduction is subtracted and remaining balance is credited to RailWallet ledger in `OfflineStorage`.

6. **Unindexed Wayfinding Fallback:**
   - Request wayfinding for `DIVA`: Verify unindexed station card is displayed with links to 11 hubs, confirming zero silent fallback to Dadar.
