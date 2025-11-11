import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StoreCategory, StoreCategoryDocument } from '../../../../database/schemas/store-category.schema';
import { StoreOwnerProfile, StoreOwnerProfileDocument } from '../../../../database/schemas/store-owner-profile.schema';
import { CreateStoreCategoryDto, UpdateStoreCategoryDto } from '../dto';
import { RedisService } from '../../../../infrastructure/redis/redis.service';

@Injectable()
export class StoreCategoriesService {
  private readonly logger = new Logger(StoreCategoriesService.name);
  private readonly CACHE_PREFIX = 'store-category:';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    @InjectModel(StoreCategory.name)
    private storeCategoryModel: Model<StoreCategoryDocument>,
    @InjectModel(StoreOwnerProfile.name)
    private storeOwnerProfileModel: Model<StoreOwnerProfileDocument>,
    private redisService: RedisService,
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
    await this.clearAllCategoriesCache();

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
      const cached = await this.getCachedCategory(id);
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
      await this.cacheCategory(category);
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
    await this.deleteCachedCategory(id);
    await this.clearAllCategoriesCache();

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
    await this.deleteCachedCategory(id);
    await this.clearAllCategoriesCache();
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
  }

  /**
   * تحديث عدد المتاجر في التصنيف
   */
  async updateStoreCount(categoryId: string, increment: number): Promise<void> {
    if (!Types.ObjectId.isValid(categoryId)) {
      return;
    }

    await this.storeCategoryModel.findByIdAndUpdate(
      categoryId,
      { $inc: { storeCount: increment } },
      { new: true },
    );
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

  /**
   * إعادة حساب عدد المتاجر لجميع التصنيفات
   */
  async recalculateStoreCounts(): Promise<void> {
    const categories = await this.storeCategoryModel.find();

    for (const category of categories) {
      // حساب عدد المتاجر الفعلي من StoreOwnerProfile
      const count = await this.storeOwnerProfileModel.countDocuments({
        storeCategories: category._id,
      });

      category.storeCount = count;
      await category.save();
    }
  }

  /**
   * إعادة حساب الإحصائيات لجميع التصنيفات
   */
  async recalculateStatistics(): Promise<void> {
    const categories = await this.storeCategoryModel.find();

    for (const category of categories) {
      await this.updateCategoryStatistics((category._id as Types.ObjectId).toString());
    }
  }

  /**
   * تحديث إحصائيات تصنيف واحد
   */
  async updateCategoryStatistics(categoryId: string): Promise<void> {
    if (!Types.ObjectId.isValid(categoryId)) {
      return;
    }

    // الحصول على جميع المتاجر في هذا التصنيف
    const stores = await this.storeOwnerProfileModel
      .find({
        storeCategories: new Types.ObjectId(categoryId),
        isStoreActive: true,
      })
      .select('products totalOrders rating totalReviews totalSales')
      .exec();

    // حساب الإحصائيات
    let totalProducts = 0;
    let totalOrders = 0;
    let totalRating = 0;
    let storesWithRating = 0;
    let totalSales = 0;

    for (const store of stores) {
      totalProducts += store.products?.length || 0;
      totalOrders += (store as any).totalOrders || 0;
      totalSales += (store as any).totalSales || 0;

      if (store.rating && store.rating > 0) {
        totalRating += store.rating;
        storesWithRating++;
      }
    }

    const averageRating = storesWithRating > 0 ? totalRating / storesWithRating : 0;

    // حساب نقاط الشعبية (popularity score)
    // Formula: (totalOrders * 2) + (totalSales * 0.1) + (averageRating * 100)
    const popularityScore = (totalOrders * 2) + (totalSales * 0.1) + (averageRating * 100);

    // تحديث التصنيف
    await this.storeCategoryModel.findByIdAndUpdate(
      categoryId,
      {
        totalProducts,
        totalOrders,
        averageRating: Math.round(averageRating * 10) / 10, // تقريب لرقم عشري واحد
        popularityScore: Math.round(popularityScore),
      },
      { new: true },
    );
  }

  // ==================== Cache Helpers ====================

  /**
   * حفظ تصنيف في الـ cache
   */
  private async cacheCategory(category: any): Promise<void> {
    try {
      const key = `${this.CACHE_PREFIX}${category._id}`;
      await this.redisService.set(
        key,
        JSON.stringify(category),
        this.CACHE_TTL,
      );
    } catch (error) {
      this.logger.warn(`Failed to cache category: ${category._id}`, error);
    }
  }

  /**
   * الحصول على تصنيف من الـ cache
   */
  private async getCachedCategory(id: string): Promise<StoreCategory | null> {
    try {
      const key = `${this.CACHE_PREFIX}${id}`;
      const cached = await this.redisService.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.warn(`Failed to get cached category: ${id}`, error);
    }
    return null;
  }

  /**
   * حذف تصنيف من الـ cache
   */
  private async deleteCachedCategory(id: string): Promise<void> {
    try {
      const key = `${this.CACHE_PREFIX}${id}`;
      await this.redisService.del(key);
    } catch (error) {
      this.logger.warn(`Failed to delete cached category: ${id}`, error);
    }
  }

  /**
   * حذف جميع التصنيفات من الـ cache
   */
  private async clearAllCategoriesCache(): Promise<void> {
    try {
      // حذف cache للتصنيفات الرئيسية
      await this.redisService.del(`${this.CACHE_PREFIX}root`);
      await this.redisService.del(`${this.CACHE_PREFIX}all`);
    } catch (error) {
      this.logger.warn('Failed to clear categories cache', error);
    }
  }
}

