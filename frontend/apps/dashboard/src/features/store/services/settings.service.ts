/**
 * Settings Service
 * API service for store settings
 */

import apiClient from '@/lib/api-client';
import type { StoreSettings, ApiResponse, StoreSettingsFormData } from '../types';

class SettingsService {
  private readonly baseUrl = '/store-settings';

  /**
   * Get store settings
   */
  async getSettings(): Promise<StoreSettings> {
    const response = await apiClient.get<ApiResponse<StoreSettings>>(this.baseUrl);
    return response.data.data!;
  }

  /**
   * Update store settings
   */
  async updateSettings(data: Partial<StoreSettingsFormData>): Promise<StoreSettings> {
    const response = await apiClient.patch<ApiResponse<StoreSettings>>(this.baseUrl, data);
    return response.data.data!;
  }

  /**
   * Update business hours
   */
  async updateBusinessHours(businessHours: any[]): Promise<StoreSettings> {
    const response = await apiClient.patch<ApiResponse<StoreSettings>>(
      `${this.baseUrl}/business-hours`,
      { businessHours }
    );
    return response.data.data!;
  }

  /**
   * Update shipping zones
   */
  async updateShippingZones(shippingZones: any[]): Promise<StoreSettings> {
    const response = await apiClient.patch<ApiResponse<StoreSettings>>(
      `${this.baseUrl}/shipping-zones`,
      { shippingZones }
    );
    return response.data.data!;
  }

  /**
   * Update payment methods
   */
  async updatePaymentMethods(paymentMethods: any[]): Promise<StoreSettings> {
    const response = await apiClient.patch<ApiResponse<StoreSettings>>(
      `${this.baseUrl}/payment-methods`,
      { paymentMethods }
    );
    return response.data.data!;
  }

  /**
   * Toggle maintenance mode
   */
  async toggleMaintenanceMode(enabled: boolean, message?: string): Promise<StoreSettings> {
    const response = await apiClient.patch<ApiResponse<StoreSettings>>(
      `${this.baseUrl}/maintenance`,
      { maintenanceMode: enabled, maintenanceMessage: message }
    );
    return response.data.data!;
  }
}

export const settingsService = new SettingsService();

