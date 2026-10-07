import React, { useState, useEffect, useMemo } from 'react';
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
import {
  STATION_3D_LAYOUTS,
  calculateStationTransferRoute,
  PlatformLayout,
  FootOverBridge
} from '../src/fixtures/stationLayoutsData';
import Svg, { Rect, Line, Circle, G, Text as SvgText, Path } from 'react-native-svg';

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

  // Zoom for SVG canvas
  const [canvasZoom, setCanvasZoom] = useState(1);

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
            setToPlatformId(layout.platforms[Math.min(3, layout.platforms.length - 1)].id);
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
          setToPlatformId(fallback.platforms[Math.min(3, fallback.platforms.length - 1)].id);
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

  const currentPlatforms: PlatformLayout[] = stationLayout?.platforms || [];
  const currentBridges: FootOverBridge[] = stationLayout?.bridges || [];

  // Determine SVG bounding coordinates
  const svgWidth = useMemo(() => {
    if (!currentPlatforms.length) return 400;
    const maxX = Math.max(...currentPlatforms.map(p => p.x + p.width), ...currentBridges.map(b => Math.max(b.x1, b.x2)));
    return Math.max(420, maxX + 60);
  }, [currentPlatforms, currentBridges]);

  const svgHeight = useMemo(() => {
    if (!currentPlatforms.length) return 350;
    const maxY = Math.max(...currentPlatforms.map(p => p.y + p.height), ...currentBridges.map(b => Math.max(b.y1, b.y2)));
    return Math.max(340, maxY + 60);
  }, [currentPlatforms, currentBridges]);

  const originPlatform = currentPlatforms.find(p => p.id === fromPlatformId);
  const destPlatform = currentPlatforms.find(p => p.id === toPlatformId);
  const bridgeUsed = currentBridges.find(b => b.id === walkRoute?.recommendedBridge?.id) || currentBridges[0];

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

      {/* 3. VISUAL PLATFORM TOPOLOGICAL MAP & FOB TRANSFER */}
      <View style={[styles.visualMapCard, { backgroundColor: '#090d16', borderColor: colors.cardBorder }]}>
        <View style={styles.visualMapHeader}>
          <View>
            <Text style={styles.visualMapTitle}>Platform Topological Layout</Text>
            <Text style={styles.visualMapSubtitle}>
              [SCHEMATIC SURVEY MODEL] Platforms, tracks, FOB bridges & lifts
            </Text>
          </View>

          <View style={styles.zoomButtonsRow}>
            <TouchableOpacity style={styles.zoomBtn} onPress={() => setCanvasZoom(z => Math.min(1.8, z + 0.2))}>
              <Text style={styles.zoomBtnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomBtn} onPress={() => setCanvasZoom(z => Math.max(0.6, z - 0.2))}>
              <Text style={styles.zoomBtnText}>−</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator>
          <ScrollView showsVerticalScrollIndicator>
            <Svg width={svgWidth * canvasZoom} height={svgHeight * canvasZoom} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
              {/* Tracks Running Alongside Platforms */}
              {currentPlatforms.map(p => (
                <G key={`track-${p.id}`}>
                  <Line
                    x1={p.x - 6}
                    y1={p.y}
                    x2={p.x - 6}
                    y2={p.y + p.height}
                    stroke="#334155"
                    strokeWidth={1.5}
                    strokeDasharray="4,4"
                  />
                  <Line
                    x1={p.x + p.width + 6}
                    y1={p.y}
                    x2={p.x + p.width + 6}
                    y2={p.y + p.height}
                    stroke="#334155"
                    strokeWidth={1.5}
                    strokeDasharray="4,4"
                  />
                </G>
              ))}

              {/* Platform Rectangles */}
              {currentPlatforms.map(p => {
                const isOrigin = p.id === fromPlatformId;
                const isDest = p.id === toPlatformId;
                const strokeColor = isOrigin ? '#22c55e' : isDest ? '#f59e0b' : p.line === 'western' ? '#ef4444' : '#3b82f6';
                const fillColor = isOrigin ? '#15803d' : isDest ? '#b45309' : '#1e293b';

                return (
                  <G key={p.id} onPress={() => setFromPlatformId(p.id)}>
                    <Rect
                      x={p.x}
                      y={p.y}
                      width={p.width}
                      height={p.height}
                      rx={4}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isOrigin || isDest ? 3 : 1}
                    />

                    {/* Platform Number Label */}
                    <SvgText
                      x={p.x + p.width / 2}
                      y={p.y + 16}
                      fill="#ffffff"
                      fontSize={9}
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {p.number.split(' ')[0]}
                    </SvgText>

                    {/* Train Halt indicator if berthed */}
                    {p.currentTrain && (
                      <Rect
                        x={p.x + 2}
                        y={p.y + 30}
                        width={p.width - 4}
                        height={60}
                        rx={2}
                        fill={p.currentTrain.rakeType === 'FAST' ? '#ef444490' : '#3b82f690'}
                      />
                    )}
                  </G>
                );
              })}

              {/* Foot-Over-Bridges Crossbars */}
              {currentBridges.map(b => {
                const isSelectedBridge = b.id === bridgeUsed?.id;
                return (
                  <G key={b.id}>
                    <Rect
                      x={Math.min(b.x1, b.x2)}
                      y={Math.min(b.y1, b.y2) - 8}
                      width={Math.abs(b.x2 - b.x1) || 240}
                      height={16}
                      rx={4}
                      fill={isSelectedBridge ? '#fbbf24' : '#475569'}
                      stroke={isSelectedBridge ? '#f59e0b' : '#64748b'}
                      strokeWidth={isSelectedBridge ? 2 : 1}
                      opacity={0.9}
                    />

                    {/* Bridge Name Label */}
                    <SvgText
                      x={Math.min(b.x1, b.x2) + 8}
                      y={Math.min(b.y1, b.y2) + 4}
                      fill={isSelectedBridge ? '#0f172a' : '#f8fafc'}
                      fontSize={8}
                      fontWeight="bold"
                    >
                      {b.name} {b.hasLifts ? '· 🛗 LIFT' : ''}
                    </SvgText>
                  </G>
                );
              })}

              {/* Transfer Walk Route Highlight Path */}
              {originPlatform && destPlatform && bridgeUsed && (
                <G>
                  {/* Vertical path from origin platform up to bridge */}
                  <Line
                    x1={originPlatform.x + originPlatform.width / 2}
                    y1={originPlatform.y + 40}
                    x2={originPlatform.x + originPlatform.width / 2}
                    y2={bridgeUsed.y1}
                    stroke="#22c55e"
                    strokeWidth={3}
                    strokeDasharray="4,4"
                  />

                  {/* Horizontal path across bridge */}
                  <Line
                    x1={originPlatform.x + originPlatform.width / 2}
                    y1={bridgeUsed.y1}
                    x2={destPlatform.x + destPlatform.width / 2}
                    y2={bridgeUsed.y1}
                    stroke="#22c55e"
                    strokeWidth={4}
                  />

                  {/* Vertical path down to destination platform */}
                  <Line
                    x1={destPlatform.x + destPlatform.width / 2}
                    y1={bridgeUsed.y1}
                    x2={destPlatform.x + destPlatform.width / 2}
                    y2={destPlatform.y + 40}
                    stroke="#f59e0b"
                    strokeWidth={3}
                    strokeDasharray="4,4"
                  />

                  {/* Start Point Marker */}
                  <Circle
                    cx={originPlatform.x + originPlatform.width / 2}
                    cy={originPlatform.y + 40}
                    r={6}
                    fill="#22c55e"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />

                  {/* End Destination Marker */}
                  <Circle
                    cx={destPlatform.x + destPlatform.width / 2}
                    cy={destPlatform.y + 40}
                    r={6}
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                </G>
              )}
            </Svg>
          </ScrollView>
        </ScrollView>

        <View style={styles.mapLegendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.legendText}>Origin PF</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Destination PF</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#fbbf24' }]} />
            <Text style={styles.legendText}>FOB Bridge</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
            <Text style={styles.legendText}>Central Line</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Western Line</Text>
          </View>
        </View>
      </View>

      {/* 4. Platform-to-Platform Wayfinding Form */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>
          Transfer Wayfinding
        </Text>

        <View style={styles.platformPickersRow}>
          {/* From Platform */}
          <View style={styles.platformPickerCol}>
            <Text style={[styles.pickerLabel, { color: colors.textMuted }]}>FROM PLATFORM</Text>
            <ScrollView style={styles.platformListMini} nestedScrollEnabled>
              {currentPlatforms.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.platformOption,
                    { borderColor: colors.cardBorder },
                    fromPlatformId === p.id && { backgroundColor: '#15803d', borderColor: '#22c55e' }
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
              {currentPlatforms.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.platformOption,
                    { borderColor: colors.cardBorder },
                    toPlatformId === p.id && { backgroundColor: '#b45309', borderColor: '#f59e0b' }
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

      {/* 5. Pedestrian Route Guide Output */}
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

          {/* Turn-by-turn guidance steps */}
          {walkRoute.directions && walkRoute.directions.length > 0 && (
            <View style={styles.directionsList}>
              {walkRoute.directions.map((step: string, idx: number) => (
                <View key={idx} style={styles.stepRow}>
                  <View style={[styles.stepNumberBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.stepNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.textPrimary }]}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14
  },
  stationChipsRow: {
    gap: 8,
    paddingBottom: 12
  },
  stationChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center'
  },
  stationChipCode: {
    fontSize: 14,
    fontWeight: '800'
  },
  stationChipName: {
    fontSize: 10,
    marginTop: 2
  },
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14
  },
  stationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    paddingVertical: 4,
    borderRadius: 6
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  stationDescription: {
    fontSize: 12,
    lineHeight: 17
  },
  visualMapCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14
  },
  visualMapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  visualMapTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  },
  visualMapSubtitle: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2
  },
  zoomButtonsRow: {
    flexDirection: 'row',
    gap: 6
  },
  zoomBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#475569'
  },
  zoomBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  mapLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#334155'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendText: {
    color: '#cbd5e1',
    fontSize: 10
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12
  },
  platformPickersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12
  },
  platformPickerCol: {
    flex: 1
  },
  pickerLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 6
  },
  platformListMini: {
    maxHeight: 120
  },
  platformOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6
  },
  platformOptionText: {
    fontSize: 12,
    fontWeight: '700'
  },
  transferArrowCol: {
    paddingHorizontal: 8
  },
  transferArrow: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20
  },
  loadingText: {
    fontSize: 12
  },
  routeResultCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 30
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
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
    borderRadius: 6
  },
  stepFreeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669'
  },
  directionsList: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#64748b30'
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18
  }
});
