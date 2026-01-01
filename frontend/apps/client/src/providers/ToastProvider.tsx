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
        
        // Styling
        style: {
          background: 'var(--toast-bg)',
          color: 'var(--toast-color)',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: 'inherit',
          direction: 'rtl',
        },
        
        // Success
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        
        // Error
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
        
        // Loading
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

export default ToastProvider;

