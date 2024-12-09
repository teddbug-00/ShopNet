import { useEffect } from "react";

import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { AuthState } from '../../types/auth';
import { useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { token, user } = useAppSelector((state: { auth: AuthState }) => state.auth);
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }, []);
  
    if (isLoading) {
      return null;
    }
  
    console.log('Protected Route State:', { token, user, pathname: location.pathname });
  
    if (!token) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  
    // Redirect to account setup if user has 'unknown' accountType
    if (user && user.accountType === 'unknown' && location.pathname !== '/account-setup') {
      console.log('Redirecting to account setup - unknown account type');
      return <Navigate to="/account-setup" replace />;
    }
  
    return <>{children}</>;
  };