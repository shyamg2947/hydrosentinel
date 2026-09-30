import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Activity,
  Radio,
  AlertTriangle,
  Wrench,
  CalendarDays,
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  BarChart3,
  History,
  Users,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Shield,
  Compass
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user, isSuperAdmin, isSafetyOfficer, isFacilityManager } = useAuth();
  const { unreadCount } = useNotifications();

  const navSections = [
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'India Facilities Map', path: '/india-map', icon: Compass },
        { label: 'Live Monitoring', path: '/monitoring', icon: Activity },
        { label: 'Facility Directory', path: '/facilities', icon: Building2 },
        { label: 'Sensor Inventory', path: '/sensors', icon: Radio }
      ]
    },
    {
      title: 'SAFETY & ALERTS',
      items: [
        { label: 'Alert Center', path: '/alerts', icon: AlertTriangle, badge: '!' },
        { label: 'Safety & Compliance', path: '/compliance', icon: ShieldCheck },
        { label: 'Document Register', path: '/compliance/documents', icon: FileText },
        { label: 'Corrective Actions', path: '/compliance/corrective-actions', icon: FileSpreadsheet }
      ]
    },
    {
      title: 'MAINTENANCE',
      items: [
        { label: 'Maintenance Overview', path: '/maintenance', icon: Wrench },
        { label: 'Work Orders', path: '/maintenance/work-orders', icon: FileText },
        { label: 'Maintenance Calendar', path: '/maintenance/calendar', icon: CalendarDays }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { label: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
        { label: 'Audit Logs', path: '/audit-logs', icon: History }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        ...(isSuperAdmin ? [{ label: 'User Management', path: '/users', icon: Users }] : []),
        { label: 'Simulator & Settings', path: '/settings', icon: Sliders }
      ]
    }
  ];

  const handleLinkClick = () => {
    if (isMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 shadow-sm dark:shadow-none ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
            {/* Geometric HydroSentinel SVG Logo */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-900/20">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" className="stroke-teal-200" />
                <path d="M12 7v10M8 10l8 4M16 10l-8 4" className="stroke-white" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base leading-none">
                  HYDRO<span className="text-teal-600 dark:text-teal-400">SENTINEL</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider font-semibold uppercase mt-1">
                  H2 Mission Control
                </span>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, sIdx) => (
            <div key={sIdx}>
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={iIdx}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-teal-600 text-white shadow-xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        } ${isCollapsed ? 'justify-center' : ''}`
                      }
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                      {!isCollapsed && item.badge && (
                        <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className={`flex items-center gap-3 p-2 rounded-lg bg-slate-100 dark:bg-slate-800/40 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-teal-600 dark:bg-teal-800 flex items-center justify-center text-white dark:text-teal-200 font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="text-xs font-medium text-slate-900 dark:text-white truncate">{user?.name || 'Operator'}</div>
                <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold truncate">{user?.role}</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
