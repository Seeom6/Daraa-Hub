import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Ip,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../../../../common/guards';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CommissionService } from '../services/commission.service';
import {
  CreateCommissionConfigDto,
  UpdateCommissionConfigDto,
  PayoutDto,
  CommissionFilterDto,
} from '../dto/commission.dto';
import { CommissionStatus } from '../../../../database/schemas/commission.schema';

@Controller('commission')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  // ==================== Store Owner Endpoints ====================

  @Get('store/summary')
  @Roles('store_owner')
  async getMyStoreSummary(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.commissionService.getStoreSummary(
      req.user.accountId,
      startDate,
      endDate,
    );
  }

  @Get('store/commissions')
  @Roles('store_owner')
  async getMyStoreCommissions(
    @Request() req: any,
    @Query('status') status?: CommissionStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.commissionService.getStoreCommissions(
      req.user.accountId,
      status,
      page,
      limit,
    );
  }

  // ==================== Admin Endpoints ====================

  @Get('admin/platform-summary')
  @Roles('super_admin', 'admin')
  async getPlatformSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.commissionService.getPlatformSummary(startDate, endDate);
  }

  @Get('admin/store/:storeAccountId/summary')
  @Roles('super_admin', 'admin')
  async getStoreSummaryAdmin(
    @Param('storeAccountId') storeAccountId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.commissionService.getStoreSummary(
      storeAccountId,
      startDate,
      endDate,
    );
  }

  @Get('admin/store/:storeAccountId/commissions')
  @Roles('super_admin', 'admin')
  async getStoreCommissionsAdmin(
    @Param('storeAccountId') storeAccountId: string,
    @Query('status') status?: CommissionStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.commissionService.getStoreCommissions(
      storeAccountId,
      status,
      page,
      limit,
    );
  }

  @Get('admin/order/:orderId')
  @Roles('super_admin', 'admin')
  async getOrderCommission(@Param('orderId') orderId: string) {
    return this.commissionService.getCommissionByOrderId(orderId);
  }

  // ==================== Payout Endpoints ====================

  @Post('admin/payout/store')
  @Roles('super_admin', 'admin')
  async payoutStore(
    @Request() req: any,
    @Body() dto: PayoutDto,
    @Ip() ip: string,
  ) {
    return this.commissionService.payoutStoreEarnings(
      dto,
      req.user.accountId,
      ip,
    );
  }

  @Post('admin/payout/courier')
  @Roles('super_admin', 'admin')
  async payoutCourier(
    @Request() req: any,
    @Body() dto: PayoutDto,
    @Ip() ip: string,
  ) {
    return this.commissionService.payoutCourierEarnings(
      dto,
      req.user.accountId,
      ip,
    );
  }

  // ==================== Config Endpoints ====================

  @Get('admin/config')
  @Roles('super_admin', 'admin')
  async getAllConfigs() {
    return this.commissionService.getAllConfigs();
  }

  @Get('admin/config/global')
  @Roles('super_admin', 'admin')
  async getGlobalConfig() {
    return this.commissionService.getGlobalConfig();
  }

  @Get('admin/config/:id')
  @Roles('super_admin', 'admin')
  async getConfig(@Param('id') id: string) {
    return this.commissionService.getConfig(id);
  }

  @Post('admin/config')
  @Roles('super_admin')
  async createConfig(
    @Request() req: any,
    @Body() dto: CreateCommissionConfigDto,
  ) {
    return this.commissionService.createConfig(dto, req.user.accountId);
  }

  @Put('admin/config/:id')
  @Roles('super_admin')
  async updateConfig(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateCommissionConfigDto,
  ) {
    return this.commissionService.updateConfig(id, dto, req.user.accountId);
  }
}
