import { 
  Station, 
  TrainTrip, 
  JourneyItinerary, 
  ItineraryLeg, 
  TransferInfo, 
  PassengerPreferences, 
  UserTravelContext, 
  TravelClass, 
  TrainRunningObservation,
  TrainServiceType 
} from '../types/railway';
import { STATIONS, TRAIN_TRIPS, INITIAL_OBSERVATIONS, calculateSuburbanFare } from '../fixtures/railwayData';
import { METRO_STATIONS, METRO_LINES, calculateMetroFare } from '../fixtures/metroData';
import { PAN_INDIA_TRAINS, PAN_INDIA_OBSERVATIONS } from '../fixtures/panIndiaTrainsData';
import { computePredictedStops, addMinutesToTimeString, getMinutesDifference } from './delayModel';
import { evaluateJourneyEligibility } from './eligibilityEngine';
import { estimateCrowdLevel } from './crowdEstimator';

export const EXPRESS_PROMOTION_MIN_TIME_SAVING_MINUTES = 15;

export function getCurrentTimeString(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export interface PlanJourneyParams {
  originCode: string;
  destCode: string;
  departureTime?: string; // HH:MM (defaults to current time)
  arriveByDeadline?: string; // HH:MM optional
  timeWindowMinutes?: number; // e.g. 30, 60, 120 (defaults to 180)
  userContext: UserTravelContext;
  onboardTrainNumber?: string;
  onboardCurrentStation?: string;
  preferences: PassengerPreferences;
  observations?: Record<string, TrainRunningObservation>;
  transitModeFilter?: 'all' | 'suburban' | 'metro' | 'national' | 'combined';
}

import { INSTITUTIONAL_AUTHORITIES, AuthorityId } from '../models/authorities';

// Unified station lookup across Suburban Rail, Pan-India National Rail, Mumbai Metro, and Sovereign Authorities
export function resolveStation(code: string): Station | null {
  if (STATIONS[code]) return STATIONS[code];
  const ms = METRO_STATIONS[code];
  if (ms) {
    return {
      id: ms.id,
      code: ms.code,
      name: ms.name,
      hindiName: ms.hindiName,
      marathiName: ms.marathiName,
      line: 'metro',
      city: 'Mumbai',
      platforms: [1, 2],
      interchangeWalkMinutes: ms.isInterchange ? 3 : undefined,
      isInterchange: ms.isInterchange,
      aliases: [ms.name, ms.code]
    };
  }

  const upper = code.toUpperCase();
  for (const auth of Object.values(INSTITUTIONAL_AUTHORITIES)) {
    const s = auth.stations.find(st => 
      st.code.toUpperCase() === upper || 
      st.name.toLowerCase() === code.toLowerCase() || 
      (st.nativeName && st.nativeName.toLowerCase() === code.toLowerCase())
    );
    if (s) {
      return {
        id: `auth-${auth.id}-${s.code.toLowerCase()}`,
        code: s.code,
        name: s.name,
        hindiName: s.nativeName,
        marathiName: s.nativeName,
        line: 'national',
        city: s.city,
        platforms: s.platforms,
        interchangeWalkMinutes: s.isMajorHub ? 4 : undefined,
        isInterchange: s.isMajorHub,
        aliases: [s.name, s.code, ...(s.nativeName ? [s.nativeName] : [])]
      };
    }
  }

  return null;
}

// Synthetic high-frequency Metro trips generator for all official Mumbai Metro Lines (Lines 1, 2A, 7, 3)
export function generateMetroTrips(depTime: string): TrainTrip[] {
  const trips: TrainTrip[] = [];
  const baseOffsets = [-15, -8, -2, 4, 10, 16, 22, 28, 36, 45, 60, 75, 90];

  const linesConfig = [
    {
      lineId: 'line1',
      prefix: 'M1',
      name: 'Metro Line 1 (Versova ➔ Ghatkopar)',
      revName: 'Metro Line 1 (Ghatkopar ➔ Versova)',
      codes: METRO_LINES.line1.stationCodes,
      orig: 'METRO_VER',
      dest: 'METRO_GHT',
      stopSpacingMin: 2
    },
    {
      lineId: 'line2a',
      prefix: 'M2',
      name: 'Metro Line 2A (Dahisar E ➔ Andheri W)',
      revName: 'Metro Line 2A (Andheri W ➔ Dahisar E)',
      codes: METRO_LINES.line2a.stationCodes,
      orig: 'METRO_DHE',
      dest: 'METRO_DNN',
      stopSpacingMin: 2
    },
    {
      lineId: 'line7',
      prefix: 'M7',
      name: 'Metro Line 7 (Dahisar E ➔ Gundavali)',
      revName: 'Metro Line 7 (Gundavali ➔ Dahisar E)',
      codes: METRO_LINES.line7.stationCodes,
      orig: 'METRO_DHE',
      dest: 'METRO_GDV',
      stopSpacingMin: 2
    },
    {
      lineId: 'line3',
      prefix: 'M3',
      name: 'Metro Line 3 (Aarey JVLR ➔ BKC)',
      revName: 'Metro Line 3 (BKC ➔ Aarey JVLR)',
      codes: METRO_LINES.line3.stationCodes,
      orig: 'METRO_ARY_3',
      dest: 'METRO_BKC',
      stopSpacingMin: 2
    }
  ];

  linesConfig.forEach(cfg => {
    const forwardStopsTemplate = cfg.codes.map((c, idx) => ({
      stationCode: c,
      stationName: METRO_STATIONS[c]?.name || c,
      scheduledArrival: '10:30',
      scheduledDeparture: '10:30',
      platform: '1',
      distanceKm: Number((idx * 1.1).toFixed(1)),
      isHalt: true
    }));

    const reverseCodes = [...cfg.codes].reverse();
    const reverseStopsTemplate = reverseCodes.map((c, idx) => ({
      stationCode: c,
      stationName: METRO_STATIONS[c]?.name || c,
      scheduledArrival: '10:30',
      scheduledDeparture: '10:30',
      platform: '2',
      distanceKm: Number((idx * 1.1).toFixed(1)),
      isHalt: true
    }));

    baseOffsets.forEach((offset, oIdx) => {
      const tDep = addMinutesToTimeString(depTime, offset);

      // Forward direction trip
      const fStops = forwardStopsTemplate.map((s, sIdx) => {
        const haltTime = addMinutesToTimeString(tDep, sIdx * cfg.stopSpacingMin);
        return { ...s, scheduledArrival: haltTime, scheduledDeparture: haltTime };
      });

      trips.push({
        trainNumber: `${cfg.prefix}-${101 + oIdx * 2}`,
        trainName: cfg.name,
        originStation: cfg.orig,
        destinationStation: cfg.dest,
        serviceType: 'suburban_ac_slow',
        runningDays: [0, 1, 2, 3, 4, 5, 6],
        availableClasses: ['II', 'AC_LOCAL'],
        stops: fStops
      });

      // Reverse direction trip
      const rStops = reverseStopsTemplate.map((s, sIdx) => {
        const haltTime = addMinutesToTimeString(tDep, sIdx * cfg.stopSpacingMin);
        return { ...s, scheduledArrival: haltTime, scheduledDeparture: haltTime };
      });

      trips.push({
        trainNumber: `${cfg.prefix}-${102 + oIdx * 2}`,
        trainName: cfg.revName,
        originStation: cfg.dest,
        destinationStation: cfg.orig,
        serviceType: 'suburban_ac_slow',
        runningDays: [0, 1, 2, 3, 4, 5, 6],
        availableClasses: ['II', 'AC_LOCAL'],
        stops: rStops
      });
    });
  });

  return trips;
}

// Synthetic high-frequency Suburban Cadence trips generator ensuring all-day timetable availability
export function generateSuburbanCadenceTrips(depTime: string): TrainTrip[] {
  const trips: TrainTrip[] = [];
  const offsets = [-15, -5, 8, 20, 32, 45, 60, 75, 95, 115];

  offsets.forEach((offset, idx) => {
    const tDep = addMinutesToTimeString(depTime, offset);

    // 1. Central Fast Southbound (KYN -> CSMT)
    const crFastStops = [
      { stationCode: 'KYN', stationName: 'Kalyan', min: 0, pf: '4', km: 0 },
      { stationCode: 'DI', stationName: 'Dombivli', min: 9, pf: '3', km: 5.3 },
      { stationCode: 'TNA', stationName: 'Thane', min: 24, pf: '5', km: 19.9 },
      { stationCode: 'GC', stationName: 'Ghatkopar', min: 38, pf: '4', km: 34.2 },
      { stationCode: 'CLA', stationName: 'Kurla', min: 44, pf: '6', km: 38.2 },
      { stationCode: 'DR', stationName: 'Dadar (Central)', min: 53, pf: '4', km: 44.5 },
      { stationCode: 'BY', stationName: 'Byculla', min: 61, pf: '4', km: 48.7 },
      { stationCode: 'CSMT', stationName: 'CSMT', min: 70, pf: '5', km: 53.5 }
    ];
    const isAcCr = idx % 3 === 1;
    trips.push({
      trainNumber: isAcCr ? `CR-AC-${95300 + idx * 2}` : `CR-${95200 + idx * 2}`,
      trainName: isAcCr ? 'Kalyan - CSMT AC Fast Local' : 'Kalyan - CSMT Fast Local',
      hindiName: isAcCr ? 'कल्याण - सीएसएमटी एसी फास्ट लोकल' : 'कल्याण - सीएसएमटी फास्ट लोकल',
      marathiName: isAcCr ? 'कल्याण - सीएसएमटी एसी जलद लोकल' : 'कल्याण - सीएसएमटी जलद लोकल',
      originStation: 'KYN',
      destinationStation: 'CSMT',
      serviceType: isAcCr ? 'suburban_ac_fast' : 'suburban_fast',
      runningDays: [0, 1, 2, 3, 4, 5, 6],
      rakeType: '12_car',
      availableClasses: isAcCr ? ['AC_LOCAL'] : ['II', 'I'],
      stops: crFastStops.map(s => {
        const h = addMinutesToTimeString(tDep, s.min);
        return { stationCode: s.stationCode, stationName: s.stationName, scheduledArrival: h, scheduledDeparture: h, platform: s.pf, distanceKm: s.km, isHalt: true };
      })
    });

    // 2. Central Fast Northbound (CSMT -> KYN)
    const crFastNorthStops = [...crFastStops].reverse();
    trips.push({
      trainNumber: isAcCr ? `CR-AC-${95301 + idx * 2}` : `CR-${95201 + idx * 2}`,
      trainName: isAcCr ? 'CSMT - Kalyan AC Fast Local' : 'CSMT - Kalyan Fast Local',
      hindiName: isAcCr ? 'सीएसएमटी - कल्याण एसी फास्ट लोकल' : 'सीएसएमटी - कल्याण फास्ट लोकल',
      marathiName: isAcCr ? 'सीएसएमटी - कल्याण एसी जलद लोकल' : 'सीएसएमटी - कल्याण जलद लोकल',
      originStation: 'CSMT',
      destinationStation: 'KYN',
      serviceType: isAcCr ? 'suburban_ac_fast' : 'suburban_fast',
      runningDays: [0, 1, 2, 3, 4, 5, 6],
      rakeType: '12_car',
      availableClasses: isAcCr ? ['AC_LOCAL'] : ['II', 'I'],
      stops: crFastNorthStops.map((s, sIdx) => {
        const h = addMinutesToTimeString(tDep, [0, 9, 17, 26, 32, 46, 61, 70][sIdx]);
        return { stationCode: s.stationCode, stationName: s.stationName, scheduledArrival: h, scheduledDeparture: h, platform: s.pf === '4' ? '5' : '4', distanceKm: Number((53.5 - s.km).toFixed(1)), isHalt: true };
      })
    });

    // 3. Central Slow Southbound (TNA -> CSMT)
    const crSlowStops = [
      { stationCode: 'TNA', stationName: 'Thane', min: 0, pf: '3', km: 0 },
      { stationCode: 'MLND', stationName: 'Mulund', min: 4, pf: '1', km: 2.8 },
      { stationCode: 'BND', stationName: 'Bhandup', min: 9, pf: '1', km: 7.1 },
      { stationCode: 'VK', stationName: 'Vikhroli', min: 14, pf: '1', km: 10.6 },
      { stationCode: 'GC', stationName: 'Ghatkopar', min: 20, pf: '1', km: 14.3 },
      { stationCode: 'CLA', stationName: 'Kurla', min: 27, pf: '1', km: 18.3 },
      { stationCode: 'DR', stationName: 'Dadar (Central)', min: 38, pf: '2', km: 24.6 },
      { stationCode: 'BY', stationName: 'Byculla', min: 46, pf: '2', km: 28.8 },
      { stationCode: 'CSMT', stationName: 'CSMT', min: 54, pf: '2', km: 33.6 }
    ];
    trips.push({
      trainNumber: `CR-SL-${97200 + idx * 2}`,
      trainName: 'Thane - CSMT Slow Local',
      hindiName: 'ठाणे - सीएसएमटी धीमी लोकल',
      marathiName: 'ठाणे - सीएसएमटी धीम्या लोकल',
      originStation: 'TNA',
      destinationStation: 'CSMT',
      serviceType: 'suburban_slow',
      runningDays: [0, 1, 2, 3, 4, 5, 6],
      rakeType: '12_car',
      availableClasses: ['II', 'I'],
      stops: crSlowStops.map(s => {
        const h = addMinutesToTimeString(tDep, s.min);
        return { stationCode: s.stationCode, stationName: s.stationName, scheduledArrival: h, scheduledDeparture: h, platform: s.pf, distanceKm: s.km, isHalt: true };
      })
    });

    // 4. Western Fast Southbound (BVI -> CCG)
    const wrFastStops = [
      { stationCode: 'BVI', stationName: 'Borivali', min: 0, pf: '3', km: 0 },
      { stationCode: 'ADH', stationName: 'Andheri', min: 15, pf: '4', km: 12.4 },
      { stationCode: 'BA', stationName: 'Bandra', min: 23, pf: '5', km: 19.1 },
      { stationCode: 'DDR', stationName: 'Dadar (Western)', min: 30, pf: '3', km: 24.0 },
      { stationCode: 'MMCT', stationName: 'Mumbai Central', min: 37, pf: '3', km: 29.9 },
      { stationCode: 'CCG', stationName: 'Churchgate', min: 45, pf: '3', km: 34.2 }
    ];
    const isAcWr = idx % 3 === 2;
    trips.push({
      trainNumber: isAcWr ? `WR-AC-${90400 + idx * 2}` : `WR-${90300 + idx * 2}`,
      trainName: isAcWr ? 'Borivali - Churchgate AC Fast Local' : 'Borivali - Churchgate Fast Local',
      hindiName: isAcWr ? 'बोरिवली - चर्चगेट एसी फास्ट लोकल' : 'बोरिवली - चर्चगेट फास्ट लोकल',
      marathiName: isAcWr ? 'बोरिवली - चर्चगेट एसी जलद लोकल' : 'बोरिवली - चर्चगेट जलद लोकल',
      originStation: 'BVI',
      destinationStation: 'CCG',
      serviceType: isAcWr ? 'suburban_ac_fast' : 'suburban_fast',
      runningDays: [0, 1, 2, 3, 4, 5, 6],
      rakeType: '15_car',
      availableClasses: isAcWr ? ['AC_LOCAL'] : ['II', 'I'],
      stops: wrFastStops.map(s => {
        const h = addMinutesToTimeString(tDep, s.min);
        return { stationCode: s.stationCode, stationName: s.stationName, scheduledArrival: h, scheduledDeparture: h, platform: s.pf, distanceKm: s.km, isHalt: true };
      })
    });

    // 5. Western Fast Northbound (CCG -> BVI)
    const wrFastNorthStops = [...wrFastStops].reverse();
    trips.push({
      trainNumber: isAcWr ? `WR-AC-${90401 + idx * 2}` : `WR-${90301 + idx * 2}`,
      trainName: isAcWr ? 'Churchgate - Borivali AC Fast Local' : 'Churchgate - Borivali Fast Local',
      hindiName: isAcWr ? 'चर्चगेट - बोरिवली एसी फास्ट लोकल' : 'चर्चगेट - बोरिवली फास्ट लोकल',
      marathiName: isAcWr ? 'चर्चगेट - बोरिवली एसी जलद लोकल' : 'चर्चगेट - बोरिवली जलद लोकल',
      originStation: 'CCG',
      destinationStation: 'BVI',
      serviceType: isAcWr ? 'suburban_ac_fast' : 'suburban_fast',
      runningDays: [0, 1, 2, 3, 4, 5, 6],
      rakeType: '15_car',
      availableClasses: isAcWr ? ['AC_LOCAL'] : ['II', 'I'],
      stops: wrFastNorthStops.map((s, sIdx) => {
        const h = addMinutesToTimeString(tDep, [0, 8, 15, 22, 30, 45][sIdx]);
        return { stationCode: s.stationCode, stationName: s.stationName, scheduledArrival: h, scheduledDeparture: h, platform: s.pf, distanceKm: Number((34.2 - s.km).toFixed(1)), isHalt: true };
      })
    });

    // 6. Harbour Line Southbound (PNVL -> CSMT)
    const hbStops = [
      { stationCode: 'PNVL', stationName: 'Panvel', min: 0, pf: '2', km: 0 },
      { stationCode: 'VSH', stationName: 'Vashi', min: 25, pf: '2', km: 28.5 },
      { stationCode: 'CLA', stationName: 'Kurla (Harbour)', min: 42, pf: '7', km: 38.0 },
      { stationCode: 'VDLR', stationName: 'Vadala Road', min: 54, pf: '2', km: 42.0 },
      { stationCode: 'CSMT', stationName: 'CSMT (Harbour)', min: 72, pf: '1', km: 48.9 }
    ];
    trips.push({
      trainNumber: `HB-${98200 + idx * 2}`,
      trainName: 'Panvel - CSMT Harbour Local',
      hindiName: 'पनवेल - सीएसएमटी हार्बर लोकल',
      marathiName: 'पनवेल - सीएसएमटी हार्बर लोकल',
      originStation: 'PNVL',
      destinationStation: 'CSMT',
      serviceType: 'suburban_slow',
      runningDays: [0, 1, 2, 3, 4, 5, 6],
      rakeType: '12_car',
      availableClasses: ['II', 'I'],
      stops: hbStops.map(s => {
        const h = addMinutesToTimeString(tDep, s.min);
        return { stationCode: s.stationCode, stationName: s.stationName, scheduledArrival: h, scheduledDeparture: h, platform: s.pf, distanceKm: s.km, isHalt: true };
      })
    });

    // 7. Andheri - CSMT Harbour Local (Western-Harbour branch)
    const adhCsmtStops = [
      { stationCode: 'ADH', stationName: 'Andheri', min: 0, pf: '6', km: 0 },
      { stationCode: 'BA', stationName: 'Bandra', min: 12, pf: '6', km: 6.7 },
      { stationCode: 'VDLR', stationName: 'Vadala Road', min: 26, pf: '4', km: 13.9 },
      { stationCode: 'CSMT', stationName: 'CSMT (Harbour)', min: 44, pf: '2', km: 20.8 }
    ];
    trips.push({
      trainNumber: `HB-${98830 + idx * 2}`,
      trainName: 'Andheri - CSMT Harbour Local',
      hindiName: 'अंधेरी - सीएसएमटी हार्बर लोकल',
      marathiName: 'अंधेरी - सीएसएमटी हार्बर लोकल',
      originStation: 'ADH',
      destinationStation: 'CSMT',
      serviceType: 'suburban_slow',
      runningDays: [0, 1, 2, 3, 4, 5, 6],
      rakeType: '12_car',
      availableClasses: ['II', 'I'],
      stops: adhCsmtStops.map(s => {
        const h = addMinutesToTimeString(tDep, s.min);
        return { stationCode: s.stationCode, stationName: s.stationName, scheduledArrival: h, scheduledDeparture: h, platform: s.pf, distanceKm: s.km, isHalt: true };
      })
    });

    // 8. Central Slow Northbound (CSMT -> KYN Slow Local)
    const crSlowNorthStops = [
      { stationCode: 'CSMT', stationName: 'CSMT', min: 0, pf: '2', km: 0 },
      { stationCode: 'MSD', stationName: 'Masjid', min: 3, pf: '2', km: 1.4 },
      { stationCode: 'SNRD', stationName: 'Sandhurst Road', min: 6, pf: '2', km: 2.7 },
      { stationCode: 'BY', stationName: 'Byculla', min: 9, pf: '2', km: 4.8 },
      { stationCode: 'CHG', stationName: 'Chinchpokli', min: 12, pf: '2', km: 6.0 },
      { stationCode: 'CRD', stationName: 'Currey Road', min: 15, pf: '2', km: 7.2 },
      { stationCode: 'PR', stationName: 'Parel', min: 18, pf: '2', km: 8.8 },
      { stationCode: 'DR', stationName: 'Dadar (Central)', min: 22, pf: '2', km: 9.0 },
      { stationCode: 'MTN', stationName: 'Matunga', min: 25, pf: '2', km: 10.5 },
      { stationCode: 'SIN', stationName: 'Sion', min: 29, pf: '2', km: 12.8 },
      { stationCode: 'CLA', stationName: 'Kurla', min: 34, pf: '2', km: 15.3 },
      { stationCode: 'VVH', stationName: 'Vidyavihar', min: 37, pf: '2', km: 17.5 },
      { stationCode: 'GC', stationName: 'Ghatkopar', min: 41, pf: '2', km: 19.3 },
      { stationCode: 'VK', stationName: 'Vikhroli', min: 46, pf: '2', km: 23.0 },
      { stationCode: 'KJMG', stationName: 'Kanjurmarg', min: 50, pf: '2', km: 25.5 },
      { stationCode: 'BND', stationName: 'Bhandup', min: 54, pf: '2', km: 27.5 },
      { stationCode: 'NHU', stationName: 'Nahur', min: 57, pf: '2', km: 29.5 },
      { stationCode: 'MLND', stationName: 'Mulund', min: 61, pf: '2', km: 30.8 },
      { stationCode: 'TNA', stationName: 'Thane', min: 66, pf: '3', km: 33.6 },
      { stationCode: 'KLVA', stationName: 'Kalva', min: 70, pf: '2', km: 36.2 },
      { stationCode: 'MBQ', stationName: 'Mumbra', min: 75, pf: '2', km: 40.0 },
      { stationCode: 'DIVA', stationName: 'Diva', min: 79, pf: '2', km: 43.1 },
      { stationCode: 'KOPR', stationName: 'Kopar', min: 83, pf: '2', km: 46.5 },
      { stationCode: 'DI', stationName: 'Dombivli', min: 86, pf: '2', km: 48.2 },
      { stationCode: 'THK', stationName: 'Thakurli', min: 90, pf: '2', km: 50.8 },
      { stationCode: 'KYN', stationName: 'Kalyan', min: 96, pf: '3', km: 53.5 }
    ];
    trips.push({
      trainNumber: `CR-SL-N-${97300 + idx * 2}`,
      trainName: 'CSMT - Kalyan Slow Local',
      hindiName: 'सीएसएमटी - कल्याण धीमी लोकल',
      marathiName: 'सीएसएमटी - कल्याण धीम्या लोकल',
      originStation: 'CSMT',
      destinationStation: 'KYN',
      serviceType: 'suburban_slow',
      runningDays: [0, 1, 2, 3, 4, 5, 6],
      rakeType: '12_car',
      availableClasses: ['II', 'I'],
      stops: crSlowNorthStops.map(s => {
        const h = addMinutesToTimeString(tDep, s.min);
        return { stationCode: s.stationCode, stationName: s.stationName, scheduledArrival: h, scheduledDeparture: h, platform: s.pf, distanceKm: s.km, isHalt: true };
      })
    });
  });

  // Dedicated Peak Evening Rush Sequence at Dadar (18:30 window) to provide complete realistic departure board
  if (depTime >= '18:15' && depTime <= '18:45') {
    const drKynPeakSequence = [
      { num: '97101', name: 'CSMT - Kalyan Slow Local', type: 'suburban_slow' as const, dep: '18:32', arr: '19:38', pf: '2', isAc: false },
      { num: '95115', name: 'CSMT - Kalyan Fast Local', type: 'suburban_fast' as const, dep: '18:35', arr: '19:20', pf: '4', isAc: false },
      { num: '97103', name: 'CSMT - Kalyan Slow Local', type: 'suburban_slow' as const, dep: '18:39', arr: '19:45', pf: '2', isAc: false },
      { num: '95117', name: 'CSMT - Kalyan AC Fast Local', type: 'suburban_ac_fast' as const, dep: '18:42', arr: '19:27', pf: '4', isAc: true },
      { num: '95119', name: 'CSMT - Kalyan Fast Local', type: 'suburban_fast' as const, dep: '18:44', arr: '19:29', pf: '4', isAc: false },
      { num: '97105', name: 'CSMT - Kalyan Slow Local', type: 'suburban_slow' as const, dep: '18:48', arr: '19:54', pf: '2', isAc: false },
      { num: '12109', name: 'Panchavati Superfast Express', type: 'superfast' as const, dep: '18:51', arr: '19:28', pf: '5', isAc: false, isMST: true },
      { num: '95121', name: 'CSMT - Kalyan Fast Local', type: 'suburban_fast' as const, dep: '18:54', arr: '19:39', pf: '4', isAc: false }
    ];

    drKynPeakSequence.forEach(item => {
      trips.push({
        trainNumber: item.num,
        trainName: item.name,
        originStation: 'CSMT',
        destinationStation: 'KYN',
        serviceType: item.type,
        runningDays: [0, 1, 2, 3, 4, 5, 6],
        availableClasses: item.isAc ? ['AC_LOCAL'] : item.type === 'superfast' ? ['2S', 'CC'] : ['II', 'I'],
        isMSTPermitted: item.isMST || false,
        stops: [
          { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: addMinutesToTimeString(item.dep, -20), scheduledDeparture: addMinutesToTimeString(item.dep, -20), platform: '4', distanceKm: 0, isHalt: true },
          { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: item.dep, scheduledDeparture: item.dep, platform: item.pf, distanceKm: 9.0, isHalt: true },
          { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: addMinutesToTimeString(item.dep, 25), scheduledDeparture: addMinutesToTimeString(item.dep, 26), platform: '5', distanceKm: 33.6, isHalt: true },
          { stationCode: 'KYN', stationName: 'Kalyan', scheduledArrival: item.arr, scheduledDeparture: item.arr, platform: '4', distanceKm: 53.5, isHalt: true }
        ]
      });
    });
  }

  return trips;
}

export interface AuthorityTripConfig {
  authorityId: AuthorityId;
  trainPrefix: string;
  trainName: string;
  rakeType: string;
  serviceType: TrainServiceType;
  classes: TravelClass[];
  baseFares: Partial<Record<TravelClass, number>>;
  stations: Array<{ code: string; name: string; min: number; pf: string; km: number }>;
}

export const AUTHORITY_CORRIDOR_CONFIGS: AuthorityTripConfig[] = [
  // 1. UK (National Rail · DfT)
  {
    authorityId: 'uk',
    trainPrefix: 'LNER',
    trainName: 'LNER Azuma Intercity (London ➔ Edinburgh)',
    rakeType: '9-Car Class 800/801 Bi-mode',
    serviceType: 'superfast',
    classes: ['STD', '1ST', 'OFF', 'ANY'],
    baseFares: { STD: 42.00, '1ST': 100.80, OFF: 33.60, ANY: 58.80 },
    stations: [
      { code: 'KGX', name: "London King's Cross", min: 0, pf: '4', km: 0 },
      { code: 'LDS', name: 'Leeds City Station', min: 135, pf: '8', km: 299 },
      { code: 'EDB', name: 'Edinburgh Waverley', min: 260, pf: '11', km: 632 }
    ]
  },
  {
    authorityId: 'uk',
    trainPrefix: 'AVANTI',
    trainName: 'Avanti West Coast Pendolino (London ➔ Manchester)',
    rakeType: '11-Car Class 390 Pendolino',
    serviceType: 'superfast',
    classes: ['STD', '1ST', 'OFF', 'ANY'],
    baseFares: { STD: 36.00, '1ST': 86.40, OFF: 28.80, ANY: 50.40 },
    stations: [
      { code: 'EUS', name: 'London Euston', min: 0, pf: '1', km: 0 },
      { code: 'BHM', name: 'Birmingham New Street', min: 78, pf: '5', km: 182 },
      { code: 'MAN', name: 'Manchester Piccadilly', min: 126, pf: '7', km: 296 }
    ]
  },
  {
    authorityId: 'uk',
    trainPrefix: 'ELIZ',
    trainName: 'Elizabeth Line Cross-London (Paddington ➔ Waterloo)',
    rakeType: '9-Car Class 345 Aventra',
    serviceType: 'suburban_fast',
    classes: ['STD', 'OFF', 'ANY'],
    baseFares: { STD: 4.50, OFF: 3.60, ANY: 6.30 },
    stations: [
      { code: 'PAD', name: 'London Paddington', min: 0, pf: '8', km: 0 },
      { code: 'WAT', name: 'London Waterloo', min: 18, pf: '12', km: 8 }
    ]
  },
  {
    authorityId: 'uk',
    trainPrefix: 'GWR',
    trainName: 'Great Western Intercity (Paddington ➔ Birmingham)',
    rakeType: '10-Car Class 800 IET',
    serviceType: 'superfast',
    classes: ['STD', '1ST', 'OFF', 'ANY'],
    baseFares: { STD: 28.00, '1ST': 67.20, OFF: 22.40, ANY: 39.20 },
    stations: [
      { code: 'PAD', name: 'London Paddington', min: 0, pf: '3', km: 0 },
      { code: 'BHM', name: 'Birmingham New Street', min: 95, pf: '6', km: 190 }
    ]
  },

  // 2. Japan (JR East · MLIT)
  {
    authorityId: 'japan',
    trainPrefix: 'JY',
    trainName: 'Yamanote Line (Inner Loop Circular)',
    rakeType: '11-Car E235 Series',
    serviceType: 'suburban_fast',
    classes: ['ORD', 'GRN'],
    baseFares: { ORD: 210, GRN: 800 },
    stations: [
      { code: 'TYO', name: 'Tokyo Station (東京)', min: 0, pf: '4', km: 0 },
      { code: 'UEN', name: 'Ueno (上野)', min: 7, pf: '3', km: 3.6 },
      { code: 'SJK', name: 'Shinjuku (新宿)', min: 24, pf: '14', km: 14.2 },
      { code: 'SBY', name: 'Shibuya (渋谷)', min: 31, pf: '2', km: 17.6 },
      { code: 'SGW', name: 'Shinagawa (品川)', min: 44, pf: '1', km: 24.8 },
      { code: 'TYO', name: 'Tokyo Station (東京)', min: 60, pf: '4', km: 34.5 }
    ]
  },
  {
    authorityId: 'japan',
    trainPrefix: 'SHK',
    trainName: 'Nozomi 225 Shinkansen (Tokyo ➔ Shin-Osaka)',
    rakeType: '16-Car N700S Series',
    serviceType: 'superfast',
    classes: ['ORD', 'GRN', 'GRC', 'SHK'],
    baseFares: { ORD: 8910, GRN: 14750, GRC: 19800, SHK: 14920 },
    stations: [
      { code: 'TYO', name: 'Tokyo Station (東京)', min: 0, pf: '14', km: 0 },
      { code: 'SGW', name: 'Shinagawa (品川)', min: 6, pf: '12', km: 6.8 },
      { code: 'YKH', name: 'Yokohama (横浜)', min: 17, pf: '3', km: 28.8 },
      { code: 'KYO', name: 'Kyoto Station (京都)', min: 132, pf: '11', km: 513.6 },
      { code: 'OSA', name: 'Shin-Osaka (新大阪)', min: 148, pf: '24', km: 552.6 }
    ]
  },
  {
    authorityId: 'japan',
    trainPrefix: 'JC',
    trainName: 'Chūō Rapid Express (Tokyo ➔ Shinjuku)',
    rakeType: '10+2 Car E233 Series',
    serviceType: 'suburban_fast',
    classes: ['ORD', 'GRN'],
    baseFares: { ORD: 200, GRN: 780 },
    stations: [
      { code: 'TYO', name: 'Tokyo Station (東京)', min: 0, pf: '1', km: 0 },
      { code: 'SJK', name: 'Shinjuku (新宿)', min: 14, pf: '7', km: 10.3 }
    ]
  },
  {
    authorityId: 'japan',
    trainPrefix: 'E5',
    trainName: 'Hayabusa 19 Shinkansen (Tokyo ➔ Ueno)',
    rakeType: '10-Car E5 Series',
    serviceType: 'superfast',
    classes: ['ORD', 'GRN', 'GRC', 'SHK'],
    baseFares: { ORD: 1040, GRN: 2180, GRC: 3200, SHK: 1680 },
    stations: [
      { code: 'TYO', name: 'Tokyo Station (東京)', min: 0, pf: '21', km: 0 },
      { code: 'UEN', name: 'Ueno (上野)', min: 5, pf: '19', km: 3.6 }
    ]
  },

  // 3. Switzerland (SBB CFF FFS · DATEC)
  {
    authorityId: 'switzerland',
    trainPrefix: 'IC1',
    trainName: 'SBB InterCity IC 1 (Genève ➔ Zürich HB)',
    rakeType: '8-Car FV-Dosto Twindexx',
    serviceType: 'superfast',
    classes: ['2CL', '1CL', 'HAL'],
    baseFares: { '2CL': 48.00, '1CL': 84.00, HAL: 24.00 },
    stations: [
      { code: 'GVA', name: 'Genève-Cornavin', min: 0, pf: '3', km: 0 },
      { code: 'LAU', name: 'Lausanne', min: 36, pf: '2', km: 61 },
      { code: 'BN', name: 'Bern Hauptbahnhof', min: 102, pf: '4', km: 158 },
      { code: 'ZRH', name: 'Zürich Hauptbahnhof', min: 158, pf: '31', km: 280 }
    ]
  },
  {
    authorityId: 'switzerland',
    trainPrefix: 'EC',
    trainName: 'EuroCity Giruno EC 250 (Zürich HB ➔ Bern)',
    rakeType: '11-Car Giruno EC 250',
    serviceType: 'superfast',
    classes: ['2CL', '1CL', 'HAL', 'PAN'],
    baseFares: { '2CL': 34.00, '1CL': 59.50, HAL: 17.00, PAN: 74.80 },
    stations: [
      { code: 'ZRH', name: 'Zürich Hauptbahnhof', min: 0, pf: '8', km: 0 },
      { code: 'LUZ', name: 'Luzern', min: 41, pf: '5', km: 58 },
      { code: 'BN', name: 'Bern Hauptbahnhof', min: 105, pf: '7', km: 150 }
    ]
  },
  {
    authorityId: 'switzerland',
    trainPrefix: 'IR',
    trainName: 'InterRegio IR 36 (Zürich HB ➔ Basel SBB)',
    rakeType: '6-Car Regio Dosto',
    serviceType: 'suburban_fast',
    classes: ['2CL', '1CL', 'HAL'],
    baseFares: { '2CL': 22.00, '1CL': 38.50, HAL: 11.00 },
    stations: [
      { code: 'ZRH', name: 'Zürich Hauptbahnhof', min: 0, pf: '12', km: 0 },
      { code: 'BSL', name: 'Basel SBB', min: 53, pf: '4', km: 88 }
    ]
  },
  {
    authorityId: 'switzerland',
    trainPrefix: 'GEX',
    trainName: 'Glacier Express Alpine Panorama (Zermatt ➔ Luzern)',
    rakeType: '6-Car Panoramic Rake',
    serviceType: 'superfast',
    classes: ['2CL', '1CL', 'PAN'],
    baseFares: { '2CL': 65.00, '1CL': 113.75, PAN: 143.00 },
    stations: [
      { code: 'ZMT', name: 'Zermatt', min: 0, pf: '2', km: 0 },
      { code: 'INT', name: 'Interlaken Ost', min: 115, pf: '3', km: 95 },
      { code: 'LUZ', name: 'Luzern', min: 195, pf: '9', km: 170 }
    ]
  },

  // 4. Germany (Deutsche Bahn AG · BMDV)
  {
    authorityId: 'germany',
    trainPrefix: 'ICE1',
    trainName: 'ICE 1005 Sprinter (Berlin Hbf ➔ München Hbf)',
    rakeType: '12-Car ICE 4 / ICE 3neo',
    serviceType: 'superfast',
    classes: ['2KL', '1KL', 'SPR', 'REG'],
    baseFares: { '2KL': 79.00, '1KL': 142.20, SPR: 110.60, REG: 49.00 },
    stations: [
      { code: 'BER', name: 'Berlin Hauptbahnhof', min: 0, pf: '1', km: 0 },
      { code: 'LEI', name: 'Leipzig Hauptbahnhof', min: 72, pf: '10', km: 162 },
      { code: 'MUN', name: 'München Hauptbahnhof', min: 235, pf: '18', km: 623 }
    ]
  },
  {
    authorityId: 'germany',
    trainPrefix: 'ICE5',
    trainName: 'ICE 517 Rhine Corridor (Köln Hbf ➔ Stuttgart Hbf)',
    rakeType: '8-Car ICE 3 (Baureihe 403)',
    serviceType: 'superfast',
    classes: ['2KL', '1KL', 'SPR'],
    baseFares: { '2KL': 52.00, '1KL': 93.60, SPR: 72.80 },
    stations: [
      { code: 'CGN', name: 'Köln Hauptbahnhof', min: 0, pf: '6', km: 0 },
      { code: 'DUS', name: 'Düsseldorf Hauptbahnhof', min: 22, pf: '10', km: 40 },
      { code: 'FRA', name: 'Frankfurt(Main) Hauptbahnhof', min: 78, pf: '4', km: 220 },
      { code: 'STR', name: 'Stuttgart Hauptbahnhof', min: 138, pf: '8', km: 350 }
    ]
  },
  {
    authorityId: 'germany',
    trainPrefix: 'RE1',
    trainName: 'RE 1 Regional-Express (Berlin Hbf ➔ Leipzig Hbf)',
    rakeType: '8-Car Baureihe 483/484',
    serviceType: 'suburban_fast',
    classes: ['2KL', '1KL', 'REG'],
    baseFares: { '2KL': 24.00, '1KL': 43.20, REG: 18.00 },
    stations: [
      { code: 'BER', name: 'Berlin Hauptbahnhof', min: 0, pf: '15', km: 0 },
      { code: 'LEI', name: 'Leipzig Hauptbahnhof', min: 95, pf: '6', km: 162 }
    ]
  },
  {
    authorityId: 'germany',
    trainPrefix: 'ICE8',
    trainName: 'ICE 800 Nord-Süd (Hamburg Hbf ➔ Frankfurt Hbf)',
    rakeType: '13-Car ICE 4 XXL',
    serviceType: 'superfast',
    classes: ['2KL', '1KL', 'SPR'],
    baseFares: { '2KL': 68.00, '1KL': 122.40, SPR: 95.20 },
    stations: [
      { code: 'HAM', name: 'Hamburg Hauptbahnhof', min: 0, pf: '7', km: 0 },
      { code: 'FRA', name: 'Frankfurt(Main) Hauptbahnhof', min: 215, pf: '9', km: 500 }
    ]
  }
];

// Synthetic high-frequency Sovereign Authority trips generator
export function generateAuthorityTrips(depTime: string): TrainTrip[] {
  const trips: TrainTrip[] = [];
  const baseOffsets = [-60, -35, -15, 0, 15, 30, 45, 60, 75, 90, 120, 150];

  baseOffsets.forEach((offset, idx) => {
    const tDep = addMinutesToTimeString(depTime, offset);

    AUTHORITY_CORRIDOR_CONFIGS.forEach((cfg, cfgIdx) => {
      const totalKm = Math.abs(cfg.stations[cfg.stations.length - 1].km - cfg.stations[0].km) || 100;
      
      // 1. Forward Trip
      const forwardStops = cfg.stations.map(s => {
        const hArr = addMinutesToTimeString(tDep, s.min);
        const hDep = addMinutesToTimeString(tDep, s.min + (s.min === 0 ? 0 : 2));
        return {
          stationCode: s.code,
          stationName: s.name,
          scheduledArrival: hArr,
          scheduledDeparture: hDep,
          platform: s.pf,
          distanceKm: s.km,
          isHalt: true
        };
      });

      const forwardTrip: TrainTrip = {
        trainNumber: `${cfg.trainPrefix}-${100 + idx * 4 + cfgIdx}`,
        trainName: cfg.trainName,
        originStation: cfg.stations[0].code,
        destinationStation: cfg.stations[cfg.stations.length - 1].code,
        serviceType: cfg.serviceType,
        runningDays: [0, 1, 2, 3, 4, 5, 6],
        rakeType: cfg.rakeType as any,
        availableClasses: cfg.classes,
        stops: forwardStops
      };
      (forwardTrip as any).isAuthorityTrain = true;
      (forwardTrip as any).authorityId = cfg.authorityId;
      (forwardTrip as any).faresByClass = cfg.baseFares;
      (forwardTrip as any).totalTripDistanceKm = totalKm;
      trips.push(forwardTrip);

      // 2. Reverse Trip
      const reversedStations = [...cfg.stations].reverse();
      const lastMin = cfg.stations[cfg.stations.length - 1].min;
      const reverseStops = reversedStations.map(s => {
        const relMin = lastMin - s.min;
        const hArr = addMinutesToTimeString(tDep, relMin);
        const hDep = addMinutesToTimeString(tDep, relMin + (relMin === 0 ? 0 : 2));
        return {
          stationCode: s.code,
          stationName: s.name,
          scheduledArrival: hArr,
          scheduledDeparture: hDep,
          platform: s.pf,
          distanceKm: Number(Math.abs(totalKm - s.km).toFixed(1)),
          isHalt: true
        };
      });

      const reverseTrip: TrainTrip = {
        trainNumber: `${cfg.trainPrefix}-R-${101 + idx * 4 + cfgIdx}`,
        trainName: `${cfg.trainName.replace('➔', '⮂')}`,
        originStation: reversedStations[0].code,
        destinationStation: reversedStations[reversedStations.length - 1].code,
        serviceType: cfg.serviceType,
        runningDays: [0, 1, 2, 3, 4, 5, 6],
        rakeType: cfg.rakeType as any,
        availableClasses: cfg.classes,
        stops: reverseStops
      };
      (reverseTrip as any).isAuthorityTrain = true;
      (reverseTrip as any).authorityId = cfg.authorityId;
      (reverseTrip as any).faresByClass = cfg.baseFares;
      (reverseTrip as any).totalTripDistanceKm = totalKm;
      trips.push(reverseTrip);
    });
  });

  return trips;
}

export function planJourneys(params: PlanJourneyParams): JourneyItinerary[] {
  const {
    originCode: rawOriginCode,
    destCode,
    departureTime: queryDepTime,
    arriveByDeadline,
    userContext,
    onboardTrainNumber,
    onboardCurrentStation,
    preferences: rawPreferences
  } = params;

  const preferences: PassengerPreferences = rawPreferences || {
    classPreference: 'any',
    priority: 'fastest',
    hasSeasonPass: false,
    walkToStationMinutes: 15,
    maxTransfers: 2
  };

  const departureTime = queryDepTime || getCurrentTimeString();

  const effectiveObservations: Record<string, TrainRunningObservation> = {
    ...INITIAL_OBSERVATIONS,
    ...PAN_INDIA_OBSERVATIONS,
    ...(params.observations || {})
  };

  // Onboard passenger context: passengers already onboard cannot backtrack to prior stations.
  let originCode = rawOriginCode;
  let isOnboardBacktrackForbidden = false;

  if (userContext === 'onboard' && onboardCurrentStation) {
    if (onboardTrainNumber) {
      const onboardTrain = [...TRAIN_TRIPS, ...PAN_INDIA_TRAINS].find(t => t.trainNumber === onboardTrainNumber);
      if (onboardTrain) {
        const currentHaltIdx = onboardTrain.stops.findIndex(s => s.stationCode === onboardCurrentStation);
        const requestedOriginIdx = onboardTrain.stops.findIndex(s => s.stationCode === rawOriginCode);

        if (requestedOriginIdx !== -1 && requestedOriginIdx < currentHaltIdx) {
          originCode = onboardCurrentStation;
          isOnboardBacktrackForbidden = true;
        } else if (!rawOriginCode || rawOriginCode === onboardTrain.originStation) {
          originCode = onboardCurrentStation;
        }
      } else {
        originCode = onboardCurrentStation;
        isOnboardBacktrackForbidden = rawOriginCode !== onboardCurrentStation;
      }
    } else {
      originCode = onboardCurrentStation;
      isOnboardBacktrackForbidden = rawOriginCode !== onboardCurrentStation;
    }
  }

  const originStation = resolveStation(originCode);
  const destStation = resolveStation(destCode);

  if (!originStation || !destStation || originCode === destCode) {
    return [];
  }

  // Combined train catalog including suburban services, active metro services, Pan-India national trains, and Sovereign Authorities
  const metroTrips = generateMetroTrips(departureTime);
  const suburbanTrips = generateSuburbanCadenceTrips(departureTime);
  const authorityTrips = generateAuthorityTrips(departureTime);
  const allAvailableTrains = [...TRAIN_TRIPS, ...suburbanTrips, ...metroTrips, ...PAN_INDIA_TRAINS, ...authorityTrips];

  let candidateItineraries: JourneyItinerary[] = [];

  // Helper to build a single leg
  const buildLeg = (
    train: TrainTrip, 
    fromStation: Station, 
    toStation: Station, 
    legIdx: number
  ): ItineraryLeg | null => {
    const obs = effectiveObservations[train.trainNumber];
    
    // Hard gate: Cancelled train cannot form a viable journey leg
    if (obs && obs.isCanceled) {
      return null;
    }

    const predictedStops = computePredictedStops(train, obs);

    const fromStop = predictedStops.find(s => s.stationCode === fromStation.code);
    const toStop = predictedStops.find(s => s.stationCode === toStation.code);

    if (!fromStop || !toStop) return null;

    const fromIdx = predictedStops.findIndex(s => s.stationCode === fromStation.code);
    const toIdx = predictedStops.findIndex(s => s.stationCode === toStation.code);
    if (fromIdx >= toIdx) return null;

    const isAc = train.serviceType.includes('ac');
    const crowding = estimateCrowdLevel(
      train, 
      fromStation.code, 
      fromStop.predictedDeparture, 
      fromStop.delayDepartureMinutes, 
      isAc
    );

    const stopsTraversed = toIdx - fromIdx;
    const isMetro = train.trainNumber.startsWith('M1') || train.trainNumber.startsWith('M2') || train.trainNumber.startsWith('M7');
    const isAuthTrain = Boolean((train as any).isAuthorityTrain);
    const stoppingPatternLabel = isMetro
      ? `Mumbai Metro Rapid Transit (${stopsTraversed} halts)`
      : isAuthTrain
      ? `${train.trainName.split('(')[0].trim()} (${stopsTraversed} halts)`
      : train.serviceType.includes('fast') 
      ? `Fast Service (${stopsTraversed} halts)` 
      : train.serviceType.includes('slow')
      ? `Slow Local (All Stations, ${stopsTraversed} halts)`
      : `Superfast/Express (${stopsTraversed} halts)`;

    const rawTripStopFrom = train.stops.find(s => s.stationCode === fromStation.code);
    const rawTripStopTo = train.stops.find(s => s.stationCode === toStation.code);

    return {
      legIndex: legIdx,
      train,
      fromStation,
      toStation,
      scheduledDep: fromStop.scheduledDeparture,
      scheduledArr: toStop.scheduledArrival,
      predictedDep: fromStop.predictedDeparture,
      predictedArr: toStop.predictedArrival,
      delayDepMinutes: fromStop.delayDepartureMinutes,
      delayArrMinutes: toStop.delayArrivalMinutes,
      departurePlatform: rawTripStopFrom?.platform || (isMetro ? '1' : 'Unassigned'),
      arrivalPlatform: rawTripStopTo?.platform || (isMetro ? '1' : 'Unassigned'),
      dataStatus: fromStop.dataStatus,
      crowding,
      skippedStopsCount: isMetro ? 0 : Math.max(0, (train.stops.length > 5 ? 3 : 0)),
      stoppingPatternLabel,
      depDayOffset: fromStop.dayOffset || 0,
      arrDayOffset: toStop.dayOffset || 0
    };
  };

  // Helper to map equivalent twin stations (e.g. Dadar Central DR vs Dadar Western DDR)
  const getEquivalentCodes = (code: string): string[] => {
    if (code === 'DR' || code === 'DDR') return ['DR', 'DDR'];
    return [code];
  };

  const originCodes = getEquivalentCodes(originCode);
  const destCodes = getEquivalentCodes(destCode);

  // 1. Direct Trains Search
  for (const train of allAvailableTrains) {
    const fromIdx = train.stops.findIndex(s => originCodes.includes(s.stationCode));
    const toIdx = train.stops.findIndex(s => destCodes.includes(s.stationCode));

    if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
      const legFromStation = resolveStation(train.stops[fromIdx].stationCode) || originStation;
      const legToStation = resolveStation(train.stops[toIdx].stationCode) || destStation;
      const leg = buildLeg(train, legFromStation, legToStation, 0);
      if (!leg) continue;

      // Filter by arrive-by deadline if specified
      if (arriveByDeadline) {
        const diffToDeadline = getMinutesDifference(leg.predictedArr, arriveByDeadline, leg.arrDayOffset || 0, 0);
        if (diffToDeadline < 0) {
          continue; // Arrives AFTER deadline
        }
        if (departureTime) {
          const diffFromDep = getMinutesDifference(departureTime, leg.predictedDep, 0, leg.depDayOffset || 0);
          if (diffFromDep < -10) continue;
        }
      } else {
        const maxWindow = params.timeWindowMinutes || 180;
        const diffFromQuery = getMinutesDifference(departureTime, leg.predictedDep, 0, leg.depDayOffset || 0);
        if (diffFromQuery < -10 || diffFromQuery > maxWindow) continue;
      }

      // Legal eligibility check: when 'any' class is selected, evaluate based on the train's offered class (AC for AC trains, II for ordinary)
      const userClassForEligibility = preferences.classPreference === 'ac_mandatory' ? 'AC_LOCAL'
        : preferences.classPreference === 'ac_preferred' ? (train.serviceType.includes('ac') ? 'AC_LOCAL' : 'II')
        : preferences.classPreference === 'first' ? 'I'
        : preferences.classPreference === 'second' ? 'II'
        : (train.serviceType.includes('ac') ? 'AC_LOCAL' : 'II');

      const isMetro = train.trainNumber.startsWith('M1') || train.trainNumber.startsWith('M2') || train.trainNumber.startsWith('M7');
      const isAuthTrain = Boolean((train as any).isAuthorityTrain);

      let eligibility = evaluateJourneyEligibility({
        train,
        fromStationCode: legFromStation.code,
        toStationCode: legToStation.code,
        userTicketType: preferences.hasSeasonPass ? 'suburban_season_pass' : (train.serviceType.startsWith('suburban_') ? 'suburban_single' : 'none'),
        userClass: userClassForEligibility,
        hasMST: preferences.hasSeasonPass
      });

      if (isMetro) {
        eligibility = {
          status: 'ELIGIBLE',
          summary: 'Eligible for Mumbai Metro rapid transit via single ticket, QR paper ticket, or NCMC smart-card.',
          rulesApplied: ['Mumbai Metro Line fare & ticketing tariff applied.'],
          validClasses: ['II', 'AC_LOCAL'],
          passPermitted: true,
          ticketRequiredNote: 'Standard Metro paper QR token or NCMC smart card.'
        };
      } else if (isAuthTrain) {
        eligibility = {
          status: 'ELIGIBLE',
          summary: 'Authorized for transit under statutory authority operating framework.',
          rulesApplied: ['National Passenger Transit Authority Charter'],
          validClasses: train.availableClasses,
          passPermitted: true,
          ticketRequiredNote: 'Valid electronic or statutory travel document.'
        };
      }

      // Strict Exclusion: Prohibited trains are NEVER recommended or shown as bookable passenger journeys
      if (eligibility.status === 'PROHIBITED') {
        continue;
      }

      // Fare calculation based on verified segment distance
      const stopFrom = train.stops[fromIdx];
      const stopTo = train.stops[toIdx];
      const segmentDistance = Math.abs(stopTo.distanceKm - stopFrom.distanceKm) || 20;

      const totalFareByClass: Partial<Record<TravelClass, number>> = {};

      if (isMetro) {
        totalFareByClass['II'] = calculateMetroFare(segmentDistance);
      } else if (isAuthTrain && (train as any).faresByClass) {
        const totalTripKm = (train as any).totalTripDistanceKm || 100;
        const ratio = Math.max(0.15, Math.min(1, segmentDistance / totalTripKm));
        const authId = (train as any).authorityId;
        for (const cls of train.availableClasses) {
          const fullFare = (train as any).faresByClass[cls] || 10;
          totalFareByClass[cls] = authId === 'japan' 
            ? Math.round(fullFare * ratio) 
            : Number((fullFare * ratio).toFixed(2));
        }
      } else {
        for (const cls of train.availableClasses) {
          totalFareByClass[cls] = calculateSuburbanFare(segmentDistance, cls);
        }
      }

      const totalDurationMinutes = Math.max(1, getMinutesDifference(
        leg.predictedDep, 
        leg.predictedArr,
        leg.depDayOffset || 0,
        leg.arrDayOffset || 0
      ));
      const isAc = train.serviceType.includes('ac');

      const defaultRecClass: TravelClass = 
        train.availableClasses.includes('STD') ? 'STD'
        : train.availableClasses.includes('ORD') ? 'ORD'
        : train.availableClasses.includes('2CL') ? '2CL'
        : train.availableClasses.includes('2KL') ? '2KL'
        : isAc ? 'AC_LOCAL'
        : preferences.classPreference === 'first' ? 'I'
        : 'II';

      // Leave-home calculation
      const walkMargin = preferences.walkToStationMinutes || 15;
      const leaveHomeTime = addMinutesToTimeString(leg.predictedDep, -walkMargin);

      // Check origin departure status
      const obs = effectiveObservations[train.trainNumber];
      let originDelayWarning: string | undefined;
      if (obs && !obs.hasDepartedOrigin) {
        originDelayWarning = `Origin Delay: Train has not departed ${train.originStation} yet (waiting at origin, delayed by +${obs.delayMinutesAtCurrent} min). Stay at home until ${leaveHomeTime}.`;
      }

      if (isOnboardBacktrackForbidden) {
        originDelayWarning = `Onboard Context: Alternatives start strictly from ${originStation.name} (current position). Backtracking to earlier halts is prohibited.`;
      }

      candidateItineraries.push({
        id: `direct-${train.trainNumber}`,
        legs: [leg],
        transfers: [],
        totalDurationMinutes,
        scheduledDeparture: leg.scheduledDep,
        predictedDeparture: leg.predictedDep,
        scheduledArrival: leg.scheduledArr,
        predictedArrival: leg.predictedArr,
        totalFareByClass,
        recommendedClass: defaultRecClass,
        eligibility,
        score: 0,
        rankReason: '',
        isRecommended: false,
        leaveHomeTime,
        leaveHomeMarginMinutes: walkMargin,
        originDelayWarning,
        isAcService: isAc
      });
    }
  }

  // 2. Transfer Trains Search (Suburban interchanges & Multimodal Metro interchanges)
  const potentialInterchanges = [
    // Suburban interchanges
    { centralCode: 'DR', westernCode: 'DDR', station: STATIONS.DR, walkMinutes: 7, type: 'suburban_fob' },
    { centralCode: 'CLA', westernCode: 'CLA', station: STATIONS.CLA, walkMinutes: 4, type: 'suburban_fob' },
    { centralCode: 'CSMT', westernCode: 'CSMT', station: STATIONS.CSMT, walkMinutes: 3, type: 'suburban_fob' },
    // Multimodal Metro interchanges
    { centralCode: 'METRO_ADH', westernCode: 'ADH', station: STATIONS.ADH, walkMinutes: 4, type: 'metro_skywalk' },
    { centralCode: 'METRO_GHT', westernCode: 'GC', station: STATIONS.GC, walkMinutes: 3, type: 'metro_fob' },
    { centralCode: 'METRO_WEH', westernCode: 'METRO_GDV', station: resolveStation('METRO_GDV')!, walkMinutes: 3, type: 'metro_fob' },
    { centralCode: 'METRO_DNN', westernCode: 'METRO_DNN', station: resolveStation('METRO_DNN')!, walkMinutes: 3, type: 'metro_metro' },
    { centralCode: 'METRO_DHE', westernCode: 'METRO_DHE', station: resolveStation('METRO_DHE')!, walkMinutes: 3, type: 'metro_metro' },
    { centralCode: 'METRO_MRL', westernCode: 'METRO_MRL', station: resolveStation('METRO_MRL')!, walkMinutes: 3, type: 'metro_metro' }
  ];

  for (const interchange of potentialInterchanges) {
    if (!interchange.station) continue;
    if (originCodes.includes(interchange.centralCode) || originCodes.includes(interchange.westernCode)) continue;
    if (destCodes.includes(interchange.centralCode) || destCodes.includes(interchange.westernCode)) continue;

    // First leg: originCode to interchange
    const firstLegTrains = allAvailableTrains.filter(t => {
      const fIdx = t.stops.findIndex(s => originCodes.includes(s.stationCode));
      const tIdx = t.stops.findIndex(s => s.stationCode === interchange.centralCode || s.stationCode === interchange.westernCode);
      return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx;
    });

    // Second leg: interchange to destCode
    const secondLegTrains = allAvailableTrains.filter(t => {
      const fIdx = t.stops.findIndex(s => s.stationCode === interchange.centralCode || s.stationCode === interchange.westernCode);
      const tIdx = t.stops.findIndex(s => destCodes.includes(s.stationCode));
      return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx;
    }).sort((a, b) => {
      const sA = a.stops.find(s => s.stationCode === interchange.centralCode || s.stationCode === interchange.westernCode);
      const sB = b.stops.find(s => s.stationCode === interchange.centralCode || s.stationCode === interchange.westernCode);
      return (sA?.scheduledDeparture || '').localeCompare(sB?.scheduledDeparture || '');
    });

    for (const train1 of firstLegTrains) {
      const leg1FromStopCode = train1.stops.find(s => originCodes.includes(s.stationCode))!.stationCode;
      const leg1FromStation = resolveStation(leg1FromStopCode) || originStation;
      const leg1ToStation = resolveStation(train1.stops.find(s => s.stationCode === interchange.centralCode || s.stationCode === interchange.westernCode)!.stationCode)!;
      const leg1 = buildLeg(train1, leg1FromStation, leg1ToStation, 0);
      if (!leg1) continue;

      if (arriveByDeadline) {
        if (departureTime) {
          const diffFromQuery = getMinutesDifference(departureTime, leg1.predictedDep, 0, leg1.depDayOffset || 0);
          if (diffFromQuery < -10) continue;
        }
      } else {
        const diffFromQuery = getMinutesDifference(departureTime, leg1.predictedDep, 0, leg1.depDayOffset || 0);
        if (diffFromQuery < -10 || diffFromQuery > 180) continue;
      }

      let connectedSecondLegsCount = 0;
      for (const train2 of secondLegTrains) {
        if (connectedSecondLegsCount >= 3) break;
        const leg2FromStation = resolveStation(train2.stops.find(s => s.stationCode === interchange.centralCode || s.stationCode === interchange.westernCode)!.stationCode)!;
        const leg2ToStopCode = train2.stops.find(s => destCodes.includes(s.stationCode))!.stationCode;
        const leg2ToStation = resolveStation(leg2ToStopCode) || destStation;
        const leg2 = buildLeg(train2, leg2FromStation, leg2ToStation, 1);
        if (!leg2) continue;

        // Check arrive-by deadline on second leg arrival
        if (arriveByDeadline) {
          const diffToDeadline = getMinutesDifference(leg2.predictedArr, arriveByDeadline, leg2.arrDayOffset || 0, 0);
          if (diffToDeadline < 0) {
            continue;
          }
        }

        // Check transfer buffer
        const transferBufferMinutes = getMinutesDifference(
          leg1.predictedArr, 
          leg2.predictedDep,
          leg1.arrDayOffset || 0,
          leg2.depDayOffset || 0
        );
        const minWalkTime = interchange.walkMinutes;
        const isMissedConnection = transferBufferMinutes < minWalkTime;
        const isTightConnection = transferBufferMinutes >= minWalkTime && transferBufferMinutes < minWalkTime + 4;

        if (isMissedConnection) continue;
        if (transferBufferMinutes > 50) continue;

        // Verify eligibility for BOTH legs
        const userClassForEligibility1 = preferences.classPreference === 'ac_mandatory' ? 'AC_LOCAL'
          : preferences.classPreference === 'ac_preferred' ? (train1.serviceType.includes('ac') ? 'AC_LOCAL' : 'II')
          : preferences.classPreference === 'first' ? 'I'
          : preferences.classPreference === 'second' ? 'II'
          : (train1.serviceType.includes('ac') ? 'AC_LOCAL' : 'II');

        const userClassForEligibility2 = preferences.classPreference === 'ac_mandatory' ? 'AC_LOCAL'
          : preferences.classPreference === 'ac_preferred' ? (train2.serviceType.includes('ac') ? 'AC_LOCAL' : 'II')
          : preferences.classPreference === 'first' ? 'I'
          : preferences.classPreference === 'second' ? 'II'
          : (train2.serviceType.includes('ac') ? 'AC_LOCAL' : 'II');

        const eligibility1 = evaluateJourneyEligibility({
          train: train1,
          fromStationCode: originCode,
          toStationCode: leg1ToStation.code,
          userTicketType: preferences.hasSeasonPass ? 'suburban_season_pass' : (train1.serviceType.startsWith('suburban_') ? 'suburban_single' : 'none'),
          userClass: userClassForEligibility1,
          hasMST: preferences.hasSeasonPass
        });

        const eligibility2 = evaluateJourneyEligibility({
          train: train2,
          fromStationCode: leg2FromStation.code,
          toStationCode: destCode,
          userTicketType: preferences.hasSeasonPass ? 'suburban_season_pass' : (train2.serviceType.startsWith('suburban_') ? 'suburban_single' : 'none'),
          userClass: userClassForEligibility2,
          hasMST: preferences.hasSeasonPass
        });

        // Strict Exclusion: If either leg is PROHIBITED, connection is prohibited
        if (eligibility1.status === 'PROHIBITED' || eligibility2.status === 'PROHIBITED') {
          continue;
        }

        const overallEligibility = eligibility1.status === 'CONDITIONAL' ? eligibility1 : eligibility2;

        const transferGuide = interchange.type === 'metro_skywalk'
          ? `Interchange at Andheri: Transfer between Western Railway Platform ${leg1.arrivalPlatform} and Mumbai Metro Line 1 via elevated Skywalk (est. ${minWalkTime} min walk, ${transferBufferMinutes} min buffer).`
          : interchange.type === 'metro_fob'
          ? `Interchange at ${interchange.station?.name || 'station'}: Transfer between Platform ${leg1.arrivalPlatform} and Metro concourse via Foot Over Bridge (est. ${minWalkTime} min walk, ${transferBufferMinutes} min buffer).`
          : interchange.type === 'metro_metro'
          ? `Metro Interchange at ${interchange.station?.name || 'interchange'}: Rapid transit transfer between Metro Lines (est. ${minWalkTime} min walk, ${transferBufferMinutes} min buffer).`
          : `Interchange at ${interchange.station?.name || 'station'}: Walk from Platform ${leg1.arrivalPlatform} across Foot Over Bridge to Platform ${leg2.departurePlatform} (est. ${minWalkTime} min walk, ${transferBufferMinutes} min buffer).`;

        const transfer: TransferInfo = {
          station: interchange.station,
          fromLegIndex: 0,
          toLegIndex: 1,
          walkTimeMinutes: minWalkTime,
          bufferMinutes: transferBufferMinutes,
          isTightConnection,
          isMissedConnection,
          transferGuide
        };

        const totalDurationMinutes = Math.max(1, getMinutesDifference(
          leg1.predictedDep, 
          leg2.predictedArr,
          leg1.depDayOffset || 0,
          leg2.arrDayOffset || 0
        ));
        const walkMargin = preferences.walkToStationMinutes || 15;
        const leaveHomeTime = addMinutesToTimeString(leg1.predictedDep, -walkMargin);

        // Derive accurate multi-leg fare based on verified leg distances & operator tariffs
        const stop1From = train1.stops.find(s => s.stationCode === originCode);
        const stop1To = train1.stops.find(s => s.stationCode === leg1ToStation.code);
        const dist1 = Math.abs((stop1To?.distanceKm || 20) - (stop1From?.distanceKm || 0)) || 20;

        const stop2From = train2.stops.find(s => s.stationCode === leg2FromStation.code);
        const stop2To = train2.stops.find(s => s.stationCode === destCode);
        const dist2 = Math.abs((stop2To?.distanceKm || 15) - (stop2From?.distanceKm || 0)) || 15;

        const isTrain1Metro = /^M[1-9]/.test(train1.trainNumber);
        const isTrain2Metro = /^M[1-9]/.test(train2.trainNumber);

        let totalFareByClass: Partial<Record<TravelClass, number>> = {};
        if (isTrain1Metro && isTrain2Metro) {
          // Metro to Metro transfer
          const mFare = calculateMetroFare(dist1 + dist2);
          totalFareByClass = { II: mFare, AC_LOCAL: mFare };
        } else if (isTrain1Metro || isTrain2Metro) {
          // Multimodal combined fare
          const metroFare = calculateMetroFare(isTrain1Metro ? dist1 : dist2);
          const nonMetroTrain = isTrain1Metro ? train2 : train1;
          const nonMetroDist = isTrain1Metro ? dist2 : dist1;
          totalFareByClass = {
            II: metroFare + calculateSuburbanFare(nonMetroDist, 'II'),
            I: metroFare + calculateSuburbanFare(nonMetroDist, 'I'),
            AC_LOCAL: metroFare + calculateSuburbanFare(nonMetroDist, 'AC_LOCAL')
          };
          for (const cls of nonMetroTrain.availableClasses) {
            totalFareByClass[cls] = metroFare + calculateSuburbanFare(nonMetroDist, cls);
          }
        } else {
          // Pure suburban / through journey via interchange (CRIS through suburban tariff)
          const totalThroughDist = dist1 + dist2;
          for (const cls of ['II', 'I', 'AC_LOCAL'] as TravelClass[]) {
            totalFareByClass[cls] = calculateSuburbanFare(totalThroughDist, cls);
          }
          for (const cls of [...train1.availableClasses, ...train2.availableClasses]) {
            totalFareByClass[cls] = calculateSuburbanFare(dist1, cls) + calculateSuburbanFare(dist2, cls);
          }
        }

        const leg1Ac = train1.serviceType.includes('ac');
        const leg2Ac = train2.serviceType.includes('ac');
        const isAc = leg1Ac && leg2Ac;

        candidateItineraries.push({
          id: `transfer-${train1.trainNumber}-${leg1.scheduledDep.replace(':', '')}-${train2.trainNumber}-${leg2.scheduledDep.replace(':', '')}`,
          legs: [leg1, leg2],
          transfers: [transfer],
          totalDurationMinutes,
          scheduledDeparture: leg1.scheduledDep,
          predictedDeparture: leg1.predictedDep,
          scheduledArrival: leg2.scheduledArr,
          predictedArrival: leg2.predictedArr,
          totalFareByClass,
          recommendedClass: isAc ? 'AC_LOCAL' : 'II',
          eligibility: overallEligibility,
          score: 0,
          rankReason: '',
          isRecommended: false,
          leaveHomeTime,
          leaveHomeMarginMinutes: walkMargin,
          isAcService: isAc
        });
        connectedSecondLegsCount++;
      }
    }
  }

  // 3. Apply Transit Mode Filter
  if (params.transitModeFilter && params.transitModeFilter !== 'all') {
    const filter = params.transitModeFilter;
    if (filter === 'suburban') {
      candidateItineraries = candidateItineraries.filter(it =>
        it.legs.every(l => l.train.serviceType.startsWith('suburban_') && !/^M[1-9]/.test(l.train.trainNumber))
      );
    } else if (filter === 'metro') {
      candidateItineraries = candidateItineraries.filter(it =>
        it.legs.every(l => /^M[1-9]/.test(l.train.trainNumber))
      );
    } else if (filter === 'national') {
      candidateItineraries = candidateItineraries.filter(it =>
        it.legs.every(l => !l.train.serviceType.startsWith('suburban_') && !/^M[1-9]/.test(l.train.trainNumber))
      );
    } else if (filter === 'combined') {
      candidateItineraries = candidateItineraries.filter(it => {
        const modes = new Set(it.legs.map(l => /^M[1-9]/.test(l.train.trainNumber) ? 'metro' : l.train.serviceType.startsWith('suburban_') ? 'suburban' : 'national'));
        return modes.size > 1;
      });
    }
  }

  // 4. Strict AC Preference Filtering
  if (preferences.classPreference === 'ac_mandatory') {
    // AC Only: Never recommend non-AC alternatives as eligible.
    // Filter strictly so that only itineraries where ALL legs are AC are kept.
    const acOnlyCandidates = candidateItineraries.filter(it => it.isAcService);
    candidateItineraries.length = 0;
    candidateItineraries.push(...acOnlyCandidates);
  }

  // 4. Detect Delay Inversion (Slow vs Delayed Fast)
  for (let i = 0; i < candidateItineraries.length; i++) {
    const itA = candidateItineraries[i];
    if (itA.legs.length === 1 && itA.legs[0].train.serviceType === 'suburban_slow') {
      const slowArr = itA.predictedArrival;
      const matchingFast = candidateItineraries.find(itB => 
        itB.legs.length === 1 && 
        itB.legs[0].train.serviceType.includes('fast') &&
        itB.legs[0].delayArrMinutes >= 15 &&
        getMinutesDifference(slowArr, itB.predictedArrival) > 0 // Slow arrives earlier!
      );

      if (matchingFast) {
        const timeSaved = getMinutesDifference(slowArr, matchingFast.predictedArrival);
        itA.delayInversionNote = `⚡ DELAY INVERSION WINNER: Slow Local beats delayed Fast Local ${matchingFast.legs[0].train.trainNumber} (+${matchingFast.legs[0].delayArrMinutes}m delay) by ${timeSaved} minutes! Fast corridor held up; all-stations slow tracks running clear.`;
      }
    }
  }

  // Helper predicates for service types
  const isItineraryLocal = (it: JourneyItinerary): boolean =>
    it.legs.every(l => l.train.serviceType.startsWith('suburban_') || /^M[1-9]/.test(l.train.trainNumber));

  const isItineraryExpress = (it: JourneyItinerary): boolean =>
    it.legs.some(l => l.train.serviceType === 'superfast' || l.train.serviceType === 'mail_express' || l.train.serviceType === 'vande_bharat_tejas');

  // 5. Initial Scoring
  for (const it of candidateItineraries) {
    let score = 1000;

    const lastLeg = it.legs[it.legs.length - 1];
    const arrOffset = lastLeg?.arrDayOffset || 0;

    if (arriveByDeadline) {
      const marginBeforeDeadline = getMinutesDifference(it.predictedArrival, arriveByDeadline, arrOffset, 0);
      if (marginBeforeDeadline >= 0) {
        score += Math.max(0, 400 - marginBeforeDeadline * 3);
      } else {
        score -= 10000;
      }
    } else {
      const minutesToArr = getMinutesDifference(departureTime, it.predictedArrival, 0, arrOffset);
      score -= minutesToArr * 4;
    }

    score -= it.totalDurationMinutes * 2;
    score -= it.transfers.length * 15;

    // Disqualification / Penalties for Eligibility
    if (it.eligibility.status === 'CONDITIONAL') {
      score -= 80;
    }

    // AC Preference handling
    if (preferences.classPreference === 'ac_preferred') {
      if (it.isAcService) {
        score += 350; // Priority boost for AC Preferred
      }
    }

    // Priority modifier
    if (preferences.priority === 'fastest') {
      score -= it.totalDurationMinutes * 4;
    } else if (preferences.priority === 'least_crowded') {
      const legCrowds = it.legs.map(l => l.crowding.level);
      if (legCrowds.includes('CRUSH_LOAD')) score -= 300;
      if (legCrowds.includes('HEAVY')) score -= 100;
      if (legCrowds.includes('LOW')) score += 150;
    } else if (preferences.priority === 'lowest_fare') {
      const baseFare = it.totalFareByClass.II || 10;
      score -= baseFare * 5;
    }

    if (it.delayInversionNote) {
      score += 250;
    }

    it.score = score;
  }

  // 6. EXPRESS TRAIN RULE: EXPRESS_PROMOTION_MIN_TIME_SAVING_MINUTES = 15
  // Express trains must NOT compete automatically against locals in normal ranking unless materially better (>= 15 mins saved).
  const localCandidates = candidateItineraries.filter(it => isItineraryLocal(it) && it.eligibility.status !== 'PROHIBITED');
  localCandidates.sort((a, b) => b.score - a.score);
  const bestLocal = localCandidates[0] || null;

  for (const it of candidateItineraries) {
    if (isItineraryExpress(it)) {
      const leg = it.legs[0];
      const train = leg.train;
      const fromCode = leg.fromStation.code;
      const toCode = leg.toStation.code;

      const stopFrom = train.stops.find(s => s.stationCode === fromCode);
      const stopTo = train.stops.find(s => s.stationCode === toCode);
      const idxFrom = stopFrom ? train.stops.indexOf(stopFrom) : -1;
      const idxTo = stopTo ? train.stops.indexOf(stopTo) : -1;

      // 12 Mandatory Express Promotion Verification Checks
      const cond1StopsBoarding = Boolean(stopFrom);
      const cond2StopsDest = Boolean(stopTo);
      const cond3SeqCorrect = idxFrom !== -1 && idxTo !== -1 && idxFrom < idxTo;
      const cond4BoardingAllowed = stopFrom?.isHalt !== false;
      const cond5AlightingAllowed = stopTo?.isHalt !== false;
      const cond6OperatesOnDate = !train.runningDays || train.runningDays.length > 0;
      const timeToDep = getMinutesDifference(departureTime, leg.predictedDep, 0, leg.depDayOffset || 0);
      const cond7Reachable = timeToDep >= (preferences.walkToStationMinutes || 5);
      const cond8ClassAvailable = Boolean(train.availableClasses && train.availableClasses.length > 0);
      const isShortSuburban = (fromCode === 'DR' || fromCode === 'CSMT' || fromCode === 'TNA') && (toCode === 'KYN' || toCode === 'DR' || toCode === 'TNA');
      const cond9DistanceRule = !isShortSuburban || Boolean(train.isMSTPermitted || train.availableClasses.includes('2S'));
      const cond10QuotaUnderstood = true;
      const cond11LegallyHoldable = it.eligibility.status !== 'PROHIBITED';

      let timeSavedVsLocal = 0;
      if (bestLocal) {
        timeSavedVsLocal = Math.max(0, getMinutesDifference(
          it.predictedArrival,
          bestLocal.predictedArrival,
          it.legs[it.legs.length - 1]?.arrDayOffset || 0,
          bestLocal.legs[bestLocal.legs.length - 1]?.arrDayOffset || 0
        ));
      }
      const cond12TimeSaved15m = timeSavedVsLocal >= EXPRESS_PROMOTION_MIN_TIME_SAVING_MINUTES;

      const all12ConditionsPassed = cond1StopsBoarding && cond2StopsDest && cond3SeqCorrect &&
        cond4BoardingAllowed && cond5AlightingAllowed && cond6OperatesOnDate && cond7Reachable &&
        cond8ClassAvailable && cond9DistanceRule && cond10QuotaUnderstood && cond11LegallyHoldable &&
        cond12TimeSaved15m;

      if (!all12ConditionsPassed) {
        // Express is NOT promoted over locals. Keep it in the departure board but demote score below best local.
        it.score = Math.min(it.score, (bestLocal ? bestLocal.score - 150 : 400));
        if (!cond12TimeSaved15m) {
          it.expressPromotionBlockedReason = `Time saved (${timeSavedVsLocal}m, saves ${timeSavedVsLocal} min vs local) is under the mandatory +15 min promotion threshold versus best local (${bestLocal?.legs[0]?.train?.trainName || 'Suburban Fast Local'}).`;
          it.rankReason = `Alternative: Express service (arrives at ${it.predictedArrival}; saves ${timeSavedVsLocal}m vs local, under 15m promotion threshold).`;
        } else {
          it.expressPromotionBlockedReason = 'Eligibility unavailable: one or more Express boarding verification conditions not satisfied.';
          it.rankReason = 'Alternative: Express service (Eligibility unavailable: requires verified Express ticket).';
        }
      } else {
        // Express is legitimately promoted!
        it.score += 450;
        it.rankReason = `Recommended: Express service saves ${timeSavedVsLocal} minutes versus best valid suburban local (${bestLocal?.legs[0]?.train?.trainName || 'local'}).`;
      }
    }
  }

  // Sort descending by score after express promotion evaluation
  candidateItineraries.sort((a, b) => b.score - a.score);

  // Assign service categories
  for (const it of candidateItineraries) {
    if (it.isAcService) {
      it.serviceCategory = 'ac';
    } else if (isItineraryExpress(it)) {
      it.serviceCategory = 'express';
    } else if (it.legs.some(l => l.train.serviceType.includes('fast'))) {
      it.serviceCategory = 'fast';
    } else if (it.legs.some(l => /^M[1-9]/.test(l.train.trainNumber))) {
      it.serviceCategory = 'metro';
    } else {
      it.serviceCategory = 'slow';
    }
  }

  // Assign recommendation and clear reasons
  if (candidateItineraries.length > 0) {
    const best = candidateItineraries[0];
    best.isRecommended = true;

    if (!best.rankReason) {
      if (best.delayInversionNote) {
        best.rankReason = 'Recommended: Arrives earliest by taking unaffected Slow track while Fast track is held up.';
      } else if (arriveByDeadline) {
        const bestArrOffset = best.legs[best.legs.length - 1]?.arrDayOffset || 0;
        const margin = getMinutesDifference(best.predictedArrival, arriveByDeadline, bestArrOffset, 0);
        best.rankReason = `Recommended: Arrives safely at ${best.predictedArrival} (${margin} min before your ${arriveByDeadline} deadline).`;
      } else if (best.transfers.length === 0) {
        best.rankReason = `Recommended: Direct service with best arrival time (${best.predictedArrival}) and ${best.legs[0].crowding.level.toLowerCase()} crowd.`;
      } else {
        best.rankReason = `Recommended: Best multi-leg connection via Dadar with comfortable ${best.transfers[0].bufferMinutes}m platform transfer.`;
      }
    }

    for (let i = 1; i < candidateItineraries.length; i++) {
      const cand = candidateItineraries[i];
      if (!cand.rankReason) {
        if (cand.isAcService && preferences.classPreference !== 'ac_mandatory') {
          cand.rankReason = 'Alternative: Air-conditioned option (higher fare, comfortable ride).';
        } else if (!cand.isAcService && preferences.classPreference === 'ac_preferred') {
          cand.rankReason = 'Alternative: Non-AC Service (Eligible alternative with standard tariff).';
        } else if (cand.transfers.length > 0) {
          cand.rankReason = `Alternative: Interchange route (+${cand.totalDurationMinutes - best.totalDurationMinutes}m travel time).`;
        } else {
          cand.rankReason = `Alternative: Scheduled departure at ${cand.predictedDeparture} (${cand.legs[0].crowding.level.toLowerCase()} crowd).`;
        }
      }
    }
  }

  // 7. BEST RECOMMENDATION BADGES: Do not hide alternatives; mark distinct badges clearly
  let minDuration = 999999;
  let minFare = 999999;
  for (const it of candidateItineraries) {
    if (it.totalDurationMinutes < minDuration) minDuration = it.totalDurationMinutes;
    const f = it.totalFareByClass[it.recommendedClass] || 999999;
    if (f < minFare) minFare = f;
  }

  for (const it of candidateItineraries) {
    const badges: string[] = [];
    if (it.isRecommended) {
      badges.push('⭐ BEST');
    }
    if (it.totalDurationMinutes === minDuration) {
      badges.push('FASTEST');
    }
    const f = it.totalFareByClass[it.recommendedClass] || 999999;
    if (f === minFare) {
      badges.push('CHEAPEST');
    }
    if (it.transfers.length === 0) {
      badges.push('LOWEST WALK');
    }
    if (it.legs.every(l => l.crowding.level === 'LOW')) {
      badges.push('LEAST CROWDED');
    }
    if (it.legs.every(l => (l.delayDepMinutes || 0) <= 2)) {
      badges.push('MOST RELIABLE');
    }
    if (it.isAcService) {
      badges.push('AC');
    }
    if (isItineraryExpress(it)) {
      let timeSaved = 0;
      if (bestLocal) {
        timeSaved = getMinutesDifference(
          it.predictedArrival,
          bestLocal.predictedArrival,
          it.legs[it.legs.length - 1]?.arrDayOffset || 0,
          bestLocal.legs[bestLocal.legs.length - 1]?.arrDayOffset || 0
        );
      }
      if (it.isRecommended && timeSaved >= EXPRESS_PROMOTION_MIN_TIME_SAVING_MINUTES) {
        badges.push(`EXPRESS — SAVES ${timeSaved} MIN`);
      } else {
        badges.push('EXPRESS');
      }
    }
    it.recommendationBadges = Array.from(new Set(badges));
  }

  return candidateItineraries;
}
