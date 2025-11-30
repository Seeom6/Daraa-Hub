import { Injectable } from '@nestjs/common';
import { ProductDocument } from '../../../../database/schemas/product.schema';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from '../dto';
import { ProductCrudService } from './product-crud.service';
import { ProductQueryService } from './product-query.service';
import { ProductValidationService } from './product-validation.service';

/**
 * Product Service - Facade
 * Delegates to specialized services for separation of concerns
 */
@Injectable()
export class ProductService {
  constructor(
    private readonly crudService: ProductCrudService,
    private readonly queryService: ProductQueryService,
    private readonly validationService: ProductValidationService,
  ) {}

  // ==================== CRUD Operations ====================

  async create(
    createProductDto: CreateProductDto,
    userId: string,
  ): Promise<ProductDocument> {
    return this.crudService.create(createProductDto, userId);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId: string,
  ): Promise<ProductDocument> {
    return this.crudService.update(id, updateProductDto, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    return this.crudService.remove(id, userId);
  }

  // ==================== Query Operations ====================

  async findAll(query: QueryProductDto): Promise<{
    data: ProductDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.queryService.findAll(query);
  }

  async findOne(id: string): Promise<ProductDocument> {
    return this.queryService.findOne(id);
  }

  async findBySlug(slug: string): Promise<ProductDocument> {
    return this.queryService.findBySlug(slug);
  }

  // ==================== Validation Operations ====================

  async verifyOwnership(productId: string, storeId: string): Promise<boolean> {
    return this.validationService.verifyOwnership(productId, storeId);
  }
}
