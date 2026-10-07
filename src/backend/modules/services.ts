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
  const trimmed = trainNumber.trim();
  if (allTripsMap.has(trimmed)) {
    return allTripsMap.get(trimmed);
  }

  // Dynamic suburban cadence train resolution (e.g. CR-AC-95302, CR-95200, WR-90000, HR-98000)
  if (trimmed.startsWith('CR-') || trimmed.startsWith('WR-') || trimmed.startsWith('HR-') || trimmed.startsWith('TR-')) {
    const isAc = trimmed.includes('-AC-');
    const isFast = trimmed.includes('FAST') || (!trimmed.includes('SLOW') && !trimmed.includes('slow'));
    const isCentral = trimmed.startsWith('CR-');
    const line = isCentral ? 'Central' : trimmed.startsWith('WR-') ? 'Western' : 'Harbour';
    return {
      trainNumber: trimmed,
      trainName: `${line} Suburban ${isAc ? 'AC ' : ''}${isFast ? 'Fast' : 'Slow'} Local`,
      hindiName: `${line} उपनगरीय लोकल`,
      marathiName: `${line} उपनगरीय लोकल`,
      originStation: isCentral ? 'KYN' : 'CCG',
      destinationStation: isCentral ? 'CSMT' : 'BVI',
      serviceType: isAc ? (isFast ? 'suburban_ac_fast' : 'suburban_ac_slow') : (isFast ? 'suburban_fast' : 'suburban_slow'),
      runningDays: [0, 1, 2, 3, 4, 5, 6],
      rakeType: '12_car',
      availableClasses: isAc ? ['AC_LOCAL'] : ['II', 'I'],
      stops: []
    };
  }

  return undefined;
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
