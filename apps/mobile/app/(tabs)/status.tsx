import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useMobileTheme } from '../../src/theme/ThemeContext';
import { MobileApiClient } from '../../src/api/client';

export default function TrainStatusScreen() {
  const { colors } = useMobileTheme();
  const [trainQuery, setTrainQuery] = useState('95112');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    fetchStatus('95112');
  }, []);

  const fetchStatus = async (trainNo: string) => {
    if (!trainNo.trim()) return;
    setLoading(true);
    try {
      const data = await MobileApiClient.getTrainStatus(trainNo.trim());
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder="Enter 5-digit Train Number (e.g. 95112, 12951)..."
          placeholderTextColor={colors.textMuted}
          value={trainQuery}
          onChangeText={setTrainQuery}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: colors.primary }]}
          onPress={() => fetchStatus(trainQuery)}
        >
          <Text style={styles.searchBtnText}>Track</Text>
        </TouchableOpacity>
      </View>

      {/* Status Details */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.statusText, { color: colors.textMuted }]}>
            Aggregating live block-section telemetry...
          </Text>
        </View>
      ) : !status ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No live status found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Please verify train number. Sample trains: 95112 (Fast Local), 95114 (AC Fast), 12951 (Rajdhani).
          </Text>
        </View>
      ) : (
        <View style={styles.statusContent}>
          {/* Card Overview */}
          <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: status.delayMinutes > 5 ? colors.danger : colors.success }
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {status.delayMinutes > 0 ? `LATE BY ${status.delayMinutes} MIN` : 'RIGHT TIME'}
                </Text>
              </View>
              <View style={styles.provenanceBadge}>
                <Text style={styles.provenanceBadgeText}>[{status.dataStatus || 'LIVE_VERIFIED'}]</Text>
              </View>
            </View>

            <Text style={[styles.trainTitle, { color: colors.textPrimary }]}>
              {status.trainNumber} · {status.trainName}
            </Text>
            <Text style={[styles.routeSubtitle, { color: colors.textSecondary }]}>
              {status.originStation} ➔ {status.destinationStation}
            </Text>

            {status.disruptionReason && (
              <View style={[styles.disruptionBox, { borderColor: colors.warning }]}>
                <Text style={[styles.disruptionLabel, { color: colors.warning }]}>OPERATIONAL ATTRIBUTION:</Text>
                <Text style={[styles.disruptionText, { color: colors.textPrimary }]}>
                  {status.disruptionReason}
                </Text>
              </View>
            )}
          </View>

          {/* Halts Progression List */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Live Corridor Halts</Text>
          <View style={[styles.haltsListCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {(status.stops || []).map((stop: any, index: number) => {
              const isCurrent = stop.stationCode === status.currentStationCode;

              return (
                <View
                  key={stop.stationCode || index}
                  style={[
                    styles.haltRow,
                    { borderBottomColor: colors.cardBorder },
                    isCurrent && { backgroundColor: 'rgba(59, 130, 246, 0.1)' }
                  ]}
                >
                  <View style={styles.haltDotContainer}>
                    <View
                      style={[
                        styles.haltDot,
                        {
                          backgroundColor: isCurrent ? colors.primary : colors.cardBorder,
                          borderColor: isCurrent ? colors.primary : colors.textMuted
                        }
                      ]}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.haltStationName, { color: colors.textPrimary }]}>
                      {stop.stationName} ({stop.stationCode})
                    </Text>
                    <Text style={[styles.haltSchedTime, { color: colors.textMuted }]}>
                      Sched: {stop.scheduledArrival || stop.scheduledDeparture} · Predicted: {stop.predictedArrival || stop.predictedDeparture}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={[
                        styles.delayText,
                        { color: (stop.delayArrivalMinutes || stop.delayDepartureMinutes || 0) > 0 ? colors.danger : colors.success }
                      ]}
                    >
                      {(stop.delayArrivalMinutes || stop.delayDepartureMinutes || 0) > 0
                        ? `+${stop.delayArrivalMinutes || stop.delayDepartureMinutes}m`
                        : 'On Time'}
                    </Text>
                    <Text style={[styles.platformText, { color: colors.textMuted }]}>
                      PF {stop.platform || '1'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
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
  searchBox: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 6,
    marginBottom: 16
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14
  },
  searchBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13
  },
  centerContainer: {
    padding: 32,
    alignItems: 'center'
  },
  statusText: {
    marginTop: 10,
    fontSize: 12
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
  statusContent: {
    gap: 16
  },
  overviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  provenanceBadge: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4
  },
  provenanceBadgeText: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700'
  },
  trainTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4
  },
  routeSubtitle: {
    fontSize: 13,
    marginBottom: 10
  },
  disruptionBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.08)'
  },
  disruptionLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2
  },
  disruptionText: {
    fontSize: 12,
    fontWeight: '600'
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginVertical: 4
  },
  haltsListCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden'
  },
  haltRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1
  },
  haltDotContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 8
  },
  haltDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2
  },
  haltStationName: {
    fontSize: 13,
    fontWeight: '700'
  },
  haltSchedTime: {
    fontSize: 11,
    marginTop: 2
  },
  delayText: {
    fontSize: 12,
    fontWeight: '800'
  },
  platformText: {
    fontSize: 11,
    marginTop: 2
  }
});
