import React from 'react';
import { useAuthority } from './AuthorityContext';
import { getAllAuthorities, AuthorityId } from '../models/authorities';
import { AccessibleModal } from './common/AccessibleModal';
import { InstitutionalInsignia } from './common/InstitutionalInsignia';
import { 
  Building2, 
  Check, 
  ShieldCheck, 
  Globe, 
  PhoneCall, 
  ExternalLink,
  Coins
} from 'lucide-react';

interface InstitutionalAuthoritySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstitutionalAuthoritySelectorModal: React.FC<InstitutionalAuthoritySelectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { authority: currentAuthority, setAuthorityId } = useAuthority();
  const allAuthorities = getAllAuthorities();

  const handleSelect = (id: AuthorityId) => {
    setAuthorityId(id);
    onClose();
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="National Transport Authority System"
      subtitle="Select Sovereign Transport Administration & Ticketing Authority"
      icon={<Building2 className="w-5 h-5 text-theme-primary" />}
      variant="sheet"
      maxWidthClass="max-w-xl"
    >
      <div className="space-y-4">
        {/* Institutional Charter Summary Banner */}
        <div className="p-3.5 rounded-2xl bg-blue-500/10 dark:bg-blue-950/40 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-theme-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold uppercase tracking-wider text-[11px] block">
              Multi-National Transport Administration Framework
            </span>
            <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
              Select an institutional rail authority to configure national railway schedules, 
              statutory ticket issuances, regulatory fare slabs, and official emergency directives.
            </p>
          </div>
        </div>

        {/* List of 5 Institutional Authorities */}
        <div className="space-y-2.5">
          {allAuthorities.map((auth) => {
            const isSelected = auth.id === currentAuthority.id;
            const primaryEmergency = auth.emergencyContacts.find(c => c.isPrimary) || auth.emergencyContacts[0];

            return (
              <button
                key={auth.id}
                onClick={() => handleSelect(auth.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all touch-target flex flex-col gap-2 relative ${
                  isSelected
                    ? 'bg-theme-primary/10 border-theme-primary ring-1 ring-theme-primary/40 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Header Row: Insignia + Names + Selection Checkmark */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <InstitutionalInsignia authorityId={auth.id} size={36} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {auth.countryName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {auth.countryCode}
                        </span>
                        {auth.id === 'india' && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Flagship
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5 line-clamp-1">
                        {auth.governmentBody}
                      </div>
                      <div className="text-[10px] text-theme-primary font-bold">
                        {auth.operatingAgency}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    {isSelected ? (
                      <div className="w-7 h-7 rounded-full bg-theme-primary text-white flex items-center justify-center shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400">
                        Select
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-row: Statutory Act & Key Attributes */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3 h-3 text-slate-400" />
                    <span>Currency: <strong className="text-slate-800 dark:text-slate-200">{auth.currency.code} ({auth.currency.symbol})</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PhoneCall className="w-3 h-3 text-slate-400" />
                    <span>Helpline: <strong className="text-slate-800 dark:text-slate-200">{primaryEmergency.number}</strong></span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 truncate font-mono text-[9px] text-slate-500 dark:text-slate-400">
                    {auth.statutoryAct.split('(')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Statutory Invariant Footer */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-[10px] text-slate-500 space-y-1">
          <div className="font-bold text-slate-700 dark:text-slate-300">
            Institutional Interoperability Note:
          </div>
          <p>
            Switching authority automatically updates national departure boards, suburban and high-speed corridors, 
            statutory fare algorithms, and inspection security tokens according to that country's transport regulations.
          </p>
        </div>
      </div>
    </AccessibleModal>
  );
};
