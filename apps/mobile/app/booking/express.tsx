import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMobileTheme } from '../../src/theme/ThemeContext';
import { MobileApiClient } from '../../src/api/client';

export default function ExpressBookingScreen() {
  const { colors } = useMobileTheme();
  const params = useLocalSearchParams<{
    trainNumber?: string;
    trainName?: string;
    from?: string;
    to?: string;
    classBooked?: string;
  }>();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Train/Class, 2: Passengers, 3: Review, 4: Confirmed
  const [trainNumber, setTrainNumber] = useState(params.trainNumber || '12951');
  const [trainName, setTrainName] = useState(params.trainName || 'Mumbai Rajdhani Express');
  const [fromCode, setFromCode] = useState(params.from || 'MMCT');
  const [toCode, setToCode] = useState(params.to || 'NDLS');
  const [travelClass, setTravelClass] = useState(params.classBooked || '3A');
  const [quota, setQuota] = useState('GN');

  // Passenger state
  const [passengerName, setPassengerName] = useState('Rohan Sharma');
  const [passengerAge, setPassengerAge] = useState('32');
  const [passengerGender, setPassengerGender] = useState<'M' | 'F' | 'O'>('M');

  // Confirmation result
  const [issuedBooking, setIssuedBooking] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const farePerPassenger = travelClass === '1A' ? 2520 : travelClass === '2A' ? 1480 : travelClass === '3A' ? 1025 : 385;
  const totalFare = farePerPassenger;

  const handleAuthorizeBooking = async () => {
    setSubmitting(true);
    try {
      const idempotencyKey = `EXP-MOB-${Date.now()}`;
      const booking = await MobileApiClient.createBooking({
        trainNumber,
        journeyDate: new Date().toISOString().split('T')[0],
        fromStationCode: fromCode,
        toStationCode: toCode,
        classBooked: travelClass,
        quota,
        passengers: [{ name: passengerName.trim(), age: parseInt(passengerAge, 10) || 30, gender: passengerGender }],
        idempotencyKey,
        paymentMethod: 'UPI_SIMULATED'
      });

      setIssuedBooking(booking);
      setStep(4);
    } catch (err: any) {
      Alert.alert('Booking Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Step Progress Bar */}
      <View style={[styles.stepBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.stepItem}>
          <View style={[styles.stepDot, step >= 1 && { backgroundColor: colors.primary }]}>
            <Text style={styles.stepDotText}>1</Text>
          </View>
          <Text style={[styles.stepLabel, { color: step >= 1 ? colors.textPrimary : colors.textMuted }]}>Class</Text>
        </View>

        <View style={[styles.stepConnector, { backgroundColor: step >= 2 ? colors.primary : colors.cardBorder }]} />

        <View style={styles.stepItem}>
          <View style={[styles.stepDot, step >= 2 && { backgroundColor: colors.primary }]}>
            <Text style={styles.stepDotText}>2</Text>
          </View>
          <Text style={[styles.stepLabel, { color: step >= 2 ? colors.textPrimary : colors.textMuted }]}>Passenger</Text>
        </View>

        <View style={[styles.stepConnector, { backgroundColor: step >= 3 ? colors.primary : colors.cardBorder }]} />

        <View style={styles.stepItem}>
          <View style={[styles.stepDot, step >= 3 && { backgroundColor: colors.primary }]}>
            <Text style={styles.stepDotText}>3</Text>
          </View>
          <Text style={[styles.stepLabel, { color: step >= 3 ? colors.textPrimary : colors.textMuted }]}>Review</Text>
        </View>

        <View style={[styles.stepConnector, { backgroundColor: step >= 4 ? colors.primary : colors.cardBorder }]} />

        <View style={styles.stepItem}>
          <View style={[styles.stepDot, step >= 4 && { backgroundColor: colors.success }]}>
            <Text style={styles.stepDotText}>✓</Text>
          </View>
          <Text style={[styles.stepLabel, { color: step >= 4 ? colors.success : colors.textMuted }]}>Issued</Text>
        </View>
      </View>

      {/* Step 1: Train & Class Selection */}
      {step === 1 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Train & Class Selection</Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Train:</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{trainNumber} · {trainName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Route:</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{fromCode} ➔ {toCode}</Text>
          </View>

          <Text style={[styles.inputLabel, { color: colors.textPrimary, marginTop: 14 }]}>Select Travel Class:</Text>
          <View style={styles.classesGrid}>
            {(['1A', '2A', '3A', 'SL', '2S'] as const).map(cls => (
              <TouchableOpacity
                key={cls}
                onPress={() => setTravelClass(cls)}
                style={[
                  styles.classBtn,
                  {
                    backgroundColor: travelClass === cls ? colors.primary : 'transparent',
                    borderColor: travelClass === cls ? colors.primary : colors.cardBorder
                  }
                ]}
              >
                <Text style={[styles.classBtnText, { color: travelClass === cls ? '#ffffff' : colors.textPrimary }]}>
                  {cls}
                </Text>
                <Text style={[styles.classBtnSub, { color: travelClass === cls ? '#ffffff' : colors.textMuted }]}>
                  {cls === '1A' ? '₹2520' : cls === '2A' ? '₹1480' : cls === '3A' ? '₹1025' : '₹385'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
            onPress={() => setStep(2)}
          >
            <Text style={styles.primaryBtnText}>Continue to Passenger Details</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 2: Passenger Details */}
      {step === 2 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Passenger Details</Text>

          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Full Name:</Text>
          <TextInput
            style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.cardBorder }]}
            placeholder="e.g. Rohan Sharma"
            placeholderTextColor={colors.textMuted}
            value={passengerName}
            onChangeText={setPassengerName}
          />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Age:</Text>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.cardBorder }]}
                placeholder="Age"
                placeholderTextColor={colors.textMuted}
                value={passengerAge}
                onChangeText={setPassengerAge}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Gender:</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                {(['M', 'F', 'O'] as const).map(g => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setPassengerGender(g)}
                    style={[
                      styles.genderBtn,
                      {
                        backgroundColor: passengerGender === g ? colors.primary : 'transparent',
                        borderColor: passengerGender === g ? colors.primary : colors.cardBorder
                      }
                    ]}
                  >
                    <Text style={{ color: passengerGender === g ? '#ffffff' : colors.textPrimary, fontWeight: '700' }}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
            <TouchableOpacity
              style={[styles.backBtn, { borderColor: colors.cardBorder }]}
              onPress={() => setStep(1)}
            >
              <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { flex: 1, backgroundColor: colors.primary }]}
              onPress={() => setStep(3)}
            >
              <Text style={styles.primaryBtnText}>Review Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step 3: Review & Authorize Payment */}
      {step === 3 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Review & Authorize</Text>

          <View style={[styles.reviewBox, { backgroundColor: colors.background }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Train:</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{trainNumber} · {trainName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Route:</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{fromCode} ➔ {toCode}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Class / Quota:</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{travelClass} · {quota}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Passenger:</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                {passengerName} ({passengerAge}y, {passengerGender})
              </Text>
            </View>
            <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: 8, marginTop: 6 }]}>
              <Text style={[styles.summaryLabel, { color: colors.textPrimary, fontWeight: '800' }]}>Total Fare:</Text>
              <Text style={[styles.summaryValue, { color: colors.primary, fontSize: 18, fontWeight: '900' }]}>₹{totalFare}</Text>
            </View>
          </View>

          <Text style={[styles.authNotice, { color: colors.textMuted }]}>
            Payment will be verified server-side. Educational specimen ticket will be stored in My Tickets.
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
            <TouchableOpacity
              style={[styles.backBtn, { borderColor: colors.cardBorder }]}
              onPress={() => setStep(2)}
            >
              <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { flex: 1, backgroundColor: colors.primary }]}
              onPress={handleAuthorizeBooking}
              disabled={submitting}
            >
              <Text style={styles.primaryBtnText}>
                {submitting ? 'Authorizing...' : `Authorize & Book (₹${totalFare})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step 4: Booking Issued Confirmation */}
      {step === 4 && issuedBooking && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.successIconCircle}>
            <Text style={styles.successIconText}>✓</Text>
          </View>

          <Text style={[styles.issuedTitle, { color: colors.textPrimary }]}>Express Ticket Issued!</Text>
          <Text style={[styles.pnrHighlight, { color: colors.primary }]}>PNR: {issuedBooking.pnr}</Text>

          <View style={styles.watermarkBanner}>
            <Text style={styles.watermarkText}>DEMO / NOT VALID FOR TRAVEL</Text>
          </View>

          <View style={[styles.reviewBox, { backgroundColor: colors.background, marginTop: 12 }]}>
            <Text style={[styles.summaryValue, { color: colors.textPrimary, textAlign: 'center' }]}>
              {issuedBooking.trainName} · {issuedBooking.classBooked}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.textMuted, textAlign: 'center', marginTop: 4 }]}>
              {issuedBooking.fromStationName} ➔ {issuedBooking.toStationName}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
            onPress={() => router.push('/(tabs)/tickets')}
          >
            <Text style={styles.primaryBtnText}>View in My Tickets Wallet</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16
  },
  stepItem: {
    alignItems: 'center'
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4
  },
  stepDotText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800'
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700'
  },
  stepConnector: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    marginBottom: 14
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  summaryLabel: {
    fontSize: 13
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700'
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6
  },
  classesGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6
  },
  classBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  classBtnText: {
    fontSize: 14,
    fontWeight: '800'
  },
  classBtnSub: {
    fontSize: 10,
    marginTop: 2
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  backBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700'
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14
  },
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center'
  },
  reviewBox: {
    borderRadius: 12,
    padding: 14,
    gap: 4
  },
  authNotice: {
    fontSize: 11,
    marginTop: 10,
    lineHeight: 16
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#16a34a',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  successIconText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900'
  },
  issuedTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4
  },
  pnrHighlight: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12
  },
  watermarkBanner: {
    backgroundColor: '#dc2626',
    paddingVertical: 4,
    alignItems: 'center',
    borderRadius: 6
  },
  watermarkText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  }
});
