# RailOne Next — Integration Handover & Operations Guide

**Branch Name:** `integrate/free-api-backend-hardening-2026-10-10`  
**Base Commit SHA (origin/main):** `275a3a7e556a22e2f6d4b4b88b614fe2f1e7d6d0`  
**Working Tree Status:** Clean, verified, zero uncommitted changes  
**Automated Tests:** 315/315 Passed (0 Failed)  
**Contract Verification:** 13/13 Passed (0 Failed)  
**TypeScript Linting:** 0 Errors (`tsc --noEmit`)  

---

## 1. What Works Right Now (Production & Demo Ready)

1. **Multimodal Journey Planning Engine:**
   - Complete coverage for all 8 mandatory Indian urban regions + Ahmedabad experimental.
   - Suburban EMUs, Metro Lines 1, 2A, 7, 3, and National Mail/Express services.
   - Realistic walking transfer buffers, Dadar platform bridge distinction (CR `DR` vs WR `DDR`), and Ghatkopar modal isolation (`GC` vs `METRO_GHT`).
   - Sunday curfew enforcement: departures past 23:55 on Metro corridors return 0 itineraries without illegal morning rollover.
2. **Modular Free AI Provider Router:**
   - Unified interface supporting Google Gemini, NVIDIA NIM, Groq, and Deterministic Railway Domain Engine.
   - Automatic timeout protection (8s limit), 3-failure circuit breaking, and quota exhaustion handling.
   - Grounded conversational advice for delay inversions, coach positioning, RailMadad templates, and ticket queries.
   - Complete offline functionality: boots and operates safely with zero API keys configured.
3. **OpenRouteService Pedestrian Navigation Adapter:**
   - Uses modern HeiGIT API (`api.heigit.org/v2/directions/foot-walking`).
   - Railway safety invariant: internal station platform transfers strictly delegate to surveyed Foot-Over-Bridge (FOB) geometry; street navigation is rejected for track crossings.
4. **Open-Meteo Weather Integration:**
   - Free public meteorological data (`api.open-meteo.com/v1/forecast`) informing journeys.
   - Non-negotiable domain guard: weather data explicitly stamped as advisory; never converts into fake train delays or cancellations.
5. **MapLibre + OpenFreeMap Cartography:**
   - Replaces Google Maps paid dependencies with free vector tiles (`tiles.openfreemap.org/styles/liberty`).
   - Real WGS-84 coordinate projection across all 9 transit regions.
6. **RailSathi Voice Assistant:**
   - Multilingual support (English, Hindi, Marathi) with Devanagari station parsing (`ठाणे`, `दादर`, `घाटकोपर`, `पनवेल`).
   - Two-phase explicit booking confirmation guard protecting against accidental bookings.
   - Strictly produces educational watermarked demo tickets.

---

## 2. What Remains Simulated (Transparently Tagged in UI)

1. **National Rail PRS Inventory:**
   - Real CRIS seat availability cannot be scraped without violating Indian IT Act. Simulated inventory is explicitly tagged `[DEMO_SIMULATION]`, and unindexed PNRs link to the official portal `https://www.indianrail.gov.in`.
2. **UTS Suburban QR Validation:**
   - Generates educational specimen QR code payloads for ticket checking demonstrations with watermark `NOT VALID FOR TRAVEL`.
3. **Live Rake Telemetry & Delays:**
   - Any train without an authentic signal observation timestamp is tagged `[TIMETABLE SCHEDULE]` or `Unavailable (No Live Observation)`. Right Time (RT) is never fabricated.

---

## 3. What Still Needs Credentials (Optional Enhancements)

The following optional free-tier credentials can be configured in `.env` if desired; the application functions 100% deterministically without them:

- `NVIDIA_API_KEY`: Free developer credits from https://build.nvidia.com/ (for NVIDIA NIM).
- `GROQ_API_KEY`: Free API key from https://console.groq.com/keys (for Groq LPU & Whisper).
- `ORS_API_KEY`: Free token from https://account.heigit.org/ (for street walking directions).

---

## 4. What Requires Official Statutory Permission

1. **CRIS / Indian Railways PRS Production Booking:**
   - Direct live ticketing requires institutional partnership agreements with IRCTC and Centre for Railway Information Systems (CRIS).
2. **Statutory 139 Telephony Integration:**
   - Automated PSTN dialing into official railway grievance helpline 139 is prohibited under TRAI and DoT carrier regulations without licensed enterprise SIP trunks. In-app voice calling operates safely without PSTN trunking.

---

## 5. Verification Commands for Maintainers

Run these commands locally to verify the entire system:

```bash
# 1. Typecheck the entire project
npm run lint

# 2. Run API and architecture contract invariants
npm run test:contracts

# 3. Run comprehensive 34-suite automated test suite
npm test
```
