import React, { createContext, useContext, useState, useEffect } from 'react';

export type ColorTheme = 
  | 'ocean' 
  | 'forest' 
  | 'violet' 
  | 'sunset' 
  | 'cyber' 
  | 'crimson' 
  | 'gold' 
  | 'contrast';

export type AppLanguage = 'en' | 'hi' | 'mr';

interface ThemeContextType {
  theme: ColorTheme;
  setTheme: (t: ColorTheme) => void;
  language: AppLanguage;
  setLanguage: (l: AppLanguage) => void;
  isDark: boolean;
  setIsDark: (d: boolean) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEME_CONFIG: Record<ColorTheme, {
  name: string;
  hindiName: string;
  marathiName: string;
  primaryHex: string;
  accentHex: string;
  description: string;
}> = {
  ocean: {
    name: 'Electric Ocean (IR Blue)',
    hindiName: 'इलेक्ट्रिक ब्लू (रेलवे)',
    marathiName: 'इलेक्ट्रिक ब्लू (रेल्वे)',
    primaryHex: '#2563eb',
    accentHex: '#60a5fa',
    description: 'Classic CRIS Indian Railways institutional livery'
  },
  forest: {
    name: 'Emerald Heritage Express',
    hindiName: 'एमराल्ड ग्रीन एक्सप्रेस',
    marathiName: 'एमराल्ड ग्रीन एक्सप्रेस',
    primaryHex: '#059669',
    accentHex: '#34d399',
    description: 'Central Railway Western Ghats & green corridor tone'
  },
  violet: {
    name: 'Royal Deccan Empress',
    hindiName: 'रॉयल डेक्कन पर्पल',
    marathiName: 'रॉयल डेक्कन पर्पल',
    primaryHex: '#7c3aed',
    accentHex: '#c084fc',
    description: 'Western Railway premium intercity express aura'
  },
  sunset: {
    name: 'Konkan Saffron Sunset',
    hindiName: 'कोंकण भगवा सूर्यास्त',
    marathiName: 'कोकण भगवा सूर्यास्त',
    primaryHex: '#ea580c',
    accentHex: '#fb923c',
    description: 'Warm Konkan coastal gradient & vibrant travel aesthetic'
  },
  cyber: {
    name: 'Vande Bharat Electric Cyan',
    hindiName: 'वंदे भारत इलेक्ट्रिक सियान',
    marathiName: 'वंदे भारत इलेक्ट्रिक सायन',
    primaryHex: '#0891b2',
    accentHex: '#38bdf8',
    description: 'Aerodynamic high-speed bullet train aesthetic'
  },
  crimson: {
    name: 'Rajdhani Heritage Ruby',
    hindiName: 'राजधानी हेरिटेज लाल',
    marathiName: 'राजधानी हेरिटेज लाल',
    primaryHex: '#dc2626',
    accentHex: '#f87171',
    description: 'Iconic Rajdhani & Shatabdi red express livery'
  },
  gold: {
    name: 'Tejas Imperial Gold',
    hindiName: 'तेजस इम्पीरियल गोल्ड',
    marathiName: 'तेजस इम्पीरियल गोल्ड',
    primaryHex: '#ca8a04',
    accentHex: '#fde047',
    description: 'Modern luxury passenger rail bronze & gold'
  },
  contrast: {
    name: 'CRIS Accessible High-Contrast',
    hindiName: 'उच्च कंट्रास्ट (सुलभता)',
    marathiName: 'हाय कॉन्ट्रास्ट (सुलभता)',
    primaryHex: '#0f172a',
    accentHex: '#ffffff',
    description: 'Ultra-crisp WCAG AAA contrast for daylight outdoor visibility'
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ColorTheme>(() => {
    try {
      const saved = localStorage.getItem('railone_theme_palette');
      return (saved as ColorTheme) || 'ocean';
    } catch {
      return 'ocean';
    }
  });

  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('railone_language');
      return (saved as AppLanguage) || 'en';
    } catch {
      return 'en';
    }
  });

  const [isDark, setIsDarkState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('railone_dark_mode');
      if (saved !== null) return saved === 'true';
      return false;
    } catch {
      return false;
    }
  });

  const setTheme = (t: ColorTheme) => {
    setThemeState(t);
    try {
      localStorage.setItem('railone_theme_palette', t);
    } catch {}
  };

  const setLanguage = (l: AppLanguage) => {
    setLanguageState(l);
    try {
      localStorage.setItem('railone_language', l);
    } catch {}
  };

  const setIsDark = (d: boolean) => {
    setIsDarkState(d);
    try {
      localStorage.setItem('railone_dark_mode', String(d));
    } catch {}
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', theme);
    const themeClasses = ['theme-ocean', 'theme-forest', 'theme-violet', 'theme-sunset', 'theme-cyber', 'theme-crimson', 'theme-gold', 'theme-contrast'];
    themeClasses.forEach(c => {
      document.documentElement.classList.remove(c);
      document.body?.classList.remove(c);
    });
    document.documentElement.classList.add(`theme-${theme}`);
    document.body?.classList.add(`theme-${theme}`);
  }, [isDark, theme]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      language, 
      setLanguage, 
      isDark, 
      setIsDark,
      toggleDarkMode 
    }}>
      <div className={`theme-${theme} ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} min-h-screen transition-colors duration-200 antialiased`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
