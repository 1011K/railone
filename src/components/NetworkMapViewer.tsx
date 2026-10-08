import React, { useState, useMemo, useRef } from 'react';
import { 
  MapScope, 
  MapRenderMode, 
  MapStationNode, 
  MapTrackSegment, 
  MapTrainMarker,
  TrainTrip,
  RegionalLine 
} from '../types/railway';
import { 
  getStationsForScope, 
  getTrackSegmentsForScope, 
  getTrainMarkersForScope,
  getRouteSegmentsForTrain,
  searchNetworkMap,
  project3DIsometric,
  ALL_NETWORK_TRAINS
} from '../engine/networkMapEngine';
import { generateMetroTrips } from '../engine/journeyEngine';
import { 
  Train, 
  Layers, 
  AlertTriangle, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Search, 
  X, 
  MapPin, 
  Activity, 
  ArrowRight, 
  Info, 
  ShieldCheck, 
  Zap, 
  CheckCircle2,
  Navigation,
  Compass,
  Eye,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useTheme } from './ThemeContext';

interface NetworkMapViewerProps {
  onPlanRouteFromStation?: (stationCode: string) => void;
  onPlanRouteToStation?: (stationCode: string) => void;
  onInspectTrainSchedule?: (trainNumber: string) => void;
  onOpenGodsEye?: (stationCode: string) => void;
  compactMode?: boolean;
}

