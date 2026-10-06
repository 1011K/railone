import { 
  MapScope, 
  MapStationNode, 
  MapTrackSegment, 
  MapTrainMarker, 
  TrainTrip, 
  TrainRunningObservation,
  RegionalLine
} from '../types/railway';
import { 
  MUMBAI_SUBURBAN_NODES, 
  PAN_INDIA_NODES, 
  SUBURBAN_CORRIDOR_CHAINS,
  SUBURBAN_FAST_CORRIDORS,
  PAN_INDIA_CORRIDORS,
  KNOWN_DISRUPTION_RULES 
} from '../fixtures/networkMapData';
import { TRAIN_TRIPS, INITIAL_OBSERVATIONS } from '../fixtures/railwayData';
import { PAN_INDIA_TRAINS, PAN_INDIA_OBSERVATIONS } from '../fixtures/panIndiaTrainsData';

// Combined train catalogs and observations
export const ALL_NETWORK_TRAINS: TrainTrip[] = [
  ...TRAIN_TRIPS,
  ...PAN_INDIA_TRAINS
];

export const ALL_NETWORK_OBSERVATIONS: Record<string, TrainRunningObservation> = {
  ...INITIAL_OBSERVATIONS,
  ...PAN_INDIA_OBSERVATIONS
};

/**
 * Normalizes bidirectional track segment key (e.g. 'CLA-DR' or 'DR-CLA' -> 'CLA-DR')
 */
export function makeSegmentKey(codeA: string, codeB: string): string {
  return [codeA, codeB].sort().join('-');
}

/**
 * Retrieves station nodes for the chosen scope (Mumbai Suburban or Pan-India)
 */
export function getStationsForScope(scope: MapScope): MapStationNode[] {
  const rawNodes = scope === 'mumbai_suburban' ? MUMBAI_SUBURBAN_NODES : PAN_INDIA_NODES;
  const trains = scope === 'mumbai_suburban' ? TRAIN_TRIPS : PAN_INDIA_TRAINS;

  // Enrich each node with count of trains stopping or passing through
  return rawNodes.map(node => {
    const passingCount = trains.filter(t => 
      t.stops.some(s => s.stationCode === node.code)
    ).length;

    return {
      ...node,
      passingTrainCount: passingCount
    };
  });
}

/**
 * Generates all physical track segments connecting adjacent stations in the network scope.
 * Aggregates all trains running across that track, computes average delay, and assigns disruption reason.
 */
