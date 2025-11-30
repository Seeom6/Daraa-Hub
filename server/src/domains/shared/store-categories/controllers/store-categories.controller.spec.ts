import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { StoreCategoriesController } from './store-categories.controller';
import { StoreCategoriesService } from '../services/store-categories.service';
import { StoreCategoryStatisticsService } from '../services/store-category-statistics.service';
import { StoreOwnerProfile } from '../../../../database/schemas';
import { JwtAuthGuard, RolesGuard } from '../../../../common/guards';
import { generateObjectId } from '../../testing';

describe('StoreCategoriesController', () => {
  let controller: StoreCategoriesController;

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findRootCategories: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findSubcategories: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    restore: jest.fn(),
    permanentDelete: jest.fn(),
  };

  const mockStatisticsService = {
    recalculateStoreCounts: jest.fn(),
    recalculateStatistics: jest.fn(),
  };

  const mockStoreOwnerProfileModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  const categoryId = generateObjectId();

  const mockCategory = {
    _id: categoryId,
    name: 'Electronics',
    slug: 'electronics',
    level: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreCategoriesController],
      providers: [
        { provide: StoreCategoriesService, useValue: mockCategoriesService },
        {
          provide: StoreCategoryStatisticsService,
          useValue: mockStatisticsService,
        },
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: mockStoreOwnerProfileModel,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<StoreCategoriesController>(
      StoreCategoriesController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create category', async () => {
      mockCategoriesService.create.mockResolvedValue(mockCategory);

      const result = await controller.create({ name: 'Electronics' } as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      mockCategoriesService.findAll.mockResolvedValue([mockCategory]);

      const result = await controller.findAll();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockCategory]);
    });
  });

  describe('findRootCategories', () => {
    it('should return root categories', async () => {
      mockCategoriesService.findRootCategories.mockResolvedValue([
        mockCategory,
      ]);

      const result = await controller.findRootCategories();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockCategory]);
    });
  });

  describe('findById', () => {
    it('should return category by id', async () => {
      mockCategoriesService.findById.mockResolvedValue(mockCategory);

      const result = await controller.findById(categoryId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCategory);
    });
  });

  describe('search', () => {
    it('should search categories', async () => {
      mockCategoriesService.search.mockResolvedValue([mockCategory]);

      const result = await controller.search('electronics');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockCategory]);
    });

    it('should return empty for empty query', async () => {
      const result = await controller.search('');

      expect(result.data).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update category', async () => {
      mockCategoriesService.update.mockResolvedValue(mockCategory);

      const result = await controller.update(categoryId, {
        name: 'Updated',
      } as any);

      expect(result.success).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete category', async () => {
      mockCategoriesService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(categoryId, {
        user: { accountId: generateObjectId() },
      });

      expect(result.success).toBe(true);
    });
  });

  describe('restore', () => {
    it('should restore category', async () => {
      mockCategoriesService.restore.mockResolvedValue(mockCategory);

      const result = await controller.restore(categoryId);

      expect(result.success).toBe(true);
    });
  });

  describe('recalculateCounts', () => {
    it('should recalculate counts', async () => {
      mockStatisticsService.recalculateStoreCounts.mockResolvedValue(undefined);

      const result = await controller.recalculateCounts();

      expect(result.success).toBe(true);
    });
  });

  describe('recalculateStatistics', () => {
    it('should recalculate statistics', async () => {
      mockStatisticsService.recalculateStatistics.mockResolvedValue(undefined);

      const result = await controller.recalculateStatistics();

      expect(result.success).toBe(true);
    });
  });

  describe('permanentDelete', () => {
    it('should permanently delete category', async () => {
      mockCategoriesService.permanentDelete.mockResolvedValue(undefined);

      const result = await controller.permanentDelete(categoryId);

      expect(result.success).toBe(true);
    });
  });

  describe('findBySlug', () => {
    it('should return category by slug', async () => {
      mockCategoriesService.findBySlug.mockResolvedValue(mockCategory);

      const result = await controller.findBySlug('electronics');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCategory);
    });

    it('should include subcategories when requested', async () => {
      mockCategoriesService.findBySlug.mockResolvedValue(mockCategory);

      const result = await controller.findBySlug('electronics', 'true');

      expect(mockCategoriesService.findBySlug).toHaveBeenCalledWith(
        'electronics',
        true,
      );
    });
  });

  describe('findSubcategories', () => {
    it('should return subcategories', async () => {
      mockCategoriesService.findSubcategories.mockResolvedValue([mockCategory]);

      const result = await controller.findSubcategories(categoryId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockCategory]);
    });
  });

  describe('findAll with filters', () => {
    it('should filter by parentCategory', async () => {
      mockCategoriesService.findAll.mockResolvedValue([mockCategory]);

      await controller.findAll('parent-id');

      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ parentCategory: 'parent-id' }),
      );
    });

    it('should filter by level', async () => {
      mockCategoriesService.findAll.mockResolvedValue([mockCategory]);

      await controller.findAll(undefined, '1');

      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ level: 1 }),
      );
    });

    it('should filter by isActive', async () => {
      mockCategoriesService.findAll.mockResolvedValue([mockCategory]);

      await controller.findAll(undefined, undefined, 'true');

      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
    });

    it('should include subcategories when requested', async () => {
      mockCategoriesService.findAll.mockResolvedValue([mockCategory]);

      await controller.findAll(undefined, undefined, undefined, 'true');

      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ includeSubcategories: true }),
      );
    });
  });

  describe('findRootCategories with subcategories', () => {
    it('should include subcategories when requested', async () => {
      mockCategoriesService.findRootCategories.mockResolvedValue([
        mockCategory,
      ]);

      await controller.findRootCategories('true');

      expect(mockCategoriesService.findRootCategories).toHaveBeenCalledWith(
        true,
      );
    });
  });

  describe('findById with subcategories', () => {
    it('should include subcategories when requested', async () => {
      mockCategoriesService.findById.mockResolvedValue(mockCategory);

      await controller.findById(categoryId, 'true');

      expect(mockCategoriesService.findById).toHaveBeenCalledWith(
        categoryId,
        true,
      );
    });
  });

  describe('getStoresByCategory', () => {
    it('should return stores by category', async () => {
      const mockStores = [{ storeName: 'Test Store' }];
      mockStoreOwnerProfileModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockStores),
      });
      mockStoreOwnerProfileModel.countDocuments.mockResolvedValue(1);

      const result = await controller.getStoresByCategory(categoryId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStores);
    });

    it('should filter by verified status', async () => {
      mockStoreOwnerProfileModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockStoreOwnerProfileModel.countDocuments.mockResolvedValue(0);

      await controller.getStoresByCategory(
        categoryId,
        undefined,
        undefined,
        'true',
      );

      expect(mockStoreOwnerProfileModel.find).toHaveBeenCalled();
    });

    it('should use custom pagination', async () => {
      mockStoreOwnerProfileModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockStoreOwnerProfileModel.countDocuments.mockResolvedValue(0);

      const result = await controller.getStoresByCategory(
        categoryId,
        '2',
        '10',
      );

      expect(result.page).toBe(2);
    });
  });

  describe('search with whitespace query', () => {
    it('should return empty for whitespace-only query', async () => {
      const result = await controller.search('   ');

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe('delete without user', () => {
    it('should handle delete without user in request', async () => {
      mockCategoriesService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(categoryId, {});

      expect(result.success).toBe(true);
    });
  });
});
