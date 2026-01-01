import { apiClient } from '@/lib/api-client';
import type { Review, ReviewsResponse, CreateReviewInput } from '@/features/shared/types/review.types';

export const reviewsService = {
  /**
   * Get product reviews
   */
  getProductReviews: async (
    productId: string,
    filters?: { page?: number; limit?: number; sort?: string }
  ): Promise<ReviewsResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);

    const response = await apiClient.get(`/products/${productId}/reviews?${params.toString()}`);
    return response.data;
  },

  /**
   * Get store reviews
   */
  getStoreReviews: async (
    storeId: string,
    filters?: { page?: number; limit?: number; sort?: string }
  ): Promise<ReviewsResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);

    const response = await apiClient.get(`/stores/${storeId}/reviews?${params.toString()}`);
    return response.data;
  },

  /**
   * Get my reviews
   */
  getMyReviews: async (filters?: { page?: number; limit?: number }): Promise<ReviewsResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/reviews/my?${params.toString()}`);
    return response.data;
  },

  /**
   * Create review
   */
  createReview: async (data: CreateReviewInput): Promise<Review> => {
    const formData = new FormData();
    
    if (data.productId) formData.append('productId', data.productId);
    if (data.storeId) formData.append('storeId', data.storeId);
    formData.append('rating', data.rating.toString());
    formData.append('comment', data.comment);
    
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.post('/reviews', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update review
   */
  updateReview: async (id: string, data: Partial<CreateReviewInput>): Promise<Review> => {
    const formData = new FormData();
    
    if (data.rating) formData.append('rating', data.rating.toString());
    if (data.comment) formData.append('comment', data.comment);
    
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.put(`/reviews/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete review
   */
  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },

  /**
   * Mark review as helpful
   */
  markHelpful: async (id: string): Promise<void> => {
    await apiClient.post(`/reviews/${id}/helpful`);
  },

  /**
   * Report review
   */
  reportReview: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/reviews/${id}/report`, { reason });
  },
};

