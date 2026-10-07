import { planJourneys, PlanJourneyParams } from '../../engine/journeyEngine';
import { JourneyItinerary, PassengerPreferences, UserTravelContext } from '../../types/railway';
import { normalizeStationCode } from '../../engine/stationNormalizer';

export interface RouteSearchParams {
  from: string;
  to: string;
  departureTime?: string;
  arriveByDeadline?: string;
  date?: string;
  classPreference?: 'any' | 'second' | 'first' | 'ac_preferred' | 'ac_mandatory';
  acOnly?: boolean;
  priority?: 'fastest' | 'least_crowded' | 'lowest_fare' | 'fewest_transfers';
  transitModeFilter?: 'all' | 'suburban' | 'metro' | 'national' | 'combined';
  onboardTrainNumber?: string;
  onboardCurrentStation?: string;
}

export function searchRoutes(params: RouteSearchParams): JourneyItinerary[] {
  const originCode = normalizeStationCode(params.from).toUpperCase();
  const destCode = normalizeStationCode(params.to).toUpperCase();

  const classPref = params.acOnly
    ? 'ac_mandatory'
    : (params.classPreference || 'any');

  const preferences: PassengerPreferences = {
    classPreference: classPref,
    priority: params.priority || 'fastest',
    hasSeasonPass: false,
    walkToStationMinutes: 10,
    maxTransfers: 2
  };

  const planParams: PlanJourneyParams = {
    originCode,
    destCode,
    departureTime: params.departureTime || '10:35',
    arriveByDeadline: params.arriveByDeadline,
    userContext: params.onboardTrainNumber ? 'onboard' : 'pre_departure',
    onboardTrainNumber: params.onboardTrainNumber,
    onboardCurrentStation: params.onboardCurrentStation,
    preferences,
    transitModeFilter: params.transitModeFilter || 'all'
  };

  let routes = planJourneys(planParams);
  if (routes.length === 0 && params.departureTime && params.departureTime !== '10:35') {
    routes = planJourneys({ ...planParams, departureTime: '10:35' });
  }
  return routes;
}

export function compareJourneys(itineraries: JourneyItinerary[]): {
  recommended: JourneyItinerary | null;
  cheapest: JourneyItinerary | null;
  fastest: JourneyItinerary | null;
  comparisonSummary: string;
} {
  if (!itineraries || itineraries.length === 0) {
    return {
      recommended: null,
      cheapest: null,
      fastest: null,
      comparisonSummary: 'No itineraries available to compare.'
    };
  }

  const recommended = itineraries.find(i => i.isRecommended) || itineraries[0];

  let cheapest = itineraries[0];
  let lowestFare = 999999;
  for (const it of itineraries) {
    const f = it.totalFareByClass[it.recommendedClass] || 999999;
    if (f < lowestFare) {
      lowestFare = f;
      cheapest = it;
    }
  }

  let fastest = itineraries[0];
  let minDuration = 999999;
  for (const it of itineraries) {
    if (it.totalDurationMinutes < minDuration) {
      minDuration = it.totalDurationMinutes;
      fastest = it;
    }
  }

  return {
    recommended,
    cheapest,
    fastest,
    comparisonSummary: `Evaluated ${itineraries.length} routes. Recommended route departs at ${recommended.predictedDeparture} with duration ${recommended.totalDurationMinutes}m.`
  };
}
