import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  ListTodo,
  FileSpreadsheet
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useFacility } from '../../contexts/FacilityContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';

export const MaintenanceDashboard = () => {
  const navigate = useNavigate();
  const { isFacilityManager, isTechnician } = useAuth();
  const { selectedFacilityId } = useFacility();

  const [stats, setStats] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        setLoading(true);
        let woUrl = '/maintenance/work-orders?limit=6';
        if (selectedFacilityId) woUrl += `&facility=${selectedFacilityId}`;

        const [statsRes, woRes, tplRes] = await Promise.all([
          api.get('/maintenance/work-orders/stats'),
          api.get(woUrl),
          api.get('/maintenance/templates')
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (woRes.success) setWorkOrders(woRes.data);
        if (tplRes.success) setTemplates(tplRes.data);
      } catch (err) {
        console.error('Failed to load maintenance data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceData();
  }, [selectedFacilityId]);

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-44" /><Skeleton className="h-72" /></div>;
  }

  const byStatus = stats?.byStatus || {};
  const byPriority = stats?.byPriority || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Preventive Maintenance Operations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Work order lifecycle, periodic sensor calibrations, composite vessel inspections, and field dispatching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={Calendar}
            onClick={() => navigate('/maintenance/calendar')}
          >
            Calendar Schedule
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={ListTodo}
            onClick={() => navigate('/maintenance/work-orders')}
          >
            View Work Orders
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500">Total Work Orders</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {stats?.total || 0}
          </div>
          <div className="text-[11px] text-teal-600 mt-1">{byStatus['In Progress'] || 0} currently active</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-xs text-rose-600 font-semibold">Overdue Tasks</div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
            {stats?.overdue || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Past due compliance date</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-xs text-amber-600 font-semibold">Due in 7 Days</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
            {stats?.upcoming || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Upcoming scheduled PMs</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-xs text-emerald-600">Completed Orders</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            {byStatus['Completed'] || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">With signed checklists</div>
        </div>
      </div>

      {/* Recent Work Orders & Recurring Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Work Orders */}
        <Card
          title="Active Work Order Dispatch"
          subtitle="Assigned field tasks and calibration schedules"
          icon={ListTodo}
          className="lg:col-span-2"
          action={
            <Link to="/maintenance/work-orders" className="text-xs text-teal-600 hover:underline">
              All Orders →
            </Link>
          }
        >
          <div className="space-y-3">
            {workOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active work orders found.</p>
            ) : (
              workOrders.map((wo) => (
                <div
                  key={wo._id}
                  onClick={() => navigate(`/maintenance/work-orders/${wo._id}`)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-teal-500 cursor-pointer transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                        {wo.workOrderNumber}
                      </span>
                      <Badge variant={wo.status === 'In Progress' ? 'info' : 'default'} size="sm">
                        {wo.status}
                      </Badge>
                      <Badge variant={wo.priority.toLowerCase()} size="sm">
                        {wo.priority}
                      </Badge>
                    </div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 mt-1 truncate">
                      {wo.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Facility: {wo.facility?.name} • Technician: {wo.assignedTo?.name || 'Unassigned'}
                    </div>
                  </div>
                  <div className="text-right text-xs shrink-0 font-mono">
                    <div className="text-slate-400 text-[10px]">Due Date</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(wo.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Standard Maintenance Templates */}
        <Card
          title="Recurring Protocols"
          subtitle="Approved standard operating templates"
          icon={FileSpreadsheet}
        >
          <div className="space-y-3">
            {templates.map((tpl) => (
              <div
                key={tpl._id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100">{tpl.name}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Interval: every {tpl.frequencyDays} days • Est. {tpl.estimatedDurationHours}h
                </div>
                <div className="text-[10px] text-teal-600 dark:text-teal-400 mt-1">
                  {tpl.checklistItems?.length || 0} standard verification steps
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
