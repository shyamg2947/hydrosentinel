import React, { useState, useEffect } from 'react';
import {
  Building2,
  Database,
  Radio,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  RefreshCw,
  Clock,
  Layers,
  Flame,
  CheckCircle2,
  AlertOctagon,
  Compass
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { useFacility } from '../contexts/FacilityContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { TelemetryChart } from '../components/monitoring/TelemetryChart';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedFacilityId, selectedFacility } = useFacility();
  const { lastTick, liveReadings } = useSocket();

  const [metrics, setMetrics] = useState(null);
  const [pressureHistory, setPressureHistory] = useState([]);
  const [temperatureHistory, setTemperatureHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [metricsRes, pHistoryRes, tHistoryRes] = await Promise.all([
        api.get('/analytics/executive-dashboard'),
        api.get(`/telemetry/history?sensorType=Pressure&limit=30${selectedFacilityId ? `&facilityId=${selectedFacilityId}` : ''}`),
        api.get(`/telemetry/history?sensorType=Temperature&limit=30${selectedFacilityId ? `&facilityId=${selectedFacilityId}` : ''}`)
      ]);

      if (metricsRes.success) setMetrics(metricsRes.data);
      if (pHistoryRes.success) setPressureHistory(pHistoryRes.data);
      if (tHistoryRes.success) setTemperatureHistory(tHistoryRes.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedFacilityId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32" count={4} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72" count={2} />
        </div>
      </div>
    );
  }

  const facilityStatus = metrics?.facilityStatusCounts || {};
  const sensorStats = metrics?.sensorStats || {};
  const woStats = metrics?.workOrderStats || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Executive Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time hydrogen storage facility telemetry, critical barrier integrity, and compliance indicators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase font-mono text-slate-400">Telemetry Pulse</div>
            <div className="text-xs font-mono font-semibold text-teal-600 dark:text-teal-400">
              {lastTick ? new Date(lastTick).toLocaleTimeString() : 'Awaiting packet...'}
            </div>
          </div>
          <Link to="/india-map">
            <Button
              variant="outline"
              size="sm"
              icon={Compass}
            >
              India Facilities Map
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={refreshing}
            icon={RefreshCw}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Facilities & Units */}
        <Card
          className="hover:border-teal-500/40 cursor-pointer"
          onClick={() => navigate('/facilities')}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Facilities</p>
              <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {metrics?.facilitiesCount || 0}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {metrics?.storageUnitsCount || 0} storage units monitored
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {facilityStatus.Normal || 0} Normal
            </span>
            <span className="text-amber-600 dark:text-amber-400">{facilityStatus.Warning || 0} Warning</span>
            <span className="text-rose-600 dark:text-rose-400">{facilityStatus.Critical || 0} Critical</span>
          </div>
        </Card>

        {/* KPI 2: Sensor Health */}
        <Card
          className="hover:border-sky-500/40 cursor-pointer"
          onClick={() => navigate('/sensors')}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Sensor Connectivity</p>
              <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {sensorStats.online || 0} / {sensorStats.total || 0}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Online transceivers (99.4% uptime)
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">{sensorStats.offline || 0} Offline</span>
            <span className="text-amber-600 dark:text-amber-400">
              {sensorStats.calOverdue || 0} Calibration Overdue
            </span>
          </div>
        </Card>

        {/* KPI 3: Active Alarms */}
        <Card
          className="hover:border-rose-500/40 cursor-pointer"
          onClick={() => navigate('/alerts')}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Alarms</p>
              <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {metrics?.activeAlerts || 0}
              </h3>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                {metrics?.unackCriticalAlerts || 0} unacknowledged critical
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Triage queue: {metrics?.activeAlerts || 0} open</span>
            <span className="text-teal-600 dark:text-teal-400 font-medium">Review →</span>
          </div>
        </Card>

        {/* KPI 4: Compliance & Work Orders */}
        <Card
          className="hover:border-emerald-500/40 cursor-pointer"
          onClick={() => navigate('/compliance')}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Safety Compliance Rate</p>
              <h3 className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {metrics?.complianceRate || 95}%
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {woStats.overdue || 0} overdue maintenance tasks
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>{woStats.upcoming || 0} work orders due this week</span>
            <span className="text-teal-600 dark:text-teal-400 font-medium">Audit →</span>
          </div>
        </Card>
      </div>

      {/* Facilities Quick Matrix & Storage Capacity Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Facility Status Overview */}
        <Card
          title="Facility Operational Health"
          subtitle="Real-time multi-site monitoring status"
          icon={Building2}
          className="lg:col-span-2"
          action={
            <Link to="/facilities" className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline">
              View All Facilities →
            </Link>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {metrics?.facilities?.map((f) => (
              <div
                key={f._id}
                onClick={() => navigate(`/facilities/${f._id}`)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-teal-500/50 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    {f.code}
                  </span>
                  <Badge variant={f.status.toLowerCase()} size="sm" dot>
                    {f.status}
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {f.name}
                </h4>
                <div className="mt-2 text-xs text-slate-500 flex justify-between">
                  <span>Storage:</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                    {f.currentStorageKg} / {f.totalCapacityKg} kg
                  </span>
                </div>
                {/* Micro progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.round((f.currentStorageKg / f.totalCapacityKg) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Global Storage Capacity & Utilization */}
        <Card
          title="Network Storage Capacity"
          subtitle="Fleet-wide hydrogen volume tracking"
          icon={Layers}
        >
          <div className="text-center py-2">
            <div className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white">
              {metrics?.storageUtilizationPercent || 0}%
            </div>
            <p className="text-xs text-slate-500 mt-1">Total Utilization Index</p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full mt-4 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                className="bg-gradient-to-r from-teal-500 to-sky-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics?.storageUtilizationPercent || 0}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-2 font-mono">
              <span>{metrics?.currentStoredKg?.toLocaleString()} kg stored</span>
              <span>{metrics?.totalStorageCapacity?.toLocaleString()} kg capacity</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Pressure hold envelope: 350-700 bar gaseous cylinder banks & cryo LH2 vessels.
          </div>
        </Card>
      </div>

      {/* Historical Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Hydrogen Storage Pressure Trends (bar)"
          subtitle="Aggregated time-series trend over the last 24 hours"
          icon={TrendingUp}
          action={
            <Link to="/monitoring" className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline">
              Live Feed →
            </Link>
          }
        >
          <TelemetryChart
            data={pressureHistory}
            dataKey="value"
            unit="bar"
            color="#0d9488"
            height={220}
          />
        </Card>

        <Card
          title="Vessel Temperature Stability (°C)"
          subtitle="Thermal monitoring across containment boundaries"
          icon={Activity}
          action={
            <Link to="/monitoring" className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline">
              Live Feed →
            </Link>
          }
        >
          <TelemetryChart
            data={temperatureHistory}
            dataKey="value"
            unit="°C"
            color="#0284c7"
            height={220}
          />
        </Card>
      </div>

      {/* Active Alerts Panel & Upcoming Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alarms Priority Feed */}
        <Card
          title="Active Alarm Priority Queue"
          subtitle="Incidents requiring immediate operator acknowledgement"
          icon={AlertTriangle}
          action={
            <Link to="/alerts" className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline">
              View All ({metrics?.activeAlerts || 0}) →
            </Link>
          }
        >
          <div className="space-y-3">
            {metrics?.recentAlerts?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                Zero unacknowledged alarms. Storage parameters within normal envelope.
              </div>
            ) : (
              metrics?.recentAlerts?.map((a) => (
                <div
                  key={a._id}
                  onClick={() => navigate(`/alerts/${a._id}`)}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={a.severity.toLowerCase()} size="sm" dot>
                        {a.severity}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {a.facility?.code}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 mt-1 truncate">
                      {a.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {a.category} • Sensor {a.sensor?.sensorId || 'System'}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Maintenance Due-Soon & Work Orders */}
        <Card
          title="Preventive Maintenance Schedule"
          subtitle="Upcoming sensor calibrations and vessel examinations"
          icon={Wrench}
          action={
            <Link to="/maintenance/work-orders" className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline">
              Work Orders →
            </Link>
          }
        >
          <div className="space-y-3">
            {metrics?.recentWorkOrders?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No open maintenance orders scheduled.
              </div>
            ) : (
              metrics?.recentWorkOrders?.map((wo) => (
                <div
                  key={wo._id}
                  onClick={() => navigate(`/maintenance/work-orders/${wo._id}`)}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400">
                        {wo.workOrderNumber}
                      </span>
                      <Badge variant={wo.status === 'In Progress' ? 'info' : 'default'} size="sm">
                        {wo.status}
                      </Badge>
                    </div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 mt-1 truncate">
                      {wo.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Assigned to: {wo.assignedTo?.name || 'Unassigned'} • Due:{' '}
                      {new Date(wo.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={wo.priority.toLowerCase()} size="sm">
                    {wo.priority}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
