'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<'superadmin' | 'member'>;
  fallbackUrl?: string;
}

export default function RoleGuard({ 
  children, 
  allowedRoles,
  fallbackUrl = '/dashboard'
}: RoleGuardProps) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      // Check if user has one of the allowed roles
      const hasRequiredRole = allowedRoles.includes(currentUser.auth.role);
      
      if (!hasRequiredRole) {
        // Redirect to fallback URL after a short delay
        const timer = setTimeout(() => {
          router.push(fallbackUrl);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser, loading, allowedRoles, fallbackUrl, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No user logged in - this shouldn't happen as RoleGuard should be used with ProtectedRoute
  if (!currentUser) {
    router.push('/login');
    return null;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.includes(currentUser.auth.role);

  if (!hasRequiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>
              You don't have permission to access this area. This section is restricted to {allowedRoles.join(' or ')} users only.
            </p>
            <p className="text-sm text-muted-foreground">
              You will be redirected to the dashboard in a few seconds...
            </p>
            <Button 
              onClick={() => router.push(fallbackUrl)}
              variant="outline"
              size="sm"
            >
              Go to Dashboard Now
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}