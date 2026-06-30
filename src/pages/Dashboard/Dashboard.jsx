import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import SupplierDashboard from './SupplierDashboard';
import CustomerDashboard from './CustomerDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  } else if (user.role === 'SUPPLIER') {
    return <SupplierDashboard />;
  } else if (user.role === 'CUSTOMER') {
    return <CustomerDashboard />;
  }

  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      Unknown role format. Please contact administrator.
    </div>
  );
};

export default Dashboard;
