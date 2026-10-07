/**
 * Authentic Multi-City Railway & Transit Coverage Registry
 * Indian Railways Suburban Networks + Urban Metro Rail Systems
 * 
 * Mumbai is the fully developed flagship system.
 * Cities 2 through 8 provide transparent, verified coverage tiers and functional representative journeys.
 */

import { TravelClass } from '../types/railway';

export interface TransitModeInfo {
  id: string;
  name: string;
  operator: string;
  type: 'suburban' | 'metro' | 'regional' | 'water_metro';
  linesCount: number;
  timetableEffective: string;
  provenance: '[VERIFIED LIVE]' | '[TIMETABLE SCHEDULE]' | '[SIMULATED DATASET]';
}

export interface CityHubStation {
  code: string;
  name: string;
  nativeName?: string;
  line: string;
  isInterchange: boolean;
  platformsCount: number;
}

export interface RepresentativeJourney {
  id: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  line: string;
  trainName: string;
  serviceType: string;
  defaultClass: TravelClass;
  distanceKm: number;
  typicalDurationMin: number;
  fareII: number;
  fareI?: number;
  fareAC?: number;
  frequency: string;
}

export interface CityCoverageConfig {
  id: string;
  name: string;
  nativeName: string;
  state: string;
  tier: 'FLAGSHIP_TIER1' | 'REPRESENTATIVE_TIER2';
  provenanceTag: '[VERIFIED LIVE]' | '[TIMETABLE SCHEDULE]' | '[SIMULATED DATASET]';
  provenanceExplanation: string;
  modes: TransitModeInfo[];
  primaryHubs: CityHubStation[];
  representativeJourneys: RepresentativeJourney[];
}

