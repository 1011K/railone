import {
  AiProviderName,
  ChatCompletionOptions,
  ChatCompletionResult,
  ProviderHealth,
  IAIProvider
} from './types';
import { GeminiProvider } from './geminiProvider';
import { NvidiaNimProvider } from './nvidiaNimProvider';
import { GroqProvider } from './groqProvider';
import { DeterministicProvider } from './deterministicProvider';

export class AiProviderRouter {
  private static instance: AiProviderRouter;

  private gemini: GeminiProvider;
  private nvidia: NvidiaNimProvider;
  private groq: GroqProvider;
  private deterministic: DeterministicProvider;

  private constructor() {
    this.gemini = new GeminiProvider();
    this.nvidia = new NvidiaNimProvider();
    this.groq = new GroqProvider();
    this.deterministic = new DeterministicProvider();
  }

  public static getInstance(): AiProviderRouter {
    if (!AiProviderRouter.instance) {
      AiProviderRouter.instance = new AiProviderRouter();
    }
    return AiProviderRouter.instance;
  }

  /**
   * Check feature flags for AI providers
   */
  public isAiGloballyEnabled(): boolean {
    const val = process.env.AI_ENABLED?.toLowerCase().trim();
    return val !== 'false' && val !== '0' && val !== 'no';
  }

  public isProviderEnabled(name: AiProviderName): boolean {
    if (!this.isAiGloballyEnabled() && name !== 'deterministic') return false;

    switch (name) {
      case 'gemini': {
        const val = process.env.ENABLE_GEMINI?.toLowerCase().trim();
        return val !== 'false' && val !== '0';
      }
      case 'nvidia': {
        const val = process.env.ENABLE_NVIDIA_NIM?.toLowerCase().trim();
        return val !== 'false' && val !== '0';
      }
      case 'groq': {
        const val = process.env.ENABLE_GROQ?.toLowerCase().trim();
        return val !== 'false' && val !== '0';
      }
      case 'deterministic':
      default:
        return true;
    }
  }

  /**
   * Get all provider health states and readiness
   */
  public getProvidersHealth(): ProviderHealth[] {
    const geminiHealth = this.gemini.getHealth();
    if (!this.isProviderEnabled('gemini') && geminiHealth.configured) {
      geminiHealth.notes += ' [DISABLED_BY_FEATURE_FLAG: ENABLE_GEMINI=false]';
    }

    const nvidiaHealth = this.nvidia.getHealth();
    if (!this.isProviderEnabled('nvidia') && nvidiaHealth.configured) {
      nvidiaHealth.notes += ' [DISABLED_BY_FEATURE_FLAG: ENABLE_NVIDIA_NIM=false]';
    }

    const groqHealth = this.groq.getHealth();
    if (!this.isProviderEnabled('groq') && groqHealth.configured) {
      groqHealth.notes += ' [DISABLED_BY_FEATURE_FLAG: ENABLE_GROQ=false]';
    }

    return [
      geminiHealth,
      nvidiaHealth,
      groqHealth,
      this.deterministic.getHealth()
    ];
  }

  public getProvider(name: AiProviderName): IAIProvider {
    switch (name) {
      case 'gemini': return this.gemini;
      case 'nvidia': return this.nvidia;
      case 'groq': return this.groq;
      case 'deterministic':
      default:
        return this.deterministic;
    }
  }

  /**
   * Generate text using the preferred provider or optimal fallback order.
   * Honors feature flags and latency sensitivity.
   * Never fans out duplicate requests across providers simultaneously.
   */
  public async generateChat(
    options: ChatCompletionOptions,
    preferred?: AiProviderName
  ): Promise<ChatCompletionResult> {
    const candidateOrder: IAIProvider[] = [];

    // Global kill-switch check
    if (!this.isAiGloballyEnabled()) {
      return this.deterministic.generateText(options);
    }

    if (preferred === 'deterministic') {
      candidateOrder.push(this.deterministic);
    } else {
      if (preferred && this.isProviderEnabled(preferred)) {
        candidateOrder.push(this.getProvider(preferred));
      }

      // If latency-sensitive inference requested, prioritize Groq LPU
      if (options.latencySensitive && this.groq.isConfigured() && this.isProviderEnabled('groq')) {
        if (!candidateOrder.includes(this.groq)) candidateOrder.push(this.groq);
      }

      // Default priority order: Gemini -> Nvidia NIM -> Groq -> Deterministic
      if (this.gemini.isConfigured() && this.isProviderEnabled('gemini') && !candidateOrder.includes(this.gemini)) {
        candidateOrder.push(this.gemini);
      }
      if (this.nvidia.isConfigured() && this.isProviderEnabled('nvidia') && !candidateOrder.includes(this.nvidia)) {
        candidateOrder.push(this.nvidia);
      }
      if (this.groq.isConfigured() && this.isProviderEnabled('groq') && !candidateOrder.includes(this.groq)) {
        candidateOrder.push(this.groq);
      }
      // Guaranteed deterministic fallback
      candidateOrder.push(this.deterministic);
    }

    let lastError: Error | null = null;
    for (const provider of candidateOrder) {
      try {
        const health = provider.getHealth();
        if (health.circuitOpen || health.status === 'QUOTA_EXHAUSTED' || health.status === 'INVALID') {
          continue;
        }

        const result = await provider.generateText(options);
        return result;
      } catch (err: any) {
        lastError = err;
        // Proceed to next fallback provider
      }
    }

    // Guaranteed deterministic fallback if all external calls threw
    return this.deterministic.generateText(options);
  }

