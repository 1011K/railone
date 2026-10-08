import { Station } from '../types/railway';
import { STATIONS } from '../fixtures/railwayData';
import { INSTITUTIONAL_AUTHORITIES } from '../models/authorities';

function authorityStationToStation(authStn: any): Station {
  return {
    id: `auth-${authStn.code.toLowerCase()}`,
    code: authStn.code,
    name: authStn.name,
    hindiName: authStn.nativeName,
    marathiName: authStn.nativeName,
    line: 'national',
    city: authStn.city,
    platforms: authStn.platforms,
    aliases: [authStn.name, authStn.code, ...(authStn.nativeName ? [authStn.nativeName] : [])]
  };
}

export interface StationNormalizationResult {
  query: string;
  matchedStation?: Station;
  candidates: Station[];
  isAmbiguous: boolean;
  confidence: 'EXACT' | 'FUZZY' | 'TRANSLITERATED' | 'NONE';
  explanation: string;
}

// Clean text for normalization
function cleanText(str: string): string {
  return str.toLowerCase().trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
}

// Levenshtein distance helper
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

/**
 * Normalizes station query in English, Hindi (Devanagari), Marathi, or transliterations.
 * Prevents hallucinated or fabricated station stops.
 */
export function normalizeStation(rawQuery: string): StationNormalizationResult {
  const query = rawQuery.trim();
  if (!query) {
    return {
      query,
      candidates: [],
      isAmbiguous: false,
      confidence: 'NONE',
      explanation: 'Empty station query provided.'
    };
  }

  const cleaned = cleanText(query);
  const upper = query.toUpperCase();

  // 1. Direct Station Code Match (e.g. "TNA", "DR", "KYN", "CSMT", "WAT", "TYO", "BER", "ZRH")
  if (STATIONS[upper]) {
    return {
      query,
      matchedStation: STATIONS[upper],
      candidates: [STATIONS[upper]],
      isAmbiguous: false,
      confidence: 'EXACT',
      explanation: `Exact station code match: ${STATIONS[upper].name} (${STATIONS[upper].code})`
    };
  }

  for (const auth of Object.values(INSTITUTIONAL_AUTHORITIES)) {
    const authStn = auth.stations.find(s => s.code.toUpperCase() === upper);
    if (authStn) {
      const stn = authorityStationToStation(authStn);
      return {
        query,
        matchedStation: stn,
        candidates: [stn],
        isAmbiguous: false,
        confidence: 'EXACT',
        explanation: `Exact station code match: ${stn.name} (${stn.code})`
      };
    }
  }

  const isDevanagariQuery = /[\u0900-\u097F]/.test(query);

  // 2. Exact Devanagari Match (Hindi or Marathi or Devanagari Alias)
  if (isDevanagariQuery) {
    for (const station of Object.values(STATIONS)) {
      if (
        (station.hindiName && station.hindiName.trim() === query) ||
        (station.marathiName && station.marathiName.trim() === query) ||
        station.aliases.some(a => /[\u0900-\u097F]/.test(a) && a.trim() === query)
      ) {
        return {
          query,
          matchedStation: station,
          candidates: [station],
          isAmbiguous: false,
          confidence: 'EXACT',
          explanation: `Exact Devanagari script match: ${station.name} (${station.code})`
        };
      }
    }

    // 3. Devanagari Substring & Alias Match (e.g. "कल्याण", "सीएसएमटी", "बोरीबंदर")
    const devanagariMatches = Object.values(STATIONS).filter(s => 
      (s.hindiName && (s.hindiName.includes(query) || query.includes(s.hindiName))) ||
      (s.marathiName && (s.marathiName.includes(query) || query.includes(s.marathiName))) ||
      s.aliases.some(a => /[\u0900-\u097F]/.test(a) && (a.trim() === query || (query.length >= 3 && a.includes(query))))
    );

    if (devanagariMatches.length === 1) {
      return {
        query,
        matchedStation: devanagariMatches[0],
        candidates: devanagariMatches,
        isAmbiguous: false,
        confidence: 'TRANSLITERATED',
        explanation: `Devanagari match resolved to ${devanagariMatches[0].name} (${devanagariMatches[0].code})`
      };
    } else if (devanagariMatches.length > 1) {
      return {
        query,
        candidates: devanagariMatches,
        isAmbiguous: true,
        confidence: 'TRANSLITERATED',
        explanation: `Multiple stations match Devanagari input "${query}". Please select: ${devanagariMatches.map(s => `${s.name} [${s.code}]`).join(', ')}`
      };
    }
  }

  // 4. Exact English Name or Alias Match
  const exactMatches: Station[] = [];
  for (const station of Object.values(STATIONS)) {
    if (cleanText(station.name) === cleaned) {
      exactMatches.push(station);
      continue;
    }
    if (station.aliases.some(a => cleanText(a) === cleaned)) {
      exactMatches.push(station);
    }
  }

  if (exactMatches.length === 0) {
    for (const auth of Object.values(INSTITUTIONAL_AUTHORITIES)) {
      for (const s of auth.stations) {
        if (cleanText(s.name) === cleaned || (s.nativeName && cleanText(s.nativeName) === cleaned)) {
          exactMatches.push(authorityStationToStation(s));
        }
      }
    }
  }

  // Ambiguity check: e.g. "Dadar" matches DR (Central) and DDR (Western)
  if (exactMatches.length === 1) {
    return {
      query,
      matchedStation: exactMatches[0],
      candidates: exactMatches,
      isAmbiguous: false,
      confidence: 'EXACT',
      explanation: `Resolved to ${exactMatches[0].name} (${exactMatches[0].code})`
    };
  } else if (exactMatches.length > 1) {
    return {
      query,
      matchedStation: exactMatches[0], // default to Central if Dadar
      candidates: exactMatches,
      isAmbiguous: true,
      confidence: 'EXACT',
      explanation: `Ambiguous station "${query}": Multiple lines match (${exactMatches.map(s => `${s.name} [${s.code}]`).join(', ')}). Defaulting to ${exactMatches[0].code}.`
    };
  }

  // 5. Substring / Prefix Match in Aliases and Names (requires at least 3 chars)
  let substringMatches = cleaned.length >= 3 ? Object.values(STATIONS).filter(s => 
    cleanText(s.name).includes(cleaned) ||
    s.aliases.some(a => cleanText(a).includes(cleaned) || (cleaned.length >= 4 && cleanText(a).length >= 4 && cleaned.includes(cleanText(a))))
  ) : [];

  if (substringMatches.length === 0 && cleaned.length >= 3) {
    for (const auth of Object.values(INSTITUTIONAL_AUTHORITIES)) {
      for (const s of auth.stations) {
        if (cleanText(s.name).includes(cleaned) || (s.nativeName && cleanText(s.nativeName).includes(cleaned))) {
          substringMatches.push(authorityStationToStation(s));
        }
      }
    }
  }

  if (substringMatches.length === 1) {
    return {
      query,
      matchedStation: substringMatches[0],
      candidates: substringMatches,
      isAmbiguous: false,
      confidence: 'FUZZY',
      explanation: `Partial match resolved to ${substringMatches[0].name} (${substringMatches[0].code})`
    };
  } else if (substringMatches.length > 1) {
    return {
      query,
      matchedStation: substringMatches[0],
      candidates: substringMatches,
      isAmbiguous: true,
      confidence: 'FUZZY',
      explanation: `Multiple candidates found for "${query}": ${substringMatches.map(s => `${s.name} [${s.code}]`).join(', ')}`
    };
  }

  // 6. Fuzzy Distance Match (Levenshtein: scale max distance by query length to prevent false positives)
  const maxAllowedDist = cleaned.length >= 6 ? 2 : cleaned.length >= 4 ? 1 : 0;
  const fuzzyCandidates: { station: Station; dist: number }[] = [];

  if (maxAllowedDist > 0) {
    for (const station of Object.values(STATIONS)) {
      let bestDist = levenshteinDistance(cleaned, cleanText(station.name));
      for (const alias of station.aliases) {
        const dist = levenshteinDistance(cleaned, cleanText(alias));
        if (dist < bestDist) bestDist = dist;
      }
      if (bestDist <= maxAllowedDist) {
        fuzzyCandidates.push({ station, dist: bestDist });
      }
    }
  }

  fuzzyCandidates.sort((a, b) => a.dist - b.dist);

  if (fuzzyCandidates.length > 0) {
    const top = fuzzyCandidates[0].station;
    return {
      query,
      matchedStation: top,
      candidates: fuzzyCandidates.map(c => c.station),
      isAmbiguous: fuzzyCandidates.length > 1 && fuzzyCandidates[0].dist === fuzzyCandidates[1]?.dist,
      confidence: 'FUZZY',
      explanation: `Closest phonetic/spelling match: ${top.name} (${top.code})`
    };
  }

  // 7. No match found
  return {
    query,
    candidates: [],
    isAmbiguous: false,
    confidence: 'NONE',
    explanation: `Station "${query}" not recognized in verified Mumbai Suburban or National railway index.`
  };
}

export function normalizeStationCode(query: string): string {
  if (!query) return '';
  const res = normalizeStation(query);
  return res.matchedStation ? res.matchedStation.code : query.toUpperCase().trim();
}

export const normalizeStationInput = normalizeStation;

