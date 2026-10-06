import React, { useState, useEffect } from 'react';
import { JourneyItinerary, TravelClass, SpecimenTicket } from '../types/railway';
import { MockBookingStore } from '../engine/mockBookingStore';
import { VisualQRCode } from './VisualQRCode';
import { 
  Ticket, 
  CreditCard, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  QrCode, 
  AlertTriangle,
  RotateCcw, 
  Printer
} from 'lucide-react';

interface SpecimenTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: JourneyItinerary | null;
  selectedClass: TravelClass;
  onBookingCreated: (ticket: SpecimenTicket) => void;
}

export const SpecimenTicketModal: React.FC<SpecimenTicketModalProps> = ({
  isOpen,
  onClose,
  itinerary,
  selectedClass,
  onBookingCreated
}) => {
  const [step, setStep] = useState<'details' | 'otp' | 'payment' | 'confirmed'>('details');
  const [passengerName, setPassengerName] = useState('Krishiv Ramchandani');
  const [passengerAge, setPassengerAge] = useState(21);
  const [passengerGender, setPassengerGender] = useState('M');
  const [otpCode, setOtpCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('RailWallet (Simulated)');
  const [createdTicket, setCreatedTicket] = useState<SpecimenTicket | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancellationResult, setCancellationResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setCreatedTicket(null);
      setCancellationResult(null);
      setIsProcessing(false);
      setOtpCode('');
    }
  }, [isOpen, itinerary?.id]);

  if (!isOpen || !itinerary) return null;

  const fare = itinerary.totalFareByClass[selectedClass] || 10;
  const leg = itinerary.legs[0];

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = MockBookingStore.createSpecimenBooking({
        trainNumber: leg.train.trainNumber,
        trainName: leg.train.trainName,
        fromCode: leg.fromStation.code,
        fromName: leg.fromStation.name,
        toCode: itinerary.legs[itinerary.legs.length - 1].toStation.code,
        toName: itinerary.legs[itinerary.legs.length - 1].toStation.name,
        classBooked: selectedClass,
        fare,
        passengers: [{ name: passengerName, age: passengerAge, gender: passengerGender }],
        paymentMethod
      });

      setCreatedTicket(res.ticket);
      setIsProcessing(false);
      setStep('confirmed');
      onBookingCreated(res.ticket);
    }, 800);
  };

  const handleCancelTicket = () => {
    if (!createdTicket) return;
    const res = MockBookingStore.cancelBooking(createdTicket.id);
    if (res.success) {
      setCancellationResult(res.message);
      setCreatedTicket({
        ...createdTicket,
        paymentStatus: 'CANCELLED_REFUNDED',
        refundAmount: res.refundBreakdown.walletRefund || res.refundBreakdown.totalPaid
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Specimen Booking Simulator
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl" aria-label="Close dialog">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Educational Disclaimer */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Simulated Educational Artifact: </strong>
            No financial charges, real OTPs, or genuine IRCTC PNRs are issued.
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {step === 'details' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  {leg.train.trainNumber} - {leg.train.trainName}
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  {leg.fromStation.name} ➔ {itinerary.legs[itinerary.legs.length - 1].toStation.name}
                </div>
                <div className="text-blue-600 dark:text-blue-400 font-semibold">
                  Class: {selectedClass} · Fare: ₹{fare}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Passenger Full Name
                </label>
                <input
                  type="text"
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={passengerAge}
                    onChange={(e) => setPassengerAge(parseInt(e.target.value, 10) || 18)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={passengerGender}
                    onChange={(e) => setPassengerGender(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white min-h-[44px]"
                  >
                    <option value="M">Male (M)</option>
                    <option value="F">Female (F)</option>
                    <option value="T">Transgender (T)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors min-h-[44px]"
              >
                Proceed to Verification
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-xs text-slate-600 dark:text-slate-300">
                A simulated OTP has been generated for your session:
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-center">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Test OTP Code:</span>
                <span className="font-mono text-xl font-bold tracking-widest text-blue-700 dark:text-blue-300">
                  139026
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Enter Test OTP
                </label>
                <input
                  type="text"
                  placeholder="139026"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center tracking-widest font-mono text-base bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 min-h-[44px]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors min-h-[44px]"
              >
                Verify & Continue to Mock Payment
              </button>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 dark:text-slate-300">
                Select simulated educational payment channel:
              </div>

              <div className="space-y-2">
                {[
                  'RailWallet (Simulated Balance ₹500)',
                  'Simulated UPI (Fast Sandbox)',
                  'NetBanking Sandbox'
                ].map((m) => (
                  <label
                    key={m}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      paymentMethod === m 
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 font-semibold' 
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-500" />
                      <span>{m}</span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === m}
                      onChange={() => setPaymentMethod(m)}
                      className="text-blue-600"
                    />
                  </label>
                ))}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Mock Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white text-base">₹{fare}</span>
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-colors min-h-[44px] flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Processing Mock Payment...' : `Confirm Specimen Payment (₹${fare})`}
              </button>
            </div>
          )}

          {step === 'confirmed' && createdTicket && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-xs text-emerald-950 dark:text-emerald-100">
                    Specimen Ticket Created Successfully
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Mock PNR: {createdTicket.pnrMock} · Status: {createdTicket.paymentStatus}
                  </div>
                </div>
              </div>

              {/* Specimen Ticket Card with Watermark */}
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800/80 text-xs space-y-3 overflow-hidden">
                {/* Diagonal Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-[-25deg] text-3xl font-black text-rose-600 uppercase tracking-widest select-none">
                  SPECIMEN ONLY
                </div>

                <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">PNR (Simulated)</span>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{createdTicket.pnrMock}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Class / Fare</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{createdTicket.classBooked} · ₹{createdTicket.farePaid}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px]">From</span>
                    <div className="font-semibold text-slate-900 dark:text-white">{createdTicket.fromStation.name}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">To</span>
                    <div className="font-semibold text-slate-900 dark:text-white">{createdTicket.toStation.name}</div>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px]">Passenger</span>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {createdTicket.passengers[0].name} ({createdTicket.passengers[0].age}y, {createdTicket.passengers[0].gender})
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      CRIS Dynamic Specimen QR
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono max-w-[200px] break-all">
                      {createdTicket.pnrMock} · {createdTicket.classBooked}
                    </div>
                    <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Cryptographically Formatted Specimen
                    </div>
                  </div>
                  <VisualQRCode payload={createdTicket.qrPayload} size={80} />
                </div>
              </div>

              {/* Cancellation & Action Buttons */}
              <div className="space-y-2 pt-2">
                {createdTicket.paymentStatus === 'PAID_MOCK' ? (
                  <button
                    onClick={handleCancelTicket}
                    className="w-full py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Cancel Specimen & Simulate Refund</span>
                  </button>
                ) : (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-xs text-rose-800 dark:text-rose-300 font-medium">
                    {cancellationResult || 'Ticket Cancelled and Refunded.'}
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold transition-colors"
                >
                  Done
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