export function getTrackSegmentsForScope(scope: MapScope): MapTrackSegment[] {
  const stations = getStationsForScope(scope);
  const stationMap = new Map<string, MapStationNode>();
  stations.forEach(s => stationMap.set(s.code, s));

  const trains = scope === 'mumbai_suburban' ? TRAIN_TRIPS : ALL_NETWORK_TRAINS;
  const segmentsMap = new Map<string, MapTrackSegment>();

  // 1. Seed predefined physical corridor chains
  if (scope === 'mumbai_suburban') {
    // Add sequential local track segments connecting consecutive stations
    Object.entries(SUBURBAN_CORRIDOR_CHAINS).forEach(([chainKey, chainCodes]) => {
      let chainLine: RegionalLine = 'central';
      if (chainKey.startsWith('western')) chainLine = 'western';
      else if (chainKey.startsWith('harbour')) chainLine = 'harbour';
      else if (chainKey.startsWith('transharbour')) chainLine = 'transharbour';
      else if (chainKey.startsWith('uran')) chainLine = 'uran';

      for (let i = 0; i < chainCodes.length - 1; i++) {
        const fromCode = chainCodes[i];
        const toCode = chainCodes[i + 1];
        const fromNode = stationMap.get(fromCode);
        const toNode = stationMap.get(toCode);
        if (!fromNode || !toNode) continue;

        const segKey = makeSegmentKey(fromCode, toCode);
        if (!segmentsMap.has(segKey)) {
          segmentsMap.set(segKey, {
            id: segKey,
            fromCode,
            toCode,
            fromName: fromNode.name,
            toName: toNode.name,
            distanceKm: 2.4,
            line: chainLine,
            zone: 'CR',
            trackType: 'quad_fast_slow',
            speedLimitKmh: 100,
            trainsPassing: [],
            averageDelayMinutes: 0,
            maxDelayMinutes: 0,
            trainDelays: {},
            congestionLevel: 'LOW',
            isBottleneck: false,
            coordinates: {
              x1: fromNode.x,
              y1: fromNode.y,
              x2: toNode.x,
              y2: toNode.y
            }
          });
        }
      }
    });

    // Add dedicated Suburban Fast Corridors / Express By-pass lines
    SUBURBAN_FAST_CORRIDORS.forEach(fastSeg => {
      const fromNode = stationMap.get(fastSeg.fromCode);
      const toNode = stationMap.get(fastSeg.toCode);
      if (!fromNode || !toNode) return;

      const segKey = makeSegmentKey(fastSeg.fromCode, fastSeg.toCode);
      if (!segmentsMap.has(segKey)) {
        segmentsMap.set(segKey, {
          id: segKey,
          fromCode: fastSeg.fromCode,
          toCode: fastSeg.toCode,
          fromName: fromNode.name,
          toName: toNode.name,
          distanceKm: fastSeg.distKm,
          line: fastSeg.line,
          zone: 'CR',
          trackType: fastSeg.type,
          speedLimitKmh: 105,
          trainsPassing: [],
          averageDelayMinutes: 0,
          maxDelayMinutes: 0,
          trainDelays: {},
          congestionLevel: 'LOW',
          isBottleneck: false,
          coordinates: {
            x1: fromNode.x,
            y1: fromNode.y,
            x2: toNode.x,
            y2: toNode.y
          }
        });
      }
    });
  } else {
    // Pan-India Corridors
    PAN_INDIA_CORRIDORS.forEach(corridor => {
      const fromNode = stationMap.get(corridor.fromCode);
      const toNode = stationMap.get(corridor.toCode);
      if (!fromNode || !toNode) return;

      const segKey = makeSegmentKey(corridor.fromCode, corridor.toCode);
      if (!segmentsMap.has(segKey)) {
        segmentsMap.set(segKey, {
          id: segKey,
          fromCode: corridor.fromCode,
          toCode: corridor.toCode,
          fromName: fromNode.name,
          toName: toNode.name,
          distanceKm: corridor.distKm,
          line: 'national',
          zone: fromNode.zone || 'IR',
          trackType: corridor.type,
          speedLimitKmh: 130,
          trainsPassing: [],
          averageDelayMinutes: 0,
          maxDelayMinutes: 0,
          trainDelays: {},
          congestionLevel: 'LOW',
          isBottleneck: false,
          coordinates: {
            x1: fromNode.x,
            y1: fromNode.y,
            x2: toNode.x,
            y2: toNode.y
          }
        });
      }
    });
  }

  // 2. Also ensure every contiguous stop hop from train schedules is mapped
  trains.forEach(train => {
    const stops = train.stops;
    for (let i = 0; i < stops.length - 1; i++) {
      const fromCode = stops[i].stationCode;
      const toCode = stops[i + 1].stationCode;
      const fromNode = stationMap.get(fromCode);
      const toNode = stationMap.get(toCode);
      if (!fromNode || !toNode) continue;

      const segKey = makeSegmentKey(fromCode, toCode);
      if (!segmentsMap.has(segKey)) {
        const dist = Math.abs((stops[i + 1].distanceKm || 0) - (stops[i].distanceKm || 0)) || 12;
        segmentsMap.set(segKey, {
          id: segKey,
          fromCode,
          toCode,
          fromName: fromNode.name,
          toName: toNode.name,
          distanceKm: dist,
          line: scope === 'pan_india' ? 'national' : fromNode.line,
          zone: fromNode.zone || 'CR',
          trackType: dist > 100 ? 'trunk_double' : 'quad_fast_slow',
          speedLimitKmh: dist > 100 ? 130 : 100,
          trainsPassing: [],
          averageDelayMinutes: 0,
          maxDelayMinutes: 0,
          trainDelays: {},
          congestionLevel: 'LOW',
          isBottleneck: false,
          coordinates: {
            x1: fromNode.x,
            y1: fromNode.y,
            x2: toNode.x,
            y2: toNode.y
          }
        });
      }
    }
  });

  // 3. Resolve which trains traverse each physical segment
  // A train traverses a segment if:
  // a) It has consecutive stops between fromCode and toCode, OR
  // b) Both stations lie within the train's route path along the same corridor
  trains.forEach(train => {
    const stopCodes = train.stops.map(s => s.stationCode);
    const origin = train.originStation;
    const dest = train.destinationStation;

    segmentsMap.forEach(seg => {
      let traverses = false;

      // Direct stop pair hop
      for (let i = 0; i < stopCodes.length - 1; i++) {
        const s1 = stopCodes[i];
        const s2 = stopCodes[i + 1];
        if ((s1 === seg.fromCode && s2 === seg.toCode) || (s1 === seg.toCode && s2 === seg.fromCode)) {
          traverses = true;
          break;
        }
      }

      // Check if physical segment lies along the corridor connecting origin and destination
      if (!traverses && scope === 'mumbai_suburban') {
        const isCentralTrain = ['KYN', 'TNA', 'CSMT', 'BY', 'DR', 'CLA', 'GC'].includes(origin) && 
                               ['KYN', 'TNA', 'CSMT', 'BY', 'DR', 'CLA', 'GC'].includes(dest);
        const isWesternTrain = ['CCG', 'VR', 'BVI', 'ADH', 'BA', 'MMCT'].includes(origin) && 
                               ['CCG', 'VR', 'BVI', 'ADH', 'BA', 'MMCT'].includes(dest);
        const isHarbourTrain = ['CSMT', 'PNVL', 'VSH', 'VDLR'].includes(origin) && 
                               ['CSMT', 'PNVL', 'VSH', 'VDLR'].includes(dest);

        if (isCentralTrain && seg.line === 'central') {
          // If both stations are on central main line
          const cChain = SUBURBAN_CORRIDOR_CHAINS.central_main;
          const idxFrom = cChain.indexOf(seg.fromCode);
          const idxTo = cChain.indexOf(seg.toCode);
          const idxOrig = cChain.indexOf(origin);
          const idxDest = cChain.indexOf(dest);
          if (idxFrom >= 0 && idxTo >= 0 && idxOrig >= 0 && idxDest >= 0) {
            const minTr = Math.min(idxOrig, idxDest);
            const maxTr = Math.max(idxOrig, idxDest);
            if (idxFrom >= minTr && idxFrom <= maxTr && idxTo >= minTr && idxTo <= maxTr) {
              traverses = true;
            }
          }
          // Also match fast bypass segments between Kurla and Dadar, Ghatkopar and Kurla, etc.
          if ((seg.id === 'CLA-DR' || seg.id === 'DR-CLA') ||
              (seg.id === 'GC-CLA' || seg.id === 'CLA-GC') ||
              (seg.id === 'TNA-GC' || seg.id === 'GC-TNA') ||
              (seg.id === 'DI-TNA' || seg.id === 'TNA-DI') ||
              (seg.id === 'KYN-DI' || seg.id === 'DI-KYN') ||
              (seg.id === 'DR-BY' || seg.id === 'BY-DR') ||
              (seg.id === 'BY-CSMT' || seg.id === 'CSMT-BY')) {
            traverses = true;
          }
        } else if (isWesternTrain && seg.line === 'western') {
          const wChain = SUBURBAN_CORRIDOR_CHAINS.western;
          const idxFrom = wChain.indexOf(seg.fromCode);
          const idxTo = wChain.indexOf(seg.toCode);
          const idxOrig = wChain.indexOf(origin);
          const idxDest = wChain.indexOf(dest);
          if (idxFrom >= 0 && idxTo >= 0 && idxOrig >= 0 && idxDest >= 0) {
            const minTr = Math.min(idxOrig, idxDest);
            const maxTr = Math.max(idxOrig, idxDest);
            if (idxFrom >= minTr && idxFrom <= maxTr && idxTo >= minTr && idxTo <= maxTr) {
              traverses = true;
            }
          }
          if ((seg.id === 'BA-DDR' || seg.id === 'DDR-BA') ||
              (seg.id === 'ADH-BA' || seg.id === 'BA-ADH') ||
              (seg.id === 'BVI-ADH' || seg.id === 'ADH-BVI') ||
              (seg.id === 'VR-BVI' || seg.id === 'BVI-VR')) {
            traverses = true;
          }
        } else if (isHarbourTrain && seg.line === 'harbour') {
          const hChain = SUBURBAN_CORRIDOR_CHAINS.harbour;
          const idxFrom = hChain.indexOf(seg.fromCode);
          const idxTo = hChain.indexOf(seg.toCode);
          const idxOrig = hChain.indexOf(origin);
          const idxDest = hChain.indexOf(dest);
          if (idxFrom >= 0 && idxTo >= 0 && idxOrig >= 0 && idxDest >= 0) {
            const minTr = Math.min(idxOrig, idxDest);
            const maxTr = Math.max(idxOrig, idxDest);
            if (idxFrom >= minTr && idxFrom <= maxTr && idxTo >= minTr && idxTo <= maxTr) {
              traverses = true;
            }
          }
        }
      }

      if (traverses && !seg.trainsPassing.includes(train.trainNumber)) {
        seg.trainsPassing.push(train.trainNumber);
      }
    });
  });

  // 4. Compute train-specific delays, track average delays, and disruption reasons
  const segments = Array.from(segmentsMap.values());

  segments.forEach(seg => {
    let totalDelay = 0;
    let maxDelay = 0;
    const trainDelays: Record<string, number> = {};
    let matchedDisruptionReason: string | undefined;

    seg.trainsPassing.forEach(tNum => {
      const obs = ALL_NETWORK_OBSERVATIONS[tNum];
      const delay = obs ? Math.max(0, obs.delayMinutesAtCurrent) : 0;
      trainDelays[tNum] = delay;
      totalDelay += delay;
      if (delay > maxDelay) {
        maxDelay = delay;
      }
      if (obs?.disruptionReason && !matchedDisruptionReason) {
        matchedDisruptionReason = obs.disruptionReason;
      }
    });

    const trainCount = seg.trainsPassing.length;
    let avgDelay = trainCount > 0 ? Math.round(totalDelay / trainCount) : 0;

    // Check if there is a known track disruption rule for this segment
    const ruleForward = KNOWN_DISRUPTION_RULES[`${seg.fromCode}-${seg.toCode}`];
    const ruleReverse = KNOWN_DISRUPTION_RULES[`${seg.toCode}-${seg.fromCode}`];
    const disruptionRule = ruleForward || ruleReverse;

    if (disruptionRule) {
      if (!matchedDisruptionReason) {
        matchedDisruptionReason = disruptionRule.baseDisruptionReason;
      }
      // If no live trains had reported delay, use rule's default baseline delay
      if (avgDelay === 0) {
        avgDelay = Math.round((disruptionRule.defaultDelayRange[0] + disruptionRule.defaultDelayRange[1]) / 2);
        maxDelay = disruptionRule.defaultDelayRange[1];
      }
    }

    // Classify congestion level
    let congestion: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (avgDelay >= 25 || maxDelay >= 30 || disruptionRule?.congestionLevel === 'CRITICAL') {
      congestion = 'CRITICAL';
    } else if (avgDelay >= 15 || maxDelay >= 20 || disruptionRule?.congestionLevel === 'HIGH') {
      congestion = 'HIGH';
    } else if (avgDelay >= 6 || maxDelay >= 10 || disruptionRule?.congestionLevel === 'MODERATE') {
      congestion = 'MODERATE';
    } else {
      congestion = 'LOW';
    }

    // Default disruption reason fallback if delayed without specific text
    if (!matchedDisruptionReason) {
      if (congestion === 'CRITICAL') {
        matchedDisruptionReason = 'High sectional congestion & signal lock delaying all traversing rakes';
      } else if (congestion === 'HIGH') {
        matchedDisruptionReason = 'Caution order / automatic block bunching during high-frequency window';
      } else if (congestion === 'MODERATE') {
        matchedDisruptionReason = 'Suburban crossing regulation and minor headway expansion (+5-15m)';
      } else {
        matchedDisruptionReason = 'Punctual transit flow: Automated track circuits operating with standard headway';
      }
    }

    seg.averageDelayMinutes = avgDelay;
    seg.maxDelayMinutes = maxDelay;
    seg.trainDelays = trainDelays;
    seg.congestionLevel = congestion;
    seg.disruptionReason = matchedDisruptionReason;
    seg.isBottleneck = congestion === 'CRITICAL' || congestion === 'HIGH';
  });

  return segments;
}

