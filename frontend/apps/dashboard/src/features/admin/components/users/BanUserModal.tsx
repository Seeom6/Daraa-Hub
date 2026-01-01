'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';
import type { User, BanUserRequest } from '../../types/user.types';

interface BanUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: BanUserRequest) => void;
  isLoading?: boolean;
}

export default function BanUserModal({
  user,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: BanUserModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onConfirm({
      reason: reason.trim(),
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
          <h3 className="text-xl font-bold text-red-600 dark:text-red-400">حظر المستخدم</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">
                <strong>تحذير:</strong> الحظر إجراء دائم ولا يمكن التراجع عنه بسهولة. سيتم منع المستخدم من الوصول إلى النظام بشكل نهائي.
              </p>
            </div>
          </div>

          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              المستخدم: <span className="font-bold text-gray-900 dark:text-white">{user.fullName}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              الهاتف: {user.phone}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              سبب الحظر <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-red-500 dark:focus:border-red-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all resize-none disabled:opacity-50"
              placeholder="اكتب سبب الحظر..."
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              يجب توضيح سبب الحظر بشكل دقيق للرجوع إليه لاحقاً
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري الحظر...' : 'تأكيد الحظر'}
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

