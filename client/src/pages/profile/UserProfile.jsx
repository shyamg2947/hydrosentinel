import React, { useState } from 'react';
import { 
  User, Mail, Shield, Building2, Key, CheckCircle2, AlertTriangle, Moon, Sun, Monitor 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { authService } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';

export default function UserProfile() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    try {
      setSubmitting(true);
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Personnel Profile & Credentials
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review your platform identity, facility assignments, security credentials, and interface preferences
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-2 border ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Profile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-1 text-center flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl font-bold ring-4 ring-blue-500/20 mb-4">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name || 'Operator'}</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
          <div className="mt-3">
            <Badge variant="primary">{user?.role?.replace('_', ' ') || 'VIEWER'}</Badge>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Identity & Authorization Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs uppercase text-slate-400 font-semibold block">Full Name</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">{user?.name}</span>
            </div>
            <div>
              <span className="text-xs uppercase text-slate-400 font-semibold block">Email Address</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium font-mono text-xs">{user?.email}</span>
            </div>
            <div>
              <span className="text-xs uppercase text-slate-400 font-semibold block">Security Role</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">{user?.role}</span>
            </div>
            <div>
              <span className="text-xs uppercase text-slate-400 font-semibold block">Account Status</span>
              <span className="text-emerald-500 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active & Verified
              </span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs uppercase text-slate-400 font-semibold block mb-2">Assigned Facilities</span>
            <div className="flex flex-wrap gap-2">
              {user?.assignedFacilities && user.assignedFacilities.length > 0 ? (
                user.assignedFacilities.map(f => (
                  <Badge key={f._id || f} variant="outline" className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-blue-500" />
                    {f.name || f}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">Enterprise Access (All Facilities)</span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Change Password & Appearance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Credentials */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-blue-500" />
            Update Access Credentials
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
            <Input
              label="New Password"
              type="password"
              required
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
            <div className="pt-2">
              <Button type="submit" variant="primary" loading={submitting} className="w-full">
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* Display Preferences */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-purple-500" />
            Interface & Telemetry Theme
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            HydroSentinel supports industrial high-contrast dark mode for low-light control rooms and light mode for administrative reporting.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <Sun className="w-6 h-6 text-amber-500" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Light Mode</span>
            </button>

            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <Moon className="w-6 h-6 text-blue-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Dark Mode (Control Room)</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
