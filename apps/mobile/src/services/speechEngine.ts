/**
 * Speech Synthesis Engine for Web & Node test environments
 */

export interface SpeechEngineStatus {
  engineName: string;
  isAvailable: boolean;
  hasFallbackHandler: boolean;
  fallbackTriggeredCount: number;
  lastError?: string;
}

export type SpeechFallbackHandler = (
  text: string,
  options: { language: string; onDone: () => void; onError?: () => void }
) => void;

export interface SpeechEngineInterface {
  speak(text: string, options: { language: string; onDone: () => void; onError?: () => void }): void;
  stop(): void;
  isAvailable(): boolean;
  engineName: string;
  registerFallbackHandler?(handler: SpeechFallbackHandler): void;
  getEngineStatus?(): SpeechEngineStatus;
}

class WebSpeechEngine implements SpeechEngineInterface {
  public engineName = typeof window !== 'undefined' && 'speechSynthesis' in window ? 'WebSpeech' : 'SimulationFallback';
  private fallbackTimer: any = null;
  private fallbackHandler?: SpeechFallbackHandler;
  private fallbackTriggeredCount = 0;
  private lastError?: string;

  registerFallbackHandler(handler: SpeechFallbackHandler): void {
    this.fallbackHandler = handler;
  }

  getEngineStatus(): SpeechEngineStatus {
    return {
      engineName: this.engineName,
      isAvailable: this.isAvailable(),
      hasFallbackHandler: Boolean(this.fallbackHandler),
      fallbackTriggeredCount: this.fallbackTriggeredCount,
      lastError: this.lastError
    };
  }

  speak(text: string, options: { language: string; onDone: () => void; onError?: () => void }): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.language === 'hi' ? 'hi-IN' : options.language === 'mr' ? 'mr-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.onend = () => options.onDone();
      utterance.onerror = (e: any) => {
        this.lastError = e?.error || 'SpeechSynthesisError';
        this.fallbackTriggeredCount++;
        if (this.fallbackHandler) {
          this.fallbackHandler(text, options);
        } else if (options.onError) {
          options.onError();
        } else {
          options.onDone();
        }
      };
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err: any) {
        this.lastError = err?.message || 'SpeechSynthesisException';
        this.fallbackTriggeredCount++;
        if (this.fallbackHandler) {
          this.fallbackHandler(text, options);
        } else if (options.onError) {
          options.onError();
        } else {
          options.onDone();
        }
      }
    } else {
      // Node/Headless fallback timer or registered custom handler
      this.fallbackTriggeredCount++;
      if (this.fallbackHandler) {
        this.fallbackHandler(text, options);
      } else {
        if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
        this.fallbackTimer = setTimeout(() => {
          this.fallbackTimer = null;
          options.onDone();
        }, 800);
      }
    }
  }

  stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

export const speechEngine: SpeechEngineInterface = new WebSpeechEngine();