  /**
   * Decompose natural language travel query into validated commuter tasks
   */
  public async decomposeTasks(
    prompt: string,
    context?: string,
    preferred?: AiProviderName
  ): Promise<{ tasks: any[]; source: string; provenance: string; feedStatusNotice?: string }> {
    const trimmed = (prompt || '').trim();
    if (!trimmed) {
      const fallback = await this.deterministic.generateText({
        messages: [{ role: 'user', content: 'default commute' }],
        responseMimeType: 'application/json'
      });
      return {
        tasks: JSON.parse(fallback.text),
        source: 'deterministic_fallback',
        provenance: 'DEMO',
        feedStatusNotice: 'Prompt empty. Showing scheduled/demo baseline.'
      };
    }

    const systemInstruction = `
You are an expert Indian Railways & Mumbai Suburban operations planner for RailOne Next.
Decompose the user's journey or travel situation into 2 to 4 prioritized, actionable commuter tasks.
Available Categories strictly one of:
- DISRUPTION_RECOVERY (Signal bunching, slow line diversion, delay inversion)
- JOURNEY_PLANNING (Leave-home window, platform transfer buffer, timetable check)
- BOOKING_TICKETING (UTS QR specimen, season ticket MST check, counter bypass)
- GRIEVANCE_RAILMADAD (Coach AC failure, cleanliness, security request)
- SAFETY_LOST_FOUND (RPF 139 SOS, ladies special alignment, lost baggage)
- STATION_AMENITIES (Escalator, wheelchair ramp, waiting room, cloakroom)
- COACH_POSITIONING (Luggage coach, handicap coach, ladies compartment position)
- CREW_OPERATIONS (Sectional clearance, motorman guard handover)

Available Priorities strictly one of:
- P0_CRITICAL (Immediate 0-5 min action / missed connection / signal freeze)
- P1_HIGH (Time-sensitive <30 min / leave home / platform change)
- P2_MEDIUM (Preparation today / ticket verification / coach position)
- P3_LOW (Post-journey feedback / amenity check)

Return ONLY valid JSON array of objects with keys:
"title" (string, max 8 words),
"description" (string, 1-2 sentences),
"category" (one of the 8 categories),
"priority" (one of the 4 priorities),
"dueTime" (optional string, e.g. "10:48" or "Immediate"),
"associatedTrain" (optional string, e.g. "95112" or "12123"),
"stationCode" (optional string, e.g. "DR" or "TNA")
`;

    try {
      const completion = await this.generateChat({
        messages: [
          { role: 'user', content: `Travel query: "${trimmed}". Context: "${context || 'mumbai suburban'}"` }
        ],
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2
      }, preferred);

      // Validate JSON schema
      const cleaned = completion.text.trim().replace(/^```json|^```|```$/g, '').trim();
      const parsed = JSON.parse(cleaned);

      // Normalize array if wrapped in object (e.g. { tasks: [...] } or { data: [...] })
      const taskArray = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.tasks)
        ? parsed.tasks
        : Array.isArray(parsed?.data)
        ? parsed.data
        : null;

      if (taskArray && taskArray.length >= 2) {
        const validCategories = new Set([
          'DISRUPTION_RECOVERY', 'JOURNEY_PLANNING', 'BOOKING_TICKETING', 'GRIEVANCE_RAILMADAD',
          'SAFETY_LOST_FOUND', 'STATION_AMENITIES', 'COACH_POSITIONING', 'CREW_OPERATIONS'
        ]);
        const validPriorities = new Set(['P0_CRITICAL', 'P1_HIGH', 'P2_MEDIUM', 'P3_LOW']);

        const validatedTasks = taskArray.map((t: any) => ({
          title: String(t.title || 'Commuter Action').slice(0, 80),
          description: String(t.description || '').slice(0, 300),
          category: validCategories.has(t.category) ? t.category : 'JOURNEY_PLANNING',
          priority: validPriorities.has(t.priority) ? t.priority : 'P1_HIGH',
          dueTime: t.dueTime ? String(t.dueTime).slice(0, 20) : undefined,
          associatedTrain: t.associatedTrain ? String(t.associatedTrain).slice(0, 10) : undefined,
          stationCode: t.stationCode ? String(t.stationCode).slice(0, 10) : undefined
        }));

        return {
          tasks: validatedTasks,
          source: completion.provider,
          provenance: completion.provenance
        };
      }
    } catch {
      // JSON validation error or network error -> proceed to fallback
    }

    // Deterministic Domain Fallback
    const fallback = await this.deterministic.generateText({
      messages: [{ role: 'user', content: trimmed }],
      responseMimeType: 'application/json'
    });
    return {
      tasks: JSON.parse(fallback.text),
      source: 'deterministic_fallback',
      provenance: 'DEMO',
      feedStatusNotice: 'Operational feed unavailable. Showing scheduled/demo information only.'
    };
  }

  /**
   * Ask Copilot with conversational grounding
   */
  public async askCopilot(
    query: string,
    history: Array<{ role: 'user' | 'assistant'; text: string }> = [],
    preferred?: AiProviderName
  ): Promise<{ reply: string; source: string; provenance: string; feedStatusNotice?: string }> {
    const trimmed = (query || '').trim();
    if (!trimmed) {
      const fallback = await this.deterministic.generateText({
        messages: [{ role: 'user', content: 'help' }]
      });
      return {
        reply: fallback.text,
        source: 'deterministic_fallback',
        provenance: 'DEMO',
        feedStatusNotice: 'Operational feed unavailable. Showing scheduled/demo information only.'
      };
    }

    const systemInstruction = `
You are the RailOne Next AI Travel Copilot for Indian Railways & Mumbai Suburban commuters.
You provide honest, highly knowledgeable advice on:
- Fast vs Slow local delay inversions (when a slow train beats a bunched fast train)
- Transfer buffers at major junctions like Dadar (7 min walk between CR Platform 8 and WR Platform 1)
- Legal boarding constraints (Section 138, MST season pass restrictions on Mail/Express trains like Deccan Queen)
- AC Local tariffs, crowds (morning peak 8:30-11:30 Southbound, evening peak Northbound)
- Specimen booking simulations and RailMadad grievance procedures.
Always be direct, empathetic, and specify actionable platform numbers and timings.
Never fabricate live train running times or CRIS official seat inventory.
`;

    const messages = history.map(h => ({
      role: h.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: h.text
    }));
    messages.push({ role: 'user' as const, content: trimmed });

    try {
      const completion = await this.generateChat({
        messages,
        systemInstruction,
        temperature: 0.3
      }, preferred);

      if (completion.text && completion.text.trim().length > 10) {
        return {
          reply: completion.text,
          source: completion.provider,
          provenance: completion.provenance
        };
      }
    } catch {
      // Handled by fallback
    }

    const fallback = await this.deterministic.generateText({
      messages: [{ role: 'user', content: trimmed }]
    });
    return {
      reply: fallback.text,
      source: 'deterministic_fallback',
      provenance: 'DEMO',
      feedStatusNotice: 'Operational feed unavailable. Showing scheduled/demo information only.'
    };
  }

  /**
   * Draft RailMadad complaint
   */
  public async draftGrievance(
    complaintType: string,
    trainNumber: string,
    coachNumber: string,
    description: string,
    preferred?: AiProviderName
  ): Promise<{ draft: string; source: string; provenance: string }> {
    const systemInstruction = `
You are the RailMadad grievance drafting assistant for Indian Railways passengers.
Draft a formal, concise, and structured complaint following official railway grievance standards.
Clearly label as a passenger draft template [DEMO / NOT SUBMITTED TO RAILMADAD].
Never claim to have directly submitted this to CRIS or Indian Railways servers.
`;

    try {
      const completion = await this.generateChat({
        messages: [{
          role: 'user',
          content: `RailMadad Grievance Complaint: Issue: ${complaintType}, Train: ${trainNumber}, Coach: ${coachNumber}, Details: ${description || 'Not provided'}`
        }],
        systemInstruction,
        temperature: 0.3
      }, preferred);

      if (completion.text && completion.text.trim().length > 20) {
        return {
          draft: completion.text,
          source: completion.provider,
          provenance: completion.provenance
        };
      }
    } catch {
      // Fallback
    }

    const fallback = await this.deterministic.generateText({
      messages: [{
        role: 'user',
        content: `grievance complaintType=${complaintType} trainNumber=${trainNumber} coachNumber=${coachNumber} description=${description}`
      }]
    });
    return {
      draft: fallback.text,
      source: 'deterministic_fallback',
      provenance: 'DEMO'
    };
  }
}
