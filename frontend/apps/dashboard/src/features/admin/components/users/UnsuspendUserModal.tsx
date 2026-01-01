'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle } from 'lucide-react';
import type { User, UnsuspendUserRequest } from '../../types/user.types';

interface UnsuspendUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: UnsuspendUserRequest) => void;
  isLoading?: boolean;
}

export default function UnsuspendUserModal({
  user,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: UnsuspendUserModalProps) {
  const [reason, setReason] = useState('');
  const [notifyUser, setNotifyUser] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onConfirm({
      reason: reason.trim(),
      notifyUser,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-green-600 dark:text-green-400">إلغاء تعليق المستخدم</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600 dark:text-green-400">
                سيتم إلغاء تعليق المستخدم وإعادة تفعيل حسابه بشكل كامل
              </p>
            </div>
          </div>

          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              المستخدم: <span className="font-bold text-gray-900 dark:text-white">{user.fullName}</span>
            </p>
            {user.suspensionReason && (
              <div className="mt-2 p-3 rounded-lg bg-gray-100 dark:bg-slate-800">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">سبب التعليق السابق:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{user.suspensionReason}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              سبب إلغاء التعليق <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-green-500 dark:focus:border-green-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all resize-none disabled:opacity-50"
              placeholder="اكتب سبب إلغاء التعليق..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notifyUser"
              checked={notifyUser}
              onChange={(e) => setNotifyUser(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
            />
            <label htmlFor="notifyUser" className="text-sm text-gray-700 dark:text-gray-300">
              إرسال إشعار للمستخدم
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري إلغاء التعليق...' : 'تأكيد إلغاء التعليق'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

