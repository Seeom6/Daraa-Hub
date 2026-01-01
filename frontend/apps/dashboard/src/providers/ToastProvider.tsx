'use client';

/**
 * Toast Provider
 * 
 * Provides toast notifications using react-hot-toast
 */

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: 'var(--toast-bg)',
          color: 'var(--toast-color)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
        },
        // Success
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        // Error
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
        // Loading
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
}

