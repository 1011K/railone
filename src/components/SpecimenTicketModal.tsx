import React, { useState, useEffect } from 'react';
import { JourneyItinerary, TravelClass, SpecimenTicket } from '../types/railway';
import { MockBookingStore } from '../engine/mockBookingStore';
import { VisualQRCode } from './VisualQRCode';
import { AccessibleModal } from './common/AccessibleModal';
import { useAuthority } from './AuthorityContext';
import { InstitutionalInsignia } from './common/InstitutionalInsignia';
import { 
  Ticket, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  QrCode, 
  AlertTriangle, 
  RotateCcw, 
  Printer,
  Building2,
  Lock,
  Sparkles,
  FileCheck2,
  Info
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
  const { authority, formatCurrency } = useAuthority();
  const [step, setStep] = useState<'details' | 'otp' | 'payment' | 'confirmed'>('details');
  const [passengerName, setPassengerName] = useState('Authorized Passenger');
  const [passengerAge, setPassengerAge] = useState(28);
  const [passengerGender, setPassengerGender] = useState('M');
  const [otpCode, setOtpCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(`Official Transit Pass (${authority.currency.code})`);
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
      setPaymentMethod(`Official Transit Pass (${authority.currency.code})`);
    }
  }, [isOpen, itinerary?.id, authority.id]);

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
    }, 600);
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
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Institutional Ticket Issuance Portal"
      subtitle={`${authority.governmentBody} · Official Digital Transit Portal`}
      icon={<InstitutionalInsignia authorityId={authority.id} size={24} />}
      variant="sheet"
      maxWidthClass="max-w-lg"
    >
      <div className="space-y-4">
        {/* Institutional Statutory Authority Header */}
        <div className="bg-theme-primary/10 dark:bg-theme-primary/15 border border-theme-primary/25 p-3 rounded-2xl text-xs text-slate-800 dark:text-slate-200 flex items-start gap-3">
          <InstitutionalInsignia authorityId={authority.id} size={32} className="shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-extrabold text-[11px] text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{authority.governmentBody}</span>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
              Operating Authority: {authority.operatingAgency}
            </p>
            <p className="text-[9px] text-slate-500 dark:text-slate-400">
              {authority.statutoryAct} · Section 54 Passenger Travel Contract
            </p>
          </div>
        </div>
          
        {step === 'details' && (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {leg.train.trainNumber} · {leg.train.trainName}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px]">
                  SCHEDULED
                </span>
              </div>
              <div className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-2">
                <span>{leg.fromStation.name}</span>
                <span className="text-theme-primary">➔</span>
                <span>{itinerary.legs[itinerary.legs.length - 1].toStation.name}</span>
              </div>
              <div className="text-theme-primary font-bold text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <span>Class: {selectedClass}</span>
                <span className="font-mono text-sm">{formatCurrency(fare)}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Passenger Full Legal Name
              </label>
              <input
                type="text"
                required
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="As printed on government identity card"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-theme-primary min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={passengerAge}
                  onChange={(e) => setPassengerAge(parseInt(e.target.value, 10) || 18)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Gender
                </label>
                <select
                  value={passengerGender}
                  onChange={(e) => setPassengerGender(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white min-h-[44px]"
                >
                  <option value="M">Male (M)</option>
                  <option value="F">Female (F)</option>
                  <option value="T">Transgender (T)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-theme-primary hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all active:scale-98 min-h-[44px] flex items-center justify-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Proceed to Statutory Verification</span>
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-3.5">
            <div className="text-xs text-slate-600 dark:text-slate-300">
              A secure passenger authorization OTP has been generated for your session:
            </div>
            <div className="p-3.5 bg-theme-primary/10 border border-theme-primary/25 rounded-2xl text-center space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                Verification Authentication Token:
              </span>
              <span className="font-mono text-2xl font-black tracking-widest text-theme-primary">
                139026
              </span>
              <span className="text-[10px] text-slate-400 block">
                Valid for 10 minutes across official transit terminals
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Enter Verification Token
              </label>
              <input
                type="text"
                placeholder="139026"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center tracking-widest font-mono text-base bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 min-h-[44px] text-slate-900 dark:text-white font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-theme-primary hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all active:scale-98 min-h-[44px]"
            >
              Verify Token & Proceed to Tariff Settlement
            </button>
          </form>
        )}

        {step === 'payment' && (
          <div className="space-y-3.5">
            <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Select authorized settlement channel for {authority.shortTitle}:
            </div>

            <div className="space-y-2">
              {[
                `Official ${authority.shortTitle} Citizen Wallet (Active)`,
                `National Instant Interbank Payment (${authority.currency.code})`,
                `Sovereign Government Transit Pass Account`
              ].map((m) => (
                <label
                  key={m}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs cursor-pointer transition-all touch-target ${
                    paymentMethod === m 
                      ? 'border-theme-primary bg-theme-primary/10 font-bold text-slate-900 dark:text-white shadow-xs' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-theme-primary" />
                    <span>{m}</span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === m}
                    onChange={() => setPaymentMethod(m)}
                    className="text-theme-primary"
                  />
                </label>
              ))}
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Statutory Ticket Fare:</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-base font-mono tabular-nums">
                {formatCurrency(fare)}
              </span>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-98 min-h-[44px] flex items-center justify-center gap-2"
            >
              {isProcessing ? 'Generating Sovereign E-Ticket...' : `Authorize & Issue Transit Pass (${formatCurrency(fare)})`}
            </button>
          </div>
        )}

        {step === 'confirmed' && createdTicket && (
          <div className="space-y-3.5">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-extrabold text-xs text-emerald-950 dark:text-emerald-100">
                  Statutory Travel Pass Issued & Authenticated
                </div>
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono tabular-nums">
                  PNR: {createdTicket.pnrMock} · Authority: {authority.shortTitle}
                </div>
              </div>
            </div>

            {/* Official Sovereign Institutional Ticket Artifact */}
            <div className="relative border-2 border-theme-primary/40 rounded-3xl p-4 bg-linear-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 text-xs space-y-3 shadow-md overflow-hidden">
              
              {/* Official Security Watermark Strip */}
              <div className="bg-theme-primary/10 border-b border-theme-primary/20 -mx-4 -mt-4 px-4 py-2 flex items-center justify-between text-[9px] font-mono font-bold text-theme-primary uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <InstitutionalInsignia authorityId={authority.id} size={16} />
                  <span>{authority.securityPillText}</span>
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">● DEMO SPECIMEN · NOT VALID FOR TRAVEL</span>
              </div>

              {/* Watermark Diagonal */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-[-22deg] text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest select-none text-center px-4">
                DEMO – NOT VALID FOR TRAVEL · {authority.watermarkText}
              </div>

              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                    Official Reference (PNR)
                  </span>
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white tabular-nums">
                    {createdTicket.pnrMock}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                    Class / Tariff
                  </span>
                  <span className="font-black text-theme-primary font-mono tabular-nums">
                    {createdTicket.classBooked} · {formatCurrency(createdTicket.farePaid)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Departure</span>
                  <div className="font-bold text-slate-900 dark:text-white">{createdTicket.fromStation.name}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Destination</span>
                  <div className="font-bold text-slate-900 dark:text-white">{createdTicket.toStation.name}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Passenger Manifest</span>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {createdTicket.passengers[0].name} ({createdTicket.passengers[0].age}y, {createdTicket.passengers[0].gender})
                </div>
              </div>

              {/* QR Code and Conductor Verification Module */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
                    Inspection Cryptographic Barcode
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono max-w-[200px] break-all">
                    Inspector: {authority.inspectorTitle}
                  </div>
                  <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Verified under {authority.statutoryAct.split('(')[0]}
                  </div>
                </div>
                <div className="p-1.5 bg-white rounded-xl shadow-xs shrink-0">
                  <VisualQRCode payload={createdTicket.qrPayload} size={84} />
                </div>
              </div>
            </div>

            {/* Actions: Cancellation or Close */}
            <div className="space-y-2 pt-1">
              {createdTicket.paymentStatus === 'PAID_MOCK' ? (
                <button
                  onClick={handleCancelTicket}
                  className="w-full py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Statutory Cancellation & Wallet Refund</span>
                </button>
              ) : (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-xs text-rose-800 dark:text-rose-300 font-bold text-center">
                  {cancellationResult || 'Statutory Ticket Cancelled and Refunded.'}
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors min-h-[44px]"
              >
                Close Ticket Inspection
              </button>
            </div>

          </div>
        )}
      </div>
    </AccessibleModal>
  );
};
