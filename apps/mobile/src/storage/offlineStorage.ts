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

// Durable storage bridge: leverages device localStorage with resilient memory fallback
if (typeof globalThis !== 'undefined' && !globalThis.localStorage) {
  const polyfillStore = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => polyfillStore.get(key) ?? null,
    setItem: (key: string, value: string) => polyfillStore.set(key, String(value)),
    removeItem: (key: string) => polyfillStore.delete(key),
    clear: () => polyfillStore.clear(),
    get length() { return polyfillStore.size; },
    key: (index: number) => Array.from(polyfillStore.keys())[index] ?? null
  };
}

const memoryCache = new Map<string, any>();

function loadDurable<T>(key: string, defaultValue: T): T {
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    try {
      const raw = globalThis.localStorage.getItem(`railone_${key}`);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        memoryCache.set(key, parsed);
        return parsed as T;
      }
    } catch {
      // ignore
    }
  }
  return memoryCache.has(key) ? memoryCache.get(key) : defaultValue;
}

function saveDurable<T>(key: string, value: T): void {
  memoryCache.set(key, value);
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    try {
      globalThis.localStorage.setItem(`railone_${key}`, JSON.stringify(value));
    } catch {
      // ignore
    }
  }
}

function deleteDurable(key: string): void {
  memoryCache.delete(key);
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    try {
      globalThis.localStorage.removeItem(`railone_${key}`);
    } catch {
      // ignore
    }
  }
}

