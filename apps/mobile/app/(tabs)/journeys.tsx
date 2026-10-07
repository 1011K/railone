import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMobileTheme } from '../../src/theme/ThemeContext';
import { MobileApiClient } from '../../src/api/client';

export default function JourneysScreen() {
  const { colors } = useMobileTheme();
  const params = useLocalSearchParams<{ from?: string; to?: string; acOnly?: string }>();

  const fromCode = params.from || 'TNA';
  const toCode = params.to || 'CSMT';
  const isAcOnly = params.acOnly === 'true';

  const [loading, setLoading] = useState(true);
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'ac_only' | 'fastest' | 'cheapest'>('all');

  useEffect(() => {
    loadRoutes();
  }, [fromCode, toCode, isAcOnly]);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const routes = await MobileApiClient.searchRoutes({
        from: fromCode,
        to: toCode,
        acOnly: isAcOnly || filterType === 'ac_only'
      });
      setItineraries(routes);
    } catch {
      setItineraries([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItineraries = () => {
    let list = [...itineraries];
    if (filterType === 'ac_only' || isAcOnly) {
      list = list.filter(it => it.isAcService);
    } else if (filterType === 'fastest') {
      list.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
    } else if (filterType === 'cheapest') {
      list.sort((a, b) => {
        const fareA = a.totalFareByClass[a.recommendedClass] || 999;
        const fareB = b.totalFareByClass[b.recommendedClass] || 999;
        return fareA - fareB;
      });
    }
    return list;
  };

  const onBookJourney = (itinerary: any) => {
    const leg = itinerary.legs[0];
    const isExpress = leg.train.serviceType === 'superfast' || leg.train.serviceType === 'mail_express';

    if (isExpress) {
      router.push({
        pathname: '/booking/express',
        params: {
          trainNumber: leg.train.trainNumber,
          trainName: leg.train.trainName,
          from: fromCode,
          to: toCode,
          classBooked: itinerary.recommendedClass
        }
      });
    } else {
      router.push({
        pathname: '/booking/local',
        params: {
          trainNumber: leg.train.trainNumber,
          trainName: leg.train.trainName,
          from: fromCode,
          to: toCode,
          classBooked: itinerary.recommendedClass
        }
      });
    }
  };

  const displayedRoutes = getFilteredItineraries();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Route Header */}
      <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.routeHeaderRow}>
          <Text style={[styles.routeHeaderStation, { color: colors.textPrimary }]}>{fromCode}</Text>
          <Text style={[styles.routeArrow, { color: colors.primary }]}>➔</Text>
          <Text style={[styles.routeHeaderStation, { color: colors.textPrimary }]}>{toCode}</Text>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          {(['all', 'ac_only', 'fastest', 'cheapest'] as const).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilterType(f)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: filterType === f ? colors.primary : 'transparent',
                  borderColor: filterType === f ? colors.primary : colors.cardBorder
                }
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: filterType === f ? '#ffffff' : colors.textMuted }
                ]}
              >
                {f === 'all' ? 'All' : f === 'ac_only' ? 'AC Only' : f === 'fastest' ? 'Fastest' : 'Lowest Fare'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Evaluating timetable & live delay propagation...
          </Text>
        </View>
      ) : displayedRoutes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No connections found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Try disabling filters or adjusting the travel window.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollList}>
          {displayedRoutes.map((itinerary, index) => {
            const firstLeg = itinerary.legs[0];
            const hasTransfer = itinerary.transfers && itinerary.transfers.length > 0;
            const fare = itinerary.totalFareByClass[itinerary.recommendedClass] || 10;

            return (
              <View
                key={itinerary.id || index}
                style={[
                  styles.itineraryCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: itinerary.isRecommended ? colors.primary : colors.cardBorder,
                    borderWidth: itinerary.isRecommended ? 2 : 1
                  }
                ]}
              >
                {/* Header Badge */}
                <View style={styles.cardBadgeRow}>
                  {itinerary.isRecommended && (
                    <View style={[styles.recommendedBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.recommendedBadgeText}>RECOMMENDED</Text>
                    </View>
                  )}
                  {itinerary.isAcService && (
                    <View style={styles.acBadge}>
                      <Text style={styles.acBadgeText}>AC LOCAL</Text>
                    </View>
                  )}
                  {itinerary.delayInversionNote && (
                    <View style={styles.inversionBadge}>
                      <Text style={styles.inversionBadgeText}>DELAY INVERSION: TAKE SLOW</Text>
                    </View>
                  )}
                  <View style={styles.provenanceBadge}>
                    <Text style={styles.provenanceBadgeText}>[TIMETABLE SCHEDULE]</Text>
                  </View>
                </View>

                {/* Departure & Arrival Times */}
                <View style={styles.timeScheduleRow}>
                  <View>
                    <Text style={[styles.scheduleTime, { color: colors.textPrimary }]}>
                      {itinerary.predictedDeparture}
                    </Text>
                    <Text style={[styles.stationSubLabel, { color: colors.textMuted }]}>
                      {fromCode} (PF {firstLeg.departurePlatform || '1'})
                    </Text>
                  </View>

                  <View style={styles.durationLineContainer}>
                    <Text style={[styles.durationText, { color: colors.textMuted }]}>
                      {itinerary.totalDurationMinutes} min
                    </Text>
                    <View style={[styles.durationBar, { backgroundColor: colors.cardBorder }]} />
                    <Text style={[styles.transferText, { color: colors.textSecondary }]}>
                      {hasTransfer ? `${itinerary.transfers[0].station.name} Transfer` : 'Direct Service'}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.scheduleTime, { color: colors.textPrimary }]}>
                      {itinerary.predictedArrival}
                    </Text>
                    <Text style={[styles.stationSubLabel, { color: colors.textMuted }]}>
                      {toCode} (PF {itinerary.legs[itinerary.legs.length - 1].arrivalPlatform || '1'})
                    </Text>
                  </View>
                </View>

                {/* Train Name & Stopping Pattern */}
                <View style={[styles.trainInfoRow, { borderTopColor: colors.cardBorder }]}>
                  <Text style={[styles.trainNameText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {firstLeg.train.trainNumber} · {firstLeg.train.trainName}
                  </Text>
                  <Text style={[styles.fareAmountText, { color: colors.primary }]}>
                    ₹{fare}
                  </Text>
                </View>

                {/* Booking Button */}
                <TouchableOpacity
                  style={[styles.bookButton, { backgroundColor: colors.primary }]}
                  onPress={() => onBookJourney(itinerary)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={`Book connection departing at ${itinerary.predictedDeparture}`}
                >
                  <Text style={styles.bookButtonText}>Book This Connection</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerCard: {
    padding: 16,
    borderBottomWidth: 1
  },
  routeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  routeHeaderStation: {
    fontSize: 20,
    fontWeight: '900'
  },
  routeArrow: {
    fontSize: 18,
    marginHorizontal: 12,
    fontWeight: 'bold'
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
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
  scrollList: {
    padding: 16,
    gap: 16
  },
  itineraryCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 2
  },
  cardBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
  },
  recommendedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  recommendedBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  acBadge: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  acBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  inversionBadge: {
    backgroundColor: '#b45309',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  inversionBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  provenanceBadge: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  provenanceBadgeText: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700'
  },
  timeScheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  scheduleTime: {
    fontSize: 22,
    fontWeight: '900'
  },
  stationSubLabel: {
    fontSize: 11,
    marginTop: 2
  },
  durationLineContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 12
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2
  },
  durationBar: {
    height: 2,
    width: '100%',
    marginVertical: 4
  },
  transferText: {
    fontSize: 10,
    fontWeight: '600'
  },
  trainInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    marginBottom: 12
  },
  trainNameText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1
  },
  fareAmountText: {
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 8
  },
  bookButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  }
});
