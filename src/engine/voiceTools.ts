import { STATIONS, TRAIN_TRIPS, INITIAL_OBSERVATIONS, calculateSuburbanFare } from '../fixtures/railwayData';
import { planJourneys, PlanJourneyParams } from './journeyEngine';
import { evaluateJourneyEligibility } from './eligibilityEngine';
import { computePredictedStops } from './delayModel';
import { MockBookingStore } from './mockBookingStore';
import { normalizeStation, normalizeStationCode } from './stationNormalizer';
import { calculateStationDistance } from '../backend/modules/fares';
import { TravelClass, PassengerPreferences, SpecimenTicket, UserTravelContext, BookingState, RefundBreakdown } from '../types/railway';

export interface SearchTrainsSuccess {
  status: 'success';
  origin: string;
  destination: string;
  count: number;
  itineraries: Array<{
    id: string;
    isRecommended: boolean;
    departure: string;
    arrival: string;
    durationMinutes: number;
    transfers: number;
    fare: Partial<Record<TravelClass, number>>;
    recommendedClass: TravelClass;
    rankReason: string;
    delayInversion?: string;
    leaveHomeTime: string;
    eligibility: string;
    legs: Array<{
      trainNumber: string;
      trainName: string;
      from: string;
      to: string;
      dep: string;
      arr: string;
      delayDep: number;
      crowd: string;
      platform: string;
    }>;
  }>;
}

export interface ToolErrorResult {
  status: 'error';
  message: string;
  disambiguationOptions?: string[];
}

export type SearchTrainsResult = SearchTrainsSuccess | ToolErrorResult;

export interface LiveStatusSuccess {
  status: 'success';
  trainNumber: string;
  trainName: string;
  serviceType: string;
  origin: string;
  destination: string;
  hasDepartedOrigin: boolean;
  currentStation: string;
  currentDelayMinutes: number;
  disruptionReason: string;
  dataProvenance: {
    status: string;
    source: string;
    asOf: string;
    uncertaintyMargin: number;
  };
  stops: Array<{
    station: string;
    code: string;
    schedArr: string;
    predArr: string;
    delayMin: number;
    status: string;
  }>;
}

export type GetLiveStatusResult = LiveStatusSuccess | ToolErrorResult;

export interface QuoteFareSuccess {
  status: 'success';
  from: string;
  to: string;
  distanceKm: number;
  class: TravelClass;
  fareAmount: number;
  currency: string;
  disclaimer: string;
}

export type QuoteFareResult = QuoteFareSuccess | ToolErrorResult;

export interface BookingDraft {
  draftId: string;
  idempotencyKey?: string;
  trainNumber: string;
  trainName: string;
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  classBooked: TravelClass;
  distanceKm: number;
  farePerPerson: number;
  totalFare: number;
  passengers: Array<{ name: string; age: number; gender: string }>;
  createdTimestamp: string;
}

const activeDrafts: Map<string, BookingDraft> = new Map();

/**
 * Deterministic Backend Service Tools
 * Shared contract between Web Speech / In-App Voice Dialer, RailSathi AI, and Manual Web UI.
 * Guaranteed 100% parity between voice and manual workflows (Scenario 15).
 */
