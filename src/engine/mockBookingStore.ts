import { SpecimenTicket, TravelClass, BookingState, RefundBreakdown } from '../types/railway';

const STORAGE_KEY = 'railone_specimen_bookings_v2';
const IDEMPOTENCY_KEY_CACHE = 'railone_idempotency_cache_v2';

let memoryStore: SpecimenTicket[] = [];
let idempotencyMap: Record<string, string> = {}; // idempotencyKey -> ticketId

export interface CreateBookingParams {
  idempotencyKey?: string;
  trainNumber: string;
  trainName: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  classBooked: TravelClass;
  fare: number;
  passengers: Array<{ name: string; age: number; gender: string; berthOrCoachMock?: string }>;
  paymentMethod: string;
  simulateAmbiguousTimeout?: boolean; // Demo failure recovery toggle
}

export interface ReconcileResult {
  success: boolean;
  ticket?: SpecimenTicket;
  message: string;
  wasAlreadyIssued: boolean;
}

export class MockBookingStore {
  private static getStore(): SpecimenTicket[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = window.localStorage.getItem(STORAGE_KEY);
        if (data) return JSON.parse(data);
      }
    } catch {
      // fallback to memory
    }
    return memoryStore;
  }

  private static saveStore(bookings: SpecimenTicket[]): void {
    memoryStore = bookings;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
      }
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  private static getIdempotencyMap(): Record<string, string> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = window.localStorage.getItem(IDEMPOTENCY_KEY_CACHE);
        if (data) return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return idempotencyMap;
  }

  private static saveIdempotencyMap(map: Record<string, string>): void {
    idempotencyMap = map;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(IDEMPOTENCY_KEY_CACHE, JSON.stringify(map));
      }
    } catch {
      // ignore
    }
  }

  /**
   * Idempotent Specimen Booking Creation
   * Protects against duplicate network taps and double payment submissions.
   */
  static createSpecimenBooking(params: CreateBookingParams): {
    ticket: SpecimenTicket;
    isDuplicateSubmission: boolean;
    bookingState: BookingState;
  } {
    const store = this.getStore();
    const idempMap = this.getIdempotencyMap();

    // 1. Idempotency Check: if idempotencyKey already processed, return existing ticket
    if (params.idempotencyKey && idempMap[params.idempotencyKey]) {
      const existingTicketId = idempMap[params.idempotencyKey];
      const existing = store.find(t => t.id === existingTicketId);
      if (existing) {
        return {
          ticket: existing,
          isDuplicateSubmission: true,
          bookingState: existing.bookingState || 'TICKET_ISSUED_DEMO'
        };
      }
    }

    const pnrMock = 'MOCK-' + Math.floor(1000000000 + Math.random() * 9000000000);
    const id = 'TKT-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000);
    const now = new Date().toISOString();

    const qrPayload = JSON.stringify({
      disclaimer: 'DEMO / NOT VALID FOR TRAVEL - UNOFFICIAL EDUCATIONAL SPECIMEN ONLY',
      pnr: pnrMock,
      trn: params.trainNumber,
      from: params.fromCode,
      to: params.toCode,
      cls: params.classBooked,
      psg: params.passengers.length,
      fare: params.fare,
      issued: now,
      idemp: params.idempotencyKey || id
    });

    // If ambiguous timeout simulation is requested:
    const initialPaymentStatus = params.simulateAmbiguousTimeout 
      ? 'PENDING_RECONCILIATION_DEMO' 
      : 'PAID_MOCK';
    const initialBookingState: BookingState = params.simulateAmbiguousTimeout
      ? 'PENDING_RECONCILIATION_DEMO'
      : 'TICKET_ISSUED_DEMO';

    const ticket: SpecimenTicket = {
      id,
      idempotencyKey: params.idempotencyKey,
      pnrMock,
      bookingTimestamp: now,
      journeyDate: '2026-10-06',
      trainNumber: params.trainNumber,
      trainName: params.trainName,
      fromStation: { code: params.fromCode, name: params.fromName },
      toStation: { code: params.toCode, name: params.toName },
      classBooked: params.classBooked,
      farePaid: params.fare,
      passengers: params.passengers,
      paymentStatus: initialPaymentStatus,
      bookingState: initialBookingState,
      paymentMethod: params.paymentMethod,
      qrPayload
    };

    store.unshift(ticket);
    this.saveStore(store);

    if (params.idempotencyKey) {
      idempMap[params.idempotencyKey] = id;
      this.saveIdempotencyMap(idempMap);
    }

    return {
      ticket,
      isDuplicateSubmission: false,
      bookingState: initialBookingState
    };
  }

  /**
   * Reconcile Ambiguous / Timeout Orders (Scenario 10 & 11)
   * Resolves pending transaction state to prevent duplicate repurchase.
   */
  static reconcilePendingOrder(identifier: string): ReconcileResult {
    const store = this.getStore();
    const ticket = store.find(t => t.id === identifier || t.idempotencyKey === identifier || t.pnrMock === identifier);

    if (!ticket) {
      return {
        success: false,
        message: 'No pending order found matching transaction reference.',
        wasAlreadyIssued: false
      };
    }

    if (ticket.paymentStatus === 'CANCELLED_REFUNDED' || ticket.bookingState === 'REFUNDED_DEMO' || ticket.bookingState === 'CANCELLED_DEMO') {
      return {
        success: false,
        ticket,
        message: 'Cannot reconcile: order was already cancelled and refunded.',
        wasAlreadyIssued: false
      };
    }

    if (ticket.paymentStatus === 'PAID_MOCK' && ticket.bookingState === 'TICKET_ISSUED_DEMO') {
      return {
        success: true,
        ticket,
        message: 'Order already reconciled and active. Ticket was previously issued.',
        wasAlreadyIssued: true
      };
    }

    // Reconcile from pending to confirmed
    ticket.paymentStatus = 'PAID_MOCK';
    ticket.bookingState = 'TICKET_ISSUED_DEMO';
    this.saveStore(store);

    return {
      success: true,
      ticket,
      message: `Ambiguous transaction reconciled successfully. Specimen ticket ${ticket.pnrMock} restored.`,
      wasAlreadyIssued: false
    };
  }

  static listBookings(): SpecimenTicket[] {
    return this.getStore();
  }

  static getBookingById(id: string): SpecimenTicket | undefined {
    return this.getStore().find(t => t.id === id || t.pnrMock === id);
  }

  /**
   * Cancellation with Explicit Refund Breakdown (Scenario 12)
   * Itemizes simulated cash, wallet, voucher refund, and clerical terms.
   */
  static cancelBooking(
    ticketId: string, 
    preferredRefundType: 'wallet' | 'cash' | 'voucher' = 'wallet'
  ): { 
    success: boolean; 
    refundAmount: number;
    refundBreakdown: RefundBreakdown; 
    message: string 
  } {
    const list = this.getStore();
    const item = list.find(t => t.id === ticketId || t.pnrMock === ticketId || t.idempotencyKey === ticketId);
    
    if (!item) {
      return { 
        success: false, 
        refundAmount: 0,
        refundBreakdown: {
          totalPaid: 0,
          cashRefund: 0,
          walletRefund: 0,
          voucherCredit: 0,
          clericalDeduction: 0,
          refundTimeline: 'Instant (Simulated)',
          termsNotice: 'Ticket not found.'
        }, 
        message: 'Ticket not found in specimen database.' 
      };
    }

    if (item.paymentStatus === 'CANCELLED_REFUNDED') {
      return { 
        success: false, 
        refundAmount: item.refundAmount || item.farePaid,
        refundBreakdown: item.refundBreakdown || {
          totalPaid: item.farePaid,
          cashRefund: 0,
          walletRefund: item.refundAmount || item.farePaid,
          voucherCredit: 0,
          clericalDeduction: 0,
          refundTimeline: 'Completed',
          termsNotice: 'Ticket has already been refunded.'
        }, 
        message: 'Ticket has already been refunded.' 
      };
    }

    const totalPaid = item.farePaid;
    // Clerical deduction: ₹0 in educational prototype
    const clericalDeduction = 0;
    const netRefund = totalPaid - clericalDeduction;

    let cashRefund = 0;
    let walletRefund = 0;
    let voucherCredit = 0;
    let termsNotice = '';

    if (preferredRefundType === 'cash') {
      cashRefund = netRefund;
      termsNotice = 'Simulated Cash Refund: Credited to source bank account in 3-5 business days (Simulated).';
    } else if (preferredRefundType === 'voucher') {
      voucherCredit = netRefund;
      termsNotice = 'Simulated RailVoucher: 100% demo travel credit valid for 90 days. Non-transferable.';
    } else {
      walletRefund = netRefund;
      termsNotice = 'Simulated RailWallet: Instant demonstration wallet credit with zero deduction fees.';
    }

    const breakdown: RefundBreakdown = {
      totalPaid,
      cashRefund,
      walletRefund,
      voucherCredit,
      clericalDeduction,
      refundTimeline: preferredRefundType === 'wallet' ? 'Instant (Simulated)' : '3-5 Business Days (Simulated)',
      termsNotice
    };

    item.paymentStatus = 'CANCELLED_REFUNDED';
    item.bookingState = 'REFUNDED_DEMO';
    item.refundAmount = netRefund;
    item.refundBreakdown = breakdown;
    item.cancellationTimestamp = new Date().toISOString();

    this.saveStore(list);

    return {
      success: true,
      refundAmount: netRefund,
      refundBreakdown: breakdown,
      message: `Specimen ticket ${item.pnrMock} successfully cancelled. ₹${netRefund} refunded via ${preferredRefundType}.`
    };
  }

  /**
   * Reset store (for clean test runs)
   */
  static clearAll(): void {
    memoryStore = [];
    idempotencyMap = {};
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(IDEMPOTENCY_KEY_CACHE);
      }
    } catch {
      // ignore
    }
  }
}
