import React, { useState, useEffect } from 'react';
import {
  Radio,
  Search,
  Filter,
  Plus,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useFacility } from '../../contexts/FacilityContext';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';

export const SensorInventory = () => {
  const navigate = useNavigate();
  const { isFacilityManager, isTechnician, isSuperAdmin } = useAuth();
  const { selectedFacilityId, facilities } = useFacility();

  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Calibration modal state
  const [calibratingSensor, setCalibratingSensor] = useState(null);
  const [calNotes, setCalNotes] = useState('');
  const [calCert, setCalCert] = useState('NIST-CAL-2026-991');
  const [calSubmitting, setCalSubmitting] = useState(false);

  const fetchSensors = async () => {
    try {
      setLoading(true);
      let url = `/sensors?search=${encodeURIComponent(search)}`;
      if (selectedFacilityId) url += `&facility=${selectedFacilityId}`;
      if (typeFilter) url += `&type=${typeFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const res = await api.get(url);
      if (res.success) {
        setSensors(res.data);
      }
    } catch (err) {
      console.error('Failed to load sensors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchSensors, 200);
    return () => clearTimeout(timer);
  }, [search, typeFilter, statusFilter, selectedFacilityId]);

  const handleExecuteCalibration = async () => {
    if (!calibratingSensor) return;
    try {
      setCalSubmitting(true);
      const res = await api.post(`/sensors/${calibratingSensor._id}/calibrate`, {
        calibrationNotes: calNotes,
        technicianCertificate: calCert
      });
      if (res.success) {
        setCalibratingSensor(null);
        setCalNotes('');
        fetchSensors();
      }
    } catch (err) {
      alert(err.message || 'Calibration logging failed');
    } finally {
      setCalSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Sensor ID',
      accessor: 'sensorId',
      render: (row) => (
        <span
          onClick={() => navigate(`/sensors/${row._id}`)}
          className="font-mono font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
        >
          {row.sensorId}
        </span>
      )
    },
    {
      header: 'Name & Type',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-200">{row.name}</div>
          <span className="text-[10px] text-slate-500 uppercase">{row.type}</span>
        </div>
      )
    },
    {
      header: 'Location / Vessel',
      render: (row) => (
        <div className="text-xs">
          <div className="font-medium text-slate-700 dark:text-slate-300">{row.storageUnit?.name || 'General Header'}</div>
          <div className="text-[11px] text-slate-400">{row.facility?.name}</div>
        </div>
      )
    },
    {
      header: 'Live Reading',
      render: (row) => (
        <div className="font-mono font-semibold text-slate-900 dark:text-white">
          {row.connectionStatus === 'Offline' ? '---' : row.lastReading?.value !== undefined ? row.lastReading.value : '0'}{' '}
          <span className="text-xs text-slate-400">{row.unit}</span>
        </div>
      )
    },
    {
      header: 'Health Status',
      render: (row) => {
        let variant = 'normal';
        if (row.effectiveStatus === 'Critical') variant = 'critical';
        else if (row.effectiveStatus === 'Warning') variant = 'warning';
        else if (row.effectiveStatus === 'Calibration Overdue') variant = 'purple';
        else if (row.effectiveStatus === 'Offline') variant = 'offline';

        return (
          <Badge variant={variant} size="sm" dot>
            {row.effectiveStatus}
          </Badge>
        );
      }
    },
    {
      header: 'Next Calibration',
      render: (row) => {
        const isOverdue = row.isCalibrationOverdue;
        return (
          <div className="text-xs font-mono">
            <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-400'}>
              {row.nextCalibrationDue ? new Date(row.nextCalibrationDue).toLocaleDateString() : 'N/A'}
            </span>
            {isOverdue && (
              <span className="block text-[10px] text-rose-500 uppercase font-semibold">Overdue</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {isTechnician && (
            <Button
              variant="outline"
              size="sm"
              icon={Wrench}
              onClick={() => setCalibratingSensor(row)}
            >
              Calibrate
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/sensors/${row._id}`)}
          >
            Details
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Sensor Instrumentation & Calibration Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Transducer registry, telemetry status, zero/span calibration intervals, and hardware health tracking.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by sensor ID (e.g. SEN-MOJ-PT-01), name, manufacturer..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="" className="dark:bg-slate-900">All Sensor Types</option>
            <option value="Pressure" className="dark:bg-slate-900">Pressure</option>
            <option value="Temperature" className="dark:bg-slate-900">Temperature</option>
            <option value="Hydrogen Leak" className="dark:bg-slate-900">Hydrogen Leak</option>
            <option value="Flow Rate" className="dark:bg-slate-900">Flow Rate</option>
            <option value="Vibration" className="dark:bg-slate-900">Vibration</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="" className="dark:bg-slate-900">All Statuses</option>
            <option value="Active" className="dark:bg-slate-900">Active</option>
            <option value="Calibration Overdue" className="dark:bg-slate-900">Calibration Overdue</option>
            <option value="Warning" className="dark:bg-slate-900">Warning</option>
            <option value="Critical" className="dark:bg-slate-900">Critical</option>
            <option value="Offline" className="dark:bg-slate-900">Offline</option>
          </select>
        </div>
      </div>

      {/* Sensor Table */}
      <Table
        columns={columns}
        data={sensors}
        isLoading={loading}
        emptyMessage="No sensors found matching search parameters."
      />

      {/* Calibration Execution Modal */}
      <Modal
        isOpen={!!calibratingSensor}
        onClose={() => setCalibratingSensor(null)}
        title={`Execute Calibration: ${calibratingSensor?.sensorId}`}
        subtitle="Record NIST-traceable multi-point calibration verification"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setCalibratingSensor(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={calSubmitting}
              onClick={handleExecuteCalibration}
            >
              Sign & Certify Calibration
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/40 text-xs">
            <span className="font-semibold text-teal-800 dark:text-teal-200 block">
              Instrument: {calibratingSensor?.name} ({calibratingSensor?.unit})
            </span>
            <span className="text-slate-500">
              Serial No: {calibratingSensor?.serialNumber || 'N/A'} • Interval: {calibratingSensor?.calibrationIntervalDays} days
            </span>
          </div>

          <Input
            label="Reference Standards Certificate #"
            required
            value={calCert}
            onChange={(e) => setCalCert(e.target.value)}
            placeholder="e.g. NIST-CAL-2026-991"
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Calibration Verification Notes
            </label>
            <textarea
              rows={3}
              value={calNotes}
              onChange={(e) => setCalNotes(e.target.value)}
              placeholder="Performed 5-point pressure span. Zero offset calibrated to 0.00. Sensor returned to service."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
