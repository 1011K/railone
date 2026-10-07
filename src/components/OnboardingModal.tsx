import React, { useState } from 'react';
import { CITIES_REGISTRY } from '../fixtures/citiesData';
import { TravelClass } from '../types/railway';
import { 
  Train, 
  MapPin, 
  Languages, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Sparkles, 
  User, 
  Smartphone,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (preferences: {
    cityId: string;
    language: 'en' | 'hi' | 'mr';
    travelClass: TravelClass;
    isAuthenticated: boolean;
  }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCityId, setSelectedCityId] = useState('mumbai');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [selectedClass, setSelectedClass] = useState<TravelClass>('II');
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [otpCode, setOtpCode] = useState('1011');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [gpsConsent, setGpsConsent] = useState(true);

  if (!isOpen) return null;

  const handleFinish = (authenticated: boolean) => {
    localStorage.setItem('railone_onboarding_completed', 'true');
    localStorage.setItem('railone_user_city', selectedCityId);
    localStorage.setItem('railone_user_lang', selectedLanguage);
    localStorage.setItem('railone_user_class', selectedClass);
    localStorage.setItem('railone_authenticated', authenticated ? 'true' : 'false');

    onComplete({
      cityId: selectedCityId,
      language: selectedLanguage,
      travelClass: selectedClass,
      isAuthenticated: authenticated
    });
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-5 text-white select-none overflow-y-auto animate-fadeIn">
      
      {/* Top Progress Header */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-theme-primary flex items-center justify-center font-black text-white text-xs shadow-md">
              R1
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">Welcome to RailOne Next</div>
              <div className="text-[10px] text-slate-400">Step {step} of 3</div>
            </div>
          </div>
          <button
            onClick={() => handleFinish(false)}
            className="text-[11px] font-semibold text-slate-400 hover:text-white px-2 py-1 rounded-lg"
          >
            Skip to App
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-3 gap-1.5 w-full">
          {[1, 2, 3].map(s => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-theme-primary' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Step Content Container */}
      <div className="my-auto py-4">
        
        {/* STEP 1: City & Language Selection */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-theme-primary" />
                <span>Select Your Transit City</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Onboarding establishes your city before loading authentic schedules and fares.
              </p>
            </div>

            {/* City Cards Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {Object.values(CITIES_REGISTRY).map(city => (
                <button
                  key={city.id}
                  onClick={() => setSelectedCityId(city.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    selectedCityId === city.id
                      ? 'bg-theme-primary/20 border-theme-primary ring-2 ring-theme-primary/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{city.name}</span>
                    {selectedCityId === city.id && <Check className="w-3.5 h-3.5 text-theme-primary" />}
                  </div>
                  <div className="text-[10px] text-slate-400">{city.nativeName}</div>
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      city.tier === 'FLAGSHIP_TIER1' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {city.provenanceTag}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <Languages className="w-3.5 h-3.5 text-indigo-400" />
                <span>Preferred Language</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'en', label: 'English', sub: 'Default' },
                  { id: 'hi', label: 'हिन्दी', sub: 'Hindi' },
                  { id: 'mr', label: 'मराठी', sub: 'Marathi' },
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLanguage(l.id as any)}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      selectedLanguage === l.id
                        ? 'bg-theme-primary text-white border-theme-primary font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="text-xs">{l.label}</div>
                    <div className="text-[9px] opacity-70">{l.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Commuter Preferences & Consent */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Commuter Travel Preferences</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize your default class and consent settings.
              </p>
            </div>

            {/* Default Class Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300">Default Suburban Travel Class</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'II', label: 'Second Class', desc: 'UTS standard fare' },
                  { id: 'I', label: 'First Class', desc: 'Padded coaches' },
                  { id: 'AC_LOCAL', label: 'AC Local', desc: 'Cooled EMU' },
                ].map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.id as TravelClass)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedClass === cls.id
                        ? 'bg-theme-primary/20 border-theme-primary ring-2 ring-theme-primary/40'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{cls.label}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{cls.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* GPS Location Consent Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Nearest Station Finding</span>
                </div>
                <input
                  type="checkbox"
                  checked={gpsConsent}
                  onChange={(e) => setGpsConsent(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Opt-in to use device location solely to detect your nearest suburban station. No location records are stored on remote servers.
              </p>
            </div>

            {/* Biometric Ready Architecture Card */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                <Lock className="w-4 h-4 text-theme-primary" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Biometric-Ready Architecture</div>
                <div className="text-[10px] text-slate-400">Ready for Face ID & Android Biometric Prompt</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Demo OTP Login & Verification */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-theme-primary" />
                <span>Simulated Passenger Login</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Safe demonstration login fixture. No real credentials or sensitive records collected.
              </p>
            </div>

            {/* OTP Form */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-300">
                    +91
                  </div>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="10-digit mobile"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-theme-primary"
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  onClick={() => setOtpSent(true)}
                  className="w-full py-2.5 rounded-xl bg-theme-primary hover:bg-blue-600 font-bold text-xs text-white transition-all active:scale-95 shadow-md"
                >
                  Request Demo OTP (SMS 1011)
                </button>
              ) : (
                <div className="space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Enter OTP Code</span>
                    <span className="text-emerald-400 font-mono font-bold">Safe Local Fixture: 1011</span>
                  </div>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={4}
                    className="w-full text-center tracking-widest text-lg font-mono font-black px-3 py-2 bg-slate-800 border border-emerald-500/50 rounded-xl text-emerald-400 focus:outline-hidden"
                  />
                  <button
                    onClick={() => {
                      setIsLoggedIn(true);
                      handleFinish(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Enter RailOne Next</span>
                  </button>
                </div>
              )}
            </div>

            {/* Guest Exploration Option */}
            <div className="text-center pt-1">
              <button
                onClick={() => handleFinish(false)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Or Continue as Guest (Full Explorer Access)
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Step Control Buttons */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            onClick={() => setStep(s => (s - 1) as any)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={() => setStep(s => (s + 1) as any)}
            className="px-5 py-2.5 rounded-xl bg-theme-primary hover:bg-blue-600 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg transition-all active:scale-95"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => handleFinish(false)}
            className="px-5 py-2.5 rounded-xl bg-theme-primary hover:bg-blue-600 text-xs font-bold text-white shadow-lg transition-all active:scale-95"
          >
            Launch Hub
          </button>
        )}
      </div>

    </div>
  );
};
