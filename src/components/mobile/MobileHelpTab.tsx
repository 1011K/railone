/**
 * RailOne Next — Mobile Help, Rail Yatri Assistant & Passenger Rights Tab
 * Commuter help center: Rail Yatri Voice & Booking Copilot, RPF 139 SOS,
 * RailMadad grievance assistant, Statutory Disclosures, and Livery Preferences.
 */

import React, { useState } from 'react';
import { useTheme, THEME_CONFIG, ColorTheme } from '../ThemeContext';
import { useAuthority } from '../AuthorityContext';
import { getTranslation } from '../../i18n/translations';
import { MobileRailSathiTab } from './MobileRailSathiTab';
import { 
  HelpCircle, 
  PhoneCall, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Palette, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Building2, 
  BookOpen,
  Bot
} from 'lucide-react';
import { AiRailwayService } from '../../services/aiService';

interface MobileHelpTabProps {
  onOpenInstitutionalDossier?: () => void;
  onOpen3DStation?: () => void;
  onViewTicketWallet?: () => void;
}

export const MobileHelpTab: React.FC<MobileHelpTabProps> = ({
  onOpenInstitutionalDossier,
  onOpen3DStation,
  onViewTicketWallet
}) => {
  const { theme, setTheme, language, isDark, toggleDarkMode } = useTheme();
  const { authority } = useAuthority();
  const t = getTranslation(language);

  // Sub-tab: 'assistant' | 'emergency'
  const [subTab, setSubTab] = useState<'assistant' | 'emergency'>('assistant');
  const [activeAccordion, setActiveAccordion] = useState<string | null>('emergency');
  
  // RailMadad Complaint Quick Drafter
  const [complaintType, setComplaintType] = useState('AC_TEMPERATURE');
  const [trainNumber, setTrainNumber] = useState('95114');
  const [coachNumber, setCoachNumber] = useState('AC-03');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [draftResult, setDraftResult] = useState<string | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);

  const handleDraftGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDrafting(true);
    try {
      const res = await AiRailwayService.draftGrievance(complaintType, trainNumber, coachNumber, complaintDesc);
      setDraftResult(res.draft);
    } catch {
      setDraftResult('Educational draft generated. For real complaints, visit railmadad.indianrailways.gov.in or call 139.');
    } finally {
      setIsDrafting(false);
    }
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-3.5 pb-24 px-3.5 pt-2 font-sans select-none">
      
      {/* Sub-tab Navigation */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
        <button
          onClick={() => setSubTab('assistant')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            subTab === 'assistant'
              ? 'bg-white dark:bg-slate-800 text-theme-primary shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-theme-primary animate-pulse" />
          <span>{t.railYatriTitle.split(' ')[0]} {t.railYatriTitle.split(' ')[1]}</span>
        </button>
        <button
          onClick={() => setSubTab('emergency')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            subTab === 'emergency'
              ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
          <span>{t.emergencyHelpline}</span>
        </button>
      </div>

      {/* VIEW A: Rail Yatri Assistant */}
      {subTab === 'assistant' && (
        <div className="pt-1">
          <MobileRailSathiTab 
            onViewTicketWallet={onViewTicketWallet || (() => {})} 
          />
        </div>
      )}

      {/* VIEW B: Emergency Helpline & Grievance Directorate */}
      {subTab === 'emergency' && (
        <div className="space-y-3">
          {/* Top Banner */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-theme-primary font-black text-xs uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>{t.ministryName}</span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {t.passengerRights}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official Indian Railways security contacts (139), grievance assistance, and commuter rights.
            </p>
          </div>

          {/* 1. Emergency Helpline Card */}
          <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shadow-xs">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-rose-900 dark:text-rose-200">
                    Statutory Helpline 139
                  </h2>
                  <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                    Integrated Railway Security & Grievance
                  </span>
                </div>
              </div>
              <a
                href="tel:139"
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors touch-target"
              >
                <span>Call 139</span>
              </a>
            </div>
            <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
              Integrated 24/7 Security, RPF, Medical & Passenger Grievance Assistance under The Railways Act, 1989.
            </p>
          </div>

          {/* 2. Accordions for Assistance Modules */}
          <div className="space-y-2">
            
            {/* Accordion A: RailMadad Official Complaint Drafter */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <button
                onClick={() => toggleAccordion('railmadad')}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors touch-target"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>{t.grievanceDrafter}</span>
                </span>
                {activeAccordion === 'railmadad' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {activeAccordion === 'railmadad' && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                  <form onSubmit={handleDraftGrievance} className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Issue Category</label>
                        <select
                          value={complaintType}
                          onChange={(e) => setComplaintType(e.target.value)}
                          className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        >
                          <option value="AC_TEMPERATURE">Coach AC Malfunction</option>
                          <option value="CLEANLINESS">Coach Cleanliness</option>
                          <option value="SECURITY">Passenger Safety / RPF</option>
                          <option value="WATER">Water Non-Availability</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Train Number</label>
                        <input
                          type="text"
                          value={trainNumber}
                          onChange={(e) => setTrainNumber(e.target.value)}
                          className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">Coach Number / Details</label>
                      <input
                        type="text"
                        value={coachNumber}
                        onChange={(e) => setCoachNumber(e.target.value)}
                        placeholder="e.g. AC-03, S-4, GS"
                        className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={complaintDesc}
                        onChange={(e) => setComplaintDesc(e.target.value)}
                        placeholder="Briefly describe the operational problem..."
                        className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isDrafting}
                      className="w-full py-2.5 rounded-xl bg-theme-primary text-white font-bold text-xs shadow-xs hover-bg-theme-primary transition-colors flex items-center justify-center gap-1.5 touch-target"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isDrafting ? 'Generating Template...' : 'Generate Official Grievance Draft'}</span>
                    </button>
                  </form>

                  {draftResult && (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {draftResult}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Accordion B: Passenger Rights & Statutory Rules */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <button
                onClick={() => toggleAccordion('rights')}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors touch-target"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>{authority.statutoryAct} & {t.passengerRights}</span>
                </span>
                {activeAccordion === 'rights' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {activeAccordion === 'rights' && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p>
                    <strong>Statutory Charter:</strong> Statutory Passenger Tariff & Unreserved Ticketing Framework.
                  </p>
                  <p>
                    <strong>Section 138 (Excess Charge):</strong> Travelling beyond station or without ticket attracts fare difference plus minimum ₹250 penalty.
                  </p>
                  <p>
                    <strong>Section 137 (Fraudulent Travel):</strong> Travel with intention to defraud railway revenue carries a fine up to ₹1,000 or imprisonment up to 6 months.
                  </p>
                  <p>
                    <strong>Section 162 (Reserved Ladies Compartment):</strong> Male entry into exclusively reserved women compartments is a punishable offence with fine and removal by RPF.
                  </p>
                  <p>
                    <strong>Data Protection:</strong> RailOne processes all transit queries in accordance with statutory passenger privacy regulations with zero telemetry harvesting.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion C: Transit Liveries & Preferences */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <button
                onClick={() => toggleAccordion('appearance')}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors touch-target"
              >
                <span className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-500" />
                  <span>{t.themePreferences}</span>
                </span>
                {activeAccordion === 'appearance' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {activeAccordion === 'appearance' && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">{t.switchTheme}:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(THEME_CONFIG) as ColorTheme[]).map(tKey => {
                        const cfg = THEME_CONFIG[tKey];
                        const isSelected = theme === tKey;
                        return (
                          <button
                            key={tKey}
                            onClick={() => setTheme(tKey)}
                            className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all min-h-[44px] ${
                              isSelected
                                ? 'border-theme-primary bg-theme-primary/10 font-bold'
                                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div 
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" 
                              style={{ backgroundColor: cfg.primaryHex }} 
                            />
                            <span className="truncate text-slate-800 dark:text-slate-200">{cfg.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {isDark ? t.darkMode : t.lightMode}
                    </span>
                    <button
                      onClick={toggleDarkMode}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                    >
                      {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Station Navigation Quick Link */}
          {onOpen3DStation && (
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                onClick={onOpen3DStation}
                className="w-full p-2 rounded-xl flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-theme-primary" />
                  <span>{t.stationNavTitle} ({t.stationNavSubtitle.split(',')[0]})</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
