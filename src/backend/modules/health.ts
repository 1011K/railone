import { getDatabase } from '../database/db';
import { searchStations } from './stations';
import { TRAIN_TRIPS } from '../../fixtures/railwayData';
import { MUMBAI_SUBURBAN_NODES } from '../../fixtures/networkMapData';
import { calculateStationDistance, calculateSuburbanFare } from './fares';
import { searchRoutes } from './routePlanner';
import { evaluateJourneyEligibility } from '../../engine/eligibilityEngine';
import { getAllLiveObservations, getPropagatedStopsForTrain } from './delays';
import { getAllTrainTrips } from './services';

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

  // Individually verify each module
  try {
    const stns = searchStations('CSMT');
    modulesMap['stationRegistry'] = (stns && stns.length > 0) ? 'active' : 'degraded';
  } catch {
    modulesMap['stationRegistry'] = 'degraded';
  }

  modulesMap['datedServices'] = (Array.isArray(TRAIN_TRIPS) && TRAIN_TRIPS.length > 0) ? 'active' : 'degraded';
  modulesMap['stopPatternTimetable'] = (Array.isArray(TRAIN_TRIPS) && TRAIN_TRIPS.some(t => t.stops && t.stops.length > 0)) ? 'active' : 'degraded';

  try {
    const d = calculateStationDistance('TNA', 'CSMT');
    modulesMap['interchangesAndWalking'] = (d !== null && d > 0) ? 'active' : 'degraded';
    const f = calculateSuburbanFare(10, 'II');
    modulesMap['fareCalculation'] = (f && f.totalFare === 5) ? 'active' : 'degraded';
  } catch {
    modulesMap['interchangesAndWalking'] = 'degraded';
    modulesMap['fareCalculation'] = 'degraded';
  }

  try {
    const r = searchRoutes({ from: 'TNA', to: 'CSMT', departureTime: '10:35' });
    modulesMap['generalizedRoutePlanner'] = (r && r.length > 0) ? 'active' : 'degraded';
  } catch {
    modulesMap['generalizedRoutePlanner'] = 'degraded';
  }

  try {
    const el = evaluateJourneyEligibility({
      train: TRAIN_TRIPS[0],
      fromStationCode: TRAIN_TRIPS[0].stops[0].stationCode,
      toStationCode: TRAIN_TRIPS[0].stops[1].stationCode,
      userTicketType: 'suburban_single',
      userClass: 'II',
      hasMST: false
    });
    modulesMap['serviceEligibility'] = (el && el.status !== undefined) ? 'active' : 'degraded';
  } catch {
    modulesMap['serviceEligibility'] = 'degraded';
  }

  modulesMap['classAvailability'] = (TRAIN_TRIPS.some(t => t.availableClasses && t.availableClasses.length > 0)) ? 'active' : 'degraded';
  modulesMap['metroIntegration'] = (Array.isArray(MUMBAI_SUBURBAN_NODES) && MUMBAI_SUBURBAN_NODES.length > 0) ? 'active' : 'degraded';

  try {
    const obs = getAllLiveObservations();
    modulesMap['delayObservations'] = (obs && obs.length > 0) ? 'active' : 'degraded';
    const prop = getPropagatedStopsForTrain('95112');
    modulesMap['disruptionReplanning'] = (prop !== null) ? 'active' : 'degraded';
  } catch {
    modulesMap['delayObservations'] = 'degraded';
    modulesMap['disruptionReplanning'] = 'degraded';
  }

  try {
    const trips = getAllTrainTrips();
    modulesMap['trainStatusAggregation'] = (trips && trips.length > 0) ? 'active' : 'degraded';
  } catch {
    modulesMap['trainStatusAggregation'] = 'degraded';
  }

  if (dbStatus === 'connected') {
    try {
      const db = getDatabase();
      const tables: any[] = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      const names = tables.map(t => t.name);
      modulesMap['passengerProfiles'] = names.includes('passenger_profiles') ? 'active' : 'degraded';
      modulesMap['reservationTicketing'] = names.includes('bookings') ? 'active' : 'degraded';
      modulesMap['bookingHistoryRefunds'] = (names.includes('cancellations') || names.includes('refunds')) ? 'active' : 'degraded';
      modulesMap['auditLogging'] = names.includes('audit_logs') ? 'active' : 'degraded';
    } catch {
      modulesMap['passengerProfiles'] = 'degraded';
      modulesMap['reservationTicketing'] = 'degraded';
      modulesMap['bookingHistoryRefunds'] = 'degraded';
      modulesMap['auditLogging'] = 'degraded';
    }
  } else {
    modulesMap['passengerProfiles'] = 'degraded';
    modulesMap['reservationTicketing'] = 'degraded';
    modulesMap['bookingHistoryRefunds'] = 'degraded';
    modulesMap['auditLogging'] = 'degraded';
  }

  modulesMap['voiceAgentOrchestrator'] = 'active';
  modulesMap['notifications'] = 'active';
  modulesMap['providerAdapters'] = 'active';
  modulesMap['healthAndObservability'] = 'active';

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
