import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Coupon, CouponDocument, CouponType } from '../../../../database/schemas/coupon.schema';
import { CustomerProfile, CustomerProfileDocument } from '../../../../database/schemas/customer-profile.schema';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { QueryCouponDto } from '../dto/query-coupon.dto';
import { ValidateCouponDto } from '../dto/validate-coupon.dto';

@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name);

  constructor(
    @InjectModel(Coupon.name)
    private couponModel: Model<CouponDocument>,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new coupon
   */
  async create(createDto: CreateCouponDto, createdBy: string): Promise<CouponDocument> {
    // Convert code to uppercase
    const code = createDto.code.toUpperCase();

    // Check if code already exists
    const existing = await this.couponModel.findOne({ code }).exec();
    if (existing) {
      throw new BadRequestException('Coupon code already exists');
    }

    // Validate dates
    if (new Date(createDto.validFrom) >= new Date(createDto.validUntil)) {
      throw new BadRequestException('Valid from date must be before valid until date');
    }

    // Validate discount value
    if (createDto.type === CouponType.PERCENTAGE && createDto.discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    const coupon = await this.couponModel.create({
      ...createDto,
      code,
      createdBy: new Types.ObjectId(createdBy),
      applicableTo: {
        stores: createDto.applicableTo?.stores?.map(id => new Types.ObjectId(id)) || [],
        categories: createDto.applicableTo?.categories?.map(id => new Types.ObjectId(id)) || [],
        products: createDto.applicableTo?.products?.map(id => new Types.ObjectId(id)) || [],
        userTiers: createDto.applicableTo?.userTiers || [],
        newUsersOnly: createDto.applicableTo?.newUsersOnly || false,
      },
    });

    this.logger.log(`Coupon created: ${code} by admin ${createdBy}`);

    this.eventEmitter.emit('coupon.created', {
      couponId: (coupon._id as Types.ObjectId).toString(),
      code,
      type: coupon.type,
    });

    return coupon;
  }

  /**
   * Get all coupons with filters
   */
  async findAll(queryDto: QueryCouponDto): Promise<{
    data: CouponDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { type, isActive, storeId, categoryId, productId, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;

    const filter: any = {};

    if (type) {
      filter.type = type;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (storeId) {
      if (!Types.ObjectId.isValid(storeId)) {
        throw new BadRequestException('Invalid store ID');
      }
      filter['applicableTo.stores'] = new Types.ObjectId(storeId);
    }

    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new BadRequestException('Invalid category ID');
      }
      filter['applicableTo.categories'] = new Types.ObjectId(categoryId);
    }

    if (productId) {
      if (!Types.ObjectId.isValid(productId)) {
        throw new BadRequestException('Invalid product ID');
      }
      filter['applicableTo.products'] = new Types.ObjectId(productId);
    }

    if (search) {
      filter.code = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.couponModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'fullName email')
        .exec(),
      this.couponModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Get coupon by ID
   */
  async findOne(id: string): Promise<CouponDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid coupon ID');
    }

    const coupon = await this.couponModel
      .findById(id)
      .populate('createdBy', 'fullName email')
      .exec();

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  /**
   * Get coupon by code
   */
  async findByCode(code: string): Promise<CouponDocument> {
    const coupon = await this.couponModel.findOne({ code: code.toUpperCase() }).exec();

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  /**
   * Update coupon
   */
  async update(id: string, updateDto: UpdateCouponDto): Promise<CouponDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid coupon ID');
    }

    const coupon = await this.couponModel.findById(id).exec();
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Validate dates if provided
    const validFrom = updateDto.validFrom || coupon.validFrom;
    const validUntil = updateDto.validUntil || coupon.validUntil;
    if (new Date(validFrom) >= new Date(validUntil)) {
      throw new BadRequestException('Valid from date must be before valid until date');
    }

    // Validate discount value if provided
    const type = updateDto.type || coupon.type;
    const discountValue = updateDto.discountValue !== undefined ? updateDto.discountValue : coupon.discountValue;
    if (type === CouponType.PERCENTAGE && discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    // Update applicable to if provided
    if (updateDto.applicableTo) {
      updateDto.applicableTo = {
        stores: updateDto.applicableTo.stores?.map(id => new Types.ObjectId(id)) || coupon.applicableTo.stores,
        categories: updateDto.applicableTo.categories?.map(id => new Types.ObjectId(id)) || coupon.applicableTo.categories,
        products: updateDto.applicableTo.products?.map(id => new Types.ObjectId(id)) || coupon.applicableTo.products,
        userTiers: updateDto.applicableTo.userTiers || coupon.applicableTo.userTiers,
        newUsersOnly: updateDto.applicableTo.newUsersOnly !== undefined ? updateDto.applicableTo.newUsersOnly : coupon.applicableTo.newUsersOnly,
      } as any;
    }

    Object.assign(coupon, updateDto);
    await coupon.save();

    this.logger.log(`Coupon updated: ${id}`);

    return coupon;
  }

  /**
   * Delete coupon
   */
  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid coupon ID');
    }

    const result = await this.couponModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Coupon not found');
    }

    this.logger.log(`Coupon deleted: ${id}`);
  }

  /**
   * Validate coupon for use
   */
  async validateCoupon(validateDto: ValidateCouponDto): Promise<{
    valid: boolean;
    message?: string;
    discountAmount?: number;
    coupon?: CouponDocument;
  }> {
    const { code, customerId, orderAmount, storeId, categoryId, productId } = validateDto;

    // Find coupon
    const coupon = await this.couponModel.findOne({ code: code.toUpperCase() }).exec();
    if (!coupon) {
      return { valid: false, message: 'Coupon not found' };
    }

    // Check if active
    if (!coupon.isActive) {
      return { valid: false, message: 'Coupon is not active' };
    }

    // Check validity period
    const now = new Date();
    if (now < new Date(coupon.validFrom)) {
      return { valid: false, message: 'Coupon is not yet valid' };
    }
    if (now > new Date(coupon.validUntil)) {
      return { valid: false, message: 'Coupon has expired' };
    }

    // Check minimum purchase amount
    if (orderAmount < coupon.minPurchaseAmount) {
      return { valid: false, message: `Minimum purchase amount is ${coupon.minPurchaseAmount}` };
    }

    // Check total usage limit
    if (coupon.usageLimit.total && coupon.usedCount >= coupon.usageLimit.total) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    // Check per-user usage limit
    if (coupon.usageLimit.perUser) {
      const userUsageCount = coupon.usageHistory.filter(
        h => (h.userId as Types.ObjectId).toString() === customerId
      ).length;
      if (userUsageCount >= coupon.usageLimit.perUser) {
        return { valid: false, message: 'You have reached the usage limit for this coupon' };
      }
    }

    // Check daily usage limit
    if (coupon.usageLimit.perDay) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayUsageCount = coupon.usageHistory.filter(
        h => new Date(h.usedAt) >= today
      ).length;
      if (todayUsageCount >= coupon.usageLimit.perDay) {
        return { valid: false, message: 'Daily usage limit reached for this coupon' };
      }
    }

    // Get customer profile
    const customer = await this.customerProfileModel.findById(customerId).exec();
    if (!customer) {
      return { valid: false, message: 'Customer not found' };
    }

    // Check user tier restriction
    if (coupon.applicableTo.userTiers.length > 0 && !coupon.applicableTo.userTiers.includes(customer.tier)) {
      return { valid: false, message: 'This coupon is not available for your tier' };
    }

    // Check new users only restriction
    if (coupon.applicableTo.newUsersOnly) {
      const orderCount = customer.orders.length;
      if (orderCount > 0) {
        return { valid: false, message: 'This coupon is only for new users' };
      }
    }

    // Check store restriction
    if (storeId && coupon.applicableTo.stores.length > 0) {
      const storeMatch = coupon.applicableTo.stores.some(
        s => (s as Types.ObjectId).toString() === storeId
      );
      if (!storeMatch) {
        return { valid: false, message: 'This coupon is not applicable to this store' };
      }
    }

    // Check category restriction
    if (categoryId && coupon.applicableTo.categories.length > 0) {
      const categoryMatch = coupon.applicableTo.categories.some(
        c => (c as Types.ObjectId).toString() === categoryId
      );
      if (!categoryMatch) {
        return { valid: false, message: 'This coupon is not applicable to this category' };
      }
    }

    // Check product restriction
    if (productId && coupon.applicableTo.products.length > 0) {
      const productMatch = coupon.applicableTo.products.some(
        p => (p as Types.ObjectId).toString() === productId
      );
      if (!productMatch) {
        return { valid: false, message: 'This coupon is not applicable to this product' };
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === CouponType.PERCENTAGE) {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else if (coupon.type === CouponType.FIXED) {
      discountAmount = Math.min(coupon.discountValue, orderAmount);
    } else if (coupon.type === CouponType.FREE_SHIPPING) {
      // Free shipping discount will be handled separately
      discountAmount = 0;
    }

    return {
      valid: true,
      discountAmount,
      coupon,
    };
  }

  /**
   * Apply coupon to order
   */
  async applyCoupon(code: string, customerId: string, orderId: string, discountAmount: number): Promise<CouponDocument> {
    const coupon = await this.findByCode(code);

    // Add to usage history
    coupon.usageHistory.push({
      userId: new Types.ObjectId(customerId),
      orderId: new Types.ObjectId(orderId),
      discountAmount,
      usedAt: new Date(),
    } as any);

    // Increment used count
    coupon.usedCount += 1;

    await coupon.save();

    this.logger.log(`Coupon applied: ${code} for order ${orderId}`);

    this.eventEmitter.emit('coupon.applied', {
      couponId: (coupon._id as Types.ObjectId).toString(),
      code,
      customerId,
      orderId,
      discountAmount,
    });

    return coupon;
  }

  /**
   * Get available coupons for customer
   */
  async getAvailableCoupons(customerId: string): Promise<CouponDocument[]> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const customer = await this.customerProfileModel.findById(customerId).exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const now = new Date();

    const coupons = await this.couponModel
      .find({
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
        $or: [
          { 'applicableTo.userTiers': { $size: 0 } },
          { 'applicableTo.userTiers': customer.tier },
        ],
      })
      .exec();

    // Filter coupons based on usage limits
    const availableCoupons = coupons.filter(coupon => {
      // Check total usage limit
      if (coupon.usageLimit.total && coupon.usedCount >= coupon.usageLimit.total) {
        return false;
      }

      // Check per-user usage limit
      if (coupon.usageLimit.perUser) {
        const userUsageCount = coupon.usageHistory.filter(
          h => (h.userId as Types.ObjectId).toString() === customerId
        ).length;
        if (userUsageCount >= coupon.usageLimit.perUser) {
          return false;
        }
      }

      // Check new users only
      if (coupon.applicableTo.newUsersOnly && customer.orders.length > 0) {
        return false;
      }

      return true;
    });

    return availableCoupons;
  }

  /**
   * Get coupon usage statistics
   */
  async getUsageStats(id: string): Promise<{
    totalUsage: number;
    totalDiscount: number;
    uniqueUsers: number;
    usageByDay: any[];
  }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid coupon ID');
    }

    const coupon = await this.couponModel.findById(id).exec();
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    const totalUsage = coupon.usedCount;
    const totalDiscount = coupon.usageHistory.reduce((sum, h) => sum + h.discountAmount, 0);
    const uniqueUsers = new Set(coupon.usageHistory.map(h => (h.userId as Types.ObjectId).toString())).size;

    // Group usage by day
    const usageByDay = coupon.usageHistory.reduce((acc: any, h) => {
      const day = new Date(h.usedAt).toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = { date: day, count: 0, discount: 0 };
      }
      acc[day].count += 1;
      acc[day].discount += h.discountAmount;
      return acc;
    }, {});

    return {
      totalUsage,
      totalDiscount,
      uniqueUsers,
      usageByDay: Object.values(usageByDay),
    };
  }
}

