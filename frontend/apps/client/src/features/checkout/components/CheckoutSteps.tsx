'use client';

import { MapPin, Truck, CreditCard, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { CheckoutStep } from '../types/checkout.types';

export interface CheckoutStepsProps {
  currentStep: CheckoutStep;
}

const steps = [
  { id: CheckoutStep.ADDRESS, title: 'العنوان', icon: MapPin },
  { id: CheckoutStep.SHIPPING, title: 'الشحن', icon: Truck },
  { id: CheckoutStep.PAYMENT, title: 'الدفع', icon: CreditCard },
  { id: CheckoutStep.REVIEW, title: 'المراجعة', icon: CheckCircle },
];

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isCompleted
                      ? 'rgb(34, 197, 94)'
                      : isActive
                      ? 'rgb(59, 130, 246)'
                      : 'rgba(255, 255, 255, 0.1)',
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isCompleted || isActive ? 'text-white' : 'text-white/40'
                    }`}
                  />
                </motion.div>

                <span
                  className={`text-sm font-medium ${
                    isActive ? 'text-white' : 'text-white/60'
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-white/10 relative overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-green-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

