import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { WalletDocument } from '../../../../database/schemas/wallet.schema';
import { TransactionType } from '../../../../database/schemas/wallet-transaction.schema';
import { WalletRepository } from '../repositories/wallet.repository';
import { WalletTransactionRepository } from '../repositories/wallet-transaction.repository';
import { DepositDto, WithdrawRequestDto, TransferDto } from '../dto/wallet.dto';

const getWalletId = (wallet: WalletDocument): string => {
  return (wallet._id as Types.ObjectId).toString();
};

@Injectable()
export class WalletBalanceService {
  private readonly logger = new Logger(WalletBalanceService.name);

  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly transactionRepository: WalletTransactionRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async deposit(
    dto: DepositDto,
    performedBy: string,
    ipAddress?: string,
  ): Promise<WalletDocument> {
    const wallet = await this.walletRepository.getOrCreate(dto.accountId);
    if (wallet.isFrozen) throw new ForbiddenException('المحفظة مجمدة');

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const walletId = getWalletId(wallet);
      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + dto.amount;

      await this.walletRepository.addBalance(walletId, dto.amount, session);
      await this.walletRepository.updateStats(
        walletId,
        { deposited: dto.amount },
        session,
      );
      await this.transactionRepository.createTransaction(
        {
          walletId,
          accountId: dto.accountId,
          type: TransactionType.DEPOSIT,
          amount: dto.amount,
          balanceBefore,
          balanceAfter,
          description: dto.description || 'Wallet deposit',
          descriptionAr: dto.description || 'إيداع في المحفظة',
          metadata: dto.metadata,
          performedBy,
          ipAddress,
        },
        session,
      );

      await session.commitTransaction();
      this.logger.log(
        `Deposited ${dto.amount} to wallet of account ${dto.accountId}`,
      );
      return this.walletRepository.findById(
        walletId,
      ) as Promise<WalletDocument>;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(`Deposit failed: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async requestWithdrawal(
    accountId: string,
    dto: WithdrawRequestDto,
    ipAddress?: string,
  ): Promise<{ message: string; transactionRef: string }> {
    const wallet = await this.walletRepository.getOrCreate(accountId);
    if (wallet.isFrozen) throw new ForbiddenException('المحفظة مجمدة');
    if (wallet.balance < dto.amount)
      throw new BadRequestException('الرصيد غير كافٍ');

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const walletId = getWalletId(wallet);
      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore - dto.amount;

      const updated = await this.walletRepository.deductBalance(
        walletId,
        dto.amount,
        session,
      );
      if (!updated)
        throw new BadRequestException('فشل في خصم المبلغ - الرصيد غير كافٍ');
      await this.walletRepository.updateStats(
        walletId,
        { withdrawn: dto.amount },
        session,
      );

      const transaction = await this.transactionRepository.createTransaction(
        {
          walletId,
          accountId,
          type: TransactionType.WITHDRAWAL,
          amount: dto.amount,
          balanceBefore,
          balanceAfter,
          description: `Withdrawal request: ${dto.notes || ''}`,
          descriptionAr: `طلب سحب: ${dto.notes || ''}`,
          ipAddress,
        },
        session,
      );

      await session.commitTransaction();
      this.logger.log(
        `Withdrawal of ${dto.amount} requested for account ${accountId}`,
      );
      return {
        message: 'تم تقديم طلب السحب بنجاح',
        transactionRef: transaction.transactionRef!,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async transfer(
    fromAccountId: string,
    dto: TransferDto,
    ipAddress?: string,
  ): Promise<{ message: string; transactionRef: string }> {
    if (fromAccountId === dto.toAccountId)
      throw new BadRequestException('لا يمكن التحويل لنفس الحساب');

    const fromWallet = await this.walletRepository.getOrCreate(fromAccountId);
    const toWallet = await this.walletRepository.getOrCreate(dto.toAccountId);
    if (fromWallet.isFrozen) throw new ForbiddenException('محفظتك مجمدة');
    if (toWallet.isFrozen) throw new ForbiddenException('محفظة المستلم مجمدة');
    if (fromWallet.balance < dto.amount)
      throw new BadRequestException('الرصيد غير كافٍ');

    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const fromWalletId = getWalletId(fromWallet);
      const toWalletId = getWalletId(toWallet);

      await this.walletRepository.deductBalance(
        fromWalletId,
        dto.amount,
        session,
      );
      await this.walletRepository.addBalance(toWalletId, dto.amount, session);

      const outTransaction = await this.transactionRepository.createTransaction(
        {
          walletId: fromWalletId,
          accountId: fromAccountId,
          type: TransactionType.TRANSFER_OUT,
          amount: dto.amount,
          balanceBefore: fromWallet.balance,
          balanceAfter: fromWallet.balance - dto.amount,
          description: dto.description || 'Transfer to another wallet',
          descriptionAr: dto.description || 'تحويل لمحفظة أخرى',
          relatedAccountId: dto.toAccountId,
          ipAddress,
        },
        session,
      );

      await this.transactionRepository.createTransaction(
        {
          walletId: toWalletId,
          accountId: dto.toAccountId,
          type: TransactionType.TRANSFER_IN,
          amount: dto.amount,
          balanceBefore: toWallet.balance,
          balanceAfter: toWallet.balance + dto.amount,
          description: dto.description || 'Transfer received',
          descriptionAr: dto.description || 'تحويل وارد',
          relatedAccountId: fromAccountId,
          relatedTransactionId: (
            outTransaction._id as Types.ObjectId
          ).toString(),
          ipAddress,
        },
        session,
      );

      await session.commitTransaction();
      this.logger.log(
        `Transferred ${dto.amount} from ${fromAccountId} to ${dto.toAccountId}`,
      );
      return {
        message: 'تم التحويل بنجاح',
        transactionRef: outTransaction.transactionRef!,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