export const CITIES_REGISTRY: Record<string, CityCoverageConfig> = {
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    nativeName: 'मुंबई',
    state: 'Maharashtra',
    tier: 'FLAGSHIP_TIER1',
    provenanceTag: '[TIMETABLE SCHEDULE]',
    provenanceExplanation: 'Full suburban quad-track network, official CR/WR September 2026 timetable schedule, and Mumbai Metro Line 1, 2A, 7 & 3 integration (Static Timetable Models).',
    modes: [
      { id: 'cr_suburban', name: 'Central Railway Suburban (Main & Harbour)', operator: 'Central Railway (CR)', type: 'suburban', linesCount: 3, timetableEffective: 'Sept 2026', provenance: '[TIMETABLE SCHEDULE]' },
      { id: 'wr_suburban', name: 'Western Railway Suburban', operator: 'Western Railway (WR)', type: 'suburban', linesCount: 1, timetableEffective: 'Sept 2026', provenance: '[TIMETABLE SCHEDULE]' },
      { id: 'mumbai_metro', name: 'Mumbai Metro (Lines 1, 2A, 7, 3)', operator: 'MMRDA / MMMOCL / MMRC', type: 'metro', linesCount: 4, timetableEffective: 'Oct 2026', provenance: '[TIMETABLE SCHEDULE]' },
      { id: 'trans_harbour', name: 'Trans-Harbour & Uran Corridors', operator: 'Central Railway (CR)', type: 'suburban', linesCount: 2, timetableEffective: 'Sept 2026', provenance: '[TIMETABLE SCHEDULE]' }
    ],
    primaryHubs: [
      { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', nativeName: 'छत्रपती शिवाजी महाराज टर्मिनस', line: 'Central Main / Harbour', isInterchange: true, platformsCount: 18 },
      { code: 'CCG', name: 'Churchgate', nativeName: 'चर्चगेट', line: 'Western', isInterchange: false, platformsCount: 4 },
      { code: 'DR', name: 'Dadar Junction', nativeName: 'दादर', line: 'CR + WR Dual Interchange', isInterchange: true, platformsCount: 15 },
      { code: 'TNA', name: 'Thane', nativeName: 'ठाणे', line: 'Central Main + Trans-Harbour', isInterchange: true, platformsCount: 10 },
      { code: 'KYN', name: 'Kalyan Junction', nativeName: 'कल्याण', line: 'Central Main Northeast/Southeast split', isInterchange: true, platformsCount: 8 },
      { code: 'ADH', name: 'Andheri', nativeName: 'अंधेरी', line: 'Western + Metro Line 1', isInterchange: true, platformsCount: 9 },
      { code: 'BVI', name: 'Borivali', nativeName: 'बोरिवली', line: 'Western Main Hub', isInterchange: true, platformsCount: 10 },
      { code: 'PNVL', name: 'Panvel', nativeName: 'पनवेल', line: 'Harbour + Trans-Harbour + Konkan', isInterchange: true, platformsCount: 7 }
    ],
    representativeJourneys: [
      { id: 'MUM-1', fromCode: 'TNA', fromName: 'Thane', toCode: 'CSMT', toName: 'CSMT', line: 'Central Fast', trainName: 'Kalyan - CSMT Fast Local', serviceType: 'Fast EMU', defaultClass: 'II', distanceKm: 33.6, typicalDurationMin: 45, fareII: 10, fareI: 105, fareAC: 95, frequency: 'Every 4-7 mins' },
      { id: 'MUM-2', fromCode: 'TNA', fromName: 'Thane', toCode: 'CCG', toName: 'Churchgate', line: 'Central + Western via Dadar', trainName: 'CR Fast ➔ FOB ➔ WR Fast', serviceType: 'Transfer Route', defaultClass: 'II', distanceKm: 44.5, typicalDurationMin: 62, fareII: 15, fareI: 145, fareAC: 135, frequency: 'Every 5-8 mins' },
      { id: 'MUM-3', fromCode: 'ADH', fromName: 'Andheri', toCode: 'CCG', toName: 'Churchgate', line: 'Western Fast', trainName: 'Borivali - Churchgate Fast Local', serviceType: 'Fast EMU', defaultClass: 'II', distanceKm: 21.8, typicalDurationMin: 32, fareII: 10, fareI: 85, fareAC: 70, frequency: 'Every 3-5 mins' },
      { id: 'MUM-4', fromCode: 'PNVL', fromName: 'Panvel', toCode: 'CSMT', toName: 'CSMT', line: 'Harbour Local', trainName: 'Panvel - CSMT Harbour Local', serviceType: 'Slow EMU', defaultClass: 'II', distanceKm: 48.9, typicalDurationMin: 72, fareII: 15, fareI: 145, fareAC: 135, frequency: 'Every 8-12 mins' }
    ]
  },

  pune: {
    id: 'pune',
    name: 'Pune',
    nativeName: 'पुणे',
    state: 'Maharashtra',
    tier: 'REPRESENTATIVE_TIER2',
    provenanceTag: '[TIMETABLE SCHEDULE]',
    provenanceExplanation: 'Central Railway Pune Suburban Timetable (Pune Jn - Lonavala EMU corridor) & Pune Metro Lines 1 & 2 published tariffs.',
    modes: [
      { id: 'pune_suburban', name: 'Pune Suburban Local EMU', operator: 'Central Railway (CR)', type: 'suburban', linesCount: 1, timetableEffective: 'Aug 2026', provenance: '[TIMETABLE SCHEDULE]' },
      { id: 'pune_metro', name: 'Maha Metro Pune (Purple & Aqua)', operator: 'Maha Metro', type: 'metro', linesCount: 2, timetableEffective: 'Sept 2026', provenance: '[TIMETABLE SCHEDULE]' }
    ],
    primaryHubs: [
      { code: 'PUNE', name: 'Pune Junction', nativeName: 'पुणे जंक्शन', line: 'CR Main Hub', isInterchange: true, platformsCount: 6 },
      { code: 'SVJR', name: 'Shivajinagar', nativeName: 'शिवाजीनगर', line: 'Suburban + Metro Line 1', isInterchange: true, platformsCount: 2 },
      { code: 'LNL', name: 'Lonavala', nativeName: 'लोणावळा', line: 'Suburban Terminus / Ghat Section', isInterchange: true, platformsCount: 3 },
      { code: 'CCH', name: 'Chinchwad', nativeName: 'चिंचवड', line: 'PCMC Industrial Corridor', isInterchange: false, platformsCount: 4 }
    ],
    representativeJourneys: [
      { id: 'PUN-1', fromCode: 'PUNE', fromName: 'Pune Junction', toCode: 'LNL', toName: 'Lonavala', line: 'Pune - Lonavala Suburban', trainName: 'Pune - Lonavala Local EMU', serviceType: 'Suburban EMU', defaultClass: 'II', distanceKm: 63.8, typicalDurationMin: 75, fareII: 20, fareI: 145, frequency: 'Every 45-60 mins' },
      { id: 'PUN-2', fromCode: 'PUNE', fromName: 'Pune Junction', toCode: 'SVJR', toName: 'Shivajinagar', line: 'Pune Suburban', trainName: 'Suburban Shuttle', serviceType: 'Suburban EMU', defaultClass: 'II', distanceKm: 2.5, typicalDurationMin: 6, fareII: 5, fareI: 50, frequency: 'Every 30 mins' }
    ]
  },

  delhi: {
    id: 'delhi',
    name: 'Delhi NCR',
    nativeName: 'दिल्ली एनसीआर',
    state: 'Delhi / Haryana / UP',
    tier: 'REPRESENTATIVE_TIER2',
    provenanceTag: '[TIMETABLE SCHEDULE]',
    provenanceExplanation: 'Northern Railway Delhi Division Suburban Ring Rail + DMRC Delhi Metro network lines.',
    modes: [
      { id: 'nr_suburban', name: 'Northern Railway Suburban & EMU', operator: 'Northern Railway (NR)', type: 'suburban', linesCount: 3, timetableEffective: 'July 2026', provenance: '[TIMETABLE SCHEDULE]' },
      { id: 'dmrc_metro', name: 'Delhi Metro (DMRC)', operator: 'Delhi Metro Rail Corp', type: 'metro', linesCount: 10, timetableEffective: 'Oct 2026', provenance: '[TIMETABLE SCHEDULE]' }
    ],
    primaryHubs: [
      { code: 'NDLS', name: 'New Delhi', nativeName: 'नई दिल्ली', line: 'Northern National + Yellow Line + Airport Exp', isInterchange: true, platformsCount: 16 },
      { code: 'DLI', name: 'Old Delhi Junction', nativeName: 'पुरानी दिल्ली', line: 'Heritage Main Hub', isInterchange: true, platformsCount: 16 },
      { code: 'NZM', name: 'Hazrat Nizamuddin', nativeName: 'हज़रत निज़ामुद्दीन', line: 'Southbound Trunk Hub', isInterchange: true, platformsCount: 8 },
      { code: 'ANVT', name: 'Anand Vihar Terminal', nativeName: 'आनंद विहार', line: 'Trans-Yamuna Terminus + Blue Line', isInterchange: true, platformsCount: 7 }
    ],
    representativeJourneys: [
      { id: 'DEL-1', fromCode: 'NDLS', fromName: 'New Delhi', toCode: 'GZB', toName: 'Ghaziabad', line: 'Delhi - Ghaziabad Corridor', trainName: 'New Delhi - Ghaziabad EMU', serviceType: 'Suburban EMU', defaultClass: 'II', distanceKm: 25.4, typicalDurationMin: 42, fareII: 10, fareI: 85, frequency: 'Every 20-30 mins' },
      { id: 'DEL-2', fromCode: 'NDLS', fromName: 'New Delhi', toCode: 'FDB', toName: 'Faridabad', line: 'Delhi - Agra Corridor', trainName: 'Palwal Passenger EMU', serviceType: 'Suburban EMU', defaultClass: 'II', distanceKm: 28.6, typicalDurationMin: 38, fareII: 10, fareI: 85, frequency: 'Every 25-35 mins' }
    ]
  },

  bengaluru: {
    id: 'bengaluru',
    name: 'Bengaluru',
    nativeName: 'ಬೆಂಗಳೂರು',
    state: 'Karnataka',
    tier: 'REPRESENTATIVE_TIER2',
    provenanceTag: '[TIMETABLE SCHEDULE]',
    provenanceExplanation: 'South Western Railway Bengaluru Division MEMU/DEMU commuter services & BMRCL Namma Metro Purple/Green lines.',
    modes: [
      { id: 'swr_suburban', name: 'SWR Suburban MEMU / Passenger', operator: 'South Western Railway (SWR)', type: 'suburban', linesCount: 2, timetableEffective: 'Aug 2026', provenance: '[TIMETABLE SCHEDULE]' },
      { id: 'namma_metro', name: 'Namma Metro (BMRCL)', operator: 'Bangalore Metro Rail Corp', type: 'metro', linesCount: 2, timetableEffective: 'Sept 2026', provenance: '[TIMETABLE SCHEDULE]' }
    ],
    primaryHubs: [
      { code: 'SBC', name: 'KSR Bengaluru (Majestic)', nativeName: 'ಕ್ರಾಂತಿವೀರ ಸಂಗೊಳ್ಳಿ ರಾಯಣ್ಣ ನಿಲ್ದಾಣ', line: 'SWR Central Hub + Purple/Green Metro', isInterchange: true, platformsCount: 10 },
      { code: 'YPR', name: 'Yesvantpur Junction', nativeName: 'ಯಶವಂತಪುರ', line: 'Northbound Main Hub + Green Line', isInterchange: true, platformsCount: 6 },
      { code: 'WFD', name: 'Whitefield', nativeName: 'ವೈಟ್‌ಫೀಲ್ಡ್', line: 'Tech Corridor + Metro Purple Line', isInterchange: true, platformsCount: 4 }
    ],
    representativeJourneys: [
      { id: 'BLR-1', fromCode: 'SBC', fromName: 'KSR Bengaluru', toCode: 'WFD', toName: 'Whitefield', line: 'Bengaluru Suburban MEMU', trainName: 'SBC - Whitefield MEMU Commuter', serviceType: 'MEMU', defaultClass: 'II', distanceKm: 23.2, typicalDurationMin: 35, fareII: 10, fareI: 75, frequency: 'Every 30-45 mins' }
    ]
  },

  kolkata: {
    id: 'kolkata',
    name: 'Kolkata',
    nativeName: 'কলকাতা',
    state: 'West Bengal',
    tier: 'REPRESENTATIVE_TIER2',
    provenanceTag: '[TIMETABLE SCHEDULE]',
    provenanceExplanation: 'Eastern & South Eastern Railway Suburban networks (Sealdah & Howrah Divisions) + Metro Railway Kolkata.',
    modes: [
      { id: 'er_suburban', name: 'Eastern Railway Suburban (Sealdah & Howrah)', operator: 'Eastern Railway (ER)', type: 'suburban', linesCount: 4, timetableEffective: 'Sept 2026', provenance: '[TIMETABLE SCHEDULE]' },
      { id: 'kolkata_metro', name: 'Metro Railway Kolkata (Blue & Green Underwater)', operator: 'Metro Railway / Indian Railways', type: 'metro', linesCount: 2, timetableEffective: 'Oct 2026', provenance: '[TIMETABLE SCHEDULE]' }
    ],
    primaryHubs: [
      { code: 'HWH', name: 'Howrah Junction', nativeName: 'হাওড়া জংশন', line: 'ER + SER Mega Terminal + Underwater Metro', isInterchange: true, platformsCount: 23 },
      { code: 'SDAH', name: 'Sealdah', nativeName: 'শিয়ালদহ', line: 'North/South Suburban Divisions', isInterchange: true, platformsCount: 21 },
      { code: 'KOAA', name: 'Kolkata Chitpur', nativeName: 'কলকাতা টার্মিনাল', line: 'International & National Trains', isInterchange: false, platformsCount: 5 }
    ],
    representativeJourneys: [
      { id: 'CCU-1', fromCode: 'SDAH', fromName: 'Sealdah', toCode: 'BNGA', toName: 'Bangaon', line: 'Sealdah North Main', trainName: 'Sealdah - Bangaon Local EMU', serviceType: 'Suburban EMU', defaultClass: 'II', distanceKm: 76.5, typicalDurationMin: 105, fareII: 20, frequency: 'Every 15-20 mins' }
    ]
  },

  chennai: {
    id: 'chennai',
    name: 'Chennai',
    nativeName: 'சென்னை',
    state: 'Tamil Nadu',
    tier: 'REPRESENTATIVE_TIER2',
    provenanceTag: '[TIMETABLE SCHEDULE]',
    provenanceExplanation: 'Southern Railway Chennai Suburban (Beach-Tambaram, MMC-Tiruvallur, MRTS) + CMRL Chennai Metro.',
    modes: [
      { id: 'sr_suburban', name: 'Southern Railway Chennai Suburban & MRTS', operator: 'Southern Railway (SR)', type: 'suburban', linesCount: 3, timetableEffective: 'Aug 2026', provenance: '[TIMETABLE SCHEDULE]' },
      { id: 'cmrl_metro', name: 'Chennai Metro (CMRL)', operator: 'Chennai Metro Rail Ltd', type: 'metro', linesCount: 2, timetableEffective: 'Sept 2026', provenance: '[TIMETABLE SCHEDULE]' }
    ],
    primaryHubs: [
      { code: 'MAS', name: 'Chennai Central (Puratchi Thalaivar Dr. MGR)', nativeName: 'சென்னை சென்ட்ரல்', line: 'SR National Trunk Hub + Metro Central', isInterchange: true, platformsCount: 15 },
      { code: 'MS', name: 'Chennai Egmore', nativeName: 'சென்னை எழும்பூர்', line: 'Southbound Trunk Hub', isInterchange: true, platformsCount: 11 },
      { code: 'MSB', name: 'Chennai Beach', nativeName: 'சென்னை கடற்கரை', line: 'Suburban / MRTS Zero Mile Hub', isInterchange: true, platformsCount: 8 },
      { code: 'TBM', name: 'Tambaram', nativeName: 'தாம்பரம்', line: 'South Suburban Commuter Hub', isInterchange: true, platformsCount: 8 }
    ],
    representativeJourneys: [
      { id: 'MAA-1', fromCode: 'MSB', fromName: 'Chennai Beach', toCode: 'TBM', toName: 'Tambaram', line: 'Beach - Tambaram Suburban', trainName: 'Chennai Beach - Tambaram Local EMU', serviceType: 'Suburban EMU', defaultClass: 'II', distanceKm: 29.1, typicalDurationMin: 52, fareII: 10, fareI: 85, frequency: 'Every 10-15 mins' }
    ]
  },

  hyderabad: {
    id: 'hyderabad',
    name: 'Hyderabad',
    nativeName: 'హైదరాబాద్',
    state: 'Telangana',
    tier: 'REPRESENTATIVE_TIER2',
    provenanceTag: '[TIMETABLE SCHEDULE]',
    provenanceExplanation: 'South Central Railway Hyderabad Division MMTS Multi-Modal Transport System + Hyderabad Metro (L&T Metro).',
    modes: [
      { id: 'scr_mmts', name: 'SCR Multi-Modal Transport System (MMTS)', operator: 'South Central Railway (SCR)', type: 'suburban', linesCount: 3, timetableEffective: 'Sept 2026', provenance: '[TIMETABLE SCHEDULE]' },
      { id: 'hyd_metro', name: 'Hyderabad Metro (L&T)', operator: 'Hyderabad Metro Rail', type: 'metro', linesCount: 3, timetableEffective: 'Sept 2026', provenance: '[TIMETABLE SCHEDULE]' }
    ],
    primaryHubs: [
      { code: 'SC', name: 'Secunderabad Junction', nativeName: 'సికింద్రాబాద్ జంక్షన్', line: 'SCR Central Hub + MMTS + Metro Blue/Green', isInterchange: true, platformsCount: 10 },
      { code: 'HYB', name: 'Hyderabad Deccan (Nampally)', nativeName: 'హైదరాబాద్ డెక్కన్', line: 'Heritage Terminus + MMTS + Metro Red', isInterchange: true, platformsCount: 6 },
      { code: 'LPI', name: 'Lingampalli', nativeName: 'లింగంపల్లి', line: 'HITEC City Tech Commuter Hub', isInterchange: true, platformsCount: 6 }
    ],
    representativeJourneys: [
      { id: 'HYD-1', fromCode: 'HYB', fromName: 'Hyderabad Deccan', toCode: 'LPI', toName: 'Lingampalli', line: 'MMTS Corridor 1', trainName: 'Hyderabad - Lingampalli MMTS Local', serviceType: 'MMTS Commuter', defaultClass: 'II', distanceKm: 23.4, typicalDurationMin: 44, fareII: 10, fareI: 75, frequency: 'Every 20-30 mins' }
    ]
  },

  kochi: {
    id: 'kochi',
    name: 'Kochi',
    nativeName: 'കൊച്ചി',
    state: 'Kerala',
    tier: 'REPRESENTATIVE_TIER2',
    provenanceTag: '[TIMETABLE SCHEDULE]',
    provenanceExplanation: 'Southern Railway Thiruvananthapuram Division + Kochi Metro Rail (KMRL) + Kochi Water Metro integrated multimodal network.',
    modes: [
      { id: 'sr_commuter', name: 'Southern Railway Commuter Passenger/MEMU', operator: 'Southern Railway (SR)', type: 'suburban', linesCount: 1, timetableEffective: 'Aug 2026', provenance: '[TIMETABLE SCHEDULE]' },
      { id: 'kochi_metro', name: 'Kochi Metro (KMRL)', operator: 'Kochi Metro Rail Limited', type: 'metro', linesCount: 1, timetableEffective: 'Oct 2026', provenance: '[TIMETABLE SCHEDULE]' },
      { id: 'kochi_water_metro', name: 'Kochi Water Metro (Electric Ferries)', operator: 'KMRL Water Metro', type: 'water_metro', linesCount: 2, timetableEffective: 'Oct 2026', provenance: '[TIMETABLE SCHEDULE]' }
    ],
    primaryHubs: [
      { code: 'ERS', name: 'Ernakulam Junction (South)', nativeName: 'എറണാകുളം ജംങ്ഷൻ', line: 'SR Main Hub + Metro South Hub', isInterchange: true, platformsCount: 6 },
      { code: 'ERN', name: 'Ernakulam Town (North)', nativeName: 'എറണാകുളം ടൗൺ', line: 'Suburban Calling Station + Metro North', isInterchange: true, platformsCount: 2 },
      { code: 'AWY', name: 'Aluva', nativeName: 'ആലുവ', line: 'Railway Station + Metro Phase 1 Terminal', isInterchange: true, platformsCount: 3 }
    ],
    representativeJourneys: [
      { id: 'COK-1', fromCode: 'ERS', fromName: 'Ernakulam Junction', toCode: 'AWY', toName: 'Aluva', line: 'SR Main Corridor', trainName: 'Ernakulam - Shoranur MEMU', serviceType: 'MEMU Passenger', defaultClass: 'II', distanceKm: 20.2, typicalDurationMin: 32, fareII: 10, frequency: 'Every 40-50 mins' }
    ]
  }
};
