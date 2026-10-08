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
import { 
  authenticatePassenger, 
  optionalPassengerAuth, 
  verifyOwnership, 
  issuePassengerToken, 
  AuthenticatedRequest 
} from '../middleware/auth';
import { MultimodalGraphEngine } from '../../engine/multimodal/graphEngine';
import { getAllCityPacks, getCityPack } from '../../engine/multimodal/cityPacks';

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
    timeWindowMinutes: req.query.timeWindowMinutes ? parseInt(req.query.timeWindowMinutes as string, 10) : undefined,
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
  let dist = distanceKm ? Number(distanceKm) : null;
  if (dist === null && orig && dest) {
    dist = calculateStationDistance(orig, dest);
  }

  if (dist === null || isNaN(dist) || dist <= 0) {
    return res.status(400).json({
      error: 'DISTANCE_UNAVAILABLE',
      message: `Track distance between ${orig || 'unknown origin'} and ${dest || 'unknown destination'} is unmapped. Official fare cannot be fabricated without verified distance.`
    });
  }

  let quote;
  try {
    if (serviceType === 'metro') {
      quote = calculateMetroFare(dist);
    } else if (serviceType === 'express') {
      quote = calculateExpressFare(dist, travelClass as TravelClass, !!isSuperfast);
    } else {
      quote = calculateSuburbanFare(dist, travelClass as TravelClass);
    }
  } catch (err: any) {
    return res.status(400).json({ error: 'FARE_CALCULATION_ERROR', message: err.message });
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
  const { currentStationCode, destinationStationCode, delayedTrainNumber, reportedDelayMinutes, departureTime } = req.body;
  if (!currentStationCode || !destinationStationCode) {
    return res.status(400).json({ error: 'INVALID_PARAMS', message: 'currentStationCode and destinationStationCode are required.' });
  }

  const result = evaluateDisruptionReplan({
    currentStationCode,
    destinationStationCode,
    delayedTrainNumber,
    reportedDelayMinutes,
    departureTime
  });

  res.json(result);
});

// ---------------------------------------------------------------------------
// 8. Bookings & Ticketing (Server-Side Transactions & Authorization)
// ---------------------------------------------------------------------------
v1Router.post('/bookings', authenticatePassenger, (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestedProfileId = req.body.passengerProfileId;
    if (requestedProfileId && (!req.authenticatedPassengerId || req.authenticatedPassengerId !== requestedProfileId)) {
      if (!req.authenticatedPassengerId) {
        return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Authentication token required to bind booking to a passenger profile.'
        });
      }
      return res.status(403).json({
        error: 'FORBIDDEN_CROSS_USER_ACCESS',
        message: 'Cross-user data access denied: you cannot create a booking on behalf of another passenger profile.'
      });
    }

    const idempotencyKey = (req.headers['x-idempotency-key'] as string) || req.body.idempotencyKey;
    const passengerProfileId = req.authenticatedPassengerId || undefined;
    const booking = createBooking({
      ...req.body,
      passengerProfileId,
      idempotencyKey
    });
    res.status(201).json({ booking });
  } catch (err: any) {
    res.status(400).json({ error: 'BOOKING_CREATION_FAILED', message: err.message });
  }
});

v1Router.get('/bookings', authenticatePassenger, (req: AuthenticatedRequest, res: Response) => {
  const passengerProfileId = req.authenticatedPassengerId!;
  const category = (req.query?.category as any) || 'all';
  const bookings = listBookings({ passengerProfileId, category });
  res.json({ count: bookings.length, bookings });
});

v1Router.get('/bookings/:id', authenticatePassenger, (req: AuthenticatedRequest, res: Response) => {
  const booking = getBookingById(req.params.id) || getBookingByPnr(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'BOOKING_NOT_FOUND', message: `Booking ${req.params.id} not found.` });
  }

  if (!booking.passengerProfileId || booking.passengerProfileId !== req.authenticatedPassengerId) {
    return res.status(403).json({
      error: 'FORBIDDEN_CROSS_USER_ACCESS',
      message: 'Unclaimed or other passenger booking records are not accessible.'
    });
  }

  res.json({ booking });
});

