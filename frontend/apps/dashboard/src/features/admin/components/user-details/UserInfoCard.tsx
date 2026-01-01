/**
 * User Info Card Component
 * Displays user basic information
 */

'use client';

import { motion } from 'motion/react';
import { Phone, Mail, Calendar, Clock, MapPin } from 'lucide-react';
import type { User } from '../../types/user.types';
import { USER_ROLE_LABELS, USER_ROLE_COLORS, USER_STATUS_LABELS, USER_STATUS_COLORS } from '../../types/user.types';

interface UserInfoCardProps {
  user: User;
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'غير محدد';
    return new Date(date).toLocaleDateString('ar-SA-u-nu-latn', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return 'غير محدد';
    return new Date(date).toLocaleString('ar-SA-u-nu-latn', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-6"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
          {user.fullName?.charAt(0) || 'U'}
        </div>

        {/* User Details */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {user.fullName || 'غير محدد'}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${USER_ROLE_COLORS[user.role]}`}>
                  {USER_ROLE_LABELS[user.role]}
                </span>
                <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${
                  user.isSuspended 
                    ? USER_STATUS_COLORS.suspended 
                    : user.isActive 
                    ? USER_STATUS_COLORS.active 
                    : USER_STATUS_COLORS.banned
                }`}>
                  {user.isSuspended 
                    ? USER_STATUS_LABELS.suspended 
                    : user.isActive 
                    ? USER_STATUS_LABELS.active 
                    : USER_STATUS_LABELS.banned
                  }
                </span>
                {user.isVerified && (
                  <span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    ✓ موثق
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">رقم الهاتف</p>
                <p className="font-medium text-gray-900 dark:text-white">{user.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">البريد الإلكتروني</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {user.email || 'غير محدد'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">تاريخ الانضمام</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">آخر تسجيل دخول</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {formatDateTime(user.lastLoginAt)}
                </p>
              </div>
            </div>

            {user.lastLoginIp && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">آخر IP</p>
                  <p className="font-medium text-gray-900 dark:text-white text-sm font-mono">
                    {user.lastLoginIp}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Suspension Info */}
          {user.isSuspended && user.suspensionReason && (
            <div className="mt-4 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-1">
                سبب التعليق:
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-500">
                {user.suspensionReason}
              </p>
              {user.suspensionExpiresAt && (
                <p className="text-xs text-yellow-600 dark:text-yellow-600 mt-2">
                  ينتهي في: {formatDateTime(user.suspensionExpiresAt)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

