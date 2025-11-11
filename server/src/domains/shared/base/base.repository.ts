import { Document, FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * Base Repository Interface
 * Defines common CRUD operations for all repositories
 */
export interface IBaseRepository<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string, options?: QueryOptions): Promise<T | null>;
  findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null>;
  findAll(filter?: FilterQuery<T>, options?: QueryOptions): Promise<T[]>;
  findWithPagination(
    filter: FilterQuery<T>,
    pagination: PaginationDto,
    options?: QueryOptions,
  ): Promise<{ data: T[]; total: number; page: number; limit: number }>;
  update(id: string, data: UpdateQuery<T>): Promise<T | null>;
  updateOne(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<T | null>;
  updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<number>;
  delete(id: string): Promise<boolean>;
  deleteOne(filter: FilterQuery<T>): Promise<boolean>;
  deleteMany(filter: FilterQuery<T>): Promise<number>;
  count(filter?: FilterQuery<T>): Promise<number>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
}

/**
 * Base Repository Implementation
 * Provides common CRUD operations for all repositories
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class ProductRepository extends BaseRepository<Product> {
 *   constructor(@InjectModel(Product.name) productModel: Model<Product>) {
 *     super(productModel);
 *   }
 * 
 *   // Add custom methods here
 *   async findByStoreId(storeId: string): Promise<Product[]> {
 *     return this.findAll({ store: storeId, isDeleted: false });
 *   }
 * }
 * ```
 */
export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  /**
   * Get the underlying Mongoose model for complex queries
   * Use this when you need to use Mongoose query chaining or aggregation
   */
  getModel(): Model<T> {
    return this.model;
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return document.save();
  }

  /**
   * Find document by ID
   */
  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    return this.model.findById(id, null, options).exec();
  }

  /**
   * Find one document by filter
   */
  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    return this.model.findOne(filter, null, options).exec();
  }

  /**
   * Find all documents by filter
   */
  async findAll(filter: FilterQuery<T> = {}, options?: QueryOptions): Promise<T[]> {
    return this.model.find(filter, null, options).exec();
  }

  /**
   * Find documents with pagination
   */
  async findWithPagination(
    filter: FilterQuery<T>,
    pageOrPagination: number | PaginationDto,
    limitOrOptions?: number | QueryOptions,
    options?: QueryOptions,
  ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    let page: number;
    let limit: number;
    let queryOptions: QueryOptions | undefined;

    // Handle overloaded parameters
    if (typeof pageOrPagination === 'number') {
      page = pageOrPagination;
      limit = typeof limitOrOptions === 'number' ? limitOrOptions : 10;
      queryOptions = typeof limitOrOptions === 'object' ? limitOrOptions : options;
    } else {
      page = pageOrPagination.page || 1;
      limit = pageOrPagination.limit || 10;
      queryOptions = limitOrOptions as QueryOptions;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(filter, null, { ...queryOptions, skip, limit }).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Update document by ID
   */
  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  /**
   * Alias for update method
   */
  async findByIdAndUpdate(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.update(id, data);
  }

  /**
   * Alias for findAll method
   */
  async find(filter: FilterQuery<T> = {}, options?: QueryOptions): Promise<T[]> {
    return this.findAll(filter, options);
  }

  /**
   * Update one document by filter
   */
  async updateOne(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, data, { new: true }).exec();
  }

  /**
   * Update many documents by filter
   */
  async updateMany(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<number> {
    const result = await this.model.updateMany(filter, data).exec();
    return result.modifiedCount;
  }

  /**
   * Delete document by ID (soft delete if isDeleted field exists)
   */
  async delete(id: string): Promise<boolean> {
    // Check if model has isDeleted field
    const schema = this.model.schema;
    if (schema.path('isDeleted')) {
      const result = await this.model
        .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
        .exec();
      return !!result;
    }

    // Hard delete if no isDeleted field
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  /**
   * Delete one document by filter (soft delete if isDeleted field exists)
   */
  async deleteOne(filter: FilterQuery<T>): Promise<boolean> {
    // Check if model has isDeleted field
    const schema = this.model.schema;
    if (schema.path('isDeleted')) {
      const result = await this.model
        .findOneAndUpdate(filter, { isDeleted: true }, { new: true })
        .exec();
      return !!result;
    }

    // Hard delete if no isDeleted field
    const result = await this.model.findOneAndDelete(filter).exec();
    return !!result;
  }

  /**
   * Delete many documents by filter (soft delete if isDeleted field exists)
   */
  async deleteMany(filter: FilterQuery<T>): Promise<number> {
    // Check if model has isDeleted field
    const schema = this.model.schema;
    if (schema.path('isDeleted')) {
      const result = await this.model.updateMany(filter, { isDeleted: true }).exec();
      return result.modifiedCount;
    }

    // Hard delete if no isDeleted field
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount;
  }

  /**
   * Count documents by filter
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  /**
   * Check if document exists by filter
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1).exec();
    return count > 0;
  }

  /**
   * Build filter for soft delete
   * Automatically adds isDeleted: false if the field exists
   */
  protected buildFilter(filter: FilterQuery<T>): FilterQuery<T> {
    const schema = this.model.schema;
    if (schema.path('isDeleted') && !('isDeleted' in filter)) {
      return { ...filter, isDeleted: false } as FilterQuery<T>;
    }
    return filter;
  }

  /**
   * Build sort options from string
   * @example buildSort('-createdAt,name') => { createdAt: -1, name: 1 }
   */
  protected buildSort(sortString?: string): Record<string, 1 | -1> | undefined {
    if (!sortString) return undefined;

    const sortFields = sortString.split(',');
    const sort: Record<string, 1 | -1> = {};

    for (const field of sortFields) {
      if (field.startsWith('-')) {
        sort[field.substring(1)] = -1;
      } else {
        sort[field] = 1;
      }
    }

    return sort;
  }

  /**
   * Build populate options from string
   * @example buildPopulate('store,category') => [{ path: 'store' }, { path: 'category' }]
   */
  protected buildPopulate(populateString?: string): string[] | undefined {
    if (!populateString) return undefined;
    return populateString.split(',').map((p) => p.trim());
  }
}

