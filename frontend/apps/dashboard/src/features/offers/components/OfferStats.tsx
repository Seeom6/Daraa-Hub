/**
 * Offer Stats Component
 * Displays offer analytics statistics
 */

'use client';

import { Card, CardHeader, CardBody } from '@/components/ui';
import { Eye, ShoppingCart, TrendingUp } from 'lucide-react';
import type { OfferAnalytics } from '../types';

export interface OfferStatsProps {
  analytics: OfferAnalytics;
  isLoading?: boolean;
}

export function OfferStats({ analytics, isLoading }: OfferStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardBody>
              <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* View Count */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                إجمالي المشاهدات
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.viewCount.toLocaleString('ar-SY')}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Usage Count */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                إجمالي الاستخدامات
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.usageCount.toLocaleString('ar-SY')}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Conversion Rate */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                معدل التحويل
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.conversionRate.toFixed(2)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

