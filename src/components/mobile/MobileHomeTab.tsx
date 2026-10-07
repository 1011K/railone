import React, { useState } from 'react';
import { CITIES_REGISTRY, CityCoverageConfig } from '../../fixtures/citiesData';
import { 
  Train, 
  MapPin, 
  ArrowRightLeft, 
  Search, 
  Clock, 
  Ticket, 
  Wallet, 
  ShieldCheck, 
  AlertTriangle, 
  Compass, 
  Layers, 
  ChevronRight, 
  Sparkles,
  Zap,
  Radio,
  FileText
} from 'lucide-react';

import { PassengerNavTab } from '../common/BottomNavigation';

interface MobileHomeTabProps {
  currentCity: CityCoverageConfig;
  onSelectCityClick: () => void;
  onNavigateToJourney: (fromCode: string, toCode: string) => void;
  onOpenActionModal: (action: string, payload?: any) => void;
  onSwitchTab: (tab: PassengerNavTab) => void;
}

export const MobileHomeTab: React.FC<MobileHomeTabProps> = ({
  currentCity,
  onSelectCityClick,
  onNavigateToJourney,
  onOpenActionModal,
  onSwitchTab
}) => {
  const [fromCode, setFromCode] = useState('TNA');
  const [toCode, setToCode] = useState('CSMT');

  const swapStations = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToJourney(fromCode, toCode);
  };

  // Quick action items matching competitor feature set
  const quickActions = [
    { id: 'uts_local', label: 'Unreserved UTS', icon: Ticket, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { id: 'express_reserved', label: 'Reserved PRS', icon: Train, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { id: 'platform_ticket', label: 'Platform Ticket', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'season_pass', label: 'Season Pass (MST)', icon: FileText, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { id: 'wallet', label: 'R-Wallet', icon: Wallet, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    { id: 'track_train', label: 'Live Tracking', icon: Radio, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    { id: 'coach_guide', label: 'Coach Guide', icon: Layers, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
    { id: 'gods_eye', label: "3D Station FOB", icon: Compass, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div className="space-y-4 pb-20 px-3.5 pt-2">
      
      {/* City & Live Status Header Pill */}
      <div className="flex items-center justify-between">
        <button
          onClick={onSelectCityClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs hover:border-theme-primary transition-all active:scale-95"
        >
          <MapPin className="w-3.5 h-3.5 text-theme-primary" />
          <span>{currentCity.name}</span>
          <span className="text-[10px] text-slate-400 font-normal">({currentCity.nativeName})</span>
          <span className="text-[9px] text-slate-400 ml-0.5">▼</span>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{currentCity.provenanceTag}</span>
        </div>
      </div>

      {/* Main Journey Search Card */}
      <div className="rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 shadow-xl border border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Train className="w-4 h-4 text-theme-primary" />
            <span>Search Passenger Services</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">Quad-Track Timetable</span>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-2.5">
          {/* Origin & Destination with Swap Button */}
          <div className="relative space-y-2">
            {/* Origin Input */}
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/10 dark:bg-slate-950/70 border border-white/15">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ml-1" />
              <div className="flex-1">
                <div className="text-[9px] uppercase font-bold text-slate-400">From Station</div>
                <input
                  type="text"
                  value={fromCode}
                  onChange={(e) => setFromCode(e.target.value.toUpperCase())}
                  placeholder="e.g. TNA, Thane, दादर"
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
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400 ml-1" />
              <div className="flex-1">
                <div className="text-[9px] uppercase font-bold text-slate-400">To Station</div>
                <input
                  type="text"
                  value={toCode}
                  onChange={(e) => setToCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CSMT, Churchgate, कल्याण"
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-theme-primary hover:bg-blue-600 font-bold text-xs text-white shadow-lg shadow-theme-primary/30 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Search className="w-4 h-4" />
            <span>Find Verified Itineraries</span>
          </button>
        </form>
      </div>

      {/* Quick Actions Grid (UTS, Reserved, Platform, Pass, Wallet, Track, Coach, 3D) */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Transit & Ticketing Services</span>
          <span className="text-[10px] text-slate-400">One-Tap Action</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onOpenActionModal(action.id)}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-1.5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-95"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${action.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sectional Advisory Ticker with Provenance */}
      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-tight">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
              [SIMULATED SCENARIO]
            </span>
            <span className="font-bold text-amber-800 dark:text-amber-300">Sectional Delay Advisory</span>
          </div>
          <span className="text-amber-900/80 dark:text-amber-200/80">
            Slow Local 97045 running on through track. Fast Local 95112 held +22m at Kurla. Slow local recommended for Dadar/CSMT.
          </span>
        </div>
      </div>

      {/* Glanceable Departure Board from Major Hub */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-theme-primary" />
            <span>Next Departures · Dadar (DR)</span>
          </span>
          <button 
            onClick={() => onSwitchTab('live')}
            className="text-[10px] text-theme-primary font-bold hover:underline"
          >
            Live Board ➔
          </button>
        </div>

        <div className="space-y-1.5">
          {[
            { pf: 'PF 4', time: '10:45', name: 'CSMT Fast Local', line: 'Central Fast', rake: '12-car', isAc: false, crowd: 'Moderate' },
            { pf: 'PF 1', time: '10:48', name: 'Borivali Slow Local', line: 'Western Slow', rake: '15-car', isAc: true, crowd: 'Light' },
            { pf: 'PF 5', time: '10:50', name: 'Kalyan Fast Local', line: 'Central Fast', rake: '12-car', isAc: false, crowd: 'Heavy' },
            { pf: 'PF 3', time: '11:00', name: 'Kalyan AC Fast Local', line: 'Central AC', rake: '12-car AC', isAc: true, crowd: 'Light' },
          ].map((dep, idx) => (
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

      {/* Saved Frequent Commutes */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Frequent Commutes</span>
          <span className="text-[10px] text-slate-400">Quick Route</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { from: 'TNA', to: 'CCG', label: 'Thane ➔ Churchgate', desc: 'Via Dadar Interchange' },
            { from: 'ADH', to: 'DR', label: 'Andheri ➔ Dadar', desc: 'Western Fast Local' },
            { from: 'KYN', to: 'CSMT', label: 'Kalyan ➔ CSMT', desc: 'Central Fast Corridor' },
            { from: 'PNVL', to: 'CSMT', label: 'Panvel ➔ CSMT', desc: 'Harbour Line Slow' }
          ].map((commute, i) => (
            <button
              key={i}
              onClick={() => onNavigateToJourney(commute.from, commute.to)}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-theme-primary transition-all active:scale-95"
            >
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>{commute.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{commute.desc}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
