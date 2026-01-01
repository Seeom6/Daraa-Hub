import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  wishlistIds: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: [],

      addToWishlist: (productId: string) => {
        set((state) => ({
          wishlistIds: [...new Set([...state.wishlistIds, productId])],
        }));
      },

      removeFromWishlist: (productId: string) => {
        set((state) => ({
          wishlistIds: state.wishlistIds.filter((id) => id !== productId),
        }));
      },

      isInWishlist: (productId: string) => {
        return get().wishlistIds.includes(productId);
      },

      clearWishlist: () => {
        set({ wishlistIds: [] });
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);

