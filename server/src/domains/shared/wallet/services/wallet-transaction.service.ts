import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  WalletTransactionDocument,
  TransactionType,
  TransactionStatus,
} from '../../../../database/schemas/wallet-transaction.schema';
import { WalletRepository } from '../repositories/wallet.repository';
import { WalletTransactionRepository } from '../repositories/wallet-transaction.repository';
import { TransactionFilterDto } from '../dto/wallet.dto';

@Injectable()
export class WalletTransactionService {
  private readonly logger = new Logger(WalletTransactionService.name);

  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly transactionRepository: WalletTransactionRepository,
  ) {}

  /**
   * Get transactions for account
   */
  async getTransactions(
    accountId: string,
    filterDto: TransactionFilterDto,
  ): Promise<{
    data: WalletTransactionDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { data, total } = await this.transactionRepository.findByAccountId(
      accountId,
      {
        type: filterDto.type,
        startDate: filterDto.startDate
          ? new Date(filterDto.startDate)
          : undefined,
        endDate: filterDto.endDate ? new Date(filterDto.endDate) : undefined,
        page: filterDto.page || 1,
        limit: filterDto.limit || 20,
      },
    );

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(
    transactionId: string,
  ): Promise<WalletTransactionDocument> {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException('المعاملة غير موجودة');
    }
    return transaction;
  }

  /**
   * Get transaction by reference
   */
  async getTransactionByRef(
    transactionRef: string,
  ): Promise<WalletTransactionDocument> {
    const transaction =
      await this.transactionRepository.findByRef(transactionRef);
    if (!transaction) {
      throw new NotFoundException('المعاملة غير موجودة');
    }
    return transaction;
  }

  /**
   * Get transactions for order
   */
  async getOrderTransactions(
    orderId: string,
  ): Promise<WalletTransactionDocument[]> {
    return this.transactionRepository.findByOrderId(orderId);
  }

  /**
   * Get transaction summary
   */
  async getTransactionSummary(
    accountId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    totalPayments: number;
    totalRefunds: number;
    totalEarnings: number;
    netBalance: number;
  }> {
    const summary = await this.transactionRepository.getSummary(
      accountId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    const netBalance =
      summary.totalDeposits +
      summary.totalRefunds +
      summary.totalEarnings -
      summary.totalWithdrawals -
      summary.totalPayments;

    return {
      ...summary,
      netBalance,
    };
  }

  /**
   * Get wallet statistics (Admin)
   */
  async getWalletStats(): Promise<{
    totalWallets: number;
    totalBalance: number;
    frozenWallets: number;
    averageBalance: number;
  }> {
    const wallets = await this.walletRepository.find({ isActive: true });

    const totalWallets = wallets.length;
    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
    const frozenWallets = wallets.filter((w) => w.isFrozen).length;
    const averageBalance = totalWallets > 0 ? totalBalance / totalWallets : 0;

    return {
      totalWallets,
      totalBalance,
      frozenWallets,
      averageBalance: Math.round(averageBalance),
    };
  }
}
