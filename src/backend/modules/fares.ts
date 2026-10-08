import { TravelClass } from '../../types/railway';
import { CENTRAL_KM, WESTERN_KM, HARBOUR_KM } from '../../fixtures/railwayData';
import { getAllTrainTrips } from './services';

export interface FareProvenance {
  tariffName: string;
  authority: string;
  effectiveDate: string;
  isOfficialVerified: boolean;
  gazetteRef?: string;
}

export const FARE_PROVENANCE: Record<string, FareProvenance> = {
  mumbai_suburban: {
    tariffName: 'Mumbai Suburban Distance-Slab Passenger Fare Table',
    authority: 'RailOne Next illustrative suburban model; operator validation pending',
    effectiveDate: 'UNVERIFIED',
    isOfficialVerified: false
  },
  mumbai_metro: {
    tariffName: 'Mumbai Metro Fare Matrix (Lines 1, 2A, 7)',
    authority: 'RailOne Next illustrative metro model; operator validation pending',
    effectiveDate: 'UNVERIFIED',
    isOfficialVerified: false
  },
  national_express: {
    tariffName: 'Indian Railways PRS Telescopic Mail/Express Distance Tariff',
    authority: 'RailOne Next illustrative express model; operator validation pending',
    effectiveDate: 'UNVERIFIED',
    isOfficialVerified: false
  },
  unverified_simulation: {
    tariffName: 'Simulated Estimation Model (Non-Verified)',
    authority: 'Synthetic Demonstration Dataset',
    effectiveDate: '2026-10-01',
    isOfficialVerified: false
  }
};

export interface FareBreakdown {
  serviceType: 'suburban' | 'metro' | 'express';
  travelClass: TravelClass;
  baseFare: number;
  reservationCharge: number;
  superfastCharge: number;
  gst: number;
  totalFare: number;
  distanceKm: number;
  tariffNotice: string;
  provenance: FareProvenance;
  effectiveDate: string;
  isOfficialVerified: boolean;
}

/**
 * Official Indian Railways Suburban Fare Structure:
 * - Second Class (II):
 *   <= 10 km: ₹5
 *   11 - 35 km: ₹10
 *   36 - 60 km: ₹15
 *   > 60 km: ₹20
 * - First Class (I):
 *   ~ 10x to 10.5x of Second Class (e.g. 35km is ₹105)
 * - AC Local:
 *   Suburban AC tariff slab (e.g. 35km is ₹95)
 */
export function calculateSuburbanFare(distanceKm: number, travelClass: TravelClass): FareBreakdown {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm) || distanceKm <= 0) {
    throw new Error('Track distance is required to calculate suburban fare. Unknown distances cannot produce a payable fare.');
  }
  const dist = distanceKm;
  let baseFare = 5;

  if (travelClass === 'II' || travelClass === '2S') {
    if (dist <= 10) baseFare = 5;
    else if (dist <= 35) baseFare = 10;
    else if (dist <= 60) baseFare = 15;
    else baseFare = 20;
  } else if (travelClass === 'I') {
    if (dist <= 10) baseFare = 50;
    else if (dist <= 35) baseFare = 105;
    else if (dist <= 60) baseFare = 145;
    else baseFare = 175;
  } else if (travelClass === 'AC_LOCAL') {
    if (dist <= 10) baseFare = 35;
    else if (dist <= 25) baseFare = 65;
    else if (dist <= 35) baseFare = 95;
    else if (dist <= 60) baseFare = 135;
    else baseFare = 180;
  } else {
    baseFare = 10;
  }

  const prov = FARE_PROVENANCE.mumbai_suburban;
  return {
    serviceType: 'suburban',
    travelClass,
    baseFare,
    reservationCharge: 0,
    superfastCharge: 0,
    gst: travelClass === 'AC_LOCAL' || travelClass === 'I' ? Math.round(baseFare * 0.05) : 0,
    totalFare: baseFare, // Official round fares include statutory components
    distanceKm: dist,
    tariffNotice: 'DEMO estimate only: official current fare unverified',
    provenance: prov,
    effectiveDate: prov.effectiveDate,
    isOfficialVerified: prov.isOfficialVerified
  };
}

/**
 * Official Mumbai Metro Fare Structure (MMRDA / MMMOCL / Metro 1 / Metro 2A / Line 7):
 * <= 3 km: ₹10
 * 3 - 12 km: ₹20
 * 12 - 18 km: ₹30
 * 18 - 24 km: ₹40
 * 24 - 30 km: ₹50
 * > 30 km: ₹60
 */
export function calculateMetroFare(distanceKm: number): FareBreakdown {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm) || distanceKm <= 0) {
    throw new Error('Track distance is required to calculate metro fare.');
  }
  const dist = distanceKm;
  let baseFare = 10;

  if (dist <= 3) baseFare = 10;
  else if (dist <= 12) baseFare = 20;
  else if (dist <= 18) baseFare = 30;
  else if (dist <= 18 + 6) baseFare = 40;
  else if (dist <= 30) baseFare = 50;
  else baseFare = 60;

  const prov = FARE_PROVENANCE.mumbai_metro;
  return {
    serviceType: 'metro',
    travelClass: 'II',
    baseFare,
    reservationCharge: 0,
    superfastCharge: 0,
    gst: 0,
    totalFare: baseFare,
    distanceKm: dist,
    tariffNotice: 'DEMO estimate only: each metro operator has its own tariff',
    provenance: prov,
    effectiveDate: prov.effectiveDate,
    isOfficialVerified: prov.isOfficialVerified
  };
}

