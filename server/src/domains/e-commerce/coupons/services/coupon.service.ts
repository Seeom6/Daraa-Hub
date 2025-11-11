import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { CouponDocument, CouponType } from '../../../../database/schemas/coupon.schema';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { QueryCouponDto } from '../dto/query-coupon.dto';
import { CouponRepository } from '../repositories/coupon.repository';

/**
 * Core Coupon Service
 * Handles CRUD operations for coupons
 */
@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name);

  constructor(
    private readonly couponRepository: CouponRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new coupon
   */
  async create(createDto: CreateCouponDto, createdBy: string): Promise<CouponDocument> {
    // Convert code to uppercase
    const code = createDto.code.toUpperCase();

    // Check if code already exists
    const existing = await this.couponRepository.getModel().findOne({ code });
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

    const coupon = await this.couponRepository.create({
      ...createDto,
      code,
      createdBy: new Types.ObjectId(createdBy),
      applicableTo: {
        stores: createDto.applicableTo?.stores?.map((id) => new Types.ObjectId(id)) || [],
        categories: createDto.applicableTo?.categories?.map((id) => new Types.ObjectId(id)) || [],
        products: createDto.applicableTo?.products?.map((id) => new Types.ObjectId(id)) || [],
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
    const {
      type,
      isActive,
      storeId,
      categoryId,
      productId,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

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
      this.couponRepository
        .getModel()
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'fullName email')
        .exec(),
      this.couponRepository.count(filter),
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

    const coupon = await this.couponRepository
      .getModel()
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
    const coupon = await this.couponRepository.getModel().findOne({ code: code.toUpperCase() });

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

    const coupon = await this.couponRepository.getModel().findById(id);
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
    const discountValue =
      updateDto.discountValue !== undefined ? updateDto.discountValue : coupon.discountValue;
    if (type === CouponType.PERCENTAGE && discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    // Update applicable to if provided
    if (updateDto.applicableTo) {
      updateDto.applicableTo = {
        stores:
          updateDto.applicableTo.stores?.map((id) => new Types.ObjectId(id)) ||
          coupon.applicableTo.stores,
        categories:
          updateDto.applicableTo.categories?.map((id) => new Types.ObjectId(id)) ||
          coupon.applicableTo.categories,
        products:
          updateDto.applicableTo.products?.map((id) => new Types.ObjectId(id)) ||
          coupon.applicableTo.products,
        userTiers: updateDto.applicableTo.userTiers || coupon.applicableTo.userTiers,
        newUsersOnly:
          updateDto.applicableTo.newUsersOnly !== undefined
            ? updateDto.applicableTo.newUsersOnly
            : coupon.applicableTo.newUsersOnly,
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

    const result = await this.couponRepository.delete(id);

    if (!result) {
      throw new NotFoundException('Coupon not found');
    }

    this.logger.log(`Coupon deleted: ${id}`);
  }

  /**
   * Toggle coupon active status
   */
  async toggleActive(id: string): Promise<CouponDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid coupon ID');
    }

    const coupon = await this.couponRepository.getModel().findById(id);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    this.logger.log(`Coupon ${id} active status toggled to ${coupon.isActive}`);

    return coupon;
  }
}

