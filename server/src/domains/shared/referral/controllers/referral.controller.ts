import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReferralService } from '../services/referral.service';
import { ApplyReferralDto } from '../dto/apply-referral.dto';
import { QueryReferralDto } from '../dto/query-referral.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@Controller('referrals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  /**
   * Get or create my referral code
   * GET /referrals/my-code
   */
  @Get('my-code')
  @Roles('customer')
  async getMyReferralCode(@CurrentUser() user: any) {
    const referral = await this.referralService.getOrCreateReferralCode(user.profileId);
    return {
      success: true,
      data: referral,
    };
  }

  /**
   * Apply referral code
   * POST /referrals/apply
   */
  @Post('apply')
  @Roles('customer')
  async applyReferralCode(@CurrentUser() user: any, @Body() applyDto: ApplyReferralDto) {
    applyDto.referredId = user.profileId;
    const referral = await this.referralService.applyReferralCode(applyDto.code, applyDto.referredId);
    return {
      success: true,
      message: 'Referral code applied successfully',
      data: referral,
    };
  }

  /**
   * Get my referral statistics
   * GET /referrals/my-stats
   */
  @Get('my-stats')
  @Roles('customer')
  async getMyReferralStats(@CurrentUser() user: any) {
    const stats = await this.referralService.getReferralStats(user.profileId);
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get my referrals
   * GET /referrals/my
   */
  @Get('my')
  @Roles('customer')
  async getMyReferrals(@CurrentUser() user: any, @Query() queryDto: QueryReferralDto) {
    queryDto.referrerId = user.profileId;
    const result = await this.referralService.findAll(queryDto);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * Admin: Get all referrals
   * GET /referrals/admin
   */
  @Get('admin')
  @Roles('admin')
  async getAllReferrals(@Query() queryDto: QueryReferralDto) {
    const result = await this.referralService.findAll(queryDto);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * Admin: Get referral by ID
   * GET /referrals/admin/:id
   */
  @Get('admin/:id')
  @Roles('admin')
  async getReferral(@Param('id') id: string) {
    const referral = await this.referralService.findOne(id);
    return {
      success: true,
      data: referral,
    };
  }

  /**
   * Admin: Distribute rewards for referral
   * POST /referrals/admin/:id/distribute-rewards
   */
  @Post('admin/:id/distribute-rewards')
  @Roles('admin')
  async distributeRewards(@Param('id') id: string) {
    const referral = await this.referralService.distributeRewards(id);
    return {
      success: true,
      message: 'Rewards distributed successfully',
      data: referral,
    };
  }
}

