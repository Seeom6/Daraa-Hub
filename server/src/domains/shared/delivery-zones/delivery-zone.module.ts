import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DeliveryZone,
  DeliveryZoneSchema,
} from '../../../database/schemas/delivery-zone.schema';
import {
  StoreDeliveryZone,
  StoreDeliveryZoneSchema,
} from '../../../database/schemas/store-delivery-zone.schema';
import { DeliveryZoneController } from './controllers/delivery-zone.controller';
import { DeliveryZoneService } from './services/delivery-zone.service';
import { DeliveryZonePricingService } from './services/delivery-zone-pricing.service';
import { DeliveryZoneStoreService } from './services/delivery-zone-store.service';
import { DeliveryZoneRepository } from './repositories/delivery-zone.repository';
import { StoreDeliveryZoneRepository } from './repositories/store-delivery-zone.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryZone.name, schema: DeliveryZoneSchema },
      { name: StoreDeliveryZone.name, schema: StoreDeliveryZoneSchema },
    ]),
  ],
  controllers: [DeliveryZoneController],
  providers: [
    // Repositories
    DeliveryZoneRepository,
    StoreDeliveryZoneRepository,
    // Specialized Services
    DeliveryZonePricingService,
    DeliveryZoneStoreService,
    // Facade Service
    DeliveryZoneService,
  ],
  exports: [
    DeliveryZoneService,
    DeliveryZonePricingService,
    DeliveryZoneStoreService,
    DeliveryZoneRepository,
    StoreDeliveryZoneRepository,
  ],
})
export class DeliveryZoneModule {}
