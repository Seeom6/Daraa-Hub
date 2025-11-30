import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StoreCategoriesQueryService } from './store-categories-query.service';
import { StoreCategoryCacheService } from './store-category-cache.service';
import { StoreCategory } from '../../../../database/schemas/store-category.schema';
import { generateObjectId } from '../../testing';

describe('StoreCategoriesQueryService', () => {
  let service: StoreCategoriesQueryService;
  let mockModel: any;
  let mockCacheService: any;

  const mockCategory = {
    _id: generateObjectId(),
    name: 'Electronics',
    slug: 'electronics',
    level: 0,
    isActive: true,
    isDeleted: false,
  };

  beforeEach(async () => {
    mockModel = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockCategory]),
      }),
      findOne: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCategory),
      }),
      findById: jest.fn().mockResolvedValue(mockCategory),
    };

    mockCacheService = {
      getCachedCategory: jest.fn().mockResolvedValue(null),
      cacheCategory: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreCategoriesQueryService,
        { provide: getModelToken(StoreCategory.name), useValue: mockModel },
        { provide: StoreCategoryCacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<StoreCategoriesQueryService>(
      StoreCategoriesQueryService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockCategory]);
    });

    it('should filter by parentCategory', async () => {
      await service.findAll({ parentCategory: 'null' });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should filter by level', async () => {
      await service.findAll({ level: 0 });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should filter by isActive', async () => {
      await service.findAll({ isActive: true });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should include subcategories', async () => {
      await service.findAll({ includeSubcategories: true });

      expect(mockModel.find().populate).toHaveBeenCalled();
    });
  });

  describe('findRootCategories', () => {
    it('should return root categories', async () => {
      const result = await service.findRootCategories();

      expect(result).toEqual([mockCategory]);
    });

    it('should include subcategories', async () => {
      await service.findRootCategories(true);

      expect(mockModel.find().populate).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return category by id', async () => {
      const result = await service.findById(mockCategory._id);

      expect(result).toEqual(mockCategory);
    });

    it('should return cached category', async () => {
      mockCacheService.getCachedCategory.mockResolvedValue(mockCategory);

      const result = await service.findById(mockCategory._id);

      expect(result).toEqual(mockCategory);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findById('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if not found', async () => {
      mockModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById(generateObjectId())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return category by slug', async () => {
      const result = await service.findBySlug('electronics');

      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if not found', async () => {
      mockModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findBySlug('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findSubcategories', () => {
    it('should return subcategories', async () => {
      const result = await service.findSubcategories(mockCategory._id);

      expect(result).toEqual([mockCategory]);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findSubcategories('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if parent not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(
        service.findSubcategories(generateObjectId()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should search categories', async () => {
      const result = await service.search('electronics');

      expect(result).toEqual([mockCategory]);
    });
  });
});
