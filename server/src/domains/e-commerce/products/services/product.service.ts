import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductDocument, ProductStatus } from '../../../../database/schemas/product.schema';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from '../dto';
import { CategoryService } from '../../categories/services/category.service';
import { ProductRepository } from '../repositories/product.repository';
import { ProductSubscriptionService } from './product-subscription.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Core Product Service
 * Handles CRUD operations for products
 */
@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryService: CategoryService,
    private readonly productSubscriptionService: ProductSubscriptionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new product
   */
  async create(createProductDto: CreateProductDto, userId: string): Promise<ProductDocument> {
    // Check subscription limits
    await this.productSubscriptionService.checkSubscriptionLimits(
      createProductDto.storeId,
      createProductDto.images?.length || 0,
    );

    // Check if slug already exists
    const existingSlug = await this.productRepository.findOne({ slug: createProductDto.slug });
    if (existingSlug) {
      throw new ConflictException(`Product with slug '${createProductDto.slug}' already exists`);
    }

    // Check if SKU already exists (if provided)
    if (createProductDto.sku) {
      const existingSku = await this.productRepository.findOne({ sku: createProductDto.sku });
      if (existingSku) {
        throw new ConflictException(`Product with SKU '${createProductDto.sku}' already exists`);
      }
    }

    // Validate category exists
    if (createProductDto.categoryId) {
      await this.categoryService.findOne(createProductDto.categoryId);
    }

    // Convert specifications Record to Map if provided
    const specifications = createProductDto.specifications
      ? new Map(Object.entries(createProductDto.specifications))
      : undefined;

    const product = await this.productRepository.create({
      ...createProductDto,
      storeId: new Types.ObjectId(createProductDto.storeId),
      categoryId: createProductDto.categoryId ? new Types.ObjectId(createProductDto.categoryId) : undefined,
      specifications,
    });

    const saved = await product.save();

    // Increment daily usage
    await this.productSubscriptionService.incrementDailyUsage(createProductDto.storeId);

    this.logger.log(`Product created: ${saved.name} (${saved._id}) by user: ${userId}`);
    return saved;
  }

  /**
   * Get all products with filters
   */
  async findAll(query: QueryProductDto): Promise<{ data: ProductDocument[]; total: number; page: number; limit: number }> {
    const {
      search,
      storeId,
      categoryId,
      status,
      minPrice,
      maxPrice,
      isFeatured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const filter: any = {};

    // Search by name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by store
    if (storeId) {
      filter.storeId = new Types.ObjectId(storeId);
    }

    // Filter by category
    if (categoryId) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = maxPrice;
      }
    }

    // Filter by featured
    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.productRepository
        .getModel()
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('storeId', 'businessName')
        .populate('categoryId', 'name slug')
        .exec(),
      this.productRepository.count(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single product by ID
   */
  async findOne(id: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productRepository.getModel()
      .findById(id)
      .populate('storeId', 'businessName storeDescription')
      .populate('categoryId', 'name slug')
      .populate('variants')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.productRepository.getModel().findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();

    return product;
  }

  /**
   * Get a single product by slug
   */
  async findBySlug(slug: string): Promise<ProductDocument> {
    const product = await this.productRepository.getModel()
      .findOne({ slug })
      .populate('storeId', 'businessName storeDescription')
      .populate('categoryId', 'name slug')
      .populate('variants')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.productRepository.getModel().findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } }).exec();

    return product;
  }

  /**
   * Update a product
   */
  async update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productRepository.getModel().findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if slug is being updated and already exists
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existingSlug = await this.productRepository.findOne({ slug: updateProductDto.slug });
      if (existingSlug) {
        throw new ConflictException(`Product with slug '${updateProductDto.slug}' already exists`);
      }
    }

    // Check if SKU is being updated and already exists
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productRepository.findOne({ sku: updateProductDto.sku });
      if (existingSku) {
        throw new ConflictException(`Product with SKU '${updateProductDto.sku}' already exists`);
      }
    }

    // Validate category exists (if updating)
    if (updateProductDto.categoryId) {
      await this.categoryService.findOne(updateProductDto.categoryId);
    }

    Object.assign(product, updateProductDto);
    const updated = await product.save();

    this.logger.log(`Product updated: ${updated.name} (${updated._id}) by user: ${userId}`);
    return updated;
  }

  /**
   * Delete a product
   */
  async remove(id: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productRepository.getModel().findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // TODO: Check if product has active orders before deletion

    await this.productRepository.getModel().findByIdAndDelete(id).exec();
    this.logger.log(`Product deleted: ${product.name} (${id}) by user: ${userId}`);
  }

  /**
   * Verify product ownership
   */
  async verifyOwnership(productId: string, storeId: string): Promise<boolean> {
    const product = await this.productRepository.getModel().findById(productId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product.storeId.toString() === storeId;
  }
}

