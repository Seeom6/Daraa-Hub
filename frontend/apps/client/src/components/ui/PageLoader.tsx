'use client';

/**
 * PageLoader Component
 * 
 * Full-page loading indicator
 */

import { Spinner } from './Spinner';

export interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'جاري التحميل...' }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        {message && (
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default PageLoader;

