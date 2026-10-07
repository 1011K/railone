import { evaluateJourneyEligibility, EligibilityQuery } from '../../engine/eligibilityEngine';
import { EligibilityResult, TravelClass } from '../../types/railway';
import { getTrainTrip } from './services';

export interface ValidateEligibilityRequest {
  trainNumber: string;
  fromStationCode: string;
  toStationCode: string;
  userTicketType?: 'suburban_single' | 'suburban_season_pass' | 'express_unreserved' | 'express_reserved' | 'none';
  userClass?: TravelClass;
  hasMST?: boolean;
}

export function validateEligibility(req: ValidateEligibilityRequest): EligibilityResult {
  const train = getTrainTrip(req.trainNumber);
  if (!train) {
    return {
      status: 'PROHIBITED',
      summary: `Train ${req.trainNumber} not found in railway registry.`,
      rulesApplied: ['Train identity verification failed.'],
      validClasses: [],
      passPermitted: false,
      ticketRequiredNote: 'Valid railway service required.'
    };
  }

  const query: EligibilityQuery = {
    train,
    fromStationCode: req.fromStationCode.toUpperCase(),
    toStationCode: req.toStationCode.toUpperCase(),
    userTicketType: req.userTicketType || 'suburban_single',
    userClass: req.userClass || 'II',
    hasMST: !!req.hasMST
  };

  return evaluateJourneyEligibility(query);
}
