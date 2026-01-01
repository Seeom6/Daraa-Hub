'use client';

import { Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { NotificationIcon } from './NotificationIcon';
import type { Notification } from '../types/notifications.types';

export interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  onMarkRead?: () => void;
  onDelete?: () => void;
  variant?: 'default' | 'compact';
}

export function NotificationItem({
  notification,
  onClick,
  onMarkRead,
  onDelete,
  variant = 'default',
}: NotificationItemProps) {
  const timeAgo = getTimeAgo(notification.createdAt);

  const handleClick = () => {
    if (!notification.isRead && onMarkRead) {
      onMarkRead();
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      onClick={handleClick}
      className={`
        relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4
        hover:bg-white/10 transition-colors cursor-pointer
        ${!notification.isRead ? 'border-r-4 border-r-primary' : ''}
      `}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <NotificationIcon type={notification.type} className="w-5 h-5" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-white font-medium line-clamp-1">{notification.title}</h4>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
            )}
          </div>

          <p className="text-white/70 text-sm mb-2 line-clamp-2">{notification.message}</p>

          <div className="flex items-center justify-between">
            <span className="text-white/50 text-xs">{timeAgo}</span>

            {/* Delete Button */}
            {onDelete && variant === 'default' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 text-white/60 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'الآن';
  if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
  if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
  if (seconds < 604800) return `منذ ${Math.floor(seconds / 86400)} يوم`;
  if (seconds < 2592000) return `منذ ${Math.floor(seconds / 604800)} أسبوع`;
  return `منذ ${Math.floor(seconds / 2592000)} شهر`;
}

