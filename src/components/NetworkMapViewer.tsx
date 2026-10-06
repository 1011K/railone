import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  MapScope, 
  MapRenderMode, 
  MapStationNode, 
  MapTrackSegment, 
  MapTrainMarker,
  TrainTrip 
} from '../types/railway';
import { 
  getStationsForScope, 
  getTrackSegmentsForScope, 
  getTrainMarkersForScope,
  project3DIsometric,
  ALL_NETWORK_TRAINS
} from '../engine/networkMapEngine';
import { 
  Train, 
  Layers, 
  AlertTriangle, 
  Clock, 
  Compass, 
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
  Gauge, 
  Filter,
  CheckCircle2,
  Navigation
} from 'lucide-react';

export const NetworkMapViewer: React.FC = () => {
  const [scope, setScope] = useState<MapScope>('mumbai_suburban');
  const [renderMode, setRenderMode] = useState<MapRenderMode>('2d');
  const [delayFilter, setDelayFilter] = useState<'all' | 'disrupted' | 'ontime'>('all');
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
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Filter track segments
  const filteredSegments = useMemo(() => {
    return allSegments.filter(seg => {
      if (delayFilter === 'disrupted') return seg.averageDelayMinutes >= 15;
      if (delayFilter === 'ontime') return seg.averageDelayMinutes <= 5;
      return true;
    });
  }, [allSegments, delayFilter]);

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
    // Default to the highest delay bottleneck if none selected
    return allSegments.find(s => s.isBottleneck) || allSegments[0] || null;
  }, [selectedSegmentId, allSegments]);

  // Active inspected station
  const activeStation = useMemo(() => {
    if (selectedStationCode) {
      return stations.find(s => s.code === selectedStationCode) || null;
    }
    return null;
  }, [selectedStationCode, stations]);

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

  const handleZoomIn = () => setZoom(z => Math.min(2.5, Number((z + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, Number((z - 0.25).toFixed(2))));
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

  // Color mapper for delay intensity
  const getDelayColor = (delayMinutes: number) => {
    if (delayMinutes >= 30) return '#ef4444'; // Red 500 (Critical)
    if (delayMinutes >= 16) return '#f97316'; // Orange 500 (Heavy)
    if (delayMinutes >= 6) return '#f59e0b';  // Amber 500 (Moderate)
    return '#10b981';                         // Emerald 500 (Punctual)
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Navigation className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  Live Rail Network Map
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    2D / 3D Isometric
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time Indian Railways & Mumbai Suburban network topology with multi-train track delays and disruption reasons.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Scope & Projection Mode Switchers */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Scope Toggle: Suburban vs Pan-India */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => handleScopeChange('mumbai_suburban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  scope === 'mumbai_suburban'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Mumbai Suburban
              </button>
              <button
                onClick={() => handleScopeChange('pan_india')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  scope === 'pan_india'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Pan-India Trunk Lines
              </button>
            </div>

            {/* 2D vs 3D Projection Toggle */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setRenderMode('2d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  renderMode === '2d'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                2D Schematic
              </button>
              <button
                onClick={() => setRenderMode('3d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
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
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setDelayFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  delayFilter === 'all' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Tracks
              </button>
              <button
                onClick={() => setDelayFilter('disrupted')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
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
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  delayFilter === 'ontime' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-emerald-600 hover:text-emerald-700'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Punctual (≤5m)
              </button>
            </div>
          </div>
        </div>

        {/* Network Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Average Network Track Delay
            </span>
            <span className={`text-base font-extrabold ${networkStats.totalAvgDelay > 15 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
              +{networkStats.totalAvgDelay} min / corridor
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Critical Congestion Bottlenecks
            </span>
            <span className="text-base font-extrabold text-red-500">
              {networkStats.bottleneckCount} Track Sections
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Active Network Trains Monitored
            </span>
            <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
              {networkStats.totalPassingTrains} Services
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Data Verification Provenance
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              [SIMULATED DATASET]
            </span>
          </div>
        </div>
      </div>

      {/* Main Map Viewport & Sidebar Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Interactive SVG Canvas (8 cols on lg) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative select-none">
          
          {/* Canvas Floating Overlay Controls */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white backdrop-blur border border-slate-700/80 text-xs font-bold flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {scope === 'mumbai_suburban' ? 'Mumbai Suburban Network (WR/CR/HR)' : 'Pan-India Golden & Trunk Corridors'}
              <span className="text-[10px] text-slate-400 uppercase font-mono">
                [{renderMode.toUpperCase()}]
              </span>
            </div>
          </div>

          {/* Zoom & View Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-slate-900/90 p-1.5 rounded-xl backdrop-blur border border-slate-700/80 shadow-lg">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset Map View"
              aria-label="Reset Map View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* 3D Tilt sliders if in 3D Mode */}
          {renderMode === '3d' && (
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 backdrop-blur">
              <span className="font-bold flex items-center gap-1 text-indigo-300">
                <Layers className="w-3.5 h-3.5" /> 3D Pitch:
              </span>
              <input 
                type="range" 
                min="20" 
                max="60" 
                value={pitch} 
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-20 accent-indigo-500 cursor-pointer"
                title="Adjust 3D Pitch"
              />
              <span className="font-bold text-indigo-300 ml-1">Rot:</span>
              <input 
                type="range" 
                min="-45" 
                max="45" 
                value={rotation} 
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-20 accent-indigo-500 cursor-pointer"
                title="Adjust 3D Rotation"
              />
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-3 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 backdrop-blur">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              On-time (≤5m)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              6-15m
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
              16-30m
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              Critical (&gt;30m)
            </span>
          </div>

          {/* SVG Map Canvas */}
          <div 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`w-full h-[580px] sm:h-[680px] overflow-hidden cursor-${isDragging ? 'grabbing' : 'grab'}`}
          >
            <svg 
              className="w-full h-full transition-transform duration-75 ease-out"
              viewBox="0 0 1000 950"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '50% 50%'
              }}
            >
              {/* Background Ambient Grid */}
              <defs>
                <pattern id="railGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                </pattern>
                
                {/* Glow Filter for Active Trains & Bottlenecks */}
                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <rect width="1000" height="950" fill="url(#railGrid)" />

              {/* 1. Track Lines Layer */}
              <g className="tracks-layer">
                {filteredSegments.map(seg => {
                  const p1 = projectCoords(seg.coordinates.x1, seg.coordinates.y1, 5);
                  const p2 = projectCoords(seg.coordinates.x2, seg.coordinates.y2, 5);

                  const isSelected = selectedSegmentId === seg.id;
                  const delayColor = getDelayColor(seg.averageDelayMinutes);
                  const midX = (p1.px + p2.px) / 2;
                  const midY = (p1.py + p2.py) / 2;

                  return (
                    <g 
                      key={seg.id} 
                      className="cursor-pointer group"
                      onClick={() => {
                        setSelectedSegmentId(seg.id);
                        setSelectedStationCode(null);
                        setSelectedTrainNumber(null);
                      }}
                    >
                      {/* Track Under-Glow for Disrupted Tracks */}
                      {seg.isBottleneck && (
                        <line
                          x1={p1.px}
                          y1={p1.py}
                          x2={p2.px}
                          y2={p2.py}
                          stroke={delayColor}
                          strokeWidth={isSelected ? 10 : 8}
                          strokeOpacity={0.35}
                          strokeLinecap="round"
                        />
                      )}

                      {/* Main Physical Track Line */}
                      <line
                        x1={p1.px}
                        y1={p1.py}
                        x2={p2.px}
                        y2={p2.py}
                        stroke={delayColor}
                        strokeWidth={isSelected ? 5 : 3.5}
                        strokeDasharray={seg.trackType === 'quad_fast_slow' ? 'none' : '6,3'}
                        strokeLinecap="round"
                        className="transition-all duration-200 group-hover:stroke-width-6"
                      />

                      {/* Average Delay Badge on Midpoint of Track */}
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x={-24}
                          y={-10}
                          width={48}
                          height={20}
                          rx={10}
                          fill="#0f172a"
                          stroke={delayColor}
                          strokeWidth={1.5}
                          className="shadow-sm"
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={delayColor}
                          fontSize={9}
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          +{seg.averageDelayMinutes}m
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>

              {/* 2. Stations Nodes Layer */}
              <g className="stations-layer">
                {stations.map(st => {
                  const p = projectCoords(st.x, st.y, st.z || 10);
                  const isSelected = selectedStationCode === st.code;

                  return (
                    <g 
                      key={st.id} 
                      className="cursor-pointer group"
                      onClick={() => {
                        setSelectedStationCode(st.code);
                        setSelectedSegmentId(null);
                        setSelectedTrainNumber(null);
                      }}
                    >
                      {/* Outer pulse if major hub or selected */}
                      {(st.isMajorHub || isSelected) && (
                        <circle
                          cx={p.px}
                          cy={p.py}
                          r={isSelected ? 12 : 9}
                          fill="none"
                          stroke={isSelected ? '#60a5fa' : '#38bdf8'}
                          strokeWidth={1.5}
                          strokeOpacity={0.6}
                          className="animate-ping"
                          style={{ animationDuration: '3s' }}
                        />
                      )}

                      {/* Core Station Dot */}
                      <circle
                        cx={p.px}
                        cy={p.py}
                        r={st.isMajorHub ? 6.5 : 4.5}
                        fill={isSelected ? '#3b82f6' : st.isMajorHub ? '#f8fafc' : '#94a3b8'}
                        stroke="#0f172a"
                        strokeWidth={2}
                        className="transition-transform duration-150 group-hover:scale-125"
                      />

                      {/* Station Code Label */}
                      <text
                        x={p.px}
                        y={p.py - 10}
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize={st.isMajorHub ? 11 : 9.5}
                        fontWeight={st.isMajorHub ? 'bold' : 'normal'}
                        className="pointer-events-none select-none drop-shadow-sm font-sans"
                      >
                        {st.name.split(' ')[0]} ({st.code})
                      </text>
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
                      onClick={() => {
                        setSelectedTrainNumber(tm.trainNumber);
                        setSelectedSegmentId(null);
                        setSelectedStationCode(null);
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
                          width={46}
                          height={16}
                          rx={8}
                          fill="#020617"
                          stroke={delayColor}
                          strokeWidth={1}
                        />
                        <text
                          x={23}
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
        <div className="lg:col-span-4 space-y-4">
          
          {/* Track Segment Inspection Card */}
          {activeSegment && !activeStation && !activeTrain && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
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
                  Section Code: <code className="font-mono text-slate-700 dark:text-slate-300 font-bold">{activeSegment.id}</code> • {activeSegment.distanceKm} km • Max {activeSegment.speedLimitKmh} km/h
                </p>
              </div>

              {/* Prominent Average Delay Display */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Average Section Delay (All Trains):
                  </span>
                  <span className={`text-2xl font-black ${
                    activeSegment.averageDelayMinutes >= 15 ? 'text-red-500' :
                    activeSegment.averageDelayMinutes >= 6 ? 'text-amber-500' :
                    'text-emerald-500'
                  }`}>
                    +{activeSegment.averageDelayMinutes} mins
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>Max Observed Delay on Track:</span>
                  <span className="font-bold">+{activeSegment.maxDelayMinutes} mins</span>
                </div>
              </div>

              {/* Operational Disruption Reason */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs">
                <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Operational Disruption Reason:
                </span>
                <p className="text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                  {activeSegment.disruptionReason || 'Punctual transit flow: Automated track circuits operating with standard headway.'}
                </p>
              </div>

              {/* All Trains Running Through This Track */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Trains Traversing This Track ({activeSegment.trainsPassing.length}):
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeSegment.trainsPassing.map(tNum => {
                    const trainInfo = ALL_NETWORK_TRAINS.find(t => t.trainNumber === tNum);
                    const trainDelay = activeSegment.trainDelays[tNum] || 0;
                    return (
                      <div
                        key={tNum}
                        onClick={() => setSelectedTrainNumber(tNum)}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer transition-colors border border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <Train className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {tNum} {trainInfo?.trainName.split(' ')[0]}
                          </span>
                        </div>
                        <span className={`text-xs font-black px-2 py-0.5 rounded ${
                          trainDelay >= 15 ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                          trainDelay >= 6 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          +{trainDelay}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Station Details Card */}
          {activeStation && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  Station Hub Details
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
                    {activeStation.hindiName} • {activeStation.marathiName}
                  </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Station Code: <code className="font-mono font-bold text-slate-700 dark:text-slate-300">{activeStation.code}</code> • Platforms: {activeStation.platforms.join(', ')} • {activeStation.city}
                </p>
              </div>

              {/* Trains Calling At This Station */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Trains Calling or Passing ({activeStation.passingTrainCount || 0} scheduled services):
                </h4>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {ALL_NETWORK_TRAINS.filter(t => t.stops.some(s => s.stationCode === activeStation.code)).map(t => {
                    const stop = t.stops.find(s => s.stationCode === activeStation.code);
                    return (
                      <div 
                        key={t.trainNumber}
                        onClick={() => setSelectedTrainNumber(t.trainNumber)}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer border border-slate-100 dark:border-slate-800 text-xs transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {t.trainNumber} • {t.trainName}
                          </span>
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                            {stop?.scheduledArrival || stop?.scheduledDeparture}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {t.originStation} ➔ {t.destinationStation} (Platform {stop?.platform || 'TBD'})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Train Details Card */}
          {activeTrain && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
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

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Available Classes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeTrain.availableClasses.map(cls => (
                    <span key={cls} className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>

              {/* Halts breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Route Stopping Pattern ({activeTrain.stops.length} halts):
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeTrain.stops.map((st, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs font-medium border border-slate-100 dark:border-slate-800"
                    >
                      <span className="text-slate-700 dark:text-slate-300">
                        {st.stationName} ({st.stationCode})
                      </span>
                      <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
                        {st.scheduledArrival === st.scheduledDeparture ? st.scheduledArrival : `${st.scheduledArrival} - ${st.scheduledDeparture}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Help & Instructions */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs space-y-2">
            <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              How to Navigate the Map:
            </span>
            <ul className="list-disc list-inside text-blue-800 dark:text-blue-300 space-y-1">
              <li>Click any <strong>Track Segment</strong> to inspect all passing trains, average delay, and operational disruption reason.</li>
              <li>Click any <strong>Station</strong> to see all scheduled trains stopping or passing through it.</li>
              <li>Click any moving <strong>Train Dot</strong> to see its live position, delay, and halting timetable.</li>
              <li>Use the <strong>2D / 3D Isometric Switcher</strong> to view layered track elevations and bridge flyovers.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
