import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StoreCategory, StoreCategoryDocument } from '../../../../database/schemas/store-category.schema';
import { StoreOwnerProfile, StoreOwnerProfileDocument } from '../../../../database/schemas/store-owner-profile.schema';

/**
 * Store Category Statistics Service
 * Handles statistics and calculations for store categories
 */
@Injectable()
export class StoreCategoryStatisticsService {
  private readonly logger = new Logger(StoreCategoryStatisticsService.name);

  constructor(
    @InjectModel(StoreCategory.name)
    private storeCategoryModel: Model<StoreCategoryDocument>,
    @InjectModel(StoreOwnerProfile.name)
    private storeOwnerProfileModel: Model<StoreOwnerProfileDocument>,
  ) {}

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

    this.logger.log('Store counts recalculated for all categories');
  }

  /**
   * إعادة حساب الإحصائيات لجميع التصنيفات
   */
  async recalculateStatistics(): Promise<void> {
    const categories = await this.storeCategoryModel.find();

    for (const category of categories) {
      await this.updateCategoryStatistics((category._id as Types.ObjectId).toString());
    }

    this.logger.log('Statistics recalculated for all categories');
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

    this.logger.log(`Statistics updated for category: ${categoryId}`);
  }
}

