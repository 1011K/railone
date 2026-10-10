import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Footprints, 
  ShieldCheck, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  Info,
  Coffee,
  RotateCcw
} from 'lucide-react';
import { STATIONS } from '../fixtures/railwayData';
import { resolveStation } from '../engine/journeyEngine';

interface LeaveHomePlannerProps {
  onPlanJourney: (fromCode: string, toCode: string, departureTime: string) => void;
  defaultOrigin?: string;
  defaultDest?: string;
}

export const LeaveHomePlanner: React.FC<LeaveHomePlannerProps> = ({
  onPlanJourney,
  defaultOrigin = 'TNA',
  defaultDest = 'CSMT'
}) => {
  const [fromCode, setFromCode] = useState(defaultOrigin);
  const [toCode, setToCode] = useState(defaultDest);
  const [targetArrival, setTargetArrival] = useState('11:30');
  const [walkToStationMinutes, setWalkToStationMinutes] = useState(12);
  const [platformBufferMinutes, setPlatformBufferMinutes] = useState(5);
  const [originStationDelay, setOriginStationDelay] = useState(0);

  // Station info
  const fromStation = resolveStation(fromCode) || STATIONS[fromCode] || { code: fromCode, name: fromCode };
  const toStation = resolveStation(toCode) || STATIONS[toCode] || { code: toCode, name: toCode };

  // Calculate recommended timetable time
  // E.g. Thane to CSMT transit time is ~46 mins (Fast) or ~62 mins (Slow)
  const isLongTransit = fromCode === 'TNA' || fromCode === 'KYN';
  const estimatedTrainDuration = isLongTransit ? 48 : 28;

  // Convert target arrival to minutes from midnight
  const [targetH, targetM] = targetArrival.split(':').map(Number);
  const targetTotalMinutes = (targetH || 11) * 60 + (targetM || 30);

  // Train must depart station at least estimatedTrainDuration before target arrival
  const recommendedTrainDepartureTotal = targetTotalMinutes - estimatedTrainDuration;
  // Leave home time = train departure - platform buffer - walk time + delay adjustment
  const recommendedLeaveHomeTotal = recommendedTrainDepartureTotal - platformBufferMinutes - walkToStationMinutes + originStationDelay;

  // Backup earlier departure (15 mins buffer)
  const backupLeaveHomeTotal = recommendedLeaveHomeTotal - 15;

  const formatMinutesToTime = (minTotal: number): string => {
    let m = minTotal;
    while (m < 0) m += 1440;
    while (m >= 1440) m -= 1440;
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  };

  const leaveHomeTime = formatMinutesToTime(recommendedLeaveHomeTotal);
  const trainDepartureTime = formatMinutesToTime(recommendedTrainDepartureTotal);
  const backupLeaveTime = formatMinutesToTime(backupLeaveHomeTotal);

  return (
    <div className="space-y-3.5 p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 dark:text-white text-xs tracking-tight">
                Smart Leave-Home Planner
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono text-[9px] font-black">
                [FEATURE E]
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Calculate exact departure time to reach on schedule
            </span>
          </div>
        </div>

        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
          [SCHEDULE HEURISTIC]
        </span>
      </div>

      {/* Inputs Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        
        {/* Target Arrival Time */}
        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
            Target Arrival at {toStation.name}
          </span>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <input
              type="time"
              value={targetArrival}
              onChange={(e) => setTargetArrival(e.target.value)}
              className="bg-transparent font-black text-sm text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Walk to Station Time */}
        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
            Walk/Transit to {fromStation.name}
          </span>
          <div className="flex items-center gap-2">
            <Footprints className="w-4 h-4 text-indigo-500" />
            <select
              value={walkToStationMinutes}
              onChange={(e) => setWalkToStationMinutes(Number(e.target.value))}
              className="bg-transparent font-bold text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value={5}>5 mins (Adjacent)</option>
              <option value={10}>10 mins (Close)</option>
              <option value={12}>12 mins (Average)</option>
              <option value={20}>20 mins (Auto/Bus)</option>
              <option value={30}>30 mins (Distant)</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Leave-Home Recommendation Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-indigo-600 dark:text-indigo-400 block">
              Suggested Leave-Home Time
            </span>
            <div className="text-2xl font-black font-mono text-indigo-950 dark:text-indigo-100 flex items-center gap-2 mt-0.5">
              <span>{leaveHomeTime}</span>
              <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                Recommended
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Boarding Train at
            </span>
            <div className="text-sm font-black font-mono text-slate-800 dark:text-slate-200">
              {trainDepartureTime}
            </div>
          </div>
        </div>

        {/* Step-by-Step Breakdown */}
        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span>Leave door:</span>
            <span className="font-mono font-bold">{leaveHomeTime}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span>Reach platform ({walkToStationMinutes}m walk + {platformBufferMinutes}m buffer):</span>
            <span className="font-mono font-bold">{formatMinutesToTime(recommendedLeaveHomeTotal + walkToStationMinutes)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span>Board train at {fromStation.name}:</span>
            <span className="font-mono font-bold">{trainDepartureTime}</span>
          </div>
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-bold border-t border-slate-100 dark:border-slate-800 pt-1">
            <span>Reach {toStation.name} on schedule:</span>
            <span className="font-mono font-black">{targetArrival}</span>
          </div>
        </div>

        {/* Backup Option */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Coffee className="w-3.5 h-3.5 text-slate-400" />
            <span>Need extra safety margin? Leave at <strong>{backupLeaveTime}</strong></span>
          </span>
          <button
            onClick={() => onPlanJourney(fromCode, toCode, trainDepartureTime)}
            className="px-3 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs"
          >
            <span>View Trains</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
};
