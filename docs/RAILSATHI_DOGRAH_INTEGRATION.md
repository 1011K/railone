# RailSathi AI & Dograh Voice Telephony Architecture Contract

**Document Version:** 1.0.0  
**Status:** Architecture Contract & Implementation Specification  
**Scope:** In-App Voice Dialer, Multilingual ASR/TTS, Deterministic Tool Schemas, Telephony Bridge (Dograh/SIP/WebRTC), and Statutory Boundaries  

---

## 1. Executive Architecture Summary

**RailSathi** is the central conversational travel assistant for RailOne Next. It provides dual-mode interaction:
1. **In-App Voice Calling UX (Current Priority / Active Implementation):** High-fidelity WebRTC/Web-Audio call screen mimicking an authentic phone call with live audio waveforms, call timer, mute/speaker toggles, speech recognition, and deterministic railway tool grounding.
2. **Telephony Bridge via Dograh (`dograh-hq/dograh`):** An open-source, self-hosted voice agent pipeline connecting SIP trunks, WebRTC gateways, and telephone providers (Twilio / Plivo / Exotel / Asterisk) to RailSathi's deterministic tool registry.

```
+-----------------------------------------------------------------------------------+
|                            PASSENGER INGRESS CHANNELS                             |
+-----------------------------------------------------------------------------------+
|  [Channel A: In-App Voice Call Screen]     |  [Channel B: PSTN / Telephony Bridge]|
|  - Web Audio API / Web Speech ASR          |  - Dograh Voice Agent Platform       |
|  - Real-time animated audio waveforms      |  - SIP Trunk / WebRTC Ingress        |
|  - Zero telecommunication cost             |  - Deepgram / Whisper ASR + Cartesia |
+--------------------------------------------+--------------------------------------+
                      |                                         |
                      v                                         v
+-----------------------------------------------------------------------------------+
|                         RAILSATHI ORCHESTRATION LAYER                             |
|  - Session Lifecycle & Context Guardrails (START -> PLANNING -> CONFIRM -> EXEC)  |
|  - Multilingual Normalization (English, Hindi हिन्दी, Marathi मराठी)              |
|  - Strict Railway Non-Hallucination & Provenance Tagging                          |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                       15 DETERMINISTIC TOOL INVOCATIONS                           |
|  1. normalizeStation            6. validateEligibility      11. listTickets       |
|  2. findNearbyStations          7. quoteFare                12. cancelTicket      |
|  3. searchTrains                8. compareItineraries       13. getRefundStatus   |
|  4. planJourneys                9. createBookingDraft       14. getCoachGuidance  |
|  5. getTrainStatus (getLive)   10. confirmBooking           15. getDisruptionAlts |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                   PERSISTENCE & AUDIT (SQLite + WAL Mode)                         |
|  - voice_sessions table | bookings table | audit_log (immutable regulatory trail) |
+-----------------------------------------------------------------------------------+
```

---

## 2. In-App Microphone & Voice-Call UX Contract

The mobile passenger application embeds a dedicated calling experience designed for one-handed operation in transit environments:

1. **State Machine Transitions:**
   - `IDLE`: Commuter taps "Voice Call" in RailSathi tab or Floating Quick-Dialer.
   - `CONNECTING`: Audio subsystem initializes, session token generated, pleasant dial tone synthesized.
   - `LISTENING`: Animated sine waveform pulses, commuter speech captured and transcribed in real time.
   - `THINKING / TOOL_EXECUTION`: Radial processing ring illuminates; deterministic tool executes.
   - `SPEAKING`: Assistant responds via synthesized voice or Web Speech API; output waveform activates. Commuter interruption immediately transitions back to `LISTENING`.
   - `ENDED`: Call terminates cleanly, summary card rendered with one-tap action pills.

2. **Hardware & Privacy Controls:**
   - Prominent microphone mute button (toggles audio capture).
   - Audio speaker/earpiece selector.
   - Live transcript box scrolling with high-contrast text.
   - Large red "End Call" button with 48×48px minimum touch target.
   - Zero passive listening: Microphone access is strictly active only while the calling modal is open and in `LISTENING` state.

