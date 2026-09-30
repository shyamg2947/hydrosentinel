import React, { useState } from 'react';
import { 
  Bell, CheckCheck, Trash2, Filter, AlertTriangle, Wrench, ShieldCheck, Info, Clock, Check 
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const [filter, setFilter] = useState('all'); // all, unread, alert, maintenance, compliance

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'alert') return n.type === 'alert' || n.type === 'critical';
    if (filter === 'maintenance') return n.type === 'maintenance' || n.type === 'work_order';
    if (filter === 'compliance') return n.type === 'compliance';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'alert':
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'maintenance':
      case 'work_order':
        return <Wrench className="w-5 h-5 text-blue-500" />;
      case 'compliance':
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      default:
        return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Notification Center
            {unreadCount > 0 && (
              <Badge variant="danger" className="ml-2 font-mono">
                {unreadCount} unread
              </Badge>
            )}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry threshold triggers, work order dispatches, and compliance audit notifications
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              leftIcon={<CheckCheck className="w-4 h-4 text-emerald-500" />}
            >
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'all', label: 'All Notifications' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'alert', label: 'Safety Alarms' },
          { id: 'maintenance', label: 'Maintenance' },
          { id: 'compliance', label: 'Compliance' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <Card className="divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-10 h-10 text-slate-400" />}
            title="No Notifications Found"
            description="You are completely up to date. No events match the active filter criteria."
          />
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id || notif.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                notif.read ? 'bg-transparent' : 'bg-blue-50/50 dark:bg-blue-950/20'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  {getIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-semibold ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.createdAt || Date.now()).toLocaleString()}
                    </span>
                    {notif.facilityName && (
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {notif.facilityName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif._id || notif.id)}
                    title="Mark as read"
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {clearNotification && (
                  <button
                    onClick={() => clearNotification(notif._id || notif.id)}
                    title="Dismiss"
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
