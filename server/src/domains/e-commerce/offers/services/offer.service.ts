import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Offer, OfferDocument, DiscountType } from '../../../../database/schemas/offer.schema';
import { StoreOwnerProfile, StoreOwnerProfileDocument } from '../../../../database/schemas/store-owner-profile.schema';
import { CreateOfferDto } from '../dto/create-offer.dto';
import { UpdateOfferDto } from '../dto/update-offer.dto';
import { QueryOfferDto } from '../dto/query-offer.dto';
import { OfferRepository } from '../repositories/offer.repository';

@Injectable()
export class OfferService {
  private readonly logger = new Logger(OfferService.name);

  constructor(
    private readonly offerRepository: OfferRepository,
    @InjectModel(StoreOwnerProfile.name)
    private storeOwnerProfileModel: Model<StoreOwnerProfileDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new offer
   */
  async create(createDto: CreateOfferDto, storeId: string): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new BadRequestException('Invalid store ID');
    }

    // Verify store exists
    const store = await this.storeOwnerProfileModel.findById(storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Validate dates
    if (new Date(createDto.startDate) >= new Date(createDto.endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Validate discount value
    if (createDto.discountType === DiscountType.PERCENTAGE && createDto.discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    const offer = await this.offerRepository.create({
      ...createDto,
      storeId: new Types.ObjectId(storeId),
      applicableProducts: createDto.applicableProducts?.map(id => new Types.ObjectId(id)) || [],
    });

    this.logger.log(`Offer created: ${offer._id} for store ${storeId}`);

    this.eventEmitter.emit('offer.created', {
      offerId: (offer._id as Types.ObjectId).toString(),
      storeId,
      title: offer.title,
    });

    return offer;
  }

  /**
   * Get all offers with filters
   */
  async findAll(queryDto: QueryOfferDto): Promise<{
    data: OfferDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { storeId, discountType, isActive, currentOnly, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;

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

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Get offer by ID
   */
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

    // Increment view count
    await this.offerRepository.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    return offer;
  }

  /**
   * Update offer
   */
  async update(id: string, updateDto: UpdateOfferDto, storeId: string): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerRepository.getModel().findById(id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Verify ownership
    if ((offer.storeId as Types.ObjectId).toString() !== storeId) {
      throw new ForbiddenException('You do not have permission to update this offer');
    }

    // Validate dates if provided
    const startDate = updateDto.startDate || offer.startDate;
    const endDate = updateDto.endDate || offer.endDate;
    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Validate discount value if provided
    const discountType = updateDto.discountType || offer.discountType;
    const discountValue = updateDto.discountValue !== undefined ? updateDto.discountValue : offer.discountValue;
    if (discountType === DiscountType.PERCENTAGE && discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    // Update applicable products if provided
    if (updateDto.applicableProducts) {
      updateDto.applicableProducts = updateDto.applicableProducts.map(id => new Types.ObjectId(id)) as any;
    }

    Object.assign(offer, updateDto);
    await offer.save();

    this.logger.log(`Offer updated: ${id}`);

    return offer;
  }

  /**
   * Delete offer
   */
  async remove(id: string, storeId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerRepository.getModel().findById(id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Verify ownership
    if ((offer.storeId as Types.ObjectId).toString() !== storeId) {
      throw new ForbiddenException('You do not have permission to delete this offer');
    }

    await this.offerRepository.delete(id);

    this.logger.log(`Offer deleted: ${id}`);
  }

  /**
   * Get active offers for a store
   */
  async getActiveOffers(storeId: string): Promise<OfferDocument[]> {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new BadRequestException('Invalid store ID');
    }

    const now = new Date();

    const offers = await this.offerRepository
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

    return offers;
  }

  /**
   * Get offers for a specific product
   */
  async getOffersForProduct(productId: string): Promise<OfferDocument[]> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const now = new Date();

    const offers = await this.offerRepository
      .getModel()
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [
          { applicableProducts: { $size: 0 } }, // All products
          { applicableProducts: new Types.ObjectId(productId) }, // Specific product
        ],
      })
      .populate('storeId', 'storeName')
      .sort({ discountValue: -1 })
      .exec();

    return offers;
  }

  /**
   * Increment offer usage count
   */
  async incrementUsageCount(offerId: string): Promise<void> {
    if (!Types.ObjectId.isValid(offerId)) {
      throw new BadRequestException('Invalid offer ID');
    }

    await this.offerRepository.findByIdAndUpdate(offerId, { $inc: { usageCount: 1 } });

    this.logger.log(`Offer usage incremented: ${offerId}`);
  }

  /**
   * Get offer analytics
   */
  async getAnalytics(id: string, storeId: string): Promise<{
    viewCount: number;
    usageCount: number;
    conversionRate: number;
  }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerRepository.getModel().findById(id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Verify ownership
    if ((offer.storeId as Types.ObjectId).toString() !== storeId) {
      throw new ForbiddenException('You do not have permission to view this offer analytics');
    }

    const conversionRate = offer.viewCount > 0 ? (offer.usageCount / offer.viewCount) * 100 : 0;

    return {
      viewCount: offer.viewCount,
      usageCount: offer.usageCount,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    };
  }

  /**
   * Admin: Delete any offer
   */
  async adminRemove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const result = await this.offerRepository.delete(id);
    if (!result) {
      throw new NotFoundException('Offer not found');
    }

    this.logger.log(`Offer deleted by admin: ${id}`);
  }
}

