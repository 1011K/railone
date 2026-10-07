/**
 * Authorized Railway Provider Adapters & Telephony Interface Specification
 * Strictly enforces boundary between real statutory authorities (CRIS, IRCTC, UTS, MMRDA)
 * and verified local simulators.
 */

export interface TelephonyCallSession {
  callSid: string;
  fromPhone: string;
  toPhone: string;
  direction: 'inbound' | 'outbound';
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'blocked';
  blockerReason?: string;
}

export interface ITelephonyAdapter {
  providerName: string;
  isAuthorized: boolean;
  initiateCall(toPhone: string, fromPhone: string): Promise<TelephonyCallSession>;
  handleWebhook(payload: any): Promise<any>;
  getBlockerDossier(): {
    is139Repurposed: boolean;
    hasCarrierLicense: boolean;
    reason: string;
  };
}

export class StatutoryTelephonyAdapter implements ITelephonyAdapter {
  providerName = 'Statutory Telephony Gateway (SIP/PSTN)';
  isAuthorized = false;

  async initiateCall(toPhone: string, fromPhone: string): Promise<TelephonyCallSession> {
    // Under TRAI & DoT regulations, arbitrary routing or claiming 139 is prohibited without carrier trunk license
    return {
      callSid: 'BLOCKED-' + Date.now(),
      fromPhone,
      toPhone,
      direction: 'outbound',
      status: 'blocked',
      blockerReason:
        'Direct PSTN telephony dialing is disabled without DoT SIP Trunk authorization. Official Railway 139 cannot be hijacked or simulated as a commercial AI line. Use in-app RailSathi voice calling instead.'
    };
  }

  async handleWebhook(payload: any): Promise<any> {
    return { status: 'rejected', reason: 'Unauthorized telephony webhook' };
  }

  getBlockerDossier() {
    return {
      is139Repurposed: false,
      hasCarrierLicense: false,
      reason:
        'Official 139 is an Indian Railways passenger grievance hotline under statutory CRIS control. Commercial AI automated voice booking cannot co-opt 139 and requires explicit DoT/TRAI enterprise SIP trunk authorization.'
    };
  }
}

export interface IRailwayProviderDossier {
  provider: 'CRIS_PRS' | 'CRIS_UTS' | 'MMRDA_METRO' | 'TELEPHONY';
  authorizationStatus: 'SIMULATOR_VERIFIED' | 'CREDENTIAL_ABSENT';
  canIssueRealTickets: boolean;
  notes: string;
}

export function getProviderDossiers(): IRailwayProviderDossier[] {
  return [
    {
      provider: 'CRIS_PRS',
      authorizationStatus: 'SIMULATOR_VERIFIED',
      canIssueRealTickets: false,
      notes: 'IRCTC / CRIS PRS direct booking API credentials pending institutional partner signing. High-fidelity server simulator active.'
    },
    {
      provider: 'CRIS_UTS',
      authorizationStatus: 'SIMULATOR_VERIFIED',
      canIssueRealTickets: false,
      notes: 'UTS mobile geofenced ticketing simulator active. Watermarked specimen QR payload produced.'
    },
    {
      provider: 'MMRDA_METRO',
      authorizationStatus: 'SIMULATOR_VERIFIED',
      canIssueRealTickets: false,
      notes: 'MMOPL / MMMOCL open QR ticketing simulator active.'
    },
    {
      provider: 'TELEPHONY',
      authorizationStatus: 'CREDENTIAL_ABSENT',
      canIssueRealTickets: false,
      notes: 'Statutory blocker: 139 repurposing prohibited by law; in-app audio WebRTC/native audio voice caller fully operational.'
    }
  ];
}
