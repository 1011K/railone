import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { router } from 'expo-router';
import { useMobileTheme } from '../src/theme/ThemeContext';
import {
  MUMBAI_SUBURBAN_NODES,
  SUBURBAN_CORRIDOR_CHAINS,
  METRO_CORRIDORS,
  PAN_INDIA_NODES,
  PAN_INDIA_CORRIDORS
} from '../src/fixtures/networkMapData';
import { METRO_STATIONS } from '../src/fixtures/metroData';
import { OfflineStorage } from '../src/storage/offlineStorage';
import Svg, { Line as SvgLine, Circle, G, Text as SvgText, Rect } from 'react-native-svg';

export type NetworkScope =
  | 'mumbai'
  | 'pan_india'
  | 'pune'
  | 'delhi'
  | 'bengaluru'
  | 'kolkata'
  | 'chennai'
  | 'hyderabad'
  | 'kochi'
  | 'ahmedabad';

type LineFilter = 'all' | 'western' | 'central' | 'harbour' | 'transharbour' | 'metro';
type MapViewMode = 'topological_svg' | 'schematic_list';

interface StationItem {
  id: string;
  code: string;
  name: string;
  hindiName?: string;
  marathiName?: string;
  line: 'western' | 'central' | 'harbour' | 'transharbour' | 'uran' | 'metro' | 'national';
  platforms: number[];
  x: number;
  y: number;
  isInterchange?: boolean;
  isMajorHub?: boolean;
  isFocusCity?: boolean;
  city?: string;
  currentDelayMinutes?: number;
  disruptionNote?: string;
}

const LINE_COLORS: Record<string, string> = {
  western: '#DC2626',      // Crimson Red
  central: '#1D4ED8',      // Deep Royal Blue
  harbour: '#059669',      // Emerald Green
  transharbour: '#D97706', // Transit Amber
  uran: '#7C3AED',         // Purple
  metro: '#0284C7',        // Sky / Cyan Blue
  national: '#E11D48'      // Vibrant Rose
};

const FOCUS_CITIES = [
  { id: 'mumbai', name: 'Mumbai', code: 'CSMT', state: 'Maharashtra', isFlagship: true },
  { id: 'pan_india', name: 'Pan-India', code: 'ALL', state: 'National Trunk', isFlagship: false },
  { id: 'pune', name: 'Pune', code: 'PUNE', state: 'Maharashtra', isFlagship: false },
  { id: 'delhi', name: 'Delhi NCR', code: 'NDLS', state: 'Delhi NCR', isFlagship: false },
  { id: 'bengaluru', name: 'Bengaluru', code: 'SBC', state: 'Karnataka', isFlagship: false },
  { id: 'kolkata', name: 'Kolkata', code: 'HWH', state: 'West Bengal', isFlagship: false },
  { id: 'chennai', name: 'Chennai', code: 'MAS', state: 'Tamil Nadu', isFlagship: false },
  { id: 'hyderabad', name: 'Hyderabad', code: 'SC', state: 'Telangana', isFlagship: false },
  { id: 'kochi', name: 'Kochi', code: 'ERS', state: 'Kerala', isFlagship: false },
  { id: 'ahmedabad', name: 'Ahmedabad–Gandhinagar', code: 'ADI', state: 'Gujarat', isFlagship: false }
];

