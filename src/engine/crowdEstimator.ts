import { TrainTrip, CrowdingEstimate, CrowdingLevel } from '../types/railway';

/**
 * Categorical Crowd Estimation Engine
 * Based on empirical Mumbai suburban passenger patterns:
 * - Time bands (Morning peak 08:30-11:30, Evening peak 17:30-20:45)
 * - Directionality (Peak flow towards city vs reverse flow away from city)
 * - Service category (Fast trains carry heavier loads than Slow trains)
 * - Upstream bunching / delay accumulation
 * - Class differentiation (AC Local & First Class have structured lower density)
 */
export function estimateCrowdLevel(
  train: TrainTrip,
  boardingStationCode: string,
  timeStr: string,
  precedingDelayMinutes: number = 0,
  isACService: boolean = false
): CrowdingEstimate {
  const [hStr, mStr] = timeStr.split(':');
  const minutesOfDay = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);

  // Peak intervals in minutes
  const isMorningPeak = minutesOfDay >= 8 * 60 + 30 && minutesOfDay <= 11 * 60 + 30; // 08:30 - 11:30
  const isEveningPeak = minutesOfDay >= 17 * 60 + 30 && minutesOfDay <= 20 * 60 + 45; // 17:30 - 20:45
  const isPeak = isMorningPeak || isEveningPeak;

  // Determine direction: towards CSMT/CCG (Southbound) vs towards KYN/VR (Northbound)
  const isSouthbound = ['CSMT', 'CCG', 'DR', 'MMCT'].includes(train.destinationStation);
  const isNorthbound = ['KYN', 'VR', 'TNA', 'BVI'].includes(train.destinationStation);

  // Peak directional alignment
  const isCommuteFlowDirection = (isMorningPeak && isSouthbound) || (isEveningPeak && isNorthbound);

  // Major crush junctions
  const isMajorBoardingHub = ['TNA', 'KYN', 'DI', 'BVI', 'ADH', 'DR', 'GC'].includes(boardingStationCode);

  let level: CrowdingLevel = 'LOW';
  let crowdReason = '';
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'DATA_SPARSE' = 'HIGH';

  if (isACService) {
    if (isCommuteFlowDirection && isMajorBoardingHub) {
      level = 'HEAVY';
      crowdReason = 'Peak directional demand for AC capacity. High standee density at doors.';
    } else if (isPeak) {
      level = 'MODERATE';
      crowdReason = 'Consistent peak AC patronage with comfortable seating availability likely.';
    } else {
      level = 'LOW';
      crowdReason = 'Off-peak AC service with ample seating room.';
    }
    return {
      level,
      confidence,
      explanation: `AC Local estimate: ${level} load. ${crowdReason}`,
      peakWindow: isPeak,
      crowdReason
    };
  }

  // Non-AC Suburban EMU
  if (isCommuteFlowDirection) {
    if (precedingDelayMinutes >= 15) {
      level = 'CRUSH_LOAD';
      crowdReason = `Compounded bunching: preceding trains delayed (+${precedingDelayMinutes}m) causing platform buildup at ${boardingStationCode}.`;
      confidence = 'HIGH';
    } else if (train.serviceType === 'suburban_fast' && isMajorBoardingHub) {
      level = 'CRUSH_LOAD';
      crowdReason = 'Peak fast corridor commuter surge. Extreme boarding pressure at junction stations.';
    } else if (isMajorBoardingHub) {
      level = 'HEAVY';
      crowdReason = 'Peak commuter volume. Expect packed coaches with limited vestibule space.';
    } else {
      level = 'MODERATE';
      crowdReason = 'Commute flow direction, moderate boarding volume.';
    }
  } else if (isPeak && !isCommuteFlowDirection) {
    // Reverse peak flow
    level = 'LOW';
    crowdReason = 'Reverse peak flow (counter-commute direction); low boarding volume.';
  } else {
    // Non-peak mid-day or late night
    if (minutesOfDay >= 12 * 60 && minutesOfDay <= 16 * 60) {
      level = 'MODERATE';
      crowdReason = 'Midday non-peak operational volume.';
    } else {
      level = 'LOW';
      crowdReason = 'Early morning / late evening lean period.';
    }
  }

  return {
    level,
    confidence,
    explanation: `${level} passenger density anticipated at ${boardingStationCode}. ${crowdReason}`,
    peakWindow: isPeak,
    crowdReason
  };
}
