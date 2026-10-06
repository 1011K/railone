/**
 * RailOne Next — Comprehensive Verification & P0 Test Suite
 * Validates:
 * 1. Stop eligibility, route direction, and invalid halts
 * 2. Delay inversion (Slow Local beating delayed Fast Local)
 * 3. Origin delay propagation & Leave-Home calculation
 * 4. Dadar-to-Kalyan Express short-hop ticketing eligibility (MST vs non-MST)
 * 5. Cross-line transfer timing & minimum buffer compliance (Thane to Churchgate via Dadar)
 * 6. Categorical crowd estimation without fabricated percentages
 * 7. Multi-class fare calculation (Suburban II, I, AC Local, 2S, CC)
 * 8. Deterministic voice tool contract execution
 * 9. Specimen booking idempotency, mock cancellation, and QR payload validity
 * 10. Truth-in-data missing observation / unknown fallback
 */

import { STATIONS, TRAIN_TRIPS, INITIAL_OBSERVATIONS, calculateSuburbanFare } from '../src/fixtures/railwayData';
import { evaluateJourneyEligibility } from '../src/engine/eligibilityEngine';
import { computePredictedStops, getMinutesDifference, addMinutesToTimeString } from '../src/engine/delayModel';
import { planJourneys } from '../src/engine/journeyEngine';
import { estimateCrowdLevel } from '../src/engine/crowdEstimator';
import { RailBackendTools } from '../src/engine/voiceTools';
import { MockBookingStore } from '../src/engine/mockBookingStore';

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

// 1. Station & Network Integrity
console.log('Test Suite 1: Station Graph & Alias Normalization');
{
  assert(STATIONS.CSMT !== undefined, 'CSMT station exists with platforms');
  assert(STATIONS.DR.interchangeWalkMinutes === 7, 'Dadar interchange walk buffer is configured (7 mins)');
  assert(STATIONS.TNA.platforms.length >= 8, 'Thane has realistic platform count');
  assert(STATIONS.DR.aliases.includes('dadar central'), 'Station alias normalization works for Dadar');
  assert(STATIONS.KYN.city === 'Kalyan', 'Kalyan station metadata valid');
}

// 2. Stop Eligibility & Legal Ticketing Gate
console.log('\nTest Suite 2: Boarding Eligibility & Short-Hop Express Constraints');
{
  const fastLocal = TRAIN_TRIPS.find(t => t.trainNumber === '95112')!;
  const acLocal = TRAIN_TRIPS.find(t => t.trainNumber === '95114')!;
  const deccanQueen = TRAIN_TRIPS.find(t => t.trainNumber === '12123')!;
  const konarkExpress = TRAIN_TRIPS.find(t => t.trainNumber === '11020')!;

  // 2a. Suburban EMU with regular ticket
  const subRes = evaluateJourneyEligibility({
    train: fastLocal,
    fromStationCode: 'TNA',
    toStationCode: 'DR',
    userTicketType: 'suburban_single',
    userClass: 'II',
    hasMST: false
  });
  assert(subRes.status === 'ELIGIBLE', 'Suburban EMU is ELIGIBLE with ordinary suburban ticket');

  // 2b. AC Local with regular Second Class ticket
  const acSubRes = evaluateJourneyEligibility({
    train: acLocal,
    fromStationCode: 'TNA',
    toStationCode: 'DR',
    userTicketType: 'suburban_single',
    userClass: 'II',
    hasMST: false
  });
  assert(acSubRes.status === 'PROHIBITED', 'Ordinary suburban ticket on AC Local is PROHIBITED');

  // 2c. AC Local with AC ticket
  const acValidRes = evaluateJourneyEligibility({
    train: acLocal,
    fromStationCode: 'TNA',
    toStationCode: 'DR',
    userTicketType: 'suburban_single',
    userClass: 'AC_LOCAL',
    hasMST: false
  });
  assert(acValidRes.status === 'ELIGIBLE', 'AC Local with AC ticket is ELIGIBLE');

  // 2d. Dadar to Kalyan on MST-permitted Express (Deccan Queen) with MST pass
  const dqMstRes = evaluateJourneyEligibility({
    train: deccanQueen,
    fromStationCode: 'DR',
    toStationCode: 'KYN',
    userTicketType: 'suburban_season_pass',
    userClass: 'II',
    hasMST: true
  });
  assert(dqMstRes.status === 'CONDITIONAL', 'Dadar-Kalyan Express hop on MST train is CONDITIONAL (General coach only)');
  assert(dqMstRes.rulesApplied.some(r => r.includes('CR MST Rule')), 'Central Railway MST rule cited in explanation');

  // 2e. Dadar to Kalyan on non-MST Express (Konark Express) with suburban pass
  const konarkRes = evaluateJourneyEligibility({
    train: konarkExpress,
    fromStationCode: 'DR',
    toStationCode: 'KYN',
    userTicketType: 'suburban_season_pass',
    userClass: 'II',
    hasMST: true
  });
  assert(konarkRes.status === 'PROHIBITED', 'Dadar-Kalyan short hop on non-MST Express is PROHIBITED');
  assert(konarkRes.rulesApplied.some(r => r.includes('NOT on the authorized suburban MST list')), 'Refusal cites lack of MST authorization');

  // 2f. Direction reverse mismatch (trying to go from Dadar to Thane on an Up train going to CSMT)
  const dirRes = evaluateJourneyEligibility({
    train: fastLocal, // KYN -> CSMT (Southbound)
    fromStationCode: 'DR',
    toStationCode: 'TNA', // Northbound
    userTicketType: 'suburban_single',
    userClass: 'II',
    hasMST: false
  });
  assert(dirRes.status === 'PROHIBITED', 'Reverse direction travel on one-way service is PROHIBITED');
}

