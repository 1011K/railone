/**
 * RailOne Next — Coach Alignment & Platform Landmark Domain Model
 * Separates intrinsic RakeFormation from station/platform PlatformAlignment and PlatformLandmarks.
 * Strict provenance: Never reuses Dadar data for unaligned stations.
 */

import { DataStatus } from '../types/railway';

export type RakeModelType = 
  | '12_car_suburban' 
  | '12_car_ac_suburban' 
  | '15_car_suburban' 
  | '16_car_vande_bharat' 
  | '22_car_express';

export type CoachCategory = 
  | 'general' 
  | 'ladies' 
  | 'first_class' 
  | 'divyangjan' 
  | 'ac_chair' 
  | 'executive' 
  | 'ac_sleeper' 
  | 'sleeper' 
  | 'pantry' 
  | 'motor_loco';

export interface RakeCoach {
  sequence: number; // 1-indexed (1 to totalCoaches)
  identifier: string; // e.g. "ENG/GS", "GS", "C1", "E1", "S1", "B1"
  category: CoachCategory;
  className: string;
  isAccessible: boolean;
  isLadiesReserved: boolean;
  isFirstClass: boolean;
  isAirConditioned: boolean;
  ticketNotice: string;
  description: string;
}

export interface RakeFormation {
  rakeType: RakeModelType;
  name: string;
  shortLabel: string;
  totalCoaches: number;
  isAirConditioned: boolean;
  coaches: RakeCoach[];
}

export type LandmarkType = 
  | 'FOB' 
  | 'LIFT' 
  | 'ESCALATOR' 
  | 'RAMP' 
  | 'EXIT' 
  | 'INTERCHANGE_BRIDGE' 
  | 'PLATFORM_ZONE' 
  | 'POLE_MARKER';

export interface PlatformLandmark {
  id: string;
  stationCode: string;
  platformNumber: string;
  landmarkType: LandmarkType;
  name: string;
  relativePositionMeters: number; // 0m = South reference end
  description: string;
  isStepFree: boolean;
  connectsTo?: string;
}

export interface CoachStoppingZone {
  coachSequence: number;
  centerPositionMeters: number;
  platformPole: string;
  zoneLabel: string;
}

export interface PlatformAlignment {
  stationCode: string;
  platformNumber: string;
  direction: 'UP' | 'DOWN' | 'BOTH';
  platformLengthMeters: number;
  supportedRakeTypes: RakeModelType[];
  stoppingOffsetMeters: number;
  trainOrientation: 'NORTH_TO_SOUTH' | 'SOUTH_TO_NORTH';
  rakeStartEndReference: string;
  stoppingZones: Partial<Record<RakeModelType, CoachStoppingZone[]>>;
  landmarks: PlatformLandmark[];
  provenance: DataStatus;
}

export interface CoachRecommendation {
  status: 'AVAILABLE' | 'UNAVAILABLE';
  message?: string;
  formation?: RakeFormation;
  selectedCoach?: RakeCoach;
  stoppingZone?: CoachStoppingZone;
  nearestLandmark?: PlatformLandmark;
  distanceMeters?: number;
  walkDirection?: 'ahead' | 'behind' | 'at coach';
  primaryRecommendationText?: string;
  nearestStepFreeLandmark?: PlatformLandmark | null;
  landmarks?: PlatformLandmark[];
  provenance?: DataStatus;
}

// =========================================================================
// 1. INTRINSIC RAKE FORMATIONS (Station-agnostic)
// =========================================================================

