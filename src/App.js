import React, { useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrderManagement from './pages/OrderManagement';
import SalesRepresentatives from './pages/SalesRepresentatives';
import Doctors from './pages/Doctors';
import ShipmentTracking from './pages/ShipmentTracking';
import Reports from './pages/Reports';
import IVRDetails from './pages/IVRDetails';
import Products from './pages/Products';
import Settings from './pages/Settings';
import RegisterUsers from './pages/RegisterUsers';
import ContentManagement from './pages/ContentManagement';
import AuditLogs from './pages/AuditLogs';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, logout } = useAuth();

  // HIPAA: Auto-logout after 10 minutes of inactivity
  const handleTimeout = useCallback(() => {
    alert('Session expired due to inactivity. Please log in again.');
    logout();
  }, [logout]);

  useInactivityTimeout(isAuthenticated ? handleTimeout : null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0089ff]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<OrderManagement />} />
        <Route path="/sales-reps" element={<SalesRepresentatives />} />
        <Route path="/shipments" element={<ShipmentTracking />} />
        <Route path="/registrations" element={<RegisterUsers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/ivr-details" element={<IVRDetails />} />
        <Route path="/products" element={<Products />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/content" element={<ContentManagement />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
