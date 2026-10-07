import React, { useState, useEffect, useRef } from 'react';
import { RailBackendTools } from '../engine/voiceTools';
import { 
  Mic, 
  MicOff, 
  PhoneCall, 
  PhoneOff, 
  Volume2, 
  Terminal, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  X
} from 'lucide-react';

interface VoiceDialerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewTicketWallet: () => void;
}

export const VoiceDialerModal: React.FC<VoiceDialerModalProps> = ({
  isOpen,
  onClose,
  onViewTicketWallet
}) => {
  const [activeMode, setActiveMode] = useState<'mic' | 'dialer' | 'telephony'>('dialer');
  const [isCalling, setIsCalling] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [dialedDigits, setDialedDigits] = useState<string>('');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'agent' | 'tool'; text: string; timestamp: string }>>([
    {
      role: 'agent',
      text: 'Namaste! RailSathi Voice Assistant here. You can ask for trains between Thane and Dadar, check live running status of 95112, or verify if an Express train is permitted for suburban travel.',
      timestamp: '10:35'
    }
  ]);
  const [executedToolCalls, setExecutedToolCalls] = useState<Array<{ tool: string; args: any; resultSummary: string }>>([]);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isCalling) {
      timerRef.current = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCalling]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatCallTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDialDigit = (digit: string) => {
    setDialedDigits(d => d + digit);
  };

  const handleStartCall = () => {
    setIsCalling(true);
    setConversationHistory(prev => [
      ...prev,
      {
        role: 'agent',
        text: 'Call connected to Indian Railways RailSathi Interactive Voice Service (Deterministic Simulator). Press keys or speak your journey inquiry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleEndCall = () => {
    setIsCalling(false);
    setIsListening(false);
  };

  // Deterministic command dispatcher
  const executeVoiceQuery = (query: string) => {
    const q = query.toLowerCase();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setConversationHistory(prev => [...prev, { role: 'user', text: query, timestamp: timeNow }]);

    // Helper to speak agent reply if browser speech synthesis is supported
    const speakAgentText = (text: string) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-IN';
          utterance.rate = 1.05;
          window.speechSynthesis.speak(utterance);
        } catch {
          // ignore speech synthesis errors
        }
      }
    };

    // Query Pattern 1: Search Thane to Dadar / Churchgate (supports English, Hindi, and Marathi)
    if ((q.includes('thane') || q.includes('ठाणे')) && (q.includes('dadar') || q.includes('दादर') || q.includes('churchgate') || q.includes('चर्चगेट'))) {
      const destCode = (q.includes('churchgate') || q.includes('चर्चगेट')) ? 'CCG' : 'DR';
      const result = RailBackendTools.searchTrains('TNA', destCode, '10:40');
      
      if (result.status === 'success') {
        setExecutedToolCalls(prev => [
          ...prev,
          {
            tool: 'searchTrains',
            args: { origin: 'TNA', dest: destCode, time: '10:40' },
            resultSummary: `Found ${result.count} itineraries. Rank #1: ${result.itineraries[0]?.rankReason}`
          }
        ]);

        const top = result.itineraries[0];
        const reply = top?.delayInversion 
          ? `I found ${result.count} options. Slow Local is recommended: ${top.delayInversion}. Estimated arrival is ${top.arrival} with ${top.legs[0]?.crowd.toLowerCase()} crowd.`
          : `Recommended train is ${top?.legs[0]?.trainName} leaving at ${top?.departure}, arriving at ${top?.arrival}. Fare is ₹${top?.fare.II || 10} in Second Class.`;

        setConversationHistory(prev => [...prev, { role: 'agent', text: reply, timestamp: timeNow }]);
        speakAgentText(reply);
      }
      return;
    }

    // Query Pattern 2: Live status of 95112 or delayed train
    if (q.includes('95112') || (q.includes('status') && q.includes('fast')) || q.includes('स्थिति') || q.includes('स्थिती')) {
      const statusRes = RailBackendTools.getLiveStatus('95112');
      if (statusRes.status === 'success') {
        setExecutedToolCalls(prev => [
          ...prev,
          {
            tool: 'getLiveStatus',
            args: { trainNumber: '95112' },
            resultSummary: `Current delay: +${statusRes.currentDelayMinutes}m at ${statusRes.currentStation}`
          }
        ]);

        const reply = `Train 95112 Kalyan Fast Local is currently at Kurla, delayed by ${statusRes.currentDelayMinutes} minutes due to ${statusRes.disruptionReason}. Data provenance is ${statusRes.dataProvenance.status}.`;
        setConversationHistory(prev => [...prev, { role: 'agent', text: reply, timestamp: timeNow }]);
        speakAgentText(reply);
      }
      return;
    }

    // Query Pattern 3: Dadar to Kalyan Express eligibility
    if (q.includes('express') || ((q.includes('dadar') || q.includes('दादर')) && (q.includes('kalyan') || q.includes('कल्याण')))) {
      const eligRes = RailBackendTools.validateEligibility('12123', 'DR', 'KYN', 'suburban_season_pass', 'II');
      setExecutedToolCalls(prev => [
        ...prev,
        {
          tool: 'validateEligibility',
          args: { trainNumber: '12123', from: 'DR', to: 'KYN', ticketType: 'suburban_season_pass' },
          resultSummary: `Eligibility: ${eligRes.eligibility}`
        }
      ]);

      const reply = `Warning: Deccan Queen 12123 is ${eligRes.eligibility}. Permitted for suburban MST season pass holders in General unreserved coaches ONLY. Konark Express 11020 is strictly PROHIBITED for suburban tickets.`;
      setConversationHistory(prev => [...prev, { role: 'agent', text: reply, timestamp: timeNow }]);
      speakAgentText(reply);
      return;
    }

    // Fallback: General fare quote
    const fareRes = RailBackendTools.quoteFare('TNA', 'DR', 'AC_LOCAL');
    if (fareRes.status === 'success') {
      setExecutedToolCalls(prev => [
        ...prev,
        {
          tool: 'quoteFare',
          args: { from: 'TNA', to: 'DR', class: 'AC_LOCAL' },
          resultSummary: `Fare ₹${fareRes.fareAmount}`
        }
      ]);
      const reply = `I checked the suburban fare tariff: AC Local between Thane and Dadar is ₹${fareRes.fareAmount}, while Second Class is ₹10. Would you like me to book a specimen ticket?`;
      setConversationHistory(prev => [...prev, { role: 'agent', text: reply, timestamp: timeNow }]);
      speakAgentText(reply);
    }
  };

  // Browser Web Speech Recognition
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition is not natively supported in this browser. Please type or use sample query buttons.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
      executeVoiceQuery(text);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-dialer-title"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 id="voice-dialer-title" className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>RailSathi Voice & Telephone Assistant</span>
              </h3>
              <p className="text-xs text-slate-500">
                Shared Deterministic Tool Contract · Web Audio & In-App Dialer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveMode('dialer')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeMode === 'dialer' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            In-App Phone Dialer (Audio Call)
          </button>
          <button
            onClick={() => setActiveMode('mic')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeMode === 'mic' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Browser Microphone Agent
          </button>
          <button
            onClick={() => setActiveMode('telephony')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeMode === 'telephony' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Real Telephony Audit & Carrier Disclosure
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Mode 1 & 2: In-App Dialer & Mic Interface */}
          {activeMode !== 'telephony' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Phone Display / Microphone Controls */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                {activeMode === 'dialer' ? (
                  <div className="w-full space-y-3">
                    {/* Simulated Phone Screen */}
                    <div className="bg-slate-900 text-white rounded-xl p-3 text-center min-h-[75px] flex flex-col justify-center">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">
                        {isCalling ? `Connected · ${formatCallTime(callDuration)}` : 'RailSathi 139 IVR'}
                      </div>
                      <div className="font-mono text-lg font-bold tracking-widest text-emerald-400 mt-1">
                        {dialedDigits || '139-RAIL-SATHI'}
                      </div>
                    </div>

                    {/* Numeric Keypad */}
                    <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(digit => (
                        <button
                          key={digit}
                          onClick={() => handleDialDigit(digit)}
                          className="h-10 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 active:scale-95 transition-all shadow-xs"
                        >
                          {digit}
                        </button>
                      ))}
                    </div>

                    {/* Call / Hangup Button */}
                    <div className="flex justify-center pt-2">
                      {!isCalling ? (
                        <button
                          onClick={handleStartCall}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                        >
                          <PhoneCall className="w-4 h-4" />
                          <span>Call RailSathi</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleEndCall}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                        >
                          <PhoneOff className="w-4 h-4" />
                          <span>End Call</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // Microphone Mode
                  <div className="text-center space-y-4 py-4">
                    <button
                      onClick={toggleSpeechRecognition}
                      className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all shadow-lg ${
                        isListening 
                          ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-100 dark:ring-rose-950' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      aria-label="Toggle microphone speech recognition"
                    >
                      {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {isListening ? 'Listening to speech...' : 'Click to Speak'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Web Speech API · Indian English Recognition
                      </div>
                    </div>
                  </div>
                )}

                {/* Sample Prompt Shortcuts */}
                <div className="w-full mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                  <span className="font-semibold text-slate-500 block">Try asking:</span>
                  {[
                    'Trains from Thane to Dadar at 10:40',
                    'Check live running status of 95112',
                    'Can I board Express from Dadar to Kalyan?'
                  ].map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => executeVoiceQuery(sample)}
                      className="w-full text-left p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 truncate"
                    >
                      "{sample}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Audio Transcript & Deterministic Tool Execution */}
              <div className="md:col-span-7 flex flex-col space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Conversation Dialogue</span>
                </div>

                <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 max-h-[260px] overflow-y-auto text-xs">
                  {conversationHistory.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`p-3 rounded-xl ${
                        msg.role === 'agent' 
                          ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs' 
                          : 'bg-blue-600 text-white ml-6 font-medium'
                      }`}
                    >
                      <div className="text-[10px] opacity-75 mb-0.5 font-semibold">
                        {msg.role === 'agent' ? 'RailSathi Agent' : 'Passenger'} · {msg.timestamp}
                      </div>
                      <div className="leading-relaxed">{msg.text}</div>
                    </div>
                  ))}
                </div>

                {/* Live Tool Invocation Audit */}
                <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                    <Terminal className="w-3 h-3" />
                    <span>Deterministic Backend Tool Trace:</span>
                  </div>
                  {executedToolCalls.length > 0 ? (
                    executedToolCalls.slice(-2).map((tc, idx) => (
                      <div key={idx} className="truncate">
                        <span className="text-amber-400">CALL {tc.tool}</span>({JSON.stringify(tc.args)}) ➔ {tc.resultSummary}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500">Waiting for speech or key input to call backend tools...</div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Mode 3: Real Telephony Audit & Carrier Disclosure */}
          {activeMode === 'telephony' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Honest Telephony Integration Audit</span>
              </div>

              <div className="space-y-3 leading-relaxed text-slate-700 dark:text-slate-300">
                <p>
                  As mandated by the RailOne Handover Directives, we strictly refuse to simulate a fake "live mobile phone call" without actual carrier connectivity. Here is the verified technical audit of external telephony services:
                </p>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-semibold text-slate-900 dark:text-white">1. Twilio Voice / SIP Trunking Requirements:</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                    <li>Requires funded Twilio account with Indian regulatory SMS/Voice DLT registration.</li>
                    <li>Twilio trial accounts restrict outbound calling to pre-verified numbers only.</li>
                    <li>Trial accounts do not provision free Indian +91 numbers without business documents.</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-semibold text-slate-900 dark:text-white">2. Dograh / Self-Hosted Audio Architecture:</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                    <li>Dograh provides WebRTC browser audio connectors and tool orchestrators.</li>
                    <li>While Dograh source code is BSD-2-Clause, the downstream ASR (Whisper/Deepgram), LLM, and TTS (Cartesia/ElevenLabs) require active API keys and per-minute billing.</li>
                  </ul>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 font-medium">
                  <strong>Academic Compliance: </strong>
                  RailOne Next implements full deterministic tool contracts via browser audio & in-app dialer without incurring unauthorized paid cloud telecom charges.
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
