/**
 * Orders Store
 * Zustand store for orders state management
 * Handles order list, filters, and real-time updates
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Order, OrderFilters } from '../types';

interface OrdersState {
  // State
  orders: Order[];
  selectedOrder: Order | null;
  filters: OrderFilters;
  pendingCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setOrders: (orders: Order[]) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  setSelectedOrder: (order: Order | null) => void;
  setFilters: (filters: Partial<OrderFilters>) => void;
  resetFilters: () => void;
  setPendingCount: (count: number) => void;
  clearOrders: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialFilters: OrderFilters = {
  page: 1,
  limit: 10,
};

export const useOrdersStore = create<OrdersState>()(
  devtools(
    (set) => ({
      // Initial state
      orders: [],
      selectedOrder: null,
      filters: initialFilters,
      pendingCount: 0,
      isLoading: false,
      error: null,

      // Actions
      setOrders: (orders) =>
        set({ orders, error: null, isLoading: false }, false, 'setOrders'),

      updateOrder: (id, updates) =>
        set(
          (state) => ({
            orders: state.orders.map((o) =>
              o._id === id ? { ...o, ...updates } : o
            ),
            selectedOrder:
              state.selectedOrder?._id === id
                ? { ...state.selectedOrder, ...updates }
                : state.selectedOrder,
            error: null,
          }),
          false,
          'updateOrder'
        ),

      setSelectedOrder: (order) =>
        set({ selectedOrder: order }, false, 'setSelectedOrder'),

      setFilters: (filters) =>
        set(
          (state) => ({ filters: { ...state.filters, ...filters } }),
          false,
          'setFilters'
        ),

      resetFilters: () =>
        set({ filters: initialFilters }, false, 'resetFilters'),

      setPendingCount: (count) =>
        set({ pendingCount: count }, false, 'setPendingCount'),

      clearOrders: () =>
        set(
          { orders: [], selectedOrder: null, pendingCount: 0, error: null },
          false,
          'clearOrders'
        ),

      setLoading: (isLoading) =>
        set({ isLoading }, false, 'setLoading'),

      setError: (error) =>
        set({ error, isLoading: false }, false, 'setError'),
    }),
    { name: 'OrdersStore' }
  )
);

