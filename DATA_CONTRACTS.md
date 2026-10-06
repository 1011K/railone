# RailOne Next 2.0 — Canonical Data Contracts & Schema Specification

**Document Version:** 2.0.0  
**Status:** Canonical / Active  
**Authoritative Reference:** `RailOne_Next_Antigravity_Master_Plan.md` (Modules C1–C16, Acceptance Scenarios G1–G18)  
**Governance:** `AGENTS.md` (Truth-in-data, Specimen safety, Zero live GPS fabrication)

---

## 1. Architectural Scope & Provenance Philosophy

RailOne Next enforces **truth-in-data** across all internal calculation models, public TypeScript interfaces, REST/JSON APIs, and voice assistant contracts:

1. **Explicit Provenance:** Every piece of timing, platform, and delay telemetry must carry its authoritative source indicator (`dataStatus`).
2. **Zero Hallucination:** If live telemetry is unavailable or stale, the system transparently marks the data `SCHEDULED` or `UNKNOWN`. It never hallucinates live delays or artificial crowd counts.
3. **Specimen Isolation:** All booking, ticket, and payment artifacts are strictly tagged with `_DEMO` state flags and display the mandatory disclaimer: `DEMO / SPECIMEN ONLY — NOT VALID FOR TRAVEL`.
4. **Deterministic Parity:** Voice tools and graphical UI workflows invoke identical underlying engine functions and return mathematically equivalent data contracts.

---

## 2. Core Domain Data Contracts

### 2.1 Station & Network Topology

Represents a passenger station within the Mumbai Suburban network or Indian Railways national trunk line.

```typescript
export type RegionalLine = 
  | 'central'       // Central Railway Main Line (CSMT - Kalyan - Kasara/Karjat)
  | 'western'       // Western Railway (Churchgate - Dahanu Road)
  | 'harbour'       // Harbour Line (CSMT - Vadala Road - Panvel / Goregaon)
  | 'transharbour'  // Trans-Harbour Line (Thane - Vashi / Panvel)
  | 'national';     // Indian Railways National Trunk Line

export interface Station {
  id: string;                      // Unique slug (e.g. "csmt", "dadar-cr", "thane")
  code: string;                    // IR station code (e.g. "CSMT", "DR", "DDR", "TNA")
  name: string;                    // Official English display name
  hindiName?: string;              // Devanagari Hindi designation (e.g. "कल्याण")
  marathiName?: string;            // Devanagari Marathi designation (e.g. "ठाणे")
  line: RegionalLine;              // Primary suburban or national division
  city: string;                    // Metropolitan territory (e.g. "Mumbai", "Thane")
  platforms: number[];             // Active passenger platforms (e.g. [1, 2, 3, 4, 5, 6, 7])
  interchangeWalkMinutes?: number; // Minimum FOB / concourse walking buffer (e.g. 7 min at Dadar)
  isInterchange?: boolean;         // Designates multi-line junction
  aliases: string[];               // Phonetic, colloquial, and historical search aliases
}
```

#### Deterministic Normalization Schema
Normalizes ambiguous passenger input (Devanagari, regional dialect, colloquial strings):

```typescript
export interface StationMatchResult {
  matchedStation: Station | null;
  confidence: 'EXACT_CODE' | 'EXACT_NAME' | 'DEVANAGARI' | 'ALIAS' | 'FUZZY' | 'NONE';
  candidates: Station[];
  requiresDisambiguation: boolean;
  explanation: string;
}
```

---

### 2.2 Train Trip & Stop Schedule

Models timetabled suburban and national train services, stopping patterns, rake formations, and multi-day service date offsets.

