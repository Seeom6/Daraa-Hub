/**
 * Dashboard Overview Page
 * Main dashboard for store owners
 */

'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  DollarSign,
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useProducts } from '@/features/store/hooks';
import { useAuthStore } from '@/features/store/stores';
import { storeOwnerService } from '@/features/store/services';

// Mock Data for charts - سيتم استبداله بـ API calls لاحقاً
const mockChartData = {
  salesChart: [
    { label: 'السبت', value: 1800000 },
    { label: 'الأحد', value: 2200000 },
    { label: 'الاثنين', value: 1900000 },
    { label: 'الثلاثاء', value: 2400000 },
    { label: 'الأربعاء', value: 2100000 },
    { label: 'الخميس', value: 2600000 },
    { label: 'الجمعة', value: 2750000 },
    { label: 'اليوم', value: 3000000 },
  ],
  ordersChart: [
    { label: 'السبت', value: 38 },
    { label: 'الأحد', value: 45 },
    { label: 'الاثنين', value: 42 },
    { label: 'الثلاثاء', value: 52 },
    { label: 'الأربعاء', value: 48 },
    { label: 'الخميس', value: 55 },
    { label: 'الجمعة', value: 62 },
    { label: 'اليوم', value: 68 },
  ],
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SYP',
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDateTime = (date: string) => {
  return new Intl.DateTimeFormat('ar-SY-u-nu-latn', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
};

export default function DashboardPage() {
  // Get storeId from auth store
  const { storeId, setStoreId } = useAuthStore();
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(storeId);

  // Fetch store profile for the current logged-in user
  useEffect(() => {
    const fetchStoreProfile = async () => {
      try {
        console.log('📝 Fetching store profile for current user');

        // Fetch store profile for the current logged-in user
        // This will use the existing cookies for authentication
        const profile = await storeOwnerService.getProfile();

        if (profile._id) {
          setCurrentStoreId(profile._id);
          setStoreId(profile._id); // Update Zustand store

          console.log('✅ Store profile loaded successfully', { storeId: profile._id });
        }
      } catch (error: any) {
        console.error('❌ Error fetching store profile:', error);
      }
    };

    fetchStoreProfile();
  }, [setStoreId]); // Only run once on mount

  // Fetch products from backend - only when we have a storeId
  const { products, isLoading, meta } = useProducts({
    storeId: currentStoreId || undefined,
    page: 1,
    limit: 100,
  }, {
    enabled: !!currentStoreId,
  });

  // Calculate metrics from real data
  const totalProducts = meta?.total || products.length || 0;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const lowStockProducts = products.filter(p => {
    // Assuming we'll add inventory data later
    return false; // Placeholder
  });

  // Top products by sales (mock for now)
  const topProducts = products.slice(0, 3);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'إجمالي الإيرادات',
      value: formatPrice(15750000), // Mock - سيتم استبداله بـ API
      change: 12.5,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'إجمالي الطلبات',
      value: '342', // Mock - سيتم استبداله بـ API
      change: 8.2,
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'عدد المنتجات',
      value: totalProducts.toLocaleString('en-US'),
      change: 5.3,
      icon: Package,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'المنتجات النشطة',
      value: activeProducts.toLocaleString('ar-SY'),
      change: 3.1,
      icon: Eye,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      processing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'قيد الانتظار',
      processing: 'قيد التحضير',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي'
    };
    return labels[status] || status;
  };

  return (
    <>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          مرحباً، متجر سلة! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          إليك ملخص أداء متجرك اليوم
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Icon Background */}
              <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
              </div>

              {/* Content */}
              <div className="mt-14">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    isPositive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    عن الشهر الماضي
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            الإيرادات (آخر 8 أيام)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockChartData.salesChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="label"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff'
                }}
                formatter={(value: any) => formatPrice(value)}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#colorRevenue)"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Orders Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            الطلبات (آخر 8 أيام)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockChartData.ordersChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="label"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
              <Bar
                dataKey="value"
                fill="url(#colorOrders)"
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Alerts - Hidden for now until we have real data */}
      {false && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
        >
          {/* Alerts will be shown when we have real data */}
        </motion.div>
      )}

      {/* Top Products Only */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Orders - Hidden until we have real data */}

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              أحدث المنتجات
            </h3>
            <Link
              href="/products"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              عرض الكل
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">لا توجد منتجات بعد</p>
              <Link
                href="/products/create"
                className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                إضافة منتج جديد
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {topProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product._id}`}
                  className="group block p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all border-2 border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* صورة المنتج */}
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full sm:w-24 h-48 sm:h-24 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full sm:w-24 h-48 sm:h-24 rounded-xl bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    {/* معلومات المنتج */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* الاسم */}
                      <h4 className="font-medium text-gray-900 dark:text-white text-base sm:text-lg">
                        {product.name}
                      </h4>

                      {/* الوصف */}
                      {product.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* السعر والحالة */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">السعر:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400 text-base">
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        <div className="w-px h-4 bg-gray-300 dark:bg-slate-600"></div>

                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                        }`}>
                          {product.status === 'active' ? '✓ نشط' : '⏸ غير نشط'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}

