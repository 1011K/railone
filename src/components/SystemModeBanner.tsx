import React, { useState } from 'react';
import { AlertTriangle, Info, ShieldCheck, Database, X } from 'lucide-react';

export const SystemModeBanner: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside aria-label="System mode and data provenance" className="border-b border-amber-500/20 bg-amber-500/10 text-amber-950 dark:text-amber-100 text-xs px-4 py-2 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
          <span className="font-semibold tracking-wide uppercase">Truth-in-Data Notice:</span>
          <span>Controlled Scenario Runtime (October 2026 Fixture)</span>
          <span aria-hidden="true" className="text-amber-500/60">·</span>
          <span className="text-amber-800 dark:text-amber-200">
            Unofficial Educational Redesign. No Live CRIS / NTES feed claimed.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="underline font-medium hover:text-amber-700 dark:hover:text-amber-300 transition-colors focus-visible:ring-1 focus-visible:ring-amber-500 rounded px-1"
          >
            {showDetails ? 'Hide Data Audit' : 'Inspect Data Contract'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-amber-800 dark:text-amber-300 hover:text-amber-950 rounded focus-visible:ring-1 focus-visible:ring-amber-500"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-amber-500/20 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
          <div>
            <div className="font-semibold flex items-center gap-1.5 mb-1">
              <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Data Source Classification
            </div>
            <p>
              Observations are strictly categorized as <code>DEMO</code>, <code>SCHEDULED</code>, or <code>UNKNOWN</code>. System never substitutes server clock for absent railway timestamps.
            </p>
          </div>
          <div>
            <div className="font-semibold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Legal Eligibility Safeguard
            </div>
            <p>
              Suburban commuters cannot hop on Express trains (e.g., Dadar–Kalyan) unless verified on the official Central Railway MST list. Violations carry Railways Act Section 138 penalties.
            </p>
          </div>
          <div>
            <div className="font-semibold flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Specimen-Only Safety
            </div>
            <p>
              All bookings, QR codes, and test OTPs are simulated educational artifacts. No real IRCTC PNR or financial payment is ever processed.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
