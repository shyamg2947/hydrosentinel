import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Building2,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Compass
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useFacility } from '../../contexts/FacilityContext';
import { useSocket } from '../../contexts/SocketContext';
import { useNotifications } from '../../contexts/NotificationContext';

export const Navbar = ({ onOpenMobileMenu, onOpenSearch }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { facilities, selectedFacilityId, selectFacility } = useFacility();
  const { connected } = useSocket();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left section: mobile hamburger & Facility Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Facility Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <select
            value={selectedFacilityId}
            onChange={(e) => selectFacility(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[240px] truncate"
          >
            <option value="" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              All Facilities (Overview)
            </option>
            {facilities.map((fac) => (
              <option key={fac._id} value={fac._id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {fac.name} ({fac.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle section: Global search trigger */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search facilities, sensors, alerts, work orders...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-500 dark:text-slate-300">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: WebSocket status, Notifications, Theme, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time Connection Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            connected
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
          }`}
          title={connected ? 'Connected to live telemetry engine via WebSockets' : 'Reconnecting to telemetry engine...'}
        >
          {connected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="hidden sm:inline text-[11px]">LIVE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline text-[11px]">OFFLINE</span>
            </>
          )}
        </div>

        {/* India Map Quick Action */}
        <Link
          to="/india-map"
          className="p-2 rounded-lg text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="National Green Hydrogen Grid Map"
        >
          <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Notifications ({unreadCount} new)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No recent notifications</div>
                ) : (
                  notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => {
                        markAsRead(notif._id);
                        if (notif.link) navigate(notif.link);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                        !notif.isRead ? 'bg-teal-50/30 dark:bg-teal-950/20' : ''
                      }`}
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                        <span>{notif.title}</span>
                        {!notif.isRead && <span className="w-2 h-2 rounded-full bg-teal-500" />}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(notif.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-800/20">
                <Link
                  to="/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
                >
                  View Notification Center →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-tight">
                {user?.name}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">{user?.role}</div>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  {user?.role}
                </span>
              </div>
              <Link
                to="/profile"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                Profile & Security
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
