/**
 * User Details Header Component
 * Displays breadcrumbs, title, and action buttons
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Bell, ShieldOff, ShieldCheck, Ban } from 'lucide-react';
import type { User } from '../../types/user.types';

interface UserDetailsHeaderProps {
  user: User;
  onSuspend: () => void;
  onUnsuspend: () => void;
  onBan: () => void;
  onSendNotification: () => void;
}

export function UserDetailsHeader({
  user,
  onSuspend,
  onUnsuspend,
  onBan,
  onSendNotification,
}: UserDetailsHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 px-4 py-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <Link
          href="/admin/dashboard"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          لوحة التحكم
        </Link>
        <span>/</span>
        <Link
          href="/admin/users"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          المستخدمين
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">
          {user.fullName || 'غير محدد'}
        </span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              تفاصيل المستخدم
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              معلومات ونشاطات المستخدم
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={onSendNotification}
            className="px-4 py-2 rounded-xl border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            إرسال إشعار
          </button>

          {!user.isSuspended && (
            <button
              onClick={onSuspend}
              className="px-4 py-2 rounded-xl border border-yellow-300 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all flex items-center gap-2"
            >
              <ShieldOff className="w-4 h-4" />
              تعليق
            </button>
          )}

          {user.isSuspended && (
            <button
              onClick={onUnsuspend}
              className="px-4 py-2 rounded-xl border border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              إلغاء التعليق
            </button>
          )}

          {!user.isSuspended && (
            <button
              onClick={onBan}
              className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-2"
            >
              <Ban className="w-4 h-4" />
              حظر
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

