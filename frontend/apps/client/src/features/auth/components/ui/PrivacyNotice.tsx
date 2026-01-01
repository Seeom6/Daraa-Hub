'use client';

import { motion } from 'motion/react';

/**
 * PrivacyNotice Component
 * 
 * Privacy notice for auth pages
 */

interface PrivacyNoticeProps {
  text: string;
  delay?: number;
}

export function PrivacyNotice({ text, delay = 0.9 }: PrivacyNoticeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className="mt-6 text-center"
    >
      <p className="text-xs text-gray-500 dark:text-gray-500">
        {text}{' '}
        <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
          الشروط والأحكام
        </span>{' '}
        و{' '}
        <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
          سياسة الخصوصية
        </span>
      </p>
    </motion.div>
  );
}

