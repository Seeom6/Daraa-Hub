import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductRepository } from './product.repository';
import {
  Product,
  ProductDocument,
} from '../../../../database/schemas/product.schema';
import { MockModelFactory, generateObjectId } from '../../../shared/testing';
import { FakerDataFactory } from '../../../shared/testing/mock-data.factory';

describe('ProductRepository', () => {
  let repository: ProductRepository;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = MockModelFactory.create();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        {
          provide: getModelToken(Product.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<ProductRepository>(ProductRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByStoreId', () => {
    it('should find products by store id', async () => {
      const storeId = generateObjectId();
      const mockProducts = FakerDataFactory.createMany(
        () => FakerDataFactory.createProduct({ storeId }),
        3,
      );

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProducts),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      });

      const result = await repository.findByStoreId(storeId);

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should filter by status when provided', async () => {
      const storeId = generateObjectId();
      const mockProducts = [
        FakerDataFactory.createProduct({ storeId, status: 'active' }),
      ];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProducts),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByStoreId(storeId, {
        status: 'active',
      });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findBySlug', () => {
    it('should find product by slug', async () => {
      const mockProduct = FakerDataFactory.createProduct({
        slug: 'test-product',
      });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      });

      const result = await repository.findBySlug('test-product');

      expect(mockModel.findOne).toHaveBeenCalledWith(
        { slug: 'test-product' },
        null,
        undefined,
      );
      expect(result).toEqual(mockProduct);
    });

    it('should return null if slug not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findBySku', () => {
    it('should find product by SKU', async () => {
      const mockProduct = FakerDataFactory.createProduct({
        sku: 'TEST-SKU-123',
      });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      });

      const result = await repository.findBySku('TEST-SKU-123');

      expect(mockModel.findOne).toHaveBeenCalledWith(
        { sku: 'TEST-SKU-123' },
        null,
        undefined,
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findByCategoryId', () => {
    it('should find products by category id', async () => {
      const categoryId = generateObjectId();
      const mockProducts = FakerDataFactory.createMany(
        () => FakerDataFactory.createProduct({ categoryId }),
        5,
      );

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProducts),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await repository.findByCategoryId(categoryId);

      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(5);
    });
  });

  describe('search', () => {
    it('should search products by name or description', async () => {
      const mockProducts = [
        FakerDataFactory.createProduct({ name: 'Test Product' }),
      ];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProducts),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.search('Test');

      expect(result.data).toHaveLength(1);
    });
  });

  describe('updateStatus', () => {
    it('should update product status', async () => {
      const productId = generateObjectId();
      const mockProduct = FakerDataFactory.createProduct({
        _id: productId,
        status: 'inactive',
      });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      });

      const result = await repository.updateStatus(productId, 'inactive');

      expect(result?.status).toBe('inactive');
    });
  });

  describe('incrementViews', () => {
    it('should increment product views', async () => {
      const productId = generateObjectId();
      mockModel.findByIdAndUpdate.mockResolvedValue({});

      await repository.incrementViews(productId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(productId, {
        $inc: { views: 1 },
      });
    });
  });

  describe('getFeaturedProducts', () => {
    it('should get featured products', async () => {
      const mockProducts = FakerDataFactory.createMany(
        () => FakerDataFactory.createProduct({ isFeatured: true }),
        5,
      );
      mockModel.find.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockProducts),
          }),
        }),
      });

      const result = await repository.getFeaturedProducts(5);

      expect(result).toHaveLength(5);
    });
  });

  describe('getTrendingProducts', () => {
    it('should get trending products sorted by views', async () => {
      const mockProducts = FakerDataFactory.createMany(
        () => FakerDataFactory.createProduct(),
        10,
      );
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockProducts),
          }),
        }),
      });

      const result = await repository.getTrendingProducts(10);

      expect(result).toHaveLength(10);
    });
  });

  describe('getLowStockProducts', () => {
    it('should get products with low stock', async () => {
      const storeId = generateObjectId();
      const mockProducts = [FakerDataFactory.createProduct({ stock: 5 })];
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProducts),
      });

      const result = await repository.getLowStockProducts(storeId, 10);

      expect(result).toHaveLength(1);
    });
  });
});
