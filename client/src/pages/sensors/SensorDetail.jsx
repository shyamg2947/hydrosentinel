import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Radio,
  ArrowLeft,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  Calendar,
  Building2,
  Layers,
  Activity
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Skeleton } from '../../components/common/Skeleton';
import { TelemetryChart } from '../../components/monitoring/TelemetryChart';

export const SensorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isTechnician } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCalModalOpen, setIsCalModalOpen] = useState(false);
  const [calNotes, setCalNotes] = useState('');
  const [calCert, setCalCert] = useState('NIST-CAL-2026-991');
  const [calSubmitting, setCalSubmitting] = useState(false);

  const fetchSensor = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/sensors/${id}`);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load sensor detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensor();
  }, [id]);

  const handleExecuteCalibration = async () => {
    try {
      setCalSubmitting(true);
      const res = await api.post(`/sensors/${id}/calibrate`, {
        calibrationNotes: calNotes,
        technicianCertificate: calCert
      });
      if (res.success) {
        setIsCalModalOpen(false);
        setCalNotes('');
        fetchSensor();
      }
    } catch (err) {
      alert(err.message || 'Calibration logging failed');
    } finally {
      setCalSubmitting(false);
    }
  };

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-44" /><Skeleton className="h-72" /></div>;
  }

  const sensor = data?.sensor;
  if (!sensor) {
    return <div className="p-8 text-center text-slate-500">Sensor not found.</div>;
  }

  const isStale = data?.isStale;
  const telemetryHistory = data?.recentTelemetry || [];
  const relatedAlerts = data?.relatedAlerts || [];
  const relatedWorkOrders = data?.relatedWorkOrders || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/sensors" className="hover:text-teal-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sensors
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium">{sensor.sensorId}</span>
      </div>

      {/* Sensor Hero Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {sensor.sensorId}
            </span>
            <Badge variant={sensor.status.toLowerCase()} size="md" dot>
              {sensor.status}
            </Badge>
            {isStale && (
              <Badge variant="warning" size="md">
                Stale Telemetry Notice
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {sensor.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mounted at: {sensor.locationDescription} • Serial #{sensor.serialNumber || 'N/A'} • Mfg: {sensor.manufacturer}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-right min-w-[130px]">
            <div className="text-xs text-slate-400">Current Reading</div>
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
              {sensor.connectionStatus === 'Offline' ? '---' : (sensor.lastReading?.value ?? 0)}
              <span className="text-xs font-normal text-slate-500 ml-1">{sensor.unit}</span>
            </div>
          </div>

          {isTechnician && (
            <Button
              variant="primary"
              size="sm"
              icon={Wrench}
              onClick={() => setIsCalModalOpen(true)}
            >
              Log Calibration
            </Button>
          )}
        </div>
      </div>

      {/* High-Resolution Telemetry Chart */}
      <Card
        title={`Live Time-Series Waveform (${sensor.unit})`}
        subtitle="Recent data points acquired by telemetry engine"
        icon={Activity}
      >
        <TelemetryChart
          data={telemetryHistory}
          dataKey="value"
          unit={sensor.unit}
          color={sensor.type === 'Hydrogen Leak' ? '#e11d48' : '#0d9488'}
          height={280}
        />
      </Card>

      {/* Metadata & Calibration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Transducer Specifications & Calibration" icon={Clock}>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Facility Location:</span>
              <Link to={`/facilities/${sensor.facility?._id}`} className="font-semibold text-teal-600 hover:underline">
                {sensor.facility?.name} ({sensor.facility?.code})
              </Link>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Storage Vessel:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {sensor.storageUnit?.name || 'Main Manifold'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Last Calibrated:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {sensor.lastCalibrationDate ? new Date(sensor.lastCalibrationDate).toLocaleDateString() : 'Initial Commission'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Next Calibration Due:</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                {sensor.nextCalibrationDue ? new Date(sensor.nextCalibrationDue).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Data Source:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                Synthetic Simulated Telemetry
              </span>
            </div>
          </div>
        </Card>

        {/* Associated Alarms & Maintenance */}
        <Card title="Incident & Service History" icon={AlertTriangle}>
          <div className="space-y-3">
            {relatedAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No alert history logged for this sensor.</p>
            ) : (
              relatedAlerts.map((a) => (
                <div
                  key={a._id}
                  onClick={() => navigate(`/alerts/${a._id}`)}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs hover:border-teal-500 cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <Badge variant={a.severity.toLowerCase()} size="sm" dot>
                      {a.severity}
                    </Badge>
                    <span className="font-medium text-slate-800 dark:text-slate-200 ml-2">{a.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Calibration Modal */}
      <Modal
        isOpen={isCalModalOpen}
        onClose={() => setIsCalModalOpen(false)}
        title={`Perform Calibration: ${sensor.sensorId}`}
        subtitle="Submit zero and span accuracy verification"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsCalModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={calSubmitting}
              onClick={handleExecuteCalibration}
            >
              Certify Calibration
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="NIST Calibration Certificate #"
            required
            value={calCert}
            onChange={(e) => setCalCert(e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Calibration Inspection Notes
            </label>
            <textarea
              rows={3}
              value={calNotes}
              onChange={(e) => setCalNotes(e.target.value)}
              placeholder="Sensor zero/span adjusted. Loop verified within +/- 0.1% FS tolerance."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
