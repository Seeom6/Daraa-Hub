'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationBadge } from './NotificationBadge';
import { NotificationItem } from './NotificationItem';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { Spinner } from '@/components/ui/Spinner';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: unreadCountData } = useUnreadCount();
  const { data, isLoading } = useNotifications({ limit: 5 });
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = unreadCountData || 0;
  const notifications = data?.notifications || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/80 hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        <NotificationBadge count={unreadCount} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-96 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-bold">الإشعارات</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isPending}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>تحديد الكل</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="md" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-white/40 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      variant="compact"
                      onMarkRead={() => markAsRead.mutate(notification._id)}
                      onClick={() => setIsOpen(false)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-white/10">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  عرض كل الإشعارات
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

