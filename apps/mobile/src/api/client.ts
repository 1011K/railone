/**
 * Typed Backend Client for RailOne Next Mobile Application
 * Directly targets the versioned /api/v1 service-oriented backend contracts.
 */

const BASE_URL = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || 'http://localhost:3000/api/v1';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options?.headers || {})
      }
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || `Request failed with HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    // If network unavailable, surface graceful structured offline failure
    throw new Error(err.message || 'Network connection failed. Offline cache active.');
  }
}

export const MobileApiClient = {
  // 1. Stations
  async searchStations(q: string, line?: string): Promise<any[]> {
    const params = new URLSearchParams({ q });
    if (line) params.append('line', line);
    const data = await fetchJson<{ count: number; stations: any[] }>(`/stations/search?${params.toString()}`);
    return data.stations;
  },

  // 2. Route Planning
  async searchRoutes(params: {
    from: string;
    to: string;
    departureTime?: string;
    arriveBy?: string;
    acOnly?: boolean;
    classPreference?: string;
    transitModeFilter?: string;
  }): Promise<any[]> {
    const q = new URLSearchParams({
      from: params.from,
      to: params.to
    });
    if (params.departureTime) q.append('departureTime', params.departureTime);
    if (params.arriveBy) q.append('arriveBy', params.arriveBy);
    if (params.acOnly) q.append('acOnly', 'true');
    if (params.classPreference) q.append('classPreference', params.classPreference);
    if (params.transitModeFilter) q.append('transitModeFilter', params.transitModeFilter);

    const data = await fetchJson<{ count: number; itineraries: any[] }>(`/routes/search?${q.toString()}`);
    return data.itineraries;
  },

  // 3. Train Status
  async getTrainStatus(trainNumber: string): Promise<any> {
    const data = await fetchJson<{ status: any }>(`/trains/${encodeURIComponent(trainNumber)}/status`);
    return data.status;
  },

  // 4. Availability
  async checkAvailability(trainNumber: string, date: string, quota = 'GN'): Promise<any> {
    const q = new URLSearchParams({ train: trainNumber, date, quota });
    return fetchJson<any>(`/availability?${q.toString()}`);
  },

  // 5. Bookings & Ticketing (Server-Side Idempotent)
  async createBooking(bookingData: {
    trainNumber: string;
    journeyDate: string;
    fromStationCode: string;
    toStationCode: string;
    classBooked: string;
    quota?: string;
    passengers: Array<{ name: string; age: number; gender: string }>;
    paymentMethod?: string;
    idempotencyKey?: string;
  }): Promise<any> {
    const headers: Record<string, string> = {};
    if (bookingData.idempotencyKey) {
      headers['X-Idempotency-Key'] = bookingData.idempotencyKey;
    }
    const data = await fetchJson<{ booking: any }>('/bookings', {
      method: 'POST',
      headers,
      body: JSON.stringify(bookingData)
    });
    return data.booking;
  },

  async reconcileBooking(bookingId: string): Promise<any> {
    const data = await fetchJson<{ booking: any }>(`/bookings/${encodeURIComponent(bookingId)}/reconcile`, {
      method: 'POST'
    });
    return data.booking;
  },

  // 6. Tickets & Cancellations
  async getTickets(category?: string, passengerProfileId?: string): Promise<any[]> {
    const q = new URLSearchParams();
    if (category) q.append('category', category);
    if (passengerProfileId) q.append('passengerProfileId', passengerProfileId);
    const data = await fetchJson<{ count: number; tickets: any[] }>(`/tickets?${q.toString()}`);
    return data.tickets;
  },

  async cancelTicket(bookingId: string, reason?: string): Promise<any> {
    const data = await fetchJson<{ cancellation: any }>(`/tickets/${encodeURIComponent(bookingId)}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    return data.cancellation;
  },

  // 7. RailSathi Voice Agent
  async startVoiceSession(language = 'en'): Promise<any> {
    const data = await fetchJson<{ session: any }>('/voice/session', {
      method: 'POST',
      body: JSON.stringify({ language })
    });
    return data.session;
  },

  async sendVoiceTurn(sessionId: string, utterance: string, language = 'en'): Promise<any> {
    return fetchJson<any>('/voice/turn', {
      method: 'POST',
      body: JSON.stringify({ sessionId, utterance, language })
    });
  },

  // 8. Station FOB Wayfinding & Interchanges
  async getInterchangeHubs(): Promise<any[]> {
    const data = await fetchJson<{ hubs: any[] }>('/interchanges');
    return data.hubs;
  },

  async getStationLayout(stationCode: string): Promise<any> {
    const data = await fetchJson<{ layout: any }>(`/interchanges/${encodeURIComponent(stationCode)}/layout`);
    return data.layout;
  },

  async getTransferWalk(stationCode: string, fromPf: string, toPf: string, stepFree = false): Promise<any> {
    const q = new URLSearchParams({ from: fromPf, to: toPf, stepFree: stepFree ? 'true' : 'false' });
    const data = await fetchJson<{ walkGuide: any }>(`/interchanges/${encodeURIComponent(stationCode)}/walk?${q.toString()}`);
    return data.walkGuide;
  },

  // 9. Fares & Tariffs
  async getFareQuote(
    serviceType: 'suburban' | 'metro' | 'express',
    distanceKm?: number,
    travelClass = 'II',
    isSuperfast = false,
    fromStationCode?: string,
    toStationCode?: string
  ): Promise<any> {
    const data = await fetchJson<{ quote: any; distanceKm?: number }>('/fares/quote', {
      method: 'POST',
      body: JSON.stringify({
        serviceType,
        distanceKm,
        travelClass,
        isSuperfast,
        from: fromStationCode,
        to: toStationCode
      })
    });
    return data.quote ? { ...data.quote, calculatedDistance: data.distanceKm } : data;
  },

  // 10. Metro Network
  async getMetroLines(): Promise<any[]> {
    const data = await fetchJson<{ lines: any[] }>('/metro/lines');
    return data.lines;
  },

  // 11. Health
  async getHealth(): Promise<any> {
    return fetchJson<any>('/health');
  }
};
