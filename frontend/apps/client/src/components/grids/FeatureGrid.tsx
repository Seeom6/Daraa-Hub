/**
 * Feature Grid Component
 * Responsive grid for displaying features
 * Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
 */

import { ReactNode } from 'react';
import { cn } from '@daraa/utils';

interface FeatureGridProps {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}

const columnClasses = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
};

export function FeatureGrid({ 
  children, 
  className,
  columns = 3 
}: FeatureGridProps) {
  return (
    <div className={cn(
      'grid grid-cols-1 gap-8',
      columnClasses[columns],
      className
    )}>
      {children}
    </div>
  );
}

