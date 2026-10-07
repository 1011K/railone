import { TrainTrip, StopEntry } from '../../types/railway';
import { getAllTrainTrips, isTrainOperatingOnDate } from './services';
import { getStationByCode } from './stations';

export interface EvaluatedStopPair {
  train: TrainTrip;
  originStop: StopEntry;
  destStop: StopEntry;
  distanceKm: number;
  durationMinutes: number;
  skippedStops: StopEntry[];
  isExpressFastPattern: boolean;
  haltsCount: number;
}

export function evaluateTrainStopPair(
  train: TrainTrip,
  fromCode: string,
  toCode: string
): EvaluatedStopPair | null {
  const fromNormalized = fromCode.toUpperCase();
  const toNormalized = toCode.toUpperCase();

  const fromIdx = train.stops.findIndex(s => s.stationCode.toUpperCase() === fromNormalized && s.isHalt);
  const toIdx = train.stops.findIndex(s => s.stationCode.toUpperCase() === toNormalized && s.isHalt);

  if (fromIdx === -1 || toIdx === -1 || fromIdx >= toIdx) {
    return null;
  }

  const originStop = train.stops[fromIdx];
  const destStop = train.stops[toIdx];

  const intermediate = train.stops.slice(fromIdx + 1, toIdx);
  const skippedStops = intermediate.filter(s => !s.isHalt);
  const haltsCount = intermediate.filter(s => s.isHalt).length + 2;
  const isExpressFastPattern = skippedStops.length > 0;

  const distanceKm = Math.max(1, destStop.distanceKm - originStop.distanceKm);

  // Parse time
  const [depH, depM] = originStop.scheduledDeparture.split(':').map(Number);
  const [arrH, arrM] = destStop.scheduledArrival.split(':').map(Number);
  const arrDayOffset = destStop.dayOffset || 0;
  const depDayOffset = originStop.dayOffset || 0;

  const totalDepMins = depDayOffset * 1440 + depH * 60 + depM;
  const totalArrMins = arrDayOffset * 1440 + arrH * 60 + arrM;
  const durationMinutes = Math.max(1, totalArrMins - totalDepMins);

  return {
    train,
    originStop,
    destStop,
    distanceKm,
    durationMinutes,
    skippedStops,
    isExpressFastPattern,
    haltsCount
  };
}

export interface StationDepartureInfo {
  trainNumber: string;
  trainName: string;
  serviceType: string;
  scheduledDeparture: string;
  destinationStation: string;
  platform: string;
  availableClasses: string[];
  isAc: boolean;
}

export function getStationDepartures(
  stationCode: string,
  dateStr?: string,
  timeWindowStart = '00:00',
  windowMinutes = 180
): StationDepartureInfo[] {
  const code = stationCode.toUpperCase();
  const allTrips = getAllTrainTrips();
  const results: StationDepartureInfo[] = [];

  const [startH, startM] = timeWindowStart.split(':').map(Number);
  const startTotalMinutes = (isNaN(startH) ? 0 : startH) * 60 + (isNaN(startM) ? 0 : startM);
  const endTotalMinutes = startTotalMinutes + windowMinutes;

  for (const train of allTrips) {
    if (dateStr && !isTrainOperatingOnDate(train, dateStr)) continue;

    const stop = train.stops.find(s => s.stationCode.toUpperCase() === code && s.isHalt);
    if (!stop) continue;

    // Check if it has downstream stations (not terminus for boarding)
    const stopIdx = train.stops.indexOf(stop);
    if (stopIdx === train.stops.length - 1) continue;

    const [depH, depM] = stop.scheduledDeparture.split(':').map(Number);
    const depMins = depH * 60 + depM;

    if (depMins >= startTotalMinutes && depMins <= endTotalMinutes) {
      const isAc = train.serviceType === 'suburban_ac_fast' || train.serviceType === 'suburban_ac_slow' || train.trainName.includes('AC');
      results.push({
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        serviceType: train.serviceType,
        scheduledDeparture: stop.scheduledDeparture,
        destinationStation: train.destinationStation,
        platform: stop.platform || '1',
        availableClasses: train.availableClasses,
        isAc
      });
    }
  }

  // Sort by departure time
  results.sort((a, b) => a.scheduledDeparture.localeCompare(b.scheduledDeparture));
  return results;
}
