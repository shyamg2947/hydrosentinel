import React, { useState, useEffect } from 'react';
import {
  ListTodo,
  Search,
  Filter,
  Plus,
  Wrench,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2
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

export const WorkOrderList = () => {
  const navigate = useNavigate();
  const { isFacilityManager, isSafetyOfficer, isSuperAdmin } = useAuth();
  const { selectedFacilityId, facilities } = useFacility();

  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Create work order modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: '',
    category: 'Sensor Inspection',
    priority: 'Medium',
    facility: selectedFacilityId || '',
    assignedTo: '',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    tasks: ['Isolate valve and verify zero energy state', 'Conduct instrument inspection']
  });
  const [newTaskInput, setNewTaskInput] = useState('');

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      let url = `/maintenance/work-orders?search=${encodeURIComponent(search)}`;
      if (selectedFacilityId) url += `&facility=${selectedFacilityId}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (priorityFilter) url += `&priority=${priorityFilter}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;

      const res = await api.get(url);
      if (res.success) {
        setWorkOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load work orders:', err);
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
    const timer = setTimeout(fetchWorkOrders, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter, priorityFilter, categoryFilter, selectedFacilityId]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddTask = () => {
    if (!newTaskInput.trim()) return;
    setForm(prev => ({ ...prev, tasks: [...prev.tasks, newTaskInput.trim()] }));
    setNewTaskInput('');
  };

  const handleRemoveTask = (idx) => {
    setForm(prev => ({ ...prev, tasks: prev.tasks.filter((_, i) => i !== idx) }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!form.facility) {
      alert('Please select a facility for this work order.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        title: form.title,
        category: form.category,
        priority: form.priority,
        facility: form.facility,
        assignedTo: form.assignedTo || undefined,
        dueDate: new Date(form.dueDate),
        description: form.description,
        checklist: form.tasks.map(t => ({ task: t, completed: false }))
      };

      const res = await api.post('/maintenance/work-orders', payload);
      if (res.success) {
        setIsCreateOpen(false);
        fetchWorkOrders();
      }
    } catch (err) {
      alert(err.message || 'Failed to create work order');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'WO #',
      accessor: 'workOrderNumber',
      render: (row) => (
        <span
          onClick={() => navigate(`/maintenance/work-orders/${row._id}`)}
          className="font-mono font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
        >
          {row.workOrderNumber}
        </span>
      )
    },
    {
      header: 'Title & Category',
      render: (row) => (
        <div>
          <div
            onClick={() => navigate(`/maintenance/work-orders/${row._id}`)}
            className="font-semibold text-slate-800 dark:text-slate-200 hover:text-teal-600 cursor-pointer"
          >
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
        if (row.status === 'Completed') variant = 'normal';
        else if (row.status === 'In Progress') variant = 'info';
        else if (row.status === 'Blocked') variant = 'critical';

        return <Badge variant={variant} size="sm">{row.status}</Badge>;
      }
    },
    {
      header: 'Assigned Lead',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {row.assignedTo?.name || <span className="text-slate-400 italic">Unassigned</span>}
        </span>
      )
    },
    {
      header: 'Due Date',
      render: (row) => (
        <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
          {new Date(row.dueDate).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/maintenance/work-orders/${row._id}`)}
        >
          Inspect
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ListTodo className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Maintenance Work Orders
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track corrective repairs, schedule sensor recalibration, and execute digital step-by-step checklists.
          </p>
        </div>

        {(isFacilityManager || isSafetyOfficer || isSuperAdmin) && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCreateOpen(true)}
          >
            Create Work Order
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by WO #, title, notes..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="" className="dark:bg-slate-900">All Statuses</option>
            <option value="Planned" className="dark:bg-slate-900">Planned</option>
            <option value="Scheduled" className="dark:bg-slate-900">Scheduled</option>
            <option value="In Progress" className="dark:bg-slate-900">In Progress</option>
            <option value="Blocked" className="dark:bg-slate-900">Blocked</option>
            <option value="Completed" className="dark:bg-slate-900">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="" className="dark:bg-slate-900">All Priorities</option>
            <option value="Critical" className="dark:bg-slate-900">Critical</option>
            <option value="High" className="dark:bg-slate-900">High</option>
            <option value="Medium" className="dark:bg-slate-900">Medium</option>
            <option value="Low" className="dark:bg-slate-900">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={workOrders}
        isLoading={loading}
        emptyMessage="No work orders found."
      />

      {/* Create Work Order Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule Preventive Work Order"
        subtitle="Define tasks, assign technician, and establish due dates"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" isLoading={submitting} onClick={handleCreateOrder}>
              Schedule Work Order
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <Input
            label="Work Order Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Semi-Annual PRD Valve Recalibration"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={[
                'Sensor Calibration',
                'Sensor Inspection',
                'Storage-Unit Inspection',
                'Equipment Servicing',
                'General Safety Inspection'
              ]}
            />
            <Select
              label="Priority Level"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              options={['Low', 'Medium', 'High', 'Critical']}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Facility Site"
              value={form.facility}
              onChange={(e) => setForm({ ...form, facility: e.target.value })}
              options={[
                { value: '', label: '-- Select Facility --' },
                ...facilities.map(f => ({ value: f._id, label: `${f.name} (${f.code})` }))
              ]}
            />
            <Select
              label="Assign Technician"
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              options={[
                { value: '', label: '-- Unassigned --' },
                ...users.map(u => ({ value: u._id, label: `${u.name} (${u.role})` }))
              ]}
            />
            <Input
              label="Due Date"
              type="date"
              required
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Scope of Work / Instructions
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Safety precautions, lock-out/tag-out numbers, reference documents..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Checklist task builder */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Field Execution Tasks ({form.tasks.length})
            </label>
            <div className="space-y-2 mb-3">
              {form.tasks.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs">
                  <span>{idx + 1}. {task}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(idx)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Add checklist step..."
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddTask}>
                Add Task
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
