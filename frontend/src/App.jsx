import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Departments from './pages/Departments';
import FaultReports from './pages/FaultReports';
import MaintenanceLogs from './pages/MaintenanceLogs';
import AssetCategories from './pages/AssetCategories';
// ===== SECTIONS-STANDALONE-PAGE-START =====
import Sections from './pages/Sections';
// ===== SECTIONS-STANDALONE-PAGE-END =====

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Redirect root to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assets" element={<Assets />} />
            <Route path="asset-categories" element={<AssetCategories />} />
            <Route path="departments" element={<Departments />} />
            {/* ===== SECTIONS-STANDALONE-PAGE-START ===== */}
            <Route path="sections" element={<Sections />} />
            {/* ===== SECTIONS-STANDALONE-PAGE-END ===== */}
            <Route path="maintenance-logs" element={<MaintenanceLogs />} />
            <Route path="fault-reports" element={<FaultReports />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
