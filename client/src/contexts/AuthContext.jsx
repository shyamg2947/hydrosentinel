import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hydrosentinel_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('hydrosentinel_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem('hydrosentinel_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('hydrosentinel_user', JSON.stringify(res.user));
            initSocket();
          }
        } catch (err) {
          console.warn('Failed to verify existing session token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      localStorage.setItem('hydrosentinel_token', res.token);
      localStorage.setItem('hydrosentinel_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      disconnectSocket();
      initSocket();
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('hydrosentinel_token');
    localStorage.removeItem('hydrosentinel_user');
    disconnectSocket();
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('hydrosentinel_user', JSON.stringify(updatedUser));
  };

  const isSuperAdmin = user?.role === 'Super Admin';
  const isFacilityManager = user?.role === 'Facility Manager' || isSuperAdmin;
  const isSafetyOfficer = user?.role === 'Safety Officer' || isSuperAdmin;
  const isTechnician = user?.role === 'Maintenance Technician' || isSuperAdmin;
  const isViewer = user?.role === 'Viewer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUserProfile,
        isAuthenticated: !!user,
        isSuperAdmin,
        isFacilityManager,
        isSafetyOfficer,
        isTechnician,
        isViewer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
