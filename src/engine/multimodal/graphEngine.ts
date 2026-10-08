/**
 * India-Wide Multimodal Graph Routing Engine
 * Implements deterministic multi-criteria pathfinding, door-to-door spatial resolution,
 * transfer walk generation, express eligibility gating, delay inversion heuristics,
 * and step-free wheelchair accessibility enforcement.
 */

import {
  CityPack,
  MultimodalNode,
  MultimodalEdge,
  DoorToDoorLocation,
  MultimodalQuery,
  MultimodalRoutingPreferences,
  MultimodalItinerary,
  MultimodalItineraryLeg,
  MultimodalTransfer,
  TransportMode,
  DataQualityStatus
} from './types';
import { getCityPack, CITY_PACKS } from './cityPacks';
import { PROVIDER_ADAPTERS } from './adapters';

export interface RouteSearchParams {
  cityId?: string;
  origin: string | DoorToDoorLocation;
  destination: string | DoorToDoorLocation;
  departureTime?: string; // HH:MM
  arriveByDeadline?: string;
  preferences?: MultimodalRoutingPreferences;
  liveObservations?: Record<string, { delayMinutes: number; status: 'ON_TIME' | 'DELAYED' | 'CANCELLED' }>;
}

export class MultimodalGraphEngine {
  private cityPack: CityPack;
  private nodeMap: Map<string, MultimodalNode>;
  private adjacency: Map<string, MultimodalEdge[]>;

  constructor(cityId: string = 'mumbai') {
    const pack = getCityPack(cityId) || CITY_PACKS.mumbai;
    this.cityPack = pack;
    this.nodeMap = new Map();
    this.adjacency = new Map();
    this.buildGraph(pack);
  }

  public switchCity(cityId: string): void {
    const pack = getCityPack(cityId);
    if (!pack) throw new Error(`Unknown city pack: ${cityId}`);
    this.cityPack = pack;
    this.buildGraph(pack);
  }

  public getCityPack(): CityPack {
    return this.cityPack;
  }

  private buildGraph(pack: CityPack): void {
    this.nodeMap.clear();
    this.adjacency.clear();

    for (const node of pack.nodes) {
      this.nodeMap.set(node.id, node);
      this.adjacency.set(node.id, []);
    }

    for (const edge of pack.edges) {
      const list = this.adjacency.get(edge.fromNodeId);
      if (list) {
        list.push(edge);
      }
    }
  }

