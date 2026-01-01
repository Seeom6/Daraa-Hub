'use client';

import { useState } from 'react';
import { Wallet, Receipt } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { WalletBalance, TransactionItem } from '@/features/wallet/components';
import { useWallet, useTransactions } from '@/features/wallet/hooks/useWallet';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export function WalletPage() {
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const { data: wallet, isLoading: walletLoading, error: walletError } = useWallet();
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useTransactions();

  if (walletLoading || transactionsLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (walletError || transactionsError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage message="حدث خطأ أثناء تحميل المحفظة" variant="card" />
      </div>
    );
  }

  const transactions = transactionsData?.transactions || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Wallet className="w-8 h-8" />
          محفظتي
        </h1>
      </div>

      {/* Balance Card */}
      <div className="mb-8">
        <WalletBalance
          balance={wallet?.balance || 0}
          onTopUp={() => setShowTopUpModal(true)}
        />
      </div>

      {/* Transactions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Receipt className="w-6 h-6" />
          المعاملات الأخيرة
        </h2>

        {transactions.length === 0 ? (
          <div className="text-center py-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <Receipt className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">لا توجد معاملات</h3>
            <p className="text-white/60">لم تقم بأي معاملات بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {transactions.map((transaction) => (
                <TransactionItem key={transaction._id} transaction={transaction} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">شحن المحفظة</h3>
            <p className="text-white/60 mb-6">هذه الميزة قيد التطوير</p>
            <button
              onClick={() => setShowTopUpModal(false)}
              className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

