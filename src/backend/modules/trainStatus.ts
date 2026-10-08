import { getTrainTrip } from './services';
import { getTrainObservation, getPropagatedStopsForTrain } from './delays';
import { PredictedStop } from '../../engine/delayModel';
import { DataStatus } from '../../types/railway';

export interface TrainStatusSummary {
  trainNumber: string;
  trainName: string;
  serviceType: string;
  originStation: string;
  destinationStation: string;
  currentStationCode: string | null;
  delayMinutes: number | null;
  isCanceled: boolean;
  disruptionReason?: string;
  dataStatus: DataStatus;
  lastUpdated: string | null;
  stops: PredictedStop[];
}

export function getTrainStatus(trainNumber: string): TrainStatusSummary | null {
  const train = getTrainTrip(trainNumber);
  if (!train) return null;

  const obs = getTrainObservation(trainNumber);
  const stops = getPropagatedStopsForTrain(trainNumber) || [];

  return {
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    serviceType: train.serviceType,
    originStation: train.originStation,
    destinationStation: train.destinationStation,
    currentStationCode: obs?.currentStationCode || null,
    delayMinutes: obs ? obs.delayMinutesAtCurrent : null,
    isCanceled: !!obs?.isCanceled,
    disruptionReason: obs?.disruptionReason,
    dataStatus: obs?.dataStatus || 'SCHEDULED',
    lastUpdated: obs?.lastReportedTimestamp || null,
    stops
  };
}
