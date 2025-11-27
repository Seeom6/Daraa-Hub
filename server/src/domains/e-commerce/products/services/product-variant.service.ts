import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductVariant, ProductVariantDocument } from '../../../../database/schemas/product-variant.schema';
import { CreateVariantDto, UpdateVariantDto } from '../dto';
import { ProductRepository } from '../repositories/product.repository';

/**
 * Service responsible for product variant management
 * Handles variant CRUD operations
 */
@Injectable()
export class ProductVariantService {
  private readonly logger = new Logger(ProductVariantService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    @InjectModel(ProductVariant.name)
    private readonly variantModel: Model<ProductVariantDocument>,
  ) {}

  /**
   * Create a new variant for a product
   */
  async createVariant(createVariantDto: CreateVariantDto): Promise<ProductVariantDocument> {
    const product = await this.productRepository.getModel().findById(createVariantDto.productId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if SKU already exists
    if (createVariantDto.sku) {
      const existingSku = await this.variantModel.findOne({ sku: createVariantDto.sku }).exec();
      if (existingSku) {
        throw new ConflictException(`Variant with SKU '${createVariantDto.sku}' already exists`);
      }
    }

    const variant = new this.variantModel({
      ...createVariantDto,
      productId: new Types.ObjectId(createVariantDto.productId),
    });

    const saved = await variant.save();

    this.logger.log(`Variant created for product: ${createVariantDto.productId}`);
    return saved;
  }

  /**
   * Get all variants for a product
   */
  async findVariantsByProduct(productId: string): Promise<ProductVariantDocument[]> {
    return await this.variantModel.find({ productId: new Types.ObjectId(productId) }).exec();
  }

  /**
   * Update a variant
   */
  async updateVariant(id: string, updateVariantDto: UpdateVariantDto): Promise<ProductVariantDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid variant ID');
    }

    const variant = await this.variantModel.findById(id).exec();
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Check if SKU already exists (if updating SKU)
    if (updateVariantDto.sku && updateVariantDto.sku !== variant.sku) {
      const existingSku = await this.variantModel.findOne({ sku: updateVariantDto.sku }).exec();
      if (existingSku) {
        throw new ConflictException(`Variant with SKU '${updateVariantDto.sku}' already exists`);
      }
    }

    Object.assign(variant, updateVariantDto);
    return await variant.save();
  }

  /**
   * Delete a variant
   */
  async removeVariant(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid variant ID');
    }

    const variant = await this.variantModel.findById(id).exec();
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Remove variant reference from product
    await this.productRepository.getModel()
      .findByIdAndUpdate(variant.productId, {
        $pull: { variants: variant._id },
      })
      .exec();

    await this.variantModel.findByIdAndDelete(id).exec();

    this.logger.log(`Variant deleted: ${id}`);
  }
}

