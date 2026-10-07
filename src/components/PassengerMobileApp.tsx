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
import { ThemeSelectorModal } from './ThemeSelectorModal';

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

  // App Navigation & Selection State
  const [activeTab, setActiveTab] = useState<PassengerNavTab>('home');
  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    return localStorage.getItem('railone_user_city') || 'mumbai';
  });
  const [journeyOrigin, setJourneyOrigin] = useState<string>(presetOrigin);
  const [journeyDest, setJourneyDest] = useState<string>(presetDest);
  const [inspectedTrainNumber, setInspectedTrainNumber] = useState<string>('95112');
  const [savedTicketCount, setSavedTicketCount] = useState<number>(0);

  // Time & Status Clock
  const [currentTime, setCurrentTime] = useState<string>('10:42');

  // Modals & Flow States
  const [showLaunchSequence, setShowLaunchSequence] = useState<boolean>(() => {
    return !sessionStorage.getItem('railone_launch_seen');
  });
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return !localStorage.getItem('railone_onboarding_completed');
  });
  const [showCityPicker, setShowCityPicker] = useState<boolean>(false);
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [showCoachGuide, setShowCoachGuide] = useState<boolean>(false);
  const [coachGuideParams, setCoachGuideParams] = useState<{ stationCode: string; platformNumber: string; rakeType?: RakeModelType }>({ stationCode: 'DR', platformNumber: '3' });
  const [show3DTrain, setShow3DTrain] = useState<boolean>(false);
  const [showGodsEye, setShowGodsEye] = useState<boolean>(false);
  const [godsEyeStationCode, setGodsEyeStationCode] = useState<string>('DR');
  const [showInstitutionalDossier, setShowInstitutionalDossier] = useState<boolean>(false);

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

  const handleLaunchComplete = () => {
    sessionStorage.setItem('railone_launch_seen', 'true');
    setShowLaunchSequence(false);
  };

  const handleOnboardingComplete = (prefs: {
    cityId: string;
    language: 'en' | 'hi' | 'mr';
    travelClass: TravelClass;
    isAuthenticated: boolean;
  }) => {
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
        const fromStationObj = STATIONS[journeyOrigin] || STATIONS['DR'];
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
              availableClasses: ['II'],
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
          totalFareByClass: { II: 10 },
          recommendedClass: 'II',
          eligibility: {
            status: 'ELIGIBLE',
            summary: 'Valid Platform Permit',
            rulesApplied: ['Statutory UTS Platform Access Rule'],
            validClasses: ['II'],
            passPermitted: false,
            ticketRequiredNote: 'Valid for 2 hours only'
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
      default:
        break;
    }
  };

  const cycleLanguage = () => {
    if (language === 'en') setLanguage('hi');
    else if (language === 'hi') setLanguage('mr');
    else setLanguage('en');
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans select-none overflow-hidden">
      
      {/* 1. TOP HARDWARE STATUS BAR (Authentic Mobile System Bar) */}
      <div className="shrink-0 h-11 px-5 pt-2 flex items-center justify-between text-xs font-semibold z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
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

      {/* 2. APP COMPACT HEADER (Clean Transit Brand, City & Tools) */}
      <header className="shrink-0 px-3.5 py-2.5 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10 shadow-xs">
        {/* Brand & City Dropdown */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-theme-primary text-white flex items-center justify-center font-black shadow-sm">
            <Train className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                RailOne
              </span>
              <button
                onClick={() => setShowCityPicker(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-theme-primary/10 hover:bg-theme-primary/20 text-theme-primary border border-theme-primary/20 text-[10px] font-bold transition-all"
                title="Change Transit Network"
              >
                <span>{currentCity.name}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            {/* Provenance Micro-Pill */}
            <div className="flex items-center gap-1 text-[9px] font-mono mt-0.5">
              <span className={`px-1 rounded text-[8px] font-bold ${
                currentCity.provenanceTag === '[VERIFIED LIVE]'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
              }`}>
                {currentCity.provenanceTag}
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5">
          {/* Language Toggle */}
          <button
            onClick={cycleLanguage}
            className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            title="Cycle Language (EN / HI / MR)"
          >
            {language}
          </button>

          {/* Theme Palette Button */}
          <button
            onClick={() => setShowThemeModal(true)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            title="Switch Livery & Color Theme"
          >
            <Palette className="w-4 h-4 text-theme-primary" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            title="Toggle Dark / Light Mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
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

    </div>
  );
};
