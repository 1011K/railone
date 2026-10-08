import React, { useState, useEffect, useRef } from 'react';
import { RailBackendTools } from '../../engine/voiceTools';
import { STATIONS } from '../../fixtures/railwayData';
import { SpecimenTicket, JourneyItinerary, TravelClass } from '../../types/railway';
import { useTheme } from '../ThemeContext';
import { getTranslation, AppLanguage } from '../../i18n/translations';
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
  CheckCircle2, 
  Ticket, 
  Zap,
  ArrowRight
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
  onBookSpecimen?: (itinerary: JourneyItinerary, travelClass: TravelClass) => void;
}

export const MobileRailSathiTab: React.FC<MobileRailSathiTabProps> = ({
  onViewTicketWallet,
  onBookSpecimen
}) => {
  const { language } = useTheme();
  const t = getTranslation(language);

  const [mode, setMode] = useState<'call' | 'chat'>('call');
  
  // Call mode state
  const [callState, setCallState] = useState<'IDLE' | 'CALLING' | 'CONNECTED' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ENDED'>('IDLE');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callTranscript, setCallTranscript] = useState<string>(() => {
    if (language === 'hi') return "नमस्ते! मैं रेल यात्री सहायक हूँ। एक कॉल में टिकट बुक करें, ट्रेन खोजें या लाइव स्थिति जानें।";
    if (language === 'mr') return "नमस्कार! मी रेल यात्री मदतनीस आहे. एका कॉलवर तिकीट बुक करा, गाड्या शोधा किंवा थेट धावसंख्या तपासा.";
    return "Namaste! I am Rail Yatri Assistant. I can book tickets on a single call, find trains, and check live delays. Say where you want to travel!";
  });
  
  // Chat mode state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'm1',
      sender: 'assistant',
      text: language === 'hi' 
        ? "नमस्ते! मैं रेल यात्री सहायक हूँ। एक कॉल या संदेश में तुरंत टिकट बुक करने के लिए स्टेशन बताएं।"
        : language === 'mr'
        ? "नमस्कार! मी रेल यात्री मदतनीस आहे. एका कॉलवर किंवा संदेशावर लगेच तिकीट बुक करण्यासाठी स्थानक सांगा."
        : "Namaste! I am Rail Yatri Assistant. Ask me to book a train on one single call, check delays, or compare suburban routes.",
      timestamp: '10:35 AM'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  // Update initial messages if language changes
  useEffect(() => {
    if (language === 'hi') {
      setCallTranscript("नमस्ते! मैं रेल यात्री सहायक हूँ। एक कॉल में टिकट बुक करें, ट्रेन खोजें या लाइव स्थिति जानें।");
    } else if (language === 'mr') {
      setCallTranscript("नमस्कार! मी रेल यात्री मदतनीस आहे. एका कॉलवर तिकीट बुक करा, गाड्या शोधा किंवा थेट धावसंख्या तपासा.");
    } else {
      setCallTranscript("Namaste! I am Rail Yatri Assistant. I can book tickets on a single call, find trains, and check live delays. Say where you want to travel!");
    }
  }, [language]);

  // Speech synthesis helper
  const speakAgentText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isSpeakerOn) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // SpeechSynthesis error ignored safely
      }
    }
  };

  // Call timer
  useEffect(() => {
    let timer: any;
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
      setTimeout(() => {
        setCallState('LISTENING');
        speakAgentText(callTranscript);
      }, 1000);
    }, 1500);
  };

  const handleEndCall = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallState('ENDED');
    setTimeout(() => setCallState('IDLE'), 2000);
  };

  // Helper: Extract origin and destination stations flexibly from query text in English, Hindi, and Marathi
  const extractStationPair = (text: string): { from: string; to: string } => {
    const q = text.toLowerCase();

    // Map common Devanagari station names to codes
    const devanagariMap: Record<string, string> = {
      'दादर': 'DR',
      'ठाणे': 'TNA',
      'सीएसएमटी': 'CSMT',
      'सीएसटी': 'CSMT',
      'छत्रपती शिवाजी': 'CSMT',
      'अंधेरी': 'ADH',
      'चर्चगेट': 'CCG',
      'बोरीवली': 'BVI',
      'बोरिवली': 'BVI',
      'कल्याण': 'KYN',
      'कुर्ला': 'CLA',
      'घाटकोपर': 'GC',
      'वाशी': 'VSH',
      'पनवेल': 'PNVL',
      'बांद्रा': 'BA',
      'वांद्रे': 'BA'
    };

    const matches: Array<{ code: string; index: number }> = [];

    // 1. Check Devanagari keywords with exact string positions
    for (const [stWord, code] of Object.entries(devanagariMap)) {
      const idx = q.indexOf(stWord);
      if (idx !== -1 && !matches.some(m => m.code === code)) {
        matches.push({ code, index: idx });
      }
    }

    // 2. Check all stations in STATIONS
    for (const st of Object.values(STATIONS)) {
      const nameLower = st.name.toLowerCase();
      const codeLower = st.code.toLowerCase();
      const idxName = q.indexOf(nameLower);
      const idxCode = q.indexOf(codeLower);
      let bestIdx = -1;
      if (idxName !== -1 && idxCode !== -1) bestIdx = Math.min(idxName, idxCode);
      else if (idxName !== -1) bestIdx = idxName;
      else if (idxCode !== -1) bestIdx = idxCode;

      if (bestIdx !== -1 && !matches.some(m => m.code === st.code)) {
        matches.push({ code: st.code, index: bestIdx });
      }
    }

    if (matches.length >= 2) {
      matches.sort((a, b) => a.index - b.index);
      return { from: matches[0].code, to: matches[1].code };
    } else if (matches.length === 1) {
      return { from: matches[0].code, to: matches[0].code === 'DR' ? 'TNA' : 'CSMT' };
    }

    // 3. Fallback to clean regex
    const cleanQ = q.replace(/(?:quote|fare|price|cost|ticket|book|buy|fast|slow|local|किराया|भाडे|तिकीट|टिकट)/gi, ' ');
    const regex = /(?:from\s+)?([a-z\u0900-\u097f\s]+?)\s+(?:to|se|te|->|tak|and)\s+([a-z\u0900-\u097f\s]+)/i;
    const match = cleanQ.match(regex);
    if (match) {
      const s1 = RailBackendTools.normalizeStation(match[1].trim());
      const s2 = RailBackendTools.normalizeStation(match[2].trim());
      if (s1.matchedStation && s2.matchedStation) {
        return { from: s1.matchedStation.code, to: s2.matchedStation.code };
      }
    }

    // Default fallback: Dadar to Thane
    return { from: 'DR', to: 'TNA' };
  };

  // Process User Turn (Voice or Chat) - Wires deterministic tools & One-Call Booking
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

      // Intent A: Confirm active draft booking if pending
      if (activeDraftId && (q.includes('yes') || q.includes('confirm') || q.includes('हाँ') || q.includes('हो') || q.includes('proceed') || q.includes('kar do'))) {
        const bookRes = RailBackendTools.confirmBooking(activeDraftId);
        setActiveDraftId(null);
        toolCalls.push({ name: 'confirmBooking', output: bookRes });

        if (bookRes.status === 'success' && bookRes.ticket) {
          ticketIssued = bookRes.ticket;
          if (language === 'hi') {
            replyText = `बुकिंग कन्फर्म हो गई! टिकट ID ${bookRes.ticket.id} जारी कर दिया गया है। किराया: ₹${bookRes.ticket.farePaid}। टिकट आपके वॉलेट में सहेज लिया गया है।`;
          } else if (language === 'mr') {
            replyText = `बुकिंग निश्चित झाली! तिकीट ID ${bookRes.ticket.id} जारी करण्यात आले आहे. भाडे: ₹${bookRes.ticket.farePaid}. तिकीट आपल्या पाकिटात जतन केले आहे.`;
          } else {
            replyText = `Booking confirmed! Specimen Ticket ID ${bookRes.ticket.id} has been issued and saved to your wallet. Fare: ₹${bookRes.ticket.farePaid}.`;
          }
        } else {
          replyText = `Failed to confirm booking: ${bookRes.error || 'Unknown error'}`;
        }
      }
      // Intent B: ONE-CALL / ONE-PROMPT INSTANT BOOKING
      else if (q.includes('book') || q.includes('buy') || q.includes('टिकट') || q.includes('तिकीट') || q.includes('बुक')) {
        const pair = extractStationPair(q);
        const classPref: TravelClass = q.includes('ac') ? 'AC_LOCAL' : q.includes('first') || q.includes('1st') || q.includes('प्रथम') ? 'I' : 'II';
        const searchRes = RailBackendTools.searchTrains(pair.from, pair.to, '10:35', classPref === 'AC_LOCAL' ? 'ac_mandatory' : 'any');
        const fareRes = RailBackendTools.quoteFare(pair.from, pair.to, classPref);
        toolCalls.push({ name: 'searchTrains', output: searchRes });
        toolCalls.push({ name: 'quoteFare', output: fareRes });

        const trainObj = (searchRes.status === 'success' && searchRes.itineraries?.[0]) ? searchRes.itineraries[0] : null;
        const trainNum = trainObj?.legs?.[0]?.trainNumber || (pair.from === 'DR' && pair.to === 'TNA' ? '95112' : '95101');
        const trainName = trainObj?.legs?.[0]?.trainName || (classPref === 'AC_LOCAL' ? 'AC Fast Local' : 'Fast Local');
        const fareAmt = fareRes.status === 'success' ? fareRes.fareAmount : (classPref === 'AC_LOCAL' ? 65 : 10);

        // 1. Create draft
        const draftRes = RailBackendTools.createBookingDraft({
          trainNumber: trainNum,
          fromCode: pair.from,
          toCode: pair.to,
          classCode: classPref,
          passengers: [{ name: 'Primary Commuter', age: 28, gender: 'M' }]
        });
        toolCalls.push({ name: 'createBookingDraft', output: draftRes });

        if (draftRes.status === 'success' && draftRes.draft) {
          // 2. Immediately confirm booking in ONE STEP
          const confirmRes = RailBackendTools.confirmBooking(draftRes.draft.draftId);
          toolCalls.push({ name: 'confirmBooking', output: confirmRes });

          if (confirmRes.status === 'success' && confirmRes.ticket) {
            ticketIssued = confirmRes.ticket;
            if (language === 'hi') {
              replyText = `टिकट बुक हो गया! ${trainName} (${pair.from} ➔ ${pair.to}), किराया ₹${fareAmt}। आपका टिकट ID ${confirmRes.ticket.id} वॉलेट में सुरक्षित कर दिया गया है।`;
            } else if (language === 'mr') {
              replyText = `तिकीट बुक झाले! ${trainName} (${pair.from} ➔ ${pair.to}), भाडे ₹${fareAmt}. आपले तिकीट ID ${confirmRes.ticket.id} पाकिटात जतन केले आहे.`;
            } else {
              replyText = `Booking confirmed in one call! ${trainName} (${pair.from} ➔ ${pair.to}), Fare: ₹${fareAmt}. Specimen Ticket ID ${confirmRes.ticket.id} has been issued to your wallet.`;
            }
          } else {
            replyText = `Draft created: ID ${draftRes.draft.draftId}. Confirming payment...`;
          }
        } else {
          replyText = `Could not initiate booking: ${draftRes.error || 'Please try again'}.`;
        }
      }
      // Intent C: Cancel Ticket
      else if (q.includes('cancel') || q.includes('रद्द')) {
        const ticketIdMatch = q.match(/\b(tkt-[\w-]+)\b/i);
        const ticketId = ticketIdMatch ? ticketIdMatch[1].toUpperCase() : (RailBackendTools.listTickets().tickets[0]?.id || 'TKT-DEMO-001');
        const cancelRes = RailBackendTools.cancelTicket(ticketId);
        toolCalls.push({ name: 'cancelTicket', output: cancelRes });

        if (cancelRes.status === 'success') {
          replyText = language === 'hi'
            ? `टिकट ${ticketId} रद्द कर दिया गया। रिफंड ₹${cancelRes.refundBreakdown?.walletRefund || cancelRes.refundAmount || 0} वॉलेट में क्रेडिट हो गया।`
            : language === 'mr'
            ? `तिकीट ${ticketId} रद्द केले आहे. परतावा ₹${cancelRes.refundBreakdown?.walletRefund || cancelRes.refundAmount || 0} पाकिटात जमा झाला आहे.`
            : `Ticket ${ticketId} cancelled. Net Refund Credited: ₹${cancelRes.refundBreakdown?.walletRefund || cancelRes.refundAmount || 0}.`;
        } else {
          replyText = `Could not cancel ticket: ${cancelRes.message || 'Ticket not found'}.`;
        }
      }
      // Intent D: List Tickets
      else if (q.includes('my ticket') || q.includes('wallet') || q.includes('टिकट दिखाओ') || q.includes('तिकीट दाखवा')) {
        const listRes = RailBackendTools.listTickets();
        toolCalls.push({ name: 'listTickets', output: listRes });

        if (listRes.count === 0) {
          replyText = language === 'hi' ? 'आपके वॉलेट में कोई सक्रिय टिकट नहीं है।' : language === 'mr' ? 'आपल्या पाकिटात कोणतेही सक्रिय तिकीट नाही.' : 'You have no active saved tickets in your wallet.';
        } else {
          replyText = language === 'hi'
            ? `आपके वॉलेट में ${listRes.count} टिकट हैं: ` + listRes.tickets.slice(0, 2).map(tk => `${tk.id}: ${tk.fromStation.name} ➔ ${tk.toStation.name} (₹${tk.farePaid})`).join('; ')
            : `You have ${listRes.count} saved ticket(s): ` + listRes.tickets.slice(0, 2).map(tk => `${tk.id}: ${tk.fromStation.name} ➔ ${tk.toStation.name} (₹${tk.farePaid})`).join('; ');
        }
      }
      // Intent E: Live Status / Delays
      else if (/\b\d{5}\b/.test(q) || q.includes('delay') || q.includes('status') || q.includes('देरी') || q.includes('उशीर')) {
        const trainMatch = q.match(/\b\d{5}\b/);
        const trainNum = trainMatch ? trainMatch[0] : '95112';
        const statusRes = RailBackendTools.getLiveStatus(trainNum);
        toolCalls.push({ name: 'getLiveStatus', output: statusRes });

        if (statusRes.status === 'success') {
          replyText = language === 'hi'
            ? `ट्रेन ${statusRes.trainNumber} (${statusRes.trainName}) अभी ${statusRes.currentStation} पर है। वर्तमान देरी: +${statusRes.currentDelayMinutes} मिनट। स्थिति: ${statusRes.disruptionReason}।`
            : language === 'mr'
            ? `गाडी ${statusRes.trainNumber} (${statusRes.trainName}) सध्या ${statusRes.currentStation} येथे आहे. सध्याचा उशीर: +${statusRes.currentDelayMinutes} मिनिटे. स्थिती: ${statusRes.disruptionReason}.`
            : `Train ${statusRes.trainNumber} (${statusRes.trainName}) is currently at ${statusRes.currentStation}. Delay: +${statusRes.currentDelayMinutes} min (${statusRes.disruptionReason}).`;
        } else {
          replyText = `Could not track train ${trainNum}: ${statusRes.message}`;
        }
      }
      // Intent F: Fare Quote
      else if (q.includes('fare') || q.includes('cost') || q.includes('किराया') || q.includes('भाडे')) {
        const pair = extractStationPair(q);
        const userClass: TravelClass = q.includes('ac') ? 'AC_LOCAL' : q.includes('first') || q.includes('1st') ? 'I' : 'II';
        const fareRes = RailBackendTools.quoteFare(pair.from, pair.to, userClass);
        toolCalls.push({ name: 'quoteFare', output: fareRes });

        if (fareRes.status === 'success') {
          replyText = language === 'hi'
            ? `${fareRes.from} से ${fareRes.to} (${fareRes.distanceKm} किमी, श्रेणी: ${fareRes.class}) का उपनगरीय किराया ₹${fareRes.fareAmount} है।`
            : language === 'mr'
            ? `${fareRes.from} ते ${fareRes.to} (${fareRes.distanceKm} किमी, श्रेणी: ${fareRes.class}) उपनगरीय भाडे ₹${fareRes.fareAmount} आहे.`
            : `Suburban Fare from ${fareRes.from} to ${fareRes.to} (${fareRes.distanceKm} km, Class: ${fareRes.class}) is ₹${fareRes.fareAmount}.`;
        } else {
          replyText = `Could not calculate fare: ${fareRes.message}`;
        }
      }
      // Default: Search Trains
      else {
        const pair = extractStationPair(q);
        const classPref: TravelClass = q.includes('ac') ? 'AC_LOCAL' : 'II';
        const searchRes = RailBackendTools.searchTrains(pair.from, pair.to, '10:35', classPref === 'AC_LOCAL' ? 'ac_mandatory' : 'any');
        const fareRes = RailBackendTools.quoteFare(pair.from, pair.to, classPref);
        toolCalls.push({ name: 'searchTrains', output: searchRes });
        toolCalls.push({ name: 'quoteFare', output: fareRes });

        if (searchRes.status === 'success' && searchRes.itineraries.length > 0) {
          const top = searchRes.itineraries[0];
          const fareAmt = fareRes.status === 'success' ? fareRes.fareAmount : (top.fare[classPref] || 10);
          replyText = language === 'hi'
            ? `${searchRes.origin} से ${searchRes.destination} के लिए अगली ट्रेन ${top.departure} (आगमन ${top.arrival})। यात्रा समय: ${top.durationMinutes} मिनट। किराया: ₹${fareAmt}। क्या आप एक कॉल में टिकट बुक करना चाहते हैं?`
            : language === 'mr'
            ? `${searchRes.origin} ते ${searchRes.destination} साठी पुढील गाडी ${top.departure} (पोहोच: ${top.arrival}). वेळ: ${top.durationMinutes} मिनिटे. भाडे: ₹${fareAmt}. आपण एका कॉलवर तिकीट बुक करू इच्छिता?`
            : `Next service from ${searchRes.origin} to ${searchRes.destination} departs at ${top.departure} (arrives ${top.arrival}). Travel time: ${top.durationMinutes}m. Fare is ₹${fareAmt}. Say "Book it" to issue immediately.`;
        } else {
          replyText = language === 'hi'
            ? `${pair.from} और ${pair.to} के बीच कोई सीधी सेवा नहीं मिली।`
            : `No direct train found between ${pair.from} and ${pair.to}.`;
        }
      }

      setIsProcessing(false);
      setCallState('SPEAKING');
      setCallTranscript(replyText);
      speakAgentText(replyText);

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
    }, 500);
  };

  // Quick localized prompts
  const quickPromptsByLang: Record<AppLanguage, Array<{ label: string; query: string }>> = {
    en: [
      { label: '⚡ Book Fast local Dadar to Thane', query: 'Book Fast local from Dadar to Thane' },
      { label: '🎫 Book 2nd Class Thane to CSMT', query: 'Book second class Thane to CSMT' },
      { label: '❄️ Find AC Local Dadar to Thane', query: 'Find AC local Dadar to Thane' },
      { label: '⏱️ Check delay 95112', query: 'Check delay for 95112' },
      { label: '💰 Fare Churchgate to Borivali', query: 'Quote fare Churchgate to Borivali' }
    ],
    hi: [
      { label: '⚡ दादर से ठाणे फास्ट लोकल बुक करें', query: 'दादर से ठाणे फास्ट लोकल बुक करें' },
      { label: '🎫 ठाणे से सीएसएमटी सेकंड क्लास बुक करें', query: 'ठाणे से सीएसएमटी सेकंड क्लास बुक करें' },
      { label: '❄️ दादर से ठाणे एसी लोकल खोजें', query: 'दादर से ठाणे एसी लोकल खोजें' },
      { label: '⏱️ ट्रेन 95112 की देरी जांचें', query: 'ट्रेन 95112 की देरी जांचें' },
      { label: '💰 चर्चगेट से बोरीवली किराया बताएं', query: 'चर्चगेट से बोरीवली किराया' }
    ],
    mr: [
      { label: '⚡ दादर ते ठाणे जलद लोकल बुक करा', query: 'दादर ते ठाणे जलद लोकल बुक करा' },
      { label: '🎫 ठाणे ते सीएसएमटी द्वितीय श्रेणी बुक करा', query: 'ठाणे ते सीएसएमटी द्वितीय श्रेणी बुक करा' },
      { label: '❄️ दादर ते ठाणे एसी लोकल शोधा', query: 'दादर ते ठाणे एसी लोकल शोधा' },
      { label: '⏱️ गाडी 95112 चा उशीर तपासा', query: 'गाडी 95112 चा उशीर तपासा' },
      { label: '💰 चर्चगेट ते बोरिवली भाडे तपासा', query: 'चर्चगेट ते बोरिवली भाडे' }
    ]
  };

  const activePrompts = quickPromptsByLang[language] || quickPromptsByLang.en;

  return (
    <div className="space-y-3 pb-24 px-3.5 pt-2 flex flex-col h-full min-h-[76vh]">
      
      {/* Assistant Header Banner with One-Call Badge */}
      <div className="p-3 rounded-2xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-500/30 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-theme-primary text-white flex items-center justify-center font-black shadow-xs">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight">{t.railYatriTitle.split(' ')[0]} {t.railYatriTitle.split(' ')[1]}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[8px] font-mono font-black bg-emerald-400 text-slate-950">
                {t.oneCallBadge}
              </span>
            </div>
            <div className="text-[10px] text-cyan-200 line-clamp-1">
              {t.railYatriSubtitle}
            </div>
          </div>
        </div>

        <button
          onClick={() => processPassengerQuery(activePrompts[0].query)}
          className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black shadow-md flex items-center gap-1 transition-all active:scale-95 shrink-0"
          title="Instant One-Call Booking"
        >
          <Zap className="w-3 h-3 fill-current" />
          <span>{language === 'hi' ? 'त्वरित बुक' : language === 'mr' ? 'झटपट बुक' : '1-Click Book'}</span>
        </button>
      </div>

      {/* Mode Selector Header */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold shrink-0">
        <button
          onClick={() => setMode('call')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mode === 'call'
              ? 'bg-white dark:bg-slate-800 text-theme-primary shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>{t.callScreen}</span>
        </button>
        <button
          onClick={() => setMode('chat')}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mode === 'chat'
              ? 'bg-white dark:bg-slate-800 text-theme-primary shadow-xs'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>{t.chatScreen}</span>
        </button>
      </div>

      {/* MODE 1: Voice Calling Screen (Authentic Telephony UX) */}
      {mode === 'call' && (
        <div className="flex-1 rounded-3xl bg-linear-to-b from-slate-900 via-indigo-950 to-slate-950 text-white p-5 border border-indigo-900/60 shadow-2xl flex flex-col justify-between items-center text-center animate-fadeIn relative overflow-hidden">
          
          {/* Ambient Audio Pulse Background Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

          {/* Top Call Status Bar */}
          <div className="z-10 w-full flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[10px] tracking-wider uppercase text-cyan-400">Dograh / WebRTC Voice Engine</span>
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
              <div className="text-lg font-black text-white">{t.railYatriTitle.split(' ')[0]} {t.railYatriTitle.split(' ')[1]} Voice</div>
              <div className="text-[11px] text-cyan-300 font-mono mt-0.5">
                {callState === 'IDLE' && t.readyToCall}
                {callState === 'CALLING' && 'Connecting to Assistant...'}
                {callState === 'CONNECTED' && t.connected}
                {callState === 'LISTENING' && t.listening}
                {callState === 'THINKING' && t.thinking}
                {callState === 'SPEAKING' && t.speaking}
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

          {/* Quick Voice Prompt Shortcuts (All Working & Dynamically Localized) */}
          <div className="z-10 w-full flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar text-[10px]">
            {activePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => processPassengerQuery(p.query)}
                className="px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white whitespace-nowrap border border-white/15 active:scale-95"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Bottom Call Hardware Controls */}
          <div className="z-10 w-full pt-2 flex items-center justify-around">
            {callState === 'IDLE' || callState === 'ENDED' ? (
              <button
                onClick={handleStartCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                title={t.startCall}
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
                  title={t.endCall}
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
                      {msg.toolCalls.map((tCall, idx) => (
                        <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-blue-500/10 text-theme-primary border border-blue-500/20 font-bold">
                          [TOOL: {tCall.name}]
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
                        <span>{t.yesConfirmBooking}</span>
                      </button>
                      <button
                        onClick={() => processPassengerQuery('Cancel')}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  )}

                  {/* Issued Ticket Card embedded in chat */}
                  {msg.ticketIssued && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] space-y-1">
                      <div className="font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Ticket className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{t.ticketIssued}: {msg.ticketIssued.id}</span>
                        </span>
                        <span className="font-mono font-bold">₹{msg.ticketIssued.farePaid}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400">
                        {msg.ticketIssued.fromStation.name} ➔ {msg.ticketIssued.toStation.name} ({msg.ticketIssued.classBooked})
                      </div>
                      <button
                        onClick={onViewTicketWallet}
                        className="text-theme-primary font-bold underline mt-1 block flex items-center gap-1"
                      >
                        <span>{t.viewWallet}</span>
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
                <span>{t.thinking}</span>
              </div>
            )}
          </div>

          {/* Quick Chat Suggestions */}
          <div className="p-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px]">
            {activePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => processPassengerQuery(p.query)}
                className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap border border-slate-200 dark:border-slate-700 hover:border-theme-primary active:scale-95"
              >
                {p.label}
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
              placeholder={t.askAssistantPlaceholder}
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
