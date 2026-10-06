import { TrainTrip, StopEntry, TrainRunningObservation, DataStatus } from '../types/railway';

export interface PredictedStop {
  stationCode: string;
  stationName: string;
  scheduledArrival: string;
  scheduledDeparture: string;
  predictedArrival: string;
  predictedDeparture: string;
  delayArrivalMinutes: number;
  delayDepartureMinutes: number;
  dataStatus: DataStatus;
  uncertaintyMinutes: number;
}

/**
 * Add minutes to "HH:MM" string, returns "HH:MM"
 */
export function addMinutesToTimeString(timeStr: string, minutesToAdd: number): string {
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  let m = parseInt(mStr, 10) + minutesToAdd;

  while (m >= 60) {
    m -= 60;
    h = (h + 1) % 24;
  }
  while (m < 0) {
    m += 60;
    h = (h - 1 + 24) % 24;
  }

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}`;
}

/**
 * Calculate difference in minutes between two "HH:MM" times (timeB - timeA)
 */
export function getMinutesDifference(timeA: string, timeB: string): number {
  const [hA, mA] = timeA.split(':').map(Number);
  const [hB, mB] = timeB.split(':').map(Number);
  return (hB * 60 + mB) - (hA * 60 + mA);
}

/**
 * Downstream Delay Propagation Engine
 * Models realistic delay evolution along stations without magic recovery.
 */
export function computePredictedStops(
  trip: TrainTrip,
  obs?: TrainRunningObservation
): PredictedStop[] {
  if (!obs) {
    // Timetable only - SCHEDULED
    return trip.stops.map((stop) => ({
      stationCode: stop.stationCode,
      stationName: stop.stationName,
      scheduledArrival: stop.scheduledArrival,
      scheduledDeparture: stop.scheduledDeparture,
      predictedArrival: stop.scheduledArrival,
      predictedDeparture: stop.scheduledDeparture,
      delayArrivalMinutes: 0,
      delayDepartureMinutes: 0,
      dataStatus: 'SCHEDULED' as DataStatus,
      uncertaintyMinutes: 0
    }));
  }

  const currentIdx = trip.stops.findIndex(s => s.stationCode === obs.currentStationCode);
  const effectiveCurrentIdx = currentIdx >= 0 ? currentIdx : 0;

  // Current active delay at reporting point
  let activeDelay = obs.delayMinutesAtCurrent;

  return trip.stops.map((stop, idx) => {
    let delayAtThisStop = 0;
    let uncertainty = obs.uncertaintyMarginMinutes;

    if (!obs.hasDepartedOrigin) {
      // Train has not left origin yet. The whole schedule is pushed back by the origin delay.
      delayAtThisStop = activeDelay;
      uncertainty += 4; // Greater uncertainty before origin departure
    } else if (idx < effectiveCurrentIdx) {
      // Past station: already traversed
      delayAtThisStop = Math.max(0, activeDelay - Math.max(1, (effectiveCurrentIdx - idx) * 3));
      uncertainty = 1;
    } else if (idx === effectiveCurrentIdx) {
      // Current station
      delayAtThisStop = activeDelay;
    } else {
      // Downstream stations: delays propagate.
      // High-density suburban lines have tight headway; delays can compound slightly (+1 min every 2 stops if congested).
      const downstreamHops = idx - effectiveCurrentIdx;
      delayAtThisStop = activeDelay + Math.floor(downstreamHops / 3);
      uncertainty += Math.min(8, downstreamHops * 2);
    }

    const predictedArrival = addMinutesToTimeString(stop.scheduledArrival, delayAtThisStop);
    const predictedDeparture = addMinutesToTimeString(stop.scheduledDeparture, delayAtThisStop);

    return {
      stationCode: stop.stationCode,
      stationName: stop.stationName,
      scheduledArrival: stop.scheduledArrival,
      scheduledDeparture: stop.scheduledDeparture,
      predictedArrival,
      predictedDeparture,
      delayArrivalMinutes: delayAtThisStop,
      delayDepartureMinutes: delayAtThisStop,
      dataStatus: obs.dataStatus,
      uncertaintyMinutes: uncertainty
    };
  });
}
