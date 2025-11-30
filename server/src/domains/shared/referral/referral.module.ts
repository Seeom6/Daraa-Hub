import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Referral,
  ReferralSchema,
} from '../../../database/schemas/referral.schema';
import {
  CustomerProfile,
  CustomerProfileSchema,
} from '../../../database/schemas/customer-profile.schema';
import { ReferralService } from './services/referral.service';
import { ReferralCodeService } from './services/referral-code.service';
import { ReferralRewardService } from './services/referral-reward.service';
import { ReferralQueryService } from './services/referral-query.service';
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
  providers: [
    ReferralRepository,
    ReferralCodeService,
    ReferralRewardService,
    ReferralQueryService,
    ReferralService,
  ],
  exports: [
    ReferralService,
    ReferralCodeService,
    ReferralRewardService,
    ReferralQueryService,
    ReferralRepository,
  ],
})
export class ReferralModule {}
