import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, CartItem, Coupon } from '../types/cart.types';

interface CartStore {
  cart: Cart | null;
  isOpen: boolean;
  
  // Actions
  setCart: (cart: Cart) => void;
  addItem: (item: CartItem) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Computed
  getItemsCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: null,
      isOpen: false,

      setCart: (cart) => set({ cart }),

      addItem: (item) =>
        set((state) => {
          if (!state.cart) {
            return {
              cart: {
                items: [item],
                subtotal: item.price * item.quantity,
                discount: 0,
                shipping: 0,
                total: item.price * item.quantity,
                itemsCount: item.quantity,
              },
            };
          }

          const existingItemIndex = state.cart.items.findIndex(
            (i) => i.productId === item.productId
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.cart.items];
            newItems[existingItemIndex].quantity += item.quantity;
            
            return {
              cart: {
                ...state.cart,
                items: newItems,
              },
            };
          }

          return {
            cart: {
              ...state.cart,
              items: [...state.cart.items, item],
            },
          };
        }),

      updateItemQuantity: (productId, quantity) =>
        set((state) => {
          if (!state.cart) return state;

          const newItems = state.cart.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          );

          return {
            cart: {
              ...state.cart,
              items: newItems,
            },
          };
        }),

      removeItem: (productId) =>
        set((state) => {
          if (!state.cart) return state;

          const newItems = state.cart.items.filter(
            (item) => item.productId !== productId
          );

          if (newItems.length === 0) {
            return { cart: null };
          }

          return {
            cart: {
              ...state.cart,
              items: newItems,
            },
          };
        }),

      applyCoupon: (coupon) =>
        set((state) => {
          if (!state.cart) return state;

          return {
            cart: {
              ...state.cart,
              coupon,
            },
          };
        }),

      removeCoupon: () =>
        set((state) => {
          if (!state.cart) return state;

          return {
            cart: {
              ...state.cart,
              coupon: undefined,
              discount: 0,
            },
          };
        }),

      clearCart: () => set({ cart: null }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getItemsCount: () => {
        const { cart } = get();
        if (!cart) return 0;
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        const { cart } = get();
        if (!cart) return 0;
        return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getTotal: () => {
        const { cart } = get();
        if (!cart) return 0;
        return cart.total || get().getSubtotal();
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state: CartStore) => ({ cart: state.cart }),
    }
  )
);