---

## 3. Deterministic Tools & JSON Schemas

RailSathi tools are strictly deterministic. The LLM or NLU engine is **never** permitted to fabricate timetables, delays, fares, or ticket IDs. It must execute one of the following 15 typed tools:

### Tool 1: `normalizeStation`
```json
{
  "name": "normalizeStation",
  "description": "Normalizes station names, codes, aliases, and Devanagari spellings (e.g. CST -> CSMT, दादर -> DR/DDR).",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Station query string in English, Hindi, or Marathi." }
    },
    "required": ["query"]
  }
}
```

### Tool 2: `findNearbyStations`
```json
{
  "name": "findNearbyStations",
  "description": "Finds nearby stations based on city selection or commuter GPS coordinates.",
  "parameters": {
    "type": "object",
    "properties": {
      "latitude": { "type": "number", "description": "Optional commuter latitude." },
      "longitude": { "type": "number", "description": "Optional commuter longitude." },
      "city": { "type": "string", "enum": ["Mumbai", "Pune", "Delhi NCR", "Bengaluru", "Kolkata", "Chennai", "Hyderabad", "Kochi"], "default": "Mumbai" }
    }
  }
}
```

### Tool 3: `searchTrains`
```json
{
  "name": "searchTrains",
  "description": "Searches authentic scheduled services between two stations with travel class preferences and departure window.",
  "parameters": {
    "type": "object",
    "properties": {
      "origin": { "type": "string", "description": "Origin station name or code." },
      "destination": { "type": "string", "description": "Destination station name or code." },
      "departureTime": { "type": "string", "description": "HH:MM format, e.g. 10:35." },
      "classPreference": { "type": "string", "enum": ["any", "second", "first", "ac_preferred", "ac_mandatory"], "default": "any" },
      "arriveByDeadline": { "type": "string", "description": "Optional deadline HH:MM." }
    },
    "required": ["origin", "destination"]
  }
}
```

### Tool 4: `planJourneys`
```json
{
  "name": "planJourneys",
  "description": "Executes full multi-modal journey planning including direct trips, suburban interchanges, and Metro transfers.",
  "parameters": {
    "type": "object",
    "properties": {
      "originCode": { "type": "string" },
      "destCode": { "type": "string" },
      "departureTime": { "type": "string" },
      "arriveByDeadline": { "type": "string" },
      "userContext": { "type": "string", "enum": ["pre_departure", "waiting_at_station", "onboard"] }
    },
    "required": ["originCode", "destCode"]
  }
}
```

### Tool 5: `getTrainStatus` (Live Running Status)
```json
{
  "name": "getTrainStatus",
  "description": "Retrieves real-time or timetable running observation for a train number with delay minutes, current halt, and provenance.",
  "parameters": {
    "type": "object",
    "properties": {
      "trainNumber": { "type": "string", "description": "5-digit train number, e.g. 95112 or 12137." }
    },
    "required": ["trainNumber"]
  }
}
```

### Tool 6: `validateEligibility`
```json
{
  "name": "validateEligibility",
  "description": "Checks statutory Indian Railways boarding legality (AC Local pass validity, Mail/Express short-hop prohibitions, Railways Act Section 138 rules).",
  "parameters": {
    "type": "object",
    "properties": {
      "trainNumber": { "type": "string" },
      "fromCode": { "type": "string" },
      "toCode": { "type": "string" },
      "ticketType": { "type": "string", "enum": ["suburban_single", "suburban_season_pass", "express_unreserved"] },
      "userClass": { "type": "string", "enum": ["II", "I", "AC_LOCAL", "2S", "SL", "3A", "2A", "1A", "CC", "EC"] }
    },
    "required": ["trainNumber", "fromCode", "toCode"]
  }
}
```

