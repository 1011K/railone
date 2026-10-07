import React, { useState } from 'react';
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

interface DemoTicket {
  id: string;
  pnr: string;
  type: string;
  from: string;
  to: string;
  travelClass: string;
  fare: number;
  trainName: string;
  trainNumber: string;
  status: 'VALID' | 'EXPIRED' | 'UNAUTHORIZED_CLASS' | 'OVER_TRAVEL';
  validityWindow: string;
  passengerName: string;
}

const DEMO_TICKETS: DemoTicket[] = [
  {
    id: 'DEMO-1',
    pnr: 'UTS-CR-984210',
    type: 'Suburban AC Local Single',
    from: 'Thane (TNA)',
    to: 'CSMT',
    travelClass: 'AC_LOCAL',
    fare: 105,
    trainName: 'Central AC Fast Local',
    trainNumber: 'CR-AC-95302',
    status: 'VALID',
    validityWindow: 'Valid until today 21:30 (3 hrs from booking)',
    passengerName: 'Kavita Deshmukh'
  },
  {
    id: 'DEMO-2',
    pnr: 'UTS-WR-817293',
    type: 'Suburban First Class (I)',
    from: 'Dadar (DR)',
    to: 'Churchgate (CCG)',
    travelClass: 'I',
    fare: 65,
    trainName: 'Churchgate Fast Local',
    trainNumber: 'WR-90012',
    status: 'VALID',
    validityWindow: 'Valid until today 20:45',
    passengerName: 'Anil Mehta'
  },
  {
    id: 'DEMO-3',
    pnr: 'PRS-IR-2849173',
    type: 'National Express Reserved',
    from: 'CSMT',
    to: 'New Delhi (NDLS)',
    travelClass: 'SL',
    fare: 976,
    trainName: 'Punjab Mail Express',
    trainNumber: '12137',
    status: 'VALID',
    validityWindow: 'Coach S4 / Berth 37 (Lower Berth) · Confirmed',
    passengerName: 'Deepak Sharma'
  },
  {
    id: 'DEMO-4',
    pnr: 'UTS-CR-119284',
    type: 'Second Class in AC Local (Violation)',
    from: 'Kalyan (KYN)',
    to: 'Dadar (DR)',
    travelClass: 'II',
    fare: 15,
    trainName: 'Kalyan - CSMT AC Local',
    trainNumber: 'CR-AC-95302',
    status: 'UNAUTHORIZED_CLASS',
    validityWindow: 'Expired for AC Rake · Ordinary II Ticket only',
    passengerName: 'Simulated Passenger (Irregular Ticket)'
  }
];

