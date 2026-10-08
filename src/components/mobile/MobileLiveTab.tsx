import React, { useState, useMemo, useEffect } from 'react';
import { TRAIN_TRIPS, INITIAL_OBSERVATIONS, STATIONS } from '../../fixtures/railwayData';
import { PAN_INDIA_TRAINS, PAN_INDIA_OBSERVATIONS } from '../../fixtures/panIndiaTrainsData';
import { computePredictedStops, PredictedStop } from '../../engine/delayModel';
import { NetworkMapViewer } from '../NetworkMapViewer';
import { CoachPositionGuide, RakeModelType } from '../CoachPositionGuide';
import { useTheme } from '../ThemeContext';
import { getTranslation } from '../../i18n/translations';
import { 
  Radio, 
  Map, 
  Compass, 
  Layers, 
  Clock, 
  Train, 
  Search, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight,
  Eye,
  CheckCircle2,
  RefreshCw,
  Bell,
  Share2,
  Volume2,
  SlidersHorizontal,
  ArrowRight,
  Check,
  X,
  Sparkles,
  Users,
  Accessibility
} from 'lucide-react';

interface MobileLiveTabProps {
  initialTrainNumber?: string;
  onOpenGodsEye: (stationCode: string) => void;
  onPlanRouteFromStation: (stationCode: string) => void;
  onPlanRouteToStation: (stationCode: string) => void;
}

