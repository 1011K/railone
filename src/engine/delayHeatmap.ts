import { TrainTrip, TrainRunningObservation } from '../types/railway';
import { NetworkServiceAlert } from '../services/networkAlertsService';
import { STATIONS } from '../fixtures/railwayData';
import { computePredictedStops } from './delayModel';

export type HeatIntensity = 'CLEAR' | 'MODERATE' | 'HEAVY' | 'CRITICAL';

export interface RouteHeatSegment {
  segmentId: string;
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  distanceKm: number;
  scheduledTransitMinutes: number;
  predictedTransitMinutes: number;
  delayMinutes: number;
  intensity: HeatIntensity;
  colorHex: string;
  heatPercentage: number; // 0 to 100%
  cause?: string;
  speedLimitKmh: number;
  isBottleneck: boolean;
  activeAlert?: NetworkServiceAlert;
  hasCurrentTrain: boolean;
}

export interface CorridorHeatSummary {
  corridorName: string;
  line: 'central' | 'western' | 'harbour';
  segments: RouteHeatSegment[];
  averageDelay: number;
  maxDelay: number;
  worstSegment: string;
}

/**
 * Calculates segment-by-segment delay heatmap metrics for a specific train trip
 */
export function computeRouteHeatmap(
  train: TrainTrip,
  observation?: TrainRunningObservation,
  alerts: NetworkServiceAlert[] = []
): RouteHeatSegment[] {
  const predictedStops = computePredictedStops(train, observation);
  const segments: RouteHeatSegment[] = [];

  for (let i = 0; i < predictedStops.length - 1; i++) {
    const fromStop = predictedStops[i];
    const toStop = predictedStops[i + 1];

    const rawFromStop = train.stops[i];
    const rawToStop = train.stops[i + 1];

    const distKm = Math.max(1.5, Math.abs((rawToStop?.distanceKm || 0) - (rawFromStop?.distanceKm || 0)) || 3.5);
    
    // Average or max delay on this segment
    const delay = Math.max(toStop.delayArrivalMinutes, fromStop.delayDepartureMinutes);

    // Look for active alerts matching this section or train
    const matchedAlert = alerts.find(a => 
      a.affectedTrainNumbers.includes(train.trainNumber) ||
      (a.sectionAffected.toLowerCase().includes(fromStop.stationName.toLowerCase()) && 
       a.sectionAffected.toLowerCase().includes(toStop.stationName.toLowerCase())) ||
      (a.sectionAffected.toLowerCase().includes(fromStop.stationCode.toLowerCase()))
    );

    let intensity: HeatIntensity = 'CLEAR';
    let colorHex = '#10b981'; // Emerald 500
    let heatPercentage = 10;
    let speedLimitKmh = 100;

    if (delay >= 15 || (matchedAlert && matchedAlert.severity === 'CRITICAL')) {
      intensity = 'CRITICAL';
      colorHex = '#ef4444'; // Red 500
      heatPercentage = Math.min(100, 75 + (delay - 15) * 2.5);
      speedLimitKmh = 30; // Cautious signal aspect
    } else if (delay >= 8 || (matchedAlert && matchedAlert.severity === 'MAJOR')) {
      intensity = 'HEAVY';
      colorHex = '#f97316'; // Orange 500
      heatPercentage = Math.min(74, 50 + (delay - 8) * 3);
      speedLimitKmh = 60;
    } else if (delay >= 3 || (matchedAlert && matchedAlert.severity === 'MODERATE')) {
      intensity = 'MODERATE';
      colorHex = '#f59e0b'; // Amber 500
      heatPercentage = Math.min(49, 25 + (delay - 3) * 4);
      speedLimitKmh = 80;
    } else {
      intensity = 'CLEAR';
      colorHex = '#10b981'; // Green
      heatPercentage = Math.max(8, delay * 8);
      speedLimitKmh = 105;
    }

    const isBottleneck = intensity === 'CRITICAL' || intensity === 'HEAVY';
    const isCurrentTrainOnSegment = observation?.currentStationCode === fromStop.stationCode;

    segments.push({
      segmentId: `${train.trainNumber}-${fromStop.stationCode}-${toStop.stationCode}`,
      fromStationCode: fromStop.stationCode,
      fromStationName: fromStop.stationName,
      toStationCode: toStop.stationCode,
      toStationName: toStop.stationName,
      distanceKm: distKm,
      scheduledTransitMinutes: 5,
      predictedTransitMinutes: 5 + delay,
      delayMinutes: delay,
      intensity,
      colorHex,
      heatPercentage: Math.round(heatPercentage),
      cause: matchedAlert?.operationalCause || observation?.disruptionReason,
      speedLimitKmh,
      isBottleneck,
      activeAlert: matchedAlert,
      hasCurrentTrain: isCurrentTrainOnSegment
    });
  }

  return segments;
}

/**
 * Computes network-wide mainline corridor heatmaps (Central, Western, Harbour)
 */
