/**
 * Auth Store
 * Zustand store for authentication and store state
 * Consolidated store for better performance and simpler state management
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { AuthUser } from '../services/auth.service';

interface AuthState {
  // Auth state
  user: AuthUser | null;
  isAuthenticated: boolean;

  // Store state
  storeId: string | null;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setStoreId: (storeId: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        storeId: null,
        isAuthenticated: false,

        // Actions
        setUser: (user) =>
          set(
            {
              user,
              isAuthenticated: !!user,
            },
            false,
            'setUser'
          ),

        setStoreId: (storeId) =>
          set({ storeId }, false, 'setStoreId'),

        clearAuth: () =>
          set(
            {
              user: null,
              storeId: null,
              isAuthenticated: false,
            },
            false,
            'clearAuth'
          ),
      }),
      {
        name: 'daraa-auth-storage',
        partialize: (state) => ({
          user: state.user,
          storeId: state.storeId,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

