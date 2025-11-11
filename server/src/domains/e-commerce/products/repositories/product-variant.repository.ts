import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductVariant, ProductVariantDocument } from '../../../../database/schemas/product-variant.schema';
import { BaseRepository } from '../../../shared/base/base.repository';

@Injectable()
export class ProductVariantRepository extends BaseRepository<ProductVariantDocument> {
  constructor(
    @InjectModel(ProductVariant.name) private readonly productVariantModel: Model<ProductVariantDocument>,
  ) {
    super(productVariantModel);
  }

  /**
   * Find variants by product ID
   */
  async findByProductId(productId: string): Promise<ProductVariantDocument[]> {
    return this.model.find({ productId }).exec();
  }

  /**
   * Find active variants by product ID
   */
  async findActiveByProductId(productId: string): Promise<ProductVariantDocument[]> {
    return this.model.find({ productId, isActive: true }).exec();
  }

  /**
   * Find variant by SKU
   */
  async findBySku(sku: string): Promise<ProductVariantDocument | null> {
    return this.model.findOne({ sku }).exec();
  }
}

