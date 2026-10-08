import React, { useState, useEffect, useRef } from 'react';
import { PassengerMobileApp } from './PassengerMobileApp';
import { VisualQRCode } from './VisualQRCode';
import { useAuthority } from './AuthorityContext';
import {
  Smartphone,
  Maximize2,
  Minimize2,
  QrCode,
  ChevronDown,
  X,
  Copy,
  Check
} from 'lucide-react';

export interface DevicePreset {
  id: string;
  name: string;
  platform: 'ios' | 'android';
  width: number;
  height: number;
  borderRadius: number;
  hasDynamicIsland?: boolean;
  hasPunchHole?: boolean;
  hasClassicBezel?: boolean;
}

export const DEVICE_PRESETS: DevicePreset[] = [
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    platform: 'ios',
    width: 393,
    height: 852,
    borderRadius: 54,
    hasDynamicIsland: true
  },
  {
    id: 'galaxy-s24',
    name: 'Samsung Galaxy S24',
    platform: 'android',
    width: 360,
    height: 780,
    borderRadius: 42,
    hasPunchHole: true
  },
  {
    id: 'pixel-8',
    name: 'Google Pixel 8',
    platform: 'android',
    width: 412,
    height: 892,
    borderRadius: 46,
    hasPunchHole: true
  },
  {
    id: 'iphone-se',
    name: 'iPhone SE (3rd Gen)',
    platform: 'ios',
    width: 375,
    height: 667,
    borderRadius: 36,
    hasClassicBezel: true
  }
];

