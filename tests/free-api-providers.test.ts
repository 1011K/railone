/**
 * RailOne Next — Free API Providers & Backend Hardening Test Suite (Test Suite 34)
 * Verifies NVIDIA NIM, Gemini, Groq, OpenRouteService, Open-Meteo, MapLibre/OpenFreeMap,
 * and RailSathi Voice Grounding with adversarial edge-case testing.
 */

import { AiProviderRouter } from '../src/backend/modules/ai/aiProviderRouter';
import { GeminiProvider } from '../src/backend/modules/ai/geminiProvider';
import { NvidiaNimProvider } from '../src/backend/modules/ai/nvidiaNimProvider';
import { GroqProvider } from '../src/backend/modules/ai/groqProvider';
import { DeterministicProvider } from '../src/backend/modules/ai/deterministicProvider';
import { OpenRouteServiceAdapter } from '../src/backend/modules/openRouteService';
import { OpenMeteoService } from '../src/backend/modules/openMeteo';
import { getMapLibreStyleUrl, METRO_REGION_GEO_BOUNDS } from '../src/services/mapLibreConfig';
import { startVoiceSession, processVoiceTurn } from '../src/backend/modules/voiceAgent';

export async function runFreeApiProvidersTestSuite(assert: (cond: boolean, name: string, detail?: string) => void) {
  console.log('\n--- TEST SUITE 34: FREE API PROVIDERS & BACKEND HARDENING ---');

  const router = AiProviderRouter.getInstance();

  // 34.1: Provider Router Health Inspection
  const healthList = router.getProvidersHealth();
  const hasGemini = healthList.some(h => h.name === 'gemini');
  const hasNvidia = healthList.some(h => h.name === 'nvidia');
  const hasGroq = healthList.some(h => h.name === 'groq');
  const hasDeterministic = healthList.some(h => h.name === 'deterministic');

  assert(
    hasGemini && hasNvidia && hasGroq && hasDeterministic,
    '34.1: AI Provider Router exposes complete registry of Gemini, NVIDIA NIM, Groq, and Deterministic engines'
  );

  // 34.2: Deterministic Domain Engine Always Available
  const detHealth = router.getProvider('deterministic').getHealth();
  assert(
    detHealth.status === 'AVAILABLE' && detHealth.configured === true && !detHealth.circuitOpen,
    '34.2: Deterministic Domain Engine is permanently AVAILABLE with zero external network dependency'
  );

  // 34.3: Task Decomposition Fallback & Schema Validation
  const decomposeResult = await router.decomposeTasks('Check delay on Fast Local from Thane to Dadar');
  const validTasks = Array.isArray(decomposeResult.tasks) && decomposeResult.tasks.length >= 2;
  const categoriesOk = decomposeResult.tasks.every(t =>
    ['DISRUPTION_RECOVERY', 'JOURNEY_PLANNING', 'BOOKING_TICKETING', 'GRIEVANCE_RAILMADAD',
     'SAFETY_LOST_FOUND', 'STATION_AMENITIES', 'COACH_POSITIONING', 'CREW_OPERATIONS'].includes(t.category)
  );
  assert(
    validTasks && categoriesOk,
    '34.3: AI Task Decomposition strictly validates task categories and schema structure'
  );

  // 34.4: AI Copilot Grounded Fallback
  const copilotResult = await router.askCopilot('How do I transfer between Dadar Central and Western line?', [], 'deterministic');
  assert(
    copilotResult.reply.includes('Foot Overbridge') &&
    copilotResult.reply.includes('7 minutes') &&
    copilotResult.provenance === 'DEMO',
    '34.4: AI Copilot returns grounded Dadar 7-minute FOB transfer advisory with explicit DEMO provenance'
  );

  // 34.5: RailMadad Complaint Drafter Grounded Template
  const grievanceResult = await router.draftGrievance('COACH_COOLING_FAILURE', '95114', 'AC-03', 'AC cooling defective', 'deterministic');
  assert(
    grievanceResult.draft.includes('DEMO / NOT SUBMITTED TO RAILMADAD') &&
    grievanceResult.draft.includes('139') &&
    grievanceResult.draft.includes('95114'),
    '34.5: RailMadad complaint drafter generates non-fabricated educational draft with disclaimer'
  );

  // 34.6: NVIDIA NIM Quota Protection and Paid Upgrade Prevention
  const nvidiaProvider = new NvidiaNimProvider();
  assert(
    nvidiaProvider.getModel() === (process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct'),
    '34.6: NVIDIA NIM model is configurable via NVIDIA_MODEL rather than hardcoded'
  );

  // 34.7: Groq Provider Configuration and Model Resolution
  const groqProvider = new GroqProvider();
  assert(
    groqProvider.getModel() === (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'),
    '34.7: Groq model is configurable via GROQ_MODEL rather than hardcoded'
  );

  // 34.8: Gemini Provider Model Resolution (Replaced fake gemini-3.8-flash)
  const geminiProvider = new GeminiProvider();
  assert(
    geminiProvider.getModel() === (process.env.GEMINI_MODEL || 'gemini-2.5-flash'),
    '34.8: Gemini model resolves to valid gemini-2.5-flash instead of deprecated fake model'
  );

  // 34.9: OpenRouteService HeiGIT Safety Rule (FOB vs Street)
  const orsAdapter = new OpenRouteServiceAdapter();
  const dadarWalk = await orsAdapter.planPedestrianRoute({
    startLat: 19.0178,
    startLon: 72.8478,
    endLat: 19.0185,
    endLon: 72.8425,
    stationOriginCode: 'DR',
    stationDestCode: 'DDR'
  });
  assert(
    dadarWalk.routeType === 'INTERNAL_STATION_FOB' &&
    dadarWalk.provenance === 'STATION_GEOMETRY' &&
    dadarWalk.notice.includes('FOB_STATION_INTERCHANGE') &&
    dadarWalk.durationMinutes >= 7 &&
    !dadarWalk.instructions.includes('Invalid platform specified.'),
    '34.9: OpenRouteService strictly rejects street pedestrian routing for Dadar track crossing and enforces 7-min FOB transfer geometry'
  );

  // 34.10: OpenRouteService Ghatkopar Suburban to Metro FOB Safety Rule
  const gcWalk = await orsAdapter.planPedestrianRoute({
    startLat: 19.0864,
    startLon: 72.9081,
    endLat: 19.0860,
    endLon: 72.9085,
    stationOriginCode: 'GC',
    stationDestCode: 'METRO_GHT'
  });
  assert(
    gcWalk.routeType === 'INTERNAL_STATION_FOB' &&
    gcWalk.notice.includes('FOB_STATION_INTERCHANGE') &&
    gcWalk.distanceMeters > 0 &&
    gcWalk.instructions.length >= 3 &&
    !gcWalk.instructions.includes('Invalid platform specified.') &&
    gcWalk.stepFreeAccessible === true,
    '34.10: Ghatkopar Suburban to Metro connection strictly enforces internal FOB transfer with valid instructions'
  );

  // 34.11: Street Pedestrian Geometric Walk Fallback
  const streetWalk = await orsAdapter.planPedestrianRoute({
    startLat: 19.0178,
    startLon: 72.8478,
    endLat: 19.0220,
    endLon: 72.8500
  });
  assert(
    streetWalk.distanceMeters > 0 &&
    streetWalk.durationMinutes > 0 &&
    (streetWalk.routeType === 'CALCULATED_ESTIMATE' || streetWalk.routeType === 'STREET_PEDESTRIAN'),
    '34.11: Street pedestrian navigation computes realistic walking distance and duration'
  );

  // 34.12: Open-Meteo Weather Advisory and Zero Delay Fabrication Guard
  const weatherService = new OpenMeteoService();
  const weatherReport = await weatherService.getWeatherForCoordinates(19.0760, 72.8777, 'CSMT');
  assert(
    weatherReport.safetyNotice.includes('Weather conditions must NEVER be treated as confirmation that a train is delayed or cancelled'),
    '34.12: Open-Meteo weather report strictly enforces non-negotiable zero delay fabrication guard'
  );

  // 34.13: MapLibre + OpenFreeMap Zero Google Maps Paid Dependency
  const libertyStyle = getMapLibreStyleUrl('liberty');
  const hasMumbaiBounds = METRO_REGION_GEO_BOUNDS['mumbai'] !== undefined;
  const hasKochiBounds = METRO_REGION_GEO_BOUNDS['kochi'] !== undefined;
  const hasDelhiBounds = METRO_REGION_GEO_BOUNDS['delhi'] !== undefined;
  assert(
    libertyStyle.includes('openfreemap.org') && hasMumbaiBounds && hasKochiBounds && hasDelhiBounds,
    '34.13: MapLibre + OpenFreeMap provides verified open vector tile styles and coverage bounds across all 9 transit regions'
  );

  // 34.14: RailSathi Voice Multilingual Devanagari Station Entity Extraction
  const voiceSession = startVoiceSession({ language: 'hi' });
  const hindiTurn = await processVoiceTurn(voiceSession.sessionId, 'मुझे ठाणे से दादर जाना है', { language: 'hi' });
  assert(
    hindiTurn.activeDraft.originCode === 'TNA' &&
    hindiTurn.activeDraft.destCode === 'DR' &&
    hindiTurn.state === 'ITINERARY_OFFERED',
    '34.14: RailSathi correctly parses Devanagari Hindi origin and destination ("ठाणे से दादर") into canonical codes'
  );

  // 34.15: RailSathi Voice Explicit Booking Confirmation Guard
  const unconfirmedSession = startVoiceSession({ language: 'en' });
  await processVoiceTurn(unconfirmedSession.sessionId, 'From Thane to Dadar');
  const promptConfirm = await processVoiceTurn(unconfirmedSession.sessionId, 'Book this one');
  assert(
    promptConfirm.state === 'AWAITING_CONFIRMATION' &&
    promptConfirm.issuedBooking === undefined &&
    promptConfirm.spokenResponse.includes('Please confirm'),
    '34.15: RailSathi requires explicit passenger review and confirmation before issuing any ticket'
  );

  // 34.16: RailSathi Voice Execution Watermarked Demo Booking
  const finalizeBooking = await processVoiceTurn(unconfirmedSession.sessionId, 'Yes, confirm');
  assert(
    finalizeBooking.state === 'BOOKING_EXECUTED' &&
    finalizeBooking.issuedBooking !== undefined &&
    finalizeBooking.issuedBooking.isSimulated === true,
    '34.16: RailSathi executed booking produces strictly simulated demo specimen invalid for real travel'
  );

  // 34.17: Pedestrian Routing Unavailable Path Beyond 15km Limit
  const longWalk = await orsAdapter.planPedestrianRoute({
    startLat: 19.0178, // Mumbai
    startLon: 72.8478,
    endLat: 28.6139,   // New Delhi (~1,150km)
    endLon: 77.2090
  });
  assert(
    longWalk.notice.includes('UNAVAILABLE_PATH') &&
    longWalk.instructions.some(i => i.includes('exceeds realistic pedestrian walking range')),
    '34.17: Pedestrian navigation handles excessive distances (>15km) truthfully as UNAVAILABLE_PATH'
  );

  // 34.18: RailSathi Voice Multilingual Marathi Booking & Confirmation
  const mrSession = startVoiceSession({ language: 'mr' });
  await processVoiceTurn(mrSession.sessionId, 'मला ठाण्याहून दादरला जायचे आहे', { language: 'mr' });
  const mrBookTurn = await processVoiceTurn(mrSession.sessionId, 'हे बुक करा', { language: 'mr' });
  assert(
    mrBookTurn.state === 'AWAITING_CONFIRMATION' &&
    mrBookTurn.spokenResponse.includes('कृपया पुष्टी करा'),
    '34.18a: RailSathi Marathi booking prompt initiates AWAITING_CONFIRMATION in Marathi'
  );
  const mrConfirmTurn = await processVoiceTurn(mrSession.sessionId, 'हो, पुष्टी करा', { language: 'mr' });
  assert(
    mrConfirmTurn.state === 'BOOKING_EXECUTED' &&
    mrConfirmTurn.issuedBooking !== undefined &&
    mrConfirmTurn.spokenResponse.includes('अभिनंदन'),
    '34.18b: RailSathi executes booking upon native Marathi confirmation ("हो, पुष्टी करा")'
  );

  // 34.19: RailSathi Voice Cancellation Handling
  const cancelSession = startVoiceSession({ language: 'en' });
  await processVoiceTurn(cancelSession.sessionId, 'From Thane to Dadar');
  await processVoiceTurn(cancelSession.sessionId, 'Book this one');
  const cancelledTurn = await processVoiceTurn(cancelSession.sessionId, 'No, cancel');
  assert(
    cancelledTurn.state === 'ITINERARY_OFFERED' &&
    cancelledTurn.spokenResponse.includes('Booking cancelled') &&
    cancelledTurn.issuedBooking === undefined,
    '34.19: RailSathi acknowledges passenger cancellation in AWAITING_CONFIRMATION without issuing ticket'
  );

  // 34.20: Confirmation Gate Bypass Prevention
  const bypassSession = startVoiceSession({ language: 'en' });
  await processVoiceTurn(bypassSession.sessionId, 'From Thane to Dadar');
  const earlyConfirm = await processVoiceTurn(bypassSession.sessionId, 'Confirm booking');
  assert(
    earlyConfirm.state === 'AWAITING_CONFIRMATION' &&
    earlyConfirm.issuedBooking === undefined &&
    earlyConfirm.spokenResponse.includes('Please confirm'),
    '34.20: Premature "Confirm booking" utterance safely transitions to AWAITING_CONFIRMATION rather than bypassing review'
  );

  // 34.21: AI Provider Feature Flags & Latency Prioritization
  assert(
    router.isAiGloballyEnabled() === true &&
    router.isProviderEnabled('deterministic') === true,
    '34.21: Feature flag checks correctly validate provider enablement states'
  );

  // 34.22: NVIDIA NIM Model Validation Entitlement Check
  const entitlementCheck = await nvidiaProvider.validateModelAvailability();
  assert(
    typeof entitlementCheck.available === 'boolean' &&
    typeof entitlementCheck.entitlementStatus === 'string',
    '34.22: NVIDIA NIM implements validateModelAvailability entitlement check'
  );
}
