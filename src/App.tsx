import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import DashboardGate from './components/Dashboard/DashboardGate';
import DeviceManagement from './components/Device/DeviceManagement';
import UserManagement from './components/Users/UserManagement';
import LocationManagement from './components/Location/LocationManagement';
import Profile from './components/Profile/Profile';
import AddLocation from './components/Location/AddLocation';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
              {/* Main Dashboard Route */}
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin_user', 'user']}>
                    <DashboardGate />
                  </ProtectedRoute>
                } 
              />

              {/* Add Location Route for Admins */}
              <Route 
                path="add-location" 
                element={
                  <ProtectedRoute allowedRoles={['admin_user']}>
                    <AddLocation />
                  </ProtectedRoute>
                } 
              />
              
              {/* Management placeholder routes */}
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="locations"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <LocationManagement />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="devices"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'admin_user']}>
                    <DeviceManagement />
                  </ProtectedRoute>
                }
              />

              {/* Profile Route */}
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect to dashboard */}
              <Route path="" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;