export const NetworkMapViewer: React.FC<NetworkMapViewerProps> = ({
  onPlanRouteFromStation,
  onPlanRouteToStation,
  onInspectTrainSchedule,
  onOpenGodsEye,
  compactMode = false
}) => {
  const { language } = useTheme();
  const [scope, setScope] = useState<MapScope>('mumbai_suburban');
  const [renderMode, setRenderMode] = useState<MapRenderMode>('2d');
  const [mapPerspective, setMapPerspective] = useState<'schematic' | 'geographical'>('schematic');
  const [delayFilter, setDelayFilter] = useState<'all' | 'disrupted' | 'ontime'>('all');
  const [suburbanLineFilter, setSuburbanLineFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection states
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [selectedStationCode, setSelectedStationCode] = useState<string | null>(null);
  const [selectedTrainNumber, setSelectedTrainNumber] = useState<string | null>(null);

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 3D Isometric View Controls
  const [pitch, setPitch] = useState(38);
  const [rotation, setRotation] = useState(-15);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchPinchDistRef = useRef<number | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasPassedDragThresholdRef = useRef<boolean>(false);

  // Load dataset for current scope
  const stations = useMemo(() => getStationsForScope(scope), [scope]);
  const allSegments = useMemo(() => getTrackSegmentsForScope(scope), [scope]);
  const trainMarkers = useMemo(() => getTrainMarkersForScope(scope), [scope]);

  // Reset selection and pan when switching scopes
  const handleScopeChange = (newScope: MapScope) => {
    setScope(newScope);
    setSelectedSegmentId(null);
    setSelectedStationCode(null);
    setSelectedTrainNumber(null);
    setSearchQuery('');
    setSuburbanLineFilter('all');
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Traversed segments for active selected train (for illuminated route highlights)
  const activeTrainSegments = useMemo(() => {
    if (!selectedTrainNumber) return new Set<string>();
    return new Set(getRouteSegmentsForTrain(selectedTrainNumber, scope));
  }, [selectedTrainNumber, scope]);

  // Filter track segments by line and delay
  const filteredSegments = useMemo(() => {
    return allSegments.filter(seg => {
      // Delay filter
      if (delayFilter === 'disrupted' && seg.averageDelayMinutes < 15) return false;
      if (delayFilter === 'ontime' && seg.averageDelayMinutes > 5) return false;
      
      // Line filter for Mumbai Suburban
      if (scope === 'mumbai_suburban' && suburbanLineFilter !== 'all') {
        if (suburbanLineFilter === 'metro') {
          if (seg.line !== 'metro') return false;
        } else if (seg.line !== suburbanLineFilter && !activeTrainSegments.has(seg.id)) {
          return false;
        }
      }

      return true;
    });
  }, [allSegments, delayFilter, suburbanLineFilter, scope, activeTrainSegments]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchNetworkMap(searchQuery, scope);
  }, [searchQuery, scope]);

  // Overall network statistics
  const networkStats = useMemo(() => {
    const totalSegs = allSegments.length;
    const totalAvgDelay = totalSegs > 0 
      ? Math.round(allSegments.reduce((acc, s) => acc + s.averageDelayMinutes, 0) / totalSegs) 
      : 0;
    const bottleneckCount = allSegments.filter(s => s.isBottleneck).length;
    const maxTrackDelay = allSegments.reduce((max, s) => Math.max(max, s.averageDelayMinutes), 0);
    const totalPassingTrains = new Set(allSegments.flatMap(s => s.trainsPassing)).size;

    return {
      totalSegs,
      totalAvgDelay,
      bottleneckCount,
      maxTrackDelay,
      totalPassingTrains
    };
  }, [allSegments]);

  // Active inspected segment
  const activeSegment = useMemo(() => {
    if (selectedSegmentId) {
      return allSegments.find(s => s.id === selectedSegmentId) || null;
    }
    return null;
  }, [selectedSegmentId, allSegments]);

  // Active inspected station
  const activeStation = useMemo(() => {
    if (selectedStationCode) {
      // Look in current scope first, then fallback to global catalog
      const fromScope = stations.find(s => s.code === selectedStationCode);
      if (fromScope) return fromScope;
      const allPossibilities = [...getStationsForScope('mumbai_suburban'), ...getStationsForScope('pan_india'), ...getStationsForScope('mumbai_metro')];
      return allPossibilities.find(s => s.code === selectedStationCode) || null;
    }
    return null;
  }, [selectedStationCode, stations]);

  // Active calling trains at active station
  const activeStationCallingTrains = useMemo(() => {
    if (!activeStation) return [];
    const directTrains = ALL_NETWORK_TRAINS.filter(t => t.stops.some(s => s.stationCode === activeStation.code));
    if (directTrains.length > 0) return directTrains;
    if (activeStation.line === 'metro' || activeStation.code.startsWith('METRO_')) {
      const metro = generateMetroTrips('10:30').filter(t => t.stops.some(s => s.stationCode === activeStation.code));
      return metro.slice(0, 6);
    }
    return [];
  }, [activeStation]);

  // Active inspected train
  const activeTrain = useMemo(() => {
    if (selectedTrainNumber) {
      return ALL_NETWORK_TRAINS.find(t => t.trainNumber === selectedTrainNumber) || null;
    }
    return null;
  }, [selectedTrainNumber]);

  // Pan drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag and pinch-to-zoom handlers with 360px viewport optimization
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      hasPassedDragThresholdRef.current = false;
      setIsDragging(false);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      hasPassedDragThresholdRef.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      touchPinchDistRef.current = dist > 10 ? dist : null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStartPosRef.current) {
      const deltaX = e.touches[0].clientX - touchStartPosRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartPosRef.current.y;
      const moveDistance = Math.hypot(deltaX, deltaY);

      // Enforce 6px drag threshold to prevent accidental drags during taps on 360px viewport
      if (!hasPassedDragThresholdRef.current && moveDistance > 6) {
        hasPassedDragThresholdRef.current = true;
        setIsDragging(true);
      }

      if (hasPassedDragThresholdRef.current) {
        const rawX = e.touches[0].clientX - dragStart.x;
        const rawY = e.touches[0].clientY - dragStart.y;
        // Clamp pan so map never slides off-screen on narrow viewports
        const clampedX = Math.max(-600, Math.min(600, rawX));
        const clampedY = Math.max(-500, Math.min(500, rawY));
        setPan({ x: clampedX, y: clampedY });
      }
    } else if (e.touches.length === 2 && touchPinchDistRef.current !== null && touchPinchDistRef.current > 15) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      if (newDist > 15) {
        const rawRatio = newDist / touchPinchDistRef.current;
        // Smooth ratio dampening to prevent jumpy zoom on small screens
        const dampedRatio = 1 + (rawRatio - 1) * 0.7;
        if (Math.abs(1 - dampedRatio) > 0.008) {
          setZoom(z => Math.max(0.6, Math.min(3.0, Number((z * dampedRatio).toFixed(2)))));
          touchPinchDistRef.current = newDist;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchPinchDistRef.current = null;
    touchStartPosRef.current = null;
    hasPassedDragThresholdRef.current = false;
  };

  const handleTouchCancel = () => {
    setIsDragging(false);
    touchPinchDistRef.current = null;
    touchStartPosRef.current = null;
    hasPassedDragThresholdRef.current = false;
  };

  const handleZoomIn = () => setZoom(z => Math.min(3.0, Number((z + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoom(z => Math.max(0.6, Number((z - 0.25).toFixed(2))));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setPitch(38);
    setRotation(-15);
  };

  // Convert SVG coordinates for 2D vs 3D Isometric Projection
  const projectCoords = (x: number, y: number, z: number = 0) => {
    if (renderMode === '2d') {
      return { px: x, py: y };
    }
    const iso = project3DIsometric(x, y, z, pitch, rotation);
    return { px: iso.projX, py: iso.projY };
  };

  // Focus station from search or click
  const handleFocusStation = (code: string) => {
    setSelectedStationCode(code);
    setSelectedSegmentId(null);
    setSelectedTrainNumber(null);
    setSearchQuery('');

    // If target station belongs to another scope, automatically switch to appropriate scope
    let target = stations.find(s => s.code === code);
    if (!target) {
      const panStns = getStationsForScope('pan_india');
      const metroStns = getStationsForScope('mumbai_metro');
      const subStns = getStationsForScope('mumbai_suburban');
      if (panStns.some(s => s.code === code)) {
        setScope('pan_india');
        target = panStns.find(s => s.code === code);
      } else if (metroStns.some(s => s.code === code)) {
        setScope('mumbai_metro');
        target = metroStns.find(s => s.code === code);
      } else if (subStns.some(s => s.code === code)) {
        setScope('mumbai_suburban');
        target = subStns.find(s => s.code === code);
      }
    }

    if (target) {
      const p = projectCoords(target.x, target.y, target.z || 10);
      const targetZoom = 1.3;
      setPan({ 
        x: Math.round((500 - p.px) * targetZoom), 
        y: Math.round((475 - p.py) * targetZoom) 
      });
      setZoom(targetZoom);
    }
  };

  // Focus train from search or click
  const handleFocusTrain = (tNum: string) => {
    setSelectedTrainNumber(tNum);
    setSelectedSegmentId(null);
    setSelectedStationCode(null);
    setSearchQuery('');
    const marker = trainMarkers.find(m => m.trainNumber === tNum);
    if (marker) {
      const p = projectCoords(marker.position.x, marker.position.y, (marker.position.z || 10) + 5);
      const targetZoom = 1.3;
      setPan({ 
        x: Math.round((500 - p.px) * targetZoom), 
        y: Math.round((475 - p.py) * targetZoom) 
      });
      setZoom(targetZoom);
    }
  };

  // Color mapper for delay intensity
  const getDelayColor = (delayMinutes: number) => {
    if (delayMinutes >= 30) return '#ef4444'; // Red 500 (Critical)
    if (delayMinutes >= 16) return '#f97316'; // Orange 500 (Heavy)
    if (delayMinutes >= 6) return '#f59e0b';  // Amber 500 (Moderate)
    return '#10b981';                         // Emerald 500 (Punctual)
  };

  return (
    <div className={compactMode ? "space-y-2.5" : "space-y-6"}>
      
      {/* Header & Controls Toolbar */}
      {compactMode ? (
        <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs shadow-xs space-y-2">
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[10px]">
            {/* Quick scope / line chips */}
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'All Lines', targetScope: 'mumbai_suburban' as MapScope },
                { id: 'western', label: 'Western', targetScope: 'mumbai_suburban' as MapScope },
                { id: 'central', label: 'Central', targetScope: 'mumbai_suburban' as MapScope },
                { id: 'harbour', label: 'Harbour', targetScope: 'mumbai_suburban' as MapScope },
                { id: 'metro', label: 'Metro', targetScope: 'mumbai_metro' as MapScope },
                { id: 'pan_india', label: 'Trunk', targetScope: 'pan_india' as MapScope },
              ].map(chip => {
                const isActive = chip.targetScope === 'pan_india' 
                  ? scope === 'pan_india' 
                  : chip.targetScope === 'mumbai_metro'
                  ? scope === 'mumbai_metro'
                  : scope === 'mumbai_suburban' && suburbanLineFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => {
                      if (chip.targetScope !== scope) handleScopeChange(chip.targetScope);
                      if (chip.targetScope === 'mumbai_suburban') setSuburbanLineFilter(chip.id);
                    }}
                    className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-bold transition-all active:scale-95 ${
                      isActive
                        ? 'bg-theme-primary text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Schematic / Geographical, 2D / 3D and Disruption toggles */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setMapPerspective(mapPerspective === 'schematic' ? 'geographical' : 'schematic')}
                className={`px-2 py-1 rounded-xl text-[10px] font-bold border active:scale-95 transition-all ${
                  mapPerspective === 'geographical'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {mapPerspective === 'schematic' ? 'Schematic' : 'Geographical'}
              </button>
              <button
                onClick={() => setRenderMode(renderMode === '2d' ? '3d' : '2d')}
                className="px-2 py-1 rounded-xl bg-slate-800 text-cyan-300 font-mono font-bold border border-slate-700 active:scale-95"
              >
                {renderMode === '2d' ? '3D' : '2D'}
              </button>
              <button
                onClick={() => setDelayFilter(delayFilter === 'all' ? 'disrupted' : 'all')}
                className={`px-2 py-1 rounded-xl font-bold border active:scale-95 ${
                  delayFilter === 'disrupted'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {delayFilter === 'disrupted' ? 'Delayed Only' : 'Delays'}
              </button>
            </div>
          </div>
        </div>
      ) : (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-theme-light text-theme-primary border border-theme-border">
                <Navigation className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  {language === 'hi' ? 'लाइव रेल नेटवर्क मैप' : language === 'mr' ? 'थेट रेल्वे नेटवर्क नकाशा' : 'Live Rail & Transit Network Map'}
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-theme-light text-theme-text border border-theme-border">
                    {scope === 'mumbai_metro' ? 'Mumbai Metro' : scope === 'pan_india' ? 'Pan-India Trunk' : 'Mumbai Suburban'}
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Interactive track geometry, station waypoints, interchange nodes & verified delay intelligence.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Scope Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Network Scope Selector */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
              <button
                onClick={() => handleScopeChange('mumbai_suburban')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  scope === 'mumbai_suburban'
                    ? 'bg-theme-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Mumbai Suburban
              </button>
              <button
                onClick={() => handleScopeChange('mumbai_metro')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  scope === 'mumbai_metro'
                    ? 'bg-theme-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Mumbai Metro
              </button>
              <button
                onClick={() => handleScopeChange('pan_india')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  scope === 'pan_india'
                    ? 'bg-theme-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Pan-India Trunk
              </button>
            </div>

            {/* Synchronized View Perspective Toggle */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setMapPerspective('schematic')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  mapPerspective === 'schematic'
                    ? 'bg-theme-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Schematic Network
              </button>
              <button
                onClick={() => setMapPerspective('geographical')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  mapPerspective === 'geographical'
                    ? 'bg-theme-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Geographical Map
              </button>
            </div>

            {/* 2D vs 3D Projection Toggle */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setRenderMode('2d')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  renderMode === '2d'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                2D Flat
              </button>
              <button
                onClick={() => setRenderMode('3d')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  renderMode === '3d'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                3D Isometric
              </button>
            </div>

            {/* Delay Severity Filter */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 text-xs">
              <button
                onClick={() => setDelayFilter('all')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                  delayFilter === 'all' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Tracks
              </button>
              <button
                onClick={() => setDelayFilter('disrupted')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 ${
                  delayFilter === 'disrupted' 
                    ? 'bg-red-500 text-white shadow-xs' 
                    : 'text-red-500 hover:text-red-600'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                Delayed (&gt;15m)
              </button>
              <button
                onClick={() => setDelayFilter('ontime')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 ${
                  delayFilter === 'ontime' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-emerald-600 hover:text-emerald-700'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Punctual
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Filter & Search Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Suburban Lines Switcher (Only in Suburban mode) */}
          {scope === 'mumbai_suburban' ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" /> Line Filter:
              </span>
              {[
                { id: 'all', label: 'All Suburban Lines' },
                { id: 'western', label: 'Western Line' },
                { id: 'central', label: 'Central Main' },
                { id: 'harbour', label: 'Harbour Line' },
                { id: 'transharbour', label: 'Trans-Harbour' },
                { id: 'uran', label: 'Uran Line' },
                { id: 'metro', label: 'Metro Link' }
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setSuburbanLineFilter(btn.id)}
                  className={`px-2.5 py-1 rounded-xl font-semibold transition-all ${
                    suburbanLineFilter === btn.id
                      ? 'bg-theme-primary text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          ) : scope === 'mumbai_metro' ? (
            <div className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
              <span className="font-bold flex items-center gap-1"><Compass className="w-3.5 h-3.5" /> Lines:</span>
              <span className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold">Line 1 (Blue)</span>
              <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">Line 2A (Yellow)</span>
              <span className="px-2 py-0.5 rounded-lg bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold">Line 7 (Red)</span>
              <span className="px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-bold">Line 3 (Aqua)</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-theme-primary" />
              Showing 40+ National Railway Hubs & High-Speed Golden Quadrilateral Corridors
            </div>
          )}

          {/* Interactive Search Autocomplete Input */}
          <div className="relative w-full md:w-80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search stations, trains, or line..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {searchResults && (searchResults.stations.length > 0 || searchResults.trains.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-30 max-h-64 overflow-y-auto p-2 space-y-1">
                {searchResults.stations.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 block">
                      Stations ({searchResults.stations.length})
                    </span>
                    {searchResults.stations.slice(0, 8).map(st => (
                      <div
                        key={st.id}
                        onClick={() => handleFocusStation(st.code)}
                        className="px-2.5 py-1.5 rounded-xl text-xs hover:bg-theme-light cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {st.name} <span className="font-mono text-theme-primary">({st.code})</span>
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">
                          {st.line}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.trains.length > 0 && (
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 block">
                      Trains ({searchResults.trains.length})
                    </span>
                    {searchResults.trains.slice(0, 6).map(t => (
                      <div
                        key={t.trainNumber}
                        onClick={() => handleFocusTrain(t.trainNumber)}
                        className="px-2.5 py-1.5 rounded-xl text-xs hover:bg-theme-light cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {t.trainNumber} • {t.trainName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {t.originStation} ➔ {t.destinationStation}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Network Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Average Network Track Delay
            </span>
            <span className={`text-base font-extrabold ${networkStats.totalAvgDelay > 15 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
              +{networkStats.totalAvgDelay} min / corridor
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Critical Congestion Bottlenecks
            </span>
            <span className="text-base font-extrabold text-red-500">
              {networkStats.bottleneckCount} Track Sections
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Active Network Trains Monitored
            </span>
            <span className="text-base font-extrabold text-theme-primary">
              {networkStats.totalPassingTrains} Services
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Data Verification Provenance
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-theme-primary" />
              [TIMETABLE SCHEDULE & STATUS]
            </span>
          </div>
        </div>
      </div>
      )}

      {/* Main Map Viewport & Sidebar Inspector Grid */}
      <div className={compactMode ? "w-full" : "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"}>
        
        {/* Interactive SVG Canvas */}
        <div className={`${compactMode ? 'w-full' : 'lg:col-span-8'} bg-[#090d16] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative select-none`}>
          
          {/* Canvas Floating Overlay Controls */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900/90 text-white backdrop-blur border border-slate-700/80 text-xs font-bold flex items-center gap-2 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              {scope === 'mumbai_suburban' ? 'Mumbai Suburban (WR / CR / HR / Trans-Harbour / Uran)' : scope === 'mumbai_metro' ? 'Mumbai Metro Transit System' : 'Pan-India Golden & Trunk Corridors'}
              <span className="text-[10px] text-slate-400 uppercase font-mono">
                [{mapPerspective.toUpperCase()} · {renderMode.toUpperCase()}]
              </span>
            </div>
            {selectedTrainNumber && (
              <div className="px-3 py-1.5 rounded-2xl bg-theme-primary text-white backdrop-blur text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
                <Zap className="w-3.5 h-3.5" />
                Train #{selectedTrainNumber} Route Highlighted
              </div>
            )}
          </div>

          {/* Zoom & View Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl backdrop-blur border border-slate-700/80 shadow-lg">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset Map View"
              aria-label="Reset Map View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* 3D Tilt sliders if in 3D Mode */}
          {renderMode === '3d' && (
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-slate-700/80 text-[11px] text-slate-300 backdrop-blur shadow-lg">
              <span className="font-bold flex items-center gap-1 text-theme-primary">
                <Layers className="w-3.5 h-3.5" /> 3D Pitch:
              </span>
              <input 
                type="range" 
                min="20" 
                max="60" 
                value={pitch} 
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-20 accent-theme-primary cursor-pointer"
                title="Adjust 3D Pitch"
              />
              <span className="font-bold text-theme-primary ml-1">Rot:</span>
              <input 
                type="range" 
                min="-45" 
                max="45" 
                value={rotation} 
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-20 accent-theme-primary cursor-pointer"
                title="Adjust 3D Rotation"
              />
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-3 bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-slate-700/80 text-[11px] text-slate-300 backdrop-blur shadow-lg">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              On-time
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              6-15m
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              Delayed &gt;15m
            </span>
          </div>

          {/* Floating On-Canvas Station Quick Inspector Card */}
          {activeStation && (
            <div className={`absolute top-14 ${compactMode ? 'left-2 right-2' : 'left-4 max-w-sm'} z-20 bg-slate-900/95 text-white p-3.5 rounded-3xl border border-slate-700/90 shadow-2xl backdrop-blur-md animate-in fade-in duration-200`}>
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-theme-primary text-white">
                      {activeStation.code}
                    </span>
                    <h3 className="font-extrabold text-sm text-white">
                      {activeStation.name}
                    </h3>
                  </div>
                  {activeStation.hindiName && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {activeStation.hindiName} • {activeStation.city} {activeStation.zone ? `(${activeStation.zone})` : ''}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedStationCode(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-2.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Platforms:</span>
                  <span className="font-bold text-white">{activeStation.platforms.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Transit Type:</span>
                  <span className="font-bold text-emerald-400">
                    {activeStation.isInterchange ? 'Major Interchange Hub' : activeStation.isMajorHub ? 'Zonal Terminal' : 'Operational Halt'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                {onPlanRouteFromStation && (
                  <button
                    onClick={() => onPlanRouteFromStation(activeStation.code)}
                    className="flex-1 min-w-[90px] flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-theme-primary hover-bg-theme-primary text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>From Here</span>
                  </button>
                )}
                {onPlanRouteToStation && (
                  <button
                    onClick={() => onPlanRouteToStation(activeStation.code)}
                    className="flex-1 min-w-[90px] flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-theme-primary" />
                    <span>To Here</span>
                  </button>
                )}
                {onOpenGodsEye && (
                  <button
                    onClick={() => onOpenGodsEye(activeStation.code)}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-theme-primary" />
                    <span>3D</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Floating On-Canvas Train Quick Inspector Card */}
          {activeTrain && (
            <div className={`absolute top-14 ${compactMode ? 'left-2 right-2' : 'left-4 max-w-sm'} z-20 bg-slate-900/95 text-white p-3.5 rounded-3xl border border-slate-700/90 shadow-2xl backdrop-blur-md animate-in fade-in duration-200`}>
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-theme-primary text-white">
                      {activeTrain.trainNumber}
                    </span>
                    <h3 className="font-extrabold text-sm text-white">
                      {activeTrain.trainName}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {activeTrain.originStation} ➔ {activeTrain.destinationStation}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTrainNumber(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                  aria-label="Close train details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="py-2.5 text-xs text-slate-300 flex items-center justify-between">
                <span>Service Type:</span>
                <span className="font-bold text-white uppercase">{activeTrain.serviceType.replace('_', ' ')}</span>
              </div>
              {onInspectTrainSchedule && (
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onInspectTrainSchedule(activeTrain.trainNumber)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-theme-primary hover-bg-theme-primary text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <Train className="w-3.5 h-3.5" />
                    <span>View Train Schedule</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SVG Map Canvas */}
          <div 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className={`w-full ${compactMode ? 'h-[440px]' : 'h-[580px] sm:h-[680px]'} overflow-hidden cursor-${isDragging ? 'grabbing' : 'grab'}`}
          >
            <svg 
              className="w-full h-full transition-transform duration-75 ease-out"
              viewBox="0 0 1000 950"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '50% 50%'
              }}
            >
              <defs>
                {/* Glow Filter for Active Trains & Bottlenecks */}
                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Clean Transit Canvas Background (Zero noisy dots) */}
              <rect width="1000" height="950" fill="#090d16" />

              {/* 1. Track Lines Layer */}
              <g className="tracks-layer">
                {filteredSegments.map(seg => {
                  const p1 = projectCoords(seg.coordinates.x1, seg.coordinates.y1, 5);
                  const p2 = projectCoords(seg.coordinates.x2, seg.coordinates.y2, 5);

                  const isSelected = selectedSegmentId === seg.id;
                  const isTraversedByActiveTrain = activeTrainSegments.has(seg.id);
                  const isMetro = seg.line === 'metro';
                  const delayColor = isTraversedByActiveTrain ? '#38bdf8' : isMetro ? '#06b6d4' : getDelayColor(seg.averageDelayMinutes);
                  const midX = (p1.px + p2.px) / 2;
                  const midY = (p1.py + p2.py) / 2;

                  return (
                    <g 
                      key={seg.id} 
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSegmentId(seg.id);
                        setSelectedStationCode(null);
                        setSelectedTrainNumber(null);
                      }}
                    >
                      {/* Track Under-Glow for Disrupted Tracks or Active Train Path */}
                      {(seg.isBottleneck || isTraversedByActiveTrain) && (
                        <line
                          x1={p1.px}
                          y1={p1.py}
                          x2={p2.px}
                          y2={p2.py}
                          stroke={delayColor}
                          strokeWidth={isSelected || isTraversedByActiveTrain ? 9 : 7}
                          strokeOpacity={isTraversedByActiveTrain ? 0.6 : 0.35}
                          strokeLinecap="round"
                          filter={isTraversedByActiveTrain ? 'url(#glow)' : undefined}
                        />
                      )}

                      {/* Main Physical Track Line */}
                      <line
                        x1={p1.px}
                        y1={p1.py}
                        x2={p2.px}
                        y2={p2.py}
                        stroke={delayColor}
                        strokeWidth={isSelected || isTraversedByActiveTrain ? 5 : isMetro ? 4 : 3.5}
                        strokeDasharray={isMetro ? '4,2' : seg.trackType === 'quad_fast_slow' ? 'none' : '6,3'}
                        strokeLinecap="round"
                        className="transition-all duration-200 group-hover:stroke-width-6"
                      />

                      {/* Average Delay Badge on Midpoint of Track (Only show when delayed > 0) */}
                      {seg.averageDelayMinutes > 0 && (
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x={-20}
                            y={-9}
                            width={40}
                            height={18}
                            rx={9}
                            fill="#0b0f19"
                            stroke={delayColor}
                            strokeWidth={isTraversedByActiveTrain ? 2 : 1.5}
                          />
                          <text
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={delayColor}
                            fontSize={8.5}
                            fontWeight="bold"
                            fontFamily="sans-serif"
                          >
                            +{seg.averageDelayMinutes}m
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* 2. Stations Nodes Layer */}
              <g className="stations-layer">
                {stations.map(st => {
                  const p = projectCoords(st.x, st.y, st.z || 10);
                  const isSelected = selectedStationCode === st.code;
                  const isMetro = st.line === 'metro';
                  const isMatchingFilter = suburbanLineFilter === 'all' || 
                    (suburbanLineFilter === 'metro' ? isMetro : st.line === suburbanLineFilter);

                  // Collision detection and progressive label visibility based on zoom:
                  // At zoom 1.0, show Major Hubs and Interchanges prominently with zero overlapping.
                  // At zoom >= 1.25, show all local stations.
                  const shouldShowLabel = isSelected || st.isMajorHub || st.isInterchange || zoom >= 1.25 || stations.length < 35;

                  return (
                    <g 
                      key={st.id} 
                      className={`cursor-pointer group ${!isMatchingFilter ? 'opacity-25' : 'opacity-100'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFocusStation(st.code);
                      }}
                    >
                      {/* Generous Invisible Hit Target Area (r=22) so clicking stations is effortless */}
                      <circle
                        cx={p.px}
                        cy={p.py}
                        r={22}
                        fill="transparent"
                        className="cursor-pointer"
                      />

                      {/* Outer Pulse Beacon for selected station or major hub */}
                      {(isSelected || st.isMajorHub) && (
                        <circle
                          cx={p.px}
                          cy={p.py}
                          r={isSelected ? 16 : 10}
                          fill="none"
                          stroke={isSelected ? '#38bdf8' : isMetro ? '#06b6d4' : '#60a5fa'}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          strokeOpacity={isSelected ? 0.9 : 0.4}
                          className={isSelected ? 'animate-ping' : undefined}
                          style={isSelected ? { animationDuration: '2s' } : undefined}
                        />
                      )}

                      {/* Core Station Shape */}
                      {st.isInterchange ? (
                        /* Interchange Transit Diamond */
                        <rect
                          x={p.px - (isSelected ? 7 : 5.5)}
                          y={p.py - (isSelected ? 7 : 5.5)}
                          width={isSelected ? 14 : 11}
                          height={isSelected ? 14 : 11}
                          rx={3}
                          transform={`rotate(45 ${p.px} ${p.py})`}
                          fill={isSelected ? '#3b82f6' : isMetro ? '#06b6d4' : '#f8fafc'}
                          stroke="#020617"
                          strokeWidth={2}
                          className="transition-transform duration-150 group-hover:scale-125"
                        />
                      ) : (
                        /* Standard Station Circle */
                        <circle
                          cx={p.px}
                          cy={p.py}
                          r={isSelected ? 7.5 : st.isMajorHub ? 6 : isMetro ? 5 : 4}
                          fill={isSelected ? '#3b82f6' : isMetro ? '#06b6d4' : st.isMajorHub ? '#f8fafc' : '#94a3b8'}
                          stroke="#020617"
                          strokeWidth={1.75}
                          className="transition-transform duration-150 group-hover:scale-125"
                        />
                      )}

                      {/* Station Text Label with Anti-Distortion Crisp Dark Halo */}
                      {shouldShowLabel && (
                        <text
                          x={p.px}
                          y={p.py - 11}
                          textAnchor="middle"
                          fill="#f8fafc"
                          stroke="#020617"
                          strokeWidth="3.5"
                          paintOrder="stroke fill"
                          fontSize={isSelected || st.isMajorHub ? 11 : 9.5}
                          fontWeight={isSelected || st.isMajorHub ? 'bold' : '600'}
                          className="select-none font-sans drop-shadow-sm cursor-pointer"
                        >
                          {st.name.split(' ')[0]} ({st.code})
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* 3. Live Train Markers Layer */}
              <g className="trains-layer">
                {trainMarkers.map(tm => {
                  const p = projectCoords(tm.position.x, tm.position.y, (tm.position.z || 10) + 5);
                  const isSelected = selectedTrainNumber === tm.trainNumber;
                  const delayColor = getDelayColor(tm.delayMinutes);

                  return (
                    <g
                      key={tm.trainNumber}
                      transform={`translate(${p.px}, ${p.py})`}
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFocusTrain(tm.trainNumber);
                      }}
                    >
                      {/* Train Marker Body */}
                      <circle
                        cx={0}
                        cy={0}
                        r={isSelected ? 9 : 7}
                        fill={delayColor}
                        stroke="#ffffff"
                        strokeWidth={2}
                        filter="url(#glow)"
                        className="animate-pulse"
                      />

                      {/* Train Delay Bubble Badge */}
                      <g transform="translate(10, -12)">
                        <rect
                          x={0}
                          y={0}
                          width={48}
                          height={16}
                          rx={8}
                          fill="#020617"
                          stroke={delayColor}
                          strokeWidth={isSelected ? 2 : 1}
                        />
                        <text
                          x={24}
                          y={8}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#ffffff"
                          fontSize={8}
                          fontWeight="bold"
                        >
                          {tm.trainNumber}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Sidebar Inspector Panel (4 cols on lg) */}
        {!compactMode && (
          <div className="lg:col-span-4 space-y-4">
            
            {/* Station Details Card */}
            {activeStation && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-theme-primary flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    Station Waypoint Details
                  </span>
                  <button
                    onClick={() => setSelectedStationCode(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {activeStation.name}
                  </h3>
                  {activeStation.hindiName && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {activeStation.hindiName} {activeStation.marathiName ? `• ${activeStation.marathiName}` : ''}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Code: <code className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeStation.code}</code> • Platforms: {activeStation.platforms.join(', ')} • {activeStation.city} {activeStation.zone ? `(${activeStation.zone})` : ''}
                  </p>
                  
                  {/* Verified Station Entrances & Walking Connections */}
                  <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-theme-primary" />
                      Physical Entrances & Walking Transfer Pathways:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {activeStation.code === 'DR'
                        ? 'East: Swaminarayan Mandir Gate • West: Senapati Bapat Marg Exit • Inter-railway FOB (CR PF 8 to WR PF 1) with verified step-free elevator bridge.'
                        : activeStation.code === 'ADH'
                        ? 'West: SV Road Exit • East: Auto Stand Concourse • Elevated Skywalk directly connecting WR Platform 8 to Metro Line 1 concourse.'
                        : activeStation.code === 'CCG'
                        ? 'West: Oval Maidan Subway • East: Churchgate Street • Sub-surface transfer underpass connecting to Metro Line 3.'
                        : activeStation.code === 'CSMT'
                        ? 'Main Heritage Concourse (PF 1-7) • P. D\'Mello Road East Exit (PF 8-18) • Direct sub-surface passage to Metro Line 3 station.'
                        : activeStation.code === 'TNA'
                        ? 'West: Platform 1 Bus Station Exit • East: CIDCO Bus Terminal • Trans-Harbour elevated bridge.'
                        : 'Main Concourse Entrance & Street Access • Verified Foot Over Bridge (FOB) with step-free wheelchair ramp/lift access.'}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-theme-light text-theme-primary border border-theme-border">
                        [TIMETABLE SCHEDULE]
                      </span>
                      {activeStation.isInterchange && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Step-Free Interchange
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3.5">
                    {onPlanRouteFromStation && (
                      <button
                        onClick={() => onPlanRouteFromStation(activeStation.code)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-theme-primary text-white font-bold text-xs shadow-xs hover-bg-theme-primary transition-colors"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Plan Journey From {activeStation.name}</span>
                      </button>
                    )}
                    {onPlanRouteToStation && (
                      <button
                        onClick={() => onPlanRouteToStation(activeStation.code)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-theme-primary" />
                        <span>Plan Journey To {activeStation.name}</span>
                      </button>
                    )}
                    {onOpenGodsEye && (
                      <button
                        onClick={() => onOpenGodsEye(activeStation.code)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-theme-primary" />
                        <span>3D Station Layout</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Trains Calling At This Station */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Scheduled Services Calling ({activeStationCallingTrains.length || activeStation.passingTrainCount || 0}):
                  </h4>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {activeStationCallingTrains.length > 0 ? (
                      activeStationCallingTrains.map(t => {
                        const stop = t.stops.find(s => s.stationCode === activeStation.code);
                        return (
                          <div 
                            key={t.trainNumber}
                            onClick={() => handleFocusTrain(t.trainNumber)}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-theme-light cursor-pointer border border-slate-100 dark:border-slate-800 text-xs transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {t.trainNumber} • {t.trainName}
                              </span>
                              <span className="font-mono text-theme-primary font-bold">
                                {stop?.scheduledArrival || stop?.scheduledDeparture}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {t.originStation} ➔ {t.destinationStation} (Platform {stop?.platform || '1'})
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-500">
                        Regular trunk and express passenger services operate daily on scheduled railway timetables.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Track Segment Inspection Card */}
            {activeSegment && !activeStation && !activeTrain && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-theme-primary flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    Track Corridor Details
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-bold uppercase ${
                    activeSegment.congestionLevel === 'CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                    activeSegment.congestionLevel === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                    activeSegment.congestionLevel === 'MODERATE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {activeSegment.congestionLevel} Congestion
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{activeSegment.fromName}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span>{activeSegment.toName}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Section Code: <code className="font-mono text-slate-700 dark:text-slate-300 font-bold">{activeSegment.id}</code> • {activeSegment.distanceKm} km
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Average Section Delay:
                    </span>
                    <span className={`text-2xl font-black ${
                      activeSegment.averageDelayMinutes >= 15 ? 'text-red-500' :
                      activeSegment.averageDelayMinutes >= 6 ? 'text-amber-500' :
                      'text-emerald-500'
                    }`}>
                      +{activeSegment.averageDelayMinutes} mins
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Disruption Status:
                  </span>
                  <p className="text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                    {activeSegment.disruptionReason || 'Punctual transit flow: Automated track circuits operating with standard headway.'}
                  </p>
                </div>
              </div>
            )}

            {/* Train Details Card */}
            {activeTrain && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-theme-primary flex items-center gap-1.5">
                    <Train className="w-4 h-4" />
                    Train Service Overview
                  </span>
                  <button
                    onClick={() => setSelectedTrainNumber(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {activeTrain.trainNumber} — {activeTrain.trainName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Type: <span className="font-bold uppercase">{activeTrain.serviceType.replace('_', ' ')}</span> • {activeTrain.originStation} ➔ {activeTrain.destinationStation}
                  </p>
                </div>
              </div>
            )}

            {/* Fallback default helper card when nothing is selected */}
            {!activeStation && !activeSegment && !activeTrain && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-theme-primary" />
                  Interactive Map Guide
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Click any station node or track corridor to inspect scheduled platforms, calling trains, transfer FOB walkways, and live delay telemetry.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                  <div>• <strong>Pan & Zoom:</strong> Drag to pan, use + / - buttons to zoom.</div>
                  <div>• <strong>Quick Search:</strong> Type any station code (e.g. NGP, R, DR, KYN) or train number above.</div>
                  <div>• <strong>Transit Modes:</strong> Switch between Suburban, Metro, and Pan-India views.</div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
};

export default NetworkMapViewer;
