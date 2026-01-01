/**
 * Profile Store
 * Zustand store for store owner profile state
 * Manages store profile data with optimistic updates
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { StoreOwnerProfile, Account } from '../types';

interface ProfileState {
  // State
  account: Account | null;
  profile: StoreOwnerProfile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProfile: (account: Account, profile: StoreOwnerProfile) => void;
  updateProfile: (profile: Partial<StoreOwnerProfile>) => void;
  clearProfile: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        account: null,
        profile: null,
        isLoading: false,
        error: null,

        // Actions
        setProfile: (account, profile) =>
          set(
            { account, profile, error: null, isLoading: false },
            false,
            'setProfile'
          ),

        updateProfile: (updates) =>
          set(
            (state) => ({
              profile: state.profile ? { ...state.profile, ...updates } : null,
              error: null,
            }),
            false,
            'updateProfile'
          ),

        clearProfile: () =>
          set(
            { account: null, profile: null, error: null, isLoading: false },
            false,
            'clearProfile'
          ),

        setLoading: (isLoading) =>
          set({ isLoading }, false, 'setLoading'),

        setError: (error) =>
          set({ error, isLoading: false }, false, 'setError'),
      }),
      {
        name: 'daraa-profile-storage',
        partialize: (state) => ({
          account: state.account,
          profile: state.profile,
        }),
      }
    ),
    { name: 'ProfileStore' }
  )
);

