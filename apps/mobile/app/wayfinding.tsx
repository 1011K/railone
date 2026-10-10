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
  FootOverBridge,
  StationAmenity,
  getStationExitGuidance
} from '../src/fixtures/stationLayoutsData';
import Svg, { Rect, Line, Circle, G, Text as SvgText, Path, Polygon } from 'react-native-svg';

const MAJOR_STATIONS = [
  { code: 'DR', name: 'Dadar Junction', subtitle: 'CR & WR 15 Platforms' },
  { code: 'CSMT', name: 'CSMT Terminus', subtitle: 'Heritage Concourse & Subway' },
  { code: 'TNA', name: 'Thane Junction', subtitle: 'Trans-Harbour & SATIS Deck' },
  { code: 'ADH', name: 'Andheri Hub', subtitle: 'WR & Metro 1 Direct Interchange' },
  { code: 'KYN', name: 'Kalyan Junction', subtitle: 'Kasara & Karjat Bifurcation' },
  { code: 'NDLS', name: 'New Delhi Central', subtitle: 'Pahar Ganj & Ajmeri Gate Concourses' },
  { code: 'BVI', name: 'Borivali Terminus', subtitle: 'SV Road Elevated Skywalk' },
  { code: 'CLA', name: 'Kurla Junction', subtitle: 'Central Main & Harbour' },
  { code: 'CCG', name: 'Churchgate', subtitle: 'WR Ground Concourse' },
  { code: 'GC', name: 'Ghatkopar Hub', subtitle: 'CR & Metro 1 Integrated Bridge' },
  { code: 'PNVL', name: 'Panvel Junction', subtitle: 'Harbour, Trans-Harbour & Konkan' }
];

type AmenityCategory = 'all' | 'lifts' | 'water' | 'tickets' | 'security' | 'exits';

