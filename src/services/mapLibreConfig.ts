/**
 * MapLibre GL + OpenFreeMap Configuration & Geographic Projection
 * Completely free, open-source cartography. Zero Google Maps paid dependencies.
 */

export interface CityGeoBounds {
  center: [number, number]; // [longitude, latitude]
  zoom: number;
  minZoom: number;
  maxZoom: number;
  bounds?: [[number, number], [number, number]];
}

export const OPENFREEMAP_STYLES = {
  liberty: 'https://tiles.openfreemap.org/styles/liberty',
  bright: 'https://tiles.openfreemap.org/styles/bright',
  positron: 'https://tiles.openfreemap.org/styles/positron'
};

export const METRO_REGION_GEO_BOUNDS: Record<string, CityGeoBounds> = {
  mumbai: {
    center: [72.8777, 19.0760],
    zoom: 11,
    minZoom: 9,
    maxZoom: 18,
    bounds: [[72.70, 18.85], [73.35, 19.55]]
  },
  delhi: {
    center: [77.2090, 28.6139],
    zoom: 11,
    minZoom: 9,
    maxZoom: 18,
    bounds: [[76.85, 28.40], [77.55, 28.90]]
  },
  bengaluru: {
    center: [77.5946, 12.9716],
    zoom: 11,
    minZoom: 9,
    maxZoom: 18,
    bounds: [[77.40, 12.80], [77.80, 13.15]]
  },
  kolkata: {
    center: [88.3639, 22.5726],
    zoom: 11,
    minZoom: 9,
    maxZoom: 18,
    bounds: [[88.15, 22.40], [88.55, 22.75]]
  },
  chennai: {
    center: [80.2707, 13.0827],
    zoom: 11,
    minZoom: 9,
    maxZoom: 18,
    bounds: [[80.05, 12.85], [80.35, 13.25]]
  },
  hyderabad: {
    center: [78.4867, 17.3850],
    zoom: 11,
    minZoom: 9,
    maxZoom: 18,
    bounds: [[78.25, 17.20], [78.65, 17.55]]
  },
  pune: {
    center: [73.8567, 18.5204],
    zoom: 11,
    minZoom: 9,
    maxZoom: 18,
    bounds: [[73.65, 18.35], [74.05, 18.70]]
  },
  ahmedabad: {
    center: [72.5714, 23.0225],
    zoom: 11,
    minZoom: 9,
    maxZoom: 18,
    bounds: [[72.40, 22.85], [72.75, 23.15]]
  },
  kochi: {
    center: [76.2673, 9.9312],
    zoom: 12,
    minZoom: 9,
    maxZoom: 18,
    bounds: [[76.15, 9.80], [76.40, 10.15]]
  }
};

/**
 * Returns complete MapLibre style JSON or endpoint URL for open geographic tiles
 */
export function getMapLibreStyleUrl(style: 'liberty' | 'bright' | 'positron' = 'liberty'): string {
  return OPENFREEMAP_STYLES[style];
}
