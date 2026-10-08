import crypto from 'node:crypto';
import { getDatabase } from '../database/db';
import { logAuditEvent } from './auditLog';
import { getTrainTrip } from './services';
import { getStationByCode } from './stations';
import { calculateSuburbanFare, calculateMetroFare, calculateExpressFare, calculateStationDistance } from './fares';
import { TravelClass, BookingState } from '../../types/railway';

export interface CreateBookingRequest {
  idempotencyKey?: string;
  passengerProfileId?: string;
  trainNumber: string;
  journeyDate: string;
  fromStationCode: string;
  toStationCode: string;
  classBooked: TravelClass;
  ticketType?: 'STANDARD_JOURNEY' | 'RETURN_JOURNEY' | 'SEASON_MST' | 'PLATFORM_TICKET' | 'METRO_TOKEN' | 'UNRESERVED_SUBURBAN';
  quota?: string;
  passengers: Array<{
    name: string;
    age: number;
    gender: string;
    berthOrCoachPreference?: string;
  }>;
  paymentMethod?: string;
  simulateTimeout?: boolean;
}

export interface BookingRecord {
  id: string;
  idempotencyKey?: string;
  passengerProfileId?: string;
  pnr: string;
  bookingTimestamp: string;
  journeyDate: string;
  serviceType: string;
  trainNumber: string;
  trainName: string;
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  classBooked: TravelClass;
  quota: string;
  farePaid: number;
  passengers: Array<{
    name: string;
    age: number;
    gender: string;
    berthOrCoachMock?: string;
  }>;
  paymentStatus: 'PAID_MOCK' | 'PENDING_RECONCILIATION_DEMO' | 'CANCELLED_REFUNDED' | 'FAILED';
  bookingState: BookingState;
  paymentMethod: string;
  qrPayload: string;
  isSimulated: boolean;
  createdAt: string;
  updatedAt: string;
}

