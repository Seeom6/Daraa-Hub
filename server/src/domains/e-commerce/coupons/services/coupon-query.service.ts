import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CouponDocument } from '../../../../database/schemas/coupon.schema';
import { QueryCouponDto } from '../dto/query-coupon.dto';
import { CouponRepository } from '../repositories/coupon.repository';

/**
 * Coupon Query Service
 * Handles all read/query operations for coupons
 */
@Injectable()
export class CouponQueryService {
  private readonly logger = new Logger(CouponQueryService.name);

  constructor(private readonly couponRepository: CouponRepository) {}

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

    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive;

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
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

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

    return { data, total, page, limit };
  }

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

  async findByCode(code: string): Promise<CouponDocument> {
    const coupon = await this.couponRepository
      .getModel()
      .findOne({ code: code.toUpperCase() });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }
}
