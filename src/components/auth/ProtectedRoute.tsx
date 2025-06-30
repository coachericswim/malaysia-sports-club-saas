'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'superadmin' | 'member';
}

export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const { currentUser, firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // No user logged in
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      // User logged in but no user data (edge case)
      if (!currentUser) {
        console.error('User authenticated but no user data found');
        router.push('/login');
        return;
      }

      // Role-based access control
      if (requiredRole && currentUser.auth.role !== requiredRole) {
        // If user doesn't have required role, redirect to dashboard
        router.push('/dashboard');
        return;
      }
    }
  }, [currentUser, firebaseUser, loading, requiredRole, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render children until we've confirmed authentication
  if (!firebaseUser || !currentUser) {
    return null;
  }

  // Check role if required
  if (requiredRole && currentUser.auth.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}