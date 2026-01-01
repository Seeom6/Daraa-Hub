'use client';

import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

/**
 * PasswordStrength Component
 * 
 * Shows password requirements with visual feedback
 */

interface PasswordStrengthProps {
  password: string;
  delay?: number;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  { label: '8 أحرف على الأقل', test: (p) => p.length >= 8 },
  { label: 'حرف كبير', test: (p) => /[A-Z]/.test(p) },
  { label: 'حرف صغير', test: (p) => /[a-z]/.test(p) },
  { label: 'رقم واحد', test: (p) => /[0-9]/.test(p) },
];

export function PasswordStrength({ password, delay = 0.9 }: PasswordStrengthProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4"
    >
      <p className="text-xs text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" />
        متطلبات كلمة السر:
      </p>
      <div className="grid grid-cols-2 gap-2">
        {requirements.map((req, index) => {
          const isValid = req.test(password);
          return (
            <div key={index} className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isValid
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}
              >
                ✓
              </span>
              <span
                className={`text-xs ${
                  isValid
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500'
                }`}
              >
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

