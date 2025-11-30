import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StoreCategory,
  StoreCategoryDocument,
} from '../../../../database/schemas/store-category.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class StoreCategoryRepository extends BaseRepository<StoreCategoryDocument> {
  constructor(
    @InjectModel(StoreCategory.name)
    private readonly storeCategoryModel: Model<StoreCategoryDocument>,
  ) {
    super(storeCategoryModel);
  }

  /**
   * Find category by slug
   */
  async findBySlug(slug: string): Promise<StoreCategoryDocument | null> {
    return this.findOne({ slug });
  }

  /**
   * Find all active categories
   */
  async findActiveCategories(): Promise<StoreCategoryDocument[]> {
    return this.find({ isActive: true }, { sort: { order: 1 } });
  }

  /**
   * Find categories by parent ID
   */
  async findByParentId(parentId: string): Promise<StoreCategoryDocument[]> {
    return this.find({ parentId }, { sort: { order: 1 } });
  }

  /**
   * Get category tree
   */
  async getCategoryTree(): Promise<any[]> {
    const categories = await this.find({ isActive: true });

    const categoryMap = new Map();
    const tree: any[] = [];

    categories.forEach((cat: any) => {
      categoryMap.set(cat._id.toString(), { ...cat.toObject(), children: [] });
    });

    categories.forEach((cat: any) => {
      const category = categoryMap.get(cat._id.toString());
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId.toString());
        if (parent) {
          parent.children.push(category);
        }
      } else {
        tree.push(category);
      }
    });

    return tree;
  }

  /**
   * Update category order
   */
  async updateOrder(
    categoryId: string,
    order: number,
  ): Promise<StoreCategoryDocument | null> {
    return this.findByIdAndUpdate(categoryId, { order });
  }

  /**
   * Toggle category active status
   */
  async toggleActive(
    categoryId: string,
  ): Promise<StoreCategoryDocument | null> {
    const category = await this.findById(categoryId);
    if (!category) return null;

    return this.findByIdAndUpdate(categoryId, { isActive: !category.isActive });
  }
}
