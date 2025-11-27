import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from '../../../database/schemas/coupon.schema';
import { CustomerProfile, CustomerProfileSchema } from '../../../database/schemas/customer-profile.schema';
import { CouponService } from './services/coupon.service';
import { CouponValidationService } from './services/coupon-validation.service';
import { CouponUsageService } from './services/coupon-usage.service';
import { CouponController } from './controllers/coupon.controller';
import { CouponRepository } from './repositories/coupon.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coupon.name, schema: CouponSchema },
      { name: CustomerProfile.name, schema: CustomerProfileSchema },
    ]),
  ],
  controllers: [CouponController],
  providers: [
    CouponService,
    CouponValidationService,
    CouponUsageService,
    CouponRepository,
  ],
  exports: [
    CouponService,
    CouponValidationService,
    CouponUsageService,
    CouponRepository,
  ],
})
export class CouponModule {}

