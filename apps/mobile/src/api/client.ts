import { currentPlatform, expoHostUri, isPhysicalDevice } from './platformHelper';

export function resolveApiBaseUrl(): string {
  // 1. Explicit environment variable override
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Web browser: standard origin or localhost:3000
  if (currentPlatform === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      return `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;
    }
    return 'http://localhost:3000/api/v1';
  }

  // 3. Expo development server host URI (auto-detects local LAN IP for physical device & emulator)
  if (expoHostUri) {
    const host = expoHostUri.split(':')[0];
    return `http://${host}:3000/api/v1`;
  }

  // 4. Physical device guard: throw explicit error when physical device lacks API configuration
  if (isPhysicalDevice) {
    throw new Error(
      'RailOne backend unreachable: Physical device detected without configured API URL. ' +
      'Please configure EXPO_PUBLIC_API_URL or run via Expo Dev Server on the same Wi-Fi network.'
    );
  }

  // 5. Android Emulator loopback
  if (currentPlatform === 'android') {
    return 'http://10.0.2.2:3000/api/v1';
  }

  // 6. iOS Simulator / Node / Default
  return 'http://localhost:3000/api/v1';
}

// A new demo profile gets its own scoped token. This is not verified user sign-in.
// Native storage of this token requires a separate secure-storage integration.
let demoToken: string | null = null;
let tokenPending: Promise<string> | null = null;
async function demoAuth(): Promise<Record<string, string>> {
  if (!demoToken) {
    if (!tokenPending) {
      tokenPending = fetchJson<{ token: string }>('/passengers', {
        method: 'POST',
        body: JSON.stringify({ name: 'Demo Commuter', preferredLanguage: 'en' })
      }).then(response => {
        if (!response.token) throw new Error('Demo passenger session unavailable.');
        demoToken = response.token;
        return demoToken;
      }).finally(() => { tokenPending = null; });
    }
    await tokenPending;
  }
  return { Authorization: `Bearer ${demoToken}` };
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = resolveApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
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
  resolveApiBaseUrl,

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
    timeWindowMinutes?: number;
    acOnly?: boolean;
    classPreference?: string;
    transitModeFilter?: string;
    priority?: 'fastest' | 'least_crowded' | 'lowest_fare' | 'fewest_transfers';
  }): Promise<any[]> {
    const q = new URLSearchParams({
      from: params.from,
      to: params.to
    });
    if (params.departureTime) q.append('departureTime', params.departureTime);
    if (params.arriveBy) q.append('arriveBy', params.arriveBy);
    if (params.timeWindowMinutes) q.append('timeWindowMinutes', String(params.timeWindowMinutes));
    if (params.acOnly) q.append('acOnly', 'true');
    if (params.classPreference) q.append('classPreference', params.classPreference);
    if (params.transitModeFilter) q.append('transitModeFilter', params.transitModeFilter);
    if (params.priority) q.append('priority', params.priority);

    const data = await fetchJson<{ count: number; itineraries: any[] }>(`/routes/search?${q.toString()}`);
    return data.itineraries;
  },

  // Prototype multimodal routes: returned fares and journey timing are model estimates.
  async searchMultimodalRoutes(params: {
    city: string;
    origin: string;
    destination: string;
    date?: string;
    departureTime?: string;
  }): Promise<any[]> {
    const q = new URLSearchParams({
      city: params.city,
      origin: params.origin,
      destination: params.destination
    });
    if (params.date) q.append('date', params.date);
    if (params.departureTime) q.append('departureTime', params.departureTime);
    const data = await fetchJson<{ itineraries: any[] }>(`/multimodal/plan?${q.toString()}`);
    return data.itineraries || [];
  },

  // Retrieve the city-specific graph stops, including metro, bus and ferry hubs.
  async getMultimodalCityStations(cityId: string): Promise<Array<{ code: string; name: string }>> {
    if (!/^[a-z_]+$/.test(cityId)) return [];
    const data = await fetchJson<{ cityPack: { nodes: any[] } }>(`/multimodal/city/${encodeURIComponent(cityId)}`);
    return (data.cityPack?.nodes || [])
      .filter(node => node?.code && node?.name)
      .map(node => ({ code: String(node.code), name: String(node.name) }));
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
    ticketType?: 'STANDARD_JOURNEY' | 'RETURN_JOURNEY' | 'SEASON_MST' | 'PLATFORM_TICKET' | 'METRO_TOKEN' | 'UNRESERVED_SUBURBAN';
    quota?: string;
    passengers: Array<{ name: string; age: number; gender: string }>;
    paymentMethod?: string;
    idempotencyKey?: string;
  }): Promise<any> {
    const headers: Record<string, string> = await demoAuth();
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
      method: 'POST',
      headers: await demoAuth()
    });
    return data.booking;
  },

  // 6. Tickets & Cancellations
  async getTickets(category?: string, passengerProfileId?: string): Promise<any[]> {
    const q = new URLSearchParams();
    if (category) q.append('category', category);
    if (passengerProfileId) q.append('passengerProfileId', passengerProfileId);
    const data = await fetchJson<{ count: number; tickets: any[] }>(`/tickets?${q.toString()}`, { headers: await demoAuth() });
    return data.tickets;
  },

  async cancelTicket(bookingId: string, reason?: string): Promise<any> {
    const data = await fetchJson<{ cancellation: any }>(`/tickets/${encodeURIComponent(bookingId)}/cancel`, {
      method: 'POST',
      headers: await demoAuth(),
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
