import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductRepository } from '../repositories/product.repository';
import { CategoryService } from '../../categories/services/category.service';

/**
 * Product Validation Service
 * Handles validation operations for products
 */
@Injectable()
export class ProductValidationService {
  private readonly logger = new Logger(ProductValidationService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryService: CategoryService,
  ) {}

  validateObjectId(id: string, fieldName: string = 'ID'): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
  }

  async validateSlugUniqueness(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.productRepository.findOne({ slug });
    if (existing) {
      const existingId = (existing._id as Types.ObjectId).toString();
      if (!excludeId || existingId !== excludeId) {
        throw new ConflictException(
          `Product with slug '${slug}' already exists`,
        );
      }
    }
  }

  async validateSkuUniqueness(sku: string, excludeId?: string): Promise<void> {
    const existing = await this.productRepository.findOne({ sku });
    if (existing) {
      const existingId = (existing._id as Types.ObjectId).toString();
      if (!excludeId || existingId !== excludeId) {
        throw new ConflictException(`Product with SKU '${sku}' already exists`);
      }
    }
  }

  async validateCategory(categoryId: string): Promise<void> {
    await this.categoryService.findOne(categoryId);
  }

  async validateProductExists(id: string): Promise<void> {
    this.validateObjectId(id, 'product ID');
    const product = await this.productRepository.getModel().findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  async verifyOwnership(productId: string, storeId: string): Promise<boolean> {
    const product = await this.productRepository
      .getModel()
      .findById(productId)
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product.storeId.toString() === storeId;
  }
}
