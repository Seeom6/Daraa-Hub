import { apiClient } from '@/lib/api-client';
import type { Order, CreateOrderInput } from '@/features/shared/types/order.types';
import type { ShippingMethod } from '../types/checkout.types';

const ORDERS_BASE_URL = '/orders';

export const checkoutService = {
  /**
   * Get available shipping methods
   */
  getShippingMethods: async (addressId: string): Promise<ShippingMethod[]> => {
    const response = await apiClient.get<{ methods: ShippingMethod[] }>(
      `/shipping/methods?addressId=${addressId}`
    );
    return response.data.methods;
  },

  /**
   * Create order
   */
  createOrder: async (input: CreateOrderInput): Promise<Order> => {
    const response = await apiClient.post<{ order: Order }>(ORDERS_BASE_URL, input);
    return response.data.order;
  },

  /**
   * Get order by ID
   */
  getOrder: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get<{ order: Order }>(`${ORDERS_BASE_URL}/${orderId}`);
    return response.data.order;
  },
};