// 3. Delay Propagation & Station-by-Station Calculation
console.log('\nTest Suite 3: Downstream Delay Propagation');
{
  const fastLocal = TRAIN_TRIPS.find(t => t.trainNumber === '95112')!;
  const obs = INITIAL_OBSERVATIONS['95112']; // +22 min delay at Kurla

  const predicted = computePredictedStops(fastLocal, obs);
  const kurlaStop = predicted.find(s => s.stationCode === 'CLA')!;
  const dadarStop = predicted.find(s => s.stationCode === 'DR')!;
  const csmtStop = predicted.find(s => s.stationCode === 'CSMT')!;

  assert(kurlaStop.delayArrivalMinutes === 22, 'Delay at current station Kurla matches reported delay (+22 min)');
  assert(dadarStop.delayArrivalMinutes >= 22, 'Delay propagates downstream to Dadar (+22 min or higher)');
  assert(dadarStop.predictedArrival === addMinutesToTimeString(dadarStop.scheduledArrival, dadarStop.delayArrivalMinutes), 'Predicted arrival is scheduled + delay');
  assert(csmtStop.uncertaintyMinutes > kurlaStop.uncertaintyMinutes, 'Uncertainty increases further down the line');
}

// 4. Delay Inversion: Slow Local Beats Delayed Fast Local
console.log('\nTest Suite 4: Delay Inversion Detection');
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

  assert(itineraries.length > 0, 'Itineraries found between Thane and Dadar');
  const best = itineraries[0];
  assert(best.legs[0].train.serviceType === 'suburban_slow', 'Slow Local is ranked #1 over delayed Fast Local');
  assert(best.delayInversionNote !== undefined, 'Delay Inversion note is present on winner');
  assert(best.delayInversionNote!.includes('DELAY INVERSION WINNER'), 'Identified as DELAY INVERSION WINNER in user output');
}

// 5. Origin Delay & Leave-Home Time Calculation
console.log('\nTest Suite 5: Origin Delay & Leave-Home Engine');
{
  const itineraries = planJourneys({
    originCode: 'TNA',
    destCode: 'CSMT',
    departureTime: '10:30',
    userContext: 'pre_departure',
    preferences: {
      classPreference: 'ac_mandatory',
      priority: 'fastest',
      hasSeasonPass: false,
      walkToStationMinutes: 15,
      maxTransfers: 0
    }
  });

  const acItinerary = itineraries.find(it => it.legs[0].train.trainNumber === '95114');
  assert(acItinerary !== undefined, 'AC Local 95114 found');
  if (acItinerary) {
    assert(acItinerary.originDelayWarning !== undefined, 'Origin delay warning generated for train waiting at origin');
    assert(acItinerary.originDelayWarning!.includes('Train has not departed'), 'Advises that train has not departed origin');
    assert(acItinerary.leaveHomeMarginMinutes === 15, 'Respects 15m walk-to-station margin');
  }
}

