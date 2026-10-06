import { Station, TrainTrip, TrainRunningObservation, TravelClass } from '../types/railway';

export const STATIONS: Record<string, Station> = {
  // Mumbai Central Line
  CSMT: {
    id: 'CSMT',
    code: 'CSMT',
    name: 'Chhatrapati Shivaji Maharaj Terminus',
    hindiName: 'छत्रपति शिवाजी महाराज टर्मिनस',
    marathiName: 'छत्रपती शिवाजी महाराज टर्मिनस',
    line: 'central',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    isInterchange: true,
    interchangeWalkMinutes: 4,
    aliases: ['cst', 'vt', 'victoria terminus', 'mumbai cst', 'csmt']
  },
  BY: {
    id: 'BY',
    code: 'BY',
    name: 'Byculla',
    hindiName: 'भायखला',
    marathiName: 'भायखळा',
    line: 'central',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4],
    isInterchange: false,
    aliases: ['byculla', 'bhikhala']
  },
  DR: {
    id: 'DR',
    code: 'DR',
    name: 'Dadar (Central)',
    hindiName: 'दादर (मध्य)',
    marathiName: 'दादर (मध्य)',
    line: 'central',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8],
    isInterchange: true,
    interchangeWalkMinutes: 7, // Walking transfer from Central to Western platforms via foot overbridge
    aliases: ['dadar', 'dadar cr', 'dadar central']
  },
  CLA: {
    id: 'CLA',
    code: 'CLA',
    name: 'Kurla',
    hindiName: 'कुर्ला',
    marathiName: 'कुर्ला',
    line: 'central',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8],
    isInterchange: true,
    interchangeWalkMinutes: 5,
    aliases: ['kurla', 'cla']
  },
  GC: {
    id: 'GC',
    code: 'GC',
    name: 'Ghatkopar',
    hindiName: 'घाटकोपर',
    marathiName: 'घाटकोपर',
    line: 'central',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4],
    isInterchange: true, // Metro 1 connection
    interchangeWalkMinutes: 4,
    aliases: ['ghatkopar', 'gc']
  },
  VK: {
    id: 'VK',
    code: 'VK',
    name: 'Vikhroli',
    hindiName: 'विक्रोली',
    marathiName: 'विक्रोळी',
    line: 'central',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4],
    isInterchange: false,
    aliases: ['vikhroli', 'vk']
  },
  BND: {
    id: 'BND',
    code: 'BND',
    name: 'Bhandup',
    hindiName: 'भांडुप',
    marathiName: 'भांडुप',
    line: 'central',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4],
    isInterchange: false,
    aliases: ['bhandup']
  },
  MLND: {
    id: 'MLND',
    code: 'MLND',
    name: 'Mulund',
    hindiName: 'मुलुंड',
    marathiName: 'मुलुंड',
    line: 'central',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4],
    isInterchange: false,
    aliases: ['mulund']
  },
  TNA: {
    id: 'TNA',
    code: 'TNA',
    name: 'Thane',
    hindiName: 'ठाणे',
    marathiName: 'ठाणे',
    line: 'central',
    city: 'Thane',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    isInterchange: true,
    interchangeWalkMinutes: 4,
    aliases: ['thane', 'tna']
  },
  DI: {
    id: 'DI',
    code: 'DI',
    name: 'Dombivli',
    hindiName: 'डोंबिवली',
    marathiName: 'डोंबिवली',
    line: 'central',
    city: 'Dombivli',
    platforms: [1, 2, 3, 4, 5],
    isInterchange: false,
    aliases: ['dombivli', 'dombivali']
  },
  KYN: {
    id: 'KYN',
    code: 'KYN',
    name: 'Kalyan',
    hindiName: 'कल्याण',
    marathiName: 'कल्याण',
    line: 'central',
    city: 'Kalyan',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8],
    isInterchange: true,
    interchangeWalkMinutes: 5,
    aliases: ['kalyan', 'kyn']
  },

  // Western Line
  CCG: {
    id: 'CCG',
    code: 'CCG',
    name: 'Churchgate',
    hindiName: 'चर्चगेट',
    marathiName: 'चर्चगेट',
    line: 'western',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4],
    isInterchange: false,
    aliases: ['churchgate', 'ccg']
  },
  MEL: {
    id: 'MEL',
    code: 'MEL',
    name: 'Marine Lines',
    hindiName: 'मरीन लाइन्स',
    marathiName: 'मरीन लाइन्स',
    line: 'western',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4],
    isInterchange: false,
    aliases: ['marine lines']
  },
  MMCT: {
    id: 'MMCT',
    code: 'MMCT',
    name: 'Mumbai Central (Western)',
    hindiName: 'मुंबई सेंट्रल',
    marathiName: 'मुंबई सेंट्रल',
    line: 'western',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4, 5],
    isInterchange: true,
    interchangeWalkMinutes: 5,
    aliases: ['mumbai central', 'bct', 'mmct']
  },
  DDR: {
    id: 'DDR',
    code: 'DDR',
    name: 'Dadar (Western)',
    hindiName: 'दादर (पश्चिम)',
    marathiName: 'दादर (पश्चिम)',
    line: 'western',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4, 5, 6, 7],
    isInterchange: true,
    interchangeWalkMinutes: 7,
    aliases: ['dadar western', 'dadar wr', 'ddr']
  },
  BA: {
    id: 'BA',
    code: 'BA',
    name: 'Bandra',
    hindiName: 'बांद्रा',
    marathiName: 'वांद्रे',
    line: 'western',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4, 5, 6, 7],
    isInterchange: true,
    interchangeWalkMinutes: 5,
    aliases: ['bandra', 'vandre']
  },
  ADH: {
    id: 'ADH',
    code: 'ADH',
    name: 'Andheri',
    hindiName: 'अंधेरी',
    marathiName: 'अंधेरी',
    line: 'western',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    isInterchange: true,
    interchangeWalkMinutes: 5,
    aliases: ['andheri', 'adh']
  },
  BVI: {
    id: 'BVI',
    code: 'BVI',
    name: 'Borivali',
    hindiName: 'बोरिवली',
    marathiName: 'बोरिवली',
    line: 'western',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    isInterchange: true,
    interchangeWalkMinutes: 4,
    aliases: ['borivali', 'bvi']
  },
  VR: {
    id: 'VR',
    code: 'VR',
    name: 'Virar',
    hindiName: 'विरार',
    marathiName: 'विरार',
    line: 'western',
    city: 'Virar',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8],
    isInterchange: false,
    aliases: ['virar', 'vr']
  },

  // Harbour Line
  VDLR: {
    id: 'VDLR',
    code: 'VDLR',
    name: 'Vadala Road',
    hindiName: 'वडाला रोड',
    marathiName: 'वडाळा रोड',
    line: 'harbour',
    city: 'Mumbai',
    platforms: [1, 2, 3, 4],
    isInterchange: true,
    interchangeWalkMinutes: 3,
    aliases: ['vadala', 'vadala road', 'vdlr']
  },
  VSH: {
    id: 'VSH',
    code: 'VSH',
    name: 'Vashi',
    hindiName: 'वाशी',
    marathiName: 'वाशी',
    line: 'harbour',
    city: 'Navi Mumbai',
    platforms: [1, 2, 3, 4],
    isInterchange: true,
    interchangeWalkMinutes: 3,
    aliases: ['vashi', 'vsh', 'navi mumbai']
  },
  PNVL: {
    id: 'PNVL',
    code: 'PNVL',
    name: 'Panvel',
    hindiName: 'पनवेल',
    marathiName: 'पनवेल',
    line: 'harbour',
    city: 'Navi Mumbai',
    platforms: [1, 2, 3, 4, 5, 6, 7],
    isInterchange: true,
    interchangeWalkMinutes: 4,
    aliases: ['panvel', 'pnvl']
  },

  // National Destination
  PUNE: {
    id: 'PUNE',
    code: 'PUNE',
    name: 'Pune Junction',
    hindiName: 'पुणे जंक्शन',
    marathiName: 'पुणे जंक्शन',
    line: 'national',
    city: 'Pune',
    platforms: [1, 2, 3, 4, 5, 6],
    isInterchange: true,
    aliases: ['pune', 'pune jn']
  },
  MAO: {
    id: 'MAO',
    code: 'MAO',
    name: 'Madgaon Junction (Goa)',
    hindiName: 'मडगांव जंक्शन',
    marathiName: 'मडगाव जंक्शन',
    line: 'national',
    city: 'Goa',
    platforms: [1, 2, 3, 4],
    isInterchange: true,
    aliases: ['madgaon', 'goa', 'margao']
  }
};

