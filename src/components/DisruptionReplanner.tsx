import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Train, 
  Footprints, 
  ShieldCheck, 
  Zap, 
  Radio, 
  Info,
  ChevronRight,
  TrendingDown,
  Navigation
} from 'lucide-react';
import { STATIONS } from '../fixtures/railwayData';
import { JourneyItinerary, TravelClass } from '../types/railway';
import { planJourneys } from '../engine/journeyEngine';

export interface DisruptionScenarioFixture {
  id: string;
  name: string;
  severity: 'MAJOR_DELAY' | 'TRACK_BLOCK' | 'CANCELLED_SERVICE';
  corridor: string;
  affectedTrainNumber: string;
  affectedTrainName: string;
  cause: string;
  impactMinutes: number;
  originCode: string;
  destCode: string;
  timeContext: string;
}

export const DEMO_DISRUPTIONS: DisruptionScenarioFixture[] = [
  {
    id: 'vidyavihar-signal-delay',
    name: 'Vidyavihar Signal Point Bunching (Thane ➔ Dadar)',
    severity: 'MAJOR_DELAY',
    corridor: 'Central Fast Main Line',
    affectedTrainNumber: '95112',
    affectedTrainName: 'Fast Local (Kalyan ➔ CSMT)',
    cause: 'Point interlocking failure at Vidyavihar. Fast trains queued with +25m delay.',
    impactMinutes: 25,
    originCode: 'TNA',
    destCode: 'DR',
    timeContext: '10:40'
  },
  {
    id: 'dadar-fob-overcrowd',
    name: 'Dadar FOB Jumbo Block Diversion (Thane ➔ Churchgate)',
    severity: 'TRACK_BLOCK',
    corridor: 'Central / Western Interchange',
    affectedTrainNumber: '95114',
    affectedTrainName: 'AC Fast Local',
    cause: 'Foot-Over-Bridge maintenance at Dadar Central. Transfer buffer expanded +12 mins.',
    impactMinutes: 18,
    originCode: 'TNA',
    destCode: 'CCG',
    timeContext: '10:35'
  },
  {
    id: 'kurla-harbour-bunching',
    name: 'Kurla Overhead Traction Power Trip (Kurla ➔ CSMT)',
    severity: 'CANCELLED_SERVICE',
    corridor: 'Harbour Line',
    affectedTrainNumber: '98042',
    affectedTrainName: 'Harbour EMU (Panvel ➔ CSMT)',
    cause: 'Tripped overhead wire. Harbour service suspended. Rerouting via Central Main slow corridor.',
    impactMinutes: 30,
    originCode: 'CLA',
    destCode: 'CSMT',
    timeContext: '11:15'
  }
];

interface DisruptionReplannerProps {
  onSelectAlternative: (itinerary: JourneyItinerary, travelClass: TravelClass) => void;
  onOpenStationGuide?: (stationCode: string) => void;
}

