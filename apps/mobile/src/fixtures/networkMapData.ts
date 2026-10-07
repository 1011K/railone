import { MapStationNode, MapTrackSegment, RegionalLine } from '../types/railway';
import { METRO_STATIONS } from './metroData';

/**
 * Comprehensive Mumbai Suburban & Pan-India Railway Station Geometry & Topology
 * Full coverage of Western, Central Main, Harbour, Trans-Harbour, and Uran lines.
 * Normalized coordinates for high-legibility 2D layout and 3D Isometric Projection.
 */

export const MUMBAI_SUBURBAN_NODES: MapStationNode[] = [
  // ==========================================
  // WESTERN LINE (Churchgate to Dahanu Road)
  // ==========================================
  { id: 'CCG', code: 'CCG', name: 'Churchgate', hindiName: 'चर्चगेट', marathiName: 'चर्चगेट', line: 'western', city: 'Mumbai', x: 180, y: 870, z: 10, platforms: [1, 2, 3, 4], isMajorHub: true },
  { id: 'MEL', code: 'MEL', name: 'Marine Lines', hindiName: 'मरीन लाइन्स', marathiName: 'मरीन लाइन्स', line: 'western', city: 'Mumbai', x: 180, y: 845, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'CYR', code: 'CYR', name: 'Charni Road', hindiName: 'चर्नी रोड', marathiName: 'चर्नी रोड', line: 'western', city: 'Mumbai', x: 180, y: 820, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'GTR', code: 'GTR', name: 'Grant Road', hindiName: 'ग्रांट रोड', marathiName: 'ग्रँट रोड', line: 'western', city: 'Mumbai', x: 180, y: 795, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'MMCT', code: 'MMCT', name: 'Mumbai Central', hindiName: 'मुंबई सेंट्रल', marathiName: 'मुंबई सेंट्रल', line: 'western', city: 'Mumbai', x: 180, y: 770, z: 12, platforms: [1, 2, 3, 4, 5], isInterchange: true, isMajorHub: true },
  { id: 'MX', code: 'MX', name: 'Mahalaxmi', hindiName: 'महालक्ष्मी', marathiName: 'महालक्ष्मी', line: 'western', city: 'Mumbai', x: 180, y: 740, z: 10, platforms: [1, 2, 3] },
  { id: 'PL', code: 'PL', name: 'Lower Parel', hindiName: 'लोअर परेल', marathiName: 'लोअर परळ', line: 'western', city: 'Mumbai', x: 180, y: 715, z: 10, platforms: [1, 2, 3] },
  { id: 'PBHD', code: 'PBHD', name: 'Prabhadevi', hindiName: 'प्रभादेवी', marathiName: 'प्रभादेवी', line: 'western', city: 'Mumbai', x: 180, y: 685, z: 10, platforms: [1, 2], isInterchange: true },
  { id: 'DDR', code: 'DDR', name: 'Dadar (Western)', hindiName: 'दादर (पश्चिम)', marathiName: 'दादर (पश्चिम)', line: 'western', city: 'Mumbai', x: 180, y: 655, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7], isInterchange: true, isMajorHub: true },
  { id: 'MRU', code: 'MRU', name: 'Matunga Road', hindiName: 'माटुंगा रोड', marathiName: 'माटुंगा रोड', line: 'western', city: 'Mumbai', x: 180, y: 625, z: 10, platforms: [1, 2] },
  { id: 'MM', code: 'MM', name: 'Mahim Jn', hindiName: 'माहिम', marathiName: 'माहिम', line: 'western', city: 'Mumbai', x: 180, y: 595, z: 12, platforms: [1, 2, 3, 4, 5], isInterchange: true },
  { id: 'BA', code: 'BA', name: 'Bandra', hindiName: 'बांद्रा', marathiName: 'वांद्रे', line: 'western', city: 'Mumbai', x: 180, y: 565, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7], isInterchange: true, isMajorHub: true },
  { id: 'KHAR', code: 'KHAR', name: 'Khar Road', hindiName: 'खार रोड', marathiName: 'खार रोड', line: 'western', city: 'Mumbai', x: 180, y: 535, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'STC', code: 'STC', name: 'Santacruz', hindiName: 'सांताक्रुज', marathiName: 'सांताक्रूझ', line: 'western', city: 'Mumbai', x: 180, y: 505, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'VLP', code: 'VLP', name: 'Vile Parle', hindiName: 'विले पार्ले', marathiName: 'विलेपार्ले', line: 'western', city: 'Mumbai', x: 180, y: 475, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'ADH', code: 'ADH', name: 'Andheri', hindiName: 'अंधेरी', marathiName: 'अंधेरी', line: 'western', city: 'Mumbai', x: 180, y: 440, z: 14, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9], isInterchange: true, isMajorHub: true },
  { id: 'JOS', code: 'JOS', name: 'Jogeshwari', hindiName: 'जोगेश्वरी', marathiName: 'जोगेश्वरी', line: 'western', city: 'Mumbai', x: 180, y: 410, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'RMAR', code: 'RMAR', name: 'Ram Mandir', hindiName: 'राम मंदिर', marathiName: 'राम मंदिर', line: 'western', city: 'Mumbai', x: 180, y: 385, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'GMN', code: 'GMN', name: 'Goregaon', hindiName: 'गोरेगांव', marathiName: 'गोरेगाव', line: 'western', city: 'Mumbai', x: 180, y: 360, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7], isInterchange: true, isMajorHub: true },
  { id: 'MDD', code: 'MDD', name: 'Malad', hindiName: 'मालाड', marathiName: 'मालाड', line: 'western', city: 'Mumbai', x: 180, y: 335, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'KILE', code: 'KILE', name: 'Kandivali', hindiName: 'कांदिवली', marathiName: 'कांदिवली', line: 'western', city: 'Mumbai', x: 180, y: 310, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'BVI', code: 'BVI', name: 'Borivali', hindiName: 'बोरिवली', marathiName: 'बोरिवली', line: 'western', city: 'Mumbai', x: 180, y: 280, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isInterchange: true, isMajorHub: true },
  { id: 'DIC', code: 'DIC', name: 'Dahisar', hindiName: 'दहिसर', marathiName: 'दहिसर', line: 'western', city: 'Mumbai', x: 180, y: 250, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'MIRA', code: 'MIRA', name: 'Mira Road', hindiName: 'मीरा रोड', marathiName: 'मीरा रोड', line: 'western', city: 'Thane', x: 180, y: 225, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'BYR', code: 'BYR', name: 'Bhayandar', hindiName: 'भायंदर', marathiName: 'भाईंदर', line: 'western', city: 'Thane', x: 180, y: 200, z: 12, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },
  { id: 'NIG', code: 'NIG', name: 'Naigaon', hindiName: 'नायगांव', marathiName: 'नायगाव', line: 'western', city: 'Palghar', x: 180, y: 175, z: 10, platforms: [1, 2] },
  { id: 'BSR', code: 'BSR', name: 'Vasai Road', hindiName: 'वसई रोड', marathiName: 'वसई रोड', line: 'western', city: 'Palghar', x: 180, y: 150, z: 14, platforms: [1, 2, 3, 4, 5, 6, 7], isInterchange: true, isMajorHub: true },
  { id: 'NSP', code: 'NSP', name: 'Nallasopara', hindiName: 'नालासोपारा', marathiName: 'नालासोपारा', line: 'western', city: 'Palghar', x: 180, y: 125, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'VR', code: 'VR', name: 'Virar', hindiName: 'विरार', marathiName: 'विरार', line: 'western', city: 'Virar', x: 180, y: 100, z: 14, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isMajorHub: true },
  { id: 'VTN', code: 'VTN', name: 'Vaitarna', hindiName: 'वैतरणा', marathiName: 'वैतरणा', line: 'western', city: 'Palghar', x: 175, y: 80, z: 10, platforms: [1, 2] },
  { id: 'SAH', code: 'SAH', name: 'Saphale', hindiName: 'सफळे', marathiName: 'सफाळे', line: 'western', city: 'Palghar', x: 170, y: 65, z: 10, platforms: [1, 2] },
  { id: 'KLV', code: 'KLV', name: 'Kelve Road', hindiName: 'केलवे रोड', marathiName: 'केळवे रोड', line: 'western', city: 'Palghar', x: 165, y: 50, z: 10, platforms: [1, 2] },
  { id: 'PLG', code: 'PLG', name: 'Palghar', hindiName: 'पालघर', marathiName: 'पालघर', line: 'western', city: 'Palghar', x: 160, y: 38, z: 12, platforms: [1, 2, 3], isMajorHub: true },
  { id: 'BOR', code: 'BOR', name: 'Boisar', hindiName: 'बोईसर', marathiName: 'बोईसर', line: 'western', city: 'Palghar', x: 155, y: 28, z: 10, platforms: [1, 2, 3], isMajorHub: true },
  { id: 'DRD', code: 'DRD', name: 'Dahanu Road', hindiName: 'दहाणू रोड', marathiName: 'डहाणू रोड', line: 'western', city: 'Palghar', x: 150, y: 18, z: 12, platforms: [1, 2, 3, 4], isMajorHub: true },

  // ==========================================
  // CENTRAL MAIN LINE (CSMT to Kalyan & Beyond)
  // ==========================================
  { id: 'CSMT', code: 'CSMT', name: 'CSMT Terminus', hindiName: 'छत्रपति शिवाजी महाराज टर्मिनस', marathiName: 'छत्रपती शिवाजी महाराज टर्मिनस', line: 'central', city: 'Mumbai', x: 280, y: 870, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], isInterchange: true, isMajorHub: true },
  { id: 'MSD', code: 'MSD', name: 'Masjid', hindiName: 'मस्जिद', marathiName: 'मशीद', line: 'central', city: 'Mumbai', x: 280, y: 845, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'SNRD', code: 'SNRD', name: 'Sandhurst Road', hindiName: 'सैंडहर्स्ट रोड', marathiName: 'सँडहर्स्ट रोड', line: 'central', city: 'Mumbai', x: 280, y: 820, z: 10, platforms: [1, 2, 3, 4], isInterchange: true },
  { id: 'BY', code: 'BY', name: 'Byculla', hindiName: 'भायखला', marathiName: 'भायखळा', line: 'central', city: 'Mumbai', x: 280, y: 795, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'CHG', code: 'CHG', name: 'Chinchpokli', hindiName: 'चिंचपोकली', marathiName: 'चिंचपोकळी', line: 'central', city: 'Mumbai', x: 280, y: 765, z: 10, platforms: [1, 2] },
  { id: 'CRD', code: 'CRD', name: 'Currey Road', hindiName: 'करी रोड', marathiName: 'करी रोड', line: 'central', city: 'Mumbai', x: 280, y: 735, z: 10, platforms: [1, 2] },
  { id: 'PR', code: 'PR', name: 'Parel', hindiName: 'परेल', marathiName: 'परळ', line: 'central', city: 'Mumbai', x: 280, y: 705, z: 10, platforms: [1, 2, 3], isInterchange: true },
  { id: 'DR', code: 'DR', name: 'Dadar (Central)', hindiName: 'दादर (मध्य)', marathiName: 'दादर (मध्य)', line: 'central', city: 'Mumbai', x: 260, y: 655, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isInterchange: true, isMajorHub: true },
  { id: 'MTN', code: 'MTN', name: 'Matunga', hindiName: 'माटुंगा', marathiName: 'माटुंगा', line: 'central', city: 'Mumbai', x: 275, y: 625, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'SIN', code: 'SIN', name: 'Sion', hindiName: 'सायन', marathiName: 'शीव', line: 'central', city: 'Mumbai', x: 290, y: 595, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'CLA', code: 'CLA', name: 'Kurla Jn', hindiName: 'कुर्ला', marathiName: 'कुर्ला', line: 'central', city: 'Mumbai', x: 310, y: 565, z: 14, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isInterchange: true, isMajorHub: true },
  { id: 'VVH', code: 'VVH', name: 'Vidyavihar', hindiName: 'विद्याविहार', marathiName: 'विद्याविहार', line: 'central', city: 'Mumbai', x: 325, y: 530, z: 10, platforms: [1, 2] },
  { id: 'GC', code: 'GC', name: 'Ghatkopar', hindiName: 'घाटकोपर', marathiName: 'घाटकोपर', line: 'central', city: 'Mumbai', x: 340, y: 495, z: 12, platforms: [1, 2, 3, 4], isInterchange: true, isMajorHub: true },
  { id: 'VK', code: 'VK', name: 'Vikhroli', hindiName: 'विक्रोली', marathiName: 'विक्रोळी', line: 'central', city: 'Mumbai', x: 355, y: 460, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'KJMG', code: 'KJMG', name: 'Kanjurmarg', hindiName: 'कांजुरमार्ग', marathiName: 'कांजूरमार्ग', line: 'central', city: 'Mumbai', x: 365, y: 425, z: 10, platforms: [1, 2, 3] },
  { id: 'BND', code: 'BND', name: 'Bhandup', hindiName: 'भांडुप', marathiName: 'भांडुप', line: 'central', city: 'Mumbai', x: 375, y: 390, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'NHU', code: 'NHU', name: 'Nahur', hindiName: 'नाहूर', marathiName: 'नाहूर', line: 'central', city: 'Mumbai', x: 385, y: 355, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'MLND', code: 'MLND', name: 'Mulund', hindiName: 'मुलुंड', marathiName: 'मुलुंड', line: 'central', city: 'Mumbai', x: 395, y: 320, z: 10, platforms: [1, 2, 3, 4], isMajorHub: true },
  { id: 'TNA', code: 'TNA', name: 'Thane', hindiName: 'ठाणे', marathiName: 'ठाणे', line: 'central', city: 'Thane', x: 410, y: 280, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isInterchange: true, isMajorHub: true },
  { id: 'KLVA', code: 'KLVA', name: 'Kalva', hindiName: 'कलवा', marathiName: 'कळवा', line: 'central', city: 'Thane', x: 430, y: 255, z: 10, platforms: [1, 2, 3] },
  { id: 'MBQ', code: 'MBQ', name: 'Mumbra', hindiName: 'मुंब्रा', marathiName: 'मुंब्रा', line: 'central', city: 'Thane', x: 450, y: 235, z: 10, platforms: [1, 2] },
  { id: 'DIVA', code: 'DIVA', name: 'Diva Jn', hindiName: 'दिवा', marathiName: 'दिवा', line: 'central', city: 'Thane', x: 470, y: 215, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isInterchange: true, isMajorHub: true },
  { id: 'KOPR', code: 'KOPR', name: 'Kopar', hindiName: 'कोपर', marathiName: 'कोपर', line: 'central', city: 'Dombivli', x: 490, y: 195, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'DI', code: 'DI', name: 'Dombivli', hindiName: 'डोंबिवली', marathiName: 'डोंबिवली', line: 'central', city: 'Dombivli', x: 510, y: 175, z: 12, platforms: [1, 2, 3, 4, 5], isMajorHub: true },
  { id: 'THK', code: 'THK', name: 'Thakurli', hindiName: 'ठाकुर्ली', marathiName: 'ठाकुर्ली', line: 'central', city: 'Dombivli', x: 530, y: 155, z: 10, platforms: [1, 2] },
  { id: 'KYN', code: 'KYN', name: 'Kalyan Jn', hindiName: 'कल्याण', marathiName: 'कल्याण', line: 'central', city: 'Kalyan', x: 555, y: 135, z: 16, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isInterchange: true, isMajorHub: true },

  // Central North-East Branch (Kalyan to Kasara)
  { id: 'SHAD', code: 'SHAD', name: 'Shahad', hindiName: 'शहाड', marathiName: 'शहाड', line: 'central', city: 'Kalyan', x: 580, y: 115, z: 10, platforms: [1, 2] },
  { id: 'ABY', code: 'ABY', name: 'Ambivli', hindiName: 'आंबिवली', marathiName: 'आंबिवली', line: 'central', city: 'Kalyan', x: 605, y: 95, z: 10, platforms: [1, 2] },
  { id: 'TLA', code: 'TLA', name: 'Titwala', hindiName: 'टिटवाला', marathiName: 'टिटवाळा', line: 'central', city: 'Titwala', x: 635, y: 75, z: 12, platforms: [1, 2, 3], isMajorHub: true },
  { id: 'KDV', code: 'KDV', name: 'Khadavli', hindiName: 'खडावली', marathiName: 'खडावली', line: 'central', city: 'Thane', x: 665, y: 60, z: 10, platforms: [1, 2] },
  { id: 'VSD', code: 'VSD', name: 'Vasind', hindiName: 'वासिंद', marathiName: 'वासिंद', line: 'central', city: 'Thane', x: 695, y: 45, z: 10, platforms: [1, 2] },
  { id: 'ASO', code: 'ASO', name: 'Asangaon', hindiName: 'आसनगांव', marathiName: 'आसनगाव', line: 'central', city: 'Shahapur', x: 725, y: 35, z: 12, platforms: [1, 2, 3], isMajorHub: true },
  { id: 'KSRA', code: 'KSRA', name: 'Kasara', hindiName: 'कसारा', marathiName: 'कसारा', line: 'central', city: 'Kasara', x: 765, y: 20, z: 25, platforms: [1, 2, 3, 4], isMajorHub: true },

  // Central South-East Branch (Kalyan to Karjat & Khopoli)
  { id: 'VLDI', code: 'VLDI', name: 'Vithalwadi', hindiName: 'विठ्ठलवाडी', marathiName: 'विठ्ठलवाडी', line: 'central', city: 'Ulhasnagar', x: 580, y: 155, z: 10, platforms: [1, 2] },
  { id: 'ULNR', code: 'ULNR', name: 'Ulhasnagar', hindiName: 'उल्हासनगर', marathiName: 'उल्हासनगर', line: 'central', city: 'Ulhasnagar', x: 605, y: 175, z: 10, platforms: [1, 2] },
  { id: 'ABH', code: 'ABH', name: 'Ambernath', hindiName: 'अंबरनाथ', marathiName: 'अंबरनाथ', line: 'central', city: 'Ambernath', x: 630, y: 195, z: 12, platforms: [1, 2, 3], isMajorHub: true },
  { id: 'BUD', code: 'BUD', name: 'Badlapur', hindiName: 'बदलापूर', marathiName: 'बदलापूर', line: 'central', city: 'Badlapur', x: 660, y: 220, z: 12, platforms: [1, 2, 3], isMajorHub: true },
  { id: 'VGI', code: 'VGI', name: 'Vangani', hindiName: 'वांगणी', marathiName: 'वांगणी', line: 'central', city: 'Raigad', x: 690, y: 250, z: 10, platforms: [1, 2] },
  { id: 'NRL', code: 'NRL', name: 'Neral Jn', hindiName: 'नेरल', marathiName: 'नेरळ', line: 'central', city: 'Raigad', x: 720, y: 285, z: 12, platforms: [1, 2, 3], isInterchange: true },
  { id: 'KJT', code: 'KJT', name: 'Karjat Jn', hindiName: 'कर्जत', marathiName: 'कर्जत', line: 'central', city: 'Karjat', x: 750, y: 320, z: 18, platforms: [1, 2, 3], isMajorHub: true },
  { id: 'KHPI', code: 'KHPI', name: 'Khopoli', hindiName: 'खोपोली', marathiName: 'खोपोली', line: 'central', city: 'Khopoli', x: 780, y: 360, z: 15, platforms: [1], isMajorHub: true },

  // ==========================================
  // HARBOUR LINE (CSMT to Panvel & Wadala Branch)
  // ==========================================
  { id: 'DKRD', code: 'DKRD', name: 'Dockyard Road', hindiName: 'डॉकयार्ड रोड', marathiName: 'डॉकयार्ड रोड', line: 'harbour', city: 'Mumbai', x: 315, y: 800, z: 10, platforms: [1, 2] },
  { id: 'RRD', code: 'RRD', name: 'Reay Road', hindiName: 'रे रोड', marathiName: 'रे रोड', line: 'harbour', city: 'Mumbai', x: 320, y: 770, z: 10, platforms: [1, 2] },
  { id: 'CTGN', code: 'CTGN', name: 'Cotton Green', hindiName: 'कॉटन ग्रीन', marathiName: 'कॉटन ग्रीन', line: 'harbour', city: 'Mumbai', x: 325, y: 740, z: 10, platforms: [1, 2] },
  { id: 'SVE', code: 'SVE', name: 'Sewri', hindiName: 'शिवड़ी', marathiName: 'शिवडी', line: 'harbour', city: 'Mumbai', x: 330, y: 710, z: 10, platforms: [1, 2] },
  { id: 'VDLR', code: 'VDLR', name: 'Vadala Road', hindiName: 'वडाला रोड', marathiName: 'वडाळा रोड', line: 'harbour', city: 'Mumbai', x: 335, y: 675, z: 12, platforms: [1, 2, 3, 4], isInterchange: true, isMajorHub: true },
  { id: 'GTBN', code: 'GTBN', name: 'GTB Nagar', hindiName: 'जी.टी.बी. नगर', marathiName: 'जी.टी.बी. नगर', line: 'harbour', city: 'Mumbai', x: 345, y: 635, z: 10, platforms: [1, 2] },
  { id: 'CHF', code: 'CHF', name: 'Chunabhatti', hindiName: 'चुनाभट्टी', marathiName: 'चुनाभट्टी', line: 'harbour', city: 'Mumbai', x: 330, y: 600, z: 10, platforms: [1, 2] },
  { id: 'TKNG', code: 'TKNG', name: 'Tilak Nagar', hindiName: 'तिलक नगर', marathiName: 'टिळक नगर', line: 'harbour', city: 'Mumbai', x: 350, y: 565, z: 10, platforms: [1, 2] },
  { id: 'CMBR', code: 'CMBR', name: 'Chembur', hindiName: 'चेंबरूर', marathiName: 'चेंबूर', line: 'harbour', city: 'Mumbai', x: 380, y: 565, z: 10, platforms: [1, 2] },
  { id: 'GV', code: 'GV', name: 'Govandi', hindiName: 'गोवंडी', marathiName: 'गोवंडी', line: 'harbour', city: 'Mumbai', x: 410, y: 565, z: 10, platforms: [1, 2] },
  { id: 'MNKD', code: 'MNKD', name: 'Mankhurd', hindiName: 'मानखुर्द', marathiName: 'मानखुर्द', line: 'harbour', city: 'Mumbai', x: 440, y: 565, z: 10, platforms: [1, 2] },
  { id: 'VSH', code: 'VSH', name: 'Vashi', hindiName: 'वाशी', marathiName: 'वाशी', line: 'harbour', city: 'Navi Mumbai', x: 485, y: 565, z: 14, platforms: [1, 2, 3, 4], isInterchange: true, isMajorHub: true },
  { id: 'SNCR', code: 'SNCR', name: 'Sanpada', hindiName: 'सानपाड़ा', marathiName: 'सानपाडा', line: 'harbour', city: 'Navi Mumbai', x: 520, y: 565, z: 10, platforms: [1, 2, 3, 4], isInterchange: true },
  { id: 'JNJ', code: 'JNJ', name: 'Juinagar', hindiName: 'जुईनगर', marathiName: 'जुईनगर', line: 'harbour', city: 'Navi Mumbai', x: 555, y: 565, z: 12, platforms: [1, 2, 3, 4], isInterchange: true },
  { id: 'NEU', code: 'NEU', name: 'Nerul', hindiName: 'नेरुल', marathiName: 'नेरुळ', line: 'harbour', city: 'Navi Mumbai', x: 590, y: 565, z: 14, platforms: [1, 2, 3, 4, 5, 6], isInterchange: true, isMajorHub: true },
  { id: 'SWDV', code: 'SWDV', name: 'Seawoods-Darave', hindiName: 'सीवूड्स', marathiName: 'सीवूड्स', line: 'harbour', city: 'Navi Mumbai', x: 625, y: 565, z: 12, platforms: [1, 2], isInterchange: true },
  { id: 'BEPR', code: 'BEPR', name: 'Belapur CBD', hindiName: 'बेलापुर', marathiName: 'बेलापूर', line: 'harbour', city: 'Navi Mumbai', x: 660, y: 565, z: 14, platforms: [1, 2, 3, 4], isInterchange: true, isMajorHub: true },
  { id: 'KHAG', code: 'KHAG', name: 'Kharghar', hindiName: 'खारघर', marathiName: 'खारघर', line: 'harbour', city: 'Navi Mumbai', x: 695, y: 565, z: 10, platforms: [1, 2] },
  { id: 'MANR', code: 'MANR', name: 'Mansarovar', hindiName: 'मानसरोवर', marathiName: 'मानसरोवर', line: 'harbour', city: 'Navi Mumbai', x: 730, y: 565, z: 10, platforms: [1, 2] },
  { id: 'KNDS', code: 'KNDS', name: 'Khandeshwar', hindiName: 'खांदेश्वर', marathiName: 'खांदेश्वर', line: 'harbour', city: 'Navi Mumbai', x: 765, y: 565, z: 10, platforms: [1, 2] },
  { id: 'PNVL', code: 'PNVL', name: 'Panvel Jn', hindiName: 'पनवेल', marathiName: 'पनवेल', line: 'harbour', city: 'Navi Mumbai', x: 805, y: 565, z: 16, platforms: [1, 2, 3, 4, 5, 6, 7], isInterchange: true, isMajorHub: true },

  // ==========================================
  // TRANS-HARBOUR LINE (Thane to Turbhe/Panvel)
  // ==========================================
  { id: 'DIGH', code: 'DIGH', name: 'Digha Gaon', hindiName: 'दीघा गांव', marathiName: 'दिघा गाव', line: 'transharbour', city: 'Navi Mumbai', x: 435, y: 320, z: 10, platforms: [1, 2] },
  { id: 'AIRL', code: 'AIRL', name: 'Airoli', hindiName: 'ऐरोली', marathiName: 'ऐरोली', line: 'transharbour', city: 'Navi Mumbai', x: 455, y: 360, z: 10, platforms: [1, 2] },
  { id: 'RBL', code: 'RBL', name: 'Rabale', hindiName: 'रबाले', marathiName: 'रबाळे', line: 'transharbour', city: 'Navi Mumbai', x: 475, y: 400, z: 10, platforms: [1, 2] },
  { id: 'GNSL', code: 'GNSL', name: 'Ghansoli', hindiName: 'घणसोली', marathiName: 'घणसोली', line: 'transharbour', city: 'Navi Mumbai', x: 495, y: 440, z: 10, platforms: [1, 2] },
  { id: 'KOPK', code: 'KOPK', name: 'Kopar Khairane', hindiName: 'कोपर खैराणे', marathiName: 'कोपर खैरणे', line: 'transharbour', city: 'Navi Mumbai', x: 515, y: 480, z: 10, platforms: [1, 2] },
  { id: 'TURB', code: 'TURB', name: 'Turbhe', hindiName: 'तुर्भे', marathiName: 'तुर्भे', line: 'transharbour', city: 'Navi Mumbai', x: 535, y: 520, z: 12, platforms: [1, 2, 3, 4], isInterchange: true },

  // ==========================================
  // URAN LINE (Nerul/Belapur to Uran)
  // ==========================================
  { id: 'BMDR', code: 'BMDR', name: 'Bamandongri', hindiName: 'बामनडोंगरी', marathiName: 'बामणडोंगरी', line: 'uran', city: 'Navi Mumbai', x: 630, y: 630, z: 10, platforms: [1, 2] },
  { id: 'KKPR', code: 'KKPR', name: 'Kharkopar', hindiName: 'खारकोपर', marathiName: 'खारकोपर', line: 'uran', city: 'Navi Mumbai', x: 640, y: 680, z: 10, platforms: [1, 2] },
  { id: 'NVSH', code: 'NVSH', name: 'Nhava Sheva', hindiName: 'न्हावा शेवा', marathiName: 'न्हावा शेवा', line: 'uran', city: 'Navi Mumbai', x: 650, y: 730, z: 10, platforms: [1, 2] },
  { id: 'DRGI', code: 'DRGI', name: 'Dronagiri', hindiName: 'द्रोणागिरी', marathiName: 'द्रोणागिरी', line: 'uran', city: 'Navi Mumbai', x: 660, y: 780, z: 10, platforms: [1, 2] },
  { id: 'URAN', code: 'URAN', name: 'Uran', hindiName: 'उरण', marathiName: 'उरण', line: 'uran', city: 'Uran', x: 670, y: 830, z: 12, platforms: [1, 2], isMajorHub: true }
];

