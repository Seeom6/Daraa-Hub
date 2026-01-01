/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { getCurrentUser } from '@/features/auth/services/auth.service';
import type { User } from '@/features/auth/types/auth.types'

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  updateUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get current user from backend (JWT in cookies)
        const user = await getCurrentUser();
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        // No valid session
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };
    checkAuth();
  }, []);

  // Update user (called by login/register hooks)
  const updateUser = useCallback((user: User | null) => {
    setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export types
export type { AuthState, AuthContextValue };

