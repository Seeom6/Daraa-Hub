import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CategoryRepository } from './category.repository';
import { Category } from '../../../../database/schemas/category.schema';
import { MockModelFactory, generateObjectId } from '../../../shared/testing';
import { FakerDataFactory } from '../../../shared/testing/mock-data.factory';

describe('CategoryRepository', () => {
  let repository: CategoryRepository;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = MockModelFactory.create();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryRepository,
        {
          provide: getModelToken(Category.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<CategoryRepository>(CategoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findBySlug', () => {
    it('should find category by slug', async () => {
      const mockCategory = FakerDataFactory.createCategory({
        slug: 'electronics',
      });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategory),
      });

      const result = await repository.findBySlug('electronics');

      expect(mockModel.findOne).toHaveBeenCalledWith(
        { slug: 'electronics' },
        null,
        undefined,
      );
      expect(result).toEqual(mockCategory);
    });

    it('should return null if slug not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findRootCategories', () => {
    it('should find root categories without parent', async () => {
      const mockCategories = FakerDataFactory.createMany(
        () => FakerDataFactory.createCategory({ parentId: null }),
        3,
      );
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCategories),
        }),
      });

      const result = await repository.findRootCategories();

      expect(result).toHaveLength(3);
      expect(mockModel.find).toHaveBeenCalledWith({
        parentCategory: null,
        isActive: true,
      });
    });
  });

  describe('findByParentId', () => {
    it('should find subcategories by parent id', async () => {
      const parentId = generateObjectId();
      const mockCategories = FakerDataFactory.createMany(
        () => FakerDataFactory.createCategory({ parentId }),
        2,
      );
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCategories),
        }),
      });

      const result = await repository.findByParentId(parentId);

      expect(result).toHaveLength(2);
    });
  });

  describe('getCategoryTree', () => {
    it('should get category tree structure', async () => {
      const parentCategory = FakerDataFactory.createCategory({
        parentId: null,
      });
      const childCategory = FakerDataFactory.createCategory({
        parentCategory: parentCategory._id,
      });

      const mockCategories = [
        { ...parentCategory, toObject: () => parentCategory },
        { ...childCategory, toObject: () => childCategory },
      ];

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCategories),
        }),
      });

      const result = await repository.getCategoryTree();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('updateOrder', () => {
    it('should update category order', async () => {
      const categoryId = generateObjectId();
      const mockCategory = FakerDataFactory.createCategory({
        _id: categoryId,
        order: 5,
      });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategory),
      });

      const result = await repository.updateOrder(categoryId, 5);

      expect(result?.order).toBe(5);
    });
  });
});
