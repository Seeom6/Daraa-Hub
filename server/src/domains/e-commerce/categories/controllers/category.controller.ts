import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from '../dto';
import { StorageService } from '../../../../infrastructure/storage/storage.service';

@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Create a new category
   * POST /categories
   * Requires: Store Owner or Admin role
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryService.create(createCategoryDto);
    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  }

  /**
   * Get all categories with filters and pagination
   * GET /categories
   * Public endpoint
   */
  @Get()
  async findAll(@Query() query: QueryCategoryDto) {
    const result = await this.categoryService.findAll(query);
    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  /**
   * Get category tree (hierarchical structure)
   * GET /categories/tree
   * Public endpoint
   */
  @Get('tree')
  async getCategoryTree() {
    const tree = await this.categoryService.getCategoryTree();
    return {
      success: true,
      data: tree,
    };
  }

  /**
   * Get category by slug
   * GET /categories/slug/:slug
   * Public endpoint
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.categoryService.findBySlug(slug);
    return {
      success: true,
      data: category,
    };
  }

  /**
   * Get category by ID
   * GET /categories/:id
   * Public endpoint
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoryService.findOne(id);
    return {
      success: true,
      data: category,
    };
  }

  /**
   * Update category
   * PUT /categories/:id
   * Requires: Store Owner or Admin role
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoryService.update(id, updateCategoryDto);
    return {
      success: true,
      message: 'Category updated successfully',
      data: category,
    };
  }

  /**
   * Delete category
   * DELETE /categories/:id
   * Requires: Store Owner or Admin role
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.categoryService.remove(id);
  }

  /**
   * Upload category image
   * POST /categories/:id/image
   * Requires: Admin role
   */
  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return {
        success: false,
        message: 'No file uploaded',
      };
    }

    // Upload to S3
    const uploadResult = await this.storageService.uploadFile(file, 'categories');

    // Update category with image URL
    const category = await this.categoryService.update(id, {
      image: uploadResult.url,
    });

    return {
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: uploadResult.url,
        category,
      },
    };
  }
}

