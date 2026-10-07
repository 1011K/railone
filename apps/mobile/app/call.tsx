import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { useMobileTheme } from '../src/theme/ThemeContext';
import { NativeVoiceService, VoiceCallTurn, VoiceCallState } from '../src/services/voiceService';

export default function VoiceCallScreen() {
  const { colors, language } = useMobileTheme();

  const [callState, setCallState] = useState<VoiceCallState>('CONNECTING');
  const [turns, setTurns] = useState<VoiceCallTurn[]>([]);
  const [duration, setDuration] = useState('00:00');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Text fallback input
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const voiceServiceRef = useRef<NativeVoiceService | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

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
      service.endCall();
    };
  }, [language]);

  const onEndCall = () => {
    voiceServiceRef.current?.endCall();
    router.back();
  };

  const onSendTextMessage = () => {
    if (!textInput.trim()) return;
    const msg = textInput;
    setTextInput('');
    voiceServiceRef.current?.sendUserUtterance(msg);
  };

  const onQuickUtterance = (phrase: string) => {
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
                  callState === 'LISTENING'
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
            {callState === 'CONNECTING'
              ? 'Connecting to Railway Tools...'
              : callState === 'LISTENING'
              ? 'Listening (Speak now)'
              : callState === 'PROCESSING'
              ? 'Checking timetable & fares...'
              : callState === 'SPEAKING'
              ? 'RailSathi Speaking'
              : callState === 'AWAITING_CONFIRMATION'
              ? 'Awaiting Booking Confirmation'
              : 'Call Active'}
          </Text>
        </View>
      </View>

      {/* 2. Audio Visualizer Pulse Waves */}
      <View style={styles.visualizerContainer}>
        <View style={[styles.pulseCircle, callState === 'SPEAKING' && styles.pulseActive]}>
          <View style={[styles.innerCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.micIconText}>🎤</Text>
          </View>
        </View>
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
            <Text style={styles.bookingConfirmedTitle}>✓ TICKET ISSUED IN MY TICKETS</Text>
            <Text style={styles.bookingConfirmedDetails}>
              PNR: {confirmedBooking.pnr}{'\n'}
              Train: {confirmedBooking.trainName}{'\n'}
              Class: {confirmedBooking.classBooked} · Fare: ₹{confirmedBooking.farePaid}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 4. Quick Speech Suggestions */}
      <View style={styles.quickPhrasesRow}>
        <TouchableOpacity
          style={styles.quickChip}
          onPress={() => onQuickUtterance('Book me a first-class local from Thane to Churchgate around 12:30')}
        >
          <Text style={styles.quickChipText}>"Thane to Churchgate around 12:30"</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickChip}
          onPress={() => onQuickUtterance('Use AC if available, otherwise show first class')}
        >
          <Text style={styles.quickChipText}>"Use AC if available"</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickChip}
          onPress={() => onQuickUtterance('Book this one')}
        >
          <Text style={styles.quickChipText}>"Book this one"</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickChip}
          onPress={() => onQuickUtterance('Yes confirm')}
        >
          <Text style={styles.quickChipText}>"Yes confirm"</Text>
        </TouchableOpacity>
      </View>

      {/* 5. Text Fallback Input Bar */}
      {showTextInput && (
        <View style={styles.textInputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your travel request..."
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
          <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎙️'}</Text>
          <Text style={styles.controlLabel}>{isMuted ? 'Muted' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, showTextInput && styles.controlBtnActive]}
          onPress={() => setShowTextInput(!showTextInput)}
          accessibilityLabel="Toggle text keypad fallback"
        >
          <Text style={styles.controlIcon}>⌨️</Text>
          <Text style={styles.controlLabel}>Keyboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
          onPress={() => setIsSpeaker(!isSpeaker)}
          accessibilityLabel="Toggle speaker"
        >
          <Text style={styles.controlIcon}>🔊</Text>
          <Text style={styles.controlLabel}>Speaker</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endCallBtn}
          onPress={onEndCall}
          accessibilityLabel="End call"
        >
          <Text style={styles.endCallIcon}>✕</Text>
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
    paddingVertical: 16
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
    marginTop: 8
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
  innerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  micIconText: {
    fontSize: 26
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
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 12,
    padding: 12,
    marginTop: 6
  },
  bookingConfirmedTitle: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4
  },
  bookingConfirmedDetails: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 18
  },
  quickPhrasesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  quickChip: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  quickChipText: {
    color: '#94a3b8',
    fontSize: 11
  },
  textInputBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#111827'
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13
  },
  sendButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginLeft: 8
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12
  },
  controlsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0b1120'
  },
  controlBtn: {
    alignItems: 'center',
    padding: 8
  },
  controlBtnActive: {
    backgroundColor: '#1f2937',
    borderRadius: 10
  },
  controlIcon: {
    fontSize: 22,
    marginBottom: 4
  },
  controlLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600'
  },
  endCallBtn: {
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  endCallIcon: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900'
  },
  endCallLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800'
  }
});
