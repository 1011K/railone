import { Router, Request, Response } from 'express';
import { searchStations, getStationByCode, getAllStations } from '../modules/stations';
import { searchRoutes, compareJourneys } from '../modules/routePlanner';
import { searchTrainServices, getTrainTrip } from '../modules/services';
import { getStationDepartures } from '../modules/timetable';
import { getTrainStatus } from '../modules/trainStatus';
import { checkAvailability } from '../modules/availability';
import { calculateSuburbanFare, calculateMetroFare, calculateExpressFare, calculateStationDistance } from '../modules/fares';
import { validateEligibility } from '../modules/eligibility';
import { evaluateDisruptionReplan } from '../modules/disruptions';
import { createBooking, reconcileBooking, getBookingById, getBookingByPnr } from '../modules/ticketing';
import { listBookings, cancelBooking } from '../modules/bookingHistory';
import { startVoiceSession, processVoiceTurn, getVoiceSession } from '../modules/voiceAgent';
import { checkSystemHealth } from '../modules/health';
import { listInterchangeHubs, getStationLayout, getTransferWalkGuide } from '../modules/interchanges';
import { getMetroLines, getMetroStations, getSuburbanToMetroInterchanges } from '../modules/metro';
import { getAuditLogs } from '../modules/auditLog';
import { getProviderDossiers, StatutoryTelephonyAdapter } from '../modules/providerAdapters';
import { createPassengerProfile, getPassengerProfile, updatePassengerProfile } from '../modules/passengerProfiles';
import { sendNotification, getNotifications } from '../modules/notifications';
import { TravelClass } from '../../types/railway';

export const v1Router = Router();

// ---------------------------------------------------------------------------
// 1. Stations
// ---------------------------------------------------------------------------
v1Router.get('/stations/search', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const line = (req.query.line as any) || undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 25;
  const results = searchStations(query, line, limit);
  res.json({ count: results.length, stations: results });
});

v1Router.get('/stations/:code', (req: Request, res: Response) => {
  const station = getStationByCode(req.params.code);
  if (!station) {
    return res.status(404).json({ error: 'STATION_NOT_FOUND', message: `Station ${req.params.code} not found.` });
  }
  res.json({ station });
});

// ---------------------------------------------------------------------------
// 2. Route Planning & Journeys
// ---------------------------------------------------------------------------
v1Router.get('/routes/search', (req: Request, res: Response) => {
  const from = req.query.from as string;
  const to = req.query.to as string;
  if (!from || !to) {
    return res.status(400).json({ error: 'INVALID_PARAMS', message: 'from and to station parameters are required.' });
  }

  const routes = searchRoutes({
    from,
    to,
    departureTime: req.query.departureTime as string,
    arriveByDeadline: req.query.arriveBy as string,
    date: req.query.date as string,
    classPreference: req.query.classPreference as any,
    acOnly: req.query.acOnly === 'true' || req.query.acOnly === '1',
    priority: req.query.priority as any,
    transitModeFilter: req.query.transitModeFilter as any,
    onboardTrainNumber: req.query.onboardTrainNumber as string,
    onboardCurrentStation: req.query.onboardCurrentStation as string
  });

  res.json({
    origin: from,
    destination: to,
    count: routes.length,
    itineraries: routes
  });
});

v1Router.post('/journeys/compare', (req: Request, res: Response) => {
  const { itineraries } = req.body;
  if (!Array.isArray(itineraries)) {
    return res.status(400).json({ error: 'INVALID_BODY', message: 'itineraries array is required.' });
  }
  const comparison = compareJourneys(itineraries);
  res.json(comparison);
});

// ---------------------------------------------------------------------------
// 3. Trains & Services
// ---------------------------------------------------------------------------
v1Router.get('/trains/search', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const serviceType = req.query.serviceType as any;
  const date = req.query.date as string;
  const trains = searchTrainServices(query, serviceType, date);
  res.json({ count: trains.length, trains });
});

v1Router.get('/trains/:id', (req: Request, res: Response) => {
  const train = getTrainTrip(req.params.id);
  if (!train) {
    return res.status(404).json({ error: 'TRAIN_NOT_FOUND', message: `Train ${req.params.id} not found.` });
  }
  res.json({ train });
});

v1Router.get('/trains/:id/status', (req: Request, res: Response) => {
  const status = getTrainStatus(req.params.id);
  if (!status) {
    return res.status(404).json({ error: 'TRAIN_NOT_FOUND', message: `Live status unavailable for ${req.params.id}.` });
  }
  res.json({ status });
});

// ---------------------------------------------------------------------------
// 4. Station Departures & Timetable
// ---------------------------------------------------------------------------
v1Router.get('/departures', (req: Request, res: Response) => {
  const station = req.query.station as string;
  if (!station) {
    return res.status(400).json({ error: 'INVALID_PARAMS', message: 'station parameter is required.' });
  }
  const dateStr = req.query.date as string;
  const startTime = (req.query.time as string) || '00:00';
  const windowMinutes = req.query.window ? parseInt(req.query.window as string, 10) : 180;

  const departures = getStationDepartures(station, dateStr, startTime, windowMinutes);
  res.json({ station, count: departures.length, departures });
});

