import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DeliveryZoneRepository } from '../repositories/delivery-zone.repository';
import { StoreDeliveryZoneRepository } from '../repositories/store-delivery-zone.repository';

/**
 * Service for delivery fee calculation and pricing
 */
@Injectable()
export class DeliveryZonePricingService {
  private readonly logger = new Logger(DeliveryZonePricingService.name);

  constructor(
    private readonly zoneRepo: DeliveryZoneRepository,
    private readonly storeZoneRepo: StoreDeliveryZoneRepository,
  ) {}

  async calculateDeliveryFee(
    storeAccountId: string,
    zoneId: string,
    orderAmount: number,
  ): Promise<{
    fee: number;
    isFree: boolean;
    estimatedTimeMin: number;
    estimatedTimeMax: number;
  }> {
    const zone = await this.zoneRepo.findById(zoneId);
    if (!zone) {
      throw new NotFoundException('المنطقة غير موجودة');
    }

    const storeZone = await this.storeZoneRepo.findStoreZone(
      storeAccountId,
      zoneId,
    );

    // Determine values (store-specific overrides zone defaults)
    const deliveryFee = storeZone?.customDeliveryFee ?? zone.deliveryFee;
    const freeThreshold =
      storeZone?.customFreeDeliveryThreshold ?? zone.freeDeliveryThreshold;
    const minOrder = storeZone?.customMinOrderAmount ?? zone.minOrderAmount;
    const timeMin =
      storeZone?.customDeliveryTimeMin ?? zone.estimatedDeliveryTimeMin;
    const timeMax =
      storeZone?.customDeliveryTimeMax ?? zone.estimatedDeliveryTimeMax;

    // Check minimum order
    if (minOrder && orderAmount < minOrder) {
      throw new BadRequestException(
        `الحد الأدنى للطلب في هذه المنطقة هو ${minOrder} ل.س`,
      );
    }

    // Check free delivery threshold
    const isFree = freeThreshold ? orderAmount >= freeThreshold : false;
    const fee = isFree ? 0 : deliveryFee;

    return {
      fee,
      isFree,
      estimatedTimeMin: timeMin,
      estimatedTimeMax: timeMax,
    };
  }

  async checkStoreCoversZone(
    storeAccountId: string,
    zoneId: string,
  ): Promise<boolean> {
    const storeZone = await this.storeZoneRepo.findStoreZone(
      storeAccountId,
      zoneId,
    );
    return storeZone !== null && storeZone.isActive;
  }
}
