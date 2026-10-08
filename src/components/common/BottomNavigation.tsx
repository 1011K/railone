/**
 * RailOne Next — Phone-First Bottom Navigation Bar
 * Thumb-reachable, safe-area aware, high-contrast accessible navigation.
 * Primary passenger tabs: Home, Journey, Live, Tickets, Help.
 */

import React from 'react';
import { 
  Home, 
  Navigation, 
  Radio, 
  Ticket, 
  HelpCircle,
  LifeBuoy
} from 'lucide-react';

export type PassengerNavTab = 'home' | 'journey' | 'live' | 'tickets' | 'help';

export interface BottomNavigationProps {
  activeTab: PassengerNavTab;
  onTabChange: (tab: PassengerNavTab) => void;
  savedTicketCount?: number;
  hasActiveAlerts?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  savedTicketCount = 0,
  hasActiveAlerts = true
}) => {
  const tabs: Array<{
    id: PassengerNavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    hasLiveDot?: boolean;
  }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'journey', label: 'Journey', icon: Navigation },
    { id: 'live', label: 'Live', icon: Radio, hasLiveDot: hasActiveAlerts },
    { id: 'tickets', label: 'Tickets', icon: Ticket, badge: savedTicketCount },
    { id: 'help', label: 'Help', icon: HelpCircle }
  ];

  return (
    <nav
      role="navigation"
      aria-label="Primary Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-lg select-none"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 4px)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 4px)'
      }}
    >
      <div className="max-w-md mx-auto grid grid-cols-5 px-0.5 py-1.5 gap-0.5">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all min-h-[48px] touch-target relative ${
                isActive
                  ? 'text-theme-primary font-black bg-theme-primary/10 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-theme-primary' : ''}`} />

                {/* Live alert pulse beacon */}
                {tab.hasLiveDot && (
                  <span 
                    aria-label="Live updates active" 
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" 
                  />
                )}

                {/* Ticket badge counter */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span 
                    aria-label={`${tab.badge} saved tickets`}
                    className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-emerald-500 text-white font-mono text-[9px] font-black flex items-center justify-center"
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-black text-theme-primary' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
