import React, { useState, useMemo } from 'react';
import { 
  STATIONS, 
  INITIAL_OBSERVATIONS 
} from '../fixtures/railwayData';
import { 
  planJourneys 
} from '../engine/journeyEngine';
import { 
  JourneyItinerary, 
  PassengerPreferences, 
  UserTravelContext, 
  TravelClass,
  TrainRunningObservation 
} from '../types/railway';
import { ItineraryCard } from './ItineraryCard';
import { 
  ArrowRight, 
  Search, 
  SlidersHorizontal, 
  Home, 
  MapPin, 
  TrainTrack, 
  Clock, 
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Zap,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { useTheme } from './ThemeContext';

interface JourneyDecisionViewProps {
  onBookSpecimen: (itinerary: JourneyItinerary, travelClass: TravelClass) => void;
  onInspectTrain: (trainNumber: string) => void;
}

export const JourneyDecisionView: React.FC<JourneyDecisionViewProps> = ({
  onBookSpecimen,
  onInspectTrain
}) => {
  const { language } = useTheme();

  // Search state
  const [originCode, setOriginCode] = useState('TNA');
  const [destCode, setDestCode] = useState('DR');
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);
  const [departureTime, setDepartureTime] = useState('10:40');
  const [userContext, setUserContext] = useState<UserTravelContext>('waiting_at_station');

  // Onboard replanning context
  const [onboardTrainNumber, setOnboardTrainNumber] = useState('95112');
  const [onboardStationCode, setOnboardStationCode] = useState('CLA');

  // Interactive Disruption Scenario Controller state
  const [activeSignalDisruption, setActiveSignalDisruption] = useState(true); // Vidyavihar signal hold (+22m)
  const [activeOriginDisruption, setActiveOriginDisruption] = useState(true); // Kalyan AC inspection (+18m)

  // Preferences
  const [classPref, setClassPref] = useState<PassengerPreferences['classPreference']>('second');
  const [priority, setPriority] = useState<PassengerPreferences['priority']>('fastest');
  const [hasSeasonPass, setHasSeasonPass] = useState(false);
  const [walkMargin, setWalkMargin] = useState(12);

  // Quick preset shortcuts
  const presets = [
    { label: 'Thane ➔ Dadar', from: 'TNA', to: 'DR', time: '10:40', ctx: 'waiting_at_station' as UserTravelContext, desc: 'Tests Fast vs Slow Delay Inversion' },
    { label: 'Thane ➔ Churchgate', from: 'TNA', to: 'CCG', time: '10:35', ctx: 'pre_departure' as UserTravelContext, desc: 'Tests Central-to-Western Transfer' },
    { label: 'Dadar ➔ Kalyan', from: 'DR', to: 'KYN', time: '10:15', ctx: 'waiting_at_station' as UserTravelContext, desc: 'Tests Express Short-Hop Eligibility' },
    { label: 'Kalyan ➔ CSMT', from: 'KYN', to: 'CSMT', time: '10:20', ctx: 'pre_departure' as UserTravelContext, desc: 'Tests Origin Delay Leave-Home' },
    { label: 'Panvel ➔ CSMT', from: 'PNVL', to: 'CSMT', time: '10:10', ctx: 'pre_departure' as UserTravelContext, desc: 'Tests Harbour Line Commute' },
    { label: 'CSMT ➔ Pune Jn', from: 'CSMT', to: 'PUNE', time: '06:30', ctx: 'pre_departure' as UserTravelContext, desc: 'Tests National Intercity Rail' },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setOriginCode(p.from);
    setDestCode(p.to);
    setDepartureTime(p.time);
    setUserContext(p.ctx);
  };

  // Build reactive observations based on disruption toggles
  const dynamicObservations = useMemo(() => {
    const obsMap: Record<string, TrainRunningObservation> = JSON.parse(JSON.stringify(INITIAL_OBSERVATIONS));

    if (!activeSignalDisruption && obsMap['95112']) {
      obsMap['95112'].delayMinutesAtCurrent = 2;
      obsMap['95112'].disruptionReason = 'Signal cleared. Section running with normal headway.';
    }

    if (!activeOriginDisruption && obsMap['95114']) {
      obsMap['95114'].hasDepartedOrigin = true;
      obsMap['95114'].delayMinutesAtCurrent = 0;
      obsMap['95114'].disruptionReason = 'Departed Kalyan origin on-time.';
    }

    return obsMap;
  }, [activeSignalDisruption, activeOriginDisruption]);

  // Filtered station lists for autocompletes
  const allStationsList = useMemo(() => Object.values(STATIONS), []);

  const filteredOriginStations = useMemo(() => {
    const q = originSearch.toLowerCase().trim();
    if (!q) return allStationsList;
    return allStationsList.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.code.toLowerCase().includes(q) || 
      s.city.toLowerCase().includes(q) ||
      s.aliases.some(a => a.toLowerCase().includes(q))
    );
  }, [originSearch, allStationsList]);

  const filteredDestStations = useMemo(() => {
    const q = destSearch.toLowerCase().trim();
    if (!q) return allStationsList;
    return allStationsList.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.code.toLowerCase().includes(q) || 
      s.city.toLowerCase().includes(q) ||
      s.aliases.some(a => a.toLowerCase().includes(q))
    );
  }, [destSearch, allStationsList]);

  // Run the deterministic journey engine
  const itineraries = useMemo(() => {
    return planJourneys({
      originCode,
      destCode,
      departureTime,
      userContext,
      preferences: {
        classPreference: classPref,
        priority,
        hasSeasonPass,
        walkToStationMinutes: walkMargin,
        maxTransfers: 1
      },
      observations: dynamicObservations
    });
  }, [originCode, destCode, departureTime, userContext, classPref, priority, hasSeasonPass, walkMargin, dynamicObservations]);

  const originStation = STATIONS[originCode];
  const destStation = STATIONS[destCode];

  return (
    <div className="space-y-6">
      
      {/* Top Planner Controls Card */}
      <section aria-label="Journey Search & Configuration" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        
        {/* User Context Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrainTrack className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Journey Decision Engine</span>
            </h2>
            <p className="text-xs text-slate-500">
              Evaluates live delays, stop patterns, transfer walking times & ticketing eligibility
            </p>
          </div>

          {/* Context Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setUserContext('pre_departure')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                userContext === 'pre_departure' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Leave Home</span>
            </button>
            <button
              onClick={() => setUserContext('waiting_at_station')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                userContext === 'waiting_at_station' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>At Station</span>
            </button>
            <button
              onClick={() => setUserContext('onboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                userContext === 'onboard' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <TrainTrack className="w-3.5 h-3.5" />
              <span>Onboard Replan</span>
            </button>
          </div>
        </div>

        {/* Onboard Specific Context Guidance */}
        {userContext === 'onboard' && (
          <div className="mb-4 p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-indigo-950 dark:text-indigo-100 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Active Onboard Commuter Intelligence:
              </span>
              <p className="text-indigo-800 dark:text-indigo-200">
                You are currently inside <strong>Fast Local 95112</strong> approaching Kurla. The system monitors upcoming signal halts and advises whether staying onboard or alighting to catch an immediate slow/connecting service is faster.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setOriginCode('CLA');
                  setDestCode('DR');
                  setDepartureTime('11:00');
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-xs"
              >
                Inspect Kurla De-Board Alternatives
              </button>
            </div>
          </div>
        )}

        {/* Origin / Destination Search Comboboxes / Time Selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Origin Station Combobox */}
          <div className="md:col-span-4 relative">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              From Station (Search Name, Code or Alias)
            </label>
            <div 
              onClick={() => setIsOriginOpen(!isOriginOpen)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between cursor-pointer min-h-[44px]"
            >
              <div className="truncate">
                {originStation ? `${originStation.name} (${originStation.code})` : 'Select Station'}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            </div>

            {isOriginOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 max-h-60 overflow-y-auto">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Type station name, code, or alias (e.g. cst, thane)..."
                    value={originSearch}
                    onChange={(e) => setOriginSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <div className="space-y-0.5">
                  {filteredOriginStations.map((st) => (
                    <button
                      key={st.code}
                      onClick={() => {
                        setOriginCode(st.code);
                        setIsOriginOpen(false);
                        setOriginSearch('');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        originCode === st.code 
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{st.name} ({st.code})</span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{st.line}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Destination Station Combobox */}
          <div className="md:col-span-4 relative">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              To Station (Search Name, Code or Alias)
            </label>
            <div 
              onClick={() => setIsDestOpen(!isDestOpen)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between cursor-pointer min-h-[44px]"
            >
              <div className="truncate">
                {destStation ? `${destStation.name} (${destStation.code})` : 'Select Destination'}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            </div>

            {isDestOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 max-h-60 overflow-y-auto">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Type destination name or code..."
                    value={destSearch}
                    onChange={(e) => setDestSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <div className="space-y-0.5">
                  {filteredDestStations.map((st) => (
                    <button
                      key={st.code}
                      onClick={() => {
                        setDestCode(st.code);
                        setIsDestOpen(false);
                        setDestSearch('');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        destCode === st.code 
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className="truncate">{st.name} ({st.code})</span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{st.line}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Departure Time */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Time</span>
            </label>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            />
          </div>

          {/* Walk margin to station */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Walk to Station
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="60"
                value={walkMargin}
                onChange={(e) => setWalkMargin(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              />
              <span className="text-xs text-slate-500 shrink-0">min</span>
            </div>
          </div>
        </div>

        {/* Preference Filters Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Class Preference */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium">Class:</span>
            {[
              { id: 'any', label: 'All Classes' },
              { id: 'second', label: '2nd Class (II)' },
              { id: 'first', label: '1st Class (I)' },
              { id: 'ac_preferred', label: 'AC Preferred' },
              { id: 'ac_mandatory', label: 'AC Only' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setClassPref(c.id as any)}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  classPref === c.id 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Ranking Priority */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium">Rank by:</span>
            {[
              { id: 'fastest', label: 'Earliest Arrival' },
              { id: 'least_crowded', label: 'Least Crowded' },
              { id: 'lowest_fare', label: 'Lowest Fare' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPriority(p.id as any)}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  priority === p.id 
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}

            {/* Suburban Season Pass Toggle */}
            <label className="flex items-center gap-2 ml-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasSeasonPass}
                onChange={(e) => setHasSeasonPass(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">I have Season Pass (MST)</span>
            </label>
          </div>

        </div>

        {/* Live Network Disruption Simulator Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Interactive Disruption Injection:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSignalDisruption(!activeSignalDisruption)}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                activeSignalDisruption 
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs' 
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
              }`}
            >
              Vidyavihar Signal Failure (+22m) {activeSignalDisruption ? '⚡ ACTIVE' : 'CLEARED'}
            </button>

            <button
              onClick={() => setActiveOriginDisruption(!activeOriginDisruption)}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                activeOriginDisruption 
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs' 
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
              }`}
            >
              Kalyan AC Origin Hold (+18m) {activeOriginDisruption ? '⚡ ACTIVE' : 'CLEARED'}
            </button>
          </div>
        </div>

        {/* Quick Commute Presets */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Presets:
          </span>
          {presets.map((pr, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(pr)}
              className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-medium transition-colors"
              title={pr.desc}
            >
              {pr.label}
            </button>
          ))}
        </div>

      </section>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recommended Options for {originStation?.name} ➔ {destStation?.name}
          </h3>
          <p className="text-xs text-slate-500">
            {itineraries.length} eligible service{itineraries.length === 1 ? '' : 's'} evaluated under active delay observations
          </p>
        </div>

        <div className="text-xs text-slate-500">
          Showing ranked itineraries
        </div>
      </div>

      {/* Itinerary Cards List */}
      {itineraries.length > 0 ? (
        <div className="space-y-4">
          {itineraries.map((itinerary) => (
            <ItineraryCard
              key={itinerary.id}
              itinerary={itinerary}
              onBookSpecimen={onBookSpecimen}
              onInspectTrain={onInspectTrain}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No eligible direct or transfer services found matching criteria.
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting class preferences, allowing transfers, or selecting another departure time band.
          </p>
        </div>
      )}

    </div>
  );
};
