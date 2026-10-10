import { CommuterTask, TaskCategory, TaskPriority } from '../types/tasks';

export interface DecomposeResponse {
  tasks: Array<{
    title: string;
    description: string;
    category: TaskCategory;
    priority: TaskPriority;
    dueTime?: string;
    associatedTrain?: string;
    stationCode?: string;
    provenance?: 'LIVE_VERIFIED' | 'SCHEDULED' | 'DEMO' | 'UNKNOWN';
  }>;
  source: 'gemini' | 'nvidia' | 'groq' | 'deterministic_fallback' | string;
  provenance: 'PREDICTED' | 'LIVE_VERIFIED' | 'SCHEDULED' | 'DEMO' | 'UNKNOWN' | string;
  feedStatusNotice?: string;
}

function getApiUrl(endpoint: string): string {
  if (typeof window !== 'undefined') {
    return endpoint;
  }
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}${endpoint}`;
}

export class AiRailwayService {
  /**
   * Decompose a natural language travel query into prioritized commuter tasks
   */
  static async decomposeTravelPlan(prompt: string, context?: string): Promise<DecomposeResponse> {
    try {
      if (typeof window !== 'undefined') {
        const res = await fetch(getApiUrl('/api/ai/decompose'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, context })
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.tasks) && data.tasks.length >= 2) {
            return {
              tasks: data.tasks,
              source: data.source || 'gemini',
              provenance: data.provenance || (data.source === 'gemini' ? 'PREDICTED' : 'DEMO'),
              feedStatusNotice: data.feedStatusNotice
            };
          }
        }
      }
    } catch (e) {
      // Deterministic fallback handles offline and tests
    }

    // Client-side & Test deterministic backup with strict data provenance
    const q = prompt.toLowerCase();
    const tasks: DecomposeResponse['tasks'] = [];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (q.includes('delay') || q.includes('signal') || q.includes('late') || q.includes('slow') || q.includes('fast')) {
      tasks.push({
        title: 'Delay Inversion Rule [TIMETABLE MODEL]',
        description: 'Live operational feed unavailable. Under timetable delay inversion rules, transferring to an operating Slow Local can avoid bunched fast corridor headways.',
        category: 'DISRUPTION_RECOVERY',
        priority: 'P0_CRITICAL',
        dueTime: 'Immediate',
        stationCode: 'CLA',
        provenance: 'DEMO'
      });

      tasks.push({
        title: 'Check Slow Line Platform Headway',
        description: 'Verify local platform indicator at Kurla via foot overbridge. Consult station board for next dispatched slow service.',
        category: 'JOURNEY_PLANNING',
        priority: 'P1_HIGH',
        dueTime: now,
        stationCode: 'CLA',
        provenance: 'SCHEDULED'
      });
    }

    if (q.includes('failure') || q.includes('compressor') || q.includes('malfunction') || q.includes('grievance') || q.includes('madad')) {
      tasks.push({
        title: 'Draft Official RailMadad Complaint',
        description: 'Air conditioning failure in Coach AC-03 of Kalyan-CSMT AC Fast Local 95114. Draft statutory complaint to Central Railway Electrical Maintenance & RailMadad 139.',
        category: 'GRIEVANCE_RAILMADAD',
        priority: 'P0_CRITICAL',
        associatedTrain: '95114',
        stationCode: 'CSMT',
        dueTime: 'Immediate',
        provenance: 'SCHEDULED'
      });

      tasks.push({
        title: 'RPF / Train Superintendent Escalation',
        description: 'Notify onboard Train Superintendent or dial Statutory Helpline 139 for immediate HVAC technician dispatch at next halt.',
        category: 'GRIEVANCE_RAILMADAD',
        priority: 'P1_HIGH',
        associatedTrain: '95114',
        stationCode: 'KYN',
        dueTime: now,
        provenance: 'SCHEDULED'
      });
    } else if (q.includes('ac') || q.includes('leave') || q.includes('home') || q.includes('time') || q.includes('kalyan')) {
      tasks.push({
        title: 'Departure Timing Buffer Advisory',
        description: 'Live rake telemetry unavailable. Allow standard 10–15 min walking buffer before scheduled departure and check platform display upon arrival.',
        category: 'JOURNEY_PLANNING',
        priority: 'P1_HIGH',
        dueTime: now,
        stationCode: 'TNA',
        provenance: 'SCHEDULED'
      });
    }

    if (q.includes('ticket') || q.includes('mst') || q.includes('pass') || q.includes('book') || q.includes('deccan')) {
      tasks.push({
        title: 'Verify Suburban MST Pass for Express Hop',
        description: 'Check Central Railway MST permitted train list for 12123 Deccan Queen. General Second Class coach travel only under statutory rules.',
        category: 'BOOKING_TICKETING',
        priority: 'P2_MEDIUM',
        associatedTrain: '12123',
        stationCode: 'DR',
        provenance: 'SCHEDULED'
      });
    }

    if (q.includes('coach') || q.includes('position') || q.includes('ladies') || q.includes('handicap') || q.includes('divyang')) {
      tasks.push({
        title: 'Verify Rake Coach Composition at Platform',
        description: 'Align near designated platform tactile indicators for Divyangjan/Handicap compartments or marked Ladies sections.',
        category: 'COACH_POSITIONING',
        priority: 'P2_MEDIUM',
        stationCode: 'CSMT',
        provenance: 'SCHEDULED'
      });
    }

    if (tasks.length < 2) {
      tasks.push({
        title: 'Review Scheduled Timetable & Headway',
        description: 'Live operational data unavailable. Consult scheduled timetable and platform display indicators for journey planning.',
        category: 'JOURNEY_PLANNING',
        priority: 'P1_HIGH',
        dueTime: now,
        provenance: 'SCHEDULED'
      });
      tasks.push({
        title: 'Pre-generate Specimen UTS QR Ticket',
        description: 'Generate educational specimen ticket to inspect fare tariffs and simulate contactless validation [DEMO].',
        category: 'BOOKING_TICKETING',
        priority: 'P2_MEDIUM',
        provenance: 'DEMO'
      });
    }

    return {
      tasks,
      source: 'deterministic_fallback',
      provenance: 'DEMO',
      feedStatusNotice: 'Operational feed unavailable. Showing scheduled/demo information only.'
    };
  }

  /**
   * Ask the AI Travel Copilot
   */
  static async askCopilot(query: string, history: Array<{ role: 'user' | 'assistant'; text: string }>): Promise<{ reply: string; source: string; provenance?: string; feedStatusNotice?: string }> {
    try {
      if (typeof window !== 'undefined') {
        const res = await fetch(getApiUrl('/api/ai/copilot'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, history })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.reply) {
            return {
              reply: data.reply,
              source: data.source || 'gemini',
              provenance: data.provenance || 'PREDICTED',
              feedStatusNotice: data.feedStatusNotice
            };
          }
        }
      }
    } catch (e) {
      // fallback
    }

    const q = query.toLowerCase();
    let reply = `Namaste! Operational feed unavailable. Showing scheduled/demo information only [TIMETABLE MODEL].\n\n`;
    if (q.includes('dadar') && q.includes('churchgate')) {
      reply += `To transfer from Central Line (Thane/Kalyan) to Western Line (Churchgate):\n` +
        `• Alight at Dadar Platform 6 or 7.\n` +
        `• Use the Northern Foot Overbridge (FOB) across to Western Railway Platform 1 or 2.\n` +
        `• Walking transfer time is calculated at 7 minutes minimum.\n` +
        `• AC Fast Locals depart every 20-30 minutes towards Churchgate according to schedule.`;
    } else if (q.includes('delay') || q.includes('slow') || q.includes('fast')) {
      reply += `Delay & Headway Advisory [TIMETABLE MODEL]:\n` +
        `• Live operational telemetry is currently unavailable.\n` +
        `• Timetable guidance: During peak congestion, Slow Local services on local lines often avoid fast line bunching.\n` +
        `• Check platform display indicators for current train dispatch order.`;
    } else if (q.includes('ac') || q.includes('fare')) {
      reply += `Suburban Mumbai AC Local Fare Structure:\n` +
        `• Thane to Dadar: ₹95 (Single Journey), Season Pass: ₹1,495/month.\n` +
        `• Churchgate to Borivali: ₹105 (Single Journey).\n` +
        `• Note: Non-AC season tickets are NOT valid on AC services (Section 138 penalty applies).`;
    } else {
      reply += `For your travel: Check the Journey Decision Engine for calculated scheduled windows. Live operational data is currently unavailable; consult station announcements for real-time tracking.`;
    }

    return {
      reply,
      source: 'deterministic_fallback',
      provenance: 'DEMO',
      feedStatusNotice: 'Operational feed unavailable. Showing scheduled/demo information only.'
    };
  }

  /**
   * Draft official RailMadad complaint
   */
  static async draftGrievance(complaintType: string, trainNumber: string, coachNumber: string, description: string): Promise<{ draft: string; source: string }> {
    try {
      if (typeof window !== 'undefined') {
        const res = await fetch(getApiUrl('/api/ai/grievance'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ complaintType, trainNumber, coachNumber, description })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.draft) {
            return { draft: data.draft, source: data.source || 'gemini' };
          }
        }
      }
    } catch (e) {
      // fallback
    }

    const draft = `INDIAN RAILWAYS RAILMADAD OFFICIAL GRIEVANCE
====================================================
Category: ${complaintType}
Train: ${trainNumber || '95114 AC Local'}
Coach: ${coachNumber || 'AC-03'}
Timestamp: ${new Date().toLocaleString('en-IN')}

INCIDENT DETAILS:
${description || 'Air conditioning cooling failure and high carbon dioxide buildup inside commuter coach.'}

ACTION REQUIRED:
Deploy Carriage & Wagon (C&W) electrical technician at next scheduled junction halt for inspection and rectification.`;

    return { draft, source: 'deterministic_fallback' };
  }
}
