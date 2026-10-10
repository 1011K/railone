import { MUMBAI_SUBURBAN_NODES } from '../fixtures/networkMapData';
import { METRO_STATIONS } from '../fixtures/metroData';
import { CITIES_REGISTRY } from '../fixtures/citiesData';

export interface CanonicalStationRecord {
  code: string;
  name: string;
  hindiName?: string;
  marathiName?: string;
  line: string;
  city: string;
  isMetro: boolean;
  aliases: string[];
}

export interface CanonicalNormalizationResult {
  query: string;
  matchedStation?: CanonicalStationRecord;
  candidates: CanonicalStationRecord[];
  isAmbiguous: boolean;
  confidence: 'EXACT' | 'FUZZY' | 'TRANSLITERATED' | 'NONE';
  explanation: string;
}

// Clean text for matching
function cleanText(str: string): string {
  return str.toLowerCase().trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
}

// Levenshtein distance for fuzzy typo tolerance (Task B3: Handle typos such as Ghatkoper)
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Index all stations
const stationsRegistry = new Map<string, CanonicalStationRecord>();

// 1. Mumbai Suburban Network
for (const node of MUMBAI_SUBURBAN_NODES) {
  const code = node.code.toUpperCase();
  stationsRegistry.set(code, {
    code: node.code,
    name: node.name,
    hindiName: node.hindiName,
    marathiName: node.marathiName,
    line: node.line || 'suburban',
    city: node.city || 'Mumbai',
    isMetro: false,
    aliases: [node.name, node.code, ...(node.hindiName ? [node.hindiName] : []), ...(node.marathiName ? [node.marathiName] : [])]
  });
}

// 2. Mumbai Metro Stations (Lines 1, 2A, 7, 3)
for (const ms of Object.values(METRO_STATIONS)) {
  const code = ms.code.toUpperCase();
  stationsRegistry.set(code, {
    code: ms.code,
    name: ms.name,
    hindiName: ms.hindiName || ms.marathiName,
    marathiName: ms.marathiName,
    line: ms.lineId || 'metro',
    city: 'Mumbai',
    isMetro: true,
    aliases: [ms.name, ms.code, ...(ms.hindiName ? [ms.hindiName] : []), ...(ms.marathiName ? [ms.marathiName] : [])]
  });
}

// 3. Pan-India Hubs from Cities Registry
for (const city of Object.values(CITIES_REGISTRY)) {
  for (const hub of city.primaryHubs) {
    const code = hub.code.toUpperCase();
    if (!stationsRegistry.has(code)) {
      stationsRegistry.set(code, {
        code: hub.code,
        name: hub.name,
        line: 'national',
        city: city.name,
        isMetro: false,
        aliases: [hub.name, hub.code]
      });
    }
  }
}

// Common typo & nickname aliases
const COMMON_ALIASES: Record<string, string> = {
  'ghatkoper': 'GC',
  'gatkopar': 'GC',
  'ghatcopar': 'GC',
  'ghatkopr': 'GC',
  'vt': 'CSMT',
  'victoria terminus': 'CSMT',
  'bost': 'CSMT',
  'dadar west': 'DDR',
  'dadar east': 'DR',
  'ghatkopar metro': 'METRO_GHT',
  'andheri metro': 'METRO_ADH',
  'bkc metro': 'METRO_BKC'
};

