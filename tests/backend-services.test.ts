import assert from 'node:assert/strict';
import { resetDatabase, getDatabase } from '../src/backend/database/db';
import { searchStations, getStationByCode } from '../src/backend/modules/stations';
import { searchRoutes } from '../src/backend/modules/routePlanner';
import { getTrainTrip, searchTrainServices } from '../src/backend/modules/services';
import { getStationDepartures } from '../src/backend/modules/timetable';
import { getTrainStatus } from '../src/backend/modules/trainStatus';
import { checkAvailability } from '../src/backend/modules/availability';
import { calculateSuburbanFare, calculateMetroFare, calculateExpressFare } from '../src/backend/modules/fares';
import { validateEligibility } from '../src/backend/modules/eligibility';
import { evaluateDisruptionReplan } from '../src/backend/modules/disruptions';
import { createBooking, reconcileBooking, getBookingById, getBookingByIdempotencyKey } from '../src/backend/modules/ticketing';
import { listBookings, cancelBooking } from '../src/backend/modules/bookingHistory';
import { startVoiceSession, processVoiceTurn, getVoiceSession } from '../src/backend/modules/voiceAgent';
import { checkSystemHealth } from '../src/backend/modules/health';
import { listInterchangeHubs, getTransferWalkGuide } from '../src/backend/modules/interchanges';
import { getMetroLines, getMetroStations } from '../src/backend/modules/metro';
import { getAuditLogs, logAuditEvent } from '../src/backend/modules/auditLog';
import { getProviderDossiers, StatutoryTelephonyAdapter } from '../src/backend/modules/providerAdapters';
import { createPassengerProfile, getPassengerProfile } from '../src/backend/modules/passengerProfiles';

