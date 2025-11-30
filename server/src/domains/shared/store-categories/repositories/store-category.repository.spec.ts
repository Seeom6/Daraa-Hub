import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { StoreCategoryRepository } from './store-category.repository';
import { StoreCategory } from '../../../../database/schemas/store-category.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('StoreCategoryRepository', () => {
  let repository: StoreCategoryRepository;
  let mockModel: any;

  const categoryId = generateObjectId();
  const parentId = generateObjectId();

  const mockCategory = {
    _id: categoryId,
    name: 'Electronics',
    slug: 'electronics',
    isActive: true,
    order: 1,
    parentId: null,
    toObject: () => ({
      _id: categoryId,
      name: 'Electronics',
      slug: 'electronics',
      isActive: true,
    }),
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockCategory]);
    mockModel.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockCategory) });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreCategoryRepository,
        { provide: getModelToken(StoreCategory.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<StoreCategoryRepository>(StoreCategoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findBySlug', () => {
    it('should find category by slug', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategory),
      });

      const result = await repository.findBySlug('electronics');

      expect(result).toEqual(mockCategory);
    });
  });

  describe('findActiveCategories', () => {
    it('should find active categories', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockCategory]),
      });

      const result = await repository.findActiveCategories();

      expect(result).toEqual([mockCategory]);
    });
  });

  describe('findByParentId', () => {
    it('should find categories by parent ID', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockCategory]),
      });

      const result = await repository.findByParentId(parentId);

      expect(result).toEqual([mockCategory]);
    });
  });

  describe('getCategoryTree', () => {
    it('should return category tree', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockCategory]),
      });

      const result = await repository.getCategoryTree();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('updateOrder', () => {
    it('should update category order', async () => {
      const result = await repository.updateOrder(categoryId, 2);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('toggleActive', () => {
    it('should toggle category active status', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategory),
      });

      const result = await repository.toggleActive(categoryId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should return null if category not found', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.toggleActive(categoryId);

      expect(result).toBeNull();
    });
  });
});
