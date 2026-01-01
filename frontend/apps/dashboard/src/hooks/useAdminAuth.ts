/**
 * Admin Authentication Hook
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { checkAdminAuth, type AdminProfile } from '@/lib/auth';

export function useAdminAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      // Skip auth check for login page
      if (pathname === '/admin/login') {
        setIsLoading(false);
        return;
      }

      const result = await checkAdminAuth();

      if (result.isAuthenticated && result.profile) {
        setIsAuthenticated(true);
        setProfile(result.profile);
        setIsLoading(false);
      } else {
        // Redirect to login if not authenticated
        router.push('/admin/login');
      }
    };

    verifyAuth();
  }, [pathname, router]);

  return {
    isLoading,
    isAuthenticated,
    profile,
  };
}

