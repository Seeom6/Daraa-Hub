/**
 * Users API Service
 * Handles all API calls related to user management
 */

import axios from 'axios';
import type {
  GetUsersParams,
  GetUsersResponse,
  SearchUsersParams,
  SearchUsersResponse,
  GetUserResponse,
  SuspendUserRequest,
  SuspendUserResponse,
  UnsuspendUserRequest,
  UnsuspendUserResponse,
  BanUserRequest,
  BanUserResponse,
} from '../types/user.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For JWT cookies
});

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    // Token will be sent via HTTP-only cookies
    // No need to manually add Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get list of users with filters and pagination
 * GET /admin/users
 */
export const getUsers = async (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
  const { data } = await apiClient.get<GetUsersResponse>('/admin/users', { params });
  return data;
};

/**
 * Search users by name, phone, or email
 * GET /admin/users/search
 */
export const searchUsers = async (params: SearchUsersParams): Promise<SearchUsersResponse> => {
  const { data } = await apiClient.get<SearchUsersResponse>('/admin/users/search', { params });
  return data;
};

/**
 * Get user details by ID
 * GET /admin/users/:id
 */
export const getUserById = async (id: string): Promise<GetUserResponse> => {
  const { data } = await apiClient.get<GetUserResponse>(`/admin/users/${id}`);
  return data;
};

/**
 * Suspend user account
 * PATCH /admin/users/:id/suspend
 */
export const suspendUser = async (
  id: string,
  payload: SuspendUserRequest
): Promise<SuspendUserResponse> => {
  const { data } = await apiClient.patch<SuspendUserResponse>(
    `/admin/users/${id}/suspend`,
    payload
  );
  return data;
};

/**
 * Unsuspend user account
 * PATCH /admin/users/:id/unsuspend
 */
export const unsuspendUser = async (
  id: string,
  payload: UnsuspendUserRequest
): Promise<UnsuspendUserResponse> => {
  const { data } = await apiClient.patch<UnsuspendUserResponse>(
    `/admin/users/${id}/unsuspend`,
    payload
  );
  return data;
};

/**
 * Ban user permanently
 * PATCH /admin/users/:id/ban
 */
export const banUser = async (
  id: string,
  payload: BanUserRequest
): Promise<BanUserResponse> => {
  const { data } = await apiClient.patch<BanUserResponse>(`/admin/users/${id}/ban`, payload);
  return data;
};

// ============================================================================
// Bulk Operations (if needed in future)
// ============================================================================

/**
 * Bulk suspend users
 */
export const bulkSuspendUsers = async (
  userIds: string[],
  payload: SuspendUserRequest
): Promise<void> => {
  // TODO: Implement when backend supports bulk operations
  await Promise.all(userIds.map((id) => suspendUser(id, payload)));
};

/**
 * Export users data
 */
export const exportUsers = async (params: GetUsersParams = {}): Promise<Blob> => {
  const { data } = await apiClient.get('/admin/users/export', {
    params,
    responseType: 'blob',
  });
  return data;
};

export default {
  getUsers,
  searchUsers,
  getUserById,
  suspendUser,
  unsuspendUser,
  banUser,
  bulkSuspendUsers,
  exportUsers,
};

