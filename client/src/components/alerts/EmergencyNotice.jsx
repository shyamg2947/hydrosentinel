import React from 'react';
import { ShieldAlert, PhoneCall, ExternalLink } from 'lucide-react';

export const EmergencyNotice = ({ procedureCode = 'SOP-H2-EMG-01' }) => {
  return (
    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-xs text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-rose-800 dark:text-rose-300 text-sm">
            Emergency Response Advisory ({procedureCode})
          </h4>
          <p className="mt-0.5 text-rose-700 dark:text-rose-300 opacity-90 max-w-2xl leading-relaxed">
            HydroSentinel is a monitoring and decision-support tool. In case of confirmed flammable gas concentration or uncontained pressure relief, immediately initiate manual plant shutdown, clear downwind exclusion zones, and notify local first responders.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href="/compliance/documents"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Site ERP
        </a>
      </div>
    </div>
  );
};
