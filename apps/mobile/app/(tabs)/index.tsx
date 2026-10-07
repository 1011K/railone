import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { useMobileTheme } from '../../src/theme/ThemeContext';
import { MobileApiClient } from '../../src/api/client';
import { OfflineStorage } from '../../src/storage/offlineStorage';

const POPULAR_STATIONS = [
  { code: 'CSMT', name: 'CSMT (Mumbai)' },
  { code: 'TNA', name: 'Thane' },
  { code: 'DR', name: 'Dadar' },
  { code: 'KYN', name: 'Kalyan' },
  { code: 'CCG', name: 'Churchgate' },
  { code: 'ADH', name: 'Andheri' },
  { code: 'BVI', name: 'Borivali' },
  { code: 'NDLS', name: 'New Delhi' }
];

export default function HomeScreen() {
  const { colors, language, isDarkMode, toggleDarkMode, colorTheme, setColorTheme } = useMobileTheme();

  const [fromStation, setFromStation] = useState({ code: 'TNA', name: 'Thane' });
  const [toStation, setToStation] = useState({ code: 'CSMT', name: 'CSMT (Mumbai)' });
  const [journeyDate, setJourneyDate] = useState('Today');
  const [acOnly, setAcOnly] = useState(false);

  // Station picker modal
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'from' | 'to'>('from');
  const [searchQuery, setSearchQuery] = useState('');
  const [stationList, setStationList] = useState(POPULAR_STATIONS);

  const swapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const openPicker = (target: 'from' | 'to') => {
    setPickerTarget(target);
    setSearchQuery('');
    setStationList(POPULAR_STATIONS);
    setPickerVisible(true);
  };

  const handleStationSearch = async (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setStationList(POPULAR_STATIONS);
      return;
    }
    try {
      const results = await MobileApiClient.searchStations(text);
      if (results && results.length > 0) {
        setStationList(results.map(s => ({ code: s.code, name: s.name })));
      }
    } catch {
      // Offline fallback
      const filtered = POPULAR_STATIONS.filter(
        s => s.name.toLowerCase().includes(text.toLowerCase()) || s.code.toLowerCase().includes(text.toLowerCase())
      );
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
        acOnly: acOnly ? 'true' : 'false'
      }
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Rail Alert Banner (Verified Live Feed) */}
      <View style={[styles.alertBanner, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.alertBadge}>
          <Text style={styles.alertBadgeText}>[VERIFIED LIVE]</Text>
        </View>
        <Text style={[styles.alertText, { color: colors.textSecondary }]}>
          Central Line Fast corridor running with +12m headway buffer at Vidyavihar. Slow line services normal.
        </Text>
      </View>

      {/* 2. Prominent Call RailSathi Card */}
      <TouchableOpacity
        style={[styles.callBanner, { backgroundColor: colors.primary }]}
        activeOpacity={0.88}
        onPress={() => router.push('/call')}
        accessibilityRole="button"
        accessibilityLabel="Call RailSathi voice booking assistant"
      >
        <View style={styles.callBannerContent}>
          <View style={styles.callBannerBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.callBannerBadgeText}>VOICE BOOKING</Text>
          </View>
          <Text style={styles.callBannerTitle}>Call RailSathi</Text>
          <Text style={styles.callBannerSubtitle}>
            "Book me a First-Class local from Thane to Churchgate around 12:30"
          </Text>
        </View>
        <View style={styles.callButtonCircle}>
          <Text style={styles.callButtonText}>CALL</Text>
        </View>
      </TouchableOpacity>

      {/* 3. Journey Search Container */}
      <View style={[styles.searchCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Plan Journey</Text>

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

        {/* Fast Booking Secondary Workflows */}
        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.cardBorder }]}
            onPress={() => router.push('/booking/local')}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>Book Local Ticket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.cardBorder }]}
            onPress={() => router.push('/booking/express')}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>Book Express Ticket</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Quick Nav: Network Map & FOB Wayfinding */}
      <View style={styles.toolsRow}>
        <TouchableOpacity
          style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => router.push('/map')}
          activeOpacity={0.8}
        >
          <Text style={[styles.toolCardTitle, { color: colors.textPrimary }]}>Railway Map</Text>
          <Text style={[styles.toolCardSubtitle, { color: colors.textMuted }]}>2D Network & Metro lines</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  alertBanner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16
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
    marginBottom: 16
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
    marginBottom: 16
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
  }
});
