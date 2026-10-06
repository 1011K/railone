import React, { useState, useEffect } from 'react';
import { MockBookingStore } from '../engine/mockBookingStore';
import { SpecimenTicket } from '../types/railway';
import { VisualQRCode } from './VisualQRCode';
import { 
  Ticket, 
  RotateCcw, 
  X, 
  QrCode, 
  ShieldAlert, 
  CheckCircle2, 
  Trash2 
} from 'lucide-react';

interface TicketWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketWalletModal: React.FC<TicketWalletModalProps> = ({
  isOpen,
  onClose
}) => {
  const [tickets, setTickets] = useState<SpecimenTicket[]>(() => MockBookingStore.listBookings());
  const [selectedTicket, setSelectedTicket] = useState<SpecimenTicket | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTickets(MockBookingStore.listBookings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCancelTicket = (id: string) => {
    const res = MockBookingStore.cancelBooking(id);
    if (res.success) {
      setTickets(MockBookingStore.listBookings());
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket({
          ...selectedTicket,
          paymentStatus: 'CANCELLED_REFUNDED',
          refundAmount: res.refundBreakdown.walletRefund || res.refundBreakdown.totalPaid,
          refundBreakdown: res.refundBreakdown
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Specimen Ticket Wallet
            </h3>
            <span className="text-xs text-slate-500 font-normal">
              ({tickets.length} Saved)
            </span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl" aria-label="Close dialog">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-500/10 px-6 py-2 border-b border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>All tickets in this wallet are educational specimens. Not valid for actual rail travel.</span>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tickets.length > 0 ? (
            tickets.map((t) => (
              <div 
                key={t.id}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/40 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{t.pnrMock}</span>
                    <span className="text-[10px] text-slate-400">· {t.trainNumber} ({t.trainName})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    t.paymentStatus === 'PAID_MOCK' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {t.paymentStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {t.fromStation.name} ➔ {t.toStation.name}
                    </span>
                    <div className="text-slate-500 text-[11px]">
                      Passenger: {t.passengers[0]?.name} · Class: {t.classBooked}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">₹{t.farePaid}</span>
                    <div className="text-[10px] text-slate-400">{t.paymentMethod}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedTicket(t)}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View Specimen QR</span>
                  </button>

                  {t.paymentStatus === 'PAID_MOCK' && (
                    <button
                      onClick={() => handleCancelTicket(t.id)}
                      className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Cancel & Refund</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 space-y-2">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No specimen tickets created yet
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate a mock ticket from the Journey Decision Engine to inspect the cryptographic QR structure and mock cancellation flow.
              </p>
            </div>
          )}
        </div>

        {/* Selected Ticket Modal Detail */}
        {selectedTicket && (
          <div className="p-4 bg-slate-900 text-white border-t border-slate-800 flex items-center justify-between gap-4 text-xs">
            <div className="space-y-1 min-w-0">
              <div className="font-bold font-mono text-emerald-400">{selectedTicket.pnrMock}</div>
              <div className="text-[11px] text-slate-300">
                {selectedTicket.fromStation.name} ➔ {selectedTicket.toStation.name} ({selectedTicket.classBooked})
              </div>
              <div className="text-[9px] text-slate-500 font-mono truncate max-w-sm">
                Payload: {selectedTicket.qrPayload}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <VisualQRCode payload={selectedTicket.qrPayload} size={72} />
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
