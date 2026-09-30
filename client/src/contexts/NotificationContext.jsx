import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications?limit=20');
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  // Real-time socket notifications
  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getSocket();

    const handleNewNotification = (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
      addToast({
        title: notif.title,
        message: notif.message,
        severity: notif.severity,
        link: notif.link
      });
    };

    const handleNewAlert = (alert) => {
      addToast({
        title: `${alert.severity.toUpperCase()} ALERT: ${alert.title}`,
        message: alert.description,
        severity: alert.severity === 'Critical' ? 'critical' : 'warning',
        link: `/alerts/${alert._id}`
      });
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('new_alert', handleNewAlert);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('new_alert', handleNewAlert);
    };
  }, [isAuthenticated]);

  const addToast = ({ title, message, severity = 'info', link = '', duration = 6000 }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, title, message, severity, link };
    setToasts(prev => [...prev.slice(-4), newToast]); // Keep max 5 toasts

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        addToast,
        removeToast,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
