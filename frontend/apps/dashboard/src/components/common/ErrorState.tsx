/**
 * ErrorState Component
 * Display error message with retry option
 */

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { AlertCircle } from 'lucide-react';

export interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'حدث خطأ',
  message,
  onRetry,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      {...props}
    >
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {message}
      </p>
      
      {onRetry && (
        <Button onClick={onRetry} variant="secondary">
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}

