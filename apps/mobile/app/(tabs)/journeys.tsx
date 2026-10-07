import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch
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
  const [timeWindow, setTimeWindow] = useState<number>(30); // 30, 60, 120 min
  const [categoryTab, setCategoryTab] = useState<'NEXT' | 'SLOW' | 'FAST' | 'AC' | 'EXPRESS'>('NEXT');
  const [easyMode, setEasyMode] = useState<boolean>(false);

  useEffect(() => {
    loadRoutes();
  }, [fromCode, toCode, isAcOnly, timeWindow]);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const routes = await MobileApiClient.searchRoutes({
        from: fromCode,
        to: toCode,
        timeWindowMinutes: timeWindow,
        acOnly: isAcOnly || categoryTab === 'AC'
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

    // 1. Category Tab Filter
    if (categoryTab === 'SLOW') {
      list = list.filter(it => it.serviceCategory === 'slow' || it.legs[0]?.train?.serviceType === 'suburban_slow');
    } else if (categoryTab === 'FAST') {
      list = list.filter(it => it.serviceCategory === 'fast' || it.legs[0]?.train?.serviceType === 'suburban_fast');
    } else if (categoryTab === 'AC') {
      list = list.filter(it => it.serviceCategory === 'ac' || it.isAcService);
    } else if (categoryTab === 'EXPRESS') {
      list = list.filter(it =>
        it.serviceCategory === 'express' ||
        it.legs[0]?.train?.serviceType === 'superfast' ||
        it.legs[0]?.train?.serviceType === 'mail_express'
      );
    }

    return list;
  };

  const onGuideMe = (itinerary: any) => {
    const firstLeg = itinerary.legs[0];
    const lastLeg = itinerary.legs[itinerary.legs.length - 1];
    const hasTransfer = itinerary.transfers && itinerary.transfers.length > 0;
    const transfer = hasTransfer ? itinerary.transfers[0] : null;

    router.push({
      pathname: '/guide',
      params: {
        from: fromCode,
        to: toCode,
        departureTime: itinerary.predictedDeparture,
        arrivalTime: itinerary.predictedArrival,
        trainNumber: firstLeg.train.trainNumber,
        trainName: firstLeg.train.trainName,
        departurePlatform: firstLeg.departurePlatform || '1',
        arrivalPlatform: lastLeg.arrivalPlatform || '1',
        duration: String(itinerary.totalDurationMinutes),
        hasTransfer: hasTransfer ? 'true' : 'false',
        transferStation: transfer ? transfer.station.code : '',
        transferStationName: transfer ? transfer.station.name : '',
        transferPlatformFrom: transfer ? (transfer.fromPlatform || '3') : '',
        transferPlatformTo: transfer ? (transfer.toPlatform || '5') : '',
        transferWalkMinutes: transfer ? String(transfer.walkTimeMinutes || transfer.walkMinutes || 7) : '0',
        isAc: itinerary.isAcService ? 'true' : 'false',
        fare: String(itinerary.totalFareByClass[itinerary.recommendedClass] || 10)
      }
    });
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
          <View>
            <View style={styles.originDestRow}>
              <Text style={[styles.routeHeaderStation, { color: colors.textPrimary }]}>{fromCode}</Text>
              <Text style={[styles.routeArrow, { color: colors.primary }]}>➔</Text>
              <Text style={[styles.routeHeaderStation, { color: colors.textPrimary }]}>{toCode}</Text>
            </View>
            <Text style={[styles.liveWindowLabel, { color: colors.textMuted }]}>
              All-Trains Live Departure Board · {timeWindow}m Window
            </Text>
          </View>

          {/* Easy Journey Mode Toggle */}
          <View style={styles.accessibilityToggleRow}>
            <Text style={[styles.accessibilityToggleText, { color: colors.textSecondary }]}>
              Easy Mode
            </Text>
            <Switch
              value={easyMode}
              onValueChange={setEasyMode}
              trackColor={{ false: colors.cardBorder, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 1. Time Window Selector (30m / 60m / 120m) */}
        <View style={styles.timeWindowRow}>
          <Text style={[styles.timeWindowLabel, { color: colors.textMuted }]}>Window:</Text>
          {([30, 60, 120] as const).map(w => (
            <TouchableOpacity
              key={w}
              onPress={() => setTimeWindow(w)}
              style={[
                styles.timeWindowPill,
                {
                  backgroundColor: timeWindow === w ? colors.primary : 'transparent',
                  borderColor: timeWindow === w ? colors.primary : colors.cardBorder
                }
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Select next ${w} minutes window`}
            >
              <Text
                style={[
                  styles.timeWindowPillText,
                  { color: timeWindow === w ? '#ffffff' : colors.textSecondary }
                ]}
              >
                Next {w}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 2. Departure Board Category Tabs: NEXT | SLOW | FAST | AC | EXPRESS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabsRow}>
          {(['NEXT', 'SLOW', 'FAST', 'AC', 'EXPRESS'] as const).map(tab => {
            const isSelected = categoryTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setCategoryTab(tab)}
                style={[
                  styles.categoryTabBtn,
                  {
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                    borderColor: isSelected ? colors.primary : colors.cardBorder
                  }
                ]}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary }
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No {categoryTab} departures found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            No services found within the selected {timeWindow}m window. Try selecting "Next 60m" or switching category tabs.
          </Text>
          <TouchableOpacity
            style={[styles.retryWiderBtn, { backgroundColor: colors.primary }]}
            onPress={() => setTimeWindow(120)}
          >
            <Text style={styles.retryWiderBtnText}>Expand to Next 120m</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollList}>
          {displayedRoutes.map((itinerary, index) => {
            const firstLeg = itinerary.legs[0];
            const hasTransfer = itinerary.transfers && itinerary.transfers.length > 0;
            const fare = itinerary.totalFareByClass[itinerary.recommendedClass] || 10;
            const badges: string[] = itinerary.recommendationBadges || (itinerary.isRecommended ? ['⭐ BEST'] : []);

            return (
              <View
                key={itinerary.id || index}
                style={[
                  styles.itineraryCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: itinerary.isRecommended ? '#f59e0b' : colors.cardBorder,
                    borderWidth: itinerary.isRecommended ? 2 : 1
                  },
                  easyMode && styles.itineraryCardEasy
                ]}
              >
                {/* Badges Row */}
                <View style={styles.cardBadgeRow}>
                  {badges.map((b, bIdx) => {
                    const isBest = b.includes('BEST');
                    const isFastest = b.includes('FASTEST');
                    const isAc = b.includes('AC');
                    const isExpress = b.includes('EXPRESS');
                    const isCheapest = b.includes('CHEAPEST');

                    let bgColor = colors.primary;
                    if (isBest) bgColor = '#d97706'; // Gold
                    else if (isFastest) bgColor = '#7c3aed'; // Violet
                    else if (isAc) bgColor = '#0284c7'; // Sky Blue
                    else if (isExpress) bgColor = '#2563eb'; // Royal Blue
                    else if (isCheapest) bgColor = '#059669'; // Emerald

                    return (
                      <View key={bIdx} style={[styles.dynamicBadge, { backgroundColor: bgColor }]}>
                        <Text style={styles.dynamicBadgeText}>{b}</Text>
                      </View>
                    );
                  })}

                  {itinerary.delayInversionNote && (
                    <View style={styles.inversionBadge}>
                      <Text style={styles.inversionBadgeText}>DELAY INVERSION: TAKE SLOW</Text>
                    </View>
                  )}

                  <View style={styles.provenanceBadge}>
                    <Text style={styles.provenanceBadgeText}>[TIMETABLE SCHEDULE]</Text>
                  </View>
                </View>

                {/* Express Blocked Reason Explanation */}
                {itinerary.expressPromotionBlockedReason && (
                  <View style={styles.blockedReasonBox}>
                    <Text style={styles.blockedReasonText}>
                      [LOCAL FASTER] {itinerary.expressPromotionBlockedReason}
                    </Text>
                  </View>
                )}

                {/* Departure & Arrival Times */}
                <View style={styles.timeScheduleRow}>
                  <View>
                    <Text
                      style={[
                        styles.scheduleTime,
                        { color: colors.textPrimary },
                        easyMode && styles.scheduleTimeEasy
                      ]}
                    >
                      {itinerary.predictedDeparture}
                    </Text>
                    <Text style={[styles.stationSubLabel, { color: colors.textMuted }, easyMode && styles.stationSubLabelEasy]}>
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
                    <Text
                      style={[
                        styles.scheduleTime,
                        { color: colors.textPrimary },
                        easyMode && styles.scheduleTimeEasy
                      ]}
                    >
                      {itinerary.predictedArrival}
                    </Text>
                    <Text style={[styles.stationSubLabel, { color: colors.textMuted }, easyMode && styles.stationSubLabelEasy]}>
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

                {/* Action Buttons: GUIDE ME FROM HERE (Primary) & Book Connection */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.guideButton, { backgroundColor: '#15803d' }]}
                    onPress={() => onGuideMe(itinerary)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`Guide me step-by-step for train ${firstLeg.train.trainNumber}`}
                  >
                    <Text style={styles.guideButtonText}># GUIDE ME FROM HERE</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.bookSecondaryButton, { borderColor: colors.primary }]}
                    onPress={() => onBookJourney(itinerary)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`Book ticket for departure at ${itinerary.predictedDeparture}`}
                  >
                    <Text style={[styles.bookSecondaryButtonText, { color: colors.primary }]}>Book Ticket</Text>
                  </TouchableOpacity>
                </View>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1
  },
  routeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  originDestRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  routeHeaderStation: {
    fontSize: 20,
    fontWeight: '900'
  },
  routeArrow: {
    fontSize: 18,
    marginHorizontal: 10,
    fontWeight: 'bold'
  },
  liveWindowLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600'
  },
  accessibilityToggleRow: {
    alignItems: 'center'
  },
  accessibilityToggleText: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2
  },
  timeWindowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 8
  },
  timeWindowLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4
  },
  timeWindowPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 34,
    justifyContent: 'center'
  },
  timeWindowPillText: {
    fontSize: 12,
    fontWeight: '700'
  },
  categoryTabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 6
  },
  categoryTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center'
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '800'
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
    textAlign: 'center',
    marginBottom: 16
  },
  retryWiderBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10
  },
  retryWiderBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13
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
  itineraryCardEasy: {
    borderWidth: 2,
    padding: 18
  },
  cardBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10
  },
  dynamicBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  dynamicBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  inversionBadge: {
    backgroundColor: '#b45309',
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    paddingVertical: 3,
    borderRadius: 4
  },
  provenanceBadgeText: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700'
  },
  blockedReasonBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444'
  },
  blockedReasonText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '700'
  },
  timeScheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  scheduleTime: {
    fontSize: 22,
    fontWeight: '900'
  },
  scheduleTimeEasy: {
    fontSize: 26
  },
  stationSubLabel: {
    fontSize: 11,
    marginTop: 2
  },
  stationSubLabelEasy: {
    fontSize: 13,
    fontWeight: '600'
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
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  guideButton: {
    flex: 1.4,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center'
  },
  guideButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3
  },
  bookSecondaryButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center'
  },
  bookSecondaryButtonText: {
    fontSize: 12,
    fontWeight: '800'
  }
});
