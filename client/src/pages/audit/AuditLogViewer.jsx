import React, { useState, useEffect } from 'react';
import { 
  Shield, Search, Filter, RefreshCw, Eye, Calendar, User, FileText, Download, Code, CheckCircle2, Clock
} from 'lucide-react';
import { auditLogService } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import EmptyState from '../../components/EmptyState';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditLogService.getAll({ 
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        search: search.trim() || undefined
      });
      // Handle both { data: [...] } and direct array responses
      const rawList = res?.data || res?.logs || res || [];
      const list = Array.isArray(rawList) ? rawList : (rawList.data || []);
      setLogs(list);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionBadgeVariant = (action = '') => {
    const act = String(action).toUpperCase();
    if (act.includes('DELETE') || act.includes('CRITICAL') || act.includes('DISABLE')) return 'danger';
    if (act.includes('UPDATE') || act.includes('MODIFY') || act.includes('CALIBRATE')) return 'warning';
    if (act.includes('CREATE') || act.includes('LOGIN') || act.includes('RESOLVE')) return 'success';
    return 'info';
  };

  const formatTimestamp = (dateVal) => {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '—';
      return d.toISOString().replace('T', ' ').slice(0, 19);
    } catch {
      return '—';
    }
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydrosentinel_audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Statutory Compliance &amp; PESO Audit Trail
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Immutable System &amp; Safety Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Tamper-evident record of operator logins, sensor threshold changes, work order executions, and emergency dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportJSON}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Log
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchLogs} 
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by actor email, action type, or entity ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/40"
            />
          </div>

          <div className="w-full md:w-64">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/40"
            >
              <option value="ALL">All Actions &amp; Security Events</option>
              <option value="USER_LOGIN">User Login Events</option>
              <option value="USER_UPDATED">User State Updates</option>
              <option value="THRESHOLD_UPDATE">Threshold Updates</option>
              <option value="ALERT_ACKNOWLEDGED">Alert Acknowledgements</option>
              <option value="WORK_ORDER">Work Order Transitions</option>
              <option value="SENSOR_CALIBRATED">Sensor Calibrations</option>
              <option value="DATA_EXPORT_CSV">Data Exports</option>
            </select>
          </div>

          <Button type="submit" variant="primary" size="sm">
            Filter
          </Button>
        </form>
      </Card>

      {/* Logs Table */}
      <Card className="overflow-hidden p-0 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Timestamp (UTC)</Table.Head>
              <Table.Head>Action</Table.Head>
              <Table.Head>Actor</Table.Head>
              <Table.Head>Target Entity</Table.Head>
              <Table.Head>IP Address</Table.Head>
              <Table.Head className="text-right">Details</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <Table.Row key={i}>
                  <Table.Cell colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-teal-500" />
                      <span>Loading cryptographic audit log entries...</span>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : logs.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6} className="py-12 text-center">
                  <EmptyState
                    icon={FileText}
                    title="No Audit Records Found"
                    description="No events match your current filter parameters."
                  />
                </Table.Cell>
              </Table.Row>
            ) : (
              logs.map((log) => {
                const actorName = log.actor?.name || log.actorName || log.user?.name || log.userName || 'System Engine';
                const actorRole = log.actor?.role || log.actorRole || log.user?.role || log.userRole || 'SYSTEM';
                const timestampStr = formatTimestamp(log.timestamp || log.createdAt);

                return (
                  <Table.Row key={log._id || log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <Table.Cell className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {timestampStr}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {actorName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({actorRole})
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                      {log.targetEntity || log.entityType || '—'}
                    </Table.Cell>
                    <Table.Cell className="font-mono text-xs text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Inspect
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table>
      </Card>

      {/* Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title={`Audit Payload: ${selectedLog.action}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono">
              <div>
                <span className="text-slate-400">Record ID:</span>{' '}
                <span className="text-slate-700 dark:text-slate-300 break-all">{selectedLog._id}</span>
              </div>
              <div>
                <span className="text-slate-400">Timestamp:</span>{' '}
                <span className="text-slate-700 dark:text-slate-300">{formatTimestamp(selectedLog.timestamp || selectedLog.createdAt)}</span>
              </div>
              <div>
                <span className="text-slate-400">Actor:</span>{' '}
                <span className="text-slate-700 dark:text-slate-300">{selectedLog.actor?.email || selectedLog.actorName || 'System'}</span>
              </div>
              <div>
                <span className="text-slate-400">IP:</span>{' '}
                <span className="text-slate-700 dark:text-slate-300">{selectedLog.ipAddress || '127.0.0.1'}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Raw JSON Change Payload &amp; Metadata
              </label>
              <pre className="p-4 bg-slate-950 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto max-h-80 border border-slate-800">
                {JSON.stringify(selectedLog.details || selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
