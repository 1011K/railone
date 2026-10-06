import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { NetworkMapViewer } from './NetworkMapViewer';
import { TrainLiveTracker } from './TrainLiveTracker';
import { 
  Navigation, 
  Radio, 
  Compass, 
  Layers, 
  Train, 
  Activity,
  SlidersHorizontal
} from 'lucide-react';

interface NetworkAndStatusViewProps {
  onPlanRouteFromStation?: (stationCode: string) => void;
  onPlanRouteToStation?: (stationCode: string) => void;
  onOpenGodsEye?: (stationCode: string) => void;
  initialTrainNumber?: string;
  defaultSubTab?: 'map' | 'tracker';
}

export const NetworkAndStatusView: React.FC<NetworkAndStatusViewProps> = ({
  onPlanRouteFromStation,
  onPlanRouteToStation,
  onOpenGodsEye,
  initialTrainNumber = '95112',
  defaultSubTab = 'map'
}) => {
  const { language } = useTheme();
  const [subTab, setSubTab] = useState<'map' | 'tracker'>(defaultSubTab);
  const [activeTrain, setActiveTrain] = useState<string>(initialTrainNumber);

  const handleInspectTrain = (trainNo: string) => {
    setActiveTrain(trainNo);
    setSubTab('tracker');
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      
      {/* Sub-navigation Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold">
          <button
            onClick={() => setSubTab('map')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all min-h-[38px] ${
              subTab === 'map'
                ? 'bg-theme-primary text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>
              {language === 'hi' ? '2D/3D नेटवर्क मैप' : language === 'mr' ? '२D/३D नेटवर्क नकाशा' : 'Interactive Network Map (2D/3D)'}
            </span>
          </button>

          <button
            onClick={() => setSubTab('tracker')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all min-h-[38px] ${
              subTab === 'tracker'
                ? 'bg-theme-primary text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>
              {language === 'hi' ? 'ट्रेन स्थिति व सेवा अपडेट' : language === 'mr' ? 'ट्रेन स्थिती व सेवा अद्यतने' : 'Train Status & Service Updates'}
            </span>
          </button>
        </div>

        {/* Quick Launch Station 3D FOB Navigator */}
        {onOpenGodsEye && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-semibold hidden md:inline">3D Station Wayfinding:</span>
            {['DR', 'CLA', 'ADH', 'TNA', 'CCG'].map((code) => (
              <button
                key={code}
                onClick={() => onOpenGodsEye(code)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 min-h-[34px]"
                title={`Launch 3D God's Eye Layout for ${code}`}
              >
                <Compass className="w-3.5 h-3.5 text-theme-primary" />
                <span>{code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main View Area */}
      <div>
        {subTab === 'map' ? (
          <NetworkMapViewer
            onPlanRouteFromStation={onPlanRouteFromStation}
            onPlanRouteToStation={onPlanRouteToStation}
            onInspectTrainSchedule={handleInspectTrain}
            onOpenGodsEye={onOpenGodsEye}
          />
        ) : (
          <TrainLiveTracker
            initialTrainNumber={activeTrain}
          />
        )}
      </div>

    </div>
  );
};
