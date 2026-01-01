'use client';

import { Banknote, Wallet, CreditCard, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { PaymentMethod } from '@/features/shared/types/order.types';
import type { PaymentMethodOption } from '../types/checkout.types';

export interface PaymentMethodsProps {
  selected?: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: PaymentMethod.COD,
    name: 'الدفع عند الاستلام',
    description: 'ادفع نقداً عند استلام الطلب',
    icon: 'banknote',
    enabled: true,
  },
  {
    id: PaymentMethod.WALLET,
    name: 'المحفظة الإلكترونية',
    description: 'ادفع من رصيد محفظتك',
    icon: 'wallet',
    enabled: true,
  },
  {
    id: PaymentMethod.CREDIT_CARD,
    name: 'بطاقة الائتمان',
    description: 'ادفع ببطاقة الائتمان أو الخصم',
    icon: 'credit-card',
    enabled: false, // Not implemented yet
  },
];

const iconMap = {
  banknote: Banknote,
  wallet: Wallet,
  'credit-card': CreditCard,
};

export function PaymentMethods({ selected, onSelect }: PaymentMethodsProps) {
  return (
    <div className="space-y-3">
      {paymentMethods.map((method) => {
        const Icon = iconMap[method.icon as keyof typeof iconMap];
        const isSelected = selected === method.id;

        return (
          <motion.button
            key={method.id}
            onClick={() => method.enabled && onSelect(method.id)}
            disabled={!method.enabled}
            whileHover={method.enabled ? { scale: 1.02 } : {}}
            whileTap={method.enabled ? { scale: 0.98 } : {}}
            className={`w-full p-4 rounded-xl border transition-all text-right ${
              isSelected
                ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                : method.enabled
                ? 'bg-white/5 border-white/10 hover:border-white/20'
                : 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-primary/20' : 'bg-white/10'
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-white/60'}`}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-white">{method.name}</h4>
                  {isSelected && <Check className="w-5 h-5 text-primary" />}
                </div>
                <p className="text-sm text-white/60">{method.description}</p>
                {!method.enabled && (
                  <p className="text-xs text-yellow-400 mt-1">قريباً</p>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

