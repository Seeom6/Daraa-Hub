/**
 * Profile Hooks
 * React Query hooks for profile operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services';
import { toast } from 'react-hot-toast';

export const PROFILE_QUERY_KEY = ['profile'] as const;

/**
 * Hook to get profile
 * Uses TanStack Query for caching and automatic refetching
 */
export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => profileService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

/**
 * Hook to update profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { fullName?: string; email?: string }) => profileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      toast.success('تم تحديث الملف الشخصي بنجاح');
    },
    onError: () => {
      toast.error('فشل تحديث الملف الشخصي');
    },
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      profileService.changePassword(data),
    onSuccess: () => {
      toast.success('تم تغيير كلمة المرور بنجاح');
    },
    onError: () => {
      toast.error('فشل تغيير كلمة المرور');
    },
  });
}

/**
 * Hook to upload avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileService.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      toast.success('تم تحديث الصورة الشخصية بنجاح');
    },
    onError: () => {
      toast.error('فشل تحديث الصورة الشخصية');
    },
  });
}

