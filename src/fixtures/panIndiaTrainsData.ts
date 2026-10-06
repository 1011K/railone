import { TrainTrip, TrainRunningObservation } from '../types/railway';

/**
 * Authentic Pan-India Indian Railways National Trunk Trains
 * Complements suburban locals with nationwide long-distance, Rajdhani, and Vande Bharat operations.
 */

export const PAN_INDIA_TRAINS: TrainTrip[] = [
  // 1. Mumbai Rajdhani Express (MMCT -> NDLS)
  {
    trainNumber: '12951',
    trainName: 'Mumbai Rajdhani Express',
    hindiName: 'मुंबई राजधानी एक्सप्रेस',
    originStation: 'MMCT',
    destinationStation: 'NDLS',
    serviceType: 'superfast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: 'lhb_express',
    availableClasses: ['1A', '2A', '3A'],
    stops: [
      { stationCode: 'MMCT', stationName: 'Mumbai Central', scheduledArrival: '17:00', scheduledDeparture: '17:00', platform: '1', distanceKm: 0, isHalt: true },
      { stationCode: 'ST', stationName: 'Surat', scheduledArrival: '19:38', scheduledDeparture: '19:43', platform: '1', distanceKm: 263, isHalt: true },
      { stationCode: 'BRC', stationName: 'Vadodara Jn', scheduledArrival: '21:06', scheduledDeparture: '21:16', platform: '2', distanceKm: 392, isHalt: true },
      { stationCode: 'RTM', stationName: 'Ratlam Jn', scheduledArrival: '00:55', scheduledDeparture: '00:58', platform: '5', distanceKm: 653, isHalt: true, dayOffset: 1 },
      { stationCode: 'KOTA', stationName: 'Kota Jn', scheduledArrival: '03:55', scheduledDeparture: '04:00', platform: '1', distanceKm: 920, isHalt: true, dayOffset: 1 },
      { stationCode: 'NDLS', stationName: 'New Delhi', scheduledArrival: '08:32', scheduledDeparture: '08:32', platform: '2', distanceKm: 1386, isHalt: true, dayOffset: 1 }
    ]
  },

  // 2. Howrah Rajdhani Express (HWH -> NDLS via Prayagraj)
  {
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani Express',
    hindiName: 'हावड़ा राजधानी एक्सप्रेस',
    originStation: 'HWH',
    destinationStation: 'NDLS',
    serviceType: 'superfast',
    runningDays: [1, 2, 3, 4, 5, 6],
    rakeType: 'lhb_express',
    availableClasses: ['1A', '2A', '3A'],
    stops: [
      { stationCode: 'HWH', stationName: 'Howrah Jn', scheduledArrival: '16:50', scheduledDeparture: '16:50', platform: '9', distanceKm: 0, isHalt: true },
      { stationCode: 'ASN', stationName: 'Asansol Jn', scheduledArrival: '18:57', scheduledDeparture: '19:00', platform: '4', distanceKm: 200, isHalt: true },
      { stationCode: 'GAYA', stationName: 'Gaya Jn', scheduledArrival: '22:19', scheduledDeparture: '22:22', platform: '1', distanceKm: 459, isHalt: true },
      { stationCode: 'PRYJ', stationName: 'Prayagraj Jn', scheduledArrival: '02:33', scheduledDeparture: '02:35', platform: '1', distanceKm: 809, isHalt: true, dayOffset: 1 },
      { stationCode: 'CNB', stationName: 'Kanpur Central', scheduledArrival: '04:40', scheduledDeparture: '04:45', platform: '1', distanceKm: 1003, isHalt: true, dayOffset: 1 },
      { stationCode: 'NDLS', stationName: 'New Delhi', scheduledArrival: '10:05', scheduledDeparture: '10:05', platform: '5', distanceKm: 1451, isHalt: true, dayOffset: 1 }
    ]
  },

  // 3. Bengaluru Rajdhani Express (SBC -> NDLS)
  {
    trainNumber: '22691',
    trainName: 'Bengaluru Rajdhani Express',
    hindiName: 'बेंगलुरु राजधानी एक्सप्रेस',
    originStation: 'SBC',
    destinationStation: 'NDLS',
    serviceType: 'superfast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: 'lhb_express',
    availableClasses: ['1A', '2A', '3A'],
    stops: [
      { stationCode: 'SBC', stationName: 'KSR Bengaluru', scheduledArrival: '20:00', scheduledDeparture: '20:00', platform: '8', distanceKm: 0, isHalt: true },
      { stationCode: 'SC', stationName: 'Secunderabad Jn', scheduledArrival: '07:05', scheduledDeparture: '07:15', platform: '10', distanceKm: 622, isHalt: true, dayOffset: 1 },
      { stationCode: 'NGP', stationName: 'Nagpur Jn', scheduledArrival: '14:55', scheduledDeparture: '15:00', platform: '1', distanceKm: 1203, isHalt: true, dayOffset: 1 },
      { stationCode: 'BPL', stationName: 'Bhopal Jn', scheduledArrival: '20:50', scheduledDeparture: '21:00', platform: '2', distanceKm: 1593, isHalt: true, dayOffset: 1 },
      { stationCode: 'AGC', stationName: 'Agra Cantt', scheduledArrival: '01:50', scheduledDeparture: '01:52', platform: '1', distanceKm: 2197, isHalt: true, dayOffset: 2 },
      { stationCode: 'NDLS', stationName: 'New Delhi', scheduledArrival: '05:30', scheduledDeparture: '05:30', platform: '7', distanceKm: 2392, isHalt: true, dayOffset: 2 }
    ]
  },

  // 4. Vande Bharat Express (NDLS -> BSB via Kanpur, Prayagraj)
  {
    trainNumber: '22436',
    trainName: 'New Delhi - Varanasi Vande Bharat Express',
    hindiName: 'नई दिल्ली - वाराणसी वंदे भारत एक्सप्रेस',
    originStation: 'NDLS',
    destinationStation: 'BSB',
    serviceType: 'vande_bharat_tejas',
    runningDays: [1, 2, 3, 5, 6],
    rakeType: 'vande_bharat',
    availableClasses: ['CC', 'EC'],
    stops: [
      { stationCode: 'NDLS', stationName: 'New Delhi', scheduledArrival: '06:00', scheduledDeparture: '06:00', platform: '16', distanceKm: 0, isHalt: true },
      { stationCode: 'CNB', stationName: 'Kanpur Central', scheduledArrival: '10:08', scheduledDeparture: '10:10', platform: '1', distanceKm: 440, isHalt: true },
      { stationCode: 'PRYJ', stationName: 'Prayagraj Jn', scheduledArrival: '12:08', scheduledDeparture: '12:10', platform: '6', distanceKm: 635, isHalt: true },
      { stationCode: 'BSB', stationName: 'Varanasi Jn', scheduledArrival: '14:00', scheduledDeparture: '14:00', platform: '1', distanceKm: 759, isHalt: true }
    ]
  },

  // 5. Vande Bharat Express (MMCT -> ADI)
  {
    trainNumber: '20901',
    trainName: 'Mumbai - Gandhinagar Vande Bharat',
    hindiName: 'मुंबई - गांधीनगर वंदे भारत',
    originStation: 'MMCT',
    destinationStation: 'ADI',
    serviceType: 'vande_bharat_tejas',
    runningDays: [1, 2, 3, 4, 5, 6],
    rakeType: 'vande_bharat',
    availableClasses: ['CC', 'EC'],
    stops: [
      { stationCode: 'MMCT', stationName: 'Mumbai Central', scheduledArrival: '06:10', scheduledDeparture: '06:10', platform: '5', distanceKm: 0, isHalt: true },
      { stationCode: 'ST', stationName: 'Surat', scheduledArrival: '08:50', scheduledDeparture: '08:53', platform: '1', distanceKm: 263, isHalt: true },
      { stationCode: 'BRC', stationName: 'Vadodara Jn', scheduledArrival: '09:56', scheduledDeparture: '09:59', platform: '2', distanceKm: 392, isHalt: true },
      { stationCode: 'ADI', stationName: 'Ahmedabad Jn', scheduledArrival: '11:25', scheduledDeparture: '11:25', platform: '1', distanceKm: 492, isHalt: true }
    ]
  },

  // 6. Tamil Nadu Express (MAS -> NDLS)
  {
    trainNumber: '12621',
    trainName: 'Tamil Nadu Express',
    hindiName: 'तमिलनाडु एक्सप्रेस',
    originStation: 'MAS',
    destinationStation: 'NDLS',
    serviceType: 'superfast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: 'lhb_express',
    availableClasses: ['SL', '3A', '2A', '1A'],
    stops: [
      { stationCode: 'MAS', stationName: 'Chennai Central', scheduledArrival: '22:00', scheduledDeparture: '22:00', platform: '4', distanceKm: 0, isHalt: true },
      { stationCode: 'BZA', stationName: 'Vijayawada Jn', scheduledArrival: '04:15', scheduledDeparture: '04:25', platform: '6', distanceKm: 431, isHalt: true, dayOffset: 1 },
      { stationCode: 'NGP', stationName: 'Nagpur Jn', scheduledArrival: '13:50', scheduledDeparture: '13:55', platform: '1', distanceKm: 1093, isHalt: true, dayOffset: 1 },
      { stationCode: 'BPL', stationName: 'Bhopal Jn', scheduledArrival: '19:40', scheduledDeparture: '19:45', platform: '2', distanceKm: 1483, isHalt: true, dayOffset: 1 },
      { stationCode: 'GWL', stationName: 'Gwalior Jn', scheduledArrival: '23:43', scheduledDeparture: '23:45', platform: '4', distanceKm: 1872, isHalt: true, dayOffset: 1 },
      { stationCode: 'AGC', stationName: 'Agra Cantt', scheduledArrival: '01:30', scheduledDeparture: '01:35', platform: '2', distanceKm: 1990, isHalt: true, dayOffset: 2 },
      { stationCode: 'NDLS', stationName: 'New Delhi', scheduledArrival: '06:30', scheduledDeparture: '06:30', platform: '3', distanceKm: 2185, isHalt: true, dayOffset: 2 }
    ]
  },

  // 7. Coromandel Express (HWH -> MAS)
  {
    trainNumber: '12841',
    trainName: 'Coromandel Express',
    hindiName: 'कोरोमंडल एक्सप्रेस',
    originStation: 'HWH',
    destinationStation: 'MAS',
    serviceType: 'superfast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: 'lhb_express',
    availableClasses: ['SL', '3A', '2A', '1A'],
    stops: [
      { stationCode: 'HWH', stationName: 'Howrah Jn', scheduledArrival: '15:20', scheduledDeparture: '15:20', platform: '19', distanceKm: 0, isHalt: true },
      { stationCode: 'BBS', stationName: 'Bhubaneswar', scheduledArrival: '21:50', scheduledDeparture: '21:55', platform: '4', distanceKm: 437, isHalt: true },
      { stationCode: 'BZA', stationName: 'Vijayawada Jn', scheduledArrival: '09:55', scheduledDeparture: '10:05', platform: '1', distanceKm: 1224, isHalt: true, dayOffset: 1 },
      { stationCode: 'MAS', stationName: 'Chennai Central', scheduledArrival: '16:50', scheduledDeparture: '16:50', platform: '5', distanceKm: 1655, isHalt: true, dayOffset: 1 }
    ]
  },

  // 8. Mumbai - Ahmedabad Shatabdi Express (MMCT -> ADI)
  {
    trainNumber: '12009',
    trainName: 'Mumbai - Ahmedabad Shatabdi Express',
    hindiName: 'शताब्दी एक्सप्रेस',
    originStation: 'MMCT',
    destinationStation: 'ADI',
    serviceType: 'superfast',
    runningDays: [1, 2, 3, 4, 5, 6],
    rakeType: 'lhb_express',
    availableClasses: ['CC', 'EC'],
    stops: [
      { stationCode: 'MMCT', stationName: 'Mumbai Central', scheduledArrival: '06:20', scheduledDeparture: '06:20', platform: '1', distanceKm: 0, isHalt: true },
      { stationCode: 'ST', stationName: 'Surat', scheduledArrival: '09:15', scheduledDeparture: '09:18', platform: '1', distanceKm: 263, isHalt: true },
      { stationCode: 'BRC', stationName: 'Vadodara Jn', scheduledArrival: '10:35', scheduledDeparture: '10:40', platform: '3', distanceKm: 392, isHalt: true },
      { stationCode: 'ADI', stationName: 'Ahmedabad Jn', scheduledArrival: '12:45', scheduledDeparture: '12:45', platform: '1', distanceKm: 492, isHalt: true }
    ]
  }
];

