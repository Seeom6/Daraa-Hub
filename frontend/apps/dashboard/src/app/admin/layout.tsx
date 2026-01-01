'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Store,
  Truck,
  Package,
  ShoppingCart,
  CreditCard,
  Ticket,
  Star,
  FileText,
  ClipboardList,
  Settings,
  Bell,
  Moon,
  Sun,
  LogOut,
  Crown,
  Search,
  ChevronDown,
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { logoutAdmin } from '@/lib/auth';

interface MenuItem {
  path: string;
  label: string;
  icon: any;
  badge?: string;
  children?: MenuItem[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isAuthenticated, profile } = useAdminAuth();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutAdmin();
      toast.success('تم تسجيل الخروج بنجاح');
      router.push('/admin/login');
    } catch (error) {
      toast.error('فشل تسجيل الخروج');
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Don't render layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If not authenticated, don't render (will redirect in hook)
  if (!isAuthenticated) {
    return null;
  }

  const menuItems: MenuItem[] = [
    { path: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    {
      path: '/admin/users',
      label: 'المستخدمين',
      icon: Users,
      children: [
        { path: '/admin/users', label: 'قائمة المستخدمين', icon: Users },
        { path: '/admin/users/search', label: 'البحث عن مستخدم', icon: Search },
      ],
    },
    {
      path: '/admin/stores',
      label: 'المتاجر',
      icon: Store,
      children: [
        { path: '/admin/stores', label: 'قائمة المتاجر', icon: Store },
        { path: '/admin/stores/verification', label: 'طلبات التحقق', icon: ClipboardList, badge: '3' },
        { path: '/admin/stores/categories', label: 'التصنيفات', icon: LayoutDashboard },
      ],
    },
    {
      path: '/admin/couriers',
      label: 'السائقين',
      icon: Truck,
      children: [
        { path: '/admin/couriers', label: 'قائمة السائقين', icon: Truck },
        { path: '/admin/couriers/map', label: 'خريطة السائقين', icon: LayoutDashboard },
        { path: '/admin/couriers/verification', label: 'طلبات التحقق', icon: ClipboardList },
      ],
    },
    {
      path: '/admin/products',
      label: 'المنتجات',
      icon: Package,
      children: [
        { path: '/admin/products', label: 'قائمة المنتجات', icon: Package },
        { path: '/admin/products/categories', label: 'التصنيفات', icon: LayoutDashboard },
      ],
    },
    { path: '/admin/orders', label: 'الطلبات', icon: ShoppingCart },
    {
      path: '/admin/payments',
      label: 'المدفوعات',
      icon: CreditCard,
      children: [
        { path: '/admin/payments', label: 'قائمة المدفوعات', icon: CreditCard },
        { path: '/admin/payments/refunds', label: 'المبالغ المستردة', icon: CreditCard },
        { path: '/admin/payments/returns', label: 'المرتجعات', icon: CreditCard },
      ],
    },
    { path: '/admin/coupons', label: 'الكوبونات', icon: Ticket },
    { path: '/admin/reviews', label: 'التقييمات', icon: Star },
    {
      path: '/admin/notifications',
      label: 'الإشعارات',
      icon: Bell,
      badge: '5',
      children: [
        { path: '/admin/notifications', label: 'إرسال إشعار', icon: Bell },
        { path: '/admin/notifications/templates', label: 'القوالب', icon: FileText },
        { path: '/admin/notifications/history', label: 'السجل', icon: ClipboardList },
      ],
    },
    {
      path: '/admin/reports',
      label: 'التقارير',
      icon: FileText,
      children: [
        { path: '/admin/reports/sales', label: 'تقرير المبيعات', icon: FileText },
        { path: '/admin/reports/revenue', label: 'تقرير الإيرادات', icon: FileText },
        { path: '/admin/reports/users', label: 'تحليلات المستخدمين', icon: FileText },
        { path: '/admin/reports/stores', label: 'تحليلات المتاجر', icon: FileText },
      ],
    },
    {
      path: '/admin/settings',
      label: 'الإعدادات',
      icon: Settings,
      children: [
        { path: '/admin/settings/general', label: 'عام', icon: Settings },
        { path: '/admin/settings/payment', label: 'الدفع', icon: CreditCard },
        { path: '/admin/settings/shipping', label: 'الشحن', icon: Truck },
        { path: '/admin/settings/notifications', label: 'الإشعارات', icon: Bell },
        { path: '/admin/settings/security', label: 'الأمان', icon: Settings },
        { path: '/admin/settings/commission', label: 'العمولات', icon: CreditCard },
        { path: '/admin/settings/features', label: 'الميزات', icon: Settings },
      ],
    },
    { path: '/admin/audit-logs', label: 'سجلات التدقيق', icon: ClipboardList },
  ];

  const isActive = (path: string) => pathname === path;
  const isParentActive = (item: MenuItem) => {
    if (item.children) {
      return item.children.some((child) => pathname === child.path || pathname?.startsWith(child.path + '/'));
    }
    return pathname === item.path || pathname?.startsWith(item.path + '/');
  };

  const toggleMenu = (path: string) => {
    setExpandedMenus((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };



  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const parentActive = isParentActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.path);

    if (hasChildren) {
      return (
        <div key={item.path}>
          <button
            onClick={() => toggleMenu(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
              parentActive
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className={`w-5 h-5 ${parentActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
            <span className="flex-1 font-medium text-right">{item.label}</span>
            {item.badge && (
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                parentActive ? 'bg-white/20 text-white' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              }`}>
                {item.badge}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pr-4 pt-1 space-y-1">
                  {item.children?.map((child) => renderMenuItem(child, true))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        href={item.path}
        onClick={() => !isChild && setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
          active
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
        } ${isChild ? 'text-sm' : ''}`}
      >
        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
        <span className="flex-1 font-medium">{item.label}</span>
        {item.badge && (
          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
            active ? 'bg-white/20 text-white' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {item.badge}
          </span>
        )}
        {active && !isChild && (
          <motion.div
            layoutId="activeTab"
            className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"
          />
        )}
      </Link>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden" dir="rtl">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-col w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-l border-gray-200 dark:border-slate-700 order-first">
          {/* Logo & Header */}
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <Link href="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">لوحة المدير</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => renderMenuItem(item))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-800/50 border border-gray-200 dark:border-slate-700 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">مدير النظام</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 font-medium"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              />

              {/* Sidebar */}
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-gray-200 dark:border-slate-700 z-50 lg:hidden flex flex-col shadow-2xl"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <Link href="/admin/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">لوحة المدير</h1>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Admin Dashboard</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {menuItems.map((item) => renderMenuItem(item))}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-800/50 border border-gray-200 dark:border-slate-700 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm truncate">مدير النظام</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 sticky top-0 z-30">
            <div className="px-4 py-4 flex items-center justify-between gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search Bar */}
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="البحث..."
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className="relative w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile - Desktop Only */}
                <Link
                  href="/admin/profile"
                  className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    A
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">الملف الشخصي</span>
                </Link>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}

