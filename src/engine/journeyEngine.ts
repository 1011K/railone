import { 
  Station, 
  TrainTrip, 
  JourneyItinerary, 
  ItineraryLeg, 
  TransferInfo, 
  PassengerPreferences, 
  UserTravelContext, 
  TravelClass, 
  TrainRunningObservation 
} from '../types/railway';
import { STATIONS, TRAIN_TRIPS, INITIAL_OBSERVATIONS, calculateSuburbanFare } from '../fixtures/railwayData';
import { METRO_STATIONS, METRO_LINES, calculateMetroFare } from '../fixtures/metroData';
import { PAN_INDIA_TRAINS, PAN_INDIA_OBSERVATIONS } from '../fixtures/panIndiaTrainsData';
import { computePredictedStops, addMinutesToTimeString, getMinutesDifference } from './delayModel';
import { evaluateJourneyEligibility } from './eligibilityEngine';
import { estimateCrowdLevel } from './crowdEstimator';

export interface PlanJourneyParams {
  originCode: string;
  destCode: string;
  departureTime?: string; // HH:MM (defaults to 10:35)
  arriveByDeadline?: string; // HH:MM optional
  userContext: UserTravelContext;
  onboardTrainNumber?: string;
  onboardCurrentStation?: string;
  preferences: PassengerPreferences;
  observations?: Record<string, TrainRunningObservation>;
  transitModeFilter?: 'all' | 'suburban' | 'metro' | 'national' | 'combined';
}

// Unified station lookup across Suburban Rail, Pan-India National Rail, and Mumbai Metro
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
  });

  return trips;
}

export function planJourneys(params: PlanJourneyParams): JourneyItinerary[] {
  const {
    originCode: rawOriginCode,
    destCode,
    departureTime = '10:35',
    arriveByDeadline,
    userContext,
    onboardTrainNumber,
    onboardCurrentStation,
    preferences
  } = params;

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

  // Combined train catalog including suburban services, active metro services, and Pan-India national trains
  const metroTrips = generateMetroTrips(departureTime);
  const suburbanTrips = generateSuburbanCadenceTrips(departureTime);
  const allAvailableTrains = [...TRAIN_TRIPS, ...suburbanTrips, ...metroTrips, ...PAN_INDIA_TRAINS];

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
    const stoppingPatternLabel = isMetro
      ? `Mumbai Metro Rapid Transit (${stopsTraversed} halts)`
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
      departurePlatform: rawTripStopFrom?.platform || (isMetro ? '1' : '1'),
      arrivalPlatform: rawTripStopTo?.platform || (isMetro ? '1' : '1'),
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
        const diffFromQuery = getMinutesDifference(departureTime, leg.predictedDep, 0, leg.depDayOffset || 0);
        if (diffFromQuery < -10 || diffFromQuery > 180) continue;
      }

      // Legal eligibility check: when 'any' class is selected, evaluate based on the train's offered class (AC for AC trains, II for ordinary)
      const userClassForEligibility = preferences.classPreference === 'ac_mandatory' ? 'AC_LOCAL'
        : preferences.classPreference === 'ac_preferred' ? (train.serviceType.includes('ac') ? 'AC_LOCAL' : 'II')
        : preferences.classPreference === 'first' ? 'I'
        : preferences.classPreference === 'second' ? 'II'
        : (train.serviceType.includes('ac') ? 'AC_LOCAL' : 'II');

      const isMetro = train.trainNumber.startsWith('M1') || train.trainNumber.startsWith('M2') || train.trainNumber.startsWith('M7');

      let eligibility = evaluateJourneyEligibility({
        train,
        fromStationCode: legFromStation.code,
        toStationCode: legToStation.code,
        userTicketType: preferences.hasSeasonPass ? 'suburban_season_pass' : 'suburban_single',
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
        recommendedClass: isAc ? 'AC_LOCAL' : preferences.classPreference === 'first' ? 'I' : 'II',
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
          userTicketType: preferences.hasSeasonPass ? 'suburban_season_pass' : 'suburban_single',
          userClass: userClassForEligibility1,
          hasMST: preferences.hasSeasonPass
        });

        const eligibility2 = evaluateJourneyEligibility({
          train: train2,
          fromStationCode: leg2FromStation.code,
          toStationCode: destCode,
          userTicketType: preferences.hasSeasonPass ? 'suburban_season_pass' : 'suburban_single',
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

  // 5. Scoring and Ranking Engine
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

  // Sort descending by score
  candidateItineraries.sort((a, b) => b.score - a.score);

  // Assign recommendation and clear reasons
  if (candidateItineraries.length > 0) {
    const best = candidateItineraries[0];
    best.isRecommended = true;

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

    for (let i = 1; i < candidateItineraries.length; i++) {
      const cand = candidateItineraries[i];
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

  return candidateItineraries;
}
