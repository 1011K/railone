/**
 * Mumbai Metro Network Data Specification (MMRDA / MMMOCL / MMRC Official Line Routing)
 * Operating Lines:
 * - Line 1 (Blue Line): Versova - Andheri - Ghatkopar
 * - Line 2A (Yellow Line): Dahisar East - D.N. Nagar (Andheri West)
 * - Line 7 (Red Line): Dahisar East - Gundavali (Andheri East)
 * - Line 3 (Aqua Line Phase 1): Aarey JVLR - BKC
 */

export interface MetroStation {
  id: string;
  code: string;
  name: string;
  hindiName: string;
  marathiName: string;
  lineId: 'line1' | 'line2a' | 'line7' | 'line3';
  lineColor: string;
  lineName: string;
  sequence: number;
  latitude: number;
  longitude: number;
  x: number; // SVG canvas coordinate
  y: number; // SVG canvas coordinate
  isInterchange: boolean;
  interchangeWith: Array<{
    targetCode: string;
    targetName: string;
    networkType: 'metro' | 'suburban';
    walkTimeMinutes: number;
    walkwayType: 'skywalk' | 'footbridge' | 'subway' | 'surface';
    isAccessible: boolean;
  }>;
  facilities: string[];
}

export interface MetroLine {
  id: 'line1' | 'line2a' | 'line7' | 'line3';
  name: string;
  hindiName: string;
  marathiName: string;
  colorHex: string;
  operator: string;
  operationalHours: string;
  headwayPeakMinutes: number;
  headwayOffPeakMinutes: number;
  totalLengthKm: number;
  stationCodes: string[];
}

export const METRO_LINES: Record<string, MetroLine> = {
  line1: {
    id: 'line1',
    name: 'Metro Line 1 (Blue Line)',
    hindiName: 'मेट्रो लाइन १ (ब्लू लाइन)',
    marathiName: 'मेट्रो मार्गिका १ (ब्लू लाईन)',
    colorHex: '#0284c7',
    operator: 'Mumbai Metro One Pvt Ltd (MMOPL / Reliance Infra)',
    operationalHours: '05:30 - 23:30',
    headwayPeakMinutes: 4,
    headwayOffPeakMinutes: 8,
    totalLengthKm: 11.4,
    stationCodes: [
      'METRO_VER', 'METRO_DNN', 'METRO_AZD', 'METRO_ADH', 'METRO_WEH',
      'METRO_CKL', 'METRO_AIR', 'METRO_MRL', 'METRO_SKN', 'METRO_ASL',
      'METRO_JGT', 'METRO_GHT'
    ]
  },
  line2a: {
    id: 'line2a',
    name: 'Metro Line 2A (Yellow Line)',
    hindiName: 'मेट्रो लाइन २A (येलो लाइन)',
    marathiName: 'मेट्रो मार्गिका २A (यलो लाईन)',
    colorHex: '#eab308',
    operator: 'Maha Mumbai Metro (MMMOCL)',
    operationalHours: '06:00 - 23:00',
    headwayPeakMinutes: 6,
    headwayOffPeakMinutes: 10,
    totalLengthKm: 18.6,
    stationCodes: [
      'METRO_DHE', 'METRO_UPD', 'METRO_KND', 'METRO_MDP', 'METRO_EKR',
      'METRO_BVW', 'METRO_PHE', 'METRO_KVW', 'METRO_DHN', 'METRO_VLN',
      'METRO_MLW', 'METRO_LML', 'METRO_PHG', 'METRO_GOW', 'METRO_OSH',
      'METRO_LOS', 'METRO_DNN'
    ]
  },
  line7: {
    id: 'line7',
    name: 'Metro Line 7 (Red Line)',
    hindiName: 'मेट्रो लाइन ७ (रेड लाइन)',
    marathiName: 'मेट्रो मार्गिका ७ (रेड लाईन)',
    colorHex: '#ef4444',
    operator: 'Maha Mumbai Metro (MMMOCL)',
    operationalHours: '06:00 - 23:00',
    headwayPeakMinutes: 6,
    headwayOffPeakMinutes: 10,
    totalLengthKm: 16.5,
    stationCodes: [
      'METRO_DHE', 'METRO_OVR', 'METRO_NPK', 'METRO_DVP', 'METRO_MGT',
      'METRO_PSR', 'METRO_AKR', 'METRO_KRR', 'METRO_DND', 'METRO_ARY',
      'METRO_GOE', 'METRO_JGE', 'METRO_MGR', 'METRO_GDV'
    ]
  },
  line3: {
    id: 'line3',
    name: 'Metro Line 3 (Aqua Line Underground)',
    hindiName: 'मेट्रो लाइन ३ (एक्वा लाइन)',
    marathiName: 'मेट्रो मार्गिका ३ (अ‍ॅक्वा लाईन)',
    colorHex: '#0d9488',
    operator: 'Mumbai Metro Rail Corporation (MMRC)',
    operationalHours: '06:30 - 22:30',
    headwayPeakMinutes: 6,
    headwayOffPeakMinutes: 10,
    totalLengthKm: 12.4,
    stationCodes: [
      'METRO_ARY_3', 'METRO_SPZ', 'METRO_MDC', 'METRO_MRL', 'METRO_CSMIA2',
      'METRO_SHR', 'METRO_CSMIA1', 'METRO_STZ', 'METRO_BDC', 'METRO_BKC'
    ]
  }
};