// ---------------------------------------------------------------------------
// 5. Availability & Fares
// ---------------------------------------------------------------------------
v1Router.get('/availability', (req: Request, res: Response) => {
  const trainNumber = req.query.train as string;
  const journeyDate = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const quota = (req.query.quota as string) || 'GN';

  if (!trainNumber) {
    return res.status(400).json({ error: 'INVALID_PARAMS', message: 'train parameter is required.' });
  }

  const avail = checkAvailability(trainNumber, journeyDate, quota);
  if (!avail) {
    return res.status(404).json({ error: 'TRAIN_NOT_FOUND', message: `Train ${trainNumber} not found.` });
  }
  res.json(avail);
});

v1Router.post('/fares/quote', (req: Request, res: Response) => {
  const { serviceType, distanceKm, from, to, fromStationCode, toStationCode, travelClass = 'II', isSuperfast = false } = req.body;
  const orig = from || fromStationCode;
  const dest = to || toStationCode;
  let dist = distanceKm ? Number(distanceKm) : 0;
  if (!dist && orig && dest) {
    dist = calculateStationDistance(orig, dest);
  }
  if (!dist) dist = 25;

  let quote;
  if (serviceType === 'metro') {
    quote = calculateMetroFare(dist);
  } else if (serviceType === 'express') {
    quote = calculateExpressFare(dist, travelClass as TravelClass, !!isSuperfast);
  } else {
    quote = calculateSuburbanFare(dist, travelClass as TravelClass);
  }

  res.json({ quote, distanceKm: dist });
});

// ---------------------------------------------------------------------------
// 6. Eligibility Verification
// ---------------------------------------------------------------------------
v1Router.post('/eligibility/validate', (req: Request, res: Response) => {
  const { trainNumber, fromStationCode, toStationCode, userTicketType, userClass, hasMST } = req.body;
  if (!trainNumber || !fromStationCode || !toStationCode) {
    return res.status(400).json({ error: 'INVALID_PARAMS', message: 'trainNumber, fromStationCode, and toStationCode are required.' });
  }

  const result = validateEligibility({
    trainNumber,
    fromStationCode,
    toStationCode,
    userTicketType,
    userClass,
    hasMST
  });

  res.json({ eligibility: result });
});

// ---------------------------------------------------------------------------
// 7. Disruption Recovery & Replanning
// ---------------------------------------------------------------------------
v1Router.post('/disruptions/replan', (req: Request, res: Response) => {
  const { currentStationCode, destinationStationCode, delayedTrainNumber, reportedDelayMinutes } = req.body;
  if (!currentStationCode || !destinationStationCode) {
    return res.status(400).json({ error: 'INVALID_PARAMS', message: 'currentStationCode and destinationStationCode are required.' });
  }

  const result = evaluateDisruptionReplan({
    currentStationCode,
    destinationStationCode,
    delayedTrainNumber,
    reportedDelayMinutes
  });

  res.json(result);
});

// ---------------------------------------------------------------------------
// 8. Bookings & Ticketing (Server-Side Transactions)
// ---------------------------------------------------------------------------
v1Router.post('/bookings', (req: Request, res: Response) => {
  try {
    const idempotencyKey = (req.headers['x-idempotency-key'] as string) || req.body.idempotencyKey;
    const booking = createBooking({
      ...req.body,
      idempotencyKey
    });
    res.status(201).json({ booking });
  } catch (err: any) {
    res.status(400).json({ error: 'BOOKING_CREATION_FAILED', message: err.message });
  }
});

v1Router.get('/bookings/:id', (req: Request, res: Response) => {
  const booking = getBookingById(req.params.id) || getBookingByPnr(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'BOOKING_NOT_FOUND', message: `Booking ${req.params.id} not found.` });
  }
  res.json({ booking });
});

v1Router.post('/bookings/:id/reconcile', (req: Request, res: Response) => {
  try {
    const reconciled = reconcileBooking(req.params.id);
    res.json({ booking: reconciled, message: 'Transaction reconciled successfully.' });
  } catch (err: any) {
    res.status(400).json({ error: 'RECONCILIATION_FAILED', message: err.message });
  }
});

v1Router.get('/tickets', (req: Request, res: Response) => {
  const passengerProfileId = req.query.passengerProfileId as string;
  const category = (req.query.category as any) || 'all';
  const tickets = listBookings({ passengerProfileId, category });
  res.json({ count: tickets.length, tickets });
});

v1Router.get('/tickets/:id', (req: Request, res: Response) => {
  const booking = getBookingById(req.params.id) || getBookingByPnr(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'TICKET_NOT_FOUND', message: `Ticket ${req.params.id} not found.` });
  }
  res.json({ ticket: booking });
});

v1Router.post('/tickets/:id/cancel', (req: Request, res: Response) => {
  try {
    const reason = (req.body.reason as string) || 'Passenger voluntary cancellation';
    const result = cancelBooking(req.params.id, reason);
    res.json({ cancellation: result });
  } catch (err: any) {
    res.status(400).json({ error: 'CANCELLATION_FAILED', message: err.message });
  }
});

