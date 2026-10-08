/**
 * RailOne Next — Institutional Transport Authority Context
 * Manages active national government transport authority (India, UK, Japan, Switzerland, Germany),
 * official emblems, statutory regulatory frameworks, currencies, and stations.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AuthorityId, 
  InstitutionalAuthority, 
  INSTITUTIONAL_AUTHORITIES, 
  getAuthorityById,
  getDefaultAuthority,
  AuthorityStation,
  AuthorityCorridor,
  AuthorityClass
} from '../models/authorities';

interface AuthorityContextType {
  authority: InstitutionalAuthority;
  setAuthorityId: (id: AuthorityId) => void;
  formatCurrency: (amount: number) => string;
  stations: AuthorityStation[];
  corridors: AuthorityCorridor[];
  classes: AuthorityClass[];
  getStationByCode: (code: string) => AuthorityStation | undefined;
}

const AuthorityContext = createContext<AuthorityContextType | undefined>(undefined);

export const AuthorityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authorityId, setAuthorityIdState] = useState<AuthorityId>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('railone_active_authority');
        if (saved && saved in INSTITUTIONAL_AUTHORITIES) {
          return saved as AuthorityId;
        }
      }
    } catch {
      // fallback
    }
    return 'india';
  });

  const authority = getAuthorityById(authorityId);

  const setAuthorityId = (id: AuthorityId) => {
    setAuthorityIdState(id);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('railone_active_authority', id);
      }
    } catch {}
  };

  const formatCurrency = (amount: number): string => {
    const sym = authority.currency.symbol;
    if (authority.id === 'japan') {
      return `${sym}${Math.round(amount).toLocaleString('ja-JP')}`;
    }
    if (authority.id === 'uk') {
      return `${sym}${amount.toFixed(2)}`;
    }
    if (authority.id === 'switzerland') {
      return `${sym}${amount.toFixed(2)}`;
    }
    if (authority.id === 'germany') {
      return `${sym}${amount.toFixed(2)}`;
    }
    // India default
    return `${sym}${Math.round(amount)}`;
  };

  const getStationByCode = (code: string): AuthorityStation | undefined => {
    return authority.stations.find(s => s.code.toUpperCase() === code.toUpperCase());
  };

  return (
    <AuthorityContext.Provider
      value={{
        authority,
        setAuthorityId,
        formatCurrency,
        stations: authority.stations,
        corridors: authority.corridors,
        classes: authority.classes,
        getStationByCode
      }}
    >
      {children}
    </AuthorityContext.Provider>
  );
};

export function useAuthority() {
  const context = useContext(AuthorityContext);
  if (!context) {
    // Provide safe fallback rather than crashing
    const defaultAuth = getDefaultAuthority();
    return {
      authority: defaultAuth,
      setAuthorityId: () => {},
      formatCurrency: (amount: number) => `₹${Math.round(amount)}`,
      stations: defaultAuth.stations,
      corridors: defaultAuth.corridors,
      classes: defaultAuth.classes,
      getStationByCode: (code: string) => defaultAuth.stations.find(s => s.code === code)
    };
  }
  return context;
}
