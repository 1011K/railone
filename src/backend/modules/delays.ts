import { INITIAL_OBSERVATIONS } from '../../fixtures/railwayData';
import { TrainRunningObservation } from '../../types/railway';
import { computePredictedStops, PredictedStop } from '../../engine/delayModel';
import { getTrainTrip } from './services';

const observationsMap = new Map<string, TrainRunningObservation>();

for (const obs of Object.values(INITIAL_OBSERVATIONS)) {
  observationsMap.set(obs.trainNumber, obs);
}

export function getTrainObservation(trainNumber: string): TrainRunningObservation | undefined {
  return observationsMap.get(trainNumber);
}

export function getAllLiveObservations(): TrainRunningObservation[] {
  return Array.from(observationsMap.values());
}

export function getPropagatedStopsForTrain(trainNumber: string): PredictedStop[] | null {
  const train = getTrainTrip(trainNumber);
  if (!train) return null;

  const obs = getTrainObservation(trainNumber) || {
    trainNumber: train.trainNumber,
    serviceDate: new Date().toISOString().split('T')[0],
    currentStationCode: train.originStation,
    lastReportedStationCode: train.originStation,
    lastReportedTimestamp: new Date().toISOString(),
    hasDepartedOrigin: false,
    delayMinutesAtCurrent: 0,
    isCanceled: false,
    dataStatus: 'SCHEDULED',
    dataSource: 'TIMETABLE_CACHE',
    dataRetrievedAt: new Date().toISOString(),
    uncertaintyMarginMinutes: 2
  };

  return computePredictedStops(train, obs);
}
