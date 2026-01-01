'use client';

/**
 * Protected Route Component
 * 
 * Protects routes that require authentication
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/auth/login',
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Redirect if authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`${redirectTo}?returnUrl=${returnUrl}`);
      return;
    }

    // Check role-based access
    if (requireAuth && isAuthenticated && allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isLoading, isAuthenticated, requireAuth, user, allowedRoles, router, pathname, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return <PageLoader />;
  }

  // Don't render if not authenticated and auth is required
  if (requireAuth && !isAuthenticated) {
    return <PageLoader />;
  }

  // Don't render if role is not allowed
  if (requireAuth && isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <PageLoader />;
  }

  return <>{children}</>;
}