/**
 * Stop sequence and distance lookup (Central Main Line km from CSMT)
 */
export const CENTRAL_KM: Record<string, number> = {
  CSMT: 0,
  BY: 4.8,
  DR: 9.0,
  CLA: 15.3,
  GC: 19.3,
  VK: 23.0,
  BND: 26.5,
  MLND: 30.8,
  TNA: 33.6,
  DI: 48.2,
  KYN: 53.5
};

/**
 * Western Line km from CCG
 */
export const WESTERN_KM: Record<string, number> = {
  CCG: 0,
  MEL: 1.4,
  MMCT: 4.3,
  DDR: 10.2,
  BA: 15.1,
  ADH: 21.8,
  BVI: 34.2,
  VR: 60.0
};

/**
 * Harbour Line km from CSMT
 */
export const HARBOUR_KM: Record<string, number> = {
  CSMT: 0,
  VDLR: 9.0,
  CLA: 15.0,
  VSH: 28.5,
  PNVL: 48.9
};

/**
 * Standard Central Suburban Trip Catalog (Realistic Timetables)
 */
export const TRAIN_TRIPS: TrainTrip[] = [
  // 1. Central Fast Local (Morning / Midday) - 95112
  {
    trainNumber: '95112',
    trainName: 'Kalyan - CSMT Fast Local',
    hindiName: 'कल्याण - सीएसएमटी फास्ट लोकल',
    marathiName: 'कल्याण - सीएसएमटी जलद लोकल',
    originStation: 'KYN',
    destinationStation: 'CSMT',
    serviceType: 'suburban_fast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'KYN', stationName: 'Kalyan', scheduledArrival: '10:15', scheduledDeparture: '10:15', platform: '4', distanceKm: 0, isHalt: true },
      { stationCode: 'DI', stationName: 'Dombivli', scheduledArrival: '10:24', scheduledDeparture: '10:25', platform: '3', distanceKm: 5.3, isHalt: true },
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '10:39', scheduledDeparture: '10:40', platform: '5', distanceKm: 19.9, isHalt: true },
      { stationCode: 'GC', stationName: 'Ghatkopar', scheduledArrival: '10:53', scheduledDeparture: '10:54', platform: '4', distanceKm: 34.2, isHalt: true },
      { stationCode: 'CLA', stationName: 'Kurla', scheduledArrival: '10:59', scheduledDeparture: '11:00', platform: '6', distanceKm: 38.2, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '11:08', scheduledDeparture: '11:09', platform: '4', distanceKm: 44.5, isHalt: true },
      { stationCode: 'BY', stationName: 'Byculla', scheduledArrival: '11:16', scheduledDeparture: '11:17', platform: '4', distanceKm: 48.7, isHalt: true },
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '11:25', scheduledDeparture: '11:25', platform: '5', distanceKm: 53.5, isHalt: true }
    ]
  },

  // 2. Central AC Fast Local - 95114 (AC EMU)
  {
    trainNumber: '95114',
    trainName: 'Kalyan - CSMT AC Fast Local',
    hindiName: 'कल्याण - सीएसएमटी एसी फास्ट लोकल',
    marathiName: 'कल्याण - सीएसएमटी एसी जलद लोकल',
    originStation: 'KYN',
    destinationStation: 'CSMT',
    serviceType: 'suburban_ac_fast',
    runningDays: [1, 2, 3, 4, 5], // Weekdays only
    rakeType: '12_car',
    availableClasses: ['AC_LOCAL'],
    stops: [
      { stationCode: 'KYN', stationName: 'Kalyan', scheduledArrival: '10:30', scheduledDeparture: '10:30', platform: '4', distanceKm: 0, isHalt: true },
      { stationCode: 'DI', stationName: 'Dombivli', scheduledArrival: '10:39', scheduledDeparture: '10:40', platform: '3', distanceKm: 5.3, isHalt: true },
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '10:54', scheduledDeparture: '10:55', platform: '5', distanceKm: 19.9, isHalt: true },
      { stationCode: 'GC', stationName: 'Ghatkopar', scheduledArrival: '11:08', scheduledDeparture: '11:09', platform: '4', distanceKm: 34.2, isHalt: true },
      { stationCode: 'CLA', stationName: 'Kurla', scheduledArrival: '11:14', scheduledDeparture: '11:15', platform: '6', distanceKm: 38.2, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '11:23', scheduledDeparture: '11:24', platform: '4', distanceKm: 44.5, isHalt: true },
      { stationCode: 'BY', stationName: 'Byculla', scheduledArrival: '11:31', scheduledDeparture: '11:32', platform: '4', distanceKm: 48.7, isHalt: true },
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '11:40', scheduledDeparture: '11:40', platform: '6', distanceKm: 53.5, isHalt: true }
    ]
  },

  // 3. Central Slow Local (All Stations) - 97045
  {
    trainNumber: '97045',
    trainName: 'Thane - CSMT Slow Local',
    hindiName: 'ठाणे - सीएसएमटी धीमी लोकल',
    marathiName: 'ठाणे - सीएसएमटी धीम्या लोकल',
    originStation: 'TNA',
    destinationStation: 'CSMT',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '10:42', scheduledDeparture: '10:42', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'MLND', stationName: 'Mulund', scheduledArrival: '10:46', scheduledDeparture: '10:47', platform: '1', distanceKm: 2.8, isHalt: true },
      { stationCode: 'BND', stationName: 'Bhandup', scheduledArrival: '10:51', scheduledDeparture: '10:52', platform: '1', distanceKm: 7.1, isHalt: true },
      { stationCode: 'VK', stationName: 'Vikhroli', scheduledArrival: '10:56', scheduledDeparture: '10:57', platform: '1', distanceKm: 10.6, isHalt: true },
      { stationCode: 'GC', stationName: 'Ghatkopar', scheduledArrival: '11:02', scheduledDeparture: '11:03', platform: '1', distanceKm: 14.3, isHalt: true },
      { stationCode: 'CLA', stationName: 'Kurla', scheduledArrival: '11:09', scheduledDeparture: '11:10', platform: '1', distanceKm: 18.3, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '11:20', scheduledDeparture: '11:21', platform: '2', distanceKm: 24.6, isHalt: true },
      { stationCode: 'BY', stationName: 'Byculla', scheduledArrival: '11:28', scheduledDeparture: '11:29', platform: '2', distanceKm: 28.8, isHalt: true },
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '11:36', scheduledDeparture: '11:36', platform: '2', distanceKm: 33.6, isHalt: true }
    ]
  },

  // 4. Central Slow Local (Later service) - 97051
  {
    trainNumber: '97051',
    trainName: 'Kalyan - CSMT Slow Local',
    hindiName: 'कल्याण - सीएसएमटी धीमी लोकल',
    marathiName: 'कल्याण - सीएसएमटी धीम्या लोकल',
    originStation: 'KYN',
    destinationStation: 'CSMT',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'KYN', stationName: 'Kalyan', scheduledArrival: '10:20', scheduledDeparture: '10:20', platform: '1', distanceKm: 0, isHalt: true },
      { stationCode: 'DI', stationName: 'Dombivli', scheduledArrival: '10:31', scheduledDeparture: '10:32', platform: '1', distanceKm: 5.3, isHalt: true },
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '10:50', scheduledDeparture: '10:51', platform: '4', distanceKm: 19.9, isHalt: true },
      { stationCode: 'MLND', stationName: 'Mulund', scheduledArrival: '10:55', scheduledDeparture: '10:56', platform: '1', distanceKm: 22.7, isHalt: true },
      { stationCode: 'BND', stationName: 'Bhandup', scheduledArrival: '11:00', scheduledDeparture: '11:01', platform: '1', distanceKm: 27.0, isHalt: true },
      { stationCode: 'VK', stationName: 'Vikhroli', scheduledArrival: '11:05', scheduledDeparture: '11:06', platform: '1', distanceKm: 30.5, isHalt: true },
      { stationCode: 'GC', stationName: 'Ghatkopar', scheduledArrival: '11:11', scheduledDeparture: '11:12', platform: '1', distanceKm: 34.2, isHalt: true },
      { stationCode: 'CLA', stationName: 'Kurla', scheduledArrival: '11:18', scheduledDeparture: '11:19', platform: '1', distanceKm: 38.2, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '11:29', scheduledDeparture: '11:30', platform: '2', distanceKm: 44.5, isHalt: true },
      { stationCode: 'BY', stationName: 'Byculla', scheduledArrival: '11:37', scheduledDeparture: '11:38', platform: '2', distanceKm: 48.7, isHalt: true },
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '11:45', scheduledDeparture: '11:45', platform: '3', distanceKm: 53.5, isHalt: true }
    ]
  },

  // 5. Western Fast Local - 90234 (Dadar WR to Churchgate)
  {
    trainNumber: '90234',
    trainName: 'Borivali - Churchgate Fast Local',
    hindiName: 'बोरिवली - चर्चगेट फास्ट लोकल',
    marathiName: 'बोरिवली - चर्चगेट जलद लोकल',
    originStation: 'BVI',
    destinationStation: 'CCG',
    serviceType: 'suburban_fast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '15_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'BVI', stationName: 'Borivali', scheduledArrival: '11:05', scheduledDeparture: '11:05', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'ADH', stationName: 'Andheri', scheduledArrival: '11:19', scheduledDeparture: '11:20', platform: '5', distanceKm: 12.4, isHalt: true },
      { stationCode: 'BA', stationName: 'Bandra', scheduledArrival: '11:28', scheduledDeparture: '11:29', platform: '4', distanceKm: 19.1, isHalt: true },
      { stationCode: 'DDR', stationName: 'Dadar (Western)', scheduledArrival: '11:35', scheduledDeparture: '11:36', platform: '4', distanceKm: 24.0, isHalt: true },
      { stationCode: 'MMCT', stationName: 'Mumbai Central', scheduledArrival: '11:42', scheduledDeparture: '11:43', platform: '4', distanceKm: 29.9, isHalt: true },
      { stationCode: 'CCG', stationName: 'Churchgate', scheduledArrival: '11:51', scheduledDeparture: '11:51', platform: '2', distanceKm: 34.2, isHalt: true }
    ]
  },

  // 6. Western AC Local - 90240 (Connecting service at Dadar WR)
  {
    trainNumber: '90240',
    trainName: 'Virar - Churchgate AC Fast Local',
    hindiName: 'विरार - चर्चगेट एसी फास्ट लोकल',
    marathiName: 'विरार - चर्चगेट एसी जलद लोकल',
    originStation: 'VR',
    destinationStation: 'CCG',
    serviceType: 'suburban_ac_fast',
    runningDays: [1, 2, 3, 4, 5],
    rakeType: '12_car',
    availableClasses: ['AC_LOCAL'],
    stops: [
      { stationCode: 'VR', stationName: 'Virar', scheduledArrival: '10:48', scheduledDeparture: '10:48', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'BVI', stationName: 'Borivali', scheduledArrival: '11:20', scheduledDeparture: '11:21', platform: '4', distanceKm: 25.8, isHalt: true },
      { stationCode: 'ADH', stationName: 'Andheri', scheduledArrival: '11:35', scheduledDeparture: '11:36', platform: '5', distanceKm: 38.2, isHalt: true },
      { stationCode: 'BA', stationName: 'Bandra', scheduledArrival: '11:44', scheduledDeparture: '11:45', platform: '4', distanceKm: 44.9, isHalt: true },
      { stationCode: 'DDR', stationName: 'Dadar (Western)', scheduledArrival: '11:51', scheduledDeparture: '11:52', platform: '4', distanceKm: 49.8, isHalt: true },
      { stationCode: 'MMCT', stationName: 'Mumbai Central', scheduledArrival: '11:58', scheduledDeparture: '11:59', platform: '4', distanceKm: 55.7, isHalt: true },
      { stationCode: 'CCG', stationName: 'Churchgate', scheduledArrival: '12:08', scheduledDeparture: '12:08', platform: '3', distanceKm: 60.0, isHalt: true }
    ]
  },

  // 7. Western Slow Local - 90244
  {
    trainNumber: '90244',
    trainName: 'Bandra - Churchgate Slow Local',
    hindiName: 'बांद्रा - चर्चगेट धीमी लोकल',
    marathiName: 'वांद्रे - चर्चगेट धीम्या लोकल',
    originStation: 'BA',
    destinationStation: 'CCG',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'BA', stationName: 'Bandra', scheduledArrival: '11:30', scheduledDeparture: '11:30', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'DDR', stationName: 'Dadar (Western)', scheduledArrival: '11:38', scheduledDeparture: '11:39', platform: '1', distanceKm: 4.9, isHalt: true },
      { stationCode: 'MMCT', stationName: 'Mumbai Central', scheduledArrival: '11:47', scheduledDeparture: '11:48', platform: '2', distanceKm: 10.8, isHalt: true },
      { stationCode: 'MEL', stationName: 'Marine Lines', scheduledArrival: '11:53', scheduledDeparture: '11:54', platform: '2', distanceKm: 13.7, isHalt: true },
      { stationCode: 'CCG', stationName: 'Churchgate', scheduledArrival: '11:58', scheduledDeparture: '11:58', platform: '1', distanceKm: 15.1, isHalt: true }
    ]
  },

  // 8a. National Express Outbound (Dadar to Kalyan): 12123 Deccan Queen Express
  {
    trainNumber: '12123',
    trainName: 'Deccan Queen Express (Down)',
    hindiName: 'डेक्कन क्वीन एक्सप्रेस',
    marathiName: 'डेक्कन क्वीन एक्सप्रेस',
    originStation: 'CSMT',
    destinationStation: 'PUNE',
    serviceType: 'superfast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    availableClasses: ['2S', 'CC'],
    isMSTPermitted: true, // Specifically on Central Railway MST Train List for Dadar-Kalyan section
    mstNotes: 'Permitted for suburban MST holders in designated Second Class coaches ONLY. Not permitted in AC Chair Car.',
    generalCoachesCount: 2,
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '17:10', scheduledDeparture: '17:10', platform: '8', distanceKm: 0, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '17:23', scheduledDeparture: '17:25', platform: '6', distanceKm: 9.0, isHalt: true },
      { stationCode: 'KYN', stationName: 'Kalyan', scheduledArrival: '18:08', scheduledDeparture: '18:10', platform: '5', distanceKm: 53.5, isHalt: true },
      { stationCode: 'PUNE', stationName: 'Pune Junction', scheduledArrival: '20:25', scheduledDeparture: '20:25', platform: '5', distanceKm: 191.5, isHalt: true }
    ]
  },

  // 8b. National Express Inbound (Kalyan to Dadar): 12124 Deccan Queen Express
  {
    trainNumber: '12124',
    trainName: 'Deccan Queen Express (Up)',
    hindiName: 'डेक्कन क्वीन एक्सप्रेस',
    marathiName: 'डेक्कन क्वीन एक्सप्रेस',
    originStation: 'PUNE',
    destinationStation: 'CSMT',
    serviceType: 'superfast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    availableClasses: ['2S', 'CC'],
    isMSTPermitted: true, // Specifically on Central Railway MST Train List for Dadar-Kalyan section
    mstNotes: 'Permitted for suburban MST holders in designated Second Class coaches ONLY. Not permitted in AC Chair Car.',
    generalCoachesCount: 2,
    stops: [
      { stationCode: 'PUNE', stationName: 'Pune Junction', scheduledArrival: '07:15', scheduledDeparture: '07:15', platform: '5', distanceKm: 0, isHalt: true },
      { stationCode: 'KYN', stationName: 'Kalyan', scheduledArrival: '09:43', scheduledDeparture: '09:45', platform: '7', distanceKm: 138.0, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '10:23', scheduledDeparture: '10:25', platform: '6', distanceKm: 182.5, isHalt: true },
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '10:45', scheduledDeparture: '10:45', platform: '9', distanceKm: 191.5, isHalt: true }
    ]
  },

  // 9. National Express NON-MST (NOT permitted for suburban short hops without full PRS ticket): 11020 Konark Express
  {
    trainNumber: '11020',
    trainName: 'Konark Express',
    hindiName: 'कोणार्क एक्सप्रेस',
    marathiName: 'कोणार्क एक्सप्रेस',
    originStation: 'CSMT',
    destinationStation: 'KYN', // Segment under evaluation
    serviceType: 'mail_express',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    availableClasses: ['2S', 'SL', '3A', '2A'],
    isMSTPermitted: false, // NOT on Central Railway suburban MST list! Short-hop suburban boarding prohibited!
    mstNotes: 'Strictly prohibited for suburban MST and suburban unreserved tickets. Requires PRS Mail/Express reserved/unreserved ticket with minimum distance rule (50km).',
    generalCoachesCount: 2,
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '14:00', scheduledDeparture: '14:00', platform: '14', distanceKm: 0, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '14:12', scheduledDeparture: '14:15', platform: '5', distanceKm: 9.0, isHalt: true },
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '14:38', scheduledDeparture: '14:40', platform: '5', distanceKm: 33.6, isHalt: true },
      { stationCode: 'KYN', stationName: 'Kalyan', scheduledArrival: '15:02', scheduledDeparture: '15:05', platform: '4', distanceKm: 53.5, isHalt: true }
    ]
  },

  // 10. Premium Express: 22119 Mumbai CSMT - Madgaon Tejas Express
  {
    trainNumber: '22119',
    trainName: 'Tejas Express',
    hindiName: 'तेजस एक्सप्रेस',
    marathiName: 'तेजस एक्सप्रेस',
    originStation: 'CSMT',
    destinationStation: 'MAO',
    serviceType: 'vande_bharat_tejas',
    runningDays: [1, 3, 5, 6], // Tue, Thu, Sat, Sun
    availableClasses: ['CC', 'EC'],
    isMSTPermitted: false,
    mstNotes: 'Premium train with dynamic pricing. No unreserved or season tickets permitted.',
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '05:50', scheduledDeparture: '05:50', platform: '18', distanceKm: 0, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '06:00', scheduledDeparture: '06:02', platform: '8', distanceKm: 9.0, isHalt: true },
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '06:23', scheduledDeparture: '06:25', platform: '7', distanceKm: 33.6, isHalt: true },
      { stationCode: 'MAO', stationName: 'Madgaon (Goa)', scheduledArrival: '14:40', scheduledDeparture: '14:40', platform: '1', distanceKm: 579.0, isHalt: true }
    ]
  },

  // 11. Harbour Line Inbound: 98042 Panvel - CSMT Local
  {
    trainNumber: '98042',
    trainName: 'Panvel - CSMT Harbour Local',
    hindiName: 'पनवेल - सीएसएमटी हार्बर लोकल',
    marathiName: 'पनवेल - सीएसएमटी हार्बर लोकल',
    originStation: 'PNVL',
    destinationStation: 'CSMT',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'PNVL', stationName: 'Panvel', scheduledArrival: '10:10', scheduledDeparture: '10:10', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'VSH', stationName: 'Vashi', scheduledArrival: '10:35', scheduledDeparture: '10:36', platform: '2', distanceKm: 28.5, isHalt: true },
      { stationCode: 'CLA', stationName: 'Kurla (Harbour)', scheduledArrival: '10:52', scheduledDeparture: '10:53', platform: '7', distanceKm: 38.0, isHalt: true },
      { stationCode: 'VDLR', stationName: 'Vadala Road', scheduledArrival: '11:04', scheduledDeparture: '11:05', platform: '2', distanceKm: 42.0, isHalt: true },
      { stationCode: 'CSMT', stationName: 'CSMT (Harbour)', scheduledArrival: '11:22', scheduledDeparture: '11:22', platform: '1', distanceKm: 48.9, isHalt: true }
    ]
  },

  // 12. Harbour Line Outbound: 98055 CSMT - Panvel Local
  {
    trainNumber: '98055',
    trainName: 'CSMT - Panvel Harbour Local',
    hindiName: 'सीएसएमटी - पनवेल हार्बर लोकल',
    marathiName: 'सीएसएमटी - पनवेल हार्बर लोकल',
    originStation: 'CSMT',
    destinationStation: 'PNVL',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT (Harbour)', scheduledArrival: '10:45', scheduledDeparture: '10:45', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'VDLR', stationName: 'Vadala Road', scheduledArrival: '11:02', scheduledDeparture: '11:03', platform: '3', distanceKm: 6.9, isHalt: true },
      { stationCode: 'CLA', stationName: 'Kurla (Harbour)', scheduledArrival: '11:14', scheduledDeparture: '11:15', platform: '8', distanceKm: 10.9, isHalt: true },
      { stationCode: 'VSH', stationName: 'Vashi', scheduledArrival: '11:31', scheduledDeparture: '11:32', platform: '1', distanceKm: 20.4, isHalt: true },
      { stationCode: 'PNVL', stationName: 'Panvel', scheduledArrival: '11:58', scheduledDeparture: '11:58', platform: '3', distanceKm: 48.9, isHalt: true }
    ]
  },

  // 13. National Overnight Express: 11058 Amritsar - CSMT Express (Midnight crossing scenario)
  {
    trainNumber: '11058',
    trainName: 'Amritsar - CSMT Express',
    hindiName: 'अमृतसर - सीएसएमटी एक्सप्रेस',
    marathiName: 'अमृतसर - सीएसएमटी एक्सप्रेस',
    originStation: 'KYN', // Intercity service calling post-midnight in Mumbai section
    destinationStation: 'CSMT',
    serviceType: 'mail_express',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    availableClasses: ['2S', 'SL', '3A', '2A'],
    isMSTPermitted: false,
    mstNotes: 'National long-distance service originating yesterday night (22:30). Crosses midnight into day 1 for Mumbai section.',
    stops: [
      { stationCode: 'KYN', stationName: 'Kalyan', scheduledArrival: '00:50', scheduledDeparture: '00:53', platform: '6', distanceKm: 0, isHalt: true, dayOffset: 1 },
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '01:15', scheduledDeparture: '01:18', platform: '6', distanceKm: 19.9, isHalt: true, dayOffset: 1 },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '01:42', scheduledDeparture: '01:45', platform: '6', distanceKm: 44.5, isHalt: true, dayOffset: 1 },
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '02:10', scheduledDeparture: '02:10', platform: '11', distanceKm: 53.5, isHalt: true, dayOffset: 1 }
    ]
  },

  // 14. National Superfast: 12134 Mangalore - CSMT Superfast (Downstream Compounding Delay Scenario)
  {
    trainNumber: '12134',
    trainName: 'Mangalore - CSMT Superfast Express',
    hindiName: 'मंगलौर - सीएसएमटी सुपरफास्ट',
    marathiName: 'मंगळूर - सीएसएमटी सुपरफास्ट',
    originStation: 'PNVL',
    destinationStation: 'CSMT',
    serviceType: 'superfast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    availableClasses: ['2S', 'SL', '3A', '2A'],
    isMSTPermitted: false,
    stops: [
      { stationCode: 'PNVL', stationName: 'Panvel', scheduledArrival: '09:40', scheduledDeparture: '09:43', platform: '6', distanceKm: 0, isHalt: true },
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '10:20', scheduledDeparture: '10:23', platform: '7', distanceKm: 33.6, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '10:48', scheduledDeparture: '10:50', platform: '7', distanceKm: 58.2, isHalt: true },
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '11:15', scheduledDeparture: '11:15', platform: '12', distanceKm: 67.2, isHalt: true }
    ]
  },

  // 15. Western Fast Local: 90238 (Cancelled connecting service scenario)
  {
    trainNumber: '90238',
    trainName: 'Borivali - Churchgate Fast Local (Cancelled)',
    hindiName: 'बोरिवली - चर्चगेट फास्ट लोकल (रद्द)',
    marathiName: 'बोरिवली - चर्चगेट जलद लोकल (रद्द)',
    originStation: 'BVI',
    destinationStation: 'CCG',
    serviceType: 'suburban_fast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'BVI', stationName: 'Borivali', scheduledArrival: '11:10', scheduledDeparture: '11:10', platform: '4', distanceKm: 0, isHalt: true },
      { stationCode: 'ADH', stationName: 'Andheri', scheduledArrival: '11:24', scheduledDeparture: '11:25', platform: '5', distanceKm: 12.4, isHalt: true },
      { stationCode: 'BA', stationName: 'Bandra', scheduledArrival: '11:33', scheduledDeparture: '11:34', platform: '4', distanceKm: 19.1, isHalt: true },
      { stationCode: 'DDR', stationName: 'Dadar (Western)', scheduledArrival: '11:40', scheduledDeparture: '11:41', platform: '4', distanceKm: 24.0, isHalt: true },
      { stationCode: 'MMCT', stationName: 'Mumbai Central', scheduledArrival: '11:48', scheduledDeparture: '11:49', platform: '4', distanceKm: 29.9, isHalt: true },
      { stationCode: 'CCG', stationName: 'Churchgate', scheduledArrival: '11:57', scheduledDeparture: '11:57', platform: '2', distanceKm: 34.2, isHalt: true }
    ]
  }
];