export const PAN_INDIA_NODES: MapStationNode[] = [
  // Northern Region
  { id: 'JAT', code: 'JAT', name: 'Jammu Tawi', hindiName: 'जम्मू तवी', line: 'national', zone: 'NR', city: 'Jammu', x: 350, y: 80, z: 20, platforms: [1, 2, 3, 4], isMajorHub: true },
  { id: 'ASR', code: 'ASR', name: 'Amritsar Jn', hindiName: 'अमृतसर', line: 'national', zone: 'NR', city: 'Amritsar', x: 330, y: 130, z: 15, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },
  { id: 'CDG', code: 'CDG', name: 'Chandigarh', hindiName: 'चंडीगढ़', line: 'national', zone: 'NR', city: 'Chandigarh', x: 380, y: 150, z: 15, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },
  { id: 'NDLS', code: 'NDLS', name: 'New Delhi', hindiName: 'नई दिल्ली', line: 'national', zone: 'NR', city: 'Delhi', x: 420, y: 210, z: 20, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], isInterchange: true, isMajorHub: true },
  { id: 'AGC', code: 'AGC', name: 'Agra Cantt', hindiName: 'आगरा कैंट', line: 'national', zone: 'NCR', city: 'Agra', x: 440, y: 270, z: 10, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },
  { id: 'GWL', code: 'GWL', name: 'Gwalior Jn', hindiName: 'ग्वालियर', line: 'national', zone: 'NCR', city: 'Gwalior', x: 450, y: 320, z: 10, platforms: [1, 2, 3, 4, 5] },
  { id: 'VGLJ', code: 'VGLJ', name: 'VGL Jhansi Jn', hindiName: 'झांसी', line: 'national', zone: 'NCR', city: 'Jhansi', x: 460, y: 360, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isMajorHub: true },
  { id: 'CNB', code: 'CNB', name: 'Kanpur Central', hindiName: 'कानपुर सेंट्रल', line: 'national', zone: 'NCR', city: 'Kanpur', x: 540, y: 300, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isMajorHub: true },
  { id: 'LKO', code: 'LKO', name: 'Lucknow Charbagh', hindiName: 'लखनऊ', line: 'national', zone: 'NR', city: 'Lucknow', x: 560, y: 270, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9], isMajorHub: true },
  { id: 'PRYJ', code: 'PRYJ', name: 'Prayagraj Jn', hindiName: 'प्रयागराज', line: 'national', zone: 'NCR', city: 'Prayagraj', x: 600, y: 340, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isMajorHub: true },
  { id: 'BSB', code: 'BSB', name: 'Varanasi Jn', hindiName: 'वाराणसी', line: 'national', zone: 'NR', city: 'Varanasi', x: 650, y: 330, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9], isMajorHub: true },
  { id: 'DDU', code: 'DDU', name: 'Pt Deen Dayal Upadhyaya', hindiName: 'दीन दयाल उपाध्याय', line: 'national', zone: 'ECR', city: 'Mughalsarai', x: 670, y: 350, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isInterchange: true, isMajorHub: true },
  { id: 'GKP', code: 'GKP', name: 'Gorakhpur Jn', hindiName: 'गोरखपुर', line: 'national', zone: 'NER', city: 'Gorakhpur', x: 640, y: 260, z: 10, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isMajorHub: true },

  // Western Region
  { id: 'JP', code: 'JP', name: 'Jaipur Jn', hindiName: 'जयपुर', line: 'national', zone: 'NWR', city: 'Jaipur', x: 350, y: 280, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isMajorHub: true },
  { id: 'KOTA', code: 'KOTA', name: 'Kota Jn', hindiName: 'कोटा', line: 'national', zone: 'WCR', city: 'Kota', x: 380, y: 360, z: 10, platforms: [1, 2, 3, 4, 5], isMajorHub: true },
  { id: 'RTM', code: 'RTM', name: 'Ratlam Jn', hindiName: 'रतलाम', line: 'national', zone: 'WR', city: 'Ratlam', x: 340, y: 440, z: 10, platforms: [1, 2, 3, 4, 5, 6, 7], isMajorHub: true },
  { id: 'ADI', code: 'ADI', name: 'Ahmedabad Jn', hindiName: 'अहमदाबाद', line: 'national', zone: 'WR', city: 'Ahmedabad', x: 250, y: 450, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], isMajorHub: true },
  { id: 'BRC', code: 'BRC', name: 'Vadodara Jn', hindiName: 'वडोदरा', line: 'national', zone: 'WR', city: 'Vadodara', x: 270, y: 490, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7], isMajorHub: true },
  { id: 'ST', code: 'ST', name: 'Surat', hindiName: 'सूरत', line: 'national', zone: 'WR', city: 'Surat', x: 260, y: 540, z: 10, platforms: [1, 2, 3, 4], isMajorHub: true },
  { id: 'MMCT_NAT', code: 'MMCT', name: 'Mumbai Central', hindiName: 'मुंबई सेंट्रल', line: 'national', zone: 'WR', city: 'Mumbai', x: 250, y: 630, z: 18, platforms: [1, 2, 3, 4, 5], isInterchange: true, isMajorHub: true },
  { id: 'CSMT_NAT', code: 'CSMT', name: 'Mumbai CSMT', hindiName: 'मुंबई सीएसएमटी', line: 'national', zone: 'CR', city: 'Mumbai', x: 270, y: 645, z: 18, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], isInterchange: true, isMajorHub: true },
  { id: 'PUNE_NAT', code: 'PUNE', name: 'Pune Jn', hindiName: 'पुणे', line: 'national', zone: 'CR', city: 'Pune', x: 300, y: 680, z: 15, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },

  // Central Region
  { id: 'BPL', code: 'BPL', name: 'Bhopal Jn', hindiName: 'भोपाल', line: 'national', zone: 'WCR', city: 'Bhopal', x: 440, y: 430, z: 15, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },
  { id: 'ET', code: 'ET', name: 'Itarsi Jn', hindiName: 'इटारसी', line: 'national', zone: 'WCR', city: 'Itarsi', x: 450, y: 470, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7], isInterchange: true, isMajorHub: true },
  { id: 'NGP', code: 'NGP', name: 'Nagpur Jn', hindiName: 'नागपुर', line: 'national', zone: 'CR', city: 'Nagpur', x: 480, y: 530, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isInterchange: true, isMajorHub: true },
  { id: 'JBP', code: 'JBP', name: 'Jabalpur Jn', hindiName: 'जबलपुर', line: 'national', zone: 'WCR', city: 'Jabalpur', x: 520, y: 420, z: 10, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },
  { id: 'R', code: 'R', name: 'Raipur Jn', hindiName: 'रायपुर', line: 'national', zone: 'SECR', city: 'Raipur', x: 600, y: 510, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7], isMajorHub: true },
  { id: 'BSP', code: 'BSP', name: 'Bilaspur Jn', hindiName: 'बिलासपुर', line: 'national', zone: 'SECR', city: 'Bilaspur', x: 630, y: 480, z: 14, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isMajorHub: true },

  // Eastern Region
  { id: 'PNBE', code: 'PNBE', name: 'Patna Jn', hindiName: 'पटना', line: 'national', zone: 'ECR', city: 'Patna', x: 710, y: 310, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isMajorHub: true },
  { id: 'GAYA', code: 'GAYA', name: 'Gaya Jn', hindiName: 'गया', line: 'national', zone: 'ECR', city: 'Gaya', x: 710, y: 350, z: 10, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { id: 'ASN', code: 'ASN', name: 'Asansol Jn', hindiName: 'आसनसोल', line: 'national', zone: 'ER', city: 'Asansol', x: 770, y: 380, z: 10, platforms: [1, 2, 3, 4, 5, 6, 7], isMajorHub: true },
  { id: 'TATA', code: 'TATA', name: 'Tatanagar Jn', hindiName: 'टाटानगर', line: 'national', zone: 'SER', city: 'Jamshedpur', x: 760, y: 440, z: 12, platforms: [1, 2, 3, 4, 5], isMajorHub: true },
  { id: 'HWH', code: 'HWH', name: 'Howrah Jn (Kolkata)', hindiName: 'हावड़ा', line: 'national', zone: 'ER', city: 'Kolkata', x: 820, y: 420, z: 18, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], isMajorHub: true },
  { id: 'BBS', code: 'BBS', name: 'Bhubaneswar', hindiName: 'भुवनेश्वर', line: 'national', zone: 'ECoR', city: 'Bhubaneswar', x: 740, y: 520, z: 10, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },
  { id: 'PURI', code: 'PURI', name: 'Puri', hindiName: 'पुरी', line: 'national', zone: 'ECoR', city: 'Puri', x: 750, y: 560, z: 10, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isMajorHub: true },
  { id: 'GHY', code: 'GHY', name: 'Guwahati', hindiName: 'गुवाहाटी', line: 'national', zone: 'NFR', city: 'Guwahati', x: 890, y: 250, z: 10, platforms: [1, 2, 3, 4, 5, 6, 7], isMajorHub: true },

  // Southern Region
  { id: 'SC', code: 'SC', name: 'Secunderabad / Hyderabad', hindiName: 'सिकंदराबाद', line: 'national', zone: 'SCR', city: 'Hyderabad', x: 460, y: 660, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isMajorHub: true },
  { id: 'BZA', code: 'BZA', name: 'Vijayawada Jn', hindiName: 'विजयवाड़ा', line: 'national', zone: 'SCR', city: 'Vijayawada', x: 550, y: 680, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isInterchange: true, isMajorHub: true },
  { id: 'MAO_NAT', code: 'MAO', name: 'Madgaon Jn (Goa)', hindiName: 'मडगांव (गोवा)', line: 'national', zone: 'KR', city: 'Goa', x: 280, y: 760, z: 10, platforms: [1, 2, 3, 4], isMajorHub: true },
  { id: 'SBC', code: 'SBC', name: 'KSR Bengaluru', hindiName: 'बेंगलुरु', line: 'national', zone: 'SWR', city: 'Bengaluru', x: 420, y: 800, z: 16, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isMajorHub: true },
  { id: 'MAS', code: 'MAS', name: 'Chennai Central', hindiName: 'चेन्नई सेंट्रल', line: 'national', zone: 'SR', city: 'Chennai', x: 520, y: 790, z: 16, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], isMajorHub: true },
  { id: 'CBE', code: 'CBE', name: 'Coimbatore Jn', hindiName: 'कोयंबटूर', line: 'national', zone: 'SR', city: 'Coimbatore', x: 400, y: 870, z: 10, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },
  { id: 'ERS', code: 'ERS', name: 'Ernakulam / Kochi', hindiName: 'एर्नाकुलम (कोच्चि)', line: 'national', zone: 'SR', city: 'Kochi', x: 390, y: 900, z: 10, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },
  { id: 'TVC', code: 'TVC', name: 'Thiruvananthapuram Central', hindiName: 'तिरुवनंतपुरम', line: 'national', zone: 'SR', city: 'Trivandrum', x: 400, y: 940, z: 10, platforms: [1, 2, 3, 4, 5], isMajorHub: true }
];

