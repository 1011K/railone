/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { Navbar } from './components/Navbar';
import { SystemModeBanner } from './components/SystemModeBanner';
import { JourneyDecisionView } from './components/JourneyDecisionView';
import { AiTasksView } from './components/AiTasksView';
import { ScenariosLab } from './components/ScenariosLab';
import { TrainLiveTracker } from './components/TrainLiveTracker';
import { RulesReferenceView } from './components/RulesReferenceView';
import { VoiceDialerModal } from './components/VoiceDialerModal';
import { SpecimenTicketModal } from './components/SpecimenTicketModal';
import { TicketWalletModal } from './components/TicketWalletModal';
import { MovingTrain3DModal } from './components/MovingTrain3DModal';
import { MockBookingStore } from './engine/mockBookingStore';
import { JourneyItinerary, TravelClass, SpecimenTicket } from './types/railway';
import { 
  Train, 
  Mic, 
  Ticket, 
  Radio, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  ExternalLink,
  Bot,
  Zap
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('journey');
  const [is3DTrainOpen, setIs3DTrainOpen] = useState(false); // 3D train moving experience available on demand
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
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
    setActiveTab('tracker');
  };

  const handleBookingCreated = (ticket: SpecimenTicket) => {
    setSavedTicketCount(MockBookingStore.listBookings().length);
  };

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        
        {/* System Mode & Provenance Banner */}
        <SystemModeBanner />

        {/* Global Navigation Bar */}
        <Navbar 
          activeTab={activeTab === 'voice' || activeTab === 'wallet' ? 'journey' : activeTab} 
          setActiveTab={(tab) => {
            if (tab === 'voice') {
              setIsVoiceModalOpen(true);
            } else if (tab === 'wallet') {
              setIsWalletModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          savedTicketCount={savedTicketCount}
          onOpen3DTrain={() => setIs3DTrainOpen(true)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'journey' && (
            <JourneyDecisionView
              onBookSpecimen={handleOpenBooking}
              onInspectTrain={handleInspectTrain}
            />
          )}

          {activeTab === 'ai_tasks' && (
            <AiTasksView 
              onSearchRouteShortcut={(from, to) => {
                setActiveTab('journey');
              }}
            />
          )}

          {activeTab === 'scenarios' && (
            <ScenariosLab
              onBookSpecimen={handleOpenBooking}
              onInspectTrain={handleInspectTrain}
            />
          )}

          {activeTab === 'tracker' && (
            <TrainLiveTracker
              initialTrainNumber={inspectedTrainNumber}
            />
          )}

          {activeTab === 'rules' && (
            <RulesReferenceView />
          )}
        </main>

        {/* Floating Quick Action Buttons (Mobile & Desktop) */}
        <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
          {/* 3D Train Simulator Quick Floating Button */}
          <button
            onClick={() => setIs3DTrainOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900/90 dark:bg-slate-800/90 hover:bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700/60 font-bold text-xs transition-all active:scale-95 group backdrop-blur-xs"
            aria-label="Launch 3D Train Simulation"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">3D Train Sim</span>
          </button>

          {/* Quick Voice Assistant Floating Button */}
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl hover:shadow-2xl font-bold text-xs transition-all active:scale-95 group ring-4 ring-blue-500/20"
            aria-label="Open RailSathi Voice Assistant"
          >
            <Mic className="w-4 h-4 animate-pulse group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Voice & Dialer</span>
          </button>

          {/* Quick Wallet Floating Button */}
          {savedTicketCount > 0 && (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-lg font-bold text-xs transition-all active:scale-95"
              aria-label="Open Specimen Wallet"
            >
              <Ticket className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>{savedTicketCount} Specimen{savedTicketCount > 1 ? 's' : ''}</span>
            </button>
          )}
        </div>

        {/* 3D Moving Train Opening Animation Modal */}
        <MovingTrain3DModal
          isOpen={is3DTrainOpen}
          onClose={() => setIs3DTrainOpen(false)}
        />

        {/* Modals */}
        <VoiceDialerModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onViewTicketWallet={() => {
            setIsVoiceModalOpen(false);
            setIsWalletModalOpen(true);
          }}
        />

        <SpecimenTicketModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          itinerary={selectedItinerary}
          selectedClass={selectedClass}
          onBookingCreated={handleBookingCreated}
        />

        <TicketWalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
        />

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">RailOne Next</span>
              <span>·</span>
              <span>Academic Engineering Redesign</span>
              <span>·</span>
              <span>CRIS & Indian Railways Conceptual Model</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <button 
                onClick={() => setActiveTab('rules')}
                className="hover:text-slate-800 dark:hover:text-slate-300 underline"
              >
                MST List & Legal Section 138
              </button>
              <button 
                onClick={() => setActiveTab('scenarios')}
                className="hover:text-slate-800 dark:hover:text-slate-300 underline"
              >
                Commuter Dilemma Scenarios
              </button>
            </div>
          </div>
        </footer>

      </div>
    </ThemeProvider>
  );
}
