import React, { createContext, useContext, useState, useEffect } from 'react';

export type ColorTheme =
  | 'central_navy'
  | 'western_signal'
  | 'harbour_cyan'
  | 'metro_sky'
  | 'vande_bharat_orange'
  | 'heritage_maroon'
  | 'high_contrast'
  | 'night_commuter';

export type AppLanguage = 'en' | 'hi' | 'mr';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  accent: string;
  background: string;
  card: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  danger: string;
  tabBar: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const THEME_PALETTES: Record<ColorTheme, { light: ThemeColors; dark: ThemeColors; name: string }> = {
  central_navy: {
    name: 'Central Deep Navy',
    light: {
      primary: '#1e3a8a',
      primaryDark: '#172554',
      accent: '#0284c7',
      background: '#f8fafc',
      card: '#ffffff',
      cardBorder: '#e2e8f0',
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textMuted: '#64748b',
      success: '#15803d',
      warning: '#b45309',
      danger: '#b91c1c',
      tabBar: '#ffffff',
      tabBarBorder: '#e2e8f0',
      tabBarActive: '#1e3a8a',
      tabBarInactive: '#64748b'
    },
    dark: {
      primary: '#3b82f6',
      primaryDark: '#1d4ed8',
      accent: '#38bdf8',
      background: '#090d16',
      card: '#111827',
      cardBorder: '#1f2937',
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
      tabBar: '#0b1120',
      tabBarBorder: '#1e293b',
      tabBarActive: '#38bdf8',
      tabBarInactive: '#64748b'
    }
  },
  western_signal: {
    name: 'Western Signal Red',
    light: {
      primary: '#b91c1c',
      primaryDark: '#991b1b',
      accent: '#ea580c',
      background: '#fafafa',
      card: '#ffffff',
      cardBorder: '#e5e5e5',
      textPrimary: '#171717',
      textSecondary: '#404040',
      textMuted: '#737373',
      success: '#15803d',
      warning: '#b45309',
      danger: '#b91c1c',
      tabBar: '#ffffff',
      tabBarBorder: '#e5e5e5',
      tabBarActive: '#b91c1c',
      tabBarInactive: '#737373'
    },
    dark: {
      primary: '#ef4444',
      primaryDark: '#dc2626',
      accent: '#f97316',
      background: '#120a0a',
      card: '#1f1313',
      cardBorder: '#331d1d',
      textPrimary: '#fafafa',
      textSecondary: '#e5e5e5',
      textMuted: '#a3a3a3',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
      tabBar: '#140c0c',
      tabBarBorder: '#2b1414',
      tabBarActive: '#ef4444',
      tabBarInactive: '#737373'
    }
  },
  harbour_cyan: {
    name: 'Harbour Maritime Cyan',
    light: {
      primary: '#0e7490',
      primaryDark: '#155e75',
      accent: '#06b6d4',
      background: '#f0fdfa',
      card: '#ffffff',
      cardBorder: '#ccfbf1',
      textPrimary: '#134e4a',
      textSecondary: '#115e59',
      textMuted: '#5eead4',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626',
      tabBar: '#ffffff',
      tabBarBorder: '#ccfbf1',
      tabBarActive: '#0e7490',
      tabBarInactive: '#64748b'
    },
    dark: {
      primary: '#06b6d4',
      primaryDark: '#0891b2',
      accent: '#22d3ee',
      background: '#04171a',
      card: '#0a2328',
      cardBorder: '#123941',
      textPrimary: '#f0fdfa',
      textSecondary: '#ccfbf1',
      textMuted: '#5eead4',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      tabBar: '#051b1f',
      tabBarBorder: '#0e3137',
      tabBarActive: '#22d3ee',
      tabBarInactive: '#5eead4'
    }
  },
  metro_sky: {
    name: 'Metro Sky Blue',
    light: {
      primary: '#0284c7',
      primaryDark: '#0369a1',
      accent: '#38bdf8',
      background: '#f0f9ff',
      card: '#ffffff',
      cardBorder: '#bae6fd',
      textPrimary: '#0c4a6e',
      textSecondary: '#075985',
      textMuted: '#7dd3fc',
      success: '#16a34a',
      warning: '#ca8a04',
      danger: '#dc2626',
      tabBar: '#ffffff',
      tabBarBorder: '#bae6fd',
      tabBarActive: '#0284c7',
      tabBarInactive: '#64748b'
    },
    dark: {
      primary: '#38bdf8',
      primaryDark: '#0284c7',
      accent: '#7dd3fc',
      background: '#04121f',
      card: '#0a1d30',
      cardBorder: '#0f2c49',
      textPrimary: '#f0f9ff',
      textSecondary: '#bae6fd',
      textMuted: '#7dd3fc',
      success: '#22c55e',
      warning: '#eab308',
      danger: '#ef4444',
      tabBar: '#051626',
      tabBarBorder: '#0c243d',
      tabBarActive: '#38bdf8',
      tabBarInactive: '#64748b'
    }
  },
  vande_bharat_orange: {
    name: 'Vande Bharat Sunset Orange',
    light: {
      primary: '#c2410c',
      primaryDark: '#9a3412',
      accent: '#f97316',
      background: '#fffaf5',
      card: '#ffffff',
      cardBorder: '#ffedd5',
      textPrimary: '#431407',
      textSecondary: '#7c2d12',
      textMuted: '#fdba74',
      success: '#15803d',
      warning: '#b45309',
      danger: '#b91c1c',
      tabBar: '#ffffff',
      tabBarBorder: '#ffedd5',
      tabBarActive: '#c2410c',
      tabBarInactive: '#78716c'
    },
    dark: {
      primary: '#fb923c',
      primaryDark: '#ea580c',
      accent: '#fdba74',
      background: '#190d05',
      card: '#29170c',
      cardBorder: '#432313',
      textPrimary: '#fff7ed',
      textSecondary: '#fed7aa',
      textMuted: '#fb923c',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
      tabBar: '#1c0f07',
      tabBarBorder: '#381c0e',
      tabBarActive: '#fb923c',
      tabBarInactive: '#a8a29e'
    }
  },
  heritage_maroon: {
    name: 'Heritage Maroon',
    light: {
      primary: '#831843',
      primaryDark: '#701a37',
      accent: '#be185d',
      background: '#fdf2f8',
      card: '#ffffff',
      cardBorder: '#fbcfe8',
      textPrimary: '#500724',
      textSecondary: '#701a37',
      textMuted: '#f472b6',
      success: '#15803d',
      warning: '#b45309',
      danger: '#b91c1c',
      tabBar: '#ffffff',
      tabBarBorder: '#fbcfe8',
      tabBarActive: '#831843',
      tabBarInactive: '#78716c'
    },
    dark: {
      primary: '#f472b6',
      primaryDark: '#db2777',
      accent: '#fbcfe8',
      background: '#190710',
      card: '#280c1a',
      cardBorder: '#43142c',
      textPrimary: '#fdf2f8',
      textSecondary: '#fbcfe8',
      textMuted: '#f472b6',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
      tabBar: '#1d0813',
      tabBarBorder: '#3b1227',
      tabBarActive: '#f472b6',
      tabBarInactive: '#a8a29e'
    }
  },
  high_contrast: {
    name: 'High Contrast (WCAG AAA)',
    light: {
      primary: '#000000',
      primaryDark: '#000000',
      accent: '#0033cc',
      background: '#ffffff',
      card: '#ffffff',
      cardBorder: '#000000',
      textPrimary: '#000000',
      textSecondary: '#111111',
      textMuted: '#333333',
      success: '#006600',
      warning: '#994400',
      danger: '#cc0000',
      tabBar: '#ffffff',
      tabBarBorder: '#000000',
      tabBarActive: '#000000',
      tabBarInactive: '#444444'
    },
    dark: {
      primary: '#ffffff',
      primaryDark: '#eeeeee',
      accent: '#66b2ff',
      background: '#000000',
      card: '#0a0a0a',
      cardBorder: '#ffffff',
      textPrimary: '#ffffff',
      textSecondary: '#f0f0f0',
      textMuted: '#cccccc',
      success: '#33cc33',
      warning: '#ffaa00',
      danger: '#ff3333',
      tabBar: '#000000',
      tabBarBorder: '#ffffff',
      tabBarActive: '#ffffff',
      tabBarInactive: '#aaaaaa'
    }
  },
  night_commuter: {
    name: 'Night Commuter Slate',
    light: {
      primary: '#334155',
      primaryDark: '#1e293b',
      accent: '#475569',
      background: '#f8fafc',
      card: '#ffffff',
      cardBorder: '#e2e8f0',
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textMuted: '#64748b',
      success: '#15803d',
      warning: '#b45309',
      danger: '#b91c1c',
      tabBar: '#ffffff',
      tabBarBorder: '#e2e8f0',
      tabBarActive: '#334155',
      tabBarInactive: '#64748b'
    },
    dark: {
      primary: '#94a3b8',
      primaryDark: '#64748b',
      accent: '#cbd5e1',
      background: '#0f172a',
      card: '#1e293b',
      cardBorder: '#334155',
      textPrimary: '#f8fafc',
      textSecondary: '#e2e8f0',
      textMuted: '#94a3b8',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
      tabBar: '#0f172a',
      tabBarBorder: '#1e293b',
      tabBarActive: '#cbd5e1',
      tabBarInactive: '#64748b'
    }
  }
};

interface ThemeContextType {
  colorTheme: ColorTheme;
  isDarkMode: boolean;
  language: AppLanguage;
  colors: ThemeColors;
  setColorTheme: (theme: ColorTheme) => void;
  setIsDarkMode: (dark: boolean) => void;
  setLanguage: (lang: AppLanguage) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const MobileThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorTheme, setColorTheme] = useState<ColorTheme>('central_navy');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // Railway default dark for night and battery
  const [language, setLanguage] = useState<AppLanguage>('en');

  const palette = THEME_PALETTES[colorTheme] || THEME_PALETTES.central_navy;
  const colors = isDarkMode ? palette.dark : palette.light;

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider
      value={{
        colorTheme,
        isDarkMode,
        language,
        colors,
        setColorTheme,
        setIsDarkMode,
        setLanguage,
        toggleDarkMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useMobileTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    const defaultPalette = THEME_PALETTES.central_navy.dark;
    return {
      colorTheme: 'central_navy',
      isDarkMode: true,
      language: 'en',
      colors: defaultPalette,
      setColorTheme: () => {},
      setIsDarkMode: () => {},
      setLanguage: () => {},
      toggleDarkMode: () => {}
    };
  }
  return ctx;
};
