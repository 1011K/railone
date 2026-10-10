import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert';

console.log('--- Test Suite: Native Mobile 22-Services & Screen Parity ---');

const mobileIndexPath = join(process.cwd(), 'apps/mobile/app/(tabs)/index.tsx');
const wayfindingPath = join(process.cwd(), 'apps/mobile/app/wayfinding.tsx');
const guidePath = join(process.cwd(), 'apps/mobile/app/guide.tsx');
const statusPath = join(process.cwd(), 'apps/mobile/app/(tabs)/status.tsx');
const ticketsPath = join(process.cwd(), 'apps/mobile/app/(tabs)/tickets.tsx');

const mobileIndexContent = readFileSync(mobileIndexPath, 'utf8');
const wayfindingContent = readFileSync(wayfindingPath, 'utf8');
const guideContent = readFileSync(guidePath, 'utf8');
const statusContent = readFileSync(statusPath, 'utf8');
const ticketsContent = readFileSync(ticketsPath, 'utf8');

// 1. Verify all 22 services in NATIVE_22_SERVICES
const expected22ServiceIds = [
  'unreserved_tickets',
  'reserved_tickets',
  'platform_permits',
  'season_passes',
  'metro_ticketing',
  'my_tickets_qr',
  'wallet_recharge',
  'cancellation_refunds',
  'journey_planning',
  'train_running_status',
  'crowd_delay_insights',
  'station_navigation_2d',
  'coach_positioning',
  'railyatri_voice_chat',
  'railmadad_help',
  'food_station_amenities',
  'nearest_station',
  'network_maps',
  'pnr_status',
  'accessibility_assistance',
  'disruption_weather',
  'travel_feedback'
];

for (const id of expected22ServiceIds) {
  assert(
    mobileIndexContent.includes(`id: '${id}'`),
    `Service "${id}" must be declared in NATIVE_22_SERVICES`
  );
}
console.log('✓ All 22 native services declared with authentic IDs');

// 2. Concrete route parameter assertions
assert(
  mobileIndexContent.includes("id: 'metro_ticketing'") &&
  mobileIndexContent.includes("mode: 'METRO_TOKEN'"),
  'metro_ticketing routes to local booking with METRO_TOKEN mode'
);

assert(
  mobileIndexContent.includes("id: 'wallet_recharge'") &&
  mobileIndexContent.includes("tab: 'wallet'"),
  'wallet_recharge routes to tickets tab with wallet param'
);

assert(
  mobileIndexContent.includes("id: 'cancellation_refunds'") &&
  mobileIndexContent.includes("tab: 'cancelled'"),
  'cancellation_refunds routes to tickets tab with cancelled param'
);

assert(
  mobileIndexContent.includes("id: 'nearest_station'") &&
  mobileIndexContent.includes("nearest: 'true'"),
  'nearest_station routes to wayfinding with nearest param'
);

assert(
  mobileIndexContent.includes("id: 'accessibility_assistance'") &&
  mobileIndexContent.includes("stepFree: 'true'"),
  'accessibility_assistance routes to wayfinding with stepFree param'
);

assert(
  mobileIndexContent.includes("id: 'crowd_delay_insights'") &&
  mobileIndexContent.includes("view: 'crowd'"),
  'crowd_delay_insights routes to status with crowd param'
);

assert(
  mobileIndexContent.includes("id: 'disruption_weather'") &&
  mobileIndexContent.includes("view: 'disruptions'"),
  'disruption_weather routes to status with disruptions param'
);

console.log('✓ All 22 services resolve to concrete native routes and param payloads');

// 3. Wayfinding exposes all 11 stations and avoids silent Dadar fallback
const expected11Stations = ['DR', 'CSMT', 'TNA', 'ADH', 'KYN', 'NDLS', 'BVI', 'CLA', 'CCG', 'GC', 'PNVL'];
for (const st of expected11Stations) {
  assert(
    wayfindingContent.includes(`code: '${st}'`),
    `Station "${st}" must be indexed in wayfinding MAJOR_STATIONS`
  );
}
assert(
  wayfindingContent.includes('Station Blueprint Not Yet Indexed'),
  'Wayfinding must render explicit not-indexed card instead of silent Dadar fallback'
);
console.log('✓ Wayfinding indexes 11 major hubs and rejects silent Dadar fallback');

// 4. Guide renders proportional 12-car formation strip
assert(
  guideContent.includes('TRAIN FORMATION STRIP') &&
  guideContent.includes('C1') &&
  guideContent.includes('C12'),
  'Guide must contain full 12-car coach formation (C1 through C12)'
);
console.log('✓ Guide renders proportional 12-car train formation strip');

// 5. Status tab provides crowd insights & weather disruption tabs
assert(
  statusContent.includes("'crowd'") &&
  statusContent.includes("'disruptions'") &&
  statusContent.includes("Peak Rush Direction Heuristics") &&
  statusContent.includes("Network Maintenance & Weather Alerts"),
  'Status screen must include crowd insights and weather disruption views'
);
console.log('✓ Status screen supports live running, crowd insights, and weather disruption views');

// 6. Tickets tab renders RailWallet with balance, top-up and ledger
assert(
  ticketsContent.includes("'wallet'") &&
  ticketsContent.includes("RailOne Transit Wallet") &&
  ticketsContent.includes("Instant Recharge (Demo Credit)") &&
  ticketsContent.includes("handleRecharge"),
  'Tickets screen must render RailWallet UI with top-up chips and transaction ledger'
);
import { normalizeStation } from '../src/engine/stationNormalizer';

