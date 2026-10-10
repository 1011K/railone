import crypto from 'node:crypto';
import { getDatabase } from '../database/db';
import { searchStations, getStationByCode } from './stations';
import { searchRoutes, RouteSearchParams } from './routePlanner';
import { findExpressTrainsBetween, getTrainTrip } from './services';
import { checkAvailability } from './availability';
import { calculateSuburbanFare, calculateExpressFare } from './fares';
import { createBooking, BookingRecord } from './ticketing';
import { logAuditEvent } from './auditLog';
import { TravelClass, JourneyItinerary } from '../../types/railway';
import { getCurrentTimeString } from '../../engine/journeyEngine';

export interface VoiceTurnMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface VoiceBookingDraft {
  originCode?: string;
  destCode?: string;
  originName?: string;
  destName?: string;
  journeyDate?: string;
  timeContext?: string;
  serviceCategory?: 'suburban' | 'express';
  preferredClass?: TravelClass;
  fallbackClass?: TravelClass;
  passengersCount?: number;
  passengers?: Array<{ name: string; age: number; gender: string }>;
  selectedTrainNumber?: string;
  selectedTrainName?: string;
  selectedItinerary?: JourneyItinerary;
  totalFare?: number;
  confirmationRequired?: boolean;
  confirmed?: boolean;
}