export const RAKE_FORMATIONS: Record<RakeModelType, RakeFormation> = {
  // 12-Car Mumbai Suburban Non-AC Local EMU
  '12_car_suburban': {
    rakeType: '12_car_suburban',
    name: '12-Car Standard Suburban EMU',
    shortLabel: '12-car Non-AC',
    totalCoaches: 12,
    isAirConditioned: false,
    coaches: [
      { sequence: 1, identifier: 'ENG / GS', category: 'motor_loco', className: 'II General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Motor Driving Cab & General Second Class compartment (South End).', ticketNotice: 'Standard Suburban 2nd Class ticket.' },
      { sequence: 2, identifier: 'GS', category: 'general', className: 'II General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'General Second Class passenger coach.', ticketNotice: 'Standard Suburban 2nd Class ticket.' },
      { sequence: 3, identifier: 'DIVYANG', category: 'divyangjan', className: 'Divyangjan / Senior', isAccessible: true, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Reserved for Divyangjan (Handicap / Wheelchair) and Senior Citizens.', ticketNotice: 'Divyangjan concession / Senior Citizen entitlement.' },
      { sequence: 4, identifier: 'LADIES II', category: 'ladies', className: 'Ladies Second Class', isAccessible: false, isLadiesReserved: true, isFirstClass: false, isAirConditioned: false, description: 'Exclusively reserved for female commuters (Railways Act Section 162 applies).', ticketNotice: 'Suburban 2nd Class ticket (Ladies only).' },
      { sequence: 5, identifier: 'FC I', category: 'first_class', className: 'First Class', isAccessible: false, isLadiesReserved: false, isFirstClass: true, isAirConditioned: false, description: 'Suburban First Class compartment with cushioned seating.', ticketNotice: 'First Class MST or single journey ticket.' },
      { sequence: 6, identifier: 'MOTOR / GS', category: 'motor_loco', className: 'II General (Mid)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Mid-rake motor unit & General Second Class compartment.', ticketNotice: 'Standard Suburban 2nd Class ticket.' },
      { sequence: 7, identifier: 'GS', category: 'general', className: 'II General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'General Second Class passenger coach.', ticketNotice: 'Standard Suburban 2nd Class ticket.' },
      { sequence: 8, identifier: 'FC I', category: 'first_class', className: 'First Class', isAccessible: false, isLadiesReserved: false, isFirstClass: true, isAirConditioned: false, description: 'Mid-North First Class compartment.', ticketNotice: 'First Class MST or ticket required.' },
      { sequence: 9, identifier: 'LADIES FC', category: 'ladies', className: 'Ladies First Class', isAccessible: false, isLadiesReserved: true, isFirstClass: true, isAirConditioned: false, description: 'First Class compartment reserved exclusively for female commuters.', ticketNotice: 'First Class MST or ticket (Ladies only).' },
      { sequence: 10, identifier: 'LADIES II', category: 'ladies', className: 'Ladies Second Class', isAccessible: false, isLadiesReserved: true, isFirstClass: false, isAirConditioned: false, description: 'Second Ladies compartment towards North end.', ticketNotice: 'Suburban 2nd Class ticket (Ladies only).' },
      { sequence: 11, identifier: 'GS', category: 'general', className: 'II General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'General Second Class passenger coach.', ticketNotice: 'Standard Suburban 2nd Class ticket.' },
      { sequence: 12, identifier: 'GUARD / GS', category: 'motor_loco', className: 'II General (North End)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Guard Van & General Second Class (North End).', ticketNotice: 'Standard Suburban 2nd Class ticket.' }
    ]
  },

  // 12-Car Mumbai AC Suburban Local
  '12_car_ac_suburban': {
    rakeType: '12_car_ac_suburban',
    name: '12-Car AC Suburban EMU',
    shortLabel: '12-car AC Local',
    totalCoaches: 12,
    isAirConditioned: true,
    coaches: [
      { sequence: 1, identifier: 'C1 / MOTOR', category: 'ac_chair', className: 'AC Local General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Air-conditioned vestibule coach with automatic sealed sliding doors.', ticketNotice: 'Suburban AC Local ticket or AC Season Pass.' },
      { sequence: 2, identifier: 'C2', category: 'ac_chair', className: 'AC Local General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'AC Passenger coach with vestibuled walk-through connection.', ticketNotice: 'Suburban AC Local ticket.' },
      { sequence: 3, identifier: 'C3 DIVYANG', category: 'divyangjan', className: 'AC Divyangjan', isAccessible: true, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Designated AC compartment space for wheelchair & Divyangjan passengers.', ticketNotice: 'AC Local Divyangjan concessional ticket.' },
      { sequence: 4, identifier: 'C4 LADIES', category: 'ladies', className: 'AC Ladies Reserved', isAccessible: false, isLadiesReserved: true, isFirstClass: false, isAirConditioned: true, description: 'Reserved for female commuters in AC local rake.', ticketNotice: 'AC Local Ladies ticket.' },
      { sequence: 5, identifier: 'C5', category: 'ac_chair', className: 'AC Local General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Central air-conditioned coach with broad gangway.', ticketNotice: 'Suburban AC Local ticket.' },
      { sequence: 6, identifier: 'C6 MOTOR', category: 'ac_chair', className: 'AC Local General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Mid-rake motor driving unit with passenger seating.', ticketNotice: 'Suburban AC Local ticket.' },
      { sequence: 7, identifier: 'C7', category: 'ac_chair', className: 'AC Local General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Vestibuled AC commuter car.', ticketNotice: 'Suburban AC Local ticket.' },
      { sequence: 8, identifier: 'C8', category: 'ac_chair', className: 'AC Local General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Air-conditioned commuter car.', ticketNotice: 'Suburban AC Local ticket.' },
      { sequence: 9, identifier: 'C9 LADIES', category: 'ladies', className: 'AC Ladies Reserved', isAccessible: false, isLadiesReserved: true, isFirstClass: false, isAirConditioned: true, description: 'Second AC coach reserved for female commuters.', ticketNotice: 'AC Local Ladies ticket.' },
      { sequence: 10, identifier: 'C10', category: 'ac_chair', className: 'AC Local General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Vestibuled AC commuter car.', ticketNotice: 'Suburban AC Local ticket.' },
      { sequence: 11, identifier: 'C11', category: 'ac_chair', className: 'AC Local General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Air-conditioned commuter car.', ticketNotice: 'Suburban AC Local ticket.' },
      { sequence: 12, identifier: 'C12 / GUARD', category: 'ac_chair', className: 'AC Local (North End)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Guard van and air-conditioned passenger compartment (North End).', ticketNotice: 'Suburban AC Local ticket.' }
    ]
  },

  // 15-Car Mumbai Suburban EMU
  '15_car_suburban': {
    rakeType: '15_car_suburban',
    name: '15-Car Heavy-Duty Suburban EMU',
    shortLabel: '15-car Fast Local',
    totalCoaches: 15,
    isAirConditioned: false,
    coaches: [
      { sequence: 1, identifier: 'ENG / GS', category: 'motor_loco', className: 'II General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Motor Driving Cab & General Second Class (South End).', ticketNotice: 'Standard Suburban 2nd Class ticket.' },
      { sequence: 2, identifier: 'GS', category: 'general', className: 'II General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'General Second Class passenger coach.', ticketNotice: 'Standard Suburban 2nd Class ticket.' },
      { sequence: 3, identifier: 'DIVYANG', category: 'divyangjan', className: 'Divyangjan / Senior', isAccessible: true, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Wheelchair / Divyangjan reserved compartment.', ticketNotice: 'Divyangjan concession / Senior ID.' },
      { sequence: 4, identifier: 'LADIES II', category: 'ladies', className: 'Ladies Second Class', isAccessible: false, isLadiesReserved: true, isFirstClass: false, isAirConditioned: false, description: 'Ladies Second Class compartment.', ticketNotice: 'Suburban 2nd Class ticket (Ladies only).' },
      { sequence: 5, identifier: 'FC I', category: 'first_class', className: 'First Class', isAccessible: false, isLadiesReserved: false, isFirstClass: true, isAirConditioned: false, description: 'First Class compartment.', ticketNotice: 'First Class MST or ticket required.' },
      { sequence: 6, identifier: 'MOTOR / GS', category: 'motor_loco', className: 'II General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Motor coach & Second Class.', ticketNotice: 'Standard Suburban 2nd Class ticket.' },
      { sequence: 7, identifier: 'GS', category: 'general', className: 'II General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'General Second Class passenger coach.', ticketNotice: 'Standard Suburban 2nd Class ticket.' },
      { sequence: 8, identifier: 'FC I', category: 'first_class', className: 'First Class', isAccessible: false, isLadiesReserved: false, isFirstClass: true, isAirConditioned: false, description: 'Mid-rake First Class compartment.', ticketNotice: 'First Class MST or ticket required.' },
      { sequence: 9, identifier: 'LADIES FC', category: 'ladies', className: 'Ladies First Class', isAccessible: false, isLadiesReserved: true, isFirstClass: true, isAirConditioned: false, description: 'Ladies First Class compartment.', ticketNotice: 'First Class MST or ticket (Ladies only).' },
      { sequence: 10, identifier: 'LADIES II', category: 'ladies', className: 'Ladies Second Class', isAccessible: false, isLadiesReserved: true, isFirstClass: false, isAirConditioned: false, description: 'Ladies Second Class compartment.', ticketNotice: 'Suburban 2nd Class ticket (Ladies only).' },
      { sequence: 11, identifier: 'GS', category: 'general', className: 'II General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'General Second Class coach.', ticketNotice: 'Standard Suburban 2nd Class ticket.' },
      { sequence: 12, identifier: 'MOTOR / GS', category: 'motor_loco', className: 'II General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Additional 3-car unit motor coach.', ticketNotice: 'Standard Suburban 2nd Class ticket.' },
      { sequence: 13, identifier: 'GS', category: 'general', className: 'II General', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'General Second Class coach.', ticketNotice: 'Standard Suburban 2nd Class ticket.' },
      { sequence: 14, identifier: 'FC I', category: 'first_class', className: 'First Class', isAccessible: false, isLadiesReserved: false, isFirstClass: true, isAirConditioned: false, description: 'North section First Class compartment.', ticketNotice: 'First Class MST or ticket required.' },
      { sequence: 15, identifier: 'GUARD / GS', category: 'motor_loco', className: 'II General (North End)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Guard Van & General Second Class (North End).', ticketNotice: 'Standard Suburban 2nd Class ticket.' }
    ]
  },

  // 16-Car Vande Bharat Express
  '16_car_vande_bharat': {
    rakeType: '16_car_vande_bharat',
    name: '16-Car Vande Bharat Express',
    shortLabel: '16-car Vande Bharat',
    totalCoaches: 16,
    isAirConditioned: true,
    coaches: [
      { sequence: 1, identifier: 'DTC (C1)', category: 'ac_chair', className: 'AC Chair Car', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Driving Trailer Coach - AC Chair Car (CC).', ticketNotice: 'IRCTC Vande Bharat CC ticket.' },
      { sequence: 2, identifier: 'MC (C2)', category: 'ac_chair', className: 'AC Chair Car', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Motor Coach - AC Chair Car.', ticketNotice: 'Vande Bharat CC ticket.' },
      { sequence: 3, identifier: 'TC (C3)', category: 'ac_chair', className: 'AC Chair Car', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Trailer Coach - AC Chair Car.', ticketNotice: 'Vande Bharat CC ticket.' },
      { sequence: 4, identifier: 'MC (C4)', category: 'ac_chair', className: 'AC Chair Car', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Motor Coach - AC Chair Car.', ticketNotice: 'Vande Bharat CC ticket.' },
      { sequence: 5, identifier: 'TC (C5)', category: 'ac_chair', className: 'AC Chair Car', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Trailer Coach - AC Chair Car.', ticketNotice: 'Vande Bharat CC ticket.' },
      { sequence: 6, identifier: 'MC (C6)', category: 'ac_chair', className: 'AC Chair Car', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Motor Coach - AC Chair Car.', ticketNotice: 'Vande Bharat CC ticket.' },
      { sequence: 7, identifier: 'TC (C7)', category: 'divyangjan', className: 'AC CC (Accessible)', isAccessible: true, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Accessible wheelchair space and Braille seat numbers.', ticketNotice: 'Vande Bharat CC ticket.' },
      { sequence: 8, identifier: 'NDTC (E1)', category: 'executive', className: 'Executive Class', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Executive Chair Car (EC) with 180° rotating seats.', ticketNotice: 'Vande Bharat EC ticket (Premium tariff).' },
      { sequence: 9, identifier: 'NDTC (E2)', category: 'executive', className: 'Executive Class', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Executive Chair Car (EC) with premium catering.', ticketNotice: 'Vande Bharat EC ticket.' },
      { sequence: 10, identifier: 'TC (C8)', category: 'ac_chair', className: 'AC Chair Car', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Trailer Coach - AC Chair Car.', ticketNotice: 'Vande Bharat CC ticket.' },
      { sequence: 11, identifier: 'MC (C9)', category: 'ac_chair', className: 'AC Chair Car', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Motor Coach - AC Chair Car.', ticketNotice: 'Vande Bharat CC ticket.' },
      { sequence: 12, identifier: 'TC (C10)', category: 'ac_chair', className: 'AC Chair Car', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Trailer Coach - AC Chair Car.', ticketNotice: 'Vande Bharat CC ticket.' },
      { sequence: 13, identifier: 'MC (C11)', category: 'ac_chair', className: 'AC Chair Car', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Motor Coach - AC Chair Car.', ticketNotice: 'Vande Bharat CC ticket.' },
      { sequence: 14, identifier: 'TC (C12)', category: 'ac_chair', className: 'AC Chair Car', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Trailer Coach - AC Chair Car.', ticketNotice: 'Vande Bharat CC ticket.' },
      { sequence: 15, identifier: 'MC (C13)', category: 'ac_chair', className: 'AC Chair Car', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Motor Coach - AC Chair Car.', ticketNotice: 'Vande Bharat CC ticket.' },
      { sequence: 16, identifier: 'DTC (C14)', category: 'ac_chair', className: 'AC Chair Car (Cab)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Driving Trailer Coach (North End).', ticketNotice: 'Vande Bharat CC ticket.' }
    ]
  },

  // 22-Car Indian Railways Mail / Express
  '22_car_express': {
    rakeType: '22_car_express',
    name: '22-Car Mail / Express ICF & LHB Rake',
    shortLabel: '22-car Express',
    totalCoaches: 22,
    isAirConditioned: false,
    coaches: [
      { sequence: 1, identifier: 'LOCO', category: 'motor_loco', className: 'Locomotive', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Electric Locomotive (WAP-7 / WAP-5).', ticketNotice: 'Crew only.' },
      { sequence: 2, identifier: 'SLR 1', category: 'motor_loco', className: 'Luggage / Divyangjan', isAccessible: true, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Seating cum Luggage Rake with Divyangjan compartment.', ticketNotice: 'General 2S or Divyangjan ticket.' },
      { sequence: 3, identifier: 'GS 1', category: 'general', className: 'General 2S (Unreserved)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'General Second Class unreserved coach.', ticketNotice: 'Unreserved Mail/Express ticket or MST.' },
      { sequence: 4, identifier: 'GS 2', category: 'general', className: 'General 2S (Unreserved)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'General Second Class unreserved coach.', ticketNotice: 'Unreserved Mail/Express ticket.' },
      { sequence: 5, identifier: 'S1', category: 'sleeper', className: 'Sleeper Class (SL)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Reserved Sleeper Class coach.', ticketNotice: 'Sleeper reservation ticket.' },
      { sequence: 6, identifier: 'S2', category: 'sleeper', className: 'Sleeper Class (SL)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Reserved Sleeper Class coach.', ticketNotice: 'Sleeper reservation ticket.' },
      { sequence: 7, identifier: 'S3', category: 'sleeper', className: 'Sleeper Class (SL)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Reserved Sleeper Class coach.', ticketNotice: 'Sleeper reservation ticket.' },
      { sequence: 8, identifier: 'S4', category: 'sleeper', className: 'Sleeper Class (SL)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Reserved Sleeper Class coach.', ticketNotice: 'Sleeper reservation ticket.' },
      { sequence: 9, identifier: 'S5', category: 'sleeper', className: 'Sleeper Class (SL)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Reserved Sleeper Class coach.', ticketNotice: 'Sleeper reservation ticket.' },
      { sequence: 10, identifier: 'S6', category: 'sleeper', className: 'Sleeper Class (SL)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Reserved Sleeper Class coach.', ticketNotice: 'Sleeper reservation ticket.' },
      { sequence: 11, identifier: 'PC', category: 'pantry', className: 'Pantry Car', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Onboard catering kitchen and pantry services.', ticketNotice: 'Staff and pantry service only.' },
      { sequence: 12, identifier: 'B1', category: 'ac_sleeper', className: 'AC 3-Tier (3A)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Air-conditioned 3-Tier sleeper coach.', ticketNotice: '3A reservation ticket.' },
      { sequence: 13, identifier: 'B2', category: 'ac_sleeper', className: 'AC 3-Tier (3A)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Air-conditioned 3-Tier sleeper coach.', ticketNotice: '3A reservation ticket.' },
      { sequence: 14, identifier: 'B3', category: 'ac_sleeper', className: 'AC 3-Tier (3A)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Air-conditioned 3-Tier sleeper coach.', ticketNotice: '3A reservation ticket.' },
      { sequence: 15, identifier: 'B4', category: 'ac_sleeper', className: 'AC 3-Tier (3A)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Air-conditioned 3-Tier sleeper coach.', ticketNotice: '3A reservation ticket.' },
      { sequence: 16, identifier: 'B5', category: 'ac_sleeper', className: 'AC 3-Tier (3A)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Air-conditioned 3-Tier sleeper coach.', ticketNotice: '3A reservation ticket.' },
      { sequence: 17, identifier: 'A1', category: 'ac_sleeper', className: 'AC 2-Tier (2A)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Air-conditioned 2-Tier sleeper coach with privacy curtains.', ticketNotice: '2A reservation ticket.' },
      { sequence: 18, identifier: 'A2', category: 'ac_sleeper', className: 'AC 2-Tier (2A)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: true, description: 'Air-conditioned 2-Tier sleeper coach.', ticketNotice: '2A reservation ticket.' },
      { sequence: 19, identifier: 'H1', category: 'ac_sleeper', className: 'AC First Class (1A)', isAccessible: false, isLadiesReserved: false, isFirstClass: true, isAirConditioned: true, description: 'Premium lockable coupes and 4-berth cabins.', ticketNotice: '1A reservation ticket.' },
      { sequence: 20, identifier: 'GS 3', category: 'general', className: 'General 2S (Unreserved)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Rear General Second Class unreserved coach.', ticketNotice: 'Unreserved Mail/Express ticket.' },
      { sequence: 21, identifier: 'GS 4', category: 'general', className: 'General 2S (Unreserved)', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Rear General Second Class unreserved coach.', ticketNotice: 'Unreserved Mail/Express ticket.' },
      { sequence: 22, identifier: 'SLR 2', category: 'motor_loco', className: 'Guard / Luggage', isAccessible: false, isLadiesReserved: false, isFirstClass: false, isAirConditioned: false, description: 'Rear Guard Van, parcels & brake compartment.', ticketNotice: 'Guard van / unreserved.' }
    ]
  }
};

/**
 * Get rake formation strictly by supported type.
 * Never silently falls back from an unsupported rake to 12-car suburban.
 */
export function getRakeFormation(rakeType: RakeModelType): RakeFormation | null {
  if (!rakeType || !RAKE_FORMATIONS[rakeType]) {
    return null;
  }
  return RAKE_FORMATIONS[rakeType];
}

// =========================================================================
// 2. PLATFORM ALIGNMENTS & LANDMARKS DATABASE
// =========================================================================

function generateStoppingZones(totalCoaches: number, offsetMeters = 15, coachLength = 22): CoachStoppingZone[] {
  return Array.from({ length: totalCoaches }, (_, i) => {
    const seq = i + 1;
    const center = offsetMeters + (i * coachLength) + (coachLength / 2);
    const poleStart = i + 1;
    const poleEnd = i + 2;
    return {
      coachSequence: seq,
      centerPositionMeters: Math.round(center),
      platformPole: `Poles ${poleStart}–${poleEnd}`,
      zoneLabel: `Zone ${String.fromCharCode(65 + Math.floor(i / 3))}`
    };
  });
}

export const PLATFORM_ALIGNMENTS: Record<string, PlatformAlignment> = {
  // Dadar Platform 3 (Western Railway Fast / Slow Northbound)
  'DR_3': {
    stationCode: 'DR',
    platformNumber: '3',
    direction: 'DOWN',
    platformLengthMeters: 320,
    supportedRakeTypes: ['12_car_suburban', '12_car_ac_suburban', '15_car_suburban'],
    stoppingOffsetMeters: 10,
    trainOrientation: 'SOUTH_TO_NORTH',
    rakeStartEndReference: 'South end aligned with Pole 1',
    provenance: 'LIVE_VERIFIED',
    stoppingZones: {
      '12_car_suburban': generateStoppingZones(12, 10, 22),
      '12_car_ac_suburban': generateStoppingZones(12, 10, 22),
      '15_car_suburban': generateStoppingZones(15, 10, 21)
    },
    landmarks: [
      { id: 'DR3-FOB-S', stationCode: 'DR', platformNumber: '3', landmarkType: 'FOB', name: 'South Foot-Over-Bridge', relativePositionMeters: 30, description: 'Stairs to Tilak Road and Dadar West commercial market.', isStepFree: false, connectsTo: 'Tilak Road Exit' },
      { id: 'DR3-LIFT-S', stationCode: 'DR', platformNumber: '3', landmarkType: 'LIFT', name: 'South FOB Elevator (♿)', relativePositionMeters: 35, description: 'Step-free lift connecting Platform 3 to South FOB concourse.', isStepFree: true, connectsTo: 'South Concourse' },
      { id: 'DR3-FOB-M', stationCode: 'DR', platformNumber: '3', landmarkType: 'INTERCHANGE_BRIDGE', name: 'Middle Foot-Over-Bridge', relativePositionMeters: 110, description: 'Direct high-capacity interchange bridge linking Western Lines to Central Railway Platform 8/6.', isStepFree: false, connectsTo: 'Central Railway Platforms 6, 7 & 8' },
      { id: 'DR3-LIFT-M', stationCode: 'DR', platformNumber: '3', landmarkType: 'LIFT', name: 'Middle FOB Transfer Lift (♿)', relativePositionMeters: 118, description: 'Step-free elevator to central interchange bridge.', isStepFree: true, connectsTo: 'Central Interchange Skywalk' },
      { id: 'DR3-FOB-N', stationCode: 'DR', platformNumber: '3', landmarkType: 'FOB', name: 'North Foot-Over-Bridge', relativePositionMeters: 230, description: 'Stairs leading to Dadar Flower Market and Senapati Bapat Marg exit.', isStepFree: false, connectsTo: 'Flower Market Exit' },
      { id: 'DR3-RAMP-N', stationCode: 'DR', platformNumber: '3', landmarkType: 'RAMP', name: 'North Wheelchair Ramp (♿)', relativePositionMeters: 245, description: 'Step-free ramp to Senapati Bapat Marg station circulation.', isStepFree: true, connectsTo: 'Senapati Bapat Marg' }
    ]
  },

  // Dadar Platform 8 (Central Railway Fast Southbound / Express Terminus)
  'DR_8': {
    stationCode: 'DR',
    platformNumber: '8',
    direction: 'UP',
    platformLengthMeters: 550,
    supportedRakeTypes: ['12_car_suburban', '12_car_ac_suburban', '15_car_suburban', '16_car_vande_bharat', '22_car_express'],
    stoppingOffsetMeters: 20,
    trainOrientation: 'NORTH_TO_SOUTH',
    rakeStartEndReference: 'North end engine halt near Pole 24',
    provenance: 'LIVE_VERIFIED',
    stoppingZones: {
      '12_car_suburban': generateStoppingZones(12, 40, 22),
      '12_car_ac_suburban': generateStoppingZones(12, 40, 22),
      '15_car_suburban': generateStoppingZones(15, 25, 21),
      '16_car_vande_bharat': generateStoppingZones(16, 20, 23),
      '22_car_express': generateStoppingZones(22, 10, 24)
    },
    landmarks: [
      { id: 'DR8-FOB-S', stationCode: 'DR', platformNumber: '8', landmarkType: 'FOB', name: 'South Dadar CR FOB', relativePositionMeters: 60, description: 'Stairs to Tilak Bridge exit and Central Line booking hall.', isStepFree: false, connectsTo: 'Tilak Bridge Concourse' },
      { id: 'DR8-LIFT-S', stationCode: 'DR', platformNumber: '8', landmarkType: 'LIFT', name: 'South Platform 8 Lift (♿)', relativePositionMeters: 68, description: 'Elevator to South FOB concourse.', isStepFree: true, connectsTo: 'South Concourse' },
      { id: 'DR8-FOB-M', stationCode: 'DR', platformNumber: '8', landmarkType: 'INTERCHANGE_BRIDGE', name: 'Central Interchange Skywalk', relativePositionMeters: 200, description: 'Direct pedestrian link across to Western Railway Platforms 1–4.', isStepFree: false, connectsTo: 'Western Railway Concourse' },
      { id: 'DR8-LIFT-M', stationCode: 'DR', platformNumber: '8', landmarkType: 'LIFT', name: 'Central Skywalk Lift (♿)', relativePositionMeters: 210, description: 'Step-free transfer elevator to WR Skywalk.', isStepFree: true, connectsTo: 'Western Interchange' },
      { id: 'DR8-FOB-N', stationCode: 'DR', platformNumber: '8', landmarkType: 'FOB', name: 'North Central FOB', relativePositionMeters: 380, description: 'Exit to Swami Gyanjivandas Road and Dadar East bus terminus.', isStepFree: false, connectsTo: 'Dadar East Station Plaza' }
    ]
  },

  // Thane Platform 1 (Central Railway Slow Southbound)
  'TNA_1': {
    stationCode: 'TNA',
    platformNumber: '1',
    direction: 'UP',
    platformLengthMeters: 310,
    supportedRakeTypes: ['12_car_suburban', '12_car_ac_suburban'],
    stoppingOffsetMeters: 15,
    trainOrientation: 'NORTH_TO_SOUTH',
    rakeStartEndReference: 'South end aligned with Pole 1',
    provenance: 'SCHEDULED',
    stoppingZones: {
      '12_car_suburban': generateStoppingZones(12, 15, 22),
      '12_car_ac_suburban': generateStoppingZones(12, 15, 22)
    },
    landmarks: [
      { id: 'TNA1-FOB-S', stationCode: 'TNA', platformNumber: '1', landmarkType: 'FOB', name: 'South Foot-Over-Bridge', relativePositionMeters: 40, description: 'Direct stairs to Thane West bus deck and main concourse.', isStepFree: false, connectsTo: 'Thane West Concourse' },
      { id: 'TNA1-LIFT-S', stationCode: 'TNA', platformNumber: '1', landmarkType: 'LIFT', name: 'Thane West Lift (♿)', relativePositionMeters: 45, description: 'Elevator for senior citizens and wheelchair passengers.', isStepFree: true, connectsTo: 'Main Station Hall' },
      { id: 'TNA1-FOB-M', stationCode: 'TNA', platformNumber: '1', landmarkType: 'FOB', name: 'Middle Foot-Over-Bridge', relativePositionMeters: 135, description: 'Interchange bridge connecting Platforms 1 to 10.', isStepFree: false, connectsTo: 'All Platforms Transfer' },
      { id: 'TNA1-FOB-N', stationCode: 'TNA', platformNumber: '1', landmarkType: 'FOB', name: 'North Foot-Over-Bridge', relativePositionMeters: 240, description: 'Exit towards Kalwa direction / Talao Pali.', isStepFree: false, connectsTo: 'North Concourse' }
    ]
  },

  // CSMT Platform 18 (Express & Vande Bharat Long-Distance Trunk)
  'CSMT_18': {
    stationCode: 'CSMT',
    platformNumber: '18',
    direction: 'DOWN',
    platformLengthMeters: 600,
    supportedRakeTypes: ['16_car_vande_bharat', '22_car_express'],
    stoppingOffsetMeters: 20,
    trainOrientation: 'SOUTH_TO_NORTH',
    rakeStartEndReference: 'Buffer stop terminal at south concourse (0m)',
    provenance: 'LIVE_VERIFIED',
    stoppingZones: {
      '16_car_vande_bharat': generateStoppingZones(16, 25, 23),
      '22_car_express': generateStoppingZones(22, 15, 24)
    },
    landmarks: [
      { id: 'CSMT18-CONC', stationCode: 'CSMT', platformNumber: '18', landmarkType: 'EXIT', name: 'Main Heritage Concourse & Taxi Stand', relativePositionMeters: 10, description: 'Buffer stop terminal hall with step-free exit to Dr. DN Road.', isStepFree: true, connectsTo: 'CSMT Main Terminal Hall' },
      { id: 'CSMT18-FOB-M', stationCode: 'CSMT', platformNumber: '18', landmarkType: 'FOB', name: 'Express Foot-Over-Bridge', relativePositionMeters: 250, description: 'Pedestrian bridge connecting long-distance platforms to P. D\'Mello Road East exit.', isStepFree: false, connectsTo: 'P. D\'Mello Road Exit' },
      { id: 'CSMT18-LIFT-M', stationCode: 'CSMT', platformNumber: '18', landmarkType: 'LIFT', name: 'Platform 18 East Lift (♿)', relativePositionMeters: 255, description: 'Step-free lift to P. D\'Mello Road concourse.', isStepFree: true, connectsTo: 'East Concourse' }
    ]
  }
};

/**
 * Fetch platform alignment for a specific station and platform.
 * Returns null if alignment is not verified for this specific station & platform.
 * NEVER returns Dadar data as a fallback for another station.
 */
export function getPlatformAlignment(stationCode: string, platformNumber: string | number): PlatformAlignment | null {
  const normCode = (stationCode || '').toUpperCase().trim();
  const rawPf = String(platformNumber || '').trim();
  const cleanPf = rawPf.replace(/^(?:pf|platform)\s*#?\s*/i, '').trim();
  const keyWithClean = `${normCode}_${cleanPf}`;
  const keyWithRaw = `${normCode}_${rawPf}`;
  return PLATFORM_ALIGNMENTS[keyWithClean] || PLATFORM_ALIGNMENTS[keyWithRaw] || null;
}


// =========================================================================
// 3. DERIVED RECOMMENDATION ENGINE
// =========================================================================

export function computeCoachRecommendation(params: {
  rakeType: RakeModelType;
  coachSequence: number;
  stationCode: string;
  platformNumber: string | number;
}): CoachRecommendation {
  const formation = getRakeFormation(params.rakeType);
  if (!formation) {
    return {
      status: 'UNAVAILABLE',
      message: `Unsupported rake model type: "${params.rakeType}". Valid types are: ${Object.keys(RAKE_FORMATIONS).join(', ')}.`
    };
  }

  const selectedCoach = formation.coaches.find(c => c.sequence === params.coachSequence) || formation.coaches[0];

  const alignment = getPlatformAlignment(params.stationCode, params.platformNumber);
  if (!alignment) {
    return {
      status: 'UNAVAILABLE',
      message: 'Coach alignment unavailable for this station/platform.',
      formation,
      selectedCoach
    };
  }

  const zones = alignment.stoppingZones[params.rakeType];
  if (!zones || zones.length === 0) {
    return {
      status: 'UNAVAILABLE',
      message: `Alignment data for ${formation.name} is unavailable on Platform ${params.platformNumber} of ${params.stationCode}.`,
      formation,
      selectedCoach
    };
  }

  const stoppingZone = zones.find(z => z.coachSequence === selectedCoach.sequence) || zones[0];
  const coachCenter = stoppingZone.centerPositionMeters;

  // Find nearest platform landmark
  let nearestLandmark: PlatformLandmark | undefined;
  let minDistance = Infinity;

  for (const lm of alignment.landmarks) {
    const dist = Math.abs(lm.relativePositionMeters - coachCenter);
    if (dist < minDistance) {
      minDistance = dist;
      nearestLandmark = lm;
    }
  }

  // Find nearest step-free landmark (elevator / ramp)
  let nearestStepFree: PlatformLandmark | null = null;
  let minStepFreeDist = Infinity;
  for (const lm of alignment.landmarks) {
    if (lm.isStepFree) {
      const dist = Math.abs(lm.relativePositionMeters - coachCenter);
      if (dist < minStepFreeDist) {
        minStepFreeDist = dist;
        nearestStepFree = lm;
      }
    }
  }

  let walkDirection: 'ahead' | 'behind' | 'at coach' = 'at coach';
  if (nearestLandmark) {
    const diff = nearestLandmark.relativePositionMeters - coachCenter;
    if (diff > 5) walkDirection = 'ahead';
    else if (diff < -5) walkDirection = 'behind';
  }

  const distText = minDistance <= 5 ? 'directly opposite' : `approximately ${minDistance}m ${walkDirection}`;
  const primaryText = nearestLandmark 
    ? `Stand near Coach ${selectedCoach.sequence} (${selectedCoach.className}) · ${nearestLandmark.name} is ${distText}`
    : `Stand near Coach ${selectedCoach.sequence} (${selectedCoach.className})`;

  return {
    status: 'AVAILABLE',
    formation,
    selectedCoach,
    stoppingZone,
    nearestLandmark,
    distanceMeters: minDistance,
    walkDirection,
    primaryRecommendationText: primaryText,
    nearestStepFreeLandmark: nearestStepFree,
    landmarks: alignment.landmarks,
    provenance: alignment.provenance
  };
}
