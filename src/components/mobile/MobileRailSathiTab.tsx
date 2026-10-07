import React, { useState, useEffect, useRef } from 'react';
import { RailBackendTools } from '../../engine/voiceTools';
import { STATIONS } from '../../fixtures/railwayData';
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

  // Helper: Extract origin and destination stations flexibly from query text
  const extractStationPair = (text: string): { from: string; to: string } => {
    const q = text.toLowerCase();

    // 1. Regex patterns: "from X to Y", "X to Y", "X se Y", "X te Y", "X -> Y"
    const regex = /(?:from\s+)?([a-z\u0900-\u097f\s\.\(\)]+?)\s+(?:to|se|te|->|tak|and)\s+([a-z\u0900-\u097f\s\.\(\)]+)/i;
    const match = q.match(regex);
    if (match) {
      const s1 = RailBackendTools.normalizeStation(match[1].trim());
      const s2 = RailBackendTools.normalizeStation(match[2].trim());
      if (s1.matchedStation && s2.matchedStation) {
        return { from: s1.matchedStation.code, to: s2.matchedStation.code };
      }
    }

    // 2. Scan all known stations in STATIONS to find station mentions
    const stationEntries = Object.values(STATIONS);
    const found: Array<{ code: string; index: number }> = [];

    for (const st of stationEntries) {
      const nameLower = st.name.toLowerCase();
      const codeLower = st.code.toLowerCase();
      const idxName = q.indexOf(nameLower);
      const idxCode = q.indexOf(codeLower);
      let bestIdx = -1;
      if (idxName !== -1 && idxCode !== -1) bestIdx = Math.min(idxName, idxCode);
      else if (idxName !== -1) bestIdx = idxName;
      else if (idxCode !== -1) bestIdx = idxCode;

      if (bestIdx !== -1) {
        if (!found.some(f => f.code === st.code)) {
          found.push({ code: st.code, index: bestIdx });
        }
      }
    }

    if (found.length >= 2) {
      found.sort((a, b) => a.index - b.index);
      return { from: found[0].code, to: found[1].code };
    } else if (found.length === 1) {
      return { from: found[0].code, to: 'CSMT' };
    }

    // Default fallback
    return { from: 'TNA', to: 'CSMT' };
  };

  // Process User Turn (Voice or Chat) - Wires all 15 deterministic tools
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
      let replyText = '';
      let isConfirm = false;
      let draftIdCreated: string | undefined;
      const toolCalls: Array<{ name: string; output: any }> = [];
      let ticketIssued: SpecimenTicket | undefined;

      // 1. Tool: confirmBooking
      if (activeDraftId && (q.includes('yes') || q.includes('confirm') || q.includes('book') || q.includes('हाँ') || q.includes('हो') || q.includes('proceed') || q.includes('kar do'))) {
        const bookRes = RailBackendTools.confirmBooking(activeDraftId);
        setActiveDraftId(null);
        toolCalls.push({ name: 'confirmBooking', output: bookRes });

        if (bookRes.status === 'success' && bookRes.ticket) {
          replyText = `Booking confirmed! Specimen Ticket ID ${bookRes.ticket.id} has been issued and saved to your wallet. Fare: ₹${bookRes.ticket.farePaid}.`;
          ticketIssued = bookRes.ticket;
        } else {
          replyText = `Failed to confirm booking: ${bookRes.error || 'Unknown error'}`;
        }
      }
      // 2. Tool: cancelTicket
      else if (q.includes('cancel') && (q.includes('ticket') || /\b(tkt|dft)[\w-]+\b/i.test(q))) {
        const ticketIdMatch = q.match(/\b(tkt-[\w-]+)\b/i);
        const ticketId = ticketIdMatch ? ticketIdMatch[1].toUpperCase() : (RailBackendTools.listTickets().tickets[0]?.id || 'TKT-DEMO-001');
        const cancelRes = RailBackendTools.cancelTicket(ticketId);
        toolCalls.push({ name: 'cancelTicket', output: cancelRes });

        if (cancelRes.status === 'success') {
          replyText = `Ticket ${ticketId} cancelled. Gross Fare: ₹${cancelRes.refundBreakdown?.totalPaid || 0}, Cancellation Fee: ₹${cancelRes.refundBreakdown?.clericalDeduction || 0}, Net Refund Credited: ₹${cancelRes.refundBreakdown?.walletRefund || cancelRes.refundBreakdown?.cashRefund || cancelRes.refundAmount || 0}.`;
        } else {
          replyText = `Could not cancel ticket ${ticketId}: ${cancelRes.message || 'Ticket not found or already cancelled'}.`;
        }
      }
      // 3. Tool: getRefundStatus
      else if (q.includes('refund')) {
        const ticketIdMatch = q.match(/\b(tkt-[\w-]+)\b/i);
        const ticketId = ticketIdMatch ? ticketIdMatch[1].toUpperCase() : (RailBackendTools.listTickets().tickets[0]?.id || 'TKT-DEMO-001');
        const refundRes = RailBackendTools.getRefundStatus(ticketId);
        toolCalls.push({ name: 'getRefundStatus', output: refundRes });

        if (refundRes.status === 'success') {
          replyText = `Refund status for ${ticketId}: Booking state is ${refundRes.bookingStatus}. ${refundRes.refundDetails ? `Net refund of ₹${refundRes.refundDetails.walletRefund || refundRes.refundDetails.cashRefund} processed.` : `Fare was ₹${refundRes.fare}.`}`;
        } else {
          replyText = `Could not retrieve refund status: ${refundRes.message || 'Ticket not found'}.`;
        }
      }
      // 4. Tool: listTickets
      else if (q.includes('my ticket') || q.includes('my bookings') || q.includes('show ticket') || q.includes('list ticket') || q.includes('wallet') || q.includes('tickets')) {
        const listRes = RailBackendTools.listTickets();
        toolCalls.push({ name: 'listTickets', output: listRes });

        if (listRes.count === 0) {
          replyText = `You have no active or saved tickets in your wallet.`;
        } else {
          replyText = `You have ${listRes.count} saved ticket(s): ` + listRes.tickets.slice(0, 3).map(t => `${t.id}: ${t.fromStation.name} ➔ ${t.toStation.name} (₹${t.farePaid}, ${t.classBooked})`).join('; ');
        }
      }
      // 5. Tool: getCoachGuidance (Wagenstandsanzeiger)
      else if (q.includes('coach') || q.includes('rake') || q.includes('ladies') || q.includes('divyangjan') || q.includes('handicap') || q.includes('compartment') || q.includes('platform position')) {
        const trainMatch = q.match(/\b\d{5}\b/);
        const trainNum = trainMatch ? trainMatch[0] : '95112';
        const stnMatch = q.includes('dadar') ? 'DR' : q.includes('thane') ? 'TNA' : q.includes('andheri') ? 'ADH' : 'DR';
        const coachRes = RailBackendTools.getCoachGuidance(trainNum, stnMatch, '3');
        toolCalls.push({ name: 'getCoachGuidance', output: coachRes });

        replyText = `Coach Guidance for ${coachRes.trainName} (${coachRes.rakeType}) at ${coachRes.stationCode} Platform ${coachRes.platform}: Ladies coaches at positions ${coachRes.ladiesCoaches.map(c => c.coachIndex).join(', ')}. Wheelchair accessible Divyangjan coach at position ${coachRes.handicapCoach.coachIndex}. Nearest bridge: ${coachRes.fobStairAlignment.nearestBridge} (Coach ${coachRes.fobStairAlignment.nearestCoachIndex}).`;
      }
      // 6. Tool: getDisruptionAlternatives
      else if (q.includes('disrupt') || q.includes('alternative') || (q.includes('delay') && (q.includes('alternative') || q.includes('option') || q.includes('what should')))) {
        const trainMatch = q.match(/\b\d{5}\b/);
        const trainNum = trainMatch ? trainMatch[0] : '95112';
        const disruptRes = RailBackendTools.getDisruptionAlternatives(trainNum, 'CLA');
        toolCalls.push({ name: 'getDisruptionAlternatives', output: disruptRes });

        replyText = `Disruption Status for ${disruptRes.trainNumber}: ${disruptRes.recommendedAction} (Delay: +${disruptRes.delayMinutes} min, ${disruptRes.disruptionReason}). Found ${disruptRes.alternativesCount} downstream alternatives.`;
      }
      // 7. Tool: getLiveStatus / getTrainStatus
      else if (/\b\d{5}\b/.test(q) || ((q.includes('status') || q.includes('where is') || q.includes('track') || q.includes('delay') || q.includes('running')) && q.includes('train'))) {
        const trainMatch = q.match(/\b\d{5}\b/);
        const trainNum = trainMatch ? trainMatch[0] : '95112';
        const statusRes = RailBackendTools.getLiveStatus(trainNum);
        toolCalls.push({ name: 'getLiveStatus', output: statusRes });

        if (statusRes.status === 'success') {
          replyText = `Train ${statusRes.trainNumber} (${statusRes.trainName}) is currently at ${statusRes.currentStation}. Delay: +${statusRes.currentDelayMinutes} min. Status: ${statusRes.disruptionReason}. Provenance: [${statusRes.dataProvenance.status}] ${statusRes.dataProvenance.source}.`;
        } else {
          replyText = `Could not track train ${trainNum}: ${statusRes.message}`;
        }
      }
      // 8. Tool: findNearbyStations
      else if (q.includes('nearby') || q.includes('stations in') || q.includes('stations near')) {
        let city = 'Mumbai';
        if (q.includes('pune')) city = 'Pune';
        else if (q.includes('delhi')) city = 'Delhi NCR';
        else if (q.includes('bangalore') || q.includes('bengaluru')) city = 'Bengaluru';
        else if (q.includes('kolkata')) city = 'Kolkata';
        else if (q.includes('chennai')) city = 'Chennai';
        else if (q.includes('hyderabad')) city = 'Hyderabad';
        else if (q.includes('kochi')) city = 'Kochi';

        const nearbyRes = RailBackendTools.findNearbyStations(undefined, undefined, city);
        toolCalls.push({ name: 'findNearbyStations', output: nearbyRes });

        replyText = `Key stations in ${nearbyRes.city}: ` + nearbyRes.stations.map(s => `${s.name} (${s.code})`).join(', ');
      }
      // 9. Tool: normalizeStation
      else if ((q.includes('station code') || q.includes('valid station') || q.includes('station info') || q.includes('code for')) && !q.includes(' to ')) {
        const cleanQuery = q.replace(/(what is the|station code|for|is|valid station|station info|find station)/gi, '').trim();
        const normRes = RailBackendTools.normalizeStation(cleanQuery || 'Dadar');
        toolCalls.push({ name: 'normalizeStation', output: normRes });

        if (normRes.matchedStation) {
          replyText = `Station ${normRes.matchedStation.name} (${normRes.matchedStation.code}) is on the ${normRes.matchedStation.line} line.`;
        } else {
          replyText = `Station not recognized: ${normRes.explanation}. Candidates: ${normRes.candidates.map(c => c.name).join(', ')}`;
        }
      }
      // 10. Tool: validateEligibility
      else if (q.includes('eligible') || q.includes('eligibility') || q.includes('allowed') || q.includes('pass valid')) {
        const trainMatch = q.match(/\b\d{5}\b/);
        const trainNum = trainMatch ? trainMatch[0] : '95112';
        const pair = extractStationPair(q);
        const isSeason = q.includes('season') || q.includes('pass');
        const userClass = q.includes('ac') ? 'AC_LOCAL' : q.includes('first') ? 'I' : 'II';
        const eligRes = RailBackendTools.validateEligibility(trainNum, pair.from, pair.to, isSeason ? 'suburban_season_pass' : 'suburban_single', userClass);
        toolCalls.push({ name: 'validateEligibility', output: eligRes });

        replyText = `Boarding Eligibility for ${pair.from} ➔ ${pair.to} (${userClass}): [${eligRes.eligibility}]. ${eligRes.summary} ${eligRes.ticketRequiredNote || ''}`;
      }
      // 11. Tool: compareItineraries
      else if (q.includes('compare')) {
        const pair = extractStationPair(q);
        const compRes = RailBackendTools.compareItineraries(pair.from, pair.to);
        toolCalls.push({ name: 'compareItineraries', output: compRes });

        if (compRes.status === 'success' && compRes.options.length > 0) {
          replyText = `Comparing routes between ${pair.from} and ${pair.to}: Found ${compRes.options.length} options. Fastest departs ${compRes.options[0]?.departure} (duration ${compRes.options[0]?.durationMinutes}m).`;
        } else {
          replyText = `No comparable routes found between ${pair.from} and ${pair.to}.`;
        }
      }
      // 12. Tool: quoteFare
      else if ((q.includes('fare') || q.includes('how much') || q.includes('ticket price') || q.includes('cost')) && !q.includes('book')) {
        const pair = extractStationPair(q);
        const userClass: TravelClass = q.includes('ac') ? 'AC_LOCAL' : q.includes('first') || q.includes('1st') ? 'I' : 'II';
        const fareRes = RailBackendTools.quoteFare(pair.from, pair.to, userClass);
        toolCalls.push({ name: 'quoteFare', output: fareRes });

        if (fareRes.status === 'success') {
          replyText = `Suburban Fare from ${fareRes.from} to ${fareRes.to} (${fareRes.distanceKm} km, Class: ${fareRes.class}) is ₹${fareRes.fareAmount}. [${fareRes.disclaimer}]`;
        } else {
          replyText = `Could not calculate fare: ${fareRes.message}`;
        }
      }
      // 13. Tools: searchTrains, planJourneys, createBookingDraft (Default Journey / Booking Query)
      else {
        const pair = extractStationPair(q);
        const classPref: TravelClass = q.includes('ac') ? 'AC_LOCAL' : q.includes('first') || q.includes('1st') ? 'I' : 'II';
        const searchRes = RailBackendTools.searchTrains(pair.from, pair.to, '10:35', classPref === 'AC_LOCAL' ? 'ac_mandatory' : 'any');
        const fareRes = RailBackendTools.quoteFare(pair.from, pair.to, classPref);
        toolCalls.push({ name: 'searchTrains', output: searchRes });
        toolCalls.push({ name: 'quoteFare', output: fareRes });

        if (searchRes.status === 'success' && searchRes.itineraries.length > 0) {
          const top = searchRes.itineraries[0];
          const fareAmt = fareRes.status === 'success' ? fareRes.fareAmount : (top.fare[classPref] || 10);

          if (q.includes('book') || q.includes('buy') || q.includes('टिकट')) {
            const draftRes = RailBackendTools.createBookingDraft({
              trainNumber: top.legs[0]?.trainNumber || '95112',
              fromCode: pair.from,
              toCode: pair.to,
              classCode: classPref,
              passengers: [{ name: 'Primary Commuter', age: 28, gender: 'M' }]
            });
            toolCalls.push({ name: 'createBookingDraft', output: draftRes });

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
          replyText = `No direct services found between ${pair.from} and ${pair.to} at this time. Would you like me to check transfer options via Dadar?`;
        }
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
          toolCalls,
          isConfirmationPrompt: isConfirm,
          draftId: draftIdCreated,
          ticketIssued
        }
      ]);
    }, 700);
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