export default function TteInspectionScreen() {
  const { colors } = useMobileTheme();
  const [selectedTicketId, setSelectedTicketId] = useState<string>(DEMO_TICKETS[0].id);
  const [manualCode, setManualCode] = useState('');
  const [inspectionResult, setInspectionResult] = useState<DemoTicket | null>(DEMO_TICKETS[0]);

  const onInspect = (ticket: DemoTicket) => {
    setSelectedTicketId(ticket.id);
    setInspectionResult(ticket);
  };

  const onManualVerify = () => {
    const q = manualCode.trim().toUpperCase();
    const found = DEMO_TICKETS.find(t => t.pnr.toUpperCase().includes(q) || t.id === q);
    if (found) {
      setInspectionResult(found);
      setSelectedTicketId(found.id);
    } else {
      setInspectionResult({
        id: 'UNKNOWN',
        pnr: manualCode || 'UNKNOWN-QR',
        type: 'Unverified Passenger Token',
        from: 'UNKNOWN',
        to: 'UNKNOWN',
        travelClass: 'NONE',
        fare: 0,
        trainName: 'Unverified Service',
        trainNumber: '00000',
        status: 'EXPIRED',
        validityWindow: 'No cryptographically signed token found in official ticketing registry',
        passengerName: 'Unknown Passenger'
      });
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Header & Mandatory Statutory Disclaimer */}
      <View style={[styles.disclaimerCard, { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
        <View style={styles.disclaimerBadge}>
          <Text style={styles.disclaimerBadgeText}>[DEMO / TEST ONLY — NOT CONNECTED TO LIVE PRODUCTION PRS / UTS GATEWAYS]</Text>
        </View>
        <Text style={styles.disclaimerTitle}>TTE & Ticket Collector Inspection Engine</Text>
        <Text style={styles.disclaimerBody}>
          Official demonstration interface for Indian Railways ticket checkers to authenticate UTS paperless QR codes,
          season passes, and IRCTC reserved tickets with statutory Section 138 excess charge rules.
        </Text>
      </View>

      {/* 2. Select Sample Ticket to Test */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Select Demo Passenger Ticket:</Text>
        <View style={styles.ticketButtonsGrid}>
          {DEMO_TICKETS.map(t => {
            const isSel = selectedTicketId === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.ticketSelectBtn,
                  { borderColor: colors.cardBorder },
                  isSel && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => onInspect(t)}
                accessibilityRole="button"
                accessibilityLabel={`Inspect ticket ${t.pnr}`}
              >
                <Text style={[styles.ticketSelectBtnCode, { color: isSel ? '#FFFFFF' : colors.textPrimary }]}>
                  {t.pnr}
                </Text>
                <Text style={[styles.ticketSelectBtnType, { color: isSel ? '#FFFFFF' : colors.textSecondary }]}>
                  {t.type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Manual PNR / UTS Code Entry */}
        <View style={styles.manualEntryRow}>
          <TextInput
            style={[styles.manualInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.cardBorder }]}
            placeholder="Scan or enter PNR / UTS code..."
            placeholderTextColor={colors.textMuted}
            value={manualCode}
            onChangeText={setManualCode}
          />
          <TouchableOpacity
            style={[styles.verifyBtn, { backgroundColor: colors.primary }]}
            onPress={onManualVerify}
            accessibilityRole="button"
            accessibilityLabel="Verify entered code"
          >
            <Text style={styles.verifyBtnText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Inspection Verification Dossier */}
      {inspectionResult && (
        <View style={[styles.inspectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Status Header Badge */}
          <View
            style={[
              styles.statusHeaderBadge,
              { backgroundColor: inspectionResult.status === 'VALID' ? '#059669' : '#b91c1c' }
            ]}
          >
            <Text style={styles.statusHeaderBadgeText}>
              {inspectionResult.status === 'VALID'
                ? '✓ AUTHENTICATED TICKET — VALID FOR JOURNEY'
                : '⚠ IRREGULAR / INVALID TICKET — EXCESS CHARGE APPLIES'}
            </Text>
          </View>

          {/* Passenger & Ticket Particulars */}
          <View style={styles.particularsGrid}>
            <View style={styles.particularRow}>
              <Text style={[styles.partLabel, { color: colors.textMuted }]}>Passenger Name:</Text>
              <Text style={[styles.partValue, { color: colors.textPrimary }]}>{inspectionResult.passengerName}</Text>
            </View>

            <View style={styles.particularRow}>
              <Text style={[styles.partLabel, { color: colors.textMuted }]}>PNR / Ticket No:</Text>
              <Text style={[styles.partValue, { color: colors.primary }]}>{inspectionResult.pnr}</Text>
            </View>

            <View style={styles.particularRow}>
              <Text style={[styles.partLabel, { color: colors.textMuted }]}>Route Authorized:</Text>
              <Text style={[styles.partValue, { color: colors.textPrimary }]}>
                {inspectionResult.from} ➔ {inspectionResult.to}
              </Text>
            </View>

            <View style={styles.particularRow}>
              <Text style={[styles.partLabel, { color: colors.textMuted }]}>Class Authorized:</Text>
              <Text style={[styles.partValue, { color: colors.textPrimary }]}>{inspectionResult.travelClass}</Text>
            </View>

            <View style={styles.particularRow}>
              <Text style={[styles.partLabel, { color: colors.textMuted }]}>Train / Service:</Text>
              <Text style={[styles.partValue, { color: colors.textPrimary }]}>
                {inspectionResult.trainNumber} · {inspectionResult.trainName}
              </Text>
            </View>

            <View style={styles.particularRow}>
              <Text style={[styles.partLabel, { color: colors.textMuted }]}>Validity Window:</Text>
              <Text style={[styles.partValue, { color: colors.textSecondary }]}>{inspectionResult.validityWindow}</Text>
            </View>

            <View style={styles.particularRow}>
              <Text style={[styles.partLabel, { color: colors.textMuted }]}>Fare Paid:</Text>
              <Text style={[styles.partValue, { color: '#059669', fontSize: 16, fontWeight: '900' }]}>
                ₹{inspectionResult.fare}
              </Text>
            </View>
          </View>

          {/* Statutory Railways Act Section 138 Warning & Excess Charge (If invalid) */}
          {inspectionResult.status !== 'VALID' && (
            <View style={styles.penaltyNoticeCard}>
              <Text style={styles.penaltyTitle}>STATUTORY EXCESS CHARGE DOSSIER (Section 138)</Text>
              <Text style={styles.penaltyRule}>
                Railways Act, 1989 Section 138 (Travelling without proper pass or ticket):
              </Text>
              <Text style={styles.penaltyDetail}>
                • Differential Fare: ₹{Math.max(0, 105 - inspectionResult.fare)} (AC First Class vs Second Class paid)
              </Text>
              <Text style={styles.penaltyDetail}>
                • Statutory Minimum Penalty: ₹500 (Amended Railways Act Sections 137/138, effective 20 June 2026)
              </Text>
              <Text style={styles.penaltyDetail}>
                • Action: Issue excess fare ticket (EFT) receipt or deboard at next station
              </Text>
              <Text style={styles.penaltyStatutoryNotice}>
                Notice: Statutory excess charge must be receipted via official IR EFT machine. No arbitrary cash fines.
              </Text>
            </View>
          )}

          {/* Verification Actions */}
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Done and return"
          >
            <Text style={styles.closeBtnText}>Done / Return to App</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14
  },
  disclaimerCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14
  },
  disclaimerBadge: {
    backgroundColor: '#b91c1c25',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6
  },
  disclaimerBadgeText: {
    color: '#f87171',
    fontSize: 9,
    fontWeight: '800'
  },
  disclaimerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4
  },
  disclaimerBody: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 16
  },
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10
  },
  ticketButtonsGrid: {
    gap: 8,
    marginBottom: 14
  },
  ticketSelectBtn: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1
  },
  ticketSelectBtnCode: {
    fontSize: 13,
    fontWeight: '800'
  },
  ticketSelectBtnType: {
    fontSize: 11,
    marginTop: 2
  },
  manualEntryRow: {
    flexDirection: 'row',
    gap: 8
  },
  manualInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 12
  },
  verifyBtn: {
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  inspectionCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20
  },
  statusHeaderBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 14
  },
  statusHeaderBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center'
  },
  particularsGrid: {
    gap: 8,
    marginBottom: 14
  },
  particularRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100, 116, 139, 0.1)',
    paddingBottom: 6
  },
  partLabel: {
    fontSize: 12,
    fontWeight: '700'
  },
  partValue: {
    fontSize: 13,
    fontWeight: '800'
  },
  penaltyNoticeCard: {
    backgroundColor: '#7f1d1d20',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    gap: 4,
    marginBottom: 14
  },
  penaltyTitle: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  penaltyRule: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '700'
  },
  penaltyDetail: {
    color: '#fca5a5',
    fontSize: 11,
    lineHeight: 16
  },
  penaltyStatutoryNotice: {
    color: '#cbd5e1',
    fontSize: 10,
    marginTop: 4,
    fontStyle: 'italic'
  },
  closeBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center'
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
