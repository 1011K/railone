/**
 * Multi-Country Institutional Transport Authority System
 * 
 * Provides official government transport authority definitions, emblems,
 * statutory charters, currencies, stations, corridors, and fare models.
 * 
 * Supported Institutional Authorities:
 * 1. Republic of India — Ministry of Railways / CRIS (Flagship)
 * 2. United Kingdom — Department for Transport / National Rail
 * 3. Japan — Ministry of Land, Infrastructure, Transport & Tourism / JR East
 * 4. Swiss Confederation — Federal Dept. of Environment, Transport / SBB CFF FFS
 * 5. Federal Republic of Germany — Federal Ministry for Digital & Transport / Deutsche Bahn
 */

export type AuthorityId = 'india' | 'uk' | 'japan' | 'switzerland' | 'germany';

export interface AuthorityStation {
  code: string;
  name: string;
  nativeName?: string;
  city: string;
  isMajorHub: boolean;
  platforms: number[];
  lines: string[];
}

export interface AuthorityClass {
  code: string;
  name: string;
  nativeName?: string;
  description: string;
  fareMultiplier: number;
  badgeColor: string;
}

export interface AuthorityCorridor {
  name: string;
  nativeName?: string;
  serviceType: string;
  from: string;
  to: string;
  averageFrequencyMinutes: number;
  rakeType: string;
}

export interface InstitutionalAuthority {
  id: AuthorityId;
  countryCode: string;
  countryName: string;
  governmentBody: string;
  operatingAgency: string;
  shortTitle: string;
  motto?: string;
  statutoryAct: string;
  regulatoryCharter: string;
  currency: {
    symbol: string;
    code: string;
    name: string;
    fractionalName: string;
  };
  inspectorTitle: string;
  emergencyContacts: Array<{
    number: string;
    label: string;
    description: string;
    isPrimary: boolean;
  }>;
  officialPortalUrl: string;
  officialDomain: string;
  watermarkText: string;
  securityPillText: string;
  defaultOriginCode: string;
  defaultDestCode: string;
  stations: AuthorityStation[];
  classes: AuthorityClass[];
  corridors: AuthorityCorridor[];
  statutoryPenalty: {
    lawCitation: string;
    standardPenaltyAmount: number;
    description: string;
  };
}

