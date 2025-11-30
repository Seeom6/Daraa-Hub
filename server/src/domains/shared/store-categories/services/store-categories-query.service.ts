import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  StoreCategory,
  StoreCategoryDocument,
} from '../../../../database/schemas/store-category.schema';
import { StoreCategoryCacheService } from './store-category-cache.service';

/**
 * Store Categories Query Service
 * Handles all read/query operations
 */
@Injectable()
export class StoreCategoriesQueryService {
  private readonly logger = new Logger(StoreCategoriesQueryService.name);

  constructor(
    @InjectModel(StoreCategory.name)
    private storeCategoryModel: Model<StoreCategoryDocument>,
    private cacheService: StoreCategoryCacheService,
  ) {}

  async findAll(options?: {
    parentCategory?: string;
    level?: number;
    isActive?: boolean;
    includeSubcategories?: boolean;
    includeDeleted?: boolean;
  }): Promise<StoreCategory[]> {
    const filter: any = {};

    if (options?.parentCategory !== undefined) {
      filter.parentCategory =
        options.parentCategory === 'null' ? null : options.parentCategory;
    }
    if (options?.level !== undefined) filter.level = options.level;
    if (options?.isActive !== undefined) filter.isActive = options.isActive;
    if (!options?.includeDeleted) filter.isDeleted = false;

    const query = this.storeCategoryModel
      .find(filter)
      .sort({ order: 1, name: 1 });

    if (options?.includeSubcategories) {
      query.populate('subcategories');
    }

    return query.exec();
  }

  async findRootCategories(
    includeSubcategories = false,
  ): Promise<StoreCategory[]> {
    const query = this.storeCategoryModel
      .find({ level: 0, isActive: true, isDeleted: false })
      .sort({ order: 1, name: 1 });

    if (includeSubcategories) {
      query.populate({
        path: 'subcategories',
        match: { isActive: true, isDeleted: false },
        options: { sort: { order: 1, name: 1 } },
      });
    }

    return query.exec();
  }

  async findById(
    id: string,
    includeSubcategories = false,
  ): Promise<StoreCategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف التصنيف غير صحيح');
    }

    // Try cache first
    if (!includeSubcategories) {
      const cached = await this.cacheService.getCachedCategory(id);
      if (cached) return cached;
    }

    const query = this.storeCategoryModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (includeSubcategories) {
      query.populate({
        path: 'subcategories',
        match: { isActive: true, isDeleted: false },
        options: { sort: { order: 1, name: 1 } },
      });
    }

    const category = await query.exec();
    if (!category) throw new NotFoundException('التصنيف غير موجود');

    if (!includeSubcategories) {
      await this.cacheService.cacheCategory(category);
    }

    return category;
  }

  async findBySlug(
    slug: string,
    includeSubcategories = false,
  ): Promise<StoreCategory> {
    const query = this.storeCategoryModel.findOne({ slug, isDeleted: false });

    if (includeSubcategories) {
      query.populate({
        path: 'subcategories',
        match: { isActive: true },
        options: { sort: { order: 1, name: 1 } },
      });
    }

    const category = await query.exec();
    if (!category) throw new NotFoundException('التصنيف غير موجود');

    return category;
  }

  async findSubcategories(parentId: string): Promise<StoreCategory[]> {
    if (!Types.ObjectId.isValid(parentId)) {
      throw new BadRequestException('معرف التصنيف غير صحيح');
    }

    const parent = await this.storeCategoryModel.findById(parentId);
    if (!parent) throw new NotFoundException('التصنيف الأب غير موجود');

    return this.storeCategoryModel
      .find({ parentCategory: parentId, isActive: true })
      .sort({ order: 1, name: 1 })
      .exec();
  }

  async search(query: string): Promise<StoreCategory[]> {
    return this.storeCategoryModel
      .find({
        $text: { $search: query },
        isActive: true,
      })
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .exec();
  }
}
