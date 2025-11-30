import { Injectable } from '@nestjs/common';
import { ReferralDocument } from '../../../../database/schemas/referral.schema';
import { QueryReferralDto } from '../dto/query-referral.dto';
import { ReferralCodeService } from './referral-code.service';
import { ReferralRewardService } from './referral-reward.service';
import { ReferralQueryService } from './referral-query.service';

/**
 * Referral Service - Facade Pattern
 * Delegates operations to specialized services
 */
@Injectable()
export class ReferralService {
  constructor(
    private readonly codeService: ReferralCodeService,
    private readonly rewardService: ReferralRewardService,
    private readonly queryService: ReferralQueryService,
  ) {}

  // ===== Code Operations (delegated to ReferralCodeService) =====

  async getOrCreateReferralCode(customerId: string): Promise<ReferralDocument> {
    return this.codeService.getOrCreateReferralCode(customerId);
  }

  async applyReferralCode(
    code: string,
    referredId: string,
  ): Promise<ReferralDocument> {
    return this.codeService.applyReferralCode(code, referredId);
  }

  async completeReferral(
    referredId: string,
    orderId: string,
  ): Promise<ReferralDocument> {
    return this.codeService.completeReferral(referredId, orderId);
  }

  // ===== Reward Operations (delegated to ReferralRewardService) =====

  async distributeRewards(referralId: string): Promise<ReferralDocument> {
    return this.rewardService.distributeRewards(referralId);
  }

  // ===== Query Operations (delegated to ReferralQueryService) =====

  async findAll(queryDto: QueryReferralDto): Promise<{
    data: ReferralDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.queryService.findAll(queryDto);
  }

  async findOne(id: string): Promise<ReferralDocument> {
    return this.queryService.findOne(id);
  }

  async getReferralStats(customerId: string): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalRewardsEarned: number;
  }> {
    return this.queryService.getReferralStats(customerId);
  }
}