v1Router.post('/bookings/:id/reconcile', authenticatePassenger, (req: AuthenticatedRequest, res: Response) => {
  try {
    const booking = getBookingById(req.params.id) || getBookingByPnr(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'BOOKING_NOT_FOUND', message: `Booking ${req.params.id} not found.` });
    }

    if (!booking.passengerProfileId || booking.passengerProfileId !== req.authenticatedPassengerId) {
      return res.status(403).json({
        error: 'FORBIDDEN_CROSS_USER_ACCESS',
        message: 'Cross-user data access denied: you cannot reconcile a transaction belonging to another passenger.'
      });
    }

    const reconciled = reconcileBooking(booking.id, req.authenticatedPassengerId);
    res.json({ booking: reconciled, message: 'Transaction reconciled successfully.' });
  } catch (err: any) {
    res.status(400).json({ error: 'RECONCILIATION_FAILED', message: err.message });
  }
});

v1Router.get('/tickets', authenticatePassenger, (req: AuthenticatedRequest, res: Response) => {
  // Enforce caller's own profile ID to strictly prevent cross-user ticket leakage
  const passengerProfileId = req.authenticatedPassengerId!;
  const category = (req.query.category as any) || 'all';
  const tickets = listBookings({ passengerProfileId, category });
  res.json({ count: tickets.length, tickets });
});

v1Router.get('/tickets/:id', authenticatePassenger, (req: AuthenticatedRequest, res: Response) => {
  const booking = getBookingById(req.params.id) || getBookingByPnr(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'TICKET_NOT_FOUND', message: `Ticket ${req.params.id} not found.` });
  }

  if (!booking.passengerProfileId || booking.passengerProfileId !== req.authenticatedPassengerId) {
    return res.status(403).json({
      error: 'FORBIDDEN_CROSS_USER_ACCESS',
      message: 'Cross-user data access denied: you do not have authorization to view this ticket.'
    });
  }

  res.json({ ticket: booking });
});

v1Router.post('/tickets/:id/cancel', authenticatePassenger, (req: AuthenticatedRequest, res: Response) => {
  try {
    const booking = getBookingById(req.params.id) || getBookingByPnr(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'TICKET_NOT_FOUND', message: `Ticket ${req.params.id} not found.` });
    }

    if (!booking.passengerProfileId || booking.passengerProfileId !== req.authenticatedPassengerId) {
      return res.status(403).json({
        error: 'FORBIDDEN_CROSS_USER_ACCESS',
        message: 'Cross-user data access denied: you cannot cancel a ticket belonging to another passenger.'
      });
    }

    const reason = (req.body.reason as string) || 'Passenger voluntary cancellation';
    const result = cancelBooking(booking.id, reason, req.authenticatedPassengerId);
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
// 12. Passenger Profiles & Token Authorization
// ---------------------------------------------------------------------------
v1Router.post('/passengers', (req: Request, res: Response) => {
  try {
    const profile = createPassengerProfile(req.body);
    const token = issuePassengerToken(profile.id);
    res.status(201).json({ profile, token });
  } catch (err: any) {
    res.status(400).json({ error: 'PROFILE_CREATION_FAILED', message: err.message });
  }
});

// Possessing a profile ID proves nothing. Disable ID-only token renewal until a
// verified sign-in method exists; demo profiles obtain a token at creation.
v1Router.post('/auth/token', (_req: Request, res: Response) => {
  res.status(403).json({
    error: 'IDENTITY_VERIFICATION_REQUIRED',
    message: 'Profile-ID-only token issuance has been disabled. Create a new demo profile or use a verified sign-in.'
  });
});

v1Router.get('/passengers/:id', authenticatePassenger, (req: AuthenticatedRequest, res: Response) => {
  if (req.authenticatedPassengerId !== req.params.id) {
    return res.status(403).json({
      error: 'FORBIDDEN_CROSS_USER_ACCESS',
      message: 'Cross-user data access denied: you cannot view another passenger’s profile.'
    });
  }

  const profile = getPassengerProfile(req.params.id);
  if (!profile) {
    return res.status(404).json({ error: 'PROFILE_NOT_FOUND', message: `Profile ${req.params.id} not found.` });
  }
  res.json({ profile });
});

v1Router.put('/passengers/:id', authenticatePassenger, (req: AuthenticatedRequest, res: Response) => {
  if (req.authenticatedPassengerId !== req.params.id) {
    return res.status(403).json({
      error: 'FORBIDDEN_CROSS_USER_ACCESS',
      message: 'Cross-user data access denied: you cannot update another passenger’s profile.'
    });
  }

  const updated = updatePassengerProfile(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'PROFILE_NOT_FOUND', message: `Profile ${req.params.id} not found.` });
  }
  res.json({ profile: updated });
});

