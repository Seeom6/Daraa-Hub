/**
 * useSettings Hook
 * React Query hook for store settings management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { settingsService } from '../services';
import type { StoreSettingsFormData } from '../types';

export function useSettings() {
  const queryClient = useQueryClient();

  // Get settings
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['store-settings'],
    queryFn: () => settingsService.getSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update settings
  const updateMutation = useMutation({
    mutationFn: (data: Partial<StoreSettingsFormData>) => settingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast.success('تم تحديث الإعدادات بنجاح');
    },
    onError: () => {
      toast.error('فشل تحديث الإعدادات');
    },
  });

  // Toggle maintenance mode
  const toggleMaintenanceMutation = useMutation({
    mutationFn: ({ enabled, message }: { enabled: boolean; message?: string }) =>
      settingsService.toggleMaintenanceMode(enabled, message),
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast.success(enabled ? 'تم تفعيل وضع الصيانة' : 'تم إيقاف وضع الصيانة');
    },
    onError: () => {
      toast.error('فشل تغيير وضع الصيانة');
    },
  });

  return {
    settings,
    isLoading,
    error,
    refetch,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    toggleMaintenance: toggleMaintenanceMutation.mutate,
  };
}

