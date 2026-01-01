import { apiClient } from '@/lib/api-client';
import type {
  Notification,
  NotificationsResponse,
  NotificationFilters,
  NotificationSettings,
} from '../types/notifications.types';

export const notificationsService = {
  /**
   * Get notifications
   */
  getNotifications: async (filters?: NotificationFilters): Promise<NotificationsResponse> => {
    const response = await apiClient.get('/notifications', { params: filters });
    return response.data;
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.count;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  /**
   * Get notification settings
   */
  getSettings: async (): Promise<NotificationSettings> => {
    const response = await apiClient.get('/notifications/settings');
    return response.data;
  },

  /**
   * Update notification settings
   */
  updateSettings: async (settings: NotificationSettings): Promise<NotificationSettings> => {
    const response = await apiClient.put('/notifications/settings', settings);
    return response.data;
  },
};

