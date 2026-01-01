'use client';

import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import type { Transaction, TransactionType, TransactionStatus } from '@/features/shared/types/wallet.types';

export interface TransactionItemProps {
  transaction: Transaction;
}

const typeConfig = {
  credit: {
    icon: ArrowDownLeft,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    sign: '+',
  },
  debit: {
    icon: ArrowUpRight,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    sign: '-',
  },
};

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'قيد الانتظار',
    color: 'text-yellow-400',
  },
  completed: {
    icon: CheckCircle,
    label: 'مكتمل',
    color: 'text-green-400',
  },
  failed: {
    icon: XCircle,
    label: 'فشل',
    color: 'text-red-400',
  },
};

export function TransactionItem({ transaction }: TransactionItemProps) {
  const typeConf = typeConfig[transaction.type as keyof typeof typeConfig];
  const statusConf = statusConfig[transaction.status as keyof typeof statusConfig];
  const TypeIcon = typeConf.icon;
  const StatusIcon = statusConf.icon;

  const transactionDate = new Date(transaction.createdAt).toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:border-white/20 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${typeConf.bgColor} rounded-full flex items-center justify-center`}>
          <TypeIcon className={`w-6 h-6 ${typeConf.color}`} />
        </div>

        <div>
          <h4 className="text-white font-medium mb-1">{transaction.description}</h4>
          <div className="flex items-center gap-2">
            <p className="text-sm text-white/60">{transactionDate}</p>
            <span className="text-white/40">•</span>
            <div className={`flex items-center gap-1 text-xs ${statusConf.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusConf.label}
            </div>
          </div>
        </div>
      </div>

      <div className={`text-lg font-bold ${typeConf.color}`}>
        {typeConf.sign}
        {transaction.amount.toLocaleString()} ل.س
      </div>
    </motion.div>
  );
}

