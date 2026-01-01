/**
 * Content Container Component
 * Container for articles and text-heavy content (max-w-3xl)
 */

import { ReactNode } from 'react';
import { cn } from '@daraa/utils';

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
  prose?: boolean;
}

export function ContentContainer({ 
  children, 
  className,
  prose = false
}: ContentContainerProps) {
  return (
    <div className={cn(
      'max-w-3xl mx-auto px-4 sm:px-6',
      className
    )}>
      {prose ? (
        <article className="prose dark:prose-invert max-w-none">
          {children}
        </article>
      ) : (
        children
      )}
    </div>
  );
}

