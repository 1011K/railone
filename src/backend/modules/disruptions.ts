import { searchRoutes } from './routePlanner';
import { getTrainObservation, getAllLiveObservations } from './delays';
import { getTrainTrip } from './services';
import { JourneyItinerary } from '../../types/railway';

export interface DisruptionReplanRequest {
  currentStationCode: string;
  destinationStationCode: string;
  delayedTrainNumber?: string;
  reportedDelayMinutes?: number;
  departureTime?: string;
}

export interface DisruptionReplanResult {
  disruptionDetected: boolean;
  disruptionSummary: string;
  delayInversionFound: boolean;
  recommendedAlternative: JourneyItinerary | null;
  allAlternatives: JourneyItinerary[];
}

export function evaluateDisruptionReplan(req: DisruptionReplanRequest): DisruptionReplanResult {
  const currentStation = req.currentStationCode.toUpperCase();
  const destStation = req.destinationStationCode.toUpperCase();

  let delay = req.reportedDelayMinutes || 0;
  let reason = 'Sectional congestion';

  if (req.delayedTrainNumber) {
    const obs = getTrainObservation(req.delayedTrainNumber);
    if (obs) {
      delay = obs.delayMinutesAtCurrent;
      if (obs.disruptionReason) reason = obs.disruptionReason;
    }
  }

  // Use supplied journey departure time or current clock time
  const now = new Date();
  const currentClockTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const effectiveTime = req.departureTime || currentClockTime;

  // Find routes departing from current station
  const alternatives = searchRoutes({
    from: currentStation,
    to: destStation,
    departureTime: effectiveTime,
    priority: 'fastest',
    transitModeFilter: 'all'
  });

  const inversion = alternatives.find(it => it.delayInversionNote && it.delayInversionNote.length > 0);

  return {
    disruptionDetected: delay > 10,
    disruptionSummary: delay > 10
      ? `Active disruption (+${delay}m delay, ${reason}). Automated crossover replanning active.`
      : 'Normal headway operations. No critical delay inversion detected.',
    delayInversionFound: !!inversion,
    recommendedAlternative: inversion || (alternatives.length > 0 ? alternatives[0] : null),
    allAlternatives: alternatives
  };
}
