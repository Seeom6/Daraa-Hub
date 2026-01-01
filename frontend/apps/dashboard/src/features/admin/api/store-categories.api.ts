/**
 * Store Categories Module - API Service
 * Handles all API calls for store categories management
 */

import axios from 'axios';
import type {
  GetStoreCategoriesResponse,
  CreateStoreCategoryData,
  UpdateStoreCategoryData,
  StoreCategory,
} from '../types/stores.types';

// API Client with JWT cookie handling
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Store Categories API
// ============================================================================

/**
 * Get all store categories
 */
export async function getStoreCategories(): Promise<GetStoreCategoriesResponse> {
  try {
    const response = await apiClient.get<GetStoreCategoriesResponse>('/store-categories');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching store categories:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch store categories');
  }
}

/**
 * Get store category by ID
 */
export async function getStoreCategoryById(categoryId: string): Promise<any> {
  try {
    const response = await apiClient.get(`/store-categories/${categoryId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching store category:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch store category');
  }
}

/**
 * Create new store category
 */
export async function createStoreCategory(data: CreateStoreCategoryData): Promise<any> {
  try {
    const response = await apiClient.post('/store-categories', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating store category:', error);
    throw new Error(error.response?.data?.message || 'Failed to create store category');
  }
}

/**
 * Update store category
 */
export async function updateStoreCategory(
  categoryId: string,
  data: UpdateStoreCategoryData
): Promise<any> {
  try {
    const response = await apiClient.patch(`/store-categories/${categoryId}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating store category:', error);
    throw new Error(error.response?.data?.message || 'Failed to update store category');
  }
}

/**
 * Delete store category (soft delete)
 */
export async function deleteStoreCategory(categoryId: string): Promise<any> {
  try {
    const response = await apiClient.delete(`/store-categories/${categoryId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting store category:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete store category');
  }
}

/**
 * Restore deleted store category
 */
export async function restoreStoreCategory(categoryId: string): Promise<any> {
  try {
    const response = await apiClient.post(`/store-categories/${categoryId}/restore`);
    return response.data;
  } catch (error: any) {
    console.error('Error restoring store category:', error);
    throw new Error(error.response?.data?.message || 'Failed to restore store category');
  }
}

/**
 * Permanently delete store category
 */
export async function permanentlyDeleteStoreCategory(categoryId: string): Promise<any> {
  try {
    const response = await apiClient.delete(`/store-categories/${categoryId}/permanent`);
    return response.data;
  } catch (error: any) {
    console.error('Error permanently deleting store category:', error);
    throw new Error(error.response?.data?.message || 'Failed to permanently delete store category');
  }
}

/**
 * Get subcategories of a category
 */
export async function getSubcategories(categoryId: string): Promise<GetStoreCategoriesResponse> {
  try {
    const response = await apiClient.get<GetStoreCategoriesResponse>(
      `/store-categories/${categoryId}/subcategories`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching subcategories:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch subcategories');
  }
}

/**
 * Get category statistics
 */
export async function getCategoryStatistics(categoryId: string): Promise<any> {
  try {
    const response = await apiClient.get(`/store-categories/${categoryId}/statistics`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching category statistics:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch category statistics');
  }
}

