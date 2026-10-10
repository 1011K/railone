import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  Switch,
  Linking
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMobileTheme, THEME_PALETTES, ColorTheme, AppLanguage } from '../../src/theme/ThemeContext';
import { MobileApiClient } from '../../src/api/client';
import { OfflineStorage } from '../../src/storage/offlineStorage';
import { CITIES_REGISTRY, CityCoverageConfig } from '../../src/fixtures/citiesData';
import { NativeLaunchSequence } from '../../src/components/NativeLaunchSequence';
import Svg, { Path, Circle, Polyline, Line, Rect, Polygon } from 'react-native-svg';

export interface NativeServiceItem {
  id: string;
  name: string;
  category: 'ticketing' | 'navigation' | 'assistance' | 'insights';
  description: string;
  badge?: string;
  isExternalLink?: boolean;
  externalUrl?: string;
  route?: string;
  routeParams?: Record<string, string>;
}

export const NATIVE_22_SERVICES: NativeServiceItem[] = [
  {
    id: 'unreserved_tickets',
    name: 'Unreserved Tickets (UTS)',
    category: 'ticketing',
    description: 'Book unreserved suburban and Mail/Express general 2nd class tickets.',
    badge: 'Specimen',
    route: '/booking/local'
  },
  {
    id: 'reserved_tickets',
    name: 'Reserved Tickets (PRS)',
    category: 'ticketing',
    description: 'Reserved Sleeper, 3A, 2A, 1A, CC and Vande Bharat demo.',
    badge: 'Demo PRS',
    route: '/booking/express'
  },
  {
    id: 'platform_permits',
    name: 'Platform Permits',
    category: 'ticketing',
    description: 'Issue 2-hour platform access permit for station concourses.',
    badge: '₹10 Demo',
    route: '/booking/local',
    routeParams: { mode: 'PLATFORM', type: 'platform' }
  },
  {
    id: 'season_passes',
    name: 'Season Passes (MST / QST)',
    category: 'ticketing',
    description: 'Monthly and quarterly commuter season passes across verified suburban corridors.',
    badge: 'Suburban',
    route: '/booking/local',
    routeParams: { mode: 'SEASON_MST', type: 'season' }
  },
  {
    id: 'metro_ticketing',
    name: 'Metro Ticketing',
    category: 'ticketing',
    description: 'QR tokens and single journey passes for Mumbai Metro Lines 1, 2A, 7, and 3.',
    badge: 'MMRDA/MMRC',
    route: '/booking/local',
    routeParams: { mode: 'METRO_TOKEN' }
  },
  {
    id: 'my_tickets_qr',
    name: 'My Tickets & Specimen QR',
    category: 'ticketing',
    description: 'View active, past, and cancelled specimen tickets with cryptographic watermarks.',
    route: '/(tabs)/tickets'
  },
  {
    id: 'wallet_recharge',
    name: 'RailWallet & Recharge',
    category: 'ticketing',
    description: 'Passenger transit wallet balance, mock recharge, and instant refund credits.',
    badge: 'Simulated',
    route: '/(tabs)/tickets',
    routeParams: { tab: 'wallet' }
  },
  {
    id: 'cancellation_refunds',
    name: 'Cancellation & Refunds',
    category: 'ticketing',
    description: 'Cancel bookings with statutory clerical deductions and simulated RailWallet credits.',
    route: '/(tabs)/tickets',
    routeParams: { tab: 'cancelled' }
  },
  {
    id: 'journey_planning',
    name: 'Door-to-Door Journey Planning',
    category: 'navigation',
    description: 'Multimodal door-to-door itinerary search across suburban rail, metro, bus, and walk legs.',
    route: '/(tabs)/journeys'
  },
  {
    id: 'train_running_status',
    name: 'Train Running Status',
    category: 'insights',
    description: 'Live departure boards, platform assignments, and verified station telemetry.',
    badge: 'Live Board',
    route: '/(tabs)/status'
  },
  {
    id: 'crowd_delay_insights',
    name: 'Historical Crowd & Delays',
    category: 'insights',
    description: 'Empirical delay histograms, corridor bunching, and peak direction crowd estimates.',
    badge: 'Statistical',
    route: '/(tabs)/status',
    routeParams: { view: 'crowd' }
  },
  {
    id: 'station_navigation_2d',
    name: '2D Station Navigation',
    category: 'navigation',
    description: 'Top-down station layouts, Foot-Over-Bridges, step-free lifts, and platform transfers.',
    badge: "God's Eye",
    route: '/wayfinding'
  },
  {
    id: 'coach_positioning',
    name: 'Coach Positioning Guide',
    category: 'navigation',
    description: '12-car/15-car suburban and 16-car Vande Bharat coach alignments relative to FOB stairs.',
    route: '/guide'
  },
  {
    id: 'railyatri_voice_chat',
    name: 'Rail Yatri Voice & Chat',
    category: 'assistance',
    description: 'Multilingual conversational assistant (English, Hindi, Marathi) for trains and bookings.',
    badge: 'Multilingual',
    route: '/(tabs)/railsathi'
  },
  {
    id: 'railmadad_help',
    name: 'RailMadad & Passenger Help',
    category: 'assistance',
    description: 'Integrated 139 passenger helpline, security RPF assistance, and official grievance tracking.',
    isExternalLink: true,
    externalUrl: 'https://railmadad.indianrailways.gov.in'
  },
  {
    id: 'food_station_amenities',
    name: 'Food & Station Amenities',
    category: 'assistance',
    description: 'Official IRCTC e-Catering portal, water ATMs, cloak rooms, and waiting halls.',
    isExternalLink: true,
    externalUrl: 'https://ecatering.irctc.co.in'
  },
  {
    id: 'nearest_station',
    name: 'Nearest Station Locator',
    category: 'navigation',
    description: 'Find nearest suburban or metro terminal based on verified coordinates and lines.',
    route: '/wayfinding',
    routeParams: { nearest: 'true' }
  },
  {
    id: 'network_maps',
    name: 'Network Maps & Interchanges',
    category: 'navigation',
    description: 'Schematic network diagrams and WGS-84 geographic maps across all 8 Indian metro regions.',
    route: '/map'
  },
  {
    id: 'pnr_status',
    name: 'PNR Status Enquiry',
    category: 'insights',
    description: 'Check real-time chart preparation, berth allocation, and passenger confirmation status.',
    badge: 'PRS',
    route: '/pnr'
  },
  {
    id: 'accessibility_assistance',
    name: 'Divyangjan Accessibility',
    category: 'assistance',
    description: 'Wheelchair step-free paths, tactile paving guide, and elevator status at major hubs.',
    badge: 'Step-Free',
    route: '/wayfinding',
    routeParams: { stepFree: 'true' }
  },
  {
    id: 'disruption_weather',
    name: 'Weather & Disruption Context',
    category: 'insights',
    description: 'Monsoon flooding alerts, Sunday mega-blocks, jumbo-blocks, and corridor track work.',
    route: '/(tabs)/status',
    routeParams: { view: 'disruptions' }
  },
  {
    id: 'travel_feedback',
    name: 'Passenger Travel Feedback',
    category: 'assistance',
    description: 'Rate train cleanliness, punctuality, coach amenities, and passenger security.',
    badge: 'Citizen',
    route: '/feedback'
  }
];