### Tool 7: `quoteFare`
```json
{
  "name": "quoteFare",
  "description": "Calculates official distance-slab suburban or express fare between two stations based on verified track kilometers.",
  "parameters": {
    "type": "object",
    "properties": {
      "fromCode": { "type": "string" },
      "toCode": { "type": "string" },
      "travelClass": { "type": "string", "enum": ["II", "I", "AC_LOCAL", "2S", "SL", "3A", "2A", "1A", "CC", "EC"], "default": "II" }
    },
    "required": ["fromCode", "toCode"]
  }
}
```

### Tool 8: `compareItineraries`
```json
{
  "name": "compareItineraries",
  "description": "Ranks alternative itineraries by fastest travel time, lowest fare, fewest interchanges, or least crowding.",
  "parameters": {
    "type": "object",
    "properties": {
      "originCode": { "type": "string" },
      "destCode": { "type": "string" },
      "priority": { "type": "string", "enum": ["fastest", "least_crowded", "lowest_fare", "fewest_transfers"], "default": "fastest" }
    },
    "required": ["originCode", "destCode"]
  }
}
```

### Tool 9: `createBookingDraft`
```json
{
  "name": "createBookingDraft",
  "description": "Creates an idempotent booking order draft with distance-based fare calculation prior to commuter verbal confirmation.",
  "parameters": {
    "type": "object",
    "properties": {
      "idempotencyKey": { "type": "string" },
      "trainNumber": { "type": "string" },
      "fromCode": { "type": "string" },
      "toCode": { "type": "string" },
      "classCode": { "type": "string", "enum": ["II", "I", "AC_LOCAL", "2S", "SL", "3A", "2A", "1A", "CC", "EC"] },
      "passengers": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "age": { "type": "number" },
            "gender": { "type": "string", "enum": ["M", "F", "T"] }
          },
          "required": ["name", "age", "gender"]
        }
      }
    },
    "required": ["trainNumber", "fromCode", "toCode", "classCode", "passengers"]
  }
}
```

### Tool 10: `confirmBooking`
```json
{
  "name": "confirmBooking",
  "description": "Confirms simulated payment and issues specimen ticket. STRICT REQUIREMENT: Must only be invoked after explicit affirmative commuter confirmation.",
  "parameters": {
    "type": "object",
    "properties": {
      "draftId": { "type": "string" },
      "paymentMethod": { "type": "string", "default": "RailWallet (Simulated)" }
    },
    "required": ["draftId"]
  }
}
```

### Tool 11: `listTickets`
```json
{
  "name": "listTickets",
  "description": "Retrieves commuter's active specimen tickets, season passes, and reservation history from SQLite store.",
  "parameters": {
    "type": "object",
    "properties": {
      "filter": { "type": "string", "enum": ["all", "active", "completed", "cancelled"], "default": "active" }
    }
  }
}
```

### Tool 12: `cancelTicket`
```json
{
  "name": "cancelTicket",
  "description": "Executes ticket cancellation with statutory clerical fee deduction and credits refund back to R-Wallet.",
  "parameters": {
    "type": "object",
    "properties": {
      "ticketId": { "type": "string" },
      "preferredType": { "type": "string", "enum": ["wallet", "cash", "voucher"], "default": "wallet" }
    },
    "required": ["ticketId"]
  }
}
```

### Tool 13: `getRefundStatus`
```json
{
  "name": "getRefundStatus",
  "description": "Queries itemized clerical deductions and refund reconciliation breakdown for a given ticket ID.",
  "parameters": {
    "type": "object",
    "properties": {
      "ticketId": { "type": "string" }
    },
    "required": ["ticketId"]
  }
}
```

### Tool 14: `getCoachGuidance`
```json
{
  "name": "getCoachGuidance",
  "description": "Provides platform coach alignment (Wagenstandsanzeiger), Divyangjan handicap coach alignment, and Foot-Over-Bridge stair positioning.",
  "parameters": {
    "type": "object",
    "properties": {
      "trainNumber": { "type": "string" },
      "stationCode": { "type": "string" },
      "platform": { "type": "string" }
    },
    "required": ["trainNumber"]
  }
}
```