export function createBooking(req: CreateBookingRequest): BookingRecord {
  const db = getDatabase();

  // 1. Idempotency check: if existing booking with this key exists, return it immediately
  if (req.idempotencyKey) {
    const existing = getBookingByIdempotencyKey(req.idempotencyKey);
    if (existing) {
      if (existing.passengerProfileId !== req.passengerProfileId) {
        throw new Error('Idempotency key belongs to another passenger.');
      }
      if (existing.trainNumber !== req.trainNumber ||
          existing.journeyDate !== req.journeyDate ||
          existing.fromStationCode !== req.fromStationCode ||
          existing.toStationCode !== req.toStationCode ||
          existing.classBooked !== req.classBooked) {
        throw new Error('Idempotency key was used for another journey.');
      }
      logAuditEvent({
        eventType: 'BOOKING_IDEMPOTENT_HIT',
        actor: req.passengerProfileId || 'guest',
        entityType: 'BOOKING',
        entityId: existing.id,
        payload: { idempotencyKey: req.idempotencyKey }
      });
      return existing;
    }
  }

  const fromStation = getStationByCode(req.fromStationCode);
  const toStation = getStationByCode(req.toStationCode || req.fromStationCode);
  if (!fromStation || !toStation) {
    throw new Error(`Invalid origin (${req.fromStationCode}) or destination (${req.toStationCode}).`);
  }

  if (!req.passengers || req.passengers.length === 0) {
    throw new Error('At least one passenger is required.');
  }

  // 2. Train and service resolution:
  // If specific train requested and exists, bind to it.
  // Otherwise correctly model unreserved journey, return, season, platform, or metro token.
  const reqTrainNum = (req.trainNumber || '').trim();
  const isGenericTrain = !reqTrainNum || ['UNRESERVED', 'UTS-UNRESERVED', 'UTS-RETURN', 'MST-PASS', 'PLATFORM', 'METRO'].includes(reqTrainNum);
  const matchedTrain = !isGenericTrain ? getTrainTrip(reqTrainNum) : null;

  if (!isGenericTrain && !matchedTrain) {
    throw new Error(`Train ${req.trainNumber} not found.`);
  }

  let isSuburban = true;
  let isMetro = false;
  let trainNumber = 'UNRESERVED';
  let trainName = 'Suburban Unreserved Service';
  let serviceType = 'suburban_local';
  let distanceKm: number | null = null;
  let unitFare = 10;

  if (matchedTrain) {
    trainNumber = matchedTrain.trainNumber;
    trainName = matchedTrain.trainName;
    serviceType = matchedTrain.serviceType;
    isSuburban = matchedTrain.serviceType.startsWith('suburban_');
    isMetro = matchedTrain.serviceType === 'suburban_ac_slow' && fromStation.line === 'metro';

    if (!isSuburban && !matchedTrain.availableClasses.includes(req.classBooked)) {
      throw new Error(`Class ${req.classBooked} is not available on train ${matchedTrain.trainNumber} (${matchedTrain.trainName}). Available classes: ${matchedTrain.availableClasses.join(', ')}.`);
    }

    const fromStopIdx = matchedTrain.stops.findIndex(s => s.stationCode.toUpperCase() === fromStation.code.toUpperCase());
    const toStopIdx = matchedTrain.stops.findIndex(s => s.stationCode.toUpperCase() === toStation.code.toUpperCase());

    if (fromStopIdx === -1 || toStopIdx === -1) {
      if (!isSuburban) {
        throw new Error(`Train ${matchedTrain.trainNumber} (${matchedTrain.trainName}) does not call at ${fromStopIdx === -1 ? fromStation.name : toStation.name}.`);
      }
    } else if (fromStopIdx >= toStopIdx) {
      if (!isSuburban) {
        throw new Error(`Invalid travel direction: Train ${matchedTrain.trainNumber} runs from ${matchedTrain.originStation} to ${matchedTrain.destinationStation}, and does not call at ${toStation.name} after ${fromStation.name}. Destination ${toStation.name} does not occur after origin ${fromStation.name}.`);
      }
    }

    if (fromStopIdx !== -1 && toStopIdx !== -1) {
      const d = Math.abs(matchedTrain.stops[toStopIdx].distanceKm - matchedTrain.stops[fromStopIdx].distanceKm);
      if (d > 0) distanceKm = Math.round(d * 10) / 10;
    }
    if (distanceKm === null) {
      distanceKm = calculateStationDistance(fromStation.code, toStation.code);
    }
    if (distanceKm === null || distanceKm <= 0) {
      throw new Error(`Track distance between ${fromStation.name} (${fromStation.code}) and ${toStation.name} (${toStation.code}) is unavailable. Cannot issue ticket without verified track distance.`);
    }

    if (isMetro) {
      unitFare = calculateMetroFare(distanceKm).totalFare;
    } else if (isSuburban) {
      unitFare = calculateSuburbanFare(distanceKm, req.classBooked).totalFare;
    } else {
      unitFare = calculateExpressFare(distanceKm, req.classBooked, matchedTrain.serviceType === 'superfast').totalFare;
    }
  } else if (req.ticketType === 'PLATFORM_TICKET' || reqTrainNum === 'PLATFORM') {
    trainNumber = 'PLATFORM';
    trainName = 'Station Platform Permit';
    serviceType = 'platform';
    distanceKm = 0;
    unitFare = 10; // DEMO placeholder only; official platform-tariff verification pending
  } else if (req.ticketType === 'METRO_TOKEN' || reqTrainNum === 'METRO') {
    trainNumber = 'METRO';
    trainName = 'Mumbai Metro Transit Line';
    serviceType = 'metro';
    isMetro = true;
    isSuburban = false;
    distanceKm = calculateStationDistance(fromStation.code, toStation.code);
    if (distanceKm === null || distanceKm <= 0) {
      throw new Error('Metro station distance is unmapped; refusing to invent a distance or issue a mock fare.');
    }
    unitFare = calculateMetroFare(distanceKm).totalFare;
  } else if (req.ticketType === 'SEASON_MST' || reqTrainNum === 'MST-PASS') {
    trainNumber = 'MST-PASS';
    trainName = 'Suburban Monthly Season Ticket (MST)';
    serviceType = 'suburban_season';
    distanceKm = calculateStationDistance(fromStation.code, toStation.code);
    if (distanceKm === null || distanceKm <= 0) {
      throw new Error(`Track distance between ${fromStation.name} and ${toStation.name} is unavailable.`);
    }
    unitFare = req.classBooked === 'AC_LOCAL' ? 1450 : req.classBooked === 'I' ? 670 : 185;
  } else if (req.ticketType === 'RETURN_JOURNEY' || reqTrainNum === 'UTS-RETURN') {
    trainNumber = 'UTS-RETURN';
    trainName = 'Suburban Return Journey Ticket';
    serviceType = 'suburban_return';
    distanceKm = calculateStationDistance(fromStation.code, toStation.code);
    if (distanceKm === null || distanceKm <= 0) {
      throw new Error(`Track distance between ${fromStation.name} and ${toStation.name} is unavailable.`);
    }
    const singleFare = calculateSuburbanFare(distanceKm, req.classBooked).totalFare;
    unitFare = Math.round(singleFare * 1.9);
  } else {
    // Standard journey-based unreserved suburban ticket (UTS)
    trainNumber = 'UNRESERVED';
    trainName = req.classBooked === 'AC_LOCAL' ? 'Suburban AC Local (Route Journey)' : req.classBooked === 'I' ? 'Suburban First Class (Route Journey)' : 'Suburban Second Class (Route Journey)';
    serviceType = req.classBooked === 'AC_LOCAL' ? 'suburban_ac' : 'suburban_local';
    distanceKm = calculateStationDistance(fromStation.code, toStation.code);
    if (distanceKm === null || distanceKm <= 0) {
      throw new Error(`Track distance between ${fromStation.name} and ${toStation.name} is unavailable.`);
    }
    unitFare = calculateSuburbanFare(distanceKm, req.classBooked).totalFare;
  }

  const totalFare = unitFare * req.passengers.length;

  // 4. Generate identifiers
  const bookingId = 'BK-' + crypto.randomUUID();
  const pnr = generatePnr();
  const now = new Date().toISOString();

  // Assign mock coach/berth or UTS coach
  const passengersWithBerths = req.passengers.map((p, idx) => {
    let berthMock = 'GEN-UNR';
    if (req.classBooked === 'AC_LOCAL') berthMock = `AC-${(idx % 12) + 1}`;
    else if (req.classBooked === 'I') berthMock = `FC-${(idx % 3) + 1}`;
    else if (req.classBooked === 'SL') berthMock = `S${(idx % 7) + 1}/${(idx * 8 + 12) % 72} (MB)`;
    else if (req.classBooked === '3A') berthMock = `B${(idx % 5) + 1}/${(idx * 6 + 15) % 64} (LB)`;
    else if (req.classBooked === '2A') berthMock = `A1/${(idx * 4 + 7) % 48} (UB)`;
    else if (req.classBooked === '1A') berthMock = `H1/Cabin-A/Berth-${idx + 1}`;
    else if (req.classBooked === 'CC') berthMock = `C${(idx % 4) + 1}/Seat-${(idx * 3 + 14) % 75}`;
    else if (req.classBooked === '2S') berthMock = `D${(idx % 6) + 1}/Seat-${(idx * 5 + 21) % 108}`;

    return {
      name: p.name.trim(),
      age: p.age,
      gender: p.gender,
      berthOrCoachMock: berthMock
    };
  });

  const paymentStatus = req.simulateTimeout ? 'PENDING_RECONCILIATION_DEMO' : 'PAID_MOCK';
  const bookingState: BookingState = req.simulateTimeout ? 'PENDING_RECONCILIATION_DEMO' : 'TICKET_ISSUED_DEMO';

  // Secure Cryptographic Watermarked QR Payload
  const qrPayload = JSON.stringify({
    specimen: 'DEMO / NOT VALID FOR TRAVEL',
    pnr,
    train: trainNumber,
    from: fromStation.code,
    to: toStation.code,
    date: req.journeyDate,
    class: req.classBooked,
    fare: totalFare,
    passengersCount: req.passengers.length,
    hash: crypto.createHash('sha256').update(`${pnr}:${totalFare}:${now}`).digest('hex').slice(0, 16)
  });

  const stmt = db.prepare(`
    INSERT INTO bookings (
      id, idempotency_key, passenger_profile_id, pnr, booking_timestamp, journey_date,
      service_type, train_number, train_name, from_station_code, from_station_name,
      to_station_code, to_station_name, class_booked, quota, fare_paid,
      passengers_json, payment_status, booking_state, payment_method, qr_payload,
      is_simulated, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  try {
    db.exec('BEGIN IMMEDIATE;');

    stmt.run(
      bookingId,
      req.idempotencyKey || null,
      req.passengerProfileId || null,
      pnr,
      now,
      req.journeyDate,
      serviceType,
      trainNumber,
      trainName,
      fromStation.code,
      fromStation.name,
      toStation.code,
      toStation.name,
      req.classBooked,
      req.quota || 'GN',
      totalFare,
      JSON.stringify(passengersWithBerths),
      paymentStatus,
      bookingState,
      req.paymentMethod || 'UPI_SIMULATED',
      qrPayload,
      1,
      now,
      now
    );

    // If issued, create ticket record
    if (bookingState === 'TICKET_ISSUED_DEMO') {
      const ticketId = 'TCK-' + crypto.randomUUID();
      const ticketNumber = generateTicketNumber();
      const tstmt = db.prepare(`
        INSERT INTO tickets (id, booking_id, ticket_number, issued_at, status, qr_payload, is_simulated)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      tstmt.run(ticketId, bookingId, ticketNumber, now, 'ACTIVE', qrPayload, 1);
    }

    db.exec('COMMIT;');
  } catch (err: any) {
    try {
      db.exec('ROLLBACK;');
    } catch {
      // ignore
    }
    if (req.idempotencyKey) {
      const existing = getBookingByIdempotencyKey(req.idempotencyKey);
      if (existing) return existing;
    }
    throw err;
  }

  logAuditEvent({
    eventType: 'BOOKING_CREATED',
    actor: req.passengerProfileId || 'guest',
    entityType: 'BOOKING',
    entityId: bookingId,
    payload: { pnr, totalFare, bookingState, trainNumber }
  });

  return getBookingById(bookingId)!;
}

