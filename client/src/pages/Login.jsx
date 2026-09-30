import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';

export const Login = () => {
  const [email, setEmail] = useState('admin@hydrosentinel.io');
  const [password, setPassword] = useState('Hydrogen@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  const demoAccounts = [
    { role: 'Super Admin', email: 'admin@hydrosentinel.io', desc: 'System-wide control & settings' },
    { role: 'Facility Manager', email: 'manager@hydrosentinel.io', desc: 'Site operations & work orders' },
    { role: 'Safety Officer', email: 'safety@hydrosentinel.io', desc: 'Compliance & alert triage' },
    { role: 'Maintenance Tech', email: 'tech@hydrosentinel.io', desc: 'Field tasks & calibration' },
    { role: 'Viewer', email: 'viewer@hydrosentinel.io', desc: 'Read-only telemetry audits' }
  ];

  const handleDemoSelect = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Hydrogen@2026');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Geometric HydroSentinel Logo */}
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 items-center justify-center text-white shadow-xl shadow-teal-500/20 mb-4">
          <svg viewBox="0 0 24 24" className="w-10 h-10 fill-none stroke-current stroke-2">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" className="stroke-teal-200" />
            <path d="M12 7v10M8 10l8 4M16 10l-8 4" className="stroke-white" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white">
          HYDRO<span className="text-teal-400">SENTINEL</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Intelligent Hydrogen Storage Monitoring & Safety Operations
        </p>

        {isExpired && (
          <div className="mt-4 p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs">
            Your session has expired. Please sign in again.
          </div>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Operator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@hydrosentinel.io"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-10 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full mt-2" isLoading={loading}>
              Sign In to Mission Control
            </Button>
          </form>

          {/* Quick Demo Accounts Selector */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Select Demo Capstone Role:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((account, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDemoSelect(account.email)}
                  className={`p-2 rounded-lg text-left border transition-all text-xs flex items-center justify-between cursor-pointer ${
                    email === account.email
                      ? 'bg-teal-950/40 border-teal-500/60 text-teal-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-semibold block">{account.role}</span>
                    <span className="text-[10px] opacity-75">{account.desc}</span>
                  </div>
                  {email === account.email && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-[11px] text-slate-500">
          HydroSentinel Final Year Engineering Capstone System • Synthetic Telemetry
        </div>
      </div>
    </div>
  );
};
