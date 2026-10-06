import React, { useState } from 'react';
import { 
  Train, 
  Layers, 
  Radio, 
  Mic, 
  Ticket, 
  BookOpen, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Palette,
  Bot,
  Zap,
  Check,
  ChevronDown,
  Navigation
} from 'lucide-react';
import { useTheme, ColorTheme, AppLanguage, THEME_CONFIG } from './ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedTicketCount: number;
  onOpen3DTrain?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  savedTicketCount,
  onOpen3DTrain 
}) => {
  const { theme, setTheme, isDark, toggleDarkMode, language, setLanguage } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const navItems = [
    { id: 'journey', label: language === 'hi' ? 'यात्रा निर्णय' : language === 'mr' ? 'प्रवास निर्णय' : 'Journey Decision', icon: Train },
    { id: 'map', label: language === 'hi' ? 'नेटवर्क मैप' : language === 'mr' ? 'नेटवर्क नकाशा' : 'Live Rail Map', icon: Navigation, isNew: true },
    { id: 'ai_tasks', label: language === 'hi' ? 'कार्य व सहायता' : language === 'mr' ? 'कार्ये व मदत' : 'Operations & Tasks', icon: Bot },
    { id: 'scenarios', label: language === 'hi' ? 'परिदृश्य लैब' : language === 'mr' ? 'परिदृश्य लॅब' : 'Scenarios Lab', icon: Layers },
    { id: 'tracker', label: language === 'hi' ? 'लाइव ट्रैकर' : language === 'mr' ? 'थेट ट्रॅकर' : 'Live OCC Status', icon: Radio },
    { id: 'voice', label: language === 'hi' ? 'रेलसाथी आवाज़' : language === 'mr' ? 'रेलसाथी आवाज' : 'RailSathi Voice', icon: Mic },
    { id: 'wallet', label: language === 'hi' ? 'नमूना टिकट' : language === 'mr' ? 'नमुना तिकीट' : 'Specimen Wallet', icon: Ticket, badge: savedTicketCount },
    { id: 'rules', label: language === 'hi' ? 'नियम व किराया' : language === 'mr' ? 'नियम व भाडे' : 'Rules & MST', icon: BookOpen },
  ];

  const themeList: ColorTheme[] = [
    'ocean',
    'forest',
    'violet',
    'sunset',
    'cyber',
    'crimson',
    'gold',
    'contrast'
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group" 
            onClick={() => setActiveTab('journey')}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-sm font-bold text-lg group-hover:scale-105 transition-transform">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  RailOne<span className="text-blue-600 dark:text-blue-400">Next</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  CRIS Redesign
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Suburban & National Railway Decision Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative min-h-[40px] ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.isNew && (
                    <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-black bg-blue-700 text-white uppercase tracking-wider">
                      {item.id === 'map' ? '2D/3D' : 'OCC'}
                    </span>
                  )}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls: 3D Train, Theme Palette, Dark/Light, Language */}
          <div className="flex items-center gap-2">
            
            {/* 3D Train Experience Button */}
            {onOpen3DTrain && (
              <button
                onClick={onOpen3DTrain}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-300 dark:border-amber-700/60 transition-all shadow-xs active:scale-95 min-h-[38px]"
                title="Launch 3D Train Moving Simulation"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">3D Train Sim</span>
              </button>
            )}

            {/* Language Selector */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 text-xs font-semibold">
              {(['en', 'hi', 'mr'] as AppLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    language === lang 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Theme Palette Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all min-h-[38px] flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                title="Select Railway Livery & Palette (8 Colors)"
                aria-label="Change color theme"
              >
                <span 
                  className="w-3.5 h-3.5 rounded-full border border-white shadow-xs inline-block"
                  style={{ backgroundColor: THEME_CONFIG[theme].primaryHex }}
                />
                <Palette className="w-3.5 h-3.5" />
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showThemeMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowThemeMenu(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fadeIn">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Railway Theme Liveries
                    </span>
                    <span className="text-[10px] text-blue-600 font-mono font-bold">8 Options</span>
                  </div>
                  <div className="p-1 space-y-1 max-h-72 overflow-y-auto">
                    {themeList.map((tId) => {
                      const cfg = THEME_CONFIG[tId];
                      const isSelected = theme === tId;
                      return (
                        <button
                          key={tId}
                          onClick={() => {
                            setTheme(tId);
                            setShowThemeMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                            isSelected 
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800' 
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span 
                              className="w-4 h-4 rounded-full border border-white/80 shadow-xs shrink-0" 
                              style={{ backgroundColor: cfg.primaryHex }}
                            />
                            <div>
                              <div className="font-semibold text-xs leading-tight">{cfg.name}</div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500">{cfg.hindiName}</div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center shadow-xs"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="xl:hidden fixed inset-0 top-16 z-30 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="xl:hidden relative z-40 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-1.5 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.isNew && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white uppercase font-mono">
                      {item.id === 'map' ? '2D/3D' : 'OCC'}
                    </span>
                  )}
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Language:</span>
            <div className="flex items-center gap-1">
              {(['en', 'hi', 'mr'] as AppLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 rounded-lg font-bold ${
                    language === lang ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
      )}
    </header>
  );
};
