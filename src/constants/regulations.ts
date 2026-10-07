/**
 * Centralized Indian Railways Statutory Regulations & Penalty Constants
 * Reflects the statutory rule effective 20 June 2026:
 * Minimum penalty / excess charge under amended Railways Act Sections 137/138 is ₹500.
 */

export const STATUTORY_REGULATIONS = {
  effectiveDate: '2026-06-20',
  amendmentReference: 'Railways Act 1989 (Amended Sections 137 & 138, Gazetted 20 June 2026)',
  minimumPenalty: 500,
  formattedMinimumPenalty: '₹500',
  passengerWarning: 'Travelling without a valid ticket, in an unauthorized class (e.g. First Class / AC Local on a Second Class ticket), or on a prohibited Express train incurs excess fare plus a statutory minimum penalty of ₹500 under amended Sections 137 & 138.',
  compactWarning: 'Statutory Section 137/138 minimum penalty: ₹500 + excess fare (effective 20 June 2026).',
  demoNotice: 'DEMO / NOT VALID FOR TRAVEL — Statutory minimum fine of ₹500 applies for irregular transit.'
} as const;