```typescript
export type TrainServiceType = 
  | 'suburban_slow'         // Stops at all sectional halts
  | 'suburban_fast'         // Skips minor stations (e.g. fast between Byculla & Dadar)
  | 'suburban_ac_slow'      // Air-Conditioned rake, all stops
  | 'suburban_ac_fast'      // Air-Conditioned rake, fast stopping pattern
  | 'mail_express'          // National long-distance Mail/Express
  | 'superfast'             // High-speed national express with supplementary charge
  | 'vande_bharat_tejas';   // Semi-high speed trainset

export type TravelClass = 
  | 'II'        // Suburban 2nd Class / General Unreserved
  | 'I'         // Suburban 1st Class
  | 'AC_LOCAL'  // Mumbai Suburban AC EMU
  | '2S'        // Second Sitting Reserved/Unreserved
  | 'SL'        // Sleeper Class
  | '3A'        // 3-Tier AC
  | '2A'        // 2-Tier AC
  | '1A'        // 1st Class AC
  | 'CC'        // AC Chair Car
  | 'EC';       // Executive AC Chair Car

export interface StopEntry {
  stationCode: string;          // Halt station code
  stationName: string;          // Halt station name
  scheduledArrival: string;     // HH:MM (24-hour clock)
  scheduledDeparture: string;   // HH:MM (24-hour clock)
  platform?: string;            // Designated platform
  distanceKm: number;           // Cumulative sectional track distance
  isHalt: boolean;              // True if passenger commercial stop; false if technical skip
  dayOffset?: number;           // 0 for origin service date, 1 for post-midnight overnight halt
}

export interface TrainTrip {
  trainNumber: string;          // 5-digit IR train number or suburban rake ID
  trainName: string;            // Public train name
  hindiName?: string;           // Devanagari Hindi title
  marathiName?: string;         // Devanagari Marathi title
  originStation: string;        // Starting terminal station code
  destinationStation: string;   // Terminating station code
  serviceType: TrainServiceType;// Operational service classification
  runningDays: number[];        // Operating days: 0 = Sunday, 1 = Monday, ... 6 = Saturday
  stops: StopEntry[];           // Complete ordered sequence of stops
  availableClasses: TravelClass[]; // Passenger accommodation classes
  isMSTPermitted?: boolean;     // Valid for Suburban Monthly Season Ticket (MST)
  mstNotes?: string;            // Regulatory conditions regarding suburban pass validity
  generalCoachesCount?: number; // Number of unreserved GS coaches
  rakeType?: '12_car' | '15_car' | 'icf_express' | 'lhb_express' | 'vande_bharat';
}
```

---

### 2.3 Observation Telemetry & Data Provenance

Specifies the verification lifecycle of tracking observations, delay progression, and crowdsourced field reports.

```typescript
export type DataStatus = 
  | 'LIVE_VERIFIED'   // Direct NTES / Operations Control data feed verified
  | 'SCHEDULED'       // Timetable fallback; no live GPS or sensor data available
  | 'HISTORICAL'      // Previous run statistics or profile
  | 'PREDICTED'       // Compounding algorithmically modeled progression
  | 'REPORTED'        // Crowdsourced passenger field report (unverified)
  | 'ESTIMATED'       // Sectional running time heuristics
  | 'DEMO'            // Simulated pedagogical test dataset
  | 'UNKNOWN';        // Feed offline or telemetry missing

export interface TrainRunningObservation {
  trainNumber: string;
  serviceDate: string;                  // YYYY-MM-DD origin departure date
  currentStationCode: string;           // Station last cleared or currently stopped at
  lastReportedStationCode: string;
  lastReportedTimestamp: string;        // ISO 8601 or HH:MM
  hasDepartedOrigin: boolean;
  actualOriginDeparture?: string;
  delayMinutesAtCurrent: number;        // Running delay in minutes (+ve = delayed, -ve = early)
  isCanceled: boolean;                  // Operations cancellation status
  disruptionReason?: string;            // Official sectional cause (e.g. "Signal Failure at Kurla")
  dataStatus: DataStatus;               // Authoritative provenance classification
  dataSource: string;                   // Feed provider identifier
  dataRetrievedAt: string;              // ISO timestamp of ingestion
  uncertaintyMarginMinutes: number;     // Error confidence interval (± minutes)
  quality_flag?: 'VERIFIED' | 'STALE' | 'CONFLICT' | 'SYNTHETIC';
  conflict_indicator?: boolean;         // True if opposing reports detected
}
```

