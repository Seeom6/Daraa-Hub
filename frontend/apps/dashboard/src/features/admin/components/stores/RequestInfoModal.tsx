'use client';

/**
 * Request Info Modal Component
 * Modal for requesting additional information from applicants
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { Modal, Button, Textarea } from '@/components/ui';

interface RequestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (requestedInfo: string, missingDocuments?: string[]) => void;
  isLoading?: boolean;
  applicantName?: string;
}

export function RequestInfoModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  applicantName,
}: RequestInfoModalProps) {
  const [requestedInfo, setRequestedInfo] = useState('');
  const [missingDocuments, setMissingDocuments] = useState<string[]>([]);
  const [error, setError] = useState('');

  const documentTypes = [
    { value: 'business_license', label: 'رخصة العمل' },
    { value: 'tax_id', label: 'الرقم الضريبي' },
    { value: 'national_id', label: 'الهوية الوطنية' },
    { value: 'commercial_register', label: 'السجل التجاري' },
    { value: 'other', label: 'مستندات أخرى' },
  ];

  const handleDocumentToggle = (value: string) => {
    setMissingDocuments((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  const handleConfirm = () => {
    if (!requestedInfo.trim()) {
      setError('يرجى إدخال المعلومات المطلوبة');
      return;
    }
    onConfirm(requestedInfo, missingDocuments.length > 0 ? missingDocuments : undefined);
    setRequestedInfo('');
    setMissingDocuments([]);
    setError('');
  };

  const handleClose = () => {
    if (!isLoading) {
      setRequestedInfo('');
      setMissingDocuments([]);
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">طلب معلومات إضافية</h2>
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
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              طلب معلومات إضافية من{' '}
              <span className="font-semibold">{applicantName || 'المستخدم'}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المعلومات المطلوبة <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={requestedInfo}
              onChange={(e) => {
                setRequestedInfo(e.target.value);
                setError('');
              }}
              placeholder="اذكر المعلومات أو التوضيحات المطلوبة بشكل واضح..."
              rows={4}
              disabled={isLoading}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المستندات الناقصة (اختياري)
            </label>
            <div className="space-y-2">
              {documentTypes.map((doc) => (
                <label
                  key={doc.value}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={missingDocuments.includes(doc.value)}
                    onChange={() => handleDocumentToggle(doc.value)}
                    disabled={isLoading}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{doc.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>ملاحظة:</strong> سيتم إرسال إشعار للمستخدم بالمعلومات المطلوبة وسيتمكن من
              تحديث طلبه.
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
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الإرسال...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                إرسال الطلب
              </div>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

