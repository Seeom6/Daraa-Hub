import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Product,
  ProductDocument,
} from '../../../../database/schemas/product.schema';
import { BaseRepository } from '../../../shared/base/base.repository';

@Injectable()
export class ProductRepository extends BaseRepository<ProductDocument> {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {
    super(productModel);
  }

  /**
   * Find products by store ID
   */
  async findByStoreId(
    storeId: string,
    options?: {
      page?: number;
      limit?: number;
      status?: string;
      categoryId?: string;
    },
  ): Promise<{ data: ProductDocument[]; total: number }> {
    const filter: any = { storeId: new Types.ObjectId(storeId) };

    if (options?.status) {
      filter.status = options.status;
    }

    if (options?.categoryId) {
      filter.categoryId = new Types.ObjectId(options.categoryId);
    }

    return this.findWithPagination(
      filter,
      options?.page || 1,
      options?.limit || 10,
    );
  }

  /**
   * Find product by slug
   */
  async findBySlug(slug: string): Promise<ProductDocument | null> {
    return this.findOne({ slug });
  }

  /**
   * Find product by SKU
   */
  async findBySku(sku: string): Promise<ProductDocument | null> {
    return this.findOne({ sku });
  }

  /**
   * Find products by category
   */
  async findByCategoryId(
    categoryId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: ProductDocument[]; total: number }> {
    return this.findWithPagination(
      { categoryId: new Types.ObjectId(categoryId) },
      page,
      limit,
    );
  }

  /**
   * Search products by name or description
   */
  async search(
    query: string,
    options?: {
      page?: number;
      limit?: number;
      storeId?: string;
      categoryId?: string;
    },
  ): Promise<{ data: ProductDocument[]; total: number }> {
    const filter: any = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    };

    if (options?.storeId) {
      filter.storeId = new Types.ObjectId(options.storeId);
    }

    if (options?.categoryId) {
      filter.categoryId = new Types.ObjectId(options.categoryId);
    }

    return this.findWithPagination(
      filter,
      options?.page || 1,
      options?.limit || 10,
    );
  }

  /**
   * Update product status
   */
  async updateStatus(
    productId: string,
    status: string,
  ): Promise<ProductDocument | null> {
    return this.findByIdAndUpdate(productId, { status });
  }

  /**
   * Increment view count
   */
  async incrementViews(productId: string): Promise<void> {
    await this.productModel.findByIdAndUpdate(productId, {
      $inc: { views: 1 },
    });
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 10): Promise<ProductDocument[]> {
    return this.productModel
      .find({ isFeatured: true, status: 'active' })
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get trending products (most viewed)
   */
  async getTrendingProducts(limit: number = 10): Promise<ProductDocument[]> {
    return this.productModel
      .find({ status: 'active' })
      .sort({ views: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get products with low stock
   */
  async getLowStockProducts(
    storeId: string,
    threshold: number = 10,
  ): Promise<ProductDocument[]> {
    return this.productModel
      .find({
        storeId: new Types.ObjectId(storeId),
        stockQuantity: { $lte: threshold },
        status: { $ne: 'out_of_stock' },
      })
      .exec();
  }
}