/**
 * Returns all track segment IDs traversed by a specific train.
 * Used to illuminate and highlight the full train path across the map.
 */
export function getRouteSegmentsForTrain(trainNumber: string, scope: MapScope): string[] {
  const segments = getTrackSegmentsForScope(scope);
  return segments
    .filter(seg => seg.trainsPassing.includes(trainNumber))
    .map(seg => seg.id);
}

/**
 * Returns animated train markers for all active trains in the given scope
 */
export function getTrainMarkersForScope(scope: MapScope): MapTrainMarker[] {
  const trains = scope === 'mumbai_suburban' ? TRAIN_TRIPS : ALL_NETWORK_TRAINS;
  const stations = getStationsForScope(scope);
  const stationMap = new Map<string, MapStationNode>();
  stations.forEach(s => stationMap.set(s.code, s));

  const markers: MapTrainMarker[] = [];

  trains.forEach(train => {
    const obs = ALL_NETWORK_OBSERVATIONS[train.trainNumber];
    const currentCode = obs?.currentStationCode || train.stops[0].stationCode;
    const currentStopIdx = train.stops.findIndex(s => s.stationCode === currentCode);

    const fromStop = train.stops[Math.max(0, currentStopIdx >= 0 ? currentStopIdx : 0)];
    const toStop = train.stops[Math.min(train.stops.length - 1, (currentStopIdx >= 0 ? currentStopIdx : 0) + 1)];

    const fromNode = stationMap.get(fromStop.stationCode);
    const toNode = stationMap.get(toStop.stationCode);

    if (!fromNode) return;

    // Estimate progress along segment (0.35 to 0.70 if between stations, or 0 if at station)
    const progress = (fromStop.stationCode === toStop.stationCode) ? 0 : 0.45;
    
    const posX = toNode ? Math.round(fromNode.x + (toNode.x - fromNode.x) * progress) : fromNode.x;
    const posY = toNode ? Math.round(fromNode.y + (toNode.y - fromNode.y) * progress) : fromNode.y;
    const posZ = toNode ? Math.round((fromNode.z || 10) + ((toNode.z || 10) - (fromNode.z || 10)) * progress) : (fromNode.z || 10);

    const delay = obs ? Math.max(0, obs.delayMinutesAtCurrent) : 0;

    markers.push({
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      serviceType: train.serviceType,
      originStation: train.originStation,
      destinationStation: train.destinationStation,
      currentSegmentId: makeSegmentKey(fromStop.stationCode, toStop.stationCode),
      fromStationCode: fromStop.stationCode,
      toStationCode: toStop.stationCode,
      delayMinutes: delay,
      progressPercent: Math.round(progress * 100),
      position: { x: posX, y: posY, z: posZ },
      disruptionReason: obs?.disruptionReason,
      scheduledArrival: toStop.scheduledArrival,
      predictedArrival: toStop.scheduledArrival,
      availableClasses: train.availableClasses
    });
  });

  return markers;
}

