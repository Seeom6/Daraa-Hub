import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  StoreOwnerProfile,
  StoreOwnerProfileDocument,
} from '../../../../database/schemas/store-owner-profile.schema';
import { ProductRepository } from '../repositories/product.repository';
import { ProductDocument } from '../../../../database/schemas/product.schema';

/**
 * Service responsible for product media management
 * Handles product images (add, remove)
 */
@Injectable()
export class ProductMediaService {
  private readonly logger = new Logger(ProductMediaService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    @InjectModel(StoreOwnerProfile.name)
    private readonly storeProfileModel: Model<StoreOwnerProfileDocument>,
  ) {}

  /**
   * Add images to a product
   */
  async addImages(id: string, imageUrls: string[]): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productRepository.getModel().findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check image limit
    const storeProfile = await this.storeProfileModel
      .findById(product.storeId)
      .exec();
    const maxImages = storeProfile?.maxImagesPerProduct || 10;
    const totalImages = (product.images?.length || 0) + imageUrls.length;

    if (totalImages > maxImages) {
      throw new ForbiddenException(
        `Image limit exceeded. Your plan allows maximum ${maxImages} images per product.`,
      );
    }

    // Add images
    product.images = [...(product.images || []), ...imageUrls];

    // Set main image if not set
    if (!product.mainImage && imageUrls.length > 0) {
      product.mainImage = imageUrls[0];
    }

    return await product.save();
  }

  /**
   * Remove an image from a product
   */
  async removeImage(id: string, imageUrl: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productRepository.getModel().findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Remove image
    product.images = product.images.filter((img) => img !== imageUrl);

    // Update main image if it was removed
    if (product.mainImage === imageUrl) {
      product.mainImage =
        product.images.length > 0 ? product.images[0] : undefined;
    }

    return await product.save();
  }
}