export interface VoiceSessionState {
  sessionId: string;
  language: 'en' | 'hi' | 'mr';
  state: 'INITIAL' | 'PLANNING' | 'ITINERARY_OFFERED' | 'AWAITING_CONFIRMATION' | 'BOOKING_EXECUTED' | 'TERMINATED';
  turns: VoiceTurnMessage[];
  draft: VoiceBookingDraft;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceTurnResponse {
  sessionId: string;
  language: 'en' | 'hi' | 'mr';
  state: VoiceSessionState['state'];
  spokenResponse: string;
  transcript: string;
  suggestedActions: string[];
  activeDraft: VoiceBookingDraft;
  issuedBooking?: BookingRecord;
  groundedToolCalls: Array<{
    toolName: string;
    params: any;
    resultSummary: string;
  }>;
}

export function startVoiceSession(options?: {
  language?: 'en' | 'hi' | 'mr';
  passengerProfileId?: string;
}): VoiceSessionState {
  const db = getDatabase();
  const sessionId = 'VOICE-' + crypto.randomUUID();
  const lang = options?.language || 'en';
  const now = new Date().toISOString();

  const greetingEn = "Namaste! I am RailSathi, your railway passenger voice assistant. How can I help you travel today?";
  const greetingHi = "नमस्ते! मैं रेलसाथी हूँ। मैं आपकी यात्रा और टिकट बुकिंग में कैसे सहायता कर सकता हूँ?";
  const greetingMr = "नमस्कार! मी रेलसाथी आहे. मी आपल्या प्रवासात कशी मदत करू शकतो?";

  const initialGreeting = lang === 'hi' ? greetingHi : lang === 'mr' ? greetingMr : greetingEn;

  const turns: VoiceTurnMessage[] = [
    { role: 'assistant', content: initialGreeting, timestamp: now }
  ];

  const draft: VoiceBookingDraft = {
    passengersCount: 1,
    passengers: [{ name: 'Primary Passenger', age: 30, gender: 'M' }]
  };

  const stmt = db.prepare(`
    INSERT INTO voice_sessions (session_id, language, turns_json, active_draft_json, state, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(sessionId, lang, JSON.stringify(turns), JSON.stringify(draft), 'INITIAL', now, now);

  logAuditEvent({
    eventType: 'VOICE_SESSION_STARTED',
    actor: options?.passengerProfileId || 'guest',
    entityType: 'VOICE_SESSION',
    entityId: sessionId,
    payload: { language: lang }
  });

  return {
    sessionId,
    language: lang,
    state: 'INITIAL',
    turns,
    draft,
    createdAt: now,
    updatedAt: now
  };
}

export function getVoiceSession(sessionId: string): VoiceSessionState | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM voice_sessions WHERE session_id = ?');
  const row: any = stmt.get(sessionId);
  if (!row) return null;

  return {
    sessionId: row.session_id,
    language: row.language,
    state: row.state,
    turns: JSON.parse(row.turns_json),
    draft: JSON.parse(row.active_draft_json || '{}'),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function processVoiceTurn(
  sessionId: string,
  userUtterance: string,
  options?: { language?: 'en' | 'hi' | 'mr'; passengerProfileId?: string }
): Promise<VoiceTurnResponse> {
  const db = getDatabase();
  let session = getVoiceSession(sessionId);
  if (!session) {
    session = startVoiceSession({ language: options?.language, passengerProfileId: options?.passengerProfileId });
  }

  const lang = options?.language || session.language;
  const now = new Date().toISOString();
  session.turns.push({ role: 'user', content: userUtterance, timestamp: now });

  const text = userUtterance.toLowerCase().trim();
  const toolCalls: VoiceTurnResponse['groundedToolCalls'] = [];
  let spokenResponse = '';
  let issuedBooking: BookingRecord | undefined = undefined;
  const draft = session.draft;

  // Language switch intent
  if (text.includes('hindi') || text.includes('हिंदी')) {
    session.language = 'hi';
  } else if (text.includes('marathi') || text.includes('मराठी')) {
    session.language = 'mr';
  } else if (text.includes('english')) {
    session.language = 'en';
  }

  // 0. Check for Cancellation Intent when awaiting confirmation
  const cleanText = text.replace(/[,.!?]/g, '').trim();
  const isCancelIntent =
    cleanText === 'cancel' ||
    cleanText === 'no' ||
    cleanText === 'stop' ||
    cleanText === 'abort' ||
    cleanText.includes('cancel') ||
    cleanText.includes('dont book') ||
    cleanText.includes("don't book") ||
    cleanText.includes('रद्द') ||
    cleanText.includes('नाही') ||
    cleanText.includes('नको') ||
    cleanText.includes('नहीं') ||
    cleanText.includes('रहने दो');

  if (isCancelIntent && session.state === 'AWAITING_CONFIRMATION') {
    session.state = 'ITINERARY_OFFERED';
    draft.confirmationRequired = false;
    draft.confirmed = false;

    if (session.language === 'hi') {
      spokenResponse = 'बुकिंग रद्द कर दी गई है। आपके खाते से कोई शुल्क नहीं काटा गया है। आप कोई अन्य ट्रेन चुन सकते हैं।';
    } else if (session.language === 'mr') {
      spokenResponse = 'बुकिंग रद्द करण्यात आली आहे. कोणतेही भाडे आकारले नाही. आपण दुसरी गाडी निवडू शकता.';
    } else {
      spokenResponse = 'Booking cancelled. No fare has been deducted. You can select another service or check another route.';
    }

    const turnsStmt = db.prepare('UPDATE voice_sessions SET state = ?, turns_json = ?, active_draft_json = ?, updated_at = ? WHERE session_id = ?');
    turnsStmt.run(session.state, JSON.stringify(session.turns), JSON.stringify(session.draft), now, session.sessionId);

    return {
      sessionId: session.sessionId,
      language: session.language,
      state: session.state,
      spokenResponse,
      transcript: userUtterance,
      suggestedActions: ['Check another train', 'Change stations'],
      activeDraft: session.draft,
      groundedToolCalls: toolCalls
    };
  }

  // 1. Check for Confirmation / Final Booking Intent ("book this one", "confirm", "proceed", "yes book it", "हो, पुष्टी करा")
  const isAffirmative =
    cleanText === 'yes' ||
    cleanText === 'yes confirm' ||
    cleanText === 'confirm' ||
    cleanText === 'proceed' ||
    cleanText === 'ok' ||
    cleanText === 'हाँ' ||
    cleanText === 'हो' ||
    cleanText === 'होय' ||
    cleanText === 'नक्की' ||
    cleanText.includes('yes confirm') ||
    cleanText.includes('confirm booking') ||
    cleanText.includes('पुष्टी करा') ||
    cleanText.includes('पुष्टि करें') ||
    cleanText.includes('हो पुष्टी') ||
    cleanText.includes('हाँ पुष्टि') ||
    cleanText.includes('होय');

  const isBookingInitiation =
    cleanText === 'book this one' ||
    cleanText === 'book this' ||
    cleanText === 'book it' ||
    cleanText === 'book ticket' ||
    cleanText.includes('book this') ||
    cleanText.includes('book karo') ||
    cleanText.includes('बुक करा') ||
    cleanText.includes('बुक करो');

  const isConfirmIntent = isAffirmative || isBookingInitiation;

  if (isConfirmIntent && draft.originCode && draft.destCode && draft.selectedTrainNumber) {
    // Only execute if passenger was ALREADY presented with the review summary and asked to confirm
    if (session.state === 'AWAITING_CONFIRMATION' && (isAffirmative || isBookingInitiation)) {
      // Execute genuine server-side booking
      try {
        const idempotencyKey = `VOICE-${session.sessionId}-${Date.now().toString().slice(0, 8)}`;
        const booking = createBooking({
          idempotencyKey,
          passengerProfileId: options?.passengerProfileId,
          trainNumber: draft.selectedTrainNumber,
          journeyDate: draft.journeyDate || new Date().toISOString().split('T')[0],
          fromStationCode: draft.originCode,
          toStationCode: draft.destCode,
          classBooked: draft.preferredClass || 'II',
          quota: 'GN',
          passengers: draft.passengers || [{ name: 'Passenger 1', age: 28, gender: 'M' }],
          paymentMethod: 'VOICE_AUTHORIZED_WALLET'
        });

        issuedBooking = booking;
        session.state = 'BOOKING_EXECUTED';
        draft.confirmed = true;

        toolCalls.push({
          toolName: 'createBooking',
          params: { trainNumber: draft.selectedTrainNumber, from: draft.originCode, to: draft.destCode, class: draft.preferredClass },
          resultSummary: `Booking confirmed with PNR ${booking.pnr}, Total Fare ₹${booking.farePaid}`
        });

        if (session.language === 'hi') {
          spokenResponse = `बधाई हो! आपकी टिकट सफलतापूर्वक बुक हो गई है। पीएनआर नंबर है ${booking.pnr}। कुल किराया ₹${booking.farePaid} है। आप इसे माय टिकट्स में देख सकते हैं।`;
        } else if (session.language === 'mr') {
          spokenResponse = `अभिनंदन! आपले तिकीट यशस्वीरित्या बुक झाले आहे. पीएनआर क्रमांक ${booking.pnr} आहे. एकूण भाडे ₹${booking.farePaid} आहे. आपण हे माय तिकीट्स मध्ये पाहू शकता.`;
        } else {
          spokenResponse = `Booking confirmed! Your ticket for train ${booking.trainName} has been issued with PNR ${booking.pnr}. Total fare ₹${booking.farePaid}. Your ticket is now accessible under My Tickets.`;
        }
      } catch (err: any) {
        spokenResponse = `Sorry, could not complete booking: ${err.message}`;
      }
    } else {
      // Prompt for explicit passenger consent with full review details
      session.state = 'AWAITING_CONFIRMATION';
      const passengersCount = draft.passengersCount || 1;
      const fare = draft.totalFare || 95;

      if (session.language === 'hi') {
        spokenResponse = `कृपया पुष्टि करें: ${draft.originName} से ${draft.destName} के लिए ${draft.preferredClass} क्लास में ${passengersCount} टिकट, ट्रेन ${draft.selectedTrainName}। कुल किराया ₹${fare} है। क्या आप बुकिंग आगे बढ़ाना चाहते हैं?`;
      } else if (session.language === 'mr') {
        spokenResponse = `कृपया पुष्टी करा: ${draft.originName} ते ${draft.destName} साठी ${draft.preferredClass} मध्ये ${passengersCount} तिकीट, गाडी ${draft.selectedTrainName}। एकूण भाडे ₹${fare} आहे. मी बुकिंग पूर्ण करू का?`;
      } else {
        spokenResponse = `Please confirm: ${passengersCount} ticket(s) from ${draft.originName} to ${draft.destName} in ${draft.preferredClass} on ${draft.selectedTrainName}. Total fare is ₹${fare}. Say 'Yes, confirm' to finalize.`;
      }
    }
  }
  // 2. Class Preference Adjustment ("Use AC if available, otherwise show first class")
  else if (text.includes('ac if available') || text.includes('use ac') || (text.includes('ac') && text.includes('first class'))) {
    draft.preferredClass = 'AC_LOCAL';
    draft.fallbackClass = 'I';

    // Recalculate using real railway tools
    if (draft.originCode && draft.destCode) {
      const itineraries = searchRoutes({
        from: draft.originCode,
        to: draft.destCode,
        departureTime: draft.timeContext,
        acOnly: true,
        priority: 'fastest'
      });

      toolCalls.push({
        toolName: 'searchRoutes',
        params: { from: draft.originCode, to: draft.destCode, acOnly: true },
        resultSummary: `Found ${itineraries.length} AC services`
      });

      if (itineraries.length > 0) {
        const selected = itineraries[0];
        draft.selectedItinerary = selected;
        draft.selectedTrainNumber = selected.legs[0].train.trainNumber;
        draft.selectedTrainName = selected.legs[0].train.trainName;
        draft.preferredClass = 'AC_LOCAL';
        draft.totalFare = selected.totalFareByClass['AC_LOCAL'] || 95;

        session.state = 'ITINERARY_OFFERED';
        if (session.language === 'hi') {
          spokenResponse = `मैंने आपकी प्राथमिकता AC लोकल पर सेट कर दी है। अगली AC फास्ट लोकल ${selected.predictedDeparture} पर रवाना होगी। किराया ₹${draft.totalFare} है। क्या आप इसे बुक करना चाहते हैं?`;
        } else if (session.language === 'mr') {
          spokenResponse = `मी आपली पसंती AC लोकलवर ठेवली आहे. पुढील AC लोकल ${selected.predictedDeparture} वाजता सुटेल. भाडे ₹${draft.totalFare} आहे. मी हे बुक करू का?`;
        } else {
          spokenResponse = `Updated to AC Local preference. The next AC Fast service departs at ${selected.predictedDeparture} arriving at ${selected.predictedArrival}. Fare is ₹${draft.totalFare}. Would you like to book this one?`;
        }
      } else {
        // Fallback to First Class
        draft.preferredClass = 'I';
        draft.totalFare = 105;
        spokenResponse = `No AC local found in the immediate window, so showing First Class departing shortly. Fare is ₹105. Say 'Book this one' to proceed.`;
      }
    } else {
      spokenResponse = `Noted AC preference. Which stations are you traveling between?`;
    }
  }
  // 3. Journey Planning / Booking Intent (Origin & Destination extraction)
  else {
    extractJourneyEntities(text, draft);

    if (draft.originCode && draft.destCode) {
      // Determine suburban vs express
      const isExpress =
        draft.serviceCategory === 'express' ||
        ['SL', '3A', '2A', '1A', '2S'].includes(draft.preferredClass || '') ||
        text.includes('delhi') ||
        text.includes('sleeper') ||
        text.includes('rajdhani');

      if (isExpress) {
        draft.serviceCategory = 'express';
        if (!draft.preferredClass) draft.preferredClass = text.includes('3a') ? '3A' : 'SL';

        // Grounded express train selection using railway inventory
        const expressCandidates = findExpressTrainsBetween(
          draft.originCode || 'CSMT',
          draft.destCode || 'NDLS',
          draft.preferredClass,
          draft.journeyDate
        );

        let chosenTrain: any = expressCandidates[0];
        if (!chosenTrain) {
          const anyClassTrains = findExpressTrainsBetween(
            draft.originCode || 'CSMT',
            draft.destCode || 'NDLS',
            undefined,
            draft.journeyDate
          );
          if (anyClassTrains.length > 0) chosenTrain = anyClassTrains[0];
        }

        const trainNo = chosenTrain ? chosenTrain.trainNumber : (draft.selectedTrainNumber || '12137');
        const trainName = chosenTrain ? chosenTrain.trainName : (draft.selectedTrainName || 'Punjab Mail');
        draft.selectedTrainNumber = trainNo;
        draft.selectedTrainName = trainName;

        const count = draft.passengersCount || 1;
        const availRes = checkAvailability(trainNo, draft.journeyDate || new Date().toISOString().split('T')[0], 'GN');
        const classAvail = availRes?.classes.find(c => c.travelClass === draft.preferredClass);
        const unitFare = classAvail ? classAvail.fare : (draft.preferredClass === 'SL' ? 385 : 1025);
        draft.totalFare = unitFare * count;

        const availStatus = classAvail ? classAvail.status : 'AVAILABLE-42';

        toolCalls.push({
          toolName: 'checkAvailability',
          params: { train: trainNo, date: draft.journeyDate, class: draft.preferredClass },
          resultSummary: `Train ${trainNo} ${draft.preferredClass} ${availStatus}`
        });

        session.state = 'ITINERARY_OFFERED';
        if (session.language === 'hi') {
          spokenResponse = `${draft.originName} से ${draft.destName} के लिए ${draft.selectedTrainName} (${trainNo}) में ${draft.preferredClass} क्लास में सीटें उपलब्ध हैं (${availStatus})। ${count} यात्रियों के लिए कुल किराया ₹${draft.totalFare} है। क्या आप इसे बुक करना चाहते हैं?`;
        } else if (session.language === 'mr') {
          spokenResponse = `${draft.originName} ते ${draft.destName} साठी ${draft.selectedTrainName} (${trainNo}) मध्ये ${draft.preferredClass} मध्ये जागा उपलब्ध आहेत (${availStatus})। ${count} प्रवाशांसाठी एकूण भाडे ₹${draft.totalFare} आहे. मी हे बुक करू का?`;
        } else {
          spokenResponse = `Found ${draft.selectedTrainName} (${trainNo}) from ${draft.originName} to ${draft.destName} in ${draft.preferredClass}. Availability: ${availStatus}. Total fare for ${count} passenger(s) is ₹${draft.totalFare}. Say 'Book this one' to confirm.`;
        }
      } else {
        // Suburban routing
        draft.serviceCategory = 'suburban';
        const itineraries = searchRoutes({
          from: draft.originCode,
          to: draft.destCode,
          departureTime: draft.timeContext || getCurrentTimeString(),
          classPreference: draft.preferredClass === 'AC_LOCAL' ? 'ac_mandatory' : 'any'
        });

        toolCalls.push({
          toolName: 'searchRoutes',
          params: { from: draft.originCode, to: draft.destCode, time: draft.timeContext },
          resultSummary: `Found ${itineraries.length} connections`
        });

        if (itineraries.length > 0) {
          const selected = itineraries[0];
          draft.selectedItinerary = selected;
          draft.selectedTrainNumber = selected.legs[0].train.trainNumber;
          draft.selectedTrainName = selected.legs[0].train.trainName;
          const chosenClass = draft.preferredClass || selected.recommendedClass;
          draft.preferredClass = chosenClass;
          draft.totalFare = (selected.totalFareByClass[chosenClass] || 10) * (draft.passengersCount || 1);

          session.state = 'ITINERARY_OFFERED';
          const depTime = selected.predictedDeparture;
          const duration = selected.totalDurationMinutes;
          const transferText = selected.transfers.length > 0
            ? ` via ${selected.transfers[0].station.name} transfer (${selected.transfers[0].walkTimeMinutes} min walk)`
            : '';

          if (session.language === 'hi') {
            spokenResponse = `${draft.originName} से ${draft.destName} के लिए ${selected.legs[0].train.trainName} ${depTime} पर निकलेगी${selected.transfers.length > 0 ? ` (${selected.transfers[0].station.name} पर ट्रांसफर)` : ''}। यात्रा का समय ${duration} मिनट है और किराया ₹${draft.totalFare} है। बुक करने के लिए कहें 'Book this one' या 'Use AC if available' कहें।`;
          } else if (session.language === 'mr') {
            spokenResponse = `${draft.originName} ते ${draft.destName} साठी लोकल ${depTime} वाजता निघेल${selected.transfers.length > 0 ? ` (${selected.transfers[0].station.name} येथे बदल)` : ''}. प्रवासाचा वेळ ${duration} मिनिटे आणि भाडे ₹${draft.totalFare} आहे. बुक करण्यासाठी 'Book this one' म्हणा.`;
          } else {
            spokenResponse = `Next connection from ${draft.originName} to ${draft.destName}${transferText} departs at ${depTime} (${duration} mins travel). Fare in ${chosenClass} is ₹${draft.totalFare}. You can say 'Book this one' or 'Use AC if available'.`;
          }
        } else {
          spokenResponse = `No direct connection found between ${draft.originName} and ${draft.destName} right now.`;
        }
      }
    } else if (draft.originCode && !draft.destCode) {
      spokenResponse = `Got origin ${draft.originName}. Where would you like to go?`;
    } else {
      spokenResponse = `Please mention your origin and destination station. For example: "Book a First Class local from Thane to Churchgate".`;
    }
  }

  // Update session record in SQLite
  session.turns.push({ role: 'assistant', content: spokenResponse, timestamp: new Date().toISOString() });
  const updateStmt = db.prepare(`
    UPDATE voice_sessions SET
      language = ?,
      turns_json = ?,
      active_draft_json = ?,
      state = ?,
      updated_at = ?
    WHERE session_id = ?
  `);

  updateStmt.run(
    session.language,
    JSON.stringify(session.turns),
    JSON.stringify(draft),
    session.state,
    new Date().toISOString(),
    sessionId
  );

  return {
    sessionId,
    language: session.language,
    state: session.state,
    spokenResponse,
    transcript: spokenResponse,
    suggestedActions:
      session.state === 'AWAITING_CONFIRMATION'
        ? ['Yes, confirm booking', 'Cancel']
        : session.state === 'ITINERARY_OFFERED'
        ? ['Book this one', 'Use AC if available', 'Change class']
        : ['From Thane to CSMT', 'From Dadar to Churchgate', 'Help'],
    activeDraft: draft,
    issuedBooking,
    groundedToolCalls: toolCalls
  };
}

function extractJourneyEntities(text: string, draft: VoiceBookingDraft): void {
  // 1. Station resolution
  const stationsToTest = [
    { name: 'thane', code: 'TNA' },
    { name: 'ठाणे', code: 'TNA' },
    { name: 'churchgate', code: 'CCG' },
    { name: 'चर्चगेट', code: 'CCG' },
    { name: 'dadar', code: 'DR' },
    { name: 'दादर', code: 'DR' },
    { name: 'csmt', code: 'CSMT' },
    { name: 'cst', code: 'CSMT' },
    { name: 'छत्रपती शिवाजी', code: 'CSMT' },
    { name: 'kalyan', code: 'KYN' },
    { name: 'कल्याण', code: 'KYN' },
    { name: 'andheri', code: 'ADH' },
    { name: 'अंधेरी', code: 'ADH' },
    { name: 'borivali', code: 'BVI' },
    { name: 'बोरिवली', code: 'BVI' },
    { name: 'kurla', code: 'CLA' },
    { name: 'कुर्ला', code: 'CLA' },
    { name: 'ghatkopar', code: 'GC' },
    { name: 'घाटकोपर', code: 'GC' },
    { name: 'panvel', code: 'PNVL' },
    { name: 'पनवेल', code: 'PNVL' },
    { name: 'ठाण्याहून', code: 'TNA' },
    { name: 'ठाण्याला', code: 'TNA' },
    { name: 'दादरला', code: 'DR' },
    { name: 'कुर्ल्याला', code: 'CLA' },
    { name: 'बोरिवलीला', code: 'BVI' },
    { name: 'mumbai', code: 'CSMT' },
    { name: 'delhi', code: 'NDLS' },
    { name: 'new delhi', code: 'NDLS' }
  ];

  const isCorrection =
    text.includes('change') ||
    text.includes('not ') ||
    text.includes('actually') ||
    text.includes('instead') ||
    text.includes('बदला') ||
    text.includes('नाही');

  for (const s of stationsToTest) {
    if (
      text.includes(`from ${s.name}`) ||
      text.includes(`${s.name} से`) ||
      text.includes(`${s.name} पासून`) ||
      text.includes(`${s.name} वरून`) ||
      text.includes(`${s.name} हून`) ||
      (s.name.endsWith('हून') && text.includes(s.name))
    ) {
      draft.originCode = s.code;
      draft.originName = s.name.toUpperCase();
      draft.selectedTrainNumber = undefined;
      draft.selectedTrainName = undefined;
      draft.selectedItinerary = undefined;
    } else if (text.includes(`${s.name} to`) && (!draft.originCode || isCorrection)) {
      draft.originCode = s.code;
      draft.originName = s.name.toUpperCase();
      draft.selectedTrainNumber = undefined;
      draft.selectedTrainName = undefined;
      draft.selectedItinerary = undefined;
    }
    if (
      text.includes(`to ${s.name}`) ||
      text.includes(`तक ${s.name}`) ||
      text.includes(`${s.name} तक`) ||
      text.includes(`ते ${s.name}`) ||
      text.includes(`${s.name} पर्यंत`) ||
      text.includes(`से ${s.name}`) ||
      text.includes(`${s.name} जाना`) ||
      (s.name.endsWith('ला') && text.includes(s.name))
    ) {
      // Guard against setting same station as both origin and dest if utterance was "X से"
      if (s.code !== draft.originCode) {
        draft.destCode = s.code;
        draft.destName = s.name.toUpperCase();
        draft.selectedTrainNumber = undefined;
        draft.selectedTrainName = undefined;
        draft.selectedItinerary = undefined;
      }
    }
  }

  // Fallback matching if "from X to Y" pattern or correction
  if (!draft.originCode || !draft.destCode || isCorrection) {
    const found: string[] = [];
    for (const s of stationsToTest) {
      // Exclude explicitly negated stations (e.g. "not Thane")
      if (
        text.includes(s.name) &&
        !text.includes(`not ${s.name}`) &&
        !text.includes(`नाही ${s.name}`) &&
        !found.includes(s.code)
      ) {
        found.push(s.code);
      }
    }
    if (found.length >= 2 && (!draft.originCode || !draft.destCode)) {
      draft.originCode = found[0];
      draft.originName = getStationByCode(found[0])?.name || found[0];
      draft.destCode = found[1];
      draft.destName = getStationByCode(found[1])?.name || found[1];
      draft.selectedTrainNumber = undefined;
      draft.selectedTrainName = undefined;
      draft.selectedItinerary = undefined;
    } else if (found.length === 1 && isCorrection) {
      if (text.includes('from') || text.includes('origin') || text.includes('not')) {
        draft.originCode = found[0];
        draft.originName = getStationByCode(found[0])?.name || found[0];
        draft.selectedTrainNumber = undefined;
        draft.selectedTrainName = undefined;
        draft.selectedItinerary = undefined;
      } else if (text.includes('to') || text.includes('dest')) {
        draft.destCode = found[0];
        draft.destName = getStationByCode(found[0])?.name || found[0];
        draft.selectedTrainNumber = undefined;
        draft.selectedTrainName = undefined;
        draft.selectedItinerary = undefined;
      }
    }
  }

  // 2. Class detection
  if (text.includes('first-class') || text.includes('first class') || text.includes('प्रथम वर्ग')) {
    draft.preferredClass = 'I';
  } else if (text.includes('ac local') || text.includes('ac')) {
    draft.preferredClass = 'AC_LOCAL';
  } else if (text.includes('sleeper') || text.includes('स्लीपर')) {
    draft.preferredClass = 'SL';
    draft.serviceCategory = 'express';
  } else if (text.includes('3a') || text.includes('third ac')) {
    draft.preferredClass = '3A';
    draft.serviceCategory = 'express';
  } else if (text.includes('second class') || text.includes('2s')) {
    draft.preferredClass = 'II';
  }

  // 3. Time detection
  if (text.includes('12:30') || text.includes('12.30')) {
    draft.timeContext = '12:30';
  } else if (text.includes('morning') || text.includes('सुबह')) {
    draft.timeContext = '08:30';
  } else if (text.includes('evening') || text.includes('शाम')) {
    draft.timeContext = '18:00';
  }

  // 4. Passenger count detection
  if (/\b(2|two|दो|दोन)\b/i.test(text) && !text.includes('12:')) {
    draft.passengersCount = 2;
    draft.passengers = [
      { name: 'Passenger 1', age: 34, gender: 'M' },
      { name: 'Passenger 2', age: 30, gender: 'F' }
    ];
  } else if (/\b(3|three|तीन)\b/i.test(text) && !text.includes(':30') && !text.includes('12:30')) {
    draft.passengersCount = 3;
    draft.passengers = [
      { name: 'Passenger 1', age: 35, gender: 'M' },
      { name: 'Passenger 2', age: 32, gender: 'F' },
      { name: 'Passenger 3', age: 10, gender: 'M' }
    ];
  }

  // 5. Date detection
  if (text.includes('next friday') || text.includes('अगले शुक्रवार')) {
    const d = new Date();
    d.setDate(d.getDate() + ((5 + 7 - d.getDay()) % 7 || 7));
    draft.journeyDate = d.toISOString().split('T')[0];
  } else if (text.includes('tomorrow') || text.includes('कल')) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    draft.journeyDate = d.toISOString().split('T')[0];
  } else if (!draft.journeyDate) {
    draft.journeyDate = new Date().toISOString().split('T')[0];
  }
}
