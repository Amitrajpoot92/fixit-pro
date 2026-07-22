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
import AdminSettings from './Dashboard/pages/admin/settings';
import Products from './Dashboard/pages/admin/products'; 
import Inventory from './Dashboard/pages/admin/inventory'; 
import Orders from './Dashboard/pages/admin/orders';
import ManageHome from './Dashboard/pages/admin/manage-home'; 
// 📦 NAYA IMPORT: Product Orders (E-commerce Dashboard)
import ProductOrders from './Dashboard/pages/admin/ProductOrders';

// 💰 Admin Financial Pages
import AdminKyc from './Dashboard/pages/admin/Kyc';
import PaymentsLedger from './Dashboard/pages/admin/PaymentsLedger';

// 🚀 Tech Dashboard Pages
import TechDashboard from './Dashboard/pages/technician/dashboard';
import TechTasks from './Dashboard/pages/technician/tasks';
import TechEarnings from './Dashboard/pages/technician/earnings';
import TechPricing from './Dashboard/pages/technician/pricing';
import TechSettings from './Dashboard/pages/technician/settings'; 
// 💰 Tech Financial Pages
import TechKyc from './Dashboard/pages/technician/Kyc';

// 🛡️ Security Guard
import ProtectedRoute from './Dashboard/component/ProtectedRoute'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/technician" element={<TechLogin />} />

        {/* 🔒 Protected Admin Routes Group */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRole="admin">
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="manage-home" element={<ManageHome />} /> 
              <Route path="catalog" element={<Catalog />} />
              <Route path="products" element={<Products />} /> 
              <Route path="inventory" element={<Inventory />} /> 
              <Route path="orders" element={<Orders />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="technicians" element={<Technicians />} />
              
              {/* 📦 NAYA ROUTE: E-Commerce Product Orders */}
              <Route path="product-orders" element={<ProductOrders />} />
              
              {/* 💰 Financial Routes */}
              <Route path="kyc" element={<AdminKyc />} />
              <Route path="payments" element={<PaymentsLedger />} />
              
              <Route path="settings" element={<AdminSettings />} />
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
              <Route path="pricing" element={<TechPricing />} />
              
              {/* 💰 Tech Financial Routes */}
              <Route path="earnings" element={<TechEarnings />} />
              <Route path="kyc" element={<TechKyc />} />
              
              <Route path="settings" element={<TechSettings />} />
              <Route path="*" element={<Navigate to="/technician/dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;