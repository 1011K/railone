import {
  STATION_3D_LAYOUTS,
  Station3DLayout,
  calculateStationTransferRoute
} from '../../fixtures/stationLayoutsData';

export interface InterchangeHubInfo {
  code: string;
  name: string;
  lines: string[];
  totalPlatforms: number;
  hasMetroConnection: boolean;
  hasStepFreeFOB: boolean;
  fobsCount: number;
}

export function listInterchangeHubs(): InterchangeHubInfo[] {
  return Object.values(STATION_3D_LAYOUTS).map((layout: Station3DLayout) => {
    const lines: string[] = Array.from(new Set(layout.platforms.map(p => p.line as string)));
    const hasMetro = layout.amenities.some(a => a.type === 'metro_interchange');
    const hasStepFree = layout.bridges.some(f => f.hasLifts);
    return {
      code: layout.stationCode,
      name: layout.stationName,
      lines,
      totalPlatforms: layout.platforms.length,
      hasMetroConnection: hasMetro,
      hasStepFreeFOB: hasStepFree,
      fobsCount: layout.bridges.length
    };
  });
}

export function getStationLayout(stationCode: string): Station3DLayout | undefined {
  if (!stationCode) return undefined;
  return STATION_3D_LAYOUTS[stationCode.toUpperCase()];
}

export function getTransferWalkGuide(
  stationCode: string,
  fromPlatform: string,
  toPlatform: string,
  stepFreeRequired = false
) {
  return calculateStationTransferRoute(stationCode, fromPlatform, toPlatform, stepFreeRequired);
}