/**
 * Sequential Corridor Chains: All station codes along physical rail lines in order.
 * Physical track segments connect each consecutive pair of stations.
 */
export const SUBURBAN_CORRIDOR_CHAINS = {
  western: [
    'CCG', 'MEL', 'CYR', 'GTR', 'MMCT', 'MX', 'PL', 'PBHD', 'DDR', 'MRU', 'MM', 'BA', 
    'KHAR', 'STC', 'VLP', 'ADH', 'JOS', 'RMAR', 'GMN', 'MDD', 'KILE', 'BVI', 'DIC', 
    'MIRA', 'BYR', 'NIG', 'BSR', 'NSP', 'VR', 'VTN', 'SAH', 'KLV', 'PLG', 'BOR', 'DRD'
  ],
  central_main: [
    'CSMT', 'MSD', 'SNRD', 'BY', 'CHG', 'CRD', 'PR', 'DR', 'MTN', 'SIN', 'CLA', 
    'VVH', 'GC', 'VK', 'KJMG', 'BND', 'NHU', 'MLND', 'TNA', 'KLVA', 'MBQ', 'DIVA', 
    'KOPR', 'DI', 'THK', 'KYN'
  ],
  central_kasara: [
    'KYN', 'SHAD', 'ABY', 'TLA', 'KDV', 'VSD', 'ASO', 'KSRA'
  ],
  central_karjat: [
    'KYN', 'VLDI', 'ULNR', 'ABH', 'BUD', 'VGI', 'NRL', 'KJT', 'KHPI'
  ],
  harbour: [
    'CSMT', 'MSD', 'SNRD', 'DKRD', 'RRD', 'CTGN', 'SVE', 'VDLR', 'GTBN', 'CHF', 
    'CLA', 'TKNG', 'CMBR', 'GV', 'MNKD', 'VSH', 'SNCR', 'JNJ', 'NEU', 'SWDV', 
    'BEPR', 'KHAG', 'MANR', 'KNDS', 'PNVL'
  ],
  harbour_andheri_branch: [
    'VDLR', 'GTBN', 'MM', 'BA', 'ADH'
  ],
  transharbour: [
    'TNA', 'DIGH', 'AIRL', 'RBL', 'GNSL', 'KOPK', 'TURB', 'SNCR', 'JNJ', 'NEU', 'SWDV', 'BEPR', 'PNVL'
  ],
  uran: [
    'NEU', 'BMDR', 'KKPR', 'NVSH', 'DRGI', 'URAN'
  ]
};

