import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { WalletDocument } from '../../../../database/schemas/wallet.schema';
import { TransactionType } from '../../../../database/schemas/wallet-transaction.schema';
import { WalletRepository } from '../repositories/wallet.repository';
import { WalletTransactionRepository } from '../repositories/wallet-transaction.repository';
import { AdjustBalanceDto } from '../dto/wallet.dto';

const getWalletId = (wallet: WalletDocument): string => {
  return (wallet._id as Types.ObjectId).toString();
};

/**
 * Service for admin wallet operations
 * Handles freeze, unfreeze, and balance adjustments
 */
@Injectable()
export class WalletAdminService {
  private readonly logger = new Logger(WalletAdminService.name);

  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly transactionRepository: WalletTransactionRepository,
  ) {}

  /**
   * Freeze wallet (Admin)
   */
  async freezeWallet(
    accountId: string,
    reason: string,
    frozenBy: string,
  ): Promise<WalletDocument> {
    const wallet = await this.walletRepository.findByAccountId(accountId);
    if (!wallet) {
      throw new NotFoundException('المحفظة غير موجودة');
    }

    const walletId = getWalletId(wallet);
    const frozen = await this.walletRepository.freezeWallet(
      walletId,
      reason,
      frozenBy,
    );

    this.logger.warn(
      `Wallet frozen for account ${accountId}. Reason: ${reason}`,
    );
    return frozen!;
  }

  /**
   * Unfreeze wallet (Admin)
   */
  async unfreezeWallet(accountId: string): Promise<WalletDocument> {
    const wallet = await this.walletRepository.findByAccountId(accountId);
    if (!wallet) {
      throw new NotFoundException('المحفظة غير موجودة');
    }

    const walletId = getWalletId(wallet);
    const unfrozen = await this.walletRepository.unfreezeWallet(walletId);
    this.logger.log(`Wallet unfrozen for account ${accountId}`);
    return unfrozen!;
  }

  /**
   * Adjust balance (Admin - for corrections)
   */
  async adjustBalance(
    dto: AdjustBalanceDto,
    performedBy: string,
    ipAddress?: string,
  ): Promise<WalletDocument> {
    const wallet = await this.walletRepository.getOrCreate(dto.accountId);
    const walletId = getWalletId(wallet);
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + dto.amount;

    if (balanceAfter < 0) {
      throw new BadRequestException('لا يمكن أن يصبح الرصيد سالباً');
    }

    if (dto.amount > 0) {
      await this.walletRepository.addBalance(walletId, dto.amount);
    } else {
      await this.walletRepository.deductBalance(walletId, Math.abs(dto.amount));
    }

    await this.transactionRepository.createTransaction({
      walletId,
      accountId: dto.accountId,
      type: TransactionType.ADJUSTMENT,
      amount: Math.abs(dto.amount),
      balanceBefore,
      balanceAfter,
      description: `Admin adjustment: ${dto.reason}`,
      descriptionAr: `تعديل إداري: ${dto.reason}`,
      performedBy,
      ipAddress,
    });

    this.logger.warn(
      `Balance adjusted for account ${dto.accountId}: ${dto.amount} by admin ${performedBy}`,
    );

    return this.walletRepository.findById(walletId) as Promise<WalletDocument>;
  }
}
