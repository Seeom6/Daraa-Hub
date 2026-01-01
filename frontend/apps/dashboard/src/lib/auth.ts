/**
 * Authentication Utilities
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface AdminProfile {
  _id: string;
  accountId: string;
  permissions: Record<string, any>;
  role: 'super_admin' | 'admin' | 'moderator' | 'support';
  department?: string;
  isActive: boolean;
}

/**
 * Check if user is authenticated and is admin
 */
export async function checkAdminAuth(): Promise<{ isAuthenticated: boolean; profile?: AdminProfile }> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/me`, {
      withCredentials: true,
    });

    if (response.data.success) {
      return {
        isAuthenticated: true,
        profile: response.data.data,
      };
    }

    return { isAuthenticated: false };
  } catch (error) {
    return { isAuthenticated: false };
  }
}

/**
 * Logout admin
 */
export async function logoutAdmin(): Promise<void> {
  try {
    await axios.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
  }
}

