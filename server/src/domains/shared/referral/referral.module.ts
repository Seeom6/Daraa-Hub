import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Referral, ReferralSchema } from '../../../database/schemas/referral.schema';
import { CustomerProfile, CustomerProfileSchema } from '../../../database/schemas/customer-profile.schema';
import { ReferralService } from './services/referral.service';
import { ReferralController } from './controllers/referral.controller';
import { ReferralRepository } from './repositories/referral.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Referral.name, schema: ReferralSchema },
      { name: CustomerProfile.name, schema: CustomerProfileSchema },
    ]),
  ],
  controllers: [ReferralController],
  providers: [ReferralService, ReferralRepository],
  exports: [ReferralService, ReferralRepository],
})
export class ReferralModule {}