// ---------------------------------------------------------------------------
// 9. RailSathi AI Voice Agent Sessions
// ---------------------------------------------------------------------------
v1Router.post('/voice/session', (req: Request, res: Response) => {
  const language = req.body.language || 'en';
  const session = startVoiceSession({ language, passengerProfileId: req.body.passengerProfileId });
  res.json({ session });
});

v1Router.get('/voice/session/:id', (req: Request, res: Response) => {
  const session = getVoiceSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'SESSION_NOT_FOUND', message: `Voice session ${req.params.id} not found.` });
  }
  res.json({ session });
});

v1Router.post('/voice/turn', async (req: Request, res: Response) => {
  const { sessionId, utterance, language, passengerProfileId } = req.body;
  if (!sessionId || !utterance) {
    return res.status(400).json({ error: 'INVALID_BODY', message: 'sessionId and utterance are required.' });
  }

  try {
    const turnResponse = await processVoiceTurn(sessionId, utterance, { language, passengerProfileId });
    res.json(turnResponse);
  } catch (err: any) {
    res.status(500).json({ error: 'VOICE_TURN_FAILED', message: err.message });
  }
});

// ---------------------------------------------------------------------------
// 10. Interchanges & Station Wayfinding
// ---------------------------------------------------------------------------
v1Router.get('/interchanges', (req: Request, res: Response) => {
  const hubs = listInterchangeHubs();
  res.json({ count: hubs.length, hubs });
});

v1Router.get('/interchanges/:code/layout', (req: Request, res: Response) => {
  const layout = getStationLayout(req.params.code);
  if (!layout) {
    return res.status(404).json({ error: 'LAYOUT_NOT_INDEXED', message: `3D Station topology not indexed for ${req.params.code}.` });
  }
  res.json({ layout });
});

v1Router.get('/interchanges/:code/walk', (req: Request, res: Response) => {
  const fromPf = (req.query.from as string) || '1';
  const toPf = (req.query.to as string) || '2';
  const stepFree = req.query.stepFree === 'true' || req.query.stepFree === '1';

  const walkGuide = getTransferWalkGuide(req.params.code, fromPf, toPf, stepFree);
  res.json({ walkGuide });
});

// ---------------------------------------------------------------------------
// 11. Metro Integration
// ---------------------------------------------------------------------------
v1Router.get('/metro/lines', (req: Request, res: Response) => {
  res.json({ lines: getMetroLines() });
});

v1Router.get('/metro/stations', (req: Request, res: Response) => {
  const lineId = req.query.line as string;
  res.json({ stations: getMetroStations(lineId) });
});

v1Router.get('/metro/interchanges', (req: Request, res: Response) => {
  res.json({ interchanges: getSuburbanToMetroInterchanges() });
});

// ---------------------------------------------------------------------------
// 12. Passenger Profiles
// ---------------------------------------------------------------------------
v1Router.post('/passengers', (req: Request, res: Response) => {
  try {
    const profile = createPassengerProfile(req.body);
    res.status(201).json({ profile });
  } catch (err: any) {
    res.status(400).json({ error: 'PROFILE_CREATION_FAILED', message: err.message });
  }
});

v1Router.get('/passengers/:id', (req: Request, res: Response) => {
  const profile = getPassengerProfile(req.params.id);
  if (!profile) {
    return res.status(404).json({ error: 'PROFILE_NOT_FOUND', message: `Profile ${req.params.id} not found.` });
  }
  res.json({ profile });
});

v1Router.put('/passengers/:id', (req: Request, res: Response) => {
  const updated = updatePassengerProfile(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'PROFILE_NOT_FOUND', message: `Profile ${req.params.id} not found.` });
  }
  res.json({ profile: updated });
});

// ---------------------------------------------------------------------------
// 13. Notifications
// ---------------------------------------------------------------------------
v1Router.get('/notifications', (req: Request, res: Response) => {
  const profileId = req.query.profileId as string;
  const notifications = getNotifications(profileId);
  res.json({ count: notifications.length, notifications });
});

v1Router.post('/notifications', (req: Request, res: Response) => {
  const notif = sendNotification(req.body);
  res.status(201).json({ notification: notif });
});

// ---------------------------------------------------------------------------
// 14. Audit Logs & Observability
// ---------------------------------------------------------------------------
v1Router.get('/audit/logs', (req: Request, res: Response) => {
  const eventType = req.query.eventType as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const logs = getAuditLogs(limit, eventType);
  res.json({ count: logs.length, logs });
});

// ---------------------------------------------------------------------------
// 15. Provider Dossiers & Statutory Blockers
// ---------------------------------------------------------------------------
v1Router.get('/providers', (req: Request, res: Response) => {
  const telephony = new StatutoryTelephonyAdapter();
  res.json({
    providers: getProviderDossiers(),
    telephonyStatus: telephony.getBlockerDossier()
  });
});

// ---------------------------------------------------------------------------
// 16. Health & Diagnostic Check
// ---------------------------------------------------------------------------
v1Router.get('/health', (req: Request, res: Response) => {
  const health = checkSystemHealth(!!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json(health);
});
