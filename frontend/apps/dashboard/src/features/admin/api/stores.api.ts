/**
 * Stores Module - API Service
 * Handles all API calls for stores management
 */

import axios from 'axios';
import type {
  GetStoresParams,
  GetStoresResponse,
  GetStoreResponse,
} from '../types/stores.types';

// API Client with JWT cookie handling
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true, // Important for JWT cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Stores API
// ============================================================================

/**
 * Get all stores with filters and pagination
 * Uses admin endpoint /admin/stores (includes all stores regardless of status)
 */
export async function getStores(params?: GetStoresParams): Promise<GetStoresResponse> {
  try {
    // Map params to match backend /admin/stores endpoint
    const queryParams: any = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.search) queryParams.search = params.search;
    if (params?.category) queryParams.category = params.category;
    if (params?.sortBy) queryParams.sort = params.sortBy; // Backend uses 'sort' not 'sortBy'
    if (params?.status) queryParams.status = params.status;
    if (params?.verificationStatus) queryParams.verificationStatus = params.verificationStatus;

    const response = await apiClient.get<GetStoresResponse>('/admin/stores', { params: queryParams });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching stores:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch stores');
  }
}

/**
 * Get store by ID
 * Uses admin endpoint /admin/stores/:id
 */
export async function getStoreById(storeId: string): Promise<GetStoreResponse> {
  try {
    const response = await apiClient.get<GetStoreResponse>(`/admin/stores/${storeId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching store:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch store');
  }
}

// TODO: Backend endpoints for store management don't exist yet
// These endpoints need to be created in the backend first

/**
 * Suspend store
 * TODO: Backend endpoint /admin/stores/:id/suspend doesn't exist
 */
export async function suspendStore(storeId: string, data: { reason: string }): Promise<any> {
  try {
    // const response = await apiClient.patch(`/admin/stores/${storeId}/suspend`, data);
    // return response.data;
    throw new Error('Suspend store endpoint not implemented in backend yet');
  } catch (error: any) {
    console.error('Error suspending store:', error);
    throw new Error(error.response?.data?.message || 'Failed to suspend store');
  }
}

/**
 * Unsuspend store
 * TODO: Backend endpoint /admin/stores/:id/unsuspend doesn't exist
 */
export async function unsuspendStore(storeId: string, data: { reason: string }): Promise<any> {
  try {
    // const response = await apiClient.patch(`/admin/stores/${storeId}/unsuspend`, data);
    // return response.data;
    throw new Error('Unsuspend store endpoint not implemented in backend yet');
  } catch (error: any) {
    console.error('Error unsuspending store:', error);
    throw new Error(error.response?.data?.message || 'Failed to unsuspend store');
  }
}

/**
 * Delete store (soft delete)
 * TODO: Backend endpoint /admin/stores/:id doesn't exist
 */
export async function deleteStore(storeId: string): Promise<any> {
  try {
    // const response = await apiClient.delete(`/admin/stores/${storeId}`);
    // return response.data;
    throw new Error('Delete store endpoint not implemented in backend yet');
  } catch (error: any) {
    console.error('Error deleting store:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete store');
  }
}

/**
 * Get store statistics
 * TODO: Backend endpoint /admin/stores/statistics doesn't exist
 */
export async function getStoreStatistics(): Promise<any> {
  try {
    // const response = await apiClient.get('/admin/stores/statistics');
    // return response.data;

    // Fallback: Calculate from stores list
    const stores = await getStores({ page: 1, limit: 1000 });
    return {
      success: true,
      data: {
        totalStores: stores.total || 0,
        activeStores: stores.total || 0,
        inactiveStores: 0,
        suspendedStores: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalOrders: 0,
        averageRating: 0,
      },
    };
  } catch (error: any) {
    console.error('Error fetching store statistics:', error);
    // Fallback data
    return {
      success: true,
      data: {
        totalStores: 0,
        activeStores: 0,
        inactiveStores: 0,
        suspendedStores: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalOrders: 0,
        averageRating: 0,
      },
    };
  }
}

/**
 * Export stores data
 * TODO: Backend endpoint /admin/stores/export doesn't exist
 */
export async function exportStoresData(params?: GetStoresParams): Promise<Blob> {
  try {
    // const response = await apiClient.get('/admin/stores/export', {
    //   params,
    //   responseType: 'blob',
    // });
    // return response.data;
    throw new Error('Export stores endpoint not implemented in backend yet');
  } catch (error: any) {
    console.error('Error exporting stores data:', error);
    throw new Error(error.response?.data?.message || 'Failed to export stores data');
  }
}

/**
 * Search stores
 */
export async function searchStores(query: string): Promise<GetStoresResponse> {
  try {
    const response = await apiClient.get<GetStoresResponse>('/admin/stores/search', {
      params: { q: query },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error searching stores:', error);
    throw new Error(error.response?.data?.message || 'Failed to search stores');
  }
}