export function resolveStationCanonical(rawQuery: string): CanonicalNormalizationResult {
  const query = rawQuery.trim();
  if (!query) {
    return {
      query,
      candidates: [],
      isAmbiguous: false,
      confidence: 'NONE',
      explanation: 'Empty query.'
    };
  }

  const upper = query.toUpperCase();
  const cleaned = cleanText(query);

  // 1. Direct Code Match
  if (stationsRegistry.has(upper)) {
    const stn = stationsRegistry.get(upper)!;
    return {
      query,
      matchedStation: stn,
      candidates: [stn],
      isAmbiguous: false,
      confidence: 'EXACT',
      explanation: `Exact code match: ${stn.name} (${stn.code})`
    };
  }

  // 2. Known Alias / Typo Map (e.g. Ghatkoper -> GC)
  if (COMMON_ALIASES[cleaned]) {
    const code = COMMON_ALIASES[cleaned];
    if (stationsRegistry.has(code)) {
      const stn = stationsRegistry.get(code)!;
      return {
        query,
        matchedStation: stn,
        candidates: [stn],
        isAmbiguous: false,
        confidence: 'FUZZY',
        explanation: `Typo/alias match resolved to ${stn.name} (${stn.code})`
      };
    }
  }

  // 3. Ambiguous generic "Dadar" query
  if (cleaned === 'dadar') {
    const dr = stationsRegistry.get('DR');
    const ddr = stationsRegistry.get('DDR');
    const candidates = [dr, ddr].filter(Boolean) as CanonicalStationRecord[];
    return {
      query,
      candidates,
      isAmbiguous: true,
      confidence: 'EXACT',
      explanation: 'Dadar refers to both Central Railway (DR) and Western Railway (DDR) platforms.'
    };
  }

  // 4. Devanagari script match
  const isDevanagari = /[\u0900-\u097F]/.test(query);
  if (isDevanagari) {
    // 4a. Exact Devanagari match
    for (const stn of stationsRegistry.values()) {
      if (
        (stn.hindiName && stn.hindiName.trim() === query) ||
        (stn.marathiName && stn.marathiName.trim() === query) ||
        stn.aliases.some(a => /[\u0900-\u097F]/.test(a) && a.trim() === query)
      ) {
        return {
          query,
          matchedStation: stn,
          candidates: [stn],
          isAmbiguous: false,
          confidence: 'EXACT',
          explanation: `Exact Devanagari script match: ${stn.name} (${stn.code})`
        };
      }
    }

    // 4b. Devanagari substring & alias match
    const devMatches: CanonicalStationRecord[] = [];
    for (const stn of stationsRegistry.values()) {
      if (
        (stn.hindiName && (stn.hindiName.includes(query) || query.includes(stn.hindiName))) ||
        (stn.marathiName && (stn.marathiName.includes(query) || query.includes(stn.marathiName))) ||
        stn.aliases.some(a => /[\u0900-\u097F]/.test(a) && (a.trim() === query || (query.length >= 3 && a.includes(query))))
      ) {
        devMatches.push(stn);
      }
    }
    if (devMatches.length === 1) {
      return {
        query,
        matchedStation: devMatches[0],
        candidates: devMatches,
        isAmbiguous: false,
        confidence: 'TRANSLITERATED',
        explanation: `Devanagari match resolved to ${devMatches[0].name} (${devMatches[0].code})`
      };
    } else if (devMatches.length > 1) {
      return {
        query,
        candidates: devMatches,
        isAmbiguous: true,
        confidence: 'TRANSLITERATED',
        explanation: `Multiple stations match Devanagari query "${query}"`
      };
    }
  }

  // 5. English name / alias exact match
  const exactMatches: CanonicalStationRecord[] = [];
  for (const stn of stationsRegistry.values()) {
    if (cleanText(stn.name) === cleaned) {
      exactMatches.push(stn);
    } else if (stn.aliases.some(a => cleanText(a) === cleaned)) {
      exactMatches.push(stn);
    }
  }
  if (exactMatches.length === 1) {
    return {
      query,
      matchedStation: exactMatches[0],
      candidates: exactMatches,
      isAmbiguous: false,
      confidence: 'EXACT',
      explanation: `Exact match: ${exactMatches[0].name} (${exactMatches[0].code})`
    };
  } else if (exactMatches.length > 1) {
    return {
      query,
      candidates: exactMatches,
      isAmbiguous: true,
      confidence: 'EXACT',
      explanation: `Multiple stations match: ${exactMatches.map(s => s.name).join(', ')}`
    };
  }

  // 6. Substring match
  const substringMatches: CanonicalStationRecord[] = [];
  for (const stn of stationsRegistry.values()) {
    if (cleanText(stn.name).includes(cleaned) || cleanText(stn.code).includes(cleaned)) {
      substringMatches.push(stn);
    }
  }
  if (substringMatches.length === 1) {
    return {
      query,
      matchedStation: substringMatches[0],
      candidates: substringMatches,
      isAmbiguous: false,
      confidence: 'FUZZY',
      explanation: `Substring match: ${substringMatches[0].name} (${substringMatches[0].code})`
    };
  } else if (substringMatches.length > 1) {
    return {
      query,
      candidates: substringMatches,
      isAmbiguous: false,
      confidence: 'FUZZY',
      explanation: `Found ${substringMatches.length} candidate stations matching "${query}"`
    };
  }

  // 7. Fuzzy Levenshtein Distance (<= 2 edits)
  let bestStn: CanonicalStationRecord | undefined;
  let bestDist = 3;
  for (const stn of stationsRegistry.values()) {
    const dist = levenshteinDistance(cleaned, cleanText(stn.name));
    if (dist < bestDist && dist <= 2) {
      bestDist = dist;
      bestStn = stn;
    }
  }
  if (bestStn) {
    return {
      query,
      matchedStation: bestStn,
      candidates: [bestStn],
      isAmbiguous: false,
      confidence: 'FUZZY',
      explanation: `Fuzzy typographic match resolved to ${bestStn.name} (${bestStn.code})`
    };
  }

  return {
    query,
    candidates: [],
    isAmbiguous: false,
    confidence: 'NONE',
    explanation: `No matching stations found for "${query}"`
  };
}

export function searchCanonicalStations(
  query: string,
  cityId?: string,
  limit = 20
): CanonicalStationRecord[] {
  const norm = resolveStationCanonical(query);
  const results = new Map<string, CanonicalStationRecord>();

  if (norm.matchedStation) {
    results.set(norm.matchedStation.code, norm.matchedStation);
  }
  for (const c of norm.candidates) {
    if (!results.has(c.code)) {
      results.set(c.code, c);
    }
  }

  const q = query.toLowerCase().trim();
  for (const stn of stationsRegistry.values()) {
    if (results.size >= limit) break;
    if (results.has(stn.code)) continue;

    if (cityId && stn.city.toLowerCase() !== cityId.toLowerCase()) {
      continue;
    }

    if (
      stn.code.toLowerCase().includes(q) ||
      stn.name.toLowerCase().includes(q) ||
      (stn.hindiName && stn.hindiName.includes(q))
    ) {
      results.set(stn.code, stn);
    }
  }

  return [...results.values()].slice(0, limit);
}