// Regional City Network Data
const REGIONAL_CITY_NETWORKS: Record<string, { nodes: StationItem[]; chains: Array<[string, string]> }> = {
  // Representative schematic only. Links here mirror modeled city-pack edges,
  // not validated stop-level departure timetables or geographical walk routes.
  ahmedabad: {
    nodes: [
      { id: 'ADI', code: 'ADI', name: 'Ahmedabad Junction', line: 'national', platforms: [], x: 330, y: 630, city: 'Ahmedabad', isMajorHub: true },
      { id: 'GNC', code: 'GNC', name: 'Gandhinagar Capital', line: 'national', platforms: [], x: 570, y: 200, city: 'Gandhinagar', isMajorHub: true },
      { id: 'SBT', code: 'SBT', name: 'Sabarmati Junction', line: 'national', platforms: [], x: 360, y: 485, city: 'Ahmedabad' },
      { id: 'METRO_OLD_HIGH_COURT', code: 'METRO_OLD_HIGH_COURT', name: 'Old High Court Metro', line: 'metro', platforms: [], x: 220, y: 530, city: 'Ahmedabad', isInterchange: true },
      { id: 'METRO_MOTERA', code: 'METRO_MOTERA', name: 'Motera Metro', line: 'metro', platforms: [], x: 380, y: 365, city: 'Ahmedabad' },
      { id: 'METRO_GIFT_CITY', code: 'METRO_GIFT_CITY', name: 'GIFT City Metro', line: 'metro', platforms: [], x: 580, y: 275, city: 'Gandhinagar' }
    ],
    chains: [
      ['ADI', 'GNC'],
      ['METRO_OLD_HIGH_COURT', 'METRO_MOTERA'],
      ['METRO_MOTERA', 'METRO_GIFT_CITY']
    ]
  },
  pune: {
    nodes: [
      { id: 'PUNE_REG', code: 'PUNE', name: 'Pune Junction', hindiName: 'पुणे जंक्शन', line: 'central', platforms: [1, 2, 3, 4, 5, 6], x: 200, y: 550, isMajorHub: true, city: 'Pune' },
      { id: 'SVJR', code: 'SVJR', name: 'Shivaji Nagar', hindiName: 'शिवाजी नगर', line: 'central', platforms: [1, 2], x: 240, y: 500, city: 'Pune' },
      { id: 'KK', code: 'KK', name: 'Khadki', hindiName: 'खड़की', line: 'central', platforms: [1, 2], x: 280, y: 450, city: 'Pune' },
      { id: 'DAPD', code: 'DAPD', name: 'Dapodi', hindiName: 'दापोडी', line: 'central', platforms: [1, 2], x: 320, y: 400, city: 'Pune' },
      { id: 'KSWD', code: 'KSWD', name: 'Kasarwadi', hindiName: 'कासारवाडी', line: 'central', platforms: [1, 2], x: 360, y: 350, city: 'Pune' },
      { id: 'PMP', code: 'PMP', name: 'Pimpri', hindiName: 'पिंपरी', line: 'central', platforms: [1, 2, 3], x: 400, y: 300, isMajorHub: true, city: 'Pimpri-Chinchwad' },
      { id: 'CCH', code: 'CCH', name: 'Chinchwad', hindiName: 'चिंचवड', line: 'central', platforms: [1, 2, 3], x: 440, y: 250, city: 'Pimpri-Chinchwad' },
      { id: 'AKRD', code: 'AKRD', name: 'Akurdi', hindiName: 'आकुर्डी', line: 'central', platforms: [1, 2], x: 480, y: 210, city: 'Pimpri-Chinchwad' },
      { id: 'DEHR', code: 'DEHR', name: 'Dehu Road', hindiName: 'देहु रोड', line: 'central', platforms: [1, 2], x: 520, y: 170, city: 'Pune' },
      { id: 'TGN', code: 'TGN', name: 'Talegaon', hindiName: 'तलेगांव', line: 'central', platforms: [1, 2, 3], x: 580, y: 120, isMajorHub: true, city: 'Pune' },
      { id: 'LNL', code: 'LNL', name: 'Lonavala', hindiName: 'लोनावाला', line: 'central', platforms: [1, 2, 3], x: 650, y: 70, isMajorHub: true, city: 'Pune' }
    ],
    chains: [
      ['PUNE', 'SVJR'], ['SVJR', 'KK'], ['KK', 'DAPD'], ['DAPD', 'KSWD'],
      ['KSWD', 'PMP'], ['PMP', 'CCH'], ['CCH', 'AKRD'], ['AKRD', 'DEHR'],
      ['DEHR', 'TGN'], ['TGN', 'LNL']
    ]
  },
  delhi: {
    nodes: [
      { id: 'NDLS_REG', code: 'NDLS', name: 'New Delhi', hindiName: 'नई दिल्ली', line: 'national', platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], x: 400, y: 400, isMajorHub: true, isInterchange: true, city: 'Delhi' },
      { id: 'DLI', code: 'DLI', name: 'Old Delhi', hindiName: 'पुरानी दिल्ली', line: 'national', platforms: [1, 2, 3, 4, 5, 6, 7, 8], x: 420, y: 320, isMajorHub: true, city: 'Delhi' },
      { id: 'NZM', code: 'NZM', name: 'Hazrat Nizamuddin', hindiName: 'हज़रत निज़ामुद्दीन', line: 'national', platforms: [1, 2, 3, 4, 5, 6, 7, 8], x: 430, y: 500, isMajorHub: true, city: 'Delhi' },
      { id: 'ANVT', code: 'ANVT', name: 'Anand Vihar Terminal', hindiName: 'आनंद विहार', line: 'national', platforms: [1, 2, 3, 4, 5, 6, 7], x: 560, y: 410, isMajorHub: true, city: 'Delhi' },
      { id: 'GZB', code: 'GZB', name: 'Ghaziabad Jn', hindiName: 'गाजियाबाद', line: 'national', platforms: [1, 2, 3, 4, 5, 6], x: 670, y: 380, isMajorHub: true, city: 'Ghaziabad' },
      { id: 'FDB', code: 'FDB', name: 'Faridabad', hindiName: 'फरीदाबाद', line: 'national', platforms: [1, 2, 3, 4], x: 450, y: 620, city: 'Faridabad' },
      { id: 'GGN', code: 'GGN', name: 'Gurgaon', hindiName: 'गुड़गांव', line: 'national', platforms: [1, 2, 3], x: 260, y: 520, isMajorHub: true, city: 'Gurgaon' }
    ],
    chains: [
      ['DLI', 'NDLS'], ['NDLS', 'NZM'], ['NZM', 'FDB'],
      ['NDLS', 'ANVT'], ['ANVT', 'GZB'], ['NDLS', 'GGN']
    ]
  },
  bengaluru: {
    nodes: [
      { id: 'SBC_REG', code: 'SBC', name: 'KSR Bengaluru', hindiName: 'केएसआर बेंगलुरु', line: 'national', platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], x: 350, y: 400, isMajorHub: true, isInterchange: true, city: 'Bengaluru' },
      { id: 'BNC', code: 'BNC', name: 'Bengaluru Cantt', hindiName: 'बेंगलुरु छावनी', line: 'national', platforms: [1, 2, 3], x: 430, y: 370, city: 'Bengaluru' },
      { id: 'YPR', code: 'YPR', name: 'Yesvantpur Jn', hindiName: 'यशवंतपुर', line: 'national', platforms: [1, 2, 3, 4, 5, 6], x: 280, y: 290, isMajorHub: true, city: 'Bengaluru' },
      { id: 'BYPL', code: 'BYPL', name: 'Baiyyappanahalli', hindiName: 'बैय्यप्पनहल्ली', line: 'national', platforms: [1, 2, 3], x: 530, y: 380, isInterchange: true, city: 'Bengaluru' },
      { id: 'KJM', code: 'KJM', name: 'Krishnarajapuram', hindiName: 'कृष्णराजपुरम', line: 'national', platforms: [1, 2, 3, 4], x: 620, y: 390, isMajorHub: true, city: 'Bengaluru' },
      { id: 'WFD', code: 'WFD', name: 'Whitefield', hindiName: 'व्हाइटफील्ड', line: 'national', platforms: [1, 2, 3], x: 720, y: 400, isMajorHub: true, city: 'Bengaluru' }
    ],
    chains: [
      ['YPR', 'SBC'], ['SBC', 'BNC'], ['BNC', 'BYPL'], ['BYPL', 'KJM'], ['KJM', 'WFD']
    ]
  },
  kolkata: {
    nodes: [
      { id: 'HWH_REG', code: 'HWH', name: 'Howrah Junction', hindiName: 'हावड़ा', line: 'national', platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], x: 340, y: 400, isMajorHub: true, isInterchange: true, city: 'Kolkata' },
      { id: 'SDAH', code: 'SDAH', name: 'Sealdah Terminus', hindiName: 'सियालदह', line: 'national', platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], x: 460, y: 400, isMajorHub: true, isInterchange: true, city: 'Kolkata' },
      { id: 'KOAA', code: 'KOAA', name: 'Kolkata Chitpur', hindiName: 'कोलकाता टर्मिनल', line: 'national', platforms: [1, 2, 3, 4, 5], x: 440, y: 320, isMajorHub: true, city: 'Kolkata' },
      { id: 'SHM', code: 'SHM', name: 'Shalimar', hindiName: 'शालीमार', line: 'national', platforms: [1, 2, 3, 4], x: 320, y: 490, city: 'Howrah' },
      { id: 'BDG', code: 'BDG', name: 'Budge Budge', hindiName: 'बज बज', line: 'national', platforms: [1, 2], x: 410, y: 580, city: 'Kolkata' },
      { id: 'BWN', code: 'BWN', name: 'Barddhaman Jn', hindiName: 'बर्द्धमान', line: 'national', platforms: [1, 2, 3, 4, 5, 6], x: 180, y: 220, isMajorHub: true, city: 'Bardhaman' }
    ],
    chains: [
      ['BWN', 'HWH'], ['HWH', 'SHM'], ['HWH', 'SDAH'], ['SDAH', 'KOAA'], ['SDAH', 'BDG']
    ]
  },
  chennai: {
    nodes: [
      { id: 'MAS_REG', code: 'MAS', name: 'Chennai Central', hindiName: 'चेन्नई सेंट्रल', line: 'national', platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], x: 380, y: 320, isMajorHub: true, isInterchange: true, city: 'Chennai' },
      { id: 'MS', code: 'MS', name: 'Chennai Egmore', hindiName: 'चेन्नई एग्मोर', line: 'national', platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], x: 380, y: 390, isMajorHub: true, city: 'Chennai' },
      { id: 'MSB', code: 'MSB', name: 'Chennai Beach', hindiName: 'चेन्नई बीच', line: 'national', platforms: [1, 2, 3, 4, 5, 6], x: 400, y: 260, isMajorHub: true, city: 'Chennai' },
      { id: 'TBM', code: 'TBM', name: 'Tambaram', hindiName: 'तांबरम', line: 'national', platforms: [1, 2, 3, 4, 5, 6, 7, 8], x: 370, y: 550, isMajorHub: true, city: 'Chennai' },
      { id: 'CGL', code: 'CGL', name: 'Chengalpattu Jn', hindiName: 'चेंगलपट्टू', line: 'national', platforms: [1, 2, 3, 4, 5, 6], x: 360, y: 680, isMajorHub: true, city: 'Chengalpattu' },
      { id: 'AJJ', code: 'AJJ', name: 'Arakkonam Jn', hindiName: 'अरक्कोणम', line: 'national', platforms: [1, 2, 3, 4, 5], x: 190, y: 340, isMajorHub: true, city: 'Arakkonam' }
    ],
    chains: [
      ['MSB', 'MAS'], ['MAS', 'MS'], ['MS', 'TBM'], ['TBM', 'CGL'], ['MAS', 'AJJ']
    ]
  },
  hyderabad: {
    nodes: [
      { id: 'SC_REG', code: 'SC', name: 'Secunderabad Jn', hindiName: 'सिकंदराबाद', line: 'national', platforms: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], x: 420, y: 350, isMajorHub: true, isInterchange: true, city: 'Hyderabad' },
      { id: 'HYB', code: 'HYB', name: 'Hyderabad Deccan (Nampally)', hindiName: 'हैदराबाद डेक्कन', line: 'national', platforms: [1, 2, 3, 4, 5, 6], x: 370, y: 440, isMajorHub: true, city: 'Hyderabad' },
      { id: 'KCG', code: 'KCG', name: 'Kacheguda', hindiName: 'काचीगुड़ा', line: 'national', platforms: [1, 2, 3, 4, 5], x: 450, y: 460, isMajorHub: true, city: 'Hyderabad' },
      { id: 'BMT', code: 'BMT', name: 'Begumpet', hindiName: 'बेगमपेट', line: 'national', platforms: [1, 2], x: 350, y: 340, city: 'Hyderabad' },
      { id: 'LPI', code: 'LPI', name: 'Lingampalli', hindiName: 'लिंगमपल्ली', line: 'national', platforms: [1, 2, 3, 4, 5, 6], x: 220, y: 320, isMajorHub: true, city: 'Hyderabad' },
      { id: 'FM', code: 'FM', name: 'Falaknuma', hindiName: 'फलकनुमा', line: 'national', platforms: [1, 2, 3], x: 460, y: 580, isMajorHub: true, city: 'Hyderabad' }
    ],
    chains: [
      ['LPI', 'BMT'], ['BMT', 'SC'], ['SC', 'HYB'], ['SC', 'KCG'], ['KCG', 'FM']
    ]
  },
  kochi: {
    nodes: [
      { id: 'ERS_REG', code: 'ERS', name: 'Ernakulam Junction (South)', hindiName: 'एर्नाकुलम जंक्शन', line: 'national', platforms: [1, 2, 3, 4, 5, 6], x: 350, y: 480, isMajorHub: true, isInterchange: true, city: 'Kochi' },
      { id: 'ERN', code: 'ERN', name: 'Ernakulam Town (North)', hindiName: 'एर्नाकुलम टाउन', line: 'national', platforms: [1, 2], x: 360, y: 410, isMajorHub: true, city: 'Kochi' },
      { id: 'AWY', code: 'AWY', name: 'Aluva', hindiName: 'अलुवा', line: 'national', platforms: [1, 2, 3], x: 380, y: 310, isInterchange: true, city: 'Kochi' },
      { id: 'AFK', code: 'AFK', name: 'Angamaly for Kalady', hindiName: 'अंगमाली', line: 'national', platforms: [1, 2, 3], x: 390, y: 230, city: 'Angamaly' },
      { id: 'TCR', code: 'TCR', name: 'Thrissur', hindiName: 'त्रिशूर', line: 'national', platforms: [1, 2, 3, 4], x: 410, y: 120, isMajorHub: true, city: 'Thrissur' }
    ],
    chains: [
      ['ERS', 'ERN'], ['ERN', 'AWY'], ['AWY', 'AFK'], ['AFK', 'TCR']
    ]
  }
};