export const MobileDeviceSimulator: React.FC = () => {
  const { authority } = useAuthority();
  // Device Selection & Scaling State
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEVICE_PRESETS[0]);
  const [fitToScreen, setFitToScreen] = useState<boolean>(true);
  const [scaleFactor, setScaleFactor] = useState<number>(1);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);

  // Phone QR Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // Quick Scenario Preset to feed into Passenger Mobile App
  const [presetOrigin, setPresetOrigin] = useState<string>(authority?.defaultOriginCode || 'TNA');
  const [presetDest, setPresetDest] = useState<string>(authority?.defaultDestCode || 'CSMT');

  useEffect(() => {
    if (authority) {
      setPresetOrigin(authority.defaultOriginCode);
      setPresetDest(authority.defaultDestCode);
    }
  }, [authority.id, authority.defaultOriginCode, authority.defaultDestCode]);

  // Network Host URL detection
  const [lanHostUrl, setLanHostUrl] = useState<string>('http://localhost:3000');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      setLanHostUrl(`http://${host}${port}`);
    }
  }, []);

  // Window resize handler for dynamic scaling & mobile viewport detection
  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // If screen is narrow (physical phone or small window <= 640px), auto-switch to full native mobile mode
      setIsMobileScreen(windowWidth <= 640);

      if (fitToScreen) {
        // Reserve 88px for top toolbar and bottom breathing space
        const availableHeight = Math.max(300, windowHeight - 92);
        const availableWidth = Math.max(300, windowWidth - 48);

        const verticalScale = availableHeight / selectedDevice.height;
        const horizontalScale = availableWidth / selectedDevice.width;

        const optimal = Math.min(1, verticalScale, horizontalScale);
        setScaleFactor(Number(optimal.toFixed(3)));
      } else {
        setScaleFactor(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedDevice, fitToScreen]);

  const handleCopyLanUrl = () => {
    navigator.clipboard.writeText(lanHostUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handlePresetSelect = (origin: string, dest: string) => {
    setPresetOrigin(origin);
    setPresetDest(dest);
  };

  // IF ON NATIVE MOBILE VIEWPORT: render full screen without chassis bezel
  if (isMobileScreen) {
    return (
      <div className="w-full h-full min-h-screen bg-slate-950 flex flex-col relative">
        <PassengerMobileApp
          presetOrigin={presetOrigin}
          presetDest={presetDest}
        />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col select-none relative font-sans">
      
      {/* =========================================================================
          TOP OUTER TOOLBAR (Strictly Outside Passenger Smartphone Viewport)
          ========================================================================= */}
      <header className="shrink-0 h-14 px-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between z-30 shadow-md backdrop-blur-md">
        
        {/* Left: Project Brand & Simulator Label */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-theme-primary text-white flex items-center justify-center font-black text-xs shadow-xs">
              RO
            </div>
            <span className="text-sm font-black tracking-tight text-white">RailOne Next</span>
          </div>
          <span className="text-slate-600 text-xs">/</span>
          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
            Mobile Device Simulator
          </span>
        </div>

        {/* Center: Device Presets & Scale Controls */}
        <div className="flex items-center gap-2">
          {/* Device Selector */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/80 text-xs">
            {DEVICE_PRESETS.map(preset => {
              const isSelected = preset.id === selectedDevice.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedDevice(preset)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-theme-primary text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{preset.name}</span>
                </button>
              );
            })}
          </div>

          {/* Fit to Screen / 100% Zoom Toggle */}
          <button
            onClick={() => setFitToScreen(!fitToScreen)}
            className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-all ${
              fitToScreen
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={fitToScreen ? 'Auto-Fit Active (Fits laptop height)' : '100% Native 1:1 Scale'}
          >
            {fitToScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="text-[11px] font-mono font-bold pr-1">
              {Math.round(scaleFactor * 100)}%
            </span>
          </button>
        </div>

        {/* Right: Real Phone QR & Reviewer Drawer Triggers */}
        <div className="flex items-center gap-2">
          {/* Quick Route Preset Dropdown */}
          <div className="relative group hidden lg:block">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold">
              <span className="text-[10px] text-slate-400">Route Preset:</span>
              <span>{presetOrigin} ➔ {presetDest}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-72 bg-slate-900 border border-slate-700 rounded-2xl p-1.5 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                {authority.shortTitle} Corridors
              </div>
              {authority.corridors && authority.corridors.length > 0 ? (
                authority.corridors.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetSelect(c.from, c.to)}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span className="truncate pr-1.5">{c.name.split('(')[0].trim() || c.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">[VERIFIED TRUNK]</span>
                  </button>
                ))
              ) : (
                [
                  { from: 'ADH', to: 'CSMT', label: 'Andheri ➔ CSMT' },
                  { from: 'TNA', to: 'DR', label: 'Thane ➔ Dadar' },
                  { from: 'TNA', to: 'CSMT', label: 'Thane ➔ CSMT' }
                ].map(r => (
                  <button
                    key={`${r.from}-${r.to}`}
                    onClick={() => handlePresetSelect(r.from, r.to)}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>{r.label}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">[VERIFIED TRUNK]</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Physical Phone QR Modal Trigger */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all active:scale-95"
            title="Scan with real phone camera"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Real Phone</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN CENTERED STAGE: SMARTPHONE CHASSIS & SCREEN
          ========================================================================= */}
      <main className="flex-1 w-full h-full flex items-center justify-center p-2 relative overflow-hidden bg-radial from-slate-900 via-slate-950 to-slate-950">
        
        {/* Soft Ambient Radial Behind Phone */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-theme-primary/10 blur-[120px] pointer-events-none" />

        {/* Scaled Phone Container */}
        <div
          className="relative transition-transform duration-200 ease-out flex items-center justify-center shrink-0"
          style={{
            transform: `scale(${scaleFactor})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Outer Phone Chassis / Titanium Frame */}
          <div
            className="relative bg-slate-900 p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.15)] ring-1 ring-black"
            style={{
              width: selectedDevice.width + 24, // Bezel padding
              height: selectedDevice.height + 24,
              borderRadius: selectedDevice.borderRadius + 8
            }}
          >
            {/* Outer Hardware Buttons (Side Accents) */}
            {/* Left Volume / Action Buttons */}
            <div className="absolute -left-[5px] top-28 w-[5px] h-10 bg-slate-700 rounded-l-md" />
            <div className="absolute -left-[5px] top-44 w-[5px] h-12 bg-slate-700 rounded-l-md" />
            <div className="absolute -left-[5px] top-60 w-[5px] h-12 bg-slate-700 rounded-l-md" />
            {/* Right Power Button */}
            <div className="absolute -right-[5px] top-36 w-[5px] h-16 bg-slate-700 rounded-r-md" />

            {/* Inner Phone Screen Viewport */}
            <div
              className="relative w-full h-full overflow-hidden bg-black shadow-inner"
              style={{
                borderRadius: selectedDevice.borderRadius
              }}
            >
              {/* Dynamic Island or Camera Cutout */}
              {selectedDevice.hasDynamicIsland && (
                <div 
                  className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 w-[122px] h-[34px] bg-black rounded-full flex items-center justify-between px-3 shadow-md pointer-events-none"
                  aria-hidden="true"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                  <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-800 ring-1 ring-blue-950/40" />
                </div>
              )}

              {selectedDevice.hasPunchHole && (
                <div 
                  className="absolute top-3 left-1/2 -translate-x-1/2 z-40 w-3.5 h-3.5 bg-black rounded-full border border-slate-800 shadow-md pointer-events-none"
                  aria-hidden="true"
                />
              )}

              {selectedDevice.hasClassicBezel && (
                <div 
                  className="absolute top-2 left-1/2 -translate-x-1/2 z-40 w-16 h-1.5 bg-slate-800 rounded-full pointer-events-none"
                  aria-hidden="true"
                />
              )}

              {/* The Actual Passenger Mobile Application */}
              <PassengerMobileApp
                presetOrigin={presetOrigin}
                presetDest={presetDest}
              />

              {/* Bottom Home Indicator Bar (iOS / Android Modern) */}
              <div 
                className="absolute bottom-1 left-1/2 -translate-x-1/2 z-40 w-32 h-1 rounded-full bg-slate-400/40 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

      </main>

      {/* =========================================================================
          MODALS & PANELS (Strictly Outside Phone Viewport)
          ========================================================================= */}
      
      {/* 1. Real Device LAN / QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-black text-sm">
                <QrCode className="w-5 h-5" />
                <span>Open on Physical Smartphone (LAN)</span>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl">
              <VisualQRCode payload={lanHostUrl} size={180} />
              <span className="text-[10px] text-slate-500 font-mono mt-2 font-bold">
                Scan using iPhone Camera or Android Lens
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[11px] font-bold text-slate-400">Local Network URL:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={lanHostUrl}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-emerald-400 text-xs"
                />
                <button
                  onClick={handleCopyLanUrl}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1 transition-all"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] space-y-1.5 text-slate-400">
              <div className="font-bold text-slate-200">How to test on a physical phone:</div>
              <p>1. Connect your smartphone to the <strong>same Wi-Fi network</strong> as this computer.</p>
              <p>2. If your computer uses a firewall, ensure port <code>3000</code> allows incoming local connections.</p>
              <p>3. Point your camera at the QR code above or type the URL into mobile Safari / Chrome.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
