# RailOne Next 3.0 — RailSathi Voice & AI Assistant Specification

**Reference Specification**: Section 10 — Voice and AI Assistant  
**Core Implementations**: `voiceTools.ts`, `VoiceDialerModal.tsx`, `aiService.ts`  
**Date**: October 2026 | **Classification**: Voice Tooling & Deterministic Parity  

---

## 1. Executive Summary & Deterministic Parity Rule

Many conversational voice assistants in public transit applications suffer from a critical safety flaw: large language models hallucinating unsupplied fares, non-existent trains, or incorrect platform numbers.

**RailOne Next 3.0 strictly forbids AI hallucination**. The RailSathi Voice Assistant is built upon an architectural contract of **100% Deterministic Parity**:
- Every voice query triggers the exact same backend engine functions as a manual UI click.
- The voice assistant never estimates, guesses, or invents railway fares, train numbers, or delays.
- Paraphrasing is restricted strictly to verified tool response outputs.
- **Verified Test**: Master Plan Scenario `[G15]` (Voice & Manual 100% Function Parity: 4/4 assertions pass).

---

## 2. Shared Deterministic Backend Tools Contract

The `RailBackendTools` suite (`src/engine/voiceTools.ts`) exposes eight typed, deterministic tools:

1. `searchTrains(params: { fromStation, toStation, departAfterTime?, arriveByTime?, travelClass? })`
   - Invokes `planJourneys()` directly; enforces interchange walk buffers and delay inversion checks.
2. `getLiveStatus(params: { trainNumber })`
   - Fetches actual delay, current section, and next stop without hallucinating GPS.
3. `validateEligibility(params: { trainNumber, fromStation, toStation, travelClass? })`
   - Evaluates Section 138 penalties and Central Railway MST list rules.
4. `compareItineraries(params: { fromStation, toStation, time? })`
   - Compares Slow vs Fast Local arrival times and provides ranking explanations.
5. `quoteFare(params: { fromStation, toStation, travelClass })`
   - Calculates exact distance-based suburban and express tariffs.
6. `createBookingDraft(params: { itineraryId, travelClass })`
   - Generates an idempotent booking draft with cryptographic keys.
7. `confirmDemoBooking(params: { orderId, otp? })`
   - Executes deterministic specimen ticket issuance.
8. `reconcileDemoBooking(params: { orderId })`
   - Recovers pending reconciliation orders without duplicate billing.

---

## 3. Multilingual Speech Recognition & Transliteration

RailSathi supports browser Web Speech API and an in-app telephone keypad dialer:
- Languages: English (`en-IN`), Hindi (`hi-IN`), and Marathi (`mr-IN`).
- Station Query Normalization: Voice utterances like `"कल्याण से दादर की लोकल बताओ"` or `"ठाण्याहून चर्चगेटला जायचे आहे"` are normalized through `stationNormalizer.ts` into exact uppercase station codes (`KYN`, `DR`, `TNA`, `CCG`).
- Station Ambiguity Resolution: Prompts commuter for disambiguation if colloquial terms refer to multiple lines (e.g. "Dadar Central vs Dadar Western").