---

### 2.4 Passenger Journey Itinerary & Decision Models

Output contracts for routing decisions, transfer guidance, delay inversions, and legal passenger eligibility.

```typescript
export type CrowdingLevel = 'LOW' | 'MODERATE' | 'HEAVY' | 'CRUSH_LOAD';

export interface CrowdingEstimate {
  level: CrowdingLevel;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'DATA_SPARSE';
  explanation: string;
  peakWindow: boolean;
  crowdReason: string;
}

export type EligibilityStatus = 
  | 'ELIGIBLE'          // Unrestricted travel permitted with ordinary ticket/pass
  | 'CONDITIONAL'       // Permitted only under specific class, coach, or quota rules
  | 'PROHIBITED'        // Illegal boarding under Railways Act 1989 Section 138
  | 'DATA_UNAVAILABLE'; // Regulatory tariff rule undetermined

export interface EligibilityResult {
  status: EligibilityStatus;
  summary: string;
  rulesApplied: string[];
  validClasses: TravelClass[];
  passPermitted: boolean;
  ticketRequiredNote: string;
}

export interface ItineraryLeg {
  legIndex: number;
  train: TrainTrip;
  fromStation: Station;
  toStation: Station;
  scheduledDep: string;
  scheduledArr: string;
  predictedDep: string;
  predictedArr: string;
  delayDepMinutes: number;
  delayArrMinutes: number;
  departurePlatform: string;
  arrivalPlatform: string;
  dataStatus: DataStatus;
  crowding: CrowdingEstimate;
  skippedStopsCount: number;
  stoppingPatternLabel: string;
}

export interface TransferInfo {
  station: Station;
  fromLegIndex: number;
  toLegIndex: number;
  walkTimeMinutes: number;        // Station footbridge transfer buffer
  bufferMinutes: number;          // Total headway between leg arrival and departure
  isTightConnection: boolean;     // Buffer < 5 minutes
  isMissedConnection: boolean;    // Infeasible transfer (< walkTimeMinutes)
  transferGuide: string;          // Passenger guidance (e.g. "Use Dadar Central FOB to WR PF 1")
}

export interface JourneyItinerary {
  id: string;
  legs: ItineraryLeg[];
  transfers: TransferInfo[];
  totalDurationMinutes: number;
  scheduledDeparture: string;
  predictedDeparture: string;
  scheduledArrival: string;
  predictedArrival: string;
  totalFareByClass: Partial<Record<TravelClass, number>>;
  recommendedClass: TravelClass;
  eligibility: EligibilityResult;
  score: number;
  rankReason: string;
  isRecommended: boolean;
  leaveHomeTime: string;
  leaveHomeMarginMinutes: number;
  delayInversionNote?: string;    // E.g. "Slow Local arrives earlier than delayed Fast Local"
  originDelayWarning?: string;
  isAcService: boolean;
}
```

---

## 3. Specimen Ticketing State Machine & Safe Storage

### 3.1 Finite State Machine (`BookingState`)

To prevent ambiguous transactions and support network failures during checkout, the mock booking store implements this deterministic state machine:

```
                  ┌──────────────────────┐
                  │        DRAFT         │
                  └──────────┬───────────┘
                             │ Submit
                             ▼
                  ┌──────────────────────┐
                  │      VALIDATING      │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            │ Timeout / Ambiguity             │ Success
            ▼                                 ▼
┌───────────────────────────────┐ ┌───────────────────────┐
│ PENDING_RECONCILIATION_DEMO   │ │   PAYMENT_SIMULATED   │
└───────────────┬───────────────┘ └───────────┬───────────┘
                │ Reconcile                   │ Issue
                └──────────────┬──────────────┘
                               ▼
                  ┌──────────────────────┐
                  │  TICKET_ISSUED_DEMO  │
                  └──────────┬───────────┘
                             │ Cancel
                             ▼
                  ┌──────────────────────┐
                  │   CANCELLED_DEMO     │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│ REFUND_PENDING_DEMO   │         │     REFUNDED_DEMO     │
└───────────────────────┘         └───────────────────────┘
```

