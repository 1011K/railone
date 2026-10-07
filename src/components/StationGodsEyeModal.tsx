/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  STATION_3D_LAYOUTS, 
  PlatformLayout, 
  FootOverBridge, 
  StationAmenity,
  calculateStationTransferRoute 
} from '../fixtures/stationLayoutsData';
import { 
  X, 
  Layers, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation, 
  ShieldCheck, 
  RotateCcw, 
  Footprints, 
  Building2, 
  Train, 
  Zap, 
  Info,
  Clock,
  Accessibility,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Move
} from 'lucide-react';
import { useTheme } from './ThemeContext';

interface StationGodsEyeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStationCode?: string;
  initialFromPlatformId?: string;
  initialToPlatformId?: string;
}

export const StationGodsEyeModal: React.FC<StationGodsEyeModalProps> = ({
  isOpen,
  onClose,
  initialStationCode = 'DR',
  initialFromPlatformId,
  initialToPlatformId
}) => {
  const { language } = useTheme();

  // Selected station
  const [stationCode, setStationCode] = useState(
    STATION_3D_LAYOUTS[initialStationCode] ? initialStationCode : 'DR'
  );
  const layout = STATION_3D_LAYOUTS[stationCode] || STATION_3D_LAYOUTS['DR'];

  // View modes: 'gods_eye_3d' | 'top_down_plan' | 'pathfinder'
  const [viewMode, setViewMode] = useState<'gods_eye_3d' | 'top_down_plan' | 'pathfinder'>('gods_eye_3d');
  
  // Selected level: 'all' | 0 | 1 | 2
  const [selectedLevel, setSelectedLevel] = useState<'all' | number>('all');

  // Selected platform for inspection
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(
    layout.platforms[0]?.id || null
  );

  // Selected bridge for inspection
  const [selectedBridgeId, setSelectedBridgeId] = useState<string | null>(null);

  // Transfer pathfinder states
  const [fromPlatformId, setFromPlatformId] = useState<string>(
    initialFromPlatformId || layout.platforms[0]?.id || ''
  );
  const [toPlatformId, setToPlatformId] = useState<string>(
    initialToPlatformId || layout.platforms[Math.min(3, layout.platforms.length - 1)]?.id || ''
  );
  const [requireStepFree, setRequireStepFree] = useState(false);

  // Amenity filters
  const [filterAmenity, setFilterAmenity] = useState<string>('all');

  // 3D tilt controls
  const [pitch, setPitch] = useState(42);
  const [rotation, setRotation] = useState(-18);

  // Canvas zoom & pan controls for responsive desktop/tablet/mobile interaction
  const [zoom, setZoom] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 0.6 : 1));
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Synchronize when initialStationCode prop changes or modal opens
  useEffect(() => {
    const validCode = STATION_3D_LAYOUTS[initialStationCode] ? initialStationCode : 'DR';
    setStationCode(validCode);
    const targetLayout = STATION_3D_LAYOUTS[validCode];
    if (targetLayout) {
      setSelectedPlatformId(initialFromPlatformId || targetLayout.platforms[0]?.id || null);
      setFromPlatformId(initialFromPlatformId || targetLayout.platforms[0]?.id || '');
      setToPlatformId(
        initialToPlatformId || 
        targetLayout.platforms[Math.min(3, targetLayout.platforms.length - 1)]?.id || 
        targetLayout.platforms[0]?.id || 
        ''
      );
    }
    // Auto-adjust scale for small viewports
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setZoom(0.6);
      setPan({ x: 0, y: 0 });
    }
  }, [initialStationCode, initialFromPlatformId, initialToPlatformId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Synchronize when stationCode changes via selector
  const handleStationChange = (code: string) => {
    setStationCode(code);
    const newLayout = STATION_3D_LAYOUTS[code];
    if (newLayout) {
      setSelectedPlatformId(newLayout.platforms[0]?.id || null);
      setFromPlatformId(newLayout.platforms[0]?.id || '');
      setToPlatformId(newLayout.platforms[Math.min(3, newLayout.platforms.length - 1)]?.id || '');
    }
  };

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, select, input, [role="button"]')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleZoomIn = () => setZoom(z => Math.min(1.8, Number((z + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom(z => Math.max(0.4, Number((z - 0.15).toFixed(2))));
  const handleResetCanvas = () => {
    setZoom(typeof window !== 'undefined' && window.innerWidth < 640 ? 0.6 : 1);
    setPan({ x: 0, y: 0 });
    setPitch(42);
    setRotation(-18);
  };

  // Calculate transfer route
  const transferRoute = useMemo(() => {
    return calculateStationTransferRoute(stationCode, fromPlatformId, toPlatformId, requireStepFree);
  }, [stationCode, fromPlatformId, toPlatformId, requireStepFree]);

  const activePlatform = useMemo(() => {
    return layout.platforms.find(p => p.id === selectedPlatformId);
  }, [layout, selectedPlatformId]);

  const activeBridge = useMemo(() => {
    return layout.bridges.find(b => b.id === selectedBridgeId);
  }, [layout, selectedBridgeId]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-label="3D Station Navigation and God's Eye Viewer"
      >
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-theme-primary flex items-center justify-center text-white shadow-md">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-white">
                  God's Eye Station 3D Navigation
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-theme-light text-theme-primary border border-theme-primary/30">
                  {layout.zone} Division
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {layout.stationName} ({layout.hindiName}) · Multi-Level FOB & Track Model
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Station selector */}
            <select
              value={stationCode}
              onChange={(e) => handleStationChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-primary"
              aria-label="Select interchange station"
            >
              {Object.values(STATION_3D_LAYOUTS).map(stn => (
                <option key={stn.stationCode} value={stn.stationCode}>
                  {stn.stationName} ({stn.stationCode})
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close station navigation modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice for unindexed station fallback */}
        {initialStationCode && !STATION_3D_LAYOUTS[initialStationCode] && (
          <div className="px-5 py-2 bg-amber-950/70 border-b border-amber-600/40 text-[11px] text-amber-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              3D model for station <strong>{initialStationCode}</strong> is currently under topological survey. Displaying nearest indexed interchange hub (<strong>{layout.stationName}</strong>).
            </span>
          </div>
        )}

        {/* Sub-header Controls */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Mode Toggles */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setViewMode('gods_eye_3d')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-colors ${
                viewMode === 'gods_eye_3d' 
                  ? 'bg-theme-primary text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>God's Eye 3D</span>
            </button>

            <button
              onClick={() => setViewMode('top_down_plan')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-colors ${
                viewMode === 'top_down_plan' 
                  ? 'bg-theme-primary text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Ortho Plan</span>
            </button>

            <button
              onClick={() => setViewMode('pathfinder')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-colors ${
                viewMode === 'pathfinder' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>FOB Pathfinder</span>
            </button>
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold text-[11px]">Level:</span>
            <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
              <button
                onClick={() => setSelectedLevel('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  selectedLevel === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedLevel(0)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  selectedLevel === 0 ? 'bg-theme-primary text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Platforms (L0)
              </button>
              <button
                onClick={() => setSelectedLevel(1)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  selectedLevel === 1 ? 'bg-theme-primary text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Footbridges (L1)
              </button>
              {layout.levelsCount > 2 && (
                <button
                  onClick={() => setSelectedLevel(2)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    selectedLevel === 2 ? 'bg-theme-primary text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Elevated Concourse (L2)
                </button>
              )}
            </div>
          </div>

          {/* 3D sliders (only if 3D mode) */}
          {viewMode === 'gods_eye_3d' && (
            <div className="hidden md:flex items-center gap-3 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60 text-[11px]">
              <span className="text-theme-primary font-bold">Pitch:</span>
              <input
                type="range"
                min="20"
                max="65"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-16 accent-theme-primary cursor-pointer"
              />
              <span className="text-theme-primary font-bold ml-1">Rot:</span>
              <input
                type="range"
                min="-45"
                max="45"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-16 accent-theme-primary cursor-pointer"
              />
            </div>
          )}

        </div>

        {/* Main Body Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
          
          {/* Interactive Visual Canvas (8 cols on lg) */}
          <div 
            className="lg:col-span-8 bg-slate-950 p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[380px] sm:min-h-[460px] cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Floating Zoom & Canvas Controls */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs shadow-lg backdrop-blur">
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
                onClick={handleResetCanvas}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Reset View"
                aria-label="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono text-slate-400 px-1 font-bold">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Visual Station Canvas */}
            <div 
              className="w-full h-full flex items-center justify-center transition-transform duration-300 select-none"
              style={{
                perspective: '1200px',
                transformStyle: 'preserve-3d'
              }}
            >
              <div 
                className="relative transition-transform duration-100 ease-out"
                style={{
                  width: '760px',
                  height: '420px',
                  transform: `translate(${pan.x}px, ${pan.y}px) ${
                    viewMode === 'gods_eye_3d' 
                      ? `rotateX(${pitch}deg) rotateZ(${rotation}deg) scale(${zoom * 0.9})` 
                      : `rotateX(0deg) rotateZ(0deg) scale(${zoom * 0.95})`
                  }`
                }}
              >
                {/* Station Ground Deck / Track Bed */}
                <div 
                  className="absolute inset-0 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl"
                  style={{ transform: 'translateZ(-10px)' }}
                >
                  {/* Ballast / Track Lines in background */}
                  <div className="absolute inset-x-4 inset-y-6 flex justify-between opacity-20 pointer-events-none">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div key={i} className="w-1 h-full border-r border-dashed border-slate-500" />
                    ))}
                  </div>
                </div>

                {/* Platforms (Level 0) */}
                {(selectedLevel === 'all' || selectedLevel === 0) && layout.platforms.map((plat) => {
                  const isSelected = selectedPlatformId === plat.id;
                  const isFrom = fromPlatformId === plat.id && viewMode === 'pathfinder';
                  const isTo = toPlatformId === plat.id && viewMode === 'pathfinder';

                  return (
                    <div
                      key={plat.id}
                      onClick={() => {
                        setSelectedPlatformId(plat.id);
                        if (viewMode === 'pathfinder') {
                          if (!fromPlatformId) setFromPlatformId(plat.id);
                          else if (fromPlatformId === plat.id) setFromPlatformId('');
                          else setToPlatformId(plat.id);
                        }
                      }}
                      className={`absolute rounded-lg cursor-pointer transition-all duration-200 flex flex-col justify-between p-1.5 ${
                        isFrom 
                          ? 'ring-4 ring-emerald-400 bg-emerald-950/80 border-2 border-emerald-400 z-20' 
                          : isTo 
                          ? 'ring-4 ring-amber-400 bg-amber-950/80 border-2 border-amber-400 z-20'
                          : isSelected 
                          ? 'ring-2 ring-blue-400 bg-slate-800 border border-blue-400 z-10 shadow-lg' 
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80'
                      }`}
                      style={{
                        left: `${plat.x}px`,
                        top: `${plat.y}px`,
                        width: `${plat.width + 12}px`,
                        height: `${plat.height}px`,
                        transform: 'translateZ(0px)',
                        boxShadow: isSelected ? '0 10px 25px -5px rgba(59, 130, 246, 0.4)' : '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                      }}
                      title={`Platform ${plat.number} (${plat.line.toUpperCase()})`}
                    >
                      {/* Platform header tag */}
                      <div className="flex flex-col items-center">
                        <span className={`text-[9px] font-black tracking-tight px-1 py-0.5 rounded ${
                          plat.line === 'western' 
                            ? 'bg-rose-500/20 text-rose-300' 
                            : plat.line === 'central' 
                            ? 'bg-blue-500/20 text-blue-300' 
                            : plat.line === 'harbour'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          PF {plat.number}
                        </span>
                      </div>

                      {/* Approaching train representation if present */}
                      {plat.currentTrain && (
                        <div className="my-auto bg-slate-900/90 border border-slate-600 rounded p-1 text-[8px] text-center shadow-xs animate-pulse">
                          <Train className="w-3 h-3 mx-auto text-amber-400 mb-0.5" />
                          <span className="font-bold text-amber-300 block truncate">
                            {plat.currentTrain.rakeType}
                          </span>
                          <span className="text-slate-400 block text-[7px]">
                            {plat.currentTrain.etaMinutes === 0 ? 'BERTHED' : `${plat.currentTrain.etaMinutes}m`}
                          </span>
                        </div>
                      )}

                      {/* Crowd indicator dot */}
                      <div className="flex items-center justify-center">
                        <span className={`w-2 h-2 rounded-full ${
                          plat.crowdLevel === 'CRUSH_LOAD' 
                            ? 'bg-red-500 shadow-sm shadow-red-500/50 animate-ping' 
                            : plat.crowdLevel === 'HEAVY' 
                            ? 'bg-amber-500' 
                            : plat.crowdLevel === 'MODERATE' 
                            ? 'bg-yellow-500' 
                            : 'bg-emerald-500'
                        }`} />
                      </div>
                    </div>
                  );
                })}

                {/* Foot-Over-Bridges & Skywalks (Level 1 & Level 2) */}
                {layout.bridges
                  .filter(bridge => selectedLevel === 'all' || bridge.level === selectedLevel)
                  .map((bridge) => {
                    const isRecommendedPath = viewMode === 'pathfinder' && transferRoute.recommendedBridge?.id === bridge.id;
                    const isInspected = selectedBridgeId === bridge.id;

                    return (
                      <div
                        key={bridge.id}
                        onClick={() => setSelectedBridgeId(isInspected ? null : bridge.id)}
                        className={`absolute rounded-xl border-2 transition-all duration-300 flex items-center justify-between px-2 cursor-pointer ${
                          isRecommendedPath 
                            ? 'bg-amber-500/40 border-amber-400 ring-4 ring-amber-400/50 shadow-2xl z-30' 
                            : isInspected
                            ? 'bg-blue-600/50 border-blue-400 ring-2 ring-blue-400 shadow-2xl z-25'
                            : 'bg-slate-800/90 border-blue-500/50 hover:border-blue-400 z-20 shadow-xl'
                        }`}
                        style={{
                          left: `${bridge.x1}px`,
                          top: `${bridge.y1}px`,
                          width: `${bridge.x2 - bridge.x1 + 30}px`,
                          height: '26px',
                          transform: `translateZ(${bridge.level === 2 ? 65 : 35}px)`,
                          backdropFilter: 'blur(4px)'
                        }}
                        title={`${bridge.name} (${bridge.typicalWalkMinutes}m walk - Level ${bridge.level})`}
                      >
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <Footprints className={`w-3.5 h-3.5 shrink-0 ${isRecommendedPath ? 'text-amber-300 animate-bounce' : 'text-blue-300'}`} />
                          <span className="text-[10px] font-black truncate text-white drop-shadow">
                            {bridge.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 text-[9px] font-bold text-slate-300">
                          {bridge.hasLifts && <span title="Lifts available" className="text-emerald-400">♿</span>}
                          {bridge.hasEscalators && <span title="Escalator available" className="text-blue-300">⚡</span>}
                          <span className="bg-slate-900/80 px-1 rounded text-slate-300">
                            {bridge.typicalWalkMinutes}m
                          </span>
                        </div>
                      </div>
                    );
                  })}

                {/* Station Amenities Pins */}
                {layout.amenities.map((amenity) => {
                  if (filterAmenity !== 'all' && amenity.type !== filterAmenity) return null;
                  if (selectedLevel !== 'all' && amenity.level !== selectedLevel) return null;

                  return (
                    <div
                      key={amenity.id}
                      className="absolute z-30 group"
                      style={{
                        left: `${amenity.x}px`,
                        top: `${amenity.y}px`,
                        transform: `translateZ(${amenity.level === 0 ? 5 : amenity.level === 1 ? 40 : 65}px)`
                      }}
                      title={`${amenity.name} (${amenity.type})`}
                    >
                      <div className="w-5 h-5 rounded-full bg-theme-primary border border-white/80 shadow-md flex items-center justify-center text-white text-[10px] cursor-pointer hover:scale-125 transition-transform">
                        {amenity.type === 'lift' ? '♿' : 
                         amenity.type === 'wheelchair_ramp' ? '♿' :
                         amenity.type === 'escalator' ? '⚡' : 
                         amenity.type === 'rpf_post' ? '🛡️' : 
                         amenity.type === 'medical_help' ? '➕' : 
                         amenity.type === 'metro_interchange' ? '🚇' : 
                         amenity.type === 'water_atm' ? '💧' :
                         amenity.type === 'cloak_room' ? '🧳' :
                         amenity.type === 'exit_gate' ? '🚪' : '🎫'}
                      </div>
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-slate-100 text-[10px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap border border-slate-700 pointer-events-none z-50">
                        {amenity.name}
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Bottom Floating Legend */}
            <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div className="flex items-center gap-3 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 backdrop-blur pointer-events-auto">
                <span className="flex items-center gap-1 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Western
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Central
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Harbour
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> National Express
                </span>
              </div>

              <div className="bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 backdrop-blur pointer-events-auto flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-theme-primary" />
                <span>3D Precision Topological Model</span>
              </div>
            </div>

          </div>

          {/* Right Information & Pathfinder Panel (4 cols on lg) */}
          <div className="lg:col-span-4 bg-slate-900/80 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto space-y-5">
            
            {/* View Mode Specific Controller */}
            {viewMode === 'pathfinder' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">
                    Foot-Over-Bridge Transfer Pathfinder
                  </h3>
                </div>

                <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      From Platform:
                    </label>
                    <select
                      value={fromPlatformId}
                      onChange={(e) => setFromPlatformId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {layout.platforms.map(p => (
                        <option key={p.id} value={p.id}>
                          Platform {p.number} ({p.line.toUpperCase()} - {p.serviceType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      To Connecting Platform:
                    </label>
                    <select
                      value={toPlatformId}
                      onChange={(e) => setToPlatformId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {layout.platforms.map(p => (
                        <option key={p.id} value={p.id}>
                          Platform {p.number} ({p.line.toUpperCase()} - {p.serviceType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                      <input
                        type="checkbox"
                        checked={requireStepFree}
                        onChange={(e) => setRequireStepFree(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Step-Free Access (Lifts / Ramps)</span>
                    </label>
                  </div>
                </div>

                {/* Transfer Guidance Output */}
                {transferRoute.success ? (
                  <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs">
                        <Clock className="w-4 h-4" />
                        <span>Estimated Transfer: {transferRoute.walkMinutes} Minutes</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">
                        {transferRoute.distanceMeters}m walk
                      </span>
                    </div>

                    {transferRoute.recommendedBridge && (
                      <p className="text-xs text-slate-300 font-medium">
                        Recommended Bridge: <span className="font-bold text-amber-300">{transferRoute.recommendedBridge.name}</span>
                      </p>
                    )}

                    <div className="space-y-1.5 pt-1 border-t border-amber-500/20">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Step-by-Step Navigation:
                      </span>
                      {transferRoute.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 space-y-2 text-center">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto" />
                    <p className="text-xs text-amber-200 font-bold">
                      {transferRoute.steps[0] || 'Direct Foot-Over-Bridge connection not available between these platforms.'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Select connecting platforms on the station map or use the dropdowns above.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Platform & Station Inspector */
              <div className="space-y-4">
                {/* Bridge Inspector (if bridge is clicked) */}
                {activeBridge && (
                  <div className="bg-slate-900/90 border border-theme-primary/40 rounded-2xl p-3.5 space-y-2 text-xs animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white flex items-center gap-1.5">
                        <Footprints className="w-3.5 h-3.5 text-theme-primary" />
                        <span>{activeBridge.name}</span>
                      </h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-theme-light text-theme-primary border border-theme-primary/30">
                        Level {activeBridge.level}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div>Length: <strong className="text-white">{activeBridge.lengthMeters}m</strong></div>
                      <div>Avg Walk: <strong className="text-white">{activeBridge.typicalWalkMinutes} min</strong></div>
                      <div>Lifts: <strong className={activeBridge.hasLifts ? 'text-emerald-400' : 'text-slate-400'}>{activeBridge.hasLifts ? 'Yes (♿)' : 'No'}</strong></div>
                      <div>Escalator: <strong className={activeBridge.hasEscalators ? 'text-theme-primary' : 'text-slate-400'}>{activeBridge.hasEscalators ? 'Yes' : 'No'}</strong></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-theme-primary" />
                    <span>Station Platform Details</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {layout.platforms.length} Platforms
                  </span>
                </div>

                {activePlatform ? (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-base text-white">
                        Platform {activePlatform.number}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        activePlatform.line === 'western' 
                          ? 'bg-rose-500/20 text-rose-300' 
                          : activePlatform.line === 'central' 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {activePlatform.line} line
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Service Pattern</span>
                        <span className="font-bold text-slate-200 capitalize">{activePlatform.serviceType}</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Rake Capacity</span>
                        <span className="font-bold text-slate-200">{activePlatform.carCapacity} Coaches</span>
                      </div>
                    </div>

                    {/* Approaching train on platform */}
                    {activePlatform.currentTrain ? (
                      <div className="bg-slate-900/90 border border-theme-primary/30 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-theme-primary uppercase tracking-wide">
                            Next Expected Arrival
                          </span>
                          <span className="text-[10px] font-bold text-amber-400">
                            {activePlatform.currentTrain.etaMinutes === 0 ? 'BERTHED AT PF' : `ETA ${activePlatform.currentTrain.etaMinutes} min`}
                          </span>
                        </div>
                        <p className="font-bold text-xs text-white">
                          {activePlatform.currentTrain.trainName} (#{activePlatform.currentTrain.trainNumber})
                        </p>
                        <p className="text-[11px] text-slate-300">
                          Destination: <span className="font-bold text-theme-primary">{activePlatform.currentTrain.destination}</span> · {activePlatform.currentTrain.carCount}-Car {activePlatform.currentTrain.rakeType}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 text-center">
                        No service currently berthed at Platform {activePlatform.number}
                      </div>
                    )}

                    {/* Platform crowding */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                      <span className="text-slate-400">Platform Crowd:</span>
                      <span className={`font-bold ${
                        activePlatform.crowdLevel === 'CRUSH_LOAD' ? 'text-red-400' :
                        activePlatform.crowdLevel === 'HEAVY' ? 'text-amber-400' :
                        activePlatform.crowdLevel === 'MODERATE' ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>
                        {activePlatform.crowdLevel.replace('_', ' ')}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setViewMode('pathfinder');
                        setFromPlatformId(activePlatform.id);
                      }}
                      className="w-full mt-2 py-2 rounded-xl bg-theme-primary hover-bg-theme-primary text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Footprints className="w-3.5 h-3.5" />
                      <span>Plan FOB Transfer from PF {activePlatform.number}</span>
                    </button>
                  </div>
                ) : null}

                {/* Amenities Filter */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Filter Amenities
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      { id: 'all', label: 'All Amenities' },
                      { id: 'lift', label: '♿ Lifts & Ramps' },
                      { id: 'escalator', label: '⚡ Escalators' },
                      { id: 'atvm_ticket', label: '🎫 ATVM Kiosks' },
                      { id: 'rpf_post', label: '🛡️ RPF Police' },
                      { id: 'metro_interchange', label: '🚇 Metro Link' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setFilterAmenity(f.id)}
                        className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-bold transition-colors ${
                          filterAmenity === f.id 
                            ? 'bg-theme-light text-theme-primary border border-theme-primary/50' 
                            : 'bg-slate-800/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Bottom Safety Reminder */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-theme-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block">Railway Safety Guideline:</span>
                Never cross railway tracks on foot. Always use designated Foot-Over-Bridges (FOB) or subways.
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default StationGodsEyeModal;
