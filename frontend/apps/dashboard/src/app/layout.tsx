/**
 * Root Layout
 * Main layout for the dashboard app
 */

import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { NavigationProgress } from '@/components/ui/NavigationProgress';
import './globals.css';

export const metadata: Metadata = {
  title: 'Daraa Hub - لوحة التحكم',
  description: 'لوحة التحكم لمنصة Daraa Hub للتجارة الإلكترونية',
  keywords: ['لوحة تحكم', 'إدارة', 'متجر', 'Daraa Hub'],
  authors: [{ name: 'Daraa Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <NavigationProgress />
            {children}
            <ToastProvider />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

