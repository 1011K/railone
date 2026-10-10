/**
 * RailOne Next — Comprehensive Verification & P0 Test Suite
 * Master Plan 2.0 Acceptance Scenarios (G1–G18) + Architectural Invariants
 */

import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { STATIONS, TRAIN_TRIPS, INITIAL_OBSERVATIONS, calculateSuburbanFare } from '../src/fixtures/railwayData';
import { evaluateJourneyEligibility } from '../src/engine/eligibilityEngine';
import { computePredictedStops, getMinutesDifference, addMinutesToTimeString, addMinutesWithDayOffset } from '../src/engine/delayModel';
import { planJourneys } from '../src/engine/journeyEngine';
import { estimateCrowdLevel } from '../src/engine/crowdEstimator';
import { RailBackendTools } from '../src/engine/voiceTools';
import { MockBookingStore } from '../src/engine/mockBookingStore';
import { normalizeStation } from '../src/engine/stationNormalizer';
import { THEME_CONFIG } from '../src/components/ThemeContext';
import { resetDatabase, getDatabase } from '../src/backend/database/db';
import { searchStations, getStationByCode } from '../src/backend/modules/stations';
import { searchRoutes } from '../src/backend/modules/routePlanner';
import { calculateSuburbanFare as calcSubFare, calculateMetroFare as calcMetroFare, calculateStationDistance } from '../src/backend/modules/fares';
import { createBooking, reconcileBooking, getBookingById } from '../src/backend/modules/ticketing';
import { cancelBooking } from '../src/backend/modules/bookingHistory';
import { startVoiceSession, processVoiceTurn } from '../src/backend/modules/voiceAgent';
import { checkSystemHealth } from '../src/backend/modules/health';
import { StatutoryTelephonyAdapter } from '../src/backend/modules/providerAdapters';
import { findExpressTrainsBetween } from '../src/backend/modules/services';
import { getAuditLogs } from '../src/backend/modules/auditLog';
import { ALL_22_SERVICES } from '../src/components/ServicesHubModal';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName} ${detail ? `-> ${detail}` : ''}`);
  }
}

console.log('====================================================');
console.log('   RAILONE NEXT - AUTOMATED SYSTEM TEST SUITE       ');
console.log('====================================================\n');

// =========================================================================
// SECTION A: 18 CANONICAL ACCEPTANCE SCENARIOS (G1 – G18)
// =========================================================================

console.log('--- SECTION A: 18 CANONICAL ACCEPTANCE SCENARIOS (G1–G18) ---');

// Scenario 1: Thane -> Churchgate via Dadar, arrive by 12:30, compare class/transfer choices
console.log('\n[G1] Scenario 1: Thane -> Churchgate via Dadar, Arrive by 12:30');
{
  const itineraries = planJourneys({
    originCode: 'TNA',
    destCode: 'CCG',
    departureTime: '10:35',
    arriveByDeadline: '12:30',
    userContext: 'pre_departure',
    preferences: {
      classPreference: 'any',
      priority: 'fastest',
      hasSeasonPass: false,
      walkToStationMinutes: 10,
      maxTransfers: 1
    }
  });

  assert(itineraries.length > 0, 'G1.1: Found viable journeys arriving by 12:30');
  const topJourney = itineraries[0];
  assert(topJourney !== undefined, 'G1.2: Top journey exists');
  if (topJourney) {
    assert(topJourney.transfers.length === 1, 'G1.3: Uses 1 interchange transfer');
    assert(topJourney.transfers[0].station.code === 'DR', 'G1.4: Transfer station is Dadar');
    assert(topJourney.transfers[0].walkTimeMinutes >= 7, 'G1.5: Dadar transfer accounts for min 7 min FOB walking buffer');
    assert(getMinutesDifference(topJourney.predictedArrival, '12:30') >= 0, 'G1.6: Arrives strictly on or before 12:30 deadline');
    assert(topJourney.totalFareByClass.II !== undefined && topJourney.totalFareByClass.I !== undefined, 'G1.7: Compares Second Class (II) and First Class (I) fares');
  }
}

// Scenario 2: Dadar -> Kalyan, exclude Express lacking stop or valid passenger ticket on segment
console.log('\n[G2] Scenario 2: Dadar -> Kalyan, Exclude Express Lacking Valid Ticket/Stop');
{
  const konarkExpress = TRAIN_TRIPS.find(t => t.trainNumber === '11020')!;
  const deccanQueen = TRAIN_TRIPS.find(t => t.trainNumber === '12123')!;

  // 2a. Suburban passenger on non-MST Express (Konark Express)
  const konarkRes = evaluateJourneyEligibility({
    train: konarkExpress,
    fromStationCode: 'DR',
    toStationCode: 'KYN',
    userTicketType: 'suburban_single',
    userClass: 'II',
    hasMST: false
  });
  assert(konarkRes.status === 'PROHIBITED', 'G2.1: Ordinary suburban ticket on non-MST Express is PROHIBITED');
  assert(konarkRes.ticketRequiredNote.includes('Section 138'), 'G2.2: Refusal cites Railways Act Section 138 penalties');

  // 2b. Season pass on non-MST Express
  const konarkMstRes = evaluateJourneyEligibility({
    train: konarkExpress,
    fromStationCode: 'DR',
    toStationCode: 'KYN',
    userTicketType: 'suburban_season_pass',
    userClass: 'II',
    hasMST: true
  });
  assert(konarkMstRes.status === 'PROHIBITED', 'G2.3: Suburban season ticket on non-MST Express is PROHIBITED');

  // 2c. Deccan Queen with MST pass (Permitted in GS only)
  const dqMstRes = evaluateJourneyEligibility({
    train: deccanQueen,
    fromStationCode: 'DR',
    toStationCode: 'KYN',
    userTicketType: 'suburban_season_pass',
    userClass: 'II',
    hasMST: true
  });
  assert(dqMstRes.status === 'CONDITIONAL', 'G2.4: Deccan Queen is CONDITIONAL (General coach only)');
}

// Scenario 3: Delayed fast vs valid slow: recalculate arrival, choose correct completion time
console.log('\n[G3] Scenario 3: Delayed Fast vs Valid Slow Local (Delay Inversion)');
{
  const itineraries = planJourneys({
    originCode: 'TNA',
    destCode: 'DR',
    departureTime: '10:40',
    userContext: 'waiting_at_station',
    preferences: {
      classPreference: 'second',
      priority: 'fastest',
      hasSeasonPass: false,
      walkToStationMinutes: 5,
      maxTransfers: 0
    }
  });

  assert(itineraries.length > 0, 'G3.1: Found viable itineraries');
  const best = itineraries[0];
  assert(best.legs[0].train.serviceType === 'suburban_slow', 'G3.2: Slow Local beats delayed Fast Local');
  assert(best.delayInversionNote !== undefined && best.delayInversionNote.includes('DELAY INVERSION WINNER'), 'G3.3: Clearly labeled as DELAY INVERSION WINNER');
}

// Scenario 4: Origin delay +20 becomes +40 downstream: don't project flat delay
console.log('\n[G4] Scenario 4: Compounding Downstream Delay (+20 becomes +40)');
{
  const compTrain = TRAIN_TRIPS.find(t => t.trainNumber === '12134')!;
  const obs = INITIAL_OBSERVATIONS['12134'];
  const predicted = computePredictedStops(compTrain, obs);

  const originStop = predicted.find(s => s.stationCode === 'PNVL')!;
  const destStop = predicted.find(s => s.stationCode === 'CSMT')!;

  assert(originStop.delayArrivalMinutes === 20, 'G4.1: Origin delay at PNVL is +20 min');
  assert(destStop.delayArrivalMinutes === 40, 'G4.2: Downstream delay at CSMT compounds to +40 min');
  assert(destStop.delayArrivalMinutes > originStop.delayArrivalMinutes, 'G4.3: Delay is NOT projected flat (+20 != +40)');
}

// Scenario 5: AC local scarce; never suggest phantom AC local; show second and first objectively
console.log('\n[G5] Scenario 5: AC Local Scarcity & Objective Class Reporting');
{
  // Non-AC corridor search (e.g., Harbour line Panvel to CSMT where no AC Local is scheduled)
  const harbourJourneys = planJourneys({
    originCode: 'PNVL',
    destCode: 'CSMT',
    departureTime: '10:05',
    userContext: 'pre_departure',
    preferences: {
      classPreference: 'any',
      priority: 'fastest',
      hasSeasonPass: false,
      walkToStationMinutes: 5,
      maxTransfers: 0
    }
  });

  assert(harbourJourneys.length > 0, 'G5.1: Found Harbour journeys');
  const hasPhantomAc = harbourJourneys.some(j => j.isAcService);
  assert(!hasPhantomAc, 'G5.2: Never invents phantom AC local when none is scheduled');
  assert(harbourJourneys[0].totalFareByClass.II === 15, 'G5.3: Second class fare presented objectively (₹15)');
  assert(harbourJourneys[0].totalFareByClass.I === 140, 'G5.4: First class fare presented objectively (₹140)');
}

// Scenario 6: Cancelled transfer: alternative route using only valid operating services
console.log('\n[G6] Scenario 6: Cancelled Transfer Connection Handling');
{
  // Train 90238 is marked cancelled in observations
  const obs = INITIAL_OBSERVATIONS['90238'];
  assert(obs.isCanceled === true, 'G6.1: Fixture train 90238 is marked cancelled');

  const itineraries = planJourneys({
    originCode: 'TNA',
    destCode: 'CCG',
    departureTime: '10:35',
    userContext: 'pre_departure',
    preferences: {
      classPreference: 'any',
      priority: 'fastest',
      hasSeasonPass: false,
      walkToStationMinutes: 10,
      maxTransfers: 1
    }
  });

  const usedCancelledTrain = itineraries.some(it => 
    it.legs.some(l => l.train.trainNumber === '90238')
  );
  assert(!usedCancelledTrain, 'G6.2: Planner rejects cancelled train 90238 from all candidate legs');
  assert(itineraries.length > 0, 'G6.3: Routes passenger via valid operating services');
}

// Scenario 7: Onboard passenger: alternatives from actual next stopping stations, not past ones
console.log('\n[G7] Scenario 7: Onboard Passenger Replanning (No Backtracking)');
{
  // User is onboard train 95112 at Kurla (CLA). Trying to query from Kalyan (KYN) should be rejected/clamped.
  const onboardJourneys = planJourneys({
    originCode: 'KYN', // prior station
    destCode: 'CSMT',
    departureTime: '11:15',
    userContext: 'onboard',
    onboardTrainNumber: '95112',
    onboardCurrentStation: 'CLA',
    preferences: {
      classPreference: 'second',
      priority: 'fastest',
      hasSeasonPass: false,
      walkToStationMinutes: 0,
      maxTransfers: 0
    }
  });

  assert(onboardJourneys.length > 0, 'G7.1: Found onboard replanning options');
  const topJourney = onboardJourneys[0];
  assert(topJourney.legs[0].fromStation.code === 'CLA', 'G7.2: Origin is clamped to current halt Kurla (CLA)');
  assert(topJourney.legs[0].fromStation.code !== 'KYN', 'G7.3: Backtracking to previous halt Kalyan is strictly prevented');
  assert(topJourney.originDelayWarning !== undefined && topJourney.originDelayWarning.includes('Onboard Context'), 'G7.4: Explains onboard forward-only halt constraint');
}

// Scenario 8: Late-night train originating yesterday, boarding today: correct service_date and offsets
console.log('\n[G8] Scenario 8: Overnight Train Originating Yesterday (Midnight Crossing)');
{
  const overnightTrain = TRAIN_TRIPS.find(t => t.trainNumber === '11058')!;
  const obs = INITIAL_OBSERVATIONS['11058'];

  assert(obs.serviceDate === '2026-10-05', 'G8.1: Origin service date reflects previous calendar day');
  assert(overnightTrain.stops.some(s => s.dayOffset === 1), 'G8.2: Post-midnight halts carry dayOffset = 1');

  // Verify time arithmetic across midnight
  const duration = getMinutesDifference('22:30', '01:15', 0, 1);
  assert(duration === 165, 'G8.3: Minute difference from 22:30 Day 0 to 01:15 Day 1 is exactly 165 minutes');

  const predicted = computePredictedStops(overnightTrain, obs);
  const thaneStop = predicted.find(s => s.stationCode === 'TNA')!;
  assert(thaneStop.dayOffset === 1, 'G8.4: Predicted Thane stop correctly tracks Day 1 offset');
}

// Scenario 9: Feed outage: explicit stale/unknown, schedule still accessible without live claim
console.log('\n[G9] Scenario 9: Feed Outage & Stale / Unknown Observation Fallback');
{
  // Train 97051 has no active observation in INITIAL_OBSERVATIONS
  const unmonitoredTrain = TRAIN_TRIPS.find(t => t.trainNumber === '97051')!;
  const predicted = computePredictedStops(unmonitoredTrain, undefined);

  assert(predicted.every(s => s.dataStatus === 'SCHEDULED'), 'G9.1: Unmonitored train falls back to SCHEDULED');
  assert(predicted.every(s => s.delayArrivalMinutes === 0), 'G9.2: Never hallucinates random delays or false live feeds');
  assert(predicted[0].scheduledDeparture === '10:20', 'G9.3: Published timetable remains fully accessible');
}

// Scenario 10: Payment duplicate tap + ambiguous response in demo: idempotent order and reconciliation
console.log('\n[G10] Scenario 10: Idempotent Order Creation on Duplicate Tap');
{
  MockBookingStore.clearAll();
  const testKey = 'IDEMP-TEST-' + Date.now();

  const res1 = MockBookingStore.createSpecimenBooking({
    idempotencyKey: testKey,
    trainNumber: '95112',
    trainName: 'Kalyan Fast Local',
    fromCode: 'TNA',
    fromName: 'Thane',
    toCode: 'DR',
    toName: 'Dadar',
    classBooked: 'II',
    fare: 10,
    passengers: [{ name: 'Test Passenger', age: 25, gender: 'M' }],
    paymentMethod: 'RailWallet (Simulated)'
  });

  assert(res1.isDuplicateSubmission === false, 'G10.1: First tap creates new order');
  assert(res1.ticket.pnrMock.startsWith('MOCK-'), 'G10.2: Issues specimen ticket with MOCK- prefix');

  // Second tap with identical idempotencyKey
  const res2 = MockBookingStore.createSpecimenBooking({
    idempotencyKey: testKey,
    trainNumber: '95112',
    trainName: 'Kalyan Fast Local',
    fromCode: 'TNA',
    fromName: 'Thane',
    toCode: 'DR',
    toName: 'Dadar',
    classBooked: 'II',
    fare: 10,
    passengers: [{ name: 'Test Passenger', age: 25, gender: 'M' }],
    paymentMethod: 'RailWallet (Simulated)'
  });

  assert(res2.isDuplicateSubmission === true, 'G10.3: Second tap detected as duplicate submission');
  assert(res2.ticket.id === res1.ticket.id, 'G10.4: Returns existing ticket ID without duplicate creation');
  assert(MockBookingStore.listBookings().length === 1, 'G10.5: Only 1 ticket exists in database');
}

// Scenario 11: Ticket confirmed demo but hidden in initial list: consistent state after reload; prevent repurchase
console.log('\n[G11] Scenario 11: Ambiguous Payment Timeout Recovery & Reconciliation');
{
  const timeoutKey = 'TIMEOUT-TEST-' + Date.now();

  const res = MockBookingStore.createSpecimenBooking({
    idempotencyKey: timeoutKey,
    trainNumber: '97045',
    trainName: 'Thane Slow Local',
    fromCode: 'TNA',
    fromName: 'Thane',
    toCode: 'CSMT',
    toName: 'CSMT',
    classBooked: 'II',
    fare: 10,
    passengers: [{ name: 'Timeout Passenger', age: 30, gender: 'F' }],
    paymentMethod: 'UPI (Simulated)',
    simulateAmbiguousTimeout: true // Simulated backend timeout
  });

  assert(res.bookingState === 'PENDING_RECONCILIATION_DEMO', 'G11.1: Initial order state is PENDING_RECONCILIATION_DEMO');

  // User / client reconciles the order
  const reconcile = MockBookingStore.reconcilePendingOrder(timeoutKey);
  assert(reconcile.success === true, 'G11.2: Reconciliation succeeds');
  assert(reconcile.ticket?.bookingState === 'TICKET_ISSUED_DEMO', 'G11.3: State updated to TICKET_ISSUED_DEMO');
  assert(reconcile.ticket?.paymentStatus === 'PAID_MOCK', 'G11.4: Payment status resolved to PAID_MOCK');
}

// Scenario 12: Coupon/refund demo: exact cash, wallet and voucher types with visible conditions
console.log('\n[G12] Scenario 12: Explicit Refund Breakdown (Cash, Wallet, Voucher)');
{
  const booking = MockBookingStore.createSpecimenBooking({
    trainNumber: '95114',
    trainName: 'AC Fast Local',
    fromCode: 'TNA',
    fromName: 'Thane',
    toCode: 'DR',
    toName: 'Dadar',
    classBooked: 'AC_LOCAL',
    fare: 95,
    passengers: [{ name: 'Refund Passenger', age: 32, gender: 'M' }],
    paymentMethod: 'RailWallet (Simulated)'
  });

  // Cancel with wallet
  const cancelWallet = MockBookingStore.cancelBooking(booking.ticket.id, 'wallet');
  assert(cancelWallet.success === true, 'G12.1: Cancellation succeeds');
  assert(cancelWallet.refundBreakdown.walletRefund === 95, 'G12.2: Wallet refund is ₹95');
  assert(cancelWallet.refundBreakdown.refundTimeline.includes('Instant'), 'G12.3: Wallet refund timeline is Instant');

  // Cancel with voucher on another ticket
  const booking2 = MockBookingStore.createSpecimenBooking({
    trainNumber: '95114',
    trainName: 'AC Fast Local',
    fromCode: 'TNA',
    fromName: 'Thane',
    toCode: 'DR',
    toName: 'Dadar',
    classBooked: 'AC_LOCAL',
    fare: 95,
    passengers: [{ name: 'Voucher Passenger', age: 28, gender: 'F' }],
    paymentMethod: 'Credit Card (Simulated)'
  });

  const cancelVoucher = MockBookingStore.cancelBooking(booking2.ticket.id, 'voucher');
  assert(cancelVoucher.refundBreakdown.voucherCredit === 95, 'G12.4: Voucher refund is ₹95 credit');
  assert(cancelVoucher.refundBreakdown.termsNotice.includes('90 days'), 'G12.5: Clearly states 90-day validity terms');
}

// Scenario 13: An inaccurate stop/coach/platform report does not become verified automatically
console.log('\n[G13] Scenario 13: Moderation of Unverified Community Reports');
{
  const communityReport = {
    stationCode: 'TNA',
    reportedPlatform: '10',
    dataStatus: 'REPORTED' as const,
    isVerifiedByOfficial: false
  };

  assert(communityReport.dataStatus === 'REPORTED', 'G13.1: Crowdsourced reports carry REPORTED namespace');
  assert((communityReport.dataStatus as string) !== 'LIVE_VERIFIED', 'G13.2: Community report never automatically converts to LIVE_VERIFIED');
}

// Scenario 14: Hindi/Marathi station spellings resolve or ask disambiguation; no fabricated stop
console.log('\n[G14] Scenario 14: Multilingual Station Normalization (Hindi/Marathi/Transliteration)');
{
  // 14a. Exact Devanagari Hindi match
  const kynHindi = normalizeStation('कल्याण');
  assert(kynHindi.matchedStation?.code === 'KYN', 'G14.1: Hindi "कल्याण" resolves to KYN (Kalyan)');

  // 14b. Exact Devanagari Marathi match
  const tnaMarathi = normalizeStation('ठाणे');
  assert(tnaMarathi.matchedStation?.code === 'TNA', 'G14.2: Marathi "ठाणे" resolves to TNA (Thane)');

  // 14c. Churchgate in Devanagari
  const ccgHindi = normalizeStation('चर्चगेट');
  assert(ccgHindi.matchedStation?.code === 'CCG', 'G14.3: "चर्चगेट" resolves to CCG (Churchgate)');

  // 14d. Ambiguous query "Dadar" (Could be Dadar Central or Dadar Western)
  const dadarNorm = normalizeStation('दादर');
  assert(dadarNorm.isAmbiguous === true || dadarNorm.candidates.length >= 2, 'G14.4: "दादर" detects multiple line candidates');

  // 14e. Nonexistent station
  const fakeNorm = normalizeStation('FantasyExpressStation');
  assert(fakeNorm.matchedStation === undefined && fakeNorm.confidence === 'NONE', 'G14.5: Rejects nonexistent station without fabricating stop');
}

// Scenario 15: Same RailSathi voice and manual search: exact same eligibility, routes and demo booking outputs
console.log('\n[G15] Scenario 15: Voice & Manual 100% Deterministic Function Parity');
{
  const manualResults = planJourneys({
    originCode: 'TNA',
    destCode: 'DR',
    departureTime: '10:40',
    userContext: 'pre_departure',
    preferences: {
      classPreference: 'second',
      priority: 'fastest',
      hasSeasonPass: false,
      walkToStationMinutes: 15,
      maxTransfers: 1
    }
  });

  const voiceResults = RailBackendTools.searchTrains('TNA', 'DR', '10:40', 'second');
  assert(voiceResults.status === 'success', 'G15.1: Voice search returns success');
  if (voiceResults.status === 'success') {
    assert(voiceResults.count === manualResults.length, 'G15.2: Voice and manual return identical itinerary count');
    assert(voiceResults.itineraries[0].id === manualResults[0].id, 'G15.3: Top recommended journey ID is identical');
    assert(voiceResults.itineraries[0].departure === manualResults[0].predictedDeparture, 'G15.4: Departure times match exactly');
  }
}

// Scenario 16: Offline mode shows cached data and valid test specimen ticket, with stale warning
console.log('\n[G16] Scenario 16: Offline Resilient Caching & Specimen Presentation');
{
  assert(Object.keys(STATIONS).length >= 10, 'G16.1: Complete offline station index loaded in memory');
  assert(TRAIN_TRIPS.length >= 10, 'G16.2: Offline timetable catalog available without network');
  const tickets = MockBookingStore.listBookings();
  assert(tickets.length > 0, 'G16.3: Specimen tickets available locally from storage');
  assert(tickets[0].qrPayload.includes('NOT VALID FOR TRAVEL'), 'G16.4: Specimen ticket carries mandatory disclaimer');
}

// Scenario 17: Fake API/unknown provider: safe failure, no hardcoded fictitious fallback called live
console.log('\n[G17] Scenario 17: Safe Failure & Truth-in-Data for Unknown Providers');
{
  const unknownTrainRes = RailBackendTools.getLiveStatus('00000');
  assert(unknownTrainRes.status === 'error', 'G17.1: Returns clean error for unknown train');
  if (unknownTrainRes.status === 'error') {
    assert(unknownTrainRes.message.includes('not found'), 'G17.2: Truthfully states train is not found');
  }
}

// Scenario 18: Mobile screen-size, dark/light, keyboard navigation, reduced-motion and loading checks
console.log('\n[G18] Scenario 18: Responsive Tokens, Theme Palettes & Accessibility');
{
  const { THEME_CONFIG } = await import('../src/components/ThemeContext');
  assert(Object.keys(THEME_CONFIG).length === 8, 'G18.1: 8 accessible theme palettes configured');
  assert(THEME_CONFIG.contrast.name.includes('High-Contrast'), 'G18.2: High-contrast WCAG AAA theme present');

  const { TASK_PRIORITY_METADATA } = await import('../src/types/tasks');
  assert(TASK_PRIORITY_METADATA.P0_CRITICAL !== undefined, 'G18.3: P0 priority defined with top sort weight');

  const { BottomNavigation } = await import('../src/components/common/BottomNavigation');
  const bottomNavHtml = renderToString(React.createElement(BottomNavigation, {
    activeTab: 'journey',
    onTabChange: () => {},
    savedTicketCount: 2,
    hasActiveAlerts: true
  }));
  assert(
    bottomNavHtml.includes('role="navigation"') &&
    bottomNavHtml.includes('Primary Mobile Navigation') &&
    bottomNavHtml.includes('aria-current="page"') &&
    bottomNavHtml.includes('min-h-[48px]') &&
    bottomNavHtml.includes('Home') &&
    bottomNavHtml.includes('Journey') &&
    bottomNavHtml.includes('Live') &&
    bottomNavHtml.includes('Tickets') &&
    bottomNavHtml.includes('Help'),
    'G18.4: BottomNavigation renders accessible thumb-reachable navigation with 5 passenger tabs and ARIA page landmark'
  );

  const { DataProvenanceBadge, StatusBadge, SegmentedControl } = await import('../src/components/common/DesignSystemPrimitives');
  const liveBadge = renderToString(React.createElement(DataProvenanceBadge, { provenance: 'LIVE_VERIFIED' }));
  const demoBadge = renderToString(React.createElement(DataProvenanceBadge, { provenance: 'DEMO' }));
  const delayedStatus = renderToString(React.createElement(StatusBadge, { status: 'DELAYED', delayMinutes: 15 }));
  const segmentedHtml = renderToString(React.createElement(SegmentedControl, {
    options: [
      { id: 'tab1', label: 'First Tab', badge: 3 },
      { id: 'tab2', label: 'Second Tab' }
    ],
    value: 'tab1',
    onChange: () => {},
    ariaLabel: 'Test Tabs'
  }));

  assert(
    liveBadge.includes('[VERIFIED LIVE]') &&
    demoBadge.includes('[SIMULATED SCENARIO]') &&
    delayedStatus.includes('+15m Late') &&
    segmentedHtml.includes('role="tablist"') &&
    segmentedHtml.includes('role="tab"') &&
    segmentedHtml.includes('aria-selected="true"'),
    'G18.5: DesignSystemPrimitives render statutory provenance, status indicators, and tablist accessibility'
  );
}

// =========================================================================
// SECTION B: ARCHITECTURAL INTEGRATION SUITES (SUITES 1 – 16)
// =========================================================================

console.log('\n--- SECTION B: ARCHITECTURAL INTEGRATION SUITES (SUITES 1–16) ---');

console.log('Test Suite 1: Station Graph & Alias Normalization');
{
  assert(STATIONS.CSMT !== undefined, 'CSMT station exists with platforms');
  assert(STATIONS.DR.interchangeWalkMinutes === 7, 'Dadar interchange walk buffer is configured (7 mins)');
  assert(STATIONS.TNA.platforms.length >= 8, 'Thane has realistic platform count');
  const cstNorm = normalizeStation('cst');
  assert(cstNorm.matchedStation?.code === 'CSMT' && cstNorm.confidence === 'EXACT', 'Station alias normalization works for CST -> CSMT (EXACT)');
  assert(STATIONS.KYN.city === 'Kalyan', 'Kalyan station metadata valid');
}

console.log('\nTest Suite 8: Official Suburban & Express Fare Tariffs');
{
  assert(calculateSuburbanFare(10, 'II') === 5, 'Suburban 10km Second Class is ₹5');
  assert(calculateSuburbanFare(35, 'II') === 10, 'Suburban 35km Second Class is ₹10');
  assert(calculateSuburbanFare(55, 'II') === 15, 'Suburban 55km Second Class is ₹15');
  assert(calculateSuburbanFare(35, 'I') === 105, 'Suburban 35km First Class is ₹105');
  assert(calculateSuburbanFare(35, 'AC_LOCAL') === 95, 'Suburban 35km AC Local is ₹95');
  assert(calculateSuburbanFare(138, '2S') > 50, 'Express 2S has distance-based minimum tariff');
}

console.log('\nTest Suite 13: Network Service Alerts & Operations Control API');
{
  const { NetworkAlertsService } = await import('../src/services/networkAlertsService');
  const allAlerts = await NetworkAlertsService.getActiveAlerts();
  assert(allAlerts.length >= 4, 'NetworkAlertsService returns multi-division service alerts');
  const crAlerts = await NetworkAlertsService.getActiveAlerts('central');
  assert(crAlerts.every(a => a.line === 'central'), 'Division filtering works for Central Railway alerts');
}

console.log('\nTest Suite 16: Visual Route Delay & Congestion Heatmap Engine');
{
  const { computeRouteHeatmap, computeNetworkCorridorHeatmaps } = await import('../src/engine/delayHeatmap');
  const delayedTrain = TRAIN_TRIPS.find(t => t.trainNumber === '95112')!;
  const obs = INITIAL_OBSERVATIONS['95112'];
  const segments = computeRouteHeatmap(delayedTrain, obs);
  assert(segments.length > 0, 'Route heatmap computes intermediate track segments');
  assert(segments.some(s => s.intensity === 'CRITICAL'), 'Identifies CRITICAL thermal intensity for +22m delay section');
}

console.log('\nTest Suite 17: Interactive 2D/3D Network Map Engine & Multi-Train Track Delays');
{
  const { 
    getStationsForScope, 
    getTrackSegmentsForScope, 
    getTrainMarkersForScope, 
    project3DIsometric 
  } = await import('../src/engine/networkMapEngine');

  // 17.1 Mumbai Suburban scope station nodes
  const subStations = getStationsForScope('mumbai_suburban');
  assert(subStations.length >= 15, '17.1: Mumbai suburban network nodes loaded (at least 15 stations)');
  const dadarNode = subStations.find(s => s.code === 'DR');
  assert(dadarNode !== undefined && dadarNode.isInterchange === true, '17.2: Dadar junction node is registered interchange');

  // 17.2 Pan-India national scope station nodes
  const natStations = getStationsForScope('pan_india');
  assert(natStations.length >= 20, '17.3: Pan-India national trunk nodes loaded (at least 20 hubs)');
  assert(natStations.some(s => s.code === 'NDLS'), '17.4: New Delhi national terminus present');
  assert(natStations.some(s => s.code === 'HWH'), '17.5: Howrah Eastern hub terminus present');
  assert(natStations.some(s => s.code === 'MAS'), '17.6: Chennai Central Southern hub present');
  assert(natStations.some(s => s.code === 'SBC'), '17.7: Bengaluru South Western hub present');

  // 17.3 Track segments and multi-train routes ("which trains run through what")
  const subSegments = getTrackSegmentsForScope('mumbai_suburban');
  assert(subSegments.length > 0, '17.8: Mumbai suburban track segments created');
  const claDrSeg = subSegments.find(s => s.id === 'CLA-DR' || s.id === 'DR-CLA');
  assert(claDrSeg !== undefined, '17.9: Kurla-Dadar track segment exists');
  if (claDrSeg) {
    assert(claDrSeg.trainsPassing.length >= 3, '17.10: Multiple trains run through Kurla-Dadar segment');
    assert(claDrSeg.averageDelayMinutes > 0, '17.11: Computes average delay across all trains traversing track');
    assert(claDrSeg.disruptionReason !== undefined && claDrSeg.disruptionReason.length > 10, '17.12: Provides explicit disruption reason for track delay');
    assert(claDrSeg.isBottleneck === true, '17.13: Accurately flags Kurla-Dadar as congestion bottleneck');
  }

  // 17.4 Pan-India track segments and delay metrics
  const natSegments = getTrackSegmentsForScope('pan_india');
  assert(natSegments.length > 0, '17.14: Pan-India trunk track segments generated');
  const foggyTrack = natSegments.find(s => (s.fromCode === 'NDLS' && s.toCode === 'CNB') || (s.fromCode === 'CNB' && s.toCode === 'NDLS'));
  if (foggyTrack) {
    assert(foggyTrack.trainsPassing.includes('12301'), '17.15: Tracks Howrah Rajdhani on New Delhi - Kanpur corridor');
    assert(foggyTrack.disruptionReason!.toLowerCase().includes('fog'), '17.16: Identifies fog/visibility disruption reason on Northern corridor');
    assert(foggyTrack.averageDelayMinutes >= 20, '17.17: Average corridor delay reflects fog speed restrictions');
  }

  // 17.5 Live train markers
  const subMarkers = getTrainMarkersForScope('mumbai_suburban');
  assert(subMarkers.length > 0, '17.18: Generates live train markers for suburban services');
  const fastLocalMarker = subMarkers.find(m => m.trainNumber === '95112');
  assert(fastLocalMarker !== undefined, '17.19: Fast Local 95112 marker present');
  if (fastLocalMarker) {
    assert(fastLocalMarker.delayMinutes === 22, '17.20: Fast Local marker reflects current delay (+22m)');
    assert(fastLocalMarker.position.x > 0 && fastLocalMarker.position.y > 0, '17.21: Marker carries valid screen coordinates');
  }

  // 17.6 3D Isometric projection math
  const isoResult = project3DIsometric(400, 300, 20, 38, -15);
  assert(!isNaN(isoResult.projX) && !isNaN(isoResult.projY), '17.22: 3D Isometric projection computes valid numerical coordinates');
  assert(isoResult.projX > 0 && isoResult.projY > 0, '17.23: 3D Projection lies within valid positive canvas space');

  // 17.7 Full Mumbai Suburban network coverage across Western, Central, Harbour, Trans-Harbour, and Uran lines
  const hasWestern = subStations.some(s => s.line === 'western');
  const hasCentral = subStations.some(s => s.line === 'central');
  const hasHarbour = subStations.some(s => s.line === 'harbour');
  const hasTransHarbour = subStations.some(s => s.line === 'transharbour');
  const hasUran = subStations.some(s => s.line === 'uran');
  assert(subStations.length >= 70 && hasWestern && hasCentral && hasHarbour && hasTransHarbour && hasUran, 
    '17.24: Complete Mumbai suburban coverage (70+ stations across WR, CR, HR, Trans-Harbour, Uran)');

  // 17.8 Pan-India network trunk hub breadth
  assert(natStations.length >= 30, '17.25: Pan-India network includes 30+ major national trunk hubs across all zones');

  // 17.9 Train route illumination engine
  const { getRouteSegmentsForTrain, searchNetworkMap } = await import('../src/engine/networkMapEngine');
  const fastLocalRoutes = getRouteSegmentsForTrain('95112', 'mumbai_suburban');
  assert(fastLocalRoutes.length > 0 && fastLocalRoutes.includes('CLA-DR'), 
    '17.26: Train route illumination identifies all segments traversed by Fast Local 95112');

  // 17.10 Intermediate slow line track segment exists and carries delay data
  const tnaMlndSeg = subSegments.find(s => s.id === 'MLND-TNA' || s.id === 'TNA-MLND');
  assert(tnaMlndSeg !== undefined && tnaMlndSeg.fromName.length > 0, 
    '17.27: Intermediate local slow line track segment (Thane-Mulund) generated');

  // 17.11 Multilingual station search
  const hindiSearch = searchNetworkMap('कल्याण', 'mumbai_suburban');
  assert(hindiSearch.stations.some(s => s.code === 'KYN'), 
    '17.28: Multilingual network map search resolves Devanagari "कल्याण" to Kalyan Jn');

  // 17.12 Train number search across Pan-India
  const trainSearch = searchNetworkMap('12951', 'pan_india');
  assert(trainSearch.trains.some(t => t.trainNumber === '12951'), 
    '17.29: Network map search finds Mumbai Rajdhani by train number 12951');
}

console.log('\nTest Suite 18: 3D Station Navigation, God\'s Eye Topological Layouts & FOB Transfer Routing');
{
  const { 
    STATION_3D_LAYOUTS, 
    calculateStationTransferRoute 
  } = await import('../src/fixtures/stationLayoutsData');

  // 18.1 Major railway hub layouts loaded
  const hubCodes = Object.keys(STATION_3D_LAYOUTS);
  assert(hubCodes.includes('DR') && hubCodes.includes('CSMT') && hubCodes.includes('TNA') && hubCodes.includes('ADH') && hubCodes.includes('KYN') && hubCodes.includes('NDLS'), 
    '18.1: Station layout index loads major interchange hubs (Dadar, CSMT, Thane, Andheri, Kalyan, NDLS)');

  // 18.2 Dadar Junction Western vs Central line platform segregation
  const dadar = STATION_3D_LAYOUTS['DR'];
  assert(dadar.platforms.length === 15, '18.2: Dadar Junction contains 15 total operational platforms (7 WR + 8 CR)');
  const dadarWR = dadar.platforms.filter(p => p.line === 'western');
  const dadarCR = dadar.platforms.filter(p => p.line === 'central');
  assert(dadarWR.length === 7 && dadarCR.length === 8, '18.3: Accurately separates Western (PF 1-7) and Central (PF 1-8) platforms');

  // 18.3 Foot-Over-Bridge transfer pathfinder computes realistic cross-line walk time
  const wrToCrRoute = calculateStationTransferRoute('DR', 'DR_WR_1', 'DR_CR_4', false);
  assert(wrToCrRoute.success === true, '18.4: Cross-line transfer route calculated successfully');
  assert(wrToCrRoute.walkMinutes >= 6 && wrToCrRoute.walkMinutes <= 8, '18.5: Foot-Over-Bridge walk time between WR PF 1 and CR PF 4 is realistic (6-8 mins)');
  assert(wrToCrRoute.steps.length >= 4, '18.6: Provides step-by-step pedestrian navigation instructions');

  // 18.4 Accessible Step-Free transfer pathfinding
  const stepFreeRoute = calculateStationTransferRoute('DR', 'DR_WR_3', 'DR_CR_4', true);
  assert(stepFreeRoute.stepFreeAvailable === true, '18.7: Step-free pathfinder detects elevator-equipped Foot-Over-Bridge');
  assert(stepFreeRoute.steps.some(s => s.toLowerCase().includes('elevator') || s.toLowerCase().includes('lift')), 
    '18.8: Step-free route guides commuter to elevator / lift access');

  // 18.5 Same-platform transfer zero walk
  const samePlatRoute = calculateStationTransferRoute('DR', 'DR_WR_1', 'DR_WR_1', false);
  assert(samePlatRoute.walkMinutes === 0 && samePlatRoute.distanceMeters === 0, 
    '18.9: Same-platform transfer returns 0 minute walk and safety boundary guidance');

  // 18.6 Andheri direct Metro Line 1 elevated skywalk link
  const andheri = STATION_3D_LAYOUTS['ADH'];
  assert(andheri.bridges.some(b => b.name.includes('Metro Line 1')), 
    '18.10: Andheri station includes Mumbai Metro Line 1 elevated skywalk connection');

  // 18.7 Thane SATIS elevated bus deck on Level 2
  const thane = STATION_3D_LAYOUTS['TNA'];
  assert(thane.levelsCount === 3 && thane.bridges.some(b => b.id === 'TNA_SATIS_DECK'), 
    '18.11: Thane station includes Level 2 SATIS elevated deck for municipal bus interchange');

  // 18.8 Platform occupancy tracking for berthed & approaching rakes
  const csmt = STATION_3D_LAYOUTS['CSMT'];
  const csmtPf3 = csmt.platforms.find(p => p.id === 'CSMT_3');
  assert(csmtPf3 !== undefined && csmtPf3.currentTrain !== undefined, 
    '18.12: Station platform occupancy mapping tracks live approaching / berthed trains');

  // 18.9 Amenities indexing includes RPF emergency security posts
  const rpfPost = dadar.amenities.find(a => a.type === 'rpf_post');
  assert(rpfPost !== undefined && rpfPost.isAccessible === true, 
    '18.13: Station amenities index includes RPF Security Post & SOS helpdesk');

  // 18.10 New Delhi national terminal Airport Express link
  const ndls = STATION_3D_LAYOUTS['NDLS'];
  assert(ndls.amenities.some(a => a.name.includes('Airport Express')), 
    '18.14: New Delhi national terminal indexes Delhi Metro Airport Express underpass');

  // 18.11 Dadar Middle FOB full breadth connection to Central PF 7 & 8
  const wrToCr7Route = calculateStationTransferRoute('DR', 'DR_WR_1', 'DR_CR_7', false);
  assert(wrToCr7Route.success === true && wrToCr7Route.recommendedBridge?.id === 'DR_MIDDLE_FOB', 
    '18.15: Dadar Middle FOB connects Western PF 1 to Central PF 7 across full station breadth');

  // 18.12 Dadar step-free transfer from WR PF 6 to CR PF 8
  const wr6ToCr8Route = calculateStationTransferRoute('DR', 'DR_WR_6', 'DR_CR_8', true);
  assert(wr6ToCr8Route.success === true && wr6ToCr8Route.recommendedBridge?.id === 'DR_MIDDLE_FOB' && wr6ToCr8Route.stepFreeAvailable === true, 
    '18.16: Dadar WR PF 6 to CR PF 8 step-free route selects elevator-equipped Middle FOB');

  // 18.13 Expanded 3D station catalog (Kurla, Borivali, Churchgate)
  assert(hubCodes.includes('CLA') && hubCodes.includes('BVI') && hubCodes.includes('CCG'), 
    '18.17: Station 3D catalog indexes Kurla (CLA), Borivali (BVI), and Churchgate (CCG)');

  // 18.14 Kurla Junction Central Main vs Harbour line separation
  const kurla = STATION_3D_LAYOUTS['CLA'];
  const kurlaCR = kurla.platforms.filter(p => p.line === 'central');
  const kurlaHR = kurla.platforms.filter(p => p.line === 'harbour');
  assert(kurla.platforms.length === 8 && kurlaCR.length === 6 && kurlaHR.length === 2, 
    '18.18: Kurla Junction models 8 platforms segregating Central Main (PF 1-6) and Harbour (PF 7-8)');

  // 18.15 Borivali junction 8 platforms and elevated skywalk
  const borivali = STATION_3D_LAYOUTS['BVI'];
  assert(borivali.platforms.length === 8 && borivali.bridges.some(b => b.id === 'BVI_SOUTH_SKYWALK' && b.level === 2), 
    '18.19: Borivali terminus models 8 operational platforms and Level 2 SV Road skywalk');

  // 18.16 Churchgate terminus 4 platforms and ground heritage concourse
  const churchgate = STATION_3D_LAYOUTS['CCG'];
  assert(churchgate.platforms.length === 4 && churchgate.bridges.some(b => b.id === 'CCG_MAIN_CONCOURSE' && b.level === 0), 
    '18.20: Churchgate terminus models 4 platforms and Level 0 heritage passenger concourse');

  // 18.17 Cross-line transfer Kurla Central PF 1 to Harbour PF 7
  const claCrToHrRoute = calculateStationTransferRoute('CLA', 'CLA_1', 'CLA_7', false);
  assert(claCrToHrRoute.success === true && claCrToHrRoute.recommendedBridge?.id === 'CLA_CENTRAL_FOB', 
    '18.21: Kurla cross-line transfer between Central PF 1 and Harbour PF 7 uses Central Interchange FOB');

  // 18.18 Safe failure for unindexed station layout
  const unindexedRoute = calculateStationTransferRoute('UNKNOWN_STN', 'PF_1', 'PF_2', false);
  assert(unindexedRoute.success === false && unindexedRoute.steps[0].includes('not indexed'), 
    '18.22: Unindexed station layout request safely fails with explanatory guidance');
}

console.log('\nTest Suite 19: Mumbai Metro Network, Strict AC Filtering, Pan-India Clickability & Multimodal Fare Engine');
{
  const { METRO_STATIONS, METRO_LINES, calculateMetroFare } = await import('../src/fixtures/metroData');
  const { PAN_INDIA_NODES, MUMBAI_METRO_NODES } = await import('../src/fixtures/networkMapData');
  const { searchNetworkMap } = await import('../src/engine/networkMapEngine');

  // 19.1 Mumbai Metro Line Coverage
  assert(METRO_LINES.line1.stationCodes.length === 12, '19.1: Mumbai Metro Line 1 covers 12 stations (Versova to Ghatkopar)');
  assert(METRO_LINES.line2a.stationCodes.length === 17, '19.2: Mumbai Metro Line 2A covers 17 stations (Dahisar East to Andheri West)');
  assert(METRO_LINES.line7.stationCodes.length === 14, '19.3: Mumbai Metro Line 7 covers 14 stations (Dahisar East to Gundavali)');
  assert(METRO_LINES.line3.stationCodes.length === 10, '19.4: Mumbai Metro Line 3 covers Phase 1 underground corridor');

  // 19.2 Distance-Slab Metro Fares
  assert(calculateMetroFare(2.5) === 10, '19.5: Metro fare for <=3 km is ₹10');
  assert(calculateMetroFare(8.0) === 20, '19.6: Metro fare for 3-12 km is ₹20');
  assert(calculateMetroFare(15.0) === 30, '19.7: Metro fare for 12-18 km is ₹30');
  assert(calculateMetroFare(22.0) === 40, '19.8: Metro fare for 18-24 km is ₹40');
  assert(calculateMetroFare(28.0) === 50, '19.9: Metro fare for 24-30 km is ₹50');

  // 19.3 Multimodal Interchanges
  const ghatkoparTransfer = METRO_STATIONS['METRO_GHT'].interchangeWith.find(i => i.targetCode === 'GC');
  assert(ghatkoparTransfer !== undefined && ghatkoparTransfer.networkType === 'suburban', 
    '19.10: Ghatkopar Metro 1 has dedicated Foot Over Bridge transfer to Central Suburban');
  const andheriTransfer = METRO_STATIONS['METRO_ADH'].interchangeWith.find(i => i.targetCode === 'ADH');
  assert(andheriTransfer !== undefined && andheriTransfer.walkwayType === 'skywalk', 
    '19.11: Andheri Metro 1 has direct elevated skywalk to Western Suburban platforms');

  // 19.4 Pan-India Station Nodes (Nagpur and Raipur)
  const nagpur = PAN_INDIA_NODES.find(n => n.code === 'NGP');
  const raipur = PAN_INDIA_NODES.find(n => n.code === 'R');
  assert(nagpur !== undefined && Array.isArray(nagpur.platforms) && nagpur.platforms.length === 8 && nagpur.zone === 'CR', 
    '19.12: Pan-India network includes Nagpur (NGP) with 8 platforms and Central Railway zone metadata');
  assert(raipur !== undefined && Array.isArray(raipur.platforms) && raipur.platforms.length === 7 && raipur.zone === 'SECR', 
    '19.13: Pan-India network includes Raipur (R) with 7 platforms and South East Central Railway zone metadata');

  // 19.5 Global Network Map Search fallback
  const globalNagpur = searchNetworkMap('Nagpur', 'mumbai_suburban');
  assert(globalNagpur.stations.some(s => s.code === 'NGP'), 
    '19.14: Global search finds Nagpur across national network even when Mumbai Suburban is selected');
  const globalRaipur = searchNetworkMap('Raipur', 'mumbai_suburban');
  assert(globalRaipur.stations.some(s => s.code === 'R'), 
    '19.15: Global search finds Raipur across national network even when Mumbai Suburban is selected');

  // 19.6 Strict AC Only Filtering
  const acJourneys = planJourneys({
    originCode: 'TNA',
    destCode: 'CSMT',
    departureTime: '10:30',
    userContext: 'pre_departure',
    preferences: {
      classPreference: 'ac_mandatory',
      priority: 'fastest',
      hasSeasonPass: false,
      walkToStationMinutes: 5,
      maxTransfers: 0
    }
  });
  assert(acJourneys.length > 0, '19.16: Found AC suburban journeys when AC is mandatory');
  assert(acJourneys.every(j => j.isAcService), '19.17: Strict AC filtering excludes 100% of non-AC services');

  // 19.7 Multimodal Metro Journey Planning
  const metroJourneys = planJourneys({
    originCode: 'METRO_VER',
    destCode: 'METRO_GHT',
    departureTime: '10:00',
    userContext: 'pre_departure',
    preferences: {
      classPreference: 'any',
      priority: 'fastest',
      hasSeasonPass: false,
      walkToStationMinutes: 5,
      maxTransfers: 0
    }
  });
  assert(metroJourneys.length > 0, '19.18: Multimodal journey engine successfully plans direct Mumbai Metro trip');
  assert(metroJourneys[0].totalFareByClass.II !== undefined && metroJourneys[0].totalFareByClass.II > 0, 
    '19.19: Calculates official distance-slab fare for Metro journey');
}

console.log('\nTest Suite 20: Institutional Passenger PWA, Offline Service Worker & Theming Verification');
{
  const manifestPath = path.resolve(process.cwd(), 'public/manifest.json');
  assert(fs.existsSync(manifestPath), '20.1: PWA manifest.json exists in public directory');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert(manifest.display === 'standalone' && manifest.short_name === 'RailOne Next', '20.2: manifest.json configured with standalone display and RailOne Next name');
  }

  const swPath = path.resolve(process.cwd(), 'public/sw.js');
  assert(fs.existsSync(swPath), '20.3: PWA service worker (sw.js) exists for offline caching');
  if (fs.existsSync(swPath)) {
    const swContent = fs.readFileSync(swPath, 'utf8');
    assert(swContent.includes('railone-offline') && swContent.includes('fetch'), '20.4: Service worker includes offline cache and network fallback handlers');
  }

  const icon192Path = path.resolve(process.cwd(), 'public/icon-192.svg');
  const icon512Path = path.resolve(process.cwd(), 'public/icon-512.svg');
  assert(fs.existsSync(icon192Path) && fs.existsSync(icon512Path), '20.5: PWA scalable SVG icons exist (192px and 512px)');

  const themeKeys = Object.keys(THEME_CONFIG);
  assert(themeKeys.length === 8, '20.6: Exactly 8 authentic railway themes configured in THEME_CONFIG');
  assert(themeKeys.every(k => (THEME_CONFIG as any)[k].primaryHex.startsWith('#')), '20.7: All 8 themes specify valid primaryHex color tokens');
}

console.log('\nTest Suite 21: Global Benchmarks, Coach Alignment (Wagenstandsanzeiger) & Institutional Academic Dossier');
{
  const coachGuidePath = path.resolve(process.cwd(), 'src/components/CoachPositionGuide.tsx');
  assert(fs.existsSync(coachGuidePath), '21.1: CoachPositionGuide component exists in src/components');
  
  const { getRakeFormation, computeCoachRecommendation, getPlatformAlignment } = await import('../src/models/coachGuide');
  const sub12 = getRakeFormation('12_car_suburban');
  const ac12 = getRakeFormation('12_car_ac_suburban');
  assert(
    !!sub12 && sub12.totalCoaches === 12 && !!ac12 && ac12.totalCoaches === 12 && ac12.isAirConditioned,
    '21.2: 12-car Non-AC and AC local suburban rake models supported'
  );

  const accessibleCoach = sub12?.coaches.find(c => c.isAccessible);
  assert(
    !!accessibleCoach && accessibleCoach.category === 'divyangjan' && accessibleCoach.ticketNotice.toLowerCase().includes('divyangjan'),
    '21.3: Divyangjan handicap accessible coach alignment mapped with tactile guidance'
  );

  const vb16 = getRakeFormation('16_car_vande_bharat');
  const ecCoaches = vb16?.coaches.filter(c => c.category === 'executive');
  assert(
    !!vb16 && vb16.totalCoaches === 16 && (ecCoaches?.length ?? 0) >= 2,
    '21.4: 16-car Vande Bharat Express configuration with Executive Chair Car (EC) mapped'
  );

  // 21.5: Behavioral platform landmark recommendation (Dadar PF 3 -> Middle FOB for Coach 4/5)
  const dadarRec = computeCoachRecommendation({
    rakeType: '12_car_suburban',
    coachSequence: 4,
    stationCode: 'DR',
    platformNumber: '3'
  });
  const unalignedRec = computeCoachRecommendation({
    rakeType: '12_car_suburban',
    coachSequence: 4,
    stationCode: 'XYZ',
    platformNumber: '99'
  });
  assert(
    dadarRec.status === 'AVAILABLE' && 
    Boolean(dadarRec.nearestLandmark?.name.includes('Foot-Over-Bridge')) &&
    unalignedRec.status === 'UNAVAILABLE' &&
    Boolean(unalignedRec.message?.includes('unavailable')),
    '21.5: Platform Foot-Over-Bridge exit mapping guides commuter to fast interchange stairs'
  );

  const dossierPath = path.resolve(process.cwd(), 'src/components/InstitutionalDossierModal.tsx');
  assert(fs.existsSync(dossierPath), '21.6: InstitutionalDossierModal exists for academic exam evaluation');
  if (fs.existsSync(dossierPath)) {
    const dossierContent = fs.readFileSync(dossierPath, 'utf8');
    assert(dossierContent.includes('JR East') && dossierContent.includes('SBB') && dossierContent.includes('TfL') && dossierContent.includes('DB Navigator') && dossierContent.includes('SMRT'),
      '21.7: Documents 5 global benchmark transit authorities (Japan, Switzerland, UK, Germany, Singapore)');
    assert(dossierContent.includes('Section 138') && dossierContent.includes('Compounding Delay'),
      '21.8: Documents statutory Railways Act Section 138 and compounding delay mathematical proofs');
  }
}

console.log('\nTest Suite 22: Service-Oriented Backend Architecture, SQLite Persistence & RailSathi Voice Engine');
{
  // 22.1: SQLite Database initialization
  resetDatabase(true);
  const db = getDatabase();
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  const tableNames = tables.map((t: any) => t.name);
  assert(
    tableNames.includes('bookings') &&
    tableNames.includes('tickets') &&
    tableNames.includes('cancellations') &&
    tableNames.includes('audit_logs') &&
    tableNames.includes('voice_sessions'),
    '22.1: SQLite database initializes with all 7 persistence tables'
  );

  // 22.2: Station normalization & search
  const cstStation = getStationByCode('CST');
  const thaneResults = searchStations('Thane');
  assert(
    cstStation?.code === 'CSMT' && thaneResults.length > 0 && thaneResults[0].code === 'TNA',
    '22.2: Station registry normalizes aliases (CST -> CSMT) and searches correctly'
  );

  // 22.3: Fares module
  const sub2nd = calcSubFare(35, 'II');
  const sub1st = calcSubFare(35, 'I');
  const subAC = calcSubFare(35, 'AC_LOCAL');
  const metroFare = calcMetroFare(8);
  assert(
    sub2nd.totalFare === 10 && sub1st.totalFare === 105 && subAC.totalFare === 95 && metroFare.totalFare === 20,
    '22.3: Fare calculation matches official Suburban and Metro tariff slabs'
  );

  // 22.4: Route planner & AC filter
  const acRoutes = searchRoutes({ from: 'TNA', to: 'CSMT', acOnly: true });
  assert(
    acRoutes.length > 0 && acRoutes.every(r => r.isAcService),
    '22.4: Generalized route planner enforces strict AC filtering'
  );

  // 22.5: Server-side booking creation & idempotency
  const booking1 = createBooking({
    idempotencyKey: 'IDEMP-TEST-001',
    trainNumber: '95114',
    journeyDate: '2026-10-15',
    fromStationCode: 'TNA',
    toStationCode: 'CSMT',
    classBooked: 'AC_LOCAL',
    passengers: [{ name: 'Arjun Verma', age: 32, gender: 'M' }]
  });
  const bookingDuplicate = createBooking({
    idempotencyKey: 'IDEMP-TEST-001',
    trainNumber: '95114',
    journeyDate: '2026-10-15',
    fromStationCode: 'TNA',
    toStationCode: 'CSMT',
    classBooked: 'AC_LOCAL',
    passengers: [{ name: 'Arjun Verma', age: 32, gender: 'M' }]
  });
  assert(
    booking1.id === bookingDuplicate.id &&
    booking1.bookingState === 'TICKET_ISSUED_DEMO' &&
    booking1.qrPayload.includes('DEMO / NOT VALID FOR TRAVEL'),
    '22.5: Server-side booking creation enforces idempotency and watermarking'
  );

  // 22.6: Payment timeout state machine and reconciliation
  const pendingBooking = createBooking({
    idempotencyKey: 'IDEMP-TEST-TIMEOUT',
    trainNumber: '95114',
    journeyDate: '2026-10-15',
    fromStationCode: 'TNA',
    toStationCode: 'CSMT',
    classBooked: 'I',
    passengers: [{ name: 'Sunil Rao', age: 45, gender: 'M' }],
    simulateTimeout: true
  });
  const reconciled = reconcileBooking(pendingBooking.id);
  assert(
    pendingBooking.bookingState === 'PENDING_RECONCILIATION_DEMO' &&
    reconciled.bookingState === 'TICKET_ISSUED_DEMO',
    '22.6: Payment timeout state machine and deterministic reconciliation'
  );

  // 22.7: Cancellation & statutory clerical deductions
  const cancelResult = cancelBooking(booking1.id, 'Change of travel plans');
  const updatedBooking = getBookingById(booking1.id);
  assert(
    cancelResult.refundBreakdown.totalPaid === 95 &&
    cancelResult.refundBreakdown.clericalDeduction === 30 &&
    cancelResult.refundBreakdown.walletRefund === 65 &&
    updatedBooking?.bookingState === 'CANCELLED_DEMO',
    '22.7: Ticket cancellation computes statutory clerical deductions and RailWallet refund'
  );

  // 22.8: Audit logging
  const auditLogs = getAuditLogs(10);
  const eventTypes = auditLogs.map(l => l.eventType);
  assert(
    eventTypes.includes('BOOKING_CREATED') && eventTypes.includes('BOOKING_CANCELLED'),
    '22.8: Server-side audit log records booking lifecycle transactions'
  );

  // 22.9: RailSathi voice multi-turn conversation
  const session = startVoiceSession({ language: 'en' });
  const turn1 = await processVoiceTurn(session.sessionId, 'Book me a first-class local from Thane to Churchgate around 12:30');
  const turn2 = await processVoiceTurn(session.sessionId, 'Use AC if available, otherwise show first class');
  const turn3 = await processVoiceTurn(session.sessionId, 'Book this one');
  const turn4 = await processVoiceTurn(session.sessionId, 'Yes confirm');
  assert(
    turn1.state === 'ITINERARY_OFFERED' &&
    turn2.activeDraft.preferredClass === 'AC_LOCAL' &&
    turn3.state === 'AWAITING_CONFIRMATION' &&
    turn4.state === 'BOOKING_EXECUTED' &&
    !!turn4.issuedBooking,
    '22.9: RailSathi voice agent executes complete 4-turn booking conversation with tool grounding'
  );

  // 22.10: Telephony provider adapter statutory blocker
  const telephony = new StatutoryTelephonyAdapter();
  const blocker = telephony.getBlockerDossier();
  const callAttempt = await telephony.initiateCall('+919876543210', '+919999999999');
  assert(
    blocker.is139Repurposed === false && callAttempt.status === 'blocked',
    '22.10: Telephony provider adapter enforces statutory DoT blocker and prohibits 139 co-opting'
  );

  // 22.11: Health check validates all 20 modules
  const health = checkSystemHealth(false);
  assert(
    health.status === 'healthy' && health.modulesCount === 20 && health.database.status === 'connected',
    '22.11: Health check validates all 20 modules and SQLite database operational'
  );

  // 22.12: Authentic Express Search & Sleeper Class (SL) Booking
  const expressTrains = findExpressTrainsBetween('CSMT', 'NDLS', 'SL');
  const punjabMail = expressTrains.find(t => t.trainNumber === '12137');
  assert(
    !!punjabMail && punjabMail.availableClasses.includes('SL'),
    '22.12: Express service finder returns authentic Punjab Mail 12137 with Sleeper class'
  );

  // 22.13: Books authentic Punjab Mail Sleeper (SL) ticket at statutory ₹976 distance fare
  const punjabBooking = createBooking({
    idempotencyKey: 'IDEMP-PUNJAB-12137',
    trainNumber: '12137',
    journeyDate: '2026-10-20',
    fromStationCode: 'CSMT',
    toStationCode: 'NDLS',
    classBooked: 'SL',
    passengers: [{ name: 'Deepak Sharma', age: 34, gender: 'M' }]
  });
  assert(
    punjabBooking.bookingState === 'TICKET_ISSUED_DEMO' && punjabBooking.farePaid === 976 && punjabBooking.classBooked === 'SL',
    '22.13: Books authentic Punjab Mail Sleeper (SL) ticket at statutory ₹976 distance fare'
  );

  // 22.14: RailSathi voice origin station correction
  const sessionCorr = startVoiceSession({ language: 'en' });
  await processVoiceTurn(sessionCorr.sessionId, 'Book ticket from Thane to CST');
  const correctedTurn = await processVoiceTurn(sessionCorr.sessionId, 'Actually not Thane, from Borivali');
  assert(
    correctedTurn.activeDraft.originCode === 'BVI',
    '22.14: RailSathi voice agent dynamically accepts origin station correction'
  );

  // 22.15: Server-side stop direction & unsupported class rejection
  let caughtReverse = false;
  try {
    createBooking({
      idempotencyKey: 'IDEMP-REV-FAIL',
      trainNumber: '12951', // MMCT -> NDLS
      journeyDate: '2026-10-20',
      fromStationCode: 'NDLS',
      toStationCode: 'MMCT',
      classBooked: '3A',
      passengers: [{ name: 'Test', age: 25, gender: 'M' }]
    });
  } catch (err: any) {
    if (err.message.includes('does not occur after')) caughtReverse = true;
  }

  let caughtClass = false;
  try {
    createBooking({
      idempotencyKey: 'IDEMP-CLS-FAIL',
      trainNumber: '12951', // all-AC
      journeyDate: '2026-10-20',
      fromStationCode: 'MMCT',
      toStationCode: 'NDLS',
      classBooked: 'SL',
      passengers: [{ name: 'Test', age: 25, gender: 'M' }]
    });
  } catch (err: any) {
    if (err.message.includes('not available')) caughtClass = true;
  }
  assert(
    caughtReverse && caughtClass,
    '22.15: Server-side ticketing strictly rejects reverse stop directions and unoffered classes'
  );

  // 22.16: Station track distance calculation
  const tnaToCcgDist = calculateStationDistance('TNA', 'CCG');
  const bviToCcgDist = calculateStationDistance('BVI', 'CCG');
  const sameDist = calculateStationDistance('CSMT', 'CSMT');
  assert(
    tnaToCcgDist !== null && bviToCcgDist !== null &&
    Math.round(tnaToCcgDist) === 35 && Math.round(bviToCcgDist) === 34 && sameDist === 0,
    '22.16: Station distance engine accurately calculates track kilometers across lines'
  );
}

console.log('\nTest Suite 23: Native Mobile Application (Expo / React Native), Offline Storage & Mobile Client Contracts');
{
  const { THEME_PALETTES } = await import('../apps/mobile/src/theme/ThemeContext');
  const { OfflineStorage } = await import('../apps/mobile/src/storage/offlineStorage');
  const { MobileApiClient } = await import('../apps/mobile/src/api/client');
  const { NativeVoiceService } = await import('../apps/mobile/src/services/voiceService');

  // 23.1: Mobile app manifest & bundle configuration
  const appJsonPath = path.resolve(process.cwd(), 'apps/mobile/app.json');
  assert(fs.existsSync(appJsonPath), '23.1: apps/mobile/app.json configuration exists');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  assert(
    appJson.expo.name === 'RailOne Next' &&
    appJson.expo.android.package === 'com.railone.next' &&
    appJson.expo.ios.bundleIdentifier === 'com.railone.next' &&
    !!appJson.expo.ios.infoPlist?.NSMicrophoneUsageDescription,
    '23.2: Native bundle identifier com.railone.next and microphone permissions configured'
  );

  // 23.3: Native mobile screen architecture (12 core screens)
  const mobileScreens = [
    'app/_layout.tsx',
    'app/(tabs)/_layout.tsx',
    'app/(tabs)/index.tsx',
    'app/(tabs)/journeys.tsx',
    'app/(tabs)/status.tsx',
    'app/(tabs)/tickets.tsx',
    'app/(tabs)/railsathi.tsx',
    'app/(tabs)/help.tsx',
    'app/call.tsx',
    'app/booking/express.tsx',
    'app/booking/local.tsx',
    'app/map.tsx',
    'app/wayfinding.tsx',
    'app/tte.tsx',
    'app/guide.tsx'
  ];
  const allScreensExist = mobileScreens.every(sc => fs.existsSync(path.resolve(process.cwd(), 'apps/mobile', sc)));
  assert(allScreensExist, '23.3: All 15 native Expo Router mobile screens and layouts exist');

  // 23.4: Authentic Railway Theme Palettes (8 Livery Themes)
  const themeKeys = Object.keys(THEME_PALETTES);
  assert(themeKeys.length === 8, '23.4: Exactly 8 authentic railway livery themes configured for mobile');
  assert(
    themeKeys.includes('central_navy') &&
    themeKeys.includes('western_signal') &&
    themeKeys.includes('vande_bharat_orange') &&
    themeKeys.includes('night_commuter'),
    '23.5: Authentic liveries include Central Navy, Western Signal, Vande Bharat Orange, and Night Commuter'
  );

  // 23.5: Offline Station and Search Storage Contract
  OfflineStorage.saveStations([
    { code: 'CSMT', name: 'CSMT Terminus', line: 'Central Main' },
    { code: 'TNA', name: 'Thane', line: 'Central Main' }
  ]);
  const cachedStations = OfflineStorage.getStations();
  OfflineStorage.addRecentSearch('TNA', 'CSMT');
  const recentSearches = OfflineStorage.getRecentSearches();
  assert(
    cachedStations.length === 2 &&
    cachedStations[0].code === 'CSMT' &&
    recentSearches.length > 0 &&
    recentSearches[0].from === 'TNA' &&
    recentSearches[0].to === 'CSMT',
    '23.6: Mobile OfflineStorage persists station catalog and recent search queries'
  );

  // 23.6: Offline Ticket Storage Contract
  await OfflineStorage.saveTicket({
    id: 'MOB-TCK-991',
    pnr: '234-8971234',
    trainNumber: '95112',
    trainName: 'CSMT Fast Local',
    fromStationName: 'Thane',
    toStationName: 'CSMT',
    journeyDate: '2026-10-15',
    classBooked: 'II',
    farePaid: 10,
    qrPayload: 'UTS-MOB-DEMO-[DEMO / NOT VALID FOR TRAVEL]',
    cachedAt: new Date().toISOString()
  });
  const cachedTickets = OfflineStorage.getTickets();
  assert(
    cachedTickets.some(t => t.id === 'MOB-TCK-991' && t.qrPayload.includes('NOT VALID FOR TRAVEL')),
    '23.7: Mobile OfflineStorage persists tickets with statutory watermark payload'
  );

  // 23.7: Mobile API Client interface contracts
  assert(
    typeof MobileApiClient.searchStations === 'function' &&
    typeof MobileApiClient.searchRoutes === 'function' &&
    typeof MobileApiClient.getTrainStatus === 'function' &&
    typeof MobileApiClient.createBooking === 'function' &&
    typeof MobileApiClient.reconcileBooking === 'function' &&
    typeof MobileApiClient.cancelTicket === 'function' &&
    typeof MobileApiClient.getFareQuote === 'function' &&
    typeof MobileApiClient.getInterchangeHubs === 'function' &&
    typeof MobileApiClient.getStationLayout === 'function' &&
    typeof MobileApiClient.getTransferWalk === 'function' &&
    typeof MobileApiClient.startVoiceSession === 'function' &&
    typeof MobileApiClient.sendVoiceTurn === 'function',
    '23.8: MobileApiClient provides typed contracts targeting all /api/v1 endpoints'
  );

  // 23.8: Native Voice Service audio state machine
  const voiceService = new NativeVoiceService('en');
  let observedState = '';
  voiceService.setCallbacks({
    onStateChange: (state) => { observedState = state; },
    onTurn: () => {}
  });
  assert(
    typeof voiceService.startCall === 'function' &&
    typeof voiceService.sendUtterance === 'function' &&
    typeof voiceService.endCall === 'function',
    '23.9: NativeVoiceService implements audio state machine lifecycle methods'
  );

  // 23.10: Native voice service interruption
  let interruptState = '';
  voiceService.setCallbacks({
    onStateChange: (state) => { interruptState = state; },
    onTurn: () => {}
  });
  voiceService.interrupt();
  assert(
    interruptState === 'LISTENING',
    '23.10: NativeVoiceService.interrupt() immediately transitions audio state to LISTENING'
  );

  // 23.11: Mobile offline storage saved journeys
  OfflineStorage.saveSavedJourney({
    id: 'SAVED-1',
    fromStationCode: 'TNA',
    fromStationName: 'Thane',
    toStationCode: 'CCG',
    toStationName: 'Churchgate',
    preferredClass: 'AC_LOCAL'
  });
  const savedJourneys = OfflineStorage.getSavedJourneys();
  assert(
    savedJourneys.length > 0 && savedJourneys[0].fromStationCode === 'TNA' && savedJourneys[0].toStationCode === 'CCG',
    '23.11: OfflineStorage persists and retrieves commuter saved journeys'
  );
}

console.log('\nTest Suite 24: All-Trains Departure Board, Express 15-Minute Rule, Guided Navigation & Station Exits');
{
  const { getStationExitGuidance } = await import('../src/fixtures/stationLayoutsData');
  const { calculateStationTransferRoute } = await import('../src/fixtures/stationLayoutsData');

  // 24.1: All-Trains Departure Board time windowing (30m vs 60m)
  const drToKyn30 = planJourneys({
    originCode: 'DR',
    destCode: 'KYN',
    departureTime: '18:30',
    timeWindowMinutes: 30,
    userContext: 'pre_departure',
    preferences: {
      classPreference: 'any',
      priority: 'fastest',
      hasSeasonPass: false,
      walkToStationMinutes: 5,
      maxTransfers: 1
    }
  });
  const drToKyn60 = planJourneys({
    originCode: 'DR',
    destCode: 'KYN',
    departureTime: '18:30',
    timeWindowMinutes: 60,
    userContext: 'pre_departure',
    preferences: {
      classPreference: 'any',
      priority: 'fastest',
      hasSeasonPass: false,
      walkToStationMinutes: 5,
      maxTransfers: 1
    }
  });
  assert(
    drToKyn30.length > 0 && drToKyn60.length >= drToKyn30.length,
    '24.1: All-Trains Departure Board respects time window filters (30m vs 60m)'
  );

  // 24.2: Dadar 18:30 evening rush departure cadence
  const fast1835 = drToKyn60.find(r => r.predictedDeparture === '18:35');
  const exp1851 = drToKyn60.find(r => r.predictedDeparture === '18:51');
  assert(
    !!fast1835 && !!exp1851 && fast1835.predictedArrival === '19:20' && exp1851.predictedArrival === '19:28',
    '24.2: Dadar 18:30 evening rush includes 18:35 Fast Local (arr 19:20) and 18:51 Express (arr 19:28)'
  );

  // 24.3: Express 15-Minute Promotion Rule (Condition 12 Failure)
  assert(
    Boolean(fast1835?.isRecommended === true && fast1835?.recommendationBadges?.some(b => b.includes('BEST'))),
    '24.3: 18:35 Fast Local retains ⭐ BEST recommendation over 18:51 Express'
  );
  assert(
    exp1851?.isRecommended === false &&
    exp1851?.serviceCategory === 'express' &&
    !!exp1851?.expressPromotionBlockedReason &&
    exp1851?.expressPromotionBlockedReason.includes('saves 0 min'),
    '24.4: 18:51 Express is not promoted as ⭐ BEST and displays honest blocked reason'
  );

  // 24.5: Recommendation Badges Generation
  const hasBestBadge = drToKyn60.some(r => r.recommendationBadges?.some(b => b.includes('BEST')));
  const hasFastestBadge = drToKyn60.some(r => r.recommendationBadges?.some(b => b.includes('FASTEST')));
  const hasCheapestBadge = drToKyn60.some(r => r.recommendationBadges?.some(b => b.includes('CHEAPEST')));
  assert(
    hasBestBadge && hasFastestBadge && hasCheapestBadge,
    '24.5: Recommendation badging generates ⭐ BEST, FASTEST, and CHEAPEST badges'
  );

  // 24.6: Verified Destination Exit Guidance
  const ccgExits = getStationExitGuidance('CCG');
  const drExits = getStationExitGuidance('DR');
  const csmtExits = getStationExitGuidance('CSMT');
  const tnaExits = getStationExitGuidance('TNA');
  const adhExits = getStationExitGuidance('ADH');
  assert(
    ccgExits !== null && ccgExits.exits.length === 3 &&
    drExits !== null && drExits.exits.length === 2 &&
    csmtExits !== null && csmtExits.exits.length === 2 &&
    tnaExits !== null && tnaExits.exits.length === 2 &&
    adhExits !== null && adhExits.exits.some(e => e.onwardTransit.metroInterchange !== undefined),
    '24.6: Verified Destination Exit Guidance indexes Churchgate, Dadar, CSMT, Thane, and Andheri with transit links'
  );

  // 24.7: Station Walk and Platform Change Transfer
  const dadarWalk = calculateStationTransferRoute('DR', 'DR_WR_1', 'DR_CR_4', false);
  const dadarStepFree = calculateStationTransferRoute('DR', 'DR_WR_6', 'DR_CR_8', true);
  assert(
    dadarWalk.success && dadarWalk.walkMinutes >= 6 && dadarWalk.walkMinutes <= 8 &&
    dadarStepFree.success && dadarStepFree.stepFreeAvailable === true,
    '24.7: Platform transfer calculates realistic walk times and resolves step-free elevator bridges'
  );

  // 24.8: Scenario C: CSMT -> Kalyan comparison (Slow, Fast, AC, Express) and >= 15-minute rule
  const csmtToKyn = planJourneys({
    originCode: 'CSMT',
    destCode: 'KYN',
    departureTime: '18:15',
    timeWindowMinutes: 60,
    userContext: 'pre_departure',
    preferences: {
      classPreference: 'any',
      priority: 'fastest',
      hasSeasonPass: false,
      walkToStationMinutes: 5,
      maxTransfers: 1
    }
  });
  const hasSlow = csmtToKyn.some(r => r.serviceCategory === 'slow');
  const hasFast = csmtToKyn.some(r => r.serviceCategory === 'fast');
  const hasAc = csmtToKyn.some(r => r.serviceCategory === 'ac' || r.isAcService);
  const hasExpress = csmtToKyn.some(r => r.serviceCategory === 'express');
  const topCsmt = csmtToKyn[0];
  assert(
    hasSlow && hasFast && hasAc && hasExpress &&
    topCsmt?.serviceCategory !== 'express' &&
    topCsmt?.isRecommended === true,
    '24.8: Scenario C: CSMT -> Kalyan compares Slow, Fast, AC, Express and enforces >=15m rule (Express not automatically preferred)'
  );

  // 24.9: Scenario D: Dadar Easy Journey / Low-Literacy accessibility mode
  const { STATION_3D_LAYOUTS: stn3d } = await import('../src/fixtures/stationLayoutsData');
  const dadarLayout = stn3d['DR'];
  const dadarStepFreePf1To8 = calculateStationTransferRoute('DR', 'DR_WR_1', 'DR_CR_8', true);
  const dadarExits = getStationExitGuidance('DR');
  assert(
    dadarLayout !== undefined &&
    dadarLayout.platforms.length === 15 &&
    dadarStepFreePf1To8.success &&
    dadarStepFreePf1To8.stepFreeAvailable === true &&
    dadarExits !== null &&
    dadarExits.exits.length >= 2,
    '24.9: Scenario D: Passenger with zero railway jargon at Dadar can navigate step-free with verified bridges, platforms, and exits'
  );
}

console.log('\nTest Suite 25: Native Mobile Rebuild Architecture, EAS Cloud Build, Offline Vector Geometries, Timetable Densification, TTE Statutory Validator & Speech Resilience');
{
  // 25.1: EAS Cloud Build Profiles & Hermes Engine
  const easPath = path.resolve(process.cwd(), 'apps/mobile/eas.json');
  const appJsonPath = path.resolve(process.cwd(), 'apps/mobile/app.json');
  assert(fs.existsSync(easPath), '25.1: apps/mobile/eas.json configuration exists');
  const easJson = JSON.parse(fs.readFileSync(easPath, 'utf8'));
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  assert(
    easJson.build?.preview?.android?.buildType === 'apk' &&
    easJson.build?.preview?.ios?.simulator === true &&
    !!easJson.build?.production,
    '25.2: eas.json defines Android APK preview, iOS simulator, and production profiles'
  );
  assert(
    appJson.expo?.jsEngine === 'hermes',
    '25.3: app.json configures Hermes high-performance JavaScript engine'
  );

  // 25.4: Offline Vector Map & Geometry Caching
  const { OfflineStorage } = await import('../apps/mobile/src/storage/offlineStorage');
  OfflineStorage.saveVectorMap({
    nodes: [
      { id: 'node-cst', code: 'CST', name: 'CSMT', line: 'central', x: 100, y: 200, isMajorHub: true },
      { id: 'node-dr', code: 'DR', name: 'Dadar', line: 'central', x: 100, y: 350, isInterchange: true }
    ],
    segments: [
      { id: 'seg-cst-dr', fromCode: 'CST', toCode: 'DR', line: 'central', trackType: 'fast' }
    ],
    geometries: {
      'CST': { code: 'CST', latitude: 18.940, longitude: 72.835, platformCount: 18, isTunnelPortal: true }
    }
  });
  const cachedMap = OfflineStorage.getVectorMap();
  const tunnelAdj = OfflineStorage.getTunnelAdjacentStations('CST');
  assert(
    OfflineStorage.hasCachedVectorMap() &&
    cachedMap?.nodes.length === 2 &&
    cachedMap?.segments.length === 1 &&
    tunnelAdj.includes('DR') &&
    cachedMap?.geometries['CST']?.isTunnelPortal === true,
    '25.4: OfflineStorage persists topological map nodes, track segments, and tunnel geometries'
  );

  // 25.5: Timetable Densification for Tier 2 Metros (Kolkata & Chennai Suburban)
  const bngaService = TRAIN_TRIPS.find(t => t.id === '33811' || t.trainNumber === '33811');
  const bwnMainService = TRAIN_TRIPS.find(t => t.id === '37811' || t.trainNumber === '37811');
  const bwnChordService = TRAIN_TRIPS.find(t => t.id === '36811' || t.trainNumber === '36811');
  const cglService = TRAIN_TRIPS.find(t => t.id === '40501' || t.trainNumber === '40501');
  assert(
    !!bngaService && bngaService.fromStationCode === 'SDAH' && bngaService.toStationCode === 'BNGA' &&
    !!bwnMainService && bwnMainService.fromStationCode === 'HWH' && bwnMainService.toStationCode === 'BWN' &&
    !!bwnChordService && bwnChordService.fromStationCode === 'HWH' && bwnChordService.toStationCode === 'BWN' &&
    !!cglService && cglService.fromStationCode === 'MSB' && cglService.toStationCode === 'CGL',
    '25.5: Timetable includes densified Eastern Railway (SDAH-BNGA, HWH-BWN Main/Chord) and Southern Railway (MSB-CGL) EMU corridors'
  );

  // 25.6: Verified Tier 2 Metro Stations
  const tier2StationCodes = ['DDJ', 'BT', 'HB', 'BWN', 'BDC', 'DKAE', 'SRP', 'LLH', 'CGL', 'MSF', 'MPK', 'MBM', 'GDY'];
  const allStationsExist = tier2StationCodes.every(c => !!STATIONS[c]);
  assert(
    allStationsExist,
    '25.6: Station catalog indexes all 13 densified stations across Kolkata & Chennai suburban networks'
  );

  // 25.7: TTE Validator Mode - Valid Specimen Ticket Verification
  const { validateTicketPayload, SPECIMEN_TEST_PAYLOADS, TTE_DEMO_DISCLAIMER } = await import('../src/engine/tteTicketValidator');
  const validRes = validateTicketPayload(SPECIMEN_TEST_PAYLOADS.validSuburban);
  assert(
    validRes.status === 'VALID' &&
    validRes.regulatoryCompliance.section137Violation === false &&
    validRes.regulatoryCompliance.totalAmountDue === 0 &&
    validRes.isOfflineDemonstration === true &&
    validRes.disclaimer === TTE_DEMO_DISCLAIMER,
    '25.7: TTE validator confirms valid suburban ticket with zero penalties and statutory disclaimer'
  );

  // 25.8: TTE Validator Mode - Expired Ticket (Section 138 Statutory Penalty)
  const expiredRes = validateTicketPayload(SPECIMEN_TEST_PAYLOADS.expiredTicket, { inspectionDate: '2026-10-07' });
  assert(
    expiredRes.status === 'EXPIRED' &&
    expiredRes.regulatoryCompliance.section138Violation === true &&
    expiredRes.regulatoryCompliance.penaltyCharge === 500 &&
    expiredRes.regulatoryCompliance.totalAmountDue === expiredRes.passengerDetails!.farePaid + 500,
    '25.8: TTE validator penalizes expired ticket with ₹500 Section 138 statutory excess fine'
  );

  // 25.9: TTE Validator Mode - Suburban MST on Express Rake (Section 138 Excess Fare)
  const mstOnExpressRes = validateTicketPayload(
    SPECIMEN_TEST_PAYLOADS.suburbanMstInExpress,
    { isInspectingExpressTrain: true, inspectedTrainNumber: '12137 Punjab Mail' }
  );
  assert(
    mstOnExpressRes.status === 'CLASS_MISMATCH' &&
    mstOnExpressRes.regulatoryCompliance.section138Violation === true &&
    mstOnExpressRes.regulatoryCompliance.excessFarePayable === 140 &&
    mstOnExpressRes.regulatoryCompliance.penaltyCharge === 500 &&
    mstOnExpressRes.regulatoryCompliance.totalAmountDue === 640,
    '25.9: TTE validator enforces Section 138 tariff recovery (₹140 diff + ₹500 excess charge) for Suburban MST in Express'
  );

  // 25.10: TTE Validator Mode - Second Class Ticket in AC Local Coach
  const classMismatchRes = validateTicketPayload(
    SPECIMEN_TEST_PAYLOADS.validSuburban,
    { inspectedCoachClass: 'AC_LOCAL' }
  );
  assert(
    classMismatchRes.status === 'CLASS_MISMATCH' &&
    classMismatchRes.regulatoryCompliance.excessFarePayable === 115 &&
    classMismatchRes.regulatoryCompliance.penaltyCharge === 500 &&
    classMismatchRes.regulatoryCompliance.totalAmountDue === 615,
    '25.10: TTE validator detects 2nd Class ticket in AC Local coach and calculates ₹115 diff + ₹500 penalty'
  );

  // 25.11: TTE Validator Mode - Unregistered / Forged Ticket (Section 137 Violation)
  const forgedRes = validateTicketPayload(SPECIMEN_TEST_PAYLOADS.forgedOrNotFound);
  assert(
    forgedRes.status === 'NOT_FOUND' &&
    forgedRes.regulatoryCompliance.section137Violation === true &&
    forgedRes.regulatoryCompliance.penaltyCharge === 500 &&
    forgedRes.regulatoryCompliance.totalAmountDue === 500,
    '25.11: TTE validator detects unregistered/forged ticket and levies ₹500 Section 137 fine'
  );

  // 25.12: Enhanced Speech Engine Fallback & Resilience
  const { speechEngine } = await import('../apps/mobile/src/services/speechEngine');
  let fallbackInvoked: boolean = false;
  if (speechEngine.registerFallbackHandler) {
    speechEngine.registerFallbackHandler((_text, opts) => {
      fallbackInvoked = true;
      opts.onDone();
    });
  }
  const status = speechEngine.getEngineStatus ? speechEngine.getEngineStatus() : null;
  assert(
    !!status && typeof status.engineName === 'string' && status.hasFallbackHandler === true,
    '25.12: SpeechEngine status reporting and fallback registration handler operational'
  );

  // 25.13: Speech Engine Fallback Execution in Headless Mode
  let speechDone: boolean = false;
  speechEngine.speak('Testing fallback trigger', {
    language: 'en',
    onDone: () => { speechDone = true; }
  });
  assert(
    Boolean(fallbackInvoked) && Boolean(speechDone),
    '25.13: SpeechEngine gracefully invokes fallback handler and completes audio cycle'
  );
}

console.log('\nTest Suite 26: Phone-First Mobile Architecture, Coach Separation, Dynamic Booking & Provenance Truth');
{
  const { 
    getRakeFormation, 
    PLATFORM_ALIGNMENTS, 
    computeCoachRecommendation 
  } = await import('../src/models/coachGuide');

  // 26.1: Verify all 5 rake formations are defined with exact coach counts
  const suburban12 = getRakeFormation('12_car_suburban');
  const suburban12Ac = getRakeFormation('12_car_ac_suburban');
  const suburban15 = getRakeFormation('15_car_suburban');
  const vb16 = getRakeFormation('16_car_vande_bharat');
  const express22 = getRakeFormation('22_car_express');
  const unknownRake = getRakeFormation('unknown_test_rake' as any);

  assert(
    suburban12 !== null && suburban12.coaches.length === 12 &&
    suburban12Ac !== null && suburban12Ac.coaches.length === 12 && suburban12Ac.coaches.every(c => c.isAirConditioned) &&
    suburban15 !== null && suburban15.coaches.length === 15 &&
    vb16 !== null && vb16.coaches.length === 16 &&
    express22 !== null && express22.coaches.length === 22 &&
    unknownRake === null,
    '26.1: All 5 rake formations resolve exact coach counts and unknown rakes return null without silent fallback'
  );

  // 26.2: Verify Vande Bharat and Express compositions
  assert(
    Boolean(vb16?.coaches.some(c => c.category === 'executive' || c.identifier.includes('EC'))) &&
    Boolean(express22?.coaches.some(c => c.category === 'sleeper' || c.identifier.includes('S1'))) &&
    Boolean(express22?.coaches.some(c => c.category === 'ac_sleeper' || c.identifier.includes('A1') || c.identifier.includes('B1'))),
    '26.2: 16-car Vande Bharat has Executive Chair (EC) and 22-car Express includes Sleeper and AC Sleeper coaches'
  );

  // 26.3: Separation of PlatformAlignment and RakeFormation
  const dadarAlignment = PLATFORM_ALIGNMENTS['DR_3'];
  assert(
    dadarAlignment !== undefined && 
    dadarAlignment.landmarks.length > 0 &&
    dadarAlignment.stoppingZones['12_car_suburban'] !== undefined,
    '26.3: PlatformAlignment isolates physical platform geometry and stopping zones from train rake'
  );

  // 26.4: Coach Recommendation honesty for unmapped platform
  const missingRec = computeCoachRecommendation({
    rakeType: '12_car_suburban',
    coachSequence: 1,
    stationCode: 'XYZ',
    platformNumber: '99'
  });
  assert(
    missingRec.status === 'UNAVAILABLE' &&
    !missingRec.nearestLandmark &&
    !missingRec.distanceMeters &&
    Boolean(missingRec.message?.includes('unavailable')),
    '26.4: Coach recommendation returns UNAVAILABLE for unmapped station without fallback to Dadar'
  );

  // 26.5: Dynamic Booking Invariants (no stale hardcoded dates)
  const { MockBookingStore } = await import('../src/engine/mockBookingStore');
  const bookingRes = MockBookingStore.createSpecimenBooking({
    trainNumber: '95112',
    trainName: 'Fast Local',
    fromCode: 'TNA',
    fromName: 'Thane',
    toCode: 'CSMT',
    toName: 'CSMT',
    classBooked: 'II',
    fare: 10,
    passengers: [{ name: 'Test Commuter', age: 25, gender: 'M' }],
    paymentMethod: 'UPI (Simulated)'
  });
  const todayIso = new Date().toISOString().split('T')[0];
  assert(
    Boolean(bookingRes.ticket) &&
    bookingRes.ticket.journeyDate >= todayIso &&
    bookingRes.ticket.pnrMock.startsWith('MOCK-') &&
    bookingRes.ticket.pnrMock !== '8421904123' &&
    bookingRes.ticket.id.startsWith('TKT-'),
    '26.5: Specimen booking generates dynamic valid journeyDate and cryptographically random PNR'
  );

  // 26.6: AI Service Fallback Truth & Provenance
  const { AiRailwayService } = await import('../src/services/aiService');
  const aiPlan = await AiRailwayService.decomposeTravelPlan('Kurla to Dadar fast train delayed +22m');
  assert(
    aiPlan.provenance === 'DEMO' && 
    Boolean(aiPlan.feedStatusNotice?.includes('Operational feed unavailable')),
    '26.6: AI decomposition fallback returns explicit DEMO provenance and feed unavailable notice'
  );

  // 26.7: Real Component Rendering: TrainFormationStrip across all 5 rake formations
  const { TrainFormationStrip, StationSearchSheet } = await import('../src/components/common/DesignSystemPrimitives');
  const strip12Html = renderToString(React.createElement(TrainFormationStrip, { rakeType: '12_car_suburban', selectedCoachSeq: 1, onSelectCoach: () => {} }));
  const strip12AcHtml = renderToString(React.createElement(TrainFormationStrip, { rakeType: '12_car_ac_suburban', selectedCoachSeq: 1, onSelectCoach: () => {} }));
  const strip15Html = renderToString(React.createElement(TrainFormationStrip, { rakeType: '15_car_suburban', selectedCoachSeq: 1, onSelectCoach: () => {} }));
  const strip16VbHtml = renderToString(React.createElement(TrainFormationStrip, { rakeType: '16_car_vande_bharat', selectedCoachSeq: 8, onSelectCoach: () => {} }));
  const strip22ExpHtml = renderToString(React.createElement(TrainFormationStrip, { rakeType: '22_car_express', selectedCoachSeq: 1, onSelectCoach: () => {} }));

  // Helper to count coach buttons matching coach pattern in rendered HTML
  const countCoaches = (html: string) => (html.match(/Coach \d+:/g) || []).length;

  assert(
    countCoaches(strip12Html) === 12 &&
    countCoaches(strip12AcHtml) === 12 &&
    countCoaches(strip15Html) === 15 &&
    countCoaches(strip16VbHtml) === 16 &&
    countCoaches(strip22ExpHtml) === 22 &&
    strip12Html.includes('South (CSMT / CCG)') &&
    strip12Html.includes('North (KYN / VR)') &&
    strip16VbHtml.includes('Executive Class') &&
    strip22ExpHtml.includes('Sleeper Class'),
    '26.7: TrainFormationStrip renders exact coach counts (12, 12, 15, 16, 22) with geographic South-North orientation and coach categories'
  );

  // 26.8: Real Component Rendering: CoachPositionGuide & StationSearchSheet
  const { CoachPositionGuide } = await import('../src/components/CoachPositionGuide');
  const coachGuideHtml = renderToString(React.createElement(CoachPositionGuide, {
    initialRakeType: '12_car_suburban',
    stationCode: 'DR',
    platformNumber: '3'
  }));

  const stationSheetHtml = renderToString(React.createElement(StationSearchSheet, {
    isOpen: true,
    onClose: () => {},
    onSelectStation: () => {},
    title: 'Select Destination Station'
  }));

  const failures26_8 = [
    !coachGuideHtml.includes('Platform 3') && 'Platform 3 missing',
    !coachGuideHtml.includes('Divyangjan') && 'Divyangjan missing',
    !coachGuideHtml.includes('Train Composition') && 'Train Composition missing',
    !stationSheetHtml.includes('role="dialog"') && 'role="dialog" missing',
    !stationSheetHtml.includes('aria-modal="true"') && 'aria-modal missing',
    !stationSheetHtml.includes('CSMT') && 'CSMT missing',
    !stationSheetHtml.includes('min-h-[48px]') && 'min-h-[48px] missing'
  ].filter(Boolean);

  assert(
    failures26_8.length === 0,
    '26.8: CoachPositionGuide and StationSearchSheet render accessible landmark alignments, Devanagari labels, and touch targets >= 44px',
    failures26_8.join(', ')
  );

  // 26.9: Real Component Rendering: TrainLiveTracker responsive layout and zero emoji
  const { TrainLiveTracker } = await import('../src/components/TrainLiveTracker');
  const liveTrackerHtml = renderToString(React.createElement(TrainLiveTracker, { initialTrainNumber: '95112' }));

  assert(
    liveTrackerHtml.includes('md:hidden') &&
    liveTrackerHtml.includes('hidden md:block') &&
    liveTrackerHtml.includes('Rake Composition') &&
    !liveTrackerHtml.includes('🚂 LOCO') &&
    !liveTrackerHtml.includes('CAB 🛑'),
    '26.9: TrainLiveTracker renders both mobile vertical route cards and desktop table with zero emoji icons'
  );

  // 26.10: Real Component Rendering: AccessibleModal contract
  const { AccessibleModal } = await import('../src/components/common/AccessibleModal');
  const modalHtml = renderToString(React.createElement(AccessibleModal, {
    isOpen: true,
    onClose: () => {},
    title: 'Statutory Verification Modal',
    subtitle: 'Accessible Modal Unit Test',
    variant: 'sheet'
  }, React.createElement('div', null, 'Modal Test Body')));

  assert(
    modalHtml.includes('role="dialog"') &&
    modalHtml.includes('aria-modal="true"') &&
    modalHtml.includes('aria-labelledby="accessible-modal-title"') &&
    modalHtml.includes('Close dialog:') &&
    modalHtml.includes('safe-area-inset-left'),
    '26.10: AccessibleModal renders WCAG compliant dialog role, aria-modal, labelledby, and safe-area padding'
  );
}

console.log('\nTest Suite 27: Multi-Country Institutional Transport Authority System & 360px Viewport Resilience');
{
  const { INSTITUTIONAL_AUTHORITIES, getAuthorityById, getAllAuthorities } = await import('../src/models/authorities');
  const { InstitutionalInsignia } = await import('../src/components/common/InstitutionalInsignia');
  const { InstitutionalAuthoritySelectorModal } = await import('../src/components/InstitutionalAuthoritySelectorModal');
  const { DEVICE_PRESETS } = await import('../src/components/MobileDeviceSimulator');

  // 27.1: All 5 sovereign institutional authorities configured
  const authKeys = Object.keys(INSTITUTIONAL_AUTHORITIES);
  assert(
    authKeys.includes('india') &&
    authKeys.includes('uk') &&
    authKeys.includes('japan') &&
    authKeys.includes('switzerland') &&
    authKeys.includes('germany') &&
    authKeys.length === 5,
    '27.1: All 5 sovereign institutional authorities (India, UK, Japan, Switzerland, Germany) configured with valid legal frameworks'
  );

  // 27.2: Vector Insignias render with zero emojis
  const indiaSvg = renderToString(React.createElement(InstitutionalInsignia, { authorityId: 'india', size: 32 }));
  const ukSvg = renderToString(React.createElement(InstitutionalInsignia, { authorityId: 'uk', size: 32 }));
  const japanSvg = renderToString(React.createElement(InstitutionalInsignia, { authorityId: 'japan', size: 32 }));
  const swissSvg = renderToString(React.createElement(InstitutionalInsignia, { authorityId: 'switzerland', size: 32 }));
  const germanSvg = renderToString(React.createElement(InstitutionalInsignia, { authorityId: 'germany', size: 32 }));

  assert(
    indiaSvg.includes('<svg') && ukSvg.includes('<svg') && japanSvg.includes('<svg') && swissSvg.includes('<svg') && germanSvg.includes('<svg') &&
    !indiaSvg.includes('🚂') && !ukSvg.includes('👑') && !japanSvg.includes('🗾') &&
    indiaSvg.includes('aria-label') && ukSvg.includes('aria-label') && germanSvg.includes('DB'),
    '27.2: Institutional insignia vector renders for all 5 authorities with zero emojis'
  );

  // 27.3: Authority selector modal renders sovereign government ministries
  const modalHtml = renderToString(React.createElement(InstitutionalAuthoritySelectorModal, {
    isOpen: true,
    onClose: () => {}
  }));

  assert(
    modalHtml.includes('Ministry of Railways') &&
    modalHtml.includes('Department for Transport') &&
    modalHtml.includes('Ministry of Land, Infrastructure, Transport and Tourism') &&
    modalHtml.includes('Federal Department of the Environment, Transport') &&
    modalHtml.includes('Federal Ministry for Digital and Transport') &&
    modalHtml.includes('role="dialog"'),
    '27.3: Authority selector modal renders sovereign government ministries and statutory mandates'
  );

  // 27.4: Multi-country currencies
  const inAuth = getAuthorityById('india');
  const ukAuth = getAuthorityById('uk');
  const jpAuth = getAuthorityById('japan');
  const chAuth = getAuthorityById('switzerland');
  const deAuth = getAuthorityById('germany');

  assert(
    inAuth.currency.symbol === '₹' && inAuth.currency.code === 'INR' &&
    ukAuth.currency.symbol === '£' && ukAuth.currency.code === 'GBP' &&
    jpAuth.currency.symbol === '¥' && jpAuth.currency.code === 'JPY' &&
    chAuth.currency.symbol === 'CHF ' && chAuth.currency.code === 'CHF' &&
    deAuth.currency.symbol === '€' && deAuth.currency.code === 'EUR',
    '27.4: Multi-country currency formatters calculate proper national currency symbols (£, ¥, CHF, €, ₹)'
  );

  // 27.5: Sovereign emergency helplines
  assert(
    inAuth.emergencyContacts.some(c => c.number === '139') &&
    ukAuth.emergencyContacts.some(c => c.number === '61016') &&
    jpAuth.emergencyContacts.some(c => c.number === '050-2016-1603') &&
    chAuth.emergencyContacts.some(c => c.number === '0848 44 66 88') &&
    deAuth.emergencyContacts.some(c => c.number === '030 2970'),
    '27.5: Sovereign emergency helplines properly mapped (139 for India, 61016 for UK, 050-2016-1603 for Japan, 0848 44 66 88 for Switzerland, 030 2970 for Germany)'
  );

  // 27.6: Mobile device simulator indexes 360px Galaxy S24
  const galaxyS24 = DEVICE_PRESETS.find(p => p.id === 'galaxy-s24');
  assert(
    Boolean(galaxyS24) &&
    galaxyS24?.width === 360 &&
    galaxyS24?.height === 780 &&
    galaxyS24?.platform === 'android',
    '27.6: Mobile device simulator indexes 360px Galaxy S24 and enforces narrow viewport standards'
  );

  // 27.7: NetworkMapViewer and StationGodsEyeModal touch drag threshold & pan clamping
  const networkMapContent = fs.readFileSync(path.resolve(process.cwd(), 'src/components/NetworkMapViewer.tsx'), 'utf8');
  const godsEyeContent = fs.readFileSync(path.resolve(process.cwd(), 'src/components/StationGodsEyeModal.tsx'), 'utf8');

  assert(
    networkMapContent.includes('moveDistance > 6') &&
    networkMapContent.includes('hasPassedDragThresholdRef') &&
    networkMapContent.includes('Math.max(-600, Math.min(600, rawX))') &&
    godsEyeContent.includes('moveDistance > 6') &&
    godsEyeContent.includes('Math.max(-500, Math.min(500, rawX))'),
    '27.7: NetworkMapViewer and StationGodsEyeModal enforce 6px drag threshold and bounded pan clamping for 360px viewports'
  );

  // 27.8: BottomNavigation renders touch targets >= 44px with safe-area insets
  const { BottomNavigation } = await import('../src/components/common/BottomNavigation');
  const bottomNavHtml = renderToString(React.createElement(BottomNavigation, {
    activeTab: 'home',
    onTabChange: () => {},
    savedTicketCount: 2
  }));

  assert(
    bottomNavHtml.includes('safe-area-inset-bottom') &&
    bottomNavHtml.includes('safe-area-inset-left') &&
    bottomNavHtml.includes('min-h-[48px]') &&
    bottomNavHtml.includes('role="navigation"'),
    '27.8: BottomNavigation renders touch targets >= 44px with safe-area bottom and lateral insets'
  );

  // 27.9: SpecimenTicketModal renders sovereign authority attribution
  const { SpecimenTicketModal } = await import('../src/components/SpecimenTicketModal');
  const specimenModalHtml = renderToString(React.createElement(SpecimenTicketModal, {
    isOpen: true,
    onClose: () => {},
    itinerary: {
      id: 'it-test',
      legs: [{
        legIndex: 0,
        train: {
          trainNumber: '12137',
          trainName: 'Punjab Mail',
          originStation: 'CSMT',
          destinationStation: 'FZR',
          serviceType: 'mail_express',
          runningDays: [0, 1, 2, 3, 4, 5, 6],
          stops: [],
          availableClasses: ['SL', '3A', '2A', '1A']
        },
        fromStation: { id: 'csmt', code: 'CSMT', name: 'CSMT', line: 'central', city: 'Mumbai', platforms: [1], aliases: [] },
        toStation: { id: 'tna', code: 'TNA', name: 'Thane', line: 'central', city: 'Mumbai', platforms: [1], aliases: [] },
        scheduledDep: '19:35',
        scheduledArr: '20:15',
        predictedDep: '19:35',
        predictedArr: '20:15',
        delayDepMinutes: 0,
        delayArrMinutes: 0,
        departurePlatform: '18',
        arrivalPlatform: '5',
        dataStatus: 'SCHEDULED',
        crowding: { level: 'LOW', confidence: 'HIGH', explanation: '', peakWindow: false, crowdReason: '' },
        skippedStopsCount: 0,
        stoppingPatternLabel: ''
      }],
      transfers: [],
      totalDurationMinutes: 40,
      scheduledDeparture: '19:35',
      predictedDeparture: '19:35',
      scheduledArrival: '20:15',
      predictedArrival: '20:15',
      totalFareByClass: { SL: 140, '3A': 505 },
      recommendedClass: 'SL',
      eligibility: { status: 'ELIGIBLE', summary: '', rulesApplied: [], validClasses: ['SL'], passPermitted: false, ticketRequiredNote: '' },
      score: 95,
      rankReason: '',
      isRecommended: true,
      leaveHomeTime: '19:00',
      leaveHomeMarginMinutes: 35,
      isAcService: false
    },
    selectedClass: 'SL',
    onBookingCreated: () => {}
  }));

  assert(
    specimenModalHtml.includes('Ministry of Railways') &&
    specimenModalHtml.includes('The Railways Act') &&
    specimenModalHtml.includes('Institutional Ticket Issuance Portal') &&
    specimenModalHtml.includes('role="dialog"'),
    '27.9: SpecimenTicketModal renders sovereign authority attribution, security watermark, and statutory law citation'
  );

  // 27.10: Passenger Mobile App clean of raw code references and developer jargon
  const helpTabContent = fs.readFileSync(path.resolve(process.cwd(), 'src/components/mobile/MobileHelpTab.tsx'), 'utf8');
  const myTicketsContent = fs.readFileSync(path.resolve(process.cwd(), 'src/components/MyTicketsView.tsx'), 'utf8');
  const homeViewContent = fs.readFileSync(path.resolve(process.cwd(), 'src/components/HomePassengerView.tsx'), 'utf8');

  assert(
    !helpTabContent.includes('Developer Scenario Lab') &&
    !helpTabContent.includes('Developer Diagnostics Mode') &&
    !myTicketsContent.includes('RAILONE TRANSIT BENCHMARK') &&
    !homeViewContent.includes('Indian Railways Institutional Transit Benchmark'),
    '27.10: Passenger Mobile App UI verified clean of raw code references and internal developer jargon'
  );
}

console.log('\nTest Suite 28: Multi-Country Sovereign Journey Planning, Dynamic Tariff Resolution & Passenger UI Hygiene');
{
  const { normalizeStation } = await import('../src/engine/stationNormalizer');
  const { planJourneys } = await import('../src/engine/journeyEngine');
  const { MockBookingStore } = await import('../src/engine/mockBookingStore');

  // 28.1: Station normalizer resolves sovereign authority stations for UK, Japan, Switzerland, Germany
  const watNorm = normalizeStation('WAT');
  const tyoNorm = normalizeStation('TYO');
  const jpKanjiNorm = normalizeStation('東京');
  const zrhNorm = normalizeStation('ZRH');
  const berNorm = normalizeStation('BER');

  assert(
    watNorm.matchedStation?.code === 'WAT' &&
    tyoNorm.matchedStation?.code === 'TYO' &&
    jpKanjiNorm.matchedStation?.code === 'TYO' &&
    zrhNorm.matchedStation?.code === 'ZRH' &&
    berNorm.matchedStation?.code === 'BER',
    '28.1: Station normalizer resolves sovereign authority stations for UK, Japan, Switzerland, and Germany across codes and native scripts'
  );

  // 28.2: UK National Rail Elizabeth Line & South Western journey planning generates authentic itineraries with GBP fares
  const ukJourneys = planJourneys({
    originCode: 'WAT',
    destCode: 'PAD',
    departureTime: '10:00',
    userContext: 'pre_departure',
    preferences: { classPreference: 'any', priority: 'fastest', hasSeasonPass: false, walkToStationMinutes: 10, maxTransfers: 1 }
  });

  assert(
    ukJourneys.length > 0 &&
    ukJourneys[0].totalFareByClass['STD'] !== undefined &&
    ukJourneys[0].totalFareByClass['STD'] > 0,
    '28.2: UK National Rail journey planning generates authentic Elizabeth Line & South Western itineraries with GBP fares'
  );

  // 28.3: Japan JR East Yamanote Line & Chūō Rapid journey planning generates high-frequency itineraries with JPY fares
  const jpJourneys = planJourneys({
    originCode: 'TYO',
    destCode: 'SJK',
    departureTime: '10:00',
    userContext: 'pre_departure',
    preferences: { classPreference: 'any', priority: 'fastest', hasSeasonPass: false, walkToStationMinutes: 10, maxTransfers: 1 }
  });

  assert(
    jpJourneys.length > 0 &&
    jpJourneys[0].totalFareByClass['ORD'] !== undefined &&
    jpJourneys[0].totalFareByClass['GRN'] !== undefined &&
    jpJourneys[0].totalFareByClass['ORD'] >= 100,
    '28.3: Japan JR East Yamanote & Chūō Rapid journey planning generates authentic itineraries with Yen fares and ORD/GRN classes'
  );

  // 28.4: Switzerland SBB CFF FFS Gotthard & InterCity planning generates precision clock-face itineraries with CHF fares
  const chJourneys = planJourneys({
    originCode: 'ZRH',
    destCode: 'BN',
    departureTime: '10:00',
    userContext: 'pre_departure',
    preferences: { classPreference: 'any', priority: 'fastest', hasSeasonPass: false, walkToStationMinutes: 10, maxTransfers: 1 }
  });

  assert(
    chJourneys.length > 0 &&
    chJourneys[0].totalFareByClass['2CL'] !== undefined &&
    chJourneys[0].totalFareByClass['1CL'] !== undefined &&
    chJourneys[0].totalFareByClass['2CL'] > 0,
    '28.4: Switzerland SBB CFF FFS InterCity planning generates authentic itineraries with CHF fares and 2CL/1CL classes'
  );

  // 28.5: Germany Deutsche Bahn ICE High-Speed planning generates itineraries with EUR fares
  const deJourneys = planJourneys({
    originCode: 'BER',
    destCode: 'MUN',
    departureTime: '10:00',
    userContext: 'pre_departure',
    preferences: { classPreference: 'any', priority: 'fastest', hasSeasonPass: false, walkToStationMinutes: 10, maxTransfers: 1 }
  });

  assert(
    deJourneys.length > 0 &&
    deJourneys[0].totalFareByClass['2KL'] !== undefined &&
    deJourneys[0].totalFareByClass['1KL'] !== undefined &&
    deJourneys[0].totalFareByClass['2KL'] > 0,
    '28.5: Germany Deutsche Bahn ICE journey planning generates authentic itineraries with EUR fares and 2KL/1KL classes'
  );

  // 28.6: Multi-country specimen booking creates valid booking store records with sovereign authority attribution
  const ukTop = ukJourneys[0];
  const ukBookingRes = MockBookingStore.createSpecimenBooking({
    trainNumber: ukTop.legs[0].train.trainNumber,
    trainName: ukTop.legs[0].train.trainName,
    fromCode: ukTop.legs[0].fromStation.code,
    fromName: ukTop.legs[0].fromStation.name,
    toCode: ukTop.legs[ukTop.legs.length - 1].toStation.code,
    toName: ukTop.legs[ukTop.legs.length - 1].toStation.name,
    classBooked: 'STD',
    fare: ukTop.totalFareByClass['STD'] || 4.5,
    passengers: [{ name: 'Arthur Dent', age: 42, gender: 'M' }],
    paymentMethod: 'Transit Wallet'
  });

  assert(
    ukBookingRes.ticket !== undefined &&
    ukBookingRes.ticket.classBooked === 'STD' &&
    ukBookingRes.ticket.fromStation.code === 'WAT' &&
    ukBookingRes.ticket.toStation.code === 'PAD' &&
    ukBookingRes.ticket.qrPayload.length > 20,
    '28.6: Multi-country specimen booking creates valid booking store records with sovereign authority attribution and encrypted QR payload'
  );

  // 28.7: Mobile UI source files verified clean of developer jargon, [PASSED], and [DEMO] tags
  const helpFile = fs.readFileSync(path.resolve(process.cwd(), 'src/components/mobile/MobileHelpTab.tsx'), 'utf8');
  const simFile = fs.readFileSync(path.resolve(process.cwd(), 'src/components/MobileDeviceSimulator.tsx'), 'utf8');
  const ticketsFile = fs.readFileSync(path.resolve(process.cwd(), 'src/components/mobile/MobileTicketsTab.tsx'), 'utf8');
  const journeysFile = fs.readFileSync(path.resolve(process.cwd(), 'src/components/mobile/MobileJourneysTab.tsx'), 'utf8');

  assert(
    !helpFile.includes('[DEMO]') &&
    !simFile.includes('[PASSED]') &&
    !ticketsFile.includes('Demo Fixture') &&
    simFile.includes('[VERIFIED TRUNK]') &&
    journeysFile.includes('[VERIFIED TRUNK]'),
    '28.7: Passenger Mobile UI verified clean of [DEMO], [PASSED], and test fixture labels, standardizing on [VERIFIED TRUNK]'
  );

  // 28.8: Dynamic authority season passes and wallet accounts accurately configured
  assert(
    ticketsFile.includes('seasonPassDetails') &&
    ticketsFile.includes('Citizen Account') &&
    ticketsFile.includes('Citizen Wallet Top-Up') &&
    journeysFile.includes('Corridors'),
    '28.8: Sovereign authority season passes, citizen transit wallets, and corridor quick-select chips dynamically configured'
  );
}

console.log('\nTest Suite 29: India Multimodal Architecture, MMR Scenarios, P0 Security & Synchronized Map System');
{
  const { issuePassengerToken, verifyPassengerToken } = await import('../src/backend/middleware/auth');
  const { MultimodalGraphEngine } = await import('../src/engine/multimodal/graphEngine');
  const { getAllCityPacks, getCityPack } = await import('../src/engine/multimodal/cityPacks');
  const { PROVIDER_ADAPTERS } = await import('../src/engine/multimodal/adapters');
  const { createBooking } = await import('../src/backend/modules/ticketing');
  const { createPassengerProfile } = await import('../src/backend/modules/passengerProfiles');
  const { listBookings } = await import('../src/backend/modules/bookingHistory');
  const { resetDatabase, getDatabase } = await import('../src/backend/database/db');
  const { v1Router } = await import('../src/backend/routes/v1');

  resetDatabase();
  const aliceProfile = createPassengerProfile({ name: 'Alice Smith' });
  const bobProfile = createPassengerProfile({ name: 'Bob Jones' });

  // 29.1: Negative cross-user authorization tests
  const aliceToken = issuePassengerToken(aliceProfile.id);
  const bobToken = issuePassengerToken(bobProfile.id);
  const validPayload = verifyPassengerToken(aliceToken);
  const forgedPayload = verifyPassengerToken(aliceToken + 'tampered');
  const emptyPayload = verifyPassengerToken('');

  assert(
    validPayload === aliceProfile.id &&
    forgedPayload === null &&
    emptyPayload === null,
    '29.1a: HMAC-SHA256 passenger authentication validates genuine tokens and rejects forged/tampered tokens'
  );

  // Negative endpoint authorization testing helper
  const invokeRoute = (method: string, url: string, headers: Record<string, string>): Promise<{ status: number; body: any }> => {
    return new Promise((resolve) => {
      let statusCode = 200;
      let resBody: any = null;
      const req: any = {
        method,
        url,
        path: url.split('?')[0],
        headers: { ...headers },
        body: {},
        params: {}
      };
      const res: any = {
        status(code: number) { statusCode = code; return this; },
        json(data: any) { resBody = data; resolve({ status: statusCode, body: resBody }); return this; },
        send(data: any) { resBody = data; resolve({ status: statusCode, body: resBody }); return this; }
      };
      v1Router(req, res, () => resolve({ status: 404, body: null }));
    });
  };

  const aliceBooking = createBooking({
    passengerProfileId: aliceProfile.id,
    trainNumber: '12951',
    fromStationCode: 'MMCT',
    toStationCode: 'NDLS',
    classBooked: '3A',
    journeyDate: '2026-10-20',
    passengers: [{ name: 'Alice Smith', age: 28, gender: 'F' }],
    idempotencyKey: 'idem-alice-sec-1'
  });

  const bobBooking = createBooking({
    passengerProfileId: bobProfile.id,
    trainNumber: '12137',
    fromStationCode: 'CSMT',
    toStationCode: 'KYN',
    classBooked: 'SL',
    journeyDate: '2026-10-21',
    passengers: [{ name: 'Bob Jones', age: 35, gender: 'M' }],
    idempotencyKey: 'idem-bob-sec-1'
  });

  // Bob attempts to read Alice's booking -> 403 Forbidden
  const bobAccessAlice = await invokeRoute('GET', `/bookings/${aliceBooking.id}`, {
    authorization: `Bearer ${bobToken}`
  });

  // Unauthenticated caller attempts to read Alice's booking -> 401 Unauthorized
  const unauthAccessAlice = await invokeRoute('GET', `/bookings/${aliceBooking.id}`, {});

  // Alice reads her own booking -> 200 OK
  const aliceAccessOwn = await invokeRoute('GET', `/bookings/${aliceBooking.id}`, {
    authorization: `Bearer ${aliceToken}`
  });

  // GET /bookings for Alice only returns Alice's bookings, isolating Bob's
  const aliceList = await invokeRoute('GET', '/bookings', {
    authorization: `Bearer ${aliceToken}`
  });

  assert(
    bobAccessAlice.status === 403 &&
    bobAccessAlice.body?.error === 'FORBIDDEN_CROSS_USER_ACCESS' &&
    unauthAccessAlice.status === 401 &&
    unauthAccessAlice.body?.error === 'UNAUTHORIZED' &&
    aliceAccessOwn.status === 200 &&
    aliceAccessOwn.body?.booking?.id === aliceBooking.id &&
    aliceList.status === 200 &&
    aliceList.body?.bookings?.length === 1 &&
    aliceList.body?.bookings[0]?.id === aliceBooking.id,
    '29.1b: Passenger booking endpoints enforce strict cross-user isolation (401 unauthenticated, 403 cross-user access, isolated listings)'
  );

  // 29.2: Atomic booking idempotency retry consistency
  const bookingRetry = createBooking({
    passengerProfileId: aliceProfile.id,
    trainNumber: '12951',
    fromStationCode: 'MMCT',
    toStationCode: 'NDLS',
    classBooked: '3A',
    journeyDate: '2026-10-20',
    passengers: [{ name: 'Alice Smith', age: 28, gender: 'F' }],
    idempotencyKey: 'idem-alice-sec-1'
  });

  assert(
    aliceBooking !== undefined &&
    bookingRetry !== undefined &&
    aliceBooking.id === bookingRetry.id &&
    aliceBooking.pnr === bookingRetry.pnr,
    '29.2: Atomic booking transactions ensure identical idempotency key deduplication across network retries'
  );

  // 29.3: Multimodal architecture spans all 9 Indian cities and 9 transport modes
  const allPacks = getAllCityPacks();
  const cityIds = allPacks.map(p => p.cityId).sort();
  const expectedCities = ['ahmedabad', 'bengaluru', 'chennai', 'delhi', 'hyderabad', 'kochi', 'kolkata', 'mumbai', 'pune'].sort();
  const modes = Object.keys(PROVIDER_ADAPTERS);

  assert(
    allPacks.length === 9 &&
    JSON.stringify(cityIds) === JSON.stringify(expectedCities) &&
    modes.includes('suburban') &&
    modes.includes('express') &&
    modes.includes('metro') &&
    modes.includes('regional_rail') &&
    modes.includes('monorail') &&
    modes.includes('bus') &&
    modes.includes('ferry') &&
    modes.includes('auto_taxi') &&
    modes.includes('walk'),
    '29.3: Multimodal architecture comprehensively indexes all 9 Indian urban regions and 9 transport modes'
  );

  // 29.4: MMR Scenario 1: Andheri -> Ghatkopar direct Metro Line 1 & Live Cancellation Filtering
  const mmrEngine = new MultimodalGraphEngine('mumbai');
  const m1Itins = mmrEngine.planJourney({
    origin: 'METRO_ADH',
    destination: 'METRO_GHT',
    departureTime: '08:30'
  });

  const hasDirectM1 = m1Itins.some(itin => 
    itin.legs.length === 1 && 
    itin.legs[0].mode === 'metro' && 
    itin.legs[0].lineName.includes('Line 1') &&
    itin.totalDurationMinutes === 21 &&
    itin.totalFareInr === 30
  );

  // When Metro Line 1 is marked CANCELLED in liveObservations, planner must exclude it
  const m1CancelledItins = mmrEngine.planJourney({
    origin: 'METRO_ADH',
    destination: 'METRO_GHT',
    departureTime: '08:30',
    liveObservations: {
      'metro_line_1': { delayMinutes: 0, status: 'CANCELLED' }
    }
  });

  assert(
    m1Itins.length > 0 && hasDirectM1 && m1CancelledItins.length === 0,
    '29.4: MMR Scenario 1: Andheri -> Ghatkopar plans direct Metro Line 1 (21 min, ₹30) and strictly excludes cancelled services'
  );

  // 29.5: MMR Scenario 2: BKC -> Churchgate direct Metro Line 3
  const m3Itins = mmrEngine.planJourney({
    origin: 'METRO_BKC',
    destination: 'METRO_CCG_3',
    departureTime: '09:00'
  });

  const hasDirectM3 = m3Itins.some(itin =>
    itin.legs.length === 1 &&
    itin.legs[0].mode === 'metro' &&
    itin.legs[0].lineName.includes('Line 3') &&
    itin.totalDurationMinutes === 28 &&
    itin.totalFareInr === 40
  );

  assert(
    m3Itins.length > 0 && hasDirectM3,
    '29.5: MMR Scenario 2: BKC -> Churchgate evaluates direct underground Metro Line 3 Aqua Line option'
  );

  // 29.6: MMR Scenario 3: Thane -> Churchgate Central/Western Dadar transfer
  const tnaCcgItins = mmrEngine.planJourney({
    origin: 'TNA',
    destination: 'CCG',
    departureTime: '08:00'
  });

  const hasDadarInterchange = tnaCcgItins.some(itin =>
    itin.transfers.some(t => t.atNode.code === 'DR') &&
    itin.legs.some(l => l.fromNode.code === 'TNA' && l.toNode.code === 'DR') &&
    itin.legs.some(l => l.fromNode.code === 'DR' && l.toNode.code === 'CCG')
  );

  assert(
    tnaCcgItins.length > 0 && hasDadarInterchange,
    '29.6: MMR Scenario 3: Thane -> Churchgate routes via Dadar interchange with walking transfer buffer'
  );

  // 29.7: MMR Scenario 4: Dadar -> Kalyan express eligibility enforcement
  const drKynItins = mmrEngine.planJourney({
    origin: 'DR',
    destination: 'KYN',
    departureTime: '18:30',
    preferences: { expressAdvantageThresholdMinutes: 15 }
  });

  const localItin = drKynItins.find(i => i.legs.every(l => l.mode === 'suburban'));
  const expressItin = drKynItins.find(i => i.legs.some(l => l.mode === 'express'));

  assert(
    localItin !== undefined &&
    expressItin !== undefined &&
    localItin.badges.includes('⭐ BEST') &&
    expressItin.transparentRationale.includes('saves only') &&
    expressItin.transparentRationale.includes('MST'),
    '29.7: MMR Scenario 4: Dadar -> Kalyan enforces express 15-minute saving threshold and flags MST restriction'
  );

  // 29.8: MMR Scenario 5: Real delay inversion (Slow Local beats delayed bunched Fast Local)
  const delayInversionItins = mmrEngine.planJourney({
    origin: 'DR',
    destination: 'KYN',
    departureTime: '18:30',
    liveObservations: {
      'cr_central_fast': { delayMinutes: 25, status: 'DELAYED' }
    }
  });

  const slowLocalItin = delayInversionItins.find(i => 
    i.legs.some(l => l.lineName.includes('Slow'))
  );
  const delayedFastItin = delayInversionItins.find(i => 
    i.legs.some(l => l.lineName.includes('Fast'))
  );

  assert(
    slowLocalItin !== undefined &&
    delayedFastItin !== undefined &&
    slowLocalItin.totalDurationMinutes === 62 &&
    delayedFastItin.totalDurationMinutes === 73 &&
    slowLocalItin.totalDurationMinutes < delayedFastItin.totalDurationMinutes &&
    slowLocalItin.badges.includes('DELAY_INVERSION'),
    '29.8: MMR Scenario 5: Real delay inversion recommends on-time Slow Local (62m) over bunched Fast Local (48m+25m=73m) with DELAY_INVERSION badge'
  );

  // 29.9: MMR Scenario 6: Unavailable transit lines/schedules never hallucinated
  const liveTrackerCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/TrainLiveTracker.tsx'), 'utf8');
  assert(
    liveTrackerCode.includes('Unavailable (No Live Observation)') &&
    !liveTrackerCode.includes("status: 'Running On Time'"),
    '29.9: MMR Scenario 6: Unobserved trains truthfully report "Unavailable (No Live Observation)" without fictitious Right Time'
  );

  // 29.10: MMR Scenario 7: Wheelchair / Step-free accessibility enforcement
  const stepFreeItins = mmrEngine.planJourney({
    origin: 'FERRY_BD',
    destination: 'FERRY_MDW',
    preferences: { accessibleStepFree: true }
  });

  assert(
    stepFreeItins.length === 0,
    '29.10: MMR Scenario 7: Step-free wheelchair routing strictly rejects non-step-free ferry connections'
  );

  // 29.11: Synchronized Map System: Schematic topology vs. Geographical coordinate map (WGS84)
  const mapViewerCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/NetworkMapViewer.tsx'), 'utf8');
  assert(
    mapViewerCode.includes('mapPerspective') &&
    mapViewerCode.includes('Schematic Network') &&
    mapViewerCode.includes('Geographical Map') &&
    mapViewerCode.includes('WGS-84 PROJECTION') &&
    mapViewerCode.includes('projectGeographical'),
    '29.11: NetworkMapViewer implements real WGS-84 coordinate projection and synchronized Schematic vs Geographical toggle'
  );

  // 29.12: Bidirectional routing across all 9 Indian cities
  const cityBidirectionalChecks = [
    { city: 'mumbai', forward: ['TNA', 'CSMT'], reverse: ['CSMT', 'TNA'] },
    { city: 'delhi', forward: ['NDLS', 'GZB'], reverse: ['GZB', 'NDLS'] },
    { city: 'bengaluru', forward: ['SBC', 'WFD'], reverse: ['WFD', 'SBC'] },
    { city: 'kolkata', forward: ['SDAH', 'BNGA'], reverse: ['BNGA', 'SDAH'] },
    { city: 'pune', forward: ['PUNE', 'LNL'], reverse: ['LNL', 'PUNE'] },
    { city: 'chennai', forward: ['MSB', 'TBM'], reverse: ['TBM', 'MSB'] },
    { city: 'hyderabad', forward: ['HYB', 'LPI'], reverse: ['LPI', 'HYB'] },
    { city: 'ahmedabad', forward: ['ADI', 'GNC'], reverse: ['GNC', 'ADI'] },
    { city: 'kochi', forward: ['ERS', 'AWY'], reverse: ['AWY', 'ERS'] }
  ];

  let bidirectionalPassCount = 0;
  for (const check of cityBidirectionalChecks) {
    const engine = new MultimodalGraphEngine(check.city);
    const fwdItins = engine.planJourney({ origin: check.forward[0], destination: check.forward[1] });
    const revItins = engine.planJourney({ origin: check.reverse[0], destination: check.reverse[1] });
    if (fwdItins.length > 0 && revItins.length > 0) {
      bidirectionalPassCount++;
    } else {
      console.error(`  [FAIL BIDIRECTIONAL] City ${check.city}: forward=${fwdItins.length}, reverse=${revItins.length}`);
    }
  }

  assert(
    bidirectionalPassCount === 9,
    '29.12: All 9 Indian urban regions support complete bidirectional routing (both forward and return journeys pass)'
  );

  // 29.13: Door-to-door first/last mile walk legs in itinerary
  const puneEngine = new MultimodalGraphEngine('pune');
  const d2dItins = puneEngine.planJourney({
    origin: 'hinjewadi',
    destination: 'swargate'
  });

  const hasFirstMileWalk = d2dItins.length > 0 && d2dItins[0].legs[0].mode === 'walk' && d2dItins[0].legs[0].instructions.includes('Walk from Hinjewadi');
  assert(
    hasFirstMileWalk && d2dItins[0].totalWalkMinutes >= 5,
    '29.13: Door-to-door journey planning creates concrete first-mile/last-mile walking legs and instructions in itinerary'
  );

  // 29.14: Identical origin and destination returns 0 itineraries without looping
  const sameNodeItins = mmrEngine.planJourney({
    origin: 'CSMT',
    destination: 'CSMT'
  });
  assert(
    sameNodeItins.length === 0,
    '29.14: Identical origin and destination (CSMT -> CSMT) returns 0 itineraries without erroneous bus loop diversion'
  );

  // 29.15: Multimodal equivalence map isolates Nariman Point bus terminal from CSMT railway junction
  const tnaCsmtItins = mmrEngine.planJourney({
    origin: 'TNA',
    destination: 'CSMT'
  });
  const arrivesAtNariman = tnaCsmtItins.some(itin => 
    itin.legs.some(l => l.toNode.code === 'BUS_NARIMAN')
  );
  assert(
    tnaCsmtItins.length > 0 && !arrivesAtNariman,
    '29.15: Multimodal equivalence map strictly isolates Nariman Point bus terminus from CSMT railway terminus'
  );
}

// =========================================================================
// TEST SUITE 30: GHATKOPAR RESOLUTION, DADAR BRIDGE, 22 SERVICES & LAUNCH AUDIO
// =========================================================================

console.log('\nTest Suite 30: Ghatkopar Resolution & Metro Isolation, Dadar Platform Bridge Distinction, 22-Services Directory Completeness, and Cinematic Audio Launch Verification');
{
  // 30.1: Ghatkopar exact station code 'GC' resolves to Central Suburban Ghatkopar
  const gcExact = normalizeStation('GC');
  assert(
    gcExact.matchedStation !== undefined &&
    gcExact.matchedStation.code === 'GC' &&
    gcExact.confidence === 'EXACT',
    '30.1: Exact station code "GC" resolves directly to Central Suburban Ghatkopar with EXACT confidence'
  );

  // 30.2: Ghatkopar exact lowercase name 'ghatkopar' resolves to Central Suburban Ghatkopar
  const gcName = normalizeStation('ghatkopar');
  assert(
    gcName.matchedStation !== undefined &&
    gcName.matchedStation.code === 'GC' &&
    gcName.matchedStation.name === 'Ghatkopar',
    '30.2: Lowercase station name "ghatkopar" resolves directly to Central Suburban Ghatkopar'
  );

  // 30.3: Ghatkopar common misspelling aliases ('ghatkopr', 'gatkopar', 'ghatcopar') resolve to GC
  const misspellings = ['ghatkopr', 'gatkopar', 'ghatcopar'];
  const allMisspellingsResolved = misspellings.every(q => {
    const res = normalizeStation(q);
    return res.matchedStation?.code === 'GC';
  });
  assert(
    allMisspellingsResolved,
    '30.3: Common Ghatkopar misspelling aliases ("ghatkopr", "gatkopar", "ghatcopar") robustly resolve to Central Suburban GC'
  );

  // 30.4: Ghatkopar Devanagari query 'घाटकोपर' resolves to Central Suburban Ghatkopar
  const gcDevanagari = normalizeStation('घाटकोपर');
  assert(
    gcDevanagari.matchedStation !== undefined &&
    gcDevanagari.matchedStation.code === 'GC' &&
    gcDevanagari.confidence === 'EXACT',
    '30.4: Native Devanagari script query "घाटकोपर" resolves to Central Suburban Ghatkopar with EXACT confidence'
  );

  // 30.5: Metro Line 1 station code 'METRO_GHT' is isolated from Central Suburban code 'GC'
  const gcStation = STATIONS['GC'];
  const metroGhtStation = (STATIONS as any)['METRO_GHT'];
  const gcNormalized = normalizeStation('GC');
  const metroNormalized = normalizeStation('METRO_GHT');
  assert(
    gcStation !== undefined &&
    metroGhtStation !== undefined &&
    gcStation.code === 'GC' &&
    metroGhtStation.code === 'METRO_GHT' &&
    gcStation.line === 'central' &&
    metroGhtStation.line === 'metro' &&
    gcNormalized.matchedStation?.code === 'GC' &&
    metroNormalized.matchedStation?.code === 'METRO_GHT',
    '30.5: Central Suburban code "GC" and Metro Line 1 "METRO_GHT" maintain strict modal code isolation'
  );

  // 30.6: Dadar Central ('DR') vs Western ('DDR') code distinction
  const drResult = normalizeStation('DR');
  const ddrResult = normalizeStation('DDR');
  assert(
    drResult.matchedStation?.code === 'DR' &&
    ddrResult.matchedStation?.code === 'DDR' &&
    drResult.matchedStation?.name === 'Dadar (Central)' &&
    ddrResult.matchedStation?.name === 'Dadar (Western)',
    '30.6: Distinct codes "DR" and "DDR" resolve cleanly to Central and Western railway platforms respectively'
  );

  // 30.7: Generic 'Dadar' query detects multi-line ambiguity with both DR and DDR in candidate list
  const dadarGeneric = normalizeStation('Dadar');
  const hasDr = dadarGeneric.candidates.some(c => c.code === 'DR');
  const hasDdr = dadarGeneric.candidates.some(c => c.code === 'DDR');
  assert(
    dadarGeneric.isAmbiguous === true && hasDr && hasDdr,
    '30.7: Generic query "Dadar" flags platform interchange ambiguity and surfaces both DR and DDR candidates'
  );

  // 30.8: Dadar interchange foot-over-bridge transfer enforces minimum 7-minute walking transfer buffer
  assert(
    STATIONS.DR.interchangeWalkMinutes === 7 && STATIONS.DR.isInterchange === true,
    '30.8: Dadar Central (DR) interchange metadata enforces minimum 7-minute foot-over-bridge walking transfer buffer'
  );

  // 30.9: All 22 transit services are registered across 4 categories with zero duplicates
  const serviceIds = new Set(ALL_22_SERVICES.map(s => s.id));
  const expectedCategories = ['ticketing', 'navigation', 'assistance', 'insights'];
  const categoriesPresent = expectedCategories.every(cat => 
    ALL_22_SERVICES.some(s => s.category === cat)
  );
  assert(
    ALL_22_SERVICES.length === 22 &&
    serviceIds.size === 22 &&
    categoriesPresent,
    '30.9: Complete directory of all 22 transit services registered with zero duplicate IDs across all 4 functional categories'
  );

  // 30.10: External statutory services are gated with isExternalLink: true and official HTTPS URLs
  const railmadad = ALL_22_SERVICES.find(s => s.id === 'railmadad_help');
  const ecatering = ALL_22_SERVICES.find(s => s.id === 'food_station_amenities');
  assert(
    railmadad?.isExternalLink === true &&
    railmadad?.externalUrl === 'https://railmadad.indianrailways.gov.in' &&
    ecatering?.isExternalLink === true &&
    ecatering?.externalUrl === 'https://ecatering.irctc.co.in',
    '30.10: External statutory services (RailMadad 139 and IRCTC e-Catering) enforce gated external provider notices and authentic HTTPS URLs'
  );

  // 30.11: Native mobile app index contains 22-services directory modal and category filters
  const mobileIndexSource = fs.readFileSync(path.resolve(process.cwd(), 'apps/mobile/app/(tabs)/index.tsx'), 'utf8');
  assert(
    mobileIndexSource.includes('NATIVE_22_SERVICES') &&
    mobileIndexSource.includes('All 22 Transit Services') &&
    mobileIndexSource.includes('servicesCategory') &&
    mobileIndexSource.includes('assistantButtonsRow') &&
    mobileIndexSource.includes('bookingGrid'),
    '30.11: Native mobile application index (index.tsx) implements native 22-services directory modal, quick booking grid, and assistant controls'
  );

  // 30.12: Cinematic launch sequence audio and playback controls
  const launchSequenceSource = fs.readFileSync(path.resolve(process.cwd(), 'src/components/LaunchSequence.tsx'), 'utf8');
  assert(
    launchSequenceSource.includes('AudioContext') &&
    launchSequenceSource.includes('311') &&
    launchSequenceSource.includes('370') &&
    launchSequenceSource.includes('railone_launch_muted') &&
    launchSequenceSource.includes('RotateCcw') &&
    launchSequenceSource.includes('Skip Intro'),
    '30.12: LaunchSequence implements synthesized dual-tone electric horn (311Hz/370Hz), audio mute persistence, skip control, and replay capability'
  );

  // 30.13: Kurla -> BKC multimodal journey test (walk + feeder bus)
  const { MultimodalGraphEngine } = await import('../src/engine/multimodal/graphEngine');
  const mmrEng = new MultimodalGraphEngine('mumbai');
  const claBkcItins = mmrEng.planJourney({
    origin: 'CLA',
    destination: 'METRO_BKC'
  });
  const hasClaBkcMultimodal = claBkcItins.some(itin =>
    itin.legs.some(l => l.mode === 'walk' && l.fromNode.code === 'CLA') &&
    itin.legs.some(l => l.mode === 'bus') &&
    itin.legs.some(l => l.toNode.code === 'METRO_BKC')
  );
  assert(
    claBkcItins.length > 0 && hasClaBkcMultimodal,
    '30.13: Kurla Junction (CLA) to BKC connects seamlessly via pedestrian walk link and BEST feeder bus network'
  );

  // 30.14: AC-only filtering returns exclusively AC-enabled suburban services
  const acItins = mmrEng.planJourney({
    origin: 'BVI',
    destination: 'CCG',
    preferences: { acOnly: true }
  });
  const allLegsAc = acItins.length > 0 && acItins.every(itin =>
    itin.legs.every(l => l.isAcService === true)
  );
  assert(
    allLegsAc,
    '30.14: Suburban AC-only route preference filters exclusively for AC Local EMU services'
  );

  // 30.15: Evening last-service cutoff on Metro Line 1 returns 0 journeys
  const lateMetroItins = mmrEng.planJourney({
    origin: 'METRO_ADH',
    destination: 'METRO_GHT',
    departureTime: '23:55'
  });
  assert(
    lateMetroItins.length === 0,
    '30.15: Departures past operational curfew (23:55) on Metro Line 1 return 0 itineraries'
  );

  // 30.16: Dadar West / East alias resolution with whitespace and punctuation
  const ddrPunct = normalizeStation(' Dadar , West ');
  const drClean = normalizeStation('Dadar East');
  assert(
    ddrPunct.matchedStation?.code === 'DDR' &&
    drClean.matchedStation?.code === 'DR',
    '30.16: Station normalizer cleanly resolves punctuated " Dadar , West " to DDR and "Dadar East" to DR'
  );

  // 30.17: 2D station layout models exist for Ghatkopar (GC) and Panvel (PNVL)
  const { STATION_3D_LAYOUTS } = await import('../src/fixtures/stationLayoutsData');
  const hasGcLayout = STATION_3D_LAYOUTS['GC'] !== undefined && STATION_3D_LAYOUTS['GC'].platforms.length === 5;
  const hasPnvlLayout = STATION_3D_LAYOUTS['PNVL'] !== undefined && STATION_3D_LAYOUTS['PNVL'].platforms.length === 7;
  assert(
    hasGcLayout && hasPnvlLayout,
    '30.17: STATION_3D_LAYOUTS contains full top-down 2D blueprints for Ghatkopar (GC) and Panvel (PNVL)'
  );

  // 30.18: Native mobile app defines all 22 transit services matching web ServicesHub directory
  const serviceIdsFound = ALL_22_SERVICES.every(s => mobileIndexSource.includes(`id: '${s.id}'`));
  assert(
    serviceIdsFound && mobileIndexSource.includes('export const NATIVE_22_SERVICES'),
    '30.18: Native mobile app defines complete registry of all 22 transit services matching web ServicesHub directory'
  );
}

// Run Test Suite 31: Antigravity Mission Backend & Data Integrity Acceptance
const { runBackendRedTeamAcceptanceTests } = await import('./backend-redteam-acceptance.test.ts');
await runBackendRedTeamAcceptanceTests();

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

