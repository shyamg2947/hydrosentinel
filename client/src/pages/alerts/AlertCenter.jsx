import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Download,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useFacility } from '../../contexts/FacilityContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { EmergencyNotice } from '../../components/alerts/EmergencyNotice';

export const AlertCenter = () => {
  const navigate = useNavigate();
  const { isSafetyOfficer, isFacilityManager } = useAuth();
  const { selectedFacilityId } = useFacility();

  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      let url = `/alerts?search=${encodeURIComponent(search)}`;
      if (selectedFacilityId) url += `&facility=${selectedFacilityId}`;
      if (severityFilter) url += `&severity=${severityFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;

      const [alertsRes, sumRes] = await Promise.all([
        api.get(url),
        api.get('/alerts/summary')
      ]);

      if (alertsRes.success) setAlerts(alertsRes.data);
      if (sumRes.success) setSummary(sumRes.data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchAlerts, 200);
    return () => clearTimeout(timer);
  }, [search, severityFilter, statusFilter, categoryFilter, selectedFacilityId]);

  const handleAcknowledge = async (e, alertId) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/alerts/${alertId}/acknowledge`);
      if (res.success) {
        fetchAlerts();
      }
    } catch (err) {
      alert(err.message || 'Failed to acknowledge alert');
    }
  };

  const handleExportCSV = () => {
    window.open('/api/v1/analytics/export/csv?module=alerts', '_blank');
  };

  const columns = [
    {
      header: 'Severity',
      render: (row) => (
        <Badge variant={row.severity.toLowerCase()} size="sm" dot>
          {row.severity}
        </Badge>
      )
    },
    {
      header: 'Alert Title & Category',
      render: (row) => (
        <div>
          <div
            onClick={() => navigate(`/alerts/${row._id}`)}
            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer"
          >
            {row.title}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {row.category} • Sensor {row.sensor?.sensorId || 'N/A'}
          </div>
        </div>
      )
    },
    {
      header: 'Facility / Unit',
      render: (row) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800 dark:text-slate-200">{row.facility?.name}</div>
          <div className="text-[11px] text-slate-400">{row.storageUnit?.name || 'Main Manifold'}</div>
        </div>
      )
    },
    {
      header: 'Measured vs Threshold',
      render: (row) => (
        <div className="text-xs font-mono">
          <span className="font-bold text-rose-600 dark:text-rose-400">
            {row.triggeredValue !== undefined ? row.triggeredValue : '---'} {row.unit}
          </span>
          <span className="text-slate-400 block text-[10px]">
            Limit: {row.thresholdValue} {row.unit}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => {
        let variant = 'default';
        if (row.status === 'New') variant = 'critical';
        else if (row.status === 'Acknowledged') variant = 'warning';
        else if (row.status === 'Resolved' || row.status === 'Closed') variant = 'normal';
        else if (row.status === 'Investigating' || row.status === 'Assigned') variant = 'info';

        return <Badge variant={variant} size="sm">{row.status}</Badge>;
      }
    },
    {
      header: 'Triggered At',
      render: (row) => (
        <span className="text-xs font-mono text-slate-500">
          {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
          <span className="text-[10px] text-slate-400 block">{new Date(row.createdAt).toLocaleDateString()}</span>
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'New' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handleAcknowledge(e, row._id)}
            >
              Acknowledge
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/alerts/${row._id}`)}
          >
            Triage
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
            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-500" />
            Intelligent Alert & Incident Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated threshold evaluation, alarm triage queue, escalation metadata, and audit records.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={handleExportCSV}
        >
          Export CSV Log
        </Button>
      </div>

      {/* Emergency Response Notice */}
      <EmergencyNotice procedureCode="SOP-H2-EMG-01" />

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500">Total System Alarms</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {summary?.total || alerts.length}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-xs text-rose-600">Unacknowledged Critical</div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
            {summary?.unackCritical || 0}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-xs text-amber-600">Warning Severities</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
            {summary?.bySeverity?.Warning || 0}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-xs text-emerald-600">Resolved / Closed</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            {(summary?.byStatus?.Resolved || 0) + (summary?.byStatus?.Closed || 0)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts by title, sensor ID, facility..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="" className="dark:bg-slate-900">All Severities</option>
            <option value="Critical" className="dark:bg-slate-900">Critical</option>
            <option value="Warning" className="dark:bg-slate-900">Warning</option>
            <option value="Informational" className="dark:bg-slate-900">Informational</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="" className="dark:bg-slate-900">All Lifecycle States</option>
            <option value="New" className="dark:bg-slate-900">New</option>
            <option value="Acknowledged" className="dark:bg-slate-900">Acknowledged</option>
            <option value="Assigned" className="dark:bg-slate-900">Assigned</option>
            <option value="Investigating" className="dark:bg-slate-900">Investigating</option>
            <option value="Resolved" className="dark:bg-slate-900">Resolved</option>
            <option value="Closed" className="dark:bg-slate-900">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="" className="dark:bg-slate-900">All Categories</option>
            <option value="Pressure Exceeded" className="dark:bg-slate-900">Pressure Exceeded</option>
            <option value="Temperature Exceeded" className="dark:bg-slate-900">Temperature Exceeded</option>
            <option value="Leak Detected" className="dark:bg-slate-900">Leak Detected</option>
            <option value="Sensor Offline" className="dark:bg-slate-900">Sensor Offline</option>
            <option value="Calibration Overdue" className="dark:bg-slate-900">Calibration Overdue</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <Table
        columns={columns}
        data={alerts}
        isLoading={loading}
        emptyMessage="No alerts matching active filters."
      />
    </div>
  );
};
