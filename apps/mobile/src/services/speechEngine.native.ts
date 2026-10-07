/**
 * Speech Synthesis Engine for Native React Native (iOS & Android)
 * Integrates directly with expo-speech for native OS voice synthesis.
 */

import * as Speech from 'expo-speech';
import { SpeechEngineInterface } from './speechEngine';

class NativeExpoSpeechEngine implements SpeechEngineInterface {
  public engineName = 'ExpoSpeechNative';

  speak(text: string, options: { language: string; onDone: () => void; onError?: () => void }): void {
    const langCode = options.language === 'hi' ? 'hi-IN' : options.language === 'mr' ? 'mr-IN' : 'en-IN';
    
    // Stop any ongoing speech before speaking
    Speech.stop();

    Speech.speak(text, {
      language: langCode,
      pitch: 1.0,
      rate: 0.95,
      onDone: () => options.onDone(),
      onError: () => options.onError ? options.onError() : options.onDone()
    });
  }

  stop(): void {
    Speech.stop();
  }

  isAvailable(): boolean {
    return true;
  }
}

export const speechEngine: SpeechEngineInterface = new NativeExpoSpeechEngine();
