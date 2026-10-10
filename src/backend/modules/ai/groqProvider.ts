import { IAIProvider, ChatCompletionOptions, ChatCompletionResult, ProviderHealth } from './types';

export class GroqProvider implements IAIProvider {
  name = 'groq' as const;
  private baseUrl = 'https://api.groq.com/openai/v1';
  private failureCount = 0;
  private circuitOpenUntil = 0;
  private isQuotaExhausted = false;
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
      if (this.isQuotaExhausted) {
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
        ? (this.isQuotaExhausted ? 'Groq free tier rate limit exceeded' : 'Groq high-speed LPU inference endpoint')
        : 'GROQ_API_KEY not configured'
    };
  }

  async generateText(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    if (!this.isConfigured()) {
      throw new Error('GROQ_NOT_CONFIGURED');
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
        if (response.status === 429) {
          this.isQuotaExhausted = true;
          throw new Error('Groq rate limit or quota exceeded (HTTP 429)');
        }
        const errText = await response.text().catch(() => '');
        throw new Error(`Groq API responded with HTTP ${response.status}: ${errText.slice(0, 100)}`);
      }

      const json: any = await response.json();
      const content = json?.choices?.[0]?.message?.content || '';

      this.failureCount = 0;
      this.isQuotaExhausted = false;

      return {
        text: content,
        provider: this.name,
        model,
        provenance: 'PREDICTED',
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      this.failureCount++;
      if (this.failureCount >= this.consecutiveFailureThreshold) {
        this.circuitOpenUntil = Date.now() + this.circuitCooldownMs;
      }
      const sanitized = (err?.message || 'Request failed').replace(/[A-Za-z0-9_-]{30,}/g, '[REDACTED_KEY]');
      throw new Error(`Groq call failed: ${sanitized}`);
    }
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
