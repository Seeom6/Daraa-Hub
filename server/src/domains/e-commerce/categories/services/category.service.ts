import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Category,
  CategoryDocument,
} from '../../../../database/schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from '../dto';
import { CategoryRepository } from '../repositories/category.repository';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryDocument> {
    // Check if slug already exists
    const existingSlug = await this.categoryRepository.findOne({
      slug: createCategoryDto.slug,
    });
    if (existingSlug) {
      throw new ConflictException(
        `Category with slug '${createCategoryDto.slug}' already exists`,
      );
    }

    // If parentCategory is provided, validate it exists and calculate level
    let level = 0;
    if (createCategoryDto.parentCategory) {
      const parent = await this.categoryRepository.findById(
        createCategoryDto.parentCategory,
      );
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      level = parent.level + 1;
    }

    const saved = await this.categoryRepository.create({
      ...createCategoryDto,
      level,
    } as any);
    this.logger.log(`Category created: ${saved.name} (${saved._id})`);
    return saved;
  }

  async findAll(query: QueryCategoryDto): Promise<{
    data: CategoryDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      search,
      parentCategory,
      level,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'order',
      sortOrder = 'asc',
    } = query;

    const filter: any = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (parentCategory !== undefined) {
      filter.parentCategory =
        parentCategory === 'null' || parentCategory === null
          ? null
          : new Types.ObjectId(parentCategory);
    }

    if (level !== undefined) {
      filter.level = level;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.categoryRepository
        .getModel()
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('parentCategory', 'name slug')
        .exec(),
      this.categoryRepository.count(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<CategoryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const category = await this.categoryRepository
      .getModel()
      .findById(id)
      .populate('parentCategory', 'name slug')
      .populate('subcategories')
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string): Promise<CategoryDocument> {
    const category = await this.categoryRepository
      .getModel()
      .findOne({ slug })
      .populate('parentCategory', 'name slug')
      .populate('subcategories')
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check slug uniqueness if being updated
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingSlug = await this.categoryRepository.findOne({
        slug: updateCategoryDto.slug,
      });
      if (existingSlug) {
        throw new ConflictException(
          `Category with slug '${updateCategoryDto.slug}' already exists`,
        );
      }
    }

    // If parentCategory is being updated, validate and recalculate level
    if (updateCategoryDto.parentCategory !== undefined) {
      if (updateCategoryDto.parentCategory) {
        // Check if trying to set itself as parent
        if (updateCategoryDto.parentCategory === id) {
          throw new BadRequestException('Category cannot be its own parent');
        }

        const parent = await this.categoryRepository.findById(
          updateCategoryDto.parentCategory,
        );
        if (!parent) {
          throw new NotFoundException('Parent category not found');
        }

        // Check for circular reference
        const isCircular = await this.checkCircularReference(
          id,
          updateCategoryDto.parentCategory,
        );
        if (isCircular) {
          throw new BadRequestException('Circular reference detected');
        }

        updateCategoryDto.level = parent.level + 1;
      } else {
        updateCategoryDto.level = 0;
      }
    }

    Object.assign(category, updateCategoryDto);
    const updated = await category.save();

    this.logger.log(`Category updated: ${updated.name} (${updated._id})`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has subcategories
    const subcategories = await this.categoryRepository.count({
      parentCategory: id,
    });
    if (subcategories > 0) {
      throw new BadRequestException(
        'Cannot delete category with subcategories',
      );
    }

    // Check if category has products
    if (category.productCount > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    await this.categoryRepository.delete(id);
    this.logger.log(`Category deleted: ${category.name} (${id})`);
  }

  async getCategoryTree(): Promise<CategoryDocument[]> {
    const rootCategories = await this.categoryRepository
      .getModel()
      .find({ parentCategory: null, isActive: true })
      .sort({ order: 1 })
      .populate({
        path: 'subcategories',
        match: { isActive: true },
        options: { sort: { order: 1 } },
      })
      .exec();

    return rootCategories;
  }

  async incrementProductCount(
    categoryId: string,
    increment: number = 1,
  ): Promise<void> {
    await this.categoryRepository.findByIdAndUpdate(categoryId, {
      $inc: { productCount: increment },
    });
  }

  async decrementProductCount(
    categoryId: string,
    decrement: number = 1,
  ): Promise<void> {
    await this.categoryRepository.findByIdAndUpdate(categoryId, {
      $inc: { productCount: -decrement },
    });
  }

  private async checkCircularReference(
    categoryId: string,
    parentId: string,
  ): Promise<boolean> {
    let currentParentId = parentId;

    while (currentParentId) {
      if (currentParentId === categoryId) {
        return true;
      }

      const parent = await this.categoryRepository.findById(currentParentId);
      if (!parent || !parent.parentCategory) {
        break;
      }

      currentParentId = parent.parentCategory.toString();
    }

    return false;
  }
}
