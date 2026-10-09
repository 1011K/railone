import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { useMobileTheme } from '../src/theme/ThemeContext';
import Svg, { Path, Circle, Polyline, Line, Rect } from 'react-native-svg';

export default function PnrScreen() {
  const { colors } = useMobileTheme();
  const [pnrInput, setPnrInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleLookup = () => {
    const cleanPnr = pnrInput.replace(/\D/g, '').trim();
    if (cleanPnr.length !== 10) {
      setError('Please enter a valid 10-digit Indian Railways PNR number.');
      setResult(null);
      return;
    }

    setError(null);
    const isConfirmed = parseInt(cleanPnr.slice(-1), 10) % 2 === 0;
    const trainNum = (22000 + (parseInt(cleanPnr.slice(-3), 10) % 900)).toString();

    setResult({
      pnr: cleanPnr,
      trainNumber: trainNum,
      trainName: 'Vande Bharat / Superfast Express',
      dateOfJourney: '12-Oct-2026',
      fromStation: 'CSMT',
      toStation: 'SUR',
      travelClass: '3A',
      quota: 'GENERAL (GN)',
      chartStatus: 'CHART NOT PREPARED',
      passengers: [
        {
          number: 1,
          bookingStatus: isConfirmed ? 'CNF / B3 / 24' : 'WL / 14',
          currentStatus: isConfirmed ? 'CNF / B3 / 24' : 'RAC / 4',
          berthType: isConfirmed ? 'SIDE LOWER' : 'RAC SEAT'
        }
      ]
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Bar */}
        <View style={[styles.headerBar, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>PNR Status Enquiry</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Provenance Badge */}
        <View style={[styles.provenanceCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.provenanceTag, { color: colors.primary }]}>[SIMULATED DATASET]</Text>
          <Text style={[styles.provenanceText, { color: colors.textMuted }]}>
            Indian Railways Passenger Verification System
          </Text>
        </View>

        {/* Input Card */}
        <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>10-Digit PNR Number</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.cardBorder, backgroundColor: colors.background }]}
              value={pnrInput}
              onChangeText={(txt) => {
                setPnrInput(txt.replace(/\D/g, ''));
                setError(null);
              }}
              placeholder="e.g. 8412953210"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={10}
            />
            <TouchableOpacity
              style={[styles.searchBtn, { backgroundColor: colors.primary }]}
              onPress={handleLookup}
              activeOpacity={0.85}
            >
              <Text style={styles.searchBtnText}>Lookup</Text>
            </TouchableOpacity>
          </View>

          {error && <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>}
        </View>

        {/* Result Card */}
        {result && (
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={[styles.trainTitle, { color: colors.textPrimary }]}>
                  {result.trainNumber} · {result.trainName}
                </Text>
                <Text style={[styles.routeSubtitle, { color: colors.textMuted }]}>
                  {result.fromStation} ➔ {result.toStation} · Class: {result.travelClass} ({result.quota})
                </Text>
              </View>
              <Text style={[styles.pnrBadge, { color: colors.primary }]}>PNR: {result.pnr}</Text>
            </View>

            <View style={[styles.chartStatusRow, { backgroundColor: colors.background }]}>
              <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>Chart Status</Text>
              <Text style={[styles.chartVal, { color: colors.warning }]}>{result.chartStatus}</Text>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Passenger Status</Text>
            {result.passengers.map((p: any) => (
              <View key={p.number} style={[styles.passengerRow, { borderColor: colors.cardBorder }]}>
                <View>
                  <Text style={[styles.passengerName, { color: colors.textPrimary }]}>Passenger {p.number}</Text>
                  <Text style={[styles.passengerBerth, { color: colors.textMuted }]}>{p.berthType}</Text>
                </View>
                <View style={styles.alignRight}>
                  <Text style={[styles.currentStatus, { color: colors.success }]}>{p.currentStatus}</Text>
                  <Text style={[styles.bookingStatus, { color: colors.textMuted }]}>Booked: {p.bookingStatus}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingTop: 48,
    gap: 16
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  backButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  provenanceCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  provenanceTag: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  provenanceText: {
    fontSize: 11
  },
  inputCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8
  },
  label: {
    fontSize: 12,
    fontWeight: '700'
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2
  },
  searchBtn: {
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44
  },
  searchBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600'
  },
  resultCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  trainTitle: {
    fontSize: 14,
    fontWeight: '800'
  },
  routeSubtitle: {
    fontSize: 11,
    marginTop: 2
  },
  pnrBadge: {
    fontSize: 12,
    fontWeight: '800'
  },
  chartStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10
  },
  chartLabel: {
    fontSize: 11,
    fontWeight: '600'
  },
  chartVal: {
    fontSize: 11,
    fontWeight: '800'
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700'
  },
  passengerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1
  },
  passengerName: {
    fontSize: 12,
    fontWeight: '700'
  },
  passengerBerth: {
    fontSize: 10
  },
  alignRight: {
    alignItems: 'flex-end'
  },
  currentStatus: {
    fontSize: 12,
    fontWeight: '800'
  },
  bookingStatus: {
    fontSize: 10
  }
});