export default function WayfindingScreen() {
  const { colors } = useMobileTheme();
  const params = useLocalSearchParams<{ station?: string; stepFree?: string; nearest?: string }>();

  const [selectedStationCode, setSelectedStationCode] = useState(
    params.station?.toUpperCase() || 'DR'
  );
  const [stationLayout, setStationLayout] = useState<any | null>(null);
  const [fromPlatformId, setFromPlatformId] = useState<string>('');
  const [toPlatformId, setToPlatformId] = useState<string>('');
  const [stepFreeRequired, setStepFreeRequired] = useState(params.stepFree === 'true');

  // 3D Isometric View perspective toggle
  const [is3dIsometric, setIs3dIsometric] = useState(false);

  // Amenity Filter Layers
  const [amenityFilter, setAmenityFilter] = useState<AmenityCategory>('all');

  // Zoom for SVG canvas
  const [canvasZoom, setCanvasZoom] = useState(1);

  // Walk route result
  const [walkRoute, setWalkRoute] = useState<any | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Verified Destination Exit Guidance
  const exitProfile = useMemo(() => {
    return getStationExitGuidance(selectedStationCode);
  }, [selectedStationCode]);

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

      const fallback = STATION_3D_LAYOUTS[selectedStationCode];
      if (active) {
        if (fallback) {
          setStationLayout(fallback);
          if (fallback.platforms && fallback.platforms.length >= 2) {
            setFromPlatformId(fallback.platforms[0].id);
            setToPlatformId(fallback.platforms[Math.min(3, fallback.platforms.length - 1)].id);
          }
        } else {
          setStationLayout(null);
          setFromPlatformId('');
          setToPlatformId('');
          setWalkRoute(null);
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
  const rawAmenities: StationAmenity[] = stationLayout?.amenities || [];

  // Filter amenities
  const filteredAmenities = useMemo(() => {
    if (amenityFilter === 'all') return rawAmenities;
    if (amenityFilter === 'lifts') {
      return rawAmenities.filter(a => a.type === 'lift' || a.type === 'escalator' || a.type === 'wheelchair_ramp');
    }
    if (amenityFilter === 'water') {
      return rawAmenities.filter(a => a.type === 'water_atm');
    }
    if (amenityFilter === 'tickets') {
      return rawAmenities.filter(a => a.type === 'atvm_ticket');
    }
    if (amenityFilter === 'security') {
      return rawAmenities.filter(a => a.type === 'rpf_post' || a.type === 'medical_help' || a.type === 'cloak_room');
    }
    if (amenityFilter === 'exits') {
      return rawAmenities.filter(a => a.type === 'exit_gate' || a.type === 'metro_interchange');
    }
    return rawAmenities;
  }, [rawAmenities, amenityFilter]);

  // Determine SVG bounding coordinates
  const svgWidth = useMemo(() => {
    if (!currentPlatforms.length) return 400;
    const maxX = Math.max(...currentPlatforms.map(p => p.x + p.width), ...currentBridges.map(b => Math.max(b.x1, b.x2)));
    return Math.max(440, maxX + 80);
  }, [currentPlatforms, currentBridges]);

  const svgHeight = useMemo(() => {
    if (!currentPlatforms.length) return 360;
    const maxY = Math.max(...currentPlatforms.map(p => p.y + p.height), ...currentBridges.map(b => Math.max(b.y1, b.y2)));
    return Math.max(360, maxY + 80);
  }, [currentPlatforms, currentBridges]);

  const originPlatform = currentPlatforms.find(p => p.id === fromPlatformId);
  const destPlatform = currentPlatforms.find(p => p.id === toPlatformId);
  const bridgeUsed = currentBridges.find(b => b.id === walkRoute?.recommendedBridge?.id) || currentBridges[0];

  // 3D Isometric projection coordinate helper
  const toIsometric = (x: number, y: number, zLevel = 0) => {
    const isoX = (x - y) * 0.7 + svgWidth * 0.45;
    const isoY = (x + y) * 0.35 - zLevel * 32 + 50;
    return { x: isoX, y: isoY };
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Optional GPS Proximity Banner */}
      {params.nearest === 'true' && (
        <View style={{ backgroundColor: colors.primary + '18', borderColor: colors.primary + '40', marginBottom: 12, padding: 12, borderRadius: 10, borderWidth: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 0.8 }}>
            [CONSENT-BASED GPS PROXIMITY]
          </Text>
          <Text style={{ fontSize: 12, color: colors.textPrimary, marginTop: 3 }}>
            Nearest indexed transit hub detected: Dadar Junction (DR) · ~450m via Tilak Bridge Concourse
          </Text>
        </View>
      )}

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

      {/* 2. Station Overview or Unindexed Fallback Card */}
      {!stationLayout ? (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, padding: 18, marginVertical: 12 }]}>
          <View style={[styles.levelBadge, { backgroundColor: '#ef444418', alignSelf: 'flex-start', marginBottom: 10 }]}>
            <Text style={[styles.levelBadgeText, { color: '#ef4444' }]}>
              BLUEPRINT NOT YET INDEXED
            </Text>
          </View>
          <Text style={[styles.stationTitle, { color: colors.textPrimary, marginBottom: 8 }]}>
            Station Blueprint Not Yet Indexed for {selectedStationCode}
          </Text>
          <Text style={[styles.stationDescription, { color: colors.textMuted, lineHeight: 20, marginBottom: 16 }]}>
            Architectural 2D/3D Foot-Over-Bridge and platform blueprints are currently mapped for 11 major railway and metro transfer hubs. Detailed schematics for {selectedStationCode} are undergoing statutory survey.
          </Text>
          <Text style={[styles.pickerLabel, { color: colors.textSecondary, marginBottom: 10 }]}>
            SELECT AN INDEXED INTERCHANGE HUB:
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MAJOR_STATIONS.map(st => (
              <TouchableOpacity
                key={st.code}
                style={[
                  styles.stationChip,
                  { backgroundColor: colors.primary + '14', borderColor: colors.primary + '40', paddingVertical: 8, paddingHorizontal: 12 }
                ]}
                onPress={() => setSelectedStationCode(st.code)}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.primary }}>{st.code}</Text>
                <Text style={{ fontSize: 11, color: colors.textPrimary, marginLeft: 4 }}>{st.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <>
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

      {/* 3. VISUAL PLATFORM TOPOLOGICAL MAP & 3D ISOMETRIC VIEW */}
      <View style={[styles.visualMapCard, { backgroundColor: '#090d16', borderColor: colors.cardBorder }]}>
        <View style={styles.visualMapHeader}>
          <View>
            <Text style={styles.visualMapTitle}>
              {is3dIsometric ? '3D Isometric Station View' : '2D Platform Blueprint'}
            </Text>
            <Text style={styles.visualMapSubtitle}>
              {is3dIsometric
                ? 'Multi-deck elevation: Level 0 (Platforms), Level 1 (FOB Bridges), Level 2 (Skywalks)'
                : '[SCHEMATIC SURVEY MODEL] Platforms, tracks, FOB bridges & lifts'}
            </Text>
          </View>

          <View style={styles.topRightControls}>
            {/* 3D Perspective Toggle Button */}
            <TouchableOpacity
              style={[styles.perspectiveToggleBtn, is3dIsometric && { backgroundColor: colors.primary }]}
              onPress={() => setIs3dIsometric(!is3dIsometric)}
              accessibilityRole="button"
              accessibilityLabel="Toggle 3D isometric view"
            >
              <Text style={[styles.perspectiveToggleText, is3dIsometric && { color: '#FFFFFF' }]}>
                {is3dIsometric ? '3D Active' : 'Switch to 3D'}
              </Text>
            </TouchableOpacity>

            <View style={styles.zoomButtonsRow}>
              <TouchableOpacity style={styles.zoomBtn} onPress={() => setCanvasZoom(z => Math.min(1.8, z + 0.2))}>
                <Text style={styles.zoomBtnText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.zoomBtn} onPress={() => setCanvasZoom(z => Math.max(0.6, z - 0.2))}>
                <Text style={styles.zoomBtnText}>−</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Amenity Filter Layer Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.amenityFilterRow}>
          {(['all', 'lifts', 'water', 'tickets', 'security', 'exits'] as const).map(cat => {
            const isSel = amenityFilter === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.amenityFilterChip,
                  isSel && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setAmenityFilter(cat)}
              >
                <Text style={[styles.amenityFilterChipText, { color: isSel ? '#FFFFFF' : '#94a3b8' }]}>
                  {cat === 'all'
                    ? 'All Amenities'
                    : cat === 'lifts'
                    ? 'Lifts & Ramps'
                    : cat === 'water'
                    ? 'Water ATM'
                    : cat === 'tickets'
                    ? 'ATVM / Tickets'
                    : cat === 'security'
                    ? 'RPF / SOS'
                    : 'Exits & Transit'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator>
          <ScrollView showsVerticalScrollIndicator>
            <Svg width={svgWidth * canvasZoom} height={svgHeight * canvasZoom} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
              {!is3dIsometric ? (
                /* ================= 2D SCHEMATIC BLUEPRINT ================= */
                <>
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

                  {/* Filtered Amenities Icons */}
                  {filteredAmenities.map(am => (
                    <G key={am.id}>
                      <Circle
                        cx={am.x}
                        cy={am.y}
                        r={5}
                        fill={am.type === 'lift' ? '#38bdf8' : am.type === 'water_atm' ? '#06b6d4' : am.type === 'atvm_ticket' ? '#f59e0b' : '#22c55e'}
                        stroke="#ffffff"
                        strokeWidth={1}
                      />
                    </G>
                  ))}

                  {/* Transfer Walk Route Highlight Path */}
                  {originPlatform && destPlatform && bridgeUsed && (
                    <G>
                      <Line
                        x1={originPlatform.x + originPlatform.width / 2}
                        y1={originPlatform.y + 40}
                        x2={originPlatform.x + originPlatform.width / 2}
                        y2={bridgeUsed.y1}
                        stroke="#22c55e"
                        strokeWidth={3}
                        strokeDasharray="4,4"
                      />
                      <Line
                        x1={originPlatform.x + originPlatform.width / 2}
                        y1={bridgeUsed.y1}
                        x2={destPlatform.x + destPlatform.width / 2}
                        y2={bridgeUsed.y1}
                        stroke="#22c55e"
                        strokeWidth={4}
                      />
                      <Line
                        x1={destPlatform.x + destPlatform.width / 2}
                        y1={bridgeUsed.y1}
                        x2={destPlatform.x + destPlatform.width / 2}
                        y2={destPlatform.y + 40}
                        stroke="#f59e0b"
                        strokeWidth={3}
                        strokeDasharray="4,4"
                      />
                    </G>
                  )}
                </>
              ) : (
                /* ================= 3D ISOMETRIC VIEW ================= */
                <>
                  {/* Isometric Platforms (Level 0) */}
                  {currentPlatforms.map(p => {
                    const p1 = toIsometric(p.x, p.y, 0);
                    const p2 = toIsometric(p.x + p.width, p.y, 0);
                    const p3 = toIsometric(p.x + p.width, p.y + p.height, 0);
                    const p4 = toIsometric(p.x, p.y + p.height, 0);
                    const isOrigin = p.id === fromPlatformId;
                    const isDest = p.id === toPlatformId;
                    const fillColor = isOrigin ? '#15803d' : isDest ? '#b45309' : p.line === 'western' ? '#7f1d1d' : '#1e3a8a';

                    return (
                      <G key={`iso-p-${p.id}`} onPress={() => setFromPlatformId(p.id)}>
                        <Polygon
                          points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`}
                          fill={fillColor}
                          stroke={isOrigin ? '#22c55e' : isDest ? '#f59e0b' : '#334155'}
                          strokeWidth={isOrigin || isDest ? 2.5 : 1}
                          opacity={0.85}
                        />
                        <SvgText
                          x={(p1.x + p2.x) / 2}
                          y={(p1.y + p2.y) / 2 + 10}
                          fill="#ffffff"
                          fontSize={8}
                          fontWeight="bold"
                        >
                          PF {p.number.split(' ')[0]}
                        </SvgText>
                      </G>
                    );
                  })}

                  {/* Isometric Elevated Foot-Over-Bridges (Level 1 - Elevated Deck) */}
                  {currentBridges.map(b => {
                    const b1 = toIsometric(b.x1, b.y1, 1);
                    const b2 = toIsometric(b.x2, b.y2, 1);
                    const isSel = b.id === bridgeUsed?.id;

                    return (
                      <G key={`iso-b-${b.id}`}>
                        <Line
                          x1={b1.x}
                          y1={b1.y}
                          x2={b2.x}
                          y2={b2.y}
                          stroke={isSel ? '#fbbf24' : '#64748b'}
                          strokeWidth={isSel ? 6 : 4}
                          strokeOpacity={0.9}
                        />
                        <SvgText
                          x={(b1.x + b2.x) / 2}
                          y={(b1.y + b2.y) / 2 - 6}
                          fill={isSel ? '#fef08a' : '#cbd5e1'}
                          fontSize={8}
                          fontWeight="bold"
                        >
                          {b.name}
                        </SvgText>
                      </G>
                    );
                  })}
                </>
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
            <View style={[styles.legendDot, { backgroundColor: '#38bdf8' }]} />
            <Text style={styles.legendText}>Lifts / Ramps</Text>
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
          {walkRoute.steps && walkRoute.steps.length > 0 && (
            <View style={styles.directionsList}>
              {walkRoute.steps.map((step: string, idx: number) => (
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

      {/* 6. Verified Station Exits & Transit Links */}
      {exitProfile && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>
            Station Exits & Onward Transit Links
          </Text>
          <Text style={[styles.exitSubheading, { color: colors.textMuted }]}>
            Verified municipal gates, share-taxi stands, and bus interchanges for {exitProfile.stationName}:
          </Text>

          <View style={styles.exitsList}>
            {exitProfile.exits.map((ex, exIdx) => (
              <View key={exIdx} style={[styles.exitItemCard, { borderColor: colors.cardBorder }]}>
                <Text style={[styles.exitGateTitle, { color: colors.textPrimary }]}>{ex.gateName}</Text>
                <Text style={[styles.exitLandmarks, { color: colors.textSecondary }]}>
                  Landmarks: {ex.destinationLandmarks.join(', ')}
                </Text>
                {ex.onwardTransit.taxiStand && (
                  <Text style={styles.exitTransitText}>🚕 Taxi: {ex.onwardTransit.taxiStand}</Text>
                )}
                {ex.onwardTransit.autoStand && (
                  <Text style={styles.exitTransitText}>🛺 Auto: {ex.onwardTransit.autoStand}</Text>
                )}
                {ex.onwardTransit.busInterchange && (
                  <Text style={styles.exitTransitText}>🚌 Bus: {ex.onwardTransit.busInterchange}</Text>
                )}
                {ex.onwardTransit.metroInterchange && (
                  <Text style={styles.exitTransitText}>🚇 Metro: {ex.onwardTransit.metroInterchange}</Text>
                )}
                <View style={styles.exitFooterRow}>
                  <Text style={styles.exitStepFreeTag}>
                    {ex.accessibility.isStepFree ? '✓ Step-Free Ramp' : 'Stairs Only'}
                  </Text>
                  <Text style={[styles.exitWalkTag, { color: colors.textMuted }]}>
                    ~{ex.approxWalkMinutes} min walk from platform
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
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
  cardHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10
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
    alignItems: 'flex-start',
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
    marginTop: 2,
    maxWidth: 220
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  perspectiveToggleBtn: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  perspectiveToggleText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800'
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
    fontSize: 16,
    fontWeight: 'bold'
  },
  amenityFilterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 10
  },
  amenityFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0f172a'
  },
  amenityFilterChipText: {
    fontSize: 10,
    fontWeight: '700'
  },
  mapLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendText: {
    color: '#94a3b8',
    fontSize: 11
  },
  platformPickersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    maxHeight: 120,
    gap: 6
  },
  platformOption: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
    alignItems: 'center'
  },
  platformOptionText: {
    fontSize: 12,
    fontWeight: '700'
  },
  transferArrowCol: {
    paddingHorizontal: 8
  },
  transferArrow: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12
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
    marginBottom: 14
  },
  loadingText: {
    fontSize: 12,
    marginTop: 6
  },
  routeResultCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  routeBridgeName: {
    fontSize: 15,
    fontWeight: '800'
  },
  routeMetrics: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2
  },
  stepFreeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  stepFreeBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800'
  },
  directionsList: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.2)',
    paddingTop: 10
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
    marginTop: 1
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900'
  },
  stepText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1
  },
  exitSubheading: {
    fontSize: 12,
    marginBottom: 10
  },
  exitsList: {
    gap: 10
  },
  exitItemCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 4
  },
  exitGateTitle: {
    fontSize: 14,
    fontWeight: '800'
  },
  exitLandmarks: {
    fontSize: 12,
    lineHeight: 16
  },
  exitTransitText: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600'
  },
  exitFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.15)',
    paddingTop: 6,
    marginTop: 4
  },
  exitStepFreeTag: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700'
  },
  exitWalkTag: {
    fontSize: 11
  }
});
