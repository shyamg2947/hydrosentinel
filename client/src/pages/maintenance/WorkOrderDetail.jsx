import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ListTodo,
  ArrowLeft,
  CheckCircle2,
  Clock,
  UserCheck,
  Calendar,
  Building2,
  Wrench,
  AlertTriangle,
  Save,
  CheckSquare,
  Square
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';

export const WorkOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTechnician, isFacilityManager } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/maintenance/work-orders/${id}`);
      if (res.success) {
        setOrder(res.data);
        setCompletionNotes(res.data.completionNotes || '');
      }
    } catch (err) {
      console.error('Failed to load work order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleToggleTask = async (taskIndex) => {
    if (!order) return;
    const updatedChecklist = order.checklist.map((item, idx) => {
      if (idx === taskIndex) {
        const nextCompleted = !item.completed;
        return {
          ...item,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date() : null,
          notes: nextCompleted ? `Completed by ${user?.name}` : ''
        };
      }
      return item;
    });

    try {
      const res = await api.put(`/maintenance/work-orders/${id}`, {
        checklist: updatedChecklist
      });
      if (res.success) {
        setOrder(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to update checklist task');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setSubmitting(true);
      const res = await api.put(`/maintenance/work-orders/${id}`, {
        status: newStatus,
        completionNotes
      });
      if (res.success) {
        setOrder(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to update work order status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-44" /><Skeleton className="h-72" /></div>;
  }

  if (!order) {
    return <div className="p-8 text-center text-slate-500">Work order not found.</div>;
  }

  const completedCount = order.checklist?.filter(t => t.completed).length || 0;
  const totalTasks = order.checklist?.length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/maintenance/work-orders" className="hover:text-teal-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Work Orders
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium">{order.workOrderNumber}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              {order.workOrderNumber}
            </span>
            <Badge variant={order.status === 'Completed' ? 'normal' : 'default'} size="md">
              {order.status}
            </Badge>
            <Badge variant={order.priority.toLowerCase()} size="md">
              {order.priority} Priority
            </Badge>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {order.title}
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            {order.description || 'Routine safety and calibration maintenance work.'}
          </p>
        </div>

        {/* Technician Status Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {order.status !== 'In Progress' && order.status !== 'Completed' && (
            <Button
              variant="outline"
              size="sm"
              isLoading={submitting}
              onClick={() => handleUpdateStatus('In Progress')}
            >
              Start Work
            </Button>
          )}

          {order.status === 'In Progress' && (
            <Button
              variant="primary"
              size="sm"
              isLoading={submitting}
              icon={CheckCircle2}
              onClick={() => handleUpdateStatus('Completed')}
            >
              Sign & Complete Order
            </Button>
          )}

          {order.status !== 'Blocked' && order.status !== 'Completed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUpdateStatus('Blocked')}
            >
              Mark Blocked
            </Button>
          )}
        </div>
      </div>

      {/* Task Execution Checklist */}
      <Card
        title={`Field Task Checklist (${completedCount} / ${totalTasks} completed)`}
        subtitle="Click items to verify step completion"
        icon={CheckCircle2}
      >
        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
          <div
            className="bg-teal-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="space-y-3">
          {order.checklist?.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleToggleTask(idx)}
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                item.completed
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-teal-500/50'
              }`}
            >
              <div className="mt-0.5 text-teal-600 dark:text-teal-400">
                {item.completed ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 text-xs">
                <span className={`font-semibold ${item.completed ? 'line-through opacity-80' : ''}`}>
                  {item.task}
                </span>
                {item.completedAt && (
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Completed at {new Date(item.completedAt).toLocaleTimeString()} {item.notes && `• ${item.notes}`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Technician Notes & Work Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Technician Completion Notes" icon={Wrench}>
          <div className="space-y-3">
            <textarea
              rows={4}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Record instrument calibration offsets, valve torques, parts replaced, or observations..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
            <Button
              variant="secondary"
              size="sm"
              icon={Save}
              isLoading={submitting}
              onClick={() => handleUpdateStatus(order.status)}
            >
              Save Notes
            </Button>
          </div>
        </Card>

        <Card title="Assignment & Facility Context" icon={Building2}>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Facility Location:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{order.facility?.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Assigned Technician:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{order.assignedTo?.name || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Scheduled Due Date:</span>
              <span className="font-mono font-semibold text-teal-600 dark:text-teal-400">
                {new Date(order.dueDate).toLocaleDateString()}
              </span>
            </div>
            {order.completedDate && (
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-emerald-600">
                <span>Completed Date:</span>
                <span className="font-mono font-bold">{new Date(order.completedDate).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Created By:</span>
              <span className="text-slate-700 dark:text-slate-300">{order.createdBy?.name || 'Operations Lead'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
