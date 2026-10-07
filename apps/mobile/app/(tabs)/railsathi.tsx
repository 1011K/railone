import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { useMobileTheme } from '../../src/theme/ThemeContext';
import { MobileApiClient } from '../../src/api/client';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  booking?: any;
}

const QUICK_ACTIONS = [
  'Thane to CSMT Trains',
  'AC Local Fare DR to TNA',
  'Check Sectional Delays',
  'Book Platform Ticket',
  'Dadar Interchange FOB'
];

export default function RailSathiTabScreen() {
  const { colors, language } = useMobileTheme();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text:
        language === 'hi'
          ? 'नमस्ते! मैं रेलसाथी हूँ। मैं आपकी मुंबई लोकल और नेशनल ट्रेन यात्रा में सहायता कर सकता हूँ।'
          : language === 'mr'
          ? 'नमस्ते! मी रेलसाथी आहे. मी आपल्या उपनगरीय आणि एक्सप्रेस प्रवासासाठी मदत करू शकतो.'
          : 'Namaste! I am RailSathi, your grounded railway assistant. Ask me about suburban trains, fares, delays, or book a specimen ticket.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    async function initSession() {
      try {
        const session = await MobileApiClient.startVoiceSession(language);
        if (session && session.sessionId) {
          setSessionId(session.sessionId);
        }
      } catch {
        setSessionId('LOCAL-SESSION-' + Date.now());
      }
    }
    initSession();
  }, [language]);

  const sendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

    try {
      const activeSession = sessionId || 'LOCAL-SESSION-' + Date.now();
      const res = await MobileApiClient.sendVoiceTurn(activeSession, text, language);

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: res.spokenResponse || res.transcript || 'Understood your query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        booking: res.issuedBooking
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      // Deterministic offline response
      let fallbackText = `Here is the timetable information for "${text}": Check Live tab for current headway and scheduled services.`;
      const q = text.toLowerCase();
      if (q.includes('fare') || q.includes('ac')) {
        fallbackText = 'Official Mumbai Suburban Tariff: Second Class ₹5–₹15, First Class ₹50–₹175, AC Local ₹35–₹180 based on distance slabs.';
      } else if (q.includes('delay') || q.includes('status')) {
        fallbackText = 'Timetable Advisory: Central Line and Western Line operating standard peak/off-peak headway tolerances. Check Live Status tab for block-section observations.';
      }

      const fallbackMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* 1. Header Banner with Voice Call Trigger */}
      <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            RailSathi Conversational Engine
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Grounded multi-turn booking and timetable intelligence
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.voiceCallBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/call')}
          activeOpacity={0.8}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3.5a2 2 0 0 1 2 2 11.36 11.36 0 0 0 .57 3.53 2 2 0 0 1-.45 2.11L8.46 10.9" />
          </Svg>
          <Text style={styles.voiceCallBtnText}>Audio Call</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Quick Action Chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
          {QUICK_ACTIONS.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionChip, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}
              onPress={() => sendMessage(action)}
            >
              <Text style={[styles.actionChipText, { color: colors.textSecondary }]}>{action}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3. Message Stream */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageScroll}
        contentContainerStyle={styles.messageContent}
      >
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.bubble,
                isUser
                  ? [styles.userBubble, { backgroundColor: colors.primary }]
                  : [styles.assistantBubble, { backgroundColor: colors.card, borderColor: colors.cardBorder }]
              ]}
            >
              <Text
                style={[
                  styles.bubbleSender,
                  { color: isUser ? '#e0e7ff' : colors.textMuted }
                ]}
              >
                {isUser ? 'Passenger' : 'RailSathi'} · {msg.timestamp}
              </Text>
              <Text
                style={[
                  styles.bubbleText,
                  { color: isUser ? '#ffffff' : colors.textPrimary }
                ]}
              >
                {msg.text}
              </Text>

              {/* Specimen Ticket Card inside assistant bubble */}
              {msg.booking && (
                <View style={[styles.ticketCard, { borderColor: colors.cardBorder, backgroundColor: colors.background }]}>
                  <View style={styles.ticketHeader}>
                    <Text style={[styles.ticketTitle, { color: colors.primary }]}>SPECIMEN TICKET ISSUED</Text>
                    <Text style={styles.ticketDisclaimer}>[DEMO / NOT VALID FOR TRAVEL]</Text>
                  </View>
                  <Text style={[styles.ticketDetails, { color: colors.textPrimary }]}>
                    PNR: {msg.booking.pnr} · ₹{msg.booking.farePaid} ({msg.booking.classBooked})
                  </Text>
                  <Text style={[styles.ticketRoute, { color: colors.textSecondary }]}>
                    {msg.booking.fromStationName} ➔ {msg.booking.toStationName}
                  </Text>
                  <TouchableOpacity
                    style={[styles.viewWalletBtn, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/(tabs)/tickets')}
                  >
                    <Text style={styles.viewWalletBtnText}>View in Ticket Wallet</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {loading && (
          <View style={[styles.loadingBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Evaluating timetable tools & tariff slabs...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 4. Input Bar */}
      <View style={[styles.inputBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <TextInput
          style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.cardBorder }]}
          placeholder="Ask RailSathi (e.g. Next train to CSMT, fare)..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => sendMessage(inputText)}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: inputText.trim() ? colors.primary : colors.cardBorder }
          ]}
          disabled={!inputText.trim()}
          onPress={() => sendMessage(inputText)}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <Line x1="22" y1="2" x2="11" y2="13" />
            <Path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </Svg>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  headerInfo: {
    flex: 1,
    marginRight: 12
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800'
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2
  },
  voiceCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },
  voiceCallBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  chipsWrapper: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#cbd5e120'
  },
  chipsContainer: {
    paddingHorizontal: 12,
    gap: 8
  },
  actionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '600'
  },
  messageScroll: {
    flex: 1
  },
  messageContent: {
    padding: 16,
    gap: 12
  },
  bubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1
  },
  bubbleSender: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20
  },
  ticketCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  ticketTitle: {
    fontSize: 11,
    fontWeight: '800'
  },
  ticketDisclaimer: {
    fontSize: 9,
    color: '#ef4444',
    fontWeight: '700'
  },
  ticketDetails: {
    fontSize: 12,
    fontWeight: '700'
  },
  ticketRoute: {
    fontSize: 11,
    marginTop: 2
  },
  viewWalletBtn: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center'
  },
  viewWalletBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1
  },
  loadingText: {
    fontSize: 12
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1
  },
  textInput: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
