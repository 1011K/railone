import { MobileApiClient } from '../api/client';

export type VoiceCallState =
  | 'IDLE'
  | 'CONNECTING'
  | 'LISTENING'
  | 'PROCESSING'
  | 'SPEAKING'
  | 'AWAITING_CONFIRMATION'
  | 'ENDED';

export interface VoiceCallTurn {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export class NativeVoiceService {
  private sessionId: string | null = null;
  private language: 'en' | 'hi' | 'mr' = 'en';
  private state: VoiceCallState = 'IDLE';
  private turns: VoiceCallTurn[] = [];
  private onStateChange: (state: VoiceCallState) => void = () => {};
  private onTurn: (turn: VoiceCallTurn) => void = () => {};
  private onBookingConfirmed: (booking: any) => void = () => {};
  private durationSeconds = 0;
  private durationTimer: any = null;

  constructor(language: 'en' | 'hi' | 'mr' = 'en') {
    this.language = language;
  }

  setCallbacks(callbacks: {
    onStateChange: (state: VoiceCallState) => void;
    onTurn: (turn: VoiceCallTurn) => void;
    onBookingConfirmed?: (booking: any) => void;
  }) {
    this.onStateChange = callbacks.onStateChange;
    this.onTurn = callbacks.onTurn;
    if (callbacks.onBookingConfirmed) {
      this.onBookingConfirmed = callbacks.onBookingConfirmed;
    }
  }

  async startCall(): Promise<void> {
    this.setState('CONNECTING');
    try {
      const session = await MobileApiClient.startVoiceSession(this.language);
      this.sessionId = session.sessionId;

      const initialTurn: VoiceCallTurn = {
        role: 'assistant',
        text: session.turns[0]?.content || 'Namaste! How can I help you travel today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      this.turns = [initialTurn];
      this.onTurn(initialTurn);

      this.startDurationTimer();
      this.speakText(initialTurn.text, () => {
        this.setState('LISTENING');
      });
    } catch (err) {
      // Fallback local greeting if offline
      this.sessionId = 'LOCAL-VOICE-' + Date.now();
      const localGreeting: VoiceCallTurn = {
        role: 'assistant',
        text: 'Namaste! RailSathi is listening. Where would you like to travel today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      this.turns = [localGreeting];
      this.onTurn(localGreeting);
      this.startDurationTimer();
      this.setState('LISTENING');
    }
  }

  async sendUserUtterance(text: string): Promise<void> {
    if (!text || !text.trim() || !this.sessionId) return;

    const userTurn: VoiceCallTurn = {
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.turns.push(userTurn);
    this.onTurn(userTurn);

    this.setState('PROCESSING');

    try {
      const response = await MobileApiClient.sendVoiceTurn(this.sessionId, text.trim(), this.language);

      const assistantTurn: VoiceCallTurn = {
        role: 'assistant',
        text: response.spokenResponse || response.transcript,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      this.turns.push(assistantTurn);
      this.onTurn(assistantTurn);

      if (response.issuedBooking) {
        this.onBookingConfirmed(response.issuedBooking);
      }

      this.speakText(assistantTurn.text, () => {
        if (response.state === 'AWAITING_CONFIRMATION') {
          this.setState('AWAITING_CONFIRMATION');
        } else if (response.state === 'BOOKING_EXECUTED') {
          this.setState('SPEAKING');
        } else {
          this.setState('LISTENING');
        }
      });
    } catch (err: any) {
      const errorTurn: VoiceCallTurn = {
        role: 'assistant',
        text: `Sorry, network error: ${err.message}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      this.turns.push(errorTurn);
      this.onTurn(errorTurn);
      this.setState('LISTENING');
    }
  }

  async sendUtterance(text: string): Promise<void> {
    return this.sendUserUtterance(text);
  }

  endCall(): void {
    this.stopDurationTimer();
    this.setState('ENDED');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  private speakText(text: string, onEnd: () => void): void {
    this.setState('SPEAKING');

    // Use Web Speech Synthesis API if available (in browser, WebView, or native speech engine)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.language === 'hi' ? 'hi-IN' : this.language === 'mr' ? 'mr-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.onend = () => {
        onEnd();
      };
      utterance.onerror = () => {
        onEnd();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      // In headless or mock environment, simulate speech delay
      setTimeout(onEnd, 1200);
    }
  }

  private startDurationTimer(): void {
    this.durationSeconds = 0;
    this.durationTimer = setInterval(() => {
      this.durationSeconds += 1;
    }, 1000);
  }

  private stopDurationTimer(): void {
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }
  }

  getDurationFormatted(): string {
    const mins = Math.floor(this.durationSeconds / 60);
    const secs = this.durationSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private setState(state: VoiceCallState): void {
    this.state = state;
    this.onStateChange(state);
  }

  getState(): VoiceCallState {
    return this.state;
  }
}
