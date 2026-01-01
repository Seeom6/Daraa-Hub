import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { notificationsService } from '../services/notifications.service';
import type { NotificationFilters } from '../types/notifications.types';

const NOTIFICATIONS_QUERY_KEY = ['notifications'];
const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count'];

/**
 * Get notifications
 */
export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, filters],
    queryFn: () => notificationsService.getNotifications(filters),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get unread count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: () => notificationsService.getUnreadCount(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Mark notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    },
    onError: () => {
      toast.error('فشل تحديد الإشعارات كمقروءة');
    },
  });
}

/**
 * Delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
      toast.success('تم حذف الإشعار');
    },
    onError: () => {
      toast.error('فشل حذف الإشعار');
    },
  });
}

/**
 * Get notification settings
 */
export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notifications', 'settings'],
    queryFn: () => notificationsService.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Update notification settings
 */
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'settings'] });
      toast.success('تم تحديث إعدادات الإشعارات');
    },
    onError: () => {
      toast.error('فشل تحديث إعدادات الإشعارات');
    },
  });
}

