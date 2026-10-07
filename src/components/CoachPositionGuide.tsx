import React, { useState, useEffect } from 'react';
import { 
  Train, 
  Users, 
  ShieldCheck, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  Info, 
  Sparkles, 
  Compass, 
  Accessibility, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export type RakeModelType = '12_car_suburban' | '12_car_ac_suburban' | '15_car_suburban' | '16_car_vande_bharat' | '22_car_express';

export interface CoachInfo {
  coachNumber: number;
  label: string;
  category: 'general' | 'ladies' | 'first_class' | 'divyangjan' | 'ac_chair' | 'executive' | 'ac_sleeper' | 'sleeper' | 'motor_loco';
  className: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  description: string;
  platformPole: string;
  nearestFobDadar: string;
  ticketNotice: string;
  isAccessible?: boolean;
}

export interface CoachPositionGuideProps {
  initialRakeType?: RakeModelType;
  stationCode?: string;
  platformNumber?: string | number;
  onClose?: () => void;
  compactMode?: boolean;
}

export const CoachPositionGuide: React.FC<CoachPositionGuideProps> = ({
  initialRakeType = '12_car_suburban',
  stationCode = 'DR',
  platformNumber = '3',
  onClose,
  compactMode = false
}) => {
  const [selectedRake, setSelectedRake] = useState<RakeModelType>(initialRakeType);
  const [selectedCoachIndex, setSelectedCoachIndex] = useState<number>(3); // Default to Divyangjan / Ladies

  useEffect(() => {
    setSelectedRake(initialRakeType);
    setSelectedCoachIndex(initialRakeType === '16_car_vande_bharat' ? 7 : 3);
  }, [initialRakeType]);

  // 12-Car Mumbai Suburban Non-AC Local (Standard Western / Central Rake)
  const suburban12CarCoaches: CoachInfo[] = [
    {
      coachNumber: 1,
      label: 'ENG / GS',
      category: 'motor_loco',
      className: 'II General',
      bgClass: 'bg-slate-700',
      textClass: 'text-slate-100',
      borderClass: 'border-slate-500',
      description: 'Motor Driving Cab & General Second Class compartment (South End / CSMT-CCG).',
      platformPole: 'Poles 1–2 (South End)',
      nearestFobDadar: 'South Foot-Over-Bridge (Stairs to Tilak Road exit)',
      ticketNotice: 'Standard Suburban 2nd Class Single / Season Ticket (₹5–₹15).'
    },
    {
      coachNumber: 2,
      label: 'GS',
      category: 'general',
      className: 'II General',
      bgClass: 'bg-slate-800',
      textClass: 'text-slate-200',
      borderClass: 'border-slate-600',
      description: 'General Second Class passenger coach.',
      platformPole: 'Poles 2–3',
      nearestFobDadar: 'South FOB concourse',
      ticketNotice: 'Standard Suburban 2nd Class ticket.'
    },
    {
      coachNumber: 3,
      label: 'DIVYANG',
      category: 'divyangjan',
      className: 'Divyangjan / Senior',
      bgClass: 'bg-emerald-600',
      textClass: 'text-white',
      borderClass: 'border-emerald-400',
      description: 'Reserved for Divyangjan (Handicap / Wheelchair commuters), Senior Citizens, and Pregnant Women.',
      platformPole: 'Poles 3–4 (Yellow tactile platform marker)',
      nearestFobDadar: 'South FOB Elevator / Lift ramp',
      ticketNotice: 'Reserved entitlement; requires Divyangjan railway certificate or senior ID.',
      isAccessible: true
    },
    {
      coachNumber: 4,
      label: 'LADIES II',
      category: 'ladies',
      className: 'Ladies Second Class',
      bgClass: 'bg-pink-600',
      textClass: 'text-white',
      borderClass: 'border-pink-400',
      description: 'Exclusively reserved for female commuters. Male entry is a punishable offence under Section 162 of Railways Act.',
      platformPole: 'Poles 4–5',
      nearestFobDadar: 'Middle Foot-Over-Bridge (Direct Western ↔ Central transfer stairs)',
      ticketNotice: 'Suburban 2nd Class ticket (Ladies only).'
    },
    {
      coachNumber: 5,
      label: 'FC I',
      category: 'first_class',
      className: 'First Class',
      bgClass: 'bg-amber-600',
      textClass: 'text-white',
      borderClass: 'border-amber-400',
      description: 'Suburban First Class compartment with cushioned seating. Highly enforced by ticket inspectors.',
      platformPole: 'Poles 5–6 (Opposite Middle FOB)',
      nearestFobDadar: 'Middle FOB (fast transfer to Western Line PF 1/2)',
      ticketNotice: 'First Class MST or single journey ticket (₹50–₹105).'
    },
    {
      coachNumber: 6,
      label: 'MOTOR / GS',
      category: 'motor_loco',
      className: 'II General (Mid)',
      bgClass: 'bg-slate-700',
      textClass: 'text-slate-100',
      borderClass: 'border-slate-500',
      description: 'Mid-rake motor unit & General Second Class compartment.',
      platformPole: 'Poles 6–7',
      nearestFobDadar: 'Central Interchange Skywalk approach',
      ticketNotice: 'Standard Suburban 2nd Class ticket.'
    },
    {
      coachNumber: 7,
      label: 'GS',
      category: 'general',
      className: 'II General',
      bgClass: 'bg-slate-800',
      textClass: 'text-slate-200',
      borderClass: 'border-slate-600',
      description: 'General Second Class passenger coach.',
      platformPole: 'Poles 7–8',
      nearestFobDadar: 'Central Interchange FOB',
      ticketNotice: 'Standard Suburban 2nd Class ticket.'
    },
    {
      coachNumber: 8,
      label: 'FC I',
      category: 'first_class',
      className: 'First Class (Mid-North)',
      bgClass: 'bg-amber-600',
      textClass: 'text-white',
      borderClass: 'border-amber-400',
      description: 'Second First Class compartment on the rake.',
      platformPole: 'Poles 8–9',
      nearestFobDadar: 'North-Central FOB',
      ticketNotice: 'First Class MST or ticket required.'
    },
    {
      coachNumber: 9,
      label: 'LADIES FC',
      category: 'ladies',
      className: 'Ladies First Class',
      bgClass: 'bg-pink-700',
      textClass: 'text-white',
      borderClass: 'border-pink-300',
      description: 'First Class compartment reserved exclusively for female commuters.',
      platformPole: 'Poles 9–10',
      nearestFobDadar: 'North-Central FOB stairs',
      ticketNotice: 'First Class MST or ticket (Ladies only).'
    },
    {
      coachNumber: 10,
      label: 'LADIES II',
      category: 'ladies',
      className: 'Ladies Second Class',
      bgClass: 'bg-pink-600',
      textClass: 'text-white',
      borderClass: 'border-pink-400',
      description: 'Second Ladies compartment towards North end.',
      platformPole: 'Poles 10–11',
      nearestFobDadar: 'North Foot-Over-Bridge (Dadar Flower Market exit)',
      ticketNotice: 'Suburban 2nd Class ticket (Ladies only).'
    },
    {
      coachNumber: 11,
      label: 'GS',
      category: 'general',
      className: 'II General',
      bgClass: 'bg-slate-800',
      textClass: 'text-slate-200',
      borderClass: 'border-slate-600',
      description: 'General Second Class passenger coach.',
      platformPole: 'Poles 11–12',
      nearestFobDadar: 'North FOB concourse',
      ticketNotice: 'Standard Suburban 2nd Class ticket.'
    },
    {
      coachNumber: 12,
      label: 'GUARD / GS',
      category: 'motor_loco',
      className: 'II General (North End)',
      bgClass: 'bg-slate-700',
      textClass: 'text-slate-100',
      borderClass: 'border-slate-500',
      description: 'Guard Van & General Second Class (North End / Kalyan-Virar end).',
      platformPole: 'Poles 12–13 (North End)',
      nearestFobDadar: 'North Foot-Over-Bridge (Kabutarkhana / Senapati Bapat Marg exit)',
      ticketNotice: 'Standard Suburban 2nd Class ticket.'
    }
  ];

  // 12-Car Mumbai AC Suburban Local
  const acSuburban12CarCoaches: CoachInfo[] = [
    {
      coachNumber: 1,
      label: 'C1 / MOTOR',
      category: 'ac_chair',
      className: 'AC Local General',
      bgClass: 'bg-blue-600',
      textClass: 'text-white',
      borderClass: 'border-blue-400',
      description: 'Air-conditioned vestibule coach with automatic sealed sliding doors.',
      platformPole: 'Poles 1–2 (South End)',
      nearestFobDadar: 'South FOB',
      ticketNotice: 'Suburban AC Local ticket or AC Season Pass (₹65–₹105).'
    },
    {
      coachNumber: 2,
      label: 'C2',
      category: 'ac_chair',
      className: 'AC Local General',
      bgClass: 'bg-blue-700',
      textClass: 'text-white',
      borderClass: 'border-blue-400',
      description: 'AC Passenger coach with vestibuled walk-through connection.',
      platformPole: 'Poles 2–3',
      nearestFobDadar: 'South FOB',
      ticketNotice: 'Suburban AC Local ticket.'
    },
    {
      coachNumber: 3,
      label: 'C3 DIVYANG',
      category: 'divyangjan',
      className: 'AC Divyangjan',
      bgClass: 'bg-emerald-600',
      textClass: 'text-white',
      borderClass: 'border-emerald-300',
      description: 'Designated AC compartment space for wheelchair & Divyangjan passengers.',
      platformPole: 'Poles 3–4',
      nearestFobDadar: 'South FOB Lift Ramp',
      ticketNotice: 'AC Local Divyangjan concessional ticket.',
      isAccessible: true
    },
    {
      coachNumber: 4,
      label: 'C4 LADIES',
      category: 'ladies',
      className: 'AC Ladies Reserved',
      bgClass: 'bg-pink-600',
      textClass: 'text-white',
      borderClass: 'border-pink-300',
      description: 'Reserved for female commuters in AC local rake.',
      platformPole: 'Poles 4–5',
      nearestFobDadar: 'Middle FOB (Western ↔ Central interchange)',
      ticketNotice: 'AC Local Ladies ticket.'
    },
    {
      coachNumber: 5,
      label: 'C5',
      category: 'ac_chair',
      className: 'AC Local General',
      bgClass: 'bg-blue-700',
      textClass: 'text-white',
      borderClass: 'border-blue-400',
      description: 'Central air-conditioned coach right opposite main interchange bridge.',
      platformPole: 'Poles 5–6',
      nearestFobDadar: 'Middle FOB (Primary transfer)',
      ticketNotice: 'Suburban AC Local ticket.'
    },
    {
      coachNumber: 6,
      label: 'C6 MOTOR',
      category: 'ac_chair',
      className: 'AC Local General',
      bgClass: 'bg-blue-800',
      textClass: 'text-white',
      borderClass: 'border-blue-400',
      description: 'Mid-rake motor driving unit with passenger seating.',
      platformPole: 'Poles 6–7',
      nearestFobDadar: 'Middle FOB',
      ticketNotice: 'Suburban AC Local ticket.'
    },
    {
      coachNumber: 7,
      label: 'C7',
      category: 'ac_chair',
      className: 'AC Local General',
      bgClass: 'bg-blue-700',
      textClass: 'text-white',
      borderClass: 'border-blue-400',
      description: 'Vestibuled AC commuter car.',
      platformPole: 'Poles 7–8',
      nearestFobDadar: 'Central Interchange Skywalk',
      ticketNotice: 'Suburban AC Local ticket.'
    },
    {
      coachNumber: 8,
      label: 'C8',
      category: 'ac_chair',
      className: 'AC Local General',
      bgClass: 'bg-blue-700',
      textClass: 'text-white',
      borderClass: 'border-blue-400',
      description: 'Air-conditioned commuter car.',
      platformPole: 'Poles 8–9',
      nearestFobDadar: 'North-Central FOB',
      ticketNotice: 'Suburban AC Local ticket.'
    },
    {
      coachNumber: 9,
      label: 'C9 LADIES',
      category: 'ladies',
      className: 'AC Ladies Reserved',
      bgClass: 'bg-pink-600',
      textClass: 'text-white',
      borderClass: 'border-pink-300',
      description: 'Second AC coach reserved for female commuters.',
      platformPole: 'Poles 9–10',
      nearestFobDadar: 'North-Central FOB',
      ticketNotice: 'AC Local Ladies ticket.'
    },
    {
      coachNumber: 10,
      label: 'C10',
      category: 'ac_chair',
      className: 'AC Local General',
      bgClass: 'bg-blue-700',
      textClass: 'text-white',
      borderClass: 'border-blue-400',
      description: 'Vestibuled AC commuter car.',
      platformPole: 'Poles 10–11',
      nearestFobDadar: 'North FOB',
      ticketNotice: 'Suburban AC Local ticket.'
    },
    {
      coachNumber: 11,
      label: 'C11',
      category: 'ac_chair',
      className: 'AC Local General',
      bgClass: 'bg-blue-700',
      textClass: 'text-white',
      borderClass: 'border-blue-400',
      description: 'Air-conditioned commuter car.',
      platformPole: 'Poles 11–12',
      nearestFobDadar: 'North FOB',
      ticketNotice: 'Suburban AC Local ticket.'
    },
    {
      coachNumber: 12,
      label: 'C12 / GUARD',
      category: 'ac_chair',
      className: 'AC Local (North End)',
      bgClass: 'bg-blue-600',
      textClass: 'text-white',
      borderClass: 'border-blue-400',
      description: 'Guard van and air-conditioned passenger compartment (North End).',
      platformPole: 'Poles 12–13',
      nearestFobDadar: 'North FOB (Flower Market)',
      ticketNotice: 'Suburban AC Local ticket.'
    }
  ];

  // 16-Car Vande Bharat Express
  const vandeBharat16CarCoaches: CoachInfo[] = [
    { coachNumber: 1, label: 'DTC (C1)', category: 'ac_chair', className: 'AC Chair Car', bgClass: 'bg-indigo-600', textClass: 'text-white', borderClass: 'border-indigo-400', description: 'Driving Trailer Coach - AC Chair Car (CC).', platformPole: 'Poles 1–2', nearestFobDadar: 'South Concourse', ticketNotice: 'IRCTC Vande Bharat CC ticket.' },
    { coachNumber: 2, label: 'MC (C2)', category: 'ac_chair', className: 'AC Chair Car', bgClass: 'bg-indigo-700', textClass: 'text-white', borderClass: 'border-indigo-400', description: 'Motor Coach - AC Chair Car.', platformPole: 'Poles 2–3', nearestFobDadar: 'South Concourse', ticketNotice: 'Vande Bharat CC ticket.' },
    { coachNumber: 3, label: 'TC (C3)', category: 'ac_chair', className: 'AC Chair Car', bgClass: 'bg-indigo-700', textClass: 'text-white', borderClass: 'border-indigo-400', description: 'Trailer Coach - AC Chair Car.', platformPole: 'Poles 3–4', nearestFobDadar: 'South FOB', ticketNotice: 'Vande Bharat CC ticket.' },
    { coachNumber: 4, label: 'MC (C4)', category: 'ac_chair', className: 'AC Chair Car', bgClass: 'bg-indigo-700', textClass: 'text-white', borderClass: 'border-indigo-400', description: 'Motor Coach - AC Chair Car.', platformPole: 'Poles 4–5', nearestFobDadar: 'South FOB', ticketNotice: 'Vande Bharat CC ticket.' },
    { coachNumber: 5, label: 'TC (C5)', category: 'ac_chair', className: 'AC Chair Car', bgClass: 'bg-indigo-700', textClass: 'text-white', borderClass: 'border-indigo-400', description: 'Trailer Coach - AC Chair Car.', platformPole: 'Poles 5–6', nearestFobDadar: 'Middle FOB', ticketNotice: 'Vande Bharat CC ticket.' },
    { coachNumber: 6, label: 'MC (C6)', category: 'ac_chair', className: 'AC Chair Car', bgClass: 'bg-indigo-700', textClass: 'text-white', borderClass: 'border-indigo-400', description: 'Motor Coach - AC Chair Car.', platformPole: 'Poles 6–7', nearestFobDadar: 'Middle FOB', ticketNotice: 'Vande Bharat CC ticket.' },
    { coachNumber: 7, label: 'TC (C7)', category: 'divyangjan', className: 'AC CC (Accessible)', bgClass: 'bg-emerald-600', textClass: 'text-white', borderClass: 'border-emerald-300', description: 'Accessible wheelchair space and Braille seat numbers.', platformPole: 'Poles 7–8', nearestFobDadar: 'Middle FOB Lift', ticketNotice: 'Vande Bharat CC ticket.', isAccessible: true },
    { coachNumber: 8, label: 'NDTC (E1)', category: 'executive', className: 'Executive Class', bgClass: 'bg-purple-600', textClass: 'text-white', borderClass: 'border-purple-300', description: 'Executive Chair Car (EC) with 180° rotating seats.', platformPole: 'Poles 8–9', nearestFobDadar: 'Middle FOB Concourse', ticketNotice: 'Vande Bharat EC ticket (Premium tariff).' },
    { coachNumber: 9, label: 'NDTC (E2)', category: 'executive', className: 'Executive Class', bgClass: 'bg-purple-600', textClass: 'text-white', borderClass: 'border-purple-300', description: 'Executive Chair Car (EC) with premium catering.', platformPole: 'Poles 9–10', nearestFobDadar: 'Middle FOB Concourse', ticketNotice: 'Vande Bharat EC ticket.' },
    { coachNumber: 10, label: 'TC (C8)', category: 'ac_chair', className: 'AC Chair Car', bgClass: 'bg-indigo-700', textClass: 'text-white', borderClass: 'border-indigo-400', description: 'Trailer Coach - AC Chair Car.', platformPole: 'Poles 10–11', nearestFobDadar: 'North-Central FOB', ticketNotice: 'Vande Bharat CC ticket.' },
    { coachNumber: 11, label: 'MC (C9)', category: 'ac_chair', className: 'AC Chair Car', bgClass: 'bg-indigo-700', textClass: 'text-white', borderClass: 'border-indigo-400', description: 'Motor Coach - AC Chair Car.', platformPole: 'Poles 11–12', nearestFobDadar: 'North-Central FOB', ticketNotice: 'Vande Bharat CC ticket.' },
    { coachNumber: 12, label: 'TC (C10)', category: 'ac_chair', className: 'AC Chair Car', bgClass: 'bg-indigo-700', textClass: 'text-white', borderClass: 'border-indigo-400', description: 'Trailer Coach - AC Chair Car.', platformPole: 'Poles 12–13', nearestFobDadar: 'North FOB', ticketNotice: 'Vande Bharat CC ticket.' },
    { coachNumber: 13, label: 'MC (C11)', category: 'ac_chair', className: 'AC Chair Car', bgClass: 'bg-indigo-700', textClass: 'text-white', borderClass: 'border-indigo-400', description: 'Motor Coach - AC Chair Car.', platformPole: 'Poles 13–14', nearestFobDadar: 'North FOB', ticketNotice: 'Vande Bharat CC ticket.' },
    { coachNumber: 14, label: 'TC (C12)', category: 'ac_chair', className: 'AC Chair Car', bgClass: 'bg-indigo-700', textClass: 'text-white', borderClass: 'border-indigo-400', description: 'Trailer Coach - AC Chair Car.', platformPole: 'Poles 14–15', nearestFobDadar: 'North FOB', ticketNotice: 'Vande Bharat CC ticket.' },
    { coachNumber: 15, label: 'MC (C13)', category: 'ac_chair', className: 'AC Chair Car', bgClass: 'bg-indigo-700', textClass: 'text-white', borderClass: 'border-indigo-400', description: 'Motor Coach - AC Chair Car.', platformPole: 'Poles 15–16', nearestFobDadar: 'North End Concourse', ticketNotice: 'Vande Bharat CC ticket.' },
    { coachNumber: 16, label: 'DTC (C14)', category: 'ac_chair', className: 'AC Chair Car (Cab)', bgClass: 'bg-indigo-600', textClass: 'text-white', borderClass: 'border-indigo-400', description: 'Driving Trailer Coach (North End).', platformPole: 'Poles 16–17 (North End)', nearestFobDadar: 'North End Concourse', ticketNotice: 'Vande Bharat CC ticket.' }
  ];

  const getActiveCoaches = (): CoachInfo[] => {
    switch (selectedRake) {
      case '12_car_ac_suburban':
        return acSuburban12CarCoaches;
      case '16_car_vande_bharat':
        return vandeBharat16CarCoaches;
      case '12_car_suburban':
      default:
        return suburban12CarCoaches;
    }
  };

  const coaches = getActiveCoaches();
  const activeCoach = coaches[selectedCoachIndex] || coaches[0];

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden ${compactMode ? 'p-4' : 'p-6'}`}>
      
      {/* Header */}
      {compactMode ? (
        onClose ? (
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {stationCode} · Platform {platformNumber}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              ✕
            </button>
          </div>
        ) : null
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-theme-primary/10 text-theme-primary border border-theme-primary/30 flex items-center gap-1">
                <Compass className="w-3 h-3" />
                JR East · DB Navigator Wagenreihung Benchmark
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {stationCode} · Platform {platformNumber}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <Train className="w-5 h-5 text-theme-primary" />
              <span>Platform Coach Alignment Guide (Wagenstandsanzeiger)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real platform halt alignment: where Ladies, Divyangjan, First Class, and AC coaches halt relative to Foot-Over-Bridges.
            </p>
          </div>

          {/* Rake selector buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl shrink-0 overflow-x-auto">
            <button
              onClick={() => { setSelectedRake('12_car_suburban'); setSelectedCoachIndex(3); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedRake === '12_car_suburban'
                  ? 'bg-theme-primary text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              12-Car Non-AC Local
            </button>
            <button
              onClick={() => { setSelectedRake('12_car_ac_suburban'); setSelectedCoachIndex(3); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedRake === '12_car_ac_suburban'
                  ? 'bg-theme-primary text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              12-Car AC Local
            </button>
            <button
              onClick={() => { setSelectedRake('16_car_vande_bharat'); setSelectedCoachIndex(7); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedRake === '16_car_vande_bharat'
                  ? 'bg-theme-primary text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Vande Bharat (16-Car)
            </button>
          </div>
        </div>
      )}

      {/* Direction & Platform Indicators */}
      <div className="py-4 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2">
          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>South End (CSMT / Churchgate)</span>
          </span>
          <span className="px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold">
            Platform Track Direction
          </span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span>North End (Kalyan / Virar)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Visual Rake Strip */}
        <div className="relative p-3 bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto shadow-inner">
          <div className="flex items-center gap-2 min-w-max py-2 px-1">
            {coaches.map((c, idx) => {
              const isSelected = selectedCoachIndex === idx;
              return (
                <button
                  key={c.coachNumber}
                  onClick={() => setSelectedCoachIndex(idx)}
                  className={`relative flex flex-col items-center justify-center rounded-xl p-2.5 transition-all min-w-[72px] sm:min-w-[84px] h-[76px] border-2 cursor-pointer ${
                    c.bgClass
                  } ${c.textClass} ${c.borderClass} ${
                    isSelected ? 'ring-4 ring-yellow-400 scale-105 z-10 shadow-lg' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  {/* Wheelchair Accessible Badge */}
                  {c.isAccessible && (
                    <span className="absolute -top-2 -right-1 bg-emerald-500 text-white rounded-full p-0.5 text-[10px] shadow-sm">
                      <Accessibility className="w-3 h-3" />
                    </span>
                  )}

                  {/* Coach Number */}
                  <span className="text-[10px] opacity-75 font-mono">#{c.coachNumber}</span>
                  <span className="text-xs font-black tracking-tight">{c.label}</span>
                  <span className="text-[9px] truncate max-w-[68px] mt-0.5 opacity-90">{c.className}</span>

                  {/* Halting Indicator Marker */}
                  {isSelected && (
                    <div className="absolute -bottom-2 w-2 h-2 bg-yellow-400 rotate-45" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Platform Footbridge Alignment Markers underneath coaches */}
          <div className="flex items-center gap-2 min-w-max pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
            <span className="min-w-[72px] sm:min-w-[84px] text-center text-blue-400">South FOB</span>
            <span className="min-w-[72px] sm:min-w-[84px] text-center">·</span>
            <span className="min-w-[72px] sm:min-w-[84px] text-center text-emerald-400">Lift/Ramp</span>
            <span className="min-w-[72px] sm:min-w-[84px] text-center text-pink-400">Middle FOB</span>
            <span className="min-w-[72px] sm:min-w-[84px] text-center text-amber-400 font-bold">Interchange</span>
            <span className="min-w-[72px] sm:min-w-[84px] text-center">·</span>
            <span className="min-w-[72px] sm:min-w-[84px] text-center">·</span>
            <span className="min-w-[72px] sm:min-w-[84px] text-center text-amber-400">FOB 3</span>
            <span className="min-w-[72px] sm:min-w-[84px] text-center text-pink-400">Ladies FOB</span>
            <span className="min-w-[72px] sm:min-w-[84px] text-center">·</span>
            <span className="min-w-[72px] sm:min-w-[84px] text-center">·</span>
            <span className="min-w-[72px] sm:min-w-[84px] text-center text-emerald-400">North FOB</span>
          </div>
        </div>
      </div>

      {/* Selected Coach Detailed Inspector */}
      {activeCoach && (
        <div className="mt-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${activeCoach.bgClass} ${activeCoach.textClass}`}>
                Coach #{activeCoach.coachNumber}: {activeCoach.label}
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {activeCoach.className}
              </span>
              {activeCoach.isAccessible && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                  <Accessibility className="w-3 h-3" />
                  <span>Divyangjan Step-Free</span>
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Platform Indicator: <strong className="text-slate-700 dark:text-slate-200">{activeCoach.platformPole}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                <span>Coach Purpose & Layout</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeCoach.description}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Nearest Interchange Exit (Dadar DR)</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                {activeCoach.nearestFobDadar}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Ticket & Eligibility Rule</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                {activeCoach.ticketNotice}
              </p>
            </div>
          </div>

          {/* Commuter Pro-Tip Banner */}
          <div className="p-2.5 rounded-xl bg-theme-primary/10 border border-theme-primary/30 flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-theme-primary shrink-0" />
            <span>
              <strong>Commuter Exit Optimization:</strong> Board Coach #{activeCoach.coachNumber} to halt right next to {activeCoach.nearestFobDadar}, saving 3–5 minutes during peak interchange rush.
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
