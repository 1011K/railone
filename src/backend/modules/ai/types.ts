/**
 * Unified AI Provider System Types
 * RailOne Next — Zero Data Fabrication & Modular Free Tier
 */

export type AiProviderName = 'gemini' | 'nvidia' | 'groq' | 'deterministic';

export type CredentialState = 'AVAILABLE' | 'MISSING' | 'INVALID' | 'NOT_TESTED' | 'QUOTA_EXHAUSTED' | 'CIRCUIT_OPEN';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  responseMimeType?: 'text/plain' | 'application/json';
  systemInstruction?: string;
  timeoutMs?: number;
  latencySensitive?: boolean;
}

export interface ChatCompletionResult {
  text: string;
  provider: AiProviderName;
  model: string;
  provenance: 'PREDICTED' | 'DEMO' | 'SCHEDULED';
  latencyMs: number;
}

export interface ProviderHealth {
  name: AiProviderName;
  status: CredentialState;
  configured: boolean;
  model: string;
  failureCount: number;
  circuitOpen: boolean;
  notes: string;
}

export interface IAIProvider {
  name: AiProviderName;
  isConfigured(): boolean;
  getModel(): string;
  getHealth(): ProviderHealth;
  generateText(options: ChatCompletionOptions): Promise<ChatCompletionResult>;
  validateModelAvailability?(): Promise<{ available: boolean; entitlementStatus: string; latencyMs: number }>;
}
