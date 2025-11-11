import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from '../../../../database/schemas/category.schema';
import { BaseRepository } from '../../../shared/base/base.repository';

@Injectable()
export class CategoryRepository extends BaseRepository<CategoryDocument> {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {
    super(categoryModel);
  }

  /**
   * Find category by slug
   */
  async findBySlug(slug: string): Promise<CategoryDocument | null> {
    return this.findOne({ slug });
  }

  /**
   * Find root categories (no parent)
   */
  async findRootCategories(): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({ parentCategory: null, isActive: true })
      .sort({ order: 1 })
      .exec();
  }

  /**
   * Find subcategories by parent ID
   */
  async findByParentId(parentId: string): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({ parentCategory: new Types.ObjectId(parentId), isActive: true })
      .sort({ order: 1 })
      .exec();
  }

  /**
   * Get category tree
   */
  async getCategoryTree(): Promise<CategoryDocument[]> {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ order: 1 })
      .exec();

    // Build tree structure
    const categoryMap = new Map();
    const tree: CategoryDocument[] = [];

    categories.forEach((cat: any) => {
      categoryMap.set(cat._id.toString(), { ...cat.toObject(), children: [] });
    });

    categories.forEach((cat: any) => {
      const category = categoryMap.get(cat._id.toString());
      if (cat.parentCategory) {
        const parent = categoryMap.get(cat.parentCategory.toString());
        if (parent) {
          parent.children.push(category);
        }
      } else {
        tree.push(category);
      }
    });

    return tree as any;
  }

  /**
   * Update category order
   */
  async updateOrder(categoryId: string, order: number): Promise<CategoryDocument | null> {
    return this.findByIdAndUpdate(categoryId, { order });
  }
}

