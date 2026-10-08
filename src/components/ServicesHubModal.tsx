import React, { useState } from 'react';
import { AccessibleModal } from './common/AccessibleModal';
import {
  Ticket,
  Train,
  ShieldCheck,
  FileText,
  CreditCard,
  QrCode,
  Wallet,
  RotateCcw,
  Compass,
  Radio,
  BarChart3,
  Map,
  Layers,
  Sparkles,
  LifeBuoy,
  Utensils,
  MapPin,
  GitBranch,
  Car,
  Accessibility,
  CloudRain,
  Bookmark,
  Search,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

export interface ServiceItem {
  id: string;
  name: string;
  category: 'ticketing' | 'navigation' | 'assistance' | 'insights';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
  isExternalLink?: boolean;
  externalUrl?: string;
  actionId: string;
}

export const ALL_22_SERVICES: ServiceItem[] = [
  {
    id: 'unreserved_tickets',
    name: 'Unreserved Tickets (UTS)',
    category: 'ticketing',
    description: 'Book unreserved suburban and Mail/Express general 2nd class tickets.',
    icon: Ticket,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    badge: 'Specimen',
    actionId: 'uts_local'
  },
  {
    id: 'reserved_tickets',
    name: 'Reserved Tickets (PRS)',
    category: 'ticketing',
    description: 'Reserved Sleeper, 3A, 2A, 1A, CC and Vande Bharat Executive Chair Car demo.',
    icon: Train,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    badge: 'Demo PRS',
    actionId: 'express_reserved'
  },
  {
    id: 'platform_permits',
    name: 'Platform Permits',
    category: 'ticketing',
    description: 'Issue 2-hour platform access permit for station concourses and accompanying travellers.',
    icon: ShieldCheck,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    badge: '₹10 Demo',
    actionId: 'platform_ticket'
  },
  {
    id: 'season_passes',
    name: 'Season Passes (MST / QST)',
    category: 'ticketing',
    description: 'Monthly and quarterly commuter season passes across verified suburban corridors.',
    icon: FileText,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    badge: 'Suburban',
    actionId: 'season_pass'
  },
  {
    id: 'metro_ticketing',
    name: 'Metro Ticketing',
    category: 'ticketing',
    description: 'QR tokens and single journey passes for Mumbai Metro Lines 1, 2A, 7, and 3.',
    icon: CreditCard,
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    badge: 'MMRDA/MMRC',
    actionId: 'metro_ticketing'
  },
  {
    id: 'my_tickets_qr',
    name: 'My Tickets & Specimen QR',
    category: 'ticketing',
    description: 'View active, past, and cancelled specimen tickets with cryptographic watermarks.',
    icon: QrCode,
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    actionId: 'my_tickets'
  },
  {
    id: 'wallet_recharge',
    name: 'RailWallet & Recharge',
    category: 'ticketing',
    description: 'Passenger transit wallet balance, mock recharge, and instant refund credits.',
    icon: Wallet,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    badge: 'Simulated',
    actionId: 'wallet'
  },
  {
    id: 'cancellation_refunds',
    name: 'Cancellation & Refunds',
    category: 'ticketing',
    description: 'Cancel bookings with statutory clerical deductions and simulated RailWallet credits.',
    icon: RotateCcw,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    actionId: 'cancellation_refunds'
  },
  {
    id: 'journey_planning',
    name: 'Door-to-Door Journey Planning',
    category: 'navigation',
    description: 'Multimodal door-to-door itinerary search across suburban rail, metro, bus, and walk legs.',
    icon: Compass,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    actionId: 'journey_planning'
  },
  {
    id: 'train_running_status',
    name: 'Train Running Status',
    category: 'insights',
    description: 'Live departure boards, platform assignments, and verified station telemetry.',
    icon: Radio,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    badge: 'Live Board',
    actionId: 'track_train'
  },
  {
    id: 'crowd_delay_insights',
    name: 'Historical Crowd & Delays',
    category: 'insights',
    description: 'Empirical delay histograms, corridor bunching, and peak direction crowd estimates.',
    icon: BarChart3,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    badge: 'Statistical',
    actionId: 'crowd_delay_insights'
  },
  {
    id: 'station_navigation_2d',
    name: '2D Station Navigation',
    category: 'navigation',
    description: 'Top-down station layouts, Foot-Over-Bridges, step-free lifts, and platform transfers.',
    icon: Map,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    badge: 'God’s Eye',
    actionId: 'station_guide'
  },
  {
    id: 'coach_positioning',
    name: 'Coach Positioning Guide',
    category: 'navigation',
    description: '12-car/15-car suburban and 16-car Vande Bharat coach alignments relative to FOB stairs.',
    icon: Layers,
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    actionId: 'coach_guide'
  },
  {
    id: 'railyatri_voice_chat',
    name: 'Rail Yatri Voice & Chat',
    category: 'assistance',
    description: 'Multilingual conversational assistant (English, Hindi, Marathi) for trains and bookings.',
    icon: Sparkles,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    badge: 'Multilingual',
    actionId: 'railyatri_voice_chat'
  },
  {
    id: 'railmadad_help',
    name: 'RailMadad & Passenger Help',
    category: 'assistance',
    description: 'Integrated 139 passenger helpline, security RPF assistance, and official grievance tracking.',
    icon: LifeBuoy,
    color: 'text-red-500 bg-red-500/10 border-red-500/20',
    isExternalLink: true,
    externalUrl: 'https://railmadad.indianrailways.gov.in',
    actionId: 'railmadad_help'
  },
  {
    id: 'food_station_amenities',
    name: 'Food & Station Amenities',
    category: 'assistance',
    description: 'Official IRCTC e-Catering portal, water ATMs, cloak rooms, and waiting halls.',
    icon: Utensils,
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    isExternalLink: true,
    externalUrl: 'https://ecatering.irctc.co.in',
    actionId: 'food_station_amenities'
  },
  {
    id: 'nearest_station',
    name: 'Nearest Station Locator',
    category: 'navigation',
    description: 'Find nearest suburban or metro terminal based on verified coordinates and lines.',
    icon: MapPin,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    actionId: 'nearest_station'
  },
  {
    id: 'network_maps',
    name: 'Network Maps & Interchanges',
    category: 'navigation',
    description: 'Schematic network diagrams and WGS-84 geographic maps across all 8 Indian metro regions.',
    icon: GitBranch,
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    actionId: 'network_maps'
  },
  {
    id: 'cab_auto_shared',
    name: 'Cab, Auto & Shared Rickshaw',
    category: 'navigation',
    description: 'First/last mile station feeder alternatives with regulated prepaid auto tariffs.',
    icon: Car,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    actionId: 'cab_auto_shared'
  },
  {
    id: 'accessibility_assistance',
    name: 'Divyangjan Accessibility',
    category: 'assistance',
    description: 'Wheelchair step-free paths, tactile paving guide, and elevator status at major hubs.',
    icon: Accessibility,
    color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    badge: 'Step-Free',
    actionId: 'accessibility_assistance'
  },
  {
    id: 'disruption_weather',
    name: 'Weather & Disruption Context',
    category: 'insights',
    description: 'Monsoon flooding alerts, Sunday mega-blocks, jumbo-blocks, and corridor track work.',
    icon: CloudRain,
    color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    actionId: 'disruption_weather'
  },
  {
    id: 'saved_journeys',
    name: 'Saved Journeys & Commute Alerts',
    category: 'insights',
    description: 'Quick-access daily routes, morning/evening office alerts, and favorite corridors.',
    icon: Bookmark,
    color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    actionId: 'saved_journeys'
  }
];

interface ServicesHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (service: ServiceItem) => void;
}

