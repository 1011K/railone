import { STATIONS, TRAIN_TRIPS, INITIAL_OBSERVATIONS, calculateSuburbanFare } from '../fixtures/railwayData';
import { planJourneys } from './journeyEngine';
import { evaluateJourneyEligibility } from './eligibilityEngine';
import { computePredictedStops } from './delayModel';
import { MockBookingStore } from './mockBookingStore';
import { TravelClass, PassengerPreferences, SpecimenTicket } from '../types/railway';

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
  class: TravelClass;
  fareAmount: number;
  currency: string;
  disclaimer: string;
}

export type QuoteFareResult = QuoteFareSuccess | ToolErrorResult;

export interface BookingDraft {
  draftId: string;
  trainNumber: string;
  trainName: string;
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  classBooked: TravelClass;
  farePerPerson: number;
  totalFare: number;
  passengers: Array<{ name: string; age: number; gender: string }>;
  createdTimestamp: string;
}

const activeDrafts: Map<string, BookingDraft> = new Map();

/**
 * Deterministic Backend Service Tools
 * Shared contract between Web Speech / In-App Voice Dialer and Manual Web UI.
 */
export const RailBackendTools = {
  /**
   * 1. Search Trains & Itineraries
   */
  searchTrains(
    originCode: string, 
    destCode: string, 
    time: string = '10:35', 
    classPref: PassengerPreferences['classPreference'] = 'any'
  ): SearchTrainsResult {
    const fromStation = STATIONS[originCode.toUpperCase()];
    const toStation = STATIONS[destCode.toUpperCase()];

    if (!fromStation || !toStation) {
      return {
        status: 'error',
        message: `Unknown station code. Available codes: ${Object.keys(STATIONS).join(', ')}`
      };
    }

    const itineraries = planJourneys({
      originCode: fromStation.code,
      destCode: toStation.code,
      departureTime: time,
      userContext: 'pre_departure',
      preferences: {
        classPreference: classPref,
        priority: 'fastest',
        hasSeasonPass: false,
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
   * 2. Live Status & Delay Provenance
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
      currentStation: obs?.currentStationCode ?? 'UNKNOWN',
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
   * 3. Validate Passenger Boarding Eligibility
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

    const result = evaluateJourneyEligibility({
      train,
      fromStationCode: fromCode.toUpperCase(),
      toStationCode: toCode.toUpperCase(),
      userTicketType: ticketType,
      userClass,
      hasMST: ticketType === 'suburban_season_pass'
    });

    return {
      status: 'success',
      trainNumber,
      fromCode,
      toCode,
      eligibility: result.status,
      summary: result.summary,
      rules: result.rulesApplied,
      passPermitted: result.passPermitted,
      ticketRequiredNote: result.ticketRequiredNote
    };
  },

  /**
   * 4. Compare Itineraries
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
   * 5. Quote Fare
   */
  quoteFare(fromCode: string, toCode: string, travelClass: TravelClass = 'II'): QuoteFareResult {
    const from = STATIONS[fromCode.toUpperCase()];
    const to = STATIONS[toCode.toUpperCase()];
    if (!from || !to) return { status: 'error', message: 'Invalid stations' };

    const estDist = 25; // default suburban segment km
    const fare = calculateSuburbanFare(estDist, travelClass);

    return {
      status: 'success',
      from: from.name,
      to: to.name,
      class: travelClass,
      fareAmount: fare,
      currency: 'INR (₹)',
      disclaimer: 'Official Indian Railways suburban / unreserved fare tariff structure.'
    };
  },

  /**
   * 6. Create Booking Draft
   */
  createBookingDraft(params: {
    trainNumber: string;
    fromCode: string;
    toCode: string;
    classCode: TravelClass;
    passengers: Array<{ name: string; age: number; gender: string }>;
  }): { status: string; draft?: BookingDraft; error?: string } {
    const train = TRAIN_TRIPS.find(t => t.trainNumber === params.trainNumber);
    const from = STATIONS[params.fromCode.toUpperCase()];
    const to = STATIONS[params.toCode.toUpperCase()];

    if (!train || !from || !to) {
      return { status: 'error', error: 'Train or station not found.' };
    }

    const fare = calculateSuburbanFare(25, params.classCode);
    const totalFare = fare * params.passengers.length;

    const draftId = 'DFT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const draft: BookingDraft = {
      draftId,
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      fromStationCode: from.code,
      fromStationName: from.name,
      toStationCode: to.code,
      toStationName: to.name,
      classBooked: params.classCode,
      farePerPerson: fare,
      totalFare,
      passengers: params.passengers,
      createdTimestamp: new Date().toISOString()
    };

    activeDrafts.set(draftId, draft);
    return { status: 'success', draft };
  },

  /**
   * 7. Confirm Demo Booking
   */
  confirmDemoBooking(draftId: string, paymentMethod: string = 'RailWallet (Simulated)'): { status: string; ticket?: SpecimenTicket; error?: string } {
    const draft = activeDrafts.get(draftId);
    if (!draft) {
      return { status: 'error', error: 'Draft booking not found or expired.' };
    }

    const ticket = MockBookingStore.createSpecimenBooking({
      trainNumber: draft.trainNumber,
      trainName: draft.trainName,
      fromCode: draft.fromStationCode,
      fromName: draft.fromStationName,
      toCode: draft.toStationCode,
      toName: draft.toStationName,
      classBooked: draft.classBooked,
      fare: draft.totalFare,
      passengers: draft.passengers,
      paymentMethod
    });

    activeDrafts.delete(draftId);
    return { status: 'success', ticket };
  }
};
