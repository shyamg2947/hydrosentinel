import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  Calendar,
  User,
  ExternalLink,
  ShieldCheck,
  FileCode
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';

export const SafetyDocuments = () => {
  const { isSafetyOfficer, isSuperAdmin } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Register modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    documentNumber: '',
    category: 'Standard Operating Procedure',
    version: '1.0',
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    summary: ''
  });

  const fetchDocs = async () => {
    try {
      setLoading(true);
      let url = `/compliance/documents?search=${encodeURIComponent(search)}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      const res = await api.get(url);
      if (res.success) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error('Failed to load safety documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [categoryFilter]);

  const handleRegisterDoc = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/compliance/documents', {
        ...form,
        documentNumber: form.documentNumber.toUpperCase(),
        expiryDate: new Date(form.expiryDate)
      });
      if (res.success) {
        setIsModalOpen(false);
        setForm({
          title: '',
          documentNumber: '',
          category: 'Standard Operating Procedure',
          version: '1.0',
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          summary: ''
        });
        fetchDocs();
      }
    } catch (err) {
      alert(err.message || 'Failed to register document');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Doc #',
      accessor: 'documentNumber',
      render: (row) => (
        <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
          {row.documentNumber}
        </span>
      )
    },
    {
      header: 'Document Title & Category',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
            {row.title}
          </div>
          <span className="text-[11px] text-slate-500">{row.category} (v{row.version})</span>
        </div>
      )
    },
    {
      header: 'Review / Expiry',
      render: (row) => (
        <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
          <div>Reviewed: {new Date(row.reviewDate).toLocaleDateString()}</div>
          <div className="text-[11px] text-slate-400">Expires: {new Date(row.expiryDate).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'normal' : 'default'} size="sm">
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Responsible Lead',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {row.responsibleOwner?.name || 'HSE Director'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Safety Document & SOP Register
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standard operating procedures, emergency action plans, and regulatory revision logs.
          </p>
        </div>

        {(isSafetyOfficer || isSuperAdmin) && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Register Document
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-transparent text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="">All Document Categories</option>
          <option value="Standard Operating Procedure">Standard Operating Procedure (SOP)</option>
          <option value="Emergency Response Plan">Emergency Response Plan (ERP)</option>
          <option value="Hazard Analysis (HAZOP)">Hazard Analysis (HAZOP)</option>
          <option value="Inspection Protocol">Inspection Protocol</option>
          <option value="Regulatory Standard Guidance">Regulatory Standard Guidance</option>
        </select>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={documents}
        isLoading={loading}
        emptyMessage="No documents found matching category."
      />

      {/* Register Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Safety Protocol Document"
        subtitle="Catalog formal site procedures under revision control"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" isLoading={submitting} onClick={handleRegisterDoc}>
              Register Document
            </Button>
          </>
        }
      >
        <form onSubmit={handleRegisterDoc} className="space-y-4">
          <Input
            label="Document Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Cryogenic LH2 Bunkering Emergency Response Plan"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Document #"
              required
              value={form.documentNumber}
              onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
              placeholder="e.g. DOC-ERP-2026-02"
            />
            <Input
              label="Version"
              required
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
            />
            <Input
              label="Expiry / Review Date"
              type="date"
              required
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>

          <Select
            label="Document Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={[
              'Standard Operating Procedure',
              'Emergency Response Plan',
              'Hazard Analysis (HAZOP)',
              'Inspection Protocol',
              'Regulatory Standard Guidance'
            ]}
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Document Scope & Executive Summary
            </label>
            <textarea
              rows={3}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Summary of safety isolation protocols and regulatory alignment..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