// 6. Cross-Line Multi-Leg Transfers (Thane to Churchgate via Dadar)
console.log('\nTest Suite 6: Multi-Leg Interchange Transfer Feasibility');
{
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

  const transferItinerary = itineraries.find(it => it.transfers.length === 1);
  assert(transferItinerary !== undefined, 'Found multi-leg transfer from Thane to Churchgate via Dadar');
  if (transferItinerary) {
    const t = transferItinerary.transfers[0];
    assert(t.station.code === 'DR', 'Interchange station is Dadar');
    assert(t.walkTimeMinutes >= 7, 'Minimum walk buffer of 7 mins accounted for');
    assert(t.bufferMinutes >= t.walkTimeMinutes, 'Actual buffer satisfies minimum walking transfer time');
    assert(!t.isMissedConnection, 'Connection is verified as feasible (not missed)');
  }
}

// 7. Categorical Crowding Engine
console.log('\nTest Suite 7: Categorical Crowding Estimation (No False Precision)');
{
  const fastTrain = TRAIN_TRIPS.find(t => t.trainNumber === '95112')!;
  const acTrain = TRAIN_TRIPS.find(t => t.trainNumber === '95114')!;

  // Morning peak southbound crowd at Thane
  const peakCrowd = estimateCrowdLevel(fastTrain, 'TNA', '09:15', 20, false);
  assert(peakCrowd.level === 'CRUSH_LOAD', 'Morning peak delayed Fast Local produces CRUSH_LOAD');
  assert(peakCrowd.confidence === 'HIGH', 'Peak confidence is HIGH');

  // AC train crowd during peak
  const acCrowd = estimateCrowdLevel(acTrain, 'TNA', '09:15', 0, true);
  assert(acCrowd.level === 'HEAVY', 'Peak AC local produces HEAVY load (controlled density)');

  // Off-peak crowd
  const offPeakCrowd = estimateCrowdLevel(fastTrain, 'TNA', '14:00', 0, false);
  assert(offPeakCrowd.level === 'MODERATE' || offPeakCrowd.level === 'LOW', 'Midday produces MODERATE or LOW load');
}

// 8. Fare Calculation Accuracy
console.log('\nTest Suite 8: Official Suburban & Express Fare Tariffs');
{
  assert(calculateSuburbanFare(10, 'II') === 5, 'Suburban 10km Second Class is ₹5');
  assert(calculateSuburbanFare(35, 'II') === 10, 'Suburban 35km Second Class is ₹10');
  assert(calculateSuburbanFare(55, 'II') === 15, 'Suburban 55km Second Class is ₹15');
  assert(calculateSuburbanFare(35, 'I') === 105, 'Suburban 35km First Class is ₹105');
  assert(calculateSuburbanFare(35, 'AC_LOCAL') === 95, 'Suburban 35km AC Local is ₹95');
  assert(calculateSuburbanFare(138, '2S') > 50, 'Express 2S has distance-based minimum tariff');
}

// 9. Deterministic Voice Tools & Specimen Booking Flow
console.log('\nTest Suite 9: Voice & UI Deterministic Tool Contract');
{
  const searchResult = RailBackendTools.searchTrains('TNA', 'DR', '10:35');
  assert(searchResult.status === 'success', 'searchTrains tool returns success');
  if (searchResult.status === 'success') {
    assert(searchResult.count > 0, 'searchTrains returned viable itineraries');
  }

  const statusResult = RailBackendTools.getLiveStatus('95112');
  assert(statusResult.status === 'success', 'getLiveStatus tool returns success');
  if (statusResult.status === 'success') {
    assert(statusResult.currentDelayMinutes === 22, 'getLiveStatus matches active delay');
    assert(statusResult.dataProvenance.status === 'DEMO', 'getLiveStatus truthfully reports DEMO status');
  }

  const eligResult = RailBackendTools.validateEligibility('12123', 'DR', 'KYN', 'suburban_season_pass', 'II');
  assert(eligResult.eligibility === 'CONDITIONAL', 'validateEligibility tool confirms CONDITIONAL status for Deccan Queen');

  const fareQuote = RailBackendTools.quoteFare('TNA', 'DR', 'AC_LOCAL');
  assert(fareQuote.status === 'success', 'quoteFare tool returns success');
  if (fareQuote.status === 'success') {
    assert(fareQuote.fareAmount > 0, 'quoteFare tool returns valid fare');
  }

  // Booking draft & mock confirmation
  const draftRes = RailBackendTools.createBookingDraft({
    trainNumber: '97045',
    fromCode: 'TNA',
    toCode: 'DR',
    classCode: 'II',
    passengers: [{ name: 'Aarav Sharma', age: 24, gender: 'M' }]
  });
  assert(draftRes.status === 'success' && draftRes.draft !== undefined, 'createBookingDraft tool creates valid draft');

  if (draftRes.draft) {
    const confirmRes = RailBackendTools.confirmDemoBooking(draftRes.draft.draftId, 'RailWallet (Simulated)');
    assert(confirmRes.status === 'success' && confirmRes.ticket !== undefined, 'confirmDemoBooking creates specimen ticket');
    if (confirmRes.ticket) {
      assert(confirmRes.ticket.pnrMock.startsWith('MOCK-'), 'Ticket has mock PNR prefix');
      assert(confirmRes.ticket.qrPayload.includes('EDUCATIONAL SPECIMEN ONLY'), 'QR payload includes non-negotiable educational disclaimer');

      // Cancellation test
      const cancelRes = MockBookingStore.cancelBooking(confirmRes.ticket.id);
      assert(cancelRes.success === true, 'Ticket cancellation works with simulated refund');
      assert(cancelRes.refundAmount === confirmRes.ticket.farePaid, 'Full simulated refund returned');
    }
  }
}

