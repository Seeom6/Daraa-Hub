/**
 * Mobile Navigation Component
 * Bottom navigation bar for mobile devices
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  Tag,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'الرئيسية',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'المنتجات',
    href: '/products',
    icon: <Package className="w-5 h-5" />,
  },
  {
    label: 'العروض',
    href: '/offers',
    icon: <Tag className="w-5 h-5" />,
  },
  {
    label: 'الطلبات',
    href: '/orders',
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    label: 'التحليلات',
    href: '/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    label: 'الإعدادات',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-gray-200 dark:border-slate-700 md:hidden z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]',
              isActive(item.href)
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            <div
              className={cn(
                'p-1.5 rounded-lg transition-all duration-200',
                isActive(item.href) && 'bg-primary-100 dark:bg-primary-900/30'
              )}
            >
              {item.icon}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

