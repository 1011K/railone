import { CommuterScenario } from '../types/railway';

export const COMMUTER_SCENARIOS: CommuterScenario[] = [
  {
    id: 'thane-churchgate-transfer',
    title: 'Thane ➔ Churchgate via Dadar Transfer',
    subtitle: 'Cross-line interchange with realistic walking buffers & class choices',
    originCode: 'TNA',
    destCode: 'CCG',
    timeContext: '10:35',
    userContext: 'pre_departure',
    classPreference: 'any',
    description: 'Models a real Central-to-Western transfer at Dadar. Evaluates Fast vs Slow connecting services, validates that the 7-minute walking transfer buffer over Foot Over Bridge 2 is respected, and tests AC vs First vs Second class pricing.',
    keyLearning: 'Proves multi-leg graph routing, transfer feasibility, and prevents impossible instant connections.'
  },
  {
    id: 'delay-inversion-fast-vs-slow',
    title: 'Delay Inversion: Slow Local Beats Delayed Fast Local',
    subtitle: 'Signal bunching on Fast corridor renders Slow track 9 mins faster',
    originCode: 'TNA',
    destCode: 'DR',
    timeContext: '10:40',
    userContext: 'waiting_at_station',
    classPreference: 'second',
    description: 'Fast Local 95112 is delayed +22 mins due to Vidyavihar signal bunching. Slow Local 97045 is running on time (+2 mins). The system detects the delay inversion and advises boarding the Slow Local, arriving at Dadar 9 minutes earlier.',
    keyLearning: 'Solves the #1 Mumbai commuter dilemma: waiting for a delayed fast train vs boarding the immediate slow train.'
  },
  {
    id: 'origin-delay-leave-home',
    title: 'Leave-Home Planning: Train Not Departed Origin',
    subtitle: 'Origin delay accumulation prevents wasted platform waiting',
    originCode: 'TNA',
    destCode: 'CSMT',
    timeContext: '10:20',
    userContext: 'pre_departure',
    classPreference: 'ac_preferred',
    description: 'AC Local 95114 is scheduled for 10:54 from Thane, but has not yet departed Kalyan origin due to inspection delay (+18m). The system advises the commuter to stay at home until 10:48 rather than standing in the heat at platform 5.',
    keyLearning: 'Demonstrates upstream-to-downstream propagation and pre-departure leave-home calculation.'
  },
  {
    id: 'dadar-kalyan-express-eligibility',
    title: 'Dadar ➔ Kalyan Express Short-Hop Eligibility',
    subtitle: 'MST permitted trains vs illegal boarding penalties',
    originCode: 'DR',
    destCode: 'KYN',
    timeContext: '10:15',
    userContext: 'waiting_at_station',
    classPreference: 'any',
    description: 'Commuter asks if they can board an Express train from Dadar to Kalyan. System checks Central Railway MST permitted lists: Deccan Queen 12124 is CONDITIONAL (MST valid in General coach only), while Konark Express 11020 is PROHIBITED (suburban passes invalid, Section 138 penalty).',
    keyLearning: 'Prevents illegal travel advice; enforces actual Central Railway season pass restrictions.'
  },
  {
    id: 'national-express-disruption',
    title: 'CSMT ➔ Pune Jn National Intercity Comparison',
    subtitle: 'Deccan Queen Superfast vs Tejas Express Disruption',
    originCode: 'CSMT',
    destCode: 'PUNE',
    timeContext: '06:30',
    userContext: 'pre_departure',
    classPreference: 'any',
    description: 'Compares intercity express services with multi-class tariffs (2S, CC, EC). Demonstrates delay tracking, refund policies, and coach composition.',
    keyLearning: 'Demonstrates unified architecture supporting both dense suburban networks and intercity national rail.'
  }
];
