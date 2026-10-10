/**
 * OpenRouteService Pedestrian Navigation Adapter
 * Uses official HeiGIT infrastructure (https://api.heigit.org), NOT deprecated endpoints.
 * Strictly respects railway interchange boundary: street navigation NEVER replaces FOB/station bridge data.
 */

import { getTransferWalkGuide } from './interchanges';

export interface PedestrianRouteRequest {
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  accessibleStepFree?: boolean;
  stationOriginCode?: string;
  stationDestCode?: string;
}

export interface PedestrianRouteResult {
  routeType: 'STREET_PEDESTRIAN' | 'INTERNAL_STATION_FOB' | 'CALCULATED_ESTIMATE';
  distanceMeters: number;
  durationMinutes: number;
  stepFreeAccessible: boolean;
  coordinates: Array<[number, number]>;
  instructions: string[];
  provenance: 'VERIFIED_API' | 'STATION_GEOMETRY' | 'CALCULATED_ESTIMATE';
  notice: string;
}

export class OpenRouteServiceAdapter {
  private baseUrl = 'https://api.heigit.org/v2/directions';

  isConfigured(): boolean {
    const key = process.env.ORS_API_KEY?.trim();
    return !!(key && !key.toLowerCase().includes('placeholder') && !key.toLowerCase().includes('my_ors'));
  }

