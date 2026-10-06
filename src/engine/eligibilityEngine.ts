import { TrainTrip, TravelClass, EligibilityResult } from '../types/railway';

export interface EligibilityQuery {
  train: TrainTrip;
  fromStationCode: string;
  toStationCode: string;
  userTicketType: 'suburban_single' | 'suburban_season_pass' | 'express_unreserved' | 'express_reserved' | 'none';
  userClass: TravelClass;
  hasMST: boolean;
}

/**
 * Passenger Eligibility & Legal Boarding Verification Engine
 * Enforces Indian Railways Central/Western Railway suburban and national ticketing rules.
 */
export function evaluateJourneyEligibility(query: EligibilityQuery): EligibilityResult {
  const { train, fromStationCode, toStationCode, userTicketType, userClass, hasMST } = query;
  const rulesApplied: string[] = [];

  // Check stops exist and in correct direction
  const fromIdx = train.stops.findIndex(s => s.stationCode === fromStationCode);
  const toIdx = train.stops.findIndex(s => s.stationCode === toStationCode);

  if (fromIdx === -1 || toIdx === -1 || fromIdx >= toIdx) {
    return {
      status: 'PROHIBITED',
      summary: 'Route direction or halt mismatch: train does not serve this direction or stop.',
      rulesApplied: ['Stop verification failed: train does not call at both stations in sequence.'],
      validClasses: [],
      passPermitted: false,
      ticketRequiredNote: 'Train does not connect these stations in this direction.'
    };
  }

  // Suburban EMU Services (Slow / Fast / AC Local)
  const isSuburbanEMU = train.serviceType.startsWith('suburban_');
  if (isSuburbanEMU) {
    rulesApplied.push('Verified suburban corridor service operated by Central/Western Railway.');

    if (train.serviceType.includes('ac')) {
      rulesApplied.push('AC Local service: Ordinary Second/First Class tickets or passes are NOT valid.');
      if (userClass !== 'AC_LOCAL' && userTicketType !== 'none') {
        return {
          status: 'PROHIBITED',
          summary: 'AC Local requires dedicated AC suburban single ticket or AC season pass.',
          rulesApplied,
          validClasses: ['AC_LOCAL'],
          passPermitted: false,
          ticketRequiredNote: 'Must purchase AC Local ticket or upgrade existing ticket at station/UTS.'
        };
      }
      return {
        status: 'ELIGIBLE',
        summary: 'Fully eligible on Mumbai AC Local with valid AC single/season pass.',
        rulesApplied,
        validClasses: ['AC_LOCAL'],
        passPermitted: true,
        ticketRequiredNote: 'UTS AC ticket or Smart Card AC pass required.'
      };
    }

    // Regular Non-AC EMU
    rulesApplied.push('Standard suburban EMU: Second Class (II) and First Class (I) coaches available.');
    return {
      status: 'ELIGIBLE',
      summary: 'Fully eligible for suburban travel with standard UTS ticket or Suburban Season Pass.',
      rulesApplied,
      validClasses: ['II', 'I'],
      passPermitted: true,
      ticketRequiredNote: 'Valid suburban single/return ticket or active monthly/quarterly season ticket.'
    };
  }

  // National Mail / Express / Superfast services (e.g. Dadar to Kalyan or Mumbai to Pune)
  rulesApplied.push('National Express / Superfast service: Governed by Indian Railways PRS & Section 138/155 rules.');

  // Suburban commuter attempting short-hop on Express train (e.g., Dadar to Kalyan)
  const isShortSuburbanSegment = (fromStationCode === 'DR' || fromStationCode === 'CSMT' || fromStationCode === 'TNA') &&
                                (toStationCode === 'KYN' || toStationCode === 'DR' || toStationCode === 'TNA');

  if (isShortSuburbanSegment) {
    rulesApplied.push('Short-hop segment within Mumbai Suburban section detected.');

    // Case A: Train is explicitly on Central Railway MST Permitted Train List (e.g., Deccan Queen 12124)
    if (train.isMSTPermitted) {
      rulesApplied.push('CR MST Rule: Train is authorized for suburban Monthly Season Ticket (MST) holders.');
      rulesApplied.push('Coach Restriction: Permitted ONLY in designated unreserved Second Class (GS) coaches; strictly prohibited in reserved sleeper/AC/chair-car coaches.');

      if (hasMST || userTicketType === 'suburban_season_pass') {
        return {
          status: 'CONDITIONAL',
          summary: 'CONDITIONAL: Permitted for MST season pass holders in General Second Class coach ONLY.',
          rulesApplied,
          validClasses: ['II', '2S'],
          passPermitted: true,
          ticketRequiredNote: `Valid Suburban MST + Central Railway surcharge where applicable. ${train.mstNotes || ''}`
        };
      }

      if (userTicketType === 'suburban_single') {
        return {
          status: 'PROHIBITED',
          summary: 'PROHIBITED: Ordinary Suburban single journey tickets are NOT valid on Express trains.',
          rulesApplied,
          validClasses: ['2S'],
          passPermitted: false,
          ticketRequiredNote: 'Must purchase dedicated Mail/Express unreserved ticket (Min distance 50km + superfast surcharge) or travel by suburban local EMU.'
        };
      }

      return {
        status: 'CONDITIONAL',
        summary: 'CONDITIONAL: Requires Mail/Express ticket or verified Central Railway MST pass.',
        rulesApplied,
        validClasses: ['2S', 'CC'],
        passPermitted: true,
        ticketRequiredNote: 'Suburban pass permitted only in designated unreserved coach.'
      };
    }

    // Case B: Train is NOT on MST list (e.g. Konark Express 11020, Tejas Express 22119)
    rulesApplied.push('CR Rule: Train is NOT on the authorized suburban MST list.');
    if (hasMST || userTicketType === 'suburban_season_pass' || userTicketType === 'suburban_single') {
      return {
        status: 'PROHIBITED',
        summary: 'PROHIBITED FOR COMMUTERS: Suburban season tickets and local tickets are strictly INVALID on this service.',
        rulesApplied,
        validClasses: ['2S', 'SL', '3A', '2A'],
        passPermitted: false,
        ticketRequiredNote: 'Unauthorized boarding carries penalty under Section 138 of Railways Act. Requires PRS reserved ticket or unreserved Mail/Express ticket with minimum distance rule.'
      };
    }

    return {
      status: 'CONDITIONAL',
      summary: 'CONDITIONAL: Boarding permitted only with authorized Mail/Express ticket. Suburban passes void.',
      rulesApplied,
      validClasses: train.availableClasses,
      passPermitted: false,
      ticketRequiredNote: 'Express ticketing rules apply. Verify unreserved counter ticket or PRS reservation.'
    };
  }

  // Intercity / Long-distance journey (e.g. Mumbai to Pune or Goa)
  rulesApplied.push('Intercity journey: PRS reservation or counter unreserved ticket required.');
  return {
    status: 'ELIGIBLE',
    summary: 'Standard national railway booking conditions apply.',
    rulesApplied,
    validClasses: train.availableClasses,
    passPermitted: false,
    ticketRequiredNote: 'Confirm reservation or unreserved ticket according to chosen class.'
  };
}