export const OfflineStorage = {
  isStorageDurable(): boolean {
    return typeof globalThis !== 'undefined' && Boolean(globalThis.localStorage);
  },

  // 1. Station Index Cache
  saveStations(stations: CachedStation[]): void {
    saveDurable('offline_stations', stations);
  },

  getStations(): CachedStation[] {
    return loadDurable('offline_stations', [] as CachedStation[]);
  },

  // 2. Recent Searches
  addRecentSearch(fromCode: string, toCode: string): void {
    const list: Array<{ from: string; to: string; timestamp: string }> = loadDurable('recent_searches', []);
    const filtered = list.filter(item => !(item.from === fromCode && item.to === toCode));
    filtered.unshift({ from: fromCode, to: toCode, timestamp: new Date().toISOString() });
    saveDurable('recent_searches', filtered.slice(0, 10));
  },

  getRecentSearches(): Array<{ from: string; to: string; timestamp: string }> {
    return loadDurable('recent_searches', []);
  },

  // 3. Offline Ticket Specimen Cache
  saveTickets(tickets: CachedTicketRecord[]): void {
    saveDurable('offline_tickets', tickets);
  },

  getTickets(): CachedTicketRecord[] {
    return loadDurable('offline_tickets', [] as CachedTicketRecord[]);
  },

  saveTicket(ticket: CachedTicketRecord): void {
    const existing: CachedTicketRecord[] = loadDurable('offline_tickets', []);
    const filtered = existing.filter(t => t.id !== ticket.id);
    filtered.unshift(ticket);
    saveDurable('offline_tickets', filtered);
  },

  // 4. Saved Commuter Journeys
  saveSavedJourney(journey: { id: string; fromStationCode: string; fromStationName: string; toStationCode: string; toStationName: string; preferredClass?: string }): void {
    const existing: any[] = loadDurable('saved_journeys', []);
    const filtered = existing.filter(j => j.id !== journey.id);
    filtered.unshift(journey);
    saveDurable('saved_journeys', filtered);
  },

  getSavedJourneys(): Array<{ id: string; fromStationCode: string; fromStationName: string; toStationCode: string; toStationName: string; preferredClass?: string }> {
    return loadDurable('saved_journeys', []);
  },

  // 5. User Preferences & Onboarding
  getUserCity(): string {
    return loadDurable('user_city', 'mumbai');
  },

  setUserCity(city: string): void {
    saveDurable('user_city', city);
  },

  getUserProfile(): { name?: string; phone?: string; isGuest: boolean } | null {
    return loadDurable('user_profile', null);
  },

  setUserProfile(profile: { name?: string; phone?: string; isGuest: boolean }): void {
    saveDurable('user_profile', profile);
  },

  getLocationConsent(): boolean | null {
    const val = loadDurable('location_consent', null);
    return val !== undefined ? val : null;
  },

  setLocationConsent(consent: boolean): void {
    saveDurable('location_consent', consent);
  },

  getHasSeenLaunch(): boolean {
    return Boolean(loadDurable('has_seen_launch', false));
  },

  setHasSeenLaunch(seen: boolean): void {
    saveDurable('has_seen_launch', seen);
  },

  getHasCompletedOnboarding(): boolean {
    return Boolean(loadDurable('has_completed_onboarding', false));
  },

  setHasCompletedOnboarding(completed: boolean): void {
    saveDurable('has_completed_onboarding', completed);
  },

  getStorageVersion(): string {
    return loadDurable('storage_schema_version', '1.0.0');
  },

  setStorageVersion(version: string): void {
    saveDurable('storage_schema_version', version);
  },

  migrateStorageSchema(): { migrated: boolean; fromVersion: string; toVersion: string } {
    const fromVersion = this.getStorageVersion();
    const TARGET_VERSION = '1.1.0';
    if (fromVersion === TARGET_VERSION) {
      return { migrated: false, fromVersion, toVersion: TARGET_VERSION };
    }

    const profile = this.getUserProfile();
    if (profile && typeof profile === 'object' && typeof profile.isGuest === 'undefined') {
      this.setUserProfile({ ...profile, isGuest: false });
    }

    const tickets = this.getTickets();
    let ticketsUpdated = false;
    const migratedTickets = tickets.map(t => {
      if (!t.cachedAt) {
        ticketsUpdated = true;
        return { ...t, cachedAt: new Date().toISOString() };
      }
      return t;
    });
    if (ticketsUpdated) {
      this.saveTickets(migratedTickets);
    }

    this.setStorageVersion(TARGET_VERSION);
    return { migrated: true, fromVersion, toVersion: TARGET_VERSION };
  },

  _resetMemoryCacheOnly(): void {
    memoryCache.clear();
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
    saveDurable(`offline_vector_map_${scope}`, vectorMap);
    saveDurable('offline_map_nodes', nodes);
    saveDurable('offline_track_segments', segments);
    saveDurable('offline_station_geometries', geoMap);
  },

  getVectorMap(scope = 'mumbai_suburban'): CachedVectorMap | null {
    const map = loadDurable<CachedVectorMap | null>(`offline_vector_map_${scope}`, null);
    if (!map) return null;
    const geoMap = loadDurable<Record<string, StationGeometry>>('offline_station_geometries', {});
    return { ...map, geometries: map.geometries || geoMap };
  },

  saveMapNodes(nodes: CachedMapNode[]): void {
    saveDurable('offline_map_nodes', nodes);
  },

  getMapNodes(): CachedMapNode[] {
    return loadDurable('offline_map_nodes', [] as CachedMapNode[]);
  },

  saveTrackSegments(segments: CachedTrackSegment[]): void {
    saveDurable('offline_track_segments', segments);
  },

  getTrackSegments(): CachedTrackSegment[] {
    return loadDurable('offline_track_segments', [] as CachedTrackSegment[]);
  },

  saveStationGeometries(geometries: Record<string, StationGeometry>): void {
    saveDurable('offline_station_geometries', geometries);
  },

  getStationGeometry(stationCode: string): StationGeometry | null {
    const geoMap = loadDurable<Record<string, StationGeometry>>('offline_station_geometries', {});
    return geoMap[stationCode] || null;
  },

  getTunnelAdjacentStations(stationCode: string): string[] {
    const geo = this.getStationGeometry(stationCode);
    return geo?.adjacentCodes || [];
  },

  hasCachedVectorMap(scope = 'mumbai_suburban'): boolean {
    return Boolean(loadDurable(`offline_vector_map_${scope}`, null));
  },

  clearVectorMapCache(scope?: string): void {
    if (scope) {
      deleteDurable(`offline_vector_map_${scope}`);
    } else {
      deleteDurable('offline_map_nodes');
      deleteDurable('offline_track_segments');
      deleteDurable('offline_station_geometries');
      if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < globalThis.localStorage.length; i++) {
            const k = globalThis.localStorage.key(i);
            if (k && k.startsWith('railone_offline_vector_map_')) {
              keysToRemove.push(k.replace('railone_', ''));
            }
          }
          keysToRemove.forEach(k => deleteDurable(k));
        } catch {}
      }
      for (const key of Array.from(memoryCache.keys())) {
        if (key.startsWith('offline_vector_map_')) {
          memoryCache.delete(key);
        }
      }
    }
  }
};