/**
 * Fast Corridors / Express Bypass Through-Tracks
 * High-speed quad/sextuple sections connecting major Mumbai suburban hubs.
 */
export const SUBURBAN_FAST_CORRIDORS = [
  { id: 'CLA-DR', fromCode: 'CLA', toCode: 'DR', line: 'central' as RegionalLine, distKm: 5.5, type: 'quad_fast_slow' as const },
  { id: 'GC-CLA', fromCode: 'GC', toCode: 'CLA', line: 'central' as RegionalLine, distKm: 4.0, type: 'quad_fast_slow' as const },
  { id: 'TNA-GC', fromCode: 'TNA', toCode: 'GC', line: 'central' as RegionalLine, distKm: 14.3, type: 'quad_fast_slow' as const },
  { id: 'DI-TNA', fromCode: 'DI', toCode: 'TNA', line: 'central' as RegionalLine, distKm: 14.6, type: 'quad_fast_slow' as const },
  { id: 'KYN-DI', fromCode: 'KYN', toCode: 'DI', line: 'central' as RegionalLine, distKm: 5.3, type: 'quad_fast_slow' as const },
  { id: 'DR-BY', fromCode: 'DR', toCode: 'BY', line: 'central' as RegionalLine, distKm: 4.2, type: 'quad_fast_slow' as const },
  { id: 'BY-CSMT', fromCode: 'BY', toCode: 'CSMT', line: 'central' as RegionalLine, distKm: 4.8, type: 'quad_fast_slow' as const },
  { id: 'BA-DDR', fromCode: 'BA', toCode: 'DDR', line: 'western' as RegionalLine, distKm: 4.9, type: 'quad_fast_slow' as const },
  { id: 'ADH-BA', fromCode: 'ADH', toCode: 'BA', line: 'western' as RegionalLine, distKm: 6.7, type: 'quad_fast_slow' as const },
  { id: 'BVI-ADH', fromCode: 'BVI', toCode: 'ADH', line: 'western' as RegionalLine, distKm: 12.4, type: 'quad_fast_slow' as const },
  { id: 'VR-BVI', fromCode: 'VR', toCode: 'BVI', line: 'western' as RegionalLine, distKm: 25.8, type: 'quad_fast_slow' as const },
  { id: 'DDR-DR', fromCode: 'DDR', toCode: 'DR', line: 'central' as RegionalLine, distKm: 0.3, type: 'single_branch' as const }, // Dadar FOB Interchange
  { id: 'VDLR-CLA', fromCode: 'VDLR', toCode: 'CLA', line: 'harbour' as RegionalLine, distKm: 6.0, type: 'quad_fast_slow' as const },
  { id: 'VSH-PNVL', fromCode: 'VSH', toCode: 'PNVL', line: 'harbour' as RegionalLine, distKm: 20.4, type: 'quad_fast_slow' as const }
];

