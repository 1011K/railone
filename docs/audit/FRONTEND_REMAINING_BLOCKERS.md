# RailOne Next — Frontend Remaining Blockers & Production Readiness Review

**Audit Date:** 2026-10-10  
**Target Branch:** `fix/railone-mobile-ux-2026-10-10`  
**Review Standard:** Zero Sugarcoating / Plain Technical Accounting

---

## 1. Executive Summary

Mission B has successfully repaired all local passenger app startup flows, 22-service routing parity, station blueprint mapping, offline caching, and specimen ticketing. However, deploying RailOne into live commercial production for 8+ million daily commuters across the Mumbai Metropolitan Region requires addressing several physical, organizational, and integration dependencies that cannot be closed through client-side code alone.

Below is the exhaustive, unvarnished classification of remaining blockers.

---

## 2. Blockers Classification

### Fatal / Upstream Commercial Blockers (Cannot Be Solved Purely In Frontend)

#### 1. Official IRCTC PRS / CRIS Commercial VPN Clearance
- **Severity:** `Fatal Commercial Blocker`
- **Current State:** Specimen ticket booking issues cryptographically signed demonstration QR passes watermarked `[DEMO SPECIMEN — NOT VALID FOR OFFICIAL COMMERCIAL TRAVEL]`. PNR lookup connects to local demonstration specimens and hands off unindexed PNRs to `indianrail.gov.in`.
- **Blocker:** Real commercial ticket booking requires direct IPSEC VPN peering with the Centre for Railway Information Systems (CRIS) PRS gateway in Chanakyapuri, New Delhi, along with licensed payment gateway settlement agreements and IRCTC API user authorization certificates.
- **Remediation Plan:** Maintain strict truthfulness watermarking until formal CRIS enterprise MoU is executed. Never represent specimen tickets as valid commercial travel authority.

#### 2. Live NTES GPS Telemetry Feed Access
- **Severity:** `Fatal Data Integrity Blocker`
- **Current State:** Train departures and delay tracking are derived from timetable schedules, simulated historical delay distributions, and manual mega-block bulletins. Missing live observations report truthfully as `Unavailable (No Live Observation)` without fabricating right-time status.
- **Blocker:** Real-time EMU locomotive telemetry requires access to the National Train Enquiry System (NTES) live GPS sensor feed or Central/Western Railway Control Room telemetry stream (Coa / FOIS).
- **Remediation Plan:** Keep `[PREDICTIVE HEURISTIC MODEL]` and `[TIMETABLE SCHEDULE]` badges surfaced across the UI until live NTES API access is provisioned.

---

## 3. Shallow Verification & Automation Gaps

#### 3. Native Device Hardware Harness (Appium / Detox / Physical Devices)
- **Severity:** `Shallow Verification Risk`
- **Current State:** Frontend code has been validated via TypeScript static analysis (`npm run mobile:lint`), Expo web export (`npm run mobile:build-web`), and automated DOM/source contract tests (`tests/mobile-navigation.test.ts`). Viewports have been visually confirmed via Chrome DevTools Protocol across 360px, 375px, 393px, 412px, and 1280px.
- **Blocker:** Native iOS and Android device compilation requires Xcode and Android SDK toolchains, physical Apple Developer and Google Play signing certificates, and an automated Appium/Detox test farm for native touch gesture validation (e.g. pan-zoom gestures on SVG station maps).
- **Remediation Plan:** Set up continuous integration matrix with automated Detox end-to-end runs on macOS and Linux runners once provisioning profiles are secured.

#### 4. Payment Gateway Integration vs Simulated RailWallet
- **Severity:** `Commercial Gap`
- **Current State:** RailWallet operates in durable simulated mode with instant demo top-up chips (+₹100, +₹200, +₹500) and automated statutory cancellation refund credits.
- **Blocker:** Live monetary recharges require integrating UPI intent flows (Google Pay, PhonePe, Paytm) and RBI-compliant payment aggregators (e.g. Razorpay, SBI ePay, CCAvenue).
- **Remediation Plan:** Implement standard payment gateway webhook listeners and intent dispatchers behind an environment feature flag (`ENABLE_COMMERCIAL_PAYMENTS=false`).

---

## 4. Minor Robustness & Edge Cases

#### 5. Station Blueprint Coverage Beyond 11 Major Hubs
- **Severity:** `Minor Robustness Risk`
- **Current State:** 11 major railway and metro transfer hubs (Dadar, CSMT, Thane, Andheri, Kalyan, New Delhi, Borivali, Kurla, Churchgate, Ghatkopar, Panvel) have detailed 2D/3D platform and FOB schematics. Other stations cleanly render the unindexed fallback card without crashing or falling back to Dadar.
- **Blocker:** Remaining stations on the Central Main line (e.g. Diva, Dombivli), Western line (e.g. Bhayandar, Vasai Road, Virar), and Harbour line (e.g. Vashi, Belapur) require CAD architectural surveys to map foot-over-bridge staircases and elevator landings.
- **Remediation Plan:** Progressively ingest CAD station schematics into `src/fixtures/stationLayoutsData.ts` as surveys are completed.

---

## 5. Reviewer Attack Plan & Recommended Next Steps

1. **Verify Unindexed Station Handling:** Open `/wayfinding?station=DIVA` and verify that the unindexed card is rendered with quick links to indexed hubs, rather than falling back to Dadar.
2. **Verify Wheelchair Mode:** Open `/wayfinding?stepFree=true` and confirm step-free paths highlight while stairs are grayed out.
3. **Verify RailWallet Credits:** Book a specimen ticket, open the tickets tab, cancel the ticket, and observe the refund amount credited to the RailWallet ledger.
4. **Inspect Terminal Curfew Handling:** Search journeys after 23:55 on Metro Line 1 and ensure zero itineraries are returned due to statutory nighttime curfew.
