/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StationAmenity {
  id: string;
  type: 
    | 'lift' 
    | 'escalator' 
    | 'wheelchair_ramp' 
    | 'atvm_ticket' 
    | 'rpf_post' 
    | 'medical_help' 
    | 'cloak_room' 
    | 'water_atm' 
    | 'metro_interchange' 
    | 'exit_gate';
  name: string;
  platformId: string;
  level: number; // 0: Platform, 1: FOB/Concourse, 2: Skywalk/Elevated Metro
  x: number;
  y: number;
  z: number;
  isAccessible: boolean;
}

export interface PlatformLayout {
  id: string;
  number: string;
  line: 'western' | 'central' | 'harbour' | 'trans_harbour' | 'national';
  serviceType: 'slow' | 'fast' | 'both' | 'outstation';
  trackGauge: string;
  carCapacity: 12 | 15 | 16 | 24;
  lengthMeters: number;
  currentTrain?: {
    trainNumber: string;
    trainName: string;
    destination: string;
    etaMinutes: number;
    rakeType: 'FAST' | 'SLOW' | 'AC' | 'EXPRESS';
    carCount: number;
  };
  crowdLevel: 'LOW' | 'MODERATE' | 'HEAVY' | 'CRUSH_LOAD';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FootOverBridge {
  id: string;
  name: string;
  connectedPlatforms: string[];
  level: number;
  lengthMeters: number;
  typicalWalkMinutes: number;
  hasLifts: boolean;
  hasEscalators: boolean;
  isCovered: boolean;
  crowdFactor: number; // 1.0 = normal, 1.5 = heavy rush
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Station3DLayout {
  stationCode: string;
  stationName: string;
  hindiName: string;
  marathiName: string;
  city: string;
  zone: string;
  division: string;
  isMajorInterchange: boolean;
  levelsCount: number;
  platforms: PlatformLayout[];
  bridges: FootOverBridge[];
  amenities: StationAmenity[];
  description: string;
}

export const STATION_3D_LAYOUTS: Record<string, Station3DLayout> = {
  DR: {
    stationCode: 'DR',
    stationName: 'Dadar Junction',
    hindiName: 'दादर जंक्शन',
    marathiName: 'दादर जंक्शन',
    city: 'Mumbai',
    zone: 'CR / WR',
    division: 'Mumbai (CR) & Mumbai Central (WR)',
    isMajorInterchange: true,
    levelsCount: 2,
    description: 'Premier Mumbai suburban interchange connecting Western Railway (WR) and Central Railway (CR). Features 3 major Foot-Over-Bridges connecting 15 total platforms.',
    platforms: [
      // Western Railway Suburban Platforms (PF 1 to 7)
      { id: 'DR_WR_1', number: '1 (WR)', line: 'western', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 280, crowdLevel: 'HEAVY', x: 40, y: 50, width: 20, height: 260, currentTrain: { trainNumber: '90451', trainName: 'Churchgate Slow Local', destination: 'Churchgate', etaMinutes: 2, rakeType: 'SLOW', carCount: 15 } },
      { id: 'DR_WR_2', number: '2 (WR)', line: 'western', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 280, crowdLevel: 'MODERATE', x: 80, y: 50, width: 20, height: 260 },
      { id: 'DR_WR_3', number: '3 (WR)', line: 'western', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 120, y: 50, width: 22, height: 280, currentTrain: { trainNumber: '92015', trainName: 'Virar Fast Local', destination: 'Virar', etaMinutes: 4, rakeType: 'FAST', carCount: 15 } },
      { id: 'DR_WR_4', number: '4 (WR)', line: 'western', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'HEAVY', x: 160, y: 50, width: 22, height: 280 },
      { id: 'DR_WR_5', number: '5 (WR)', line: 'western', serviceType: 'both', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'MODERATE', x: 200, y: 50, width: 20, height: 260 },
      { id: 'DR_WR_6', number: '6 (WR)', line: 'western', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 550, crowdLevel: 'MODERATE', x: 240, y: 30, width: 24, height: 320, currentTrain: { trainNumber: '12951', trainName: 'Mumbai Rajdhani Exp', destination: 'New Delhi', etaMinutes: 35, rakeType: 'EXPRESS', carCount: 22 } },
      { id: 'DR_WR_7', number: '7 (WR)', line: 'western', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 550, crowdLevel: 'LOW', x: 280, y: 30, width: 24, height: 320 },

      // Central Railway Suburban & Outstation Platforms (PF 1 to 8)
      { id: 'DR_CR_1', number: '1 (CR)', line: 'central', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 280, crowdLevel: 'HEAVY', x: 420, y: 50, width: 20, height: 260, currentTrain: { trainNumber: '97045', trainName: 'Kalyan Slow Local', destination: 'Kalyan', etaMinutes: 3, rakeType: 'SLOW', carCount: 15 } },
      { id: 'DR_CR_2', number: '2 (CR)', line: 'central', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 280, crowdLevel: 'MODERATE', x: 460, y: 50, width: 20, height: 260 },
      { id: 'DR_CR_3', number: '3 (CR)', line: 'central', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 500, y: 50, width: 22, height: 280, currentTrain: { trainNumber: '95112', trainName: 'CSMT Fast Local', destination: 'CSMT', etaMinutes: 1, rakeType: 'FAST', carCount: 15 } },
      { id: 'DR_CR_4', number: '4 (CR)', line: 'central', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 540, y: 50, width: 22, height: 280 },
      { id: 'DR_CR_5', number: '5 (CR)', line: 'central', serviceType: 'both', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 550, crowdLevel: 'HEAVY', x: 580, y: 30, width: 24, height: 320, currentTrain: { trainNumber: '12124', trainName: 'Deccan Queen Express', destination: 'Pune Jn', etaMinutes: 18, rakeType: 'EXPRESS', carCount: 17 } },
      { id: 'DR_CR_6', number: '6 (CR)', line: 'central', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 550, crowdLevel: 'LOW', x: 620, y: 30, width: 24, height: 320 },
      { id: 'DR_CR_7', number: '7 (CR)', line: 'central', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 550, crowdLevel: 'LOW', x: 660, y: 30, width: 22, height: 320 },
      { id: 'DR_CR_8', number: '8 (CR)', line: 'central', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 550, crowdLevel: 'LOW', x: 700, y: 30, width: 22, height: 320 }
    ],
    bridges: [
      {
        id: 'DR_NORTH_FOB',
        name: 'North Foot-Over-Bridge (Fast Interchange)',
        connectedPlatforms: ['DR_WR_1', 'DR_WR_2', 'DR_WR_3', 'DR_WR_4', 'DR_WR_5', 'DR_CR_1', 'DR_CR_2', 'DR_CR_3', 'DR_CR_4'],
        level: 1,
        lengthMeters: 320,
        typicalWalkMinutes: 6,
        hasLifts: true,
        hasEscalators: true,
        isCovered: true,
        crowdFactor: 1.3,
        x1: 30,
        y1: 90,
        x2: 560,
        y2: 90
      },
      {
        id: 'DR_MIDDLE_FOB',
        name: 'Middle Foot-Over-Bridge & Flower Market Concourse',
        connectedPlatforms: ['DR_WR_1', 'DR_WR_2', 'DR_WR_3', 'DR_WR_4', 'DR_WR_5', 'DR_WR_6', 'DR_WR_7', 'DR_CR_1', 'DR_CR_2', 'DR_CR_3', 'DR_CR_4', 'DR_CR_5', 'DR_CR_6', 'DR_CR_7', 'DR_CR_8'],
        level: 1,
        lengthMeters: 450,
        typicalWalkMinutes: 7,
        hasLifts: true,
        hasEscalators: true,
        isCovered: true,
        crowdFactor: 1.5,
        x1: 30,
        y1: 180,
        x2: 710,
        y2: 180
      },
      {
        id: 'DR_SOUTH_FOB',
        name: 'South Foot-Over-Bridge (CSMT / Churchgate End)',
        connectedPlatforms: ['DR_WR_1', 'DR_WR_2', 'DR_WR_3', 'DR_WR_4', 'DR_CR_1', 'DR_CR_2', 'DR_CR_3', 'DR_CR_4', 'DR_CR_5'],
        level: 1,
        lengthMeters: 380,
        typicalWalkMinutes: 7,
        hasLifts: false,
        hasEscalators: true,
        isCovered: true,
        crowdFactor: 1.1,
        x1: 30,
        y1: 270,
        x2: 600,
        y2: 270
      }
    ],
    amenities: [
      { id: 'DR_AM_1', type: 'atvm_ticket', name: 'ATVM & UTS Kiosk Concourse', platformId: 'DR_WR_3', level: 1, x: 120, y: 90, z: 1, isAccessible: true },
      { id: 'DR_AM_2', type: 'lift', name: 'WR Platform 3 North Lift', platformId: 'DR_WR_3', level: 0, x: 130, y: 95, z: 0, isAccessible: true },
      { id: 'DR_AM_3', type: 'escalator', name: 'WR Platform 4 Escalator Up', platformId: 'DR_WR_4', level: 0, x: 170, y: 100, z: 0, isAccessible: true },
      { id: 'DR_AM_4', type: 'rpf_post', name: 'RPF Police Thana & SOS Helpdesk', platformId: 'DR_CR_1', level: 0, x: 410, y: 160, z: 0, isAccessible: true },
      { id: 'DR_AM_5', type: 'medical_help', name: 'Emergency One-Rupee Medical Clinic', platformId: 'DR_CR_4', level: 1, x: 540, y: 180, z: 1, isAccessible: true },
      { id: 'DR_AM_6', type: 'water_atm', name: 'IRCTC Water Vending ATM', platformId: 'DR_WR_1', level: 0, x: 50, y: 120, z: 0, isAccessible: true },
      { id: 'DR_AM_7', type: 'wheelchair_ramp', name: 'CR Platform 1 Divyangjan Ramp', platformId: 'DR_CR_1', level: 0, x: 425, y: 60, z: 0, isAccessible: true },
      { id: 'DR_AM_8', type: 'exit_gate', name: 'East Exit (Dadar TT / Khodadad Circle)', platformId: 'DR_CR_8', level: 0, x: 720, y: 180, z: 0, isAccessible: true },
      { id: 'DR_AM_9', type: 'exit_gate', name: 'West Exit (Senapati Bapat Marg / Plaza)', platformId: 'DR_WR_1', level: 0, x: 20, y: 180, z: 0, isAccessible: true }
    ]
  },

  CSMT: {
    stationCode: 'CSMT',
    stationName: 'Chhatrapati Shivaji Maharaj Terminus',
    hindiName: 'छत्रपति शिवाजी महाराज टर्मिनस',
    marathiName: 'छत्रपती शिवाजी महाराज टर्मिनस',
    city: 'Mumbai',
    zone: 'CR',
    division: 'Mumbai (CR)',
    isMajorInterchange: true,
    levelsCount: 2,
    description: 'Historic UNESCO World Heritage railway terminus. Suburban local services terminate at PF 1-7; national express and Rajdhani trains operate from PF 8-18.',
    platforms: [
      { id: 'CSMT_1', number: '1 (Suburban)', line: 'central', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 12, lengthMeters: 250, crowdLevel: 'HEAVY', x: 60, y: 60, width: 22, height: 260 },
      { id: 'CSMT_2', number: '2 (Suburban)', line: 'central', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 12, lengthMeters: 250, crowdLevel: 'MODERATE', x: 100, y: 60, width: 22, height: 260 },
      { id: 'CSMT_3', number: '3 (Suburban)', line: 'central', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 140, y: 60, width: 24, height: 280, currentTrain: { trainNumber: '95112', trainName: 'CSMT Fast Local', destination: 'CSMT (Arrived)', etaMinutes: 0, rakeType: 'FAST', carCount: 15 } },
      { id: 'CSMT_4', number: '4 (Suburban)', line: 'central', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'HEAVY', x: 180, y: 60, width: 24, height: 280 },
      { id: 'CSMT_5', number: '5 (Harbour)', line: 'harbour', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 12, lengthMeters: 250, crowdLevel: 'HEAVY', x: 220, y: 60, width: 22, height: 260 },
      { id: 'CSMT_6', number: '6 (Harbour)', line: 'harbour', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 12, lengthMeters: 250, crowdLevel: 'MODERATE', x: 260, y: 60, width: 22, height: 260 },
      { id: 'CSMT_7', number: '7 (Suburban)', line: 'central', serviceType: 'both', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'MODERATE', x: 300, y: 60, width: 22, height: 280 },
      { id: 'CSMT_8', number: '8 (Mainline)', line: 'national', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 600, crowdLevel: 'HEAVY', x: 400, y: 40, width: 26, height: 340, currentTrain: { trainNumber: '11058', trainName: 'Amritsar CSMT Express', destination: 'CSMT Terminus', etaMinutes: 12, rakeType: 'EXPRESS', carCount: 22 } },
      { id: 'CSMT_14', number: '14 (Tejas/Vande)', line: 'national', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 16, lengthMeters: 450, crowdLevel: 'MODERATE', x: 500, y: 40, width: 26, height: 340, currentTrain: { trainNumber: '22222', trainName: 'CSMT Rajdhani Exp', destination: 'Hazrat Nizamuddin', etaMinutes: 45, rakeType: 'EXPRESS', carCount: 16 } }
    ],
    bridges: [
      {
        id: 'CSMT_MAIN_CONCOURSE',
        name: 'Grand Heritage Concourse & Star Chamber',
        connectedPlatforms: ['CSMT_1', 'CSMT_2', 'CSMT_3', 'CSMT_4', 'CSMT_5', 'CSMT_6', 'CSMT_7', 'CSMT_8', 'CSMT_14'],
        level: 0,
        lengthMeters: 480,
        typicalWalkMinutes: 4,
        hasLifts: true,
        hasEscalators: true,
        isCovered: true,
        crowdFactor: 1.4,
        x1: 50,
        y1: 340,
        x2: 520,
        y2: 340
      },
      {
        id: 'CSMT_SUBURBAN_FOB',
        name: 'North Suburban Footbridge',
        connectedPlatforms: ['CSMT_1', 'CSMT_2', 'CSMT_3', 'CSMT_4', 'CSMT_5', 'CSMT_6', 'CSMT_7'],
        level: 1,
        lengthMeters: 280,
        typicalWalkMinutes: 3,
        hasLifts: true,
        hasEscalators: false,
        isCovered: true,
        crowdFactor: 1.1,
        x1: 50,
        y1: 150,
        x2: 320,
        y2: 150
      }
    ],
    amenities: [
      { id: 'CSMT_AM_1', type: 'metro_interchange', name: 'Subway to Mumbai Metro Line 3 (Aqua Line)', platformId: 'CSMT_1', level: 0, x: 40, y: 350, z: 0, isAccessible: true },
      { id: 'CSMT_AM_2', type: 'atvm_ticket', name: 'Star Chamber UTS/PRS Reservation Center', platformId: 'CSMT_4', level: 0, x: 180, y: 350, z: 0, isAccessible: true },
      { id: 'CSMT_AM_3', type: 'rpf_post', name: 'CR RPF Security Headquarters', platformId: 'CSMT_7', level: 0, x: 310, y: 340, z: 0, isAccessible: true },
      { id: 'CSMT_AM_4', type: 'cloak_room', name: 'IRCTC Left Luggage Cloak Room', platformId: 'CSMT_8', level: 0, x: 410, y: 350, z: 0, isAccessible: true }
    ]
  },

  TNA: {
    stationCode: 'TNA',
    stationName: 'Thane Junction',
    hindiName: 'ठाणे जंक्शन',
    marathiName: 'ठाणे जंक्शन',
    city: 'Thane',
    zone: 'CR',
    division: 'Mumbai (CR)',
    isMajorInterchange: true,
    levelsCount: 3,
    description: 'Major junction on Central Railway with direct SATIS elevated deck for municipal buses and Trans-Harbour suburban rail terminus.',
    platforms: [
      { id: 'TNA_1', number: '1', line: 'central', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 60, y: 50, width: 22, height: 260 },
      { id: 'TNA_2', number: '2', line: 'central', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'HEAVY', x: 100, y: 50, width: 22, height: 260 },
      { id: 'TNA_3', number: '3', line: 'central', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 320, crowdLevel: 'CRUSH_LOAD', x: 140, y: 50, width: 24, height: 280 },
      { id: 'TNA_4', number: '4', line: 'central', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 320, crowdLevel: 'HEAVY', x: 180, y: 50, width: 24, height: 280 },
      { id: 'TNA_5', number: '5', line: 'central', serviceType: 'both', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 550, crowdLevel: 'MODERATE', x: 220, y: 30, width: 24, height: 320 },
      { id: 'TNA_9', number: '9 (Trans-Harbour)', line: 'trans_harbour', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 12, lengthMeters: 260, crowdLevel: 'HEAVY', x: 320, y: 50, width: 22, height: 260 },
      { id: 'TNA_10', number: '10 (Trans-Harbour)', line: 'trans_harbour', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 12, lengthMeters: 260, crowdLevel: 'MODERATE', x: 360, y: 50, width: 22, height: 260 }
    ],
    bridges: [
      {
        id: 'TNA_SATIS_DECK',
        name: 'SATIS Elevated Deck & TMT Bus Terminal',
        connectedPlatforms: ['TNA_1', 'TNA_2', 'TNA_3', 'TNA_4', 'TNA_5'],
        level: 2,
        lengthMeters: 240,
        typicalWalkMinutes: 3,
        hasLifts: true,
        hasEscalators: true,
        isCovered: true,
        crowdFactor: 1.3,
        x1: 50,
        y1: 180,
        x2: 240,
        y2: 180
      },
      {
        id: 'TNA_EAST_WEST_FOB',
        name: 'Thane Central Cross-Platform FOB',
        connectedPlatforms: ['TNA_1', 'TNA_2', 'TNA_3', 'TNA_4', 'TNA_5', 'TNA_9', 'TNA_10'],
        level: 1,
        lengthMeters: 380,
        typicalWalkMinutes: 5,
        hasLifts: true,
        hasEscalators: true,
        isCovered: true,
        crowdFactor: 1.4,
        x1: 50,
        y1: 100,
        x2: 380,
        y2: 100
      }
    ],
    amenities: [
      { id: 'TNA_AM_1', type: 'escalator', name: 'PF 3-4 Escalator to SATIS Bus Deck', platformId: 'TNA_3', level: 0, x: 150, y: 180, z: 0, isAccessible: true },
      { id: 'TNA_AM_2', type: 'lift', name: 'Trans-Harbour PF 9 Direct Lift', platformId: 'TNA_9', level: 0, x: 330, y: 100, z: 0, isAccessible: true },
      { id: 'TNA_AM_3', type: 'rpf_post', name: 'Thane East RPF Outpost', platformId: 'TNA_10', level: 0, x: 370, y: 120, z: 0, isAccessible: true }
    ]
  },

  ADH: {
    stationCode: 'ADH',
    stationName: 'Andheri Junction',
    hindiName: 'अंधेरी जंक्शन',
    marathiName: 'अंधेरी जंक्शन',
    city: 'Mumbai',
    zone: 'WR',
    division: 'Mumbai Central (WR)',
    isMajorInterchange: true,
    levelsCount: 2,
    description: 'Western Railway hub with elevated Skywalk connection directly into Mumbai Metro Line 1 (Ghatkopar-Versova) and Harbour line terminal tracks.',
    platforms: [
      { id: 'ADH_1', number: '1 (WR Slow)', line: 'western', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 60, y: 50, width: 22, height: 260 },
      { id: 'ADH_2', number: '2 (WR Slow)', line: 'western', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'HEAVY', x: 100, y: 50, width: 22, height: 260 },
      { id: 'ADH_3', number: '3 (WR Fast)', line: 'western', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 140, y: 50, width: 24, height: 280 },
      { id: 'ADH_4', number: '4 (WR Fast)', line: 'western', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 180, y: 50, width: 24, height: 280 },
      { id: 'ADH_6', number: '6 (Harbour Line)', line: 'harbour', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 12, lengthMeters: 260, crowdLevel: 'HEAVY', x: 260, y: 50, width: 22, height: 260 },
      { id: 'ADH_7', number: '7 (Harbour Line)', line: 'harbour', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 12, lengthMeters: 260, crowdLevel: 'MODERATE', x: 300, y: 50, width: 22, height: 260 }
    ],
    bridges: [
      {
        id: 'ADH_METRO_SKYWALK',
        name: 'Direct Skywalk to Mumbai Metro Line 1',
        connectedPlatforms: ['ADH_1', 'ADH_2', 'ADH_3', 'ADH_4', 'ADH_6', 'ADH_7'],
        level: 2,
        lengthMeters: 280,
        typicalWalkMinutes: 3,
        hasLifts: true,
        hasEscalators: true,
        isCovered: true,
        crowdFactor: 1.5,
        x1: 50,
        y1: 150,
        x2: 320,
        y2: 150
      }
    ],
    amenities: [
      { id: 'ADH_AM_1', type: 'metro_interchange', name: 'Metro Line 1 Ticketing Gate & Security', platformId: 'ADH_1', level: 2, x: 70, y: 150, z: 2, isAccessible: true },
      { id: 'ADH_AM_2', type: 'lift', name: 'Harbour Platform 6 Divyangjan Lift', platformId: 'ADH_6', level: 0, x: 270, y: 150, z: 0, isAccessible: true }
    ]
  },

  KYN: {
    stationCode: 'KYN',
    stationName: 'Kalyan Junction',
    hindiName: 'कल्याण जंक्शन',
    marathiName: 'कल्याण जंक्शन',
    city: 'Kalyan',
    zone: 'CR',
    division: 'Mumbai (CR)',
    isMajorInterchange: true,
    levelsCount: 2,
    description: 'Critical Central Railway bifurcation junction where tracks diverge toward Kasara (North East) and Karjat/Pune (South East).',
    platforms: [
      { id: 'KYN_1', number: '1 (Suburban)', line: 'central', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 60, y: 50, width: 22, height: 260 },
      { id: 'KYN_2', number: '2 (Suburban)', line: 'central', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'HEAVY', x: 100, y: 50, width: 22, height: 260 },
      { id: 'KYN_4', number: '4 (Fast/Express)', line: 'central', serviceType: 'both', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 550, crowdLevel: 'CRUSH_LOAD', x: 180, y: 30, width: 24, height: 320 },
      { id: 'KYN_5', number: '5 (Express)', line: 'national', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 550, crowdLevel: 'HEAVY', x: 220, y: 30, width: 24, height: 320 },
      { id: 'KYN_7', number: '7 (Express)', line: 'national', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 550, crowdLevel: 'MODERATE', x: 300, y: 30, width: 24, height: 320 }
    ],
    bridges: [
      {
        id: 'KYN_MAIN_FOB',
        name: 'Kalyan Central Footbridge',
        connectedPlatforms: ['KYN_1', 'KYN_2', 'KYN_4', 'KYN_5', 'KYN_7'],
        level: 1,
        lengthMeters: 320,
        typicalWalkMinutes: 5,
        hasLifts: true,
        hasEscalators: true,
        isCovered: true,
        crowdFactor: 1.3,
        x1: 50,
        y1: 140,
        x2: 320,
        y2: 140
      }
    ],
    amenities: [
      { id: 'KYN_AM_1', type: 'atvm_ticket', name: 'ATVM Ticketing Concourse', platformId: 'KYN_1', level: 0, x: 70, y: 140, z: 0, isAccessible: true },
      { id: 'KYN_AM_2', type: 'rpf_post', name: 'RPF Station Outpost', platformId: 'KYN_4', level: 0, x: 190, y: 160, z: 0, isAccessible: true }
    ]
  },

  NDLS: {
    stationCode: 'NDLS',
    stationName: 'New Delhi Railway Station',
    hindiName: 'नई दिल्ली रेलवे स्टेशन',
    marathiName: 'नवी दिल्ली रेल्वे स्थानक',
    city: 'New Delhi',
    zone: 'NR',
    division: 'Delhi (NR)',
    isMajorInterchange: true,
    levelsCount: 2,
    description: 'The premier national terminal of Indian Railways serving 16 platforms with dual gateways: Paharganj (West) and Ajmeri Gate (East), with direct subway to Airport Express Metro.',
    platforms: [
      { id: 'NDLS_1', number: '1 (Paharganj Side)', line: 'national', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 620, crowdLevel: 'CRUSH_LOAD', x: 60, y: 30, width: 24, height: 340 },
      { id: 'NDLS_2', number: '2', line: 'national', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 620, crowdLevel: 'HEAVY', x: 100, y: 30, width: 24, height: 340 },
      { id: 'NDLS_3', number: '3', line: 'national', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 620, crowdLevel: 'HEAVY', x: 140, y: 30, width: 24, height: 340 },
      { id: 'NDLS_8', number: '8', line: 'national', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 620, crowdLevel: 'MODERATE', x: 260, y: 30, width: 24, height: 340 },
      { id: 'NDLS_12', number: '12 (Rajdhani)', line: 'national', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 620, crowdLevel: 'HEAVY', x: 380, y: 30, width: 24, height: 340, currentTrain: { trainNumber: '12952', trainName: 'New Delhi Mumbai Rajdhani', destination: 'Mumbai Central', etaMinutes: 20, rakeType: 'EXPRESS', carCount: 22 } },
      { id: 'NDLS_16', number: '16 (Ajmeri Gate Side)', line: 'national', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 620, crowdLevel: 'CRUSH_LOAD', x: 500, y: 30, width: 24, height: 340 }
    ],
    bridges: [
      {
        id: 'NDLS_CENTRAL_FOB',
        name: 'Grand Central Passenger Overhead Bridge',
        connectedPlatforms: ['NDLS_1', 'NDLS_2', 'NDLS_3', 'NDLS_8', 'NDLS_12', 'NDLS_16'],
        level: 1,
        lengthMeters: 520,
        typicalWalkMinutes: 8,
        hasLifts: true,
        hasEscalators: true,
        isCovered: true,
        crowdFactor: 1.4,
        x1: 50,
        y1: 180,
        x2: 520,
        y2: 180
      }
    ],
    amenities: [
      { id: 'NDLS_AM_1', type: 'metro_interchange', name: 'Direct Underpass to Delhi Metro Airport Express & Yellow Line', platformId: 'NDLS_16', level: 0, x: 520, y: 180, z: 0, isAccessible: true },
      { id: 'NDLS_AM_2', type: 'cloak_room', name: 'IRCTC Executive Lounge & Left Luggage', platformId: 'NDLS_16', level: 1, x: 500, y: 150, z: 1, isAccessible: true },
      { id: 'NDLS_AM_3', type: 'rpf_post', name: 'Northern Railway RPF Main Station Post', platformId: 'NDLS_1', level: 0, x: 50, y: 120, z: 0, isAccessible: true }
    ]
  },

  BVI: {
    stationCode: 'BVI',
    stationName: 'Borivali Junction & Terminus',
    hindiName: 'बोरीवली जंक्शन',
    marathiName: 'बोरीवली जंक्शन',
    city: 'Mumbai',
    zone: 'WR',
    division: 'Mumbai Central (WR)',
    isMajorInterchange: true,
    levelsCount: 2,
    description: 'Premier Northern suburban terminus on Western Railway. 8 operational platforms handle originating slow and fast locals, mail/express trains, and harbor services.',
    platforms: [
      { id: 'BVI_1', number: '1 (WR Slow Down)', line: 'western', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 50, y: 50, width: 22, height: 260, currentTrain: { trainNumber: '90021', trainName: 'Churchgate Slow Local', destination: 'Churchgate', etaMinutes: 3, rakeType: 'SLOW', carCount: 15 } },
      { id: 'BVI_2', number: '2 (WR Slow Up)', line: 'western', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'HEAVY', x: 90, y: 50, width: 22, height: 260 },
      { id: 'BVI_3', number: '3 (WR Fast Down)', line: 'western', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 130, y: 50, width: 22, height: 280, currentTrain: { trainNumber: '92015', trainName: 'Virar Fast Local', destination: 'Virar', etaMinutes: 2, rakeType: 'FAST', carCount: 15 } },
      { id: 'BVI_4', number: '4 (WR Fast Up)', line: 'western', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 170, y: 50, width: 22, height: 280 },
      { id: 'BVI_5', number: '5 (WR Fast / Outstation)', line: 'western', serviceType: 'both', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 550, crowdLevel: 'HEAVY', x: 210, y: 30, width: 24, height: 320 },
      { id: 'BVI_6', number: '6 (Outstation / Terminating)', line: 'national', serviceType: 'outstation', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 550, crowdLevel: 'MODERATE', x: 250, y: 30, width: 24, height: 320, currentTrain: { trainNumber: '12952', trainName: 'Mumbai Rajdhani Express', destination: 'Mumbai Central', etaMinutes: 14, rakeType: 'EXPRESS', carCount: 22 } },
      { id: 'BVI_7', number: '7 (Terminating Local)', line: 'western', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'MODERATE', x: 290, y: 50, width: 22, height: 260 },
      { id: 'BVI_8', number: '8 (Terminating Local)', line: 'western', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'LOW', x: 330, y: 50, width: 22, height: 260 }
    ],
    bridges: [
      {
        id: 'BVI_NORTH_FOB',
        name: 'North Foot-Over-Bridge (Dahisar End)',
        connectedPlatforms: ['BVI_1', 'BVI_2', 'BVI_3', 'BVI_4', 'BVI_5', 'BVI_6', 'BVI_7', 'BVI_8'],
        level: 1,
        lengthMeters: 340,
        typicalWalkMinutes: 5,
        hasLifts: true,
        hasEscalators: true,
        isCovered: true,
        crowdFactor: 1.2,
        x1: 40,
        y1: 90,
        x2: 345,
        y2: 90
      },
      {
        id: 'BVI_MIDDLE_FOB',
        name: 'Central Concourse & Elevated Skywalk',
        connectedPlatforms: ['BVI_1', 'BVI_2', 'BVI_3', 'BVI_4', 'BVI_5', 'BVI_6', 'BVI_7', 'BVI_8'],
        level: 1,
        lengthMeters: 360,
        typicalWalkMinutes: 6,
        hasLifts: true,
        hasEscalators: true,
        isCovered: true,
        crowdFactor: 1.4,
        x1: 40,
        y1: 180,
        x2: 345,
        y2: 180
      },
      {
        id: 'BVI_SOUTH_SKYWALK',
        name: 'South FOB & SV Road Elevated Skywalk',
        connectedPlatforms: ['BVI_1', 'BVI_2', 'BVI_3', 'BVI_4', 'BVI_5'],
        level: 2,
        lengthMeters: 280,
        typicalWalkMinutes: 4,
        hasLifts: true,
        hasEscalators: true,
        isCovered: true,
        crowdFactor: 1.1,
        x1: 40,
        y1: 270,
        x2: 225,
        y2: 270
      }
    ],
    amenities: [
      { id: 'BVI_AM_1', type: 'atvm_ticket', name: 'West Concourse ATVM & Booking Office', platformId: 'BVI_1', level: 0, x: 50, y: 180, z: 0, isAccessible: true },
      { id: 'BVI_AM_2', type: 'rpf_post', name: 'RPF Police Post & Station Security', platformId: 'BVI_4', level: 0, x: 170, y: 180, z: 0, isAccessible: true },
      { id: 'BVI_AM_3', type: 'lift', name: 'Platform 3-4 Central Lift', platformId: 'BVI_3', level: 0, x: 140, y: 90, z: 0, isAccessible: true },
      { id: 'BVI_AM_4', type: 'medical_help', name: 'Emergency Medical Care Unit', platformId: 'BVI_1', level: 0, x: 50, y: 220, z: 0, isAccessible: true },
      { id: 'BVI_AM_5', type: 'exit_gate', name: 'East Exit (SV Road / Bus Station)', platformId: 'BVI_8', level: 0, x: 350, y: 180, z: 0, isAccessible: true }
    ]
  },

  CLA: {
    stationCode: 'CLA',
    stationName: 'Kurla Junction',
    hindiName: 'कुर्ला जंक्शन',
    marathiName: 'कुर्ला जंक्शन',
    city: 'Mumbai',
    zone: 'CR',
    division: 'Mumbai (CR)',
    isMajorInterchange: true,
    levelsCount: 2,
    description: 'Bustling junction connecting Central Railway Main Line (PF 1-6) and Harbour Line (PF 7-8). Major transit point for Lokmanya Tilak Terminus (LTT) connections.',
    platforms: [
      { id: 'CLA_1', number: '1 (CR Slow Down)', line: 'central', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 50, y: 50, width: 22, height: 260, currentTrain: { trainNumber: '97045', trainName: 'Kalyan Slow Local', destination: 'Kalyan', etaMinutes: 2, rakeType: 'SLOW', carCount: 15 } },
      { id: 'CLA_2', number: '2 (CR Slow Up)', line: 'central', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'HEAVY', x: 90, y: 50, width: 22, height: 260 },
      { id: 'CLA_3', number: '3 (CR Fast Down)', line: 'central', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 130, y: 50, width: 22, height: 280 },
      { id: 'CLA_4', number: '4 (CR Fast Up)', line: 'central', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 170, y: 50, width: 22, height: 280, currentTrain: { trainNumber: '95112', trainName: 'CSMT Fast Local', destination: 'CSMT', etaMinutes: 1, rakeType: 'FAST', carCount: 15 } },
      { id: 'CLA_5', number: '5 (CR Outstation / Loop)', line: 'central', serviceType: 'both', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 550, crowdLevel: 'MODERATE', x: 210, y: 30, width: 24, height: 320 },
      { id: 'CLA_6', number: '6 (CR Outstation / Loop)', line: 'central', serviceType: 'both', trackGauge: 'Broad Gauge', carCapacity: 24, lengthMeters: 550, crowdLevel: 'MODERATE', x: 250, y: 30, width: 24, height: 320 },
      { id: 'CLA_7', number: '7 (Harbour Down)', line: 'harbour', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 12, lengthMeters: 260, crowdLevel: 'CRUSH_LOAD', x: 310, y: 50, width: 22, height: 260, currentTrain: { trainNumber: '98012', trainName: 'Panvel Slow Local', destination: 'Panvel', etaMinutes: 4, rakeType: 'SLOW', carCount: 12 } },
      { id: 'CLA_8', number: '8 (Harbour Up)', line: 'harbour', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 12, lengthMeters: 260, crowdLevel: 'HEAVY', x: 350, y: 50, width: 22, height: 260 }
    ],
    bridges: [
      {
        id: 'CLA_CENTRAL_FOB',
        name: 'Kurla Central Cross-Line Interchange FOB',
        connectedPlatforms: ['CLA_1', 'CLA_2', 'CLA_3', 'CLA_4', 'CLA_5', 'CLA_6', 'CLA_7', 'CLA_8'],
        level: 1,
        lengthMeters: 380,
        typicalWalkMinutes: 6,
        hasLifts: true,
        hasEscalators: true,
        isCovered: true,
        crowdFactor: 1.5,
        x1: 40,
        y1: 150,
        x2: 365,
        y2: 150
      },
      {
        id: 'CLA_EAST_WEST_SKYWALK',
        name: 'Nehru Nagar East-West Pedestrian Skywalk',
        connectedPlatforms: ['CLA_1', 'CLA_2', 'CLA_3', 'CLA_4', 'CLA_7', 'CLA_8'],
        level: 2,
        lengthMeters: 420,
        typicalWalkMinutes: 7,
        hasLifts: true,
        hasEscalators: false,
        isCovered: true,
        crowdFactor: 1.3,
        x1: 40,
        y1: 240,
        x2: 365,
        y2: 240
      }
    ],
    amenities: [
      { id: 'CLA_AM_1', type: 'atvm_ticket', name: 'Main Interchange Ticket Concourse', platformId: 'CLA_4', level: 1, x: 170, y: 150, z: 1, isAccessible: true },
      { id: 'CLA_AM_2', type: 'rpf_post', name: 'RPF Central Police Post', platformId: 'CLA_1', level: 0, x: 50, y: 150, z: 0, isAccessible: true },
      { id: 'CLA_AM_3', type: 'lift', name: 'Harbour PF 7-8 Lift to Concourse', platformId: 'CLA_7', level: 0, x: 320, y: 150, z: 0, isAccessible: true },
      { id: 'CLA_AM_4', type: 'exit_gate', name: 'East Gate (Nehru Nagar / LTT Link)', platformId: 'CLA_8', level: 0, x: 370, y: 150, z: 0, isAccessible: true }
    ]
  },

  CCG: {
    stationCode: 'CCG',
    stationName: 'Churchgate Terminus',
    hindiName: 'चर्चगेट टर्मिनस',
    marathiName: 'चर्चगेट टर्मिनस',
    city: 'Mumbai',
    zone: 'WR',
    division: 'Mumbai Central (WR)',
    isMajorInterchange: true,
    levelsCount: 2,
    description: 'Southern terminus of the Western Railway Suburban Network. 4 terminal platforms handle Churchgate-originating fast and slow locals carrying over 500,000 commuters daily.',
    platforms: [
      { id: 'CCG_1', number: '1 (WR Slow Departure)', line: 'western', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 60, y: 60, width: 24, height: 260, currentTrain: { trainNumber: '90021', trainName: 'Borivali Slow Local', destination: 'Borivali', etaMinutes: 2, rakeType: 'SLOW', carCount: 15 } },
      { id: 'CCG_2', number: '2 (WR Slow Arrival)', line: 'western', serviceType: 'slow', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'HEAVY', x: 110, y: 60, width: 24, height: 260 },
      { id: 'CCG_3', number: '3 (WR Fast Departure)', line: 'western', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 160, y: 60, width: 24, height: 280, currentTrain: { trainNumber: '92015', trainName: 'Virar Fast Local', destination: 'Virar', etaMinutes: 4, rakeType: 'FAST', carCount: 15 } },
      { id: 'CCG_4', number: '4 (WR Fast Arrival)', line: 'western', serviceType: 'fast', trackGauge: 'Broad Gauge', carCapacity: 15, lengthMeters: 300, crowdLevel: 'CRUSH_LOAD', x: 210, y: 60, width: 24, height: 280 }
    ],
    bridges: [
      {
        id: 'CCG_MAIN_CONCOURSE',
        name: 'Churchgate Heritage Ground Concourse',
        connectedPlatforms: ['CCG_1', 'CCG_2', 'CCG_3', 'CCG_4'],
        level: 0,
        lengthMeters: 220,
        typicalWalkMinutes: 2,
        hasLifts: true,
        hasEscalators: false,
        isCovered: true,
        crowdFactor: 1.4,
        x1: 50,
        y1: 330,
        x2: 230,
        y2: 330
      },
      {
        id: 'CCG_NORTH_SUBWAY',
        name: 'Maharshi Karve Road Pedestrian Subway',
        connectedPlatforms: ['CCG_1', 'CCG_2', 'CCG_3', 'CCG_4'],
        level: 1,
        lengthMeters: 260,
        typicalWalkMinutes: 3,
        hasLifts: true,
        hasEscalators: true,
        isCovered: true,
        crowdFactor: 1.2,
        x1: 50,
        y1: 150,
        x2: 230,
        y2: 150
      }
    ],
    amenities: [
      { id: 'CCG_AM_1', type: 'atvm_ticket', name: 'WR Headquarters UTS Concourse', platformId: 'CCG_1', level: 0, x: 50, y: 340, z: 0, isAccessible: true },
      { id: 'CCG_AM_2', type: 'rpf_post', name: 'Churchgate RPF Security Post', platformId: 'CCG_4', level: 0, x: 220, y: 340, z: 0, isAccessible: true },
      { id: 'CCG_AM_3', type: 'exit_gate', name: 'Veer Nariman Road & Oval Maidan Exit', platformId: 'CCG_1', level: 0, x: 40, y: 340, z: 0, isAccessible: true },
      { id: 'CCG_AM_4', type: 'water_atm', name: 'IRCTC Pure Water ATM', platformId: 'CCG_2', level: 0, x: 100, y: 200, z: 0, isAccessible: true }
    ]
  }
};

/**
 * Calculates walking transfer route across Foot-Over-Bridges
 */
export function calculateStationTransferRoute(
  stationCode: string,
  fromPlatformId: string,
  toPlatformId: string,
  requireStepFreeAccess: boolean = false
): {
  success: boolean;
  recommendedBridge?: FootOverBridge;
  distanceMeters: number;
  walkMinutes: number;
  stepFreeAvailable: boolean;
  steps: string[];
} {
  const station = STATION_3D_LAYOUTS[stationCode];
  if (!station) {
    return {
      success: false,
      distanceMeters: 0,
      walkMinutes: 0,
      stepFreeAvailable: false,
      steps: ['Station layout not indexed for 3D navigation.']
    };
  }

  const fromPlatform = station.platforms.find(p => p.id === fromPlatformId);
  const toPlatform = station.platforms.find(p => p.id === toPlatformId);

  if (!fromPlatform || !toPlatform) {
    return {
      success: false,
      distanceMeters: 0,
      walkMinutes: 0,
      stepFreeAvailable: false,
      steps: ['Invalid platform specified.']
    };
  }

  if (fromPlatformId === toPlatformId) {
    return {
      success: true,
      distanceMeters: 0,
      walkMinutes: 0,
      stepFreeAvailable: true,
      steps: [`Already on Platform ${fromPlatform.number}. Stand behind the yellow safety line.`]
    };
  }

  // Find candidate bridges connecting both platforms
  const connectingBridges = station.bridges.filter(
    b => b.connectedPlatforms.includes(fromPlatformId) && b.connectedPlatforms.includes(toPlatformId)
  );

  let chosenBridge: FootOverBridge | undefined;
  let stepFreeAvailable = false;

  if (connectingBridges.length > 0) {
    if (requireStepFreeAccess) {
      const stepFreeBridges = connectingBridges.filter(b => b.hasLifts);
      if (stepFreeBridges.length > 0) {
        chosenBridge = stepFreeBridges.sort(
          (a, b) => (a.typicalWalkMinutes * a.crowdFactor) - (b.typicalWalkMinutes * b.crowdFactor)
        )[0];
        stepFreeAvailable = true;
      } else {
        // No connecting bridge has lifts. Select best connecting bridge, but flag stepFree as false
        chosenBridge = connectingBridges.sort(
          (a, b) => (a.typicalWalkMinutes * a.crowdFactor) - (b.typicalWalkMinutes * b.crowdFactor)
        )[0];
        stepFreeAvailable = false;
      }
    } else {
      // Choose bridge with lowest walk time * crowd factor
      chosenBridge = connectingBridges.sort(
        (a, b) => (a.typicalWalkMinutes * a.crowdFactor) - (b.typicalWalkMinutes * b.crowdFactor)
      )[0];
      stepFreeAvailable = !!chosenBridge.hasLifts;
    }
  } else {
    // No direct single bridge connects both platforms
    return {
      success: false,
      distanceMeters: 0,
      walkMinutes: 0,
      stepFreeAvailable: false,
      steps: [
        `No single Foot-Over-Bridge directly connects Platform ${fromPlatform.number} and Platform ${toPlatform.number}. Please inquire at the Station Master or RPF assistance post for concourse transfer.`
      ]
    };
  }

  // Calculate distance between platform center X coordinates
  const physicalDistance = Math.abs(fromPlatform.x - toPlatform.x) + 40; // include stairs/bridge traversal
  const baseWalkTime = Math.max(2, Math.round((physicalDistance / 70) * (chosenBridge ? chosenBridge.crowdFactor : 1.2)));

  const steps = [
    `Alight from train onto Platform ${fromPlatform.number}.`,
    requireStepFreeAccess && !stepFreeAvailable
      ? `Notice: Direct elevator / lift access is not available on ${chosenBridge.name} for this transfer. Station staff assistance or ramp transfer required.`
      : requireStepFreeAccess && stepFreeAvailable
      ? `Take the accessible elevator up to ${chosenBridge.name}.`
      : `Ascend stairs / escalator onto ${chosenBridge.name}.`,
    `Walk along the bridge walkway toward Platform ${toPlatform.number} indicators (${physicalDistance}m).`,
    requireStepFreeAccess && stepFreeAvailable
      ? `Take the elevator down directly onto Platform ${toPlatform.number}.`
      : `Descend stairs / escalator onto Platform ${toPlatform.number}.`,
    `Arrive at Platform ${toPlatform.number}. Check digital indicator board for coach alignment.`
  ];

  return {
    success: true,
    recommendedBridge: chosenBridge,
    distanceMeters: physicalDistance,
    walkMinutes: baseWalkTime,
    stepFreeAvailable,
    steps
  };
}
