/**
 * Profile Service
 * API service for profile operations
 */

import { apiClient } from '@/lib/api-client';
import type { ProfileData } from '../types';

const ACCOUNT_BASE_URL = '/account';

export const profileService = {
  /**
   * Get current user profile
   * GET /account/profile
   */
  getProfile: async (): Promise<ProfileData> => {
    const response = await apiClient.get<ProfileData>(`${ACCOUNT_BASE_URL}/profile`);
    return response.data;
  },

  /**
   * Update profile
   * PATCH /account/profile
   */
  updateProfile: async (data: { fullName?: string; email?: string }): Promise<ProfileData> => {
    const response = await apiClient.patch<ProfileData>(`${ACCOUNT_BASE_URL}/profile`, data);
    return response.data;
  },

  /**
   * Change password
   * POST /account/change-password
   */
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`${ACCOUNT_BASE_URL}/change-password`, data);
    return response.data;
  },

  /**
   * Upload avatar
   * POST /account/avatar
   */
  uploadAvatar: async (file: File): Promise<ProfileData> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<ProfileData>(
      `${ACCOUNT_BASE_URL}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