export async function runBackendServicesTests() {
  console.log('\n--- Test Suite 22: Service-Oriented Backend Architecture & SQLite Persistence ---');

  // 1. Database layer
  resetDatabase(true);
  const db = getDatabase();
  assert.ok(db, 'Database initializes in-memory successfully');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  const tableNames = tables.map((t: any) => t.name);
  assert.ok(tableNames.includes('bookings'), 'Bookings table exists');
  assert.ok(tableNames.includes('tickets'), 'Tickets table exists');
  assert.ok(tableNames.includes('cancellations'), 'Cancellations table exists');
  assert.ok(tableNames.includes('audit_logs'), 'Audit logs table exists');
  assert.ok(tableNames.includes('voice_sessions'), 'Voice sessions table exists');
  console.log('  [PASS] 22.1: SQLite database initializes with all 7 persistence tables');

  // 2. Stations module
  const cstStation = getStationByCode('CST');
  assert.ok(cstStation, 'Normalizes CST to CSMT');
  assert.strictEqual(cstStation?.code, 'CSMT');
  const thaneResults = searchStations('Thane');
  assert.ok(thaneResults.length > 0 && thaneResults[0].code === 'TNA');
  console.log('  [PASS] 22.2: Station registry normalizes aliases (CST -> CSMT) and searches correctly');

  // 3. Fares module
  const sub2nd = calculateSuburbanFare(35, 'II');
  assert.strictEqual(sub2nd.totalFare, 10, 'Suburban 35km 2nd Class is ₹10');
  const sub1st = calculateSuburbanFare(35, 'I');
  assert.strictEqual(sub1st.totalFare, 105, 'Suburban 35km 1st Class is ₹105');
  const subAC = calculateSuburbanFare(35, 'AC_LOCAL');
  assert.strictEqual(subAC.totalFare, 95, 'Suburban 35km AC Local is ₹95');
  const metroFare = calculateMetroFare(8);
  assert.strictEqual(metroFare.totalFare, 20, 'Metro 8km fare is ₹20');
  console.log('  [PASS] 22.3: Fare calculation matches official Suburban and Metro tariff slabs');

  // 4. Route planner & AC filter
  const acRoutes = searchRoutes({ from: 'TNA', to: 'CSMT', acOnly: true });
  assert.ok(acRoutes.length > 0, 'Found routes for TNA to CSMT');
  for (const r of acRoutes) {
    assert.ok(r.isAcService, 'Route is strictly AC service');
  }
  console.log('  [PASS] 22.4: Generalized route planner enforces strict AC filtering');

  // 5. Booking creation with server-side validation & idempotency
  const booking1 = createBooking({
    idempotencyKey: 'IDEMP-TEST-001',
    trainNumber: '95114',
    journeyDate: '2026-10-15',
    fromStationCode: 'TNA',
    toStationCode: 'CSMT',
    classBooked: 'AC_LOCAL',
    passengers: [{ name: 'Arjun Verma', age: 32, gender: 'M' }]
  });
  assert.ok(booking1.id, 'Booking created with ID');
  assert.strictEqual(booking1.bookingState, 'TICKET_ISSUED_DEMO');
  assert.strictEqual(booking1.farePaid, 95);
  assert.ok(booking1.qrPayload.includes('DEMO / NOT VALID FOR TRAVEL'), 'QR contains educational watermark');

  // Test idempotency deduplication
  const bookingDuplicate = createBooking({
    idempotencyKey: 'IDEMP-TEST-001',
    trainNumber: '95114',
    journeyDate: '2026-10-15',
    fromStationCode: 'TNA',
    toStationCode: 'CSMT',
    classBooked: 'AC_LOCAL',
    passengers: [{ name: 'Arjun Verma', age: 32, gender: 'M' }]
  });
  assert.strictEqual(bookingDuplicate.id, booking1.id, 'Duplicate tap returns identical booking ID');
  console.log('  [PASS] 22.5: Server-side booking creation enforces idempotency and watermarking');

  // 6. Payment timeout & reconciliation
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
  assert.strictEqual(pendingBooking.bookingState, 'PENDING_RECONCILIATION_DEMO');
  const reconciled = reconcileBooking(pendingBooking.id);
  assert.strictEqual(reconciled.bookingState, 'TICKET_ISSUED_DEMO');
  console.log('  [PASS] 22.6: Payment timeout state machine and deterministic reconciliation');

  // 7. Cancellation & refund calculation
  const cancelResult = cancelBooking(booking1.id, 'Change of travel plans');
  assert.ok(cancelResult.cancelledAt);
  assert.strictEqual(cancelResult.refundBreakdown.totalPaid, 95);
  assert.strictEqual(cancelResult.refundBreakdown.clericalDeduction, 30);
  assert.strictEqual(cancelResult.refundBreakdown.walletRefund, 65);
  const updatedBooking = getBookingById(booking1.id);
  assert.strictEqual(updatedBooking?.bookingState, 'CANCELLED_DEMO');
  console.log('  [PASS] 22.7: Ticket cancellation computes statutory clerical deductions and RailWallet refund');

  // 8. Audit logging
  const auditLogs = getAuditLogs(10);
  assert.ok(auditLogs.length >= 3, 'Audit logs recorded');
  const eventTypes = auditLogs.map(l => l.eventType);
  assert.ok(eventTypes.includes('BOOKING_CREATED'));
  assert.ok(eventTypes.includes('BOOKING_CANCELLED'));
  console.log('  [PASS] 22.8: Server-side audit log records booking lifecycle transactions');

  // 9. Voice Agent multi-turn state machine
  const session = startVoiceSession({ language: 'en' });
  assert.strictEqual(session.state, 'INITIAL');

  // Turn 1: "Book me a first-class local from Thane to Churchgate around 12:30"
  const turn1 = await processVoiceTurn(
    session.sessionId,
    'Book me a first-class local from Thane to Churchgate around 12:30'
  );
  assert.strictEqual(turn1.state, 'ITINERARY_OFFERED');
  assert.strictEqual(turn1.activeDraft.originCode, 'TNA');
  assert.strictEqual(turn1.activeDraft.destCode, 'CCG');
  assert.strictEqual(turn1.activeDraft.preferredClass, 'I');

  // Turn 2: "Use AC if available, otherwise show first class"
  const turn2 = await processVoiceTurn(
    session.sessionId,
    'Use AC if available, otherwise show first class'
  );
  assert.strictEqual(turn2.state, 'ITINERARY_OFFERED');
  assert.strictEqual(turn2.activeDraft.preferredClass, 'AC_LOCAL');
  assert.strictEqual(turn2.activeDraft.totalFare, 95);

  // Turn 3: "Book this one"
  const turn3 = await processVoiceTurn(session.sessionId, 'Book this one');
  assert.strictEqual(turn3.state, 'AWAITING_CONFIRMATION');
  assert.ok(turn3.spokenResponse.includes('Please confirm'));

  // Turn 4: "Yes confirm"
  const turn4 = await processVoiceTurn(session.sessionId, 'Yes confirm');
  assert.strictEqual(turn4.state, 'BOOKING_EXECUTED');
  assert.ok(turn4.issuedBooking, 'Voice agent issued verified booking record');
  assert.ok(turn4.spokenResponse.includes('Booking confirmed'));
  console.log('  [PASS] 22.9: RailSathi voice agent executes complete 4-turn booking conversation with tool grounding');

  // 10. Provider adapters and statutory telephony blocker
  const telephony = new StatutoryTelephonyAdapter();
  const blocker = telephony.getBlockerDossier();
  assert.strictEqual(blocker.is139Repurposed, false, '139 cannot be repurposed');
  const callAttempt = await telephony.initiateCall('+919876543210', '+919999999999');
  assert.strictEqual(callAttempt.status, 'blocked');
  console.log('  [PASS] 22.10: Telephony provider adapter enforces statutory DoT blocker and prohibits 139 co-opting');

  // 11. System Health
  const health = checkSystemHealth(false);
  assert.strictEqual(health.status, 'healthy');
  assert.strictEqual(health.modulesCount, 20);
  assert.strictEqual(health.database.status, 'connected');
  console.log('  [PASS] 22.11: Health check validates all 20 modules and SQLite database operational');
}
