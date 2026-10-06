import { DataStatus } from '../types/railway';

export type AlertSeverity = 'CRITICAL' | 'MAJOR' | 'MODERATE' | 'INFO';

export interface NetworkServiceAlert {
  id: string;
  division: string;
  line: 'central' | 'western' | 'harbour' | 'national';
  severity: AlertSeverity;
  title: string;
  sectionAffected: string;
  delayImpact: string;
  timestamp: string;
  expectedResolution: string;
  operationalCause: string;
  passengerRecommendation: string;
  affectedTrainNumbers: string[];
  dataStatus: DataStatus;
}

export interface DivisionHealth {
  division: string;
  line: 'central' | 'western' | 'harbour' | 'national';
  status: 'NORMAL' | 'SLIGHT_DELAY' | 'DISRUPTED';
  punctualityIndex: number; // e.g. 84.5%
  activeAlertCount: number;
  averageDelayMinutes: number;
}

const DEFAULT_ALERTS: NetworkServiceAlert[] = [
  {
    id: 'CR-SIG-202610-01',
    division: 'Central Railway (CR Mumbai Division)',
    line: 'central',
    severity: 'MAJOR',
    title: 'Fast Corridor Signal Hold between Vidyavihar and Kurla',
    sectionAffected: 'Vidyavihar ➔ Kurla (Up & Down Fast Tracks)',
    delayImpact: 'Fast locals running 18 to 25 mins late',
    timestamp: '11:12 IST',
    expectedResolution: 'Technicians on-site; clearance expected ~11:45 IST',
    operationalCause: 'Point motor signaling lock issue following morning sectional inspection',
    passengerRecommendation: 'Board Slow Locals running on the Local corridor (Platforms 1 & 2); Slow lines are unaffected (+2m only) and reach Dadar/CSMT earlier.',
    affectedTrainNumbers: ['95112', '95114'],
    dataStatus: 'DEMO'
  },
  {
    id: 'CR-AC-202610-02',
    division: 'Central Railway (CR Mumbai Division)',
    line: 'central',
    severity: 'MODERATE',
    title: 'AC EMU Rake Staging Delay at Kalyan Electric Shed',
    sectionAffected: 'Kalyan Origin (Up Direction)',
    delayImpact: 'AC Fast Local 95114 held at origin (+18 min)',
    timestamp: '10:35 IST',
    expectedResolution: 'Rake cleared from siding; departure ~10:48 IST',
    operationalCause: 'Mandatory pre-trip compressor circuit check on newly commissioned AC rake',
    passengerRecommendation: 'Commuters at downstream stations (Thane, Ghatkopar) should not wait on platforms; delay-adaptive leave-home advisory applies.',
    affectedTrainNumbers: ['95114'],
    dataStatus: 'DEMO'
  },
  {
    id: 'HB-SPEED-202610-03',
    division: 'Harbour Line (CR Urban)',
    line: 'harbour',
    severity: 'MODERATE',
    title: 'Speed Restriction between Vadala Road and Cotton Green',
    sectionAffected: 'Vadala Road ➔ Cotton Green (30 km/h caution order)',
    delayImpact: 'Minor 5 to 7 min spacing expansion',
    timestamp: '09:40 IST',
    expectedResolution: 'Caution order active until 14:00 maintenance window',
    operationalCause: 'Track alignment monitoring following monsoon ballast packing',
    passengerRecommendation: 'Services operating normally with minor spacing; allow 5 min extra buffer for transfer connections at Kurla / CSMT.',
    affectedTrainNumbers: ['98042', '98055'],
    dataStatus: 'DEMO'
  },
  {
    id: 'WR-NORMAL-202610-04',
    division: 'Western Railway (WR Mumbai Central Division)',
    line: 'western',
    severity: 'INFO',
    title: 'Churchgate – Virar Corridor Running Punctual',
    sectionAffected: 'All Western Suburban corridors',
    delayImpact: 'Normal 2 to 4 min headway',
    timestamp: '11:20 IST',
    expectedResolution: 'Standard timetable compliance',
    operationalCause: 'Clear track circuits and punctual rakes across Churchgate-Borivali-Virar quad line',
    passengerRecommendation: 'Western Railway connecting locals at Dadar WR (Platforms 1, 2, 4) operating at 96% punctuality.',
    affectedTrainNumbers: ['90234', '90240', '90244'],
    dataStatus: 'DEMO'
  },
  {
    id: 'NAT-OHE-202610-05',
    division: 'National Rail (CR / Konkan Railway)',
    line: 'national',
    severity: 'CRITICAL',
    title: 'Overhead Equipment (OHE) Power Trip on South-East Ghats',
    sectionAffected: 'Karjat – Lonavala section',
    delayImpact: 'Intercity and Tejas services delayed by 60 to 75 mins',
    timestamp: '07:30 IST',
    expectedResolution: 'Traction power restored; cascading clearance underway',
    operationalCause: 'Sub-station feeder breaker trip during high-tension switching',
    passengerRecommendation: 'Deccan Queen 12124 running punctual; Tejas Express 22119 delayed +72m. Full cancellation refund eligible under Railway Rules.',
    affectedTrainNumbers: ['22119'],
    dataStatus: 'DEMO'
  }
];

const DIVISION_HEALTH: DivisionHealth[] = [
  {
    division: 'Central Railway (CR)',
    line: 'central',
    status: 'DISRUPTED',
    punctualityIndex: 82.4,
    activeAlertCount: 2,
    averageDelayMinutes: 14.8
  },
  {
    division: 'Western Railway (WR)',
    line: 'western',
    status: 'NORMAL',
    punctualityIndex: 96.2,
    activeAlertCount: 1,
    averageDelayMinutes: 2.5
  },
  {
    division: 'Harbour Line',
    line: 'harbour',
    status: 'SLIGHT_DELAY',
    punctualityIndex: 91.0,
    activeAlertCount: 1,
    averageDelayMinutes: 4.8
  },
  {
    division: 'National Intercity',
    line: 'national',
    status: 'DISRUPTED',
    punctualityIndex: 78.5,
    activeAlertCount: 1,
    averageDelayMinutes: 38.0
  }
];

export const NetworkAlertsService = {
  /**
   * Fetch all active network broadcast alerts (Simulated Async API)
   */
  async getActiveAlerts(lineFilter?: 'all' | 'central' | 'western' | 'harbour' | 'national'): Promise<NetworkServiceAlert[]> {
    // Simulate real-time network micro-latency (50ms)
    await new Promise(r => setTimeout(r, 50));
    if (!lineFilter || lineFilter === 'all') {
      return DEFAULT_ALERTS;
    }
    return DEFAULT_ALERTS.filter(a => a.line === lineFilter);
  },

  /**
   * Fetch live division health metrics
   */
  async getDivisionHealth(): Promise<DivisionHealth[]> {
    await new Promise(r => setTimeout(r, 50));
    return DIVISION_HEALTH;
  },

  /**
   * Fetch alerts relevant to a specific train
   */
  async getAlertsForTrain(trainNumber: string): Promise<NetworkServiceAlert[]> {
    await new Promise(r => setTimeout(r, 30));
    return DEFAULT_ALERTS.filter(a => a.affectedTrainNumbers.includes(trainNumber));
  }
};
