/**
 * User Activity Tab Component
 * Displays user activity log
 */

'use client';

import { Clock, ShoppingCart, Star, User, LogIn, LogOut, MapPin, Heart, ShoppingBag } from 'lucide-react';
import type { UserActivity, ActivityType } from '../../types/user-details.types';

interface UserActivityTabProps {
  activities: UserActivity[];
  isLoading?: boolean;
}

const activityIcons: Record<string, any> = {
  login: LogIn,
  logout: LogOut,
  order_created: ShoppingCart,
  order_cancelled: ShoppingBag,
  review_added: Star,
  profile_updated: User,
  password_changed: User,
  address_added: MapPin,
  address_updated: MapPin,
  wishlist_added: Heart,
  cart_updated: ShoppingCart,
};

const activityColors: Record<string, string> = {
  login: 'text-green-500',
  logout: 'text-gray-500',
  order_created: 'text-blue-500',
  order_cancelled: 'text-red-500',
  review_added: 'text-yellow-500',
  profile_updated: 'text-purple-500',
  password_changed: 'text-orange-500',
  address_added: 'text-cyan-500',
  address_updated: 'text-cyan-500',
  wishlist_added: 'text-pink-500',
  cart_updated: 'text-indigo-500',
};

export function UserActivityTab({ activities, isLoading }: UserActivityTabProps) {
  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 animate-pulse"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-slate-700" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2 w-1/3" />
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">لا يوجد نشاطات مسجلة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          سجل النشاط ({activities.length})
        </h3>
        <button className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-sm">
          تصدير السجل
        </button>
      </div>

      {activities.map((activity) => {
        const Icon = activityIcons[activity.type] || User;
        const color = activityColors[activity.type] || 'text-gray-500';

        return (
          <div
            key={activity._id}
            className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white mb-1">
                {activity.action}
              </p>
              {activity.details && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.details}
                </p>
              )}
              {activity.ipAddress && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
                  IP: {activity.ipAddress}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
              <Clock className="w-4 h-4" />
              {formatDateTime(activity.timestamp)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

