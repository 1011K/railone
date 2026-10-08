/**
 * India-Wide Multimodal Routing Architecture — Type System & Data Contracts
 * Supports Suburban Rail, Express Rail, Metro, Regional Rail (RRTS), Monorail,
 * City/Feeder Bus, Ferry/Water Metro, On-Demand Taxi/Auto, and Walking.
 */

export type TransportMode =
  | 'suburban'       // Indian Railways Suburban (EMU)
  | 'express'        // Indian Railways Mail/Express, Superfast, Vande Bharat
  | 'metro'          // Urban Rapid Transit Metro (DMRC, Mumbai Metro, Namma Metro, etc.)
  | 'regional_rail'  // Regional Rapid Transit System (RRTS / Namo Bharat)
  | 'monorail'       // Urban Monorail (e.g. Mumbai Monorail Line 1)
  | 'bus'            // Public municipal bus network (BEST, DTC, BMTC, etc.)
  | 'feeder'         // Last-mile feeder shuttle (metro feeders, airport shuttles)
  | 'auto_taxi'      // Regulated Autorickshaw / Metered Taxi / App Cab
  | 'ferry'          // Passenger Ferry / Water Metro (Mandwa, Hooghly, Kochi)
  | 'walk';          // Pedestrian footpath, Skywalk, Foot Over Bridge (FOB)

export type DataQualityStatus =
  | 'VERIFIED_LIVE'       // Real-time confirmed feed / live GPS
  | 'TIMETABLE_SCHEDULE'  // Official published timetable schedule
  | 'ESTIMATED_MODEL'     // Documented regulatory tariff / headway model
  | 'UNAVAILABLE';        // Service or schedule is unindexed / unavailable

export type OperationalServiceState =
  | 'OPERATIONAL'
  | 'UNDER_CONSTRUCTION'
  | 'UPCOMING'
  | 'SUSPENDED';

export interface MultimodalNode {
  id: string;
  code: string;
  name: string;
  nativeName?: string;
  city: string;
  state: string;
  mode: TransportMode;
  latitude: number;
  longitude: number;
  platforms?: number[];
  isInterchange?: boolean;
  isTerminal?: boolean;
  stepFreeAccessible: boolean; // Wheelchair / ramp / elevator access confirmed
  facilities?: {
    hasLifts?: boolean;
    hasEscalators?: boolean;
    hasWheelchairRamp?: boolean;
    hasRPFPost?: boolean;
    hasDrinkingWater?: boolean;
    hasRestrooms?: boolean;
  };
  connectedStopIds?: string[];
  aliases?: string[];
}

export interface MultimodalEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  mode: TransportMode;
  operator: string;
  lineId: string;
  lineName: string;
  routeNumber?: string;
  distanceKm: number;
  durationMinutes: number;
  fareInr: number;
  frequencyMinutes?: number;
  firstService?: string; // HH:MM
  lastService?: string;  // HH:MM
  operatingDays?: number[]; // [0..6] (0 = Sunday)
  stepFree: boolean;
  isExpress?: boolean;
  isAcService?: boolean;
  isMSTPermitted?: boolean;
  dataQuality: DataQualityStatus;
  bookingUrl?: string; // Official provider deep link
  disruptionNote?: string;
}

export interface DoorToDoorLocation {
  name: string;
  latitude?: number;
  longitude?: number;
  nearestStationCode?: string;
}

export interface MultimodalRoutingPreferences {
  priority?: 'fastest' | 'lowest_cost' | 'fewest_transfers' | 'less_walking';
  accessibleStepFree?: boolean; // When true, strictly exclude non-step-free bridges and stairs
  preferredModes?: TransportMode[];
  excludedModes?: TransportMode[];
  maxWalkMinutes?: number;
  expressAdvantageThresholdMinutes?: number; // Configurable preference (defaults to 15)
  hasSuburbanSeasonPass?: boolean;
  acOnly?: boolean;
}

export interface MultimodalQuery {
  origin: string | DoorToDoorLocation;
  destination: string | DoorToDoorLocation;
  departureTime?: string; // HH:MM
  arriveByDeadline?: string; // HH:MM
  date?: string; // YYYY-MM-DD
  city?: string;
  preferences?: MultimodalRoutingPreferences;
}

export interface MultimodalItineraryLeg {
  legIndex: number;
  mode: TransportMode;
  operator: string;
  lineName: string;
  routeIdentifier: string;
  fromNode: MultimodalNode;
  toNode: MultimodalNode;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  distanceKm: number;
  fareInr: number;
  isAcService: boolean;
  stepFreeAccessible: boolean;
  dataQuality: DataQualityStatus;
  provenanceLabel: string;
  bookingDeepLink?: string;
  delayMinutes?: number;
  disruptionNote?: string;
  instructions: string;
}

export interface MultimodalTransfer {
  transferIndex: number;
  atNode: MultimodalNode;
  fromMode: TransportMode;
  toMode: TransportMode;
  walkMinutes: number;
  bufferMinutes: number;
  stepFreeAccessible: boolean;
  transferGuide: string;
}

export interface MultimodalItinerary {
  id: string;
  origin: MultimodalNode | { name: string };
  destination: MultimodalNode | { name: string };
  legs: MultimodalItineraryLeg[];
  transfers: MultimodalTransfer[];
  departureTime: string;
  arrivalTime: string;
  totalDurationMinutes: number;
  totalWalkMinutes: number;
  totalDistanceKm: number;
  totalFareInr: number;
  fareBreakdownByMode: Partial<Record<TransportMode, number>>;
  isStepFreeAccessible: boolean;
  isAcOnly: boolean;
  score: number;
  rankReason: string;
  badges: string[]; // ['FASTEST', 'DIRECT_METRO', 'CHEAPEST', 'STEP_FREE', 'LOW_WALK']
  transparentRationale: string;
  dataQualitySummary: DataQualityStatus;
  hasUnavailableSegments: boolean;
  leaveHomeTime?: string;
}

export interface CoverageManifestEntry {
  operator: string;
  mode: TransportMode;
  serviceScope: string;
  operationalStatus: OperationalServiceState;
  timetableEffective: string;
  officialSourceUrl: string;
  publisher: string;
  permittedUsage: string;
  verificationStatus: 'VERIFIED' | 'TIMETABLE_MODEL' | 'PENDING_INTEGRATION';
}

export interface CityPack {
  cityId: string;
  name: string;
  nativeName: string;
  state: string;
  tier: 'FLAGSHIP_TIER1' | 'REGIONAL_TIER2';
  centerLat: number;
  centerLon: number;
  coverageManifest: CoverageManifestEntry[];
  nodes: MultimodalNode[];
  edges: MultimodalEdge[];
  landmarks: Record<string, DoorToDoorLocation>;
  defaultOriginCode: string;
  defaultDestCode: string;
}
