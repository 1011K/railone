import React, { useState, useEffect } from 'react';
import { CITIES_REGISTRY, CityCoverageConfig } from '../../fixtures/citiesData';
import { useAuthority } from '../AuthorityContext';
import { InstitutionalInsignia } from '../common/InstitutionalInsignia';
import { useTheme } from '../ThemeContext';
import { getTranslation } from '../../i18n/translations';
import { 
  Train, 
  MapPin, 
  ArrowRightLeft, 
  Search, 
  Clock, 
  Ticket, 
  ShieldCheck, 
  Compass, 
  Layers, 
  ChevronRight, 
  Sparkles, 
  Radio, 
  PhoneCall, 
  MessageSquare, 
  Grid,
  SlidersHorizontal,
  X,
  Check
} from 'lucide-react';

import { PassengerNavTab } from '../common/BottomNavigation';

interface MobileHomeTabProps {
  currentCity: CityCoverageConfig;
  onSelectCityClick: () => void;
  onNavigateToJourney: (fromCode: string, toCode: string) => void;
  onOpenActionModal: (action: string, payload?: any) => void;
  onSwitchTab: (tab: PassengerNavTab) => void;
  onOpenRailSathi?: () => void;
}

export const MobileHomeTab: React.FC<MobileHomeTabProps> = ({
  currentCity,
  onSelectCityClick,
  onNavigateToJourney,
  onOpenActionModal,
  onSwitchTab,
  onOpenRailSathi
}) => {
  const { authority } = useAuthority();
  const { language } = useTheme();
  const t = getTranslation(language);

  const [fromCode, setFromCode] = useState(authority.defaultOriginCode || 'DR');
  const [toCode, setToCode] = useState(authority.defaultDestCode || 'TNA');

  // Timing Modes: Depart Now / Depart Later / Arrive By
  const [timeMode, setTimeMode] = useState<'depart_now' | 'depart_later' | 'arrive_by'>('depart_now');
  const [journeyDate, setJourneyDate] = useState<'Today' | 'Tomorrow'>('Today');
  const [acOnly, setAcOnly] = useState(false);

  // Class & Route Preferences State & Modal
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<'all' | 'second' | 'first' | 'ac' | 'ladies'>('all');
  const [routePriority, setRoutePriority] = useState<'fastest' | 'least_transfers' | 'least_crowded'>('fastest');

  // Saved commute state from durable storage (rendered only when genuine saved commute exists)
  const [savedJourneys, setSavedJourneys] = useState<Array<{ fromCode: string; fromName: string; toCode: string; toName: string }>>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('railone_saved_journeys');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedJourneys(parsed);
        }
      }
    } catch {}
  }, []);

  // Sync station defaults
  useEffect(() => {
    setFromCode(authority.defaultOriginCode || 'DR');
    setToCode(authority.defaultDestCode || 'TNA');
  }, [authority.defaultOriginCode, authority.defaultDestCode]);

  const swapStations = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToJourney(fromCode, toCode);
  };

  // 4 Compact quick actions matching frozen visual contract
  const fourQuickActions = [
    { id: 'uts_local', label: 'Tickets', sub: 'UTS & Express', icon: Ticket, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { id: 'track_train', label: 'Live Status', sub: 'Departure Board', icon: Radio, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    { id: 'station_guide', label: 'Station Guide', sub: 'FOB & 2D Maps', icon: Compass, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'railsathi', label: 'RailSathi', sub: 'Voice & Chat', icon: Sparkles, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
  ];

  // Indian Suburban Departures with dynamic localization
  const activeDepartures = [
    { pf: 'PF 4', time: '10:45', name: `CSMT ${t.fastLocal}`, line: 'Central Fast', rake: '12-car', isAc: false, crowd: t.moderateCrowd },
    { pf: 'PF 1', time: '10:48', name: `Borivali ${t.slowLocal}`, line: 'Western Slow', rake: '15-car', isAc: true, crowd: t.lightCrowd },
    { pf: 'PF 5', time: '10:50', name: `Kalyan ${t.fastLocal}`, line: 'Central Fast', rake: '12-car', isAc: false, crowd: t.heavyCrowd },
    { pf: 'PF 3', time: '11:00', name: `Kalyan ${t.acLocal}`, line: 'Central AC', rake: '12-car AC', isAc: true, crowd: t.lightCrowd }
  ];

  return (
    <div className="space-y-3.5 pb-24 px-3.5 pt-2">
      
      {/* 1. Compact Sovereign Identity & Settings */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <InstitutionalInsignia authorityId="india" size={28} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {t.appName}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
              {t.ministryName}
            </div>
          </div>
        </div>

        {/* Selected City Pill & Currency */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onSelectCityClick}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-800 dark:text-slate-200 shadow-xs hover:border-theme-primary transition-all active:scale-95"
          >
            <MapPin className="w-3 h-3 text-theme-primary" />
            <span>{currentCity.name}</span>
            <span className="text-[9px] text-slate-400">▼</span>
          </button>
        </div>
      </div>

      {/* 2. Provenance Advisory Banner */}
      <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md font-mono text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            {currentCity.provenanceTag || '[TIMETABLE SCHEDULE]'}
          </span>
          <span className="text-slate-600 dark:text-slate-400 text-[10px] line-clamp-1">
            {currentCity.provenanceExplanation || 'Official timetable schedules active · Telemetry verified only when transponders online'}
          </span>
        </div>
      </div>

      {/* 3. Saved Commute Shortcut Card (Rendered ONLY when passenger genuinely has a saved journey) */}
      {savedJourneys.length > 0 && (
        <div
          onClick={() => {
            setFromCode(savedJourneys[0].fromCode);
            setToCode(savedJourneys[0].toCode);
          }}
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-theme-primary transition-all active:scale-98"
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 font-bold text-theme-primary">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SAVED COMMUTE SHORTCUT</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Quick Fill</span>
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-white">
            {savedJourneys[0].fromName} ➔ {savedJourneys[0].toName}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Tap to load route into journey search
          </div>
        </div>
      )}

      {/* 4. Compact Voice & Chat RailSathi Entry */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-500/30 shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-theme-primary flex items-center justify-center text-white shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black flex items-center gap-1.5">
              <span>RailSathi AI</span>
              <span className="px-1.5 py-0.2 rounded-full text-[8px] font-mono font-black bg-emerald-400 text-slate-950">
                Live
              </span>
            </div>
            <div className="text-[10px] text-cyan-200 truncate">
              "Book First-Class local from {fromCode} to {toCode}"
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              if (onOpenRailSathi) onOpenRailSathi();
              else onSwitchTab('help');
            }}
            className="py-1.5 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black shadow-xs flex items-center gap-1 transition-all active:scale-95"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Call</span>
          </button>
          <button
            onClick={() => {
              if (onOpenRailSathi) onOpenRailSathi();
              else onSwitchTab('help');
            }}
            className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold border border-white/20 flex items-center gap-1 transition-all active:scale-95"
          >
            <MessageSquare className="w-3 h-3 text-cyan-300" />
            <span>Chat</span>
          </button>
        </div>
      </div>

      {/* 5. Dominant Journey Search Card */}
      <div className="rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 shadow-xl border border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Train className="w-4 h-4 text-theme-primary" />
            <span>{t.findItineraries}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">Quad-Track Timetable</span>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-2.5">
          {/* Origin & Destination with Swap Button */}
          <div className="relative space-y-2">
            {/* Origin Input */}
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/10 dark:bg-slate-950/70 border border-white/15">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ml-1 shrink-0" />
              <div className="flex-1">
                <div className="text-[9px] uppercase font-bold text-slate-400">{t.fromStation}</div>
                <input
                  type="text"
                  value={fromCode}
                  onChange={(e) => setFromCode(e.target.value.toUpperCase())}
                  placeholder={t.fromPlaceholder}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Swap Floating Button */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
              <button
                type="button"
                onClick={swapStations}
                className="w-8 h-8 rounded-full bg-theme-primary text-white flex items-center justify-center shadow-lg border-2 border-slate-900 transition-transform active:rotate-180"
                title="Swap stations"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Destination Input */}
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/10 dark:bg-slate-950/70 border border-white/15">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400 ml-1 shrink-0" />
              <div className="flex-1">
                <div className="text-[9px] uppercase font-bold text-slate-400">{t.toStation}</div>
                <input
                  type="text"
                  value={toCode}
                  onChange={(e) => setToCode(e.target.value.toUpperCase())}
                  placeholder={t.toPlaceholder}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Timing Modes: Depart Now / Depart Later / Arrive By */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
            {(['depart_now', 'depart_later', 'arrive_by'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setTimeMode(mode)}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  timeMode === mode
                    ? 'bg-theme-primary text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'depart_now' ? 'Depart Now' : mode === 'depart_later' ? 'Depart Later' : 'Arrive By'}
              </button>
            ))}
          </div>

          {/* Date & Preference Sheet Button */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
              {(['Today', 'Tomorrow'] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setJourneyDate(d)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    journeyDate === d
                      ? 'bg-theme-primary text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Preferences Sheet Trigger Button */}
            <button
              type="button"
              onClick={() => setShowPrefModal(true)}
              className="ml-auto py-1 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[10px] font-bold text-cyan-300 flex items-center gap-1 transition-all active:scale-95"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{selectedClass !== 'all' ? selectedClass.toUpperCase() : 'Preferences'}</span>
            </button>
          </div>

          {/* AC Only Switch */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acOnly}
                onChange={(e) => setAcOnly(e.target.checked)}
                className="w-4 h-4 rounded text-theme-primary accent-blue-600 cursor-pointer"
              />
              <span>AC Services Only (Mumbai AC Local)</span>
            </label>
          </div>

          {/* Primary CTA Find Journey Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-theme-primary hover:bg-blue-600 font-bold text-xs text-white shadow-lg shadow-theme-primary/30 flex items-center justify-center gap-2 transition-all active:scale-98 min-h-[44px]"
          >
            <Search className="w-4 h-4" />
            <span>{t.findItineraries}</span>
          </button>
        </form>
      </div>

      {/* 6. Four Compact Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
            {t.quickActions}
          </span>
          <button
            onClick={() => onOpenActionModal('services_hub')}
            className="text-[10px] font-extrabold text-theme-primary hover:underline flex items-center gap-0.5"
          >
            <span>All 22 Services</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {fourQuickActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  if (action.id === 'railsathi') {
                    if (onOpenRailSathi) onOpenRailSathi();
                    else onSwitchTab('help');
                  } else if (action.id === 'track_train') {
                    onSwitchTab('live');
                  } else if (action.id === 'station_guide') {
                    onOpenActionModal('gods_eye', 'DR');
                  } else {
                    onOpenActionModal(action.id);
                  }
                }}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-1 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-95 min-h-[64px]"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${action.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {action.label}
                </span>
                <span className="text-[8px] text-slate-400 leading-none">
                  {action.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* 22-Services Catalog Banner Button */}
        <div className="pt-2">
          <button
            onClick={() => onOpenActionModal('services_hub')}
            className="w-full py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-theme-primary transition-all flex items-center justify-between shadow-xs active:scale-98"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-theme-primary/10 text-theme-primary flex items-center justify-center">
                <Grid className="w-3.5 h-3.5" />
              </div>
              <span>Explore All 22 Commuter & Transit Services</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-theme-primary text-white">
              Hub
            </span>
          </button>
        </div>
      </div>

      {/* 7. Glanceable Departure Board from Active Hub */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-theme-primary" />
            <span>{t.nextDepartures} · Dadar (DR)</span>
          </span>
          <button 
            onClick={() => onSwitchTab('live')}
            className="text-[10px] text-theme-primary font-bold hover:underline"
          >
            {t.liveBoard}
          </button>
        </div>

        <div className="space-y-1.5">
          {activeDepartures.map((dep, idx) => (
            <div 
              key={idx}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-black text-slate-700 dark:text-slate-300">
                  {dep.pf}
                </span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>{dep.name}</span>
                    {dep.isAc && (
                      <span className="text-[9px] px-1 rounded-sm bg-cyan-500/20 text-cyan-500 font-extrabold">AC</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">{dep.line} · {dep.rake}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-black text-slate-900 dark:text-slate-100">{dep.time}</div>
                <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{dep.crowd}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Key Transit Corridors (Mumbai Suburban Routes) */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
            {t.primaryCorridors}
          </span>
          <span className="text-[10px] text-slate-400">{t.officialRoutes}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { from: 'CCG', to: 'BVI', name: 'Western Line', desc: 'Churchgate ➔ Borivali (Slow/Fast)' },
            { from: 'CSMT', to: 'KYN', name: 'Central Main Line', desc: 'CSMT ➔ Kalyan (Slow/Fast)' },
            { from: 'CSMT', to: 'PNVL', name: 'Harbour Line', desc: 'CSMT ➔ Panvel Direct' },
            { from: 'TNA', to: 'VSH', name: 'Trans-Harbour', desc: 'Thane ➔ Vashi / Nerul' }
          ].map((c, i) => (
            <button
              key={i}
              onClick={() => onNavigateToJourney(c.from, c.to)}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-theme-primary transition-all active:scale-95"
            >
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span className="truncate pr-1">{c.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{c.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Class & Route Preference Bottom Sheet Modal */}
      {showPrefModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-900 dark:text-white">
                Class & Route Preferences
              </div>
              <button
                onClick={() => setShowPrefModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Travel Class Section */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Accommodation Class:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All Classes' },
                  { id: 'second', label: 'Second Class (II)' },
                  { id: 'first', label: 'First Class (I)' },
                  { id: 'ac', label: 'AC Local' },
                  { id: 'ladies', label: 'Ladies Compartment' }
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedClass(c.id as any)}
                    className={`p-2.5 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all ${
                      selectedClass === c.id
                        ? 'border-theme-primary bg-theme-primary/10 text-theme-primary'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span>{c.label}</span>
                    {selectedClass === c.id && <Check className="w-3.5 h-3.5 text-theme-primary" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Route Priority Section */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Optimization Priority:
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'fastest', label: 'Fastest' },
                  { id: 'least_transfers', label: 'Direct First' },
                  { id: 'least_crowded', label: 'Less Crowd' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setRoutePriority(p.id as any)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                      routePriority === p.id
                        ? 'border-theme-primary bg-theme-primary/10 text-theme-primary'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setShowPrefModal(false)}
              className="w-full py-3 rounded-2xl bg-theme-primary text-white font-bold text-xs shadow-md transition-all active:scale-98"
            >
              Apply Preferences
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
