/**
 * useLogout Hook
 * 
 * Hook for logout functionality
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { logout } from '../services/auth.service';
import { useAuth } from '@/contexts/AuthContext';
import toast from '@/lib/toast';

export const useLogout = () => {
  const router = useRouter();
  const { updateUser } = useAuth();

  const mutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      // Clear user from context
      updateUser(null);
      
      // Show success message
      toast.success('تم تسجيل الخروج بنجاح');
      
      // Redirect to login
      router.push('/auth/login');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'فشل تسجيل الخروج';
      toast.error(message);
    },
  });

  return {
    logout: mutation.mutate,
    logoutAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};

