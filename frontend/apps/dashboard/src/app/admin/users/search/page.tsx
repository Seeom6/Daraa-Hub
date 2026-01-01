'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Eye, ArrowRight } from 'lucide-react';
import { useSearchUsers } from '@/features/admin/hooks/useUsers';
import { USER_ROLE_LABELS, USER_ROLE_COLORS } from '@/features/admin/types/user.types';

export default function UsersSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Debounce for 500ms
    const timer = setTimeout(() => {
      setDebouncedQuery(value);
    }, 500);

    return () => clearTimeout(timer);
  };

  const { data, isLoading, error } = useSearchUsers(
    { q: debouncedQuery },
    debouncedQuery.length >= 2
  );

  const users = data?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          العودة إلى قائمة المستخدمين
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            البحث عن مستخدم
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ابحث عن المستخدمين بالاسم، رقم الهاتف، أو البريد الإلكتروني
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الهاتف، أو البريد الإلكتروني..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pr-14 pl-4 py-4 rounded-xl bg-gray-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all text-lg"
              autoFocus
            />
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
            أدخل على الأقل حرفين للبدء في البحث
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">جاري البحث...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-center">
            <p className="text-red-600 dark:text-red-400">
              حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && debouncedQuery.length >= 2 && (
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            {users.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  لم يتم العثور على نتائج لـ &quot;{debouncedQuery}&quot;
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    تم العثور على {users.length} نتيجة
                  </p>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {users.map((user) => (
                    <Link
                      key={user._id}
                      href={`/admin/users/${user._id}`}
                      className="block p-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                            {user.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                              {user.fullName || 'غير محدد'}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-mono">{user.phone}</span>
                              {user.email && (
                                <>
                                  <span>•</span>
                                  <span>{user.email}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${USER_ROLE_COLORS[user.role]}`}>
                            {USER_ROLE_LABELS[user.role]}
                          </span>
                          <Eye className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && debouncedQuery.length < 2 && (
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              ابدأ بكتابة اسم المستخدم أو رقم الهاتف للبحث
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

