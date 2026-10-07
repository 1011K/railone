import React from 'react';
import { 
  BookOpen, 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle, 
  Table, 
  FileText,
  Users
} from 'lucide-react';

export const RulesReferenceView: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <section aria-label="Railway Rules & Regulations" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Indian Railways Regulatory & Fare Architecture Reference
          </h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
          Authoritative operational guidelines governing suburban EMU services, Mail/Express short-hop restrictions, Monthly Season Ticket (MST) validity, and the honest crowd estimation charter.
        </p>
      </section>

      {/* Grid: MST Trains & Legal Penalties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Central Railway MST Authorized List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs text-xs">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Central Railway MST Authorized Trains</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            By Central Railway notification, suburban Monthly Season Ticket (MST) holders may ONLY board designated Mail/Express trains with unreserved General Second Class (GS) coaches:
          </p>
          <div className="space-y-2 border-t pt-3 border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="font-bold text-emerald-950 dark:text-emerald-100">12124 / 12123 Deccan Queen Express</span>
              <p className="text-emerald-800 dark:text-emerald-300 text-[11px] mt-0.5">
                PERMITTED: Between Dadar and Kalyan in General Second Class coaches only. Boarding AC Chair Car is prohibited.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="font-bold text-emerald-950 dark:text-emerald-100">12126 Pragati Express / 12128 Intercity</span>
              <p className="text-emerald-800 dark:text-emerald-300 text-[11px] mt-0.5">
                PERMITTED: Subject to suburban superfast surcharge. General coaches only.
              </p>
            </div>
          </div>
        </div>

        {/* Section 138 Penalties & Non-Permitted Trains */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs text-xs">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Strictly Prohibited Services & Penalties</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Commuters must never assume every Express train calling at suburban stations is boardable:
          </p>
          <div className="space-y-2 border-t pt-3 border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <span className="font-bold text-rose-950 dark:text-rose-100">11020 Konark Express & Non-MST Trains</span>
              <p className="text-rose-800 dark:text-rose-300 text-[11px] mt-0.5">
                PROHIBITED: Suburban season tickets and ordinary local tickets are NOT valid. Minimum Mail/Express distance rule (50km) applies.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <span className="font-bold text-rose-950 dark:text-rose-100">Section 138 & 155 of Railways Act 1989</span>
              <p className="text-rose-800 dark:text-rose-300 text-[11px] mt-0.5">
                Traveling without authorized ticket or boarding reserved coaches with unreserved pass incurs fare plus penalty of ₹250 or imprisonment.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Fare Tariff Slabs Table */}
      <section aria-label="Official Fare Tariff Slabs" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Table className="w-4 h-4 text-blue-600" />
          <span>Mumbai Suburban Fare Slabs (Single Journey, Official Revised Tariff)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Distance Slab</th>
                <th className="py-2.5 px-3">Second Class (II)</th>
                <th className="py-2.5 px-3">First Class (I)</th>
                <th className="py-2.5 px-3">AC Local EMU</th>
                <th className="py-2.5 px-3">Sample Route</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-medium">1 – 10 km</td>
                <td className="py-2.5 px-3 font-mono tabular-nums">₹5</td>
                <td className="py-2.5 px-3 font-mono tabular-nums">₹50</td>
                <td className="py-2.5 px-3 font-mono tabular-nums">₹35</td>
                <td className="py-2.5 px-3 text-slate-400">CSMT – Byculla / Dadar</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">11 – 20 km</td>
                <td className="py-2.5 px-3 font-mono tabular-nums">₹10</td>
                <td className="py-2.5 px-3 font-mono tabular-nums">₹85</td>
                <td className="py-2.5 px-3 font-mono tabular-nums">₹65</td>
                <td className="py-2.5 px-3 text-slate-400">Dadar – Ghatkopar</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">21 – 35 km</td>
                <td className="py-2.5 px-3 font-mono tabular-nums">₹10</td>
                <td className="py-2.5 px-3 font-mono tabular-nums">₹105</td>
                <td className="py-2.5 px-3 font-mono tabular-nums">₹95</td>
                <td className="py-2.5 px-3 text-slate-400">Thane – Dadar / CSMT</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">36 – 55 km</td>
                <td className="py-2.5 px-3 font-mono tabular-nums">₹15</td>
                <td className="py-2.5 px-3 font-mono tabular-nums">₹140</td>
                <td className="py-2.5 px-3 font-mono tabular-nums">₹135</td>
                <td className="py-2.5 px-3 text-slate-400">Kalyan – Dadar / CSMT</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">56+ km</td>
                <td className="py-2.5 px-3 font-mono tabular-nums">₹20</td>
                <td className="py-2.5 px-3 font-mono tabular-nums">₹165</td>
                <td className="py-2.5 px-3 font-mono tabular-nums">₹180</td>
                <td className="py-2.5 px-3 text-slate-400">Churchgate – Virar / Karjat</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Crowd Discipline Explanation */}
      <section aria-label="Crowding Methodology" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Crowd Intelligence Philosophy (Zero Pseudo-Precision)</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          RailOne Next strictly rejects fabricated crowd percentages such as <em>"78.4% packed"</em>. Suburban passenger loading changes dynamically with time, direction, train delays, and platform bunching. We classify crowd into four auditable categories:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="font-bold text-emerald-800 dark:text-emerald-200">LOW</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Off-peak or counter-flow direction. Seating readily available.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
            <span className="font-bold text-blue-800 dark:text-blue-200">MODERATE</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Regular patronage. Standee space accessible without vestibule blockage.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
            <span className="font-bold text-amber-800 dark:text-amber-200">HEAVY</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Peak rush hour. High door congestion and restricted movement.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
            <span className="font-bold text-rose-800 dark:text-rose-200">CRUSH LOAD</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Compounded bunching or preceding train cancellation surge.</p>
          </div>
        </div>
      </section>

    </div>
  );
};
