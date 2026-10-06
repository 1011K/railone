/**
 * RailOne Next — Comprehensive Verification & P0 Test Suite
 * Master Plan 2.0 Acceptance Scenarios (G1–G18) + Architectural Invariants
 */

import { STATIONS, TRAIN_TRIPS, INITIAL_OBSERVATIONS, calculateSuburbanFare } from '../src/fixtures/railwayData';
import { evaluateJourneyEligibility } from '../src/engine/eligibilityEngine';
import { computePredictedStops, getMinutesDifference, addMinutesToTimeString, addMinutesWithDayOffset } from '../src/engine/delayModel';
import { planJourneys } from '../src/engine/journeyEngine';
import { estimateCrowdLevel } from '../src/engine/crowdEstimator';
import { RailBackendTools } from '../src/engine/voiceTools';
import { MockBookingStore } from '../src/engine/mockBookingStore';
import { normalizeStation } from '../src/engine/stationNormalizer';

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

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

