import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowRight,
  ShieldAlert,
  ClipboardList
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useFacility } from '../../contexts/FacilityContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';

export const ComplianceDashboard = () => {
  const navigate = useNavigate();
  const { selectedFacilityId } = useFacility();

  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompliance = async () => {
      try {
        setLoading(true);
        let recUrl = '/compliance/records?limit=6';
        if (selectedFacilityId) recUrl += `&facility=${selectedFacilityId}`;

        const [statsRes, recRes, docRes, actRes] = await Promise.all([
          api.get('/compliance/dashboard-stats'),
          api.get(recUrl),
          api.get('/compliance/documents'),
          api.get('/compliance/actions?limit=5')
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (recRes.success) setRecords(recRes.data);
        if (docRes.success) setDocuments(docRes.data);
        if (actRes.success) setActions(actRes.data);
      } catch (err) {
        console.error('Failed to load compliance dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompliance();
  }, [selectedFacilityId]);

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-44" /><Skeleton className="h-72" /></div>;
  }

  const complianceRate = stats?.complianceRate || 95;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Safety & Statutory Compliance Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standard operating procedures, routine statutory inspections, non-conformance remediation, and audit registers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={FileText}
            onClick={() => navigate('/compliance/documents')}
          >
            Document Register
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={ClipboardList}
            onClick={() => navigate('/compliance/checklists')}
          >
            Audit Checklists
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500">Compliance Index</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {complianceRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Weighted inspection pass score</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500">Completed Inspections</div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            {stats?.totalRecords || 0}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">{stats?.compliantRecords || 0} fully compliant</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-xs text-amber-600 font-semibold">Open Corrective Actions</div>
          <div className="text-3xl font-extrabold font-mono text-amber-600 mt-1">
            {stats?.openCAPAs || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Active remediation tickets</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
          <div className="text-xs text-slate-500">Active Safety SOPs</div>
          <div className="text-3xl font-extrabold font-mono text-teal-600 dark:text-teal-400 mt-1">
            {stats?.activeDocuments || documents.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Registered & under revision control</div>
        </div>
      </div>

      {/* Safety Notice Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        <strong className="text-slate-900 dark:text-white">OPERATIONAL SAFETY NOTICE:</strong> Checklist protocols and compliance documentation within HydroSentinel represent simulated organizational safety tracking. Authorized site safety managers and certified engineers must validate all facility operating thresholds and regulatory compliance procedures against applicable codes.
      </div>

      {/* Recent Inspections & Open CAPA Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inspection History */}
        <Card
          title="Recent Safety Inspections"
          subtitle="Audit scores and non-conformance findings"
          icon={ClipboardList}
          action={
            <Link to="/compliance/checklists" className="text-xs text-teal-600 hover:underline">
              All Records →
            </Link>
          }
        >
          <div className="space-y-3">
            {records.map((rec) => (
              <div
                key={rec._id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-600">
                      {rec.checklist?.code}
                    </span>
                    <Badge variant={rec.status === 'Compliant' ? 'normal' : 'warning'} size="sm">
                      {rec.status}
                    </Badge>
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                    {rec.checklist?.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Facility: {rec.facility?.name} • Auditor: {rec.completedBy?.name || 'Safety Inspector'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-emerald-600">
                    {rec.overallScorePercent}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {new Date(rec.inspectionDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Corrective Actions (CAPA) */}
        <Card
          title="Open Corrective Actions (CAPA)"
          subtitle="Non-conformance root cause resolution"
          icon={FileSpreadsheet}
          action={
            <Link to="/compliance/corrective-actions" className="text-xs text-teal-600 hover:underline">
              All Actions →
            </Link>
          }
        >
          <div className="space-y-3">
            {actions.map((act) => (
              <div
                key={act._id}
                onClick={() => navigate('/compliance/corrective-actions')}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500 cursor-pointer text-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {act.actionNumber}
                    </span>
                    <Badge variant={act.priority.toLowerCase()} size="sm">
                      {act.priority}
                    </Badge>
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                    {act.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Lead: {act.assignedTo?.name || 'Unassigned'} • Due: {new Date(act.dueDate).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant={act.status === 'Closed' ? 'normal' : 'default'} size="sm">
                  {act.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
