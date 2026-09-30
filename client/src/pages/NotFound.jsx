import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 ring-4 ring-blue-500/20">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">404 - Telemetry Lost</h1>
      <p className="text-slate-400 mt-2 max-w-md text-sm">
        The requested system endpoint, telemetry channel, or facility resource does not exist or has been decommissioned.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
            Return to Mission Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
