import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductQueryService } from './product-query.service';
import { ProductRepository } from '../repositories/product.repository';
import { ProductValidationService } from './product-validation.service';
import { generateObjectId } from '../../../shared/testing';
import { FakerDataFactory } from '../../../shared/testing/mock-data.factory';

describe('ProductQueryService', () => {
  let service: ProductQueryService;
  let productRepository: jest.Mocked<ProductRepository>;
  let validationService: jest.Mocked<ProductValidationService>;

  const mockProductRepository = {
    getModel: jest.fn(),
    count: jest.fn(),
    findBySlug: jest.fn(),
  };

  const mockValidationService = {
    validateObjectId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductQueryService,
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: ProductValidationService, useValue: mockValidationService },
      ],
    }).compile();

    service = module.get<ProductQueryService>(ProductQueryService);
    productRepository = module.get(ProductRepository);
    validationService = module.get(ProductValidationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts = FakerDataFactory.createMany(
        () => FakerDataFactory.createProduct(),
        5,
      );

      mockProductRepository.getModel.mockReturnValue({
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockProducts),
                  }),
                }),
              }),
            }),
          }),
        }),
      });
      mockProductRepository.count.mockResolvedValue(5);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should filter by search term', async () => {
      const mockProducts = [FakerDataFactory.createProduct({ name: 'iPhone' })];

      mockProductRepository.getModel.mockReturnValue({
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockProducts),
                  }),
                }),
              }),
            }),
          }),
        }),
      });
      mockProductRepository.count.mockResolvedValue(1);

      const result = await service.findAll({ search: 'iPhone' });

      expect(result.data).toHaveLength(1);
    });

    it('should filter by store id', async () => {
      const storeId = generateObjectId();
      const mockProducts = [FakerDataFactory.createProduct({ storeId })];

      mockProductRepository.getModel.mockReturnValue({
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                  populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockProducts),
                  }),
                }),
              }),
            }),
          }),
        }),
      });
      mockProductRepository.count.mockResolvedValue(1);

      const result = await service.findAll({ storeId });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const productId = generateObjectId();
      const mockProduct = FakerDataFactory.createProduct({ _id: productId });

      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockProductRepository.getModel.mockReturnValue({
        findById: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockProduct),
              }),
            }),
          }),
        }),
        findByIdAndUpdate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProduct),
        }),
      });

      const result = await service.findOne(productId);

      expect(result).toEqual(mockProduct);
      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        productId,
        'product ID',
      );
    });

    it('should throw NotFoundException when product not found', async () => {
      const productId = generateObjectId();

      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockProductRepository.getModel.mockReturnValue({
        findById: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
              }),
            }),
          }),
        }),
      });

      await expect(service.findOne(productId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return a product by slug', async () => {
      const mockProduct = FakerDataFactory.createProduct({
        slug: 'test-product',
      });

      mockProductRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockProduct),
              }),
            }),
          }),
        }),
        findByIdAndUpdate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProduct),
        }),
      });

      const result = await service.findBySlug('test-product');

      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductRepository.getModel.mockReturnValue({
        findOne: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
              }),
            }),
          }),
        }),
      });

      await expect(service.findBySlug('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
