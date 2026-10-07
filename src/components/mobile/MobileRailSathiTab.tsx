import React, { useState, useEffect, useRef } from 'react';
import { RailBackendTools } from '../../engine/voiceTools';
import { SpecimenTicket, JourneyItinerary, TravelClass } from '../../types/railway';
import { 
  Mic, 
  MicOff, 
  PhoneCall, 
  PhoneOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  Ticket, 
  AlertTriangle,
  RotateCcw,
  Zap,
  CornerDownRight
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  toolCalls?: Array<{ name: string; output: any }>;
  isConfirmationPrompt?: boolean;
  draftId?: string;
  ticketIssued?: SpecimenTicket;
}

interface MobileRailSathiTabProps {
  onViewTicketWallet: () => void;
  onBookSpecimen: (itinerary: JourneyItinerary, travelClass: TravelClass) => void;
}

export const MobileRailSathiTab: React.FC<MobileRailSathiTabProps> = ({
  onViewTicketWallet,
  onBookSpecimen
}) => {
  const [mode, setMode] = useState<'call' | 'chat'>('call');
  
  // Call mode state
  const [callState, setCallState] = useState<'IDLE' | 'CALLING' | 'CONNECTED' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ENDED'>('IDLE');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callTranscript, setCallTranscript] = useState<string>("Namaste! I am RailSathi. I can find trains, compare fares, check delays, and book specimen tickets. Say where you want to travel!");
  
  // Chat mode state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: "Namaste! I am RailSathi, your grounded railway passenger assistant. How can I assist your Mumbai or national journey today?",
      timestamp: '10:35 AM'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  // Call timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callState === 'CONNECTED' || callState === 'LISTENING' || callState === 'SPEAKING' || callState === 'THINKING') {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start Voice Call
  const handleStartCall = () => {
    setCallState('CALLING');
    setCallDuration(0);
    setTimeout(() => {
      setCallState('CONNECTED');
      setTimeout(() => setCallState('LISTENING'), 1000);
    }, 1500);
  };

  const handleEndCall = () => {
    setCallState('ENDED');
    setTimeout(() => setCallState('IDLE'), 2000);
  };

  // Process User Turn (Voice or Chat)
  const processPassengerQuery = async (queryText: string) => {
    const q = queryText.toLowerCase().trim();
    if (!q) return;

    // Append user message
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: now
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsProcessing(true);
    setCallState('THINKING');

    setTimeout(() => {
      // 1. Check for Confirmation
      if (activeDraftId && (q.includes('yes') || q.includes('confirm') || q.includes('book') || q.includes('हाँ') || q.includes('हो'))) {
        const bookRes = RailBackendTools.confirmBooking(activeDraftId);
        setActiveDraftId(null);
        setIsProcessing(false);
        setCallState('SPEAKING');

        const botReply = bookRes.status === 'success' && bookRes.ticket
          ? `Booking confirmed! Specimen Ticket ID ${bookRes.ticket.id} has been issued and saved to your wallet. Fare: ₹${bookRes.ticket.farePaid}.`
          : `Failed to confirm booking: ${bookRes.error || 'Unknown error'}`;

        setCallTranscript(botReply);
        setChatMessages(prev => [
          ...prev,
          {
            id: 'msg-' + Date.now(),
            sender: 'assistant',
            text: botReply,
            timestamp: now,
            toolCalls: [{ name: 'confirmBooking', output: bookRes }],
            ticketIssued: bookRes.ticket
          }
        ]);
        return;
      }

      // 2. Journey search and booking request (e.g. "Dadar to Thane", "Andheri to CSMT")
      let fromStation = 'TNA';
      let toStation = 'CSMT';
      let classPref: TravelClass = 'II';

      if (q.includes('dadar') && q.includes('thane')) {
        fromStation = 'DR';
        toStation = 'TNA';
      } else if (q.includes('thane') && q.includes('churchgate')) {
        fromStation = 'TNA';
        toStation = 'CCG';
      } else if (q.includes('andheri') && q.includes('csmt')) {
        fromStation = 'ADH';
        toStation = 'CSMT';
      } else if (q.includes('andheri') && q.includes('dadar')) {
        fromStation = 'ADH';
        toStation = 'DR';
      } else if (q.includes('kalyan') && q.includes('csmt')) {
        fromStation = 'KYN';
        toStation = 'CSMT';
      }

      if (q.includes('ac')) classPref = 'AC_LOCAL';
      else if (q.includes('first') || q.includes('1st')) classPref = 'I';

      // Execute searchTrains tool
      const searchRes = RailBackendTools.searchTrains(fromStation, toStation, '10:35', classPref === 'AC_LOCAL' ? 'ac_mandatory' : 'any');
      
      // Execute quoteFare tool
      const fareRes = RailBackendTools.quoteFare(fromStation, toStation, classPref);

      let replyText = '';
      let isConfirm = false;
      let draftIdCreated: string | undefined;

      if (searchRes.status === 'success' && searchRes.itineraries.length > 0) {
        const top = searchRes.itineraries[0];
        const fareAmt = fareRes.status === 'success' ? fareRes.fareAmount : (top.fare[classPref] || 10);

        if (q.includes('book') || q.includes('buy') || q.includes('टिकट')) {
          // Create draft order and demand confirmation
          const draftRes = RailBackendTools.createBookingDraft({
            trainNumber: top.legs[0]?.trainNumber || '95112',
            fromCode: fromStation,
            toCode: toStation,
            classCode: classPref,
            passengers: [{ name: 'Primary Commuter', age: 28, gender: 'M' }]
          });

          if (draftRes.status === 'success' && draftRes.draft) {
            draftIdCreated = draftRes.draft.draftId;
            setActiveDraftId(draftRes.draft.draftId);
            isConfirm = true;
            replyText = `Found ${top.legs[0]?.trainName || 'Local'} departing ${top.departure} (arrival ${top.arrival}). ${classPref === 'AC_LOCAL' ? 'AC Local' : classPref} fare is ₹${fareAmt}. Would you like me to confirm and book this ticket for you?`;
          } else {
            replyText = `Found train departing ${top.departure}, fare is ₹${fareAmt}.`;
          }
        } else {
          replyText = `Next service from ${searchRes.origin} to ${searchRes.destination} departs at ${top.departure} (arrives ${top.arrival}). Travel time: ${top.durationMinutes}m. ${classPref} fare is ₹${fareAmt}.`;
        }
      } else {
        replyText = `No direct services found between ${fromStation} and ${toStation} at this time. Would you like me to check transfer options via Dadar?`;
      }

      setIsProcessing(false);
      setCallState('SPEAKING');
      setCallTranscript(replyText);

      setChatMessages(prev => [
        ...prev,
        {
          id: 'msg-' + Date.now(),
          sender: 'assistant',
          text: replyText,
          timestamp: now,
          toolCalls: [
            { name: 'searchTrains', output: searchRes },
            { name: 'quoteFare', output: fareRes }
          ],
          isConfirmationPrompt: isConfirm,
          draftId: draftIdCreated
        }
      ]);
    }, 900);
  };

  return (
    <div className="space-y-3 pb-20 px-3.5 pt-2 flex flex-col h-full min-h-[76vh]">
      
      {/* Mode Selector Header */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold shrink-0">
        <button
          onClick={() => setMode('call')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mode === 'call'
              ? 'bg-white dark:bg-slate-800 text-theme-primary shadow-xs'
              : 'text-slate-500'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Voice Calling Screen</span>
        </button>
        <button
          onClick={() => setMode('chat')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mode === 'chat'
              ? 'bg-white dark:bg-slate-800 text-theme-primary shadow-xs'
              : 'text-slate-500'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Interactive Chat</span>
        </button>
      </div>

      {/* MODE 1: Voice Calling Screen (Authentic Telephony UX) */}
      {mode === 'call' && (
        <div className="flex-1 rounded-3xl bg-linear-to-b from-slate-900 via-indigo-950 to-slate-950 text-white p-5 border border-indigo-900/60 shadow-2xl flex flex-col justify-between items-center text-center animate-fadeIn relative overflow-hidden">
          
          {/* Ambient Audio Pulse Background Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

          {/* Top Call Status Bar */}
          <div className="z-10 w-full flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[10px] tracking-wider uppercase text-cyan-400">Dograh / WebRTC Ingress</span>
            <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded-full text-[11px]">
              {callState === 'CONNECTED' || callState === 'LISTENING' || callState === 'SPEAKING' || callState === 'THINKING'
                ? formatTimer(callDuration)
                : callState}
            </span>
          </div>

          {/* Central Avatar & Audio Waveform Stage */}
          <div className="z-10 my-auto flex flex-col items-center space-y-4">
            <div className="relative">
              {/* Outer Pulsing Rings during Active Call */}
              {(callState === 'LISTENING' || callState === 'SPEAKING') && (
                <div className="absolute -inset-3 rounded-full bg-theme-primary/30 animate-ping pointer-events-none" />
              )}
              
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-600 via-indigo-600 to-blue-800 flex items-center justify-center shadow-[0_0_35px_rgba(37,99,235,0.6)] border-2 border-white/20">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>

            <div>
              <div className="text-lg font-black text-white">RailSathi Voice</div>
              <div className="text-[11px] text-cyan-300 font-mono mt-0.5">
                {callState === 'IDLE' && 'Ready to Call · Hindi / English / Marathi'}
                {callState === 'CALLING' && 'Dialing Assistant...'}
                {callState === 'CONNECTED' && 'Connected'}
                {callState === 'LISTENING' && 'Listening to commuter...'}
                {callState === 'THINKING' && 'Invoking railway verification tools...'}
                {callState === 'SPEAKING' && 'RailSathi speaking...'}
                {callState === 'ENDED' && 'Call Terminated'}
              </div>
            </div>

            {/* Simulated Animated Audio Waveform */}
            <div className="flex items-center gap-1.5 h-8">
              {[8, 16, 24, 32, 20, 28, 12, 24, 30, 16, 8].map((h, i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded-full transition-all duration-200 ${
                    callState === 'SPEAKING' || callState === 'LISTENING'
                      ? 'bg-cyan-400 animate-pulse'
                      : 'bg-slate-700'
                  }`}
                  style={{
                    height: (callState === 'SPEAKING' || callState === 'LISTENING') ? `${h}px` : '4px',
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>

            {/* Live Call Transcript Bubble */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 max-w-xs text-xs text-slate-200 leading-relaxed shadow-lg">
              "{callTranscript}"
            </div>
          </div>

          {/* Quick Voice Prompt Shortcuts */}
          {callState !== 'IDLE' && callState !== 'ENDED' && (
            <div className="z-10 w-full flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar text-[10px]">
              {[
                "Dadar to Thane AC local",
                "Andheri to CSMT fare",
                "Yes, confirm booking",
                "Check 95112 delay"
              ].map((sample, i) => (
                <button
                  key={i}
                  onClick={() => processPassengerQuery(sample)}
                  className="px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white whitespace-nowrap border border-white/15 active:scale-95"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          )}

          {/* Bottom Call Hardware Controls */}
          <div className="z-10 w-full pt-2 flex items-center justify-around">
            {callState === 'IDLE' || callState === 'ENDED' ? (
              <button
                onClick={handleStartCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                title="Start Voice Call"
              >
                <PhoneCall className="w-7 h-7" />
              </button>
            ) : (
              <>
                {/* Mute Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isMuted ? 'bg-rose-500/30 text-rose-300 border border-rose-500' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title={isMuted ? "Unmute Mic" : "Mute Mic"}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* End Call Button */}
                <button
                  onClick={handleEndCall}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-all active:scale-95"
                  title="End Voice Call"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>

                {/* Speaker Button */}
                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isSpeakerOn ? 'bg-white/20 text-cyan-300' : 'bg-white/10 text-slate-400'
                  }`}
                  title={isSpeakerOn ? "Speaker Active" : "Speaker Off"}
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>

        </div>
      )}

      {/* MODE 2: Interactive Chat Screen */}
      {mode === 'chat' && (
        <div className="flex-1 flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fadeIn">
          
          {/* Chat Messages Log */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
            {chatMessages.map(msg => (
              <div 
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-theme-primary text-white rounded-tr-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                }`}>
                  <p>{msg.text}</p>

                  {/* Tool Invocations Badge if any */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-1 flex-wrap">
                      {msg.toolCalls.map((t, idx) => (
                        <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-blue-500/10 text-theme-primary border border-blue-500/20 font-bold">
                          [TOOL: {t.name}]
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Affirmative Confirmation Action Button */}
                  {msg.isConfirmationPrompt && msg.draftId && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                      <button
                        onClick={() => processPassengerQuery('Yes, please confirm and book it')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Yes, Confirm Booking</span>
                      </button>
                      <button
                        onClick={() => processPassengerQuery('Cancel')}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Issued Ticket Card embedded in chat */}
                  {msg.ticketIssued && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] space-y-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>Ticket Issued: {msg.ticketIssued.id}</span>
                        <span className="font-mono">₹{msg.ticketIssued.farePaid}</span>
                      </div>
                      <div>{msg.ticketIssued.fromStation.name} ➔ {msg.ticketIssued.toStation.name}</div>
                      <button
                        onClick={onViewTicketWallet}
                        className="text-theme-primary font-bold underline mt-1 block"
                      >
                        View in Ticket Wallet ➔
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-slate-400 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-theme-primary animate-spin" />
                <span>RailSathi verifying railway schedules...</span>
              </div>
            )}
          </div>

          {/* Quick Chat Suggestions */}
          <div className="p-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px]">
            {[
              "Find AC local Dadar to Thane",
              "Book second class Thane to CSMT",
              "Check delay for 95112",
              "Quote fare Churchgate to Borivali"
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => processPassengerQuery(q)}
                className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap border border-slate-200 dark:border-slate-700 hover:border-theme-primary active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              processPassengerQuery(chatInput);
            }}
            className="p-2.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask RailSathi (e.g. Next train to Dadar...)"
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-theme-primary"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isProcessing}
              className="p-2 rounded-xl bg-theme-primary hover:bg-blue-600 text-white disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
