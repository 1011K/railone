import React from 'react';
import { useTheme, ColorTheme, THEME_CONFIG } from './ThemeContext';
import { AccessibleModal } from './common/AccessibleModal';
import { 
  Palette, 
  Check, 
  Sun, 
  Moon, 
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
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Railway Livery & Palette System"
      subtitle="8 Accessible WCAG 2.1 AAA High-Contrast Indian Railways Liveries"
      icon={<Palette className="w-5 h-5 text-theme-primary" />}
      variant="sheet"
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Dark/Light Mode Switcher Row */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <div>
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              {isDark ? <Moon className="w-4 h-4 text-theme-primary" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>{isDark ? 'Dark Mode Active' : 'Light Mode Active'}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Optimized for high-contrast visibility under direct sunlight or late-night commuter travel.
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold shadow-xs border border-slate-200 dark:border-slate-600 hover:bg-slate-50 min-h-[44px] touch-target transition-all"
          >
            {isDark ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {themes.map((th) => {
            const conf = THEME_CONFIG[th];
            const isSelected = theme === th;

            return (
              <div
                key={th}
                onClick={() => setTheme(th)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between min-h-[64px] touch-target ${
                  isSelected 
                    ? 'border-theme-primary bg-theme-primary/5 dark:bg-theme-primary/10 shadow-sm' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Color Swatch Dot */}
                  <div 
                    className="w-8 h-8 rounded-xl shadow-xs flex items-center justify-center shrink-0 mt-0.5 border border-black/10"
                    style={{ backgroundColor: conf.primaryHex }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {conf.name}
                      </span>
                      {th === 'contrast' && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 font-bold">
                          AAA
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {conf.description}
                    </div>
                  </div>
                </div>

                <span className="font-mono text-[10px] text-slate-400 shrink-0 mt-0.5 ml-2">
                  {conf.primaryHex}
                </span>
              </div>
            );
          })}
        </div>

        {/* Accessibility & Safety Notice */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong>Institutional Integrity Notice:</strong> Emergency signals, track congestion alerts, and punctual badges strictly maintain standard transit safety colors (Red = Delay &gt;30m / Prohibited, Amber = Caution, Green = On-time) regardless of the aesthetic accent palette selected.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Selected: <strong className="text-slate-900 dark:text-white">{THEME_CONFIG[theme].name}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-theme-primary text-white font-bold text-xs shadow-xs hover-bg-theme-primary transition-colors min-h-[44px] touch-target"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </AccessibleModal>
  );
};
