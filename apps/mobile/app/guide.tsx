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
import { getStationExitGuidance, STATION_3D_LAYOUTS } from '../src/fixtures/stationLayoutsData';
import {
  RakeModelType,
  RakeFormation,
  RakeCoach,
  CoachCategory,
  getRakeFormation,
  computeCoachRecommendation,
  RAKE_FORMATIONS
} from '../src/models/coachGuide';

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
  const initialDeparturePlatform = params.departurePlatform || 'Unassigned';
  const arrivalPlatform = params.arrivalPlatform || 'Unassigned';
  const hasTransfer = params.hasTransfer === 'true';
  const transferStation = params.transferStation || '';
  const transferStationName = params.transferStationName || '';
  const isAc = params.isAc === 'true';

  // Dynamic Rake & Coach Alignment Model
  const rakeType: RakeModelType = useMemo(() => {
    if (isAc) return '12_car_ac_suburban';
    if (trainNumber.startsWith('206') || trainName.toLowerCase().includes('vande')) return '16_car_vande_bharat';
    if (trainName.toLowerCase().includes('express') || trainName.toLowerCase().includes('superfast')) return '22_car_express';
    if (trainName.toLowerCase().includes('15')) return '15_car_suburban';
    return '12_car_suburban';
  }, [isAc, trainNumber, trainName]);

  const formation = useMemo(() => {
    return getRakeFormation(rakeType) || RAKE_FORMATIONS['12_car_suburban'];
  }, [rakeType]);

  const [selectedCoachSeq, setSelectedCoachSeq] = useState<number>(() => (rakeType === '16_car_vande_bharat' ? 8 : 4));

  const activeCoach = useMemo(() => {
    return formation.coaches.find(c => c.sequence === selectedCoachSeq) || formation.coaches[0];
  }, [formation, selectedCoachSeq]);

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

  const coachRec = useMemo(() => {
    const isPfValid = currentPlatform && currentPlatform !== 'Unknown' && currentPlatform !== 'Unassigned';
    if (!isPfValid) {
      return {
        status: 'UNAVAILABLE' as const,
        message: `Platform alignment unavailable: Platform is unassigned for departure at ${fromCode}. Check digital station indicators on arrival.`
      };
    }
    return computeCoachRecommendation({
      rakeType,
      coachSequence: selectedCoachSeq,
      stationCode: fromCode,
      platformNumber: currentPlatform
    });
  }, [rakeType, selectedCoachSeq, fromCode, currentPlatform]);

  // Origin Entrance & Layout Profiles
  const fromExitProfile = useMemo(() => {
    return getStationExitGuidance(fromCode) || null;
  }, [fromCode]);

  const fromStationLayout = useMemo(() => {
    return STATION_3D_LAYOUTS[fromCode] || null;
  }, [fromCode]);

  // Destination Exit Guidance
  const destExitProfile = useMemo(() => {
    return getStationExitGuidance(toCode) || null;
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
              ? '[OFFLINE DEMO MODE] A cached timetable is not verified live service information'
              : '[DEMO GUIDANCE] Check service and station details with official sources'}
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
              Starting from {fromCode}. Distance and location have not been measured.
            </Text>

            <View style={styles.infoRowBox}>
              <Text style={[styles.infoBoxLabel, { color: colors.textMuted }]}>Recommended Station Entrance:</Text>
              <Text style={[styles.infoBoxValue, { color: colors.textPrimary }]}>
                Entrance not verified for your location. Follow station signage.
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
                <Text style={styles.ticketValidPillText}>TICKET VALIDITY NOT VERIFIED</Text>
              </View>
              <Text style={styles.ticketDetailText}>
                Class: {isAc ? 'AC First Class' : 'Second Class (II)'} · Single Journey
              </Text>
              <Text style={styles.ticketRouteText}>
                Valid from {fromCode} to {toCode}
              </Text>
              <Text style={styles.ticketExpiryText}>
                Check validity, class, and travel permission with the ticket issuer before boarding.
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
            {fromExitProfile && fromExitProfile.exits.length > 0 ? (
              <>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  {`Recommended entrance at ${fromExitProfile.stationName}: ${fromExitProfile.exits[0].gateName}.`}
                </Text>
                <View style={styles.amenityChipRow}>
                  {fromExitProfile.exits[0].onwardTransit?.autoStand && (
                    <View style={styles.amenityChip}>
                      <Text style={styles.amenityChipText}>{fromExitProfile.exits[0].onwardTransit.autoStand}</Text>
                    </View>
                  )}
                  {fromExitProfile.exits[0].accessibility.isStepFree && (
                    <View style={styles.amenityChip}>
                      <Text style={styles.amenityChipText}>♿ Step-Free Access</Text>
                    </View>
                  )}
                </View>
              </>
            ) : (
              <View style={[styles.guidanceBox, { backgroundColor: '#78350f20', borderColor: '#b45309' }]}>
                <Text style={[styles.guidanceText, { color: '#fef3c7' }]}>
                  {`Station entrance layout unverified for station [${fromCode}]. Follow physical station signage and overhead concourse directions.`}
                </Text>
              </View>
            )}
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

            {fromStationLayout ? (
              <>
                <View style={styles.walkRouteBox}>
                  <Text style={styles.walkStepText}>
                    {`1. Walk from entrance into ${fromStationLayout.stationName} concourse.`}
                  </Text>
                  <Text style={styles.walkStepText}>
                    {stepFreeRequired
                      ? (fromStationLayout.bridges.some(b => b.hasLifts)
                          ? `2. Take ${fromStationLayout.bridges.find(b => b.hasLifts)?.name || 'Accessible FOB'} (Elevator / Lift equipped) to bridge level.`
                          : `2. ⚠️ Notice: No lift-equipped bridge surveyed at ${fromCode}. Use level crossings or ask station master for assistance.`)
                      : `2. Ascend ${fromStationLayout.bridges[0]?.name || 'Foot-Over-Bridge'} stairs/escalator.`}
                  </Text>
                  <Text style={styles.walkStepText}>
                    {currentPlatform && currentPlatform !== 'Unassigned' && currentPlatform !== 'Unknown'
                      ? `3. Follow overhead signage along bridge toward Platform ${currentPlatform}.`
                      : '3. Check overhead LED indicator for confirmed platform assignment.'}
                  </Text>
                  <Text style={styles.walkStepText}>
                    {stepFreeRequired
                      ? `4. Use platform lift/ramp down to track level.`
                      : `4. Descend stairs onto platform.`}
                  </Text>
                </View>
                <Text style={[styles.estimatedWalkTime, { color: colors.primary }]}>
                  {`Estimated Bridge Walk: ${stepFreeRequired ? '4-6 min' : `${fromStationLayout.bridges[0]?.typicalWalkMinutes || 3} min`}`}
                </Text>
              </>
            ) : (
              <View style={[styles.guidanceBox, { backgroundColor: '#78350f20', borderColor: '#b45309' }]}>
                <Text style={[styles.guidanceText, { color: '#fef3c7' }]}>
                  {`Concourse and Foot-Over-Bridge layout for station [${fromCode}] is unmapped. Follow overhead bridge signs and digital indicators to reach your platform.`}
                </Text>
              </View>
            )}
          </View>
        )}


        {/* STEP 5: Platform Arrival & Indicator */}
        {currentStep === 5 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              Step 5: Platform Arrival & Digital Indicator
            </Text>

            {currentPlatform && currentPlatform !== 'Unassigned' && currentPlatform !== 'Unknown' ? (
              <View style={styles.platformBadgeLarge}>
                <Text style={styles.platformBadgeLargeText}>PLATFORM {currentPlatform}</Text>
              </View>
            ) : (
              <View style={[styles.platformBadgeLarge, { backgroundColor: '#78350f' }]}>
                <Text style={styles.platformBadgeLargeText}>PLATFORM UNASSIGNED</Text>
              </View>
            )}

            <View style={styles.indicatorBoardSim}>
              <View style={styles.indicatorBadgeRow}>
                <Text style={styles.indicatorBoardHeader}>DIGITAL PLATFORM INDICATOR</Text>
                <Text style={styles.indicatorTag}>
                  {currentPlatform && currentPlatform !== 'Unassigned' ? '[TIMETABLE SCHEDULE]' : '[AWAITING ASSIGNMENT]'}
                </Text>
              </View>
              <Text style={styles.indicatorBoardTrain}>
                {departureTime} · {trainName.toUpperCase()} ➔ {toCode}
              </Text>
              <Text style={styles.indicatorBoardRake}>
                {formation.totalCoaches} CAR RAKE · {currentPlatform && currentPlatform !== 'Unassigned' ? `BOARD PF ${currentPlatform}` : 'CHECK CONCOURSE PA'}
              </Text>
            </View>

            {(!currentPlatform || currentPlatform === 'Unassigned' || currentPlatform === 'Unknown') && (
              <View style={[styles.guidanceBox, { marginTop: 12, backgroundColor: '#78350f20', borderColor: '#b45309' }]}>
                <Text style={[styles.guidanceText, { color: '#fef3c7' }]}>
                  Platform assignment is confirmed 10–15 minutes before scheduled departure. Listen to station announcements (PA chimes) and verify overhead LED boards upon concourse arrival.
                </Text>
              </View>
            )}

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
              {formation.totalCoaches}-Car Rake ({formation.name}). Tap a coach to view alignment relative to platform markers:
            </Text>

            {/* Coach Category Filter Tabs */}
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
                  onPress={() => {
                    setCoachPreference(c);
                    const match = formation.coaches.find(co => {
                      if (c === 'first') return co.isFirstClass || co.category === 'first_class';
                      if (c === 'ladies') return co.isLadiesReserved || co.category === 'ladies';
                      if (c === 'divyangjan') return co.isAccessible || co.category === 'divyangjan';
                      return co.category === 'general';
                    });
                    if (match) setSelectedCoachSeq(match.sequence);
                  }}
                >
                  <Text style={[styles.coachTabText, { color: coachPreference === c ? '#FFFFFF' : colors.textSecondary }]}>
                    {c === 'general' ? 'General (II)' : c === 'first' ? 'First Class' : c === 'ladies' ? 'Ladies' : 'Divyangjan'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Horizontal Swipeable Coach Formation Strip */}
            <Text style={[styles.infoBoxLabel, { color: colors.textMuted, marginTop: 8, marginBottom: 4 }]}>
              Rake Formation (South ➔ North):
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.coachStripContainer}>
              {formation.coaches.map(c => {
                const isSelected = c.sequence === selectedCoachSeq;
                const isCategoryMatch =
                  (coachPreference === 'first' && (c.isFirstClass || c.category === 'first_class')) ||
                  (coachPreference === 'ladies' && (c.isLadiesReserved || c.category === 'ladies')) ||
                  (coachPreference === 'divyangjan' && (c.isAccessible || c.category === 'divyangjan')) ||
                  (coachPreference === 'general' && c.category === 'general');

                const coachColor =
                  c.isFirstClass ? '#ea580c' :
                  c.isLadiesReserved ? '#db2777' :
                  c.isAccessible ? '#2563eb' :
                  c.category === 'motor_loco' ? '#475569' : '#334155';

                return (
                  <TouchableOpacity
                    key={c.sequence}
                    style={[
                      styles.coachStripBox,
                      {
                        borderColor: isSelected ? colors.primary : isCategoryMatch ? '#fbbf24' : colors.cardBorder,
                        backgroundColor: isSelected ? colors.primary + '25' : colors.background
                      }
                    ]}
                    onPress={() => setSelectedCoachSeq(c.sequence)}
                  >
                    <View style={[styles.coachStripTag, { backgroundColor: coachColor }]}>
                      <Text style={styles.coachStripTagText}>{c.identifier}</Text>
                    </View>
                    <Text style={[styles.coachSeqText, { color: colors.textPrimary }]}>C{c.sequence}</Text>
                    <Text style={[styles.coachClassText, { color: colors.textMuted }]}>
                      {c.isLadiesReserved ? 'Ladies' : c.isAccessible ? 'Divyang' : c.isFirstClass ? 'First' : 'General'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Alignment Recommendation or Honest Unavailable State */}
            {coachRec.status === 'UNAVAILABLE' ? (
              <View style={[styles.alignmentMarkerCard, { backgroundColor: '#78350f20', borderColor: '#b45309' }]}>
                <Text style={[styles.markerTitle, { color: '#fbbf24' }]}>
                  [PLATFORM ALIGNMENT UNAVAILABLE]
                </Text>
                <Text style={[styles.markerPositionText, { color: '#fef3c7' }]}>
                  {coachRec.message}
                </Text>
                <Text style={[styles.markerNote, { color: '#cbd5e1' }]}>
                  Rake has {formation.totalCoaches} cars. Standard overhead indicator markers are posted above Platform {currentPlatform} at the concourse entry.
                </Text>
              </View>
            ) : (
              <View style={styles.alignmentMarkerCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.markerTitle}>Platform Alignment:</Text>
                  <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '700' }}>
                    [{coachRec.provenance === 'LIVE_VERIFIED' ? 'VERIFIED LIVE' : 'TIMETABLE SCHEDULE'}]
                  </Text>
                </View>
                <Text style={styles.markerPositionText}>
                  Coach {activeCoach.sequence} ({activeCoach.identifier}): {activeCoach.className}
                </Text>
                <Text style={styles.markerNote}>
                  {coachRec.primaryRecommendationText || activeCoach.description || `Position yourself at coach indicator marker ${activeCoach.sequence} on Platform ${currentPlatform}.`}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* STEP 7: Boarding Countdown */}
        {currentStep === 7 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              Step 7: Scheduled Departure & Boarding Notice
            </Text>

            <View style={styles.countdownContainer}>
              <Text style={styles.countdownLabel}>SCHEDULED TIMETABLE SERVICE</Text>
              <Text style={styles.countdownClock}>{departureTime}</Text>
              <Text style={styles.countdownSub}>Departure Time from {fromCode}</Text>
            </View>

            <View style={[styles.infoRowBox, { marginVertical: 8 }]}>
              <Text style={[styles.infoBoxLabel, { color: colors.textMuted }]}>Live GPS Telemetry:</Text>
              <Text style={[styles.infoBoxValue, { color: colors.textSecondary }]}>
                [TIMETABLE SCHEDULE] Dynamic second-by-second countdown is not available for this rake. Listen for station PA arrival chime.
              </Text>
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
              Step 8: Onboard Transit & Stopping Pattern
            </Text>

            <View style={styles.onboardStatusRow}>
              <View style={[styles.speedPill, { backgroundColor: '#334155' }]}>
                <Text style={styles.speedPillText}>SPEED: TELEMETRY OFFLINE</Text>
              </View>
              <View style={styles.onTimePill}>
                <Text style={styles.onTimePillText}>[TIMETABLE SCHEDULE]</Text>
              </View>
            </View>

            <Text style={[styles.stepDescription, { color: colors.textSecondary, marginTop: 8 }]}>
              Transit route from {fromCode} to {toCode} ({departureTime} ➔ {arrivalTime}):
            </Text>

            <View style={styles.haltsList}>
              <Text style={styles.haltsListHeader}>Scheduled Corridor Halts:</Text>
              {[
                { stn: `${fromCode} (Origin)`, time: departureTime, passed: true },
                { stn: hasTransfer ? `${transferStation} (Transfer)` : 'Mid-corridor Junction', time: '--:--', passed: false, current: true },
                { stn: `${toCode} (Destination)`, time: arrivalTime, passed: false }
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

        {/* STEP 9: Interchange Station Approach / Conditional Transfer */}
        {currentStep === 9 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              {hasTransfer ? `Step 9: Interchange Transfer (${transferStationName || transferStation || 'Junction'})` : 'Step 9: Direct Transit Monitoring'}
            </Text>

            {!hasTransfer ? (
              <View style={styles.guidanceBox}>
                <Text style={[styles.guidanceText, { color: colors.textPrimary }]}>
                  Direct Through-Service: No transfer required for this journey from {fromCode} to {toCode}. Remain onboard until arrival at {toCode}.
                </Text>
              </View>
            ) : transferStation === 'DR' ? (
              <View style={styles.dadarWalkthroughCard}>
                <View style={styles.dadarInterchangeHeader}>
                  <Text style={styles.dadarInterchangeTitle}>
                    DADAR JUNCTION TRANSFER (CR ➔ WR)
                  </Text>
                  <Text style={styles.dadarInterchangeSub}>
                    Platform {params.transferPlatformFrom || '4'} ➔ Platform {params.transferPlatformTo || '3'} ({params.transferWalkMinutes || '7'} min Walk)
                  </Text>
                </View>

                <View style={styles.dadarStepsList}>
                  <Text style={styles.dadarStepItem}>
                    1. Alight at Dadar Central. Walk toward the North end of the platform.
                  </Text>
                  <Text style={styles.dadarStepItem}>
                    2. Ascend North Foot-Over-Bridge (Avoid Middle FOB during peak rush hours).
                  </Text>
                  <Text style={styles.dadarStepItem}>
                    3. Cross the railway corridor bridge connecting Central to Western tracks.
                  </Text>
                  <Text style={styles.dadarStepItem}>
                    4. Follow Western Railway signage toward Platform {params.transferPlatformTo || '3'}.
                  </Text>
                  <Text style={styles.dadarStepItem}>
                    5. Descend stairs/ramp onto Western Platform {params.transferPlatformTo || '3'}.
                  </Text>
                </View>

                <View style={styles.dadarMetricsRow}>
                  <Text style={styles.dadarMetric}>Transfer Walk: ~180m</Text>
                  <Text style={styles.dadarMetric}>Est. Time: {params.transferWalkMinutes || '7'} min</Text>
                  <Text style={styles.dadarMetric}>Step-Free: Lift Available</Text>
                </View>
              </View>
            ) : (
              <View style={styles.dadarWalkthroughCard}>
                <View style={styles.dadarInterchangeHeader}>
                  <Text style={styles.dadarInterchangeTitle}>
                    TRANSFER AT {transferStationName ? transferStationName.toUpperCase() : transferStation}
                  </Text>
                  <Text style={styles.dadarInterchangeSub}>
                    Platform {params.transferPlatformFrom || 'Arrival'} ➔ Platform {params.transferPlatformTo || 'Connecting'} ({params.transferWalkMinutes || '5'} min Walk)
                  </Text>
                </View>

                <View style={styles.dadarStepsList}>
                  <Text style={styles.dadarStepItem}>
                    1. Alight at {transferStationName || transferStation}.
                  </Text>
                  <Text style={styles.dadarStepItem}>
                    2. Take nearest Foot-Over-Bridge or concourse subway.
                  </Text>
                  <Text style={styles.dadarStepItem}>
                    3. Follow digital signage to Platform {params.transferPlatformTo || 'Connecting'}.
                  </Text>
                </View>

                <View style={styles.dadarMetricsRow}>
                  <Text style={styles.dadarMetric}>Transfer Buffer: {params.transferWalkMinutes || '5'} min</Text>
                  <Text style={styles.dadarMetric}>Accessibility: Follow station lifts</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* STEP 10: Connecting Platform & Boarding */}
        {currentStep === 10 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              {hasTransfer ? 'Step 10: Connecting Platform & Boarding' : 'Step 10: Final Line Section Approach'}
            </Text>

            {hasTransfer ? (
              <>
                <View style={styles.platformBadgeLarge}>
                  <Text style={styles.platformBadgeLargeText}>
                    PLATFORM {params.transferPlatformTo || 'CONNECTING'}
                  </Text>
                </View>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  Arrived at connecting platform at {transferStationName || transferStation}. Board connecting service toward {toCode}.
                </Text>
              </>
            ) : (
              <View style={styles.guidanceBox}>
                <Text style={[styles.guidanceText, { color: colors.textPrimary }]}>
                  Approaching final transit segment toward {toCode}. Estimated arrival at {arrivalTime}.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* STEP 11: Destination Station Approach */}
        {currentStep === 11 && (
          <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardHeader, { color: colors.textPrimary }, easyMode && styles.cardHeaderEasy]}>
              Step 11: Destination Approach & Alighting Caution
            </Text>

            <View style={[styles.doorSideCard, { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
              <Text style={[styles.doorSideAlert, { color: '#f59e0b' }]}>
                ALIGHTING CAUTION: MIND THE GAP
              </Text>
              <Text style={styles.doorSideSub}>
                Approaching {toCode} (Scheduled Platform: {arrivalPlatform}).
              </Text>
            </View>

            <View style={[styles.guidanceBox, { marginVertical: 8, backgroundColor: '#0f172a' }]}>
              <Text style={[styles.guidanceText, { color: '#94a3b8' }]}>
                Notice: Door opening side is platform track-dependent and varies between island and side platforms. Look out of the door window to verify platform edge before train halts completely.
              </Text>
            </View>

            <View style={styles.crowdExitGuidance}>
              <Text style={styles.crowdExitTitle}>Commuter Flow Advice:</Text>
              <Text style={styles.crowdExitText}>
                Step onto the platform promptly after train stops. Keep moving along concourse corridors to prevent doorway congestion.
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

            {/* Exit Gate Selector Tabs & Details */}
            {destExitProfile && destExitProfile.exits && destExitProfile.exits.length > 0 ? (
              <>
                <View style={styles.exitGateTabsRow}>
                  {destExitProfile.exits.map(ex => (
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
              </>
            ) : (
              <View style={[styles.alignmentMarkerCard, { backgroundColor: '#78350f20', borderColor: '#b45309', marginVertical: 12 }]}>
                <Text style={[styles.markerTitle, { color: '#fbbf24' }]}>
                  {`[EXIT BLUEPRINT UNAVAILABLE FOR STATION [${toCode}]]`}
                </Text>
                <Text style={[styles.markerPositionText, { color: '#fef3c7' }]}>
                  Topological exit guidance is currently verified for major junction hubs (CSMT, Dadar, Thane, Andheri, Borivali, Kurla, Kalyan).
                </Text>
                <Text style={[styles.markerNote, { color: '#cbd5e1' }]}>
                  Follow station exit signage and concourse indicators upon train arrival.
                </Text>
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
  },
  indicatorBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  indicatorTag: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '800'
  },
  coachStripContainer: {
    paddingVertical: 8,
    gap: 8
  },
  coachStripBox: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    width: 62,
    minHeight: 64,
    justifyContent: 'center'
  },
  coachStripTag: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4
  },
  coachStripTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900'
  },
  coachSeqText: {
    fontSize: 11,
    fontWeight: '800'
  },
  coachClassText: {
    fontSize: 9,
    fontWeight: '600'
  }
});
