import React, { useState } from 'react';
import { 
  Train, 
  Home, 
  Navigation, 
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
  Compass,
  Sparkles
} from 'lucide-react';
import { useTheme, ColorTheme, AppLanguage, THEME_CONFIG } from './ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedTicketCount: number;
  onOpenThemeModal: () => void;
  onOpen3DTrain?: () => void;
  onOpenGodsEye?: (stationCode: string) => void;
  onOpenCoachGuide?: () => void;
  onOpenDossier?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  savedTicketCount,
  onOpenThemeModal,
  onOpen3DTrain,
  onOpenGodsEye,
  onOpenCoachGuide,
  onOpenDossier 
}) => {
  const { theme, isDark, toggleDarkMode, language, setLanguage } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { 
      id: 'home', 
      label: language === 'hi' ? 'मुख्य पृष्ठ' : language === 'mr' ? 'मुख्य पान' : 'Home', 
      icon: Home 
    },
    { 
      id: 'journey', 
      label: language === 'hi' ? 'यात्रा निर्णय' : language === 'mr' ? 'प्रवास निर्णय' : 'Plan Journey', 
      icon: Train 
    },
    { 
      id: 'status', 
      label: language === 'hi' ? 'नेटवर्क व लाइव स्थिति' : language === 'mr' ? 'नेटवर्क व थेट स्थिती' : 'Network & Status', 
      icon: Navigation, 
      badgeLabel: '2D/3D' 
    },
    { 
      id: 'tickets', 
      label: language === 'hi' ? 'मेरी टिकटें' : language === 'mr' ? 'माझी तिकिटे' : 'My Tickets', 
      icon: Ticket, 
      count: savedTicketCount 
    },
    { 
      id: 'help', 
      label: language === 'hi' ? 'मदद व रेलसाथी' : language === 'mr' ? 'मदत व रेलसाथी' : 'Help & RailSathi', 
      icon: Mic 
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Passenger Branding */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group" 
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-theme-primary flex items-center justify-center text-white shadow-xs font-bold text-lg group-hover:scale-105 transition-transform">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  RailOne<span className="text-theme-primary">Next</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-extrabold px-1.5 py-0.5 rounded bg-theme-light text-theme-text border border-theme-border">
                  NextGen Redesign
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Mumbai Suburban & Pan-India Passenger Transit
              </p>
            </div>
          </div>

          {/* Desktop Nav Items (5 Clean Tabs) */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative min-h-[40px] ${
                    isActive 
                      ? 'bg-theme-primary text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badgeLabel && (
                    <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-black uppercase ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {item.badgeLabel}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold font-mono ${
                      isActive ? 'bg-white text-slate-900' : 'bg-theme-primary text-white'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls: Station 3D, Theme Palettes Modal, Dark/Light, Language */}
          <div className="flex items-center gap-2">
            
            {/* Coach Guide & Wagenstandsanzeiger Shortcut */}
            {onOpenCoachGuide && (
              <button
                onClick={onOpenCoachGuide}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all min-h-[38px]"
                title="Platform Coach Alignment Guide (Wagenstandsanzeiger)"
              >
                <Train className="w-3.5 h-3.5 text-theme-primary" />
                <span>Coach Guide</span>
              </button>
            )}

            {/* Academic & System Dossier Shortcut */}
            {onOpenDossier && (
              <button
                onClick={onOpenDossier}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-primary/10 hover:bg-theme-primary/20 text-theme-primary font-bold text-xs border border-theme-primary/30 transition-all min-h-[38px]"
                title="Open System Architecture Dossier & Technical Specifications"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>System Dossier</span>
              </button>
            )}

            {/* Quick 3D Wayfinding Shortcut */}
            {onOpenGodsEye && (
              <button
                onClick={() => onOpenGodsEye('DR')}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all min-h-[38px]"
                title="Launch 3D Station God's Eye Wayfinding"
              >
                <Compass className="w-3.5 h-3.5 text-theme-primary" />
                <span>3D Station</span>
              </button>
            )}

            {/* 3D Train Sim Quick Button */}
            {onOpen3DTrain && (
              <button
                onClick={onOpen3DTrain}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-300 dark:border-amber-700/60 transition-all min-h-[38px]"
                title="Launch 3D Train Simulation"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>3D Sim</span>
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

            {/* Appearance & Themes Modal Trigger */}
            <button
              onClick={onOpenThemeModal}
              className="px-2.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all min-h-[38px] flex items-center gap-2 text-xs font-bold shadow-xs"
              title="Change Railway Theme & Color Livery (8 Palettes)"
              aria-label="Open Appearance Themes Modal"
            >
              <span 
                className="w-3.5 h-3.5 rounded-full border border-white shadow-xs inline-block"
                style={{ backgroundColor: THEME_CONFIG[theme].primaryHex }}
              />
              <Palette className="w-3.5 h-3.5 text-theme-primary" />
              <span className="hidden sm:inline">{THEME_CONFIG[theme].name}</span>
            </button>

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
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
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
            className="lg:hidden fixed inset-0 top-16 z-30 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="lg:hidden relative z-40 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-1.5 animate-fadeIn">
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    isActive 
                      ? 'bg-theme-primary text-white shadow-xs' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badgeLabel && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/20 uppercase font-mono">
                        {item.badgeLabel}
                      </span>
                    )}
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-white text-slate-900 text-xs font-bold font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Mobile Actions: Appearance, 3D Sim, Coach Guide, System Dossier */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenThemeModal();
                }}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Palette className="w-4 h-4 text-theme-primary" />
                <span>Themes (8)</span>
              </button>

              {onOpenCoachGuide && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCoachGuide();
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Train className="w-4 h-4 text-theme-primary" />
                  <span>Coach Guide</span>
                </button>
              )}

              {onOpenDossier && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDossier();
                  }}
                  className="py-2 px-3 rounded-xl bg-theme-primary/10 text-theme-primary text-xs font-bold flex items-center justify-center gap-2 border border-theme-primary/30"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>System Dossier</span>
                </button>
              )}

              {onOpenGodsEye && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenGodsEye('DR');
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-theme-primary" />
                  <span>3D Station</span>
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Language:</span>
              <div className="flex items-center gap-1">
                {(['en', 'hi', 'mr'] as AppLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2.5 py-1 rounded-lg font-bold ${
                      language === lang ? 'bg-theme-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
