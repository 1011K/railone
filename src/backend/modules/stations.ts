import { STATIONS } from '../../fixtures/railwayData';
import { PAN_INDIA_NODES } from '../../fixtures/networkMapData';
import { METRO_STATIONS } from '../../fixtures/metroData';
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

export function getAllStations(): Station[] {
  return Array.from(allStationsMap.values());
}

export function getStationByCode(code: string): Station | undefined {
  if (!code) return undefined;
  const normalized = normalizeStationCode(code);
  return allStationsMap.get(normalized.toUpperCase()) || allStationsMap.get(code.toUpperCase());
}

export function searchStations(query: string, line?: RegionalLine, limit = 20): Station[] {
  if (!query || !query.trim()) {
    const all = getAllStations();
    return line ? all.filter(s => s.line === line).slice(0, limit) : all.slice(0, limit);
  }

  const q = query.trim().toLowerCase();
  const normalizedSearch = normalizeStationInput(q);
  const targetCode = normalizedSearch.matchedStation?.code?.toUpperCase();

  const results: Station[] = [];
  const seen = new Set<string>();

  // If exact code or alias match found by normalizer, put it first
  if (targetCode && allStationsMap.has(targetCode)) {
    const s = allStationsMap.get(targetCode)!;
    if (!line || s.line === line) {
      results.push(s);
      seen.add(s.code);
    }
  }

  for (const s of allStationsMap.values()) {
    if (seen.has(s.code)) continue;
    if (line && s.line !== line) continue;

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
