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
  Wallet, 
  ShieldCheck, 
  Compass, 
  Layers, 
  ChevronRight, 
  Sparkles,
  Zap,
  Radio,
  FileText,
  PhoneCall,
  MessageSquare,
  Grid
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

  // Quick action items (All India / Suburban specific)
  const quickActions = [
    { id: 'uts_local', label: t.unreservedPass, icon: Ticket, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { id: 'express_reserved', label: t.reservedTransit, icon: Train, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { id: 'platform_ticket', label: t.platformPermit, icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'season_pass', label: t.seasonPass, icon: FileText, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { id: 'wallet', label: t.transitWallet, icon: Wallet, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    { id: 'track_train', label: t.liveTelemetry, icon: Radio, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    { id: 'coach_guide', label: t.coachPosition, icon: Layers, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
    { id: 'station_guide', label: t.stationGuide, icon: Compass, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  ];

  // Indian Suburban Departures with dynamic localization
  const activeDepartures = [
    { pf: 'PF 4', time: '10:45', name: `CSMT ${t.fastLocal}`, line: 'Central Fast', rake: '12-car', isAc: false, crowd: t.moderateCrowd },
    { pf: 'PF 1', time: '10:48', name: `Borivali ${t.slowLocal}`, line: 'Western Slow', rake: '15-car', isAc: true, crowd: t.lightCrowd },
    { pf: 'PF 5', time: '10:50', name: `Kalyan ${t.fastLocal}`, line: 'Central Fast', rake: '12-car', isAc: false, crowd: t.heavyCrowd },
    { pf: 'PF 3', time: '11:00', name: `Kalyan ${t.acLocal}`, line: 'Central AC', rake: '12-car AC', isAc: true, crowd: t.lightCrowd }
  ];

  return (
    <div className="space-y-4 pb-24 px-3.5 pt-2">
      
      {/* 1. Indian Railways Sovereign Authority Banner (Strictly India Only) */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <InstitutionalInsignia authorityId="india" size={30} />
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

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t.statutoryActive}</span>
        </div>
      </div>

      {/* 2. PROMINENT RAIL YATRI / ONE-CALL VOICE ASSISTANT HERO CARD */}
      <div className="p-3.5 rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-500/30 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-theme-primary flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-black flex items-center gap-1.5">
                <span>{t.railYatriTitle}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[8px] font-mono font-black bg-emerald-400 text-slate-950">
                  {t.oneCallBadge}
                </span>
              </div>
              <div className="text-[10px] text-cyan-200">
                {t.railYatriSubtitle}
              </div>
            </div>
          </div>
        </div>

        {/* Rail Yatri One-Call and Chat Action Chips */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              if (onOpenRailSathi) onOpenRailSathi();
              else onSwitchTab('help');
            }}
            className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Rail Yatri</span>
          </button>
          <button
            onClick={() => {
              if (onOpenRailSathi) onOpenRailSathi();
              else onSwitchTab('help');
            }}
            className="flex-1 py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
            <span>Chat Assistant</span>
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px]">
          <button
            onClick={() => {
              if (onOpenRailSathi) onOpenRailSathi();
              else onSwitchTab('help');
            }}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-cyan-200 border border-white/10 whitespace-nowrap active:scale-95"
          >
            "{t.bookFastLocalDadarThane}"
          </button>
          <button
            onClick={() => {
              if (onOpenRailSathi) onOpenRailSathi();
              else onSwitchTab('help');
            }}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-cyan-200 border border-white/10 whitespace-nowrap active:scale-95"
          >
            "{t.bookSecondThaneCsmt}"
          </button>
        </div>
      </div>

      {/* 3. City & Live Status Header Pill (Indian Metropolitan Networks) */}
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

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold">
          <span>INR (₹)</span>
        </div>
      </div>

      {/* 4. Main Journey Search Card */}
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
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ml-1" />
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
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400 ml-1" />
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

          {/* Search Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-theme-primary hover:bg-blue-600 font-bold text-xs text-white shadow-lg shadow-theme-primary/30 flex items-center justify-center gap-2 transition-all active:scale-98 min-h-[44px]"
          >
            <Search className="w-4 h-4" />
            <span>{t.findItineraries}</span>
          </button>
        </form>
      </div>

      {/* 5. Quick Actions Grid */}
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
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  if (action.id === 'station_guide') {
                    onOpenActionModal('gods_eye', 'DR');
                  } else {
                    onOpenActionModal(action.id);
                  }
                }}
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

      {/* 6. Glanceable Departure Board from Active Hub */}
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

      {/* 7. Key Transit Corridors (Mumbai Suburban Routes) */}
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

    </div>
  );
};
