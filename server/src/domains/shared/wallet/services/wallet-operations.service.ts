import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ClientSession, Types } from 'mongoose';
import { WalletDocument } from '../../../../database/schemas/wallet.schema';
import { TransactionType } from '../../../../database/schemas/wallet-transaction.schema';
import { WalletRepository } from '../repositories/wallet.repository';
import { WalletTransactionRepository } from '../repositories/wallet-transaction.repository';

const getWalletId = (wallet: WalletDocument): string => {
  return (wallet._id as Types.ObjectId).toString();
};

/**
 * Service for order-related wallet operations
 * Handles payments, refunds, and earnings
 */
@Injectable()
export class WalletOperationsService {
  private readonly logger = new Logger(WalletOperationsService.name);

  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly transactionRepository: WalletTransactionRepository,
  ) {}

  /**
   * Pay order from wallet
   */
  async payFromWallet(
    accountId: string,
    orderId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<boolean> {
    const wallet = await this.walletRepository.getOrCreate(accountId);

    if (wallet.isFrozen) {
      throw new ForbiddenException('المحفظة مجمدة');
    }

    if (wallet.balance < amount) {
      throw new BadRequestException('رصيد المحفظة غير كافٍ');
    }

    const walletId = getWalletId(wallet);
    const balanceBefore = wallet.balance;

    const updated = await this.walletRepository.deductBalance(
      walletId,
      amount,
      session,
    );

    if (!updated) {
      throw new BadRequestException('فشل في خصم المبلغ');
    }

    await this.walletRepository.updateStats(
      walletId,
      { spent: amount },
      session,
    );

    await this.transactionRepository.createTransaction(
      {
        walletId,
        accountId,
        type: TransactionType.PAYMENT,
        amount,
        balanceBefore,
        balanceAfter: balanceBefore - amount,
        description: `Payment for order`,
        descriptionAr: 'دفع طلب',
        orderId,
      },
      session,
    );

    this.logger.log(`Paid ${amount} from wallet for order ${orderId}`);
    return true;
  }

  /**
   * Refund to wallet
   */
  async refundToWallet(
    accountId: string,
    orderId: string,
    amount: number,
    reason: string,
    session?: ClientSession,
  ): Promise<boolean> {
    const wallet = await this.walletRepository.getOrCreate(accountId);
    const walletId = getWalletId(wallet);
    const balanceBefore = wallet.balance;

    await this.walletRepository.addBalance(walletId, amount, session);

    await this.transactionRepository.createTransaction(
      {
        walletId,
        accountId,
        type: TransactionType.REFUND,
        amount,
        balanceBefore,
        balanceAfter: balanceBefore + amount,
        description: `Refund: ${reason}`,
        descriptionAr: `استرداد: ${reason}`,
        orderId,
      },
      session,
    );

    this.logger.log(`Refunded ${amount} to wallet for order ${orderId}`);
    return true;
  }

  /**
   * Add earnings to wallet (for stores and couriers)
   */
  async addEarnings(
    accountId: string,
    amount: number,
    orderId: string,
    description: string,
    session?: ClientSession,
  ): Promise<boolean> {
    const wallet = await this.walletRepository.getOrCreate(accountId);
    const walletId = getWalletId(wallet);
    const balanceBefore = wallet.balance;

    await this.walletRepository.addBalance(walletId, amount, session);
    await this.walletRepository.updateStats(
      walletId,
      { earned: amount },
      session,
    );

    await this.transactionRepository.createTransaction(
      {
        walletId,
        accountId,
        type: TransactionType.EARNING,
        amount,
        balanceBefore,
        balanceAfter: balanceBefore + amount,
        description,
        descriptionAr: description,
        orderId,
      },
      session,
    );

    this.logger.log(
      `Added earnings ${amount} to wallet of account ${accountId}`,
    );
    return true;
  }
}
