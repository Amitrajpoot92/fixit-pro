import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home';

// 🔐 Login Pages
import AdminLogin from './Dashboard/pages/admin/login';
import TechLogin from './Dashboard/pages/technician/login';

// 🚀 Admin Dashboard Pages
import AdminDashboard from './Dashboard/pages/admin/dashboard';
import Catalog from './Dashboard/pages/admin/catalog';
import Bookings from './Dashboard/pages/admin/bookings';
import Technicians from './Dashboard/pages/admin/technicians';
import AdminSettings from './Dashboard/pages/admin/settings'; // 👈 Aliased to avoid clash

// 🚀 Tech Dashboard Pages
import TechDashboard from './Dashboard/pages/technician/dashboard';
import TechTasks from './Dashboard/pages/technician/tasks';
import TechEarnings from './Dashboard/pages/technician/earnings';
import TechPricing from './Dashboard/pages/technician/pricing';
import TechSettings from './Dashboard/pages/technician/settings'; // 👈 Aliased to avoid clash

// 🛡️ Security Guard
import ProtectedRoute from './Dashboard/component/ProtectedRoute'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Open Login Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/technician" element={<TechLogin />} />

        {/* 🔒 Protected Admin Routes Group */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRole="admin">
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="technicians" element={<Technicians />} />
              <Route path="settings" element={<AdminSettings />} />
              {/* Default Admin Redirect */}
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* 🔒 Protected Tech Routes Group */}
        <Route path="/technician/*" element={
          <ProtectedRoute allowedRole="technician">
            <Routes>
              <Route path="dashboard" element={<TechDashboard />} />
              <Route path="tasks" element={<TechTasks />} />
              <Route path="earnings" element={<TechEarnings />} />
              <Route path="pricing" element={<TechPricing />} />
              <Route path="settings" element={<TechSettings />} />
              {/* Default Tech Redirect */}
              <Route path="*" element={<Navigate to="/technician/dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;