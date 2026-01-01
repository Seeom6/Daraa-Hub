import { apiClient } from '@/lib/api-client';
import type { Wallet, TransactionsResponse, TopUpInput } from '@/features/shared/types/wallet.types';

const WALLET_BASE_URL = '/wallet';

export interface TransactionsFilters {
  page?: number;
  limit?: number;
}

export const walletService = {
  /**
   * Get wallet
   */
  getWallet: async (): Promise<Wallet> => {
    const response = await apiClient.get<{ wallet: Wallet }>(WALLET_BASE_URL);
    return response.data.wallet;
  },

  /**
   * Get transactions
   */
  getTransactions: async (filters?: TransactionsFilters): Promise<TransactionsResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<TransactionsResponse>(
      `${WALLET_BASE_URL}/transactions?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Top up wallet
   */
  topUp: async (input: TopUpInput): Promise<Wallet> => {
    const response = await apiClient.post<{ wallet: Wallet }>(
      `${WALLET_BASE_URL}/top-up`,
      input
    );
    return response.data.wallet;
  },
};

