'use client';

import { Users, Store, Truck, ShoppingCart, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'إجمالي المستخدمين',
      value: '12,543',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'المتاجر النشطة',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: Store,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'السائقين المتاحين',
      value: '456',
      change: '-3.1%',
      trend: 'down',
      icon: Truck,
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      title: 'الطلبات اليوم',
      value: '2,891',
      change: '+15.3%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'الإيرادات اليوم',
      value: '$45,231',
      change: '+23.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      title: 'المنتجات',
      value: '8,765',
      change: '+5.7%',
      trend: 'up',
      icon: Package,
      color: 'from-pink-500 to-pink-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">لوحة التحكم</h1>
        <p className="text-gray-600 dark:text-gray-400">مرحباً بك في لوحة تحكم المدير</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

          return (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold ${
                  stat.trend === 'up'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">الإيرادات الشهرية</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400">Chart Placeholder</p>
          </div>
        </div>

        {/* Orders Chart Placeholder */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">الطلبات اليومية</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400">Chart Placeholder</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">الطلبات الأخيرة</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">رقم الطلب</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">العميل</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">المتجر</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">المبلغ</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">#12345</td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">أحمد محمد</td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">متجر الإلكترونيات</td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">$250.00</td>
                <td className="py-3 px-4">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    مكتمل
                  </span>
                </td>
              </tr>
              {/* Add more rows as needed */}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">طلبات التحقق المعلقة</h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">3</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">التقييمات المعلقة</h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">12</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">المبالغ المستردة</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">5</p>
        </div>
      </div>
    </div>
  );
}

