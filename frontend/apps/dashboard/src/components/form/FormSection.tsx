/**
 * FormSection Component
 * Section wrapper for grouping form fields
 */

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface FormSectionProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const FormSection = forwardRef<HTMLDivElement, FormSectionProps>(
  (
    {
      children,
      title,
      description,
      icon,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-6', className)}
        {...props}
      >
        {(title || description) && (
          <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-slate-700">
            {icon && (
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                {icon}
              </div>
            )}
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {children}
        </div>
      </div>
    );
  }
);

FormSection.displayName = 'FormSection';

