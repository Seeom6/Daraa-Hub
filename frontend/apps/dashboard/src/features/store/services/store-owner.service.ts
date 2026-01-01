/**
 * Store Owner Service
 * API service for store owner profile and verification
 */

import apiClient, { uploadFile } from '@/lib/api-client';
import type {
  StoreProfileResponse,
  VerificationResponse,
  ApiResponse,
  SubmitVerificationDto,
  UpdateStoreProfileDto,
  VerificationRequest,
  StoreOwnerProfile,
  Account,
  DocumentType,
} from '../types';

class StoreOwnerService {
  private readonly baseUrl = '/account';

  /**
   * Get store owner profile (current user)
   */
  async getProfile(): Promise<StoreOwnerProfile> {
    const response = await apiClient.get<ApiResponse<StoreOwnerProfile>>(`${this.baseUrl}/store-profile`);
    return response.data.data!;
  }

  /**
   * Get store profile by ID
   * Used when navigating from client app with storeId
   */
  async getProfileById(storeId: string): Promise<StoreOwnerProfile> {
    const response = await apiClient.get<ApiResponse<StoreOwnerProfile>>(`${this.baseUrl}/store/${storeId}`);
    return response.data.data!;
  }

  /**
   * Update store profile
   */
  async updateProfile(data: UpdateStoreProfileDto): Promise<StoreOwnerProfile> {
    const response = await apiClient.put<ApiResponse<StoreOwnerProfile>>(
      `${this.baseUrl}/store-profile`,
      data
    );
    return response.data.data!;
  }

  /**
   * Upload store logo
   */
  async uploadLogo(file: File): Promise<string> {
    return uploadFile(file, `${this.baseUrl}/store-profile/logo`);
  }

  /**
   * Upload store banner
   */
  async uploadBanner(file: File): Promise<string> {
    return uploadFile(file, `${this.baseUrl}/store-profile/banner`);
  }

  /**
   * Submit verification request
   */
  async submitVerification(data: SubmitVerificationDto): Promise<VerificationRequest> {
    const response = await apiClient.post<VerificationResponse>(
      '/verification/submit',
      data
    );
    return response.data.data!;
  }

  /**
   * Get verification status
   */
  async getVerificationStatus(): Promise<VerificationRequest | null> {
    try {
      const response = await apiClient.get<VerificationResponse>('/verification/status');
      return response.data.data!;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export const storeOwnerService = new StoreOwnerService();

