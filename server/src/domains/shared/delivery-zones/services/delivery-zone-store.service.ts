import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ZoneStatus } from '../../../../database/schemas/delivery-zone.schema';
import { StoreDeliveryZoneDocument } from '../../../../database/schemas/store-delivery-zone.schema';
import { DeliveryZoneRepository } from '../repositories/delivery-zone.repository';
import { StoreDeliveryZoneRepository } from '../repositories/store-delivery-zone.repository';
import { AddStoreToZoneDto } from '../dto/delivery-zone.dto';

/**
 * Service for store-zone relationship management
 */
@Injectable()
export class DeliveryZoneStoreService {
  private readonly logger = new Logger(DeliveryZoneStoreService.name);

  constructor(
    private readonly zoneRepo: DeliveryZoneRepository,
    private readonly storeZoneRepo: StoreDeliveryZoneRepository,
  ) {}

  async addStoreToZone(
    storeAccountId: string,
    dto: AddStoreToZoneDto,
  ): Promise<StoreDeliveryZoneDocument> {
    const zone = await this.zoneRepo.findById(dto.zoneId);
    if (!zone || zone.status !== ZoneStatus.ACTIVE) {
      throw new NotFoundException('المنطقة غير موجودة أو غير نشطة');
    }

    const storeZone = await this.storeZoneRepo.addStoreToZone(
      storeAccountId,
      dto.zoneId,
      {
        customDeliveryFee: dto.customDeliveryFee,
        customMinOrderAmount: dto.customMinOrderAmount,
        customFreeDeliveryThreshold: dto.customFreeDeliveryThreshold,
        customDeliveryTimeMin: dto.customDeliveryTimeMin,
        customDeliveryTimeMax: dto.customDeliveryTimeMax,
        priority: dto.priority,
      },
    );

    await this.zoneRepo.incrementStats(dto.zoneId, 'activeStores', 1);
    this.logger.log(`Store ${storeAccountId} added to zone ${dto.zoneId}`);
    return storeZone;
  }

  async removeStoreFromZone(
    storeAccountId: string,
    zoneId: string,
  ): Promise<void> {
    const removed = await this.storeZoneRepo.removeStoreFromZone(
      storeAccountId,
      zoneId,
    );
    if (removed) {
      await this.zoneRepo.incrementStats(zoneId, 'activeStores', -1);
      this.logger.log(`Store ${storeAccountId} removed from zone ${zoneId}`);
    }
  }

  async getStoreZones(
    storeAccountId: string,
  ): Promise<StoreDeliveryZoneDocument[]> {
    return this.storeZoneRepo.findActiveByStore(storeAccountId);
  }

  async getZoneStores(zoneId: string): Promise<StoreDeliveryZoneDocument[]> {
    return this.storeZoneRepo.findByZone(zoneId);
  }

  async updateStoreZoneSettings(
    storeAccountId: string,
    zoneId: string,
    settings: Partial<AddStoreToZoneDto>,
  ): Promise<StoreDeliveryZoneDocument> {
    const { zoneId: _, ...customSettings } = settings;

    const updated = await this.storeZoneRepo.updateStoreZoneSettings(
      storeAccountId,
      zoneId,
      customSettings,
    );
    if (!updated) {
      throw new NotFoundException('المتجر غير مرتبط بهذه المنطقة');
    }
    return updated;
  }
}
