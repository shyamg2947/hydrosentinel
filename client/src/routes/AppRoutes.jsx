import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/layout/AppLayout';

// Public & Hero Pages
import LandingPage from '../pages/LandingPage';
import IndiaFacilitiesMap from '../pages/facilities/IndiaFacilitiesMap';

// Pages with named exports
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { FacilityDirectory } from '../pages/facilities/FacilityDirectory';
import { FacilityDetail } from '../pages/facilities/FacilityDetail';
import { StorageUnitDetail } from '../pages/facilities/StorageUnitDetail';
import { LiveMonitoring } from '../pages/monitoring/LiveMonitoring';
import { SensorInventory } from '../pages/sensors/SensorInventory';
import { SensorDetail } from '../pages/sensors/SensorDetail';
import { AlertCenter } from '../pages/alerts/AlertCenter';
import { AlertDetail } from '../pages/alerts/AlertDetail';
import { MaintenanceDashboard } from '../pages/maintenance/MaintenanceDashboard';
import { WorkOrderList } from '../pages/maintenance/WorkOrderList';
import { WorkOrderDetail } from '../pages/maintenance/WorkOrderDetail';
import { MaintenanceCalendar } from '../pages/maintenance/MaintenanceCalendar';
import { ComplianceDashboard } from '../pages/compliance/ComplianceDashboard';
import { ComplianceChecklists } from '../pages/compliance/ComplianceChecklists';
import { SafetyDocuments } from '../pages/compliance/SafetyDocuments';
import { CorrectiveActions } from '../pages/compliance/CorrectiveActions';

// Pages with default exports
import AnalyticsReports from '../pages/analytics/AnalyticsReports';
import NotificationCenter from '../pages/notifications/NotificationCenter';
import AuditLogViewer from '../pages/audit/AuditLogViewer';
import UserManagement from '../pages/users/UserManagement';
import ApplicationSettings from '../pages/settings/ApplicationSettings';
import UserProfile from '../pages/profile/UserProfile';
import NotFound from '../pages/NotFound';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing & Authentication */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Standalone Public Map Route */}
      <Route path="/map" element={<IndiaFacilitiesMap />} />

      {/* Protected App Routes inside AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />

        {/* India Facilities Map (Inside Platform Dashboard) */}
        <Route path="india-map" element={<IndiaFacilitiesMap />} />

        {/* Facilities */}
        <Route path="facilities" element={<FacilityDirectory />} />
        <Route path="facilities/:id" element={<FacilityDetail />} />
        <Route path="facilities/:facilityId/storage/:id" element={<StorageUnitDetail />} />

        {/* Live Monitoring */}
        <Route path="monitoring" element={<LiveMonitoring />} />

        {/* Sensors */}
        <Route path="sensors" element={<SensorInventory />} />
        <Route path="sensors/:id" element={<SensorDetail />} />

        {/* Alerts & Incidents */}
        <Route path="alerts" element={<AlertCenter />} />
        <Route path="alerts/:id" element={<AlertDetail />} />

        {/* Preventive Maintenance */}
        <Route path="maintenance" element={<MaintenanceDashboard />} />
        <Route path="maintenance/work-orders" element={<WorkOrderList />} />
        <Route path="maintenance/work-orders/:id" element={<WorkOrderDetail />} />
        <Route path="maintenance/calendar" element={<MaintenanceCalendar />} />

        {/* Compliance & Safety */}
        <Route path="compliance" element={<ComplianceDashboard />} />
        <Route path="compliance/checklists" element={<ComplianceChecklists />} />
        <Route path="compliance/documents" element={<SafetyDocuments />} />
        <Route path="compliance/corrective-actions" element={<CorrectiveActions />} />

        {/* Analytics & Reports */}
        <Route path="analytics" element={<AnalyticsReports />} />

        {/* Notification Center */}
        <Route path="notifications" element={<NotificationCenter />} />

        {/* Security & Audit */}
        <Route path="audit" element={<AuditLogViewer />} />
        <Route path="audit-logs" element={<AuditLogViewer />} />

        {/* User Administration (Super Admin only) */}
        <Route 
          path="users" 
          element={
            <ProtectedRoute allowedRoles={['Super Admin', 'SUPER_ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />

        {/* Simulator & System Settings */}
        <Route path="settings" element={<ApplicationSettings />} />

        {/* User Profile */}
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
