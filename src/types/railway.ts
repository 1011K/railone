/**
 * Railway Domain Models & Data Contracts for RailOne Next
 * Enforces honest data provenance, legal passenger eligibility, and multi-class decisions.
 */

export type DataStatus = 
  | 'LIVE_VERIFIED'
  | 'SCHEDULED'
  | 'HISTORICAL'
  | 'PREDICTED'
  | 'REPORTED'
  | 'ESTIMATED'
  | 'DEMO'
  | 'UNKNOWN';

export type RegionalLine = 
  | 'central'
  | 'western'
  | 'harbour'
  | 'transharbour'
  | 'national';

export interface Station {
  id: string;
  code: string;
  name: string;
  hindiName?: string;
  marathiName?: string;
  line: RegionalLine;
  city: string;
  platforms: number[];
  interchangeWalkMinutes?: number;
  isInterchange?: boolean;
  aliases: string[];
}

export type TrainServiceType = 
  | 'suburban_slow'
  | 'suburban_fast'
  | 'suburban_ac_slow'
  | 'suburban_ac_fast'
  | 'mail_express'
  | 'superfast'
  | 'vande_bharat_tejas';

export type TravelClass = 
  | 'II'        // Suburban 2nd Class / General
  | 'I'         // Suburban 1st Class
  | 'AC_LOCAL'  // Mumbai AC Local
  | '2S'        // Second Sitting Reserved/Unreserved
  | 'SL'        // Sleeper
  | '3A'        // 3rd AC
  | '2A'        // 2nd AC
  | '1A'        // 1st AC
  | 'CC'        // AC Chair Car
  | 'EC';       // Executive Chair Car

export interface StopEntry {
  stationCode: string;
  stationName: string;
  scheduledArrival: string; // HH:MM
  scheduledDeparture: string; // HH:MM
  platform?: string;
  distanceKm: number;
  isHalt: boolean;
  dayOffset?: number; // 0 for origin day, 1 for next day (midnight crossing)
}

export interface TrainTrip {
  trainNumber: string;
  trainName: string;
  hindiName?: string;
  marathiName?: string;
  originStation: string;
  destinationStation: string;
  serviceType: TrainServiceType;
  runningDays: number[]; // 0=Sunday, 1=Monday...
  stops: StopEntry[];
  availableClasses: TravelClass[];
  isMSTPermitted?: boolean; // Permitted for suburban Monthly Season Ticket
  mstNotes?: string;
  generalCoachesCount?: number;
  rakeType?: '12_car' | '15_car' | 'icf_express' | 'lhb_express' | 'vande_bharat';
}

export interface TrainRunningObservation {
  trainNumber: string;
  serviceDate: string;
  currentStationCode: string;
  lastReportedStationCode: string;
  lastReportedTimestamp: string;
  hasDepartedOrigin: boolean;
  actualOriginDeparture?: string;
  delayMinutesAtCurrent: number;
  isCanceled: boolean;
  disruptionReason?: string;
  dataStatus: DataStatus;
  dataSource: string;
  dataRetrievedAt: string;
  uncertaintyMarginMinutes: number;
  source_id?: string;
  observed_at?: string;
  fetched_at?: string;
  expires_at?: string;
  quality_flag?: 'VERIFIED' | 'STALE' | 'CONFLICT' | 'SYNTHETIC';
  conflict_indicator?: boolean;
}

export type CrowdingLevel = 'LOW' | 'MODERATE' | 'HEAVY' | 'CRUSH_LOAD';

export interface CrowdingEstimate {
  level: CrowdingLevel;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'DATA_SPARSE';
  explanation: string;
  peakWindow: boolean;
  crowdReason: string;
}

export type EligibilityStatus = 
  | 'ELIGIBLE' 
  | 'CONDITIONAL' 
  | 'PROHIBITED' 
  | 'DATA_UNAVAILABLE';

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
  walkTimeMinutes: number;
  bufferMinutes: number;
  isTightConnection: boolean;
  isMissedConnection: boolean;
  transferGuide: string;
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
  delayInversionNote?: string;
  originDelayWarning?: string;
  isAcService: boolean;
}

export type UserTravelContext = 
  | 'pre_departure'      // Planning from home / office
  | 'waiting_at_station' // Standing at the station platform
  | 'onboard';           // Already inside a train

export interface PassengerPreferences {
  classPreference: 'any' | 'second' | 'first' | 'ac_preferred' | 'ac_mandatory';
  priority: 'fastest' | 'least_crowded' | 'lowest_fare' | 'fewest_transfers';
  hasSeasonPass: boolean;
  passClass?: TravelClass;
  walkToStationMinutes: number;
  maxTransfers: number;
}

export type BookingState = 
  | 'DRAFT'
  | 'VALIDATING'
  | 'PAYMENT_SIMULATED'
  | 'TICKET_ISSUED_DEMO'
  | 'FAILED'
  | 'PENDING_RECONCILIATION_DEMO'
  | 'CANCELLED_DEMO'
  | 'REFUND_PENDING_DEMO'
  | 'REFUNDED_DEMO';

export interface RefundBreakdown {
  totalPaid: number;
  cashRefund: number;
  walletRefund: number;
  voucherCredit: number;
  clericalDeduction: number;
  refundTimeline: string;
  termsNotice: string;
}

export interface SpecimenTicket {
  id: string;
  idempotencyKey?: string;
  pnrMock: string;
  bookingTimestamp: string;
  journeyDate: string;
  serviceDateOffsetDays?: number;
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
  qrPayload: string;
  refundAmount?: number;
  refundBreakdown?: RefundBreakdown;
  cancellationTimestamp?: string;
}

export interface CommuterScenario {
  id: string;
  title: string;
  subtitle: string;
  originCode: string;
  destCode: string;
  timeContext: string;
  userContext: UserTravelContext;
  classPreference: PassengerPreferences['classPreference'];
  description: string;
  keyLearning: string;
}
