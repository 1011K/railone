import { Station, TrainTrip, TrainRunningObservation, TravelClass } from '../types/railway';
import { METRO_STATIONS } from './metroData';

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
    aliases: ['cst', 'vt', 'victoria terminus', 'mumbai cst', 'csmt', 'bori bunder', 'boribunder', 'सीएसएमटी', 'सी.एस.एम.टी.', 'व्हीटी', 'बोरीबंदर']
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
    aliases: ['ghatkopar', 'gc', 'ghatcopar', 'ghatkopr', 'gatkopar', 'घाटकोपर']
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
    aliases: ['dadar', 'dadar western', 'dadar wr', 'ddr']
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
  },

  // Pan-India Major Hubs & Termini
  NGP: {
    id: 'NGP',
    code: 'NGP',
    name: 'Nagpur Junction',
    hindiName: 'नागपुर जंक्शन',
    marathiName: 'नागपूर जंक्शन',
    line: 'national',
    city: 'Nagpur',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8],
    isInterchange: true,
    interchangeWalkMinutes: 5,
    aliases: ['nagpur', 'ngp', 'नागपुर', 'नागपूर']
  },
  R: {
    id: 'R',
    code: 'R',
    name: 'Raipur Junction',
    hindiName: 'रायपुर जंक्शन',
    marathiName: 'रायपूर जंक्शन',
    line: 'national',
    city: 'Raipur',
    platforms: [1, 2, 3, 4, 5, 6, 7],
    isInterchange: true,
    interchangeWalkMinutes: 5,
    aliases: ['raipur', 'r', 'रायपुर', 'रायपूर']
  },
  NDLS: {
    id: 'NDLS',
    code: 'NDLS',
    name: 'New Delhi',
    hindiName: 'नई दिल्ली',
    marathiName: 'नवी दिल्ली',
    line: 'national',
    city: 'Delhi',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    isInterchange: true,
    interchangeWalkMinutes: 6,
    aliases: ['new delhi', 'ndls', 'delhi', 'नई दिल्ली']
  },
  HWH: {
    id: 'HWH',
    code: 'HWH',
    name: 'Howrah Junction',
    hindiName: 'हावड़ा जंक्शन',
    marathiName: 'हावडा जंक्शन',
    line: 'national',
    city: 'Kolkata',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    isInterchange: true,
    interchangeWalkMinutes: 8,
    aliases: ['howrah', 'hwh', 'kolkata', 'हावड़ा']
  },
  MAS: {
    id: 'MAS',
    code: 'MAS',
    name: 'Chennai Central',
    hindiName: 'चेन्नई सेंट्रल',
    marathiName: 'चेन्नई सेंट्रल',
    line: 'national',
    city: 'Chennai',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    isInterchange: true,
    interchangeWalkMinutes: 6,
    aliases: ['chennai', 'mas', 'chennai central', 'चेन्नई']
  },
  SBC: {
    id: 'SBC',
    code: 'SBC',
    name: 'KSR Bengaluru',
    hindiName: 'केएसआर बेंगलुरु',
    marathiName: 'केएसआर बंगळुरू',
    line: 'national',
    city: 'Bengaluru',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    isInterchange: true,
    interchangeWalkMinutes: 6,
    aliases: ['bengaluru', 'bangalore', 'sbc', 'ksr bengaluru', 'बेंगलुरु']
  },
  ADI: {
    id: 'ADI',
    code: 'ADI',
    name: 'Ahmedabad Junction',
    hindiName: 'अहमदाबाद जंक्शन',
    marathiName: 'अहमदाबाद जंक्शन',
    line: 'national',
    city: 'Ahmedabad',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    isInterchange: true,
    interchangeWalkMinutes: 6,
    aliases: ['ahmedabad', 'adi', 'अहमदाबाद']
  },
  ST: {
    id: 'ST',
    code: 'ST',
    name: 'Surat',
    hindiName: 'सूरत',
    marathiName: 'सुरत',
    line: 'national',
    city: 'Surat',
    platforms: [1, 2, 3, 4],
    isInterchange: false,
    aliases: ['surat', 'st', 'सूरत']
  },
  BRC: {
    id: 'BRC',
    code: 'BRC',
    name: 'Vadodara Junction',
    hindiName: 'वडोदरा जंक्शन',
    marathiName: 'वडोदरा जंक्शन',
    line: 'national',
    city: 'Vadodara',
    platforms: [1, 2, 3, 4, 5, 6, 7],
    isInterchange: true,
    aliases: ['vadodara', 'baroda', 'brc', 'वडोदरा']
  },
  KOTA: {
    id: 'KOTA',
    code: 'KOTA',
    name: 'Kota Junction',
    hindiName: 'कोटा जंक्शन',
    marathiName: 'कोटा जंक्शन',
    line: 'national',
    city: 'Kota',
    platforms: [1, 2, 3, 4, 5],
    isInterchange: true,
    aliases: ['kota', 'कोटा']
  },
  BPL: {
    id: 'BPL',
    code: 'BPL',
    name: 'Bhopal Junction',
    hindiName: 'भोपाल जंक्शन',
    marathiName: 'भोपाळ जंक्शन',
    line: 'national',
    city: 'Bhopal',
    platforms: [1, 2, 3, 4, 5, 6],
    isInterchange: true,
    aliases: ['bhopal', 'bpl', 'भोपाल']
  },
  BSB: {
    id: 'BSB',
    code: 'BSB',
    name: 'Varanasi Junction',
    hindiName: 'वाराणसी जंक्शन',
    marathiName: 'वाराणसी जंक्शन',
    line: 'national',
    city: 'Varanasi',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    isInterchange: true,
    aliases: ['varanasi', 'bsb', 'banaras', 'वाराणसी']
  },
  CNB: {
    id: 'CNB',
    code: 'CNB',
    name: 'Kanpur Central',
    hindiName: 'कानपुर सेंट्रल',
    marathiName: 'कानपूर सेंट्रल',
    line: 'national',
    city: 'Kanpur',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    isInterchange: true,
    aliases: ['kanpur', 'cnb', 'कानपुर']
  },
  PRYJ: {
    id: 'PRYJ',
    code: 'PRYJ',
    name: 'Prayagraj Junction',
    hindiName: 'प्रयागराज जंक्शन',
    marathiName: 'प्रयागराज जंक्शन',
    line: 'national',
    city: 'Prayagraj',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    isInterchange: true,
    aliases: ['prayagraj', 'allahabad', 'pryj', 'प्रयागराज']
  },
  TATA: {
    id: 'TATA',
    code: 'TATA',
    name: 'Tatanagar Junction',
    hindiName: 'टाटानगर जंक्शन',
    marathiName: 'टाटानगर जंक्शन',
    line: 'national',
    city: 'Jamshedpur',
    platforms: [1, 2, 3, 4, 5],
    isInterchange: true,
    aliases: ['tatanagar', 'jamshedpur', 'tata', 'टाटानगर']
  },
  BSP: {
    id: 'BSP',
    code: 'BSP',
    name: 'Bilaspur Junction',
    hindiName: 'बिलासपुर जंक्शन',
    marathiName: 'बिलासपूर जंक्शन',
    line: 'national',
    city: 'Bilaspur',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8],
    isInterchange: true,
    aliases: ['bilaspur', 'bsp', 'बिलासपुर']
  },
  BZA: {
    id: 'BZA',
    code: 'BZA',
    name: 'Vijayawada Junction',
    hindiName: 'विजयवाड़ा जंक्शन',
    marathiName: 'विजयवाडा जंक्शन',
    line: 'national',
    city: 'Vijayawada',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    isInterchange: true,
    aliases: ['vijayawada', 'bza', 'विजयवाड़ा']
  },
  SC: {
    id: 'SC',
    code: 'SC',
    name: 'Secunderabad Junction',
    hindiName: 'सिकंदराबाद जंक्शन',
    marathiName: 'सिकंदराबाद जंक्शन',
    line: 'national',
    city: 'Hyderabad',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    isInterchange: true,
    aliases: ['secunderabad', 'hyderabad', 'sc', 'सिकंदराबाद']
  },

  // --- Pune Suburban Hubs ---
  SVJR: {
    id: 'SVJR',
    code: 'SVJR',
    name: 'Shivajinagar',
    hindiName: 'शिवाजीनगर',
    marathiName: 'शिवाजीनगर',
    line: 'national',
    city: 'Pune',
    platforms: [1, 2],
    isInterchange: true,
    aliases: ['shivajinagar', 'svjr', 'शिवाजीनगर']
  },
  CCH: {
    id: 'CCH',
    code: 'CCH',
    name: 'Chinchwad',
    hindiName: 'चिंचवड',
    marathiName: 'चिंचवड',
    line: 'national',
    city: 'Pune',
    platforms: [1, 2, 3, 4],
    isInterchange: false,
    aliases: ['chinchwad', 'cch', 'चिंचवड']
  },
  LNL: {
    id: 'LNL',
    code: 'LNL',
    name: 'Lonavala',
    hindiName: 'लोणावळा',
    marathiName: 'लोणावळा',
    line: 'national',
    city: 'Pune',
    platforms: [1, 2, 3],
    isInterchange: true,
    aliases: ['lonavala', 'lnl', 'लोणावळा']
  },

  // --- Delhi NCR Suburban Hubs ---
  GZB: {
    id: 'GZB',
    code: 'GZB',
    name: 'Ghaziabad Junction',
    hindiName: 'गाजियाबाद जंक्शन',
    marathiName: 'गाझियाबाद जंक्शन',
    line: 'national',
    city: 'Delhi NCR',
    platforms: [1, 2, 3, 4, 5, 6],
    isInterchange: true,
    aliases: ['ghaziabad', 'gzb', 'गाजियाबाद']
  },
  FDB: {
    id: 'FDB',
    code: 'FDB',
    name: 'Faridabad',
    hindiName: 'फरीदाबाद',
    marathiName: 'फरीदाबाद',
    line: 'national',
    city: 'Delhi NCR',
    platforms: [1, 2, 3, 4],
    isInterchange: false,
    aliases: ['faridabad', 'fdb', 'फरीदाबाद']
  },

  // --- Bengaluru Commuter Hubs ---
  YPR: {
    id: 'YPR',
    code: 'YPR',
    name: 'Yesvantpur Junction',
    hindiName: 'यशवंतपुर जंक्शन',
    marathiName: 'यशवंतपूर जंक्शन',
    line: 'national',
    city: 'Bengaluru',
    platforms: [1, 2, 3, 4, 5, 6],
    isInterchange: true,
    aliases: ['yesvantpur', 'ypr', 'यशवंतपुर']
  },
  WFD: {
    id: 'WFD',
    code: 'WFD',
    name: 'Whitefield',
    hindiName: 'व्हाइटफील्ड',
    marathiName: 'व्हाईटफील्ड',
    line: 'national',
    city: 'Bengaluru',
    platforms: [1, 2, 3, 4],
    isInterchange: false,
    aliases: ['whitefield', 'wfd', 'व्हाइटफील्ड']
  },

  // --- Kolkata Suburban Hubs ---
  SDAH: {
    id: 'SDAH',
    code: 'SDAH',
    name: 'Sealdah',
    hindiName: 'सियालदह',
    marathiName: 'सियालदह',
    line: 'national',
    city: 'Kolkata',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    isInterchange: true,
    aliases: ['sealdah', 'sdah', 'सियालदह']
  },
  BNGA: {
    id: 'BNGA',
    code: 'BNGA',
    name: 'Bangaon Junction',
    hindiName: 'बनगांव जंक्शन',
    marathiName: 'बनगाव जंक्शन',
    line: 'national',
    city: 'Kolkata',
    platforms: [1, 2, 3],
    isInterchange: false,
    aliases: ['bangaon', 'bnga', 'बनगांव']
  },
  KOAA: {
    id: 'KOAA',
    code: 'KOAA',
    name: 'Kolkata Chitpur',
    hindiName: 'कोलकाता चितपुर',
    marathiName: 'कोलकाता चितपूर',
    line: 'national',
    city: 'Kolkata',
    platforms: [1, 2, 3, 4, 5],
    isInterchange: false,
    aliases: ['kolkata', 'koaa', 'chitpur']
  },
  DDJ: {
    id: 'DDJ',
    code: 'DDJ',
    name: 'Dum Dum Junction',
    hindiName: 'दमदम जंक्शन',
    marathiName: 'दमदम जंक्शन',
    line: 'national',
    city: 'Kolkata',
    platforms: [1, 2, 3, 4, 5],
    isInterchange: true,
    aliases: ['dum dum', 'dumdum', 'ddj', 'दमदम']
  },
  BT: {
    id: 'BT',
    code: 'BT',
    name: 'Barasat Junction',
    hindiName: 'बारासात जंक्शन',
    marathiName: 'बारासात जंक्शन',
    line: 'national',
    city: 'Kolkata',
    platforms: [1, 2, 3, 4, 5],
    isInterchange: true,
    aliases: ['barasat', 'bt', 'बारासात']
  },
  HB: {
    id: 'HB',
    code: 'HB',
    name: 'Habra',
    hindiName: 'हाबरा',
    marathiName: 'हाबरा',
    line: 'national',
    city: 'Kolkata',
    platforms: [1, 2],
    isInterchange: false,
    aliases: ['habra', 'hb', 'हाबरा']
  },
  BWN: {
    id: 'BWN',
    code: 'BWN',
    name: 'Barddhaman Junction',
    hindiName: 'बर्दवान जंक्शन',
    marathiName: 'बर्धमान जंक्शन',
    line: 'national',
    city: 'Bardhaman',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8],
    isInterchange: true,
    aliases: ['bardhaman', 'barddhaman', 'burdwan', 'bwn', 'बर्दवान']
  },
  BDC: {
    id: 'BDC',
    code: 'BDC',
    name: 'Bandel Junction',
    hindiName: 'बंडेल जंक्शन',
    marathiName: 'बंडेल जंक्शन',
    line: 'national',
    city: 'Hooghly',
    platforms: [1, 2, 3, 4, 5, 6],
    isInterchange: true,
    aliases: ['bandel', 'bdc', 'बंडेल']
  },
  DKAE: {
    id: 'DKAE',
    code: 'DKAE',
    name: 'Dankuni Junction',
    hindiName: 'दनकुनी जंक्शन',
    marathiName: 'दनकुनी जंक्शन',
    line: 'national',
    city: 'Hooghly',
    platforms: [1, 2, 3, 4],
    isInterchange: true,
    aliases: ['dankuni', 'dkae', 'दनकुनी']
  },
  SRP: {
    id: 'SRP',
    code: 'SRP',
    name: 'Shrirampur (Serampore)',
    hindiName: 'श्रीरामपुर',
    marathiName: 'श्रीरामपूर',
    line: 'national',
    city: 'Hooghly',
    platforms: [1, 2, 3, 4],
    isInterchange: false,
    aliases: ['serampore', 'shrirampur', 'srp']
  },
  LLH: {
    id: 'LLH',
    code: 'LLH',
    name: 'Liluah',
    hindiName: 'लिलुआ',
    marathiName: 'लिलुआ',
    line: 'national',
    city: 'Howrah',
    platforms: [1, 2, 3, 4],
    isInterchange: false,
    aliases: ['liluah', 'llh']
  },

  // --- Chennai Suburban Hubs ---
  MS: {
    id: 'MS',
    code: 'MS',
    name: 'Chennai Egmore',
    hindiName: 'चेन्नई एग्मोर',
    marathiName: 'चेन्नई एग्मोर',
    line: 'national',
    city: 'Chennai',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    isInterchange: true,
    aliases: ['chennai egmore', 'ms', 'एग्मोर']
  },
  MSB: {
    id: 'MSB',
    code: 'MSB',
    name: 'Chennai Beach',
    hindiName: 'चेन्नई बीच',
    marathiName: 'चेन्नई बीच',
    line: 'national',
    city: 'Chennai',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8],
    isInterchange: true,
    aliases: ['chennai beach', 'msb', 'बीच']
  },
  TBM: {
    id: 'TBM',
    code: 'TBM',
    name: 'Tambaram',
    hindiName: 'तांबरम',
    marathiName: 'तांबरम',
    line: 'national',
    city: 'Chennai',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8],
    isInterchange: true,
    aliases: ['tambaram', 'tbm', 'तांबरम']
  },
  CGL: {
    id: 'CGL',
    code: 'CGL',
    name: 'Chengalpattu Junction',
    hindiName: 'चेंगलपट्टू जंक्शन',
    marathiName: 'चेंगलपट्टू जंक्शन',
    line: 'national',
    city: 'Chengalpattu',
    platforms: [1, 2, 3, 4, 5, 6, 7, 8],
    isInterchange: true,
    aliases: ['chengalpattu', 'cgl', 'चेंगलपट्टू']
  },
  MSF: {
    id: 'MSF',
    code: 'MSF',
    name: 'Chennai Fort',
    hindiName: 'चेन्नई फोर्ट',
    marathiName: 'चेन्नई फोर्ट',
    line: 'national',
    city: 'Chennai',
    platforms: [1, 2],
    isInterchange: false,
    aliases: ['chennai fort', 'fort', 'msf']
  },
  MPK: {
    id: 'MPK',
    code: 'MPK',
    name: 'Chennai Park',
    hindiName: 'चेन्नई पार्क',
    marathiName: 'चेन्नई पार्क',
    line: 'national',
    city: 'Chennai',
    platforms: [1, 2],
    isInterchange: true,
    aliases: ['chennai park', 'park', 'mpk']
  },
  MBM: {
    id: 'MBM',
    code: 'MBM',
    name: 'Mambalam',
    hindiName: 'मांबलम',
    marathiName: 'मांबलम',
    line: 'national',
    city: 'Chennai',
    platforms: [1, 2, 3, 4],
    isInterchange: true,
    aliases: ['mambalam', 'mbm']
  },
  GDY: {
    id: 'GDY',
    code: 'GDY',
    name: 'Guindy',
    hindiName: 'गिंडी',
    marathiName: 'गिंडी',
    line: 'national',
    city: 'Chennai',
    platforms: [1, 2, 3, 4],
    isInterchange: true,
    aliases: ['guindy', 'gdy']
  },

  // --- Hyderabad MMTS Hubs ---
  HYB: {
    id: 'HYB',
    code: 'HYB',
    name: 'Hyderabad Deccan (Nampally)',
    hindiName: 'हैदराबाद डेक्कन',
    marathiName: 'हैदराबाद डेक्कन',
    line: 'national',
    city: 'Hyderabad',
    platforms: [1, 2, 3, 4, 5, 6],
    isInterchange: true,
    aliases: ['hyderabad', 'nampally', 'hyb', 'हैदराबाद']
  },
  LPI: {
    id: 'LPI',
    code: 'LPI',
    name: 'Lingampalli',
    hindiName: 'लिंगमपल्ली',
    marathiName: 'लिंगमपल्ली',
    line: 'national',
    city: 'Hyderabad',
    platforms: [1, 2, 3, 4, 5, 6],
    isInterchange: true,
    aliases: ['lingampalli', 'lpi', 'लिंगमपल्ली']
  },

  // --- Kochi Commuter Hubs ---
  ERS: {
    id: 'ERS',
    code: 'ERS',
    name: 'Ernakulam Junction (South)',
    hindiName: 'एर्नाकुलम जंक्शन',
    marathiName: 'एर्नाकुलम जंक्शन',
    line: 'national',
    city: 'Kochi',
    platforms: [1, 2, 3, 4, 5, 6],
    isInterchange: true,
    aliases: ['ernakulam south', 'ers', 'ernakulam', 'एर्नाकुलम']
  },
  ERN: {
    id: 'ERN',
    code: 'ERN',
    name: 'Ernakulam Town (North)',
    hindiName: 'एर्नाकुलम टाउन',
    marathiName: 'एर्नाकुलम टाउन',
    line: 'national',
    city: 'Kochi',
    platforms: [1, 2],
    isInterchange: false,
    aliases: ['ernakulam north', 'ern', 'टाउन']
  },
  AWY: {
    id: 'AWY',
    code: 'AWY',
    name: 'Aluva',
    hindiName: 'अलुवा',
    marathiName: 'अलुवा',
    line: 'national',
    city: 'Kochi',
    platforms: [1, 2, 3],
    isInterchange: true,
    aliases: ['aluva', 'awy', 'अलुवा']
  }
};

