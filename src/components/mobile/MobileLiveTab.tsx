import React, { useState } from 'react';
import { TrainLiveTracker } from '../TrainLiveTracker';
import { NetworkMapViewer } from '../NetworkMapViewer';
import { CoachPositionGuide } from '../CoachPositionGuide';
import { TRAIN_TRIPS } from '../../fixtures/railwayData';
import { 
  Radio, 
  Map, 
  Compass, 
  Layers, 
  Clock, 
  Train, 
  Search, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight,
  Eye
} from 'lucide-react';

interface MobileLiveTabProps {
  initialTrainNumber?: string;
  onOpenGodsEye: (stationCode: string) => void;
  onPlanRouteFromStation: (stationCode: string) => void;
  onPlanRouteToStation: (stationCode: string) => void;
}

export const MobileLiveTab: React.FC<MobileLiveTabProps> = ({
  initialTrainNumber = '95112',
  onOpenGodsEye,
  onPlanRouteFromStation,
  onPlanRouteToStation
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tracker' | 'map' | 'coach' | 'board'>('tracker');
  const [selectedTrainNumber, setSelectedTrainNumber] = useState(initialTrainNumber);
  const [boardStationCode, setBoardStationCode] = useState('DR');

  const hubStations = [
    { code: 'DR', name: 'Dadar Junction' },
    { code: 'TNA', name: 'Thane' },
    { code: 'CSMT', name: 'CSMT' },
    { code: 'ADH', name: 'Andheri' },
    { code: 'KYN', name: 'Kalyan' },
    { code: 'BVI', name: 'Borivali' }
  ];

  return (
    <div className="space-y-3 pb-20 px-3.5 pt-2">
      
      {/* Sub-Tab Navigation Bar */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
        {[
          { id: 'tracker', label: 'Running', icon: Radio },
          { id: 'board', label: 'Live Board', icon: Clock },
          { id: 'map', label: '2D Map', icon: Map },
          { id: 'coach', label: 'Coach Rake', icon: Layers },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                activeSubTab === tab.id
                  ? 'bg-white dark:bg-slate-800 text-theme-primary shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: Live Train Tracker */}
      {activeSubTab === 'tracker' && (
        <div className="space-y-3 animate-fadeIn">
          {/* Quick Train Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
            {TRAIN_TRIPS.slice(0, 8).map(t => (
              <button
                key={t.trainNumber}
                onClick={() => setSelectedTrainNumber(t.trainNumber)}
                className={`px-2.5 py-1.5 rounded-xl whitespace-nowrap font-bold border transition-all ${
                  selectedTrainNumber === t.trainNumber
                    ? 'bg-theme-primary text-white border-theme-primary shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {t.trainNumber} · {t.trainName.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Embedded Full Tracker */}
          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <TrainLiveTracker 
              key={selectedTrainNumber}
              initialTrainNumber={selectedTrainNumber}
            />
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Station Live Departure Board */}
      {activeSubTab === 'board' && (
        <div className="space-y-3 animate-fadeIn">
          {/* Station Selector Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-theme-primary" />
              <span>Departure Station:</span>
            </span>
            <select
              value={boardStationCode}
              onChange={(e) => setBoardStationCode(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-hidden"
            >
              {hubStations.map(s => (
                <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          {/* 3D God's Eye Wayfinding Button */}
          <button
            onClick={() => onOpenGodsEye(boardStationCode)}
            className="w-full p-3 rounded-2xl bg-linear-to-r from-blue-900 to-indigo-900 border border-blue-500/40 text-white flex items-center justify-between shadow-md active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Compass className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold">Open 3D God's Eye Station Layout</div>
                <div className="text-[10px] text-cyan-200">Interactive FOB walk time & step-free elevators</div>
              </div>
            </div>
            <Eye className="w-4 h-4 text-cyan-300" />
          </button>

          {/* Departure List */}
          <div className="space-y-2">
            {[
              { pf: 'PF 4', time: '10:45', name: 'CSMT Fast Local', line: 'Central Fast', rake: '12-car', isAc: false, crowd: 'Moderate', status: 'On Time' },
              { pf: 'PF 1', time: '10:48', name: 'Borivali Slow Local', line: 'Western Slow', rake: '15-car', isAc: true, crowd: 'Light', status: 'On Time' },
              { pf: 'PF 5', time: '10:50', name: 'Kalyan Fast Local', line: 'Central Fast', rake: '12-car', isAc: false, crowd: 'Heavy', status: '+2 min' },
              { pf: 'PF 3', time: '11:00', name: 'Kalyan AC Fast Local', line: 'Central AC', rake: '12-car AC', isAc: true, crowd: 'Light', status: 'On Time' },
              { pf: 'PF 6', time: '11:05', name: 'Thane Slow Local', line: 'Central Slow', rake: '12-car', isAc: false, crowd: 'Moderate', status: 'On Time' }
            ].map((train, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-mono font-black text-slate-800 dark:text-slate-200">{train.pf}</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{train.name}</span>
                      {train.isAc && (
                        <span className="px-1 py-0.2 rounded-sm bg-cyan-500/20 text-cyan-500 font-extrabold text-[8px]">AC</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">{train.line} · {train.rake}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-black text-xs text-slate-900 dark:text-slate-100">{train.time}</div>
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{train.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: 2D Interactive Network Map */}
      {activeSubTab === 'map' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-2">
            <NetworkMapViewer 
              onPlanRouteFromStation={onPlanRouteFromStation}
              onPlanRouteToStation={onPlanRouteToStation}
              onOpenGodsEye={onOpenGodsEye}
            />
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Coach Rake Position Guide (Wagenstandsanzeiger) */}
      {activeSubTab === 'coach' && (() => {
        const currentTrain = TRAIN_TRIPS.find(t => t.trainNumber === selectedTrainNumber);
        const matchingStop = currentTrain?.stops.find(s => s.stationCode === boardStationCode) || currentTrain?.stops[0];
        const currentStation = matchingStop?.stationCode || boardStationCode || 'DR';
        const currentPlatform = matchingStop?.platform || '1';
        const rakeType = currentTrain?.serviceType.includes('ac')
          ? '12_car_ac_suburban'
          : currentTrain?.rakeType === '15_car'
          ? '15_car_suburban'
          : '12_car_suburban';

        return (
          <div className="space-y-3 animate-fadeIn">
            {/* Quick Train Selector for Coach Guide */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
              {TRAIN_TRIPS.slice(0, 8).map(t => (
                <button
                  key={t.trainNumber}
                  onClick={() => setSelectedTrainNumber(t.trainNumber)}
                  className={`px-2.5 py-1.5 rounded-xl whitespace-nowrap font-bold border transition-all ${
                    selectedTrainNumber === t.trainNumber
                      ? 'bg-theme-primary text-white border-theme-primary shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t.trainNumber} · {t.trainName.split(' ')[0]}
                </button>
              ))}
            </div>
            <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-3">
              <CoachPositionGuide
                key={`${selectedTrainNumber}-${currentStation}-${currentPlatform}`}
                initialRakeType={rakeType}
                stationCode={currentStation}
                platformNumber={currentPlatform}
              />
            </div>
          </div>
        );
      })()}

    </div>
  );
};
