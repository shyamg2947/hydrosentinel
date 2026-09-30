import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useFacility } from '../../contexts/FacilityContext';
import { Table } from '../../components/common/Table';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';

export const CorrectiveActions = () => {
  const { isSafetyOfficer, isFacilityManager, isSuperAdmin } = useAuth();
  const { selectedFacilityId, facilities } = useFacility();

  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Create CAPA modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: '',
    category: 'Inspection Non-Conformance',
    priority: 'High',
    facility: selectedFacilityId || '',
    assignedTo: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rootCause: '',
    actionPlan: ''
  });

  const fetchActions = async () => {
    try {
      setLoading(true);
      let url = '/compliance/actions';
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await api.get(url);
      if (res.success) {
        setActions(res.data);
      }
    } catch (err) {
      console.error('Failed to load CAPAs:', err);
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
    fetchActions();
    fetchUsers();
  }, [statusFilter]);

  const handleCreateCAPA = async (e) => {
    e.preventDefault();
    if (!form.facility) {
      alert('Please choose a facility.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post('/compliance/actions', {
        ...form,
        dueDate: new Date(form.dueDate)
      });
      if (res.success) {
        setIsModalOpen(false);
        fetchActions();
      }
    } catch (err) {
      alert(err.message || 'Failed to create corrective action');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (actionId, newStatus) => {
    try {
      const res = await api.put(`/compliance/actions/${actionId}`, { status: newStatus });
      if (res.success) fetchActions();
    } catch (err) {
      alert(err.message || 'Failed to update action');
    }
  };

  const columns = [
    {
      header: 'CAPA #',
      accessor: 'actionNumber',
      render: (row) => (
        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
          {row.actionNumber}
        </span>
      )
    },
    {
      header: 'Non-Conformance & Category',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
            {row.title}
          </div>
          <span className="text-[11px] text-slate-500">{row.category}</span>
        </div>
      )
    },
    {
      header: 'Facility',
      render: (row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {row.facility?.name}
        </span>
      )
    },
    {
      header: 'Priority',
      render: (row) => (
        <Badge variant={row.priority.toLowerCase()} size="sm">
          {row.priority}
        </Badge>
      )
    },
    {
      header: 'Status',
      render: (row) => {
        let variant = 'default';
        if (row.status === 'Closed') variant = 'normal';
        else if (row.status === 'In Progress') variant = 'info';
        else if (row.status === 'Open') variant = 'warning';

        return <Badge variant={variant} size="sm">{row.status}</Badge>;
      }
    },
    {
      header: 'Assignee',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {row.assignedTo?.name || 'Unassigned'}
        </span>
      )
    },
    {
      header: 'Due Date',
      render: (row) => (
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
          {new Date(row.dueDate).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status !== 'Closed' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateStatus(row._id, 'Closed')}
            >
              Close
            </Button>
          ) : (
            <span className="text-xs text-emerald-600 font-semibold">Resolved</span>
          )}
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
            <FileSpreadsheet className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Corrective & Preventive Action (CAPA)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Resolve audit findings, track root cause investigations, and enforce corrective mitigation measures.
          </p>
        </div>

        {(isSafetyOfficer || isFacilityManager || isSuperAdmin) && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Open CAPA Ticket
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-transparent text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Pending Verification">Pending Verification</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={actions}
        isLoading={loading}
        emptyMessage="No corrective actions recorded."
      />

      {/* Open CAPA Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Open Corrective & Preventive Action (CAPA)"
        subtitle="Document non-conformance finding, root cause, and remediation plan"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" isLoading={submitting} onClick={handleCreateCAPA}>
              Open CAPA
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateCAPA} className="space-y-4">
          <Input
            label="Non-Conformance Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Replace Exhaust Fan Relay Contact Block"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Facility"
              value={form.facility}
              onChange={(e) => setForm({ ...form, facility: e.target.value })}
              options={[
                { value: '', label: '-- Select Facility --' },
                ...facilities.map(f => ({ value: f._id, label: `${f.name} (${f.code})` }))
              ]}
            />
            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              options={['Critical', 'High', 'Medium', 'Low']}
            />
            <Input
              label="Resolution Due Date"
              type="date"
              required
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          <Select
            label="Assigned Responsible Lead"
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            options={[
              { value: '', label: '-- Assign Lead --' },
              ...users.map(u => ({ value: u._id, label: `${u.name} (${u.role})` }))
            ]}
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Root Cause Analysis
            </label>
            <textarea
              rows={2}
              value={form.rootCause}
              onChange={(e) => setForm({ ...form, rootCause: e.target.value })}
              placeholder="e.g. Contact oxidation caused 8-second startup delay during bump challenge."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Corrective Action Plan
            </label>
            <textarea
              rows={2}
              value={form.actionPlan}
              onChange={(e) => setForm({ ...form, actionPlan: e.target.value })}
              placeholder="e.g. Replace mechanical relay with hermetic solid-state unit and re-test."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
