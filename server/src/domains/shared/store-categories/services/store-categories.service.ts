import { Injectable } from '@nestjs/common';
import { StoreCategory } from '../../../../database/schemas/store-category.schema';
import { CreateStoreCategoryDto, UpdateStoreCategoryDto } from '../dto';
import { StoreCategoriesCrudService } from './store-categories-crud.service';
import { StoreCategoriesQueryService } from './store-categories-query.service';
import { StoreCategoriesHierarchyService } from './store-categories-hierarchy.service';

/**
 * Store Categories Service - Facade
 * Delegates to specialized services for separation of concerns
 */
@Injectable()
export class StoreCategoriesService {
  constructor(
    private crudService: StoreCategoriesCrudService,
    private queryService: StoreCategoriesQueryService,
    private hierarchyService: StoreCategoriesHierarchyService,
  ) {}

  // ==================== CRUD Operations ====================

  async create(createDto: CreateStoreCategoryDto): Promise<StoreCategory> {
    return this.crudService.create(createDto);
  }

  async update(
    id: string,
    updateDto: UpdateStoreCategoryDto,
  ): Promise<StoreCategory> {
    return this.crudService.update(id, updateDto);
  }

  async delete(id: string, deletedBy?: string): Promise<void> {
    return this.crudService.delete(id, deletedBy);
  }

  async restore(id: string): Promise<StoreCategory> {
    return this.crudService.restore(id);
  }

  async permanentDelete(id: string): Promise<void> {
    return this.crudService.permanentDelete(id);
  }

  // ==================== Query Operations ====================

  async findAll(options?: {
    parentCategory?: string;
    level?: number;
    isActive?: boolean;
    includeSubcategories?: boolean;
    includeDeleted?: boolean;
  }): Promise<StoreCategory[]> {
    return this.queryService.findAll(options);
  }

  async findRootCategories(
    includeSubcategories = false,
  ): Promise<StoreCategory[]> {
    return this.queryService.findRootCategories(includeSubcategories);
  }

  async findById(
    id: string,
    includeSubcategories = false,
  ): Promise<StoreCategory> {
    return this.queryService.findById(id, includeSubcategories);
  }

  async findBySlug(
    slug: string,
    includeSubcategories = false,
  ): Promise<StoreCategory> {
    return this.queryService.findBySlug(slug, includeSubcategories);
  }

  async findSubcategories(parentId: string): Promise<StoreCategory[]> {
    return this.queryService.findSubcategories(parentId);
  }

  async search(query: string): Promise<StoreCategory[]> {
    return this.queryService.search(query);
  }

  // ==================== Hierarchy Operations ====================

  async validateHierarchy(
    parentId: string | null,
    level: number,
  ): Promise<void> {
    return this.hierarchyService.validateHierarchy(parentId, level);
  }

  async getParentChain(categoryId: string): Promise<StoreCategory[]> {
    return this.hierarchyService.getParentChain(categoryId);
  }

  async moveCategory(
    categoryId: string,
    newParentId: string | null,
  ): Promise<StoreCategory> {
    return this.hierarchyService.moveCategory(categoryId, newParentId);
  }

  async reorderCategories(categoryIds: string[]): Promise<void> {
    return this.hierarchyService.reorderCategories(categoryIds);
  }

  async getCategoryTree(): Promise<StoreCategory[]> {
    return this.hierarchyService.getCategoryTree();
  }
}
