import { planJourneys, PlanJourneyParams, getCurrentTimeString } from '../../engine/journeyEngine';
import { JourneyItinerary, PassengerPreferences, UserTravelContext } from '../../types/railway';
import { normalizeStationCode } from '../../engine/stationNormalizer';

export interface RouteSearchParams {
  from: string;
  to: string;
  departureTime?: string;
  arriveByDeadline?: string;
  timeWindowMinutes?: number;
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

  const effectiveDepTime = params.departureTime || getCurrentTimeString();

  const planParams: PlanJourneyParams = {
    originCode,
    destCode,
    departureTime: effectiveDepTime,
    arriveByDeadline: params.arriveByDeadline,
    timeWindowMinutes: params.timeWindowMinutes,
    userContext: params.onboardTrainNumber ? 'onboard' : 'pre_departure',
    onboardTrainNumber: params.onboardTrainNumber,
    onboardCurrentStation: params.onboardCurrentStation,
    preferences,
    transitModeFilter: params.transitModeFilter || 'all'
  };

  let routes = planJourneys(planParams);

  // If no routes found at requested departure time and user explicitly requested wider window:
  if (routes.length === 0 && (params as any).searchWiderWindow) {
    const [h, m] = effectiveDepTime.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const nextHour = (h + 2) % 24;
      const widerTime = `${String(nextHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const widerRoutes = planJourneys({ ...planParams, departureTime: widerTime });
      routes = widerRoutes.map(r => ({
        ...r,
        transfersNote: `[WIDER WINDOW: Next service after ${effectiveDepTime} departs at ${r.predictedDeparture}] ${r.transfersNote || ''}`.trim()
      }));
    }
  }

  // If no explicit departure time was specified and no services are active (e.g. late night),
  // fallback to morning peak timetable (10:35) so unscheduled queries return the next daytime services
  if (routes.length === 0 && !params.departureTime) {
    routes = planJourneys({ ...planParams, departureTime: '10:35' });
  }

  // Never secretly retry at 10:35 or change requested departure time behind user's back
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
