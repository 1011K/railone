import React, { useState, useEffect, useMemo } from 'react';
import { CITIES_REGISTRY, CityCoverageConfig } from '../../fixtures/citiesData';
import { useAuthority } from '../AuthorityContext';
import { InstitutionalInsignia } from '../common/InstitutionalInsignia';
import { useTheme } from '../ThemeContext';
import { getTranslation } from '../../i18n/translations';
import { ALL_22_SERVICES, ServiceItem } from '../ServicesHubModal';
import { MockBookingStore } from '../../engine/mockBookingStore';
import { resolveStation } from '../../engine/journeyEngine';
import { normalizeStation } from '../../engine/stationNormalizer';
import { STATIONS } from '../../fixtures/railwayData';
import { Station } from '../../types/railway';
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
  Grid,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Info,
  Calendar,
  Filter,
  X
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

const SERVICE_SHORT_LABELS: Record<string, string> = {
  unreserved_tickets: 'Unreserved UTS',
  reserved_tickets: 'Reserved PRS',
  platform_permits: 'Platform Ticket',
  season_passes: 'Season Pass',
  metro_ticketing: 'Metro QR',
  my_tickets_qr: 'My Tickets',
  wallet_recharge: 'RailWallet',
  cancellation_refunds: 'Refunds',
  journey_planning: 'Door-to-Door',
  train_running_status: 'Track Train',
  crowd_delay_insights: 'Live Delays',
  station_navigation_2d: 'Station 2D',
  coach_positioning: 'Coach Guide',
  railyatri_voice_chat: 'RailSathi AI',
  railmadad_help: 'RailMadad 139',
  food_station_amenities: 'e-Catering',
  nearest_station: 'Nearby Hubs',
  network_maps: 'Network Maps',
  pnr_status: 'PNR Status',
  accessibility_assistance: 'Divyangjan',
  disruption_weather: 'Weather/Blocks',
  travel_feedback: 'Feedback'
};

