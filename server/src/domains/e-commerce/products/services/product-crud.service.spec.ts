import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductCrudService } from './product-crud.service';
import { ProductRepository } from '../repositories/product.repository';
import { ProductSubscriptionService } from './product-subscription.service';
import { ProductValidationService } from './product-validation.service';
import {
  generateObjectId,
  createMockEventEmitter,
} from '../../../shared/testing';
import { FakerDataFactory } from '../../../shared/testing/mock-data.factory';

describe('ProductCrudService', () => {
  let service: ProductCrudService;
  let productRepository: jest.Mocked<ProductRepository>;
  let subscriptionService: jest.Mocked<ProductSubscriptionService>;
  let validationService: jest.Mocked<ProductValidationService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockProductRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getModel: jest.fn(),
  };

  const mockSubscriptionService = {
    checkSubscriptionLimits: jest.fn(),
    incrementDailyUsage: jest.fn(),
  };

  const mockValidationService = {
    validateSlugUniqueness: jest.fn(),
    validateSkuUniqueness: jest.fn(),
    validateCategory: jest.fn(),
    validateObjectId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCrudService,
        { provide: ProductRepository, useValue: mockProductRepository },
        {
          provide: ProductSubscriptionService,
          useValue: mockSubscriptionService,
        },
        { provide: ProductValidationService, useValue: mockValidationService },
        { provide: EventEmitter2, useValue: createMockEventEmitter() },
      ],
    }).compile();

    service = module.get<ProductCrudService>(ProductCrudService);
    productRepository = module.get(ProductRepository);
    subscriptionService = module.get(ProductSubscriptionService);
    validationService = module.get(ProductValidationService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const storeId = generateObjectId();
      const userId = generateObjectId();
      const createDto = {
        name: 'Test Product',
        slug: 'test-product',
        storeId,
        price: 100,
        description: 'Test description',
      };

      const mockProduct = {
        ...FakerDataFactory.createProduct(createDto),
        save: jest
          .fn()
          .mockResolvedValue(FakerDataFactory.createProduct(createDto)),
      };

      mockSubscriptionService.checkSubscriptionLimits.mockResolvedValue(
        undefined,
      );
      mockValidationService.validateSlugUniqueness.mockResolvedValue(undefined);
      mockProductRepository.create.mockResolvedValue(mockProduct);

      const result = await service.create(createDto as any, userId);

      expect(
        mockSubscriptionService.checkSubscriptionLimits,
      ).toHaveBeenCalledWith(storeId, 0);
      expect(mockValidationService.validateSlugUniqueness).toHaveBeenCalledWith(
        'test-product',
      );
      expect(mockProductRepository.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should validate SKU uniqueness when provided', async () => {
      const storeId = generateObjectId();
      const userId = generateObjectId();
      const createDto = {
        name: 'Test Product',
        slug: 'test-product',
        storeId,
        price: 100,
        sku: 'TEST-SKU-001',
      };

      const mockProduct = {
        ...FakerDataFactory.createProduct(createDto),
        save: jest
          .fn()
          .mockResolvedValue(FakerDataFactory.createProduct(createDto)),
      };

      mockSubscriptionService.checkSubscriptionLimits.mockResolvedValue(
        undefined,
      );
      mockValidationService.validateSlugUniqueness.mockResolvedValue(undefined);
      mockValidationService.validateSkuUniqueness.mockResolvedValue(undefined);
      mockProductRepository.create.mockResolvedValue(mockProduct);

      await service.create(createDto as any, userId);

      expect(mockValidationService.validateSkuUniqueness).toHaveBeenCalledWith(
        'TEST-SKU-001',
      );
    });

    it('should validate category when provided', async () => {
      const storeId = generateObjectId();
      const categoryId = generateObjectId();
      const userId = generateObjectId();
      const createDto = {
        name: 'Test Product',
        slug: 'test-product',
        storeId,
        categoryId,
        price: 100,
      };

      const mockProduct = {
        ...FakerDataFactory.createProduct(createDto),
        save: jest
          .fn()
          .mockResolvedValue(FakerDataFactory.createProduct(createDto)),
      };

      mockSubscriptionService.checkSubscriptionLimits.mockResolvedValue(
        undefined,
      );
      mockValidationService.validateSlugUniqueness.mockResolvedValue(undefined);
      mockValidationService.validateCategory.mockResolvedValue(undefined);
      mockProductRepository.create.mockResolvedValue(mockProduct);

      await service.create(createDto as any, userId);

      expect(mockValidationService.validateCategory).toHaveBeenCalledWith(
        categoryId,
      );
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const productId = generateObjectId();
      const userId = generateObjectId();
      const updateDto = { name: 'Updated Product' };

      const mockProduct = {
        ...FakerDataFactory.createProduct({ _id: productId }),
        save: jest
          .fn()
          .mockResolvedValue(
            FakerDataFactory.createProduct({ name: 'Updated Product' }),
          ),
      };

      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockProductRepository.getModel.mockReturnValue({
        findById: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProduct),
        }),
      });

      const result = await service.update(productId, updateDto as any, userId);

      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        productId,
        'product ID',
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when product not found', async () => {
      const productId = generateObjectId();
      const userId = generateObjectId();

      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockProductRepository.getModel.mockReturnValue({
        findById: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(
        service.update(productId, {} as any, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a product successfully', async () => {
      const productId = generateObjectId();
      const userId = generateObjectId();
      const mockProduct = FakerDataFactory.createProduct({ _id: productId });

      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockProductRepository.getModel.mockReturnValue({
        findById: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProduct),
        }),
        findByIdAndDelete: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProduct),
        }),
      });

      await service.remove(productId, userId);

      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        productId,
        'product ID',
      );
    });

    it('should throw NotFoundException when product not found', async () => {
      const productId = generateObjectId();
      const userId = generateObjectId();

      mockValidationService.validateObjectId.mockReturnValue(undefined);
      mockProductRepository.getModel.mockReturnValue({
        findById: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.remove(productId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
