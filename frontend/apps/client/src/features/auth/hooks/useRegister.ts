/**
 * useRegister Hook
 * 
 * Hook for registration functionality (3-step process)
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  registerStep1,
  verifyOTP,
  completeProfile,
} from '../services/auth.service';
import { useAuth } from '@/contexts/AuthContext';
import toast from '@/lib/toast';
import type {
  RegisterStep1Request,
  VerifyOTPRequest,
  CompleteProfileRequest,
} from '../types/auth.types';

/**
 * Step 1: Send OTP
 */
export const useRegisterStep1 = () => {
  const mutation = useMutation({
    mutationFn: (data: RegisterStep1Request) => registerStep1(data),
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
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
};

/**
 * Step 2: Verify OTP
 */
export const useVerifyOTP = () => {
  const mutation = useMutation({
    mutationFn: (data: VerifyOTPRequest) => verifyOTP(data),
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
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
};

/**
 * Step 3: Complete Profile
 */
export const useCompleteProfile = () => {
  const router = useRouter();
  const { updateUser } = useAuth();

  const mutation = useMutation({
    mutationFn: (data: CompleteProfileRequest) => completeProfile(data),
    onSuccess: (response) => {
      // Update user in context
      updateUser(response.user);
      
      // Show success message
      toast.success(response.message || 'تم إنشاء الحساب بنجاح');
      
      // Redirect to home
      router.push('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'فشل إنشاء الحساب';
      toast.error(message);
    },
  });

  return {
    complete: mutation.mutate,
    completeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
  };
};

