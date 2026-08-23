import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { ShieldAlert, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requireAuth = true 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAF3FA]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#0077CC] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAF3FA] p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="bg-white border-2 border-red-500">
            <Lock className="h-5 w-5" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription className="mt-2">
              You need to be logged in to access this page.
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button 
              onClick={() => window.location.href = '/#/login'}
              className="bg-[#0077CC] hover:bg-[#0066B3]"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAF3FA] p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="bg-white border-2 border-orange-500">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription className="mt-2">
              You don't have permission to access this page. This page is restricted to {allowedRoles.join(', ')} only.
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center space-x-4">
            <Button 
              onClick={() => window.location.href = '/#/dashboard'}
              className="bg-[#0077CC] hover:bg-[#0066B3]"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