export const MobileHomeTab: React.FC<MobileHomeTabProps> = ({
  currentCity,
  onSelectCityClick,
  onNavigateToJourney,
  onOpenActionModal,
  onSwitchTab,
  onOpenRailSathi
}) => {
  const { authority } = useAuthority();
  const { language, setLanguage, isDark, toggleDarkMode } = useTheme();
  const t = getTranslation(language);

  // Search station state
  const [fromCode, setFromCode] = useState(authority.defaultOriginCode || 'DR');
  const [toCode, setToCode] = useState(authority.defaultDestCode || 'TNA');
  const [fromInputText, setFromInputText] = useState(authority.defaultOriginCode || 'DR');
  const [toInputText, setToInputText] = useState(authority.defaultDestCode || 'TNA');
  const [fromSuggestions, setFromSuggestions] = useState<Station[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Station[]>([]);
  const [journeyDate, setJourneyDate] = useState<'today' | 'tomorrow'>('today');
  const [acOnly, setAcOnly] = useState(false);

  // Services Directory controls
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ticketing' | 'navigation' | 'assistance' | 'insights'>('all');
  const [serviceSearch, setServiceSearch] = useState('');
  const [externalGatedNotice, setExternalGatedNotice] = useState<ServiceItem | null>(null);

  // Real application state for upcoming / saved journeys
  const [savedBookings, setSavedBookings] = useState<any[]>([]);

  useEffect(() => {
    const origin = authority.defaultOriginCode || 'DR';
    const dest = authority.defaultDestCode || 'TNA';
    setFromCode(origin);
    setToCode(dest);
    setFromInputText(origin);
    setToInputText(dest);
  }, [authority.defaultOriginCode, authority.defaultDestCode]);

  useEffect(() => {
    // Only fetch real user bookings from MockBookingStore
    const realBookings = MockBookingStore.listBookings();
    setSavedBookings(realBookings);
  }, []);

  const swapStations = () => {
    const temp = fromCode;
    const tempText = fromInputText;
    setFromCode(toCode);
    setFromInputText(toInputText);
    setToCode(temp);
    setToInputText(tempText);
    setFromSuggestions([]);
    setToSuggestions([]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToJourney(fromCode, toCode);
  };

  // Reconciled 22 Services mapped to pastel design tokens
  const serviceStyleMap: Record<string, { bg: string; text: string; border: string }> = {
    unreserved_tickets: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200/80 dark:border-amber-800/40'
    },
    reserved_tickets: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200/80 dark:border-blue-800/40'
    },
    platform_permits: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200/80 dark:border-emerald-800/40'
    },
    season_passes: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200/80 dark:border-purple-800/40'
    },
    metro_ticketing: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/40',
      text: 'text-cyan-700 dark:text-cyan-300',
      border: 'border-cyan-200/80 dark:border-cyan-800/40'
    },
    my_tickets_qr: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200/80 dark:border-indigo-800/40'
    },
    wallet_recharge: {
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      text: 'text-teal-700 dark:text-teal-300',
      border: 'border-teal-200/80 dark:border-teal-800/40'
    },
    cancellation_refunds: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200/80 dark:border-rose-800/40'
    },
    journey_planning: {
      bg: 'bg-sky-50 dark:bg-sky-950/40',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-200/80 dark:border-sky-800/40'
    },
    pnr_status: {
      bg: 'bg-violet-50 dark:bg-violet-950/40',
      text: 'text-violet-700 dark:text-violet-300',
      border: 'border-violet-200/80 dark:border-violet-800/40'
    },
    train_running_status: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200/80 dark:border-rose-800/40'
    },
    coach_positioning: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/40',
      text: 'text-cyan-700 dark:text-cyan-300',
      border: 'border-cyan-200/80 dark:border-cyan-800/40'
    },
    station_navigation_2d: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200/80 dark:border-emerald-800/40'
    },
    food_station_amenities: {
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-200/80 dark:border-orange-800/40'
    },
    railmadad_help: {
      bg: 'bg-red-50 dark:bg-red-950/40',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200/80 dark:border-red-800/40'
    },
    travel_feedback: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200/80 dark:border-amber-800/40'
    },
    railyatri_voice_chat: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200/80 dark:border-purple-800/40'
    },
    crowd_delay_insights: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/40',
      text: 'text-yellow-700 dark:text-yellow-300',
      border: 'border-yellow-200/80 dark:border-yellow-800/40'
    },
    nearest_station: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200/80 dark:border-blue-800/40'
    },
    network_maps: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200/80 dark:border-indigo-800/40'
    },
    accessibility_assistance: {
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      text: 'text-teal-700 dark:text-teal-300',
      border: 'border-teal-200/80 dark:border-teal-800/40'
    },
    disruption_weather: {
      bg: 'bg-sky-50 dark:bg-sky-950/40',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-200/80 dark:border-sky-800/40'
    }
  };

  // Filter 22 services by category and search
  const filteredServices = useMemo(() => {
    return ALL_22_SERVICES.filter(svc => {
      const matchCat = selectedCategory === 'all' || svc.category === selectedCategory;
      const matchQ = !serviceSearch.trim() ||
        svc.name.toLowerCase().includes(serviceSearch.toLowerCase().trim()) ||
        svc.description.toLowerCase().includes(serviceSearch.toLowerCase().trim());
      return matchCat && matchQ;
    });
  }, [selectedCategory, serviceSearch]);

  const handleTileClick = (service: ServiceItem) => {
    if (service.isExternalLink) {
      setExternalGatedNotice(service);
      return;
    }

    switch (service.actionId) {
      case 'uts_local':
      case 'express_reserved':
      case 'season_pass':
        onNavigateToJourney(fromCode, toCode);
        break;
      case 'platform_ticket':
        onOpenActionModal('platform_ticket');
        break;
      case 'pnr_status':
        onOpenActionModal('pnr_status');
        break;
      case 'travel_feedback':
        onOpenActionModal('travel_feedback');
        break;
      case 'coach_guide':
        onOpenActionModal('coach_guide', { stationCode: fromCode, platformNumber: '1' });
        break;
      case 'station_guide':
        onOpenActionModal('gods_eye', fromCode);
        break;
      case 'track_train':
      case 'crowd_delay_insights':
        onSwitchTab('live');
        break;
      case 'my_tickets':
      case 'wallet':
      case 'cancellation_refunds':
        onSwitchTab('tickets');
        break;
      case 'railyatri_voice_chat':
        if (onOpenRailSathi) onOpenRailSathi();
        else onSwitchTab('help');
        break;
      case 'nearest_station':
        onSelectCityClick();
        break;
      case 'network_maps':
      case 'disruption_weather':
        onSwitchTab('live');
        break;
      case 'accessibility_assistance':
        onOpenActionModal('gods_eye', fromCode);
        break;
      case 'journey_planning':
        onNavigateToJourney(fromCode, toCode);
        break;
      default:
        onOpenActionModal(service.actionId);
        break;
    }
  };

  // Resolve Station Names for readable display
  const fromStationObj = resolveStation(fromCode) || STATIONS[fromCode] || { code: fromCode, name: fromCode };
  const toStationObj = resolveStation(toCode) || STATIONS[toCode] || { code: toCode, name: toCode };

  return (
    <div className="space-y-3 pb-24 px-3 pt-1 max-w-xl mx-auto">
      {/* ============================================================== */}
      {/* 1. MINIMAL JOURNEY SEARCH CARD (CRIS Benchmark)                */}
      {/* ============================================================== */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="flex items-center gap-1.5">
            <Train className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>Search Trains & Timetable</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {currentCity.primaryHubs[0]?.code} Network
          </span>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-3">
          {/* Station Selector with Center Swap */}
          <div className="relative space-y-2">
            {/* FROM Station Input */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 relative">
              <div className="flex-1">
                <span className="block text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400">
                  From Station
                </span>
                <input
                  type="text"
                  value={fromInputText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFromInputText(val);
                    setFromCode(val.toUpperCase().trim());
                    if (val.trim().length > 1) {
                      const res = normalizeStation(val);
                      setFromSuggestions(res.candidates.slice(0, 4));
                    } else {
                      setFromSuggestions([]);
                    }
                  }}
                  onFocus={() => {
                    if (fromInputText.trim().length > 1) {
                      const res = normalizeStation(fromInputText);
                      setFromSuggestions(res.candidates.slice(0, 4));
                    }
                  }}
                  placeholder="Station code or name (e.g. DR, Dadar, Thane)"
                  className="w-full bg-transparent text-sm font-black text-slate-900 dark:text-white focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate block">
                  {fromStationObj.name}
                </span>
              </div>

              {/* Station Suggestions Dropdown */}
              {fromSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 p-1 space-y-0.5">
                  {fromSuggestions.map(stn => (
                    <button
                      key={stn.code}
                      type="button"
                      onClick={() => {
                        setFromCode(stn.code);
                        setFromInputText(stn.code);
                        setFromSuggestions([]);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200">{stn.name}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-bold">
                        {stn.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Circular Swap Button */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
              <button
                type="button"
                onClick={swapStations}
                className="w-8 h-8 rounded-full bg-blue-800 dark:bg-blue-600 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 transition-transform active:rotate-180"
                title="Swap origin and destination"
                aria-label="Swap origin and destination"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* TO Station Input */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 relative">
              <div className="flex-1">
                <span className="block text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400">
                  To Station
                </span>
                <input
                  type="text"
                  value={toInputText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setToInputText(val);
                    setToCode(val.toUpperCase().trim());
                    if (val.trim().length > 1) {
                      const res = normalizeStation(val);
                      setToSuggestions(res.candidates.slice(0, 4));
                    } else {
                      setToSuggestions([]);
                    }
                  }}
                  onFocus={() => {
                    if (toInputText.trim().length > 1) {
                      const res = normalizeStation(toInputText);
                      setToSuggestions(res.candidates.slice(0, 4));
                    }
                  }}
                  placeholder="Station code or name (e.g. TNA, CSMT)"
                  className="w-full bg-transparent text-sm font-black text-slate-900 dark:text-white focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate block">
                  {toStationObj.name}
                </span>
              </div>

              {/* Station Suggestions Dropdown */}
              {toSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 p-1 space-y-0.5">
                  {toSuggestions.map(stn => (
                    <button
                      key={stn.code}
                      type="button"
                      onClick={() => {
                        setToCode(stn.code);
                        setToInputText(stn.code);
                        setToSuggestions([]);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200">{stn.name}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-bold">
                        {stn.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Hub Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px] pt-0.5">
            <span className="text-slate-400 font-bold shrink-0">Hubs:</span>
            {[
              { code: 'TNA', label: 'Thane' },
              { code: 'DR', label: 'Dadar CR' },
              { code: 'DDR', label: 'Dadar WR' },
              { code: 'CSMT', label: 'CSMT' },
              { code: 'CCG', label: 'Churchgate' },
              { code: 'ADH', label: 'Andheri' },
              { code: 'KYN', label: 'Kalyan' }
            ].map(h => (
              <button
                key={h.code}
                type="button"
                onClick={() => {
                  setToCode(h.code);
                  setToInputText(h.code);
                  setToSuggestions([]);
                }}
                className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap transition-all border shrink-0 ${
                  toCode === h.code
                    ? 'bg-blue-800 text-white border-blue-800 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>

          {/* Date & Service Filters */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setJourneyDate('today')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  journeyDate === 'today'
                    ? 'bg-blue-800 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setJourneyDate('tomorrow')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  journeyDate === 'tomorrow'
                    ? 'bg-blue-800 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Tomorrow
              </button>
            </div>

            {/* AC Local Toggle */}
            <button
              type="button"
              onClick={() => setAcOnly(!acOnly)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                acOnly
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${acOnly ? 'bg-cyan-500' : 'bg-slate-400'}`} />
              <span>AC Only</span>
            </button>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-800 hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 min-h-[48px]"
          >
            <Search className="w-4 h-4" />
            <span>Search Trains</span>
          </button>
        </form>
      </div>

      {/* ============================================================== */}
      {/* 3. PROMINENT BOOKING SHORTCUTS (4 Equal Columns)                */}
      {/* ============================================================== */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight uppercase">
            Quick Booking
          </span>
          <span className="text-[10px] text-slate-400 font-mono">UTS & PRS</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {/* Reserved PRS */}
          <button
            onClick={() => onNavigateToJourney(fromCode, toCode)}
            className="p-2 rounded-2xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/40 flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs active:scale-95 transition-all min-h-[68px] min-w-0"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <Train className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-black text-blue-950 dark:text-blue-200 leading-tight truncate w-full">
              Reserved
            </span>
          </button>

          {/* Unreserved UTS */}
          <button
            onClick={() => onNavigateToJourney(fromCode, toCode)}
            className="p-2 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs active:scale-95 transition-all min-h-[68px] min-w-0"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <Ticket className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-black text-amber-950 dark:text-amber-200 leading-tight truncate w-full">
              Unreserved
            </span>
          </button>

          {/* Platform Permit */}
          <button
            onClick={() => onOpenActionModal('platform_ticket')}
            className="p-2 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs active:scale-95 transition-all min-h-[68px] min-w-0"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-black text-emerald-950 dark:text-emerald-200 leading-tight truncate w-full">
              Platform
            </span>
          </button>

          {/* Season Pass */}
          <button
            onClick={() => onNavigateToJourney(fromCode, toCode)}
            className="p-2 rounded-2xl bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/40 flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs active:scale-95 transition-all min-h-[68px] min-w-0"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-2xs shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-black text-purple-950 dark:text-purple-200 leading-tight truncate w-full">
              Season Pass
            </span>
          </button>
        </div>
      </div>

      {/* Quick Action Banners: Disruption Replanner & Leave-Home Planner */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onOpenActionModal('disruption_replanner')}
          className="p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-all active:scale-98 flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
              Flagship AI
            </span>
            <span className="text-[11px] font-black text-slate-900 dark:text-white block">
              Replan Journey
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 block">
              Simulate Delay & Divert
            </span>
          </div>
          <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          onClick={() => onOpenActionModal('leave_home_planner')}
          className="p-2.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-left transition-all active:scale-98 flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
              On-Time Reach
            </span>
            <span className="text-[11px] font-black text-slate-900 dark:text-white block">
              Leave-Home
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 block">
              Target arrival buffer
            </span>
          </div>
          <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 4. SQUARE-GRID 22-SERVICE DIRECTORY (CRIS HARD REQUIREMENT)     */}
      {/* ============================================================== */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight uppercase">
              Services Directory
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
              22
            </span>
          </div>

          {/* Optional inline filter or search toggle */}
          <span className="text-[10px] text-slate-400 font-medium">
            4 Columns · Direct Access
          </span>
        </div>

        {/* Quick Search & Category Filters for fast discovery */}
        <div className="space-y-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              placeholder="Search services (e.g. PNR, UTS, Food, Coach)..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-[11px] font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-700"
            />
            {serviceSearch && (
              <button
                onClick={() => setServiceSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5 text-[10px]">
            {[
              { id: 'all', label: 'All (22)' },
              { id: 'ticketing', label: 'Ticketing (8)' },
              { id: 'navigation', label: 'Navigation (5)' },
              { id: 'assistance', label: 'Assistance (5)' },
              { id: 'insights', label: 'Insights (4)' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-800 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* MANDATORY 4-COLUMN SQUARE GRID */}
        <div className="grid grid-cols-4 gap-2">
          {filteredServices.map(svc => {
            const Icon = svc.icon;
            const style = serviceStyleMap[svc.id] || {
              bg: 'bg-slate-50 dark:bg-slate-800/40',
              text: 'text-slate-700 dark:text-slate-300',
              border: 'border-slate-200 dark:border-slate-700'
            };

            return (
              <button
                key={svc.id}
                onClick={() => handleTileClick(svc)}
                className="flex flex-col items-center text-center group active:scale-95 transition-transform min-w-0"
                title={svc.name}
                aria-label={svc.name}
              >
                {/* 1:1 Aspect Ratio Square Icon Container */}
                <div
                  className={`w-full aspect-square max-w-[56px] mx-auto rounded-2xl flex items-center justify-center border shadow-2xs transition-all group-hover:border-slate-400 ${style.bg} ${style.border}`}
                >
                  <Icon className={`w-5 h-5 ${style.text}`} />
                </div>

                {/* Short Readable Label (1-2 lines) */}
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight mt-1 px-0.5 line-clamp-2 h-7 flex items-center justify-center text-center">
                  {SERVICE_SHORT_LABELS[svc.id] || svc.name}
                </span>
              </button>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-400">
            No service matching "{serviceSearch}". Try clearing search.
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 5. UPCOMING / SAVED JOURNEYS (When Real Application State Exists)*/}
      {/* ============================================================== */}
      {savedBookings.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              <span>Active Specimen Booking</span>
            </span>
            <button
              onClick={() => onSwitchTab('tickets')}
              className="text-[10px] font-bold text-blue-700 dark:text-blue-400 hover:underline"
            >
              View All ({savedBookings.length})
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                {savedBookings[0].trainNumber} · {savedBookings[0].trainName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {savedBookings[0].originStation} ➔ {savedBookings[0].destStation} · PNR: {savedBookings[0].pnr}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
              CONFIRMED
            </span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. OFFICIALLY SOURCED ALERTS                                   */}
      {/* ============================================================== */}
      <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-2.5 text-xs">
        <Info className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400">
              [TIMETABLE SCHEDULE]
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
              Suburban & Express Services Operational
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
            Normal train frequency on Western, Central and Harbour lines. Live platform indicators are verified against timetable allocations.
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL: Official Gated External Notice (RailMadad & e-Catering)  */}
      {/* ============================================================== */}
      {externalGatedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Official External Service Handoff
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                <strong>{externalGatedNotice.name}</strong> is operated directly by Indian Railways / IRCTC. Opening external official portal.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setExternalGatedNotice(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <a
                href={externalGatedNotice.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setExternalGatedNotice(null)}
                className="flex-1 py-2.5 rounded-xl bg-blue-800 text-white text-xs font-bold text-center shadow-xs"
              >
                Proceed
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
