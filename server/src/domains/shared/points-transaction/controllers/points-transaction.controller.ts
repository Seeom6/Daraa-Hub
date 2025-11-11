import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PointsTransactionService } from '../services/points-transaction.service';
import { CreatePointsTransactionDto } from '../dto/create-points-transaction.dto';
import { QueryPointsTransactionDto } from '../dto/query-points-transaction.dto';
import { RedeemPointsDto } from '../dto/redeem-points.dto';
import { AwardPointsDto } from '../dto/award-points.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@Controller('points')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PointsTransactionController {
  constructor(private readonly pointsTransactionService: PointsTransactionService) {}

  /**
   * Get current user's points balance
   * GET /points/balance
   */
  @Get('balance')
  @Roles('customer')
  async getBalance(@CurrentUser() user: any) {
    const balance = await this.pointsTransactionService.getBalance(user.profileId);
    return {
      success: true,
      data: balance,
    };
  }

  /**
   * Get current user's transaction history
   * GET /points/transactions
   */
  @Get('transactions')
  @Roles('customer')
  async getTransactions(@CurrentUser() user: any, @Query() queryDto: QueryPointsTransactionDto) {
    queryDto.customerId = user.profileId;
    const result = await this.pointsTransactionService.findAll(queryDto);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * Get transaction by ID
   * GET /points/transactions/:id
   */
  @Get('transactions/:id')
  @Roles('customer', 'admin')
  async getTransaction(@Param('id') id: string) {
    const transaction = await this.pointsTransactionService.findOne(id);
    return {
      success: true,
      data: transaction,
    };
  }

  /**
   * Redeem points
   * POST /points/redeem
   */
  @Post('redeem')
  @Roles('customer')
  async redeemPoints(@CurrentUser() user: any, @Body() redeemDto: RedeemPointsDto) {
    const transaction = await this.pointsTransactionService.redeemPoints(user.profileId, redeemDto);
    return {
      success: true,
      message: 'Points redeemed successfully',
      data: transaction,
    };
  }

  /**
   * Get expiring points
   * GET /points/expiring
   */
  @Get('expiring')
  @Roles('customer')
  async getExpiringPoints(@CurrentUser() user: any, @Query('days') days?: number) {
    const daysAhead = days ? parseInt(days.toString()) : 30;
    const result = await this.pointsTransactionService.getExpiringPoints(user.profileId, daysAhead);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Admin: Create points transaction
   * POST /points/admin/transactions
   */
  @Post('admin/transactions')
  @Roles('admin')
  async createTransaction(@Body() createDto: CreatePointsTransactionDto) {
    const transaction = await this.pointsTransactionService.create(createDto);
    return {
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    };
  }

  /**
   * Admin: Get all transactions
   * GET /points/admin/transactions
   */
  @Get('admin/transactions')
  @Roles('admin')
  async getAllTransactions(@Query() queryDto: QueryPointsTransactionDto) {
    const result = await this.pointsTransactionService.findAll(queryDto);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * Admin: Award points to customer
   * POST /points/admin/award
   */
  @Post('admin/award')
  @Roles('admin')
  async awardPoints(@Body() awardDto: AwardPointsDto) {
    const transaction = await this.pointsTransactionService.awardPoints(
      awardDto.customerId,
      awardDto.amount,
      awardDto.description,
      awardDto.orderId,
      awardDto.expiresAt,
    );
    return {
      success: true,
      message: 'Points awarded successfully',
      data: transaction,
    };
  }
}

