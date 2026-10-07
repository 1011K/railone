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

  // 2. Train and stations resolution
  const train = getTrainTrip(req.trainNumber);
  if (!train) {
    throw new Error(`Train ${req.trainNumber} not found.`);
  }

  const fromStation = getStationByCode(req.fromStationCode);
  const toStation = getStationByCode(req.toStationCode);
  if (!fromStation || !toStation) {
    throw new Error(`Invalid origin (${req.fromStationCode}) or destination (${req.toStationCode}).`);
  }

  if (!req.passengers || req.passengers.length === 0) {
    throw new Error('At least one passenger is required.');
  }

  // 3. Stop sequence, direction, and fare computation
  const isSuburban = train.serviceType.startsWith('suburban_');
  const isMetro = train.serviceType === 'suburban_ac_slow' && fromStation.line === 'metro';

  if (!isSuburban && !train.availableClasses.includes(req.classBooked)) {
    throw new Error(`Class ${req.classBooked} is not available on train ${train.trainNumber} (${train.trainName}). Available classes: ${train.availableClasses.join(', ')}.`);
  }

  const fromStopIdx = train.stops.findIndex(s => s.stationCode.toUpperCase() === fromStation.code.toUpperCase());
  const toStopIdx = train.stops.findIndex(s => s.stationCode.toUpperCase() === toStation.code.toUpperCase());

  if (fromStopIdx === -1 || toStopIdx === -1) {
    if (!isSuburban) {
      throw new Error(`Train ${train.trainNumber} (${train.trainName}) does not call at ${fromStopIdx === -1 ? fromStation.name : toStation.name}.`);
    }
  } else if (fromStopIdx >= toStopIdx) {
    if (!isSuburban) {
      throw new Error(`Invalid travel direction: Train ${train.trainNumber} runs from ${train.originStation} to ${train.destinationStation}, and does not call at ${toStation.name} after ${fromStation.name}. Destination ${toStation.name} does not occur after origin ${fromStation.name}.`);
    }
  }

  let distanceKm = 34;
  if (fromStopIdx !== -1 && toStopIdx !== -1) {
    distanceKm = Math.abs(train.stops[toStopIdx].distanceKm - train.stops[fromStopIdx].distanceKm) || 34;
  } else {
    // Cross-line suburban or transfer connection
    distanceKm = calculateStationDistance(fromStation.code, toStation.code);
  }

  let unitFare = 10;
  if (isMetro) {
    unitFare = calculateMetroFare(distanceKm).totalFare;
  } else if (isSuburban) {
    unitFare = calculateSuburbanFare(distanceKm, req.classBooked).totalFare;
  } else {
    unitFare = calculateExpressFare(distanceKm, req.classBooked, train.serviceType === 'superfast').totalFare;
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
    train: train.trainNumber,
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

  stmt.run(
    bookingId,
    req.idempotencyKey || null,
    req.passengerProfileId || null,
    pnr,
    now,
    req.journeyDate,
    train.serviceType,
    train.trainNumber,
    train.trainName,
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

  logAuditEvent({
    eventType: 'BOOKING_CREATED',
    actor: req.passengerProfileId || 'guest',
    entityType: 'BOOKING',
    entityId: bookingId,
    payload: { pnr, totalFare, bookingState, trainNumber: train.trainNumber }
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

export function reconcileBooking(id: string): BookingRecord {
  const db = getDatabase();
  const existing = getBookingById(id);
  if (!existing) {
    throw new Error(`Booking ${id} not found.`);
  }

  if (existing.bookingState === 'TICKET_ISSUED_DEMO') {
    return existing;
  }

  const now = new Date().toISOString();
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
  const rand = Math.floor(100000 + Math.random() * 900000);
  const time = Date.now().toString().slice(-6);
  return `UTS${time}${rand}`;
}

function generatePnr(): string {
  const prefix = Math.floor(100 + Math.random() * 900);
  const suffix = Math.floor(1000000 + Math.random() * 9000000);
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
