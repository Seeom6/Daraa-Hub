import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { StoreCategoriesCrudService } from './store-categories-crud.service';
import { StoreCategoryCacheService } from './store-category-cache.service';
import { StoreCategory } from '../../../../database/schemas/store-category.schema';
import { generateObjectId } from '../../testing';

describe('StoreCategoriesCrudService', () => {
  let service: StoreCategoriesCrudService;
  let mockModel: any;
  let mockCacheService: any;

  const mockCategory = {
    _id: generateObjectId(),
    name: 'Electronics',
    slug: 'electronics',
    level: 0,
    isDeleted: false,
    storeCount: 0,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    mockModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockCategory),
    }));
    mockModel.findOne = jest.fn().mockResolvedValue(null);
    mockModel.findById = jest.fn().mockResolvedValue(mockCategory);
    mockModel.countDocuments = jest.fn().mockResolvedValue(0);
    mockModel.findByIdAndDelete = jest.fn().mockResolvedValue(mockCategory);

    mockCacheService = {
      clearAllCategoriesCache: jest.fn().mockResolvedValue(undefined),
      deleteCachedCategory: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreCategoriesCrudService,
        { provide: getModelToken(StoreCategory.name), useValue: mockModel },
        { provide: StoreCategoryCacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<StoreCategoriesCrudService>(
      StoreCategoriesCrudService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a root category', async () => {
      const createDto = { name: 'Electronics', slug: 'electronics' };

      await service.create(createDto as any);

      expect(mockModel).toHaveBeenCalled();
    });

    it('should throw ConflictException if slug exists', async () => {
      mockModel.findOne.mockResolvedValue(mockCategory);

      await expect(
        service.create({ slug: 'electronics' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should create subcategory with parent', async () => {
      const parentId = generateObjectId();
      mockModel.findById.mockResolvedValue({ ...mockCategory, level: 0 });

      await service.create({
        name: 'Phones',
        slug: 'phones',
        parentCategory: parentId,
      } as any);

      expect(mockModel).toHaveBeenCalled();
    });

    it('should throw NotFoundException if parent not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(
        service.create({ parentCategory: generateObjectId() } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for nested subcategory', async () => {
      mockModel.findById.mockResolvedValue({ ...mockCategory, level: 1 });

      await expect(
        service.create({ parentCategory: generateObjectId() } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update category', async () => {
      mockModel.findById.mockResolvedValue({
        ...mockCategory,
        save: jest.fn().mockResolvedValue(mockCategory),
      });

      await service.update(mockCategory._id, { name: 'Updated' });

      expect(mockCacheService.deleteCachedCategory).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.update('invalid', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(service.update(generateObjectId(), {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if slug exists', async () => {
      mockModel.findById.mockResolvedValue({
        ...mockCategory,
        slug: 'old-slug',
        save: jest.fn(),
      });
      mockModel.findOne.mockResolvedValue({ _id: 'other' });

      await expect(
        service.update(mockCategory._id, { slug: 'new-slug' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if parent is self', async () => {
      mockModel.findById.mockResolvedValue({
        ...mockCategory,
        save: jest.fn(),
      });

      await expect(
        service.update(mockCategory._id, { parentCategory: mockCategory._id }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should soft delete category', async () => {
      mockModel.findOne.mockResolvedValue({
        ...mockCategory,
        save: jest.fn().mockResolvedValue(true),
      });

      await service.delete(mockCategory._id);

      expect(mockCacheService.deleteCachedCategory).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.delete('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if not found', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(service.delete(generateObjectId())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if has subcategories', async () => {
      mockModel.findOne.mockResolvedValue(mockCategory);
      mockModel.countDocuments.mockResolvedValue(2);

      await expect(service.delete(mockCategory._id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('restore', () => {
    it('should restore deleted category', async () => {
      mockModel.findOne.mockResolvedValue({
        ...mockCategory,
        isDeleted: true,
        save: jest.fn().mockResolvedValue(mockCategory),
      });

      await service.restore(mockCategory._id);

      expect(mockModel.findOne).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.restore('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if not found', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(service.restore(generateObjectId())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('permanentDelete', () => {
    it('should permanently delete category', async () => {
      mockModel.findById.mockResolvedValue({ ...mockCategory, storeCount: 0 });

      await service.permanentDelete(mockCategory._id);

      expect(mockModel.findByIdAndDelete).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.permanentDelete('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(service.permanentDelete(generateObjectId())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if has stores', async () => {
      mockModel.findById.mockResolvedValue({ ...mockCategory, storeCount: 5 });

      await expect(service.permanentDelete(mockCategory._id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
