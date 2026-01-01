/**
 * Step Progress Component
 * Shows progress through the multi-step form
 */

'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { ProductStep } from '@/features/products/types';

interface StepProgressProps {
  steps: ProductStep[];
  currentStep: number;
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <>
      {/* Desktop Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="hidden lg:block mb-8"
      >
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110'
                          : isCompleted
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
                    </div>
                    <p
                      className={`mt-2 text-sm font-medium transition-colors ${
                        isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-4 rounded-full transition-colors ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-800'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Mobile Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:hidden mb-6"
      >
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;

              if (!isActive) return null;

              return (
                <div key={step.id} className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <StepIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{step.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      الخطوة {step.id} من {steps.length}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}

