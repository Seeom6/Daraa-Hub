/**
 * Root Layout Component
 * Base layout wrapper for the entire application
 * Handles RTL, Dark Mode, and global providers
 */

'use client';

import { ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
  lang?: string;
  dir?: 'rtl' | 'ltr';
}

export function RootLayout({ 
  children, 
  lang = 'ar', 
  dir = 'rtl' 
}: RootLayoutProps) {
  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}

