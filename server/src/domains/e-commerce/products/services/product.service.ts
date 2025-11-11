import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductDocument, ProductStatus } from '../../../../database/schemas/product.schema';
import { ProductVariant, ProductVariantDocument } from '../../../../database/schemas/product-variant.schema';
import { StoreSubscription, StoreSubscriptionDocument, SubscriptionStatus } from '../../../../database/schemas/store-subscription.schema';
import { StoreOwnerProfile, StoreOwnerProfileDocument } from '../../../../database/schemas/store-owner-profile.schema';
import { SystemSettings, SystemSettingsDocument } from '../../../../database/schemas/system-settings.schema';
import { CreateProductDto, UpdateProductDto, QueryProductDto, CreateVariantDto, UpdateVariantDto } from '../dto';
import { CategoryService } from '../../categories/services/category.service';
import { ProductRepository } from '../repositories/product.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    @InjectModel(ProductVariant.name)
    private readonly variantModel: Model<ProductVariantDocument>,
    @InjectModel(StoreSubscription.name)
    private readonly subscriptionModel: Model<StoreSubscriptionDocument>,
    @InjectModel(StoreOwnerProfile.name)
    private readonly storeProfileModel: Model<StoreOwnerProfileDocument>,
    @InjectModel(SystemSettings.name)
    private readonly settingsModel: Model<SystemSettingsDocument>,
    private readonly categoryService: CategoryService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createProductDto: CreateProductDto, userId: string): Promise<ProductDocument> {
    // Check subscription limits
    await this.checkSubscriptionLimits(createProductDto.storeId, createProductDto.images?.length || 0);

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

    // Verify category exists
    await this.categoryService.findOne(createProductDto.categoryId);

    const saved = await this.productRepository.create(createProductDto as any);

    // Increment category product count
    await this.categoryService.incrementProductCount(createProductDto.categoryId);

    // Increment daily usage counter
    await this.incrementDailyUsage(createProductDto.storeId);

    this.logger.log(`Product created: ${saved.name} (${saved._id}) by user: ${userId}`);
    return saved;
  }

  async findAll(query: QueryProductDto): Promise<{ data: ProductDocument[]; total: number; page: number; limit: number }> {
    const {
      search,
      storeId,
      categoryId,
      status,
      isFeatured,
      hasVariants,
      minPrice,
      maxPrice,
      minRating,
      tags,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (storeId) {
      filter.storeId = new Types.ObjectId(storeId);
    }

    if (categoryId) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    if (status) {
      filter.status = status;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    if (hasVariants !== undefined) {
      filter.hasVariants = hasVariants;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (minRating !== undefined) {
      filter.rating = { $gte: minRating };
    }

    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      filter.tags = { $in: tagArray };
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.productRepository.getModel()
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('storeId', 'storeName')
        .populate('categoryId', 'name slug')
        .exec(),
      this.productRepository.getModel().countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productRepository.getModel()
      .findById(id)
      .populate('storeId', 'storeName storeDescription')
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

  async findBySlug(slug: string): Promise<ProductDocument> {
    const product = await this.productRepository.getModel()
      .findOne({ slug })
      .populate('storeId', 'storeName storeDescription')
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

  async update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productRepository.getModel().findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check slug uniqueness if being updated
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existingSlug = await this.productRepository.getModel().findOne({ slug: updateProductDto.slug }).exec();
      if (existingSlug) {
        throw new ConflictException(`Product with slug '${updateProductDto.slug}' already exists`);
      }
    }

    // Check SKU uniqueness if being updated
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productRepository.getModel().findOne({ sku: updateProductDto.sku }).exec();
      if (existingSku) {
        throw new ConflictException(`Product with SKU '${updateProductDto.sku}' already exists`);
      }
    }

    // If category is being updated, verify it exists and update counts
    if (updateProductDto.categoryId && updateProductDto.categoryId !== product.categoryId.toString()) {
      await this.categoryService.findOne(updateProductDto.categoryId);
      await this.categoryService.decrementProductCount(product.categoryId.toString());
      await this.categoryService.incrementProductCount(updateProductDto.categoryId);
    }

    Object.assign(product, updateProductDto);
    const updated = await product.save();

    this.logger.log(`Product updated: ${updated.name} (${updated._id}) by user: ${userId}`);
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productRepository.getModel().findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Delete all variants
    await this.variantModel.deleteMany({ productId: id }).exec();

    // Decrement category product count
    await this.categoryService.decrementProductCount(product.categoryId.toString());

    await this.productRepository.getModel().findByIdAndDelete(id).exec();
    this.logger.log(`Product deleted: ${product.name} (${id}) by user: ${userId}`);
  }

  async addImages(id: string, imageUrls: string[]): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productRepository.getModel().findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.images.push(...imageUrls);

    // Set first image as main image if not set
    if (!product.mainImage && imageUrls.length > 0) {
      product.mainImage = imageUrls[0];
    }

    return await product.save();
  }

  async removeImage(id: string, imageUrl: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productRepository.getModel().findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.images = product.images.filter(img => img !== imageUrl);

    // Update main image if it was removed
    if (product.mainImage === imageUrl) {
      product.mainImage = product.images.length > 0 ? product.images[0] : undefined;
    }

    return await product.save();
  }

  // Variant methods
  async createVariant(createVariantDto: CreateVariantDto): Promise<ProductVariantDocument> {
    const product = await this.productRepository.getModel().findById(createVariantDto.productId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check SKU uniqueness if provided
    if (createVariantDto.sku) {
      const existingSku = await this.variantModel.findOne({ sku: createVariantDto.sku }).exec();
      if (existingSku) {
        throw new ConflictException(`Variant with SKU '${createVariantDto.sku}' already exists`);
      }
    }

    const variant = new this.variantModel(createVariantDto);
    const saved = await variant.save();

    // Update product to indicate it has variants
    if (!product.hasVariants) {
      product.hasVariants = true;
      await product.save();
    }

    this.logger.log(`Variant created for product: ${createVariantDto.productId}`);
    return saved;
  }

  async findVariantsByProduct(productId: string): Promise<ProductVariantDocument[]> {
    return await this.variantModel.find({ productId: new Types.ObjectId(productId) }).exec();
  }

  async updateVariant(id: string, updateVariantDto: UpdateVariantDto): Promise<ProductVariantDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid variant ID');
    }

    const variant = await this.variantModel.findById(id).exec();
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Check SKU uniqueness if being updated
    if (updateVariantDto.sku && updateVariantDto.sku !== variant.sku) {
      const existingSku = await this.variantModel.findOne({ sku: updateVariantDto.sku }).exec();
      if (existingSku) {
        throw new ConflictException(`Variant with SKU '${updateVariantDto.sku}' already exists`);
      }
    }

    Object.assign(variant, updateVariantDto);
    return await variant.save();
  }

  async removeVariant(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid variant ID');
    }

    const variant = await this.variantModel.findById(id).exec();
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    await this.variantModel.findByIdAndDelete(id).exec();

    // Check if product still has variants
    const remainingVariants = await this.variantModel.countDocuments({ productId: variant.productId }).exec();
    if (remainingVariants === 0) {
      await this.productRepository.getModel().findByIdAndUpdate(variant.productId, { hasVariants: false }).exec();
    }

    this.logger.log(`Variant deleted: ${id}`);
  }

  async verifyOwnership(productId: string, storeId: string): Promise<boolean> {
    const product = await this.productRepository.getModel().findById(productId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product.storeId.toString() === storeId;
  }

  /**
   * Check subscription limits before creating product
   */
  private async checkSubscriptionLimits(storeId: string, imageCount: number): Promise<void> {
    // Check if subscription system is enabled
    const settings = await this.settingsModel.findOne({ key: 'subscription' }).exec();
    const subscriptionSystemEnabled = settings?.value?.subscriptionSystemEnabled === true;

    if (!subscriptionSystemEnabled) {
      // Subscription system is disabled, allow all
      return;
    }

    // Get store profile
    const storeProfile = await this.storeProfileModel.findById(storeId).exec();
    if (!storeProfile) {
      throw new NotFoundException('Store not found');
    }

    // Check if store has active subscription
    if (!storeProfile.hasActiveSubscription) {
      throw new ForbiddenException(
        'Your subscription has expired. Please renew to continue publishing products.',
      );
    }

    // Get active subscription
    const subscription = await this.subscriptionModel
      .findOne({
        storeId: new Types.ObjectId(storeId),
        status: SubscriptionStatus.ACTIVE,
      })
      .populate('planId')
      .exec();

    if (!subscription) {
      throw new ForbiddenException(
        'No active subscription found. Please subscribe to a plan to continue.',
      );
    }

    // Check if subscription has expired
    if (subscription.endDate < new Date()) {
      throw new ForbiddenException(
        'Your subscription has expired. Please renew to continue publishing products.',
      );
    }

    // Check daily limit
    const todayUsage = subscription.getTodayUsage();
    const dailyLimit = storeProfile.dailyProductLimit;

    if (todayUsage >= dailyLimit) {
      // Emit event for notification
      this.eventEmitter.emit('subscription.dailyLimitReached', {
        storeId: storeId,
        dailyLimit,
      });

      throw new ForbiddenException(
        `Daily product limit reached (${dailyLimit} products/day). Please upgrade your plan or wait until tomorrow.`,
      );
    }

    // Check image limit
    const maxImages = storeProfile.maxImagesPerProduct;
    if (imageCount > maxImages) {
      throw new ForbiddenException(
        `Image limit exceeded. Your plan allows maximum ${maxImages} images per product.`,
      );
    }
  }

  /**
   * Increment daily usage counter after product creation
   */
  private async incrementDailyUsage(storeId: string): Promise<void> {
    // Check if subscription system is enabled
    const settings = await this.settingsModel.findOne({ key: 'subscription' }).exec();
    const subscriptionSystemEnabled = settings?.value?.subscriptionSystemEnabled === true;

    if (!subscriptionSystemEnabled) {
      return;
    }

    // Get active subscription
    const subscription = await this.subscriptionModel
      .findOne({
        storeId: new Types.ObjectId(storeId),
        status: SubscriptionStatus.ACTIVE,
      })
      .exec();

    if (subscription) {
      await subscription.incrementTodayUsage();
      this.logger.log(`Daily usage incremented for store ${storeId}: ${subscription.getTodayUsage()}`);
    }
  }
}

