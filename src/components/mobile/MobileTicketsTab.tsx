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
import {
  validateTicketPayload,
  SPECIMEN_TEST_PAYLOADS,
  TTE_DEMO_DISCLAIMER,
  TteVerificationResult
} from '../../engine/tteTicketValidator';

import { useAuthority } from '../AuthorityContext';
import { InstitutionalInsignia } from '../common/InstitutionalInsignia';
import { useTheme } from '../ThemeContext';
import { getTranslation } from '../../i18n/translations';

interface MobileTicketsTabProps {
  onNavigateToJourney: () => void;
  onOpenSpecimenModal?: (ticket: SpecimenTicket) => void;
}

export const MobileTicketsTab: React.FC<MobileTicketsTabProps> = ({
  onNavigateToJourney,
  onOpenSpecimenModal
}) => {
  const { authority, formatCurrency } = useAuthority();
  const { language } = useTheme();
  const t = getTranslation(language);
  const [tickets, setTickets] = useState<SpecimenTicket[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'season' | 'wallet' | 'tte'>('active');
  const [walletBalance, setWalletBalance] = useState(450);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [selectedTicketForQR, setSelectedTicketForQR] = useState<SpecimenTicket | null>(null);

  // TTE Mode state
  const [tteScanQuery, setTteScanQuery] = useState('');
  const [isExpressInspection, setIsExpressInspection] = useState(false);
  const [inspectedCoachClass, setInspectedCoachClass] = useState(authority?.classes[0]?.code || 'II');
  const [tteValidationResult, setTteValidationResult] = useState<TteVerificationResult | null>(null);

  useEffect(() => {
    if (authority && authority.classes && authority.classes.length > 0) {
      setInspectedCoachClass(authority.classes[0].code);
    }
  }, [authority.id]);

  const topUpAmounts = authority.currency.code === 'GBP' || authority.currency.code === 'EUR' || authority.currency.code === 'CHF'
    ? [10, 25, 50]
    : authority.currency.code === 'JPY'
    ? [1000, 2500, 5000]
    : [100, 250, 500];

  const seasonPassDetails = {
    india: {
      title: 'Monthly Season Ticket (MST)',
      subtitle: `${authority.operatingAgency} Suburban Pass`,
      corridor: authority.corridors[0]?.name || 'Thane (TNA) ⇄ CSMT',
      lines: 'Central Main Fast & Slow',
      class: 'Second Class (II)',
      rules: `Permitted for ordinary suburban services. Not valid on AC Locals without difference surcharge. Governed by ${authority.statutoryAct}.`
    },
    uk: {
      title: 'National Rail Travelcard / Season Pass',
      subtitle: `${authority.operatingAgency} Commuter Pass`,
      corridor: authority.corridors[0]?.name || 'Waterloo (WAT) ⇄ Clapham Junction (CLJ)',
      lines: 'South Western & Elizabeth Line Trunks',
      class: 'Standard Class (STD)',
      rules: `Valid for unlimited travel across designated National Rail zones. Governed by ${authority.statutoryAct}.`
    },
    japan: {
      title: 'Teikiken (定期券) Commuter Smart Pass',
      subtitle: `${authority.operatingAgency} Commuter Pass`,
      corridor: authority.corridors[0]?.name || 'Tokyo (TYO) ⇄ Shinjuku (SJK)',
      lines: 'Yamanote & Chūō Rapid Lines',
      class: 'Ordinary Class (ORD)',
      rules: `Valid for repeated travel between designated stations on JR East lines. Governed by ${authority.statutoryAct}.`
    },
    switzerland: {
      title: 'General-Abonnement (GA) / Streckenabo',
      subtitle: `${authority.operatingAgency} Integrated Travel Pass`,
      corridor: authority.corridors[0]?.name || 'Zürich HB (ZRH) ⇄ Bern (BN)',
      lines: 'SBB InterCity & Regional Networks',
      class: '2nd Class (2CL)',
      rules: `Unlimited travel on Swiss Federal Railways and partner transport networks. Governed by ${authority.statutoryAct}.`
    },
    germany: {
      title: 'Deutschlandticket (D-Ticket) / Zeitkarte',
      subtitle: `${authority.operatingAgency} Regional Mobility Pass`,
      corridor: authority.corridors[0]?.name || 'Berlin Hbf (BER) ⇄ München (MUN)',
      lines: 'Regionalbahn & S-Bahn Networks',
      class: '2nd Class (2KL)',
      rules: `Nationwide travel authorization on all regional and commuter public transit. Governed by ${authority.statutoryAct}.`
    }
  }[authority.id] || {
    title: 'Statutory Commuter Pass',
    subtitle: `${authority.operatingAgency} Pass`,
    corridor: authority.corridors[0]?.name || 'Designated Trunk Corridor',
    lines: 'Official Network Lines',
    class: authority.classes[0]?.name || 'Standard',
    rules: `Governed by ${authority.statutoryAct}.`
  };

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
    const clean = query.trim();
    if (!clean) return;

    const result = validateTicketPayload(
      clean,
      {
        isInspectingExpressTrain: isExpressInspection,
        inspectedCoachClass,
        inspectedTrainNumber: isExpressInspection ? '12137 Punjab Mail' : '95112 KYN Slow',
        inspectionDate: '2026-10-07'
      },
      tickets
    );
    setTteValidationResult(result);
  };

  const activeTickets = tickets.filter(t => t.paymentStatus === 'PAID_MOCK' && t.bookingState !== 'CANCELLED_DEMO' && t.bookingState !== 'REFUNDED_DEMO');
  const pastTickets = tickets.filter(t => t.paymentStatus === 'CANCELLED_REFUNDED' || t.bookingState === 'CANCELLED_DEMO' || t.bookingState === 'REFUNDED_DEMO');

  return (
    <div className="space-y-3.5 pb-20 px-3.5 pt-2">
      
      {/* Sub-Tabs Pills */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
        {[
          { id: 'active', label: t.activePassesSubtab },
          { id: 'season', label: t.seasonPassesSubtab },
          { id: 'wallet', label: t.walletSubtab },
          { id: 'tte', label: t.tteSubtab }
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
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">No Active Travel Passes</div>
                <div className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Issue an official transit ticket or suburban pass to enable electronic QR inspection.
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
                  <div className="bg-theme-primary/20 text-theme-primary border border-theme-primary/30 text-[9px] font-black uppercase tracking-widest text-center py-1 rounded-lg flex items-center justify-center gap-1.5">
                    <InstitutionalInsignia authorityId={authority.id} size={14} />
                    <span>★ STATUTORY TRANSIT DOCUMENT · {authority.securityPillText} ★</span>
                  </div>

                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">REF: {ticket.pnrMock || ticket.id}</span>
                      <div className="text-sm font-black text-white flex items-center gap-1.5">
                        <span>{ticket.fromStation.name}</span>
                        <span className="text-theme-primary">➔</span>
                        <span>{ticket.toStation.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black font-mono text-emerald-400">{formatCurrency(ticket.farePaid)}</span>
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
                  <div className="text-xs font-black">{seasonPassDetails.title}</div>
                  <div className="text-[10px] text-indigo-300">{seasonPassDetails.subtitle}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black">
                ACTIVE
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/30 border border-white/10 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Valid Corridor:</span>
                <span className="font-bold text-white">{seasonPassDetails.corridor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Permitted Lines:</span>
                <span className="font-bold text-white">{seasonPassDetails.lines}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Class:</span>
                <span className="font-bold text-white">{seasonPassDetails.class}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valid Through:</span>
                <span className="font-bold text-emerald-400 font-mono">31 OCT 2026</span>
              </div>
            </div>

            <div className="text-[10px] text-indigo-300/80 leading-relaxed">
              {seasonPassDetails.rules}
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
                <span className="text-xs font-bold text-slate-300">{authority.shortTitle} Citizen Wallet</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 font-mono">Citizen Account</span>
            </div>

            <div className="text-3xl font-black font-mono text-white flex items-baseline gap-1">
              <span>{formatCurrency(walletBalance)}</span>
            </div>

            <div className="text-[11px] text-slate-300 leading-tight">
              Pre-loaded simulated transit balance used for 1-tap instant booking without external gateway latency.
            </div>
          </div>

          {/* Quick Recharge Buttons */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Citizen Wallet Top-Up
            </div>

            <div className="grid grid-cols-3 gap-2">
              {topUpAmounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => handleRechargeWallet(amt)}
                  className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-theme-primary hover:text-white font-bold text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 flex items-center justify-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+{formatCurrency(amt)}</span>
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
                <UserCheck className="w-5 h-5 text-theme-primary" />
                <div>
                  <div className="text-xs font-black">{authority.inspectorTitle} Inspection Portal</div>
                  <div className="text-[10px] text-slate-400">{authority.governmentBody} · Passenger Manifest Verification</div>
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-theme-primary/20 text-theme-primary border border-theme-primary/30">
                ROLE: {authority.inspectorTitle.split(' ')[0].toUpperCase()}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Official passenger inspection conducted under authority of {authority.statutoryAct}. Verify electronic QR barcodes, passenger manifest and statutory excess charges.
            </p>
          </div>

          {/* Inspection Context Selector */}
          <div className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Inspection Conditions
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Inspecting Mail/Express Rake:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isExpressInspection}
                  onChange={(e) => setIsExpressInspection(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-theme-primary"></div>
              </label>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold">Coach Class Inspected:</span>
              <div className="grid grid-cols-4 gap-1.5">
                {(authority.classes && authority.classes.length > 0 ? authority.classes.slice(0, 4) : [
                  { code: 'II', name: '2nd Class' },
                  { code: 'I', name: '1st Class' },
                  { code: 'AC_LOCAL', name: 'AC Local' },
                  { code: '3A', name: '3-Tier AC' }
                ]).map(cls => {
                  const cCode = (cls as any).code || (cls as any).id;
                  const cLabel = (cls as any).name || (cls as any).label;
                  return (
                    <button
                      key={cCode}
                      onClick={() => setInspectedCoachClass(cCode)}
                      className={`py-1.5 px-1 rounded-xl text-center text-[10px] font-bold transition-all border ${
                        inspectedCoachClass === cCode
                          ? 'bg-theme-primary text-white border-theme-primary shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cLabel.split(' ')[0]} ({cCode})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Verification Search Bar */}
          <div className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Verify Ticket ID, PNR or Scanned QR Payload
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tteScanQuery}
                onChange={(e) => setTteScanQuery(e.target.value)}
                placeholder="Enter PNR (e.g. 842-1948201) or specimen payload"
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-hidden"
              />
              <button
                onClick={() => handleTteVerify(tteScanQuery)}
                className="px-4 py-2 rounded-xl bg-theme-primary hover:bg-blue-600 font-bold text-xs text-white shadow-md active:scale-95 transition-all"
              >
                Inspect
              </button>
            </div>

            {/* Specimen Buttons */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold">Quick Specimen Scenarios:</span>
              <div className="flex flex-wrap gap-1 text-[10px]">
                <button
                  onClick={() => {
                    const p = SPECIMEN_TEST_PAYLOADS.validSuburban;
                    setTteScanQuery(p);
                    handleTteVerify(p);
                  }}
                  className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-500/20"
                >
                  Valid 2nd Class
                </button>
                <button
                  onClick={() => {
                    const p = SPECIMEN_TEST_PAYLOADS.validAcLocal;
                    setTteScanQuery(p);
                    handleTteVerify(p);
                  }}
                  className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-500/20"
                >
                  Valid AC Local
                </button>
                <button
                  onClick={() => {
                    const p = SPECIMEN_TEST_PAYLOADS.expiredTicket;
                    setTteScanQuery(p);
                    handleTteVerify(p);
                  }}
                  className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-500/20"
                >
                  Expired Ticket
                </button>
                <button
                  onClick={() => {
                    setIsExpressInspection(true);
                    const p = SPECIMEN_TEST_PAYLOADS.suburbanMstInExpress;
                    setTteScanQuery(p);
                    handleTteVerify(p);
                  }}
                  className="px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-700 dark:text-orange-300 font-bold hover:bg-orange-500/20"
                >
                  MST on Express (Sec 138)
                </button>
                <button
                  onClick={() => {
                    const p = SPECIMEN_TEST_PAYLOADS.forgedOrNotFound;
                    setTteScanQuery(p);
                    handleTteVerify(p);
                  }}
                  className="px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-500/20"
                >
                  Invalid QR
                </button>
              </div>
            </div>
          </div>

          {/* Validation Inspection Result Card */}
          {tteValidationResult && (
            <div className={`p-4 rounded-3xl border space-y-3 animate-fadeIn ${
              tteValidationResult.status === 'VALID'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                : tteValidationResult.status === 'EXPIRED'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
                : tteValidationResult.status === 'CLASS_MISMATCH'
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-950 dark:text-orange-100'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100'
            }`}>
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  {tteValidationResult.status === 'VALID' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {tteValidationResult.status === 'EXPIRED' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  {tteValidationResult.status === 'CLASS_MISMATCH' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                  {tteValidationResult.status === 'NOT_FOUND' && <XCircle className="w-4 h-4 text-rose-500" />}
                  <span className="font-black">Result: {tteValidationResult.status}</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/20">
                  {tteValidationResult.statusCode}
                </span>
              </div>

              <p className="text-xs leading-relaxed font-medium">
                {tteValidationResult.summary}
              </p>

              {/* Passenger & Trip Details */}
              {tteValidationResult.passengerDetails && (
                <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-black/30 border border-black/5 dark:border-white/10 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">PNR:</span>
                    <span className="font-mono font-bold">{tteValidationResult.passengerDetails.pnr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Route:</span>
                    <span className="font-bold">{tteValidationResult.passengerDetails.originStationName} ➔ {tteValidationResult.passengerDetails.destinationStationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Class / Quota:</span>
                    <span className="font-bold">{tteValidationResult.passengerDetails.travelClass} ({tteValidationResult.passengerDetails.quota})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Fare Paid:</span>
                    <span className="font-bold">₹{tteValidationResult.passengerDetails.farePaid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Date:</span>
                    <span className="font-bold">{tteValidationResult.passengerDetails.journeyDate}</span>
                  </div>
                </div>
              )}

              {/* Statutory Railways Act Details */}
              <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-black/30 border border-black/5 dark:border-white/10 text-[11px] space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Statutory Compliance Citation
                </div>
                <div className="font-semibold text-xs">
                  {tteValidationResult.regulatoryCompliance.statutoryCitation}
                </div>
                {tteValidationResult.regulatoryCompliance.totalAmountDue > 0 && (
                  <div className="pt-1 border-t border-black/10 dark:border-white/10 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span>Excess Fare:</span>
                      <span>₹{tteValidationResult.regulatoryCompliance.excessFarePayable}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Statutory Penalty:</span>
                      <span>₹{tteValidationResult.regulatoryCompliance.penaltyCharge}</span>
                    </div>
                    <div className="flex justify-between font-bold text-rose-600 dark:text-rose-400 text-xs">
                      <span>Total Due:</span>
                      <span>₹{tteValidationResult.regulatoryCompliance.totalAmountDue}</span>
                    </div>
                  </div>
                )}
                <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                  Action: {tteValidationResult.regulatoryCompliance.actionRequired}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