  /**
   * Resolves a query input (station code, name, landmark, or lat/lon) to a MultimodalNode.
   */
  public resolveNode(target: string | DoorToDoorLocation): { node: MultimodalNode; walkAccessMinutes: number; resolvedName: string } | null {
    if (typeof target === 'string') {
      const q = target.trim();
      const upper = q.toUpperCase();

      // 1. Direct ID / Code match
      if (this.nodeMap.has(upper)) {
        const n = this.nodeMap.get(upper)!;
        return { node: n, walkAccessMinutes: 0, resolvedName: n.name };
      }
      for (const n of this.cityPack.nodes) {
        if (n.code.toUpperCase() === upper || n.id.toUpperCase() === upper) {
          return { node: n, walkAccessMinutes: 0, resolvedName: n.name };
        }
      }

      // 2. Landmark dictionary resolution
      const landmarkKey = q.toLowerCase().replace(/[\s\-_]+/g, '_');
      if (this.cityPack.landmarks && this.cityPack.landmarks[landmarkKey]) {
        const lm = this.cityPack.landmarks[landmarkKey];
        if (lm.nearestStationCode && this.nodeMap.has(lm.nearestStationCode)) {
          const n = this.nodeMap.get(lm.nearestStationCode)!;
          return { node: n, walkAccessMinutes: 5, resolvedName: lm.name };
        }
      }

      // Partial landmark match
      for (const [k, lm] of Object.entries(this.cityPack.landmarks || {})) {
        if (k.includes(landmarkKey) || landmarkKey.includes(k) || lm.name.toLowerCase().includes(q.toLowerCase())) {
          if (lm.nearestStationCode && this.nodeMap.has(lm.nearestStationCode)) {
            const n = this.nodeMap.get(lm.nearestStationCode)!;
            return { node: n, walkAccessMinutes: 5, resolvedName: lm.name };
          }
        }
      }

      // 3. Name or alias match
      const lower = q.toLowerCase();
      for (const n of this.cityPack.nodes) {
        if (n.name.toLowerCase().includes(lower) || (n.nativeName && n.nativeName.includes(q))) {
          return { node: n, walkAccessMinutes: 0, resolvedName: n.name };
        }
        if (n.aliases?.some(a => a.toLowerCase().includes(lower))) {
          return { node: n, walkAccessMinutes: 0, resolvedName: n.name };
        }
      }

      // Check across other cities if not found in current city pack
      for (const otherPack of Object.values(CITY_PACKS)) {
        if (otherPack.cityId === this.cityPack.cityId) continue;
        for (const n of otherPack.nodes) {
          if (n.code.toUpperCase() === upper || n.name.toLowerCase().includes(lower)) {
            return { node: n, walkAccessMinutes: 0, resolvedName: n.name };
          }
        }
      }

      return null;
    }

    // DoorToDoorLocation with coordinates
    if (target.latitude !== undefined && target.longitude !== undefined) {
      let closestNode: MultimodalNode | null = null;
      let minDistanceKm = Infinity;

      for (const n of this.cityPack.nodes) {
        const dist = this.haversineDistanceKm(target.latitude, target.longitude, n.latitude, n.longitude);
        if (dist < minDistanceKm) {
          minDistanceKm = dist;
          closestNode = n;
        }
      }

      if (closestNode) {
        const walkMin = Math.max(1, Math.round((minDistanceKm * 1000) / 75));
        return { node: closestNode, walkAccessMinutes: walkMin, resolvedName: target.name || closestNode.name };
      }
    }

    if (target.nearestStationCode && this.nodeMap.has(target.nearestStationCode)) {
      const n = this.nodeMap.get(target.nearestStationCode)!;
      return { node: n, walkAccessMinutes: 3, resolvedName: target.name || n.name };
    }

    return null;
  }

  private haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  /**
   * Plans multimodal routes satisfying all constraints.
   */
  public planJourney(params: RouteSearchParams): MultimodalItinerary[] {
    const resolvedOrigin = this.resolveNode(params.origin);
    const resolvedDest = this.resolveNode(params.destination);

    if (!resolvedOrigin || !resolvedDest) {
      return [];
    }

    const originNode = resolvedOrigin.node;
    const destNode = resolvedDest.node;
    const prefs = params.preferences || {};
    const expressThreshold = prefs.expressAdvantageThresholdMinutes ?? 15;
    const depTime = params.departureTime || '08:30';

    // 1. Explore candidate paths up to depth 4
    const candidatePaths = this.findPaths(originNode.id, destNode.id, 4, prefs);

    if (candidatePaths.length === 0) {
      return [];
    }

    // 2. Transform raw edge paths into full itineraries
    const itineraries: MultimodalItinerary[] = [];

    for (let i = 0; i < candidatePaths.length; i++) {
      const edges = candidatePaths[i];
      const itin = this.buildItineraryFromEdges({
        edges,
        originNode,
        destNode,
        depTime,
        prefs,
        index: i,
        walkAccessMinutes: resolvedOrigin.walkAccessMinutes,
        resolvedOriginName: resolvedOrigin.resolvedName,
        resolvedDestName: resolvedDest.resolvedName,
        liveObservations: params.liveObservations
      });

      if (itin) {
        itineraries.push(itin);
      }
    }

    // 3. Post-process: Gating, Badges, Rationale & Sorting
    return this.rankAndBadgeItineraries(itineraries, prefs, expressThreshold);
  }

