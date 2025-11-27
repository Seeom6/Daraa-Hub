import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { StoreCategoriesService } from '../services/store-categories.service';
import { StoreCategoryStatisticsService } from '../services/store-category-statistics.service';
import { CreateStoreCategoryDto, UpdateStoreCategoryDto } from '../dto';
import { StoreOwnerProfile, StoreOwnerProfileDocument } from '../../../../database/schemas';

@Controller('store-categories')
export class StoreCategoriesController {
  constructor(
    private readonly storeCategoriesService: StoreCategoriesService,
    private readonly statisticsService: StoreCategoryStatisticsService,
    @InjectModel(StoreOwnerProfile.name)
    private storeOwnerProfileModel: Model<StoreOwnerProfileDocument>,
  ) {}

  /**
   * إنشاء تصنيف جديد (Admin فقط)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async create(@Body() createDto: CreateStoreCategoryDto) {
    const category = await this.storeCategoriesService.create(createDto);
    return {
      success: true,
      message: 'تم إنشاء التصنيف بنجاح',
      data: category,
    };
  }

  /**
   * الحصول على جميع التصنيفات (عام)
   */
  @Get()
  async findAll(
    @Query('parentCategory') parentCategory?: string,
    @Query('level') level?: string,
    @Query('isActive') isActive?: string,
    @Query('includeSubcategories') includeSubcategories?: string,
  ) {
    const options: any = {};

    if (parentCategory !== undefined) {
      options.parentCategory = parentCategory;
    }

    if (level !== undefined) {
      options.level = parseInt(level, 10);
    }

    if (isActive !== undefined) {
      options.isActive = isActive === 'true';
    }

    if (includeSubcategories !== undefined) {
      options.includeSubcategories = includeSubcategories === 'true';
    }

    const categories = await this.storeCategoriesService.findAll(options);
    return {
      success: true,
      data: categories,
      count: categories.length,
    };
  }

  /**
   * الحصول على التصنيفات الرئيسية فقط (عام)
   */
  @Get('root')
  async findRootCategories(@Query('includeSubcategories') includeSubcategories?: string) {
    const include = includeSubcategories === 'true';
    const categories = await this.storeCategoriesService.findRootCategories(include);
    return {
      success: true,
      data: categories,
      count: categories.length,
    };
  }

  /**
   * البحث في التصنيفات (عام)
   */
  @Get('search')
  async search(@Query('q') query: string) {
    if (!query || query.trim().length === 0) {
      return {
        success: true,
        data: [],
        count: 0,
      };
    }

    const categories = await this.storeCategoriesService.search(query);
    return {
      success: true,
      data: categories,
      count: categories.length,
    };
  }

  /**
   * الحصول على تصنيف بواسطة slug (عام)
   */
  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Query('includeSubcategories') includeSubcategories?: string,
  ) {
    const include = includeSubcategories === 'true';
    const category = await this.storeCategoriesService.findBySlug(slug, include);
    return {
      success: true,
      data: category,
    };
  }

  /**
   * الحصول على تصنيف بواسطة ID (عام)
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Query('includeSubcategories') includeSubcategories?: string,
  ) {
    const include = includeSubcategories === 'true';
    const category = await this.storeCategoriesService.findById(id, include);
    return {
      success: true,
      data: category,
    };
  }

  /**
   * الحصول على التصنيفات الفرعية (عام)
   */
  @Get(':id/subcategories')
  async findSubcategories(@Param('id') id: string) {
    const subcategories = await this.storeCategoriesService.findSubcategories(id);
    return {
      success: true,
      data: subcategories,
      count: subcategories.length,
    };
  }

  /**
   * تحديث تصنيف (Admin فقط)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  async update(@Param('id') id: string, @Body() updateDto: UpdateStoreCategoryDto) {
    const category = await this.storeCategoriesService.update(id, updateDto);
    return {
      success: true,
      message: 'تم تحديث التصنيف بنجاح',
      data: category,
    };
  }

  /**
   * حذف تصنيف (Soft Delete - Admin فقط)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @Req() req: any) {
    const deletedBy = req.user?.accountId;
    await this.storeCategoriesService.delete(id, deletedBy);
    return {
      success: true,
      message: 'تم حذف التصنيف بنجاح',
    };
  }

  /**
   * استعادة تصنيف محذوف (Admin فقط)
   */
  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id') id: string) {
    const category = await this.storeCategoriesService.restore(id);
    return {
      success: true,
      message: 'تم استعادة التصنيف بنجاح',
      data: category,
    };
  }

  /**
   * حذف نهائي (Permanent Delete - Super Admin فقط)
   */
  @Delete(':id/permanent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  async permanentDelete(@Param('id') id: string) {
    await this.storeCategoriesService.permanentDelete(id);
    return {
      success: true,
      message: 'تم حذف التصنيف نهائياً',
    };
  }

  /**
   * إعادة حساب عدد المتاجر (Admin فقط)
   */
  @Post('recalculate-counts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  async recalculateCounts() {
    await this.statisticsService.recalculateStoreCounts();
    return {
      success: true,
      message: 'تم إعادة حساب عدد المتاجر بنجاح',
    };
  }

  /**
   * إعادة حساب الإحصائيات (Admin فقط)
   */
  @Post('recalculate-statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  async recalculateStatistics() {
    await this.statisticsService.recalculateStatistics();
    return {
      success: true,
      message: 'تم إعادة حساب الإحصائيات بنجاح',
    };
  }

  /**
   * الحصول على المتاجر حسب التصنيف (عام)
   * GET /store-categories/:id/stores
   */
  @Get(':id/stores')
  async getStoresByCategory(
    @Param('id') categoryId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('verified') verified?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {
      storeCategories: new Types.ObjectId(categoryId),
      isStoreActive: true,
    };

    // Filter by verification status if provided
    if (verified === 'true') {
      query.verificationStatus = 'approved';
    }

    // Get stores
    const stores = await this.storeOwnerProfileModel
      .find(query)
      .select('storeName storeDescription storeLogo rating totalReviews primaryCategory storeCategories verificationStatus')
      .populate('primaryCategory', 'name slug icon')
      .populate('storeCategories', 'name slug icon')
      .sort({ rating: -1, totalReviews: -1 })
      .skip(skip)
      .limit(limitNum)
      .exec();

    // Get total count
    const total = await this.storeOwnerProfileModel.countDocuments(query);

    return {
      success: true,
      data: stores,
      count: stores.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }
}