export function computeNetworkCorridorHeatmaps(
  observations: Record<string, TrainRunningObservation> = {},
  alerts: NetworkServiceAlert[] = []
): CorridorHeatSummary[] {
  // 1. Central Line Mainline Corridor (Kalyan -> Thane -> Kurla -> Dadar -> CSMT)
  const centralStations = [
    { code: 'KYN', name: 'Kalyan Jn' },
    { code: 'DI', name: 'Dombivli' },
    { code: 'TNA', name: 'Thane' },
    { code: 'MLND', name: 'Mulund' },
    { code: 'BND', name: 'Bhandup' },
    { code: 'VK', name: 'Vikhroli' },
    { code: 'GC', name: 'Ghatkopar' },
    { code: 'CLA', name: 'Kurla' },
    { code: 'DR', name: 'Dadar (CR)' },
    { code: 'BY', name: 'Byculla' },
    { code: 'CSMT', name: 'CSMT' }
  ];

  // 2. Western Line Corridor (Borivali -> Andheri -> Bandra -> Dadar -> Churchgate)
  const westernStations = [
    { code: 'VR', name: 'Virar' },
    { code: 'BVI', name: 'Borivali' },
    { code: 'ADH', name: 'Andheri' },
    { code: 'BA', name: 'Bandra' },
    { code: 'DDR', name: 'Dadar (WR)' },
    { code: 'MMCT', name: 'Mumbai Central' },
    { code: 'MEL', name: 'Marine Lines' },
    { code: 'CCG', name: 'Churchgate' }
  ];

  // 3. Harbour Line Corridor (Panvel -> Vashi -> Kurla -> Vadala -> CSMT)
  const harbourStations = [
    { code: 'PNVL', name: 'Panvel' },
    { code: 'VSH', name: 'Vashi' },
    { code: 'CLA', name: 'Kurla' },
    { code: 'VDLR', name: 'Vadala Road' },
    { code: 'BY', name: 'Byculla' },
    { code: 'CSMT', name: 'CSMT' }
  ];

  const buildCorridor = (
    name: string,
    line: 'central' | 'western' | 'harbour',
    stations: Array<{ code: string; name: string }>
  ): CorridorHeatSummary => {
    const segments: RouteHeatSegment[] = [];
    let totalDelay = 0;
    let maxDelay = 0;
    let worst = '';

    for (let i = 0; i < stations.length - 1; i++) {
      const fromSt = stations[i];
      const toSt = stations[i + 1];

      // Simulated delay based on line conditions
      let delay = 0;
      let cause: string | undefined;

      // Vidyavihar / Kurla bottleneck on Central line
      if (line === 'central' && (fromSt.code === 'GC' || fromSt.code === 'CLA' || fromSt.code === 'VK')) {
        delay = 22; // +22 min active signal lock
        cause = 'Signal point failure at Vidyavihar fast lines';
      } else if (line === 'central' && fromSt.code === 'KYN') {
        delay = 18; // Kalyan electric shed delay
        cause = 'Rake delayed departing origin electric shed';
      } else if (line === 'western' && fromSt.code === 'BA') {
        delay = 7;
        cause = 'Speed restriction across Bandra curve';
      } else if (line === 'harbour' && fromSt.code === 'VSH') {
        delay = 4;
        cause = 'Creek bridge caution order (40 km/h)';
      } else {
        delay = 1;
      }

      totalDelay += delay;
      if (delay > maxDelay) {
        maxDelay = delay;
        worst = `${fromSt.name} ➔ ${toSt.name}`;
      }

      let intensity: HeatIntensity = 'CLEAR';
      let colorHex = '#10b981';
      let heatPercentage = 10;
      let speedLimitKmh = 100;

      if (delay >= 15) {
        intensity = 'CRITICAL';
        colorHex = '#ef4444';
        heatPercentage = 95;
        speedLimitKmh = 30;
      } else if (delay >= 8) {
        intensity = 'HEAVY';
        colorHex = '#f97316';
        heatPercentage = 65;
        speedLimitKmh = 60;
      } else if (delay >= 3) {
        intensity = 'MODERATE';
        colorHex = '#f59e0b';
        heatPercentage = 40;
        speedLimitKmh = 80;
      }

      segments.push({
        segmentId: `${line}-${fromSt.code}-${toSt.code}`,
        fromStationCode: fromSt.code,
        fromStationName: fromSt.name,
        toStationCode: toSt.code,
        toStationName: toSt.name,
        distanceKm: 4.2,
        scheduledTransitMinutes: 5,
        predictedTransitMinutes: 5 + delay,
        delayMinutes: delay,
        intensity,
        colorHex,
        heatPercentage,
        cause,
        speedLimitKmh,
        isBottleneck: intensity === 'CRITICAL' || intensity === 'HEAVY',
        hasCurrentTrain: false
      });
    }

    return {
      corridorName: name,
      line,
      segments,
      averageDelay: Math.round(totalDelay / segments.length),
      maxDelay,
      worstSegment: worst || 'None (Normal Headway)'
    };
  };

  return [
    buildCorridor('Central Railway Mainline (Kalyan — CSMT Fast/Slow)', 'central', centralStations),
    buildCorridor('Western Railway Suburban (Virar — Churchgate Quad-Track)', 'western', westernStations),
    buildCorridor('Harbour Line Suburban (Panvel — CSMT Twin Track)', 'harbour', harbourStations),
  ];
}
