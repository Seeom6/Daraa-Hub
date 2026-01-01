/**
 * MetricCard Component
 * Display dashboard metrics with trend indicators
 */

import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export function MetricCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = 'blue',
}: MetricCardProps) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors[color])}>
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-1">
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}
            >
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              مقارنة بالشهر الماضي
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

