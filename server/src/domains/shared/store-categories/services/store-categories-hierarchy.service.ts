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
 * Store Categories Hierarchy Service
 * Handles hierarchy management (parent/child, tree structure, reordering)
 */
@Injectable()
export class StoreCategoriesHierarchyService {
  private readonly logger = new Logger(StoreCategoriesHierarchyService.name);

  constructor(
    @InjectModel(StoreCategory.name)
    private storeCategoryModel: Model<StoreCategoryDocument>,
    private cacheService: StoreCategoryCacheService,
  ) {}

  async validateHierarchy(
    parentId: string | null,
    level: number,
  ): Promise<void> {
    if (!parentId) {
      if (level !== 0) {
        throw new BadRequestException(
          'التصنيف الرئيسي يجب أن يكون في المستوى 0',
        );
      }
      return;
    }

    if (!Types.ObjectId.isValid(parentId)) {
      throw new BadRequestException('معرف التصنيف الأب غير صحيح');
    }

    const parent = await this.storeCategoryModel.findById(parentId);
    if (!parent) {
      throw new NotFoundException('التصنيف الأب غير موجود');
    }

    if (parent.level >= 1) {
      throw new BadRequestException(
        'لا يمكن إنشاء تصنيف فرعي لتصنيف فرعي. يُسمح بمستويين فقط',
      );
    }
  }

  async getParentChain(categoryId: string): Promise<StoreCategory[]> {
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new BadRequestException('معرف التصنيف غير صحيح');
    }

    const chain: StoreCategory[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      const category = await this.storeCategoryModel.findById(currentId);
      if (!category) break;

      chain.unshift(category); // Add to beginning
      currentId = category.parentCategory?.toString() || null;
    }

    return chain;
  }

  async moveCategory(
    categoryId: string,
    newParentId: string | null,
  ): Promise<StoreCategory> {
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new BadRequestException('معرف التصنيف غير صحيح');
    }

    const category = await this.storeCategoryModel.findById(categoryId);
    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }

    // Validate new hierarchy
    if (newParentId) {
      if (newParentId === categoryId) {
        throw new BadRequestException('لا يمكن جعل التصنيف أباً لنفسه');
      }

      await this.validateHierarchy(newParentId, 1);
      const parent = await this.storeCategoryModel.findById(newParentId);
      category.parentCategory = new Types.ObjectId(newParentId);
      category.level = (parent?.level || 0) + 1;
    } else {
      category.parentCategory = undefined;
      category.level = 0;
    }

    const updated = await category.save();
    await this.cacheService.deleteCachedCategory(categoryId);
    await this.cacheService.clearAllCategoriesCache();

    this.logger.log(
      `Category moved: ${category.name} to parent ${newParentId || 'root'}`,
    );
    return updated;
  }

  async reorderCategories(categoryIds: string[]): Promise<void> {
    for (let i = 0; i < categoryIds.length; i++) {
      const id = categoryIds[i];
      if (!Types.ObjectId.isValid(id)) continue;

      await this.storeCategoryModel.findByIdAndUpdate(id, { order: i });
    }

    await this.cacheService.clearAllCategoriesCache();
    this.logger.log(`Reordered ${categoryIds.length} categories`);
  }

  async getCategoryTree(): Promise<StoreCategory[]> {
    const rootCategories = await this.storeCategoryModel
      .find({ level: 0, isActive: true, isDeleted: false })
      .populate({
        path: 'subcategories',
        match: { isActive: true, isDeleted: false },
        options: { sort: { order: 1, name: 1 } },
      })
      .sort({ order: 1, name: 1 })
      .exec();

    return rootCategories;
  }
}