### Tool 15: `getDisruptionAlternatives`
```json
{
  "name": "getDisruptionAlternatives",
  "description": "Analyzes delayed or signal-bunched trains and recommends downstream through-line alternatives without backtracking.",
  "parameters": {
    "type": "object",
    "properties": {
      "trainNumber": { "type": "string" },
      "currentStationCode": { "type": "string" }
    },
    "required": ["trainNumber"]
  }
}
```

---

## 4. Conversation State Machine & Statutory Guardrails

```
+------------+       Commuter Query         +--------------+
|   START    | ---------------------------> |   PLANNING   |
+------------+                              +--------------+
                                                   |
                             Options Presented     |
                                                   v
+------------------------+  Affirmative Confirm  +-----------------------+
|    BOOKING_EXECUTED    | <-------------------- | AWAITING_CONFIRMATION |
+------------------------+                       +-----------------------+
            |                                              |
            | Commuter says "Cancel"                       | Rejection / Change
            v                                              v
+------------------------+                       +-----------------------+
|       TERMINATED       |                       |       PLANNING        |
+------------------------+                       +-----------------------+
```

### Guardrail 1: Explicit Confirmation Before Booking
Under no circumstances may `confirmBooking` be executed without explicit verbal confirmation from the user (e.g. *"Yes, book it"*, *"हाँ, बुक करो"*, *"हो, बुक करा"*). If the commuter has only requested a quote, RailSathi must transition to `AWAITING_CONFIRMATION` and quote the exact fare and train number first.

### Guardrail 2: Statutory Non-Co-Opting of Indian Railways 139 / CRIS
RailSathi is an unofficial academic prototype. As mandated by Indian regulatory and telecommunication safety standards:
- It **never** masquerades as the official Indian Railways 139 passenger helpline.
- It **never** promises official railway police dispatch; it provides emergency numbers (RPF 139, GRP 1512) directly to commuter device dialers.
- All tickets issued are strictly watermarked as specimens and invalid for actual travel.

---

## 5. Dograh Telephony Integration Specification

When deployed with `dograh-hq/dograh` for external phone number calling:

1. **Authentication & Session Tokens:**
   - Inbound webhook calls to `/api/v1/telephony/inbound` require HMAC-SHA256 signature verification in the `X-Dograh-Signature` header using the shared secret `DOGRAH_WEBHOOK_SECRET`.
   - Outbound call initiation requires session token stored in Redis/SQLite with 15-minute TTL.

2. **ASR & TTS Pipeline:**
   - **ASR (Speech-to-Text):** Deepgram Nova-2 Indian English (`en-IN`) / Hindi (`hi`) model with railway jargon vocabulary boosting (`CSMT`, `Dadar`, `Virar`, `Fast Local`, `Tatkal`, `Sleeper`).
   - **TTS (Text-to-Speech):** Low-latency neural voices (Cartesia Sonic / ElevenLabs Turbo) with phoneme dictionary for Indian railway station pronunciation.

3. **Infrastructure Cost Estimate (Zero Cost locally; Transparent Cloud Telephony):**
   - In-app Voice (WebRTC): **$0.00 / Free** (Included in open-source server).
   - Self-hosted Dograh + Local Whisper.cpp: **$0.00 / Free** (Self-hosted on student hardware).
   - Commercial Cloud Telephony (if ever enabled by explicit user opt-in):
     - Inbound DID Trunk: ~$1.00 / month
     - Inbound Per-Minute Voice: ~$0.015 / minute
     - Deepgram ASR: ~$0.0043 / minute
     - Neural TTS: ~$0.015 / 1,000 characters
     - Total cloud cost per 3-minute booking call: ~$0.08 (~₹6.70).
   - **Mandatory Policy:** The core application must never require paid telephony to function. In-app voice calling remains 100% free and functional offline/locally.
