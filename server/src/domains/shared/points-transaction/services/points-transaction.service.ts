import { Injectable, Logger } from '@nestjs/common';
import { PointsTransactionDocument } from '../../../../database/schemas/points-transaction.schema';
import { CreatePointsTransactionDto } from '../dto/create-points-transaction.dto';
import { QueryPointsTransactionDto } from '../dto/query-points-transaction.dto';
import { RedeemPointsDto } from '../dto/redeem-points.dto';
import { PointsEarningService } from './points-earning.service';
import { PointsRedemptionService } from './points-redemption.service';
import { PointsQueryService } from './points-query.service';

/**
 * Points Transaction Service - Facade Pattern
 * Delegates operations to specialized services
 */
@Injectable()
export class PointsTransactionService {
  private readonly logger = new Logger(PointsTransactionService.name);

  constructor(
    private readonly earningService: PointsEarningService,
    private readonly redemptionService: PointsRedemptionService,
    private readonly queryService: PointsQueryService,
  ) {}

  // ===== Earning Operations (delegated to PointsEarningService) =====

  async create(
    createDto: CreatePointsTransactionDto,
  ): Promise<PointsTransactionDocument> {
    return this.earningService.create(createDto);
  }

  async awardPoints(
    customerId: string,
    amount: number,
    description: string,
    orderId?: string,
    expiresAt?: Date,
  ): Promise<PointsTransactionDocument> {
    return this.earningService.awardPoints(
      customerId,
      amount,
      description,
      orderId,
      expiresAt,
    );
  }

  // ===== Redemption Operations (delegated to PointsRedemptionService) =====

  async redeemPoints(
    customerId: string,
    redeemDto: RedeemPointsDto,
  ): Promise<PointsTransactionDocument> {
    return this.redemptionService.redeemPoints(customerId, redeemDto);
  }

  async expirePoints(): Promise<number> {
    return this.redemptionService.expirePoints();
  }

  // ===== Query Operations (delegated to PointsQueryService) =====

  async getBalance(
    customerId: string,
  ): Promise<{ balance: number; tier: string }> {
    return this.queryService.getBalance(customerId);
  }

  async findAll(queryDto: QueryPointsTransactionDto): Promise<{
    data: PointsTransactionDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.queryService.findAll(queryDto);
  }

  async findOne(id: string): Promise<PointsTransactionDocument> {
    return this.queryService.findOne(id);
  }

  async getExpiringPoints(
    customerId: string,
    daysAhead: number = 30,
  ): Promise<{
    expiringPoints: number;
    transactions: PointsTransactionDocument[];
  }> {
    return this.queryService.getExpiringPoints(customerId, daysAhead);
  }
}
