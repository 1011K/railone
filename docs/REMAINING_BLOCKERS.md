# RailOne Next 3.0 — Remaining External Blockers & Institutional Gateways

## 1. Purpose & Transparency Declaration
This document transparently delineates the boundary between **fully working, independently tested product functionality** and **external institutional dependencies** that legally require sovereign government authorization, payment aggregator credentials, or licensed telecom infrastructure.

RailOne Next 3.0 does not pretend inaccessible official services work. Instead, it provides complete, type-safe adapter contracts and self-contained transaction simulators for all restricted domains.

---

## 2. Institutional Blocker Register

| Blocker ID | Domain / Capability | Current Implementation Status | Sovereign Dependency / Blocker Description | Path to Institutional Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **BLK-01** | **Live CRIS / PRS / UTS Ticket Issuance** | **INDEPENDENT SIMULATOR COMPLETE**: Full state machine (`DRAFT` → `VALIDATING` → `PAYMENT` → `ISSUED`), idempotency deduplication, timeout recovery, and itemized refund engine. | Direct PRS/UTS ticket issuance requires formal bilateral MoU with the Ministry of Railways / CRIS, STQC security certification, and production credentials. | Deploy CRIS-compliant ISO 8583 / JSON REST adapter upon institutional contract signing. |
| **BLK-02** | **Live Real-Time Train Telemetry (RTIS / NTES)** | **FALLBACK MODEL COMPLETE**: Published Working Time Table (WTT) schedules, sectional delay compounding model (+20m to +40m), and explicit `[TIMETABLE SCHEDULE]` labelling. | Official RTIS GPS sensor data transmitted via ISRO GSAT transponders resides on restricted CRIS intranet; public scraping is legally prohibited. | Ingest authorized NTES GTFS-RT / Webhook stream via authorized CRIS Data Exchange gateway. |
| **BLK-03** | **Monetary Payment Settlement (UPI / Cards)** | **TRANSACTION SIMULATOR COMPLETE**: Idempotent duplicate-tap deduplication, network timeout simulation, and reconciliation state transitions. | Real financial transactions require an RBI-authorized Payment Aggregator (e.g. SBI ePay, Razorpay) merchant account and nodal bank escrow. | Plug in payment gateway webhook handlers into existing typed `PaymentGatewayAdapter` interface. |
| **BLK-04** | **PSTN / Telephony Voice Dialer (139 Integration)** | **IN-APP DIALER COMPLETE**: Browser Web Speech API and responsive in-app dialer calling deterministic `RailBackendTools` with 0ms latency and ₹0 cost. | Dialing actual Indian telecom numbers (e.g. 139) requires licensed SIP trunking (DoT/TRAI compliance) and commercial telephony credits. | Connect SIP trunk to existing Asterisk/Dograh gateway contract when enterprise telephony is funded. |

---

## 3. Summary of System Autonomy
- **Zero Paid Dependencies Required to Run**: The entire application, test suite, journey planner, 2D/3D maps, and 3D station navigators run 100% locally and offline without external paid cloud keys.
- **Auditable Safety**: No user credentials, banking details, or fake government representations are introduced into the codebase.
