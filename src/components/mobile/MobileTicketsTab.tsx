import React, { useState, useEffect } from 'react';
import { MockBookingStore } from '../../engine/mockBookingStore';
import { SpecimenTicket, BookingState } from '../../types/railway';
import { VisualQRCode } from '../VisualQRCode';
import { 
  Ticket, 
  Wallet, 
  ShieldCheck, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  Plus, 
  UserCheck, 
  Search,
  ExternalLink,
  ChevronRight,
  FileText
} from 'lucide-react';

interface MobileTicketsTabProps {
  onNavigateToJourney: () => void;
  onOpenSpecimenModal?: (ticket: SpecimenTicket) => void;
}

export const MobileTicketsTab: React.FC<MobileTicketsTabProps> = ({
  onNavigateToJourney,
  onOpenSpecimenModal
}) => {
  const [tickets, setTickets] = useState<SpecimenTicket[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'season' | 'wallet' | 'tte'>('active');
  const [walletBalance, setWalletBalance] = useState(450);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [selectedTicketForQR, setSelectedTicketForQR] = useState<SpecimenTicket | null>(null);

  // TTE Mode state
  const [tteScanQuery, setTteScanQuery] = useState('');
  const [tteValidationResult, setTteValidationResult] = useState<{
    status: 'VALID' | 'INVALID' | 'EXPIRED' | 'UNVERIFIED';
    message: string;
    ticket?: SpecimenTicket;
  } | null>(null);

  const refreshTickets = () => {
    const list = MockBookingStore.listBookings();
    setTickets(list);
    if (list.length > 0 && !selectedTicketForQR) {
      setSelectedTicketForQR(list[0]);
    }
  };

  useEffect(() => {
    refreshTickets();
  }, []);

  const handleRechargeWallet = (amount: number) => {
    setWalletBalance(b => b + amount);
    setRechargeSuccess(true);
    setTimeout(() => setRechargeSuccess(false), 2500);
  };

  const handleCancelTicket = (ticketId: string) => {
    const res = MockBookingStore.cancelBooking(ticketId, 'wallet');
    if (res.success) {
      setWalletBalance(b => b + res.refundAmount);
    }
    refreshTickets();
  };

  const handleTteVerify = (query: string) => {
    const clean = query.trim().toUpperCase();
    if (!clean) return;

    const matched = tickets.find(t => t.id === clean || t.pnrMock === clean);
    if (!matched) {
      setTteValidationResult({
        status: 'INVALID',
        message: `Ticket / Reference "${clean}" not found in current passenger manifest. Statutory Railways Act Section 138 applies.`
      });
      return;
    }

    if (matched.paymentStatus === 'CANCELLED_REFUNDED' || matched.bookingState === 'CANCELLED_DEMO' || matched.bookingState === 'REFUNDED_DEMO') {
      setTteValidationResult({
        status: 'EXPIRED',
        message: `Ticket ${matched.id} was CANCELLED. Refund was processed. Not valid for boarding.`,
        ticket: matched
      });
      return;
    }

    setTteValidationResult({
      status: 'VALID',
      message: `Verified Authentic Specimen Ticket: ${matched.classBooked} Class from ${matched.fromStation.name} to ${matched.toStation.name}. Fare ₹${matched.farePaid} Paid.`,
      ticket: matched
    });
  };

  const activeTickets = tickets.filter(t => t.paymentStatus === 'PAID_MOCK' && t.bookingState !== 'CANCELLED_DEMO' && t.bookingState !== 'REFUNDED_DEMO');
  const pastTickets = tickets.filter(t => t.paymentStatus === 'CANCELLED_REFUNDED' || t.bookingState === 'CANCELLED_DEMO' || t.bookingState === 'REFUNDED_DEMO');

  return (
    <div className="space-y-3.5 pb-20 px-3.5 pt-2">
      
      {/* Sub-Tabs Pills */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
        {[
          { id: 'active', label: 'My Tickets' },
          { id: 'season', label: 'Season Pass' },
          { id: 'wallet', label: 'R-Wallet' },
          { id: 'tte', label: 'TTE Verify' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`py-2 px-1 rounded-xl text-center transition-all ${
              activeSubTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-theme-primary shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: Active & Past Tickets */}
      {activeSubTab === 'active' && (
        <div className="space-y-3 animate-fadeIn">
          {activeTickets.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-theme-primary flex items-center justify-center mx-auto">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">No Active Specimen Tickets</div>
                <div className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Book a simulated suburban or express ticket to test offline QR scanning and cancellation.
                </div>
              </div>
              <button
                onClick={onNavigateToJourney}
                className="px-4 py-2.5 rounded-xl bg-theme-primary hover:bg-blue-600 font-bold text-xs text-white shadow-md transition-all active:scale-95"
              >
                Plan & Book Journey ➔
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 border border-slate-700/80 shadow-lg space-y-3 relative overflow-hidden"
                >
                  {/* Specimen Security Watermark Strip */}
                  <div className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-black uppercase tracking-widest text-center py-1 rounded-lg">
                    ★ DEMO SPECIMEN · NOT VALID FOR ACTUAL TRAVEL ★
                  </div>

                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">ID: {ticket.id}</span>
                      <div className="text-sm font-black text-white flex items-center gap-1.5">
                        <span>{ticket.fromStation.name}</span>
                        <span className="text-theme-primary">➔</span>
                        <span>{ticket.toStation.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black font-mono text-emerald-400">₹{ticket.farePaid}</span>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">{ticket.classBooked} Class</div>
                    </div>
                  </div>

                  {/* Middle QR & Verification Code */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                    <div className="p-1.5 bg-white rounded-xl shrink-0">
                      <VisualQRCode 
                        payload={`RAILONE-TICKET:${ticket.id}:${ticket.fromStation.code}:${ticket.toStation.code}`}
                        size={64}
                      />
                    </div>
                    <div className="flex-1 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Service:</span>
                        <span className="font-bold text-white">{ticket.trainName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Passenger:</span>
                        <span className="font-bold text-white">{ticket.passengers[0]?.name || 'Commuter'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className="font-bold text-emerald-400 font-mono">CONFIRMED (UTS)</span>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation & Action Button */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => handleCancelTicket(ticket.id)}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Cancel & Refund to Wallet</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(ticket.bookingTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Past / Cancelled History */}
          {pastTickets.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 px-1">
                Past & Cancelled Tickets ({pastTickets.length})
              </div>
              {pastTickets.map(pt => (
                <div 
                  key={pt.id}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between opacity-75"
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {pt.fromStation.name} ➔ {pt.toStation.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ID: {pt.id} · {pt.classBooked} Class
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      {pt.bookingState || pt.paymentStatus}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Refunded</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: Current & Expired Season Passes */}
      {activeSubTab === 'season' && (
        <div className="space-y-3 animate-fadeIn">
          {/* Active Season Pass Card */}
          <div className="rounded-3xl bg-linear-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-4 border border-indigo-700/60 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/40">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black">Monthly Season Ticket (MST)</div>
                  <div className="text-[10px] text-indigo-300">Central Railway Suburban Pass</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black">
                ACTIVE
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/30 border border-white/10 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Valid Corridor:</span>
                <span className="font-bold text-white">Thane (TNA) ⇄ CSMT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Permitted Lines:</span>
                <span className="font-bold text-white">Central Main Fast & Slow</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Class:</span>
                <span className="font-bold text-white">Second Class (II)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valid Through:</span>
                <span className="font-bold text-emerald-400 font-mono">31 OCT 2026</span>
              </div>
            </div>

            <div className="text-[10px] text-indigo-300/80 leading-relaxed">
              Permitted for ordinary suburban services. Not valid on AC Locals without difference surcharge. Not valid on Mail/Express trains outside CR MST list.
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: RailWallet Simulated Balance & Recharge */}
      {activeSubTab === 'wallet' && (
        <div className="space-y-3 animate-fadeIn">
          {/* Balance Card */}
          <div className="p-5 rounded-3xl bg-linear-to-br from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-500/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-theme-primary" />
                <span className="text-xs font-bold text-slate-300">RailWallet Balance</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 font-mono">Demo Fixture</span>
            </div>

            <div className="text-3xl font-black font-mono text-white flex items-baseline gap-1">
              <span>₹</span>
              <span>{walletBalance}</span>
            </div>

            <div className="text-[11px] text-slate-300 leading-tight">
              Pre-loaded simulated transit balance used for 1-tap instant booking without external gateway latency.
            </div>
          </div>

          {/* Quick Recharge Buttons */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Simulated Wallet Top-Up
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[100, 250, 500].map(amt => (
                <button
                  key={amt}
                  onClick={() => handleRechargeWallet(amt)}
                  className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-theme-primary hover:text-white font-bold text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 flex items-center justify-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+₹{amt}</span>
                </button>
              ))}
            </div>

            {rechargeSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Simulated balance updated successfully!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: TTE Ticket Examiner Demonstration Interface */}
      {activeSubTab === 'tte' && (
        <div className="space-y-3 animate-fadeIn">
          {/* TTE Examiner Role Header */}
          <div className="p-3.5 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs font-black">Traveling Ticket Examiner (TTE) Mode</div>
                  <div className="text-[10px] text-slate-400">Statutory Manifest Verification</div>
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ROLE: EXAMINER
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Voluntary inspection mode. Under statutory Indian privacy rules, location is never used for automated passenger profiling or suspicion generation.
            </p>
          </div>

          {/* Verification Search Bar */}
          <div className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Verify Ticket ID or PNR Reference
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tteScanQuery}
                onChange={(e) => setTteScanQuery(e.target.value.toUpperCase())}
                placeholder="Enter ID (e.g. TKT- or PNR)"
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-hidden"
              />
              <button
                onClick={() => handleTteVerify(tteScanQuery)}
                className="px-4 py-2 rounded-xl bg-theme-primary hover:bg-blue-600 font-bold text-xs text-white shadow-md active:scale-95 transition-all"
              >
                Inspect
              </button>
            </div>

            {/* Quick Inspect Chips from Active Tickets */}
            {activeTickets.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-[10px]">
                <span className="text-slate-400">Quick Test:</span>
                {activeTickets.slice(0, 3).map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTteScanQuery(t.id);
                      handleTteVerify(t.id);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold hover:bg-slate-200"
                  >
                    {t.id}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Validation Inspection Result Card */}
          {tteValidationResult && (
            <div className={`p-4 rounded-3xl border space-y-2 animate-fadeIn ${
              tteValidationResult.status === 'VALID'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : tteValidationResult.status === 'EXPIRED'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
            }`}>
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  {tteValidationResult.status === 'VALID' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {tteValidationResult.status === 'EXPIRED' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  {tteValidationResult.status === 'INVALID' && <XCircle className="w-4 h-4 text-rose-500" />}
                  <span>Inspection Result: {tteValidationResult.status}</span>
                </span>
                <span className="text-[10px] font-mono font-bold">Examiner Check #91</span>
              </div>
              <p className="text-xs leading-relaxed">
                {tteValidationResult.message}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
