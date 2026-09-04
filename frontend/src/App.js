import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';

import Login      from './pages/Login/Login';
import Dashboard  from './pages/Dashboard/Dashboard';
import Inventory  from './pages/Inventory/Inventory';
import Billing    from './pages/Billing/Billing';
import Sales      from './pages/Sales/Sales';
import DuePayments from './pages/DuePayments/DuePayments';
import Reports    from './pages/Reports/Reports';
import Customers  from './pages/Customers/Customers';
import Settings   from './pages/Settings/Settings';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:48 }}>🙏</div>
      <div style={{ color:'#b45309', fontWeight:700 }}>Loading...</div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/"          element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
              <Route path="/billing"   element={<PrivateRoute><Billing /></PrivateRoute>} />
              <Route path="/sales"     element={<PrivateRoute><Sales /></PrivateRoute>} />
              <Route path="/dues"      element={<PrivateRoute><DuePayments /></PrivateRoute>} />
              <Route path="/reports"   element={<PrivateRoute><Reports /></PrivateRoute>} />
              <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
              <Route path="/settings"  element={<PrivateRoute><Settings /></PrivateRoute>} />
              <Route path="*"          element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