// Dynamically populate Metro stations into STATIONS registry
Object.values(METRO_STATIONS).forEach(ms => {
  if (!STATIONS[ms.code]) {
    STATIONS[ms.code] = {
      id: ms.id,
      code: ms.code,
      name: ms.name,
      hindiName: ms.hindiName,
      marathiName: ms.marathiName,
      line: 'metro',
      city: 'Mumbai',
      platforms: [1, 2],
      isInterchange: ms.isInterchange,
      interchangeWalkMinutes: ms.isInterchange ? 3 : undefined,
      aliases: [ms.name.toLowerCase(), ms.code.toLowerCase(), ms.name.replace('Metro ', '').toLowerCase()]
    };
  }
});

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
  },

  // 16. Central Northbound Fast Local: 95111 CSMT - Kalyan Fast Local
  {
    trainNumber: '95111',
    trainName: 'CSMT - Kalyan Fast Local',
    hindiName: 'सीएसएमटी - कल्याण फास्ट लोकल',
    marathiName: 'सीएसएमटी - कल्याण जलद लोकल',
    originStation: 'CSMT',
    destinationStation: 'KYN',
    serviceType: 'suburban_fast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '10:30', scheduledDeparture: '10:30', platform: '4', distanceKm: 0, isHalt: true },
      { stationCode: 'BY', stationName: 'Byculla', scheduledArrival: '10:37', scheduledDeparture: '10:38', platform: '3', distanceKm: 4.8, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '10:45', scheduledDeparture: '10:46', platform: '5', distanceKm: 9.0, isHalt: true },
      { stationCode: 'CLA', stationName: 'Kurla', scheduledArrival: '10:53', scheduledDeparture: '10:54', platform: '5', distanceKm: 15.3, isHalt: true },
      { stationCode: 'GC', stationName: 'Ghatkopar', scheduledArrival: '11:00', scheduledDeparture: '11:01', platform: '3', distanceKm: 19.3, isHalt: true },
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '11:14', scheduledDeparture: '11:15', platform: '6', distanceKm: 33.6, isHalt: true },
      { stationCode: 'DI', stationName: 'Dombivli', scheduledArrival: '11:28', scheduledDeparture: '11:29', platform: '4', distanceKm: 48.2, isHalt: true },
      { stationCode: 'KYN', stationName: 'Kalyan', scheduledArrival: '11:38', scheduledDeparture: '11:38', platform: '5', distanceKm: 53.5, isHalt: true }
    ]
  },

  // 17. Central Northbound AC Fast Local: 95113 CSMT - Kalyan AC Fast Local
  {
    trainNumber: '95113',
    trainName: 'CSMT - Kalyan AC Fast Local',
    hindiName: 'सीएसएमटी - कल्याण एसी फास्ट लोकल',
    marathiName: 'सीएसएमटी - कल्याण एसी जलद लोकल',
    originStation: 'CSMT',
    destinationStation: 'KYN',
    serviceType: 'suburban_ac_fast',
    runningDays: [1, 2, 3, 4, 5],
    rakeType: '12_car',
    availableClasses: ['AC_LOCAL'],
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '10:45', scheduledDeparture: '10:45', platform: '5', distanceKm: 0, isHalt: true },
      { stationCode: 'BY', stationName: 'Byculla', scheduledArrival: '10:52', scheduledDeparture: '10:53', platform: '3', distanceKm: 4.8, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '11:00', scheduledDeparture: '11:01', platform: '5', distanceKm: 9.0, isHalt: true },
      { stationCode: 'CLA', stationName: 'Kurla', scheduledArrival: '11:08', scheduledDeparture: '11:09', platform: '5', distanceKm: 15.3, isHalt: true },
      { stationCode: 'GC', stationName: 'Ghatkopar', scheduledArrival: '11:15', scheduledDeparture: '11:16', platform: '3', distanceKm: 19.3, isHalt: true },
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '11:29', scheduledDeparture: '11:30', platform: '6', distanceKm: 33.6, isHalt: true },
      { stationCode: 'DI', stationName: 'Dombivli', scheduledArrival: '11:43', scheduledDeparture: '11:44', platform: '4', distanceKm: 48.2, isHalt: true },
      { stationCode: 'KYN', stationName: 'Kalyan', scheduledArrival: '11:53', scheduledDeparture: '11:53', platform: '5', distanceKm: 53.5, isHalt: true }
    ]
  },

  // 18. Central Northbound Slow Local: 97040 CSMT - Thane Slow Local
  {
    trainNumber: '97040',
    trainName: 'CSMT - Thane Slow Local',
    hindiName: 'सीएसएमटी - ठाणे धीमी लोकल',
    marathiName: 'सीएसएमटी - ठाणे धीम्या लोकल',
    originStation: 'CSMT',
    destinationStation: 'TNA',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '10:25', scheduledDeparture: '10:25', platform: '1', distanceKm: 0, isHalt: true },
      { stationCode: 'BY', stationName: 'Byculla', scheduledArrival: '10:33', scheduledDeparture: '10:34', platform: '1', distanceKm: 4.8, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '10:42', scheduledDeparture: '10:43', platform: '1', distanceKm: 9.0, isHalt: true },
      { stationCode: 'CLA', stationName: 'Kurla', scheduledArrival: '10:53', scheduledDeparture: '10:54', platform: '3', distanceKm: 15.3, isHalt: true },
      { stationCode: 'GC', stationName: 'Ghatkopar', scheduledArrival: '11:00', scheduledDeparture: '11:01', platform: '2', distanceKm: 19.3, isHalt: true },
      { stationCode: 'VK', stationName: 'Vikhroli', scheduledArrival: '11:05', scheduledDeparture: '11:06', platform: '2', distanceKm: 23.0, isHalt: true },
      { stationCode: 'BND', stationName: 'Bhandup', scheduledArrival: '11:10', scheduledDeparture: '11:11', platform: '2', distanceKm: 26.5, isHalt: true },
      { stationCode: 'MLND', stationName: 'Mulund', scheduledArrival: '11:15', scheduledDeparture: '11:16', platform: '2', distanceKm: 30.8, isHalt: true },
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '11:20', scheduledDeparture: '11:20', platform: '2', distanceKm: 33.6, isHalt: true }
    ]
  },

  // 19. Central Northbound Slow Local: 97046 CSMT - Kalyan Slow Local
  {
    trainNumber: '97046',
    trainName: 'CSMT - Kalyan Slow Local',
    hindiName: 'सीएसएमटी - कल्याण धीमी लोकल',
    marathiName: 'सीएसएमटी - कल्याण धीम्या लोकल',
    originStation: 'CSMT',
    destinationStation: 'KYN',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '10:55', scheduledDeparture: '10:55', platform: '1', distanceKm: 0, isHalt: true },
      { stationCode: 'BY', stationName: 'Byculla', scheduledArrival: '11:03', scheduledDeparture: '11:04', platform: '1', distanceKm: 4.8, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '11:12', scheduledDeparture: '11:13', platform: '1', distanceKm: 9.0, isHalt: true },
      { stationCode: 'CLA', stationName: 'Kurla', scheduledArrival: '11:23', scheduledDeparture: '11:24', platform: '3', distanceKm: 15.3, isHalt: true },
      { stationCode: 'GC', stationName: 'Ghatkopar', scheduledArrival: '11:30', scheduledDeparture: '11:31', platform: '2', distanceKm: 19.3, isHalt: true },
      { stationCode: 'VK', stationName: 'Vikhroli', scheduledArrival: '11:35', scheduledDeparture: '11:36', platform: '2', distanceKm: 23.0, isHalt: true },
      { stationCode: 'BND', stationName: 'Bhandup', scheduledArrival: '11:40', scheduledDeparture: '11:41', platform: '2', distanceKm: 26.5, isHalt: true },
      { stationCode: 'MLND', stationName: 'Mulund', scheduledArrival: '11:45', scheduledDeparture: '11:46', platform: '2', distanceKm: 30.8, isHalt: true },
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '11:50', scheduledDeparture: '11:51', platform: '2', distanceKm: 33.6, isHalt: true },
      { stationCode: 'DI', stationName: 'Dombivli', scheduledArrival: '12:09', scheduledDeparture: '12:10', platform: '2', distanceKm: 48.2, isHalt: true },
      { stationCode: 'KYN', stationName: 'Kalyan', scheduledArrival: '12:20', scheduledDeparture: '12:20', platform: '2', distanceKm: 53.5, isHalt: true }
    ]
  },

  // 20. Central Southbound Fast Local: 95116 Kalyan - CSMT Fast Local
  {
    trainNumber: '95116',
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
      { stationCode: 'KYN', stationName: 'Kalyan', scheduledArrival: '10:45', scheduledDeparture: '10:45', platform: '4', distanceKm: 0, isHalt: true },
      { stationCode: 'DI', stationName: 'Dombivli', scheduledArrival: '10:54', scheduledDeparture: '10:55', platform: '3', distanceKm: 5.3, isHalt: true },
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '11:09', scheduledDeparture: '11:10', platform: '5', distanceKm: 19.9, isHalt: true },
      { stationCode: 'GC', stationName: 'Ghatkopar', scheduledArrival: '11:23', scheduledDeparture: '11:24', platform: '4', distanceKm: 34.2, isHalt: true },
      { stationCode: 'CLA', stationName: 'Kurla', scheduledArrival: '11:29', scheduledDeparture: '11:30', platform: '6', distanceKm: 38.2, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '11:38', scheduledDeparture: '11:39', platform: '4', distanceKm: 44.5, isHalt: true },
      { stationCode: 'BY', stationName: 'Byculla', scheduledArrival: '11:46', scheduledDeparture: '11:47', platform: '4', distanceKm: 48.7, isHalt: true },
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '11:55', scheduledDeparture: '11:55', platform: '5', distanceKm: 53.5, isHalt: true }
    ]
  },

  // 21. Central Southbound AC Fast Local: 95118 Kalyan - CSMT AC Fast Local
  {
    trainNumber: '95118',
    trainName: 'Kalyan - CSMT AC Fast Local',
    hindiName: 'कल्याण - सीएसएमटी एसी फास्ट लोकल',
    marathiName: 'कल्याण - सीएसएमटी एसी जलद लोकल',
    originStation: 'KYN',
    destinationStation: 'CSMT',
    serviceType: 'suburban_ac_fast',
    runningDays: [1, 2, 3, 4, 5],
    rakeType: '12_car',
    availableClasses: ['AC_LOCAL'],
    stops: [
      { stationCode: 'KYN', stationName: 'Kalyan', scheduledArrival: '11:00', scheduledDeparture: '11:00', platform: '4', distanceKm: 0, isHalt: true },
      { stationCode: 'DI', stationName: 'Dombivli', scheduledArrival: '11:09', scheduledDeparture: '11:10', platform: '3', distanceKm: 5.3, isHalt: true },
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '11:24', scheduledDeparture: '11:25', platform: '5', distanceKm: 19.9, isHalt: true },
      { stationCode: 'GC', stationName: 'Ghatkopar', scheduledArrival: '11:38', scheduledDeparture: '11:39', platform: '4', distanceKm: 34.2, isHalt: true },
      { stationCode: 'CLA', stationName: 'Kurla', scheduledArrival: '11:44', scheduledDeparture: '11:45', platform: '6', distanceKm: 38.2, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '11:53', scheduledDeparture: '11:54', platform: '4', distanceKm: 44.5, isHalt: true },
      { stationCode: 'BY', stationName: 'Byculla', scheduledArrival: '12:01', scheduledDeparture: '12:02', platform: '4', distanceKm: 48.7, isHalt: true },
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '12:10', scheduledDeparture: '12:10', platform: '6', distanceKm: 53.5, isHalt: true }
    ]
  },

  // 22. Central Southbound Slow Local: 97055 Thane - CSMT Slow Local
  {
    trainNumber: '97055',
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
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '11:15', scheduledDeparture: '11:15', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'MLND', stationName: 'Mulund', scheduledArrival: '11:19', scheduledDeparture: '11:20', platform: '1', distanceKm: 2.8, isHalt: true },
      { stationCode: 'BND', stationName: 'Bhandup', scheduledArrival: '11:24', scheduledDeparture: '11:25', platform: '1', distanceKm: 7.1, isHalt: true },
      { stationCode: 'VK', stationName: 'Vikhroli', scheduledArrival: '11:29', scheduledDeparture: '11:30', platform: '1', distanceKm: 10.6, isHalt: true },
      { stationCode: 'GC', stationName: 'Ghatkopar', scheduledArrival: '11:35', scheduledDeparture: '11:36', platform: '1', distanceKm: 14.3, isHalt: true },
      { stationCode: 'CLA', stationName: 'Kurla', scheduledArrival: '11:42', scheduledDeparture: '11:43', platform: '1', distanceKm: 18.3, isHalt: true },
      { stationCode: 'DR', stationName: 'Dadar (Central)', scheduledArrival: '11:53', scheduledDeparture: '11:54', platform: '2', distanceKm: 24.6, isHalt: true },
      { stationCode: 'BY', stationName: 'Byculla', scheduledArrival: '12:01', scheduledDeparture: '12:02', platform: '2', distanceKm: 28.8, isHalt: true },
      { stationCode: 'CSMT', stationName: 'CSMT', scheduledArrival: '12:09', scheduledDeparture: '12:09', platform: '2', distanceKm: 33.6, isHalt: true }
    ]
  },

  // 23. Western Northbound Fast Local: 90233 Churchgate - Borivali Fast Local
  {
    trainNumber: '90233',
    trainName: 'Churchgate - Borivali Fast Local',
    hindiName: 'चर्चगेट - बोरिवली फास्ट लोकल',
    marathiName: 'चर्चगेट - बोरिवली जलद लोकल',
    originStation: 'CCG',
    destinationStation: 'BVI',
    serviceType: 'suburban_fast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '15_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'CCG', stationName: 'Churchgate', scheduledArrival: '10:35', scheduledDeparture: '10:35', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'MMCT', stationName: 'Mumbai Central', scheduledArrival: '10:43', scheduledDeparture: '10:44', platform: '3', distanceKm: 4.3, isHalt: true },
      { stationCode: 'DDR', stationName: 'Dadar (Western)', scheduledArrival: '10:50', scheduledDeparture: '10:51', platform: '3', distanceKm: 10.2, isHalt: true },
      { stationCode: 'BA', stationName: 'Bandra', scheduledArrival: '10:57', scheduledDeparture: '10:58', platform: '5', distanceKm: 15.1, isHalt: true },
      { stationCode: 'ADH', stationName: 'Andheri', scheduledArrival: '11:05', scheduledDeparture: '11:06', platform: '4', distanceKm: 21.8, isHalt: true },
      { stationCode: 'BVI', stationName: 'Borivali', scheduledArrival: '11:20', scheduledDeparture: '11:20', platform: '3', distanceKm: 34.2, isHalt: true }
    ]
  },

  // 24. Western Northbound AC Fast Local: 90237 Churchgate - Virar AC Fast Local
  {
    trainNumber: '90237',
    trainName: 'Churchgate - Virar AC Fast Local',
    hindiName: 'चर्चगेट - विरार एसी फास्ट लोकल',
    marathiName: 'चर्चगेट - विरार एसी जलद लोकल',
    originStation: 'CCG',
    destinationStation: 'VR',
    serviceType: 'suburban_ac_fast',
    runningDays: [1, 2, 3, 4, 5],
    rakeType: '12_car',
    availableClasses: ['AC_LOCAL'],
    stops: [
      { stationCode: 'CCG', stationName: 'Churchgate', scheduledArrival: '10:50', scheduledDeparture: '10:50', platform: '4', distanceKm: 0, isHalt: true },
      { stationCode: 'MMCT', stationName: 'Mumbai Central', scheduledArrival: '10:58', scheduledDeparture: '10:59', platform: '3', distanceKm: 4.3, isHalt: true },
      { stationCode: 'DDR', stationName: 'Dadar (Western)', scheduledArrival: '11:05', scheduledDeparture: '11:06', platform: '3', distanceKm: 10.2, isHalt: true },
      { stationCode: 'BA', stationName: 'Bandra', scheduledArrival: '11:12', scheduledDeparture: '11:13', platform: '5', distanceKm: 15.1, isHalt: true },
      { stationCode: 'ADH', stationName: 'Andheri', scheduledArrival: '11:20', scheduledDeparture: '11:21', platform: '4', distanceKm: 21.8, isHalt: true },
      { stationCode: 'BVI', stationName: 'Borivali', scheduledArrival: '11:35', scheduledDeparture: '11:36', platform: '5', distanceKm: 34.2, isHalt: true },
      { stationCode: 'VR', stationName: 'Virar', scheduledArrival: '12:05', scheduledDeparture: '12:05', platform: '2', distanceKm: 60.0, isHalt: true }
    ]
  },

  // 25. Western Northbound Slow Local: 90241 Churchgate - Andheri Slow Local
  {
    trainNumber: '90241',
    trainName: 'Churchgate - Andheri Slow Local',
    hindiName: 'चर्चगेट - अंधेरी धीमी लोकल',
    marathiName: 'चर्चगेट - अंधेरी धीम्या लोकल',
    originStation: 'CCG',
    destinationStation: 'ADH',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'CCG', stationName: 'Churchgate', scheduledArrival: '10:40', scheduledDeparture: '10:40', platform: '1', distanceKm: 0, isHalt: true },
      { stationCode: 'MEL', stationName: 'Marine Lines', scheduledArrival: '10:44', scheduledDeparture: '10:45', platform: '1', distanceKm: 1.4, isHalt: true },
      { stationCode: 'MMCT', stationName: 'Mumbai Central', scheduledArrival: '10:50', scheduledDeparture: '10:51', platform: '1', distanceKm: 4.3, isHalt: true },
      { stationCode: 'DDR', stationName: 'Dadar (Western)', scheduledArrival: '11:00', scheduledDeparture: '11:01', platform: '2', distanceKm: 10.2, isHalt: true },
      { stationCode: 'BA', stationName: 'Bandra', scheduledArrival: '11:10', scheduledDeparture: '11:11', platform: '3', distanceKm: 15.1, isHalt: true },
      { stationCode: 'ADH', stationName: 'Andheri', scheduledArrival: '11:25', scheduledDeparture: '11:25', platform: '2', distanceKm: 21.8, isHalt: true }
    ]
  },

  // 26. Western Southbound Fast Local: 90242 Borivali - Churchgate Fast Local
  {
    trainNumber: '90242',
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
      { stationCode: 'BVI', stationName: 'Borivali', scheduledArrival: '11:25', scheduledDeparture: '11:25', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'ADH', stationName: 'Andheri', scheduledArrival: '11:40', scheduledDeparture: '11:41', platform: '5', distanceKm: 12.4, isHalt: true },
      { stationCode: 'BA', stationName: 'Bandra', scheduledArrival: '11:49', scheduledDeparture: '11:50', platform: '4', distanceKm: 19.1, isHalt: true },
      { stationCode: 'DDR', stationName: 'Dadar (Western)', scheduledArrival: '11:56', scheduledDeparture: '11:57', platform: '4', distanceKm: 24.0, isHalt: true },
      { stationCode: 'MMCT', stationName: 'Mumbai Central', scheduledArrival: '12:03', scheduledDeparture: '12:04', platform: '4', distanceKm: 29.9, isHalt: true },
      { stationCode: 'CCG', stationName: 'Churchgate', scheduledArrival: '12:12', scheduledDeparture: '12:12', platform: '2', distanceKm: 34.2, isHalt: true }
    ]
  },

  // 27. Harbour Line Inbound: 98046 Panvel - CSMT Local (Midday)
  {
    trainNumber: '98046',
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
      { stationCode: 'PNVL', stationName: 'Panvel', scheduledArrival: '10:35', scheduledDeparture: '10:35', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'VSH', stationName: 'Vashi', scheduledArrival: '11:00', scheduledDeparture: '11:01', platform: '2', distanceKm: 28.5, isHalt: true },
      { stationCode: 'CLA', stationName: 'Kurla (Harbour)', scheduledArrival: '11:17', scheduledDeparture: '11:18', platform: '7', distanceKm: 38.0, isHalt: true },
      { stationCode: 'VDLR', stationName: 'Vadala Road', scheduledArrival: '11:29', scheduledDeparture: '11:30', platform: '2', distanceKm: 42.0, isHalt: true },
      { stationCode: 'CSMT', stationName: 'CSMT (Harbour)', scheduledArrival: '11:47', scheduledDeparture: '11:47', platform: '1', distanceKm: 48.9, isHalt: true }
    ]
  },

  // 28. Harbour Line Inbound: 98050 Panvel - CSMT Local
  {
    trainNumber: '98050',
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
      { stationCode: 'PNVL', stationName: 'Panvel', scheduledArrival: '11:00', scheduledDeparture: '11:00', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'VSH', stationName: 'Vashi', scheduledArrival: '11:25', scheduledDeparture: '11:26', platform: '2', distanceKm: 28.5, isHalt: true },
      { stationCode: 'CLA', stationName: 'Kurla (Harbour)', scheduledArrival: '11:42', scheduledDeparture: '11:43', platform: '7', distanceKm: 38.0, isHalt: true },
      { stationCode: 'VDLR', stationName: 'Vadala Road', scheduledArrival: '11:54', scheduledDeparture: '11:55', platform: '2', distanceKm: 42.0, isHalt: true },
      { stationCode: 'CSMT', stationName: 'CSMT (Harbour)', scheduledArrival: '12:12', scheduledDeparture: '12:12', platform: '1', distanceKm: 48.9, isHalt: true }
    ]
  },

  // 29. Trans-Harbour Line: 99011 Thane - Panvel Local
  {
    trainNumber: '99011',
    trainName: 'Thane - Panvel Trans-Harbour Local',
    hindiName: 'ठाणे - पनवेल ट्रांस-हार्बर लोकल',
    marathiName: 'ठाणे - पनवेल ट्रान्स-हार्बर लोकल',
    originStation: 'TNA',
    destinationStation: 'PNVL',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '10:40', scheduledDeparture: '10:40', platform: '9', distanceKm: 0, isHalt: true },
      { stationCode: 'VSH', stationName: 'Vashi', scheduledArrival: '11:02', scheduledDeparture: '11:03', platform: '3', distanceKm: 18.5, isHalt: true },
      { stationCode: 'PNVL', stationName: 'Panvel', scheduledArrival: '11:32', scheduledDeparture: '11:32', platform: '4', distanceKm: 47.0, isHalt: true }
    ]
  },

  // 30. Trans-Harbour Line: 99012 Panvel - Thane Local
  {
    trainNumber: '99012',
    trainName: 'Panvel - Thane Trans-Harbour Local',
    hindiName: 'पनवेल - ठाणे ट्रांस-हार्बर लोकल',
    marathiName: 'पनवेल - ठाणे ट्रान्स-हार्बर लोकल',
    originStation: 'PNVL',
    destinationStation: 'TNA',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'PNVL', stationName: 'Panvel', scheduledArrival: '10:30', scheduledDeparture: '10:30', platform: '4', distanceKm: 0, isHalt: true },
      { stationCode: 'VSH', stationName: 'Vashi', scheduledArrival: '11:00', scheduledDeparture: '11:01', platform: '4', distanceKm: 28.5, isHalt: true },
      { stationCode: 'TNA', stationName: 'Thane', scheduledArrival: '11:22', scheduledDeparture: '11:22', platform: '10', distanceKm: 47.0, isHalt: true }
    ]
  },

  // 31. Harbour Line Western Branch: 98812 Andheri - CSMT Harbour Local
  {
    trainNumber: '98812',
    trainName: 'Andheri - CSMT Harbour Local',
    hindiName: 'अंधेरी - सीएसएमटी हार्बर लोकल',
    marathiName: 'अंधेरी - सीएसएमटी हार्बर लोकल',
    originStation: 'ADH',
    destinationStation: 'CSMT',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'ADH', stationName: 'Andheri', scheduledArrival: '10:40', scheduledDeparture: '10:40', platform: '6', distanceKm: 0, isHalt: true },
      { stationCode: 'BA', stationName: 'Bandra', scheduledArrival: '10:52', scheduledDeparture: '10:53', platform: '6', distanceKm: 6.7, isHalt: true },
      { stationCode: 'VDLR', stationName: 'Vadala Road', scheduledArrival: '11:06', scheduledDeparture: '11:07', platform: '4', distanceKm: 13.9, isHalt: true },
      { stationCode: 'CSMT', stationName: 'CSMT (Harbour)', scheduledArrival: '11:24', scheduledDeparture: '11:24', platform: '2', distanceKm: 20.8, isHalt: true }
    ]
  },

  // 32. Harbour Line Western Branch: 98813 CSMT - Andheri Harbour Local
  {
    trainNumber: '98813',
    trainName: 'CSMT - Andheri Harbour Local',
    hindiName: 'सीएसएमटी - अंधेरी हार्बर लोकल',
    marathiName: 'सीएसएमटी - अंधेरी हार्बर लोकल',
    originStation: 'CSMT',
    destinationStation: 'ADH',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'CSMT', stationName: 'CSMT (Harbour)', scheduledArrival: '10:45', scheduledDeparture: '10:45', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'VDLR', stationName: 'Vadala Road', scheduledArrival: '11:03', scheduledDeparture: '11:04', platform: '3', distanceKm: 6.9, isHalt: true },
      { stationCode: 'BA', stationName: 'Bandra', scheduledArrival: '11:17', scheduledDeparture: '11:18', platform: '7', distanceKm: 14.1, isHalt: true },
      { stationCode: 'ADH', stationName: 'Andheri', scheduledArrival: '11:30', scheduledDeparture: '11:30', platform: '6', distanceKm: 20.8, isHalt: true }
    ]
  },

  // --- Pune Representative Journeys ---
  {
    trainNumber: 'PUN-101',
    trainName: 'Pune - Lonavala Local EMU',
    hindiName: 'पुणे - लोणावळा लोकल',
    marathiName: 'पुणे - लोणावळा लोकल',
    originStation: 'PUNE',
    destinationStation: 'LNL',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'PUNE', stationName: 'Pune Junction', scheduledArrival: '10:40', scheduledDeparture: '10:40', platform: '4', distanceKm: 0, isHalt: true },
      { stationCode: 'SVJR', stationName: 'Shivajinagar', scheduledArrival: '10:46', scheduledDeparture: '10:47', platform: '2', distanceKm: 2.5, isHalt: true },
      { stationCode: 'CCH', stationName: 'Chinchwad', scheduledArrival: '11:03', scheduledDeparture: '11:04', platform: '2', distanceKm: 18.2, isHalt: true },
      { stationCode: 'LNL', stationName: 'Lonavala', scheduledArrival: '11:55', scheduledDeparture: '11:55', platform: '3', distanceKm: 63.8, isHalt: true }
    ]
  },
  {
    trainNumber: 'PUN-102',
    trainName: 'Lonavala - Pune Local EMU',
    hindiName: 'लोणावळा - पुणे लोकल',
    marathiName: 'लोणावळा - पुणे लोकल',
    originStation: 'LNL',
    destinationStation: 'PUNE',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'LNL', stationName: 'Lonavala', scheduledArrival: '10:35', scheduledDeparture: '10:35', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'CCH', stationName: 'Chinchwad', scheduledArrival: '11:25', scheduledDeparture: '11:26', platform: '1', distanceKm: 45.6, isHalt: true },
      { stationCode: 'SVJR', stationName: 'Shivajinagar', scheduledArrival: '11:42', scheduledDeparture: '11:43', platform: '1', distanceKm: 61.3, isHalt: true },
      { stationCode: 'PUNE', stationName: 'Pune Junction', scheduledArrival: '11:50', scheduledDeparture: '11:50', platform: '5', distanceKm: 63.8, isHalt: true }
    ]
  },

  // --- Delhi NCR Representative Journeys ---
  {
    trainNumber: 'DEL-101',
    trainName: 'New Delhi - Ghaziabad EMU',
    hindiName: 'नई दिल्ली - गाजियाबाद ईएमयू',
    marathiName: 'नवी दिल्ली - गाझियाबाद ईएमयू',
    originStation: 'NDLS',
    destinationStation: 'GZB',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'NDLS', stationName: 'New Delhi', scheduledArrival: '10:35', scheduledDeparture: '10:35', platform: '8', distanceKm: 0, isHalt: true },
      { stationCode: 'GZB', stationName: 'Ghaziabad Junction', scheduledArrival: '11:17', scheduledDeparture: '11:17', platform: '3', distanceKm: 25.4, isHalt: true }
    ]
  },
  {
    trainNumber: 'DEL-102',
    trainName: 'New Delhi - Faridabad EMU',
    hindiName: 'नई दिल्ली - फरीदाबाद ईएमयू',
    marathiName: 'नवी दिल्ली - फरीदाबाद ईएमयू',
    originStation: 'NDLS',
    destinationStation: 'FDB',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'NDLS', stationName: 'New Delhi', scheduledArrival: '10:45', scheduledDeparture: '10:45', platform: '6', distanceKm: 0, isHalt: true },
      { stationCode: 'FDB', stationName: 'Faridabad', scheduledArrival: '11:23', scheduledDeparture: '11:23', platform: '2', distanceKm: 28.6, isHalt: true }
    ]
  },

  // --- Bengaluru Representative Journeys ---
  {
    trainNumber: 'BLR-101',
    trainName: 'KSR Bengaluru - Whitefield MEMU Commuter',
    hindiName: 'केएसआर बेंगलुरु - व्हाइटफील्ड मेमू',
    marathiName: 'केएसआर बंगळुरू - व्हाईटफील्ड मेमू',
    originStation: 'SBC',
    destinationStation: 'WFD',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'SBC', stationName: 'KSR Bengaluru', scheduledArrival: '10:35', scheduledDeparture: '10:35', platform: '7', distanceKm: 0, isHalt: true },
      { stationCode: 'WFD', stationName: 'Whitefield', scheduledArrival: '11:10', scheduledDeparture: '11:10', platform: '2', distanceKm: 23.2, isHalt: true }
    ]
  },

  // --- Kolkata Representative Journeys ---
  {
    trainNumber: 'CCU-101',
    trainName: 'Howrah - Sealdah - Bangaon Local EMU',
    hindiName: 'हावड़ा - सियालदह - बनगांव लोकल ईएमयू',
    marathiName: 'हावडा - सियालदह - बनगाव लोकल ईएमयू',
    originStation: 'HWH',
    destinationStation: 'BNGA',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'HWH', stationName: 'Howrah Junction', scheduledArrival: '10:20', scheduledDeparture: '10:25', platform: '12', distanceKm: 0, isHalt: true },
      { stationCode: 'SDAH', stationName: 'Sealdah', scheduledArrival: '10:38', scheduledDeparture: '10:40', platform: '9', distanceKm: 5.5, isHalt: true },
      { stationCode: 'BNGA', stationName: 'Bangaon Junction', scheduledArrival: '12:20', scheduledDeparture: '12:20', platform: '1', distanceKm: 82.0, isHalt: true }
    ]
  },
  {
    trainNumber: 'CCU-102',
    trainName: 'Bangaon - Sealdah - Howrah Local EMU',
    hindiName: 'बनगांव - सियालदह - हावड़ा लोकल ईएमयू',
    marathiName: 'बनगाव - सियालदह - हावडा लोकल ईएमयू',
    originStation: 'BNGA',
    destinationStation: 'HWH',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'BNGA', stationName: 'Bangaon Junction', scheduledArrival: '10:30', scheduledDeparture: '10:30', platform: '1', distanceKm: 0, isHalt: true },
      { stationCode: 'SDAH', stationName: 'Sealdah', scheduledArrival: '12:10', scheduledDeparture: '12:12', platform: '8', distanceKm: 76.5, isHalt: true },
      { stationCode: 'HWH', stationName: 'Howrah Junction', scheduledArrival: '12:30', scheduledDeparture: '12:30', platform: '11', distanceKm: 82.0, isHalt: true }
    ]
  },

  // --- Chennai Representative Journeys ---
  {
    trainNumber: 'MAA-101',
    trainName: 'Chennai Central - Beach - Tambaram Local EMU',
    hindiName: 'चेन्नई सेंट्रल - बीच - तांबरम लोकल',
    marathiName: 'चेन्नई सेंट्रल - बीच - तांबरम लोकल',
    originStation: 'MAS',
    destinationStation: 'TBM',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'MAS', stationName: 'Chennai Central', scheduledArrival: '10:20', scheduledDeparture: '10:25', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '10:30', scheduledDeparture: '10:31', platform: '4', distanceKm: 2.1, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '10:42', scheduledDeparture: '10:43', platform: '4', distanceKm: 6.6, isHalt: true },
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '11:22', scheduledDeparture: '11:22', platform: '5', distanceKm: 31.2, isHalt: true }
    ]
  },
  {
    trainNumber: 'MAA-102',
    trainName: 'Tambaram - Beach - Chennai Central Local EMU',
    hindiName: 'तांबरम - बीच - चेन्नई सेंट्रल लोकल',
    marathiName: 'तांबरम - बीच - चेन्नई सेंट्रल लोकल',
    originStation: 'TBM',
    destinationStation: 'MAS',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '10:30', scheduledDeparture: '10:30', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '11:10', scheduledDeparture: '11:11', platform: '3', distanceKm: 24.6, isHalt: true },
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '11:22', scheduledDeparture: '11:23', platform: '2', distanceKm: 29.1, isHalt: true },
      { stationCode: 'MAS', stationName: 'Chennai Central', scheduledArrival: '11:32', scheduledDeparture: '11:32', platform: '4', distanceKm: 31.2, isHalt: true }
    ]
  },

  // --- Kolkata Suburban Densified Services ---
  // 1. Sealdah - Bangaon EMU (Sealdah North Main)
  {
    trainNumber: '33811',
    trainName: 'Sealdah - Bangaon Local EMU',
    hindiName: 'सियालदह - बनगांव लोकल',
    marathiName: 'सियालदह - बनगाव लोकल',
    originStation: 'SDAH',
    destinationStation: 'BNGA',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'SDAH', stationName: 'Sealdah', scheduledArrival: '08:15', scheduledDeparture: '08:15', platform: '9', distanceKm: 0, isHalt: true },
      { stationCode: 'DDJ', stationName: 'Dum Dum Junction', scheduledArrival: '08:26', scheduledDeparture: '08:27', platform: '2', distanceKm: 7.0, isHalt: true },
      { stationCode: 'BT', stationName: 'Barasat Junction', scheduledArrival: '08:48', scheduledDeparture: '08:49', platform: '3', distanceKm: 22.0, isHalt: true },
      { stationCode: 'HB', stationName: 'Habra', scheduledArrival: '09:18', scheduledDeparture: '09:19', platform: '1', distanceKm: 45.0, isHalt: true },
      { stationCode: 'BNGA', stationName: 'Bangaon Junction', scheduledArrival: '09:55', scheduledDeparture: '09:55', platform: '1', distanceKm: 76.5, isHalt: true }
    ]
  },
  {
    trainNumber: '33813',
    trainName: 'Sealdah - Bangaon Local EMU',
    hindiName: 'सियालदह - बनगांव लोकल',
    marathiName: 'सियालदह - बनगाव लोकल',
    originStation: 'SDAH',
    destinationStation: 'BNGA',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'SDAH', stationName: 'Sealdah', scheduledArrival: '10:30', scheduledDeparture: '10:30', platform: '9', distanceKm: 0, isHalt: true },
      { stationCode: 'DDJ', stationName: 'Dum Dum Junction', scheduledArrival: '10:41', scheduledDeparture: '10:42', platform: '2', distanceKm: 7.0, isHalt: true },
      { stationCode: 'BT', stationName: 'Barasat Junction', scheduledArrival: '11:03', scheduledDeparture: '11:04', platform: '3', distanceKm: 22.0, isHalt: true },
      { stationCode: 'HB', stationName: 'Habra', scheduledArrival: '11:33', scheduledDeparture: '11:34', platform: '1', distanceKm: 45.0, isHalt: true },
      { stationCode: 'BNGA', stationName: 'Bangaon Junction', scheduledArrival: '12:10', scheduledDeparture: '12:10', platform: '1', distanceKm: 76.5, isHalt: true }
    ]
  },
  {
    trainNumber: '33815',
    trainName: 'Sealdah - Bangaon Local EMU',
    hindiName: 'सियालदह - बनगांव लोकल',
    marathiName: 'सियालदह - बनगाव लोकल',
    originStation: 'SDAH',
    destinationStation: 'BNGA',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'SDAH', stationName: 'Sealdah', scheduledArrival: '14:20', scheduledDeparture: '14:20', platform: '8', distanceKm: 0, isHalt: true },
      { stationCode: 'DDJ', stationName: 'Dum Dum Junction', scheduledArrival: '14:31', scheduledDeparture: '14:32', platform: '2', distanceKm: 7.0, isHalt: true },
      { stationCode: 'BT', stationName: 'Barasat Junction', scheduledArrival: '14:53', scheduledDeparture: '14:54', platform: '3', distanceKm: 22.0, isHalt: true },
      { stationCode: 'HB', stationName: 'Habra', scheduledArrival: '15:23', scheduledDeparture: '15:24', platform: '1', distanceKm: 45.0, isHalt: true },
      { stationCode: 'BNGA', stationName: 'Bangaon Junction', scheduledArrival: '16:00', scheduledDeparture: '16:00', platform: '1', distanceKm: 76.5, isHalt: true }
    ]
  },
  {
    trainNumber: '33817',
    trainName: 'Sealdah - Bangaon Local EMU',
    hindiName: 'सियालदह - बनगांव लोकल',
    marathiName: 'सियालदह - बनगाव लोकल',
    originStation: 'SDAH',
    destinationStation: 'BNGA',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'SDAH', stationName: 'Sealdah', scheduledArrival: '18:10', scheduledDeparture: '18:10', platform: '9', distanceKm: 0, isHalt: true },
      { stationCode: 'DDJ', stationName: 'Dum Dum Junction', scheduledArrival: '18:21', scheduledDeparture: '18:22', platform: '2', distanceKm: 7.0, isHalt: true },
      { stationCode: 'BT', stationName: 'Barasat Junction', scheduledArrival: '18:43', scheduledDeparture: '18:44', platform: '3', distanceKm: 22.0, isHalt: true },
      { stationCode: 'HB', stationName: 'Habra', scheduledArrival: '19:13', scheduledDeparture: '19:14', platform: '1', distanceKm: 45.0, isHalt: true },
      { stationCode: 'BNGA', stationName: 'Bangaon Junction', scheduledArrival: '19:50', scheduledDeparture: '19:50', platform: '2', distanceKm: 76.5, isHalt: true }
    ]
  },
  {
    trainNumber: '33812',
    trainName: 'Bangaon - Sealdah Local EMU',
    hindiName: 'बनगांव - सियालदह लोकल',
    marathiName: 'बनगाव - सियालदह लोकल',
    originStation: 'BNGA',
    destinationStation: 'SDAH',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'BNGA', stationName: 'Bangaon Junction', scheduledArrival: '07:30', scheduledDeparture: '07:30', platform: '1', distanceKm: 0, isHalt: true },
      { stationCode: 'HB', stationName: 'Habra', scheduledArrival: '08:05', scheduledDeparture: '08:06', platform: '1', distanceKm: 31.5, isHalt: true },
      { stationCode: 'BT', stationName: 'Barasat Junction', scheduledArrival: '08:35', scheduledDeparture: '08:36', platform: '2', distanceKm: 54.5, isHalt: true },
      { stationCode: 'DDJ', stationName: 'Dum Dum Junction', scheduledArrival: '08:58', scheduledDeparture: '08:59', platform: '3', distanceKm: 69.5, isHalt: true },
      { stationCode: 'SDAH', stationName: 'Sealdah', scheduledArrival: '09:15', scheduledDeparture: '09:15', platform: '8', distanceKm: 76.5, isHalt: true }
    ]
  },
  {
    trainNumber: '33814',
    trainName: 'Bangaon - Sealdah Local EMU',
    hindiName: 'बनगांव - सियालदह लोकल',
    marathiName: 'बनगाव - सियालदह लोकल',
    originStation: 'BNGA',
    destinationStation: 'SDAH',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'BNGA', stationName: 'Bangaon Junction', scheduledArrival: '10:15', scheduledDeparture: '10:15', platform: '1', distanceKm: 0, isHalt: true },
      { stationCode: 'HB', stationName: 'Habra', scheduledArrival: '10:50', scheduledDeparture: '10:51', platform: '1', distanceKm: 31.5, isHalt: true },
      { stationCode: 'BT', stationName: 'Barasat Junction', scheduledArrival: '11:20', scheduledDeparture: '11:21', platform: '2', distanceKm: 54.5, isHalt: true },
      { stationCode: 'DDJ', stationName: 'Dum Dum Junction', scheduledArrival: '11:43', scheduledDeparture: '11:44', platform: '3', distanceKm: 69.5, isHalt: true },
      { stationCode: 'SDAH', stationName: 'Sealdah', scheduledArrival: '12:00', scheduledDeparture: '12:00', platform: '9', distanceKm: 76.5, isHalt: true }
    ]
  },
  {
    trainNumber: '33816',
    trainName: 'Bangaon - Sealdah Local EMU',
    hindiName: 'बनगांव - सियालदह लोकल',
    marathiName: 'बनगाव - सियालदह लोकल',
    originStation: 'BNGA',
    destinationStation: 'SDAH',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'BNGA', stationName: 'Bangaon Junction', scheduledArrival: '14:00', scheduledDeparture: '14:00', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'HB', stationName: 'Habra', scheduledArrival: '14:35', scheduledDeparture: '14:36', platform: '1', distanceKm: 31.5, isHalt: true },
      { stationCode: 'BT', stationName: 'Barasat Junction', scheduledArrival: '15:05', scheduledDeparture: '15:06', platform: '2', distanceKm: 54.5, isHalt: true },
      { stationCode: 'DDJ', stationName: 'Dum Dum Junction', scheduledArrival: '15:28', scheduledDeparture: '15:29', platform: '3', distanceKm: 69.5, isHalt: true },
      { stationCode: 'SDAH', stationName: 'Sealdah', scheduledArrival: '15:45', scheduledDeparture: '15:45', platform: '8', distanceKm: 76.5, isHalt: true }
    ]
  },
  {
    trainNumber: '33818',
    trainName: 'Bangaon - Sealdah Local EMU',
    hindiName: 'बनगांव - सियालदह लोकल',
    marathiName: 'बनगाव - सियालदह लोकल',
    originStation: 'BNGA',
    destinationStation: 'SDAH',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'BNGA', stationName: 'Bangaon Junction', scheduledArrival: '17:45', scheduledDeparture: '17:45', platform: '1', distanceKm: 0, isHalt: true },
      { stationCode: 'HB', stationName: 'Habra', scheduledArrival: '18:20', scheduledDeparture: '18:21', platform: '1', distanceKm: 31.5, isHalt: true },
      { stationCode: 'BT', stationName: 'Barasat Junction', scheduledArrival: '18:50', scheduledDeparture: '18:51', platform: '2', distanceKm: 54.5, isHalt: true },
      { stationCode: 'DDJ', stationName: 'Dum Dum Junction', scheduledArrival: '19:13', scheduledDeparture: '19:14', platform: '3', distanceKm: 69.5, isHalt: true },
      { stationCode: 'SDAH', stationName: 'Sealdah', scheduledArrival: '19:30', scheduledDeparture: '19:30', platform: '9', distanceKm: 76.5, isHalt: true }
    ]
  },

  // 2. Howrah - Bardhaman Main EMU (via Bandel)
  {
    trainNumber: '37811',
    trainName: 'Howrah - Bardhaman Main Line Local EMU',
    hindiName: 'हावड़ा - बर्दवान मेन लाइन लोकल',
    marathiName: 'हावडा - बर्धमान मेन लाईन लोकल',
    originStation: 'HWH',
    destinationStation: 'BWN',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'HWH', stationName: 'Howrah Junction', scheduledArrival: '08:30', scheduledDeparture: '08:30', platform: '4', distanceKm: 0, isHalt: true },
      { stationCode: 'LLH', stationName: 'Liluah', scheduledArrival: '08:38', scheduledDeparture: '08:39', platform: '1', distanceKm: 5.0, isHalt: true },
      { stationCode: 'SRP', stationName: 'Shrirampur (Serampore)', scheduledArrival: '08:56', scheduledDeparture: '08:57', platform: '2', distanceKm: 20.0, isHalt: true },
      { stationCode: 'BDC', stationName: 'Bandel Junction', scheduledArrival: '09:25', scheduledDeparture: '09:27', platform: '3', distanceKm: 40.0, isHalt: true },
      { stationCode: 'BWN', stationName: 'Barddhaman Junction', scheduledArrival: '10:45', scheduledDeparture: '10:45', platform: '4', distanceKm: 107.0, isHalt: true }
    ]
  },
  {
    trainNumber: '37813',
    trainName: 'Howrah - Bardhaman Main Line Local EMU',
    hindiName: 'हावड़ा - बर्दवान मेन लाइन लोकल',
    marathiName: 'हावडा - बर्धमान मेन लाईन लोकल',
    originStation: 'HWH',
    destinationStation: 'BWN',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'HWH', stationName: 'Howrah Junction', scheduledArrival: '10:35', scheduledDeparture: '10:35', platform: '5', distanceKm: 0, isHalt: true },
      { stationCode: 'LLH', stationName: 'Liluah', scheduledArrival: '10:43', scheduledDeparture: '10:44', platform: '1', distanceKm: 5.0, isHalt: true },
      { stationCode: 'SRP', stationName: 'Shrirampur (Serampore)', scheduledArrival: '11:01', scheduledDeparture: '11:02', platform: '2', distanceKm: 20.0, isHalt: true },
      { stationCode: 'BDC', stationName: 'Bandel Junction', scheduledArrival: '11:30', scheduledDeparture: '11:32', platform: '3', distanceKm: 40.0, isHalt: true },
      { stationCode: 'BWN', stationName: 'Barddhaman Junction', scheduledArrival: '12:50', scheduledDeparture: '12:50', platform: '5', distanceKm: 107.0, isHalt: true }
    ]
  },
  {
    trainNumber: '37815',
    trainName: 'Howrah - Bardhaman Main Line Local EMU',
    hindiName: 'हावड़ा - बर्दवान मेन लाइन लोकल',
    marathiName: 'हावडा - बर्धमान मेन लाईन लोकल',
    originStation: 'HWH',
    destinationStation: 'BWN',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'HWH', stationName: 'Howrah Junction', scheduledArrival: '17:15', scheduledDeparture: '17:15', platform: '6', distanceKm: 0, isHalt: true },
      { stationCode: 'LLH', stationName: 'Liluah', scheduledArrival: '17:23', scheduledDeparture: '17:24', platform: '1', distanceKm: 5.0, isHalt: true },
      { stationCode: 'SRP', stationName: 'Shrirampur (Serampore)', scheduledArrival: '17:41', scheduledDeparture: '17:42', platform: '2', distanceKm: 20.0, isHalt: true },
      { stationCode: 'BDC', stationName: 'Bandel Junction', scheduledArrival: '18:10', scheduledDeparture: '18:12', platform: '3', distanceKm: 40.0, isHalt: true },
      { stationCode: 'BWN', stationName: 'Barddhaman Junction', scheduledArrival: '19:30', scheduledDeparture: '19:30', platform: '4', distanceKm: 107.0, isHalt: true }
    ]
  },
  {
    trainNumber: '37812',
    trainName: 'Bardhaman - Howrah Main Line Local EMU',
    hindiName: 'बर्दवान - हावड़ा मेन लाइन लोकल',
    marathiName: 'बर्धमान - हावडा मेन लाईन लोकल',
    originStation: 'BWN',
    destinationStation: 'HWH',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'BWN', stationName: 'Barddhaman Junction', scheduledArrival: '07:10', scheduledDeparture: '07:10', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'BDC', stationName: 'Bandel Junction', scheduledArrival: '08:25', scheduledDeparture: '08:27', platform: '2', distanceKm: 67.0, isHalt: true },
      { stationCode: 'SRP', stationName: 'Shrirampur (Serampore)', scheduledArrival: '08:52', scheduledDeparture: '08:53', platform: '1', distanceKm: 87.0, isHalt: true },
      { stationCode: 'LLH', stationName: 'Liluah', scheduledArrival: '09:10', scheduledDeparture: '09:11', platform: '2', distanceKm: 102.0, isHalt: true },
      { stationCode: 'HWH', stationName: 'Howrah Junction', scheduledArrival: '09:25', scheduledDeparture: '09:25', platform: '5', distanceKm: 107.0, isHalt: true }
    ]
  },
  {
    trainNumber: '37814',
    trainName: 'Bardhaman - Howrah Main Line Local EMU',
    hindiName: 'बर्दवान - हावड़ा मेन लाइन लोकल',
    marathiName: 'बर्धमान - हावडा मेन लाईन लोकल',
    originStation: 'BWN',
    destinationStation: 'HWH',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'BWN', stationName: 'Barddhaman Junction', scheduledArrival: '10:20', scheduledDeparture: '10:20', platform: '4', distanceKm: 0, isHalt: true },
      { stationCode: 'BDC', stationName: 'Bandel Junction', scheduledArrival: '11:35', scheduledDeparture: '11:37', platform: '2', distanceKm: 67.0, isHalt: true },
      { stationCode: 'SRP', stationName: 'Shrirampur (Serampore)', scheduledArrival: '12:02', scheduledDeparture: '12:03', platform: '1', distanceKm: 87.0, isHalt: true },
      { stationCode: 'LLH', stationName: 'Liluah', scheduledArrival: '12:20', scheduledDeparture: '12:21', platform: '2', distanceKm: 102.0, isHalt: true },
      { stationCode: 'HWH', stationName: 'Howrah Junction', scheduledArrival: '12:35', scheduledDeparture: '12:35', platform: '6', distanceKm: 107.0, isHalt: true }
    ]
  },
  {
    trainNumber: '37816',
    trainName: 'Bardhaman - Howrah Main Line Local EMU',
    hindiName: 'बर्दवान - हावड़ा मेन लाइन लोकल',
    marathiName: 'बर्धमान - हावडा मेन लाईन लोकल',
    originStation: 'BWN',
    destinationStation: 'HWH',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'BWN', stationName: 'Barddhaman Junction', scheduledArrival: '16:30', scheduledDeparture: '16:30', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'BDC', stationName: 'Bandel Junction', scheduledArrival: '17:45', scheduledDeparture: '17:47', platform: '2', distanceKm: 67.0, isHalt: true },
      { stationCode: 'SRP', stationName: 'Shrirampur (Serampore)', scheduledArrival: '18:12', scheduledDeparture: '18:13', platform: '1', distanceKm: 87.0, isHalt: true },
      { stationCode: 'LLH', stationName: 'Liluah', scheduledArrival: '18:30', scheduledDeparture: '18:31', platform: '2', distanceKm: 102.0, isHalt: true },
      { stationCode: 'HWH', stationName: 'Howrah Junction', scheduledArrival: '18:45', scheduledDeparture: '18:45', platform: '4', distanceKm: 107.0, isHalt: true }
    ]
  },

  // 3. Howrah - Bardhaman Chord EMU (via Dankuni)
  {
    trainNumber: '36811',
    trainName: 'Howrah - Bardhaman Chord Line Local EMU',
    hindiName: 'हावड़ा - बर्दवान कॉर्ड लाइन लोकल',
    marathiName: 'हावडा - बर्धमान कॉर्ड लाईन लोकल',
    originStation: 'HWH',
    destinationStation: 'BWN',
    serviceType: 'suburban_fast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'HWH', stationName: 'Howrah Junction', scheduledArrival: '09:15', scheduledDeparture: '09:15', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'LLH', stationName: 'Liluah', scheduledArrival: '09:23', scheduledDeparture: '09:24', platform: '1', distanceKm: 5.0, isHalt: true },
      { stationCode: 'DKAE', stationName: 'Dankuni Junction', scheduledArrival: '09:40', scheduledDeparture: '09:42', platform: '2', distanceKm: 15.0, isHalt: true },
      { stationCode: 'BWN', stationName: 'Barddhaman Junction', scheduledArrival: '11:05', scheduledDeparture: '11:05', platform: '6', distanceKm: 95.0, isHalt: true }
    ]
  },
  {
    trainNumber: '36813',
    trainName: 'Howrah - Bardhaman Chord Line Local EMU',
    hindiName: 'हावड़ा - बर्दवान कॉर्ड लाइन लोकल',
    marathiName: 'हावडा - बर्धमान कॉर्ड लाईन लोकल',
    originStation: 'HWH',
    destinationStation: 'BWN',
    serviceType: 'suburban_fast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'HWH', stationName: 'Howrah Junction', scheduledArrival: '10:40', scheduledDeparture: '10:40', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'LLH', stationName: 'Liluah', scheduledArrival: '10:48', scheduledDeparture: '10:49', platform: '1', distanceKm: 5.0, isHalt: true },
      { stationCode: 'DKAE', stationName: 'Dankuni Junction', scheduledArrival: '11:05', scheduledDeparture: '11:07', platform: '2', distanceKm: 15.0, isHalt: true },
      { stationCode: 'BWN', stationName: 'Barddhaman Junction', scheduledArrival: '12:30', scheduledDeparture: '12:30', platform: '6', distanceKm: 95.0, isHalt: true }
    ]
  },
  {
    trainNumber: '36815',
    trainName: 'Howrah - Bardhaman Chord Line Local EMU',
    hindiName: 'हावड़ा - बर्दवान कॉर्ड लाइन लोकल',
    marathiName: 'हावडा - बर्धमान कॉर्ड लाईन लोकल',
    originStation: 'HWH',
    destinationStation: 'BWN',
    serviceType: 'suburban_fast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'HWH', stationName: 'Howrah Junction', scheduledArrival: '18:20', scheduledDeparture: '18:20', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'LLH', stationName: 'Liluah', scheduledArrival: '18:28', scheduledDeparture: '18:29', platform: '1', distanceKm: 5.0, isHalt: true },
      { stationCode: 'DKAE', stationName: 'Dankuni Junction', scheduledArrival: '18:45', scheduledDeparture: '18:47', platform: '2', distanceKm: 15.0, isHalt: true },
      { stationCode: 'BWN', stationName: 'Barddhaman Junction', scheduledArrival: '20:10', scheduledDeparture: '20:10', platform: '5', distanceKm: 95.0, isHalt: true }
    ]
  },
  {
    trainNumber: '36812',
    trainName: 'Bardhaman - Howrah Chord Line Local EMU',
    hindiName: 'बर्दवान - हावड़ा कॉर्ड लाइन लोकल',
    marathiName: 'बर्धमान - हावडा कॉर्ड लाईन लोकल',
    originStation: 'BWN',
    destinationStation: 'HWH',
    serviceType: 'suburban_fast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'BWN', stationName: 'Barddhaman Junction', scheduledArrival: '08:00', scheduledDeparture: '08:00', platform: '6', distanceKm: 0, isHalt: true },
      { stationCode: 'DKAE', stationName: 'Dankuni Junction', scheduledArrival: '09:20', scheduledDeparture: '09:22', platform: '1', distanceKm: 80.0, isHalt: true },
      { stationCode: 'LLH', stationName: 'Liluah', scheduledArrival: '09:37', scheduledDeparture: '09:38', platform: '2', distanceKm: 90.0, isHalt: true },
      { stationCode: 'HWH', stationName: 'Howrah Junction', scheduledArrival: '09:50', scheduledDeparture: '09:50', platform: '2', distanceKm: 95.0, isHalt: true }
    ]
  },
  {
    trainNumber: '36814',
    trainName: 'Bardhaman - Howrah Chord Line Local EMU',
    hindiName: 'बर्दवान - हावड़ा कॉर्ड लाइन लोकल',
    marathiName: 'बर्धमान - हावडा कॉर्ड लाईन लोकल',
    originStation: 'BWN',
    destinationStation: 'HWH',
    serviceType: 'suburban_fast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'BWN', stationName: 'Barddhaman Junction', scheduledArrival: '10:30', scheduledDeparture: '10:30', platform: '5', distanceKm: 0, isHalt: true },
      { stationCode: 'DKAE', stationName: 'Dankuni Junction', scheduledArrival: '11:50', scheduledDeparture: '11:52', platform: '1', distanceKm: 80.0, isHalt: true },
      { stationCode: 'LLH', stationName: 'Liluah', scheduledArrival: '12:07', scheduledDeparture: '12:08', platform: '2', distanceKm: 90.0, isHalt: true },
      { stationCode: 'HWH', stationName: 'Howrah Junction', scheduledArrival: '12:20', scheduledDeparture: '12:20', platform: '3', distanceKm: 95.0, isHalt: true }
    ]
  },
  {
    trainNumber: '36816',
    trainName: 'Bardhaman - Howrah Chord Line Local EMU',
    hindiName: 'बर्दवान - हावड़ा कॉर्ड लाइन लोकल',
    marathiName: 'बर्धमान - हावडा कॉर्ड लाईन लोकल',
    originStation: 'BWN',
    destinationStation: 'HWH',
    serviceType: 'suburban_fast',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'BWN', stationName: 'Barddhaman Junction', scheduledArrival: '17:10', scheduledDeparture: '17:10', platform: '6', distanceKm: 0, isHalt: true },
      { stationCode: 'DKAE', stationName: 'Dankuni Junction', scheduledArrival: '18:30', scheduledDeparture: '18:32', platform: '1', distanceKm: 80.0, isHalt: true },
      { stationCode: 'LLH', stationName: 'Liluah', scheduledArrival: '18:47', scheduledDeparture: '18:48', platform: '2', distanceKm: 90.0, isHalt: true },
      { stationCode: 'HWH', stationName: 'Howrah Junction', scheduledArrival: '19:00', scheduledDeparture: '19:00', platform: '2', distanceKm: 95.0, isHalt: true }
    ]
  },

  // --- Chennai Suburban Densified Services ---
  // 1. Chennai Beach - Tambaram - Chengalpattu EMU
  {
    trainNumber: '40501',
    trainName: 'Chennai Beach - Chengalpattu Suburban EMU',
    hindiName: 'चेन्नई बीच - चेंगलपट्टू लोकल',
    marathiName: 'चेन्नई बीच - चेंगलपट्टू लोकल',
    originStation: 'MSB',
    destinationStation: 'CGL',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '08:10', scheduledDeparture: '08:10', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'MSF', stationName: 'Chennai Fort', scheduledArrival: '08:14', scheduledDeparture: '08:15', platform: '1', distanceKm: 2.0, isHalt: true },
      { stationCode: 'MPK', stationName: 'Chennai Park', scheduledArrival: '08:17', scheduledDeparture: '08:18', platform: '1', distanceKm: 3.0, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '08:22', scheduledDeparture: '08:23', platform: '3', distanceKm: 4.5, isHalt: true },
      { stationCode: 'MBM', stationName: 'Mambalam', scheduledArrival: '08:33', scheduledDeparture: '08:34', platform: '2', distanceKm: 11.0, isHalt: true },
      { stationCode: 'GDY', stationName: 'Guindy', scheduledArrival: '08:39', scheduledDeparture: '08:40', platform: '2', distanceKm: 14.0, isHalt: true },
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '09:05', scheduledDeparture: '09:07', platform: '4', distanceKm: 29.0, isHalt: true },
      { stationCode: 'CGL', stationName: 'Chengalpattu Junction', scheduledArrival: '09:50', scheduledDeparture: '09:50', platform: '2', distanceKm: 60.0, isHalt: true }
    ]
  },
  {
    trainNumber: '40503',
    trainName: 'Chennai Beach - Chengalpattu Suburban EMU',
    hindiName: 'चेन्नई बीच - चेंगलपट्टू लोकल',
    marathiName: 'चेन्नई बीच - चेंगलपट्टू लोकल',
    originStation: 'MSB',
    destinationStation: 'CGL',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '10:35', scheduledDeparture: '10:35', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'MSF', stationName: 'Chennai Fort', scheduledArrival: '10:39', scheduledDeparture: '10:40', platform: '1', distanceKm: 2.0, isHalt: true },
      { stationCode: 'MPK', stationName: 'Chennai Park', scheduledArrival: '10:42', scheduledDeparture: '10:43', platform: '1', distanceKm: 3.0, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '10:47', scheduledDeparture: '10:48', platform: '3', distanceKm: 4.5, isHalt: true },
      { stationCode: 'MBM', stationName: 'Mambalam', scheduledArrival: '10:58', scheduledDeparture: '10:59', platform: '2', distanceKm: 11.0, isHalt: true },
      { stationCode: 'GDY', stationName: 'Guindy', scheduledArrival: '11:04', scheduledDeparture: '11:05', platform: '2', distanceKm: 14.0, isHalt: true },
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '11:30', scheduledDeparture: '11:32', platform: '4', distanceKm: 29.0, isHalt: true },
      { stationCode: 'CGL', stationName: 'Chengalpattu Junction', scheduledArrival: '12:15', scheduledDeparture: '12:15', platform: '3', distanceKm: 60.0, isHalt: true }
    ]
  },
  {
    trainNumber: '40505',
    trainName: 'Chennai Beach - Chengalpattu Suburban EMU',
    hindiName: 'चेन्नई बीच - चेंगलपट्टू लोकल',
    marathiName: 'चेन्नई बीच - चेंगलपट्टू लोकल',
    originStation: 'MSB',
    destinationStation: 'CGL',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '14:15', scheduledDeparture: '14:15', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'MSF', stationName: 'Chennai Fort', scheduledArrival: '14:19', scheduledDeparture: '14:20', platform: '1', distanceKm: 2.0, isHalt: true },
      { stationCode: 'MPK', stationName: 'Chennai Park', scheduledArrival: '14:22', scheduledDeparture: '14:23', platform: '1', distanceKm: 3.0, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '14:27', scheduledDeparture: '14:28', platform: '3', distanceKm: 4.5, isHalt: true },
      { stationCode: 'MBM', stationName: 'Mambalam', scheduledArrival: '14:38', scheduledDeparture: '14:39', platform: '2', distanceKm: 11.0, isHalt: true },
      { stationCode: 'GDY', stationName: 'Guindy', scheduledArrival: '14:44', scheduledDeparture: '14:45', platform: '2', distanceKm: 14.0, isHalt: true },
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '15:10', scheduledDeparture: '15:12', platform: '4', distanceKm: 29.0, isHalt: true },
      { stationCode: 'CGL', stationName: 'Chengalpattu Junction', scheduledArrival: '15:55', scheduledDeparture: '15:55', platform: '2', distanceKm: 60.0, isHalt: true }
    ]
  },
  {
    trainNumber: '40507',
    trainName: 'Chennai Beach - Chengalpattu Suburban EMU',
    hindiName: 'चेन्नई बीच - चेंगलपट्टू लोकल',
    marathiName: 'चेन्नई बीच - चेंगलपट्टू लोकल',
    originStation: 'MSB',
    destinationStation: 'CGL',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '18:20', scheduledDeparture: '18:20', platform: '4', distanceKm: 0, isHalt: true },
      { stationCode: 'MSF', stationName: 'Chennai Fort', scheduledArrival: '18:24', scheduledDeparture: '18:25', platform: '1', distanceKm: 2.0, isHalt: true },
      { stationCode: 'MPK', stationName: 'Chennai Park', scheduledArrival: '18:27', scheduledDeparture: '18:28', platform: '1', distanceKm: 3.0, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '18:32', scheduledDeparture: '18:33', platform: '4', distanceKm: 4.5, isHalt: true },
      { stationCode: 'MBM', stationName: 'Mambalam', scheduledArrival: '18:43', scheduledDeparture: '18:44', platform: '2', distanceKm: 11.0, isHalt: true },
      { stationCode: 'GDY', stationName: 'Guindy', scheduledArrival: '18:49', scheduledDeparture: '18:50', platform: '2', distanceKm: 14.0, isHalt: true },
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '19:15', scheduledDeparture: '19:17', platform: '5', distanceKm: 29.0, isHalt: true },
      { stationCode: 'CGL', stationName: 'Chengalpattu Junction', scheduledArrival: '20:00', scheduledDeparture: '20:00', platform: '3', distanceKm: 60.0, isHalt: true }
    ]
  },
  {
    trainNumber: '40502',
    trainName: 'Chengalpattu - Chennai Beach Suburban EMU',
    hindiName: 'चेंगलपट्टू - चेन्नई बीच लोकल',
    marathiName: 'चेंगलपट्टू - चेन्नई बीच लोकल',
    originStation: 'CGL',
    destinationStation: 'MSB',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'CGL', stationName: 'Chengalpattu Junction', scheduledArrival: '07:15', scheduledDeparture: '07:15', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '08:00', scheduledDeparture: '08:02', platform: '3', distanceKm: 31.0, isHalt: true },
      { stationCode: 'GDY', stationName: 'Guindy', scheduledArrival: '08:24', scheduledDeparture: '08:25', platform: '1', distanceKm: 46.0, isHalt: true },
      { stationCode: 'MBM', stationName: 'Mambalam', scheduledArrival: '08:30', scheduledDeparture: '08:31', platform: '1', distanceKm: 49.0, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '08:42', scheduledDeparture: '08:43', platform: '2', distanceKm: 55.5, isHalt: true },
      { stationCode: 'MPK', stationName: 'Chennai Park', scheduledArrival: '08:47', scheduledDeparture: '08:48', platform: '2', distanceKm: 57.0, isHalt: true },
      { stationCode: 'MSF', stationName: 'Chennai Fort', scheduledArrival: '08:50', scheduledDeparture: '08:51', platform: '2', distanceKm: 58.0, isHalt: true },
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '08:58', scheduledDeparture: '08:58', platform: '3', distanceKm: 60.0, isHalt: true }
    ]
  },
  {
    trainNumber: '40504',
    trainName: 'Chengalpattu - Chennai Beach Suburban EMU',
    hindiName: 'चेंगलपट्टू - चेन्नई बीच लोकल',
    marathiName: 'चेंगलपट्टू - चेन्नई बीच लोकल',
    originStation: 'CGL',
    destinationStation: 'MSB',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'CGL', stationName: 'Chengalpattu Junction', scheduledArrival: '10:20', scheduledDeparture: '10:20', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '11:05', scheduledDeparture: '11:07', platform: '3', distanceKm: 31.0, isHalt: true },
      { stationCode: 'GDY', stationName: 'Guindy', scheduledArrival: '11:29', scheduledDeparture: '11:30', platform: '1', distanceKm: 46.0, isHalt: true },
      { stationCode: 'MBM', stationName: 'Mambalam', scheduledArrival: '11:35', scheduledDeparture: '11:36', platform: '1', distanceKm: 49.0, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '11:47', scheduledDeparture: '11:48', platform: '2', distanceKm: 55.5, isHalt: true },
      { stationCode: 'MPK', stationName: 'Chennai Park', scheduledArrival: '11:52', scheduledDeparture: '11:53', platform: '2', distanceKm: 57.0, isHalt: true },
      { stationCode: 'MSF', stationName: 'Chennai Fort', scheduledArrival: '11:55', scheduledDeparture: '11:56', platform: '2', distanceKm: 58.0, isHalt: true },
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '12:03', scheduledDeparture: '12:03', platform: '2', distanceKm: 60.0, isHalt: true }
    ]
  },
  {
    trainNumber: '40506',
    trainName: 'Chengalpattu - Chennai Beach Suburban EMU',
    hindiName: 'चेंगलपट्टू - चेन्नई बीच लोकल',
    marathiName: 'चेंगलपट्टू - चेन्नई बीच लोकल',
    originStation: 'CGL',
    destinationStation: 'MSB',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'CGL', stationName: 'Chengalpattu Junction', scheduledArrival: '14:00', scheduledDeparture: '14:00', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '14:45', scheduledDeparture: '14:47', platform: '3', distanceKm: 31.0, isHalt: true },
      { stationCode: 'GDY', stationName: 'Guindy', scheduledArrival: '15:09', scheduledDeparture: '15:10', platform: '1', distanceKm: 46.0, isHalt: true },
      { stationCode: 'MBM', stationName: 'Mambalam', scheduledArrival: '15:15', scheduledDeparture: '15:16', platform: '1', distanceKm: 49.0, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '15:27', scheduledDeparture: '15:28', platform: '2', distanceKm: 55.5, isHalt: true },
      { stationCode: 'MPK', stationName: 'Chennai Park', scheduledArrival: '15:32', scheduledDeparture: '15:33', platform: '2', distanceKm: 57.0, isHalt: true },
      { stationCode: 'MSF', stationName: 'Chennai Fort', scheduledArrival: '15:35', scheduledDeparture: '15:36', platform: '2', distanceKm: 58.0, isHalt: true },
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '15:43', scheduledDeparture: '15:43', platform: '3', distanceKm: 60.0, isHalt: true }
    ]
  },
  {
    trainNumber: '40508',
    trainName: 'Chengalpattu - Chennai Beach Suburban EMU',
    hindiName: 'चेंगलपट्टू - चेन्नई बीच लोकल',
    marathiName: 'चेंगलपट्टू - चेन्नई बीच लोकल',
    originStation: 'CGL',
    destinationStation: 'MSB',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'CGL', stationName: 'Chengalpattu Junction', scheduledArrival: '17:30', scheduledDeparture: '17:30', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '18:15', scheduledDeparture: '18:17', platform: '3', distanceKm: 31.0, isHalt: true },
      { stationCode: 'GDY', stationName: 'Guindy', scheduledArrival: '18:39', scheduledDeparture: '18:40', platform: '1', distanceKm: 46.0, isHalt: true },
      { stationCode: 'MBM', stationName: 'Mambalam', scheduledArrival: '18:45', scheduledDeparture: '18:46', platform: '1', distanceKm: 49.0, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '18:57', scheduledDeparture: '18:58', platform: '2', distanceKm: 55.5, isHalt: true },
      { stationCode: 'MPK', stationName: 'Chennai Park', scheduledArrival: '19:02', scheduledDeparture: '19:03', platform: '2', distanceKm: 57.0, isHalt: true },
      { stationCode: 'MSF', stationName: 'Chennai Fort', scheduledArrival: '19:05', scheduledDeparture: '19:06', platform: '2', distanceKm: 58.0, isHalt: true },
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '19:13', scheduledDeparture: '19:13', platform: '4', distanceKm: 60.0, isHalt: true }
    ]
  },

  // 2. Chennai Beach - Tambaram Local EMU
  {
    trainNumber: '40001',
    trainName: 'Chennai Beach - Tambaram Local EMU',
    hindiName: 'चेन्नई बीच - तांबरम लोकल',
    marathiName: 'चेन्नई बीच - तांबरम लोकल',
    originStation: 'MSB',
    destinationStation: 'TBM',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '09:00', scheduledDeparture: '09:00', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'MSF', stationName: 'Chennai Fort', scheduledArrival: '09:04', scheduledDeparture: '09:05', platform: '1', distanceKm: 2.0, isHalt: true },
      { stationCode: 'MPK', stationName: 'Chennai Park', scheduledArrival: '09:07', scheduledDeparture: '09:08', platform: '1', distanceKm: 3.0, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '09:12', scheduledDeparture: '09:13', platform: '3', distanceKm: 4.5, isHalt: true },
      { stationCode: 'MBM', stationName: 'Mambalam', scheduledArrival: '09:23', scheduledDeparture: '09:24', platform: '2', distanceKm: 11.0, isHalt: true },
      { stationCode: 'GDY', stationName: 'Guindy', scheduledArrival: '09:29', scheduledDeparture: '09:30', platform: '2', distanceKm: 14.0, isHalt: true },
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '09:55', scheduledDeparture: '09:55', platform: '3', distanceKm: 29.0, isHalt: true }
    ]
  },
  {
    trainNumber: '40003',
    trainName: 'Chennai Beach - Tambaram Local EMU',
    hindiName: 'चेन्नई बीच - तांबरम लोकल',
    marathiName: 'चेन्नई बीच - तांबरम लोकल',
    originStation: 'MSB',
    destinationStation: 'TBM',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '10:45', scheduledDeparture: '10:45', platform: '1', distanceKm: 0, isHalt: true },
      { stationCode: 'MSF', stationName: 'Chennai Fort', scheduledArrival: '10:49', scheduledDeparture: '10:50', platform: '1', distanceKm: 2.0, isHalt: true },
      { stationCode: 'MPK', stationName: 'Chennai Park', scheduledArrival: '10:52', scheduledDeparture: '10:53', platform: '1', distanceKm: 3.0, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '10:57', scheduledDeparture: '10:58', platform: '3', distanceKm: 4.5, isHalt: true },
      { stationCode: 'MBM', stationName: 'Mambalam', scheduledArrival: '11:08', scheduledDeparture: '11:09', platform: '2', distanceKm: 11.0, isHalt: true },
      { stationCode: 'GDY', stationName: 'Guindy', scheduledArrival: '11:14', scheduledDeparture: '11:15', platform: '2', distanceKm: 14.0, isHalt: true },
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '11:40', scheduledDeparture: '11:40', platform: '5', distanceKm: 29.0, isHalt: true }
    ]
  },
  {
    trainNumber: '40005',
    trainName: 'Chennai Beach - Tambaram Local EMU',
    hindiName: 'चेन्नई बीच - तांबरम लोकल',
    marathiName: 'चेन्नई बीच - तांबरम लोकल',
    originStation: 'MSB',
    destinationStation: 'TBM',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '17:40', scheduledDeparture: '17:40', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'MSF', stationName: 'Chennai Fort', scheduledArrival: '17:44', scheduledDeparture: '17:45', platform: '1', distanceKm: 2.0, isHalt: true },
      { stationCode: 'MPK', stationName: 'Chennai Park', scheduledArrival: '17:47', scheduledDeparture: '17:48', platform: '1', distanceKm: 3.0, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '17:52', scheduledDeparture: '17:53', platform: '3', distanceKm: 4.5, isHalt: true },
      { stationCode: 'MBM', stationName: 'Mambalam', scheduledArrival: '18:03', scheduledDeparture: '18:04', platform: '2', distanceKm: 11.0, isHalt: true },
      { stationCode: 'GDY', stationName: 'Guindy', scheduledArrival: '18:09', scheduledDeparture: '18:10', platform: '2', distanceKm: 14.0, isHalt: true },
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '18:35', scheduledDeparture: '18:35', platform: '4', distanceKm: 29.0, isHalt: true }
    ]
  },
  {
    trainNumber: '40002',
    trainName: 'Tambaram - Chennai Beach Local EMU',
    hindiName: 'तांबरम - चेन्नई बीच लोकल',
    marathiName: 'तांबरम - चेन्नई बीच लोकल',
    originStation: 'TBM',
    destinationStation: 'MSB',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '08:45', scheduledDeparture: '08:45', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'GDY', stationName: 'Guindy', scheduledArrival: '09:09', scheduledDeparture: '09:10', platform: '1', distanceKm: 15.0, isHalt: true },
      { stationCode: 'MBM', stationName: 'Mambalam', scheduledArrival: '09:15', scheduledDeparture: '09:16', platform: '1', distanceKm: 18.0, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '09:27', scheduledDeparture: '09:28', platform: '2', distanceKm: 24.5, isHalt: true },
      { stationCode: 'MPK', stationName: 'Chennai Park', scheduledArrival: '09:32', scheduledDeparture: '09:33', platform: '2', distanceKm: 26.0, isHalt: true },
      { stationCode: 'MSF', stationName: 'Chennai Fort', scheduledArrival: '09:35', scheduledDeparture: '09:36', platform: '2', distanceKm: 27.0, isHalt: true },
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '09:43', scheduledDeparture: '09:43', platform: '2', distanceKm: 29.0, isHalt: true }
    ]
  },
  {
    trainNumber: '40004',
    trainName: 'Tambaram - Chennai Beach Local EMU',
    hindiName: 'तांबरम - चेन्नई बीच लोकल',
    marathiName: 'तांबरम - चेन्नई बीच लोकल',
    originStation: 'TBM',
    destinationStation: 'MSB',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '10:35', scheduledDeparture: '10:35', platform: '3', distanceKm: 0, isHalt: true },
      { stationCode: 'GDY', stationName: 'Guindy', scheduledArrival: '10:59', scheduledDeparture: '11:00', platform: '1', distanceKm: 15.0, isHalt: true },
      { stationCode: 'MBM', stationName: 'Mambalam', scheduledArrival: '11:05', scheduledDeparture: '11:06', platform: '1', distanceKm: 18.0, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '11:17', scheduledDeparture: '11:18', platform: '2', distanceKm: 24.5, isHalt: true },
      { stationCode: 'MPK', stationName: 'Chennai Park', scheduledArrival: '11:22', scheduledDeparture: '11:23', platform: '2', distanceKm: 26.0, isHalt: true },
      { stationCode: 'MSF', stationName: 'Chennai Fort', scheduledArrival: '11:25', scheduledDeparture: '11:26', platform: '2', distanceKm: 27.0, isHalt: true },
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '11:33', scheduledDeparture: '11:33', platform: '1', distanceKm: 29.0, isHalt: true }
    ]
  },
  {
    trainNumber: '40006',
    trainName: 'Tambaram - Chennai Beach Local EMU',
    hindiName: 'तांबरम - चेन्नई बीच लोकल',
    marathiName: 'तांबरम - चेन्नई बीच लोकल',
    originStation: 'TBM',
    destinationStation: 'MSB',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'TBM', stationName: 'Tambaram', scheduledArrival: '18:00', scheduledDeparture: '18:00', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'GDY', stationName: 'Guindy', scheduledArrival: '18:24', scheduledDeparture: '18:25', platform: '1', distanceKm: 15.0, isHalt: true },
      { stationCode: 'MBM', stationName: 'Mambalam', scheduledArrival: '18:30', scheduledDeparture: '18:31', platform: '1', distanceKm: 18.0, isHalt: true },
      { stationCode: 'MS', stationName: 'Chennai Egmore', scheduledArrival: '18:42', scheduledDeparture: '18:43', platform: '2', distanceKm: 24.5, isHalt: true },
      { stationCode: 'MPK', stationName: 'Chennai Park', scheduledArrival: '18:47', scheduledDeparture: '18:48', platform: '2', distanceKm: 26.0, isHalt: true },
      { stationCode: 'MSF', stationName: 'Chennai Fort', scheduledArrival: '18:50', scheduledDeparture: '18:51', platform: '2', distanceKm: 27.0, isHalt: true },
      { stationCode: 'MSB', stationName: 'Chennai Beach', scheduledArrival: '18:58', scheduledDeparture: '18:58', platform: '3', distanceKm: 29.0, isHalt: true }
    ]
  },

  // --- Hyderabad Representative Journeys ---
  {
    trainNumber: 'HYD-101',
    trainName: 'Hyderabad - Lingampalli MMTS Local',
    hindiName: 'हैदराबाद - लिंगमपल्ली एमएमटीएस',
    marathiName: 'हैदराबाद - लिंगमपल्ली एमएमटीएस',
    originStation: 'HYB',
    destinationStation: 'LPI',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'HYB', stationName: 'Hyderabad Deccan', scheduledArrival: '10:30', scheduledDeparture: '10:30', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'SC', stationName: 'Secunderabad Junction', scheduledArrival: '10:50', scheduledDeparture: '10:52', platform: '2', distanceKm: 9.8, isHalt: true },
      { stationCode: 'LPI', stationName: 'Lingampalli', scheduledArrival: '11:14', scheduledDeparture: '11:14', platform: '3', distanceKm: 23.4, isHalt: true }
    ]
  },

  // --- Kochi Representative Journeys ---
  {
    trainNumber: 'COK-101',
    trainName: 'Ernakulam - Aluva MEMU Commuter',
    hindiName: 'एर्नाकुलम - अलुवा मेमू',
    marathiName: 'एर्नाकुलम - अलुवा मेमू',
    originStation: 'ERS',
    destinationStation: 'AWY',
    serviceType: 'suburban_slow',
    runningDays: [0, 1, 2, 3, 4, 5, 6],
    rakeType: '12_car',
    availableClasses: ['II', 'I'],
    stops: [
      { stationCode: 'ERS', stationName: 'Ernakulam Junction', scheduledArrival: '10:30', scheduledDeparture: '10:30', platform: '2', distanceKm: 0, isHalt: true },
      { stationCode: 'ERN', stationName: 'Ernakulam Town', scheduledArrival: '10:39', scheduledDeparture: '10:40', platform: '1', distanceKm: 3.0, isHalt: true },
      { stationCode: 'AWY', stationName: 'Aluva', scheduledArrival: '11:02', scheduledDeparture: '11:02', platform: '2', distanceKm: 20.2, isHalt: true }
    ]
  }
];

