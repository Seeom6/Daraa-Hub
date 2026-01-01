/**
 * Unauthorized Page
 * Shown when user tries to access a page they don't have permission for
 */

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold">غير مصرح</h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
          >
            العودة للرئيسية
          </Link>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}

