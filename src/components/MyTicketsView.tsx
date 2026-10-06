import React, { useState, useEffect } from 'react';
import { MockBookingStore } from '../engine/mockBookingStore';
import { SpecimenTicket, TravelClass } from '../types/railway';
import { VisualQRCode } from './VisualQRCode';
import { useTheme } from './ThemeContext';
import { 
  Ticket, 
  RotateCcw, 
  QrCode, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  HelpCircle,
  Sparkles,
  Train,
  Check,
  ChevronRight,
  Info,
  Compass
} from 'lucide-react';

interface MyTicketsViewProps {
  onNavigateToJourney: () => void;
  onViewStationGodsEye?: (stationCode: string) => void;
}

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({
  onNavigateToJourney,
  onViewStationGodsEye
}) => {
  const { language } = useTheme();
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'history' | 'refunds' | 'season_pass' | 'rules'>('active');
  const [tickets, setTickets] = useState<SpecimenTicket[]>(() => MockBookingStore.listBookings());
  const [selectedTicket, setSelectedTicket] = useState<SpecimenTicket | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [refundAlert, setRefundAlert] = useState<{ pnr: string; amount: number; method: string } | null>(null);

  const refreshTickets = () => {
    setTickets(MockBookingStore.listBookings());
  };

  useEffect(() => {
    refreshTickets();
  }, []);

  const handleCancel = (id: string, pnr: string) => {
    if (!window.confirm(`Are you sure you want to cancel ticket ${pnr}? Instant simulated refund will be credited to RailWallet.`)) {
      return;
    }
    const res = MockBookingStore.cancelBooking(id);
    if (res.success) {
      refreshTickets();
      setRefundAlert({
        pnr,
        amount: res.refundBreakdown.walletRefund || res.refundBreakdown.totalPaid,
        method: 'RailWallet (Simulated Instant Refund)'
      });
      if (selectedTicket?.id === id) {
        setSelectedTicket(null);
      }
    }
  };

  const activeTickets = tickets.filter(t => t.paymentStatus === 'PAID_MOCK');
  const cancelledTickets = tickets.filter(t => t.paymentStatus === 'CANCELLED_REFUNDED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Institutional Top Banner */}
      <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>[SIMULATED SPECIMEN TICKETING ENGINE]</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                CRIS EDUCATIONAL BENCHMARK
              </span>
            </div>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 mt-0.5">
              All tickets, UTS cryptographic QR codes, and refund ledgers generated in RailOne Next are instructional simulations. 
              <strong> Not valid for actual boarding or transit inspection on Indian Railways or Mumbai Suburban services.</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToJourney}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-theme-primary text-white font-bold text-xs hover-bg-theme-primary transition-all shrink-0 shadow-xs"
        >
          <Train className="w-4 h-4" />
          <span>Plan & Book Specimen</span>
        </button>
      </div>

      {/* Refund Success Notification Toast */}
      {refundAlert && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold">Cancellation & Refund Complete: </span>
              Ticket <span className="font-mono font-bold">{refundAlert.pnr}</span> cancelled. 
              ₹{refundAlert.amount} processed instantly via {refundAlert.method}.
            </div>
          </div>
          <button 
            onClick={() => setRefundAlert(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header and Summary Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Ticket className="w-7 h-7 text-theme-primary" />
            <span>
              {language === 'hi' ? 'मेरी टिकटें व पास' : language === 'mr' ? 'माझी तिकिटे आणि पास' : 'My Tickets & Transit Wallet'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage active suburban journeys, inspect CRIS cryptographic QR specimen payloads, and review automated refund statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshTickets}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Refresh local ticket store"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={onNavigateToJourney}
            className="px-4 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold flex items-center gap-2 hover-bg-theme-primary transition-all shadow-xs"
          >
            <Train className="w-3.5 h-3.5" />
            <span>Book New Journey</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs">
        {[
          { id: 'active', label: language === 'hi' ? 'सक्रिय टिकटें' : language === 'mr' ? 'सक्रिय तिकिटे' : 'Active Tickets', count: activeTickets.length },
          { id: 'upcoming', label: language === 'hi' ? 'आगामी यात्राएं' : language === 'mr' ? 'आगामी प्रवास' : 'Upcoming Journeys', count: activeTickets.length },
          { id: 'history', label: language === 'hi' ? 'टिकट इतिहास' : language === 'mr' ? 'तिकीट इतिहास' : 'Booking History', count: tickets.length },
          { id: 'refunds', label: language === 'hi' ? 'रद्द व धनवापसी' : language === 'mr' ? 'रद्द आणि परतावा' : 'Cancelled & Refunds', count: cancelledTickets.length },
          { id: 'season_pass', label: language === 'hi' ? 'मासिक पास (MST)' : language === 'mr' ? 'मासिक पास (MST)' : 'Season Passes (MST)', isSpecial: true },
          { id: 'rules', label: language === 'hi' ? 'CRIS बुकिंग नियम' : language === 'mr' ? 'CRIS बुकिंग नियम' : 'CRIS Ticketing Rules' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-theme-primary text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {tab.count}
              </span>
            )}
            {tab.isSpecial && (
              <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 uppercase">
                UTS
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Active Tickets */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeTickets.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-theme-light text-theme-primary flex items-center justify-center mx-auto shadow-inner">
                <Ticket className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  No Active Specimen Tickets Found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  You currently have no active tickets. Plan a suburban journey or multimodal metro route to generate a verifiable specimen ticket.
                </p>
              </div>
              <button
                onClick={onNavigateToJourney}
                className="px-5 py-2.5 rounded-xl bg-theme-primary text-white text-xs font-bold hover-bg-theme-primary transition-all inline-flex items-center gap-2 shadow-xs"
              >
                <Train className="w-4 h-4" />
                <span>Search Trains & Book Ticket</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs space-y-4 hover:border-theme-primary/50 transition-all relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-900 dark:text-slate-100">
                        PNR: {t.pnrMock}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {t.trainNumber} · {t.trainName}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                      CONFIRMED (SPECIMEN)
                    </span>
                  </div>

                  {/* Route & Platform details */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{t.fromStation.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.toStation.name}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Class: <strong className="text-slate-800 dark:text-slate-200">{t.classBooked}</strong> · Passenger: {t.passengers[0]?.name || 'Commuter'} ({t.passengers[0]?.age || 25}/{t.passengers[0]?.gender || 'M'})
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black font-mono text-theme-primary tabular-nums">
                        ₹{t.farePaid}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {t.paymentMethod}
                      </div>
                    </div>
                  </div>

                  {/* QR Code and Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="px-3 py-1.5 rounded-lg bg-theme-light text-theme-text font-bold text-xs hover:bg-theme-light/80 transition-colors flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View UTS QR Code</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {onViewStationGodsEye && (
                        <button
                          onClick={() => onViewStationGodsEye(t.fromStation.code)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1"
                          title="View Station 3D Layout & Platforms"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Station Map</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCancel(t.id, t.pnrMock)}
                        className="px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Cancel & Refund</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Upcoming Journeys */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Suburban Ticket Journey Validity Window:</strong>
              <p className="mt-0.5">
                Ordinary UTS suburban single tickets are valid for boarding within <strong>1 hour</strong> of issuance for distances up to 50 km, or within <strong>2 hours</strong> for journeys exceeding 50 km (e.g. Churchgate to Dahanu Road / CSMT to Kasara).
              </p>
            </div>
          </div>

          {activeTickets.length > 0 ? (
            <div className="space-y-3">
              {activeTickets.map(t => (
                <div key={t.id} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-theme-light text-theme-primary flex items-center justify-center font-bold">
                      <Train className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {t.trainNumber} · {t.trainName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.fromStation.name} ➔ {t.toStation.name} · Booked at {new Date(t.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(t)}
                    className="px-3 py-1.5 rounded-lg bg-theme-primary text-white text-xs font-bold hover-bg-theme-primary"
                  >
                    Show Ticket
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">No scheduled upcoming journeys right now.</p>
          )}
        </div>
      )}

      {/* Tab 3: Booking History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {tickets.length > 0 ? (
            tickets.map(t => (
              <div 
                key={t.id} 
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{t.pnrMock}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.paymentStatus === 'PAID_MOCK'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {t.paymentStatus}
                    </span>
                    <span className="text-slate-400">· {t.trainNumber} ({t.trainName})</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 font-medium">
                    {t.fromStation.name} ➔ {t.toStation.name} · Class: {t.classBooked} · Fare: ₹{t.farePaid}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTicket(t)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs"
                  >
                    View Details
                  </button>
                  {t.paymentStatus === 'PAID_MOCK' && (
                    <button
                      onClick={() => handleCancel(t.id, t.pnrMock)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">No booking history recorded.</p>
          )}
        </div>
      )}

      {/* Tab 4: Cancelled & Refunds */}
      {activeTab === 'refunds' && (
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-emerald-600" />
              <span>Simulated Instant Refund Policy & Ledger</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              When a passenger cancels an uncommenced suburban journey before scheduled departure, RailOne Next executes an idempotent, instant refund directly back to the simulated RailWallet balance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white dark:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="text-[11px] text-slate-400">Refund Settlement</div>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">Instant (0 Seconds)</div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="text-[11px] text-slate-400">Deduction / Clerkage Fee</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">₹0 (Zero Demo Fee)</div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="text-[11px] text-slate-400">Voucher Credit Validity</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">90 Days Terms</div>
              </div>
            </div>
          </div>

          {cancelledTickets.length > 0 ? (
            <div className="space-y-3">
              {cancelledTickets.map(t => (
                <div key={t.id} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      PNR: {t.pnrMock} · <span className="text-rose-600 dark:text-rose-400">CANCELLED</span>
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {t.fromStation.name} ➔ {t.toStation.name} · Refunded: ₹{t.refundAmount || t.farePaid} via RailWallet
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    +₹{t.refundAmount || t.farePaid}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">No cancelled tickets in this session.</p>
          )}
        </div>
      )}

      {/* Tab 5: Season Passes (MST) */}
      {activeTab === 'season_pass' && (
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-emerald-600/15 via-teal-600/10 to-transparent p-5 rounded-3xl border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-black uppercase">
                MST / QST
              </span>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Mumbai Suburban Monthly Season Tickets
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Indian Railways Monthly Season Tickets (MST) permit unlimited suburban travel between two nominated terminals across the month. 
              Suburban MSTs are <strong>strictly prohibited</strong> on reserved National Express trains (Section 138), but permitted on selected intercity trains with designated GS (General Second Class) coaches like Deccan Queen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Specimen Season Pass 1 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-emerald-500/40 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div>
                  <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400">PASS NO: MST-WR-88421</span>
                  <div className="text-[11px] text-slate-400">Monthly Season Pass (Western Line)</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  Churchgate (CCG) ➔ Borivali (BVI)
                </div>
                <div className="text-xs text-slate-500">
                  Class: <strong>First Class (I)</strong> · Distance: 34 km
                </div>
                <div className="text-xs text-slate-500">
                  Validity: 01-Oct-2026 to 31-Oct-2026 (24 days remaining)
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-500">Pass Fare: ₹1,040 / month</span>
                <span className="text-emerald-600 font-bold">UTS Linked</span>
              </div>
            </div>

            {/* Specimen Season Pass 2 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-theme-primary/40 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div>
                  <span className="font-bold text-xs text-theme-primary">PASS NO: MST-CR-33918</span>
                  <div className="text-[11px] text-slate-400">Quarterly Season Pass (Central Line)</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-theme-light text-theme-text">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  CSMT (CSMT) ➔ Kalyan (KYN)
                </div>
                <div className="text-xs text-slate-500">
                  Class: <strong>Second Class (II)</strong> · Distance: 54 km
                </div>
                <div className="text-xs text-slate-500">
                  Validity: 01-Sep-2026 to 30-Nov-2026 (54 days remaining)
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-500">Pass Fare: ₹790 / quarter</span>
                <span className="text-theme-primary font-bold">UTS Linked</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: CRIS Ticketing Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-4 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 text-xs">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-theme-primary" />
            <span>CRIS & Indian Railways Commuter Regulations</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>The Railways Act Section 138 (Penalties)</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Traveling without an appropriate ticket, or traveling in a higher class coach (e.g. First Class or AC Local with a Second Class ticket), or boarding a prohibited National Express train with a suburban ticket incurs an excess fare plus a minimum penalty of ₹250 under Section 138.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span>UTS Mobile Geofencing Rules</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                To prevent fraudulent ticket purchases while already onboard or facing ticket checking staff, official UTS paperless tickets must be booked at least 15 meters away from railway tracks and within 5 kilometers of the departure station.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full Ticket Inspection Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-theme-primary" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  Specimen UTS Cryptographic Ticket
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Specimen Notice */}
            <div className="bg-amber-500/15 px-6 py-2 border-b border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200 font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>DEMO SPECIMEN · NOT VALID FOR ACTUAL RAILWAY TRAVEL</span>
            </div>

            <div className="p-6 space-y-5">
              {/* QR and PNR Display */}
              <div className="flex flex-col items-center justify-center space-y-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <VisualQRCode payload={selectedTicket.qrPayload} size={140} />
                <div className="text-center">
                  <div className="font-mono font-black text-sm tracking-wider text-slate-900 dark:text-white">
                    {selectedTicket.pnrMock}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Hash: {selectedTicket.id.slice(0, 16)}...
                  </div>
                </div>
              </div>

              {/* Journey Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <div className="text-[10px] text-slate-400">From</div>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedTicket.fromStation.name} ({selectedTicket.fromStation.code})</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <div className="text-[10px] text-slate-400">To</div>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedTicket.toStation.name} ({selectedTicket.toStation.code})</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <div className="text-[10px] text-slate-400">Train & Class</div>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedTicket.trainNumber} · {selectedTicket.classBooked}</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <div className="text-[10px] text-slate-400">Fare Paid</div>
                  <div className="font-bold text-emerald-600 font-mono text-sm">₹{selectedTicket.farePaid}</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Status: <strong className="text-emerald-600">{selectedTicket.paymentStatus}</strong>
              </span>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-theme-primary text-white text-xs font-bold rounded-xl hover-bg-theme-primary"
              >
                Close Ticket
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
