/**
 * 404 Not Found Page
 */

import Link from 'next/link';
import { FileQuestion, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          <FileQuestion className="w-20 h-20 text-gray-400 mx-auto" />
        </div>

        {/* 404 */}
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          الصفحة غير موجودة
        </h2>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>العودة للرئيسية</span>
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Search className="w-5 h-5" />
            <span>تصفح المنتجات</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