const NATIVE_SERVICE_PASTELS: Record<string, { bg: string; border: string; icon: string }> = {
  unreserved_tickets: { bg: '#fef3c7', border: '#fde68a', icon: '#b45309' },
  reserved_tickets: { bg: '#dbeafe', border: '#bfdbfe', icon: '#1d4ed8' },
  platform_permits: { bg: '#d1fae5', border: '#a7f3d0', icon: '#047857' },
  season_passes: { bg: '#f3e8ff', border: '#e9d5ff', icon: '#6b21a8' },
  metro_ticketing: { bg: '#cffafe', border: '#a5f3fc', icon: '#0e7490' },
  my_tickets_qr: { bg: '#e0e7ff', border: '#c7d2fe', icon: '#4338ca' },
  wallet_recharge: { bg: '#ccfbf1', border: '#99f6e4', icon: '#0f766e' },
  cancellation_refunds: { bg: '#ffe4e6', border: '#fecdd3', icon: '#be123c' },
  journey_planning: { bg: '#e0f2fe', border: '#bae6fd', icon: '#0369a1' },
  pnr_status: { bg: '#ede9fe', border: '#ddd6fe', icon: '#6d28d9' },
  train_running_status: { bg: '#ffe4e6', border: '#fecdd3', icon: '#e11d48' },
  coach_positioning: { bg: '#cffafe', border: '#a5f3fc', icon: '#0891b2' },
  station_navigation_2d: { bg: '#d1fae5', border: '#a7f3d0', icon: '#059669' },
  food_station_amenities: { bg: '#ffedd5', border: '#fed7aa', icon: '#c2410c' },
  railmadad_help: { bg: '#fee2e2', border: '#fecaca', icon: '#b91c1c' },
  travel_feedback: { bg: '#fef3c7', border: '#fde68a', icon: '#d97706' },
  railyatri_voice_chat: { bg: '#f3e8ff', border: '#e9d5ff', icon: '#7e22ce' },
  crowd_delay_insights: { bg: '#fef9c3', border: '#fef08a', icon: '#a16207' },
  nearest_station: { bg: '#dbeafe', border: '#bfdbfe', icon: '#2563eb' },
  network_maps: { bg: '#e0e7ff', border: '#c7d2fe', icon: '#4f46e5' },
  accessibility_assistance: { bg: '#ccfbf1', border: '#99f6e4', icon: '#0d9488' },
  disruption_weather: { bg: '#e0f2fe', border: '#bae6fd', icon: '#0284c7' }
};

const renderServiceSvgIcon = (id: string, color: string) => {
  switch (id) {
    case 'unreserved_tickets':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v2a3 3 0 0 0 0 6v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-2a3 3 0 0 0 0-6V9z" />
          <Line x1="9" y1="12" x2="15" y2="12" />
        </Svg>
      );
    case 'reserved_tickets':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Rect x="4" y="3" width="16" height="16" rx="2" />
          <Path d="M4 11h16" />
          <Path d="M12 3v8" />
          <Circle cx="8" cy="15" r="1" fill={color} />
          <Circle cx="16" cy="15" r="1" fill={color} />
        </Svg>
      );
    case 'platform_permits':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <Polyline points="9 12 11 14 15 10" />
        </Svg>
      );
    case 'season_passes':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <Polyline points="14 2 14 8 20 8" />
          <Line x1="16" y1="13" x2="8" y2="13" />
        </Svg>
      );
    case 'metro_ticketing':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Rect x="2" y="5" width="20" height="14" rx="2" />
          <Line x1="2" y1="10" x2="22" y2="10" />
        </Svg>
      );
    case 'my_tickets_qr':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Rect x="3" y="3" width="7" height="7" />
          <Rect x="14" y="3" width="7" height="7" />
          <Rect x="3" y="14" width="7" height="7" />
          <Rect x="14" y="14" width="7" height="7" />
        </Svg>
      );
    case 'wallet_recharge':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <Path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <Path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
        </Svg>
      );
    case 'cancellation_refunds':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Polyline points="1 4 1 10 7 10" />
          <Path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </Svg>
      );
    case 'journey_planning':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Circle cx="12" cy="12" r="10" />
          <Polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={color} />
        </Svg>
      );
    case 'pnr_status':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <Polyline points="22 4 12 14.01 9 11.01" />
        </Svg>
      );
    case 'train_running_status':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Circle cx="12" cy="12" r="2" fill={color} />
          <Path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
        </Svg>
      );
    case 'coach_positioning':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Polygon points="12 2 2 7 12 12 22 7 12 2" />
          <Polyline points="2 17 12 22 22 17" />
          <Polyline points="2 12 12 17 22 12" />
        </Svg>
      );
    case 'station_navigation_2d':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <Line x1="8" y1="2" x2="8" y2="18" />
          <Line x1="16" y1="6" x2="16" y2="22" />
        </Svg>
      );
    case 'food_station_amenities':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <Line x1="6" y1="1" x2="6" y2="4" />
          <Line x1="10" y1="1" x2="10" y2="4" />
        </Svg>
      );
    case 'railmadad_help':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Circle cx="12" cy="12" r="10" />
          <Circle cx="12" cy="12" r="4" />
          <Line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
          <Line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
        </Svg>
      );
    case 'travel_feedback':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </Svg>
      );
    case 'railyatri_voice_chat':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </Svg>
      );
    case 'crowd_delay_insights':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Line x1="18" y1="20" x2="18" y2="10" />
          <Line x1="12" y1="20" x2="12" y2="4" />
          <Line x1="6" y1="20" x2="6" y2="14" />
        </Svg>
      );
    case 'nearest_station':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <Circle cx="12" cy="10" r="3" />
        </Svg>
      );
    case 'network_maps':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Line x1="6" y1="3" x2="6" y2="15" />
          <Circle cx="18" cy="6" r="3" />
          <Circle cx="6" cy="18" r="3" />
        </Svg>
      );
    case 'accessibility_assistance':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Circle cx="16" cy="4" r="1" fill={color} />
          <Path d="M18 19l-4-4 2-5h-4l-1 5" />
          <Circle cx="9" cy="17" r="4" />
        </Svg>
      );
    case 'disruption_weather':
    default:
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </Svg>
      );
  }
};

