import { STATIONS } from '../../fixtures/railwayData';
import { PAN_INDIA_NODES } from '../../fixtures/networkMapData';
import { METRO_STATIONS } from '../../fixtures/metroData';
import { CITY_PACKS } from '../../engine/multimodal/cityPacks';
import { normalizeStationInput, normalizeStationCode } from '../../engine/stationNormalizer';
import { Station, RegionalLine } from '../../types/railway';

// Unified station registry combining Suburban, National Trunk, and Metro networks
const allStationsMap = new Map<string, Station>();

// 1. Mumbai Suburban
for (const s of Object.values(STATIONS)) {
  allStationsMap.set(s.code.toUpperCase(), s);
}

// 2. Pan India National Trunk
for (const s of PAN_INDIA_NODES) {
  if (!allStationsMap.has(s.code.toUpperCase())) {
    allStationsMap.set(s.code.toUpperCase(), {
      id: s.id,
      code: s.code,
      name: s.name,
      hindiName: s.hindiName,
      marathiName: s.marathiName,
      line: 'national',
      city: s.city,
      platforms: s.platforms,
      isInterchange: s.isInterchange,
      aliases: [s.name, s.code]
    });
  }
}

// 3. Mumbai Metro Stations
for (const ms of Object.values(METRO_STATIONS)) {
  if (!allStationsMap.has(ms.code.toUpperCase())) {
    allStationsMap.set(ms.code.toUpperCase(), {
      id: ms.id,
      code: ms.code,
      name: ms.name,
      hindiName: ms.hindiName,
      marathiName: ms.marathiName,
      line: 'metro',
      city: 'Mumbai',
      platforms: [1, 2],
      isInterchange: ms.isInterchange,
      aliases: [ms.name, ms.code]
    });
  }
}

// 4. All 9 Indian Urban Agglomerations (City Packs)
for (const pack of Object.values(CITY_PACKS)) {
  for (const n of pack.nodes) {
    const code = n.code.toUpperCase();
    if (!allStationsMap.has(code)) {
      allStationsMap.set(code, {
        id: n.id,
        code: n.code,
        name: n.name,
        hindiName: n.nativeName,
        marathiName: n.nativeName,
        line: n.mode === 'metro' ? 'metro' : 'national',
        city: pack.name || pack.cityId,
        platforms: n.platforms || [1, 2],
        isInterchange: n.isInterchange,
        aliases: [n.name, n.code, ...(n.aliases || [])]
      });
    }
  }
}

export function getAllStations(): Station[] {
  return Array.from(allStationsMap.values());
}

export function getStationByCode(code: string): Station | undefined {
  if (!code) return undefined;
  const normalized = normalizeStationCode(code);
  return allStationsMap.get(normalized.toUpperCase()) || allStationsMap.get(code.toUpperCase());
}

export function searchStations(
  query: string,
  line?: RegionalLine,
  limit = 20,
  city?: string
): Station[] {
  const cityFilter = city?.trim().toLowerCase();

  if (!query || !query.trim()) {
    let all = getAllStations();
    if (line) all = all.filter(s => s.line === line);
    if (cityFilter) all = all.filter(s => s.city.toLowerCase() === cityFilter);
    return all.slice(0, limit);
  }

  const q = query.trim().toLowerCase();
  const normalizedSearch = normalizeStationInput(q);
  const targetCode = normalizedSearch.matchedStation?.code?.toUpperCase();

  const results: Station[] = [];
  const seen = new Set<string>();

  // If exact code or alias match found by normalizer, put it first
  if (targetCode && allStationsMap.has(targetCode)) {
    const s = allStationsMap.get(targetCode)!;
    const matchesLine = !line || s.line === line;
    const matchesCity = !cityFilter || s.city.toLowerCase() === cityFilter;
    if (matchesLine && matchesCity) {
      results.push(s);
      seen.add(s.code);
    }
  }

  for (const s of allStationsMap.values()) {
    if (seen.has(s.code)) continue;
    if (line && s.line !== line) continue;
    if (cityFilter && s.city.toLowerCase() !== cityFilter) continue;

    const codeMatch = s.code.toLowerCase().includes(q);
    const nameMatch = s.name.toLowerCase().includes(q);
    const hindiMatch = s.hindiName && s.hindiName.includes(query);
    const marathiMatch = s.marathiName && s.marathiName.includes(query);
    const aliasMatch = s.aliases && s.aliases.some(a => a.toLowerCase().includes(q));

    if (codeMatch || nameMatch || hindiMatch || marathiMatch || aliasMatch) {
      results.push(s);
      seen.add(s.code);
      if (results.length >= limit) break;
    }
  }

  return results;
}

export function getStationSnapshot(): {
  totalStations: number;
  byCity: Record<string, number>;
  byLine: Record<string, number>;
  sample: Station[];
} {
  const all = getAllStations();
  const byCity: Record<string, number> = {};
  const byLine: Record<string, number> = {};

  for (const s of all) {
    byCity[s.city] = (byCity[s.city] || 0) + 1;
    byLine[s.line] = (byLine[s.line] || 0) + 1;
  }

  return {
    totalStations: all.length,
    byCity,
    byLine,
    sample: all.slice(0, 10)
  };
}
