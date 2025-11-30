import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Offer,
  OfferDocument,
} from '../../../../database/schemas/offer.schema';
import { BaseRepository } from '../../../shared/base/base.repository';

@Injectable()
export class OfferRepository extends BaseRepository<OfferDocument> {
  constructor(
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
  ) {
    super(offerModel);
  }

  /**
   * Find active offers
   */
  async findActiveOffers(storeId?: string): Promise<OfferDocument[]> {
    const filter: any = {
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    };

    if (storeId) {
      filter.storeId = new Types.ObjectId(storeId);
    }

    return this.find(filter);
  }

  /**
   * Find offers by product ID
   */
  async findByProductId(productId: string): Promise<OfferDocument[]> {
    return this.find({
      productId: new Types.ObjectId(productId),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });
  }
}
