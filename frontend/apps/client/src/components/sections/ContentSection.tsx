/**
 * Content Section Component
 * Standard content section with optional header
 */

import { ReactNode } from 'react';
import { cn } from '@daraa/utils';
import { MainContainer } from '../containers';

interface ContentSectionProps {
  children: ReactNode;
  title?: string | ReactNode;
  description?: string | ReactNode;
  headerAlign?: 'start' | 'center' | 'end';
  className?: string;
  containerClassName?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'white' | 'gray';
}

const spacingClasses = {
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16',
  xl: 'py-16 md:py-24',
};

const backgroundClasses = {
  default: '',
  white: 'bg-white dark:bg-slate-900',
  gray: 'bg-gray-50 dark:bg-slate-950',
};

const alignClasses = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
};

export function ContentSection({
  children,
  title,
  description,
  headerAlign = 'center',
  className,
  containerClassName,
  spacing = 'xl',
  background = 'default',
}: ContentSectionProps) {
  return (
    <section className={cn(
      spacingClasses[spacing],
      backgroundClasses[background],
      className
    )}>
      <MainContainer className={containerClassName}>
        {/* Header */}
        {(title || description) && (
          <div className={cn(
            'mb-12',
            alignClasses[headerAlign]
          )}>
            {title && (
              typeof title === 'string' ? (
                <h2 className="mb-4 text-gray-900 dark:text-gray-100">{title}</h2>
              ) : (
                title
              )
            )}

            {description && (
              typeof description === 'string' ? (
                <p className="text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              ) : (
                description
              )
            )}
          </div>
        )}

        {/* Content */}
        {children}
      </MainContainer>
    </section>
  );
}

