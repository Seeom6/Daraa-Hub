/**
 * Success Message Component
 * Shows success notification after product creation
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface SuccessMessageProps {
  show: boolean;
}

export function SuccessMessage({ show }: SuccessMessageProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              تم إنشاء المنتج بنجاح!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              جاري تحويلك إلى قائمة المنتجات...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

