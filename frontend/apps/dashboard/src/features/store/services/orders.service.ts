/**
 * Orders Service
 * API service for orders management
 */

import apiClient from '@/lib/api-client';
import type {
  Order,
  OrdersResponse,
  ApiResponse,
  OrderFilters,
  UpdateOrderStatusDto,
} from '../types';

class OrdersService {
  private readonly baseUrl = '/orders';

  /**
   * Get all orders (paginated)
   * @param filters - Filter options including storeId
   */
  async getOrders(filters?: OrderFilters): Promise<{
    data: Order[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const response = await apiClient.get<OrdersResponse>(this.baseUrl, {
      params: filters,
    });
    return {
      data: response.data.data || [],
      meta: response.data.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  }

  /**
   * Get order by ID
   */
  async getOrder(id: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(`${this.baseUrl}/${id}`);
    return response.data.data!;
  }

  /**
   * Update order status
   */
  async updateStatus(id: string, status: string): Promise<Order> {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `${this.baseUrl}/${id}/status`,
      { status }
    );
    return response.data.data!;
  }
}

export const ordersService = new OrdersService();

