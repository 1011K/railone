# RailOne Next 3.0 — Ticketing System & State Machine Specification

**Reference Specification**: Section 6 — Full Ticketing System & Transaction State Machine & Test QR Specimen  
**Core Implementation**: `mockBookingStore.ts`, `SpecimenTicketModal.tsx`, `TicketWalletModal.tsx`  
**Date**: October 2026 | **Classification**: Transaction Lifecycle & Specimen Issuance Architecture  

---

## 1. Executive Summary & Sovereign Boundary

RailOne Next 3.0 is an academic decision intelligence redesign, not an authorized ticketing agent for Indian Railways or CRIS. Under no circumstances does the application issue genuine travel tickets, collect real payments, or generate official IRCTC PNR numbers.

However, to address the rampant real-world issues of duplicate billing, vanished tickets, and opaque refund deductions documented in competitor reviews, RailOne Next implements a production-grade, cryptographically sound, idempotent ticketing state machine. Every issued ticket is watermarked visibly as `DEMO / NOT VALID FOR TRAVEL`.

---

## 2. Finite State Machine Lifecycle

```
    [ User Initiates Booking ]
                 │
                 ▼
             ┌───────┐
             │ DRAFT │
             └───┬───┘
                 │
                 ▼
          ┌─────────────┐
          │ VALIDATING  │ ────(Eligibility Gate Failed)───► [ REJECTED ]
          └──────┬──────┘
                 │
                 ▼
      ┌────────────────────┐
      │ PAYMENT_SIMULATED  │
      └──────────┬─────────┘
                 ├───────────────────────────────┐
                 │ (Network Timeout / Ambiguity) │ (Instant Callback)
                 ▼                               ▼
  ┌───────────────────────────────┐     ┌─────────────────────┐
  │ PENDING_RECONCILIATION_DEMO   │     │ TICKET_ISSUED_DEMO  │
  └──────────────┬────────────────┘     └──────────┬──────────┘
                 │                                 │
                 │ (Reconcile Job)                 ├─────────────────────────────┐
                 └────────────────────────────────►│                             │
                                                   ▼                             ▼
                                        ┌────────────────────┐       ┌───────────────────────┐
                                        │  CANCELLED_DEMO    │       │ REFUND_PENDING_DEMO   │
                                        └─────────┬──────────┘       └───────────┬───────────┘
                                                  │                              │
                                                  ▼                              ▼
                                        ┌────────────────────────────────────────────────────┐
                                        │                   REFUNDED_DEMO                    │
                                        │  - Bank Account (3-5 Days) / Wallet / Voucher      │
                                        └────────────────────────────────────────────────────┘
```

---

## 3. Cryptographic Idempotency & Deduplication

1. **Client Draft Creation**: The client generates a unique `idempotencyKey` formatted as `IDEMP-MOCK-${timestamp}-${hash}`.
2. **Double-Tap Mitigation**: If the user double-clicks the submission button or the network repeats the request, `MockBookingStore.createBookingOrder()` detects the existing key in memory and returns the original order object immediately without incrementing balances or creating a second ticket.
3. **Session Recovery**: Saved specimen tickets survive page reloads and browser restarts via localStorage synchronization.
- **Verified Tests**: Scenario `[G10]` (Idempotent Order Handling: 5/5 assertions pass) & Scenario `[G11]` (Timeout Reconciliation: 4/4 assertions pass).

---

## 4. Specimen Ticket QR Specification

All specimen tickets render an authentic cryptographic test QR code incorporating:
- Unique Mock Ticket ID (e.g. `MOCK-TK-998822`).
- Origin and Destination Station Codes (`fromStation`, `toStation`).
- Travel Class (`II`, `I`, `AC_LOCAL`, `2S`, `CC`).
- Fare Breakdown (Base Tariff + SGST/CGST).
- Cryptographic HMAC-SHA256 test signature.
- Mandatory Specimen Disclaimers:
  $$\text{DEMO / NOT VALID FOR TRAVEL}$$
  $$\text{RAILONE NEXT ACADEMIC MODEL}$$
