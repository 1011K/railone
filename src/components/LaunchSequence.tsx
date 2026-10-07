import React, { useState, useEffect } from 'react';
import { FastForward, Sparkles, Train } from 'lucide-react';

interface LaunchSequenceProps {
  onComplete: () => void;
}

export const LaunchSequence: React.FC<LaunchSequenceProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'brand' | 'train' | 'fadeout'>('brand');

  useEffect(() => {
    // Respect reduced motion settings
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      onComplete();
      return;
    }

    const t1 = setTimeout(() => setPhase('train'), 700);
    const t2 = setTimeout(() => setPhase('fadeout'), 2100);
    const t3 = setTimeout(() => onComplete(), 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div 
      className={`absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6 select-none transition-opacity duration-500 overflow-hidden ${
        phase === 'fadeout' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Bar with Skip Button */}
      <div className="w-full flex justify-between items-center z-20 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">RailOne Next v3.0</span>
        </div>
        <button
          onClick={onComplete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
        >
          <span>Skip</span>
          <FastForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Middle Animated Stage */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-center">
        {/* Ambient Railway Glow */}
        <div className="absolute w-64 h-64 rounded-full bg-theme-primary/20 blur-3xl pointer-events-none" />

        {/* Phase 1: Brand Reveal */}
        <div 
          className={`flex flex-col items-center transition-all duration-700 transform ${
            phase === 'brand' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'
          }`}
        >
          <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-blue-600 via-indigo-600 to-blue-800 flex items-center justify-center shadow-2xl border border-white/20 mb-4 animate-bounce">
            <Train className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>RailOne</span>
            <span className="text-theme-primary">Next</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
            Indian Railways Passenger Intelligence Hub
          </p>
        </div>

        {/* Phase 2: Modeled Aerodynamic Train Rush */}
        <div 
          className={`w-full flex flex-col items-center transition-all duration-700 transform ${
            phase === 'train' ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none absolute'
          }`}
        >
          {/* 3D Perspective Track */}
          <div className="relative w-72 h-36 flex items-center justify-center [perspective:600px]">
            {/* Overhead Catenary Spark */}
            <div className="absolute top-2 w-full h-0.5 bg-cyan-400/60 shadow-[0_0_12px_#22d3ee]">
              <div className="w-2 h-2 rounded-full bg-cyan-200 shadow-[0_0_8px_#67e8f9] mx-auto animate-ping" />
            </div>

            {/* Receding Rails */}
            <div className="absolute bottom-2 w-64 h-24 [transform:rotateX(65deg)] border-x-4 border-slate-600 flex flex-col justify-around">
              <div className="w-full h-1 bg-slate-700" />
              <div className="w-full h-1 bg-slate-700" />
              <div className="w-full h-1 bg-slate-700" />
            </div>

            {/* Approaching Train Model Silhouette */}
            <div className="relative z-10 w-44 h-28 rounded-2xl bg-linear-to-b from-blue-700 via-blue-900 to-slate-900 border-2 border-blue-400/80 shadow-[0_0_30px_rgba(37,99,235,0.6)] flex flex-col items-center justify-between p-3 animate-pulse">
              {/* Pantograph */}
              <div className="w-8 h-2 border-t-2 border-slate-300 -mt-4" />

              {/* Windshield Cockpit */}
              <div className="w-32 h-10 rounded-lg bg-linear-to-b from-slate-950 to-slate-800 border border-slate-600 flex items-center justify-center">
                <div className="text-[9px] font-mono tracking-wider font-bold text-amber-300">95114 AC FAST</div>
              </div>

              {/* Dual Illuminated Headlights */}
              <div className="w-full flex justify-between px-3 mb-1">
                <div className="w-4 h-4 rounded-full bg-amber-200 shadow-[0_0_16px_#fde047] border border-amber-100" />
                <div className="w-3 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] self-center" />
                <div className="w-4 h-4 rounded-full bg-amber-200 shadow-[0_0_16px_#fde047] border border-amber-100" />
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="text-sm font-bold text-white tracking-wide flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-theme-primary animate-spin" />
              <span>Initializing Transit Graph & Verified Schedules...</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Central · Western · Harbour · Mumbai Metro
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Notice */}
      <div className="w-full text-center pb-3">
        <span className="text-[10px] text-slate-500">
          Unofficial Educational Transit Prototype · CRIS / IR Model
        </span>
      </div>
    </div>
  );
};