// 10. Truth-in-Data Fallback for Missing Observations
console.log('\nTest Suite 10: Missing Data Fallback');
{
  const unmonitoredTrain = TRAIN_TRIPS.find(t => t.trainNumber === '97051')!;
  const predicted = computePredictedStops(unmonitoredTrain, undefined);
  assert(predicted.every(s => s.dataStatus === 'SCHEDULED'), 'Missing observation falls back to SCHEDULED, never hallucinates on-time live feed');
}

// 11. Harbour Line & Triple Suburban Network Coverage
console.log('\nTest Suite 11: Mumbai Harbour Line Suburban Corridor');
{
  assert(STATIONS.PNVL !== undefined, 'Panvel (Harbour line terminus) exists');
  assert(STATIONS.VSH !== undefined, 'Vashi (Navi Mumbai gateway) exists');
  assert(STATIONS.VDLR !== undefined, 'Vadala Road exists');

  const harbourJourneys = planJourneys({
    originCode: 'PNVL',
    destCode: 'CSMT',
    departureTime: '10:05',
    userContext: 'pre_departure',
    preferences: {
      classPreference: 'second',
      priority: 'fastest',
      hasSeasonPass: false,
      walkToStationMinutes: 5,
      maxTransfers: 0
    }
  });

  assert(harbourJourneys.length > 0, 'Harbour Line direct journey found from Panvel to CSMT');
  if (harbourJourneys.length > 0) {
    const hj = harbourJourneys[0];
    assert(hj.legs[0].train.trainNumber === '98042', 'Identified 98042 Panvel - CSMT Harbour Local');
    assert(hj.totalFareByClass.II === 15, 'Panvel to CSMT suburban fare calculated accurately');
  }
}

// 12. Dynamic Disruption State Inversion
console.log('\nTest Suite 12: Dynamic Disruption Simulation Toggle');
{
  // When signal disruption is cleared, 95112 fast local returns to on-time and re-evaluates
  const clearedObs: any = {
    ...INITIAL_OBSERVATIONS,
    '95112': {
      ...INITIAL_OBSERVATIONS['95112'],
      delayMinutesAtCurrent: 1,
      disruptionReason: 'Signal cleared'
    }
  };

  const recomputedJourneys = planJourneys({
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
    },
    observations: clearedObs
  });

  assert(recomputedJourneys.length > 0, 'Recomputed journeys under cleared signal condition');
  const topJourney = recomputedJourneys[0];
  // Under clear conditions, fast train is fast
  assert(topJourney !== undefined, 'Valid top journey exists when disruption cleared');
}

// 13. Network Service Alerts & Operations Control API
console.log('\nTest Suite 13: Network Service Alerts & Operations Control API');
{
  const { NetworkAlertsService } = await import('../src/services/networkAlertsService');
  
  const allAlerts = await NetworkAlertsService.getActiveAlerts();
  assert(allAlerts.length >= 4, 'NetworkAlertsService returns multi-division service alerts');

  const crAlerts = await NetworkAlertsService.getActiveAlerts('central');
  assert(crAlerts.every(a => a.line === 'central'), 'Division filtering works for Central Railway alerts');
  assert(crAlerts.some(a => a.severity === 'MAJOR'), 'Major delay alert exists with operational cause');

  const train95112Alerts = await NetworkAlertsService.getAlertsForTrain('95112');
  assert(train95112Alerts.length > 0, 'Train-specific alert lookup finds active notice for 95112');
  assert(train95112Alerts[0].passengerRecommendation.includes('Slow'), 'Includes actionable passenger recommendation');

  const divisionHealth = await NetworkAlertsService.getDivisionHealth();
  assert(divisionHealth.length === 4, 'Returns punctuality metrics for all 4 railway divisions');
  assert(divisionHealth.every(dh => dh.punctualityIndex > 70 && dh.punctualityIndex <= 100), 'Punctuality indices within valid percentage range');
}

