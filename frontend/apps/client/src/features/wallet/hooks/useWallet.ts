import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService, type TransactionsFilters } from '../services/wallet.service';
import type { TopUpInput } from '@/features/shared/types/wallet.types';
import { toast } from 'react-hot-toast';

const WALLET_QUERY_KEY = ['wallet'];
const TRANSACTIONS_QUERY_KEY = ['transactions'];

/**
 * Hook to get wallet
 */
export function useWallet() {
  return useQuery({
    queryKey: WALLET_QUERY_KEY,
    queryFn: () => walletService.getWallet(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get transactions
 */
export function useTransactions(filters?: TransactionsFilters) {
  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, filters],
    queryFn: () => walletService.getTransactions(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to top up wallet
 */
export function useTopUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TopUpInput) => walletService.topUp(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      toast.success('تم شحن المحفظة بنجاح');
    },
    onError: () => {
      toast.error('فشل شحن المحفظة');
    },
  });
}

