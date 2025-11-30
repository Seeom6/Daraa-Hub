import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StoreCategoriesHierarchyService } from './store-categories-hierarchy.service';
import { StoreCategoryCacheService } from './store-category-cache.service';
import { StoreCategory } from '../../../../database/schemas/store-category.schema';
import { generateObjectId } from '../../testing';

describe('StoreCategoriesHierarchyService', () => {
  let service: StoreCategoriesHierarchyService;
  let mockModel: any;
  let mockCacheService: any;

  const mockCategory = {
    _id: generateObjectId(),
    name: 'Electronics',
    level: 0,
    parentCategory: null,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    mockModel = {
      findById: jest.fn().mockResolvedValue(mockCategory),
      findByIdAndUpdate: jest.fn().mockResolvedValue(mockCategory),
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockCategory]),
      }),
    };

    mockCacheService = {
      clearAllCategoriesCache: jest.fn().mockResolvedValue(undefined),
      deleteCachedCategory: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreCategoriesHierarchyService,
        { provide: getModelToken(StoreCategory.name), useValue: mockModel },
        { provide: StoreCategoryCacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<StoreCategoriesHierarchyService>(
      StoreCategoriesHierarchyService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateHierarchy', () => {
    it('should pass for root category at level 0', async () => {
      await expect(service.validateHierarchy(null, 0)).resolves.not.toThrow();
    });

    it('should throw BadRequestException for root at non-zero level', async () => {
      await expect(service.validateHierarchy(null, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid parent id', async () => {
      await expect(service.validateHierarchy('invalid', 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if parent not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(
        service.validateHierarchy(generateObjectId(), 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for nested subcategory', async () => {
      mockModel.findById.mockResolvedValue({ ...mockCategory, level: 1 });

      await expect(
        service.validateHierarchy(generateObjectId(), 2),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getParentChain', () => {
    it('should return parent chain', async () => {
      mockModel.findById.mockResolvedValueOnce({
        ...mockCategory,
        parentCategory: null,
      });

      const result = await service.getParentChain(mockCategory._id);

      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.getParentChain('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('moveCategory', () => {
    it('should move category to new parent', async () => {
      const newParentId = generateObjectId();
      mockModel.findById.mockResolvedValue({
        ...mockCategory,
        save: jest.fn().mockResolvedValue(mockCategory),
      });

      await service.moveCategory(mockCategory._id, newParentId);

      expect(mockCacheService.deleteCachedCategory).toHaveBeenCalled();
    });

    it('should move category to root', async () => {
      mockModel.findById.mockResolvedValue({
        ...mockCategory,
        save: jest.fn().mockResolvedValue(mockCategory),
      });

      await service.moveCategory(mockCategory._id, null);

      expect(mockCacheService.clearAllCategoriesCache).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.moveCategory('invalid', null)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(
        service.moveCategory(generateObjectId(), null),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if parent is self', async () => {
      mockModel.findById.mockResolvedValue({
        ...mockCategory,
        save: jest.fn(),
      });

      await expect(
        service.moveCategory(mockCategory._id, mockCategory._id),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reorderCategories', () => {
    it('should reorder categories', async () => {
      const ids = [generateObjectId(), generateObjectId()];

      await service.reorderCategories(ids);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledTimes(2);
      expect(mockCacheService.clearAllCategoriesCache).toHaveBeenCalled();
    });
  });

  describe('getCategoryTree', () => {
    it('should return category tree', async () => {
      const result = await service.getCategoryTree();

      expect(result).toEqual([mockCategory]);
    });
  });
});
