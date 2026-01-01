/**
 * Products Store
 * Zustand store for products state management
 * Handles product list, filters, and optimistic updates
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Product, ProductFilters } from '../types';

interface ProductsState {
  // State
  products: Product[];
  selectedProduct: Product | null;
  filters: ProductFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
  clearProducts: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialFilters: ProductFilters = {
  page: 1,
  limit: 10,
  sort: '-createdAt',
};

export const useProductsStore = create<ProductsState>()(
  devtools(
    (set) => ({
      // Initial state
      products: [],
      selectedProduct: null,
      filters: initialFilters,
      isLoading: false,
      error: null,

      // Actions
      setProducts: (products) =>
        set({ products, error: null, isLoading: false }, false, 'setProducts'),

      addProduct: (product) =>
        set(
          (state) => ({
            products: [product, ...state.products],
            error: null,
          }),
          false,
          'addProduct'
        ),

      updateProduct: (id, updates) =>
        set(
          (state) => ({
            products: state.products.map((p) =>
              p._id === id ? { ...p, ...updates } : p
            ),
            selectedProduct:
              state.selectedProduct?._id === id
                ? { ...state.selectedProduct, ...updates }
                : state.selectedProduct,
            error: null,
          }),
          false,
          'updateProduct'
        ),

      removeProduct: (id) =>
        set(
          (state) => ({
            products: state.products.filter((p) => p._id !== id),
            selectedProduct:
              state.selectedProduct?._id === id ? null : state.selectedProduct,
            error: null,
          }),
          false,
          'removeProduct'
        ),

      setSelectedProduct: (product) =>
        set({ selectedProduct: product }, false, 'setSelectedProduct'),

      setFilters: (filters) =>
        set(
          (state) => ({ filters: { ...state.filters, ...filters } }),
          false,
          'setFilters'
        ),

      resetFilters: () =>
        set({ filters: initialFilters }, false, 'resetFilters'),

      clearProducts: () =>
        set(
          { products: [], selectedProduct: null, error: null },
          false,
          'clearProducts'
        ),

      setLoading: (isLoading) =>
        set({ isLoading }, false, 'setLoading'),

      setError: (error) =>
        set({ error, isLoading: false }, false, 'setError'),
    }),
    { name: 'ProductsStore' }
  )
);