// ---------------------------------------------------------------------------
// 13. Notifications
// ---------------------------------------------------------------------------
v1Router.get('/notifications', authenticatePassenger, (req: AuthenticatedRequest, res: Response) => {
  // Strictly isolate notifications to authenticated passenger
  const profileId = req.authenticatedPassengerId!;
  const notifications = getNotifications(profileId);
  res.json({ count: notifications.length, notifications });
});

v1Router.post('/notifications', authenticatePassenger, (req: AuthenticatedRequest, res: Response) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim().slice(0, 160) : '';
  const body = typeof req.body?.body === 'string' ? req.body.body.trim().slice(0, 1500) : '';
  if (!title || !body) return res.status(400).json({ error: 'INVALID_NOTIFICATION' });
  // Caller cannot write into a different passenger's notification inbox.
  const notif = sendNotification({ title, body, passengerProfileId: req.authenticatedPassengerId });
  res.status(201).json({ notification: notif });
});

// ---------------------------------------------------------------------------
// 14. Audit Logs & Observability
// ---------------------------------------------------------------------------
// This is administrative data, not a passenger API. Re-enable after admin roles exist.
v1Router.get('/audit/logs', (_req: Request, res: Response) => {
  res.status(403).json({ error: 'ADMIN_ACCESS_NOT_CONFIGURED' });
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

// ---------------------------------------------------------------------------
// 17. Multimodal Routing & City Packs Architecture
// ---------------------------------------------------------------------------
v1Router.get('/multimodal/cities', (_req: Request, res: Response) => {
  const packs = getAllCityPacks();
  res.json({
    count: packs.length,
    cities: packs.map(p => ({
      cityId: p.cityId,
      name: p.name,
      nativeName: p.nativeName,
      state: p.state,
      tier: p.tier,
      nodeCount: p.nodes.length,
      edgeCount: p.edges.length,
      manifestCount: p.coverageManifest.length,
      coverageManifest: p.coverageManifest
    }))
  });
});

v1Router.get('/multimodal/city/:cityId', (req: Request, res: Response) => {
  const pack = getCityPack(req.params.cityId);
  if (!pack) {
    return res.status(404).json({ error: 'CITY_NOT_FOUND', message: `City pack ${req.params.cityId} not found.` });
  }
  res.json({ cityPack: pack });
});

v1Router.get('/multimodal/plan', (req: Request, res: Response) => {
  const origin = req.query.origin as string;
  const destination = req.query.destination as string;
  const city = (req.query.city as string) || 'mumbai';

  if (!origin || !destination) {
    return res.status(400).json({ error: 'INVALID_PARAMS', message: 'origin and destination parameters are required.' });
  }

  try {
    const engine = new MultimodalGraphEngine(city);
    const accessibleStepFree = req.query.accessibleStepFree === 'true' || req.query.accessibleStepFree === '1';
    const acOnly = req.query.acOnly === 'true' || req.query.acOnly === '1';
    const expressThreshold = req.query.expressAdvantageThresholdMinutes 
      ? parseInt(req.query.expressAdvantageThresholdMinutes as string, 10) 
      : 15;
    
    const preferredModes = req.query.preferredModes 
      ? (req.query.preferredModes as string).split(',').map(m => m.trim() as any) 
      : undefined;
    const excludedModes = req.query.excludedModes 
      ? (req.query.excludedModes as string).split(',').map(m => m.trim() as any) 
      : undefined;

    const itineraries = engine.planJourney({
      cityId: city,
      origin,
      destination,
      departureTime: (req.query.departureTime as string) ||
        new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()),
      serviceDate: req.query.date as string,
      preferences: {
        priority: req.query.priority as any,
        accessibleStepFree,
        acOnly,
        expressAdvantageThresholdMinutes: expressThreshold,
        preferredModes,
        excludedModes
      }
    });

    res.json({
      city,
      origin,
      destination,
      note: 'Research demonstration: travel times and fares are modeled estimates, not guaranteed departures or live availability.',
      count: itineraries.length,
      itineraries
    });
  } catch (err: any) {
    res.status(500).json({ error: 'ROUTING_FAILED', message: err.message || 'Multimodal routing calculation failed.' });
  }
});

