/**
 * Delete Modal Component
 * Confirmation modal for deleting a product
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, X } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  productName: string;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  productName,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-slate-800"
        >
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
            حذف المنتج؟
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-center mb-2">
            هل أنت متأكد من حذف المنتج:
          </p>
          <p className="text-gray-900 dark:text-white font-medium text-center mb-6">
            &quot;{productName}&quot;
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 text-center mb-6">
            لا يمكن التراجع عن هذا الإجراء
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

