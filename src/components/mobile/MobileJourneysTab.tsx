import React, { useState, useEffect } from 'react';
import { planJourneys, PlanJourneyParams } from '../../engine/journeyEngine';
import { normalizeStation } from '../../engine/stationNormalizer';
import { JourneyItinerary, TravelClass } from '../../types/railway';
import { 
  Train, 
  Search, 
  ArrowRightLeft, 
  Clock, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Ticket, 
  Users,
  Compass,
  Footprints
} from 'lucide-react';

import { PassengerNavTab } from '../common/BottomNavigation';
import { useAuthority } from '../AuthorityContext';

interface MobileJourneysTabProps {
  initialOrigin?: string;
  initialDest?: string;
  onBookSpecimen: (itinerary: JourneyItinerary, travelClass: TravelClass) => void;
  onInspectTrain: (trainNumber: string) => void;
}

export const MobileJourneysTab: React.FC<MobileJourneysTabProps> = ({
  initialOrigin = 'TNA',
  initialDest = 'CSMT',
  onBookSpecimen,
  onInspectTrain
}) => {
  const { authority, formatCurrency } = useAuthority();
  const [originInput, setOriginInput] = useState(authority?.defaultOriginCode || initialOrigin);
  const [destInput, setDestInput] = useState(authority?.defaultDestCode || initialDest);
  const [departureTime, setDepartureTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [isArriveBy, setIsArriveBy] = useState(false);
  const [arriveByDeadline, setArriveByDeadline] = useState('12:30');
  
  // Filters & Preferences
  const [classPreference, setClassPreference] = useState<'any' | 'second' | 'first' | 'ac_preferred' | 'ac_mandatory'>('any');
  const [priority, setPriority] = useState<'fastest' | 'least_crowded' | 'lowest_fare' | 'fewest_transfers'>('fastest');
  
  // Results
  const [itineraries, setItineraries] = useState<JourneyItinerary[]>([]);
  const [expandedItineraryId, setExpandedItineraryId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const executeSearch = (fromCode: string, toCode: string) => {
    const fromNorm = normalizeStation(fromCode);
    const toNorm = normalizeStation(toCode);

    const fCode = fromNorm.matchedStation?.code || fromCode.toUpperCase();
    const tCode = toNorm.matchedStation?.code || toCode.toUpperCase();

    const params: PlanJourneyParams = {
      originCode: fCode,
      destCode: tCode,
      departureTime,
      arriveByDeadline: isArriveBy ? arriveByDeadline : undefined,
      userContext: 'pre_departure',
      preferences: {
        classPreference,
        priority,
        hasSeasonPass: false,
        walkToStationMinutes: 10,
        maxTransfers: 1
      }
    };

    const results = planJourneys(params);
    setItineraries(results);
    setHasSearched(true);
    if (results.length > 0) {
      setExpandedItineraryId(results[0].id);
    }
  };

  // Sync inputs and execute search when sovereign transport authority changes
  useEffect(() => {
    if (authority) {
      setOriginInput(authority.defaultOriginCode);
      setDestInput(authority.defaultDestCode);
      executeSearch(authority.defaultOriginCode, authority.defaultDestCode);
    }
  }, [authority.id, authority.defaultOriginCode, authority.defaultDestCode]);

  useEffect(() => {
    executeSearch(originInput, destInput);
  }, [departureTime, classPreference, priority, isArriveBy, arriveByDeadline]);

  const handleSwap = () => {
    const temp = originInput;
    setOriginInput(destInput);
    setDestInput(temp);
    executeSearch(destInput, temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(originInput, destInput);
  };

  return (
    <div className="space-y-3.5 pb-20 px-3.5 pt-2">

      {/* Sovereign Authority Corridor Quick Select Chips */}
      {authority.corridors && authority.corridors.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {authority.shortTitle} Corridors
            </span>
            <span className="text-[9px] font-mono text-emerald-500 font-bold">
              [VERIFIED TRUNK]
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
            {authority.corridors.map((corridor, idx) => {
              const isSelected = originInput === corridor.from && destInput === corridor.to;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setOriginInput(corridor.from);
                    setDestInput(corridor.to);
                    executeSearch(corridor.from, corridor.to);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all border flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-theme-primary text-white border-theme-primary shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-theme-primary/40'
                  }`}
                >
                  <span>{corridor.name.split('(')[0].trim() || corridor.name}</span>
                  <span className="opacity-70 font-mono text-[9px]">({corridor.from}➔{corridor.to})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Search Header Form */}
      <form onSubmit={handleSearchSubmit} className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
        <div className="relative space-y-1.5">
          {/* Origin */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ml-1" />
            <input
              type="text"
              value={originInput}
              onChange={(e) => setOriginInput(e.target.value.toUpperCase())}
              placeholder={`From Station (e.g. ${authority.stations[0]?.name || 'Origin'}, ${authority.defaultOriginCode})`}
              className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden"
            />
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwap}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-theme-primary text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 active:scale-95"
            title="Swap stations"
          >
            <ArrowRightLeft className="w-3 h-3" />
          </button>

          {/* Destination */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-1" />
            <input
              type="text"
              value={destInput}
              onChange={(e) => setDestInput(e.target.value.toUpperCase())}
              placeholder={`To Station (e.g. ${authority.stations[1]?.name || 'Destination'}, ${authority.defaultDestCode})`}
              className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Time Mode Toggle & Inputs */}
        <div className="flex items-center justify-between gap-2 text-xs pt-1">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setIsArriveBy(false)}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                !isArriveBy ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Depart At
            </button>
            <button
              type="button"
              onClick={() => setIsArriveBy(true)}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                isArriveBy ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Arrive By
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="time"
              value={isArriveBy ? arriveByDeadline : departureTime}
              onChange={(e) => isArriveBy ? setArriveByDeadline(e.target.value) : setDepartureTime(e.target.value)}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        {/* Class Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-[10px]">
          {[
            { id: 'any', label: 'All Classes' },
            { id: 'second', label: 'Second (II)' },
            { id: 'first', label: 'First (I)' },
            { id: 'ac_preferred', label: 'AC Preferred' },
            { id: 'ac_mandatory', label: 'AC Only' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setClassPreference(f.id as any)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap font-bold transition-all ${
                classPreference === f.id
                  ? 'bg-theme-primary text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </form>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="font-extrabold text-slate-800 dark:text-slate-200">
          {hasSearched ? `Itineraries (${itineraries.length} Found)` : 'Searching...'}
        </span>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <span>Sort:</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="bg-transparent font-bold text-theme-primary focus:outline-hidden"
          >
            <option value="fastest">Fastest</option>
            <option value="lowest_fare">Lowest Fare</option>
            <option value="fewest_transfers">Fewest Transfers</option>
            <option value="least_crowded">Least Crowded</option>
          </select>
        </div>
      </div>

      {/* Itineraries List */}
      <div className="space-y-2.5">
        {itineraries.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Direct or Transfer Services Available
            </div>
            <div className="text-xs text-slate-400 max-w-xs mx-auto">
              Please adjust your departure window or class filters. Suburban locals run frequently between 05:00 and 23:30.
            </div>
          </div>
        ) : (
          itineraries.map((it) => {
            const isExpanded = expandedItineraryId === it.id;
            const primaryLeg = it.legs[0];
            const isAc = it.isAcService;
            const hasDelayInversion = !!it.delayInversionNote;

            return (
              <div
                key={it.id}
                className={`rounded-3xl border transition-all overflow-hidden ${
                  it.isRecommended
                    ? 'bg-white dark:bg-slate-900 border-theme-primary shadow-md ring-1 ring-theme-primary/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Itinerary Header Summary */}
                <div 
                  onClick={() => setExpandedItineraryId(isExpanded ? null : it.id)}
                  className="p-3.5 cursor-pointer select-none space-y-2"
                >
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {it.isRecommended && (
                        <span className="px-2 py-0.5 rounded-full bg-theme-primary text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Recommended</span>
                        </span>
                      )}

                      {hasDelayInversion && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] font-black">
                          ⚡ Delay Inversion Winner
                        </span>
                      )}

                      {isAc && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-[9px] font-black">
                          AC EMU Local
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-bold">
                        {it.transfers.length === 0 ? 'Direct Service' : `${it.transfers.length} Transfer via ${it.transfers[0].station.name}`}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>

                  {/* Departure / Arrival Times Row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-black text-slate-900 dark:text-slate-100 font-mono flex items-center gap-1.5">
                        <span>{it.predictedDeparture}</span>
                        <span className="text-slate-400 text-xs">➔</span>
                        <span>{it.predictedArrival}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Duration: {it.totalDurationMinutes} mins · Leave home by {it.leaveHomeTime}
                      </div>
                    </div>

                    {/* Fares Column */}
                    <div className="text-right">
                      <div className="text-sm font-black text-theme-primary font-mono">
                        {formatCurrency(it.totalFareByClass[it.recommendedClass] || it.totalFareByClass['II'] || 10)}
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">
                        {authority.classes.find(c => c.code === it.recommendedClass)?.name || (it.recommendedClass === 'AC_LOCAL' ? 'AC Local' : it.recommendedClass === 'I' ? 'First Class' : 'Second Class')}
                      </div>
                    </div>
                  </div>

                  {/* Delay Inversion Explanatory Note */}
                  {hasDelayInversion && (
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-800 dark:text-emerald-300 leading-tight">
                      {it.delayInversionNote}
                    </div>
                  )}
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
                    
                    {/* Legs Timeline */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Journey Halts & Interchanges
                      </div>

                      {it.legs.map((leg, lIdx) => (
                        <div key={lIdx} className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Train className="w-3.5 h-3.5 text-theme-primary" />
                              <span>{leg.train.trainName} ({leg.train.trainNumber})</span>
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                              PF {leg.departurePlatform}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span>{leg.fromStation.name} ({leg.predictedDep})</span>
                            <span>➔</span>
                            <span>{leg.toStation.name} ({leg.predictedArr})</span>
                          </div>

                          <div className="text-[10px] text-slate-400 flex items-center justify-between">
                            <span>{leg.stoppingPatternLabel}</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Crowd: {leg.crowding.level}</span>
                          </div>
                        </div>
                      ))}

                      {/* Transfer Walking Guide if present */}
                      {it.transfers.length > 0 && (
                        <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-800 dark:text-indigo-300 flex items-start gap-2">
                          <Footprints className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
                          <div>
                            <span className="font-bold">Interchange Buffer: </span>
                            <span>{it.transfers[0].transferGuide}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Booking Buttons Bar */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[10px] flex-wrap">
                        <span className="text-slate-400">Class:</span>
                        {(Object.keys(it.totalFareByClass) as TravelClass[]).map(cls => {
                          const clsMeta = authority.classes.find(c => c.code === cls);
                          return (
                            <button
                              key={cls}
                              onClick={() => onBookSpecimen(it, cls)}
                              className={`px-2 py-1 rounded-lg font-bold border transition-all ${
                                it.recommendedClass === cls
                                  ? 'bg-theme-primary text-white border-theme-primary'
                                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {clsMeta ? clsMeta.name.split(' ')[0] : cls}: {formatCurrency(it.totalFareByClass[cls] || 10)}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => onBookSpecimen(it, it.recommendedClass)}
                        className="px-3.5 py-2 rounded-xl bg-theme-primary hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 min-h-[44px]"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Book E-Ticket</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
