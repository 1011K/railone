import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { 
  Train, 
  Navigation, 
  MapPin, 
  Search, 
  ArrowRight, 
  Clock, 
  Radio, 
  Zap, 
  Compass, 
  Ticket, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Mic, 
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';

interface HomePassengerViewProps {
  onNavigateTab: (tab: string, params?: { origin?: string; dest?: string }) => void;
  onOpenStationGodsEye?: (stationCode: string) => void;
  onOpenThemeModal?: () => void;
}

export const HomePassengerView: React.FC<HomePassengerViewProps> = ({
  onNavigateTab,
  onOpenStationGodsEye,
  onOpenThemeModal
}) => {
  const { language } = useTheme();
  const [origin, setOrigin] = useState('TNA');
  const [destination, setDestination] = useState('CSMT');

  const popularStations = [
    { code: 'CSMT', name: 'CSMT', line: 'Central' },
    { code: 'CCG', name: 'Churchgate', line: 'Western' },
    { code: 'DR', name: 'Dadar Jn', line: 'Interchange' },
    { code: 'TNA', name: 'Thane', line: 'Central' },
    { code: 'BVI', name: 'Borivali', line: 'Western' },
    { code: 'ADH', name: 'Andheri', line: 'WR + Metro 1' },
    { code: 'KYN', name: 'Kalyan', line: 'Central' },
    { code: 'PNVL', name: 'Panvel', line: 'Harbour' }
  ];

  const hubDepartures = [
    { hub: 'Dadar (DR)', pf: 'PF 3', time: '10:42', train: 'Fast Local to CSMT', line: 'Central', type: 'Fast', isAc: false, crowd: 'Moderate' },
    { hub: 'Dadar (DR)', pf: 'PF 1', time: '10:45', train: 'Slow Local to Borivali', line: 'Western', type: 'Slow', isAc: true, crowd: 'Light' },
    { hub: 'Thane (TNA)', pf: 'PF 5', time: '10:44', train: 'Fast Local to CSMT', line: 'Central', type: 'Fast', isAc: false, crowd: 'Heavy' },
    { hub: 'Andheri (ADH)', pf: 'PF 4', time: '10:47', train: 'Fast Local to Churchgate', line: 'Western', type: 'Fast', isAc: true, crowd: 'Moderate' },
    { hub: 'Ghatkopar (GHT)', pf: 'Metro PF 1', time: '10:43', train: 'Line 1 Metro to Versova', line: 'Metro', type: 'Metro AC', isAc: true, crowd: 'Moderate' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateTab('journey', { origin, dest: destination });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Hero Search Section */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-700/80">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-theme-primary/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-theme-primary/20 text-blue-300 border border-theme-primary/40">
            <ShieldCheck className="w-4 h-4 text-theme-primary" />
            <span>Indian Railways Institutional Transit Benchmark</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Mumbai Suburban & National Rail Passenger Hub
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Instant journey planning across Western, Central, Harbour and Mumbai Metro networks. Real delay inversion rerouting, step-free platform wayfinding, and transparent ticketing rules.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="pt-2">
            <div className="bg-white/10 dark:bg-slate-900/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/15 shadow-2xl flex flex-col md:flex-row gap-3">
              
              {/* Origin Station */}
              <div className="flex-1 space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>From Station</span>
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                  placeholder="e.g. TNA or Thane"
                  className="w-full bg-white/10 text-white px-3.5 py-2.5 rounded-xl text-sm font-bold placeholder-slate-400 border border-white/20 focus:outline-none focus:border-theme-primary min-h-[44px]"
                  aria-label="Departure station code or name"
                />
              </div>

              {/* Direction Indicator */}
              <div className="hidden md:flex items-center justify-center pt-5 text-slate-400">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Destination Station */}
              <div className="flex-1 space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>To Station</span>
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase())}
                  placeholder="e.g. CSMT or Churchgate"
                  className="w-full bg-white/10 text-white px-3.5 py-2.5 rounded-xl text-sm font-bold placeholder-slate-400 border border-white/20 focus:outline-none focus:border-theme-primary min-h-[44px]"
                  aria-label="Destination station code or name"
                />
              </div>

              {/* Submit CTA */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-theme-primary hover-bg-theme-primary text-white font-extrabold text-sm transition-all shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Trains</span>
                </button>
              </div>

            </div>

            {/* Quick Station Chips */}
            <div className="flex items-center gap-2 pt-3 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold">Popular Hubs:</span>
              {popularStations.map((st) => (
                <button
                  type="button"
                  key={st.code}
                  onClick={() => setOrigin(st.code)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors border border-white/10 min-h-[32px]"
                >
                  {st.name} <span className="text-[10px] opacity-60">({st.code})</span>
                </button>
              ))}
            </div>

          </form>

        </div>
      </div>

      {/* Network Live Corridor Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Western Suburban</div>
              <div className="text-[10px] text-slate-500">Churchgate – Dahanu</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            ON TIME
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Central Main Line</div>
              <div className="text-[10px] text-slate-500">CSMT – Kalyan – Kasara</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            +14m DELAY
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Harbour & Trans-H.</div>
              <div className="text-[10px] text-slate-500">CSMT – Panvel / Thane – Vashi</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            NORMAL
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0" />
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Mumbai Metro (4 Lines)</div>
              <div className="text-[10px] text-slate-500">Lines 1, 2A, 7, 3 (Aqua)</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
            4-6m HEADWAY
          </span>
        </div>
      </div>

      {/* Primary Commuter Modules Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Core Passenger Transit Modules</span>
          <span className="text-xs font-normal text-slate-500">Suburban & National Railway Services</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Journey Planner */}
          <div 
            onClick={() => onNavigateTab('journey')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-theme-primary cursor-pointer transition-all space-y-3 shadow-xs hover:shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-theme-light text-theme-primary flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Train className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-theme-primary transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Plan Journey & Route Decision
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Smart timetable routing with live delay inversion (choosing on-time Slows over delayed Fasts) and AC-only filtering.
              </p>
            </div>
            <div className="text-[11px] font-bold text-theme-primary flex items-center gap-1 pt-1">
              <span>Find Suburban & Metro routes</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 2: Interactive Network Map */}
          <div 
            onClick={() => onNavigateTab('status')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-theme-primary cursor-pointer transition-all space-y-3 shadow-xs hover:shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-theme-light text-theme-primary flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Navigation className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-theme-primary transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Network Map & Train Status
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Interactive 2D & 3D Isometric schematic map with anti-distortion labels, Pan-India trunk stations, and line congestion.
              </p>
            </div>
            <div className="text-[11px] font-bold text-theme-primary flex items-center gap-1 pt-1">
              <span>Inspect track bottlenecks & trains</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 3: My Tickets & Wallet */}
          <div 
            onClick={() => onNavigateTab('tickets')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-theme-primary cursor-pointer transition-all space-y-3 shadow-xs hover:shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Ticket className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                My Tickets & Refund Wallet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Active tickets with UTS QR codes, monthly season passes (MST), and instant cancellation with zero deduction.
              </p>
            </div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
              <span>Manage bookings & view passes</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 4: 3D God's Eye Station Wayfinding */}
          <div 
            onClick={() => onOpenStationGodsEye ? onOpenStationGodsEye('DR') : onNavigateTab('status')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-theme-primary cursor-pointer transition-all space-y-3 shadow-xs hover:shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                God's Eye 3D Station Wayfinding
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Step-by-step pedestrian navigation across Dadar, Kurla, CSMT, Andheri, and Thane with elevator-equipped FOB routes.
              </p>
            </div>
            <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 pt-1">
              <span>Explore Dadar & Andheri 3D models</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 5: RailSathi & Help */}
          <div 
            onClick={() => onNavigateTab('help')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-theme-primary cursor-pointer transition-all space-y-3 shadow-xs hover:shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Help & RailSathi Assistant
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Multilingual station query assistant (English, Hindi, Marathi) and RailMadad formal grievance complaint drafter.
              </p>
            </div>
            <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1 pt-1">
              <span>Voice assistant & passenger grievance</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 6: Appearance & Theming */}
          <div 
            onClick={onOpenThemeModal}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-theme-primary cursor-pointer transition-all space-y-3 shadow-xs hover:shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Appearance & Theme Palettes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Choose from 8 authentic Indian Railways liveries (Rajdhani Crimson, Vande Bharat Ocean, Heritage Gold) with WCAG AA/AAA compliance.
              </p>
            </div>
            <div className="text-[11px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1 pt-1">
              <span>Customize rail colors & contrast</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

        </div>
      </div>

      {/* Glanceable Hub Departures Board */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-theme-primary" />
              <span>Next Departures from Key Interchange Terminals</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live scheduled departures and platform allocations across Mumbai suburban hubs.
            </p>
          </div>
          <button 
            onClick={() => onNavigateTab('status')}
            className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
          >
            <span>Live Tracker</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {hubDepartures.map((d, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{d.hub}</span>
                  <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 rounded font-bold text-slate-700 dark:text-slate-300">
                    {d.pf}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  {d.train}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-black text-sm text-slate-900 dark:text-white tabular-nums">
                  {d.time}
                </div>
                <div className={`text-[10px] font-bold ${d.isAc ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`}>
                  {d.isAc ? 'AC Local' : d.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
