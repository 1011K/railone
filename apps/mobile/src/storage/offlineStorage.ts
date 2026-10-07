/**
 * Controlled Offline Storage & Cache Manager for Mobile
 * Keeps station indexes, timetable schedules, and issued tickets cached locally.
 */

export interface CachedStation {
  code: string;
  name: string;
  line: string;
}

export interface CachedTicketRecord {
  id: string;
  pnr: string;
  trainNumber: string;
  trainName: string;
  fromStationName: string;
  toStationName: string;
  journeyDate: string;
  classBooked: string;
  farePaid: number;
  qrPayload: string;
  cachedAt: string;
}

export interface CachedMapNode {
  id: string;
  code: string;
  name: string;
  hindiName?: string;
  marathiName?: string;
  line: string;
  city?: string;
  x: number;
  y: number;
  z?: number;
  platforms?: number[];
  isInterchange?: boolean;
  isMajorHub?: boolean;
}

export interface CachedTrackSegment {
  id: string;
  fromCode: string;
  toCode: string;
  line: string;
  trackType?: string;
  distanceKm?: number;
  coordinates?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface StationGeometry {
  code: string;
  name?: string;
  line?: string;
  x?: number;
  y?: number;
  z?: number;
  latitude?: number;
  longitude?: number;
  platformCount?: number;
  isTunnelPortal?: boolean;
  platforms?: number[];
  adjacentCodes?: string[];
}

export interface CachedVectorMap {
  scope: string;
  nodes: CachedMapNode[];
  segments: CachedTrackSegment[];
  geometries: Record<string, StationGeometry>;
  corridorChains?: Record<string, string[]>;
  cachedAt: string;
  version?: string;
}

// In-memory persistent cache for native runtime environment
const memoryCache = new Map<string, any>();

export const OfflineStorage = {
  // 1. Station Index Cache
  saveStations(stations: CachedStation[]): void {
    memoryCache.set('offline_stations', stations);
  },

  getStations(): CachedStation[] {
    return memoryCache.get('offline_stations') || [];
  },

  // 2. Recent Searches
  addRecentSearch(fromCode: string, toCode: string): void {
    const list: Array<{ from: string; to: string; timestamp: string }> = memoryCache.get('recent_searches') || [];
    const filtered = list.filter(item => !(item.from === fromCode && item.to === toCode));
    filtered.unshift({ from: fromCode, to: toCode, timestamp: new Date().toISOString() });
    memoryCache.set('recent_searches', filtered.slice(0, 10));
  },

  getRecentSearches(): Array<{ from: string; to: string; timestamp: string }> {
    return memoryCache.get('recent_searches') || [];
  },

  // 3. Offline Ticket Specimen Cache
  saveTickets(tickets: CachedTicketRecord[]): void {
    memoryCache.set('offline_tickets', tickets);
  },

  getTickets(): CachedTicketRecord[] {
    return memoryCache.get('offline_tickets') || [];
  },

  saveTicket(ticket: CachedTicketRecord): void {
    const existing: CachedTicketRecord[] = memoryCache.get('offline_tickets') || [];
    const filtered = existing.filter(t => t.id !== ticket.id);
    filtered.unshift(ticket);
    memoryCache.set('offline_tickets', filtered);
  },

  // 4. Saved Commuter Journeys
  saveSavedJourney(journey: { id: string; fromStationCode: string; fromStationName: string; toStationCode: string; toStationName: string; preferredClass?: string }): void {
    const existing: any[] = memoryCache.get('saved_journeys') || [];
    const filtered = existing.filter(j => j.id !== journey.id);
    filtered.unshift(journey);
    memoryCache.set('saved_journeys', filtered);
  },

  getSavedJourneys(): Array<{ id: string; fromStationCode: string; fromStationName: string; toStationCode: string; toStationName: string; preferredClass?: string }> {
    return memoryCache.get('saved_journeys') || [];
  },

  // 5. User Preferences & Onboarding
  getUserCity(): string {
    return memoryCache.get('user_city') || 'mumbai';
  },

  setUserCity(city: string): void {
    memoryCache.set('user_city', city);
  },

  getUserProfile(): { name?: string; phone?: string; isGuest: boolean } | null {
    return memoryCache.get('user_profile') || null;
  },

  setUserProfile(profile: { name?: string; phone?: string; isGuest: boolean }): void {
    memoryCache.set('user_profile', profile);
  },

  getLocationConsent(): boolean | null {
    const val = memoryCache.get('location_consent');
    return val !== undefined ? val : null;
  },

  setLocationConsent(consent: boolean): void {
    memoryCache.set('location_consent', consent);
  },

  getHasSeenLaunch(): boolean {
    return Boolean(memoryCache.get('has_seen_launch'));
  },

  setHasSeenLaunch(seen: boolean): void {
    memoryCache.set('has_seen_launch', seen);
  },

  getHasCompletedOnboarding(): boolean {
    return Boolean(memoryCache.get('has_completed_onboarding'));
  },

  setHasCompletedOnboarding(completed: boolean): void {
    memoryCache.set('has_completed_onboarding', completed);
  },

  // 6. Offline Vector Map & Geometry Caching (Zero-connectivity tunnel navigation)
  saveVectorMap(
    scopeOrMap: string | {
      scope?: string;
      nodes: CachedMapNode[];
      segments?: CachedTrackSegment[];
      geometries?: Record<string, StationGeometry>;
      corridorChains?: Record<string, string[]>;
    },
    nodesArg?: CachedMapNode[],
    segmentsArg?: CachedTrackSegment[],
    corridorChainsArg?: Record<string, string[]>
  ): void {
    let scope = 'mumbai_suburban';
    let nodes: CachedMapNode[] = [];
    let segments: CachedTrackSegment[] = [];
    let corridorChains: Record<string, string[]> | undefined;
    let customGeometries: Record<string, StationGeometry> | undefined;

    if (typeof scopeOrMap === 'string') {
      scope = scopeOrMap;
      nodes = nodesArg || [];
      segments = segmentsArg || [];
      corridorChains = corridorChainsArg;
    } else if (scopeOrMap && typeof scopeOrMap === 'object') {
      scope = scopeOrMap.scope || 'mumbai_suburban';
      nodes = scopeOrMap.nodes || [];
      segments = scopeOrMap.segments || [];
      corridorChains = scopeOrMap.corridorChains;
      customGeometries = scopeOrMap.geometries;
    }

    // Index station geometries for instant tunnel coordinate lookups
    const geoMap: Record<string, StationGeometry> = customGeometries ? { ...customGeometries } : {};
    for (const node of nodes) {
      if (!geoMap[node.code]) {
        geoMap[node.code] = {
          code: node.code,
          name: node.name,
          line: node.line,
          x: node.x,
          y: node.y,
          z: node.z,
          platforms: node.platforms
        };
      }
    }
    // Populate adjacent codes from segments and corridor chains
    for (const seg of segments) {
      if (geoMap[seg.fromCode]) {
        const adj = geoMap[seg.fromCode].adjacentCodes || [];
        if (!adj.includes(seg.toCode)) adj.push(seg.toCode);
        geoMap[seg.fromCode].adjacentCodes = adj;
      }
      if (geoMap[seg.toCode]) {
        const adj = geoMap[seg.toCode].adjacentCodes || [];
        if (!adj.includes(seg.fromCode)) adj.push(seg.fromCode);
        geoMap[seg.toCode].adjacentCodes = adj;
      }
    }
    if (corridorChains) {
      for (const chain of Object.values(corridorChains)) {
        for (let i = 0; i < chain.length; i++) {
          const code = chain[i];
          if (geoMap[code]) {
            const adj = geoMap[code].adjacentCodes || [];
            if (i > 0 && !adj.includes(chain[i - 1])) adj.push(chain[i - 1]);
            if (i < chain.length - 1 && !adj.includes(chain[i + 1])) adj.push(chain[i + 1]);
            geoMap[code].adjacentCodes = adj;
          }
        }
      }
    }

    const vectorMap: CachedVectorMap = {
      scope,
      nodes,
      segments,
      geometries: geoMap,
      corridorChains,
      cachedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    memoryCache.set(`offline_vector_map_${scope}`, vectorMap);
    memoryCache.set('offline_map_nodes', nodes);
    memoryCache.set('offline_track_segments', segments);
    memoryCache.set('offline_station_geometries', geoMap);
  },

  getVectorMap(scope = 'mumbai_suburban'): CachedVectorMap | null {
    const map = memoryCache.get(`offline_vector_map_${scope}`);
    if (!map) return null;
    const geoMap = memoryCache.get('offline_station_geometries') || {};
    return { ...map, geometries: map.geometries || geoMap };
  },

  saveMapNodes(nodes: CachedMapNode[]): void {
    memoryCache.set('offline_map_nodes', nodes);
  },

  getMapNodes(): CachedMapNode[] {
    return memoryCache.get('offline_map_nodes') || [];
  },

  saveTrackSegments(segments: CachedTrackSegment[]): void {
    memoryCache.set('offline_track_segments', segments);
  },

  getTrackSegments(): CachedTrackSegment[] {
    return memoryCache.get('offline_track_segments') || [];
  },

  saveStationGeometries(geometries: Record<string, StationGeometry>): void {
    memoryCache.set('offline_station_geometries', geometries);
  },

  getStationGeometry(stationCode: string): StationGeometry | null {
    const geoMap: Record<string, StationGeometry> = memoryCache.get('offline_station_geometries') || {};
    return geoMap[stationCode] || null;
  },

  getTunnelAdjacentStations(stationCode: string): string[] {
    const geo = this.getStationGeometry(stationCode);
    return geo?.adjacentCodes || [];
  },

  hasCachedVectorMap(scope = 'mumbai_suburban'): boolean {
    return Boolean(memoryCache.get(`offline_vector_map_${scope}`));
  },

  clearVectorMapCache(scope?: string): void {
    if (scope) {
      memoryCache.delete(`offline_vector_map_${scope}`);
    } else {
      memoryCache.delete('offline_map_nodes');
      memoryCache.delete('offline_track_segments');
      memoryCache.delete('offline_station_geometries');
      for (const key of Array.from(memoryCache.keys())) {
        if (key.startsWith('offline_vector_map_')) {
          memoryCache.delete(key);
        }
      }
    }
  }
};
