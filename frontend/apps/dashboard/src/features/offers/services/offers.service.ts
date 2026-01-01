/**
 * Offers Service
 * API calls for offers management
 */

import { apiClient } from '@/lib/api-client';
import type {
  Offer,
  CreateOfferDto,
  UpdateOfferDto,
  OfferFilters,
  OfferAnalytics,
  ApiResponse,
  ApiListResponse,
} from '../types';

class OffersService {
  /**
   * Get all offers (public with filters)
   */
  async getAllOffers(filters?: OfferFilters): Promise<ApiListResponse<Offer>> {
    const response = await apiClient.get<ApiListResponse<Offer>>('/offers', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get all offers for current store
   */
  async getMyOffers(filters?: OfferFilters): Promise<ApiListResponse<Offer>> {
    const response = await apiClient.get<ApiListResponse<Offer>>('/offers/store/my', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get offer by ID
   * Note: This increments viewCount automatically
   */
  async getOffer(id: string): Promise<Offer> {
    const response = await apiClient.get<ApiResponse<Offer>>(`/offers/${id}`);
    return response.data.data;
  }

  /**
   * Get active offers for a store
   */
  async getActiveOffers(storeId: string): Promise<Offer[]> {
    const response = await apiClient.get<ApiResponse<Offer[]>>(
      `/offers/store/${storeId}/active`
    );
    return response.data.data;
  }

  /**
   * Get offers for a product
   */
  async getOffersForProduct(productId: string): Promise<Offer[]> {
    const response = await apiClient.get<ApiResponse<Offer[]>>(
      `/offers/product/${productId}`
    );
    return response.data.data;
  }

  /**
   * Create new offer
   */
  async createOffer(data: CreateOfferDto): Promise<Offer> {
    const response = await apiClient.post<ApiResponse<Offer>>('/offers/store', data);
    return response.data.data;
  }

  /**
   * Update offer
   */
  async updateOffer(id: string, data: UpdateOfferDto): Promise<Offer> {
    const response = await apiClient.put<ApiResponse<Offer>>(
      `/offers/store/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * Delete offer
   */
  async deleteOffer(id: string): Promise<void> {
    await apiClient.delete(`/offers/store/${id}`);
  }

  /**
   * Get offer analytics
   */
  async getOfferAnalytics(id: string): Promise<OfferAnalytics> {
    const response = await apiClient.get<ApiResponse<OfferAnalytics>>(
      `/offers/store/${id}/analytics`
    );
    return response.data.data;
  }

  /**
   * Toggle offer active status
   */
  async toggleOfferStatus(id: string, isActive: boolean): Promise<Offer> {
    return this.updateOffer(id, { isActive });
  }

  /**
   * Upload offer image
   */
  async uploadImage(offerId: string, file: File): Promise<{ url: string; offer: Offer }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<ApiResponse<{ url: string; offer: Offer }>>(
      `/offers/store/${offerId}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  }
}

export const offersService = new OffersService();

