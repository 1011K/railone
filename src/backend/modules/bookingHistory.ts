import crypto from 'node:crypto';
import { getDatabase } from '../database/db';
import { logAuditEvent } from './auditLog';
import { getBookingById, BookingRecord } from './ticketing';
import { RefundBreakdown } from '../../types/railway';

export interface CancelBookingResult {
  bookingId: string;
  cancelledAt: string;
  refundBreakdown: RefundBreakdown;
  railWalletCredited: boolean;
  voucherCode: string;
}

export function cancelBooking(bookingId: string, reason = 'Passenger requested cancellation', authenticatedPassengerId?: string): CancelBookingResult {
  const db = getDatabase();
  const booking = getBookingById(bookingId);
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found.`);
  }

  if (authenticatedPassengerId && booking.passengerProfileId !== authenticatedPassengerId) {
    throw new Error('Unauthorized: passenger does not own this booking.');
  }

  if (booking.bookingState === 'CANCELLED_DEMO') {
    throw new Error(`Booking ${bookingId} is already cancelled.`);
  }

  const now = new Date().toISOString();
  const totalPaid = booking.farePaid;

  // Official Railway Cancellation & Clerical Deductions (Statutory Gazette Rules)
  let clericalDeduction = 30; // Suburban / 2S standard clerical fee
  if (booking.classBooked === 'SL') clericalDeduction = 60;
  else if (['3A', '2A', '1A', 'CC', 'EC'].includes(booking.classBooked)) clericalDeduction = 120;
  else if (booking.classBooked === 'II') clericalDeduction = 10;

  clericalDeduction = Math.min(clericalDeduction, totalPaid);
  const refundAmount = Math.max(0, totalPaid - clericalDeduction);

  // A refund can go to only one simulated instrument.
  const toBank = /UPI|CARD|BANK/i.test(booking.paymentMethod || '');
  const cashRefund = toBank ? refundAmount : 0;
  const walletRefund = toBank ? 0 : refundAmount;
  const voucherCredit = 0;
  const voucherCode = '';
  const refundBreakdown: RefundBreakdown = {
    totalPaid,
    cashRefund,
    walletRefund,
    voucherCredit,
    clericalDeduction,
    refundTimeline: 'DEMO ONLY: no actual refund or bank transfer takes place.',
    termsNotice: 'Simulated calculation, not an official cancellation charge or refund quote.'
  };

  try {
    db.exec('BEGIN IMMEDIATE;');

    // Update booking record
    const updateBookingStmt = db.prepare(`
      UPDATE bookings SET
        payment_status = 'CANCELLED_REFUNDED',
        booking_state = 'CANCELLED_DEMO',
        updated_at = ?
      WHERE id = ?
    `);
    updateBookingStmt.run(now, bookingId);

    // Update tickets
    const updateTicketStmt = db.prepare(`
      UPDATE tickets SET status = 'CANCELLED' WHERE booking_id = ?
    `);
    updateTicketStmt.run(bookingId);

    // Record cancellation
    const cancelId = 'CANC-' + crypto.randomUUID();
    const cancelStmt = db.prepare(`
      INSERT INTO cancellations (
        id, booking_id, cancelled_at, reason, fare_paid, cash_refund,
        wallet_refund, voucher_credit, clerical_deduction, refund_status, refund_timeline
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    cancelStmt.run(
      cancelId,
      bookingId,
      now,
      reason,
      totalPaid,
      cashRefund,
      walletRefund,
      voucherCredit,
      clericalDeduction,
      'COMPLETED_SIMULATED',
      refundBreakdown.refundTimeline
    );

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
    eventType: 'BOOKING_CANCELLED',
    actor: booking.passengerProfileId || 'guest',
    entityType: 'BOOKING',
    entityId: bookingId,
    payload: { refundAmount, clericalDeduction, voucherCode }
  });

  return {
    bookingId,
    cancelledAt: now,
    refundBreakdown,
    railWalletCredited: !toBank && walletRefund > 0,
    voucherCode
  };
}

export function listBookings(options?: {
  passengerProfileId?: string;
  category?: 'upcoming' | 'current' | 'past' | 'cancelled' | 'all';
  limit?: number;
}): BookingRecord[] {
  const db = getDatabase();
  const limit = options?.limit || 50;
  let rows: any[] = [];

  let query = 'SELECT * FROM bookings WHERE 1=1';
  const params: any[] = [];

  if (options?.passengerProfileId) {
    query += ' AND passenger_profile_id = ?';
    params.push(options.passengerProfileId);
  }

  if (options?.category === 'cancelled') {
    query += " AND booking_state = 'CANCELLED_DEMO'";
  } else if (options?.category === 'upcoming') {
    query += " AND booking_state = 'TICKET_ISSUED_DEMO'";
  }

  query += ' ORDER BY booking_timestamp DESC LIMIT ?';
  params.push(limit);

  const stmt = db.prepare(query);
  rows = stmt.all(...params);

  return rows.map(r => ({
    id: r.id,
    idempotencyKey: r.idempotency_key,
    passengerProfileId: r.passenger_profile_id,
    pnr: r.pnr,
    bookingTimestamp: r.booking_timestamp,
    journeyDate: r.journey_date,
    serviceType: r.service_type,
    trainNumber: r.train_number,
    trainName: r.train_name,
    fromStationCode: r.from_station_code,
    fromStationName: r.from_station_name,
    toStationCode: r.to_station_code,
    toStationName: r.to_station_name,
    classBooked: r.class_booked,
    quota: r.quota,
    farePaid: r.fare_paid,
    passengers: JSON.parse(r.passengers_json),
    paymentStatus: r.payment_status,
    bookingState: r.booking_state,
    paymentMethod: r.payment_method,
    qrPayload: r.qr_payload,
    isSimulated: r.is_simulated === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
}
