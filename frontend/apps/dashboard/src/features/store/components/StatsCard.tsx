/**
 * StatsCard Component
 * Simple statistics card
 */

import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  color = 'blue',
  className,
}: StatsCardProps) {
  const colors = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400',
    gray: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <Card className={cn('text-center', className)}>
      {icon && (
        <div className={cn('w-12 h-12 mx-auto mb-3 flex items-center justify-center', colors[color])}>
          {icon}
        </div>
      )}
      
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {label}
      </p>
    </Card>
  );
}

