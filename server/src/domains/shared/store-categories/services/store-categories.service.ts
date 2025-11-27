import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StoreCategory, StoreCategoryDocument } from '../../../../database/schemas/store-category.schema';
import { CreateStoreCategoryDto, UpdateStoreCategoryDto } from '../dto';
import { StoreCategoryCacheService } from './store-category-cache.service';

/**
 * Store Categories Service
 * Handles core CRUD operations for store categories
 */
@Injectable()
export class StoreCategoriesService {
  private readonly logger = new Logger(StoreCategoriesService.name);

  constructor(
    @InjectModel(StoreCategory.name)
    private storeCategoryModel: Model<StoreCategoryDocument>,
    private cacheService: StoreCategoryCacheService,
  ) {}

  /**
   * إنشاء تصنيف جديد
   */
  async create(createDto: CreateStoreCategoryDto): Promise<StoreCategory> {
    // التحقق من عدم وجود slug مكرر
    const existing = await this.storeCategoryModel.findOne({ slug: createDto.slug });
    if (existing) {
      throw new ConflictException('التصنيف بهذا المعرف موجود مسبقاً');
    }

    // إذا كان هناك تصنيف أب، التحقق من وجوده
    if (createDto.parentCategory) {
      const parent = await this.storeCategoryModel.findById(createDto.parentCategory);
      if (!parent) {
        throw new NotFoundException('التصنيف الأب غير موجود');
      }

      // منع إنشاء أكثر من مستويين (root + subcategory فقط)
      if (parent.level >= 1) {
        throw new BadRequestException('لا يمكن إنشاء تصنيف فرعي لتصنيف فرعي. يُسمح بمستويين فقط (رئيسي وفرعي)');
      }

      // تحديد المستوى تلقائياً
      createDto.level = parent.level + 1;
    } else {
      createDto.level = 0; // تصنيف رئيسي
    }

    const category = new this.storeCategoryModel(createDto);
    const saved = await category.save();

    // Clear cache
    await this.cacheService.clearAllCategoriesCache();

    this.logger.log(`Category created: ${saved.name} (${saved._id})`);
    return saved;
  }

  /**
   * الحصول على جميع التصنيفات
   */
  async findAll(options?: {
    parentCategory?: string;
    level?: number;
    isActive?: boolean;
    includeSubcategories?: boolean;
    includeDeleted?: boolean;
  }): Promise<StoreCategory[]> {
    const filter: any = {};

    if (options?.parentCategory !== undefined) {
      filter.parentCategory = options.parentCategory === 'null' ? null : options.parentCategory;
    }

    if (options?.level !== undefined) {
      filter.level = options.level;
    }

    if (options?.isActive !== undefined) {
      filter.isActive = options.isActive;
    }

    // إخفاء المحذوفة افتراضياً
    if (!options?.includeDeleted) {
      filter.isDeleted = false;
    }

    const query = this.storeCategoryModel.find(filter).sort({ order: 1, name: 1 });

    if (options?.includeSubcategories) {
      query.populate('subcategories');
    }

    return query.exec();
  }

  /**
   * الحصول على التصنيفات الرئيسية فقط
   */
  async findRootCategories(includeSubcategories = false): Promise<StoreCategory[]> {
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

  /**
   * الحصول على تصنيف بواسطة ID
   */
  async findById(id: string, includeSubcategories = false): Promise<StoreCategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف التصنيف غير صحيح');
    }

    // Try cache first
    if (!includeSubcategories) {
      const cached = await this.cacheService.getCachedCategory(id);
      if (cached) {
        return cached;
      }
    }

    const query = this.storeCategoryModel.findOne({ _id: id, isDeleted: false });

    if (includeSubcategories) {
      query.populate({
        path: 'subcategories',
        match: { isActive: true, isDeleted: false },
        options: { sort: { order: 1, name: 1 } },
      });
    }

