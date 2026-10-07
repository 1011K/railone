import {
  METRO_LINES,
  METRO_STATIONS,
  MetroLine,
  MetroStation,
  calculateMetroFare
} from '../../fixtures/metroData';

export function getMetroLines(): MetroLine[] {
  return Object.values(METRO_LINES);
}

export function getMetroStations(lineId?: string): MetroStation[] {
  const stations = Object.values(METRO_STATIONS);
  if (!lineId) return stations;
  return stations.filter(s => s.lineId === lineId);
}

export function getMetroStationByCode(code: string): MetroStation | undefined {
  if (!code) return undefined;
  return METRO_STATIONS[code.toUpperCase()] || Object.values(METRO_STATIONS).find(s => s.code.toLowerCase() === code.toLowerCase());
}

export function getSuburbanToMetroInterchanges(): Array<{
  suburbanCode: string;
  metroStation: MetroStation;
  walkMinutes: number;
  walkwayType: string;
}> {
  const interchanges: Array<{
    suburbanCode: string;
    metroStation: MetroStation;
    walkMinutes: number;
    walkwayType: string;
  }> = [];

  for (const ms of Object.values(METRO_STATIONS)) {
    for (const conn of ms.interchangeWith) {
      if (conn.networkType === 'suburban') {
        interchanges.push({
          suburbanCode: conn.targetCode,
          metroStation: ms,
          walkMinutes: conn.walkTimeMinutes,
          walkwayType: conn.walkwayType
        });
      }
    }
  }

  return interchanges;
}