/**
 * Baseline Real-Time Scenario Observations
 * Deterministic scenario fixtures modeling realistic delays, downstream accumulations, and disruptions.
 */
export const INITIAL_OBSERVATIONS: Record<string, TrainRunningObservation> = {
  // Scenario: Kalyan - CSMT Fast Local 95112 has compounding delay (+22 min at Kurla)
  '95112': {
    trainNumber: '95112',
    serviceDate: '2026-10-06',
    currentStationCode: 'CLA',
    lastReportedStationCode: 'GC',
    lastReportedTimestamp: '11:15',
    hasDepartedOrigin: true,
    actualOriginDeparture: '10:28', // Left Kalyan 13 min late
    delayMinutesAtCurrent: 22,      // Accumulated 22 min delay at Kurla due to signal bunching
    isCanceled: false,
    disruptionReason: 'Signal failure between Vidyavihar and Kurla (Down & Up Through tracks held)',
    dataStatus: 'DEMO',
    dataSource: 'CRIS NTES Suburban Simulation Fixture #A12',
    dataRetrievedAt: '11:16',
    uncertaintyMarginMinutes: 4
  },

  // Scenario: AC Fast Local 95114 has NOT departed origin yet (Scheduled 10:30, still waiting for rake)
  '95114': {
    trainNumber: '95114',
    serviceDate: '2026-10-06',
    currentStationCode: 'KYN',
    lastReportedStationCode: 'KYN',
    lastReportedTimestamp: '10:35',
    hasDepartedOrigin: false, // NOT departed origin yet!
    delayMinutesAtCurrent: 18,
    isCanceled: false,
    disruptionReason: 'Inbound rake delayed at Kalyan yard for AC motor unit inspection',
    dataStatus: 'DEMO',
    dataSource: 'CRIS NTES Suburban Simulation Fixture #A14',
    dataRetrievedAt: '10:36',
    uncertaintyMarginMinutes: 6
  },

  // Scenario: Slow Local 97045 running on time (+2 min minor delay, unaffected by fast-track signal block)
  '97045': {
    trainNumber: '97045',
    serviceDate: '2026-10-06',
    currentStationCode: 'GC',
    lastReportedStationCode: 'VK',
    lastReportedTimestamp: '11:03',
    hasDepartedOrigin: true,
    actualOriginDeparture: '10:44',
    delayMinutesAtCurrent: 2, // Running virtually on time on slow corridor!
    isCanceled: false,
    dataStatus: 'DEMO',
    dataSource: 'CRIS NTES Suburban Simulation Fixture #B01',
    dataRetrievedAt: '11:04',
    uncertaintyMarginMinutes: 1
  },

  // Western Line Fast Local 90234 running with +3 min normal delay
  '90234': {
    trainNumber: '90234',
    serviceDate: '2026-10-06',
    currentStationCode: 'BA',
    lastReportedStationCode: 'ADH',
    lastReportedTimestamp: '11:31',
    hasDepartedOrigin: true,
    actualOriginDeparture: '11:06',
    delayMinutesAtCurrent: 3,
    isCanceled: false,
    dataStatus: 'DEMO',
    dataSource: 'WR Suburban Controller Fixture',
    dataRetrievedAt: '11:32',
    uncertaintyMarginMinutes: 2
  },

  // Western Line AC Local 90240 running with +5 min delay
  '90240': {
    trainNumber: '90240',
    serviceDate: '2026-10-06',
    currentStationCode: 'ADH',
    lastReportedStationCode: 'BVI',
    lastReportedTimestamp: '11:39',
    hasDepartedOrigin: true,
    actualOriginDeparture: '10:52',
    delayMinutesAtCurrent: 5,
    isCanceled: false,
    dataStatus: 'DEMO',
    dataSource: 'WR Suburban Controller Fixture',
    dataRetrievedAt: '11:40',
    uncertaintyMarginMinutes: 3
  },

  // Deccan Queen 12124 running on time
  '12124': {
    trainNumber: '12124',
    serviceDate: '2026-10-06',
    currentStationCode: 'KYN',
    lastReportedStationCode: 'KYN',
    lastReportedTimestamp: '09:44',
    hasDepartedOrigin: true,
    actualOriginDeparture: '07:15',
    delayMinutesAtCurrent: 0,
    isCanceled: false,
    dataStatus: 'DEMO',
    dataSource: 'CRIS NTES National Feed Simulator',
    dataRetrievedAt: '09:45',
    uncertaintyMarginMinutes: 2
  },

  // Tejas Express 22119 heavy delay scenario (+75 min)
  '22119': {
    trainNumber: '22119',
    serviceDate: '2026-10-06',
    currentStationCode: 'TNA',
    lastReportedStationCode: 'DR',
    lastReportedTimestamp: '07:35',
    hasDepartedOrigin: true,
    actualOriginDeparture: '06:55',
    delayMinutesAtCurrent: 72,
    isCanceled: false,
    disruptionReason: 'Overhead equipment (OHE) trip between Dadar and Kurla',
    dataStatus: 'DEMO',
    dataSource: 'CRIS NTES National Feed Simulator',
    dataRetrievedAt: '07:36',
    uncertaintyMarginMinutes: 10
  },

  // Harbour Line Panvel - CSMT 98042
  '98042': {
    trainNumber: '98042',
    serviceDate: '2026-10-06',
    currentStationCode: 'VSH',
    lastReportedStationCode: 'PNVL',
    lastReportedTimestamp: '10:36',
    hasDepartedOrigin: true,
    actualOriginDeparture: '10:10',
    delayMinutesAtCurrent: 1,
    isCanceled: false,
    dataStatus: 'DEMO',
    dataSource: 'CR Harbour Controller Feed Simulator',
    dataRetrievedAt: '10:37',
    uncertaintyMarginMinutes: 1
  },

  // 11058 Amritsar Express (Originating yesterday 22:30, boarding post-midnight today)
  '11058': {
    trainNumber: '11058',
    serviceDate: '2026-10-05', // Origin service date is yesterday
    currentStationCode: 'KYN',
    lastReportedStationCode: 'KYN',
    lastReportedTimestamp: '00:52',
    hasDepartedOrigin: true,
    actualOriginDeparture: '22:30',
    delayMinutesAtCurrent: 0,
    isCanceled: false,
    disruptionReason: 'Operating on published overnight schedule crossing midnight into Day 1',
    dataStatus: 'DEMO',
    dataSource: 'CR Overnight Express Movement Feed',
    dataRetrievedAt: '00:53',
    uncertaintyMarginMinutes: 2
  },

  // 12134 Mangalore - CSMT Superfast (Origin delay +20 min accumulates to +40 min downstream)
  '12134': {
    trainNumber: '12134',
    serviceDate: '2026-10-06',
    currentStationCode: 'PNVL',
    lastReportedStationCode: 'PNVL',
    lastReportedTimestamp: '10:00',
    hasDepartedOrigin: true,
    actualOriginDeparture: '10:00', // Departed PNVL 20 min late
    delayMinutesAtCurrent: 20,
    isCanceled: false,
    disruptionReason: 'Freight movement bottleneck with compounding downstream congestion (+20m at PNVL grows to +40m at CSMT)',
    dataStatus: 'DEMO',
    dataSource: 'CR Control Office Delayed Progression Model',
    dataRetrievedAt: '10:01',
    uncertaintyMarginMinutes: 5
  },

  // 90238 Borivali - Churchgate Fast Local (Cancelled connection)
  '90238': {
    trainNumber: '90238',
    serviceDate: '2026-10-06',
    currentStationCode: 'BVI',
    lastReportedStationCode: 'BVI',
    lastReportedTimestamp: '11:00',
    hasDepartedOrigin: false,
    delayMinutesAtCurrent: 0,
    isCanceled: true,
    disruptionReason: 'Cancelled due to emergency track maintenance mega-block at Dadar Western yard',
    dataStatus: 'DEMO',
    dataSource: 'WR Operations Control Room Advisory',
    dataRetrievedAt: '11:01',
    uncertaintyMarginMinutes: 0
  }
};

