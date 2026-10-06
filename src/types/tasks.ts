/**
 * RailOne Next — Commuter Tasks & AI Copilot Contracts
 * Comprehensive category taxonomy, priority gating, and institutional railway workflows.
 */

export type TaskCategory = 
  | 'DISRUPTION_RECOVERY'
  | 'JOURNEY_PLANNING'
  | 'BOOKING_TICKETING'
  | 'GRIEVANCE_RAILMADAD'
  | 'SAFETY_LOST_FOUND'
  | 'STATION_AMENITIES'
  | 'COACH_POSITIONING'
  | 'CREW_OPERATIONS';

export type TaskPriority = 
  | 'P0_CRITICAL'  // Immediate action / emergency / signal freeze / doors closing
  | 'P1_HIGH'      // Time-sensitive (<30 min deadline / leave home / Tatkal window)
  | 'P2_MEDIUM'    // Standard travel preparation (renew MST, check coach position)
  | 'P3_LOW';      // Post-journey documentation / feedback / amenity survey

export interface CommuterTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueTime?: string;
  associatedTrain?: string;
  stationCode?: string;
  actionPayload?: string;
  createdTimestamp: string;
  isAiGenerated?: boolean;
}

export interface AiCopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'SEARCH' | 'REPLAN' | 'TASK' | 'COMPLAINT' | 'BOOK';
    payload: any;
    label: string;
  };
  referencedTools?: string[];
}

export interface RailMadadComplaintDraft {
  complaintType: string;
  trainNumber: string;
  pnrMock?: string;
  coachNumber: string;
  incidentLocation: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  draftText: string;
  recommendedDepartment: string;
}

export const TASK_CATEGORY_METADATA: Record<TaskCategory, { label: string; iconName: string; color: string; description: string }> = {
  DISRUPTION_RECOVERY: {
    label: 'Disruption & Rerouting',
    iconName: 'AlertTriangle',
    color: 'rose',
    description: 'Signal freezes, delay inversions, fast-to-slow track transfers'
  },
  JOURNEY_PLANNING: {
    label: 'Journey Planning & Timing',
    iconName: 'Clock',
    color: 'blue',
    description: 'Safe leave-home times, transfer walk buffers, timetable changes'
  },
  BOOKING_TICKETING: {
    label: 'Ticketing & Passes',
    iconName: 'Ticket',
    color: 'emerald',
    description: 'UTS QR specimen, MST season ticket validity, Tatkal booking'
  },
  GRIEVANCE_RAILMADAD: {
    label: 'RailMadad Grievance',
    iconName: 'ShieldAlert',
    color: 'amber',
    description: 'Official complaints for coach AC failure, cleanliness, catering'
  },
  SAFETY_LOST_FOUND: {
    label: 'RPF Safety & SOS',
    iconName: 'ShieldCheck',
    color: 'rose',
    description: 'RPF 139 emergency assistance, lost property tracking, medical help'
  },
  STATION_AMENITIES: {
    label: 'Station Facilities',
    iconName: 'Layers',
    color: 'teal',
    description: 'Escalators, wheelchair ramps, executive waiting rooms, cloakroom'
  },
  COACH_POSITIONING: {
    label: 'Coach Layout & Position',
    iconName: 'TrainTrack',
    color: 'sky',
    description: 'Ladies compartment alignment, Divyangjan coach, luggage van'
  },
  CREW_OPERATIONS: {
    label: 'Operational Handover',
    iconName: 'Radio',
    color: 'slate',
    description: 'Sectional speed restrictions, motorman-guard signal communication'
  }
};

export const TASK_PRIORITY_METADATA: Record<TaskPriority, { label: string; urgency: string; badgeColor: string; sortWeight: number }> = {
  P0_CRITICAL: {
    label: 'P0 Critical',
    urgency: 'Immediate (0-5 min action)',
    badgeColor: 'bg-rose-500 text-white border-rose-600',
    sortWeight: 0
  },
  P1_HIGH: {
    label: 'P1 High',
    urgency: 'Time-sensitive (<30 min)',
    badgeColor: 'bg-amber-500 text-slate-950 border-amber-600 font-bold',
    sortWeight: 1
  },
  P2_MEDIUM: {
    label: 'P2 Medium',
    urgency: 'Today / Pre-travel prep',
    badgeColor: 'bg-blue-500 text-white border-blue-600',
    sortWeight: 2
  },
  P3_LOW: {
    label: 'P3 Low',
    urgency: 'Routine / Post-journey log',
    badgeColor: 'bg-slate-500 text-white border-slate-600',
    sortWeight: 3
  }
};
