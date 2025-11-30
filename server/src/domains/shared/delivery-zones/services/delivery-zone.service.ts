import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import {
  DeliveryZoneDocument,
  ZoneStatus,
  ZoneType,
} from '../../../../database/schemas/delivery-zone.schema';
import { StoreDeliveryZoneDocument } from '../../../../database/schemas/store-delivery-zone.schema';
import { DeliveryZoneRepository } from '../repositories/delivery-zone.repository';
import {
  CreateDeliveryZoneDto,
  UpdateDeliveryZoneDto,
  AddStoreToZoneDto,
} from '../dto/delivery-zone.dto';
import { DeliveryZonePricingService } from './delivery-zone-pricing.service';
import { DeliveryZoneStoreService } from './delivery-zone-store.service';

/**
 * Delivery Zone Service - Facade Pattern
 * Delegates pricing to DeliveryZonePricingService, store management to DeliveryZoneStoreService
 */
@Injectable()
export class DeliveryZoneService {
  private readonly logger = new Logger(DeliveryZoneService.name);

  constructor(
    private readonly zoneRepo: DeliveryZoneRepository,
    private readonly pricingService: DeliveryZonePricingService,
    private readonly storeService: DeliveryZoneStoreService,
  ) {}

  // ==================== Zone CRUD ====================

  async createZone(
    dto: CreateDeliveryZoneDto,
    createdBy: string,
  ): Promise<DeliveryZoneDocument> {
    const existing = await this.zoneRepo.findByName(dto.name);
    if (existing) {
      throw new ConflictException('اسم المنطقة موجود مسبقاً');
    }

    const zoneData: any = { ...dto, createdBy: createdBy as any };

    if (dto.coordinates && dto.coordinates.length > 0) {
      zoneData.polygon = { type: 'Polygon', coordinates: dto.coordinates };
      const firstRing = dto.coordinates[0];
      if (firstRing && firstRing.length > 0) {
        const avgLng =
          firstRing.reduce((sum, c) => sum + c[0], 0) / firstRing.length;
        const avgLat =
          firstRing.reduce((sum, c) => sum + c[1], 0) / firstRing.length;
        zoneData.center = { type: 'Point', coordinates: [avgLng, avgLat] };
      }
    }

    const zone = await this.zoneRepo.create(zoneData);
    this.logger.log(`Created delivery zone: ${dto.name}`);
    return zone;
  }

  async updateZone(
    id: string,
    dto: UpdateDeliveryZoneDto,
    updatedBy: string,
  ): Promise<DeliveryZoneDocument> {
    const zone = await this.zoneRepo.findById(id);
    if (!zone) throw new NotFoundException('المنطقة غير موجودة');

    if (dto.name && dto.name !== zone.name) {
      const existing = await this.zoneRepo.findByName(dto.name);
      if (existing) throw new ConflictException('اسم المنطقة موجود مسبقاً');
    }

    const updateData: any = { ...dto, updatedBy: updatedBy as any };

    if (dto.coordinates) {
      updateData.polygon = { type: 'Polygon', coordinates: dto.coordinates };
      const firstRing = dto.coordinates[0];
      if (firstRing && firstRing.length > 0) {
        const avgLng =
          firstRing.reduce((sum, c) => sum + c[0], 0) / firstRing.length;
        const avgLat =
          firstRing.reduce((sum, c) => sum + c[1], 0) / firstRing.length;
        updateData.center = { type: 'Point', coordinates: [avgLng, avgLat] };
      }
    }

    const updated = await this.zoneRepo.update(id, updateData);
    if (!updated) throw new NotFoundException('المنطقة غير موجودة');

    this.logger.log(`Updated delivery zone: ${id}`);
    return updated;
  }

  async deleteZone(id: string): Promise<void> {
    const zone = await this.zoneRepo.findById(id);
    if (!zone) throw new NotFoundException('المنطقة غير موجودة');

    const children = await this.zoneRepo.findByParent(id);
    if (children.length > 0)
      throw new BadRequestException('لا يمكن حذف منطقة لها مناطق فرعية');

    await this.zoneRepo.updateStatus(id, ZoneStatus.INACTIVE);
    this.logger.log(`Deleted delivery zone: ${id}`);
  }

  async getZone(id: string): Promise<DeliveryZoneDocument> {
    const zone = await this.zoneRepo.findById(id);
    if (!zone) throw new NotFoundException('المنطقة غير موجودة');
    return zone;
  }

  async getAllZones(type?: ZoneType): Promise<DeliveryZoneDocument[]> {
    return this.zoneRepo.findActiveZones(type);
  }

  async getZoneTree(): Promise<any[]> {
    const zones = await this.zoneRepo.findZoneTree();
    return this.buildTree(zones);
  }

  private buildTree(zones: DeliveryZoneDocument[]): any[] {
    const map = new Map<string, any>();
    const roots: any[] = [];
    zones.forEach((zone) =>
      map.set(zone.id, { ...zone.toObject(), children: [] }),
    );
    zones.forEach((zone) => {
      const node = map.get(zone.id);
      if (zone.parentZoneId) {
        const parent = map.get(zone.parentZoneId.toString());
        if (parent) parent.children.push(node);
        else roots.push(node);
      } else roots.push(node);
    });
    return roots;
  }

  // ==================== Location-based Queries ====================

  async findZoneByLocation(
    longitude: number,
    latitude: number,
  ): Promise<DeliveryZoneDocument | null> {
    return this.zoneRepo.findZoneByLocation(longitude, latitude);
  }

  async findNearbyZones(
    longitude: number,
    latitude: number,
    maxDistanceMeters = 10000,
  ): Promise<DeliveryZoneDocument[]> {
    return this.zoneRepo.findNearbyZones(
      longitude,
      latitude,
      maxDistanceMeters,
    );
  }

  // ==================== Store Zone Management (delegated) ====================

  async addStoreToZone(
    storeAccountId: string,
    dto: AddStoreToZoneDto,
  ): Promise<StoreDeliveryZoneDocument> {
    return this.storeService.addStoreToZone(storeAccountId, dto);
  }

  async removeStoreFromZone(
    storeAccountId: string,
    zoneId: string,
  ): Promise<void> {
    return this.storeService.removeStoreFromZone(storeAccountId, zoneId);
  }

  async getStoreZones(
    storeAccountId: string,
  ): Promise<StoreDeliveryZoneDocument[]> {
    return this.storeService.getStoreZones(storeAccountId);
  }

  async getZoneStores(zoneId: string): Promise<StoreDeliveryZoneDocument[]> {
    return this.storeService.getZoneStores(zoneId);
  }

  async updateStoreZoneSettings(
    storeAccountId: string,
    zoneId: string,
    settings: Partial<AddStoreToZoneDto>,
  ): Promise<StoreDeliveryZoneDocument> {
    return this.storeService.updateStoreZoneSettings(
      storeAccountId,
      zoneId,
      settings,
    );
  }

  // ==================== Delivery Fee Calculation (delegated) ====================

  async calculateDeliveryFee(
    storeAccountId: string,
    zoneId: string,
    orderAmount: number,
  ) {
    return this.pricingService.calculateDeliveryFee(
      storeAccountId,
      zoneId,
      orderAmount,
    );
  }

  async checkStoreCoversZone(
    storeAccountId: string,
    zoneId: string,
  ): Promise<boolean> {
    return this.pricingService.checkStoreCoversZone(storeAccountId, zoneId);
  }

  // ==================== Statistics ====================

  async getZoneStats() {
    return this.zoneRepo.getZoneStats();
  }
}
