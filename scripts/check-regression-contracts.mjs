/**
 * Lightweight source-level regression guard. This is NOT a typecheck, runtime
 * test, security certification, timetable verification or native device test.
 * It catches known feature disappearance before a developer claims completion.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = relative => readFileSync(path.join(root, relative), 'utf8');
const routes = src('src/backend/routes/v1.ts');
const auth = src('src/backend/middleware/auth.ts');
const crowd = src('src/engine/crowdEstimator.ts');
const nativeJourneys = src('apps/mobile/app/(tabs)/journeys.tsx');
const nativeLive = src('apps/mobile/app/(tabs)/status.tsx');
const guide = src('apps/mobile/app/guide.tsx');
const mobileApi = src('apps/mobile/src/api/client.ts');
const cities = src('src/engine/multimodal/cityPacks.ts');

const checks = [
  ['No profile-ID-only token renewal', () => assert.match(routes, /IDENTITY_VERIFICATION_REQUIRED/)],
  ['Signed tokens never use a fixed example secret', () => assert.match(auth, /crypto\.randomBytes\(32\)/)],
  ['Booking submission is authenticated', () => assert.match(routes, /post\('\/bookings', authenticatePassenger/)],
  ['No unauthenticated audit-log endpoint', () => assert.match(routes, /ADMIN_ACCESS_NOT_CONFIGURED/)],
  ['Crowding is a low-confidence estimate', () => assert.match(crowd, /let confidence:.*= 'LOW'/)],
  ['Native app still offers least-crowded preference', () => assert.match(nativeJourneys, /preferLessCrowded/)],
  ['Native app still shows crowd labels', () => assert.match(nativeJourneys, /Crowding:/)],
  ['Native app displays the multimodal graph', () => assert.match(nativeJourneys, /searchMultimodalRoutes/)],
  ['Native API includes per-session demo authorization', () => assert.match(mobileApi, /async function demoAuth/)],
  ['Missing live observation cannot become RIGHT TIME', () => assert.doesNotMatch(nativeLive, /'RIGHT TIME'/)],
  ['Guide does not claim unverified UTS validation', () => assert.doesNotMatch(guide, /UTS VALIDATED/)],
  ['Guide does not invent a 120m station distance', () => assert.doesNotMatch(guide, /approx\. 120m away/)],
  ['Monorail is marked suspended', () => assert.match(cities, /mode: 'monorail',[\s\S]{0,180}operationalStatus: 'SUSPENDED'/)]
];
let passed = 0;
for (const [name, check] of checks) {
  try { check(); passed++; console.log('PASS ' + name); }
  catch (error) { console.error('FAIL ' + name + ': ' + error.message); process.exitCode = 1; }
}
console.log('Source contracts: ' + passed + '/' + checks.length + '. Run full npm test, typechecks and device checks separately.');
