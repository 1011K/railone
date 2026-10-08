# RailOne Next — Known Limitations & System Boundaries

This document defines the technical boundaries, operating constraints, and scope limitations of RailOne Next.

---

## 1. Research Demonstration Prototype Status

- **Independent Project**: RailOne Next is an independent engineering research demonstration. It is **not** an official application of the Ministry of Railways, Centre for Railway Information Systems (CRIS), or IRCTC.
- **Specimen Tickets**: All specimen bookings generated within the app are strictly watermarked `DEMO – NOT VALID FOR TRAVEL`. They cannot be used as valid travel authority aboard any train, metro, or bus.

---

## 2. External Ticketing & Booking Hand-off

- **Official Provider Deep Links**: For authentic ticketing, RailOne Next provides verified deep links to official applications (e.g., UTS Mobile for unreserved suburban tickets, IRCTC Rail Connect for reserved trains, Chalo for BEST buses, and Mumbai Metro 1 app).
- **No Direct Financial Settlement**: RailOne Next does not process commercial banking transactions or issue official PRS PNR credentials.

---

## 3. Native Platform SDK Requirements

- **Local Web Demonstration**: Fully runnable with Node 20+ and npm without external dependencies.
- **Native Android & iOS Builds**: Compiling native mobile binaries (`.apk`, `.aab`, `.ipa`) or running local Android/iOS emulators requires platform toolchains (Android Studio / SDK, Java 17, Xcode on macOS). Extracting a repository ZIP does not bypass native SDK requirements.

---

## 4. Real-Time Telemetry & Maritime Conditions

- **Maritime Ferries**: Mandwa and Hooghly ferry operations are subject to monsoon weather restrictions and port authority directives. In the absence of real-time harbor dispatch telemetry, ferry departures are tagged as scheduled timetable approximations.
- **Cellular Dead Zones**: When transit passengers enter subterranean tunnels or remote track sectors without cellular connectivity, live delay feeds gracefully degrade to cached timetable schedules.

---

## 5. Crowding & Delay Heuristics

- **Sensor Feeds vs. Heuristic Models**: In stations lacking live passenger density sensor feeds, crowding levels are estimated using historical time-of-day directional rush heuristics (e.g., morning peak inward toward South Mumbai; evening peak outward toward suburbs). These are clearly labeled as predictive models rather than confirmed sensor counts.
