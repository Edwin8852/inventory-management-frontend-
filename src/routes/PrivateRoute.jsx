import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  // Optional: We can add a global loading spinner here if AuthContext starts loading initially
  
  if (!isAuthenticated) {
    // Redirect unauthenticated users to the login page, and replace the history stack
    return <Navigate to="/login" replace />;
  }

  // Check roles if allowedRoles is provided
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Allow authenticated users to pass through to children or an Outlet
  return children ? children : <Outlet />;
};

export default PrivateRoute;
