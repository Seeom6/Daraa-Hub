/**
 * Breadcrumbs Component
 * Show current page path navigation
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'لوحة التحكم',
  products: 'المنتجات',
  orders: 'الطلبات',
  analytics: 'التحليلات',
  settings: 'الإعدادات',
  new: 'جديد',
};

export function Breadcrumbs() {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home
    breadcrumbs.push({
      label: 'الرئيسية',
      href: '/dashboard',
    });

    // Build breadcrumbs from path segments
    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      // Skip if it's a dynamic route (starts with number or UUID)
      if (/^[0-9a-f-]+$/i.test(path)) {
        breadcrumbs.push({
          label: 'التفاصيل',
        });
        return;
      }

      const label = routeLabels[path] || path;
      
      // Last item should not have href
      if (index === paths.length - 1) {
        breadcrumbs.push({ label });
      } else {
        breadcrumbs.push({ label, href: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on dashboard home
  if (pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronLeft className="w-4 h-4 text-gray-400 dark:text-gray-600" />
          )}
          
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {index === 0 && <Home className="w-4 h-4 inline ml-1" />}
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

