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
}

// Unified station lookup across Suburban Rail and Mumbai Metro
function resolveStation(code: string): Station | null {
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

// Synthetic high-frequency Metro trips generator (every 5-8 minutes between 05:30 and 23:30)
function generateMetroTrips(depTime: string): TrainTrip[] {
  const trips: TrainTrip[] = [];
  const baseOffsets = [-10, -4, 2, 8, 14, 20, 26, 32, 45, 60];

  // Line 1: Versova to Ghatkopar (and reverse)
  const l1Codes = METRO_LINES.line1.stationCodes;
  const l1StopsForward = l1Codes.map((c, idx) => ({
    stationCode: c,
    stationName: METRO_STATIONS[c]?.name || c,
    scheduledArrival: '10:30',
    scheduledDeparture: '10:30',
    platform: '1',
    distanceKm: idx * 1.0,
    isHalt: true
  }));

  const l1StopsReverse = [...l1Codes].reverse().map((c, idx) => ({
    stationCode: c,
    stationName: METRO_STATIONS[c]?.name || c,
    scheduledArrival: '10:30',
    scheduledDeparture: '10:30',
    platform: '2',
    distanceKm: idx * 1.0,
    isHalt: true
  }));

  baseOffsets.forEach((offset, idx) => {
    const tDep = addMinutesToTimeString(depTime, offset);
    
    // Line 1 Versova -> Ghatkopar
    const forwardStops = l1StopsForward.map((s, sIdx) => {
      const haltTime = addMinutesToTimeString(tDep, sIdx * 2);
      return { ...s, scheduledArrival: haltTime, scheduledDeparture: haltTime };
    });

    trips.push({
      trainNumber: `M1-${101 + idx * 2}`,
      trainName: 'Metro Line 1 (Versova ➔ Ghatkopar)',
      originStation: 'METRO_VER',
      destinationStation: 'METRO_GHT',
      serviceType: 'suburban_ac_slow',
      runningDays: [0, 1, 2, 3, 4, 5, 6],
      availableClasses: ['II'],
      stops: forwardStops
    });

    // Line 1 Ghatkopar -> Versova
    const reverseStops = l1StopsReverse.map((s, sIdx) => {
      const haltTime = addMinutesToTimeString(tDep, sIdx * 2);
      return { ...s, scheduledArrival: haltTime, scheduledDeparture: haltTime };
    });

    trips.push({
      trainNumber: `M1-${102 + idx * 2}`,
      trainName: 'Metro Line 1 (Ghatkopar ➔ Versova)',
      originStation: 'METRO_GHT',
      destinationStation: 'METRO_VER',
      serviceType: 'suburban_ac_slow',
      runningDays: [0, 1, 2, 3, 4, 5, 6],
      availableClasses: ['II'],
      stops: reverseStops
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
    preferences,
    observations = INITIAL_OBSERVATIONS
  } = params;

  // Onboard passenger context: passengers already onboard cannot backtrack to prior stations.
  let originCode = rawOriginCode;
  let isOnboardBacktrackForbidden = false;

  if (userContext === 'onboard' && onboardCurrentStation) {
    if (onboardTrainNumber) {
      const onboardTrain = TRAIN_TRIPS.find(t => t.trainNumber === onboardTrainNumber);
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

  // Combined train catalog including suburban services and active metro services
  const metroTrips = generateMetroTrips(departureTime);
  const allAvailableTrains = [...TRAIN_TRIPS, ...metroTrips];

  const candidateItineraries: JourneyItinerary[] = [];

  // Helper to build a single leg
  const buildLeg = (
    train: TrainTrip, 
    fromStation: Station, 
    toStation: Station, 
    legIdx: number
  ): ItineraryLeg | null => {
    const obs = observations[train.trainNumber];
    
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

  // 1. Direct Trains Search
  for (const train of allAvailableTrains) {
    const fromIdx = train.stops.findIndex(s => s.stationCode === originCode);
    const toIdx = train.stops.findIndex(s => s.stationCode === destCode);

    if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
      const leg = buildLeg(train, originStation, destStation, 0);
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

      // Legal eligibility check
      const userClassForEligibility = preferences.classPreference === 'ac_mandatory' || preferences.classPreference === 'ac_preferred'
        ? 'AC_LOCAL'
        : preferences.classPreference === 'first' ? 'I' : 'II';

      const isMetro = train.trainNumber.startsWith('M1') || train.trainNumber.startsWith('M2') || train.trainNumber.startsWith('M7');

      let eligibility = evaluateJourneyEligibility({
        train,
        fromStationCode: originCode,
        toStationCode: destCode,
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
      const obs = observations[train.trainNumber];
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
    { centralCode: 'METRO_WEH', westernCode: 'METRO_GDV', station: resolveStation('METRO_WEH')!, walkMinutes: 3, type: 'metro_fob' }
  ];

  for (const interchange of potentialInterchanges) {
    if (!interchange.station) continue;
    if (originCode === interchange.centralCode || originCode === interchange.westernCode) continue;
    if (destCode === interchange.centralCode || destCode === interchange.westernCode) continue;

    // First leg: originCode to interchange
    const firstLegTrains = allAvailableTrains.filter(t => {
      const fIdx = t.stops.findIndex(s => s.stationCode === originCode);
      const tIdx = t.stops.findIndex(s => s.stationCode === interchange.centralCode || s.stationCode === interchange.westernCode);
      return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx;
    });

    // Second leg: interchange to destCode
    const secondLegTrains = allAvailableTrains.filter(t => {
      const fIdx = t.stops.findIndex(s => s.stationCode === interchange.centralCode || s.stationCode === interchange.westernCode);
      const tIdx = t.stops.findIndex(s => s.stationCode === destCode);
      return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx;
    });

    for (const train1 of firstLegTrains) {
      const leg1FromStation = originStation;
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

      for (const train2 of secondLegTrains) {
        const leg2FromStation = resolveStation(train2.stops.find(s => s.stationCode === interchange.centralCode || s.stationCode === interchange.westernCode)!.stationCode)!;
        const leg2ToStation = destStation;
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
        const userClassForEligibility = preferences.classPreference === 'ac_mandatory' || preferences.classPreference === 'ac_preferred'
          ? 'AC_LOCAL'
          : preferences.classPreference === 'first' ? 'I' : 'II';

        const eligibility1 = evaluateJourneyEligibility({
          train: train1,
          fromStationCode: originCode,
          toStationCode: leg1ToStation.code,
          userTicketType: preferences.hasSeasonPass ? 'suburban_season_pass' : 'suburban_single',
          userClass: userClassForEligibility,
          hasMST: preferences.hasSeasonPass
        });

        const eligibility2 = evaluateJourneyEligibility({
          train: train2,
          fromStationCode: leg2FromStation.code,
          toStationCode: destCode,
          userTicketType: preferences.hasSeasonPass ? 'suburban_season_pass' : 'suburban_single',
          userClass: userClassForEligibility,
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
          ? `Interchange at Ghatkopar: Transfer between Central Railway Platform ${leg1.arrivalPlatform} and Metro Line 1 concourse via dedicated Foot Over Bridge (est. ${minWalkTime} min walk, ${transferBufferMinutes} min buffer).`
          : `Interchange at ${interchange.station.name}: Walk from Platform ${leg1.arrivalPlatform} across Foot Over Bridge to Platform ${leg2.departurePlatform} (est. ${minWalkTime} min walk, ${transferBufferMinutes} min buffer).`;

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

        const isTrain1Metro = train1.trainNumber.startsWith('M1');
        const isTrain2Metro = train2.trainNumber.startsWith('M1');

        let totalFareByClass: Partial<Record<TravelClass, number>> = {};
        if (isTrain1Metro || isTrain2Metro) {
          // Multimodal combined fare
          const metroFare = calculateMetroFare(isTrain1Metro ? dist1 : dist2);
          const railDist = isTrain1Metro ? dist2 : dist1;
          totalFareByClass = {
            II: metroFare + calculateSuburbanFare(railDist, 'II'),
            I: metroFare + calculateSuburbanFare(railDist, 'I'),
            AC_LOCAL: metroFare + calculateSuburbanFare(railDist, 'AC_LOCAL')
          };
        } else {
          // Pure suburban through journey via interchange (CRIS through suburban tariff)
          const totalThroughDist = dist1 + dist2;
          totalFareByClass = {
            II: calculateSuburbanFare(totalThroughDist, 'II'),
            I: calculateSuburbanFare(totalThroughDist, 'I'),
            AC_LOCAL: calculateSuburbanFare(totalThroughDist, 'AC_LOCAL')
          };
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
      }
    }
  }

  // 3. Strict AC Preference Filtering
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
