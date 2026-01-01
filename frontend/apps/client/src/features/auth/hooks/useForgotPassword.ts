/**
 * useForgotPassword Hook
 * 
 * Hook for forgot password functionality (3-step process)
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  forgotPassword,
  forgotPasswordVerifyOTP,
  resetPassword,
} from '../services/auth.service';
import toast from '@/lib/toast';
import type {
  ForgotPasswordRequest,
  ForgotPasswordVerifyOTPRequest,
  ResetPasswordRequest,
} from '../types/auth.types';

/**
 * Step 1: Send OTP
 */
export const useForgotPassword = () => {
  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordRequest) => forgotPassword(data),
    onSuccess: (response) => {
      toast.success(response.message || 'تم إرسال رمز التحقق');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'فشل إرسال رمز التحقق';
      toast.error(message);
    },
  });

  return {
    sendOTP: mutation.mutate,
    sendOTPAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
};

/**
 * Step 2: Verify OTP
 */
export const useForgotPasswordVerifyOTP = () => {
  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordVerifyOTPRequest) =>
      forgotPasswordVerifyOTP(data),
    onSuccess: (response) => {
      toast.success(response.message || 'تم التحقق بنجاح');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'رمز التحقق غير صحيح';
      toast.error(message);
    },
  });

  return {
    verify: mutation.mutate,
    verifyAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
};

/**
 * Step 3: Reset Password
 */
export const useResetPassword = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPassword(data),
    onSuccess: (response) => {
      toast.success(response.message || 'تم تغيير كلمة المرور بنجاح');
      
      // Redirect to login
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'فشل تغيير كلمة المرور';
      toast.error(message);
    },
  });

  return {
    reset: mutation.mutate,
    resetAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
  };
};

