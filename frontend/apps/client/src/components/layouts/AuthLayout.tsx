/**
 * Auth Layout Component
 * Layout for authentication pages (Login, Register, etc.)
 * Supports both Center and Split layouts
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  footerText?: string;
  footerLink?: {
    text: string;
    href: string;
  };
  variant?: 'center' | 'split';
}

export function AuthLayout({
  children,
  title = 'مرحباً بك',
  description = 'سجل دخولك للمتابعة',
  footerText,
  footerLink,
  variant = 'center',
}: AuthLayoutProps) {
  if (variant === 'split') {
    return <SplitAuthLayout title={title} description={description}>{children}</SplitAuthLayout>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="h-16 mx-auto mb-4 flex items-center justify-center">
            {/* Logo placeholder */}
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">S</span>
            </div>
          </div>
          <h1 className="text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8">
          {children}
        </div>

        {/* Footer Link */}
        {footerText && footerLink && (
          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
            {footerText}{' '}
            <Link 
              href={footerLink.href} 
              className="text-blue-500 hover:underline transition-colors"
            >
              {footerLink.text}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

// Split Layout Variant
function SplitAuthLayout({ 
  children, 
  title, 
  description 
}: { 
  children: ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="h-12 mb-8 flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">S</span>
            </div>
          </div>

          <h1 className="mb-2">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {description}
          </p>

          {children}
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-8">
        <div className="text-white text-center max-w-md">
          <h2 className="mb-4 text-white">منصة Sillap</h2>
          <p className="text-white/80 text-lg">
            أفضل تجربة تسوق عبر الإنترنت في سوريا
          </p>
        </div>
      </div>
    </div>
  );
}

