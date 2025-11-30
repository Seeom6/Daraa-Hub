import { Injectable, Logger } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import {
  CommissionDocument,
  CommissionStatus,
} from '../../../../database/schemas/commission.schema';
import { CommissionConfigDocument } from '../../../../database/schemas/commission-config.schema';
import {
  CalculateCommissionDto,
  CreateCommissionConfigDto,
  UpdateCommissionConfigDto,
  PayoutDto,
} from '../dto/commission.dto';
import { CommissionCalculationService } from './commission-calculation.service';
import { CommissionPayoutService } from './commission-payout.service';
import { CommissionQueryService } from './commission-query.service';

/**
 * Commission Service - Facade Pattern
 * Delegates operations to specialized services
 */
@Injectable()
export class CommissionService {
  private readonly logger = new Logger(CommissionService.name);

  constructor(
    private readonly calculationService: CommissionCalculationService,
    private readonly payoutService: CommissionPayoutService,
    private readonly queryService: CommissionQueryService,
  ) {}

  // ===== Calculation Operations (delegated to CommissionCalculationService) =====

  async calculateAndCreateCommission(
    dto: CalculateCommissionDto,
    session?: ClientSession,
  ): Promise<CommissionDocument> {
    return this.calculationService.calculateAndCreateCommission(dto, session);
  }

  async calculateOrderCommission(
    orderId: string,
    storeAccountId: string,
    orderAmount: number,
    deliveryFee: number,
    courierAccountId?: string,
  ): Promise<
    CommissionDocument & {
      storeEarnings: number;
      courierEarnings: number;
      platformFee: number;
    }
  > {
    const commission =
      await this.calculationService.calculateAndCreateCommission({
        orderId,
        storeAccountId,
        courierAccountId,
        orderAmount,
        deliveryFee,
      });

    await this.calculationService.collectCommission(orderId);

    return {
      ...commission.toObject(),
      storeEarnings: commission.storeNetEarnings,
      courierEarnings: commission.courierNetEarnings,
      platformFee: commission.platformNetEarnings,
    };
  }

  async collectCommission(
    orderId: string,
    session?: ClientSession,
  ): Promise<CommissionDocument> {
    return this.calculationService.collectCommission(orderId, session);
  }

  async cancelCommission(orderId: string): Promise<CommissionDocument | null> {
    return this.calculationService.cancelCommission(orderId);
  }

  // ===== Payout Operations (delegated to CommissionPayoutService) =====

  async payoutStoreEarnings(
    dto: PayoutDto,
    performedBy: string,
    ipAddress?: string,
  ): Promise<{ paidAmount: number; transactionRef: string }> {
    return this.payoutService.payoutStoreEarnings(dto, performedBy, ipAddress);
  }

  async payoutCourierEarnings(
    dto: PayoutDto,
    performedBy: string,
    ipAddress?: string,
  ): Promise<{ paidAmount: number; transactionRef: string }> {
    return this.payoutService.payoutCourierEarnings(
      dto,
      performedBy,
      ipAddress,
    );
  }

  // ===== Query Operations (delegated to CommissionQueryService) =====

  async getCommissionByOrderId(
    orderId: string,
  ): Promise<CommissionDocument | null> {
    return this.queryService.getCommissionByOrderId(orderId);
  }

  async getStoreCommissions(
    storeAccountId: string,
    status?: CommissionStatus,
    page = 1,
    limit = 20,
  ) {
    return this.queryService.getStoreCommissions(
      storeAccountId,
      status,
      page,
      limit,
    );
  }

  async getStoreSummary(
    storeAccountId: string,
    startDate?: string,
    endDate?: string,
  ) {
    return this.queryService.getStoreSummary(
      storeAccountId,
      startDate,
      endDate,
    );
  }

  async getPlatformSummary(startDate?: string, endDate?: string) {
    return this.queryService.getPlatformSummary(startDate, endDate);
  }

  // ===== Config Operations (delegated to CommissionQueryService) =====

  async createConfig(
    dto: CreateCommissionConfigDto,
    createdBy: string,
  ): Promise<CommissionConfigDocument> {
    return this.queryService.createConfig(dto, createdBy);
  }

  async updateConfig(
    id: string,
    dto: UpdateCommissionConfigDto,
    updatedBy: string,
  ): Promise<CommissionConfigDocument | null> {
    return this.queryService.updateConfig(id, dto, updatedBy);
  }

  async getConfig(id: string) {
    return this.queryService.getConfig(id);
  }

  async getAllConfigs() {
    return this.queryService.getAllConfigs();
  }

  async getGlobalConfig() {
    return this.queryService.getGlobalConfig();
  }
}
