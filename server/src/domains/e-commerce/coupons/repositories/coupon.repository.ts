import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coupon, CouponDocument } from '../../../../database/schemas/coupon.schema';
import { BaseRepository } from '../../../shared/base/base.repository';

@Injectable()
export class CouponRepository extends BaseRepository<CouponDocument> {
  constructor(
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
  ) {
    super(couponModel);
  }

  /**
   * Find coupon by code
   */
  async findByCode(code: string): Promise<CouponDocument | null> {
    return this.findOne({ code: code.toUpperCase() });
  }

  /**
   * Find active coupons
   */
  async findActiveCoupons(storeId?: string): Promise<CouponDocument[]> {
    const filter: any = {
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    };

    if (storeId) {
      filter.storeId = new Types.ObjectId(storeId);
    }

    return this.find(filter);
  }

  /**
   * Validate coupon
   */
  async validateCoupon(
    code: string,
    customerId: string,
    orderAmount: number,
  ): Promise<{ valid: boolean; message?: string; coupon?: CouponDocument }> {
    const coupon = await this.findByCode(code);

    if (!coupon) {
      return { valid: false, message: 'Coupon not found' };
    }

    if (!coupon.isActive) {
      return { valid: false, message: 'Coupon is not active' };
    }

    const now = new Date();
    if (coupon.validFrom > now || coupon.validUntil < now) {
      return { valid: false, message: 'Coupon has expired' };
    }

    if (coupon.usageLimit?.total && coupon.usedCount >= coupon.usageLimit.total) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    if (coupon.minPurchaseAmount && orderAmount < coupon.minPurchaseAmount) {
      return {
        valid: false,
        message: `Minimum order amount is ${coupon.minPurchaseAmount}`,
      };
    }

    return { valid: true, coupon };
  }

  /**
   * Increment usage count
   */
  async incrementUsage(couponId: string): Promise<CouponDocument | null> {
    return this.couponModel
      .findByIdAndUpdate(
        couponId,
        { $inc: { usedCount: 1 } },
        { new: true },
      )
      .exec();
  }
}