export const METRO_STATIONS: Record<string, MetroStation> = {
  // Line 1 Stations (Versova to Ghatkopar)
  METRO_VER: {
    id: 'METRO_VER',
    code: 'METRO_VER',
    name: 'Versova',
    hindiName: 'वर्सोवा',
    marathiName: 'वर्सोवा',
    lineId: 'line1',
    lineColor: '#0284c7',
    lineName: 'Line 1',
    sequence: 1,
    latitude: 19.1319,
    longitude: 72.8188,
    x: 180,
    y: 430,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Escalator', 'CCTV', 'First Aid', 'Restroom', 'Ticketing Kiosk']
  },
  METRO_DNN: {
    id: 'METRO_DNN',
    code: 'METRO_DNN',
    name: 'D.N. Nagar',
    hindiName: 'डी.एन. नगर',
    marathiName: 'डी.एन. नगर',
    lineId: 'line1',
    lineColor: '#0284c7',
    lineName: 'Line 1',
    sequence: 2,
    latitude: 19.1256,
    longitude: 72.8315,
    x: 210,
    y: 430,
    isInterchange: true,
    interchangeWith: [
      {
        targetCode: 'METRO_DNN',
        targetName: 'Line 2A Andheri West',
        networkType: 'metro',
        walkTimeMinutes: 3,
        walkwayType: 'footbridge',
        isAccessible: true
      }
    ],
    facilities: ['Elevator', 'Escalator', 'CCTV', 'NCMC Card Reader', 'Interchange Concourse']
  },
  METRO_AZD: {
    id: 'METRO_AZD',
    code: 'METRO_AZD',
    name: 'Azad Nagar',
    hindiName: 'आजाद नगर',
    marathiName: 'आझाद नगर',
    lineId: 'line1',
    lineColor: '#0284c7',
    lineName: 'Line 1',
    sequence: 3,
    latitude: 19.1250,
    longitude: 72.8398,
    x: 240,
    y: 430,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Escalator', 'CCTV']
  },
  METRO_ADH: {
    id: 'METRO_ADH',
    code: 'METRO_ADH',
    name: 'Andheri Metro',
    hindiName: 'अंधेरी मेट्रो',
    marathiName: 'अंधेरी मेट्रो',
    lineId: 'line1',
    lineColor: '#0284c7',
    lineName: 'Line 1',
    sequence: 4,
    latitude: 19.1197,
    longitude: 72.8464,
    x: 275,
    y: 430,
    isInterchange: true,
    interchangeWith: [
      {
        targetCode: 'ADH',
        targetName: 'Andheri (Western & Harbour Railway)',
        networkType: 'suburban',
        walkTimeMinutes: 4,
        walkwayType: 'skywalk',
        isAccessible: true
      }
    ],
    facilities: ['Elevator', 'Escalator', 'Direct Suburban Skywalk', 'NCMC Card Reader', 'Security Post']
  },
  METRO_WEH: {
    id: 'METRO_WEH',
    code: 'METRO_WEH',
    name: 'Western Express Highway',
    hindiName: 'वेस्टर्न एक्सप्रेस हाईवे',
    marathiName: 'वेस्टर्न एक्सप्रेस हायवे',
    lineId: 'line1',
    lineColor: '#0284c7',
    lineName: 'Line 1',
    sequence: 5,
    latitude: 19.1158,
    longitude: 72.8566,
    x: 320,
    y: 430,
    isInterchange: true,
    interchangeWith: [
      {
        targetCode: 'METRO_GDV',
        targetName: 'Gundavali (Metro Line 7)',
        networkType: 'metro',
        walkTimeMinutes: 3,
        walkwayType: 'footbridge',
        isAccessible: true
      }
    ],
    facilities: ['Elevator', 'Escalator', 'Interchange Footbridge to Line 7', 'CCTV']
  },
  METRO_CKL: {
    id: 'METRO_CKL',
    code: 'METRO_CKL',
    name: 'Chakala (J.B. Nagar)',
    hindiName: 'चकाला (जे.बी. नगर)',
    marathiName: 'चकाला (जे.बी. नगर)',
    lineId: 'line1',
    lineColor: '#0284c7',
    lineName: 'Line 1',
    sequence: 6,
    latitude: 19.1118,
    longitude: 72.8655,
    x: 360,
    y: 430,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Escalator', 'CCTV']
  },
  METRO_AIR: {
    id: 'METRO_AIR',
    code: 'METRO_AIR',
    name: 'Airport Road',
    hindiName: 'एयरपोर्ट रोड',
    marathiName: 'विमानतळ रस्ता',
    lineId: 'line1',
    lineColor: '#0284c7',
    lineName: 'Line 1',
    sequence: 7,
    latitude: 19.1082,
    longitude: 72.8732,
    x: 400,
    y: 430,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Escalator', 'Luggage Assistance', 'CCTV']
  },
  METRO_MRL: {
    id: 'METRO_MRL',
    code: 'METRO_MRL',
    name: 'Marol Naka',
    hindiName: 'मरोल नाका',
    marathiName: 'मरोळ नाका',
    lineId: 'line1',
    lineColor: '#0284c7',
    lineName: 'Line 1',
    sequence: 8,
    latitude: 19.1070,
    longitude: 72.8800,
    x: 440,
    y: 430,
    isInterchange: true,
    interchangeWith: [
      {
        targetCode: 'METRO_MRL',
        targetName: 'Marol Naka (Metro Line 3 Underground)',
        networkType: 'metro',
        walkTimeMinutes: 3,
        walkwayType: 'subway',
        isAccessible: true
      }
    ],
    facilities: ['Elevator', 'Escalator', 'Subway Interchange to Line 3', 'CCTV']
  },
  METRO_SKN: {
    id: 'METRO_SKN',
    code: 'METRO_SKN',
    name: 'Saki Naka',
    hindiName: 'साकी नाका',
    marathiName: 'साकी नाका',
    lineId: 'line1',
    lineColor: '#0284c7',
    lineName: 'Line 1',
    sequence: 9,
    latitude: 19.0988,
    longitude: 72.8885,
    x: 475,
    y: 430,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Escalator', 'CCTV']
  },
  METRO_ASL: {
    id: 'METRO_ASL',
    code: 'METRO_ASL',
    name: 'Asalpha',
    hindiName: 'असल्फा',
    marathiName: 'असाल्फा',
    lineId: 'line1',
    lineColor: '#0284c7',
    lineName: 'Line 1',
    sequence: 10,
    latitude: 19.0945,
    longitude: 72.8980,
    x: 510,
    y: 430,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Escalator', 'CCTV']
  },
  METRO_JGT: {
    id: 'METRO_JGT',
    code: 'METRO_JGT',
    name: 'Jagruti Nagar',
    hindiName: 'जागृति नगर',
    marathiName: 'जागृती नगर',
    lineId: 'line1',
    lineColor: '#0284c7',
    lineName: 'Line 1',
    sequence: 11,
    latitude: 19.0910,
    longitude: 72.9035,
    x: 540,
    y: 430,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Escalator', 'CCTV']
  },
  METRO_GHT: {
    id: 'METRO_GHT',
    code: 'METRO_GHT',
    name: 'Ghatkopar Metro',
    hindiName: 'घाटकोपर मेट्रो',
    marathiName: 'घाटकोपर मेट्रो',
    lineId: 'line1',
    lineColor: '#0284c7',
    lineName: 'Line 1',
    sequence: 12,
    latitude: 19.0864,
    longitude: 72.9080,
    x: 575,
    y: 430,
    isInterchange: true,
    interchangeWith: [
      {
        targetCode: 'GC',
        targetName: 'Ghatkopar (Central Railway Suburban)',
        networkType: 'suburban',
        walkTimeMinutes: 3,
        walkwayType: 'footbridge',
        isAccessible: true
      }
    ],
    facilities: ['Elevator', 'Escalator', 'Direct Central Railway FOB', 'NCMC Card Reader', 'Security Desk']
  },

  // Key Line 7 Stations (Dahisar East to Gundavali)
  METRO_DHE: {
    id: 'METRO_DHE',
    code: 'METRO_DHE',
    name: 'Dahisar East',
    hindiName: 'दहिसर पूर्व',
    marathiName: 'दहीसर पूर्व',
    lineId: 'line7',
    lineColor: '#ef4444',
    lineName: 'Line 7 & 2A',
    sequence: 1,
    latitude: 19.2562,
    longitude: 72.8595,
    x: 275,
    y: 130,
    isInterchange: true,
    interchangeWith: [
      {
        targetCode: 'METRO_DHE',
        targetName: 'Line 2A Dahisar East',
        networkType: 'metro',
        walkTimeMinutes: 2,
        walkwayType: 'footbridge',
        isAccessible: true
      }
    ],
    facilities: ['Elevator', 'Escalator', 'Dual Line Concourse', 'CCTV']
  },
  METRO_NPK: {
    id: 'METRO_NPK',
    code: 'METRO_NPK',
    name: 'National Park (Borivali E)',
    hindiName: 'राष्ट्रीय उद्यान',
    marathiName: 'नॅशनल पार्क',
    lineId: 'line7',
    lineColor: '#ef4444',
    lineName: 'Line 7',
    sequence: 3,
    latitude: 19.2290,
    longitude: 72.8620,
    x: 275,
    y: 190,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Escalator', 'CCTV']
  },
  METRO_AKR: {
    id: 'METRO_AKR',
    code: 'METRO_AKR',
    name: 'Akurli (Kandivali E)',
    hindiName: 'आकुर्ली',
    marathiName: 'आकुर्ली',
    lineId: 'line7',
    lineColor: '#ef4444',
    lineName: 'Line 7',
    sequence: 7,
    latitude: 19.2050,
    longitude: 72.8640,
    x: 275,
    y: 260,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Escalator', 'CCTV']
  },
  METRO_DND: {
    id: 'METRO_DND',
    code: 'METRO_DND',
    name: 'Dindoshi (Malad E)',
    hindiName: 'दिंडोशी',
    marathiName: 'दिंडोशी',
    lineId: 'line7',
    lineColor: '#ef4444',
    lineName: 'Line 7',
    sequence: 9,
    latitude: 19.1760,
    longitude: 72.8630,
    x: 275,
    y: 320,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Escalator', 'CCTV']
  },
  METRO_ARY: {
    id: 'METRO_ARY',
    code: 'METRO_ARY',
    name: 'Aarey',
    hindiName: 'आरे',
    marathiName: 'आरे',
    lineId: 'line7',
    lineColor: '#ef4444',
    lineName: 'Line 7',
    sequence: 10,
    latitude: 19.1600,
    longitude: 72.8600,
    x: 275,
    y: 350,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Escalator', 'CCTV']
  },
  METRO_GDV: {
    id: 'METRO_GDV',
    code: 'METRO_GDV',
    name: 'Gundavali',
    hindiName: 'गुंदवली',
    marathiName: 'गुंदवली',
    lineId: 'line7',
    lineColor: '#ef4444',
    lineName: 'Line 7',
    sequence: 14,
    latitude: 19.1170,
    longitude: 72.8580,
    x: 320,
    y: 410,
    isInterchange: true,
    interchangeWith: [
      {
        targetCode: 'METRO_WEH',
        targetName: 'Western Express Highway (Line 1)',
        networkType: 'metro',
        walkTimeMinutes: 3,
        walkwayType: 'footbridge',
        isAccessible: true
      }
    ],
    facilities: ['Elevator', 'Escalator', 'Footbridge to Line 1', 'CCTV', 'NCMC Card Reader']
  },

  // Key Line 3 Stations (Aarey JVLR to BKC)
  METRO_ARY_3: {
    id: 'METRO_ARY_3',
    code: 'METRO_ARY_3',
    name: 'Aarey JVLR',
    hindiName: 'आरे जेवीएलआर',
    marathiName: 'आरे जेव्हीएलआर',
    lineId: 'line3',
    lineColor: '#0d9488',
    lineName: 'Line 3',
    sequence: 1,
    latitude: 19.1360,
    longitude: 72.8750,
    x: 430,
    y: 360,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Escalator', 'CCTV', 'Depot Access']
  },
  METRO_SPZ: {
    id: 'METRO_SPZ',
    code: 'METRO_SPZ',
    name: 'SEEPZ',
    hindiName: 'सीप्ज़',
    marathiName: 'सीप्झ',
    lineId: 'line3',
    lineColor: '#0d9488',
    lineName: 'Line 3',
    sequence: 2,
    latitude: 19.1240,
    longitude: 72.8770,
    x: 430,
    y: 390,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Escalator', 'Underground Air-conditioning']
  },
  METRO_CSMIA2: {
    id: 'METRO_CSMIA2',
    code: 'METRO_CSMIA2',
    name: 'CSMIA Terminal 2',
    hindiName: 'सीएसएमआईए टर्मिनल २ (अंतर्राष्ट्रीय)',
    marathiName: 'सीएसएमआयए टर्मिनल २ (आंतरराष्ट्रीय)',
    lineId: 'line3',
    lineColor: '#0d9488',
    lineName: 'Line 3',
    sequence: 5,
    latitude: 19.0968,
    longitude: 72.8745,
    x: 410,
    y: 470,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Escalator', 'Direct Airport Check-in Subway', 'Luggage Buffer']
  },
  METRO_BKC: {
    id: 'METRO_BKC',
    code: 'METRO_BKC',
    name: 'BKC (Bandra Kurla Complex)',
    hindiName: 'बीकेसी (बांद्रा कुर्ला कॉम्प्लेक्स)',
    marathiName: 'बीकेसी (वांद्रे कुर्ला कॉम्प्लेक्स)',
    lineId: 'line3',
    lineColor: '#0d9488',
    lineName: 'Line 3',
    sequence: 10,
    latitude: 19.0650,
    longitude: 72.8680,
    x: 360,
    y: 560,
    isInterchange: false,
    interchangeWith: [],
    facilities: ['Elevator', 'Escalator', 'Underground Transit Concourse', 'CCTV']
  }
};

/**
 * Official Mumbai Metro Fare Calculator (Distance Slab Based)
 */
export function calculateMetroFare(distanceKm: number): number {
  if (distanceKm <= 3) return 10;
  if (distanceKm <= 12) return 20;
  if (distanceKm <= 18) return 30;
  if (distanceKm <= 24) return 40;
  if (distanceKm <= 30) return 50;
  return 60;
}