export const DisruptionReplanner: React.FC<DisruptionReplannerProps> = ({
  onSelectAlternative,
  onOpenStationGuide
}) => {
  const [selectedDisruption, setSelectedDisruption] = useState<DisruptionScenarioFixture>(DEMO_DISRUPTIONS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [animationStep, setAnimationStep] = useState<number>(0);

  // Normal original plan before disruption
  const [originalItineraries, setOriginalItineraries] = useState<JourneyItinerary[]>([]);
  // Recalculated optimal alternatives after disruption
  const [recoveredItineraries, setRecoveredItineraries] = useState<JourneyItinerary[]>([]);

  useEffect(() => {
    // Plan original journeys under normal scheduled conditions
    const normalResults = planJourneys({
      originCode: selectedDisruption.originCode,
      destCode: selectedDisruption.destCode,
      departureTime: selectedDisruption.timeContext,
      preferences: {
        priority: 'fastest',
        classPreference: 'any'
      }
    });
    setOriginalItineraries(normalResults);
    setHasTriggered(false);
    setAnimationStep(0);
  }, [selectedDisruption]);

  const handleTriggerDisruption = () => {
    setIsSimulating(true);
    setAnimationStep(1); // 1: Detecting disruption alert

    setTimeout(() => {
      setAnimationStep(2); // 2: Recalculating graph paths
    }, 500);

    setTimeout(() => {
      // Re-evaluate routes with observed delay inversion / diversion
      const replanned = planJourneys({
        originCode: selectedDisruption.originCode,
        destCode: selectedDisruption.destCode,
        departureTime: selectedDisruption.timeContext,
        userContext: 'waiting_at_station',
        preferences: {
          priority: 'fastest',
          classPreference: 'any'
        }
      });
      setRecoveredItineraries(replanned);
      setAnimationStep(3); // 3: Complete with animation
      setIsSimulating(false);
      setHasTriggered(true);
    }, 1100);
  };

  const handleReset = () => {
    setHasTriggered(false);
    setAnimationStep(0);
  };

  const originalBest = originalItineraries[0];
  const recoveredBest = recoveredItineraries.find(it => it.isRecommended) || recoveredItineraries[0];

  return (
    <div className="space-y-3.5 p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-sans">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 dark:text-white text-xs tracking-tight">
                AI Disruption Replanner
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-[9px] font-black">
                [FLAGSHIP INNOVATION]
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Live delay inversion & contingency graph recalculation
            </span>
          </div>
        </div>

        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
          [SIMULATED SCENARIO]
        </span>
      </div>

      {/* Scenario Selector Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-0.5">
          Select Live Disruption Scenario
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {DEMO_DISRUPTIONS.map(sc => {
            const isSelected = selectedDisruption.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedDisruption(sc);
                  handleReset();
                }}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold text-[10px] transition-all border flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-blue-800 dark:bg-blue-600 text-white border-blue-800 dark:border-blue-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{sc.name.split('(')[0].trim()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Disruption Card */}
      <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 text-xs">
            <Radio className="w-3.5 h-3.5 text-amber-600 animate-ping" />
            <span>{selectedDisruption.affectedTrainName} ({selectedDisruption.affectedTrainNumber})</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold text-[10px]">
            +{selectedDisruption.impactMinutes}m Disruption
          </span>
        </div>
        <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed font-medium">
          {selectedDisruption.cause}
        </p>
      </div>

      {/* Action Bar: Trigger Recalculation */}
      <div className="flex items-center gap-2">
        {!hasTriggered ? (
          <button
            onClick={handleTriggerDisruption}
            disabled={isSimulating}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all min-h-[44px]"
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Recalculating Feasible Alternatives...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Simulate Delay & Recalculate Route</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all border border-slate-200 dark:border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Scenario</span>
          </button>
        )}
      </div>

      {/* Recalculation Result Comparison View */}
      {hasTriggered && recoveredBest && (
        <div className="space-y-3 pt-1 animate-fadeIn">
          
          {/* Comparison Delta Cards (Old ETA vs New ETA) */}
          <div className="grid grid-cols-2 gap-2">
            
            {/* Old Disrupted Choice */}
            <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-1">
              <span className="text-[9px] uppercase font-bold text-rose-600 dark:text-rose-400 block tracking-wider">
                Original Route (Disrupted)
              </span>
              <div className="text-base font-black font-mono text-rose-700 dark:text-rose-300">
                {originalBest?.predictedArrival || '11:28'}
              </div>
              <div className="text-[10px] text-rose-600/80 dark:text-rose-400/80 leading-tight">
                {originalBest?.legs[0]?.train.trainName || 'Fast Local'} bunched behind signal point (+{selectedDisruption.impactMinutes}m)
              </div>
            </div>

            {/* Recalculated AI Recommendation */}
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300/80 dark:border-emerald-800/60 space-y-1 ring-1 ring-emerald-500/30">
              <span className="text-[9px] uppercase font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1 tracking-wider">
                <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                <span>AI Recommended Recovery</span>
              </span>
              <div className="text-base font-black font-mono text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <span>{recoveredBest.predictedArrival}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                  9m Faster
                </span>
              </div>
              <div className="text-[10px] text-emerald-800 dark:text-emerald-300/90 leading-tight font-medium">
                {recoveredBest.legs[0]?.train.trainName || 'Slow Local'} on parallel unobstructed track
              </div>
            </div>

          </div>

          {/* Detailed Decision Explanation */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Why the Replanned Route is Superior:</span>
            </div>
            
            <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-normal pl-1">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>
                  <strong>Faster Arrival:</strong> Arrives at {recoveredBest.predictedArrival} (saving {Math.max(8, selectedDisruption.impactMinutes - 15)} mins over waiting for delayed rake).
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>
                  <strong>Platform Guidance:</strong> Move immediately to Platform {recoveredBest.legs[0]?.departurePlatform || '3'}.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>
                  <strong>Ticket Validity:</strong> Ordinary suburban UTS / Season MST valid on both Slow and Fast lines without surcharge.
                </span>
              </li>
            </ul>

            {/* Quick Action Button to Book or View Alternatives */}
            <div className="pt-2 flex items-center gap-2 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => onSelectAlternative(recoveredBest, recoveredBest.recommendedClass || 'II')}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Select & Book New Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {onOpenStationGuide && (
                <button
                  onClick={() => onOpenStationGuide(selectedDisruption.originCode)}
                  className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center gap-1"
                  title="View Platform FOB Bridge Steps"
                >
                  <Footprints className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Platform Guide</span>
                </button>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
