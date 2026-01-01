'use client';

/**
 * React Query Provider
 * 
 * Provides React Query (TanStack Query) context to the application
 * - Caching configuration
 * - Retry logic
 * - DevTools in development
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 minutes
            staleTime: 5 * 60 * 1000,
            
            // Cache time: 30 minutes
            gcTime: 30 * 60 * 1000,
            
            // Retry failed requests 3 times
            retry: 3,
            
            // Retry delay (exponential backoff)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            
            // Refetch on window focus in production only
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            
            // Refetch on reconnect
            refetchOnReconnect: true,
            
            // Refetch on mount if data is stale
            refetchOnMount: true,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
            
            // Retry delay
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show DevTools in development only */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
}

