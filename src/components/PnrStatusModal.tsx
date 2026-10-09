import React, { useState } from 'react';
import { AccessibleModal } from './common/AccessibleModal';
import { Search, Train, Calendar, CheckCircle2, Clock, User, AlertCircle, Copy, Check } from 'lucide-react';
import { MockBookingStore } from '../engine/mockBookingStore';

interface PnrStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPnr?: string;
}

interface PnrDetails {
  pnr: string;
  trainNumber: string;
  trainName: string;
  dateOfJourney: string;
  fromStation: string;
  toStation: string;
  boardingStation: string;
  travelClass: string;
  quota: string;
  chartStatus: 'CHART PREPARED' | 'CHART NOT PREPARED';
  passengers: Array<{
    number: number;
    bookingStatus: string;
    currentStatus: string;
    berthType?: string;
  }>;
}

export const PnrStatusModal: React.FC<PnrStatusModalProps> = ({
  isOpen,
  onClose,
  initialPnr = ''
}) => {
  const [pnrInput, setPnrInput] = useState(initialPnr);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [result, setResult] = useState<PnrDetails | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Quick lookup from user's simulated tickets
  const recentBookings = MockBookingStore.listBookings();

  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPnr = pnrInput.replace(/\D/g, '').trim();

    if (cleanPnr.length !== 10) {
      setSearchError('Please enter a valid 10-digit Indian Railways PNR number.');
      setResult(null);
      return;
    }

    setSearchError(null);

    // Look for matching mock booking in storage or generate authentic specimen response
    const existing = recentBookings.find(b => b.pnrMock.replace(/\D/g, '') === cleanPnr);

    if (existing) {
      setResult({
        pnr: existing.pnrMock,
        trainNumber: existing.trainNumber,
        trainName: existing.trainName,
        dateOfJourney: existing.journeyDate,
        fromStation: existing.fromStation.name,
        toStation: existing.toStation.name,
        boardingStation: existing.fromStation.name,
        travelClass: String(existing.classBooked).toUpperCase(),
        quota: 'GENERAL (GN)',
        chartStatus: 'CHART NOT PREPARED',
        passengers: existing.passengers.map((_p, idx) => ({
          number: idx + 1,
          bookingStatus: `CNF / B${idx + 1} / ${18 + idx * 3}`,
          currentStatus: `CNF / B${idx + 1} / ${18 + idx * 3}`,
          berthType: idx % 2 === 0 ? 'LOWER BERTH' : 'UPPER BERTH'
        }))
      });
    } else {
      // Deterministic specimen generation for any entered 10-digit PNR
      const trainNum = (22000 + (parseInt(cleanPnr.slice(-3), 10) % 900)).toString();
      const isConfirmed = parseInt(cleanPnr.slice(-1), 10) % 2 === 0;

      setResult({
        pnr: cleanPnr,
        trainNumber: trainNum,
        trainName: 'Vande Bharat / Superfast Express',
        dateOfJourney: new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        fromStation: 'CSMT',
        toStation: 'SUR',
        boardingStation: 'CSMT',
        travelClass: '3A',
        quota: 'GENERAL (GN)',
        chartStatus: 'CHART NOT PREPARED',
        passengers: [
          {
            number: 1,
            bookingStatus: isConfirmed ? 'CNF / B3 / 24' : 'WL / 14',
            currentStatus: isConfirmed ? 'CNF / B3 / 24' : 'RAC / 4',
            berthType: isConfirmed ? 'SIDE LOWER' : 'RAC SEAT'
          }
        ]
      });
    }
  };

  const handleCopyPnr = (pnrText: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(pnrText);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="PNR Status Enquiry"
      subtitle="Indian Railways Passenger Name Record Verification"
      variant="sheet"
      maxWidthClass="max-w-xl"
    >
      <div className="space-y-4">
        {/* Verification & Provenance Badge */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-mono">
          <span className="text-slate-500 dark:text-slate-400">DATA PROVENANCE</span>
          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
            [SIMULATED DATASET]
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleLookup} className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Enter 10-Digit PNR Number
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={10}
                value={pnrInput}
                onChange={(e) => {
                  setPnrInput(e.target.value.replace(/\D/g, ''));
                  setSearchError(null);
                }}
                placeholder="e.g. 8412953210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white tracking-widest focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all min-h-[44px]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Get Status</span>
            </button>
          </div>

          {searchError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </form>

        {/* Quick select from user specimen tickets if present */}
        {recentBookings.length > 0 && !result && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
              Recent Specimen Bookings in Wallet:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {recentBookings.slice(0, 3).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    const clean = b.pnrMock.replace(/\D/g, '').padEnd(10, '0').slice(0, 10);
                    setPnrInput(clean);
                    setTimeout(() => handleLookup(), 50);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  PNR: {b.pnrMock.slice(0, 10)} ({b.trainNumber})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PNR Status Result Display */}
        {result && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs space-y-3 p-4">
            {/* Header: Train info and PNR */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {result.trainNumber} · {result.trainName}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {result.fromStation} ➔ {result.toStation} · Class: {result.travelClass} ({result.quota})
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => handleCopyPnr(result.pnr)}
                  className="flex items-center gap-1 text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  title="Copy PNR"
                >
                  <span>{result.pnr}</span>
                  {hasCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {result.dateOfJourney}
                </div>
              </div>
            </div>

            {/* Charting Status */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300">Chart Status</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-[11px]">
                {result.chartStatus}
              </span>
            </div>

            {/* Passengers Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Passenger Details
              </span>
              <div className="space-y-1.5">
                {result.passengers.map((p) => (
                  <div
                    key={p.number}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center">
                        P{p.number}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          Passenger {p.number}
                        </div>
                        {p.berthType && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {p.berthType}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                        {p.currentStatus}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Booking: {p.bookingStatus}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 text-center leading-relaxed">
              Official verification for live ticketed travel available on Indian Railways PRS counters or www.indianrail.gov.in.
            </div>
          </div>
        )}
      </div>
    </AccessibleModal>
  );
};
