import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { AiTasksView } from './AiTasksView';
import { RulesReferenceView } from './RulesReferenceView';
import { ScenariosLab } from './ScenariosLab';
import { 
  Mic, 
  Bot, 
  BookOpen, 
  Layers, 
  ShieldAlert, 
  HelpCircle, 
  PhoneCall, 
  AlertTriangle,
  Sparkles,
  Train,
  CheckCircle2,
  Volume2
} from 'lucide-react';

interface HelpAndRailSathiViewProps {
  onOpenVoiceModal?: () => void;
  onSearchRouteShortcut?: (from: string, to: string) => void;
  onBookSpecimen?: (itinerary: any, travelClass: any) => void;
  onInspectTrain?: (trainNumber: string) => void;
}

export const HelpAndRailSathiView: React.FC<HelpAndRailSathiViewProps> = ({
  onOpenVoiceModal,
  onSearchRouteShortcut,
  onBookSpecimen,
  onInspectTrain
}) => {
  const { language } = useTheme();
  const [subTab, setSubTab] = useState<'grievance' | 'rules' | 'dev_scenarios'>('grievance');
  const [devModeEnabled, setDevModeEnabled] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Voice Assistant Showcase Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 text-white shadow-xl border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/30 text-purple-200 border border-purple-400/30">
              RailSathi Multilingual AI Voice
            </span>
            <span className="text-xs text-purple-300 font-medium">
              English · हिन्दी · मराठी
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Need Instant Journey Assistance or Station Directions?
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
            Talk to RailSathi in your mother tongue for automated station normalization (e.g. "कल्याण से दादर अगली लोकल कब है?"), platform transfers, and grievance filings.
          </p>
        </div>

        {onOpenVoiceModal && (
          <button
            onClick={onOpenVoiceModal}
            className="px-5 py-3 rounded-2xl bg-white text-purple-950 font-black text-xs hover:bg-purple-50 transition-all shadow-lg flex items-center gap-2 shrink-0 min-h-[44px]"
          >
            <Mic className="w-4 h-4 text-purple-600 animate-pulse" />
            <span>Launch Voice Assistant</span>
          </button>
        )}
      </div>

      {/* Segmented Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setSubTab('grievance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              subTab === 'grievance'
                ? 'bg-theme-primary text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>CRIS RailMadad & AI Operations</span>
          </button>

          <button
            onClick={() => setSubTab('rules')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              subTab === 'rules'
                ? 'bg-theme-primary text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Railway Rules & Section 138 Penalties</span>
          </button>

          {devModeEnabled && (
            <button
              onClick={() => setSubTab('dev_scenarios')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                subTab === 'dev_scenarios'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 dark:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Scenarios Lab (Dev Mode)</span>
            </button>
          )}
        </div>

        {/* Developer Mode Diagnostics Toggle */}
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400 select-none">
            <input
              type="checkbox"
              checked={devModeEnabled}
              onChange={(e) => {
                setDevModeEnabled(e.target.checked);
                if (!e.target.checked && subTab === 'dev_scenarios') {
                  setSubTab('grievance');
                }
              }}
              className="rounded border-slate-300 dark:border-slate-700 text-theme-primary focus:ring-theme-primary"
            />
            <span className="font-semibold text-[11px]">Developer Diagnostics Mode</span>
          </label>
        </div>
      </div>

      {/* Content Viewports */}
      {subTab === 'grievance' && (
        <AiTasksView onSearchRouteShortcut={onSearchRouteShortcut} />
      )}

      {subTab === 'rules' && (
        <RulesReferenceView />
      )}

      {subTab === 'dev_scenarios' && devModeEnabled && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Developer Scenario Lab:</strong> Execute simulated operational disruptions (signal failures, mega-blocks, cancelled rakes) to benchmark journey engine replanning.
            </span>
          </div>
          <ScenariosLab
            onBookSpecimen={onBookSpecimen || (() => {})}
            onInspectTrain={onInspectTrain || (() => {})}
          />
        </div>
      )}

    </div>
  );
};
