import { getDatabase } from '../database/db';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptimeSeconds: number;
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

  return {
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    version: '4.0.0-native-mobile',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
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
