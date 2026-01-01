/**
 * User Details React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getUserDetails,
  getUserStatistics,
  getUserActivity,
  getUserOrders,
  sendUserNotification,
  exportUserData,
} from '../api/user-details.api';
import { useSuspendUser, useUnsuspendUser, useBanUser } from './useUsers';

// ============================================================================
// Query Keys
// ============================================================================

export const userDetailsKeys = {
  all: ['user-details'] as const,
  details: (id: string) => [...userDetailsKeys.all, 'detail', id] as const,
  statistics: (id: string) => [...userDetailsKeys.all, 'statistics', id] as const,
  activity: (id: string) => [...userDetailsKeys.all, 'activity', id] as const,
  orders: (id: string, page: number) => [...userDetailsKeys.all, 'orders', id, page] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get user details
 */
export function useUserDetails(userId: string) {
  return useQuery({
    queryKey: userDetailsKeys.details(userId),
    queryFn: () => getUserDetails(userId),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    enabled: !!userId,
  });
}

/**
 * Get user statistics
 */
export function useUserStatistics(userId: string) {
  return useQuery({
    queryKey: userDetailsKeys.statistics(userId),
    queryFn: () => getUserStatistics(userId),
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    enabled: !!userId,
  });
}

/**
 * Get user activity
 */
export function useUserActivity(userId: string) {
  return useQuery({
    queryKey: userDetailsKeys.activity(userId),
    queryFn: () => getUserActivity(userId),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    enabled: !!userId,
  });
}

/**
 * Get user orders
 */
export function useUserOrders(userId: string, page: number = 1) {
  return useQuery({
    queryKey: userDetailsKeys.orders(userId, page),
    queryFn: () => getUserOrders(userId, { page, limit: 10 }),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    enabled: !!userId,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Send notification to user
 */
export function useSendUserNotification(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; message: string; type?: string }) =>
      sendUserNotification(userId, data),
    onSuccess: () => {
      toast.success('تم إرسال الإشعار بنجاح');
      // Invalidate activity to show the notification in activity log
      queryClient.invalidateQueries({ queryKey: userDetailsKeys.activity(userId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل إرسال الإشعار');
    },
  });
}

/**
 * Export user data
 */
export function useExportUserData(userId: string) {
  return useMutation({
    mutationFn: () => exportUserData(userId),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-${userId}-data.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تصدير البيانات بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل تصدير البيانات');
    },
  });
}

// ============================================================================
// Re-export user action hooks for convenience
// ============================================================================

export { useSuspendUser, useUnsuspendUser, useBanUser };

