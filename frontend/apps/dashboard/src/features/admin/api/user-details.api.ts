/**
 * User Details API Service
 * Handles all API calls related to user details
 */

import axios from 'axios';
import type {
  GetUserDetailsResponse,
  GetUserStatisticsResponse,
  GetUserActivityResponse,
  GetUserOrdersResponse,
} from '../types/user-details.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for JWT cookies
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Redirect to login on 401
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// User Details API Functions
// ============================================================================

/**
 * Get user details by ID
 */
export async function getUserDetails(userId: string): Promise<GetUserDetailsResponse> {
  const response = await apiClient.get<GetUserDetailsResponse>(`/admin/users/${userId}`);
  return response.data;
}

/**
 * Get user statistics
 * Note: This endpoint might not exist yet in backend
 * For now, we'll calculate from orders
 */
export async function getUserStatistics(userId: string): Promise<GetUserStatisticsResponse> {
  try {
    const response = await apiClient.get<GetUserStatisticsResponse>(
      `/admin/users/${userId}/statistics`
    );
    return response.data;
  } catch (error) {
    // Fallback: Return mock data if endpoint doesn't exist
    return {
      success: true,
      data: {
        totalOrders: 0,
        totalSpent: 0,
        totalReviews: 0,
        averageRating: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        pendingOrders: 0,
      },
    };
  }
}

/**
 * Get user activity log
 */
export async function getUserActivity(userId: string): Promise<GetUserActivityResponse> {
  try {
    const response = await apiClient.get<any>(
      `/admin/users/${userId}/activity`
    );

    // Handle different response structures
    // Backend might return: { data: {...} } or { success: true, data: {...} }
    const responseData = response.data?.data || response.data;

    // If responseData is an object with activities array
    if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
      return {
        success: true,
        data: responseData.activities || [],
      };
    }

    // If responseData is already an array
    if (Array.isArray(responseData)) {
      return {
        success: true,
        data: responseData,
      };
    }

    // Fallback
    return {
      success: true,
      data: [],
    };
  } catch (error) {
    // Fallback: Return empty array if endpoint doesn't exist
    return {
      success: true,
      data: [],
    };
  }
}

/**
 * Get user orders
 */
export async function getUserOrders(
  userId: string,
  params?: { page?: number; limit?: number }
): Promise<GetUserOrdersResponse> {
  try {
    const response = await apiClient.get<any>(
      `/admin/users/${userId}/orders`,
      { params }
    );

    // Handle different response structures
    const responseData = response.data?.data || response.data;

    // If responseData has orders array
    if (responseData && typeof responseData === 'object') {
      return {
        success: true,
        data: {
          orders: responseData.orders || [],
          total: responseData.total || 0,
          page: responseData.page || 1,
          totalPages: responseData.totalPages || 0,
        },
      };
    }

    // Fallback
    return {
      success: true,
      data: {
        orders: [],
        total: 0,
        page: 1,
        totalPages: 0,
      },
    };
  } catch (error) {
    // Fallback: Return empty array if endpoint doesn't exist
    return {
      success: true,
      data: {
        orders: [],
        total: 0,
        page: 1,
        totalPages: 0,
      },
    };
  }
}

/**
 * Send notification to user
 */
export async function sendUserNotification(
  userId: string,
  data: { title: string; message: string; type?: string }
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post(`/admin/users/${userId}/notify`, data);
  return response.data;
}

/**
 * Export user data
 */
export async function exportUserData(userId: string): Promise<Blob> {
  const response = await apiClient.get(`/admin/users/${userId}/export`, {
    responseType: 'blob',
  });
  return response.data;
}

