/**
 * useAuth Hook
 * React Query hook for authentication
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authService, type LoginDto, type AuthUser } from '../services/auth.service';
import { storeOwnerService } from '../services';
import { useAuthStore } from '../stores';
import { saveAuthData } from '@daraa/state';

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setStoreId } = useAuthStore();

  // Get current user
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authService.getProfile(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: async (user) => {
      queryClient.setQueryData(['auth', 'user'], user);

      // Save auth data to localStorage for cross-app sharing
      saveAuthData({
        userId: (user as any).id || (user as any)._id,
        role: (user as any).role,
        phone: (user as any).phone,
        fullName: (user as any).fullName,
        email: (user as any).email,
      });

      // Fetch store profile to get storeId
      try {
        const profile = await storeOwnerService.getProfile();
        if (profile._id) {
          setStoreId(profile._id);
          // Update localStorage with storeId
          saveAuthData({
            userId: (user as any).id || (user as any)._id,
            role: (user as any).role,
            phone: (user as any).phone,
            fullName: (user as any).fullName,
            email: (user as any).email,
            storeId: profile._id,
          });
        }
      } catch (error) {
        console.error('Failed to fetch store profile:', error);
      }

      toast.success('تم تسجيل الدخول بنجاح');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'فشل تسجيل الدخول';
      toast.error(message);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
      setStoreId(null);

      // Clear localStorage auth data
      if (typeof window !== 'undefined') {
        // Dynamic import to avoid require
        import('@daraa/state').then(({ clearAuthData }) => {
          clearAuthData();
        });
      }

      toast.success('تم تسجيل الخروج بنجاح');
      router.push('/auth/login');
    },
    onError: () => {
      toast.error('فشل تسجيل الخروج');
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

