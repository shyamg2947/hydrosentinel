import React, { useState, useEffect } from 'react';
import {
  Activity,
  Radio,
  Filter,
  RefreshCw,
  Clock,
  TrendingUp,
  AlertTriangle,
  Flame,
  Gauge,
  Wifi,
  Sliders
} from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { useFacility } from '../../contexts/FacilityContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SensorCard } from '../../components/monitoring/SensorCard';
import { TelemetryChart } from '../../components/monitoring/TelemetryChart';
import { Skeleton } from '../../components/common/Skeleton';

export const LiveMonitoring = () => {
  const { selectedFacilityId, selectedFacility, facilities, selectFacility } = useFacility();
  const { connected, lastTick, liveReadings, simulatorState } = useSocket();

  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Charts time-series data
  const [pressureHistory, setPressureHistory] = useState([]);
  const [tempHistory, setTempHistory] = useState([]);
  const [leakHistory, setLeakHistory] = useState([]);

  const fetchLiveState = async () => {
    try {
      setLoading(true);
      let url = '/telemetry/latest';
      if (selectedFacilityId) url += `?facilityId=${selectedFacilityId}`;

      const [liveRes, pRes, tRes, lRes] = await Promise.all([
        api.get(url),
        api.get(`/telemetry/history?sensorType=Pressure&limit=30${selectedFacilityId ? `&facilityId=${selectedFacilityId}` : ''}`),
        api.get(`/telemetry/history?sensorType=Temperature&limit=30${selectedFacilityId ? `&facilityId=${selectedFacilityId}` : ''}`),
        api.get(`/telemetry/history?sensorType=Hydrogen%20Leak&limit=30${selectedFacilityId ? `&facilityId=${selectedFacilityId}` : ''}`)
      ]);

      if (liveRes.success) setSensors(liveRes.data);
      if (pRes.success) setPressureHistory(pRes.data);
      if (tRes.success) setTempHistory(tRes.data);
      if (lRes.success) setLeakHistory(lRes.data);
    } catch (err) {
      console.error('Failed to load live telemetry state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveState();
  }, [selectedFacilityId]);

  // Merge live incoming socket readings into state smoothly
  useEffect(() => {
    if (liveReadings && liveReadings.length > 0) {
      setSensors((prevSensors) => {
        const liveMap = new Map(liveReadings.map(r => [r.sensorId, r]));
        return prevSensors.map((s) => {
          const fresh = liveMap.get(s.sensorId);
          if (fresh) {
            return {
              ...s,
              value: fresh.value,
              status: fresh.status,
              timestamp: fresh.timestamp,
              isStale: false
            };
          }
          return s;
        });
      });
    }
  }, [liveReadings]);

  const filteredSensors = sensors.filter((s) => {
    if (typeFilter && s.sensorType !== typeFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });

  const criticalCount = sensors.filter(s => s.status === 'Critical').length;
  const warningCount = sensors.filter(s => s.status === 'Warning').length;
  const staleCount = sensors.filter(s => s.isStale).length;
  const offlineCount = sensors.filter(s => s.connectionStatus === 'Offline').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Live Sensor Telemetry Mission Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time WebSocket streaming telemetry from storage manifolds, thermowells, and catalytic leak detectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Stream Status</div>
            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {connected ? 'BROADCASTING' : 'OFFLINE'}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLiveState}
            icon={RefreshCw}
          >
            Manual Sync
          </Button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-[11px] text-slate-500">Normal Readings</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-0.5">
            {sensors.length - criticalCount - warningCount - offlineCount}
          </div>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-[11px] text-amber-600">Warning Status</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-0.5">
            {warningCount}
          </div>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-[11px] text-rose-600">Critical Alarms</div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-0.5">
            {criticalCount}
          </div>
        </div>
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-[11px] text-slate-500">Offline / Stale</div>
          <div className="text-2xl font-bold font-mono text-slate-600 dark:text-slate-400 mt-0.5">
            {offlineCount + staleCount}
          </div>
        </div>
      </div>

      {/* Real-time Streaming Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Pressure Waveforms (bar)"
          subtitle="Storage vessel manifold pressures"
          icon={Gauge}
        >
          <TelemetryChart
            data={pressureHistory}
            dataKey="value"
            unit="bar"
            color="#0d9488"
            height={200}
          />
        </Card>

        <Card
          title="Containment Temperature (°C)"
          subtitle="Core thermowell readings"
          icon={TrendingUp}
        >
          <TelemetryChart
            data={tempHistory}
            dataKey="value"
            unit="°C"
            color="#0284c7"
            height={200}
          />
        </Card>

        <Card
          title="Hydrogen Flammability (ppm)"
          subtitle="Stationary area sniffer leak detectors"
          icon={Flame}
        >
          <TelemetryChart
            data={leakHistory}
            dataKey="value"
            unit="ppm"
            color="#e11d48"
            height={200}
          />
        </Card>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Filter Transducers:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs px-2.5 py-1.5 focus:outline-none"
          >
            <option value="">All Sensor Types</option>
            <option value="Pressure">Pressure (bar)</option>
            <option value="Temperature">Temperature (°C)</option>
            <option value="Hydrogen Leak">Hydrogen Leak (ppm)</option>
            <option value="Flow Rate">Flow Rate (kg/h)</option>
            <option value="Vibration">Vibration (mm/s)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs px-2.5 py-1.5 focus:outline-none"
          >
            <option value="">All Health Statuses</option>
            <option value="Normal">Normal</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredSensors.length} of {sensors.length} live channels
        </div>
      </div>

      {/* Sensor Cards Live Stream */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Skeleton className="h-44" count={8} />
        </div>
      ) : filteredSensors.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          No live sensors matching the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSensors.map((sensor) => (
            <SensorCard key={sensor.sensorId} sensor={sensor} />
          ))}
        </div>
      )}
    </div>
  );
};
