import { TravelClass } from '../types/railway';
import { OfflineStorage, CachedTicketRecord } from '../storage/offlineStorage';
import { STATUTORY_REGULATIONS } from '../constants/regulations';

export type TteValidationStatus = 'VALID' | 'EXPIRED' | 'CLASS_MISMATCH' | 'NOT_FOUND';

export interface TteInspectionContext {
  inspectedTrainNumber?: string;
  inspectedCoachClass?: TravelClass | string;
  isInspectingExpressTrain?: boolean;
  inspectionDate?: string;
  inspectionTime?: string;
}

export interface TteVerificationResult {
  status: TteValidationStatus;
  statusCode: string;
  summary: string;
  passengerDetails?: {
    pnr: string;
    ticketId?: string;
    trainNumber?: string;
    trainName?: string;
    originStationCode: string;
    originStationName: string;
    destinationStationCode: string;
    destinationStationName: string;
    travelClass: TravelClass | string;
    quota: string;
    passengersCount: number;
    farePaid: number;
    issuedAt?: string;
    journeyDate?: string;
    isMST?: boolean;
  };
  regulatoryCompliance: {
    section137Violation: boolean;
    section138Violation: boolean;
    excessFarePayable: number;
    penaltyCharge: number;
    totalAmountDue: number;
    statutoryCitation: string;
    actionRequired: string;
  };
  disclaimer: string;
  isOfflineDemonstration: boolean;
}

export const TTE_DEMO_DISCLAIMER =
  'OFFLINE DEMONSTRATION VALIDATOR: For technical demonstration only. Official statutory ticket verification is performed exclusively via official Handheld Terminals (HHT).';

export const SPECIMEN_TEST_PAYLOADS = {
  validSuburban: JSON.stringify({
    specimen: 'DEMO / NOT VALID FOR TRAVEL',
    pnr: '842-1948201',
    train: '95112',
    from: 'KYN',
    to: 'CSMT',
    date: '2026-10-07',
    class: 'II',
    quota: 'GN',
    fare: 20,
    passengersCount: 1,
    hash: 'a1b2c3d4e5f60718'
  }),
  validAcLocal: JSON.stringify({
    specimen: 'DEMO / NOT VALID FOR TRAVEL',
    pnr: '820-4491023',
    train: '90240',
    from: 'BVI',
    to: 'CCG',
    date: '2026-10-07',
    class: 'AC_LOCAL',
    quota: 'GN',
    fare: 135,
    passengersCount: 1,
    hash: 'f9e8d7c6b5a41234'
  }),
  expiredTicket: JSON.stringify({
    specimen: 'DEMO / NOT VALID FOR TRAVEL',
    pnr: '711-3091845',
    train: '97045',
    from: 'TNA',
    to: 'CSMT',
    date: '2026-10-01',
    class: 'II',
    quota: 'GN',
    fare: 15,
    passengersCount: 1,
    hash: 'b0a1c2d3e4f56789'
  }),
  suburbanMstInExpress: JSON.stringify({
    specimen: 'DEMO / NOT VALID FOR TRAVEL - SUBURBAN MST',
    pnr: 'MST-2026-4910',
    train: 'MST_SUBURBAN_ANY',
    from: 'TNA',
    to: 'CSMT',
    date: '2026-10-07',
    class: 'II',
    quota: 'GN',
    fare: 150,
    passengersCount: 1,
    isMST: true,
    hash: 'c8d7e6f5a4b32109'
  }),
  forgedOrNotFound: 'INVALID-QR-SIGNATURE-UNKNOWN-PNR-XYZ'
};

