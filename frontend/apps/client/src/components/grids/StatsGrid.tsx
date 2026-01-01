/**
 * Stats Grid Component
 * Responsive grid for displaying statistics cards
 * Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns
 */

import { ReactNode } from 'react';
import { cn } from '@daraa/utils';

interface StatsGridProps {
  children: ReactNode;
  className?: string;
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div className={cn(
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',
      className
    )}>
      {children}
    </div>
  );
}

