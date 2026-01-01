/**
 * Step Navigation Component
 * Navigation buttons for multi-step form
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Save, Loader2 } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting = false,
}: StepNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="sticky bottom-0 left-0 right-0 mt-6 p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 rounded-t-2xl shadow-lg z-10"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all ${
            currentStep === 1
              ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
          }`}
        >
          <ArrowRight className="w-5 h-5" />
          <span className="hidden sm:inline">السابق</span>
        </button>

        <div className="flex-1 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentStep} / {totalSteps}
          </p>
        </div>

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
          >
            <span className="hidden sm:inline">التالي</span>
            <span className="sm:hidden">التالي</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg'
            } text-white`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="hidden sm:inline">جاري الحفظ...</span>
                <span className="sm:hidden">جاري...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span className="hidden sm:inline">حفظ المنتج</span>
                <span className="sm:hidden">حفظ</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

