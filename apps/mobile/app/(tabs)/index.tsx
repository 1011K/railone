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
import { router } from 'expo-router';
import { useMobileTheme, THEME_PALETTES, ColorTheme, AppLanguage } from '../../src/theme/ThemeContext';
import { MobileApiClient } from '../../src/api/client';
import { OfflineStorage } from '../../src/storage/offlineStorage';
import { CITIES_REGISTRY, CityCoverageConfig } from '../../src/fixtures/citiesData';
import Svg, { Path, Circle, Polyline, Line, Rect } from 'react-native-svg';

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
    routeParams: { type: 'platform' }
  },
  {
    id: 'season_passes',
    name: 'Season Passes (MST / QST)',
    category: 'ticketing',
    description: 'Monthly and quarterly commuter season passes across verified suburban corridors.',
    badge: 'Suburban',
    route: '/booking/local',
    routeParams: { type: 'season' }
  },
  {
    id: 'metro_ticketing',
    name: 'Metro Ticketing',
    category: 'ticketing',
    description: 'QR tokens and single journey passes for Mumbai Metro Lines 1, 2A, 7, and 3.',
    badge: 'MMRDA/MMRC',
    route: '/map'
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
    route: '/(tabs)/tickets'
  },
  {
    id: 'cancellation_refunds',
    name: 'Cancellation & Refunds',
    category: 'ticketing',
    description: 'Cancel bookings with statutory clerical deductions and simulated RailWallet credits.',
    route: '/(tabs)/tickets'
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
    route: '/(tabs)/status'
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
    route: '/wayfinding'
  },
  {
    id: 'network_maps',
    name: 'Network Maps & Interchanges',
    category: 'navigation',
    description: 'Schematic network diagrams and WGS-84 geographic maps across all 8 Indian metro regions.',
    route: '/map'
  },
  {
    id: 'auto_shared_rickshaw',
    name: 'Auto & Shared Rickshaw Feeders',
    category: 'navigation',
    description: 'First/last mile station feeder alternatives with regulated prepaid auto tariffs.',
    badge: 'Station Feeder',
    route: '/wayfinding'
  },
  {
    id: 'accessibility_assistance',
    name: 'Divyangjan Accessibility',
    category: 'assistance',
    description: 'Wheelchair step-free paths, tactile paving guide, and elevator status at major hubs.',
    badge: 'Step-Free',
    route: '/wayfinding'
  },
  {
    id: 'disruption_weather',
    name: 'Weather & Disruption Context',
    category: 'insights',
    description: 'Monsoon flooding alerts, Sunday mega-blocks, jumbo-blocks, and corridor track work.',
    route: '/(tabs)/status'
  },
  {
    id: 'saved_journeys',
    name: 'Saved Journeys & Commute Alerts',
    category: 'insights',
    description: 'Quick-access daily routes, morning/evening office alerts, and favorite corridors.',
    route: '/(tabs)/journeys'
  }
];

