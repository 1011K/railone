/**
 * Speech Synthesis Engine for Web & Node test environments
 */

export interface SpeechEngineInterface {
  speak(text: string, options: { language: string; onDone: () => void; onError?: () => void }): void;
  stop(): void;
  isAvailable(): boolean;
  engineName: string;
}

class WebSpeechEngine implements SpeechEngineInterface {
  public engineName = typeof window !== 'undefined' && 'speechSynthesis' in window ? 'WebSpeech' : 'SimulationFallback';
  private fallbackTimer: any = null;

  speak(text: string, options: { language: string; onDone: () => void; onError?: () => void }): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.language === 'hi' ? 'hi-IN' : options.language === 'mr' ? 'mr-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.onend = () => options.onDone();
      utterance.onerror = () => options.onError ? options.onError() : options.onDone();
      window.speechSynthesis.speak(utterance);
    } else {
      // Node/Headless fallback timer
      if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
      this.fallbackTimer = setTimeout(() => {
        this.fallbackTimer = null;
        options.onDone();
      }, 800);
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
