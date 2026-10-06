/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { Navbar } from './components/Navbar';
import { SystemModeBanner } from './components/SystemModeBanner';
import { HomePassengerView } from './components/HomePassengerView';
import { JourneyDecisionView } from './components/JourneyDecisionView';
import { NetworkAndStatusView } from './components/NetworkAndStatusView';
import { MyTicketsView } from './components/MyTicketsView';
import { HelpAndRailSathiView } from './components/HelpAndRailSathiView';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { VoiceDialerModal } from './components/VoiceDialerModal';
import { SpecimenTicketModal } from './components/SpecimenTicketModal';
import { MockBookingStore } from './engine/mockBookingStore';
import { JourneyItinerary, TravelClass, SpecimenTicket } from './types/railway';
import { 
  Train, 
  Mic, 
  Ticket, 
  Navigation, 
  ShieldCheck, 
  Compass,
  Zap,
  Sparkles
} from 'lucide-react';

const MovingTrain3DModal = React.lazy(() => import('./components/MovingTrain3DModal'));
const StationGodsEyeModal = React.lazy(() => import('./components/StationGodsEyeModal'));

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [journeyOrigin, setJourneyOrigin] = useState<string>('TNA');
  const [journeyDest, setJourneyDest] = useState<string>('CSMT');

  // Modals state
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [is3DTrainOpen, setIs3DTrainOpen] = useState(false);
  const [isGodsEyeOpen, setIsGodsEyeOpen] = useState(false);
  const [godsEyeStationCode, setGodsEyeStationCode] = useState('DR');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<JourneyItinerary | null>(null);
  const [selectedClass, setSelectedClass] = useState<TravelClass>('II');
  const [inspectedTrainNumber, setInspectedTrainNumber] = useState<string>('95112');
  const [savedTicketCount, setSavedTicketCount] = useState<number>(0);

  useEffect(() => {
    setSavedTicketCount(MockBookingStore.listBookings().length);
  }, []);

  const handleOpenBooking = (itinerary: JourneyItinerary, travelClass: TravelClass) => {
    setSelectedItinerary(itinerary);
    setSelectedClass(travelClass);
    setIsTicketModalOpen(true);
  };

  const handleInspectTrain = (trainNumber: string) => {
    setInspectedTrainNumber(trainNumber);
    setActiveTab('status');
  };

  const handleOpenGodsEye = (stationCode: string = 'DR') => {
    setGodsEyeStationCode(stationCode);
    setIsGodsEyeOpen(true);
  };

  const handleBookingCreated = (ticket: SpecimenTicket) => {
    setSavedTicketCount(MockBookingStore.listBookings().length);
  };

  const handleNavigateFromHome = (tab: string, params?: { origin?: string; dest?: string }) => {
    if (params?.origin) setJourneyOrigin(params.origin);
    if (params?.dest) setJourneyDest(params.dest);
    setActiveTab(tab);
  };

  const handlePlanRouteFromStation = (stationCode: string) => {
    setJourneyOrigin(stationCode);
    setActiveTab('journey');
  };

  const handlePlanRouteToStation = (stationCode: string) => {
    setJourneyDest(stationCode);
    setActiveTab('journey');
  };

  const handleSearchRouteShortcut = (from: string, to: string) => {
    setJourneyOrigin(from);
    setJourneyDest(to);
    setActiveTab('journey');
  };

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        
        {/* System Mode & Provenance Banner */}
        <SystemModeBanner />

        {/* Global Navigation Bar */}
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          savedTicketCount={savedTicketCount}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onOpen3DTrain={() => setIs3DTrainOpen(true)}
          onOpenGodsEye={handleOpenGodsEye}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 w-full">
          {activeTab === 'home' && (
            <HomePassengerView
              onNavigateTab={handleNavigateFromHome}
              onOpenStationGodsEye={handleOpenGodsEye}
              onOpenThemeModal={() => setIsThemeModalOpen(true)}
            />
          )}

          {activeTab === 'journey' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <JourneyDecisionView
                initialOriginCode={journeyOrigin}
                initialDestCode={journeyDest}
                onBookSpecimen={handleOpenBooking}
                onInspectTrain={handleInspectTrain}
              />
            </div>
          )}

          {activeTab === 'status' && (
            <NetworkAndStatusView
              onPlanRouteFromStation={handlePlanRouteFromStation}
              onPlanRouteToStation={handlePlanRouteToStation}
              onOpenGodsEye={handleOpenGodsEye}
              initialTrainNumber={inspectedTrainNumber}
            />
          )}

          {activeTab === 'tickets' && (
            <MyTicketsView
              onNavigateToJourney={() => setActiveTab('journey')}
              onViewStationGodsEye={handleOpenGodsEye}
            />
          )}

          {activeTab === 'help' && (
            <HelpAndRailSathiView
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onSearchRouteShortcut={handleSearchRouteShortcut}
              onBookSpecimen={handleOpenBooking}
              onInspectTrain={handleInspectTrain}
            />
          )}
        </main>

        {/* Floating RailSathi Voice Quick-Dialer (Compact & Unobtrusive) */}
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-theme-primary text-white rounded-2xl shadow-xl hover:shadow-2xl font-bold text-xs transition-all active:scale-95 group ring-4 ring-theme-primary/20"
            aria-label="Open RailSathi Voice Assistant"
            title="RailSathi Multilingual Voice Assistant"
          >
            <Mic className="w-4 h-4 animate-pulse group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">RailSathi Voice</span>
          </button>
        </div>

        {/* Theme Selector Modal */}
        <ThemeSelectorModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
        />

        {/* 3D Moving Train Opening Animation Modal */}
        {is3DTrainOpen && (
          <React.Suspense fallback={null}>
            <MovingTrain3DModal
              isOpen={is3DTrainOpen}
              onClose={() => setIs3DTrainOpen(false)}
            />
          </React.Suspense>
        )}

        {/* 3D Station God's Eye Navigation Modal */}
        {isGodsEyeOpen && (
          <React.Suspense fallback={null}>
            <StationGodsEyeModal
              isOpen={isGodsEyeOpen}
              onClose={() => setIsGodsEyeOpen(false)}
              initialStationCode={godsEyeStationCode}
            />
          </React.Suspense>
        )}

        {/* Voice Assistant Modal */}
        <VoiceDialerModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onViewTicketWallet={() => {
            setIsVoiceModalOpen(false);
            setActiveTab('tickets');
          }}
        />

        {/* Booking Specimen Ticket Modal */}
        <SpecimenTicketModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          itinerary={selectedItinerary}
          selectedClass={selectedClass}
          onBookingCreated={handleBookingCreated}
        />

        {/* Institutional Footer */}
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 dark:text-slate-200">RailOne Next</span>
              <span>·</span>
              <span>Academic Engineering Redesign</span>
              <span>·</span>
              <span>CRIS & Indian Railways Conceptual Model</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <button 
                onClick={() => {
                  setActiveTab('help');
                }}
                className="hover:text-slate-800 dark:hover:text-slate-300 underline"
              >
                MST List & Legal Section 138
              </button>
              <button 
                onClick={() => setIsThemeModalOpen(true)}
                className="hover:text-slate-800 dark:hover:text-slate-300 underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-theme-primary" />
                <span>Appearance Liveries (8)</span>
              </button>
            </div>
          </div>
        </footer>

      </div>
    </ThemeProvider>
  );
}
