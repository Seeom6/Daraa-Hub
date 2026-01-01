/**
 * useLogin Hook
 * 
 * Hook for login functionality
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login, getCurrentUser } from '../services/auth.service';
import toast from '@/lib/toast';
import type { LoginRequest } from '../types/auth.types';
import { saveAuthData } from '@daraa/state';

export const useLogin = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: async (response) => {
      // Show success message
      toast.success(response.message || 'تم تسجيل الدخول بنجاح');

      try {
        // Get full user profile from backend
        const user = await getCurrentUser();

        // Save auth data to localStorage for cross-app sharing
        saveAuthData({
          userId: user.id,
          role: user.role,
          phone: user.phone,
          fullName: user.fullName,
          email: user.email,
        });

        // Redirect based on role
        const role = response.data.role;
        if (role === 'admin') {
          // Redirect to admin dashboard
          window.location.href = 'http://localhost:3002/admin'; // Admin Dashboard (separate app)
        } else if (role === 'store_owner') {
          // Redirect to store owner dashboard
          window.location.href = 'http://localhost:3002/dashboard'; // Store Dashboard App
        } else if (role === 'courier') {
          // Redirect to courier dashboard
          window.location.href = 'http://localhost:3002/dashboard'; // Courier Dashboard
        } else {
          // Regular customer - stay in client app
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to get user profile:', error);
        // Still redirect even if profile fetch fails
        const role = response.data.role;
        if (role === 'store_owner') {
          window.location.href = 'http://localhost:3002/dashboard';
        } else {
          router.push('/');
        }
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'فشل تسجيل الدخول';
      toast.error(message);
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