export const ServicesHubModal: React.FC<ServicesHubModalProps> = ({
  isOpen,
  onClose,
  onSelectService
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ticketing' | 'navigation' | 'assistance' | 'insights'>('all');
  const [externalGatedNotice, setExternalGatedNotice] = useState<ServiceItem | null>(null);

  const filteredServices = ALL_22_SERVICES.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const handleServiceClick = (item: ServiceItem) => {
    if (item.isExternalLink) {
      setExternalGatedNotice(item);
    } else {
      onSelectService(item);
      onClose();
    }
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Passenger Services Hub"
      subtitle="Complete Directory of 22 Official & Intelligent Transit Services"
      variant="sheet"
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-3.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 22 services (e.g. UTS, Metro, FOB, RailMadad, Auto)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-theme-primary"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] pb-1">
          {[
            { id: 'all', label: 'All Services (22)' },
            { id: 'ticketing', label: 'Ticketing & Passes (8)' },
            { id: 'navigation', label: 'Navigation & Stations (5)' },
            { id: 'assistance', label: 'Assistance & Help (4)' },
            { id: 'insights', label: 'Telemetry & Alerts (5)' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all active:scale-95 ${
                selectedCategory === cat.id
                  ? 'bg-theme-primary text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {filteredServices.map(service => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => handleServiceClick(service)}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-theme-primary hover:shadow-xs transition-all active:scale-98 flex items-start gap-3 group min-h-[72px]"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${service.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 justify-between">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate group-hover:text-theme-primary">
                      {service.name}
                    </span>
                    {service.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                        {service.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-theme-primary shrink-0 self-center" />
              </button>
            );
          })}
        </div>

        {/* External Operator Gated Notice Modal */}
        {externalGatedNotice && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-[11px]">
              <Info className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Official External Provider Integration Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              <strong>{externalGatedNotice.name}</strong> is managed directly by official railway authorities. RailOne Next does not process unauthorized bookings or collect payment data.
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                [EXTERNAL OPERATOR LINK]
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExternalGatedNotice(null)}
                  className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold"
                >
                  Dismiss
                </button>
                {externalGatedNotice.externalUrl && (
                  <a
                    href={externalGatedNotice.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-xl bg-theme-primary text-white text-[10px] font-bold flex items-center gap-1 shadow-xs"
                  >
                    <span>Open Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AccessibleModal>
  );
};
