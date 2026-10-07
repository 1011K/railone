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
  Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMobileTheme } from '../../src/theme/ThemeContext';
import { MobileApiClient } from '../../src/api/client';
import { OfflineStorage } from '../../src/storage/offlineStorage';
import { STATUTORY_REGULATIONS } from '../../src/constants/regulations';

type TicketKind = 'SINGLE' | 'RETURN' | 'SEASON_MST' | 'PLATFORM' | 'METRO_TOKEN';
type SuburbanClass = 'II' | 'I' | 'AC_LOCAL';

const POPULAR_SUBURBAN_STATIONS = [
  { code: 'CSMT', name: 'CSMT Terminus', line: 'Central Main' },
  { code: 'DR', name: 'Dadar Junction', line: 'Central / Western' },
  { code: 'TNA', name: 'Thane', line: 'Central Main' },
  { code: 'KYN', name: 'Kalyan Jn', line: 'Central Main' },
  { code: 'CCG', name: 'Churchgate', line: 'Western' },
  { code: 'BA', name: 'Bandra', line: 'Western' },
  { code: 'ADH', name: 'Andheri', line: 'Western' },
  { code: 'BVI', name: 'Borivali', line: 'Western' },
  { code: 'CLA', name: 'Kurla Jn', line: 'Central / Harbour' },
  { code: 'PNVL', name: 'Panvel', line: 'Harbour' }
];

