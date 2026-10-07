import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Alert,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { useMobileTheme } from '../src/theme/ThemeContext';
import { Audio } from 'expo-av';
import { NativeVoiceService, VoiceCallTurn, VoiceCallState } from '../src/services/voiceService';
import { speechEngine } from '../src/services/speechEngine';
import Svg, { Path, Rect, Polyline, Line, Circle } from 'react-native-svg';

function MicIcon({ color = '#ffffff', size = 26 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <Line x1="12" y1="19" x2="12" y2="23" />
      <Line x1="8" y1="23" x2="16" y2="23" />
    </Svg>
  );
}

function MicOffIcon({ color = '#ffffff', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Line x1="1" y1="1" x2="23" y2="23" />
      <Path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <Path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
      <Line x1="12" y1="19" x2="12" y2="23" />
      <Line x1="8" y1="23" x2="16" y2="23" />
    </Svg>
  );
}

function SpeakerIcon({ color = '#ffffff', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M11 5L6 9H2v6h4l5 4V5z" />
      <Path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </Svg>
  );
}

function KeypadIcon({ color = '#ffffff', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="2" y="4" width="20" height="16" rx="2" />
      <Path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" />
    </Svg>
  );
}

function EndCallIcon({ color = '#ffffff', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 11.36 11.36 0 0 0 3.53.56 2 2 0 0 1 2 2v3.5a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3.5a2 2 0 0 1 2 2 11.36 11.36 0 0 0 .57 3.53 2 2 0 0 1-.45 2.11L8.46 10.9" />
      <Line x1="23" y1="1" x2="1" y2="23" />
    </Svg>
  );
}