export const PAN_INDIA_OBSERVATIONS: Record<string, TrainRunningObservation> = {
  // Mumbai Rajdhani: Running with +6 min nominal delay near Ratlam
  '12951': {
    trainNumber: '12951',
    serviceDate: '2026-10-06',
    currentStationCode: 'RTM',
    lastReportedStationCode: 'BRC',
    lastReportedTimestamp: '01:04',
    hasDepartedOrigin: true,
    actualOriginDeparture: '17:00',
    delayMinutesAtCurrent: 6,
    isCanceled: false,
    disruptionReason: 'Routine freight trailing regulation in Nagda-Ratlam section',
    dataStatus: 'DEMO',
    dataSource: 'CRIS NTES National Feed Stream',
    dataRetrievedAt: '01:05',
    uncertaintyMarginMinutes: 2
  },

  // Howrah Rajdhani: Delayed +48 min between Kanpur and New Delhi due to Northern fog
  '12301': {
    trainNumber: '12301',
    serviceDate: '2026-10-06',
    currentStationCode: 'CNB',
    lastReportedStationCode: 'PRYJ',
    lastReportedTimestamp: '05:28',
    hasDepartedOrigin: true,
    actualOriginDeparture: '16:50',
    delayMinutesAtCurrent: 48,
    isCanceled: false,
    disruptionReason: 'Dense morning fog and low visibility in Indo-Gangetic plains (Speed capped at 60 km/h)',
    dataStatus: 'DEMO',
    dataSource: 'NCR Operations Control Bulletin',
    dataRetrievedAt: '05:30',
    uncertaintyMarginMinutes: 5
  },

  // Bengaluru Rajdhani: Delayed +32 min in Bhopal section due to OHE power trip
  '22691': {
    trainNumber: '22691',
    serviceDate: '2026-10-06',
    currentStationCode: 'BPL',
    lastReportedStationCode: 'NGP',
    lastReportedTimestamp: '21:22',
    hasDepartedOrigin: true,
    actualOriginDeparture: '20:00',
    delayMinutesAtCurrent: 32,
    isCanceled: false,
    disruptionReason: 'Overhead Equipment (OHE) voltage fluctuation and freight train precedence',
    dataStatus: 'DEMO',
    dataSource: 'WCR Control Office Advisory',
    dataRetrievedAt: '21:25',
    uncertaintyMarginMinutes: 4
  },

  // Vande Bharat 22436: Running with +15 min delay near Prayagraj
  '22436': {
    trainNumber: '22436',
    serviceDate: '2026-10-06',
    currentStationCode: 'PRYJ',
    lastReportedStationCode: 'CNB',
    lastReportedTimestamp: '12:23',
    hasDepartedOrigin: true,
    actualOriginDeparture: '06:00',
    delayMinutesAtCurrent: 15,
    isCanceled: false,
    disruptionReason: 'Pilgrim rush traffic control and platform holding at Varanasi approach',
    dataStatus: 'DEMO',
    dataSource: 'NR Live Telemetry',
    dataRetrievedAt: '12:25',
    uncertaintyMarginMinutes: 2
  },

  // Vande Bharat 20901: Running on time (+0 min)
  '20901': {
    trainNumber: '20901',
    serviceDate: '2026-10-06',
    currentStationCode: 'ST',
    lastReportedStationCode: 'MMCT',
    lastReportedTimestamp: '08:50',
    hasDepartedOrigin: true,
    actualOriginDeparture: '06:10',
    delayMinutesAtCurrent: 0,
    isCanceled: false,
    dataStatus: 'DEMO',
    dataSource: 'WR High Speed Telemetry',
    dataRetrievedAt: '08:51',
    uncertaintyMarginMinutes: 0
  },

  // Tamil Nadu Express 12621: Delayed +28 min near Nagpur
  '12621': {
    trainNumber: '12621',
    serviceDate: '2026-10-06',
    currentStationCode: 'NGP',
    lastReportedStationCode: 'BZA',
    lastReportedTimestamp: '14:18',
    hasDepartedOrigin: true,
    actualOriginDeparture: '22:00',
    delayMinutesAtCurrent: 28,
    isCanceled: false,
    disruptionReason: 'Grand Trunk heavy freight movement and signaling upgrade testing',
    dataStatus: 'DEMO',
    dataSource: 'CR Nagpur Central Desk',
    dataRetrievedAt: '14:20',
    uncertaintyMarginMinutes: 3
  },

  // Coromandel Express 12841: Delayed +22 min near Bhubaneswar
  '12841': {
    trainNumber: '12841',
    serviceDate: '2026-10-06',
    currentStationCode: 'BBS',
    lastReportedStationCode: 'HWH',
    lastReportedTimestamp: '22:12',
    hasDepartedOrigin: true,
    actualOriginDeparture: '15:20',
    delayMinutesAtCurrent: 22,
    isCanceled: false,
    disruptionReason: 'Freight coal corridor clearance & suburban EMU line sharing',
    dataStatus: 'DEMO',
    dataSource: 'ECoR Train Control',
    dataRetrievedAt: '22:15',
    uncertaintyMarginMinutes: 3
  },

  // Shatabdi 12009: Running with +3 min minor delay
  '12009': {
    trainNumber: '12009',
    serviceDate: '2026-10-06',
    currentStationCode: 'BRC',
    lastReportedStationCode: 'ST',
    lastReportedTimestamp: '10:38',
    hasDepartedOrigin: true,
    actualOriginDeparture: '06:20',
    delayMinutesAtCurrent: 3,
    isCanceled: false,
    dataStatus: 'DEMO',
    dataSource: 'WR Vadodara Control',
    dataRetrievedAt: '10:40',
    uncertaintyMarginMinutes: 1
  }
};