  /**
   * Calculate pedestrian route between points or stations
   */
  async planPedestrianRoute(req: PedestrianRouteRequest): Promise<PedestrianRouteResult> {
    // 1. Critical Invariant: If routing is an internal station interchange (e.g. Dadar CR to WR, or GC Suburban to Metro),
    // strictly use internal station geometry / FOB data, NOT street routing!
    if (req.stationOriginCode && req.stationDestCode) {
      const orig = req.stationOriginCode.toUpperCase();
      const dest = req.stationDestCode.toUpperCase();

      // Check if this is an internal hub transfer
      const isDadarInterchange = (orig === 'DR' && dest === 'DDR') || (orig === 'DDR' && dest === 'DR');
      const isGhatkoparInterchange = (orig === 'GC' && dest === 'METRO_GHT') || (orig === 'METRO_GHT' && dest === 'GC');

      if (isDadarInterchange || isGhatkoparInterchange) {
        const hubCode = isDadarInterchange ? 'DR' : 'GC';
        const fromPf = isDadarInterchange
          ? (orig === 'DR' ? 'DR_CR_4' : 'DR_WR_1')
          : (orig === 'GC' ? 'GC_PF_1' : 'GC_METRO_1');
        const toPf = isDadarInterchange
          ? (dest === 'DR' ? 'DR_CR_4' : 'DR_WR_1')
          : (dest === 'GC' ? 'GC_PF_1' : 'GC_METRO_1');
        const guide = getTransferWalkGuide(hubCode, fromPf, toPf, req.accessibleStepFree);

        const instructions = (guide && guide.success && guide.steps && guide.steps.length > 0)
          ? guide.steps
          : [
            `Ascend ${isDadarInterchange ? 'North' : 'Metro Integrated'} Foot Overbridge (FOB) via stairs/elevator.`,
            `Cross corridor to target platform indicators.`,
            `Descend to target platform indicator.`
          ];

        return {
          routeType: 'INTERNAL_STATION_FOB',
          distanceMeters: (guide && guide.success && guide.distanceMeters > 0) ? guide.distanceMeters : (isDadarInterchange ? 320 : 180),
          durationMinutes: (guide && guide.success && guide.walkMinutes > 0) ? guide.walkMinutes : (isDadarInterchange ? 7 : 4),
          stepFreeAccessible: !!(guide && guide.success && guide.stepFreeAvailable),
          coordinates: [[req.startLon, req.startLat], [req.endLon, req.endLat]],
          instructions,
          provenance: 'STATION_GEOMETRY',
          notice: '[FOB_STATION_INTERCHANGE] Internal station foot-overbridge route. Street pedestrian routing strictly rejected to protect passenger track safety.'
        };
      }
    }

    // Coordinate validation
    if (
      isNaN(req.startLat) || isNaN(req.startLon) || isNaN(req.endLat) || isNaN(req.endLon) ||
      Math.abs(req.startLat) > 90 || Math.abs(req.endLat) > 90 ||
      Math.abs(req.startLon) > 180 || Math.abs(req.endLon) > 180
    ) {
      return {
        routeType: 'CALCULATED_ESTIMATE',
        distanceMeters: 0,
        durationMinutes: 0,
        stepFreeAccessible: false,
        coordinates: [],
        instructions: ['Invalid coordinates supplied for pedestrian route calculation.'],
        provenance: 'CALCULATED_ESTIMATE',
        notice: '[UNAVAILABLE_PATH] Coordinates out of range or malformed.'
      };
    }

    // Pre-calculate geometric distance
    const distMeters = this.calculateHaversineDistance(req.startLat, req.startLon, req.endLat, req.endLon);

    // Urban pedestrian limit: walking to station beyond 15 km is considered unavailable for pedestrian mode
    const MAX_WALK_DISTANCE_METERS = 15000;
    if (distMeters > MAX_WALK_DISTANCE_METERS) {
      return {
        routeType: 'CALCULATED_ESTIMATE',
        distanceMeters: Math.round(distMeters),
        durationMinutes: Math.ceil(distMeters / 75),
        stepFreeAccessible: false,
        coordinates: [
          [req.startLon, req.startLat],
          [req.endLon, req.endLat]
        ],
        instructions: [
          `Distance (${Math.round(distMeters / 1000)} km) exceeds realistic pedestrian walking range (15 km limit).`,
          `Please select public transit (Suburban EMU / Metro) or feeder road transport.`
        ],
        provenance: 'CALCULATED_ESTIMATE',
        notice: '[UNAVAILABLE_PATH] Pedestrian route exceeds walkable urban distance threshold. Public transit required.'
      };
    }

    // 2. If ORS API key is available, call HeiGIT foot-walking endpoint
    if (this.isConfigured()) {
      try {
        const profile = req.accessibleStepFree ? 'wheelchair' : 'foot-walking';
        const key = process.env.ORS_API_KEY!.trim();

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(`${this.baseUrl}/${profile}/geojson`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': key
          },
          body: JSON.stringify({
            coordinates: [
              [req.startLon, req.startLat],
              [req.endLon, req.endLat]
            ]
          }),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (response.ok) {
          const data: any = await response.json();
          const feature = data?.features?.[0];
          if (feature) {
            const summary = feature.properties?.summary;
            const dist = Math.round(summary?.distance || 0);
            const duration = Math.ceil((summary?.duration || 0) / 60);
            const coords = feature.geometry?.coordinates || [];
            const steps = feature.properties?.segments?.[0]?.steps?.map((s: any) => s.instruction) || [
              `Walk along public footpath for ${dist}m.`
            ];

            return {
              routeType: 'STREET_PEDESTRIAN',
              distanceMeters: dist,
              durationMinutes: duration,
              stepFreeAccessible: !!req.accessibleStepFree,
              coordinates: coords,
              instructions: steps,
              provenance: 'VERIFIED_API',
              notice: '[OPENROUTESERVICE_HEIGIT] Verified public pedestrian routing via api.heigit.org. Street routing does not represent internal station platform connections.'
            };
          }
        } else if (response.status === 404 || response.status === 400) {
          // Explicitly handle when HeiGIT cannot find a pedestrian path (e.g. wheelchair inaccessible or disconnected)
          if (req.accessibleStepFree) {
            return {
              routeType: 'CALCULATED_ESTIMATE',
              distanceMeters: Math.round(distMeters),
              durationMinutes: Math.ceil(distMeters / 75),
              stepFreeAccessible: false,
              coordinates: [[req.startLon, req.startLat], [req.endLon, req.endLat]],
              instructions: [
                'No verified wheelchair step-free pedestrian path found between specified locations on public street network.',
                'Urban walkways in this sector may contain curbs or stairs without ramps.'
              ],
              provenance: 'CALCULATED_ESTIMATE',
              notice: '[UNAVAILABLE_PATH] Step-free wheelchair path unavailable on verified pedestrian network.'
            };
          }
        }
      } catch {
        // Fall through to deterministic geometric estimate
      }
    }

    // 3. Deterministic Haversine Estimate Fallback
    // Average urban walking speed: 4.5 km/h = 75 meters / minute
    const walkMinutes = Math.max(1, Math.ceil(distMeters / 75));

    return {
      routeType: 'CALCULATED_ESTIMATE',
      distanceMeters: Math.round(distMeters),
      durationMinutes: walkMinutes,
      stepFreeAccessible: req.accessibleStepFree ?? false,
      coordinates: [
        [req.startLon, req.startLat],
        [req.endLon, req.endLat]
      ],
      instructions: [
        `Walk approximately ${Math.round(distMeters)} meters via public walkways (estimated ${walkMinutes} min at 4.5 km/h).`,
        `Exercise caution at road crossings. Station platform bridge connections require following station indicator boards.`
      ],
      provenance: 'CALCULATED_ESTIMATE',
      notice: '[CALCULATED_ESTIMATE] Offline geometric pedestrian estimate. Live HeiGIT routing API not configured or unavailable.'
    };
  }

  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