export const RailBackendTools = {
  /**
   * 1. Normalize Station Name / Code
   */
  normalizeStation(query: string) {
    return normalizeStation(query);
  },

  /**
   * 2. Find Nearby Stations based on Location or City
   */
  findNearbyStations(latitude?: number, longitude?: number, city: string = 'Mumbai') {
    const popularInCity: Record<string, string[]> = {
      Mumbai: ['CSMT', 'TNA', 'DR', 'ADH', 'BVI', 'KYN', 'CCG', 'PNVL'],
      Pune: ['PUNE', 'SVJR', 'CCH', 'LNL'],
      'Delhi NCR': ['NDLS', 'DLI', 'NZM', 'GZB'],
      Bengaluru: ['SBC', 'YPR', 'WFD'],
      Kolkata: ['HWH', 'SDAH', 'KOAA'],
      Chennai: ['MAS', 'MS', 'MSB', 'TBM'],
      Hyderabad: ['SC', 'HYB', 'LPI'],
      Kochi: ['ERS', 'ERN', 'AWY']
    };

    const codes = popularInCity[city] || popularInCity['Mumbai'];
    const stations = codes.map(c => STATIONS[c]).filter(Boolean);

    return {
      status: 'success',
      city,
      count: stations.length,
      stations: stations.map(s => ({
        code: s.code,
        name: s.name,
        line: s.line,
        isInterchange: s.isInterchange,
        platforms: s.platforms
      }))
    };
  },

  /**
   * 3. Search Trains & Itineraries
   * Supports multilingual station query, arrive-by deadlines, and onboard context.
   */
  searchTrains(
    originQuery: string, 
    destQuery: string, 
    time: string = '10:35', 
    classPref: PassengerPreferences['classPreference'] = 'any',
    options?: {
      arriveByDeadline?: string;
      userContext?: UserTravelContext;
      onboardTrainNumber?: string;
      onboardCurrentStation?: string;
      hasSeasonPass?: boolean;
    }
  ): SearchTrainsResult {
    const fromNorm = normalizeStation(originQuery);
    const toNorm = normalizeStation(destQuery);

    if (!fromNorm.matchedStation) {
      return {
        status: 'error',
        message: fromNorm.explanation,
        disambiguationOptions: fromNorm.candidates.map(c => `${c.name} (${c.code})`)
      };
    }
    if (!toNorm.matchedStation) {
      return {
        status: 'error',
        message: toNorm.explanation,
        disambiguationOptions: toNorm.candidates.map(c => `${c.name} (${c.code})`)
      };
    }

    const fromStation = fromNorm.matchedStation;
    const toStation = toNorm.matchedStation;

    const itineraries = planJourneys({
      originCode: fromStation.code,
      destCode: toStation.code,
      departureTime: time,
      arriveByDeadline: options?.arriveByDeadline,
      userContext: options?.userContext || 'pre_departure',
      onboardTrainNumber: options?.onboardTrainNumber,
      onboardCurrentStation: options?.onboardCurrentStation,
      preferences: {
        classPreference: classPref,
        priority: 'fastest',
        hasSeasonPass: options?.hasSeasonPass || false,
        walkToStationMinutes: 15,
        maxTransfers: 1
      }
    });

    return {
      status: 'success',
      origin: fromStation.name,
      destination: toStation.name,
      count: itineraries.length,
      itineraries: itineraries.map(it => ({
        id: it.id,
        isRecommended: it.isRecommended,
        departure: it.predictedDeparture,
        arrival: it.predictedArrival,
        durationMinutes: it.totalDurationMinutes,
        transfers: it.transfers.length,
        fare: it.totalFareByClass,
        recommendedClass: it.recommendedClass,
        rankReason: it.rankReason,
        delayInversion: it.delayInversionNote,
        leaveHomeTime: it.leaveHomeTime,
        eligibility: it.eligibility.status,
        legs: it.legs.map(l => ({
          trainNumber: l.train.trainNumber,
          trainName: l.train.trainName,
          from: l.fromStation.name,
          to: l.toStation.name,
          dep: l.predictedDep,
          arr: l.predictedArr,
          delayDep: l.delayDepMinutes,
          crowd: l.crowding.level,
          platform: l.departurePlatform
        }))
      }))
    };
  },

  /**
   * 4. Plan Journeys (direct engine invocation)
   */
  planJourneys(params: PlanJourneyParams) {
    return planJourneys(params);
  },

  /**
   * 5. Live Status & Delay Provenance
   */
  getLiveStatus(trainNumber: string): GetLiveStatusResult {
    const train = TRAIN_TRIPS.find(t => t.trainNumber === trainNumber);
    if (!train) {
      return {
        status: 'error',
        message: `Train ${trainNumber} not found in database.`
      };
    }

    const obs = INITIAL_OBSERVATIONS[trainNumber];
    const predictedStops = computePredictedStops(train, obs);

    return {
      status: 'success',
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      serviceType: train.serviceType,
      origin: train.originStation,
      destination: train.destinationStation,
      hasDepartedOrigin: obs?.hasDepartedOrigin ?? true,
      currentStation: obs?.currentStationCode ?? train.stops[0]?.stationCode ?? 'UNKNOWN',
      currentDelayMinutes: obs?.delayMinutesAtCurrent ?? 0,
      disruptionReason: obs?.disruptionReason ?? 'Operating with normal sectional clearance',
      dataProvenance: {
        status: obs?.dataStatus ?? 'SCHEDULED',
        source: obs?.dataSource ?? 'Official Published Timetable',
        asOf: obs?.lastReportedTimestamp ?? 'TIMETABLE_ONLY',
        uncertaintyMargin: obs?.uncertaintyMarginMinutes ?? 0
      },
      stops: predictedStops.map(s => ({
        station: s.stationName,
        code: s.stationCode,
        schedArr: s.scheduledArrival,
        predArr: s.predictedArrival,
        delayMin: s.delayArrivalMinutes,
        status: s.dataStatus
      }))
    };
  },

  /**
   * Alias for getLiveStatus to satisfy required deterministic tools interface
   */
  getTrainStatus(trainNumber: string): GetLiveStatusResult {
    return this.getLiveStatus(trainNumber);
  },

  /**
   * 6. Validate Passenger Boarding Eligibility
   */
  validateEligibility(
    trainNumber: string, 
    fromCode: string, 
    toCode: string, 
    ticketType: 'suburban_single' | 'suburban_season_pass' | 'express_unreserved' = 'suburban_single',
    userClass: TravelClass = 'II'
  ) {
    const train = TRAIN_TRIPS.find(t => t.trainNumber === trainNumber);
    if (!train) return { status: 'error', message: 'Train not found' };

    const fromNorm = normalizeStation(fromCode);
    const toNorm = normalizeStation(toCode);
    const fCode = fromNorm.matchedStation?.code || fromCode.toUpperCase();
    const tCode = toNorm.matchedStation?.code || toCode.toUpperCase();

    const result = evaluateJourneyEligibility({
      train,
      fromStationCode: fCode,
      toStationCode: tCode,
      userTicketType: ticketType,
      userClass,
      hasMST: ticketType === 'suburban_season_pass'
    });

    return {
      status: 'success',
      trainNumber,
      fromCode: fCode,
      toCode: tCode,
      eligibility: result.status,
      summary: result.summary,
      rules: result.rulesApplied,
      passPermitted: result.passPermitted,
      ticketRequiredNote: result.ticketRequiredNote
    };
  },

  /**
   * 7. Compare Itineraries
   */
  compareItineraries(originCode: string, destCode: string, priority: 'fastest' | 'least_crowded' | 'lowest_fare' = 'fastest') {
    const res = this.searchTrains(originCode, destCode, '10:35');
    if (res.status === 'error') return res;

    return {
      status: 'success',
      comparisonHeadline: `Comparing viable options between ${res.origin} and ${res.destination}`,
      options: res.itineraries
    };
  },

  /**
   * 8. Quote Fare (using accurate track distance instead of fixed 25 km)
   */
  quoteFare(fromCode: string, toCode: string, travelClass: TravelClass = 'II'): QuoteFareResult {
    const fromNorm = normalizeStation(fromCode);
    const toNorm = normalizeStation(toCode);

    if (!fromNorm.matchedStation || !toNorm.matchedStation) {
      return { status: 'error', message: 'Invalid stations' };
    }

    const distanceKm = calculateStationDistance(fromNorm.matchedStation.code, toNorm.matchedStation.code);
    const fare = calculateSuburbanFare(distanceKm, travelClass);

    return {
      status: 'success',
      from: fromNorm.matchedStation.name,
      to: toNorm.matchedStation.name,
      distanceKm,
      class: travelClass,
      fareAmount: fare,
      currency: 'INR (₹)',
      disclaimer: 'Official Indian Railways suburban / unreserved distance-slab regulated tariff.'
    };
  },

  /**
   * 9. Create Booking Draft (using accurate track distance)
   */
  createBookingDraft(params: {
    idempotencyKey?: string;
    trainNumber: string;
    fromCode: string;
    toCode: string;
    classCode: TravelClass;
    passengers: Array<{ name: string; age: number; gender: string }>;
  }): { status: string; draft?: BookingDraft; error?: string } {
    const train = TRAIN_TRIPS.find(t => t.trainNumber === params.trainNumber);
    const fromNorm = normalizeStation(params.fromCode);
    const toNorm = normalizeStation(params.toCode);

    if (!train || !fromNorm.matchedStation || !toNorm.matchedStation) {
      return { status: 'error', error: 'Train or station not found.' };
    }

    const distanceKm = calculateStationDistance(fromNorm.matchedStation.code, toNorm.matchedStation.code);
    const fare = calculateSuburbanFare(distanceKm, params.classCode);
    const totalFare = fare * params.passengers.length;

    const draftId = 'DFT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const draft: BookingDraft = {
      draftId,
      idempotencyKey: params.idempotencyKey,
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      fromStationCode: fromNorm.matchedStation.code,
      fromStationName: fromNorm.matchedStation.name,
      toStationCode: toNorm.matchedStation.code,
      toStationName: toNorm.matchedStation.name,
      classBooked: params.classCode,
      distanceKm,
      farePerPerson: fare,
      totalFare,
      passengers: params.passengers,
      createdTimestamp: new Date().toISOString()
    };

    activeDrafts.set(draftId, draft);
    return { status: 'success', draft };
  },

  /**
   * 10. Confirm Demo Booking (Idempotent)
   */
  confirmBooking(
    draftId: string, 
    paymentMethod: string = 'RailWallet (Simulated)',
    options?: { simulateAmbiguousTimeout?: boolean }
  ) {
    return this.confirmDemoBooking(draftId, paymentMethod, options);
  },

  confirmDemoBooking(
    draftId: string, 
    paymentMethod: string = 'RailWallet (Simulated)',
    options?: { simulateAmbiguousTimeout?: boolean }
  ): { 
    status: string; 
    ticket?: SpecimenTicket; 
    isDuplicate?: boolean; 
    bookingState?: BookingState;
    error?: string 
  } {
    const draft = activeDrafts.get(draftId);
    if (!draft) {
      return { status: 'error', error: 'Draft booking not found or expired.' };
    }

    const res = MockBookingStore.createSpecimenBooking({
      idempotencyKey: draft.idempotencyKey || draft.draftId,
      trainNumber: draft.trainNumber,
      trainName: draft.trainName,
      fromCode: draft.fromStationCode,
      fromName: draft.fromStationName,
      toCode: draft.toStationCode,
      toName: draft.toStationName,
      classBooked: draft.classBooked,
      fare: draft.totalFare,
      passengers: draft.passengers,
      paymentMethod,
      simulateAmbiguousTimeout: options?.simulateAmbiguousTimeout
    });

    activeDrafts.delete(draftId);
    return { 
      status: 'success', 
      ticket: res.ticket, 
      isDuplicate: res.isDuplicateSubmission,
      bookingState: res.bookingState
    };
  },

  /**
   * 11. List Active & Past Tickets
   */
  listTickets() {
    const tickets = MockBookingStore.listBookings();
    return {
      status: 'success',
      count: tickets.length,
      tickets
    };
  },

  /**
   * 12. Cancel Ticket with Itemized Refund
   */
  cancelTicket(ticketId: string, preferredType: 'wallet' | 'cash' | 'voucher' = 'wallet') {
    return this.cancelDemoBooking(ticketId, preferredType);
  },

  cancelDemoBooking(ticketId: string, preferredType: 'wallet' | 'cash' | 'voucher' = 'wallet') {
    const res = MockBookingStore.cancelBooking(ticketId, preferredType);
    return {
      status: res.success ? 'success' : 'error',
      ...res
    };
  },

  /**
   * 13. Get Refund Status
   */
  getRefundStatus(ticketId: string) {
    const ticket = MockBookingStore.getBookingById(ticketId);
    if (!ticket) {
      return { status: 'error', message: 'Ticket not found.' };
    }
    return {
      status: 'success',
      ticketId,
      bookingStatus: ticket.bookingState || ticket.paymentStatus,
      fare: ticket.farePaid,
      refundDetails: ticket.refundBreakdown || null
    };
  },

  /**
   * 14. Coach Guidance (Wagenstandsanzeiger)
   */
  getCoachGuidance(trainNumber: string, stationCode: string = 'DR', platform: string = '3') {
    const train = TRAIN_TRIPS.find(t => t.trainNumber === trainNumber);
    const isAc = train ? train.serviceType.includes('ac') : false;
    const isVandeBharat = train ? train.serviceType.includes('vande_bharat') : false;

    return {
      status: 'success',
      trainNumber,
      trainName: train?.trainName || 'Suburban Fast Local',
      rakeType: isVandeBharat ? '16_CAR_VANDE_BHARAT' : isAc ? '12_CAR_AC_EMU' : '12_CAR_NON_AC_EMU',
      stationCode,
      platform,
      ladiesCoaches: [
        { coachIndex: 2, label: 'First Class / Ladies (CST End)' },
        { coachIndex: 7, label: 'Second Class Ladies (Middle)' },
        { coachIndex: 11, label: 'Ladies Special (Kalyan End)' }
      ],
      handicapCoach: { coachIndex: 4, label: 'Divyangjan Coach with Wheelchair Ramp Alignment' },
      fobStairAlignment: {
        nearestBridge: 'Middle Foot Over Bridge (FOB-2)',
        nearestCoachIndex: 6,
        walkMinutesToFOB: 1.5
      }
    };
  },

  /**
   * 15. Disruption Alternatives
   */
  getDisruptionAlternatives(trainNumber: string, currentStationCode: string = 'CLA') {
    const obs = INITIAL_OBSERVATIONS[trainNumber];
    const train = TRAIN_TRIPS.find(t => t.trainNumber === trainNumber);

    if (!train) {
      return { status: 'error', message: 'Train not found' };
    }

    const isDelayed = (obs?.delayMinutesAtCurrent || 0) > 10;
    const isCanceled = obs?.isCanceled || false;

    // Search alternatives from current halt
    const altJourneys = planJourneys({
      originCode: currentStationCode,
      destCode: train.destinationStation,
      departureTime: '10:45',
      userContext: 'onboard',
      onboardTrainNumber: trainNumber,
      onboardCurrentStation: currentStationCode,
      preferences: {
        classPreference: 'any',
        priority: 'fastest',
        hasSeasonPass: false,
        walkToStationMinutes: 0,
        maxTransfers: 1
      }
    });

    return {
      status: 'success',
      trainNumber,
      isDelayed,
      isCanceled,
      delayMinutes: obs?.delayMinutesAtCurrent || 0,
      disruptionReason: obs?.disruptionReason || 'Normal operations',
      recommendedAction: isDelayed 
        ? `Train delayed by +${obs?.delayMinutesAtCurrent} min. Board downstream Slow Local on through line.` 
        : 'Continue on current service.',
      alternativesCount: altJourneys.length,
      alternatives: altJourneys.slice(0, 3).map(j => ({
        id: j.id,
        departure: j.predictedDeparture,
        arrival: j.predictedArrival,
        trainNumber: j.legs[0]?.train.trainNumber,
        trainName: j.legs[0]?.train.trainName,
        serviceType: j.legs[0]?.train.serviceType
      }))
    };
  },

  /**
   * Reconcile Pending Demo Booking (retained for backward compatibility)
   */
  reconcileDemoBooking(identifier: string) {
    const result = MockBookingStore.reconcilePendingOrder(identifier);
    return {
      status: result.success ? 'success' : 'error',
      ...result
    };
  }
};
