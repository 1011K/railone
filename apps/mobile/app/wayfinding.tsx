import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMobileTheme } from '../src/theme/ThemeContext';
import { MobileApiClient } from '../src/api/client';
import { STATION_3D_LAYOUTS, calculateStationTransferRoute } from '../../../src/fixtures/stationLayoutsData';

const MAJOR_STATIONS = [
  { code: 'DR', name: 'Dadar Junction', subtitle: 'CR & WR 15 Platforms' },
  { code: 'CSMT', name: 'CSMT Terminus', subtitle: 'Heritage Concourse & Subway' },
  { code: 'CLA', name: 'Kurla Junction', subtitle: 'Central Main & Harbour' },
  { code: 'TNA', name: 'Thane Junction', subtitle: 'Trans-Harbour & SATIS Deck' },
  { code: 'KYN', name: 'Kalyan Junction', subtitle: 'Kasara & Karjat Bifurcation' },
  { code: 'BVI', name: 'Borivali Terminus', subtitle: 'SV Road Elevated Skywalk' },
  { code: 'CCG', name: 'Churchgate', subtitle: 'WR Ground Concourse' }
];

export default function WayfindingScreen() {
  const { colors } = useMobileTheme();
  const params = useLocalSearchParams<{ station?: string }>();

  const [selectedStationCode, setSelectedStationCode] = useState(
    params.station?.toUpperCase() || 'DR'
  );
  const [stationLayout, setStationLayout] = useState<any | null>(null);
  const [fromPlatformId, setFromPlatformId] = useState<string>('');
  const [toPlatformId, setToPlatformId] = useState<string>('');
  const [stepFreeRequired, setStepFreeRequired] = useState(false);

  // Walk route result
  const [walkRoute, setWalkRoute] = useState<any | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Fetch or resolve station layout
  useEffect(() => {
    let active = true;

    async function loadLayout() {
      try {
        const layout = await MobileApiClient.getStationLayout(selectedStationCode);
        if (active && layout) {
          setStationLayout(layout);
          if (layout.platforms && layout.platforms.length >= 2) {
            setFromPlatformId(layout.platforms[0].id);
            setToPlatformId(layout.platforms[1].id);
          }
          return;
        }
      } catch {
        // Fallback to local station layout fixture
      }

      const fallback = STATION_3D_LAYOUTS[selectedStationCode] || STATION_3D_LAYOUTS['DR'];
      if (active && fallback) {
        setStationLayout(fallback);
        if (fallback.platforms && fallback.platforms.length >= 2) {
          setFromPlatformId(fallback.platforms[0].id);
          setToPlatformId(fallback.platforms[1].id);
        }
      }
    }

    loadLayout();
    return () => {
      active = false;
    };
  }, [selectedStationCode]);

  // Compute pedestrian walking route
  useEffect(() => {
    if (!stationLayout || !fromPlatformId || !toPlatformId) return;

    let active = true;
    setLoadingRoute(true);

    async function computeRoute() {
      try {
        const guide = await MobileApiClient.getTransferWalk(
          selectedStationCode,
          fromPlatformId,
          toPlatformId,
          stepFreeRequired
        );
        if (active && guide) {
          setWalkRoute(guide);
          setLoadingRoute(false);
          return;
        }
      } catch {
        // Fallback to local pathfinder
      }

      const localGuide = calculateStationTransferRoute(
        selectedStationCode,
        fromPlatformId,
        toPlatformId,
        stepFreeRequired
      );
      if (active) {
        setWalkRoute(localGuide);
        setLoadingRoute(false);
      }
    }

    computeRoute();
    return () => {
      active = false;
    };
  }, [selectedStationCode, fromPlatformId, toPlatformId, stepFreeRequired, stationLayout]);

  const currentPlatforms = stationLayout?.platforms || [];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Station Selector Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stationChipsRow}
      >
        {MAJOR_STATIONS.map(stn => {
          const isSelected = selectedStationCode === stn.code;
          return (
            <TouchableOpacity
              key={stn.code}
              style={[
                styles.stationChip,
                { borderColor: colors.cardBorder, backgroundColor: colors.card },
                isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setSelectedStationCode(stn.code)}
            >
              <Text
                style={[
                  styles.stationChipCode,
                  { color: isSelected ? '#FFFFFF' : colors.textPrimary }
                ]}
              >
                {stn.code}
              </Text>
              <Text
                style={[
                  styles.stationChipName,
                  { color: isSelected ? '#FFFFFF' : colors.textMuted }
                ]}
              >
                {stn.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 2. Station Overview Header */}
      {stationLayout && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.stationTitleRow}>
            <View>
              <Text style={[styles.stationTitle, { color: colors.textPrimary }]}>
                {stationLayout.stationName}
              </Text>
              <Text style={[styles.stationVernacular, { color: colors.textSecondary }]}>
                {stationLayout.hindiName} · {stationLayout.marathiName}
              </Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: colors.primary + '18' }]}>
              <Text style={[styles.levelBadgeText, { color: colors.primary }]}>
                {stationLayout.levelsCount} LEVEL CONCOURSE
              </Text>
            </View>
          </View>
          <Text style={[styles.stationDescription, { color: colors.textMuted }]}>
            {stationLayout.description}
          </Text>
        </View>
      )}

      {/* 3. Platform-to-Platform Wayfinding Form */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>
          Transfer Wayfinding
        </Text>

        <View style={styles.platformPickersRow}>
          {/* From Platform */}
          <View style={styles.platformPickerCol}>
            <Text style={[styles.pickerLabel, { color: colors.textMuted }]}>FROM PLATFORM</Text>
            <ScrollView style={styles.platformListMini} nestedScrollEnabled>
              {currentPlatforms.map((p: any) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.platformOption,
                    { borderColor: colors.cardBorder },
                    fromPlatformId === p.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setFromPlatformId(p.id)}
                >
                  <Text
                    style={[
                      styles.platformOptionText,
                      { color: fromPlatformId === p.id ? '#FFFFFF' : colors.textPrimary }
                    ]}
                  >
                    PF {p.number}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.transferArrowCol}>
            <Text style={[styles.transferArrow, { color: colors.primary }]}>➔</Text>
          </View>

          {/* To Platform */}
          <View style={styles.platformPickerCol}>
            <Text style={[styles.pickerLabel, { color: colors.textMuted }]}>TO PLATFORM</Text>
            <ScrollView style={styles.platformListMini} nestedScrollEnabled>
              {currentPlatforms.map((p: any) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.platformOption,
                    { borderColor: colors.cardBorder },
                    toPlatformId === p.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setToPlatformId(p.id)}
                >
                  <Text
                    style={[
                      styles.platformOptionText,
                      { color: toPlatformId === p.id ? '#FFFFFF' : colors.textPrimary }
                    ]}
                  >
                    PF {p.number}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Step-Free Access Toggle */}
        <View style={[styles.toggleRow, { borderTopColor: colors.cardBorder }]}>
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>
              Step-Free Access Required
            </Text>
            <Text style={[styles.toggleSubtitle, { color: colors.textMuted }]}>
              Priority routing via lifts / elevators and ramps (Divyangjan accessible)
            </Text>
          </View>
          <Switch
            value={stepFreeRequired}
            onValueChange={setStepFreeRequired}
            trackColor={{ false: colors.cardBorder, true: colors.primary }}
          />
        </View>
      </View>

      {/* 4. Pedestrian Route Guide Output */}
      {loadingRoute ? (
        <View style={[styles.loadingBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Calculating Foot-Over-Bridge route...
          </Text>
        </View>
      ) : walkRoute ? (
        <View style={[styles.routeResultCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.routeHeader}>
            <View>
              <Text style={[styles.routeBridgeName, { color: colors.textPrimary }]}>
                {walkRoute.recommendedBridge?.name || 'Station Concourse Transfer'}
              </Text>
              <Text style={[styles.routeMetrics, { color: colors.primary }]}>
                ~{walkRoute.walkMinutes} min walk · {walkRoute.distanceMeters} meters
              </Text>
            </View>

            {walkRoute.stepFreeAvailable ? (
              <View style={[styles.stepFreeBadge, { backgroundColor: '#05966918' }]}>
                <Text style={styles.stepFreeBadgeText}>ELEVATOR ACCESSIBLE</Text>
              </View>
            ) : (
              <View style={[styles.stepFreeBadge, { backgroundColor: '#FF950018' }]}>
                <Text style={[styles.stepFreeBadgeText, { color: '#D97706' }]}>STAIRWAY / ESCALATOR</Text>
              </View>
            )}
          </View>

          {/* Turn-by-turn steps */}
          <View style={styles.stepsContainer}>
            {walkRoute.steps.map((stepText: string, idx: number) => (
              <View key={idx} style={styles.stepRow}>
                <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumberText}>{idx + 1}</Text>
                </View>
                <Text style={[styles.stepInstructionText, { color: colors.textPrimary }]}>
                  {stepText}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* 5. Station Amenities & Accessibility Guide */}
      {stationLayout?.amenities && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>
            Station Amenities & Emergency Posts
          </Text>
          <View style={styles.amenitiesGrid}>
            {stationLayout.amenities.map((am: any) => (
              <View key={am.id} style={[styles.amenityItem, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                <Text style={[styles.amenityType, { color: colors.accent }]}>
                  {am.type.toUpperCase().replace('_', ' ')}
                </Text>
                <Text style={[styles.amenityName, { color: colors.textPrimary }]} numberOfLines={2}>
                  {am.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 6. Foot-Over-Bridge Catalog */}
      {stationLayout?.bridges && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginBottom: 32 }]}>
          <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>
            Foot-Over-Bridges ({stationLayout.bridges.length})
          </Text>
          {stationLayout.bridges.map((b: any) => (
            <View key={b.id} style={[styles.bridgeRow, { borderBottomColor: colors.cardBorder }]}>
              <View style={styles.bridgeInfo}>
                <Text style={[styles.bridgeTitle, { color: colors.textPrimary }]}>{b.name}</Text>
                <Text style={[styles.bridgeDetail, { color: colors.textMuted }]}>
                  Level {b.level} · {b.lengthMeters}m · {b.connectedPlatforms.length} Platforms Connected
                </Text>
              </View>
              <View style={styles.bridgeFeatures}>
                {b.hasLifts && (
                  <View style={[styles.featBadge, { backgroundColor: colors.success + '18' }]}>
                    <Text style={[styles.featText, { color: colors.success }]}>LIFT</Text>
                  </View>
                )}
                {b.hasEscalators && (
                  <View style={[styles.featBadge, { backgroundColor: colors.primary + '18' }]}>
                    <Text style={[styles.featText, { color: colors.primary }]}>ESCALATOR</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
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
  stationChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12
  },
  stationChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 70
  },
  stationChipCode: {
    fontSize: 14,
    fontWeight: '800'
  },
  stationChipName: {
    fontSize: 11,
    marginTop: 2
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12
  },
  stationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6
  },
  stationTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  stationVernacular: {
    fontSize: 12,
    marginTop: 2
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  stationDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12
  },
  platformPickersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  platformPickerCol: {
    flex: 1
  },
  pickerLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.4
  },
  platformListMini: {
    maxHeight: 140
  },
  platformOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
    alignItems: 'center'
  },
  platformOptionText: {
    fontSize: 12,
    fontWeight: '700'
  },
  transferArrowCol: {
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  transferArrow: {
    fontSize: 22,
    fontWeight: '800'
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  toggleInfo: {
    flex: 1,
    paddingRight: 10
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  toggleSubtitle: {
    fontSize: 11,
    marginTop: 2
  },
  loadingBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  loadingText: {
    fontSize: 12
  },
  routeResultCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    marginBottom: 14
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  routeBridgeName: {
    fontSize: 16,
    fontWeight: '800'
  },
  routeMetrics: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  stepFreeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5
  },
  stepFreeBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800'
  },
  stepsContainer: {
    gap: 10
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  stepInstructionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  amenityItem: {
    width: '48%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1
  },
  amenityType: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  amenityName: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16
  },
  bridgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  bridgeInfo: {
    flex: 1
  },
  bridgeTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  bridgeDetail: {
    fontSize: 11,
    marginTop: 2
  },
  bridgeFeatures: {
    flexDirection: 'row',
    gap: 4
  },
  featBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  featText: {
    fontSize: 9,
    fontWeight: '800'
  }
});
