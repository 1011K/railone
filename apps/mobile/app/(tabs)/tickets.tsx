import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMobileTheme } from '../../src/theme/ThemeContext';
import { MobileApiClient } from '../../src/api/client';

export default function MyTicketsScreen() {
  const router = useRouter();
  const { colors } = useMobileTheme();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled' | 'season_passes'>('upcoming');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [cancellationResult, setCancellationResult] = useState<any | null>(null);

  useEffect(() => {
    loadTickets();
  }, [activeTab]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const cat = activeTab === 'upcoming' ? 'upcoming' : activeTab === 'cancelled' ? 'cancelled' : 'all';
      const list = await MobileApiClient.getTickets(cat);
      setTickets(list);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async (ticket: any) => {
    Alert.alert(
      'Cancel Ticket',
      `Are you sure you want to cancel ticket for ${ticket.trainName}? Statutory clerical cancellation fees apply.`,
      [
        { text: 'Keep Ticket', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await MobileApiClient.cancelTicket(ticket.id, 'Passenger voluntary cancellation');
              setCancellationResult(res);
              loadTickets();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TTE Examiner Demo Access Banner */}
      <TouchableOpacity
        onPress={() => router.push('/tte')}
        style={[styles.tteBanner, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      >
        <View style={styles.tteBannerContent}>
          <Text style={[styles.tteBannerTitle, { color: colors.primary }]}>
            TTE Ticket Examiner (Demo Mode) ➔
          </Text>
          <Text style={[styles.tteBannerSubtitle, { color: colors.textMuted }]}>
            Verify QR signatures, travel classes & Section 137/138 compliance
          </Text>
        </View>
      </TouchableOpacity>

      {/* Category Filter Tabs */}
      <View style={[styles.tabsRow, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        {(['upcoming', 'past', 'cancelled', 'season_passes'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabBtn,
              activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 3 }
            ]}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === tab ? colors.primary : colors.textMuted }
              ]}
            >
              {tab === 'upcoming' ? 'Upcoming' : tab === 'past' ? 'Past' : tab === 'cancelled' ? 'Cancelled' : 'Season Passes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ticket List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Loading ticket records...</Text>
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No {activeTab} tickets</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Book a local or express ticket from the Home tab or call RailSathi to make a booking.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.ticketsList}>
          {tickets.map(ticket => (
            <View
              key={ticket.id}
              style={[styles.ticketCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            >
              {/* Educational Simulation Watermark Notice */}
              <View style={styles.watermarkBanner}>
                <Text style={styles.watermarkText}>DEMO / NOT VALID FOR TRAVEL</Text>
              </View>

              <View style={styles.ticketCardBody}>
                <View style={styles.ticketHeader}>
                  <Text style={[styles.pnrText, { color: colors.primary }]}>PNR: {ticket.pnr}</Text>
                  <Text style={[styles.dateText, { color: colors.textMuted }]}>{ticket.journeyDate}</Text>
                </View>

                <Text style={[styles.trainNameText, { color: colors.textPrimary }]}>
                  {ticket.trainNumber} · {ticket.trainName}
                </Text>

                <View style={styles.routeRow}>
                  <Text style={[styles.stationText, { color: colors.textPrimary }]}>{ticket.fromStationName}</Text>
                  <Text style={[styles.arrowText, { color: colors.textMuted }]}>➔</Text>
                  <Text style={[styles.stationText, { color: colors.textPrimary }]}>{ticket.toStationName}</Text>
                </View>

                <View style={[styles.detailsRow, { borderTopColor: colors.cardBorder }]}>
                  <Text style={[styles.detailMeta, { color: colors.textMuted }]}>
                    Class: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{ticket.classBooked}</Text>
                  </Text>
                  <Text style={[styles.detailMeta, { color: colors.textMuted }]}>
                    Passengers: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{ticket.passengers?.length || 1}</Text>
                  </Text>
                  <Text style={[styles.farePaidText, { color: colors.primary }]}>
                    ₹{ticket.farePaid}
                  </Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { borderColor: colors.primary }]}
                    onPress={() => setSelectedTicket(ticket)}
                  >
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>View Ticket & QR</Text>
                  </TouchableOpacity>

                  {ticket.bookingState !== 'CANCELLED_DEMO' && (
                    <TouchableOpacity
                      style={[styles.cancelBtn, { borderColor: colors.danger }]}
                      onPress={() => handleCancelTicket(ticket)}
                    >
                      <Text style={[styles.cancelBtnText, { color: colors.danger }]}>Cancel Ticket</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Ticket QR Modal */}
      <Modal visible={!!selectedTicket} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.watermarkBanner}>
              <Text style={styles.watermarkText}>DEMO / NOT VALID FOR TRAVEL</Text>
            </View>

            {selectedTicket && (
              <ScrollView contentContainerStyle={styles.modalScroll}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Official Specimen Ticket
                </Text>
                <Text style={[styles.modalSub, { color: colors.textMuted }]}>
                  PNR: {selectedTicket.pnr} · Class: {selectedTicket.classBooked}
                </Text>

                {/* Simulated QR Code Canvas Box */}
                <View style={styles.qrBox}>
                  <View style={styles.qrGrid}>
                    <Text style={styles.qrMonoText}>
                      [QR-VERIFIED]{'\n'}
                      PNR: {selectedTicket.pnr}{'\n'}
                      TRAIN: {selectedTicket.trainNumber}{'\n'}
                      FARE: ₹{selectedTicket.farePaid}{'\n'}
                      HASH: SHA256-OK
                    </Text>
                  </View>
                </View>

                <View style={styles.passengerList}>
                  <Text style={[styles.passengersHeader, { color: colors.textPrimary }]}>Passengers:</Text>
                  {selectedTicket.passengers?.map((p: any, idx: number) => (
                    <View key={idx} style={styles.passengerItem}>
                      <Text style={[styles.passengerName, { color: colors.textPrimary }]}>
                        {idx + 1}. {p.name} ({p.age}y, {p.gender})
                      </Text>
                      <Text style={[styles.berthText, { color: colors.primary }]}>
                        {p.berthOrCoachMock || 'Coach GEN'}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.closeModalBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setSelectedTicket(null)}
                >
                  <Text style={styles.closeModalBtnText}>Close Ticket</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Cancellation Result Modal */}
      <Modal visible={!!cancellationResult} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            {cancellationResult && (
              <View style={{ padding: 8 }}>
                <Text style={[styles.cancelSuccessTitle, { color: colors.textPrimary }]}>
                  Ticket Cancelled Successfully
                </Text>
                <Text style={[styles.cancelSummaryText, { color: colors.textSecondary }]}>
                  Statutory cancellation rules applied:
                </Text>

                <View style={[styles.refundBox, { backgroundColor: colors.background }]}>
                  <View style={styles.refundRow}>
                    <Text style={{ color: colors.textMuted }}>Total Paid:</Text>
                    <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>₹{cancellationResult.refundBreakdown.totalPaid}</Text>
                  </View>
                  <View style={styles.refundRow}>
                    <Text style={{ color: colors.textMuted }}>Clerical Deduction:</Text>
                    <Text style={{ color: colors.danger, fontWeight: '700' }}>-₹{cancellationResult.refundBreakdown.clericalDeduction}</Text>
                  </View>
                  <View style={[styles.refundRow, { borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: 6 }]}>
                    <Text style={{ color: colors.textPrimary, fontWeight: '800' }}>Net Refund Amount:</Text>
                    <Text style={{ color: colors.success, fontWeight: '900', fontSize: 16 }}>₹{cancellationResult.refundBreakdown.walletRefund}</Text>
                  </View>
                </View>

                <Text style={[styles.voucherText, { color: colors.primary }]}>
                  Voucher Code: {cancellationResult.voucherCode}
                </Text>
                <Text style={[styles.timelineText, { color: colors.textMuted }]}>
                  {cancellationResult.refundBreakdown.refundTimeline}
                </Text>

                <TouchableOpacity
                  style={[styles.closeModalBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
                  onPress={() => setCancellationResult(null)}
                >
                  <Text style={styles.closeModalBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center'
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  emptyText: {
    marginTop: 10,
    fontSize: 13
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center'
  },
  ticketsList: {
    padding: 16,
    gap: 16
  },
  ticketCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden'
  },
  watermarkBanner: {
    backgroundColor: '#dc2626',
    paddingVertical: 4,
    alignItems: 'center'
  },
  watermarkText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1
  },
  ticketCardBody: {
    padding: 16
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  pnrText: {
    fontSize: 13,
    fontWeight: '800'
  },
  dateText: {
    fontSize: 12
  },
  trainNameText: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  stationText: {
    fontSize: 13,
    fontWeight: '700'
  },
  arrowText: {
    marginHorizontal: 8,
    fontSize: 14
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    marginBottom: 12
  },
  detailMeta: {
    fontSize: 12
  },
  farePaidText: {
    fontSize: 18,
    fontWeight: '900'
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center'
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center'
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20
  },
  modalCard: {
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '85%'
  },
  modalScroll: {
    padding: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center'
  },
  modalSub: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16
  },
  qrBox: {
    alignItems: 'center',
    marginBottom: 16
  },
  qrGrid: {
    width: 180,
    height: 180,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  },
  qrMonoText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 14
  },
  passengerList: {
    marginBottom: 16
  },
  passengersHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8
  },
  passengerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  passengerName: {
    fontSize: 12
  },
  berthText: {
    fontSize: 12,
    fontWeight: '700'
  },
  closeModalBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  closeModalBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14
  },
  cancelSuccessTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8
  },
  cancelSummaryText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12
  },
  refundBox: {
    borderRadius: 10,
    padding: 12,
    gap: 6,
    marginBottom: 12
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  voucherText: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4
  },
  timelineText: {
    fontSize: 11,
    textAlign: 'center'
  },
  tteBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1
  },
  tteBannerContent: {
    gap: 4
  },
  tteBannerTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  tteBannerSubtitle: {
    fontSize: 11,
    lineHeight: 15
  }
});
