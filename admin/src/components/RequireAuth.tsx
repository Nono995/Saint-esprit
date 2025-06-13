import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const auth = getAuth();
  const location = useLocation();

  if (!auth.currentUser) {
    // Redirect to the login page, but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}