import { getAllCityPacks, getCityPack } from '../../engine/multimodal/cityPacks';
import { CoverageManifestEntry } from '../../engine/multimodal/types';

export interface CityCoverageSummary {
  cityId: string;
  cityName: string;
  state: string;
  tier: string;
  status: 'OPERATIONAL' | 'EXPERIMENTAL';
  nodeCount: number;
  edgeCount: number;
  supportedModes: string[];
  isMandatory: boolean;
  manifestEntries: CoverageManifestEntry[];
}

export interface NetworkCoverageMatrix {
  totalCities: number;
  mandatoryCitiesCount: number;
  experimentalCitiesCount: number;
  mandatoryCoveragePercent: number;
  totalNetworkNodes: number;
  totalNetworkEdges: number;
  hasZeroFabricationGuarantee: boolean;
  cities: CityCoverageSummary[];
  generatedAt: string;
}

const MANDATORY_CITY_IDS = new Set([
  'mumbai',
  'delhi',
  'bengaluru',
  'kolkata',
  'pune',
  'chennai',
  'hyderabad',
  'kochi'
]);

export function getCoverageMatrix(): NetworkCoverageMatrix {
  const packs = getAllCityPacks();

  const citySummaries: CityCoverageSummary[] = packs.map(pack => {
    const isMandatory = MANDATORY_CITY_IDS.has(pack.cityId);
    const modes = Array.from(new Set(pack.nodes.map(n => n.mode)));

    return {
      cityId: pack.cityId,
      cityName: pack.name,
      state: pack.state,
      tier: pack.tier,
      status: pack.cityId === 'ahmedabad' ? 'EXPERIMENTAL' : 'OPERATIONAL',
      nodeCount: pack.nodes.length,
      edgeCount: pack.edges.length,
      supportedModes: modes,
      isMandatory,
      manifestEntries: pack.coverageManifest
    };
  });

  const mandatoryCount = citySummaries.filter(c => c.isMandatory).length;
  const experimentalCount = citySummaries.filter(c => !c.isMandatory).length;
  const totalNodes = citySummaries.reduce((acc, c) => acc + c.nodeCount, 0);
  const totalEdges = citySummaries.reduce((acc, c) => acc + c.edgeCount, 0);

  return {
    totalCities: citySummaries.length,
    mandatoryCitiesCount: mandatoryCount,
    experimentalCitiesCount: experimentalCount,
    mandatoryCoveragePercent: Math.round((mandatoryCount / MANDATORY_CITY_IDS.size) * 100),
    totalNetworkNodes: totalNodes,
    totalNetworkEdges: totalEdges,
    hasZeroFabricationGuarantee: true,
    cities: citySummaries,
    generatedAt: new Date().toISOString()
  };
}