// Normalize TrainTrip with id, fromStationCode and toStationCode for ubiquitous consumer compatibility
for (const trip of TRAIN_TRIPS) {
  if (!trip.id) trip.id = trip.trainNumber;
  if (!trip.fromStationCode) trip.fromStationCode = trip.originStation;
  if (!trip.toStationCode) trip.toStationCode = trip.destinationStation;
}

/**
 * Baseline Scenario Observations [SCENARIO / SIMULATED MODEL]
 * Deterministic scenario fixtures modeling delays and disruptions. Not a live telemetry feed.
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
    dataSource: 'NTES Suburban Simulation Fixture #A12',
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
    dataSource: 'NTES Suburban Simulation Fixture #A14',
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
    dataSource: 'NTES Suburban Simulation Fixture #B01',
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
    dataSource: 'NTES National Feed Simulator',
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
    dataSource: 'NTES National Feed Simulator',
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
  if (travelClass === 'SL') {
    // Sleeper Mail/Express: ~₹0.48/km + ₹40 reservation/superfast
    return Math.max(140, Math.round(distanceKm * 0.48 + 40));
  }
  if (travelClass === '3A') {
    // AC 3-Tier: ~₹1.25/km + ₹90 reservation/superfast
    return Math.max(480, Math.round(distanceKm * 1.25 + 90));
  }
  if (travelClass === '2A') {
    // AC 2-Tier: ~₹1.80/km + ₹110 reservation/superfast
    return Math.max(720, Math.round(distanceKm * 1.80 + 110));
  }
  if (travelClass === '1A') {
    // AC First Class: ~₹3.10/km + ₹150 reservation/superfast
    return Math.max(1200, Math.round(distanceKm * 3.10 + 150));
  }
  return 10;
}