export const INSTITUTIONAL_AUTHORITIES: Record<AuthorityId, InstitutionalAuthority> = {
  india: {
    id: 'india',
    countryCode: 'IN',
    countryName: 'Republic of India',
    governmentBody: 'Ministry of Railways · Government of India',
    operatingAgency: 'Ministry of Railways · Indian Railways',
    shortTitle: 'Indian Railways',
    motto: 'Lifeline of the Nation · राष्ट्र की जीवन रेखा',
    statutoryAct: 'The Railways Act, 1989 (Act No. 24 of 1989)',
    regulatoryCharter: 'Statutory Passenger Tariff & Unreserved Ticketing System Framework',
    currency: {
      symbol: '₹',
      code: 'INR',
      name: 'Indian Rupee',
      fractionalName: 'Paise'
    },
    inspectorTitle: 'Travelling Ticket Examiner (TTE)',
    emergencyContacts: [
      {
        number: '139',
        label: 'Statutory Railway Helpline',
        description: 'Integrated 24/7 Security, RPF, Medical & Passenger Grievance Assistance',
        isPrimary: true
      },
      {
        number: '182',
        label: 'Railway Protection Force (RPF)',
        description: 'Direct Security Emergency Response inside trains and on platform premises',
        isPrimary: false
      }
    ],
    officialPortalUrl: 'https://indianrailways.gov.in',
    officialDomain: 'indianrailways.gov.in',
    watermarkText: 'DEMO – NOT VALID FOR TRAVEL · INDEPENDENT RESEARCH DEMONSTRATION',
    securityPillText: 'INDEPENDENT RESEARCH · NOT OFFICIAL RAILONE',
    defaultOriginCode: 'TNA',
    defaultDestCode: 'CSMT',
    stations: [
      { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', nativeName: 'छत्रपती शिवाजी महाराज टर्मिनस', city: 'Mumbai', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], lines: ['Central Main', 'Harbour', 'Pan-India Express'] },
      { code: 'DR', name: 'Dadar Junction', nativeName: 'दादर जंक्शन', city: 'Mumbai', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8], lines: ['Central Main', 'Western Fast/Slow', 'Pan-India Express'] },
      { code: 'TNA', name: 'Thane Junction', nativeName: 'ठाणे', city: 'Mumbai', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], lines: ['Central Main', 'Trans-Harbour'] },
      { code: 'KYN', name: 'Kalyan Junction', nativeName: 'कल्याण', city: 'Mumbai', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7], lines: ['Central Main', 'Kasara Branch', 'Karjat Branch'] },
      { code: 'ADH', name: 'Andheri', nativeName: 'अंधेरी', city: 'Mumbai', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9], lines: ['Western Fast/Slow', 'Harbour', 'Mumbai Metro 1'] },
      { code: 'CCG', name: 'Churchgate', nativeName: 'चर्चगेट', city: 'Mumbai', isMajorHub: true, platforms: [1, 2, 3, 4], lines: ['Western Suburban'] },
      { code: 'BVI', name: 'Borivali', nativeName: 'बोरिवली', city: 'Mumbai', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9], lines: ['Western Fast/Slow', 'Pan-India Express'] },
      { code: 'PNVL', name: 'Panvel Junction', nativeName: 'पनवेल', city: 'Navi Mumbai', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7], lines: ['Harbour', 'Trans-Harbour', 'Konkan Railway'] },
      { code: 'NDLS', name: 'New Delhi Central', nativeName: 'नई दिल्ली', city: 'New Delhi', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], lines: ['Northern Railway', 'Vande Bharat', 'Rajdhani Trunk'] },
      { code: 'HWH', name: 'Howrah Junction', nativeName: 'হাওড়া', city: 'Kolkata', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], lines: ['Eastern Railway', 'South Eastern Railway'] }
    ],
    classes: [
      { code: 'II', name: 'Second Class (UTS Unreserved)', nativeName: 'द्वितीय श्रेणी', description: 'Universal unreserved suburban transit access', fareMultiplier: 1.0, badgeColor: 'bg-slate-700 text-white' },
      { code: 'I', name: 'First Class Suburban', nativeName: 'प्रथम श्रेणी', description: 'Priority cushioned seating compartment', fareMultiplier: 8.5, badgeColor: 'bg-amber-600 text-white' },
      { code: 'AC_LOCAL', name: 'Air-Conditioned EMU Local', nativeName: 'वातानुकूलित लोकल', description: 'Vestibuled sealed rakes with climate control', fareMultiplier: 10.5, badgeColor: 'bg-cyan-600 text-white' },
      { code: 'SL', name: 'Sleeper Class Express', nativeName: 'शयनयान श्रेणी', description: 'Long-distance non-AC reserved sleeper berths', fareMultiplier: 2.2, badgeColor: 'bg-blue-700 text-white' },
      { code: '3A', name: 'AC 3-Tier', nativeName: 'वातानुकूलित ३-टियर', description: 'Climate controlled 3-tier berths with linen', fareMultiplier: 5.8, badgeColor: 'bg-indigo-700 text-white' },
      { code: 'EC', name: 'Executive Chair Car', nativeName: 'एग्जीक्यूटिव चेयर कार', description: 'Vande Bharat premium 180° rotatable leather armchairs', fareMultiplier: 12.0, badgeColor: 'bg-purple-700 text-white' }
    ],
    corridors: [
      { name: 'Central Main Line (CSMT ➔ Thane ➔ Kalyan)', nativeName: 'मध्य रेल्वे मुख्य मार्ग', serviceType: 'Quad-Track Fast & Slow Corridor', from: 'CSMT', to: 'KYN', averageFrequencyMinutes: 3, rakeType: '12 & 15-Car EMU' },
      { name: 'Western Line (Churchgate ➔ Dadar ➔ Borivali)', nativeName: 'पश्चिम रेल्वे मार्ग', serviceType: 'Suburban AC & Fast Trunk', from: 'CCG', to: 'BVI', averageFrequencyMinutes: 3, rakeType: '12 & 15-Car AC EMU' },
      { name: 'Harbour Line (CSMT ➔ Kurla ➔ Panvel)', nativeName: 'हार्बर मार्ग', serviceType: 'Suburban Coastal Corridor', from: 'CSMT', to: 'PNVL', averageFrequencyMinutes: 5, rakeType: '12-Car EMU' },
      { name: 'Vande Bharat Intercity Corridors', nativeName: 'वंदे भारत सुपरफास्ट', serviceType: 'Semi-High Speed Express 160 km/h', from: 'CSMT', to: 'NDLS', averageFrequencyMinutes: 120, rakeType: '16-Car Vande Bharat' }
    ],
    statutoryPenalty: {
      lawCitation: 'The Railways Act 1989 Section 138 & 137',
      standardPenaltyAmount: 500,
      description: 'Travelling without valid ticket incurs full single fare plus minimum statutory excess charge of ₹500.'
    }
  },

  uk: {
    id: 'uk',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    governmentBody: 'Department for Transport · His Majesty’s Government',
    operatingAgency: 'National Rail · Great British Railways (GBR)',
    shortTitle: 'National Rail (DfT)',
    motto: 'Connecting Communities · Safe & Reliable Transit',
    statutoryAct: 'Railways Act 1993 · National Rail Conditions of Travel (NRCoT)',
    regulatoryCharter: 'National Conditions of Travel & Penalty Fares Regulations 2018',
    currency: {
      symbol: '£',
      code: 'GBP',
      name: 'British Pound',
      fractionalName: 'Pence'
    },
    inspectorTitle: 'Revenue Protection Officer (RPO)',
    emergencyContacts: [
      {
        number: '61016',
        label: 'British Transport Police (Text SOS)',
        description: 'Discreet non-verbal emergency text service on all trains and stations nationwide',
        isPrimary: true
      },
      {
        number: '0800 40 50 40',
        label: 'British Transport Police Control',
        description: 'National 24-hour rail police emergency and incident reporting helpline',
        isPrimary: false
      }
    ],
    officialPortalUrl: 'https://nationalrail.co.uk',
    officialDomain: 'nationalrail.co.uk',
    watermarkText: 'HIS MAJESTY’S GOVERNMENT · DfT · NATIONAL RAIL DIGITAL TRAVEL PASS',
    securityPillText: 'HM GOVT · NATIONAL RAIL SECURE',
    defaultOriginCode: 'WAT',
    defaultDestCode: 'PAD',
    stations: [
      { code: 'KGX', name: "London King's Cross", city: 'London', isMajorHub: true, platforms: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], lines: ['East Coast Main Line', 'Thameslink', 'London Underground'] },
      { code: 'EUS', name: 'London Euston', city: 'London', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], lines: ['West Coast Main Line', 'London Overground'] },
      { code: 'WAT', name: 'London Waterloo', city: 'London', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], lines: ['South Western Main Line', 'Waterloo & City'] },
      { code: 'PAD', name: 'London Paddington', city: 'London', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], lines: ['Great Western Main Line', 'Elizabeth Line', 'Heathrow Express'] },
      { code: 'MAN', name: 'Manchester Piccadilly', city: 'Manchester', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], lines: ['Northern', 'TransPennine Express', 'Avanti West Coast'] },
      { code: 'EDB', name: 'Edinburgh Waverley', city: 'Edinburgh', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], lines: ['ScotRail', 'LNER', 'CrossCountry'] },
      { code: 'BHM', name: 'Birmingham New Street', city: 'Birmingham', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], lines: ['West Midlands Railway', 'CrossCountry'] },
      { code: 'LDS', name: 'Leeds City Station', city: 'Leeds', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], lines: ['Northern', 'LNER', 'TransPennine'] }
    ],
    classes: [
      { code: 'STD', name: 'Standard Class', description: 'Universal national rail passenger accommodation with Wi-Fi and power', fareMultiplier: 1.0, badgeColor: 'bg-slate-700 text-white' },
      { code: '1ST', name: 'First Class', description: 'Extra legroom, quieter carriages, complimentary refreshments and lounge access', fareMultiplier: 2.4, badgeColor: 'bg-amber-600 text-white' },
      { code: 'OFF', name: 'Off-Peak Day Return', description: 'Valid outside morning and evening rush commuter windows', fareMultiplier: 0.8, badgeColor: 'bg-emerald-600 text-white' },
      { code: 'ANY', name: 'Anytime Open Single', description: 'Unrestricted travel on any train on the specified route', fareMultiplier: 1.4, badgeColor: 'bg-blue-600 text-white' }
    ],
    corridors: [
      { name: 'East Coast Main Line (London King’s Cross ➔ Edinburgh)', serviceType: 'High-Speed Azuma Intercity 200 km/h', from: 'KGX', to: 'EDB', averageFrequencyMinutes: 30, rakeType: '9-Car Class 800/801 Bi-mode' },
      { name: 'West Coast Main Line (London Euston ➔ Manchester)', serviceType: 'Pendolino Tilting Intercity 200 km/h', from: 'EUS', to: 'MAN', averageFrequencyMinutes: 20, rakeType: '11-Car Class 390 Pendolino' },
      { name: 'Elizabeth Line (Reading ➔ Paddington ➔ Abbey Wood)', serviceType: 'Cross-London High-Capacity Suburban', from: 'PAD', to: 'WAT', averageFrequencyMinutes: 4, rakeType: '9-Car Class 345 Aventra' },
      { name: 'Great Western Main Line (London Paddington ➔ Bristol)', serviceType: 'Intercity Express Express Corridor', from: 'PAD', to: 'BHM', averageFrequencyMinutes: 15, rakeType: '10-Car Class 800 IET' }
    ],
    statutoryPenalty: {
      lawCitation: 'Railways (Penalty Fares) Regulations 2018',
      standardPenaltyAmount: 100,
      description: 'Travelling without a valid ticket incurs a penalty fare of £100 plus the price of the full single fare (reduced to £50 if paid within 21 days).'
    }
  },

  japan: {
    id: 'japan',
    countryCode: 'JP',
    countryName: 'Japan (日本国)',
    governmentBody: 'Ministry of Land, Infrastructure, Transport and Tourism (国土交通省)',
    operatingAgency: 'East Japan Railway Company (JR East · 東日本旅客鉄道株式会社)',
    shortTitle: 'JR East (MLIT · 国土交通省)',
    motto: 'Punctuality, Precision & Absolute Safety · 正確・安全・信頼',
    statutoryAct: 'Railway Operation Act (鉄道営業法) · Passenger Operation Regulations (旅客営業規則)',
    regulatoryCharter: 'Statutory Passenger Operations & Smart Fare Integration Framework',
    currency: {
      symbol: '¥',
      code: 'JPY',
      name: 'Japanese Yen',
      fractionalName: 'Sen'
    },
    inspectorTitle: 'Train Conductor (車掌 - Shasō)',
    emergencyContacts: [
      {
        number: '050-2016-1603',
        label: 'JR East Multilingual Passenger Line',
        description: 'Official 24/7 English, Chinese, Korean, and Japanese customer assistance',
        isPrimary: true
      },
      {
        number: '110',
        label: 'Railway Police Force (鉄道警察隊)',
        description: 'National metropolitan railway security, platform patrol and emergency defense',
        isPrimary: false
      }
    ],
    officialPortalUrl: 'https://jreast.co.jp',
    officialDomain: 'jreast.co.jp',
    watermarkText: 'GOVERNMENT OF JAPAN · MLIT · EAST JAPAN RAILWAY COMPANY AUTHORIZED PASS',
    securityPillText: 'MLIT JAPAN · JR EAST SECURE',
    defaultOriginCode: 'TYO',
    defaultDestCode: 'SJK',
    stations: [
      { code: 'TYO', name: 'Tokyo Station (東京)', nativeName: '東京駅', city: 'Tokyo', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 21, 22, 23], lines: ['Yamanote Line', 'Tokaido Shinkansen', 'Tohoku Shinkansen', 'Chuo Line'] },
      { code: 'SJK', name: 'Shinjuku (新宿)', nativeName: '新宿駅', city: 'Tokyo', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], lines: ['Yamanote Line', 'Chūō Rapid', 'Saikyō Line', 'Shonan-Shinjuku Line'] },
      { code: 'SBY', name: 'Shibuya (渋谷)', nativeName: '渋谷駅', city: 'Tokyo', isMajorHub: true, platforms: [1, 2, 3, 4], lines: ['Yamanote Line', 'Saikyō Line', 'Tokyo Metro Ginza'] },
      { code: 'SGW', name: 'Shinagawa (品川)', nativeName: '品川駅', city: 'Tokyo', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], lines: ['Yamanote Line', 'Tokaido Shinkansen', 'Keikyu Main Line'] },
      { code: 'UEN', name: 'Ueno (上野)', nativeName: '上野駅', city: 'Tokyo', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], lines: ['Yamanote Line', 'Joban Line', 'Tohoku Shinkansen'] },
      { code: 'YKH', name: 'Yokohama (横浜)', nativeName: '横浜駅', city: 'Yokohama', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], lines: ['Tokaido Main Line', 'Keihin-Tohoku', 'Yokosuka Line'] },
      { code: 'KYO', name: 'Kyoto Station (京都)', nativeName: '京都駅', city: 'Kyoto', isMajorHub: true, platforms: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], lines: ['Tokaido Shinkansen', 'JR Kyoto Line', 'Sanin Main Line'] },
      { code: 'OSA', name: 'Shin-Osaka (新大阪)', nativeName: '新大阪駅', city: 'Osaka', isMajorHub: true, platforms: [1, 2, 3, 4, 20, 21, 22, 23, 24, 25, 26, 27], lines: ['Tokaido Shinkansen', 'Sanyo Shinkansen', 'JR Kyoto Line'] }
    ],
    classes: [
      { code: 'ORD', name: 'Ordinary Car (普通車)', nativeName: '普通車', description: 'Standard high-density, ergonomic commuter and rapid seating', fareMultiplier: 1.0, badgeColor: 'bg-slate-700 text-white' },
      { code: 'GRN', name: 'Green Car (グリーン車)', nativeName: 'グリーン車', description: 'First-class spacious 2+2 luxury reclining seating with attendant service', fareMultiplier: 1.8, badgeColor: 'bg-emerald-600 text-white' },
      { code: 'GRC', name: 'Gran Class (グランクラス)', nativeName: 'グランクラス', description: 'Top-tier bullet train luxury 2+1 automated leather pod suites with dining', fareMultiplier: 3.2, badgeColor: 'bg-amber-600 text-white' },
      { code: 'SHK', name: 'Shinkansen Reserved (新幹線指定席)', nativeName: '指定席', description: 'High-speed 320 km/h bullet train reserved seating', fareMultiplier: 2.1, badgeColor: 'bg-blue-600 text-white' }
    ],
    corridors: [
      { name: 'Yamanote Line Ring (山手線 循環)', nativeName: '山手線', serviceType: 'High-Density Circular Loop EMU', from: 'TYO', to: 'SJK', averageFrequencyMinutes: 2, rakeType: '11-Car E235 Series' },
      { name: 'Tokaido Shinkansen (Tokyo ➔ Kyoto ➔ Shin-Osaka)', nativeName: '東海道新幹線 (のぞみ)', serviceType: 'High-Speed Bullet Train 285 km/h', from: 'TYO', to: 'OSA', averageFrequencyMinutes: 4, rakeType: '16-Car N700S Series' },
      { name: 'Chūō Rapid Line (Tokyo ➔ Shinjuku ➔ Takao)', nativeName: '中央線快速', serviceType: 'Rapid Commuter Trunk Line', from: 'TYO', to: 'SJK', averageFrequencyMinutes: 3, rakeType: '10+2 Car E233 Series' },
      { name: 'Tohoku Shinkansen Hayabusa (Tokyo ➔ Sendai ➔ Aomori)', nativeName: '東北新幹線 (はやぶさ)', serviceType: 'Ultra High-Speed Bullet Train 320 km/h', from: 'TYO', to: 'UEN', averageFrequencyMinutes: 15, rakeType: '10-Car E5 Series' }
    ],
    statutoryPenalty: {
      lawCitation: 'Railway Operation Act Article 18 & JR Passenger Conditions',
      standardPenaltyAmount: 3000,
      description: 'Travelling without valid ticket or in unauthorized coach requires payment of full regular fare plus statutory surcharge equal to twice the regular fare.'
    }
  },

  switzerland: {
    id: 'switzerland',
    countryCode: 'CH',
    countryName: 'Swiss Confederation (Confœderatio Helvetica)',
    governmentBody: 'Federal Department of the Environment, Transport, Energy and Communications (DATEC/UVEK)',
    operatingAgency: 'Swiss Federal Railways (SBB CFF FFS)',
    shortTitle: 'SBB CFF FFS (DATEC)',
    motto: 'Precision, Sustainability & Alpine Connectivity',
    statutoryAct: 'Swiss Passenger Transport Act (Personenbeförderungsgesetz PBG) · Tarif 600',
    regulatoryCharter: 'Alliance SwissPass National Public Transport Integrated Accord',
    currency: {
      symbol: 'CHF ',
      code: 'CHF',
      name: 'Swiss Franc',
      fractionalName: 'Rappen'
    },
    inspectorTitle: 'Train Conductor (Zugbegleiter / Contrôleur de Train)',
    emergencyContacts: [
      {
        number: '0848 44 66 88',
        label: 'SBB Contact Center 24/7',
        description: 'Comprehensive nationwide customer service, schedule assistance and luggage recovery',
        isPrimary: true
      },
      {
        number: '0800 117 117',
        label: 'Swiss Transport Police (Bahnpolizei)',
        description: 'Dedicated federal railway safety police authority for stations and trains',
        isPrimary: false
      }
    ],
    officialPortalUrl: 'https://sbb.ch',
    officialDomain: 'sbb.ch',
    watermarkText: 'SWISS CONFEDERATION · DATEC · SBB CFF FFS BILLET ÉLECTRONIQUE NATIONAL',
    securityPillText: 'CONFŒDERATIO HELVETICA · SBB SECURE',
    defaultOriginCode: 'ZRH',
    defaultDestCode: 'BN',
    stations: [
      { code: 'ZRH', name: 'Zürich Hauptbahnhof', nativeName: 'Zürich HB', city: 'Zürich', isMajorHub: true, platforms: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 31, 32, 33, 34, 41, 42, 43, 44], lines: ['Gotthard Route', 'InterCity (IC)', 'S-Bahn Zürich'] },
      { code: 'GVA', name: 'Genève-Cornavin', nativeName: 'Genève', city: 'Genève', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8], lines: ['Léman Express', 'TGV Lyria', 'SBB InterCity'] },
      { code: 'BN', name: 'Bern Hauptbahnhof', nativeName: 'Bern', city: 'Bern', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13], lines: ['BLS', 'SBB InterCity', 'Bern S-Bahn'] },
      { code: 'BSL', name: 'Basel SBB', nativeName: 'Basel SBB', city: 'Basel', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17], lines: ['SBB InterCity', 'ICE Cross-border', 'TER France'] },
      { code: 'LUZ', name: 'Luzern', nativeName: 'Luzern', city: 'Luzern', isMajorHub: true, platforms: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], lines: ['Zentralbahn', 'Gotthard Panorama', 'SBB Regio'] },
      { code: 'LAU', name: 'Lausanne', nativeName: 'Lausanne', city: 'Lausanne', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9], lines: ['SBB InterCity', 'RER Vaud'] },
      { code: 'INT', name: 'Interlaken Ost', nativeName: 'Interlaken Ost', city: 'Interlaken', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 7, 8], lines: ['Jungfraubahn', 'BLS', 'Zentralbahn'] },
      { code: 'ZMT', name: 'Zermatt', nativeName: 'Zermatt', city: 'Zermatt', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6], lines: ['Matterhorn Gotthard Bahn', 'Glacier Express'] }
    ],
    classes: [
      { code: '2CL', name: '2. Klasse (2nd Class)', nativeName: '2e classe', description: 'Clean, whisper-quiet standard carriage with ergonomic 2+2 layout', fareMultiplier: 1.0, badgeColor: 'bg-slate-700 text-white' },
      { code: '1CL', name: '1. Klasse (1st Class)', nativeName: '1ère classe', description: 'Spacious 2+1 armchairs, designated business & silent work zones', fareMultiplier: 1.75, badgeColor: 'bg-amber-600 text-white' },
      { code: 'HAL', name: 'Half Fare Travelcard (Halbtax)', nativeName: 'Demi-tarif', description: 'Subsidized statutory 50% discount on entire public transit network', fareMultiplier: 0.5, badgeColor: 'bg-emerald-600 text-white' },
      { code: 'PAN', name: 'Panorama Alpine Car', nativeName: 'Voiture Panoramique', description: 'Floor-to-ceiling glass alpine vista dome seating', fareMultiplier: 2.2, badgeColor: 'bg-blue-600 text-white' }
    ],
    corridors: [
      { name: 'Gotthard Base Route (Zürich HB ➔ Lugano ➔ Milano)', nativeName: 'Gotthard-Basistunnel', serviceType: 'High-Speed Alpine Base Transit 250 km/h', from: 'ZRH', to: 'BN', averageFrequencyMinutes: 30, rakeType: '11-Car Giruno EC 250' },
      { name: 'InterCity Trunk (Genève ➔ Lausanne ➔ Bern ➔ Zürich)', nativeName: 'Transversale Ouest-Est', serviceType: 'Double-Deck InterCity Express', from: 'GVA', to: 'ZRH', averageFrequencyMinutes: 30, rakeType: '8-Car FV-Dosto Twindexx' },
      { name: 'S-Bahn Zürich (Stadelhofen ➔ HB ➔ Winterthur)', nativeName: 'S-Bahn Zürich', serviceType: 'Metropolitan High-Frequency Rapid Transit', from: 'ZRH', to: 'BSL', averageFrequencyMinutes: 10, rakeType: '6-Car Regio Dosto' },
      { name: 'Glacier Express Alpine Corridor (Zermatt ➔ St. Moritz)', nativeName: 'Glacier Express', serviceType: 'Panoramic Scenic Mountain Express', from: 'ZMT', to: 'LUZ', averageFrequencyMinutes: 60, rakeType: '6-Car Panoramic Rake' }
    ],
    statutoryPenalty: {
      lawCitation: 'Personenbeförderungsgesetz PBG & Tarif 600 Artikel 50',
      standardPenaltyAmount: 100,
      description: 'Travelling without a valid SwissPass ticket incurs a statutory surcharge of CHF 100 on first offense (CHF 140 on second offense).'
    }
  },

  germany: {
    id: 'germany',
    countryCode: 'DE',
    countryName: 'Federal Republic of Germany (Bundesrepublik Deutschland)',
    governmentBody: 'Federal Ministry for Digital and Transport (BMDV)',
    operatingAgency: 'Deutsche Bahn AG (DB Fernverkehr & DB Regio)',
    shortTitle: 'Deutsche Bahn (BMDV)',
    motto: 'Mobility for the Future · Zukunft Bahn',
    statutoryAct: 'General Railway Act (AEG) · Railway Transport Regulations (EVO)',
    regulatoryCharter: 'Federal Passenger Transport Conditions (Beförderungsbedingungen der DB AG)',
    currency: {
      symbol: '€',
      code: 'EUR',
      name: 'Euro',
      fractionalName: 'Cent'
    },
    inspectorTitle: 'Train Conductor (Zugchef / Zugbegleiter DB)',
    emergencyContacts: [
      {
        number: '030 2970',
        label: 'DB Reise-Service & Servicecenter',
        description: 'Central nationwide timetable, booking support and mobility service',
        isPrimary: true
      },
      {
        number: '0800 6 888 000',
        label: 'Bundespolizei (Federal Police Railway Hotline)',
        description: 'Toll-free 24-hour security and rapid intervention on all German railway facilities',
        isPrimary: false
      }
    ],
    officialPortalUrl: 'https://bahn.de',
    officialDomain: 'bahn.de',
    watermarkText: 'BUNDESREPUBLIK DEUTSCHLAND · BMDV · DEUTSCHE BAHN AG DIGITALES ONLINETICKET',
    securityPillText: 'BUNDESREPUBLIK · DB AG VERIFIZIERT',
    defaultOriginCode: 'BER',
    defaultDestCode: 'MUN',
    stations: [
      { code: 'BER', name: 'Berlin Hauptbahnhof', nativeName: 'Berlin Hbf', city: 'Berlin', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16], lines: ['ICE Sprinter', 'S-Bahn Berlin', 'RE Regional-Express'] },
      { code: 'MUN', name: 'München Hauptbahnhof', nativeName: 'München Hbf', city: 'München', isMajorHub: true, platforms: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], lines: ['ICE High-Speed', 'S-Bahn Stammstrecke'] },
      { code: 'FRA', name: 'Frankfurt(Main) Hauptbahnhof', nativeName: 'Frankfurt(Main) Hbf', city: 'Frankfurt am Main', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 101, 102, 103, 104], lines: ['ICE Core Hub', 'S-Bahn Rhein-Main'] },
      { code: 'HAM', name: 'Hamburg Hauptbahnhof', nativeName: 'Hamburg Hbf', city: 'Hamburg', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], lines: ['ICE Nordic Trunk', 'S-Bahn Hamburg'] },
      { code: 'CGN', name: 'Köln Hauptbahnhof', nativeName: 'Köln Hbf', city: 'Köln', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], lines: ['ICE Rhine Corridor', 'Eurostar Continental', 'S-Bahn Köln'] },
      { code: 'STR', name: 'Stuttgart Hauptbahnhof', nativeName: 'Stuttgart Hbf', city: 'Stuttgart', isMajorHub: true, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], lines: ['ICE High-Speed', 'S-Bahn Stuttgart'] },
      { code: 'DUS', name: 'Düsseldorf Hauptbahnhof', nativeName: 'Düsseldorf Hbf', city: 'Düsseldorf', isMajorHub: true, platforms: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], lines: ['ICE Rhine-Ruhr', 'RRX'] },
      { code: 'LEI', name: 'Leipzig Hauptbahnhof', nativeName: 'Leipzig Hbf', city: 'Leipzig', isMajorHub: true, platforms: [1, 2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], lines: ['ICE Ost-Trunk', 'S-Bahn Mitteldeutschland'] }
    ],
    classes: [
      { code: '2KL', name: '2. Klasse (2nd Class Standard)', nativeName: '2. Klasse', description: 'Ergonomic seating with USB power, reading lamps and DB ICE Portal access', fareMultiplier: 1.0, badgeColor: 'bg-slate-700 text-white' },
      { code: '1KL', name: '1. Klasse (1st Class Premium)', nativeName: '1. Klasse', description: 'Generous 2+1 seating, at-seat dining service, quiet zone & DB Lounge entry', fareMultiplier: 1.8, badgeColor: 'bg-amber-600 text-white' },
      { code: 'SPR', name: 'ICE Sprinter Non-Stop', nativeName: 'ICE Sprinter', description: 'Ultra-fast direct connection between metropolises without intermediate stops', fareMultiplier: 1.4, badgeColor: 'bg-rose-600 text-white' },
      { code: 'REG', name: 'Regio / S-Bahn Flat (Deutschlandticket)', nativeName: 'Regio / D-Ticket', description: 'Universal regional transit access nationwide across all states', fareMultiplier: 0.7, badgeColor: 'bg-blue-600 text-white' }
    ],
    corridors: [
      { name: 'ICE Sprinter (Berlin Hbf ➔ Erfurt ➔ Nürnberg ➔ München Hbf)', nativeName: 'VDE 8 Hochgeschwindigkeitsstrecke', serviceType: 'High-Speed Intercity Express 300 km/h', from: 'BER', to: 'MUN', averageFrequencyMinutes: 30, rakeType: '12-Car ICE 4 / ICE 3neo' },
      { name: 'Rhine-Ruhr Corridor (Köln Hbf ➔ Frankfurt Flughafen ➔ Stuttgart)', nativeName: 'Köln-Rhein/Main Schnellfahrstrecke', serviceType: 'High-Speed Passenger Trunk 300 km/h', from: 'CGN', to: 'FRA', averageFrequencyMinutes: 20, rakeType: '8-Car ICE 3 (Baureihe 403)' },
      { name: 'S-Bahn Berlin Stadtbahn (Ostkreuz ➔ Alexanderplatz ➔ Zoo ➔ Westkreuz)', nativeName: 'Berliner Stadtbahn', serviceType: 'High-Frequency Metropolitan Metro Rail', from: 'BER', to: 'LEI', averageFrequencyMinutes: 3, rakeType: '8-Car Baureihe 483/484' },
      { name: 'ICE Nord-Süd Achse (Hamburg Hbf ➔ Hannover ➔ Frankfurt)', nativeName: 'Nord-Süd-Verbindung', serviceType: 'Intercity Express Backbone Corridor', from: 'HAM', to: 'FRA', averageFrequencyMinutes: 30, rakeType: '13-Car ICE 4 XXL' }
    ],
    statutoryPenalty: {
      lawCitation: 'Eisenbahn-Verkehrsordnung (EVO) § 12 & DB Beförderungsbedingungen',
      standardPenaltyAmount: 60,
      description: 'Travelling without a valid ticket incurs an increased fare (Erhöhtes Beförderungsentgelt) of €60 or twice the regular fare.'
    }
  }
};

export function getAuthorityById(id: string): InstitutionalAuthority {
  if (id in INSTITUTIONAL_AUTHORITIES) {
    return INSTITUTIONAL_AUTHORITIES[id as AuthorityId];
  }
  return INSTITUTIONAL_AUTHORITIES.india;
}

export function getAllAuthorities(): InstitutionalAuthority[] {
  return Object.values(INSTITUTIONAL_AUTHORITIES);
}

export function getDefaultAuthority(): InstitutionalAuthority {
  return INSTITUTIONAL_AUTHORITIES.india;
}
