import { planJourneys } from '../src/engine/journeyEngine';

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition: boolean, label: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  [PASS] ${label}`);
  } else {
    failedChecks++;
    console.error(`  [FAIL] ${label}`);
  }
}

console.log('====================================================');
console.log('   RAILONE NEXT - MULTI-CITY & ROUTE VERIFICATION    ');
console.log('====================================================\n');

// 1. Critical Mumbai Suburban Route Pairs at 10:35 Morning Rush
console.log('--- 1. Mumbai Suburban Routes at 10:35 AM ---');
const mumbaiPairs = [
  ['ADH', 'CSMT', 'Andheri -> CSMT (Harbour/Western)'],
  ['TNA', 'DR', 'Thane -> Dadar (Central Fast/Slow)'],
  ['TNA', 'CSMT', 'Thane -> CSMT (Central Main)'],
  ['TNA', 'CCG', 'Thane -> Churchgate via Dadar Interchange'],
  ['DR', 'KYN', 'Dadar -> Kalyan (Central Outward)'],
  ['ADH', 'DR', 'Andheri -> Dadar (Western Main)'],
  ['PNVL', 'CSMT', 'Panvel -> CSMT (Harbour Line)'],
  ['CLA', 'TNA', 'Kurla -> Thane (Central Main)']
];

for (const [from, to, label] of mumbaiPairs) {
  const res = planJourneys({
    originCode: from,
    destCode: to,
    departureTime: '10:35',
    userContext: 'pre_departure',
    preferences: { classPreference: 'any', priority: 'fastest', hasSeasonPass: false, walkToStationMinutes: 10, maxTransfers: 1 }
  });
  assert(res.length > 0, `${label}: ${res.length} itineraries found`);
}

// 2. Off-Peak and Evening Times across Mumbai Network
console.log('\n--- 2. Multi-Time Cadence Verification (14:00 Off-Peak, 18:30 Evening Peak) ---');
for (const time of ['14:00', '18:30']) {
  const resThaneCsmt = planJourneys({
    originCode: 'TNA',
    destCode: 'CSMT',
    departureTime: time,
    userContext: 'pre_departure',
    preferences: { classPreference: 'any', priority: 'fastest', hasSeasonPass: false, walkToStationMinutes: 10, maxTransfers: 1 }
  });
  assert(resThaneCsmt.length > 0, `Thane -> CSMT at ${time}: ${resThaneCsmt.length} itineraries found`);

  const resAndheriCcg = planJourneys({
    originCode: 'ADH',
    destCode: 'CCG',
    departureTime: time,
    userContext: 'pre_departure',
    preferences: { classPreference: 'any', priority: 'fastest', hasSeasonPass: false, walkToStationMinutes: 10, maxTransfers: 1 }
  });
  assert(resAndheriCcg.length > 0, `Andheri -> Churchgate at ${time}: ${resAndheriCcg.length} itineraries found`);
}

// 3. AC Suburban Local Availability and Filtering
console.log('\n--- 3. AC Suburban Local Availability & Filtering ---');
{
  // When searching with default 'any', AC locals must NOT be excluded
  const anyClassRes = planJourneys({
    originCode: 'TNA',
    destCode: 'CSMT',
    departureTime: '10:35',
    userContext: 'pre_departure',
    preferences: { classPreference: 'any', priority: 'fastest', hasSeasonPass: false, walkToStationMinutes: 10, maxTransfers: 1 }
  });
  const hasAcInAny = anyClassRes.some(it => it.isAcService || it.recommendedClass === 'AC_LOCAL' || it.legs.some(l => l.train.serviceType.includes('ac')));
  assert(hasAcInAny, `classPreference: 'any' retains AC local options in candidate itineraries (found: ${hasAcInAny})`);

  // When searching with 'ac_mandatory', 100% of services must be AC
  const acOnlyRes = planJourneys({
    originCode: 'TNA',
    destCode: 'CSMT',
    departureTime: '10:35',
    userContext: 'pre_departure',
    preferences: { classPreference: 'ac_mandatory', priority: 'fastest', hasSeasonPass: false, walkToStationMinutes: 10, maxTransfers: 1 }
  });
  assert(acOnlyRes.length > 0, `classPreference: 'ac_mandatory' returns valid itineraries (${acOnlyRes.length} found)`);
  const allAc = acOnlyRes.every(it => it.legs.every(l => l.train.serviceType.includes('ac')));
  assert(allAc, `classPreference: 'ac_mandatory' strictly excludes 100% non-AC services`);
}

// 4. All 8 Indian Cities Representative Hub-to-Hub Commutes
console.log('\n--- 4. All 8 Cities Commuter Routes ---');
const cityPairs = [
  ['Mumbai', 'TNA', 'CSMT', 'Thane -> CSMT'],
  ['Pune', 'PUNE', 'LNL', 'Pune Jn -> Lonavala'],
  ['Delhi NCR', 'NDLS', 'GZB', 'New Delhi -> Ghaziabad'],
  ['Bengaluru', 'SBC', 'WFD', 'KSR Bengaluru -> Whitefield'],
  ['Kolkata', 'HWH', 'BNGA', 'Howrah -> Bangaon'],
  ['Chennai', 'MAS', 'TBM', 'Chennai Central -> Tambaram'],
  ['Hyderabad', 'SC', 'LPI', 'Secunderabad -> Lingampalli'],
  ['Kochi', 'ERS', 'AWY', 'Ernakulam South -> Aluva']
];

for (const [city, from, to, label] of cityPairs) {
  const res = planJourneys({
    originCode: from,
    destCode: to,
    departureTime: '10:35',
    userContext: 'pre_departure',
    preferences: { classPreference: 'any', priority: 'fastest', hasSeasonPass: false, walkToStationMinutes: 10, maxTransfers: 1 }
  });
  assert(res.length > 0, `${city} (${label}): ${res.length} itineraries found`);
}

console.log('\n====================================================');
console.log(`VERIFICATION SUMMARY: ${passedChecks}/${totalChecks} Passed (${failedChecks} Failed)`);
console.log('====================================================');

if (failedChecks > 0) {
  process.exit(1);
}
