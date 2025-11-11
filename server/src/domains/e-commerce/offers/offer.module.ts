import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from '../../../database/schemas/offer.schema';
import { StoreOwnerProfile, StoreOwnerProfileSchema } from '../../../database/schemas/store-owner-profile.schema';
import { OfferService } from './services/offer.service';
import { OfferController } from './controllers/offer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Offer.name, schema: OfferSchema },
      { name: StoreOwnerProfile.name, schema: StoreOwnerProfileSchema },
    ]),
  ],
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}