### 3.2 Specimen Ticket & Refund Schema

```typescript
export interface RefundBreakdown {
  totalPaid: number;              // Total simulated fare collected (₹)
  cashRefund: number;             // Direct simulated cash payout (₹)
  walletRefund: number;           // Instant RailWallet simulated refund credit (₹)
  voucherCredit: number;          // IRCTC-style future travel credit voucher (₹)
  clericalDeduction: number;      // Official administrative cancellation fee deduction (₹)
  refundTimeline: string;         // Refund processing SLA (e.g. "Instant for RailWallet; 3-5 days for Bank Gateway")
  termsNotice: string;            // Governing rule disclosure (e.g. "Subject to 90-day credit validity")
}

export interface SpecimenTicket {
  id: string;                     // Deterministic ID (e.g. "MOCK-1741549200000-842")
  idempotencyKey?: string;        // Client duplicate-request prevention token
  pnrMock: string;                // Simulated 10-digit PNR formatted as XXX-XXXXXXX
  bookingTimestamp: string;       // ISO 8601 creation timestamp
  journeyDate: string;            // YYYY-MM-DD
  serviceDateOffsetDays?: number; // 0 for same day, 1 for overnight train
  trainNumber: string;
  trainName: string;
  fromStation: { code: string; name: string };
  toStation: { code: string; name: string };
  classBooked: TravelClass;
  farePaid: number;
  passengers: Array<{
    name: string;
    age: number;
    gender: string;
    berthOrCoachMock?: string;
  }>;
  paymentStatus: 'PAID_MOCK' | 'CANCELLED_REFUNDED' | 'FAILED' | 'PENDING_RECONCILIATION_DEMO';
  bookingState?: BookingState;
  paymentMethod: string;
  qrPayload: string;              // High-integrity QR specimen payload with mandatory DEMO watermark
  refundAmount?: number;
  refundBreakdown?: RefundBreakdown;
  cancellationTimestamp?: string;
}
```

---

## 4. Voice Assistant Backend Tool Contracts (`RailBackendTools`)

All voice tools are deterministic JSON functions exposed to in-app dialers, web speech synthesizers, or external telephony bridges.

### 4.1 Tool 1: `searchTrains`
- **Purpose:** Searches itineraries with arrive-by deadlines, multilingual station normalization, and onboard replanning.
- **Request Contract:**
```typescript
{
  originQuery: string;               // e.g. "कल्याण", "Thane", "DR"
  destQuery: string;                 // e.g. "Churchgate", "CST"
  time?: string;                     // HH:MM (Default: "10:35")
  classPref?: 'any' | 'second' | 'first' | 'ac_preferred' | 'ac_mandatory';
  options?: {
    arriveByDeadline?: string;       // HH:MM deadline (e.g. "12:30")
    userContext?: 'pre_departure' | 'waiting_at_station' | 'onboard';
    onboardTrainNumber?: string;     // E.g. "97042"
    onboardCurrentStation?: string;  // E.g. "CLA" (Kurla)
    hasSeasonPass?: boolean;
  }
}
```
- **Response Contract (Success):**
```typescript
{
  status: "success",
  origin: "Thane",
  destination: "Churchgate",
  count: 2,
  itineraries: [
    {
      id: "j-97042-90240",
      isRecommended: true,
      departure: "11:15",
      arrival: "12:15",
      durationMinutes: 60,
      transfers: 1,
      fare: { "II": 15, "I": 140 },
      recommendedClass: "II",
      rankReason: "Arrives before 12:30 with valid Dadar FOB interchange",
      delayInversion?: string,
      leaveHomeTime: "11:00",
      eligibility: "ELIGIBLE",
      legs: [
        {
          trainNumber: "97042",
          trainName: "Kalyan Fast Local",
          from: "Thane",
          to: "Dadar",
          dep: "11:15",
          arr: "11:45",
          delayDep: 0,
          crowd: "HEAVY",
          platform: "PF 5"
        },
        {
          trainNumber: "90240",
          trainName: "Borivali Slow Local",
          from: "Dadar",
          to: "Churchgate",
          dep: "11:55",
          arr: "12:15",
          delayDep: 0,
          crowd: "MODERATE",
          platform: "PF 2"
        }
      ]
    }
  ]
}
```

