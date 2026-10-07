import React, { useEffect } from 'react';
import { useTheme, ColorTheme, THEME_CONFIG } from './ThemeContext';
import { 
  Palette, 
  Check, 
  Sun, 
  Moon, 
  X, 
  Sparkles, 
  Eye, 
  ShieldCheck, 
  Train 
} from 'lucide-react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { theme, setTheme, isDark, toggleDarkMode, language } = useTheme();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const themes: ColorTheme[] = [
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
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-theme-primary flex items-center justify-center text-white shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 id="theme-modal-title" className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'hi' ? 'दिखावट व थीम' : language === 'mr' ? 'स्वरूप आणि थीम' : 'Appearance & Rail Themes'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-theme-light text-theme-text border border-theme-border">
                  8 Accessible Palettes
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi' ? 'भारतीय रेल व मुंबई लोकल की प्रामाणिक रंग योजनाएं' : 'Authentic Indian Railways & Suburban express transit color palettes'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close Appearance dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle Bar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-theme-primary" />
            Surface Lighting Mode:
          </span>
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold border border-slate-200 dark:border-slate-600 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          >
            {isDark ? (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span>Dark Mode (Active)</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light Mode (Active)</span>
              </>
            )}
          </button>
        </div>

        {/* Theme Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {themes.map((t) => {
              const cfg = THEME_CONFIG[t];
              const isSelected = theme === t;

              return (
                <div
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all text-left flex flex-col justify-between ${
                    isSelected
                      ? 'border-theme-primary bg-slate-50/80 dark:bg-slate-800/80 shadow-md ring-2 ring-theme-primary/20'
                      : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Header swatch & title */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-7 h-7 rounded-xl shadow-xs border border-white/20 flex items-center justify-center text-white"
                          style={{ backgroundColor: cfg.primaryHex }}
                        >
                          <Train className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {language === 'hi' ? cfg.hindiName : language === 'mr' ? cfg.marathiName : cfg.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {cfg.primaryHex}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-theme-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {cfg.description}
                    </p>
                  </div>

                  {/* Visual Mock Element Swatches */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="px-2 py-0.5 rounded-md font-bold text-white"
                        style={{ backgroundColor: cfg.primaryHex }}
                      >
                        Button
                      </span>
                      <span 
                        className="px-2 py-0.5 rounded-md font-medium border"
                        style={{ 
                          backgroundColor: `${cfg.primaryHex}15`,
                          color: cfg.primaryHex,
                          borderColor: `${cfg.primaryHex}40`
                        }}
                      >
                        Active Tab
                      </span>
                    </div>

                    <span className="text-slate-400 font-medium">
                      {t === 'contrast' ? 'WCAG AAA' : 'WCAG AA'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Institutional Integrity Notice:</strong> Emergency signals, track congestion alerts, and punctual badges strictly maintain standard transit safety colors (Red = Delay &gt;30m / Prohibited, Amber = Caution, Green = On-time) regardless of the aesthetic accent palette selected.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Selected Theme: <strong className="text-slate-900 dark:text-white">{THEME_CONFIG[theme].name}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-theme-primary text-white font-bold text-xs shadow-xs hover-bg-theme-primary transition-colors min-h-[38px]"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
