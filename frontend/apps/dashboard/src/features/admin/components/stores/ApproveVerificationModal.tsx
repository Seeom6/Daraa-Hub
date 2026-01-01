'use client';

/**
 * Approve Verification Modal Component
 * Modal for approving verification requests
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { Modal, Button, Textarea } from '@/components/ui';

interface ApproveVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  isLoading?: boolean;
  applicantName?: string;
}

export function ApproveVerificationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  applicantName,
}: ApproveVerificationModalProps) {
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm(notes || undefined);
    setNotes('');
  };

  const handleClose = () => {
    if (!isLoading) {
      setNotes('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">الموافقة على الطلب</h2>
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
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              هل أنت متأكد من الموافقة على طلب التوثيق المقدم من{' '}
              <span className="font-semibold">{applicantName || 'المستخدم'}</span>؟
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ملاحظات (اختياري)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أضف أي ملاحظات إضافية..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>ملاحظة:</strong> سيتم إرسال إشعار للمستخدم بالموافقة على طلبه وسيتمكن من
              البدء في استخدام المنصة.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الموافقة...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                تأكيد الموافقة
              </div>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

