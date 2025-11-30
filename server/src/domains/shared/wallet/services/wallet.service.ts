import { Injectable, Logger } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { WalletDocument } from '../../../../database/schemas/wallet.schema';
import { WalletRepository } from '../repositories/wallet.repository';
import { WalletBalanceService } from './wallet-balance.service';
import { WalletOperationsService } from './wallet-operations.service';
import { WalletAdminService } from './wallet-admin.service';
import {
  DepositDto,
  WithdrawRequestDto,
  TransferDto,
  AdjustBalanceDto,
} from '../dto/wallet.dto';

/**
 * Wallet Service - Facade Pattern
 * Delegates operations to specialized services
 */
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly balanceService: WalletBalanceService,
    private readonly operationsService: WalletOperationsService,
    private readonly adminService: WalletAdminService,
  ) {}

  /**
   * Get or create wallet for account
   */
  async getWallet(accountId: string): Promise<WalletDocument> {
    return this.walletRepository.getOrCreate(accountId);
  }

  /**
   * Get wallet balance
   */
  async getBalance(accountId: string): Promise<{
    balance: number;
    pendingBalance: number;
    currency: string;
  }> {
    const wallet = await this.walletRepository.getOrCreate(accountId);
    return {
      balance: wallet.balance,
      pendingBalance: wallet.pendingBalance,
      currency: wallet.currency,
    };
  }

  // ===== Balance Operations (delegated to WalletBalanceService) =====

  async deposit(
    dto: DepositDto,
    performedBy: string,
    ipAddress?: string,
  ): Promise<WalletDocument> {
    return this.balanceService.deposit(dto, performedBy, ipAddress);
  }

  async requestWithdrawal(
    accountId: string,
    dto: WithdrawRequestDto,
    ipAddress?: string,
  ): Promise<{ message: string; transactionRef: string }> {
    return this.balanceService.requestWithdrawal(accountId, dto, ipAddress);
  }

  async transfer(
    fromAccountId: string,
    dto: TransferDto,
    ipAddress?: string,
  ): Promise<{ message: string; transactionRef: string }> {
    return this.balanceService.transfer(fromAccountId, dto, ipAddress);
  }

  // ===== Order Operations (delegated to WalletOperationsService) =====

  async payFromWallet(
    accountId: string,
    orderId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<boolean> {
    return this.operationsService.payFromWallet(
      accountId,
      orderId,
      amount,
      session,
    );
  }

  async refundToWallet(
    accountId: string,
    orderId: string,
    amount: number,
    reason: string,
    session?: ClientSession,
  ): Promise<boolean> {
    return this.operationsService.refundToWallet(
      accountId,
      orderId,
      amount,
      reason,
      session,
    );
  }

  async addEarnings(
    accountId: string,
    amount: number,
    orderId: string,
    description: string,
    session?: ClientSession,
  ): Promise<boolean> {
    return this.operationsService.addEarnings(
      accountId,
      amount,
      orderId,
      description,
      session,
    );
  }

  // ===== Admin Operations (delegated to WalletAdminService) =====

  async freezeWallet(
    accountId: string,
    reason: string,
    frozenBy: string,
  ): Promise<WalletDocument> {
    return this.adminService.freezeWallet(accountId, reason, frozenBy);
  }

  async unfreezeWallet(accountId: string): Promise<WalletDocument> {
    return this.adminService.unfreezeWallet(accountId);
  }

  async adjustBalance(
    dto: AdjustBalanceDto,
    performedBy: string,
    ipAddress?: string,
  ): Promise<WalletDocument> {
    return this.adminService.adjustBalance(dto, performedBy, ipAddress);
  }
}
