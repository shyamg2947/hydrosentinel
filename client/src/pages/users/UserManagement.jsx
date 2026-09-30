import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, Mail, Key, Edit, Trash2, CheckCircle2, XCircle, Search, RefreshCw 
} from 'lucide-react';
import { userService, facilityService } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import EmptyState from '../../components/EmptyState';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Maintenance Technician',
    assignedFacilities: []
  });

  const fetchUsersAndFacilities = async () => {
    try {
      setLoading(true);
      const [usersRes, facRes] = await Promise.all([
        userService.getAll(),
        facilityService.getAll()
      ]);
      setUsers(usersRes.data?.data || usersRes.data || []);
      setFacilities(facRes.data?.data || facRes.data || []);
    } catch (err) {
      console.error('Failed to fetch user directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndFacilities();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await userService.create(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Maintenance Technician',
        assignedFacilities: []
      });
      fetchUsersAndFacilities();
    } catch (err) {
      alert('Failed to create user: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'ACTIVE' || user.isActive === true ? false : true;
      await userService.update(user._id, { isActive: newStatus });
      fetchUsersAndFacilities();
    } catch (err) {
      alert('Failed to update status: ' + (err.message || 'Unknown error'));
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'Super Admin':
      case 'SUPER_ADMIN': return 'danger';
      case 'Facility Manager':
      case 'FACILITY_MANAGER': return 'info';
      case 'Safety Officer':
      case 'SAFETY_OFFICER': return 'warning';
      case 'Maintenance Technician':
      case 'TECHNICIAN': return 'success';
      default: return 'outline';
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            User & Role Administration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage enterprise personnel credentials, role-based access control, and facility assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsersAndFacilities} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<UserPlus className="w-4 h-4" />}>
            Provision User
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name & Profile</Table.Head>
              <Table.Head>Role</Table.Head>
              <Table.Head>Assigned Facilities</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Last Login</Table.Head>
              <Table.Head className="text-right">Action</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <Table.Row key={i}>
                  <Table.Cell colSpan={6} className="py-4 text-center text-slate-400">
                    Loading personnel registry...
                  </Table.Cell>
                </Table.Row>
              ))
            ) : filteredUsers.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6} className="py-12 text-center">
                  <EmptyState
                    icon={<Users className="w-8 h-8 text-slate-400" />}
                    title="No Users Found"
                    description="No personnel match the search parameters."
                  />
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredUsers.map((u) => (
                <Table.Row key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <Table.Cell>
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {u.email}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={getRoleBadgeVariant(u.role)}>
                      {u.role.replace('_', ' ')}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {u.assignedFacilities && u.assignedFacilities.length > 0 ? (
                        u.assignedFacilities.map(f => (
                          <span key={f._id || f} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {f.name || 'Assigned'}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">All / Enterprise</span>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={u.status === 'ACTIVE' ? 'success' : 'outline'}>
                      {u.status || 'ACTIVE'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="text-xs font-mono text-slate-500">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <Button
                      variant={u.status === 'ACTIVE' ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleStatus(u)}
                    >
                      {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Card>

      {/* Provision User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision Platform User"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Dr. Emily Clarke"
          />

          <Input
            label="Corporate Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="emily.clarke@hydrosentinel.io"
          />

          <Input
            label="Initial Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="At least 8 characters"
          />

          <Select
            label="RBAC Role"
            required
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: 'Super Admin', label: 'Super Admin (Full Enterprise Control)' },
              { value: 'Facility Manager', label: 'Facility Manager (Facility & Work Orders)' },
              { value: 'Safety Officer', label: 'Safety Officer (Compliance & Audits)' },
              { value: 'Maintenance Technician', label: 'Maintenance Technician (Field Execution)' },
              { value: 'Viewer', label: 'Viewer (Read-Only Telemetry)' }
            ]}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Assigned Facility (Optional)
            </label>
            <select
              multiple
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, assignedFacilities: selected });
              }}
            >
              {facilities.map(f => (
                <option key={f._id} value={f._id}>{f.name} ({f.code})</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">Hold Cmd/Ctrl to select multiple facilities.</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
