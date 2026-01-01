/**
 * Vendor Service
 * API calls for vendor/store owner operations
 */

import { apiClient } from '@/lib/api-client';
import type {
  BecomeVendorRequest,
  BecomeVendorResponse,
  StoreCategoriesResponse,
  StoreCategory,
  VerificationStatus,
} from '../types/vendor.types';

/**
 * Get all store categories
 */
export const getStoreCategories = async (): Promise<StoreCategory[]> => {
  const { data } = await apiClient.get<StoreCategoriesResponse>('/store-categories');
  return data.data;
};

/**
 * Get root store categories (main categories only)
 */
export const getRootStoreCategories = async (): Promise<StoreCategory[]> => {
  const { data } = await apiClient.get<StoreCategoriesResponse>('/store-categories/root');
  return data.data;
};

/**
 * Submit vendor application
 */
export const submitVendorApplication = async (
  request: BecomeVendorRequest
): Promise<BecomeVendorResponse> => {
  const { data } = await apiClient.post<BecomeVendorResponse>(
    '/verification/submit',
    request
  );
  return data;
};

/**
 * Get my verification status
 */
export const getMyVerificationStatus = async (): Promise<VerificationStatus | null> => {
  const { data } = await apiClient.get<{ success: boolean; data: VerificationStatus | null }>(
    '/verification/my-status'
  );
  return data.data;
};

/**
 * Update account role to store_owner
 * This should be called after successful verification
 */
export const upgradeToStoreOwner = async (): Promise<void> => {
  await apiClient.post('/account/upgrade-to-store-owner');
};

/**
 * Upload a single file (image or PDF)
 */
export const uploadFile = async (file: File, type: 'image' | 'pdf'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const endpoint = type === 'image' ? '/upload/image' : '/upload/document';
  const { data } = await apiClient.post<{ success: boolean; data: { url: string } }>(
    endpoint,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return data.data.url;
};

/**
 * Upload multiple images (optimized - single request)
 */
export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();

  // Append all files to FormData
  files.forEach((file) => {
    formData.append('files', file);
  });

  const { data } = await apiClient.post<{ success: boolean; data: { urls: string[] } }>(
    '/upload/images',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return data.data.urls;
};

/**
 * Upload multiple files (generic - one by one)
 */
export const uploadMultipleFiles = async (
  files: File[],
  type: 'image' | 'pdf'
): Promise<string[]> => {
  // For images, use optimized batch upload
  if (type === 'image') {
    return uploadMultipleImages(files);
  }

  // For PDFs, upload one by one
  const uploadPromises = files.map((file) => uploadFile(file, type));
  return Promise.all(uploadPromises);
};

