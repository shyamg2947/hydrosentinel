import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { GlobalSearchModal } from './GlobalSearchModal';
import { SimulationBanner } from '../common/SimulationBanner';
import { useNotifications } from '../../contexts/NotificationContext';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { toasts, removeToast } = useNotifications();

  // Keyboard shortcut Cmd/Ctrl + K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Simulation Banner Notice */}
      <SimulationBanner />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
            isCollapsed ? 'md:ml-20' : 'md:ml-64'
          }`}
        >
          <Navbar
            onOpenMobileMenu={() => setIsMobileOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
        {toasts.map((toast) => {
          const isCritical = toast.severity === 'critical';
          const isWarning = toast.severity === 'warning';
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-xl shadow-lg border text-xs flex items-start gap-3 transition-all animate-in slide-in-from-bottom-2 ${
                isCritical
                  ? 'bg-rose-900/90 text-rose-100 border-rose-700 backdrop-blur-md'
                  : isWarning
                  ? 'bg-amber-900/90 text-amber-100 border-amber-700 backdrop-blur-md'
                  : 'bg-slate-900/90 text-slate-100 border-slate-700 backdrop-blur-md'
              }`}
            >
              {isCritical ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : isWarning ? (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-sm">{toast.title}</div>
                <div className="mt-1 opacity-90">{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppLayout;
