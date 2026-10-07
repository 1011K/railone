import { TRAIN_TRIPS } from '../../fixtures/railwayData';
import { PAN_INDIA_TRAINS } from '../../fixtures/panIndiaTrainsData';
import { TrainTrip, TrainServiceType, TravelClass } from '../../types/railway';

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

const MUMBAI_TERMINALS = new Set(['CSMT', 'MMCT', 'BDTS', 'DR', 'LTT', 'KYN', 'TNA', 'BVI']);
const DELHI_TERMINALS = new Set(['NDLS', 'DLI', 'NZM', 'ANVT']);

export function findExpressTrainsBetween(
  originCode: string,
  destCode: string,
  travelClass?: TravelClass,
  dateStr?: string
): TrainTrip[] {
  const orig = originCode.trim().toUpperCase();
  const dest = destCode.trim().toUpperCase();

  const isOriginMumbai = MUMBAI_TERMINALS.has(orig) || orig === 'MUMBAI';
  const isDestDelhi = DELHI_TERMINALS.has(dest) || dest === 'DELHI';
  const isOriginDelhi = DELHI_TERMINALS.has(orig) || orig === 'DELHI';
  const isDestMumbai = MUMBAI_TERMINALS.has(dest) || dest === 'MUMBAI';

  const all = getAllTrainTrips();
  return all.filter(t => {
    if (t.serviceType.startsWith('suburban_')) return false;
    if (dateStr && !isTrainOperatingOnDate(t, dateStr)) return false;
    if (travelClass && !t.availableClasses.includes(travelClass)) return false;

    const fromIdx = t.stops.findIndex(s => {
      const code = s.stationCode.toUpperCase();
      if (code === orig) return true;
      if (isOriginMumbai && MUMBAI_TERMINALS.has(code)) return true;
      if (isOriginDelhi && DELHI_TERMINALS.has(code)) return true;
      return false;
    });

    const toIdx = t.stops.findIndex(s => {
      const code = s.stationCode.toUpperCase();
      if (code === dest) return true;
      if (isDestDelhi && DELHI_TERMINALS.has(code)) return true;
      if (isDestMumbai && MUMBAI_TERMINALS.has(code)) return true;
      return false;
    });

    return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
  });
}