export function validateTicketPayload(
  rawInput: string,
  context: TteInspectionContext = {},
  fallbackTickets: any[] = []
): TteVerificationResult {
  const trimmed = (rawInput || '').trim();

  if (!trimmed) {
    return {
      status: 'NOT_FOUND',
      statusCode: 'PAYLOAD_EMPTY',
      summary: 'No ticket data provided. Please scan a specimen QR code or enter a PNR reference.',
      regulatoryCompliance: {
        section137Violation: true,
        section138Violation: false,
        excessFarePayable: 0,
        penaltyCharge: 500,
        totalAmountDue: 500,
        statutoryCitation: 'Section 137 Indian Railways Act: Passenger travelling without valid ticket.',
        actionRequired: 'Issue EFT (Excess Fare Ticket) or refer to Station Superintendent / RPF.'
      },
      disclaimer: TTE_DEMO_DISCLAIMER,
      isOfflineDemonstration: true
    };
  }

  let parsed: any = null;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    if (trimmed.includes('PNR=')) {
      parsed = {};
      const pairs = trimmed.replace(/^RAILONE-DEMO:/i, '').split(';');
      for (const p of pairs) {
        const [k, v] = p.split('=');
        if (k && v) {
          if (k.toUpperCase() === 'PNR') parsed.pnr = v;
          if (k.toUpperCase() === 'FROM') parsed.from = v;
          if (k.toUpperCase() === 'TO') parsed.to = v;
          if (k.toUpperCase() === 'CLASS' || k.toUpperCase() === 'CLS') parsed.class = v;
          if (k.toUpperCase() === 'FARE') parsed.fare = Number(v);
        }
      }
    }
  }

  // Check offline storage cached tickets if not parsed
  const combinedTickets = [...fallbackTickets, ...OfflineStorage.getTickets()];
  if (!parsed || !parsed.pnr) {
    const matched = combinedTickets.find(
      (t: any) =>
        (t.pnr && t.pnr.toUpperCase() === trimmed.toUpperCase()) ||
        (t.id && t.id.toUpperCase() === trimmed.toUpperCase()) ||
        (t.pnrMock && t.pnrMock.toUpperCase() === trimmed.toUpperCase())
    );

    if (matched) {
      parsed = {
        pnr: matched.pnr || matched.pnrMock || matched.id,
        ticketId: matched.id,
        train: matched.trainNumber,
        trainName: matched.trainName,
        from: matched.fromStationName || matched.fromStationCode || 'CSMT',
        to: matched.toStationName || matched.toStationCode || 'KYN',
        date: matched.journeyDate || '2026-10-07',
        class: matched.classBooked || 'II',
        quota: matched.quota || 'GN',
        fare: matched.farePaid || 20,
        passengersCount: 1,
        isMST: Boolean(matched.isMST),
        paymentStatus: matched.paymentStatus
      };
    }
  }

  if (!parsed || !parsed.pnr) {
    return {
      status: 'NOT_FOUND',
      statusCode: 'TICKET_NOT_FOUND',
      summary: `Ticket reference "${trimmed}" is not recognized in offline manifest records or cryptographic store.`,
      regulatoryCompliance: {
        section137Violation: true,
        section138Violation: false,
        excessFarePayable: 0,
        penaltyCharge: 500,
        totalAmountDue: 500,
        statutoryCitation: 'Section 137 Indian Railways Act: Unlawful transit without validated ticket.',
        actionRequired: 'Assess origin station, levy statutory excess fare plus penalty fine.'
      },
      disclaimer: TTE_DEMO_DISCLAIMER,
      isOfflineDemonstration: true
    };
  }

  const fromCode = (parsed.from || parsed.fromCode || 'CSMT').toUpperCase();
  const toCode = (parsed.to || parsed.toCode || 'KYN').toUpperCase();
  const ticketClass = (parsed.class || parsed.cls || 'II').toUpperCase();
  const ticketDate = parsed.date || parsed.journeyDate || '2026-10-07';
  const currentDate = context.inspectionDate || '2026-10-07';
  const isMST = Boolean(parsed.isMST || parsed.pnr?.startsWith('MST-') || ticketClass === 'MST');

  const passengerDetails = {
    pnr: parsed.pnr,
    ticketId: parsed.ticketId || parsed.id || `TKT-${parsed.pnr}`,
    trainNumber: parsed.train || parsed.trn || 'Suburban EMU',
    trainName: parsed.trainName || 'Suburban Local Service',
    originStationCode: fromCode,
    originStationName: parsed.fromStationName || fromCode,
    destinationStationCode: toCode,
    destinationStationName: parsed.toStationName || toCode,
    travelClass: ticketClass,
    quota: parsed.quota || 'GN',
    passengersCount: parsed.passengersCount || parsed.psg || 1,
    farePaid: parsed.fare || 10,
    issuedAt: parsed.issued || parsed.cachedAt || '2026-10-07T10:00:00Z',
    journeyDate: ticketDate,
    isMST
  };

  if (parsed.paymentStatus === 'CANCELLED_REFUNDED' || parsed.bookingState === 'CANCELLED_DEMO') {
    return {
      status: 'EXPIRED',
      statusCode: 'TICKET_CANCELLED_REFUNDED',
      summary: `Ticket ${passengerDetails.ticketId} (PNR: ${passengerDetails.pnr}) was CANCELLED and refunded. Not valid for travel.`,
      passengerDetails,
      regulatoryCompliance: {
        section137Violation: true,
        section138Violation: false,
        excessFarePayable: passengerDetails.farePaid,
        penaltyCharge: 500,
        totalAmountDue: passengerDetails.farePaid + 500,
        statutoryCitation: 'Section 137 Indian Railways Act: Attempting travel on cancelled/refunded ticket.',
        actionRequired: 'Confiscate paper printout / QR and levy Section 137 penalty.'
      },
      disclaimer: TTE_DEMO_DISCLAIMER,
      isOfflineDemonstration: true
    };
  }

  if (!isMST && ticketDate < currentDate) {
    return {
      status: 'EXPIRED',
      statusCode: 'JOURNEY_DATE_EXPIRED',
      summary: `Ticket expired on ${ticketDate}. Inspected on ${currentDate}. Single journey suburban tickets expire on date of issue.`,
      passengerDetails,
      regulatoryCompliance: {
        section137Violation: false,
        section138Violation: true,
        excessFarePayable: passengerDetails.farePaid,
        penaltyCharge: STATUTORY_REGULATIONS.minimumPenalty,
        totalAmountDue: passengerDetails.farePaid + STATUTORY_REGULATIONS.minimumPenalty,
        statutoryCitation: 'Section 138 Indian Railways Act (Amended): Travelling on expired transit authority.',
        actionRequired: `Levy regular single fare from boarding station plus ₹${STATUTORY_REGULATIONS.minimumPenalty} statutory excess charge.`
      },
      disclaimer: TTE_DEMO_DISCLAIMER,
      isOfflineDemonstration: true
    };
  }

  if (context.isInspectingExpressTrain && isMST) {
    const expressDiffFare = 140;
    return {
      status: 'CLASS_MISMATCH',
      statusCode: 'MST_ON_PROHIBITED_EXPRESS',
      summary: `Regulatory Non-Compliance: Suburban Monthly Season Ticket (MST) is NOT valid on Mail/Express train without explicit CR/WR zone endorsement.`,
      passengerDetails,
      regulatoryCompliance: {
        section137Violation: false,
        section138Violation: true,
        excessFarePayable: expressDiffFare,
        penaltyCharge: STATUTORY_REGULATIONS.minimumPenalty,
        totalAmountDue: expressDiffFare + STATUTORY_REGULATIONS.minimumPenalty,
        statutoryCitation: 'Section 138 Indian Railways Act (Amended): Holding suburban season pass on unauthorized express rake.',
        actionRequired: `Collect difference to Mail/Express tariff (₹${expressDiffFare}) plus minimum statutory excess charge of ₹${STATUTORY_REGULATIONS.minimumPenalty}.`
      },
      disclaimer: TTE_DEMO_DISCLAIMER,
      isOfflineDemonstration: true
    };
  }

  if (context.inspectedCoachClass) {
    const inspectedClass = context.inspectedCoachClass.toUpperCase();
    const isHigherClass =
      (ticketClass === 'II' && (inspectedClass === 'I' || inspectedClass === 'AC_LOCAL' || inspectedClass === '3A' || inspectedClass === '2A' || inspectedClass === '1A' || inspectedClass === 'CC' || inspectedClass === 'EC')) ||
      (ticketClass === 'I' && (inspectedClass === 'AC_LOCAL' || inspectedClass === '3A' || inspectedClass === '2A' || inspectedClass === '1A' || inspectedClass === 'EC'));

    if (isHigherClass) {
      const fareDiff = inspectedClass.includes('AC') ? 115 : 45;
      return {
        status: 'CLASS_MISMATCH',
        statusCode: 'TRAVEL_IN_HIGHER_CLASS',
        summary: `Class Mismatch: Passenger holds ${ticketClass} class ticket, but was inspected in ${inspectedClass} coach.`,
        passengerDetails,
        regulatoryCompliance: {
          section137Violation: false,
          section138Violation: true,
          excessFarePayable: fareDiff,
          penaltyCharge: STATUTORY_REGULATIONS.minimumPenalty,
          totalAmountDue: fareDiff + STATUTORY_REGULATIONS.minimumPenalty,
          statutoryCitation: 'Section 138 Indian Railways Act (Amended): Travelling in coach higher than authorized travel class.',
          actionRequired: `Collect fare difference (₹${fareDiff}) + statutory excess charge of ₹${STATUTORY_REGULATIONS.minimumPenalty} under Section 138.`
        },
        disclaimer: TTE_DEMO_DISCLAIMER,
        isOfflineDemonstration: true
      };
    }
  }

  return {
    status: 'VALID',
    statusCode: 'VALID_AUTHENTIC_SPECIMEN',
    summary: `Verified Valid Specimen Ticket: ${passengerDetails.travelClass} Class from ${passengerDetails.originStationName} to ${passengerDetails.destinationStationName}. Quota: ${passengerDetails.quota}.`,
    passengerDetails,
    regulatoryCompliance: {
      section137Violation: false,
      section138Violation: false,
      excessFarePayable: 0,
      penaltyCharge: 0,
      totalAmountDue: 0,
      statutoryCitation: 'Fully compliant with Indian Railways Act, 1989.',
      actionRequired: 'None. Passenger authorized for travel.'
    },
    disclaimer: TTE_DEMO_DISCLAIMER,
    isOfflineDemonstration: true
  };
}
