import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CommissionStatus } from '../../../../database/schemas/commission.schema';
import { CommissionRepository } from '../repositories/commission.repository';
import { WalletService } from '../../wallet/services/wallet.service';
import { PayoutDto } from '../dto/commission.dto';

/**
 * Service for commission payout operations
 * Handles store and courier earnings payouts
 */
@Injectable()
export class CommissionPayoutService {
  private readonly logger = new Logger(CommissionPayoutService.name);

  constructor(
    private readonly commissionRepo: CommissionRepository,
    private readonly walletService: WalletService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * صرف أرباح المتجر
   */
  async payoutStoreEarnings(
    dto: PayoutDto,
    performedBy: string,
    ipAddress?: string,
  ): Promise<{ paidAmount: number; transactionRef: string }> {
    const summary = await this.commissionRepo.getStoreSummary(dto.accountId);

    if (summary.pendingEarnings <= 0) {
      throw new BadRequestException('لا توجد أرباح معلقة');
    }

    const amountToPay = dto.amount || summary.pendingEarnings;

    if (amountToPay > summary.pendingEarnings) {
      throw new BadRequestException('المبلغ المطلوب أكبر من الأرباح المعلقة');
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      await this.walletService.addEarnings(
        dto.accountId,
        amountToPay,
        'payout',
        `Store earnings payout: ${dto.notes || ''}`,
        session,
      );

      const pendingCommissions = await this.commissionRepo.findByStoreAccountId(
        dto.accountId,
        CommissionStatus.COLLECTED,
      );

      let remainingAmount = amountToPay;
      for (const commission of pendingCommissions) {
        if (remainingAmount <= 0) break;
        if (commission.storeNetEarnings <= remainingAmount) {
          await this.commissionRepo.updateStatus(
            commission.id,
            CommissionStatus.PAID_OUT,
            session,
          );
          remainingAmount -= commission.storeNetEarnings;
        }
      }

      await session.commitTransaction();

      this.logger.log(`Paid out ${amountToPay} to store ${dto.accountId}`);

      return {
        paidAmount: amountToPay,
        transactionRef: `PAYOUT-${Date.now()}`,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * صرف أرباح السائق
   */
  async payoutCourierEarnings(
    dto: PayoutDto,
    performedBy: string,
    ipAddress?: string,
  ): Promise<{ paidAmount: number; transactionRef: string }> {
    const commissions = await this.commissionRepo.findByCourierAccountId(
      dto.accountId,
      CommissionStatus.COLLECTED,
    );

    const pendingEarnings = commissions.reduce(
      (sum, c) => sum + c.courierNetEarnings,
      0,
    );

    if (pendingEarnings <= 0) {
      throw new BadRequestException('لا توجد أرباح معلقة');
    }

    const amountToPay = dto.amount || pendingEarnings;

    if (amountToPay > pendingEarnings) {
      throw new BadRequestException('المبلغ المطلوب أكبر من الأرباح المعلقة');
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      await this.walletService.addEarnings(
        dto.accountId,
        amountToPay,
        'payout',
        `Courier earnings payout: ${dto.notes || ''}`,
        session,
      );

      await session.commitTransaction();

      this.logger.log(`Paid out ${amountToPay} to courier ${dto.accountId}`);

      return {
        paidAmount: amountToPay,
        transactionRef: `PAYOUT-${Date.now()}`,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