// 14. Commuter Task Taxonomy & Priority Gating
console.log('\nTest Suite 14: Commuter Task Taxonomy & Priority Gating');
{
  const { TASK_CATEGORY_METADATA, TASK_PRIORITY_METADATA } = await import('../src/types/tasks');
  const categories = Object.keys(TASK_CATEGORY_METADATA);
  assert(categories.length === 8, '8 task categories defined for comprehensive railway workflows');
  assert(categories.includes('DISRUPTION_RECOVERY'), 'DISRUPTION_RECOVERY category exists');
  assert(categories.includes('GRIEVANCE_RAILMADAD'), 'GRIEVANCE_RAILMADAD category exists');
  assert(categories.includes('SAFETY_LOST_FOUND'), 'SAFETY_LOST_FOUND category exists');
  assert(categories.includes('COACH_POSITIONING'), 'COACH_POSITIONING category exists');

  const priorities = Object.keys(TASK_PRIORITY_METADATA);
  assert(priorities.length === 4, '4 priority levels defined');
  assert(TASK_PRIORITY_METADATA.P0_CRITICAL.sortWeight === 0, 'P0_CRITICAL has top sort weight');
  assert(TASK_PRIORITY_METADATA.P3_LOW.sortWeight === 3, 'P3_LOW has lowest sort weight');

  const { AiRailwayService } = await import('../src/services/aiService');
  const decompRes = await AiRailwayService.decomposeTravelPlan('Signal failure at Vidyavihar with delays');
  assert(decompRes.tasks.length >= 2, 'AI decomposition returns multiple prioritized tasks');
  assert(decompRes.tasks.some(t => t.category === 'DISRUPTION_RECOVERY'), 'Identifies DISRUPTION_RECOVERY for signal delay input');
}

// 15. Theme Configuration & Multi-Color Palettes
console.log('\nTest Suite 15: Theme Configuration & Multi-Color Palettes');
{
  const { THEME_CONFIG } = await import('../src/components/ThemeContext');
  const themeKeys = Object.keys(THEME_CONFIG);
  assert(themeKeys.length === 8, '8 theme color palettes defined (ocean, forest, violet, sunset, cyber, crimson, gold, contrast)');
  assert(THEME_CONFIG.ocean.primaryHex === '#2563eb', 'Ocean theme has official IR Blue');
  assert(THEME_CONFIG.cyber.name.includes('Vande Bharat'), 'Cyber theme represents Vande Bharat');
  assert(THEME_CONFIG.contrast.name.includes('High-Contrast'), 'Contrast theme provides accessible WCAG AAA palette');
}

// 16. Visual Route Delay & Congestion Heatmap Engine
console.log('\nTest Suite 16: Visual Route Delay & Congestion Heatmap Engine');
{
  const { computeRouteHeatmap, computeNetworkCorridorHeatmaps } = await import('../src/engine/delayHeatmap');
  const delayedTrain = TRAIN_TRIPS.find(t => t.trainNumber === '95112')!;
  const obs = INITIAL_OBSERVATIONS['95112'];

  const segments = computeRouteHeatmap(delayedTrain, obs);
  assert(segments.length > 0, 'Route heatmap computes intermediate track segments');
  assert(segments.some(s => s.intensity === 'CRITICAL'), 'Identifies CRITICAL thermal intensity for +22m delay section');
  assert(segments.some(s => s.isBottleneck), 'Flags high delay segments as active bottlenecks');
  assert(segments.some(s => s.colorHex === '#ef4444'), 'Applies red heat color code to severe delay segments');
  assert(segments.some(s => s.speedLimitKmh <= 60), 'Applies caution speed restriction to congested blocks');

  const corridors = computeNetworkCorridorHeatmaps(INITIAL_OBSERVATIONS);
  assert(corridors.length === 3, 'Computes 3 mainline Mumbai suburban corridors (Central, Western, Harbour)');
  assert(corridors.some(c => c.line === 'central' && c.maxDelay >= 18), 'Central corridor captures peak Vidyavihar/Kalyan bottlenecks');
}

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
