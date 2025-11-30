import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CouponDocument,
  CouponType,
} from '../../../../database/schemas/coupon.schema';
import {
  CustomerProfile,
  CustomerProfileDocument,
} from '../../../../database/schemas/customer-profile.schema';
import { ValidateCouponDto } from '../dto/validate-coupon.dto';
import { CouponRepository } from '../repositories/coupon.repository';

/**
 * Service responsible for coupon validation logic
 * Handles validation rules and eligibility checks
 */
@Injectable()
export class CouponValidationService {
  private readonly logger = new Logger(CouponValidationService.name);

  constructor(
    private readonly couponRepository: CouponRepository,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
  ) {}

  /**
   * Validate coupon for use
   */
  async validateCoupon(validateDto: ValidateCouponDto): Promise<{
    valid: boolean;
    message?: string;
    discountAmount?: number;
    coupon?: CouponDocument;
  }> {
    const { code, customerId, storeId, categoryId, productId, orderAmount } =
      validateDto;

    // Find coupon
    const coupon = await this.couponRepository
      .getModel()
      .findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return { valid: false, message: 'Coupon not found' };
    }

    // Check if active
    if (!coupon.isActive) {
      return { valid: false, message: 'Coupon is not active' };
    }

    // Check dates
    const now = new Date();
    if (now < new Date(coupon.validFrom)) {
      return { valid: false, message: 'Coupon is not yet valid' };
    }

    if (now > new Date(coupon.validUntil)) {
      return { valid: false, message: 'Coupon has expired' };
    }

    // Check usage limit
    if (
      coupon.usageLimit.total &&
      coupon.usedCount >= coupon.usageLimit.total
    ) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    // Check per-user usage limit
    if (customerId && coupon.usageLimit.perUser) {
      const userUsageCount = coupon.usageHistory.filter(
        (usage) => usage.userId.toString() === customerId,
      ).length;

      if (userUsageCount >= coupon.usageLimit.perUser) {
        return {
          valid: false,
          message: 'You have reached the usage limit for this coupon',
        };
      }
    }

    // Check minimum order value
    if (coupon.minPurchaseAmount && orderAmount < coupon.minPurchaseAmount) {
      return {
        valid: false,
        message: `Minimum order value of ${coupon.minPurchaseAmount} required`,
      };
    }

    // Check applicability
    if (storeId && coupon.applicableTo.stores.length > 0) {
      const isApplicable = coupon.applicableTo.stores.some(
        (s) => s.toString() === storeId,
      );
      if (!isApplicable) {
        return { valid: false, message: 'Coupon not applicable to this store' };
      }
    }

    if (categoryId && coupon.applicableTo.categories.length > 0) {
      const isApplicable = coupon.applicableTo.categories.some(
        (c) => c.toString() === categoryId,
      );
      if (!isApplicable) {
        return {
          valid: false,
          message: 'Coupon not applicable to this category',
        };
      }
    }

    if (productId && coupon.applicableTo.products.length > 0) {
      const isApplicable = coupon.applicableTo.products.some(
        (p) => p.toString() === productId,
      );
      if (!isApplicable) {
        return {
          valid: false,
          message: 'Coupon not applicable to this product',
        };
      }
    }

    // Check user tier eligibility
    if (customerId && coupon.applicableTo.userTiers.length > 0) {
      const customer = await this.customerProfileModel.findById(customerId);
      if (!customer) {
        return { valid: false, message: 'Customer not found' };
      }

      if (!coupon.applicableTo.userTiers.includes(customer.tier)) {
        return { valid: false, message: 'Coupon not applicable to your tier' };
      }
    }

    // Check new users only
    if (customerId && coupon.applicableTo.newUsersOnly) {
      const customer = await this.customerProfileModel.findById(customerId);
      if (!customer) {
        return { valid: false, message: 'Customer not found' };
      }

      // Check if customer has any previous orders (this would need Order model)
      // For now, we'll skip this check
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === CouponType.PERCENTAGE) {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (
        coupon.maxDiscountAmount &&
        discountAmount > coupon.maxDiscountAmount
      ) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else if (coupon.type === CouponType.FIXED) {
      discountAmount = coupon.discountValue;
      if (discountAmount > orderAmount) {
        discountAmount = orderAmount;
      }
    } else if (coupon.type === CouponType.FREE_SHIPPING) {
      // Free shipping discount would be calculated based on shipping cost
      // For now, we'll return 0
      discountAmount = 0;
    }

    return {
      valid: true,
      discountAmount,
      coupon,
    };
  }

  /**
   * Get available coupons for customer
   */
  async getAvailableCoupons(customerId: string): Promise<CouponDocument[]> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const customer = await this.customerProfileModel.findById(customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const now = new Date();

    // Find all active coupons that are currently valid
    const coupons = await this.couponRepository
      .getModel()
      .find({
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
        $or: [
          { maxUsage: { $exists: false } },
          { $expr: { $lt: ['$currentUsage', '$maxUsage'] } },
        ],
      })
      .exec();

    // Filter coupons based on user eligibility
    const availableCoupons = coupons.filter((coupon) => {
      // Check user tier
      if (coupon.applicableTo.userTiers.length > 0) {
        if (!coupon.applicableTo.userTiers.includes(customer.tier)) {
          return false;
        }
      }

      // Check per-user usage limit
      if (coupon.usageLimit.perUser) {
        const userUsageCount = coupon.usageHistory.filter(
          (usage) => usage.userId.toString() === customerId,
        ).length;

        if (userUsageCount >= coupon.usageLimit.perUser) {
          return false;
        }
      }

      return true;
    });

    return availableCoupons;
  }
}
