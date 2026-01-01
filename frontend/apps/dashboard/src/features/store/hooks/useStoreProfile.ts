/**
 * useStoreProfile Hook
 * React Query hook for store profile management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { storeOwnerService } from '../services';
import { useProfileStore } from '../stores';
import type { UpdateStoreProfileDto } from '../types';

export function useStoreProfile() {
  const queryClient = useQueryClient();
  const { setProfile, updateProfile: updateProfileStore } = useProfileStore();

  // Get profile
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['store-profile'],
    queryFn: async () => {
      const profile = await storeOwnerService.getProfile();
      return profile;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateStoreProfileDto) => storeOwnerService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['store-profile'], updatedProfile);
      toast.success('تم تحديث الملف الشخصي بنجاح');
    },
    onError: () => {
      toast.error('فشل تحديث الملف الشخصي');
    },
  });

  // Upload logo
  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => storeOwnerService.uploadLogo(file),
    onSuccess: (url) => {
      updateProfileMutation.mutate({ storeLogo: url });
    },
    onError: () => {
      toast.error('فشل رفع الشعار');
    },
  });

  // Upload banner
  const uploadBannerMutation = useMutation({
    mutationFn: (file: File) => storeOwnerService.uploadBanner(file),
    onSuccess: (url) => {
      updateProfileMutation.mutate({ storeBanner: url });
    },
    onError: () => {
      toast.error('فشل رفع الغلاف');
    },
  });

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    uploadLogo: uploadLogoMutation.mutate,
    isUploadingLogo: uploadLogoMutation.isPending,
    uploadBanner: uploadBannerMutation.mutate,
    isUploadingBanner: uploadBannerMutation.isPending,
  };
}

