import { apiClient } from '@/lib/api-client';
import type { Order, OrdersResponse } from '@/features/shared/types/order.types';

const ORDERS_BASE_URL = '/orders';

export interface OrdersFilters {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const ordersService = {
  /**
   * Get my orders
   */
  getMyOrders: async (filters?: OrdersFilters): Promise<OrdersResponse> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<OrdersResponse>(
      `${ORDERS_BASE_URL}/my-orders?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<{ order: Order }>(`${ORDERS_BASE_URL}/${id}`);
    return response.data.order;
  },

  /**
   * Cancel order
   */
  cancelOrder: async (id: string, reason?: string): Promise<Order> => {
    const response = await apiClient.put<{ order: Order }>(
      `${ORDERS_BASE_URL}/${id}/cancel`,
      { reason }
    );
    return response.data.order;
  },

  /**
   * Request return
   */
  requestReturn: async (
    id: string,
    data: { reason: string; items?: string[] }
  ): Promise<Order> => {
    const response = await apiClient.post<{ order: Order }>(
      `${ORDERS_BASE_URL}/${id}/return`,
      data
    );
    return response.data.order;
  },
};

