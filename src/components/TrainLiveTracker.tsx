import React, { useState, useEffect, useMemo } from 'react';
import { TRAIN_TRIPS, INITIAL_OBSERVATIONS, STATIONS } from '../fixtures/railwayData';
import { computePredictedStops } from '../engine/delayModel';
import { 
  computeRouteHeatmap, 
  computeNetworkCorridorHeatmaps, 
  RouteHeatSegment, 
  CorridorHeatSummary 
} from '../engine/delayHeatmap';
import { 
  NetworkAlertsService, 
  NetworkServiceAlert, 
  DivisionHealth 
} from '../services/networkAlertsService';
import { CoachPositionGuide } from './CoachPositionGuide';
import { TrainFormationStrip } from './common/DesignSystemPrimitives';
import { RakeModelType } from '../models/coachGuide';
import { 
  Radio, 
  Clock, 
  Database, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  ArrowRight,
  Info,
  RefreshCw,
  BellRing,
  Activity,
  Layers,
  ChevronRight,
  Zap,
  Filter,
  Flame,
  Gauge,
  SlidersHorizontal,
  TrendingUp,
  AlertOctagon,
  Eye,
  Check
} from 'lucide-react';

interface TrainLiveTrackerProps {
  initialTrainNumber?: string;
}

export const TrainLiveTracker: React.FC<TrainLiveTrackerProps> = ({
  initialTrainNumber = '95112'
}) => {
  const [selectedTrainNumber, setSelectedTrainNumber] = useState(initialTrainNumber);
  
  // Real-time Network Alerts & Division Health State
  const [alerts, setAlerts] = useState<NetworkServiceAlert[]>([]);
  const [divisionHealth, setDivisionHealth] = useState<DivisionHealth[]>([]);
  const [activeDivisionFilter, setActiveDivisionFilter] = useState<'all' | 'central' | 'western' | 'harbour' | 'national'>('all');
  const [isAlertsLoading, setIsAlertsLoading] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('11:35:00 IST');
  const [isAlertsExpanded, setIsAlertsExpanded] = useState(true);

  // Heatmap State
  const [heatmapScope, setHeatmapScope] = useState<'route' | 'network'>('route');
  const [selectedHeatSegment, setSelectedHeatSegment] = useState<RouteHeatSegment | null>(null);
  const [filterBottlenecksOnly, setFilterBottlenecksOnly] = useState(false);

  // Fetch alerts from Mock API Service on mount and refresh
  const loadAlerts = async () => {
    setIsAlertsLoading(true);
    try {
      const [fetchedAlerts, fetchedHealth] = await Promise.all([
        NetworkAlertsService.getActiveAlerts(activeDivisionFilter),
        NetworkAlertsService.getDivisionHealth()
      ]);
      setAlerts(fetchedAlerts);
      setDivisionHealth(fetchedHealth);
      setLastRefreshedTime(new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    } catch (e) {
      console.error('Error fetching alerts:', e);
    } finally {
      setIsAlertsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [activeDivisionFilter]);

  const train = TRAIN_TRIPS.find(t => t.trainNumber === selectedTrainNumber) || TRAIN_TRIPS[0];
  const obs = INITIAL_OBSERVATIONS[train.trainNumber];
  const predictedStops = computePredictedStops(train, obs);
  const [selectedCoachSeq, setSelectedCoachSeq] = useState(1);

  const rakeType: RakeModelType = useMemo(() => {
    if (train.serviceType?.includes('ac')) return '12_car_ac_suburban';
    if (train.trainNumber === '20608') return '16_car_vande_bharat';
    if (train.serviceType === 'mail_express' || train.serviceType === 'superfast') return '22_car_express';
    return '12_car_suburban';
  }, [train]);

  const currentIdx = predictedStops.findIndex(s => s.stationCode === obs?.currentStationCode);

  // Check if selected train has an active alert
  const trainSpecificAlert = alerts.find(a => a.affectedTrainNumbers.includes(train.trainNumber));

  // Compute Heatmap Route Segments using existing mock data and alerts
  const routeSegments = useMemo(() => {
    return computeRouteHeatmap(train, obs, alerts);
  }, [train, obs, alerts]);

  // Network-wide corridor heatmaps
  const corridorSummaries = useMemo(() => {
    return computeNetworkCorridorHeatmaps(INITIAL_OBSERVATIONS, alerts);
  }, [alerts]);

  // Derived heatmap statistics
  const maxSegmentDelay = useMemo(() => {
    return routeSegments.reduce((max, s) => Math.max(max, s.delayMinutes), 0);
  }, [routeSegments]);

  const bottleneckCount = useMemo(() => {
    return routeSegments.filter(s => s.isBottleneck).length;
  }, [routeSegments]);

  const averageDelay = useMemo(() => {
    if (routeSegments.length === 0) return 0;
    const sum = routeSegments.reduce((acc, s) => acc + s.delayMinutes, 0);
    return Math.round(sum / routeSegments.length);
  }, [routeSegments]);

  // Active inspected segment (defaults to first bottleneck or current location segment)
  const activeInspectedSegment = selectedHeatSegment || routeSegments.find(s => s.isBottleneck) || routeSegments[0];

  return (
    <div className="space-y-6">

      {/* ========================================================================= */}
      {/* 1. REAL-TIME INSTITUTIONAL OCC STATUS & NETWORK-WIDE SERVICE ALERTS BANNER */}
      {/* ========================================================================= */}
      <section 
        aria-label="Real-time Network Service Alerts and Operations Board" 
        className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl overflow-hidden"
      >
        {/* Top Control Room Bar */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <div className="text-xs font-bold tracking-wider uppercase text-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>Operations Control Centre (OCC) · Mumbai Suburban & National Broadcast</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Polled: {lastRefreshedTime}</span>
            </div>
            <button
              onClick={loadAlerts}
              disabled={isAlertsLoading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 font-medium text-[11px]"
              title="Refresh Network Alerts"
            >
              <RefreshCw className={`w-3 h-3 ${isAlertsLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setIsAlertsExpanded(!isAlertsExpanded)}
              className="text-xs text-blue-400 hover:underline font-medium"
            >
              {isAlertsExpanded ? 'Collapse' : 'Expand Alerts'}
            </button>
          </div>
        </div>

        {/* Division Punctuality & Health Ticker */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800/80 overflow-x-auto">
          <div className="flex items-center gap-6 min-w-[650px] text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-400" />
              Division Health Index:
            </span>
            {divisionHealth.map((dh) => (
              <div key={dh.division} className="flex items-center gap-2 shrink-0">
                <span className="text-slate-300 font-medium">{dh.division}</span>
                <span className={`font-mono font-bold text-[11px] ${
                  dh.status === 'NORMAL' ? 'text-emerald-400' : dh.status === 'SLIGHT_DELAY' ? 'text-blue-300' : 'text-amber-400'
                }`}>
                  {dh.punctualityIndex}% Punctual
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  (Avg: +{dh.averageDelayMinutes}m)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Alerts Main Feed */}
        {isAlertsExpanded && (
          <div className="p-5 space-y-4">
            
            {/* Division Filter Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium">Filter Line:</span>
                {[
                  { id: 'all', label: 'All Divisions' },
                  { id: 'central', label: 'Central (CR)' },
                  { id: 'western', label: 'Western (WR)' },
                  { id: 'harbour', label: 'Harbour Line' },
                  { id: 'national', label: 'National Rail' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveDivisionFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                      activeDivisionFilter === f.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-slate-400">
                {alerts.length} Active Notice{alerts.length === 1 ? '' : 's'} in Feed
              </div>
            </div>

            {/* Alert Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {alerts.map((alert) => {
                const isCritical = alert.severity === 'CRITICAL';
                const isMajor = alert.severity === 'MAJOR';
                const isModerate = alert.severity === 'MODERATE';

                const borderAccent = isCritical
                  ? 'border-rose-700/80 bg-rose-950/20'
                  : isMajor
                  ? 'border-amber-700/80 bg-amber-950/20'
                  : isModerate
                  ? 'border-blue-700/60 bg-blue-950/20'
                  : 'border-slate-800 bg-slate-800/40';

                const severityColor = isCritical
                  ? 'text-rose-400 bg-rose-950 border-rose-800'
                  : isMajor
                  ? 'text-amber-400 bg-amber-950 border-amber-800'
                  : isModerate
                  ? 'text-blue-300 bg-blue-950 border-blue-800'
                  : 'text-slate-300 bg-slate-800 border-slate-700';

                return (
                  <div
                    key={alert.id}
                    className={`rounded-2xl border p-4 space-y-3 transition-all ${borderAccent}`}
                  >
                    {/* Alert Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${severityColor}`}>
                            {alert.severity}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {alert.division}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white mt-1">
                          {alert.title}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-mono text-slate-400 block">{alert.timestamp}</span>
                        <span className="text-[10px] text-slate-500 font-mono">[{alert.dataStatus}]</span>
                      </div>
                    </div>

                    {/* Operational Details */}
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-baseline gap-2">
                        <span className="text-slate-400 shrink-0">Section Affected:</span>
                        <span className="font-medium text-slate-200">{alert.sectionAffected}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-slate-400 shrink-0">Delay Impact:</span>
                        <span className="font-bold text-amber-300">{alert.delayImpact}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-slate-400 shrink-0">Technical Cause:</span>
                        <span className="text-slate-300 text-[11px]">{alert.operationalCause}</span>
                      </div>
                    </div>

                    {/* Actionable Institutional Commuter Recommendation */}
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px] uppercase tracking-wide">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Actionable Passenger Guidance</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed text-[11px]">
                        {alert.passengerRecommendation}
                      </p>
                    </div>

                    {/* Quick Link to Affected Trains */}
                    {alert.affectedTrainNumbers.length > 0 && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
                        <span className="text-slate-400">Track Monitored Train:</span>
                        {alert.affectedTrainNumbers.map(trn => (
                          <button
                            key={trn}
                            onClick={() => setSelectedTrainNumber(trn)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white transition-colors font-mono font-semibold"
                          >
                            Train {trn}
                          </button>
                        ))}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 2. TRAIN SELECTION & SPECIFIC ACTIVE DISRUPTION PIN                       */}
      {/* ========================================================================= */}
      <section aria-label="Train Running Selector" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Sectional Train Telemetry & Stop Propagation</span>
            </h2>
            <p className="text-xs text-slate-500">
              Downstream station arrival predictions with uncertainty intervals and rake composition
            </p>
          </div>

          {/* Train Selector Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">Select Train:</label>
            <select
              value={selectedTrainNumber}
              onChange={(e) => setSelectedTrainNumber(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            >
              {TRAIN_TRIPS.map(t => (
                <option key={t.trainNumber} value={t.trainNumber}>
                  {t.trainNumber} - {t.trainName} ({t.serviceType})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pinned Sectional Alert for currently viewed train if applicable */}
        {trainSpecificAlert && (
          <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs text-amber-950 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-2">
                <span>Active Control Notice on Train {train.trainNumber}:</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono">
                  {trainSpecificAlert.severity}
                </span>
              </div>
              <p className="leading-relaxed">
                {trainSpecificAlert.title}. {trainSpecificAlert.passengerRecommendation}
              </p>
            </div>
          </div>
        )}

        {/* Train Overview Grid */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 block">Current Location:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {obs?.currentStationCode ? STATIONS[obs.currentStationCode]?.name : 'Origin (Kalyan)'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {obs?.hasDepartedOrigin ? 'In Transit' : 'Waiting to Depart Origin'}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 block">Current Delay:</span>
            <span className={`font-bold text-sm ${obs?.delayMinutesAtCurrent ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {obs?.delayMinutesAtCurrent ? `+${obs.delayMinutesAtCurrent} min late` : 'Running On Time'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Uncertainty: ±{obs?.uncertaintyMarginMinutes || 0} min
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 block">Data Provenance:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {obs?.dataStatus || 'SCHEDULED'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 truncate" title={obs?.dataSource}>
              {obs?.dataSource || 'Official Timetable'}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 block">Rake & Formation:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {train.rakeType === '15_car' ? '15-Car EMU' : train.rakeType === '12_car' ? '12-Car EMU' : 'LHB Express'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Classes: {train.availableClasses.join(', ')}
            </span>
          </div>
        </div>

        {/* Sectional Disruption Reason */}
        {obs?.disruptionReason && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Sectional Disruption Notice: </strong>
              {obs.disruptionReason}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. VISUAL ROUTE DELAY & TRACK CONGESTION HEATMAP LAYER (NEW FEATURE)      */}
      {/* ========================================================================= */}
      <section 
        aria-label="Visual Route Delay Heatmap" 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5"
      >
        {/* Heatmap Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <Flame className="w-5 h-5" />
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Sectional Route Delay & Thermal Congestion Heatmap
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                Live Heat Layer
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visualizes downstream delay accumulation, speed caution orders, and track bottleneck locks across intermediate stations
            </p>
          </div>

          {/* Controls: Scope Switcher & Bottleneck Filter */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Scope Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl font-semibold">
              <button
                onClick={() => {
                  setHeatmapScope('route');
                  setSelectedHeatSegment(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  heatmapScope === 'route'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Train {train.trainNumber} Track
              </button>
              <button
                onClick={() => {
                  setHeatmapScope('network');
                  setSelectedHeatSegment(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  heatmapScope === 'network'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Mumbai Tri-Corridor
              </button>
            </div>

            {/* Bottlenecks filter toggle */}
            <button
              onClick={() => setFilterBottlenecksOnly(!filterBottlenecksOnly)}
              className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 font-semibold ${
                filterBottlenecksOnly
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Bottlenecks Only ({bottleneckCount})</span>
            </button>
          </div>
        </div>

        {/* Heatmap Telemetry KPI Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Peak Block Delay:</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`font-mono text-lg font-black ${
                maxSegmentDelay >= 15 ? 'text-rose-600 dark:text-rose-400' : maxSegmentDelay >= 8 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                +{maxSegmentDelay}m
              </span>
              <span className="text-[10px] text-slate-400 font-mono">max</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Average Delay:</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-lg font-bold text-slate-800 dark:text-slate-200">
                +{averageDelay}m
              </span>
              <span className="text-[10px] text-slate-400 font-mono">per block</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Severe Bottlenecks:</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`font-mono text-lg font-bold ${
                bottleneckCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {bottleneckCount}
              </span>
              <span className="text-[10px] text-slate-400">sections</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Sectional Headway Quality:</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {Math.max(45, 100 - averageDelay * 3)}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">index</span>
            </div>
          </div>
        </div>

        {/* Heatmap Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[11px]">
          <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
            Delay Thermal Spectrum:
          </span>
          <div className="flex flex-wrap items-center gap-4 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
              <span className="text-slate-700 dark:text-slate-300">Normal (0-2m delay)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
              <span className="text-slate-700 dark:text-slate-300">Caution (3-7m delay)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500 shadow-xs" />
              <span className="text-slate-700 dark:text-slate-300">Congested (8-14m delay)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              <span className="text-rose-600 dark:text-rose-400 font-bold">Critical Bottleneck (15m+ lock)</span>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* VIEW 1: ACTIVE TRAIN ROUTE SEGMENT HEATMAP                              */}
        {/* ======================================================================= */}
        {heatmapScope === 'route' && (
          <div className="space-y-4">
            {/* Mobile Vertical Route Timeline (< md screens) */}
            <div className="block md:hidden space-y-1 py-2 px-1">
              {routeSegments.map((segment, idx) => {
                const isSelected = activeInspectedSegment?.segmentId === segment.segmentId;
                const isVisible = !filterBottlenecksOnly || segment.isBottleneck;
                if (!isVisible) return null;

                return (
                  <div key={segment.segmentId} className="relative">
                    {/* Station Node Row */}
                    <div 
                      onClick={() => setSelectedHeatSegment(segment)}
                      className={`flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800' : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="relative flex items-center justify-center w-6 shrink-0">
                        <div className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                          segment.hasCurrentTrain
                            ? 'bg-blue-600 border-white ring-4 ring-blue-500/30 scale-125'
                            : isSelected
                            ? 'bg-slate-900 dark:bg-white border-blue-500 scale-110'
                            : 'bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600'
                        }`}>
                          {segment.hasCurrentTrain && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5 min-w-0">
                          <span className={`text-xs font-bold ${
                            isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {segment.fromStationCode}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {segment.fromStationName}
                          </span>
                        </div>
                        {segment.hasCurrentTrain && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-600 text-white shrink-0">
                            Loco #{train.trainNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Connecting Vertical Track Bar */}
                    <div 
                      onClick={() => setSelectedHeatSegment(segment)}
                      className="ml-5 pl-4 py-1.5 flex items-center justify-between border-l-2 cursor-pointer transition-colors"
                      style={{ borderColor: segment.colorHex }}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          segment.intensity === 'CRITICAL'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                            : segment.intensity === 'HEAVY'
                            ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300'
                            : segment.intensity === 'MODERATE'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                        }`}>
                          +{segment.delayMinutes}m
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {segment.distanceKm} km · {segment.intensity.toLowerCase()}
                        </span>
                      </div>
                      {segment.speedLimitKmh < 80 && (
                        <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                          ⚠️ {segment.speedLimitKmh} km/h
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Terminus Station */}
              {routeSegments.length > 0 && (
                <div className="flex items-center gap-3 p-2">
                  <div className="relative flex items-center justify-center w-6 shrink-0">
                    <div className="w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {routeSegments[routeSegments.length - 1].toStationCode}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {routeSegments[routeSegments.length - 1].toStationName} (Terminus)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Horizontal Route Track Rail Schematic (>= md screens) */}
            <div className="hidden md:block overflow-x-auto pb-4 pt-2">
              <div className="min-w-[840px] px-2 py-4">
                
                {/* Horizontal Route Track Rail Schematic */}
                <div className="relative flex items-center justify-between">
                  
                  {/* Base Track Rails Line */}
                  <div className="absolute top-6 inset-x-8 h-2 bg-slate-200 dark:bg-slate-700 rounded-full z-0" />

                  {/* Connected Segments with Thermal Gradient Styling */}
                  {routeSegments.map((segment, idx) => {
                    const isSelected = activeInspectedSegment?.segmentId === segment.segmentId;
                    const isVisible = !filterBottlenecksOnly || segment.isBottleneck;

                    if (!isVisible) return null;

                    // Compute track segment background color based on delay heat
                    const segmentBg = segment.intensity === 'CRITICAL'
                      ? 'bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)] animate-pulse'
                      : segment.intensity === 'HEAVY'
                      ? 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                      : segment.intensity === 'MODERATE'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                      : 'bg-gradient-to-r from-emerald-400 to-emerald-500';

                    return (
                      <div 
                        key={segment.segmentId}
                        className="flex-1 flex flex-col items-center relative z-10 group cursor-pointer px-1"
                        onClick={() => setSelectedHeatSegment(segment)}
                      >
                        {/* Station Node Marker */}
                        <div className="flex flex-col items-center mb-1">
                          <span className={`text-[11px] font-bold tracking-tight transition-colors ${
                            isSelected ? 'text-blue-600 dark:text-blue-400 scale-105' : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {segment.fromStationCode}
                          </span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate max-w-[70px]">
                            {segment.fromStationName}
                          </span>
                        </div>

                        {/* Station Point Dot */}
                        <div className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                          segment.hasCurrentTrain 
                            ? 'bg-blue-600 border-white ring-4 ring-blue-500/30 scale-125' 
                            : isSelected
                            ? 'bg-slate-900 dark:bg-white border-blue-500 scale-110'
                            : 'bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600'
                        }`}>
                          {segment.hasCurrentTrain && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          )}
                        </div>

                        {/* Active Train Indicator Tooltip */}
                        {segment.hasCurrentTrain && (
                          <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-mono font-bold shadow-md uppercase tracking-wider flex items-center gap-1 z-30">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>Loco #{train.trainNumber}</span>
                          </div>
                        )}

                        {/* Track Segment Thermal Connector */}
                        <div className="w-full mt-3 relative">
                          <div 
                            className={`h-2.5 rounded-full transition-all duration-300 ${segmentBg} ${
                              isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-y-125' : ''
                            }`}
                          />
                          
                          {/* Segment Delay Pill */}
                          <div className="mt-2 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-transform group-hover:scale-105 ${
                              segment.intensity === 'CRITICAL'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                                : segment.intensity === 'HEAVY'
                                ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800'
                                : segment.intensity === 'MODERATE'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            }`}>
                              +{segment.delayMinutes}m
                            </span>
                          </div>

                          {/* Speed caution badge if restricted */}
                          {segment.speedLimitKmh < 80 && (
                            <div className="text-center mt-1">
                              <span className="text-[9px] font-mono text-slate-500">
                                ⚠️ {segment.speedLimitKmh} km/h
                              </span>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}

                  {/* Destination Station Final Node */}
                  {routeSegments.length > 0 && (
                    <div className="flex flex-col items-center relative z-10 px-1">
                      <div className="flex flex-col items-center mb-1">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                          {routeSegments[routeSegments.length - 1].toStationCode}
                        </span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate max-w-[70px]">
                          {routeSegments[routeSegments.length - 1].toStationName}
                        </span>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600" />
                      <div className="mt-5 text-[10px] font-mono text-slate-400">Terminus</div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Segment Detail Inspector Card */}
            {activeInspectedSegment && (
              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3.5 h-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: activeInspectedSegment.colorHex }}
                    />
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Track Block Section: {activeInspectedSegment.fromStationName} ({activeInspectedSegment.fromStationCode}) ➔ {activeInspectedSegment.toStationName} ({activeInspectedSegment.toStationCode})
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                      activeInspectedSegment.intensity === 'CRITICAL'
                        ? 'bg-rose-600 text-white'
                        : activeInspectedSegment.intensity === 'HEAVY'
                        ? 'bg-orange-500 text-white'
                        : activeInspectedSegment.intensity === 'MODERATE'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {activeInspectedSegment.intensity} CONGESTION
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      +{activeInspectedSegment.delayMinutes} min delay
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Distance & Transit Time:</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {activeInspectedSegment.distanceKm} km · Est. {activeInspectedSegment.predictedTransitMinutes} mins
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Sched: {activeInspectedSegment.scheduledTransitMinutes} mins)
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Caution Speed Order (MPS):</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-blue-500" />
                      <span>{activeInspectedSegment.speedLimitKmh} KM/H Limit</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {activeInspectedSegment.speedLimitKmh < 50 ? 'Severe signal restriction' : 'Standard sectional limit'}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Thermal Congestion Level:</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${activeInspectedSegment.heatPercentage}%`,
                            backgroundColor: activeInspectedSegment.colorHex 
                          }}
                        />
                      </div>
                      <span className="font-mono">{activeInspectedSegment.heatPercentage}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Heat index based on rake density</span>
                  </div>
                </div>

                {/* Root Cause / Signal Alert Notice */}
                {activeInspectedSegment.cause && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block">Section Operational Status:</strong>
                      <span>{activeInspectedSegment.cause}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 2: MUMBAI MULTI-LINE NETWORK CORRIDORS HEATMAP OVERVIEW             */}
        {/* ======================================================================= */}
        {heatmapScope === 'network' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 gap-4">
              {corridorSummaries.map((corridor) => (
                <div 
                  key={corridor.line}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${
                        corridor.line === 'central' ? 'bg-blue-600' : corridor.line === 'western' ? 'bg-rose-600' : 'bg-emerald-600'
                      }`} />
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {corridor.corridorName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-slate-500">Avg Delay: <strong>+{corridor.averageDelay}m</strong></span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        corridor.maxDelay >= 15 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                      }`}>
                        Peak: +{corridor.maxDelay}m
                      </span>
                    </div>
                  </div>

                  {/* Corridor Track Heatmap Strip */}
                  <div className="overflow-x-auto pb-1">
                    <div className="flex items-center gap-1 min-w-[720px]">
                      {corridor.segments.map((seg) => (
                        <div 
                          key={seg.segmentId}
                          className="flex-1 p-2 rounded-xl border flex flex-col justify-between transition-all hover:scale-105"
                          style={{ 
                            backgroundColor: `${seg.colorHex}15`, 
                            borderColor: `${seg.colorHex}50` 
                          }}
                        >
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-800 dark:text-slate-200">
                            <span>{seg.fromStationCode}</span>
                            <span>{seg.toStationCode}</span>
                          </div>
                          <div className="mt-1 flex items-baseline justify-between">
                            <span 
                              className="font-mono text-xs font-bold"
                              style={{ color: seg.colorHex }}
                            >
                              +{seg.delayMinutes}m
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              {seg.speedLimitKmh}k
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <span>Critical Bottleneck Section: <strong className="text-rose-600 dark:text-rose-400">{corridor.worstSegment}</strong></span>
                    <button 
                      onClick={() => setHeatmapScope('route')}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Focus Detailed Telemetry ➔
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </section>

      {/* ========================================================================= */}
      {/* 4. RAKE COACH POSITION SCHEMATIC                                          */}
      {/* ========================================================================= */}
      <section aria-label="Rake Coach Formation" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Rake Composition & Formation
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Tap coach for category details
          </span>
        </div>

        <TrainFormationStrip
          rakeType={rakeType}
          selectedCoachSeq={selectedCoachSeq}
          onSelectCoach={(seq) => setSelectedCoachSeq(seq)}
        />
      </section>

      {/* ========================================================================= */}
      {/* 5. STATION BY STATION LIVE TIMELINE TABLE                                */}
      {/* ========================================================================= */}
      <section aria-label="Station Stops Timeline" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Station Stopping Schedule & Predicted Progress
          </h3>
          <span className="text-xs text-slate-500">
            {predictedStops.length} stops recorded
          </span>
        </div>

        {/* Mobile Vertical Stops List (< md screens) */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-2">
          {predictedStops.map((stop, sIdx) => {
            const isCurrent = sIdx === currentIdx;
            const isPassed = currentIdx >= 0 && sIdx < currentIdx;

            return (
              <div
                key={stop.stationCode}
                className={`p-3 rounded-2xl transition-colors ${
                  isCurrent
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900'
                    : isPassed
                    ? 'bg-slate-50/40 dark:bg-slate-900/40 opacity-70'
                    : 'bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      isCurrent 
                        ? 'bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950' 
                        : isPassed 
                        ? 'bg-slate-300 dark:bg-slate-700' 
                        : 'border-2 border-slate-400 dark:border-slate-600'
                    }`} />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {stop.stationName}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ({stop.stationCode})
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                    PF {train.stops[sIdx]?.platform || '1'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Scheduled</span>
                    <span className="font-mono tabular-nums">{stop.scheduledArrival} / {stop.scheduledDeparture}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Predicted</span>
                    <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      {stop.predictedArrival} / {stop.predictedDeparture}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    {stop.delayArrivalMinutes > 0 ? (
                      <span className="text-amber-700 dark:text-amber-400 font-bold font-mono">
                        +{stop.delayArrivalMinutes}m Late
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        On-time
                      </span>
                    )}
                  </div>
                  <div>
                    {isCurrent ? (
                      <span className="text-blue-700 dark:text-blue-400 font-bold text-[11px] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>Current Location</span>
                      </span>
                    ) : isPassed ? (
                      <span className="text-slate-400 text-[11px]">
                        Departed
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">
                        Expected ({stop.dataStatus})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table (>= md screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-700 font-medium">
              <tr>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">PF</th>
                <th className="py-3 px-4">Scheduled Arr / Dep</th>
                <th className="py-3 px-4">Predicted Arr / Dep</th>
                <th className="py-3 px-4">Delay Variance</th>
                <th className="py-3 px-4">Status & Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {predictedStops.map((stop, sIdx) => {
                const isCurrent = sIdx === currentIdx;
                const isPassed = currentIdx >= 0 && sIdx < currentIdx;

                return (
                  <tr 
                    key={stop.stationCode}
                    className={`transition-colors ${
                      isCurrent 
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 font-semibold' 
                        : isPassed
                        ? 'bg-slate-50/50 dark:bg-slate-900/40 text-slate-400'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        isCurrent 
                          ? 'bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950' 
                          : isPassed 
                          ? 'bg-slate-300 dark:bg-slate-700' 
                          : 'border-2 border-slate-400 dark:border-slate-600'
                      }`} />
                      <div>
                        <span className="text-slate-900 dark:text-white">{stop.stationName}</span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 ml-1.5 font-normal">({stop.stationCode})</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                        PF {train.stops[sIdx]?.platform || '1'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono tabular-nums">
                      {stop.scheduledArrival} / {stop.scheduledDeparture}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      {stop.predictedArrival} / {stop.predictedDeparture}
                    </td>

                    <td className="py-3 px-4">
                      {stop.delayArrivalMinutes > 0 ? (
                        <span className="text-amber-700 dark:text-amber-400 font-bold font-mono tabular-nums">
                          +{stop.delayArrivalMinutes}m
                        </span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          On-time
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono tabular-nums ml-1">
                        (±{stop.uncertaintyMinutes}m)
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {isCurrent ? (
                        <span className="text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>Current Location</span>
                        </span>
                      ) : isPassed ? (
                        <span className="text-slate-600 dark:text-slate-400">
                          Departed
                        </span>
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">
                          Expected ({stop.dataStatus})
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Platform Coach Alignment & Wagenstandsanzeiger */}
      <section className="pt-2">
        <CoachPositionGuide
          initialRakeType={train.serviceType?.includes('ac') ? '12_car_ac_suburban' : train.serviceType === 'vande_bharat_tejas' ? '16_car_vande_bharat' : '12_car_suburban'}
          stationCode={train.stops[0]?.stationCode || 'DR'}
          platformNumber={train.stops[0]?.platform || '3'}
        />
      </section>

    </div>
  );
};
