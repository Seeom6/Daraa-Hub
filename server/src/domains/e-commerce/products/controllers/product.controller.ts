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
  UploadedFiles,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ProductService } from '../services/product.service';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
  CreateVariantDto,
  UpdateVariantDto,
} from '../dto';
import { StorageService } from '../../../../infrastructure/storage/storage.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Create a new product
   * POST /products
   * Requires: Store Owner role
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: any,
  ) {
    const product = await this.productService.create(createProductDto, user.userId);
    return {
      success: true,
      message: 'Product created successfully',
      data: product,
    };
  }

  /**
   * Get all products with filters and pagination
   * GET /products
   * Public endpoint
   */
  @Get()
  async findAll(@Query() query: QueryProductDto) {
    const result = await this.productService.findAll(query);
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
   * Get product by slug
   * GET /products/slug/:slug
   * Public endpoint
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const product = await this.productService.findBySlug(slug);
    return {
      success: true,
      data: product,
    };
  }

  /**
   * Get product by ID
   * GET /products/:id
   * Public endpoint
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(id);
    return {
      success: true,
      data: product,
    };
  }

  /**
   * Update product
   * PUT /products/:id
   * Requires: Store Owner (own products) or Admin
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: any,
  ) {
    // Verify ownership if store owner
    if (user.role === 'store_owner') {
      const isOwner = await this.productService.verifyOwnership(id, user.profileId);
      if (!isOwner) {
        throw new ForbiddenException('You can only update your own products');
      }
    }

    const product = await this.productService.update(id, updateProductDto, user.userId);
    return {
      success: true,
      message: 'Product updated successfully',
      data: product,
    };
  }

  /**
   * Delete product
   * DELETE /products/:id
   * Requires: Store Owner (own products) or Admin
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    // Verify ownership if store owner
    if (user.role === 'store_owner') {
      const isOwner = await this.productService.verifyOwnership(id, user.profileId);
      if (!isOwner) {
        throw new ForbiddenException('You can only delete your own products');
      }
    }

    await this.productService.remove(id, user.userId);
  }

  /**
   * Upload product images
   * POST /products/:id/images
   * Requires: Store Owner (own products) or Admin
   */
  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    if (!files || files.length === 0) {
      return {
        success: false,
        message: 'No files uploaded',
      };
    }

    // Verify ownership if store owner
    if (user.role === 'store_owner') {
      const isOwner = await this.productService.verifyOwnership(id, user.profileId);
      if (!isOwner) {
        throw new ForbiddenException('You can only upload images to your own products');
      }
    }

    // Upload all files to S3
    const uploadPromises = files.map(file =>
      this.storageService.uploadFile(file, 'products'),
    );
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map(result => result.url);

    // Add images to product
    const product = await this.productService.addImages(id, imageUrls);

    return {
      success: true,
      message: 'Images uploaded successfully',
      data: {
        urls: imageUrls,
        product,
      },
    };
  }

  /**
   * Delete product image
   * DELETE /products/:id/images
   * Requires: Store Owner (own products) or Admin
   */
  @Delete(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async removeImage(
    @Param('id') id: string,
    @Body('imageUrl') imageUrl: string,
    @CurrentUser() user: any,
  ) {
    // Verify ownership if store owner
    if (user.role === 'store_owner') {
      const isOwner = await this.productService.verifyOwnership(id, user.profileId);
      if (!isOwner) {
        throw new ForbiddenException('You can only remove images from your own products');
      }
    }

    const product = await this.productService.removeImage(id, imageUrl);

    return {
      success: true,
      message: 'Image removed successfully',
      data: product,
    };
  }

  /**
   * Create product variant
   * POST /products/:id/variants
   * Requires: Store Owner (own products) or Admin
   */
  @Post(':id/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async createVariant(
    @Param('id') productId: string,
    @Body() createVariantDto: CreateVariantDto,
    @CurrentUser() user: any,
  ) {
    // Verify ownership if store owner
    if (user.role === 'store_owner') {
      const isOwner = await this.productService.verifyOwnership(productId, user.profileId);
      if (!isOwner) {
        throw new ForbiddenException('You can only add variants to your own products');
      }
    }

    createVariantDto.productId = productId;
    const variant = await this.productService.createVariant(createVariantDto);

    return {
      success: true,
      message: 'Variant created successfully',
      data: variant,
    };
  }

  /**
   * Get product variants
   * GET /products/:id/variants
   * Public endpoint
   */
  @Get(':id/variants')
  async getVariants(@Param('id') productId: string) {
    const variants = await this.productService.findVariantsByProduct(productId);
    return {
      success: true,
      data: variants,
    };
  }

  /**
   * Update product variant
   * PUT /products/variants/:variantId
   * Requires: Store Owner (own products) or Admin
   */
  @Put('variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async updateVariant(
    @Param('variantId') variantId: string,
    @Body() updateVariantDto: UpdateVariantDto,
    @CurrentUser() user: any,
  ) {
    const variant = await this.productService.updateVariant(variantId, updateVariantDto);
    return {
      success: true,
      message: 'Variant updated successfully',
      data: variant,
    };
  }

  /**
   * Delete product variant
   * DELETE /products/variants/:variantId
   * Requires: Store Owner (own products) or Admin
   */
  @Delete('variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeVariant(
    @Param('variantId') variantId: string,
    @CurrentUser() user: any,
  ) {
    await this.productService.removeVariant(variantId);
  }
}

