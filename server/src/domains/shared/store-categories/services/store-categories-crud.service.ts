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
  StoreCategory,
  StoreCategoryDocument,
} from '../../../../database/schemas/store-category.schema';
import { CreateStoreCategoryDto, UpdateStoreCategoryDto } from '../dto';
import { StoreCategoryCacheService } from './store-category-cache.service';

/**
 * Store Categories CRUD Service
 * Handles create, update, delete operations
 */
@Injectable()
export class StoreCategoriesCrudService {
  private readonly logger = new Logger(StoreCategoriesCrudService.name);

  constructor(
    @InjectModel(StoreCategory.name)
    private storeCategoryModel: Model<StoreCategoryDocument>,
    private cacheService: StoreCategoryCacheService,
  ) {}

  async create(createDto: CreateStoreCategoryDto): Promise<StoreCategory> {
    // التحقق من عدم وجود slug مكرر
    const existing = await this.storeCategoryModel.findOne({
      slug: createDto.slug,
    });
    if (existing) {
      throw new ConflictException('التصنيف بهذا المعرف موجود مسبقاً');
    }

    // إذا كان هناك تصنيف أب، التحقق من وجوده
    if (createDto.parentCategory) {
      const parent = await this.storeCategoryModel.findById(
        createDto.parentCategory,
      );
      if (!parent) {
        throw new NotFoundException('التصنيف الأب غير موجود');
      }
      // منع إنشاء أكثر من مستويين
      if (parent.level >= 1) {
        throw new BadRequestException(
          'لا يمكن إنشاء تصنيف فرعي لتصنيف فرعي. يُسمح بمستويين فقط (رئيسي وفرعي)',
        );
      }
      createDto.level = parent.level + 1;
    } else {
      createDto.level = 0;
    }

    const category = new this.storeCategoryModel(createDto);
    const saved = await category.save();
    await this.cacheService.clearAllCategoriesCache();
    this.logger.log(`Category created: ${saved.name} (${saved._id})`);
    return saved;
  }

  async update(
    id: string,
    updateDto: UpdateStoreCategoryDto,
  ): Promise<StoreCategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف التصنيف غير صحيح');
    }

    const category = await this.storeCategoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }

    // التحقق من عدم تكرار slug
    if (updateDto.slug && updateDto.slug !== category.slug) {
      const existing = await this.storeCategoryModel.findOne({
        slug: updateDto.slug,
      });
      if (existing) {
        throw new ConflictException('التصنيف بهذا المعرف موجود مسبقاً');
      }
    }

    // إذا تم تغيير التصنيف الأب
    if (updateDto.parentCategory !== undefined) {
      if (updateDto.parentCategory) {
        if (updateDto.parentCategory === id) {
          throw new BadRequestException('لا يمكن جعل التصنيف أباً لنفسه');
        }
        const parent = await this.storeCategoryModel.findById(
          updateDto.parentCategory,
        );
        if (!parent) {
          throw new NotFoundException('التصنيف الأب غير موجود');
        }
        if (parent.level >= 1) {
          throw new BadRequestException(
            'لا يمكن إنشاء تصنيف فرعي لتصنيف فرعي. يُسمح بمستويين فقط (رئيسي وفرعي)',
          );
        }
        updateDto.level = parent.level + 1;
      } else {
        updateDto.level = 0;
      }
    }

    Object.assign(category, updateDto);
    const updated = await category.save();
    await this.cacheService.deleteCachedCategory(id);
    await this.cacheService.clearAllCategoriesCache();
    this.logger.log(`Category updated: ${updated.name} (${updated._id})`);
    return updated;
  }

  async delete(id: string, deletedBy?: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف التصنيف غير صحيح');
    }

    const category = await this.storeCategoryModel.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }

    const subcategories = await this.storeCategoryModel.countDocuments({
      parentCategory: id,
      isDeleted: false,
    });
    if (subcategories > 0) {
      throw new BadRequestException(
        'لا يمكن حذف التصنيف لأنه يحتوي على تصنيفات فرعية',
      );
    }

    category.isDeleted = true;
    category.deletedAt = new Date();
    if (deletedBy) {
      category.deletedBy = new Types.ObjectId(deletedBy);
    }
    await category.save();
    await this.cacheService.deleteCachedCategory(id);
    await this.cacheService.clearAllCategoriesCache();
    this.logger.log(`Category deleted: ${category.name} (${category._id})`);
  }

  async restore(id: string): Promise<StoreCategory> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف التصنيف غير صحيح');
    }

    const category = await this.storeCategoryModel.findOne({
      _id: id,
      isDeleted: true,
    });
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

  async permanentDelete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف التصنيف غير صحيح');
    }

    const category = await this.storeCategoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }

    if (category.storeCount > 0) {
      throw new BadRequestException(
        'لا يمكن حذف التصنيف نهائياً لأنه يحتوي على متاجر',
      );
    }

    await this.storeCategoryModel.findByIdAndDelete(id);
    this.logger.log(
      `Category permanently deleted: ${category.name} (${category._id})`,
    );
  }
}
