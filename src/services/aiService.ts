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
  }>;
  source: 'gemini' | 'deterministic_fallback';
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
            return { tasks: data.tasks, source: data.source || 'gemini' };
          }
        }
      }
    } catch (e) {
      // Deterministic fallback handles offline and tests
    }

    // Client-side & Test deterministic backup
    const q = prompt.toLowerCase();
    const tasks: DecomposeResponse['tasks'] = [];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (q.includes('delay') || q.includes('signal') || q.includes('late') || q.includes('slow') || q.includes('fast')) {
      tasks.push({
        title: 'Execute Delay Inversion Reroute',
        description: 'Vidyavihar signal lock holding Fast Local 95112 (+22m delay). Transfer to Platform 1 Slow Local to save 14 minutes.',
        category: 'DISRUPTION_RECOVERY',
        priority: 'P0_CRITICAL',
        dueTime: 'Immediate',
        associatedTrain: '95112',
        stationCode: 'CLA'
      });

      tasks.push({
        title: 'Check Slow Line Platform Headway',
        description: 'Cross to Platform 1 at Kurla using foot overbridge. Next slow service departing in 4 mins.',
        category: 'JOURNEY_PLANNING',
        priority: 'P1_HIGH',
        dueTime: '11:05',
        stationCode: 'CLA'
      });
    }

    if (q.includes('ac') || q.includes('leave') || q.includes('home') || q.includes('time') || q.includes('kalyan')) {
      tasks.push({
        title: 'Recalculate Dynamic Leave-Home Time',
        description: 'AC Local 95114 has not departed Kalyan origin shed (+18m delay). Defer departure from home until 10:48.',
        category: 'JOURNEY_PLANNING',
        priority: 'P1_HIGH',
        dueTime: '10:48',
        associatedTrain: '95114',
        stationCode: 'TNA'
      });
    }

    if (q.includes('ticket') || q.includes('mst') || q.includes('pass') || q.includes('book') || q.includes('deccan')) {
      tasks.push({
        title: 'Verify Suburban MST Pass for Express Hop',
        description: 'Check Central Railway MST permitted train list for 12123 Deccan Queen. General Second Class coach travel only.',
        category: 'BOOKING_TICKETING',
        priority: 'P2_MEDIUM',
        associatedTrain: '12123',
        stationCode: 'DR'
      });
    }

    if (q.includes('coach') || q.includes('position') || q.includes('ladies') || q.includes('handicap') || q.includes('divyang')) {
      tasks.push({
        title: 'Verify Rake Coach Composition at Platform',
        description: 'Align near 3rd coach from south end for Divyangjan/Handicap compartment, or middle 4 coaches for Ladies Special.',
        category: 'COACH_POSITIONING',
        priority: 'P2_MEDIUM',
        stationCode: 'CSMT'
      });
    }

    if (tasks.length < 2) {
      tasks.push({
        title: 'Review Commute Timetable & Headway',
        description: `Check live OCC delay alerts and platform allocations for "${prompt}".`,
        category: 'JOURNEY_PLANNING',
        priority: 'P1_HIGH',
        dueTime: now
      });
      tasks.push({
        title: 'Pre-generate Specimen UTS QR Ticket',
        description: 'Generate specimen QR pass to inspect fare tariffs and simulate contactless validation.',
        category: 'BOOKING_TICKETING',
        priority: 'P2_MEDIUM'
      });
    }

    return { tasks, source: 'deterministic_fallback' };
  }

  /**
   * Ask the AI Travel Copilot
   */
  static async askCopilot(query: string, history: Array<{ role: 'user' | 'assistant'; text: string }>): Promise<{ reply: string; source: string }> {
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
            return { reply: data.reply, source: data.source || 'gemini' };
          }
        }
      }
    } catch (e) {
      // fallback
    }

    const q = query.toLowerCase();
    let reply = `Namaste! RailOne Next Operations Intelligence reports:\n\n`;
    if (q.includes('dadar') && q.includes('churchgate')) {
      reply += `To transfer from Central Line (Thane/Kalyan) to Western Line (Churchgate):\n` +
        `• Alight at Dadar Platform 6 or 7.\n` +
        `• Use the Northern Foot Overbridge (FOB) across to Western Railway Platform 1 or 2.\n` +
        `• Walking transfer time is calculated at 7 minutes.\n` +
        `• AC Fast Locals depart every 20-30 minutes towards Churchgate.`;
    } else if (q.includes('delay') || q.includes('slow') || q.includes('fast')) {
      reply += `Current Delay Inversion Status:\n` +
        `• Fast Local 95112 is delayed by +22 min behind Vidyavihar signal locks.\n` +
        `• Slow Local 97045 is running on time on the local line.\n` +
        `• Recommendation: Alight at Kurla or Thane and board the Slow Local — it will reach Dadar 14 minutes earlier!`;
    } else if (q.includes('ac') || q.includes('fare')) {
      reply += `Suburban Mumbai AC Local Fare Structure:\n` +
        `• Thane to Dadar: ₹95 (Single Journey), Season Pass: ₹1,495/month.\n` +
        `• Churchgate to Borivali: ₹105 (Single Journey).\n` +
        `• Note: Non-AC season tickets are NOT valid on AC services (Section 138 penalty applies).`;
    } else {
      reply += `For your travel: Check the Journey Decision Engine for calculated leave-home windows and real-time delay inversions. You can also view live OCC alerts under the Live Status tab.`;
    }

    return { reply, source: 'deterministic_fallback' };
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

    const draft = `INDIAN RAILWAYS / CRIS RAILMADAD OFFICIAL GRIEVANCE
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
