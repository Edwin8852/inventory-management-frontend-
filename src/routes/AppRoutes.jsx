import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PrivateRoute from './PrivateRoute';
import { useAuth } from '../hooks/useAuth';

// Lazy loading core modules
const Login = React.lazy(() => import('../pages/Login/Login'));
const Register = React.lazy(() => import('../pages/Login/Register'));
const Dashboard = React.lazy(() => import('../pages/Dashboard/Dashboard'));
const Billing = React.lazy(() => import('../pages/BillingPOS/Billing'));
const Products = React.lazy(() => import('../pages/Products/Products'));
const Inventory = React.lazy(() => import('../pages/Inventory/Inventory'));
const Suppliers = React.lazy(() => import('../pages/Suppliers/Suppliers'));
const Customers = React.lazy(() => import('../pages/Customers/Customers'));
const Categories = React.lazy(() => import('../pages/Categories/Categories'));
const Brands = React.lazy(() => import('../pages/Brands/Brands'));
const Purchases = React.lazy(() => import('../pages/Purchases/Purchases'));
const Invoices = React.lazy(() => import('../pages/Invoices/Invoices'));
const Returns = React.lazy(() => import('../pages/Returns/Returns'));
const Reports = React.lazy(() => import('../pages/Reports/Reports'));
const AdminSettings = React.lazy(() => import('../pages/Settings/AdminSettings'));
const SupplierSettings = React.lazy(() => import('../pages/Settings/SupplierSettings'));
const CustomerSettings = React.lazy(() => import('../pages/Settings/CustomerSettings'));
const Users = React.lazy(() => import('../pages/Users/Users'));
const PaymentVerification = React.lazy(() => import('../pages/Payments/PaymentVerification'));
const Catalog = React.lazy(() => import('../pages/Shop/Catalog'));
const MyOrders = React.lazy(() => import('../pages/MyOrders/MyOrders'));
const SupplierProfile = React.lazy(() => import('../pages/Supplier/SupplierProfile'));
const Cart = React.lazy(() => import('../pages/Shop/Cart'));
const Checkout = React.lazy(() => import('../pages/Shop/Checkout'));
const NotFound = React.lazy(() => import('../pages/NotFound'));
const Unauthorized = React.lazy(() => import('../pages/Unauthorized'));

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/dashboard" replace />;
  if (user.role === 'SUPPLIER') return <Navigate to="/shop" replace />;
  if (user.role === 'CUSTOMER') return <Navigate to="/shop" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <Router>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<PrivateRoute allowedRoles={['ADMIN', 'SUPPLIER', 'CUSTOMER']}><Layout /></PrivateRoute>}>
            <Route path="/" element={<RootRedirect />} />
            
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Invoices: all roles */}
            <Route element={<PrivateRoute allowedRoles={['ADMIN', 'SUPPLIER', 'CUSTOMER']} />}>
              <Route path="/invoices" element={<Invoices />} />
            </Route>
            {/* Admin Settings */}
            <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
            
            {/* Supplier Settings */}
            <Route element={<PrivateRoute allowedRoles={['SUPPLIER']} />}>
              <Route path="/supplier/settings" element={<SupplierSettings />} />
            </Route>

            {/* Customer Settings */}
            <Route element={<PrivateRoute allowedRoles={['CUSTOMER']} />}>
              <Route path="/customer/settings" element={<CustomerSettings />} />
            </Route>

            <Route element={<PrivateRoute allowedRoles={['CUSTOMER', 'SUPPLIER']} />}>
              <Route path="/shop" element={<Catalog />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
            </Route>
            <Route element={<PrivateRoute allowedRoles={['CUSTOMER']} />}>
              <Route path="/my-orders" element={<MyOrders />} />
            </Route>
            <Route element={<PrivateRoute allowedRoles={['SUPPLIER']} />}>
              <Route path="/supplier-profile" element={<SupplierProfile />} />
            </Route>

            <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
              <Route path="/products" element={<Products />} />
            </Route>
            <Route element={<PrivateRoute allowedRoles={['ADMIN', 'SUPPLIER']} />}>
              <Route path="/purchases" element={<Purchases />} />
            </Route>

            <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
              <Route path="/billing" element={<Billing />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/users" element={<Users />} />
              <Route path="/upi-payments" element={<PaymentVerification />} />
            </Route>
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};
