import { IAIProvider, ChatCompletionOptions, ChatCompletionResult, ProviderHealth } from './types';

export class NvidiaNimProvider implements IAIProvider {
  name = 'nvidia' as const;
  private baseUrl = 'https://integrate.api.nvidia.com/v1';
  private failureCount = 0;
  private circuitOpenUntil = 0;
  private isQuotaExhausted = false;
  private isInvalidKey = false;
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
            ? 'NVIDIA_API_KEY rejected by API (401/403 Unauthorized)'
            : this.isQuotaExhausted
            ? 'Free NVIDIA NIM developer credits exhausted'
            : isCircuitOpen
            ? 'Circuit breaker open due to consecutive failures'
            : 'NVIDIA NIM OpenAI-compatible reasoning endpoint (Evaluation/Demo Tier)')
        : 'NVIDIA_API_KEY not configured'
    };
  }

  /**
   * Validate model availability and account entitlement against NVIDIA NIM endpoint
   */
  async validateModelAvailability(): Promise<{ available: boolean; entitlementStatus: string; latencyMs: number }> {
    if (!this.isConfigured()) {
      return { available: false, entitlementStatus: 'NOT_CONFIGURED', latencyMs: 0 };
    }

    const key = process.env.NVIDIA_API_KEY!.trim();
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

      if (response.status === 402 || response.status === 429) {
        this.isQuotaExhausted = true;
        return { available: false, entitlementStatus: 'QUOTA_EXHAUSTED', latencyMs };
      }

      if (response.ok) {
        const data: any = await response.json();
        const modelsList: Array<{ id: string }> = data?.data || [];
        const isPresent = modelsList.some(m => m.id === model || m.id.includes(model.split('/').pop() || ''));
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
      throw new Error('NVIDIA_NOT_CONFIGURED');
    }

    if (this.isInvalidKey) {
      throw new Error('NVIDIA_INVALID_KEY: Authentication rejected by NVIDIA NIM API.');
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

    // Bounded retry with exponential backoff on transient errors (max 2 attempts)
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
            'Authorization': `Bearer ${key}`,
            'X-Caller-Environment': 'railone-research-demo'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            this.isInvalidKey = true;
            throw new Error(`NVIDIA NIM authentication rejected (HTTP ${response.status}). Key is invalid or lacking entitlement.`);
          }

          if (response.status === 402 || response.status === 429) {
            this.isQuotaExhausted = true;
            throw new Error(`NVIDIA NIM quota limit reached (HTTP ${response.status}). Refusing paid upgrade.`);
          }

          const isTransient = [500, 502, 503, 504].includes(response.status);
          const errText = await response.text().catch(() => '');
          if (isTransient && attempt < maxAttempts) {
            await new Promise(r => setTimeout(r, 300 * attempt));
            continue;
          }
          throw new Error(`NVIDIA NIM API responded with HTTP ${response.status}: ${errText.slice(0, 100)}`);
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
        if (err.message?.includes('HTTP 401') || err.message?.includes('HTTP 403') || err.message?.includes('quota limit')) {
          break; // Do not retry auth or quota errors
        }
        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, 300 * attempt));
        }
      }
    }

    this.failureCount++;
    if (this.failureCount >= this.consecutiveFailureThreshold) {
      this.circuitOpenUntil = Date.now() + this.circuitCooldownMs;
    }
    const sanitized = (lastError?.message || 'Request failed').replace(/[A-Za-z0-9_-]{30,}/g, '[REDACTED_KEY]');
    throw new Error(`NVIDIA NIM call failed: ${sanitized}`);
  }
}
