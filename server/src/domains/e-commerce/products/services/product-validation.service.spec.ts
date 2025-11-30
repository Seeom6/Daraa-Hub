import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductValidationService } from './product-validation.service';
import { ProductRepository } from '../repositories/product.repository';
import { CategoryService } from '../../categories/services/category.service';

describe('ProductValidationService', () => {
  let service: ProductValidationService;
  let productRepository: jest.Mocked<ProductRepository>;
  let categoryService: jest.Mocked<CategoryService>;

  const mockProduct = {
    _id: new Types.ObjectId(),
    name: 'Test Product',
    slug: 'test-product',
    sku: 'TEST-SKU-001',
    storeId: new Types.ObjectId(),
  };

  const mockProductModel = {
    findById: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductValidationService,
        {
          provide: ProductRepository,
          useValue: {
            findOne: jest.fn(),
            getModel: jest.fn().mockReturnValue(mockProductModel),
          },
        },
        {
          provide: CategoryService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductValidationService>(ProductValidationService);
    productRepository = module.get(ProductRepository);
    categoryService = module.get(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateObjectId', () => {
    it('should not throw for valid ObjectId', () => {
      expect(() =>
        service.validateObjectId(new Types.ObjectId().toString()),
      ).not.toThrow();
    });

    it('should throw BadRequestException for invalid ObjectId', () => {
      expect(() => service.validateObjectId('invalid')).toThrow(
        BadRequestException,
      );
    });

    it('should use custom field name in error message', () => {
      expect(() => service.validateObjectId('invalid', 'product ID')).toThrow(
        'Invalid product ID',
      );
    });
  });

  describe('validateSlugUniqueness', () => {
    it('should not throw when slug is unique', async () => {
      (productRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.validateSlugUniqueness('unique-slug'),
      ).resolves.not.toThrow();
    });

    it('should throw ConflictException when slug exists', async () => {
      (productRepository.findOne as jest.Mock).mockResolvedValue(mockProduct);

      await expect(
        service.validateSlugUniqueness('test-product'),
      ).rejects.toThrow(ConflictException);
    });

    it('should not throw when slug exists but belongs to same product', async () => {
      (productRepository.findOne as jest.Mock).mockResolvedValue(mockProduct);

      await expect(
        service.validateSlugUniqueness(
          'test-product',
          mockProduct._id.toString(),
        ),
      ).resolves.not.toThrow();
    });

    it('should throw when slug exists and belongs to different product', async () => {
      (productRepository.findOne as jest.Mock).mockResolvedValue(mockProduct);

      await expect(
        service.validateSlugUniqueness(
          'test-product',
          new Types.ObjectId().toString(),
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('validateSkuUniqueness', () => {
    it('should not throw when SKU is unique', async () => {
      (productRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.validateSkuUniqueness('UNIQUE-SKU'),
      ).resolves.not.toThrow();
    });

    it('should throw ConflictException when SKU exists', async () => {
      (productRepository.findOne as jest.Mock).mockResolvedValue(mockProduct);

      await expect(
        service.validateSkuUniqueness('TEST-SKU-001'),
      ).rejects.toThrow(ConflictException);
    });

    it('should not throw when SKU exists but belongs to same product', async () => {
      (productRepository.findOne as jest.Mock).mockResolvedValue(mockProduct);

      await expect(
        service.validateSkuUniqueness(
          'TEST-SKU-001',
          mockProduct._id.toString(),
        ),
      ).resolves.not.toThrow();
    });
  });

  describe('validateCategory', () => {
    it('should call categoryService.findOne', async () => {
      const categoryId = new Types.ObjectId().toString();
      (categoryService.findOne as jest.Mock).mockResolvedValue({
        _id: categoryId,
      });

      await service.validateCategory(categoryId);

      expect(categoryService.findOne).toHaveBeenCalledWith(categoryId);
    });
  });

  describe('validateProductExists', () => {
    it('should not throw when product exists', async () => {
      mockProductModel.exec.mockResolvedValue(mockProduct);

      await expect(
        service.validateProductExists(mockProduct._id.toString()),
      ).resolves.not.toThrow();
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.validateProductExists('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductModel.exec.mockResolvedValue(null);

      await expect(
        service.validateProductExists(new Types.ObjectId().toString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyOwnership', () => {
    it('should return true when store owns product', async () => {
      mockProductModel.exec.mockResolvedValue(mockProduct);

      const result = await service.verifyOwnership(
        mockProduct._id.toString(),
        mockProduct.storeId.toString(),
      );

      expect(result).toBe(true);
    });

    it('should return false when store does not own product', async () => {
      mockProductModel.exec.mockResolvedValue(mockProduct);

      const result = await service.verifyOwnership(
        mockProduct._id.toString(),
        new Types.ObjectId().toString(),
      );

      expect(result).toBe(false);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductModel.exec.mockResolvedValue(null);

      await expect(
        service.verifyOwnership(
          new Types.ObjectId().toString(),
          new Types.ObjectId().toString(),
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
