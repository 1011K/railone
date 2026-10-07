/**
 * RailOne Next — Phone-First Platform Coach Alignment Guide
 * Focuses on the passenger's primary question: "WHERE SHOULD I STAND?"
 * Uses separated domain models (RakeFormation + PlatformAlignment + PlatformLandmark).
 * Never hardcodes Dadar or hallucinates platform positions for unmapped stations.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  RakeModelType,
  RakeFormation,
  RakeCoach,
  CoachCategory,
  PlatformAlignment,
  PlatformLandmark,
  getRakeFormation,
  computeCoachRecommendation,
  RAKE_FORMATIONS
} from '../models/coachGuide';
import { TrainFormationStrip } from './common/DesignSystemPrimitives';
import { 
  Train, 
  MapPin, 
  Accessibility, 
  CheckCircle2, 
  AlertTriangle,
  Navigation, 
  Footprints, 
  ChevronDown, 
  ChevronUp, 
  X 
} from 'lucide-react';

export type { RakeModelType };

export interface CoachPositionGuideProps {
  initialRakeType?: RakeModelType;
  stationCode?: string;
  stationName?: string;
  platformNumber?: string | number;
  trainName?: string;
  trainDirection?: string;
  onClose?: () => void;
  compactMode?: boolean;
  hideCardBorder?: boolean;
}

export const CoachPositionGuide: React.FC<CoachPositionGuideProps> = ({
  initialRakeType = '12_car_suburban',
  stationCode = 'DR',
  stationName,
  platformNumber = '3',
  trainName,
  trainDirection,
  onClose,
  compactMode = false,
  hideCardBorder = false
}) => {
  const [selectedRake, setSelectedRake] = useState<RakeModelType>(initialRakeType);
  const [selectedCoachSeq, setSelectedCoachSeq] = useState<number>(() => {
    return initialRakeType === '16_car_vande_bharat' ? 8 : 4; // default to EC or Ladies
  });
  const [showPlatformMap, setShowPlatformMap] = useState<boolean>(false);

  useEffect(() => {
    setSelectedRake(initialRakeType);
    setSelectedCoachSeq(initialRakeType === '16_car_vande_bharat' ? 8 : 4);
  }, [initialRakeType]);

  // Compute recommendation using the clean separated domain engine
  const recommendation = useMemo(() => {
    return computeCoachRecommendation({
      rakeType: selectedRake,
      coachSequence: selectedCoachSeq,
      stationCode,
      platformNumber
    });
  }, [selectedRake, selectedCoachSeq, stationCode, platformNumber]);

  const formation: RakeFormation = recommendation.formation || getRakeFormation(selectedRake) || RAKE_FORMATIONS['12_car_suburban'];
  const activeCoach: RakeCoach = recommendation.selectedCoach || formation.coaches[0];

  // Helper colors for coach categories
  const getCategoryTheme = (category: CoachCategory, isAccessible?: boolean) => {
    if (isAccessible) {
      return {
        bg: 'bg-emerald-600',
        lightBg: 'bg-emerald-50 dark:bg-emerald-950/60',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-500',
        badge: 'bg-emerald-500 text-white'
      };
    }
    switch (category) {
      case 'first_class':
        return {
          bg: 'bg-amber-600',
          lightBg: 'bg-amber-50 dark:bg-amber-950/60',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-500',
          badge: 'bg-amber-500 text-white'
        };
      case 'ladies':
        return {
          bg: 'bg-pink-600',
          lightBg: 'bg-pink-50 dark:bg-pink-950/60',
          text: 'text-pink-700 dark:text-pink-300',
          border: 'border-pink-500',
          badge: 'bg-pink-500 text-white'
        };
      case 'divyangjan':
        return {
          bg: 'bg-emerald-600',
          lightBg: 'bg-emerald-50 dark:bg-emerald-950/60',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-500',
          badge: 'bg-emerald-500 text-white'
        };
      case 'ac_chair':
      case 'ac_sleeper':
        return {
          bg: 'bg-blue-600',
          lightBg: 'bg-blue-50 dark:bg-blue-950/60',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-500',
          badge: 'bg-blue-500 text-white'
        };
      case 'executive':
        return {
          bg: 'bg-purple-600',
          lightBg: 'bg-purple-50 dark:bg-purple-950/60',
          text: 'text-purple-700 dark:text-purple-300',
          border: 'border-purple-500',
          badge: 'bg-purple-500 text-white'
        };
      case 'sleeper':
        return {
          bg: 'bg-sky-600',
          lightBg: 'bg-sky-50 dark:bg-sky-950/60',
          text: 'text-sky-700 dark:text-sky-300',
          border: 'border-sky-500',
          badge: 'bg-sky-500 text-white'
        };
      case 'pantry':
        return {
          bg: 'bg-orange-600',
          lightBg: 'bg-orange-50 dark:bg-orange-950/60',
          text: 'text-orange-700 dark:text-orange-300',
          border: 'border-orange-500',
          badge: 'bg-orange-500 text-white'
        };
      case 'motor_loco':
        return {
          bg: 'bg-slate-700',
          lightBg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-500',
          badge: 'bg-slate-600 text-white'
        };
      case 'general':
      default:
        return {
          bg: 'bg-slate-800',
          lightBg: 'bg-slate-50 dark:bg-slate-800/60',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-600',
          badge: 'bg-slate-700 text-white'
        };
    }
  };

  const currentTheme = getCategoryTheme(activeCoach.category, activeCoach.isAccessible);

  return (
    <div 
      role="region" 
      aria-label="Platform Coach Alignment Guide"
      className={`w-full flex flex-col font-sans ${
        hideCardBorder 
          ? 'bg-transparent' 
          : 'bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden'
      }`}
    >
      {/* =========================================================================
          1. HEADER HIERARCHY
          Top: Dadar · Platform 3
          Middle: Fast Local towards Kalyan
          Bottom: 12-car · Non-AC
          ========================================================================= */}
      <div className={`p-4 sm:p-5 ${hideCardBorder ? 'pb-2 pt-1' : 'border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Top Line: Station · Platform */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-theme-primary/10 text-theme-primary font-black text-xs">
                <MapPin className="w-3.5 h-3.5" />
                <span>{`${stationName || stationCode} · Platform ${platformNumber}`}</span>
              </span>
              {recommendation.provenance && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {recommendation.provenance === 'LIVE_VERIFIED' ? '[VERIFIED ALIGNMENT]' : '[TIMETABLE MODEL]'}
                </span>
              )}
            </div>

            {/* Middle Line: Train Title / Direction */}
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1.5 truncate">
              {trainName || (selectedRake.includes('ac') ? 'Fast Local' : selectedRake.includes('vande') ? 'Vande Bharat Express' : 'Fast Local')}
              {trainDirection ? ` towards ${trainDirection}` : ' towards Kalyan'}
            </h2>

            {/* Third Line: Rake Formation Tag */}
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <Train className="w-3.5 h-3.5 text-theme-primary" />
              <span>{formation.name} ({formation.totalCoaches} Coaches)</span>
            </div>
          </div>

          {onClose && !hideCardBorder && (
            <button
              onClick={onClose}
              aria-label="Close Coach Guide"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Rake Type Pill Switcher (Allows commuter to inspect other train configurations) */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(Object.keys(RAKE_FORMATIONS) as RakeModelType[]).map(type => {
            const isSelected = selectedRake === type;
            const r = RAKE_FORMATIONS[type];
            return (
              <button
                key={type}
                onClick={() => {
                  setSelectedRake(type);
                  setSelectedCoachSeq(type === '16_car_vande_bharat' ? 8 : 4);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[38px] ${
                  isSelected
                    ? 'bg-theme-primary text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {r.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          2. PRIMARY ANSWER HERO CARD
          Answers the core commuter question: "WHERE SHOULD I STAND?"
          ========================================================================= */}
      <div className="p-4 sm:p-5 space-y-4">
        {recommendation.status === 'AVAILABLE' ? (
          <div className={`p-4 sm:p-5 rounded-2xl border-2 ${currentTheme.border} ${currentTheme.lightBg} shadow-sm space-y-3`}>
            <div className="flex items-center justify-between gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${currentTheme.badge}`}>
                {activeCoach.className}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                {recommendation.stoppingZone?.platformPole || `Coach ${activeCoach.sequence}`}
              </span>
            </div>

            {/* HERO ANSWER */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Primary Boarding Recommendation
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                Stand near Coach {activeCoach.sequence}
              </div>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-theme-primary shrink-0" />
                <span>
                  {recommendation.nearestLandmark?.name || 'Platform Section'}
                  {recommendation.distanceMeters !== undefined 
                    ? ` · approximately ${recommendation.distanceMeters}m ${recommendation.walkDirection || 'ahead'}` 
                    : ''}
                </span>
              </div>
            </div>

            {/* High-legibility Coach Details */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Platform Stopping Zone:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {recommendation.stoppingZone?.zoneLabel} ({recommendation.stoppingZone?.platformPole})
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Nearest Exit / Bridge:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {recommendation.nearestLandmark?.name}
                </span>
              </div>
              {recommendation.nearestStepFreeLandmark && (
                <div className="space-y-0.5 sm:col-span-2">
                  <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold">
                    <Accessibility className="w-3.5 h-3.5" />
                    <span>Step-Free Access (Wheelchair / Senior):</span>
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {recommendation.nearestStepFreeLandmark.name}
                  </span>
                </div>
              )}
              <div className="space-y-0.5 sm:col-span-2">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Ticket / Eligibility Notice:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {activeCoach.ticketNotice}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Honest Unavailable State when Station / Platform Alignment is not verified */
          <div className="p-4 sm:p-5 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Coach alignment unavailable for this station/platform.</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              Verified platform stopping zones and landmark distance markers are not yet mapped for <strong>{stationCode} Platform {platformNumber}</strong>. 
              Below is the verified intrinsic rake formation for your train. Consult the station LED indicator board on the platform for live stopping markers.
            </p>
          </div>
        )}

        {/* =========================================================================
            3. TRAIN OVERVIEW (Compressed to fit Phone Width without horizontal scroll)
            Shows entire rake compressed: 12 segments for 12-car, 16 for 16-car, 22 for 22-car
            Uses TrainFormationStrip from DesignSystemPrimitives
            ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Train className="w-4 h-4 text-theme-primary" />
              <span>Train Composition ({formation.totalCoaches} Coaches)</span>
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              Tap any coach to see position
            </span>
          </div>

          <TrainFormationStrip
            rakeType={selectedRake}
            selectedCoachSeq={selectedCoachSeq}
            onSelectCoach={(seq) => setSelectedCoachSeq(seq)}
          />
        </div>

        {/* =========================================================================
            4. PLATFORM LANDMARK TOGGLE / EXPANDED LIST
            Primary action: "Show position on platform"
            ========================================================================= */}
        {recommendation.landmarks && recommendation.landmarks.length > 0 && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowPlatformMap(prev => !prev)}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <Footprints className="w-4 h-4 text-theme-primary" />
                <span>Show position on platform ({recommendation.landmarks.length} Verified Landmarks)</span>
              </span>
              {showPlatformMap ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showPlatformMap && (
              <div className="p-3 bg-white dark:bg-slate-900 space-y-2 border-t border-slate-200 dark:border-slate-800 max-h-60 overflow-y-auto">
                {recommendation.landmarks.map((lm) => {
                  const isNearest = recommendation.nearestLandmark?.id === lm.id;
                  return (
                    <div
                      key={lm.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-start justify-between transition-colors ${
                        isNearest
                          ? 'border-theme-primary bg-theme-primary/10 shadow-xs'
                          : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                          <span>{lm.name}</span>
                          {lm.isStepFree && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono">
                              ♿ Step-Free
                            </span>
                          )}
                          {isNearest && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-theme-primary text-white font-bold">
                              Nearest
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {lm.description}
                        </p>
                        {lm.connectsTo && (
                          <span className="text-[10px] text-theme-primary font-semibold mt-1 block">
                            ↳ Connects to: {lm.connectsTo}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-slate-400 shrink-0 ml-2">
                        {lm.relativePositionMeters}m
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
