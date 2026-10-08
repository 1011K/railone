import React, { useState } from 'react';
import { 
  JourneyItinerary, 
  TravelClass 
} from '../types/railway';
import { 
  Clock, 
  AlertCircle, 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Ticket,
  Footprints,
  Info
} from 'lucide-react';

interface ItineraryCardProps {
  itinerary: JourneyItinerary;
  onBookSpecimen: (itinerary: JourneyItinerary, travelClass: TravelClass) => void;
  onInspectTrain: (trainNumber: string) => void;
}

export const ItineraryCard: React.FC<ItineraryCardProps> = ({
  itinerary,
  onBookSpecimen,
  onInspectTrain
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedClass, setSelectedClass] = useState<TravelClass>(itinerary.recommendedClass);

  const primaryLeg = itinerary.legs[0];
  const isDirect = itinerary.transfers.length === 0;

  // Crowd level colors
  const crowdColor = {
    LOW: 'text-emerald-700 dark:text-emerald-300',
    MODERATE: 'text-blue-700 dark:text-blue-300',
    HEAVY: 'text-amber-700 dark:text-amber-300',
    CRUSH_LOAD: 'text-rose-700 dark:text-rose-300 font-semibold'
  }[primaryLeg.crowding.level];

  // Eligibility badge style
  const eligibilityBadge = {
    ELIGIBLE: {
      text: 'Verified Eligible',
      color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      icon: ShieldCheck
    },
    CONDITIONAL: {
      text: 'Conditional (Requires MST / General Coach)',
      color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      icon: AlertCircle
    },
    PROHIBITED: {
      text: 'Prohibited For Suburban Tickets',
      color: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      icon: ShieldAlert
    },
    DATA_UNAVAILABLE: {
      text: 'Eligibility Unverified',
      color: 'text-slate-600 bg-slate-100 border-slate-200',
      icon: Info
    }
  }[itinerary.eligibility.status];

  const EligIcon = eligibilityBadge.icon;

  return (
    <article 
      aria-label={`Journey via ${primaryLeg.train.trainName}`}
      className={`rounded-2xl border transition-all ${
        itinerary.isRecommended 
          ? 'border-theme-primary bg-white dark:bg-slate-900 shadow-md ring-1 ring-theme-primary/20' 
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
      }`}
    >
      {/* Top Banner: Delay Inversion or Recommended Badge */}
      {itinerary.delayInversionNote ? (
        <div className="bg-amber-500/10 dark:bg-amber-500/20 border-b border-amber-500/30 px-4 py-2.5 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200 font-medium">
          <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{itinerary.delayInversionNote}</span>
        </div>
      ) : itinerary.isRecommended ? (
        <div className="bg-theme-light border-b border-theme-border px-4 py-2 flex items-center justify-between text-xs text-theme-text font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-theme-primary" />
            <span>Optimal Choice: {itinerary.rankReason}</span>
          </div>
          <span className="text-[11px] font-bold text-theme-primary uppercase tracking-wide">
            Rank #1
          </span>
        </div>
      ) : null}

      {/* Origin Delay / Leave-Home Warning */}
      {itinerary.originDelayWarning && (
        <div className="bg-orange-50 dark:bg-orange-950/40 border-b border-orange-200 dark:border-orange-800 px-4 py-2 flex items-start gap-2 text-xs text-orange-800 dark:text-orange-300">
          <Clock className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" />
          <div>
            <span className="font-semibold">Pre-Departure Advisory: </span>
            {itinerary.originDelayWarning}
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Timing & Train Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight tabular-nums font-mono">
                {itinerary.predictedDeparture}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span className="h-0.5 w-6 sm:w-10 bg-slate-300 dark:bg-slate-700 inline-block" />
                <span className="tabular-nums font-mono font-bold">{itinerary.totalDurationMinutes} min</span>
                <span className="h-0.5 w-6 sm:w-10 bg-slate-300 dark:bg-slate-700 inline-block" />
              </div>
              <span className="font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight tabular-nums font-mono">
                {itinerary.predictedArrival}
              </span>
            </div>

            {/* Delay & Schedule metadata (Clean unboxed inline typography) */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                #{primaryLeg.train.trainNumber} · {primaryLeg.train.trainName}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-medium">{primaryLeg.stoppingPatternLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                PF {primaryLeg.departurePlatform}
              </span>
              {primaryLeg.delayDepMinutes > 0 ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-700 dark:text-amber-400 font-bold tabular-nums font-mono">
                    +{primaryLeg.delayDepMinutes}m delay (Sched: {primaryLeg.scheduledDep})
                  </span>
                </>
              ) : (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">On-time</span>
                </>
              )}
            </div>

            {/* Leave Home Advisor */}
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Footprints className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>
                Leave Home at <strong className="text-slate-900 dark:text-white font-mono tabular-nums">{itinerary.leaveHomeTime}</strong> ({itinerary.leaveHomeMarginMinutes}m transit margin to station)
              </span>
            </div>
          </div>

          {/* Right: Crowding & Status Metrics */}
          <div className="flex flex-col sm:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              {/* Crowding Indicator */}
              <div className="flex items-center gap-1.5 text-xs">
                <Users className={`w-3.5 h-3.5 ${crowdColor}`} />
                <span className="text-slate-600 dark:text-slate-300">Crowd:</span>
                <span className={`font-semibold ${crowdColor}`}>
                  {primaryLeg.crowding.level.replace('_', ' ')}
                </span>
              </div>

              {/* Data Provenance Badge */}
              <span className="text-[11px] text-slate-600 dark:text-slate-400">
                [{primaryLeg.dataStatus}]
              </span>
            </div>

            {/* Legal Eligibility status */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border font-medium ${eligibilityBadge.color}`}>
              <EligIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{eligibilityBadge.text}</span>
            </div>
          </div>
        </div>

        {/* Transfer Warning if multi-leg */}
        {!isDirect && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Transfer Required: </strong>
              {itinerary.transfers[0].transferGuide}
            </div>
          </div>
        )}

        {/* Fare & Class Selection Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-600 dark:text-slate-300 mr-1">Class:</span>
            {(Object.keys(itinerary.totalFareByClass) as TravelClass[]).map((cls) => {
              const fare = itinerary.totalFareByClass[cls];
              const isSelected = selectedClass === cls;
              const classLabel = ({
                II: 'II (2nd)',
                I: 'I (1st)',
                AC_LOCAL: 'AC Local',
                '2S': '2S Express',
                CC: 'Chair Car',
                EC: 'Exec CC',
                SL: 'Sleeper',
                '3A': '3A',
                '2A': '2A',
                '1A': '1A',
                STD: 'Standard',
                '1ST': '1st Class',
                OFF: 'Off-Peak',
                ANY: 'Anytime',
                ORD: 'Ordinary (普通)',
                GRN: 'Green (グリーン)',
                GRC: 'Gran Class',
                SHK: 'Shinkansen',
                '2CL': '2. Klasse',
                '1CL': '1. Klasse',
                HAL: 'Half Fare',
                PAN: 'Panorama',
                '2KL': '2. Klasse',
                '1KL': '1. Klasse',
                SPR: 'ICE Sprinter',
                REG: 'Regio / D-Ticket'
              } as Record<string, string>)[cls] || cls;

              return (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors border ${
                    isSelected 
                      ? 'bg-theme-primary text-white border-theme-primary shadow-xs' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {classLabel} · ₹{fare}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onInspectTrain(primaryLeg.train.trainNumber)}
              className="text-xs text-theme-primary hover:underline px-2 py-1 font-semibold"
            >
              Live Running
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center gap-1 px-2 py-1"
            >
              {expanded ? 'Less' : 'Stops & Rules'}
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onBookSpecimen(itinerary, selectedClass)}
              disabled={itinerary.eligibility.status === 'PROHIBITED'}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors min-h-[38px] ${
                itinerary.eligibility.status === 'PROHIBITED'
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-theme-primary hover-bg-theme-primary text-white'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Specimen Ticket (₹{itinerary.totalFareByClass[selectedClass] || 10})</span>
            </button>
          </div>
        </div>

        {/* Expanded Detail Panel */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs space-y-3">
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-200/60 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                Passenger Eligibility & Legal Notes:
              </h4>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {itinerary.eligibility.summary}
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                {itinerary.eligibility.rulesApplied.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
              <div className="mt-2 text-[11px] text-slate-500">
                Ticket note: {itinerary.eligibility.ticketRequiredNote}
              </div>
            </div>

            {/* Leg-by-leg details */}
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-white">
                Journey Segments & Stopping Pattern:
              </h4>
              {itinerary.legs.map((leg, lIdx) => (
                <div key={lIdx} className="border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Leg {lIdx + 1}: {leg.fromStation.name} ➔ {leg.toStation.name}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span className="font-mono font-bold">#{leg.train.trainNumber}</span>
                      <span>({leg.train.serviceType})</span>
                      <span>·</span>
                      <span className="inline-flex items-center px-1 py-0.2 rounded text-[10px] font-bold font-mono bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                        PF {leg.departurePlatform}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                      {leg.predictedDep} ➔ {leg.predictedArr}
                    </span>
                    <div className="text-[11px] text-slate-500">
                      Crowd: {leg.crowding.explanation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </article>
  );
};
