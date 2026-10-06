import { SpecimenTicket, TravelClass } from '../types/railway';

const STORAGE_KEY = 'railone_specimen_bookings_v1';
let memoryStore: SpecimenTicket[] = [];

export class MockBookingStore {
  private static getStore(): SpecimenTicket[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = window.localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      }
    } catch {
      // fallback
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

  static createSpecimenBooking(params: {
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
  }): SpecimenTicket {
    const pnrMock = 'MOCK-' + Math.floor(1000000000 + Math.random() * 9000000000);
    const id = 'TKT-' + Date.now().toString(36).toUpperCase();
    const now = new Date().toISOString();

    const qrPayload = JSON.stringify({
      disclaimer: 'EDUCATIONAL SPECIMEN ONLY - NOT VALID FOR ACTUAL TRAVEL',
      pnr: pnrMock,
      trn: params.trainNumber,
      from: params.fromCode,
      to: params.toCode,
      cls: params.classBooked,
      psg: params.passengers.length,
      fare: params.fare,
      issued: now
    });

    const ticket: SpecimenTicket = {
      id,
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
      paymentStatus: 'PAID_MOCK',
      paymentMethod: params.paymentMethod,
      qrPayload
    };

    const current = this.getStore();
    current.unshift(ticket);
    this.saveStore(current);

    return ticket;
  }

  static listBookings(): SpecimenTicket[] {
    return this.getStore();
  }

  static cancelBooking(ticketId: string): { success: boolean; refundAmount: number; message: string } {
    const list = this.getStore();
    const item = list.find(t => t.id === ticketId);
    if (!item) {
      return { success: false, refundAmount: 0, message: 'Ticket not found in specimen database.' };
    }

    if (item.paymentStatus === 'CANCELLED_REFUNDED') {
      return { success: false, refundAmount: 0, message: 'Ticket has already been refunded.' };
    }

    // Cancellation policy: Full simulated refund minus ₹0 clerical deduction for educational prototype
    const refundAmount = item.farePaid;
    item.paymentStatus = 'CANCELLED_REFUNDED';
    item.refundAmount = refundAmount;
    item.cancellationTimestamp = new Date().toISOString();

    this.saveStore(list);
    return {
      success: true,
      refundAmount,
      message: `Ticket ${item.pnrMock} successfully cancelled. ₹${refundAmount} refunded to simulated ${item.paymentMethod}.`
    };
  }
}
