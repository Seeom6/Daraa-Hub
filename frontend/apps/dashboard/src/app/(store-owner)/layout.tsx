/**
 * Store Owner Layout
 * Main layout for all store owner pages
 */

'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  LogOut,
  Store,
  User,
  Moon,
  Sun,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { storeOwnerService, authService } from '@/features/store/services';
import type { StoreOwnerProfile } from '@/features/store/types';
import { useAuthStore } from '@/features/store/stores/auth.store';

interface StoreLayoutProps {
  children: ReactNode;
}

interface NavItem {
  icon: any;
  label: string;
  path: string;
  badge?: number;
}

export default function StoreOwnerLayout({ children }: StoreLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isCheckingStore, setIsCheckingStore] = useState(true);
  const [storeProfile, setStoreProfile] = useState<StoreOwnerProfile | null>(null);

  // Check store verification status on mount and route changes
  useEffect(() => {
    checkStoreVerificationStatus();
  }, [pathname]);

  const checkStoreVerificationStatus = async () => {
    // Skip check for the store-under-review page itself
    if (pathname === '/store-under-review') {
      setIsCheckingStore(false);
      return;
    }

    try {
      const profile: StoreOwnerProfile = await storeOwnerService.getProfile();
      setStoreProfile(profile);

      // Check if profile exists
      if (!profile || !profile._id) {
        toast.error('لم يتم العثور على معرف المتجر. الرجاء إنشاء ملف المتجر أولاً', {
          duration: 5000,
        });
        setTimeout(() => {
          router.push('/settings/profile');
        }, 2000);
        return;
      }

      // Update storeId in Zustand store
      const { setStoreId } = useAuthStore.getState();
      setStoreId(profile._id);

      // If verification status is pending, redirect to waiting page
      if (profile.verificationStatus === 'pending') {
        toast.error('متجرك قيد المراجعة. يرجى انتظار الموافقة', {
          duration: 6000,
        });
        setTimeout(() => {
          router.push('/store-under-review');
        }, 1500);
        return;
      }

      // If verification status is rejected
      if (profile.verificationStatus === 'rejected') {
        toast.error('تم رفض طلب التحقق من متجرك. يرجى مراجعة الملاحظات وإعادة التقديم', {
          duration: 6000,
        });
        setTimeout(() => {
          router.push('/settings/verification');
        }, 2000);
        return;
      }

      // If store is suspended
      if (profile.verificationStatus === 'suspended' || profile.isStoreSuspended) {
        toast.error('متجرك معلق حالياً. يرجى التواصل مع الدعم الفني', {
          duration: 6000,
        });
        // Allow viewing dashboard but with limited access
      }

      // Check if store is active
      if (!profile.isStoreActive && profile.verificationStatus === 'approved') {
        toast.error('متجرك غير نشط حالياً. يرجى تفعيل المتجر من الإعدادات', {
          duration: 5000,
        });
      }

    } catch (error: any) {
      console.error('Error checking store verification status:', error);

      if (error.response?.status === 403) {
        try {
          await authService.refreshToken();
          const profile: StoreOwnerProfile = await storeOwnerService.getProfile();
          setStoreProfile(profile);

          // Update storeId in Zustand store
          const { setStoreId } = useAuthStore.getState();
          setStoreId(profile._id);

          toast.success('تم تحديث صلاحياتك بنجاح!');
          setIsCheckingStore(false);
          return;
        } catch (refreshError) {
          toast.error('يرجى تسجيل الخروج وتسجيل الدخول مرة أخرى لتحديث صلاحياتك', {
            duration: 5000,
          });
          setTimeout(() => handleLogout(), 2000);
        }
      } else if (error.response?.status === 404) {
        toast.error('لم يتم العثور على ملف المتجر. الرجاء إنشاء ملف المتجر أولاً');
        setTimeout(() => router.push('/settings/profile'), 2000);
      } else if (error.response?.status === 401) {
        toast.error('يجب تسجيل الدخول أولاً');
        setTimeout(() => router.push('/login'), 1500);
      }
    } finally {
      setIsCheckingStore(false);
    }
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
    localStorage.setItem('theme', darkMode ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('تم تسجيل الخروج بنجاح');
      router.push('/auth/login');
    } catch (error) {
      toast.error('فشل تسجيل الخروج');
    }
  };

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/dashboard' },
    { icon: Package, label: 'المنتجات', path: '/products' },
    { icon: Tag, label: 'العروض', path: '/offers' },
    { icon: ShoppingCart, label: 'الطلبات', path: '/orders', badge: 3 },
    { icon: BarChart3, label: 'الإحصائيات', path: '/analytics' },
    { icon: Settings, label: 'الإعدادات', path: '/settings' }
  ];

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  // Show loading screen while checking store status
  if (isCheckingStore && pathname !== '/store-under-review') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحقق من حالة المتجر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950" dir="rtl">
      {/* Top Navbar */}
      <nav className="fixed top-0 right-0 left-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800">
        <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-gray-900 dark:text-white">
                  لوحة التحكم
                </div>
                {storeProfile && (
                  <div className="flex items-center gap-1 text-xs">
                    {storeProfile.verificationStatus === 'approved' && (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-green-600 dark:text-green-400">متجر نشط</span>
                      </>
                    )}
                    {storeProfile.verificationStatus === 'pending' && (
                      <>
                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                        <span className="text-yellow-600 dark:text-yellow-400">قيد المراجعة</span>
                      </>
                    )}
                    {storeProfile.verificationStatus === 'rejected' && (
                      <>
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="text-red-600 dark:text-red-400">مرفوض</span>
                      </>
                    )}
                    {storeProfile.verificationStatus === 'suspended' && (
                      <>
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span className="text-orange-600 dark:text-orange-400">معلق</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Left Side */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:block text-sm text-gray-700 dark:text-gray-300">
                صاحب المتجر
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed top-16 right-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 overflow-y-auto">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${active
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-medium
                    ${active
                      ? 'bg-white/20 text-white'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }
                  `}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40 top-16"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed top-16 right-0 bottom-0 w-72 bg-white dark:bg-slate-900 shadow-xl z-40 overflow-y-auto"
            >
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        group flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                        ${active
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                          : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={`
                          px-2 py-0.5 rounded-full text-xs font-medium
                          ${active
                            ? 'bg-white/20 text-white'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:mr-64 pt-16">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

