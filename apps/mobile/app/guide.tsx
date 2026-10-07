import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMobileTheme } from '../src/theme/ThemeContext';
import { getStationExitGuidance, VERIFIED_STATION_EXITS } from '../src/fixtures/stationLayoutsData';

export default function GuideScreen() {
  const { colors } = useMobileTheme();
  const params = useLocalSearchParams<{
    from?: string;
    to?: string;
    departureTime?: string;
    arrivalTime?: string;
    trainNumber?: string;
    trainName?: string;
    departurePlatform?: string;
    arrivalPlatform?: string;
    duration?: string;
    hasTransfer?: string;
    transferStation?: string;
    transferStationName?: string;
    transferPlatformFrom?: string;
    transferPlatformTo?: string;
    transferWalkMinutes?: string;
    isAc?: string;
    fare?: string;
  }>();

  const fromCode = params.from || 'TNA';
  const toCode = params.to || 'CSMT';
  const departureTime = params.departureTime || '18:35';
  const arrivalTime = params.arrivalTime || '19:20';
  const trainNumber = params.trainNumber || '95112';
  const trainName = params.trainName || 'Fast Local';
  const initialDeparturePlatform = params.departurePlatform || '5';
  const arrivalPlatform = params.arrivalPlatform || '4';
  const hasTransfer = params.hasTransfer === 'true';
  const transferStation = params.transferStation || 'DR';
  const transferStationName = params.transferStationName || 'Dadar Junction';
  const isAc = params.isAc === 'true';

  // Navigation State Machine (1 to 12)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepFreeRequired, setStepFreeRequired] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [easyMode, setEasyMode] = useState<boolean>(false);

  // Platform Change Reaction State
  const [currentPlatform, setCurrentPlatform] = useState<string>(initialDeparturePlatform);
  const [platformChangeAlert, setPlatformChangeAlert] = useState<{
    originalPlatform: string;
    newPlatform: string;
    walkMinutes: number;
    minutesToDeparture: number;
    isSafe: boolean;
    recommendedNextTrain?: string;
  } | null>(null);

  // Coach Alignment Selection
  const [coachPreference, setCoachPreference] = useState<'general' | 'first' | 'ladies' | 'divyangjan'>(
    isAc ? 'first' : 'general'
  );

  // Destination Exit Guidance
  const destExitProfile = useMemo(() => {
    return getStationExitGuidance(toCode) || VERIFIED_STATION_EXITS['CSMT'];
  }, [toCode]);

  const [selectedExitId, setSelectedExitId] = useState<string>(
    destExitProfile?.exits[0]?.exitId || ''
  );

  // 12 Navigation Steps Definitions
  const STEPS = [
    { id: 1, title: 'Step 1: Near Origin Station', subtitle: 'GPS & Station Approach' },
    { id: 2, title: 'Step 2: Ticket Verification', subtitle: 'UTS / Smart Card / ATVM' },
    { id: 3, title: 'Step 3: Recommended Entrance', subtitle: 'Concourse Gate Guidance' },
    { id: 4, title: 'Step 4: Concourse to Platform Walk', subtitle: 'FOB Bridge & Accessibility' },
    { id: 5, title: 'Step 5: Platform Arrival & Indicator', subtitle: 'Platform Verification' },
    { id: 6, title: 'Step 6: Coach Alignment Zone', subtitle: 'Wagenstandsanzeiger Markers' },
    { id: 7, title: 'Step 7: Boarding Countdown', subtitle: 'Approaching Train Alert' },
    { id: 8, title: 'Step 8: Onboard Transit & Halts', subtitle: 'Live Halts & Delay Monitor' },
    { id: 9, title: hasTransfer ? 'Step 9: Interchange Transfer' : 'Step 9: Mid-Route Monitoring', subtitle: hasTransfer ? `${transferStationName} Transfer Walk` : 'Through-Route Track Status' },
    { id: 10, title: hasTransfer ? 'Step 10: Connecting Leg Boarding' : 'Step 10: Final Line Section', subtitle: hasTransfer ? 'Next Train Platform' : 'Express Approach' },
    { id: 11, title: 'Step 11: Destination Approach', subtitle: 'Door Side & Platform Alighting' },
    { id: 12, title: 'Step 12: Destination Exit Guidance', subtitle: 'Gates, Transit & Road Links' }
  ];

  // Trigger Platform Change Reaction
  const simulatePlatformChange = (newPf: string) => {
    const oldPf = currentPlatform;
    const walkMins = stepFreeRequired ? 5 : 4;
    const minutesToDeparture = 2; // Simulating train arriving in 2 mins
    const isSafe = walkMins <= minutesToDeparture;

    setCurrentPlatform(newPf);
    setPlatformChangeAlert({
      originalPlatform: oldPf,
      newPlatform: newPf,
      walkMinutes: walkMins,
      minutesToDeparture,
      isSafe,
      recommendedNextTrain: '18:39 Slow Local (PF 1)'
    });
  };

  const selectedExit = destExitProfile?.exits.find(e => e.exitId === selectedExitId) || destExitProfile?.exits[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Offline Survival Banner */}
      <View style={[styles.offlineBanner, { backgroundColor: isOffline ? '#991b1b' : '#1e293b' }]}>
        <View style={styles.offlineBannerLeft}>
          <Text style={styles.offlineBannerText}>
            {isOffline
              ? '[OFFLINE SURVIVAL MODE] Last updated: 18:30 · Local timetable cache active'
              : '[VERIFIED TIMETABLE] Active Navigation Engine'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsOffline(!isOffline)}
          style={styles.offlineToggleBtn}
          accessibilityRole="button"
          accessibilityLabel="Toggle offline test mode"
        >
          <Text style={styles.offlineToggleBtnText}>{isOffline ? 'Go Online' : 'Test Offline'}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Journey Header Bar */}
      <View style={[styles.journeyHeader, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.journeyHeaderMain}>
          <Text style={[styles.journeyStations, { color: colors.textPrimary }]}>
            {fromCode} ➔ {toCode}
          </Text>
          <Text style={[styles.trainSubtitle, { color: colors.textSecondary }]}>
            {trainNumber} · {trainName} {isAc ? '(AC Local)' : ''}
          </Text>
        </View>

        <View style={styles.headerRightControls}>
          <View style={styles.easyModeToggle}>
            <Text style={[styles.easyModeLabel, { color: colors.textMuted }]}>Easy Mode</Text>
            <Switch
              value={easyMode}
              onValueChange={setEasyMode}
              trackColor={{ false: colors.cardBorder, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      {/* 3. Platform Change Alert (Platform-Change Reaction) */}
      {platformChangeAlert && (
        <View style={[styles.platformAlertCard, { backgroundColor: platformChangeAlert.isSafe ? '#065f46' : '#7f1d1d' }]}>
          <View style={styles.alertHeaderRow}>
            <Text style={styles.alertTitle}>
              {platformChangeAlert.isSafe ? '⚡ PLATFORM CHANGED' : '⚠️ URGENT: PLATFORM CHANGE WARNING'}
            </Text>
            <TouchableOpacity onPress={() => setPlatformChangeAlert(null)}>
              <Text style={styles.dismissAlertText}>Dismiss</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.alertBodyText}>
            Train changed from Platform {platformChangeAlert.originalPlatform} ➔ Platform {platformChangeAlert.newPlatform}.
          </Text>
          <Text style={styles.alertSubText}>
            Required Walk: {platformChangeAlert.walkMinutes} min via Middle FOB. Time to Departure: {platformChangeAlert.minutesToDeparture} min.
          </Text>

          {!platformChangeAlert.isSafe && (
            <View style={styles.missedConnectionBox}>
              <Text style={styles.missedWarningText}>
                CANNOT SAFELY CATCH TRAIN — Walk time exceeds departure! Stay safe, do NOT run across tracks!
              </Text>
              <Text style={styles.nextTrainOfferText}>
                Recommended Alternative: {platformChangeAlert.recommendedNextTrain}
              </Text>
              <TouchableOpacity
                style={styles.switchTrainBtn}
                onPress={() => {
                  Alert.alert('Switched to Next Service', `Re-routed to ${platformChangeAlert.recommendedNextTrain}.`);
                  setPlatformChangeAlert(null);
                }}
              >
                <Text style={styles.switchTrainBtnText}>Switch to Recommended Next Train</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* 4. Horizontal Steps Progress Indicator */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stepsCarousel}
      >
        {STEPS.map(s => {
          const isCurrent = s.id === currentStep;
          const isDone = s.id < currentStep;

          return (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.stepChip,
                {
                  backgroundColor: isCurrent ? colors.primary : isDone ? '#166534' : colors.card,
                  borderColor: isCurrent ? colors.primary : colors.cardBorder
                }
              ]}
              onPress={() => setCurrentStep(s.id)}
            >
              <Text style={[styles.stepChipNumber, { color: isCurrent || isDone ? '#FFFFFF' : colors.textMuted }]}>
                {s.id}
              </Text>
              <Text style={[styles.stepChipTitle, { color: isCurrent || isDone ? '#FFFFFF' : colors.textPrimary }]}>
                {s.title.split(':')[1]?.trim() || s.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 5. Main Active Step Content */}
      <ScrollView contentContainerStyle={styles.contentBody}>
        {/* STEP 1: Near Origin Station */}
        {currentStep === 1 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              Step 1: Station Proximity & Entry
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }, easyMode && styles.stepDescriptionEasy]}>
              You are currently near {fromCode} station (approx. 120m away).
            </Text>

            <View style={styles.infoRowBox}>
              <Text style={[styles.infoBoxLabel, { color: colors.textMuted }]}>Recommended Station Entrance:</Text>
              <Text style={[styles.infoBoxValue, { color: colors.textPrimary }]}>
                {fromCode === 'TNA' ? 'West Concourse SATIS Gate (direct access to PF 3/4/5)' : 'Main Station Road Concourse'}
              </Text>
            </View>

            <View style={styles.guidanceBox}>
              <Text style={styles.guidanceText}>
                Guidance: Proceed to the pedestrian security entrance. Have your mobile ticket or season pass ready.
              </Text>
            </View>
          </View>
        )}

        {/* STEP 2: Ticket Verification */}
        {currentStep === 2 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              Step 2: Ticket Purchase Verification
            </Text>
            <View style={styles.ticketStatusCard}>
              <View style={styles.ticketValidPill}>
                <Text style={styles.ticketValidPillText}>TICKET ACTIVE · UTS VALIDATED</Text>
              </View>
              <Text style={styles.ticketDetailText}>
                Class: {isAc ? 'AC First Class' : 'Second Class (II)'} · Single Journey
              </Text>
              <Text style={styles.ticketRouteText}>
                Valid from {fromCode} to {toCode}
              </Text>
              <Text style={styles.ticketExpiryText}>
                Validity: 3 hours from booking time · Section 138 compliant
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.actionOutlineBtn, { borderColor: colors.primary }]}
              onPress={() => router.push('/tte')}
            >
              <Text style={[styles.actionOutlineBtnText, { color: colors.primary }]}>
                Show TTE / TC Inspector QR Payload
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: Recommended Entrance */}
        {currentStep === 3 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              Step 3: Recommended Entrance Gate
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              {fromCode === 'TNA'
                ? 'Enter through West Deck SATIS Gate 2. This entrance leads directly to the Middle Foot-Over-Bridge and avoids the crowded ticket hall.'
                : 'Enter through Central Passenger Concourse Gate 1.'}
            </Text>

            <View style={styles.amenityChipRow}>
              <View style={styles.amenityChip}>
                <Text style={styles.amenityChipText}>ATVM Counters: Available</Text>
              </View>
              <View style={styles.amenityChip}>
                <Text style={styles.amenityChipText}>RPF Post: 20m inside gate</Text>
              </View>
            </View>
          </View>
        )}

        {/* STEP 4: Concourse / FOB Walk */}
        {currentStep === 4 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              Step 4: Concourse to Platform Walk
            </Text>

            <View style={styles.accessibilitySwitchRow}>
              <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>
                Require Step-Free Route (Elevator / Lift):
              </Text>
              <Switch
                value={stepFreeRequired}
                onValueChange={setStepFreeRequired}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
              />
            </View>

            <View style={styles.walkRouteBox}>
              <Text style={styles.walkStepText}>
                1. Walk along the main concourse toward Foot-Over-Bridge stairs (40m).
              </Text>
              <Text style={styles.walkStepText}>
                {stepFreeRequired
                  ? '2. Take Middle FOB Accessible Elevator 2 up to Concourse Level 1.'
                  : '2. Ascend stairs / escalator onto Middle Foot-Over-Bridge.'}
              </Text>
              <Text style={styles.walkStepText}>
                3. Walk 60m along bridge corridor toward Platform {currentPlatform} indicator.
              </Text>
              <Text style={styles.walkStepText}>
                {stepFreeRequired
                  ? `4. Take Elevator down directly onto Platform ${currentPlatform}.`
                  : `4. Descend stairs onto Platform ${currentPlatform}.`}
              </Text>
            </View>

            <Text style={[styles.estimatedWalkTime, { color: colors.primary }]}>
              Estimated Walking Time: {stepFreeRequired ? '4-5 min' : '3 min'}
            </Text>
          </View>
        )}

        {/* STEP 5: Platform Arrival & Indicator */}
        {currentStep === 5 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              Step 5: Platform Arrival & Digital Indicator
            </Text>
            <View style={styles.platformBadgeLarge}>
              <Text style={styles.platformBadgeLargeText}>PLATFORM {currentPlatform}</Text>
            </View>

            <View style={styles.indicatorBoardSim}>
              <Text style={styles.indicatorBoardHeader}>DIGITAL PLATFORM INDICATOR</Text>
              <Text style={styles.indicatorBoardTrain}>
                {departureTime} · {trainName.toUpperCase()} · CSMT FAST
              </Text>
              <Text style={styles.indicatorBoardRake}>12 CAR RAKE · ON TIME</Text>
            </View>

            {/* Platform Change Simulation Button */}
            <View style={styles.simulatePlatformChangeBox}>
              <Text style={[styles.simTitle, { color: colors.textMuted }]}>
                Test Platform-Change Reaction Engine:
              </Text>
              <TouchableOpacity
                style={styles.simulateChangeBtn}
                onPress={() => simulatePlatformChange(currentPlatform === '5' ? '4' : '5')}
              >
                <Text style={styles.simulateChangeBtnText}>
                  Simulate Platform Change ({currentPlatform} ➔ {currentPlatform === '5' ? '4' : '5'})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 6: Coach Alignment Zone */}
        {currentStep === 6 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              Step 6: Coach Alignment Zone
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Select your compartment profile to position yourself on the platform before the train arrives:
            </Text>

            {/* Coach Category Tabs */}
            <View style={styles.coachTabsRow}>
              {(['general', 'first', 'ladies', 'divyangjan'] as const).map(c => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.coachTabBtn,
                    {
                      backgroundColor: coachPreference === c ? colors.primary : colors.card,
                      borderColor: coachPreference === c ? colors.primary : colors.cardBorder
                    }
                  ]}
                  onPress={() => setCoachPreference(c)}
                >
                  <Text style={[styles.coachTabText, { color: coachPreference === c ? '#FFFFFF' : colors.textSecondary }]}>
                    {c === 'general' ? 'General (II)' : c === 'first' ? 'First Class' : c === 'ladies' ? 'Ladies' : 'Divyangjan'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Alignment Graphic Marker */}
            <View style={styles.alignmentMarkerCard}>
              <Text style={styles.markerTitle}>
                Recommended Platform Marker:
              </Text>
              <Text style={styles.markerPositionText}>
                {coachPreference === 'first'
                  ? 'COACH 4 (Orange Strip Indicator) — 60m from Kalyan end'
                  : coachPreference === 'ladies'
                  ? 'COACH 2 & COACH 7 (Yellow/Green Indicator)'
                  : coachPreference === 'divyangjan'
                  ? 'COACH 6 (Tactile Paving & Blue Handicap Wheelchair Logo)'
                  : 'COACH 1, 3, 5, 8, 9, 10, 11, 12'}
              </Text>
              <Text style={styles.markerNote}>
                12-Car Rake: Stand between Pillar 8 and Pillar 12 for easy boarding.
              </Text>
            </View>
          </View>
        )}

        {/* STEP 7: Boarding Countdown */}
        {currentStep === 7 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              Step 7: Boarding Countdown & Train Approaching
            </Text>

            <View style={styles.countdownContainer}>
              <Text style={styles.countdownLabel}>TRAIN APPROACHING PLATFORM {currentPlatform}</Text>
              <Text style={styles.countdownClock}>01 : 45</Text>
              <Text style={styles.countdownSub}>Minutes Remaining</Text>
            </View>

            <View style={styles.safetyGuidanceBox}>
              <Text style={styles.safetyText}>
                SAFETY NOTICE: Stand behind the yellow tactile safety line. Allow alighting passengers to exit first. Do NOT board moving train.
              </Text>
            </View>
          </View>
        )}

        {/* STEP 8: Onboard Transit & Halts */}
        {currentStep === 8 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              Step 8: Onboard Transit & Upcoming Halts
            </Text>

            <View style={styles.onboardStatusRow}>
              <View style={styles.speedPill}>
                <Text style={styles.speedPillText}>SPEED: 68 KM/H</Text>
              </View>
              <View style={styles.onTimePill}>
                <Text style={styles.onTimePillText}>SCHEDULE: ON TIME</Text>
              </View>
            </View>

            <View style={styles.haltsList}>
              <Text style={styles.haltsListHeader}>Stopping Pattern:</Text>
              {[
                { stn: 'Thane (TNA)', time: '18:35', passed: true },
                { stn: 'Ghatkopar (GC)', time: '18:48', passed: false, current: true },
                { stn: 'Kurla (CLA)', time: '18:54', passed: false },
                { stn: 'Dadar (DR)', time: '19:03', passed: false },
                { stn: 'Byculla (BY)', time: '19:12', passed: false },
                { stn: 'CSMT Terminus', time: '19:20', passed: false }
              ].map((h, idx) => (
                <View key={idx} style={styles.haltRow}>
                  <View style={[styles.haltDot, h.passed && styles.haltDotPassed, h.current && styles.haltDotCurrent]} />
                  <Text style={[styles.haltName, { color: colors.textPrimary }, h.current && { fontWeight: '900', color: colors.primary }]}>
                    {h.stn}
                  </Text>
                  <Text style={[styles.haltTime, { color: colors.textMuted }]}>{h.time}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* STEP 9: Interchange Station Approach / Dadar Walkthrough */}
        {currentStep === 9 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              Step 9: Dadar Interchange Walkthrough
            </Text>

            <View style={styles.dadarWalkthroughCard}>
              <View style={styles.dadarInterchangeHeader}>
                <Text style={styles.dadarInterchangeTitle}>
                  DADAR JUNCTION TRANSFER (CR ➔ WR)
                </Text>
                <Text style={styles.dadarInterchangeSub}>
                  Central PF 4 ➔ Western PF 3 (180m Walk)
                </Text>
              </View>

              <View style={styles.dadarStepsList}>
                <Text style={styles.dadarStepItem}>
                  1. Alight at Dadar Central Platform 4. Turn toward the North end of the platform.
                </Text>
                <Text style={styles.dadarStepItem}>
                  2. Ascend North Foot-Over-Bridge (Avoid Middle FOB during 18:00–20:00 crush hours).
                </Text>
                <Text style={styles.dadarStepItem}>
                  3. Walk straight 140m across the railway tracks corridor connecting Central to Western.
                </Text>
                <Text style={styles.dadarStepItem}>
                  4. Follow green digital signage for "Western Line Churchgate Fast Locals".
                </Text>
                <Text style={styles.dadarStepItem}>
                  5. Descend stairs directly onto Western Railway Platform 3.
                </Text>
              </View>

              <View style={styles.dadarMetricsRow}>
                <Text style={styles.dadarMetric}>Physical Walk: 180m</Text>
                <Text style={styles.dadarMetric}>Transfer Time: 6-7 min</Text>
                <Text style={styles.dadarMetric}>Lift Available: Yes</Text>
              </View>
            </View>
          </View>
        )}

        {/* STEP 10: Connecting Platform & Boarding */}
        {currentStep === 10 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              Step 10: Connecting Platform & Train Boarding
            </Text>
            <View style={styles.platformBadgeLarge}>
              <Text style={styles.platformBadgeLargeText}>PLATFORM 3 (WR)</Text>
            </View>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Arrived at connecting platform. Next departure: 19:12 Churchgate Fast Local.
            </Text>
          </View>
        )}

        {/* STEP 11: Destination Station Approach */}
        {currentStep === 11 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              Step 11: Destination Approach & Door Side
            </Text>

            <View style={styles.doorSideCard}>
              <Text style={styles.doorSideAlert}>DOORS WILL OPEN ON THE LEFT</Text>
              <Text style={styles.doorSideSub}>
                Approaching {toCode} (Platform {arrivalPlatform}). Prepare to alight.
              </Text>
            </View>

            <View style={styles.crowdExitGuidance}>
              <Text style={styles.crowdExitTitle}>Commuter Flow Advice:</Text>
              <Text style={styles.crowdExitText}>
                Step onto the platform promptly. Main exits are located toward the FRONT of the rake.
              </Text>
            </View>
          </View>
        )}

        {/* STEP 12: Destination Exit Guidance */}
        {currentStep === 12 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              Step 12: Destination Exit Guidance ({toCode})
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Verified exit gates and onward connections for {destExitProfile?.stationName || toCode}:
            </Text>

            {/* Exit Gate Selector Tabs */}
            <View style={styles.exitGateTabsRow}>
              {destExitProfile?.exits.map(ex => (
                <TouchableOpacity
                  key={ex.exitId}
                  style={[
                    styles.exitGateTab,
                    {
                      backgroundColor: selectedExitId === ex.exitId ? colors.primary : colors.card,
                      borderColor: selectedExitId === ex.exitId ? colors.primary : colors.cardBorder
                    }
                  ]}
                  onPress={() => setSelectedExitId(ex.exitId)}
                >
                  <Text style={[styles.exitGateTabText, { color: selectedExitId === ex.exitId ? '#FFFFFF' : colors.textPrimary }]}>
                    {ex.gateName.split('(')[0].trim()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected Exit Details Card */}
            {selectedExit && (
              <View style={styles.exitDetailsCard}>
                <Text style={styles.exitNameTitle}>{selectedExit.gateName}</Text>

                <View style={styles.landmarksSection}>
                  <Text style={styles.sectionSmallLabel}>Landmarks & Roads:</Text>
                  {selectedExit.destinationLandmarks.map((l, lIdx) => (
                    <Text key={lIdx} style={styles.landmarkItem}>• {l}</Text>
                  ))}
                </View>

                <View style={styles.transitSection}>
                  <Text style={styles.sectionSmallLabel}>Onward Transit Link:</Text>
                  {selectedExit.onwardTransit.metroInterchange && (
                    <Text style={styles.transitItem}>🚇 Metro: {selectedExit.onwardTransit.metroInterchange}</Text>
                  )}
                  {selectedExit.onwardTransit.taxiStand && (
                    <Text style={styles.transitItem}>🚕 Taxi: {selectedExit.onwardTransit.taxiStand}</Text>
                  )}
                  {selectedExit.onwardTransit.autoStand && (
                    <Text style={styles.transitItem}>🛺 Auto: {selectedExit.onwardTransit.autoStand}</Text>
                  )}
                  {selectedExit.onwardTransit.busInterchange && (
                    <Text style={styles.transitItem}>🚌 Bus: {selectedExit.onwardTransit.busInterchange}</Text>
                  )}
                </View>

                <View style={styles.exitAccessibilityRow}>
                  <Text style={styles.accessibilityBadge}>
                    {selectedExit.accessibility.isStepFree ? '✓ Step-Free Ramp Available' : 'Stairs Only'}
                  </Text>
                  <Text style={styles.walkMinutesBadge}>
                    ~{selectedExit.approxWalkMinutes} min walk from platform
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.finishTripBtn, { backgroundColor: '#15803d' }]}
              onPress={() => router.replace('/(tabs)/journeys')}
            >
              <Text style={styles.finishTripBtnText}>Journey Complete · Back to Departures</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 6. Step Navigation Footer Buttons */}
      <View style={[styles.footerNav, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={[styles.footerNavBtn, { opacity: currentStep === 1 ? 0.4 : 1 }]}
          disabled={currentStep === 1}
          onPress={() => setCurrentStep(s => Math.max(1, s - 1))}
          accessibilityRole="button"
          accessibilityLabel="Previous navigation step"
        >
          <Text style={[styles.footerNavBtnText, { color: colors.textPrimary }]}>◀ Previous</Text>
        </TouchableOpacity>

        <Text style={[styles.footerStepIndicator, { color: colors.textSecondary }]}>
          Step {currentStep} of 12
        </Text>

        <TouchableOpacity
          style={[styles.footerNavBtnPrimary, { backgroundColor: colors.primary }]}
          onPress={() => {
            if (currentStep < 12) {
              setCurrentStep(s => s + 1);
            } else {
              router.replace('/(tabs)/journeys');
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Next navigation step"
        >
          <Text style={styles.footerNavBtnPrimaryText}>
            {currentStep === 12 ? 'Finish' : 'Next Step ▶'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  offlineBannerLeft: {
    flex: 1
  },
  offlineBannerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  offlineToggleBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  offlineToggleBtnText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700'
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  journeyHeaderMain: {
    flex: 1
  },
  journeyStations: {
    fontSize: 18,
    fontWeight: '900'
  },
  trainSubtitle: {
    fontSize: 11,
    marginTop: 2
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  easyModeToggle: {
    alignItems: 'center'
  },
  easyModeLabel: {
    fontSize: 9,
    fontWeight: '700'
  },
  platformAlertCard: {
    margin: 12,
    padding: 14,
    borderRadius: 12
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  alertTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900'
  },
  dismissAlertText: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '700'
  },
  alertBodyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  alertSubText: {
    color: '#fecaca',
    fontSize: 11,
    marginTop: 2
  },
  missedConnectionBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 10,
    marginTop: 10
  },
  missedWarningText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '800'
  },
  nextTrainOfferText: {
    color: '#fef08a',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '700'
  },
  switchTrainBtn: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 8
  },
  switchTrainBtnText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '900'
  },
  stepsCarousel: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8
  },
  stepChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6
  },
  stepChipNumber: {
    fontSize: 11,
    fontWeight: '900'
  },
  stepChipTitle: {
    fontSize: 11,
    fontWeight: '700'
  },
  contentBody: {
    padding: 16
  },
  stepCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8
  },
  cardHeaderEasy: {
    fontSize: 22
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14
  },
  stepDescriptionEasy: {
    fontSize: 16,
    lineHeight: 22
  },
  infoRowBox: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  infoBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4
  },
  infoBoxValue: {
    fontSize: 14,
    fontWeight: '800'
  },
  guidanceBox: {
    backgroundColor: '#0369a120',
    borderLeftWidth: 3,
    borderLeftColor: '#0284c7',
    padding: 10,
    borderRadius: 6
  },
  guidanceText: {
    color: '#0284c7',
    fontSize: 12,
    fontWeight: '600'
  },
  ticketStatusCard: {
    backgroundColor: '#065f4625',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14
  },
  ticketValidPill: {
    backgroundColor: '#059669',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8
  },
  ticketValidPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900'
  },
  ticketDetailText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '800'
  },
  ticketRouteText: {
    color: '#34d399',
    fontSize: 13,
    marginTop: 2
  },
  ticketExpiryText: {
    color: '#6ee7b7',
    fontSize: 11,
    marginTop: 4
  },
  actionOutlineBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center'
  },
  actionOutlineBtnText: {
    fontSize: 13,
    fontWeight: '800'
  },
  amenityChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6
  },
  amenityChip: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  amenityChipText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700'
  },
  accessibilitySwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700'
  },
  walkRouteBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 12
  },
  walkStepText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18
  },
  estimatedWalkTime: {
    fontSize: 13,
    fontWeight: '800'
  },
  platformBadgeLarge: {
    backgroundColor: '#1d4ed8',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 14
  },
  platformBadgeLargeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900'
  },
  indicatorBoardSim: {
    backgroundColor: '#090d16',
    borderWidth: 2,
    borderColor: '#f59e0b',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16
  },
  indicatorBoardHeader: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  },
  indicatorBoardTrain: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4
  },
  indicatorBoardRake: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2
  },
  simulatePlatformChangeBox: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.2)',
    paddingTop: 12
  },
  simTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6
  },
  simulateChangeBtn: {
    backgroundColor: '#b45309',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center'
  },
  simulateChangeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  coachTabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14
  },
  coachTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center'
  },
  coachTabText: {
    fontSize: 10,
    fontWeight: '800'
  },
  alignmentMarkerCard: {
    backgroundColor: '#0369a115',
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
    padding: 12,
    borderRadius: 8
  },
  markerTitle: {
    color: '#0284c7',
    fontSize: 11,
    fontWeight: '800'
  },
  markerPositionText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4
  },
  markerNote: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4
  },
  countdownContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 12,
    marginBottom: 14
  },
  countdownLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  countdownClock: {
    color: '#f59e0b',
    fontSize: 48,
    fontWeight: '900',
    marginVertical: 4
  },
  countdownSub: {
    color: '#64748b',
    fontSize: 11
  },
  safetyGuidanceBox: {
    backgroundColor: '#ef444415',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    padding: 10,
    borderRadius: 6
  },
  safetyText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '700'
  },
  onboardStatusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
  },
  speedPill: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  speedPillText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800'
  },
  onTimePill: {
    backgroundColor: '#065f46',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  onTimePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  haltsList: {
    gap: 10
  },
  haltsListHeader: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800'
  },
  haltRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  haltDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#475569'
  },
  haltDotPassed: {
    backgroundColor: '#22c55e'
  },
  haltDotCurrent: {
    backgroundColor: '#f59e0b',
    transform: [{ scale: 1.3 }]
  },
  haltName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600'
  },
  haltTime: {
    fontSize: 12
  },
  dadarWalkthroughCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    padding: 14
  },
  dadarInterchangeHeader: {
    marginBottom: 12
  },
  dadarInterchangeTitle: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '900'
  },
  dadarInterchangeSub: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 2
  },
  dadarStepsList: {
    gap: 8,
    marginBottom: 14
  },
  dadarStepItem: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18
  },
  dadarMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8
  },
  dadarMetric: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700'
  },
  doorSideCard: {
    backgroundColor: '#0369a120',
    borderWidth: 1,
    borderColor: '#0284c7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14
  },
  doorSideAlert: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: '900'
  },
  doorSideSub: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 4
  },
  crowdExitGuidance: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderRadius: 8,
    padding: 10
  },
  crowdExitTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800'
  },
  crowdExitText: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 2
  },
  exitGateTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
  },
  exitGateTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center'
  },
  exitGateTabText: {
    fontSize: 12,
    fontWeight: '800'
  },
  exitDetailsCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginBottom: 14
  },
  exitNameTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900'
  },
  landmarksSection: {
    gap: 4
  },
  sectionSmallLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800'
  },
  landmarkItem: {
    color: '#e2e8f0',
    fontSize: 12
  },
  transitSection: {
    gap: 4
  },
  transitItem: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600'
  },
  exitAccessibilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8
  },
  accessibilityBadge: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700'
  },
  walkMinutesBadge: {
    color: '#cbd5e1',
    fontSize: 11
  },
  finishTripBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center'
  },
  finishTripBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900'
  },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1
  },
  footerNavBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center'
  },
  footerNavBtnText: {
    fontSize: 13,
    fontWeight: '700'
  },
  footerStepIndicator: {
    fontSize: 12,
    fontWeight: '800'
  },
  footerNavBtnPrimary: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center'
  },
  footerNavBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900'
  }
});
