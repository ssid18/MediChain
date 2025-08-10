import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const authContext = useContext(AuthContext);

  if (!authContext?.user) {
    // Not logged in, redirect to auth page
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(authContext.user.role)) {
    // Logged in but not authorized for this route, redirect to their dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Authorized, render the component
  return <>{children}</>;
};

export default ProtectedRoute;
