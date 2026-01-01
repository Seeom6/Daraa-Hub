/**
 * Analytics Page
 * View store analytics and reports
 */

'use client';

import { useState } from 'react';
import { Card, CardHeader, Select } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/common';
import { MetricCard, StatsCard } from '@/features/store/components';
import { useStoreAnalytics, useTopProducts } from '@/features/store/hooks';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  Package,
  Star,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const storeId = ''; // TODO: Get from auth context

  const { data: analytics, isLoading, error, refetch } = useStoreAnalytics(storeId);
  const { data: topProducts } = useTopProducts(5);

  if (isLoading) {
    return <LoadingState message="جاري تحميل التحليلات..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="فشل تحميل التحليلات"
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            التحليلات والتقارير
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            تحليل أداء متجرك
          </p>
        </div>

        <Select
          options={[
            { value: 'daily', label: 'يومي' },
            { value: 'weekly', label: 'أسبوعي' },
            { value: 'monthly', label: 'شهري' },
            { value: 'yearly', label: 'سنوي' },
          ]}
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="إجمالي المبيعات"
          value={formatCurrency(0)}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          trend={{
            value: 0,
            isPositive: true,
          }}
        />

        <MetricCard
          title="عدد الطلبات"
          value={0}
          icon={<ShoppingBag className="w-6 h-6" />}
          color="blue"
          trend={{
            value: 0,
            isPositive: true,
          }}
        />

        <MetricCard
          title="متوسط قيمة الطلب"
          value={formatCurrency(0)}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />

        <MetricCard
          title="العملاء الجدد"
          value={0}
          icon={<Users className="w-6 h-6" />}
          color="yellow"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          label="معدل التحويل"
          value="0%"
          icon={<TrendingUp className="w-8 h-8" />}
          color="green"
        />

        <StatsCard
          label="المنتجات المباعة"
          value={0}
          icon={<Package className="w-8 h-8" />}
          color="blue"
        />

        <StatsCard
          label="متوسط التقييم"
          value="0.0"
          icon={<Star className="w-8 h-8" />}
          color="yellow"
        />
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader
          title="المنتجات الأكثر مبيعاً"
          subtitle="أفضل 5 منتجات"
        />
        
        {topProducts && topProducts.length > 0 ? (
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div
                key={product._id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                    {index + 1}
                  </div>
                  
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.soldCount || 0} مبيعات
                    </p>
                  </div>
                </div>
                
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(product.price)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            لا توجد بيانات
          </p>
        )}
      </Card>
    </div>
  );
}

