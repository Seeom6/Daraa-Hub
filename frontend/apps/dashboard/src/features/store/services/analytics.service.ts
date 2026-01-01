/**
 * Analytics Service
 * API service for analytics and dashboard metrics
 */

import apiClient from '@/lib/api-client';
import type {
  DashboardMetrics,
  DashboardResponse,
  StoreAnalytics,
  ApiResponse,
  AnalyticsQuery,
} from '../types';

class AnalyticsService {
  private readonly baseUrl = '/analytics';

  /**
   * Get store analytics
   * @param storeId - Store ID
   */
  async getStoreAnalytics(storeId: string): Promise<StoreAnalytics> {
    const response = await apiClient.get<ApiResponse<StoreAnalytics>>(
      `${this.baseUrl}/store/${storeId}`
    );
    return response.data.data!;
  }

  /**
   * Get products performance
   * @param storeId - Store ID
   */
  async getProductsPerformance(storeId: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(
      `${this.baseUrl}/products`,
      {
        params: { storeId },
      }
    );
    return response.data.data!;
  }

  /**
   * Get sales report
   */
  async getSalesReport(startDate: string, endDate: string): Promise<any> {
    const response = await apiClient.get<ApiResponse>(`${this.baseUrl}/sales-report`, {
      params: { startDate, endDate },
    });
    return response.data.data!;
  }

  /**
   * Get top products
   */
  async getTopProducts(limit: number = 10): Promise<any[]> {
    const response = await apiClient.get<ApiResponse>(`${this.baseUrl}/top-products`, {
      params: { limit },
    });
    return response.data.data!;
  }

  /**
   * Get revenue by period
   */
  async getRevenueByPeriod(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<any[]> {
    const response = await apiClient.get<ApiResponse>(`${this.baseUrl}/revenue`, {
      params: { period },
    });
    return response.data.data!;
  }

  /**
   * Export analytics data
   */
  async exportData(format: 'csv' | 'excel', query?: AnalyticsQuery): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/export`, {
      params: { ...query, format },
      responseType: 'blob',
    });
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();

