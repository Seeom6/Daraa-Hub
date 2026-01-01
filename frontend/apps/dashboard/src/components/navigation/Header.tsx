/**
 * Header Component
 * Top header with notifications, theme toggle, and user menu
 */

'use client';

import { useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="h-16 glass-medium border-b border-gray-200 dark:border-slate-700 sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Side - Empty for now, can add breadcrumbs later */}
        <div className="flex-1" />

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 glass-strong rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    الإشعارات
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    لا توجد إشعارات جديدة
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 pr-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                م
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute left-0 mt-2 w-56 glass-strong rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                  <p className="font-medium text-gray-900 dark:text-white">
                    متجر تجريبي
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    store@example.com
                  </p>
                </div>

                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4" />
                    <span>الملف الشخصي</span>
                  </button>

                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-gray-300">
                    <Settings className="w-4 h-4" />
                    <span>الإعدادات</span>
                  </button>

                  <div className="my-2 border-t border-gray-200 dark:border-slate-700" />

                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400">
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

