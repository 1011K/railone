import { planJourneys } from '../src/engine/journeyEngine';

const pairs = [
  ['ADH', 'CSMT', 'Andheri -> CSMT'],
  ['TNA', 'DR', 'Thane -> Dadar'],
  ['TNA', 'CSMT', 'Thane -> CSMT'],
  ['TNA', 'CCG', 'Thane -> Churchgate via Dadar'],
  ['DR', 'KYN', 'Dadar -> Kalyan'],
  ['ADH', 'DR', 'Andheri -> Dadar'],
  ['PNVL', 'CSMT', 'Panvel -> CSMT'],
  ['CLA', 'TNA', 'Kurla -> Thane']
];

console.log('--- Verifying Critical Passenger Route Pairs ---');
for (const [from, to, label] of pairs) {
  const res = planJourneys({
    originCode: from,
    destCode: to,
    departureTime: '10:35',
    userContext: 'pre_departure',
    preferences: { classPreference: 'any', priority: 'fastest', hasSeasonPass: false, walkToStationMinutes: 10, maxTransfers: 1 }
  });
  console.log(`${label}: ${res.length} candidate itineraries found`);
  if (res.length === 0) {
    console.error(`FAILED to find route for ${label}`);
  }
}