export function getBookingById(id: string): BookingRecord | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM bookings WHERE id = ?');
  const row: any = stmt.get(id);
  if (!row) return null;
  return mapBookingRow(row);
}

export function getBookingByPnr(pnr: string): BookingRecord | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM bookings WHERE pnr = ?');
  const row: any = stmt.get(pnr);
  if (!row) return null;
  return mapBookingRow(row);
}

export function getBookingByIdempotencyKey(key: string): BookingRecord | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM bookings WHERE idempotency_key = ?');
  const row: any = stmt.get(key);
  if (!row) return null;
  return mapBookingRow(row);
}

export function reconcileBooking(id: string, authenticatedPassengerId?: string): BookingRecord {
  const db = getDatabase();
  const existing = getBookingById(id);
  if (!existing) {
    throw new Error(`Booking ${id} not found.`);
  }

  if (authenticatedPassengerId && existing.passengerProfileId && existing.passengerProfileId !== authenticatedPassengerId) {
    throw new Error(`Unauthorized: passenger does not own booking ${id}.`);
  }

  if (existing.bookingState === 'TICKET_ISSUED_DEMO') {
    return existing;
  }

  const now = new Date().toISOString();

  try {
    db.exec('BEGIN IMMEDIATE;');

    const stmt = db.prepare(`
      UPDATE bookings SET
        payment_status = 'PAID_MOCK',
        booking_state = 'TICKET_ISSUED_DEMO',
        updated_at = ?
      WHERE id = ?
    `);
    stmt.run(now, id);

    // Check if ticket already exists
    const existingTicket: any = db.prepare('SELECT id FROM tickets WHERE booking_id = ?').get(id);
    if (!existingTicket) {
      const ticketId = 'TCK-' + crypto.randomUUID();
      const ticketNumber = generateTicketNumber();
      const tstmt = db.prepare(`
        INSERT INTO tickets (id, booking_id, ticket_number, issued_at, status, qr_payload, is_simulated)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      tstmt.run(ticketId, id, ticketNumber, now, 'ACTIVE', existing.qrPayload, 1);
    }

    db.exec('COMMIT;');
  } catch (err: any) {
    try {
      db.exec('ROLLBACK;');
    } catch {
      // ignore
    }
    throw err;
  }

  logAuditEvent({
    eventType: 'PAYMENT_RECONCILED',
    actor: existing.passengerProfileId || 'system',
    entityType: 'BOOKING',
    entityId: id,
    payload: { previousState: existing.bookingState, newState: 'TICKET_ISSUED_DEMO' }
  });

  return getBookingById(id)!;
}

function generateTicketNumber(): string {
  const rand = crypto.randomInt(100000, 1000000);
  const time = Date.now().toString().slice(-6);
  return `UTS${time}${rand}`;
}

function generatePnr(): string {
  const prefix = crypto.randomInt(100, 1000);
  const suffix = crypto.randomInt(1000000, 10000000);
  return `${prefix}-${suffix}`;
}

function mapBookingRow(row: any): BookingRecord {
  return {
    id: row.id,
    idempotencyKey: row.idempotency_key,
    passengerProfileId: row.passenger_profile_id,
    pnr: row.pnr,
    bookingTimestamp: row.booking_timestamp,
    journeyDate: row.journey_date,
    serviceType: row.service_type,
    trainNumber: row.train_number,
    trainName: row.train_name,
    fromStationCode: row.from_station_code,
    fromStationName: row.from_station_name,
    toStationCode: row.to_station_code,
    toStationName: row.to_station_name,
    classBooked: row.class_booked as TravelClass,
    quota: row.quota,
    farePaid: row.fare_paid,
    passengers: JSON.parse(row.passengers_json),
    paymentStatus: row.payment_status,
    bookingState: row.booking_state as BookingState,
    paymentMethod: row.payment_method,
    qrPayload: row.qr_payload,
    isSimulated: row.is_simulated === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
