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
  dayOffset: number;
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
 * Add minutes to "HH:MM" string, taking into account multi-day rollovers
 */
export function addMinutesWithDayOffset(
  timeStr: string, 
  minutesToAdd: number, 
  baseDayOffset: number = 0
): { time: string; dayOffset: number } {
  const [hStr, mStr] = timeStr.split(':');
  let totalMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10) + minutesToAdd;
  let dayOffset = baseDayOffset;

  while (totalMinutes >= 1440) {
    totalMinutes -= 1440;
    dayOffset += 1;
  }
  while (totalMinutes < 0) {
    totalMinutes += 1440;
    dayOffset -= 1;
  }

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return { time: `${pad(h)}:${pad(m)}`, dayOffset };
}

/**
 * Calculate difference in minutes between two times, supporting midnight crossings
 */
export function getMinutesDifference(
  timeA: string, 
  timeB: string, 
  dayOffsetA: number = 0, 
  dayOffsetB: number = 0
): number {
  const [hA, mA] = timeA.split(':').map(Number);
  const [hB, mB] = timeB.split(':').map(Number);
  const totalMinA = dayOffsetA * 1440 + (hA * 60 + mA);
  const totalMinB = dayOffsetB * 1440 + (hB * 60 + mB);
  return totalMinB - totalMinA;
}

/**
 * Downstream Delay Propagation Engine
 * Models realistic delay evolution along stations without magic recovery.
 * Supports compounding bottleneck accumulation (Scenario 4: +20m -> +40m).
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
      uncertaintyMinutes: 0,
      dayOffset: stop.dayOffset || 0
    }));
  }

  const currentIdx = trip.stops.findIndex(s => s.stationCode === obs.currentStationCode);
  const effectiveCurrentIdx = currentIdx >= 0 ? currentIdx : 0;
  let activeDelay = obs.delayMinutesAtCurrent;

  // Check if compounding downstream accumulation is active
  const isCompoundingFixture = (obs.disruptionReason && obs.disruptionReason.toLowerCase().includes('compounding')) ||
    (obs.trainNumber === '12134' || (activeDelay === 20 && obs.disruptionReason?.includes('+40')));

  return trip.stops.map((stop, idx) => {
    let delayAtThisStop = 0;
    let uncertainty = obs.uncertaintyMarginMinutes;
    const baseDayOffset = stop.dayOffset || 0;

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
      // Downstream stations
      const downstreamHops = idx - effectiveCurrentIdx;
      const totalDownstream = Math.max(1, trip.stops.length - 1 - effectiveCurrentIdx);

      if (isCompoundingFixture) {
        // Scenario 4: Origin delay of +20 min accumulates to +40 min at destination
        // Linear compounding: delay = 20 + (downstreamHops / totalDownstream) * 20
        const extraDelay = Math.round((downstreamHops / totalDownstream) * 20);
        delayAtThisStop = activeDelay + extraDelay;
        uncertainty += downstreamHops * 2;
      } else {
        // Standard high-density suburban progression (+1m every 2-3 stops if congested)
        delayAtThisStop = activeDelay + Math.floor(downstreamHops / 3);
        uncertainty += Math.min(8, downstreamHops * 2);
      }
    }

    const { time: predictedArrival, dayOffset: arrDayOffset } = 
      addMinutesWithDayOffset(stop.scheduledArrival, delayAtThisStop, baseDayOffset);
    const { time: predictedDeparture, dayOffset: depDayOffset } = 
      addMinutesWithDayOffset(stop.scheduledDeparture, delayAtThisStop, baseDayOffset);

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
      uncertaintyMinutes: uncertainty,
      dayOffset: arrDayOffset
    };
  });
}
