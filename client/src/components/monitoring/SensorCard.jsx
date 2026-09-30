import React from 'react';
import { Radio, AlertTriangle, Clock, CheckCircle2, XCircle, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SensorCard = ({ sensor }) => {
  const isCritical = sensor.status === 'Critical';
  const isWarning = sensor.status === 'Warning';
  const isOffline = sensor.connectionStatus === 'Offline';
  const isStale = sensor.isStale;

  const getBorderColor = () => {
    if (isCritical) return 'border-rose-500/80 shadow-rose-500/10';
    if (isWarning) return 'border-amber-500/80 shadow-amber-500/10';
    if (isOffline) return 'border-slate-300 dark:border-slate-800 opacity-75';
    if (isStale) return 'border-orange-500/70 shadow-orange-500/10';
    return 'border-slate-200 dark:border-slate-800 hover:border-teal-500/50';
  };

  const getBadge = () => {
    if (isOffline) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          <XCircle className="w-3 h-3 text-slate-400" />
          OFFLINE
        </span>
      );
    }
    if (isStale) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/40 animate-pulse">
          <Clock className="w-3 h-3 text-orange-500" />
          STALE TELEMETRY
        </span>
      );
    }
    if (isCritical) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-500" />
          CRITICAL BREACH
        </span>
      );
    }
    if (isWarning) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          WARNING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        NORMAL
      </span>
    );
  };

  return (
    <Link
      to={`/sensors/${sensor._id || sensor.sensorId}`}
      className={`group block bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden ${getBorderColor()}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
              {sensor.sensorId}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
              {sensor.sensorType || sensor.type}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {sensor.sensorName || sensor.name}
          </div>
        </div>
        {getBadge()}
      </div>

      {/* Main Metric Value */}
      <div className="mt-3 flex items-baseline justify-between">
        <div>
          <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            {isOffline ? '---' : sensor.value !== undefined ? sensor.value : (sensor.lastReading?.value ?? 0)}
          </span>
          <span className="ml-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {sensor.unit}
          </span>
        </div>
        <div className="text-[10px] text-right text-slate-400 font-mono">
          {sensor.storageUnitName || sensor.storageUnit?.name || 'Main Vessel'}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          {sensor.timestamp ? new Date(sensor.timestamp).toLocaleTimeString() : 'Live'}
        </span>
        <span className="text-[10px] uppercase font-semibold tracking-wider text-teal-600 dark:text-teal-400 opacity-90 group-hover:underline">
          Details →
        </span>
      </div>
    </Link>
  );
};
