import { IAIProvider, ChatCompletionOptions, ChatCompletionResult, ProviderHealth } from './types';

export class DeterministicProvider implements IAIProvider {
  name = 'deterministic' as const;

  isConfigured(): boolean {
    return true;
  }

  getModel(): string {
    return 'railone-deterministic-v4';
  }

  getHealth(): ProviderHealth {
    return {
      name: this.name,
      status: 'AVAILABLE',
      configured: true,
      model: this.getModel(),
      failureCount: 0,
      circuitOpen: false,
      notes: 'Deterministic rule-based railway domain engine (always available, offline-safe)'
    };
  }

  async generateText(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    const startTime = Date.now();
    const prompt = options.messages.map(m => m.content).join(' ').toLowerCase();

    // If json requested (e.g. decompose endpoint)
    if (options.responseMimeType === 'application/json') {
      const tasks = this.generateDeterministicTasks(prompt);
      return {
        text: JSON.stringify(tasks),
        provider: this.name,
        model: this.getModel(),
        provenance: 'DEMO',
        latencyMs: Date.now() - startTime
      };
    }

    // Freeform text response (copilot or grievance)
    let reply = '';
    if (prompt.includes('railmadad') || prompt.includes('grievance') || prompt.includes('complaint') || prompt.includes('issue:') || prompt.includes('failure')) {
      reply = this.generateGrievanceDraft(prompt);
    } else {
      reply = this.generateCopilotReply(prompt);
    }

    return {
      text: reply,
      provider: this.name,
      model: this.getModel(),
      provenance: 'DEMO',
      latencyMs: Date.now() - startTime
    };
  }

  private generateDeterministicTasks(prompt: string): any[] {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tasks: any[] = [];

    if (prompt.includes('delay') || prompt.includes('signal') || prompt.includes('late') || prompt.includes('crowd')) {
      tasks.push({
        title: 'Delay Inversion Rule [TIMETABLE MODEL]',
        description: 'Live operational feed unavailable. When fast lines encounter congestion, slow local corridors often provide faster transfers according to timetable models.',
        category: 'DISRUPTION_RECOVERY',
        priority: 'P0_CRITICAL',
        dueTime: 'Immediate',
        stationCode: 'CLA'
      });
    }

    tasks.push({
      title: 'Scheduled Leave-Home Buffer Advisory',
      description: 'Allow standard walking buffer before scheduled departure. Verify platform headway indicators before departing origin.',
      category: 'JOURNEY_PLANNING',
      priority: 'P1_HIGH',
      dueTime: now,
      stationCode: 'TNA'
    });

    tasks.push({
      title: 'Pre-book Specimen UTS QR Ticket',
      description: 'Generate educational specimen ticket with test QR code for practice validation [DEMO].',
      category: 'BOOKING_TICKETING',
      priority: 'P2_MEDIUM',
      stationCode: 'DR'
    });

    return tasks;
  }

  private generateCopilotReply(prompt: string): string {
    let reply = `Namaste! Operational feed unavailable. Showing scheduled/demo information only [TIMETABLE MODEL]:\n\n`;
    if (prompt.includes('dadar') && (prompt.includes('churchgate') || prompt.includes('western') || prompt.includes('central') || prompt.includes('transfer'))) {
      reply += `If transferring between Central and Western lines via Dadar, alight at Dadar CR Platform 6/7, take the northern Foot Overbridge (FOB) across to Western Railway Platform 1/2. Allow at least 7 minutes walking buffer. An AC Fast Local is scheduled every 20-30 minutes.`;
    } else if (prompt.includes('ac') || prompt.includes('fare')) {
      reply += `Suburban AC Local fare for Thane to Dadar is ₹95 (Single Journey), compared to ₹10 for Second Class and ₹105 for First Class. Ordinary First Class season passes are NOT valid in AC Locals without AC surcharge coupon.`;
    } else if (prompt.includes('delay') || prompt.includes('late')) {
      reply += `Delay & Headway Advisory [TIMETABLE MODEL]: Live operational telemetry is unavailable. During peak-hour congestion, Slow Local services on local lines often avoid fast line bunching between Thane and Kurla. Check platform indicator boards for confirmed dispatch times.`;
    } else {
      reply += `For your route, check the Journey Decision Engine to view scheduled headways, interchanges, and legal ticket validity.`;
    }
    return reply;
  }

  private generateGrievanceDraft(prompt: string): string {
    return `PASSENGER GRIEVANCE DRAFT TEMPLATE [DEMO / NOT SUBMITTED TO RAILMADAD]
Reference Category: COACH_ELECTRICAL_FAILURE
Train Number: 95114 AC Local
Coach Number: AC-03
Incident Date/Time: ${new Date().toLocaleString('en-IN')}

INCIDENT DETAILS:
Air conditioning system cooling malfunction reported inside passenger coach. High ambient temperature and heavy passenger load causing poor ventilation.

ROUTING DEPARTMENT (RECOMMENDED):
Senior Divisional Electrical Engineer (Rolling Stock / C&W), Central Railway Division.

REQUESTED CORRECTIVE ACTION:
Inspection and attendant service at next major halt (Dadar / CSMT).

DISCLAIMER: This is an educational draft template generated by RailOne Next. To submit an official grievance, please visit https://railmadad.indianrailways.gov.in or call 139.`;
  }
}