    const category = await query.exec();

    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }

    // Cache for future requests
    if (!includeSubcategories) {
      await this.cacheService.cacheCategory(category);
    }

    return category;
  }

  /**
   * الحصول على تصنيف بواسطة slug
   */
  async findBySlug(slug: string, includeSubcategories = false): Promise<StoreCategory> {
    const query = this.storeCategoryModel.findOne({ slug, isDeleted: false });

    if (includeSubcategories) {
      query.populate({
        path: 'subcategories',
        match: { isActive: true },
        options: { sort: { order: 1, name: 1 } },
      });
    }

    const category = await query.exec();

    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }

    return category;
  }

  /**
   * الحصول على التصنيفات الفرعية لتصنيف معين
   */
  async findSubcategories(parentId: string): Promise<StoreCategory[]> {
    if (!Types.ObjectId.isValid(parentId)) {
      throw new BadRequestException('معرف التصنيف غير صحيح');
    }

    const parent = await this.storeCategoryModel.findById(parentId);
    if (!parent) {
      throw new NotFoundException('التصنيف الأب غير موجود');
    }

    return this.storeCategoryModel
      .find({ parentCategory: parentId, isActive: true })
      .sort({ order: 1, name: 1 })
      .exec();
  }

  /**
   * تحديث تصنيف
   */
  async update(id: string, updateDto: UpdateStoreCategoryDto): Promise<StoreCategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف التصنيف غير صحيح');
    }

    // التحقق من وجود التصنيف
    const category = await this.storeCategoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }

    // التحقق من عدم تكرار slug
    if (updateDto.slug && updateDto.slug !== category.slug) {
      const existing = await this.storeCategoryModel.findOne({ slug: updateDto.slug });
      if (existing) {
        throw new ConflictException('التصنيف بهذا المعرف موجود مسبقاً');
      }
    }

    // إذا تم تغيير التصنيف الأب
    if (updateDto.parentCategory !== undefined) {
      if (updateDto.parentCategory) {
        // التحقق من عدم جعل التصنيف أباً لنفسه
        if (updateDto.parentCategory === id) {
          throw new BadRequestException('لا يمكن جعل التصنيف أباً لنفسه');
        }

        const parent = await this.storeCategoryModel.findById(updateDto.parentCategory);
        if (!parent) {
          throw new NotFoundException('التصنيف الأب غير موجود');
        }

        // منع إنشاء أكثر من مستويين
        if (parent.level >= 1) {
          throw new BadRequestException('لا يمكن إنشاء تصنيف فرعي لتصنيف فرعي. يُسمح بمستويين فقط (رئيسي وفرعي)');
        }

        // تحديث المستوى
        updateDto.level = parent.level + 1;
      } else {
        // تحويل إلى تصنيف رئيسي
        updateDto.level = 0;
      }
    }

    Object.assign(category, updateDto);
    const updated = await category.save();

    // Clear cache
    await this.cacheService.deleteCachedCategory(id);
    await this.cacheService.clearAllCategoriesCache();

    this.logger.log(`Category updated: ${updated.name} (${updated._id})`);
    return updated;
  }

  /**
   * حذف تصنيف (soft delete)
   */
  async delete(id: string, deletedBy?: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف التصنيف غير صحيح');
    }

    const category = await this.storeCategoryModel.findOne({ _id: id, isDeleted: false });
    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }

    // التحقق من عدم وجود تصنيفات فرعية نشطة
    const subcategories = await this.storeCategoryModel.countDocuments({
      parentCategory: id,
      isDeleted: false,
    });
    if (subcategories > 0) {
      throw new BadRequestException('لا يمكن حذف التصنيف لأنه يحتوي على تصنيفات فرعية');
    }

    // Soft delete
    category.isDeleted = true;
    category.deletedAt = new Date();
    if (deletedBy) {
      category.deletedBy = new Types.ObjectId(deletedBy);
    }
    await category.save();

    // Clear cache
    await this.cacheService.deleteCachedCategory(id);
    await this.cacheService.clearAllCategoriesCache();

    this.logger.log(`Category deleted: ${category.name} (${category._id})`);
  }

  /**
   * استعادة تصنيف محذوف
   */
  async restore(id: string): Promise<StoreCategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف التصنيف غير صحيح');
    }

    const category = await this.storeCategoryModel.findOne({ _id: id, isDeleted: true });
    if (!category) {
      throw new NotFoundException('التصنيف المحذوف غير موجود');
    }

    category.isDeleted = false;
    category.deletedAt = undefined;
    category.deletedBy = undefined;
    await category.save();

    this.logger.log(`Category restored: ${category.name} (${category._id})`);
    return category;
  }

  /**
   * حذف نهائي (permanent delete)
   */
  async permanentDelete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف التصنيف غير صحيح');
    }

    const category = await this.storeCategoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }

    // التحقق من عدم وجود متاجر مرتبطة
    if (category.storeCount > 0) {
      throw new BadRequestException('لا يمكن حذف التصنيف نهائياً لأنه يحتوي على متاجر');
    }

    await this.storeCategoryModel.findByIdAndDelete(id);
    this.logger.log(`Category permanently deleted: ${category.name} (${category._id})`);
  }

  /**
   * البحث في التصنيفات
   */
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