/**
 * Pan-India National Rail Trunk Corridors
 */
export const PAN_INDIA_CORRIDORS = [
  // Western High-Speed Trunk (Mumbai - Delhi via Kota)
  { id: 'MMCT-ST', fromCode: 'MMCT', toCode: 'ST', line: 'national' as RegionalLine, distKm: 263, type: 'trunk_double' as const },
  { id: 'ST-BRC', fromCode: 'ST', toCode: 'BRC', line: 'national' as RegionalLine, distKm: 129, type: 'trunk_double' as const },
  { id: 'BRC-RTM', fromCode: 'BRC', toCode: 'RTM', line: 'national' as RegionalLine, distKm: 261, type: 'trunk_double' as const },
  { id: 'RTM-KOTA', fromCode: 'RTM', toCode: 'KOTA', line: 'national' as RegionalLine, distKm: 267, type: 'trunk_double' as const },
  { id: 'KOTA-NDLS', fromCode: 'KOTA', toCode: 'NDLS', line: 'national' as RegionalLine, distKm: 466, type: 'trunk_double' as const },
  { id: 'BRC-ADI', fromCode: 'BRC', toCode: 'ADI', line: 'national' as RegionalLine, distKm: 100, type: 'trunk_double' as const },

  // Northern & Eastern Trunk (Delhi - Kolkata via Prayagraj)
  { id: 'NDLS-CNB', fromCode: 'NDLS', toCode: 'CNB', line: 'national' as RegionalLine, distKm: 440, type: 'trunk_double' as const },
  { id: 'CNB-PRYJ', fromCode: 'CNB', toCode: 'PRYJ', line: 'national' as RegionalLine, distKm: 195, type: 'trunk_double' as const },
  { id: 'PRYJ-BSB', fromCode: 'PRYJ', toCode: 'BSB', line: 'national' as RegionalLine, distKm: 124, type: 'trunk_double' as const },
  { id: 'PRYJ-GAYA', fromCode: 'PRYJ', toCode: 'GAYA', line: 'national' as RegionalLine, distKm: 350, type: 'trunk_double' as const },
  { id: 'GAYA-ASN', fromCode: 'GAYA', toCode: 'ASN', line: 'national' as RegionalLine, distKm: 259, type: 'trunk_double' as const },
  { id: 'ASN-HWH', fromCode: 'ASN', toCode: 'HWH', line: 'national' as RegionalLine, distKm: 200, type: 'trunk_double' as const },
  { id: 'DDU-PNBE', fromCode: 'DDU', toCode: 'PNBE', line: 'national' as RegionalLine, distKm: 212, type: 'trunk_double' as const },

  // Grand Trunk North-South (Delhi - Chennai)
  { id: 'NDLS-AGC', fromCode: 'NDLS', toCode: 'AGC', line: 'national' as RegionalLine, distKm: 195, type: 'trunk_double' as const },
  { id: 'AGC-GWL', fromCode: 'AGC', toCode: 'GWL', line: 'national' as RegionalLine, distKm: 118, type: 'trunk_double' as const },
  { id: 'GWL-VGLJ', fromCode: 'GWL', toCode: 'VGLJ', line: 'national' as RegionalLine, distKm: 98, type: 'trunk_double' as const },
  { id: 'VGLJ-BPL', fromCode: 'VGLJ', toCode: 'BPL', line: 'national' as RegionalLine, distKm: 292, type: 'trunk_double' as const },
  { id: 'GWL-BPL', fromCode: 'GWL', toCode: 'BPL', line: 'national' as RegionalLine, distKm: 390, type: 'trunk_double' as const },
  { id: 'BPL-ET', fromCode: 'BPL', toCode: 'ET', line: 'national' as RegionalLine, distKm: 92, type: 'trunk_double' as const },
  { id: 'ET-NGP', fromCode: 'ET', toCode: 'NGP', line: 'national' as RegionalLine, distKm: 298, type: 'trunk_double' as const },
  { id: 'NGP-BZA', fromCode: 'NGP', toCode: 'BZA', line: 'national' as RegionalLine, distKm: 662, type: 'trunk_double' as const },
  { id: 'BZA-MAS', fromCode: 'BZA', toCode: 'MAS', line: 'national' as RegionalLine, distKm: 431, type: 'trunk_double' as const },

  // Southern Trunk (Bengaluru - Hyderabad / Chennai / Kerala)
  { id: 'SBC-SC', fromCode: 'SBC', toCode: 'SC', line: 'national' as RegionalLine, distKm: 622, type: 'trunk_double' as const },
  { id: 'SC-NGP', fromCode: 'SC', toCode: 'NGP', line: 'national' as RegionalLine, distKm: 581, type: 'trunk_double' as const },
  { id: 'SBC-MAS', fromCode: 'SBC', toCode: 'MAS', line: 'national' as RegionalLine, distKm: 362, type: 'trunk_double' as const },
  { id: 'SBC-CBE', fromCode: 'SBC', toCode: 'CBE', line: 'national' as RegionalLine, distKm: 419, type: 'trunk_double' as const },
  { id: 'CBE-ERS', fromCode: 'CBE', toCode: 'ERS', line: 'national' as RegionalLine, distKm: 228, type: 'trunk_double' as const },
  { id: 'ERS-TVC', fromCode: 'ERS', toCode: 'TVC', line: 'national' as RegionalLine, distKm: 206, type: 'trunk_double' as const },

  // Konkan Railway & Western Ghats
  { id: 'CSMT-PNVL', fromCode: 'CSMT', toCode: 'PNVL', line: 'national' as RegionalLine, distKm: 49, type: 'trunk_double' as const },
  { id: 'PNVL-MAO', fromCode: 'PNVL', toCode: 'MAO', line: 'national' as RegionalLine, distKm: 704, type: 'single_branch' as const },
  { id: 'MAO-ERS', fromCode: 'MAO', toCode: 'ERS', line: 'national' as RegionalLine, distKm: 720, type: 'single_branch' as const },
  { id: 'KYN-PUNE', fromCode: 'KYN', toCode: 'PUNE', line: 'national' as RegionalLine, distKm: 138, type: 'trunk_double' as const },

  // Eastern Coast & Central-East (Howrah - Chennai / Mumbai)
  { id: 'HWH-BBS', fromCode: 'HWH', toCode: 'BBS', line: 'national' as RegionalLine, distKm: 437, type: 'trunk_double' as const },
  { id: 'BBS-PURI', fromCode: 'BBS', toCode: 'PURI', line: 'national' as RegionalLine, distKm: 63, type: 'single_branch' as const },
  { id: 'BBS-BZA', fromCode: 'BBS', toCode: 'BZA', line: 'national' as RegionalLine, distKm: 787, type: 'trunk_double' as const },
  { id: 'NGP-R', fromCode: 'NGP', toCode: 'R', line: 'national' as RegionalLine, distKm: 281, type: 'trunk_double' as const },
  { id: 'R-BSP', fromCode: 'R', toCode: 'BSP', line: 'national' as RegionalLine, distKm: 111, type: 'trunk_double' as const },
  { id: 'BSP-TATA', fromCode: 'BSP', toCode: 'TATA', line: 'national' as RegionalLine, distKm: 468, type: 'trunk_double' as const },
  { id: 'TATA-HWH', fromCode: 'TATA', toCode: 'HWH', line: 'national' as RegionalLine, distKm: 249, type: 'trunk_double' as const }
];

