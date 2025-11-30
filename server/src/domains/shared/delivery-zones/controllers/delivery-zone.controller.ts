import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../../../../common/guards';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { DeliveryZoneService } from '../services/delivery-zone.service';
import {
  CreateDeliveryZoneDto,
  UpdateDeliveryZoneDto,
  AddStoreToZoneDto,
  LocationQueryDto,
} from '../dto/delivery-zone.dto';
import { ZoneType } from '../../../../database/schemas/delivery-zone.schema';

@Controller('delivery-zones')
export class DeliveryZoneController {
  constructor(private readonly zoneService: DeliveryZoneService) {}

  // ==================== Public Endpoints ====================

  @Get()
  async getAllZones(@Query('type') type?: ZoneType) {
    return this.zoneService.getAllZones(type);
  }

  @Get('tree')
  async getZoneTree() {
    return this.zoneService.getZoneTree();
  }

  @Get('by-location')
  async getZoneByLocation(@Query() query: LocationQueryDto) {
    return this.zoneService.findZoneByLocation(query.longitude, query.latitude);
  }

  @Get('nearby')
  async getNearbyZones(@Query() query: LocationQueryDto) {
    return this.zoneService.findNearbyZones(
      query.longitude,
      query.latitude,
      query.maxDistanceMeters,
    );
  }

  @Get(':id')
  async getZone(@Param('id') id: string) {
    return this.zoneService.getZone(id);
  }

  @Get(':id/stores')
  async getZoneStores(@Param('id') id: string) {
    return this.zoneService.getZoneStores(id);
  }

  // ==================== Admin Endpoints ====================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async createZone(@Request() req: any, @Body() dto: CreateDeliveryZoneDto) {
    return this.zoneService.createZone(dto, req.user.accountId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async updateZone(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateDeliveryZoneDto,
  ) {
    return this.zoneService.updateZone(id, dto, req.user.accountId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async deleteZone(@Param('id') id: string) {
    await this.zoneService.deleteZone(id);
    return { message: 'تم حذف المنطقة بنجاح' };
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async getZoneStats() {
    return this.zoneService.getZoneStats();
  }

  // ==================== Store Owner Endpoints ====================

  @Get('store/my-zones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner')
  async getMyStoreZones(@Request() req: any) {
    return this.zoneService.getStoreZones(req.user.accountId);
  }

  @Post('store/add-zone')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner')
  async addMyStoreToZone(@Request() req: any, @Body() dto: AddStoreToZoneDto) {
    return this.zoneService.addStoreToZone(req.user.accountId, dto);
  }

  @Delete('store/remove-zone/:zoneId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner')
  async removeMyStoreFromZone(
    @Request() req: any,
    @Param('zoneId') zoneId: string,
  ) {
    await this.zoneService.removeStoreFromZone(req.user.accountId, zoneId);
    return { message: 'تم إزالة المنطقة من التغطية' };
  }

  @Put('store/zone/:zoneId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner')
  async updateMyStoreZoneSettings(
    @Request() req: any,
    @Param('zoneId') zoneId: string,
    @Body() dto: Partial<AddStoreToZoneDto>,
  ) {
    return this.zoneService.updateStoreZoneSettings(
      req.user.accountId,
      zoneId,
      dto,
    );
  }

  // ==================== Delivery Fee Calculation ====================

  @Get('calculate-fee/:storeAccountId/:zoneId')
  async calculateDeliveryFee(
    @Param('storeAccountId') storeAccountId: string,
    @Param('zoneId') zoneId: string,
    @Query('orderAmount') orderAmount: number,
  ) {
    return this.zoneService.calculateDeliveryFee(
      storeAccountId,
      zoneId,
      Number(orderAmount),
    );
  }

  @Get('check-coverage/:storeAccountId/:zoneId')
  async checkStoreCoverage(
    @Param('storeAccountId') storeAccountId: string,
    @Param('zoneId') zoneId: string,
  ) {
    const covers = await this.zoneService.checkStoreCoversZone(
      storeAccountId,
      zoneId,
    );
    return { covers };
  }
}
