import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredPermission, children }) => {
  const { permissions } = useAuth(); 

  const hasAccess = permissions.includes('Access:All') || permissions.includes(requiredPermission);

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;