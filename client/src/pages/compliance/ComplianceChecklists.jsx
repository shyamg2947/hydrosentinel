import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Play,
  FileCheck,
  Calendar,
  Building2
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useFacility } from '../../contexts/FacilityContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Table } from '../../components/common/Table';

export const ComplianceChecklists = () => {
  const { isSafetyOfficer, isFacilityManager } = useAuth();
  const { selectedFacilityId, facilities } = useFacility();

  const [checklists, setChecklists] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inspection execution modal state
  const [activeChecklist, setActiveChecklist] = useState(null);
  const [inspectionFacility, setInspectionFacility] = useState(selectedFacilityId || '');
  const [itemStatuses, setItemStatuses] = useState({});
  const [itemNotes, setItemNotes] = useState({});
  const [generalNotes, setGeneralNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchChecklistsAndRecords = async () => {
    try {
      setLoading(true);
      let recUrl = '/compliance/records?limit=25';
      if (selectedFacilityId) recUrl += `&facility=${selectedFacilityId}`;

      const [chkRes, recRes] = await Promise.all([
        api.get('/compliance/checklists'),
        api.get(recUrl)
      ]);

      if (chkRes.success) setChecklists(chkRes.data);
      if (recRes.success) setRecords(recRes.data);
    } catch (err) {
      console.error('Failed to load checklists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklistsAndRecords();
  }, [selectedFacilityId]);

  const handleStartInspection = (checklist) => {
    setActiveChecklist(checklist);
    setInspectionFacility(selectedFacilityId || (facilities[0]?._id || ''));
    const initialStatuses = {};
    const initialNotes = {};
    checklist.items?.forEach((item) => {
      initialStatuses[item.itemId] = 'Pass';
      initialNotes[item.itemId] = '';
    });
    setItemStatuses(initialStatuses);
    setItemNotes(initialNotes);
    setGeneralNotes('');
  };

  const handleSubmitInspection = async () => {
    if (!activeChecklist || !inspectionFacility) {
      alert('Please choose a facility for this inspection.');
      return;
    }

    try {
      setSubmitting(true);
      const itemsChecked = activeChecklist.items.map((item) => ({
        itemId: item.itemId,
        requirement: item.requirement,
        status: itemStatuses[item.itemId] || 'Pass',
        evidenceNotes: itemNotes[item.itemId] || 'Audited and verified compliant'
      }));

      const res = await api.post('/compliance/records', {
        checklist: activeChecklist._id,
        facility: inspectionFacility,
        itemsChecked,
        notes: generalNotes || 'Routine compliance audit completed'
      });

      if (res.success) {
        setActiveChecklist(null);
        fetchChecklistsAndRecords();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit inspection');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Inspection Date',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
          {new Date(row.inspectionDate).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Protocol & Category',
      render: (row) => (
        <div>
          <span className="font-mono text-[10px] font-bold text-teal-600 block">
            {row.checklist?.code}
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
            {row.checklist?.title}
          </span>
        </div>
      )
    },
    {
      header: 'Facility Site',
      render: (row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {row.facility?.name}
        </span>
      )
    },
    {
      header: 'Auditor',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {row.completedBy?.name || 'Safety Inspector'}
        </span>
      )
    },
    {
      header: 'Score',
      render: (row) => (
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
          {row.overallScorePercent}%
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Compliant' ? 'normal' : 'warning'} size="sm">
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <ClipboardList className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          Safety Inspection Protocols & Checklists
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Perform scheduled site audits, verify physical containment barriers, and generate traceable compliance records.
        </p>
      </div>

      {/* Available Checklists Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Available Safety Checklist Protocols ({checklists.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checklists.map((chk) => (
            <div
              key={chk._id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                    {chk.code}
                  </span>
                  <Badge variant="default" size="sm">
                    {chk.frequency}
                  </Badge>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{chk.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{chk.category}</p>
                <div className="text-[11px] text-slate-400 mt-2">
                  {chk.items?.length || 0} mandatory verification checkpoints
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Play}
                  onClick={() => handleStartInspection(chk)}
                >
                  Conduct Audit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Records Table */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Historical Safety Audit Log
        </h3>
        <Table
          columns={columns}
          data={records}
          isLoading={loading}
          emptyMessage="No historical inspection records logged."
        />
      </div>

      {/* Conduct Inspection Modal */}
      <Modal
        isOpen={!!activeChecklist}
        onClose={() => setActiveChecklist(null)}
        title={`Execute Inspection: ${activeChecklist?.title}`}
        subtitle={`Protocol ${activeChecklist?.code} • ${activeChecklist?.frequency} Verification`}
        maxWidth="max-w-3xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setActiveChecklist(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={submitting}
              icon={FileCheck}
              onClick={handleSubmitInspection}
            >
              Certify & Submit Inspection
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Audited Facility
            </label>
            <select
              value={inspectionFacility}
              onChange={(e) => setInspectionFacility(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 text-slate-900 dark:text-slate-100"
            >
              {facilities.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Protocol Checklist Items
            </span>
            {activeChecklist?.items?.map((item) => {
              const currentStatus = itemStatuses[item.itemId] || 'Pass';
              return (
                <div
                  key={item.itemId}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      <strong className="font-mono text-teal-600 mr-1.5">{item.itemId}:</strong>
                      {item.requirement}
                    </span>

                    {/* Status Pill Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {['Pass', 'Fail', 'N/A'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setItemStatuses({ ...itemStatuses, [item.itemId]: st })}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                            currentStatus === st
                              ? st === 'Pass'
                                ? 'bg-emerald-600 text-white'
                                : st === 'Fail'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={itemNotes[item.itemId] || ''}
                    onChange={(e) => setItemNotes({ ...itemNotes, [item.itemId]: e.target.value })}
                    placeholder="Evidence / observation notes (e.g. verified zero leak with soapy solution)..."
                    className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              General Audit Summary & Conclusion
            </label>
            <textarea
              rows={2}
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Summary of inspection findings, overall integrity notes..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
