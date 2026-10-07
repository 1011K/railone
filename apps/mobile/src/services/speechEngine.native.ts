/**
 * Speech Synthesis Engine for Native React Native (iOS & Android)
 * Integrates directly with expo-speech for native OS voice synthesis.
 */

import * as Speech from 'expo-speech';
import { SpeechEngineInterface, SpeechFallbackHandler, SpeechEngineStatus } from './speechEngine';

class NativeExpoSpeechEngine implements SpeechEngineInterface {
  public engineName = 'ExpoSpeechNative';
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
    const langCode = options.language === 'hi' ? 'hi-IN' : options.language === 'mr' ? 'mr-IN' : 'en-IN';
    
    // Stop any ongoing speech before speaking
    Speech.stop();

    try {
      Speech.speak(text, {
        language: langCode,
        pitch: 1.0,
        rate: 0.95,
        onDone: () => options.onDone(),
        onError: (err: any) => {
          this.lastError = typeof err === 'string' ? err : 'ExpoSpeechNativeError';
          this.fallbackTriggeredCount++;
          if (this.fallbackHandler) {
            this.fallbackHandler(text, options);
          } else if (options.onError) {
            options.onError();
          } else {
            options.onDone();
          }
        }
      });
    } catch (err: any) {
      this.lastError = err?.message || 'ExpoSpeechException';
      this.fallbackTriggeredCount++;
      if (this.fallbackHandler) {
        this.fallbackHandler(text, options);
      } else if (options.onError) {
        options.onError();
      } else {
        options.onDone();
      }
    }
  }

  stop(): void {
    Speech.stop();
  }

  isAvailable(): boolean {
    return true;
  }
}

export const speechEngine: SpeechEngineInterface = new NativeExpoSpeechEngine();
