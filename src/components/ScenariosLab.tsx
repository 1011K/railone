import React, { useState } from 'react';
import { COMMUTER_SCENARIOS } from '../fixtures/scenarios';
import { STATIONS, TRAIN_TRIPS, INITIAL_OBSERVATIONS } from '../fixtures/railwayData';
import { planJourneys } from '../engine/journeyEngine';
import { evaluateJourneyEligibility } from '../engine/eligibilityEngine';
import { ItineraryCard } from './ItineraryCard';
import { JourneyItinerary, TravelClass } from '../types/railway';
import { 
  Play, 
  CheckCircle2, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface ScenariosLabProps {
  onBookSpecimen: (itinerary: JourneyItinerary, travelClass: TravelClass) => void;
  onInspectTrain: (trainNumber: string) => void;
}

export const ScenariosLab: React.FC<ScenariosLabProps> = ({
  onBookSpecimen,
  onInspectTrain
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState(COMMUTER_SCENARIOS[1].id); // Delay inversion by default

  const activeScenario = COMMUTER_SCENARIOS.find(s => s.id === selectedScenarioId) || COMMUTER_SCENARIOS[0];

  // Evaluate the scenario with its parameters
  const scenarioItineraries = planJourneys({
    originCode: activeScenario.originCode,
    destCode: activeScenario.destCode,
    departureTime: activeScenario.timeContext,
    userContext: activeScenario.userContext,
    preferences: {
      classPreference: activeScenario.classPreference,
      priority: 'fastest',
      hasSeasonPass: activeScenario.id.includes('express') || activeScenario.id.includes('mst'),
      walkToStationMinutes: 12,
      maxTransfers: 1
    }
  });

  return (
    <div className="space-y-6">
      
      {/* Introduction Card */}
      <section aria-label="Scenarios Lab Overview" className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Evaluation Scenarios Suite
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Interactive Commuter Decision Lab
            </h2>
            <p className="text-xs text-blue-200 max-w-2xl leading-relaxed">
              Verify how RailOne Next tackles genuine passenger dilemmas: delay inversion where a slow train beats a delayed fast train, leave-home calculation before origin departure, transfer walking time guarantees, and legal Express boarding eligibility.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-blue-950/80 px-4 py-2.5 rounded-xl border border-blue-700 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Deterministic Scenario Engine Active</span>
          </div>
        </div>

        {/* Scenarios Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mt-6">
          {COMMUTER_SCENARIOS.map((sc) => {
            const isSelected = selectedScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`p-3 rounded-xl text-left text-xs transition-all border min-h-[44px] flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-white text-slate-900 border-white font-semibold shadow-md ring-2 ring-blue-400' 
                    : 'bg-blue-950/60 hover:bg-blue-900/80 text-blue-100 border-blue-800/80'
                }`}
              >
                <div className="font-bold line-clamp-1">{sc.title}</div>
                <div className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-slate-600' : 'text-blue-300'}`}>
                  {sc.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Scenario Explainer */}
      <section aria-label="Scenario Details" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Active Scenario Analysis</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeScenario.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {STATIONS[activeScenario.originCode]?.name} ➔ {STATIONS[activeScenario.destCode]?.name} · Time: {activeScenario.timeContext} · Mode: {activeScenario.userContext.replace('_', ' ')}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-xs md:max-w-md">
            <span className="font-semibold text-slate-900 dark:text-white block mb-1">
              Key Academic & Algorithmic Principle:
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              {activeScenario.keyLearning}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
          <strong>Scenario Narrative: </strong>
          {activeScenario.description}
        </div>
      </section>

      {/* Generated Itinerary Outcomes for Active Scenario */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Algorithm Outputs ({scenarioItineraries.length} Options Evaluated)</span>
          </h4>
          <span className="text-xs text-slate-500">
            Ranked by passenger decision utility
          </span>
        </div>

        {scenarioItineraries.map((itinerary) => (
          <ItineraryCard
            key={itinerary.id}
            itinerary={itinerary}
            onBookSpecimen={onBookSpecimen}
            onInspectTrain={onInspectTrain}
          />
        ))}
      </div>

    </div>
  );
};
