import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

const DashboardGate: React.FC = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'admin_user':
      return <AdminDashboard />;
    case 'user':
      return <UserDashboard />;
    // Add case for 'admin' if they have a specific dashboard
    // case 'admin':
    //   return <AdminDashboard />;
    default:
      // Or a default/error component
      return <div>No dashboard available for your role.</div>;
  }
};

export default DashboardGate;
