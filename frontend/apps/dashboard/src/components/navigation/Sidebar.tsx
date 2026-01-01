/**
 * Sidebar Navigation Component
 * Main navigation sidebar for Store Owner Dashboard
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  Store,
  ChevronLeft,
  ChevronRight,
  Tag,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'لوحة التحكم',
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

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'fixed right-0 top-0 h-screen glass-medium border-l border-gray-200 dark:border-slate-700 transition-all duration-300 z-40',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-slate-700">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Store className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              متجري
            </span>
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
              isActive(item.href)
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700',
              isCollapsed && 'justify-center'
            )}
          >
            {item.icon}
            {!isCollapsed && (
              <span className="font-medium">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* User Info (Bottom) */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
              م
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                متجر تجريبي
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                store@example.com
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