  private findPaths(
    startNodeId: string,
    targetNodeId: string,
    maxDepth: number,
    prefs: MultimodalRoutingPreferences
  ): MultimodalEdge[][] {
    const results: MultimodalEdge[][] = [];
    const queue: Array<{ currentNodeId: string; edges: MultimodalEdge[]; visited: Set<string> }> = [];

    // Also consider inter-station walking edges if origin is a parent transit hub (e.g. ADH vs METRO_ADH)
    const initialEdges = this.adjacency.get(startNodeId) || [];
    for (const edge of initialEdges) {
      if (this.isEdgeAllowed(edge, prefs)) {
        const visited = new Set<string>([startNodeId, edge.toNodeId]);
        queue.push({ currentNodeId: edge.toNodeId, edges: [edge], visited });
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      const lastEdge = current.edges[current.edges.length - 1];

      // Check if target reached (or reached equivalent node)
      if (this.isTargetReached(current.currentNodeId, targetNodeId)) {
        results.push(current.edges);
        if (results.length >= 10) break; // Keep top candidates
        continue;
      }

      if (current.edges.length >= maxDepth) continue;

      const nextEdges = this.adjacency.get(current.currentNodeId) || [];
      for (const nextEdge of nextEdges) {
        if (!this.isEdgeAllowed(nextEdge, prefs)) continue;
        if (current.visited.has(nextEdge.toNodeId)) continue;

        // Disallow consecutive walk edges
        if (lastEdge.mode === 'walk' && nextEdge.mode === 'walk') continue;

        const nextVisited = new Set(current.visited);
        nextVisited.add(nextEdge.toNodeId);
        queue.push({
          currentNodeId: nextEdge.toNodeId,
          edges: [...current.edges, nextEdge],
          visited: nextVisited
        });
      }
    }

    return results;
  }

  private isTargetReached(currentNodeId: string, targetNodeId: string): boolean {
    if (currentNodeId === targetNodeId) return true;

    // Check intermodal equivalence (e.g. GC and METRO_GHT, or ADH and METRO_ADH)
    const equivalenceMap: Record<string, string[]> = {
      'METRO_GHT': ['GC'],
      'GC': ['METRO_GHT'],
      'METRO_ADH': ['ADH'],
      'ADH': ['METRO_ADH'],
      'METRO_CCG_3': ['CCG'],
      'CCG': ['METRO_CCG_3'],
      'BUS_BKC': ['METRO_BKC'],
      'METRO_BKC': ['BUS_BKC'],
      'METRO_CSMT_3': ['CSMT'],
      'CSMT': ['METRO_CSMT_3', 'BUS_NARIMAN']
    };

    if (equivalenceMap[targetNodeId]?.includes(currentNodeId)) return true;
    return false;
  }

  private isEdgeAllowed(edge: MultimodalEdge, prefs: MultimodalRoutingPreferences): boolean {
    // Mode exclusion
    if (prefs.excludedModes && prefs.excludedModes.includes(edge.mode)) return false;
    if (prefs.preferredModes && prefs.preferredModes.length > 0) {
      if (edge.mode !== 'walk' && !prefs.preferredModes.includes(edge.mode)) return false;
    }

    // Wheelchair / step-free accessibility requirement
    if (prefs.accessibleStepFree) {
      if (!edge.stepFree) return false;
      const toNode = this.nodeMap.get(edge.toNodeId);
      if (toNode && !toNode.stepFreeAccessible) return false;
    }

    // AC only
    if (prefs.acOnly && edge.mode !== 'walk' && edge.mode !== 'metro') {
      if (!edge.isAcService) return false;
    }

    // Unavailable service filtering (Missing or non-operational feeds)
    if (edge.dataQuality === 'UNAVAILABLE') return false;

    return true;
  }

  private buildItineraryFromEdges(ctx: {
    edges: MultimodalEdge[];
    originNode: MultimodalNode;
    destNode: MultimodalNode;
    depTime: string;
    prefs: MultimodalRoutingPreferences;
    index: number;
    walkAccessMinutes: number;
    resolvedOriginName: string;
    resolvedDestName: string;
    liveObservations?: Record<string, { delayMinutes: number; status: 'ON_TIME' | 'DELAYED' | 'CANCELLED' }>;
  }): MultimodalItinerary | null {
    const { edges, originNode, destNode, depTime, index, walkAccessMinutes, liveObservations } = ctx;
    const legs: MultimodalItineraryLeg[] = [];
    const transfers: MultimodalTransfer[] = [];
    let currentTime = depTime;
    let totalDuration = 0;
    let totalWalkMinutes = walkAccessMinutes;
    let totalDistance = 0;
    let totalFare = 0;
    const fareByMode: Partial<Record<TransportMode, number>> = {};
    let isStepFree = originNode.stepFreeAccessible && destNode.stepFreeAccessible;
    let isAcOnly = true;
    let hasUnavailable = false;

    // Optional origin walking leg if door-to-door offset exists
    if (walkAccessMinutes > 0) {
      totalDuration += walkAccessMinutes;
      currentTime = this.addMinutes(currentTime, walkAccessMinutes);
    }

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const fromNode = this.nodeMap.get(edge.fromNodeId) || originNode;
      const toNode = this.nodeMap.get(edge.toNodeId) || destNode;

      if (!edge.stepFree || !fromNode.stepFreeAccessible || !toNode.stepFreeAccessible) {
        isStepFree = false;
      }
      if (edge.mode !== 'metro' && !edge.isAcService && edge.mode !== 'walk') {
        isAcOnly = false;
      }

      // Check live delay heuristic (Delay inversion support)
      let duration = edge.durationMinutes;
      let delayMin = 0;
      if (liveObservations && (liveObservations[edge.lineId] || liveObservations[edge.id])) {
        const obs = liveObservations[edge.lineId] || liveObservations[edge.id];
        if (obs.delayMinutes > 0) {
          delayMin = obs.delayMinutes;
          duration += delayMin;
        }
      }

      const legDepTime = currentTime;
      const legArrTime = this.addMinutes(currentTime, duration);
      currentTime = legArrTime;
      totalDuration += duration;
      totalDistance += edge.distanceKm;

      if (edge.mode === 'walk') {
        totalWalkMinutes += duration;
      }

      const legFare = edge.fareInr;
      totalFare += legFare;
      fareByMode[edge.mode] = (fareByMode[edge.mode] || 0) + legFare;

      const leg: MultimodalItineraryLeg = {
        legIndex: i + 1,
        mode: edge.mode,
        operator: edge.operator,
        lineName: edge.lineName,
        routeIdentifier: edge.routeNumber || edge.lineId,
        fromNode,
        toNode,
        departureTime: legDepTime,
        arrivalTime: legArrTime,
        durationMinutes: duration,
        distanceKm: edge.distanceKm,
        fareInr: legFare,
        isAcService: edge.mode === 'metro' || !!edge.isAcService,
        stepFreeAccessible: edge.stepFree,
        dataQuality: edge.dataQuality,
        provenanceLabel: edge.dataQuality === 'VERIFIED_LIVE' ? '[VERIFIED LIVE]' : '[TIMETABLE SCHEDULE]',
        bookingDeepLink: edge.bookingUrl,
        delayMinutes: delayMin > 0 ? delayMin : undefined,
        instructions: this.generateLegInstruction(edge, fromNode, toNode)
      };

      legs.push(leg);

      // Check if transfer to next transit leg
      if (i < edges.length - 1) {
        const nextEdge = edges[i + 1];
        if (edge.mode !== 'walk' && nextEdge.mode !== 'walk') {
          // Direct interchange between transit modes
          const walkMin = 4;
          totalDuration += walkMin;
          totalWalkMinutes += walkMin;
          currentTime = this.addMinutes(currentTime, walkMin);

          transfers.push({
            transferIndex: transfers.length + 1,
            atNode: toNode,
            fromMode: edge.mode,
            toMode: nextEdge.mode,
            walkMinutes: walkMin,
            bufferMinutes: 2,
            stepFreeAccessible: toNode.stepFreeAccessible,
            transferGuide: `Interchange at ${toNode.name} to ${nextEdge.lineName} (${walkMin} min walk).`
          });
        }
      }
    }

    return {
      id: `itin-${originNode.code}-${destNode.code}-${index + 1}`,
      origin: originNode,
      destination: destNode,
      legs,
      transfers,
      departureTime: depTime,
      arrivalTime: currentTime,
      totalDurationMinutes: totalDuration,
      totalWalkMinutes,
      totalDistanceKm: Math.round(totalDistance * 10) / 10,
      totalFareInr: totalFare,
      fareBreakdownByMode: fareByMode,
      isStepFreeAccessible: isStepFree,
      isAcOnly,
      score: 100 - totalDuration - totalFare * 0.2,
      rankReason: '',
      badges: [],
      transparentRationale: '',
      dataQualitySummary: hasUnavailable ? 'UNAVAILABLE' : 'TIMETABLE_SCHEDULE',
      hasUnavailableSegments: hasUnavailable
    };
  }