---

### 4.2 Tool 2: `getLiveStatus`
- **Purpose:** Fetches running status with explicit provenance and compounding delay projections.
- **Request Contract:**
```typescript
{
  trainNumber: string; // e.g. "12134" or "97042"
}
```
- **Response Contract (Success):**
```typescript
{
  status: "success",
  trainNumber: "12134",
  trainName: "Mangaluru Express",
  serviceType: "superfast",
  origin: "MAJN",
  destination: "CSMT",
  hasDepartedOrigin: true,
  currentStation: "PNVL",
  currentDelayMinutes: 20,
  disruptionReason: "Sectional speed restriction due to track maintenance",
  dataProvenance: {
    status: "PREDICTED",
    source: "RailOne Multi-Day Compounding Delay Model",
    asOf: "10:35",
    uncertaintyMargin: 5
  },
  stops: [
    {
      station: "Panvel",
      code: "PNVL",
      schedArr: "10:15",
      predArr: "10:35",
      delayMin: 20,
      status: "LIVE_VERIFIED"
    },
    {
      station: "Thane",
      code: "TNA",
      schedArr: "10:55",
      predArr: "11:22",
      delayMin: 27,
      status: "PREDICTED"
    },
    {
      station: "Mumbai CSMT",
      code: "CSMT",
      schedArr: "11:45",
      predArr: "12:25",
      delayMin: 40,
      status: "PREDICTED"
    }
  ]
}
```

---

### 4.3 Tool 3: `validateEligibility`
- **Purpose:** Verifies legal passenger travel authorization (e.g. Dadar-to-Kalyan Express hop under Section 138 of Railways Act 1989).
- **Request Contract:**
```typescript
{
  trainNumber: string;       // e.g. "12134" or "12124"
  fromCode: string;          // e.g. "DR" (Dadar)
  toCode: string;            // e.g. "KYN" (Kalyan)
  ticketType: 'suburban_single' | 'suburban_season_pass' | 'express_unreserved';
  userClass?: TravelClass;   // e.g. "II"
}
```
- **Response Contract (Success):**
```typescript
{
  status: "success",
  trainNumber: "12134",
  fromCode: "DR",
  toCode: "KYN",
  eligibility: "PROHIBITED",
  summary: "Suburban single ticket is PROHIBITED on Non-MST Express 12134.",
  rules: [
    "Suburban ordinary card ticket is not valid for boarding National Mail/Express services.",
    "Boarding without a valid Express reservation or unreserved Express ticket constitutes travelling without a proper ticket under Railways Act 1989 Section 138, punishable by excess fare and statutory penalty (minimum ₹250)."
  ],
  passPermitted: false,
  ticketRequiredNote: "Passengers travelling from Dadar to Kalyan must board a Suburban Local or purchase a dedicated Point-to-Point Express Ticket before departure."
}
```

---

