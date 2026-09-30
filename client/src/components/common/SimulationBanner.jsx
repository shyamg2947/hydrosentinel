import React from 'react';
import { Info, Sliders, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';

export const SimulationBanner = () => {
  const { simulatorState } = useSocket();

  return (
    <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 no-print">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[10px]">
          <ShieldAlert className="w-3.5 h-3.5" />
          Simulation Mode
        </span>
        <span className="font-medium">
          Demonstration system: telemetry, gas leak indices, and safety metrics are synthetic. No physical valves or shutoff circuits are connected.
        </span>
      </div>

      <div className="flex items-center gap-4 text-[11px]">
        <span className="hidden sm:inline text-amber-700 dark:text-amber-300">
          Active Scenario: <strong className="underline decoration-amber-400">{simulatorState.scenario}</strong>
        </span>
        <Link
          to="/settings"
          className="inline-flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-200 hover:text-amber-900 hover:underline"
        >
          <Sliders className="w-3.5 h-3.5" />
          Simulator Controls
        </Link>
      </div>
    </div>
  );
};

export default SimulationBanner;
