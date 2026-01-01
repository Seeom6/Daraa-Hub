/**
 * Orders Service
 * API service for orders operations
 */

import { apiClient } from '@/lib/api-client';
import type { Order, OrderStatus } from '../types';

const ORDERS_BASE_URL = '/orders';

/**
 * Orders Query Params
 */
export interface OrdersQueryParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

/**
 * Orders Response
 */
export interface OrdersResponse {
  success: boolean;
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const ordersService = {
  /**
   * Get customer orders
   * GET /orders/my-orders
   */
  getMyOrders: async (params?: OrdersQueryParams): Promise<OrdersResponse> => {
    const response = await apiClient.get<OrdersResponse>(`${ORDERS_BASE_URL}/my-orders`, {
      params,
    });
    return response.data;
  },

  /**
   * Get order by ID
   * GET /orders/:id
   */
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get<{ success: boolean; data: Order }>(`${ORDERS_BASE_URL}/${orderId}`);
    return response.data.data;
  },

  /**
   * Cancel order
   * PUT /orders/:id/cancel
   */
  cancelOrder: async (orderId: string, reason: string): Promise<Order> => {
    const response = await apiClient.put<{ success: boolean; data: Order }>(
      `${ORDERS_BASE_URL}/${orderId}/cancel`,
      { reason }
    );
    return response.data.data;
  },

  /**
   * Request return
   * POST /orders/:id/return
   */
  requestReturn: async (orderId: string, reason: string): Promise<Order> => {
    const response = await apiClient.post<{ success: boolean; data: Order }>(
      `${ORDERS_BASE_URL}/${orderId}/return`,
      { reason }
    );
    return response.data.data;
  },
};

