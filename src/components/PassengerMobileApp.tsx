import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { CITIES_REGISTRY, CityCoverageConfig } from '../fixtures/citiesData';
import { JourneyItinerary, TravelClass, SpecimenTicket } from '../types/railway';
import { MockBookingStore } from '../engine/mockBookingStore';

import { MobileHomeTab } from './mobile/MobileHomeTab';
import { MobileJourneysTab } from './mobile/MobileJourneysTab';
import { MobileLiveTab } from './mobile/MobileLiveTab';
import { MobileTicketsTab } from './mobile/MobileTicketsTab';
import { MobileRailSathiTab } from './mobile/MobileRailSathiTab';
import { MobileHelpTab } from './mobile/MobileHelpTab';
import { BottomNavigation, PassengerNavTab } from './common/BottomNavigation';
import { AccessibleModal } from './common/AccessibleModal';

import { LaunchSequence } from './LaunchSequence';
import { OnboardingModal } from './OnboardingModal';
import { SpecimenTicketModal } from './SpecimenTicketModal';
import { CoachPositionGuide, RakeModelType } from './CoachPositionGuide';
import { TRAIN_TRIPS, STATIONS } from '../fixtures/railwayData';
import { PAN_INDIA_TRAINS } from '../fixtures/panIndiaTrainsData';
import { resolveStation } from '../engine/journeyEngine';
import { ThemeSelectorModal } from './ThemeSelectorModal';
import { ServicesHubModal, ServiceItem } from './ServicesHubModal';
import { PnrStatusModal } from './PnrStatusModal';
import { TravelFeedbackModal } from './TravelFeedbackModal';
import { DisruptionReplanner } from './DisruptionReplanner';
import { LeaveHomePlanner } from './LeaveHomePlanner';
import { useAuthority } from './AuthorityContext';
import { InstitutionalInsignia } from './common/InstitutionalInsignia';
import { getTranslation } from '../i18n/translations';

import {
  Compass,
  Navigation,
  Radio,
  Ticket,
  Sparkles,
  Wifi,
  Battery,
  MapPin,
  ChevronDown,
  Globe,
  Palette,
  Sun,
  Moon,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Train
} from 'lucide-react';

const MovingTrain3DModal = React.lazy(() => import('./MovingTrain3DModal'));
const StationGodsEyeModal = React.lazy(() => import('./StationGodsEyeModal'));
const InstitutionalDossierModal = React.lazy(() => import('./InstitutionalDossierModal').then(m => ({ default: m.InstitutionalDossierModal })));

export type MobileTab = PassengerNavTab;

interface PassengerMobileAppProps {
  presetOrigin?: string;
  presetDest?: string;
}

