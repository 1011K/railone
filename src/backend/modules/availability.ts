import { TravelClass } from '../../types/railway';
import { getTrainTrip } from './services';

export interface ClassAvailabilityItem {
  travelClass: TravelClass;
  status: string; // e.g., 'AVAILABLE-48', 'AVAILABLE-OPEN', 'RAC-12', 'WL-24'
  fare: number;
  quota: string;
  lastUpdated: string;
}

export interface TrainAvailabilityResponse {
  trainNumber: string;
  trainName: string;
  journeyDate: string;
  serviceType: string;
  classes: ClassAvailabilityItem[];
  isSimulated: boolean;
  statusProvenance: 'VERIFIED_PROVIDER_ADAPTER' | 'TIMETABLE_SIMULATED';
}

export function checkAvailability(
  trainNumber: string,
  journeyDate: string,
  quota = 'GN'
): TrainAvailabilityResponse | null {
  const train = getTrainTrip(trainNumber);
  if (!train) return null;

  const isSuburban = train.serviceType.startsWith('suburban_');
  const now = new Date().toISOString();

  const classes: ClassAvailabilityItem[] = train.availableClasses.map(cls => {
    let status = 'AVAILABLE-OPEN';
    let fare = 10;

    if (isSuburban) {
      if (cls === 'II') {
        status = 'AVAILABLE-OPEN';
        fare = 10;
      } else if (cls === 'I') {
        status = 'AVAILABLE-OPEN';
        fare = 105;
      } else if (cls === 'AC_LOCAL') {
        status = 'AVAILABLE-240';
        fare = 95;
      }
    } else {
      // Deterministic quota calculations based on train number & date
      const hash = (train.trainNumber.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + (journeyDate ? journeyDate.length : 0)) % 100;
      if (cls === 'SL') {
        status = hash > 30 ? `AVAILABLE-${hash}` : `RAC-${15 - (hash % 10)}`;
        fare = 385;
      } else if (cls === '3A') {
        status = hash > 20 ? `AVAILABLE-${Math.max(4, Math.floor(hash / 2))}` : `WL-${10 + (hash % 8)}`;
        fare = 1025;
      } else if (cls === '2A') {
        status = hash > 40 ? `AVAILABLE-${Math.max(2, Math.floor(hash / 4))}` : `WL-${4 + (hash % 5)}`;
        fare = 1480;
      } else if (cls === '1A') {
        status = hash > 50 ? `AVAILABLE-${Math.max(1, Math.floor(hash / 8))}` : `REGRET`;
        fare = 2520;
      } else if (cls === '2S') {
        status = `AVAILABLE-${120 + hash}`;
        fare = 135;
      } else if (cls === 'CC') {
        status = `AVAILABLE-${35 + (hash % 40)}`;
        fare = 680;
      } else if (cls === 'EC') {
        status = `AVAILABLE-${12 + (hash % 10)}`;
        fare = 1320;
      }
    }

    return {
      travelClass: cls,
      status,
      fare,
      quota,
      lastUpdated: now
    };
  });

  return {
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    journeyDate,
    serviceType: train.serviceType,
    classes,
    isSimulated: true,
    statusProvenance: 'TIMETABLE_SIMULATED'
  };
}
