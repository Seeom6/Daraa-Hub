import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  OfferDocument,
  DiscountType,
} from '../../../../database/schemas/offer.schema';
import {
  StoreOwnerProfile,
  StoreOwnerProfileDocument,
} from '../../../../database/schemas/store-owner-profile.schema';
import { CreateOfferDto } from '../dto/create-offer.dto';
import { UpdateOfferDto } from '../dto/update-offer.dto';
import { OfferRepository } from '../repositories/offer.repository';

/**
 * Service for offer CRUD operations
 * Handles creation, update, and deletion
 */
@Injectable()
export class OfferCrudService {
  private readonly logger = new Logger(OfferCrudService.name);

  constructor(
    private readonly offerRepository: OfferRepository,
    @InjectModel(StoreOwnerProfile.name)
    private storeOwnerProfileModel: Model<StoreOwnerProfileDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    createDto: CreateOfferDto,
    storeId: string,
  ): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new BadRequestException('Invalid store ID');
    }

    const store = await this.storeOwnerProfileModel.findById(storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (new Date(createDto.startDate) >= new Date(createDto.endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (
      createDto.discountType === DiscountType.PERCENTAGE &&
      createDto.discountValue > 100
    ) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    const offer = await this.offerRepository.create({
      ...createDto,
      storeId: new Types.ObjectId(storeId),
      applicableProducts:
        createDto.applicableProducts?.map((id) => new Types.ObjectId(id)) || [],
    });

    this.logger.log(`Offer created: ${offer._id} for store ${storeId}`);

    this.eventEmitter.emit('offer.created', {
      offerId: (offer._id as Types.ObjectId).toString(),
      storeId,
      title: offer.title,
    });

    return offer;
  }

  async update(
    id: string,
    updateDto: UpdateOfferDto,
    storeId: string,
  ): Promise<OfferDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerRepository.getModel().findById(id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.storeId.toString() !== storeId) {
      throw new ForbiddenException(
        'You do not have permission to update this offer',
      );
    }

    const startDate = updateDto.startDate || offer.startDate;
    const endDate = updateDto.endDate || offer.endDate;
    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    const discountType = updateDto.discountType || offer.discountType;
    const discountValue =
      updateDto.discountValue !== undefined
        ? updateDto.discountValue
        : offer.discountValue;
    if (discountType === DiscountType.PERCENTAGE && discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    if (updateDto.applicableProducts) {
      updateDto.applicableProducts = updateDto.applicableProducts.map(
        (id) => new Types.ObjectId(id),
      ) as any;
    }

    Object.assign(offer, updateDto);
    await offer.save();

    this.logger.log(`Offer updated: ${id}`);

    return offer;
  }

  async remove(id: string, storeId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.offerRepository.getModel().findById(id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.storeId.toString() !== storeId) {
      throw new ForbiddenException(
        'You do not have permission to delete this offer',
      );
    }

    await this.offerRepository.delete(id);

    this.logger.log(`Offer deleted: ${id}`);
  }

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
