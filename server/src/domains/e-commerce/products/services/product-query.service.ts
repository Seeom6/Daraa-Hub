import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductDocument } from '../../../../database/schemas/product.schema';
import { QueryProductDto } from '../dto';
import { ProductRepository } from '../repositories/product.repository';
import { ProductValidationService } from './product-validation.service';

/**
 * Product Query Service
 * Handles all read/query operations for products
 */
@Injectable()
export class ProductQueryService {
  private readonly logger = new Logger(ProductQueryService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly validationService: ProductValidationService,
  ) {}

  async findAll(query: QueryProductDto): Promise<{
    data: ProductDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
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

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    if (storeId) filter.storeId = new Types.ObjectId(storeId);
    if (categoryId) filter.categoryId = new Types.ObjectId(categoryId);
    if (status) filter.status = status;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (isFeatured !== undefined) filter.isFeatured = isFeatured;

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

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

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<ProductDocument> {
    this.validationService.validateObjectId(id, 'product ID');

    const product = await this.productRepository
      .getModel()
      .findById(id)
      .populate('storeId', 'businessName storeDescription')
      .populate('categoryId', 'name slug')
      .populate('variants')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.productRepository
      .getModel()
      .findByIdAndUpdate(id, { $inc: { viewCount: 1 } })
      .exec();

    return product;
  }

  async findBySlug(slug: string): Promise<ProductDocument> {
    const product = await this.productRepository
      .getModel()
      .findOne({ slug })
      .populate('storeId', 'businessName storeDescription')
      .populate('categoryId', 'name slug')
      .populate('variants')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.productRepository
      .getModel()
      .findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } })
      .exec();

    return product;
  }
}
