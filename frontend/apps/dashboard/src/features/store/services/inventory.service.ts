/**
 * Inventory Service
 * API service for inventory management
 */

import apiClient from '@/lib/api-client';
import type { ApiResponse } from '../types';
import type {
  CreateInventoryDto,
  UpdateInventoryDto,
  AddStockDto,
  RemoveStockDto,
} from '../types/dto.types';

export interface Inventory {
  _id: string;
  productId: string;
  storeId: string;
  quantity: number;
  lowStockThreshold?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryFilters {
  storeId?: string;
  productId?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  page?: number;
  limit?: number;
}

class InventoryService {
  private readonly baseUrl = '/inventory';

  /**
   * Get all inventory records
   */
  async getInventory(filters?: InventoryFilters): Promise<{
    data: Inventory[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const response = await apiClient.get<ApiResponse<Inventory[]>>(this.baseUrl, {
      params: filters,
    });
    return {
      data: response.data.data || [],
      meta: (response.data as any).meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  }

  /**
   * Get inventory by ID
   */
  async getInventoryById(id: string): Promise<Inventory> {
    const response = await apiClient.get<ApiResponse<Inventory>>(`${this.baseUrl}/${id}`);
    return response.data.data!;
  }

  /**
   * Create inventory record
   */
  async createInventory(data: CreateInventoryDto): Promise<Inventory> {
    const response = await apiClient.post<ApiResponse<Inventory>>(this.baseUrl, data);
    return response.data.data!;
  }

  /**
   * Update inventory
   */
  async updateInventory(id: string, data: UpdateInventoryDto): Promise<Inventory> {
    const response = await apiClient.put<ApiResponse<Inventory>>(`${this.baseUrl}/${id}`, data);
    return response.data.data!;
  }

  /**
   * Add stock
   */
  async addStock(id: string, data: AddStockDto): Promise<Inventory> {
    const response = await apiClient.patch<ApiResponse<Inventory>>(
      `${this.baseUrl}/${id}/add-stock`,
      data
    );
    return response.data.data!;
  }

  /**
   * Remove stock
   */
  async removeStock(id: string, data: RemoveStockDto): Promise<Inventory> {
    const response = await apiClient.patch<ApiResponse<Inventory>>(
      `${this.baseUrl}/${id}/remove-stock`,
      data
    );
    return response.data.data!;
  }
}

export const inventoryService = new InventoryService();