export const MobileLiveTab: React.FC<MobileLiveTabProps> = ({
  initialTrainNumber = '95112',
  onOpenGodsEye,
  onPlanRouteFromStation,
  onPlanRouteToStation
}) => {
  const { language } = useTheme();
  const t = getTranslation(language);
  // Sub-Tab Navigation: tracker | board | map | coach
  const [activeSubTab, setActiveSubTab] = useState<'tracker' | 'board' | 'map' | 'coach'>('tracker');
  
  // Running Tracker State
  const [selectedTrainNumber, setSelectedTrainNumber] = useState(initialTrainNumber);
  const [trainSearchQuery, setTrainSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [soundAlertActive, setSoundAlertActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedStopCode, setExpandedStopCode] = useState<string | null>(null);

  // Sync initialTrainNumber prop updates
  useEffect(() => {
    if (initialTrainNumber) {
      setSelectedTrainNumber(initialTrainNumber);
      setActiveSubTab('tracker');
    }
  }, [initialTrainNumber]);

  // Station Board State
  const [boardStationCode, setBoardStationCode] = useState('DR');
  const [boardFilter, setBoardFilter] = useState<'all' | 'fast' | 'slow' | 'ac'>('all');

  // Combined National & Suburban Train Fleet
  const ALL_TRAINS = useMemo(() => [...TRAIN_TRIPS, ...PAN_INDIA_TRAINS], []);
  const ALL_OBSERVATIONS = useMemo(() => ({ ...INITIAL_OBSERVATIONS, ...PAN_INDIA_OBSERVATIONS }), []);

  // Coach Guide State
  const [coachStationCode, setCoachStationCode] = useState('DR');
  const [coachPlatform, setCoachPlatform] = useState('3');
  const [coachRakeType, setCoachRakeType] = useState<RakeModelType>('12_car_suburban');

  const hubStations = [
    { code: 'DR', name: 'Dadar Junction' },
    { code: 'CSMT', name: 'CSMT' },
    { code: 'TNA', name: 'Thane' },
    { code: 'ADH', name: 'Andheri' },
    { code: 'KYN', name: 'Kalyan' },
    { code: 'BVI', name: 'Borivali' },
    { code: 'CLA', name: 'Kurla' },
    { code: 'CCG', name: 'Churchgate' }
  ];

  const popularTrains = [
    { number: '95112', label: '95112 Fast Local', line: 'Central Fast' },
    { number: '95114', label: '95114 AC Fast', line: 'Central AC' },
    { number: '97045', label: '97045 Slow Local', line: 'Central Slow' },
    { number: '98042', label: '98042 Harbour', line: 'Harbour Line' },
    { number: '90234', label: '90234 WR Fast', line: 'Western Fast' },
    { number: '12951', label: '12951 Rajdhani', line: 'Superfast' },
    { number: '20901', label: '20901 Vande Bharat', line: 'Vande Bharat' },
    { number: '22222', label: '22222 CSMT Rajdhani', line: 'Superfast' },
    { number: '12137', label: '12137 Punjab Mail', line: 'Express' }
  ];

  // Resolve active train & observation telemetry
  const currentTrain = useMemo(() => {
    return ALL_TRAINS.find(t => t.trainNumber === selectedTrainNumber) || ALL_TRAINS[0];
  }, [ALL_TRAINS, selectedTrainNumber]);

  const obs = useMemo(() => {
    return ALL_OBSERVATIONS[currentTrain.trainNumber];
  }, [ALL_OBSERVATIONS, currentTrain]);

  const predictedStops = useMemo(() => {
    return computePredictedStops(currentTrain, obs);
  }, [currentTrain, obs]);

  // Current train position along stops
  const currentStopIndex = useMemo(() => {
    if (!obs) return 0;
    const idx = predictedStops.findIndex(s => s.stationCode === obs.currentStationCode);
    return idx >= 0 ? idx : 0;
  }, [predictedStops, obs]);

  const effectiveCurrentIdx = currentStopIndex;
  const currentStop = predictedStops[effectiveCurrentIdx];
  const currentRawStop = currentTrain.stops[effectiveCurrentIdx];
  const totalStops = predictedStops.length;
  const totalDistance = currentTrain.stops[currentTrain.stops.length - 1]?.distanceKm || 45;
  const currentDistance = currentRawStop?.distanceKm || (effectiveCurrentIdx * (totalDistance / Math.max(1, totalStops - 1)));
  const progressPercent = Math.min(100, Math.round((currentDistance / Math.max(1, totalDistance)) * 100));
  const currentDelay = obs?.delayMinutesAtCurrent || 0;
  const hasDeparted = obs ? obs.hasDepartedOrigin : true;
  const isCanceled = obs?.isCanceled || false;

  // Filtered train list for search input across complete national & suburban catalog
  const filteredSearchTrains = useMemo(() => {
    if (!trainSearchQuery.trim()) return [];
    const query = trainSearchQuery.toLowerCase();
    return ALL_TRAINS.filter(t => 
      t.trainNumber.toLowerCase().includes(query) ||
      t.trainName.toLowerCase().includes(query) ||
      t.originStation.toLowerCase().includes(query) ||
      t.destinationStation.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [ALL_TRAINS, trainSearchQuery]);

  // Station Live Board departures computed from TRAIN_TRIPS
  const boardDepartures = useMemo(() => {
    const list: Array<{
      trainNumber: string;
      trainName: string;
      platform: string;
      scheduledTime: string;
      delayMinutes: number;
      destination: string;
      lineType: string;
      isAc: boolean;
      rakeType: string;
      crowdLevel: string;
      trip: typeof TRAIN_TRIPS[0];
    }> = [];

    TRAIN_TRIPS.forEach(trip => {
      const stop = trip.stops.find(s => s.stationCode === boardStationCode);
      if (stop) {
        const tripObs = INITIAL_OBSERVATIONS[trip.trainNumber];
        const delay = tripObs ? tripObs.delayMinutesAtCurrent : 0;
        const isAc = trip.serviceType.includes('ac');
        const isFast = trip.serviceType.includes('fast');
        const destination = trip.stops[trip.stops.length - 1]?.stationName || trip.destinationStation;
        
        // Filtering
        if (boardFilter === 'fast' && !isFast) return;
        if (boardFilter === 'slow' && isFast) return;
        if (boardFilter === 'ac' && !isAc) return;

        list.push({
          trainNumber: trip.trainNumber,
          trainName: trip.trainName,
          platform: stop.platform || '1',
          scheduledTime: stop.scheduledDeparture || stop.scheduledArrival,
          delayMinutes: delay,
          destination,
          lineType: isFast ? 'Fast' : 'Slow',
          isAc,
          rakeType: trip.rakeType === '15_car' ? '15-car' : '12-car',
          crowdLevel: delay > 10 ? 'Heavy Rush' : delay > 3 ? 'Moderate' : 'Normal',
          trip
        });
      }
    });

    return list.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [boardStationCode, boardFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Live telemetry refreshed from NTES feed');
    }, 600);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(
      `RailOne Live: Train ${currentTrain.trainNumber} (${currentTrain.trainName}) is currently at ${currentStop?.stationName || 'origin'}, ${currentDelay > 0 ? `delayed by ${currentDelay} min` : 'running on time'}.`
    );
    showToast('Running status copied to clipboard');
  };

  const handleToggleSound = () => {
    setSoundAlertActive(!soundAlertActive);
    showToast(soundAlertActive ? 'Arrival chimes disabled' : 'Arrival chime alert enabled for next halt');
  };

  const handleSelectTrain = (num: string) => {
    setSelectedTrainNumber(num);
    setTrainSearchQuery('');
    setExpandedStopCode(null);
  };

  return (
    <div className="space-y-3.5 pb-24 px-3.5 pt-2 text-slate-900 dark:text-slate-100">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2 rounded-2xl shadow-xl border border-slate-700 animate-fadeIn flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. NATIVE MOBILE SUB-TAB NAVIGATION BAR */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800 text-[11px] font-bold">
        {[
          { id: 'tracker', label: t.trackerSubtab, icon: Radio },
          { id: 'board', label: t.boardSubtab, icon: Clock },
          { id: 'map', label: t.mapSubtab, icon: Map },
          { id: 'coach', label: t.coachSubtab, icon: Layers },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all min-h-[46px] active:scale-95 ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-theme-primary shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          SUB-TAB 1: PHONE-FIRST LIVE TRAIN TRACKER ("Where Is My Train" / Yatri Style)
          ========================================================================= */}
      {activeSubTab === 'tracker' && (
        <div className="space-y-3.5 animate-fadeIn">
          
          {/* Quick Train Search Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (filteredSearchTrains.length > 0) {
                handleSelectTrain(filteredSearchTrains[0].trainNumber);
              } else if (trainSearchQuery.trim()) {
                const exact = ALL_TRAINS.find(t => 
                  t.trainNumber.toLowerCase() === trainSearchQuery.trim().toLowerCase()
                );
                if (exact) handleSelectTrain(exact.trainNumber);
              }
            }}
            className="relative"
          >
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search train number or name (e.g. 95112, 12951, 20901)..."
                value={trainSearchQuery}
                onChange={(e) => setTrainSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredSearchTrains.length > 0) {
                      handleSelectTrain(filteredSearchTrains[0].trainNumber);
                    } else if (trainSearchQuery.trim()) {
                      const exact = ALL_TRAINS.find(t => 
                        t.trainNumber.toLowerCase() === trainSearchQuery.trim().toLowerCase()
                      );
                      if (exact) handleSelectTrain(exact.trainNumber);
                    }
                  }
                }}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-theme-primary shadow-xs"
              />
              {trainSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTrainSearchQuery('')}
                  className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {filteredSearchTrains.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-2xl z-30 space-y-1">
                {filteredSearchTrains.map(t => (
                  <button
                    key={t.trainNumber}
                    type="button"
                    onClick={() => handleSelectTrain(t.trainNumber)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-theme-primary">{t.trainNumber}</span>
                      <span className="ml-2 font-semibold text-slate-800 dark:text-slate-200">{t.trainName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{t.originStation} ➔ {t.destinationStation}</span>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Quick Popular Trains Horizontal Pill Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            {popularTrains.map(t => {
              const isSelected = selectedTrainNumber === t.number;
              return (
                <button
                  key={t.number}
                  onClick={() => handleSelectTrain(t.number)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold border transition-all shrink-0 active:scale-95 ${
                    isSelected
                      ? 'bg-theme-primary text-white border-theme-primary shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Train Live Status Hero Card */}
          <div className="p-4 rounded-3xl bg-linear-to-br from-slate-900 via-slate-850 to-slate-950 text-white shadow-xl border border-slate-800 space-y-3.5 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className={`absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
              currentDelay > 5 ? 'bg-rose-500/15' : 'bg-emerald-500/15'
            }`} />

            {/* Top Row: Train Identity & Service Badges */}
            <div className="relative flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-lg text-white tracking-tight">
                    {currentTrain.trainNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">·</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-cyan-300 border border-white/15">
                    {currentTrain.serviceType.replace('_', ' ').toUpperCase()}
                  </span>
                  {currentTrain.serviceType.includes('ac') && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-cyan-500 text-slate-950">
                      AC
                    </span>
                  )}
                </div>
                <h2 className="font-black text-sm text-slate-100 mt-0.5">
                  {currentTrain.trainName}
                </h2>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                  <span>{currentTrain.stops[0]?.stationName}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span>{currentTrain.stops[currentTrain.stops.length - 1]?.stationName}</span>
                </div>
              </div>

              {/* Verified Live Pill */}
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  [TIMETABLE SCHEDULE]
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {obs?.dataSource ? 'Timetable Simulation' : 'Timetable Active'}
                </span>
              </div>
            </div>

            {/* Live Status Hero Pill */}
            <div className={`p-3 rounded-2xl flex items-center justify-between border ${
              isCanceled
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-200'
                : !hasDeparted
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                : currentDelay <= 2
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    currentDelay > 5 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${
                    currentDelay > 5 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                </span>
                <div>
                  <div className="text-xs font-black tracking-wide">
                    {isCanceled
                      ? 'Service Cancelled Today'
                      : !hasDeparted
                      ? `Awaiting Departure at ${currentTrain.stops[0]?.stationName}`
                      : currentDelay <= 2
                      ? `Running On Time · Approaching ${currentStop?.stationName || 'Next Halt'}`
                      : `Running ${currentDelay} min Late · Near ${currentStop?.stationName || 'Next Halt'}`}
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                    {isCanceled
                      ? 'Refer to station master announcements'
                      : !hasDeparted
                      ? `Scheduled Origin Departure: ${currentTrain.stops[0]?.scheduledDeparture}`
                      : `Platform ${currentRawStop?.platform || '1'} · Next Halt: ${predictedStops[Math.min(totalStops - 1, effectiveCurrentIdx + 1)]?.stationName || 'Terminus'}`}
                  </div>
                </div>
              </div>

              {/* Current Speed / Telemetry Micro Pill */}
              <div className="text-right shrink-0">
                <div className="font-mono text-xs font-black text-white">
                  {hasDeparted ? '~52 km/h' : '0 km/h'}
                </div>
                <div className="text-[9px] text-slate-400 font-mono">Speed</div>
              </div>
            </div>

            {/* Mini Progress Distance Line */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Progress: {progressPercent}%</span>
                <span>{currentDistance.toFixed(1)} / {totalDistance.toFixed(1)} km</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
                <div 
                  className="h-full rounded-full bg-linear-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Commuter Action Bar */}
            <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-800 text-xs">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold active:scale-95 transition-all"
                title="Refresh live NTES position"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-300 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-[11px]">Refresh</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleToggleSound}
                  className={`p-2 rounded-xl border transition-all active:scale-95 ${
                    soundAlertActive
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                  title="Toggle Arrival Chime"
                >
                  <Bell className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                  title="Share Running Status"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Section Disruption Notice if Active */}
          {obs?.disruptionReason && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Track Advisory / Disruption Active</span>
              </div>
              <p className="text-[11px] leading-relaxed pl-5.5">
                {obs.disruptionReason}
              </p>
            </div>
          )}

          {/* =====================================================================
              AUTHENTIC VERTICAL JOURNEY HALT PROGRESS TIMELINE (WIMT / Yatri Style)
              ===================================================================== */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3">
            
            {/* Timeline Header Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Train className="w-4 h-4 text-theme-primary" />
                <span>Route Halt Timeline ({totalStops} Stations)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Tap station for actions
              </span>
            </div>

            {/* Vertical Halt List */}
            <div className="space-y-0 relative py-1">
              {predictedStops.map((stop, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === totalStops - 1;
                const isPassed = hasDeparted && idx < effectiveCurrentIdx;
                const isCurrent = idx === effectiveCurrentIdx;
                const isUpcoming = !hasDeparted || idx > effectiveCurrentIdx;

                const rawStop = currentTrain.stops[idx];
                const platform = rawStop?.platform || '1';
                const distanceKm = rawStop?.distanceKm ?? idx * 5;
                const isExpanded = expandedStopCode === stop.stationCode;
                const isInterchange = STATIONS[stop.stationCode]?.isInterchange;

                return (
                  <div key={stop.stationCode} className="relative">
                    
                    {/* Main Halt Row */}
                    <div 
                      onClick={() => setExpandedStopCode(isExpanded ? null : stop.stationCode)}
                      className={`flex items-start gap-3 py-2.5 px-2 rounded-2xl cursor-pointer transition-colors ${
                        isCurrent 
                          ? 'bg-cyan-500/10 dark:bg-cyan-950/30' 
                          : isExpanded 
                          ? 'bg-slate-100 dark:bg-slate-800/60' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      {/* Left Track Column: Continuous Rail & Node */}
                      <div className="relative flex flex-col items-center justify-center shrink-0 w-8 self-stretch">
                        {/* Top Line Connector */}
                        {!isFirst && (
                          <div className={`w-0.5 flex-1 ${
                            isPassed || isCurrent
                              ? 'bg-emerald-500'
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`} />
                        )}

                        {/* Station Node Marker */}
                        <div className="relative my-0.5 z-10">
                          {isCurrent ? (
                            <div className="relative flex items-center justify-center">
                              <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-cyan-400 opacity-60" />
                              <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-md ring-2 ring-cyan-300">
                                <Train className="w-3.5 h-3.5 fill-slate-950 stroke-slate-950" />
                              </div>
                            </div>
                          ) : isPassed ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : isLast ? (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-700 dark:border-slate-300 bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs">
                              <div className="w-2 h-2 rounded-full bg-slate-800 dark:bg-slate-200" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900" />
                          )}
                        </div>

                        {/* Bottom Line Connector */}
                        {!isLast && (
                          <div className={`w-0.5 flex-1 ${
                            isPassed
                              ? 'bg-emerald-500'
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`} />
                        )}
                      </div>

                      {/* Middle Column: Station Name, Code & Interchange */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-bold text-xs truncate ${
                            isCurrent
                              ? 'text-cyan-600 dark:text-cyan-300 font-black text-sm'
                              : isPassed
                              ? 'text-slate-500 dark:text-slate-400 line-through decoration-slate-400/40'
                              : 'text-slate-900 dark:text-white'
                          }`}>
                            {stop.stationName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ({stop.stationCode})
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                              TRAIN HERE
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                          <span>{distanceKm} km</span>
                          {isInterchange && (
                            <>
                              <span>·</span>
                              <span className="text-theme-primary font-bold">Interchange Hub</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Column: Platform Pill & Timing */}
                      <div className="shrink-0 text-right space-y-0.5 pt-0.5">
                        {/* Platform Badge */}
                        <div className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-black text-slate-800 dark:text-slate-200">
                          PF {platform}
                        </div>

                        {/* Timings */}
                        <div className="font-mono text-xs">
                          {stop.delayArrivalMinutes > 0 ? (
                            <div className="flex items-center justify-end gap-1">
                              <span className="line-through text-slate-400 text-[10px]">
                                {stop.scheduledArrival || stop.scheduledDeparture}
                              </span>
                              <span className="font-black text-amber-600 dark:text-amber-400">
                                {stop.predictedArrival || stop.predictedDeparture}
                              </span>
                            </div>
                          ) : (
                            <div className="font-black text-emerald-600 dark:text-emerald-400">
                              {stop.scheduledArrival || stop.scheduledDeparture}
                            </div>
                          )}
                        </div>

                        {/* Delay Pill */}
                        <div className="text-[9px] font-bold font-mono">
                          {stop.delayArrivalMinutes > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400">+{stop.delayArrivalMinutes}m late</span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">On Time</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Station Action Tray */}
                    {isExpanded && (
                      <div className="ml-11 mr-2 mb-2 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 animate-fadeIn space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Commuter Wayfinding & Routing for {stop.stationName}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlanRouteFromStation(stop.stationCode);
                            }}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-theme-primary text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                          >
                            <ArrowRight className="w-3.5 h-3.5 text-theme-primary" />
                            <span>From Here</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlanRouteToStation(stop.stationCode);
                            }}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-theme-primary text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                          >
                            <MapPin className="w-3.5 h-3.5 text-theme-primary" />
                            <span>To Here</span>
                          </button>

                          {/* 3D God's Eye Wayfinding if Available */}
                          {['DR', 'CSMT', 'TNA', 'ADH', 'KYN', 'CLA', 'BVI', 'CCG'].includes(stop.stationCode) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenGodsEye(stop.stationCode);
                              }}
                              className="col-span-2 p-2 rounded-xl bg-theme-primary text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                            >
                              <Compass className="w-3.5 h-3.5" />
                              <span>Open 3D Station Layout (FOB Walk & Elevators)</span>
                            </button>
                          )}

                          {/* Coach Guide on this Platform */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCoachStationCode(stop.stationCode);
                              setCoachPlatform(platform);
                              setActiveSubTab('coach');
                            }}
                            className="col-span-2 p-2 rounded-xl bg-slate-200 dark:bg-slate-750 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Layers className="w-3.5 h-3.5 text-theme-primary" />
                            <span>View Coach Alignment on PF {platform}</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: STATION LIVE DEPARTURE BOARD (m-Indicator / Platform Board Style)
          ========================================================================= */}
      {activeSubTab === 'board' && (
        <div className="space-y-3.5 animate-fadeIn">
          
          {/* Station Selector Bar */}
          <div className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-theme-primary" />
                <span>Station Platform Board:</span>
              </span>
              <select
                value={boardStationCode}
                onChange={(e) => setBoardStationCode(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-hidden"
              >
                {hubStations.map(s => (
                  <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            {/* Quick Hub Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {hubStations.map(s => (
                <button
                  key={s.code}
                  onClick={() => setBoardStationCode(s.code)}
                  className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-bold border transition-all active:scale-95 ${
                    boardStationCode === s.code
                      ? 'bg-theme-primary text-white border-theme-primary shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {s.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Station Navigation & Guide Card (Mobile 2D Native) */}
          <button
            onClick={() => onOpenGodsEye(boardStationCode)}
            className="w-full p-3.5 rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-500/30 text-white flex items-center justify-between shadow-md active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
                <Compass className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black">{t.stationNavTitle}</div>
                <div className="text-[10px] text-cyan-200 font-mono">{t.stationNavSubtitle} ({boardStationCode})</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-300" />
          </button>

          {/* Service Filter Chips */}
          <div className="flex items-center gap-1.5 text-xs font-bold">
            {[
              { id: 'all', label: t.allServices },
              { id: 'fast', label: t.fastLocal },
              { id: 'slow', label: t.slowLocal },
              { id: 'ac', label: t.acLocal }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setBoardFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl border transition-all active:scale-95 ${
                  boardFilter === f.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Dynamic Live Departures List */}
          <div className="space-y-2">
            {boardDepartures.length === 0 ? (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No departing services matching filter right now
                </div>
                <div className="text-[10px] text-slate-500">
                  Try switching between Fast, Slow, or AC Locals filter tabs.
                </div>
              </div>
            ) : (
              boardDepartures.map((train, idx) => (
                <div 
                  key={`${train.trainNumber}-${idx}`}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2.5 transition-all hover:border-slate-400"
                >
                  <div className="flex items-center justify-between">
                    {/* Platform Badge & Train Details */}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white flex flex-col items-center justify-center font-mono shadow-xs shrink-0">
                        <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">PF</span>
                        <span className="text-sm font-black leading-none">{train.platform}</span>
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                          <span>{train.destination}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                            train.lineType === 'Fast'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          }`}>
                            {train.lineType}
                          </span>
                          {train.isAc && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-black text-[8px]">
                              AC
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                          <span>#{train.trainNumber}</span>
                          <span>·</span>
                          <span>{train.rakeType}</span>
                          <span>·</span>
                          <span>{train.crowdLevel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Time & Delay Status */}
                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                        {train.scheduledTime}
                      </div>
                      <div className="text-[10px] font-bold">
                        {train.delayMinutes > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400">+{train.delayMinutes}m delay</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-black">On Time</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Shortcuts on Departure Card */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold">
                    <button
                      onClick={() => {
                        setSelectedTrainNumber(train.trainNumber);
                        setActiveSubTab('tracker');
                      }}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      <Radio className="w-3.5 h-3.5 text-theme-primary" />
                      <span>Track Train</span>
                    </button>

                    <button
                      onClick={() => {
                        setCoachStationCode(boardStationCode);
                        setCoachPlatform(train.platform);
                        setCoachRakeType(
                          train.isAc 
                            ? '12_car_ac_suburban' 
                            : train.rakeType === '15-car' 
                            ? '15_car_suburban' 
                            : '12_car_suburban'
                        );
                        setActiveSubTab('coach');
                      }}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      <Layers className="w-3.5 h-3.5 text-theme-primary" />
                      <span>Coach Guide</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: 2D INTERACTIVE NETWORK MAP
          ========================================================================= */}
      {activeSubTab === 'map' && (
        <div className="space-y-3.5 animate-fadeIn">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <Map className="w-4 h-4 text-theme-primary" />
              <span>Mumbai Suburban Transit Map</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Pinch / drag to explore lines</span>
          </div>

          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-2 min-h-[420px]">
            <NetworkMapViewer 
              onPlanRouteFromStation={onPlanRouteFromStation}
              onPlanRouteToStation={onPlanRouteToStation}
              onOpenGodsEye={onOpenGodsEye}
              compactMode={true}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 4: COACH POSITION GUIDE (Wagenstandsanzeiger)
          ========================================================================= */}
      {activeSubTab === 'coach' && (
        <div className="space-y-3.5 animate-fadeIn">
          
          {/* Platform & Station Selector Chips */}
          <div className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-theme-primary" />
                <span>Train Coach Position Guide</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                {coachStationCode} · PF {coachPlatform}
              </span>
            </div>

            {/* Quick Station / Platform Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {[
                { st: 'DR', pf: '3', label: 'Dadar PF 3' },
                { st: 'DR', pf: '4', label: 'Dadar PF 4' },
                { st: 'TNA', pf: '2', label: 'Thane PF 2' },
                { st: 'ADH', pf: '1', label: 'Andheri PF 1' },
                { st: 'CSMT', pf: '5', label: 'CSMT PF 5' },
                { st: 'KYN', pf: '4', label: 'Kalyan PF 4' },
              ].map(p => {
                const isSelected = coachStationCode === p.st && coachPlatform === p.pf;
                return (
                  <button
                    key={`${p.st}-${p.pf}`}
                    onClick={() => {
                      setCoachStationCode(p.st);
                      setCoachPlatform(p.pf);
                    }}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold border transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-theme-primary text-white border-theme-primary shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Rake Model Picker */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
              {[
                { id: '12_car_suburban', label: '12-Car Non-AC' },
                { id: '12_car_ac_suburban', label: '12-Car AC Local' },
                { id: '15_car_suburban', label: '15-Car Suburban' },
                { id: '16_car_vande_bharat', label: 'Vande Bharat' },
                { id: '22_car_express', label: '22-Car Express' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setCoachRakeType(m.id as any)}
                  className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-bold border transition-all active:scale-95 ${
                    coachRakeType === m.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Embedded Coach Guide with Dynamic Platform & Rake Parameters */}
          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-3">
            <CoachPositionGuide
              key={`${coachRakeType}-${coachStationCode}-${coachPlatform}`}
              initialRakeType={coachRakeType}
              stationCode={coachStationCode}
              platformNumber={coachPlatform}
              compactMode={true}
            />
          </div>
        </div>
      )}

    </div>
  );
};