/**
 * Accurate Mumbai Suburban Fare Rules (Distance Slab Based, CRIS/Indian Railways official)
 */
export function calculateSuburbanFare(distanceKm: number, travelClass: TravelClass): number {
  if (travelClass === 'II') {
    // Second Class Single Journey (₹5 up to 10km, ₹10 up to 35km, ₹15 up to 55km, ₹20 beyond)
    if (distanceKm <= 10) return 5;
    if (distanceKm <= 35) return 10;
    if (distanceKm <= 55) return 15;
    return 20;
  }
  if (travelClass === 'I') {
    // First Class Single Journey
    if (distanceKm <= 10) return 50;
    if (distanceKm <= 20) return 85;
    if (distanceKm <= 35) return 105;
    if (distanceKm <= 50) return 140;
    return 165;
  }
  if (travelClass === 'AC_LOCAL') {
    // AC Local Single Journey (Revised 2022 CRIS slab)
    if (distanceKm <= 10) return 35;
    if (distanceKm <= 20) return 65;
    if (distanceKm <= 35) return 95;
    if (distanceKm <= 50) return 135;
    return 180;
  }
  if (travelClass === '2S') {
    // Unreserved / 2S Mail/Express base fare (Min distance slab 50km = ₹30 + superfast surcharge ₹15 if SF)
    return Math.max(30, Math.round(distanceKm * 0.45 + 15));
  }
  if (travelClass === 'CC') {
    return Math.max(120, Math.round(distanceKm * 1.8 + 40));
  }
  if (travelClass === 'EC') {
    return Math.max(250, Math.round(distanceKm * 3.5 + 80));
  }
  return 10;
}