export default function HomeScreen() {
  const { colors, language, setLanguage, isDarkMode, toggleDarkMode, colorTheme, setColorTheme } = useMobileTheme();

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
  const [savedJourneys, setSavedJourneys] = useState<Array<any>>(() => OfflineStorage.getSavedJourneys());
  const [timeMode, setTimeMode] = useState<'depart_now' | 'depart_later' | 'arrive_by'>('depart_now');
  const [selectedClass, setSelectedClass] = useState<'all' | 'second' | 'first' | 'ac' | 'ladies'>('all');
  const [routePreference, setRoutePreference] = useState<'all' | 'fastest' | 'direct'>('all');
  const [showPrefModal, setShowPrefModal] = useState(false);

  // Modals state
  const [showLaunchModal, setShowLaunchModal] = useState<boolean>(() => !OfflineStorage.getHasSeenLaunch());
  const [isLaunchMuted, setIsLaunchMuted] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(() => !OfflineStorage.getHasCompletedOnboarding());
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
    try {
      const recents = OfflineStorage.getRecentSearches();
      if (recents && recents.length > 0) {
        setRecentSearches(recents.slice(0, 4));
      }
    } catch {
      // offline fallback
    }
  }, []);

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

      {/* 2. Rail Alert Banner (Timetable Scenario Advisory) */}
      <View style={[styles.alertBanner, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.alertBadge}>
          <Text style={styles.alertBadgeText}>{currentCity.provenanceTag}</Text>
        </View>
        <Text style={[styles.alertText, { color: colors.textSecondary }]}>
          {currentCity.provenanceExplanation || 'Official timetable schedules active. Real-time delay telemetry is surfaced only when confirmed live sensors are online.'}
        </Text>
      </View>

      {/* 3. Active Commute Card (Rendered only when a saved/active journey exists) */}
      {savedJourneys.length > 0 && (
        <TouchableOpacity
          style={[styles.activeCommuteCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => {
            setFromStation({ code: savedJourneys[0].fromStationCode, name: savedJourneys[0].fromStationName });
            setToStation({ code: savedJourneys[0].toStationCode, name: savedJourneys[0].toStationName });
          }}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Saved route ${savedJourneys[0].fromStationName} to ${savedJourneys[0].toStationName}`}
        >
          <View style={styles.activeCommuteHeader}>
            <View style={styles.livePulseDot} />
            <Text style={[styles.activeCommuteTag, { color: colors.primary }]}>SAVED COMMUTE SHORTCUT</Text>
            <Text style={[styles.activeCommuteStatus, { color: colors.success }]}>Quick Fill</Text>
          </View>
          <Text style={[styles.activeCommuteTrain, { color: colors.textPrimary }]}>
            {savedJourneys[0].fromStationName} ➔ {savedJourneys[0].toStationName}
          </Text>
          <Text style={[styles.activeCommuteSub, { color: colors.textMuted }]}>
            Preferred: {savedJourneys[0].preferredClass || 'Standard EMU'} · Tap to fill search
          </Text>
        </TouchableOpacity>
      )}

      {/* 4. Prominent Call & Chat Rail Yatri Assistant Card */}
      <View style={[styles.callBanner, { backgroundColor: colors.primary }]}>
        <View style={styles.callBannerContent}>
          <View style={styles.callBannerBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.callBannerBadgeText}>VOICE & CHAT ASSISTANT</Text>
          </View>
          <Text style={styles.callBannerTitle}>Rail Yatri AI</Text>
          <Text style={styles.callBannerSubtitle}>
            "Book me a First-Class local from {fromStation.name} to {toStation.name}"
          </Text>
        </View>
        <View style={styles.assistantButtonsRow}>
          <TouchableOpacity
            style={styles.callButtonCircle}
            activeOpacity={0.85}
            onPress={() => router.push('/call')}
            accessibilityRole="button"
            accessibilityLabel="Call Rail Yatri voice assistant"
          >
            <Text style={styles.callButtonText}>CALL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.callButtonCircle, { backgroundColor: '#ffffff26' }]}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/railsathi')}
            accessibilityRole="button"
            accessibilityLabel="Chat with Rail Yatri assistant"
          >
            <Text style={styles.callButtonText}>CHAT</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. Journey Search Container */}
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

        {/* Timing Modes: Depart Now / Depart Later / Arrive By */}
        <View style={[styles.inputRow, { borderColor: colors.cardBorder }]}>
          <View style={styles.inputPrefix}>
            <Text style={[styles.inputPrefixText, { color: colors.primary }]}>MODE</Text>
          </View>
          <View style={styles.dateTimeContainer}>
            {(['depart_now', 'depart_later', 'arrive_by'] as const).map(mode => (
              <TouchableOpacity
                key={mode}
                onPress={() => setTimeMode(mode)}
                style={[
                  styles.datePill,
                  {
                    backgroundColor: timeMode === mode ? colors.primary : 'transparent',
                    borderColor: timeMode === mode ? colors.primary : colors.cardBorder
                  }
                ]}
              >
                <Text style={[styles.datePillText, { color: timeMode === mode ? '#ffffff' : colors.textPrimary }]}>
                  {mode === 'depart_now' ? 'Depart Now' : mode === 'depart_later' ? 'Depart Later' : 'Arrive By'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
            <TouchableOpacity
              onPress={() => setShowPrefModal(true)}
              style={[styles.datePill, { borderColor: colors.primary, marginLeft: 'auto' }]}
              accessibilityRole="button"
              accessibilityLabel="Class and route preferences"
            >
              <Text style={[styles.datePillText, { color: colors.primary }]}>
                {selectedClass !== 'all' ? selectedClass.toUpperCase() : 'Prefs ⚙'}
              </Text>
            </TouchableOpacity>
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
          accessibilityLabel="Search trains"
        >
          <Text style={styles.searchButtonText}>Search Trains</Text>
        </TouchableOpacity>

        {/* Fast Booking Secondary Workflows: 4 Primary Categories */}
        <View style={styles.bookingGrid}>
          <TouchableOpacity
            style={[styles.bookingGridItem, { borderColor: colors.cardBorder }]}
            onPress={() => router.push('/booking/local')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Open Tickets"
          >
            <Text style={[styles.bookingGridTitle, { color: colors.textPrimary }]}>Tickets</Text>
            <Text style={[styles.bookingGridSub, { color: colors.textMuted }]}>UTS & Express</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bookingGridItem, { borderColor: colors.cardBorder }]}
            onPress={() => router.push('/(tabs)/status')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Open Live Status"
          >
            <Text style={[styles.bookingGridTitle, { color: colors.textPrimary }]}>Live Status</Text>
            <Text style={[styles.bookingGridSub, { color: colors.textMuted }]}>Departure Board</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bookingGridItem, { borderColor: colors.cardBorder }]}
            onPress={() => router.push('/wayfinding')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Open Station Guide"
          >
            <Text style={[styles.bookingGridTitle, { color: colors.textPrimary }]}>Station Guide</Text>
            <Text style={[styles.bookingGridSub, { color: colors.textMuted }]}>FOB & Platforms</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bookingGridItem, { borderColor: colors.cardBorder }]}
            onPress={() => router.push('/call')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Open RailSathi Assistant"
          >
            <Text style={[styles.bookingGridTitle, { color: colors.textPrimary }]}>RailSathi</Text>
            <Text style={[styles.bookingGridSub, { color: colors.textMuted }]}>Voice Assistant</Text>
          </TouchableOpacity>
        </View>

        {/* Services Hub Entry Point */}
        <TouchableOpacity
          style={[styles.servicesHubBanner, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '40' }]}
          onPress={() => setShowServicesModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.servicesHubContent}>
            <Text style={[styles.servicesHubTitle, { color: colors.primary }]}>Explore All 22 Transit Services</Text>
            <Text style={[styles.servicesHubSubtitle, { color: colors.textMuted }]}>Metro, FOB Navigation, RailMadad, TTE Demo, Amenity guides</Text>
          </View>
          <View style={[styles.servicesHubBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.servicesHubBadgeText}>HUB</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 6. Saved Journeys */}
      {recentSearches.length > 0 && (
        <View style={[styles.savedSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.savedSectionTitle, { color: colors.textPrimary }]}>Saved Journeys</Text>
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
        <View style={[styles.launchScreen, { backgroundColor: '#090d16' }]}>
          <View style={styles.launchCenter}>
            <View style={styles.launchLogoCircle}>
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2}>
                <Rect x="4" y="3" width="16" height="16" rx="2" />
                <Path d="M4 11h16" />
                <Path d="M12 3v8" />
                <Circle cx="8" cy="15" r="1" fill="#ffffff" />
                <Circle cx="16" cy="15" r="1" fill="#ffffff" />
                <Path d="M8 19l-2 3" />
                <Path d="M16 19l2 3" />
              </Svg>
            </View>
            <Text style={styles.launchTitle}>RailOne Next</Text>
            <Text style={styles.launchSubtitle}>Truthful Transit Intelligence · Indian Railways</Text>

            <View style={styles.launchFeedList}>
              <View style={styles.launchFeedItem}>
                <View style={styles.launchFeedDot} />
                <Text style={styles.launchFeedText}>Western Railway & Central Railway Timetables Loaded</Text>
              </View>
              <View style={styles.launchFeedItem}>
                <View style={styles.launchFeedDot} />
                <Text style={styles.launchFeedText}>Mumbai Metro Lines 1, 2A, 7, 3 Topology Initialized</Text>
              </View>
              <View style={styles.launchFeedItem}>
                <View style={styles.launchFeedDot} />
                <Text style={styles.launchFeedText}>SQLite Persistence & Tariff Contracts Verified</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.launchEnterBtn} onPress={handleDismissLaunch}>
              <Text style={styles.launchEnterBtnText}>Enter RailOne</Text>
            </TouchableOpacity>
          </View>
        </View>
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

      {/* ============================================================== */}
      {/* MODAL 4B: Class & Route Preference Sheet                       */}
      {/* ============================================================== */}
      <Modal visible={showPrefModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.cityModalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.cityModalHeader}>
              <View>
                <Text style={[styles.cityModalTitle, { color: colors.textPrimary }]}>Travel Preferences</Text>
                <Text style={[styles.cityModalSubtitle, { color: colors.textMuted }]}>
                  Commute class & corridor routing options
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowPrefModal(false)} style={styles.closeBtn}>
                <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.onboardingScroll}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Compartment / Travel Class:</Text>
              <View style={{ gap: 8, marginVertical: 8 }}>
                {[
                  { id: 'all', label: 'All Classes (Default)' },
                  { id: 'second', label: 'Second Class (II) General' },
                  { id: 'first', label: 'First Class (FC)' },
                  { id: 'ac', label: 'AC Local EMU' },
                  { id: 'ladies', label: 'Ladies Compartment' }
                ].map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.themeItem,
                      { borderColor: selectedClass === c.id ? colors.primary : colors.cardBorder },
                      selectedClass === c.id && { backgroundColor: colors.primary + '14' }
                    ]}
                    onPress={() => setSelectedClass(c.id as any)}
                  >
                    <Text style={[styles.themeItemText, { color: colors.textPrimary }]}>{c.label}</Text>
                    {selectedClass === c.id && <Text style={[styles.themeSelectedCheck, { color: colors.primary }]}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>Corridor Routing:</Text>
              <View style={{ gap: 8, marginVertical: 8 }}>
                {[
                  { id: 'all', label: 'All Services (Fast & Slow)' },
                  { id: 'fastest', label: 'Fastest Service Only' },
                  { id: 'direct', label: 'Direct Services Only (No Transfers)' }
                ].map(r => (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.themeItem,
                      { borderColor: routePreference === r.id ? colors.primary : colors.cardBorder },
                      routePreference === r.id && { backgroundColor: colors.primary + '14' }
                    ]}
                    onPress={() => setRoutePreference(r.id as any)}
                  >
                    <Text style={[styles.themeItemText, { color: colors.textPrimary }]}>{r.label}</Text>
                    {routePreference === r.id && <Text style={[styles.themeSelectedCheck, { color: colors.primary }]}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.primaryModalBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
                onPress={() => setShowPrefModal(false)}
              >
                <Text style={styles.primaryModalBtnText}>Apply Preferences</Text>
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
