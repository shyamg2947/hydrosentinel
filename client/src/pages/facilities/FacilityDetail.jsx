import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Database,
  Radio,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  History,
  Sliders,
  MapPin,
  Clock,
  Layers,
  Edit,
  Save,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { Skeleton } from '../../components/common/Skeleton';
import { SensorCard } from '../../components/monitoring/SensorCard';
import { TelemetryChart } from '../../components/monitoring/TelemetryChart';

export const FacilityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFacilityManager } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [telemetryHistory, setTelemetryHistory] = useState([]);

  // Configurable illustrative thresholds modal state
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [thresholds, setThresholds] = useState({
    pressureWarningBar: 450,
    pressureCriticalBar: 500,
    tempMinC: -40,
    tempMaxC: 65,
    leakWarningPpm: 400,
    leakCriticalPpm: 1000
  });
  const [savingThresholds, setSavingThresholds] = useState(false);

  const fetchFacilityDetail = async () => {
    try {
      setLoading(true);
      const [facRes, historyRes] = await Promise.all([
        api.get(`/facilities/${id}`),
        api.get(`/telemetry/history?facilityId=${id}&limit=40`)
      ]);

      if (facRes.success) {
        setData(facRes.data);
        if (facRes.data.facility?.thresholds) {
          setThresholds({
            pressureWarningBar: facRes.data.facility.thresholds.pressureWarningBar ?? 450,
            pressureCriticalBar: facRes.data.facility.thresholds.pressureCriticalBar ?? 500,
            tempMinC: facRes.data.facility.thresholds.tempMinC ?? -40,
            tempMaxC: facRes.data.facility.thresholds.tempMaxC ?? 65,
            leakWarningPpm: facRes.data.facility.thresholds.leakWarningPpm ?? 400,
            leakCriticalPpm: facRes.data.facility.thresholds.leakCriticalPpm ?? 1000
          });
        }
      }
      if (historyRes.success) {
        setTelemetryHistory(historyRes.data);
      }
    } catch (err) {
      console.error('Failed to load facility detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilityDetail();
  }, [id]);

  const handleSaveThresholds = async () => {
    try {
      setSavingThresholds(true);
      const res = await api.put(`/facilities/${id}`, {
        thresholds: {
          ...thresholds,
          pressureWarningBar: Number(thresholds.pressureWarningBar),
          pressureCriticalBar: Number(thresholds.pressureCriticalBar),
          tempMinC: Number(thresholds.tempMinC),
          tempMaxC: Number(thresholds.tempMaxC),
          leakWarningPpm: Number(thresholds.leakWarningPpm),
          leakCriticalPpm: Number(thresholds.leakCriticalPpm)
        }
      });
      if (res.success) {
        setIsThresholdModalOpen(false);
        fetchFacilityDetail();
      }
    } catch (err) {
      alert(err.message || 'Failed to update safety thresholds');
    } finally {
      setSavingThresholds(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64" count={3} />
        </div>
      </div>
    );
  }

  const facility = data?.facility;
  if (!facility) {
    return <div className="p-8 text-center text-slate-500">Facility record not found.</div>;
  }

  const storageUnits = data?.storageUnits || [];
  const sensors = data?.sensors || [];
  const activeAlerts = data?.activeAlerts || [];
  const workOrders = data?.recentWorkOrders || [];
  const compliance = data?.recentCompliance || [];
  const auditTrail = data?.auditTrail || [];

  const pressureReadings = telemetryHistory.filter(t => t.sensorType === 'Pressure');
  const tempReadings = telemetryHistory.filter(t => t.sensorType === 'Temperature');
  const leakSensors = sensors.filter(s => s.type === 'Hydrogen Leak');

  const tabs = [
    { id: 'overview', label: 'Overview & Vessels', icon: Layers, count: storageUnits.length },
    { id: 'sensors', label: 'Sensor Grid', icon: Radio, count: sensors.length },
    { id: 'telemetry', label: 'Historical Trends', icon: History },
    { id: 'alerts', label: 'Active Alarms', icon: AlertTriangle, count: activeAlerts.length },
    { id: 'maintenance', label: 'Work Orders', icon: Wrench, count: workOrders.length },
    { id: 'compliance', label: 'Safety Compliance', icon: ShieldCheck, count: compliance.length },
    { id: 'audit', label: 'Audit Trail', icon: History }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/facilities" className="hover:text-teal-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Facilities
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium">{facility.name}</span>
      </div>

      {/* Facility Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40">
              {facility.code}
            </span>
            <Badge variant={facility.status.toLowerCase()} size="md" dot>
              {facility.status} Operational Mode
            </Badge>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {facility.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {facility.location?.address || ''} {facility.location?.city}, {facility.location?.state} ({facility.location?.country})
            </span>
            <span>•</span>
            <span>Mode: <strong>{facility.operationalMode}</strong></span>
            <span>•</span>
            <span>Capacity: <strong>{facility.currentStorageKg} / {facility.totalCapacityKg} kg H2</strong></span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3 shrink-0">
          {isFacilityManager && (
            <Button
              variant="outline"
              size="sm"
              icon={Sliders}
              onClick={() => setIsThresholdModalOpen(true)}
            >
              Config Thresholds
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/monitoring')}
          >
            Live Monitor Feed
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB CONTENT 1: OVERVIEW & STORAGE VESSELS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Storage Units */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              Storage Units & Vessel Buffer Modules ({storageUnits.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {storageUnits.map((unit) => (
                <div
                  key={unit._id}
                  onClick={() => navigate(`/facilities/${facility._id}/storage-units/${unit._id}`)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/50 cursor-pointer shadow-xs transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {unit.unitId}
                    </span>
                    <Badge variant={unit.status.toLowerCase()} size="sm" dot>
                      {unit.status}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {unit.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">{unit.type}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 font-mono">
                    <span>Working P: {unit.maxWorkingPressureBar} bar</span>
                    <span>Hold: {unit.currentStorageKg} kg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leak Detection Panel */}
          <Card
            title="Stationary Hydrogen Leak Detection Status"
            subtitle="Catalytic and electrochemical flammability barrier sensors"
            icon={ShieldAlert}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {leakSensors.length === 0 ? (
                <div className="p-4 text-xs text-slate-400">No leak detectors provisioned for this site.</div>
              ) : (
                leakSensors.map((sensor) => (
                  <SensorCard key={sensor._id} sensor={sensor} />
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 2: SENSORS GRID */}
      {activeTab === 'sensors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map((sensor) => (
            <SensorCard key={sensor._id} sensor={sensor} />
          ))}
        </div>
      )}

      {/* TAB CONTENT 3: HISTORICAL CHARTS */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            title="Storage Manifold Pressure (bar)"
            subtitle="Historical trend across all facility sensors"
          >
            <TelemetryChart
              data={pressureReadings}
              dataKey="value"
              unit="bar"
              color="#0d9488"
              height={260}
            />
          </Card>

          <Card
            title="Vessel Thermal Envelope (°C)"
            subtitle="Internal temperature thermowell recordings"
          >
            <TelemetryChart
              data={tempReadings}
              dataKey="value"
              unit="°C"
              color="#0284c7"
              height={260}
            />
          </Card>
        </div>
      )}

      {/* TAB CONTENT 4: ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              Zero active alarms logged for this facility.
            </div>
          ) : (
            activeAlerts.map((a) => (
              <div
                key={a._id}
                onClick={() => navigate(`/alerts/${a._id}`)}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500 cursor-pointer transition-colors flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={a.severity.toLowerCase()} size="sm" dot>
                      {a.severity}
                    </Badge>
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {a.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{a.description}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT 5: MAINTENANCE */}
      {activeTab === 'maintenance' && (
        <div className="space-y-3">
          {workOrders.map((wo) => (
            <div
              key={wo._id}
              onClick={() => navigate(`/maintenance/work-orders/${wo._id}`)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                  {wo.workOrderNumber}
                </span>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{wo.title}</h4>
                <div className="text-xs text-slate-500 mt-0.5">
                  Assigned to: {wo.assignedTo?.name || 'Unassigned'} • Due: {new Date(wo.dueDate).toLocaleDateString()}
                </div>
              </div>
              <Badge variant={wo.priority.toLowerCase()} size="sm">
                {wo.priority}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 6: COMPLIANCE */}
      {activeTab === 'compliance' && (
        <div className="space-y-3">
          {compliance.map((c) => (
            <div
              key={c._id}
              onClick={() => navigate(`/compliance/records/${c._id}`)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">{c.checklist?.category}</span>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{c.checklist?.title}</h4>
                <div className="text-xs text-slate-500 mt-0.5">
                  Audited by: {c.completedBy?.name || 'Safety Inspector'} • Date: {new Date(c.inspectionDate).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold font-mono text-emerald-600">{c.overallScorePercent}%</span>
                <Badge variant={c.status === 'Compliant' ? 'normal' : 'warning'} size="sm" className="block mt-1">
                  {c.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT 7: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-2">
          {auditTrail.map((log) => (
            <div
              key={log._id}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs flex items-center justify-between font-mono"
            >
              <div>
                <span className="font-semibold text-teal-600 dark:text-teal-400">{log.action}</span>
                <span className="text-slate-500 ml-2">by {log.actorName} ({log.actorRole})</span>
              </div>
              <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Configurable Illustrative Thresholds Modal */}
      <Modal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        title="Configure Illustrative Safety Thresholds"
        subtitle="Operational parameters used by the simulated telemetry engine"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsThresholdModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={savingThresholds}
              onClick={handleSaveThresholds}
            >
              Save Thresholds
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <p leading-relaxed>
              <strong>ILLUSTRATIVE THRESHOLDS ONLY:</strong> Values configured here govern synthetic telemetry alarm generation in this demonstration system. Certified industrial facilities require safety setpoints calculated and approved by licensed professional safety engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Pressure Warning Threshold (bar)"
              type="number"
              value={thresholds.pressureWarningBar}
              onChange={(e) => setThresholds({ ...thresholds, pressureWarningBar: e.target.value })}
            />
            <Input
              label="Pressure Critical Threshold (bar)"
              type="number"
              value={thresholds.pressureCriticalBar}
              onChange={(e) => setThresholds({ ...thresholds, pressureCriticalBar: e.target.value })}
            />
            <Input
              label="Temperature Min Safe (°C)"
              type="number"
              value={thresholds.tempMinC}
              onChange={(e) => setThresholds({ ...thresholds, tempMinC: e.target.value })}
            />
            <Input
              label="Temperature Max Safe (°C)"
              type="number"
              value={thresholds.tempMaxC}
              onChange={(e) => setThresholds({ ...thresholds, tempMaxC: e.target.value })}
            />
            <Input
              label="Leak Warning Limit (ppm)"
              type="number"
              value={thresholds.leakWarningPpm}
              onChange={(e) => setThresholds({ ...thresholds, leakWarningPpm: e.target.value })}
            />
            <Input
              label="Leak Critical Limit (ppm)"
              type="number"
              value={thresholds.leakCriticalPpm}
              onChange={(e) => setThresholds({ ...thresholds, leakCriticalPpm: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