/**
 * Searches stations and trains across scopes for quick autocomplete and filtering
 */
export function searchNetworkMap(query: string, scope: MapScope): {
  stations: MapStationNode[];
  trains: TrainTrip[];
} {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { stations: [], trains: [] };
  }

  const allStations = getStationsForScope(scope);
  const matchedStations = allStations.filter(s => 
    s.code.toLowerCase().includes(q) ||
    s.name.toLowerCase().includes(q) ||
    (s.hindiName && s.hindiName.toLowerCase().includes(q)) ||
    (s.marathiName && s.marathiName.toLowerCase().includes(q)) ||
    s.city.toLowerCase().includes(q)
  );

  const allTrains = scope === 'mumbai_suburban' ? TRAIN_TRIPS : ALL_NETWORK_TRAINS;
  const matchedTrains = allTrains.filter(t => 
    t.trainNumber.toLowerCase().includes(q) ||
    t.trainName.toLowerCase().includes(q) ||
    (t.hindiName && t.hindiName.toLowerCase().includes(q)) ||
    t.originStation.toLowerCase().includes(q) ||
    t.destinationStation.toLowerCase().includes(q)
  );

  return { stations: matchedStations, trains: matchedTrains };
}

/**
 * Isometric 3D Projection helper
 * Converts 2D (x, y, z) into isometric screen coordinates
 */
export function project3DIsometric(
  x: number, 
  y: number, 
  z: number = 0, 
  pitchDeg: number = 38, 
  rotationDeg: number = -15
): { projX: number; projY: number } {
  const radRot = (rotationDeg * Math.PI) / 180;
  const radPitch = (pitchDeg * Math.PI) / 180;

  // Center offset of viewport
  const cx = 500;
  const cy = 450;

  const dx = x - cx;
  const dy = y - cy;

  // Rotate around Z axis
  const rx = dx * Math.cos(radRot) - dy * Math.sin(radRot);
  const ry = dx * Math.sin(radRot) + dy * Math.cos(radRot);

  // Tilt with pitch and subtract elevation z
  const projX = cx + rx;
  const projY = cy + ry * Math.cos(radPitch) - z * 2.5;

  return { projX: Math.round(projX), projY: Math.round(projY) };
}
