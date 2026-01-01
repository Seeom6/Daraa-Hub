/**
 * Root Layout
 * Main layout for the entire Sillap application
 * Handles RTL, Dark Mode, and global providers
 */

import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { NavigationProgress } from '@/components/ui/NavigationProgress';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sillap - منصة التجارة الإلكترونية',
  description: 'أفضل تجربة تسوق عبر الإنترنت في سوريا',
  keywords: ['تسوق', 'منتجات', 'سوريا', 'تجارة إلكترونية', 'Sillap'],
  authors: [{ name: 'Sillap Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 antialiased">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <NavigationProgress />
              <ToastProvider />
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