export interface TrackDisruptionRule {
  segmentKey: string; // fromCode-toCode (or bidirectional)
  baseDisruptionReason: string;
  defaultDelayRange: [number, number]; // min and max delay mins
  congestionLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export const KNOWN_DISRUPTION_RULES: Record<string, TrackDisruptionRule> = {
  // Suburban Critical Bottlenecks
  'CLA-DR': {
    segmentKey: 'CLA-DR',
    baseDisruptionReason: 'Signal point interlocking failure at Vidyavihar fast lines (Up & Down Fast tracks held)',
    defaultDelayRange: [18, 26],
    congestionLevel: 'CRITICAL'
  },
  'GC-CLA': {
    segmentKey: 'GC-CLA',
    baseDisruptionReason: 'Signal approach bunching outside Kurla junction',
    defaultDelayRange: [15, 22],
    congestionLevel: 'CRITICAL'
  },
  'KYN-DI': {
    segmentKey: 'KYN-DI',
    baseDisruptionReason: 'Electric loco shed rake shunting clearance delay',
    defaultDelayRange: [12, 18],
    congestionLevel: 'HIGH'
  },
  'TNA-MLND': {
    segmentKey: 'TNA-MLND',
    baseDisruptionReason: 'Caution order on slow corridor due to platform screen buffer checks',
    defaultDelayRange: [3, 6],
    congestionLevel: 'LOW'
  },
  'VDLR-CLA': {
    segmentKey: 'VDLR-CLA',
    baseDisruptionReason: 'Monsoon ballast packing speed restriction (30 km/h caution order)',
    defaultDelayRange: [5, 8],
    congestionLevel: 'MODERATE'
  },
  'BA-DDR': {
    segmentKey: 'BA-DDR',
    baseDisruptionReason: 'Curvature speed restriction and Mahim chord crossing delay',
    defaultDelayRange: [4, 7],
    congestionLevel: 'MODERATE'
  },
  'VR-BVI': {
    segmentKey: 'VR-BVI',
    baseDisruptionReason: 'Clear four-track automatic signaling with normal headway',
    defaultDelayRange: [1, 4],
    congestionLevel: 'LOW'
  },
  'BVI-ADH': {
    segmentKey: 'BVI-ADH',
    baseDisruptionReason: 'Borivali yard departure interlocking and suburban headway regulation',
    defaultDelayRange: [8, 14],
    congestionLevel: 'MODERATE'
  },
  'ADH-BA': {
    segmentKey: 'ADH-BA',
    baseDisruptionReason: 'Bandra Terminus empty rake crossover movement caution order',
    defaultDelayRange: [7, 12],
    congestionLevel: 'MODERATE'
  },
  'CSMT-BY': {
    segmentKey: 'CSMT-BY',
    baseDisruptionReason: 'Sandhurst heritage elevated viaduct structural inspection speed order (20 km/h)',
    defaultDelayRange: [6, 11],
    congestionLevel: 'MODERATE'
  },
  'TNA-DIGH': {
    segmentKey: 'TNA-DIGH',
    baseDisruptionReason: 'Trans-Harbour newly commissioned line block section clearance',
    defaultDelayRange: [2, 5],
    congestionLevel: 'LOW'
  },
  'TURB-SNCR': {
    segmentKey: 'TURB-SNCR',
    baseDisruptionReason: 'Turbhe APMC goods siding container rake shunting delay',
    defaultDelayRange: [5, 9],
    congestionLevel: 'MODERATE'
  },
  'NEU-BMDR': {
    segmentKey: 'NEU-BMDR',
    baseDisruptionReason: 'Uran line port container train clearance caution order',
    defaultDelayRange: [4, 8],
    congestionLevel: 'LOW'
  },

  // National Trunk Disruption Rules
  'NDLS-CNB': {
    segmentKey: 'NDLS-CNB',
    baseDisruptionReason: 'Dense morning fog and low visibility in Indo-Gangetic plains (Speed capped at 60 km/h)',
    defaultDelayRange: [40, 65],
    congestionLevel: 'CRITICAL'
  },
  'AGC-GWL': {
    segmentKey: 'AGC-GWL',
    baseDisruptionReason: 'Overhead Equipment (OHE) voltage fluctuation and freight train precedence',
    defaultDelayRange: [20, 35],
    congestionLevel: 'HIGH'
  },
  'BPL-ET': {
    segmentKey: 'BPL-ET',
    baseDisruptionReason: 'Itarsi yard remodeling and third-line track linking mega-block',
    defaultDelayRange: [25, 45],
    congestionLevel: 'HIGH'
  },
  'PRYJ-BSB': {
    segmentKey: 'PRYJ-BSB',
    baseDisruptionReason: 'Pilgrim rush traffic control and platform holding at Varanasi junction',
    defaultDelayRange: [15, 30],
    congestionLevel: 'MODERATE'
  },
  'MMCT-ST': {
    segmentKey: 'MMCT-ST',
    baseDisruptionReason: 'Western high-speed corridor automated signaling running with optimal headway',
    defaultDelayRange: [2, 6],
    congestionLevel: 'LOW'
  },
  'ST-BRC': {
    segmentKey: 'ST-BRC',
    baseDisruptionReason: 'Continuous automatic block section running punctual',
    defaultDelayRange: [0, 5],
    congestionLevel: 'LOW'
  },
  'PNVL-MAO': {
    segmentKey: 'PNVL-MAO',
    baseDisruptionReason: 'Konkan railway single-line crossing wait and monsoon tunnel speed order',
    defaultDelayRange: [50, 75],
    congestionLevel: 'CRITICAL'
  },
  'KYN-PUNE': {
    segmentKey: 'KYN-PUNE',
    baseDisruptionReason: 'Bhor Ghat banker locomotive attachment & brake-testing safety stops',
    defaultDelayRange: [10, 18],
    congestionLevel: 'MODERATE'
  },
  'HWH-ASN': {
    segmentKey: 'HWH-ASN',
    baseDisruptionReason: 'Freight coal corridor clearance & suburban EMU line sharing',
    defaultDelayRange: [15, 28],
    congestionLevel: 'MODERATE'
  },
  'NGP-BZA': {
    segmentKey: 'NGP-BZA',
    baseDisruptionReason: 'Grand Trunk heavy freight movement and signaling upgrade testing',
    defaultDelayRange: [18, 32],
    congestionLevel: 'MODERATE'
  },
  'CNB-PRYJ': {
    segmentKey: 'CNB-PRYJ',
    baseDisruptionReason: 'Prayagraj junction approach route holding and platform queue congestion',
    defaultDelayRange: [18, 32],
    congestionLevel: 'HIGH'
  },
  'GAYA-PRYJ': {
    segmentKey: 'GAYA-PRYJ',
    baseDisruptionReason: 'Grand Chord freight rake precedence and OHE catenary wire tension testing',
    defaultDelayRange: [22, 38],
    congestionLevel: 'HIGH'
  },
  'HWH-BBS': {
    segmentKey: 'HWH-BBS',
    baseDisruptionReason: 'Kharagpur division interlocking maintenance block and suburban EMU line sharing',
    defaultDelayRange: [20, 36],
    congestionLevel: 'HIGH'
  },
  'BZA-MAS': {
    segmentKey: 'BZA-MAS',
    baseDisruptionReason: 'Gudur-Chennai suburban quadrupling caution order and speed restrictions',
    defaultDelayRange: [12, 24],
    congestionLevel: 'MODERATE'
  },
  'SBC-SC': {
    segmentKey: 'SBC-SC',
    baseDisruptionReason: 'Dharmavaram single-line crossing wait and freight rake regulation',
    defaultDelayRange: [24, 40],
    congestionLevel: 'HIGH'
  }
};

export const MUMBAI_METRO_NODES: MapStationNode[] = Object.values(METRO_STATIONS).map(ms => ({
  id: ms.id,
  code: ms.code,
  name: ms.name,
  hindiName: ms.hindiName,
  marathiName: ms.marathiName,
  line: 'metro' as RegionalLine,
  city: 'Mumbai',
  x: ms.x,
  y: ms.y,
  z: 12,
  platforms: [1, 2],
  isInterchange: ms.isInterchange,
  isMajorHub: ms.isInterchange,
  passingTrainCount: 30
}));

export const METRO_CORRIDORS = [
  // Line 1 Versova - Ghatkopar
  { id: 'METRO_VER-METRO_DNN', fromCode: 'METRO_VER', toCode: 'METRO_DNN', line: 'metro' as RegionalLine, distKm: 1.2, type: 'twin_through' as const },
  { id: 'METRO_DNN-METRO_AZD', fromCode: 'METRO_DNN', toCode: 'METRO_AZD', line: 'metro' as RegionalLine, distKm: 1.0, type: 'twin_through' as const },
  { id: 'METRO_AZD-METRO_ADH', fromCode: 'METRO_AZD', toCode: 'METRO_ADH', line: 'metro' as RegionalLine, distKm: 1.1, type: 'twin_through' as const },
  { id: 'METRO_ADH-METRO_WEH', fromCode: 'METRO_ADH', toCode: 'METRO_WEH', line: 'metro' as RegionalLine, distKm: 1.2, type: 'twin_through' as const },
  { id: 'METRO_WEH-METRO_CKL', fromCode: 'METRO_WEH', toCode: 'METRO_CKL', line: 'metro' as RegionalLine, distKm: 1.3, type: 'twin_through' as const },
  { id: 'METRO_CKL-METRO_AIR', fromCode: 'METRO_CKL', toCode: 'METRO_AIR', line: 'metro' as RegionalLine, distKm: 1.0, type: 'twin_through' as const },
  { id: 'METRO_AIR-METRO_MRL', fromCode: 'METRO_AIR', toCode: 'METRO_MRL', line: 'metro' as RegionalLine, distKm: 0.9, type: 'twin_through' as const },
  { id: 'METRO_MRL-METRO_SKN', fromCode: 'METRO_MRL', toCode: 'METRO_SKN', line: 'metro' as RegionalLine, distKm: 1.2, type: 'twin_through' as const },
  { id: 'METRO_SKN-METRO_ASL', fromCode: 'METRO_SKN', toCode: 'METRO_ASL', line: 'metro' as RegionalLine, distKm: 1.1, type: 'twin_through' as const },
  { id: 'METRO_ASL-METRO_JGT', fromCode: 'METRO_ASL', toCode: 'METRO_JGT', line: 'metro' as RegionalLine, distKm: 0.8, type: 'twin_through' as const },
  { id: 'METRO_JGT-METRO_GHT', fromCode: 'METRO_JGT', toCode: 'METRO_GHT', line: 'metro' as RegionalLine, distKm: 0.6, type: 'twin_through' as const },

  // Line 7 Red Line
  { id: 'METRO_DHE-METRO_NPK', fromCode: 'METRO_DHE', toCode: 'METRO_NPK', line: 'metro' as RegionalLine, distKm: 2.8, type: 'twin_through' as const },
  { id: 'METRO_NPK-METRO_AKR', fromCode: 'METRO_NPK', toCode: 'METRO_AKR', line: 'metro' as RegionalLine, distKm: 2.5, type: 'twin_through' as const },
  { id: 'METRO_AKR-METRO_DND', fromCode: 'METRO_AKR', toCode: 'METRO_DND', line: 'metro' as RegionalLine, distKm: 3.2, type: 'twin_through' as const },
  { id: 'METRO_DND-METRO_ARY', fromCode: 'METRO_DND', toCode: 'METRO_ARY', line: 'metro' as RegionalLine, distKm: 2.1, type: 'twin_through' as const },
  { id: 'METRO_ARY-METRO_GDV', fromCode: 'METRO_ARY', toCode: 'METRO_GDV', line: 'metro' as RegionalLine, distKm: 4.5, type: 'twin_through' as const },

  // Line 3 Aqua Line
  { id: 'METRO_ARY_3-METRO_SPZ', fromCode: 'METRO_ARY_3', toCode: 'METRO_SPZ', line: 'metro' as RegionalLine, distKm: 1.6, type: 'twin_through' as const },
  { id: 'METRO_SPZ-METRO_MRL', fromCode: 'METRO_SPZ', toCode: 'METRO_MRL', line: 'metro' as RegionalLine, distKm: 2.1, type: 'twin_through' as const },
  { id: 'METRO_MRL-METRO_CSMIA2', fromCode: 'METRO_MRL', toCode: 'METRO_CSMIA2', line: 'metro' as RegionalLine, distKm: 1.8, type: 'twin_through' as const },
  { id: 'METRO_CSMIA2-METRO_BKC', fromCode: 'METRO_CSMIA2', toCode: 'METRO_BKC', line: 'metro' as RegionalLine, distKm: 5.2, type: 'twin_through' as const },

  // Interchanges with Suburban lines
  { id: 'METRO_ADH-ADH', fromCode: 'METRO_ADH', toCode: 'ADH', line: 'metro' as RegionalLine, distKm: 0.2, type: 'single_branch' as const },
  { id: 'METRO_GHT-GC', fromCode: 'METRO_GHT', toCode: 'GC', line: 'metro' as RegionalLine, distKm: 0.15, type: 'single_branch' as const },
  { id: 'METRO_WEH-METRO_GDV', fromCode: 'METRO_WEH', toCode: 'METRO_GDV', line: 'metro' as RegionalLine, distKm: 0.2, type: 'single_branch' as const }
];

