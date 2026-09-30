import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Database,
  Radio,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const FacilityDirectory = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();

  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: '',
    state: '',
    country: 'India',
    totalCapacityKg: 5000,
    operationalMode: 'Active Dispensing',
    description: ''
  });

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      let url = `/facilities?search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      if (res.success) {
        setFacilities(res.data);
      }
    } catch (err) {
      console.error('Failed to load facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchFacilities, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleCreateFacility = async (e) => {
    e.preventDefault();
    try {
      setCreateSubmitting(true);
      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        location: {
          city: formData.city,
          state: formData.state,
          country: formData.country
        },
        totalCapacityKg: Number(formData.totalCapacityKg),
        operationalMode: formData.operationalMode,
        description: formData.description
      };
      const res = await api.post('/facilities', payload);
      if (res.success) {
        setIsCreateOpen(false);
        setFormData({
          name: '',
          code: '',
          city: '',
          state: '',
          country: 'India',
          totalCapacityKg: 5000,
          operationalMode: 'Active Dispensing',
          description: ''
        });
        fetchFacilities();
      }
    } catch (err) {
      alert(err.message || 'Failed to create facility');
    } finally {
      setCreateSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Hydrogen Facility Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized register of hydrogen storage depots, buffer modules, and cryogenic LH2 terminals.
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCreateOpen(true)}
          >
            Register Facility
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
            placeholder="Search by facility name, site code, city, state..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="" className="dark:bg-slate-900">All Operational Statuses</option>
            <option value="Normal" className="dark:bg-slate-900">Normal</option>
            <option value="Warning" className="dark:bg-slate-900">Warning</option>
            <option value="Critical" className="dark:bg-slate-900">Critical</option>
            <option value="Maintenance" className="dark:bg-slate-900">Maintenance</option>
            <option value="Offline" className="dark:bg-slate-900">Offline</option>
          </select>
        </div>
      </div>

      {/* Facilities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" count={3} />
        </div>
      ) : facilities.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No facilities found"
          description="Try broadening your search query or clear active filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setStatusFilter('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => {
            const hasCritical = facility.criticalAlertCount > 0;
            return (
              <div
                key={facility._id}
                onClick={() => navigate(`/facilities/${facility._id}`)}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/60 rounded-xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {facility.code}
                    </span>
                    <Badge variant={facility.status.toLowerCase()} size="sm" dot>
                      {facility.status}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {facility.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {facility.location?.city}, {facility.location?.state} ({facility.location?.country})
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                    {facility.description || 'Continuous monitoring facility with high-pressure and cryo buffers.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                      <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                        {facility.storageUnitCount}
                      </div>
                      <div className="text-[10px] text-slate-400">Vessels</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                      <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                        {facility.onlineSensorCount}/{facility.sensorCount}
                      </div>
                      <div className="text-[10px] text-slate-400">Sensors Online</div>
                    </div>
                    <div className={`p-2 rounded-lg ${hasCritical ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}>
                      <div className="text-sm font-bold font-mono">
                        {facility.activeAlertCount}
                      </div>
                      <div className="text-[10px] opacity-75">Active Alarms</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {facility.lastTelemetryTimestamp
                        ? new Date(facility.lastTelemetryTimestamp).toLocaleTimeString()
                        : 'Active Feed'}
                    </span>
                    <span className="text-teal-600 dark:text-teal-400 font-semibold group-hover:underline flex items-center gap-1">
                      Inspect Site <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Facility Registration Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register New Hydrogen Facility"
        subtitle="Provision administrative metadata and operational boundaries"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={createSubmitting}
              onClick={handleCreateFacility}
            >
              Save Facility
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateFacility} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Facility Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Sierra Clean Hydrogen Terminal"
            />
            <Input
              label="Facility Site Code"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. H2-SIERRA-04"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="City"
            />
            <Input
              label="State / Province"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="State"
            />
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="Country"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Total Nameplate Capacity (kg H2)"
              type="number"
              required
              value={formData.totalCapacityKg}
              onChange={(e) => setFormData({ ...formData, totalCapacityKg: e.target.value })}
            />
            <Select
              label="Primary Operational Mode"
              value={formData.operationalMode}
              onChange={(e) => setFormData({ ...formData, operationalMode: e.target.value })}
              options={[
                'Active Dispensing',
                'Bulk Storage Buffer',
                'Electrolyzer Ingestion',
                'Standby Hold'
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Facility Description & Overview
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Facility architecture, storage vessel specs, pipeline interconnects..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
