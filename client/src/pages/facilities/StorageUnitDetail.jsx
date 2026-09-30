import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowLeft,
  Radio,
  AlertTriangle,
  Wrench,
  Gauge,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { SensorCard } from '../../components/monitoring/SensorCard';

export const StorageUnitDetail = () => {
  const { facilityId, id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/storage-units/${id}`);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load storage unit detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
  }, [id]);

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-64" count={2} /></div>;
  }

  const unit = data?.unit;
  if (!unit) {
    return <div className="p-8 text-center text-slate-500">Storage unit not found.</div>;
  }

  const sensors = data?.sensors || [];
  const alerts = data?.activeAlerts || [];
  const workOrders = data?.workOrders || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to={`/facilities/${unit.facility?._id || facilityId}`} className="hover:text-teal-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Facility Detail
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium">{unit.name}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              {unit.unitId}
            </span>
            <Badge variant={unit.status.toLowerCase()} size="md" dot>
              {unit.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {unit.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {unit.type} • Installed at {unit.facility?.name} ({unit.facility?.code})
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="text-xs text-slate-400">Design Working P</div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {unit.maxWorkingPressureBar} <span className="text-xs font-normal">bar</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="text-xs text-slate-400">Internal Volume</div>
            <div className="text-xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-0.5">
              {unit.volumeM3} <span className="text-xs font-normal">m³</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Sensors Grid */}
      <Card
        title={`Instrumented Sensor Transducers (${sensors.length})`}
        subtitle="Pressure, temperature, and flammability leak sensors mounted on vessel body"
        icon={Radio}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map((sensor) => (
            <SensorCard key={sensor._id} sensor={sensor} />
          ))}
        </div>
      </Card>

      {/* Active Alarms & Work Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Active Storage Vessel Alarms"
          subtitle="Direct threshold breach notifications"
          icon={AlertTriangle}
        >
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              All vessel telemetry within approved operational limits.
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div
                  key={a._id}
                  onClick={() => navigate(`/alerts/${a._id}`)}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-teal-500 cursor-pointer text-xs"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={a.severity.toLowerCase()} size="sm" dot>
                      {a.severity}
                    </Badge>
                    <span className="font-mono text-[10px] text-slate-400">{new Date(a.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mt-1">{a.title}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Vessel Maintenance History"
          subtitle="Preventive inspections and valve overhauls"
          icon={Wrench}
        >
          {workOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent work orders recorded for this vessel.
            </div>
          ) : (
            <div className="space-y-3">
              {workOrders.map((wo) => (
                <div
                  key={wo._id}
                  onClick={() => navigate(`/maintenance/work-orders/${wo._id}`)}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-teal-500 cursor-pointer text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-teal-600 font-semibold">{wo.workOrderNumber}</span>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{wo.title}</div>
                  </div>
                  <Badge variant={wo.status === 'Completed' ? 'normal' : 'default'} size="sm">
                    {wo.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
