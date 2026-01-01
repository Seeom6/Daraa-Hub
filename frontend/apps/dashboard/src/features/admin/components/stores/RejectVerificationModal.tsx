'use client';

/**
 * Reject Verification Modal Component
 * Modal for rejecting verification requests
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, X } from 'lucide-react';
import { Modal, Button, Textarea } from '@/components/ui';

interface RejectVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  applicantName?: string;
}

export function RejectVerificationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  applicantName,
}: RejectVerificationModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('يرجى إدخال سبب الرفض');
      return;
    }
    onConfirm(reason);
    setReason('');
    setError('');
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-rose-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">رفض الطلب</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              هل أنت متأكد من رفض طلب التوثيق المقدم من{' '}
              <span className="font-semibold">{applicantName || 'المستخدم'}</span>؟
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              سبب الرفض <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="اذكر سبب رفض الطلب بشكل واضح..."
              rows={4}
              disabled={isLoading}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>تنبيه:</strong> سيتم إرسال إشعار للمستخدم برفض طلبه مع السبب المذكور.
              يمكن للمستخدم تقديم طلب جديد بعد تصحيح الأخطاء.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الرفض...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                تأكيد الرفض
              </div>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

