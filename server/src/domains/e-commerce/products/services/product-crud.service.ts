import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductDocument } from '../../../../database/schemas/product.schema';
import { CreateProductDto, UpdateProductDto } from '../dto';
import { ProductRepository } from '../repositories/product.repository';
import { ProductSubscriptionService } from './product-subscription.service';
import { ProductValidationService } from './product-validation.service';

/**
 * Product CRUD Service
 * Handles create, update, delete operations for products
 */
@Injectable()
export class ProductCrudService {
  private readonly logger = new Logger(ProductCrudService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productSubscriptionService: ProductSubscriptionService,
    private readonly validationService: ProductValidationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    userId: string,
  ): Promise<ProductDocument> {
    // Check subscription limits
    await this.productSubscriptionService.checkSubscriptionLimits(
      createProductDto.storeId,
      createProductDto.images?.length || 0,
    );

    // Validate slug uniqueness
    await this.validationService.validateSlugUniqueness(createProductDto.slug);

    // Validate SKU uniqueness (if provided)
    if (createProductDto.sku) {
      await this.validationService.validateSkuUniqueness(createProductDto.sku);
    }

    // Validate category exists
    if (createProductDto.categoryId) {
      await this.validationService.validateCategory(
        createProductDto.categoryId,
      );
    }

    // Convert specifications Record to Map if provided
    const specifications = createProductDto.specifications
      ? new Map(Object.entries(createProductDto.specifications))
      : undefined;

    const product = await this.productRepository.create({
      ...createProductDto,
      storeId: new Types.ObjectId(createProductDto.storeId),
      categoryId: createProductDto.categoryId
        ? new Types.ObjectId(createProductDto.categoryId)
        : undefined,
      specifications,
    });

    const saved = await product.save();

    // Increment daily usage
    await this.productSubscriptionService.incrementDailyUsage(
      createProductDto.storeId,
    );

    this.logger.log(
      `Product created: ${saved.name} (${saved._id}) by user: ${userId}`,
    );
    return saved;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId: string,
  ): Promise<ProductDocument> {
    this.validationService.validateObjectId(id, 'product ID');

    const product = await this.productRepository.getModel().findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if slug is being updated
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      await this.validationService.validateSlugUniqueness(
        updateProductDto.slug,
        id,
      );
    }

    // Check if SKU is being updated
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      await this.validationService.validateSkuUniqueness(
        updateProductDto.sku,
        id,
      );
    }

    // Validate category exists (if updating)
    if (updateProductDto.categoryId) {
      await this.validationService.validateCategory(
        updateProductDto.categoryId,
      );
    }

    Object.assign(product, updateProductDto);
    const updated = await product.save();

    this.logger.log(
      `Product updated: ${updated.name} (${updated._id}) by user: ${userId}`,
    );
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    this.validationService.validateObjectId(id, 'product ID');

    const product = await this.productRepository.getModel().findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.getModel().findByIdAndDelete(id).exec();
    this.logger.log(
      `Product deleted: ${product.name} (${id}) by user: ${userId}`,
    );
  }
}
