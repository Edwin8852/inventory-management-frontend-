import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminInvoices from './AdminInvoices';
import SupplierInvoices from './SupplierInvoices';
import CustomerInvoices from './CustomerInvoices';

const Invoices = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  switch (user.role) {
    case 'ADMIN':
      return <AdminInvoices />;
    case 'SUPPLIER':
      return <SupplierInvoices />;
    case 'CUSTOMER':
      return <CustomerInvoices />;
    default:
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Access Denied. You do not have permission to view invoices.</p>
        </div>
      );
  }
};

export default Invoices;