/**
 * Mail / Express / Superfast distance-based tariffs
 */
export function calculateExpressFare(distanceKm: number, travelClass: TravelClass, isSuperfast = false): FareBreakdown {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm) || distanceKm <= 0) {
    throw new Error('Track distance is required to calculate express fare.');
  }
  const dist = Math.max(50, distanceKm);
  let basePerKm = 0.40;
  let reservationCharge = 20;
  let superfastCharge = isSuperfast ? 30 : 0;

  switch (travelClass) {
    case '2S':
      basePerKm = 0.40;
      reservationCharge = 15;
      break;
    case 'SL':
      basePerKm = 0.60;
      reservationCharge = 20;
      break;
    case 'CC':
      basePerKm = 1.20;
      reservationCharge = 40;
      break;
    case '3A':
      basePerKm = 1.45;
      reservationCharge = 40;
      break;
    case '2A':
      basePerKm = 2.10;
      reservationCharge = 50;
      break;
    case '1A':
      basePerKm = 3.50;
      reservationCharge = 60;
      break;
    case 'EC':
      basePerKm = 3.20;
      reservationCharge = 60;
      break;
    default:
      basePerKm = 0.50;
      reservationCharge = 20;
  }

  const rawBase = Math.round(dist * basePerKm);
  const baseFare = Math.max(rawBase, travelClass === '2S' ? 45 : travelClass === 'SL' ? 140 : 350);
  const gst = ['3A', '2A', '1A', 'CC', 'EC'].includes(travelClass) ? Math.round(baseFare * 0.05) : 0;
  const totalFare = baseFare + reservationCharge + superfastCharge + gst;

  const prov = FARE_PROVENANCE.national_express;
  return {
    serviceType: 'express',
    travelClass,
    baseFare,
    reservationCharge,
    superfastCharge,
    gst,
    totalFare,
    distanceKm: dist,
    tariffNotice: 'DEMO estimate only: not an IRCTC reservation quote',
    provenance: prov,
    effectiveDate: prov.effectiveDate,
    isOfficialVerified: prov.isOfficialVerified
  };
}

export function calculateStationDistance(fromCode: string, toCode: string): number | null {
  const from = (fromCode || '').trim().toUpperCase();
  const to = (toCode || '').trim().toUpperCase();
  if (!from || !to) return null;
  if (from === to) return 0;

  // 1. Direct Central line
  if (CENTRAL_KM[from] !== undefined && CENTRAL_KM[to] !== undefined) {
    return Math.round(Math.abs(CENTRAL_KM[to] - CENTRAL_KM[from]) * 10) / 10;
  }

  // 2. Direct Western line
  if (WESTERN_KM[from] !== undefined && WESTERN_KM[to] !== undefined) {
    return Math.round(Math.abs(WESTERN_KM[to] - WESTERN_KM[from]) * 10) / 10;
  }

  // 3. Direct Harbour line
  if (HARBOUR_KM[from] !== undefined && HARBOUR_KM[to] !== undefined) {
    return Math.round(Math.abs(HARBOUR_KM[to] - HARBOUR_KM[from]) * 10) / 10;
  }

  // 4. Central to Western (via Dadar transfer)
  if (CENTRAL_KM[from] !== undefined && WESTERN_KM[to] !== undefined) {
    const d1 = Math.abs(CENTRAL_KM[from] - CENTRAL_KM['DR']);
    const d2 = Math.abs(WESTERN_KM['DDR'] - WESTERN_KM[to]);
    return Math.round((d1 + d2) * 10) / 10;
  }
  if (WESTERN_KM[from] !== undefined && CENTRAL_KM[to] !== undefined) {
    const d1 = Math.abs(WESTERN_KM[from] - WESTERN_KM['DDR']);
    const d2 = Math.abs(CENTRAL_KM['DR'] - CENTRAL_KM[to]);
    return Math.round((d1 + d2) * 10) / 10;
  }

  // 5. Central to Harbour (via Kurla transfer)
  if (CENTRAL_KM[from] !== undefined && HARBOUR_KM[to] !== undefined) {
    const d1 = Math.abs(CENTRAL_KM[from] - CENTRAL_KM['CLA']);
    const d2 = Math.abs(HARBOUR_KM['CLA'] - HARBOUR_KM[to]);
    return Math.round((d1 + d2) * 10) / 10;
  }
  if (HARBOUR_KM[from] !== undefined && CENTRAL_KM[to] !== undefined) {
    const d1 = Math.abs(HARBOUR_KM[from] - HARBOUR_KM['CLA']);
    const d2 = Math.abs(CENTRAL_KM['CLA'] - CENTRAL_KM[to]);
    return Math.round((d1 + d2) * 10) / 10;
  }

  // 6. National / Pan-India trunk train stops
  const allTrips = getAllTrainTrips();
  for (const t of allTrips) {
    const sFrom = t.stops.find(s => s.stationCode.toUpperCase() === from);
    const sTo = t.stops.find(s => s.stationCode.toUpperCase() === to);
    if (sFrom && sTo) {
      return Math.round(Math.abs(sTo.distanceKm - sFrom.distanceKm) * 10) / 10;
    }
  }

  // Do NOT fall back to 25 km! Unknown distance returns null
  return null;
}

