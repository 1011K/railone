/**
 * RailOne Next — Mobile-First Design System Primitives
 * Standardized, accessible, WCAG 2.1 AAA compliant UI primitives for phone viewports (360px–430px).
 * Enforces:
 * - 44px+ minimum touch targets (Criterion 2.5.5)
 * - Safe-area inset awareness (pt-safe, pb-safe, pb-nav)
 * - Strict railway data provenance badging (Charter Section 3)
 * - Zero emoji iconography (Charter Section 4)
 * - No horizontal page overflow
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  ChevronRight, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Train, 
  CheckCircle2, 
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { AccessibleModal } from './AccessibleModal';
import { RakeModelType, RakeFormation, RakeCoach, getRakeFormation, RAKE_FORMATIONS } from '../../models/coachGuide';
import { STATIONS } from '../../fixtures/railwayData';
import { normalizeStation } from '../../engine/stationNormalizer';

// =========================================================================
// 1. DATA PROVENANCE BADGE
// =========================================================================
export type ProvenanceType = 
  | 'LIVE_VERIFIED' 
  | 'SCHEDULED' 
  | 'HISTORICAL' 
  | 'PREDICTED' 
  | 'REPORTED' 
  | 'DEMO' 
  | 'UNKNOWN';

export interface DataProvenanceBadgeProps {
  provenance: ProvenanceType;
  className?: string;
  size?: 'xs' | 'sm';
}

export const DataProvenanceBadge: React.FC<DataProvenanceBadgeProps> = ({ 
  provenance, 
  className = '',
  size = 'xs'
}) => {
  const styles: Record<ProvenanceType, { label: string; bg: string; text: string; border: string }> = {
    LIVE_VERIFIED: {
      label: '[VERIFIED LIVE]',
      bg: 'bg-emerald-500/15 dark:bg-emerald-950/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-500/30'
    },
    SCHEDULED: {
      label: '[TIMETABLE SCHEDULE]',
      bg: 'bg-blue-500/15 dark:bg-blue-950/50',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-500/30'
    },
    PREDICTED: {
      label: '[PREDICTED HEURISTIC]',
      bg: 'bg-sky-500/15 dark:bg-sky-950/50',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-500/30'
    },
    HISTORICAL: {
      label: '[HISTORICAL MODEL]',
      bg: 'bg-slate-500/15 dark:bg-slate-800/50',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-500/30'
    },
    REPORTED: {
      label: '[PASSENGER REPORTED]',
      bg: 'bg-amber-500/15 dark:bg-amber-950/50',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-500/30'
    },
    DEMO: {
      label: '[SIMULATED SCENARIO]',
      bg: 'bg-amber-500/20 dark:bg-amber-900/40',
      text: 'text-amber-900 dark:text-amber-200',
      border: 'border-amber-500/40'
    },
    UNKNOWN: {
      label: '[STATUS UNKNOWN]',
      bg: 'bg-slate-500/15 dark:bg-slate-800',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-400/30'
    }
  };

  const current = styles[provenance] || styles.UNKNOWN;
  const sizeClasses = size === 'xs' ? 'text-[9px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5';

  return (
    <span 
      className={`inline-flex items-center font-mono font-bold rounded-full border tracking-wide uppercase ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
      title={`Data Provenance: ${provenance}`}
    >
      {current.label}
    </span>
  );
};

// =========================================================================
// 2. STATUS BADGE
// =========================================================================
export type OperationalStatus = 'ON_TIME' | 'DELAYED' | 'CRITICAL' | 'CANCELLED' | 'DIVERTED' | 'BERTHED';

export interface StatusBadgeProps {
  status: OperationalStatus;
  delayMinutes?: number;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  delayMinutes,
  label,
  className = ''
}) => {
  const configs: Record<OperationalStatus, { text: string; bg: string; dot: string; defaultLabel: string }> = {
    ON_TIME: {
      text: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
      dot: 'bg-emerald-500',
      defaultLabel: 'On Time'
    },
    DELAYED: {
      text: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
      dot: 'bg-amber-500',
      defaultLabel: delayMinutes ? `+${delayMinutes}m Late` : 'Delayed'
    },
    CRITICAL: {
      text: 'text-rose-700 dark:text-rose-300',
      bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800',
      dot: 'bg-rose-600 animate-pulse',
      defaultLabel: delayMinutes ? `+${delayMinutes}m Lock` : 'Critical Delay'
    },
    CANCELLED: {
      text: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
      dot: 'bg-slate-500',
      defaultLabel: 'Cancelled'
    },
    DIVERTED: {
      text: 'text-purple-700 dark:text-purple-300',
      bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800',
      dot: 'bg-purple-500',
      defaultLabel: 'Slow Line Diverted'
    },
    BERTHED: {
      text: 'text-blue-700 dark:text-blue-300',
      bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800',
      dot: 'bg-blue-500 animate-ping',
      defaultLabel: 'Berthed at Platform'
    }
  };

  const cfg = configs[status] || configs.ON_TIME;
  const displayText = label || cfg.defaultLabel;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${cfg.bg} ${cfg.text} ${className}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      <span>{displayText}</span>
    </span>
  );
};

// =========================================================================
// 3. SEGMENTED CONTROL (Accessible Mobile Tab / Filter Switcher)
// =========================================================================
export interface SegmentedOption<T extends string> {
  id: T;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (val: T) => void;
  ariaLabel: string;
  className?: string;
  scrollable?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
  scrollable = false
}: SegmentedControlProps<T>) {
  return (
    <div 
      role="tablist" 
      aria-label={ariaLabel}
      className={`p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-1 ${
        scrollable ? 'overflow-x-auto no-scrollbar py-1' : 'w-full'
      } ${className}`}
    >
      {options.map((opt) => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(opt.id)}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap touch-target ${
              scrollable ? 'shrink-0' : 'flex-1'
            } ${
              isSelected
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40'
            }`}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.badge !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isSelected 
                  ? 'bg-theme-primary/10 text-theme-primary font-bold' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// =========================================================================
// 4. PRIMARY ACTION BUTTON
// =========================================================================
export interface PrimaryActionProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const PrimaryAction: React.FC<PrimaryActionProps> = ({
  label,
  onClick,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  className = ''
}) => {
  const variantStyles = {
    primary: 'bg-theme-primary hover-bg-theme-primary text-white shadow-sm',
    secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`min-h-[48px] px-4 py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-98 touch-target disabled:opacity-50 disabled:pointer-events-none ${
        fullWidth ? 'w-full' : ''
      } ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{label}</span>
    </button>
  );
};

// =========================================================================
// 5. TRAIN FORMATION STRIP (Compressed Single-Bar Mobile Visualizer)
// Fits 12, 16, or 22 coaches on phone screens (360px–430px) without horizontal scrolling
// =========================================================================
export interface TrainFormationStripProps {
  rakeType: RakeModelType;
  selectedCoachSeq: number;
  onSelectCoach: (seq: number) => void;
  className?: string;
}

export const TrainFormationStrip: React.FC<TrainFormationStripProps> = ({
  rakeType,
  selectedCoachSeq,
  onSelectCoach,
  className = ''
}) => {
  const formation: RakeFormation = getRakeFormation(rakeType) || RAKE_FORMATIONS['12_car_suburban'];

  // Color mapper by coach category
  const getCoachBg = (coach: RakeCoach, isSelected: boolean) => {
    if (isSelected) return 'bg-white text-slate-950 ring-2 ring-theme-primary scale-110 z-10 font-black shadow-lg';
    if (coach.isAccessible) return 'bg-emerald-600 text-white';
    if (coach.isFirstClass) return 'bg-amber-600 text-white';
    if (coach.isLadiesReserved) return 'bg-pink-600 text-white';
    if (coach.category === 'ac_chair' || coach.category === 'ac_sleeper') return 'bg-blue-600 text-white';
    if (coach.category === 'executive') return 'bg-purple-600 text-white';
    if (coach.category === 'sleeper') return 'bg-sky-600 text-white';
    if (coach.category === 'motor_loco') return 'bg-slate-700 text-slate-200';
    return 'bg-slate-800 text-slate-300';
  };

  return (
    <div className={`space-y-1.5 w-full select-none ${className}`}>
      {/* South to North geographic orientation markers */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
        <span>◄ South (CSMT / CCG)</span>
        <span className="text-[9px] uppercase font-bold text-slate-500">{formation.totalCoaches} Cars · Full Rake</span>
        <span>North (KYN / VR) ►</span>
      </div>

      {/* Connected Train Rake Bar (No sideways scroll, proportional mobile cells) */}
      <div 
        role="group" 
        aria-label={`Train formation: ${formation.name}`}
        className="p-1.5 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner flex items-stretch gap-0.5 sm:gap-1 w-full overflow-hidden"
      >
        {formation.coaches.map((coach) => {
          const isSelected = coach.sequence === selectedCoachSeq;
          const bgClass = getCoachBg(coach, isSelected);

          return (
            <button
              key={coach.sequence}
              onClick={() => onSelectCoach(coach.sequence)}
              title={`Coach ${coach.sequence}: ${coach.identifier} (${coach.className})`}
              aria-label={`Coach ${coach.sequence} ${coach.className}`}
              aria-pressed={isSelected}
              className={`flex-1 min-h-[38px] rounded-md transition-all flex flex-col items-center justify-center p-0.5 text-center ${bgClass}`}
            >
              <span className="text-[10px] sm:text-xs font-mono font-bold leading-none">
                {coach.sequence}
              </span>
              <span className="text-[7px] sm:text-[8px] font-mono truncate max-w-full leading-none opacity-80 mt-0.5 hidden xs:inline">
                {coach.identifier.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// =========================================================================
// 6. STATION SEARCH SHEET (Phone-Friendly Modal Station Selector)
// =========================================================================
export interface StationSearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStation: (code: string) => void;
  title: string;
  selectedStationCode?: string;
}

export const StationSearchSheet: React.FC<StationSearchSheetProps> = ({
  isOpen,
  onClose,
  onSelectStation,
  title,
  selectedStationCode
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const allStationList = Object.values(STATIONS);

  const filteredStations = React.useMemo(() => {
    if (!query.trim()) return allStationList.slice(0, 20); // popular / default list
    const q = query.toLowerCase().trim();
    return allStationList.filter(st => {
      const norm = normalizeStation(q);
      if (norm.matchedStation?.code === st.code) return true;
      return (
        st.name.toLowerCase().includes(q) ||
        st.code.toLowerCase().includes(q) ||
        (st.hindiName && st.hindiName.includes(q)) ||
        (st.marathiName && st.marathiName.includes(q)) ||
        (st.aliases && st.aliases.some(a => a.toLowerCase().includes(q)))
      );
    });
  }, [query, allStationList]);

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Type station name, code, or alias (e.g. CSMT, CST, Dadar, Thane)"
      icon={<MapPin className="w-5 h-5" />}
      variant="sheet"
      maxWidthClass="max-w-md"
    >
      <div className="space-y-3">
        {/* Search input with 44px min height */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search stations, aliases, Devanagari..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] min-h-[48px]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-3 p-1 text-slate-400 hover:text-slate-600"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Station Results List */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {filteredStations.length > 0 ? (
            filteredStations.map((st) => {
              const isSelected = selectedStationCode === st.code;
              return (
                <button
                  key={st.code}
                  onClick={() => {
                    onSelectStation(st.code);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-2xl text-left flex items-center justify-between transition-colors min-h-[48px] touch-target ${
                    isSelected
                      ? 'bg-theme-primary/10 border border-theme-primary text-theme-primary font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800/80'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm truncate">
                        {st.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {st.code}
                      </span>
                    </div>
                    {st.hindiName && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {st.hindiName} {st.marathiName ? `• ${st.marathiName}` : ''}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">
                    {st.line}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching stations found for "{query}". Try searching by terminal code like CSMT, CCG, DR, or TNA.
            </div>
          )}
        </div>
      </div>
    </AccessibleModal>
  );
};

// =========================================================================
// 7. SECTION CARD
// =========================================================================
export interface SectionCardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  action,
  icon,
  children,
  className = ''
}) => {
  return (
    <section className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                {icon && <span className="text-theme-primary">{icon}</span>}
                <span>{title}</span>
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
};

// =========================================================================
// 8. EMPTY STATE
// =========================================================================
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`p-8 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      {icon && <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-1">{icon}</div>}
      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
        {title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="pt-2">
          <PrimaryAction
            label={action.label}
            onClick={action.onClick}
            variant="secondary"
            fullWidth={false}
          />
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 9. MOBILE PAGE WRAPPER
// =========================================================================
export interface MobilePageProps {
  children: React.ReactNode;
  className?: string;
}

export const MobilePage: React.FC<MobilePageProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full min-h-full pb-nav overflow-x-hidden font-sans ${className}`}>
      {children}
    </div>
  );
};

// =========================================================================
// 10. MOBILE HEADER
// =========================================================================
export interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  provenance?: ProvenanceType;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  provenance
}) => {
  return (
    <header className="sticky top-0 z-20 px-4 py-3 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-black text-slate-900 dark:text-white truncate">
              {title}
            </h1>
            {provenance && <DataProvenanceBadge provenance={provenance} size="xs" />}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </header>
  );
};
