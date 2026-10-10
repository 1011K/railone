import { IAIProvider, ChatCompletionOptions, ChatCompletionResult, ProviderHealth } from './types';

export class GroqProvider implements IAIProvider {
  name = 'groq' as const;
  private baseUrl = 'https://api.groq.com/openai/v1';
  private failureCount = 0;
  private circuitOpenUntil = 0;
  private isQuotaExhausted = false;
  private isInvalidKey = false;
  private consecutiveFailureThreshold = 3;
  private circuitCooldownMs = 60000;

  isConfigured(): boolean {
    const key = process.env.GROQ_API_KEY?.trim();
    return !!(key && !key.toLowerCase().includes('placeholder') && !key.toLowerCase().includes('my_groq'));
  }

  getModel(): string {
    return process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile';
  }

  getHealth(): ProviderHealth {
    const configured = this.isConfigured();
    const isCircuitOpen = Date.now() < this.circuitOpenUntil;
    let status: ProviderHealth['status'] = 'MISSING';

    if (configured) {
      if (this.isInvalidKey) {
        status = 'INVALID';
      } else if (this.isQuotaExhausted) {
        status = 'QUOTA_EXHAUSTED';
      } else if (isCircuitOpen) {
        status = 'CIRCUIT_OPEN';
      } else {
        status = 'AVAILABLE';
      }
    }

    return {
      name: this.name,
      status,
      configured,
      model: this.getModel(),
      failureCount: this.failureCount,
      circuitOpen: isCircuitOpen,
      notes: configured
        ? (this.isInvalidKey
            ? 'GROQ_API_KEY rejected by Groq API (401/403)'
            : this.isQuotaExhausted
            ? 'Groq free tier rate limit exceeded (HTTP 429)'
            : isCircuitOpen
            ? 'Circuit breaker open due to consecutive failures'
            : 'Groq high-speed LPU inference endpoint')
        : 'GROQ_API_KEY not configured'
    };
  }

  /**
   * Validate model availability and account entitlement against Groq endpoint
   */
  async validateModelAvailability(): Promise<{ available: boolean; entitlementStatus: string; latencyMs: number }> {
    if (!this.isConfigured()) {
      return { available: false, entitlementStatus: 'NOT_CONFIGURED', latencyMs: 0 };
    }

    const key = process.env.GROQ_API_KEY!.trim();
    const model = this.getModel();
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (response.status === 401 || response.status === 403) {
        this.isInvalidKey = true;
        return { available: false, entitlementStatus: 'UNAUTHORIZED_OR_INVALID_KEY', latencyMs };
      }

      if (response.status === 429) {
        this.isQuotaExhausted = true;
        return { available: false, entitlementStatus: 'QUOTA_EXHAUSTED', latencyMs };
      }

      if (response.ok) {
        const data: any = await response.json();
        const modelsList: Array<{ id: string }> = data?.data || [];
        const isPresent = modelsList.some(m => m.id === model || m.id.includes(model));
        this.isInvalidKey = false;
        return {
          available: isPresent || modelsList.length > 0,
          entitlementStatus: isPresent ? 'ENTITLED_MODEL_CONFIRMED' : 'ACTIVE_ACCOUNT_GENERIC_CATALOG',
          latencyMs
        };
      }

      return { available: false, entitlementStatus: `HTTP_${response.status}`, latencyMs };
    } catch (err: any) {
      clearTimeout(timeoutId);
      return { available: false, entitlementStatus: err.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR', latencyMs: Date.now() - startTime };
    }
  }

  async generateText(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    if (!this.isConfigured()) {
      throw new Error('GROQ_NOT_CONFIGURED');
    }

    if (this.isInvalidKey) {
      throw new Error('GROQ_INVALID_KEY: Authentication rejected by Groq API.');
    }

    if (this.isQuotaExhausted) {
      throw new Error('GROQ_QUOTA_EXHAUSTED: Rate limit or free quota exceeded.');
    }

    if (Date.now() < this.circuitOpenUntil) {
      throw new Error('GROQ_CIRCUIT_OPEN');
    }

    const key = process.env.GROQ_API_KEY!.trim();
    const model = this.getModel();
    const timeoutMs = options.timeoutMs || 6000;
    const startTime = Date.now();

    const messages: Array<{ role: string; content: string }> = [];
    if (options.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction });
    }
    for (const msg of options.messages) {
      messages.push({ role: msg.role, content: msg.content });
    }

    const payload: any = {
      model,
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 1024
    };

    if (options.responseMimeType === 'application/json') {
      payload.response_format = { type: 'json_object' };
    }

    let lastError: Error | null = null;
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            this.isInvalidKey = true;
            throw new Error(`Groq authentication rejected (HTTP ${response.status}). Invalid API key.`);
          }

          if (response.status === 429) {
            this.isQuotaExhausted = true;
            throw new Error('Groq rate limit or quota exceeded (HTTP 429)');
          }

          const isTransient = [500, 502, 503, 504].includes(response.status);
          const errText = await response.text().catch(() => '');
          if (isTransient && attempt < maxAttempts) {
            await new Promise(r => setTimeout(r, 250 * attempt));
            continue;
          }
          throw new Error(`Groq API responded with HTTP ${response.status}: ${errText.slice(0, 100)}`);
        }

        const json: any = await response.json();
        const content = json?.choices?.[0]?.message?.content || '';

        this.failureCount = 0;
        this.isQuotaExhausted = false;
        this.isInvalidKey = false;

        return {
          text: content,
          provider: this.name,
          model,
          provenance: 'PREDICTED',
          latencyMs: Date.now() - startTime
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;
        if (err.message?.includes('HTTP 401') || err.message?.includes('HTTP 403') || err.message?.includes('429')) {
          break;
        }
        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, 250 * attempt));
        }
      }
    }

    this.failureCount++;
    if (this.failureCount >= this.consecutiveFailureThreshold) {
      this.circuitOpenUntil = Date.now() + this.circuitCooldownMs;
    }
    const sanitized = (lastError?.message || 'Request failed').replace(/[A-Za-z0-9_-]{30,}/g, '[REDACTED_KEY]');
    throw new Error(`Groq call failed: ${sanitized}`);
  }

  /**
   * Optional Groq audio transcription using Whisper
   */
  async transcribeAudio(audioBuffer: Buffer, mimeType = 'audio/wav'): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('GROQ_NOT_CONFIGURED');
    }

    const key = process.env.GROQ_API_KEY!.trim();
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
    formData.append('file', blob, 'audio.wav');
    formData.append('model', 'whisper-large-v3');
    formData.append('response_format', 'json');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`Groq Whisper failed with HTTP ${response.status}`);
      }
      const data: any = await response.json();
      return data.text || '';
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw new Error(`Groq Whisper transcription failed: ${err.message}`);
    }
  }
}
