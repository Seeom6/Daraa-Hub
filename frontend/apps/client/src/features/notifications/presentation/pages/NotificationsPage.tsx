'use client';

import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { NotificationItem, EmptyNotifications } from '@/features/notifications/components';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '@/features/notifications/hooks/useNotifications';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

type FilterType = 'all' | 'unread';

export function NotificationsPage() {
  const [filter, setFilter] = useState<FilterType>('all');

  const { data, isLoading, error } = useNotifications({
    isRead: filter === 'unread' ? false : undefined,
  });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage message="حدث خطأ أثناء تحميل الإشعارات" variant="card" />
      </div>
    );
  }

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Bell className="w-8 h-8" />
            الإشعارات
          </h1>
          <p className="text-white/60">
            {data?.total || 0} {data?.total === 1 ? 'إشعار' : 'إشعارات'}
            {unreadCount > 0 && ` • ${unreadCount} غير مقروء`}
          </p>
        </div>

        {/* Mark All as Read */}
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <CheckCheck className="w-5 h-5" />
            <span>تحديد الكل كمقروء</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-white/5 text-white/80 hover:bg-white/10'
          }`}
        >
          الكل ({data?.total || 0})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-primary text-white'
              : 'bg-white/5 text-white/80 hover:bg-white/10'
          }`}
        >
          غير مقروء ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyNotifications />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkRead={() => markAsRead.mutate(notification._id)}
                onDelete={() => {
                  if (confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
                    deleteNotification.mutate(notification._id);
                  }
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

