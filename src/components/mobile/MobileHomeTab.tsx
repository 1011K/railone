import React, { useState, useEffect } from 'react';
import { CITIES_REGISTRY, CityCoverageConfig } from '../../fixtures/citiesData';
import { useAuthority } from '../AuthorityContext';
import { InstitutionalInsignia } from '../common/InstitutionalInsignia';
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
  FileText,
  Building2
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
  const { authority } = useAuthority();
  const [fromCode, setFromCode] = useState(authority.defaultOriginCode);
  const [toCode, setToCode] = useState(authority.defaultDestCode);

  // Sync station defaults when authority changes
  useEffect(() => {
    setFromCode(authority.defaultOriginCode);
    setToCode(authority.defaultDestCode);
  }, [authority.id, authority.defaultOriginCode, authority.defaultDestCode]);

  const swapStations = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToJourney(fromCode, toCode);
  };

  // Quick action items
  const quickActions = [
    { id: 'uts_local', label: 'Unreserved Pass', icon: Ticket, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { id: 'express_reserved', label: 'Reserved Transit', icon: Train, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { id: 'platform_ticket', label: 'Platform Permit', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'season_pass', label: 'Commuter Pass', icon: FileText, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { id: 'wallet', label: 'Transit Wallet', icon: Wallet, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    { id: 'track_train', label: 'Live Telemetry', icon: Radio, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    { id: 'coach_guide', label: 'Coach Position', icon: Layers, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
    { id: 'gods_eye', label: 'Interchange FOB', icon: Compass, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  ];

  // Dynamic Authority Departures
  const departuresByAuthority: Record<string, Array<{ pf: string; time: string; name: string; line: string; rake: string; isAc: boolean; crowd: string }>> = {
    india: [
      { pf: 'PF 4', time: '10:45', name: 'CSMT Fast Local', line: 'Central Fast', rake: '12-car', isAc: false, crowd: 'Moderate' },
      { pf: 'PF 1', time: '10:48', name: 'Borivali Slow Local', line: 'Western Slow', rake: '15-car', isAc: true, crowd: 'Light' },
      { pf: 'PF 5', time: '10:50', name: 'Kalyan Fast Local', line: 'Central Fast', rake: '12-car', isAc: false, crowd: 'Heavy' },
      { pf: 'PF 3', time: '11:00', name: 'Kalyan AC Fast Local', line: 'Central AC', rake: '12-car AC', isAc: true, crowd: 'Light' }
    ],
    uk: [
      { pf: 'PF 2', time: '10:45', name: 'Portsmouth Harbour Fast', line: 'South Western Main', rake: '10-Car Desiro', isAc: true, crowd: 'Moderate' },
      { pf: 'PF 7', time: '10:50', name: 'Reading Elizabeth Line', line: 'Elizabeth Line', rake: '9-Car Class 345', isAc: true, crowd: 'Light' },
      { pf: 'PF 4', time: '10:55', name: 'Edinburgh Waverley Azuma', line: 'East Coast Main', rake: '9-Car Azuma 800', isAc: true, crowd: 'Light' },
      { pf: 'PF 1', time: '11:05', name: 'Manchester Piccadilly', line: 'West Coast Main', rake: '11-Car Pendolino', isAc: true, crowd: 'Moderate' }
    ],
    japan: [
      { pf: 'PF 4', time: '10:45', name: 'Yamanote Line (Inner Loop)', line: 'Yamanote Circular', rake: '11-Car E235', isAc: true, crowd: 'Heavy' },
      { pf: 'PF 14', time: '10:50', name: 'Nozomi 225 (Shin-Osaka)', line: 'Tokaido Shinkansen', rake: '16-Car N700S', isAc: true, crowd: 'Light' },
      { pf: 'PF 1', time: '10:52', name: 'Chūō Rapid Express', line: 'Chūō Rapid Line', rake: '12-Car E233', isAc: true, crowd: 'Moderate' },
      { pf: 'PF 21', time: '11:00', name: 'Hayabusa 19 (Shin-Aomori)', line: 'Tohoku Shinkansen', rake: '10-Car E5 Series', isAc: true, crowd: 'Light' }
    ],
    switzerland: [
      { pf: 'PF 31', time: '10:47', name: 'IC 1 (Genève-Aéroport)', line: 'InterCity Trunk', rake: '8-Car FV-Dosto', isAc: true, crowd: 'Light' },
      { pf: 'PF 3', time: '10:52', name: 'S12 (Brugg AG - Winterthur)', line: 'S-Bahn Zürich', rake: '6-Car Regio Dosto', isAc: true, crowd: 'Moderate' },
      { pf: 'PF 8', time: '11:02', name: 'EC Giruno (Milano Centrale)', line: 'Gotthard Base Route', rake: '11-Car EC 250', isAc: true, crowd: 'Light' },
      { pf: 'PF 14', time: '11:10', name: 'IR 75 (Luzern Direct)', line: 'InterRegio Express', rake: '8-Car Twindexx', isAc: true, crowd: 'Moderate' }
    ],
    germany: [
      { pf: 'PF 1', time: '10:45', name: 'ICE 1005 Sprinter (München Hbf)', line: 'VDE 8 Schnellfahrstrecke', rake: '12-Car ICE 4', isAc: true, crowd: 'Light' },
      { pf: 'PF 15', time: '10:50', name: 'S7 (Potsdam Hauptbahnhof)', line: 'S-Bahn Berlin Stadtbahn', rake: '8-Car BR 483', isAc: true, crowd: 'Moderate' },
      { pf: 'PF 2', time: '10:58', name: 'RE 1 (Magdeburg Hbf)', line: 'Regional-Express Ost', rake: '6-Car Desiro HC', isAc: true, crowd: 'Moderate' },
      { pf: 'PF 6', time: '11:06', name: 'ICE 800 (Hamburg Hbf)', line: 'ICE Nord-Süd', rake: '13-Car ICE 4 XXL', isAc: true, crowd: 'Light' }
    ]
  };

  const activeDepartures = departuresByAuthority[authority.id] || departuresByAuthority.india;

  return (
    <div className="space-y-4 pb-20 px-3.5 pt-2">
      
      {/* 1. Sovereign Transport Authority Banner */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <InstitutionalInsignia authorityId={authority.id} size={32} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {authority.shortTitle}
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-theme-primary/10 text-theme-primary border border-theme-primary/20">
                {authority.countryCode}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
              {authority.governmentBody}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>STATUTORY ACTIVE</span>
        </div>
      </div>

      {/* 2. City & Live Status Header Pill (for India) or Regional Hub selector */}
      <div className="flex items-center justify-between">
        {authority.id === 'india' ? (
          <button
            onClick={onSelectCityClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs hover:border-theme-primary transition-all active:scale-95"
          >
            <MapPin className="w-3.5 h-3.5 text-theme-primary" />
            <span>{currentCity.name}</span>
            <span className="text-[10px] text-slate-400 font-normal">({currentCity.nativeName})</span>
            <span className="text-[9px] text-slate-400 ml-0.5">▼</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100">
            <Building2 className="w-3.5 h-3.5 text-theme-primary" />
            <span>{authority.countryName} National Corridor</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold">
          <span>{authority.currency.code} ({authority.currency.symbol})</span>
        </div>
      </div>

      {/* 3. Main Journey Search Card */}
      <div className="rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 shadow-xl border border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Train className="w-4 h-4 text-theme-primary" />
            <span>{authority.shortTitle} Timetable & Fare Engine</span>
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
                  placeholder={`e.g. ${authority.defaultOriginCode}`}
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
                  placeholder={`e.g. ${authority.defaultDestCode}`}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-theme-primary hover:bg-blue-600 font-bold text-xs text-white shadow-lg shadow-theme-primary/30 flex items-center justify-center gap-2 transition-all active:scale-98 min-h-[44px]"
          >
            <Search className="w-4 h-4" />
            <span>Find Verified Itineraries</span>
          </button>
        </form>
      </div>

      {/* 4. Quick Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
            {authority.shortTitle} Services
          </span>
          <span className="text-[10px] text-slate-400">One-Tap Action</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onOpenActionModal(action.id)}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-1.5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-95 min-h-[64px]"
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

      {/* 5. Sectional Advisory Ticker */}
      <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-theme-primary shrink-0 mt-0.5" />
        <div className="text-[11px] leading-tight">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-theme-primary/20 text-theme-primary">
              [GOVERNMENT ADVISORY]
            </span>
            <span className="font-bold text-slate-900 dark:text-white">Transit Operations Dispatch</span>
          </div>
          <span className="text-slate-700 dark:text-slate-300">
            All rail operations running under {authority.statutoryAct}. Passenger safety and scheduled headway guaranteed by {authority.operatingAgency}.
          </span>
        </div>
      </div>

      {/* 6. Glanceable Departure Board from Active Hub */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-theme-primary" />
            <span>Next Departures · {authority.stations[0]?.name || 'Central Terminal'}</span>
          </span>
          <button 
            onClick={() => onSwitchTab('live')}
            className="text-[10px] text-theme-primary font-bold hover:underline"
          >
            Live Board ➔
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

      {/* 7. Key Transit Corridors */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
            {authority.shortTitle} Primary Corridors
          </span>
          <span className="text-[10px] text-slate-400">Official Routes</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {authority.corridors.map((c, i) => (
            <button
              key={i}
              onClick={() => onNavigateToJourney(c.from, c.to)}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-theme-primary transition-all active:scale-95"
            >
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span className="truncate pr-1">{c.name.split('(')[0]}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{c.serviceType}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
