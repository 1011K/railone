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
  // Origin is strictly bound to the train's current/next station halt.
  let originCode = rawOriginCode;
  let isOnboardBacktrackForbidden = false;

  if (userContext === 'onboard' && onboardCurrentStation) {
    if (onboardTrainNumber) {
      const onboardTrain = TRAIN_TRIPS.find(t => t.trainNumber === onboardTrainNumber);
      if (onboardTrain) {
        const currentHaltIdx = onboardTrain.stops.findIndex(s => s.stationCode === onboardCurrentStation);
        const requestedOriginIdx = onboardTrain.stops.findIndex(s => s.stationCode === rawOriginCode);

        // If requested origin is before current station, forbid backtracking and clamp origin to current station
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

  const originStation = STATIONS[originCode];
  const destStation = STATIONS[destCode];

  if (!originStation || !destStation || originCode === destCode) {
    return [];
  }

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
    const skippedStopsCount = Math.max(0, (train.stops.length > 5 ? 3 : 0));
    const stoppingPatternLabel = train.serviceType.includes('fast') 
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
      departurePlatform: rawTripStopFrom?.platform || '1',
      arrivalPlatform: rawTripStopTo?.platform || '1',
      dataStatus: fromStop.dataStatus,
      crowding,
      skippedStopsCount,
      stoppingPatternLabel,
      depDayOffset: fromStop.dayOffset || 0,
      arrDayOffset: toStop.dayOffset || 0
    };
  };

  // 1. Direct Trains Search
  for (const train of TRAIN_TRIPS) {
    const fromIdx = train.stops.findIndex(s => s.stationCode === originCode);
    const toIdx = train.stops.findIndex(s => s.stationCode === destCode);

    if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
      const leg = buildLeg(train, originStation, destStation, 0);
      if (!leg) continue;

      // Filter by arrive-by deadline if specified
      if (arriveByDeadline) {
        const diffToDeadline = getMinutesDifference(leg.predictedArr, arriveByDeadline, leg.arrDayOffset || 0, 0);
        if (diffToDeadline < 0) {
          // Arrives AFTER deadline! Strictly excluded
          continue;
        }
        if (departureTime) {
          const diffFromDep = getMinutesDifference(departureTime, leg.predictedDep, 0, leg.depDayOffset || 0);
          if (diffFromDep < -10) continue;
        }
      } else {
        // Standard depart-after filter: allow trains within realistic window (-10 min to +180 min)
        const diffFromQuery = getMinutesDifference(departureTime, leg.predictedDep, 0, leg.depDayOffset || 0);
        if (diffFromQuery < -10 || diffFromQuery > 180) continue;
      }

      // Fare calculation
      const stopFrom = train.stops[fromIdx];
      const stopTo = train.stops[toIdx];
      const segmentDistance = Math.abs(stopTo.distanceKm - stopFrom.distanceKm) || 20;

      const totalFareByClass: Partial<Record<TravelClass, number>> = {};
      for (const cls of train.availableClasses) {
        totalFareByClass[cls] = calculateSuburbanFare(segmentDistance, cls);
      }

      // Legal eligibility check
      const eligibility = evaluateJourneyEligibility({
        train,
        fromStationCode: originCode,
        toStationCode: destCode,
        userTicketType: preferences.hasSeasonPass ? 'suburban_season_pass' : 'suburban_single',
        userClass: preferences.classPreference === 'ac_mandatory' || preferences.classPreference === 'ac_preferred'
          ? 'AC_LOCAL'
          : preferences.classPreference === 'first' ? 'I' : 'II',
        hasMST: preferences.hasSeasonPass
      });

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

  // 2. Transfer Trains Search (e.g. Thane Central Line -> Dadar -> Churchgate Western Line)
  const potentialInterchanges = [
    { centralCode: 'DR', westernCode: 'DDR', station: STATIONS.DR, walkMinutes: 7 },
    { centralCode: 'CLA', westernCode: 'CLA', station: STATIONS.CLA, walkMinutes: 4 },
    { centralCode: 'CSMT', westernCode: 'CSMT', station: STATIONS.CSMT, walkMinutes: 3 }
  ];

  for (const interchange of potentialInterchanges) {
    if (originCode === interchange.centralCode || destCode === interchange.centralCode) continue;

    // First leg: originCode to interchange
    const firstLegTrains = TRAIN_TRIPS.filter(t => {
      const fIdx = t.stops.findIndex(s => s.stationCode === originCode);
      const tIdx = t.stops.findIndex(s => s.stationCode === interchange.centralCode || s.stationCode === interchange.westernCode);
      return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx;
    });

    // Second leg: interchange to destCode
    const secondLegTrains = TRAIN_TRIPS.filter(t => {
      const fIdx = t.stops.findIndex(s => s.stationCode === interchange.centralCode || s.stationCode === interchange.westernCode);
      const tIdx = t.stops.findIndex(s => s.stationCode === destCode);
      return fIdx !== -1 && tIdx !== -1 && fIdx < tIdx;
    });

    for (const train1 of firstLegTrains) {
      const leg1FromStation = originStation;
      const leg1ToStation = STATIONS[train1.stops.find(s => s.stationCode === interchange.centralCode || s.stationCode === interchange.westernCode)!.stationCode];
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
        const leg2FromStation = STATIONS[train2.stops.find(s => s.stationCode === interchange.centralCode || s.stationCode === interchange.westernCode)!.stationCode];
        const leg2ToStation = destStation;
        const leg2 = buildLeg(train2, leg2FromStation, leg2ToStation, 1);
        if (!leg2) continue;

        // Check arrive-by deadline on second leg arrival
        if (arriveByDeadline) {
          const diffToDeadline = getMinutesDifference(leg2.predictedArr, arriveByDeadline, leg2.arrDayOffset || 0, 0);
          if (diffToDeadline < 0) {
            // Arrives after deadline
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
        if (transferBufferMinutes > 50) continue; // too long a layover

        const transfer: TransferInfo = {
          station: interchange.station,
          fromLegIndex: 0,
          toLegIndex: 1,
          walkTimeMinutes: minWalkTime,
          bufferMinutes: transferBufferMinutes,
          isTightConnection,
          isMissedConnection,
          transferGuide: `Interchange at ${interchange.station.name}: Walk from Platform ${leg1.arrivalPlatform} across Foot Over Bridge to Platform ${leg2.departurePlatform} (est. ${minWalkTime} min walk, ${transferBufferMinutes} min buffer available).`
        };

        const totalDurationMinutes = Math.max(1, getMinutesDifference(
          leg1.predictedDep, 
          leg2.predictedArr,
          leg1.depDayOffset || 0,
          leg2.arrDayOffset || 0
        ));
        const walkMargin = preferences.walkToStationMinutes || 15;
        const leaveHomeTime = addMinutesToTimeString(leg1.predictedDep, -walkMargin);

        const totalFareByClass: Partial<Record<TravelClass, number>> = {
          II: 15,
          I: 105,
          AC_LOCAL: 135
        };

        const leg1Ac = train1.serviceType.includes('ac');
        const leg2Ac = train2.serviceType.includes('ac');
        const isAc = leg1Ac && leg2Ac;

        const eligibility = evaluateJourneyEligibility({
          train: train1,
          fromStationCode: originCode,
          toStationCode: interchange.centralCode,
          userTicketType: preferences.hasSeasonPass ? 'suburban_season_pass' : 'suburban_single',
          userClass: preferences.classPreference === 'ac_mandatory' ? 'AC_LOCAL' : 'II',
          hasMST: preferences.hasSeasonPass
        });

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
          eligibility,
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

  // 3. Fallback only if no catalogue itineraries matched (and never invent phantom AC)
  if (candidateItineraries.length === 0) {
    const isSameLine = originStation.line === destStation.line;
    const estDistanceKm = Math.max(8, Math.min(65, Math.abs(
      (originStation.platforms[0] * 5) - (destStation.platforms[0] * 5)
    ) + 16));

    const departures = [
      { offset: 4, type: 'suburban_slow' as const, isAc: false, nameSuffix: 'Slow Local' },
      { offset: 12, type: 'suburban_fast' as const, isAc: false, nameSuffix: 'Fast Local' }
    ];

    for (let dIdx = 0; dIdx < departures.length; dIdx++) {
      const dep = departures[dIdx];
      const speedKmh = dep.type === 'suburban_slow' ? 33 : 48;
      const legDuration = Math.max(12, Math.round((estDistanceKm / speedKmh) * 60));

      const schedDep = addMinutesToTimeString(departureTime, dep.offset);
      const schedArr = addMinutesToTimeString(schedDep, legDuration);

      if (arriveByDeadline && getMinutesDifference(schedArr, arriveByDeadline) < 0) {
        continue;
      }

      const delayMin = dep.type === 'suburban_fast' ? 3 : 1;
      const predDep = addMinutesToTimeString(schedDep, delayMin);
      const predArr = addMinutesToTimeString(schedArr, delayMin);

      const mockTrainNumber = `9${originStation.platforms[0]}${destStation.platforms[0]}${dIdx + 1}2`;
      const mockTrip: TrainTrip = {
        trainNumber: mockTrainNumber,
        trainName: `${originStation.name} - ${destStation.name} ${dep.nameSuffix}`,
        originStation: originStation.code,
        destinationStation: destStation.code,
        serviceType: dep.type,
        runningDays: [0, 1, 2, 3, 4, 5, 6],
        availableClasses: ['II', 'I'],
        stops: [
          { stationCode: originStation.code, stationName: originStation.name, scheduledArrival: schedDep, scheduledDeparture: schedDep, platform: '2', distanceKm: 0, isHalt: true },
          { stationCode: destStation.code, stationName: destStation.name, scheduledArrival: schedArr, scheduledDeparture: schedArr, platform: '1', distanceKm: estDistanceKm, isHalt: true }
        ]
      };

      const fareByClass: Partial<Record<TravelClass, number>> = {
        II: calculateSuburbanFare(estDistanceKm, 'II'),
        I: calculateSuburbanFare(estDistanceKm, 'I')
      };

      const crowding = estimateCrowdLevel(mockTrip, originStation.code, predDep, delayMin, false);
      const walkMargin = preferences.walkToStationMinutes || 12;
      const leaveHomeTime = addMinutesToTimeString(predDep, -walkMargin);

      const leg: ItineraryLeg = {
        legIndex: 0,
        train: mockTrip,
        fromStation: originStation,
        toStation: destStation,
        scheduledDep: schedDep,
        scheduledArr: schedArr,
        predictedDep: predDep,
        predictedArr: predArr,
        delayDepMinutes: delayMin,
        delayArrMinutes: delayMin,
        departurePlatform: '2',
        arrivalPlatform: '1',
        dataStatus: 'SCHEDULED',
        crowding,
        skippedStopsCount: dep.type === 'suburban_fast' ? 4 : 0,
        stoppingPatternLabel: dep.type === 'suburban_fast' ? 'Fast Suburban Service' : 'All-Stations Local Service'
      };

      candidateItineraries.push({
        id: `universal-${mockTrainNumber}`,
        legs: [leg],
        transfers: isSameLine ? [] : [{
          station: STATIONS.DR || originStation,
          fromLegIndex: 0,
          toLegIndex: 0,
          walkTimeMinutes: 7,
          bufferMinutes: 9,
          isTightConnection: false,
          isMissedConnection: false,
          transferGuide: `Interchange via Dadar Foot Over Bridge (allow 7 min walking buffer between platforms).`
        }],
        totalDurationMinutes: legDuration,
        scheduledDeparture: schedDep,
        predictedDeparture: predDep,
        scheduledArrival: schedArr,
        predictedArrival: predArr,
        totalFareByClass: fareByClass,
        recommendedClass: preferences.classPreference === 'first' ? 'I' : 'II',
        eligibility: {
          status: 'ELIGIBLE',
          summary: 'Suburban EMU travel eligible with UTS suburban single ticket or Season Pass.',
          rulesApplied: ['Mumbai Suburban Railway tariff section rules applied.'],
          validClasses: ['II', 'I'],
          passPermitted: true,
          ticketRequiredNote: 'Ordinary suburban ticket or season pass.'
        },
        score: 0,
        rankReason: '',
        isRecommended: false,
        leaveHomeTime,
        leaveHomeMarginMinutes: walkMargin,
        isAcService: false
      });
    }
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
      // Arrive-by scoring: rewards journeys arriving before deadline with minimum idle time
      const marginBeforeDeadline = getMinutesDifference(it.predictedArrival, arriveByDeadline, arrOffset, 0);
      if (marginBeforeDeadline >= 0) {
        score += Math.max(0, 400 - marginBeforeDeadline * 3);
      } else {
        score -= 10000;
      }
    } else {
      // Depart-after scoring: earlier arrival is better
      const minutesToArr = getMinutesDifference(departureTime, it.predictedArrival, 0, arrOffset);
      score -= minutesToArr * 4;
    }

    score -= it.totalDurationMinutes * 2;
    score -= it.transfers.length * 15;

    // Disqualification / Penalties for Eligibility
    if (it.eligibility.status === 'PROHIBITED') {
      score -= 5000;
    } else if (it.eligibility.status === 'CONDITIONAL') {
      score -= 80;
    }

    // AC Preference handling
    if (preferences.classPreference === 'ac_mandatory') {
      if (!it.isAcService) {
        score -= 3000;
      } else {
        score += 350;
      }
    } else if (preferences.classPreference === 'ac_preferred') {
      if (it.isAcService) score += 120;
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
      if (cand.eligibility.status === 'PROHIBITED') {
        cand.rankReason = 'Not recommended: Ticketing eligibility restrictions / prohibited suburban boarding.';
      } else if (cand.isAcService && preferences.classPreference !== 'ac_mandatory') {
        cand.rankReason = 'Alternative: Air-conditioned option (higher fare, comfortable ride).';
      } else if (cand.transfers.length > 0) {
        cand.rankReason = `Alternative: Interchange route (+${cand.totalDurationMinutes - best.totalDurationMinutes}m travel time).`;
      } else {
        cand.rankReason = `Alternative: Scheduled departure at ${cand.predictedDeparture} (${cand.legs[0].crowding.level.toLowerCase()} crowd).`;
      }
    }
  }

  return candidateItineraries;
}
