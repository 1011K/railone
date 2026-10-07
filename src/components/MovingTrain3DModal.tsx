import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Volume2, 
  VolumeX, 
  X, 
  ArrowRight, 
  Zap, 
  Gauge, 
  ShieldCheck, 
  Sun,
  Moon,
  Sunset,
  FastForward,
  RotateCcw,
  Train,
  CheckCircle2
} from 'lucide-react';

interface MovingTrain3DModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TrainType = 'vande_bharat' | 'ac_local' | 'wap7_express';

export const MovingTrain3DModal: React.FC<MovingTrain3DModalProps> = ({
  isOpen,
  onClose
}) => {
  const [speed, setSpeed] = useState(0);
  const [targetSpeed, setTargetSpeed] = useState(105);
  const [trainType, setTrainType] = useState<TrainType>('vande_bharat');
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('night');
  const [isHornPlaying, setIsHornPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState('Thane Express Chord');
  const [nextStation, setNextStation] = useState('Dadar Junction');
  const [distanceKm, setDistanceKm] = useState(18.4);
  const [audioAllowed, setAudioAllowed] = useState(true);

  // Speed acceleration animation
  useEffect(() => {
    if (!isOpen) {
      setSpeed(0);
      return;
    }
    const interval = setInterval(() => {
      setSpeed(curr => {
        if (curr < targetSpeed) return Math.min(targetSpeed, curr + 2);
        if (curr > targetSpeed) return Math.max(targetSpeed, curr - 3);
        // Slight organic oscillation
        return targetSpeed + Math.floor(Math.sin(Date.now() / 600) * 2);
      });

      setDistanceKm(d => Math.max(0.2, Number((d - 0.03).toFixed(2))));
    }, 60);

    return () => clearInterval(interval);
  }, [isOpen, targetSpeed]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Synthesize realistic railway horn chime using browser Web Audio API
  const playTrainHorn = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      // Indian Railways dual-tone dual horn (311Hz & 466Hz)
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(311.13, audioCtx.currentTime); // D#4
      osc2.frequency.setValueAtTime(466.16, audioCtx.currentTime); // A#4

      gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.08);
      gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 1.25);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 1.25);
      osc2.stop(audioCtx.currentTime + 1.25);

      setIsHornPlaying(true);
      setTimeout(() => setIsHornPlaying(false), 1250);
    } catch {
      // AudioContext unavailable
    }
  };

  const bgGradient = {
    night: 'from-slate-950 via-indigo-950 to-slate-900',
    sunset: 'from-amber-950 via-rose-950 to-indigo-950',
    day: 'from-sky-900 via-blue-900 to-indigo-950'
  }[timeOfDay];

  // Track animation speed based on simulated speed
  const trackAnimDuration = speed > 0 ? Math.max(0.12, 12 / Math.max(speed, 20)).toFixed(2) : '10s';

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-6 overflow-hidden select-none animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      
      {/* 3D Train Simulation Viewport Container */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="moving-train-3d-title"
        className={`relative w-full max-w-5xl h-[88vh] rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-gradient-to-b ${bgGradient} flex flex-col justify-between`}
      >
        
        {/* Top HUD Controls Bar */}
        <div className="relative z-30 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md gap-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <div>
              <div id="moving-train-3d-title" className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>3D Train Dynamics Simulator</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Quad-Track Fast Corridor · Central & Western Railways Mumbai
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Train Selector */}
            <div className="flex items-center bg-white/10 rounded-xl p-1 text-[11px]">
              {[
                { id: 'vande_bharat', label: 'Vande Bharat' },
                { id: 'ac_local', label: 'AC Local' },
                { id: 'wap7_express', label: 'WAP-7 Superfast' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTrainType(t.id as TrainType)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    trainType === t.id 
                      ? 'bg-blue-600 text-white shadow-xs font-bold' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Environment Toggle */}
            <div className="hidden md:flex items-center bg-white/10 rounded-xl p-1 text-[11px]">
              {(['day', 'sunset', 'night'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTimeOfDay(t)}
                  className={`px-2 py-1 rounded-lg uppercase tracking-wider font-semibold transition-colors ${
                    timeOfDay === t ? 'bg-white text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Horn Button */}
            <button
              onClick={playTrainHorn}
              className={`px-3 py-1.5 rounded-xl border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                isHornPlaying ? 'bg-amber-500 text-slate-950 font-bold animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Indian Railways Dual-Tone Pneumatic Horn"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sound Horn</span>
            </button>

            {/* Skip / Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors ml-1"
              title="Enter App Directly"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Track & Train Moving Stage */}
        <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center [perspective:1000px]">
          
          {/* Distant Mountains & Mumbai Skyline Silhouette */}
          <div className="absolute top-[18%] inset-x-0 h-44 opacity-40 pointer-events-none flex justify-center">
            <svg viewBox="0 0 1200 200" className="w-full h-full text-indigo-900 fill-current">
              <polygon points="0,200 120,110 240,160 380,80 500,140 680,60 820,130 960,80 1100,150 1200,90 1200,200" />
            </svg>
          </div>

          {/* Passing Catenary Pylons (Left & Right) */}
          <div 
            className="absolute top-[20%] left-8 w-1 h-64 bg-slate-400/30 origin-top pointer-events-none"
            style={{ animation: `sideScroll ${Number(trackAnimDuration) * 3}s linear infinite` }}
          >
            <div className="w-16 h-1 bg-slate-300/40 -translate-x-4" />
          </div>

          <div 
            className="absolute top-[20%] right-8 w-1 h-64 bg-slate-400/30 origin-top pointer-events-none"
            style={{ animation: `sideScroll ${Number(trackAnimDuration) * 3}s linear infinite` }}
          >
            <div className="w-16 h-1 bg-slate-300/40 translate-x-0" />
          </div>

          {/* OHE Catenary Electric Wire Overhead */}
          <div className="absolute top-[26%] inset-x-0 h-0.5 bg-blue-300/40 shadow-[0_0_8px_rgba(147,197,253,0.8)] z-10">
            {/* Pantograph Spark Arc */}
            <div className="absolute left-1/2 -top-1 w-2.5 h-2.5 bg-cyan-200 rounded-full shadow-[0_0_12px_#67e8f9] animate-spark -translate-x-1/2" />
          </div>

          {/* Trackside Signal Post (Green Aspect) */}
          <div className="absolute top-[32%] right-[18%] z-15 flex flex-col items-center pointer-events-none">
            <div className="w-1.5 h-28 bg-slate-700" />
            <div className="w-5 h-12 bg-black border border-slate-600 rounded-md p-1 flex flex-col justify-around items-center -mt-28">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-signal-green" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            </div>
            <div className="text-[8px] font-mono text-emerald-400 mt-1 uppercase">Green Aspect</div>
          </div>

          {/* 3D Ground & Perspective Tracks Floor */}
          <div 
            className="absolute bottom-0 w-[200%] h-[78%] pointer-events-none [transform:rotateX(72deg)] origin-bottom"
            style={{
              backgroundImage: `
                linear-gradient(to right, 
                  transparent 47.5%, 
                  rgba(220,230,245,0.85) 48%, 
                  rgba(220,230,245,0.85) 48.6%, 
                  transparent 49.2%, 
                  transparent 50.8%, 
                  rgba(220,230,245,0.85) 51.4%, 
                  rgba(220,230,245,0.85) 52%, 
                  transparent 52.5%
                ),
                repeating-linear-gradient(to top, 
                  rgba(140,95,50,0.9) 0px, 
                  rgba(140,95,50,0.9) 14px, 
                  transparent 14px, 
                  transparent 44px
                ),
                radial-gradient(circle, rgba(100,100,120,0.4) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 100% 44px, 12px 12px',
              animation: `trackScroll ${trackAnimDuration}s linear infinite`
            }}
          />

          {/* Dual Powerful 3D Headlight Beams */}
          <div className="absolute bottom-[20%] w-80 h-[28rem] pointer-events-none z-10 opacity-75">
            <div className="w-full h-full bg-gradient-to-t from-yellow-200/50 via-yellow-100/20 to-transparent [clip-path:polygon(40%_100%,_60%_100%,_100%_0%,_0%_0%)] filter blur-xs animate-pulse" />
          </div>

          {/* ============================================================== */}
          {/* 3D Train Engine & Aerodynamic Rake Model                       */}
          {/* ============================================================== */}
          <div className="relative z-20 flex flex-col items-center [transform:translateZ(140px)_scale(1.15)] animate-trainRock">
            
            {/* Pantograph with High-Voltage Arm */}
            <div className="w-20 h-10 border-t-2 border-x-2 border-slate-300/80 mb-[-4px] relative [transform:perspective(200px)_rotateX(25deg)]">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-sky-400 shadow-[0_0_14px_#38bdf8]" />
              <div className="absolute left-1/2 -top-2 w-1.5 h-3 bg-yellow-300 rounded-full shadow-[0_0_8px_#fde047] -translate-x-1/2" />
            </div>

            {/* TRAIN BODY: 1. VANDE BHARAT EXPRESS */}
            {trainType === 'vande_bharat' && (
              <div className="w-72 sm:w-88 h-48 rounded-t-[54px] rounded-b-2xl bg-gradient-to-b from-slate-100 via-blue-700 to-slate-900 border-2 border-blue-400/80 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative overflow-hidden flex flex-col items-center">
                {/* Roof Ribs */}
                <div className="w-full h-4 bg-slate-200/50 border-b border-blue-900 flex justify-around px-6">
                  <span className="w-1.5 h-full bg-blue-900/30" />
                  <span className="w-1.5 h-full bg-blue-900/30" />
                  <span className="w-1.5 h-full bg-blue-900/30" />
                </div>

                {/* Windshield Glass */}
                <div className="w-56 sm:w-68 h-16 mt-2 rounded-t-2xl rounded-b-lg bg-gradient-to-b from-cyan-950 via-slate-900 to-cyan-900 border border-cyan-400/60 relative overflow-hidden shadow-inner">
                  <div className="absolute bottom-1 left-1/2 w-10 h-0.5 bg-slate-400 origin-left [transform:rotate(-35deg)]" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
                  <div className="text-[10px] text-center text-cyan-300 font-mono pt-1 tracking-wider">
                    VANDE BHARAT 2.0 · PILOT CABIN
                  </div>
                </div>

                {/* Tricolor Saffron/White/Green Stripe */}
                <div className="w-full h-3 mt-2 flex flex-col">
                  <div className="h-1 bg-amber-500" />
                  <div className="h-1 bg-white" />
                  <div className="h-1 bg-emerald-600" />
                </div>

                {/* Headlights & Center Logo */}
                <div className="w-full px-8 mt-2.5 flex items-center justify-between">
                  <div className="w-7 h-7 rounded-full bg-yellow-100 border-2 border-white shadow-[0_0_24px_#fef08a] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>

                  <div className="text-center font-bold font-mono text-[11px] text-white tracking-widest bg-blue-950/90 px-3.5 py-1 rounded-lg border border-blue-400/60 shadow-xs">
                    RAILONE NEXT
                  </div>

                  <div className="w-7 h-7 rounded-full bg-yellow-100 border-2 border-white shadow-[0_0_24px_#fef08a] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
                </div>

                {/* Lower Cowcatcher */}
                <div className="w-full h-9 mt-auto bg-slate-950 border-t border-slate-700 flex items-center justify-around px-4">
                  <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600" />
                  <div className="h-4 w-20 bg-gradient-to-b from-slate-700 to-slate-900 rounded-sm" />
                  <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600" />
                </div>
              </div>
            )}

            {/* TRAIN BODY: 2. AC MUMBAI SUBURBAN LOCAL */}
            {trainType === 'ac_local' && (
              <div className="w-72 sm:w-88 h-48 rounded-t-[36px] rounded-b-2xl bg-gradient-to-b from-slate-200 via-sky-600 to-slate-900 border-2 border-sky-400 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative overflow-hidden flex flex-col items-center">
                {/* Destination Display LED Board */}
                <div className="w-60 h-6 mt-2 bg-black border border-amber-500/70 rounded-md flex items-center justify-center px-2">
                  <div className="text-amber-400 font-mono text-xs font-bold tracking-widest uppercase animate-pulse">
                    CHURCHGATE FAST · AC
                  </div>
                </div>

                {/* Front Windshield */}
                <div className="w-56 sm:w-68 h-14 mt-1.5 rounded-t-xl rounded-b-md bg-slate-950 border border-sky-300/40 relative overflow-hidden">
                  <div className="text-[9px] text-center text-sky-300 font-mono pt-1">
                    WESTERN RAILWAY · MEDHA RAKE
                  </div>
                </div>

                {/* Suburb Blue Livery Stripe */}
                <div className="w-full h-4 mt-2 bg-sky-500 border-y border-white flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                    MUMBAI SUBURBAN AC CORRIDOR
                  </span>
                </div>

                {/* Headlights */}
                <div className="w-full px-8 mt-2 flex items-center justify-between">
                  <div className="w-6 h-6 rounded-full bg-yellow-200 border-2 border-white shadow-[0_0_20px_#fef08a]" />
                  <div className="px-3 py-0.5 bg-slate-900 rounded text-[10px] font-mono text-slate-300">
                    95114 AC
                  </div>
                  <div className="w-6 h-6 rounded-full bg-yellow-200 border-2 border-white shadow-[0_0_20px_#fef08a]" />
                </div>

                {/* Bottom Buffer */}
                <div className="w-full h-8 mt-auto bg-slate-950 border-t border-slate-700 flex items-center justify-around px-4">
                  <span className="w-4 h-4 rounded-full bg-slate-700" />
                  <div className="h-3 w-16 bg-slate-800 rounded-xs" />
                  <span className="w-4 h-4 rounded-full bg-slate-700" />
                </div>
              </div>
            )}

            {/* TRAIN BODY: 3. WAP-7 SUPERFAST ELECTRIC LOCO */}
            {trainType === 'wap7_express' && (
              <div className="w-72 sm:w-88 h-48 rounded-t-[30px] rounded-b-2xl bg-gradient-to-b from-rose-700 via-rose-800 to-slate-950 border-2 border-rose-400 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative overflow-hidden flex flex-col items-center">
                {/* WAP-7 Roof Equipment */}
                <div className="w-full h-4 bg-slate-800 border-b border-rose-950 flex justify-around">
                  <span className="w-2 h-full bg-slate-600" />
                  <span className="w-2 h-full bg-slate-600" />
                </div>

                {/* Dual Windshield Cabins */}
                <div className="w-60 h-14 mt-2 flex gap-2">
                  <div className="flex-1 bg-slate-950 border border-slate-700 rounded-t-lg" />
                  <div className="flex-1 bg-slate-950 border border-slate-700 rounded-t-lg" />
                </div>

                {/* Loco Number & Shed Crest */}
                <div className="w-full px-6 mt-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white bg-black/60 px-2 py-0.5 rounded">
                    WAP-7 #30452
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 uppercase">
                    KALYAN SHED (CR)
                  </span>
                </div>

                {/* Powerful Twin High-Intensity Beams */}
                <div className="w-full px-8 mt-2 flex items-center justify-between">
                  <div className="w-7 h-7 rounded-full bg-yellow-200 border-2 border-white shadow-[0_0_25px_#fde047]" />
                  <div className="text-[10px] text-white font-mono uppercase bg-rose-950 px-2 py-0.5 rounded border border-rose-600">
                    DECCAN QUEEN
                  </div>
                  <div className="w-7 h-7 rounded-full bg-yellow-200 border-2 border-white shadow-[0_0_25px_#fde047]" />
                </div>

                {/* Heavy Buffer Beam */}
                <div className="w-full h-8 mt-auto bg-slate-950 border-t-2 border-yellow-400 flex items-center justify-around px-4">
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-600" />
                  <div className="h-3 w-16 bg-red-900 rounded-xs" />
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-600" />
                </div>
              </div>
            )}

            {/* Track Shadow & Steel Rail Contact */}
            <div className="w-80 h-5 bg-black/90 rounded-full filter blur-sm mt-[-8px]" />
          </div>

        </div>

        {/* Bottom HUD: Live Speedometer & Action Button */}
        <div className="relative z-30 p-4 sm:p-6 bg-slate-950/95 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Speed & Line Telemetry */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 font-mono font-bold text-lg shrink-0">
                <Gauge className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl font-black text-white tracking-tight">{speed}</span>
                  <span className="text-xs text-slate-400 font-semibold">KM/H</span>
                  <span className="text-[11px] text-slate-500 font-mono ml-2">(MPS: 110)</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Cruising Section · Signal Cleared</span>
                </div>
              </div>
            </div>

            {/* Speed Controls: Cruise, Accel, Brake */}
            <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl text-xs">
              <button
                onClick={() => setTargetSpeed(115)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  targetSpeed === 115 ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                Full Throttle (115)
              </button>
              <button
                onClick={() => setTargetSpeed(85)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  targetSpeed === 85 ? 'bg-blue-500 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Cruise (85)
              </button>
              <button
                onClick={() => setTargetSpeed(40)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  targetSpeed === 40 ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                Cautious (40)
              </button>
            </div>

            <div className="hidden lg:block h-8 w-px bg-white/10" />

            <div className="hidden lg:block text-xs space-y-0.5">
              <div className="text-slate-400">Next Major Junction:</div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>{nextStation}</span>
                <span className="text-[11px] font-mono text-cyan-400">({distanceKm} km away)</span>
              </div>
            </div>
          </div>

          {/* Call to Action: Enter App */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onClose}
              className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Enter RailOne Next Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes trackScroll {
          0% { background-position: 0 0, 0 0, 0 0; }
          100% { background-position: 0 0, 0 44px, 0 0; }
        }
        @keyframes sideScroll {
          0% { transform: translateY(-50px) scale(0.6); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(180px) scale(1.4); opacity: 0; }
        }
        @keyframes trainRock {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(0.4deg); }
        }
        .animate-trainRock {
          animation: trainRock 0.22s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MovingTrain3DModal;
