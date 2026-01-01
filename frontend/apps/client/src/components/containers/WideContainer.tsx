/**
 * Wide Container Component
 * Wider container for dashboards and data-heavy pages (max-w-[1400px])
 */

import { ReactNode } from 'react';
import { cn } from '@daraa/utils';

interface WideContainerProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export function WideContainer({ 
  children, 
  className,
  as: Component = 'div'
}: WideContainerProps) {
  return (
    <Component className={cn(
      'max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8',
      className
    )}>
      {children}
    </Component>
  );
}

