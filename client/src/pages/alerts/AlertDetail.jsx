import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  UserCheck,
  Building2,
  Radio,
  Layers,
  History,
  ShieldAlert,
  FileCheck,
  Send
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Input';
import { Skeleton } from '../../components/common/Skeleton';
import { EmergencyNotice } from '../../components/alerts/EmergencyNotice';

export const AlertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSafetyOfficer, isFacilityManager, isTechnician } = useAuth();

  const [alert, setAlert] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status transition state
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAlert = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/alerts/${id}`);
      if (res.success) {
        setAlert(res.data);
      }
    } catch (err) {
      console.error('Failed to load alert detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users?limit=50');
      if (res.success) setUsers(res.data);
    } catch (e) {
      // Ignored
    }
  };

  useEffect(() => {
    fetchAlert();
    fetchUsers();
  }, [id]);

  const handleAcknowledge = async () => {
    try {
      setSubmitting(true);
      const res = await api.post(`/alerts/${id}/acknowledge`);
      if (res.success) fetchAlert();
    } catch (err) {
      window.alert(err.message || 'Failed to acknowledge alert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedAssignee) return;
    try {
      setSubmitting(true);
      const res = await api.post(`/alerts/${id}/assign`, {
        assignedTo: selectedAssignee,
        notes: `Assigned via web alert console by ${user?.name}`
      });
      if (res.success) {
        setIsAssignModalOpen(false);
        fetchAlert();
      }
    } catch (err) {
      window.alert(err.message || 'Failed to assign alert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setSubmitting(true);
      const res = await api.put(`/alerts/${id}/status`, {
        status: newStatus,
        resolutionNotes,
        rootCauseAnalysis: rootCause
      });
      if (res.success) {
        setIsResolveModalOpen(false);
        fetchAlert();
      }
    } catch (err) {
      window.alert(err.message || 'Failed to update alert status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-44" /><Skeleton className="h-72" /></div>;
  }

  if (!alert) {
    return <div className="p-8 text-center text-slate-500">Alert record not found.</div>;
  }

  const isCritical = alert.severity === 'Critical';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/alerts" className="hover:text-teal-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Alerts
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium">{alert.title}</span>
      </div>

      {/* Emergency Notice if critical */}
      {isCritical && <EmergencyNotice procedureCode="SOP-H2-EMG-01" />}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <Badge variant={alert.severity.toLowerCase()} size="md" dot>
              {alert.severity} Incident
            </Badge>
            <Badge variant={alert.status === 'Resolved' ? 'normal' : 'default'} size="md">
              Status: {alert.status}
            </Badge>
            <span className="text-xs font-mono text-slate-400">
              {new Date(alert.createdAt).toLocaleString()}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {alert.title}
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            {alert.description}
          </p>
        </div>

        {/* Lifecycle action buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {alert.status === 'New' && (
            <Button
              variant="warning"
              size="sm"
              isLoading={submitting}
              onClick={handleAcknowledge}
            >
              Acknowledge Alert
            </Button>
          )}

          {(alert.status === 'New' || alert.status === 'Acknowledged') && (isSafetyOfficer || isFacilityManager) && (
            <Button
              variant="outline"
              size="sm"
              icon={UserCheck}
              onClick={() => setIsAssignModalOpen(true)}
            >
              Assign
            </Button>
          )}

          {alert.status !== 'Resolved' && alert.status !== 'Closed' && (
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={() => setIsResolveModalOpen(true)}
            >
              Resolve Alert
            </Button>
          )}
        </div>
      </div>

      {/* Incident Context Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Measured Telemetry Breach */}
        <Card title="Threshold Evaluation" icon={AlertTriangle}>
          <div className="text-center py-2">
            <div className="text-xs text-slate-500">Triggered Telemetry Value</div>
            <div className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1">
              {alert.triggeredValue} <span className="text-sm font-normal text-slate-500">{alert.unit}</span>
            </div>
            <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400">
              Configured Limit: <strong>{alert.thresholdValue} {alert.unit}</strong>
            </div>
          </div>
        </Card>

        {/* Affected Hardware */}
        <Card title="Source Instrument" icon={Radio}>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Sensor ID:</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{alert.sensor?.sensorId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Facility:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{alert.facility?.name}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Storage Unit:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{alert.storageUnit?.name || 'Main Manifold'}</span>
            </div>
          </div>
        </Card>

        {/* Personnel Ownership */}
        <Card title="Personnel Assignment" icon={UserCheck}>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Acknowledged By:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{alert.acknowledgedBy?.name || 'Pending'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Assigned Lead:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{alert.assignedTo?.name || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Resolved By:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{alert.resolvedBy?.name || 'Unresolved'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Resolution Notes if Resolved */}
      {alert.resolutionNotes && (
        <Card title="Verified Resolution & Root Cause" icon={FileCheck}>
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Resolution Summary:</span>
              <p className="mt-1 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg leading-relaxed">
                {alert.resolutionNotes}
              </p>
            </div>
            {alert.rootCauseAnalysis && (
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Root Cause Analysis (RCA):</span>
                <p className="mt-1 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg leading-relaxed">
                  {alert.rootCauseAnalysis}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Audit Trail Timeline */}
      <Card title="Incident Audit Trail & State Transitions" subtitle="Immutable state change log" icon={History}>
        <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6 my-2 text-xs">
          {alert.auditTrail?.map((entry, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-teal-500 border-2 border-white dark:border-slate-900" />
              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{entry.action}</span>
                <span className="font-normal text-[10px] text-slate-400 font-mono">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="text-slate-500 mt-1">{entry.notes}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Incident Lead"
        subtitle="Route alert to maintenance technician or safety officer"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" isLoading={submitting} onClick={handleAssign}>Confirm Assignment</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Select Technician / Lead"
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            options={[
              { value: '', label: '-- Select User --' },
              ...users.map(u => ({ value: u._id, label: `${u.name} (${u.role})` }))
            ]}
          />
        </div>
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Resolve & Close Alert"
        subtitle="Document technical findings and restore containment record"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsResolveModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" isLoading={submitting} onClick={() => handleUpdateStatus('Resolved')}>
              Submit Resolution
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Resolution Notes (Required)
            </label>
            <textarea
              rows={3}
              required
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Manifold purge valve adjusted. Flammable concentration dropped below 10 ppm. System verified safe."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Root Cause Analysis (Optional)
            </label>
            <textarea
              rows={2}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="e.g. Thermal expansion during hot ambient midday fill cycle caused minor gland weep."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
