import { MapStationNode, MapTrackSegment, RegionalLine } from '../types/railway';

/**
 * High-Integrity Station Geometry & Topology for Mumbai Suburban and Pan-India Networks
 * Normalized coordinates for SVG 2D layout and 3D Isometric Projection
 */

export const MUMBAI_SUBURBAN_NODES: MapStationNode[] = [
  // Western Line (x: 200 to 240, y: 70 to 860)
  { id: 'CCG', code: 'CCG', name: 'Churchgate', hindiName: 'चर्चगेट', marathiName: 'चर्चगेट', line: 'western', city: 'Mumbai', x: 210, y: 850, z: 10, platforms: [1, 2, 3, 4], isMajorHub: true },
  { id: 'MEL', code: 'MEL', name: 'Marine Lines', hindiName: 'मरीन लाइन्स', marathiName: 'मरीन लाइन्स', line: 'western', city: 'Mumbai', x: 210, y: 800, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'MMCT', code: 'MMCT', name: 'Mumbai Central', hindiName: 'मुंबई सेंट्रल', marathiName: 'मुंबई सेंट्रल', line: 'western', city: 'Mumbai', x: 210, y: 730, z: 10, platforms: [1, 2, 3, 4, 5], isInterchange: true, isMajorHub: true },
  { id: 'DDR', code: 'DDR', name: 'Dadar (Western)', hindiName: 'दादर (पश्चिम)', marathiName: 'दादर (पश्चिम)', line: 'western', city: 'Mumbai', x: 220, y: 620, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7], isInterchange: true, isMajorHub: true },
  { id: 'BA', code: 'BA', name: 'Bandra', hindiName: 'बांद्रा', marathiName: 'वांद्रे', line: 'western', city: 'Mumbai', x: 215, y: 520, z: 10, platforms: [1, 2, 3, 4, 5, 6, 7], isInterchange: true, isMajorHub: true },
  { id: 'ADH', code: 'ADH', name: 'Andheri', hindiName: 'अंधेरी', marathiName: 'अंधेरी', line: 'western', city: 'Mumbai', x: 210, y: 410, z: 10, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9], isInterchange: true, isMajorHub: true },
  { id: 'BVI', code: 'BVI', name: 'Borivali', hindiName: 'बोरिवली', marathiName: 'बोरिवली', line: 'western', city: 'Mumbai', x: 205, y: 270, z: 10, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isInterchange: true, isMajorHub: true },
  { id: 'VR', code: 'VR', name: 'Virar', hindiName: 'विरार', marathiName: 'विरार', line: 'western', city: 'Virar', x: 200, y: 120, z: 10, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isMajorHub: true },
  { id: 'DRD', code: 'DRD', name: 'Dahanu Road', hindiName: 'दहाणू रोड', marathiName: 'डहाणू रोड', line: 'western', city: 'Palghar', x: 195, y: 40, z: 10, platforms: [1, 2, 3], isMajorHub: true },

  // Central Main Line (x: 320 to 520, y: 40 to 850)
  { id: 'CSMT', code: 'CSMT', name: 'CSMT Terminus', hindiName: 'छत्रपति शिवाजी महाराज टर्मिनस', marathiName: 'छत्रपती शिवाजी महाराज टर्मिनस', line: 'central', city: 'Mumbai', x: 300, y: 850, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], isInterchange: true, isMajorHub: true },
  { id: 'BY', code: 'BY', name: 'Byculla', hindiName: 'भायखला', marathiName: 'भायखळा', line: 'central', city: 'Mumbai', x: 295, y: 740, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'DR', code: 'DR', name: 'Dadar (Central)', hindiName: 'दादर (मध्य)', marathiName: 'दादर (मध्य)', line: 'central', city: 'Mumbai', x: 290, y: 620, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isInterchange: true, isMajorHub: true },
  { id: 'CLA', code: 'CLA', name: 'Kurla', hindiName: 'कुर्ला', marathiName: 'कुर्ला', line: 'central', city: 'Mumbai', x: 310, y: 510, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isInterchange: true, isMajorHub: true },
  { id: 'GC', code: 'GC', name: 'Ghatkopar', hindiName: 'घाटकोपर', marathiName: 'घाटकोपर', line: 'central', city: 'Mumbai', x: 325, y: 430, z: 10, platforms: [1, 2, 3, 4], isInterchange: true, isMajorHub: true },
  { id: 'VK', code: 'VK', name: 'Vikhroli', hindiName: 'विक्रोली', marathiName: 'विक्रोळी', line: 'central', city: 'Mumbai', x: 340, y: 370, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'BND', code: 'BND', name: 'Bhandup', hindiName: 'भांडुप', marathiName: 'भांडुप', line: 'central', city: 'Mumbai', x: 350, y: 320, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'MLND', code: 'MLND', name: 'Mulund', hindiName: 'मुलुंड', marathiName: 'मुलुंड', line: 'central', city: 'Mumbai', x: 365, y: 270, z: 10, platforms: [1, 2, 3, 4] },
  { id: 'TNA', code: 'TNA', name: 'Thane', hindiName: 'ठाणे', marathiName: 'ठाणे', line: 'central', city: 'Thane', x: 385, y: 220, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isInterchange: true, isMajorHub: true },
  { id: 'DI', code: 'DI', name: 'Dombivli', hindiName: 'डोंबिवली', marathiName: 'डोंबिवली', line: 'central', city: 'Dombivli', x: 440, y: 170, z: 10, platforms: [1, 2, 3, 4, 5], isMajorHub: true },
  { id: 'KYN', code: 'KYN', name: 'Kalyan Jn', hindiName: 'कल्याण', marathiName: 'कल्याण', line: 'central', city: 'Kalyan', x: 480, y: 140, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isInterchange: true, isMajorHub: true },
  { id: 'KSRA', code: 'KSRA', name: 'Kasara (NE)', hindiName: 'कसारा', marathiName: 'कसारा', line: 'central', city: 'Kasara', x: 530, y: 40, z: 25, platforms: [1, 2, 3, 4], isMajorHub: true },
  { id: 'KJT', code: 'KJT', name: 'Karjat (SE)', hindiName: 'कर्जत', marathiName: 'कर्जत', line: 'central', city: 'Karjat', x: 550, y: 240, z: 20, platforms: [1, 2, 3], isMajorHub: true },

  // Harbour Line (CSMT -> Vadala -> Kurla -> Vashi -> Panvel)
  { id: 'VDLR', code: 'VDLR', name: 'Vadala Road', hindiName: 'वडाला रोड', marathiName: 'वडाळा रोड', line: 'harbour', city: 'Mumbai', x: 320, y: 640, z: 10, platforms: [1, 2, 3, 4], isInterchange: true },
  { id: 'VSH', code: 'VSH', name: 'Vashi', hindiName: 'वाशी', marathiName: 'वाशी', line: 'harbour', city: 'Navi Mumbai', x: 460, y: 490, z: 10, platforms: [1, 2, 3, 4], isInterchange: true, isMajorHub: true },
  { id: 'BEPR', code: 'BEPR', name: 'Belapur CBD', hindiName: 'बेलापुर', marathiName: 'बेलापूर', line: 'harbour', city: 'Navi Mumbai', x: 510, y: 460, z: 10, platforms: [1, 2, 3, 4], isMajorHub: true },
  { id: 'PNVL', code: 'PNVL', name: 'Panvel Jn', hindiName: 'पनवेल', marathiName: 'पनवेल', line: 'harbour', city: 'Navi Mumbai', x: 560, y: 430, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7], isInterchange: true, isMajorHub: true }
];

