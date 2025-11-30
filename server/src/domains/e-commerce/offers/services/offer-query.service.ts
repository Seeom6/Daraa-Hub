import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { OfferDocument } from '../../../../database/schemas/offer.schema';
import { QueryOfferDto } from '../dto/query-offer.dto';
import { OfferRepository } from '../repositories/offer.repository';

/**
 * Service for offer query operations
 * Handles search, listing, and retrieval
 */
@Injectable()
export class OfferQueryService {
  constructor(private readonly offerRepository: OfferRepository) {}

  async findAll(queryDto: QueryOfferDto): Promise<{
    data: OfferDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      storeId,
      discountType,
      isActive,
      currentOnly,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const filter: any = {};

    if (storeId) {
      if (!Types.ObjectId.isValid(storeId)) {
        throw new BadRequestException('Invalid store ID');
      }
      filter.storeId = new Types.ObjectId(storeId);
    }

    if (discountType) {
      filter.discountType = discountType;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (currentOnly) {
      const now = new Date();
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
      filter.isActive = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.offerRepository
        .getModel()
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('storeId', 'storeName storeDescription')
        .populate('applicableProducts', 'name slug price mainImage')
        .exec(),
      this.offerRepository.count(filter),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerRepository
      .getModel()
      .findById(id)
      .populate('storeId', 'storeName storeDescription')
      .populate('applicableProducts', 'name slug price mainImage')
      .exec();

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    await this.offerRepository.findByIdAndUpdate(id, {
      $inc: { viewCount: 1 },
    });

    return offer;
  }

  async getActiveOffers(storeId: string): Promise<OfferDocument[]> {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new BadRequestException('Invalid store ID');
    }

    const now = new Date();

    return this.offerRepository
      .getModel()
      .find({
        storeId: new Types.ObjectId(storeId),
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .populate('applicableProducts', 'name slug price mainImage')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getOffersForProduct(productId: string): Promise<OfferDocument[]> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const now = new Date();

    return this.offerRepository
      .getModel()
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [
          { applicableProducts: { $size: 0 } },
          { applicableProducts: new Types.ObjectId(productId) },
        ],
      })
      .populate('storeId', 'storeName')
      .sort({ discountValue: -1 })
      .exec();
  }
}
