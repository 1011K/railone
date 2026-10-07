import { TravelClass } from '../../types/railway';

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
  const dist = Math.max(1, distanceKm);
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

  return {
    serviceType: 'suburban',
    travelClass,
    baseFare,
    reservationCharge: 0,
    superfastCharge: 0,
    gst: travelClass === 'AC_LOCAL' || travelClass === 'I' ? Math.round(baseFare * 0.05) : 0,
    totalFare: baseFare, // Official round fares include statutory components
    distanceKm: dist,
    tariffNotice: 'Official Railway Suburban Tariff (Distance-Slab Regulated)'
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
  const dist = Math.max(1, distanceKm);
  let baseFare = 10;

  if (dist <= 3) baseFare = 10;
  else if (dist <= 12) baseFare = 20;
  else if (dist <= 18) baseFare = 30;
  else if (dist <= 18 + 6) baseFare = 40;
  else if (dist <= 30) baseFare = 50;
  else baseFare = 60;

  return {
    serviceType: 'metro',
    travelClass: 'II',
    baseFare,
    reservationCharge: 0,
    superfastCharge: 0,
    gst: 0,
    totalFare: baseFare,
    distanceKm: dist,
    tariffNotice: 'Official Mumbai Metro Distance-Slab Tariff'
  };
}

/**
 * Mail / Express / Superfast distance-based tariffs
 */
export function calculateExpressFare(distanceKm: number, travelClass: TravelClass, isSuperfast = false): FareBreakdown {
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

  return {
    serviceType: 'express',
    travelClass,
    baseFare,
    reservationCharge,
    superfastCharge,
    gst,
    totalFare,
    distanceKm: dist,
    tariffNotice: 'IRCTC / PRS Telescopic Mail/Express Distance Tariff'
  };
}
