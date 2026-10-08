import React, { useState, useEffect, useRef } from 'react';
import { FastForward, Sparkles, Train, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface LaunchSequenceProps {
  onComplete: () => void;
}

export const LaunchSequence: React.FC<LaunchSequenceProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'brand' | 'train' | 'fadeout'>('brand');
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('railone_launch_muted') === 'true';
  });
  const audioContextRef = useRef<any>(null);

  const playSynthesizedHorn = (muted: boolean) => {
    if (muted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // Realistic dual-tone Indian Railway electric locomotive horn (approx 311 Hz and 370 Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(311, ctx.currentTime);
      osc2.frequency.setValueAtTime(370, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem('railone_launch_muted', String(next));
    if (!next) {
      playSynthesizedHorn(false);
    }
  };

  const restartSequence = () => {
    setPhase('brand');
    playSynthesizedHorn(isMuted);
    setTimeout(() => setPhase('train'), 800);
    setTimeout(() => setPhase('fadeout'), 2400);
    setTimeout(() => onComplete(), 2900);
  };

  useEffect(() => {
    // Respect reduced motion settings
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      onComplete();
      return;
    }

    playSynthesizedHorn(isMuted);
    const t1 = setTimeout(() => setPhase('train'), 800);
    const t2 = setTimeout(() => setPhase('fadeout'), 2400);
    const t3 = setTimeout(() => onComplete(), 2900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch {}
      }
    };
  }, [onComplete]);

  return (
    <div 
      className={`absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6 select-none transition-opacity duration-500 overflow-hidden ${
        phase === 'fadeout' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Bar with Audio Toggle and Skip Button */}
      <div className="w-full flex justify-between items-center z-20 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">RailOne Next v3.0</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs backdrop-blur-md transition-all active:scale-95"
            title={isMuted ? 'Unmute Railway Horn' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute Railway Horn' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />}
          </button>
          <button
            onClick={restartSequence}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs backdrop-blur-md transition-all active:scale-95"
            title="Replay Cinematic Launch"
            aria-label="Replay Cinematic Launch"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
          </button>
          <button
            onClick={onComplete}
            title="Skip Intro"
            aria-label="Skip Intro"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
          >
            <span>Skip</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
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
          Unofficial Educational Transit Prototype · Indian Railways Transit Model
        </span>
      </div>
    </div>
  );
};
