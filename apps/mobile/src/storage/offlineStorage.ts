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
  }
};
