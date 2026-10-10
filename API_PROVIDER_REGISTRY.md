# RailOne Next — API Provider Registry & Credential Readiness

**Last Audit Timestamp:** 2026-10-10  
**Integration Branch:** `integrate/free-api-backend-hardening-2026-10-10`  
**Base Commit (origin/main):** `275a3a7e556a22e2f6d4b4b88b614fe2f1e7d6d0`  

---

## 1. Executive Summary

RailOne Next is an independent passenger-first transit decision system for Indian Railways, Mumbai Suburban, and Indian Urban Metro systems. This document provides a complete audit of all external and open-source API providers, licensing, free-tier restrictions, credential readiness, and fallback behaviors.

**Core Safety Mandates:**
1. Zero fabricated live data or unverified seat availability.
2. Zero automatic transitions to paid cloud services or billable tiers.
3. Zero credential leakage into git history, logs, or client-side JavaScript bundles.
4. Deterministic offline-safe domain fallbacks for all passenger journey calculations.

---

## 2. API Provider Readiness Matrix

| Provider Name | Feature Served | Credential Configured | License / Free-Tier Restrictions | Endpoint Verified | Actual Test Status | Cost Exposure | Fallback Behavior | Remaining Blockers |
| :--- | :--- | :---: | :--- | :--- | :---: | :---: | :--- | :--- |
| **Google Gemini** | Primary AI Conversational Copilot & Task Planner | **AVAILABLE** (in local `.env`) | Google AI Studio free tier; rate-limited (15 RPM / 1M TPM on free models); non-confidential passenger queries only. | `models.generateContent` (`gemini-2.5-flash`) | **AVAILABLE / VERIFIED** | **₹0.00** (Free Tier strictly capped) | Deterministic Railway Domain Rules (`[TIMETABLE MODEL]`) | None. Model ID configurable via `GEMINI_MODEL`. |
| **NVIDIA NIM** | AI Reasoning Provider (OpenAI Compatible) | **MISSING** (optional demo/test) | NVIDIA Developer Free Tier; requires NVIDIA Developer account; evaluation/research only, not commercial production. | `https://integrate.api.nvidia.com/v1/chat/completions` | **NOT_TESTED (KEY ABSENT)** | **₹0.00** (Circuit breaks on 402/429; no paid auto-switch) | Falls back to Google Gemini, Groq, or Deterministic Engine | Awaiting optional `NVIDIA_API_KEY` from https://build.nvidia.com/ |
| **Groq** | Fast LPU Inference & Audio Whisper Transcription | **MISSING** (optional speed tier) | Groq Cloud free tier; token rate limits per minute. | `https://api.groq.com/openai/v1/chat/completions` & `/audio/transcriptions` | **NOT_TESTED (KEY ABSENT)** | **₹0.00** (Free Developer Tier) | Falls back to browser Web Speech API and Deterministic Engine | Awaiting optional `GROQ_API_KEY` from https://console.groq.com/keys |
| **OpenRouteService (HeiGIT)** | Pedestrian Walking Navigation to Stations | **MISSING** (optional live street routing) | HeiGIT Free Developer Tier (2,000 requests/day); OpenStreetMap attribution required. | `https://api.heigit.org/v2/directions/foot-walking` (current API, deprecated endpoint avoided) | **NOT_TESTED (KEY ABSENT)** | **₹0.00** (Capped free tier) | Deterministic Haversine walking speed (4.5 km/h) + Verified station FOB geometry | Awaiting optional `ORS_API_KEY` from https://account.heigit.org/ |
| **Open-Meteo** | Journey Weather Observations & Disruption Context | **AVAILABLE** (No Key Required) | Open public domain; free non-commercial and research tier; CC-BY 4.0 weather model attribution. | `https://api.open-meteo.com/v1/forecast` | **AVAILABLE / VERIFIED** | **₹0.00** (Public Free API) | Offline cached monsoon baseline tagged `[TIMETABLE MODEL]` | None. Strictly gated: Weather cannot fabricate train delays. |
| **MapLibre + OpenFreeMap** | Geographical Vector Maps & Station Wayfinding | **AVAILABLE** (No Key Required) | Free vector tile server (`tiles.openfreemap.org`), OpenMapTiles schema, MIT/ODbL. | `https://tiles.openfreemap.org/styles/liberty` | **AVAILABLE / VERIFIED** | **₹0.00** (100% Free Open Source) | Schematic 2D/3D SVG diagrams (`NetworkMapViewer`) | None. Replaces all Google Maps paid dependencies. |
| **CRIS / IRCTC PRS** | National Rail Reservation Availability | **STATUTORY SIMULATOR** | Official CRIS API requires institutional partner agreements (Indian Railways). Live scraping prohibited by IT Act. | Internal High-Fidelity Simulator | **SIMULATOR VERIFIED** | **₹0.00** (Local Simulator) | Surfaces `[DEMO_SIMULATION]` notice; directs to `indianrail.gov.in` for live PNR | Institutional CRIS MoU required for live production ticketing. |
| **Statutory Telephony (139)** | Passenger Grievance & Automated Voice Dialing | **STATUTORY BLOCKED** | Indian Telegraph Act / TRAI regulations prohibit automated commercial voice agents hijacking 139 without DoT SIP Trunk license. | Gated In-App WebRTC / Native Voice | **VERIFIED BLOCKED** | **₹0.00** (Statutory Block) | In-app RailSathi voice agent handles queries locally with verified tools | Commercial trunk license required for PSTN dialing. |

---

## 3. Provider Architecture & Failover Invariant

The backend integrates an orchestrated router `AiProviderRouter` located at `src/backend/modules/ai/aiProviderRouter.ts`:

```
User / Voice Request
        │
        ▼
[AiProviderRouter]
        │
   ┌────┴──────────────────────────┐
   ▼                               ▼
[Preferred Provider]         [Default Chain: Gemini -> NVIDIA NIM -> Groq]
   │                               │
   ├─ Success ➔ Return result      ├─ Timeout (>8s) / 429 Quota / Circuit Open
   │                               ▼
   └─ Failure ─────────────────> [Deterministic Domain Engine (100% Offline Safe)]
                                   │
                                   ▼
                             Return Grounded Railway Fact
                             [TIMETABLE MODEL] / [DEMO]
```

### Safety Features
1. **Explicit Request Timeouts:** 8,000ms max timeout using standard `AbortController`.
2. **Circuit Breaking:** 3 consecutive failures trips circuit breaker for 60 seconds to protect provider quotas.
3. **Quota Protection:** HTTP 402/429 immediately flags `QUOTA_EXHAUSTED` and blocks requests without attempting automatic paid upgrades.
4. **Log Redaction:** All error messages and logs scrub keys using regex `/[A-Za-z0-9_-]{30,}/g ➔ [REDACTED_KEY]`.
5. **Zero Inventory Fabrication:** Unverified seats or PNR lookups return `[DEMO_SIMULATION]` or link to the official portal `https://www.indianrail.gov.in`.
