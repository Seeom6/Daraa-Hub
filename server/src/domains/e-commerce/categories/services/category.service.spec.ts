import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryRepository } from '../repositories/category.repository';
import { generateObjectId } from '../../../shared/testing';

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepository: jest.Mocked<CategoryRepository>;

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockCategoryRepository = {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    getModel: jest.fn().mockReturnValue(mockModel),
  };

  const categoryId = generateObjectId();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: CategoryRepository, useValue: mockCategoryRepository },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get(CategoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = { name: 'Electronics', slug: 'electronics' };

    it('should create category successfully', async () => {
      const createdCategory = { _id: categoryId, ...createDto, level: 0 };
      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.create.mockResolvedValue(createdCategory);

      const result = await service.create(createDto as any);

      expect(result).toEqual(createdCategory);
      expect(mockCategoryRepository.create).toHaveBeenCalled();
    });

    it('should throw if slug already exists', async () => {
      mockCategoryRepository.findOne.mockResolvedValue({ slug: 'electronics' });

      await expect(service.create(createDto as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should set correct level for subcategory', async () => {
      const parentId = generateObjectId();
      const parentCategory = { _id: parentId, level: 0 };
      const dtoWithParent = { ...createDto, parentCategory: parentId };

      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.findById.mockResolvedValue(parentCategory);
      mockCategoryRepository.create.mockResolvedValue({
        ...dtoWithParent,
        level: 1,
      });

      const result = await service.create(dtoWithParent as any);

      expect(result.level).toBe(1);
    });

    it('should throw if parent category not found', async () => {
      const dtoWithParent = {
        ...createDto,
        parentCategory: generateObjectId(),
      };
      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(service.create(dtoWithParent as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated categories', async () => {
      const categories = [{ _id: categoryId, name: 'Electronics' }];
      mockModel.exec.mockResolvedValue(categories);
      mockCategoryRepository.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 } as any);

      expect(result.data).toEqual(categories);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return category by id', async () => {
      const category = { _id: categoryId, name: 'Electronics' };
      mockModel.exec.mockResolvedValue(category);

      const result = await service.findOne(categoryId);

      expect(result).toEqual(category);
    });

    it('should throw if category not found', async () => {
      mockModel.exec.mockResolvedValue(null);

      await expect(service.findOne(categoryId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw for invalid id', async () => {
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should delete category', async () => {
      const category = {
        _id: categoryId,
        name: 'Electronics',
        productCount: 0,
      };
      mockCategoryRepository.findById.mockResolvedValue(category);
      mockCategoryRepository.count.mockResolvedValue(0);

      await service.remove(categoryId);

      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(categoryId);
    });

    it('should throw if category has subcategories', async () => {
      const category = { _id: categoryId, productCount: 0 };
      mockCategoryRepository.findById.mockResolvedValue(category);
      mockCategoryRepository.count.mockResolvedValue(2);

      await expect(service.remove(categoryId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if category has products', async () => {
      const category = { _id: categoryId, productCount: 5 };
      mockCategoryRepository.findById.mockResolvedValue(category);
      mockCategoryRepository.count.mockResolvedValue(0);

      await expect(service.remove(categoryId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('incrementProductCount', () => {
    it('should increment product count', async () => {
      await service.incrementProductCount(categoryId, 1);

      expect(mockCategoryRepository.findByIdAndUpdate).toHaveBeenCalledWith(
        categoryId,
        { $inc: { productCount: 1 } },
      );
    });
  });
});