export default function LocalBookingScreen() {
  const { colors } = useMobileTheme();
  const params = useLocalSearchParams<{
    from?: string;
    to?: string;
    classType?: string;
    mode?: string;
    trainNumber?: string;
    trainName?: string;
  }>();

  // Booking parameters
  const [ticketKind, setTicketKind] = useState<TicketKind>((params.mode as TicketKind) || 'SINGLE');
  const [suburbanClass, setSuburbanClass] = useState<SuburbanClass>(
    (params.classType as SuburbanClass) || 'II'
  );
  const [fromStation, setFromStation] = useState({
    code: params.from || 'TNA',
    name: params.from === 'CCG' ? 'Churchgate' : 'Thane'
  });
  const [toStation, setToStation] = useState({
    code: params.to || 'CSMT',
    name: params.to === 'TNA' ? 'Thane' : 'CSMT Terminus'
  });
  const [passengerCount, setPassengerCount] = useState<number>(1);

  // Station picker modal
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'from' | 'to'>('from');
  const [searchQuery, setSearchQuery] = useState('');
  const [stationList, setStationList] = useState(POPULAR_SUBURBAN_STATIONS);

  // Fare quote state
  const [distanceKm, setDistanceKm] = useState(34);
  const [unitFare, setUnitFare] = useState(10);
  const [calculatingFare, setCalculatingFare] = useState(false);

  // Issuance state
  const [issuedTicket, setIssuedTicket] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute distance and fetch fare quote
  useEffect(() => {
    let active = true;

    async function updateFare() {
      setCalculatingFare(true);
      if (ticketKind === 'PLATFORM') {
        setDistanceKm(0);
        setUnitFare(10);
        setCalculatingFare(false);
        return;
      }
      const isMetro = ticketKind === 'METRO_TOKEN';
      const serviceType = isMetro ? 'metro' : 'suburban';

      try {
        const quote = await MobileApiClient.getFareQuote(
          serviceType,
          undefined,
          suburbanClass,
          false,
          fromStation.code,
          toStation.code
        );
        if (active && quote) {
          const dist = quote.calculatedDistance || quote.distanceKm || 34;
          setDistanceKm(dist);
          let base = quote.totalFare || 10;
          if (ticketKind === 'RETURN') base = Math.round(base * 1.9);
          if (ticketKind === 'SEASON_MST') {
            base = suburbanClass === 'AC_LOCAL' ? 1450 : suburbanClass === 'I' ? 670 : 185;
          }
          setUnitFare(base);
        }
      } catch {
        // Deterministic station distance calculation fallback
        const fc = fromStation.code.toUpperCase();
        const tc = toStation.code.toUpperCase();
        let estDist = 34;
        if (fc === tc) estDist = 5;
        else if ((fc === 'TNA' && tc === 'CCG') || (fc === 'CCG' && tc === 'TNA')) estDist = 35;
        else if ((fc === 'TNA' && tc === 'CSMT') || (fc === 'CSMT' && tc === 'TNA')) estDist = 34;
        else if ((fc === 'CCG' && tc === 'BVI') || (fc === 'BVI' && tc === 'CCG')) estDist = 34;
        else if ((fc === 'DR' && tc === 'KYN') || (fc === 'KYN' && tc === 'DR')) estDist = 44;
        else if ((fc === 'ADH' && tc === 'CCG') || (fc === 'CCG' && tc === 'ADH')) estDist = 22;
        else if ((fc === 'TNA' && tc === 'KYN') || (fc === 'KYN' && tc === 'TNA')) estDist = 20;
        else if ((fc === 'DR' && tc === 'CCG') || (fc === 'CCG' && tc === 'DR')) estDist = 10;
        else estDist = 28;

        setDistanceKm(estDist);

        let fallback = 10;
        if (ticketKind === 'METRO_TOKEN') {
          fallback = estDist <= 12 ? 20 : estDist <= 18 ? 30 : 40;
        } else if (suburbanClass === 'AC_LOCAL') {
          fallback = estDist <= 10 ? 35 : estDist <= 25 ? 70 : estDist <= 35 ? 95 : 135;
        } else if (suburbanClass === 'I') {
          fallback = estDist <= 10 ? 50 : estDist <= 25 ? 85 : estDist <= 35 ? 105 : 145;
        } else {
          fallback = estDist <= 10 ? 5 : estDist <= 25 ? 10 : estDist <= 35 ? 10 : 15;
        }
        if (ticketKind === 'RETURN') fallback = Math.round(fallback * 1.9);
        if (ticketKind === 'SEASON_MST') {
          fallback = suburbanClass === 'AC_LOCAL' ? 1450 : suburbanClass === 'I' ? 670 : 185;
        }
        if (active) setUnitFare(fallback);
      } finally {
        if (active) setCalculatingFare(false);
      }
    }

    updateFare();
    return () => {
      active = false;
    };
  }, [fromStation.code, toStation.code, suburbanClass, ticketKind]);

  const totalFare = unitFare * passengerCount;

  const handleOpenPicker = (target: 'from' | 'to') => {
    setPickerTarget(target);
    setSearchQuery('');
    setStationList(POPULAR_SUBURBAN_STATIONS);
    setPickerVisible(true);
  };

  const handleStationSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setStationList(POPULAR_SUBURBAN_STATIONS);
      return;
    }
    try {
      const results = await MobileApiClient.searchStations(query);
      if (results && results.length > 0) {
        setStationList(results.map(s => ({ code: s.code, name: s.name, line: s.line || 'Suburban' })));
      }
    } catch {
      const filtered = POPULAR_SUBURBAN_STATIONS.filter(
        s => s.name.toLowerCase().includes(query.toLowerCase()) || s.code.toLowerCase().includes(query.toLowerCase())
      );
      setStationList(filtered);
    }
  };

  const handleSelectStation = (station: { code: string; name: string }) => {
    if (pickerTarget === 'from') {
      setFromStation(station);
    } else {
      setToStation(station);
    }
    setPickerVisible(false);
  };

  const swapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const handleIssueTicket = async () => {
    if (ticketKind !== 'PLATFORM' && fromStation.code === toStation.code) {
      Alert.alert('Invalid Journey', 'Origin and destination stations cannot be identical.');
      return;
    }

    setIsSubmitting(true);
    try {
      const idempotencyKey = `LOC-MOB-${Date.now()}`;
      const resolvedTrainNumber = params.trainNumber
        ? params.trainNumber
        : ticketKind === 'PLATFORM'
        ? 'PLATFORM'
        : ticketKind === 'METRO_TOKEN'
        ? 'METRO'
        : ticketKind === 'SEASON_MST'
        ? 'MST-PASS'
        : ticketKind === 'RETURN'
        ? 'UTS-RETURN'
        : 'UNRESERVED';

      const resolvedTrainName = params.trainName
        ? params.trainName
        : ticketKind === 'PLATFORM'
        ? `Platform Permit (${fromStation.name})`
        : ticketKind === 'METRO_TOKEN'
        ? 'Mumbai Metro Demo Token'
        : ticketKind === 'SEASON_MST'
        ? `Suburban Monthly Season Ticket (${suburbanClass === 'AC_LOCAL' ? 'AC' : suburbanClass === 'I' ? 'First' : 'Second'} Class)`
        : ticketKind === 'RETURN'
        ? `Suburban Return (${suburbanClass === 'AC_LOCAL' ? 'AC' : suburbanClass === 'I' ? 'First' : 'Second'} Class)`
        : `Suburban Unreserved (${suburbanClass === 'AC_LOCAL' ? 'AC' : suburbanClass === 'I' ? 'First' : 'Second'} Class)`;

      const booking = await MobileApiClient.createBooking({
        trainNumber: resolvedTrainNumber,
        ticketType: ticketKind === 'PLATFORM'
          ? 'PLATFORM_TICKET'
          : ticketKind === 'METRO_TOKEN'
          ? 'METRO_TOKEN'
          : ticketKind === 'SEASON_MST'
          ? 'SEASON_MST'
          : ticketKind === 'RETURN'
          ? 'RETURN_JOURNEY'
          : 'UNRESERVED_SUBURBAN',
        journeyDate: new Date().toISOString().split('T')[0],
        fromStationCode: fromStation.code,
        toStationCode: ticketKind === 'PLATFORM' ? fromStation.code : toStation.code,
        classBooked: ticketKind === 'PLATFORM' ? 'II' : suburbanClass,
        passengers: Array.from({ length: passengerCount }, (_, i) => ({
          name: `Commuter ${i + 1}`,
          age: 28,
          gender: 'M'
        })),
        idempotencyKey,
        paymentMethod: 'UPI_SIMULATED'
      });

      const issued = {
        id: booking.id,
        pnr: booking.pnr,
        ticketKind,
        suburbanClass: ticketKind === 'PLATFORM' ? 'II' : suburbanClass,
        fromStation: fromStation.name,
        fromCode: fromStation.code,
        toStation: ticketKind === 'PLATFORM' ? `${fromStation.name} Concourse` : toStation.name,
        toCode: ticketKind === 'PLATFORM' ? fromStation.code : toStation.code,
        distanceKm,
        totalFare,
        passengerCount,
        issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        validUntil: ticketKind === 'PLATFORM'
          ? '2 Hours from Issue'
          : ticketKind === 'SEASON_MST'
          ? '30 Days From Issue'
          : '23:59 Today',
        qrPayload: booking.qrPayload || `UTS-DEMO-${booking.pnr}`
      };

      await OfflineStorage.saveTicket({
        id: issued.id,
        pnr: issued.pnr,
        trainNumber: resolvedTrainNumber,
        trainName: resolvedTrainName,
        fromStationName: fromStation.name,
        toStationName: ticketKind === 'PLATFORM' ? `${fromStation.name} Concourse` : toStation.name,
        journeyDate: new Date().toISOString().split('T')[0],
        classBooked: ticketKind === 'PLATFORM' ? 'II' : suburbanClass,
        farePaid: totalFare,
        qrPayload: issued.qrPayload,
        cachedAt: new Date().toISOString()
      });

      setIssuedTicket(issued);
    } catch (err: any) {
      Alert.alert('Booking Error', err.message || 'Failed to authorize booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (issuedTicket) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Confirmed Specimen Ticket Card */}
        <View style={[styles.ticketCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <View style={[styles.ticketHeader, { backgroundColor: colors.primary }]}>
            <Text style={styles.ticketHeaderTitle}>
              {ticketKind === 'METRO_TOKEN'
                ? 'MUMBAI METRO QR TOKEN'
                : ticketKind === 'SEASON_MST'
                ? 'SUBURBAN MONTHLY SEASON TICKET (MST)'
                : ticketKind === 'PLATFORM'
                ? 'STATION PLATFORM ACCESS PERMIT'
                : ticketKind === 'RETURN'
                ? 'SUBURBAN RETURN JOURNEY TICKET'
                : 'SUBURBAN UNRESERVED JOURNEY TICKET'}
            </Text>
            <View style={styles.specimenBadge}>
              <Text style={styles.specimenBadgeText}>[DEMO / NOT VALID FOR TRAVEL]</Text>
            </View>
          </View>

          <View style={styles.ticketBody}>
            {/* Origin & Destination Display */}
            <View style={styles.ticketRouteRow}>
              <View style={styles.ticketStationBlock}>
                <Text style={[styles.ticketStationCode, { color: colors.textPrimary }]}>
                  {issuedTicket.fromCode}
                </Text>
                <Text style={[styles.ticketStationName, { color: colors.textSecondary }]}>
                  {issuedTicket.fromStation}
                </Text>
              </View>

              <View style={styles.routeArrowBlock}>
                <Text style={[styles.routeArrow, { color: colors.primary }]}>➔</Text>
                <Text style={[styles.distanceText, { color: colors.textMuted }]}>
                  {issuedTicket.distanceKm} km
                </Text>
              </View>

              <View style={[styles.ticketStationBlock, { alignItems: 'flex-end' }]}>
                <Text style={[styles.ticketStationCode, { color: colors.textPrimary }]}>
                  {issuedTicket.toCode}
                </Text>
                <Text style={[styles.ticketStationName, { color: colors.textSecondary }]}>
                  {issuedTicket.toStation}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

            {/* Specimen QR Graphic Block */}
            <View style={styles.qrContainer}>
              <View style={[styles.qrMockBox, { borderColor: colors.primary, backgroundColor: '#FFFFFF' }]}>
                <View style={styles.qrInnerDesign}>
                  <Text style={styles.qrMockCenterText}>UTS QR</Text>
                  <Text style={styles.qrMockCodeText}>{issuedTicket.pnr}</Text>
                </View>
                <View style={styles.watermarkOverlay}>
                  <Text style={styles.watermarkText}>DEMO ONLY</Text>
                </View>
              </View>
              <Text style={[styles.qrCaption, { color: colors.textMuted }]}>
                Scan at Automated Fare Collection (AFC) Gate / Handheld HHT
              </Text>
            </View>

            {/* Ticket Details Grid */}
            <View style={[styles.ticketGrid, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
              <View style={styles.gridRow}>
                <Text style={[styles.gridLabel, { color: colors.textMuted }]}>UTS Reference:</Text>
                <Text style={[styles.gridValue, { color: colors.textPrimary }]}>{issuedTicket.pnr}</Text>
              </View>

              <View style={styles.gridRow}>
                <Text style={[styles.gridLabel, { color: colors.textMuted }]}>Class / Service:</Text>
                <Text style={[styles.gridValue, { color: colors.textPrimary }]}>
                  {ticketKind === 'PLATFORM'
                    ? 'Platform Concourse Access'
                    : ticketKind === 'METRO_TOKEN'
                    ? 'Mumbai Metro Standard'
                    : issuedTicket.suburbanClass === 'AC_LOCAL'
                    ? 'AC EMU Local'
                    : issuedTicket.suburbanClass === 'I'
                    ? 'First Class (FC)'
                    : 'Second Class (II)'}
                </Text>
              </View>

              <View style={styles.gridRow}>
                <Text style={[styles.gridLabel, { color: colors.textMuted }]}>Passengers:</Text>
                <Text style={[styles.gridValue, { color: colors.textPrimary }]}>
                  {issuedTicket.passengerCount} Adult(s)
                </Text>
              </View>

              <View style={styles.gridRow}>
                <Text style={[styles.gridLabel, { color: colors.textMuted }]}>Total Fare Paid:</Text>
                <Text style={[styles.gridValueBold, { color: colors.success }]}>
                  ₹{issuedTicket.totalFare}
                </Text>
              </View>

              <View style={styles.gridRow}>
                <Text style={[styles.gridLabel, { color: colors.textMuted }]}>Validity:</Text>
                <Text style={[styles.gridValue, { color: colors.accent }]}>
                  {issuedTicket.validUntil}
                </Text>
              </View>
            </View>

            {/* Statutory Railways Act 1989 Section 137/138 Disclaimer */}
            <View style={[styles.legalBox, { backgroundColor: colors.warning + '18', borderColor: colors.warning }]}>
              <Text style={[styles.legalTitle, { color: colors.warning }]}>
                STATUTORY RAILWAY REGULATIONS (AMENDED 20 JUNE 2026)
              </Text>
              <Text style={[styles.legalText, { color: colors.textSecondary }]}>
                {STATUTORY_REGULATIONS.passengerWarning}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/tickets')}
              >
                <Text style={styles.primaryActionBtnText}>View in My Tickets</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryActionBtn, { borderColor: colors.cardBorder }]}
                onPress={() => setIssuedTicket(null)}
              >
                <Text style={[styles.secondaryActionBtnText, { color: colors.textPrimary }]}>
                  Book Another Ticket
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Ticket Type Segmented Selector */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>Ticket Type</Text>
        <View style={styles.segmentedRow}>
          <TouchableOpacity
            style={[
              styles.segmentItem,
              ticketKind === 'SINGLE' && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setTicketKind('SINGLE')}
          >
            <Text
              style={[
                styles.segmentText,
                { color: ticketKind === 'SINGLE' ? '#FFFFFF' : colors.textSecondary }
              ]}
            >
              Single
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentItem,
              ticketKind === 'RETURN' && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setTicketKind('RETURN')}
          >
            <Text
              style={[
                styles.segmentText,
                { color: ticketKind === 'RETURN' ? '#FFFFFF' : colors.textSecondary }
              ]}
            >
              Return
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentItem,
              ticketKind === 'SEASON_MST' && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setTicketKind('SEASON_MST')}
          >
            <Text
              style={[
                styles.segmentText,
                { color: ticketKind === 'SEASON_MST' ? '#FFFFFF' : colors.textSecondary }
              ]}
            >
              Season Pass
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentItem,
              ticketKind === 'PLATFORM' && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setTicketKind('PLATFORM')}
          >
            <Text
              style={[
                styles.segmentText,
                { color: ticketKind === 'PLATFORM' ? '#FFFFFF' : colors.textSecondary }
              ]}
            >
              Platform
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentItem,
              ticketKind === 'METRO_TOKEN' && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setTicketKind('METRO_TOKEN')}
          >
            <Text
              style={[
                styles.segmentText,
                { color: ticketKind === 'METRO_TOKEN' ? '#FFFFFF' : colors.textSecondary }
              ]}
            >
              Metro QR
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Route Stations Picker */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>Corridor / Stations</Text>

        <View style={styles.stationSelectRow}>
          <TouchableOpacity
            style={[styles.stationPickerBox, { borderColor: colors.cardBorder, backgroundColor: colors.background }]}
            onPress={() => handleOpenPicker('from')}
          >
            <Text style={[styles.pickerLabel, { color: colors.textMuted }]}>
              {ticketKind === 'PLATFORM' ? 'STATION' : 'FROM STATION'}
            </Text>
            <Text style={[styles.pickerValueCode, { color: colors.primary }]}>{fromStation.code}</Text>
            <Text style={[styles.pickerValueName, { color: colors.textPrimary }]} numberOfLines={1}>
              {fromStation.name}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.swapBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: ticketKind === 'PLATFORM' ? 0.3 : 1 }]}
            onPress={ticketKind === 'PLATFORM' ? undefined : swapStations}
            disabled={ticketKind === 'PLATFORM'}
          >
            <Text style={[styles.swapBtnText, { color: colors.primary }]}>⇄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.stationPickerBox, { borderColor: colors.cardBorder, backgroundColor: colors.background, opacity: ticketKind === 'PLATFORM' ? 0.5 : 1 }]}
            onPress={ticketKind === 'PLATFORM' ? undefined : () => handleOpenPicker('to')}
            disabled={ticketKind === 'PLATFORM'}
          >
            <Text style={[styles.pickerLabel, { color: colors.textMuted }]}>
              {ticketKind === 'PLATFORM' ? 'PERMIT AREA' : 'TO STATION'}
            </Text>
            <Text style={[styles.pickerValueCode, { color: colors.primary }]}>
              {ticketKind === 'PLATFORM' ? 'PF' : toStation.code}
            </Text>
            <Text style={[styles.pickerValueName, { color: colors.textPrimary }]} numberOfLines={1}>
              {ticketKind === 'PLATFORM' ? 'Platforms & Concourse' : toStation.name}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.distanceBadgeRow}>
          <Text style={[styles.distanceLabel, { color: colors.textMuted }]}>
            {ticketKind === 'PLATFORM' ? 'Platform Validity: ' : 'Rail Distance: '}
            <Text style={{ color: colors.textPrimary, fontWeight: 'bold' }}>
              {ticketKind === 'PLATFORM' ? '2 Hours' : `${distanceKm} km`}
            </Text>
          </Text>
          <Text style={[styles.verifiedTag, { color: colors.accent }]}>[OFFICIAL_TIMETABLE]</Text>
        </View>
      </View>

      {/* 3. Class Preference Selector */}
      {ticketKind !== 'METRO_TOKEN' && ticketKind !== 'PLATFORM' && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>Suburban Travel Class</Text>

          <View style={styles.classCardsRow}>
            <TouchableOpacity
              style={[
                styles.classOptionCard,
                { borderColor: suburbanClass === 'II' ? colors.primary : colors.cardBorder },
                suburbanClass === 'II' && { backgroundColor: colors.primary + '12' }
              ]}
              onPress={() => setSuburbanClass('II')}
            >
              <Text style={[styles.classOptionCode, { color: colors.textPrimary }]}>II Class</Text>
              <Text style={[styles.classOptionDesc, { color: colors.textMuted }]}>General Suburban</Text>
              <Text style={[styles.classOptionPrice, { color: colors.primary }]}>Standard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.classOptionCard,
                { borderColor: suburbanClass === 'I' ? colors.primary : colors.cardBorder },
                suburbanClass === 'I' && { backgroundColor: colors.primary + '12' }
              ]}
              onPress={() => setSuburbanClass('I')}
            >
              <Text style={[styles.classOptionCode, { color: colors.textPrimary }]}>I Class</Text>
              <Text style={[styles.classOptionDesc, { color: colors.textMuted }]}>First Class Compartment</Text>
              <Text style={[styles.classOptionPrice, { color: colors.primary }]}>Priority</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.classOptionCard,
                { borderColor: suburbanClass === 'AC_LOCAL' ? colors.accent : colors.cardBorder },
                suburbanClass === 'AC_LOCAL' && { backgroundColor: colors.accent + '15' }
              ]}
              onPress={() => setSuburbanClass('AC_LOCAL')}
            >
              <Text style={[styles.classOptionCode, { color: colors.accent }]}>AC Local</Text>
              <Text style={[styles.classOptionDesc, { color: colors.textMuted }]}>Vestibuled Air-Conditioned</Text>
              <Text style={[styles.classOptionPrice, { color: colors.accent }]}>Fast / Semi-Fast</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 4. Passenger Count */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.passengerHeaderRow}>
          <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>Commuters</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={[styles.counterBtn, { borderColor: colors.cardBorder }]}
              onPress={() => setPassengerCount(Math.max(1, passengerCount - 1))}
            >
              <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.counterCount, { color: colors.textPrimary }]}>{passengerCount}</Text>
            <TouchableOpacity
              style={[styles.counterBtn, { borderColor: colors.cardBorder }]}
              onPress={() => setPassengerCount(Math.min(4, passengerCount + 1))}
            >
              <Text style={[styles.counterBtnText, { color: colors.textPrimary }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 5. Summary & Price Breakdown */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>Tariff Breakdown</Text>
        <View style={styles.breakdownRow}>
          <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>
            Unit Fare ({suburbanClass} · {distanceKm} km):
          </Text>
          <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>
            {calculatingFare ? '...' : `₹${unitFare}`}
          </Text>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>Passengers:</Text>
          <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>× {passengerCount}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

        <View style={styles.breakdownRow}>
          <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total Payable:</Text>
          <Text style={[styles.totalValue, { color: colors.success }]}>₹{totalFare}</Text>
        </View>
      </View>

      {/* 6. Legal / Statutory Notice */}
      <View style={[styles.legalBanner, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.legalNoticeTitle, { color: colors.textSecondary }]}>
          Railways Act 1989 Section 138 Notice
        </Text>
        <Text style={[styles.legalNoticeBody, { color: colors.textMuted }]}>
          Commuters must possess a valid printed or digital token before entering suburban platforms. MST passes are non-transferable and require photo ID validation.
        </Text>
      </View>

      {/* 7. Primary Action Button */}
      <TouchableOpacity
        style={[styles.payButton, { backgroundColor: colors.primary }]}
        onPress={handleIssueTicket}
        disabled={isSubmitting}
        activeOpacity={0.88}
      >
        <Text style={styles.payButtonText}>
          {isSubmitting ? 'Issuing Ticket...' : `Authorize & Issue Ticket (₹${totalFare})`}
        </Text>
      </TouchableOpacity>

      {/* Station Search Modal */}
      <Modal visible={pickerVisible} animationType="slide" transparent={false}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Select {pickerTarget === 'from' ? 'Origin' : 'Destination'} Station
            </Text>
            <TouchableOpacity onPress={() => setPickerVisible(false)}>
              <Text style={[styles.modalCloseText, { color: colors.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.modalSearchBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TextInput
              style={[styles.modalSearchInput, { color: colors.textPrimary }]}
              placeholder="Search Mumbai suburban station..."
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
                style={[styles.stationItem, { borderBottomColor: colors.cardBorder }]}
                onPress={() => handleSelectStation(item)}
              >
                <View style={[styles.stationCodeBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Text style={[styles.stationCodeBadgeText, { color: colors.primary }]}>{item.code}</Text>
                </View>
                <View style={styles.stationInfoBlock}>
                  <Text style={[styles.stationNameText, { color: colors.textPrimary }]}>{item.name}</Text>
                  {item.line && <Text style={[styles.stationLineText, { color: colors.textMuted }]}>{item.line}</Text>}
                </View>
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
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.3
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600'
  },
  stationSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  stationPickerBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 64,
    justifyContent: 'center'
  },
  pickerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  pickerValueCode: {
    fontSize: 18,
    fontWeight: '800'
  },
  pickerValueName: {
    fontSize: 13,
    marginTop: 2
  },
  swapBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  swapBtnText: {
    fontSize: 20,
    fontWeight: '700'
  },
  distanceBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEE'
  },
  distanceLabel: {
    fontSize: 13
  },
  verifiedTag: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  classCardsRow: {
    flexDirection: 'row',
    gap: 8
  },
  classOptionCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    minHeight: 88,
    justifyContent: 'space-between'
  },
  classOptionCode: {
    fontSize: 15,
    fontWeight: '800'
  },
  classOptionDesc: {
    fontSize: 10,
    marginVertical: 4
  },
  classOptionPrice: {
    fontSize: 11,
    fontWeight: '700'
  },
  passengerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  counterBtnText: {
    fontSize: 20,
    fontWeight: '700'
  },
  counterCount: {
    fontSize: 18,
    fontWeight: '800',
    minWidth: 24,
    textAlign: 'center'
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4
  },
  breakdownLabel: {
    fontSize: 13
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600'
  },
  divider: {
    height: 1,
    marginVertical: 10
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800'
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800'
  },
  legalBanner: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16
  },
  legalNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4
  },
  legalNoticeBody: {
    fontSize: 11,
    lineHeight: 16
  },
  payButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    minHeight: 52
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3
  },
  // Ticket confirmation styles
  ticketCard: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 32
  },
  ticketHeader: {
    padding: 14,
    alignItems: 'center'
  },
  ticketHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center'
  },
  specimenBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6
  },
  specimenBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  ticketBody: {
    padding: 16
  },
  ticketRouteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8
  },
  ticketStationBlock: {
    flex: 1
  },
  ticketStationCode: {
    fontSize: 24,
    fontWeight: '800'
  },
  ticketStationName: {
    fontSize: 12,
    marginTop: 2
  },
  routeArrowBlock: {
    alignItems: 'center',
    paddingHorizontal: 8
  },
  routeArrow: {
    fontSize: 20,
    fontWeight: '800'
  },
  distanceText: {
    fontSize: 11,
    marginTop: 2
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 14
  },
  qrMockBox: {
    width: 170,
    height: 170,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  qrInnerDesign: {
    alignItems: 'center'
  },
  qrMockCenterText: {
    color: '#002244',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1
  },
  qrMockCodeText: {
    color: '#002244',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6
  },
  watermarkOverlay: {
    position: 'absolute',
    top: 65,
    transform: [{ rotate: '-25deg' }],
    backgroundColor: 'rgba(255, 59, 48, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4
  },
  watermarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1
  },
  qrCaption: {
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center'
  },
  ticketGrid: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginVertical: 10
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5
  },
  gridLabel: {
    fontSize: 12
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '600'
  },
  gridValueBold: {
    fontSize: 16,
    fontWeight: '800'
  },
  legalBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 10
  },
  legalTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  legalText: {
    fontSize: 11,
    lineHeight: 15
  },
  actionRow: {
    gap: 10,
    marginTop: 10
  },
  primaryActionBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center'
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  secondaryActionBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center'
  },
  secondaryActionBtnText: {
    fontSize: 14,
    fontWeight: '600'
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    padding: 16
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700'
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '600'
  },
  modalSearchBox: {
    marginVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 48,
    justifyContent: 'center'
  },
  modalSearchInput: {
    fontSize: 15
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  stationCodeBadge: {
    width: 52,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  stationCodeBadgeText: {
    fontSize: 13,
    fontWeight: '800'
  },
  stationInfoBlock: {
    flex: 1
  },
  stationNameText: {
    fontSize: 15,
    fontWeight: '600'
  },
  stationLineText: {
    fontSize: 12,
    marginTop: 2
  }
});