function CheckIcon({ color = '#22c55e', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

export default function VoiceCallScreen() {
  const { colors, language } = useMobileTheme();

  const [callState, setCallState] = useState<VoiceCallState>('CONNECTING');
  const [turns, setTurns] = useState<VoiceCallTurn[]>([]);
  const [duration, setDuration] = useState('00:00');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [micPermissionGranted, setMicPermissionGranted] = useState(true);

  // Audio Recording (Speech Capture) state
  const [isRecording, setIsRecording] = useState(false);
  const [sttOfflineNotice, setSttOfflineNotice] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recognitionRef = useRef<any>(null);
  const capturedTranscriptRef = useRef<string>('');

  // Text fallback input
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const voiceServiceRef = useRef<NativeVoiceService | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  // 1. Request microphone permission on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        const granted = status === 'granted';
        setMicPermissionGranted(granted);
        if (!granted) {
          Alert.alert(
            'Microphone Permission Denied',
            'RailOne needs microphone access for speech input. You can use the text keypad or quick phrases below.'
          );
        }
      } catch {
        // Fallback in web or simulator
      }
    })();
  }, []);

  // 2. Initialize voice session
  useEffect(() => {
    const service = new NativeVoiceService(language);
    voiceServiceRef.current = service;

    service.setCallbacks({
      onStateChange: state => setCallState(state),
      onTurn: turn => {
        setTurns(prev => [...prev, turn]);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      },
      onBookingConfirmed: booking => {
        setConfirmedBooking(booking);
      }
    });

    service.startCall();

    const interval = setInterval(() => {
      setDuration(service.getDurationFormatted());
    }, 1000);

    return () => {
      clearInterval(interval);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
      service.endCall();
    };
  }, [language]);

  // Handle speaker toggle
  useEffect(() => {
    if (!isSpeaker) {
      speechEngine.stop();
    }
  }, [isSpeaker]);

  // 3. Audio Recording Methods with Real Speech Recognition
  const startRecording = async () => {
    if (!micPermissionGranted) {
      Alert.alert(
        'Microphone Permission Required',
        'Please grant microphone permission to record voice, or use the keypad below.'
      );
      setShowTextInput(true);
      return;
    }

    if (isMuted) {
      Alert.alert('Microphone Muted', 'Please unmute the microphone to speak.');
      return;
    }

    capturedTranscriptRef.current = '';
    setSttOfflineNotice(false);

    // If Web Speech Recognition API is available, initialize listener
    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
          rec.continuous = false;
          rec.interimResults = false;
          rec.onresult = (e: any) => {
            const resultText = e.results?.[0]?.[0]?.transcript;
            if (resultText) {
              capturedTranscriptRef.current = resultText;
            }
          };
          rec.onerror = (err: any) => {
            console.warn('SpeechRecognition error:', err);
          };
          rec.start();
          recognitionRef.current = rec;
        } catch (err) {
          console.warn('SpeechRecognition initialization error:', err);
        }
      }
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err: any) {
      console.warn('Speech capture initiation error:', err);
      setIsRecording(true);
    }
  };

  const stopRecordingAndTranscribe = async () => {
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
    }

    const transcript = capturedTranscriptRef.current;
    capturedTranscriptRef.current = '';

    if (transcript && transcript.trim()) {
      voiceServiceRef.current?.sendUserUtterance(transcript.trim());
    } else {
      // Platform STT is unavailable, microphone was silent, or running offline
      setSttOfflineNotice(true);
      setShowTextInput(true);
    }
  };

  const handleMicButtonPress = () => {
    if (callState === 'SPEAKING') {
      // Tap to interrupt
      voiceServiceRef.current?.interrupt();
      return;
    }

    if (isRecording) {
      stopRecordingAndTranscribe();
    } else {
      startRecording();
    }
  };

  const onEndCall = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(() => {});
    }
    voiceServiceRef.current?.endCall();
    router.back();
  };

  const onSendTextMessage = () => {
    if (!textInput.trim()) return;
    const msg = textInput;
    setTextInput('');
    setSttOfflineNotice(false);
    voiceServiceRef.current?.sendUserUtterance(msg);
  };

  const onQuickUtterance = (phrase: string) => {
    setSttOfflineNotice(false);
    voiceServiceRef.current?.sendUserUtterance(phrase);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#090d16' }]}>
      {/* 1. Call Header */}
      <View style={styles.callHeader}>
        <Text style={styles.assistantTitle}>RailSathi AI Travel Caller</Text>
        <Text style={styles.callDuration}>{duration}</Text>
        <View style={styles.stateIndicatorRow}>
          <View
            style={[
              styles.stateDot,
              {
                backgroundColor:
                  isRecording
                    ? '#ef4444'
                    : callState === 'LISTENING'
                    ? '#22c55e'
                    : callState === 'PROCESSING'
                    ? '#f59e0b'
                    : callState === 'SPEAKING'
                    ? '#38bdf8'
                    : '#94a3b8'
              }
            ]}
          />
          <Text style={styles.stateLabel}>
            {isRecording
              ? 'Recording Commuter Audio (Speak now)...'
              : callState === 'CONNECTING'
              ? 'Connecting to Railway Tools...'
              : callState === 'LISTENING'
              ? 'Listening · Tap Mic to Speak'
              : callState === 'PROCESSING'
              ? 'Checking timetable & fares...'
              : callState === 'SPEAKING'
              ? 'RailSathi Speaking'
              : callState === 'AWAITING_CONFIRMATION'
              ? 'Awaiting Booking Confirmation'
              : 'Call Active'}
          </Text>
        </View>

        {!micPermissionGranted && (
          <View style={styles.permBanner}>
            <Text style={styles.permBannerText}>[MIC PERMISSION DENIED: USING KEYPAD MODE]</Text>
          </View>
        )}

        {sttOfflineNotice && (
          <View style={[styles.permBanner, { backgroundColor: '#78350f', borderColor: '#b45309' }]}>
            <Text style={[styles.permBannerText, { color: '#fef3c7' }]}>
              [STT OFFLINE / UNHEARD: TAP QUICK QUERY BELOW OR USE KEYPAD]
            </Text>
          </View>
        )}
      </View>

      {/* 2. Audio Visualizer Pulse Waves with Actual Speech Capture */}
      <View style={styles.visualizerContainer}>
        <TouchableOpacity
          style={[
            styles.pulseCircle,
            callState === 'SPEAKING' && styles.pulseActive,
            isRecording && styles.pulseRecording
          ]}
          onPress={handleMicButtonPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={
            callState === 'SPEAKING'
              ? 'Interrupt RailSathi'
              : isRecording
              ? 'Stop recording and send utterance'
              : 'Start voice recording'
          }
        >
          <View
            style={[
              styles.innerCircle,
              {
                backgroundColor: isMuted
                  ? '#ef4444'
                  : isRecording
                  ? '#dc2626'
                  : colors.primary
              }
            ]}
          >
            {isMuted ? (
              <MicOffIcon color="#ffffff" size={30} />
            ) : isRecording ? (
              <View style={styles.recordingSquare} />
            ) : (
              <MicIcon color="#ffffff" size={30} />
            )}
          </View>
        </TouchableOpacity>

        {callState === 'SPEAKING' ? (
          <TouchableOpacity
            style={styles.interruptBtn}
            onPress={() => voiceServiceRef.current?.interrupt()}
            activeOpacity={0.8}
            accessibilityLabel="Tap to interrupt RailSathi"
          >
            <Text style={styles.interruptBtnText}>Tap to Interrupt & Speak</Text>
          </TouchableOpacity>
        ) : isRecording ? (
          <Text style={[styles.micHintText, { color: '#ef4444', fontWeight: 'bold' }]}>
            ● Audio Stream Capturing · Tap to Finish & Send
          </Text>
        ) : (
          <Text style={[styles.micHintText, { color: '#94a3b8' }]}>
            Tap mic to capture audio or tap quick phrases below
          </Text>
        )}
      </View>

      {/* 3. Live Transcript Feed */}
      <ScrollView
        ref={scrollRef}
        style={styles.transcriptScroll}
        contentContainerStyle={styles.transcriptContent}
      >
        {turns.map((turn, index) => {
          const isUser = turn.role === 'user';
          return (
            <View
              key={index}
              style={[
                styles.turnBubble,
                isUser ? styles.userBubble : styles.assistantBubble
              ]}
            >
              <Text style={styles.turnRoleLabel}>
                {isUser ? 'Passenger' : 'RailSathi'} · {turn.timestamp}
              </Text>
              <Text style={styles.turnText}>{turn.text}</Text>
            </View>
          );
        })}

        {/* Issued Booking Card inside transcript */}
        {confirmedBooking && (
          <View style={styles.bookingConfirmedCard}>
            <View style={styles.bookingConfirmedHeaderRow}>
              <CheckIcon color="#22c55e" size={18} />
              <Text style={styles.bookingConfirmedTitle}>SPECIMEN TICKET ISSUED</Text>
            </View>
            <Text style={styles.bookingConfirmedSubtitle}>[DEMO / NOT VALID FOR TRAVEL]</Text>
            <Text style={styles.bookingConfirmedText}>
              PNR: {confirmedBooking.pnr} · Train {confirmedBooking.trainNumber} ({confirmedBooking.classBooked})
            </Text>
            <Text style={styles.bookingConfirmedText}>
              {confirmedBooking.fromStationName} ➔ {confirmedBooking.toStationName} · ₹{confirmedBooking.farePaid}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 4. Quick Response Chips */}
      <View style={styles.quickPhrasesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPhrasesContent}>
          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => onQuickUtterance('Thane to CSMT fast local at 10:45')}
          >
            <Text style={styles.quickChipText}>Thane ➔ CSMT</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => onQuickUtterance('Confirm booking for 1 passenger')}
          >
            <Text style={styles.quickChipText}>Confirm Booking</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => onQuickUtterance('What is the First Class fare from Dadar to Churchgate?')}
          >
            <Text style={styles.quickChipText}>First Class Fare DR ➔ CCG</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => onQuickUtterance('Are there delays on Central Line?')}
          >
            <Text style={styles.quickChipText}>Central Line Delays</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 5. Text Keypad Fallback Input */}
      {showTextInput && (
        <View style={styles.textInputRow}>
          <TextInput
            style={styles.textInputField}
            placeholder="Type query to RailSathi..."
            placeholderTextColor="#64748b"
            value={textInput}
            onChangeText={setTextInput}
            onSubmitEditing={onSendTextMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={onSendTextMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 6. Phone Controls Footer (Mute, Keyboard Fallback, Speaker, End Call) */}
      <View style={styles.controlsFooter}>
        <TouchableOpacity
          style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          onPress={() => setIsMuted(!isMuted)}
          accessibilityLabel="Toggle mute"
        >
          {isMuted ? <MicOffIcon color="#f87171" size={22} /> : <MicIcon color="#94a3b8" size={22} />}
          <Text style={styles.controlLabel}>{isMuted ? 'Muted' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, showTextInput && styles.controlBtnActive]}
          onPress={() => setShowTextInput(!showTextInput)}
          accessibilityLabel="Toggle text keypad fallback"
        >
          <KeypadIcon color={showTextInput ? '#38bdf8' : '#94a3b8'} size={22} />
          <Text style={styles.controlLabel}>Keypad</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
          onPress={() => setIsSpeaker(!isSpeaker)}
          accessibilityLabel="Toggle speaker"
        >
          <SpeakerIcon color={isSpeaker ? '#38bdf8' : '#94a3b8'} size={22} />
          <Text style={styles.controlLabel}>{isSpeaker ? 'Speaker' : 'Muted'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endCallBtn}
          onPress={onEndCall}
          accessibilityLabel="End call"
        >
          <EndCallIcon color="#ffffff" size={22} />
          <Text style={styles.endCallLabel}>End Call</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  callHeader: {
    alignItems: 'center',
    paddingVertical: 14
  },
  assistantTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800'
  },
  callDuration: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4
  },
  stateIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  stateLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600'
  },
  permBanner: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#ef444420',
    borderRadius: 4
  },
  permBannerText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '800'
  },
  visualizerContainer: {
    alignItems: 'center',
    marginVertical: 12
  },
  pulseCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pulseActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.35)',
    transform: [{ scale: 1.08 }]
  },
  pulseRecording: {
    backgroundColor: 'rgba(239, 68, 68, 0.35)',
    borderWidth: 2,
    borderColor: '#ef4444'
  },
  innerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  recordingSquare: {
    width: 22,
    height: 22,
    backgroundColor: '#ffffff',
    borderRadius: 4
  },
  micHintText: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '500'
  },
  interruptBtn: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#ef444425',
    borderWidth: 1,
    borderColor: '#ef444480'
  },
  interruptBtnText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '700'
  },
  transcriptScroll: {
    flex: 1,
    paddingHorizontal: 16
  },
  transcriptContent: {
    gap: 12,
    paddingBottom: 16
  },
  turnBubble: {
    borderRadius: 14,
    padding: 12,
    maxWidth: '85%'
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1e3a8a'
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b'
  },
  turnRoleLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4
  },
  turnText: {
    color: '#f8fafc',
    fontSize: 13,
    lineHeight: 18
  },
  bookingConfirmedCard: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginVertical: 4
  },
  bookingConfirmedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  bookingConfirmedTitle: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '800'
  },
  bookingConfirmedSubtitle: {
    color: '#f87171',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2
  },
  bookingConfirmedText: {
    color: '#f8fafc',
    fontSize: 12,
    marginTop: 2
  },
  quickPhrasesContainer: {
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#334155'
  },
  quickPhrasesContent: {
    paddingHorizontal: 16,
    gap: 8
  },
  quickChip: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  quickChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  textInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: '#1f2937'
  },
  textInputField: {
    flex: 1,
    height: 40,
    backgroundColor: '#1f2937',
    borderRadius: 20,
    paddingHorizontal: 14,
    color: '#ffffff',
    fontSize: 13
  },
  sendButton: {
    marginLeft: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#2563eb',
    borderRadius: 20
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  controlsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#070b12',
    borderTopWidth: 1,
    borderTopColor: '#1e293b'
  },
  controlBtn: {
    alignItems: 'center',
    gap: 4
  },
  controlBtnActive: {
    opacity: 1
  },
  controlLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600'
  },
  endCallBtn: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24
  },
  endCallLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  }
});