export default function HomeScreen() {
  const { colors, language, setLanguage, isDarkMode, toggleDarkMode, colorTheme, setColorTheme } = useMobileTheme();
  const params = useLocalSearchParams<{ replayLaunch?: string; reset?: string }>();

  // Selected city & config
  const [selectedCityId, setSelectedCityId] = useState<string>(() => OfflineStorage.getUserCity());
  const currentCity: CityCoverageConfig = CITIES_REGISTRY[selectedCityId] || CITIES_REGISTRY['mumbai'];

  // Origin & destination stations
  const initialFrom = currentCity.primaryHubs[0] || { code: 'TNA', name: 'Thane' };
  const initialTo = currentCity.primaryHubs[1] || { code: 'CSMT', name: 'CSMT (Mumbai)' };
  const [fromStation, setFromStation] = useState({ code: initialFrom.code, name: initialFrom.name });
  const [toStation, setToStation] = useState({ code: initialTo.code, name: initialTo.name });

  const [journeyDate, setJourneyDate] = useState('Today');
  const [acOnly, setAcOnly] = useState(false);
  const [recentSearches, setRecentSearches] = useState<Array<{ from: string; to: string }>>([]);
  const [savedTickets, setSavedTickets] = useState<any[]>([]);

  // Modals state
  const [showLaunchModal, setShowLaunchModal] = useState<boolean>(() => {
    if (params.replayLaunch === 'true') return true;
    return !OfflineStorage.getHasSeenLaunch();
  });
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [servicesSearch, setServicesSearch] = useState('');
  const [servicesCategory, setServicesCategory] = useState<'all' | 'ticketing' | 'navigation' | 'assistance' | 'insights'>('all');
  const [servicesExternalNotice, setServicesExternalNotice] = useState<string | null>(null);

  // Onboarding form state
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [locationConsent, setLocationConsent] = useState(true);

  // Station picker modal
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'from' | 'to'>('from');
  const [searchQuery, setSearchQuery] = useState('');
  const [stationList, setStationList] = useState(currentCity.primaryHubs.map(h => ({ code: h.code, name: h.name })));
  const [cityGraphStations, setCityGraphStations] = useState<Array<{ code: string; name: string }>>(
    currentCity.primaryHubs.map(h => ({ code: h.code, name: h.name }))
  );

  useEffect(() => {
    let active = true;
    const initial = currentCity.primaryHubs.map(h => ({ code: h.code, name: h.name }));
    setCityGraphStations(initial);
    MobileApiClient.getMultimodalCityStations(selectedCityId).then(stations => {
      if (!active) return;
      const byCode = new Map<string, { code: string; name: string }>();
      [...initial, ...stations].forEach(st => byCode.set(st.code, st));
      setCityGraphStations([...byCode.values()]);
    }).catch(() => {
      if (active) setCityGraphStations(initial);
    });
    return () => { active = false; };
  }, [selectedCityId]);

  useEffect(() => {
    if (params.replayLaunch === 'true') {
      setShowLaunchModal(true);
    }
    if (params.reset === 'true') {
      setShowOnboardingModal(true);
    }
    try {
      const recents = OfflineStorage.getRecentSearches();
      if (recents && recents.length > 0) {
        setRecentSearches(recents.slice(0, 4));
      }
      const tickets = OfflineStorage.getTickets();
      if (tickets && tickets.length > 0) {
        setSavedTickets(tickets);
      }
    } catch {
      // offline fallback
    }
  }, [params.replayLaunch, params.reset]);

  // When city changes, update hubs
  const handleSelectCity = (cityId: string) => {
    setSelectedCityId(cityId);
    OfflineStorage.setUserCity(cityId);
    const newCity = CITIES_REGISTRY[cityId] || CITIES_REGISTRY['mumbai'];
    if (newCity.primaryHubs.length >= 2) {
      setFromStation({ code: newCity.primaryHubs[0].code, name: newCity.primaryHubs[0].name });
      setToStation({ code: newCity.primaryHubs[1].code, name: newCity.primaryHubs[1].name });
    }
    setShowCityModal(false);
  };

  const swapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const openPicker = (target: 'from' | 'to') => {
    setPickerTarget(target);
    setSearchQuery('');
    setStationList(cityGraphStations);
    setPickerVisible(true);
  };

  const handleStationSearch = async (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setStationList(cityGraphStations);
      return;
    }
    const cityMatches = cityGraphStations.filter(st =>
      st.name.toLowerCase().includes(text.toLowerCase()) ||
      st.code.toLowerCase().includes(text.toLowerCase())
    );
    if (cityMatches.length > 0) {
      setStationList(cityMatches);
      return;
    }
    try {
      const results = await MobileApiClient.searchStations(text);
      if (results && results.length > 0) {
        setStationList(results.map(s => ({ code: s.code, name: s.name })));
      }
    } catch {
      const filtered = cityGraphStations
        .filter(st => st.name.toLowerCase().includes(text.toLowerCase()) ||
          st.code.toLowerCase().includes(text.toLowerCase()));
      setStationList(filtered);
    }
  };

  const selectStation = (station: { code: string; name: string }) => {
    if (pickerTarget === 'from') {
      setFromStation(station);
    } else {
      setToStation(station);
    }
    setPickerVisible(false);
  };

  const onSearchTrains = () => {
    OfflineStorage.addRecentSearch(fromStation.code, toStation.code);
    router.push({
      pathname: '/(tabs)/journeys',
      params: {
        from: fromStation.code,
        to: toStation.code,
        city: selectedCityId,
        dateLabel: journeyDate,
        acOnly: acOnly ? 'true' : 'false'
      }
    });
  };

  const handleCompleteOnboarding = (isGuest = false) => {
    OfflineStorage.setUserProfile({
      name: isGuest ? 'Commuter Guest' : userName.trim() || 'Passenger',
      phone: isGuest ? '' : userPhone.trim(),
      isGuest
    });
    OfflineStorage.setLocationConsent(locationConsent);
    OfflineStorage.setHasCompletedOnboarding(true);
    setShowOnboardingModal(false);
  };

  const handleDismissLaunch = () => {
    OfflineStorage.setHasSeenLaunch(true);
    setShowLaunchModal(false);
    if (!OfflineStorage.getHasCompletedOnboarding()) {
      setShowOnboardingModal(true);
    }
  };

  const handleServiceSelect = (service: NativeServiceItem) => {
    if (service.isExternalLink) {
      setServicesExternalNotice(service.name);
      Alert.alert(
        'Official External Provider Notice',
        `${service.name} is operated directly by Indian Railways / IRCTC.\n\nOpen official external portal?`,
        [
          { text: 'Dismiss', style: 'cancel', onPress: () => setServicesExternalNotice(null) },
          {
            text: 'Open Official Portal',
            onPress: () => {
              if (service.externalUrl) {
                Linking.openURL(service.externalUrl).catch(() => {});
              }
              setServicesExternalNotice(null);
            }
          }
        ]
      );
    } else if (service.route) {
      setShowServicesModal(false);
      if (service.routeParams) {
        router.push({ pathname: service.route as any, params: service.routeParams });
      } else {
        router.push(service.route as any);
      }
    }
  };

  const filteredNativeServices = NATIVE_22_SERVICES.filter(item => {
    const matchesCategory = servicesCategory === 'all' || item.category === servicesCategory;
    const q = servicesSearch.toLowerCase().trim();
    const matchesQuery = !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Top Identity Bar: City Picker, Language Toggle & Theme */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {/* City Selector Button */}
        <TouchableOpacity
          style={[styles.cityChip, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' }]}
          onPress={() => setShowCityModal(true)}
          activeOpacity={0.8}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2.5}>
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <Circle cx="12" cy="10" r="3" />
          </Svg>
          <Text style={[styles.cityChipText, { color: colors.primary }]}>
            {currentCity.name}
          </Text>
          <Text style={[styles.cityChipArrow, { color: colors.primary }]}>▾</Text>
        </TouchableOpacity>

        {/* Action Controls: Language, Theme, Profile */}
        <View style={styles.topControlsRow}>
          {/* Language Switch */}
          <View style={styles.langSwitch}>
            {(['en', 'hi', 'mr'] as AppLanguage[]).map(lng => (
              <TouchableOpacity
                key={lng}
                onPress={() => setLanguage(lng)}
                style={[
                  styles.langOption,
                  language === lng && { backgroundColor: colors.primary }
                ]}
              >
                <Text
                  style={[
                    styles.langOptionText,
                    { color: language === lng ? '#ffffff' : colors.textMuted }
                  ]}
                >
                  {lng.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Theme / Appearance Modal Button */}
          <TouchableOpacity
            style={[styles.iconBtn, { borderColor: colors.cardBorder }]}
            onPress={() => setShowThemeModal(true)}
            accessibilityLabel="Switch Livery Theme"
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth={2}>
              <Circle cx="13.5" cy="6.5" r=".5" fill={colors.textPrimary} />
              <Circle cx="17.5" cy="10.5" r=".5" fill={colors.textPrimary} />
              <Circle cx="8.5" cy="7.5" r=".5" fill={colors.textPrimary} />
              <Circle cx="6.5" cy="12.5" r=".5" fill={colors.textPrimary} />
              <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
            </Svg>
          </TouchableOpacity>

          {/* Profile / Onboarding Button */}
          <TouchableOpacity
            style={[styles.iconBtn, { borderColor: colors.cardBorder }]}
            onPress={() => setShowProfileModal(true)}
            accessibilityLabel="Passenger Profile"
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth={2}>
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <Circle cx="12" cy="7" r="4" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Journey Search Container */}
      <View style={[styles.searchCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Plan Journey ({currentCity.name})</Text>

        {/* Origin Station */}
        <TouchableOpacity
          style={[styles.inputRow, { borderColor: colors.cardBorder }]}
          onPress={() => openPicker('from')}
          accessibilityRole="button"
          accessibilityLabel={`From station: ${fromStation.name}`}
        >
          <View style={styles.inputPrefix}>
            <Text style={[styles.inputPrefixText, { color: colors.primary }]}>FROM</Text>
          </View>
          <View style={styles.stationTextContainer}>
            <Text style={[styles.stationCode, { color: colors.textPrimary }]}>{fromStation.code}</Text>
            <Text style={[styles.stationName, { color: colors.textMuted }]}>{fromStation.name}</Text>
          </View>
        </TouchableOpacity>

        {/* Swap Button */}
        <View style={styles.swapContainer}>
          <TouchableOpacity
            style={[styles.swapButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={swapStations}
            accessibilityRole="button"
            accessibilityLabel="Swap origin and destination stations"
          >
            <Text style={[styles.swapIcon, { color: colors.primary }]}>⇅</Text>
          </TouchableOpacity>
        </View>

        {/* Destination Station */}
        <TouchableOpacity
          style={[styles.inputRow, { borderColor: colors.cardBorder }]}
          onPress={() => openPicker('to')}
          accessibilityRole="button"
          accessibilityLabel={`To station: ${toStation.name}`}
        >
          <View style={styles.inputPrefix}>
            <Text style={[styles.inputPrefixText, { color: colors.primary }]}>TO</Text>
          </View>
          <View style={styles.stationTextContainer}>
            <Text style={[styles.stationCode, { color: colors.textPrimary }]}>{toStation.code}</Text>
            <Text style={[styles.stationName, { color: colors.textMuted }]}>{toStation.name}</Text>
          </View>
        </TouchableOpacity>

        {/* Date / Time */}
        <View style={[styles.inputRow, { borderColor: colors.cardBorder }]}>
          <View style={styles.inputPrefix}>
            <Text style={[styles.inputPrefixText, { color: colors.primary }]}>DATE</Text>
          </View>
          <View style={styles.dateTimeContainer}>
            {(['Today', 'Tomorrow'] as const).map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => setJourneyDate(d)}
                style={[
                  styles.datePill,
                  {
                    backgroundColor: journeyDate === d ? colors.primary : 'transparent',
                    borderColor: journeyDate === d ? colors.primary : colors.cardBorder
                  }
                ]}
              >
                <Text style={[styles.datePillText, { color: journeyDate === d ? '#ffffff' : colors.textPrimary }]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
            <Text style={[styles.timeNowText, { color: colors.textMuted }]}>Depart Now</Text>
          </View>
        </View>

        {/* AC Only Switch */}
        <TouchableOpacity
          style={styles.filterRow}
          onPress={() => setAcOnly(!acOnly)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, { borderColor: acOnly ? colors.primary : colors.cardBorder, backgroundColor: acOnly ? colors.primary : 'transparent' }]}>
            {acOnly && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.filterLabel, { color: colors.textPrimary }]}>AC Services Only (Mumbai AC Local)</Text>
        </TouchableOpacity>

        {/* Primary Action Button */}
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={onSearchTrains}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Find Best Journey"
        >
          <Text style={styles.searchButtonText}>Find Best Journey</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Next Departures / Last Saved Journeys */}
      {recentSearches.length > 0 && (
        <View style={[styles.savedSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.savedSectionTitle, { color: colors.textPrimary }]}>Recent Route Searches</Text>
          <View style={styles.savedPillsRow}>
            {recentSearches.map((sj, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.savedSearchPill, { borderColor: colors.cardBorder }]}
                onPress={() => {
                  setFromStation({ code: sj.from, name: currentCity.primaryHubs.find(x => x.code === sj.from)?.name || sj.from });
                  setToStation({ code: sj.to, name: currentCity.primaryHubs.find(x => x.code === sj.to)?.name || sj.to });
                }}
              >
                <Text style={[styles.savedSearchText, { color: colors.textPrimary }]}>
                  {sj.from} ➔ {sj.to}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 4. Rail Alert Banner (Verified Disruption / Advisory Notice) */}
      <View style={[styles.alertBanner, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.alertBadge}>
          <Text style={styles.alertBadgeText}>[TIMETABLE SCHEDULE]</Text>
        </View>
        <Text style={[styles.alertText, { color: colors.textSecondary }]}>
          Suburban EMU services operating on published timetable. Platform indicators verified against schedule.
        </Text>
      </View>

      {/* 5. Four Primary Fast Booking Actions */}
      <View style={styles.bookingGrid}>
        <TouchableOpacity
          style={[styles.bookingGridItem, { borderColor: colors.cardBorder }]}
          onPress={() => router.push('/booking/local')}
          activeOpacity={0.8}
        >
          <Text style={[styles.bookingGridTitle, { color: colors.textPrimary }]}>Local UTS</Text>
          <Text style={[styles.bookingGridSub, { color: colors.textMuted }]}>Suburban EMU</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bookingGridItem, { borderColor: colors.cardBorder }]}
          onPress={() => router.push('/booking/express')}
          activeOpacity={0.8}
        >
          <Text style={[styles.bookingGridTitle, { color: colors.textPrimary }]}>PRS Express</Text>
          <Text style={[styles.bookingGridSub, { color: colors.textMuted }]}>Mail / Express</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bookingGridItem, { borderColor: colors.cardBorder }]}
          onPress={() => router.push('/(tabs)/status')}
          activeOpacity={0.8}
        >
          <Text style={[styles.bookingGridTitle, { color: colors.textPrimary }]}>Running Status</Text>
          <Text style={[styles.bookingGridSub, { color: colors.textMuted }]}>Live Boards</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bookingGridItem, { borderColor: colors.cardBorder }]}
          onPress={() => router.push({ pathname: '/booking/local', params: { mode: 'METRO_TOKEN' } })}
          activeOpacity={0.8}
        >
          <Text style={[styles.bookingGridTitle, { color: colors.textPrimary }]}>Metro Token</Text>
          <Text style={[styles.bookingGridSub, { color: colors.textMuted }]}>Lines 1, 2A, 7, 3</Text>
        </TouchableOpacity>
      </View>

      {/* 6. 4-Column Square Services Grid (CRIS Benchmark) */}
      <View style={styles.squareGridSection}>
        <View style={styles.squareGridHeader}>
          <Text style={[styles.squareGridTitle, { color: colors.textPrimary }]}>
            SERVICES DIRECTORY (22)
          </Text>
          <TouchableOpacity onPress={() => setShowServicesModal(true)}>
            <Text style={[styles.squareGridHubLink, { color: colors.primary }]}>All 22 Transit Services →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.squareGridContainer}>
          {NATIVE_22_SERVICES.map(svc => {
            const basePastel = NATIVE_SERVICE_PASTELS[svc.id];
            const pastel = {
              bg: isDarkMode ? '#1e293b' : (basePastel?.bg || colors.card),
              border: isDarkMode ? '#334155' : (basePastel?.border || colors.cardBorder),
              icon: basePastel?.icon || colors.primary
            };
            return (
              <TouchableOpacity
                key={svc.id}
                style={styles.squareTile}
                onPress={() => handleServiceSelect(svc)}
                activeOpacity={0.7}
                accessibilityLabel={svc.name}
              >
                <View style={[styles.squareIconBox, { backgroundColor: pastel.bg, borderColor: pastel.border }]}>
                  {renderServiceSvgIcon(svc.id, pastel.icon)}
                </View>
                <Text style={[styles.squareTileLabel, { color: colors.textPrimary }]} numberOfLines={2}>
                  {svc.name.replace(/\s*\([^)]*\)/g, '').replace('Door-to-Door ', '')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Services Hub Entry Point */}
      <TouchableOpacity
        style={[styles.servicesHubBanner, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '40' }]}
        onPress={() => setShowServicesModal(true)}
        activeOpacity={0.8}
      >
        <View style={styles.servicesHubContent}>
          <Text style={[styles.servicesHubTitle, { color: colors.primary }]}>All 22 Transit Services Directory</Text>
          <Text style={[styles.servicesHubSubtitle, { color: colors.textMuted }]}>Metro, FOB Navigation, RailMadad, TTE Demo, Amenity guides</Text>
        </View>
        <View style={[styles.servicesHubBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.servicesHubBadgeText}>HUB</Text>
        </View>
      </TouchableOpacity>

      {/* 7. RailSathi Assistant Quick Actions */}
      <View style={[styles.assistantStrip, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.assistantStripTitle, { color: colors.textPrimary }]}>Rail Yatri AI Assistant</Text>
          <Text style={[styles.assistantStripSub, { color: colors.textMuted }]}>Grounded voice & chat assistance</Text>
        </View>
        <View style={styles.assistantButtonsRow}>
          <TouchableOpacity
            style={[styles.callButtonCircle, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/call')}
            accessibilityRole="button"
            accessibilityLabel="Call Rail Yatri voice assistant"
          >
            <Text style={styles.callButtonText}>CALL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.callButtonCircle, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/railsathi')}
            accessibilityRole="button"
            accessibilityLabel="Chat with Rail Yatri assistant"
          >
            <Text style={styles.callButtonText}>CHAT</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 8. My Tickets Specimen Preview (if available) */}
      {savedTickets.length > 0 && (
        <TouchableOpacity
          style={[styles.savedSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => router.push('/(tabs)/tickets')}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={[styles.savedSectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
              Active Specimen Ticket ({savedTickets.length})
            </Text>
            <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700' }}>View QR ➔</Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
            {savedTickets[0].trainName || 'Suburban EMU Local'}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
            {savedTickets[0].fromStation || savedTickets[0].fromCode || 'Origin'} ➔ {savedTickets[0].toStation || savedTickets[0].toCode || 'Destination'} · {savedTickets[0].travelClass || 'II'} Class
          </Text>
        </TouchableOpacity>
      )}

      {/* 7. Quick Nav: Network Map & FOB Wayfinding */}
      <View style={styles.toolsRow}>
        <TouchableOpacity
          style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => router.push('/map')}
          activeOpacity={0.8}
        >
          <Text style={[styles.toolCardTitle, { color: colors.textPrimary }]}>Railway Map</Text>
          <Text style={[styles.toolCardSubtitle, { color: colors.textMuted }]}>2D Topology & Metro lines</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => router.push('/wayfinding')}
          activeOpacity={0.8}
        >
          <Text style={[styles.toolCardTitle, { color: colors.textPrimary }]}>Station Wayfinding</Text>
          <Text style={[styles.toolCardSubtitle, { color: colors.textMuted }]}>Platform FOB & lifts</Text>
        </TouchableOpacity>
      </View>

      {/* ============================================================== */}
      {/* MODAL 1: Eight-City Selection Modal                            */}
      {/* ============================================================== */}
      <Modal visible={showCityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.cityModalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cityModalHeader}>
              <View>
                <Text style={[styles.cityModalTitle, { color: colors.textPrimary }]}>Select Transit Region</Text>
                <Text style={[styles.cityModalSubtitle, { color: colors.textMuted }]}>
                  Honest coverage tiers across 8 Indian transit metropolitan areas
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowCityModal(false)} style={styles.closeBtn}>
                <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.cityListScroll}>
              {Object.values(CITIES_REGISTRY).map(city => {
                const isSelected = selectedCityId === city.id;
                return (
                  <TouchableOpacity
                    key={city.id}
                    style={[
                      styles.cityListItem,
                      { borderColor: isSelected ? colors.primary : colors.cardBorder },
                      isSelected && { backgroundColor: colors.primary + '12' }
                    ]}
                    onPress={() => handleSelectCity(city.id)}
                  >
                    <View style={styles.cityItemHeader}>
                      <Text style={[styles.cityName, { color: colors.textPrimary }]}>
                        {city.name} ({city.nativeName})
                      </Text>
                      <View style={[styles.tierBadge, { backgroundColor: city.tier === 'FLAGSHIP_TIER1' ? '#16a34a20' : '#0284c720' }]}>
                        <Text style={[styles.tierBadgeText, { color: city.tier === 'FLAGSHIP_TIER1' ? '#16a34a' : '#0284c7' }]}>
                          {city.tier === 'FLAGSHIP_TIER1' ? 'FLAGSHIP' : 'REPRESENTATIVE'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.cityState, { color: colors.textMuted }]}>
                      {city.state} · {city.modes.map(m => m.name).join(' · ')}
                    </Text>
                    <Text style={[styles.cityProvenance, { color: colors.textSecondary }]}>
                      {city.provenanceTag} {city.provenanceExplanation}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 2: Theme Selector Modal                                   */}
      {/* ============================================================== */}
      <Modal visible={showThemeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.cityModalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cityModalHeader}>
              <View>
                <Text style={[styles.cityModalTitle, { color: colors.textPrimary }]}>Appearance & Livery</Text>
                <Text style={[styles.cityModalSubtitle, { color: colors.textMuted }]}>
                  Authentic Indian Railways color schemes & night commute mode
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowThemeModal(false)} style={styles.closeBtn}>
                <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.themeRow, { borderBottomColor: colors.cardBorder }]}>
              <Text style={[styles.themeRowLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
              <Switch value={isDarkMode} onValueChange={toggleDarkMode} trackColor={{ false: colors.cardBorder, true: colors.primary }} />
            </View>

            <Text style={[styles.themeSectionLabel, { color: colors.textMuted }]}>8 Livery Themes:</Text>
            <ScrollView style={styles.themeListScroll}>
              {(Object.keys(THEME_PALETTES) as ColorTheme[]).map(t => {
                const pal = THEME_PALETTES[t];
                const isSelected = colorTheme === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.themeItem,
                      { borderColor: isSelected ? colors.primary : colors.cardBorder },
                      isSelected && { backgroundColor: colors.primary + '14' }
                    ]}
                    onPress={() => setColorTheme(t)}
                  >
                    <View style={[styles.themeColorDot, { backgroundColor: pal.dark.primary }]} />
                    <Text style={[styles.themeItemText, { color: colors.textPrimary }]}>{pal.name}</Text>
                    {isSelected && <Text style={[styles.themeSelectedCheck, { color: colors.primary }]}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 3: Launch Sequence Animation Modal                       */}
      {/* ============================================================== */}
      <Modal visible={showLaunchModal} animationType="fade" transparent={false}>
        <NativeLaunchSequence onComplete={handleDismissLaunch} />
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 4: Onboarding & Profile Modal                            */}
      {/* ============================================================== */}
      <Modal visible={showOnboardingModal || showProfileModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.cityModalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cityModalHeader}>
              <View>
                <Text style={[styles.cityModalTitle, { color: colors.textPrimary }]}>
                  {showOnboardingModal ? 'Welcome to RailOne' : 'Passenger Profile'}
                </Text>
                <Text style={[styles.cityModalSubtitle, { color: colors.textMuted }]}>
                  Quick commuter setup & offline preferences
                </Text>
              </View>
              {!showOnboardingModal && (
                <TouchableOpacity onPress={() => setShowProfileModal(false)} style={styles.closeBtn}>
                  <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.onboardingScroll}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Commuter Name (Optional)</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.cardBorder }]}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={colors.textMuted}
                value={userName}
                onChangeText={setUserName}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mobile Number (Simulated UTS)</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.cardBorder }]}
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.textMuted}
                value={userPhone}
                onChangeText={setUserPhone}
                keyboardType="phone-pad"
              />

              <View style={[styles.consentRow, { borderColor: colors.cardBorder }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.consentTitle, { color: colors.textPrimary }]}>Location Station Proximity</Text>
                  <Text style={[styles.consentSub, { color: colors.textMuted }]}>
                    Auto-select nearest departure platform when walking inside station
                  </Text>
                </View>
                <Switch value={locationConsent} onValueChange={setLocationConsent} trackColor={{ false: colors.cardBorder, true: colors.primary }} />
              </View>

              <TouchableOpacity
                style={[styles.primaryModalBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  handleCompleteOnboarding(false);
                  setShowProfileModal(false);
                }}
              >
                <Text style={styles.primaryModalBtnText}>Save Preferences</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.guestBtn, { borderColor: colors.cardBorder }]}
                onPress={() => {
                  handleCompleteOnboarding(true);
                  setShowProfileModal(false);
                }}
              >
                <Text style={[styles.guestBtnText, { color: colors.textSecondary }]}>Continue as Commuter Guest</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Station Picker Modal */}
      <Modal visible={pickerVisible} animationType="slide" transparent={false}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder, backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Select {pickerTarget === 'from' ? 'Origin' : 'Destination'} Station
            </Text>
            <TouchableOpacity onPress={() => setPickerVisible(false)}>
              <Text style={[styles.modalCloseText, { color: colors.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search station name, code, or line..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={handleStationSearch}
              autoFocus
            />
          </View>

          <FlatList
            data={stationList}
            keyExtractor={(item: any) => item.code}
            renderItem={({ item }: { item: any }) => (
              <TouchableOpacity
                style={[styles.stationListItem, { borderBottomColor: colors.cardBorder }]}
                onPress={() => selectStation(item)}
              >
                <View style={styles.stationBadge}>
                  <Text style={styles.stationBadgeText}>{item.code}</Text>
                </View>
                <Text style={[styles.stationListName, { color: colors.textPrimary }]}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 6: 22-Services Directory Modal                           */}
      {/* ============================================================== */}
      <Modal visible={showServicesModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.cityModalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, maxHeight: '90%' }]}>
            <View style={styles.cityModalHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.cityModalTitle, { color: colors.textPrimary }]}>All 22 Transit Services</Text>
                <Text style={[styles.cityModalSubtitle, { color: colors.textMuted }]}>
                  Directory of Official & Intelligent Features
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowServicesModal(false)} style={styles.closeBtn}>
                <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.cardBorder, marginVertical: 8 }]}>
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search all 22 services..."
                placeholderTextColor={colors.textMuted}
                value={servicesSearch}
                onChangeText={setServicesSearch}
              />
            </View>

            {/* Category Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesCategoryRow}>
              {[
                { id: 'all', label: 'All (22)' },
                { id: 'ticketing', label: 'Ticketing (8)' },
                { id: 'navigation', label: 'Navigation (5)' },
                { id: 'assistance', label: 'Assistance (4)' },
                { id: 'insights', label: 'Insights (5)' }
              ].map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setServicesCategory(cat.id as any)}
                  style={[
                    styles.servicesCategoryPill,
                    {
                      backgroundColor: servicesCategory === cat.id ? colors.primary : colors.background,
                      borderColor: servicesCategory === cat.id ? colors.primary : colors.cardBorder
                    }
                  ]}
                >
                  <Text style={[styles.servicesCategoryPillText, { color: servicesCategory === cat.id ? '#ffffff' : colors.textPrimary }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Services List */}
            <ScrollView style={{ marginTop: 8 }}>
              {filteredNativeServices.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.serviceModalItem, { borderColor: colors.cardBorder, backgroundColor: colors.background }]}
                  onPress={() => handleServiceSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.serviceModalHeader}>
                    <Text style={[styles.serviceModalItemTitle, { color: colors.textPrimary }]}>{item.name}</Text>
                    {item.badge && (
                      <View style={[styles.serviceModalBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.serviceModalBadgeText, { color: colors.primary }]}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.serviceModalItemDesc, { color: colors.textMuted }]}>{item.description}</Text>
                  <View style={styles.serviceModalItemFooter}>
                    <Text style={[styles.serviceModalCategoryTag, { color: colors.textSecondary }]}>
                      {item.category.toUpperCase()}
                    </Text>
                    <Text style={[styles.serviceModalItemAction, { color: colors.primary }]}>
                      {item.isExternalLink ? 'Official External ↗' : 'Open Feature →'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1
  },
  cityChipText: {
    fontSize: 12,
    fontWeight: '800'
  },
  cityChipArrow: {
    fontSize: 10,
    fontWeight: '800'
  },
  topControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  langSwitch: {
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#00000010'
  },
  langOption: {
    paddingHorizontal: 7,
    paddingVertical: 5
  },
  langOptionText: {
    fontSize: 10,
    fontWeight: '800'
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  alertBanner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14
  },
  alertBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6
  },
  alertBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  alertText: {
    fontSize: 12,
    lineHeight: 18
  },
  callBanner: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  callBannerContent: {
    flex: 1,
    paddingRight: 12
  },
  callBannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 6
  },
  callBannerBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  callBannerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4
  },
  callBannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontStyle: 'italic'
  },
  callButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3
  },
  callButtonText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '900'
  },
  searchCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12
  },
  inputPrefix: {
    width: 50,
    justifyContent: 'center'
  },
  inputPrefixText: {
    fontSize: 11,
    fontWeight: '800'
  },
  stationTextContainer: {
    flex: 1
  },
  stationCode: {
    fontSize: 16,
    fontWeight: '800'
  },
  stationName: {
    fontSize: 12
  },
  swapContainer: {
    alignItems: 'center',
    marginVertical: -10,
    zIndex: 10
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  swapIcon: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 16
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900'
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600'
  },
  searchButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '700'
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32
  },
  toolCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1
  },
  toolCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2
  },
  toolCardSubtitle: {
    fontSize: 11
  },
  modalContainer: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 16
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '700'
  },
  searchBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 12
  },
  searchInput: {
    fontSize: 14
  },
  stationListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  stationBadge: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12
  },
  stationBadgeText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 11
  },
  stationListName: {
    fontSize: 14,
    fontWeight: '600'
  },
  activeCommuteCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14
  },
  activeCommuteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e'
  },
  activeCommuteTag: {
    fontSize: 10,
    fontWeight: '900',
    flex: 1
  },
  activeCommuteStatus: {
    fontSize: 11,
    fontWeight: '700'
  },
  activeCommuteTrain: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2
  },
  activeCommuteSub: {
    fontSize: 11
  },
  dateTimeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  datePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1
  },
  datePillText: {
    fontSize: 12,
    fontWeight: '700'
  },
  timeNowText: {
    fontSize: 11,
    marginLeft: 'auto'
  },
  savedSection: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14
  },
  savedSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10
  },
  savedPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  savedSearchPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  savedSearchText: {
    fontSize: 12,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end'
  },
  cityModalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '85%',
    padding: 20
  },
  cityModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#64748b40'
  },
  cityModalTitle: {
    fontSize: 17,
    fontWeight: '800'
  },
  cityModalSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  closeBtn: {
    padding: 6
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  cityListScroll: {
    marginTop: 12
  },
  cityListItem: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10
  },
  cityItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  cityName: {
    fontSize: 15,
    fontWeight: '800'
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  tierBadgeText: {
    fontSize: 9,
    fontWeight: '800'
  },
  cityState: {
    fontSize: 11,
    marginBottom: 4
  },
  cityProvenance: {
    fontSize: 11,
    lineHeight: 15
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  themeRowLabel: {
    fontSize: 14,
    fontWeight: '700'
  },
  themeSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 8
  },
  themeListScroll: {
    maxHeight: 280
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8
  },
  themeColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12
  },
  themeItemText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1
  },
  themeSelectedCheck: {
    fontSize: 14,
    fontWeight: '900'
  },
  launchScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  launchCenter: {
    alignItems: 'center',
    maxWidth: 320
  },
  launchLogoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  launchTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  launchSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24
  },
  launchFeedList: {
    gap: 10,
    marginBottom: 32,
    width: '100%'
  },
  launchFeedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  launchFeedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e'
  },
  launchFeedText: {
    color: '#cbd5e1',
    fontSize: 11
  },
  launchEnterBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24
  },
  launchEnterBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  onboardingScroll: {
    marginTop: 12
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 14,
    marginBottom: 16
  },
  consentTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  consentSub: {
    fontSize: 11,
    marginTop: 2
  },
  primaryModalBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8
  },
  primaryModalBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  guestBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1
  },
  guestBtnText: {
    fontSize: 13,
    fontWeight: '700'
  },
  assistantButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  bookingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 12
  },
  bookingGridItem: {
    flex: 1,
    minWidth: '47%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1
  },
  bookingGridTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2
  },
  bookingGridSub: {
    fontSize: 10
  },
  servicesHubBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 6
  },
  servicesHubContent: {
    flex: 1,
    paddingRight: 10
  },
  servicesHubTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2
  },
  servicesHubSubtitle: {
    fontSize: 10
  },
  servicesHubBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  servicesHubBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900'
  },
  servicesCategoryRow: {
    flexDirection: 'row',
    marginBottom: 8,
    maxHeight: 36
  },
  servicesCategoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8
  },
  servicesCategoryPillText: {
    fontSize: 11,
    fontWeight: '700'
  },
  squareGridSection: {
    marginTop: 14,
    marginBottom: 6
  },
  squareGridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2
  },
  squareGridTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  squareGridHubLink: {
    fontSize: 11,
    fontWeight: '700'
  },
  squareGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4
  },
  squareTile: {
    width: '25%',
    paddingHorizontal: 4,
    marginBottom: 10,
    alignItems: 'center'
  },
  squareIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4
  },
  squareTileLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 13,
    paddingHorizontal: 2,
    height: 26
  },
  assistantStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8
  },
  assistantStripTitle: {
    fontSize: 12,
    fontWeight: '800'
  },
  assistantStripSub: {
    fontSize: 10,
    marginTop: 2
  },
  serviceModalItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8
  },
  serviceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  serviceModalItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1
  },
  serviceModalBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6
  },
  serviceModalBadgeText: {
    fontSize: 9,
    fontWeight: '800'
  },
  serviceModalItemDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 6
  },
  serviceModalItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  serviceModalCategoryTag: {
    fontSize: 9,
    fontWeight: '700'
  },
  serviceModalItemAction: {
    fontSize: 11,
    fontWeight: '800'
  }
});
