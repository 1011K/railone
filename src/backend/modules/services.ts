import { TRAIN_TRIPS } from '../../fixtures/railwayData';
import { PAN_INDIA_TRAINS } from '../../fixtures/panIndiaTrainsData';
import { TrainTrip, TrainServiceType } from '../../types/railway';

const allTripsMap = new Map<string, TrainTrip>();

for (const trip of TRAIN_TRIPS) {
  allTripsMap.set(trip.trainNumber, trip);
}

for (const trip of PAN_INDIA_TRAINS) {
  if (!allTripsMap.has(trip.trainNumber)) {
    allTripsMap.set(trip.trainNumber, trip);
  }
}

export function getAllTrainTrips(): TrainTrip[] {
  return Array.from(allTripsMap.values());
}

export function getTrainTrip(trainNumber: string): TrainTrip | undefined {
  if (!trainNumber) return undefined;
  return allTripsMap.get(trainNumber.trim());
}

export function isTrainOperatingOnDate(train: TrainTrip, dateStr: string): boolean {
  if (!dateStr) return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  const dayOfWeek = d.getDay(); // 0=Sunday
  return train.runningDays.includes(dayOfWeek);
}

export function searchTrainServices(
  query: string,
  serviceType?: TrainServiceType,
  dateStr?: string,
  limit = 25
): TrainTrip[] {
  const q = (query || '').toLowerCase().trim();
  const all = getAllTrainTrips();

  const filtered = all.filter(t => {
    if (serviceType && t.serviceType !== serviceType) return false;
    if (dateStr && !isTrainOperatingOnDate(t, dateStr)) return false;

    if (!q) return true;
    return (
      t.trainNumber.toLowerCase().includes(q) ||
      t.trainName.toLowerCase().includes(q) ||
      (t.hindiName && t.hindiName.includes(q)) ||
      (t.marathiName && t.marathiName.includes(q)) ||
      t.originStation.toLowerCase().includes(q) ||
      t.destinationStation.toLowerCase().includes(q)
    );
  });

  return filtered.slice(0, limit);
}