  private generateLegInstruction(edge: MultimodalEdge, from: MultimodalNode, to: MultimodalNode): string {
    if (edge.mode === 'metro') {
      return `Board ${edge.lineName} at ${from.name} toward ${to.name} (${edge.durationMinutes} min, ₹${edge.fareInr}).`;
    }
    if (edge.mode === 'suburban') {
      return `Take ${edge.lineName} from ${from.name} to ${to.name} (${edge.durationMinutes} min, ₹${edge.fareInr}).`;
    }
    if (edge.mode === 'express') {
      return `Board ${edge.lineName} from ${from.name} to ${to.name}. Advance reservation required; suburban MST not valid.`;
    }
    if (edge.mode === 'bus') {
      return `Board ${edge.operator} ${edge.lineName} at ${from.name} to ${to.name}.`;
    }
    if (edge.mode === 'ferry') {
      return `Board ${edge.lineName} passenger ferry at ${from.name} jetty.`;
    }
    if (edge.mode === 'walk') {
      return `Walk ${Math.round(edge.distanceKm * 1000)}m via ${edge.lineName} (${edge.durationMinutes} min).`;
    }
    return `Travel via ${edge.lineName} from ${from.name} to ${to.name}.`;
  }

  private rankAndBadgeItineraries(
    itineraries: MultimodalItinerary[],
    prefs: MultimodalRoutingPreferences,
    expressThresholdMinutes: number
  ): MultimodalItinerary[] {
    if (itineraries.length === 0) return [];

    // 1. Identify distinct characteristics
    const minDuration = Math.min(...itineraries.map(i => i.totalDurationMinutes));
    const minFare = Math.min(...itineraries.map(i => i.totalFareInr));
    const minTransfers = Math.min(...itineraries.map(i => i.transfers.length));
    const minWalk = Math.min(...itineraries.map(i => i.totalWalkMinutes));

    for (const itin of itineraries) {
      const badges: string[] = [];
      const reasons: string[] = [];

      // Check direct metro
      const isDirectMetro = itin.legs.length === 1 && itin.legs[0].mode === 'metro';
      if (isDirectMetro) {
        badges.push('DIRECT_METRO');
        reasons.push('Direct air-conditioned metro service with dedicated right-of-way.');
      }

      if (itin.totalDurationMinutes === minDuration) {
        badges.push('FASTEST');
        reasons.push(`Fastest transit time (${itin.totalDurationMinutes} min).`);
      }
      if (itin.totalFareInr === minFare) {
        badges.push('CHEAPEST');
        reasons.push(`Lowest fare option (₹${itin.totalFareInr}).`);
      }
      if (itin.transfers.length === minTransfers && minTransfers === 0) {
        badges.push('DIRECT');
      }
      if (itin.isStepFreeAccessible) {
        badges.push('STEP_FREE');
      }
      if (itin.totalWalkMinutes === minWalk) {
        badges.push('LOW_WALK');
      }

      // Check Dadar -> Kalyan Express vs Local rule (Scenario 4)
      const hasExpressLeg = itin.legs.some(l => l.mode === 'express');
      const hasLocalLeg = itin.legs.some(l => l.mode === 'suburban');

      if (hasExpressLeg && !hasLocalLeg) {
        // Find if there's a competing suburban local
        const localEquivalent = itineraries.find(other =>
          other.legs.some(l => l.mode === 'suburban') && !other.legs.some(l => l.mode === 'express')
        );

        if (localEquivalent) {
          const timeSaved = localEquivalent.totalDurationMinutes - itin.totalDurationMinutes;
          if (timeSaved < expressThresholdMinutes) {
            // Express does not save enough time to warrant recommendation
            itin.transparentRationale = `Express saves only ${timeSaved} min (< ${expressThresholdMinutes} min threshold) at higher tariff (₹${itin.totalFareInr} vs ₹${localEquivalent.totalFareInr}) and prohibits suburban season tickets (MST). Suburban Local recommended.`;
          } else {
            itin.transparentRationale = `Express train saves ${timeSaved} min (meets >= ${expressThresholdMinutes} min threshold). Advance reservation required.`;
          }
        }
      }

      if (!itin.transparentRationale) {
        itin.transparentRationale = reasons.join(' ') || 'Standard scheduled transit route.';
      }
      itin.badges = badges;
    }

    // 2. Sorting based on priority
    const hasExplicitFastest = prefs.priority === 'fastest';
    const priority = prefs.priority || 'recommended';

    itineraries.sort((a, b) => {
      // Dadar -> Kalyan express suppression if threshold not met and user hasn't explicitly overridden to fastest
      const aIsSuburban = a.legs.some(l => l.mode === 'suburban');
      const bIsSuburban = b.legs.some(l => l.mode === 'suburban');
      const aIsExpress = a.legs.some(l => l.mode === 'express');
      const bIsExpress = b.legs.some(l => l.mode === 'express');

      if (aIsSuburban && bIsExpress) {
        const timeDiff = a.totalDurationMinutes - b.totalDurationMinutes;
        if (timeDiff < expressThresholdMinutes && !hasExplicitFastest) {
          return -1; // Keep suburban above express
        }
      }
      if (bIsSuburban && aIsExpress) {
        const timeDiff = b.totalDurationMinutes - a.totalDurationMinutes;
        if (timeDiff < expressThresholdMinutes && !hasExplicitFastest) {
          return 1; // Keep suburban above express
        }
      }

      if (priority === 'lowest_cost') {
        if (a.totalFareInr !== b.totalFareInr) return a.totalFareInr - b.totalFareInr;
        return a.totalDurationMinutes - b.totalDurationMinutes;
      }
      if (priority === 'fewest_transfers') {
        if (a.transfers.length !== b.transfers.length) return a.transfers.length - b.transfers.length;
        return a.totalDurationMinutes - b.totalDurationMinutes;
      }
      if (priority === 'less_walking') {
        if (a.totalWalkMinutes !== b.totalWalkMinutes) return a.totalWalkMinutes - b.totalWalkMinutes;
        return a.totalDurationMinutes - b.totalDurationMinutes;
      }

      // Default: fastest
      if (a.totalDurationMinutes !== b.totalDurationMinutes) {
        return a.totalDurationMinutes - b.totalDurationMinutes;
      }
      return a.totalFareInr - b.totalFareInr;
    });

    // Mark the top recommendation as BEST if appropriate
    if (itineraries.length > 0) {
      const top = itineraries[0];
      const isExpressBelowThreshold = top.legs.some(l => l.mode === 'express') &&
        top.transparentRationale.includes('saves only');

      if (!isExpressBelowThreshold && !top.badges.includes('⭐ BEST')) {
        top.badges.unshift('⭐ BEST');
        top.rankReason = 'Top-ranked route matching commute preferences.';
      }
    }

    return itineraries;
  }

  private addMinutes(timeStr: string, minutes: number): string {
    const [h, m] = timeStr.split(':').map(Number);
    const total = (h * 60 + m + minutes) % (24 * 60);
    const newH = Math.floor(total / 60);
    const newM = total % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  }
}

export const multimodalEngine = new MultimodalGraphEngine('mumbai');
