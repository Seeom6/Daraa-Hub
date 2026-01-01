'use client';

import { Wallet, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export interface WalletBalanceProps {
  balance: number;
  currency?: string;
  onTopUp?: () => void;
}

export function WalletBalance({ balance, currency = 'ل.س', onTopUp }: WalletBalanceProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-sm border border-white/10 rounded-xl p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-white/60">رصيد المحفظة</p>
            <h2 className="text-3xl font-bold text-white">
              {balance.toLocaleString()} {currency}
            </h2>
          </div>
        </div>

        {onTopUp && (
          <button
            onClick={onTopUp}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            شحن المحفظة
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-xs text-white/60 mb-1">إجمالي الإيداعات</p>
          <p className="text-lg font-bold text-green-400">0 {currency}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-xs text-white/60 mb-1">إجمالي المصروفات</p>
          <p className="text-lg font-bold text-red-400">0 {currency}</p>
        </div>
      </div>
    </motion.div>
  );
}