export const PAN_INDIA_NODES: MapStationNode[] = [
  // Northern Region
  { id: 'NDLS', code: 'NDLS', name: 'New Delhi', hindiName: 'नई दिल्ली', line: 'national', zone: 'NR', city: 'Delhi', x: 420, y: 220, z: 20, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], isInterchange: true, isMajorHub: true },
  { id: 'ASR', code: 'ASR', name: 'Amritsar Jn', hindiName: 'अमृतसर', line: 'national', zone: 'NR', city: 'Amritsar', x: 330, y: 140, z: 15, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },
  { id: 'CDG', code: 'CDG', name: 'Chandigarh', hindiName: 'चंडीगढ़', line: 'national', zone: 'NR', city: 'Chandigarh', x: 380, y: 160, z: 15, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },
  { id: 'AGC', code: 'AGC', name: 'Agra Cantt', hindiName: 'आगरा कैंट', line: 'national', zone: 'NCR', city: 'Agra', x: 440, y: 290, z: 10, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },
  { id: 'GWL', code: 'GWL', name: 'Gwalior Jn', hindiName: 'ग्वालियर', line: 'national', zone: 'NCR', city: 'Gwalior', x: 450, y: 340, z: 10, platforms: [1, 2, 3, 4, 5] },
  { id: 'CNB', code: 'CNB', name: 'Kanpur Central', hindiName: 'कानपुर सेंट्रल', line: 'national', zone: 'NCR', city: 'Kanpur', x: 550, y: 310, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isMajorHub: true },
  { id: 'LKO', code: 'LKO', name: 'Lucknow Charbagh', hindiName: 'लखनऊ', line: 'national', zone: 'NR', city: 'Lucknow', x: 570, y: 280, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9], isMajorHub: true },
  { id: 'PRYJ', code: 'PRYJ', name: 'Prayagraj Jn', hindiName: 'प्रयागराज', line: 'national', zone: 'NCR', city: 'Prayagraj', x: 610, y: 350, z: 10, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isMajorHub: true },
  { id: 'BSB', code: 'BSB', name: 'Varanasi Jn', hindiName: 'वाराणसी', line: 'national', zone: 'NR', city: 'Varanasi', x: 660, y: 340, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9], isMajorHub: true },

  // Western Region
  { id: 'JP', code: 'JP', name: 'Jaipur Jn', hindiName: 'जयपुर', line: 'national', zone: 'NWR', city: 'Jaipur', x: 350, y: 290, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isMajorHub: true },
  { id: 'KOTA', code: 'KOTA', name: 'Kota Jn', hindiName: 'कोटा', line: 'national', zone: 'WCR', city: 'Kota', x: 380, y: 370, z: 10, platforms: [1, 2, 3, 4, 5], isMajorHub: true },
  { id: 'RTM', code: 'RTM', name: 'Ratlam Jn', hindiName: 'रतलाम', line: 'national', zone: 'WR', city: 'Ratlam', x: 340, y: 440, z: 10, platforms: [1, 2, 3, 4, 5, 6, 7], isMajorHub: true },
  { id: 'ADI', code: 'ADI', name: 'Ahmedabad Jn', hindiName: 'अहमदाबाद', line: 'national', zone: 'WR', city: 'Ahmedabad', x: 260, y: 460, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], isMajorHub: true },
  { id: 'BRC', code: 'BRC', name: 'Vadodara Jn', hindiName: 'वडोदरा', line: 'national', zone: 'WR', city: 'Vadodara', x: 280, y: 500, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7], isMajorHub: true },
  { id: 'ST', code: 'ST', name: 'Surat', hindiName: 'सूरत', line: 'national', zone: 'WR', city: 'Surat', x: 270, y: 550, z: 10, platforms: [1, 2, 3, 4], isMajorHub: true },
  { id: 'MMCT_NAT', code: 'MMCT', name: 'Mumbai Central', hindiName: 'मुंबई सेंट्रल', line: 'national', zone: 'WR', city: 'Mumbai', x: 260, y: 640, z: 18, platforms: [1, 2, 3, 4, 5], isInterchange: true, isMajorHub: true },
  { id: 'CSMT_NAT', code: 'CSMT', name: 'Mumbai CSMT', hindiName: 'मुंबई सीएसएमटी', line: 'national', zone: 'CR', city: 'Mumbai', x: 275, y: 655, z: 18, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], isInterchange: true, isMajorHub: true },

  // Central Region
  { id: 'BPL', code: 'BPL', name: 'Bhopal Jn', hindiName: 'भोपाल', line: 'national', zone: 'WCR', city: 'Bhopal', x: 440, y: 440, z: 15, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },
  { id: 'ET', code: 'ET', name: 'Itarsi Jn', hindiName: 'इटारसी', line: 'national', zone: 'WCR', city: 'Itarsi', x: 450, y: 480, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7], isInterchange: true, isMajorHub: true },
  { id: 'NGP', code: 'NGP', name: 'Nagpur Jn', hindiName: 'नागपुर', line: 'national', zone: 'CR', city: 'Nagpur', x: 480, y: 540, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7, 8], isInterchange: true, isMajorHub: true },
  { id: 'JBP', code: 'JBP', name: 'Jabalpur Jn', hindiName: 'जबलपुर', line: 'national', zone: 'WCR', city: 'Jabalpur', x: 530, y: 430, z: 10, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },

  // Eastern Region
  { id: 'PNBE', code: 'PNBE', name: 'Patna Jn', hindiName: 'पटना', line: 'national', zone: 'ECR', city: 'Patna', x: 710, y: 320, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isMajorHub: true },
  { id: 'GAYA', code: 'GAYA', name: 'Gaya Jn', hindiName: 'गया', line: 'national', zone: 'ECR', city: 'Gaya', x: 710, y: 360, z: 10, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { id: 'ASN', code: 'ASN', name: 'Asansol Jn', hindiName: 'आसनसोल', line: 'national', zone: 'ER', city: 'Asansol', x: 770, y: 390, z: 10, platforms: [1, 2, 3, 4, 5, 6, 7], isMajorHub: true },
  { id: 'HWH', code: 'HWH', name: 'Howrah Jn (Kolkata)', hindiName: 'हावड़ा', line: 'national', zone: 'ER', city: 'Kolkata', x: 810, y: 430, z: 18, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], isMajorHub: true },
  { id: 'BBS', code: 'BBS', name: 'Bhubaneswar', hindiName: 'भुवनेश्वर', line: 'national', zone: 'ECoR', city: 'Bhubaneswar', x: 730, y: 520, z: 10, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },
  { id: 'GHY', code: 'GHY', name: 'Guwahati', hindiName: 'गुवाहाटी', line: 'national', zone: 'NFR', city: 'Guwahati', x: 880, y: 260, z: 10, platforms: [1, 2, 3, 4, 5, 6, 7], isMajorHub: true },

  // Southern Region
  { id: 'PUNE_NAT', code: 'PUNE', name: 'Pune Jn', hindiName: 'पुणे', line: 'national', zone: 'CR', city: 'Pune', x: 310, y: 680, z: 15, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true },
  { id: 'SC', code: 'SC', name: 'Secunderabad / Hyderabad', hindiName: 'सिकंदराबाद', line: 'national', zone: 'SCR', city: 'Hyderabad', x: 470, y: 670, z: 15, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isMajorHub: true },
  { id: 'BZA', code: 'BZA', name: 'Vijayawada Jn', hindiName: 'विजयवाड़ा', line: 'national', zone: 'SCR', city: 'Vijayawada', x: 550, y: 690, z: 12, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isInterchange: true, isMajorHub: true },
  { id: 'MAO_NAT', code: 'MAO', name: 'Madgaon Jn (Goa)', hindiName: 'मडगांव (गोवा)', line: 'national', zone: 'KR', city: 'Goa', x: 290, y: 770, z: 10, platforms: [1, 2, 3, 4], isMajorHub: true },
  { id: 'SBC', code: 'SBC', name: 'KSR Bengaluru', hindiName: 'बेंगलुरु', line: 'national', zone: 'SWR', city: 'Bengaluru', x: 420, y: 810, z: 16, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], isMajorHub: true },
  { id: 'MAS', code: 'MAS', name: 'Chennai Central', hindiName: 'चेन्नई सेंट्रल', line: 'national', zone: 'SR', city: 'Chennai', x: 520, y: 800, z: 16, platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], isMajorHub: true },
  { id: 'ERS', code: 'ERS', name: 'Ernakulam / Kochi', hindiName: 'एर्नाकुलम (कोच्चि)', line: 'national', zone: 'SR', city: 'Kochi', x: 390, y: 910, z: 10, platforms: [1, 2, 3, 4, 5, 6], isMajorHub: true }
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
  }
};
