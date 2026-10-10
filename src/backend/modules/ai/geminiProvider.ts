import { GoogleGenAI } from '@google/genai';
import { IAIProvider, ChatCompletionOptions, ChatCompletionResult, ProviderHealth } from './types';

export class GeminiProvider implements IAIProvider {
  name = 'gemini' as const;
  private client: GoogleGenAI | null = null;
  private failureCount = 0;
  private lastFailureTime = 0;
  private circuitOpenUntil = 0;
  private consecutiveFailureThreshold = 3;
  private circuitCooldownMs = 60000;

  constructor() {
    this.initClient();
  }

  private initClient(): void {
    const key = process.env.GEMINI_API_KEY?.trim();
    if (key && key !== 'MY_GEMINI_API_KEY' && !key.toLowerCase().includes('placeholder')) {
      try {
        this.client = new GoogleGenAI({ apiKey: key });
      } catch {
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  isConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY?.trim();
    return !!(key && key !== 'MY_GEMINI_API_KEY' && !key.toLowerCase().includes('placeholder'));
  }

  getModel(): string {
    return process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
  }

  getHealth(): ProviderHealth {
    const configured = this.isConfigured();
    const isCircuitOpen = Date.now() < this.circuitOpenUntil;
    return {
      name: this.name,
      status: !configured ? 'MISSING' : isCircuitOpen ? 'CIRCUIT_OPEN' : 'AVAILABLE',
      configured,
      model: this.getModel(),
      failureCount: this.failureCount,
      circuitOpen: isCircuitOpen,
      notes: configured
        ? (isCircuitOpen ? 'Circuit breaker open due to consecutive failures' : 'Primary Google AI Studio provider')
        : 'GEMINI_API_KEY missing or placeholder'
    };
  }

  async generateText(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    if (!this.isConfigured()) {
      throw new Error('GEMINI_NOT_CONFIGURED');
    }

    if (Date.now() < this.circuitOpenUntil) {
      throw new Error('GEMINI_CIRCUIT_OPEN');
    }

    if (!this.client) {
      this.initClient();
    }
    if (!this.client) {
      throw new Error('GEMINI_INIT_FAILED');
    }

    const startTime = Date.now();
    const timeoutMs = options.timeoutMs || 8000;
    const model = this.getModel();

    try {
      // Format messages into Google GenAI contents
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      for (const msg of options.messages) {
        if (msg.role === 'system') {
          // System instructions are passed via config
          continue;
        }
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }

      if (contents.length === 0) {
        contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
      }

      // Add timeout race
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), timeoutMs);
      });

      const config: any = {
        temperature: options.temperature ?? 0.2
      };
      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }
      if (options.responseMimeType) {
        config.responseMimeType = options.responseMimeType;
      }

      const apiCall = this.client.models.generateContent({
        model,
        contents,
        config
      });

      const response: any = await Promise.race([apiCall, timeoutPromise]);
      const responseText = response?.text || '';

      // Reset failure count on success
      this.failureCount = 0;

      return {
        text: responseText,
        provider: this.name,
        model,
        provenance: 'PREDICTED',
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      if (this.failureCount >= this.consecutiveFailureThreshold) {
        this.circuitOpenUntil = Date.now() + this.circuitCooldownMs;
      }
      // Never expose API key in error message
      const sanitizedMsg = (err?.message || 'Unknown error').replace(/[A-Za-z0-9_-]{30,}/g, '[REDACTED_KEY]');
      throw new Error(`Gemini request failed: ${sanitizedMsg}`);
    }
  }
}