### 4.4 Tool 4: `confirmDemoBooking` & `reconcileDemoBooking`
- **Purpose:** Executes idempotent mock specimen checkout and handles timeout recovery.
- **Request Contract:**
```typescript
{
  draftId: string;
  paymentMethod: string;
  options?: {
    simulateAmbiguousTimeout?: boolean;
  }
}
```
- **Response Contract (Reconciliation):**
```typescript
{
  status: "success",
  success: true,
  message: "Order successfully reconciled and verified against transaction store.",
  ticket: {
    id: "MOCK-1741549200000-842",
    pnrMock: "842-1948201",
    bookingState: "TICKET_ISSUED_DEMO",
    paymentStatus: "PAID_MOCK",
    qrPayload: "RAILONE-DEMO:PNR=842-1948201;STATUS=TICKET_ISSUED_DEMO;FARE=95;DISCLAIMER=NOT_VALID_FOR_TRAVEL"
  }
}
```

---

## 5. Master Plan Section G Acceptance Test Alignment

| Acceptance Scenario | Contract Feature | Verification Test Anchor |
| :--- | :--- | :--- |
| **G1: Dadar Interchange & Deadline** | `arriveByDeadline`, `interchangeWalkMinutes: 7` | `tests/run-all-tests.ts` → `[G1.1]`–`[G1.7]` |
| **G2: Dadar–Kalyan Express Gate** | `EligibilityStatus: PROHIBITED`, Section 138 citation | `tests/run-all-tests.ts` → `[G2.1]`–`[G2.4]` |
| **G3: Delay Inversion Winner** | `delayInversionNote`, dynamic predicted headway | `tests/run-all-tests.ts` → `[G3.1]`–`[G3.3]` |
| **G4: Compounding Delay Model** | `delayMinutesAtCurrent: 20` compounds to `40` | `tests/run-all-tests.ts` → `[G4.1]`–`[G4.3]` |
| **G5: AC Local Truth-in-Data** | No phantom AC rakes; class-distinct tariffs | `tests/run-all-tests.ts` → `[G5.1]`–`[G5.4]` |
| **G6: Cancelled Service Exclusion**| Rejects `isCanceled: true` trains from legs | `tests/run-all-tests.ts` → `[G6.1]`–`[G6.3]` |
| **G7: Onboard Replanning** | Forward-only clamp; rejects reverse backtracking | `tests/run-all-tests.ts` → `[G7.1]`–`[G7.4]` |
| **G8: Midnight Day Offset** | `dayOffset: 1`, multi-day crossing calculations | `tests/run-all-tests.ts` → `[G8.1]`–`[G8.4]` |
| **G9: Fallback to Scheduled** | Transparent `dataStatus: SCHEDULED` | `tests/run-all-tests.ts` → `[G9.1]`–`[G9.3]` |
| **G10: Idempotent Tap Handling** | Deduplication via `idempotencyKey` cache | `tests/run-all-tests.ts` → `[G10.1]`–`[G10.5]` |
| **G11: Timeout Reconciliation** | `PENDING_RECONCILIATION_DEMO` → `TICKET_ISSUED_DEMO` | `tests/run-all-tests.ts` → `[G11.1]`–`[G11.4]` |
| **G12: Itemized Refund Breakdown** | Cash vs. Wallet vs. Voucher itemization | `tests/run-all-tests.ts` → `[G12.1]`–`[G12.5]` |
| **G13: Community Moderation** | `REPORTED` namespace isolation | `tests/run-all-tests.ts` → `[G13.1]`–`[G13.2]` |
| **G14: Multilingual Normalization**| Hindi/Marathi Devanagari station resolver | `tests/run-all-tests.ts` → `[G14.1]`–`[G14.5]` |
| **G15: Voice-Manual Parity** | 100% deterministic results across modalities | `tests/run-all-tests.ts` → `[G15.1]`–`[G15.4]` |
| **G16: Offline Cache & Specimen** | In-memory graphs and offline ticket display | `tests/run-all-tests.ts` → `[G16.1]`–`[G16.4]` |
| **G17: Truth for Unknown Trains** | Safe rejection without synthetic hallucinations | `tests/run-all-tests.ts` → `[G17.1]`–`[G17.2]` |
| **G18: Accessibility Tokens** | WCAG 2.1 AA/AAA compliance & theme tokens | `tests/run-all-tests.ts` → `[G18.1]`–`[G18.3]` |