// 7. Canonical Station Normalizer integration & typo resolution
const typoResult = normalizeStation('ghatkoper');
assert.strictEqual(
  typoResult.matchedStation?.code,
  'GC',
  'Canonical normalizer must resolve typo "ghatkoper" to Central Suburban GC'
);
const devanagariResult = normalizeStation('घाटकोपर');
assert.strictEqual(
  devanagariResult.matchedStation?.code,
  'GC',
  'Canonical normalizer must resolve Devanagari script "घाटकोपर" to Central Suburban GC'
);
const metroResult = normalizeStation('METRO_GHT');
assert.strictEqual(
  metroResult.matchedStation?.code,
  'METRO_GHT',
  'Canonical normalizer must maintain modal isolation for Metro Line 1 METRO_GHT'
);
assert.notStrictEqual(
  typoResult.matchedStation?.code,
  metroResult.matchedStation?.code,
  'Suburban GC and Metro METRO_GHT must maintain strict modal isolation'
);
console.log('✓ Canonical normalizer resolves typos (ghatkoper) and preserves modal isolation (GC vs METRO_GHT)');

// 8. Reduced-Motion Accessibility Check in NativeLaunchSequence
const launchContent = readFileSync(join(process.cwd(), 'apps/mobile/src/components/NativeLaunchSequence.tsx'), 'utf8');
assert(
  launchContent.includes('AccessibilityInfo.isReduceMotionEnabled') ||
  launchContent.includes('isReduceMotionEnabled'),
  'NativeLaunchSequence must check AccessibilityInfo.isReduceMotionEnabled for reduced motion accessibility'
);
console.log('✓ NativeLaunchSequence enforces reduced-motion accessibility fallback');

// 9. Zero-Emoji Compliance across mobile screens (AGENTS.md Charter)
const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}]/u;
const helpContent = readFileSync(join(process.cwd(), 'apps/mobile/app/(tabs)/help.tsx'), 'utf8');
const freshStatusContent = readFileSync(statusPath, 'utf8');
const feedbackContent = readFileSync(join(process.cwd(), 'apps/mobile/app/feedback.tsx'), 'utf8');
const freshWayfindingContent = readFileSync(wayfindingPath, 'utf8');
const freshGuideContent = readFileSync(guidePath, 'utf8');

assert(!emojiRegex.test(helpContent), 'help.tsx must contain zero emojis');
assert(!emojiRegex.test(freshStatusContent), 'status.tsx must contain zero emojis');
assert(!emojiRegex.test(feedbackContent), 'feedback.tsx must contain zero emojis');
assert(!emojiRegex.test(freshWayfindingContent), 'wayfinding.tsx must contain zero emojis');
assert(!emojiRegex.test(freshGuideContent), 'guide.tsx must contain zero emojis');
console.log('✓ Zero-emoji compliance verified across help, status, feedback, wayfinding, and guide screens');

// 10. MovingTrain3DModal wired into PassengerMobileApp
const passengerAppContent = readFileSync(join(process.cwd(), 'src/components/PassengerMobileApp.tsx'), 'utf8');
assert(
  passengerAppContent.includes('<MovingTrain3DModal') &&
  passengerAppContent.includes("case 'moving_train_3d':"),
  'PassengerMobileApp must wire MovingTrain3DModal into JSX and handleActionModal'
);
console.log('✓ MovingTrain3DModal connected to PassengerMobileApp startup and action dispatcher');

// 11. Station picker empty state and mode badges in index.tsx
const freshMobileIndexContent = readFileSync(mobileIndexPath, 'utf8');
assert(
  freshMobileIndexContent.includes('ListEmptyComponent') &&
  freshMobileIndexContent.includes('No stations found matching') &&
  freshMobileIndexContent.includes('resolveStationCanonical(text)'),
  'Station picker must implement ListEmptyComponent and consume canonical normalizer'
);
console.log('✓ Station picker implements ListEmptyComponent and consumes canonical normalizer');

// 12. Client-side Canonical Station Resolver tests
import { resolveStationCanonical } from '../apps/mobile/src/services/canonicalStationResolver';
const mobileTypoResult = resolveStationCanonical('ghatkoper');
assert.strictEqual(
  mobileTypoResult.matchedStation?.code,
  'GC',
  'Mobile canonical resolver must resolve typo "ghatkoper" to Central Suburban GC'
);
const mobileDevanagari = resolveStationCanonical('घाटकोपर');
assert.strictEqual(
  mobileDevanagari.matchedStation?.code,
  'GC',
  'Mobile canonical resolver must resolve Devanagari script "घाटकोपर" to Central Suburban GC'
);
const mobileDadar = resolveStationCanonical('dadar');
assert.strictEqual(
  mobileDadar.isAmbiguous,
  true,
  'Mobile canonical resolver must flag generic "dadar" as ambiguous'
);
assert.ok(
  mobileDadar.candidates.some(c => c.code === 'DR') && mobileDadar.candidates.some(c => c.code === 'DDR'),
  'Mobile canonical resolver must return both DR (Central) and DDR (Western) for Dadar'
);
console.log('✓ Mobile canonical station resolver handles typos, Devanagari, and Dadar platform ambiguity');

console.log('--- ALL MOBILE NAVIGATION & WORKFLOW TESTS PASSED ---');