export default function NetworkMapScreen() {
  const { colors } = useMobileTheme();
  const [networkScope, setNetworkScope] = useState<NetworkScope>('mumbai');
  const [selectedFilter, setSelectedFilter] = useState<LineFilter>('all');
  const [viewMode, setViewMode] = useState<MapViewMode>('topological_svg');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<StationItem | null>(null);

  // SVG Zoom
  const [zoom, setZoom] = useState(1);

  // Active Station List based on networkScope
  const stationList: StationItem[] = useMemo(() => {
    if (networkScope === 'pan_india') {
      const nationalNodes: StationItem[] = PAN_INDIA_NODES.map(node => {
        const isNationalFocus = ['MMCT', 'CSMT', 'NDLS', 'HWH', 'MAS', 'SBC', 'SC', 'PUNE', 'ERS'].includes(node.code);
        return {
          id: node.id,
          code: node.code,
          name: node.name,
          hindiName: node.hindiName,
          line: 'national',
          platforms: node.platforms || [1, 2, 3, 4],
          x: node.x,
          y: node.y,
          isInterchange: node.isInterchange,
          isMajorHub: node.isMajorHub,
          isFocusCity: isNationalFocus,
          city: node.city
        };
      });
      return nationalNodes;
    }

    if (networkScope === 'mumbai') {
      const suburban: StationItem[] = MUMBAI_SUBURBAN_NODES.map((node: any) => ({
        id: node.id,
        code: node.code,
        name: node.name,
        hindiName: node.hindiName,
        marathiName: node.marathiName,
        line: (node.line as any) || 'central',
        platforms: node.platforms || [1, 2],
        x: node.x,
        y: node.y,
        isInterchange: node.isInterchange,
        isMajorHub: node.isMajorHub,
        city: 'Mumbai'
      }));

      const metroList: StationItem[] = Object.values(METRO_STATIONS).map(m => ({
        id: m.id,
        code: m.code,
        name: m.name,
        hindiName: m.hindiName,
        marathiName: m.marathiName,
        line: 'metro',
        platforms: [1, 2],
        x: m.latitude ? Math.round((m.longitude - 72.8) * 1500) + 100 : 250,
        y: m.longitude ? Math.round((19.3 - m.latitude) * 1800) + 150 : 450,
        isInterchange: m.isInterchange,
        isMajorHub: false,
        city: 'Mumbai'
      }));

      return [...suburban, ...metroList];
    }

    // Regional City Scope
    const regional = REGIONAL_CITY_NETWORKS[networkScope];
    if (regional) {
      return regional.nodes;
    }

    return [];
  }, [networkScope]);

  // Station Code Map
  const stationByCode = useMemo(() => {
    const map = new Map<string, StationItem>();
    stationList.forEach(s => map.set(s.code, s));
    return map;
  }, [stationList]);

  // Track Segments Generator
  const trackSegments = useMemo(() => {
    const segments: Array<{ id: string; x1: number; y1: number; x2: number; y2: number; color: string; line: string }> = [];

    if (networkScope === 'pan_india') {
      PAN_INDIA_CORRIDORS.forEach(corridor => {
        const s1 = stationByCode.get(corridor.fromCode);
        const s2 = stationByCode.get(corridor.toCode);
        if (s1 && s2) {
          segments.push({
            id: corridor.id,
            x1: s1.x,
            y1: s1.y,
            x2: s2.x,
            y2: s2.y,
            color: LINE_COLORS.national,
            line: 'national'
          });
        }
      });
      return segments;
    }

    if (networkScope === 'mumbai') {
      Object.entries(SUBURBAN_CORRIDOR_CHAINS).forEach(([chainKey, codes]) => {
        let lineColor = LINE_COLORS.central;
        let lineType = 'central';
        if (chainKey.startsWith('western')) {
          lineColor = LINE_COLORS.western;
          lineType = 'western';
        } else if (chainKey.startsWith('harbour')) {
          lineColor = LINE_COLORS.harbour;
          lineType = 'harbour';
        } else if (chainKey.startsWith('transharbour')) {
          lineColor = LINE_COLORS.transharbour;
          lineType = 'transharbour';
        } else if (chainKey.startsWith('uran')) {
          lineColor = LINE_COLORS.uran;
          lineType = 'uran';
        }

        for (let i = 0; i < codes.length - 1; i++) {
          const s1 = stationByCode.get(codes[i]);
          const s2 = stationByCode.get(codes[i + 1]);
          if (s1 && s2) {
            segments.push({
              id: `${s1.code}-${s2.code}`,
              x1: s1.x,
              y1: s1.y,
              x2: s2.x,
              y2: s2.y,
              color: lineColor,
              line: lineType
            });
          }
        }
      });

      if (METRO_CORRIDORS) {
        Object.entries(METRO_CORRIDORS).forEach(([_, codes]: [string, any]) => {
          for (let i = 0; i < codes.length - 1; i++) {
            const s1 = stationByCode.get(codes[i]);
            const s2 = stationByCode.get(codes[i + 1]);
            if (s1 && s2) {
              segments.push({
                id: `metro-${s1.code}-${s2.code}`,
                x1: s1.x,
                y1: s1.y,
                x2: s2.x,
                y2: s2.y,
                color: LINE_COLORS.metro,
                line: 'metro'
              });
            }
          }
        });
      }
      return segments;
    }

    // Regional City Scope Chains
    const regional = REGIONAL_CITY_NETWORKS[networkScope];
    if (regional && regional.chains) {
      regional.chains.forEach(([c1, c2]) => {
        const s1 = stationByCode.get(c1);
        const s2 = stationByCode.get(c2);
        if (s1 && s2) {
          segments.push({
            id: `${s1.code}-${s2.code}`,
            x1: s1.x,
            y1: s1.y,
            x2: s2.x,
            y2: s2.y,
            color: colors.primary,
            line: 'central'
          });
        }
      });
    }

    return segments;
  }, [networkScope, stationByCode, colors.primary]);

  const filteredStations = useMemo(() => {
    return stationList.filter(s => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.hindiName && s.hindiName.includes(q)) ||
        (s.marathiName && s.marathiName.includes(q));

      if (networkScope !== 'mumbai') return matchesSearch;

      const matchesFilter =
        selectedFilter === 'all'
          ? true
          : selectedFilter === 'transharbour'
          ? s.line === 'transharbour' || s.line === 'uran'
          : s.line === selectedFilter;

      return matchesFilter && matchesSearch;
    });
  }, [stationList, networkScope, selectedFilter, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Header & City Switcher Bar */}
      <View style={[styles.statusRibbon, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.verifiedTag}>
          <Text style={styles.verifiedTagText}>
            {networkScope === 'pan_india' ? '[PAN-INDIA CORRIDORS]' : `[${networkScope.toUpperCase()} TRANSIT]`}
          </Text>
        </View>
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>
          {networkScope === 'pan_india'
            ? 'National Rail Trunk Network connecting 8 Focus Cities across India.'
            : networkScope === 'mumbai'
            ? 'Mumbai Suburban Flagship (WR, CR, Harbour) + Metro network.'
            : `${networkScope.toUpperCase()} Suburban rail network & transit corridors.`}
        </Text>
      </View>

      {/* 2. City Switcher Carousel (8 Cities + Pan India) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cityScopeBar}
      >
        {FOCUS_CITIES.map(c => {
          const isSelected = networkScope === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.cityScopeChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.cardBorder
                }
              ]}
              onPress={() => {
                setNetworkScope(c.id as NetworkScope);
                setSelectedStation(null);
                setZoom(1);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Select ${c.name} network view`}
            >
              <Text
                style={[
                  styles.cityScopeChipText,
                  { color: isSelected ? '#FFFFFF' : colors.textPrimary }
                ]}
              >
                {c.name} {c.isFlagship ? '★' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. Search Bar & Mode Switch */}
      <View style={styles.controlsRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search code or station name..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={[styles.clearBtnText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.modeToggle, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <TouchableOpacity
            style={[styles.modeBtn, viewMode === 'topological_svg' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('topological_svg')}
          >
            <Text style={[styles.modeBtnText, { color: viewMode === 'topological_svg' ? '#ffffff' : colors.textPrimary }]}>
              Map
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, viewMode === 'schematic_list' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('schematic_list')}
          >
            <Text style={[styles.modeBtnText, { color: viewMode === 'schematic_list' ? '#ffffff' : colors.textPrimary }]}>
              List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Mumbai Line Filters (Only when in Mumbai scope) */}
      {networkScope === 'mumbai' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              { borderColor: colors.cardBorder },
              selectedFilter === 'all' && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterChipText, { color: selectedFilter === 'all' ? '#FFFFFF' : colors.textSecondary }]}>
              All Corridors ({stationList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, { borderColor: LINE_COLORS.western }, selectedFilter === 'western' && { backgroundColor: LINE_COLORS.western }]}
            onPress={() => setSelectedFilter('western')}
          >
            <View style={[styles.colorDot, { backgroundColor: LINE_COLORS.western }]} />
            <Text style={[styles.filterChipText, { color: selectedFilter === 'western' ? '#FFFFFF' : colors.textSecondary }]}>
              Western Line
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, { borderColor: LINE_COLORS.central }, selectedFilter === 'central' && { backgroundColor: LINE_COLORS.central }]}
            onPress={() => setSelectedFilter('central')}
          >
            <View style={[styles.colorDot, { backgroundColor: LINE_COLORS.central }]} />
            <Text style={[styles.filterChipText, { color: selectedFilter === 'central' ? '#FFFFFF' : colors.textSecondary }]}>
              Central Main
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, { borderColor: LINE_COLORS.harbour }, selectedFilter === 'harbour' && { backgroundColor: LINE_COLORS.harbour }]}
            onPress={() => setSelectedFilter('harbour')}
          >
            <View style={[styles.colorDot, { backgroundColor: LINE_COLORS.harbour }]} />
            <Text style={[styles.filterChipText, { color: selectedFilter === 'harbour' ? '#FFFFFF' : colors.textSecondary }]}>
              Harbour Line
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, { borderColor: LINE_COLORS.transharbour }, selectedFilter === 'transharbour' && { backgroundColor: LINE_COLORS.transharbour }]}
            onPress={() => setSelectedFilter('transharbour')}
          >
            <View style={[styles.colorDot, { backgroundColor: LINE_COLORS.transharbour }]} />
            <Text style={[styles.filterChipText, { color: selectedFilter === 'transharbour' ? '#FFFFFF' : colors.textSecondary }]}>
              Trans-Harbour
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, { borderColor: LINE_COLORS.metro }, selectedFilter === 'metro' && { backgroundColor: LINE_COLORS.metro }]}
            onPress={() => setSelectedFilter('metro')}
          >
            <View style={[styles.colorDot, { backgroundColor: LINE_COLORS.metro }]} />
            <Text style={[styles.filterChipText, { color: selectedFilter === 'metro' ? '#FFFFFF' : colors.textSecondary }]}>
              Metro Lines
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* 5. SVG Map Canvas or List View */}
      {viewMode === 'topological_svg' ? (
        <View style={[styles.svgMapContainer, { backgroundColor: '#090d16', borderColor: colors.cardBorder }]}>
          {/* Zoom Controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomBtn} onPress={() => setZoom(z => Math.min(2.5, z + 0.25))}>
              <Text style={styles.zoomBtnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomBtn} onPress={() => setZoom(z => Math.max(0.6, z - 0.25))}>
              <Text style={styles.zoomBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomBtn} onPress={() => setZoom(1)}>
              <Text style={styles.zoomBtnText}>↺</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            contentContainerStyle={{ width: 1000 * zoom, height: 950 * zoom }}
          >
            <ScrollView showsVerticalScrollIndicator contentContainerStyle={{ width: 1000 * zoom, height: 950 * zoom }}>
              <Svg width={1000 * zoom} height={950 * zoom} viewBox="0 0 1000 950">
                {/* Track Segments */}
                {trackSegments.map(seg => (
                  <SvgLine
                    key={seg.id}
                    x1={seg.x1}
                    y1={seg.y1}
                    x2={seg.x2}
                    y2={seg.y2}
                    stroke={seg.color}
                    strokeWidth={networkScope === 'pan_india' ? 3.5 : 3}
                    strokeOpacity={0.85}
                  />
                ))}

                {/* Station Nodes */}
                {filteredStations.map(stn => {
                  const isSelected = selectedStation?.code === stn.code;
                  const isNationalFocus = stn.isFocusCity;
                  const nodeColor = isNationalFocus
                    ? '#f59e0b'
                    : stn.line === 'national'
                    ? '#f43f5e'
                    : LINE_COLORS[stn.line] || colors.primary;

                  return (
                    <G key={stn.id} onPress={() => setSelectedStation(stn)}>
                      {/* Halo ring for focus cities or selected node */}
                      {(isSelected || isNationalFocus) && (
                        <Circle
                          cx={stn.x}
                          cy={stn.y}
                          r={isSelected ? 16 : 12}
                          fill="none"
                          stroke={isSelected ? '#22c55e' : '#f59e0b'}
                          strokeWidth={2}
                          strokeDasharray={isNationalFocus ? '3,3' : undefined}
                          opacity={0.8}
                        />
                      )}

                      <Circle
                        cx={stn.x}
                        cy={stn.y}
                        r={stn.isMajorHub ? 7 : 4.5}
                        fill={nodeColor}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />

                      {/* Station Label */}
                      <SvgText
                        x={stn.x + 10}
                        y={stn.y + 4}
                        fill={isNationalFocus ? '#fef08a' : isSelected ? '#22c55e' : '#ffffff'}
                        fontSize={stn.isMajorHub ? 11 : 9}
                        fontWeight={stn.isMajorHub ? 'bold' : 'normal'}
                      >
                        {stn.code} · {stn.name}
                      </SvgText>
                    </G>
                  );
                })}
              </Svg>
            </ScrollView>
          </ScrollView>
        </View>
      ) : (
        /* Schematic List View */
        <ScrollView contentContainerStyle={styles.listContainer}>
          {filteredStations.map(stn => (
            <TouchableOpacity
              key={stn.id}
              style={[
                styles.stationListItem,
                { backgroundColor: colors.card, borderColor: colors.cardBorder }
              ]}
              onPress={() => setSelectedStation(stn)}
            >
              <View style={styles.stationListItemHeader}>
                <View style={[styles.stationCodeBadge, { backgroundColor: LINE_COLORS[stn.line] || colors.primary }]}>
                  <Text style={styles.stationCodeBadgeText}>{stn.code}</Text>
                </View>
                <View style={styles.stationNameCol}>
                  <Text style={[styles.stationNameText, { color: colors.textPrimary }]}>{stn.name}</Text>
                  {stn.hindiName && (
                    <Text style={[styles.vernacularNameText, { color: colors.textMuted }]}>{stn.hindiName}</Text>
                  )}
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={[styles.platformCountText, { color: colors.textSecondary }]}>
                  {stn.platforms?.length || 2} Platforms {stn.isInterchange ? '· Interchange' : ''}
                </Text>
                <Text style={[styles.lineBadgeText, { color: LINE_COLORS[stn.line] || colors.primary }]}>
                  {stn.line.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 6. Selected Station Bottom Sheet */}
      {selectedStation && (
        <View style={[styles.bottomSheet, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleRow}>
              <View style={[styles.stationCodeBadge, { backgroundColor: LINE_COLORS[selectedStation.line] || colors.primary }]}>
                <Text style={styles.stationCodeBadgeText}>{selectedStation.code}</Text>
              </View>
              <View>
                <Text style={[styles.sheetName, { color: colors.textPrimary }]}>{selectedStation.name}</Text>
                <Text style={[styles.sheetMarathi, { color: colors.textSecondary }]}>
                  {selectedStation.hindiName} {selectedStation.marathiName ? `· ${selectedStation.marathiName}` : ''}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => setSelectedStation(null)} style={styles.sheetCloseBtn}>
              <Text style={[styles.sheetCloseText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sheetActionsRow}>
            <TouchableOpacity
              style={[styles.sheetActionBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                router.push({
                  pathname: '/(tabs)/journeys',
                  params: { from: selectedStation.code }
                });
              }}
              accessibilityRole="button"
              accessibilityLabel={`Show departures from ${selectedStation.code}`}
            >
              <Text style={styles.sheetActionBtnText}>Departures From Here</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sheetActionBtnSecondary, { borderColor: colors.cardBorder }]}
              onPress={() => {
                router.push({
                  pathname: '/wayfinding',
                  params: { station: selectedStation.code }
                });
              }}
              accessibilityRole="button"
              accessibilityLabel={`Show 3D station map for ${selectedStation.code}`}
            >
              <Text style={[styles.sheetActionBtnTextSecondary, { color: colors.textPrimary }]}>
                3D Station Map
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  statusRibbon: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  verifiedTag: {
    backgroundColor: '#0284c725',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4
  },
  verifiedTagText: {
    color: '#0284c7',
    fontSize: 10,
    fontWeight: '800'
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16
  },
  cityScopeBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8
  },
  cityScopeChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center'
  },
  cityScopeChipText: {
    fontSize: 12,
    fontWeight: '800'
  },
  controlsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 4
  },
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 2
  },
  modeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700'
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  svgMapContainer: {
    flex: 1,
    borderTopWidth: 1
  },
  zoomControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  zoomBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  zoomBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900'
  },
  listContainer: {
    padding: 16,
    gap: 10
  },
  stationListItem: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1
  },
  stationListItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  stationCodeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  stationCodeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900'
  },
  stationNameCol: {
    flex: 1
  },
  stationNameText: {
    fontSize: 14,
    fontWeight: '800'
  },
  vernacularNameText: {
    fontSize: 11,
    marginTop: 2
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  platformCountText: {
    fontSize: 11
  },
  lineBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 6
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  sheetName: {
    fontSize: 15,
    fontWeight: '800'
  },
  sheetMarathi: {
    fontSize: 11,
    marginTop: 2
  },
  sheetCloseBtn: {
    padding: 4
  },
  sheetCloseText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  sheetActionsRow: {
    flexDirection: 'row',
    gap: 8
  },
  sheetActionBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center'
  },
  sheetActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  },
  sheetActionBtnSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center'
  },
  sheetActionBtnTextSecondary: {
    fontSize: 13,
    fontWeight: '700'
  }
});