export const PassengerMobileApp: React.FC<PassengerMobileAppProps> = ({
  presetOrigin = 'TNA',
  presetDest = 'CSMT'
}) => {
  const { theme, language, setLanguage, isDark, toggleDarkMode } = useTheme();
  const { authority } = useAuthority();
  const t = getTranslation(language);

  // App Navigation & Selection State
  const [activeTab, setActiveTab] = useState<PassengerNavTab>('home');
  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    return localStorage.getItem('railone_user_city') || 'mumbai';
  });
  const [journeyOrigin, setJourneyOrigin] = useState<string>(presetOrigin || authority.defaultOriginCode);
  const [journeyDest, setJourneyDest] = useState<string>(presetDest || authority.defaultDestCode);
  const [inspectedTrainNumber, setInspectedTrainNumber] = useState<string>('95112');
  const [savedTicketCount, setSavedTicketCount] = useState<number>(0);

  // Time & Status Clock
  const [currentTime, setCurrentTime] = useState<string>('10:42');

  // Modals & Flow States
  const [showLaunchSequence, setShowLaunchSequence] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem('railone_launch_seen') !== 'true';
      }
    } catch {}
    return false;
  });
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showPnrModal, setShowPnrModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showCityPicker, setShowCityPicker] = useState<boolean>(false);
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [showCoachGuide, setShowCoachGuide] = useState<boolean>(false);
  const [coachGuideParams, setCoachGuideParams] = useState<{ stationCode: string; platformNumber: string; rakeType?: RakeModelType }>({ stationCode: 'DR', platformNumber: '3' });
  const [show3DTrain, setShow3DTrain] = useState<boolean>(false);
  const [showGodsEye, setShowGodsEye] = useState<boolean>(false);
  const [godsEyeStationCode, setGodsEyeStationCode] = useState<string>('DR');
  const [showInstitutionalDossier, setShowInstitutionalDossier] = useState<boolean>(false);
  const [showServicesHub, setShowServicesHub] = useState<boolean>(false);
  const [showDisruptionModal, setShowDisruptionModal] = useState<boolean>(false);
  const [showLeaveHomeModal, setShowLeaveHomeModal] = useState<boolean>(false);

  // Booking Modal State
  const [selectedItinerary, setSelectedItinerary] = useState<JourneyItinerary | null>(null);
  const [selectedClass, setSelectedClass] = useState<TravelClass>('II');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);

  // Active City Config
  const currentCity: CityCoverageConfig = CITIES_REGISTRY[selectedCityId] || CITIES_REGISTRY['mumbai'];

  // Update clock every minute
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync ticket count
  const refreshTickets = () => {
    setSavedTicketCount(MockBookingStore.listBookings().length);
  };

  useEffect(() => {
    refreshTickets();
  }, []);

  // Handle external presets if changed
  useEffect(() => {
    if (presetOrigin) setJourneyOrigin(presetOrigin);
    if (presetDest) setJourneyDest(presetDest);
  }, [presetOrigin, presetDest]);

  // Synchronize stations when sovereign authority changes
  useEffect(() => {
    setJourneyOrigin(authority.defaultOriginCode);
    setJourneyDest(authority.defaultDestCode);
  }, [authority.id, authority.defaultOriginCode, authority.defaultDestCode]);

  const handleLaunchComplete = () => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('railone_launch_seen', 'true');
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        if (localStorage.getItem('railone_onboarding_completed') !== 'true') {
          setShowOnboarding(true);
        }
      }
    } catch {}
    setShowLaunchSequence(false);
  };

  const handleOnboardingComplete = (prefs: {
    cityId: string;
    language: 'en' | 'hi' | 'mr';
    travelClass: TravelClass;
    isAuthenticated: boolean;
  }) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('railone_onboarding_completed', 'true');
      }
    } catch {}
    setSelectedCityId(prefs.cityId);
    setLanguage(prefs.language);
    setShowOnboarding(false);
  };

  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(cityId);
    localStorage.setItem('railone_user_city', cityId);
    setShowCityPicker(false);
    
    // Set appropriate default origin/destination for selected city
    const city = CITIES_REGISTRY[cityId];
    if (city && city.representativeJourneys.length > 0) {
      setJourneyOrigin(city.representativeJourneys[0].fromCode);
      setJourneyDest(city.representativeJourneys[0].toCode);
    }
  };

  const handleOpenBooking = (itinerary: JourneyItinerary, travelClass: TravelClass) => {
    setSelectedItinerary(itinerary);
    setSelectedClass(travelClass);
    setIsTicketModalOpen(true);
  };

  const handleInspectTrain = (trainNumber: string) => {
    setInspectedTrainNumber(trainNumber);
    setActiveTab('live');
  };

  const handleOpenGodsEye = (stationCode: string = 'DR') => {
    setGodsEyeStationCode(stationCode);
    setShowGodsEye(true);
  };

  const handleActionModal = (action: string, payload?: any) => {
    switch (action) {
      case 'uts_local':
      case 'express_reserved':
      case 'season_pass':
        setActiveTab('journey');
        break;
      case 'platform_ticket': {
        const fromStationObj = resolveStation(journeyOrigin) || resolveStation(authority.defaultOriginCode) || STATIONS['DR'];
        const platClass = (authority.classes[0]?.code as TravelClass) || 'II';
        const platFare = authority.id === 'japan' ? 160 : authority.id === 'uk' ? 2.5 : authority.id === 'switzerland' ? 3.0 : authority.id === 'germany' ? 2.0 : 10;
        const platformItinerary: JourneyItinerary = {
          id: `platform-${Date.now()}`,
          legs: [{
            legIndex: 0,
            train: {
              trainNumber: 'PLT-01',
              trainName: `Platform Permit - ${fromStationObj.name}`,
              originStation: fromStationObj.name,
              destinationStation: fromStationObj.name,
              serviceType: 'suburban_slow',
              runningDays: [0, 1, 2, 3, 4, 5, 6],
              stops: [{
                stationCode: fromStationObj.code,
                stationName: fromStationObj.name,
                scheduledArrival: '00:00',
                scheduledDeparture: '02:00',
                platform: '1',
                distanceKm: 0,
                isHalt: true
              }],
              availableClasses: [platClass],
              rakeType: '12_car'
            },
            fromStation: fromStationObj,
            toStation: fromStationObj,
            scheduledDep: 'Immediate',
            scheduledArr: '+2 hrs',
            predictedDep: 'Immediate',
            predictedArr: '+2 hrs',
            delayDepMinutes: 0,
            delayArrMinutes: 0,
            departurePlatform: 'All PFs',
            arrivalPlatform: 'All PFs',
            dataStatus: 'SCHEDULED',
            crowding: {
              level: 'LOW',
              confidence: 'HIGH',
              explanation: 'Platform entry access only',
              peakWindow: false,
              crowdReason: 'Statutory platform permit'
            },
            skippedStopsCount: 0,
            stoppingPatternLabel: 'Valid 2 Hours Platform Entry'
          }],
          transfers: [],
          totalDurationMinutes: 120,
          scheduledDeparture: 'Immediate',
          predictedDeparture: 'Immediate',
          scheduledArrival: '+2 hrs',
          predictedArrival: '+2 hrs',
          totalFareByClass: { [platClass]: platFare },
          recommendedClass: platClass,
          eligibility: {
            status: 'ELIGIBLE',
            summary: 'Valid Statutory Platform Entry Permit',
            rulesApplied: [authority.regulatoryCharter],
            validClasses: [platClass],
            passPermitted: false,
            ticketRequiredNote: 'Valid for 2 hours platform concourse access only'
          },
          score: 100,
          rankReason: 'Statutory Platform Permit',
          isRecommended: true,
          leaveHomeTime: 'Immediate',
          leaveHomeMarginMinutes: 0,
          isAcService: false
        };
        handleOpenBooking(platformItinerary, 'II');
        break;
      }
      case 'wallet':
        setActiveTab('tickets');
        break;
      case 'track_train':
        setActiveTab('live');
        break;
      case 'coach_guide':
        if (payload) {
          if (typeof payload === 'string') {
            setCoachGuideParams({ stationCode: payload, platformNumber: '1' });
          } else if (typeof payload === 'object') {
            setCoachGuideParams({
              stationCode: payload.stationCode || 'DR',
              platformNumber: payload.platformNumber || '1',
              rakeType: payload.rakeType
            });
          }
        }
        setShowCoachGuide(true);
        break;
      case 'gods_eye':
        handleOpenGodsEye(payload || 'DR');
        break;
      case 'pnr_status':
        setShowPnrModal(true);
        break;
      case 'travel_feedback':
        setShowFeedbackModal(true);
        break;
      case 'cancellation_refunds':
        setActiveTab('tickets');
        break;
      case 'moving_train_3d':
      case '3d_train':
        setShow3DTrain(true);
        break;
      case 'disruption_replanner':
        setShowDisruptionModal(true);
        break;
      case 'leave_home_planner':
        setShowLeaveHomeModal(true);
        break;
      case 'replay_launch':
        setShowLaunchSequence(true);
        break;
      default:
        break;
    }
  };

  const handleServiceSelect = (service: ServiceItem) => {
    switch (service.actionId) {
      case 'uts_local':
      case 'express_reserved':
      case 'season_pass':
      case 'journey_planning':
        setActiveTab('journey');
        break;
      case 'platform_ticket':
        handleActionModal('platform_ticket');
        break;
      case 'pnr_status':
        setShowPnrModal(true);
        break;
      case 'travel_feedback':
        setShowFeedbackModal(true);
        break;
      case 'my_tickets':
      case 'wallet':
      case 'cancellation_refunds':
        setActiveTab('tickets');
        break;
      case 'track_train':
      case 'crowd_delay_insights':
        setActiveTab('live');
        break;
      case 'station_guide':
        handleOpenGodsEye('DR');
        break;
      case 'coach_guide':
        setShowCoachGuide(true);
        break;
      case 'railyatri_voice_chat':
        setActiveTab('help');
        break;
      case 'network_maps':
        setActiveTab('live');
        break;
      case 'nearest_station':
        setShowCityPicker(true);
        break;
      default:
        setActiveTab('journey');
        break;
    }
  };

  const cycleLanguage = () => {
    if (language === 'en') setLanguage('hi');
    else if (language === 'hi') setLanguage('mr');
    else setLanguage('en');
  };

  return (
    <div 
      className="relative w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans select-none overflow-x-hidden overflow-y-hidden"
      style={{
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)'
      }}
    >
      
      {/* 1. TOP HARDWARE STATUS BAR (Authentic Mobile System Bar) */}
      <div 
        className="shrink-0 h-11 px-5 pt-2 flex items-center justify-between text-xs font-semibold z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)'
        }}
      >
        {/* System Clock */}
        <span className="font-mono text-slate-800 dark:text-slate-200 tracking-tight text-[13px] font-bold">
          {currentTime}
        </span>

        {/* Hardware Status Indicators */}
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500">5G</span>
          <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono">98%</span>
            <Battery className="w-4 h-4 fill-emerald-500 stroke-slate-700 dark:stroke-slate-300" />
          </div>
        </div>
      </div>

      {/* 2. CRIS BENCHMARK COMPACT APP HEADER */}
      <header className="shrink-0 px-3.5 py-2 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between z-10 shadow-2xs">
        {/* Brand & Indian Railways Badge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-800 dark:bg-blue-600 text-white flex items-center justify-center font-black shadow-2xs shrink-0">
            <Train className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                {t.appName}
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-blue-700 text-white font-mono font-black text-[9px] tracking-wider uppercase">
                Next
              </span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-500 dark:text-slate-400 font-medium">
              <InstitutionalInsignia authorityId="india" size={11} />
              <span>Indian Railways</span>
              <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                [{t.statutoryActive}]
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Controls: City Selector Chip + Settings */}
        <div className="flex items-center gap-1.5">
          {/* City / Network Chip */}
          <button
            onClick={() => setShowCityPicker(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-[11px] font-bold text-blue-900 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95"
            title="Switch Transit City Network"
            aria-label={`Current transit network: ${currentCity.name}. Click to switch.`}
          >
            <MapPin className="w-3 h-3 text-blue-700 dark:text-blue-400 shrink-0" />
            <span className="truncate max-w-[65px] sm:max-w-[85px]">{currentCity.name}</span>
            <ChevronDown className="w-2.5 h-2.5 text-blue-600" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={cycleLanguage}
            className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 touch-target min-h-[32px]"
            title="Cycle Language (EN / HI / MR)"
          >
            {language}
          </button>

          {/* Theme Palette Button */}
          <button
            onClick={() => setShowThemeModal(true)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 touch-target min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Switch Livery & Color Theme"
          >
            <Palette className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 touch-target min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Toggle Dark / Light Mode"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* 3. MAIN TAB CONTENT VIEWPORT */}
      <main className="flex-1 overflow-y-auto overscroll-contain relative pb-20">
        {activeTab === 'home' && (
          <MobileHomeTab
            currentCity={currentCity}
            onSelectCityClick={() => setShowCityPicker(true)}
            onNavigateToJourney={(from, to) => {
              setJourneyOrigin(from);
              setJourneyDest(to);
              setActiveTab('journey');
            }}
            onOpenActionModal={handleActionModal}
            onSwitchTab={setActiveTab}
            onOpenRailSathi={() => setActiveTab('help')}
          />
        )}

        {activeTab === 'journey' && (
          <MobileJourneysTab
            initialOrigin={journeyOrigin}
            initialDest={journeyDest}
            onBookSpecimen={handleOpenBooking}
            onInspectTrain={handleInspectTrain}
          />
        )}

        {activeTab === 'live' && (
          <MobileLiveTab
            initialTrainNumber={inspectedTrainNumber}
            onOpenGodsEye={handleOpenGodsEye}
            onPlanRouteFromStation={(code) => {
              setJourneyOrigin(code);
              setActiveTab('journey');
            }}
            onPlanRouteToStation={(code) => {
              setJourneyDest(code);
              setActiveTab('journey');
            }}
          />
        )}

        {activeTab === 'tickets' && (
          <MobileTicketsTab
            onNavigateToJourney={() => setActiveTab('journey')}
            onOpenSpecimenModal={(ticket) => {
              // Open existing ticket inspection
            }}
          />
        )}

        {activeTab === 'help' && (
          <MobileHelpTab
            onOpenInstitutionalDossier={() => setShowInstitutionalDossier(true)}
            onOpen3DStation={() => handleOpenGodsEye('DR')}
            onViewTicketWallet={() => setActiveTab('tickets')}
          />
        )}
      </main>

      {/* 4. PERSISTENT PHONE-FIRST BOTTOM NAVIGATION */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedTicketCount={savedTicketCount}
      />

      {/* 5. MODALS & SUB-FLOWS */}
      
      {/* City Switcher Modal */}
      <AccessibleModal
        isOpen={showCityPicker}
        onClose={() => setShowCityPicker(false)}
        title="Select Transit City Network"
        subtitle="8 Supported Metropolitan Networks with Transparent Provenance"
        icon={<Building2 className="w-5 h-5" />}
        variant="sheet"
      >
        <div className="space-y-2 pr-1">
          {Object.values(CITIES_REGISTRY).map(city => {
            const isSelected = city.id === selectedCityId;
            return (
              <button
                key={city.id}
                onClick={() => handleCitySelect(city.id)}
                className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all touch-target ${
                  isSelected
                    ? 'border-theme-primary bg-theme-primary/10 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {city.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">({city.nativeName})</span>
                    {city.tier === 'FLAGSHIP_TIER1' && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        Flagship
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    {city.provenanceExplanation}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-400 font-mono">
                    <span>Hubs: {city.primaryHubs.map(h => h.code).slice(0, 4).join(', ')}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${
                    city.provenanceTag === '[VERIFIED LIVE]'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    {city.provenanceTag}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </AccessibleModal>

      {/* Specimen Ticket Modal */}
      <SpecimenTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false);
          refreshTickets();
        }}
        itinerary={selectedItinerary}
        selectedClass={selectedClass}
        onBookingCreated={() => {
          refreshTickets();
        }}
      />

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />

      {/* Platform Coach Guide Modal */}
      {showCoachGuide && (() => {
        let activeStation = coachGuideParams.stationCode;
        let activePlatform = coachGuideParams.platformNumber;
        let activeRake: RakeModelType | undefined = coachGuideParams.rakeType;

        if (inspectedTrainNumber) {
          const allTrains = [...TRAIN_TRIPS, ...PAN_INDIA_TRAINS];
          const inspected = allTrains.find(t => t.trainNumber === inspectedTrainNumber);
          if (inspected) {
            const firstStop = inspected.stops[0];
            activeStation = firstStop?.stationCode || activeStation;
            activePlatform = firstStop?.platform || activePlatform;
            activeRake = inspected.serviceType.includes('vande')
              ? '16_car_vande_bharat'
              : inspected.serviceType.includes('ac')
              ? '12_car_ac_suburban'
              : inspected.rakeType === '15_car'
              ? '15_car_suburban'
              : '12_car_suburban';
          }
        } else if (selectedItinerary) {
          const firstLeg = selectedItinerary.legs[0];
          activeStation = firstLeg.fromStation.code;
          activePlatform = firstLeg.departurePlatform;
          activeRake = firstLeg.train.serviceType.includes('vande')
            ? '16_car_vande_bharat'
            : firstLeg.train.serviceType.includes('ac')
            ? '12_car_ac_suburban'
            : firstLeg.train.rakeType === '15_car'
            ? '15_car_suburban'
            : '12_car_suburban';
        }

        return (
          <AccessibleModal
            isOpen={showCoachGuide}
            onClose={() => setShowCoachGuide(false)}
            title="Train Coach Position Guide"
            subtitle={`Station: ${activeStation} · Platform: ${activePlatform}`}
            icon={<Train className="w-5 h-5" />}
            variant="sheet"
            maxWidthClass="max-w-2xl"
            hideHeader={true}
          >
            <CoachPositionGuide
              key={`${activeStation}-${activePlatform}-${activeRake}`}
              stationCode={activeStation}
              platformNumber={activePlatform}
              initialRakeType={activeRake}
              onClose={() => setShowCoachGuide(false)}
              compactMode={true}
              hideCardBorder={true}
            />
          </AccessibleModal>
        );
      })()}

      {/* 3D Moving Train Modal */}
      {show3DTrain && (
        <React.Suspense fallback={null}>
          <MovingTrain3DModal
            isOpen={show3DTrain}
            onClose={() => setShow3DTrain(false)}
          />
        </React.Suspense>
      )}

      {/* 3D Station God's Eye Modal */}
      {showGodsEye && (
        <React.Suspense fallback={null}>
          <StationGodsEyeModal
            isOpen={showGodsEye}
            onClose={() => setShowGodsEye(false)}
            initialStationCode={godsEyeStationCode}
          />
        </React.Suspense>
      )}

      {/* Institutional Dossier Modal */}
      {showInstitutionalDossier && (
        <React.Suspense fallback={null}>
          <InstitutionalDossierModal
            isOpen={showInstitutionalDossier}
            onClose={() => setShowInstitutionalDossier(false)}
          />
        </React.Suspense>
      )}

      {/* 22-Services Directory Hub Modal */}
      {showServicesHub && (
        <ServicesHubModal
          isOpen={showServicesHub}
          onClose={() => setShowServicesHub(false)}
          onSelectService={handleServiceSelect}
        />
      )}

      {/* Dedicated PNR Status Enquiry Modal */}
      {showPnrModal && (
        <PnrStatusModal
          isOpen={showPnrModal}
          onClose={() => setShowPnrModal(false)}
        />
      )}

      {/* Dedicated Travel Experience Feedback Modal */}
      {showFeedbackModal && (
        <TravelFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          defaultStation={currentCity.primaryHubs[0]?.name || 'Dadar (DR)'}
        />
      )}

      {/* Flagship AI Disruption Replanner Modal */}
      <AccessibleModal
        isOpen={showDisruptionModal}
        onClose={() => setShowDisruptionModal(false)}
        title="AI Disruption Replanner"
        subtitle="Live Contingency Simulation & Delay Inversion Engine"
        icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        variant="sheet"
      >
        <DisruptionReplanner
          onSelectAlternative={(itinerary, travelClass) => {
            setShowDisruptionModal(false);
            handleOpenBooking(itinerary, travelClass);
          }}
          onOpenStationGuide={(stationCode) => {
            setShowDisruptionModal(false);
            handleOpenGodsEye(stationCode);
          }}
        />
      </AccessibleModal>

      {/* Smart Leave-Home Planner Modal */}
      <AccessibleModal
        isOpen={showLeaveHomeModal}
        onClose={() => setShowLeaveHomeModal(false)}
        title="Smart Leave-Home Planner"
        subtitle="On-Time Target Arrival & Station Access Allowance"
        icon={<Clock className="w-5 h-5 text-indigo-500" />}
        variant="sheet"
      >
        <LeaveHomePlanner
          defaultOrigin={journeyOrigin}
          defaultDest={journeyDest}
          onPlanJourney={(from, to, depTime) => {
            setShowLeaveHomeModal(false);
            setJourneyOrigin(from);
            setJourneyDest(to);
            setActiveTab('journey');
          }}
        />
      </AccessibleModal>


      {/* Onboarding Flow */}
      {showOnboarding && !showLaunchSequence && (
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* First-Run Launch Sequence Animation */}
      {showLaunchSequence && (
        <LaunchSequence onComplete={handleLaunchComplete} />
      )}

      {/* Cinematic 3D Moving Train Modal */}
      {show3DTrain && (
        <React.Suspense fallback={null}>
          <MovingTrain3DModal
            isOpen={show3DTrain}
            onClose={() => setShow3DTrain(false)}
          />
        </React.Suspense>
      )}

    </div>
  );
};
