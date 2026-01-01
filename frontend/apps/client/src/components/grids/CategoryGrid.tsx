/**
 * Category Grid Component
 * Responsive grid for displaying categories
 * Mobile: 2 columns, Tablet: 3 columns, Desktop: 4 columns
 */

import { ReactNode } from 'react';
import { cn } from '@daraa/utils';

interface CategoryGridProps {
  children: ReactNode;
  className?: string;
}

export function CategoryGrid({ children, className }: CategoryGridProps) {
  return (
    <div className={cn(
      'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
      className
    )}>
      {children}
    </div>
  );
}

