import { IAIProvider, ChatCompletionOptions, ChatCompletionResult, ProviderHealth } from './types';

export class NvidiaNimProvider implements IAIProvider {
  name = 'nvidia' as const;
  private baseUrl = 'https://integrate.api.nvidia.com/v1';
  private failureCount = 0;
  private circuitOpenUntil = 0;
  private isQuotaExhausted = false;
  private consecutiveFailureThreshold = 3;
  private circuitCooldownMs = 60000;

  isConfigured(): boolean {
    const key = process.env.NVIDIA_API_KEY?.trim();
    return !!(key && !key.toLowerCase().includes('placeholder') && !key.toLowerCase().includes('my_nvidia'));
  }

  getModel(): string {
    return process.env.NVIDIA_MODEL?.trim() || 'meta/llama-3.3-70b-instruct';
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
        ? (this.isQuotaExhausted ? 'Free NVIDIA NIM developer credits exhausted' : 'NVIDIA NIM OpenAI-compatible reasoning endpoint')
        : 'NVIDIA_API_KEY not configured'
    };
  }

  async generateText(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    if (!this.isConfigured()) {
      throw new Error('NVIDIA_NOT_CONFIGURED');
    }

    if (this.isQuotaExhausted) {
      throw new Error('NVIDIA_QUOTA_EXHAUSTED: Free developer credits exhausted. Auto-switching to paid is strictly disabled.');
    }

    if (Date.now() < this.circuitOpenUntil) {
      throw new Error('NVIDIA_CIRCUIT_OPEN');
    }

    const key = process.env.NVIDIA_API_KEY!.trim();
    const model = this.getModel();
    const timeoutMs = options.timeoutMs || 8000;
    const startTime = Date.now();

    // Prepare OpenAI-compatible messages
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
        if (response.status === 402 || response.status === 429) {
          this.isQuotaExhausted = true;
          throw new Error(`NVIDIA NIM quota limit reached (HTTP ${response.status}). Refusing paid upgrade.`);
        }
        const errText = await response.text().catch(() => '');
        throw new Error(`NVIDIA NIM API responded with HTTP ${response.status}: ${errText.slice(0, 100)}`);
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
      throw new Error(`NVIDIA NIM call failed: ${sanitized}`);
    }
  }
}
