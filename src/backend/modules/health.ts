import { getDatabase } from '../database/db';
import { searchStations } from './stations';
import { TRAIN_TRIPS } from '../../fixtures/railwayData';
import { MUMBAI_SUBURBAN_NODES } from '../../fixtures/networkMapData';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptimeSeconds: number;
  backendReachable: boolean;
  dbReachable: boolean;
  timetableLoaded: boolean;
  aiConfigured: boolean;
  voiceCapability: 'live_gemini' | 'deterministic_engine';
  mapDataAvailable: boolean;
  providerAvailability: {
    telephonic139: 'statutory_blocked';
    smsGateway: 'simulated_local';
    railmadadApi: 'simulated_demo';
  };
  database: {
    engine: 'sqlite_node22';
    status: 'connected' | 'error';
    tablesCount: number;
  };
  modulesCount: number;
  modules: Record<string, 'active' | 'degraded'>;
  geminiAi: {
    configured: boolean;
    mode: 'live_gemini' | 'deterministic_railway_engine';
  };
  timestamp: string;
}

const startTime = Date.now();

export function checkSystemHealth(geminiConfigured = false): HealthCheckResult {
  let dbStatus: 'connected' | 'error' = 'connected';
  let tablesCount = 0;

  try {
    const db = getDatabase();
    const rows: any[] = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    tablesCount = rows.length;
    if (tablesCount === 0) dbStatus = 'error';
  } catch (err) {
    dbStatus = 'error';
  }

  const moduleNames = [
    'stationRegistry',
    'datedServices',
    'stopPatternTimetable',
    'generalizedRoutePlanner',
    'interchangesAndWalking',
    'serviceEligibility',
    'classAvailability',
    'fareCalculation',
    'metroIntegration',
    'delayObservations',
    'disruptionReplanning',
    'trainStatusAggregation',
    'passengerProfiles',
    'reservationTicketing',
    'bookingHistoryRefunds',
    'voiceAgentOrchestrator',
    'notifications',
    'providerAdapters',
    'auditLogging',
    'healthAndObservability'
  ];

  const modulesMap: Record<string, 'active' | 'degraded'> = {};
  for (const m of moduleNames) {
    modulesMap[m] = 'active';
  }

  // Real operational sanity assertions
  try {
    const stns = searchStations('CSMT');
    if (!stns || stns.length === 0) modulesMap['stationRegistry'] = 'degraded';
  } catch {
    modulesMap['stationRegistry'] = 'degraded';
  }

  if (!TRAIN_TRIPS || TRAIN_TRIPS.length === 0) {
    modulesMap['datedServices'] = 'degraded';
    modulesMap['stopPatternTimetable'] = 'degraded';
  }

  if (dbStatus !== 'connected') {
    modulesMap['passengerProfiles'] = 'degraded';
    modulesMap['reservationTicketing'] = 'degraded';
    modulesMap['bookingHistoryRefunds'] = 'degraded';
    modulesMap['auditLogging'] = 'degraded';
  }

  const hasDegraded = Object.values(modulesMap).some(s => s === 'degraded');
  const overallStatus = dbStatus === 'connected' && !hasDegraded ? 'healthy' : 'degraded';

  return {
    status: overallStatus,
    version: '4.0.0-native-mobile',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    backendReachable: true,
    dbReachable: dbStatus === 'connected',
    timetableLoaded: Array.isArray(TRAIN_TRIPS) && TRAIN_TRIPS.length > 0,
    aiConfigured: geminiConfigured,
    voiceCapability: geminiConfigured ? 'live_gemini' : 'deterministic_engine',
    mapDataAvailable: Array.isArray(MUMBAI_SUBURBAN_NODES) && MUMBAI_SUBURBAN_NODES.length > 0,
    providerAvailability: {
      telephonic139: 'statutory_blocked',
      smsGateway: 'simulated_local',
      railmadadApi: 'simulated_demo'
    },
    database: {
      engine: 'sqlite_node22',
      status: dbStatus,
      tablesCount
    },
    modulesCount: moduleNames.length,
    modules: modulesMap,
    geminiAi: {
      configured: geminiConfigured,
      mode: geminiConfigured ? 'live_gemini' : 'deterministic_railway_engine'
    },
    timestamp: new Date().toISOString()
  };
}
