import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from '../../../database/schemas/offer.schema';
import {
  StoreOwnerProfile,
  StoreOwnerProfileSchema,
} from '../../../database/schemas/store-owner-profile.schema';
import { OfferService } from './services/offer.service';
import { OfferCrudService } from './services/offer-crud.service';
import { OfferQueryService } from './services/offer-query.service';
import { OfferAnalyticsService } from './services/offer-analytics.service';
import { OfferController } from './controllers/offer.controller';
import { OfferRepository } from './repositories/offer.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Offer.name, schema: OfferSchema },
      { name: StoreOwnerProfile.name, schema: StoreOwnerProfileSchema },
    ]),
  ],
  controllers: [OfferController],
  providers: [
    // Repository
    OfferRepository,
    // Specialized Services
    OfferCrudService,
    OfferQueryService,
    OfferAnalyticsService,
    // Facade Service
    OfferService,
  ],
  exports: [
    OfferService,
    OfferCrudService,
    OfferQueryService,
    OfferAnalyticsService,
    OfferRepository,
  ],
})
export class OfferModule {}
