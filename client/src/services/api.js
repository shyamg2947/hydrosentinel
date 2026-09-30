import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1` 
  : '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Intercept requests to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hydrosentinel_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle 401 unauthorized
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('hydrosentinel_token');
      localStorage.removeItem('hydrosentinel_user');
      window.location.href = '/login?expired=true';
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Dedicated Service Objects
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/password', data)
};

export const facilityService = {
  getAll: (params) => api.get('/facilities', { params }),
  getById: (id) => api.get(`/facilities/${id}`),
  create: (data) => api.post('/facilities', data),
  update: (id, data) => api.put(`/facilities/${id}`, data),
  delete: (id) => api.delete(`/facilities/${id}`)
};

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

export const analyticsService = {
  getFacilityOverview: (facilityId) => api.get('/analytics/overview', { params: { facilityId } }),
  getIncidentTrends: (params) => api.get('/analytics/incidents', { params }),
  exportCSV: (params) => axios.get('/api/v1/analytics/export', {
    params,
    responseType: 'blob',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('hydrosentinel_token')}`
    }
  })
};

export const auditLogService = {
  getAll: (params) => api.get('/audit-logs', { params })
};

export const simulatorService = {
  getStatus: () => api.get('/simulator/status'),
  toggleRunning: (data) => api.post('/simulator/toggle', data),
  updateScenario: (data) => api.post('/simulator/scenario', data),
  updateTickRate: (data) => api.post('/simulator/tick-rate', data)
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

export default api;
